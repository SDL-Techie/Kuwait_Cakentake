import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, CreditCard, Building2, Zap, Truck, Users, Tag,
  Bell, FileText, ShoppingBag, MapPin, Search, Plus, Edit2, Trash2,
  X, CheckCircle2, XCircle, AlertCircle, RefreshCw, ChevronDown,
  ChevronLeft, ChevronRight, ToggleLeft, ToggleRight, Eye,
  TrendingUp, TrendingDown, Minus, Check, Receipt, Wallet, Bike,
} from 'lucide-react';
import './Finance.css';

import {
  // Expenses
  getExpenses, createExpense, updateExpense, deleteExpense, getExpenseDashboard,
  Expense, CreateExpensePayload,
  // Cash Drawer
  getCashDrawerBalance, addCash, cashDeposit, cashWithdraw,
  getCashDrawerTransactions, getCashDrawerDashboard,
  CashDrawerTransaction,
  // Bank
  getBankBalance, getBankStatement, bankDeposit, bankWithdraw, getBankDashboard,
  BankTransaction,
  // Bank Charges
  getBankCharges, createBankCharge, updateBankCharge, deleteBankCharge,
  BankCharge, CreateBankChargePayload,
  // Notifications
  getNotifications, sendNotification, markNotificationRead,
  Notification, CreateNotificationPayload,
  // Audit Logs
  getAuditLogs, AuditLog,
  // Partners
  getPartners, createPartner, updatePartner, deletePartner,
  Partner, CreatePartnerPayload, UpdatePartnerPayload,
  // Brands
  getBrands, createBrand, updateBrand, deleteBrand,
  Brand, CreateBrandPayload,
  // Driver Settlements
  getDriverSettlements, payDriverSettlement,
  DriverSettlement, PaySettlementPayload,
  // Custom Orders
  getCustomOrders, updateCustomOrder, approveCustomOrder, rejectCustomOrder,
  CustomOrder, UpdateCustomOrderPayload,
  // Order Sources
  getOrderSources, createOrderSource, updateOrderSource, deleteOrderSource,
  OrderSource, CreateOrderSourcePayload,
  // Finance Orders (COD / UPI) + Finance Driver Settlements (delivery fee ledger)
  getFinanceOrders, FinanceOrder,
  getFinanceDriverSettlements, FinanceDriverSettlement,
} from '../../services/financeService';

/* ══════════════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════════════ */
type FinanceTab =
  | 'financeOrders' | 'expenses' | 'cashDrawer' | 'bank' | 'bankCharges'
  | 'driverSettlements' | 'partners' | 'brands'
  | 'notifications' | 'auditLogs' | 'customOrders' | 'orderSources';

interface ToastItem { id: number; message: string; type: 'success' | 'error' | 'info'; }
let _tid = 0;

/* ══════════════════════════════════════════════════════════════
   SHARED UI PRIMITIVES
══════════════════════════════════════════════════════════════ */

/* ── Toast ── */
const ToastStack: React.FC<{ toasts: ToastItem[]; onRemove: (id: number) => void }> = ({ toasts, onRemove }) => (
  <div className="fm-toast-stack">
    <AnimatePresence>
      {toasts.map(t => (
        <motion.div
          key={t.id}
          className={`fm-toast fm-toast-${t.type}`}
          initial={{ opacity: 0, y: -10, scale: .96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: .96 }}
        >
          {t.type === 'success' ? <CheckCircle2 size={14} /> : t.type === 'error' ? <XCircle size={14} /> : <AlertCircle size={14} />}
          <span>{t.message}</span>
          <button onClick={() => onRemove(t.id)}><X size={12} /></button>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

/* ── Confirm ── */
const ConfirmDialog: React.FC<{ isOpen: boolean; message: string; onConfirm: () => void; onCancel: () => void; }> = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fm-confirm-overlay" onClick={onCancel}>
      <div className="fm-confirm-box" onClick={e => e.stopPropagation()}>
        <div className="fm-confirm-icon"><AlertCircle size={28} /></div>
        <p className="fm-confirm-msg">{message}</p>
        <div className="fm-confirm-actions">
          <button className="fm-btn fm-btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="fm-btn fm-btn-danger" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
};

/* ── Modal ── */
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; size?: 'sm' | 'md' | 'lg'; children: React.ReactNode; }> = ({ isOpen, onClose, title, size = 'md', children }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);
  if (!isOpen) return null;
  return (
    <div className="fm-modal-overlay" onClick={onClose}>
      <div className={`fm-modal fm-modal-${size}`} onClick={e => e.stopPropagation()}>
        <div className="fm-modal-header">
          <h3 className="fm-modal-title">{title}</h3>
          <button className="fm-modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="fm-modal-body">{children}</div>
      </div>
    </div>
  );
};

/* ── Field ── */
const Field: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({ label, required, children }) => (
  <div className="fm-field">
    <label className="fm-label">{label}{required && <span className="fm-required">*</span>}</label>
    {children}
  </div>
);

/* ── Row2 ── */
const Row2: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="fm-field-row">{children}</div>
);

/* ── Checkbox ── */
const Checkbox: React.FC<{ id: string; checked: boolean; onChange: (v: boolean) => void; label: string }> = ({ id, checked, onChange, label }) => (
  <div className="fm-checkbox-row">
    <label htmlFor={id} className={`fm-toggle ${checked ? 'fm-toggle-on' : ''}`} onClick={() => onChange(!checked)}>
      {checked ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
    </label>
    <label htmlFor={id} className="fm-toggle-label" onClick={() => onChange(!checked)}>{label}</label>
  </div>
);

/* ── Empty State ── */
const EmptyState: React.FC<{ icon: React.ReactNode; title: string; sub: string; action?: { label: string; onClick: () => void } }> = ({ icon, title, sub, action }) => (
  <div className="fm-empty">
    <div className="fm-empty-icon">{icon}</div>
    <p className="fm-empty-title">{title}</p>
    <p className="fm-empty-sub">{sub}</p>
    {action && <button className="fm-btn fm-btn-primary" onClick={action.onClick}><Plus size={14} />{action.label}</button>}
  </div>
);

/* ── Loading ── */
const Loading: React.FC = () => (
  <div className="fm-loading"><div className="fm-spinner" /><span>Loading…</span></div>
);

/* ── Stat Card ── */
const StatCard: React.FC<{ label: string; value: string | number; sub?: string; icon: React.ReactNode; variant?: 'primary' | 'success' | 'warn' | 'info' | 'danger' }> = ({ label, value, sub, icon, variant = 'primary' }) => (
  <motion.div className="fm-stat-card" whileHover={{ y: -2 }}>
    <div className={`fm-stat-icon fm-stat-${variant}`}>{icon}</div>
    <p className="fm-stat-label">{label}</p>
    <p className="fm-stat-value">{value}</p>
    {sub && <p className="fm-stat-sub">{sub}</p>}
  </motion.div>
);

/* ── Pagination ── */
function usePagination<T>(data: T[], pageSize = 10) {
  const [page, setPage] = useState(1);
  const total = Math.ceil(data.length / pageSize) || 1;
  const slice = data.slice((page - 1) * pageSize, page * pageSize);
  const reset = useCallback(() => setPage(1), []);
  return { page, setPage, total, slice, reset };
}

const Pager: React.FC<{ page: number; total: number; onPage: (p: number) => void; count: number }> = ({ page, total, onPage, count }) => {
  if (total <= 1) return null;
  return (
    <div className="fm-pagination">
      <span>Showing page {page} of {total} ({count} records)</span>
      <div className="fm-page-btns">
        <button className="fm-page-btn" disabled={page === 1} onClick={() => onPage(page - 1)}><ChevronLeft size={14} /></button>
        {Array.from({ length: Math.min(total, 5) }, (_, i) => {
          const n = Math.max(1, Math.min(page - 2, total - 4)) + i;
          return (
            <button key={n} className={`fm-page-btn ${page === n ? 'fm-page-btn-active' : ''}`} onClick={() => onPage(n)}>{n}</button>
          );
        })}
        <button className="fm-page-btn" disabled={page === total} onClick={() => onPage(page + 1)}><ChevronRight size={14} /></button>
      </div>
    </div>
  );
};

/* ── Toolbar ── */
const Toolbar: React.FC<{ search: string; onSearch: (v: string) => void; onAdd?: () => void; addLabel?: string; children?: React.ReactNode }> = ({ search, onSearch, onAdd, addLabel = 'Add', children }) => (
  <div className="fm-toolbar">
    <div className="fm-search-wrap">
      <Search size={14} className="fm-search-icon" />
      <input className="fm-search" placeholder="Search…" value={search} onChange={e => onSearch(e.target.value)} />
      {search && <button className="fm-search-clear" onClick={() => onSearch('')}><X size={12} /></button>}
    </div>
    <div className="fm-toolbar-right">
      {children}
      {onAdd && (
        <button className="fm-btn fm-btn-primary" onClick={onAdd}><Plus size={14} />{addLabel}</button>
      )}
    </div>
  </div>
);

/* ── fmt money ── */
const fmt = (n: number, cur = 'INR') => {
  try { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: cur, maximumFractionDigits: 2 }).format(n || 0); }
  catch { return `₹${(n || 0).toFixed(2)}`; }
};
const fmtDate = (s: string) => s ? new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtDateTime = (s: string) => s ? new Date(s).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

/* ══════════════════════════════════════════════════════════════
   TAB SECTIONS
══════════════════════════════════════════════════════════════ */

/* ─────────────────── FINANCE ORDERS (COD / UPI) ─────────────────── */
/**
 * Pulls every order from /finance/orders and narrows the view to orders
 * that are PAID + DELIVERED — the point at which money has actually
 * settled into either the cash drawer (COD) or the bank (UPI) on the
 * backend. This tab is a read-only ledger of that settled revenue,
 * split by payment method, with a click-to-filter chip row.
 */
