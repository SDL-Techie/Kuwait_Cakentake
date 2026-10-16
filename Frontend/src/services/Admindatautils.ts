/* ==========================================================================
   adminDataUtils — shared helpers for the admin Filter / Import / Export bar
   --------------------------------------------------------------------------
   Everything here is framework-free so it can be reused by any admin page:
   • deep value access ("customer.phone")
   • auto-detection of date / phone / order-id fields in any row shape
   • date presets (today, tomorrow, this month, this year…)
   • row filtering
   • Excel / CSV / Print export and Excel / CSV import parsing
   ========================================================================== */

import * as XLSX from 'xlsx';

export type DatePreset =
  | 'all'
  | 'today'
  | 'yesterday'
  | 'tomorrow'
  | 'week'
  | 'month'
  | 'year'
  | 'custom';

export interface AdminFilterState {
  preset: DatePreset;
  from: string; // yyyy-mm-dd
  to: string; // yyyy-mm-dd
  dateKey: string; // which date field to filter on
  phone: string;
  orderId: string;
  search: string;
}

export interface ExportColumn<T = any> {
  header: string;
  key?: string;
  value?: (row: T) => unknown;
}

export const EMPTY_FILTERS: AdminFilterState = {
  preset: 'all',
  from: '',
  to: '',
  dateKey: '',
  phone: '',
  orderId: '',
  search: '',
};

export const PRESET_LABELS: { key: DatePreset; label: string }[] = [
  { key: 'all', label: 'All time' },
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'tomorrow', label: 'Tomorrow' },
  { key: 'week', label: 'Last 7 days' },
  { key: 'month', label: 'This month' },
  { key: 'year', label: 'This year' },
  { key: 'custom', label: 'Custom' },
];

/* ── Known field names, in priority order ───────────────────────────────── */

export const DATE_KEY_CANDIDATES = [
  'created_at',
  'order_date',
  'createdAt',
  'orderDate',
  'delivery_date',
  'deliveryDate',
  'pickup_date',
  'pickupDate',
  'date',
  'transaction_date',
  'payment_date',
  'settlement_date',
  'settled_at',
  'requested_at',
  'requestedAt',
  'joined_at',
  'date_joined',
  'joinedAt',
  'published_at',
  'start_date',
  'end_date',
  'expiry_date',
  'updated_at',
  'updatedAt',
];

const ORDER_KEY_CANDIDATES = [
  'order_number',
  'orderNumber',
  'order_no',
  'order_id',
  'orderId',
  'invoice_number',
  'reference',
  'order.order_number',
  'order.id',
];

/* ── Generic helpers ────────────────────────────────────────────────────── */

export const getDeep = (obj: any, path: string): any => {
  if (obj === null || obj === undefined) return undefined;
  if (!path.includes('.')) return obj[path];
  return path.split('.').reduce((acc, k) => (acc === null || acc === undefined ? undefined : acc[k]), obj);
};

export const prettifyKey = (key: string): string =>
  key
    .replace(/\./g, ' ')
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bAt\b/, '')
    .trim();

const pad = (n: number) => String(n).padStart(2, '0');

export const toInputDate = (d: Date): string => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Parse a backend date value. Plain "yyyy-mm-dd" is treated as a LOCAL date. */
export const parseDate = (value: unknown): Date | null => {
  if (value === null || value === undefined || value === '') return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === 'number') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const s = String(value).trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  // dd/mm/yyyy (common in imported sheets)
  const dm = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(s);
  if (dm) return new Date(Number(dm[3]), Number(dm[2]) - 1, Number(dm[1]));
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
};

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/** Resolve a preset (or the custom from/to) into an inclusive [start, end] window. */
export const resolveRange = (f: Pick<AdminFilterState, 'preset' | 'from' | 'to'>): { start: Date | null; end: Date | null } => {
  const now = new Date();
  switch (f.preset) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now) };
    case 'yesterday': {
      const y = addDays(now, -1);
      return { start: startOfDay(y), end: endOfDay(y) };
    }
    case 'tomorrow': {
      const t = addDays(now, 1);
      return { start: startOfDay(t), end: endOfDay(t) };
    }
    case 'week':
      return { start: startOfDay(addDays(now, -6)), end: endOfDay(now) };
    case 'month':
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
      };
    case 'year':
      return { start: new Date(now.getFullYear(), 0, 1), end: endOfDay(new Date(now.getFullYear(), 11, 31)) };
    case 'custom': {
      const s = parseDate(f.from);
      const e = parseDate(f.to);
      return { start: s ? startOfDay(s) : null, end: e ? endOfDay(e) : null };
    }
    default:
      return { start: null, end: null };
  }
};

