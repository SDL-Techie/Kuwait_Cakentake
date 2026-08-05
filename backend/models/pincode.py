from extensions import db
from datetime import datetime


class Pincode(db.Model):
    __tablename__ = "pincodes"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    country = db.Column(
        db.String(100),
        nullable=False
    )

    state = db.Column(
        db.String(100),
        nullable=False
    )

    city = db.Column(
        db.String(100),
        nullable=False
    )

    postal_code = db.Column(
        db.String(20),
        nullable=False,
    )

    delivery_amount = db.Column(
        db.Numeric(10, 2),
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    def to_dict(self):
        return {
            "id": self.id,
            "country": self.country,
            "state": self.state,
            "city": self.city,
            "postal_code": self.postal_code,
            "delivery_amount": float(self.delivery_amount)
        }
