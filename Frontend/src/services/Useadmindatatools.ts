// import { useCallback, useEffect, useMemo, useState } from 'react';
// import {
//   AdminFilterState,
//   DatePreset,
//   EMPTY_FILTERS,
//   ExportColumn,
//   applyAdminFilters,
//   autoColumns,
//   buildMatchSet,
//   detectDateKeys,
//   downloadTemplate,
//   exportCSV,
//   exportExcel,
//   exportPrint,
//   hasAnyOrderId,
//   hasAnyPhone,
//   parseImportFile,
//   presetToInputs,
//   prettifyKey,
// } from './Admindatautils';

// /* ==========================================================================
//    useAdminDataTools
//    --------------------------------------------------------------------------
//    const tools = useAdminDataTools({ data: orders, title: 'Orders' });
//    tools.filtered            → rows after date / phone / order-id / search filters
//    <AdminDataToolbar tools={tools} />
//    ========================================================================== */

// export interface ImportOutcome {
//   ok: number;
//   failed: number;
//   errors?: string[];
// }

// export interface AdminDataToolsConfig<T> {
//   data: T[];
//   /** Used for file names and the print header. */
//   title: string;
//   /** Override auto-detected fields when a page needs specific ones. */
//   dateKeys?: string[];
//   phoneKeys?: string[];
//   orderKeys?: string[];
//   searchKeys?: string[];
//   /** Columns for export. Auto-generated from the data when omitted. */
//   columns?: ExportColumn<T>[];
//   /**
//    * When provided, imported rows are created through this callback
//    * (row objects use snake_case headers). When omitted, importing a file
//    * filters the table to the order ids / phones / emails found in it.
//    */
//   onImport?: (rows: Record<string, any>[]) => Promise<ImportOutcome | void>;
//   /** Header row for the downloadable import template. */
//   importTemplate?: string[];
//   /** Force-show or hide individual filter fields. */
//   fields?: { date?: boolean; phone?: boolean; order?: boolean; search?: boolean };
//   /** Remember filters for this key during the browser session. */
//   storageKey?: string;
// }

// export interface ImportPreview {
//   fileName: string;
//   rows: Record<string, any>[];
// }

// const readStored = (key?: string): AdminFilterState | null => {
//   if (!key) return null;
//   try {
//     const raw = sessionStorage.getItem(`adt:${key}`);
//     return raw ? { ...EMPTY_FILTERS, ...JSON.parse(raw) } : null;
//   } catch {
//     return null;
//   }
// };

// export function useAdminDataTools<T = any>(config: AdminDataToolsConfig<T>) {
//   const { data, title, storageKey } = config;
//   const rows = useMemo(() => (Array.isArray(data) ? data : []), [data]);

//   const [filters, setFilters] = useState<AdminFilterState>(() => readStored(storageKey) || EMPTY_FILTERS);
//   const [matchSet, setMatchSet] = useState<Set<string> | null>(null);
//   const [matchFile, setMatchFile] = useState<string>('');
//   const [preview, setPreview] = useState<ImportPreview | null>(null);
//   const [importing, setImporting] = useState(false);
//   const [importResult, setImportResult] = useState<ImportOutcome | null>(null);
//   const [message, setMessage] = useState<string>('');

//   /* ── Field availability ── */
//   const dateKeys = useMemo(() => config.dateKeys ?? detectDateKeys(rows), [config.dateKeys, rows]);
//   const empty = rows.length === 0;
//   const show = {
//     date: config.fields?.date ?? (empty || dateKeys.length > 0),
//     phone: config.fields?.phone ?? (empty || hasAnyPhone(rows, config.phoneKeys)),
//     order: config.fields?.order ?? (empty || hasAnyOrderId(rows, config.orderKeys)),
//     search: config.fields?.search ?? true,
//   };

//   // Pick a default date field once data arrives
//   useEffect(() => {
//     if (!dateKeys.length) return;
//     setFilters((f) => (f.dateKey && dateKeys.includes(f.dateKey) ? f : { ...f, dateKey: dateKeys[0] }));
//   }, [dateKeys]);

