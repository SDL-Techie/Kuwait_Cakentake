from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from extensions import db
from models.combo import Combo
from models.product import Product
from middleware.role import role_required

combo_bp = Blueprint("combo", __name__)


@combo_bp.route("/combos", methods=["GET"])
def get_combos():
    combos = Combo.query.filter_by(is_active=True).all()
    return jsonify({"combos": [c.to_dict() for c in combos]}), 200


@combo_bp.route("/combos", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def create_combo():
    data = request.get_json()
    combo = Combo(
        name=data["name"],
        description=data.get("description"),
        price=data["price"],
        discount_amount=data.get("discount_amount", 0),
        image_url=data.get("image_url")
    )
    db.session.add(combo)
    db.session.commit()
    return jsonify({"message": "Combo created", "combo": combo.to_dict()}), 201


@combo_bp.route("/combos/<int:combo_id>", methods=["PUT"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def update_combo(combo_id):
    combo = Combo.query.get_or_404(combo_id)
    data = request.get_json()
    for field in ["name", "description", "price", "discount_amount", "image_url", "is_active"]:
        if field in data:
            setattr(combo, field, data[field])
    db.session.commit()
    return jsonify({"message": "Combo updated", "combo": combo.to_dict()}), 200


@combo_bp.route("/combos/<int:combo_id>", methods=["DELETE"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def delete_combo(combo_id):
    combo = Combo.query.get_or_404(combo_id)
    db.session.delete(combo)
    db.session.commit()
    return jsonify({"message": "Combo deleted"}), 200


@combo_bp.route("/combos/<int:combo_id>/add-product", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def add_product_to_combo(combo_id):
    combo = Combo.query.get_or_404(combo_id)
    data = request.get_json()
    product = Product.query.get_or_404(data["product_id"])
    if product not in combo.products:
        combo.products.append(product)
        db.session.commit()
    return jsonify({"message": "Product added to combo", "combo": combo.to_dict(include_items=True)}), 200


@combo_bp.route("/combos/<int:combo_id>/remove-product", methods=["DELETE"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def remove_product_from_combo(combo_id):
    combo = Combo.query.get_or_404(combo_id)
    data = request.get_json()
    product = Product.query.get_or_404(data["product_id"])
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
    individual_total = sum(float(p.price) for p in combo.products)
    return jsonify({
        "combo_id": combo_id,
        "combo_price": float(combo.price),
        "individual_total": individual_total,
        "savings": round(individual_total - float(combo.price) + float(combo.discount_amount), 2)
    }), 200
