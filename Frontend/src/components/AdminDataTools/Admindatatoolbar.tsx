// import React, { useEffect, useId, useRef, useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   CalendarDays,
//   ChevronDown,
//   Download,
//   FileSpreadsheet,
//   FileText,
//   Filter,
//   Hash,
//   Leaf,
//   Phone,
//   Printer,
//   RotateCcw,
//   Search,
//   Upload,
//   X,
//   CheckCircle2,
//   AlertTriangle,
//   ArrowRight,
// } from 'lucide-react';
// import { PRESET_LABELS } from '../../services/Admindatautils';
// import type { AdminDataTools } from '../../services/Useadmindatatools';
// import './AdminDataToolbar.css';

// /* ==========================================================================
//    AdminDataToolbar — the pistachio "filter deck" used on every admin page
//    • time track: All / Today / Yesterday / Tomorrow / 7 days / Month / Year / Custom
//    • From → To date capsule + "date by" switch when several date fields exist
//    • Phone number, Order ID and free-text search
//    • Import (create rows, or match ids/phones from a file) and Export
//      (Excel, CSV, Print / PDF) — always of the filtered rows
//    ========================================================================== */

// interface Props {
//   tools: AdminDataTools;
//   /** Optional extra controls rendered at the end of the field row. */
//   children?: React.ReactNode;
//   /** Hide Import (e.g. on purely analytical pages). */
//   hideImport?: boolean;
//   /** Hide Export. */
//   hideExport?: boolean;
//   compact?: boolean;
// }

// const AdminDataToolbar: React.FC<Props> = ({ tools, children, hideImport, hideExport, compact }) => {
//   const uid = useId();
//   const fileRef = useRef<HTMLInputElement>(null);
//   const exportRef = useRef<HTMLDivElement>(null);
//   const [exportOpen, setExportOpen] = useState(false);
//   const [mobileOpen, setMobileOpen] = useState(false);
//   const { filters, show } = tools;

//   useEffect(() => {
//     if (!exportOpen) return;
//     const close = (e: MouseEvent) => {
//       if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false);
//     };
//     document.addEventListener('mousedown', close);
//     return () => document.removeEventListener('mousedown', close);
//   }, [exportOpen]);

//   const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const f = e.target.files?.[0];
//     if (f) tools.handleFile(f);
//     e.target.value = '';
//   };

//   const presetLabel = PRESET_LABELS.find((p) => p.key === filters.preset)?.label || '';

//   const chips: { label: string; clear: () => void }[] = [];
//   if (filters.preset !== 'all')
//     chips.push({
//       label: filters.preset === 'custom' ? `${filters.from || '…'} → ${filters.to || '…'}` : presetLabel,
//       clear: () => tools.setPreset('all'),
//     });
//   if (filters.phone) chips.push({ label: `Phone: ${filters.phone}`, clear: () => tools.update({ phone: '' }) });
//   if (filters.orderId) chips.push({ label: `Order: ${filters.orderId}`, clear: () => tools.update({ orderId: '' }) });
//   if (filters.search) chips.push({ label: `“${filters.search}”`, clear: () => tools.update({ search: '' }) });
//   if (tools.matchFile) chips.push({ label: `From file: ${tools.matchFile}`, clear: tools.clearMatch });

//   return (
//     <div className={`adt-deck ${compact ? 'is-compact' : ''}`}>
//       {/* ── Top line ── */}
//       <div className="adt-top">
//         <div className="adt-title">
//           <span className="adt-leaf">
//             <Leaf size={15} />
//           </span>
//           <div>
//             <strong>{tools.title}</strong>
//             <span className="adt-count">
//               Showing <b>{tools.filtered.length}</b> of {tools.rows.length}
//             </span>
//           </div>
//           {tools.activeCount > 0 && <span className="adt-badge">{tools.activeCount} active</span>}
//         </div>

