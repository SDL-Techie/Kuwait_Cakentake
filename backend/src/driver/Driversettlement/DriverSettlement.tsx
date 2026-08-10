import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Download, ChevronDown, X, Eye, Wallet, Truck, Calendar,
  Loader2, CheckCircle2, XCircle, AlertCircle, ChevronLeft, ChevronRight,
  Phone, MapPin, User, Star, Package, Clock, CreditCard, FileText,
} from 'lucide-react';
import './DriverSettlement.css';

import DriverService, {
  getDrivers,
  getDriverDashboard,
  getDriverCompleted,
  getDriverReport,
  getDriverDeliveredOrders,
  getDriverSettlements,
  getUnsettledOrders,
  getAllSettlements,
  getSettlementDetail,
  createSettlement,
  markSettlementPaid,
  Settlement,
} from '../../services/driverService';

import { api } from '../../services/api';

/* ═══════════════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════════════ */

interface DriverLite {
  id: number;
  first_name: string;
  last_name: string;
  phone_no: string;
  availability_status?: 'ONLINE' | 'BUSY' | 'OFFLINE' | string;
  rating?: number;
}

interface OrderLite {
  id: number;
  order_number: string;
  status: string;
  payment_method?: string;
  payment_status?: string;
  delivery_charge?: number;
  grand_total?: number;
  total?: number;
  delivery_date?: string | null;
  delivered_at?: string | null;
  created_at?: string | null;
  is_driver_settled?: boolean;
  driver_settlement_id?: number | null;
  driver_id?: number | null;
  customer_name?: string;
  customer_phone?: string;
  customer?: { id?: number; first_name?: string; last_name?: string; phone_no?: string } | null;
  address?: { street?: string; city?: string; state?: string; pincode?: string; country?: string } | null;
  driver?: { id?: number; first_name?: string; last_name?: string; phone_no?: string } | null;
}

interface DriverSummary {
  totalOrders: number;
  totalOrderAmount: number;
  totalDeliveryCharge: number;
  pendingAmount: number;
  paidAmount: number;
  loading: boolean;
}

type TabKey = 'delivered' | 'settlement' | 'pending' | 'paid' | 'history';

/* ═══════════════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════════════ */

const money = (n: number | undefined | null) => Number(n || 0).toFixed(2);

const fmtDate = (d?: string | null) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return d; }
};

const fmtDateTime = (d?: string | null) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return d; }
};

const custName = (o: OrderLite) =>
  o.customer ? `${o.customer.first_name || ''} ${o.customer.last_name || ''}`.trim() || '—'
    : (o.customer_name || '—');

const custPhone = (o: OrderLite) => o.customer?.phone_no || o.customer_phone || '—';

// NOTE: the backend serialises this relation as `address`, not `deliveryAddress`.
// Using the wrong field silently rendered blank cells everywhere this was used.
const addrLine = (o: OrderLite) => {
  if (!o.address) return '—';
  return [o.address.street, o.address.city, o.address.state, o.address.pincode].filter(Boolean).join(', ') || '—';
};

const orderAmount = (o: OrderLite) => Number(o.grand_total ?? o.total ?? 0);

const driverFullName = (d?: { first_name?: string; last_name?: string } | null) =>
  d ? `${d.first_name || ''} ${d.last_name || ''}`.trim() || '—' : '—';

const csvEscape = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;

