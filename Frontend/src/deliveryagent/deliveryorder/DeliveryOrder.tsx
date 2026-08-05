import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './DeliveryOrder.css';

// ─── Service imports ─────────────────────────────────────────────────────────
// All URLs come from delivery_routes.py and order_routes.py
import {
  getDeliveryPending,       // GET  /delivery/pending         → READY orders (kitchen done, agent not yet assigned)
  getDeliveryAssigned,      // GET  /delivery/assigned        → ASSIGNED_TO_AGENT orders
  getDeliveryReady,         // GET  /delivery/ready-for-pickup→ ASSIGNED_TO_DRIVER | DRIVER_ACCEPTED | OUT_FOR_DELIVERY
  getDeliveryProofPending,  // GET  /delivery/proof-pending   → DELIVERY_SUBMITTED (driver sent proof)
  getDeliveryDelivered,     // GET  /delivery/delivered       → DELIVERED orders
} from '../../services/deliveryService';

import {
  assignDriverToOrder,      // POST /orders/:id/assign-driver    { driver_id } → ASSIGNED_TO_DRIVER
  markOrderDelivered,       // POST /orders/:id/confirm-delivery                → DELIVERED
} from '../../services/orderService';

import {
  getAvailableDrivers,      // GET  /drivers/available
  getDrivers,               // GET  /drivers
} from '../../services/driverService';

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IconTruck = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="2" />
    <path d="M16 8h4l3 3v5h-7V8z" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);
const IconClock = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconCheckCircle = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const IconUser = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const IconMapPin = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const IconPackage = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);
const IconRefresh = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);
const IconX = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconPhone = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.88a16 16 0 0 0 6.21 6.21l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const IconSearch = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconStar = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const IconEye = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const IconAlert = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const IconImage = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Tab keys mapped to the backend delivery_routes.py endpoints:
 *
 *  'pending'        → GET /delivery/pending          (status = READY, kitchen done, unassigned)
 *  'assigned'       → GET /delivery/assigned         (status = ASSIGNED_TO_AGENT)
 *  'driver_active'  → GET /delivery/ready-for-pickup (status = ASSIGNED_TO_DRIVER | DRIVER_ACCEPTED | OUT_FOR_DELIVERY)
 *  'proof_pending'  → GET /delivery/proof-pending    (status = DELIVERY_SUBMITTED)
 *  'delivered'      → GET /delivery/delivered        (status = DELIVERED)
 *  'all'            → all of the above merged
 */
type TabType = 'all' | 'pending' | 'assigned' | 'driver_active' | 'proof_pending' | 'delivered';

// ─── Status helpers ───────────────────────────────────────────────────────────

// Backend status → pill CSS class
const statusPillClass = (s: string): string => {
  switch ((s || '').toUpperCase()) {
    case 'READY':               return 'pill-ready';
    case 'ASSIGNED_TO_AGENT':   return 'pill-assigned';
    case 'ASSIGNED_TO_DRIVER':  return 'pill-assigned';
    case 'DRIVER_ACCEPTED':     return 'pill-onway';
    case 'OUT_FOR_DELIVERY':    return 'pill-onway';
    case 'DELIVERY_SUBMITTED':  return 'pill-proof';
    case 'DELIVERED':           return 'pill-delivered';
    case 'CANCELLED':           return 'pill-cancelled';
    default:                    return 'pill-default';
  }
};

// Human-readable label for each backend status
const statusLabel = (s: string): string => {
  switch ((s || '').toUpperCase()) {
    case 'READY':               return 'Ready';
    case 'ASSIGNED_TO_AGENT':   return 'Agent Assigned';
    case 'ASSIGNED_TO_DRIVER':  return 'Driver Assigned';
    case 'DRIVER_ACCEPTED':     return 'Out for Delivery';
    case 'OUT_FOR_DELIVERY':    return 'Out for Delivery';
    case 'DELIVERY_SUBMITTED':  return 'Proof Submitted';
    case 'DELIVERED':           return 'Delivered';
    default:                    return (s || '').replace(/_/g, ' ');
  }
};

// Driver availability chip class
const driverStatusClass = (s: string): string => {
  const st = (s || '').toUpperCase();
  if (st === 'ONLINE' || st === 'AVAILABLE') return 'ds-available';
  if (st === 'BUSY')                         return 'ds-busy';
  return 'ds-offline';
};

const driverStatusLabel = (s: string): string => {
  const st = (s || '').toUpperCase();
  if (st === 'ONLINE' || st === 'AVAILABLE') return 'Available';
  if (st === 'BUSY')                         return 'Busy';
  return 'Offline';
};

// ─── Formatters ───────────────────────────────────────────────────────────────

const fmtTime = (dt: string) =>
  dt ? new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—';
const fmtDate = (dt: string) =>
  dt ? new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—';

const currencySymbol = (cur?: string) => {
  const c = cur || (typeof window !== 'undefined' ? localStorage.getItem('currency') || 'INR' : 'INR');
  return c === 'INR' ? '₹' : c;
};

const fmtCurrency = (n: number | undefined, cur?: string) => `${currencySymbol(cur)}${Number(n || 0).toFixed(0)}`;