/** Range shown in the From / To inputs for a preset. */
export const presetToInputs = (preset: DatePreset): { from: string; to: string } => {
  const { start, end } = resolveRange({ preset, from: '', to: '' });
  return { from: start ? toInputDate(start) : '', to: end ? toInputDate(end) : '' };
};

/* ── Field detection ────────────────────────────────────────────────────── */

const SAMPLE = 60;

export const detectDateKeys = (rows: any[]): string[] => {
  const sample = rows.slice(0, SAMPLE);
  const found = DATE_KEY_CANDIDATES.filter((key) =>
    sample.some((r) => {
      const v = getDeep(r, key);
      return v !== null && v !== undefined && v !== '' && parseDate(v) !== null;
    })
  );
  if (found.length) return found;
  // Fallback: any top-level key that looks like a date field
  const keys = new Set<string>();
  sample.forEach((r) =>
    Object.keys(r || {}).forEach((k) => {
      if (/(date|_at|At|time)$/i.test(k) && parseDate(r[k])) keys.add(k);
    })
  );
  return [...keys];
};

/** Collects every phone-like value of a row (up to two levels deep). */
export const collectPhones = (row: any, explicitKeys?: string[]): string[] => {
  if (!row) return [];
  if (explicitKeys?.length) {
    return explicitKeys.map((k) => getDeep(row, k)).filter((v) => v !== null && v !== undefined && v !== '').map(String);
  }
  const out: string[] = [];
  const walk = (obj: any, depth: number) => {
    if (!obj || typeof obj !== 'object' || depth > 2) return;
    Object.entries(obj).forEach(([k, v]) => {
      if (v === null || v === undefined) return;
      if (typeof v === 'object') walk(v, depth + 1);
      else if (/(phone|mobile|contact_no|whatsapp)/i.test(k)) out.push(String(v));
    });
  };
  walk(row, 0);
  return out;
};

/** Collects every order-id-like value of a row. */
export const collectOrderIds = (row: any, explicitKeys?: string[]): string[] => {
  if (!row) return [];
  const keys = explicitKeys?.length ? explicitKeys : ORDER_KEY_CANDIDATES;
  const out = keys.map((k) => getDeep(row, k)).filter((v) => v !== null && v !== undefined && v !== '').map(String);
  // A row that is itself an order also matches on its numeric id
  if (!explicitKeys?.length && (row.order_number || row.orderNumber) && row.id !== undefined) out.push(String(row.id));
  return out;
};

export const hasAnyPhone = (rows: any[], keys?: string[]) => rows.slice(0, SAMPLE).some((r) => collectPhones(r, keys).length > 0);
export const hasAnyOrderId = (rows: any[], keys?: string[]) => rows.slice(0, SAMPLE).some((r) => collectOrderIds(r, keys).length > 0);

/* ── Filtering ──────────────────────────────────────────────────────────── */

