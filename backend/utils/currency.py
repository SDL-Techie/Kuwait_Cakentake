RATES = {
    "KWD": 1.0,
    "AED": 11.99,
    "USD": 3.27,
    "INR": 311.36,
}

def convert(amount_inr, currency="INR"):
    if amount_inr is None:
        return None
    rate = RATES.get(currency, 1)
    return round(float(amount_inr) * rate, 2)