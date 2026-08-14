from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required
from sqlalchemy import or_

from extensions import db
from middleware.role import role_required
from models.notification_campaign import NotificationCampaign
from models.notification_recipient import NotificationRecipient
from models.push_token import PushToken
from services.push_notification_service import check_expo_receipts, send_campaign

notification_campaign_bp = Blueprint(
    "notification_campaigns",
    __name__,
    url_prefix="/notification-campaigns",
)
ROLES = ["ADMIN", "SHOP_MANAGER", "SALES_AGENT"]
VALID_AUDIENCES = {"ALL_CUSTOMERS", "LOYALTY_MEMBERS", "SPECIFIC_USERS", "STAFF_ROLES"}
VALID_PLATFORMS = {"BOTH", "ANDROID", "IOS"}
VALID_ACTIONS = {"NO_ACTION", "OPEN_HOME", "OPEN_PRODUCT", "OPEN_CATEGORY", "OPEN_PROMOTION", "OPEN_ORDER"}
TARGET_REQUIRED_ACTIONS = {"OPEN_PRODUCT", "OPEN_CATEGORY", "OPEN_PROMOTION", "OPEN_ORDER"}


def _current_user_id():
    return int(get_jwt_identity())


def _current_role():
    return str(get_jwt().get("role") or "").upper()


def _visible_campaign_query():
    query = NotificationCampaign.query
    if _current_role() != "ADMIN":
        query = query.filter(NotificationCampaign.created_by == _current_user_id())
    return query


def _get_visible_campaign_or_404(campaign_id):
    return _visible_campaign_query().filter(NotificationCampaign.id == campaign_id).first_or_404()


def _validate_audience(audience_type, payload):
    if audience_type not in VALID_AUDIENCES:
        return "Invalid audience type"
    if audience_type == "SPECIFIC_USERS" and not payload.get("user_ids"):
        return "Select at least one user"
    if audience_type == "STAFF_ROLES" and not payload.get("roles"):
        return "Select at least one staff role"
    return None


@notification_campaign_bp.post("/register-token")
@jwt_required()
def register_token():
    user_id = _current_user_id()
    data = request.get_json(silent=True) or {}
    token = str(data.get("token") or "").strip()
    platform = str(data.get("platform") or "UNKNOWN").upper()

    if not token:
        return jsonify({"error": "Push token is required"}), 400
    if platform not in {"ANDROID", "IOS", "UNKNOWN"}:
        return jsonify({"error": "Invalid platform"}), 400

    row = PushToken.query.filter_by(token=token).first()
    if row is None:
        row = PushToken(token=token, user_id=user_id)
        db.session.add(row)

    row.user_id = user_id
    row.platform = platform
    row.device_name = str(data.get("device_name") or "")[:120] or None
    row.is_active = True
    db.session.commit()
    return jsonify({"message": "Push token registered", "token": row.to_dict()}), 200


@notification_campaign_bp.post("/unregister-token")
@jwt_required()
def unregister_token():
    data = request.get_json(silent=True) or {}
    token = str(data.get("token") or "").strip()
    if not token:
        return jsonify({"error": "Push token is required"}), 400

    row = PushToken.query.filter_by(user_id=_current_user_id(), token=token).first()
    if row:
        row.is_active = False
        db.session.commit()
    return jsonify({"message": "Push token unregistered"}), 200


@notification_campaign_bp.post("/upload-image")
@role_required(ROLES)
def upload_image():
    import cloudinary.uploader

    image = request.files.get("image")
    if not image:
        return jsonify({"error": "No image provided"}), 400
    if image.mimetype not in {"image/jpeg", "image/png", "image/webp"}:
        return jsonify({"error": "Only JPEG, PNG and WebP images are allowed"}), 400

    result = cloudinary.uploader.upload(
        image,
        folder="notification_campaigns",
        resource_type="image",
        transformation=[{"width": 1600, "height": 900, "crop": "limit", "quality": "auto"}],
    )
    return jsonify({"image_url": result["secure_url"], "public_id": result.get("public_id")}), 200


@notification_campaign_bp.post("/receipts/check")
@role_required(ROLES)
def check_receipts():
    return jsonify(check_expo_receipts()), 200


@notification_campaign_bp.post("/<int:campaign_id>/opened")
@jwt_required()
def mark_opened(campaign_id):
    row = (
        NotificationRecipient.query.filter_by(
            campaign_id=campaign_id,
            user_id=_current_user_id(),
        )
        .order_by(NotificationRecipient.id.desc())
        .first()
    )
    if row and not row.opened_at:
        row.opened_at = datetime.utcnow()
        db.session.commit()
    return jsonify({"message": "Open recorded"}), 200


@notification_campaign_bp.get("")
@role_required(ROLES)
def list_campaigns():
    query = _visible_campaign_query()
    status = str(request.args.get("status") or "").upper()
    search = str(request.args.get("search") or "").strip()

    if status and status != "ALL":
        query = query.filter(NotificationCampaign.status == status)
    if search:
        query = query.filter(
            or_(
                NotificationCampaign.campaign_name.ilike(f"%{search}%"),
                NotificationCampaign.title.ilike(f"%{search}%"),
            )
        )

    items = query.order_by(NotificationCampaign.created_at.desc()).all()
    return jsonify({"campaigns": [item.to_dict() for item in items]}), 200


