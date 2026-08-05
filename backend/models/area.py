from datetime import datetime

from extensions import db


class Area(db.Model):
    __tablename__ = "areas"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    name = db.Column(
        db.String(150),
        nullable=False,
        unique=True,
        index=True
    )

    delivery_charge = db.Column(
        db.Numeric(10, 3),
        default=0,
        nullable=False
    )

    min_order_value = db.Column(
        db.Numeric(10, 3),
        default=0,
        nullable=False
    )

    is_active = db.Column(
        db.Boolean,
        default=True,
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    # Area -> Addresses
    addresses = db.relationship(
        "Address",
        back_populates="area",
        lazy=True
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "delivery_charge": float(self.delivery_charge or 0),
            "min_order_value": float(self.min_order_value or 0),
            "is_active": self.is_active,
            "created_at": (
                self.created_at.isoformat()
                if self.created_at
                else None
            ),
            "updated_at": (
                self.updated_at.isoformat()
                if self.updated_at
                else None
            ),
        }