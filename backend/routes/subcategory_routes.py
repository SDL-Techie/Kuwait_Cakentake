from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from extensions import db
from models.misc import SubCategory
from middleware.role import role_required

subcategory_bp = Blueprint("subcategory", __name__)


@subcategory_bp.route("/subcategories", methods=["GET"])
def get_subcategories():
    subs = SubCategory.query.all()
    return jsonify({"subcategories": [s.to_dict() for s in subs]}), 200


@subcategory_bp.route("/subcategories", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def create_subcategory():
    data = request.get_json()
    sub = SubCategory(
        name=data["name"],
        category_id=data["category_id"],
        description=data.get("description"),
        image_url=data.get("image_url")
    )
    db.session.add(sub)
    db.session.commit()
    return jsonify({"message": "SubCategory created", "subcategory": sub.to_dict()}), 201


@subcategory_bp.route("/subcategories/<int:sub_id>", methods=["PUT"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def update_subcategory(sub_id):
    sub = SubCategory.query.get_or_404(sub_id)
    data = request.get_json()
    for field in ["name", "category_id", "description", "image_url", "is_active"]:
        if field in data:
            setattr(sub, field, data[field])
    db.session.commit()
    return jsonify({"message": "SubCategory updated", "subcategory": sub.to_dict()}), 200


@subcategory_bp.route("/subcategories/<int:sub_id>", methods=["DELETE"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def delete_subcategory(sub_id):
    sub = SubCategory.query.get_or_404(sub_id)
    db.session.delete(sub)
    db.session.commit()
    return jsonify({"message": "SubCategory deleted"}), 200
