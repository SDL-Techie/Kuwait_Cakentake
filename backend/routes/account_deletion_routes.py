from datetime import datetime
import uuid

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func

from extensions import db
from middleware.role import role_required
from models.account_deletion_request import AccountDeletionRequest
from models.user import User
from models.misc import Notification
from services.push_notification_service import send_transactional_push

account_deletion_bp = Blueprint("account_deletion", __name__)

CUSTOMER_ROLES = {"USER", "CUSTOMER"}
DELETION_WINDOW_DAYS = 7


def _customer_role(user):
    return str(getattr(user, "role", "") or "").strip().upper() in CUSTOMER_ROLES


def _status_message(status):
    normalized = str(status or "PENDING").upper()
    if normalized == "APPROVED":
        return "Your CakeNTake account deletion has been completed."
    if normalized == "REJECTED":
        return (
            "Your deletion request could not be completed. "
            "Please contact CakeNTake support if you still want the account deleted."
        )
    return (
        f"Your account deletion request is being processed and will be completed "
        f"within {DELETION_WINDOW_DAYS} days."
    )


# ─── USER: submit a real deletion request ────────────────────────────────
def _submit_deletion_request_for_user(user, data):
    """Verify identity and create a real, reviewable deletion request.

    The user is blocked from new sign-ins while the request is pending. The
    owner/admin completes the privacy scrub from the Deletion Requests screen.
    """
    if not _customer_role(user):
        return jsonify({
            "error": "Account deletion from this page is available for customer accounts only."
        }), 403

    password = data.get("password")
    reason = str(data.get("reason") or "").strip() or "Not provided"

    if not password:
        return jsonify({"error": "Password is required"}), 400
    if not user.check_password(password):
        return jsonify({"error": "Invalid account credentials"}), 401

    existing = AccountDeletionRequest.query.filter_by(
        user_id=user.id, status="PENDING"
    ).first()
    if existing:
        # Idempotent response: reopening the deletion page should never create
        # duplicate requests or force the customer through support.
        return jsonify({
            "message": _status_message(existing.status),
            "request_id": existing.id,
            "status": existing.status,
            "status_token": existing.public_token,
            "deletion_window_days": DELETION_WINDOW_DAYS,
        }), 200

    deletion_request = AccountDeletionRequest(
        user_id=user.id,
        user_name=f"{user.first_name} {user.last_name}".strip(),
        user_email=user.email,
        user_phone=user.phone_no,
        reason=reason,
        status="PENDING",
    )
    db.session.add(deletion_request)
    db.session.flush()

    # Surface the request in both the dedicated admin screen and the existing
    # owner/admin notification stream. No additional customer-service step is
    # required from the customer after submitting this form.
    reviewers = User.query.filter(
        User.role.in_(["ADMIN", "OWNER"]),
        User.is_active.is_(True),
    ).all()
    for reviewer in reviewers:
        db.session.add(Notification(
            user_id=reviewer.id,
            title="Account deletion request",
            message=(
                f"{deletion_request.user_name or 'A customer'} submitted an "
                "account deletion request."
            ),
            notification_type="ACCOUNT_DELETION_REQUEST",
            reference_id=deletion_request.id,
        ))

    # Stop new sign-ins while deletion is pending. Existing mobile sessions are
    # also invalidated by the account/session monitor. The public status token
    # remains available even after personal data is scrubbed.
    user.is_active = False
    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({
            "error": "Unable to submit the deletion request right now. Please try again."
        }), 500

    return jsonify({
        "message": _status_message("PENDING"),
        "request_id": deletion_request.id,
        "status": deletion_request.status,
        "status_token": deletion_request.public_token,
        "deletion_window_days": DELETION_WINDOW_DAYS,
    }), 200


@account_deletion_bp.route("/account/delete-request", methods=["POST"])
@jwt_required()
def request_account_deletion():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    data = request.get_json(silent=True) or {}
    return _submit_deletion_request_for_user(user, data)


