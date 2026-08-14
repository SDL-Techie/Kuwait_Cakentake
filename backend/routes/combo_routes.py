from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from extensions import db
from models.combo import Combo
from models.product import Product
from models.user import User
from middleware.role import role_required
from services.push_notification_service import send_transactional_push

combo_bp = Blueprint("combo", __name__)
MENU_ROLES = ["ADMIN", "SHOP_MANAGER", "SALES_AGENT"]


def _active_user_ids():
    return [
        row.id
        for row in User.query.filter_by(role="USER", is_active=True).with_entities(User.id).all()
    ]


def _sync_products(combo, product_ids):
    if product_ids is None:
        return
    clean_ids = []
    for value in product_ids:
        try:
            pid = int(value.get("product_id") if isinstance(value, dict) else value)
        except (TypeError, ValueError, AttributeError):
            continue
        if pid not in clean_ids:
            clean_ids.append(pid)
    products = Product.query.filter(Product.id.in_(clean_ids)).all() if clean_ids else []
    found = {p.id for p in products}
    missing = [pid for pid in clean_ids if pid not in found]
    if missing:
        raise ValueError(f"Products not found: {', '.join(map(str, missing))}")
    combo.products = products


@combo_bp.route("/combos", methods=["GET"])
def get_combos():
    admin = request.args.get("admin") == "true"
    query = Combo.query if admin else Combo.query.filter_by(is_active=True)
    combos = query.order_by(Combo.created_at.desc()).all()
    return jsonify({"combos": [c.to_dict(include_items=admin) for c in combos]}), 200


@combo_bp.route("/combos", methods=["POST"])
@jwt_required()
@role_required(MENU_ROLES)
def create_combo():
    data = request.get_json(silent=True) or {}
    if not str(data.get("name") or "").strip():
        return jsonify({"error": "name is required"}), 400
    try:
        price = float(data.get("price"))
        if price <= 0:
            raise ValueError
    except (TypeError, ValueError):
        return jsonify({"error": "price must be greater than 0"}), 400

    product_ids = data.get("product_ids")
    if product_ids is None and isinstance(data.get("products"), list):
        product_ids = data.get("products")
    if not product_ids:
        return jsonify({"error": "Select at least one product for the combo"}), 400

    try:
        combo = Combo(
            name=str(data["name"]).strip(),
            description=data.get("description"),
            price=price,
            discount_amount=float(data.get("discount_amount") or 0),
            image_url=data.get("image_url"),
            is_active=bool(data.get("is_active", True)),
        )
        db.session.add(combo)
        db.session.flush()
        _sync_products(combo, product_ids)
        db.session.commit()
    except ValueError as exc:
        db.session.rollback()
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": f"Unable to create combo: {exc}"}), 500

    try:
        send_transactional_push(
            _active_user_ids(),
            "New combo available",
            f"{combo.name} is now available on Cake N Take.",
            {"action": "OPEN_COMBO", "type": "NEW_COMBO", "target_id": combo.id, "combo_id": combo.id},
        )
    except Exception as exc:
        print("Combo push notification error:", exc)

    return jsonify({"message": "Combo created", "combo": combo.to_dict(include_items=True)}), 201


@combo_bp.route("/combos/<int:combo_id>", methods=["PUT"])
@jwt_required()
@role_required(MENU_ROLES)
def update_combo(combo_id):
    combo = Combo.query.get_or_404(combo_id)
    data = request.get_json(silent=True) or {}
    try:
        for field in ["name", "description", "price", "discount_amount", "image_url", "is_active"]:
            if field in data:
                setattr(combo, field, data[field])
        product_ids = data.get("product_ids")
        if product_ids is None and isinstance(data.get("products"), list):
            product_ids = data.get("products")
        if product_ids is not None:
            if not product_ids:
                raise ValueError("Select at least one product for the combo")
            _sync_products(combo, product_ids)
        db.session.commit()
    except ValueError as exc:
        db.session.rollback()
        return jsonify({"error": str(exc)}), 400
    return jsonify({"message": "Combo updated", "combo": combo.to_dict(include_items=True)}), 200


@combo_bp.route("/combos/<int:combo_id>", methods=["DELETE"])
@jwt_required()
@role_required(MENU_ROLES)
def delete_combo(combo_id):
    combo = Combo.query.get_or_404(combo_id)
    db.session.delete(combo)
    db.session.commit()
    return jsonify({"message": "Combo deleted"}), 200


@combo_bp.route("/combos/<int:combo_id>/add-product", methods=["POST"])
@jwt_required()
@role_required(MENU_ROLES)
def add_product_to_combo(combo_id):
    combo = Combo.query.get_or_404(combo_id)
    data = request.get_json(silent=True) or {}
    product = Product.query.get_or_404(data.get("product_id"))
    if product not in combo.products:
        combo.products.append(product)
        db.session.commit()
    return jsonify({"message": "Product added to combo", "combo": combo.to_dict(include_items=True)}), 200


@combo_bp.route("/combos/<int:combo_id>/remove-product", methods=["DELETE"])
@jwt_required()
@role_required(MENU_ROLES)
def remove_product_from_combo(combo_id):
    combo = Combo.query.get_or_404(combo_id)
    data = request.get_json(silent=True) or {}
    product = Product.query.get_or_404(data.get("product_id"))
    if product in combo.products:
        combo.products.remove(product)
        db.session.commit()
    return jsonify({"message": "Product removed from combo"}), 200


@combo_bp.route("/combos/<int:combo_id>/items", methods=["GET"])
def get_combo_items(combo_id):
    combo = Combo.query.get_or_404(combo_id)
    return jsonify({"products": [p.to_dict() for p in combo.products]}), 200


@combo_bp.route("/combos/<int:combo_id>/price-preview", methods=["GET"])
def combo_price_preview(combo_id):
    combo = Combo.query.get_or_404(combo_id)
    individual_total = sum(float(p.price or 0) for p in combo.products)
    combo_price = float(combo.price or 0)
    return jsonify({
        "combo_id": combo_id,
        "combo_price": combo_price,
        "individual_total": individual_total,
        "savings": max(round(individual_total - combo_price, 3), 0),
    }), 200