const FinanceOrdersTab: React.FC<{ showToast: (m: string, t?: 'success' | 'error' | 'info') => void }> = ({ showToast }) => {
  const [list, setList]         = useState<FinanceOrder[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [methodFilter, setMethodFilter] = useState<'all' | 'COD' | 'UPI'>('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFinanceOrders();
      setList(data ?? []);
    } catch { showToast('Failed to load orders', 'error'); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  // Only orders that are fully paid AND delivered count as settled revenue.
  const settled = useMemo(() => list.filter(o =>
    (o.payment_status || '').toUpperCase() === 'PAID' &&
    (o.status || '').toUpperCase() === 'DELIVERED'
  ), [list]);

  const codOrders = useMemo(() => settled.filter(o => (o.payment_method || '').toUpperCase() === 'COD'), [settled]);
  const upiOrders = useMemo(() => settled.filter(o => (o.payment_method || '').toUpperCase() === 'UPI'), [settled]);

  const totalAmount = useMemo(() => settled.reduce((s, o) => s + (o.amount || 0), 0), [settled]);
  const codAmount   = useMemo(() => codOrders.reduce((s, o) => s + (o.amount || 0), 0), [codOrders]);
  const upiAmount   = useMemo(() => upiOrders.reduce((s, o) => s + (o.amount || 0), 0), [upiOrders]);

  const byMethod = useMemo(() => {
    if (methodFilter === 'COD') return codOrders;
    if (methodFilter === 'UPI') return upiOrders;
    return settled;
  }, [methodFilter, codOrders, upiOrders, settled]);

  const filtered = useMemo(() => {
    if (!search) return byMethod;
    return byMethod.filter(o => (String(o.order_id) + o.customer).toLowerCase().includes(search.toLowerCase()));
  }, [byMethod, search]);

  const { page, setPage, total, slice } = usePagination(filtered);

  return (
    <div className="fm-tab-pane">
      <div className="fm-stats-grid">
        <StatCard
          label="Total Settled (COD + UPI)"
          value={fmt(totalAmount)}
          sub={`${settled.length} paid & delivered orders`}
          icon={<Receipt size={18} />}
          variant="primary"
        />
        <StatCard
          label="Cash on Delivery"
          value={fmt(codAmount)}
          sub={`${codOrders.length} orders → Cash Drawer`}
          icon={<Wallet size={18} />}
          variant="success"
        />
        <StatCard
          label="UPI Payments"
          value={fmt(upiAmount)}
          sub={`${upiOrders.length} orders → Bank`}
          icon={<Building2 size={18} />}
          variant="info"
        />
      </div>

      <div className="fm-chips">
        <button className={`fm-chip ${methodFilter === 'all' ? 'fm-chip-active' : ''}`} onClick={() => { setMethodFilter('all'); setPage(1); }}>
          All ({settled.length})
        </button>
        <button className={`fm-chip ${methodFilter === 'COD' ? 'fm-chip-active' : ''}`} onClick={() => { setMethodFilter('COD'); setPage(1); }}>
          COD ({codOrders.length})
        </button>
        <button className={`fm-chip ${methodFilter === 'UPI' ? 'fm-chip-active' : ''}`} onClick={() => { setMethodFilter('UPI'); setPage(1); }}>
          UPI ({upiOrders.length})
        </button>
      </div>

      <Toolbar search={search} onSearch={v => { setSearch(v); setPage(1); }}>
        <button className="fm-btn fm-btn-ghost fm-btn-icon" onClick={load} title="Refresh"><RefreshCw size={14} className={loading ? 'fm-spin' : ''} /></button>
      </Toolbar>

      {loading ? <Loading /> : filtered.length === 0 ? (
        <EmptyState icon={<Receipt size={28} />} title="No settled orders found" sub="Paid & delivered COD/UPI orders will show up here." />
      ) : (
        <div className="fm-table-wrap">
          <table className="fm-table">
            <thead><tr>
              <th>Order #</th><th>Customer</th><th>Payment</th>
              <th>Amount</th><th>Delivery Fee</th><th>Date</th>
            </tr></thead>
            <tbody>
              {slice.map(o => (
                <motion.tr key={o.order_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td><span className="fm-status-badge fm-badge-primary">{String(o.order_id)}</span></td>
                  <td><div className="fm-cell-name">{o.customer}</div></td>
                  <td>
                    <span className={`fm-status-badge ${(o.payment_method || '').toUpperCase() === 'COD' ? 'fm-badge-cod' : 'fm-badge-upi'}`}>
                      {o.payment_method}
                    </span>
                  </td>
                  <td><span className="fm-amount-positive">{fmt(o.amount)}</span></td>
                  <td><span className="fm-cell-muted">{fmt(0)}</span></td>
                  <td><span className="fm-cell-muted">{fmtDate(o.created_at)}</span></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          <Pager page={page} total={total} onPage={setPage} count={filtered.length} />
        </div>
      )}
    </div>
  );
};

/* ─────────────────── EXPENSES ─────────────────── */
const ExpensesTab: React.FC<{ showToast: (m: string, t?: 'success' | 'error' | 'info') => void }> = ({ showToast }) => {
  const [list, setList]       = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [saving, setSaving]   = useState(false);
  const [confirm, setConfirm] = useState<{ open: boolean; id: number }>({ open: false, id: 0 });
  const [dash, setDash]       = useState<any>(null);

  // form
  const [fCat, setFCat]   = useState('');
  const [fDesc, setFDesc] = useState('');
  const [fAmt, setFAmt]   = useState('');
  const [fSrc, setFSrc]   = useState<'CASH' | 'BANK'>('CASH');
  const [fRef, setFRef]   = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [data, d] = await Promise.all([getExpenses(), getExpenseDashboard().catch(() => null)]);
      setList(data ?? []);
      setDash(d);
    } catch { showToast('Failed to load expenses', 'error'); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const categories = useMemo(() => ['all', ...Array.from(new Set(list.map(e => e.category)))], [list]);
  const filtered = useMemo(() => {
    let r = list;
    if (catFilter !== 'all') r = r.filter(e => e.category === catFilter);
    if (search) r = r.filter(e => (e.category + e.description + e.reference).toLowerCase().includes(search.toLowerCase()));
    return r;
  }, [list, search, catFilter]);

  const { page, setPage, total, slice } = usePagination(filtered);

  const openAdd = () => { setEditing(null); setFCat(''); setFDesc(''); setFAmt(''); setFSrc('CASH'); setFRef(''); setModal(true); };
  const openEdit = (e: Expense) => { setEditing(e); setFCat(e.category); setFDesc(e.description ?? ''); setFAmt(String(e.amount)); setFSrc(e.payment_source); setFRef(e.reference ?? ''); setModal(true); };

  const save = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSaving(true);
    try {
      const payload: CreateExpensePayload = { category: fCat, description: fDesc || undefined, amount: Number(fAmt), payment_source: fSrc, reference: fRef || undefined };
      if (editing) await updateExpense(editing.id, payload);
      else await createExpense(payload);
      showToast(editing ? 'Expense updated' : 'Expense added');
      setModal(false); load();
    } catch { showToast('Failed to save expense', 'error'); }
    finally { setSaving(false); }
  };

  const del = async () => {
    try { await deleteExpense(confirm.id); showToast('Expense deleted'); load(); }
    catch { showToast('Failed to delete', 'error'); }
    finally { setConfirm({ open: false, id: 0 }); }
  };

  return (
    <div className="fm-tab-pane">
      {dash && (
        <div className="fm-stats-grid">
          <StatCard label="Total Expenses" value={fmt(dash.total_amount)} icon={<DollarSign size={18} />} variant="danger" />
          <StatCard label="Today" value={fmt(dash.today_total)} icon={<TrendingUp size={18} />} variant="warn" />
          <StatCard label="This Month" value={fmt(dash.month_total)} icon={<TrendingDown size={18} />} variant="info" />
          <StatCard label="Total Records" value={dash.total_count ?? list.length} icon={<FileText size={18} />} variant="primary" />
        </div>
      )}

      <div className="fm-chips">
        {categories.map(c => (
          <button key={c} className={`fm-chip ${catFilter === c ? 'fm-chip-active' : ''}`} onClick={() => { setCatFilter(c); setPage(1); }}>
            {c === 'all' ? 'All Categories' : c}
          </button>
        ))}
      </div>

      <Toolbar search={search} onSearch={v => { setSearch(v); setPage(1); }} onAdd={openAdd} addLabel="Add Expense">
        <button className="fm-btn fm-btn-ghost fm-btn-icon" onClick={load} title="Refresh"><RefreshCw size={14} className={loading ? 'fm-spin' : ''} /></button>
      </Toolbar>

      {loading ? <Loading /> : filtered.length === 0 ? (
        <EmptyState icon={<DollarSign size={28} />} title="No expenses found" sub="Record your first expense to get started." action={{ label: 'Add Expense', onClick: openAdd }} />
      ) : (
        <div className="fm-table-wrap">
          <table className="fm-table">
            <thead><tr>
              <th>Category</th><th>Description</th><th>Amount</th>
              <th>Source</th><th>Reference</th><th>Date</th>
              <th className="fm-th-right">Actions</th>
            </tr></thead>
            <tbody>
              {slice.map(e => (
                <motion.tr key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td><span className="fm-status-badge fm-badge-primary">{e.category}</span></td>
                  <td><div className="fm-cell-name">{e.description || '—'}</div></td>
                  <td><span className="fm-amount-negative">{fmt(e.amount)}</span></td>
                  <td><span className={`fm-status-badge ${e.payment_source === 'CASH' ? 'fm-badge-success' : 'fm-badge-info'}`}>{e.payment_source}</span></td>
                  <td><span className="fm-cell-muted">{e.reference || '—'}</span></td>
                  <td><span className="fm-cell-muted">{fmtDate(e.expense_date)}</span></td>
                  <td className="fm-td-right">
                    <div className="fm-row-actions">
                      <button className="fm-action-btn" onClick={() => openEdit(e)} title="Edit"><Edit2 size={13} /></button>
                      <button className="fm-action-btn fm-action-danger" onClick={() => setConfirm({ open: true, id: e.id })} title="Delete"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          <Pager page={page} total={total} onPage={setPage} count={filtered.length} />
        </div>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Expense' : 'Add Expense'} size="sm">
        <form className="fm-form" onSubmit={save}>
          <Row2>
            <Field label="Category" required>
              <input className="fm-input" placeholder="e.g. Rent, Utilities" value={fCat} onChange={e => setFCat(e.target.value)} required />
            </Field>
            <Field label="Amount (₹)" required>
              <input className="fm-input" type="number" min="0" step="0.01" value={fAmt} onChange={e => setFAmt(e.target.value)} required />
            </Field>
          </Row2>
          <Field label="Description">
            <textarea className="fm-input fm-textarea" rows={2} value={fDesc} onChange={e => setFDesc(e.target.value)} />
          </Field>
          <Row2>
            <Field label="Payment Source" required>
              <div className="fm-select-wrap">
                <select className="fm-select" value={fSrc} onChange={e => setFSrc(e.target.value as any)}>
                  <option value="CASH">Cash</option>
                  <option value="BANK">Bank</option>
                </select>
                <ChevronDown size={13} className="fm-select-arrow" />
              </div>
            </Field>
            <Field label="Reference">
              <input className="fm-input" placeholder="Invoice / ref no." value={fRef} onChange={e => setFRef(e.target.value)} />
            </Field>
          </Row2>
          <div className="fm-form-footer">
            <button type="button" className="fm-btn fm-btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="fm-btn fm-btn-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Update' : 'Add Expense'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={confirm.open} message="Delete this expense record? This cannot be undone." onConfirm={del} onCancel={() => setConfirm({ open: false, id: 0 })} />
    </div>
  );
};

/* ─────────────────── CASH DRAWER ─────────────────── */
const CashDrawerTab: React.FC<{ showToast: (m: string, t?: 'success' | 'error' | 'info') => void }> = ({ showToast }) => {
  const [txns, setTxns]         = useState<CashDrawerTransaction[]>([]);
  const [balance, setBalance]   = useState<number>(0);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [modal, setModal]       = useState<'add' | 'deposit' | 'withdraw' | null>(null);
  const [saving, setSaving]     = useState(false);
  const [fAmt, setFAmt]         = useState('');
  const [fNote, setFNote]       = useState('');
  const [dash, setDash]         = useState<any>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [b, t, d] = await Promise.all([getCashDrawerBalance(), getCashDrawerTransactions(), getCashDrawerDashboard().catch(() => null)]);
      setBalance(b ?? 0); setTxns(t ?? []); setDash(d);
    } catch { showToast('Failed to load cash drawer', 'error'); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (!search) return txns;
    return txns.filter(t => (t.notes + t.reference + t.transaction_type).toLowerCase().includes(search.toLowerCase()));
  }, [txns, search]);

  const { page, setPage, total, slice } = usePagination(filtered);

  const save = async (ev: React.FormEvent) => {
    ev.preventDefault(); setSaving(true);
    try {
      const p = { amount: Number(fAmt), notes: fNote || undefined };
      if (modal === 'add') await addCash(p);
      else if (modal === 'deposit') await cashDeposit(p);
      else if (modal === 'withdraw') await cashWithdraw(p);
      showToast('Transaction recorded');
      setModal(null); setFAmt(''); setFNote(''); load();
    } catch (e: any) { showToast(e?.response?.data?.error || 'Failed', 'error'); }
    finally { setSaving(false); }
  };

  const txColor = (type: string) => {
    if (type === 'ADD' || type === 'DEPOSIT') return 'fm-amount-positive';
    return 'fm-amount-negative';
  };

  return (
    <div className="fm-tab-pane">
      <div className="fm-stats-grid">
        <StatCard label="Current Balance" value={fmt(balance)} icon={<DollarSign size={18} />} variant="success" />
        {dash && <>
          <StatCard label="Today In" value={fmt(dash.today?.in)} icon={<TrendingUp size={18} />} variant="success" />
          <StatCard label="Today Out" value={fmt(dash.today?.out)} icon={<TrendingDown size={18} />} variant="danger" />
          <StatCard label="Net Today" value={fmt(dash.today?.net)} icon={<Minus size={18} />} variant="info" />
        </>}
      </div>

      <Toolbar search={search} onSearch={v => { setSearch(v); setPage(1); }}>
        <button className="fm-btn fm-btn-ghost fm-btn-icon" onClick={load}><RefreshCw size={14} className={loading ? 'fm-spin' : ''} /></button>
        <button className="fm-btn fm-btn-ghost" onClick={() => { setFAmt(''); setFNote(''); setModal('add'); }}><Plus size={14} />Add Cash</button>
        <button className="fm-btn fm-btn-ghost" onClick={() => { setFAmt(''); setFNote(''); setModal('deposit'); }}><TrendingUp size={14} />Deposit</button>
        <button className="fm-btn fm-btn-primary" onClick={() => { setFAmt(''); setFNote(''); setModal('withdraw'); }}><TrendingDown size={14} />Withdraw</button>
      </Toolbar>

      {loading ? <Loading /> : filtered.length === 0 ? (
        <EmptyState icon={<DollarSign size={28} />} title="No transactions" sub="Record cash drawer movements above." />
      ) : (
        <div className="fm-table-wrap">
          <table className="fm-table">
            <thead><tr>
              <th>Type</th><th>Amount</th><th>Balance After</th>
              <th>Notes</th><th>Reference</th><th>Date</th>
            </tr></thead>
            <tbody>
              {slice.map(t => (
                <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td><span className={`fm-status-badge ${t.transaction_type === 'WITHDRAW' ? 'fm-badge-inactive' : 'fm-badge-success'}`}>{t.transaction_type}</span></td>
                  <td><span className={txColor(t.transaction_type)}>{fmt(t.amount)}</span></td>
                  <td><span className="fm-amount-neutral">{fmt(t.balance_after)}</span></td>
                  <td><span className="fm-cell-muted">{t.notes || '—'}</span></td>
                  <td><span className="fm-cell-muted">{t.reference || '—'}</span></td>
                  <td><span className="fm-cell-muted">{fmtDateTime(t.created_at)}</span></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          <Pager page={page} total={total} onPage={setPage} count={filtered.length} />
        </div>
      )}

      <Modal isOpen={!!modal} onClose={() => setModal(null)} title={modal === 'add' ? 'Add Cash' : modal === 'deposit' ? 'Cash Deposit' : 'Cash Withdraw'} size="sm">
        <form className="fm-form" onSubmit={save}>
          <Field label="Amount (₹)" required>
            <input className="fm-input" type="number" min="0.01" step="0.01" value={fAmt} onChange={e => setFAmt(e.target.value)} required autoFocus />
          </Field>
          <Field label="Notes">
            <textarea className="fm-input fm-textarea" rows={2} value={fNote} onChange={e => setFNote(e.target.value)} />
          </Field>
          <div className="fm-form-footer">
            <button type="button" className="fm-btn fm-btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            <button type="submit" className="fm-btn fm-btn-primary" disabled={saving}>{saving ? 'Processing…' : 'Confirm'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

/* ─────────────────── BANK ─────────────────── */
const BankTab: React.FC<{ showToast: (m: string, t?: 'success' | 'error' | 'info') => void }> = ({ showToast }) => {
  const [txns, setTxns]       = useState<BankTransaction[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [modal, setModal]     = useState<'deposit' | 'withdraw' | null>(null);
  const [saving, setSaving]   = useState(false);
  const [fAmt, setFAmt]       = useState('');
  const [fRef, setFRef]       = useState('');
  const [fNote, setFNote]     = useState('');
  const [dash, setDash]       = useState<any>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [b, t, d] = await Promise.all([getBankBalance(), getBankStatement(), getBankDashboard().catch(() => null)]);
      setBalance(b ?? 0); setTxns(t ?? []); setDash(d);
    } catch { showToast('Failed to load bank data', 'error'); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (!search) return txns;
    return txns.filter(t => (t.notes + t.reference + t.transaction_type).toLowerCase().includes(search.toLowerCase()));
  }, [txns, search]);

  const { page, setPage, total, slice } = usePagination(filtered);

  const save = async (ev: React.FormEvent) => {
    ev.preventDefault(); setSaving(true);
    try {
      const p = { amount: Number(fAmt), reference: fRef || undefined, notes: fNote || undefined };
      if (modal === 'deposit') await bankDeposit(p);
      else await bankWithdraw(p);
      showToast('Bank transaction recorded');
      setModal(null); setFAmt(''); setFRef(''); setFNote(''); load();
    } catch (e: any) { showToast(e?.response?.data?.error || 'Failed', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fm-tab-pane">
      <div className="fm-stats-grid">
        <StatCard label="Bank Balance" value={fmt(balance)} icon={<Building2 size={18} />} variant="info" />
        {dash && <>
          <StatCard label="Today Deposits" value={fmt(dash.today?.deposits)} icon={<TrendingUp size={18} />} variant="success" />
          <StatCard label="Today Withdrawals" value={fmt(dash.today?.withdrawals)} icon={<TrendingDown size={18} />} variant="danger" />
          <StatCard label="Pending Reconciliation" value={dash.pending_reconciliation ?? 0} icon={<AlertCircle size={18} />} variant="warn" />
        </>}
      </div>

      <Toolbar search={search} onSearch={v => { setSearch(v); setPage(1); }}>
        <button className="fm-btn fm-btn-ghost fm-btn-icon" onClick={load}><RefreshCw size={14} className={loading ? 'fm-spin' : ''} /></button>
        <button className="fm-btn fm-btn-ghost" onClick={() => { setFAmt(''); setFRef(''); setFNote(''); setModal('deposit'); }}><TrendingUp size={14} />Deposit</button>
        <button className="fm-btn fm-btn-primary" onClick={() => { setFAmt(''); setFRef(''); setFNote(''); setModal('withdraw'); }}><TrendingDown size={14} />Withdraw</button>
      </Toolbar>

      {loading ? <Loading /> : filtered.length === 0 ? (
        <EmptyState icon={<Building2 size={28} />} title="No bank transactions" sub="Record deposits or withdrawals above." />
      ) : (
        <div className="fm-table-wrap">
          <table className="fm-table">
            <thead><tr>
              <th>Type</th><th>Amount</th><th>Balance After</th>
              <th>Reference</th><th>Notes</th><th>Reconciled</th><th>Date</th>
            </tr></thead>
            <tbody>
              {slice.map(t => (
                <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td><span className={`fm-status-badge ${t.transaction_type === 'DEPOSIT' ? 'fm-badge-success' : 'fm-badge-inactive'}`}>{t.transaction_type}</span></td>
                  <td><span className={t.transaction_type === 'DEPOSIT' ? 'fm-amount-positive' : 'fm-amount-negative'}>{fmt(t.amount)}</span></td>
                  <td><span className="fm-amount-neutral">{fmt(t.balance_after)}</span></td>
                  <td><span className="fm-cell-muted">{t.reference || '—'}</span></td>
                  <td><span className="fm-cell-muted">{t.notes || '—'}</span></td>
                  <td><span className={`fm-status-badge ${t.is_reconciled ? 'fm-badge-success' : 'fm-badge-pending'}`}>{t.is_reconciled ? 'Yes' : 'Pending'}</span></td>
                  <td><span className="fm-cell-muted">{fmtDateTime(t.created_at)}</span></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          <Pager page={page} total={total} onPage={setPage} count={filtered.length} />
        </div>
      )}

      <Modal isOpen={!!modal} onClose={() => setModal(null)} title={modal === 'deposit' ? 'Bank Deposit' : 'Bank Withdrawal'} size="sm">
        <form className="fm-form" onSubmit={save}>
          <Field label="Amount (₹)" required>
            <input className="fm-input" type="number" min="0.01" step="0.01" value={fAmt} onChange={e => setFAmt(e.target.value)} required autoFocus />
          </Field>
          <Field label="Reference">
            <input className="fm-input" placeholder="UTR / cheque no." value={fRef} onChange={e => setFRef(e.target.value)} />
          </Field>
          <Field label="Notes">
            <textarea className="fm-input fm-textarea" rows={2} value={fNote} onChange={e => setFNote(e.target.value)} />
          </Field>
          <div className="fm-form-footer">
            <button type="button" className="fm-btn fm-btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            <button type="submit" className="fm-btn fm-btn-primary" disabled={saving}>{saving ? 'Processing…' : 'Confirm'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

/* ─────────────────── BANK CHARGES ─────────────────── */
const BankChargesTab: React.FC<{ showToast: (m: string, t?: 'success' | 'error' | 'info') => void }> = ({ showToast }) => {
  const [list, setList]       = useState<BankCharge[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState<BankCharge | null>(null);
  const [saving, setSaving]   = useState(false);
  const [confirm, setConfirm] = useState<{ open: boolean; id: number }>({ open: false, id: 0 });
  const [fTitle, setFTitle]   = useState('');
  const [fType, setFType]     = useState<CreateBankChargePayload['charge_type']>('SERVICE_FEE');
  const [fAmt, setFAmt]       = useState('');
  const [fDesc, setFDesc]     = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { setList(await getBankCharges() ?? []); }
    catch { showToast('Failed to load bank charges', 'error'); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (!search) return list;
    return list.filter(c => (c.title + c.description + c.charge_type).toLowerCase().includes(search.toLowerCase()));
  }, [list, search]);

  const { page, setPage, total, slice } = usePagination(filtered);

  const openAdd = () => { setEditing(null); setFTitle(''); setFType('SERVICE_FEE'); setFAmt(''); setFDesc(''); setModal(true); };
  const openEdit = (c: BankCharge) => { setEditing(c); setFTitle(c.title); setFType(c.charge_type); setFAmt(String(c.amount)); setFDesc(c.description ?? ''); setModal(true); };

  const save = async (ev: React.FormEvent) => {
    ev.preventDefault(); setSaving(true);
    try {
      const p: CreateBankChargePayload = { title: fTitle, charge_type: fType, amount: Number(fAmt), description: fDesc || undefined };
      if (editing) await updateBankCharge(editing.id, p);
      else await createBankCharge(p);
      showToast(editing ? 'Updated' : 'Bank charge added');
      setModal(false); load();
    } catch { showToast('Failed to save', 'error'); }
    finally { setSaving(false); }
  };

  const del = async () => {
    try { await deleteBankCharge(confirm.id); showToast('Deleted'); load(); }
    catch { showToast('Failed to delete', 'error'); }
    finally { setConfirm({ open: false, id: 0 }); }
  };

  const totalCharges = list.reduce((s, c) => s + c.amount, 0);

  return (
    <div className="fm-tab-pane">
      <div className="fm-stats-grid">
        <StatCard label="Total Charges" value={fmt(totalCharges)} icon={<Zap size={18} />} variant="danger" />
        <StatCard label="Total Records" value={list.length} icon={<FileText size={18} />} variant="primary" />
      </div>
      <Toolbar search={search} onSearch={v => { setSearch(v); setPage(1); }} onAdd={openAdd} addLabel="Add Charge">
        <button className="fm-btn fm-btn-ghost fm-btn-icon" onClick={load}><RefreshCw size={14} className={loading ? 'fm-spin' : ''} /></button>
      </Toolbar>
      {loading ? <Loading /> : filtered.length === 0 ? (
        <EmptyState icon={<Zap size={28} />} title="No bank charges" sub="Log bank fees and penalties here." action={{ label: 'Add Charge', onClick: openAdd }} />
      ) : (
        <div className="fm-table-wrap">
          <table className="fm-table">
            <thead><tr>
              <th>Title</th><th>Type</th><th>Amount</th><th>Description</th><th>Date</th><th className="fm-th-right">Actions</th>
            </tr></thead>
            <tbody>
              {slice.map(c => (
                <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td><div className="fm-cell-name">{c.title}</div></td>
                  <td><span className="fm-status-badge fm-badge-info">{c.charge_type.replace('_', ' ')}</span></td>
                  <td><span className="fm-amount-negative">{fmt(c.amount)}</span></td>
                  <td><span className="fm-cell-muted">{c.description || '—'}</span></td>
                  <td><span className="fm-cell-muted">{fmtDate(c.charged_on)}</span></td>
                  <td className="fm-td-right">
                    <div className="fm-row-actions">
                      <button className="fm-action-btn" onClick={() => openEdit(c)}><Edit2 size={13} /></button>
                      <button className="fm-action-btn fm-action-danger" onClick={() => setConfirm({ open: true, id: c.id })}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          <Pager page={page} total={total} onPage={setPage} count={filtered.length} />
        </div>
      )}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Charge' : 'Add Bank Charge'} size="sm">
        <form className="fm-form" onSubmit={save}>
          <Field label="Title" required><input className="fm-input" value={fTitle} onChange={e => setFTitle(e.target.value)} required /></Field>
          <Row2>
            <Field label="Type" required>
              <div className="fm-select-wrap">
                <select className="fm-select" value={fType} onChange={e => setFType(e.target.value as any)}>
                  <option value="SERVICE_FEE">Service Fee</option>
                  <option value="TRANSACTION_FEE">Transaction Fee</option>
                  <option value="PENALTY">Penalty</option>
                  <option value="OTHER">Other</option>
                </select>
                <ChevronDown size={13} className="fm-select-arrow" />
              </div>
            </Field>
            <Field label="Amount (₹)" required><input className="fm-input" type="number" min="0" step="0.01" value={fAmt} onChange={e => setFAmt(e.target.value)} required /></Field>
          </Row2>
          <Field label="Description"><textarea className="fm-input fm-textarea" rows={2} value={fDesc} onChange={e => setFDesc(e.target.value)} /></Field>
          <div className="fm-form-footer">
            <button type="button" className="fm-btn fm-btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="fm-btn fm-btn-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Update' : 'Add'}</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={confirm.open} message="Delete this bank charge?" onConfirm={del} onCancel={() => setConfirm({ open: false, id: 0 })} />
    </div>
  );
};

/* ─────────────────── DRIVER SETTLEMENTS ─────────────────── */
/**
 * Two sources feed this tab:
 *  - getFinanceDriverSettlements(): every DELIVERED order with a
 *    delivery_fee, one row per order, tagged with the driver who
 *    delivered it. Grouped client-side into a "what each driver is
 *    owed" ledger.
 *  - getDriverSettlements(): the historical record of settlements
 *    that have actually been paid out (via payDriverSettlement).
 */
const DriverSettlementsTab: React.FC<{ showToast: (m: string, t?: 'success' | 'error' | 'info') => void }> = ({ showToast }) => {
  const [list, setList]           = useState<DriverSettlement[]>([]);
  const [deliveries, setDeliveries] = useState<FinanceDriverSettlement[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [modal, setModal]         = useState(false);
  const [saving, setSaving]       = useState(false);
  const [fDriverId, setFDriverId]   = useState('');
  const [fAmt, setFAmt]             = useState('');
  const [fSrc, setFSrc]             = useState<'CASH' | 'BANK'>('CASH');
  const [fRef, setFRef]             = useState('');
  const [fNote, setFNote]           = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [settlements, finDeliveries] = await Promise.all([
        getDriverSettlements(),
        getFinanceDriverSettlements().catch(() => []),
      ]);
      setList(settlements ?? []);
      setDeliveries(finDeliveries ?? []);
    } catch { showToast('Failed to load settlements', 'error'); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  // Group delivered orders + delivery fees by driver
  const grouped = useMemo(() => {
    const map = new Map<number, { driver_id: number; driver_name: string; orders: FinanceDriverSettlement[]; total: number }>();
    deliveries.forEach(d => {
      if (!map.has(d.driver_id)) map.set(d.driver_id, { driver_id: d.driver_id, driver_name: d.driver_name, orders: [], total: 0 });
      const g = map.get(d.driver_id)!;
      g.orders.push(d);
      g.total += d.delivery_fee || 0;
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [deliveries]);

  const filteredGrouped = useMemo(() => {
    if (!search) return grouped;
    return grouped.filter(g => g.driver_name.toLowerCase().includes(search.toLowerCase()) || String(g.driver_id).includes(search));
  }, [grouped, search]);

  const totalDeliveryFees = useMemo(() => deliveries.reduce((s, d) => s + (d.delivery_fee || 0), 0), [deliveries]);

  const { page, setPage, total, slice } = usePagination(filteredGrouped);

  const openPayFor = (g: { driver_id: number; driver_name: string; orders: FinanceDriverSettlement[]; total: number }) => {
    setFDriverId(String(g.driver_id));
    setFAmt(String(g.total));
    setFSrc('CASH');
    setFRef('');
    setFNote(`Settlement for ${g.orders.length} delivered order(s)`);
    setModal(true);
  };

  const openPayBlank = () => { setFDriverId(''); setFAmt(''); setFSrc('CASH'); setFRef(''); setFNote(''); setModal(true); };

  const save = async (ev: React.FormEvent) => {
    ev.preventDefault(); setSaving(true);
    try {
      const p: PaySettlementPayload = { driver_id: Number(fDriverId), amount: Number(fAmt), payment_source: fSrc, reference: fRef || undefined, notes: fNote || undefined };
      await payDriverSettlement(p);
      showToast('Settlement paid'); setModal(false); load();
    } catch (e: any) { showToast(e?.response?.data?.error || 'Failed', 'error'); }
    finally { setSaving(false); }
  };

  const totalPaid = list.filter(s => s.status === 'PAID').reduce((s, x) => s + x.amount, 0);
  const totalPending = list.filter(s => s.status === 'PENDING').reduce((s, x) => s + x.amount, 0);

  return (
    <div className="fm-tab-pane">
      <div className="fm-stats-grid">
        <StatCard label="Delivered Orders" value={deliveries.length} sub={`${grouped.length} drivers`} icon={<Bike size={18} />} variant="primary" />
        <StatCard label="Total Delivery Fees" value={fmt(totalDeliveryFees)} icon={<Truck size={18} />} variant="warn" />
        <StatCard label="Total Paid Out" value={fmt(totalPaid)} icon={<Check size={18} />} variant="success" />
        <StatCard label="Pending (recorded)" value={fmt(totalPending)} icon={<AlertCircle size={18} />} variant="danger" />
      </div>

      <Toolbar search={search} onSearch={v => { setSearch(v); setPage(1); }} onAdd={openPayBlank} addLabel="Pay Settlement">
        <button className="fm-btn fm-btn-ghost fm-btn-icon" onClick={load}><RefreshCw size={14} className={loading ? 'fm-spin' : ''} /></button>
      </Toolbar>

      {loading ? <Loading /> : filteredGrouped.length === 0 ? (
        <EmptyState icon={<Truck size={28} />} title="No delivered orders yet" sub="Delivery fees from delivered orders will be grouped by driver here." />
      ) : (
        <div className="fm-table-wrap">
          <table className="fm-table">
            <thead><tr>
              <th>Driver</th><th>Delivered Orders</th><th>Delivery Fee Total</th><th className="fm-th-right">Actions</th>
            </tr></thead>
            <tbody>
              {slice.map(g => (
                <motion.tr key={g.driver_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td><div className="fm-cell-name">{g.driver_name || `Driver #${g.driver_id}`}</div></td>
                  <td><span className="fm-status-badge fm-badge-info">{g.orders.length} orders</span></td>
                  <td><span className="fm-amount-positive">{fmt(g.total)}</span></td>
                  <td className="fm-td-right">
                    <div className="fm-row-actions">
                      <button className="fm-btn fm-btn-primary fm-btn-sm" onClick={() => openPayFor(g)}>Pay</button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          <Pager page={page} total={total} onPage={setPage} count={filteredGrouped.length} />
        </div>
      )}

      {/* Settlement payment history */}
      <div className="fm-section-header" style={{ marginTop: 22 }}>
        <span className="fm-section-title">Settlement History</span>
        <span className="fm-section-count">{list.length}</span>
      </div>
      {list.length === 0 ? (
        <EmptyState icon={<FileText size={28} />} title="No settlements paid yet" sub="Paid driver settlements will be listed here." />
      ) : (
        <div className="fm-table-wrap">
          <table className="fm-table">
            <thead><tr>
              <th>Driver ID</th><th>Amount</th><th>Orders</th><th>Source</th><th>Status</th><th>Paid At</th><th>Reference</th>
            </tr></thead>
            <tbody>
              {list.map(s => (
                <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td><span className="fm-status-badge fm-badge-info">Driver #{s.driver_id}</span></td>
                  <td><span className="fm-amount-positive">{fmt(s.amount)}</span></td>
                  <td>{s.orders_count}</td>
                  <td><span className={`fm-status-badge ${s.payment_source === 'CASH' ? 'fm-badge-success' : 'fm-badge-info'}`}>{s.payment_source}</span></td>
                  <td><span className={`fm-status-badge ${s.status === 'PAID' ? 'fm-badge-paid' : 'fm-badge-pending'}`}>{s.status}</span></td>
                  <td><span className="fm-cell-muted">{s.paid_at ? fmtDate(s.paid_at) : '—'}</span></td>
                  <td><span className="fm-cell-muted">{s.reference || '—'}</span></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Pay Driver Settlement" size="sm">
        <form className="fm-form" onSubmit={save}>
          <Row2>
            <Field label="Driver ID" required><input className="fm-input" type="number" value={fDriverId} onChange={e => setFDriverId(e.target.value)} required placeholder="Driver user ID" /></Field>
            <Field label="Amount (₹)" required><input className="fm-input" type="number" min="0.01" step="0.01" value={fAmt} onChange={e => setFAmt(e.target.value)} required /></Field>
          </Row2>
          <Row2>
            <Field label="Payment Source">
              <div className="fm-select-wrap">
                <select className="fm-select" value={fSrc} onChange={e => setFSrc(e.target.value as any)}>
                  <option value="CASH">Cash</option><option value="BANK">Bank</option>
                </select>
                <ChevronDown size={13} className="fm-select-arrow" />
              </div>
            </Field>
            <Field label="Reference"><input className="fm-input" value={fRef} onChange={e => setFRef(e.target.value)} /></Field>
          </Row2>
          <Field label="Notes"><textarea className="fm-input fm-textarea" rows={2} value={fNote} onChange={e => setFNote(e.target.value)} /></Field>
          <div className="fm-form-footer">
            <button type="button" className="fm-btn fm-btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="fm-btn fm-btn-primary" disabled={saving}>{saving ? 'Processing…' : 'Pay'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

/* ─────────────────── PARTNERS ─────────────────── */
const PartnersTab: React.FC<{ showToast: (m: string, t?: 'success' | 'error' | 'info') => void }> = ({ showToast }) => {
  const [list, setList]       = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState<Partner | null>(null);
  const [saving, setSaving]   = useState(false);
  const [confirm, setConfirm] = useState<{ open: boolean; id: number }>({ open: false, id: 0 });
  const [fName, setFName]     = useState('');
  const [fContact, setFContact] = useState('');
  const [fPhone, setFPhone]   = useState('');
  const [fEmail, setFEmail]   = useState('');
  const [fCommission, setFCommission] = useState('0');
  const [fActive, setFActive] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setList(await getPartners() ?? []); }
    catch { showToast('Failed to load partners', 'error'); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (!search) return list;
    return list.filter(p => (p.name + p.contact_name + p.email + p.phone).toLowerCase().includes(search.toLowerCase()));
  }, [list, search]);

  const { page, setPage, total, slice } = usePagination(filtered);

  const openAdd = () => { setEditing(null); setFName(''); setFContact(''); setFPhone(''); setFEmail(''); setFCommission('0'); setFActive(true); setModal(true); };
  const openEdit = (p: Partner) => { setEditing(p); setFName(p.name); setFContact(p.contact_name ?? ''); setFPhone(p.phone ?? ''); setFEmail(p.email ?? ''); setFCommission(String(p.commission_percent)); setFActive(p.is_active); setModal(true); };

  const save = async (ev: React.FormEvent) => {
    ev.preventDefault(); setSaving(true);
    try {
      if (editing) {
        const p: UpdatePartnerPayload = { name: fName, contact_name: fContact || undefined, phone: fPhone || undefined, email: fEmail || undefined, commission_percent: Number(fCommission), is_active: fActive };
        await updatePartner(editing.id, p);
      } else {
        const p: CreatePartnerPayload = { name: fName, contact_name: fContact || undefined, phone: fPhone || undefined, email: fEmail || undefined, commission_percent: Number(fCommission) };
        await createPartner(p);
      }
      showToast(editing ? 'Partner updated' : 'Partner created');
      setModal(false); load();
    } catch { showToast('Failed to save', 'error'); }
    finally { setSaving(false); }
  };

  const del = async () => {
    try { await deletePartner(confirm.id); showToast('Partner deleted'); load(); }
    catch { showToast('Failed to delete', 'error'); }
    finally { setConfirm({ open: false, id: 0 }); }
  };

  return (
    <div className="fm-tab-pane">
      <div className="fm-stats-grid">
        <StatCard label="Total Partners" value={list.length} icon={<Users size={18} />} variant="primary" />
        <StatCard label="Active" value={list.filter(p => p.is_active).length} icon={<CheckCircle2 size={18} />} variant="success" />
      </div>
      <Toolbar search={search} onSearch={v => { setSearch(v); setPage(1); }} onAdd={openAdd} addLabel="Add Partner">
        <button className="fm-btn fm-btn-ghost fm-btn-icon" onClick={load}><RefreshCw size={14} className={loading ? 'fm-spin' : ''} /></button>
      </Toolbar>
      {loading ? <Loading /> : filtered.length === 0 ? (
        <EmptyState icon={<Users size={28} />} title="No partners" sub="Add delivery/business partners here." action={{ label: 'Add Partner', onClick: openAdd }} />
      ) : (
        <div className="fm-table-wrap">
          <table className="fm-table">
            <thead><tr>
              <th>Name</th><th>Contact</th><th>Phone</th><th>Email</th>
              <th>Commission %</th><th>Status</th><th className="fm-th-right">Actions</th>
            </tr></thead>
            <tbody>
              {slice.map(p => (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td><div className="fm-cell-name">{p.name}</div></td>
                  <td><span className="fm-cell-muted">{p.contact_name || '—'}</span></td>
                  <td><span className="fm-cell-muted">{p.phone || '—'}</span></td>
                  <td><span className="fm-cell-muted">{p.email || '—'}</span></td>
                  <td><span className="fm-status-badge fm-badge-info">{p.commission_percent}%</span></td>
                  <td><span className={`fm-status-badge ${p.is_active ? 'fm-badge-active' : 'fm-badge-inactive'}`}>{p.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td className="fm-td-right">
                    <div className="fm-row-actions">
                      <button className="fm-action-btn" onClick={() => openEdit(p)}><Edit2 size={13} /></button>
                      <button className="fm-action-btn fm-action-danger" onClick={() => setConfirm({ open: true, id: p.id })}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          <Pager page={page} total={total} onPage={setPage} count={filtered.length} />
        </div>
      )}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Partner' : 'Add Partner'} size="md">
        <form className="fm-form" onSubmit={save}>
          <Field label="Partner Name" required><input className="fm-input" value={fName} onChange={e => setFName(e.target.value)} required /></Field>
          <Row2>
            <Field label="Contact Name"><input className="fm-input" value={fContact} onChange={e => setFContact(e.target.value)} /></Field>
            <Field label="Commission (%)" required><input className="fm-input" type="number" min="0" max="100" step="0.1" value={fCommission} onChange={e => setFCommission(e.target.value)} required /></Field>
          </Row2>
          <Row2>
            <Field label="Phone"><input className="fm-input" value={fPhone} onChange={e => setFPhone(e.target.value)} /></Field>
            <Field label="Email"><input className="fm-input" type="email" value={fEmail} onChange={e => setFEmail(e.target.value)} /></Field>
          </Row2>
          {editing && <Checkbox id="partner-active" checked={fActive} onChange={setFActive} label="Active partner" />}
          <div className="fm-form-footer">
            <button type="button" className="fm-btn fm-btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="fm-btn fm-btn-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Update' : 'Add Partner'}</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={confirm.open} message="Delete this partner?" onConfirm={del} onCancel={() => setConfirm({ open: false, id: 0 })} />
    </div>
  );
};

/* ─────────────────── BRANDS ─────────────────── */
const BrandsTab: React.FC<{ showToast: (m: string, t?: 'success' | 'error' | 'info') => void }> = ({ showToast }) => {
  const [list, setList]       = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [saving, setSaving]   = useState(false);
  const [confirm, setConfirm] = useState<{ open: boolean; id: number }>({ open: false, id: 0 });
  const [fName, setFName]     = useState('');
  const [fDesc, setFDesc]     = useState('');
  const [fLogo, setFLogo]     = useState('');
  const [fActive, setFActive] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setList(await getBrands() ?? []); }
    catch { showToast('Failed to load brands', 'error'); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (!search) return list;
    return list.filter(b => (b.name + b.description).toLowerCase().includes(search.toLowerCase()));
  }, [list, search]);

  const { page, setPage, total, slice } = usePagination(filtered);

  const openAdd = () => { setEditing(null); setFName(''); setFDesc(''); setFLogo(''); setFActive(true); setModal(true); };
  const openEdit = (b: Brand) => { setEditing(b); setFName(b.name); setFDesc(b.description ?? ''); setFLogo(b.logo_url ?? ''); setFActive(b.is_active); setModal(true); };

  const save = async (ev: React.FormEvent) => {
    ev.preventDefault(); setSaving(true);
    try {
      if (editing) await updateBrand(editing.id, { name: fName, description: fDesc || undefined, logo_url: fLogo || undefined, is_active: fActive });
      else await createBrand({ name: fName, description: fDesc || undefined, logo_url: fLogo || undefined } as CreateBrandPayload);
      showToast(editing ? 'Brand updated' : 'Brand created');
      setModal(false); load();
    } catch { showToast('Failed to save', 'error'); }
    finally { setSaving(false); }
  };

  const del = async () => {
    try { await deleteBrand(confirm.id); showToast('Brand deleted'); load(); }
    catch { showToast('Failed to delete', 'error'); }
    finally { setConfirm({ open: false, id: 0 }); }
  };

  return (
    <div className="fm-tab-pane">
      <div className="fm-stats-grid">
        <StatCard label="Total Brands" value={list.length} icon={<Tag size={18} />} variant="primary" />
        <StatCard label="Active" value={list.filter(b => b.is_active).length} icon={<CheckCircle2 size={18} />} variant="success" />
      </div>
      <Toolbar search={search} onSearch={v => { setSearch(v); setPage(1); }} onAdd={openAdd} addLabel="Add Brand">
        <button className="fm-btn fm-btn-ghost fm-btn-icon" onClick={load}><RefreshCw size={14} className={loading ? 'fm-spin' : ''} /></button>
      </Toolbar>
      {loading ? <Loading /> : filtered.length === 0 ? (
        <EmptyState icon={<Tag size={28} />} title="No brands" sub="Add product brands here." action={{ label: 'Add Brand', onClick: openAdd }} />
      ) : (
        <div className="fm-table-wrap">
          <table className="fm-table">
            <thead><tr>
              <th>Logo</th><th>Name</th><th>Description</th><th>Status</th><th className="fm-th-right">Actions</th>
            </tr></thead>
            <tbody>
              {slice.map(b => (
                <motion.tr key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td>
                    {b.logo_url
                      ? <img src={b.logo_url} alt={b.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8, border: '1px solid #dfe6d2' }} />
                      : <div style={{ width: 40, height: 40, background: '#eef4e4', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5c6b46' }}><Tag size={16} /></div>
                    }
                  </td>
                  <td><div className="fm-cell-name">{b.name}</div></td>
                  <td><span className="fm-cell-muted">{b.description || '—'}</span></td>
                  <td><span className={`fm-status-badge ${b.is_active ? 'fm-badge-active' : 'fm-badge-inactive'}`}>{b.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td className="fm-td-right">
                    <div className="fm-row-actions">
                      <button className="fm-action-btn" onClick={() => openEdit(b)}><Edit2 size={13} /></button>
                      <button className="fm-action-btn fm-action-danger" onClick={() => setConfirm({ open: true, id: b.id })}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          <Pager page={page} total={total} onPage={setPage} count={filtered.length} />
        </div>
      )}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Brand' : 'Add Brand'} size="sm">
        <form className="fm-form" onSubmit={save}>
          <Field label="Brand Name" required><input className="fm-input" value={fName} onChange={e => setFName(e.target.value)} required /></Field>
          <Field label="Logo URL"><input className="fm-input" placeholder="https://…" value={fLogo} onChange={e => setFLogo(e.target.value)} /></Field>
          <Field label="Description"><textarea className="fm-input fm-textarea" rows={2} value={fDesc} onChange={e => setFDesc(e.target.value)} /></Field>
          {editing && <Checkbox id="brand-active" checked={fActive} onChange={setFActive} label="Active" />}
          <div className="fm-form-footer">
            <button type="button" className="fm-btn fm-btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="fm-btn fm-btn-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Update' : 'Add Brand'}</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={confirm.open} message="Delete this brand?" onConfirm={del} onCancel={() => setConfirm({ open: false, id: 0 })} />
    </div>
  );
};

/* ─────────────────── NOTIFICATIONS ─────────────────── */
const NotificationsTab: React.FC<{ showToast: (m: string, t?: 'success' | 'error' | 'info') => void }> = ({ showToast }) => {
  const [list, setList]       = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [modal, setModal]     = useState(false);
  const [saving, setSaving]   = useState(false);
  const [fTitle, setFTitle]   = useState('');
  const [fMsg, setFMsg]       = useState('');
  const [fType, setFType]     = useState('');
  const [fUserId, setFUserId] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { setList(await getNotifications() ?? []); }
    catch { showToast('Failed to load notifications', 'error'); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const markRead = async (id: number) => {
    try { await markNotificationRead(id); setList(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n)); }
    catch { showToast('Failed to mark as read', 'error'); }
  };

  const filtered = useMemo(() => {
    if (!search) return list;
    return list.filter(n => (n.title + n.message).toLowerCase().includes(search.toLowerCase()));
  }, [list, search]);

  const { page, setPage, total, slice } = usePagination(filtered, 15);

  const save = async (ev: React.FormEvent) => {
    ev.preventDefault(); setSaving(true);
    try {
      const p: CreateNotificationPayload = { title: fTitle, message: fMsg, notification_type: fType || undefined, user_id: fUserId ? Number(fUserId) : undefined };
      await sendNotification(p);
      showToast('Notification sent'); setModal(false); load();
    } catch { showToast('Failed to send', 'error'); }
    finally { setSaving(false); }
  };

  const unread = list.filter(n => !n.is_read).length;

  return (
    <div className="fm-tab-pane">
      <div className="fm-stats-grid">
        <StatCard label="Total" value={list.length} icon={<Bell size={18} />} variant="primary" />
        <StatCard label="Unread" value={unread} icon={<Bell size={18} />} variant="warn" />
      </div>
      <Toolbar search={search} onSearch={v => { setSearch(v); setPage(1); }} onAdd={() => { setFTitle(''); setFMsg(''); setFType(''); setFUserId(''); setModal(true); }} addLabel="Send Notification">
        <button className="fm-btn fm-btn-ghost fm-btn-icon" onClick={load}><RefreshCw size={14} className={loading ? 'fm-spin' : ''} /></button>
      </Toolbar>
      {loading ? <Loading /> : filtered.length === 0 ? (
        <EmptyState icon={<Bell size={28} />} title="No notifications" sub="Send a notification to get started." action={{ label: 'Send', onClick: () => setModal(true) }} />
      ) : (
        <div className="fm-table-wrap">
          {slice.map(n => (
            <div
              key={n.id}
              className={`fm-notif-item ${!n.is_read ? 'fm-notif-unread' : ''}`}
              onClick={() => !n.is_read && markRead(n.id)}
            >
              <div className={`fm-notif-dot ${n.is_read ? 'fm-notif-dot-read' : ''}`} />
              <div className="fm-notif-body">
                <p className="fm-notif-title">{n.title}</p>
                <p className="fm-notif-msg">{n.message}</p>
                {n.notification_type && <span className="fm-status-badge fm-badge-info" style={{ marginTop: 4 }}>{n.notification_type}</span>}
              </div>
              <p className="fm-notif-time">{fmtDateTime(n.created_at)}</p>
            </div>
          ))}
          <Pager page={page} total={total} onPage={setPage} count={filtered.length} />
        </div>
      )}
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Send Notification" size="sm">
        <form className="fm-form" onSubmit={save}>
          <Field label="Title" required><input className="fm-input" value={fTitle} onChange={e => setFTitle(e.target.value)} required /></Field>
          <Field label="Message" required><textarea className="fm-input fm-textarea" rows={3} value={fMsg} onChange={e => setFMsg(e.target.value)} required /></Field>
          <Row2>
            <Field label="Type"><input className="fm-input" placeholder="ORDER_UPDATE, etc." value={fType} onChange={e => setFType(e.target.value)} /></Field>
            <Field label="User ID (optional)"><input className="fm-input" type="number" placeholder="Leave blank for all" value={fUserId} onChange={e => setFUserId(e.target.value)} /></Field>
          </Row2>
          <div className="fm-form-footer">
            <button type="button" className="fm-btn fm-btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="fm-btn fm-btn-primary" disabled={saving}>{saving ? 'Sending…' : 'Send'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

/* ─────────────────── AUDIT LOGS ─────────────────── */
const AuditLogsTab: React.FC<{ showToast: (m: string, t?: 'success' | 'error' | 'info') => void }> = ({ showToast }) => {
  const [list, setList]       = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { setList(await getAuditLogs() ?? []); }
    catch { showToast('Failed to load audit logs', 'error'); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (!search) return list;
    return list.filter(l => (l.action + l.reference_type).toLowerCase().includes(search.toLowerCase()));
  }, [list, search]);

  const { page, setPage, total, slice } = usePagination(filtered, 20);

  return (
    <div className="fm-tab-pane">
      <div className="fm-stats-grid">
        <StatCard label="Total Logs" value={list.length} icon={<FileText size={18} />} variant="primary" />
      </div>
      <Toolbar search={search} onSearch={v => { setSearch(v); setPage(1); }}>
        <button className="fm-btn fm-btn-ghost fm-btn-icon" onClick={load}><RefreshCw size={14} className={loading ? 'fm-spin' : ''} /></button>
      </Toolbar>
      {loading ? <Loading /> : filtered.length === 0 ? (
        <EmptyState icon={<FileText size={28} />} title="No audit logs" sub="System audit logs will appear here." />
      ) : (
        <div className="fm-table-wrap">
          <table className="fm-table">
            <thead><tr>
              <th>Action</th><th>Reference</th><th>Ref ID</th><th>User ID</th><th>Date</th>
            </tr></thead>
            <tbody>
              {slice.map(l => (
                <motion.tr key={l.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td>
                    <div className="fm-audit-row">
                      <span className="fm-audit-action">{l.action}</span>
                    </div>
                  </td>
                  <td>{l.reference_type ? <span className="fm-status-badge fm-badge-info">{l.reference_type}</span> : '—'}</td>
                  <td><span className="fm-cell-muted">{l.reference_id ?? '—'}</span></td>
                  <td><span className="fm-cell-muted">{l.user_id ?? 'System'}</span></td>
                  <td><span className="fm-cell-muted">{fmtDateTime(l.created_at)}</span></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          <Pager page={page} total={total} onPage={setPage} count={filtered.length} />
        </div>
      )}
    </div>
  );
};

/* ─────────────────── CUSTOM ORDERS ─────────────────── */
const CustomOrdersTab: React.FC<{ showToast: (m: string, t?: 'success' | 'error' | 'info') => void }> = ({ showToast }) => {
  const [list, setList]           = useState<CustomOrder[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editModal, setEditModal] = useState(false);
  const [editing, setEditing]     = useState<CustomOrder | null>(null);
  const [saving, setSaving]       = useState(false);
  const [fDesc, setFDesc]         = useState('');
  const [fBudget, setFBudget]     = useState('');
  const [fNote, setFNote]         = useState('');
  const [fQuoted, setFQuoted]     = useState('');
  const [approveModal, setApproveModal] = useState<CustomOrder | null>(null);
  const [rejectModal, setRejectModal]   = useState<CustomOrder | null>(null);
  const [fReason, setFReason]           = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { setList(await getCustomOrders() ?? []); }
    catch { showToast('Failed to load custom orders', 'error'); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const statuses = ['all', 'PENDING', 'APPROVED', 'REJECTED', 'CONVERTED'];
  const filtered = useMemo(() => {
    let r = list;
    if (statusFilter !== 'all') r = r.filter(c => c.status === statusFilter);
    if (search) r = r.filter(c => c.description.toLowerCase().includes(search.toLowerCase()));
    return r;
  }, [list, search, statusFilter]);

  const { page, setPage, total, slice } = usePagination(filtered);

  const openEdit = (c: CustomOrder) => { setEditing(c); setFDesc(c.description); setFBudget(String(c.budget ?? '')); setFNote(c.notes ?? ''); setFQuoted(String(c.quoted_price ?? '')); setEditModal(true); };

  const saveEdit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const p: UpdateCustomOrderPayload = { description: fDesc, budget: fBudget ? Number(fBudget) : undefined, notes: fNote || undefined, quoted_price: fQuoted ? Number(fQuoted) : undefined };
      await updateCustomOrder(editing.id, p);
      showToast('Custom order updated'); setEditModal(false); load();
    } catch { showToast('Failed to update', 'error'); }
    finally { setSaving(false); }
  };

  const doApprove = async () => {
    if (!approveModal) return; setSaving(true);
    try { await approveCustomOrder(approveModal.id, fQuoted ? Number(fQuoted) : undefined); showToast('Approved'); setApproveModal(null); setFQuoted(''); load(); }
    catch { showToast('Failed to approve', 'error'); }
    finally { setSaving(false); }
  };

  const doReject = async () => {
    if (!rejectModal) return; setSaving(true);
    try { await rejectCustomOrder(rejectModal.id, fReason || undefined); showToast('Rejected'); setRejectModal(null); setFReason(''); load(); }
    catch { showToast('Failed to reject', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fm-tab-pane">
      <div className="fm-stats-grid">
        <StatCard label="Total" value={list.length} icon={<ShoppingBag size={18} />} variant="primary" />
        <StatCard label="Pending" value={list.filter(c => c.status === 'PENDING').length} icon={<AlertCircle size={18} />} variant="warn" />
        <StatCard label="Approved" value={list.filter(c => c.status === 'APPROVED').length} icon={<CheckCircle2 size={18} />} variant="success" />
        <StatCard label="Converted" value={list.filter(c => c.status === 'CONVERTED').length} icon={<TrendingUp size={18} />} variant="info" />
      </div>
      <div className="fm-chips">
        {statuses.map(s => (
          <button key={s} className={`fm-chip ${statusFilter === s ? 'fm-chip-active' : ''}`} onClick={() => { setStatusFilter(s); setPage(1); }}>
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>
      <Toolbar search={search} onSearch={v => { setSearch(v); setPage(1); }}>
        <button className="fm-btn fm-btn-ghost fm-btn-icon" onClick={load}><RefreshCw size={14} className={loading ? 'fm-spin' : ''} /></button>
      </Toolbar>
      {loading ? <Loading /> : filtered.length === 0 ? (
        <EmptyState icon={<ShoppingBag size={28} />} title="No custom orders" sub="Custom order requests from customers appear here." />
      ) : (
        <div className="fm-table-wrap">
          <table className="fm-table">
            <thead><tr>
              <th>ID</th><th>Description</th><th>Budget</th><th>Quoted</th>
              <th>Status</th><th>Date</th><th className="fm-th-right">Actions</th>
            </tr></thead>
            <tbody>
              {slice.map(c => (
                <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td><span className="fm-status-badge fm-badge-info">#{c.id}</span></td>
                  <td><div className="fm-cell-name" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.description}</div></td>
                  <td>{c.budget ? fmt(c.budget) : '—'}</td>
                  <td>{c.quoted_price ? <span className="fm-amount-positive">{fmt(c.quoted_price)}</span> : '—'}</td>
                  <td><span className={`fm-status-badge fm-co-status-${c.status}`}>{c.status}</span></td>
                  <td><span className="fm-cell-muted">{fmtDate(c.created_at ?? '')}</span></td>
                  <td className="fm-td-right">
                    <div className="fm-row-actions">
                      <button className="fm-action-btn" onClick={() => openEdit(c)} title="Edit"><Edit2 size={13} /></button>
                      {c.status === 'PENDING' && <>
                        <button className="fm-action-btn" onClick={() => { setApproveModal(c); setFQuoted(''); }} title="Approve" style={{ color: '#3DAA6B' }}><CheckCircle2 size={13} /></button>
                        <button className="fm-action-btn fm-action-danger" onClick={() => { setRejectModal(c); setFReason(''); }} title="Reject"><XCircle size={13} /></button>
                      </>}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          <Pager page={page} total={total} onPage={setPage} count={filtered.length} />
        </div>
      )}
      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Edit Custom Order" size="sm">
        <form className="fm-form" onSubmit={saveEdit}>
          <Field label="Description" required><textarea className="fm-input fm-textarea" rows={3} value={fDesc} onChange={e => setFDesc(e.target.value)} required /></Field>
          <Row2>
            <Field label="Budget (₹)"><input className="fm-input" type="number" min="0" value={fBudget} onChange={e => setFBudget(e.target.value)} /></Field>
            <Field label="Quoted Price (₹)"><input className="fm-input" type="number" min="0" value={fQuoted} onChange={e => setFQuoted(e.target.value)} /></Field>
          </Row2>
          <Field label="Notes"><textarea className="fm-input fm-textarea" rows={2} value={fNote} onChange={e => setFNote(e.target.value)} /></Field>
          <div className="fm-form-footer">
            <button type="button" className="fm-btn fm-btn-ghost" onClick={() => setEditModal(false)}>Cancel</button>
            <button type="submit" className="fm-btn fm-btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Update'}</button>
          </div>
        </form>
      </Modal>
      <Modal isOpen={!!approveModal} onClose={() => setApproveModal(null)} title="Approve Custom Order" size="sm">
        <div className="fm-form">
          <Field label="Quoted Price (₹) — optional"><input className="fm-input" type="number" min="0" value={fQuoted} onChange={e => setFQuoted(e.target.value)} autoFocus /></Field>
          <div className="fm-form-footer">
            <button className="fm-btn fm-btn-ghost" onClick={() => setApproveModal(null)}>Cancel</button>
            <button className="fm-btn fm-btn-primary" onClick={doApprove} disabled={saving}>{saving ? 'Approving…' : 'Approve'}</button>
          </div>
        </div>
      </Modal>
      <Modal isOpen={!!rejectModal} onClose={() => setRejectModal(null)} title="Reject Custom Order" size="sm">
        <div className="fm-form">
          <Field label="Reason (optional)"><textarea className="fm-input fm-textarea" rows={3} value={fReason} onChange={e => setFReason(e.target.value)} autoFocus /></Field>
          <div className="fm-form-footer">
            <button className="fm-btn fm-btn-ghost" onClick={() => setRejectModal(null)}>Cancel</button>
            <button className="fm-btn fm-btn-danger" onClick={doReject} disabled={saving}>{saving ? 'Rejecting…' : 'Reject'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

/* ─────────────────── ORDER SOURCES ─────────────────── */
const OrderSourcesTab: React.FC<{ showToast: (m: string, t?: 'success' | 'error' | 'info') => void }> = ({ showToast }) => {
  const [list, setList]       = useState<OrderSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState<OrderSource | null>(null);
  const [saving, setSaving]   = useState(false);
  const [confirm, setConfirm] = useState<{ open: boolean; id: number }>({ open: false, id: 0 });
  const [fName, setFName]     = useState('');
  const [fDesc, setFDesc]     = useState('');
  const [fActive, setFActive] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setList(await getOrderSources() ?? []); }
    catch { showToast('Failed to load order sources', 'error'); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (!search) return list;
    return list.filter(s => (s.name + s.description).toLowerCase().includes(search.toLowerCase()));
  }, [list, search]);

  const { page, setPage, total, slice } = usePagination(filtered);

  const openAdd = () => { setEditing(null); setFName(''); setFDesc(''); setFActive(true); setModal(true); };
  const openEdit = (s: OrderSource) => { setEditing(s); setFName(s.name); setFDesc(s.description ?? ''); setFActive(s.is_active); setModal(true); };

  const save = async (ev: React.FormEvent) => {
    ev.preventDefault(); setSaving(true);
    try {
      if (editing) await updateOrderSource(editing.id, { name: fName, description: fDesc || undefined, is_active: fActive });
      else await createOrderSource({ name: fName, description: fDesc || undefined } as CreateOrderSourcePayload);
      showToast(editing ? 'Updated' : 'Source added'); setModal(false); load();
    } catch { showToast('Failed to save', 'error'); }
    finally { setSaving(false); }
  };

  const del = async () => {
    try { await deleteOrderSource(confirm.id); showToast('Deleted'); load(); }
    catch { showToast('Failed to delete', 'error'); }
    finally { setConfirm({ open: false, id: 0 }); }
  };

  return (
    <div className="fm-tab-pane">
      <div className="fm-stats-grid">
        <StatCard label="Total Sources" value={list.length} icon={<MapPin size={18} />} variant="primary" />
        <StatCard label="Active" value={list.filter(s => s.is_active).length} icon={<CheckCircle2 size={18} />} variant="success" />
      </div>
      <Toolbar search={search} onSearch={v => { setSearch(v); setPage(1); }} onAdd={openAdd} addLabel="Add Source">
        <button className="fm-btn fm-btn-ghost fm-btn-icon" onClick={load}><RefreshCw size={14} className={loading ? 'fm-spin' : ''} /></button>
      </Toolbar>
      {loading ? <Loading /> : filtered.length === 0 ? (
        <EmptyState icon={<MapPin size={28} />} title="No order sources" sub="Track where orders come from (WhatsApp, Website, etc)." action={{ label: 'Add Source', onClick: openAdd }} />
      ) : (
        <div className="fm-table-wrap">
          <table className="fm-table">
            <thead><tr>
              <th>Name</th><th>Description</th><th>Status</th><th>Created</th><th className="fm-th-right">Actions</th>
            </tr></thead>
            <tbody>
              {slice.map(s => (
                <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td><div className="fm-cell-name">{s.name}</div></td>
                  <td><span className="fm-cell-muted">{s.description || '—'}</span></td>
                  <td><span className={`fm-status-badge ${s.is_active ? 'fm-badge-active' : 'fm-badge-inactive'}`}>{s.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td><span className="fm-cell-muted">{fmtDate(s.created_at ?? '')}</span></td>
                  <td className="fm-td-right">
                    <div className="fm-row-actions">
                      <button className="fm-action-btn" onClick={() => openEdit(s)}><Edit2 size={13} /></button>
                      <button className="fm-action-btn fm-action-danger" onClick={() => setConfirm({ open: true, id: s.id })}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          <Pager page={page} total={total} onPage={setPage} count={filtered.length} />
        </div>
      )}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Source' : 'Add Order Source'} size="sm">
        <form className="fm-form" onSubmit={save}>
          <Field label="Source Name" required><input className="fm-input" placeholder="e.g. WhatsApp, Website, Walk-in" value={fName} onChange={e => setFName(e.target.value)} required /></Field>
          <Field label="Description"><textarea className="fm-input fm-textarea" rows={2} value={fDesc} onChange={e => setFDesc(e.target.value)} /></Field>
          {editing && <Checkbox id="source-active" checked={fActive} onChange={setFActive} label="Active" />}
          <div className="fm-form-footer">
            <button type="button" className="fm-btn fm-btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="fm-btn fm-btn-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Update' : 'Add Source'}</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={confirm.open} message="Delete this order source?" onConfirm={del} onCancel={() => setConfirm({ open: false, id: 0 })} />
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   MAIN FINANCE COMPONENT
══════════════════════════════════════════════════════════════ */
const Finance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FinanceTab>('financeOrders');
  const [toasts, setToasts]       = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = ++_tid;
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);

  const removeToast = useCallback((id: number) => setToasts(p => p.filter(t => t.id !== id)), []);

  const tabs: { key: FinanceTab; label: string; icon: React.ReactNode }[] = [
    { key: 'financeOrders',     label: 'Orders',             icon: <Receipt size={14} /> },
    { key: 'expenses',          label: 'Expenses',           icon: <DollarSign size={14} /> },
    { key: 'cashDrawer',        label: 'Cash Drawer',        icon: <CreditCard size={14} /> },
    { key: 'bank',              label: 'Bank',               icon: <Building2 size={14} /> },
    { key: 'bankCharges',       label: 'Bank Charges',       icon: <Zap size={14} /> },
    { key: 'driverSettlements', label: 'Driver Settlements', icon: <Truck size={14} /> },
    { key: 'partners',          label: 'Partners',           icon: <Users size={14} /> },
    { key: 'brands',            label: 'Brands',             icon: <Tag size={14} /> },
    { key: 'notifications',     label: 'Notifications',      icon: <Bell size={14} /> },
    { key: 'auditLogs',         label: 'Audit Logs',         icon: <FileText size={14} /> },
    { key: 'customOrders',      label: 'Custom Orders',      icon: <ShoppingBag size={14} /> },
    { key: 'orderSources',      label: 'Order Sources',      icon: <MapPin size={14} /> },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case 'financeOrders':     return <FinanceOrdersTab showToast={showToast} />;
      case 'expenses':          return <ExpensesTab showToast={showToast} />;
      case 'cashDrawer':        return <CashDrawerTab showToast={showToast} />;
      case 'bank':              return <BankTab showToast={showToast} />;
      case 'bankCharges':       return <BankChargesTab showToast={showToast} />;
      case 'driverSettlements': return <DriverSettlementsTab showToast={showToast} />;
      case 'partners':          return <PartnersTab showToast={showToast} />;
      case 'brands':            return <BrandsTab showToast={showToast} />;
      case 'notifications':     return <NotificationsTab showToast={showToast} />;
      case 'auditLogs':         return <AuditLogsTab showToast={showToast} />;
      case 'customOrders':      return <CustomOrdersTab showToast={showToast} />;
      case 'orderSources':      return <OrderSourcesTab showToast={showToast} />;
      default:                  return null;
    }
  };

  return (
    <div className="fm-root">
      <ToastStack toasts={toasts} onRemove={removeToast} />

      {/* ── Nav tabs ── */}
      <nav className="fm-nav">
        <div className="fm-tabs-scroll">
          {tabs.map(t => (
            <button
              key={t.key}
              className={`fm-tab ${activeTab === t.key ? 'fm-tab-active' : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Content ── */}
      <div className="fm-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Finance;