@account_deletion_bp.route("/account/delete-request-public", methods=["POST"])
def request_account_deletion_public():
    """Submit from the external browser opened by the native app.

    Native AsyncStorage/JWT is not shared with Safari/Chrome, so the customer is
    re-authenticated using their registered email/phone and password.
    """
    data = request.get_json(silent=True) or {}
    identifier = str(data.get("identifier") or "").strip()
    if not identifier:
        return jsonify({"error": "Email or phone number is required"}), 400

    normalized = identifier.lower()
    user = User.query.filter(
        (func.lower(User.email) == normalized) | (User.phone_no == identifier)
    ).first()
    # Avoid account enumeration: unknown account and wrong password use the same
    # public-facing message/status.
    if not user:
        return jsonify({"error": "Invalid account credentials"}), 401

    return _submit_deletion_request_for_user(user, data)


@account_deletion_bp.route(
    "/account/delete-request-status/<string:status_token>", methods=["GET"]
)
def get_account_deletion_status(status_token):
    token = str(status_token or "").strip()
    if not token:
        return jsonify({"error": "Status token is required"}), 400

    deletion_request = AccountDeletionRequest.query.filter_by(
        public_token=token
    ).first()
    if not deletion_request:
        return jsonify({"error": "Deletion request not found"}), 404

    return jsonify({
        "status": deletion_request.status,
        "message": _status_message(deletion_request.status),
        "requested_at": (
            deletion_request.requested_at.isoformat()
            if deletion_request.requested_at else None
        ),
        "reviewed_at": (
            deletion_request.reviewed_at.isoformat()
            if deletion_request.reviewed_at else None
        ),
        "deletion_window_days": DELETION_WINDOW_DAYS,
    }), 200


def _scrub_customer_data(user):
    """Remove non-transactional customer data and scrub retained order history.

    A tombstone user row is retained because existing order/financial records use
    non-null foreign keys. The tombstone contains no customer contact details.
    """
    from models.address import Address
    from models.cart import Cart
    from models.coupon import Coupon
    from models.customer import Customer
    from models.loyalty import LoyaltyLedger
    from models.misc import AuditLog, CustomOrder, Permission
    from models.notification_recipient import NotificationRecipient
    from models.order import Order
    from models.push_token import PushToken
    from models.wishlist import Wishlist

    user_id = int(user.id)

    # Retain transactional order rows, but remove customer-identifying snapshots,
    # free-form messages, delivery proof and raw gateway payloads that may contain
    # contact details. Payment references/status/amounts remain for reconciliation.
    for order in Order.query.filter_by(user_id=user_id).all():
        order.customer_name = None
        order.customer_phone = None
        order.customer_email = None
        order.customer_alt_phone = None
        order.address_id = None
        order.delivery_address_json = None
        order.delivery_notes = None
        order.delivery_photo = None
        order.delivery_images = []
        order.customer_confirmation_name = None
        order.customer_confirmation_phone = None
        order.custom_cake_json = None
        order.greeting_message = None
        order.greeting_from = None
        order.greeting_to = None
        order.gateway_response = None

    # Custom-order/chatbot cake requests may contain names, phones, addresses,
    # uploads and custom design notes. Preserve only the operational row/linkage.
    for custom_order in CustomOrder.query.filter_by(customer_id=user_id).all():
        custom_order.description = "Deleted customer request"
        custom_order.images = []
        custom_order.notes = None
        custom_order.details = None
        custom_order.rejection_reason = None

    # Security/audit rows may be retained, but detach them from the deleted user
    # and remove IP/details that could identify the customer.
    for audit in AuditLog.query.filter_by(user_id=user_id).all():
        audit.user_id = None
        audit.details = {"account_deleted": True}
        audit.ip_address = None

    # Ephemeral/account-specific data is no longer needed once deletion completes.
    NotificationRecipient.query.filter_by(user_id=user_id).delete(synchronize_session=False)
    PushToken.query.filter_by(user_id=user_id).delete(synchronize_session=False)
    Wishlist.query.filter_by(user_id=user_id).delete(synchronize_session=False)
    Coupon.query.filter_by(user_id=user_id).delete(synchronize_session=False)
    LoyaltyLedger.query.filter_by(customer_id=user_id).delete(synchronize_session=False)
    Customer.query.filter_by(user_id=user_id).delete(synchronize_session=False)
    Permission.query.filter_by(user_id=user_id).delete(synchronize_session=False)
    Notification.query.filter_by(user_id=user_id).delete(synchronize_session=False)

    # CartItems use ORM delete-orphan cascading from Cart, so delete carts as ORM
    # objects rather than issuing a bulk Cart DELETE.
    for cart in Cart.query.filter_by(user_id=user_id).all():
        db.session.delete(cart)

    # Orders were detached from saved addresses above, so addresses can now go.
    Address.query.filter_by(user_id=user_id).delete(synchronize_session=False)

    # Keep an inert relational tombstone only. No email/name/phone/password that
    # the customer supplied remains in the active account record.
    # Keep the synthetic phone safely below the model's 25-character limit.
    anon_tag = uuid.uuid4().hex[:10]
    user.first_name = "Deleted"
    user.last_name = "Account"
    user.email = None
    user.phone_no = f"d{user_id}_{anon_tag}"[:25]
    user.set_password(uuid.uuid4().hex)
    user.role = "DELETED"
    user.currency_code = "KWD"
    user.loyalty_points = 0
    user.availability_status = "OFFLINE"
    user.rating = 0
    user.default_discount = 0
    user.is_active = False
    user.created_by = None


