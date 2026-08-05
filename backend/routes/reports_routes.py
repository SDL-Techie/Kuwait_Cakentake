from flask import Blueprint, request, jsonify, make_response
from flask_jwt_extended import jwt_required
from datetime import datetime, timedelta
from extensions import db
from models.order import Order
from models.user import User
from models.loyalty import LoyaltyLedger
from middleware.role import role_required
import csv
import io

reports_bp = Blueprint("reports", __name__)


def _date_range():
    start = request.args.get("start")
    end = request.args.get("end")
    start_dt = datetime.fromisoformat(start) if start else datetime.utcnow() - timedelta(days=30)
    end_dt = datetime.fromisoformat(end) if end else datetime.utcnow()
    return start_dt, end_dt


@reports_bp.route("/reports/orders", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def report_orders():
    start, end = _date_range()
    orders = Order.query.filter(Order.created_at.between(start, end)).all()
    return jsonify({
        "total": len(orders),
        "by_status": {
            s: sum(1 for o in orders if o.status == s)
            for s in ["PENDING", "ACCEPTED", "PROCESSING", "READY", "DELIVERED", "CANCELLED"]
        }
    }), 200


@reports_bp.route("/reports/sales", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def report_sales():
    start, end = _date_range()
    orders = Order.query.filter(
        Order.created_at.between(start, end),
        Order.status == "DELIVERED"
    ).all()
    return jsonify({
        "total_orders": len(orders),
        "total_revenue": sum(float(o.total) for o in orders),
        "average_order_value": (sum(float(o.total) for o in orders) / len(orders)) if orders else 0
    }), 200


@reports_bp.route("/reports/revenue", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def report_revenue():
    start, end = _date_range()
    from sqlalchemy import func
    results = db.session.query(
        func.date(Order.created_at).label("date"),
        func.sum(Order.total).label("revenue")
    ).filter(
        Order.created_at.between(start, end),
        Order.status == "DELIVERED"
    ).group_by(func.date(Order.created_at)).all()
    return jsonify({"revenue": [{"date": str(r[0]), "amount": float(r[1] or 0)} for r in results]}), 200


@reports_bp.route("/reports/delivery", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def report_delivery():
    start, end = _date_range()
    orders = Order.query.filter(Order.delivered_at.between(start, end)).all()
    return jsonify({
        "total_deliveries": len(orders),
        "on_time": len(orders)  # Extend with SLA tracking if needed
    }), 200


@reports_bp.route("/reports/loyalty", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def report_loyalty():
    from sqlalchemy import func
    earned = db.session.query(func.sum(LoyaltyLedger.points)).filter_by(transaction_type="EARN").scalar() or 0
    redeemed = db.session.query(func.sum(LoyaltyLedger.points)).filter_by(transaction_type="REDEEM").scalar() or 0
    return jsonify({"earned": earned, "redeemed": abs(redeemed), "outstanding": earned - abs(redeemed)}), 200


@reports_bp.route("/reports/inventory", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def report_inventory():
    from models.inventory import Inventory
    from services.inventory_service import get_low_stock, get_out_of_stock
    return jsonify({
        "low_stock_count": len(get_low_stock()),
        "out_of_stock_count": len(get_out_of_stock()),
        "total_items": Inventory.query.count()
    }), 200


@reports_bp.route("/reports/cash-flow", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def report_cash_flow():
    from models.misc import CashDrawerTransaction
    from sqlalchemy import func
    txns = CashDrawerTransaction.query.all()
    inflow = sum(float(t.amount) for t in txns if t.transaction_type in ["ADD", "DEPOSIT"])
    outflow = sum(float(t.amount) for t in txns if t.transaction_type == "WITHDRAW")
    return jsonify({"inflow": inflow, "outflow": outflow, "net": inflow - outflow}), 200


@reports_bp.route("/reports/expense", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def report_expense():
    from models.misc import Expense
    from sqlalchemy import func
    start, end = _date_range()
    total = db.session.query(func.sum(Expense.amount)).filter(
        Expense.expense_date.between(start, end)
    ).scalar() or 0
    return jsonify({"total_expense": float(total)}), 200


# ─── EXPORTS ─────────────────────────────────────────────────────────────────

def _csv_response(headers, rows, filename):
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(headers)
    writer.writerows(rows)
    response = make_response(output.getvalue())
    response.headers["Content-Type"] = "text/csv"
    response.headers["Content-Disposition"] = f"attachment; filename={filename}"
    return response


@reports_bp.route("/reports/orders/export", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def export_orders():
    orders = Order.query.all()
    rows = [(o.id, o.order_number, o.status, float(o.total), str(o.created_at)) for o in orders]
    return _csv_response(["ID", "Order Number", "Status", "Total", "Created At"], rows, "orders.csv")


@reports_bp.route("/reports/sales/export", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def export_sales():
    orders = Order.query.filter_by(status="DELIVERED").all()
    rows = [(o.id, o.order_number, float(o.total), str(o.delivered_at)) for o in orders]
    return _csv_response(["ID", "Order Number", "Total", "Delivered At"], rows, "sales.csv")


@reports_bp.route("/reports/customers/export", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def export_customers():
    customers = User.query.filter_by(role="USER").all()
    rows = [(c.id, c.first_name, c.last_name, c.email, c.phone_no, str(c.created_at)) for c in customers]
    return _csv_response(["ID", "First Name", "Last Name", "Email", "Phone", "Created At"], rows, "customers.csv")


@reports_bp.route("/reports/delivery/export", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def export_delivery():
    orders = Order.query.filter_by(status="DELIVERED").all()
    rows = [(o.id, o.order_number, o.driver_id, str(o.delivered_at)) for o in orders]
    return _csv_response(["ID", "Order Number", "Driver ID", "Delivered At"], rows, "delivery.csv")
