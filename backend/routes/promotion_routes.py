import re
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from datetime import datetime
from extensions import db
from models.promotion import Promotion, PromotionFreeItem, PromoCode
from models.product import Product
from middleware.role import role_required

promotion_bp = Blueprint("promotion", __name__)
MENU_ROLES = ["ADMIN", "SHOP_MANAGER", "SALES_AGENT"]
PROMOTION_TYPES = {"DISCOUNT", "FREE_ITEM", "FLAT_OFFER"}


def _parse_date(value):
    if not value:
        return None

    raw = str(value).strip().replace("Z", "+00:00")

    # Normalize common frontend form input such as 2026-8-31.
    match = re.match(
        r"^(\d{4})-(\d{1,2})-(\d{1,2})(.*)$",
        raw,
    )
    if match:
        year, month, day, suffix = match.groups()
        raw = f"{year}-{int(month):02d}-{int(day):02d}{suffix}"

    try:
        return datetime.fromisoformat(raw).replace(tzinfo=None)
    except ValueError:
        pass

    for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%d"):
        try:
            return datetime.strptime(raw, fmt)
        except ValueError:
            continue

    raise ValueError(
        "Invalid expiry date. Use YYYY-MM-DD or a valid ISO datetime."
    )


def _validate_promotion_payload(data):
    name = str(data.get("name") or data.get("title") or "").strip()
    if not name:
        raise ValueError("Promotion title is required")
    try:
        product_id = int(data.get("product_id"))
    except (TypeError, ValueError):
        raise ValueError("Select the product this promotion applies to")
    product = Product.query.get(product_id)
    if not product:
        raise ValueError("Selected product was not found")
    promotion_type = str(data.get("promotion_type") or "DISCOUNT").strip().upper()
    if promotion_type not in PROMOTION_TYPES:
        raise ValueError("promotion_type must be DISCOUNT, FREE_ITEM or FLAT_OFFER")

    discount_type = None
    discount_value = None
    if promotion_type == "DISCOUNT":
        discount_type = str(data.get("discount_type") or "PERCENT").strip().upper()
        if discount_type not in {"PERCENT", "PERCENTAGE"}:
            raise ValueError("Discount promotion must use percentage discount")
        discount_type = "PERCENT"
        discount_value = float(data.get("discount_value") or 0)
        if discount_value <= 0 or discount_value > 100:
            raise ValueError("Discount percentage must be between 0 and 100")
    elif promotion_type == "FLAT_OFFER":
        discount_type = "FLAT"
        discount_value = float(data.get("discount_value") or 0)
        if discount_value <= 0:
            raise ValueError("Flat offer amount must be greater than 0")

    free_items = data.get("free_items") or []
    if promotion_type == "FREE_ITEM" and not free_items:
        fallback = data.get("free_item_product_id")
        if fallback:
            free_items = [{"product_id": fallback, "quantity": data.get("free_item_quantity", 1)}]
    if promotion_type == "FREE_ITEM" and not free_items:
        raise ValueError("Select at least one free product")

    return {
        "name": name,
        "product_id": product_id,
        "promotion_type": promotion_type,
        "discount_type": discount_type,
        "discount_value": discount_value,
        "free_items": free_items,
    }


def _replace_free_items(promo, rows):
    PromotionFreeItem.query.filter_by(promotion_id=promo.id).delete()
    for row in rows or []:
        try:
            product_id = int(row.get("product_id") if isinstance(row, dict) else row)
            quantity = max(int((row.get("quantity", 1) if isinstance(row, dict) else 1) or 1), 1)
        except (TypeError, ValueError):
            continue
        if not Product.query.get(product_id):
            raise ValueError(f"Free product {product_id} was not found")
        db.session.add(PromotionFreeItem(promotion_id=promo.id, product_id=product_id, quantity=quantity))


@promotion_bp.route("/promotions", methods=["GET"])
@jwt_required()
def get_promotions():
    promos = Promotion.query.order_by(Promotion.created_at.desc()).all()
    return jsonify({"promotions": [p.to_dict() for p in promos]}), 200


@promotion_bp.route("/promotions/active", methods=["GET"])
def get_active_promotions():
    now = datetime.utcnow()
    promos = Promotion.query.filter_by(is_active=True).all()
    promos = [p for p in promos if (not p.start_date or p.start_date <= now) and (not p.end_date or p.end_date >= now)]
    return jsonify({"promotions": [p.to_dict() for p in promos]}), 200


