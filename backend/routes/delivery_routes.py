from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from extensions import db
from models.order import Order
from models.user import User
from middleware.role import role_required
from services.order_history_service import log_order_status

delivery_bp = Blueprint("delivery", __name__)


# ─── Orders visible to the delivery agent ────────────────────────────────────

# @delivery_bp.route("/delivery/pending", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER", "DELIVERY_AGENT"])
# def delivery_pending():
#     """
#     Orders that are READY (kitchen done, awaiting agent assignment).
#     Admin / shop manager see all; delivery agent sees only their own.
#     """
#     current_user = User.query.get(int(get_jwt_identity()))

#     orders = Order.query.filter(
#         Order.status == "READY"
#     ).order_by(Order.created_at.desc()).all()

#     return jsonify({"orders": [o.to_dict() for o in orders]}), 200


# @delivery_bp.route("/delivery/pending", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER", "DELIVERY_AGENT"])
# def delivery_pending():

#     current_user = User.query.get(int(get_jwt_identity()))

#     if current_user.role == "DELIVERY_AGENT":
#         orders = Order.query.filter(
#             Order.delivery_agent_id == current_user.id,
#             Order.status == "ASSIGNED_TO_AGENT"
#         ).order_by(Order.created_at.desc()).all()
#     else:
#         orders = Order.query.filter(
#             Order.status == "ASSIGNED_TO_AGENT"
#         ).order_by(Order.created_at.desc()).all()

#     return jsonify({"orders": [o.to_dict() for o in orders]}), 200

@delivery_bp.route("/delivery/pending", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER", "DELIVERY_AGENT"])
def delivery_pending():

    orders = Order.query.filter(
        Order.status == "ASSIGNED_TO_AGENT"
    ).order_by(Order.created_at.desc()).all()

    return jsonify({
        "orders": [o.to_dict() for o in orders]
    }), 200
# @delivery_bp.route("/delivery/assigned", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER", "DELIVERY_AGENT"])
# def delivery_assigned():
#     """
#     Orders in ASSIGNED_TO_AGENT state (agent assigned, driver not yet picked).
#     """
#     current_user = User.query.get(int(get_jwt_identity()))

#     print("Logged in user ID:", current_user.id)
#     print("Logged in role:", current_user.role)

#     if current_user.role == "DELIVERY_AGENT":
#         orders = Order.query.filter(
#             Order.delivery_agent_id == current_user.id,
#             Order.status == "ASSIGNED_TO_AGENT"
#         ).order_by(Order.created_at.desc()).all()
#     else:
#         orders = Order.query.filter(
#             Order.status == "ASSIGNED_TO_AGENT"
#         ).order_by(Order.created_at.desc()).all()

#     return jsonify({"orders": [o.to_dict() for o in orders]}), 200

@delivery_bp.route("/delivery/assigned", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER", "DELIVERY_AGENT"])
def delivery_assigned():

    orders = Order.query.filter(
        Order.status == "ASSIGNED_TO_AGENT"
    ).order_by(Order.created_at.desc()).all()

    return jsonify({
        "orders": [o.to_dict() for o in orders]
    }), 200

@delivery_bp.route("/delivery/ready-for-pickup", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER", "DELIVERY_AGENT"])
def delivery_ready():
    """
    Orders where a driver has been picked by this agent but not yet accepted.
    Also includes OUT_FOR_DELIVERY (driver is en route).
    """
    current_user = User.query.get(int(get_jwt_identity()))

    statuses = ["ASSIGNED_TO_DRIVER", "DRIVER_ACCEPTED", "OUT_FOR_DELIVERY"]

    if current_user.role == "DELIVERY_AGENT":
        orders = Order.query.filter(
            Order.delivery_agent_id == current_user.id,
            Order.status.in_(statuses)
        ).order_by(Order.created_at.desc()).all()
    else:
        orders = Order.query.filter(
            Order.status.in_(statuses)
        ).order_by(Order.created_at.desc()).all()

    return jsonify({"orders": [o.to_dict() for o in orders]}), 200


@delivery_bp.route("/delivery/delivered", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER", "DELIVERY_AGENT"])
def delivery_delivered():
    """
    Orders fully confirmed as DELIVERED (delivery agent confirmed).
    """
    current_user = User.query.get(int(get_jwt_identity()))

    if current_user.role == "DELIVERY_AGENT":
        orders = Order.query.filter(
            Order.delivery_agent_id == current_user.id,
            Order.status == "DELIVERED"
        ).order_by(Order.delivered_at.desc()).all()
    else:
        orders = Order.query.filter(
            Order.status == "DELIVERED"
        ).order_by(Order.delivered_at.desc()).all()

    return jsonify({"orders": [o.to_dict() for o in orders]}), 200


@delivery_bp.route("/delivery/proof-pending", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER", "DELIVERY_AGENT"])
def delivery_proof_pending():
    """
    Orders where driver has submitted proof and delivery agent needs to confirm.
    Status: DELIVERY_SUBMITTED
    """
    current_user = User.query.get(int(get_jwt_identity()))

    if current_user.role == "DELIVERY_AGENT":
        orders = Order.query.filter(
            Order.delivery_agent_id == current_user.id,
            Order.status == "DELIVERY_SUBMITTED"
        ).order_by(Order.created_at.desc()).all()
    else:
        orders = Order.query.filter(
            Order.status == "DELIVERY_SUBMITTED"
        ).order_by(Order.created_at.desc()).all()

    return jsonify({"orders": [o.to_dict() for o in orders]}), 200


# ─── Delivery agent dashboard ────────────────────────────────────────────────

@delivery_bp.route("/delivery-agents/<int:agent_id>/dashboard", methods=["GET"])
@jwt_required()
def agent_dashboard(agent_id):
    agent = User.query.get_or_404(agent_id)
    orders = Order.query.filter_by(delivery_agent_id=agent_id).all()

    return jsonify({
        "agent": agent.to_dict(),
        "total": len(orders),
        "delivered": sum(1 for o in orders if o.status == "DELIVERED"),
        "active": sum(
            1 for o in orders
            if o.status in [
                "ASSIGNED_TO_AGENT", "ASSIGNED_TO_DRIVER",
                "DRIVER_ACCEPTED", "OUT_FOR_DELIVERY", "DELIVERY_SUBMITTED"
            ]
        ),
        "pending_confirmation": sum(1 for o in orders if o.status == "DELIVERY_SUBMITTED"),
    }), 200


@delivery_bp.route("/delivery-agents/<int:agent_id>/orders", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER", "DELIVERY_AGENT"])
def agent_orders(agent_id):
    orders = Order.query.filter_by(
        delivery_agent_id=agent_id
    ).order_by(Order.created_at.desc()).all()
    return jsonify({"orders": [o.to_dict() for o in orders]}), 200