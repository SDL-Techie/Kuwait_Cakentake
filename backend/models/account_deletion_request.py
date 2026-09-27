from extensions import db
from datetime import datetime


class AccountDeletionRequest(db.Model):
    __tablename__ = "account_deletion_requests"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True  # stays nullable so the row survives after the user is deleted
    )

    # Snapshot fields — so admin can still see who it was even after deletion
    user_name = db.Column(db.String(200), nullable=False)
    user_email = db.Column(db.String(100), nullable=True)
    user_phone = db.Column(db.String(25), nullable=True)

    reason = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default="PENDING", nullable=False)  # PENDING, APPROVED, REJECTED

    requested_at = db.Column(db.DateTime, default=datetime.utcnow)
    reviewed_at = db.Column(db.DateTime, nullable=True)
    reviewed_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    admin_note = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "user_name": self.user_name,
            "user_email": self.user_email,
            "user_phone": self.user_phone,
            "reason": self.reason,
            "status": self.status,
            "requested_at": self.requested_at.isoformat() if self.requested_at else None,
            "reviewed_at": self.reviewed_at.isoformat() if self.reviewed_at else None,
            "reviewed_by": self.reviewed_by,
            "admin_note": self.admin_note,
        }