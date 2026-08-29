# from flask import Blueprint, request, jsonify, redirect
# from flask_jwt_extended import jwt_required
# from sqlalchemy import func

# from config import Config
# from extensions import db
# from models.order import Order
# from middleware.role import role_required
# from routes.order_routes import assign_order_to_kitchen

# from services.tap_service import (
#     create_knet_charge,
#     create_tap_charge,
#     verify_charge
# )


# payment_bp = Blueprint("payment", __name__)


# # =====================================================
# # CREATE PAYMENT
# # =====================================================

# @payment_bp.route("/payments", methods=["POST"])
# @jwt_required()
# def create_payment():

#     data = request.get_json() or {}

#     if not data.get("order_id"):
#         return jsonify({
#             "error": "order_id is required"
#         }), 400

#     order = Order.query.get_or_404(data["order_id"])

#     payment_method = data.get("payment_method", "TAP")

#     order.payment_method = payment_method

#     db.session.commit()

#     return jsonify({
#         "message": "Payment initiated",
#         "order_id": order.id,
#         "payment_method": order.payment_method
#     }), 201


# # =====================================================
# # GET PAYMENT DETAILS
# # =====================================================

# @payment_bp.route("/payments/<int:order_id>", methods=["GET"])
# @jwt_required()
# def get_payment(order_id):

#     order = Order.query.get_or_404(order_id)

#     return jsonify({
#         "order_id": order.id,
#         "payment_method": order.payment_method,
#         "payment_status": order.payment_status,
#         "payment_gateway": order.payment_gateway,
#         "gateway_order_id": order.gateway_order_id,
#         "total": float(order.total or 0),
#         "currency": order.currency
#     }), 200


# # =====================================================
# # CREATE TAP PAYMENT LINK
# # =====================================================

# # @payment_bp.route("/payments/create-link", methods=["POST"])
# # @jwt_required()
# # def create_payment_link():

# #     data = request.get_json() or {}

# #     order_id = data.get("order_id")

# #     if not order_id:
# #         return jsonify({
# #             "error": "order_id is required"
# #         }), 400

# #     order = Order.query.get_or_404(order_id)

# #     # Prevent duplicate payment
# #     if str(order.payment_status or "").upper() == "PAID":
# #         return jsonify({
# #             "error": "Order already paid."
# #         }), 400

# #     # -------------------------------------------------
# #     # TAP ONLY
# #     # -------------------------------------------------

# #     order.payment_gateway = "TAP"

# #     # Since this is an online Tap payment
# #     order.payment_method = data.get(
# #         "payment_method",
# #         "KNET"
# #     )

# #     db.session.commit()

# #     try:

# #         result = create_knet_charge(order)

# #     except Exception as exc:

# #         db.session.rollback()

# #         return jsonify({
# #             "success": False,
# #             "error": "Failed to create Tap payment",
# #             "details": str(exc)
# #         }), 500

# #     print("========== TAP RESPONSE ==========")
# #     print(result)
# #     print("===================================")

# #     # -------------------------------------------------
# #     # TAP ERROR
# #     # -------------------------------------------------

# #     if result.get("errors"):

# #         db.session.rollback()

# #         return jsonify({
# #             "success": False,
# #             "gateway": "TAP",
# #             "errors": result.get("errors")
# #         }), 400

# #     # -------------------------------------------------
# #     # GET PAYMENT URL
# #     # -------------------------------------------------

# #     transaction = result.get("transaction") or {}

# #     payment_url = transaction.get("url")

# #     if not payment_url:

# #         return jsonify({
# #             "success": False,
# #             "gateway": "TAP",
# #             "error": "Tap did not return a payment URL",
# #             "tap_response": result
# #         }), 400

# #     # -------------------------------------------------
# #     # SAVE TAP CHARGE
# #     # -------------------------------------------------

# #     order.gateway_order_id = result.get("id")

# #     # Payment is not paid yet
# #     order.payment_status = "PENDING"

# #     db.session.commit()

# #     return jsonify({

# #         "success": True,

# #         "gateway": "TAP",

# #         "payment_method": order.payment_method,

# #         "order_id": order.id,

# #         "tap_charge_id": result.get("id"),

# #         "payment_url": payment_url,

# #         "tap_status": result.get("status"),

# #         "payment_status": order.payment_status,

# #         "amount": float(order.grand_total or order.total or 0),

# #         "currency": order.currency

# #     }), 200

