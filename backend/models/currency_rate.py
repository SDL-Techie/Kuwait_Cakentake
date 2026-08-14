from extensions import db
from datetime import datetime

class CurrencyRate(db.Model):
    __tablename__ = "currency_rates"

    id = db.Column(db.Integer, primary_key=True)

    currency_code = db.Column(
        db.String(10),
        unique=True,
        nullable=False
    )

    rate = db.Column(
        db.Numeric(18, 6),
        nullable=False
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )