# from flask import Blueprint, request, jsonify
# from flask_jwt_extended import jwt_required, get_jwt_identity
# from datetime import datetime
# from extensions import db
# from models.user import User
# from models.order import Order
# from models.misc import DriverSettlement
# from middleware.role import role_required

# driver_bp = Blueprint("driver", __name__)


# # ─── Helpers ──────────────────────────────────────────────────────────────────

# def _settlement_dict(s: DriverSettlement) -> dict:
#     """Full serialisation of a DriverSettlement (extends model's to_dict)."""
#     return {
#         "id": s.id,
#         "driver_id": s.driver_id,
#         "amount": float(s.amount),
#         "orders_count": s.orders_count or 0,
#         "period_start": s.period_start.isoformat() if s.period_start else None,
#         "period_end": s.period_end.isoformat() if s.period_end else None,
#         "status": s.status,
#         "paid_at": s.paid_at.isoformat() if s.paid_at else None,
#         "paid_by": s.paid_by,
#         "notes": s.notes,
#         "payment_source": s.payment_source or "CASH",
#         "reference": s.reference,
#         "created_at": s.created_at.isoformat() if s.created_at else None,
#         "driver": {
#             "id": s.driver.id,
#             "first_name": s.driver.first_name,
#             "last_name": s.driver.last_name,
#             "phone_no": s.driver.phone_no,
#         } if s.driver else None,
#     }


# # ─── Driver lists (admin / agent) ─────────────────────────────────────────────

# @driver_bp.route("/drivers", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER", "DELIVERY_AGENT"])
# def get_drivers():
#     """All users with role=DRIVER."""
#     drivers = User.query.filter_by(role="DRIVER").all()
#     return jsonify({"drivers": [d.to_dict() for d in drivers]}), 200


# @driver_bp.route("/drivers/available", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER", "DELIVERY_AGENT"])
# def get_available_drivers():
#     """
#     Drivers who have no currently active order.
#     Active = ASSIGNED_TO_DRIVER | DRIVER_ACCEPTED | OUT_FOR_DELIVERY | DELIVERY_SUBMITTED.
#     """
#     busy_driver_ids = db.session.query(Order.driver_id).filter(
#         Order.status.in_([
#             "ASSIGNED_TO_DRIVER", "DRIVER_ACCEPTED",
#             "OUT_FOR_DELIVERY", "DELIVERY_SUBMITTED",
#         ]),
#         Order.driver_id.isnot(None),
#     ).subquery()

#     drivers = User.query.filter_by(role="DRIVER").filter(
#         ~User.id.in_(busy_driver_ids)
#     ).all()
#     return jsonify({"drivers": [d.to_dict() for d in drivers]}), 200


# # ─── Driver dashboard ──────────────────────────────────────────────────────────

# @driver_bp.route("/drivers/<int:driver_id>/dashboard", methods=["GET"])
# @jwt_required()
# def driver_dashboard(driver_id):
#     """Summary stats for a driver's dashboard header."""
#     driver = User.query.get_or_404(driver_id)
#     orders = Order.query.filter_by(driver_id=driver_id).all()

#     pending_settlements = DriverSettlement.query.filter_by(
#         driver_id=driver_id, status="PENDING"
#     ).all()
#     paid_settlements = DriverSettlement.query.filter_by(
#         driver_id=driver_id, status="PAID"
#     ).all()

#     pending_amount = sum(float(s.amount) for s in pending_settlements)
#     total_earned   = sum(float(s.amount) for s in paid_settlements)

#     return jsonify({
#         "driver": driver.to_dict(),
#         "total_orders": len(orders),
#         "delivered": sum(1 for o in orders if o.status == "DELIVERED"),
#         "active": sum(
#             1 for o in orders
#             if o.status in [
#                 "ASSIGNED_TO_DRIVER", "DRIVER_ACCEPTED",
#                 "OUT_FOR_DELIVERY", "DELIVERY_SUBMITTED",
#             ]
#         ),
#         "pending_amount": pending_amount,
#         "total_earned": total_earned,
#         "rating": float(driver.rating or 0),
#     }), 200


# # ─── Driver order lists ────────────────────────────────────────────────────────

# @driver_bp.route("/drivers/<int:driver_id>/assigned", methods=["GET"])
# @jwt_required()
# def driver_assigned(driver_id):
#     """
#     Active orders assigned to this driver.
#     Statuses: ASSIGNED_TO_DRIVER | DRIVER_ACCEPTED | OUT_FOR_DELIVERY | DELIVERY_SUBMITTED.
#     """
#     orders = Order.query.filter(
#         Order.driver_id == driver_id,
#         Order.status.in_([
#             "ASSIGNED_TO_DRIVER", "DRIVER_ACCEPTED",
#             "OUT_FOR_DELIVERY", "DELIVERY_SUBMITTED",
#         ]),
#     ).order_by(Order.created_at.desc()).all()
#     return jsonify({"orders": [o.to_dict() for o in orders]}), 200