# @payment_bp.route("/payments/create-link", methods=["POST"])
# @jwt_required()
# def create_payment_link():

#     data = request.get_json() or {}

#     order_id = data.get("order_id")

#     if not order_id:
#         return jsonify({
#             "error": "order_id is required"
#         }), 400

#     order = Order.query.get_or_404(order_id)

#     # Prevent duplicate payment
#     if str(order.payment_status or "").upper() == "PAID":
#         return jsonify({
#             "error": "Order already paid."
#         }), 400

#     order.payment_gateway = "TAP"
#     db.session.commit()

#     currency = str(order.currency or "KWD").strip().upper()

#     try:
#         if currency == "KWD":
#             result = create_knet_charge(order)
#         else:
#             result = create_tap_charge(order)

#     except Exception as exc:

#         db.session.rollback()

#         return jsonify({
#             "success": False,
#             "error": "Failed to create Tap payment",
#             "details": str(exc)
#         }), 500

#     print("========== TAP RESPONSE ==========")
#     print(result)
#     print("===================================")

#     if result.get("errors"):

#         db.session.rollback()

#         return jsonify({
#             "success": False,
#             "gateway": "TAP",
#             "errors": result.get("errors")
#         }), 400

#     transaction = result.get("transaction") or {}

#     payment_url = transaction.get("url")

#     if not payment_url:

#         return jsonify({
#             "success": False,
#             "gateway": "TAP",
#             "error": "Tap did not return a payment URL",
#             "tap_response": result
#         }), 400

#     order.gateway_order_id = result.get("id")
#     order.payment_method = "KNET" if currency == "KWD" else "CARD"
#     order.payment_status = "PENDING"

#     db.session.commit()

#     return jsonify({

#         "success": True,

#         "gateway": "TAP",

#         "payment_method": order.payment_method,

#         "order_id": order.id,

#         "tap_charge_id": result.get("id"),

#         "payment_url": payment_url,

#         "tap_status": result.get("status"),

#         "payment_status": order.payment_status,

#         "amount": float(order.grand_total or order.total or 0),

#         "currency": order.currency

#     }), 200

# # =====================================================
# # VERIFY TAP PAYMENT
# # =====================================================

# @payment_bp.route("/payments/<int:order_id>/verify", methods=["GET"])
# def verify_payment(order_id):

#     order = Order.query.get_or_404(order_id)

#     # Tap normally returns the charge ID as tap_id
#     tap_charge_id = (
#         request.args.get("tap_id")
#         or order.gateway_order_id
#     )

#     if not tap_charge_id:

#         return jsonify({
#             "success": False,
#             "error": "Unable to determine Tap charge ID"
#         }), 400

#     try:

#         result = verify_charge(tap_charge_id)

#     except Exception as exc:

#         return jsonify({
#             "success": False,
#             "error": "Failed to verify Tap payment",
#             "details": str(exc)
#         }), 500

#     print("========== TAP VERIFY ==========")
#     print(result)
#     print("================================")

#     status = str(
#         result.get("status") or ""
#     ).upper()

#     # -------------------------------------------------
#     # SAVE TAP RESPONSE
#     # -------------------------------------------------

#     order.gateway_response = result

#     order.gateway_payment_id = result.get("id")

#     transaction = result.get("transaction") or {}

#     order.gateway_transaction_id = transaction.get("id")

#     # -------------------------------------------------
#     # PAYMENT SUCCESS
#     # -------------------------------------------------

#     if status == "CAPTURED":

#         order.payment_status = "PAID"

#         # Send accepted online order to kitchen
#         if str(order.status or "").upper() == "ACCEPTED":

#             assign_order_to_kitchen(
#                 order,
#                 None
#             )

#     # -------------------------------------------------
#     # PAYMENT FAILED
#     # -------------------------------------------------

#     elif status in {
#         "FAILED",
#         "DECLINED",
#         "CANCELLED",
#         "ABANDONED",
#         "TIMEDOUT",
#         "RESTRICTED",
#         "VOID"
#     }:

#         order.payment_status = "FAILED"

#     # -------------------------------------------------
#     # PAYMENT STILL PENDING
#     # -------------------------------------------------

#     else:

#         order.payment_status = "PENDING"

#     db.session.commit()

#     # -------------------------------------------------
#     # REDIRECT USER AFTER TAP PAYMENT
#     # -------------------------------------------------

#     if Config.TAP_SUCCESS_URL:

