from models.currency_rate import CurrencyRate
from extensions import db

DEFAULT_CURRENCIES = [
    {
        "currency_code": "KWD",
        "rate": 1.000000
    },
    {
        "currency_code": "AED",
        "rate": 11.990000
    },
    {
        "currency_code": "USD",
        "rate": 3.270000
                },
     {
            "currency_code": "INR",
            "rate": 311.360000
                    }
]

def seed_currency_rates():
    print("========== SEED CURRENCY START ==========")

    for currency in DEFAULT_CURRENCIES:

        existing = CurrencyRate.query.filter_by(
            currency_code=currency["currency_code"]
        ).first()

        if existing:
            print(f"{currency['currency_code']} already exists.")
            continue

        new_currency = CurrencyRate(
            currency_code=currency["currency_code"],
            rate=currency["rate"]
        )

        db.session.add(new_currency)
        print(f"{currency['currency_code']} seeded.")

    db.session.commit()

    print("========== SEED CURRENCY END ==========")