@promotion_bp.route("/promotions", methods=["POST"])
@jwt_required()
@role_required(MENU_ROLES)
def create_promotion():
    data = request.get_json(silent=True) or {}
    try:
        valid = _validate_promotion_payload(data)
        promo = Promotion(
            name=valid["name"],
            description=data.get("description"),
            product_id=valid["product_id"],
            promotion_type=valid["promotion_type"],
            discount_type=valid["discount_type"],
            discount_value=valid["discount_value"],
            start_date=_parse_date(data.get("start_date")),
            end_date=_parse_date(data.get("end_date")),
            is_active=bool(data.get("is_active", True)),
        )
        db.session.add(promo)
        db.session.flush()
        if valid["promotion_type"] == "FREE_ITEM":
            _replace_free_items(promo, valid["free_items"])
        db.session.commit()
    except (ValueError, TypeError) as exc:
        db.session.rollback()
        return jsonify({"error": str(exc)}), 400
    return jsonify({"message": "Promotion created", "promotion": promo.to_dict()}), 201


@promotion_bp.route("/promotions/<int:promo_id>", methods=["PUT"])
@jwt_required()
@role_required(MENU_ROLES)
def update_promotion(promo_id):
    promo = Promotion.query.get_or_404(promo_id)
    data = request.get_json(silent=True) or {}
    merged = {
        "name": data.get("name", promo.name),
        "product_id": data.get("product_id", promo.product_id),
        "promotion_type": data.get("promotion_type", promo.promotion_type),
        "discount_type": data.get("discount_type", promo.discount_type),
        "discount_value": data.get("discount_value", promo.discount_value),
        "free_items": data.get("free_items", [fi.to_dict() for fi in promo.free_items]),
    }
    try:
        valid = _validate_promotion_payload(merged)
        promo.name = valid["name"]
        promo.description = data.get("description", promo.description)
        promo.product_id = valid["product_id"]
        promo.promotion_type = valid["promotion_type"]
        promo.discount_type = valid["discount_type"]
        promo.discount_value = valid["discount_value"]
        if "start_date" in data:
            promo.start_date = _parse_date(data.get("start_date"))
        if "end_date" in data:
            promo.end_date = _parse_date(data.get("end_date"))
        if "is_active" in data:
            promo.is_active = bool(data.get("is_active"))
        if promo.promotion_type == "FREE_ITEM":
            _replace_free_items(promo, valid["free_items"])
        else:
            PromotionFreeItem.query.filter_by(promotion_id=promo.id).delete()
        db.session.commit()
    except (ValueError, TypeError) as exc:
        db.session.rollback()
        return jsonify({"error": str(exc)}), 400
    return jsonify({"message": "Promotion updated", "promotion": promo.to_dict()}), 200


@promotion_bp.route("/promotions/<int:promo_id>", methods=["DELETE"])
@jwt_required()
@role_required(MENU_ROLES)
def delete_promotion(promo_id):
    promo = Promotion.query.get_or_404(promo_id)
    db.session.delete(promo)
    db.session.commit()
    return jsonify({"message": "Promotion deleted"}), 200


@promotion_bp.route("/promotions/<int:promo_id>/activate", methods=["POST"])
@jwt_required()
@role_required(MENU_ROLES)
def activate_promotion(promo_id):
    promo = Promotion.query.get_or_404(promo_id)
    promo.is_active = True
    db.session.commit()
    return jsonify({"message": "Promotion activated", "promotion": promo.to_dict()}), 200


@promotion_bp.route("/promotions/<int:promo_id>/deactivate", methods=["POST"])
@jwt_required()
@role_required(MENU_ROLES)
def deactivate_promotion(promo_id):
    promo = Promotion.query.get_or_404(promo_id)
    promo.is_active = False
    db.session.commit()
    return jsonify({"message": "Promotion deactivated", "promotion": promo.to_dict()}), 200


@promotion_bp.route("/promotions/<int:promo_id>/add-free-item", methods=["POST"])
@jwt_required()
@role_required(MENU_ROLES)
def add_free_item(promo_id):
    promo = Promotion.query.get_or_404(promo_id)
    data = request.get_json(silent=True) or {}
    item = PromotionFreeItem(promotion_id=promo.id, product_id=data["product_id"], quantity=max(int(data.get("quantity", 1)), 1))
    db.session.add(item)
    db.session.commit()
    return jsonify({"message": "Free item added", "item": item.to_dict()}), 201