#         return redirect(
#             f"{Config.TAP_SUCCESS_URL}"
#             f"?order_id={order.id}"
#             f"&tap_id={tap_charge_id}"
#         )

#     # If no frontend success URL is configured,
#     # return JSON instead.

#     return jsonify({

#         "success": True,

#         "gateway": "TAP",

#         "tap_status": status,

#         "payment_status": order.payment_status,

#         "order_id": order.id,

#         "tap_charge_id": tap_charge_id

#     }), 200


# # =====================================================
# # MANUAL PAYMENT
# # =====================================================

# @payment_bp.route(
#     "/payments/<int:order_id>/mark-paid",
#     methods=["POST"]
# )
# @jwt_required()
# @role_required([
#     "ADMIN",
#     "SHOP_MANAGER",
#     "SALES_AGENT"
# ])
# def mark_paid(order_id):

#     order = Order.query.get_or_404(order_id)

#     data = request.get_json(silent=True) or {}

#     method = str(
#         data.get("payment_method")
#         or order.payment_method
#         or "COD"
#     ).strip().upper()

#     if method == "CASH":
#         method = "COD"

#     order.payment_method = method

#     order.payment_status = "PAID"

#     # If online/link order was already accepted,
#     # send it to kitchen.
#     if str(order.status or "").upper() == "ACCEPTED":

#         assign_order_to_kitchen(
#             order,
#             None
#         )

#     db.session.commit()

#     return jsonify({

#         "message": "Order marked as paid",

#         "order": order.to_dict()

#     }), 200


# # =====================================================
# # PAYMENT REPORT
# # =====================================================

# @payment_bp.route(
#     "/payments/report",
#     methods=["GET"]
# )
# @jwt_required()
# @role_required([
#     "ADMIN",
#     "SHOP_MANAGER"
# ])
# def payment_report():

#     paid_orders = Order.query.filter_by(
#         payment_status="PAID"
#     ).all()

#     pending_orders = Order.query.filter_by(
#         payment_status="PENDING"
#     ).count()

#     total_collected = sum(
#         float(order.total or 0)
#         for order in paid_orders
#     )

#     by_method = db.session.query(
#         Order.payment_method,
#         func.count(Order.id),
#         func.sum(Order.total)
#     ).filter_by(
#         payment_status="PAID"
#     ).group_by(
#         Order.payment_method
#     ).all()

#     return jsonify({

#         "total_paid_orders": len(
#             paid_orders
#         ),

#         "pending_orders": pending_orders,

#         "total_collected": total_collected,

#         "by_method": [

#             {
#                 "method": row[0],
#                 "count": row[1],
#                 "amount": float(
#                     row[2] or 0
#                 )
#             }

#             for row in by_method
#         ]

#     }), 200


# # =====================================================
# # GET INVOICE
# # =====================================================

# @payment_bp.route(
#     "/invoices/<int:order_id>",
#     methods=["GET"]
# )
# @jwt_required()
# def get_invoice(order_id):

#     order = Order.query.get_or_404(order_id)

#     return jsonify({

#         "invoice_number":
#             f"INV-{order.order_number}",

#         "issued_at":
#             order.created_at.isoformat(),

#         "order":
#             order.to_dict()

#     }), 200


# # =====================================================
# # DOWNLOAD INVOICE
# # =====================================================

# @payment_bp.route(
#     "/invoices/<int:order_id>/download",
#     methods=["POST"]
# )
# @jwt_required()
# def download_invoice(order_id):

#     Order.query.get_or_404(order_id)

#     return jsonify({

#         "message":
#             "Invoice download ready",

#         "invoice_url":
#             f"/invoices/{order_id}/file"

#     }), 200


# # =====================================================
# # SHARE INVOICE - WHATSAPP
# # =====================================================

# @payment_bp.route(
#     "/invoices/<int:order_id>/share-whatsapp",
#     methods=["POST"]
# )
# @jwt_required()
# def share_invoice_whatsapp(order_id):

#     Order.query.get_or_404(order_id)

#     return jsonify({

#         "message":
#             "Invoice shared via WhatsApp",

#         "order_id":
#             order_id

#     }), 200




from flask import Blueprint, request, jsonify, redirect
from flask_jwt_extended import jwt_required
from sqlalchemy import func

from config import Config
from extensions import db
from models.order import Order
from middleware.role import role_required
from routes.order_routes import assign_order_to_kitchen

from services.tap_service import (
    create_knet_charge,
    create_tap_charge,
    create_knet_charge_batch,
    create_tap_charge_batch,
    verify_charge
)


payment_bp = Blueprint("payment", __name__)


# =====================================================
# CREATE PAYMENT
# =====================================================

@payment_bp.route("/payments", methods=["POST"])
@jwt_required()
def create_payment():

    data = request.get_json() or {}

    if not data.get("order_id"):
        return jsonify({
            "error": "order_id is required"
        }), 400

    order = Order.query.get_or_404(data["order_id"])

    payment_method = data.get("payment_method", "TAP")

    order.payment_method = payment_method

    db.session.commit()

    return jsonify({
        "message": "Payment initiated",
        "order_id": order.id,
        "payment_method": order.payment_method
    }), 201


# =====================================================
# GET PAYMENT DETAILS
# =====================================================

@payment_bp.route("/payments/<int:order_id>", methods=["GET"])
@jwt_required()
def get_payment(order_id):

    order = Order.query.get_or_404(order_id)

    return jsonify({
        "order_id": order.id,
        "payment_method": order.payment_method,
        "payment_status": order.payment_status,
        "payment_gateway": order.payment_gateway,
        "gateway_order_id": order.gateway_order_id,
        "total": float(order.total or 0),
        "currency": order.currency
    }), 200


# =====================================================
# CREATE TAP PAYMENT LINK  (single order OR a batch of one agent's orders)
# =====================================================

@payment_bp.route("/payments/create-link", methods=["POST"])
@jwt_required()
def create_payment_link():

    try:
        data = request.get_json() or {}

        # Accept either a single order_id (unchanged, backward compatible) or
        # order_ids: [..] to combine several of one agent's orders into ONE charge.
        order_ids = data.get("order_ids")

        if not order_ids:
            single_id = data.get("order_id")
            order_ids = [single_id] if single_id else []

        if not order_ids:
            return jsonify({
                "error": "order_id or order_ids is required"
            }), 400

        orders = Order.query.filter(Order.id.in_(order_ids)).all()

        if len(orders) != len(set(order_ids)):
            return jsonify({
                "error": "One or more orders were not found"
            }), 404

        # All orders in a single payment must belong to the same agent.
        # Order has no agent_id column — the agent who created an
        # agent_order is tracked via created_by (FK -> users.id).
        agent_ids = {o.created_by for o in orders}
        if len(agent_ids) > 1:
            return jsonify({
                "error": "All orders in one payment must belong to the same agent"
            }), 400

        # Prevent duplicate payment
        already_paid = [o.order_number for o in orders if str(o.payment_status or "").upper() == "PAID"]
        if already_paid:
            return jsonify({
                "error": f"Order(s) already paid: {', '.join(already_paid)}"
            }), 400

        # All orders must share a currency to be combined into one charge
        currencies = {str(o.currency or "KWD").strip().upper() for o in orders}
        if len(currencies) > 1:
            return jsonify({
                "error": "Cannot combine orders with different currencies into one payment"
            }), 400
        currency = currencies.pop()

        total_amount = sum(float(o.grand_total or o.total or 0) for o in orders)

        for o in orders:
            o.payment_gateway = "TAP"
        db.session.commit()

        if len(orders) == 1:
            # Single order keeps using the original single-charge functions
            # (redirect goes straight back to that order's own verify route).
            if currency == "KWD":
                result = create_knet_charge(orders[0])
            else:
                result = create_tap_charge(orders[0])
        else:
            if currency == "KWD":
                result = create_knet_charge_batch(orders, total_amount)
            else:
                result = create_tap_charge_batch(orders, total_amount, currency)

        print("========== TAP RESPONSE ==========")
        print(result)
        print("===================================")

        if result.get("errors"):

            db.session.rollback()

            return jsonify({
                "success": False,
                "gateway": "TAP",
                "errors": result.get("errors")
            }), 400

        transaction = result.get("transaction") or {}

        payment_url = transaction.get("url")

        if not payment_url:

            return jsonify({
                "success": False,
                "gateway": "TAP",
                "error": "Tap did not return a payment URL",
                "tap_response": result
            }), 400

        charge_id = result.get("id")
        payment_method = "KNET" if currency == "KWD" else "CARD"

        for o in orders:
            o.gateway_order_id = charge_id
            o.payment_method = payment_method
            o.payment_status = "PENDING"

        db.session.commit()

        return jsonify({

            "success": True,

            "gateway": "TAP",

            "payment_method": payment_method,

            "order_ids": [o.id for o in orders],

            "order_numbers": [o.order_number for o in orders],

            "tap_charge_id": charge_id,

            "payment_url": payment_url,

            "tap_status": result.get("status"),

            "payment_status": "PENDING",

            "amount": total_amount,

            "currency": currency

        }), 200

    except Exception as exc:

        db.session.rollback()

        # Catch-all so a bug here always returns real JSON (with CORS
        # headers attached normally) instead of letting the exception
        # escape to Werkzeug's debugger, which the browser misreports
        # as a CORS failure.
        import traceback
        traceback.print_exc()

        return jsonify({
            "success": False,
            "error": "Failed to create payment link",
            "details": str(exc)
        }), 500