# @driver_bp.route("/drivers/<int:driver_id>/completed", methods=["GET"])
# @jwt_required()
# def driver_completed(driver_id):
#     """Delivered orders completed by this driver."""
#     orders = Order.query.filter_by(
#         driver_id=driver_id, status="DELIVERED"
#     ).order_by(Order.delivered_at.desc()).all()
#     return jsonify({"orders": [o.to_dict() for o in orders]}), 200


# # ─── Driver availability status ────────────────────────────────────────────────

# # @driver_bp.route("/drivers/<int:driver_id>/status", methods=["POST"])
# # @jwt_required()
# # @role_required(["DRIVER", "ADMIN"])
# # def update_driver_status(driver_id):
# #     """
# #     POST { "status": "ONLINE" | "BUSY" | "OFFLINE" }
# #     Updates User.availability_status.
# #     """
# #     data       = request.get_json() or {}
# #     driver     = User.query.get_or_404(driver_id)
# #     new_status = (data.get("status") or "OFFLINE").upper()

# #     if new_status not in ("ONLINE", "BUSY", "OFFLINE"):
# #         return jsonify({"error": "status must be ONLINE, BUSY, or OFFLINE"}), 400

# #     driver.availability_status = new_status
# #     db.session.commit()

# #     return jsonify({
# #         "message": "Status updated",
# #         "driver_id": driver_id,
# #         "status": new_status,
# #     }), 200


# # ─── Driver report ─────────────────────────────────────────────────────────────

# @driver_bp.route("/drivers/<int:driver_id>/report", methods=["GET"])
# @jwt_required()
# def driver_report(driver_id):
#     orders = Order.query.filter_by(driver_id=driver_id).all()
#     return jsonify({
#         "driver_id": driver_id,
#         "total": len(orders),
#         "delivered":   sum(1 for o in orders if o.status == "DELIVERED"),
#         "cancelled":   sum(1 for o in orders if o.status == "CANCELLED"),
#         "in_progress": sum(
#             1 for o in orders if o.status in [
#                 "ASSIGNED_TO_DRIVER", "DRIVER_ACCEPTED",
#                 "OUT_FOR_DELIVERY", "DELIVERY_SUBMITTED",
#             ]
#         ),
#     }), 200


# # ─── Unsettled delivered orders ────────────────────────────────────────────────

# # @driver_bp.route("/drivers/<int:driver_id>/unsettled-orders", methods=["GET"])
# # @jwt_required()
# # def get_unsettled_orders(driver_id):
# #     """
# #     Orders with status=DELIVERED that have not been included in any settlement yet.
# #     Used by admin to build a settlement batch, and by driver to see what's pending.
# #     """
# #     orders = Order.query.filter_by(
# #         driver_id=driver_id,
# #         status="DELIVERED",
# #         is_driver_settled=False,
# #     ).order_by(Order.delivered_at.desc()).all()

# #     total_delivery_charges = sum(float(o.delivery_charge or 0) for o in orders)

# #     return jsonify({
# #         "orders": [o.to_dict() for o in orders],
# #         "count": len(orders),
# #         "total_delivery_charges": total_delivery_charges,
# #     }), 200


# # ─── Settlement routes ─────────────────────────────────────────────────────────

# @driver_bp.route("/drivers/<int:driver_id>/settlements", methods=["GET"])
# @jwt_required()
# def get_driver_settlements(driver_id):
#     """Driver views their own settlement history with aggregate totals."""
#     settlements = DriverSettlement.query.filter_by(
#         driver_id=driver_id
#     ).order_by(DriverSettlement.created_at.desc()).all()

#     total_pending    = sum(float(s.amount) for s in settlements if s.status == "PENDING")
#     total_paid       = sum(float(s.amount) for s in settlements if s.status == "PAID")
#     orders_settled   = sum((s.orders_count or 0) for s in settlements if s.status == "PAID")

#     return jsonify({
#         "settlements": [_settlement_dict(s) for s in settlements],
#         "total_pending": total_pending,
#         "total_paid": total_paid,
#         "orders_settled": orders_settled,
#     }), 200


# # @driver_bp.route("/driver-settlements", methods=["GET"])
# # @jwt_required()
# # @role_required(["ADMIN", "SHOP_MANAGER"])
# # def get_all_settlements():
# #     """Admin / shop manager views all settlements, optionally filtered."""
# #     driver_id_filter = request.args.get("driver_id", type=int)
# #     status_filter    = request.args.get("status")