const downloadCsv = (filename: string, rows: string[][]) => {
  const csv = rows.map(r => r.map(csvEscape).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

/* ═══════════════════════════════════════════════════════════════════════
   SHARED UI ATOMS
═══════════════════════════════════════════════════════════════════════ */

const Toast: React.FC<{ msg: string; show: boolean; type: 'success' | 'error' | 'info'; onClose: () => void }> = ({ msg, show, type, onClose }) => {
  useEffect(() => { if (show) { const t = setTimeout(onClose, 3200); return () => clearTimeout(t); } }, [show, onClose]);
  const icon = type === 'success' ? <CheckCircle2 size={15} /> : type === 'error' ? <XCircle size={15} /> : <AlertCircle size={15} />;
  return (
    <AnimatePresence>
      {show && (
        <motion.div className={`ds-toast ds-toast-${type}`} initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
          <span className="ds-toast-icon">{icon}</span>
          <span>{msg}</span>
          <button onClick={onClose}><X size={12} /></button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const StatusPill: React.FC<{ status: string }> = ({ status }) => {
  const s = (status || '').toUpperCase();
  const map: Record<string, string> = {
    PENDING: 'ds-pill-amber',
    SETTLED: 'ds-pill-green',
    PAID: 'ds-pill-green',
    DELIVERED: 'ds-pill-green',
    CANCELLED: 'ds-pill-red',
    REJECTED: 'ds-pill-red',
    OUT_FOR_DELIVERY: 'ds-pill-blue',
    ONLINE: 'ds-pill-green',
    BUSY: 'ds-pill-amber',
    OFFLINE: 'ds-pill-grey',
  };
  return <span className={`ds-pill ${map[s] || 'ds-pill-grey'}`}>{s.replace(/_/g, ' ')}</span>;
};

const Skeleton: React.FC<{ height?: number; width?: string }> = ({ height = 14, width = '100%' }) => (
  <div className="ds-skel" style={{ height, width }} />
);

const ConfirmDialog: React.FC<{
  open: boolean; title: string; message: React.ReactNode; confirmLabel?: string;
  onConfirm: () => void; onCancel: () => void; loading?: boolean;
}> = ({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel, loading }) => (
  <AnimatePresence>
    {open && (
      <motion.div className="ds-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel}>
        <motion.div className="ds-confirm-box" initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }} onClick={e => e.stopPropagation()}>
          <h4>{title}</h4>
          <div className="ds-confirm-msg">{message}</div>
          <div className="ds-confirm-actions">
            <button className="ds-btn-ghost" onClick={onCancel} disabled={loading}>Cancel</button>
            <button className="ds-btn-primary" onClick={onConfirm} disabled={loading}>
              {loading ? <Loader2 size={14} className="ds-spin" /> : confirmLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const Pagination: React.FC<{ page: number; totalPages: number; onChange: (p: number) => void }> = ({ page, totalPages, onChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="ds-pagination">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)}><ChevronLeft size={14} /></button>
      <span>Page {page} of {totalPages}</span>
      <button disabled={page >= totalPages} onClick={() => onChange(page + 1)}><ChevronRight size={14} /></button>
    </div>
  );
};

function usePaged<T>(rows: T[], pageSize = 10) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  useEffect(() => { if (page > totalPages) setPage(1); }, [rows.length]); // eslint-disable-line
  const slice = rows.slice((page - 1) * pageSize, page * pageSize);
  return { page, setPage, totalPages, slice };
}

/* ═══════════════════════════════════════════════════════════════════════
   ORDER DETAIL DRAWER (Tab 1 row click)
═══════════════════════════════════════════════════════════════════════ */

const OrderDrawer: React.FC<{ order: OrderLite | null; onClose: () => void }> = ({ order, onClose }) => (
  <AnimatePresence>
    {order && (
      <>
        <motion.div className="ds-drawer-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
        <motion.div className="ds-drawer" initial={{ x: 420 }} animate={{ x: 0 }} exit={{ x: 420 }} transition={{ type: 'spring', stiffness: 300, damping: 32 }}>
          <div className="ds-drawer-hdr">
            <h3>Order {order.order_number}</h3>
            <button onClick={onClose}><X size={16} /></button>
          </div>
          <div className="ds-drawer-body">
            <div className="ds-drawer-row"><span>Status</span><StatusPill status={order.status} /></div>
            <div className="ds-drawer-row"><span>Customer</span><strong>{custName(order)}</strong></div>
            <div className="ds-drawer-row"><span>Phone</span><strong>{custPhone(order)}</strong></div>
            <div className="ds-drawer-row"><span>Address</span><strong>{addrLine(order)}</strong></div>
            <div className="ds-drawer-row"><span>Delivery Date</span><strong>{fmtDate(order.delivery_date)}</strong></div>
            <div className="ds-drawer-row"><span>Delivered At</span><strong>{fmtDateTime(order.delivered_at)}</strong></div>
            <div className="ds-drawer-row"><span>Order Amount</span><strong>{money(orderAmount(order))}</strong></div>
            <div className="ds-drawer-row"><span>Delivery Charge</span><strong>{money(order.delivery_charge)}</strong></div>
            <div className="ds-drawer-row"><span>Payment Method</span><strong>{order.payment_method || '—'}</strong></div>
            <div className="ds-drawer-row"><span>Payment Status</span><StatusPill status={order.payment_status || '—'} /></div>
            <div className="ds-drawer-row"><span>Driver</span><strong>{order.driver ? driverFullName(order.driver) : '—'}</strong></div>
            <div className="ds-drawer-row"><span>Driver Phone</span><strong>{order.driver?.phone_no || '—'}</strong></div>
            <div className="ds-drawer-row">
              <span>Settlement</span>
              <StatusPill status={order.is_driver_settled ? 'SETTLED' : 'PENDING'} />
            </div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

/* ═══════════════════════════════════════════════════════════════════════
   TAB 1 — DELIVERED ORDERS
═══════════════════════════════════════════════════════════════════════ */

const DeliveredOrdersTab: React.FC<{
  drivers: DriverLite[];
  driversMap: Record<number, DriverLite>;
  showToast: (m: string, t?: 'success' | 'error' | 'info') => void;
}> = ({ drivers, driversMap, showToast }) => {
  const [selectedDriverId, setSelectedDriverId] = useState<number | ''>('');
  const [dateFilter, setDateFilter] = useState('');
  const [searchOrder, setSearchOrder] = useState('');
  const [searchCustomer, setSearchCustomer] = useState('');
  const [orders, setOrders] = useState<OrderLite[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerOrder, setDrawerOrder] = useState<OrderLite | null>(null);

  const load = useCallback(async (driverId: number | '') => {
    setLoading(true);
    try {
      if (driverId === '') {
        // All drivers — existing generic route, not a new one.
        const res = await api.get('/orders/status/DELIVERED');
        setOrders(res.data.orders || []);
      } else {
        const list = await getDriverCompleted(driverId);
        setOrders(list || []);
      }
    } catch {
      showToast('Could not load delivered orders', 'error');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(selectedDriverId); }, [selectedDriverId]); // eslint-disable-line

  const filtered = useMemo(() => {
    return orders.filter(o => {
      if (dateFilter && o.delivery_date && !String(o.delivery_date).startsWith(dateFilter)) return false;
      if (dateFilter && !o.delivery_date) return false;
      if (searchOrder && !o.order_number?.toLowerCase().includes(searchOrder.toLowerCase())) return false;
      if (searchCustomer && !custName(o).toLowerCase().includes(searchCustomer.toLowerCase())) return false;
      return true;
    });
  }, [orders, dateFilter, searchOrder, searchCustomer]);

  const totals = useMemo(() => ({
    count: filtered.length,
    orderAmount: filtered.reduce((s, o) => s + orderAmount(o), 0),
    deliveryCharge: filtered.reduce((s, o) => s + Number(o.delivery_charge || 0), 0),
    settled: filtered.filter(o => o.is_driver_settled).length,
    pending: filtered.filter(o => !o.is_driver_settled).length,
  }), [filtered]);

  const { page, setPage, totalPages, slice } = usePaged(filtered, 10);

  const driverFor = (o: OrderLite) => o.driver || (o.driver_id ? driversMap[o.driver_id] : undefined);

  const handleExport = () => {
    const rows: string[][] = [[
      'Order Number', 'Customer', 'Phone', 'Address', 'Delivery Date', 'Order Amount',
      'Delivery Charge', 'Payment Method', 'Payment Status', 'Driver', 'Driver Phone', 'Settlement',
    ]];
    filtered.forEach(o => {
      const d = driverFor(o);
      rows.push([
        o.order_number, custName(o), custPhone(o), addrLine(o), fmtDate(o.delivery_date),
        String(orderAmount(o)), String(o.delivery_charge || 0), o.payment_method || '',
        o.payment_status || '', driverFullName(d), d?.phone_no || '', o.is_driver_settled ? 'Settled' : 'Pending',
      ]);
    });
    downloadCsv('delivered_orders.csv', rows);
  };

  return (
    <div className="ds-tab-panel">

      <div className="ds-footer-stats">
        <div><span>Total Orders</span><strong>{totals.count}</strong></div>
        <div><span>Total Order Amount</span><strong>{money(totals.orderAmount)}</strong></div>
        <div><span>Total Delivery Charges</span><strong>{money(totals.deliveryCharge)}</strong></div>
        <div><span>Total Settled</span><strong>{totals.settled}</strong></div>
        <div><span>Total Pending</span><strong>{totals.pending}</strong></div>
      </div>

      <div className="ds-toolbar">
        <div className="ds-filter">
          <label>Driver</label>
          <select value={selectedDriverId} onChange={e => setSelectedDriverId(e.target.value ? Number(e.target.value) : '')}>
            <option value="">All Drivers</option>
            {drivers.map(d => <option key={d.id} value={d.id}>{driverFullName(d)}</option>)}
          </select>
        </div>
        <div className="ds-filter">
          <label>Date</label>
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
        </div>
        <div className="ds-filter ds-filter-search">
          <label>Order #</label>
          <div className="ds-search-box"><Search size={13} /><input value={searchOrder} onChange={e => setSearchOrder(e.target.value)} placeholder="CT-2026..." /></div>
        </div>
        <div className="ds-filter ds-filter-search">
          <label>Customer</label>
          <div className="ds-search-box"><Search size={13} /><input value={searchCustomer} onChange={e => setSearchCustomer(e.target.value)} placeholder="Name..." /></div>
        </div>
        <button className="ds-btn-export" onClick={handleExport}><Download size={14} /> Export</button>
      </div>

      <div className="ds-table-wrap">
        <table className="ds-table">
          <thead>
            <tr>
              <th>Order #</th><th>Customer</th><th>Phone</th><th>Address</th><th>Delivery Date</th>
              <th>Amount</th><th>Delivery Charge</th><th>Payment</th><th>Pay Status</th>
              <th>Driver</th><th>Driver Phone</th><th>Settlement</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 12 }).map((_, j) => <td key={j}><Skeleton /></td>)}</tr>
              ))
            ) : slice.length === 0 ? (
              <tr><td colSpan={12} className="ds-empty">No delivered orders found</td></tr>
            ) : (
              slice.map(o => {
                const d = driverFor(o);
                return (
                  <tr key={o.id} onClick={() => setDrawerOrder(o)} className="ds-row-click">
                    <td className="ds-mono">{o.order_number}</td>
                    <td>{custName(o)}</td>
                    <td>{custPhone(o)}</td>
                    <td className="ds-addr-cell">{addrLine(o)}</td>
                    <td>{fmtDate(o.delivery_date)}</td>
                    <td>{money(orderAmount(o))}</td>
                    <td>{money(o.delivery_charge)}</td>
                    <td>{o.payment_method || '—'}</td>
                    <td><StatusPill status={o.payment_status || '—'} /></td>
                    <td>{driverFullName(d)}</td>
                    <td>{d?.phone_no || '—'}</td>
                    <td><StatusPill status={o.is_driver_settled ? 'SETTLED' : 'PENDING'} /></td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      <OrderDrawer order={drawerOrder} onClose={() => setDrawerOrder(null)} />
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   TAB 2 — DRIVER SETTLEMENT (cards + view/create-settlement modals)
═══════════════════════════════════════════════════════════════════════ */

const OrdersPickerModal: React.FC<{
  driver: DriverLite;
  mode: 'view' | 'create';
  onClose: () => void;
  onCreated: () => void;
  showToast: (m: string, t?: 'success' | 'error' | 'info') => void;
}> = ({ driver, mode, onClose, onCreated, showToast }) => {
  const [orders, setOrders] = useState<OrderLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [notes, setNotes] = useState('');
  const [paymentSource, setPaymentSource] = useState<'CASH' | 'BANK'>('CASH');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [settlementAmount, setSettlementAmount] = useState(0);
  const [amountTouched, setAmountTouched] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        if (mode === 'create') {
          // Only orders that are DELIVERED and not yet attached to any
          // settlement — this is what actually prevents double-settling
          // the same order.
          const res = await getUnsettledOrders(driver.id);
          setOrders(res.orders || []);
        } else {
          const list = await getDriverCompleted(driver.id);
          setOrders(list || []);
        }
      } catch {
        showToast('Could not load orders', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [driver.id, mode]); // eslint-disable-line

  const toggle = (id: number) => setSelected(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const selectedOrders = orders.filter(o => selected.has(o.id));
  const totalDeliveryCharge = selectedOrders.reduce((s, o) => s + Number(o.delivery_charge || 0), 0);

  // Auto-fill the settlement amount from the selected orders' delivery
  // charges, but stop overwriting it once the admin has typed their own
  // manual amount.
  useEffect(() => {
    if (!amountTouched) setSettlementAmount(totalDeliveryCharge);
  }, [totalDeliveryCharge, amountTouched]);

  const doCreate = async () => {
    setCreating(true);
    try {
      await createSettlement({
        driver_id: driver.id,
        order_ids: Array.from(selected),
        amount: settlementAmount,
        notes: notes.trim() || undefined,
        payment_source: paymentSource,
      });
      showToast('Settlement created', 'success');
      setConfirmOpen(false);
      onCreated();
      onClose();
    } catch (e: any) {
      showToast(e?.response?.data?.error || 'Failed to create settlement', 'error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <motion.div className="ds-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="ds-modal ds-modal-lg" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} onClick={e => e.stopPropagation()}>
        <div className="ds-modal-hdr">
          <h3>{mode === 'create' ? 'Create Settlement' : 'Delivered Orders'} — {driverFullName(driver)}</h3>
          <button onClick={onClose}><X size={16} /></button>
        </div>
        <div className="ds-modal-body">
          {loading ? (
            <div className="ds-loading-row"><Loader2 size={18} className="ds-spin" /> Loading orders…</div>
          ) : orders.length === 0 ? (
            <p className="ds-empty">{mode === 'create' ? 'No unsettled delivered orders for this driver.' : 'No delivered orders yet.'}</p>
          ) : (
            <div className="ds-table-wrap">
              <table className="ds-table">
                <thead>
                  <tr>
                    {mode === 'create' && <th></th>}
                    <th>Order #</th><th>Customer</th><th>Delivery Charge</th><th>Delivery Date</th><th>Address</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} className={mode === 'create' ? 'ds-row-click' : ''} onClick={() => mode === 'create' && toggle(o.id)}>
                      {mode === 'create' && (
                        <td onClick={e => e.stopPropagation()}>
                          <input type="checkbox" checked={selected.has(o.id)} onChange={() => toggle(o.id)} />
                        </td>
                      )}
                      <td className="ds-mono">{o.order_number}</td>
                      <td>{custName(o)}</td>
                      <td>{money(o.delivery_charge)}</td>
                      <td>{fmtDate(o.delivery_date || o.delivered_at)}</td>
                      <td className="ds-addr-cell">{addrLine(o)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {mode === 'create' && (
          <div className="ds-modal-footer ds-settlement-footer">
            <div className="ds-settlement-totals">
              <div><span>Selected Orders</span><strong>{selected.size}</strong></div>
              <div><span>Sum of Delivery Charges</span><strong>{money(totalDeliveryCharge)}</strong></div>
              <div>
                <span>Settlement Amount</span>
                <input
                  type="number"
                  className="ds-settlement-input"
                  value={settlementAmount}
                  min={0}
                  step="0.01"
                  onChange={(e) => {
                    setAmountTouched(true);
                    setSettlementAmount(Number(e.target.value));
                  }}
                />
              </div>
            </div>
            <input
              className="ds-notes-input"
              placeholder="Notes (optional)"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
            <div className="ds-payment-source">
              <label>
                <input
                  type="radio"
                  name="paymentSource"
                  value="CASH"
                  checked={paymentSource === 'CASH'}
                  onChange={() => setPaymentSource('CASH')}
                />
                Cash
              </label>
              <label>
                <input
                  type="radio"
                  name="paymentSource"
                  value="BANK"
                  checked={paymentSource === 'BANK'}
                  onChange={() => setPaymentSource('BANK')}
                />
                Bank Transfer
              </label>
            </div>
            <button
              className="ds-btn-primary"
              disabled={selected.size === 0 || settlementAmount <= 0}
              onClick={() => setConfirmOpen(true)}
            >
              Create Settlement
            </button>
          </div>
        )}
      </motion.div>

      <ConfirmDialog
        open={confirmOpen}
        title="Create settlement?"
        message={
          <>
            Create a settlement of{' '}
            <strong>{money(settlementAmount)}</strong> for{' '}
            <strong>{selected.size}</strong> order(s) to{' '}
            {driverFullName(driver)}?
          </>
        }
        confirmLabel="Create"
        loading={creating}
        onConfirm={doCreate}
        onCancel={() => setConfirmOpen(false)}
      />
    </motion.div>
  );
};

const DriverSettlementTab: React.FC<{
  drivers: DriverLite[];
  refreshKey: number;
  bumpRefresh: () => void;
  showToast: (m: string, t?: 'success' | 'error' | 'info') => void;
}> = ({ drivers, refreshKey, bumpRefresh, showToast }) => {
  const [summaries, setSummaries] = useState<Record<number, DriverSummary>>({});
  const [pickerDriver, setPickerDriver] = useState<{ driver: DriverLite; mode: 'view' | 'create' } | null>(null);

  useEffect(() => {
    drivers.forEach(async d => {
      setSummaries(prev => ({ ...prev, [d.id]: { ...(prev[d.id] || { totalOrders: 0, totalOrderAmount: 0, totalDeliveryCharge: 0, pendingAmount: 0, paidAmount: 0 }), loading: true } }));
      try {
        const [delivered, settlements] = await Promise.all([
          getDriverDeliveredOrders(d.id),
          getDriverSettlements(d.id),
        ]);
        setSummaries(prev => ({
          ...prev,
          [d.id]: {
            totalOrders: delivered?.summary?.total_orders ?? 0,
            totalOrderAmount: delivered?.summary?.total_order_amount ?? 0,
            totalDeliveryCharge: delivered?.summary?.total_delivery_charge ?? 0,
            pendingAmount: settlements?.total_pending ?? 0,
            paidAmount: settlements?.total_paid ?? 0,
            loading: false,
          },
        }));
      } catch {
        setSummaries(prev => ({ ...prev, [d.id]: { totalOrders: 0, totalOrderAmount: 0, totalDeliveryCharge: 0, pendingAmount: 0, paidAmount: 0, loading: false } }));
      }
    });
  }, [drivers, refreshKey]);

  return (
    <div className="ds-tab-panel">
      <div className="ds-driver-grid">
        {drivers.map(d => {
          const sum = summaries[d.id];
          return (
            <motion.div key={d.id} className="ds-driver-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="ds-driver-card-hdr">
                <div className="ds-driver-avatar">{(d.first_name || '?').charAt(0).toUpperCase()}</div>
                <div>
                  <p className="ds-driver-name">{driverFullName(d)}</p>
                  <p className="ds-driver-phone"><Phone size={11} /> {d.phone_no}</p>
                </div>
                <StatusPill status={d.availability_status || 'OFFLINE'} />
              </div>

              {sum?.loading || !sum ? (
                <div className="ds-card-skel"><Skeleton height={60} /></div>
              ) : (
                <div className="ds-driver-stats">
                  <div><span>Delivered Orders</span><strong>{sum.totalOrders}</strong></div>
                  <div><span>Delivery Charges</span><strong>{money(sum.totalDeliveryCharge)}</strong></div>
                  <div><span>Pending Settlement</span><strong className="ds-amber-text">{money(sum.pendingAmount)}</strong></div>
                  <div><span>Paid Settlement</span><strong className="ds-green-text">{money(sum.paidAmount)}</strong></div>
                </div>
              )}

              <div className="ds-driver-card-actions">
                <button className="ds-btn-ghost" onClick={() => setPickerDriver({ driver: d, mode: 'view' })}>
                  <Eye size={13} /> View Orders
                </button>
                <button className="ds-btn-primary" onClick={() => setPickerDriver({ driver: d, mode: 'create' })}>
                  <Wallet size={13} /> Create Settlement
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {pickerDriver && (
          <OrdersPickerModal
            driver={pickerDriver.driver}
            mode={pickerDriver.mode}
            onClose={() => setPickerDriver(null)}
            onCreated={bumpRefresh}
            showToast={showToast}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   SETTLEMENT DETAIL MODAL (shared by Tab 3 + Tab 4)
═══════════════════════════════════════════════════════════════════════ */

const SettlementDetailModal: React.FC<{
  settlementId: number;
  onClose: () => void;
  showToast: (m: string, t?: 'success' | 'error' | 'info') => void;
}> = ({ settlementId, onClose, showToast }) => {
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getSettlementDetail(settlementId);
        setDetail((res as any).settlement || res);
      } catch {
        showToast('Could not load settlement detail', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [settlementId]); // eslint-disable-line

  return (
    <motion.div className="ds-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="ds-modal ds-modal-lg" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} onClick={e => e.stopPropagation()}>
        <div className="ds-modal-hdr">
          <h3>Settlement #{settlementId}</h3>
          <button onClick={onClose}><X size={16} /></button>
        </div>
        <div className="ds-modal-body">
          {loading || !detail ? (
            <div className="ds-loading-row"><Loader2 size={18} className="ds-spin" /> Loading…</div>
          ) : (
            <>
              <div className="ds-detail-grid">
                <div><span>Driver</span><strong>{driverFullName(detail.driver)}</strong></div>
                <div><span>Phone</span><strong>{detail.driver?.phone_no || '—'}</strong></div>
                <div><span>Amount</span><strong>{money(detail.amount)}</strong></div>
                <div><span>Status</span><StatusPill status={detail.status} /></div>
                <div><span>Orders Count</span><strong>{detail.orders_count ?? (detail.orders?.length || 0)}</strong></div>
                <div><span>Created</span><strong>{fmtDateTime(detail.created_at)}</strong></div>
                <div><span>Payment Source</span><strong>{detail.payment_source || '—'}</strong></div>
                <div><span>Reference</span><strong>{detail.reference || '—'}</strong></div>
                {detail.status === 'PAID' && <div><span>Paid At</span><strong>{fmtDateTime(detail.paid_at)}</strong></div>}
              </div>

              <h4 className="ds-subheading">Orders</h4>
              <div className="ds-table-wrap">
                <table className="ds-table">
                  <thead><tr><th>Order #</th><th>Customer</th><th>Delivery Charge</th><th>Grand Total</th><th>Address</th><th>Delivered</th></tr></thead>
                  <tbody>
                    {(detail.orders || []).map((o: OrderLite) => (
                      <tr key={o.id}>
                        <td className="ds-mono">{o.order_number}</td>
                        <td>{custName(o)}</td>
                        <td>{money(o.delivery_charge)}</td>
                        <td>{money(orderAmount(o))}</td>
                        <td className="ds-addr-cell">{addrLine(o)}</td>
                        <td>{fmtDateTime(o.delivered_at)}</td>
                      </tr>
                    ))}
                    {(detail.orders || []).length === 0 && <tr><td colSpan={6} className="ds-empty">No linked orders</td></tr>}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   TAB 3 — PENDING SETTLEMENTS
═══════════════════════════════════════════════════════════════════════ */

const PendingSettlementsTab: React.FC<{
  refreshKey: number;
  bumpRefresh: () => void;
  showToast: (m: string, t?: 'success' | 'error' | 'info') => void;
}> = ({ refreshKey, bumpRefresh, showToast }) => {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewId, setViewId] = useState<number | null>(null);
  const [payTarget, setPayTarget] = useState<Settlement | null>(null);
  const [paySource, setPaySource] = useState<'CASH' | 'BANK'>('CASH');
  const [payRef, setPayRef] = useState('');
  const [paying, setPaying] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllSettlements({ status: 'PENDING' });
      setSettlements(res.settlements || []);
    } catch {
      showToast('Could not load pending settlements', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load, refreshKey]);

  const { page, setPage, totalPages, slice } = usePaged(settlements, 10);

  const doMarkPaid = async () => {
    if (!payTarget) return;
    setPaying(true);
    try {
      await markSettlementPaid(payTarget.id, { payment_source: paySource, reference: payRef.trim() || undefined });
      showToast('Settlement marked as paid', 'success');
      setPayTarget(null);
      setPayRef('');
      bumpRefresh();
      load();
    } catch (e: any) {
      showToast(e?.response?.data?.error || 'Failed to mark as paid', 'error');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="ds-tab-panel">
      <div className="ds-table-wrap">
        <table className="ds-table">
          <thead>
            <tr><th>ID</th><th>Driver</th><th>Phone</th><th>Orders</th><th>Amount</th><th>Created</th><th>Source</th><th>Reference</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <tr key={i}>{Array.from({ length: 9 }).map((_, j) => <td key={j}><Skeleton /></td>)}</tr>)
            ) : slice.length === 0 ? (
              <tr><td colSpan={9} className="ds-empty">No pending settlements</td></tr>
            ) : slice.map(s => (
              <tr key={s.id}>
                <td className="ds-mono">#{s.id}</td>
                <td>{driverFullName(s.driver)}</td>
                <td>{s.driver?.phone_no || '—'}</td>
                <td>{s.orders_count}</td>
                <td>{money(s.amount)}</td>
                <td>{fmtDateTime(s.created_at)}</td>
                <td>{s.payment_source}</td>
                <td>{s.reference || '—'}</td>
                <td className="ds-actions-cell">
                  <button className="ds-icon-btn" onClick={() => setViewId(s.id)} title="View"><Eye size={14} /></button>
                  <button className="ds-btn-mini-primary" onClick={() => setPayTarget(s)}>Mark Paid</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      <AnimatePresence>
        {viewId !== null && <SettlementDetailModal settlementId={viewId} onClose={() => setViewId(null)} showToast={showToast} />}
      </AnimatePresence>

      <ConfirmDialog
        open={!!payTarget}
        title="Mark settlement as paid?"
        message={
          <div className="ds-pay-form">
            <p>Settlement <strong>#{payTarget?.id}</strong> for <strong>{driverFullName(payTarget?.driver)}</strong> — {money(payTarget?.amount)}</p>
            <label>Payment Source</label>
            <select value={paySource} onChange={e => setPaySource(e.target.value as 'CASH' | 'BANK')}>
              <option value="CASH">Cash</option>
              <option value="BANK">Bank Transfer</option>
            </select>
            <label>Reference</label>
            <input value={payRef} onChange={e => setPayRef(e.target.value)} placeholder="TXN001 (optional)" />
          </div>
        }
        confirmLabel="Mark Paid"
        loading={paying}
        onConfirm={doMarkPaid}
        onCancel={() => setPayTarget(null)}
      />
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   TAB 4 — PAID SETTLEMENTS
═══════════════════════════════════════════════════════════════════════ */

const PaidSettlementsTab: React.FC<{
  refreshKey: number;
  showToast: (m: string, t?: 'success' | 'error' | 'info') => void;
}> = ({ refreshKey, showToast }) => {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewId, setViewId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getAllSettlements({ status: 'PAID' });
        setSettlements(res.settlements || []);
      } catch {
        showToast('Could not load paid settlements', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshKey, showToast]);

  const { page, setPage, totalPages, slice } = usePaged(settlements, 10);

  return (
    <div className="ds-tab-panel">
      <div className="ds-table-wrap">
        <table className="ds-table">
          <thead>
            <tr><th>ID</th><th>Driver</th><th>Orders</th><th>Amount</th><th>Paid Date</th><th>Paid By</th><th>Source</th><th>Reference</th><th></th></tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <tr key={i}>{Array.from({ length: 9 }).map((_, j) => <td key={j}><Skeleton /></td>)}</tr>)
            ) : slice.length === 0 ? (
              <tr><td colSpan={9} className="ds-empty">No paid settlements yet</td></tr>
            ) : slice.map(s => (
              <tr key={s.id}>
                <td className="ds-mono">#{s.id}</td>
                <td>{driverFullName(s.driver)}</td>
                <td>{s.orders_count}</td>
                <td>{money(s.amount)}</td>
                <td>{fmtDateTime(s.paid_at)}</td>
                <td>{s.paid_by ?? '—'}</td>
                <td>{s.payment_source}</td>
                <td>{s.reference || '—'}</td>
                <td className="ds-actions-cell">
                  <button className="ds-icon-btn" onClick={() => setViewId(s.id)} title="View"><Eye size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      <AnimatePresence>
        {viewId !== null && <SettlementDetailModal settlementId={viewId} onClose={() => setViewId(null)} showToast={showToast} />}
      </AnimatePresence>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   TAB 5 — DRIVER HISTORY
═══════════════════════════════════════════════════════════════════════ */

const DriverHistoryTab: React.FC<{
  drivers: DriverLite[];
  showToast: (m: string, t?: 'success' | 'error' | 'info') => void;
}> = ({ drivers, showToast }) => {
  const [selectedId, setSelectedId] = useState<number | ''>(drivers[0]?.id ?? '');
  const [dashboard, setDashboard] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [completed, setCompleted] = useState<OrderLite[]>([]);
  const [settlementHistory, setSettlementHistory] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (drivers.length && selectedId === '') setSelectedId(drivers[0].id); }, [drivers]); // eslint-disable-line

  useEffect(() => {
    if (selectedId === '') return;
    (async () => {
      setLoading(true);
      try {
        const [dash, rep, comp, settl] = await Promise.all([
          getDriverDashboard(selectedId),
          getDriverReport(selectedId),
          getDriverCompleted(selectedId),
          getDriverSettlements(selectedId),
        ]);
        setDashboard(dash);
        setReport(rep);
        setCompleted(comp || []);
        setSettlementHistory(settl.settlements || []);
      } catch {
        showToast('Could not load driver history', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedId]); // eslint-disable-line

  const weekly = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = new Array(7).fill(0);
    completed.forEach(o => {
      if (o.delivered_at) counts[new Date(o.delivered_at).getDay()] += 1;
    });
    const max = Math.max(1, ...counts);
    return days.map((label, i) => ({ label, count: counts[i], pct: (counts[i] / max) * 100 }));
  }, [completed]);

  const avgDeliveryMinutes = useMemo(() => {
    const durations = completed
      .filter(o => o.created_at && o.delivered_at)
      .map(o => (new Date(o.delivered_at as string).getTime() - new Date(o.created_at as string).getTime()) / 60000)
      .filter(m => m > 0 && m < 60 * 24 * 7);
    if (!durations.length) return null;
    return durations.reduce((s, m) => s + m, 0) / durations.length;
  }, [completed]);

  const driver = drivers.find(d => d.id === selectedId);

  return (
    <div className="ds-tab-panel">
      <div className="ds-filter" style={{ marginBottom: 16 }}>
        <label>Driver</label>
        <select value={selectedId} onChange={e => setSelectedId(Number(e.target.value))}>
          {drivers.map(d => <option key={d.id} value={d.id}>{driverFullName(d)}</option>)}
        </select>
      </div>

      {loading ? (
        <Skeleton height={220} />
      ) : !dashboard ? (
        <p className="ds-empty">Select a driver to view history</p>
      ) : (
        <>
          <div className="ds-history-hdr">
            <div className="ds-driver-avatar ds-avatar-lg">{(driver?.first_name || '?').charAt(0).toUpperCase()}</div>
            <div>
              <p className="ds-driver-name" style={{ fontSize: 18 }}>{driverFullName(driver)}</p>
              <p className="ds-driver-phone"><Phone size={12} /> {driver?.phone_no}</p>
              <div className="ds-rating-row">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill={i < Math.round(dashboard.rating || 0) ? '#d4b483' : 'none'} color="#d4b483" />
                ))}
                <span>({Number(dashboard.rating || 0).toFixed(1)})</span>
              </div>
            </div>
          </div>

          <div className="ds-history-stats">
            <div className="ds-stat-card"><Package size={16} /><span>Total Deliveries</span><strong>{dashboard.delivered}</strong></div>
            <div className="ds-stat-card"><FileText size={16} /><span>Total Settlements</span><strong>{settlementHistory.length}</strong></div>
            <div className="ds-stat-card"><Wallet size={16} /><span>Total Earnings</span><strong>{money(dashboard.total_earned)}</strong></div>
            <div className="ds-stat-card"><Clock size={16} /><span>Avg. Delivery Time</span><strong>{avgDeliveryMinutes ? `${Math.round(avgDeliveryMinutes)} min` : '—'}</strong></div>
          </div>

          <div className="ds-history-grid">
            <div className="ds-panel">
              <h4 className="ds-subheading">Deliveries by Day</h4>
              <div className="ds-bar-chart">
                {weekly.map(w => (
                  <div key={w.label} className="ds-bar-col">
                    <div className="ds-bar" style={{ height: `${Math.max(4, w.pct)}%` }} title={`${w.count}`} />
                    <span>{w.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="ds-panel">
              <h4 className="ds-subheading">Order Breakdown</h4>
              <div className="ds-breakdown-rows">
                <div><span>Delivered</span><strong>{report?.delivered ?? 0}</strong></div>
                <div><span>In Progress</span><strong>{report?.in_progress ?? 0}</strong></div>
                <div><span>Cancelled</span><strong>{report?.cancelled ?? 0}</strong></div>
                <div><span>Total</span><strong>{report?.total ?? 0}</strong></div>
              </div>
            </div>
          </div>

          <h4 className="ds-subheading">Settlement History</h4>
          <div className="ds-table-wrap">
            <table className="ds-table">
              <thead><tr><th>ID</th><th>Amount</th><th>Orders</th><th>Status</th><th>Created</th><th>Paid</th></tr></thead>
              <tbody>
                {settlementHistory.length === 0 ? (
                  <tr><td colSpan={6} className="ds-empty">No settlements yet</td></tr>
                ) : settlementHistory.map(s => (
                  <tr key={s.id}>
                    <td className="ds-mono">#{s.id}</td>
                    <td>{money(s.amount)}</td>
                    <td>{s.orders_count}</td>
                    <td><StatusPill status={s.status} /></td>
                    <td>{fmtDateTime(s.created_at)}</td>
                    <td>{s.status === 'PAID' ? fmtDateTime(s.paid_at) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h4 className="ds-subheading">Completed Orders</h4>
          <div className="ds-table-wrap">
            <table className="ds-table">
              <thead><tr><th>Order #</th><th>Customer</th><th>Amount</th><th>Delivered</th><th>Settlement</th></tr></thead>
              <tbody>
                {completed.length === 0 ? (
                  <tr><td colSpan={5} className="ds-empty">No completed orders yet</td></tr>
                ) : completed.slice(0, 20).map(o => (
                  <tr key={o.id}>
                    <td className="ds-mono">{o.order_number}</td>
                    <td>{custName(o)}</td>
                    <td>{money(orderAmount(o))}</td>
                    <td>{fmtDateTime(o.delivered_at)}</td>
                    <td><StatusPill status={o.is_driver_settled ? 'SETTLED' : 'PENDING'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════════ */

const TABS: { key: TabKey; label: string }[] = [
  { key: 'delivered', label: 'Delivered Orders' },
  { key: 'settlement', label: 'Driver Settlement' },
  { key: 'pending', label: 'Pending Settlements' },
  { key: 'paid', label: 'Paid Settlements' },
  { key: 'history', label: 'Driver History' },
];

const DriverSettlementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('delivered');
  const [drivers, setDrivers] = useState<DriverLite[]>([]);
  const [driversLoading, setDriversLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'info' as 'success' | 'error' | 'info' });

  const showToast = useCallback((msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ show: true, msg, type });
  }, []);

  const bumpRefresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    (async () => {
      setDriversLoading(true);
      try {
        const list = await getDrivers();
        setDrivers(list || []);
      } catch {
        showToast('Could not load drivers', 'error');
      } finally {
        setDriversLoading(false);
      }
    })();
  }, [showToast]);

  const driversMap = useMemo(() => {
    const m: Record<number, DriverLite> = {};
    drivers.forEach(d => { m[d.id] = d; });
    return m;
  }, [drivers]);

  return (
    <div className="ds-root">
      <Toast msg={toast.msg} show={toast.show} type={toast.type} onClose={() => setToast(t => ({ ...t, show: false }))} />

      <div className="ds-page-hdr">
        <div>
          <h1>Driver Settlement</h1>
          <p>Manage delivered orders, driver payouts, and settlement history.</p>
        </div>
      </div>

      <div className="ds-tabs">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`ds-tab-btn ${activeTab === t.key ? 'active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {driversLoading ? (
        <div className="ds-tab-panel"><Skeleton height={200} /></div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            {activeTab === 'delivered' && <DeliveredOrdersTab drivers={drivers} driversMap={driversMap} showToast={showToast} />}
            {activeTab === 'settlement' && <DriverSettlementTab drivers={drivers} refreshKey={refreshKey} bumpRefresh={bumpRefresh} showToast={showToast} />}
            {activeTab === 'pending' && <PendingSettlementsTab refreshKey={refreshKey} bumpRefresh={bumpRefresh} showToast={showToast} />}
            {activeTab === 'paid' && <PaidSettlementsTab refreshKey={refreshKey} showToast={showToast} />}
            {activeTab === 'history' && <DriverHistoryTab drivers={drivers} showToast={showToast} />}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default DriverSettlementPage;