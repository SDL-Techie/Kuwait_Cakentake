
import hmac
import logging
import re
from decimal import Decimal, ROUND_HALF_UP
from urllib.parse import urlparse
import hashlib
import requests

from config import Config


TAP_BASE_URL = "https://api.tap.company/v2"
logger = logging.getLogger(__name__)

_CURRENCY_DECIMALS = {
    "BHD": 3,
    "JOD": 3,
    "KWD": 3,
    "OMR": 3,
}


def _safe_platform(value):
    return "app" if str(value or "").strip().lower() == "app" else "web"


def _tap_headers():
    return {
        "Authorization": f"Bearer {Config.TAP_SECRET_KEY}",
        "Content-Type": "application/json",
    }


def _clean_url(value):
    return str(value or "").strip().rstrip("/")


def _is_private_or_local_url(url):
    """Return True for localhost/private IPv4 URLs (warning only, never blocks)."""
    try:
        parsed = urlparse(url)
        host = (parsed.hostname or "").lower()
        if host in {"localhost", "127.0.0.1", "0.0.0.0"}:
            return True
        if host.startswith("10.") or host.startswith("192.168."):
            return True
        if host.startswith("172."):
            parts = host.split(".")
            if len(parts) >= 2 and 16 <= int(parts[1]) <= 31:
                return True
    except (TypeError, ValueError):
        return False
    return False


def _redirect_base_url():
    """
    Tap callback base URL.

    Production: set TAP_REDIRECT_BASE_URL (or API_BASE_URL) to the public HTTPS
    backend. Local development may use the machine LAN URL when the browser/device
    can reach that machine. TAP_REDIRECT_BASE_URL is useful with ngrok/Cloudflare.
    """
    override = _clean_url(getattr(Config, "TAP_REDIRECT_BASE_URL", ""))
    return override or _clean_url(Config.API_BASE_URL)


def _post_url():
    configured = _clean_url(Config.TAP_POST_URL)
    if configured:
        return configured

    # Never auto-create a webhook URL for localhost/LAN development. Tap's
    # server-to-server webhook needs a public endpoint.
    base_url = _redirect_base_url()
    if base_url.startswith("https://") and not _is_private_or_local_url(base_url):
        return f"{base_url}/payments/tap/webhook"
    return ""


def _phone_payload(value):
    """
    Build a Tap phone object only when we can do so without inventing data.

    KNET does NOT require the customer phone itself to be a Kuwait number. Tap's
    own KNET documentation shows customers from other country codes. A previous
    strict 8-digit Kuwait-only validation incorrectly rejected otherwise valid
    customers before the Tap API was even called.

    Supported unambiguous inputs:
      +965XXXXXXXX / 00965XXXXXXXX / 965XXXXXXXX -> country 965
      +91XXXXXXXXXX / 0091XXXXXXXXXX / 91XXXXXXXXXX -> country 91
      XXXXXXXX (8 digits) -> default Kuwait 965

    For an ambiguous local number (for example a bare 10-digit test number),
    return None. Customer first_name/email are still sent and Tap can create the
    customer/charge without us attaching a guessed phone country code.
    """
    raw = str(value or "").strip()
    if not raw:
        return None

    digits = re.sub(r"\D", "", raw)
    if not digits:
        return None

    # Explicit international prefixes are safe to normalize.
    if digits.startswith("00965") and len(digits) > 5:
        return {"country_code": "965", "number": digits[5:]}
    if digits.startswith("965") and len(digits) == 11:
        return {"country_code": "965", "number": digits[3:]}
    if digits.startswith("0091") and len(digits) == 14:
        return {"country_code": "91", "number": digits[4:]}
    if digits.startswith("91") and len(digits) == 12:
        return {"country_code": "91", "number": digits[2:]}

    # Kuwait local numbers are 8 digits, so this is unambiguous for this app.
    if len(digits) == 8:
        return {"country_code": "965", "number": digits}

    # Do not guess a country code for ambiguous local formats.
    logger.info("Tap customer phone omitted because country code is ambiguous: %s", raw)
    return None


def _customer_payload_from_user(customer):
    payload = {
        "first_name": getattr(customer, "first_name", "") or "Customer",
        "last_name": getattr(customer, "last_name", "") or "",
        "email": getattr(customer, "email", "") or "",
    }
    phone = _phone_payload(getattr(customer, "phone_no", "") or "")
    if phone:
        payload["phone"] = phone
    return payload


def _customer_payload(order):
    return _customer_payload_from_user(order.customer)


def _merchant_payload():
    merchant_id = str(Config.TAP_MERCHANT_ID or "").strip()
    return {"id": merchant_id} if merchant_id else None


