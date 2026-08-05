from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from datetime import datetime
from extensions import db
from models.promotion import Promotion, PromotionFreeItem, PromoCode
from models.product import Product
from middleware.role import role_required

promotion_bp = Blueprint("promotion", __name__)


# ─── PROMOTIONS ──────────────────────────────────────────────────────────────

@promotion_bp.route("/promotions", methods=["GET"])
@jwt_required()
def get_promotions():
    promos = Promotion.query.all()
    return jsonify({"promotions": [p.to_dict() for p in promos]}), 200


@promotion_bp.route("/promotions/active", methods=["GET"])
def get_active_promotions():
    promos = Promotion.query.filter_by(is_active=True).all()
    return jsonify({"promotions": [p.to_dict() for p in promos]}), 200


# @promotion_bp.route("/promotions", methods=["POST"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def create_promotion():
#     data = request.get_json()
#     # promo = Promotion(
#         name=data["name"],
#         description=data.get("description"),
#         product_id=data["product_id"],
#         promotion_type=data["promotion_type"],
#         # discount_type=data["discount_type"],
#         # discount_value=data["discount_value"],
#         discount_type=data.get("discount_type"),
#        discount_value=data.get("discount_value"),
#         # min_order_value=data.get("min_order_value", 0),
#         start_date=datetime.fromisoformat(data["start_date"]) if data.get("start_date") else None,
#         end_date=datetime.fromisoformat(data["end_date"]) if data.get("end_date") else None
#     )
    
#     promo = Promotion(
#      name=data["name"],
#      description=data.get("description"),
#      product_id=data["product_id"],
#      promotion_type=data["promotion_type"],

#      discount_type=data.get("discount_type"),
#      discount_value=data.get("discount_value"),

#      start_date=datetime.fromisoformat(data["start_date"]) if data.get("start_date") else None,
#      end_date=datetime.fromisoformat(data["end_date"]) if data.get("end_date") else None,
#      )
  
#     db.session.add(promo)
#     db.session.commit()
#     return jsonify({"message": "Promotion created", "promotion": promo.to_dict()}), 201

