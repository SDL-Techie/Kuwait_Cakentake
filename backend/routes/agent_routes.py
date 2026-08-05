import random
from datetime import datetime, date
from decimal import Decimal, InvalidOperation

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db
from middleware.role import role_required

from models.user import User
from models.agentproduct import AgentProduct
from models.product import Product
from models.order import Order
from models.order_item import OrderItem
from models.address import Address
from models.area import Area
from models.currency_rate import CurrencyRate
from services.order_history_service import log_order_status

agent_bp = Blueprint("agent", __name__)

ROLE_OWNER_LIST = ["ADMIN", "SHOP_MANAGER"]
ROLE_AGENT = "AGENT"


# ─── Helpers ──────────────────────────────────────────────────────────────────

def get_current_user():
    user_id = get_jwt_identity()
    return User.query.get(int(user_id))


def generate_order_number():
    return f"CT-AGT-{datetime.now().strftime('%Y%m%d')}-{random.randint(1000, 9999)}"


def _agent_or_404(agent_id):
    return User.query.filter_by(id=agent_id, role=ROLE_AGENT).first()


def _order_belongs_to_agent(order, agent):
    return order.created_by == agent.id and order.order_type == "agent_order"


# ─── Step 2: Owner creates / manages Agents ───────────────────────────────────

