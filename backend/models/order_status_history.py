# models/order_status_history.py

from extensions import db
from datetime import datetime


class OrderStatusHistory(db.Model):
    __tablename__ = "order_status_history"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    order_id = db.Column(
        db.Integer,
        db.ForeignKey("orders.id"),
        nullable=False
    )

    old_status = db.Column(
        db.String(50),
        nullable=True
    )

    new_status = db.Column(
        db.String(50),
        nullable=False
    )

    changed_by = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=True
    )

    remarks = db.Column(
        db.Text,
        nullable=True
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    # Relationships

    order = db.relationship(
        "Order",
        backref="status_history"
    )

    user = db.relationship(
        "User",
        lazy="joined"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "order_id": self.order_id,
            "old_status": self.old_status,
            "new_status": self.new_status,
            "remarks": self.remarks,

            "changed_by": {
                "id": self.user.id,
                "name": f"{self.user.first_name} {self.user.last_name}",
                "role": self.user.role
            } if self.user else None,

            "created_at": (
                self.created_at.isoformat()
                if self.created_at else None
            )
        }