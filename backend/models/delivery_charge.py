from extensions import db
from datetime import datetime


class DeliveryCharge(db.Model):
    """
    Tracks the delivery charge collected per order and whether
    the driver has been paid their share.
    """
    __tablename__ = "delivery_charges"

    id              = db.Column(db.Integer, primary_key=True)
    order_id        = db.Column(db.Integer, db.ForeignKey("orders.id"),  nullable=False)
    driver_id       = db.Column(db.Integer, db.ForeignKey("users.id"),   nullable=True)
    charge_amount   = db.Column(db.Numeric(10, 2), nullable=False)
    driver_share    = db.Column(db.Numeric(10, 2), default=0)     # amount to pay driver
    is_paid         = db.Column(db.Boolean, default=False)
    paid_at         = db.Column(db.DateTime, nullable=True)
    paid_by         = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    notes           = db.Column(db.Text, nullable=True)
    created_at      = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at      = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    order  = db.relationship("Order", backref="delivery_charge_record", lazy="joined")
    driver = db.relationship("User", foreign_keys=[driver_id], lazy="joined")

    def to_dict(self):
        return {
            "id":            self.id,
            "order_id":      self.order_id,
            "driver_id":     self.driver_id,
            "charge_amount": float(self.charge_amount),
            "driver_share":  float(self.driver_share),
            "is_paid":       self.is_paid,
            "paid_at":       self.paid_at.isoformat() if self.paid_at else None,
            "notes":         self.notes,
            "created_at":    self.created_at.isoformat() if self.created_at else None,
            "order": {
                "id":           self.order.id,
                "order_number": self.order.order_number,
            } if self.order else None,
            "driver": {
                "id":         self.driver.id,
                "first_name": self.driver.first_name,
                "last_name":  self.driver.last_name,
            } if self.driver else None,
        }
