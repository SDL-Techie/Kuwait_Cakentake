from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from extensions import db
from models.variant import Variant, Flavor, Addon
from middleware.role import role_required

variant_bp = Blueprint("variant", __name__)


# ─── VARIANTS ────────────────────────────────────────────────────────────────

@variant_bp.route("/variants/<int:product_id>", methods=["GET"])
def get_variants(product_id):
    variants = Variant.query.filter_by(product_id=product_id).all()
    return jsonify({"variants": [v.to_dict() for v in variants]}), 200


@variant_bp.route("/variants", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def create_variant():
    data = request.get_json()
    variant = Variant(
        product_id=data["product_id"],
        name=data["name"],
        price_modifier=data.get("price_modifier", 0)
    )
    db.session.add(variant)
    db.session.commit()
    return jsonify({"message": "Variant created", "variant": variant.to_dict()}), 201


@variant_bp.route("/variants/<int:variant_id>", methods=["PUT"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def update_variant(variant_id):
    variant = Variant.query.get_or_404(variant_id)
    data = request.get_json()
    for field in ["name", "price_modifier", "is_active"]:
        if field in data:
            setattr(variant, field, data[field])
    db.session.commit()
    return jsonify({"message": "Variant updated", "variant": variant.to_dict()}), 200


@variant_bp.route("/variants/<int:variant_id>", methods=["DELETE"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def delete_variant(variant_id):
    variant = Variant.query.get_or_404(variant_id)
    db.session.delete(variant)
    db.session.commit()
    return jsonify({"message": "Variant deleted"}), 200


# ─── FLAVORS ─────────────────────────────────────────────────────────────────

@variant_bp.route("/flavors/<int:variant_id>", methods=["GET"])
def get_flavors(variant_id):
    flavors = Flavor.query.filter_by(variant_id=variant_id).all()
    return jsonify({"flavors": [f.to_dict() for f in flavors]}), 200


@variant_bp.route("/flavors", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def create_flavor():
    data = request.get_json()
    flavor = Flavor(
        variant_id=data["variant_id"],
        name=data["name"],
        price_modifier=data.get("price_modifier", 0)
    )
    db.session.add(flavor)
    db.session.commit()
    return jsonify({"message": "Flavor created", "flavor": flavor.to_dict()}), 201


@variant_bp.route("/flavors/<int:flavor_id>", methods=["PUT"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def update_flavor(flavor_id):
    flavor = Flavor.query.get_or_404(flavor_id)
    data = request.get_json()
    for field in ["name", "price_modifier", "is_active"]:
        if field in data:
            setattr(flavor, field, data[field])
    db.session.commit()
    return jsonify({"message": "Flavor updated", "flavor": flavor.to_dict()}), 200


@variant_bp.route("/flavors/<int:flavor_id>", methods=["DELETE"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def delete_flavor(flavor_id):
    flavor = Flavor.query.get_or_404(flavor_id)
    db.session.delete(flavor)
    db.session.commit()
    return jsonify({"message": "Flavor deleted"}), 200


# ─── ADDONS ──────────────────────────────────────────────────────────────────

@variant_bp.route("/addons", methods=["GET"])
def get_addons():
    addons = Addon.query.filter_by(is_active=True).all()
    return jsonify({"addons": [a.to_dict() for a in addons]}), 200


@variant_bp.route("/addons/predefined", methods=["GET"])
def get_predefined_addons():
    addons = Addon.query.filter_by(is_predefined=True, is_active=True).all()
    return jsonify({"addons": [a.to_dict() for a in addons]}), 200


@variant_bp.route("/addons", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def create_addon():
    data = request.get_json()
    addon = Addon(
        name=data["name"],
        price=data.get("price", 0),
        image_url=data.get("image_url"), 
        is_predefined=data.get("is_predefined", False)
    )
    db.session.add(addon)
    db.session.commit()
    return jsonify({"message": "Addon created", "addon": addon.to_dict()}), 201


@variant_bp.route("/addons/<int:addon_id>", methods=["PUT"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def update_addon(addon_id):
    addon = Addon.query.get_or_404(addon_id)
    data = request.get_json()
    for field in ["name", "price","image_url", "is_predefined", "is_active"]:
        if field in data:
            setattr(addon, field, data[field])
    db.session.commit()
    return jsonify({"message": "Addon updated", "addon": addon.to_dict()}), 200


@variant_bp.route("/addons/<int:addon_id>", methods=["DELETE"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def delete_addon(addon_id):
    addon = Addon.query.get_or_404(addon_id)
    db.session.delete(addon)
    db.session.commit()
    return jsonify({"message": "Addon deleted"}), 200

# ─── GET ALL VARIANTS ─────────────────────────────────────────────────────────

@variant_bp.route("/variants", methods=["GET"])
def get_all_variants():
    variants = Variant.query.all()
    return jsonify({
        "variants": [variant.to_dict() for variant in variants]
    }), 200