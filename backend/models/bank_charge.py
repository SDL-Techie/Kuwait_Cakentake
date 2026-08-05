from extensions import db
from datetime import datetime


class BankCharge(db.Model):
    __tablename__ = "bank_charges"

    id          = db.Column(db.Integer, primary_key=True)
    title       = db.Column(db.String(150), nullable=False)
    charge_type = db.Column(db.String(50),  nullable=False)   # SERVICE_FEE / TRANSACTION_FEE / PENALTY / OTHER
    amount      = db.Column(db.Numeric(10, 2), nullable=False)
    description = db.Column(db.Text, nullable=True)
    charged_on  = db.Column(db.DateTime, default=datetime.utcnow)
    created_by  = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at  = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    creator = db.relationship("User", lazy="joined")

    def to_dict(self):
        return {
            "id":          self.id,
            "title":       self.title,
            "charge_type": self.charge_type,
            "amount":      float(self.amount),
            "description": self.description,
            "charged_on":  self.charged_on.isoformat() if self.charged_on else None,
            "created_by":  self.created_by,
            "created_at":  self.created_at.isoformat() if self.created_at else None,
        }