# #     query = DriverSettlement.query
# #     if driver_id_filter:
# #         query = query.filter_by(driver_id=driver_id_filter)
# #     if status_filter:
# #         query = query.filter_by(status=status_filter.upper())

# #     settlements = query.order_by(DriverSettlement.created_at.desc()).all()
# #     return jsonify({
# #         "settlements": [_settlement_dict(s) for s in settlements],
# #         "count": len(settlements),
# #     }), 200


# # @driver_bp.route("/driver-settlements", methods=["POST"])
# # @jwt_required()
# # @role_required(["ADMIN", "SHOP_MANAGER"])
# # def create_settlement():
# #     """
# #     Admin creates a settlement — assigns a pay amount to a driver
# #     for a batch of delivered orders.

# #     Body:
# #     {
# #         "driver_id": int,
# #         "amount": float,                  # total amount to pay the driver
# #         "order_ids": [int, ...],          # optional — orders to mark settled
# #         "orders_count": int,              # used when order_ids is omitted
# #         "period_start": "ISO datetime",   # optional
# #         "period_end":   "ISO datetime",   # optional
# #         "notes": str,
# #         "payment_source": "CASH"|"BANK",
# #         "reference": str
# #     }
# #     """
# #     data = request.get_json() or {}

# #     driver_id = data.get("driver_id")
# #     amount    = data.get("amount")

# #     if not driver_id or amount is None:
# #         return jsonify({"error": "driver_id and amount are required"}), 400

# #     driver = User.query.get(driver_id)
# #     if not driver or driver.role != "DRIVER":
# #         return jsonify({"error": "Driver not found"}), 404

# #     order_ids    = data.get("order_ids") or []
# #     orders_count = len(order_ids) if order_ids else int(data.get("orders_count", 0))

# #     settlement = DriverSettlement(
# #         driver_id      = driver_id,
# #         amount         = float(amount),
# #         orders_count   = orders_count,
# #         period_start   = (
# #             datetime.fromisoformat(data["period_start"])
# #             if data.get("period_start") else None
# #         ),
# #         period_end     = (
# #             datetime.fromisoformat(data["period_end"])
# #             if data.get("period_end") else None
# #         ),
# #         notes          = data.get("notes"),
# #         payment_source = data.get("payment_source", "CASH"),
# #         reference      = data.get("reference"),
# #         status         = "PENDING",
# #     )

# #     db.session.add(settlement)
# #     db.session.flush()  # populate settlement.id before linking orders

# #     # Mark specified orders as settled and link them to this settlement
# #     for oid in order_ids:
# #         order = Order.query.get(oid)
# #         if order and order.driver_id == driver_id and order.status == "DELIVERED":
# #             order.is_driver_settled    = True
# #             order.driver_settlement_id = settlement.id

# #     db.session.commit()

# #     return jsonify({
# #         "message": "Settlement created",
# #         "settlement": _settlement_dict(settlement),
# #     }), 201


# # @driver_bp.route("/driver-settlements/<int:settlement_id>/pay", methods=["POST"])
# # @jwt_required()
# # @role_required(["ADMIN", "SHOP_MANAGER"])
# # def mark_settlement_paid(settlement_id):
# #     """
# #     Owner / shop manager pays the driver — marks settlement as PAID.
# #     Body: { "payment_source": "CASH"|"BANK", "reference": str }
# #     """
# #     data       = request.get_json() or {}
# #     settlement = DriverSettlement.query.get_or_404(settlement_id)

# #     if settlement.status == "PAID":
# #         return jsonify({"error": "Settlement is already paid"}), 400

# #     settlement.status         = "PAID"
# #     settlement.paid_at        = datetime.utcnow()
# #     settlement.paid_by        = int(get_jwt_identity())
# #     if data.get("payment_source"):
# #         settlement.payment_source = data["payment_source"]
# #     if data.get("reference"):
# #         settlement.reference      = data["reference"]

# #     db.session.commit()

# #     return jsonify({
# #         "message": "Settlement marked as paid",
# #         "settlement": _settlement_dict(settlement),
# #     }), 200


# @driver_bp.route("/driver-settlements/<int:settlement_id>/pay", methods=["POST"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def mark_settlement_paid(settlement_id):
#     """
#     Owner / shop manager pays the driver — marks settlement as PAID.
#     Body: { "payment_source": "CASH"|"BANK", "reference": str }
#     """
#     data       = request.get_json() or {}
#     settlement = DriverSettlement.query.get_or_404(settlement_id)

#     if settlement.status == "PAID":
#         return jsonify({"error": "Settlement is already paid"}), 400

#     settlement.status  = "PAID"
#     settlement.paid_at = datetime.utcnow()