//   // Persist
//   useEffect(() => {
//     if (!storageKey) return;
//     try {
//       sessionStorage.setItem(`adt:${storageKey}`, JSON.stringify(filters));
//     } catch {
//       /* storage unavailable — ignore */
//     }
//   }, [filters, storageKey]);

//   useEffect(() => {
//     if (!message) return;
//     const t = window.setTimeout(() => setMessage(''), 3500);
//     return () => window.clearTimeout(t);
//   }, [message]);

//   /* ── Filtering ── */
//   const filtered = useMemo(
//     () =>
//       applyAdminFilters(rows, filters, {
//         phoneKeys: config.phoneKeys,
//         orderKeys: config.orderKeys,
//         searchKeys: config.searchKeys,
//         matchSet,
//       }),
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     [rows, filters, matchSet, config.phoneKeys?.join(), config.orderKeys?.join(), config.searchKeys?.join()]
//   );

//   const setPreset = useCallback((preset: DatePreset) => {
//     setFilters((f) => {
//       if (preset === 'custom') return { ...f, preset };
//       const { from, to } = presetToInputs(preset);
//       return { ...f, preset, from, to };
//     });
//   }, []);

//   const setRange = useCallback((from: string, to: string) => {
//     setFilters((f) => ({ ...f, preset: from || to ? 'custom' : 'all', from, to }));
//   }, []);

//   const update = useCallback((patch: Partial<AdminFilterState>) => setFilters((f) => ({ ...f, ...patch })), []);

//   const reset = useCallback(() => {
//     setFilters((f) => ({ ...EMPTY_FILTERS, dateKey: f.dateKey }));
//     setMatchSet(null);
//     setMatchFile('');
//   }, []);

//   const activeCount =
//     (filters.preset !== 'all' ? 1 : 0) +
//     (filters.phone ? 1 : 0) +
//     (filters.orderId ? 1 : 0) +
//     (filters.search ? 1 : 0) +
//     (matchSet ? 1 : 0);

//   /* ── Export ── */
//   const columns = useMemo<ExportColumn[]>(
//     () => (config.columns && config.columns.length ? (config.columns as ExportColumn[]) : autoColumns(rows)),
//     [config.columns, rows]
//   );

//   const rangeLabel = () => {
//     if (filters.preset === 'all') return 'All time';
//     if (filters.from || filters.to) return `${filters.from || '…'} → ${filters.to || '…'}`;
//     return filters.preset;
//   };

//   const doExport = useCallback(
//     (kind: 'xlsx' | 'csv' | 'print') => {
//       if (!filtered.length) {
//         setMessage('Nothing to export — no rows match the current filters.');
//         return;
//       }
//       if (kind === 'xlsx') exportExcel(filtered, columns, title);
//       if (kind === 'csv') exportCSV(filtered, columns, title);
//       if (kind === 'print' && !exportPrint(filtered, columns, title, rangeLabel())) {
//         setMessage('Please allow pop-ups to print / save as PDF.');
//         return;
//       }
//       setMessage(`Exported ${filtered.length} row${filtered.length === 1 ? '' : 's'}.`);
//     },
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     [filtered, columns, title, filters]
//   );

//   /* ── Import ── */
//   const canCreate = typeof config.onImport === 'function';

//   const handleFile = useCallback(
//     async (file: File) => {
//       try {
//         const parsed = await parseImportFile(file);
//         if (!parsed.length) {
//           setMessage('That file has no rows to import.');
//           return;
//         }
//         if (canCreate) {
//           setImportResult(null);
//           setPreview({ fileName: file.name, rows: parsed });
//         } else {
//           const set = buildMatchSet(parsed);
//           if (!set.size) {
//             setMessage('No order id, phone, id or email columns were found in that file.');
//             return;
//           }
//           setMatchSet(set);
//           setMatchFile(file.name);
//           setMessage(`Matching ${set.size} value(s) from ${file.name}.`);
//         }
//       } catch (err) {
//         console.error('Import parse failed', err);
//         setMessage('Could not read that file. Use .xlsx, .xls or .csv.');
//       }
//     },
//     [canCreate]
//   );

