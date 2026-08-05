from flask import Blueprint, request, jsonify
from extensions import db
from models.product import Product
from models.wishlist import Wishlist;
from sqlalchemy.exc import IntegrityError

product_bp = Blueprint("product", __name__)


# Create Product
@product_bp.route("/products", methods=["POST"])
def create_product():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No input data provided"}), 400

        product = Product(
            name=data.get("name"),
            category_id=data.get("category_id"),
            price=data.get("price"),
            original_price=data.get("original_price"),
            stock=data.get("stock", 0),
            unit=data.get("unit"),
            image_url=data.get("image_url"),
            description=data.get("description"),
            ingredients=data.get("ingredients")
        )

        db.session.add(product)
        db.session.commit()

        return jsonify({
            "message": "Product created successfully",
            "product": product.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        print("ERROR:", str(e))
        return jsonify({"error": str(e)}), 500



# Get All Products
# @product_bp.route("/products", methods=["GET"])
# def get_products():

#     products = Product.query.all()

#     return jsonify([
#         product.to_dict()
#         for product in products
#     ]), 200


@product_bp.route("/products", methods=["GET"])
def get_products():

    currency = request.headers.get(
        "X-Currency",
        "KWD"
    )

    is_admin = request.args.get("admin") == "true"

    # Admin views (menu management / owner UI) should always display the
    # original stored price (DB is KWD). Ignore the X-Currency header when
    # the admin flag is present so the admin sees the raw KWD values.
    if is_admin:
        currency = "KWD"
    is_agent = request.args.get("agent") == "true"

    if is_admin or is_agent:
        # Admins see everything (Active + Inactive)
        # query = Product.query
        query = Product.query
        currency = "KWD"    
    else:
        # Users/Customers only see active products
        query = Product.query.filter_by(is_active=True)

    # ─── Optional filters (used by the chatbot's product search, and by the
    #     storefront search bar). Additive only — existing behaviour when no
    #     query params are supplied is unchanged. ─────────────────────────────

    search = request.args.get("search", "").strip()
    if search:
        like = f"%{search}%"
        query = query.filter(
            db.or_(
                Product.name.ilike(like),
                Product.description.ilike(like),
                Product.ingredients.ilike(like)
            )
        )

    category_id = request.args.get("category_id", type=int)
    if category_id:
        query = query.filter(Product.category_id == category_id)

    max_price = request.args.get("max_price", type=float)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    min_price = request.args.get("min_price", type=float)
    if min_price is not None:
        query = query.filter(Product.price >= min_price)

    in_stock_only = request.args.get("in_stock") == "true"
    if in_stock_only:
        query = query.filter(Product.stock > 0)

    products = query.all()

    return jsonify([
        product.to_dict(currency)
        for product in products
    ]), 200




# Get Single Product
# @product_bp.route("/products/<int:id>", methods=["GET"])
# def get_product(id):

#     product = Product.query.get(id)

#     if not product:
#         return jsonify({
#             "error": "Product not found"
#         }), 404

#     return jsonify(
#         product.to_dict()
#     ), 200


@product_bp.route("/products/<int:id>", methods=["GET"])
def get_product(id):

    product = Product.query.get(id)

    if not product:
        return jsonify({
            "error": "Product not found"
        }), 404

    currency = request.headers.get(
        "X-Currency",
        "KWD"
    )

    return jsonify(
        product.to_dict(currency)
    ), 200

# Update Product
@product_bp.route("/products/<int:id>", methods=["PUT"])
def update_product(id):

    product = Product.query.get(id)

    if not product:
        return jsonify({"error": "Product not found"}), 404

    data = request.get_json()

    product.name = data.get("name", product.name)
    product.description = data.get("description", product.description)

    product.category_id = data.get("category_id", product.category_id)

    product.price = data.get("price", product.price)
    product.original_price = data.get("original_price", product.original_price)

    product.stock = data.get("stock", product.stock)
    product.unit = data.get("unit", product.unit)

    product.image_url = data.get("image_url", product.image_url)

    # 🔥 THIS IS YOUR ISSUE
    product.ingredients = data.get("ingredients", product.ingredients)

    # 🔥 ALSO IMPORTANT
    if "is_active" in data:
        product.is_active = data.get("is_active")

    db.session.commit()

    return jsonify({
        "message": "Product updated successfully",
        "product": product.to_dict()
    }), 200

@product_bp.route("/products/<int:id>", methods=["DELETE"])
def delete_product(id):
    try:
        product = Product.query.get(id)

        if not product:
            return jsonify({"error": "Product not found"}), 404

        from models.wishlist import Wishlist

        Wishlist.query.filter_by(product_id=id).delete()

        db.session.delete(product)
        db.session.commit()

        return jsonify({
            "message": "Product deleted successfully"
        }), 200

    except IntegrityError:
         db.session.rollback()

         return jsonify({
            "success": False,
            "message": "This product cannot be deleted because it has already been used in one or more customer orders."
        }), 400

    except Exception as e:
        db.session.rollback()
        print("DELETE ERROR:", e)
        return jsonify({
            "success": False,
            "message": "Something went wrong while deleting the product."
        }), 500
    
# @product_bp.route("/products/<int:product_id>/addons")
# def product_addons(product_id):

#     product = Product.query.get_or_404(product_id)

#     addons = product.addons

#     return jsonify({
#         "addons":[a.to_dict() for a in addons]
#     })