#     # Defensive: don't let identity parsing crash the whole request
#     # before commit() runs.
#     identity = get_jwt_identity()
#     try:
#         settlement.paid_by = int(identity)
#     except (TypeError, ValueError):
#         settlement.paid_by = None

#     if data.get("payment_source"):
#         settlement.payment_source = data["payment_source"]
#     if data.get("reference"):
#         settlement.reference = data["reference"]

#     # Also flip linked orders to settled, since the Delivered Orders
#     # tab reads is_driver_settled, not settlement.status.
#     orders = Order.query.filter_by(driver_settlement_id=settlement.id).all()
#     for order in orders:
#         order.is_driver_settled = True

#     db.session.commit()

#     return jsonify({
#         "message": "Settlement marked as paid",
#         "settlement": _settlement_dict(settlement),
#     }), 200

# # @driver_bp.route("/driver-settlements/<int:settlement_id>", methods=["GET"])
# # @jwt_required()
# # def get_settlement_detail(settlement_id):
# #     """Retrieve a settlement with all linked orders."""
# #     settlement = DriverSettlement.query.get_or_404(settlement_id)
# #     orders     = Order.query.filter_by(driver_settlement_id=settlement_id).all()
# #     result     = _settlement_dict(settlement)
# #     result["orders"] = [o.to_dict() for o in orders]
# #     return jsonify({"settlement": result}), 200


# @driver_bp.route("/driver-settlements", methods=["POST"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def create_driver_settlement():

#     data = request.get_json() or {}

#     driver_id = data.get("driver_id")
#     order_ids = data.get("order_ids", [])
#     amount = data.get("amount")
#     notes = data.get("notes")

#     if not driver_id:
#         return jsonify({"error": "driver_id is required"}), 400

#     # if not order_ids:
#     #     return jsonify({"error": "order_ids is required"}), 400

#     if amount is None:
#         return jsonify({"error": "amount is required"}), 400

#     driver = User.query.filter_by(
#         id=driver_id,
#         role="DRIVER"
#     ).first()

#     if not driver:
#         return jsonify({"error": "Driver not found"}), 404

#     settlement = DriverSettlement(
#         driver_id=driver.id,
#         amount=amount,
#         notes=notes,
#         status="PENDING",
#         # created_by=int(get_jwt_identity())
#     )

#     db.session.add(settlement)
#     db.session.flush()

#     # orders = Order.query.filter(
#     #     Order.id.in_(order_ids),
#     #     Order.driver_id == driver.id,
#     #     Order.status == "DELIVERED",
#     #     Order.driver_settlement_id.is_(None)
#     # ).all()

#     # if not orders:
#     #     return jsonify({
#     #         "error": "No eligible delivered orders found"
#     #     }), 400

#     # for order in orders:
#     #     order.driver_settlement_id = settlement.id

#     if order_ids:
#      orders = Order.query.filter(
#         Order.id.in_(order_ids),
#         Order.driver_id == driver.id,
#         Order.status == "DELIVERED",
#         Order.driver_settlement_id.is_(None)
#     ).all()

#     for order in orders:
#         order.driver_settlement_id = settlement.id

#     db.session.commit()

#     return jsonify({
#         "message": "Driver settlement created successfully",
#         "settlement": _settlement_dict(settlement)
#     }), 201



# @driver_bp.route("/driver-settlements/driver/<int:driver_id>", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def get_settlements_by_driver(driver_id):

#     settlements = DriverSettlement.query.filter_by(
#         driver_id=driver_id
#     ).order_by(
#         DriverSettlement.created_at.desc()
#     ).all()

#     return jsonify({
#         "settlements": [_settlement_dict(s) for s in settlements]
#     }), 200


# @driver_bp.route("/driver-settlements", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def get_all_driver_settlements():

#     driver_id = request.args.get("driver_id", type=int)
#     status = request.args.get("status")

#     query = DriverSettlement.query

#     if driver_id:
#         query = query.filter_by(driver_id=driver_id)

#     if status:
#         query = query.filter_by(status=status.upper())

#     settlements = query.order_by(
#         DriverSettlement.created_at.desc()
#     ).all()

#     return jsonify({
#         "settlements": [
#             _settlement_dict(s)
#             for s in settlements
#         ]
#     }), 200

# @driver_bp.route("/drivers/<int:driver_id>/unsettled-orders", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def get_driver_unsettled_orders(driver_id):

#     orders = Order.query.filter(
#         Order.driver_id == driver_id,
#         Order.status == "DELIVERED",
#         Order.driver_settlement_id.is_(None)
#     ).order_by(Order.delivered_at.desc()).all()

