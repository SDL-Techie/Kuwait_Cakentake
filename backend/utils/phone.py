"""
utils/phone.py

Validation + normalization for customer contact numbers.

Client request (13/10/2026): "On occasion, contact numbers may contain
incorrect [values]" on the order form. Root causes found:

* The web order form defaulted the country picker to India (+91), so a Kuwait
  number typed without switching country was saved as "+91XXXXXXXX".
* Stored local numbers ("51234567") or numbers without "+" ("96551234567")
  were re-parsed with the wrong country and truncated when an existing
  customer was picked.
* The backend accepted any text.

``normalize_phone`` returns an E.164 string ("+96551234567") or raises
``PhoneError`` with a message that can be shown to staff as-is.
"""

from __future__ import annotations

import re

KUWAIT_CODE = "965"
KUWAIT_LOCAL_LEN = 8
# Kuwait numbers: 2x landline, 4/5/6/9x mobile, 1x service numbers.
_KUWAIT_LOCAL_RE = re.compile(r"^[124569]\d{7}$")

# National-number lengths for the dial codes customers actually use here.
_KNOWN_LENGTHS = {
    "965": (8,),        # Kuwait
    "966": (9,),        # Saudi Arabia
    "971": (9,),        # UAE
    "973": (8,),        # Bahrain
    "974": (8,),        # Qatar
    "968": (8,),        # Oman
    "91": (10,),        # India
    "92": (10,),        # Pakistan
    "880": (10,),       # Bangladesh
    "94": (9,),         # Sri Lanka
    "977": (10,),       # Nepal
    "63": (10,),        # Philippines
    "20": (10,),        # Egypt
    "962": (9,),        # Jordan
    "961": (7, 8),      # Lebanon
    "44": (10,),        # United Kingdom
    "1": (10,),         # USA / Canada
}


class PhoneError(ValueError):
    pass


def _digits(value) -> str:
    return re.sub(r"\D", "", str(value or ""))


def normalize_phone(raw, *, field: str = "Phone number") -> str:
    """Return the number in E.164 form or raise PhoneError."""
    text = str(raw or "").strip()
    if not text:
        raise PhoneError(f"{field} is required")

    has_plus = text.startswith("+") or text.startswith("00")
    digits = _digits(text)
    if text.startswith("00"):
        digits = digits[2:]

    if not digits:
        raise PhoneError(f"{field} must contain digits")

    # Local Kuwait number typed without a country code.
    if not has_plus and len(digits) == KUWAIT_LOCAL_LEN:
        digits = KUWAIT_CODE + digits

    # Country code typed twice, e.g. +965 965 5123 4567.
    if digits.startswith(KUWAIT_CODE * 2) and len(digits) == 3 + 3 + KUWAIT_LOCAL_LEN:
        digits = digits[3:]

    if digits.startswith(KUWAIT_CODE):
        local = digits[len(KUWAIT_CODE):]
        if len(local) != KUWAIT_LOCAL_LEN or not _KUWAIT_LOCAL_RE.match(local):
            raise PhoneError(
                f"{field}: Kuwait numbers must be 8 digits after +965 "
                f"(starting with 2, 4, 5, 6 or 9)"
            )
        return f"+{digits}"

    if not has_plus and len(digits) not in range(11, 16):
        raise PhoneError(
            f"{field}: enter an 8-digit Kuwait number or include the country code (e.g. +971...)"
        )

    # Validate the national-number length for well-known dial codes.
    for code in sorted(_KNOWN_LENGTHS, key=len, reverse=True):
        if digits.startswith(code):
            national = digits[len(code):]
            if len(national) not in _KNOWN_LENGTHS[code]:
                expected = " or ".join(str(n) for n in _KNOWN_LENGTHS[code])
                hint = ""
                if len(national) == KUWAIT_LOCAL_LEN and _KUWAIT_LOCAL_RE.match(national):
                    hint = f" — did you mean +{KUWAIT_CODE}{national}?"
                raise PhoneError(
                    f"{field}: +{code} numbers need {expected} digits after the country code{hint}"
                )
            return f"+{digits}"

    if not 8 <= len(digits) <= 15:
        raise PhoneError(f"{field} is not a valid international number")
    return f"+{digits}"


def phone_variants(normalized: str) -> list[str]:
    """Spellings an existing customer row might have been saved with."""
    digits = _digits(normalized)
    variants = {normalized, digits, f"00{digits}"}
    if digits.startswith(KUWAIT_CODE) and len(digits) == 3 + KUWAIT_LOCAL_LEN:
        local = digits[3:]
        variants.update({local, f"+{KUWAIT_CODE} {local}", f"{KUWAIT_CODE}{local}"})
    return [v for v in variants if v]