const digits = (s: string) => s.replace(/\D/g, '');
const normId = (s: string) => s.toLowerCase().replace(/^#/, '').replace(/\s+/g, '');

export interface FilterOptions {
  phoneKeys?: string[];
  orderKeys?: string[];
  searchKeys?: string[];
  matchSet?: Set<string> | null; // values imported from a file ("match from file")
}

const rowSearchText = (row: any, searchKeys?: string[]): string => {
  if (searchKeys?.length) return searchKeys.map((k) => String(getDeep(row, k) ?? '')).join(' ').toLowerCase();
  try {
    return JSON.stringify(row).toLowerCase();
  } catch {
    return '';
  }
};

export const applyAdminFilters = <T,>(rows: T[], f: AdminFilterState, opts: FilterOptions = {}): T[] => {
  const { start, end } = resolveRange(f);
  const phoneQ = digits(f.phone);
  const orderQ = normId(f.orderId);
  const searchQ = f.search.trim().toLowerCase();

  return rows.filter((row: any) => {
    if ((start || end) && f.dateKey) {
      const d = parseDate(getDeep(row, f.dateKey));
      if (!d) return false;
      if (start && d < start) return false;
      if (end && d > end) return false;
    }
    if (phoneQ) {
      const phones = collectPhones(row, opts.phoneKeys).map(digits);
      if (!phones.some((p) => p.includes(phoneQ))) return false;
    }
    if (orderQ) {
      const ids = collectOrderIds(row, opts.orderKeys).map(normId);
      if (!ids.some((id) => id.includes(orderQ))) return false;
    }
    if (searchQ && !rowSearchText(row, opts.searchKeys).includes(searchQ)) return false;
    if (opts.matchSet && opts.matchSet.size) {
      const candidates = [
        ...collectOrderIds(row, opts.orderKeys).map(normId),
        ...collectPhones(row, opts.phoneKeys).map(digits),
        row?.id !== undefined ? String(row.id) : '',
        row?.email ? String(row.email).toLowerCase() : '',
      ].filter(Boolean);
      if (!candidates.some((c) => opts.matchSet!.has(c))) return false;
    }
    return true;
  });
};

/* ── Export ─────────────────────────────────────────────────────────────── */

const isPrimitive = (v: unknown) => v === null || ['string', 'number', 'boolean'].includes(typeof v);

/** Builds export columns automatically from the data (flattens one level). */
export const autoColumns = (rows: any[]): ExportColumn[] => {
  const keys: string[] = [];
  const add = (k: string) => {
    if (!keys.includes(k)) keys.push(k);
  };
  rows.slice(0, SAMPLE).forEach((r) => {
    Object.entries(r || {}).forEach(([k, v]) => {
      if (isPrimitive(v)) add(k);
      else if (v && typeof v === 'object' && !Array.isArray(v)) {
        Object.entries(v as Record<string, unknown>).forEach(([k2, v2]) => {
          if (isPrimitive(v2)) add(`${k}.${k2}`);
        });
      } else if (Array.isArray(v)) add(`${k}#count`);
    });
  });
  return keys.slice(0, 45).map((k) =>
    k.endsWith('#count')
      ? { header: `${prettifyKey(k.replace('#count', ''))} (count)`, value: (r: any) => (getDeep(r, k.replace('#count', '')) || []).length }
      : { header: prettifyKey(k) || k, key: k }
  );
};

const cellValue = (row: any, col: ExportColumn): unknown => {
  const v = col.value ? col.value(row) : col.key ? getDeep(row, col.key) : '';
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') {
    try {
      return JSON.stringify(v);
    } catch {
      return '';
    }
  }
  return v;
};

export const rowsToMatrix = (rows: any[], columns: ExportColumn[]) => [
  columns.map((c) => c.header),
  ...rows.map((r) => columns.map((c) => cellValue(r, c))),
];

const stamp = () => {
  const d = new Date();
  return `${toInputDate(d)}_${pad(d.getHours())}${pad(d.getMinutes())}`;
};

const safeName = (s: string) => s.replace(/[^\w-]+/g, '_').replace(/_+/g, '_').toLowerCase();

