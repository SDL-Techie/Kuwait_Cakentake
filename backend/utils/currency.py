"""Presentation-only currency conversion from stored KWD amounts.

Rates are configured display estimates, NOT a settlement/payment exchange rate.
Payments must always use the server-side authoritative order amount.
"""
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP

RATES = {"KWD": Decimal("1"), "AED": Decimal("11.99"),
         "USD": Decimal("3.27"), "INR": Decimal("311.36")}


def convert(amount_inr, currency="KWD"):
    # Keep the old parameter name for compatibility with other imports.
    if amount_inr is None:
        return None
    code = str(currency or "KWD").upper()
    if code not in RATES:
        raise ValueError(f"Unsupported cart currency: {code}")
    try:
        amount = Decimal(str(amount_inr))
        if not amount.is_finite():
            raise ValueError("Currency amount must be finite")
        quantum = Decimal("0.001") if code == "KWD" else Decimal("0.01")
        return float((amount * RATES[code]).quantize(quantum, rounding=ROUND_HALF_UP))
    except (InvalidOperation, TypeError) as exc:
        raise ValueError("Invalid currency amount") from exc
