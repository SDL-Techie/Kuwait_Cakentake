from datetime import datetime
from extensions import db

class PushToken(db.Model):
    __tablename__ = "push_tokens"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    token = db.Column(db.String(255), nullable=False, unique=True, index=True)
    platform = db.Column(db.String(20), nullable=False, default="unknown")
    device_name = db.Column(db.String(120), nullable=True)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {"id": self.id, "user_id": self.user_id, "token": self.token, "platform": self.platform, "device_name": self.device_name, "is_active": self.is_active, "created_at": self.created_at.isoformat() if self.created_at else None}
