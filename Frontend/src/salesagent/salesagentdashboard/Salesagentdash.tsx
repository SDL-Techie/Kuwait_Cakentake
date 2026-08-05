import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import {
  ClipboardList, Clock, CheckCircle2, XCircle, Plus, ArrowRight,
  Sparkles, Wallet, Send, RefreshCcw, AlertTriangle, ShoppingBag,
} from 'lucide-react';

import {
  getSalesAgentDashboard,
  sendPaymentLink,
  SalesAgentOrder,
  SalesAgentDashboardStats,
} from '../../services/Salesagentservice';

import './Salesagentdash.css';

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────── */

const getUser = (): { id: number; name?: string; first_name?: string } => {
  try { return JSON.parse(localStorage.getItem('user') || '{}'); }
  catch { return { id: 0 }; }
};

const currency = (n: number, code = 'INR') => {
  const symbols: Record<string, string> = { INR: '₹', USD: '$', AED: 'AED ', KWD: 'KWD ' };
  return `${symbols[code] ?? code + ' '}${n.toFixed(2)}`;
};

const timeAgo = (iso: string) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

/** Animates a number counting up to `value` once it mounts / value changes. */
const Counter: React.FC<{ value: number; duration?: number }> = ({ value, duration = 900 }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <>{display}</>;
};

/* ─────────────────────────────────────────
   SKELETON
───────────────────────────────────── */

const SkeletonCard: React.FC = () => (
  <div className="sad-card sad-skel">
    <div className="sad-skel-line sad-skel-w40" />
    <div className="sad-skel-line sad-skel-w60 sad-skel-tall" />
    <div className="sad-skel-line sad-skel-w80" />
  </div>
);

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────── */

const STATUS_COLORS: Record<string, string> = {
  Pending: '#ff9800',
  Confirmed: '#4caf50',
  Cancelled: '#f44336',
};

