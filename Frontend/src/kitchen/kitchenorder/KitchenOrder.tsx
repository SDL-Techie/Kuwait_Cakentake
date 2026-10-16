import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  CalendarDays,
  Cake,
  Check,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  CreditCard,
  ExternalLink,
  Eye,
  Flame,
  Loader2,
  Package,
  Printer,
  RefreshCw,
  ShoppingBag,
  Truck,
  User,
  Users,
  X,
} from 'lucide-react';
import './KitchenOrder.css';
import './KitchenBoard.css';
import { AdminDataToolbar, useAdminDataTools } from '../../services/Useadmindatatools';
import {
  getKitchenBoard,
  getKitchenOrderDetails,
  startProcessing,
  completeKitchenOrder,
  completePickupOrder,
  type KitchenBoardTab,
} from '../../services/kitchenService';
import { createPaymentLink } from '../../services/paymentService';
import { getKuwaitTodayStr, formatKuwaitTime } from '../../utils/kuwaitTime';
import { OrderProducts, OrderNotesBlock, OrderReceiptModal, printOrderReceipt } from '../../components/OrderView';
import { formatOrderDate, formatOrderMoney, paymentLabel, toOrderView } from '../../utils/orderView';

/* ==========================================================================
   Kitchen Orders — client correction list (Oct 2026)

   Tabs
     • Pending    — orders sent to the kitchen and not yet started.
     • Active     — orders being prepared   (Me / All) for the selected date.
     • Completed  — orders the kitchen finished (Me / All) for the selected date.

   Everything works on the DELIVERY date (pickup date for pickup orders).
   The tab count is always the number of orders listed, so "Pending 6"
   can never show only 2 orders again.
   ========================================================================== */

type Scope = 'mine' | 'all';

const TAB_META: Record<KitchenBoardTab, { label: string; hint: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', hint: 'Placed orders the kitchen has not started yet', icon: <Clock size={15} /> },
  processing: { label: 'Active', hint: 'Orders being prepared right now', icon: <Flame size={15} /> },
  completed: { label: 'Completed', hint: 'Orders the kitchen has finished', icon: <Check size={15} /> },
};