@promotion_bp.route("/promotions/<int:promo_id>/remove-free-item", methods=["DELETE"])
@jwt_required()
@role_required(MENU_ROLES)
def remove_free_item(promo_id):
    data = request.get_json(silent=True) or {}
    item = PromotionFreeItem.query.filter_by(promotion_id=promo_id, product_id=data["product_id"]).first_or_404()
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Free item removed"}), 200


@promotion_bp.route("/promotions/<int:promo_id>/free-items", methods=["GET"])
def get_free_items(promo_id):
    items = PromotionFreeItem.query.filter_by(promotion_id=promo_id).all()
    return jsonify({"free_items": [i.to_dict() for i in items]}), 200


@promotion_bp.route("/promos", methods=["GET"])
@jwt_required()
@role_required(MENU_ROLES)
def get_promos():
    promos = PromoCode.query.all()
    return jsonify({"promos": [p.to_dict() for p in promos]}), 200

@promotion_bp.route("/promos/active", methods=["GET"])
def get_active_promos():
    promos = PromoCode.query.filter_by(is_active=True).all()
    return jsonify({"promos": [p.to_dict() for p in promos]}), 200

@promotion_bp.route("/promos", methods=["POST"])
@jwt_required()
@role_required(MENU_ROLES)
def create_promo():
    data = request.get_json(silent=True) or {}
    code = str(data.get("code") or "").strip().upper()
    if not code:
        return jsonify({"error": "Promo code is required"}), 400
    if PromoCode.query.filter_by(code=code).first():
        return jsonify({"error": "Promo code already exists"}), 400
    discount_type = str(data.get("discount_type") or "PERCENT").upper()
    if discount_type not in {"PERCENT", "FLAT"}:
        return jsonify({"error": "discount_type must be PERCENT or FLAT"}), 400
    discount_value = float(data.get("discount_value") or 0)
    if discount_value <= 0 or (discount_type == "PERCENT" and discount_value > 100):
        return jsonify({"error": "Enter a valid discount value"}), 400
    try:
        expires_at = _parse_date(data.get("expires_at"))
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    promo = PromoCode(code=code, discount_type=discount_type, discount_value=discount_value, min_order_value=data.get("min_order_value", 0), max_uses=data.get("max_uses"), expires_at=expires_at, is_active=bool(data.get("is_active", True)))
    db.session.add(promo); db.session.commit()
    return jsonify({"message": "Promo code created", "promo": promo.to_dict()}), 201

@promotion_bp.route("/promos/<int:promo_id>", methods=["PUT"])
@jwt_required()
@role_required(MENU_ROLES)
def update_promo(promo_id):
    promo = PromoCode.query.get_or_404(promo_id); data=request.get_json(silent=True) or {}
    for field in ["discount_type", "discount_value", "min_order_value", "max_uses", "is_active"]:
        if field in data: setattr(promo, field, data[field])
    if "expires_at" in data:
        try:
            promo.expires_at = _parse_date(data.get("expires_at"))
        except ValueError as exc:
            return jsonify({"error": str(exc)}), 400
    db.session.commit(); return jsonify({"message":"Promo updated","promo":promo.to_dict()}),200

@promotion_bp.route("/promos/<int:promo_id>", methods=["DELETE"])
@jwt_required()
@role_required(MENU_ROLES)
def delete_promo(promo_id):
    promo=PromoCode.query.get_or_404(promo_id); db.session.delete(promo); db.session.commit(); return jsonify({"message":"Promo deleted"}),200

@promotion_bp.route("/promos/<string:code>/validate", methods=["POST"])
@jwt_required()
def validate_promo(code):
    data = request.get_json(silent=True) or {}
    promo = PromoCode.query.filter_by(code=code.upper(), is_active=True).first()
    if not promo:
        return jsonify({"valid": False, "error": "Invalid or expired promo code"}), 400
    if promo.max_uses and promo.used_count >= promo.max_uses:
        return jsonify({"valid": False, "error": "Promo code usage limit reached"}), 400
    if promo.expires_at and promo.expires_at < datetime.utcnow():
        return jsonify({"valid": False, "error": "Promo code has expired"}), 400
    order_total = data.get("order_total")
    if order_total is not None and float(order_total) < float(promo.min_order_value or 0):
        return jsonify({"valid": False, "error": f"Minimum order value is KWD {float(promo.min_order_value or 0):.3f}"}), 400
    return jsonify({"valid": True, "promo": promo.to_dict()}), 200
