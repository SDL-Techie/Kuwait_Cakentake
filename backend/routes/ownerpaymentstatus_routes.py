from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db
from middleware.role import role_required
from models.user import User
from models.order import Order
from services.order_history_service import log_order_status

owner_payment_bp = Blueprint("owner_payment", __name__)

ROLE_OWNER_LIST = ["ADMIN", "SHOP_MANAGER"]


def get_current_user():
    user_id = get_jwt_identity()
    return User.query.get(int(user_id))


@owner_payment_bp.route("/owner/orders/payment-status", methods=["PATCH"])
@jwt_required()
@role_required(ROLE_OWNER_LIST)
def update_orders_payment_status():
    owner = get_current_user()
    data = request.get_json() or {}

    order_ids = data.get("order_ids")
    payment_status = str(data.get("payment_status") or "").strip().upper()

    if not isinstance(order_ids, list) or not order_ids:
        return jsonify({"error": "order_ids (non-empty list) is required"}), 400

    allowed_statuses = {"PENDING", "PAID"}
    if payment_status not in allowed_statuses:
        return jsonify({
            "error": "payment_status must be one of: " + ", ".join(sorted(allowed_statuses))
        }), 400

    orders = Order.query.filter(Order.id.in_(order_ids)).all()

    found_ids = {o.id for o in orders}
    missing_ids = [oid for oid in order_ids if oid not in found_ids]
    if missing_ids:
        return jsonify({"error": f"Orders not found: {missing_ids}"}), 404

    updated_ids = []

    try:
        for order in orders:
            previous_payment_status = order.payment_status
            order.payment_status = payment_status
            updated_ids.append(order.id)

            log_order_status(
                order,
                order.status,
                order.status,
                owner.id,
                f"Payment status changed {previous_payment_status} -> {payment_status} "
                f"by {owner.first_name} {owner.last_name}"
            )

        db.session.commit()

    except Exception as error:
        db.session.rollback()
        return jsonify({"error": f"Unable to update payment status: {str(error)}"}), 500

    return jsonify({
        "message": "Payment status updated",
        "updated_order_ids": updated_ids,
        "payment_status": payment_status
    }), 200