# ─── ADMIN: list requests ─────────────────────────────────────────────────
@account_deletion_bp.route("/admin/account-deletion-requests", methods=["GET"])
@jwt_required()
@role_required(["ADMIN", "OWNER"])
def list_deletion_requests():
    status = request.args.get("status", "PENDING").upper()
    query = AccountDeletionRequest.query
    if status != "ALL":
        query = query.filter_by(status=status)
    requests = query.order_by(AccountDeletionRequest.requested_at.desc()).all()
    return jsonify({"requests": [r.to_dict() for r in requests]}), 200


# ─── ADMIN: complete deletion ──────────────────────────────────────────────
@account_deletion_bp.route(
    "/admin/account-deletion-requests/<int:req_id>/approve", methods=["PUT"]
)
@jwt_required()
@role_required(["ADMIN", "OWNER"])
def approve_deletion_request(req_id):
    admin_id = int(get_jwt_identity())
    req = AccountDeletionRequest.query.get_or_404(req_id)

    if req.status != "PENDING":
        return jsonify({"error": "This request has already been reviewed"}), 400

    user = User.query.get(req.user_id) if req.user_id else None
    try:
        if user:
            _scrub_customer_data(user)

        req.status = "APPROVED"
        req.reviewed_at = datetime.utcnow()
        req.reviewed_by = admin_id
        # The opaque status token is intentionally retained for the privacy-safe
        # public confirmation page; all request snapshot PII is removed.
        req.user_name = "Deleted Account"
        req.user_email = None
        req.user_phone = None
        req.reason = "Deleted at customer request"
        req.admin_note = None
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({
            "error": "Account deletion could not be completed safely. No completion was recorded; please retry."
        }), 500

    # Do not send a premature "completed" push before the database commit.
    # Approval removes push/device identifiers as part of the privacy scrub, so
    # the public opaque-token status page is the authoritative completion proof.
    return jsonify({
        "message": "Account deletion completed",
        "request": req.to_dict(),
    }), 200


# ─── ADMIN: unable to complete / cancel request ────────────────────────────
@account_deletion_bp.route(
    "/admin/account-deletion-requests/<int:req_id>/reject", methods=["PUT"]
)
@jwt_required()
@role_required(["ADMIN", "OWNER"])
def reject_deletion_request(req_id):
    admin_id = int(get_jwt_identity())
    req = AccountDeletionRequest.query.get_or_404(req_id)

    if req.status != "PENDING":
        return jsonify({"error": "This request has already been reviewed"}), 400

    data = request.get_json(silent=True) or {}
    user = User.query.get(req.user_id) if req.user_id else None
    if user:
        user.is_active = True

    req.status = "REJECTED"
    req.reviewed_at = datetime.utcnow()
    req.reviewed_by = admin_id
    req.admin_note = data.get("admin_note")
    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({"error": "Unable to update this deletion request."}), 500

    if user:
        try:
            send_transactional_push(
                [user.id],
                "Account deletion request update",
                "Your CakeNTake deletion request could not be completed. Please contact support if you still want the account deleted.",
                {"type": "ACCOUNT_DELETION_REJECTED"},
            )
        except Exception:
            pass

    return jsonify({
        "message": "Deletion request marked as unable to complete",
        "request": req.to_dict(),
    }), 200