def _build_single_payload(order, source_id, client_platform, idempotency_key):
    platform = _safe_platform(client_platform)
    order_ref = str(order.order_number or order.id)
    transaction_ref = f"ct-{order.id}-{str(idempotency_key)[-12:]}"[:64]
    redirect_base = _redirect_base_url()

    payload = {
        "amount": float(order.grand_total or order.total or 0),
        "currency": str(order.currency or "KWD").upper(),
        "customer_initiated": True,
        "threeDSecure": True,
        "save_card": False,
        "description": f"Order #{order_ref}",
        "reference": {
            "transaction": transaction_ref,
            "order": order_ref,
            "idempotent": str(idempotency_key)[:128],
        },
        "metadata": {
            "order_id": str(order.id),
            "client_platform": platform,
        },
        "customer": _customer_payload(order),
        "source": {"id": source_id},
        "redirect": {
            "url": f"{redirect_base}/payments/{order.id}/verify/{platform}"
        },
    }

    merchant = _merchant_payload()
    if merchant:
        payload["merchant"] = merchant

    post_url = _post_url()
    if post_url:
        payload["post"] = {"url": post_url}

    return payload


def _build_batch_payload(
    orders,
    amount,
    currency,
    source_id,
    client_platform,
    idempotency_key,
):
    platform = _safe_platform(client_platform)
    customer = orders[0].customer
    order_ids = ",".join(str(order.id) for order in orders)
    order_numbers = ",".join(str(order.order_number) for order in orders)
    reference_order = f"batch-{orders[0].id}-{len(orders)}"
    transaction_ref = f"ct-batch-{orders[0].id}-{str(idempotency_key)[-10:]}"[:64]
    redirect_base = _redirect_base_url()

    payload = {
        "amount": float(amount),
        "currency": str(currency or "KWD").upper(),
        "customer_initiated": True,
        "threeDSecure": True,
        "save_card": False,
        "description": f"Agent settlement - {len(orders)} orders",
        "reference": {
            "transaction": transaction_ref,
            "order": reference_order,
            "idempotent": str(idempotency_key)[:128],
        },
        "metadata": {
            "order_ids": order_ids,
            "order_numbers": order_numbers,
            "client_platform": platform,
        },
        "customer": _customer_payload_from_user(customer),
        "source": {"id": source_id},
        "redirect": {
            "url": f"{redirect_base}/payments/batch/verify/{platform}"
        },
    }

    merchant = _merchant_payload()
    if merchant:
        payload["merchant"] = merchant

    post_url = _post_url()
    if post_url:
        payload["post"] = {"url": post_url}

    return payload


def _log_tap_request(payload):
    """Safe debug details. The Tap secret key is intentionally never printed."""
    redirect_url = (payload.get("redirect") or {}).get("url", "")
    customer = payload.get("customer") or {}
    phone = customer.get("phone") or {}

    logger.info(
        "Tap create charge request amount=%s currency=%s source=%s merchant=%s "
        "redirect=%s post=%s customer_email=%s phone_country=%s",
        payload.get("amount"),
        payload.get("currency"),
        (payload.get("source") or {}).get("id"),
        (payload.get("merchant") or {}).get("id"),
        redirect_url,
        (payload.get("post") or {}).get("url"),
        customer.get("email"),
        phone.get("country_code"),
    )

    if _is_private_or_local_url(redirect_url):
        logger.info(
            "Tap redirect is using a local/private URL (%s). This is fine only "
            "for local browser/device testing where that address is reachable.",
            redirect_url,
        )


def _log_tap_response(response, data):
    transaction_url = None
    errors = None
    if isinstance(data, dict):
        transaction_url = (data.get("transaction") or {}).get("url")
        errors = data.get("errors")

    log = logger.error if response.status_code >= 400 or errors else logger.info
    log(
        "Tap create charge response http=%s charge_id=%s status=%s transaction_url=%s errors=%s",
        response.status_code,
        data.get("id") if isinstance(data, dict) else None,
        data.get("status") if isinstance(data, dict) else None,
        transaction_url,
        errors,
    )


