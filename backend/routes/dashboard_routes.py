from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from extensions import db
from models.order import Order
from models.user import User
from middleware.role import role_required
from models.misc import DriverSettlement
from sqlalchemy import func


dashboard_bp = Blueprint("dashboard", __name__)


def _order_stats(filters=None):
    query = Order.query
    if filters:
        query = query.filter_by(**filters)
    orders = query.all()
    return {
        "total": len(orders),
        "pending": sum(1 for o in orders if o.status == "PENDING"),
        "processing": sum(1 for o in orders if o.status == "PROCESSING"),
        "delivered": sum(1 for o in orders if o.status == "DELIVERED"),
        "cancelled": sum(1 for o in orders if o.status == "CANCELLED"),
        "revenue": sum(float(o.total) for o in orders if o.status == "DELIVERED")
    }


@dashboard_bp.route("/dashboard/owner", methods=["GET"])
@jwt_required()
@role_required(["ADMIN"])
def owner_dashboard():
    stats = _order_stats()
    customers = User.query.filter_by(role="USER").count()
    stats["total_customers"] = customers
    return jsonify(stats), 200


@dashboard_bp.route("/dashboard/owner/cards", methods=["GET"])
@jwt_required()
@role_required(["ADMIN"])
def owner_cards():
    today = datetime.utcnow().date()
    today_orders = Order.query.filter(db.func.date(Order.created_at) == today).all()
    return jsonify({
        "today_orders": len(today_orders),
        "today_revenue": sum(float(o.total) for o in today_orders if o.status == "DELIVERED"),
        "pending_orders": Order.query.filter_by(status="PENDING").count(),
        "total_customers": User.query.filter_by(role="USER").count()
    }), 200


