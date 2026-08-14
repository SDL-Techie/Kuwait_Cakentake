import requests


def get_exchange_rate(
    from_currency,
    to_currency
):
    url = f"https://open.er-api.com/v6/latest/{from_currency}"

    response = requests.get(url)

    data = response.json()

    return data["rates"][to_currency]


def convert_price(
    amount,
    currency_code
):

    if currency_code == "KWD":
        return amount

    rate = get_exchange_rate(
        "KWD",
        currency_code
    )

    return round(amount * rate)