//   const confirmImport = useCallback(async () => {
//     if (!preview || !config.onImport) return;
//     setImporting(true);
//     try {
//       const res = await config.onImport(preview.rows);
//       setImportResult(res || { ok: preview.rows.length, failed: 0 });
//     } catch (err: any) {
//       setImportResult({ ok: 0, failed: preview.rows.length, errors: [err?.message || 'Import failed'] });
//     } finally {
//       setImporting(false);
//     }
//   }, [preview, config]);

//   const templateHeaders = useMemo(
//     () => config.importTemplate ?? columns.map((c) => c.header).slice(0, 15),
//     [config.importTemplate, columns]
//   );

//   return {
//     title,
//     rows,
//     filtered,
//     filters,
//     update,
//     setPreset,
//     setRange,
//     reset,
//     activeCount,
//     show,
//     dateKeys,
//     dateKeyLabel: (k: string) => prettifyKey(k),
//     // export
//     doExport,
//     // import
//     canCreate,
//     handleFile,
//     preview,
//     closePreview: () => {
//       setPreview(null);
//       setImportResult(null);
//     },
//     confirmImport,
//     importing,
//     importResult,
//     matchFile,
//     clearMatch: () => {
//       setMatchSet(null);
//       setMatchFile('');
//     },
//     downloadTemplate: () => downloadTemplate(templateHeaders, title),
//     message,
//   };
// }

// export type AdminDataTools = ReturnType<typeof useAdminDataTools>;

// /** Small helper to run a create-call per imported row and count results. */
// export const importRowByRow = async (
//   rows: Record<string, any>[],
//   create: (row: Record<string, any>) => Promise<unknown>
// ): Promise<ImportOutcome> => {
//   let ok = 0;
//   let failed = 0;
//   const errors: string[] = [];
//   for (let i = 0; i < rows.length; i++) {
//     try {
//       await create(rows[i]);
//       ok++;
//     } catch (err: any) {
//       failed++;
//       const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'failed';
//       if (errors.length < 8) errors.push(`Row ${i + 2}: ${msg}`);
//     }
//   }
//   return { ok, failed, errors };
// };

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AdminFilterState,
  DatePreset,
  EMPTY_FILTERS,
  ExportColumn,
  applyAdminFilters,
  autoColumns,
  buildMatchSet,
  detectDateKeys,
  downloadTemplate,
  exportCSV,
  exportExcel,
  exportPrint,
  hasAnyOrderId,
  hasAnyPhone,
  parseImportFile,
  presetToInputs,
  prettifyKey,
} from './Admindatautils';

/* ==========================================================================
   useAdminDataTools
   --------------------------------------------------------------------------
   const tools = useAdminDataTools({ data: orders, title: 'Orders' });
   tools.filtered            → rows after date / phone / order-id / search filters
   <AdminDataToolbar tools={tools} />
   ========================================================================== */

export interface ImportOutcome {
  ok: number;
  failed: number;
  errors?: string[];
}

export interface AdminDataToolsConfig<T> {
  data: T[];
  /** Used for file names and the print header. */
  title: string;
  /** Override auto-detected fields when a page needs specific ones. */
  dateKeys?: string[];
  phoneKeys?: string[];
  orderKeys?: string[];
  searchKeys?: string[];
  /** Columns for export. Auto-generated from the data when omitted. */
  columns?: ExportColumn<T>[];
  /**
   * When provided, imported rows are created through this callback
   * (row objects use snake_case headers). When omitted, importing a file
   * filters the table to the order ids / phones / emails found in it.
   */
  onImport?: (rows: Record<string, any>[]) => Promise<ImportOutcome | void>;
  /** Header row for the downloadable import template. */
  importTemplate?: string[];
  /** Force-show or hide individual filter fields. */
  fields?: { date?: boolean; phone?: boolean; order?: boolean; search?: boolean };
  /** Remember filters for this key during the browser session. */
  storageKey?: string;
}

