from datetime import datetime
from extensions import db


class NotificationRecipient(db.Model):
    __tablename__ = "notification_recipients"

    id = db.Column(db.Integer, primary_key=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey("notification_campaigns.id"), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    push_token_id = db.Column(db.Integer, db.ForeignKey("push_tokens.id"), nullable=False)
    expo_ticket_id = db.Column(db.String(160), nullable=True)
    delivery_status = db.Column(db.String(30), nullable=False, default="PENDING")
    error_message = db.Column(db.Text, nullable=True)
    receipt_check_attempts = db.Column(db.Integer, nullable=False, default=0)
    last_receipt_check_at = db.Column(db.DateTime, nullable=True)
    sent_at = db.Column(db.DateTime, nullable=True)
    opened_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "campaign_id": self.campaign_id,
            "user_id": self.user_id,
            "push_token_id": self.push_token_id,
            "expo_ticket_id": self.expo_ticket_id,
            "delivery_status": self.delivery_status,
            "error_message": self.error_message,
            "receipt_check_attempts": self.receipt_check_attempts,
            "last_receipt_check_at": self.last_receipt_check_at.isoformat() if self.last_receipt_check_at else None,
            "sent_at": self.sent_at.isoformat() if self.sent_at else None,
            "opened_at": self.opened_at.isoformat() if self.opened_at else None,
        }
