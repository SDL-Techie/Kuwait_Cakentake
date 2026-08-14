from flask import Blueprint, request, jsonify
from extensions import db
from models.cart import Cart
from models.cartItem import CartItem
from models.product import Product
from models.variant import Variant, Flavor, Addon
from models.user import User

cart_bp = Blueprint("cart", __name__)


@cart_bp.route("/cart", methods=["POST"])
def add_to_cart():

    data = request.get_json()

    if not data or "user_id" not in data or "product_id" not in data:
        return jsonify({"error": "user_id and product_id are required"}), 400

    user_id = data["user_id"]
    product_id = data["product_id"]
    quantity = data.get("quantity", 1)
    variant_id = data.get("variant_id")
    flavor_id = data.get("flavor_id")
    shape = data.get("shape")
    requested_addon_ids = sorted(
        a["id"] for a in data.get("addons", []) if a.get("id")
    )

    if not isinstance(quantity, int) or quantity < 1:
        return jsonify({"error": "quantity must be a positive integer"}), 400

    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    # --- Recompute price server-side in base currency (INR). Never trust the client. ---
    unit_price = float(product.price)

    variant = None
    if variant_id:
        variant = Variant.query.get(variant_id)
        if not variant:
            return jsonify({"error": "Invalid variant"}), 400
        unit_price += float(variant.price_modifier or 0)

    flavor = None
    if flavor_id:
        flavor = Flavor.query.get(flavor_id)
        if not flavor:
            return jsonify({"error": "Invalid flavor"}), 400
        unit_price += float(flavor.price_modifier or 0)

    addons_payload = []
    if requested_addon_ids:
        addon_rows = Addon.query.filter(Addon.id.in_(requested_addon_ids)).all()
        if len(addon_rows) != len(requested_addon_ids):
            return jsonify({"error": "One or more addons are invalid"}), 400
        for a in addon_rows:
            unit_price += float(a.price or 0)
            addons_payload.append({"id": a.id, "name": a.name, "price": float(a.price)})

    cart = Cart.query.filter_by(user_id=user_id).first()
    if not cart:
        cart = Cart(user_id=user_id)
        db.session.add(cart)
        db.session.flush()

    # Only merge into an existing line if every customization matches exactly.
    candidates = CartItem.query.filter_by(
        cart_id=cart.id,
        product_id=product_id,
        variant_id=variant_id,
        flavor_id=flavor_id,
        shape=shape
    ).all()

    cart_item = None
    for c in candidates:
        existing_ids = sorted(a["id"] for a in (c.addons or []))
        if existing_ids == requested_addon_ids:
            cart_item = c
            break

    if cart_item:
        cart_item.quantity += quantity
        cart_item.total_price = unit_price  # refresh in case prices changed since last add
    else:
        cart_item = CartItem(
            cart_id=cart.id,
            product_id=product_id,
            quantity=quantity,
            variant_id=variant_id,
            flavor_id=flavor_id,
            shape=shape,
            addons=addons_payload,
            total_price=unit_price,
        )
        db.session.add(cart_item)

    db.session.commit()

    currency = request.headers.get("X-Currency", "KWD")
    return jsonify({
        "message": "Added to cart",
        "cart": cart.to_dict(currency)
    }), 201


@cart_bp.route("/cart/<int:user_id>", methods=["GET"])
def get_cart(user_id):

    cart = Cart.query.filter_by(user_id=user_id).first()

    if not cart:
        return jsonify({"message": "Cart is empty"}), 404

    currency = request.headers.get("X-Currency", "KWD")
    data = cart.to_dict(currency)

    return jsonify({
        "cart_id": data["id"],
        "user_id": data["user_id"],
        "total": data["total"],
        "currency": currency,
        "items": data["items"]
    }), 200


@cart_bp.route("/cart/item/<int:item_id>", methods=["PUT"])
def update_cart_item(item_id):

    item = CartItem.query.get(item_id)

    if not item:
        return jsonify({"error": "Cart item not found"}), 404

    data = request.get_json()
    item.quantity = data["quantity"]
    db.session.commit()

    return jsonify({"message": "Quantity updated"}), 200


@cart_bp.route("/cart/item/<int:item_id>", methods=["DELETE"])
def remove_cart_item(item_id):

    item = CartItem.query.get(item_id)

    if not item:
        return jsonify({"error": "Cart item not found"}), 404

    db.session.delete(item)
    db.session.commit()

    return jsonify({"message": "Item removed from cart"}), 200


@cart_bp.route("/cart/<int:user_id>", methods=["DELETE"])
def clear_cart(user_id):

    cart = Cart.query.filter_by(user_id=user_id).first()

    if not cart:
        return jsonify({"error": "Cart not found"}), 404

    CartItem.query.filter_by(cart_id=cart.id).delete()
    db.session.commit()

    return jsonify({"message": "Cart cleared"}), 200