//         <div className="adt-actions">
//           <button type="button" className="adt-btn adt-only-mobile" onClick={() => setMobileOpen((o) => !o)}>
//             <Filter size={15} /> Filters
//           </button>

//           {!hideImport && (
//             <>
//               <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" hidden onChange={onPickFile} />
//               <button
//                 type="button"
//                 className="adt-btn"
//                 onClick={() => fileRef.current?.click()}
//                 title={
//                   tools.canCreate
//                     ? 'Import rows from Excel / CSV'
//                     : 'Import a list of order ids / phones / emails to filter this table'
//                 }
//               >
//                 <Upload size={15} /> Import
//               </button>
//             </>
//           )}

//           {!hideExport && (
//             <div className="adt-export" ref={exportRef}>
//               <button type="button" className="adt-btn adt-btn-solid" onClick={() => setExportOpen((o) => !o)}>
//                 <Download size={15} /> Export <ChevronDown size={14} />
//               </button>
//               <AnimatePresence>
//                 {exportOpen && (
//                   <motion.div
//                     className="adt-menu"
//                     initial={{ opacity: 0, y: -6, scale: 0.98 }}
//                     animate={{ opacity: 1, y: 0, scale: 1 }}
//                     exit={{ opacity: 0, y: -6, scale: 0.98 }}
//                     transition={{ duration: 0.15 }}
//                   >
//                     <button onClick={() => (tools.doExport('xlsx'), setExportOpen(false))}>
//                       <FileSpreadsheet size={16} /> Excel (.xlsx)
//                     </button>
//                     <button onClick={() => (tools.doExport('csv'), setExportOpen(false))}>
//                       <FileText size={16} /> CSV
//                     </button>
//                     <button onClick={() => (tools.doExport('print'), setExportOpen(false))}>
//                       <Printer size={16} /> Print / PDF
//                     </button>
//                     {!hideImport && (
//                       <button onClick={() => (tools.downloadTemplate(), setExportOpen(false))}>
//                         <Upload size={16} /> Import template
//                       </button>
//                     )}
//                     <small>Exports the {tools.filtered.length} filtered row(s)</small>
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div>
//           )}

//           <button type="button" className="adt-icon-btn" onClick={tools.reset} title="Reset all filters" aria-label="Reset filters">
//             <RotateCcw size={15} />
//           </button>
//         </div>
//       </div>

//       <div className={`adt-body ${mobileOpen ? 'is-open' : ''}`}>
//         {/* ── Time track ── */}
//         {show.date && (
//           <div className="adt-track" role="tablist" aria-label="Date range">
//             {PRESET_LABELS.map((p) => {
//               const active = filters.preset === p.key;
//               return (
//                 <button
//                   key={p.key}
//                   type="button"
//                   role="tab"
//                   aria-selected={active}
//                   className={`adt-track-item ${active ? 'is-active' : ''}`}
//                   onClick={() => tools.setPreset(p.key)}
//                 >
//                   {active && <motion.span layoutId={`adt-pill-${uid}`} className="adt-track-pill" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
//                   <span className="adt-track-label">{p.label}</span>
//                 </button>
//               );
//             })}
//           </div>
//         )}

//         {/* ── Fields ── */}
//         <div className="adt-fields">
//           {show.date && (
//             <div className="adt-range">
//               <label className="adt-range-part">
//                 <CalendarDays size={15} />
//                 <span>From</span>
//                 <input type="date" value={filters.from} max={filters.to || undefined} onChange={(e) => tools.setRange(e.target.value, filters.to)} />
//               </label>
//               <ArrowRight size={14} className="adt-range-arrow" />
//               <label className="adt-range-part">
//                 <span>To</span>
//                 <input type="date" value={filters.to} min={filters.from || undefined} onChange={(e) => tools.setRange(filters.from, e.target.value)} />
//               </label>
//             </div>
//           )}

//           {show.date && tools.dateKeys.length > 1 && (
//             <label className="adt-field adt-select">
//               <span className="adt-field-tag">Date by</span>
//               <select value={filters.dateKey} onChange={(e) => tools.update({ dateKey: e.target.value })}>
//                 {tools.dateKeys.map((k) => (
//                   <option key={k} value={k}>
//                     {tools.dateKeyLabel(k)}
//                   </option>
//                 ))}
//               </select>
//             </label>
//           )}

//           {show.phone && (
//             <label className="adt-field">
//               <Phone size={15} />
//               <input
//                 type="tel"
//                 inputMode="tel"
//                 placeholder="Phone number"
//                 value={filters.phone}
//                 onChange={(e) => tools.update({ phone: e.target.value })}
//               />
//               {filters.phone && (
//                 <button type="button" className="adt-clear" onClick={() => tools.update({ phone: '' })} aria-label="Clear phone">
//                   <X size={13} />
//                 </button>
//               )}
//             </label>
//           )}

//           {show.order && (
//             <label className="adt-field">
//               <Hash size={15} />
//               <input
//                 type="text"
//                 placeholder="Order ID"
//                 value={filters.orderId}
//                 onChange={(e) => tools.update({ orderId: e.target.value })}
//               />
//               {filters.orderId && (
//                 <button type="button" className="adt-clear" onClick={() => tools.update({ orderId: '' })} aria-label="Clear order id">
//                   <X size={13} />
//                 </button>
//               )}
//             </label>
//           )}

//           {show.search && (
//             <label className="adt-field adt-grow">
//               <Search size={15} />
//               <input
//                 type="search"
//                 placeholder="Search anything…"
//                 value={filters.search}
//                 onChange={(e) => tools.update({ search: e.target.value })}
//               />
//             </label>
//           )}

//           {children}
//         </div>

//         {/* ── Active chips ── */}
//         <AnimatePresence initial={false}>
//           {chips.length > 0 && (
//             <motion.div
//               className="adt-chips"
//               initial={{ height: 0, opacity: 0 }}
//               animate={{ height: 'auto', opacity: 1 }}
//               exit={{ height: 0, opacity: 0 }}
//             >
//               {chips.map((c) => (
//                 <motion.span key={c.label} className="adt-chip" layout initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
//                   {c.label}
//                   <button type="button" onClick={c.clear} aria-label={`Remove ${c.label}`}>
//                     <X size={12} />
//                   </button>
//                 </motion.span>
//               ))}
//               <button type="button" className="adt-clear-all" onClick={tools.reset}>
//                 Clear all
//               </button>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>

//       <AnimatePresence>
//         {tools.message && (
//           <motion.div className="adt-toast" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
//             {tools.message}
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* ── Import preview ── */}
//       <AnimatePresence>
//         {tools.preview && (
//           <motion.div className="adt-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={tools.closePreview}>
//             <motion.div
//               className="adt-modal"
//               initial={{ opacity: 0, y: 24, scale: 0.97 }}
//               animate={{ opacity: 1, y: 0, scale: 1 }}
//               exit={{ opacity: 0, y: 24, scale: 0.97 }}
//               onClick={(e) => e.stopPropagation()}
//             >
//               <div className="adt-modal-head">
//                 <div>
//                   <h3>Import into {tools.title}</h3>
//                   <p>
//                     {tools.preview.fileName} · {tools.preview.rows.length} row(s) found
//                   </p>
//                 </div>
//                 <button type="button" className="adt-icon-btn" onClick={tools.closePreview} aria-label="Close">
//                   <X size={16} />
//                 </button>
//               </div>

//               <div className="adt-preview">
//                 <table>
//                   <thead>
//                     <tr>
//                       {Object.keys(tools.preview.rows[0] || {})
//                         .slice(0, 8)
//                         .map((h) => (
//                           <th key={h}>{h}</th>
//                         ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {tools.preview.rows.slice(0, 6).map((r, i) => (
//                       <tr key={i}>
//                         {Object.keys(tools.preview!.rows[0] || {})
//                           .slice(0, 8)
//                           .map((h) => (
//                             <td key={h}>{String(r[h] ?? '')}</td>
//                           ))}
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//                 {tools.preview.rows.length > 6 && <small>…and {tools.preview.rows.length - 6} more row(s)</small>}
//               </div>