@agent_bp.route("/owner/agents", methods=["POST"])
@jwt_required()
@role_required(ROLE_OWNER_LIST)
def create_agent():
    owner = get_current_user()
    data = request.get_json() or {}

    required = ["first_name", "last_name", "phone_no", "email", "password"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already exists"}), 400
    if User.query.filter_by(phone_no=data["phone_no"]).first():
        return jsonify({"error": "Phone number already exists"}), 400

    try:
        default_discount = Decimal(str(data.get("default_discount", 0) or 0))
    except (InvalidOperation, TypeError, ValueError):
        return jsonify({"error": "Invalid default_discount value"}), 400

    if default_discount < 0 or default_discount > 100:
        return jsonify({"error": "default_discount must be between 0 and 100"}), 400

    agent = User(
        first_name=data["first_name"],
        last_name=data["last_name"],
        phone_no=data["phone_no"],
        email=data["email"],
        role=ROLE_AGENT,
        is_active=True,
        created_by=owner.id,
        default_discount=default_discount
    )
    agent.set_password(data["password"])

    db.session.add(agent)
    db.session.commit()

    return jsonify({"message": "Agent created", "agent": agent.to_dict()}), 201


@agent_bp.route("/owner/agents", methods=["GET"])
@jwt_required()
@role_required(ROLE_OWNER_LIST)
def list_agents():
    active_only = request.args.get("active")
    query = User.query.filter_by(role=ROLE_AGENT)
    if active_only == "true":
        query = query.filter_by(is_active=True)
    elif active_only == "false":
        query = query.filter_by(is_active=False)

    agents = query.order_by(User.created_at.desc()).all()
    return jsonify({"agents": [a.to_dict() for a in agents]}), 200


@agent_bp.route("/owner/agents/<int:agent_id>", methods=["GET"])
@jwt_required()
@role_required(ROLE_OWNER_LIST)
def get_agent(agent_id):
    agent = _agent_or_404(agent_id)
    if not agent:
        return jsonify({"error": "Agent not found"}), 404
    return jsonify({"agent": agent.to_dict()}), 200


@agent_bp.route("/owner/agents/<int:agent_id>", methods=["PUT"])
@jwt_required()
@role_required(ROLE_OWNER_LIST)
def update_agent(agent_id):
    agent = _agent_or_404(agent_id)
    if not agent:
        return jsonify({"error": "Agent not found"}), 404

    data = request.get_json() or {}

    if "email" in data and data["email"] != agent.email:
        if User.query.filter_by(email=data["email"]).first():
            return jsonify({"error": "Email already exists"}), 400

    if "phone_no" in data and data["phone_no"] != agent.phone_no:
        if User.query.filter_by(phone_no=data["phone_no"]).first():
            return jsonify({"error": "Phone number already exists"}), 400

    for field in ["first_name", "last_name", "phone_no", "email"]:
        if field in data:
            setattr(agent, field, data[field])

    if data.get("password"):
        agent.set_password(data["password"])

    db.session.commit()
    return jsonify({"message": "Agent updated", "agent": agent.to_dict()}), 200


@agent_bp.route("/owner/agents/<int:agent_id>", methods=["DELETE"])
@jwt_required()
@role_required(ROLE_OWNER_LIST)
def delete_agent(agent_id):
    agent = _agent_or_404(agent_id)
    if not agent:
        return jsonify({"error": "Agent not found"}), 404

    has_orders = Order.query.filter_by(created_by=agent.id).first() is not None
    if has_orders:
        return jsonify({
            "error": (
                "This agent has existing orders and cannot be deleted. "
                "Deactivate the agent instead."
            )
        }), 400

    try:
        db.session.delete(agent)
        db.session.commit()
    except Exception as error:
        db.session.rollback()
        return jsonify({"error": f"Unable to delete agent: {str(error)}"}), 400

    return jsonify({"message": "Agent deleted"}), 200


@agent_bp.route("/owner/agents/<int:agent_id>/status", methods=["PATCH"])
@jwt_required()
@role_required(ROLE_OWNER_LIST)
def set_agent_status(agent_id):
    agent = _agent_or_404(agent_id)
    if not agent:
        return jsonify({"error": "Agent not found"}), 404

    data = request.get_json() or {}
    if "active" not in data:
        return jsonify({"error": "'active' (true/false) is required"}), 400

    agent.is_active = bool(data["active"])
    db.session.commit()

    return jsonify({
        "message": "Agent activated" if agent.is_active else "Agent deactivated",
        "agent": agent.to_dict()
    }), 200


@agent_bp.route("/owner/agents/<int:agent_id>/reset-password", methods=["POST"])
@jwt_required()
@role_required(ROLE_OWNER_LIST)
def reset_agent_password(agent_id):
    agent = _agent_or_404(agent_id)
    if not agent:
        return jsonify({"error": "Agent not found"}), 404

    data = request.get_json() or {}
    new_password = data.get("password")
    if not new_password or len(new_password) < 6:
        return jsonify({"error": "password (min 6 characters) is required"}), 400

    agent.set_password(new_password)
    db.session.commit()

    return jsonify({"message": "Password reset successfully"}), 200


@agent_bp.route("/owner/agents/<int:agent_id>/discount", methods=["PATCH"])
@jwt_required()
@role_required(ROLE_OWNER_LIST)
def set_agent_discount(agent_id):
    agent = _agent_or_404(agent_id)
    if not agent:
        return jsonify({"error": "Agent not found"}), 404

    data = request.get_json() or {}
    if "default_discount" not in data:
        return jsonify({"error": "default_discount is required"}), 400

    try:
        discount = Decimal(str(data["default_discount"]))
    except (InvalidOperation, TypeError, ValueError):
        return jsonify({"error": "Invalid default_discount value"}), 400

    if discount < 0 or discount > 100:
        return jsonify({"error": "default_discount must be between 0 and 100"}), 400

    agent.default_discount = discount
    db.session.commit()

    return jsonify({
        "message": "Agent discount updated",
        "agent": agent.to_dict()
    }), 200

# ─── Step 3: Owner Agent Menus ────────────────────────────────

@agent_bp.route("/owner/agent-products", methods=["POST"])
@jwt_required()
@role_required(ROLE_OWNER_LIST)
def create_agent_product():

    data = request.get_json() or {}

    agent_id = data.get("agent_id")

    if not agent_id:
        return jsonify({"error": "agent_id is required"}), 400

    agent = _agent_or_404(agent_id)

    if not agent:
        return jsonify({"error": "Agent not found"}), 404

    if not data.get("name"):
        return jsonify({"error": "name is required"}), 400

    if data.get("price") is None:
        return jsonify({"error": "price is required"}), 400

    product = AgentProduct(
        agent_id=agent.id,
        name=data["name"],
        description=data.get("description"),
        price=data["price"],
        image=data.get("image"),
        cloudinary_public_id=data.get("cloudinary_public_id"),
        created_by=get_current_user().id
    )

    db.session.add(product)
    db.session.commit()

    return jsonify({
        "message": "Agent product created",
        "product": product.to_dict()
    }), 201

# . OWNER GET ALL AGENT PRODUCTS

@agent_bp.route("/owner/agent-products", methods=["GET"])
@jwt_required()
@role_required(ROLE_OWNER_LIST)
def list_agent_products():

    products = AgentProduct.query.order_by(
        AgentProduct.created_at.desc()
    ).all()

    return jsonify({
        "products": [p.to_dict() for p in products]
    })

# 4. OWNER GET PRODUCTS OF PARTICULAR AGENT

@agent_bp.route("/owner/agents/<int:agent_id>/products", methods=["GET"])
@jwt_required()
@role_required(ROLE_OWNER_LIST)
def owner_agent_products(agent_id):

    agent = _agent_or_404(agent_id)

    if not agent:
        return jsonify({"error": "Agent not found"}), 404

    products = AgentProduct.query.filter_by(
        agent_id=agent.id
    ).all()

    return jsonify({
        "products": [p.to_dict() for p in products]
    })

# 5. UPDATE AGENT PRODUCT

@agent_bp.route("/owner/agent-products/<int:id>", methods=["PUT"])
@jwt_required()
@role_required(ROLE_OWNER_LIST)
def update_agent_product(id):

    product = AgentProduct.query.get_or_404(id)

    data = request.get_json() or {}

    for field in [
        "name",
        "description",
        "price",
        "image",
        "cloudinary_public_id",
        "is_active"
    ]:
        if field in data:
            setattr(product, field, data[field])

    db.session.commit()

    return jsonify({
        "message": "Updated",
        "product": product.to_dict()
    })

# 6. DELETE AGENT PRODUCT

@agent_bp.route("/owner/agent-products/<int:id>", methods=["DELETE"])
@jwt_required()
@role_required(ROLE_OWNER_LIST)
def delete_agent_product(id):

    product = AgentProduct.query.get_or_404(id)

    db.session.delete(product)
    db.session.commit()

    return jsonify({
        "message": "Deleted"
    })

# 7. AGENT GET ONLY HIS PRODUCTS
@agent_bp.route("/agent/my-products", methods=["GET"])
@jwt_required()
@role_required([ROLE_AGENT] + ROLE_OWNER_LIST)
def my_agent_products():

    agent = get_current_user()

    products = AgentProduct.query.filter_by(
        agent_id=agent.id,
        is_active=True
    ).all()

    return jsonify({
        "products": [p.to_dict() for p in products]
    })



# ─── Step 4 + 9: Agent-side dashboard / catalog ───────────────────────────────

@agent_bp.route("/agent/products", methods=["GET"])
@jwt_required()
@role_required([ROLE_AGENT] + ROLE_OWNER_LIST)
def agent_products():
    """Source 1: normal bakery products, unchanged/unfiltered by agent.

    Agent-facing views should show the original stored DB price (KWD). Do not
    convert based on X-Currency for agent UI — the agent expects to see the
    product's stored price.
    """
    currency = "KWD"
    products = Product.query.filter_by(is_active=True).all()
    return jsonify({
        "products": [p.to_dict(currency) for p in products]
    }), 200


@agent_bp.route("/agent/catalog", methods=["GET"])
@jwt_required()
@role_required([ROLE_AGENT] + ROLE_OWNER_LIST)
def agent_catalog():

    agent = get_current_user()

    # For agent catalog, always return the stored DB prices (KWD) so the
    # agent UI shows unconverted values. Agent-specific products already use
    # the default to_dict() (KWD) so normal products should also be returned
    # in KWD regardless of the request header.
    currency = "KWD"

    normal_products = Product.query.filter_by(
        is_active=True
    ).all()

    agent_products = AgentProduct.query.filter_by(
        agent_id=agent.id,
        is_active=True
    ).all()

    return jsonify({
        "products": [
            p.to_dict(currency)
            for p in normal_products
        ],
        "agent_products": [
            p.to_dict()
            for p in agent_products
        ]
    })

@agent_bp.route("/agent/dashboard", methods=["GET"])
@jwt_required()
@role_required([ROLE_AGENT] + ROLE_OWNER_LIST)
def agent_dashboard():
    agent = get_current_user()

    orders = Order.query.filter_by(
        created_by=agent.id, order_type="agent_order"
    ).order_by(Order.created_at.desc()).all()

    today = date.today()
    todays_orders = [o for o in orders if o.created_at and o.created_at.date() == today]

    cancelled_statuses = ("CANCELLED", "REJECTED")

    pending_orders = [o for o in orders if o.status == "PENDING"]
    completed_orders = [o for o in orders if o.status == "DELIVERED"]
    cancelled_orders = [o for o in orders if o.status in cancelled_statuses]

    revenue_orders = [o for o in orders if o.status not in cancelled_statuses]
    todays_revenue_orders = [
        o for o in todays_orders if o.status not in cancelled_statuses
    ]

    total_customers = len({o.user_id for o in orders if o.user_id})

    return jsonify({
        "agent": agent.to_dict(),
        "todays_orders": len(todays_orders),
        "todays_revenue": float(sum(float(o.grand_total or 0) for o in todays_revenue_orders)),
        "pending_orders": len(pending_orders),
        "completed_orders": len(completed_orders),
        "cancelled_orders": len(cancelled_orders),
        "total_orders": len(orders),
        "total_revenue": float(sum(float(o.grand_total or 0) for o in revenue_orders)),
        "total_customers": total_customers,
        "recent_orders": [o.to_dict() for o in orders[:10]],
    }), 200


# ─── Step 6 + 7: Agent orders ──────────────────────────────────────────────────

@agent_bp.route("/agent/orders", methods=["GET"])
@jwt_required()
@role_required([ROLE_AGENT] + ROLE_OWNER_LIST)
def agent_list_orders():
    agent = get_current_user()

    query = Order.query.filter_by(created_by=agent.id, order_type="agent_order")

    status_filter = request.args.get("status")
    if status_filter:
        query = query.filter(Order.status == status_filter.upper())

    orders = query.order_by(Order.created_at.desc()).all()
    return jsonify({"orders": [o.to_dict() for o in orders]}), 200


@agent_bp.route("/agent/orders/<int:order_id>", methods=["GET"])
@jwt_required()
@role_required([ROLE_AGENT] + ROLE_OWNER_LIST)
def agent_get_order(order_id):
    agent = get_current_user()
    order = Order.query.get_or_404(order_id)

    if not _order_belongs_to_agent(order, agent):
        return jsonify({"error": "You do not have access to this order"}), 403

    return jsonify({"order": order.to_dict()}), 200


@agent_bp.route("/agent/orders", methods=["POST"])
@jwt_required()
@role_required([ROLE_AGENT] + ROLE_OWNER_LIST)
def agent_create_order():
    """
    Same flow as the normal customer order (routes/order_routes.py:create_order),
    reusing Order/OrderItem/Product/Address/Area/CurrencyRate, but:
      - order_type is forced to "agent_order"
      - created_by is forced to the logged-in agent's id
      - discount is NOT taken from the client — it is computed automatically
        from the agent's default_discount (Step 5).
    """
    agent = get_current_user()
    data = request.get_json(silent=True) or {}

    address_id = data.get("address_id")
    items_data = data.get("items")
    # delivery_method can be provided by client; default to DELIVERY
    delivery_method = str(data.get("delivery_method") or "DELIVERY").strip().upper()

    # If this is not a pickup, an address is required
    if delivery_method != "PICKUP" and not address_id:
        return jsonify({"error": "address_id is required for delivery orders"}), 400

    if not isinstance(items_data, list) or not items_data:
        return jsonify({"error": "Order must contain at least one item"}), 400

    address = None
    area = None

    if address_id:
        address = Address.query.filter_by(
            id=address_id,
            user_id=data["customer_id"]
        ).first()
        if not address:
            return jsonify({"error": "Address not found"}), 404

    if delivery_method != "PICKUP":
        if not address:
            return jsonify({"error": "Address not found"}), 404

        if not address.area_id:
            return jsonify({
                "error": (
                    "This address does not have a delivery area. "
                    "Please update the address and select an area."
                )
            }), 400

        area = Area.query.filter_by(id=address.area_id, is_active=True).first()
        if not area:
            return jsonify({
                "error": (
                    "Delivery is not available for the selected area. "
                    "Please contact CakeNTake customer support."
                ),
                "delivery_available": False
            }), 400
    # else:
    #     # Pickup orders do not require a delivery address. If a valid address is
    #     # supplied, use it. Otherwise, continue with a null address_id.
    #     if not address:
    #         customer_id = data.get("customer_id")
    #         if customer_id:
    #             customer = User.query.get(int(customer_id))
    #             if customer:
    #                 address = Address.query.filter_by(user_id=customer.id).first()

    else:
     address = None

    payment_method = str(data.get("payment_method") or "COD").strip().upper()
    allowed_payment_methods = {"COD", "CARD", "STRIPE", "KNET", "UPI", "LINK"}
    if payment_method not in allowed_payment_methods:
        return jsonify({
            "error": "Invalid payment method",
            "allowed_payment_methods": sorted(allowed_payment_methods)
        }), 400

    allowed_currencies = {"INR", "KWD", "AED", "USD", "SAR", "SGD"}
    currency = str(data.get("currency") or "KWD").strip().upper()
    if currency not in allowed_currencies:
        currency = "KWD"

    # Determine customer — prefer address.user when available, otherwise fetch
    # the customer by id (payload supplies customer_id, agent orders for that id).
    if address:
        customer = address.user
    else:
        customer = User.query.get(int(data.get("customer_id"))) if data.get("customer_id") else None

    # order = Order(
    #     user_id=customer.id if customer else None,
    #     created_by=agent.id,
    #     order_number=generate_order_number(),
    #     order_type="agent_order",
    #     order_source="AGENT",
    #     customer_name=(
    #         f"{customer.first_name} {customer.last_name}".strip()
    #         if customer else None
    #     ),
    #     customer_phone=customer.phone_no if customer else None,
    #     customer_email=customer.email if customer else None,
    #     address_id=(address.id if address else None),
    #     delivery_area_id=(area.id if area else None),
    #     delivery_date=(
    #         datetime.strptime(data["delivery_date"], "%Y-%m-%d").date()
    #         if data.get("delivery_date") else None
    #     ),
    #     delivery_time_slot=data.get("delivery_time_slot"),
    #     greeting_message=data.get("greeting_message") or None,
    #     greeting_from=data.get("greeting_from") or None,
    #     greeting_to=data.get("greeting_to") or None,
    #     payment_method=payment_method,
    #     payment_status="PENDING",
    #     status="PENDING",
    #     subtotal=0,
    #     delivery_charge=0,
    #     discount=0,
    #     grand_total=0,
    #     total=0,
    #     currency=currency
    # )

    order = Order(
    user_id=customer.id if customer else None,
    created_by=agent.id,
    order_number=generate_order_number(),
    order_type="agent_order",
    order_source="AGENT",
    customer_name=(
        f"{customer.first_name} {customer.last_name}".strip()
        if customer else None
    ),
    customer_phone=customer.phone_no if customer else None,
    customer_email=customer.email if customer else None,
    address_id=(address.id if address else None),
    delivery_area_id=(area.id if area else None),
    delivery_method=delivery_method,          # ← ADD THIS
    delivery_date=(
        datetime.strptime(data["delivery_date"], "%Y-%m-%d").date()
        if delivery_method != "PICKUP" and data.get("delivery_date") else None
    ),
    delivery_time_slot=(
        data.get("delivery_time_slot") if delivery_method != "PICKUP" else None
    ),
    pickup_date=(                              # ← ADD THIS
        datetime.strptime(data["pickup_date"], "%Y-%m-%d").date()
        if delivery_method == "PICKUP" and data.get("pickup_date") else None
    ),
    pickup_time_slot=(                         # ← ADD THIS
        data.get("pickup_time_slot") if delivery_method == "PICKUP" else None
    ),
    greeting_message=data.get("greeting_message") or None,
    greeting_from=data.get("greeting_from") or None,
    greeting_to=data.get("greeting_to") or None,
    payment_method=payment_method,
    payment_status="PENDING",
    status="PENDING",
    subtotal=0,
    delivery_charge=0,
    discount=0,
    grand_total=0,
    total=0,
    currency=currency
)    



    try:
        db.session.add(order)
        db.session.flush()

    

        subtotal = Decimal("0.001")

        # for index, item in enumerate(items_data):
        #     if not isinstance(item, dict):
        #         raise ValueError(f"Invalid item at position {index + 1}")

        #     product_id = item.get("product_id")
        #     if not product_id:
        #         raise ValueError(f"product_id is required for item {index + 1}")

        #     # product = Product.query.get(product_id)
        #     product = Product.query.filter_by(
        #      id=product_id,
        #      is_active=True
        #     ).first()
        #     if not product:
        #         raise ValueError(f"Product {product_id} not found")

        #     try:
        #         quantity = int(item.get("quantity", 1))
        #     except (TypeError, ValueError):
        #         raise ValueError(f"Invalid quantity for product {product_id}")

        #     if quantity <= 0:
        #         raise ValueError(f"Quantity must be greater than zero for product {product_id}")

        #     rate = CurrencyRate.query.filter_by(currency_code=currency).first()
        #     conversion_rate = Decimal(str(rate.rate if rate else 1))

        #     product_price = Decimal(str(product.price or 0)) * conversion_rate
        #     item_total = product_price * Decimal(quantity)
        #     subtotal += item_total

        #     order_item = OrderItem(
        #         order_id=order.id,
        #         product_id=product.id,
        #         quantity=quantity,
        #         price=product_price,
        #         line_total=item_total,
        #         custom_json=item.get("custom_json")
        #     )
        #     db.session.add(order_item)

        for index, item in enumerate(items_data):
            if not isinstance(item, dict):
              raise ValueError(f"Invalid item at position {index + 1}")
            product_id = item.get("product_id")
            if not product_id:
                raise ValueError(f"product_id is required for item {index + 1}")

            try:
                quantity = int(item.get("quantity", 1))
            except (TypeError, ValueError):
                raise ValueError(f"Invalid quantity for product {product_id}")
            if quantity <= 0:
                  raise ValueError(f"Quantity must be greater than zero for product {product_id}")
            custom_json = item.get("custom_json") or {}
            product_type = str(custom_json.get("product_type") or "NORMAL").upper()

            if product_type == "AGENT":
                agent_product = AgentProduct.query.filter_by(
                  id=product_id,
                  agent_id=agent.id,
                 is_active=True
                ).first()
                if not agent_product:
                    raise ValueError(f"Exclusive product {product_id} not found")

                unit_price = Decimal(str(agent_product.price or 0))
                item_total = unit_price * Decimal(quantity)
                subtotal += item_total

                order_item = OrderItem(
                    order_id=order.id,
                    product_id=None,
                    agent_product_id=agent_product.id,
                    quantity=quantity,
                    price=unit_price,
                    line_total=item_total,
                    custom_json=custom_json
                )
            else:
                product = Product.query.filter_by(
                  id=product_id,
                  is_active=True
                ).first()   

                if not product:
                    raise ValueError(f"Product {product_id} not found")
                rate = CurrencyRate.query.filter_by(currency_code=currency).first()
                conversion_rate = Decimal(str(rate.rate if rate else 1))

                unit_price = Decimal(str(product.price or 0)) * conversion_rate
                item_total = unit_price * Decimal(quantity)
                subtotal += item_total

                order_item = OrderItem(
                  order_id=order.id,
                  product_id=product.id,
                  agent_product_id=None,
                  quantity=quantity,
                  price=unit_price,
                  line_total=item_total,
                  custom_json=custom_json
                )
            db.session.add(order_item)
            




            
         # Minimum order and delivery charge are only applicable for delivery orders
        if area:
            minimum_order = Decimal(str(area.min_order_value or 0))
            if subtotal < minimum_order:
                decimals = 3 if currency == "KWD" else 2
                raise ValueError(
                    f"Minimum order value for {area.name} is {currency} "
                    f"{float(minimum_order):.{decimals}f}"
                )

            delivery_charge = Decimal(str(area.delivery_charge or 0))
        else:
            delivery_charge = Decimal("0.00")

        # ── Step 5: automatic agent discount (overrides any client value) ──
        discount_percent = Decimal(str(agent.default_discount or 0))
        discount_amount = (subtotal * discount_percent / Decimal("100")).quantize(Decimal("0.01"))

        grand_total = subtotal + delivery_charge - discount_amount
        if grand_total < 0:
            grand_total = Decimal("0.00")

        order.subtotal = subtotal
        order.delivery_charge = delivery_charge
        order.discount = discount_amount
        order.grand_total = grand_total
        order.total = grand_total

        log_order_status(
            order, None, "PENDING", agent.id,
            f"Order created by agent {agent.first_name} {agent.last_name} "
            f"(auto discount {discount_percent}%)"
        )

        db.session.commit()

    except ValueError as error:
        db.session.rollback()
        return jsonify({"error": str(error)}), 400

    except Exception as error:
        db.session.rollback()
        print("Agent create order error:", str(error))
        return jsonify({"error": "Unable to create order"}), 500

    # Include delivery_method in the response so frontend can display Pickup vs Delivery
    # resp = order.to_dict()
    # resp["delivery_method"] = delivery_method

    return jsonify({
        "message": "Order created successfully",
        # "order": resp
        "order": order.to_dict()
    }), 201
