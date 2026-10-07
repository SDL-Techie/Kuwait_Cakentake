/**
 * kuwaitTime.ts — ONE place for every date/time the website shows or compares.
 *
 * Rule: the browser's own timezone (India, or anywhere) is never used.
 * Everything is converted to Asia/Kuwait (UTC+3, no daylight saving).
 *
 * Backend timestamps (created_at, delivered_at, ...) arrive as UTC ISO strings
 * like "2026-10-06T08:15:00+00:00". Plain dates (delivery_date, pickup_date)
 * arrive as "2026-10-06" — those are already Kuwait calendar dates and must
 * NOT be shifted.
 */

import { useEffect, useState } from 'react';

export const KUWAIT_TZ = 'Asia/Kuwait';
export const KUWAIT_LABEL = 'Kuwait (GMT+3)';

/**
 * Triggers a component re-render every `intervalMs` ms so that
 * dynamic time calculations (such as slot availability cutoffs) stay fresh.
 */
export function useKuwaitTick(intervalMs = 60000): number {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return Date.now();
}

/* ── Parsing ─────────────────────────────────────────────────────────────── */

/** Date-only strings ("YYYY-MM-DD") have no time, so they must not be converted. */
const isDateOnly = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v.trim());

/** Safe parse. A timestamp with no zone info is treated as UTC (what the API means). */
export function parseApiDate(value?: string | number | Date | null): Date | null {
  if (value == null || value === '') return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (typeof value === 'number') return new Date(value);

  const s = String(value).trim();
  if (isDateOnly(s)) return new Date(`${s}T00:00:00Z`);

  const hasZone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(s);
  const d = new Date(hasZone ? s : `${s.replace(' ', 'T')}Z`);
  return isNaN(d.getTime()) ? null : d;
}

/* ── Kuwait "now" ────────────────────────────────────────────────────────── */

interface KuwaitParts {
  year: number; month: number; day: number;
  hour: number; minute: number; second: number;
}

const partsFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: KUWAIT_TZ,
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit',
  hourCycle: 'h23',
});

/** Calendar/clock parts of an instant, as seen in Kuwait. */
export function getKuwaitParts(date: Date = new Date()): KuwaitParts {
  const map: Record<string, number> = {};
  for (const p of partsFormatter.formatToParts(date)) {
    if (p.type !== 'literal') map[p.type] = Number(p.value);
  }
  return {
    year: map.year, month: map.month, day: map.day,
    hour: map.hour % 24, minute: map.minute, second: map.second,
  };
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Today's date in Kuwait, "YYYY-MM-DD" — use for <input type="date" min=...>. */
export function getKuwaitTodayStr(): string {
  const p = getKuwaitParts();
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

/** Minutes since midnight in Kuwait — use for time-slot cut-offs. */
export function getKuwaitMinutesNow(): number {
  const p = getKuwaitParts();
  return p.hour * 60 + p.minute;
}

/** Current month in Kuwait, "YYYY-MM". */
export function getKuwaitMonthStr(): string {
  const p = getKuwaitParts();
  return `${p.year}-${pad(p.month)}`;
}

/* ── Keys for filtering (replace local-time versions) ────────────────────── */

/** "YYYY-MM-DD" of an order timestamp as seen in Kuwait. */
export function toKuwaitDateKey(value?: string | null): string {
  if (!value) return '';
  if (isDateOnly(value)) return value.trim();
  const d = parseApiDate(value);
  if (!d) return '';
  const p = getKuwaitParts(d);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

/** "YYYY-MM" of an order timestamp as seen in Kuwait. */
export function toKuwaitMonthKey(value?: string | null): string {
  return toKuwaitDateKey(value).slice(0, 7);
}

/* ── Display formatting ──────────────────────────────────────────────────── */

type Fmt = Intl.DateTimeFormatOptions;

function fmt(value: string | Date | null | undefined, opts: Fmt, fallback = '—'): string {
  if (value == null || value === '') return fallback;
  // Date-only value → show the calendar date as-is (UTC zone prevents shifting)
  const dateOnly = typeof value === 'string' && isDateOnly(value);
  const d = parseApiDate(value);
  if (!d) return typeof value === 'string' ? value : fallback;
  return new Intl.DateTimeFormat('en-GB', {
    ...opts,
    timeZone: dateOnly ? 'UTC' : KUWAIT_TZ,
  }).format(d);
}

/** 06 Oct 2026 */
export const formatKuwaitDate = (v?: string | Date | null) =>
  fmt(v, { day: '2-digit', month: 'short', year: 'numeric' });

/** 03:45 PM */
export const formatKuwaitTime = (v?: string | Date | null) =>
  fmt(v, { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();

/** 06 Oct 2026, 03:45 PM */
export const formatKuwaitDateTime = (v?: string | Date | null) =>
  fmt(v, {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  }).replace(' am', ' AM').replace(' pm', ' PM');

/** 06 Oct, 03:45 PM  (compact, for table rows) */
export const formatKuwaitShort = (v?: string | Date | null) =>
  fmt(v, {
    day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit', hour12: true,
  }).replace(' am', ' AM').replace(' pm', ' PM');

/** "October 2026" from a "YYYY-MM" key */
export function formatKuwaitMonthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number);
  if (!y || !m) return '';
  return new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(Date.UTC(y, m - 1, 1)));
}

/** "2 h ago" style text, independent of the viewer's timezone. */
export function kuwaitTimeAgo(value?: string | null): string {
  const d = parseApiDate(value);
  if (!d) return '';
  const mins = Math.max(0, Math.floor((Date.now() - d.getTime()) / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h} h ago`;
  return `${Math.floor(h / 24)} d ago`;
}

/* ── Time-slot helpers (Checkout, Agent order, Sales-agent order) ────────── */

/**
 * Hide today's slots that start less than `leadMinutes` from now (Kuwait time).
 * For any other date, every slot stays available.
 */
export function filterSlotsForKuwait<T extends { startMinutes: number }>(
  slots: T[],
  dateStr: string,
  leadMinutes = 60
): T[] {
  if (!dateStr || dateStr !== getKuwaitTodayStr()) return slots;
  const cutoff = getKuwaitMinutesNow() + leadMinutes;
  return slots.filter((s) => s.startMinutes >= cutoff);
}