#     return jsonify({
#         "orders": [
#             {
#                 "id": order.id,
#                 "order_number": order.order_number,
#                 "customer_name": f"{order.customer.first_name} {order.customer.last_name}",
#                 "grand_total": float(order.grand_total),
#                 "delivered_at": order.delivered_at,
#             }
#             for order in orders
#         ]
#     }), 200

# @driver_bp.route("/driver-settlements/<int:settlement_id>", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def get_driver_settlement(settlement_id):

#     settlement = DriverSettlement.query.get_or_404(settlement_id)

#     orders = Order.query.filter_by(
#         driver_settlement_id=settlement.id
#     ).all()

#     return jsonify({
#         "settlement": {
#             **_settlement_dict(settlement),
#             "orders": [
#                 order.to_dict()
#                 for order in orders
#             ]
#         }
#     }), 200


# @driver_bp.route("/drivers/<int:driver_id>/delivered-orders", methods=["GET"])
# @jwt_required()
# @role_required(["ADMIN", "SHOP_MANAGER"])
# def get_driver_delivered_orders(driver_id):

#     driver = User.query.filter_by(
#         id=driver_id,
#         role="DRIVER"
#     ).first()

#     if not driver:
#         return jsonify({
#             "error": "Driver not found"
#         }), 404

#     orders = Order.query.filter(
#         Order.driver_id == driver_id,
#         Order.status == "DELIVERED"
#     ).order_by(
#         Order.delivered_at.desc()
#     ).all()

#     total_delivery_charge = sum(
#         float(order.delivery_charge or 0)
#         for order in orders
#     )

#     total_order_amount = sum(
#         float(order.grand_total or 0)
#         for order in orders
#     )

#     return jsonify({
#         "driver": {
#             "id": driver.id,
#             "name": f"{driver.first_name} {driver.last_name}",
#             "phone_no": driver.phone_no,
#         },

#         "summary": {
#             "total_orders": len(orders),
#             "total_order_amount": total_order_amount,
#             "total_delivery_charge": total_delivery_charge,
#         },

#         "orders": [
#             {
#                 "id": order.id,
#                 "order_number": order.order_number,

#                 "customer": {
#                     "id": order.customer.id if order.customer else None,
#                     "name": f"{order.customer.first_name} {order.customer.last_name}"
#                             if order.customer else None,
#                     "phone": order.customer.phone_no if order.customer else None,
#                 },

#                 # "address": {
#                 #     "street": order.address.street if order.address else None,
#                 #     "city": order.address.city if order.address else None,
#                 #     "state": order.address.state if order.address else None,
#                 #     "pincode": order.address.pincode if order.address else None,
#                 #     "country": order.address.country if order.address else None,
#                 # },

#                 "address": order.address.to_dict() if order.address else None,

#                 "grand_total": float(order.grand_total or 0),
#                 "delivery_charge": float(order.delivery_charge or 0),

#                 "payment_method": order.payment_method,
#                 "payment_status": order.payment_status,

#                 "delivered_at": order.delivered_at.isoformat()
#                 if order.delivered_at else None,
#             }
#             for order in orders
#         ]
#     }), 200


from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from extensions import db
from models.user import User
from models.order import Order
from models.misc import DriverSettlement
from middleware.role import role_required

driver_bp = Blueprint("driver", __name__)


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _settlement_dict(s: DriverSettlement) -> dict:
    """Full serialisation of a DriverSettlement (extends model's to_dict)."""
    return {
        "id": s.id,
        "driver_id": s.driver_id,
        "amount": float(s.amount),
        "orders_count": s.orders_count or 0,
        "period_start": s.period_start.isoformat() if s.period_start else None,
        "period_end": s.period_end.isoformat() if s.period_end else None,
        "status": s.status,
        "paid_at": s.paid_at.isoformat() if s.paid_at else None,
        "paid_by": s.paid_by,
        "notes": s.notes,
        "payment_source": s.payment_source or "CASH",
        "reference": s.reference,
        "created_at": s.created_at.isoformat() if s.created_at else None,
        "driver": {
            "id": s.driver.id,
            "first_name": s.driver.first_name,
            "last_name": s.driver.last_name,
            "phone_no": s.driver.phone_no,
        } if s.driver else None,
    }


