


from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy import func
import stripe
from flask_jwt_extended import get_jwt_identity
from flask import redirect

from config import Config
from extensions import db
from models.order import Order
from middleware.role import role_required
from routes.order_routes import assign_order_to_kitchen
from services.tap_service import (
    create_knet_charge,
    verify_charge
)
from services.stripe_service import create_stripe_checkout

stripe.api_key = Config.STRIPE_SECRET_KEY
payment_bp = Blueprint("payment", __name__)


# =====================================================
# CREATE PAYMENT
# =====================================================

@payment_bp.route("/payments", methods=["POST"])
@jwt_required()
def create_payment():

    data = request.get_json()

    order = Order.query.get_or_404(data["order_id"])

    order.payment_method = data.get("payment_method")

    db.session.commit()

    return jsonify({
        "message": "Payment initiated",
        "order_id": order.id
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
        "total": float(order.total),
        "currency": order.currency
    })


# =====================================================
# CREATE TAP PAYMENT LINK
# =====================================================

# @payment_bp.route("/payments/<int:order_id>/create-link", methods=["POST"])
# @jwt_required()
# def create_payment_link(order_id):

#     order = Order.query.get_or_404(order_id)

#     result = create_knet_charge(order)

#     if result.get("errors"):

#         return jsonify(result), 400

#     order.payment_method = "KNET"
#     order.payment_gateway = "TAP"
#     order.gateway_order_id = result.get("id")

#     db.session.commit()

#     return jsonify({
#         "success": True,
#         "payment_url": result["transaction"]["url"],
#         "tap_charge_id": result["id"],
#         "status": result["status"]
#     })


@payment_bp.route("/payments/create-link", methods=["POST"])
@jwt_required()
def create_payment_link():

    data = request.get_json()

    order = Order.query.get_or_404(data["order_id"])

    # if order.status != "ACCEPTED":
    #     return jsonify({
    #         "error": "Payment is allowed only after the order is accepted."
    #     }), 400
    
    if order.payment_status == "PAID":
      return jsonify({
        "error": "Order already paid."
    }), 400

    gateway = data["payment_gateway"]

    method = data["payment_method"]

    order.payment_gateway = gateway
    order.payment_method = method

    db.session.commit()

    if gateway == "STRIPE":

        result = create_stripe_checkout(order)

        order.gateway_order_id = result["session_id"]

        db.session.commit()

        return jsonify(result)

    elif gateway == "TAP":

        result = create_knet_charge(order)
        print(result)

        if result.get("errors"):
            return jsonify(result),400

        order.gateway_order_id = result["id"]

        db.session.commit()

        return jsonify({

            "gateway":"TAP",

            "payment_url":result["transaction"]["url"],

            "tap_charge_id":result["id"]

        })

    return jsonify({
        "error":"Invalid payment gateway"
    }),400

# =====================================================
# VERIFY TAP PAYMENT
# =====================================================

# @payment_bp.route("/payments/<int:order_id>/verify", methods=["GET"])
# def verify_payment(order_id):
#     print("VERIFY PAYMENT ROUTE HIT")

#     order = Order.query.get_or_404(order_id)

#     tap_charge_id = request.args.get("tap_id")

#     if not tap_charge_id:

#         return jsonify({
#             "error": "tap_id is missing"
#         }), 400

#     result = verify_charge(tap_charge_id)

#     status = result.get("status")

#     order.gateway_response = result
#     order.gateway_payment_id = result.get("id")

#     transaction = result.get("transaction", {})

#     order.gateway_transaction_id = transaction.get("id")
#     # current_user_id = get_jwt_identity()

#     # if status == "CAPTURED":

#     #     order.payment_status = "PAID"

#     # elif status == "FAILED":

#     #     order.payment_status = "FAILED"

#     # else:

#     #     order.payment_status = "PENDING"
#     # if status == "CAPTURED":

#     #   order.payment_status = "PAID"

#     # if order.status == "ACCEPTED":
#     #     assign_order_to_kitchen(order, None)
#     #     #   assign_order_to_kitchen(order, current_user_id)
#     # elif status == "FAILED":

#     #  order.payment_status = "FAILED"

#     # else:

#     #  order.payment_status = "PENDING"

#     if status == "CAPTURED":

#       order.payment_status = "PAID"

#       if order.status == "ACCEPTED":
#         assign_order_to_kitchen(order, None)

#     elif status == "FAILED":

#      order.payment_status = "FAILED"

#     else:

#      order.payment_status = "PENDING"

     
#     db.session.commit()

#     # return jsonify({
#     #     "success": True,
#     #     "tap_status": status,
#     #     "payment_status": order.payment_status,
#     #     "order": order.to_dict()
#     # })


#     return redirect(
#     f"{Config.TAP_SUCCESS_URL}"
#     f"?order_id={order.id}"
#     f"&tap_id={tap_charge_id}"
#     )


@payment_bp.route("/payments/<int:order_id>/verify", methods=["GET"])
def verify_payment(order_id):

    print("========== VERIFY PAYMENT ROUTE HIT ==========")

    order = Order.query.get_or_404(order_id)

    # tap_charge_id = request.args.get("tap_id")

    # if not tap_charge_id:
    #     return jsonify({"error": "tap_id is missing"}), 400


    tap_charge_id = request.args.get("tap_id")

    if not tap_charge_id:
     tap_charge_id = order.gateway_order_id

    if not tap_charge_id:
     return jsonify({
        "error": "Unable to determine Tap charge ID"
    }), 400


    result = verify_charge(tap_charge_id)

    if result["status"] == "CAPTURED":

     order.payment_status = "PAID"

    if order.status == "ACCEPTED":
        assign_order_to_kitchen(order, None)

    elif result["status"] == "FAILED":
     order.payment_status = "FAILED"

    else:
     order.payment_status = "PENDING"

    print("========== TAP VERIFY RESPONSE ==========")
    print(result)
    print("=========================================")

    print("========== VERIFY ==========")
    print("ARGS:", request.args)
    print("ORDER:", order.id)
    print("CHARGE:", order.gateway_order_id)


    print("========== VERIFY PAYMENT ROUTE HIT ==========")
    print(request.url)
    print(request.args)


    status = (result.get("status") or "").upper()

    print("PAYMENT STATUS:", status)

    order.gateway_response = result
    order.gateway_payment_id = result.get("id")

    transaction = result.get("transaction", {})
    order.gateway_transaction_id = transaction.get("id")

    if status == "CAPTURED":

        print("PAYMENT SUCCESS")

        order.payment_status = "PAID"

        if order.status == "ACCEPTED":
            assign_order_to_kitchen(order, None)

    elif status in ["FAILED", "DECLINED", "CANCELLED"]:

        print("PAYMENT FAILED")

        order.payment_status = "FAILED"

    else:

        print("PAYMENT STILL PENDING")

        order.payment_status = "PENDING"

    db.session.commit()

    return redirect(
        f"{Config.TAP_SUCCESS_URL}"
        f"?order_id={order.id}"
        f"&tap_id={tap_charge_id}"
    )

# =====================================================
# VERIFY STRIPE PAYMENT
# =====================================================

# @payment_bp.route("/payments/stripe/verify", methods=["GET"])

# def verify_stripe_payment():



#     order_id = request.args.get("order_id")
#     session_id = request.args.get("session_id")

#     if not order_id or not session_id:
#         return jsonify({"error": "Missing order_id or session_id"}), 400

#     order = Order.query.get_or_404(order_id)

#     session = stripe.checkout.Session.retrieve(session_id)
    

#     order.gateway_response = session

#     order.gateway_order_id = session.id
#     order.gateway_payment_id = session.payment_intent

#     # if session.payment_status == "paid":
#     #     order.payment_status = "PAID"
#     # else:
#     #     order.payment_status = "FAILED"
#     if session.payment_status == "paid":

#       order.payment_status = "PAID"

#     if order.status == "ACCEPTED":
#         # assign_order_to_kitchen(order, None)
#       assign_order_to_kitchen(order, None)

