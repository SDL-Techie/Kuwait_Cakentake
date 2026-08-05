from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from datetime import datetime, timedelta
from sqlalchemy import func
from extensions import db
from models.user import User
from models.address import Address
from models.order import Order
from models.loyalty import LoyaltyLedger
from middleware.role import role_required

customers_bp = Blueprint("customers", __name__)


@customers_bp.route("/customers/dashboard", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER", "SALES_AGENT"])
def customers_dashboard():
    today = datetime.utcnow().date()
    month_start = today.replace(day=1)
    since_30 = datetime.utcnow() - timedelta(days=30)

    total_customers = User.query.filter_by(role="USER").count()

    new_today = User.query.filter(
        User.role == "USER", func.date(User.created_at) == today
    ).count()

    new_this_month = User.query.filter(
        User.role == "USER", User.created_at >= month_start
    ).count()

    total_loyalty_points = db.session.query(func.sum(User.loyalty_points)).filter_by(role="USER").scalar() or 0

    spender_rows = db.session.query(
        Order.user_id,
        func.count(Order.id).label("orders"),
        func.sum(Order.total).label("total_spent")
    ).group_by(Order.user_id).order_by(func.sum(Order.total).desc()).limit(5).all()

    top_customers = []
    for r in spender_rows:
        customer = User.query.get(r[0])
        top_customers.append({
            "customer_id": r[0],
            "name": f"{customer.first_name} {customer.last_name}" if customer else "Unknown",
            "orders": r[1],
            "total_spent": float(r[2] or 0)
        })

    chart_rows = db.session.query(
        func.date(User.created_at).label("date"),
        func.count(User.id).label("count")
    ).filter(User.role == "USER", User.created_at >= since_30).group_by(
        func.date(User.created_at)
    ).order_by(func.date(User.created_at)).all()

    recent = User.query.filter_by(role="USER").order_by(User.created_at.desc()).limit(5).all()

    return jsonify({
        "total_customers": total_customers,
        "new_today": new_today,
        "new_this_month": new_this_month,
        "total_loyalty_points_issued": int(total_loyalty_points),
        "top_customers": top_customers,
        "chart": [{"date": str(r[0]), "new_customers": r[1]} for r in chart_rows],
        "recent_customers": [c.to_dict() for c in recent]
    }), 200


@customers_bp.route("/customers", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER", "SALES_AGENT"])
def get_customers():
    customers = User.query.filter_by(role="USER").all()
    return jsonify({"customers": [u.to_dict() for u in customers]}), 200


@customers_bp.route("/customers/<int:customer_id>", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER", "SALES_AGENT"])
def get_customer(customer_id):
    customer = User.query.filter_by(id=customer_id, role="USER").first_or_404()
    return jsonify({"customer": customer.to_dict()}), 200


@customers_bp.route("/customers", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER", "SALES_AGENT"])
def create_customer():
    data = request.get_json()
    if User.query.filter_by(email=data.get("email")).first():
        return jsonify({"error": "Email already exists"}), 400
    if User.query.filter_by(phone_no=data.get("phone_no")).first():
        return jsonify({"error": "Phone already exists"}), 400
    user = User(
        first_name=data["first_name"],
        last_name=data["last_name"],
        phone_no=data["phone_no"],
        email=data["email"],
        role="USER"
    )
    user.set_password(data.get("password", data["phone_no"]))
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "Customer created", "customer": user.to_dict()}), 201


@customers_bp.route("/customers/<int:customer_id>", methods=["PUT"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER", "SALES_AGENT"])
def update_customer(customer_id):
    customer = User.query.filter_by(id=customer_id, role="USER").first_or_404()
    data = request.get_json()
    for field in ["first_name", "last_name", "phone_no", "email"]:
        if field in data:
            setattr(customer, field, data[field])
    db.session.commit()
    return jsonify({"message": "Customer updated", "customer": customer.to_dict()}), 200


@customers_bp.route("/customers/<int:customer_id>/orders", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER", "SALES_AGENT"])
def get_customer_orders(customer_id):
    orders = Order.query.filter_by(user_id=customer_id).order_by(Order.created_at.desc()).all()
    return jsonify({"orders": [o.to_dict() for o in orders]}), 200


@customers_bp.route("/customers/<int:customer_id>/order-summary", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER", "SALES_AGENT"])
def get_customer_order_summary(customer_id):
    orders = Order.query.filter_by(user_id=customer_id).all()
    total_spent = sum(float(o.total) for o in orders)
    return jsonify({
        "customer_id": customer_id,
        "total_orders": len(orders),
        "total_spent": total_spent,
        "completed_orders": sum(1 for o in orders if o.status == "DELIVERED"),
        "pending_orders": sum(1 for o in orders if o.status not in ["DELIVERED", "CANCELLED"])
    }), 200


@customers_bp.route("/customers/<int:customer_id>/addresses", methods=["GET"])
@jwt_required()
def get_customer_addresses(customer_id):
    addresses = Address.query.filter_by(user_id=customer_id).all()
    return jsonify({"addresses": [a.to_dict() for a in addresses]}), 200


@customers_bp.route("/customers/<int:customer_id>/addresses", methods=["POST"])
@jwt_required()
def add_customer_address(customer_id):
    data = request.get_json()
    address = Address(
        user_id=customer_id,
        street=data.get("street"),
        city=data.get("city"),
        state=data.get("state"),
        pincode=data.get("pincode"),
        country=data.get("country", "India")
    )
    db.session.add(address)
    db.session.commit()
    return jsonify({"message": "Address added", "address": address.to_dict()}), 201


@customers_bp.route("/customers/<int:customer_id>/loyalty-points", methods=["GET"])
@jwt_required()
def get_customer_loyalty_points(customer_id):
    customer = User.query.get_or_404(customer_id)
    return jsonify({
        "customer_id": customer_id,
        "loyalty_points": customer.loyalty_points or 0
    }), 200


@customers_bp.route("/customers/<int:customer_id>/loyalty-history", methods=["GET"])
@jwt_required()
def get_customer_loyalty_history(customer_id):
    history = LoyaltyLedger.query.filter_by(customer_id=customer_id).order_by(
        LoyaltyLedger.created_at.desc()
    ).all()
    return jsonify({"history": [h.to_dict() for h in history]}), 200