def _create_charge(payload):
    redirect_url = (payload.get("redirect") or {}).get("url")
    if not redirect_url:
        return {
            "errors": [{
                "code": "MISSING_REDIRECT_URL",
                "message": "Tap redirect URL is not configured on the server.",
            }]
        }

    _log_tap_request(payload)

    try:
        response = requests.post(
            f"{TAP_BASE_URL}/charges",
            headers=_tap_headers(),
            json=payload,
            timeout=30,
        )
    except requests.RequestException as exc:
        logger.exception("Tap charge creation request failed")
        return {
            "errors": [{
                "message": "Tap payment service is temporarily unavailable",
                "detail": str(exc),
            }],
            "retry_same_idempotency": True,
        }

    try:
        data = response.json()
    except ValueError:
        raw_response = response.text
        logger.error(
            "Tap returned invalid JSON. status=%s response=%s",
            response.status_code,
            raw_response[:1000],
        )
        return {
            "errors": [{
                "message": "Tap returned an invalid JSON response",
                "status_code": response.status_code,
            }]
        }

    _log_tap_response(response, data)

    if not isinstance(data, dict):
        return {
            "errors": [{
                "message": "Tap returned an unexpected response",
                "status_code": response.status_code,
            }]
        }

    if response.status_code >= 400 and not data.get("errors"):
        data["errors"] = [{
            "message": "Tap rejected the charge request",
            "status_code": response.status_code,
        }]

    return data


def create_knet_charge(order, client_platform="web", idempotency_key=None):
    """Create a KNET redirect charge (KWD + src_kw.knet)."""
    currency = str(order.currency or "KWD").upper()
    if currency != "KWD":
        return {
            "errors": [{
                "message": "KNET supports KWD currency only",
                "code": "INVALID_KNET_CURRENCY",
            }]
        }

    return _create_charge(
        _build_single_payload(
            order,
            "src_kw.knet",
            client_platform,
            idempotency_key or f"order-{order.id}",
        )
    )


def create_tap_charge(order, client_platform="web", idempotency_key=None):
    return _create_charge(
        _build_single_payload(
            order,
            "src_all",
            client_platform,
            idempotency_key or f"order-{order.id}",
        )
    )


def create_knet_charge_batch(
    orders,
    amount,
    client_platform="web",
    idempotency_key=None,
):
    if not orders:
        return {"errors": [{"message": "No orders provided"}]}

    return _create_charge(
        _build_batch_payload(
            orders,
            amount,
            "KWD",
            "src_kw.knet",
            client_platform,
            idempotency_key or f"batch-{orders[0].id}",
        )
    )


def create_tap_charge_batch(
    orders,
    amount,
    currency,
    client_platform="web",
    idempotency_key=None,
):
    if not orders:
        return {"errors": [{"message": "No orders provided"}]}

    return _create_charge(
        _build_batch_payload(
            orders,
            amount,
            currency,
            "src_all",
            client_platform,
            idempotency_key or f"batch-{orders[0].id}",
        )
    )


def verify_charge(charge_id):
    if not charge_id:
        return {"errors": [{"message": "Tap charge id is missing"}]}

    try:
        response = requests.get(
            f"{TAP_BASE_URL}/charges/{charge_id}",
            headers={"Authorization": f"Bearer {Config.TAP_SECRET_KEY}"},
            timeout=30,
        )
    except requests.RequestException as exc:
        logger.exception("Tap charge retrieval request failed")
        return {
            "errors": [{
                "message": "Unable to retrieve Tap charge",
                "detail": str(exc),
            }]
        }

    try:
        data = response.json()
    except ValueError:
        return {
            "errors": [{
                "message": "Tap returned an invalid JSON response",
                "status_code": response.status_code,
            }]
        }

    if not isinstance(data, dict):
        return {
            "errors": [{
                "message": "Tap returned an unexpected response",
                "status_code": response.status_code,
            }]
        }

    if response.status_code >= 400 and not data.get("errors"):
        data["errors"] = [{
            "message": "Tap charge retrieval failed",
            "status_code": response.status_code,
        }]

    return data


def _format_hash_amount(value, currency):
    decimals = _CURRENCY_DECIMALS.get(str(currency or "").upper(), 2)
    quantum = Decimal("1").scaleb(-decimals)
    amount = Decimal(str(value or 0)).quantize(quantum, rounding=ROUND_HALF_UP)
    return f"{amount:.{decimals}f}"


def validate_webhook_hash(payload, posted_hashstring):
    """Validate Tap's HMAC-SHA256 hashstring for a charge webhook."""
    if not posted_hashstring or not Config.TAP_SECRET_KEY:
        return False

    reference = payload.get("reference") or {}
    transaction = payload.get("transaction") or {}

    to_be_hashed = (
        f"x_id{payload.get('id') or ''}"
        f"x_amount{_format_hash_amount(payload.get('amount'), payload.get('currency'))}"
        f"x_currency{payload.get('currency') or ''}"
        f"x_gateway_reference{reference.get('gateway') or ''}"
        f"x_payment_reference{reference.get('payment') or ''}"
        f"x_status{payload.get('status') or ''}"
        f"x_created{transaction.get('created') or ''}"
    )

    calculated = hmac.new(
        Config.TAP_SECRET_KEY.encode("utf-8"),
        to_be_hashed.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    return hmac.compare_digest(
        calculated.lower(),
        str(posted_hashstring).lower(),
    )