#     else:
#       order.payment_status = "FAILED"

#     db.session.commit()

#     return jsonify({
#         "success": True,
#         "payment_status": order.payment_status,
#         "order": order.to_dict()
#     })


@payment_bp.route("/payments/stripe/verify", methods=["GET"])
def verify_stripe_payment():

    order_id = request.args.get("order_id")
    session_id = request.args.get("session_id")

    if not order_id or not session_id:
        return jsonify({"error": "Missing order_id or session_id"}), 400

    order = Order.query.get_or_404(order_id)

    # session = stripe.checkout.Session.retrieve(session_id)

    # # order.gateway_response = session
    # order.gateway_response = session.to_dict()
    # order.gateway_order_id = session.id
    # order.gateway_payment_id = session.payment_intent


    session = stripe.checkout.Session.retrieve(session_id)

    order.gateway_order_id = session.id
    order.gateway_payment_id = session.payment_intent

    order.gateway_response = {
    "session_id": session.id,
    "payment_intent": session.payment_intent,
    "payment_status": session.payment_status,
    "amount_total": session.amount_total,
    "currency": session.currency,
    "customer": session.customer,
    "customer_email": session.customer_details.email if session.customer_details else None,
    "payment_method_types": session.payment_method_types,
    "status": session.status
}

   
    if session.payment_status == "paid":

        order.payment_status = "PAID"

        # Send to kitchen only if already accepted
        if order.status == "ACCEPTED":
            assign_order_to_kitchen(order, None)

    else:

        order.payment_status = "FAILED"

    db.session.commit()

    return jsonify({
        "success": True,
        "payment_status": order.payment_status,
        "order": order.to_dict()
    })
# =====================================================
# MANUAL PAYMENT
# =====================================================

@payment_bp.route("/payments/<int:order_id>/mark-paid", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER", "SALES_AGENT"])
def mark_paid(order_id):

    order = Order.query.get_or_404(order_id)

    data = request.get_json() or {}

    order.payment_status = "PAID"

    order.payment_method = data.get(
        "payment_method",
        order.payment_method
    )

    db.session.commit()

    return jsonify({
        "message": "Order marked as paid",
        "order": order.to_dict()
    })


# =====================================================
# PAYMENT REPORT
# =====================================================

@payment_bp.route("/payments/report", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def payment_report():

    paid_orders = Order.query.filter_by(
        payment_status="PAID"
    ).all()

    pending_orders = Order.query.filter_by(
        payment_status="PENDING"
    ).count()

    total_collected = sum(
        float(order.total)
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

        "total_paid_orders": len(paid_orders),

        "pending_orders": pending_orders,

        "total_collected": total_collected,

        "by_method": [

            {
                "method": row[0],
                "count": row[1],
                "amount": float(row[2] or 0)
            }

            for row in by_method
        ]
    })


# =====================================================
# GET INVOICE
# =====================================================

@payment_bp.route("/invoices/<int:order_id>", methods=["GET"])
@jwt_required()
def get_invoice(order_id):

    order = Order.query.get_or_404(order_id)

    return jsonify({

        "invoice_number": f"INV-{order.order_number}",

        "issued_at": order.created_at.isoformat(),

        "order": order.to_dict()

    })


# =====================================================
# DOWNLOAD INVOICE
# =====================================================

@payment_bp.route("/invoices/<int:order_id>/download", methods=["POST"])
@jwt_required()
def download_invoice(order_id):

    Order.query.get_or_404(order_id)

    return jsonify({

        "message": "Invoice download ready",

        "invoice_url": f"/invoices/{order_id}/file"

    })


# =====================================================
# SHARE INVOICE
# =====================================================

@payment_bp.route("/invoices/<int:order_id>/share-whatsapp", methods=["POST"])
@jwt_required()
def share_invoice_whatsapp(order_id):

    Order.query.get_or_404(order_id)

    return jsonify({

        "message": "Invoice shared via WhatsApp",

        "order_id": order_id

    })