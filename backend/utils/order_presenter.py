"""
utils/order_presenter.py

One place that turns an Order (menu items, agent-exclusive items and custom
cakes) into consistent "ordered product" lines for every screen and receipt.

Why this exists
---------------
* Custom cakes are stored on ``orders.custom_cake_json`` and never had an
  ``order_items`` row, so every screen that listed ``order.items`` showed
  "no products" for custom-cake orders (admin, sales staff, kitchen, app).
* Cake size / flavour / writing were saved under many different keys
  (``variant_name``, ``selected_variant``, ``variant`` …) by the web, the app
  and the agent flow, so most screens could not find them.

Everything here is read-only and never raises: a malformed row simply
produces fewer details instead of breaking the order response.
"""

from __future__ import annotations

from typing import Any, Iterable

# Values the frontends use as "empty" placeholders (orDash() etc.)
_EMPTY = {"", "-", "—", "--", "null", "none", "undefined", "n/a"}

SIZE_KEYS = (
    "variant_name", "variantName", "selected_variant", "selectedVariant",
    "variant", "size", "cake_size", "cakeSize", "weight",
)
FLAVOUR_KEYS = (
    "flavor_name", "flavour_name", "flavorName", "flavourName",
    "selected_flavour", "selected_flavor", "selectedFlavour", "selectedFlavor",
    "flavour", "flavor",
)
MESSAGE_KEYS = (
    "gift_message", "giftMessage", "cake_message", "cakeMessage",
    "message_on_cake", "messageOnCake", "writing", "cake_writing",
    "message",
)
INSTRUCTION_KEYS = (
    "special_instruction", "special_instructions", "specialInstruction",
    "instructions", "customization_notes", "notes",
)
SHAPE_KEYS = ("shape", "cake_shape", "cakeShape")


def clean(value: Any) -> str:
    """Trimmed text, or '' for None / placeholders / non-text containers."""
    if value is None or isinstance(value, (dict, list, tuple, set)):
        return ""
    text = str(value).strip()
    return "" if text.lower() in _EMPTY else text


def first(source: Any, keys: Iterable[str]) -> str:
    if not isinstance(source, dict):
        return ""
    for key in keys:
        text = clean(source.get(key))
        if text:
            return text
    return ""