export const exportExcel = (rows: any[], columns: ExportColumn[], title: string) => {
  const ws = XLSX.utils.aoa_to_sheet(rowsToMatrix(rows, columns));
  ws['!cols'] = columns.map((c) => ({ wch: Math.min(Math.max(c.header.length + 2, 12), 40) }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, title.slice(0, 31) || 'Data');
  XLSX.writeFile(wb, `${safeName(title)}_${stamp()}.xlsx`);
};

export const exportCSV = (rows: any[], columns: ExportColumn[], title: string) => {
  const ws = XLSX.utils.aoa_to_sheet(rowsToMatrix(rows, columns));
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeName(title)}_${stamp()}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

/** Opens a print-ready window — the browser's "Save as PDF" turns it into a PDF. */
export const exportPrint = (rows: any[], columns: ExportColumn[], title: string, subtitle = '') => {
  const matrix = rowsToMatrix(rows, columns);
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>
  body{font-family:Inter,Arial,sans-serif;color:#22361d;margin:24px}
  h1{font-size:20px;margin:0 0 4px} p{color:#6b7a63;margin:0 0 16px;font-size:12px}
  table{border-collapse:collapse;width:100%;font-size:11px}
  th{background:#2f4626;color:#fff;text-align:left;padding:7px 8px}
  td{border-bottom:1px solid #d8e4c7;padding:6px 8px;vertical-align:top}
  tr:nth-child(even) td{background:#f7faf2}
  @media print{@page{size:landscape;margin:12mm}}
</style></head><body>
<h1>${esc(title)}</h1><p>${esc(subtitle)} · ${rows.length} record(s) · generated ${esc(new Date().toLocaleString())}</p>
<table><thead><tr>${matrix[0].map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>
<tbody>${matrix
    .slice(1)
    .map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`)
    .join('')}</tbody></table>
<script>window.onload=function(){setTimeout(function(){window.print()},300)}</script>
</body></html>`;
  const w = window.open('', '_blank');
  if (!w) return false;
  w.document.open();
  w.document.write(html);
  w.document.close();
  return true;
};

/* ── Import ─────────────────────────────────────────────────────────────── */

/** Normalises a header: "Order Number" → "order_number". */
export const normaliseHeader = (h: string) =>
  String(h)
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[^\w]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();

/** Reads the first sheet of an .xlsx / .xls / .csv file into plain objects. */
export const parseImportFile = async (file: File): Promise<Record<string, any>[]> => {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array', cellDates: true });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  if (!sheet) return [];
  const raw = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '', raw: false });
  return raw
    .map((r) => {
      const o: Record<string, any> = {};
      Object.entries(r).forEach(([k, v]) => {
        o[normaliseHeader(k)] = typeof v === 'string' ? v.trim() : v;
      });
      return o;
    })
    .filter((r) => Object.values(r).some((v) => v !== '' && v !== null && v !== undefined));
};

/** Pulls order ids / phones / ids / emails out of imported rows for "match from file". */
export const buildMatchSet = (rows: Record<string, any>[]): Set<string> => {
  const set = new Set<string>();
  rows.forEach((r) =>
    Object.entries(r).forEach(([k, v]) => {
      if (v === '' || v === null || v === undefined) return;
      const s = String(v);
      if (/phone|mobile/.test(k)) {
        const d = s.replace(/\D/g, '');
        if (d) set.add(d);
      } else if (/order|invoice|reference|^id$/.test(k)) {
        set.add(normId(s));
      } else if (/email/.test(k)) {
        set.add(s.toLowerCase());
      }
    })
  );
  return set;
};

export const downloadTemplate = (headers: string[], title: string) => {
  const ws = XLSX.utils.aoa_to_sheet([headers]);
  ws['!cols'] = headers.map((h) => ({ wch: Math.max(h.length + 4, 14) }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template');
  XLSX.writeFile(wb, `${safeName(title)}_import_template.xlsx`);
};