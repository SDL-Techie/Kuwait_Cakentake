from datetime import datetime
from extensions import db


class NotificationCampaign(db.Model):
    __tablename__ = "notification_campaigns"

    id = db.Column(db.Integer, primary_key=True)
    campaign_name = db.Column(db.String(160), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    notification_type = db.Column(db.String(50), nullable=False, default="ANNOUNCEMENT")
    image_url = db.Column(db.Text, nullable=True)
    audience_type = db.Column(db.String(50), nullable=False, default="ALL_CUSTOMERS")
    audience_payload = db.Column(db.JSON, nullable=True)
    platform = db.Column(db.String(20), nullable=False, default="BOTH")
    click_action = db.Column(db.String(50), nullable=False, default="OPEN_HOME")
    target_id = db.Column(db.Integer, nullable=True)
    send_mode = db.Column(db.String(20), nullable=False, default="NOW")
    scheduled_at = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.String(30), nullable=False, default="DRAFT", index=True)
    created_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    sent_at = db.Column(db.DateTime, nullable=True)
    total_recipients = db.Column(db.Integer, nullable=False, default=0)
    sent_count = db.Column(db.Integer, nullable=False, default=0)
    failed_count = db.Column(db.Integer, nullable=False, default=0)
    failure_reason = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "campaign_name": self.campaign_name,
            "title": self.title,
            "message": self.message,
            "notification_type": self.notification_type,
            "image_url": self.image_url,
            "audience_type": self.audience_type,
            "audience_payload": self.audience_payload or {},
            "platform": self.platform,
            "click_action": self.click_action,
            "target_id": self.target_id,
            "send_mode": self.send_mode,
            "scheduled_at": self.scheduled_at.isoformat() if self.scheduled_at else None,
            "status": self.status,
            "created_by": self.created_by,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "sent_at": self.sent_at.isoformat() if self.sent_at else None,
            "total_recipients": self.total_recipients,
            "sent_count": self.sent_count,
            "failed_count": self.failed_count,
            "failure_reason": self.failure_reason,
        }