@promotion_bp.route("/promotions", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def create_promotion():
    data = request.get_json()

    promotion_type = data["promotion_type"]

    promo = Promotion(
        name=data["name"],
        description=data.get("description"),
        product_id=data["product_id"],
        promotion_type=promotion_type,
        discount_type=data.get("discount_type") if promotion_type == "DISCOUNT" else None,
        discount_value=data.get("discount_value") if promotion_type == "DISCOUNT" else None,
        start_date=datetime.fromisoformat(data["start_date"]) if data.get("start_date") else None,
        end_date=datetime.fromisoformat(data["end_date"]) if data.get("end_date") else None,
    )

    db.session.add(promo)
    db.session.commit()

    return jsonify({
        "message": "Promotion created",
        "promotion": promo.to_dict()
    }), 201

@promotion_bp.route("/promotions/<int:promo_id>", methods=["PUT"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def update_promotion(promo_id):
    promo = Promotion.query.get_or_404(promo_id)
    data = request.get_json()
    for field in ["name", "description", "discount_type", "discount_value"]:
        if field in data:
            setattr(promo, field, data[field])
    db.session.commit()
    return jsonify({"message": "Promotion updated", "promotion": promo.to_dict()}), 200


@promotion_bp.route("/promotions/<int:promo_id>", methods=["DELETE"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def delete_promotion(promo_id):
    promo = Promotion.query.get_or_404(promo_id)
    db.session.delete(promo)
    db.session.commit()
    return jsonify({"message": "Promotion deleted"}), 200


@promotion_bp.route("/promotions/<int:promo_id>/activate", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def activate_promotion(promo_id):
    promo = Promotion.query.get_or_404(promo_id)
    promo.is_active = True
    db.session.commit()
    return jsonify({"message": "Promotion activated", "promotion": promo.to_dict()}), 200


@promotion_bp.route("/promotions/<int:promo_id>/deactivate", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def deactivate_promotion(promo_id):
    promo = Promotion.query.get_or_404(promo_id)
    promo.is_active = False
    db.session.commit()
    return jsonify({"message": "Promotion deactivated", "promotion": promo.to_dict()}), 200


@promotion_bp.route("/promotions/<int:promo_id>/add-free-item", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def add_free_item(promo_id):
    promo = Promotion.query.get_or_404(promo_id)
    data = request.get_json()
    item = PromotionFreeItem(
        promotion_id=promo.id,
        product_id=data["product_id"],
        quantity=data.get("quantity", 1)
    )
    db.session.add(item)
    db.session.commit()
    return jsonify({"message": "Free item added", "item": item.to_dict()}), 201


@promotion_bp.route("/promotions/<int:promo_id>/remove-free-item", methods=["DELETE"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def remove_free_item(promo_id):
    data = request.get_json()
    item = PromotionFreeItem.query.filter_by(
        promotion_id=promo_id, product_id=data["product_id"]
    ).first_or_404()
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Free item removed"}), 200


@promotion_bp.route("/promotions/<int:promo_id>/free-items", methods=["GET"])
def get_free_items(promo_id):
    items = PromotionFreeItem.query.filter_by(promotion_id=promo_id).all()
    return jsonify({"free_items": [i.to_dict() for i in items]}), 200


# ─── PROMO CODES ─────────────────────────────────────────────────────────────

@promotion_bp.route("/promos", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def get_promos():
    promos = PromoCode.query.all()
    return jsonify({"promos": [p.to_dict() for p in promos]}), 200


@promotion_bp.route("/promos/active", methods=["GET"])
def get_active_promos():
    promos = PromoCode.query.filter_by(is_active=True).all()
    return jsonify({"promos": [p.to_dict() for p in promos]}), 200


@promotion_bp.route("/promos", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def create_promo():
    data = request.get_json()
    promo = PromoCode(
        code=data["code"].upper(),
        discount_type=data["discount_type"],
        discount_value=data["discount_value"],
        min_order_value=data.get("min_order_value", 0),
        max_uses=data.get("max_uses"),
        expires_at=datetime.fromisoformat(data["expires_at"]) if data.get("expires_at") else None
    )
    db.session.add(promo)
    db.session.commit()
    return jsonify({"message": "Promo code created", "promo": promo.to_dict()}), 201


@promotion_bp.route("/promos/<int:promo_id>", methods=["PUT"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def update_promo(promo_id):
    promo = PromoCode.query.get_or_404(promo_id)
    data = request.get_json()
    for field in ["discount_type", "discount_value", "min_order_value", "max_uses", "is_active"]:
        if field in data:
            setattr(promo, field, data[field])
    db.session.commit()
    return jsonify({"message": "Promo updated", "promo": promo.to_dict()}), 200


@promotion_bp.route("/promos/<int:promo_id>", methods=["DELETE"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def delete_promo(promo_id):
    promo = PromoCode.query.get_or_404(promo_id)
    db.session.delete(promo)
    db.session.commit()
    return jsonify({"message": "Promo deleted"}), 200


@promotion_bp.route("/promos/<string:code>/validate", methods=["POST"])
@jwt_required()
def validate_promo(code):
    promo = PromoCode.query.filter_by(code=code.upper(), is_active=True).first()
    if not promo:
        return jsonify({"valid": False, "error": "Invalid or expired promo code"}), 400
    if promo.max_uses and promo.used_count >= promo.max_uses:
        return jsonify({"valid": False, "error": "Promo code usage limit reached"}), 400
    if promo.expires_at and promo.expires_at < datetime.utcnow():
        return jsonify({"valid": False, "error": "Promo code has expired"}), 400
    return jsonify({"valid": True, "promo": promo.to_dict()}), 200
