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

        # KNET is KWD
        "currency": "KWD",

        "threeDSecure": True,
        "save_card": False,

        "description": f"Order #{order.order_number}",

        "customer": {
            "first_name": order.customer.first_name or "",
            "last_name": order.customer.last_name or "",
            "email": order.customer.email or "",
            "phone": {
                "country_code": "965",
                "number": order.customer.phone_no
            }
        },

        "source": {
            "id": "src_kw.knet"
        },

        "redirect": {
            "url": (
                f"{Config.API_BASE_URL}"
                f"/payments/{order.id}/verify"
            )
        }
    }

    response = requests.post(
        f"{TAP_BASE_URL}/charges",
        headers=headers,
        json=payload,
        timeout=30
    )

    print("TAP CREATE STATUS:", response.status_code)
    print("TAP CREATE RESPONSE:", response.text)

    try:
        return response.json()
    except ValueError:
        return {
            "errors": [{
                "message": "Tap returned an invalid JSON response",
                "status_code": response.status_code,
                "response": response.text
            }]
        }


def verify_charge(charge_id):

    headers = {
        "Authorization": f"Bearer {Config.TAP_SECRET_KEY}"
    }

    response = requests.get(
        f"{TAP_BASE_URL}/charges/{charge_id}",
        headers=headers,
        timeout=30
    )

    print("TAP VERIFY STATUS:", response.status_code)
    print("TAP VERIFY RESPONSE:", response.text)

    try:
        return response.json()
    except ValueError:
        return {
            "errors": [{
                "message": "Tap returned an invalid JSON response",
                "status_code": response.status_code,
                "response": response.text
            }]
        }

def create_tap_charge(order):
    """Generic Tap charge for non-KWD currencies, routed through Tap's
    hosted payment-selection portal instead of a fixed source like KNET."""

    headers = {
        "Authorization": f"Bearer {Config.TAP_SECRET_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "amount": float(order.grand_total or order.total),
        "currency": str(order.currency or "USD").upper(),

        "threeDSecure": True,
        "save_card": False,

        "description": f"Order #{order.order_number}",

        "customer": {
            "first_name": order.customer.first_name or "",
            "last_name": order.customer.last_name or "",
            "email": order.customer.email or "",
            "phone": {
                "country_code": "965",
                "number": order.customer.phone_no
            }
        },

        "source": {
            "id": "src_all"
        },

        "redirect": {
            "url": (
                f"{Config.API_BASE_URL}"
                f"/payments/{order.id}/verify"
            )
        }
    }

    response = requests.post(
        f"{TAP_BASE_URL}/charges",
        headers=headers,
        json=payload,
        timeout=30
    )

    print("TAP CREATE (portal) STATUS:", response.status_code)
    print("TAP CREATE (portal) RESPONSE:", response.text)

    try:
        return response.json()
    except ValueError:
        return {
            "errors": [{
                "message": "Tap returned an invalid JSON response",
                "status_code": response.status_code,
                "response": response.text
            }]
        }