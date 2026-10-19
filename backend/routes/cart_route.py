from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.cart import Cart
from models.cartItem import CartItem
from models.product import Product
from models.variant import Variant, Flavor, Addon
from models.user import User

cart_bp = Blueprint("cart", __name__)


def _current_user_id():
    return int(get_jwt_identity())


def _requested_currency():
    code = str(request.headers.get("X-Currency") or "KWD").strip().upper()
    if code not in {"KWD", "AED", "USD", "INR"}:
        raise ValueError("Unsupported cart currency")
    return code


def _owns_cart(user_id):
    return int(user_id) == _current_user_id()


def _owns_item(item):
    return item.cart.user_id == _current_user_id()



@cart_bp.route("/cart", methods=["POST"])
@jwt_required()
def add_to_cart():

    try:
        currency = _requested_currency()
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    data = request.get_json(silent=True) or {}

    if not data or "user_id" not in data or "product_id" not in data:
        return jsonify({"error": "user_id and product_id are required"}), 400

    try:
        user_id = int(data["user_id"])
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid user_id"}), 400
    if not _owns_cart(user_id):
        return jsonify({"error": "Forbidden: cart belongs to another user"}), 403
    try:
        product_id = int(data["product_id"])
        if product_id <= 0:
            raise ValueError
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid product_id"}), 400
    quantity = data.get("quantity", 1)
    try:
        variant_id = int(data["variant_id"]) if data.get("variant_id") else None
        flavor_id = int(data["flavor_id"]) if data.get("flavor_id") else None
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid variant_id or flavor_id"}), 400
    shape = data.get("shape")
    message_on_cake = str(data.get("message_on_cake") or "").strip()
    if len(message_on_cake) > 80:
        return jsonify({"error": "Cake message exceeds 80 characters"}), 400
    # Accept both frontend addon_ids and older addons payloads.
    raw_addons = data.get("addon_ids")
    if raw_addons is None:
        raw_addons = data.get("addons") or []
    if not isinstance(raw_addons, list):
        return jsonify({"error": "addon_ids must be a list"}), 400
    try:
        requested_addon_ids = sorted(set(
            int(a.get("id")) if isinstance(a, dict) else int(a)
            for a in raw_addons
        ))
    except (TypeError, ValueError, KeyError):
        return jsonify({"error": "Invalid add-on IDs"}), 400
    if any(addon_id <= 0 for addon_id in requested_addon_ids):
        return jsonify({"error": "Invalid add-on IDs"}), 400

    if isinstance(quantity, bool) or not isinstance(quantity, int) or quantity < 1:
        return jsonify({"error": "quantity must be a positive integer"}), 400

    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    # Recompute server-side using stored product prices (KWD base currency).
    unit_price = float(product.price)

    variant = None
    if variant_id:
        variant = Variant.query.get(variant_id)
        if not variant or int(variant.product_id) != int(product_id):
            return jsonify({"error": "Invalid variant"}), 400
        unit_price += float(variant.price_modifier or 0)

    flavor = None
    if flavor_id:
        flavor = Flavor.query.get(flavor_id)
        if not flavor or not variant_id or int(flavor.variant_id) != int(variant_id):
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
        existing_ids = sorted(int(a["id"]) for a in (c.addons or []) if isinstance(a, dict) and a.get("id") is not None)
        if (
            existing_ids == requested_addon_ids
            and (c.message_on_cake or "") == message_on_cake
            and c.total_price is not None
            and round(float(c.total_price), 3) == round(unit_price, 3)
        ):
            cart_item = c
            break

    if cart_item:
        cart_item.quantity += quantity
        # Preserve the existing snapshot instead of repricing old quantities.
        # A historical line retains its booked unit cost.
    else:
        cart_item = CartItem(
            cart_id=cart.id,
            product_id=product_id,
            quantity=quantity,
            variant_id=variant_id,
            flavor_id=flavor_id,
            shape=shape,
            message_on_cake=message_on_cake or None,
            addons=addons_payload,
            total_price=unit_price,
        )
        db.session.add(cart_item)

    db.session.commit()

    return jsonify({
        "message": "Added to cart",
        "cart": cart.to_dict(currency)
    }), 201


@cart_bp.route("/cart/<int:user_id>", methods=["GET"])
@jwt_required()
def get_cart(user_id):

    if not _owns_cart(user_id):
        return jsonify({"error": "Forbidden: cart belongs to another user"}), 403
    cart = Cart.query.filter_by(user_id=user_id).first()

    if not cart:
        return jsonify({"message": "Cart is empty"}), 404

    try:
        currency = _requested_currency()
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    data = cart.to_dict(currency)

    return jsonify({
        "cart_id": data["id"],
        "user_id": data["user_id"],
        "subtotal": data["subtotal"],
        "discount": data["discount"],
        "promotion": data["promotion"],
        "total": data["total"],
        "currency": currency,
        "items": data["items"]
    }), 200


@cart_bp.route("/cart/item/<int:item_id>", methods=["PUT"])
@jwt_required()
def update_cart_item(item_id):

    item = CartItem.query.get(item_id)

    if not item:
        return jsonify({"error": "Cart item not found"}), 404
    if not _owns_item(item):
        return jsonify({"error": "Forbidden: cart item belongs to another user"}), 403

    data = request.get_json(silent=True) or {}
    if "quantity" in data:
        quantity = data["quantity"]
        if isinstance(quantity, bool) or not isinstance(quantity, int) or quantity < 1:
            return jsonify({"error": "Quantity must be a positive integer"}), 400
        item.quantity = quantity
    if "message_on_cake" in data:
        message = str(data.get("message_on_cake") or "").strip()
        if len(message) > 80:
            return jsonify({"error": "Cake message exceeds 80 characters"}), 400
        item.message_on_cake = message or None
    # Editing a message can make two cart rows identical. Merge the quantity
    # into the oldest matching row rather than losing the new inscription.
    candidates = CartItem.query.filter_by(
        cart_id=item.cart_id,
        product_id=item.product_id,
        variant_id=item.variant_id,
        flavor_id=item.flavor_id,
        shape=item.shape,
    ).filter(CartItem.id != item.id).order_by(CartItem.id.asc()).all()
    current_addons = sorted(int(a.get("id")) for a in (item.addons or []) if isinstance(a, dict) and a.get("id") is not None)
    survivor = item
    for candidate in candidates:
        candidate_addons = sorted(int(a.get("id")) for a in (candidate.addons or []) if isinstance(a, dict) and a.get("id") is not None)
        if (candidate_addons == current_addons
                and (candidate.message_on_cake or "") == (item.message_on_cake or "")
                and candidate.total_price is not None and item.total_price is not None
                and round(float(candidate.total_price), 3) == round(float(item.total_price), 3)):
            candidate.quantity += item.quantity
            db.session.delete(item)
            survivor = candidate
            break
    db.session.commit()

    return jsonify({"message": "Cart item updated", "item_id": survivor.id, "merged": survivor is not item}), 200


@cart_bp.route("/cart/item/<int:item_id>", methods=["DELETE"])
@jwt_required()
def remove_cart_item(item_id):

    item = CartItem.query.get(item_id)

    if not item:
        return jsonify({"error": "Cart item not found"}), 404
    if not _owns_item(item):
        return jsonify({"error": "Forbidden: cart item belongs to another user"}), 403

    db.session.delete(item)
    db.session.commit()

    return jsonify({"message": "Item removed from cart"}), 200


@cart_bp.route("/cart/<int:user_id>", methods=["DELETE"])
@jwt_required()
def clear_cart(user_id):

    if not _owns_cart(user_id):
        return jsonify({"error": "Forbidden: cart belongs to another user"}), 403
    cart = Cart.query.filter_by(user_id=user_id).first()

    if not cart:
        return jsonify({"error": "Cart not found"}), 404

    CartItem.query.filter_by(cart_id=cart.id).delete()
    db.session.commit()

    return jsonify({"message": "Cart cleared"}), 200