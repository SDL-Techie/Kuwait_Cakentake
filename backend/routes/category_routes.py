from flask import Blueprint, request, jsonify
from extensions import db
from models.category import Category

category_bp = Blueprint("category", __name__)



@category_bp.route("/category", methods=["POST"])
def create_category():

    data = request.get_json()

    category = Category(
        name=data["name"],
        image=data.get("image_url"),
        status=data.get("status", "active")
    )

    db.session.add(category)
    db.session.commit()

    return jsonify({
        "message": "Category created successfully",
        "category": category.to_dict()
    }), 201

# Get All Categories
@category_bp.route("/category", methods=["GET"])
def get_all_categories():

    categories = Category.query.all()

    return jsonify([
        category.to_dict()
        for category in categories
    ]), 200


# Get Single Category
@category_bp.route("/category/<int:id>", methods=["GET"])
def get_category(id):

    category = Category.query.get(id)

    if not category:
        return jsonify({
            "error": "Category not found"
        }), 404

    return jsonify(category.to_dict()), 200


# Update Category
@category_bp.route("/category/<int:id>", methods=["PUT"])
def update_category(id):

    category = Category.query.get(id)

    if not category:
        return jsonify({
            "error": "Category not found"
        }), 404

    data = request.get_json()

    category.name = data.get("name", category.name)
    category.image = data.get("image_url", category.image)
    category.status = data.get("status", category.status)

    db.session.commit()

    return jsonify({
        "message": "Category updated successfully",
        "category": category.to_dict()
    }), 200


# Delete Category
@category_bp.route("/category/<int:id>", methods=["DELETE"])
def delete_category(id):

    category = Category.query.get(id)

    if not category:
        return jsonify({
            "error": "Category not found"
        }), 404

    db.session.delete(category)
    db.session.commit()

    return jsonify({
        "message": "Category deleted successfully"
    }), 200

# ─── NEW: API-spec compliant routes ──────────────────────────────────────────

@category_bp.route("/categories", methods=["GET"])
def get_categories():
    categories = Category.query.all()
    return jsonify({"categories": [c.to_dict() for c in categories]}), 200


@category_bp.route("/categories", methods=["POST"])
def create_category_v2():
    data = request.get_json()
    category = Category(
        name=data["name"],
        image=data.get("image"),
        status=data.get("status", "active")
    )
    db.session.add(category)
    db.session.commit()
    return jsonify({"message": "Category created", "category": category.to_dict()}), 201


@category_bp.route("/categories/<int:cat_id>", methods=["PUT"])
def update_category_v2(cat_id):
    category = Category.query.get_or_404(cat_id)
    data = request.get_json()
    category.name = data.get("name", category.name)
    category.image = data.get("image", category.image)
    category.status = data.get("status", category.status)
    db.session.commit()
    return jsonify({"message": "Category updated", "category": category.to_dict()}), 200


@category_bp.route("/categories/<int:cat_id>", methods=["DELETE"])
def delete_category_v2(cat_id):
    category = Category.query.get_or_404(cat_id)
    db.session.delete(category)
    db.session.commit()
    return jsonify({"message": "Category deleted"}), 200


@category_bp.route("/categories/<int:cat_id>/subcategories", methods=["GET"])
def get_category_subcategories(cat_id):
    from models.misc import SubCategory
    subs = SubCategory.query.filter_by(category_id=cat_id).all()
    return jsonify({"subcategories": [s.to_dict() for s in subs]}), 200


@category_bp.route("/categories/<int:cat_id>/products", methods=["GET"])
def get_category_products(cat_id):
    from models.product import Product

    currency = request.headers.get(
        "X-Currency",
        "KWD"
    )

    products = Product.query.filter_by(category_id=cat_id).all()
    return jsonify({"products": [p.to_dict(currency) for p in products]}), 200