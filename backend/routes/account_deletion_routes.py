from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.user import User
from models.account_deletion_request import AccountDeletionRequest
from middleware.role import role_required
import uuid

account_deletion_bp = Blueprint("account_deletion", __name__)


# ─── USER: submit a deletion request ──────────────────────────────────────
@account_deletion_bp.route("/account/delete-request", methods=["POST"])
@jwt_required()
def request_account_deletion():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    data = request.get_json(silent=True) or {}

    password = data.get("password")
    reason = str(data.get("reason") or "").strip()

    if not password:
        return jsonify({"error": "Password is required"}), 400
    if not user.check_password(password):
        return jsonify({"error": "Incorrect password"}), 401
    if not reason:
        return jsonify({"error": "Please tell us why you're leaving"}), 400

    existing = AccountDeletionRequest.query.filter_by(
        user_id=user.id, status="PENDING"
    ).first()
    if existing:
        return jsonify({"error": "A deletion request is already pending review"}), 400

    req = AccountDeletionRequest(
        user_id=user.id,
        user_name=f"{user.first_name} {user.last_name}",
        user_email=user.email,
        user_phone=user.phone_no,
        reason=reason,
        status="PENDING",
    )
    db.session.add(req)

    # Block login immediately — reuses the same is_active check login() already has
    user.is_active = False

    db.session.commit()

    return jsonify({
        "message": "Your account deletion request has been submitted. "
                    "Your account will be permanently deleted within a week "
                    "once reviewed. You have been logged out."
    }), 200


# ─── ADMIN: list requests ──────────────────────────────────────────────────
@account_deletion_bp.route("/admin/account-deletion-requests", methods=["GET"])
@jwt_required()
@role_required(["ADMIN"])
def list_deletion_requests():
    status = request.args.get("status", "PENDING").upper()
    query = AccountDeletionRequest.query
    if status != "ALL":
        query = query.filter_by(status=status)
    requests = query.order_by(AccountDeletionRequest.requested_at.desc()).all()
    return jsonify({"requests": [r.to_dict() for r in requests]}), 200


# ─── ADMIN: approve → permanently delete the user ──────────────────────────
@account_deletion_bp.route("/admin/account-deletion-requests/<int:req_id>/approve", methods=["PUT"])
@jwt_required()
@role_required(["ADMIN"])
def approve_deletion_request(req_id):
    admin_id = int(get_jwt_identity())
    req = AccountDeletionRequest.query.get_or_404(req_id)

    if req.status != "PENDING":
        return jsonify({"error": "This request has already been reviewed"}), 400

    user = User.query.get(req.user_id) if req.user_id else None
    if user:
        # Anonymize instead of hard-delete: wipes personal data, keeps the
        # row so orders/coupons/wishlist/etc. that reference it don't
        # violate NOT NULL FK constraints elsewhere in the schema.
        anon_tag = uuid.uuid4().hex[:10]
        user.first_name = "Deleted"
        user.last_name = "User"
        user.email = f"deleted_{anon_tag}@deleted.local"
        user.phone_no = f"deleted_{anon_tag}"
        user.set_password(uuid.uuid4().hex)   # unusable random password
        user.is_active = False

    req.status = "APPROVED"
    req.reviewed_at = datetime.utcnow()
    req.reviewed_by = admin_id
    db.session.commit()

    return jsonify({"message": "Account permanently deleted", "request": req.to_dict()}), 200

# ─── ADMIN: reject → reactivate the user ───────────────────────────────────
@account_deletion_bp.route("/admin/account-deletion-requests/<int:req_id>/reject", methods=["PUT"])
@jwt_required()
@role_required(["ADMIN"])
def reject_deletion_request(req_id):
    admin_id = int(get_jwt_identity())
    req = AccountDeletionRequest.query.get_or_404(req_id)

    if req.status != "PENDING":
        return jsonify({"error": "This request has already been reviewed"}), 400

    data = request.get_json(silent=True) or {}
    user = User.query.get(req.user_id) if req.user_id else None
    if user:
        user.is_active = True  # let them log back in

    req.status = "REJECTED"
    req.reviewed_at = datetime.utcnow()
    req.reviewed_by = admin_id
    req.admin_note = data.get("admin_note")
    db.session.commit()

    return jsonify({"message": "Request rejected, account reactivated", "request": req.to_dict()}), 200