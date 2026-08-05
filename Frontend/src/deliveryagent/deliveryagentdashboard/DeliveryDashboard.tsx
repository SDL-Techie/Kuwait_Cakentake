import React, { useEffect, useState, useCallback, useMemo } from 'react';
import './DeliveryDashboard.css';
import {
  Package, Truck, CheckCircle2, Clock, RefreshCw, Eye,
  Loader2, Inbox, Timer, BadgeCheck, AlertCircle, XCircle,
  CalendarClock, ChevronRight, User as UserIcon,
} from 'lucide-react';

import {
  getDeliveryPending,
  getDeliveryAssigned,
  getDeliveryReady,
  getDeliveryProofPending,
  getDeliveryDelivered,
  getAgentDashboard,
  getAgentOrders,
  getDeliverySlots,
  DeliverySlot,
} from '../../services/deliveryService';

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────── */
const getAgent = () => {
  try { return JSON.parse(localStorage.getItem('user') || '{}'); }
  catch { return {}; }
};

const getAgentId = (): number => {
  const direct = localStorage.getItem('userId');
  if (direct) return Number(direct);
  const u = getAgent();
  return u?.id ?? 0;
};

const money = (n: any) => {
  const v = Number(n || 0);
  return `$${v.toFixed(2)}`;
};

const orderCode = (o: any) =>
  o?.order_number || o?.code || `ORD-${o?.id ?? '—'}`;

const customerName = (o: any) =>
  o?.customer_name || o?.customer?.name || o?.user?.name ||
  [o?.customer?.first_name, o?.customer?.last_name].filter(Boolean).join(' ') ||
  'Guest';

const itemCount = (o: any) =>
  o?.item_count ?? o?.items?.length ?? o?.order_items?.length ?? 0;

const orderTotal = (o: any) =>
  o?.total_amount ?? o?.total ?? o?.grand_total ?? 0;

const orderAddress = (o: any) => {
  // If delivery_address is an object, extract address parts
  if (typeof o?.delivery_address === 'object' && o?.delivery_address) {
    const addr = o.delivery_address;
    return [addr.building, addr.street, addr.area?.name || addr.area]
      .filter(Boolean).join(', ') || '';
  }
  // If delivery_address is a string, return it
  if (typeof o?.delivery_address === 'string') return o.delivery_address;
  // Fallback to other formats
  return [o?.address?.street, o?.address?.city].filter(Boolean).join(', ') || o?.address_text || '';
};

/* ─────────────────────────────────────────
   TAB CONFIG
───────────────────────────────────── */
type TabKey = 'pending' | 'assigned' | 'ready' | 'proof' | 'delivered';

const TABS: { key: TabKey; label: string; icon: React.ReactNode; emptyLabel: string }[] = [
  { key: 'pending', label: 'Pending Pickup', icon: <Inbox size={13} />, emptyLabel: 'No orders waiting for pickup right now.' },
  { key: 'assigned', label: 'Assigned to Me', icon: <UserIcon size={13} />, emptyLabel: 'Nothing assigned to you at the moment.' },
  { key: 'ready', label: 'Out for Delivery', icon: <Truck size={13} />, emptyLabel: 'No orders currently on the road.' },
  { key: 'proof', label: 'Proof Pending', icon: <Timer size={13} />, emptyLabel: 'No delivery proofs waiting for review.' },
  { key: 'delivered', label: 'Delivered', icon: <BadgeCheck size={13} />, emptyLabel: 'No completed deliveries yet.' },
];

/** Maps a raw backend status string to a display label + badge tone */
const STATUS_MAP: Record<string, { label: string; tone: string }> = {
  READY: { label: 'Pending', tone: 'amber' },
  ASSIGNED_TO_AGENT: { label: 'Assigned', tone: 'blue' },
  ASSIGNED_TO_DRIVER: { label: 'Driver Set', tone: 'purple' },
  DRIVER_ACCEPTED: { label: 'Accepted', tone: 'purple' },
  OUT_FOR_DELIVERY: { label: 'On the Way', tone: 'purple' },
  DELIVERY_SUBMITTED: { label: 'Proof Pending', tone: 'amber' },
  DELIVERED: { label: 'Delivered', tone: 'green' },
  CANCELLED: { label: 'Cancelled', tone: 'red' },
};

const StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
  const meta = STATUS_MAP[(status || '').toUpperCase()] || { label: status || 'Unknown', tone: 'grey' };
  return <span className={`dd-badge dd-badge-${meta.tone}`}>{meta.label}</span>;
};

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────── */
const DeliveryDashboard: React.FC = () => {
  const agent = getAgent();
  const agentId = getAgentId();
  const agentName = agent?.first_name || agent?.name || 'Agent';

  const [activeTab, setActiveTab] = useState<TabKey>('pending');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [lists, setLists] = useState<Record<TabKey, any[]>>({
    pending: [],
    assigned: [],
    ready: [],
    proof: [],
    delivered: [],
  });

  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [allOrdersCount, setAllOrdersCount] = useState<number | null>(null);
  const [slots, setSlots] = useState<DeliverySlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);

  /* ── Load everything ── */
  const loadAll = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      const [pending, assigned, ready, proof, delivered] = await Promise.all([
        getDeliveryPending(),
        getDeliveryAssigned(),
        getDeliveryReady(),
        getDeliveryProofPending(),
        getDeliveryDelivered(),
      ]);
      setLists({ pending, assigned, ready, proof, delivered });
    } catch {
      setError('Could not load your delivery queue. Pull to refresh to try again.');
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  }, []);

  const loadSidePanels = useCallback(async () => {
    if (agentId) {
      try {
        const stats = await getAgentDashboard(agentId);
        setDashboardStats(stats);
      } catch { /* non-fatal, panel just shows a fallback */ }

      try {
        const orders = await getAgentOrders(agentId);
        setAllOrdersCount(orders?.length ?? null);
      } catch { /* non-fatal */ }
    }

    setSlotsLoading(true);
    try {
      const s = await getDeliverySlots();
      setSlots(s ?? []);
    } catch { /* non-fatal */ }
    finally { setSlotsLoading(false); }
  }, [agentId]);

  useEffect(() => {
    loadAll();
    loadSidePanels();
  }, [loadAll, loadSidePanels]);

  const handleRefresh = () => {
    loadAll(true);
    loadSidePanels();
  };

  /* ── Derived stat cards ── */
  const stats = useMemo(() => ([
    {
      key: 'pending',
      label: 'Pending Pickup',
      value: lists.pending.length,
      sub: 'Ready at the kitchen',
      icon: <Inbox size={16} />,
      highlight: true,
    },
    {
      key: 'assigned',
      label: 'Assigned to Me',
      value: lists.assigned.length,
      sub: 'Awaiting driver dispatch',
      icon: <UserIcon size={16} />,
    },
    {
      key: 'ready',
      label: 'Out for Delivery',
      value: lists.ready.length,
      sub: 'Currently on the road',
      icon: <Truck size={16} />,
    },
    {
      key: 'delivered',
      label: 'Delivered',
      value: lists.delivered.length,
      sub: 'Completed successfully',
      icon: <BadgeCheck size={16} />,
    },
  ]), [lists]);

  const activeList = lists[activeTab];
  const activeTabMeta = TABS.find(t => t.key === activeTab)!;

  /* ── Recent activity (latest across delivered + proof pending) ── */
  const recentActivity = useMemo(() => {
    const combined = [...lists.proof, ...lists.delivered];
    return combined.slice(0, 5);
  }, [lists.proof, lists.delivered]);

  return (
    <div className="dd-root">
      {/* ── Header ── */}
      <div className="dd-topbar">
        <div>
          <p className="dd-eyebrow">Delivery Agent</p>
          <h1 className="dd-title">Welcome back, {agentName}</h1>
        </div>
        <button className="dd-refresh-btn" onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? <Loader2 size={14} className="dd-spin" /> : <RefreshCw size={14} />}
          Refresh
        </button>
      </div>

      {error && (
        <div className="dd-error-banner">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* ── Stat cards ── */}
      <div className="dd-stats-grid">
        {stats.map(s => (
          <div key={s.key} className={`dd-stat-card ${s.highlight ? 'dd-stat-highlight' : ''}`}>
            <div className="dd-stat-top">
              <span className="dd-stat-label">{s.label}</span>
              <span className="dd-stat-icon">{s.icon}</span>
            </div>
            <div className="dd-stat-value">
              {loading ? <Loader2 size={18} className="dd-spin" /> : s.value}
            </div>
            <span className="dd-stat-sub">{s.sub}</span>
          </div>
        ))}
      </div>

      {/* ── Main grid ── */}
      <div className="dd-main-grid">

        {/* Left: order queue with tabs */}
        <div className="dd-panel dd-panel-wide">
          <div className="dd-panel-hdr">
            <div>
              <h3>My Delivery Queue</h3>
              <p className="dd-panel-sub">Track orders through pickup, dispatch and delivery</p>
            </div>
          </div>

          <div className="dd-tabs">
            {TABS.map(t => (
              <button
                key={t.key}
                className={`dd-tab ${activeTab === t.key ? 'active' : ''}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.icon}
                {t.label}
                <span className="dd-tab-count">{lists[t.key].length}</span>
              </button>
            ))}
          </div>

          <div className="dd-order-list">
            {loading ? (
              <div className="dd-loading-block">
                <Loader2 size={20} className="dd-spin" />
                <span>Loading orders…</span>
              </div>
            ) : activeList.length === 0 ? (
              <div className="dd-empty-block">
                <Package size={26} />
                <p>{activeTabMeta.emptyLabel}</p>
              </div>
            ) : (
              activeList.map((o, idx) => (
                <div key={o.id ?? idx} className="dd-order-row">
                  <div className="dd-order-main">
                    <span className="dd-order-code">{orderCode(o)}</span>
                    <span className="dd-order-cust">{customerName(o)}</span>
                    {orderAddress(o) && (
                      <span className="dd-order-addr">{orderAddress(o)}</span>
                    )}
                  </div>
                  <div className="dd-order-meta">
                    <span className="dd-order-items">{itemCount(o)} item{itemCount(o) === 1 ? '' : 's'}</span>
                    <span className="dd-order-total">{money(orderTotal(o))}</span>
                  </div>
                  <StatusBadge status={o.status} />
                  <button className="dd-view-btn" title="View order">
                    <Eye size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: delivery slots */}
        <div className="dd-panel dd-panel-narrow">
          <div className="dd-panel-hdr">
            <div>
              <h3>Delivery Slots</h3>
              <p className="dd-panel-sub">Active windows for scheduled drops</p>
            </div>
          </div>

          <div className="dd-slot-list">
            {slotsLoading ? (
              <div className="dd-loading-block">
                <Loader2 size={18} className="dd-spin" />
                <span>Loading slots…</span>
              </div>
            ) : slots.length === 0 ? (
              <div className="dd-empty-block dd-empty-block-sm">
                <CalendarClock size={22} />
                <p>No delivery slots configured.</p>
              </div>
            ) : (
              slots.map(s => (
                <div key={s.id} className="dd-slot-row">
                  <div className="dd-slot-time-box">
                    <Clock size={12} />
                  </div>
                  <div className="dd-slot-info">
                    <span className="dd-slot-label">{s.label}</span>
                    <span className="dd-slot-range">{s.start_time} – {s.end_time}</span>
                  </div>
                  <span className={`dd-badge ${s.is_active ? 'dd-badge-green' : 'dd-badge-grey'}`}>
                    {s.is_active ? 'Active' : 'Paused'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom grid ── */}
      <div className="dd-main-grid dd-main-grid-bottom">

        {/* Recent activity */}
        <div className="dd-panel dd-panel-wide">
          <div className="dd-panel-hdr">
            <div>
              <h3>Recent Activity</h3>
              <p className="dd-panel-sub">Latest proof submissions and completed drops</p>
            </div>
            <span className="dd-live-pill"><span className="dd-live-dot" /> Live</span>
          </div>

          <div className="dd-activity-list">
            {loading ? (
              <div className="dd-loading-block">
                <Loader2 size={18} className="dd-spin" />
                <span>Loading activity…</span>
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="dd-empty-block dd-empty-block-sm">
                <Timer size={22} />
                <p>No recent activity to show.</p>
              </div>
            ) : (
              recentActivity.map((o, idx) => (
                <div key={o.id ?? idx} className="dd-activity-row">
                  <div className="dd-activity-left">
                    <span className="dd-order-code">{orderCode(o)}</span>
                    <span className="dd-activity-sub">{itemCount(o)} items · {customerName(o)}</span>
                  </div>
                  <span className="dd-activity-total">{money(orderTotal(o))}</span>
                  <StatusBadge status={o.status} />
                  <ChevronRight size={13} className="dd-activity-chevron" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Agent snapshot */}
        <div className="dd-panel dd-panel-narrow">
          <div className="dd-panel-hdr">
            <div>
              <h3>Agent Snapshot</h3>
              <p className="dd-panel-sub">Your all-time delivery record</p>
            </div>
          </div>

          <div className="dd-snapshot">
            <div className="dd-snapshot-row">
              <span className="dd-snapshot-label">All-time orders</span>
              <span className="dd-snapshot-value">
                {allOrdersCount === null ? '—' : allOrdersCount}
              </span>
            </div>
            <div className="dd-snapshot-row">
              <span className="dd-snapshot-label">Delivered (current)</span>
              <span className="dd-snapshot-value">{lists.delivered.length}</span>
            </div>
            <div className="dd-snapshot-row">
              <span className="dd-snapshot-label">Awaiting proof review</span>
              <span className="dd-snapshot-value">{lists.proof.length}</span>
            </div>

            {dashboardStats && typeof dashboardStats === 'object' && (
              <div className="dd-snapshot-extra">
                {Object.entries(dashboardStats)
                  .filter(([k, v]) => typeof v !== 'object' && !Array.isArray(v))
                  .slice(0, 4)
                  .map(([k, v]) => (
                    <div className="dd-snapshot-row" key={k}>
                      <span className="dd-snapshot-label">
                        {k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                      <span className="dd-snapshot-value">{String(v)}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;