const addDays = (isoDate: string, days: number): string => {
  const d = new Date(`${isoDate}T00:00:00`);
  d.setDate(d.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const relativeDayLabel = (isoDate?: string): { label: string; tone: 'today' | 'tomorrow' | 'overdue' | 'future' | 'none' } => {
  if (!isoDate) return { label: 'No date', tone: 'none' };
  const today = getKuwaitTodayStr();
  if (isoDate === today) return { label: 'Today', tone: 'today' };
  if (isoDate === addDays(today, 1)) return { label: 'Tomorrow', tone: 'tomorrow' };
  if (isoDate < today) return { label: `Overdue · ${formatOrderDate(isoDate)}`, tone: 'overdue' };
  return { label: formatOrderDate(isoDate), tone: 'future' };
};

const currentUserId = (): number | null => {
  try {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    const id = Number(u?.id ?? localStorage.getItem('user_id'));
    return Number.isFinite(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
};

const originOf = (o: any): 'agent' | 'sales' | 'pickup' | 'delivery' => {
  const source = String(o?.order_source ?? '').toUpperCase();
  const role = String(o?.created_by?.role ?? '').toUpperCase();
  if (source === 'AGENT' || role === 'AGENT' || o?.order_type === 'agent_order') return 'agent';
  if (source === 'SALES_AGENT' || role === 'SALES_AGENT' || source === 'SHOP_MANAGER') return 'sales';
  if (String(o?.delivery_method ?? '').toUpperCase() === 'PICKUP') return 'pickup';
  return 'delivery';
};

const statusLabel = (status: string): string =>
  ({
    ASSIGNED_TO_KITCHEN: 'Waiting for kitchen',
    PREPARING: 'Preparing',
    READY: 'Ready for dispatch',
    PICKUP_READY: 'Ready for pickup',
    ASSIGNED_TO_AGENT: 'With delivery agent',
    ASSIGNED_TO_DRIVER: 'Driver assigned',
    DRIVER_ACCEPTED: 'Driver accepted',
    OUT_FOR_DELIVERY: 'Out for delivery',
    DELIVERY_SUBMITTED: 'Proof submitted',
    DELIVERED: 'Delivered',
  } as Record<string, string>)[status] ?? status.replace(/_/g, ' ').toLowerCase();

const KitchenOrder: React.FC = () => {
  const me = useMemo(currentUserId, []);
  const [tab, setTab] = useState<KitchenBoardTab>('pending');
  const [scope, setScope] = useState<Scope>('all');
  const [date, setDate] = useState<string>(getKuwaitTodayStr());
  const [pendingAllDates, setPendingAllDates] = useState(true);

  const [orders, setOrders] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<KitchenBoardTab, number | null>>({ pending: null, processing: null, completed: null });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [detailsOrder, setDetailsOrder] = useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<any | null>(null);
  const [pickupPay, setPickupPay] = useState<Record<number, string>>({});

  const [payOrder, setPayOrder] = useState<any | null>(null);
  const [payLink, setPayLink] = useState<string | null>(null);
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [payCopied, setPayCopied] = useState(false);

  // The date only filters Pending when "All dates" is switched off.
  const dateFor = useCallback(
    (t: KitchenBoardTab) => (t === 'pending' && pendingAllDates ? null : date),
    [date, pendingAllDates]
  );
  const mineFor = (t: KitchenBoardTab) => t !== 'pending' && scope === 'mine';

  const load = useCallback(
    async (silent = false) => {
      if (silent) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        const tabs: KitchenBoardTab[] = ['pending', 'processing', 'completed'];
        const results = await Promise.all(
          tabs.map((t) => getKitchenBoard(t, { date: dateFor(t), mine: mineFor(t) }).catch(() => null))
        );
        const nextCounts = { pending: null, processing: null, completed: null } as Record<KitchenBoardTab, number | null>;
        tabs.forEach((t, i) => {
          nextCounts[t] = results[i] ? results[i]!.length : null;
        });
        setCounts(nextCounts);
        const current = results[tabs.indexOf(tab)];
        if (current === null) setError('Could not load kitchen orders. Please refresh.');
        setOrders(current ?? []);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tab, scope, date, pendingAllDates]
  );

  useEffect(() => {
    load();
  }, [load]);

  // Gentle auto-refresh so new kitchen orders appear without reloading.
  useEffect(() => {
    const id = window.setInterval(() => load(true), 60000);
    return () => window.clearInterval(id);
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const tools = useAdminDataTools<any>({
    data: orders,
    title: `Kitchen · ${TAB_META[tab].label}`,
    storageKey: 'kitchen-board',
    fields: { date: false },
    phoneKeys: ['customer_phone'],
    orderKeys: ['order_number', 'id'],
    columns: [
      { header: 'Order #', key: 'order_number' },
      { header: 'Status', key: 'status' },
      { header: 'Method', key: 'delivery_method' },
      { header: 'Scheduled date', key: 'scheduled_date' },
      { header: 'Time slot', key: 'scheduled_time_slot' },
      { header: 'Customer', key: 'customer_name' },
      { header: 'Phone', key: 'customer_phone' },
      {
        header: 'Products',
        value: (o: any) =>
          toOrderView(o)
            .lines.map((l) => `${l.quantity}× ${l.name}${l.size ? ` (${l.size})` : ''}`)
            .join(', '),
      },
      { header: 'Writing', key: 'cake_message' },
      { header: 'Kitchen staff', value: (o: any) => o?.kitchen_staff?.name ?? '' },
    ],
  });
  const visible = tools.filtered;

  // ── Actions ──
  const runAction = async (orderId: number, action: () => Promise<any>, success: string) => {
    setBusyId(orderId);
    setError(null);
    try {
      await action();
      setToast(success);
      await load(true);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.response?.data?.message || 'Action failed. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const openDetails = async (order: any) => {
    setDetailsOrder(order);
    setDetailsLoading(true);
    try {
      const fresh = await getKitchenOrderDetails(Number(order.id));
      if (fresh) setDetailsOrder(fresh);
    } catch {
      /* keep the list copy */
    } finally {
      setDetailsLoading(false);
    }
  };

  const openPaymentLink = async (order: any) => {
    setPayOrder(order);
    setPayLink(null);
    setPayError(null);
    setPayCopied(false);
    setPayLoading(true);
    try {
      const result = await createPaymentLink(Number(order.id));
      if (result?.success === false) setPayError(result?.error || 'Unable to generate payment link.');
      else if (result?.payment_url) setPayLink(result.payment_url);
      else setPayError('Payment link was not returned by the server.');
    } catch (err: any) {
      setPayError(err?.response?.data?.error || 'Failed to generate payment link.');
    } finally {
      setPayLoading(false);
    }
  };

  const copyPaymentLink = async () => {
    if (!payLink) return;
    try {
      await navigator.clipboard.writeText(payLink);
      setPayCopied(true);
      window.setTimeout(() => setPayCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  const isMine = (o: any) =>
    me != null && (Number(o?.preparation_started_by?.id ?? o?.preparation_started_by) === me || Number(o?.kitchen_staff_id) === me);

  // ── Render helpers ──
  const renderPrimaryAction = (o: any) => {
    const id = Number(o.id);
    const busy = busyId === id;
    const status = String(o.status || '').toUpperCase();
    const pickup = String(o.delivery_method || '').toUpperCase() === 'PICKUP';

    if (status === 'ASSIGNED_TO_KITCHEN') {
      return (
        <button className="kb-btn kb-btn--primary" disabled={busy} onClick={() => runAction(id, () => startProcessing(id), `Order #${o.order_number} — preparation started`)}>
          {busy ? <Loader2 size={15} className="kb-spin" /> : <Flame size={15} />} Start Preparation
        </button>
      );
    }
    if (status === 'PREPARING') {
      if (!isMine(o)) {
        return (
          <span className="kb-chip kb-chip--muted">
            <User size={13} /> {o?.kitchen_staff?.name || o?.preparation_started_by?.name || 'Another staff member'}
          </span>
        );
      }
      return (
        <button className="kb-btn kb-btn--success" disabled={busy} onClick={() => runAction(id, () => completeKitchenOrder(id), `Order #${o.order_number} marked ready`)}>
          {busy ? <Loader2 size={15} className="kb-spin" /> : <Check size={15} />} Mark Ready
        </button>
      );
    }
    if (pickup && ['PICKUP_READY', 'READY', 'ASSIGNED_TO_AGENT'].includes(status)) {
      const method = pickupPay[id] || (o.payment_status === 'PAID' ? o.payment_method || 'COD' : 'COD');
      return (
        <div className="kb-pickup-action">
          {o.payment_status !== 'PAID' && (
            <select value={method} onChange={(e) => setPickupPay((p) => ({ ...p, [id]: e.target.value }))} aria-label="Payment collected by">
              <option value="COD">Cash</option>
              <option value="KNET">KNET</option>
              <option value="LINK">Payment link</option>
              {o.payment_method === 'CREDIT' && <option value="CREDIT">Credit</option>}
            </select>
          )}
          <button className="kb-btn kb-btn--success" disabled={busy} onClick={() => runAction(id, () => completePickupOrder(id, method), `Order #${o.order_number} collected`)}>
            {busy ? <Loader2 size={15} className="kb-spin" /> : <ShoppingBag size={15} />} Collected
          </button>
        </div>
      );
    }
    return (
      <span className="kb-chip kb-chip--done">
        <Check size={13} /> {statusLabel(status)}
      </span>
    );
  };

  const groupedPending = useMemo(() => {
    if (tab !== 'pending' || !pendingAllDates) return null;
    const groups: { key: string; items: any[] }[] = [];
    visible.forEach((o) => {
      const key = o.scheduled_date || '';
      const g = groups.find((x) => x.key === key);
      if (g) g.items.push(o);
      else groups.push({ key, items: [o] });
    });
    return groups;
  }, [visible, tab, pendingAllDates]);

  const renderCard = (o: any, idx: number) => {
    const v = toOrderView(o);
    const origin = originOf(o);
    const rel = relativeDayLabel(v.scheduledDate);
    const showPay = v.isPickup && o.payment_status !== 'PAID' && o.payment_method !== 'CREDIT';
    return (
      <motion.article
        key={o.id}
        layout
        className={`kb-card kb-card--${origin}`}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.25) }}
      >
        <header className="kb-card-head">
          <div>
            <h3>Order #{v.number}</h3>
            <span className="kb-card-sub">
              <Clock size={12} /> Placed {formatKuwaitTime(o.created_at)}
            </span>
          </div>
          <span className={`kb-status kb-status--${String(o.status || '').toLowerCase()}`}>{statusLabel(String(o.status || ''))}</span>
        </header>

        <div className="kb-badges">
          <span className={`kb-day kb-day--${rel.tone}`}>
            <CalendarDays size={12} /> {rel.label}
            {v.scheduledSlot ? ` · ${v.scheduledSlot}` : ''}
          </span>
          <span className="kb-method">
            {v.isPickup ? <ShoppingBag size={12} /> : <Truck size={12} />} {v.isPickup ? 'Pickup' : 'Delivery'}
          </span>
          {o.has_custom_cake && (
            <span className="kb-custom">
              <Cake size={12} /> Custom cake
            </span>
          )}
        </div>

        <ul className="kb-lines">
          {v.lines.slice(0, 4).map((l) => (
            <li key={l.key}>
              <span className="kb-qty">×{l.quantity}</span>
              <span className="kb-line-name">{l.name}</span>
              {l.size && <span className="kb-size">{l.size}</span>}
              {l.flavour && <span className="kb-flavour">{l.flavour}</span>}
            </li>
          ))}
          {v.lines.length > 4 && <li className="kb-more">+{v.lines.length - 4} more</li>}
          {v.lines.length === 0 && <li className="kb-more">No products</li>}
        </ul>

        {v.cakeMessage && (
          <p className="kb-writing" title={v.cakeMessage}>
            ✍︎ “{v.cakeMessage}”
          </p>
        )}
        {v.orderNotes && <p className="kb-order-notes">Note: {v.orderNotes}</p>}

        {tab !== 'pending' && (o?.kitchen_staff?.name || o?.preparation_started_by?.name) && (
          <p className="kb-staff">
            <ChefHat size={13} /> {o?.kitchen_staff?.name || o?.preparation_started_by?.name}
            {isMine(o) && <span className="kb-me">You</span>}
          </p>
        )}

        <footer className="kb-card-foot">
          <div className="kb-icon-row">
            <button className="kb-icon" title="Order details" onClick={() => openDetails(o)}>
              <Eye size={16} />
            </button>
            <button className="kb-icon" title="Print receipt" onClick={() => setReceiptOrder(o)}>
              <Printer size={16} />
            </button>
            {showPay && (
              <button className="kb-icon" title="Payment link" onClick={() => openPaymentLink(o)}>
                <CreditCard size={16} />
              </button>
            )}
          </div>
          {renderPrimaryAction(o)}
        </footer>
      </motion.article>
    );
  };

  const dateRel = relativeDayLabel(date);
  const showDateNav = tab !== 'pending' || !pendingAllDates;

  return (
    <div className="kb-root">
      <AnimatePresence>
        {toast && (
          <motion.div className="kb-toast" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Check size={15} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <header className="kb-header">
        <div className="kb-header-text">
          <span className="kb-eyebrow">
            <ChefHat size={14} /> Kitchen
          </span>
          <h1>Kitchen Orders</h1>
          <p>Work through orders by delivery date — start, prepare and finish every cake on time.</p>
        </div>
        <button className={`kb-refresh ${refreshing ? 'is-spinning' : ''}`} onClick={() => load(true)} title="Refresh">
          <RefreshCw size={16} /> Refresh
        </button>
      </header>

      {/* ── Tabs ── */}
      <nav className="kb-tabs" role="tablist">
        {(Object.keys(TAB_META) as KitchenBoardTab[]).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={`kb-tab ${tab === t ? 'is-active' : ''}`} onClick={() => setTab(t)}>
            {tab === t && <motion.span layoutId="kb-tab-pill" className="kb-tab-pill" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
            <span className="kb-tab-label">
              {TAB_META[t].icon} {TAB_META[t].label}
              <span className="kb-tab-count">{counts[t] ?? '–'}</span>
            </span>
          </button>
        ))}
      </nav>

      {/* ── Controls ── */}
      <section className="kb-controls">
        <div className="kb-controls-left">
          <p className="kb-hint">{TAB_META[tab].hint}</p>
          {tab !== 'pending' ? (
            <div className="kb-scope" role="group" aria-label="Whose orders">
              <button className={scope === 'mine' ? 'is-active' : ''} onClick={() => setScope('mine')}>
                <User size={14} /> Me
              </button>
              <button className={scope === 'all' ? 'is-active' : ''} onClick={() => setScope('all')}>
                <Users size={14} /> All
              </button>
            </div>
          ) : (
            <label className="kb-switch">
              <input type="checkbox" checked={pendingAllDates} onChange={(e) => setPendingAllDates(e.target.checked)} />
              <span className="kb-switch-track" />
              All delivery dates
            </label>
          )}
        </div>

        {showDateNav && (
          <div className="kb-datenav">
            <button className="kb-datenav-btn" onClick={() => setDate((d) => addDays(d, -1))} aria-label="Previous day">
              <ChevronLeft size={16} />
            </button>
            <label className="kb-datenav-current">
              <CalendarDays size={15} />
              <span>
                <strong>{dateRel.tone === 'today' || dateRel.tone === 'tomorrow' ? dateRel.label : formatOrderDate(date)}</strong>
                <small>Delivery date</small>
              </span>
              <input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} aria-label="Pick delivery date" />
            </label>
            <button className="kb-datenav-btn" onClick={() => setDate((d) => addDays(d, 1))} aria-label="Next day">
              <ChevronRight size={16} />
            </button>
            {date !== getKuwaitTodayStr() && (
              <button className="kb-today" onClick={() => setDate(getKuwaitTodayStr())}>
                Today
              </button>
            )}
          </div>
        )}
      </section>

      <AdminDataToolbar tools={tools} compact hideImport />

      <div className="kb-legend">
        <span><i className="kb-dot kb-dot--delivery" /> Delivery order</span>
        <span><i className="kb-dot kb-dot--pickup" /> Pickup order</span>
        <span><i className="kb-dot kb-dot--agent" /> Agent order</span>
        <span><i className="kb-dot kb-dot--sales" /> Sales staff order</span>
      </div>

      {error && (
        <div className="kb-error">
          {error}
          <button onClick={() => setError(null)} aria-label="Dismiss">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Board ── */}
      {loading ? (
        <div className="kb-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="kb-card kb-skeleton" key={i} />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <motion.div className="kb-empty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Package size={46} />
          <h3>No orders here</h3>
          <p>
            {tab === 'pending'
              ? pendingAllDates
                ? 'Nothing is waiting for the kitchen right now.'
                : `Nothing is waiting for ${formatOrderDate(date)}.`
              : `No ${TAB_META[tab].label.toLowerCase()} orders ${scope === 'mine' ? 'of yours ' : ''}for ${formatOrderDate(date)}.`}
          </p>
        </motion.div>
      ) : groupedPending ? (
        groupedPending.map((g) => {
          const rel = relativeDayLabel(g.key || undefined);
          return (
            <section className="kb-group" key={g.key || 'none'}>
              <h2 className={`kb-group-title kb-group-title--${rel.tone}`}>
                <CalendarDays size={15} /> {rel.label}
                <span>{g.items.length}</span>
              </h2>
              <div className="kb-grid">
                <AnimatePresence>{g.items.map((o, i) => renderCard(o, i))}</AnimatePresence>
              </div>
            </section>
          );
        })
      ) : (
        <div className="kb-grid">
          <AnimatePresence>{visible.map((o, i) => renderCard(o, i))}</AnimatePresence>
        </div>
      )}

      {/* ── Details modal ── */}
      <AnimatePresence>
        {detailsOrder && (
          <motion.div className="kb-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDetailsOrder(null)}>
            <motion.div
              className="kb-modal"
              initial={{ opacity: 0, y: 26, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 26, scale: 0.97 }}
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const v = toOrderView(detailsOrder);
                return (
                  <>
                    <div className="kb-modal-head">
                      <div>
                        <h3>Order #{v.number}</h3>
                        <span className={`kb-status kb-status--${String(detailsOrder.status || '').toLowerCase()}`}>
                          {statusLabel(String(detailsOrder.status || ''))}
                        </span>
                        {detailsLoading && <Loader2 size={14} className="kb-spin" />}
                      </div>
                      <button className="kb-icon" onClick={() => setDetailsOrder(null)} aria-label="Close">
                        <X size={16} />
                      </button>
                    </div>
                    <div className="kb-modal-body">
                      <div className="kb-detail-grid">
                        <div>
                          <span>{v.isPickup ? 'Pickup date' : 'Delivery date'}</span>
                          <strong>
                            {formatOrderDate(v.scheduledDate)}
                            {v.scheduledSlot ? ` · ${v.scheduledSlot}` : ''}
                          </strong>
                        </div>
                        <div>
                          <span>Method</span>
                          <strong>{v.isPickup ? 'Pickup' : 'Delivery'}</strong>
                        </div>
                        <div>
                          <span>Customer</span>
                          <strong>{v.customerName}</strong>
                        </div>
                        <div>
                          <span>Phone</span>
                          <strong>{v.customerPhone || '—'}</strong>
                        </div>
                        {!v.isPickup && (
                          <>
                            <div>
                              <span>Area</span>
                              <strong>{v.areaName || '—'}</strong>
                            </div>
                            <div className="is-wide">
                              <span>Address</span>
                              <strong>{v.addressText || '—'}</strong>
                            </div>
                          </>
                        )}
                        <div>
                          <span>Payment</span>
                          <strong>
                            {paymentLabel(v.paymentMethod)} {v.paymentStatus ? `· ${v.paymentStatus}` : ''}
                          </strong>
                        </div>
                        <div>
                          <span>Total</span>
                          <strong>{formatOrderMoney(v.total, v.currency)}</strong>
                        </div>
                      </div>

                      <OrderProducts view={v} />
                      <OrderNotesBlock view={v} />
                    </div>
                    <div className="kb-modal-foot">
                      <button className="kb-btn" onClick={() => printOrderReceipt(detailsOrder) || setReceiptOrder(detailsOrder)}>
                        <Printer size={15} /> Print receipt
                      </button>
                      {renderPrimaryAction(detailsOrder)}
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <OrderReceiptModal open={!!receiptOrder} order={receiptOrder} onClose={() => setReceiptOrder(null)} />

      {/* ── Payment link modal ── */}
      <AnimatePresence>
        {payOrder && (
          <motion.div className="kb-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPayOrder(null)}>
            <motion.div className="kb-modal kb-modal--sm" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} onClick={(e) => e.stopPropagation()}>
              <div className="kb-modal-head">
                <h3>Payment link · #{payOrder.order_number}</h3>
                <button className="kb-icon" onClick={() => setPayOrder(null)} aria-label="Close">
                  <X size={16} />
                </button>
              </div>
              <div className="kb-modal-body kb-pay-body">
                {payLoading && (
                  <p className="kb-hint">
                    <Loader2 size={15} className="kb-spin" /> Generating link…
                  </p>
                )}
                {payError && <div className="kb-error">{payError}</div>}
                {payLink && (
                  <>
                    <div className="kb-qr">
                      <QRCodeSVG value={payLink} size={190} />
                    </div>
                    <p className="kb-hint">Ask the customer to scan, or share the link.</p>
                    <div className="kb-pay-actions">
                      <button className="kb-btn" onClick={copyPaymentLink}>
                        {payCopied ? <Check size={15} /> : <Copy size={15} />} {payCopied ? 'Copied' : 'Copy link'}
                      </button>
                      <a className="kb-btn kb-btn--primary" href={payLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink size={15} /> Open
                      </a>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KitchenOrder;