def _order_summary_dict(order: Order) -> dict:
    """Shared shape used by delivered-orders and unsettled-orders endpoints,
    matching what the frontend's OrderLite / custName / addrLine helpers expect."""
    return {
        "id": order.id,
        "order_number": order.order_number,
        "status": order.status,
        "customer": {
            "id": order.customer.id if order.customer else None,
            "first_name": order.customer.first_name if order.customer else None,
            "last_name": order.customer.last_name if order.customer else None,
            "phone_no": order.customer.phone_no if order.customer else None,
        } if order.customer else None,
        "address": order.address.to_dict() if order.address else None,
        "grand_total": float(order.grand_total or 0),
        "delivery_charge": float(order.delivery_charge or 0),
        "payment_method": order.payment_method,
        "payment_status": order.payment_status,
        "delivery_date": order.delivery_date.isoformat() if getattr(order, "delivery_date", None) else None,
        "delivered_at": order.delivered_at.isoformat() if order.delivered_at else None,
        "is_driver_settled": bool(order.is_driver_settled),
        "driver_settlement_id": order.driver_settlement_id,
    }


# ─── Driver lists (admin / agent) ─────────────────────────────────────────────

@driver_bp.route("/drivers", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER", "DELIVERY_AGENT"])
def get_drivers():
    """All users with role=DRIVER."""
    drivers = User.query.filter_by(role="DRIVER").all()
    return jsonify({"drivers": [d.to_dict() for d in drivers]}), 200


@driver_bp.route("/drivers/available", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER", "DELIVERY_AGENT"])
def get_available_drivers():
    """
    Drivers who have no currently active order.
    Active = ASSIGNED_TO_DRIVER | DRIVER_ACCEPTED | OUT_FOR_DELIVERY | DELIVERY_SUBMITTED.
    """
    busy_driver_ids = db.session.query(Order.driver_id).filter(
        Order.status.in_([
            "ASSIGNED_TO_DRIVER", "DRIVER_ACCEPTED",
            "OUT_FOR_DELIVERY", "DELIVERY_SUBMITTED",
        ]),
        Order.driver_id.isnot(None),
    ).subquery()

    drivers = User.query.filter_by(role="DRIVER").filter(
        ~User.id.in_(busy_driver_ids)
    ).all()
    return jsonify({"drivers": [d.to_dict() for d in drivers]}), 200


# ─── Driver dashboard ──────────────────────────────────────────────────────────

@driver_bp.route("/drivers/<int:driver_id>/dashboard", methods=["GET"])
@jwt_required()
def driver_dashboard(driver_id):
    """Summary stats for a driver's dashboard header."""
    driver = User.query.get_or_404(driver_id)
    orders = Order.query.filter_by(driver_id=driver_id).all()

    pending_settlements = DriverSettlement.query.filter_by(
        driver_id=driver_id, status="PENDING"
    ).all()
    paid_settlements = DriverSettlement.query.filter_by(
        driver_id=driver_id, status="PAID"
    ).all()

    pending_amount = sum(float(s.amount) for s in pending_settlements)
    total_earned = sum(float(s.amount) for s in paid_settlements)

    return jsonify({
        "driver": driver.to_dict(),
        "total_orders": len(orders),
        "delivered": sum(1 for o in orders if o.status == "DELIVERED"),
        "active": sum(
            1 for o in orders
            if o.status in [
                "ASSIGNED_TO_DRIVER", "DRIVER_ACCEPTED",
                "OUT_FOR_DELIVERY", "DELIVERY_SUBMITTED",
            ]
        ),
        "pending_amount": pending_amount,
        "total_earned": total_earned,
        "rating": float(driver.rating or 0),
    }), 200


# ─── Driver order lists ────────────────────────────────────────────────────────

@driver_bp.route("/drivers/<int:driver_id>/assigned", methods=["GET"])
@jwt_required()
def driver_assigned(driver_id):
    """Active orders assigned to this driver."""
    orders = Order.query.filter(
        Order.driver_id == driver_id,
        Order.status.in_([
            "ASSIGNED_TO_DRIVER", "DRIVER_ACCEPTED",
            "OUT_FOR_DELIVERY", "DELIVERY_SUBMITTED",
        ]),
    ).order_by(Order.created_at.desc()).all()
    return jsonify({"orders": [o.to_dict() for o in orders]}), 200


@driver_bp.route("/drivers/<int:driver_id>/completed", methods=["GET"])
@jwt_required()
def driver_completed(driver_id):
    """All delivered orders completed by this driver (settled or not)."""
    orders = Order.query.filter_by(
        driver_id=driver_id, status="DELIVERED"
    ).order_by(Order.delivered_at.desc()).all()
    return jsonify({"orders": [o.to_dict() for o in orders]}), 200


# ─── Driver availability status ────────────────────────────────────────────────

@driver_bp.route("/drivers/<int:driver_id>/status", methods=["POST"])
@jwt_required()
@role_required(["DRIVER", "ADMIN"])
def update_driver_status(driver_id):
    """POST { "status": "ONLINE" | "BUSY" | "OFFLINE" }"""
    data = request.get_json() or {}
    driver = User.query.get_or_404(driver_id)
    new_status = (data.get("status") or "OFFLINE").upper()

    if new_status not in ("ONLINE", "BUSY", "OFFLINE"):
        return jsonify({"error": "status must be ONLINE, BUSY, or OFFLINE"}), 400

    driver.availability_status = new_status
    db.session.commit()

    return jsonify({
        "message": "Status updated",
        "driver_id": driver_id,
        "status": new_status,
    }), 200


# ─── Driver report ─────────────────────────────────────────────────────────────

@driver_bp.route("/drivers/<int:driver_id>/report", methods=["GET"])
@jwt_required()
def driver_report(driver_id):
    orders = Order.query.filter_by(driver_id=driver_id).all()
    return jsonify({
        "driver_id": driver_id,
        "total": len(orders),
        "delivered": sum(1 for o in orders if o.status == "DELIVERED"),
        "cancelled": sum(1 for o in orders if o.status == "CANCELLED"),
        "in_progress": sum(
            1 for o in orders if o.status in [
                "ASSIGNED_TO_DRIVER", "DRIVER_ACCEPTED",
                "OUT_FOR_DELIVERY", "DELIVERY_SUBMITTED",
            ]
        ),
    }), 200


# ─── Delivered orders summary (used by the "Driver Settlement" cards tab) ──────

@driver_bp.route("/drivers/<int:driver_id>/delivered-orders", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def get_driver_delivered_orders(driver_id):
    driver = User.query.filter_by(id=driver_id, role="DRIVER").first()
    if not driver:
        return jsonify({"error": "Driver not found"}), 404

    orders = Order.query.filter(
        Order.driver_id == driver_id,
        Order.status == "DELIVERED",
    ).order_by(Order.delivered_at.desc()).all()

    total_delivery_charge = sum(float(o.delivery_charge or 0) for o in orders)
    total_order_amount = sum(float(o.grand_total or 0) for o in orders)

    return jsonify({
        "driver": {
            "id": driver.id,
            "name": f"{driver.first_name} {driver.last_name}",
            "phone_no": driver.phone_no,
        },
        "summary": {
            "total_orders": len(orders),
            "total_order_amount": total_order_amount,
            "total_delivery_charge": total_delivery_charge,
        },
        "orders": [_order_summary_dict(o) for o in orders],
    }), 200


# ─── Unsettled delivered orders (source of truth = driver_settlement_id) ───────

@driver_bp.route("/drivers/<int:driver_id>/unsettled-orders", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def get_driver_unsettled_orders(driver_id):
    """
    Orders that are DELIVERED and NOT yet attached to any settlement
    (driver_settlement_id is None). This is the list admins pick from
    when creating a new settlement — it can never include an order
    that's already part of a pending or paid settlement.
    """
    driver = User.query.filter_by(id=driver_id, role="DRIVER").first()
    if not driver:
        return jsonify({"error": "Driver not found"}), 404

    orders = Order.query.filter(
        Order.driver_id == driver_id,
        Order.status == "DELIVERED",
        Order.driver_settlement_id.is_(None),
    ).order_by(Order.delivered_at.desc()).all()

    total_delivery_charges = sum(float(o.delivery_charge or 0) for o in orders)

    return jsonify({
        "orders": [_order_summary_dict(o) for o in orders],
        "count": len(orders),
        "total_delivery_charges": total_delivery_charges,
    }), 200


# ─── Settlement: driver's own view ──────────────────────────────────────────────

@driver_bp.route("/drivers/<int:driver_id>/settlements", methods=["GET"])
@jwt_required()
def get_driver_settlements(driver_id):
    """Driver (or admin viewing a driver) sees settlement history + totals."""
    settlements = DriverSettlement.query.filter_by(
        driver_id=driver_id
    ).order_by(DriverSettlement.created_at.desc()).all()

    total_pending = sum(float(s.amount) for s in settlements if s.status == "PENDING")
    total_paid = sum(float(s.amount) for s in settlements if s.status == "PAID")
    orders_settled = sum((s.orders_count or 0) for s in settlements if s.status == "PAID")

    return jsonify({
        "settlements": [_settlement_dict(s) for s in settlements],
        "total_pending": total_pending,
        "total_paid": total_paid,
        "orders_settled": orders_settled,
    }), 200


# ─── Settlement: admin create / list / detail / pay ────────────────────────────

@driver_bp.route("/driver-settlements", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def create_driver_settlement():
    """
    Admin creates a settlement for a driver.

    Body:
    {
        "driver_id": int,               # required
        "amount": float,                # required — manual/editable amount to pay
        "order_ids": [int, ...],        # optional — delivered orders to attach & lock in
        "notes": str,
        "payment_source": "CASH"|"BANK"
    }

    If order_ids is provided, only orders that belong to this driver, are
    DELIVERED, and are NOT already attached to another settlement will be
    linked — this is what prevents an order being paid out twice.
    """
    data = request.get_json() or {}

    driver_id = data.get("driver_id")
    order_ids = data.get("order_ids") or []
    amount = data.get("amount")
    notes = data.get("notes")
    payment_source = data.get("payment_source", "CASH")

    if not driver_id:
        return jsonify({"error": "driver_id is required"}), 400
    if amount is None:
        return jsonify({"error": "amount is required"}), 400

    driver = User.query.filter_by(id=driver_id, role="DRIVER").first()
    if not driver:
        return jsonify({"error": "Driver not found"}), 404

    orders = []
    if order_ids:
        orders = Order.query.filter(
            Order.id.in_(order_ids),
            Order.driver_id == driver.id,
            Order.status == "DELIVERED",
            Order.driver_settlement_id.is_(None),
        ).all()

    settlement = DriverSettlement(
        driver_id=driver.id,
        amount=amount,
        orders_count=len(orders),
        notes=notes,
        payment_source=payment_source,
        status="PENDING",
    )

    db.session.add(settlement)
    db.session.flush()  # get settlement.id before linking orders

    for order in orders:
        order.driver_settlement_id = settlement.id
        # Attaching to a settlement (even before it's paid) means this
        # order is spoken for and must not be picked again.
        order.is_driver_settled = True

    db.session.commit()

    return jsonify({
        "message": "Driver settlement created successfully",
        "settlement": _settlement_dict(settlement),
    }), 201


@driver_bp.route("/driver-settlements", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def get_all_driver_settlements():
    driver_id = request.args.get("driver_id", type=int)
    status = request.args.get("status")

    query = DriverSettlement.query
    if driver_id:
        query = query.filter_by(driver_id=driver_id)
    if status:
        query = query.filter_by(status=status.upper())

    settlements = query.order_by(DriverSettlement.created_at.desc()).all()

    return jsonify({
        "settlements": [_settlement_dict(s) for s in settlements],
        "count": len(settlements),
    }), 200


@driver_bp.route("/driver-settlements/driver/<int:driver_id>", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def get_settlements_by_driver(driver_id):
    settlements = DriverSettlement.query.filter_by(
        driver_id=driver_id
    ).order_by(DriverSettlement.created_at.desc()).all()

    return jsonify({"settlements": [_settlement_dict(s) for s in settlements]}), 200


@driver_bp.route("/driver-settlements/<int:settlement_id>", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def get_driver_settlement(settlement_id):
    settlement = DriverSettlement.query.get_or_404(settlement_id)
    orders = Order.query.filter_by(driver_settlement_id=settlement.id).all()

    return jsonify({
        "settlement": {
            **_settlement_dict(settlement),
            "orders": [_order_summary_dict(o) for o in orders],
        }
    }), 200


@driver_bp.route("/driver-settlements/<int:settlement_id>/pay", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def mark_settlement_paid(settlement_id):
    """
    Marks a settlement PAID. Body: { "payment_source": "CASH"|"BANK", "reference": str }
    """
    data = request.get_json() or {}
    settlement = DriverSettlement.query.get_or_404(settlement_id)

    if settlement.status == "PAID":
        return jsonify({"error": "Settlement is already paid"}), 400

    settlement.status = "PAID"
    settlement.paid_at = datetime.utcnow()

    identity = get_jwt_identity()
    try:
        settlement.paid_by = int(identity)
    except (TypeError, ValueError):
        settlement.paid_by = None

    if data.get("payment_source"):
        settlement.payment_source = data["payment_source"]
    if data.get("reference"):
        settlement.reference = data["reference"]

    # Safety net: make sure every linked order is flagged settled, in case
    # it wasn't attached at creation time for any reason.
    orders = Order.query.filter_by(driver_settlement_id=settlement.id).all()
    for order in orders:
        order.is_driver_settled = True

    db.session.commit()

    return jsonify({
        "message": "Settlement marked as paid",
        "settlement": _settlement_dict(settlement),
    }), 200


@driver_bp.route("/driver-settlements/<int:settlement_id>", methods=["DELETE"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def delete_driver_settlement(settlement_id):
    """Deletes a PENDING settlement and frees up its linked orders again."""
    settlement = DriverSettlement.query.get_or_404(settlement_id)

    if settlement.status == "PAID":
        return jsonify({"error": "Cannot delete a settlement that's already paid"}), 400

    orders = Order.query.filter_by(driver_settlement_id=settlement.id).all()
    for order in orders:
        order.driver_settlement_id = None
        order.is_driver_settled = False

    db.session.delete(settlement)
    db.session.commit()

    return jsonify({"message": "Settlement deleted"}), 200