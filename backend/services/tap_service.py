import requests
from config import Config

TAP_BASE_URL = "https://api.tap.company/v2"


def create_knet_charge(order):

    headers = {
        "Authorization": f"Bearer {Config.TAP_SECRET_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "amount": float(order.grand_total or order.total),
        "currency": order.currency or "KWD",

        "threeDSecure": True,
        "save_card": False,

        "description": f"Order #{order.order_number}",

        "customer": {
            "first_name": order.customer.first_name,
            "last_name": order.customer.last_name,
            "email": order.customer.email,
            "phone": {
                "country_code": "965",
                "number": order.customer.phone_no
            }
        },

        "source": {
            "id": "src_kw.knet"
        },

        "redirect": {
             "url": f"{Config.API_BASE_URL}/payments/{order.id}/verify"
                
        }
    }

    response = requests.post(
        f"{TAP_BASE_URL}/charges",
        headers=headers,
        json=payload,
        timeout=30
    )

    return response.json()


def verify_charge(charge_id):

    headers = {
        "Authorization": f"Bearer {Config.TAP_SECRET_KEY}"
    }

    response = requests.get(
        f"{TAP_BASE_URL}/charges/{charge_id}",
        headers=headers,
        timeout=30
    )

    return response.json()