// Safely render a value that may be a string, number, or object coming from the API.
// If it's an object, prefer common display fields (name, first_name, full_name) before falling
// back to a JSON string so React never receives a raw object as a child.
const renderValue = (v: any) => {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string' || typeof v === 'number') return String(v);
  if (typeof v === 'object') {
    return (
      v.name || v.title || v.first_name || v.firstName || v.full_name || v.email || JSON.stringify(v)
    );
  }
  return String(v);
};

// ─── Component ────────────────────────────────────────────────────────────────

const DeliveryOrder: React.FC = () => {

  // ── State ──────────────────────────────────────────────────────────────────

  const [activeTab,        setActiveTab]        = useState<TabType>('all');

  // Order buckets — one per backend endpoint
  const [pendingOrders,      setPendingOrders]      = useState<any[]>([]);  // READY
  const [assignedOrders,     setAssignedOrders]     = useState<any[]>([]);  // ASSIGNED_TO_AGENT
  const [driverActiveOrders, setDriverActiveOrders] = useState<any[]>([]);  // ASSIGNED_TO_DRIVER | DRIVER_ACCEPTED | OUT_FOR_DELIVERY
  const [proofOrders,        setProofOrders]        = useState<any[]>([]);  // DELIVERY_SUBMITTED
  const [deliveredOrders,    setDeliveredOrders]    = useState<any[]>([]);  // DELIVERED

  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error,         setError]         = useState<string | null>(null);
  const [successMsg,    setSuccessMsg]    = useState<string | null>(null);

  // Order detail modal
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [modalOpen,     setModalOpen]     = useState(false);

  // Driver assignment modal
  const [driverModalOpen,   setDriverModalOpen]   = useState(false);
  const [assignTargetOrder, setAssignTargetOrder] = useState<any | null>(null);
  const [drivers,           setDrivers]           = useState<any[]>([]);
  const [filteredDrivers,   setFilteredDrivers]   = useState<any[]>([]);
  const [driverLoading,     setDriverLoading]     = useState(false);
  const [assigningDriver,   setAssigningDriver]   = useState<number | null>(null);
  const [driverSearch,      setDriverSearch]      = useState('');
  const [assignSuccess,     setAssignSuccess]     = useState<string | null>(null);

  // Confirm-delivery modal
  const [confirmModalOpen,  setConfirmModalOpen]  = useState(false);
  const [confirmTarget,     setConfirmTarget]     = useState<any | null>(null);

  // ── Fetch all buckets concurrently ────────────────────────────────────────



  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else         setRefreshing(true);
    setError(null);
    try {
      const [pending, assigned, driverActive, proof, delivered] = await Promise.all([
        getDeliveryPending().catch(() => []),
        getDeliveryAssigned().catch(() => []),
        getDeliveryReady().catch(() => []),
        getDeliveryProofPending().catch(() => []),
        getDeliveryDelivered().catch(() => []),
      ]);
      setPendingOrders(pending);
      setAssignedOrders(assigned);
      setDriverActiveOrders(driverActive);
      setProofOrders(proof);
      setDeliveredOrders(delivered);
    } catch (err) {
      console.error('Delivery fetch error', err);
      setError('Failed to load orders. Please refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  

  // ── Driver search filter ──────────────────────────────────────────────────

  useEffect(() => {
    if (!driverSearch.trim()) { setFilteredDrivers(drivers); return; }
    const q = driverSearch.toLowerCase();
    setFilteredDrivers(drivers.filter(d => {
      const name  = `${d.first_name || d.name || ''} ${d.last_name || ''}`.toLowerCase();
      const phone = (d.phone_no || '').toLowerCase();
      return name.includes(q) || phone.includes(q);
    }));
  }, [driverSearch, drivers]);


  
  // ── Derived data ──────────────────────────────────────────────────────────

  const allOrders = useMemo(() =>
    // Combine buckets and deduplicate by `id` to avoid rendering duplicate keys
    (() => {
      const combined = [...pendingOrders, ...assignedOrders, ...driverActiveOrders, ...proofOrders, ...deliveredOrders];
      const byId = new Map<number | string, any>();
      for (const o of combined) {
        const key = o?.id ?? Math.random();
        if (!byId.has(key)) {
          byId.set(key, o);
        } else {
          // keep the newest by created_at
          const existing = byId.get(key);
          try {
            const exTime = existing?.created_at ? new Date(existing.created_at).getTime() : 0;
            const newTime = o?.created_at ? new Date(o.created_at).getTime() : 0;
            if (newTime > exTime) byId.set(key, o);
          } catch (e) {
            // fallback: overwrite
            byId.set(key, o);
          }
        }
      }
      return Array.from(byId.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    })(),
    [pendingOrders, assignedOrders, driverActiveOrders, proofOrders, deliveredOrders]
  );

  const visibleOrders = useMemo(() => {
    switch (activeTab) {
      case 'pending':       return pendingOrders;
      case 'assigned':      return assignedOrders;
      case 'driver_active': return driverActiveOrders;
      case 'proof_pending': return proofOrders;
      case 'delivered':     return deliveredOrders;
      default:              return allOrders;
    }
  }, [activeTab, pendingOrders, assignedOrders, driverActiveOrders, proofOrders, deliveredOrders, allOrders]);

  // ── Success toast helper ──────────────────────────────────────────────────

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // ── Open driver assignment modal ──────────────────────────────────────────
  // Called when delivery agent wants to assign a driver to an ASSIGNED_TO_AGENT order.
  // Loads /drivers/available first; falls back to /drivers.

  const handleOpenAssign = async (order: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setAssignTargetOrder(order);
    setDriverModalOpen(true);
    setDriverLoading(true);
    setDriverSearch('');
    setAssignSuccess(null);
    setError(null);
    try {
      let list: any[] = await getAvailableDrivers().catch(() => []);
      if (!list || list.length === 0) {
        list = await getDrivers().catch(() => []);
      }
      setDrivers(list);
      setFilteredDrivers(list);
    } catch {
      setDrivers([]);
      setFilteredDrivers([]);
    } finally {
      setDriverLoading(false);
    }
  };

  // ── Assign driver ─────────────────────────────────────────────────────────
  // POST /orders/:id/assign-driver  { driver_id }
  // Backend: requires status = ASSIGNED_TO_AGENT or ASSIGNED_TO_DRIVER (re-assign)
  // → sets status = ASSIGNED_TO_DRIVER

  const handleAssignDriver = async (driver: any) => {
    if (!assignTargetOrder || assigningDriver !== null) return;
    setAssigningDriver(driver.id);
    setError(null);
    try {
      await assignDriverToOrder(Number(assignTargetOrder.id), Number(driver.id));
      const driverName = `${driver.first_name || driver.name || 'Driver'} ${driver.last_name || ''}`.trim();
      setAssignSuccess(`Order #${assignTargetOrder.order_number || assignTargetOrder.id} assigned to ${driverName}`);
      await fetchAll(true);
      setTimeout(() => {
        setDriverModalOpen(false);
        setAssignTargetOrder(null);
        setAssignSuccess(null);
      }, 1800);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to assign driver. Please try again.');
    } finally {
      setAssigningDriver(null);
    }
  };

  // ── Confirm delivery ──────────────────────────────────────────────────────
  // POST /orders/:id/confirm-delivery
  // Backend: requires status = DELIVERY_SUBMITTED (driver sent proof)
  // → sets status = DELIVERED

  const handleConfirmDelivery = async () => {
    if (!confirmTarget) return;
    setActionLoading(confirmTarget.id);
    setError(null);
    try {
      await markOrderDelivered(confirmTarget.id);
      showSuccess(`Order #${confirmTarget.order_number || confirmTarget.id} confirmed as delivered!`);
      setConfirmModalOpen(false);
      setConfirmTarget(null);
      if (modalOpen && selectedOrder?.id === confirmTarget.id) setModalOpen(false);
      await fetchAll(true);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to confirm delivery.');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Render action buttons per order status ────────────────────────────────

  const renderActionBtn = (order: any, fromModal = false) => {
    const status    = (order.status || '').toUpperCase();
    const isLoading = actionLoading === order.id;

    // ASSIGNED_TO_AGENT → delivery agent picks a driver
    if (status === 'ASSIGNED_TO_AGENT') {
      return (
        <button
          className="da-action-primary bg-assign"
          disabled={isLoading}
          onClick={e => { e.stopPropagation(); handleOpenAssign(order); }}
        >
          <IconTruck size={13} /> Assign Driver
        </button>
      );
    }

    // ASSIGNED_TO_DRIVER → can re-assign (driver hasn't accepted yet)
    if (status === 'ASSIGNED_TO_DRIVER') {
      return (
        <div className={`da-action-group ${fromModal ? 'da-action-group-modal' : ''}`}>
          <button
            className="da-action-secondary bg-reassign"
            disabled={isLoading}
            onClick={e => { e.stopPropagation(); handleOpenAssign(order); }}
          >
            <IconTruck size={13} /> Re-assign
          </button>
          <span className="da-waiting-chip">Awaiting driver acceptance</span>
        </div>
      );
    }

    // DRIVER_ACCEPTED / OUT_FOR_DELIVERY → read-only, driver is en route
    if (status === 'DRIVER_ACCEPTED' || status === 'OUT_FOR_DELIVERY') {
      return (
        <span className="da-info-chip">
          <IconTruck size={12} /> Driver en route
        </span>
      );
    }

    // DELIVERY_SUBMITTED → delivery agent reviews proof and confirms
    if (status === 'DELIVERY_SUBMITTED') {
      return (
        <button
          className="da-action-primary bg-delivered"
          disabled={isLoading}
          onClick={e => {
            e.stopPropagation();
            setConfirmTarget(order);
            setConfirmModalOpen(true);
          }}
        >
          <IconCheckCircle size={13} />
          {isLoading ? 'Confirming…' : 'Confirm Delivered'}
        </button>
      );
    }

    // DELIVERED → done
    if (status === 'DELIVERED') {
      return (
        <span className="da-done-badge">
          <IconCheckCircle size={12} /> Delivered
        </span>
      );
    }

    return null;
  };

  // ── Tab config ────────────────────────────────────────────────────────────

  const tabs: { key: TabType; label: string; count: number; badgeClass: string }[] = [
    { key: 'all',          label: 'All Orders',      count: allOrders.length,        badgeClass: 'bg-all'       },
    { key: 'pending',      label: 'Ready (Pickup)',  count: pendingOrders.length,     badgeClass: 'bg-pending'   },
    { key: 'assigned',     label: 'Agent Assigned',  count: assignedOrders.length,    badgeClass: 'bg-assigned'  },
    { key: 'driver_active',label: 'Driver Active',   count: driverActiveOrders.length,badgeClass: 'bg-onway'    },
    { key: 'proof_pending',label: 'Proof Submitted', count: proofOrders.length,       badgeClass: 'bg-proof'    },
    { key: 'delivered',    label: 'Delivered',       count: deliveredOrders.length,   badgeClass: 'bg-completed' },
  ];

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="da-container">

      {/* Success toast */}
      {successMsg && (
        <div className="da-toast-success">
          <IconCheckCircle size={16} /><span>{successMsg}</span>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="da-error-banner">
          <IconAlert size={16} /><span>{error}</span>
          <button onClick={() => setError(null)} className="da-error-dismiss">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="da-page-header">
        <div className="da-header-text">
          <h2>Delivery Agent Dashboard</h2>
          <p>Assign drivers to orders, track deliveries, and confirm completions.</p>
        </div>
        <button
          className={`da-refresh-btn ${refreshing ? 'spinning' : ''}`}
          onClick={() => fetchAll(true)}
          title="Refresh"
        >
          <IconRefresh size={16} />
        </button>
      </div>

      {/* Stats grid */}
      <div className="da-stats-grid">
        <div className="da-stat-card" onClick={() => setActiveTab('all')}>
          <div className="da-stat-icon icon-all"><IconPackage size={22} /></div>
          <div className="da-stat-details"><h3>{allOrders.length}</h3><p>Total Orders</p></div>
        </div>
        <div className="da-stat-card" onClick={() => setActiveTab('pending')}>
          <div className="da-stat-icon icon-pending"><IconClock size={22} /></div>
          <div className="da-stat-details"><h3>{pendingOrders.length}</h3><p>Ready for Pickup</p></div>
        </div>
        <div className="da-stat-card" onClick={() => setActiveTab('assigned')}>
          <div className="da-stat-icon icon-assigned"><IconUser size={22} /></div>
          <div className="da-stat-details"><h3>{assignedOrders.length}</h3><p>Need Driver</p></div>
        </div>
        <div className="da-stat-card" onClick={() => setActiveTab('driver_active')}>
          <div className="da-stat-icon icon-onway"><IconTruck size={22} /></div>
          <div className="da-stat-details"><h3>{driverActiveOrders.length}</h3><p>Driver Active</p></div>
        </div>
        <div className="da-stat-card" onClick={() => setActiveTab('proof_pending')}>
          <div className="da-stat-icon icon-proof"><IconImage size={22} /></div>
          <div className="da-stat-details"><h3>{proofOrders.length}</h3><p>Proof Submitted</p></div>
        </div>
        <div className="da-stat-card" onClick={() => setActiveTab('delivered')}>
          <div className="da-stat-icon icon-delivered"><IconCheckCircle size={22} /></div>
          <div className="da-stat-details"><h3>{deliveredOrders.length}</h3><p>Delivered</p></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="da-tabs-bar">
        {tabs.map(t => (
          <button
            key={t.key}
            className={`da-tab-item ${activeTab === t.key ? 'active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
            <span className={`da-tab-badge ${t.badgeClass}`}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Orders grid */}
      {loading ? (
        <div className="da-center-loader">
          <div className="da-spinner" /><p>Loading orders…</p>
        </div>
      ) : visibleOrders.length === 0 ? (
        <div className="da-empty-state">
          <IconTruck size={48} />
          <h3>No Orders Here</h3>
          <p>No orders in this category right now.</p>
        </div>
      ) : (
        <div className="da-orders-grid">
          {visibleOrders.map(order => {
            const status   = (order.status || '').toUpperCase();
            const customer = order.customer;
            const addr     = order.delivery_address;

            return (
              <div
                key={order.id}
                className="da-order-card"
                onClick={() => { setSelectedOrder(order); setModalOpen(true); }}
              >
                {/* Card top */}
                <div className="da-card-top">
                  <div className="da-card-id-block">
                    <h4 className="da-order-number">
                      #{order.order_number || String(order.id).padStart(5, '0')}
                    </h4>
                    <span className="da-order-time">
                      <IconClock size={11} />
                      {fmtDate(order.created_at)} · {fmtTime(order.created_at)}
                    </span>
                  </div>
                  <span className={`da-status-pill ${statusPillClass(status)}`}>
                    {statusLabel(status)}
                  </span>
                </div>

                {/* Customer & address */}
                {(customer || addr) && (
                  <div className="da-card-meta">
                    {customer && (
                      <div className="da-meta-row">
                        <IconUser size={12} />
                        <span>
                          {typeof customer === 'object'
                            ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
                            : customer}
                        </span>
                      </div>
                    )}
                    {addr && (
                      <div className="da-meta-row">
                        <IconMapPin size={12} />
                        <span>
                          {addr.street ? `${addr.street}, ` : ''}{addr.city || ''}
                          {addr.pincode ? ` — ${addr.pincode}` : ''}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Items */}
                <div className="da-card-items">
                  {(order.items || []).slice(0, 3).map((item: any, idx: number) => (
                    <div key={item.id || idx} className="da-item-line">
                      <span className="da-item-qty">×{item.quantity}</span>
                      <span className="da-item-name">{item.product?.name || item.name || 'Item'}</span>
                    </div>
                  ))}
                  {(order.items || []).length > 3 && (
                    <span className="da-item-more">+{order.items.length - 3} more</span>
                  )}
                </div>

                {/* Driver tag if assigned */}
                {order.driver && (
                  <div className="da-driver-tag">
                    <IconTruck size={11} />
                    <span>
                      {`${order.driver.first_name || ''} ${order.driver.last_name || ''}`.trim() || 'Driver assigned'}
                    </span>
                  </div>
                )}

                {/* Proof submitted indicator */}
                {status === 'DELIVERY_SUBMITTED' && (
                  <div className="da-proof-tag">
                    <IconImage size={11} />
                    <span>Driver submitted delivery proof</span>
                  </div>
                )}

                {/* Total */}
                {(order.grand_total || order.total) && (
                  <div className="da-card-total">
                    <span>Total</span>
                    <strong>{fmtCurrency(order.grand_total || order.total || 0, order.currency)}</strong>
                  </div>
                )}

                {/* Action footer */}
                <div className="da-card-footer">
                  <button
                    className="da-view-btn"
                    onClick={e => { e.stopPropagation(); setSelectedOrder(order); setModalOpen(true); }}
                  >
                    <IconEye size={13} /> View
                  </button>
                  {renderActionBtn(order)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Order Detail Modal ─────────────────────────────────────────── */}
      {modalOpen && selectedOrder && (
        <div className="da-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="da-modal-card" onClick={e => e.stopPropagation()}>
            <div className="da-modal-header">
              <h3>Order Details</h3>
              <button className="da-modal-close" onClick={() => setModalOpen(false)}>
                <IconX size={16} />
              </button>
            </div>
            <div className="da-modal-body">

              {/* Status row */}
              <div className="da-modal-meta">
                <div>
                  <p className="da-modal-order-num">
                    #{selectedOrder.order_number || selectedOrder.id}
                  </p>
                  <p className="da-modal-order-type">
                    {selectedOrder.order_type || 'DELIVERY'} · {fmtDate(selectedOrder.created_at)}
                  </p>
                </div>
                <span className={`da-status-pill ${statusPillClass(selectedOrder.status)}`}>
                  {statusLabel(selectedOrder.status)}
                </span>
              </div>

              {/* Order Origin (placed by / source) */}
              {(selectedOrder.placed_by || selectedOrder.source || selectedOrder.order_origin || selectedOrder.placed_by_role || selectedOrder.placed_by_email) && (
                <div className="da-modal-section">
                  <h5 className="da-modal-section-title">Order Origin</h5>
                  <div className="da-modal-info-grid">
                    {selectedOrder.placed_by && (
                      <div className="da-info-row">
                        <IconUser size={13} />
                                            <span>{renderValue(selectedOrder.placed_by)}</span>
                      </div>
                    )}
                    {selectedOrder.placed_by_role && (
                      <div className="da-info-row">
                        <span className="da-origin-role">{selectedOrder.placed_by_role}</span>
                      </div>
                    )}
                    {selectedOrder.placed_by_email && (
                      <div className="da-info-row">
                        <span>{selectedOrder.placed_by_email}</span>
                      </div>
                    )}
                    {selectedOrder.source && (
                      <div className="da-info-row">
                        <span>Source: {selectedOrder.source}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Delivery schedule (expected date / time slot / area) */}
              {(selectedOrder.expected_delivery_date || selectedOrder.time_slot || selectedOrder.delivery_area || selectedOrder.area) && (
                <div className="da-modal-section">
                  <h5 className="da-modal-section-title">Delivery Schedule</h5>
                  <div className="da-modal-info-grid">
                    {selectedOrder.expected_delivery_date && (
                      <div className="da-info-row">
                        <IconClock size={13} />
                        <span>{fmtDate(selectedOrder.expected_delivery_date)}</span>
                      </div>
                    )}
                    {selectedOrder.time_slot && (
                      <div className="da-info-row">
                        <IconClock size={13} />
                        <span>{selectedOrder.time_slot}</span>
                      </div>
                    )}
                    {(selectedOrder.delivery_area || selectedOrder.area) && (
                      <div className="da-info-row">
                        <IconMapPin size={13} />
                                            <span>{renderValue(selectedOrder.delivery_area || selectedOrder.area)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Payment */}
              {selectedOrder.payment_method && (
                <div className="da-modal-section">
                  <h5 className="da-modal-section-title">Payment</h5>
                  <div className="da-info-row">
                    <span>{selectedOrder.payment_method}</span>
                    {selectedOrder.payment_status && (
                      <span className={`da-payment-chip chip-${(selectedOrder.payment_status || '').toLowerCase()}`}>
                        {selectedOrder.payment_status}
                      </span>
                    )}
                    {selectedOrder.currency && (
                      <span className="da-currency-label">{selectedOrder.currency}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Customer */}
              {selectedOrder.customer && (
                <div className="da-modal-section">
                  <h5 className="da-modal-section-title">Customer</h5>
                  <div className="da-modal-info-grid">
                    <div className="da-info-row">
                      <IconUser size={13} />
                      <span>
                        {selectedOrder.customer.first_name} {selectedOrder.customer.last_name}
                      </span>
                    </div>
                    {selectedOrder.customer.phone_no && (
                      <div className="da-info-row">
                        <IconPhone size={13} />
                        <span>{selectedOrder.customer.phone_no}</span>
                      </div>
                    )}
                    {selectedOrder.customer.email && (
                      <div className="da-info-row">
                        <span className="da-customer-email">{selectedOrder.customer.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Customer & Delivery Address (brief + expanded) */}
              {selectedOrder.customer && (
                <div className="da-modal-section">
                  <h5 className="da-modal-section-title">Customer & Address</h5>
                  <div className="da-modal-info-grid">
                    <div className="da-info-row">
                      <IconUser size={13} />
                      <span>{renderValue(selectedOrder.customer.first_name || selectedOrder.customer.name || (selectedOrder.customer.first_name && selectedOrder.customer.last_name ? `${selectedOrder.customer.first_name} ${selectedOrder.customer.last_name}` : ''))}</span>
                    </div>
                    {selectedOrder.customer.phone_no && (
                      <div className="da-info-row">
                        <IconPhone size={13} />
                        <span>{renderValue(selectedOrder.customer.phone_no)}</span>
                      </div>
                    )}
                    {selectedOrder.customer.email && (
                      <div className="da-info-row">
                        <span className="da-customer-email">{renderValue(selectedOrder.customer.email)}</span>
                      </div>
                    )}

                    {selectedOrder.delivery_address && (
                      <div className="da-address-box">
                        <strong className="da-address-label">Address:</strong>
                        <div className="da-address-lines">
                          {selectedOrder.delivery_address.building && (
                            <div><span className="da-address-field">Building:</span> {renderValue(selectedOrder.delivery_address.building)}</div>
                          )}
                          {selectedOrder.delivery_address.block && (
                            <div><span className="da-address-field">Block:</span> {renderValue(selectedOrder.delivery_address.block)}</div>
                          )}
                          {selectedOrder.delivery_address.avenue && (
                            <div><span className="da-address-field">Avenue:</span> {renderValue(selectedOrder.delivery_address.avenue)}</div>
                          )}
                          {selectedOrder.delivery_address.street && (
                            <div><span className="da-address-field">Street:</span> {renderValue(selectedOrder.delivery_address.street)}</div>
                          )}
                          {(selectedOrder.delivery_address.floor || selectedOrder.delivery_address.apt || selectedOrder.delivery_address.apartment) && (
                            <div><span className="da-address-field">Floor/Apt:</span> {renderValue(selectedOrder.delivery_address.floor || selectedOrder.delivery_address.apt || selectedOrder.delivery_address.apartment)}</div>
                          )}
                          {selectedOrder.delivery_address.address_notes && (
                            <div><span className="da-address-field">Address notes:</span> {renderValue(selectedOrder.delivery_address.address_notes)}</div>
                          )}
                          {/* Fallback short line if none of the above present */}
                          {!selectedOrder.delivery_address.building && !selectedOrder.delivery_address.block && !selectedOrder.delivery_address.avenue && !selectedOrder.delivery_address.street && (
                            <div>{renderValue(selectedOrder.delivery_address.city)}{selectedOrder.delivery_address.pincode ? ` — ${renderValue(selectedOrder.delivery_address.pincode)}` : ''}</div>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              )}


              {/* Assigned driver */}
              {selectedOrder.driver && (
                <div className="da-modal-section">
                  <h5 className="da-modal-section-title">Assigned Driver</h5>
                  <div className="da-modal-driver-tag">
                    <IconTruck size={14} />
                    <span>
                      {`${selectedOrder.driver.first_name || ''} ${selectedOrder.driver.last_name || ''}`.trim()}
                    </span>
                    {selectedOrder.driver.phone_no && (
                      <span className="da-driver-phone-modal">· {selectedOrder.driver.phone_no}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Delivery proof (shown when driver submitted) */}
              {(selectedOrder.status === 'DELIVERY_SUBMITTED' || selectedOrder.delivery_photo) && (
                <div className="da-modal-section da-proof-section">
                  <h5 className="da-modal-section-title">Delivery Proof from Driver</h5>
                  {selectedOrder.delivery_photo && (
                    <a
                      href={selectedOrder.delivery_photo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="da-proof-photo-link"
                    >
                      <IconImage size={14} /> View Photo ↗
                    </a>
                  )}
                  {selectedOrder.delivery_notes && (
                    <p className="da-proof-notes">
                      <strong>Driver note:</strong> {selectedOrder.delivery_notes}
                    </p>
                  )}
                  {selectedOrder.customer_confirmation_name && (
                    <p className="da-proof-notes">
                      <strong>Received by:</strong> {selectedOrder.customer_confirmation_name}
                      {selectedOrder.customer_confirmation_phone
                        ? ` · ${selectedOrder.customer_confirmation_phone}`
                        : ''}
                    </p>
                  )}
                  {selectedOrder.driver_submitted_at && (
                    <p className="da-proof-notes">
                      <strong>Submitted:</strong>{' '}
                      {new Date(selectedOrder.driver_submitted_at).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Items */}
              <div className="da-modal-section">
                <h5 className="da-modal-section-title">Order Items</h5>
                <div className="da-modal-items">
                  {(selectedOrder.items || []).map((item: any, idx: number) => (
                    <div key={item.id || idx} className="da-modal-item-row">
                      <div className="da-modal-item-left">
                        <span className="da-modal-qty">×{item.quantity}</span>
                        <div className="da-modal-item-with-thumb">
                          {((item.product && (item.product.image || item.product.image_url)) || item.image) && (
                            <div className="da-item-thumb">
                              <img
                                src={item.product?.image || item.product?.image_url || item.image}
                                alt={item.product?.name || item.name}
                                onError={(e: any) => { e.target.style.display = 'none'; }}
                              />
                            </div>
                          )}
                          <div>
                            <p className="da-modal-item-name">{item.product?.name || item.name}</p>
                            {item.product?.description && (
                              <p className="da-modal-item-desc">{item.product.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="da-modal-item-price">
                        {fmtCurrency(item.line_total || (item.price * item.quantity) || 0, selectedOrder?.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery notes from order */}
              {selectedOrder.delivery_notes && selectedOrder.status !== 'DELIVERY_SUBMITTED' && (
                <div className="da-modal-notes">
                  <h5 className="da-modal-section-title">Delivery Notes</h5>
                  <p className="da-modal-notes-text">"{selectedOrder.delivery_notes}"</p>
                </div>
              )}

              {/* Totals */}
              <div className="da-modal-totals">
                <div className="da-total-row">
                  <span>Subtotal</span><span>{fmtCurrency(selectedOrder.subtotal, selectedOrder.currency)}</span>
                </div>
                <div className="da-total-row">
                  <span>Delivery</span><span>{fmtCurrency(selectedOrder.delivery_charge, selectedOrder.currency)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="da-total-row da-total-discount">
                    <span>Discount</span><span>−{fmtCurrency(selectedOrder.discount, selectedOrder.currency)}</span>
                  </div>
                )}
                <div className="da-total-row da-total-grand">
                  <span>Total</span>
                  <strong>{fmtCurrency(selectedOrder.grand_total || selectedOrder.total || 0, selectedOrder.currency)}</strong>
                </div>
              </div>
            </div>

            <div className="da-modal-footer">
              <button className="da-modal-print" onClick={() => window.print()}>Print Receipt</button>
              <button className="da-modal-cancel" onClick={() => setModalOpen(false)}>Close</button>
              {renderActionBtn(selectedOrder, true)}
            </div>
          </div>
        </div>
      )}

      {/* ─── Driver Assignment Modal ────────────────────────────────────── */}
      {driverModalOpen && (
        <div className="da-modal-backdrop" onClick={() => { setDriverModalOpen(false); setAssignSuccess(null); }}>
          <div className="da-modal-card da-driver-modal" onClick={e => e.stopPropagation()}>
            <div className="da-modal-header">
              <div>
                <h3>Assign Driver</h3>
                {assignTargetOrder && (
                  <p className="da-modal-sub">
                    Order #{assignTargetOrder.order_number || assignTargetOrder.id}
                    {assignTargetOrder.customer && (
                      <span>
                        {' · '}{assignTargetOrder.customer.first_name} {assignTargetOrder.customer.last_name}
                      </span>
                    )}
                  </p>
                )}
              </div>
              <button
                className="da-modal-close"
                onClick={() => { setDriverModalOpen(false); setAssignSuccess(null); }}
              >
                <IconX size={16} />
              </button>
            </div>

            <div className="da-modal-body">
              {/* Success banner */}
              {assignSuccess && (
                <div className="da-assign-success">
                  <IconCheckCircle size={18} /><span>{assignSuccess}</span>
                </div>
              )}

              {driverLoading ? (
                <div className="da-center-loader" style={{ minHeight: 180 }}>
                  <div className="da-spinner" /><p>Loading available drivers…</p>
                </div>
              ) : drivers.length === 0 ? (
                <div className="da-empty-state" style={{ padding: '40px 20px' }}>
                  <IconUser size={40} />
                  <h3>No Drivers Found</h3>
                  <p>No drivers are registered yet, or all are currently on deliveries.</p>
                </div>
              ) : (
                <>
                  {/* Search */}
                  <div className="da-driver-search">
                    <IconSearch size={15} />
                    <input
                      type="text"
                      placeholder="Search by name or phone…"
                      value={driverSearch}
                      onChange={e => setDriverSearch(e.target.value)}
                    />
                  </div>

                  {/* Legend */}
                  <div className="da-driver-list-header">
                    <p className="da-driver-list-hint">
                      {filteredDrivers.length} driver{filteredDrivers.length !== 1 ? 's' : ''}
                      {driverSearch ? ' found' : ''} — tap to assign
                    </p>
                    <div className="da-driver-legend">
                      <span className="da-legend-dot ds-available" /> Available
                      <span className="da-legend-dot ds-busy" /> Busy
                      <span className="da-legend-dot ds-offline" /> Offline
                    </div>
                  </div>

                  <div className="da-driver-list">
                    {filteredDrivers.length === 0 ? (
                      <div className="da-driver-no-results">
                        <p>No drivers match "{driverSearch}"</p>
                      </div>
                    ) : (
                      filteredDrivers.map(driver => {
                        // availability_status is the field added in fixed User model
                        const rawStatus   = driver.availability_status || driver.status || 'OFFLINE';
                        const dStatus     = rawStatus.toUpperCase();
                        const isAssigning = assigningDriver === driver.id;
                        const isDisabled  = assigningDriver !== null && !isAssigning;

                        return (
                          <div
                            key={driver.id}
                            className={[
                              'da-driver-card',
                              dStatus === 'ONLINE' || dStatus === 'AVAILABLE' ? 'da-driver-available' : '',
                              isAssigning ? 'da-driver-assigning' : '',
                              isDisabled  ? 'da-driver-disabled'  : '',
                            ].join(' ')}
                            onClick={() => !isAssigning && !isDisabled && handleAssignDriver(driver)}
                          >
                            <div className="da-driver-avatar">
                              {(driver.first_name || driver.name || 'D').charAt(0).toUpperCase()}
                            </div>
                            <div className="da-driver-info">
                              <p className="da-driver-name">
                                {driver.first_name || driver.name || 'Driver'}
                                {driver.last_name ? ` ${driver.last_name}` : ''}
                              </p>
                              <div className="da-driver-meta">
                                {driver.phone_no && (
                                  <span className="da-driver-phone">
                                    <IconPhone size={11} />{driver.phone_no}
                                  </span>
                                )}
                                {driver.rating > 0 && (
                                  <span className="da-driver-rating">
                                    <IconStar size={11} />{Number(driver.rating).toFixed(1)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="da-driver-right">
                              <span className={`da-driver-status ${driverStatusClass(dStatus)}`}>
                                {driverStatusLabel(dStatus)}
                              </span>
                              {isAssigning ? (
                                <div className="da-spinner da-spinner-sm" />
                              ) : (
                                <button
                                  className="da-assign-btn"
                                  disabled={isDisabled}
                                  onClick={e => { e.stopPropagation(); handleAssignDriver(driver); }}
                                >
                                  Assign
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Confirm Delivery Modal ─────────────────────────────────────── */}
      {/* Shown when driver has submitted proof (DELIVERY_SUBMITTED).
          Delivery agent reviews the proof and clicks Confirm to set DELIVERED. */}
      {confirmModalOpen && confirmTarget && (
        <div className="da-modal-backdrop" onClick={() => setConfirmModalOpen(false)}>
          <div className="da-modal-card da-confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="da-modal-header">
              <div>
                <h3>Confirm Delivery</h3>
                <p className="da-modal-sub">
                  Order #{confirmTarget.order_number || confirmTarget.id}
                </p>
              </div>
              <button className="da-modal-close" onClick={() => setConfirmModalOpen(false)}>
                <IconX size={16} />
              </button>
            </div>
            <div className="da-modal-body">
              <div className="da-confirm-desc">
                <p>
                  Driver <strong>
                    {confirmTarget.driver
                      ? `${confirmTarget.driver.first_name || ''} ${confirmTarget.driver.last_name || ''}`.trim()
                      : 'your driver'}
                  </strong> has submitted delivery proof for this order.
                </p>
                <p>Review the proof below and confirm to mark it as <strong>DELIVERED</strong>.</p>
              </div>

              {/* Show proof details in confirm modal too */}
              {confirmTarget.delivery_photo && (
                <a
                  href={confirmTarget.delivery_photo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="da-proof-photo-link"
                >
                  <IconImage size={14} /> View delivery photo ↗
                </a>
              )}
              {confirmTarget.delivery_notes && (
                <p className="da-proof-notes">
                  <strong>Driver note:</strong> {confirmTarget.delivery_notes}
                </p>
              )}
              {confirmTarget.customer_confirmation_name && (
                <p className="da-proof-notes">
                  <strong>Received by:</strong> {confirmTarget.customer_confirmation_name}
                </p>
              )}
              {!confirmTarget.delivery_photo && !confirmTarget.delivery_notes && (
                <p className="da-proof-notes da-proof-none">No photo or notes submitted by driver.</p>
              )}
            </div>
            <div className="da-modal-footer">
              <button
                className="da-modal-cancel"
                disabled={actionLoading === confirmTarget.id}
                onClick={() => setConfirmModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="da-action-primary bg-delivered"
                disabled={actionLoading === confirmTarget.id}
                onClick={handleConfirmDelivery}
              >
                <IconCheckCircle size={14} />
                {actionLoading === confirmTarget.id ? 'Confirming…' : 'Confirm Delivered'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DeliveryOrder;