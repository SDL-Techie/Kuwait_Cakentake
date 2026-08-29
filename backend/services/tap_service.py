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




# ─────────────────────────────────────────────────────────────────────────
# REPLACE _build_batch_payload / create_knet_charge_batch / create_tap_charge_batch
# in services/tap_service.py with these versions.
#
# CHANGE FROM BEFORE: uses orders[0].customer (the same attribute your
# existing single-order create_knet_charge/create_tap_charge already rely
# on successfully) instead of orders[0].agent, which was likely the cause
# of the 500 error — Order probably has an agent_id column but no `agent`
# relationship object, so `.agent` raised AttributeError.
# ─────────────────────────────────────────────────────────────────────────

def _build_batch_payload(orders, amount, currency, source_id):

    customer = orders[0].customer
    order_numbers = ", ".join(o.order_number for o in orders)

    return {
        "amount": amount,

        "currency": currency,

        "threeDSecure": True,
        "save_card": False,

        "description": f"Agent settlement - {len(orders)} orders ({order_numbers})",

        "customer": {
            "first_name": getattr(customer, "first_name", "") or "",
            "last_name": getattr(customer, "last_name", "") or "",
            "email": getattr(customer, "email", "") or "",
            "phone": {
                "country_code": "965",
                "number": getattr(customer, "phone_no", "") or ""
            }
        },

        "source": {
            "id": source_id
        },

        # No order id in the redirect — Tap appends its own tap_id as a
        # query param, and /payments/batch/verify looks orders up by
        # gateway_order_id (the charge id) instead of a single order id.
        "redirect": {
            "url": f"{Config.API_BASE_URL}/payments/batch/verify"
        },

        "metadata": {
            "order_ids": ",".join(str(o.id) for o in orders)
        }
    }


def create_knet_charge_batch(orders, amount):

    headers = {
        "Authorization": f"Bearer {Config.TAP_SECRET_KEY}",
        "Content-Type": "application/json"
    }

    payload = _build_batch_payload(orders, amount, "KWD", "src_kw.knet")

    response = requests.post(
        f"{TAP_BASE_URL}/charges",
        headers=headers,
        json=payload,
        timeout=30
    )

    print("TAP CREATE (batch KNET) STATUS:", response.status_code)
    print("TAP CREATE (batch KNET) RESPONSE:", response.text)

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


def create_tap_charge_batch(orders, amount, currency):

    headers = {
        "Authorization": f"Bearer {Config.TAP_SECRET_KEY}",
        "Content-Type": "application/json"
    }

    payload = _build_batch_payload(orders, amount, str(currency or "USD").upper(), "src_all")

    response = requests.post(
        f"{TAP_BASE_URL}/charges",
        headers=headers,
        json=payload,
        timeout=30
    )

    print("TAP CREATE (batch portal) STATUS:", response.status_code)
    print("TAP CREATE (batch portal) RESPONSE:", response.text)

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