# =====================================================
# VERIFY TAP PAYMENT (single order)
# =====================================================

@payment_bp.route("/payments/<int:order_id>/verify", methods=["GET"])
def verify_payment(order_id):

    order = Order.query.get_or_404(order_id)

    # Tap normally returns the charge ID as tap_id
    tap_charge_id = (
        request.args.get("tap_id")
        or order.gateway_order_id
    )

    if not tap_charge_id:

        return jsonify({
            "success": False,
            "error": "Unable to determine Tap charge ID"
        }), 400

    try:

        result = verify_charge(tap_charge_id)

    except Exception as exc:

        return jsonify({
            "success": False,
            "error": "Failed to verify Tap payment",
            "details": str(exc)
        }), 500

    print("========== TAP VERIFY ==========")
    print(result)
    print("================================")

    status = str(
        result.get("status") or ""
    ).upper()

    # -------------------------------------------------
    # SAVE TAP RESPONSE
    # -------------------------------------------------

    order.gateway_response = result

    order.gateway_payment_id = result.get("id")

    transaction = result.get("transaction") or {}

    order.gateway_transaction_id = transaction.get("id")

    # -------------------------------------------------
    # PAYMENT SUCCESS
    # -------------------------------------------------

    if status == "CAPTURED":

        order.payment_status = "PAID"

        # Send accepted online order to kitchen
        if str(order.status or "").upper() == "ACCEPTED":

            assign_order_to_kitchen(
                order,
                None
            )

    # -------------------------------------------------
    # PAYMENT FAILED
    # -------------------------------------------------

    elif status in {
        "FAILED",
        "DECLINED",
        "CANCELLED",
        "ABANDONED",
        "TIMEDOUT",
        "RESTRICTED",
        "VOID"
    }:

        order.payment_status = "FAILED"

    # -------------------------------------------------
    # PAYMENT STILL PENDING
    # -------------------------------------------------

    else:

        order.payment_status = "PENDING"

    db.session.commit()

    # -------------------------------------------------
    # REDIRECT USER AFTER TAP PAYMENT
    # -------------------------------------------------

    if Config.TAP_SUCCESS_URL:

        return redirect(
            f"{Config.TAP_SUCCESS_URL}"
            f"?order_id={order.id}"
            f"&tap_id={tap_charge_id}"
        )

    # If no frontend success URL is configured,
    # return JSON instead.

    return jsonify({

        "success": True,

        "gateway": "TAP",

        "tap_status": status,

        "payment_status": order.payment_status,

        "order_id": order.id,

        "tap_charge_id": tap_charge_id

    }), 200


# =====================================================
# VERIFY A BATCHED (multi-order) TAP PAYMENT
# =====================================================