//               {tools.importResult && (
//                 <div className={`adt-result ${tools.importResult.failed ? 'has-errors' : ''}`}>
//                   {tools.importResult.failed ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
//                   <div>
//                     <strong>
//                       {tools.importResult.ok} imported
//                       {tools.importResult.failed ? ` · ${tools.importResult.failed} failed` : ''}
//                     </strong>
//                     {tools.importResult.errors?.map((e) => (
//                       <span key={e}>{e}</span>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               <div className="adt-modal-foot">
//                 <button type="button" className="adt-btn" onClick={tools.downloadTemplate}>
//                   <Download size={15} /> Template
//                 </button>
//                 <div className="adt-spacer" />
//                 <button type="button" className="adt-btn" onClick={tools.closePreview}>
//                   {tools.importResult ? 'Close' : 'Cancel'}
//                 </button>
//                 {!tools.importResult && (
//                   <button type="button" className="adt-btn adt-btn-solid" onClick={tools.confirmImport} disabled={tools.importing}>
//                     {tools.importing ? 'Importing…' : `Import ${tools.preview.rows.length} row(s)`}
//                   </button>
//                 )}
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default AdminDataToolbar;


import React, { useEffect, useId, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays,
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Hash,
  Leaf,
  Phone,
  Printer,
  RotateCcw,
  Search,
  Upload,
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { PRESET_LABELS } from '../../services/Admindatautils';
import type { AdminDataTools } from '../../services/Useadmindatatools';
import './Admindatatoolbar.css';

/* ==========================================================================
   AdminDataToolbar — the pistachio "filter deck" used on every admin page
   • time track: All / Today / Yesterday / Tomorrow / 7 days / Month / Year / Custom
   • From → To date capsule + "date by" switch when several date fields exist
   • Phone number, Order ID and free-text search
   • Import (create rows, or match ids/phones from a file) and Export
     (Excel, CSV, Print / PDF) — always of the filtered rows
   ========================================================================== */

interface Props {
  tools: AdminDataTools;
  /** Optional extra controls rendered at the end of the field row. */
  children?: React.ReactNode;
  /** Hide Import (e.g. on purely analytical pages). */
  hideImport?: boolean;
  /** Hide Export. */
  hideExport?: boolean;
  compact?: boolean;
}

const AdminDataToolbar: React.FC<Props> = ({ tools, children, hideImport, hideExport, compact }) => {
  const uid = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { filters, show } = tools;

  useEffect(() => {
    if (!exportOpen) return;
    const close = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [exportOpen]);

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) tools.handleFile(f);
    e.target.value = '';
  };

  const presetLabel = PRESET_LABELS.find((p) => p.key === filters.preset)?.label || '';

  const chips: { label: string; clear: () => void }[] = [];
  if (filters.preset !== 'all')
    chips.push({
      label: filters.preset === 'custom' ? `${filters.from || '…'} → ${filters.to || '…'}` : presetLabel,
      clear: () => tools.setPreset('all'),
    });
  if (filters.phone) chips.push({ label: `Phone: ${filters.phone}`, clear: () => tools.update({ phone: '' }) });
  if (filters.orderId) chips.push({ label: `Order: ${filters.orderId}`, clear: () => tools.update({ orderId: '' }) });
  if (filters.search) chips.push({ label: `“${filters.search}”`, clear: () => tools.update({ search: '' }) });
  if (tools.matchFile) chips.push({ label: `From file: ${tools.matchFile}`, clear: tools.clearMatch });

  return (
    <div className={`adt-deck ${compact ? 'is-compact' : ''}`}>
      {/* ── Top line ── */}
      <div className="adt-top">
        <div className="adt-title">
          <span className="adt-leaf">
            <Leaf size={15} />
          </span>
          <div>
            <strong>{tools.title}</strong>
            <span className="adt-count">
              Showing <b>{tools.filtered.length}</b> of {tools.rows.length}
            </span>
          </div>
          {tools.activeCount > 0 && <span className="adt-badge">{tools.activeCount} active</span>}
        </div>

        <div className="adt-actions">
          <button type="button" className="adt-btn adt-only-mobile" onClick={() => setMobileOpen((o) => !o)}>
            <Filter size={15} /> Filters
          </button>

          {!hideImport && (
            <>
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" hidden onChange={onPickFile} />
              <button
                type="button"
                className="adt-btn"
                onClick={() => fileRef.current?.click()}
                title={
                  tools.canCreate
                    ? 'Import rows from Excel / CSV'
                    : 'Import a list of order ids / phones / emails to filter this table'
                }
              >
                <Upload size={15} /> Import
              </button>
            </>
          )}

          {!hideExport && (
            <div className="adt-export" ref={exportRef}>
              <button type="button" className="adt-btn adt-btn-solid" onClick={() => setExportOpen((o) => !o)}>
                <Download size={15} /> Export <ChevronDown size={14} />
              </button>
              <AnimatePresence>
                {exportOpen && (
                  <motion.div
                    className="adt-menu"
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                  >
                    <button onClick={() => (tools.doExport('xlsx'), setExportOpen(false))}>
                      <FileSpreadsheet size={16} /> Excel (.xlsx)
                    </button>
                    <button onClick={() => (tools.doExport('csv'), setExportOpen(false))}>
                      <FileText size={16} /> CSV
                    </button>
                    <button onClick={() => (tools.doExport('print'), setExportOpen(false))}>
                      <Printer size={16} /> Print / PDF
                    </button>
                    {!hideImport && (
                      <button onClick={() => (tools.downloadTemplate(), setExportOpen(false))}>
                        <Upload size={16} /> Import template
                      </button>
                    )}
                    <small>Exports the {tools.filtered.length} filtered row(s)</small>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <button type="button" className="adt-icon-btn" onClick={tools.reset} title="Reset all filters" aria-label="Reset filters">
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      <div className={`adt-body ${mobileOpen ? 'is-open' : ''}`}>
        {/* ── Time track ── */}
        {show.date && (
          <div className="adt-track" role="tablist" aria-label="Date range">
            {PRESET_LABELS.map((p) => {
              const active = filters.preset === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={`adt-track-item ${active ? 'is-active' : ''}`}
                  onClick={() => tools.setPreset(p.key)}
                >
                  {active && <motion.span layoutId={`adt-pill-${uid}`} className="adt-track-pill" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
                  <span className="adt-track-label">{p.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Fields ── */}
        <div className="adt-fields">
          {show.date && (
            <div className="adt-range">
              <label className="adt-range-part">
                <CalendarDays size={15} />
                <span>From</span>
                <input type="date" value={filters.from} max={filters.to || undefined} onChange={(e) => tools.setRange(e.target.value, filters.to)} />
              </label>
              <ArrowRight size={14} className="adt-range-arrow" />
              <label className="adt-range-part">
                <span>To</span>
                <input type="date" value={filters.to} min={filters.from || undefined} onChange={(e) => tools.setRange(filters.from, e.target.value)} />
              </label>
            </div>
          )}

          {show.date && tools.dateKeys.length > 1 && (
            <label className="adt-field adt-select">
              <span className="adt-field-tag">Date by</span>
              <select value={filters.dateKey} onChange={(e) => tools.update({ dateKey: e.target.value })}>
                {tools.dateKeys.map((k) => (
                  <option key={k} value={k}>
                    {tools.dateKeyLabel(k)}
                  </option>
                ))}
              </select>
            </label>
          )}

          {show.phone && (
            <label className="adt-field">
              <Phone size={15} />
              <input
                type="tel"
                inputMode="tel"
                placeholder="Phone number"
                value={filters.phone}
                onChange={(e) => tools.update({ phone: e.target.value })}
              />
              {filters.phone && (
                <button type="button" className="adt-clear" onClick={() => tools.update({ phone: '' })} aria-label="Clear phone">
                  <X size={13} />
                </button>
              )}
            </label>
          )}

          {show.order && (
            <label className="adt-field">
              <Hash size={15} />
              <input
                type="text"
                placeholder="Order ID"
                value={filters.orderId}
                onChange={(e) => tools.update({ orderId: e.target.value })}
              />
              {filters.orderId && (
                <button type="button" className="adt-clear" onClick={() => tools.update({ orderId: '' })} aria-label="Clear order id">
                  <X size={13} />
                </button>
              )}
            </label>
          )}

          {show.search && (
            <label className="adt-field adt-grow">
              <Search size={15} />
              <input
                type="search"
                placeholder="Search anything…"
                value={filters.search}
                onChange={(e) => tools.update({ search: e.target.value })}
              />
            </label>
          )}

          {children}
        </div>

        {/* ── Active chips ── */}
        <AnimatePresence initial={false}>
          {chips.length > 0 && (
            <motion.div
              className="adt-chips"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              {chips.map((c) => (
                <motion.span key={c.label} className="adt-chip" layout initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                  {c.label}
                  <button type="button" onClick={c.clear} aria-label={`Remove ${c.label}`}>
                    <X size={12} />
                  </button>
                </motion.span>
              ))}
              <button type="button" className="adt-clear-all" onClick={tools.reset}>
                Clear all
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {tools.message && (
          <motion.div className="adt-toast" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
            {tools.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Import preview ── */}
      <AnimatePresence>
        {tools.preview && (
          <motion.div className="adt-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={tools.closePreview}>
            <motion.div
              className="adt-modal"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="adt-modal-head">
                <div>
                  <h3>Import into {tools.title}</h3>
                  <p>
                    {tools.preview.fileName} · {tools.preview.rows.length} row(s) found
                  </p>
                </div>
                <button type="button" className="adt-icon-btn" onClick={tools.closePreview} aria-label="Close">
                  <X size={16} />
                </button>
              </div>

              <div className="adt-preview">
                <table>
                  <thead>
                    <tr>
                      {Object.keys(tools.preview.rows[0] || {})
                        .slice(0, 8)
                        .map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tools.preview.rows.slice(0, 6).map((r, i) => (
                      <tr key={i}>
                        {Object.keys(tools.preview!.rows[0] || {})
                          .slice(0, 8)
                          .map((h) => (
                            <td key={h}>{String(r[h] ?? '')}</td>
                          ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {tools.preview.rows.length > 6 && <small>…and {tools.preview.rows.length - 6} more row(s)</small>}
              </div>

              {tools.importResult && (
                <div className={`adt-result ${tools.importResult.failed ? 'has-errors' : ''}`}>
                  {tools.importResult.failed ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
                  <div>
                    <strong>
                      {tools.importResult.ok} imported
                      {tools.importResult.failed ? ` · ${tools.importResult.failed} failed` : ''}
                    </strong>
                    {tools.importResult.errors?.map((e) => (
                      <span key={e}>{e}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="adt-modal-foot">
                <button type="button" className="adt-btn" onClick={tools.downloadTemplate}>
                  <Download size={15} /> Template
                </button>
                <div className="adt-spacer" />
                <button type="button" className="adt-btn" onClick={tools.closePreview}>
                  {tools.importResult ? 'Close' : 'Cancel'}
                </button>
                {!tools.importResult && (
                  <button type="button" className="adt-btn adt-btn-solid" onClick={tools.confirmImport} disabled={tools.importing}>
                    {tools.importing ? 'Importing…' : `Import ${tools.preview.rows.length} row(s)`}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDataToolbar;