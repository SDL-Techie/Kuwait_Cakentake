
from urllib.parse import quote, urlencode
from uuid import uuid4

from flask import Blueprint, current_app, jsonify, redirect, request
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required
from sqlalchemy import func
from decimal import Decimal, InvalidOperation
from config import Config
from extensions import db
from middleware.role import role_required
from models.order import Order
from routes.order_routes import assign_order_to_kitchen
from services.tap_service import (
    create_knet_charge,
    create_knet_charge_batch,
    create_tap_charge,
    create_tap_charge_batch,
    validate_webhook_hash,
    verify_charge,
)


payment_bp = Blueprint("payment", __name__)

SUCCESS_STATUSES = {"CAPTURED"}
FAILURE_STATUSES = {
    "FAILED",
    "DECLINED",
    "CANCELLED",
    "ABANDONED",
    "TIMEDOUT",
    "RESTRICTED",
    "VOID",
    "UNKNOWN",
}


def _platform(value):
    value = str(value or "web").strip().lower()
    return "app" if value == "app" else "web"


def _payment_status_from_tap(status):
    status = str(status or "").upper()
    if status in SUCCESS_STATUSES:
        return "PAID"
    if status in FAILURE_STATUSES:
        return "FAILED"
    return "PENDING"


def _transaction_id(result, charge_id):
    transaction = result.get("transaction") or {}
    reference = result.get("reference") or {}
    return (
        transaction.get("id")
        or reference.get("payment")
        or result.get("id")
        or charge_id
    )


def _amount(value):
    try:
        return Decimal(str(value or 0))
    except (InvalidOperation, TypeError, ValueError):
        return Decimal("0")


def _expected_total(orders):
    return sum(
        (_amount(order.grand_total) if _amount(order.grand_total) > 0 else _amount(order.total))
        for order in orders
    )


def _validate_retrieved_charge(orders, result, charge_id):
    if result.get("errors"):
        return False, "Tap charge could not be retrieved."

    returned_id = str(result.get("id") or "")
    if not returned_id or returned_id != str(charge_id):
        return False, "Tap charge id mismatch."

    stored_ids = {str(order.gateway_order_id) for order in orders if order.gateway_order_id}
    if stored_ids and (len(stored_ids) != 1 or str(charge_id) not in stored_ids):
        return False, "This Tap charge does not belong to the selected order."

    expected_currency = {
        str(order.currency or "KWD").strip().upper()
        for order in orders
    }
    returned_currency = str(result.get("currency") or "").strip().upper()
    if len(expected_currency) != 1 or returned_currency not in expected_currency:
        return False, "Tap charge currency does not match the order."

    expected_amount = _expected_total(orders)
    returned_amount = _amount(result.get("amount"))
    if abs(expected_amount - returned_amount) > Decimal("0.01"):
        return False, "Tap charge amount does not match the order."

    metadata = result.get("metadata") or {}
    if len(orders) == 1:
        metadata_order_id = str(metadata.get("order_id") or "").strip()
        if metadata_order_id and metadata_order_id != str(orders[0].id):
            return False, "Tap charge metadata does not match the order."
    else:
        metadata_ids = {
            value.strip()
            for value in str(metadata.get("order_ids") or "").split(",")
            if value.strip()
        }
        expected_ids = {str(order.id) for order in orders}
        if metadata_ids and metadata_ids != expected_ids:
            return False, "Tap charge metadata does not match the batch."

    return True, ""


def _apply_tap_result(orders, result, charge_id):
    valid, message = _validate_retrieved_charge(orders, result, charge_id)
    if not valid:
        raise ValueError(message)

    status = str(result.get("status") or "").upper()
    payment_status = _payment_status_from_tap(status)
    transaction_id = _transaction_id(result, charge_id)

    for order in orders:
        order.payment_gateway = "TAP"
        order.gateway_order_id = charge_id
        order.gateway_payment_id = result.get("id")
        order.gateway_transaction_id = transaction_id
        order.gateway_response = result
        order.payment_status = payment_status

        if payment_status == "PAID" and str(order.status or "").upper() == "ACCEPTED":
            assign_order_to_kitchen(order, None)

    db.session.commit()
    return status, payment_status, transaction_id


def _web_base(success):
    if success and Config.TAP_SUCCESS_URL:
        return Config.TAP_SUCCESS_URL.rstrip("/")
    if (not success) and Config.TAP_CANCEL_URL:
        return Config.TAP_CANCEL_URL.rstrip("/")
    if Config.WEB_APP_URL:
        return (
            f"{Config.WEB_APP_URL}/payment-success"
            if success
            else f"{Config.WEB_APP_URL}/payment-failed"
        )
    return ""


def _result_redirect(platform, success, transaction_id, orders, charge_id, tap_status):
    order_ids = ",".join(str(order.id) for order in orders)
    query = urlencode({
        "order_id": orders[0].id if len(orders) == 1 else "",
        "order_ids": order_ids if len(orders) > 1 else "",
        "tap_id": charge_id,
        "status": tap_status,
    })
    transaction_path = quote(str(transaction_id or charge_id), safe="")

    if _platform(platform) == "app":
        scheme = Config.APP_DEEP_LINK_SCHEME or "cakentake"
        route = "payment-success" if success else "payment-failed"
        return f"{scheme}:///{route}/{transaction_path}?{query}"

    base = _web_base(success)
    if not base:
        return ""
    return f"{base}/{transaction_path}?{query}"


def _json_result(orders, charge_id, tap_status, payment_status, transaction_id):
    return {
        "success": payment_status == "PAID",
        "gateway": "TAP",
        "tap_status": tap_status,
        "payment_status": payment_status,
        "order_id": orders[0].id if len(orders) == 1 else None,
        "order_ids": [order.id for order in orders],
        "tap_charge_id": charge_id,
        "transaction_id": transaction_id,
    }


def _can_manage_orders(orders):
    identity = int(get_jwt_identity())
    role = str((get_jwt() or {}).get("role") or "").upper()

    if role in {"ADMIN", "SHOP_MANAGER"}:
        return True

    if role == "DRIVER":
        return all(
            int(order.driver_id or 0) == identity
            for order in orders
        )

    return all(
        int(order.user_id or 0) == identity
        or int(order.created_by or 0) == identity
        for order in orders
    )

def _stored_create_attempt(orders):
    responses = [
        order.gateway_response
        for order in orders
        if isinstance(order.gateway_response, dict)
    ]
    if not responses:
        return None
    keys = {
        str(response.get("merchant_attempt_key") or "")
        for response in responses
        if response.get("merchant_attempt_key")
    }
    statuses = {
        str(response.get("merchant_create_status") or "")
        for response in responses
    }
    if len(keys) == 1 and statuses == {"CREATING"}:
        return next(iter(keys))
    return None


def _save_create_attempt(orders, key, platform, status="CREATING", extra=None):
    payload = {
        "merchant_attempt_key": key,
        "merchant_create_status": status,
        "client_platform": platform,
    }
    if extra:
        payload.update(extra)
    for order in orders:
        order.gateway_response = dict(payload)
        order.payment_gateway = "TAP"
        order.payment_status = "PENDING"
    db.session.commit()


def _existing_charge_response(orders, client_platform, force_new_attempt=False):
    charge_ids = {str(order.gateway_order_id) for order in orders if order.gateway_order_id}
    if len(charge_ids) != 1:
        return None

    charge_id = next(iter(charge_ids))
    result = verify_charge(charge_id)
    if result.get("errors"):
        # Safer to ask the caller to retry later than risk creating a second
        # live charge while the first charge status is unknown.
        return jsonify({
            "success": False,
            "error": "Unable to confirm the existing Tap payment. Please retry shortly.",
            "retryable": True,
        }), 503

    try:
        tap_status, payment_status, transaction_id = _apply_tap_result(
            orders, result, charge_id
        )
    except ValueError as exc:
        return jsonify({"success": False, "error": str(exc)}), 400

    transaction = result.get("transaction") or {}
    payment_url = transaction.get("url")
    if payment_status == "PAID":
        return jsonify({
            **_json_result(orders, charge_id, tap_status, payment_status, transaction_id),
            "payment_url": None,
            "already_paid": True,
            "client_platform": client_platform,
        }), 200

    # APP-ONLY retry behavior:
    # after verifying that the previous charge is not paid, explicitly allow
    # the mobile app to create a fresh Tap/KNET charge instead of reopening
    # an already-consumed hosted-payment URL. Web behavior remains unchanged.
    if force_new_attempt:
        return None

    if tap_status not in FAILURE_STATUSES and payment_url:
        return jsonify({
            "success": True,
            "gateway": "TAP",
            "payment_method": orders[0].payment_method,
            "order_ids": [order.id for order in orders],
            "order_numbers": [order.order_number for order in orders],
            "tap_charge_id": charge_id,
            "payment_url": payment_url,
            "tap_status": tap_status,
            "payment_status": payment_status,
            "amount": float(_expected_total(orders)),
            "currency": orders[0].currency,
            "client_platform": client_platform,
            "reused_existing_charge": True,
        }), 200

    # Terminal old charge: caller may safely create a fresh attempt for the same order.
    return None


@payment_bp.route("/payments", methods=["POST"])
@jwt_required()
def create_payment():
    data = request.get_json() or {}
    if not data.get("order_id"):
        return jsonify({"error": "order_id is required"}), 400

    order = Order.query.get_or_404(data["order_id"])
    if not _can_manage_orders([order]):
        return jsonify({"error": "You cannot create a payment for this order."}), 403

    order.payment_method = data.get("payment_method", "TAP")
    db.session.commit()
    return jsonify({
        "message": "Payment initiated",
        "order_id": order.id,
        "payment_method": order.payment_method,
    }), 201


@payment_bp.route("/payments/<int:order_id>", methods=["GET"])
@jwt_required()
def get_payment(order_id):
    order = Order.query.get_or_404(order_id)
    if not _can_manage_orders([order]):
        return jsonify({"error": "You cannot view this payment."}), 403

    return jsonify({
        "order_id": order.id,
        "payment_method": order.payment_method,
        "payment_status": order.payment_status,
        "payment_gateway": order.payment_gateway,
        "gateway_order_id": order.gateway_order_id,
        "gateway_payment_id": order.gateway_payment_id,
        "gateway_transaction_id": order.gateway_transaction_id,
        "total": float(order.grand_total or order.total or 0),
        "currency": order.currency,
    }), 200


@payment_bp.route("/payments/create-link", methods=["POST"])
@jwt_required()
def create_payment_link():
    data = request.get_json() or {}
    client_platform = _platform(data.get("client_platform"))

    # IMPORTANT: force_new_attempt is intentionally APP-ONLY.
    # A web request can never activate this behavior, even if it sends the flag.
    force_new_attempt = (
        client_platform == "app"
        and data.get("force_new_attempt") is True
    )

    # Fail before creating an order-side payment attempt if deployment URLs or
    # Tap credentials are incomplete. In production API_BASE_URL must be the
    # public HTTPS backend URL because Tap itself calls these return endpoints.
    if not Config.TAP_SECRET_KEY:
        return jsonify({
            "success": False,
            "error": "Tap payment is not configured on the server.",
        }), 503
    if not (Config.TAP_REDIRECT_BASE_URL or Config.API_BASE_URL):
        return jsonify({
            "success": False,
            "error": "Tap redirect base URL is not configured on the server.",
        }), 503
    if client_platform == "web" and (not _web_base(True) or not _web_base(False)):
        return jsonify({
            "success": False,
            "error": "WEB_APP_URL is not configured for payment return pages.",
        }), 503

    raw_ids = data.get("order_ids") or (
        [data.get("order_id")] if data.get("order_id") else []
    )
    try:
        order_ids = list(dict.fromkeys(int(value) for value in raw_ids if value is not None))
    except (TypeError, ValueError):
        return jsonify({"error": "order_id/order_ids must contain valid integers"}), 400

    if not order_ids:
        return jsonify({"error": "order_id or order_ids is required"}), 400

    try:
        # Lock only the base orders table first. Order has several eager-loaded
        # relationships that compile to LEFT OUTER JOINs; PostgreSQL rejects a
        # plain FOR UPDATE on the nullable side of those joins. Keeping the row
        # lock in this scalar query prevents concurrent payment creation without
        # applying FOR UPDATE to the relationship joins.
        locked_rows = (
            db.session.query(Order.id)
            .filter(Order.id.in_(order_ids))
            .with_for_update()
            .all()
        )
        locked_order_ids = [row[0] for row in locked_rows]

        orders = (
            Order.query
            .filter(Order.id.in_(locked_order_ids))
            .all()
        )

        if len(orders) != len(order_ids):
            db.session.rollback()
            return jsonify({"error": "One or more orders were not found"}), 404

        if not _can_manage_orders(orders):
            db.session.rollback()
            return jsonify({"error": "You cannot create payment for one or more orders."}), 403

        creator_ids = {order.created_by for order in orders}
        if len(orders) > 1 and len(creator_ids) > 1:
            db.session.rollback()
            return jsonify({
                "error": "All orders in one payment must belong to the same agent"
            }), 400

        already_paid = [
            order.order_number
            for order in orders
            if str(order.payment_status or "").upper() == "PAID"
        ]
        if already_paid:
            db.session.rollback()
            return jsonify({
                "error": f"Order(s) already paid: {', '.join(already_paid)}"
            }), 400

        currencies = {
            str(order.currency or "KWD").strip().upper()
            for order in orders
        }
        if len(currencies) != 1:
            db.session.rollback()
            return jsonify({
                "error": "Cannot combine orders with different currencies into one payment"
            }), 400
        currency = next(iter(currencies))

        existing = _existing_charge_response(
            orders,
            client_platform,
            force_new_attempt=force_new_attempt,
        )
        if existing is not None:
            return existing

        # Normal web flow keeps the exact existing idempotency behavior.
        # Only an explicit mobile-app retry gets a brand-new attempt key.
        attempt_key = None if force_new_attempt else _stored_create_attempt(orders)
        if not attempt_key:
            attempt_key = f"ct-{orders[0].id}-{uuid4().hex}"
            _save_create_attempt(orders, attempt_key, client_platform)

        total_amount = float(_expected_total(orders))

        if len(orders) == 1:
            result = (
                create_knet_charge(orders[0], client_platform, attempt_key)
                if currency == "KWD"
                else create_tap_charge(orders[0], client_platform, attempt_key)
            )
        else:
            result = (
                create_knet_charge_batch(
                    orders, total_amount, client_platform, attempt_key
                )
                if currency == "KWD"
                else create_tap_charge_batch(
                    orders, total_amount, currency, client_platform, attempt_key
                )
            )

        if result.get("errors"):
            retry_same = bool(result.get("retry_same_idempotency"))
            tap_errors = result.get("errors") or []
            first_error = tap_errors[0] if tap_errors else {}
            if isinstance(first_error, dict):
                tap_message = (
                    first_error.get("description")
                    or first_error.get("message")
                    or first_error.get("code")
                )
            else:
                tap_message = str(first_error or "")
            tap_message = str(tap_message or "Tap rejected the payment request")

            _save_create_attempt(
                orders,
                attempt_key,
                client_platform,
                "CREATING" if retry_same else "CREATE_FAILED",
                {"tap_errors": tap_errors},
            )
            return jsonify({
                "success": False,
                "gateway": "TAP",
                "error": tap_message,
                "message": tap_message,
                "errors": tap_errors,
                "retryable": retry_same,
            }), 503 if retry_same else 400

        transaction = result.get("transaction") or {}
        payment_url = transaction.get("url")
        charge_id = result.get("id")
        tap_status = str(result.get("status") or "").upper()

        if not charge_id:
            _save_create_attempt(
                orders,
                attempt_key,
                client_platform,
                "CREATE_FAILED",
                {"tap_response": result},
            )
            return jsonify({
                "success": False,
                "gateway": "TAP",
                "error": "Tap did not return a charge id",
            }), 502

        if currency == "KWD" and tap_status not in SUCCESS_STATUSES and not payment_url:
            _save_create_attempt(
                orders,
                attempt_key,
                client_platform,
                "CREATE_FAILED",
                {"tap_response": result},
            )
            return jsonify({
                "success": False,
                "gateway": "TAP",
                "error": "Tap did not return the KNET payment page URL.",
                "tap_status": tap_status,
            }), 502

        payment_method = "KNET" if currency == "KWD" else "CARD"
        for order in orders:
            order.gateway_order_id = charge_id
            order.payment_method = payment_method
            order.payment_status = _payment_status_from_tap(tap_status)
            order.gateway_response = result
        db.session.commit()

        # A direct CAPTURED response is unusual for redirect payment methods, but
        # handle it correctly rather than forcing the frontend to expect a URL.
        transaction_id = _transaction_id(result, charge_id)
        if tap_status in SUCCESS_STATUSES:
            try:
                _, _, transaction_id = _apply_tap_result(orders, result, charge_id)
            except ValueError as exc:
                return jsonify({"success": False, "error": str(exc)}), 400

        return jsonify({
            "success": True,
            "gateway": "TAP",
            "payment_method": payment_method,
            "order_ids": [order.id for order in orders],
            "order_numbers": [order.order_number for order in orders],
            "tap_charge_id": charge_id,
            "transaction_id": transaction_id,
            "payment_url": payment_url,
            "tap_status": tap_status,
            "payment_status": orders[0].payment_status,
            "amount": total_amount,
            "currency": currency,
            "client_platform": client_platform,
        }), 200

    except Exception:
        db.session.rollback()
        current_app.logger.exception("Failed to create Tap payment link")
        return jsonify({
            "success": False,
            "error": "Failed to create payment link",
        }), 500


