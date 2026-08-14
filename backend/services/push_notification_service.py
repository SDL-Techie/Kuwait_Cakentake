import json
from datetime import datetime, timedelta
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from flask import current_app
from sqlalchemy import or_

from extensions import db
from models.notification_campaign import NotificationCampaign
from models.notification_recipient import NotificationRecipient
from models.push_token import PushToken
from models.user import User

TERMINAL_INVALID_ERRORS = {"DeviceNotRegistered", "InvalidCredentials"}
TRANSIENT_RECEIPT_ERRORS = {"MessageRateExceeded", "MessageTooBig", "ProviderError"}
MAX_RECEIPT_ATTEMPTS = 5


def resolve_users(campaign):
    query = User.query
    audience = campaign.audience_type
    payload = campaign.audience_payload or {}

    if audience == "ALL_CUSTOMERS":
        query = query.filter(User.role == "USER")
    elif audience == "LOYALTY_MEMBERS":
        query = query.filter(User.role == "USER", User.loyalty_points > 0)
    elif audience == "SPECIFIC_USERS":
        ids = [int(value) for value in payload.get("user_ids", []) if str(value).isdigit()]
        if not ids:
            return []
        query = query.filter(User.id.in_(ids))
    elif audience == "STAFF_ROLES":
        roles = [str(value).upper() for value in payload.get("roles", []) if value]
        if not roles:
            return []
        query = query.filter(User.role.in_(roles))
    else:
        return []

    return query.all()


def _post(url, payload):
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    token = current_app.config.get("EXPO_ACCESS_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"

    request = Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers=headers,
        method="POST",
    )
    with urlopen(request, timeout=25) as response:
        return json.loads(response.read().decode("utf-8"))


def _post_expo(messages):
    if not messages:
        return []
    try:
        response = _post(
            current_app.config.get("EXPO_PUSH_URL", "https://exp.host/--/api/v2/push/send"),
            messages,
        )
        return response.get("data", [])
    except (HTTPError, URLError, TimeoutError, ValueError) as exc:
        current_app.logger.exception("Expo push request failed")
        return [{"status": "error", "message": str(exc)} for _ in messages]


def _claim_campaign(campaign_id):
    """Atomically claim a campaign so multiple workers cannot send it twice."""
    allowed_statuses = ["DRAFT", "SCHEDULED", "FAILED", "PARTIALLY_FAILED"]
    updated = (
        NotificationCampaign.query.filter(
            NotificationCampaign.id == campaign_id,
            NotificationCampaign.status.in_(allowed_statuses),
        )
        .update(
            {
                NotificationCampaign.status: "SENDING",
                NotificationCampaign.failure_reason: None,
            },
            synchronize_session=False,
        )
    )
    db.session.commit()
    return updated == 1


def send_campaign(campaign):
    campaign_id = campaign.id
    if not _claim_campaign(campaign_id):
        return db.session.get(NotificationCampaign, campaign_id)

    campaign = db.session.get(NotificationCampaign, campaign_id)
    users = resolve_users(campaign)
    user_ids = [user.id for user in users]
    tokens = (
        PushToken.query.filter(
            PushToken.user_id.in_(user_ids),
            PushToken.is_active.is_(True),
        ).all()
        if user_ids
        else []
    )

    if campaign.platform != "BOTH":
        tokens = [token for token in tokens if token.platform.upper() == campaign.platform]

    # Avoid duplicate rows if an administrator retries a previously failed campaign.
    existing_token_ids = {
        row.push_token_id
        for row in NotificationRecipient.query.filter(
            NotificationRecipient.campaign_id == campaign.id,
            NotificationRecipient.delivery_status.in_(["TICKET_OK", "DELIVERED"]),
        ).all()
    }
    tokens = [token for token in tokens if token.id not in existing_token_ids]

    campaign.total_recipients = len(tokens)
    if not tokens:
        campaign.status = "FAILED"
        campaign.failed_count = 0
        campaign.sent_count = 0
        campaign.sent_at = datetime.utcnow()
        campaign.failure_reason = "No active push tokens matched the selected audience and platform."
        db.session.commit()
        return campaign

    messages = []
    recipients = []
    for token in tokens:
        recipient = NotificationRecipient(
            campaign_id=campaign.id,
            user_id=token.user_id,
            push_token_id=token.id,
        )
        db.session.add(recipient)
        recipients.append(recipient)

        message = {
            "to": token.token,
            "title": campaign.title,
            "body": campaign.message,
            "channelId": "default",
            "data": {
                "campaign_id": campaign.id,
                "action": campaign.click_action,
                "target_id": campaign.target_id,
            },
        }
        if campaign.image_url:
            message["richContent"] = {"image": campaign.image_url}
        messages.append(message)

    db.session.flush()
    results = []
    for start in range(0, len(messages), 100):
        results.extend(_post_expo(messages[start : start + 100]))

    sent = 0
    failed = 0
    for index, recipient in enumerate(recipients):
        result = results[index] if index < len(results) else {
            "status": "error",
            "message": "Missing Expo response",
        }
        if result.get("status") == "ok":
            recipient.delivery_status = "TICKET_OK"
            recipient.expo_ticket_id = result.get("id")
            recipient.sent_at = datetime.utcnow()
            sent += 1
        else:
            recipient.delivery_status = "FAILED"
            recipient.error_message = result.get("message") or json.dumps(result)
            failed += 1

    db.session.flush()
    all_recipients = NotificationRecipient.query.filter_by(campaign_id=campaign.id).all()
    successful_token_ids = {
        row.push_token_id
        for row in all_recipients
        if row.delivery_status in {"TICKET_OK", "DELIVERED"}
    }
    failed_token_ids = {
        row.push_token_id
        for row in all_recipients
        if row.delivery_status == "FAILED" and row.push_token_id not in successful_token_ids
    }
    campaign.total_recipients = len(successful_token_ids | failed_token_ids)
    campaign.sent_count = len(successful_token_ids)
    campaign.failed_count = len(failed_token_ids)
    campaign.sent_at = datetime.utcnow()
    campaign.status = (
        "SENT"
        if campaign.failed_count == 0
        else ("FAILED" if campaign.sent_count == 0 else "PARTIALLY_FAILED")
    )
    campaign.failure_reason = None if campaign.sent_count else "Expo rejected every push ticket."
    db.session.commit()
    return campaign


def check_expo_receipts():
    retry_before = datetime.utcnow() - timedelta(minutes=2)
    rows = (
        NotificationRecipient.query.filter(
            NotificationRecipient.expo_ticket_id.isnot(None),
            NotificationRecipient.delivery_status == "TICKET_OK",
            NotificationRecipient.receipt_check_attempts < MAX_RECEIPT_ATTEMPTS,
            or_(
                NotificationRecipient.last_receipt_check_at.is_(None),
                NotificationRecipient.last_receipt_check_at <= retry_before,
            ),
        )
        .limit(1000)
        .all()
    )
    if not rows:
        return {"checked": 0, "delivered": 0, "failed": 0, "pending": 0}

    ids = [row.expo_ticket_id for row in rows if row.expo_ticket_id]
    now = datetime.utcnow()
    for row in rows:
        row.receipt_check_attempts += 1
        row.last_receipt_check_at = now

    try:
        data = _post(
            current_app.config.get(
                "EXPO_RECEIPTS_URL",
                "https://exp.host/--/api/v2/push/getReceipts",
            ),
            {"ids": ids},
        ).get("data", {})
    except (HTTPError, URLError, TimeoutError, ValueError):
        db.session.commit()
        current_app.logger.exception("Expo receipt request failed; it will be retried")
        return {"checked": 0, "delivered": 0, "failed": 0, "pending": len(rows)}

    delivered = 0
    failed = 0
    pending = 0
    by_id = {row.expo_ticket_id: row for row in rows}

    for ticket_id, row in by_id.items():
        result = data.get(ticket_id)
        if result is None:
            if row.receipt_check_attempts >= MAX_RECEIPT_ATTEMPTS:
                row.delivery_status = "FAILED"
                row.error_message = "Expo receipt was unavailable after the maximum retry count."
                failed += 1
            else:
                pending += 1
            continue

        if result.get("status") == "ok":
            row.delivery_status = "DELIVERED"
            row.error_message = None
            delivered += 1
            continue

        error = (result.get("details") or {}).get("error")
        message = result.get("message") or json.dumps(result)
        if error in TRANSIENT_RECEIPT_ERRORS and row.receipt_check_attempts < MAX_RECEIPT_ATTEMPTS:
            row.error_message = message
            pending += 1
            continue

        row.delivery_status = "FAILED"
        row.error_message = message
        failed += 1
        if error in TERMINAL_INVALID_ERRORS:
            token = db.session.get(PushToken, row.push_token_id)
            if token:
                token.is_active = False

    db.session.commit()
    return {
        "checked": len(data),
        "delivered": delivered,
        "failed": failed,
        "pending": pending,
    }


def send_transactional_push(user_ids, title, body, data=None):
    """Send an immediate order/status push to all active devices for users.

    Best effort: failures are logged and never break the order workflow.
    """
    clean_ids = sorted({int(value) for value in (user_ids or []) if value is not None})
    if not clean_ids:
        return {"requested": 0, "sent": 0, "failed": 0}

    tokens = PushToken.query.filter(
        PushToken.user_id.in_(clean_ids),
        PushToken.is_active.is_(True),
    ).all()
    if not tokens:
        return {"requested": 0, "sent": 0, "failed": 0}

    payload_data = dict(data or {})
    messages = [
        {
            "to": token.token,
            "title": str(title),
            "body": str(body),
            "sound": "default",
            "channelId": "default",
            "priority": "high",
            "data": payload_data,
        }
        for token in tokens
    ]

    results = []
    for start in range(0, len(messages), 100):
        results.extend(_post_expo(messages[start : start + 100]))

    sent = 0
    failed = 0
    for index, token in enumerate(tokens):
        result = results[index] if index < len(results) else {"status": "error"}
        if result.get("status") == "ok":
            sent += 1
        else:
            failed += 1
            details = result.get("details") or {}
            if details.get("error") in TERMINAL_INVALID_ERRORS:
                token.is_active = False

    if failed:
        db.session.commit()
    return {"requested": len(tokens), "sent": sent, "failed": failed}