const Salesagentdash: React.FC = () => {
  const navigate = useNavigate();
  const user = getUser();
  const displayName = user.first_name || user.name || 'Agent';

  const [stats, setStats] = useState<SalesAgentDashboardStats | null>(null);
  const [orders, setOrders] = useState<SalesAgentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendingLinkId, setSendingLinkId] = useState<number | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const data = await getSalesAgentDashboard(user.id);
      setStats(data.stats);
      setOrders(data.orders);
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || 'Could not load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user.id]);

  useEffect(() => { load(); }, [load]);

  const today = useMemo(
    () => new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
    []
  );

  const pieData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'Pending', value: stats.pendingOrders },
      { name: 'Confirmed', value: stats.confirmedOrders },
      { name: 'Cancelled', value: stats.cancelledOrders },
    ].filter(d => d.value > 0);
  }, [stats]);

  const monthlyBarData = useMemo(() => {
    const buckets: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString('en-US', { month: 'short' });
      buckets[key] = 0;
    }
    orders.forEach(o => {
      const d = new Date(o.created_at);
      const key = d.toLocaleDateString('en-US', { month: 'short' });
      if (key in buckets) buckets[key]++;
    });
    return Object.entries(buckets).map(([month, orders]) => ({ month, orders }));
  }, [orders]);

  const paymentPending = useMemo(
    () => orders
      .filter(o => o.payment_method === 'UPI' && o.payment_status === 'PENDING')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [orders]
  );

  const handleSendLink = async (order: SalesAgentOrder) => {
    setSendingLinkId(order.id);
    try {
      await sendPaymentLink(order.id);
      toast.success(`Payment link sent for ${order.order_number}`);
      await load(true);
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Could not send payment link');
    } finally {
      setSendingLinkId(null);
    }
  };

  /* ── Error state ── */
  if (error && !loading) {
    return (
      <div className="sad-root">
        <div className="sad-error-state">
          <AlertTriangle size={40} />
          <h3>Couldn't load your dashboard</h3>
          <p>{error}</p>
          <button className="sad-btn sad-btn-primary" onClick={() => load()}>
            <RefreshCcw size={14} /> Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sad-root">
      <Toaster position="top-right" toastOptions={{
        style: { fontFamily: 'Inter, sans-serif', fontSize: 13.5 },
      }} />

      {/* ── Header ── */}
      <header className="sad-header">
        <div className="sad-header-left">
          <span className="sad-header-icon"><Sparkles size={18} /></span>
          <div>
            <h1>Sales Agent Dashboard</h1>
            <p className="sad-header-sub">{today} · Welcome back, {displayName}</p>
          </div>
        </div>
        <motion.button
          className="sad-btn sad-btn-ghost sad-header-refresh"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          disabled={refreshing || loading}
          onClick={() => load(true)}
          title="Refresh dashboard"
        >
          <RefreshCcw size={14} className={refreshing ? 'sad-spin' : ''} /> Refresh
        </motion.button>
      </header>

      {/* ── Top 4 cards ── */}
      <section className="sad-top-grid">
        {loading || !stats ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <motion.div
              className="sad-card sad-action-card"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.02 }}
              whileHover={{ y: -3 }}
            >
              <span className="sad-card-icon sad-icon-accent"><ShoppingBag size={18} /></span>
              <h3>Create Order</h3>
              <p className="sad-card-desc">Create, edit and delete orders</p>
              <motion.button
                className="sad-btn sad-btn-primary sad-card-btn"
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/admin/salescreateorder')}
              >
                Create Order <ArrowRight size={13} />
              </motion.button>
            </motion.div>

            <motion.div
              className="sad-card"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
              whileHover={{ y: -3 }}
            >
              <span className="sad-card-icon sad-icon-pending"><Clock size={18} /></span>
              <h3>Pending Orders</h3>
              <p className="sad-card-count"><Counter value={stats.pendingOrders} /></p>
              <p className="sad-card-desc">Orders created by you waiting for confirmation</p>
              <button className="sad-btn sad-btn-ghost sad-card-btn" onClick={() => navigate('/admin/salesorder')}>
                View Orders <ArrowRight size={13} />
              </button>
            </motion.div>

            <motion.div
              className="sad-card"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
              whileHover={{ y: -3 }}
            >
              <span className="sad-card-icon sad-icon-success"><CheckCircle2 size={18} /></span>
              <div className="sad-card-hdr-row">
                <h3>Confirmed Orders</h3>
                <span className="sad-badge sad-badge-success">Confirmed</span>
              </div>
              <div className="sad-mini-stats">
                <div><strong><Counter value={stats.confirmedToday} /></strong><span>Today</span></div>
                <div><strong><Counter value={stats.confirmedWeek} /></strong><span>Week</span></div>
                <div><strong><Counter value={stats.confirmedMonth} /></strong><span>Month</span></div>
              </div>
            </motion.div>

            <motion.div
              className="sad-card"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              whileHover={{ y: -3 }}
            >
              <span className="sad-card-icon sad-icon-cancel"><XCircle size={18} /></span>
              <h3>Cancelled Orders</h3>
              <p className="sad-card-count sad-count-cancel"><Counter value={stats.cancelledOrders} /></p>
              <p className="sad-card-desc">Total cancelled orders you've created</p>
            </motion.div>
          </>
        )}
      </section>

      {/* ── Stat strip ── */}
      <section className="sad-strip">
        {loading || !stats ? (
          <div className="sad-strip-skel" />
        ) : (
          [
            { label: 'Total Orders', value: stats.totalOrders, icon: <ClipboardList size={14} /> },
            { label: 'Pending', value: stats.pendingOrders, icon: <Clock size={14} /> },
            { label: 'Confirmed', value: stats.confirmedOrders, icon: <CheckCircle2 size={14} /> },
            { label: 'Cancelled', value: stats.cancelledOrders, icon: <XCircle size={14} /> },
            { label: "Today's Orders", value: stats.todayOrders, icon: <Sparkles size={14} /> },
            { label: 'This Week', value: stats.weekOrders, icon: <Sparkles size={14} /> },
            { label: 'This Month', value: stats.monthOrders, icon: <Sparkles size={14} /> },
            { label: 'Payment Pending', value: stats.pendingPaymentOrders, icon: <Wallet size={14} /> },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              className="sad-strip-item"
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.03 * i }}
            >
              <span className="sad-strip-icon">{s.icon}</span>
              <div>
                <strong><Counter value={s.value} /></strong>
                <span>{s.label}</span>
              </div>
            </motion.div>
          ))
        )}
      </section>

      {/* ── Charts ── */}
      <section className="sad-chart-grid">
        <motion.div className="sad-card sad-chart-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h3>Order Status Distribution</h3>
          {loading ? (
            <div className="sad-chart-skel" />
          ) : pieData.length === 0 ? (
            <p className="sad-empty-inline">No orders yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={80} paddingAngle={3}>
                  {pieData.map((d) => (
                    <Cell key={d.name} fill={STATUS_COLORS[d.name]} />
                  ))}
                </Pie>
                <RTooltip contentStyle={{ borderRadius: 8, border: '1px solid #d9d9d9', fontSize: 12.5 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="sad-legend">
            {Object.entries(STATUS_COLORS).map(([k, c]) => (
              <span key={k} className="sad-legend-item"><i style={{ background: c }} />{k}</span>
            ))}
          </div>
        </motion.div>

        <motion.div className="sad-card sad-chart-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h3>Orders by Month</h3>
          {loading ? (
            <div className="sad-chart-skel" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyBarData}>
                <CartesianGrid vertical={false} stroke="#eef0e8" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#2d2d2d' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#8a8a8a' }} axisLine={false} tickLine={false} width={26} />
                <RTooltip contentStyle={{ borderRadius: 8, border: '1px solid #d9d9d9', fontSize: 12.5 }} cursor={{ fill: '#f4f6ef' }} />
                <Bar dataKey="orders" fill="#c9d8b2" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </section>

      {/* ── Payment collection ── */}
      <section className="sad-card sad-payment-card">
        <div className="sad-payment-hdr">
          <div>
            <h3>Order Payment</h3>
            <p className="sad-card-desc">
              Orders awaiting payment. Cash collection is disabled for sales agents —
              send a UPI payment link instead; once paid, the order shows a PAID stamp.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="sad-payment-skel">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="sad-skel-line sad-skel-tall" />)}
          </div>
        ) : paymentPending.length === 0 ? (
          <div className="sad-empty-block">
            <Wallet size={28} />
            <p>No orders are waiting on payment right now</p>
          </div>
        ) : (
          <div className="sad-payment-list">
            <AnimatePresence>
              {paymentPending.map(o => (
                <motion.div
                  key={o.id}
                  className="sad-payment-row"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  layout
                >
                  <div className="sad-payment-cust">
                    <span className="sad-avatar">
                      {(o.customer_name || o.customer?.name || 'C').charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <p className="sad-payment-name">{o.customer_name || o.customer?.name || 'Customer'}</p>
                      <p className="sad-payment-sub">{o.order_number} · {timeAgo(o.created_at)}</p>
                    </div>
                  </div>
                  <div className="sad-payment-amt">{currency(o.grand_total, o.currency)}</div>
                  <span className="sad-badge sad-badge-pending">Payment Pending</span>
                  <motion.button
                    className="sad-btn sad-btn-primary sad-payment-send"
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    disabled={sendingLinkId === o.id}
                    onClick={() => handleSendLink(o)}
                  >
                    {sendingLinkId === o.id
                      ? <span className="sad-spinner" />
                      : <><Send size={13} /> Send Payment Link</>}
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>
  );
};

export default Salesagentdash;