@notification_campaign_bp.get("/stats")
@role_required(ROLES)
def stats():
    query = _visible_campaign_query()
    return jsonify(
        {
            "total_sent": query.filter(NotificationCampaign.status.in_(["SENT", "PARTIALLY_FAILED"])).count(),
            "scheduled": query.filter(NotificationCampaign.status == "SCHEDULED").count(),
            "drafts": query.filter(NotificationCampaign.status == "DRAFT").count(),
            "failed": query.filter(NotificationCampaign.status == "FAILED").count(),
        }
    ), 200


@notification_campaign_bp.post("")
@role_required(ROLES)
def create_campaign():
    data = request.get_json(silent=True) or {}
    required = ["campaign_name", "title", "message"]
    missing = [field for field in required if not str(data.get(field) or "").strip()]
    if missing:
        return jsonify({"error": "Missing required fields", "fields": missing}), 400

    audience_type = str(data.get("audience_type") or "ALL_CUSTOMERS").upper()
    audience_payload = data.get("audience_payload") or {}
    audience_error = _validate_audience(audience_type, audience_payload)
    if audience_error:
        return jsonify({"error": audience_error}), 400

    platform = str(data.get("platform") or "BOTH").upper()
    if platform not in VALID_PLATFORMS:
        return jsonify({"error": "Invalid platform"}), 400

    click_action = str(data.get("click_action") or "OPEN_HOME").upper()
    if click_action not in VALID_ACTIONS:
        return jsonify({"error": "Invalid click action"}), 400

    target_id = data.get("target_id")
    if click_action in TARGET_REQUIRED_ACTIONS:
        if target_id is None or not str(target_id).isdigit():
            return jsonify({"error": "A valid target is required for the selected click action"}), 400
        target_id = int(target_id)
    else:
        target_id = None

    scheduled_at = None
    if data.get("scheduled_at"):
        try:
            scheduled_at = datetime.fromisoformat(str(data["scheduled_at"]).replace("Z", "+00:00")).replace(tzinfo=None)
        except ValueError:
            return jsonify({"error": "Invalid scheduled_at"}), 400

    mode = str(data.get("send_mode") or "NOW").upper()
    save_as_draft = bool(data.get("save_as_draft"))
    if mode not in {"NOW", "SCHEDULE"}:
        return jsonify({"error": "Invalid send mode"}), 400
    if mode == "SCHEDULE" and not save_as_draft and (not scheduled_at or scheduled_at <= datetime.utcnow()):
        return jsonify({"error": "Scheduled time must be in the future"}), 400

    row = NotificationCampaign(
        campaign_name=str(data["campaign_name"]).strip(),
        title=str(data["title"]).strip(),
        message=str(data["message"]).strip(),
        notification_type=str(data.get("notification_type") or "ANNOUNCEMENT").upper(),
        image_url=data.get("image_url"),
        audience_type=audience_type,
        audience_payload=audience_payload,
        platform=platform,
        click_action=click_action,
        target_id=target_id,
        send_mode=mode,
        scheduled_at=scheduled_at,
        status="DRAFT" if save_as_draft else ("SCHEDULED" if mode == "SCHEDULE" else "DRAFT"),
        created_by=_current_user_id(),
    )
    db.session.add(row)
    db.session.commit()

    if not save_as_draft and mode == "NOW":
        row = send_campaign(row)
    return jsonify({"message": "Campaign created", "campaign": row.to_dict()}), 201


@notification_campaign_bp.get("/<int:campaign_id>")
@role_required(ROLES)
def detail(campaign_id):
    row = _get_visible_campaign_or_404(campaign_id)
    recipients = NotificationRecipient.query.filter_by(campaign_id=row.id).all()
    return jsonify(
        {
            "campaign": row.to_dict(),
            "recipients": [recipient.to_dict() for recipient in recipients],
        }
    ), 200


@notification_campaign_bp.post("/<int:campaign_id>/send")
@role_required(ROLES)
def send(campaign_id):
    row = _get_visible_campaign_or_404(campaign_id)
    if row.status in {"SENT", "SENDING"}:
        return jsonify({"error": "Campaign is already sent or currently sending"}), 409
    row = send_campaign(row)
    return jsonify({"message": "Campaign processed", "campaign": row.to_dict()}), 200


@notification_campaign_bp.post("/<int:campaign_id>/cancel")
@role_required(ROLES)
def cancel(campaign_id):
    row = _get_visible_campaign_or_404(campaign_id)
    if row.status != "SCHEDULED":
        return jsonify({"error": "Only scheduled campaigns can be cancelled"}), 409
    row.status = "CANCELLED"
    db.session.commit()
    return jsonify({"message": "Campaign cancelled", "campaign": row.to_dict()}), 200


@notification_campaign_bp.post("/<int:campaign_id>/duplicate")
@role_required(ROLES)
def duplicate(campaign_id):
    old = _get_visible_campaign_or_404(campaign_id)
    row = NotificationCampaign(
        campaign_name=f"{old.campaign_name} Copy",
        title=old.title,
        message=old.message,
        notification_type=old.notification_type,
        image_url=old.image_url,
        audience_type=old.audience_type,
        audience_payload=old.audience_payload,
        platform=old.platform,
        click_action=old.click_action,
        target_id=old.target_id,
        send_mode="NOW",
        status="DRAFT",
        created_by=_current_user_id(),
    )
    db.session.add(row)
    db.session.commit()
    return jsonify({"message": "Campaign duplicated", "campaign": row.to_dict()}), 201
