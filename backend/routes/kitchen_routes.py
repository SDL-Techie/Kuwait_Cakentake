from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from extensions import db
from models.order import Order
from models.user import User
from middleware.role import role_required
from services.order_history_service import log_order_status

kitchen_bp = Blueprint("kitchen", __name__)


# @kitchen_bp.route("/kitchen/orders/pending", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER", "KITCHEN_STAFF"])
# def kitchen_pending():
#     orders = Order.query.filter_by(status="ACCEPTED").order_by(Order.created_at).all()
#     return jsonify({"orders": [o.to_dict() for o in orders]}), 200


@kitchen_bp.route("/kitchen/orders/pending", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER", "KITCHEN_STAFF"])
def kitchen_pending():
    orders = Order.query.filter(
        Order.status == "ASSIGNED_TO_KITCHEN"
    ).order_by(Order.created_at).all()

    return jsonify({"orders": [o.to_dict() for o in orders]}), 200
        
@kitchen_bp.route("/kitchen/orders/processing", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER", "KITCHEN_STAFF"])
def kitchen_processing():
    #orders = Order.query.filter_by(status="PROCESSING").order_by(Order.created_at).all()
    orders = Order.query.filter_by(status="PREPARING").order_by(Order.created_at).all()
    return jsonify({"orders": [o.to_dict() for o in orders]}), 200


@kitchen_bp.route("/kitchen/orders/completed", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER", "KITCHEN_STAFF"])
def kitchen_completed():
    # orders = Order.query.filter_by(status="READY").order_by(Order.created_at.desc()).all()
    orders = Order.query.filter(
    Order.completed_by_kitchen_at.isnot(None)
    ).order_by(Order.completed_by_kitchen_at.desc()).all()
    return jsonify({"orders": [o.to_dict() for o in orders]}), 200

@kitchen_bp.route("/kitchen/<int:order_id>/start-processing", methods=["POST"])
@jwt_required()
@role_required(["KITCHEN_STAFF"])
def start_processing(order_id):

    order = Order.query.get_or_404(order_id)

    if order.status != "ASSIGNED_TO_KITCHEN":
        return jsonify({
            "error": "Order is not waiting for kitchen"
        }), 400

    current_user = User.query.get(get_jwt_identity())

    if order.kitchen_staff_id and order.kitchen_staff_id != current_user.id:
     return jsonify({
        "error": "This order is already taken by another kitchen staff."
     }), 400

    order.status = "PREPARING"
    order.kitchen_staff_id = current_user.id
    order.preparation_started_at = datetime.utcnow()
    order.preparation_started_by = current_user.id


    log_order_status(
        order,
        "ASSIGNED_TO_KITCHEN",
        "PREPARING",
        current_user.id,
        f"Preparation started by {current_user.first_name} {current_user.last_name}"
    )

    db.session.commit()

    return jsonify({
        "message": "Preparation started",
        "order": order.to_dict()
    }), 200

@kitchen_bp.route("/kitchen/assigned-orders", methods=["GET"])
@jwt_required()
@role_required(["KITCHEN_STAFF"])
def kitchen_assigned_orders():
    user_id = int(get_jwt_identity())
    # orders = Order.query.filter_by(kitchen_staff_id=user_id).filter(
    #     Order.status.in_(["ASSIGNED_TO_KITCHEN","PREPARING"])
    # ).all()

    orders = Order.query.filter(
    Order.status.in_(["ASSIGNED_TO_KITCHEN", "PREPARING"])
    ).all()
    return jsonify({"orders": [o.to_dict() for o in orders]}), 200


# @kitchen_bp.route("/kitchen/<int:order_id>/complete", methods=["POST"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER", "KITCHEN_STAFF"])
# def complete_kitchen(order_id):
#     order = Order.query.get_or_404(order_id)
#     if order.status != "PREPARING":
#         return jsonify({"error": "Order must be PROCESSING to mark complete"}), 400
#     order.status = "READY"
#     order.completed_by_kitchen_at = datetime.utcnow()
#     log_order_status(order.id, "READY", int(get_jwt_identity()))
#     db.session.commit()
#     return jsonify({"message": "Order marked as READY", "order": order.to_dict()}), 200


# @kitchen_bp.route("/kitchen/<int:order_id>/complete", methods=["POST"])
# @jwt_required()
# @role_required(["KITCHEN_STAFF"])
# def complete_kitchen(order_id):
#     order = Order.query.get_or_404(order_id)
#     current_user = User.query.get(get_jwt_identity())
#     if order.kitchen_staff_id != current_user.id:
#      return jsonify({
#         "error": "Only the kitchen staff who started this order can mark it ready."
#     }), 403
#     order = Order.query.get_or_404(order_id)

#     if order.status != "PREPARING":
#         return jsonify({
#             "error": "Order must be PREPARING"
#         }), 400

#     current_user = User.query.get(get_jwt_identity())

#     agent = User.query.filter_by(
#         role="DELIVERY_AGENT"
#     ).first()

#     if not agent:
#         return jsonify({
#             "error": "No delivery agent available"
#         }), 400

#     order.status = "ASSIGNED_TO_AGENT"

#     order.completed_by_kitchen_at = datetime.utcnow()

#     order.delivery_agent_id = agent.id
#     order.delivery_agent_assigned_by = current_user.id
#     order.delivery_agent_assigned_at = datetime.utcnow()

#     log_order_status(
#         order,
#         "PREPARING",
#         "ASSIGNED_TO_AGENT",
#         current_user.id,
#         f"Automatically assigned to delivery agent {agent.first_name} {agent.last_name}"
#     )

#     db.session.commit()

#     return jsonify({
#         "message": "Order ready and assigned to delivery agent",
#         "order": order.to_dict()
#     }), 200

# @kitchen_bp.route("/kitchen/<int:order_id>/complete", methods=["POST"])
# @jwt_required()
# @role_required(["KITCHEN_STAFF"])
# def complete_kitchen(order_id):

#     order = Order.query.get_or_404(order_id)

#     current_user = User.query.get(get_jwt_identity())

#     if order.kitchen_staff_id != current_user.id:
#         return jsonify({
#             "error": "Only the kitchen staff who started this order can mark it ready."
#         }), 403

#     if order.status != "PREPARING":
#         return jsonify({
#             "error": "Order must be PREPARING"
#         }), 400
    


@kitchen_bp.route("/kitchen/<int:order_id>/complete", methods=["POST"])
@jwt_required()
@role_required(["KITCHEN_STAFF"])
def complete_kitchen(order_id):

    order = Order.query.get_or_404(order_id)
    current_user = User.query.get(get_jwt_identity())

    # Only the kitchen staff who started preparation can complete it
    if order.preparation_started_by != current_user.id:
        return jsonify({
            "error": "Only the kitchen staff who started this order can mark it ready."
        }), 403

    if order.status != "PREPARING":
        return jsonify({
            "error": "Order must be PREPARING"
        }), 400

    old_status = order.status

    # stamp completion
    order.completed_by_kitchen_at = datetime.utcnow()

    # Try to auto-assign a delivery agent. Prefer ONLINE agents, fallback to any active agent.
    delivery_agent = User.query.filter_by(role="DELIVERY_AGENT", availability_status="ONLINE", is_active=True).order_by(User.id).first()
    if not delivery_agent:
        delivery_agent = User.query.filter_by(role="DELIVERY_AGENT", is_active=True).order_by(User.id).first()

    if not delivery_agent:
        # No agent available — leave as READY and log
        order.status = "READY"
        log_order_status(
            order,
            old_status,
            "READY",
            current_user.id,
            "Order marked READY — no delivery agent available for auto-assignment"
        )
        db.session.commit()
        return jsonify({
            "message": "Order marked as READY",
            "order": order.to_dict(),
            "note": "No delivery agent available for automatic assignment"
        }), 200

    # Assign to found delivery agent and move to ASSIGNED_TO_AGENT
    order.delivery_agent_id = delivery_agent.id
    order.delivery_agent_assigned_by = current_user.id
    order.delivery_agent_assigned_at = datetime.utcnow()
    order.status = "ASSIGNED_TO_AGENT"

    log_order_status(
        order,
        old_status,
        "ASSIGNED_TO_AGENT",
        current_user.id,
        f"Automatically assigned to delivery agent {delivery_agent.first_name} {delivery_agent.last_name}"
    )

    db.session.commit()

    return jsonify({
        "message": "Order ready and assigned to delivery agent",
        "order": order.to_dict()
    }), 200


@kitchen_bp.route("/kitchen/<int:order_id>/reassign", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def reassign_kitchen(order_id):
    data = request.get_json()
    order = Order.query.get_or_404(order_id)
    staff = User.query.filter_by(id=data["kitchen_staff_id"], role="KITCHEN_STAFF").first()
    if not staff:
        return jsonify({"error": "Kitchen staff not found"}), 404
    order.kitchen_staff_id = staff.id
    order.kitchen_assigned_by = int(get_jwt_identity())
    order.kitchen_assigned_at = datetime.utcnow()
    db.session.commit()
    return jsonify({"message": "Kitchen staff reassigned", "order": order.to_dict()}), 200


@kitchen_bp.route("/kitchen/<int:order_id>/details", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER", "KITCHEN_STAFF"])
def kitchen_order_details(order_id):
    order = Order.query.get_or_404(order_id)
    return jsonify({"order": order.to_dict()}), 200


def _kitchen_report(days):
    from sqlalchemy import func
    since = datetime.utcnow() - timedelta(days=days)
    orders = Order.query.filter(
        Order.status == "DELIVERED",
        Order.completed_by_kitchen_at >= since
    ).all()
    return jsonify({
        "period_days": days,
        "total_completed": len(orders),
        "orders": [o.to_dict() for o in orders]
    }), 200


@kitchen_bp.route("/kitchen/report/day", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER", "KITCHEN_STAFF"])
def kitchen_report_day():
    return _kitchen_report(1)


@kitchen_bp.route("/kitchen/report/week", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER", "KITCHEN_STAFF"])
def kitchen_report_week():
    return _kitchen_report(7)


@kitchen_bp.route("/kitchen/report/month", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER", "KITCHEN_STAFF"])
def kitchen_report_month():
    return _kitchen_report(30)



@kitchen_bp.route("/kitchen/my-completed-orders", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER", "KITCHEN_STAFF"])
def my_completed_orders():

    user_id = int(get_jwt_identity())

    orders = Order.query.filter(
        Order.completed_by_kitchen_at.isnot(None),
        Order.preparation_started_by == user_id
    ).order_by(Order.completed_by_kitchen_at.desc()).all()

    return jsonify({
        "orders": [order.to_dict() for order in orders]
    }), 200