@payment_bp.route("/payments/batch/verify", methods=["GET"])
def verify_batch_payment():

    tap_charge_id = request.args.get("tap_id")

    if not tap_charge_id:
        return jsonify({
            "success": False,
            "error": "Unable to determine Tap charge ID"
        }), 400

    orders = Order.query.filter_by(gateway_order_id=tap_charge_id).all()

    if not orders:
        return jsonify({
            "success": False,
            "error": "No orders found for this payment"
        }), 404

    try:
        result = verify_charge(tap_charge_id)
    except Exception as exc:
        return jsonify({
            "success": False,
            "error": "Failed to verify Tap payment",
            "details": str(exc)
        }), 500

    print("========== TAP BATCH VERIFY ==========")
    print(result)
    print("=======================================")

    status = str(result.get("status") or "").upper()
    transaction = result.get("transaction") or {}

    for order in orders:
        order.gateway_response = result
        order.gateway_payment_id = result.get("id")
        order.gateway_transaction_id = transaction.get("id")

        if status == "CAPTURED":
            order.payment_status = "PAID"
            if str(order.status or "").upper() == "ACCEPTED":
                assign_order_to_kitchen(order, None)

        elif status in {
            "FAILED", "DECLINED", "CANCELLED",
            "ABANDONED", "TIMEDOUT", "RESTRICTED", "VOID"
        }:
            order.payment_status = "FAILED"

        else:
            order.payment_status = "PENDING"

    db.session.commit()

    order_ids_csv = ",".join(str(o.id) for o in orders)

    if Config.TAP_SUCCESS_URL:
        return redirect(
            f"{Config.TAP_SUCCESS_URL}"
            f"?order_ids={order_ids_csv}"
            f"&tap_id={tap_charge_id}"
        )

    return jsonify({

        "success": True,

        "gateway": "TAP",

        "tap_status": status,

        "payment_status": orders[0].payment_status,

        "order_ids": [o.id for o in orders],

        "tap_charge_id": tap_charge_id

    }), 200


# =====================================================
# MANUAL PAYMENT
# =====================================================

@payment_bp.route(
    "/payments/<int:order_id>/mark-paid",
    methods=["POST"]
)
@jwt_required()
@role_required([
    "ADMIN",
    "SHOP_MANAGER",
    "SALES_AGENT"
])
def mark_paid(order_id):

    order = Order.query.get_or_404(order_id)

    data = request.get_json(silent=True) or {}

    method = str(
        data.get("payment_method")
        or order.payment_method
        or "COD"
    ).strip().upper()

    if method == "CASH":
        method = "COD"

    order.payment_method = method

    order.payment_status = "PAID"

    # If online/link order was already accepted,
    # send it to kitchen.
    if str(order.status or "").upper() == "ACCEPTED":

        assign_order_to_kitchen(
            order,
            None
        )

    db.session.commit()

    return jsonify({

        "message": "Order marked as paid",

        "order": order.to_dict()

    }), 200


# =====================================================
# PAYMENT REPORT
# =====================================================

@payment_bp.route(
    "/payments/report",
    methods=["GET"]
)
@jwt_required()
@role_required([
    "ADMIN",
    "SHOP_MANAGER"
])
def payment_report():

    paid_orders = Order.query.filter_by(
        payment_status="PAID"
    ).all()

    pending_orders = Order.query.filter_by(
        payment_status="PENDING"
    ).count()

    total_collected = sum(
        float(order.total or 0)
        for order in paid_orders
    )

    by_method = db.session.query(
        Order.payment_method,
        func.count(Order.id),
        func.sum(Order.total)
    ).filter_by(
        payment_status="PAID"
    ).group_by(
        Order.payment_method
    ).all()

    return jsonify({

        "total_paid_orders": len(
            paid_orders
        ),

        "pending_orders": pending_orders,

        "total_collected": total_collected,

        "by_method": [

            {
                "method": row[0],
                "count": row[1],
                "amount": float(
                    row[2] or 0
                )
            }

            for row in by_method
        ]

    }), 200


# =====================================================
# GET INVOICE
# =====================================================

@payment_bp.route(
    "/invoices/<int:order_id>",
    methods=["GET"]
)
@jwt_required()
def get_invoice(order_id):

    order = Order.query.get_or_404(order_id)

    return jsonify({

        "invoice_number":
            f"INV-{order.order_number}",

        "issued_at":
            order.created_at.isoformat(),

        "order":
            order.to_dict()

    }), 200


# =====================================================
# DOWNLOAD INVOICE
# =====================================================

@payment_bp.route(
    "/invoices/<int:order_id>/download",
    methods=["POST"]
)
@jwt_required()
def download_invoice(order_id):

    Order.query.get_or_404(order_id)

    return jsonify({

        "message":
            "Invoice download ready",

        "invoice_url":
            f"/invoices/{order_id}/file"

    }), 200


# =====================================================
# SHARE INVOICE - WHATSAPP
# =====================================================

@payment_bp.route(
    "/invoices/<int:order_id>/share-whatsapp",
    methods=["POST"]
)
@jwt_required()
def share_invoice_whatsapp(order_id):

    Order.query.get_or_404(order_id)

    return jsonify({

        "message":
            "Invoice shared via WhatsApp",

        "order_id":
            order_id

    }), 200