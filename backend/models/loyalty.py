from extensions import db
from datetime import datetime


class LoyaltyConfig(db.Model):
    __tablename__ = "loyalty_config"

    id = db.Column(db.Integer, primary_key=True)
    # points_per_order = db.Column(db.Integer, default=10)
    # points_value = db.Column(db.Numeric(10, 2), default=0.10)  # value per point
    # min_redemption = db.Column(db.Integer, default=100)
    # max_redemption_percent = db.Column(db.Integer, default=20)  # max % of order
    # is_active = db.Column(db.Boolean, default=True)
    # updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    min_order_amount = db.Column(db.Numeric(10, 2), default=100.00)
    points_per_min_order = db.Column(db.Integer, default=10)

    # Redeem Reward
    min_points = db.Column(db.Integer, default=1000)
    reward_percent = db.Column(db.Float, default=10)

    is_active = db.Column(db.Boolean, default=True)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    def to_dict(self):
             return {
            "id": self.id,
            "min_order_amount": float(self.min_order_amount),
            "points_per_min_order": self.points_per_min_order,
            "min_points": self.min_points,
            "reward_percent": self.reward_percent,
            "is_active": self.is_active,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


class LoyaltyLedger(db.Model):
    __tablename__ = "loyalty_ledger"

    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    order_id = db.Column(db.Integer, db.ForeignKey("orders.id"), nullable=True)
    transaction_type = db.Column(db.String(20), nullable=False)  # EARN / REDEEM
    points = db.Column(db.Integer, nullable=False)
    balance_after = db.Column(db.Integer, nullable=False)
    description = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    customer = db.relationship("User", backref="loyalty_ledger", lazy="joined")

    def to_dict(self):
        return {
            "id": self.id,
            "customer_id": self.customer_id,
            "order_id": self.order_id,
            "transaction_type": self.transaction_type,
            "points": self.points,
            "balance_after": self.balance_after,
            "description": self.description,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