@dashboard_bp.route("/dashboard/manager", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def manager_dashboard():
    return jsonify(_order_stats()), 200


@dashboard_bp.route("/dashboard/manager/cards", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def manager_cards():
    return jsonify({
        "pending": Order.query.filter_by(status="PENDING").count(),
        "processing": Order.query.filter_by(status="PROCESSING").count(),
        "ready": Order.query.filter_by(status="READY").count(),
        "out_for_delivery": Order.query.filter_by(status="OUT_FOR_DELIVERY").count()
    }), 200


@dashboard_bp.route("/dashboard/sales-agent/cards", methods=["GET"])
@jwt_required()
def sales_agent_cards():
    agent_id = int(get_jwt_identity())
    orders = Order.query.filter_by(created_by=agent_id).all()
    return jsonify({
        "total_orders": len(orders),
        "today": sum(1 for o in orders if o.created_at.date() == datetime.utcnow().date())
    }), 200


@dashboard_bp.route("/dashboard/sales-agent/<int:agent_id>", methods=["GET"])
@jwt_required()
def sales_agent_dashboard(agent_id):
    orders = Order.query.filter_by(created_by=agent_id).all()
    return jsonify({
        "agent_id": agent_id,
        "total_orders": len(orders),
        "total_revenue": sum(float(o.total) for o in orders if o.status == "DELIVERED")
    }), 200


@dashboard_bp.route("/dashboard/delivery-agent/<int:agent_id>", methods=["GET"])
@jwt_required()
def delivery_agent_dashboard(agent_id):
    orders = Order.query.filter_by(driver_id=agent_id).all()
    return jsonify({
        "agent_id": agent_id,
        "assigned": sum(1 for o in orders if o.status in ["READY", "OUT_FOR_DELIVERY"]),
        "delivered": sum(1 for o in orders if o.status == "DELIVERED")
    }), 200


@dashboard_bp.route("/dashboard/delivery-agent/cards", methods=["GET"])
@jwt_required()
def delivery_agent_cards():
    agent_id = int(get_jwt_identity())
    orders = Order.query.filter_by(driver_id=agent_id).all()
    return jsonify({
        "active": sum(1 for o in orders if o.status in ["READY", "OUT_FOR_DELIVERY"]),
        "delivered_today": sum(
            1 for o in orders
            if o.status == "DELIVERED" and o.delivered_at and o.delivered_at.date() == datetime.utcnow().date()
        )
    }), 200


@dashboard_bp.route("/dashboard/driver/<int:driver_id>", methods=["GET"])
@jwt_required()
def driver_dashboard(driver_id):
    orders = Order.query.filter_by(driver_id=driver_id).all()
    return jsonify({
        "driver_id": driver_id,
        "active": sum(1 for o in orders if o.status in ["READY", "OUT_FOR_DELIVERY"]),
        "delivered": sum(1 for o in orders if o.status == "DELIVERED")
    }), 200


@dashboard_bp.route("/dashboard/driver/cards", methods=["GET"])
@jwt_required()
def driver_cards():
    driver_id = int(get_jwt_identity())
    orders = Order.query.filter_by(driver_id=driver_id).all()
    return jsonify({
        "active": sum(1 for o in orders if o.status in ["READY", "OUT_FOR_DELIVERY"]),
        "completed": sum(1 for o in orders if o.status == "DELIVERED")
    }), 200


@dashboard_bp.route("/dashboard/driver-settlement", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def driver_settlement_dashboard():

    total_drivers = User.query.filter_by(role="DRIVER").count()

    pending_orders = Order.query.filter(
        Order.status == "DELIVERED",
        Order.is_driver_settled == False
    ).count()

    pending_amount = db.session.query(
        func.sum(Order.driver_amount)
    ).filter(
        Order.status == "DELIVERED",
        Order.is_driver_settled == False
    ).scalar() or 0

    total_paid = db.session.query(
        func.sum(DriverSettlement.amount)
    ).scalar() or 0

    today = datetime.utcnow().date()

    paid_today = db.session.query(
        func.sum(DriverSettlement.amount)
    ).filter(
        func.date(DriverSettlement.paid_at) == today
    ).scalar() or 0

    month_start = today.replace(day=1)

    paid_this_month = db.session.query(
        func.sum(DriverSettlement.amount)
    ).filter(
        DriverSettlement.paid_at >= month_start
    ).scalar() or 0

    pending_drivers = db.session.query(
        Order.driver_id
    ).filter(
        Order.status == "DELIVERED",
        Order.is_driver_settled == False
    ).distinct().count()

    return jsonify({
        "total_drivers": total_drivers,
        "pending_drivers": pending_drivers,
        "pending_orders": pending_orders,
        "pending_amount": float(pending_amount),
        "paid_today": float(paid_today),
        "paid_this_month": float(paid_this_month),
        "total_paid": float(total_paid)
    }), 200


@dashboard_bp.route("/dashboard/kitchen", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER", "KITCHEN_STAFF"])
def kitchen_dashboard():
    return jsonify({
        "pending": Order.query.filter_by(status="ACCEPTED").count(),
        "processing": Order.query.filter_by(status="PROCESSING").count(),
        "ready": Order.query.filter_by(status="READY").count()
    }), 200


@dashboard_bp.route("/dashboard/kitchen/cards", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER", "KITCHEN_STAFF"])
def kitchen_cards():
    return jsonify({
        "pending": Order.query.filter_by(status="ACCEPTED").count(),
        "in_progress": Order.query.filter_by(status="PROCESSING").count(),
        "completed": Order.query.filter_by(status="READY").count()
    }), 200


@dashboard_bp.route("/dashboard/customer/<int:customer_id>", methods=["GET"])
@jwt_required()
def customer_dashboard(customer_id):
    customer = User.query.get_or_404(customer_id)
    orders = Order.query.filter_by(user_id=customer_id).all()
    return jsonify({
        "customer": customer.to_dict(),
        "total_orders": len(orders),
        "loyalty_points": customer.loyalty_points or 0
    }), 200


@dashboard_bp.route("/dashboard/sales-chart", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def sales_chart():
    days = request.args.get("days", 30, type=int)
    since = datetime.utcnow() - timedelta(days=days)
    from sqlalchemy import func
    results = db.session.query(
        func.date(Order.created_at).label("date"),
        func.count(Order.id).label("orders"),
        func.sum(Order.total).label("revenue")
    ).filter(Order.created_at >= since).group_by(func.date(Order.created_at)).all()
    return jsonify({
        "chart": [{"date": str(r[0]), "orders": r[1], "revenue": float(r[2] or 0)} for r in results]
    }), 200


@dashboard_bp.route("/dashboard/order-chart", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def order_chart():
    from sqlalchemy import func
    results = db.session.query(
        Order.status, func.count(Order.id)
    ).group_by(Order.status).all()
    return jsonify({"chart": [{"status": r[0], "count": r[1]} for r in results]}), 200


@dashboard_bp.route("/dashboard/revenue-chart", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def revenue_chart():
    days = request.args.get("days", 30, type=int)
    since = datetime.utcnow() - timedelta(days=days)
    from sqlalchemy import func
    results = db.session.query(
        func.date(Order.created_at).label("date"),
        func.sum(Order.total).label("revenue")
    ).filter(Order.created_at >= since, Order.status == "DELIVERED").group_by(
        func.date(Order.created_at)
    ).all()
    return jsonify({"chart": [{"date": str(r[0]), "revenue": float(r[1] or 0)} for r in results]}), 200


@dashboard_bp.route("/dashboard/payment-chart", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def payment_chart():
    from sqlalchemy import func
    results = db.session.query(
        Order.payment_method, func.count(Order.id)
    ).group_by(Order.payment_method).all()
    return jsonify({"chart": [{"method": r[0], "count": r[1]} for r in results]}), 200


@dashboard_bp.route("/dashboard/summary", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def dashboard_summary():
    return jsonify({
        "orders": _order_stats(),
        "customers": User.query.filter_by(role="USER").count(),
        "staff": User.query.filter(User.role != "USER").count()
    }), 200


# ─── AGENT REPORTS ───────────────────────────────────────────────────────────

@dashboard_bp.route("/sales-agents/<int:agent_id>/orders", methods=["GET"])
@jwt_required()
def sales_agent_orders(agent_id):
    orders = Order.query.filter_by(created_by=agent_id).all()
    return jsonify({"orders": [o.to_dict() for o in orders]}), 200


@dashboard_bp.route("/sales-agents/<int:agent_id>/payments", methods=["GET"])
@jwt_required()
def sales_agent_payments(agent_id):
    orders = Order.query.filter_by(created_by=agent_id, payment_status="PAID").all()
    return jsonify({"payments": [{"order_id": o.id, "amount": float(o.total)} for o in orders]}), 200


@dashboard_bp.route("/sales-agents/<int:agent_id>/report", methods=["GET"])
@jwt_required()
def sales_agent_report(agent_id):
    orders = Order.query.filter_by(created_by=agent_id).all()
    return jsonify({
        "agent_id": agent_id,
        "total_orders": len(orders),
        "total_revenue": sum(float(o.total) for o in orders if o.status == "DELIVERED")
    }), 200