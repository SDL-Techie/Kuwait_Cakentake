"""
kuwait_time.py — one place for "what time / what day is it in Kuwait".

Why a fixed offset instead of ZoneInfo("Asia/Kuwait")?
Kuwait is UTC+3 all year with no daylight saving, so a fixed offset is exact
and needs no `tzdata` package (your venv is on Windows, where ZoneInfo fails
without it).

RULES
- The database keeps storing UTC. Do NOT change stored data or columns.
- Use utc_now() when SAVING a timestamp.
- Use kuwait_now() / kuwait_today() when deciding "today", "this month",
  order-number dates, report days, etc.
"""
from datetime import datetime, date, time, timedelta, timezone

KUWAIT_TZ = timezone(timedelta(hours=3), name="Asia/Kuwait")


def utc_now() -> datetime:
    """Timezone-aware current time in UTC (use for saving to the DB)."""
    return datetime.now(timezone.utc)


def kuwait_now() -> datetime:
    """Timezone-aware current time in Kuwait."""
    return datetime.now(KUWAIT_TZ)


def kuwait_today() -> date:
    """Today's calendar date in Kuwait."""
    return kuwait_now().date()


def to_kuwait(dt: datetime | None) -> datetime | None:
    """Convert a stored datetime (naive = UTC) to Kuwait time."""
    if dt is None:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(KUWAIT_TZ)


def kuwait_day_bounds_utc(day: date | None = None) -> tuple[datetime, datetime]:
    """
    Start (inclusive) and end (exclusive) of a Kuwait calendar day, as UTC.
    Use in queries instead of `func.date(Order.created_at) == today`:

        start, end = kuwait_day_bounds_utc()
        Order.query.filter(Order.created_at >= start, Order.created_at < end)
    """
    day = day or kuwait_today()
    start_kw = datetime.combine(day, time.min, tzinfo=KUWAIT_TZ)
    end_kw = start_kw + timedelta(days=1)
    return start_kw.astimezone(timezone.utc), end_kw.astimezone(timezone.utc)


def kuwait_month_bounds_utc(year: int, month: int) -> tuple[datetime, datetime]:
    """Start (inclusive) and end (exclusive) of a Kuwait calendar month, as UTC."""
    start_kw = datetime(year, month, 1, tzinfo=KUWAIT_TZ)
    ny, nm = (year + 1, 1) if month == 12 else (year, month + 1)
    end_kw = datetime(ny, nm, 1, tzinfo=KUWAIT_TZ)
    return start_kw.astimezone(timezone.utc), end_kw.astimezone(timezone.utc)