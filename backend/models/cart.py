from extensions import db
from datetime import datetime


class Cart(db.Model):
    __tablename__ = "carts"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship("User", back_populates="cart")
    items = db.relationship(
        "CartItem", back_populates="cart",
        cascade="all, delete-orphan", lazy=True
    )

    def to_dict(self, currency="INR"):
        items = [item.to_dict(currency) for item in self.items]
        return {
            "id": self.id,
            "user_id": self.user_id,
            "currency": currency,
            "items": items,
            "total": round(sum(i["subtotal"] for i in items), 2),
        }