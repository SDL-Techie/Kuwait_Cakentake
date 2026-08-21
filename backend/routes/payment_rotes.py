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
# CREATE TAP PAYMENT LINK
# =====================================================

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

#     # -------------------------------------------------
#     # TAP ONLY
#     # -------------------------------------------------

#     order.payment_gateway = "TAP"

#     # Since this is an online Tap payment
#     order.payment_method = data.get(
#         "payment_method",
#         "KNET"
#     )

#     db.session.commit()

#     try:

#         result = create_knet_charge(order)

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

#     # -------------------------------------------------
#     # TAP ERROR
#     # -------------------------------------------------

#     if result.get("errors"):

#         db.session.rollback()

#         return jsonify({
#             "success": False,
#             "gateway": "TAP",
#             "errors": result.get("errors")
#         }), 400

#     # -------------------------------------------------
#     # GET PAYMENT URL
#     # -------------------------------------------------

#     transaction = result.get("transaction") or {}

#     payment_url = transaction.get("url")

#     if not payment_url:

#         return jsonify({
#             "success": False,
#             "gateway": "TAP",
#             "error": "Tap did not return a payment URL",
#             "tap_response": result
#         }), 400

#     # -------------------------------------------------
#     # SAVE TAP CHARGE
#     # -------------------------------------------------

#     order.gateway_order_id = result.get("id")

#     # Payment is not paid yet
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

@payment_bp.route("/payments/create-link", methods=["POST"])
@jwt_required()
def create_payment_link():

    data = request.get_json() or {}

    order_id = data.get("order_id")

    if not order_id:
        return jsonify({
            "error": "order_id is required"
        }), 400

    order = Order.query.get_or_404(order_id)

    # Prevent duplicate payment
    if str(order.payment_status or "").upper() == "PAID":
        return jsonify({
            "error": "Order already paid."
        }), 400

    order.payment_gateway = "TAP"
    db.session.commit()

    currency = str(order.currency or "KWD").strip().upper()

    try:
        if currency == "KWD":
            result = create_knet_charge(order)
        else:
            result = create_tap_charge(order)

    except Exception as exc:

        db.session.rollback()

        return jsonify({
            "success": False,
            "error": "Failed to create Tap payment",
            "details": str(exc)
        }), 500

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

    order.gateway_order_id = result.get("id")
    order.payment_method = "KNET" if currency == "KWD" else "CARD"
    order.payment_status = "PENDING"

    db.session.commit()

    return jsonify({

        "success": True,

        "gateway": "TAP",

        "payment_method": order.payment_method,

        "order_id": order.id,

        "tap_charge_id": result.get("id"),

        "payment_url": payment_url,

        "tap_status": result.get("status"),

        "payment_status": order.payment_status,

        "amount": float(order.grand_total or order.total or 0),

        "currency": order.currency

    }), 200

# =====================================================
# VERIFY TAP PAYMENT
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