export interface ImportPreview {
  fileName: string;
  rows: Record<string, any>[];
}

const readStored = (key?: string): AdminFilterState | null => {
  if (!key) return null;
  try {
    const raw = sessionStorage.getItem(`adt:${key}`);
    return raw ? { ...EMPTY_FILTERS, ...JSON.parse(raw) } : null;
  } catch {
    return null;
  }
};

export function useAdminDataTools<T = any>(config: AdminDataToolsConfig<T>) {
  const { data, title, storageKey } = config;
  const rows = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const [filters, setFilters] = useState<AdminFilterState>(() => readStored(storageKey) || EMPTY_FILTERS);
  const [matchSet, setMatchSet] = useState<Set<string> | null>(null);
  const [matchFile, setMatchFile] = useState<string>('');
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportOutcome | null>(null);
  const [message, setMessage] = useState<string>('');

  /* ── Field availability ── */
  const dateKeys = useMemo(() => config.dateKeys ?? detectDateKeys(rows), [config.dateKeys, rows]);
  const empty = rows.length === 0;
  const show = {
    date: config.fields?.date ?? (empty || dateKeys.length > 0),
    phone: config.fields?.phone ?? (empty || hasAnyPhone(rows, config.phoneKeys)),
    order: config.fields?.order ?? (empty || hasAnyOrderId(rows, config.orderKeys)),
    search: config.fields?.search ?? true,
  };

  // Pick a default date field once data arrives
  useEffect(() => {
    if (!dateKeys.length) return;
    setFilters((f) => (f.dateKey && dateKeys.includes(f.dateKey) ? f : { ...f, dateKey: dateKeys[0] }));
  }, [dateKeys]);

  // Persist
  useEffect(() => {
    if (!storageKey) return;
    try {
      sessionStorage.setItem(`adt:${storageKey}`, JSON.stringify(filters));
    } catch {
      /* storage unavailable — ignore */
    }
  }, [filters, storageKey]);

  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(() => setMessage(''), 3500);
    return () => window.clearTimeout(t);
  }, [message]);

  /* ── Filtering ── */
  const filtered = useMemo(
    () =>
      applyAdminFilters(rows, filters, {
        phoneKeys: config.phoneKeys,
        orderKeys: config.orderKeys,
        searchKeys: config.searchKeys,
        matchSet,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows, filters, matchSet, config.phoneKeys?.join(), config.orderKeys?.join(), config.searchKeys?.join()]
  );

  const setPreset = useCallback((preset: DatePreset) => {
    setFilters((f) => {
      if (preset === 'custom') return { ...f, preset };
      const { from, to } = presetToInputs(preset);
      return { ...f, preset, from, to };
    });
  }, []);

  const setRange = useCallback((from: string, to: string) => {
    setFilters((f) => ({ ...f, preset: from || to ? 'custom' : 'all', from, to }));
  }, []);

  const update = useCallback((patch: Partial<AdminFilterState>) => setFilters((f) => ({ ...f, ...patch })), []);

  const reset = useCallback(() => {
    setFilters((f) => ({ ...EMPTY_FILTERS, dateKey: f.dateKey }));
    setMatchSet(null);
    setMatchFile('');
  }, []);

  const activeCount =
    (filters.preset !== 'all' ? 1 : 0) +
    (filters.phone ? 1 : 0) +
    (filters.orderId ? 1 : 0) +
    (filters.search ? 1 : 0) +
    (matchSet ? 1 : 0);

  /* ── Export ── */
  const columns = useMemo<ExportColumn[]>(
    () => (config.columns && config.columns.length ? (config.columns as ExportColumn[]) : autoColumns(rows)),
    [config.columns, rows]
  );

  const rangeLabel = () => {
    if (filters.preset === 'all') return 'All time';
    if (filters.from || filters.to) return `${filters.from || '…'} → ${filters.to || '…'}`;
    return filters.preset;
  };

  const doExport = useCallback(
    (kind: 'xlsx' | 'csv' | 'print') => {
      if (!filtered.length) {
        setMessage('Nothing to export — no rows match the current filters.');
        return;
      }
      if (kind === 'xlsx') exportExcel(filtered, columns, title);
      if (kind === 'csv') exportCSV(filtered, columns, title);
      if (kind === 'print' && !exportPrint(filtered, columns, title, rangeLabel())) {
        setMessage('Please allow pop-ups to print / save as PDF.');
        return;
      }
      setMessage(`Exported ${filtered.length} row${filtered.length === 1 ? '' : 's'}.`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filtered, columns, title, filters]
  );

  /* ── Import ── */
  const canCreate = typeof config.onImport === 'function';

  const handleFile = useCallback(
    async (file: File) => {
      try {
        const parsed = await parseImportFile(file);
        if (!parsed.length) {
          setMessage('That file has no rows to import.');
          return;
        }
        if (canCreate) {
          setImportResult(null);
          setPreview({ fileName: file.name, rows: parsed });
        } else {
          const set = buildMatchSet(parsed);
          if (!set.size) {
            setMessage('No order id, phone, id or email columns were found in that file.');
            return;
          }
          setMatchSet(set);
          setMatchFile(file.name);
          setMessage(`Matching ${set.size} value(s) from ${file.name}.`);
        }
      } catch (err) {
        console.error('Import parse failed', err);
        setMessage('Could not read that file. Use .xlsx, .xls or .csv.');
      }
    },
    [canCreate]
  );

  const confirmImport = useCallback(async () => {
    if (!preview || !config.onImport) return;
    setImporting(true);
    try {
      const res = await config.onImport(preview.rows);
      setImportResult(res || { ok: preview.rows.length, failed: 0 });
    } catch (err: any) {
      setImportResult({ ok: 0, failed: preview.rows.length, errors: [err?.message || 'Import failed'] });
    } finally {
      setImporting(false);
    }
  }, [preview, config]);

  const templateHeaders = useMemo(
    () => config.importTemplate ?? columns.map((c) => c.header).slice(0, 15),
    [config.importTemplate, columns]
  );

  return {
    title,
    rows,
    filtered,
    filters,
    update,
    setPreset,
    setRange,
    reset,
    activeCount,
    show,
    dateKeys,
    dateKeyLabel: (k: string) => prettifyKey(k),
    // export
    doExport,
    // import
    canCreate,
    handleFile,
    preview,
    closePreview: () => {
      setPreview(null);
      setImportResult(null);
    },
    confirmImport,
    importing,
    importResult,
    matchFile,
    clearMatch: () => {
      setMatchSet(null);
      setMatchFile('');
    },
    downloadTemplate: () => downloadTemplate(templateHeaders, title),
    message,
  };
}

export type AdminDataTools = ReturnType<typeof useAdminDataTools>;

/** Small helper to run a create-call per imported row and count results. */
export const importRowByRow = async (
  rows: Record<string, any>[],
  create: (row: Record<string, any>) => Promise<unknown>
): Promise<ImportOutcome> => {
  let ok = 0;
  let failed = 0;
  const errors: string[] = [];
  for (let i = 0; i < rows.length; i++) {
    try {
      await create(rows[i]);
      ok++;
    } catch (err: any) {
      failed++;
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'failed';
      if (errors.length < 8) errors.push(`Row ${i + 2}: ${msg}`);
    }
  }
  return { ok, failed, errors };
};

// Re-export the toolbar so pages can import both from this one file:
// import { AdminDataToolbar, useAdminDataTools } from '../../services/Useadmindatatools';
export { default as AdminDataToolbar } from '../components/AdminDataTools/Admindatatoolbar';
// Also re-export the helpers (parseDate, exportExcel, …) used by some pages.
export * from './Admindatautils';