def _num(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _lookup_variant_name(variant_id: Any) -> str:
    if not variant_id:
        return ""
    try:
        from models.variant import Variant
        variant = Variant.query.get(int(variant_id))
        return clean(variant.name) if variant else ""
    except Exception:
        return ""


def _lookup_flavor_name(flavor_id: Any) -> str:
    if not flavor_id:
        return ""
    try:
        from models.variant import Flavor
        flavor = Flavor.query.get(int(flavor_id))
        return clean(flavor.name) if flavor else ""
    except Exception:
        return ""


# ─── Order items (menu + agent exclusive) ──────────────────────────────────

def describe_item(item_dict: dict) -> dict:
    """Return the normalized details for one serialized OrderItem."""
    cj = item_dict.get("custom_json")
    cj = cj if isinstance(cj, dict) else {}

    size = first(cj, SIZE_KEYS) or _lookup_variant_name(cj.get("variant_id"))
    flavour = first(cj, FLAVOUR_KEYS) or _lookup_flavor_name(
        cj.get("flavor_id") or cj.get("flavour_id")
    )
    is_agent = bool(item_dict.get("agent_product_id")) or str(
        cj.get("product_type") or ""
    ).upper() == "AGENT"

    return {
        "size": size or None,
        "flavour": flavour or None,
        "cake_message": first(cj, MESSAGE_KEYS) or None,
        "special_instruction": first(cj, INSTRUCTION_KEYS) or None,
        "shape": first(cj, SHAPE_KEYS) or None,
        "line_type": "AGENT_EXCLUSIVE" if is_agent else "MENU",
    }


def enrich_item(item_dict: dict) -> dict:
    """Add normalized size/flavour/message keys to a serialized OrderItem.

    ``custom_json.variant_name`` / ``flavor_name`` / ``gift_message`` are also
    back-filled so older app screens that read those keys show the values even
    when the order was created by a client that used different key names.
    """
    details = describe_item(item_dict)
    item_dict.update(details)
    item_dict["is_custom_cake"] = False

    cj = item_dict.get("custom_json")
    if isinstance(cj, dict):
        cj = dict(cj)
        if details["size"] and not clean(cj.get("variant_name")):
            cj["variant_name"] = details["size"]
        if details["flavour"] and not clean(cj.get("flavor_name")):
            cj["flavor_name"] = details["flavour"]
        if details["cake_message"] and not clean(cj.get("gift_message")):
            cj["gift_message"] = details["cake_message"]
        item_dict["custom_json"] = cj
    return item_dict


# ─── Custom cakes ──────────────────────────────────────────────────────────

def describe_custom_cake(cake: dict, index: int) -> dict:
    qty = int(_num(cake.get("quantity") or cake.get("qty") or 1, 1)) or 1
    price = _num(cake.get("price"), 0.0)
    name = (
        first(cake, ("product_name", "productName", "name", "title"))
        or "Custom cake"
    )
    image = first(cake, ("image", "image_url", "imageUrl", "reference_image", "photo"))
    return {
        "index": index,
        "name": name,
        "image": image or None,
        "size": first(cake, SIZE_KEYS) or None,
        "flavour": first(cake, FLAVOUR_KEYS) or None,
        "shape": first(cake, SHAPE_KEYS) or None,
        "cake_message": first(cake, MESSAGE_KEYS) or None,
        "special_instruction": first(cake, INSTRUCTION_KEYS) or None,
        "quantity": qty,
        "unit_price": round(price, 3),
        "line_total": round(price * qty, 3) if qty > 1 else round(price, 3),
    }


def custom_cake_as_item(order_id: int, cake: dict, index: int) -> dict:
    """A custom cake shaped like a serialized OrderItem.

    Used so clients that only render ``order.items`` (the mobile app) can show
    custom-cake products. ``is_custom_cake`` lets clients tell them apart.
    """
    d = describe_custom_cake(cake, index)
    return {
        "id": -(index + 1),
        "order_id": order_id,
        "product_id": None,
        "agent_product_id": None,
        "product_name": d["name"],
        "product_image": d["image"],
        "product": {
            "id": None,
            "name": d["name"],
            "description": "Custom cake",
            "image_url": d["image"],
            "price": d["unit_price"],
        },
        "agent_product": None,
        "quantity": d["quantity"],
        "price": d["unit_price"],
        "line_total": d["line_total"],
        "custom_json": {
            "is_custom_cake": True,
            "product_type": "CUSTOM_CAKE",
            "variant_name": d["size"],
            "flavor_name": d["flavour"],
            "shape": d["shape"],
            "gift_message": d["cake_message"],
            "special_instruction": d["special_instruction"],
        },
        "is_custom_cake": True,
        "size": d["size"],
        "flavour": d["flavour"],
        "shape": d["shape"],
        "cake_message": d["cake_message"],
        "special_instruction": d["special_instruction"],
        "line_type": "CUSTOM_CAKE",
        "created_at": None,
        "updated_at": None,
    }


# ─── Ordered products (one list for every screen / receipt) ────────────────

def ordered_products(item_dicts: list, custom_cakes: list) -> list:
    lines = []
    for item in item_dicts or []:
        if not isinstance(item, dict) or item.get("is_custom_cake"):
            continue
        product = item.get("product") or {}
        agent_product = item.get("agent_product") or {}
        details = describe_item(item)
        qty = int(_num(item.get("quantity"), 1)) or 1
        unit = _num(item.get("price"), 0.0)
        line_total = item.get("line_total")
        lines.append({
            "key": f"item-{item.get('id')}",
            "type": details["line_type"],
            "name": (
                clean(item.get("product_name"))
                or clean(product.get("name"))
                or clean(agent_product.get("name"))
                or "Item"
            ),
            "image": (
                clean(item.get("product_image"))
                or clean(product.get("image_url"))
                or clean(agent_product.get("image"))
                or None
            ),
            "size": details["size"],
            "flavour": details["flavour"],
            "shape": details["shape"],
            "cake_message": details["cake_message"],
            "special_instruction": details["special_instruction"],
            "quantity": qty,
            "unit_price": round(unit, 3),
            "line_total": round(_num(line_total, unit * qty), 3),
        })

    for index, cake in enumerate(custom_cakes or []):
        if not isinstance(cake, dict):
            continue
        d = describe_custom_cake(cake, index)
        lines.append({
            "key": f"custom-{index}",
            "type": "CUSTOM_CAKE",
            **{k: d[k] for k in (
                "name", "image", "size", "flavour", "shape", "cake_message",
                "special_instruction", "quantity", "unit_price", "line_total",
            )},
        })
    return lines


def collect_cake_messages(lines: list, greeting_message: Any) -> str:
    """All writing for the order (per product + greeting), de-duplicated."""
    seen, out = set(), []
    for text in [*(l.get("cake_message") for l in lines), greeting_message]:
        text = clean(text)
        if text and text.lower() not in seen:
            seen.add(text.lower())
            out.append(text)
    return " | ".join(out)


# ─── Address helpers ───────────────────────────────────────────────────────

ADDRESS_PARTS = (
    ("area", "Area"),
    ("block", "Block"),
    ("street", "Street"),
    ("avenue", "Avenue"),
    ("building", "Building"),
    ("house_no", "House"),
    ("floor", "Floor"),
    ("apartment", "Apt"),
)


def address_text(address: dict | None, snapshot: dict | None, area_name: str) -> str:
    """Single-line, human readable delivery address."""
    source = {}
    if isinstance(snapshot, dict):
        source.update({k: v for k, v in snapshot.items() if clean(v)})
    if isinstance(address, dict):
        for key, value in address.items():
            if clean(value) and not clean(source.get(key)):
                source[key] = value
    if area_name and not clean(source.get("area")):
        source["area"] = area_name
    if isinstance(source.get("area"), dict):
        source["area"] = source["area"].get("name")

    parts = []
    for key, label in ADDRESS_PARTS:
        text = clean(source.get(key))
        if text:
            parts.append(text if key == "area" else f"{label} {text}")
    for key in ("address_line1", "address_line2", "landmark", "city"):
        text = clean(source.get(key))
        if text and text not in parts:
            parts.append(text)
    return ", ".join(parts)