@payment_bp.route(
    "/payments/<int:order_id>/verify",
    defaults={"client_platform": "web"},
    methods=["GET"],
)
@payment_bp.route(
    "/payments/<int:order_id>/verify/<client_platform>",
    methods=["GET"],
)
def verify_payment(order_id, client_platform):
    order = Order.query.get_or_404(order_id)
    charge_id = request.args.get("tap_id") or order.gateway_order_id
    if not charge_id:
        return jsonify({
            "success": False,
            "error": "Unable to determine Tap charge ID",
        }), 400

    # Never let a caller bind another Tap charge to this order.
    if order.gateway_order_id and str(order.gateway_order_id) != str(charge_id):
        return jsonify({
            "success": False,
            "error": "Tap charge does not match this order",
        }), 400

    result = verify_charge(charge_id)
    if result.get("errors"):
        return jsonify({
            "success": False,
            "error": "Failed to verify Tap payment",
            "errors": result.get("errors"),
        }), 502

    try:
        tap_status, payment_status, transaction_id = _apply_tap_result(
            [order], result, charge_id
        )
    except ValueError as exc:
        return jsonify({"success": False, "error": str(exc)}), 400

    payload = _json_result(
        [order], charge_id, tap_status, payment_status, transaction_id
    )

    if request.args.get("format") == "json":
        return jsonify(payload), 200

    success = payment_status == "PAID"
    target = _result_redirect(
        client_platform,
        success,
        transaction_id,
        [order],
        charge_id,
        tap_status,
    )
    if target:
        return redirect(target, code=302)

    return jsonify(payload), 200


@payment_bp.route(
    "/payments/batch/verify",
    defaults={"client_platform": "web"},
    methods=["GET"],
)
@payment_bp.route(
    "/payments/batch/verify/<client_platform>",
    methods=["GET"],
)
def verify_batch_payment(client_platform):
    charge_id = request.args.get("tap_id")
    if not charge_id:
        return jsonify({
            "success": False,
            "error": "Unable to determine Tap charge ID",
        }), 400

    orders = Order.query.filter_by(gateway_order_id=charge_id).all()
    if not orders:
        return jsonify({
            "success": False,
            "error": "No orders found for this payment",
        }), 404

    result = verify_charge(charge_id)
    if result.get("errors"):
        return jsonify({
            "success": False,
            "error": "Failed to verify Tap payment",
            "errors": result.get("errors"),
        }), 502

    try:
        tap_status, payment_status, transaction_id = _apply_tap_result(
            orders, result, charge_id
        )
    except ValueError as exc:
        return jsonify({"success": False, "error": str(exc)}), 400

    payload = _json_result(
        orders, charge_id, tap_status, payment_status, transaction_id
    )

    if request.args.get("format") == "json":
        return jsonify(payload), 200

    target = _result_redirect(
        client_platform,
        payment_status == "PAID",
        transaction_id,
        orders,
        charge_id,
        tap_status,
    )
    if target:
        return redirect(target, code=302)

    return jsonify(payload), 200


@payment_bp.route("/payments/tap/webhook", methods=["POST"])
def tap_webhook():
    payload = request.get_json(silent=True) or {}
    charge_id = payload.get("id")
    posted_hash = request.headers.get("hashstring")

    if not charge_id:
        return jsonify({"error": "Missing Tap charge id"}), 400

    if not validate_webhook_hash(payload, posted_hash):
        return jsonify({"error": "Invalid Tap webhook signature"}), 401

    orders = Order.query.filter_by(gateway_order_id=charge_id).all()
    if not orders:
        # A valid webhook can arrive before our create-link response commit in a
        # very fast transaction. Returning 200 prevents needless retries; the
        # redirect/status refresh will reconcile the order immediately after.
        return jsonify({"received": True, "matched": False}), 200

    # Retrieve from Tap instead of trusting the posted body as the source of truth.
    result = verify_charge(charge_id)
    if result.get("errors"):
        return jsonify({"error": "Unable to retrieve Tap charge"}), 502

    try:
        tap_status, payment_status, transaction_id = _apply_tap_result(
            orders, result, charge_id
        )
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    return jsonify({
        "received": True,
        "matched": True,
        "tap_status": tap_status,
        "payment_status": payment_status,
        "transaction_id": transaction_id,
        "order_ids": [order.id for order in orders],
    }), 200


@payment_bp.route("/payments/<int:order_id>/mark-paid", methods=["POST"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER", "SALES_AGENT"])
def mark_paid(order_id):
    order = Order.query.get_or_404(order_id)
    data = request.get_json(silent=True) or {}

    method = str(
        data.get("payment_method") or order.payment_method or "COD"
    ).strip().upper()
    if method == "CASH":
        method = "COD"

    order.payment_method = method
    order.payment_status = "PAID"

    if str(order.status or "").upper() == "ACCEPTED":
        assign_order_to_kitchen(order, None)

    db.session.commit()
    return jsonify({
        "message": "Order marked as paid",
        "order": order.to_dict(),
    }), 200


@payment_bp.route("/payments/report", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "SHOP_MANAGER"])
def payment_report():
    paid_orders = Order.query.filter_by(payment_status="PAID").all()
    pending_orders = Order.query.filter_by(payment_status="PENDING").count()
    total_collected = sum(
        float(order.grand_total or order.total or 0)
        for order in paid_orders
    )

    by_method = (
        db.session.query(
            Order.payment_method,
            func.count(Order.id),
            func.sum(Order.grand_total),
        )
        .filter_by(payment_status="PAID")
        .group_by(Order.payment_method)
        .all()
    )

    return jsonify({
        "total_paid_orders": len(paid_orders),
        "pending_orders": pending_orders,
        "total_collected": total_collected,
        "by_method": [
            {
                "method": row[0],
                "count": row[1],
                "amount": float(row[2] or 0),
            }
            for row in by_method
        ],
    }), 200


@payment_bp.route("/invoices/<int:order_id>", methods=["GET"])
@jwt_required()
def get_invoice(order_id):
    order = Order.query.get_or_404(order_id)
    if not _can_manage_orders([order]):
        return jsonify({"error": "You cannot view this invoice."}), 403
    return jsonify({
        "invoice_number": f"INV-{order.order_number}",
        "issued_at": order.created_at.isoformat(),
        "order": order.to_dict(),
    }), 200


@payment_bp.route("/invoices/<int:order_id>/download", methods=["POST"])
@jwt_required()
def download_invoice(order_id):
    order = Order.query.get_or_404(order_id)
    if not _can_manage_orders([order]):
        return jsonify({"error": "You cannot access this invoice."}), 403
    return jsonify({
        "message": "Invoice download ready",
        "invoice_url": f"/invoices/{order_id}/file",
    }), 200


@payment_bp.route("/invoices/<int:order_id>/share-whatsapp", methods=["POST"])
@jwt_required()
def share_invoice_whatsapp(order_id):
    order = Order.query.get_or_404(order_id)
    if not _can_manage_orders([order]):
        return jsonify({"error": "You cannot share this invoice."}), 403
    return jsonify({
        "message": "Invoice shared via WhatsApp",
        "order_id": order_id,
    }), 200
