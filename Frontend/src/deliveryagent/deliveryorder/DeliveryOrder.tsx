// // // // // import React, { useState, useEffect, useCallback, useMemo } from 'react';
// // // // // import './DeliveryOrder.css';

// // // // // // ─── Service imports ─────────────────────────────────────────────────────────
// // // // // // All URLs come from delivery_routes.py and order_routes.py
// // // // // import {
// // // // //   getDeliveryPending,       // GET  /delivery/pending         → READY orders (kitchen done, agent not yet assigned)
// // // // //   getDeliveryAssigned,      // GET  /delivery/assigned        → ASSIGNED_TO_AGENT orders
// // // // //   getDeliveryReady,         // GET  /delivery/ready-for-pickup→ ASSIGNED_TO_DRIVER | DRIVER_ACCEPTED | OUT_FOR_DELIVERY
// // // // //   getDeliveryProofPending,  // GET  /delivery/proof-pending   → DELIVERY_SUBMITTED (driver sent proof)
// // // // //   getDeliveryDelivered,     // GET  /delivery/delivered       → DELIVERED orders
// // // // // } from '../../services/deliveryService';

// // // // // import {
// // // // //   assignDriverToOrder,      // POST /orders/:id/assign-driver    { driver_id } → ASSIGNED_TO_DRIVER
// // // // //   markOrderDelivered,       // POST /orders/:id/confirm-delivery                → DELIVERED
// // // // // } from '../../services/orderService';

// // // // // import {
// // // // //   getAvailableDrivers,      // GET  /drivers/available
// // // // //   getDrivers,               // GET  /drivers
// // // // // } from '../../services/driverService';

// // // // // // ─── SVG Icons ────────────────────────────────────────────────────────────────
// // // // // const IconTruck = ({ size = 20 }: { size?: number }) => (
// // // // //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
// // // // //     <rect x="1" y="3" width="15" height="13" rx="2" />
// // // // //     <path d="M16 8h4l3 3v5h-7V8z" />
// // // // //     <circle cx="5.5" cy="18.5" r="2.5" />
// // // // //     <circle cx="18.5" cy="18.5" r="2.5" />
// // // // //   </svg>
// // // // // );
// // // // // const IconClock = ({ size = 18 }: { size?: number }) => (
// // // // //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// // // // //     <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
// // // // //   </svg>
// // // // // );
// // // // // const IconCheckCircle = ({ size = 18 }: { size?: number }) => (
// // // // //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// // // // //     <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
// // // // //   </svg>
// // // // // );
// // // // // const IconUser = ({ size = 18 }: { size?: number }) => (
// // // // //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// // // // //     <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
// // // // //   </svg>
// // // // // );
// // // // // const IconMapPin = ({ size = 14 }: { size?: number }) => (
// // // // //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// // // // //     <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
// // // // //   </svg>
// // // // // );
// // // // // const IconPackage = ({ size = 20 }: { size?: number }) => (
// // // // //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// // // // //     <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
// // // // //     <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
// // // // //     <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
// // // // //     <line x1="12" y1="22.08" x2="12" y2="12" />
// // // // //   </svg>
// // // // // );
// // // // // const IconRefresh = ({ size = 16 }: { size?: number }) => (
// // // // //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// // // // //     <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
// // // // //     <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
// // // // //   </svg>
// // // // // );
// // // // // const IconX = ({ size = 18 }: { size?: number }) => (
// // // // //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// // // // //     <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
// // // // //   </svg>
// // // // // );
// // // // // const IconPhone = ({ size = 14 }: { size?: number }) => (
// // // // //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// // // // //     <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.88a16 16 0 0 0 6.21 6.21l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
// // // // //   </svg>
// // // // // );
// // // // // const IconSearch = ({ size = 16 }: { size?: number }) => (
// // // // //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// // // // //     <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
// // // // //   </svg>
// // // // // );
// // // // // const IconStar = ({ size = 13 }: { size?: number }) => (
// // // // //   <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
// // // // //     <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
// // // // //   </svg>
// // // // // );
// // // // // const IconEye = ({ size = 16 }: { size?: number }) => (
// // // // //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// // // // //     <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
// // // // //   </svg>
// // // // // );
// // // // // const IconAlert = ({ size = 16 }: { size?: number }) => (
// // // // //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// // // // //     <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
// // // // //   </svg>
// // // // // );
// // // // // const IconImage = ({ size = 16 }: { size?: number }) => (
// // // // //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// // // // //     <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
// // // // //     <polyline points="21 15 16 10 5 21" />
// // // // //   </svg>
// // // // // );

// // // // // // ─── Types ────────────────────────────────────────────────────────────────────

// // // // // /**
// // // // //  * Tab keys mapped to the backend delivery_routes.py endpoints:
// // // // //  *
// // // // //  *  'pending'        → GET /delivery/pending          (status = READY, kitchen done, unassigned)
// // // // //  *  'assigned'       → GET /delivery/assigned         (status = ASSIGNED_TO_AGENT)
// // // // //  *  'driver_active'  → GET /delivery/ready-for-pickup (status = ASSIGNED_TO_DRIVER | DRIVER_ACCEPTED | OUT_FOR_DELIVERY)
// // // // //  *  'proof_pending'  → GET /delivery/proof-pending    (status = DELIVERY_SUBMITTED)
// // // // //  *  'delivered'      → GET /delivery/delivered        (status = DELIVERED)
// // // // //  *  'all'            → all of the above merged
// // // // //  */
// // // // // type TabType = 'all' | 'pending' | 'assigned' | 'driver_active' | 'proof_pending' | 'delivered';

// // // // // // ─── Status helpers ───────────────────────────────────────────────────────────

// // // // // // Backend status → pill CSS class
// // // // // const statusPillClass = (s: string): string => {
// // // // //   switch ((s || '').toUpperCase()) {
// // // // //     case 'READY':               return 'pill-ready';
// // // // //     case 'ASSIGNED_TO_AGENT':   return 'pill-assigned';
// // // // //     case 'ASSIGNED_TO_DRIVER':  return 'pill-assigned';
// // // // //     case 'DRIVER_ACCEPTED':     return 'pill-onway';
// // // // //     case 'OUT_FOR_DELIVERY':    return 'pill-onway';
// // // // //     case 'DELIVERY_SUBMITTED':  return 'pill-proof';
// // // // //     case 'DELIVERED':           return 'pill-delivered';
// // // // //     case 'CANCELLED':           return 'pill-cancelled';
// // // // //     default:                    return 'pill-default';
// // // // //   }
// // // // // };

// // // // // // Human-readable label for each backend status
// // // // // const statusLabel = (s: string): string => {
// // // // //   switch ((s || '').toUpperCase()) {
// // // // //     case 'READY':               return 'Ready';
// // // // //     case 'ASSIGNED_TO_AGENT':   return 'Agent Assigned';
// // // // //     case 'ASSIGNED_TO_DRIVER':  return 'Driver Assigned';
// // // // //     case 'DRIVER_ACCEPTED':     return 'Out for Delivery';
// // // // //     case 'OUT_FOR_DELIVERY':    return 'Out for Delivery';
// // // // //     case 'DELIVERY_SUBMITTED':  return 'Proof Submitted';
// // // // //     case 'DELIVERED':           return 'Delivered';
// // // // //     default:                    return (s || '').replace(/_/g, ' ');
// // // // //   }
// // // // // };

// // // // // // Driver availability chip class
// // // // // const driverStatusClass = (s: string): string => {
// // // // //   const st = (s || '').toUpperCase();
// // // // //   if (st === 'ONLINE' || st === 'AVAILABLE') return 'ds-available';
// // // // //   if (st === 'BUSY')                         return 'ds-busy';
// // // // //   return 'ds-offline';
// // // // // };

// // // // // const driverStatusLabel = (s: string): string => {
// // // // //   const st = (s || '').toUpperCase();
// // // // //   if (st === 'ONLINE' || st === 'AVAILABLE') return 'Available';
// // // // //   if (st === 'BUSY')                         return 'Busy';
// // // // //   return 'Offline';
// // // // // };

// // // // // // ─── Formatters ───────────────────────────────────────────────────────────────

// // // // // const fmtTime = (dt: string) =>
// // // // //   dt ? new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—';
// // // // // const fmtDate = (dt: string) =>
// // // // //   dt ? new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—';

// // // // // const currencySymbol = (cur?: string) => {
// // // // //   const c = cur || (typeof window !== 'undefined' ? localStorage.getItem('currency') || 'INR' : 'INR');
// // // // //   return c === 'INR' ? '₹' : c;
// // // // // };

// // // // // const fmtCurrency = (n: number | undefined, cur?: string) => `${currencySymbol(cur)}${Number(n || 0).toFixed(0)}`;

// // // // // // Safely render a value that may be a string, number, or object coming from the API.
// // // // // // If it's an object, prefer common display fields (name, first_name, full_name) before falling
// // // // // // back to a JSON string so React never receives a raw object as a child.
// // // // // const renderValue = (v: any) => {
// // // // //   if (v === null || v === undefined) return '';
// // // // //   if (typeof v === 'string' || typeof v === 'number') return String(v);
// // // // //   if (typeof v === 'object') {
// // // // //     return (
// // // // //       v.name || v.title || v.first_name || v.firstName || v.full_name || v.email || JSON.stringify(v)
// // // // //     );
// // // // //   }
// // // // //   return String(v);
// // // // // };

// // // // // // ─── Component ────────────────────────────────────────────────────────────────

// // // // // const DeliveryOrder: React.FC = () => {

// // // // //   // ── State ──────────────────────────────────────────────────────────────────

// // // // //   const [activeTab,        setActiveTab]        = useState<TabType>('all');

// // // // //   // Order buckets — one per backend endpoint
// // // // //   const [pendingOrders,      setPendingOrders]      = useState<any[]>([]);  // READY
// // // // //   const [assignedOrders,     setAssignedOrders]     = useState<any[]>([]);  // ASSIGNED_TO_AGENT
// // // // //   const [driverActiveOrders, setDriverActiveOrders] = useState<any[]>([]);  // ASSIGNED_TO_DRIVER | DRIVER_ACCEPTED | OUT_FOR_DELIVERY
// // // // //   const [proofOrders,        setProofOrders]        = useState<any[]>([]);  // DELIVERY_SUBMITTED
// // // // //   const [deliveredOrders,    setDeliveredOrders]    = useState<any[]>([]);  // DELIVERED

// // // // //   const [loading,       setLoading]       = useState(true);
// // // // //   const [refreshing,    setRefreshing]    = useState(false);
// // // // //   const [actionLoading, setActionLoading] = useState<number | null>(null);
// // // // //   const [error,         setError]         = useState<string | null>(null);
// // // // //   const [successMsg,    setSuccessMsg]    = useState<string | null>(null);

// // // // //   // Order detail modal
// // // // //   const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
// // // // //   const [modalOpen,     setModalOpen]     = useState(false);

// // // // //   // Driver assignment modal
// // // // //   const [driverModalOpen,   setDriverModalOpen]   = useState(false);
// // // // //   const [assignTargetOrder, setAssignTargetOrder] = useState<any | null>(null);
// // // // //   const [drivers,           setDrivers]           = useState<any[]>([]);
// // // // //   const [filteredDrivers,   setFilteredDrivers]   = useState<any[]>([]);
// // // // //   const [driverLoading,     setDriverLoading]     = useState(false);
// // // // //   const [assigningDriver,   setAssigningDriver]   = useState<number | null>(null);
// // // // //   const [driverSearch,      setDriverSearch]      = useState('');
// // // // //   const [assignSuccess,     setAssignSuccess]     = useState<string | null>(null);

// // // // //   // Confirm-delivery modal
// // // // //   const [confirmModalOpen,  setConfirmModalOpen]  = useState(false);
// // // // //   const [confirmTarget,     setConfirmTarget]     = useState<any | null>(null);

// // // // //   // ── Fetch all buckets concurrently ────────────────────────────────────────



// // // // //   const fetchAll = useCallback(async (silent = false) => {
// // // // //     if (!silent) setLoading(true);
// // // // //     else         setRefreshing(true);
// // // // //     setError(null);
// // // // //     try {
// // // // //       const [pending, assigned, driverActive, proof, delivered] = await Promise.all([
// // // // //         getDeliveryPending().catch(() => []),
// // // // //         getDeliveryAssigned().catch(() => []),
// // // // //         getDeliveryReady().catch(() => []),
// // // // //         getDeliveryProofPending().catch(() => []),
// // // // //         getDeliveryDelivered().catch(() => []),
// // // // //       ]);
// // // // //       setPendingOrders(pending);
// // // // //       setAssignedOrders(assigned);
// // // // //       setDriverActiveOrders(driverActive);
// // // // //       setProofOrders(proof);
// // // // //       setDeliveredOrders(delivered);
// // // // //     } catch (err) {
// // // // //       console.error('Delivery fetch error', err);
// // // // //       setError('Failed to load orders. Please refresh.');
// // // // //     } finally {
// // // // //       setLoading(false);
// // // // //       setRefreshing(false);
// // // // //     }
// // // // //   }, []);

// // // // //   useEffect(() => { fetchAll(); }, [fetchAll]);

  

// // // // //   // ── Driver search filter ──────────────────────────────────────────────────

// // // // //   useEffect(() => {
// // // // //     if (!driverSearch.trim()) { setFilteredDrivers(drivers); return; }
// // // // //     const q = driverSearch.toLowerCase();
// // // // //     setFilteredDrivers(drivers.filter(d => {
// // // // //       const name  = `${d.first_name || d.name || ''} ${d.last_name || ''}`.toLowerCase();
// // // // //       const phone = (d.phone_no || '').toLowerCase();
// // // // //       return name.includes(q) || phone.includes(q);
// // // // //     }));
// // // // //   }, [driverSearch, drivers]);


  
// // // // //   // ── Derived data ──────────────────────────────────────────────────────────

// // // // //   const allOrders = useMemo(() =>
// // // // //     // Combine buckets and deduplicate by `id` to avoid rendering duplicate keys
// // // // //     (() => {
// // // // //       const combined = [...pendingOrders, ...assignedOrders, ...driverActiveOrders, ...proofOrders, ...deliveredOrders];
// // // // //       const byId = new Map<number | string, any>();
// // // // //       for (const o of combined) {
// // // // //         const key = o?.id ?? Math.random();
// // // // //         if (!byId.has(key)) {
// // // // //           byId.set(key, o);
// // // // //         } else {
// // // // //           // keep the newest by created_at
// // // // //           const existing = byId.get(key);
// // // // //           try {
// // // // //             const exTime = existing?.created_at ? new Date(existing.created_at).getTime() : 0;
// // // // //             const newTime = o?.created_at ? new Date(o.created_at).getTime() : 0;
// // // // //             if (newTime > exTime) byId.set(key, o);
// // // // //           } catch (e) {
// // // // //             // fallback: overwrite
// // // // //             byId.set(key, o);
// // // // //           }
// // // // //         }
// // // // //       }
// // // // //       return Array.from(byId.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
// // // // //     })(),
// // // // //     [pendingOrders, assignedOrders, driverActiveOrders, proofOrders, deliveredOrders]
// // // // //   );

// // // // //   const visibleOrders = useMemo(() => {
// // // // //     switch (activeTab) {
// // // // //       case 'pending':       return pendingOrders;
// // // // //       case 'assigned':      return assignedOrders;
// // // // //       case 'driver_active': return driverActiveOrders;
// // // // //       case 'proof_pending': return proofOrders;
// // // // //       case 'delivered':     return deliveredOrders;
// // // // //       default:              return allOrders;
// // // // //     }
// // // // //   }, [activeTab, pendingOrders, assignedOrders, driverActiveOrders, proofOrders, deliveredOrders, allOrders]);

// // // // //   // ── Success toast helper ──────────────────────────────────────────────────

// // // // //   const showSuccess = (msg: string) => {
// // // // //     setSuccessMsg(msg);
// // // // //     setTimeout(() => setSuccessMsg(null), 3000);
// // // // //   };

// // // // //   // ── Open driver assignment modal ──────────────────────────────────────────
// // // // //   // Called when delivery agent wants to assign a driver to an ASSIGNED_TO_AGENT order.
// // // // //   // Loads /drivers/available first; falls back to /drivers.

// // // // //   const handleOpenAssign = async (order: any, e?: React.MouseEvent) => {
// // // // //     e?.stopPropagation();
// // // // //     setAssignTargetOrder(order);
// // // // //     setDriverModalOpen(true);
// // // // //     setDriverLoading(true);
// // // // //     setDriverSearch('');
// // // // //     setAssignSuccess(null);
// // // // //     setError(null);
// // // // //     try {
// // // // //       let list: any[] = await getAvailableDrivers().catch(() => []);
// // // // //       if (!list || list.length === 0) {
// // // // //         list = await getDrivers().catch(() => []);
// // // // //       }
// // // // //       setDrivers(list);
// // // // //       setFilteredDrivers(list);
// // // // //     } catch {
// // // // //       setDrivers([]);
// // // // //       setFilteredDrivers([]);
// // // // //     } finally {
// // // // //       setDriverLoading(false);
// // // // //     }
// // // // //   };

// // // // //   // ── Assign driver ─────────────────────────────────────────────────────────
// // // // //   // POST /orders/:id/assign-driver  { driver_id }
// // // // //   // Backend: requires status = ASSIGNED_TO_AGENT or ASSIGNED_TO_DRIVER (re-assign)
// // // // //   // → sets status = ASSIGNED_TO_DRIVER

// // // // //   const handleAssignDriver = async (driver: any) => {
// // // // //     if (!assignTargetOrder || assigningDriver !== null) return;
// // // // //     setAssigningDriver(driver.id);
// // // // //     setError(null);
// // // // //     try {
// // // // //       await assignDriverToOrder(Number(assignTargetOrder.id), Number(driver.id));
// // // // //       const driverName = `${driver.first_name || driver.name || 'Driver'} ${driver.last_name || ''}`.trim();
// // // // //       setAssignSuccess(`Order #${assignTargetOrder.order_number || assignTargetOrder.id} assigned to ${driverName}`);
// // // // //       await fetchAll(true);
// // // // //       setTimeout(() => {
// // // // //         setDriverModalOpen(false);
// // // // //         setAssignTargetOrder(null);
// // // // //         setAssignSuccess(null);
// // // // //       }, 1800);
// // // // //     } catch (err: any) {
// // // // //       setError(err?.response?.data?.error || 'Failed to assign driver. Please try again.');
// // // // //     } finally {
// // // // //       setAssigningDriver(null);
// // // // //     }
// // // // //   };

// // // // //   // ── Confirm delivery ──────────────────────────────────────────────────────
// // // // //   // POST /orders/:id/confirm-delivery
// // // // //   // Backend: requires status = DELIVERY_SUBMITTED (driver sent proof)
// // // // //   // → sets status = DELIVERED

// // // // //   const handleConfirmDelivery = async () => {
// // // // //     if (!confirmTarget) return;
// // // // //     setActionLoading(confirmTarget.id);
// // // // //     setError(null);
// // // // //     try {
// // // // //       await markOrderDelivered(confirmTarget.id);
// // // // //       showSuccess(`Order #${confirmTarget.order_number || confirmTarget.id} confirmed as delivered!`);
// // // // //       setConfirmModalOpen(false);
// // // // //       setConfirmTarget(null);
// // // // //       if (modalOpen && selectedOrder?.id === confirmTarget.id) setModalOpen(false);
// // // // //       await fetchAll(true);
// // // // //     } catch (err: any) {
// // // // //       setError(err?.response?.data?.error || 'Failed to confirm delivery.');
// // // // //     } finally {
// // // // //       setActionLoading(null);
// // // // //     }
// // // // //   };

// // // // //   // ── Render action buttons per order status ────────────────────────────────

// // // // //   const renderActionBtn = (order: any, fromModal = false) => {
// // // // //     const status    = (order.status || '').toUpperCase();
// // // // //     const isLoading = actionLoading === order.id;

// // // // //     // ASSIGNED_TO_AGENT → delivery agent picks a driver
// // // // //     if (status === 'ASSIGNED_TO_AGENT') {
// // // // //       return (
// // // // //         <button
// // // // //           className="da-action-primary bg-assign"
// // // // //           disabled={isLoading}
// // // // //           onClick={e => { e.stopPropagation(); handleOpenAssign(order); }}
// // // // //         >
// // // // //           <IconTruck size={13} /> Assign Driver
// // // // //         </button>
// // // // //       );
// // // // //     }

// // // // //     // ASSIGNED_TO_DRIVER → can re-assign (driver hasn't accepted yet)
// // // // //     if (status === 'ASSIGNED_TO_DRIVER') {
// // // // //       return (
// // // // //         <div className={`da-action-group ${fromModal ? 'da-action-group-modal' : ''}`}>
// // // // //           <button
// // // // //             className="da-action-secondary bg-reassign"
// // // // //             disabled={isLoading}
// // // // //             onClick={e => { e.stopPropagation(); handleOpenAssign(order); }}
// // // // //           >
// // // // //             <IconTruck size={13} /> Re-assign
// // // // //           </button>
// // // // //           <span className="da-waiting-chip">Awaiting driver acceptance</span>
// // // // //         </div>
// // // // //       );
// // // // //     }

// // // // //     // DRIVER_ACCEPTED / OUT_FOR_DELIVERY → read-only, driver is en route
// // // // //     if (status === 'DRIVER_ACCEPTED' || status === 'OUT_FOR_DELIVERY') {
// // // // //       return (
// // // // //         <span className="da-info-chip">
// // // // //           <IconTruck size={12} /> Driver en route
// // // // //         </span>
// // // // //       );
// // // // //     }

// // // // //     // DELIVERY_SUBMITTED → delivery agent reviews proof and confirms
// // // // //     if (status === 'DELIVERY_SUBMITTED') {
// // // // //       return (
// // // // //         <button
// // // // //           className="da-action-primary bg-delivered"
// // // // //           disabled={isLoading}
// // // // //           onClick={e => {
// // // // //             e.stopPropagation();
// // // // //             setConfirmTarget(order);
// // // // //             setConfirmModalOpen(true);
// // // // //           }}
// // // // //         >
// // // // //           <IconCheckCircle size={13} />
// // // // //           {isLoading ? 'Confirming…' : 'Confirm Delivered'}
// // // // //         </button>
// // // // //       );
// // // // //     }

// // // // //     // DELIVERED → done
// // // // //     if (status === 'DELIVERED') {
// // // // //       return (
// // // // //         <span className="da-done-badge">
// // // // //           <IconCheckCircle size={12} /> Delivered
// // // // //         </span>
// // // // //       );
// // // // //     }

// // // // //     return null;
// // // // //   };

// // // // //   // ── Tab config ────────────────────────────────────────────────────────────

// // // // //   const tabs: { key: TabType; label: string; count: number; badgeClass: string }[] = [
// // // // //     { key: 'all',          label: 'All Orders',      count: allOrders.length,        badgeClass: 'bg-all'       },
// // // // //     { key: 'pending',      label: 'Ready (Pickup)',  count: pendingOrders.length,     badgeClass: 'bg-pending'   },
// // // // //     { key: 'assigned',     label: 'Agent Assigned',  count: assignedOrders.length,    badgeClass: 'bg-assigned'  },
// // // // //     { key: 'driver_active',label: 'Driver Active',   count: driverActiveOrders.length,badgeClass: 'bg-onway'    },
// // // // //     { key: 'proof_pending',label: 'Proof Submitted', count: proofOrders.length,       badgeClass: 'bg-proof'    },
// // // // //     { key: 'delivered',    label: 'Delivered',       count: deliveredOrders.length,   badgeClass: 'bg-completed' },
// // // // //   ];

// // // // //   // ─── Render ────────────────────────────────────────────────────────────────

// // // // //   return (
// // // // //     <div className="da-container">

// // // // //       {/* Success toast */}
// // // // //       {successMsg && (
// // // // //         <div className="da-toast-success">
// // // // //           <IconCheckCircle size={16} /><span>{successMsg}</span>
// // // // //         </div>
// // // // //       )}

// // // // //       {/* Error banner */}
// // // // //       {error && (
// // // // //         <div className="da-error-banner">
// // // // //           <IconAlert size={16} /><span>{error}</span>
// // // // //           <button onClick={() => setError(null)} className="da-error-dismiss">✕</button>
// // // // //         </div>
// // // // //       )}

// // // // //       {/* Header */}
// // // // //       <div className="da-page-header">
// // // // //         <div className="da-header-text">
// // // // //           <h2>Delivery Agent Dashboard</h2>
// // // // //           <p>Assign drivers to orders, track deliveries, and confirm completions.</p>
// // // // //         </div>
// // // // //         <button
// // // // //           className={`da-refresh-btn ${refreshing ? 'spinning' : ''}`}
// // // // //           onClick={() => fetchAll(true)}
// // // // //           title="Refresh"
// // // // //         >
// // // // //           <IconRefresh size={16} />
// // // // //         </button>
// // // // //       </div>

// // // // //       {/* Stats grid */}
// // // // //       <div className="da-stats-grid">
// // // // //         <div className="da-stat-card" onClick={() => setActiveTab('all')}>
// // // // //           <div className="da-stat-icon icon-all"><IconPackage size={22} /></div>
// // // // //           <div className="da-stat-details"><h3>{allOrders.length}</h3><p>Total Orders</p></div>
// // // // //         </div>
// // // // //         <div className="da-stat-card" onClick={() => setActiveTab('pending')}>
// // // // //           <div className="da-stat-icon icon-pending"><IconClock size={22} /></div>
// // // // //           <div className="da-stat-details"><h3>{pendingOrders.length}</h3><p>Ready for Pickup</p></div>
// // // // //         </div>
// // // // //         <div className="da-stat-card" onClick={() => setActiveTab('assigned')}>
// // // // //           <div className="da-stat-icon icon-assigned"><IconUser size={22} /></div>
// // // // //           <div className="da-stat-details"><h3>{assignedOrders.length}</h3><p>Need Driver</p></div>
// // // // //         </div>
// // // // //         <div className="da-stat-card" onClick={() => setActiveTab('driver_active')}>
// // // // //           <div className="da-stat-icon icon-onway"><IconTruck size={22} /></div>
// // // // //           <div className="da-stat-details"><h3>{driverActiveOrders.length}</h3><p>Driver Active</p></div>
// // // // //         </div>
// // // // //         <div className="da-stat-card" onClick={() => setActiveTab('proof_pending')}>
// // // // //           <div className="da-stat-icon icon-proof"><IconImage size={22} /></div>
// // // // //           <div className="da-stat-details"><h3>{proofOrders.length}</h3><p>Proof Submitted</p></div>
// // // // //         </div>
// // // // //         <div className="da-stat-card" onClick={() => setActiveTab('delivered')}>
// // // // //           <div className="da-stat-icon icon-delivered"><IconCheckCircle size={22} /></div>
// // // // //           <div className="da-stat-details"><h3>{deliveredOrders.length}</h3><p>Delivered</p></div>
// // // // //         </div>
// // // // //       </div>

// // // // //       {/* Tabs */}
// // // // //       <div className="da-tabs-bar">
// // // // //         {tabs.map(t => (
// // // // //           <button
// // // // //             key={t.key}
// // // // //             className={`da-tab-item ${activeTab === t.key ? 'active' : ''}`}
// // // // //             onClick={() => setActiveTab(t.key)}
// // // // //           >
// // // // //             {t.label}
// // // // //             <span className={`da-tab-badge ${t.badgeClass}`}>{t.count}</span>
// // // // //           </button>
// // // // //         ))}
// // // // //       </div>

// // // // //       {/* Orders grid */}
// // // // //       {loading ? (
// // // // //         <div className="da-center-loader">
// // // // //           <div className="da-spinner" /><p>Loading orders…</p>
// // // // //         </div>
// // // // //       ) : visibleOrders.length === 0 ? (
// // // // //         <div className="da-empty-state">
// // // // //           <IconTruck size={48} />
// // // // //           <h3>No Orders Here</h3>
// // // // //           <p>No orders in this category right now.</p>
// // // // //         </div>
// // // // //       ) : (
// // // // //         <div className="da-orders-grid">
// // // // //           {visibleOrders.map(order => {
// // // // //             const status   = (order.status || '').toUpperCase();
// // // // //             const customer = order.customer;
// // // // //             const addr     = order.delivery_address;

// // // // //             return (
// // // // //               <div
// // // // //                 key={order.id}
// // // // //                 className="da-order-card"
// // // // //                 onClick={() => { setSelectedOrder(order); setModalOpen(true); }}
// // // // //               >
// // // // //                 {/* Card top */}
// // // // //                 <div className="da-card-top">
// // // // //                   <div className="da-card-id-block">
// // // // //                     <h4 className="da-order-number">
// // // // //                       #{order.order_number || String(order.id).padStart(5, '0')}
// // // // //                     </h4>
// // // // //                     <span className="da-order-time">
// // // // //                       <IconClock size={11} />
// // // // //                       {fmtDate(order.created_at)} · {fmtTime(order.created_at)}
// // // // //                     </span>
// // // // //                   </div>
// // // // //                   <span className={`da-status-pill ${statusPillClass(status)}`}>
// // // // //                     {statusLabel(status)}
// // // // //                   </span>
// // // // //                 </div>

// // // // //                 {/* Customer & address */}
// // // // //                 {(customer || addr) && (
// // // // //                   <div className="da-card-meta">
// // // // //                     {customer && (
// // // // //                       <div className="da-meta-row">
// // // // //                         <IconUser size={12} />
// // // // //                         <span>
// // // // //                           {typeof customer === 'object'
// // // // //                             ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
// // // // //                             : customer}
// // // // //                         </span>
// // // // //                       </div>
// // // // //                     )}
// // // // //                     {addr && (
// // // // //                       <div className="da-meta-row">
// // // // //                         <IconMapPin size={12} />
// // // // //                         <span>
// // // // //                           {addr.street ? `${addr.street}, ` : ''}{addr.city || ''}
// // // // //                           {addr.pincode ? ` — ${addr.pincode}` : ''}
// // // // //                         </span>
// // // // //                       </div>
// // // // //                     )}
// // // // //                   </div>
// // // // //                 )}

// // // // //                 {/* Items */}
// // // // //                 <div className="da-card-items">
// // // // //                   {(order.items || []).slice(0, 3).map((item: any, idx: number) => (
// // // // //                     <div key={item.id || idx} className="da-item-line">
// // // // //                       <span className="da-item-qty">×{item.quantity}</span>
// // // // //                       <span className="da-item-name">{item.product?.name || item.name || 'Item'}</span>
// // // // //                     </div>
// // // // //                   ))}
// // // // //                   {(order.items || []).length > 3 && (
// // // // //                     <span className="da-item-more">+{order.items.length - 3} more</span>
// // // // //                   )}
// // // // //                 </div>

// // // // //                 {/* Driver tag if assigned */}
// // // // //                 {order.driver && (
// // // // //                   <div className="da-driver-tag">
// // // // //                     <IconTruck size={11} />
// // // // //                     <span>
// // // // //                       {`${order.driver.first_name || ''} ${order.driver.last_name || ''}`.trim() || 'Driver assigned'}
// // // // //                     </span>
// // // // //                   </div>
// // // // //                 )}

// // // // //                 {/* Proof submitted indicator */}
// // // // //                 {status === 'DELIVERY_SUBMITTED' && (
// // // // //                   <div className="da-proof-tag">
// // // // //                     <IconImage size={11} />
// // // // //                     <span>Driver submitted delivery proof</span>
// // // // //                   </div>
// // // // //                 )}

// // // // //                 {/* Total */}
// // // // //                 {(order.grand_total || order.total) && (
// // // // //                   <div className="da-card-total">
// // // // //                     <span>Total</span>
// // // // //                     <strong>{fmtCurrency(order.grand_total || order.total || 0, order.currency)}</strong>
// // // // //                   </div>
// // // // //                 )}

// // // // //                 {/* Action footer */}
// // // // //                 <div className="da-card-footer">
// // // // //                   <button
// // // // //                     className="da-view-btn"
// // // // //                     onClick={e => { e.stopPropagation(); setSelectedOrder(order); setModalOpen(true); }}
// // // // //                   >
// // // // //                     <IconEye size={13} /> View
// // // // //                   </button>
// // // // //                   {renderActionBtn(order)}
// // // // //                 </div>
// // // // //               </div>
// // // // //             );
// // // // //           })}
// // // // //         </div>
// // // // //       )}

// // // // //       {/* ─── Order Detail Modal ─────────────────────────────────────────── */}
// // // // //       {modalOpen && selectedOrder && (
// // // // //         <div className="da-modal-backdrop" onClick={() => setModalOpen(false)}>
// // // // //           <div className="da-modal-card" onClick={e => e.stopPropagation()}>
// // // // //             <div className="da-modal-header">
// // // // //               <h3>Order Details</h3>
// // // // //               <button className="da-modal-close" onClick={() => setModalOpen(false)}>
// // // // //                 <IconX size={16} />
// // // // //               </button>
// // // // //             </div>
// // // // //             <div className="da-modal-body">

// // // // //               {/* Status row */}
// // // // //               <div className="da-modal-meta">
// // // // //                 <div>
// // // // //                   <p className="da-modal-order-num">
// // // // //                     #{selectedOrder.order_number || selectedOrder.id}
// // // // //                   </p>
// // // // //                   <p className="da-modal-order-type">
// // // // //                     {selectedOrder.order_type || 'DELIVERY'} · {fmtDate(selectedOrder.created_at)}
// // // // //                   </p>
// // // // //                 </div>
// // // // //                 <span className={`da-status-pill ${statusPillClass(selectedOrder.status)}`}>
// // // // //                   {statusLabel(selectedOrder.status)}
// // // // //                 </span>
// // // // //               </div>

// // // // //               {/* Order Origin (placed by / source) */}
// // // // //               {(selectedOrder.placed_by || selectedOrder.source || selectedOrder.order_origin || selectedOrder.placed_by_role || selectedOrder.placed_by_email) && (
// // // // //                 <div className="da-modal-section">
// // // // //                   <h5 className="da-modal-section-title">Order Origin</h5>
// // // // //                   <div className="da-modal-info-grid">
// // // // //                     {selectedOrder.placed_by && (
// // // // //                       <div className="da-info-row">
// // // // //                         <IconUser size={13} />
// // // // //                                             <span>{renderValue(selectedOrder.placed_by)}</span>
// // // // //                       </div>
// // // // //                     )}
// // // // //                     {selectedOrder.placed_by_role && (
// // // // //                       <div className="da-info-row">
// // // // //                         <span className="da-origin-role">{selectedOrder.placed_by_role}</span>
// // // // //                       </div>
// // // // //                     )}
// // // // //                     {selectedOrder.placed_by_email && (
// // // // //                       <div className="da-info-row">
// // // // //                         <span>{selectedOrder.placed_by_email}</span>
// // // // //                       </div>
// // // // //                     )}
// // // // //                     {selectedOrder.source && (
// // // // //                       <div className="da-info-row">
// // // // //                         <span>Source: {selectedOrder.source}</span>
// // // // //                       </div>
// // // // //                     )}
// // // // //                   </div>
// // // // //                 </div>
// // // // //               )}

// // // // //               {/* Delivery schedule (expected date / time slot / area) */}
// // // // //               {(selectedOrder.expected_delivery_date || selectedOrder.time_slot || selectedOrder.delivery_area || selectedOrder.area) && (
// // // // //                 <div className="da-modal-section">
// // // // //                   <h5 className="da-modal-section-title">Delivery Schedule</h5>
// // // // //                   <div className="da-modal-info-grid">
// // // // //                     {selectedOrder.expected_delivery_date && (
// // // // //                       <div className="da-info-row">
// // // // //                         <IconClock size={13} />
// // // // //                         <span>{fmtDate(selectedOrder.expected_delivery_date)}</span>
// // // // //                       </div>
// // // // //                     )}
// // // // //                     {selectedOrder.time_slot && (
// // // // //                       <div className="da-info-row">
// // // // //                         <IconClock size={13} />
// // // // //                         <span>{selectedOrder.time_slot}</span>
// // // // //                       </div>
// // // // //                     )}
// // // // //                     {(selectedOrder.delivery_area || selectedOrder.area) && (
// // // // //                       <div className="da-info-row">
// // // // //                         <IconMapPin size={13} />
// // // // //                                             <span>{renderValue(selectedOrder.delivery_area || selectedOrder.area)}</span>
// // // // //                       </div>
// // // // //                     )}
// // // // //                   </div>
// // // // //                 </div>
// // // // //               )}

// // // // //               {/* Payment */}
// // // // //               {selectedOrder.payment_method && (
// // // // //                 <div className="da-modal-section">
// // // // //                   <h5 className="da-modal-section-title">Payment</h5>
// // // // //                   <div className="da-info-row">
// // // // //                     <span>{selectedOrder.payment_method}</span>
// // // // //                     {selectedOrder.payment_status && (
// // // // //                       <span className={`da-payment-chip chip-${(selectedOrder.payment_status || '').toLowerCase()}`}>
// // // // //                         {selectedOrder.payment_status}
// // // // //                       </span>
// // // // //                     )}
// // // // //                     {selectedOrder.currency && (
// // // // //                       <span className="da-currency-label">{selectedOrder.currency}</span>
// // // // //                     )}
// // // // //                   </div>
// // // // //                 </div>
// // // // //               )}

// // // // //               {/* Customer */}
// // // // //               {selectedOrder.customer && (
// // // // //                 <div className="da-modal-section">
// // // // //                   <h5 className="da-modal-section-title">Customer</h5>
// // // // //                   <div className="da-modal-info-grid">
// // // // //                     <div className="da-info-row">
// // // // //                       <IconUser size={13} />
// // // // //                       <span>
// // // // //                         {selectedOrder.customer.first_name} {selectedOrder.customer.last_name}
// // // // //                       </span>
// // // // //                     </div>
// // // // //                     {selectedOrder.customer.phone_no && (
// // // // //                       <div className="da-info-row">
// // // // //                         <IconPhone size={13} />
// // // // //                         <span>{selectedOrder.customer.phone_no}</span>
// // // // //                       </div>
// // // // //                     )}
// // // // //                     {selectedOrder.customer.email && (
// // // // //                       <div className="da-info-row">
// // // // //                         <span className="da-customer-email">{selectedOrder.customer.email}</span>
// // // // //                       </div>
// // // // //                     )}
// // // // //                   </div>
// // // // //                 </div>
// // // // //               )}

// // // // //               {/* Customer & Delivery Address (brief + expanded) */}
// // // // //               {selectedOrder.customer && (
// // // // //                 <div className="da-modal-section">
// // // // //                   <h5 className="da-modal-section-title">Customer & Address</h5>
// // // // //                   <div className="da-modal-info-grid">
// // // // //                     <div className="da-info-row">
// // // // //                       <IconUser size={13} />
// // // // //                       <span>{renderValue(selectedOrder.customer.first_name || selectedOrder.customer.name || (selectedOrder.customer.first_name && selectedOrder.customer.last_name ? `${selectedOrder.customer.first_name} ${selectedOrder.customer.last_name}` : ''))}</span>
// // // // //                     </div>
// // // // //                     {selectedOrder.customer.phone_no && (
// // // // //                       <div className="da-info-row">
// // // // //                         <IconPhone size={13} />
// // // // //                         <span>{renderValue(selectedOrder.customer.phone_no)}</span>
// // // // //                       </div>
// // // // //                     )}
// // // // //                     {selectedOrder.customer.email && (
// // // // //                       <div className="da-info-row">
// // // // //                         <span className="da-customer-email">{renderValue(selectedOrder.customer.email)}</span>
// // // // //                       </div>
// // // // //                     )}

// // // // //                     {selectedOrder.delivery_address && (
// // // // //                       <div className="da-address-box">
// // // // //                         <strong className="da-address-label">Address:</strong>
// // // // //                         <div className="da-address-lines">
// // // // //                           {selectedOrder.delivery_address.building && (
// // // // //                             <div><span className="da-address-field">Building:</span> {renderValue(selectedOrder.delivery_address.building)}</div>
// // // // //                           )}
// // // // //                           {selectedOrder.delivery_address.block && (
// // // // //                             <div><span className="da-address-field">Block:</span> {renderValue(selectedOrder.delivery_address.block)}</div>
// // // // //                           )}
// // // // //                           {selectedOrder.delivery_address.avenue && (
// // // // //                             <div><span className="da-address-field">Avenue:</span> {renderValue(selectedOrder.delivery_address.avenue)}</div>
// // // // //                           )}
// // // // //                           {selectedOrder.delivery_address.street && (
// // // // //                             <div><span className="da-address-field">Street:</span> {renderValue(selectedOrder.delivery_address.street)}</div>
// // // // //                           )}
// // // // //                           {(selectedOrder.delivery_address.floor || selectedOrder.delivery_address.apt || selectedOrder.delivery_address.apartment) && (
// // // // //                             <div><span className="da-address-field">Floor/Apt:</span> {renderValue(selectedOrder.delivery_address.floor || selectedOrder.delivery_address.apt || selectedOrder.delivery_address.apartment)}</div>
// // // // //                           )}
// // // // //                           {selectedOrder.delivery_address.address_notes && (
// // // // //                             <div><span className="da-address-field">Address notes:</span> {renderValue(selectedOrder.delivery_address.address_notes)}</div>
// // // // //                           )}
// // // // //                           {/* Fallback short line if none of the above present */}
// // // // //                           {!selectedOrder.delivery_address.building && !selectedOrder.delivery_address.block && !selectedOrder.delivery_address.avenue && !selectedOrder.delivery_address.street && (
// // // // //                             <div>{renderValue(selectedOrder.delivery_address.city)}{selectedOrder.delivery_address.pincode ? ` — ${renderValue(selectedOrder.delivery_address.pincode)}` : ''}</div>
// // // // //                           )}
// // // // //                         </div>
// // // // //                       </div>
// // // // //                     )}

// // // // //                   </div>
// // // // //                 </div>
// // // // //               )}


// // // // //               {/* Assigned driver */}
// // // // //               {selectedOrder.driver && (
// // // // //                 <div className="da-modal-section">
// // // // //                   <h5 className="da-modal-section-title">Assigned Driver</h5>
// // // // //                   <div className="da-modal-driver-tag">
// // // // //                     <IconTruck size={14} />
// // // // //                     <span>
// // // // //                       {`${selectedOrder.driver.first_name || ''} ${selectedOrder.driver.last_name || ''}`.trim()}
// // // // //                     </span>
// // // // //                     {selectedOrder.driver.phone_no && (
// // // // //                       <span className="da-driver-phone-modal">· {selectedOrder.driver.phone_no}</span>
// // // // //                     )}
// // // // //                   </div>
// // // // //                 </div>
// // // // //               )}

// // // // //               {/* Delivery proof (shown when driver submitted) */}
// // // // //               {(selectedOrder.status === 'DELIVERY_SUBMITTED' || selectedOrder.delivery_photo) && (
// // // // //                 <div className="da-modal-section da-proof-section">
// // // // //                   <h5 className="da-modal-section-title">Delivery Proof from Driver</h5>
// // // // //                   {selectedOrder.delivery_photo && (
// // // // //                     <a
// // // // //                       href={selectedOrder.delivery_photo}
// // // // //                       target="_blank"
// // // // //                       rel="noopener noreferrer"
// // // // //                       className="da-proof-photo-link"
// // // // //                     >
// // // // //                       <IconImage size={14} /> View Photo ↗
// // // // //                     </a>
// // // // //                   )}
// // // // //                   {selectedOrder.delivery_notes && (
// // // // //                     <p className="da-proof-notes">
// // // // //                       <strong>Driver note:</strong> {selectedOrder.delivery_notes}
// // // // //                     </p>
// // // // //                   )}
// // // // //                   {selectedOrder.customer_confirmation_name && (
// // // // //                     <p className="da-proof-notes">
// // // // //                       <strong>Received by:</strong> {selectedOrder.customer_confirmation_name}
// // // // //                       {selectedOrder.customer_confirmation_phone
// // // // //                         ? ` · ${selectedOrder.customer_confirmation_phone}`
// // // // //                         : ''}
// // // // //                     </p>
// // // // //                   )}
// // // // //                   {selectedOrder.driver_submitted_at && (
// // // // //                     <p className="da-proof-notes">
// // // // //                       <strong>Submitted:</strong>{' '}
// // // // //                       {new Date(selectedOrder.driver_submitted_at).toLocaleString()}
// // // // //                     </p>
// // // // //                   )}
// // // // //                 </div>
// // // // //               )}

// // // // //               {/* Items */}
// // // // //               <div className="da-modal-section">
// // // // //                 <h5 className="da-modal-section-title">Order Items</h5>
// // // // //                 <div className="da-modal-items">
// // // // //                   {(selectedOrder.items || []).map((item: any, idx: number) => (
// // // // //                     <div key={item.id || idx} className="da-modal-item-row">
// // // // //                       <div className="da-modal-item-left">
// // // // //                         <span className="da-modal-qty">×{item.quantity}</span>
// // // // //                         <div className="da-modal-item-with-thumb">
// // // // //                           {((item.product && (item.product.image || item.product.image_url)) || item.image) && (
// // // // //                             <div className="da-item-thumb">
// // // // //                               <img
// // // // //                                 src={item.product?.image || item.product?.image_url || item.image}
// // // // //                                 alt={item.product?.name || item.name}
// // // // //                                 onError={(e: any) => { e.target.style.display = 'none'; }}
// // // // //                               />
// // // // //                             </div>
// // // // //                           )}
// // // // //                           <div>
// // // // //                             <p className="da-modal-item-name">{item.product?.name || item.name}</p>
// // // // //                             {item.product?.description && (
// // // // //                               <p className="da-modal-item-desc">{item.product.description}</p>
// // // // //                             )}
// // // // //                           </div>
// // // // //                         </div>
// // // // //                       </div>
// // // // //                       <span className="da-modal-item-price">
// // // // //                         {fmtCurrency(item.line_total || (item.price * item.quantity) || 0, selectedOrder?.currency)}
// // // // //                       </span>
// // // // //                     </div>
// // // // //                   ))}
// // // // //                 </div>
// // // // //               </div>

// // // // //               {/* Delivery notes from order */}
// // // // //               {selectedOrder.delivery_notes && selectedOrder.status !== 'DELIVERY_SUBMITTED' && (
// // // // //                 <div className="da-modal-notes">
// // // // //                   <h5 className="da-modal-section-title">Delivery Notes</h5>
// // // // //                   <p className="da-modal-notes-text">"{selectedOrder.delivery_notes}"</p>
// // // // //                 </div>
// // // // //               )}

// // // // //               {/* Totals */}
// // // // //               <div className="da-modal-totals">
// // // // //                 <div className="da-total-row">
// // // // //                   <span>Subtotal</span><span>{fmtCurrency(selectedOrder.subtotal, selectedOrder.currency)}</span>
// // // // //                 </div>
// // // // //                 <div className="da-total-row">
// // // // //                   <span>Delivery</span><span>{fmtCurrency(selectedOrder.delivery_charge, selectedOrder.currency)}</span>
// // // // //                 </div>
// // // // //                 {selectedOrder.discount > 0 && (
// // // // //                   <div className="da-total-row da-total-discount">
// // // // //                     <span>Discount</span><span>−{fmtCurrency(selectedOrder.discount, selectedOrder.currency)}</span>
// // // // //                   </div>
// // // // //                 )}
// // // // //                 <div className="da-total-row da-total-grand">
// // // // //                   <span>Total</span>
// // // // //                   <strong>{fmtCurrency(selectedOrder.grand_total || selectedOrder.total || 0, selectedOrder.currency)}</strong>
// // // // //                 </div>
// // // // //               </div>
// // // // //             </div>

// // // // //             <div className="da-modal-footer">
// // // // //               <button className="da-modal-print" onClick={() => window.print()}>Print Receipt</button>
// // // // //               <button className="da-modal-cancel" onClick={() => setModalOpen(false)}>Close</button>
// // // // //               {renderActionBtn(selectedOrder, true)}
// // // // //             </div>
// // // // //           </div>
// // // // //         </div>
// // // // //       )}

// // // // //       {/* ─── Driver Assignment Modal ────────────────────────────────────── */}
// // // // //       {driverModalOpen && (
// // // // //         <div className="da-modal-backdrop" onClick={() => { setDriverModalOpen(false); setAssignSuccess(null); }}>
// // // // //           <div className="da-modal-card da-driver-modal" onClick={e => e.stopPropagation()}>
// // // // //             <div className="da-modal-header">
// // // // //               <div>
// // // // //                 <h3>Assign Driver</h3>
// // // // //                 {assignTargetOrder && (
// // // // //                   <p className="da-modal-sub">
// // // // //                     Order #{assignTargetOrder.order_number || assignTargetOrder.id}
// // // // //                     {assignTargetOrder.customer && (
// // // // //                       <span>
// // // // //                         {' · '}{assignTargetOrder.customer.first_name} {assignTargetOrder.customer.last_name}
// // // // //                       </span>
// // // // //                     )}
// // // // //                   </p>
// // // // //                 )}
// // // // //               </div>
// // // // //               <button
// // // // //                 className="da-modal-close"
// // // // //                 onClick={() => { setDriverModalOpen(false); setAssignSuccess(null); }}
// // // // //               >
// // // // //                 <IconX size={16} />
// // // // //               </button>
// // // // //             </div>

// // // // //             <div className="da-modal-body">
// // // // //               {/* Success banner */}
// // // // //               {assignSuccess && (
// // // // //                 <div className="da-assign-success">
// // // // //                   <IconCheckCircle size={18} /><span>{assignSuccess}</span>
// // // // //                 </div>
// // // // //               )}

// // // // //               {driverLoading ? (
// // // // //                 <div className="da-center-loader" style={{ minHeight: 180 }}>
// // // // //                   <div className="da-spinner" /><p>Loading available drivers…</p>
// // // // //                 </div>
// // // // //               ) : drivers.length === 0 ? (
// // // // //                 <div className="da-empty-state" style={{ padding: '40px 20px' }}>
// // // // //                   <IconUser size={40} />
// // // // //                   <h3>No Drivers Found</h3>
// // // // //                   <p>No drivers are registered yet, or all are currently on deliveries.</p>
// // // // //                 </div>
// // // // //               ) : (
// // // // //                 <>
// // // // //                   {/* Search */}
// // // // //                   <div className="da-driver-search">
// // // // //                     <IconSearch size={15} />
// // // // //                     <input
// // // // //                       type="text"
// // // // //                       placeholder="Search by name or phone…"
// // // // //                       value={driverSearch}
// // // // //                       onChange={e => setDriverSearch(e.target.value)}
// // // // //                     />
// // // // //                   </div>

// // // // //                   {/* Legend */}
// // // // //                   <div className="da-driver-list-header">
// // // // //                     <p className="da-driver-list-hint">
// // // // //                       {filteredDrivers.length} driver{filteredDrivers.length !== 1 ? 's' : ''}
// // // // //                       {driverSearch ? ' found' : ''} — tap to assign
// // // // //                     </p>
// // // // //                     <div className="da-driver-legend">
// // // // //                       <span className="da-legend-dot ds-available" /> Available
// // // // //                       <span className="da-legend-dot ds-busy" /> Busy
// // // // //                       <span className="da-legend-dot ds-offline" /> Offline
// // // // //                     </div>
// // // // //                   </div>

// // // // //                   <div className="da-driver-list">
// // // // //                     {filteredDrivers.length === 0 ? (
// // // // //                       <div className="da-driver-no-results">
// // // // //                         <p>No drivers match "{driverSearch}"</p>
// // // // //                       </div>
// // // // //                     ) : (
// // // // //                       filteredDrivers.map(driver => {
// // // // //                         // availability_status is the field added in fixed User model
// // // // //                         const rawStatus   = driver.availability_status || driver.status || 'OFFLINE';
// // // // //                         const dStatus     = rawStatus.toUpperCase();
// // // // //                         const isAssigning = assigningDriver === driver.id;
// // // // //                         const isDisabled  = assigningDriver !== null && !isAssigning;

// // // // //                         return (
// // // // //                           <div
// // // // //                             key={driver.id}
// // // // //                             className={[
// // // // //                               'da-driver-card',
// // // // //                               dStatus === 'ONLINE' || dStatus === 'AVAILABLE' ? 'da-driver-available' : '',
// // // // //                               isAssigning ? 'da-driver-assigning' : '',
// // // // //                               isDisabled  ? 'da-driver-disabled'  : '',
// // // // //                             ].join(' ')}
// // // // //                             onClick={() => !isAssigning && !isDisabled && handleAssignDriver(driver)}
// // // // //                           >
// // // // //                             <div className="da-driver-avatar">
// // // // //                               {(driver.first_name || driver.name || 'D').charAt(0).toUpperCase()}
// // // // //                             </div>
// // // // //                             <div className="da-driver-info">
// // // // //                               <p className="da-driver-name">
// // // // //                                 {driver.first_name || driver.name || 'Driver'}
// // // // //                                 {driver.last_name ? ` ${driver.last_name}` : ''}
// // // // //                               </p>
// // // // //                               <div className="da-driver-meta">
// // // // //                                 {driver.phone_no && (
// // // // //                                   <span className="da-driver-phone">
// // // // //                                     <IconPhone size={11} />{driver.phone_no}
// // // // //                                   </span>
// // // // //                                 )}
// // // // //                                 {driver.rating > 0 && (
// // // // //                                   <span className="da-driver-rating">
// // // // //                                     <IconStar size={11} />{Number(driver.rating).toFixed(1)}
// // // // //                                   </span>
// // // // //                                 )}
// // // // //                               </div>
// // // // //                             </div>
// // // // //                             <div className="da-driver-right">
// // // // //                               <span className={`da-driver-status ${driverStatusClass(dStatus)}`}>
// // // // //                                 {driverStatusLabel(dStatus)}
// // // // //                               </span>
// // // // //                               {isAssigning ? (
// // // // //                                 <div className="da-spinner da-spinner-sm" />
// // // // //                               ) : (
// // // // //                                 <button
// // // // //                                   className="da-assign-btn"
// // // // //                                   disabled={isDisabled}
// // // // //                                   onClick={e => { e.stopPropagation(); handleAssignDriver(driver); }}
// // // // //                                 >
// // // // //                                   Assign
// // // // //                                 </button>
// // // // //                               )}
// // // // //                             </div>
// // // // //                           </div>
// // // // //                         );
// // // // //                       })
// // // // //                     )}
// // // // //                   </div>
// // // // //                 </>
// // // // //               )}
// // // // //             </div>
// // // // //           </div>
// // // // //         </div>
// // // // //       )}

// // // // //       {/* ─── Confirm Delivery Modal ─────────────────────────────────────── */}
// // // // //       {/* Shown when driver has submitted proof (DELIVERY_SUBMITTED).
// // // // //           Delivery agent reviews the proof and clicks Confirm to set DELIVERED. */}
// // // // //       {confirmModalOpen && confirmTarget && (
// // // // //         <div className="da-modal-backdrop" onClick={() => setConfirmModalOpen(false)}>
// // // // //           <div className="da-modal-card da-confirm-modal" onClick={e => e.stopPropagation()}>
// // // // //             <div className="da-modal-header">
// // // // //               <div>
// // // // //                 <h3>Confirm Delivery</h3>
// // // // //                 <p className="da-modal-sub">
// // // // //                   Order #{confirmTarget.order_number || confirmTarget.id}
// // // // //                 </p>
// // // // //               </div>
// // // // //               <button className="da-modal-close" onClick={() => setConfirmModalOpen(false)}>
// // // // //                 <IconX size={16} />
// // // // //               </button>
// // // // //             </div>
// // // // //             <div className="da-modal-body">
// // // // //               <div className="da-confirm-desc">
// // // // //                 <p>
// // // // //                   Driver <strong>
// // // // //                     {confirmTarget.driver
// // // // //                       ? `${confirmTarget.driver.first_name || ''} ${confirmTarget.driver.last_name || ''}`.trim()
// // // // //                       : 'your driver'}
// // // // //                   </strong> has submitted delivery proof for this order.
// // // // //                 </p>
// // // // //                 <p>Review the proof below and confirm to mark it as <strong>DELIVERED</strong>.</p>
// // // // //               </div>

// // // // //               {/* Show proof details in confirm modal too */}
// // // // //               {confirmTarget.delivery_photo && (
// // // // //                 <a
// // // // //                   href={confirmTarget.delivery_photo}
// // // // //                   target="_blank"
// // // // //                   rel="noopener noreferrer"
// // // // //                   className="da-proof-photo-link"
// // // // //                 >
// // // // //                   <IconImage size={14} /> View delivery photo ↗
// // // // //                 </a>
// // // // //               )}
// // // // //               {confirmTarget.delivery_notes && (
// // // // //                 <p className="da-proof-notes">
// // // // //                   <strong>Driver note:</strong> {confirmTarget.delivery_notes}
// // // // //                 </p>
// // // // //               )}
// // // // //               {confirmTarget.customer_confirmation_name && (
// // // // //                 <p className="da-proof-notes">
// // // // //                   <strong>Received by:</strong> {confirmTarget.customer_confirmation_name}
// // // // //                 </p>
// // // // //               )}
// // // // //               {!confirmTarget.delivery_photo && !confirmTarget.delivery_notes && (
// // // // //                 <p className="da-proof-notes da-proof-none">No photo or notes submitted by driver.</p>
// // // // //               )}
// // // // //             </div>
// // // // //             <div className="da-modal-footer">
// // // // //               <button
// // // // //                 className="da-modal-cancel"
// // // // //                 disabled={actionLoading === confirmTarget.id}
// // // // //                 onClick={() => setConfirmModalOpen(false)}
// // // // //               >
// // // // //                 Cancel
// // // // //               </button>
// // // // //               <button
// // // // //                 className="da-action-primary bg-delivered"
// // // // //                 disabled={actionLoading === confirmTarget.id}
// // // // //                 onClick={handleConfirmDelivery}
// // // // //               >
// // // // //                 <IconCheckCircle size={14} />
// // // // //                 {actionLoading === confirmTarget.id ? 'Confirming…' : 'Confirm Delivered'}
// // // // //               </button>
// // // // //             </div>
// // // // //           </div>
// // // // //         </div>
// // // // //       )}

// // // // //     </div>
// // // // //   );
// // // // // };

// // // // // export default DeliveryOrder;


// // // // import React, { useState, useEffect, useCallback, useMemo } from 'react';
// // // // import './DeliveryOrder.css';

// // // // // ─── Service imports ─────────────────────────────────────────────────────────
// // // // // All URLs come from delivery_routes.py and order_routes.py
// // // // import {
// // // //   getDeliveryPending,       // GET  /delivery/pending         → READY orders (kitchen done, agent not yet assigned)
// // // //   getDeliveryAssigned,      // GET  /delivery/assigned        → ASSIGNED_TO_AGENT orders
// // // //   getDeliveryReady,         // GET  /delivery/ready-for-pickup→ ASSIGNED_TO_DRIVER | DRIVER_ACCEPTED | OUT_FOR_DELIVERY
// // // //   getDeliveryProofPending,  // GET  /delivery/proof-pending   → DELIVERY_SUBMITTED (driver sent proof)
// // // //   getDeliveryDelivered,     // GET  /delivery/delivered       → DELIVERED orders
// // // // } from '../../services/deliveryService';

// // // // import {
// // // //   assignDriverToOrder,      // POST /orders/:id/assign-driver    { driver_id } → ASSIGNED_TO_DRIVER
// // // //   markOrderDelivered,       // POST /orders/:id/confirm-delivery                → DELIVERED
// // // // } from '../../services/orderService';

// // // // import {
// // // //   getAvailableDrivers,      // GET  /drivers/available
// // // //   getDrivers,               // GET  /drivers
// // // // } from '../../services/driverService';

// // // // // ─── SVG Icons ────────────────────────────────────────────────────────────────
// // // // const IconTruck = ({ size = 20 }: { size?: number }) => (
// // // //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
// // // //     <rect x="1" y="3" width="15" height="13" rx="2" />
// // // //     <path d="M16 8h4l3 3v5h-7V8z" />
// // // //     <circle cx="5.5" cy="18.5" r="2.5" />
// // // //     <circle cx="18.5" cy="18.5" r="2.5" />
// // // //   </svg>
// // // // );
// // // // const IconClock = ({ size = 18 }: { size?: number }) => (
// // // //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// // // //     <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
// // // //   </svg>
// // // // );
// // // // const IconCheckCircle = ({ size = 18 }: { size?: number }) => (
// // // //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// // // //     <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
// // // //   </svg>
// // // // );
// // // // const IconUser = ({ size = 18 }: { size?: number }) => (
// // // //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// // // //     <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
// // // //   </svg>
// // // // );
// // // // const IconMapPin = ({ size = 14 }: { size?: number }) => (
// // // //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// // // //     <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
// // // //   </svg>
// // // // );
// // // // const IconPackage = ({ size = 20 }: { size?: number }) => (
// // // //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// // // //     <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
// // // //     <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
// // // //     <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
// // // //     <line x1="12" y1="22.08" x2="12" y2="12" />
// // // //   </svg>
// // // // );
// // // // const IconRefresh = ({ size = 16 }: { size?: number }) => (
// // // //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// // // //     <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
// // // //     <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
// // // //   </svg>
// // // // );
// // // // const IconX = ({ size = 18 }: { size?: number }) => (
// // // //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// // // //     <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
// // // //   </svg>
// // // // );
// // // // const IconPhone = ({ size = 14 }: { size?: number }) => (
// // // //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// // // //     <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.88a16 16 0 0 0 6.21 6.21l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
// // // //   </svg>
// // // // );
// // // // const IconSearch = ({ size = 16 }: { size?: number }) => (
// // // //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// // // //     <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
// // // //   </svg>
// // // // );
// // // // const IconStar = ({ size = 13 }: { size?: number }) => (
// // // //   <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
// // // //     <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
// // // //   </svg>
// // // // );
// // // // const IconEye = ({ size = 16 }: { size?: number }) => (
// // // //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// // // //     <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
// // // //   </svg>
// // // // );
// // // // const IconAlert = ({ size = 16 }: { size?: number }) => (
// // // //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// // // //     <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
// // // //   </svg>
// // // // );
// // // // const IconImage = ({ size = 16 }: { size?: number }) => (
// // // //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// // // //     <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
// // // //     <polyline points="21 15 16 10 5 21" />
// // // //   </svg>
// // // // );

// // // // // ─── Types ────────────────────────────────────────────────────────────────────

// // // // /**
// // // //  * Tab keys mapped to the backend delivery_routes.py endpoints:
// // // //  *
// // // //  *  'pending'        → GET /delivery/pending          (status = READY, kitchen done, unassigned)
// // // //  *  'assigned'       → GET /delivery/assigned         (status = ASSIGNED_TO_AGENT)
// // // //  *  'driver_active'  → GET /delivery/ready-for-pickup (status = ASSIGNED_TO_DRIVER | DRIVER_ACCEPTED | OUT_FOR_DELIVERY)
// // // //  *  'proof_pending'  → GET /delivery/proof-pending    (status = DELIVERY_SUBMITTED)
// // // //  *  'delivered'      → GET /delivery/delivered        (status = DELIVERED)
// // // //  *  'all'            → all of the above merged
// // // //  */
// // // // type TabType = 'all' | 'pending' | 'assigned' | 'driver_active' | 'proof_pending' | 'delivered';

// // // // // ─── Status helpers ───────────────────────────────────────────────────────────

// // // // // Backend status → pill CSS class
// // // // const statusPillClass = (s: string): string => {
// // // //   switch ((s || '').toUpperCase()) {
// // // //     case 'READY':               return 'pill-ready';
// // // //     case 'ASSIGNED_TO_AGENT':   return 'pill-assigned';
// // // //     case 'ASSIGNED_TO_DRIVER':  return 'pill-assigned';
// // // //     case 'DRIVER_ACCEPTED':     return 'pill-onway';
// // // //     case 'OUT_FOR_DELIVERY':    return 'pill-onway';
// // // //     case 'DELIVERY_SUBMITTED':  return 'pill-proof';
// // // //     case 'DELIVERED':           return 'pill-delivered';
// // // //     case 'CANCELLED':           return 'pill-cancelled';
// // // //     default:                    return 'pill-default';
// // // //   }
// // // // };

// // // // // Human-readable label for each backend status
// // // // const statusLabel = (s: string): string => {
// // // //   switch ((s || '').toUpperCase()) {
// // // //     case 'READY':               return 'Ready';
// // // //     case 'ASSIGNED_TO_AGENT':   return 'Agent Assigned';
// // // //     case 'ASSIGNED_TO_DRIVER':  return 'Driver Assigned';
// // // //     case 'DRIVER_ACCEPTED':     return 'Out for Delivery';
// // // //     case 'OUT_FOR_DELIVERY':    return 'Out for Delivery';
// // // //     case 'DELIVERY_SUBMITTED':  return 'Proof Submitted';
// // // //     case 'DELIVERED':           return 'Delivered';
// // // //     default:                    return (s || '').replace(/_/g, ' ');
// // // //   }
// // // // };

// // // // // Driver availability chip class
// // // // const driverStatusClass = (s: string): string => {
// // // //   const st = (s || '').toUpperCase();
// // // //   if (st === 'ONLINE' || st === 'AVAILABLE') return 'ds-available';
// // // //   if (st === 'BUSY')                         return 'ds-busy';
// // // //   return 'ds-offline';
// // // // };

// // // // const driverStatusLabel = (s: string): string => {
// // // //   const st = (s || '').toUpperCase();
// // // //   if (st === 'ONLINE' || st === 'AVAILABLE') return 'Available';
// // // //   if (st === 'BUSY')                         return 'Busy';
// // // //   return 'Offline';
// // // // };

// // // // // ─── Formatters ───────────────────────────────────────────────────────────────

// // // // const fmtTime = (dt: string) =>
// // // //   dt ? new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—';
// // // // const fmtDate = (dt: string) =>
// // // //   dt ? new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—';

// // // // const currencySymbol = (cur?: string) => {
// // // //   const c = cur || (typeof window !== 'undefined' ? localStorage.getItem('currency') || 'INR' : 'INR');
// // // //   return c === 'INR' ? '₹' : c;
// // // // };

// // // // const fmtCurrency = (n: number | undefined, cur?: string) => `${currencySymbol(cur)}${Number(n || 0).toFixed(0)}`;

// // // // // Safely render a value that may be a string, number, or object coming from the API.
// // // // // If it's an object, prefer common display fields (name, first_name, full_name) before falling
// // // // // back to a JSON string so React never receives a raw object as a child.
// // // // const renderValue = (v: any) => {
// // // //   if (v === null || v === undefined) return '';
// // // //   if (typeof v === 'string' || typeof v === 'number') return String(v);
// // // //   if (typeof v === 'object') {
// // // //     return (
// // // //       v.name || v.title || v.first_name || v.firstName || v.full_name || v.email || JSON.stringify(v)
// // // //     );
// // // //   }
// // // //   return String(v);
// // // // };

// // // // // ─── Agent-exclusive item helpers ──────────────────────────────────────────────
// // // // // Agent-exclusive line items (custom_json.product_type === 'AGENT') come back
// // // // // from the backend under `item.agent_product` instead of `item.product`, since
// // // // // their `product_id` is null on those order_item rows. Every place that used to
// // // // // read `item.product?.x` directly needs to resolve through this helper first,
// // // // // the same way OrderManagement.tsx / KitchenOrder.tsx already do — otherwise
// // // // // agent-exclusive items render as a blank/generic "Item" here.
// // // // const getItemCustomJson = (item: any) => item?.custom_json || {};

// // // // const isAgentExclusiveItem = (item: any) => getItemCustomJson(item)?.product_type === 'AGENT';

// // // // const getItemProductSource = (item: any) => {
// // // //   const agentProduct = item?.agent_product ?? {};
// // // //   const product = item?.product ?? {};
// // // //   return isAgentExclusiveItem(item) ? agentProduct : product;
// // // // };

// // // // const getItemDisplayName = (item: any) => {
// // // //   const source = getItemProductSource(item);
// // // //   return (
// // // //     source?.name ||
// // // //     item?.product_name ||
// // // //     item?.name ||
// // // //     (isAgentExclusiveItem(item) ? 'Agent Product' : 'Item')
// // // //   );
// // // // };

// // // // const getItemDisplayImage = (item: any) => {
// // // //   const source = getItemProductSource(item);
// // // //   return source?.image || source?.image_url || source?.imageUrl || item?.image || null;
// // // // };

// // // // const getItemDisplayDescription = (item: any) => {
// // // //   const source = getItemProductSource(item);
// // // //   return source?.description || null;
// // // // };

// // // // // ─── Component ────────────────────────────────────────────────────────────────

// // // // const DeliveryOrder: React.FC = () => {

// // // //   // ── State ──────────────────────────────────────────────────────────────────

// // // //   const [activeTab,        setActiveTab]        = useState<TabType>('all');

// // // //   // Order buckets — one per backend endpoint
// // // //   const [pendingOrders,      setPendingOrders]      = useState<any[]>([]);  // READY
// // // //   const [assignedOrders,     setAssignedOrders]     = useState<any[]>([]);  // ASSIGNED_TO_AGENT
// // // //   const [driverActiveOrders, setDriverActiveOrders] = useState<any[]>([]);  // ASSIGNED_TO_DRIVER | DRIVER_ACCEPTED | OUT_FOR_DELIVERY
// // // //   const [proofOrders,        setProofOrders]        = useState<any[]>([]);  // DELIVERY_SUBMITTED
// // // //   const [deliveredOrders,    setDeliveredOrders]    = useState<any[]>([]);  // DELIVERED

// // // //   const [loading,       setLoading]       = useState(true);
// // // //   const [refreshing,    setRefreshing]    = useState(false);
// // // //   const [actionLoading, setActionLoading] = useState<number | null>(null);
// // // //   const [error,         setError]         = useState<string | null>(null);
// // // //   const [successMsg,    setSuccessMsg]    = useState<string | null>(null);

// // // //   // Order detail modal
// // // //   const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
// // // //   const [modalOpen,     setModalOpen]     = useState(false);

// // // //   // Driver assignment modal
// // // //   const [driverModalOpen,   setDriverModalOpen]   = useState(false);
// // // //   const [assignTargetOrder, setAssignTargetOrder] = useState<any | null>(null);
// // // //   const [drivers,           setDrivers]           = useState<any[]>([]);
// // // //   const [filteredDrivers,   setFilteredDrivers]   = useState<any[]>([]);
// // // //   const [driverLoading,     setDriverLoading]     = useState(false);
// // // //   const [assigningDriver,   setAssigningDriver]   = useState<number | null>(null);
// // // //   const [driverSearch,      setDriverSearch]      = useState('');
// // // //   const [assignSuccess,     setAssignSuccess]     = useState<string | null>(null);

// // // //   // Confirm-delivery modal
// // // //   const [confirmModalOpen,  setConfirmModalOpen]  = useState(false);
// // // //   const [confirmTarget,     setConfirmTarget]     = useState<any | null>(null);

// // // //   // ── Fetch all buckets concurrently ────────────────────────────────────────



// // // //   const fetchAll = useCallback(async (silent = false) => {
// // // //     if (!silent) setLoading(true);
// // // //     else         setRefreshing(true);
// // // //     setError(null);
// // // //     try {
// // // //       const [pending, assigned, driverActive, proof, delivered] = await Promise.all([
// // // //         getDeliveryPending().catch(() => []),
// // // //         getDeliveryAssigned().catch(() => []),
// // // //         getDeliveryReady().catch(() => []),
// // // //         getDeliveryProofPending().catch(() => []),
// // // //         getDeliveryDelivered().catch(() => []),
// // // //       ]);
// // // //       setPendingOrders(pending);
// // // //       setAssignedOrders(assigned);
// // // //       setDriverActiveOrders(driverActive);
// // // //       setProofOrders(proof);
// // // //       setDeliveredOrders(delivered);
// // // //     } catch (err) {
// // // //       console.error('Delivery fetch error', err);
// // // //       setError('Failed to load orders. Please refresh.');
// // // //     } finally {
// // // //       setLoading(false);
// // // //       setRefreshing(false);
// // // //     }
// // // //   }, []);

// // // //   useEffect(() => { fetchAll(); }, [fetchAll]);

  

// // // //   // ── Driver search filter ──────────────────────────────────────────────────

// // // //   useEffect(() => {
// // // //     if (!driverSearch.trim()) { setFilteredDrivers(drivers); return; }
// // // //     const q = driverSearch.toLowerCase();
// // // //     setFilteredDrivers(drivers.filter(d => {
// // // //       const name  = `${d.first_name || d.name || ''} ${d.last_name || ''}`.toLowerCase();
// // // //       const phone = (d.phone_no || '').toLowerCase();
// // // //       return name.includes(q) || phone.includes(q);
// // // //     }));
// // // //   }, [driverSearch, drivers]);


  
// // // //   // ── Derived data ──────────────────────────────────────────────────────────

// // // //   const allOrders = useMemo(() =>
// // // //     // Combine buckets and deduplicate by `id` to avoid rendering duplicate keys
// // // //     (() => {
// // // //       const combined = [...pendingOrders, ...assignedOrders, ...driverActiveOrders, ...proofOrders, ...deliveredOrders];
// // // //       const byId = new Map<number | string, any>();
// // // //       for (const o of combined) {
// // // //         const key = o?.id ?? Math.random();
// // // //         if (!byId.has(key)) {
// // // //           byId.set(key, o);
// // // //         } else {
// // // //           // keep the newest by created_at
// // // //           const existing = byId.get(key);
// // // //           try {
// // // //             const exTime = existing?.created_at ? new Date(existing.created_at).getTime() : 0;
// // // //             const newTime = o?.created_at ? new Date(o.created_at).getTime() : 0;
// // // //             if (newTime > exTime) byId.set(key, o);
// // // //           } catch (e) {
// // // //             // fallback: overwrite
// // // //             byId.set(key, o);
// // // //           }
// // // //         }
// // // //       }
// // // //       return Array.from(byId.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
// // // //     })(),
// // // //     [pendingOrders, assignedOrders, driverActiveOrders, proofOrders, deliveredOrders]
// // // //   );

// // // //   const visibleOrders = useMemo(() => {
// // // //     switch (activeTab) {
// // // //       case 'pending':       return pendingOrders;
// // // //       case 'assigned':      return assignedOrders;
// // // //       case 'driver_active': return driverActiveOrders;
// // // //       case 'proof_pending': return proofOrders;
// // // //       case 'delivered':     return deliveredOrders;
// // // //       default:              return allOrders;
// // // //     }
// // // //   }, [activeTab, pendingOrders, assignedOrders, driverActiveOrders, proofOrders, deliveredOrders, allOrders]);

// // // //   // ── Success toast helper ──────────────────────────────────────────────────

// // // //   const showSuccess = (msg: string) => {
// // // //     setSuccessMsg(msg);
// // // //     setTimeout(() => setSuccessMsg(null), 3000);
// // // //   };

// // // //   // ── Open driver assignment modal ──────────────────────────────────────────
// // // //   // Called when delivery agent wants to assign a driver to an ASSIGNED_TO_AGENT order.
// // // //   // Loads /drivers/available first; falls back to /drivers.

// // // //   const handleOpenAssign = async (order: any, e?: React.MouseEvent) => {
// // // //     e?.stopPropagation();
// // // //     setAssignTargetOrder(order);
// // // //     setDriverModalOpen(true);
// // // //     setDriverLoading(true);
// // // //     setDriverSearch('');
// // // //     setAssignSuccess(null);
// // // //     setError(null);
// // // //     try {
// // // //       let list: any[] = await getAvailableDrivers().catch(() => []);
// // // //       if (!list || list.length === 0) {
// // // //         list = await getDrivers().catch(() => []);
// // // //       }
// // // //       setDrivers(list);
// // // //       setFilteredDrivers(list);
// // // //     } catch {
// // // //       setDrivers([]);
// // // //       setFilteredDrivers([]);
// // // //     } finally {
// // // //       setDriverLoading(false);
// // // //     }
// // // //   };

// // // //   // ── Assign driver ─────────────────────────────────────────────────────────
// // // //   // POST /orders/:id/assign-driver  { driver_id }
// // // //   // Backend: requires status = ASSIGNED_TO_AGENT or ASSIGNED_TO_DRIVER (re-assign)
// // // //   // → sets status = ASSIGNED_TO_DRIVER

// // // //   const handleAssignDriver = async (driver: any) => {
// // // //     if (!assignTargetOrder || assigningDriver !== null) return;
// // // //     setAssigningDriver(driver.id);
// // // //     setError(null);
// // // //     try {
// // // //       await assignDriverToOrder(Number(assignTargetOrder.id), Number(driver.id));
// // // //       const driverName = `${driver.first_name || driver.name || 'Driver'} ${driver.last_name || ''}`.trim();
// // // //       setAssignSuccess(`Order #${assignTargetOrder.order_number || assignTargetOrder.id} assigned to ${driverName}`);
// // // //       await fetchAll(true);
// // // //       setTimeout(() => {
// // // //         setDriverModalOpen(false);
// // // //         setAssignTargetOrder(null);
// // // //         setAssignSuccess(null);
// // // //       }, 1800);
// // // //     } catch (err: any) {
// // // //       setError(err?.response?.data?.error || 'Failed to assign driver. Please try again.');
// // // //     } finally {
// // // //       setAssigningDriver(null);
// // // //     }
// // // //   };

// // // //   // ── Confirm delivery ──────────────────────────────────────────────────────
// // // //   // POST /orders/:id/confirm-delivery
// // // //   // Backend: requires status = DELIVERY_SUBMITTED (driver sent proof)
// // // //   // → sets status = DELIVERED

// // // //   const handleConfirmDelivery = async () => {
// // // //     if (!confirmTarget) return;
// // // //     setActionLoading(confirmTarget.id);
// // // //     setError(null);
// // // //     try {
// // // //       await markOrderDelivered(confirmTarget.id);
// // // //       showSuccess(`Order #${confirmTarget.order_number || confirmTarget.id} confirmed as delivered!`);
// // // //       setConfirmModalOpen(false);
// // // //       setConfirmTarget(null);
// // // //       if (modalOpen && selectedOrder?.id === confirmTarget.id) setModalOpen(false);
// // // //       await fetchAll(true);
// // // //     } catch (err: any) {
// // // //       setError(err?.response?.data?.error || 'Failed to confirm delivery.');
// // // //     } finally {
// // // //       setActionLoading(null);
// // // //     }
// // // //   };

// // // //   // ── Render action buttons per order status ────────────────────────────────

// // // //   const renderActionBtn = (order: any, fromModal = false) => {
// // // //     const status    = (order.status || '').toUpperCase();
// // // //     const isLoading = actionLoading === order.id;

// // // //     // ASSIGNED_TO_AGENT → delivery agent picks a driver
// // // //     if (status === 'ASSIGNED_TO_AGENT') {
// // // //       return (
// // // //         <button
// // // //           className="da-action-primary bg-assign"
// // // //           disabled={isLoading}
// // // //           onClick={e => { e.stopPropagation(); handleOpenAssign(order); }}
// // // //         >
// // // //           <IconTruck size={13} /> Assign Driver
// // // //         </button>
// // // //       );
// // // //     }

// // // //     // ASSIGNED_TO_DRIVER → can re-assign (driver hasn't accepted yet)
// // // //     if (status === 'ASSIGNED_TO_DRIVER') {
// // // //       return (
// // // //         <div className={`da-action-group ${fromModal ? 'da-action-group-modal' : ''}`}>
// // // //           <button
// // // //             className="da-action-secondary bg-reassign"
// // // //             disabled={isLoading}
// // // //             onClick={e => { e.stopPropagation(); handleOpenAssign(order); }}
// // // //           >
// // // //             <IconTruck size={13} /> Re-assign
// // // //           </button>
// // // //           <span className="da-waiting-chip">Awaiting driver acceptance</span>
// // // //         </div>
// // // //       );
// // // //     }

// // // //     // DRIVER_ACCEPTED / OUT_FOR_DELIVERY → read-only, driver is en route
// // // //     if (status === 'DRIVER_ACCEPTED' || status === 'OUT_FOR_DELIVERY') {
// // // //       return (
// // // //         <span className="da-info-chip">
// // // //           <IconTruck size={12} /> Driver en route
// // // //         </span>
// // // //       );
// // // //     }

// // // //     // DELIVERY_SUBMITTED → delivery agent reviews proof and confirms
// // // //     if (status === 'DELIVERY_SUBMITTED') {
// // // //       return (
// // // //         <button
// // // //           className="da-action-primary bg-delivered"
// // // //           disabled={isLoading}
// // // //           onClick={e => {
// // // //             e.stopPropagation();
// // // //             setConfirmTarget(order);
// // // //             setConfirmModalOpen(true);
// // // //           }}
// // // //         >
// // // //           <IconCheckCircle size={13} />
// // // //           {isLoading ? 'Confirming…' : 'Confirm Delivered'}
// // // //         </button>
// // // //       );
// // // //     }

// // // //     // DELIVERED → done
// // // //     if (status === 'DELIVERED') {
// // // //       return (
// // // //         <span className="da-done-badge">
// // // //           <IconCheckCircle size={12} /> Delivered
// // // //         </span>
// // // //       );
// // // //     }

// // // //     return null;
// // // //   };

// // // //   // ── Tab config ────────────────────────────────────────────────────────────

// // // //   const tabs: { key: TabType; label: string; count: number; badgeClass: string }[] = [
// // // //     { key: 'all',          label: 'All Orders',      count: allOrders.length,        badgeClass: 'bg-all'       },
// // // //     { key: 'pending',      label: 'Ready (Pickup)',  count: pendingOrders.length,     badgeClass: 'bg-pending'   },
// // // //     { key: 'assigned',     label: 'Agent Assigned',  count: assignedOrders.length,    badgeClass: 'bg-assigned'  },
// // // //     { key: 'driver_active',label: 'Driver Active',   count: driverActiveOrders.length,badgeClass: 'bg-onway'    },
// // // //     { key: 'proof_pending',label: 'Proof Submitted', count: proofOrders.length,       badgeClass: 'bg-proof'    },
// // // //     { key: 'delivered',    label: 'Delivered',       count: deliveredOrders.length,   badgeClass: 'bg-completed' },
// // // //   ];

// // // //   // ─── Render ────────────────────────────────────────────────────────────────

// // // //   return (
// // // //     <div className="da-container">

// // // //       {/* Success toast */}
// // // //       {successMsg && (
// // // //         <div className="da-toast-success">
// // // //           <IconCheckCircle size={16} /><span>{successMsg}</span>
// // // //         </div>
// // // //       )}

// // // //       {/* Error banner */}
// // // //       {error && (
// // // //         <div className="da-error-banner">
// // // //           <IconAlert size={16} /><span>{error}</span>
// // // //           <button onClick={() => setError(null)} className="da-error-dismiss">✕</button>
// // // //         </div>
// // // //       )}

// // // //       {/* Header */}
// // // //       <div className="da-page-header">
// // // //         <div className="da-header-text">
// // // //           <h2>Delivery Agent Dashboard</h2>
// // // //           <p>Assign drivers to orders, track deliveries, and confirm completions.</p>
// // // //         </div>
// // // //         <button
// // // //           className={`da-refresh-btn ${refreshing ? 'spinning' : ''}`}
// // // //           onClick={() => fetchAll(true)}
// // // //           title="Refresh"
// // // //         >
// // // //           <IconRefresh size={16} />
// // // //         </button>
// // // //       </div>

// // // //       {/* Stats grid */}
// // // //       <div className="da-stats-grid">
// // // //         <div className="da-stat-card" onClick={() => setActiveTab('all')}>
// // // //           <div className="da-stat-icon icon-all"><IconPackage size={22} /></div>
// // // //           <div className="da-stat-details"><h3>{allOrders.length}</h3><p>Total Orders</p></div>
// // // //         </div>
// // // //         <div className="da-stat-card" onClick={() => setActiveTab('pending')}>
// // // //           <div className="da-stat-icon icon-pending"><IconClock size={22} /></div>
// // // //           <div className="da-stat-details"><h3>{pendingOrders.length}</h3><p>Ready for Pickup</p></div>
// // // //         </div>
// // // //         <div className="da-stat-card" onClick={() => setActiveTab('assigned')}>
// // // //           <div className="da-stat-icon icon-assigned"><IconUser size={22} /></div>
// // // //           <div className="da-stat-details"><h3>{assignedOrders.length}</h3><p>Need Driver</p></div>
// // // //         </div>
// // // //         <div className="da-stat-card" onClick={() => setActiveTab('driver_active')}>
// // // //           <div className="da-stat-icon icon-onway"><IconTruck size={22} /></div>
// // // //           <div className="da-stat-details"><h3>{driverActiveOrders.length}</h3><p>Driver Active</p></div>
// // // //         </div>
// // // //         <div className="da-stat-card" onClick={() => setActiveTab('proof_pending')}>
// // // //           <div className="da-stat-icon icon-proof"><IconImage size={22} /></div>
// // // //           <div className="da-stat-details"><h3>{proofOrders.length}</h3><p>Proof Submitted</p></div>
// // // //         </div>
// // // //         <div className="da-stat-card" onClick={() => setActiveTab('delivered')}>
// // // //           <div className="da-stat-icon icon-delivered"><IconCheckCircle size={22} /></div>
// // // //           <div className="da-stat-details"><h3>{deliveredOrders.length}</h3><p>Delivered</p></div>
// // // //         </div>
// // // //       </div>

// // // //       {/* Tabs */}
// // // //       <div className="da-tabs-bar">
// // // //         {tabs.map(t => (
// // // //           <button
// // // //             key={t.key}
// // // //             className={`da-tab-item ${activeTab === t.key ? 'active' : ''}`}
// // // //             onClick={() => setActiveTab(t.key)}
// // // //           >
// // // //             {t.label}
// // // //             <span className={`da-tab-badge ${t.badgeClass}`}>{t.count}</span>
// // // //           </button>
// // // //         ))}
// // // //       </div>

// // // //       {/* Orders grid */}
// // // //       {loading ? (
// // // //         <div className="da-center-loader">
// // // //           <div className="da-spinner" /><p>Loading orders…</p>
// // // //         </div>
// // // //       ) : visibleOrders.length === 0 ? (
// // // //         <div className="da-empty-state">
// // // //           <IconTruck size={48} />
// // // //           <h3>No Orders Here</h3>
// // // //           <p>No orders in this category right now.</p>
// // // //         </div>
// // // //       ) : (
// // // //         <div className="da-orders-grid">
// // // //           {visibleOrders.map(order => {
// // // //             const status   = (order.status || '').toUpperCase();
// // // //             const customer = order.customer;
// // // //             const addr     = order.delivery_address;

// // // //             return (
// // // //               <div
// // // //                 key={order.id}
// // // //                 className="da-order-card"
// // // //                 onClick={() => { setSelectedOrder(order); setModalOpen(true); }}
// // // //               >
// // // //                 {/* Card top */}
// // // //                 <div className="da-card-top">
// // // //                   <div className="da-card-id-block">
// // // //                     <h4 className="da-order-number">
// // // //                       #{order.order_number || String(order.id).padStart(5, '0')}
// // // //                     </h4>
// // // //                     <span className="da-order-time">
// // // //                       <IconClock size={11} />
// // // //                       {fmtDate(order.created_at)} · {fmtTime(order.created_at)}
// // // //                     </span>
// // // //                   </div>
// // // //                   <span className={`da-status-pill ${statusPillClass(status)}`}>
// // // //                     {statusLabel(status)}
// // // //                   </span>
// // // //                 </div>

// // // //                 {/* Customer & address */}
// // // //                 {(customer || addr) && (
// // // //                   <div className="da-card-meta">
// // // //                     {customer && (
// // // //                       <div className="da-meta-row">
// // // //                         <IconUser size={12} />
// // // //                         <span>
// // // //                           {typeof customer === 'object'
// // // //                             ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
// // // //                             : customer}
// // // //                         </span>
// // // //                       </div>
// // // //                     )}
// // // //                     {addr && (
// // // //                       <div className="da-meta-row">
// // // //                         <IconMapPin size={12} />
// // // //                         <span>
// // // //                           {addr.street ? `${addr.street}, ` : ''}{addr.city || ''}
// // // //                           {addr.pincode ? ` — ${addr.pincode}` : ''}
// // // //                         </span>
// // // //                       </div>
// // // //                     )}
// // // //                   </div>
// // // //                 )}

// // // //                 {/* Items */}
// // // //                 <div className="da-card-items">
// // // //                   {(order.items || []).slice(0, 3).map((item: any, idx: number) => (
// // // //                     <div key={item.id || idx} className="da-item-line">
// // // //                       <span className="da-item-qty">×{item.quantity}</span>
// // // //                       <span className="da-item-name">{getItemDisplayName(item)}</span>
// // // //                     </div>
// // // //                   ))}
// // // //                   {(order.items || []).length > 3 && (
// // // //                     <span className="da-item-more">+{order.items.length - 3} more</span>
// // // //                   )}
// // // //                 </div>

// // // //                 {/* Driver tag if assigned */}
// // // //                 {order.driver && (
// // // //                   <div className="da-driver-tag">
// // // //                     <IconTruck size={11} />
// // // //                     <span>
// // // //                       {`${order.driver.first_name || ''} ${order.driver.last_name || ''}`.trim() || 'Driver assigned'}
// // // //                     </span>
// // // //                   </div>
// // // //                 )}

// // // //                 {/* Proof submitted indicator */}
// // // //                 {status === 'DELIVERY_SUBMITTED' && (
// // // //                   <div className="da-proof-tag">
// // // //                     <IconImage size={11} />
// // // //                     <span>Driver submitted delivery proof</span>
// // // //                   </div>
// // // //                 )}

// // // //                 {/* Total */}
// // // //                 {(order.grand_total || order.total) && (
// // // //                   <div className="da-card-total">
// // // //                     <span>Total</span>
// // // //                     <strong>{fmtCurrency(order.grand_total || order.total || 0, order.currency)}</strong>
// // // //                   </div>
// // // //                 )}

// // // //                 {/* Action footer */}
// // // //                 <div className="da-card-footer">
// // // //                   <button
// // // //                     className="da-view-btn"
// // // //                     onClick={e => { e.stopPropagation(); setSelectedOrder(order); setModalOpen(true); }}
// // // //                   >
// // // //                     <IconEye size={13} /> View
// // // //                   </button>
// // // //                   {renderActionBtn(order)}
// // // //                 </div>
// // // //               </div>
// // // //             );
// // // //           })}
// // // //         </div>
// // // //       )}

// // // //       {/* ─── Order Detail Modal ─────────────────────────────────────────── */}
// // // //       {modalOpen && selectedOrder && (
// // // //         <div className="da-modal-backdrop" onClick={() => setModalOpen(false)}>
// // // //           <div className="da-modal-card" onClick={e => e.stopPropagation()}>
// // // //             <div className="da-modal-header">
// // // //               <h3>Order Details</h3>
// // // //               <button className="da-modal-close" onClick={() => setModalOpen(false)}>
// // // //                 <IconX size={16} />
// // // //               </button>
// // // //             </div>
// // // //             <div className="da-modal-body">

// // // //               {/* Status row */}
// // // //               <div className="da-modal-meta">
// // // //                 <div>
// // // //                   <p className="da-modal-order-num">
// // // //                     #{selectedOrder.order_number || selectedOrder.id}
// // // //                   </p>
// // // //                   <p className="da-modal-order-type">
// // // //                     {selectedOrder.order_type || 'DELIVERY'} · {fmtDate(selectedOrder.created_at)}
// // // //                   </p>
// // // //                 </div>
// // // //                 <span className={`da-status-pill ${statusPillClass(selectedOrder.status)}`}>
// // // //                   {statusLabel(selectedOrder.status)}
// // // //                 </span>
// // // //               </div>

// // // //               {/* Order Origin (placed by / source) */}
// // // //               {(selectedOrder.placed_by || selectedOrder.source || selectedOrder.order_origin || selectedOrder.placed_by_role || selectedOrder.placed_by_email) && (
// // // //                 <div className="da-modal-section">
// // // //                   <h5 className="da-modal-section-title">Order Origin</h5>
// // // //                   <div className="da-modal-info-grid">
// // // //                     {selectedOrder.placed_by && (
// // // //                       <div className="da-info-row">
// // // //                         <IconUser size={13} />
// // // //                                             <span>{renderValue(selectedOrder.placed_by)}</span>
// // // //                       </div>
// // // //                     )}
// // // //                     {selectedOrder.placed_by_role && (
// // // //                       <div className="da-info-row">
// // // //                         <span className="da-origin-role">{selectedOrder.placed_by_role}</span>
// // // //                       </div>
// // // //                     )}
// // // //                     {selectedOrder.placed_by_email && (
// // // //                       <div className="da-info-row">
// // // //                         <span>{selectedOrder.placed_by_email}</span>
// // // //                       </div>
// // // //                     )}
// // // //                     {selectedOrder.source && (
// // // //                       <div className="da-info-row">
// // // //                         <span>Source: {selectedOrder.source}</span>
// // // //                       </div>
// // // //                     )}
// // // //                   </div>
// // // //                 </div>
// // // //               )}

// // // //               {/* Delivery schedule (expected date / time slot / area) */}
// // // //               {(selectedOrder.expected_delivery_date || selectedOrder.time_slot || selectedOrder.delivery_area || selectedOrder.area) && (
// // // //                 <div className="da-modal-section">
// // // //                   <h5 className="da-modal-section-title">Delivery Schedule</h5>
// // // //                   <div className="da-modal-info-grid">
// // // //                     {selectedOrder.expected_delivery_date && (
// // // //                       <div className="da-info-row">
// // // //                         <IconClock size={13} />
// // // //                         <span>{fmtDate(selectedOrder.expected_delivery_date)}</span>
// // // //                       </div>
// // // //                     )}
// // // //                     {selectedOrder.time_slot && (
// // // //                       <div className="da-info-row">
// // // //                         <IconClock size={13} />
// // // //                         <span>{selectedOrder.time_slot}</span>
// // // //                       </div>
// // // //                     )}
// // // //                     {(selectedOrder.delivery_area || selectedOrder.area) && (
// // // //                       <div className="da-info-row">
// // // //                         <IconMapPin size={13} />
// // // //                                             <span>{renderValue(selectedOrder.delivery_area || selectedOrder.area)}</span>
// // // //                       </div>
// // // //                     )}
// // // //                   </div>
// // // //                 </div>
// // // //               )}

// // // //               {/* Payment */}
// // // //               {selectedOrder.payment_method && (
// // // //                 <div className="da-modal-section">
// // // //                   <h5 className="da-modal-section-title">Payment</h5>
// // // //                   <div className="da-info-row">
// // // //                     <span>{selectedOrder.payment_method}</span>
// // // //                     {selectedOrder.payment_status && (
// // // //                       <span className={`da-payment-chip chip-${(selectedOrder.payment_status || '').toLowerCase()}`}>
// // // //                         {selectedOrder.payment_status}
// // // //                       </span>
// // // //                     )}
// // // //                     {selectedOrder.currency && (
// // // //                       <span className="da-currency-label">{selectedOrder.currency}</span>
// // // //                     )}
// // // //                   </div>
// // // //                 </div>
// // // //               )}

// // // //               {/* Customer */}
// // // //               {selectedOrder.customer && (
// // // //                 <div className="da-modal-section">
// // // //                   <h5 className="da-modal-section-title">Customer</h5>
// // // //                   <div className="da-modal-info-grid">
// // // //                     <div className="da-info-row">
// // // //                       <IconUser size={13} />
// // // //                       <span>
// // // //                         {selectedOrder.customer.first_name} {selectedOrder.customer.last_name}
// // // //                       </span>
// // // //                     </div>
// // // //                     {selectedOrder.customer.phone_no && (
// // // //                       <div className="da-info-row">
// // // //                         <IconPhone size={13} />
// // // //                         <span>{selectedOrder.customer.phone_no}</span>
// // // //                       </div>
// // // //                     )}
// // // //                     {selectedOrder.customer.email && (
// // // //                       <div className="da-info-row">
// // // //                         <span className="da-customer-email">{selectedOrder.customer.email}</span>
// // // //                       </div>
// // // //                     )}
// // // //                   </div>
// // // //                 </div>
// // // //               )}

// // // //               {/* Customer & Delivery Address (brief + expanded) */}
// // // //               {selectedOrder.customer && (
// // // //                 <div className="da-modal-section">
// // // //                   <h5 className="da-modal-section-title">Customer & Address</h5>
// // // //                   <div className="da-modal-info-grid">
// // // //                     <div className="da-info-row">
// // // //                       <IconUser size={13} />
// // // //                       <span>{renderValue(selectedOrder.customer.first_name || selectedOrder.customer.name || (selectedOrder.customer.first_name && selectedOrder.customer.last_name ? `${selectedOrder.customer.first_name} ${selectedOrder.customer.last_name}` : ''))}</span>
// // // //                     </div>
// // // //                     {selectedOrder.customer.phone_no && (
// // // //                       <div className="da-info-row">
// // // //                         <IconPhone size={13} />
// // // //                         <span>{renderValue(selectedOrder.customer.phone_no)}</span>
// // // //                       </div>
// // // //                     )}
// // // //                     {selectedOrder.customer.email && (
// // // //                       <div className="da-info-row">
// // // //                         <span className="da-customer-email">{renderValue(selectedOrder.customer.email)}</span>
// // // //                       </div>
// // // //                     )}

// // // //                     {selectedOrder.delivery_address && (
// // // //                       <div className="da-address-box">
// // // //                         <strong className="da-address-label">Address:</strong>
// // // //                         <div className="da-address-lines">
// // // //                           {selectedOrder.delivery_address.building && (
// // // //                             <div><span className="da-address-field">Building:</span> {renderValue(selectedOrder.delivery_address.building)}</div>
// // // //                           )}
// // // //                           {selectedOrder.delivery_address.block && (
// // // //                             <div><span className="da-address-field">Block:</span> {renderValue(selectedOrder.delivery_address.block)}</div>
// // // //                           )}
// // // //                           {selectedOrder.delivery_address.avenue && (
// // // //                             <div><span className="da-address-field">Avenue:</span> {renderValue(selectedOrder.delivery_address.avenue)}</div>
// // // //                           )}
// // // //                           {selectedOrder.delivery_address.street && (
// // // //                             <div><span className="da-address-field">Street:</span> {renderValue(selectedOrder.delivery_address.street)}</div>
// // // //                           )}
// // // //                           {(selectedOrder.delivery_address.floor || selectedOrder.delivery_address.apt || selectedOrder.delivery_address.apartment) && (
// // // //                             <div><span className="da-address-field">Floor/Apt:</span> {renderValue(selectedOrder.delivery_address.floor || selectedOrder.delivery_address.apt || selectedOrder.delivery_address.apartment)}</div>
// // // //                           )}
// // // //                           {selectedOrder.delivery_address.address_notes && (
// // // //                             <div><span className="da-address-field">Address notes:</span> {renderValue(selectedOrder.delivery_address.address_notes)}</div>
// // // //                           )}
// // // //                           {/* Fallback short line if none of the above present */}
// // // //                           {!selectedOrder.delivery_address.building && !selectedOrder.delivery_address.block && !selectedOrder.delivery_address.avenue && !selectedOrder.delivery_address.street && (
// // // //                             <div>{renderValue(selectedOrder.delivery_address.city)}{selectedOrder.delivery_address.pincode ? ` — ${renderValue(selectedOrder.delivery_address.pincode)}` : ''}</div>
// // // //                           )}
// // // //                         </div>
// // // //                       </div>
// // // //                     )}

// // // //                   </div>
// // // //                 </div>
// // // //               )}


// // // //               {/* Assigned driver */}
// // // //               {selectedOrder.driver && (
// // // //                 <div className="da-modal-section">
// // // //                   <h5 className="da-modal-section-title">Assigned Driver</h5>
// // // //                   <div className="da-modal-driver-tag">
// // // //                     <IconTruck size={14} />
// // // //                     <span>
// // // //                       {`${selectedOrder.driver.first_name || ''} ${selectedOrder.driver.last_name || ''}`.trim()}
// // // //                     </span>
// // // //                     {selectedOrder.driver.phone_no && (
// // // //                       <span className="da-driver-phone-modal">· {selectedOrder.driver.phone_no}</span>
// // // //                     )}
// // // //                   </div>
// // // //                 </div>
// // // //               )}

// // // //               {/* Delivery proof (shown when driver submitted) */}
// // // //               {(selectedOrder.status === 'DELIVERY_SUBMITTED' || selectedOrder.delivery_photo) && (
// // // //                 <div className="da-modal-section da-proof-section">
// // // //                   <h5 className="da-modal-section-title">Delivery Proof from Driver</h5>
// // // //                   {selectedOrder.delivery_photo && (
// // // //                     <a
// // // //                       href={selectedOrder.delivery_photo}
// // // //                       target="_blank"
// // // //                       rel="noopener noreferrer"
// // // //                       className="da-proof-photo-link"
// // // //                     >
// // // //                       <IconImage size={14} /> View Photo ↗
// // // //                     </a>
// // // //                   )}
// // // //                   {selectedOrder.delivery_notes && (
// // // //                     <p className="da-proof-notes">
// // // //                       <strong>Driver note:</strong> {selectedOrder.delivery_notes}
// // // //                     </p>
// // // //                   )}
// // // //                   {selectedOrder.customer_confirmation_name && (
// // // //                     <p className="da-proof-notes">
// // // //                       <strong>Received by:</strong> {selectedOrder.customer_confirmation_name}
// // // //                       {selectedOrder.customer_confirmation_phone
// // // //                         ? ` · ${selectedOrder.customer_confirmation_phone}`
// // // //                         : ''}
// // // //                     </p>
// // // //                   )}
// // // //                   {selectedOrder.driver_submitted_at && (
// // // //                     <p className="da-proof-notes">
// // // //                       <strong>Submitted:</strong>{' '}
// // // //                       {new Date(selectedOrder.driver_submitted_at).toLocaleString()}
// // // //                     </p>
// // // //                   )}
// // // //                 </div>
// // // //               )}

// // // //               {/* Items */}
// // // //               <div className="da-modal-section">
// // // //                 <h5 className="da-modal-section-title">Order Items</h5>
// // // //                 <div className="da-modal-items">
// // // //                   {(selectedOrder.items || []).map((item: any, idx: number) => {
// // // //                     const displayName = getItemDisplayName(item);
// // // //                     const displayImage = getItemDisplayImage(item);
// // // //                     const displayDescription = getItemDisplayDescription(item);

// // // //                     return (
// // // //                       <div key={item.id || idx} className="da-modal-item-row">
// // // //                         <div className="da-modal-item-left">
// // // //                           <span className="da-modal-qty">×{item.quantity}</span>
// // // //                           <div className="da-modal-item-with-thumb">
// // // //                             {displayImage && (
// // // //                               <div className="da-item-thumb">
// // // //                                 <img
// // // //                                   src={displayImage}
// // // //                                   alt={displayName}
// // // //                                   onError={(e: any) => { e.target.style.display = 'none'; }}
// // // //                                 />
// // // //                               </div>
// // // //                             )}
// // // //                             <div>
// // // //                               <p className="da-modal-item-name">{displayName}</p>
// // // //                               {displayDescription && (
// // // //                                 <p className="da-modal-item-desc">{displayDescription}</p>
// // // //                               )}
// // // //                             </div>
// // // //                           </div>
// // // //                         </div>
// // // //                         <span className="da-modal-item-price">
// // // //                           {fmtCurrency(item.line_total || (item.price * item.quantity) || 0, selectedOrder?.currency)}
// // // //                         </span>
// // // //                       </div>
// // // //                     );
// // // //                   })}
// // // //                 </div>
// // // //               </div>

// // // //               {/* Delivery notes from order */}
// // // //               {selectedOrder.delivery_notes && selectedOrder.status !== 'DELIVERY_SUBMITTED' && (
// // // //                 <div className="da-modal-notes">
// // // //                   <h5 className="da-modal-section-title">Delivery Notes</h5>
// // // //                   <p className="da-modal-notes-text">"{selectedOrder.delivery_notes}"</p>
// // // //                 </div>
// // // //               )}

// // // //               {/* Totals */}
// // // //               <div className="da-modal-totals">
// // // //                 <div className="da-total-row">
// // // //                   <span>Subtotal</span><span>{fmtCurrency(selectedOrder.subtotal, selectedOrder.currency)}</span>
// // // //                 </div>
// // // //                 <div className="da-total-row">
// // // //                   <span>Delivery</span><span>{fmtCurrency(selectedOrder.delivery_charge, selectedOrder.currency)}</span>
// // // //                 </div>
// // // //                 {selectedOrder.discount > 0 && (
// // // //                   <div className="da-total-row da-total-discount">
// // // //                     <span>Discount</span><span>−{fmtCurrency(selectedOrder.discount, selectedOrder.currency)}</span>
// // // //                   </div>
// // // //                 )}
// // // //                 <div className="da-total-row da-total-grand">
// // // //                   <span>Total</span>
// // // //                   <strong>{fmtCurrency(selectedOrder.grand_total || selectedOrder.total || 0, selectedOrder.currency)}</strong>
// // // //                 </div>
// // // //               </div>
// // // //             </div>

// // // //             <div className="da-modal-footer">
// // // //               <button className="da-modal-print" onClick={() => window.print()}>Print Receipt</button>
// // // //               <button className="da-modal-cancel" onClick={() => setModalOpen(false)}>Close</button>
// // // //               {renderActionBtn(selectedOrder, true)}
// // // //             </div>
// // // //           </div>
// // // //         </div>
// // // //       )}

// // // //       {/* ─── Driver Assignment Modal ────────────────────────────────────── */}
// // // //       {driverModalOpen && (
// // // //         <div className="da-modal-backdrop" onClick={() => { setDriverModalOpen(false); setAssignSuccess(null); }}>
// // // //           <div className="da-modal-card da-driver-modal" onClick={e => e.stopPropagation()}>
// // // //             <div className="da-modal-header">
// // // //               <div>
// // // //                 <h3>Assign Driver</h3>
// // // //                 {assignTargetOrder && (
// // // //                   <p className="da-modal-sub">
// // // //                     Order #{assignTargetOrder.order_number || assignTargetOrder.id}
// // // //                     {assignTargetOrder.customer && (
// // // //                       <span>
// // // //                         {' · '}{assignTargetOrder.customer.first_name} {assignTargetOrder.customer.last_name}
// // // //                       </span>
// // // //                     )}
// // // //                   </p>
// // // //                 )}
// // // //               </div>
// // // //               <button
// // // //                 className="da-modal-close"
// // // //                 onClick={() => { setDriverModalOpen(false); setAssignSuccess(null); }}
// // // //               >
// // // //                 <IconX size={16} />
// // // //               </button>
// // // //             </div>

// // // //             <div className="da-modal-body">
// // // //               {/* Success banner */}
// // // //               {assignSuccess && (
// // // //                 <div className="da-assign-success">
// // // //                   <IconCheckCircle size={18} /><span>{assignSuccess}</span>
// // // //                 </div>
// // // //               )}

// // // //               {driverLoading ? (
// // // //                 <div className="da-center-loader" style={{ minHeight: 180 }}>
// // // //                   <div className="da-spinner" /><p>Loading available drivers…</p>
// // // //                 </div>
// // // //               ) : drivers.length === 0 ? (
// // // //                 <div className="da-empty-state" style={{ padding: '40px 20px' }}>
// // // //                   <IconUser size={40} />
// // // //                   <h3>No Drivers Found</h3>
// // // //                   <p>No drivers are registered yet, or all are currently on deliveries.</p>
// // // //                 </div>
// // // //               ) : (
// // // //                 <>
// // // //                   {/* Search */}
// // // //                   <div className="da-driver-search">
// // // //                     <IconSearch size={15} />
// // // //                     <input
// // // //                       type="text"
// // // //                       placeholder="Search by name or phone…"
// // // //                       value={driverSearch}
// // // //                       onChange={e => setDriverSearch(e.target.value)}
// // // //                     />
// // // //                   </div>

// // // //                   {/* Legend */}
// // // //                   <div className="da-driver-list-header">
// // // //                     <p className="da-driver-list-hint">
// // // //                       {filteredDrivers.length} driver{filteredDrivers.length !== 1 ? 's' : ''}
// // // //                       {driverSearch ? ' found' : ''} — tap to assign
// // // //                     </p>
// // // //                     <div className="da-driver-legend">
// // // //                       <span className="da-legend-dot ds-available" /> Available
// // // //                       <span className="da-legend-dot ds-busy" /> Busy
// // // //                       <span className="da-legend-dot ds-offline" /> Offline
// // // //                     </div>
// // // //                   </div>

// // // //                   <div className="da-driver-list">
// // // //                     {filteredDrivers.length === 0 ? (
// // // //                       <div className="da-driver-no-results">
// // // //                         <p>No drivers match "{driverSearch}"</p>
// // // //                       </div>
// // // //                     ) : (
// // // //                       filteredDrivers.map(driver => {
// // // //                         // availability_status is the field added in fixed User model
// // // //                         const rawStatus   = driver.availability_status || driver.status || 'OFFLINE';
// // // //                         const dStatus     = rawStatus.toUpperCase();
// // // //                         const isAssigning = assigningDriver === driver.id;
// // // //                         const isDisabled  = assigningDriver !== null && !isAssigning;

// // // //                         return (
// // // //                           <div
// // // //                             key={driver.id}
// // // //                             className={[
// // // //                               'da-driver-card',
// // // //                               dStatus === 'ONLINE' || dStatus === 'AVAILABLE' ? 'da-driver-available' : '',
// // // //                               isAssigning ? 'da-driver-assigning' : '',
// // // //                               isDisabled  ? 'da-driver-disabled'  : '',
// // // //                             ].join(' ')}
// // // //                             onClick={() => !isAssigning && !isDisabled && handleAssignDriver(driver)}
// // // //                           >
// // // //                             <div className="da-driver-avatar">
// // // //                               {(driver.first_name || driver.name || 'D').charAt(0).toUpperCase()}
// // // //                             </div>
// // // //                             <div className="da-driver-info">
// // // //                               <p className="da-driver-name">
// // // //                                 {driver.first_name || driver.name || 'Driver'}
// // // //                                 {driver.last_name ? ` ${driver.last_name}` : ''}
// // // //                               </p>
// // // //                               <div className="da-driver-meta">
// // // //                                 {driver.phone_no && (
// // // //                                   <span className="da-driver-phone">
// // // //                                     <IconPhone size={11} />{driver.phone_no}
// // // //                                   </span>
// // // //                                 )}
// // // //                                 {driver.rating > 0 && (
// // // //                                   <span className="da-driver-rating">
// // // //                                     <IconStar size={11} />{Number(driver.rating).toFixed(1)}
// // // //                                   </span>
// // // //                                 )}
// // // //                               </div>
// // // //                             </div>
// // // //                             <div className="da-driver-right">
// // // //                               <span className={`da-driver-status ${driverStatusClass(dStatus)}`}>
// // // //                                 {driverStatusLabel(dStatus)}
// // // //                               </span>
// // // //                               {isAssigning ? (
// // // //                                 <div className="da-spinner da-spinner-sm" />
// // // //                               ) : (
// // // //                                 <button
// // // //                                   className="da-assign-btn"
// // // //                                   disabled={isDisabled}
// // // //                                   onClick={e => { e.stopPropagation(); handleAssignDriver(driver); }}
// // // //                                 >
// // // //                                   Assign
// // // //                                 </button>
// // // //                               )}
// // // //                             </div>
// // // //                           </div>
// // // //                         );
// // // //                       })
// // // //                     )}
// // // //                   </div>
// // // //                 </>
// // // //               )}
// // // //             </div>
// // // //           </div>
// // // //         </div>
// // // //       )}

// // // //       {/* ─── Confirm Delivery Modal ─────────────────────────────────────── */}
// // // //       {/* Shown when driver has submitted proof (DELIVERY_SUBMITTED).
// // // //           Delivery agent reviews the proof and clicks Confirm to set DELIVERED. */}
// // // //       {confirmModalOpen && confirmTarget && (
// // // //         <div className="da-modal-backdrop" onClick={() => setConfirmModalOpen(false)}>
// // // //           <div className="da-modal-card da-confirm-modal" onClick={e => e.stopPropagation()}>
// // // //             <div className="da-modal-header">
// // // //               <div>
// // // //                 <h3>Confirm Delivery</h3>
// // // //                 <p className="da-modal-sub">
// // // //                   Order #{confirmTarget.order_number || confirmTarget.id}
// // // //                 </p>
// // // //               </div>
// // // //               <button className="da-modal-close" onClick={() => setConfirmModalOpen(false)}>
// // // //                 <IconX size={16} />
// // // //               </button>
// // // //             </div>
// // // //             <div className="da-modal-body">
// // // //               <div className="da-confirm-desc">
// // // //                 <p>
// // // //                   Driver <strong>
// // // //                     {confirmTarget.driver
// // // //                       ? `${confirmTarget.driver.first_name || ''} ${confirmTarget.driver.last_name || ''}`.trim()
// // // //                       : 'your driver'}
// // // //                   </strong> has submitted delivery proof for this order.
// // // //                 </p>
// // // //                 <p>Review the proof below and confirm to mark it as <strong>DELIVERED</strong>.</p>
// // // //               </div>

// // // //               {/* Show proof details in confirm modal too */}
// // // //               {confirmTarget.delivery_photo && (
// // // //                 <a
// // // //                   href={confirmTarget.delivery_photo}
// // // //                   target="_blank"
// // // //                   rel="noopener noreferrer"
// // // //                   className="da-proof-photo-link"
// // // //                 >
// // // //                   <IconImage size={14} /> View delivery photo ↗
// // // //                 </a>
// // // //               )}
// // // //               {confirmTarget.delivery_notes && (
// // // //                 <p className="da-proof-notes">
// // // //                   <strong>Driver note:</strong> {confirmTarget.delivery_notes}
// // // //                 </p>
// // // //               )}
// // // //               {confirmTarget.customer_confirmation_name && (
// // // //                 <p className="da-proof-notes">
// // // //                   <strong>Received by:</strong> {confirmTarget.customer_confirmation_name}
// // // //                 </p>
// // // //               )}
// // // //               {!confirmTarget.delivery_photo && !confirmTarget.delivery_notes && (
// // // //                 <p className="da-proof-notes da-proof-none">No photo or notes submitted by driver.</p>
// // // //               )}
// // // //             </div>
// // // //             <div className="da-modal-footer">
// // // //               <button
// // // //                 className="da-modal-cancel"
// // // //                 disabled={actionLoading === confirmTarget.id}
// // // //                 onClick={() => setConfirmModalOpen(false)}
// // // //               >
// // // //                 Cancel
// // // //               </button>
// // // //               <button
// // // //                 className="da-action-primary bg-delivered"
// // // //                 disabled={actionLoading === confirmTarget.id}
// // // //                 onClick={handleConfirmDelivery}
// // // //               >
// // // //                 <IconCheckCircle size={14} />
// // // //                 {actionLoading === confirmTarget.id ? 'Confirming…' : 'Confirm Delivered'}
// // // //               </button>
// // // //             </div>
// // // //           </div>
// // // //         </div>
// // // //       )}

// // // //     </div>
// // // //   );
// // // // };

// // // // export default DeliveryOrder;



// // // import React, { useState, useEffect, useCallback, useMemo } from 'react';
// // // import './DeliveryOrder.css';

// // // // ─── Service imports ─────────────────────────────────────────────────────────
// // // // All URLs come from delivery_routes.py and order_routes.py
// // // import {
// // //   getDeliveryPending,       // GET  /delivery/pending         → READY orders (kitchen done, agent not yet assigned)
// // //   getDeliveryAssigned,      // GET  /delivery/assigned        → ASSIGNED_TO_AGENT orders
// // //   getDeliveryReady,         // GET  /delivery/ready-for-pickup→ ASSIGNED_TO_DRIVER | DRIVER_ACCEPTED | OUT_FOR_DELIVERY
// // //   getDeliveryProofPending,  // GET  /delivery/proof-pending   → DELIVERY_SUBMITTED (driver sent proof)
// // //   getDeliveryDelivered,     // GET  /delivery/delivered       → DELIVERED orders
// // // } from '../../services/deliveryService';

// // // import {
// // //   assignDriverToOrder,      // POST /orders/:id/assign-driver    { driver_id } → ASSIGNED_TO_DRIVER
// // //   markOrderDelivered,       // POST /orders/:id/confirm-delivery                → DELIVERED
// // // } from '../../services/orderService';

// // // import {
// // //   getAvailableDrivers,      // GET  /drivers/available
// // //   getDrivers,               // GET  /drivers
// // // } from '../../services/driverService';

// // // // ─── SVG Icons ────────────────────────────────────────────────────────────────
// // // const IconTruck = ({ size = 20 }: { size?: number }) => (
// // //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
// // //     <rect x="1" y="3" width="15" height="13" rx="2" />
// // //     <path d="M16 8h4l3 3v5h-7V8z" />
// // //     <circle cx="5.5" cy="18.5" r="2.5" />
// // //     <circle cx="18.5" cy="18.5" r="2.5" />
// // //   </svg>
// // // );
// // // const IconClock = ({ size = 18 }: { size?: number }) => (
// // //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// // //     <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
// // //   </svg>
// // // );
// // // const IconCheckCircle = ({ size = 18 }: { size?: number }) => (
// // //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// // //     <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
// // //   </svg>
// // // );
// // // const IconUser = ({ size = 18 }: { size?: number }) => (
// // //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// // //     <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
// // //   </svg>
// // // );
// // // const IconMapPin = ({ size = 14 }: { size?: number }) => (
// // //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// // //     <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
// // //   </svg>
// // // );
// // // const IconPackage = ({ size = 20 }: { size?: number }) => (
// // //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// // //     <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
// // //     <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
// // //     <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
// // //     <line x1="12" y1="22.08" x2="12" y2="12" />
// // //   </svg>
// // // );
// // // const IconRefresh = ({ size = 16 }: { size?: number }) => (
// // //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// // //     <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
// // //     <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
// // //   </svg>
// // // );
// // // const IconX = ({ size = 18 }: { size?: number }) => (
// // //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// // //     <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
// // //   </svg>
// // // );
// // // const IconPhone = ({ size = 14 }: { size?: number }) => (
// // //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// // //     <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.88a16 16 0 0 0 6.21 6.21l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
// // //   </svg>
// // // );
// // // const IconSearch = ({ size = 16 }: { size?: number }) => (
// // //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// // //     <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
// // //   </svg>
// // // );
// // // const IconStar = ({ size = 13 }: { size?: number }) => (
// // //   <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
// // //     <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
// // //   </svg>
// // // );
// // // const IconEye = ({ size = 16 }: { size?: number }) => (
// // //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// // //     <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
// // //   </svg>
// // // );
// // // const IconAlert = ({ size = 16 }: { size?: number }) => (
// // //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// // //     <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
// // //   </svg>
// // // );
// // // const IconImage = ({ size = 16 }: { size?: number }) => (
// // //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// // //     <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
// // //     <polyline points="21 15 16 10 5 21" />
// // //   </svg>
// // // );
// // // const IconCake = ({ size = 12 }: { size?: number }) => (
// // //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// // //     <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
// // //     <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" />
// // //     <path d="M12 3v4" />
// // //     <path d="M12 7c-1.5 0-2-1-2-1.5S10.5 4 12 3c1.5 1 2 1.5 2 2.5S13.5 7 12 7z" />
// // //   </svg>
// // // );

// // // // ─── Types ────────────────────────────────────────────────────────────────────

// // // /**
// // //  * Tab keys mapped to the backend delivery_routes.py endpoints:
// // //  *
// // //  *  'pending'        → GET /delivery/pending          (status = READY, kitchen done, unassigned)
// // //  *  'assigned'       → GET /delivery/assigned         (status = ASSIGNED_TO_AGENT)
// // //  *  'driver_active'  → GET /delivery/ready-for-pickup (status = ASSIGNED_TO_DRIVER | DRIVER_ACCEPTED | OUT_FOR_DELIVERY)
// // //  *  'proof_pending'  → GET /delivery/proof-pending    (status = DELIVERY_SUBMITTED)
// // //  *  'delivered'      → GET /delivery/delivered        (status = DELIVERED)
// // //  *  'all'            → all of the above merged
// // //  */
// // // type TabType = 'all' | 'pending' | 'assigned' | 'driver_active' | 'proof_pending' | 'delivered';

// // // // ─── Status helpers ───────────────────────────────────────────────────────────

// // // // Backend status → pill CSS class
// // // const statusPillClass = (s: string): string => {
// // //   switch ((s || '').toUpperCase()) {
// // //     case 'READY':               return 'pill-ready';
// // //     case 'ASSIGNED_TO_AGENT':   return 'pill-assigned';
// // //     case 'ASSIGNED_TO_DRIVER':  return 'pill-assigned';
// // //     case 'DRIVER_ACCEPTED':     return 'pill-onway';
// // //     case 'OUT_FOR_DELIVERY':    return 'pill-onway';
// // //     case 'DELIVERY_SUBMITTED':  return 'pill-proof';
// // //     case 'DELIVERED':           return 'pill-delivered';
// // //     case 'CANCELLED':           return 'pill-cancelled';
// // //     default:                    return 'pill-default';
// // //   }
// // // };

// // // // Human-readable label for each backend status
// // // const statusLabel = (s: string): string => {
// // //   switch ((s || '').toUpperCase()) {
// // //     case 'READY':               return 'Ready';
// // //     case 'ASSIGNED_TO_AGENT':   return 'Agent Assigned';
// // //     case 'ASSIGNED_TO_DRIVER':  return 'Driver Assigned';
// // //     case 'DRIVER_ACCEPTED':     return 'Out for Delivery';
// // //     case 'OUT_FOR_DELIVERY':    return 'Out for Delivery';
// // //     case 'DELIVERY_SUBMITTED':  return 'Proof Submitted';
// // //     case 'DELIVERED':           return 'Delivered';
// // //     default:                    return (s || '').replace(/_/g, ' ');
// // //   }
// // // };

// // // // Driver availability chip class
// // // const driverStatusClass = (s: string): string => {
// // //   const st = (s || '').toUpperCase();
// // //   if (st === 'ONLINE' || st === 'AVAILABLE') return 'ds-available';
// // //   if (st === 'BUSY')                         return 'ds-busy';
// // //   return 'ds-offline';
// // // };

// // // const driverStatusLabel = (s: string): string => {
// // //   const st = (s || '').toUpperCase();
// // //   if (st === 'ONLINE' || st === 'AVAILABLE') return 'Available';
// // //   if (st === 'BUSY')                         return 'Busy';
// // //   return 'Offline';
// // // };

// // // // ─── Formatters ───────────────────────────────────────────────────────────────

// // // const fmtTime = (dt: string) =>
// // //   dt ? new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—';
// // // const fmtDate = (dt: string) =>
// // //   dt ? new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—';

// // // const currencySymbol = (cur?: string) => {
// // //   const c = cur || (typeof window !== 'undefined' ? localStorage.getItem('currency') || 'INR' : 'INR');
// // //   return c === 'INR' ? '₹' : c;
// // // };

// // // const fmtCurrency = (n: number | undefined, cur?: string) => `${currencySymbol(cur)}${Number(n || 0).toFixed(0)}`;

// // // // Safely render a value that may be a string, number, or object coming from the API.
// // // // If it's an object, prefer common display fields (name, first_name, full_name) before falling
// // // // back to a JSON string so React never receives a raw object as a child.
// // // const renderValue = (v: any) => {
// // //   if (v === null || v === undefined) return '';
// // //   if (typeof v === 'string' || typeof v === 'number') return String(v);
// // //   if (typeof v === 'object') {
// // //     return (
// // //       v.name || v.title || v.first_name || v.firstName || v.full_name || v.email || JSON.stringify(v)
// // //     );
// // //   }
// // //   return String(v);
// // // };

// // // // ─── Agent-exclusive item helpers ──────────────────────────────────────────────
// // // // Agent-exclusive line items (custom_json.product_type === 'AGENT') come back
// // // // from the backend under `item.agent_product` instead of `item.product`, since
// // // // their `product_id` is null on those order_item rows. Every place that used to
// // // // read `item.product?.x` directly needs to resolve through this helper first,
// // // // the same way OrderManagement.tsx / KitchenOrder.tsx already do — otherwise
// // // // agent-exclusive items render as a blank/generic "Item" here.
// // // const getItemCustomJson = (item: any) => item?.custom_json || {};

// // // const isAgentExclusiveItem = (item: any) => getItemCustomJson(item)?.product_type === 'AGENT';

// // // const getItemProductSource = (item: any) => {
// // //   const agentProduct = item?.agent_product ?? {};
// // //   const product = item?.product ?? {};
// // //   return isAgentExclusiveItem(item) ? agentProduct : product;
// // // };

// // // const getItemDisplayName = (item: any) => {
// // //   const source = getItemProductSource(item);
// // //   return (
// // //     source?.name ||
// // //     item?.product_name ||
// // //     item?.name ||
// // //     (isAgentExclusiveItem(item) ? 'Agent Product' : 'Item')
// // //   );
// // // };

// // // const getItemDisplayImage = (item: any) => {
// // //   const source = getItemProductSource(item);
// // //   return source?.image || source?.image_url || source?.imageUrl || item?.image || null;
// // // };

// // // const getItemDisplayDescription = (item: any) => {
// // //   const source = getItemProductSource(item);
// // //   return source?.description || null;
// // // };

// // // // ─── Item customization helpers (flavour / variant / shape / add-ons / notes) ──
// // // // Mirrors KitchenOrder.tsx exactly — these read the same custom_json object
// // // // off the order item, so per-item customization renders identically for the
// // // // delivery agent as it does for kitchen staff.
// // // interface ItemCustomJson {
// // //   variant?: string;
// // //   flavour?: string;
// // //   flavor?: string;
// // //   shape?: string;
// // //   add_ons?: string[];
// // //   addons?: string[];
// // //   add_on_total?: number;
// // //   notes?: string;
// // //   product_type?: string;
// // // }

// // // const getCustomJson = (item: any): ItemCustomJson => item?.custom_json || {};

// // // const getFlavour = (item: any) => {
// // //   const cj = getCustomJson(item);
// // //   return cj.flavour || cj.flavor || item?.flavour || item?.flavor || null;
// // // };

// // // const getVariant = (item: any) => {
// // //   const cj = getCustomJson(item);
// // //   return cj.variant || item?.variant || null;
// // // };

// // // const getShape = (item: any) => {
// // //   const cj = getCustomJson(item);
// // //   return cj.shape || item?.shape || null;
// // // };

// // // const getAddOns = (item: any): string[] => {
// // //   const cj = getCustomJson(item);
// // //   const list = cj.add_ons || cj.addons || item?.add_ons || item?.selected_add_ons || [];
// // //   return Array.isArray(list) ? list : [];
// // // };

// // // const getItemNotes = (item: any) => {
// // //   const cj = getCustomJson(item);
// // //   return cj.notes || item?.notes || null;
// // // };

// // // // ─── Custom cake helpers ────────────────────────────────────────────────────
// // // // THIS is what was missing here: DeliveryOrder never read `custom_cake_json` /
// // // // `custom_cake` off the order, so custom-cake orders showed every other
// // // // section (customer, address, items, totals) but silently dropped all the
// // // // cake customization (image, flavour, shape, message, etc.) that
// // // // KitchenOrder.tsx already displays. Ported directly from there.
// // // const getCustomCakeDetails = (order: any) => {
// // //   const customCake = order?.custom_cake_json ?? order?.custom_cake ?? null;
// // //   if (!customCake || typeof customCake !== 'object') return null;
// // //   return {
// // //     image: customCake?.image || customCake?.image_url || null,
// // //     flavour: customCake?.flavour || customCake?.flavor || null,
// // //     weight: customCake?.weight || null,
// // //     shape: customCake?.shape || null,
// // //     size: customCake?.size || null,
// // //     colour: customCake?.colour || customCake?.color || null,
// // //     message: customCake?.message || null,
// // //     notes: customCake?.notes || null,
// // //     price: customCake?.price != null ? Number(customCake.price) : null,
// // //   };
// // // };

// // // const isCustomCakeOrder = (order: any) => !!getCustomCakeDetails(order);

// // // // ─── Component ────────────────────────────────────────────────────────────────

// // // const DeliveryOrder: React.FC = () => {

// // //   // ── State ──────────────────────────────────────────────────────────────────

// // //   const [activeTab,        setActiveTab]        = useState<TabType>('all');

// // //   // Order buckets — one per backend endpoint
// // //   const [pendingOrders,      setPendingOrders]      = useState<any[]>([]);  // READY
// // //   const [assignedOrders,     setAssignedOrders]     = useState<any[]>([]);  // ASSIGNED_TO_AGENT
// // //   const [driverActiveOrders, setDriverActiveOrders] = useState<any[]>([]);  // ASSIGNED_TO_DRIVER | DRIVER_ACCEPTED | OUT_FOR_DELIVERY
// // //   const [proofOrders,        setProofOrders]        = useState<any[]>([]);  // DELIVERY_SUBMITTED
// // //   const [deliveredOrders,    setDeliveredOrders]    = useState<any[]>([]);  // DELIVERED

// // //   const [loading,       setLoading]       = useState(true);
// // //   const [refreshing,    setRefreshing]    = useState(false);
// // //   const [actionLoading, setActionLoading] = useState<number | null>(null);
// // //   const [error,         setError]         = useState<string | null>(null);
// // //   const [successMsg,    setSuccessMsg]    = useState<string | null>(null);

// // //   // Order detail modal
// // //   const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
// // //   const [modalOpen,     setModalOpen]     = useState(false);

// // //   // Driver assignment modal
// // //   const [driverModalOpen,   setDriverModalOpen]   = useState(false);
// // //   const [assignTargetOrder, setAssignTargetOrder] = useState<any | null>(null);
// // //   const [drivers,           setDrivers]           = useState<any[]>([]);
// // //   const [filteredDrivers,   setFilteredDrivers]   = useState<any[]>([]);
// // //   const [driverLoading,     setDriverLoading]     = useState(false);
// // //   const [assigningDriver,   setAssigningDriver]   = useState<number | null>(null);
// // //   const [driverSearch,      setDriverSearch]      = useState('');
// // //   const [assignSuccess,     setAssignSuccess]     = useState<string | null>(null);

// // //   // Confirm-delivery modal
// // //   const [confirmModalOpen,  setConfirmModalOpen]  = useState(false);
// // //   const [confirmTarget,     setConfirmTarget]     = useState<any | null>(null);

// // //   // ── Fetch all buckets concurrently ────────────────────────────────────────



// // //   const fetchAll = useCallback(async (silent = false) => {
// // //     if (!silent) setLoading(true);
// // //     else         setRefreshing(true);
// // //     setError(null);
// // //     try {
// // //       const [pending, assigned, driverActive, proof, delivered] = await Promise.all([
// // //         getDeliveryPending().catch(() => []),
// // //         getDeliveryAssigned().catch(() => []),
// // //         getDeliveryReady().catch(() => []),
// // //         getDeliveryProofPending().catch(() => []),
// // //         getDeliveryDelivered().catch(() => []),
// // //       ]);
// // //       setPendingOrders(pending);
// // //       setAssignedOrders(assigned);
// // //       setDriverActiveOrders(driverActive);
// // //       setProofOrders(proof);
// // //       setDeliveredOrders(delivered);
// // //     } catch (err) {
// // //       console.error('Delivery fetch error', err);
// // //       setError('Failed to load orders. Please refresh.');
// // //     } finally {
// // //       setLoading(false);
// // //       setRefreshing(false);
// // //     }
// // //   }, []);

// // //   useEffect(() => { fetchAll(); }, [fetchAll]);

  

// // //   // ── Driver search filter ──────────────────────────────────────────────────

// // //   useEffect(() => {
// // //     if (!driverSearch.trim()) { setFilteredDrivers(drivers); return; }
// // //     const q = driverSearch.toLowerCase();
// // //     setFilteredDrivers(drivers.filter(d => {
// // //       const name  = `${d.first_name || d.name || ''} ${d.last_name || ''}`.toLowerCase();
// // //       const phone = (d.phone_no || '').toLowerCase();
// // //       return name.includes(q) || phone.includes(q);
// // //     }));
// // //   }, [driverSearch, drivers]);


  
// // //   // ── Derived data ──────────────────────────────────────────────────────────

// // //   const allOrders = useMemo(() =>
// // //     // Combine buckets and deduplicate by `id` to avoid rendering duplicate keys
// // //     (() => {
// // //       const combined = [...pendingOrders, ...assignedOrders, ...driverActiveOrders, ...proofOrders, ...deliveredOrders];
// // //       const byId = new Map<number | string, any>();
// // //       for (const o of combined) {
// // //         const key = o?.id ?? Math.random();
// // //         if (!byId.has(key)) {
// // //           byId.set(key, o);
// // //         } else {
// // //           // keep the newest by created_at
// // //           const existing = byId.get(key);
// // //           try {
// // //             const exTime = existing?.created_at ? new Date(existing.created_at).getTime() : 0;
// // //             const newTime = o?.created_at ? new Date(o.created_at).getTime() : 0;
// // //             if (newTime > exTime) byId.set(key, o);
// // //           } catch (e) {
// // //             // fallback: overwrite
// // //             byId.set(key, o);
// // //           }
// // //         }
// // //       }
// // //       return Array.from(byId.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
// // //     })(),
// // //     [pendingOrders, assignedOrders, driverActiveOrders, proofOrders, deliveredOrders]
// // //   );


// // //   const getDeliverySchedule = (order: any) => {
// // //   const rawDate = order?.expected_delivery_date || order?.delivery_date || order?.deliveryDate || null;
// // //   const time = order?.time_slot || order?.delivery_time_slot || order?.deliveryTimeSlot || null;

// // //   let isToday = false;
// // //   if (rawDate) {
// // //     const d = new Date(rawDate);
// // //     const now = new Date();
// // //     isToday = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
// // //   }

// // //   return {
// // //     dateLabel: rawDate ? fmtDate(rawDate) : null,
// // //     time,
// // //     isToday,
// // //   };
// // // };

// // //   const visibleOrders = useMemo(() => {
// // //     switch (activeTab) {
// // //       case 'pending':       return pendingOrders;
// // //       case 'assigned':      return assignedOrders;
// // //       case 'driver_active': return driverActiveOrders;
// // //       case 'proof_pending': return proofOrders;
// // //       case 'delivered':     return deliveredOrders;
// // //       default:              return allOrders;
// // //     }
// // //   }, [activeTab, pendingOrders, assignedOrders, driverActiveOrders, proofOrders, deliveredOrders, allOrders]);

// // //   // ── Success toast helper ──────────────────────────────────────────────────

// // //   const showSuccess = (msg: string) => {
// // //     setSuccessMsg(msg);
// // //     setTimeout(() => setSuccessMsg(null), 3000);
// // //   };

// // //   // ── Open driver assignment modal ──────────────────────────────────────────
// // //   // Called when delivery agent wants to assign a driver to an ASSIGNED_TO_AGENT order.
// // //   // Loads /drivers/available first; falls back to /drivers.

// // //   const handleOpenAssign = async (order: any, e?: React.MouseEvent) => {
// // //     e?.stopPropagation();
// // //     setAssignTargetOrder(order);
// // //     setDriverModalOpen(true);
// // //     setDriverLoading(true);
// // //     setDriverSearch('');
// // //     setAssignSuccess(null);
// // //     setError(null);
// // //     try {
// // //       let list: any[] = await getAvailableDrivers().catch(() => []);
// // //       if (!list || list.length === 0) {
// // //         list = await getDrivers().catch(() => []);
// // //       }
// // //       setDrivers(list);
// // //       setFilteredDrivers(list);
// // //     } catch {
// // //       setDrivers([]);
// // //       setFilteredDrivers([]);
// // //     } finally {
// // //       setDriverLoading(false);
// // //     }
// // //   };

// // //   // ── Assign driver ─────────────────────────────────────────────────────────
// // //   // POST /orders/:id/assign-driver  { driver_id }
// // //   // Backend: requires status = ASSIGNED_TO_AGENT or ASSIGNED_TO_DRIVER (re-assign)
// // //   // → sets status = ASSIGNED_TO_DRIVER

// // //   const handleAssignDriver = async (driver: any) => {
// // //     if (!assignTargetOrder || assigningDriver !== null) return;
// // //     setAssigningDriver(driver.id);
// // //     setError(null);
// // //     try {
// // //       await assignDriverToOrder(Number(assignTargetOrder.id), Number(driver.id));
// // //       const driverName = `${driver.first_name || driver.name || 'Driver'} ${driver.last_name || ''}`.trim();
// // //       setAssignSuccess(`Order #${assignTargetOrder.order_number || assignTargetOrder.id} assigned to ${driverName}`);
// // //       await fetchAll(true);
// // //       setTimeout(() => {
// // //         setDriverModalOpen(false);
// // //         setAssignTargetOrder(null);
// // //         setAssignSuccess(null);
// // //       }, 1800);
// // //     } catch (err: any) {
// // //       setError(err?.response?.data?.error || 'Failed to assign driver. Please try again.');
// // //     } finally {
// // //       setAssigningDriver(null);
// // //     }
// // //   };

// // //   // ── Confirm delivery ──────────────────────────────────────────────────────
// // //   // POST /orders/:id/confirm-delivery
// // //   // Backend: requires status = DELIVERY_SUBMITTED (driver sent proof)
// // //   // → sets status = DELIVERED

// // //   const handleConfirmDelivery = async () => {
// // //     if (!confirmTarget) return;
// // //     setActionLoading(confirmTarget.id);
// // //     setError(null);
// // //     try {
// // //       await markOrderDelivered(confirmTarget.id);
// // //       showSuccess(`Order #${confirmTarget.order_number || confirmTarget.id} confirmed as delivered!`);
// // //       setConfirmModalOpen(false);
// // //       setConfirmTarget(null);
// // //       if (modalOpen && selectedOrder?.id === confirmTarget.id) setModalOpen(false);
// // //       await fetchAll(true);
// // //     } catch (err: any) {
// // //       setError(err?.response?.data?.error || 'Failed to confirm delivery.');
// // //     } finally {
// // //       setActionLoading(null);
// // //     }
// // //   };

// // //   // ── Render action buttons per order status ────────────────────────────────

// // //   const renderActionBtn = (order: any, fromModal = false) => {
// // //     const status    = (order.status || '').toUpperCase();
// // //     const isLoading = actionLoading === order.id;

// // //     // ASSIGNED_TO_AGENT → delivery agent picks a driver
// // //     if (status === 'ASSIGNED_TO_AGENT') {
// // //       return (
// // //         <button
// // //           className="da-action-primary bg-assign"
// // //           disabled={isLoading}
// // //           onClick={e => { e.stopPropagation(); handleOpenAssign(order); }}
// // //         >
// // //           <IconTruck size={13} /> Assign Driver
// // //         </button>
// // //       );
// // //     }

// // //     // ASSIGNED_TO_DRIVER → can re-assign (driver hasn't accepted yet)
// // //     if (status === 'ASSIGNED_TO_DRIVER') {
// // //       return (
// // //         <div className={`da-action-group ${fromModal ? 'da-action-group-modal' : ''}`}>
// // //           <button
// // //             className="da-action-secondary bg-reassign"
// // //             disabled={isLoading}
// // //             onClick={e => { e.stopPropagation(); handleOpenAssign(order); }}
// // //           >
// // //             <IconTruck size={13} /> Re-assign
// // //           </button>
// // //           <span className="da-waiting-chip">Awaiting driver acceptance</span>
// // //         </div>
// // //       );
// // //     }

// // //     // DRIVER_ACCEPTED / OUT_FOR_DELIVERY → read-only, driver is en route
// // //     if (status === 'DRIVER_ACCEPTED' || status === 'OUT_FOR_DELIVERY') {
// // //       return (
// // //         <span className="da-info-chip">
// // //           <IconTruck size={12} /> Driver en route
// // //         </span>
// // //       );
// // //     }

// // //     // DELIVERY_SUBMITTED → delivery agent reviews proof and confirms
// // //     if (status === 'DELIVERY_SUBMITTED') {
// // //       return (
// // //         <button
// // //           className="da-action-primary bg-delivered"
// // //           disabled={isLoading}
// // //           onClick={e => {
// // //             e.stopPropagation();
// // //             setConfirmTarget(order);
// // //             setConfirmModalOpen(true);
// // //           }}
// // //         >
// // //           <IconCheckCircle size={13} />
// // //           {isLoading ? 'Confirming…' : 'Confirm Delivered'}
// // //         </button>
// // //       );
// // //     }

// // //     // DELIVERED → done
// // //     if (status === 'DELIVERED') {
// // //       return (
// // //         <span className="da-done-badge">
// // //           <IconCheckCircle size={12} /> Delivered
// // //         </span>
// // //       );
// // //     }

// // //     return null;
// // //   };

// // //   // ── Tab config ────────────────────────────────────────────────────────────

// // //   const tabs: { key: TabType; label: string; count: number; badgeClass: string }[] = [
// // //     { key: 'all',          label: 'All Orders',      count: allOrders.length,        badgeClass: 'bg-all'       },
// // //     { key: 'pending',      label: 'Ready (Pickup)',  count: pendingOrders.length,     badgeClass: 'bg-pending'   },
// // //     { key: 'assigned',     label: 'Agent Assigned',  count: assignedOrders.length,    badgeClass: 'bg-assigned'  },
// // //     { key: 'driver_active',label: 'Driver Active',   count: driverActiveOrders.length,badgeClass: 'bg-onway'    },
// // //     { key: 'proof_pending',label: 'Proof Submitted', count: proofOrders.length,       badgeClass: 'bg-proof'    },
// // //     { key: 'delivered',    label: 'Delivered',       count: deliveredOrders.length,   badgeClass: 'bg-completed' },
// // //   ];

// // //   // ─── Render ────────────────────────────────────────────────────────────────

// // //   return (
// // //     <div className="da-container">

// // //       {/* Success toast */}
// // //       {successMsg && (
// // //         <div className="da-toast-success">
// // //           <IconCheckCircle size={16} /><span>{successMsg}</span>
// // //         </div>
// // //       )}

// // //       {/* Error banner */}
// // //       {error && (
// // //         <div className="da-error-banner">
// // //           <IconAlert size={16} /><span>{error}</span>
// // //           <button onClick={() => setError(null)} className="da-error-dismiss">✕</button>
// // //         </div>
// // //       )}

// // //       {/* Header */}
// // //       <div className="da-page-header">
// // //         <div className="da-header-text">
// // //           <h2>Delivery Agent Dashboard</h2>
// // //           <p>Assign drivers to orders, track deliveries, and confirm completions.</p>
// // //         </div>
// // //         <button
// // //           className={`da-refresh-btn ${refreshing ? 'spinning' : ''}`}
// // //           onClick={() => fetchAll(true)}
// // //           title="Refresh"
// // //         >
// // //           <IconRefresh size={16} />
// // //         </button>
// // //       </div>

// // //       {/* Stats grid */}
// // //       <div className="da-stats-grid">
// // //         <div className="da-stat-card" onClick={() => setActiveTab('all')}>
// // //           <div className="da-stat-icon icon-all"><IconPackage size={22} /></div>
// // //           <div className="da-stat-details"><h3>{allOrders.length}</h3><p>Total Orders</p></div>
// // //         </div>
// // //         <div className="da-stat-card" onClick={() => setActiveTab('pending')}>
// // //           <div className="da-stat-icon icon-pending"><IconClock size={22} /></div>
// // //           <div className="da-stat-details"><h3>{pendingOrders.length}</h3><p>Ready for Pickup</p></div>
// // //         </div>
// // //         <div className="da-stat-card" onClick={() => setActiveTab('assigned')}>
// // //           <div className="da-stat-icon icon-assigned"><IconUser size={22} /></div>
// // //           <div className="da-stat-details"><h3>{assignedOrders.length}</h3><p>Need Driver</p></div>
// // //         </div>
// // //         <div className="da-stat-card" onClick={() => setActiveTab('driver_active')}>
// // //           <div className="da-stat-icon icon-onway"><IconTruck size={22} /></div>
// // //           <div className="da-stat-details"><h3>{driverActiveOrders.length}</h3><p>Driver Active</p></div>
// // //         </div>
// // //         <div className="da-stat-card" onClick={() => setActiveTab('proof_pending')}>
// // //           <div className="da-stat-icon icon-proof"><IconImage size={22} /></div>
// // //           <div className="da-stat-details"><h3>{proofOrders.length}</h3><p>Proof Submitted</p></div>
// // //         </div>
// // //         <div className="da-stat-card" onClick={() => setActiveTab('delivered')}>
// // //           <div className="da-stat-icon icon-delivered"><IconCheckCircle size={22} /></div>
// // //           <div className="da-stat-details"><h3>{deliveredOrders.length}</h3><p>Delivered</p></div>
// // //         </div>
// // //       </div>

// // //       {/* Tabs */}
// // //       <div className="da-tabs-bar">
// // //         {tabs.map(t => (
// // //           <button
// // //             key={t.key}
// // //             className={`da-tab-item ${activeTab === t.key ? 'active' : ''}`}
// // //             onClick={() => setActiveTab(t.key)}
// // //           >
// // //             {t.label}
// // //             <span className={`da-tab-badge ${t.badgeClass}`}>{t.count}</span>
// // //           </button>
// // //         ))}
// // //       </div>

// // //       {/* Orders grid */}
// // //       {loading ? (
// // //         <div className="da-center-loader">
// // //           <div className="da-spinner" /><p>Loading orders…</p>
// // //         </div>
// // //       ) : visibleOrders.length === 0 ? (
// // //         <div className="da-empty-state">
// // //           <IconTruck size={48} />
// // //           <h3>No Orders Here</h3>
// // //           <p>No orders in this category right now.</p>
// // //         </div>
// // //       ) : (
// // //         <div className="da-orders-grid">
// // //           {visibleOrders.map(order => {
// // //             const status   = (order.status || '').toUpperCase();
// // //             const customer = order.customer;
// // //             const addr     = order.delivery_address;
// // //             const orderIsCustomCake = isCustomCakeOrder(order);
// // //             const schedule = getDeliverySchedule(order)

// // //             return (
// // //               <div
// // //                 key={order.id}
// // //                 className={`da-order-card ${schedule.isToday ? 'card-due-today' : ''}`}
// // //                 onClick={() => { setSelectedOrder(order); setModalOpen(true); }}
// // //               >
// // //                 {/* Card top */}
// // //                 <div className="da-card-top">
// // //                   <div className="da-card-id-block">
// // //                     <h4 className="da-order-number">
// // //                       #{order.order_number || String(order.id).padStart(5, '0')}
// // //                     </h4>
// // //                     <span className="da-order-time">
// // //                       <IconClock size={11} />
// // //                       {fmtDate(order.created_at)} · {fmtTime(order.created_at)}
// // //                     </span>
// // //                   </div>
// // //                   <span className={`da-status-pill ${statusPillClass(status)}`}>
// // //                     {statusLabel(status)}
// // //                   </span>
// // //                 </div>



// // //                 {(schedule.dateLabel || schedule.time) && (
// // //   <div className={`da-schedule-row ${schedule.isToday ? 'is-today' : ''}`}>
// // //     <IconClock size={12} />
// // //     <span className="da-schedule-label">Expected:</span>
// // //     <span className="da-schedule-value">
// // //       {schedule.dateLabel || 'Date TBD'}
// // //       {schedule.time && <> · {schedule.time}</>}
// // //     </span>
// // //     {schedule.isToday && <span className="da-schedule-today-tag">Today</span>}
// // //   </div>
// // // )}



// // //                 {/* Custom cake badge */}
// // //                 {orderIsCustomCake && (
// // //                   <div
// // //                     style={{
// // //                       display: 'inline-flex',
// // //                       alignItems: 'center',
// // //                       gap: 4,
// // //                       fontSize: 11,
// // //                       fontWeight: 600,
// // //                       color: '#b45309',
// // //                       background: '#fef3c7',
// // //                       border: '1px solid #fde68a',
// // //                       borderRadius: 6,
// // //                       padding: '2px 8px',
// // //                       marginBottom: 6,
// // //                       width: 'fit-content',
// // //                     }}
// // //                   >
// // //                     <IconCake size={11} /> Custom Cake Order
// // //                   </div>
// // //                 )}

// // //                 {/* Customer & address */}
// // //                 {(customer || addr) && (
// // //                   <div className="da-card-meta">
// // //                     {customer && (
// // //                       <div className="da-meta-row">
// // //                         <IconUser size={12} />
// // //                         <span>
// // //                           {typeof customer === 'object'
// // //                             ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
// // //                             : customer}
// // //                         </span>
// // //                       </div>
// // //                     )}
// // //                     {addr && (
// // //                       <div className="da-meta-row">
// // //                         <IconMapPin size={12} />
// // //                         <span>
// // //                           {addr.street ? `${addr.street}, ` : ''}{addr.city || ''}
// // //                           {addr.pincode ? ` — ${addr.pincode}` : ''}
// // //                         </span>
// // //                       </div>
// // //                     )}
// // //                   </div>
// // //                 )}

// // //                 {/* Items */}
// // //                 <div className="da-card-items">
// // //                   {(order.items || []).slice(0, 3).map((item: any, idx: number) => (
// // //                     <div key={item.id || idx} className="da-item-line">
// // //                       <span className="da-item-qty">×{item.quantity}</span>
// // //                       <span className="da-item-name">{getItemDisplayName(item)}</span>
// // //                     </div>
// // //                   ))}
// // //                   {(order.items || []).length > 3 && (
// // //                     <span className="da-item-more">+{order.items.length - 3} more</span>
// // //                   )}
// // //                 </div>

// // //                 {/* Driver tag if assigned */}
// // //                 {order.driver && (
// // //                   <div className="da-driver-tag">
// // //                     <IconTruck size={11} />
// // //                     <span>
// // //                       {`${order.driver.first_name || ''} ${order.driver.last_name || ''}`.trim() || 'Driver assigned'}
// // //                     </span>
// // //                   </div>
// // //                 )}

// // //                 {/* Proof submitted indicator */}
// // //                 {status === 'DELIVERY_SUBMITTED' && (
// // //                   <div className="da-proof-tag">
// // //                     <IconImage size={11} />
// // //                     <span>Driver submitted delivery proof</span>
// // //                   </div>
// // //                 )}

// // //                 {/* Total */}
// // //                 {(order.grand_total || order.total) && (
// // //                   <div className="da-card-total">
// // //                     <span>Total</span>
// // //                     <strong>{fmtCurrency(order.grand_total || order.total || 0, order.currency)}</strong>
// // //                   </div>
// // //                 )}

// // //                 {/* Action footer */}
// // //                 <div className="da-card-footer">
// // //                   <button
// // //                     className="da-view-btn"
// // //                     onClick={e => { e.stopPropagation(); setSelectedOrder(order); setModalOpen(true); }}
// // //                   >
// // //                     <IconEye size={13} /> View
// // //                   </button>
// // //                   {renderActionBtn(order)}
// // //                 </div>
// // //               </div>
// // //             );
// // //           })}
// // //         </div>
// // //       )}

// // //       {/* ─── Order Detail Modal ─────────────────────────────────────────── */}
// // //       {modalOpen && selectedOrder && (
// // //         <div className="da-modal-backdrop" onClick={() => setModalOpen(false)}>
// // //           <div className="da-modal-card" onClick={e => e.stopPropagation()}>
// // //             <div className="da-modal-header">
// // //               <h3>Order Details</h3>
// // //               <button className="da-modal-close" onClick={() => setModalOpen(false)}>
// // //                 <IconX size={16} />
// // //               </button>
// // //             </div>
// // //             <div className="da-modal-body">

// // //               {/* Status row */}
// // //               <div className="da-modal-meta">
// // //                 <div>
// // //                   <p className="da-modal-order-num">
// // //                     #{selectedOrder.order_number || selectedOrder.id}
// // //                   </p>
// // //                   <p className="da-modal-order-type">
// // //                     {selectedOrder.order_type || 'DELIVERY'} · {fmtDate(selectedOrder.created_at)}
// // //                   </p>
// // //                 </div>
// // //                 <span className={`da-status-pill ${statusPillClass(selectedOrder.status)}`}>
// // //                   {statusLabel(selectedOrder.status)}
// // //                 </span>
// // //               </div>

// // //               {/* Custom cake badge in modal */}
// // //               {isCustomCakeOrder(selectedOrder) && (
// // //                 <div
// // //                   style={{
// // //                     display: 'inline-flex',
// // //                     alignItems: 'center',
// // //                     gap: 4,
// // //                     fontSize: 12,
// // //                     fontWeight: 600,
// // //                     color: '#b45309',
// // //                     background: '#fef3c7',
// // //                     border: '1px solid #fde68a',
// // //                     borderRadius: 6,
// // //                     padding: '3px 10px',
// // //                     margin: '10px 0',
// // //                     width: 'fit-content',
// // //                   }}
// // //                 >
// // //                   <IconCake size={12} /> Custom Cake Order
// // //                 </div>
// // //               )}

// // //               {/* Order Origin (placed by / source) */}
// // //               {(selectedOrder.placed_by || selectedOrder.source || selectedOrder.order_origin || selectedOrder.placed_by_role || selectedOrder.placed_by_email) && (
// // //                 <div className="da-modal-section">
// // //                   <h5 className="da-modal-section-title">Order Origin</h5>
// // //                   <div className="da-modal-info-grid">
// // //                     {selectedOrder.placed_by && (
// // //                       <div className="da-info-row">
// // //                         <IconUser size={13} />
// // //                                             <span>{renderValue(selectedOrder.placed_by)}</span>
// // //                       </div>
// // //                     )}
// // //                     {selectedOrder.placed_by_role && (
// // //                       <div className="da-info-row">
// // //                         <span className="da-origin-role">{selectedOrder.placed_by_role}</span>
// // //                       </div>
// // //                     )}
// // //                     {selectedOrder.placed_by_email && (
// // //                       <div className="da-info-row">
// // //                         <span>{selectedOrder.placed_by_email}</span>
// // //                       </div>
// // //                     )}
// // //                     {selectedOrder.source && (
// // //                       <div className="da-info-row">
// // //                         <span>Source: {selectedOrder.source}</span>
// // //                       </div>
// // //                     )}
// // //                   </div>
// // //                 </div>
// // //               )}

// // //               {/* Delivery schedule (expected date / time slot / area) */}
// // //               {(selectedOrder.expected_delivery_date || selectedOrder.time_slot || selectedOrder.delivery_area || selectedOrder.area) && (
// // //                 <div className="da-modal-section">
// // //                   <h5 className="da-modal-section-title">Delivery Schedule</h5>
// // //                   <div className="da-modal-info-grid">
// // //                     {selectedOrder.expected_delivery_date && (
// // //                       <div className="da-info-row">
// // //                         <IconClock size={13} />
// // //                         <span>{fmtDate(selectedOrder.expected_delivery_date)}</span>
// // //                       </div>
// // //                     )}
// // //                     {selectedOrder.time_slot && (
// // //                       <div className="da-info-row">
// // //                         <IconClock size={13} />
// // //                         <span>{selectedOrder.time_slot}</span>
// // //                       </div>
// // //                     )}
// // //                     {(selectedOrder.delivery_area || selectedOrder.area) && (
// // //                       <div className="da-info-row">
// // //                         <IconMapPin size={13} />
// // //                                             <span>{renderValue(selectedOrder.delivery_area || selectedOrder.area)}</span>
// // //                       </div>
// // //                     )}
// // //                   </div>
// // //                 </div>
// // //               )}

// // //               {/* Payment */}
// // //               {selectedOrder.payment_method && (
// // //                 <div className="da-modal-section">
// // //                   <h5 className="da-modal-section-title">Payment</h5>
// // //                   <div className="da-info-row">
// // //                     <span>{selectedOrder.payment_method}</span>
// // //                     {selectedOrder.payment_status && (
// // //                       <span className={`da-payment-chip chip-${(selectedOrder.payment_status || '').toLowerCase()}`}>
// // //                         {selectedOrder.payment_status}
// // //                       </span>
// // //                     )}
// // //                     {selectedOrder.currency && (
// // //                       <span className="da-currency-label">{selectedOrder.currency}</span>
// // //                     )}
// // //                   </div>
// // //                 </div>
// // //               )}

// // //               {/* Customer */}
// // //               {selectedOrder.customer && (
// // //                 <div className="da-modal-section">
// // //                   <h5 className="da-modal-section-title">Customer</h5>
// // //                   <div className="da-modal-info-grid">
// // //                     <div className="da-info-row">
// // //                       <IconUser size={13} />
// // //                       <span>
// // //                         {selectedOrder.customer.first_name} {selectedOrder.customer.last_name}
// // //                       </span>
// // //                     </div>
// // //                     {selectedOrder.customer.phone_no && (
// // //                       <div className="da-info-row">
// // //                         <IconPhone size={13} />
// // //                         <span>{selectedOrder.customer.phone_no}</span>
// // //                       </div>
// // //                     )}
// // //                     {selectedOrder.customer.email && (
// // //                       <div className="da-info-row">
// // //                         <span className="da-customer-email">{selectedOrder.customer.email}</span>
// // //                       </div>
// // //                     )}
// // //                   </div>
// // //                 </div>
// // //               )}

// // //               {/* Customer & Delivery Address (brief + expanded) */}
// // //               {selectedOrder.customer && (
// // //                 <div className="da-modal-section">
// // //                   <h5 className="da-modal-section-title">Customer & Address</h5>
// // //                   <div className="da-modal-info-grid">
// // //                     <div className="da-info-row">
// // //                       <IconUser size={13} />
// // //                       <span>{renderValue(selectedOrder.customer.first_name || selectedOrder.customer.name || (selectedOrder.customer.first_name && selectedOrder.customer.last_name ? `${selectedOrder.customer.first_name} ${selectedOrder.customer.last_name}` : ''))}</span>
// // //                     </div>
// // //                     {selectedOrder.customer.phone_no && (
// // //                       <div className="da-info-row">
// // //                         <IconPhone size={13} />
// // //                         <span>{renderValue(selectedOrder.customer.phone_no)}</span>
// // //                       </div>
// // //                     )}
// // //                     {selectedOrder.customer.email && (
// // //                       <div className="da-info-row">
// // //                         <span className="da-customer-email">{renderValue(selectedOrder.customer.email)}</span>
// // //                       </div>
// // //                     )}

// // //                     {selectedOrder.delivery_address && (
// // //                       <div className="da-address-box">
// // //                         <strong className="da-address-label">Address:</strong>
// // //                         <div className="da-address-lines">
// // //                           {selectedOrder.delivery_address.building && (
// // //                             <div><span className="da-address-field">Building:</span> {renderValue(selectedOrder.delivery_address.building)}</div>
// // //                           )}
// // //                           {selectedOrder.delivery_address.block && (
// // //                             <div><span className="da-address-field">Block:</span> {renderValue(selectedOrder.delivery_address.block)}</div>
// // //                           )}
// // //                           {selectedOrder.delivery_address.avenue && (
// // //                             <div><span className="da-address-field">Avenue:</span> {renderValue(selectedOrder.delivery_address.avenue)}</div>
// // //                           )}
// // //                           {selectedOrder.delivery_address.street && (
// // //                             <div><span className="da-address-field">Street:</span> {renderValue(selectedOrder.delivery_address.street)}</div>
// // //                           )}
// // //                           {(selectedOrder.delivery_address.floor || selectedOrder.delivery_address.apt || selectedOrder.delivery_address.apartment) && (
// // //                             <div><span className="da-address-field">Floor/Apt:</span> {renderValue(selectedOrder.delivery_address.floor || selectedOrder.delivery_address.apt || selectedOrder.delivery_address.apartment)}</div>
// // //                           )}
// // //                           {selectedOrder.delivery_address.address_notes && (
// // //                             <div><span className="da-address-field">Address notes:</span> {renderValue(selectedOrder.delivery_address.address_notes)}</div>
// // //                           )}
// // //                           {/* Fallback short line if none of the above present */}
// // //                           {!selectedOrder.delivery_address.building && !selectedOrder.delivery_address.block && !selectedOrder.delivery_address.avenue && !selectedOrder.delivery_address.street && (
// // //                             <div>{renderValue(selectedOrder.delivery_address.city)}{selectedOrder.delivery_address.pincode ? ` — ${renderValue(selectedOrder.delivery_address.pincode)}` : ''}</div>
// // //                           )}
// // //                         </div>
// // //                       </div>
// // //                     )}

// // //                   </div>
// // //                 </div>
// // //               )}


// // //               {/* Assigned driver */}
// // //               {selectedOrder.driver && (
// // //                 <div className="da-modal-section">
// // //                   <h5 className="da-modal-section-title">Assigned Driver</h5>
// // //                   <div className="da-modal-driver-tag">
// // //                     <IconTruck size={14} />
// // //                     <span>
// // //                       {`${selectedOrder.driver.first_name || ''} ${selectedOrder.driver.last_name || ''}`.trim()}
// // //                     </span>
// // //                     {selectedOrder.driver.phone_no && (
// // //                       <span className="da-driver-phone-modal">· {selectedOrder.driver.phone_no}</span>
// // //                     )}
// // //                   </div>
// // //                 </div>
// // //               )}

// // //               {/* Delivery proof (shown when driver submitted) */}
// // //               {(selectedOrder.status === 'DELIVERY_SUBMITTED' || selectedOrder.delivery_photo) && (
// // //                 <div className="da-modal-section da-proof-section">
// // //                   <h5 className="da-modal-section-title">Delivery Proof from Driver</h5>
// // //                   {selectedOrder.delivery_photo && (
// // //                     <a
// // //                       href={selectedOrder.delivery_photo}
// // //                       target="_blank"
// // //                       rel="noopener noreferrer"
// // //                       className="da-proof-photo-link"
// // //                     >
// // //                       <IconImage size={14} /> View Photo ↗
// // //                     </a>
// // //                   )}
// // //                   {selectedOrder.delivery_notes && (
// // //                     <p className="da-proof-notes">
// // //                       <strong>Driver note:</strong> {selectedOrder.delivery_notes}
// // //                     </p>
// // //                   )}
// // //                   {selectedOrder.customer_confirmation_name && (
// // //                     <p className="da-proof-notes">
// // //                       <strong>Received by:</strong> {selectedOrder.customer_confirmation_name}
// // //                       {selectedOrder.customer_confirmation_phone
// // //                         ? ` · ${selectedOrder.customer_confirmation_phone}`
// // //                         : ''}
// // //                     </p>
// // //                   )}
// // //                   {selectedOrder.driver_submitted_at && (
// // //                     <p className="da-proof-notes">
// // //                       <strong>Submitted:</strong>{' '}
// // //                       {new Date(selectedOrder.driver_submitted_at).toLocaleString()}
// // //                     </p>
// // //                   )}
// // //                 </div>
// // //               )}

// // //               {/* Items */}
// // //               <div className="da-modal-section">
// // //                 <h5 className="da-modal-section-title">Order Items</h5>
// // //                 <div className="da-modal-items">
// // //                   {(selectedOrder.items || []).map((item: any, idx: number) => {
// // //                     const displayName = getItemDisplayName(item);
// // //                     const displayImage = getItemDisplayImage(item);
// // //                     const displayDescription = getItemDisplayDescription(item);
// // //                     const flavour = getFlavour(item);
// // //                     const variant = getVariant(item);
// // //                     const shape = getShape(item);
// // //                     const addOns = getAddOns(item);
// // //                     const itemNotes = getItemNotes(item);

// // //                     return (
// // //                       <div key={item.id || idx} className="da-modal-item-row">
// // //                         <div className="da-modal-item-left">
// // //                           <span className="da-modal-qty">×{item.quantity}</span>
// // //                           <div className="da-modal-item-with-thumb">
// // //                             {displayImage && (
// // //                               <div className="da-item-thumb">
// // //                                 <img
// // //                                   src={displayImage}
// // //                                   alt={displayName}
// // //                                   onError={(e: any) => { e.target.style.display = 'none'; }}
// // //                                 />
// // //                               </div>
// // //                             )}
// // //                             <div>
// // //                               <p className="da-modal-item-name">{displayName}</p>
// // //                               {displayDescription && (
// // //                                 <p className="da-modal-item-desc">{displayDescription}</p>
// // //                               )}

// // //                               {/* Customization chips — flavour / variant / shape */}
// // //                               {(flavour || variant || shape) && (
// // //                                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
// // //                                   {flavour && (
// // //                                     <span style={{ fontSize: 11, background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 5, padding: '1px 7px' }}>
// // //                                       Flavour: <strong>{flavour}</strong>
// // //                                     </span>
// // //                                   )}
// // //                                   {variant && (
// // //                                     <span style={{ fontSize: 11, background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 5, padding: '1px 7px' }}>
// // //                                       Variant: <strong>{variant}</strong>
// // //                                     </span>
// // //                                   )}
// // //                                   {shape && (
// // //                                     <span style={{ fontSize: 11, background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 5, padding: '1px 7px' }}>
// // //                                       Shape: <strong>{shape}</strong>
// // //                                     </span>
// // //                                   )}
// // //                                 </div>
// // //                               )}

// // //                               {/* Add-ons */}
// // //                               {addOns.length > 0 && (
// // //                                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
// // //                                   {addOns.map((addOn, i) => (
// // //                                     <span key={i} style={{ fontSize: 11, background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 5, padding: '1px 7px' }}>
// // //                                       {addOn}
// // //                                     </span>
// // //                                   ))}
// // //                                 </div>
// // //                               )}

// // //                               {/* Special instructions */}
// // //                               {itemNotes && (
// // //                                 <p style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
// // //                                   <strong>Instruction:</strong> "{itemNotes}"
// // //                                 </p>
// // //                               )}
// // //                             </div>
// // //                           </div>
// // //                         </div>
// // //                         <span className="da-modal-item-price">
// // //                           {fmtCurrency(item.line_total || (item.price * item.quantity) || 0, selectedOrder?.currency)}
// // //                         </span>
// // //                       </div>
// // //                     );
// // //                   })}
// // //                 </div>
// // //               </div>

// // //               {/* Custom Cake Details — previously not fetched/rendered at all here */}
// // //               {(() => {
// // //                 const customCake = getCustomCakeDetails(selectedOrder);
// // //                 if (!customCake) return null;
// // //                 return (
// // //                   <div className="da-modal-section" style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: 12 }}>
// // //                     <h5 className="da-modal-section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
// // //                       <IconCake size={14} /> Custom Cake Details
// // //                     </h5>
// // //                     <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 6 }}>
// // //                       {customCake.image && (
// // //                         <img
// // //                           src={customCake.image}
// // //                           alt="Custom cake reference"
// // //                           style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 8, border: '1px solid #fde68a' }}
// // //                           onError={(e: any) => { e.target.style.display = 'none'; }}
// // //                         />
// // //                       )}
// // //                       <div className="da-modal-info-grid" style={{ flex: 1, minWidth: 200 }}>
// // //                         <div className="da-info-row"><span>Flavour: <strong>{customCake.flavour ?? '—'}</strong></span></div>
// // //                         <div className="da-info-row"><span>Weight: <strong>{customCake.weight ?? '—'}</strong></span></div>
// // //                         <div className="da-info-row"><span>Shape: <strong>{customCake.shape ?? '—'}</strong></span></div>
// // //                         <div className="da-info-row"><span>Size: <strong>{customCake.size ?? '—'}</strong></span></div>
// // //                         <div className="da-info-row"><span>Colour: <strong>{customCake.colour ?? '—'}</strong></span></div>
// // //                         <div className="da-info-row"><span>Est. price: <strong>{customCake.price != null ? fmtCurrency(customCake.price, selectedOrder.currency) : '—'}</strong></span></div>
// // //                       </div>
// // //                     </div>
// // //                     {customCake.message && (
// // //                       <p style={{ fontSize: 12, marginTop: 8 }}>
// // //                         <strong>Cake message:</strong> "{customCake.message}"
// // //                       </p>
// // //                     )}
// // //                     {customCake.notes && (
// // //                       <p style={{ fontSize: 12, marginTop: 4 }}>
// // //                         <strong>Customization notes:</strong> {customCake.notes}
// // //                       </p>
// // //                     )}
// // //                   </div>
// // //                 );
// // //               })()}

// // //               {/* Delivery notes from order */}
// // //               {selectedOrder.delivery_notes && selectedOrder.status !== 'DELIVERY_SUBMITTED' && (
// // //                 <div className="da-modal-notes">
// // //                   <h5 className="da-modal-section-title">Delivery Notes</h5>
// // //                   <p className="da-modal-notes-text">"{selectedOrder.delivery_notes}"</p>
// // //                 </div>
// // //               )}

// // //               {/* Totals */}
// // //               <div className="da-modal-totals">
// // //                 <div className="da-total-row">
// // //                   <span>Subtotal</span><span>{fmtCurrency(selectedOrder.subtotal, selectedOrder.currency)}</span>
// // //                 </div>
// // //                 <div className="da-total-row">
// // //                   <span>Delivery</span><span>{fmtCurrency(selectedOrder.delivery_charge, selectedOrder.currency)}</span>
// // //                 </div>
// // //                 {selectedOrder.discount > 0 && (
// // //                   <div className="da-total-row da-total-discount">
// // //                     <span>Discount</span><span>−{fmtCurrency(selectedOrder.discount, selectedOrder.currency)}</span>
// // //                   </div>
// // //                 )}
// // //                 <div className="da-total-row da-total-grand">
// // //                   <span>Total</span>
// // //                   <strong>{fmtCurrency(selectedOrder.grand_total || selectedOrder.total || 0, selectedOrder.currency)}</strong>
// // //                 </div>
// // //               </div>
// // //             </div>

// // //             <div className="da-modal-footer">
// // //               <button className="da-modal-print" onClick={() => window.print()}>Print Receipt</button>
// // //               <button className="da-modal-cancel" onClick={() => setModalOpen(false)}>Close</button>
// // //               {renderActionBtn(selectedOrder, true)}
// // //             </div>
// // //           </div>
// // //         </div>
// // //       )}

// // //       {/* ─── Driver Assignment Modal ────────────────────────────────────── */}
// // //       {driverModalOpen && (
// // //         <div className="da-modal-backdrop" onClick={() => { setDriverModalOpen(false); setAssignSuccess(null); }}>
// // //           <div className="da-modal-card da-driver-modal" onClick={e => e.stopPropagation()}>
// // //             <div className="da-modal-header">
// // //               <div>
// // //                 <h3>Assign Driver</h3>
// // //                 {assignTargetOrder && (
// // //                   <p className="da-modal-sub">
// // //                     Order #{assignTargetOrder.order_number || assignTargetOrder.id}
// // //                     {assignTargetOrder.customer && (
// // //                       <span>
// // //                         {' · '}{assignTargetOrder.customer.first_name} {assignTargetOrder.customer.last_name}
// // //                       </span>
// // //                     )}
// // //                   </p>
// // //                 )}
// // //               </div>
// // //               <button
// // //                 className="da-modal-close"
// // //                 onClick={() => { setDriverModalOpen(false); setAssignSuccess(null); }}
// // //               >
// // //                 <IconX size={16} />
// // //               </button>
// // //             </div>

// // //             <div className="da-modal-body">
// // //               {/* Success banner */}
// // //               {assignSuccess && (
// // //                 <div className="da-assign-success">
// // //                   <IconCheckCircle size={18} /><span>{assignSuccess}</span>
// // //                 </div>
// // //               )}

// // //               {driverLoading ? (
// // //                 <div className="da-center-loader" style={{ minHeight: 180 }}>
// // //                   <div className="da-spinner" /><p>Loading available drivers…</p>
// // //                 </div>
// // //               ) : drivers.length === 0 ? (
// // //                 <div className="da-empty-state" style={{ padding: '40px 20px' }}>
// // //                   <IconUser size={40} />
// // //                   <h3>No Drivers Found</h3>
// // //                   <p>No drivers are registered yet, or all are currently on deliveries.</p>
// // //                 </div>
// // //               ) : (
// // //                 <>
// // //                   {/* Search */}
// // //                   <div className="da-driver-search">
// // //                     <IconSearch size={15} />
// // //                     <input
// // //                       type="text"
// // //                       placeholder="Search by name or phone…"
// // //                       value={driverSearch}
// // //                       onChange={e => setDriverSearch(e.target.value)}
// // //                     />
// // //                   </div>

// // //                   {/* Legend */}
// // //                   <div className="da-driver-list-header">
// // //                     <p className="da-driver-list-hint">
// // //                       {filteredDrivers.length} driver{filteredDrivers.length !== 1 ? 's' : ''}
// // //                       {driverSearch ? ' found' : ''} — tap to assign
// // //                     </p>
// // //                     <div className="da-driver-legend">
// // //                       <span className="da-legend-dot ds-available" /> Available
// // //                       <span className="da-legend-dot ds-busy" /> Busy
// // //                       <span className="da-legend-dot ds-offline" /> Offline
// // //                     </div>
// // //                   </div>

// // //                   <div className="da-driver-list">
// // //                     {filteredDrivers.length === 0 ? (
// // //                       <div className="da-driver-no-results">
// // //                         <p>No drivers match "{driverSearch}"</p>
// // //                       </div>
// // //                     ) : (
// // //                       filteredDrivers.map(driver => {
// // //                         // availability_status is the field added in fixed User model
// // //                         const rawStatus   = driver.availability_status || driver.status || 'OFFLINE';
// // //                         const dStatus     = rawStatus.toUpperCase();
// // //                         const isAssigning = assigningDriver === driver.id;
// // //                         const isDisabled  = assigningDriver !== null && !isAssigning;

// // //                         return (
// // //                           <div
// // //                             key={driver.id}
// // //                             className={[
// // //                               'da-driver-card',
// // //                               dStatus === 'ONLINE' || dStatus === 'AVAILABLE' ? 'da-driver-available' : '',
// // //                               isAssigning ? 'da-driver-assigning' : '',
// // //                               isDisabled  ? 'da-driver-disabled'  : '',
// // //                             ].join(' ')}
// // //                             onClick={() => !isAssigning && !isDisabled && handleAssignDriver(driver)}
// // //                           >
// // //                             <div className="da-driver-avatar">
// // //                               {(driver.first_name || driver.name || 'D').charAt(0).toUpperCase()}
// // //                             </div>
// // //                             <div className="da-driver-info">
// // //                               <p className="da-driver-name">
// // //                                 {driver.first_name || driver.name || 'Driver'}
// // //                                 {driver.last_name ? ` ${driver.last_name}` : ''}
// // //                               </p>
// // //                               <div className="da-driver-meta">
// // //                                 {driver.phone_no && (
// // //                                   <span className="da-driver-phone">
// // //                                     <IconPhone size={11} />{driver.phone_no}
// // //                                   </span>
// // //                                 )}
// // //                                 {driver.rating > 0 && (
// // //                                   <span className="da-driver-rating">
// // //                                     <IconStar size={11} />{Number(driver.rating).toFixed(1)}
// // //                                   </span>
// // //                                 )}
// // //                               </div>
// // //                             </div>
// // //                             <div className="da-driver-right">
// // //                               <span className={`da-driver-status ${driverStatusClass(dStatus)}`}>
// // //                                 {driverStatusLabel(dStatus)}
// // //                               </span>
// // //                               {isAssigning ? (
// // //                                 <div className="da-spinner da-spinner-sm" />
// // //                               ) : (
// // //                                 <button
// // //                                   className="da-assign-btn"
// // //                                   disabled={isDisabled}
// // //                                   onClick={e => { e.stopPropagation(); handleAssignDriver(driver); }}
// // //                                 >
// // //                                   Assign
// // //                                 </button>
// // //                               )}
// // //                             </div>
// // //                           </div>
// // //                         );
// // //                       })
// // //                     )}
// // //                   </div>
// // //                 </>
// // //               )}
// // //             </div>
// // //           </div>
// // //         </div>
// // //       )}

// // //       {/* ─── Confirm Delivery Modal ─────────────────────────────────────── */}
// // //       {/* Shown when driver has submitted proof (DELIVERY_SUBMITTED).
// // //           Delivery agent reviews the proof and clicks Confirm to set DELIVERED. */}
// // //       {confirmModalOpen && confirmTarget && (
// // //         <div className="da-modal-backdrop" onClick={() => setConfirmModalOpen(false)}>
// // //           <div className="da-modal-card da-confirm-modal" onClick={e => e.stopPropagation()}>
// // //             <div className="da-modal-header">
// // //               <div>
// // //                 <h3>Confirm Delivery</h3>
// // //                 <p className="da-modal-sub">
// // //                   Order #{confirmTarget.order_number || confirmTarget.id}
// // //                 </p>
// // //               </div>
// // //               <button className="da-modal-close" onClick={() => setConfirmModalOpen(false)}>
// // //                 <IconX size={16} />
// // //               </button>
// // //             </div>
// // //             <div className="da-modal-body">
// // //               <div className="da-confirm-desc">
// // //                 <p>
// // //                   Driver <strong>
// // //                     {confirmTarget.driver
// // //                       ? `${confirmTarget.driver.first_name || ''} ${confirmTarget.driver.last_name || ''}`.trim()
// // //                       : 'your driver'}
// // //                   </strong> has submitted delivery proof for this order.
// // //                 </p>
// // //                 <p>Review the proof below and confirm to mark it as <strong>DELIVERED</strong>.</p>
// // //               </div>

// // //               {/* Show proof details in confirm modal too */}
// // //               {confirmTarget.delivery_photo && (
// // //                 <a
// // //                   href={confirmTarget.delivery_photo}
// // //                   target="_blank"
// // //                   rel="noopener noreferrer"
// // //                   className="da-proof-photo-link"
// // //                 >
// // //                   <IconImage size={14} /> View delivery photo ↗
// // //                 </a>
// // //               )}
// // //               {confirmTarget.delivery_notes && (
// // //                 <p className="da-proof-notes">
// // //                   <strong>Driver note:</strong> {confirmTarget.delivery_notes}
// // //                 </p>
// // //               )}
// // //               {confirmTarget.customer_confirmation_name && (
// // //                 <p className="da-proof-notes">
// // //                   <strong>Received by:</strong> {confirmTarget.customer_confirmation_name}
// // //                 </p>
// // //               )}
// // //               {!confirmTarget.delivery_photo && !confirmTarget.delivery_notes && (
// // //                 <p className="da-proof-notes da-proof-none">No photo or notes submitted by driver.</p>
// // //               )}
// // //             </div>
// // //             <div className="da-modal-footer">
// // //               <button
// // //                 className="da-modal-cancel"
// // //                 disabled={actionLoading === confirmTarget.id}
// // //                 onClick={() => setConfirmModalOpen(false)}
// // //               >
// // //                 Cancel
// // //               </button>
// // //               <button
// // //                 className="da-action-primary bg-delivered"
// // //                 disabled={actionLoading === confirmTarget.id}
// // //                 onClick={handleConfirmDelivery}
// // //               >
// // //                 <IconCheckCircle size={14} />
// // //                 {actionLoading === confirmTarget.id ? 'Confirming…' : 'Confirm Delivered'}
// // //               </button>
// // //             </div>
// // //           </div>
// // //         </div>
// // //       )}

// // //     </div>
// // //   );
// // // };

// // // export default DeliveryOrder;


// // import React, { useState, useEffect, useCallback, useMemo } from 'react';
// // import './DeliveryOrder.css';

// // // ─── Service imports ─────────────────────────────────────────────────────────
// // // All URLs come from delivery_routes.py and order_routes.py
// // import {
// //   getDeliveryPending,       // GET  /delivery/pending         → READY orders (kitchen done, agent not yet assigned)
// //   getDeliveryAssigned,      // GET  /delivery/assigned        → ASSIGNED_TO_AGENT orders
// //   getDeliveryReady,         // GET  /delivery/ready-for-pickup→ ASSIGNED_TO_DRIVER | DRIVER_ACCEPTED | OUT_FOR_DELIVERY
// //   getDeliveryProofPending,  // GET  /delivery/proof-pending   → DELIVERY_SUBMITTED (driver sent proof)
// //   getDeliveryDelivered,     // GET  /delivery/delivered       → DELIVERED orders
// // } from '../../services/deliveryService';

// // import {
// //   assignDriverToOrder,      // POST /orders/:id/assign-driver    { driver_id } → ASSIGNED_TO_DRIVER
// //   markOrderDelivered,       // POST /orders/:id/confirm-delivery                → DELIVERED
// // } from '../../services/orderService';

// // import {
// //   getAvailableDrivers,      // GET  /drivers/available
// //   getDrivers,               // GET  /drivers
// // } from '../../services/driverService';

// // // ─── SVG Icons ────────────────────────────────────────────────────────────────
// // const IconTruck = ({ size = 20 }: { size?: number }) => (
// //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
// //     <rect x="1" y="3" width="15" height="13" rx="2" />
// //     <path d="M16 8h4l3 3v5h-7V8z" />
// //     <circle cx="5.5" cy="18.5" r="2.5" />
// //     <circle cx="18.5" cy="18.5" r="2.5" />
// //   </svg>
// // );
// // const IconClock = ({ size = 18 }: { size?: number }) => (
// //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //     <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
// //   </svg>
// // );
// // const IconCheckCircle = ({ size = 18 }: { size?: number }) => (
// //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //     <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
// //   </svg>
// // );
// // const IconUser = ({ size = 18 }: { size?: number }) => (
// //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //     <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
// //   </svg>
// // );
// // const IconMapPin = ({ size = 14 }: { size?: number }) => (
// //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //     <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
// //   </svg>
// // );
// // const IconPackage = ({ size = 20 }: { size?: number }) => (
// //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //     <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
// //     <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
// //     <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
// //     <line x1="12" y1="22.08" x2="12" y2="12" />
// //   </svg>
// // );
// // const IconRefresh = ({ size = 16 }: { size?: number }) => (
// //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //     <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
// //     <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
// //   </svg>
// // );
// // const IconX = ({ size = 18 }: { size?: number }) => (
// //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //     <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
// //   </svg>
// // );
// // const IconPhone = ({ size = 14 }: { size?: number }) => (
// //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //     <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.88a16 16 0 0 0 6.21 6.21l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
// //   </svg>
// // );
// // const IconSearch = ({ size = 16 }: { size?: number }) => (
// //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //     <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
// //   </svg>
// // );
// // const IconStar = ({ size = 13 }: { size?: number }) => (
// //   <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
// //     <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
// //   </svg>
// // );
// // const IconEye = ({ size = 16 }: { size?: number }) => (
// //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //     <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
// //   </svg>
// // );
// // const IconAlert = ({ size = 16 }: { size?: number }) => (
// //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //     <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
// //   </svg>
// // );
// // const IconImage = ({ size = 16 }: { size?: number }) => (
// //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //     <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
// //     <polyline points="21 15 16 10 5 21" />
// //   </svg>
// // );
// // const IconCake = ({ size = 12 }: { size?: number }) => (
// //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //     <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
// //     <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" />
// //     <path d="M12 3v4" />
// //     <path d="M12 7c-1.5 0-2-1-2-1.5S10.5 4 12 3c1.5 1 2 1.5 2 2.5S13.5 7 12 7z" />
// //   </svg>
// // );
// // // Printer icon — used for the new "Print Receipt" action (card + modal),
// // // mirrors KitchenOrder.tsx's IconPrinter so both dashboards feel consistent.
// // const IconPrinter = ({ size = 16 }: { size?: number }) => (
// //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //     <path d="M6 9V2h12v7" />
// //     <rect x="6" y="13" width="12" height="9" rx="2" />
// //     <path d="M6 18h12" />
// //   </svg>
// // );

// // // ─── Types ────────────────────────────────────────────────────────────────────

// // /**
// //  * Tab keys mapped to the backend delivery_routes.py endpoints:
// //  *
// //  *  'pending'        → GET /delivery/pending          (status = READY, kitchen done, unassigned)
// //  *  'assigned'       → GET /delivery/assigned         (status = ASSIGNED_TO_AGENT)
// //  *  'driver_active'  → GET /delivery/ready-for-pickup (status = ASSIGNED_TO_DRIVER | DRIVER_ACCEPTED | OUT_FOR_DELIVERY)
// //  *  'proof_pending'  → GET /delivery/proof-pending    (status = DELIVERY_SUBMITTED)
// //  *  'delivered'      → GET /delivery/delivered        (status = DELIVERED)
// //  *  'all'            → all of the above merged
// //  */
// // type TabType = 'all' | 'pending' | 'assigned' | 'driver_active' | 'proof_pending' | 'delivered';

// // // ─── Status helpers ───────────────────────────────────────────────────────────

// // // Backend status → pill CSS class
// // const statusPillClass = (s: string): string => {
// //   switch ((s || '').toUpperCase()) {
// //     case 'READY':               return 'pill-ready';
// //     case 'ASSIGNED_TO_AGENT':   return 'pill-assigned';
// //     case 'ASSIGNED_TO_DRIVER':  return 'pill-assigned';
// //     case 'DRIVER_ACCEPTED':     return 'pill-onway';
// //     case 'OUT_FOR_DELIVERY':    return 'pill-onway';
// //     case 'DELIVERY_SUBMITTED':  return 'pill-proof';
// //     case 'DELIVERED':           return 'pill-delivered';
// //     case 'CANCELLED':           return 'pill-cancelled';
// //     default:                    return 'pill-default';
// //   }
// // };

// // // Human-readable label for each backend status
// // const statusLabel = (s: string): string => {
// //   switch ((s || '').toUpperCase()) {
// //     case 'READY':               return 'Ready';
// //     case 'ASSIGNED_TO_AGENT':   return 'Agent Assigned';
// //     case 'ASSIGNED_TO_DRIVER':  return 'Driver Assigned';
// //     case 'DRIVER_ACCEPTED':     return 'Out for Delivery';
// //     case 'OUT_FOR_DELIVERY':    return 'Out for Delivery';
// //     case 'DELIVERY_SUBMITTED':  return 'Proof Submitted';
// //     case 'DELIVERED':           return 'Delivered';
// //     default:                    return (s || '').replace(/_/g, ' ');
// //   }
// // };

// // // Driver availability chip class
// // const driverStatusClass = (s: string): string => {
// //   const st = (s || '').toUpperCase();
// //   if (st === 'ONLINE' || st === 'AVAILABLE') return 'ds-available';
// //   if (st === 'BUSY')                         return 'ds-busy';
// //   return 'ds-offline';
// // };

// // const driverStatusLabel = (s: string): string => {
// //   const st = (s || '').toUpperCase();
// //   if (st === 'ONLINE' || st === 'AVAILABLE') return 'Available';
// //   if (st === 'BUSY')                         return 'Busy';
// //   return 'Offline';
// // };

// // // ─── Formatters ───────────────────────────────────────────────────────────────

// // const fmtTime = (dt: string) =>
// //   dt ? new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—';
// // const fmtDate = (dt: string) =>
// //   dt ? new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—';
// // const fmtDateFull = (dt: string) =>
// //   dt ? new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// // const currencySymbol = (cur?: string) => {
// //   const c = cur || (typeof window !== 'undefined' ? localStorage.getItem('currency') || 'INR' : 'INR');
// //   return c === 'INR' ? '₹' : c;
// // };

// // const fmtCurrency = (n: number | undefined, cur?: string) => `${currencySymbol(cur)}${Number(n || 0).toFixed(0)}`;

// // // Safely render a value that may be a string, number, or object coming from the API.
// // // If it's an object, prefer common display fields (name, first_name, full_name) before falling
// // // back to a JSON string so React never receives a raw object as a child.
// // const renderValue = (v: any) => {
// //   if (v === null || v === undefined) return '';
// //   if (typeof v === 'string' || typeof v === 'number') return String(v);
// //   if (typeof v === 'object') {
// //     return (
// //       v.name || v.title || v.first_name || v.firstName || v.full_name || v.email || JSON.stringify(v)
// //     );
// //   }
// //   return String(v);
// // };

// // // ─── Address field helpers (object-safe) ───────────────────────────────────────
// // // IMPORTANT: never resolve area/country through a generic "first non-empty
// // // string wins" helper — some backends send `address.area` / `address.country`
// // // as a nested object (e.g. { id, name: "Salmiya" }), and String(anObject)
// // // silently becomes the literal text "[object Object]" in the UI. These two
// // // resolvers always check for the object shape FIRST, mirroring
// // // KitchenOrder.tsx's getAddressAreaName so both dashboards behave the same way.
// // const getAddressAreaName = (address: any) => {
// //   const area = address?.area;
// //   if (area === undefined || area === null || area === '') return null;
// //   if (typeof area === 'object') return area.name ?? area.areaName ?? null;
// //   return area;
// // };

// // const getAddressCountryName = (address: any) => {
// //   const country = address?.country;
// //   if (country === undefined || country === null || country === '') return null;
// //   if (typeof country === 'object') return country.name ?? country.countryName ?? null;
// //   return country ?? address?.country_name ?? address?.country_code ?? null;
// // };

// // const getAddressFieldValue = (address: any, keys: string[]) => {
// //   for (const k of keys) {
// //     const v = address?.[k];
// //     if (v !== undefined && v !== null && v !== '') return v;
// //   }
// //   return null;
// // };

// // // Same field set/order as KitchenOrder.tsx's ADDRESS_FIELD_DEFS, so the
// // // delivery agent sees the address laid out identically to kitchen staff —
// // // now including Area and Country, which this file never displayed at all.
// // const ADDRESS_FIELD_DEFS: { label: string; keys?: string[]; resolver?: (a: any) => any }[] = [
// //   { label: 'Area', resolver: getAddressAreaName },
// //   { label: 'Building', keys: ['building', 'building_name', 'building_no'] },
// //   { label: 'Block', keys: ['block', 'block_no'] },
// //   { label: 'Avenue', keys: ['avenue', 'avenue_name'] },
// //   { label: 'Street', keys: ['street', 'street_name'] },
// //   {
// //     label: 'Floor / Apt',
// //     resolver: (a: any) => {
// //       const floor = a?.floor;
// //       const apt = a?.apartment || a?.apt;
// //       if (!floor && !apt) return null;
// //       return [floor, apt].filter(Boolean).join(' ');
// //     },
// //   },
// //   { label: 'Country', resolver: getAddressCountryName },
// //   { label: 'City', keys: ['city'] },
// //   { label: 'Pincode', keys: ['pincode', 'zip', 'postal_code'] },
// //   { label: 'Address Notes', keys: ['address_notes', 'addressNotes', 'delivery_notes', 'notes', 'landmark'] },
// // ];

// // const getAddressFields = (address: any) =>
// //   ADDRESS_FIELD_DEFS
// //     .map(({ label, keys, resolver }) => ({
// //       label,
// //       value: resolver ? resolver(address) : getAddressFieldValue(address, keys || []),
// //     }))
// //     .filter((f) => f.value !== null && f.value !== undefined && f.value !== '');

// // // Short one-line address summary for the card view — area & country included,
// // // resolved the same object-safe way as the modal's full field list.
// // const getAddressSummaryLine = (address: any) => {
// //   if (!address) return null;
// //   const parts = [
// //     address.street,
// //     getAddressAreaName(address),
// //     address.city,
// //     address.pincode,
// //     getAddressCountryName(address),
// //   ].filter(Boolean);
// //   return parts.length ? parts.join(', ') : null;
// // };

// // // ─── Agent-exclusive item helpers ──────────────────────────────────────────────
// // // Agent-exclusive line items (custom_json.product_type === 'AGENT') come back
// // // from the backend under `item.agent_product` instead of `item.product`, since
// // // their `product_id` is null on those order_item rows. Every place that used to
// // // read `item.product?.x` directly needs to resolve through this helper first,
// // // the same way OrderManagement.tsx / KitchenOrder.tsx already do — otherwise
// // // agent-exclusive items render as a blank/generic "Item" here.
// // const getItemCustomJson = (item: any) => item?.custom_json || {};

// // const isAgentExclusiveItem = (item: any) => getItemCustomJson(item)?.product_type === 'AGENT';

// // const getItemProductSource = (item: any) => {
// //   const agentProduct = item?.agent_product ?? {};
// //   const product = item?.product ?? {};
// //   return isAgentExclusiveItem(item) ? agentProduct : product;
// // };

// // const getItemDisplayName = (item: any) => {
// //   const source = getItemProductSource(item);
// //   return (
// //     source?.name ||
// //     item?.product_name ||
// //     item?.name ||
// //     (isAgentExclusiveItem(item) ? 'Agent Product' : 'Item')
// //   );
// // };

// // const getItemDisplayImage = (item: any) => {
// //   const source = getItemProductSource(item);
// //   return source?.image || source?.image_url || source?.imageUrl || item?.image || null;
// // };

// // const getItemDisplayDescription = (item: any) => {
// //   const source = getItemProductSource(item);
// //   return source?.description || null;
// // };

// // // ─── Item customization helpers (flavour / variant / shape / add-ons / notes) ──
// // // Mirrors KitchenOrder.tsx exactly — these read the same custom_json object
// // // off the order item, so per-item customization renders identically for the
// // // delivery agent as it does for kitchen staff.
// // interface ItemCustomJson {
// //   variant?: string;
// //   flavour?: string;
// //   flavor?: string;
// //   shape?: string;
// //   add_ons?: string[];
// //   addons?: string[];
// //   add_on_total?: number;
// //   notes?: string;
// //   product_type?: string;
// // }

// // const getCustomJson = (item: any): ItemCustomJson => item?.custom_json || {};

// // const getFlavour = (item: any) => {
// //   const cj = getCustomJson(item);
// //   return cj.flavour || cj.flavor || item?.flavour || item?.flavor || null;
// // };

// // const getVariant = (item: any) => {
// //   const cj = getCustomJson(item);
// //   return cj.variant || item?.variant || null;
// // };

// // const getShape = (item: any) => {
// //   const cj = getCustomJson(item);
// //   return cj.shape || item?.shape || null;
// // };

// // const getAddOns = (item: any): string[] => {
// //   const cj = getCustomJson(item);
// //   const list = cj.add_ons || cj.addons || item?.add_ons || item?.selected_add_ons || [];
// //   return Array.isArray(list) ? list : [];
// // };

// // const getItemNotes = (item: any) => {
// //   const cj = getCustomJson(item);
// //   return cj.notes || item?.notes || null;
// // };

// // // ─── Order add-ons (whole-order, not per-item) ─────────────────────────────────
// // // Mirrors KitchenOrder.tsx's getKitchenOrderAddons/getKitchenOrderAddonTotal so
// // // the receipt totals line up the same way for both dashboards.
// // const getOrderAddons = (order: any): any[] => {
// //   if (Array.isArray(order?.order_addons)) return order.order_addons;
// //   if (Array.isArray(order?.order_addons_json)) return order.order_addons_json;
// //   return [];
// // };

// // const getOrderAddonTotal = (order: any): number => {
// //   const addons = getOrderAddons(order);
// //   return Number(
// //     order?.order_addons_total ??
// //     addons.reduce((sum: number, addon: any) => sum + Number(addon.total ?? (addon.price * addon.quantity || 0)), 0)
// //   );
// // };

// // // ─── Custom cake helpers ────────────────────────────────────────────────────
// // // THIS is what was missing here: DeliveryOrder never read `custom_cake_json` /
// // // `custom_cake` off the order, so custom-cake orders showed every other
// // // section (customer, address, items, totals) but silently dropped all the
// // // cake customization (image, flavour, shape, message, etc.) that
// // // KitchenOrder.tsx already displays. Ported directly from there.
// // const getCustomCakeDetails = (order: any) => {
// //   const customCake = order?.custom_cake_json ?? order?.custom_cake ?? null;
// //   if (!customCake || typeof customCake !== 'object') return null;
// //   return {
// //     image: customCake?.image || customCake?.image_url || null,
// //     flavour: customCake?.flavour || customCake?.flavor || null,
// //     weight: customCake?.weight || null,
// //     shape: customCake?.shape || null,
// //     size: customCake?.size || null,
// //     colour: customCake?.colour || customCake?.color || null,
// //     message: customCake?.message || null,
// //     notes: customCake?.notes || null,
// //     price: customCake?.price != null ? Number(customCake.price) : null,
// //   };
// // };

// // const isCustomCakeOrder = (order: any) => !!getCustomCakeDetails(order);

// // // ─── Component ────────────────────────────────────────────────────────────────

// // const DeliveryOrder: React.FC = () => {

// //   // ── State ──────────────────────────────────────────────────────────────────

// //   const [activeTab,        setActiveTab]        = useState<TabType>('all');

// //   // Order buckets — one per backend endpoint
// //   const [pendingOrders,      setPendingOrders]      = useState<any[]>([]);  // READY
// //   const [assignedOrders,     setAssignedOrders]     = useState<any[]>([]);  // ASSIGNED_TO_AGENT
// //   const [driverActiveOrders, setDriverActiveOrders] = useState<any[]>([]);  // ASSIGNED_TO_DRIVER | DRIVER_ACCEPTED | OUT_FOR_DELIVERY
// //   const [proofOrders,        setProofOrders]        = useState<any[]>([]);  // DELIVERY_SUBMITTED
// //   const [deliveredOrders,    setDeliveredOrders]    = useState<any[]>([]);  // DELIVERED

// //   const [loading,       setLoading]       = useState(true);
// //   const [refreshing,    setRefreshing]    = useState(false);
// //   const [actionLoading, setActionLoading] = useState<number | null>(null);
// //   const [error,         setError]         = useState<string | null>(null);
// //   const [successMsg,    setSuccessMsg]    = useState<string | null>(null);

// //   // Order detail modal
// //   const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
// //   const [modalOpen,     setModalOpen]     = useState(false);

// //   // Driver assignment modal
// //   const [driverModalOpen,   setDriverModalOpen]   = useState(false);
// //   const [assignTargetOrder, setAssignTargetOrder] = useState<any | null>(null);
// //   const [drivers,           setDrivers]           = useState<any[]>([]);
// //   const [filteredDrivers,   setFilteredDrivers]   = useState<any[]>([]);
// //   const [driverLoading,     setDriverLoading]     = useState(false);
// //   const [assigningDriver,   setAssigningDriver]   = useState<number | null>(null);
// //   const [driverSearch,      setDriverSearch]      = useState('');
// //   const [assignSuccess,     setAssignSuccess]     = useState<string | null>(null);

// //   // Confirm-delivery modal
// //   const [confirmModalOpen,  setConfirmModalOpen]  = useState(false);
// //   const [confirmTarget,     setConfirmTarget]     = useState<any | null>(null);

// //   // Receipt modal — new, mirrors KitchenOrder.tsx's print receipt. Delivery
// //   // agent already has the full order object in hand (no separate order-detail
// //   // endpoint is wired up in this file), so opening the receipt just reuses the
// //   // order object already loaded into one of the buckets above.
// //   const [isReceiptOpen, setIsReceiptOpen] = useState(false);
// //   const [receiptOrder,  setReceiptOrder]  = useState<any | null>(null);

// //   // ── Fetch all buckets concurrently ────────────────────────────────────────



// //   const fetchAll = useCallback(async (silent = false) => {
// //     if (!silent) setLoading(true);
// //     else         setRefreshing(true);
// //     setError(null);
// //     try {
// //       const [pending, assigned, driverActive, proof, delivered] = await Promise.all([
// //         getDeliveryPending().catch(() => []),
// //         getDeliveryAssigned().catch(() => []),
// //         getDeliveryReady().catch(() => []),
// //         getDeliveryProofPending().catch(() => []),
// //         getDeliveryDelivered().catch(() => []),
// //       ]);
// //       setPendingOrders(pending);
// //       setAssignedOrders(assigned);
// //       setDriverActiveOrders(driverActive);
// //       setProofOrders(proof);
// //       setDeliveredOrders(delivered);
// //     } catch (err) {
// //       console.error('Delivery fetch error', err);
// //       setError('Failed to load orders. Please refresh.');
// //     } finally {
// //       setLoading(false);
// //       setRefreshing(false);
// //     }
// //   }, []);

// //   useEffect(() => { fetchAll(); }, [fetchAll]);



// //   // ── Driver search filter ──────────────────────────────────────────────────

// //   useEffect(() => {
// //     if (!driverSearch.trim()) { setFilteredDrivers(drivers); return; }
// //     const q = driverSearch.toLowerCase();
// //     setFilteredDrivers(drivers.filter(d => {
// //       const name  = `${d.first_name || d.name || ''} ${d.last_name || ''}`.toLowerCase();
// //       const phone = (d.phone_no || '').toLowerCase();
// //       return name.includes(q) || phone.includes(q);
// //     }));
// //   }, [driverSearch, drivers]);



// //   // ── Derived data ──────────────────────────────────────────────────────────

// //   const allOrders = useMemo(() =>
// //     // Combine buckets and deduplicate by `id` to avoid rendering duplicate keys
// //     (() => {
// //       const combined = [...pendingOrders, ...assignedOrders, ...driverActiveOrders, ...proofOrders, ...deliveredOrders];
// //       const byId = new Map<number | string, any>();
// //       for (const o of combined) {
// //         const key = o?.id ?? Math.random();
// //         if (!byId.has(key)) {
// //           byId.set(key, o);
// //         } else {
// //           // keep the newest by created_at
// //           const existing = byId.get(key);
// //           try {
// //             const exTime = existing?.created_at ? new Date(existing.created_at).getTime() : 0;
// //             const newTime = o?.created_at ? new Date(o.created_at).getTime() : 0;
// //             if (newTime > exTime) byId.set(key, o);
// //           } catch (e) {
// //             // fallback: overwrite
// //             byId.set(key, o);
// //           }
// //         }
// //       }
// //       return Array.from(byId.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
// //     })(),
// //     [pendingOrders, assignedOrders, driverActiveOrders, proofOrders, deliveredOrders]
// //   );


// //   const getDeliverySchedule = (order: any) => {
// //   const rawDate = order?.expected_delivery_date || order?.delivery_date || order?.deliveryDate || null;
// //   const time = order?.time_slot || order?.delivery_time_slot || order?.deliveryTimeSlot || null;

// //   let isToday = false;
// //   if (rawDate) {
// //     const d = new Date(rawDate);
// //     const now = new Date();
// //     isToday = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
// //   }

// //   return {
// //     dateLabel: rawDate ? fmtDate(rawDate) : null,
// //     time,
// //     isToday,
// //   };
// // };

// //   const visibleOrders = useMemo(() => {
// //     switch (activeTab) {
// //       case 'pending':       return pendingOrders;
// //       case 'assigned':      return assignedOrders;
// //       case 'driver_active': return driverActiveOrders;
// //       case 'proof_pending': return proofOrders;
// //       case 'delivered':     return deliveredOrders;
// //       default:              return allOrders;
// //     }
// //   }, [activeTab, pendingOrders, assignedOrders, driverActiveOrders, proofOrders, deliveredOrders, allOrders]);

// //   // ── Success toast helper ──────────────────────────────────────────────────

// //   const showSuccess = (msg: string) => {
// //     setSuccessMsg(msg);
// //     setTimeout(() => setSuccessMsg(null), 3000);
// //   };

// //   // ── Open driver assignment modal ──────────────────────────────────────────
// //   // Called when delivery agent wants to assign a driver to an ASSIGNED_TO_AGENT order.
// //   // Loads /drivers/available first; falls back to /drivers.

// //   const handleOpenAssign = async (order: any, e?: React.MouseEvent) => {
// //     e?.stopPropagation();
// //     setAssignTargetOrder(order);
// //     setDriverModalOpen(true);
// //     setDriverLoading(true);
// //     setDriverSearch('');
// //     setAssignSuccess(null);
// //     setError(null);
// //     try {
// //       let list: any[] = await getAvailableDrivers().catch(() => []);
// //       if (!list || list.length === 0) {
// //         list = await getDrivers().catch(() => []);
// //       }
// //       setDrivers(list);
// //       setFilteredDrivers(list);
// //     } catch {
// //       setDrivers([]);
// //       setFilteredDrivers([]);
// //     } finally {
// //       setDriverLoading(false);
// //     }
// //   };

// //   // ── Assign driver ─────────────────────────────────────────────────────────
// //   // POST /orders/:id/assign-driver  { driver_id }
// //   // Backend: requires status = ASSIGNED_TO_AGENT or ASSIGNED_TO_DRIVER (re-assign)
// //   // → sets status = ASSIGNED_TO_DRIVER

// //   const handleAssignDriver = async (driver: any) => {
// //     if (!assignTargetOrder || assigningDriver !== null) return;
// //     setAssigningDriver(driver.id);
// //     setError(null);
// //     try {
// //       await assignDriverToOrder(Number(assignTargetOrder.id), Number(driver.id));
// //       const driverName = `${driver.first_name || driver.name || 'Driver'} ${driver.last_name || ''}`.trim();
// //       setAssignSuccess(`Order #${assignTargetOrder.order_number || assignTargetOrder.id} assigned to ${driverName}`);
// //       await fetchAll(true);
// //       setTimeout(() => {
// //         setDriverModalOpen(false);
// //         setAssignTargetOrder(null);
// //         setAssignSuccess(null);
// //       }, 1800);
// //     } catch (err: any) {
// //       setError(err?.response?.data?.error || 'Failed to assign driver. Please try again.');
// //     } finally {
// //       setAssigningDriver(null);
// //     }
// //   };

// //   // ── Confirm delivery ──────────────────────────────────────────────────────
// //   // POST /orders/:id/confirm-delivery
// //   // Backend: requires status = DELIVERY_SUBMITTED (driver sent proof)
// //   // → sets status = DELIVERED

// //   const handleConfirmDelivery = async () => {
// //     if (!confirmTarget) return;
// //     setActionLoading(confirmTarget.id);
// //     setError(null);
// //     try {
// //       await markOrderDelivered(confirmTarget.id);
// //       showSuccess(`Order #${confirmTarget.order_number || confirmTarget.id} confirmed as delivered!`);
// //       setConfirmModalOpen(false);
// //       setConfirmTarget(null);
// //       if (modalOpen && selectedOrder?.id === confirmTarget.id) setModalOpen(false);
// //       await fetchAll(true);
// //     } catch (err: any) {
// //       setError(err?.response?.data?.error || 'Failed to confirm delivery.');
// //     } finally {
// //       setActionLoading(null);
// //     }
// //   };

// //   // ── Open receipt modal ────────────────────────────────────────────────────
// //   // Reuses the order object already loaded in one of the buckets — no extra
// //   // network call, since (unlike KitchenOrder's getKitchenOrderDetails) there's
// //   // no separate "full order" endpoint wired into this file.
// //   const handleOpenReceipt = (order: any, e?: React.MouseEvent) => {
// //     e?.stopPropagation();
// //     setReceiptOrder(order);
// //     setIsReceiptOpen(true);
// //   };

// //   // ── Render action buttons per order status ────────────────────────────────

// //   const renderActionBtn = (order: any, fromModal = false) => {
// //     const status    = (order.status || '').toUpperCase();
// //     const isLoading = actionLoading === order.id;

// //     // ASSIGNED_TO_AGENT → delivery agent picks a driver
// //     if (status === 'ASSIGNED_TO_AGENT') {
// //       return (
// //         <button
// //           className="da-action-primary bg-assign"
// //           disabled={isLoading}
// //           onClick={e => { e.stopPropagation(); handleOpenAssign(order); }}
// //         >
// //           <IconTruck size={13} /> Assign Driver
// //         </button>
// //       );
// //     }

// //     // ASSIGNED_TO_DRIVER → can re-assign (driver hasn't accepted yet)
// //     if (status === 'ASSIGNED_TO_DRIVER') {
// //       return (
// //         <div className={`da-action-group ${fromModal ? 'da-action-group-modal' : ''}`}>
// //           <button
// //             className="da-action-secondary bg-reassign"
// //             disabled={isLoading}
// //             onClick={e => { e.stopPropagation(); handleOpenAssign(order); }}
// //           >
// //             <IconTruck size={13} /> Re-assign
// //           </button>
// //           <span className="da-waiting-chip">Awaiting driver acceptance</span>
// //         </div>
// //       );
// //     }

// //     // DRIVER_ACCEPTED / OUT_FOR_DELIVERY → read-only, driver is en route
// //     if (status === 'DRIVER_ACCEPTED' || status === 'OUT_FOR_DELIVERY') {
// //       return (
// //         <span className="da-info-chip">
// //           <IconTruck size={12} /> Driver en route
// //         </span>
// //       );
// //     }

// //     // DELIVERY_SUBMITTED → delivery agent reviews proof and confirms
// //     if (status === 'DELIVERY_SUBMITTED') {
// //       return (
// //         <button
// //           className="da-action-primary bg-delivered"
// //           disabled={isLoading}
// //           onClick={e => {
// //             e.stopPropagation();
// //             setConfirmTarget(order);
// //             setConfirmModalOpen(true);
// //           }}
// //         >
// //           <IconCheckCircle size={13} />
// //           {isLoading ? 'Confirming…' : 'Confirm Delivered'}
// //         </button>
// //       );
// //     }

// //     // DELIVERED → done
// //     if (status === 'DELIVERED') {
// //       return (
// //         <span className="da-done-badge">
// //           <IconCheckCircle size={12} /> Delivered
// //         </span>
// //       );
// //     }

// //     return null;
// //   };

// //   // ── Tab config ────────────────────────────────────────────────────────────

// //   const tabs: { key: TabType; label: string; count: number; badgeClass: string }[] = [
// //     { key: 'all',          label: 'All Orders',      count: allOrders.length,        badgeClass: 'bg-all'       },
// //     { key: 'pending',      label: 'Ready (Pickup)',  count: pendingOrders.length,     badgeClass: 'bg-pending'   },
// //     { key: 'assigned',     label: 'Agent Assigned',  count: assignedOrders.length,    badgeClass: 'bg-assigned'  },
// //     { key: 'driver_active',label: 'Driver Active',   count: driverActiveOrders.length,badgeClass: 'bg-onway'    },
// //     { key: 'proof_pending',label: 'Proof Submitted', count: proofOrders.length,       badgeClass: 'bg-proof'    },
// //     { key: 'delivered',    label: 'Delivered',       count: deliveredOrders.length,   badgeClass: 'bg-completed' },
// //   ];

// //   // ─── Render ────────────────────────────────────────────────────────────────

// //   return (
// //     <div className="da-container">

// //       {/* Success toast */}
// //       {successMsg && (
// //         <div className="da-toast-success">
// //           <IconCheckCircle size={16} /><span>{successMsg}</span>
// //         </div>
// //       )}

// //       {/* Error banner */}
// //       {error && (
// //         <div className="da-error-banner">
// //           <IconAlert size={16} /><span>{error}</span>
// //           <button onClick={() => setError(null)} className="da-error-dismiss">✕</button>
// //         </div>
// //       )}

// //       {/* Header */}
// //       <div className="da-page-header">
// //         <div className="da-header-text">
// //           <h2>Delivery Agent Dashboard</h2>
// //           <p>Assign drivers to orders, track deliveries, and confirm completions.</p>
// //         </div>
// //         <button
// //           className={`da-refresh-btn ${refreshing ? 'spinning' : ''}`}
// //           onClick={() => fetchAll(true)}
// //           title="Refresh"
// //         >
// //           <IconRefresh size={16} />
// //         </button>
// //       </div>

// //       {/* Stats grid */}
// //       <div className="da-stats-grid">
// //         <div className="da-stat-card" onClick={() => setActiveTab('all')}>
// //           <div className="da-stat-icon icon-all"><IconPackage size={22} /></div>
// //           <div className="da-stat-details"><h3>{allOrders.length}</h3><p>Total Orders</p></div>
// //         </div>
// //         <div className="da-stat-card" onClick={() => setActiveTab('pending')}>
// //           <div className="da-stat-icon icon-pending"><IconClock size={22} /></div>
// //           <div className="da-stat-details"><h3>{pendingOrders.length}</h3><p>Ready for Pickup</p></div>
// //         </div>
// //         <div className="da-stat-card" onClick={() => setActiveTab('assigned')}>
// //           <div className="da-stat-icon icon-assigned"><IconUser size={22} /></div>
// //           <div className="da-stat-details"><h3>{assignedOrders.length}</h3><p>Need Driver</p></div>
// //         </div>
// //         <div className="da-stat-card" onClick={() => setActiveTab('driver_active')}>
// //           <div className="da-stat-icon icon-onway"><IconTruck size={22} /></div>
// //           <div className="da-stat-details"><h3>{driverActiveOrders.length}</h3><p>Driver Active</p></div>
// //         </div>
// //         <div className="da-stat-card" onClick={() => setActiveTab('proof_pending')}>
// //           <div className="da-stat-icon icon-proof"><IconImage size={22} /></div>
// //           <div className="da-stat-details"><h3>{proofOrders.length}</h3><p>Proof Submitted</p></div>
// //         </div>
// //         <div className="da-stat-card" onClick={() => setActiveTab('delivered')}>
// //           <div className="da-stat-icon icon-delivered"><IconCheckCircle size={22} /></div>
// //           <div className="da-stat-details"><h3>{deliveredOrders.length}</h3><p>Delivered</p></div>
// //         </div>
// //       </div>

// //       {/* Tabs */}
// //       <div className="da-tabs-bar">
// //         {tabs.map(t => (
// //           <button
// //             key={t.key}
// //             className={`da-tab-item ${activeTab === t.key ? 'active' : ''}`}
// //             onClick={() => setActiveTab(t.key)}
// //           >
// //             {t.label}
// //             <span className={`da-tab-badge ${t.badgeClass}`}>{t.count}</span>
// //           </button>
// //         ))}
// //       </div>

// //       {/* Orders grid */}
// //       {loading ? (
// //         <div className="da-center-loader">
// //           <div className="da-spinner" /><p>Loading orders…</p>
// //         </div>
// //       ) : visibleOrders.length === 0 ? (
// //         <div className="da-empty-state">
// //           <IconTruck size={48} />
// //           <h3>No Orders Here</h3>
// //           <p>No orders in this category right now.</p>
// //         </div>
// //       ) : (
// //         <div className="da-orders-grid">
// //           {visibleOrders.map(order => {
// //             const status   = (order.status || '').toUpperCase();
// //             const customer = order.customer;
// //             const addr     = order.delivery_address;
// //             const orderIsCustomCake = isCustomCakeOrder(order);
// //             const schedule = getDeliverySchedule(order)
// //             const addressSummary = getAddressSummaryLine(addr);

// //             return (
// //               <div
// //                 key={order.id}
// //                 className={`da-order-card ${schedule.isToday ? 'card-due-today' : ''}`}
// //                 onClick={() => { setSelectedOrder(order); setModalOpen(true); }}
// //               >
// //                 {/* Card top */}
// //                 <div className="da-card-top">
// //                   <div className="da-card-id-block">
// //                     <h4 className="da-order-number">
// //                       #{order.order_number || String(order.id).padStart(5, '0')}
// //                     </h4>
// //                     <span className="da-order-time">
// //                       <IconClock size={11} />
// //                       {fmtDate(order.created_at)} · {fmtTime(order.created_at)}
// //                     </span>
// //                   </div>
// //                   <span className={`da-status-pill ${statusPillClass(status)}`}>
// //                     {statusLabel(status)}
// //                   </span>
// //                 </div>



// //                 {(schedule.dateLabel || schedule.time) && (
// //   <div className={`da-schedule-row ${schedule.isToday ? 'is-today' : ''}`}>
// //     <IconClock size={12} />
// //     <span className="da-schedule-label">Expected:</span>
// //     <span className="da-schedule-value">
// //       {schedule.dateLabel || 'Date TBD'}
// //       {schedule.time && <> · {schedule.time}</>}
// //     </span>
// //     {schedule.isToday && <span className="da-schedule-today-tag">Today</span>}
// //   </div>
// // )}



// //                 {/* Custom cake badge */}
// //                 {orderIsCustomCake && (
// //                   <div
// //                     style={{
// //                       display: 'inline-flex',
// //                       alignItems: 'center',
// //                       gap: 4,
// //                       fontSize: 11,
// //                       fontWeight: 600,
// //                       color: '#b45309',
// //                       background: '#fef3c7',
// //                       border: '1px solid #fde68a',
// //                       borderRadius: 6,
// //                       padding: '2px 8px',
// //                       marginBottom: 6,
// //                       width: 'fit-content',
// //                     }}
// //                   >
// //                     <IconCake size={11} /> Custom Cake Order
// //                   </div>
// //                 )}

// //                 {/* Customer & address (now includes area + country, object-safe) */}
// //                 {(customer || addr) && (
// //                   <div className="da-card-meta">
// //                     {customer && (
// //                       <div className="da-meta-row">
// //                         <IconUser size={12} />
// //                         <span>
// //                           {typeof customer === 'object'
// //                             ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
// //                             : customer}
// //                         </span>
// //                       </div>
// //                     )}
// //                     {addressSummary && (
// //                       <div className="da-meta-row">
// //                         <IconMapPin size={12} />
// //                         <span>{addressSummary}</span>
// //                       </div>
// //                     )}
// //                   </div>
// //                 )}

// //                 {/* Items */}
// //                 <div className="da-card-items">
// //                   {(order.items || []).slice(0, 3).map((item: any, idx: number) => (
// //                     <div key={item.id || idx} className="da-item-line">
// //                       <span className="da-item-qty">×{item.quantity}</span>
// //                       <span className="da-item-name">{getItemDisplayName(item)}</span>
// //                     </div>
// //                   ))}
// //                   {(order.items || []).length > 3 && (
// //                     <span className="da-item-more">+{order.items.length - 3} more</span>
// //                   )}
// //                 </div>

// //                 {/* Driver tag if assigned */}
// //                 {order.driver && (
// //                   <div className="da-driver-tag">
// //                     <IconTruck size={11} />
// //                     <span>
// //                       {`${order.driver.first_name || ''} ${order.driver.last_name || ''}`.trim() || 'Driver assigned'}
// //                     </span>
// //                   </div>
// //                 )}

// //                 {/* Proof submitted indicator */}
// //                 {status === 'DELIVERY_SUBMITTED' && (
// //                   <div className="da-proof-tag">
// //                     <IconImage size={11} />
// //                     <span>Driver submitted delivery proof</span>
// //                   </div>
// //                 )}

// //                 {/* Total */}
// //                 {(order.grand_total || order.total) && (
// //                   <div className="da-card-total">
// //                     <span>Total</span>
// //                     <strong>{fmtCurrency(order.grand_total || order.total || 0, order.currency)}</strong>
// //                   </div>
// //                 )}

// //                 {/* Action footer */}
// //                 <div className="da-card-footer">
// //                   <button
// //                     className="da-view-btn"
// //                     onClick={e => { e.stopPropagation(); setSelectedOrder(order); setModalOpen(true); }}
// //                   >
// //                     <IconEye size={13} /> View
// //                   </button>
// //                   <button
// //                     className="da-view-btn"
// //                     onClick={e => handleOpenReceipt(order, e)}
// //                   >
// //                     <IconPrinter size={13} /> Receipt
// //                   </button>
// //                   {renderActionBtn(order)}
// //                 </div>
// //               </div>
// //             );
// //           })}
// //         </div>
// //       )}

// //       {/* ─── Order Detail Modal ─────────────────────────────────────────── */}
// //       {modalOpen && selectedOrder && (
// //         <div className="da-modal-backdrop" onClick={() => setModalOpen(false)}>
// //           <div className="da-modal-card" onClick={e => e.stopPropagation()}>
// //             <div className="da-modal-header">
// //               <h3>Order Details</h3>
// //               <button className="da-modal-close" onClick={() => setModalOpen(false)}>
// //                 <IconX size={16} />
// //               </button>
// //             </div>
// //             <div className="da-modal-body">

// //               {/* Status row */}
// //               <div className="da-modal-meta">
// //                 <div>
// //                   <p className="da-modal-order-num">
// //                     #{selectedOrder.order_number || selectedOrder.id}
// //                   </p>
// //                   <p className="da-modal-order-type">
// //                     {selectedOrder.order_type || 'DELIVERY'} · {fmtDate(selectedOrder.created_at)}
// //                   </p>
// //                 </div>
// //                 <span className={`da-status-pill ${statusPillClass(selectedOrder.status)}`}>
// //                   {statusLabel(selectedOrder.status)}
// //                 </span>
// //               </div>

// //               {/* Custom cake badge in modal */}
// //               {isCustomCakeOrder(selectedOrder) && (
// //                 <div
// //                   style={{
// //                     display: 'inline-flex',
// //                     alignItems: 'center',
// //                     gap: 4,
// //                     fontSize: 12,
// //                     fontWeight: 600,
// //                     color: '#b45309',
// //                     background: '#fef3c7',
// //                     border: '1px solid #fde68a',
// //                     borderRadius: 6,
// //                     padding: '3px 10px',
// //                     margin: '10px 0',
// //                     width: 'fit-content',
// //                   }}
// //                 >
// //                   <IconCake size={12} /> Custom Cake Order
// //                 </div>
// //               )}

// //               {/* Order Origin (placed by / source) */}
// //               {(selectedOrder.placed_by || selectedOrder.source || selectedOrder.order_origin || selectedOrder.placed_by_role || selectedOrder.placed_by_email) && (
// //                 <div className="da-modal-section">
// //                   <h5 className="da-modal-section-title">Order Origin</h5>
// //                   <div className="da-modal-info-grid">
// //                     {selectedOrder.placed_by && (
// //                       <div className="da-info-row">
// //                         <IconUser size={13} />
// //                                             <span>{renderValue(selectedOrder.placed_by)}</span>
// //                       </div>
// //                     )}
// //                     {selectedOrder.placed_by_role && (
// //                       <div className="da-info-row">
// //                         <span className="da-origin-role">{selectedOrder.placed_by_role}</span>
// //                       </div>
// //                     )}
// //                     {selectedOrder.placed_by_email && (
// //                       <div className="da-info-row">
// //                         <span>{selectedOrder.placed_by_email}</span>
// //                       </div>
// //                     )}
// //                     {selectedOrder.source && (
// //                       <div className="da-info-row">
// //                         <span>Source: {selectedOrder.source}</span>
// //                       </div>
// //                     )}
// //                   </div>
// //                 </div>
// //               )}

// //               {/* Delivery schedule (expected date / time slot / area) */}
// //               {(selectedOrder.expected_delivery_date || selectedOrder.time_slot || selectedOrder.delivery_area || selectedOrder.area) && (
// //                 <div className="da-modal-section">
// //                   <h5 className="da-modal-section-title">Delivery Schedule</h5>
// //                   <div className="da-modal-info-grid">
// //                     {selectedOrder.expected_delivery_date && (
// //                       <div className="da-info-row">
// //                         <IconClock size={13} />
// //                         <span>{fmtDate(selectedOrder.expected_delivery_date)}</span>
// //                       </div>
// //                     )}
// //                     {selectedOrder.time_slot && (
// //                       <div className="da-info-row">
// //                         <IconClock size={13} />
// //                         <span>{selectedOrder.time_slot}</span>
// //                       </div>
// //                     )}
// //                     {(selectedOrder.delivery_area || selectedOrder.area) && (
// //                       <div className="da-info-row">
// //                         <IconMapPin size={13} />
// //                                             <span>{renderValue(selectedOrder.delivery_area || selectedOrder.area)}</span>
// //                       </div>
// //                     )}
// //                   </div>
// //                 </div>
// //               )}

// //               {/* Payment */}
// //               {selectedOrder.payment_method && (
// //                 <div className="da-modal-section">
// //                   <h5 className="da-modal-section-title">Payment</h5>
// //                   <div className="da-info-row">
// //                     <span>{selectedOrder.payment_method}</span>
// //                     {selectedOrder.payment_status && (
// //                       <span className={`da-payment-chip chip-${(selectedOrder.payment_status || '').toLowerCase()}`}>
// //                         {selectedOrder.payment_status}
// //                       </span>
// //                     )}
// //                     {selectedOrder.currency && (
// //                       <span className="da-currency-label">{selectedOrder.currency}</span>
// //                     )}
// //                   </div>
// //                 </div>
// //               )}

// //               {/* Customer */}
// //               {selectedOrder.customer && (
// //                 <div className="da-modal-section">
// //                   <h5 className="da-modal-section-title">Customer</h5>
// //                   <div className="da-modal-info-grid">
// //                     <div className="da-info-row">
// //                       <IconUser size={13} />
// //                       <span>
// //                         {selectedOrder.customer.first_name} {selectedOrder.customer.last_name}
// //                       </span>
// //                     </div>
// //                     {selectedOrder.customer.phone_no && (
// //                       <div className="da-info-row">
// //                         <IconPhone size={13} />
// //                         <span>{selectedOrder.customer.phone_no}</span>
// //                       </div>
// //                     )}
// //                     {selectedOrder.customer.email && (
// //                       <div className="da-info-row">
// //                         <span className="da-customer-email">{selectedOrder.customer.email}</span>
// //                       </div>
// //                     )}
// //                   </div>
// //                 </div>
// //               )}

// //               {/* Customer & Delivery Address — full field grid (Area/Country
// //                   now included, both object-safe via getAddressFields). */}
// //               {selectedOrder.customer && (
// //                 <div className="da-modal-section">
// //                   <h5 className="da-modal-section-title">Customer & Address</h5>
// //                   <div className="da-modal-info-grid">
// //                     <div className="da-info-row">
// //                       <IconUser size={13} />
// //                       <span>{renderValue(selectedOrder.customer.first_name || selectedOrder.customer.name || (selectedOrder.customer.first_name && selectedOrder.customer.last_name ? `${selectedOrder.customer.first_name} ${selectedOrder.customer.last_name}` : ''))}</span>
// //                     </div>
// //                     {selectedOrder.customer.phone_no && (
// //                       <div className="da-info-row">
// //                         <IconPhone size={13} />
// //                         <span>{renderValue(selectedOrder.customer.phone_no)}</span>
// //                       </div>
// //                     )}
// //                     {selectedOrder.customer.email && (
// //                       <div className="da-info-row">
// //                         <span className="da-customer-email">{renderValue(selectedOrder.customer.email)}</span>
// //                       </div>
// //                     )}

// //                     {selectedOrder.delivery_address && (
// //                       <div className="da-address-box">
// //                         <strong className="da-address-label">Address</strong>
// //                         <div
// //                           style={{
// //                             display: 'grid',
// //                             gridTemplateColumns: '1fr 1fr',
// //                             gap: '10px 18px',
// //                             marginTop: 8,
// //                           }}
// //                         >
// //                           {getAddressFields(selectedOrder.delivery_address).map((f) => (
// //                             <div key={f.label}>
// //                               <span
// //                                 style={{
// //                                   display: 'block',
// //                                   fontSize: 10.5,
// //                                   fontWeight: 700,
// //                                   color: '#94a3b8',
// //                                   textTransform: 'uppercase',
// //                                   letterSpacing: '0.5px',
// //                                   marginBottom: 2,
// //                                 }}
// //                               >
// //                                 {f.label}
// //                               </span>
// //                               <span style={{ fontSize: 13, color: '#1e293b', fontWeight: 500 }}>
// //                                 {renderValue(f.value)}
// //                               </span>
// //                             </div>
// //                           ))}
// //                         </div>
// //                       </div>
// //                     )}

// //                   </div>
// //                 </div>
// //               )}


// //               {/* Assigned driver */}
// //               {selectedOrder.driver && (
// //                 <div className="da-modal-section">
// //                   <h5 className="da-modal-section-title">Assigned Driver</h5>
// //                   <div className="da-modal-driver-tag">
// //                     <IconTruck size={14} />
// //                     <span>
// //                       {`${selectedOrder.driver.first_name || ''} ${selectedOrder.driver.last_name || ''}`.trim()}
// //                     </span>
// //                     {selectedOrder.driver.phone_no && (
// //                       <span className="da-driver-phone-modal">· {selectedOrder.driver.phone_no}</span>
// //                     )}
// //                   </div>
// //                 </div>
// //               )}

// //               {/* Delivery proof (shown when driver submitted) */}
// //               {(selectedOrder.status === 'DELIVERY_SUBMITTED' || selectedOrder.delivery_photo) && (
// //                 <div className="da-modal-section da-proof-section">
// //                   <h5 className="da-modal-section-title">Delivery Proof from Driver</h5>
// //                   {selectedOrder.delivery_photo && (
// //                     <a
// //                       href={selectedOrder.delivery_photo}
// //                       target="_blank"
// //                       rel="noopener noreferrer"
// //                       className="da-proof-photo-link"
// //                     >
// //                       <IconImage size={14} /> View Photo ↗
// //                     </a>
// //                   )}
// //                   {selectedOrder.delivery_notes && (
// //                     <p className="da-proof-notes">
// //                       <strong>Driver note:</strong> {selectedOrder.delivery_notes}
// //                     </p>
// //                   )}
// //                   {selectedOrder.customer_confirmation_name && (
// //                     <p className="da-proof-notes">
// //                       <strong>Received by:</strong> {selectedOrder.customer_confirmation_name}
// //                       {selectedOrder.customer_confirmation_phone
// //                         ? ` · ${selectedOrder.customer_confirmation_phone}`
// //                         : ''}
// //                     </p>
// //                   )}
// //                   {selectedOrder.driver_submitted_at && (
// //                     <p className="da-proof-notes">
// //                       <strong>Submitted:</strong>{' '}
// //                       {new Date(selectedOrder.driver_submitted_at).toLocaleString()}
// //                     </p>
// //                   )}
// //                 </div>
// //               )}

// //               {/* Items */}
// //               <div className="da-modal-section">
// //                 <h5 className="da-modal-section-title">Order Items</h5>
// //                 <div className="da-modal-items">
// //                   {(selectedOrder.items || []).map((item: any, idx: number) => {
// //                     const displayName = getItemDisplayName(item);
// //                     const displayImage = getItemDisplayImage(item);
// //                     const displayDescription = getItemDisplayDescription(item);
// //                     const flavour = getFlavour(item);
// //                     const variant = getVariant(item);
// //                     const shape = getShape(item);
// //                     const addOns = getAddOns(item);
// //                     const itemNotes = getItemNotes(item);

// //                     return (
// //                       <div key={item.id || idx} className="da-modal-item-row">
// //                         <div className="da-modal-item-left">
// //                           <span className="da-modal-qty">×{item.quantity}</span>
// //                           <div className="da-modal-item-with-thumb">
// //                             {displayImage && (
// //                               <div className="da-item-thumb">
// //                                 <img
// //                                   src={displayImage}
// //                                   alt={displayName}
// //                                   onError={(e: any) => { e.target.style.display = 'none'; }}
// //                                 />
// //                               </div>
// //                             )}
// //                             <div>
// //                               <p className="da-modal-item-name">{displayName}</p>
// //                               {displayDescription && (
// //                                 <p className="da-modal-item-desc">{displayDescription}</p>
// //                               )}

// //                               {/* Customization chips — flavour / variant / shape */}
// //                               {(flavour || variant || shape) && (
// //                                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
// //                                   {flavour && (
// //                                     <span style={{ fontSize: 11, background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 5, padding: '1px 7px' }}>
// //                                       Flavour: <strong>{flavour}</strong>
// //                                     </span>
// //                                   )}
// //                                   {variant && (
// //                                     <span style={{ fontSize: 11, background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 5, padding: '1px 7px' }}>
// //                                       Variant: <strong>{variant}</strong>
// //                                     </span>
// //                                   )}
// //                                   {shape && (
// //                                     <span style={{ fontSize: 11, background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 5, padding: '1px 7px' }}>
// //                                       Shape: <strong>{shape}</strong>
// //                                     </span>
// //                                   )}
// //                                 </div>
// //                               )}

// //                               {/* Add-ons */}
// //                               {addOns.length > 0 && (
// //                                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
// //                                   {addOns.map((addOn, i) => (
// //                                     <span key={i} style={{ fontSize: 11, background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 5, padding: '1px 7px' }}>
// //                                       {addOn}
// //                                     </span>
// //                                   ))}
// //                                 </div>
// //                               )}

// //                               {/* Special instructions */}
// //                               {itemNotes && (
// //                                 <p style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
// //                                   <strong>Instruction:</strong> "{itemNotes}"
// //                                 </p>
// //                               )}
// //                             </div>
// //                           </div>
// //                         </div>
// //                         <span className="da-modal-item-price">
// //                           {fmtCurrency(item.line_total || (item.price * item.quantity) || 0, selectedOrder?.currency)}
// //                         </span>
// //                       </div>
// //                     );
// //                   })}
// //                 </div>
// //               </div>

// //               {/* Order-level add-ons (whole order, not per item) */}
// //               {getOrderAddons(selectedOrder).length > 0 && (
// //                 <div className="da-modal-section">
// //                   <h5 className="da-modal-section-title">Order Add-ons</h5>
// //                   <div className="da-modal-items">
// //                     {getOrderAddons(selectedOrder).map((addon: any, idx: number) => (
// //                       <div key={`addon-${idx}`} className="da-modal-item-row">
// //                         <div className="da-modal-item-left">
// //                           <span className="da-modal-qty">×{addon.quantity ?? 1}</span>
// //                           <p className="da-modal-item-name">
// //                             {addon.addon_name || addon.addonName || addon.name || `Addon #${addon.addon_id ?? addon.addonId ?? idx + 1}`}
// //                           </p>
// //                         </div>
// //                         <span className="da-modal-item-price">
// //                           {fmtCurrency(addon.total ?? (addon.price * addon.quantity), selectedOrder.currency)}
// //                         </span>
// //                       </div>
// //                     ))}
// //                   </div>
// //                 </div>
// //               )}

// //               {/* Custom Cake Details — previously not fetched/rendered at all here */}
// //               {(() => {
// //                 const customCake = getCustomCakeDetails(selectedOrder);
// //                 if (!customCake) return null;
// //                 return (
// //                   <div className="da-modal-section" style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: 12 }}>
// //                     <h5 className="da-modal-section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
// //                       <IconCake size={14} /> Custom Cake Details
// //                     </h5>
// //                     <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 6 }}>
// //                       {customCake.image && (
// //                         <img
// //                           src={customCake.image}
// //                           alt="Custom cake reference"
// //                           style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 8, border: '1px solid #fde68a' }}
// //                           onError={(e: any) => { e.target.style.display = 'none'; }}
// //                         />
// //                       )}
// //                       <div className="da-modal-info-grid" style={{ flex: 1, minWidth: 200 }}>
// //                         <div className="da-info-row"><span>Flavour: <strong>{customCake.flavour ?? '—'}</strong></span></div>
// //                         <div className="da-info-row"><span>Weight: <strong>{customCake.weight ?? '—'}</strong></span></div>
// //                         <div className="da-info-row"><span>Shape: <strong>{customCake.shape ?? '—'}</strong></span></div>
// //                         <div className="da-info-row"><span>Size: <strong>{customCake.size ?? '—'}</strong></span></div>
// //                         <div className="da-info-row"><span>Colour: <strong>{customCake.colour ?? '—'}</strong></span></div>
// //                         <div className="da-info-row"><span>Est. price: <strong>{customCake.price != null ? fmtCurrency(customCake.price, selectedOrder.currency) : '—'}</strong></span></div>
// //                       </div>
// //                     </div>
// //                     {customCake.message && (
// //                       <p style={{ fontSize: 12, marginTop: 8 }}>
// //                         <strong>Cake message:</strong> "{customCake.message}"
// //                       </p>
// //                     )}
// //                     {customCake.notes && (
// //                       <p style={{ fontSize: 12, marginTop: 4 }}>
// //                         <strong>Customization notes:</strong> {customCake.notes}
// //                       </p>
// //                     )}
// //                   </div>
// //                 );
// //               })()}

// //               {/* Delivery notes from order */}
// //               {selectedOrder.delivery_notes && selectedOrder.status !== 'DELIVERY_SUBMITTED' && (
// //                 <div className="da-modal-notes">
// //                   <h5 className="da-modal-section-title">Delivery Notes</h5>
// //                   <p className="da-modal-notes-text">"{selectedOrder.delivery_notes}"</p>
// //                 </div>
// //               )}

// //               {/* Totals */}
// //               <div className="da-modal-totals">
// //                 <div className="da-total-row">
// //                   <span>Subtotal</span><span>{fmtCurrency(selectedOrder.subtotal, selectedOrder.currency)}</span>
// //                 </div>
// //                 {getOrderAddonTotal(selectedOrder) > 0 && (
// //                   <div className="da-total-row">
// //                     <span>Add-ons</span><span>{fmtCurrency(getOrderAddonTotal(selectedOrder), selectedOrder.currency)}</span>
// //                   </div>
// //                 )}
// //                 <div className="da-total-row">
// //                   <span>Delivery</span><span>{fmtCurrency(selectedOrder.delivery_charge, selectedOrder.currency)}</span>
// //                 </div>
// //                 {selectedOrder.discount > 0 && (
// //                   <div className="da-total-row da-total-discount">
// //                     <span>Discount</span><span>−{fmtCurrency(selectedOrder.discount, selectedOrder.currency)}</span>
// //                   </div>
// //                 )}
// //                 <div className="da-total-row da-total-grand">
// //                   <span>Total</span>
// //                   <strong>{fmtCurrency(selectedOrder.grand_total || selectedOrder.total || 0, selectedOrder.currency)}</strong>
// //                 </div>
// //               </div>
// //             </div>

// //             <div className="da-modal-footer">
// //               <button className="da-modal-print" onClick={() => handleOpenReceipt(selectedOrder)}>
// //                 <IconPrinter size={13} style={{ marginRight: 5 }} /> Print Receipt
// //               </button>
// //               <button className="da-modal-cancel" onClick={() => setModalOpen(false)}>Close</button>
// //               {renderActionBtn(selectedOrder, true)}
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {/* ─── Driver Assignment Modal ────────────────────────────────────── */}
// //       {driverModalOpen && (
// //         <div className="da-modal-backdrop" onClick={() => { setDriverModalOpen(false); setAssignSuccess(null); }}>
// //           <div className="da-modal-card da-driver-modal" onClick={e => e.stopPropagation()}>
// //             <div className="da-modal-header">
// //               <div>
// //                 <h3>Assign Driver</h3>
// //                 {assignTargetOrder && (
// //                   <p className="da-modal-sub">
// //                     Order #{assignTargetOrder.order_number || assignTargetOrder.id}
// //                     {assignTargetOrder.customer && (
// //                       <span>
// //                         {' · '}{assignTargetOrder.customer.first_name} {assignTargetOrder.customer.last_name}
// //                       </span>
// //                     )}
// //                   </p>
// //                 )}
// //               </div>
// //               <button
// //                 className="da-modal-close"
// //                 onClick={() => { setDriverModalOpen(false); setAssignSuccess(null); }}
// //               >
// //                 <IconX size={16} />
// //               </button>
// //             </div>

// //             <div className="da-modal-body">
// //               {/* Success banner */}
// //               {assignSuccess && (
// //                 <div className="da-assign-success">
// //                   <IconCheckCircle size={18} /><span>{assignSuccess}</span>
// //                 </div>
// //               )}

// //               {driverLoading ? (
// //                 <div className="da-center-loader" style={{ minHeight: 180 }}>
// //                   <div className="da-spinner" /><p>Loading available drivers…</p>
// //                 </div>
// //               ) : drivers.length === 0 ? (
// //                 <div className="da-empty-state" style={{ padding: '40px 20px' }}>
// //                   <IconUser size={40} />
// //                   <h3>No Drivers Found</h3>
// //                   <p>No drivers are registered yet, or all are currently on deliveries.</p>
// //                 </div>
// //               ) : (
// //                 <>
// //                   {/* Search */}
// //                   <div className="da-driver-search">
// //                     <IconSearch size={15} />
// //                     <input
// //                       type="text"
// //                       placeholder="Search by name or phone…"
// //                       value={driverSearch}
// //                       onChange={e => setDriverSearch(e.target.value)}
// //                     />
// //                   </div>

// //                   {/* Legend */}
// //                   <div className="da-driver-list-header">
// //                     <p className="da-driver-list-hint">
// //                       {filteredDrivers.length} driver{filteredDrivers.length !== 1 ? 's' : ''}
// //                       {driverSearch ? ' found' : ''} — tap to assign
// //                     </p>
// //                     <div className="da-driver-legend">
// //                       <span className="da-legend-dot ds-available" /> Available
// //                       <span className="da-legend-dot ds-busy" /> Busy
// //                       <span className="da-legend-dot ds-offline" /> Offline
// //                     </div>
// //                   </div>

// //                   <div className="da-driver-list">
// //                     {filteredDrivers.length === 0 ? (
// //                       <div className="da-driver-no-results">
// //                         <p>No drivers match "{driverSearch}"</p>
// //                       </div>
// //                     ) : (
// //                       filteredDrivers.map(driver => {
// //                         // availability_status is the field added in fixed User model
// //                         const rawStatus   = driver.availability_status || driver.status || 'OFFLINE';
// //                         const dStatus     = rawStatus.toUpperCase();
// //                         const isAssigning = assigningDriver === driver.id;
// //                         const isDisabled  = assigningDriver !== null && !isAssigning;

// //                         return (
// //                           <div
// //                             key={driver.id}
// //                             className={[
// //                               'da-driver-card',
// //                               dStatus === 'ONLINE' || dStatus === 'AVAILABLE' ? 'da-driver-available' : '',
// //                               isAssigning ? 'da-driver-assigning' : '',
// //                               isDisabled  ? 'da-driver-disabled'  : '',
// //                             ].join(' ')}
// //                             onClick={() => !isAssigning && !isDisabled && handleAssignDriver(driver)}
// //                           >
// //                             <div className="da-driver-avatar">
// //                               {(driver.first_name || driver.name || 'D').charAt(0).toUpperCase()}
// //                             </div>
// //                             <div className="da-driver-info">
// //                               <p className="da-driver-name">
// //                                 {driver.first_name || driver.name || 'Driver'}
// //                                 {driver.last_name ? ` ${driver.last_name}` : ''}
// //                               </p>
// //                               <div className="da-driver-meta">
// //                                 {driver.phone_no && (
// //                                   <span className="da-driver-phone">
// //                                     <IconPhone size={11} />{driver.phone_no}
// //                                   </span>
// //                                 )}
// //                                 {driver.rating > 0 && (
// //                                   <span className="da-driver-rating">
// //                                     <IconStar size={11} />{Number(driver.rating).toFixed(1)}
// //                                   </span>
// //                                 )}
// //                               </div>
// //                             </div>
// //                             <div className="da-driver-right">
// //                               <span className={`da-driver-status ${driverStatusClass(dStatus)}`}>
// //                                 {driverStatusLabel(dStatus)}
// //                               </span>
// //                               {isAssigning ? (
// //                                 <div className="da-spinner da-spinner-sm" />
// //                               ) : (
// //                                 <button
// //                                   className="da-assign-btn"
// //                                   disabled={isDisabled}
// //                                   onClick={e => { e.stopPropagation(); handleAssignDriver(driver); }}
// //                                 >
// //                                   Assign
// //                                 </button>
// //                               )}
// //                             </div>
// //                           </div>
// //                         );
// //                       })
// //                     )}
// //                   </div>
// //                 </>
// //               )}
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {/* ─── Confirm Delivery Modal ─────────────────────────────────────── */}
// //       {/* Shown when driver has submitted proof (DELIVERY_SUBMITTED).
// //           Delivery agent reviews the proof and clicks Confirm to set DELIVERED. */}
// //       {confirmModalOpen && confirmTarget && (
// //         <div className="da-modal-backdrop" onClick={() => setConfirmModalOpen(false)}>
// //           <div className="da-modal-card da-confirm-modal" onClick={e => e.stopPropagation()}>
// //             <div className="da-modal-header">
// //               <div>
// //                 <h3>Confirm Delivery</h3>
// //                 <p className="da-modal-sub">
// //                   Order #{confirmTarget.order_number || confirmTarget.id}
// //                 </p>
// //               </div>
// //               <button className="da-modal-close" onClick={() => setConfirmModalOpen(false)}>
// //                 <IconX size={16} />
// //               </button>
// //             </div>
// //             <div className="da-modal-body">
// //               <div className="da-confirm-desc">
// //                 <p>
// //                   Driver <strong>
// //                     {confirmTarget.driver
// //                       ? `${confirmTarget.driver.first_name || ''} ${confirmTarget.driver.last_name || ''}`.trim()
// //                       : 'your driver'}
// //                   </strong> has submitted delivery proof for this order.
// //                 </p>
// //                 <p>Review the proof below and confirm to mark it as <strong>DELIVERED</strong>.</p>
// //               </div>

// //               {/* Show proof details in confirm modal too */}
// //               {confirmTarget.delivery_photo && (
// //                 <a
// //                   href={confirmTarget.delivery_photo}
// //                   target="_blank"
// //                   rel="noopener noreferrer"
// //                   className="da-proof-photo-link"
// //                 >
// //                   <IconImage size={14} /> View delivery photo ↗
// //                 </a>
// //               )}
// //               {confirmTarget.delivery_notes && (
// //                 <p className="da-proof-notes">
// //                   <strong>Driver note:</strong> {confirmTarget.delivery_notes}
// //                 </p>
// //               )}
// //               {confirmTarget.customer_confirmation_name && (
// //                 <p className="da-proof-notes">
// //                   <strong>Received by:</strong> {confirmTarget.customer_confirmation_name}
// //                 </p>
// //               )}
// //               {!confirmTarget.delivery_photo && !confirmTarget.delivery_notes && (
// //                 <p className="da-proof-notes da-proof-none">No photo or notes submitted by driver.</p>
// //               )}
// //             </div>
// //             <div className="da-modal-footer">
// //               <button
// //                 className="da-modal-cancel"
// //                 disabled={actionLoading === confirmTarget.id}
// //                 onClick={() => setConfirmModalOpen(false)}
// //               >
// //                 Cancel
// //               </button>
// //               <button
// //                 className="da-action-primary bg-delivered"
// //                 disabled={actionLoading === confirmTarget.id}
// //                 onClick={handleConfirmDelivery}
// //               >
// //                 <IconCheckCircle size={14} />
// //                 {actionLoading === confirmTarget.id ? 'Confirming…' : 'Confirm Delivered'}
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {/* ─── Receipt Modal (new) ────────────────────────────────────────── */}
// //       {/* Thermal-style printable receipt, mirroring KitchenOrder.tsx's
// //           receipt modal. Fully inline-styled so it doesn't depend on any
// //           da-receipt-* classes that may not exist in DeliveryOrder.css. */}
// //       {isReceiptOpen && receiptOrder && (() => {
// //         const order = receiptOrder;
// //         const itemSubtotal = Number(
// //           order.subtotal ??
// //           (order.items || []).reduce((s: number, it: any) => s + Number(it.line_total ?? (it.price * it.quantity || 0)), 0)
// //         );
// //         const addonsTotal = getOrderAddonTotal(order);
// //         const discount = Number(order.discount || 0);
// //         const deliveryCharge = Number(order.delivery_charge ?? order.deliveryCharge ?? 0);
// //         const grandTotal = Number(order.grand_total || order.total || (itemSubtotal + addonsTotal - discount + deliveryCharge));
// //         const addressSummary = getAddressSummaryLine(order.delivery_address);

// //         return (
// //           <div className="da-modal-backdrop" onClick={() => setIsReceiptOpen(false)}>
// //             <div
// //               className="da-modal-card"
// //               onClick={e => e.stopPropagation()}
// //               style={{ maxWidth: 380 }}
// //             >
// //               <div className="da-modal-header">
// //                 <h3>Print Receipt</h3>
// //                 <button className="da-modal-close" onClick={() => setIsReceiptOpen(false)}>
// //                   <IconX size={16} />
// //                 </button>
// //               </div>

// //               <div
// //                 style={{
// //                   padding: '18px 22px',
// //                   fontFamily: "'Courier New', Courier, monospace",
// //                   fontSize: 12.5,
// //                   color: '#1e293b',
// //                 }}
// //               >
// //                 <div style={{ textAlign: 'center', marginBottom: 8 }}>
// //                   <h2 style={{ margin: 0, fontSize: 16, letterSpacing: 1 }}>ORDER RECEIPT</h2>
// //                   <p style={{ margin: '4px 0' }}>- - - - - - - - - - - - - - - - - - -</p>
// //                 </div>

// //                 <p style={{ margin: '3px 0' }}><strong>Order No:</strong> {order.order_number ?? order.id}</p>
// //                 <p style={{ margin: '3px 0' }}><strong>Date:</strong> {fmtDateFull(order.created_at)}</p>
// //                 <p style={{ margin: '3px 0' }}><strong>Time:</strong> {order.created_at ? new Date(order.created_at).toLocaleTimeString() : '—'}</p>
// //                 {order.customer && (
// //                   <p style={{ margin: '3px 0' }}>
// //                     <strong>Customer:</strong> {order.customer.first_name} {order.customer.last_name}
// //                   </p>
// //                 )}
// //                 {order.customer?.phone_no && (
// //                   <p style={{ margin: '3px 0' }}><strong>Phone:</strong> {order.customer.phone_no}</p>
// //                 )}
// //                 {addressSummary && (
// //                   <p style={{ margin: '3px 0' }}><strong>Address:</strong> {addressSummary}</p>
// //                 )}
// //                 {order.driver && (
// //                   <p style={{ margin: '3px 0' }}>
// //                     <strong>Driver:</strong> {`${order.driver.first_name || ''} ${order.driver.last_name || ''}`.trim()}
// //                   </p>
// //                 )}
// //                 <p style={{ margin: '3px 0' }}><strong>Payment:</strong> {order.payment_method || '—'} {order.payment_status ? `(${order.payment_status})` : ''}</p>
// //                 <p style={{ margin: '8px 0' }}>- - - - - - - - - - - - - - - - - - -</p>

// //                 {(order.items || []).map((item: any, idx: number) => (
// //                   <div key={item.id || idx} style={{ marginBottom: 5 }}>
// //                     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
// //                       <span>{item.quantity} × {getItemDisplayName(item)}</span>
// //                       <span>{fmtCurrency(item.line_total ?? (item.price * item.quantity), order.currency)}</span>
// //                     </div>
// //                     {getAddOns(item).length > 0 && (
// //                       <div style={{ fontSize: 11, color: '#64748b', paddingLeft: 10 }}>
// //                         Add-ons: {getAddOns(item).join(', ')}
// //                       </div>
// //                     )}
// //                   </div>
// //                 ))}

// //                 {getOrderAddons(order).length > 0 && (
// //                   <>
// //                     <p style={{ margin: '6px 0' }}>-----------------------------------------</p>
// //                     {getOrderAddons(order).map((addon: any, idx: number) => (
// //                       <div key={`ra-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
// //                         <span>{addon.quantity ?? 1} × {addon.addon_name || addon.addonName || `Addon #${addon.addon_id ?? addon.addonId ?? idx + 1}`}</span>
// //                         <span>{fmtCurrency(addon.total ?? (addon.price * addon.quantity), order.currency)}</span>
// //                       </div>
// //                     ))}
// //                   </>
// //                 )}

// //                 <p style={{ margin: '8px 0' }}>-----------------------------------------</p>

// //                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
// //                   <span>Subtotal:</span><span>{fmtCurrency(itemSubtotal, order.currency)}</span>
// //                 </div>
// //                 {addonsTotal > 0 && (
// //                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
// //                     <span>Add-ons:</span><span>{fmtCurrency(addonsTotal, order.currency)}</span>
// //                   </div>
// //                 )}
// //                 {discount > 0 && (
// //                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
// //                     <span>Discount:</span><span>-{fmtCurrency(discount, order.currency)}</span>
// //                   </div>
// //                 )}
// //                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
// //                   <span>Delivery:</span><span>{fmtCurrency(deliveryCharge, order.currency)}</span>
// //                 </div>
// //                 <p style={{ margin: '8px 0' }}>-----------------------------------------</p>
// //                 <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 14 }}>
// //                   <span>GRAND TOTAL:</span><span>{fmtCurrency(grandTotal, order.currency)}</span>
// //                 </div>
// //                 <p style={{ margin: '10px 0 0' }}>-----------------------------------------</p>

// //                 <div style={{ textAlign: 'center', marginTop: 10, color: '#64748b' }}>
// //                   <p style={{ margin: '2px 0' }}>Thank you for dining with CakeNTake!</p>
// //                   <p style={{ margin: '2px 0' }}>Baked fresh daily, prepared artisanally.</p>
// //                   <p style={{ margin: '2px 0' }}>www.cakentake.com</p>
// //                 </div>
// //               </div>

// //               <div className="da-modal-footer">
// //                 <button className="da-modal-print" onClick={() => window.print()}>
// //                   <IconPrinter size={13} style={{ marginRight: 5 }} /> Print
// //                 </button>
// //                 <button className="da-modal-cancel" onClick={() => setIsReceiptOpen(false)}>Close</button>
// //               </div>
// //             </div>
// //           </div>
// //         );
// //       })()}

// //     </div>
// //   );
// // };

// // export default DeliveryOrder;


// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import './DeliveryOrder.css';

// // ─── Service imports ─────────────────────────────────────────────────────────
// // All URLs come from delivery_routes.py and order_routes.py
// import {
//   getDeliveryPending,       // GET  /delivery/pending         → READY orders (kitchen done, agent not yet assigned)
//   getDeliveryAssigned,      // GET  /delivery/assigned        → ASSIGNED_TO_AGENT orders
//   getDeliveryReady,         // GET  /delivery/ready-for-pickup→ ASSIGNED_TO_DRIVER | DRIVER_ACCEPTED | OUT_FOR_DELIVERY
//   getDeliveryProofPending,  // GET  /delivery/proof-pending   → DELIVERY_SUBMITTED (driver sent proof)
//   getDeliveryDelivered,     // GET  /delivery/delivered       → DELIVERED orders
// } from '../../services/deliveryService';

// import {
//   assignDriverToOrder,      // POST /orders/:id/assign-driver    { driver_id } → ASSIGNED_TO_DRIVER
//   markOrderDelivered,       // POST /orders/:id/confirm-delivery                → DELIVERED
// } from '../../services/orderService';

// import {
//   getAvailableDrivers,      // GET  /drivers/available
//   getDrivers,               // GET  /drivers
// } from '../../services/driverService';

// // ─── SVG Icons ────────────────────────────────────────────────────────────────
// const IconTruck = ({ size = 20 }: { size?: number }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <rect x="1" y="3" width="15" height="13" rx="2" />
//     <path d="M16 8h4l3 3v5h-7V8z" />
//     <circle cx="5.5" cy="18.5" r="2.5" />
//     <circle cx="18.5" cy="18.5" r="2.5" />
//   </svg>
// );
// const IconClock = ({ size = 18 }: { size?: number }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
//   </svg>
// );
// const IconCheckCircle = ({ size = 18 }: { size?: number }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
//   </svg>
// );
// const IconUser = ({ size = 18 }: { size?: number }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
//   </svg>
// );
// const IconMapPin = ({ size = 14 }: { size?: number }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
//   </svg>
// );
// const IconPackage = ({ size = 20 }: { size?: number }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
//     <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
//     <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
//     <line x1="12" y1="22.08" x2="12" y2="12" />
//   </svg>
// );
// const IconRefresh = ({ size = 16 }: { size?: number }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
//     <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
//   </svg>
// );
// const IconX = ({ size = 18 }: { size?: number }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
//   </svg>
// );
// const IconPhone = ({ size = 14 }: { size?: number }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.88a16 16 0 0 0 6.21 6.21l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
//   </svg>
// );
// const IconSearch = ({ size = 16 }: { size?: number }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
//   </svg>
// );
// const IconStar = ({ size = 13 }: { size?: number }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
//     <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
//   </svg>
// );
// const IconEye = ({ size = 16 }: { size?: number }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
//   </svg>
// );
// const IconAlert = ({ size = 16 }: { size?: number }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
//   </svg>
// );
// const IconImage = ({ size = 16 }: { size?: number }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
//     <polyline points="21 15 16 10 5 21" />
//   </svg>
// );
// const IconCake = ({ size = 12 }: { size?: number }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
//     <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" />
//     <path d="M12 3v4" />
//     <path d="M12 7c-1.5 0-2-1-2-1.5S10.5 4 12 3c1.5 1 2 1.5 2 2.5S13.5 7 12 7z" />
//   </svg>
// );
// const IconPrinter = ({ size = 16 }: { size?: number }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <path d="M6 9V2h12v7" />
//     <rect x="6" y="13" width="12" height="9" rx="2" />
//     <path d="M6 18h12" />
//   </svg>
// );

// // ─── Types ────────────────────────────────────────────────────────────────────

// type TabType = 'all' | 'pending' | 'assigned' | 'driver_active' | 'proof_pending' | 'delivered';

// // ─── Status helpers ───────────────────────────────────────────────────────────

// const statusPillClass = (s: string): string => {
//   switch ((s || '').toUpperCase()) {
//     case 'READY':               return 'pill-ready';
//     case 'ASSIGNED_TO_AGENT':   return 'pill-assigned';
//     case 'ASSIGNED_TO_DRIVER':  return 'pill-assigned';
//     case 'DRIVER_ACCEPTED':     return 'pill-onway';
//     case 'OUT_FOR_DELIVERY':    return 'pill-onway';
//     case 'DELIVERY_SUBMITTED':  return 'pill-proof';
//     case 'DELIVERED':           return 'pill-delivered';
//     case 'CANCELLED':           return 'pill-cancelled';
//     default:                    return 'pill-default';
//   }
// };

// const statusLabel = (s: string): string => {
//   switch ((s || '').toUpperCase()) {
//     case 'READY':               return 'Ready';
//     case 'ASSIGNED_TO_AGENT':   return 'Agent Assigned';
//     case 'ASSIGNED_TO_DRIVER':  return 'Driver Assigned';
//     case 'DRIVER_ACCEPTED':     return 'Out for Delivery';
//     case 'OUT_FOR_DELIVERY':    return 'Out for Delivery';
//     case 'DELIVERY_SUBMITTED':  return 'Proof Submitted';
//     case 'DELIVERED':           return 'Delivered';
//     default:                    return (s || '').replace(/_/g, ' ');
//   }
// };

// const driverStatusClass = (s: string): string => {
//   const st = (s || '').toUpperCase();
//   if (st === 'ONLINE' || st === 'AVAILABLE') return 'ds-available';
//   if (st === 'BUSY')                         return 'ds-busy';
//   return 'ds-offline';
// };

// const driverStatusLabel = (s: string): string => {
//   const st = (s || '').toUpperCase();
//   if (st === 'ONLINE' || st === 'AVAILABLE') return 'Available';
//   if (st === 'BUSY')                         return 'Busy';
//   return 'Offline';
// };

// // ─── Formatters ───────────────────────────────────────────────────────────────

// const fmtTime = (dt: string) =>
//   dt ? new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—';
// const fmtDate = (dt: string) =>
//   dt ? new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—';
// const fmtDateFull = (dt: string) =>
//   dt ? new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// const currencySymbol = (cur?: string) => {
//   const c = cur || (typeof window !== 'undefined' ? localStorage.getItem('currency') || 'INR' : 'INR');
//   return c === 'INR' ? '₹' : c;
// };

// const fmtCurrency = (n: number | undefined, cur?: string) => `${currencySymbol(cur)}${Number(n || 0).toFixed(0)}`;

// const renderValue = (v: any) => {
//   if (v === null || v === undefined) return '';
//   if (typeof v === 'string' || typeof v === 'number') return String(v);
//   if (typeof v === 'object') {
//     return (
//       v.name || v.title || v.first_name || v.firstName || v.full_name || v.email || JSON.stringify(v)
//     );
//   }
//   return String(v);
// };

// // ─── Address field helpers (object-safe) ───────────────────────────────────────
// const getAddressAreaName = (address: any) => {
//   const area = address?.area;
//   if (area === undefined || area === null || area === '') return null;
//   if (typeof area === 'object') return area.name ?? area.areaName ?? null;
//   return area;
// };

// const getAddressCountryName = (address: any) => {
//   const country = address?.country;
//   if (country === undefined || country === null || country === '') return null;
//   if (typeof country === 'object') return country.name ?? country.countryName ?? null;
//   return country ?? address?.country_name ?? address?.country_code ?? null;
// };

// const getAddressFieldValue = (address: any, keys: string[]) => {
//   for (const k of keys) {
//     const v = address?.[k];
//     if (v !== undefined && v !== null && v !== '') return v;
//   }
//   return null;
// };

// const ADDRESS_FIELD_DEFS: { label: string; keys?: string[]; resolver?: (a: any) => any }[] = [
//   { label: 'Area', resolver: getAddressAreaName },
//   { label: 'Building', keys: ['building', 'building_name', 'building_no'] },
//   { label: 'Block', keys: ['block', 'block_no'] },
//   { label: 'Avenue', keys: ['avenue', 'avenue_name'] },
//   { label: 'Street', keys: ['street', 'street_name'] },
//   {
//     label: 'Floor / Apt',
//     resolver: (a: any) => {
//       const floor = a?.floor;
//       const apt = a?.apartment || a?.apt;
//       if (!floor && !apt) return null;
//       return [floor, apt].filter(Boolean).join(' ');
//     },
//   },
//   { label: 'Country', resolver: getAddressCountryName },
//   { label: 'City', keys: ['city'] },
//   { label: 'Pincode', keys: ['pincode', 'zip', 'postal_code'] },
//   { label: 'Address Notes', keys: ['address_notes', 'addressNotes', 'delivery_notes', 'notes', 'landmark'] },
// ];

// const getAddressFields = (address: any) =>
//   ADDRESS_FIELD_DEFS
//     .map(({ label, keys, resolver }) => ({
//       label,
//       value: resolver ? resolver(address) : getAddressFieldValue(address, keys || []),
//     }))
//     .filter((f) => f.value !== null && f.value !== undefined && f.value !== '');

// const getAddressSummaryLine = (address: any) => {
//   if (!address) return null;
//   const parts = [
//     address.street,
//     getAddressAreaName(address),
//     address.city,
//     address.pincode,
//     getAddressCountryName(address),
//   ].filter(Boolean);
//   return parts.length ? parts.join(', ') : null;
// };

// // ─── Agent-exclusive item helpers ──────────────────────────────────────────────
// const getItemCustomJson = (item: any) => item?.custom_json || {};

// const isAgentExclusiveItem = (item: any) => getItemCustomJson(item)?.product_type === 'AGENT';

// const getItemProductSource = (item: any) => {
//   const agentProduct = item?.agent_product ?? {};
//   const product = item?.product ?? {};
//   return isAgentExclusiveItem(item) ? agentProduct : product;
// };

// const getItemDisplayName = (item: any) => {
//   const source = getItemProductSource(item);
//   return (
//     source?.name ||
//     item?.product_name ||
//     item?.name ||
//     (isAgentExclusiveItem(item) ? 'Agent Product' : 'Item')
//   );
// };

// const getItemDisplayImage = (item: any) => {
//   const source = getItemProductSource(item);
//   return source?.image || source?.image_url || source?.imageUrl || item?.image || null;
// };

// const getItemDisplayDescription = (item: any) => {
//   const source = getItemProductSource(item);
//   return source?.description || null;
// };

// // ─── Item customization helpers (flavour / variant / shape / add-ons / notes) ──
// interface ItemCustomJson {
//   variant?: string;
//   flavour?: string;
//   flavor?: string;
//   shape?: string;
//   add_ons?: string[];
//   addons?: string[];
//   add_on_total?: number;
//   notes?: string;
//   product_type?: string;
// }

// const getCustomJson = (item: any): ItemCustomJson => item?.custom_json || {};

// const getFlavour = (item: any) => {
//   const cj = getCustomJson(item);
//   return cj.flavour || cj.flavor || item?.flavour || item?.flavor || null;
// };

// const getVariant = (item: any) => {
//   const cj = getCustomJson(item);
//   return cj.variant || item?.variant || null;
// };

// const getShape = (item: any) => {
//   const cj = getCustomJson(item);
//   return cj.shape || item?.shape || null;
// };

// const getAddOns = (item: any): string[] => {
//   const cj = getCustomJson(item);
//   const list = cj.add_ons || cj.addons || item?.add_ons || item?.selected_add_ons || [];
//   return Array.isArray(list) ? list : [];
// };

// const getItemNotes = (item: any) => {
//   const cj = getCustomJson(item);
//   return cj.notes || item?.notes || null;
// };

// // ─── Order add-ons (whole-order, not per-item) ─────────────────────────────────
// const getOrderAddons = (order: any): any[] => {
//   if (Array.isArray(order?.order_addons)) return order.order_addons;
//   if (Array.isArray(order?.order_addons_json)) return order.order_addons_json;
//   return [];
// };

// const getOrderAddonTotal = (order: any): number => {
//   const addons = getOrderAddons(order);
//   return Number(
//     order?.order_addons_total ??
//     addons.reduce((sum: number, addon: any) => sum + Number(addon.total ?? (addon.price * addon.quantity || 0)), 0)
//   );
// };

// // ─── Custom cake helpers ────────────────────────────────────────────────────
// const getCustomCakeDetails = (order: any) => {
//   const customCake = order?.custom_cake_json ?? order?.custom_cake ?? null;
//   if (!customCake || typeof customCake !== 'object') return null;
//   return {
//     image: customCake?.image || customCake?.image_url || null,
//     flavour: customCake?.flavour || customCake?.flavor || null,
//     weight: customCake?.weight || null,
//     shape: customCake?.shape || null,
//     size: customCake?.size || null,
//     colour: customCake?.colour || customCake?.color || null,
//     message: customCake?.message || null,
//     notes: customCake?.notes || null,
//     price: customCake?.price != null ? Number(customCake.price) : null,
//   };
// };

// const isCustomCakeOrder = (order: any) => !!getCustomCakeDetails(order);

// // ─── Order origin helpers (user / sales agent / agent) ─────────────────────
// // Mirrors OrderManagement.tsx's isSalesAgentOrder / isAgentOrder logic so an
// // order is classified identically across both dashboards. Drives the card
// // tint: white = regular customer order, light rose = sales agent order,
// // light green = agent order.
// const getOrderCreatedByRole = (order: any) =>
//   order?.created_by?.role ?? order?.created_by_role ?? order?.createdByRole ?? null;

// const isSalesAgentOrder = (order: any) => {
//   const role = getOrderCreatedByRole(order);
//   const source = order?.order_source ?? order?.orderSource;
//   const orderType = String(order?.order_type ?? '').toLowerCase();
//   return role === 'SALES_AGENT' || source === 'SALES_AGENT' || orderType === 'sales_agent';
// };

// const isAgentOrder = (order: any) => {
//   if (isSalesAgentOrder(order)) return false;
//   const role = getOrderCreatedByRole(order);
//   const source = order?.order_source ?? order?.orderSource;
//   return source === 'AGENT' || role === 'AGENT';
// };

// const getOrderOriginCardClass = (order: any) => {
//   if (isSalesAgentOrder(order)) return 'card-sales-agent';
//   if (isAgentOrder(order)) return 'card-agent-order';
//   return '';
// };

// // ─── Component ────────────────────────────────────────────────────────────────

// const DeliveryOrder: React.FC = () => {

//   // ── State ──────────────────────────────────────────────────────────────────

//   const [activeTab,        setActiveTab]        = useState<TabType>('all');

//   const [pendingOrders,      setPendingOrders]      = useState<any[]>([]);
//   const [assignedOrders,     setAssignedOrders]     = useState<any[]>([]);
//   const [driverActiveOrders, setDriverActiveOrders] = useState<any[]>([]);
//   const [proofOrders,        setProofOrders]        = useState<any[]>([]);
//   const [deliveredOrders,    setDeliveredOrders]    = useState<any[]>([]);

//   const [loading,       setLoading]       = useState(true);
//   const [refreshing,    setRefreshing]    = useState(false);
//   const [actionLoading, setActionLoading] = useState<number | null>(null);
//   const [error,         setError]         = useState<string | null>(null);
//   const [successMsg,    setSuccessMsg]    = useState<string | null>(null);

//   const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
//   const [modalOpen,     setModalOpen]     = useState(false);

//   const [driverModalOpen,   setDriverModalOpen]   = useState(false);
//   const [assignTargetOrder, setAssignTargetOrder] = useState<any | null>(null);
//   const [drivers,           setDrivers]           = useState<any[]>([]);
//   const [filteredDrivers,   setFilteredDrivers]   = useState<any[]>([]);
//   const [driverLoading,     setDriverLoading]     = useState(false);
//   const [assigningDriver,   setAssigningDriver]   = useState<number | null>(null);
//   const [driverSearch,      setDriverSearch]      = useState('');
//   const [assignSuccess,     setAssignSuccess]     = useState<string | null>(null);

//   const [confirmModalOpen,  setConfirmModalOpen]  = useState(false);
//   const [confirmTarget,     setConfirmTarget]     = useState<any | null>(null);

//   const [isReceiptOpen, setIsReceiptOpen] = useState(false);
//   const [receiptOrder,  setReceiptOrder]  = useState<any | null>(null);

//   // ── Fetch all buckets concurrently ────────────────────────────────────────

//   const fetchAll = useCallback(async (silent = false) => {
//     if (!silent) setLoading(true);
//     else         setRefreshing(true);
//     setError(null);
//     try {
//       const [pending, assigned, driverActive, proof, delivered] = await Promise.all([
//         getDeliveryPending().catch(() => []),
//         getDeliveryAssigned().catch(() => []),
//         getDeliveryReady().catch(() => []),
//         getDeliveryProofPending().catch(() => []),
//         getDeliveryDelivered().catch(() => []),
//       ]);
//       setPendingOrders(pending);
//       setAssignedOrders(assigned);
//       setDriverActiveOrders(driverActive);
//       setProofOrders(proof);
//       setDeliveredOrders(delivered);
//     } catch (err) {
//       console.error('Delivery fetch error', err);
//       setError('Failed to load orders. Please refresh.');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, []);

//   useEffect(() => { fetchAll(); }, [fetchAll]);

//   // ── Driver search filter ──────────────────────────────────────────────────

//   useEffect(() => {
//     if (!driverSearch.trim()) { setFilteredDrivers(drivers); return; }
//     const q = driverSearch.toLowerCase();
//     setFilteredDrivers(drivers.filter(d => {
//       const name  = `${d.first_name || d.name || ''} ${d.last_name || ''}`.toLowerCase();
//       const phone = (d.phone_no || '').toLowerCase();
//       return name.includes(q) || phone.includes(q);
//     }));
//   }, [driverSearch, drivers]);

//   // ── Derived data ──────────────────────────────────────────────────────────

//   const allOrders = useMemo(() =>
//     (() => {
//       const combined = [...pendingOrders, ...assignedOrders, ...driverActiveOrders, ...proofOrders, ...deliveredOrders];
//       const byId = new Map<number | string, any>();
//       for (const o of combined) {
//         const key = o?.id ?? Math.random();
//         if (!byId.has(key)) {
//           byId.set(key, o);
//         } else {
//           const existing = byId.get(key);
//           try {
//             const exTime = existing?.created_at ? new Date(existing.created_at).getTime() : 0;
//             const newTime = o?.created_at ? new Date(o.created_at).getTime() : 0;
//             if (newTime > exTime) byId.set(key, o);
//           } catch (e) {
//             byId.set(key, o);
//           }
//         }
//       }
//       return Array.from(byId.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
//     })(),
//     [pendingOrders, assignedOrders, driverActiveOrders, proofOrders, deliveredOrders]
//   );

//   const getDeliverySchedule = (order: any) => {
//     const rawDate = order?.expected_delivery_date || order?.delivery_date || order?.deliveryDate || null;
//     const time = order?.time_slot || order?.delivery_time_slot || order?.deliveryTimeSlot || null;

//     let isToday = false;
//     if (rawDate) {
//       const d = new Date(rawDate);
//       const now = new Date();
//       isToday = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
//     }

//     return {
//       dateLabel: rawDate ? fmtDate(rawDate) : null,
//       time,
//       isToday,
//     };
//   };

//   const visibleOrders = useMemo(() => {
//     switch (activeTab) {
//       case 'pending':       return pendingOrders;
//       case 'assigned':      return assignedOrders;
//       case 'driver_active': return driverActiveOrders;
//       case 'proof_pending': return proofOrders;
//       case 'delivered':     return deliveredOrders;
//       default:              return allOrders;
//     }
//   }, [activeTab, pendingOrders, assignedOrders, driverActiveOrders, proofOrders, deliveredOrders, allOrders]);

//   // ── Success toast helper ──────────────────────────────────────────────────

//   const showSuccess = (msg: string) => {
//     setSuccessMsg(msg);
//     setTimeout(() => setSuccessMsg(null), 3000);
//   };

//   // ── Open driver assignment modal ──────────────────────────────────────────

//   const handleOpenAssign = async (order: any, e?: React.MouseEvent) => {
//     e?.stopPropagation();
//     setAssignTargetOrder(order);
//     setDriverModalOpen(true);
//     setDriverLoading(true);
//     setDriverSearch('');
//     setAssignSuccess(null);
//     setError(null);
//     try {
//       let list: any[] = await getAvailableDrivers().catch(() => []);
//       if (!list || list.length === 0) {
//         list = await getDrivers().catch(() => []);
//       }
//       setDrivers(list);
//       setFilteredDrivers(list);
//     } catch {
//       setDrivers([]);
//       setFilteredDrivers([]);
//     } finally {
//       setDriverLoading(false);
//     }
//   };

//   // ── Assign driver ─────────────────────────────────────────────────────────

//   const handleAssignDriver = async (driver: any) => {
//     if (!assignTargetOrder || assigningDriver !== null) return;
//     setAssigningDriver(driver.id);
//     setError(null);
//     try {
//       await assignDriverToOrder(Number(assignTargetOrder.id), Number(driver.id));
//       const driverName = `${driver.first_name || driver.name || 'Driver'} ${driver.last_name || ''}`.trim();
//       setAssignSuccess(`Order #${assignTargetOrder.order_number || assignTargetOrder.id} assigned to ${driverName}`);
//       await fetchAll(true);
//       setTimeout(() => {
//         setDriverModalOpen(false);
//         setAssignTargetOrder(null);
//         setAssignSuccess(null);
//       }, 1800);
//     } catch (err: any) {
//       setError(err?.response?.data?.error || 'Failed to assign driver. Please try again.');
//     } finally {
//       setAssigningDriver(null);
//     }
//   };

//   // ── Confirm delivery ──────────────────────────────────────────────────────

//   const handleConfirmDelivery = async () => {
//     if (!confirmTarget) return;
//     setActionLoading(confirmTarget.id);
//     setError(null);
//     try {
//       await markOrderDelivered(confirmTarget.id);
//       showSuccess(`Order #${confirmTarget.order_number || confirmTarget.id} confirmed as delivered!`);
//       setConfirmModalOpen(false);
//       setConfirmTarget(null);
//       if (modalOpen && selectedOrder?.id === confirmTarget.id) setModalOpen(false);
//       await fetchAll(true);
//     } catch (err: any) {
//       setError(err?.response?.data?.error || 'Failed to confirm delivery.');
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   // ── Open receipt modal ────────────────────────────────────────────────────

//   const handleOpenReceipt = (order: any, e?: React.MouseEvent) => {
//     e?.stopPropagation();
//     setReceiptOrder(order);
//     setIsReceiptOpen(true);
//   };

//   // ── Render action buttons per order status ────────────────────────────────

//   const renderActionBtn = (order: any, fromModal = false) => {
//     const status    = (order.status || '').toUpperCase();
//     const isLoading = actionLoading === order.id;

//     if (status === 'ASSIGNED_TO_AGENT') {
//       return (
//         <button
//           className="da-action-primary bg-assign"
//           disabled={isLoading}
//           onClick={e => { e.stopPropagation(); handleOpenAssign(order); }}
//         >
//           <IconTruck size={13} /> Assign Driver
//         </button>
//       );
//     }

//     if (status === 'ASSIGNED_TO_DRIVER') {
//       return (
//         <div className={`da-action-group ${fromModal ? 'da-action-group-modal' : ''}`}>
//           <button
//             className="da-action-secondary bg-reassign"
//             disabled={isLoading}
//             onClick={e => { e.stopPropagation(); handleOpenAssign(order); }}
//           >
//             <IconTruck size={13} /> Re-assign
//           </button>
//           <span className="da-waiting-chip">Awaiting driver acceptance</span>
//         </div>
//       );
//     }

//     if (status === 'DRIVER_ACCEPTED' || status === 'OUT_FOR_DELIVERY') {
//       return (
//         <span className="da-info-chip">
//           <IconTruck size={12} /> Driver en route
//         </span>
//       );
//     }

//     if (status === 'DELIVERY_SUBMITTED') {
//       return (
//         <button
//           className="da-action-primary bg-delivered"
//           disabled={isLoading}
//           onClick={e => {
//             e.stopPropagation();
//             setConfirmTarget(order);
//             setConfirmModalOpen(true);
//           }}
//         >
//           <IconCheckCircle size={13} />
//           {isLoading ? 'Confirming…' : 'Confirm Delivered'}
//         </button>
//       );
//     }

//     if (status === 'DELIVERED') {
//       return (
//         <span className="da-done-badge">
//           <IconCheckCircle size={12} /> Delivered
//         </span>
//       );
//     }

//     return null;
//   };

//   // ── Tab config ────────────────────────────────────────────────────────────

//   const tabs: { key: TabType; label: string; count: number; badgeClass: string }[] = [
//     { key: 'all',          label: 'All Orders',      count: allOrders.length,        badgeClass: 'bg-all'       },
//     { key: 'pending',      label: 'Ready (Pickup)',  count: pendingOrders.length,     badgeClass: 'bg-pending'   },
//     { key: 'assigned',     label: 'Agent Assigned',  count: assignedOrders.length,    badgeClass: 'bg-assigned'  },
//     { key: 'driver_active',label: 'Driver Active',   count: driverActiveOrders.length,badgeClass: 'bg-onway'    },
//     { key: 'proof_pending',label: 'Proof Submitted', count: proofOrders.length,       badgeClass: 'bg-proof'    },
//     { key: 'delivered',    label: 'Delivered',       count: deliveredOrders.length,   badgeClass: 'bg-completed' },
//   ];

//   // ─── Render ────────────────────────────────────────────────────────────────

//   return (
//     <div className="da-container">

//       {successMsg && (
//         <div className="da-toast-success">
//           <IconCheckCircle size={16} /><span>{successMsg}</span>
//         </div>
//       )}

//       {error && (
//         <div className="da-error-banner">
//           <IconAlert size={16} /><span>{error}</span>
//           <button onClick={() => setError(null)} className="da-error-dismiss">✕</button>
//         </div>
//       )}

//       <div className="da-page-header">
//         <div className="da-header-text">
//           <h2>Delivery Agent Dashboard</h2>
//           <p>Assign drivers to orders, track deliveries, and confirm completions.</p>
//         </div>
//         <button
//           className={`da-refresh-btn ${refreshing ? 'spinning' : ''}`}
//           onClick={() => fetchAll(true)}
//           title="Refresh"
//         >
//           <IconRefresh size={16} />
//         </button>
//       </div>

//       <div className="da-stats-grid">
//         <div className="da-stat-card" onClick={() => setActiveTab('all')}>
//           <div className="da-stat-icon icon-all"><IconPackage size={22} /></div>
//           <div className="da-stat-details"><h3>{allOrders.length}</h3><p>Total Orders</p></div>
//         </div>
//         <div className="da-stat-card" onClick={() => setActiveTab('pending')}>
//           <div className="da-stat-icon icon-pending"><IconClock size={22} /></div>
//           <div className="da-stat-details"><h3>{pendingOrders.length}</h3><p>Ready for Pickup</p></div>
//         </div>
//         <div className="da-stat-card" onClick={() => setActiveTab('assigned')}>
//           <div className="da-stat-icon icon-assigned"><IconUser size={22} /></div>
//           <div className="da-stat-details"><h3>{assignedOrders.length}</h3><p>Need Driver</p></div>
//         </div>
//         <div className="da-stat-card" onClick={() => setActiveTab('driver_active')}>
//           <div className="da-stat-icon icon-onway"><IconTruck size={22} /></div>
//           <div className="da-stat-details"><h3>{driverActiveOrders.length}</h3><p>Driver Active</p></div>
//         </div>
//         <div className="da-stat-card" onClick={() => setActiveTab('proof_pending')}>
//           <div className="da-stat-icon icon-proof"><IconImage size={22} /></div>
//           <div className="da-stat-details"><h3>{proofOrders.length}</h3><p>Proof Submitted</p></div>
//         </div>
//         <div className="da-stat-card" onClick={() => setActiveTab('delivered')}>
//           <div className="da-stat-icon icon-delivered"><IconCheckCircle size={22} /></div>
//           <div className="da-stat-details"><h3>{deliveredOrders.length}</h3><p>Delivered</p></div>
//         </div>
//       </div>

//       <div className="da-tabs-bar">
//         {tabs.map(t => (
//           <button
//             key={t.key}
//             className={`da-tab-item ${activeTab === t.key ? 'active' : ''}`}
//             onClick={() => setActiveTab(t.key)}
//           >
//             {t.label}
//             <span className={`da-tab-badge ${t.badgeClass}`}>{t.count}</span>
//           </button>
//         ))}
//       </div>

//       {/* Legend for order origin highlights */}
//       <div className="da-legend-row">
//         <span className="da-legend-item">
//           <span className="da-legend-swatch swatch-user" /> Customer order
//         </span>
//         <span className="da-legend-item">
//           <span className="da-legend-swatch swatch-sales-agent" /> Sales agent order
//         </span>
//         <span className="da-legend-item">
//           <span className="da-legend-swatch swatch-agent-order" /> Agent order
//         </span>
//       </div>

//       {loading ? (
//         <div className="da-center-loader">
//           <div className="da-spinner" /><p>Loading orders…</p>
//         </div>
//       ) : visibleOrders.length === 0 ? (
//         <div className="da-empty-state">
//           <IconTruck size={48} />
//           <h3>No Orders Here</h3>
//           <p>No orders in this category right now.</p>
//         </div>
//       ) : (
//         <div className="da-orders-grid">
//           {visibleOrders.map(order => {
//             const status   = (order.status || '').toUpperCase();
//             const customer = order.customer;
//             const addr     = order.delivery_address;
//             const orderIsCustomCake = isCustomCakeOrder(order);
//             const schedule = getDeliverySchedule(order)
//             const addressSummary = getAddressSummaryLine(addr);
//             const originCardClass = getOrderOriginCardClass(order);

//             return (
//               <div
//                 key={order.id}
//                 className={`da-order-card ${schedule.isToday ? 'card-due-today' : ''} ${originCardClass}`}
//                 onClick={() => { setSelectedOrder(order); setModalOpen(true); }}
//               >
//                 <div className="da-card-top">
//                   <div className="da-card-id-block">
//                     <h4 className="da-order-number">
//                       #{order.order_number || String(order.id).padStart(5, '0')}
//                     </h4>
//                     <span className="da-order-time">
//                       <IconClock size={11} />
//                       {fmtDate(order.created_at)} · {fmtTime(order.created_at)}
//                     </span>
//                   </div>
//                   <span className={`da-status-pill ${statusPillClass(status)}`}>
//                     {statusLabel(status)}
//                   </span>
//                 </div>

//                 {(schedule.dateLabel || schedule.time) && (
//                   <div className={`da-schedule-row ${schedule.isToday ? 'is-today' : ''}`}>
//                     <IconClock size={12} />
//                     <span className="da-schedule-label">Expected:</span>
//                     <span className="da-schedule-value">
//                       {schedule.dateLabel || 'Date TBD'}
//                       {schedule.time && <> · {schedule.time}</>}
//                     </span>
//                     {schedule.isToday && <span className="da-schedule-today-tag">Today</span>}
//                   </div>
//                 )}

//                 {orderIsCustomCake && (
//                   <div
//                     style={{
//                       display: 'inline-flex',
//                       alignItems: 'center',
//                       gap: 4,
//                       fontSize: 11,
//                       fontWeight: 600,
//                       color: '#b45309',
//                       background: '#fef3c7',
//                       border: '1px solid #fde68a',
//                       borderRadius: 6,
//                       padding: '2px 8px',
//                       marginBottom: 6,
//                       width: 'fit-content',
//                     }}
//                   >
//                     <IconCake size={11} /> Custom Cake Order
//                   </div>
//                 )}

//                 {(customer || addr) && (
//                   <div className="da-card-meta">
//                     {customer && (
//                       <div className="da-meta-row">
//                         <IconUser size={12} />
//                         <span>
//                           {typeof customer === 'object'
//                             ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
//                             : customer}
//                         </span>
//                       </div>
//                     )}
//                     {addressSummary && (
//                       <div className="da-meta-row">
//                         <IconMapPin size={12} />
//                         <span>{addressSummary}</span>
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 <div className="da-card-items">
//                   {(order.items || []).slice(0, 3).map((item: any, idx: number) => (
//                     <div key={item.id || idx} className="da-item-line">
//                       <span className="da-item-qty">×{item.quantity}</span>
//                       <span className="da-item-name">{getItemDisplayName(item)}</span>
//                     </div>
//                   ))}
//                   {(order.items || []).length > 3 && (
//                     <span className="da-item-more">+{order.items.length - 3} more</span>
//                   )}
//                 </div>

//                 {order.driver && (
//                   <div className="da-driver-tag">
//                     <IconTruck size={11} />
//                     <span>
//                       {`${order.driver.first_name || ''} ${order.driver.last_name || ''}`.trim() || 'Driver assigned'}
//                     </span>
//                   </div>
//                 )}

//                 {status === 'DELIVERY_SUBMITTED' && (
//                   <div className="da-proof-tag">
//                     <IconImage size={11} />
//                     <span>Driver submitted delivery proof</span>
//                   </div>
//                 )}

//                 {(order.grand_total || order.total) && (
//                   <div className="da-card-total">
//                     <span>Total</span>
//                     <strong>{fmtCurrency(order.grand_total || order.total || 0, order.currency)}</strong>
//                   </div>
//                 )}

//                 <div className="da-card-footer">
//                   <button
//                     className="da-view-btn"
//                     onClick={e => { e.stopPropagation(); setSelectedOrder(order); setModalOpen(true); }}
//                   >
//                     <IconEye size={13} /> View
//                   </button>
//                   <button
//                     className="da-view-btn"
//                     onClick={e => handleOpenReceipt(order, e)}
//                   >
//                     <IconPrinter size={13} /> Receipt
//                   </button>
//                   {renderActionBtn(order)}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {/* ─── Order Detail Modal ─────────────────────────────────────────── */}
//       {modalOpen && selectedOrder && (
//         <div className="da-modal-backdrop" onClick={() => setModalOpen(false)}>
//           <div className="da-modal-card" onClick={e => e.stopPropagation()}>
//             <div className="da-modal-header">
//               <h3>Order Details</h3>
//               <button className="da-modal-close" onClick={() => setModalOpen(false)}>
//                 <IconX size={16} />
//               </button>
//             </div>
//             <div className="da-modal-body">

//               <div className="da-modal-meta">
//                 <div>
//                   <p className="da-modal-order-num">
//                     #{selectedOrder.order_number || selectedOrder.id}
//                   </p>
//                   <p className="da-modal-order-type">
//                     {selectedOrder.order_type || 'DELIVERY'} · {fmtDate(selectedOrder.created_at)}
//                   </p>
//                 </div>
//                 <span className={`da-status-pill ${statusPillClass(selectedOrder.status)}`}>
//                   {statusLabel(selectedOrder.status)}
//                 </span>
//               </div>

//               {isCustomCakeOrder(selectedOrder) && (
//                 <div
//                   style={{
//                     display: 'inline-flex',
//                     alignItems: 'center',
//                     gap: 4,
//                     fontSize: 12,
//                     fontWeight: 600,
//                     color: '#b45309',
//                     background: '#fef3c7',
//                     border: '1px solid #fde68a',
//                     borderRadius: 6,
//                     padding: '3px 10px',
//                     margin: '10px 0',
//                     width: 'fit-content',
//                   }}
//                 >
//                   <IconCake size={12} /> Custom Cake Order
//                 </div>
//               )}

//               {(selectedOrder.placed_by || selectedOrder.source || selectedOrder.order_origin || selectedOrder.placed_by_role || selectedOrder.placed_by_email) && (
//                 <div className="da-modal-section">
//                   <h5 className="da-modal-section-title">Order Origin</h5>
//                   <div className="da-modal-info-grid">
//                     {selectedOrder.placed_by && (
//                       <div className="da-info-row">
//                         <IconUser size={13} />
//                         <span>{renderValue(selectedOrder.placed_by)}</span>
//                       </div>
//                     )}
//                     {selectedOrder.placed_by_role && (
//                       <div className="da-info-row">
//                         <span className="da-origin-role">{selectedOrder.placed_by_role}</span>
//                       </div>
//                     )}
//                     {selectedOrder.placed_by_email && (
//                       <div className="da-info-row">
//                         <span>{selectedOrder.placed_by_email}</span>
//                       </div>
//                     )}
//                     {selectedOrder.source && (
//                       <div className="da-info-row">
//                         <span>Source: {selectedOrder.source}</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {(selectedOrder.expected_delivery_date || selectedOrder.time_slot || selectedOrder.delivery_area || selectedOrder.area) && (
//                 <div className="da-modal-section">
//                   <h5 className="da-modal-section-title">Delivery Schedule</h5>
//                   <div className="da-modal-info-grid">
//                     {selectedOrder.expected_delivery_date && (
//                       <div className="da-info-row">
//                         <IconClock size={13} />
//                         <span>{fmtDate(selectedOrder.expected_delivery_date)}</span>
//                       </div>
//                     )}
//                     {selectedOrder.time_slot && (
//                       <div className="da-info-row">
//                         <IconClock size={13} />
//                         <span>{selectedOrder.time_slot}</span>
//                       </div>
//                     )}
//                     {(selectedOrder.delivery_area || selectedOrder.area) && (
//                       <div className="da-info-row">
//                         <IconMapPin size={13} />
//                         <span>{renderValue(selectedOrder.delivery_area || selectedOrder.area)}</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {selectedOrder.payment_method && (
//                 <div className="da-modal-section">
//                   <h5 className="da-modal-section-title">Payment</h5>
//                   <div className="da-info-row">
//                     <span>{selectedOrder.payment_method}</span>
//                     {selectedOrder.payment_status && (
//                       <span className={`da-payment-chip chip-${(selectedOrder.payment_status || '').toLowerCase()}`}>
//                         {selectedOrder.payment_status}
//                       </span>
//                     )}
//                     {selectedOrder.currency && (
//                       <span className="da-currency-label">{selectedOrder.currency}</span>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {selectedOrder.customer && (
//                 <div className="da-modal-section">
//                   <h5 className="da-modal-section-title">Customer</h5>
//                   <div className="da-modal-info-grid">
//                     <div className="da-info-row">
//                       <IconUser size={13} />
//                       <span>
//                         {selectedOrder.customer.first_name} {selectedOrder.customer.last_name}
//                       </span>
//                     </div>
//                     {selectedOrder.customer.phone_no && (
//                       <div className="da-info-row">
//                         <IconPhone size={13} />
//                         <span>{selectedOrder.customer.phone_no}</span>
//                       </div>
//                     )}
//                     {selectedOrder.customer.email && (
//                       <div className="da-info-row">
//                         <span className="da-customer-email">{selectedOrder.customer.email}</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {selectedOrder.customer && (
//                 <div className="da-modal-section">
//                   <h5 className="da-modal-section-title">Customer & Address</h5>
//                   <div className="da-modal-info-grid">
//                     <div className="da-info-row">
//                       <IconUser size={13} />
//                       <span>{renderValue(selectedOrder.customer.first_name || selectedOrder.customer.name || (selectedOrder.customer.first_name && selectedOrder.customer.last_name ? `${selectedOrder.customer.first_name} ${selectedOrder.customer.last_name}` : ''))}</span>
//                     </div>
//                     {selectedOrder.customer.phone_no && (
//                       <div className="da-info-row">
//                         <IconPhone size={13} />
//                         <span>{renderValue(selectedOrder.customer.phone_no)}</span>
//                       </div>
//                     )}
//                     {selectedOrder.customer.email && (
//                       <div className="da-info-row">
//                         <span className="da-customer-email">{renderValue(selectedOrder.customer.email)}</span>
//                       </div>
//                     )}

//                     {selectedOrder.delivery_address && (
//                       <div className="da-address-box">
//                         <strong className="da-address-label">Address</strong>
//                         <div
//                           style={{
//                             display: 'grid',
//                             gridTemplateColumns: '1fr 1fr',
//                             gap: '10px 18px',
//                             marginTop: 8,
//                           }}
//                         >
//                           {getAddressFields(selectedOrder.delivery_address).map((f) => (
//                             <div key={f.label}>
//                               <span
//                                 style={{
//                                   display: 'block',
//                                   fontSize: 10.5,
//                                   fontWeight: 700,
//                                   color: '#94a3b8',
//                                   textTransform: 'uppercase',
//                                   letterSpacing: '0.5px',
//                                   marginBottom: 2,
//                                 }}
//                               >
//                                 {f.label}
//                               </span>
//                               <span style={{ fontSize: 13, color: '#1e293b', fontWeight: 500 }}>
//                                 {renderValue(f.value)}
//                               </span>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}

//                   </div>
//                 </div>
//               )}

//               {selectedOrder.driver && (
//                 <div className="da-modal-section">
//                   <h5 className="da-modal-section-title">Assigned Driver</h5>
//                   <div className="da-modal-driver-tag">
//                     <IconTruck size={14} />
//                     <span>
//                       {`${selectedOrder.driver.first_name || ''} ${selectedOrder.driver.last_name || ''}`.trim()}
//                     </span>
//                     {selectedOrder.driver.phone_no && (
//                       <span className="da-driver-phone-modal">· {selectedOrder.driver.phone_no}</span>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {(selectedOrder.status === 'DELIVERY_SUBMITTED' || selectedOrder.delivery_photo) && (
//                 <div className="da-modal-section da-proof-section">
//                   <h5 className="da-modal-section-title">Delivery Proof from Driver</h5>
//                   {selectedOrder.delivery_photo && (
                    
//                       href={selectedOrder.delivery_photo}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="da-proof-photo-link"
//                     >
//                       <IconImage size={14} /> View Photo ↗
//                     </a>
//                   )}
//                   {selectedOrder.delivery_notes && (
//                     <p className="da-proof-notes">
//                       <strong>Driver note:</strong> {selectedOrder.delivery_notes}
//                     </p>
//                   )}
//                   {selectedOrder.customer_confirmation_name && (
//                     <p className="da-proof-notes">
//                       <strong>Received by:</strong> {selectedOrder.customer_confirmation_name}
//                       {selectedOrder.customer_confirmation_phone
//                         ? ` · ${selectedOrder.customer_confirmation_phone}`
//                         : ''}
//                     </p>
//                   )}
//                   {selectedOrder.driver_submitted_at && (
//                     <p className="da-proof-notes">
//                       <strong>Submitted:</strong>{' '}
//                       {new Date(selectedOrder.driver_submitted_at).toLocaleString()}
//                     </p>
//                   )}
//                 </div>
//               )}

//               <div className="da-modal-section">
//                 <h5 className="da-modal-section-title">Order Items</h5>
//                 <div className="da-modal-items">
//                   {(selectedOrder.items || []).map((item: any, idx: number) => {
//                     const displayName = getItemDisplayName(item);
//                     const displayImage = getItemDisplayImage(item);
//                     const displayDescription = getItemDisplayDescription(item);
//                     const flavour = getFlavour(item);
//                     const variant = getVariant(item);
//                     const shape = getShape(item);
//                     const addOns = getAddOns(item);
//                     const itemNotes = getItemNotes(item);

//                     return (
//                       <div key={item.id || idx} className="da-modal-item-row">
//                         <div className="da-modal-item-left">
//                           <span className="da-modal-qty">×{item.quantity}</span>
//                           <div className="da-modal-item-with-thumb">
//                             {displayImage && (
//                               <div className="da-item-thumb">
//                                 <img
//                                   src={displayImage}
//                                   alt={displayName}
//                                   onError={(e: any) => { e.target.style.display = 'none'; }}
//                                 />
//                               </div>
//                             )}
//                             <div>
//                               <p className="da-modal-item-name">{displayName}</p>
//                               {displayDescription && (
//                                 <p className="da-modal-item-desc">{displayDescription}</p>
//                               )}

//                               {(flavour || variant || shape) && (
//                                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
//                                   {flavour && (
//                                     <span style={{ fontSize: 11, background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 5, padding: '1px 7px' }}>
//                                       Flavour: <strong>{flavour}</strong>
//                                     </span>
//                                   )}
//                                   {variant && (
//                                     <span style={{ fontSize: 11, background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 5, padding: '1px 7px' }}>
//                                       Variant: <strong>{variant}</strong>
//                                     </span>
//                                   )}
//                                   {shape && (
//                                     <span style={{ fontSize: 11, background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 5, padding: '1px 7px' }}>
//                                       Shape: <strong>{shape}</strong>
//                                     </span>
//                                   )}
//                                 </div>
//                               )}

//                               {addOns.length > 0 && (
//                                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
//                                   {addOns.map((addOn, i) => (
//                                     <span key={i} style={{ fontSize: 11, background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 5, padding: '1px 7px' }}>
//                                       {addOn}
//                                     </span>
//                                   ))}
//                                 </div>
//                               )}

//                               {itemNotes && (
//                                 <p style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
//                                   <strong>Instruction:</strong> "{itemNotes}"
//                                 </p>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                         <span className="da-modal-item-price">
//                           {fmtCurrency(item.line_total || (item.price * item.quantity) || 0, selectedOrder?.currency)}
//                         </span>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>

//               {getOrderAddons(selectedOrder).length > 0 && (
//                 <div className="da-modal-section">
//                   <h5 className="da-modal-section-title">Order Add-ons</h5>
//                   <div className="da-modal-items">
//                     {getOrderAddons(selectedOrder).map((addon: any, idx: number) => (
//                       <div key={`addon-${idx}`} className="da-modal-item-row">
//                         <div className="da-modal-item-left">
//                           <span className="da-modal-qty">×{addon.quantity ?? 1}</span>
//                           <p className="da-modal-item-name">
//                             {addon.addon_name || addon.addonName || addon.name || `Addon #${addon.addon_id ?? addon.addonId ?? idx + 1}`}
//                           </p>
//                         </div>
//                         <span className="da-modal-item-price">
//                           {fmtCurrency(addon.total ?? (addon.price * addon.quantity), selectedOrder.currency)}
//                         </span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {(() => {
//                 const customCake = getCustomCakeDetails(selectedOrder);
//                 if (!customCake) return null;
//                 return (
//                   <div className="da-modal-section" style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: 12 }}>
//                     <h5 className="da-modal-section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//                       <IconCake size={14} /> Custom Cake Details
//                     </h5>
//                     <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 6 }}>
//                       {customCake.image && (
//                         <img
//                           src={customCake.image}
//                           alt="Custom cake reference"
//                           style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 8, border: '1px solid #fde68a' }}
//                           onError={(e: any) => { e.target.style.display = 'none'; }}
//                         />
//                       )}
//                       <div className="da-modal-info-grid" style={{ flex: 1, minWidth: 200 }}>
//                         <div className="da-info-row"><span>Flavour: <strong>{customCake.flavour ?? '—'}</strong></span></div>
//                         <div className="da-info-row"><span>Weight: <strong>{customCake.weight ?? '—'}</strong></span></div>
//                         <div className="da-info-row"><span>Shape: <strong>{customCake.shape ?? '—'}</strong></span></div>
//                         <div className="da-info-row"><span>Size: <strong>{customCake.size ?? '—'}</strong></span></div>
//                         <div className="da-info-row"><span>Colour: <strong>{customCake.colour ?? '—'}</strong></span></div>
//                         <div className="da-info-row"><span>Est. price: <strong>{customCake.price != null ? fmtCurrency(customCake.price, selectedOrder.currency) : '—'}</strong></span></div>
//                       </div>
//                     </div>
//                     {customCake.message && (
//                       <p style={{ fontSize: 12, marginTop: 8 }}>
//                         <strong>Cake message:</strong> "{customCake.message}"
//                       </p>
//                     )}
//                     {customCake.notes && (
//                       <p style={{ fontSize: 12, marginTop: 4 }}>
//                         <strong>Customization notes:</strong> {customCake.notes}
//                       </p>
//                     )}
//                   </div>
//                 );
//               })()}

//               {selectedOrder.delivery_notes && selectedOrder.status !== 'DELIVERY_SUBMITTED' && (
//                 <div className="da-modal-notes">
//                   <h5 className="da-modal-section-title">Delivery Notes</h5>
//                   <p className="da-modal-notes-text">"{selectedOrder.delivery_notes}"</p>
//                 </div>
//               )}

//               <div className="da-modal-totals">
//                 <div className="da-total-row">
//                   <span>Subtotal</span><span>{fmtCurrency(selectedOrder.subtotal, selectedOrder.currency)}</span>
//                 </div>
//                 {getOrderAddonTotal(selectedOrder) > 0 && (
//                   <div className="da-total-row">
//                     <span>Add-ons</span><span>{fmtCurrency(getOrderAddonTotal(selectedOrder), selectedOrder.currency)}</span>
//                   </div>
//                 )}
//                 <div className="da-total-row">
//                   <span>Delivery</span><span>{fmtCurrency(selectedOrder.delivery_charge, selectedOrder.currency)}</span>
//                 </div>
//                 {selectedOrder.discount > 0 && (
//                   <div className="da-total-row da-total-discount">
//                     <span>Discount</span><span>−{fmtCurrency(selectedOrder.discount, selectedOrder.currency)}</span>
//                   </div>
//                 )}
//                 <div className="da-total-row da-total-grand">
//                   <span>Total</span>
//                   <strong>{fmtCurrency(selectedOrder.grand_total || selectedOrder.total || 0, selectedOrder.currency)}</strong>
//                 </div>
//               </div>
//             </div>

//             <div className="da-modal-footer">
//               <button className="da-modal-print" onClick={() => handleOpenReceipt(selectedOrder)}>
//                 <IconPrinter size={13} style={{ marginRight: 5 }} /> Print Receipt
//               </button>
//               <button className="da-modal-cancel" onClick={() => setModalOpen(false)}>Close</button>
//               {renderActionBtn(selectedOrder, true)}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ─── Driver Assignment Modal ────────────────────────────────────── */}
//       {driverModalOpen && (
//         <div className="da-modal-backdrop" onClick={() => { setDriverModalOpen(false); setAssignSuccess(null); }}>
//           <div className="da-modal-card da-driver-modal" onClick={e => e.stopPropagation()}>
//             <div className="da-modal-header">
//               <div>
//                 <h3>Assign Driver</h3>
//                 {assignTargetOrder && (
//                   <p className="da-modal-sub">
//                     Order #{assignTargetOrder.order_number || assignTargetOrder.id}
//                     {assignTargetOrder.customer && (
//                       <span>
//                         {' · '}{assignTargetOrder.customer.first_name} {assignTargetOrder.customer.last_name}
//                       </span>
//                     )}
//                   </p>
//                 )}
//               </div>
//               <button
//                 className="da-modal-close"
//                 onClick={() => { setDriverModalOpen(false); setAssignSuccess(null); }}
//               >
//                 <IconX size={16} />
//               </button>
//             </div>

//             <div className="da-modal-body">
//               {assignSuccess && (
//                 <div className="da-assign-success">
//                   <IconCheckCircle size={18} /><span>{assignSuccess}</span>
//                 </div>
//               )}

//               {driverLoading ? (
//                 <div className="da-center-loader" style={{ minHeight: 180 }}>
//                   <div className="da-spinner" /><p>Loading available drivers…</p>
//                 </div>
//               ) : drivers.length === 0 ? (
//                 <div className="da-empty-state" style={{ padding: '40px 20px' }}>
//                   <IconUser size={40} />
//                   <h3>No Drivers Found</h3>
//                   <p>No drivers are registered yet, or all are currently on deliveries.</p>
//                 </div>
//               ) : (
//                 <>
//                   <div className="da-driver-search">
//                     <IconSearch size={15} />
//                     <input
//                       type="text"
//                       placeholder="Search by name or phone…"
//                       value={driverSearch}
//                       onChange={e => setDriverSearch(e.target.value)}
//                     />
//                   </div>

//                   <div className="da-driver-list-header">
//                     <p className="da-driver-list-hint">
//                       {filteredDrivers.length} driver{filteredDrivers.length !== 1 ? 's' : ''}
//                       {driverSearch ? ' found' : ''} — tap to assign
//                     </p>
//                     <div className="da-driver-legend">
//                       <span className="da-legend-dot ds-available" /> Available
//                       <span className="da-legend-dot ds-busy" /> Busy
//                       <span className="da-legend-dot ds-offline" /> Offline
//                     </div>
//                   </div>

//                   <div className="da-driver-list">
//                     {filteredDrivers.length === 0 ? (
//                       <div className="da-driver-no-results">
//                         <p>No drivers match "{driverSearch}"</p>
//                       </div>
//                     ) : (
//                       filteredDrivers.map(driver => {
//                         const rawStatus   = driver.availability_status || driver.status || 'OFFLINE';
//                         const dStatus     = rawStatus.toUpperCase();
//                         const isAssigning = assigningDriver === driver.id;
//                         const isDisabled  = assigningDriver !== null && !isAssigning;

//                         return (
//                           <div
//                             key={driver.id}
//                             className={[
//                               'da-driver-card',
//                               dStatus === 'ONLINE' || dStatus === 'AVAILABLE' ? 'da-driver-available' : '',
//                               isAssigning ? 'da-driver-assigning' : '',
//                               isDisabled  ? 'da-driver-disabled'  : '',
//                             ].join(' ')}
//                             onClick={() => !isAssigning && !isDisabled && handleAssignDriver(driver)}
//                           >
//                             <div className="da-driver-avatar">
//                               {(driver.first_name || driver.name || 'D').charAt(0).toUpperCase()}
//                             </div>
//                             <div className="da-driver-info">
//                               <p className="da-driver-name">
//                                 {driver.first_name || driver.name || 'Driver'}
//                                 {driver.last_name ? ` ${driver.last_name}` : ''}
//                               </p>
//                               <div className="da-driver-meta">
//                                 {driver.phone_no && (
//                                   <span className="da-driver-phone">
//                                     <IconPhone size={11} />{driver.phone_no}
//                                   </span>
//                                 )}
//                                 {driver.rating > 0 && (
//                                   <span className="da-driver-rating">
//                                     <IconStar size={11} />{Number(driver.rating).toFixed(1)}
//                                   </span>
//                                 )}
//                               </div>
//                             </div>
//                             <div className="da-driver-right">
//                               <span className={`da-driver-status ${driverStatusClass(dStatus)}`}>
//                                 {driverStatusLabel(dStatus)}
//                               </span>
//                               {isAssigning ? (
//                                 <div className="da-spinner da-spinner-sm" />
//                               ) : (
//                                 <button
//                                   className="da-assign-btn"
//                                   disabled={isDisabled}
//                                   onClick={e => { e.stopPropagation(); handleAssignDriver(driver); }}
//                                 >
//                                   Assign
//                                 </button>
//                               )}
//                             </div>
//                           </div>
//                         );
//                       })
//                     )}
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ─── Confirm Delivery Modal ─────────────────────────────────────── */}
//       {confirmModalOpen && confirmTarget && (
//         <div className="da-modal-backdrop" onClick={() => setConfirmModalOpen(false)}>
//           <div className="da-modal-card da-confirm-modal" onClick={e => e.stopPropagation()}>
//             <div className="da-modal-header">
//               <div>
//                 <h3>Confirm Delivery</h3>
//                 <p className="da-modal-sub">
//                   Order #{confirmTarget.order_number || confirmTarget.id}
//                 </p>
//               </div>
//               <button className="da-modal-close" onClick={() => setConfirmModalOpen(false)}>
//                 <IconX size={16} />
//               </button>
//             </div>
//             <div className="da-modal-body">
//               <div className="da-confirm-desc">
//                 <p>
//                   Driver <strong>
//                     {confirmTarget.driver
//                       ? `${confirmTarget.driver.first_name || ''} ${confirmTarget.driver.last_name || ''}`.trim()
//                       : 'your driver'}
//                   </strong> has submitted delivery proof for this order.
//                 </p>
//                 <p>Review the proof below and confirm to mark it as <strong>DELIVERED</strong>.</p>
//               </div>

//               {confirmTarget.delivery_photo && (
                
//                   href={confirmTarget.delivery_photo}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="da-proof-photo-link"
//                 >
//                   <IconImage size={14} /> View delivery photo ↗
//                 </a>
//               )}
//               {confirmTarget.delivery_notes && (
//                 <p className="da-proof-notes">
//                   <strong>Driver note:</strong> {confirmTarget.delivery_notes}
//                 </p>
//               )}
//               {confirmTarget.customer_confirmation_name && (
//                 <p className="da-proof-notes">
//                   <strong>Received by:</strong> {confirmTarget.customer_confirmation_name}
//                 </p>
//               )}
//               {!confirmTarget.delivery_photo && !confirmTarget.delivery_notes && (
//                 <p className="da-proof-notes da-proof-none">No photo or notes submitted by driver.</p>
//               )}
//             </div>
//             <div className="da-modal-footer">
//               <button
//                 className="da-modal-cancel"
//                 disabled={actionLoading === confirmTarget.id}
//                 onClick={() => setConfirmModalOpen(false)}
//               >
//                 Cancel
//               </button>
//               <button
//                 className="da-action-primary bg-delivered"
//                 disabled={actionLoading === confirmTarget.id}
//                 onClick={handleConfirmDelivery}
//               >
//                 <IconCheckCircle size={14} />
//                 {actionLoading === confirmTarget.id ? 'Confirming…' : 'Confirm Delivered'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ─── Receipt Modal (new) ────────────────────────────────────────── */}
//       {isReceiptOpen && receiptOrder && (() => {
//         const order = receiptOrder;
//         const itemSubtotal = Number(
//           order.subtotal ??
//           (order.items || []).reduce((s: number, it: any) => s + Number(it.line_total ?? (it.price * it.quantity || 0)), 0)
//         );
//         const addonsTotal = getOrderAddonTotal(order);
//         const discount = Number(order.discount || 0);
//         const deliveryCharge = Number(order.delivery_charge ?? order.deliveryCharge ?? 0);
//         const grandTotal = Number(order.grand_total || order.total || (itemSubtotal + addonsTotal - discount + deliveryCharge));
//         const addressSummary = getAddressSummaryLine(order.delivery_address);

//         return (
//           <div className="da-modal-backdrop" onClick={() => setIsReceiptOpen(false)}>
//             <div
//               className="da-modal-card"
//               onClick={e => e.stopPropagation()}
//               style={{ maxWidth: 380 }}
//             >
//               <div className="da-modal-header">
//                 <h3>Print Receipt</h3>
//                 <button className="da-modal-close" onClick={() => setIsReceiptOpen(false)}>
//                   <IconX size={16} />
//                 </button>
//               </div>

//               <div
//                 style={{
//                   padding: '18px 22px',
//                   fontFamily: "'Courier New', Courier, monospace",
//                   fontSize: 12.5,
//                   color: '#1e293b',
//                 }}
//               >
//                 <div style={{ textAlign: 'center', marginBottom: 8 }}>
//                   <img
//                     src="/assets/logo.png"
//                     alt="Cake N Take"
//                     style={{ height: 42, marginBottom: 6 }}
//                   />
//                   <h2 style={{ margin: 0, fontSize: 16, letterSpacing: 1 }}>ORDER RECEIPT</h2>
//                   <p style={{ margin: '4px 0' }}>- - - - - - - - - - - - - - - - - - -</p>
//                 </div>

//                 <p style={{ margin: '3px 0' }}><strong>Order No:</strong> {order.order_number ?? order.id}</p>
//                 <p style={{ margin: '3px 0' }}><strong>Date:</strong> {fmtDateFull(order.created_at)}</p>
//                 <p style={{ margin: '3px 0' }}><strong>Time:</strong> {order.created_at ? new Date(order.created_at).toLocaleTimeString() : '—'}</p>
//                 {order.customer && (
//                   <p style={{ margin: '3px 0' }}>
//                     <strong>Customer:</strong> {order.customer.first_name} {order.customer.last_name}
//                   </p>
//                 )}
//                 {order.customer?.phone_no && (
//                   <p style={{ margin: '3px 0' }}><strong>Phone:</strong> {order.customer.phone_no}</p>
//                 )}
//                 {addressSummary && (
//                   <p style={{ margin: '3px 0' }}><strong>Address:</strong> {addressSummary}</p>
//                 )}
//                 {order.driver && (
//                   <p style={{ margin: '3px 0' }}>
//                     <strong>Driver:</strong> {`${order.driver.first_name || ''} ${order.driver.last_name || ''}`.trim()}
//                   </p>
//                 )}
//                 <p style={{ margin: '3px 0' }}><strong>Payment:</strong> {order.payment_method || '—'} {order.payment_status ? `(${order.payment_status})` : ''}</p>
//                 <p style={{ margin: '8px 0' }}>- - - - - - - - - - - - - - - - - - -</p>

//                 {(order.items || []).map((item: any, idx: number) => (
//                   <div key={item.id || idx} style={{ marginBottom: 5 }}>
//                     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//                       <span>{item.quantity} × {getItemDisplayName(item)}</span>
//                       <span>{fmtCurrency(item.line_total ?? (item.price * item.quantity), order.currency)}</span>
//                     </div>
//                     {getAddOns(item).length > 0 && (
//                       <div style={{ fontSize: 11, color: '#64748b', paddingLeft: 10 }}>
//                         Add-ons: {getAddOns(item).join(', ')}
//                       </div>
//                     )}
//                   </div>
//                 ))}

//                 {getOrderAddons(order).length > 0 && (
//                   <>
//                     <p style={{ margin: '6px 0' }}>-----------------------------------------</p>
//                     {getOrderAddons(order).map((addon: any, idx: number) => (
//                       <div key={`ra-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
//                         <span>{addon.quantity ?? 1} × {addon.addon_name || addon.addonName || `Addon #${addon.addon_id ?? addon.addonId ?? idx + 1}`}</span>
//                         <span>{fmtCurrency(addon.total ?? (addon.price * addon.quantity), order.currency)}</span>
//                       </div>
//                     ))}
//                   </>
//                 )}

//                 <p style={{ margin: '8px 0' }}>-----------------------------------------</p>

//                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
//                   <span>Subtotal:</span><span>{fmtCurrency(itemSubtotal, order.currency)}</span>
//                 </div>
//                 {addonsTotal > 0 && (
//                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
//                     <span>Add-ons:</span><span>{fmtCurrency(addonsTotal, order.currency)}</span>
//                   </div>
//                 )}
//                 {discount > 0 && (
//                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
//                     <span>Discount:</span><span>-{fmtCurrency(discount, order.currency)}</span>
//                   </div>
//                 )}
//                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
//                   <span>Delivery:</span><span>{fmtCurrency(deliveryCharge, order.currency)}</span>
//                 </div>
//                 <p style={{ margin: '8px 0' }}>-----------------------------------------</p>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 14 }}>
//                   <span>GRAND TOTAL:</span><span>{fmtCurrency(grandTotal, order.currency)}</span>
//                 </div>
//                 <p style={{ margin: '10px 0 0' }}>-----------------------------------------</p>

//                 <div style={{ textAlign: 'center', marginTop: 10, color: '#64748b' }}>
//                   <p style={{ margin: '2px 0' }}>Thank you for dining with CakeNTake!</p>
//                   <p style={{ margin: '2px 0' }}>Baked fresh daily, prepared artisanally.</p>
//                   <p style={{ margin: '2px 0' }}>www.cakentake.com</p>
//                 </div>
//               </div>

//               <div className="da-modal-footer">
//                 <button className="da-modal-print" onClick={() => window.print()}>
//                   <IconPrinter size={13} style={{ marginRight: 5 }} /> Print
//                 </button>
//                 <button className="da-modal-cancel" onClick={() => setIsReceiptOpen(false)}>Close</button>
//               </div>
//             </div>
//           </div>
//         );
//       })()}

//     </div>
//   );
// };

// export default DeliveryOrder;



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
const IconCake = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
    <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" />
    <path d="M12 3v4" />
    <path d="M12 7c-1.5 0-2-1-2-1.5S10.5 4 12 3c1.5 1 2 1.5 2 2.5S13.5 7 12 7z" />
  </svg>
);
const IconPrinter = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 9V2h12v7" />
    <rect x="6" y="13" width="12" height="9" rx="2" />
    <path d="M6 18h12" />
  </svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────

type TabType = 'all' | 'pending' | 'assigned' | 'driver_active' | 'proof_pending' | 'delivered';

// ─── Status helpers ───────────────────────────────────────────────────────────

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
const fmtDateFull = (dt: string) =>
  dt ? new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const currencySymbol = (cur?: string) => {
  const c = cur || (typeof window !== 'undefined' ? localStorage.getItem('currency') || 'INR' : 'INR');
  return c === 'INR' ? '₹' : c;
};

const fmtCurrency = (n: number | undefined, cur?: string) => `${currencySymbol(cur)}${Number(n || 0).toFixed(0)}`;

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

// ─── Address field helpers (object-safe) ───────────────────────────────────────
const getAddressAreaName = (address: any) => {
  const area = address?.area;
  if (area === undefined || area === null || area === '') return null;
  if (typeof area === 'object') return area.name ?? area.areaName ?? null;
  return area;
};

const getAddressCountryName = (address: any) => {
  const country = address?.country;
  if (country === undefined || country === null || country === '') return null;
  if (typeof country === 'object') return country.name ?? country.countryName ?? null;
  return country ?? address?.country_name ?? address?.country_code ?? null;
};

const getAddressFieldValue = (address: any, keys: string[]) => {
  for (const k of keys) {
    const v = address?.[k];
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return null;
};

const ADDRESS_FIELD_DEFS: { label: string; keys?: string[]; resolver?: (a: any) => any }[] = [
  { label: 'Area', resolver: getAddressAreaName },
  { label: 'Building', keys: ['building', 'building_name', 'building_no'] },
  { label: 'Block', keys: ['block', 'block_no'] },
  { label: 'Avenue', keys: ['avenue', 'avenue_name'] },
  { label: 'Street', keys: ['street', 'street_name'] },
  {
    label: 'Floor / Apt',
    resolver: (a: any) => {
      const floor = a?.floor;
      const apt = a?.apartment || a?.apt;
      if (!floor && !apt) return null;
      return [floor, apt].filter(Boolean).join(' ');
    },
  },
  { label: 'Country', resolver: getAddressCountryName },
  { label: 'City', keys: ['city'] },
  { label: 'Pincode', keys: ['pincode', 'zip', 'postal_code'] },
  { label: 'Address Notes', keys: ['address_notes', 'addressNotes', 'delivery_notes', 'notes', 'landmark'] },
];

const getAddressFields = (address: any) =>
  ADDRESS_FIELD_DEFS
    .map(({ label, keys, resolver }) => ({
      label,
      value: resolver ? resolver(address) : getAddressFieldValue(address, keys || []),
    }))
    .filter((f) => f.value !== null && f.value !== undefined && f.value !== '');

const getAddressSummaryLine = (address: any) => {
  if (!address) return null;
  const parts = [
    address.street,
    getAddressAreaName(address),
    address.city,
    address.pincode,
    getAddressCountryName(address),
  ].filter(Boolean);
  return parts.length ? parts.join(', ') : null;
};

// ─── Agent-exclusive item helpers ──────────────────────────────────────────────
const getItemCustomJson = (item: any) => item?.custom_json || {};

const isAgentExclusiveItem = (item: any) => getItemCustomJson(item)?.product_type === 'AGENT';

const getItemProductSource = (item: any) => {
  const agentProduct = item?.agent_product ?? {};
  const product = item?.product ?? {};
  return isAgentExclusiveItem(item) ? agentProduct : product;
};

const getItemDisplayName = (item: any) => {
  const source = getItemProductSource(item);
  return (
    source?.name ||
    item?.product_name ||
    item?.name ||
    (isAgentExclusiveItem(item) ? 'Agent Product' : 'Item')
  );
};

const getItemDisplayImage = (item: any) => {
  const source = getItemProductSource(item);
  return source?.image || source?.image_url || source?.imageUrl || item?.image || null;
};

const getItemDisplayDescription = (item: any) => {
  const source = getItemProductSource(item);
  return source?.description || null;
};

// ─── Item customization helpers (flavour / variant / shape / add-ons / notes) ──
interface ItemCustomJson {
  variant?: string;
  flavour?: string;
  flavor?: string;
  shape?: string;
  add_ons?: string[];
  addons?: string[];
  add_on_total?: number;
  notes?: string;
  product_type?: string;
}

const getCustomJson = (item: any): ItemCustomJson => item?.custom_json || {};

const getFlavour = (item: any) => {
  const cj = getCustomJson(item);
  return cj.flavour || cj.flavor || item?.flavour || item?.flavor || null;
};

const getVariant = (item: any) => {
  const cj = getCustomJson(item);
  return cj.variant || item?.variant || null;
};

const getShape = (item: any) => {
  const cj = getCustomJson(item);
  return cj.shape || item?.shape || null;
};

const getAddOns = (item: any): string[] => {
  const cj = getCustomJson(item);
  const list = cj.add_ons || cj.addons || item?.add_ons || item?.selected_add_ons || [];
  return Array.isArray(list) ? list : [];
};

const getItemNotes = (item: any) => {
  const cj = getCustomJson(item);
  return cj.notes || item?.notes || null;
};

// ─── Order add-ons (whole-order, not per-item) ─────────────────────────────────
const getOrderAddons = (order: any): any[] => {
  if (Array.isArray(order?.order_addons)) return order.order_addons;
  if (Array.isArray(order?.order_addons_json)) return order.order_addons_json;
  return [];
};

const getOrderAddonTotal = (order: any): number => {
  const addons = getOrderAddons(order);
  return Number(
    order?.order_addons_total ??
    addons.reduce((sum: number, addon: any) => sum + Number(addon.total ?? (addon.price * addon.quantity || 0)), 0)
  );
};

// ─── Custom cake helpers ────────────────────────────────────────────────────
const getCustomCakeDetails = (order: any) => {
  const customCake = order?.custom_cake_json ?? order?.custom_cake ?? null;
  if (!customCake || typeof customCake !== 'object') return null;
  return {
    image: customCake?.image || customCake?.image_url || null,
    flavour: customCake?.flavour || customCake?.flavor || null,
    weight: customCake?.weight || null,
    shape: customCake?.shape || null,
    size: customCake?.size || null,
    colour: customCake?.colour || customCake?.color || null,
    message: customCake?.message || null,
    notes: customCake?.notes || null,
    price: customCake?.price != null ? Number(customCake.price) : null,
  };
};

const isCustomCakeOrder = (order: any) => !!getCustomCakeDetails(order);

// ─── Order origin helpers (user / sales agent / agent) ─────────────────────
const getOrderCreatedByRole = (order: any) =>
  order?.created_by?.role ?? order?.created_by_role ?? order?.createdByRole ?? null;

const isSalesAgentOrder = (order: any) => {
  const role = getOrderCreatedByRole(order);
  const source = order?.order_source ?? order?.orderSource;
  const orderType = String(order?.order_type ?? '').toLowerCase();
  return role === 'SALES_AGENT' || source === 'SALES_AGENT' || orderType === 'sales_agent';
};

const isAgentOrder = (order: any) => {
  if (isSalesAgentOrder(order)) return false;
  const role = getOrderCreatedByRole(order);
  const source = order?.order_source ?? order?.orderSource;
  return source === 'AGENT' || role === 'AGENT';
};

const getOrderOriginCardClass = (order: any) => {
  if (isSalesAgentOrder(order)) return 'card-sales-agent';
  if (isAgentOrder(order)) return 'card-agent-order';
  return '';
};

// ─── Component ────────────────────────────────────────────────────────────────

const DeliveryOrder: React.FC = () => {

  // ── State ──────────────────────────────────────────────────────────────────

  const [activeTab,        setActiveTab]        = useState<TabType>('all');

  const [pendingOrders,      setPendingOrders]      = useState<any[]>([]);
  const [assignedOrders,     setAssignedOrders]     = useState<any[]>([]);
  const [driverActiveOrders, setDriverActiveOrders] = useState<any[]>([]);
  const [proofOrders,        setProofOrders]        = useState<any[]>([]);
  const [deliveredOrders,    setDeliveredOrders]    = useState<any[]>([]);

  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error,         setError]         = useState<string | null>(null);
  const [successMsg,    setSuccessMsg]    = useState<string | null>(null);

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [modalOpen,     setModalOpen]     = useState(false);

  const [driverModalOpen,   setDriverModalOpen]   = useState(false);
  const [assignTargetOrder, setAssignTargetOrder] = useState<any | null>(null);
  const [drivers,           setDrivers]           = useState<any[]>([]);
  const [filteredDrivers,   setFilteredDrivers]   = useState<any[]>([]);
  const [driverLoading,     setDriverLoading]     = useState(false);
  const [assigningDriver,   setAssigningDriver]   = useState<number | null>(null);
  const [driverSearch,      setDriverSearch]      = useState('');
  const [assignSuccess,     setAssignSuccess]     = useState<string | null>(null);

  const [confirmModalOpen,  setConfirmModalOpen]  = useState(false);
  const [confirmTarget,     setConfirmTarget]     = useState<any | null>(null);

  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptOrder,  setReceiptOrder]  = useState<any | null>(null);

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
    (() => {
      const combined = [...pendingOrders, ...assignedOrders, ...driverActiveOrders, ...proofOrders, ...deliveredOrders];
      const byId = new Map<number | string, any>();
      for (const o of combined) {
        const key = o?.id ?? Math.random();
        if (!byId.has(key)) {
          byId.set(key, o);
        } else {
          const existing = byId.get(key);
          try {
            const exTime = existing?.created_at ? new Date(existing.created_at).getTime() : 0;
            const newTime = o?.created_at ? new Date(o.created_at).getTime() : 0;
            if (newTime > exTime) byId.set(key, o);
          } catch (e) {
            byId.set(key, o);
          }
        }
      }
      return Array.from(byId.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    })(),
    [pendingOrders, assignedOrders, driverActiveOrders, proofOrders, deliveredOrders]
  );

  const getDeliverySchedule = (order: any) => {
    const rawDate = order?.expected_delivery_date || order?.delivery_date || order?.deliveryDate || null;
    const time = order?.time_slot || order?.delivery_time_slot || order?.deliveryTimeSlot || null;

    let isToday = false;
    if (rawDate) {
      const d = new Date(rawDate);
      const now = new Date();
      isToday = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
    }

    return {
      dateLabel: rawDate ? fmtDate(rawDate) : null,
      time,
      isToday,
    };
  };

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

  // ── Open receipt modal ────────────────────────────────────────────────────

  const handleOpenReceipt = (order: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setReceiptOrder(order);
    setIsReceiptOpen(true);
  };

  // ── Render action buttons per order status ────────────────────────────────

  const renderActionBtn = (order: any, fromModal = false) => {
    const status    = (order.status || '').toUpperCase();
    const isLoading = actionLoading === order.id;

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

    if (status === 'DRIVER_ACCEPTED' || status === 'OUT_FOR_DELIVERY') {
      return (
        <span className="da-info-chip">
          <IconTruck size={12} /> Driver en route
        </span>
      );
    }

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

      {successMsg && (
        <div className="da-toast-success">
          <IconCheckCircle size={16} /><span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="da-error-banner">
          <IconAlert size={16} /><span>{error}</span>
          <button onClick={() => setError(null)} className="da-error-dismiss">✕</button>
        </div>
      )}

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

      {/* Legend for order origin highlights */}
      <div className="da-legend-row">
        <span className="da-legend-item">
          <span className="da-legend-swatch swatch-user" /> Customer order
        </span>
        <span className="da-legend-item">
          <span className="da-legend-swatch swatch-sales-agent" /> Sales agent order
        </span>
        <span className="da-legend-item">
          <span className="da-legend-swatch swatch-agent-order" /> Agent order
        </span>
      </div>

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
            const orderIsCustomCake = isCustomCakeOrder(order);
            const schedule = getDeliverySchedule(order)
            const addressSummary = getAddressSummaryLine(addr);
            const originCardClass = getOrderOriginCardClass(order);

            return (
              <div
                key={order.id}
                className={`da-order-card ${schedule.isToday ? 'card-due-today' : ''} ${originCardClass}`}
                onClick={() => { setSelectedOrder(order); setModalOpen(true); }}
              >
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

                {(schedule.dateLabel || schedule.time) && (
                  <div className={`da-schedule-row ${schedule.isToday ? 'is-today' : ''}`}>
                    <IconClock size={12} />
                    <span className="da-schedule-label">Expected:</span>
                    <span className="da-schedule-value">
                      {schedule.dateLabel || 'Date TBD'}
                      {schedule.time && <> · {schedule.time}</>}
                    </span>
                    {schedule.isToday && <span className="da-schedule-today-tag">Today</span>}
                  </div>
                )}

                {orderIsCustomCake && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#b45309',
                      background: '#fef3c7',
                      border: '1px solid #fde68a',
                      borderRadius: 6,
                      padding: '2px 8px',
                      marginBottom: 6,
                      width: 'fit-content',
                    }}
                  >
                    <IconCake size={11} /> Custom Cake Order
                  </div>
                )}

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
                    {addressSummary && (
                      <div className="da-meta-row">
                        <IconMapPin size={12} />
                        <span>{addressSummary}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="da-card-items">
                  {(order.items || []).slice(0, 3).map((item: any, idx: number) => (
                    <div key={item.id || idx} className="da-item-line">
                      <span className="da-item-qty">×{item.quantity}</span>
                      <span className="da-item-name">{getItemDisplayName(item)}</span>
                    </div>
                  ))}
                  {(order.items || []).length > 3 && (
                    <span className="da-item-more">+{order.items.length - 3} more</span>
                  )}
                </div>

                {order.driver && (
                  <div className="da-driver-tag">
                    <IconTruck size={11} />
                    <span>
                      {`${order.driver.first_name || ''} ${order.driver.last_name || ''}`.trim() || 'Driver assigned'}
                    </span>
                  </div>
                )}

                {status === 'DELIVERY_SUBMITTED' && (
                  <div className="da-proof-tag">
                    <IconImage size={11} />
                    <span>Driver submitted delivery proof</span>
                  </div>
                )}

                {(order.grand_total || order.total) && (
                  <div className="da-card-total">
                    <span>Total</span>
                    <strong>{fmtCurrency(order.grand_total || order.total || 0, order.currency)}</strong>
                  </div>
                )}

                <div className="da-card-footer">
                  <button
                    className="da-view-btn"
                    onClick={e => { e.stopPropagation(); setSelectedOrder(order); setModalOpen(true); }}
                  >
                    <IconEye size={13} /> View
                  </button>
                  <button
                    className="da-view-btn"
                    onClick={e => handleOpenReceipt(order, e)}
                  >
                    <IconPrinter size={13} /> Receipt
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

              {isCustomCakeOrder(selectedOrder) && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#b45309',
                    background: '#fef3c7',
                    border: '1px solid #fde68a',
                    borderRadius: 6,
                    padding: '3px 10px',
                    margin: '10px 0',
                    width: 'fit-content',
                  }}
                >
                  <IconCake size={12} /> Custom Cake Order
                </div>
              )}

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
                        <strong className="da-address-label">Address</strong>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '10px 18px',
                            marginTop: 8,
                          }}
                        >
                          {getAddressFields(selectedOrder.delivery_address).map((f) => (
                            <div key={f.label}>
                              <span
                                style={{
                                  display: 'block',
                                  fontSize: 10.5,
                                  fontWeight: 700,
                                  color: '#94a3b8',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                  marginBottom: 2,
                                }}
                              >
                                {f.label}
                              </span>
                              <span style={{ fontSize: 13, color: '#1e293b', fontWeight: 500 }}>
                                {renderValue(f.value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              )}

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

              <div className="da-modal-section">
                <h5 className="da-modal-section-title">Order Items</h5>
                <div className="da-modal-items">
                  {(selectedOrder.items || []).map((item: any, idx: number) => {
                    const displayName = getItemDisplayName(item);
                    const displayImage = getItemDisplayImage(item);
                    const displayDescription = getItemDisplayDescription(item);
                    const flavour = getFlavour(item);
                    const variant = getVariant(item);
                    const shape = getShape(item);
                    const addOns = getAddOns(item);
                    const itemNotes = getItemNotes(item);

                    return (
                      <div key={item.id || idx} className="da-modal-item-row">
                        <div className="da-modal-item-left">
                          <span className="da-modal-qty">×{item.quantity}</span>
                          <div className="da-modal-item-with-thumb">
                            {displayImage && (
                              <div className="da-item-thumb">
                                <img
                                  src={displayImage}
                                  alt={displayName}
                                  onError={(e: any) => { e.target.style.display = 'none'; }}
                                />
                              </div>
                            )}
                            <div>
                              <p className="da-modal-item-name">{displayName}</p>
                              {displayDescription && (
                                <p className="da-modal-item-desc">{displayDescription}</p>
                              )}

                              {(flavour || variant || shape) && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                                  {flavour && (
                                    <span style={{ fontSize: 11, background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 5, padding: '1px 7px' }}>
                                      Flavour: <strong>{flavour}</strong>
                                    </span>
                                  )}
                                  {variant && (
                                    <span style={{ fontSize: 11, background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 5, padding: '1px 7px' }}>
                                      Variant: <strong>{variant}</strong>
                                    </span>
                                  )}
                                  {shape && (
                                    <span style={{ fontSize: 11, background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 5, padding: '1px 7px' }}>
                                      Shape: <strong>{shape}</strong>
                                    </span>
                                  )}
                                </div>
                              )}

                              {addOns.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                                  {addOns.map((addOn, i) => (
                                    <span key={i} style={{ fontSize: 11, background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 5, padding: '1px 7px' }}>
                                      {addOn}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {itemNotes && (
                                <p style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                                  <strong>Instruction:</strong> "{itemNotes}"
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className="da-modal-item-price">
                          {fmtCurrency(item.line_total || (item.price * item.quantity) || 0, selectedOrder?.currency)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {getOrderAddons(selectedOrder).length > 0 && (
                <div className="da-modal-section">
                  <h5 className="da-modal-section-title">Order Add-ons</h5>
                  <div className="da-modal-items">
                    {getOrderAddons(selectedOrder).map((addon: any, idx: number) => (
                      <div key={`addon-${idx}`} className="da-modal-item-row">
                        <div className="da-modal-item-left">
                          <span className="da-modal-qty">×{addon.quantity ?? 1}</span>
                          <p className="da-modal-item-name">
                            {addon.addon_name || addon.addonName || addon.name || `Addon #${addon.addon_id ?? addon.addonId ?? idx + 1}`}
                          </p>
                        </div>
                        <span className="da-modal-item-price">
                          {fmtCurrency(addon.total ?? (addon.price * addon.quantity), selectedOrder.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(() => {
                const customCake = getCustomCakeDetails(selectedOrder);
                if (!customCake) return null;
                return (
                  <div className="da-modal-section" style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: 12 }}>
                    <h5 className="da-modal-section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <IconCake size={14} /> Custom Cake Details
                    </h5>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 6 }}>
                      {customCake.image && (
                        <img
                          src={customCake.image}
                          alt="Custom cake reference"
                          style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 8, border: '1px solid #fde68a' }}
                          onError={(e: any) => { e.target.style.display = 'none'; }}
                        />
                      )}
                      <div className="da-modal-info-grid" style={{ flex: 1, minWidth: 200 }}>
                        <div className="da-info-row"><span>Flavour: <strong>{customCake.flavour ?? '—'}</strong></span></div>
                        <div className="da-info-row"><span>Weight: <strong>{customCake.weight ?? '—'}</strong></span></div>
                        <div className="da-info-row"><span>Shape: <strong>{customCake.shape ?? '—'}</strong></span></div>
                        <div className="da-info-row"><span>Size: <strong>{customCake.size ?? '—'}</strong></span></div>
                        <div className="da-info-row"><span>Colour: <strong>{customCake.colour ?? '—'}</strong></span></div>
                        <div className="da-info-row"><span>Est. price: <strong>{customCake.price != null ? fmtCurrency(customCake.price, selectedOrder.currency) : '—'}</strong></span></div>
                      </div>
                    </div>
                    {customCake.message && (
                      <p style={{ fontSize: 12, marginTop: 8 }}>
                        <strong>Cake message:</strong> "{customCake.message}"
                      </p>
                    )}
                    {customCake.notes && (
                      <p style={{ fontSize: 12, marginTop: 4 }}>
                        <strong>Customization notes:</strong> {customCake.notes}
                      </p>
                    )}
                  </div>
                );
              })()}

              {selectedOrder.delivery_notes && selectedOrder.status !== 'DELIVERY_SUBMITTED' && (
                <div className="da-modal-notes">
                  <h5 className="da-modal-section-title">Delivery Notes</h5>
                  <p className="da-modal-notes-text">"{selectedOrder.delivery_notes}"</p>
                </div>
              )}

              <div className="da-modal-totals">
                <div className="da-total-row">
                  <span>Subtotal</span><span>{fmtCurrency(selectedOrder.subtotal, selectedOrder.currency)}</span>
                </div>
                {getOrderAddonTotal(selectedOrder) > 0 && (
                  <div className="da-total-row">
                    <span>Add-ons</span><span>{fmtCurrency(getOrderAddonTotal(selectedOrder), selectedOrder.currency)}</span>
                  </div>
                )}
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
              <button className="da-modal-print" onClick={() => handleOpenReceipt(selectedOrder)}>
                <IconPrinter size={13} style={{ marginRight: 5 }} /> Print Receipt
              </button>
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
                  <div className="da-driver-search">
                    <IconSearch size={15} />
                    <input
                      type="text"
                      placeholder="Search by name or phone…"
                      value={driverSearch}
                      onChange={e => setDriverSearch(e.target.value)}
                    />
                  </div>

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

      {/* ─── Receipt Modal (new) ────────────────────────────────────────── */}
      {isReceiptOpen && receiptOrder && (() => {
        const order = receiptOrder;
        const itemSubtotal = Number(
          order.subtotal ??
          (order.items || []).reduce((s: number, it: any) => s + Number(it.line_total ?? (it.price * it.quantity || 0)), 0)
        );
        const addonsTotal = getOrderAddonTotal(order);
        const discount = Number(order.discount || 0);
        const deliveryCharge = Number(order.delivery_charge ?? order.deliveryCharge ?? 0);
        const grandTotal = Number(order.grand_total || order.total || (itemSubtotal + addonsTotal - discount + deliveryCharge));
        const addressSummary = getAddressSummaryLine(order.delivery_address);

        return (
          <div className="da-modal-backdrop" onClick={() => setIsReceiptOpen(false)}>
            <div
              className="da-modal-card"
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: 380 }}
            >
              <div className="da-modal-header">
                <h3>Print Receipt</h3>
                <button className="da-modal-close" onClick={() => setIsReceiptOpen(false)}>
                  <IconX size={16} />
                </button>
              </div>

              <div
                style={{
                  padding: '18px 22px',
                  fontFamily: "'Courier New', Courier, monospace",
                  fontSize: 12.5,
                  color: '#1e293b',
                }}
              >
                <div style={{ textAlign: 'center', marginBottom: 8 }}>
                  <img
                    src="/assets/logo.png"
                    alt="Cake N Take"
                    style={{ height: 42, marginBottom: 6 }}
                  />
                  <h2 style={{ margin: 0, fontSize: 16, letterSpacing: 1 }}>ORDER RECEIPT</h2>
                  <p style={{ margin: '4px 0' }}>- - - - - - - - - - - - - - - - - - -</p>
                </div>

                <p style={{ margin: '3px 0' }}><strong>Order No:</strong> {order.order_number ?? order.id}</p>
                <p style={{ margin: '3px 0' }}><strong>Date:</strong> {fmtDateFull(order.created_at)}</p>
                <p style={{ margin: '3px 0' }}><strong>Time:</strong> {order.created_at ? new Date(order.created_at).toLocaleTimeString() : '—'}</p>
                {order.customer && (
                  <p style={{ margin: '3px 0' }}>
                    <strong>Customer:</strong> {order.customer.first_name} {order.customer.last_name}
                  </p>
                )}
                {order.customer?.phone_no && (
                  <p style={{ margin: '3px 0' }}><strong>Phone:</strong> {order.customer.phone_no}</p>
                )}
                {addressSummary && (
                  <p style={{ margin: '3px 0' }}><strong>Address:</strong> {addressSummary}</p>
                )}
                {order.driver && (
                  <p style={{ margin: '3px 0' }}>
                    <strong>Driver:</strong> {`${order.driver.first_name || ''} ${order.driver.last_name || ''}`.trim()}
                  </p>
                )}
                <p style={{ margin: '3px 0' }}><strong>Payment:</strong> {order.payment_method || '—'} {order.payment_status ? `(${order.payment_status})` : ''}</p>
                <p style={{ margin: '8px 0' }}>- - - - - - - - - - - - - - - - - - -</p>

                {(order.items || []).map((item: any, idx: number) => (
                  <div key={item.id || idx} style={{ marginBottom: 5 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{item.quantity} × {getItemDisplayName(item)}</span>
                      <span>{fmtCurrency(item.line_total ?? (item.price * item.quantity), order.currency)}</span>
                    </div>
                    {getAddOns(item).length > 0 && (
                      <div style={{ fontSize: 11, color: '#64748b', paddingLeft: 10 }}>
                        Add-ons: {getAddOns(item).join(', ')}
                      </div>
                    )}
                  </div>
                ))}

                {getOrderAddons(order).length > 0 && (
                  <>
                    <p style={{ margin: '6px 0' }}>-----------------------------------------</p>
                    {getOrderAddons(order).map((addon: any, idx: number) => (
                      <div key={`ra-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                        <span>{addon.quantity ?? 1} × {addon.addon_name || addon.addonName || `Addon #${addon.addon_id ?? addon.addonId ?? idx + 1}`}</span>
                        <span>{fmtCurrency(addon.total ?? (addon.price * addon.quantity), order.currency)}</span>
                      </div>
                    ))}
                  </>
                )}

                <p style={{ margin: '8px 0' }}>-----------------------------------------</p>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span>Subtotal:</span><span>{fmtCurrency(itemSubtotal, order.currency)}</span>
                </div>
                {addonsTotal > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span>Add-ons:</span><span>{fmtCurrency(addonsTotal, order.currency)}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span>Discount:</span><span>-{fmtCurrency(discount, order.currency)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span>Delivery:</span><span>{fmtCurrency(deliveryCharge, order.currency)}</span>
                </div>
                <p style={{ margin: '8px 0' }}>-----------------------------------------</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 14 }}>
                  <span>GRAND TOTAL:</span><span>{fmtCurrency(grandTotal, order.currency)}</span>
                </div>
                <p style={{ margin: '10px 0 0' }}>-----------------------------------------</p>

                <div style={{ textAlign: 'center', marginTop: 10, color: '#64748b' }}>
                  <p style={{ margin: '2px 0' }}>Thank you for dining with CakeNTake!</p>
                  <p style={{ margin: '2px 0' }}>Baked fresh daily, prepared artisanally.</p>
                  <p style={{ margin: '2px 0' }}>www.cakentake.com</p>
                </div>
              </div>

              <div className="da-modal-footer">
                <button className="da-modal-print" onClick={() => window.print()}>
                  <IconPrinter size={13} style={{ marginRight: 5 }} /> Print
                </button>
                <button className="da-modal-cancel" onClick={() => setIsReceiptOpen(false)}>Close</button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
};

export default DeliveryOrder;