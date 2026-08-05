// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import './KitchenOrder.css';
// import {
//   getKitchenPending,
//   getKitchenProcessing,
//   getKitchenCompleted,
//   getKitchenOrderDetails,
//   startProcessing,
//   completeKitchenOrder,
//   filterMyCompletedOrders,
//   KitchenOrder as KitchenOrderRecord,
// } from '../../services/kitchenService';

// /* ─── SVG Icons ──────────────────────────────────────────────────────────────── */
// const IconChef = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
//     <path d="M6 18h12a2 2 0 0 0 2-2v-3H4v3a2 2 0 0 0 2 2z" />
//     <path d="M12 2v3" />
//     <path d="M9 3v2" />
//     <path d="M15 3v2" />
//     <path d="M19 13V7a5 5 0 0 0-10 0v6" />
//   </svg>
// );

// const IconClock = ({ size = 18 }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
// );

// const IconCheckCircle = ({ size = 18 }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
// );

// const IconEye = ({ size = 16 }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
// );

// const IconImageFallback = ({ size = 22 }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <rect x="3" y="3" width="18" height="18" rx="2" />
//     <circle cx="8.5" cy="8.5" r="1.5" />
//     <path d="M21 15l-5-5L5 21" />
//   </svg>
// );

// const IconPrinter = ({ size = 16 }: { size?: number }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <path d="M6 9V2h12v7" />
//     <rect x="6" y="13" width="12" height="9" rx="2" />
//     <path d="M6 18h12" />
//   </svg>
// );

// const IconCalendar = ({ size = 16 }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <rect x="3" y="4" width="18" height="18" rx="2" />
//     <line x1="16" y1="2" x2="16" y2="6" />
//     <line x1="8" y1="2" x2="8" y2="6" />
//     <line x1="3" y1="10" x2="21" y2="10" />
//   </svg>
// );

// /* ─── Helpers ────────────────────────────────────────────────────────────────── */

// interface ItemCustomJson {
//   variant?: string;
//   flavour?: string;
//   flavor?: string;
//   shape?: string;
//   add_ons?: string[];
//   addons?: string[];
//   add_on_total?: number;
//   notes?: string;
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

// const currencySymbol = (cur?: string) => {
//   const c = cur || (typeof window !== 'undefined' ? localStorage.getItem('currency') || 'INR' : 'INR');
//   return c === 'INR' ? '₹' : c;
// };

// const fmtMoney = (n: number | undefined, cur?: string) => `${currencySymbol(cur)}${Number(n || 0).toFixed(0)}`;

// const fmtDateTime = (d?: string | null) =>
//   d ? new Date(d).toLocaleString('en-IN', {
//     day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
//   }) : null;

// const fmtDate = (d?: string) =>
//   d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null;

// const getDisplayName = (order: any) => {
//   if (order?.customer?.name) return order.customer.name;
//   const nameParts = [order?.customer?.first_name, order?.customer?.last_name].filter(Boolean);
//   return nameParts.length ? nameParts.join(' ') : order?.customer_name || '—';
// };

// const getDisplayEmail = (order: any) => order?.customer?.email || order?.customer_email || '—';
// const getDisplayPhone = (order: any) => order?.customer?.phone_no || order?.customer_phone || '—';
// const getDisplayOrderSource = (order: any) => order?.order_source || order?.order_type || '—';
// const getDisplayRole = (order: any) => order?.customer?.role?.toUpperCase() || (order?.order_type ? order.order_type.toUpperCase() : 'USER');

// const formatAddressString = (address: any) => {
//   if (!address) return '—';
//   const parts = [
//     address.addressLine1,
//     address.street,
//     address.line1,
//     address.line2,
//     address.area,
//     address.city,
//     address.state,
//     address.pincode,
//     address.country,
//   ].filter(Boolean);
//   return parts.length ? parts.join(', ') : '—';
// };

// const getKitchenOrderAddons = (order: any): any[] => {
//   if (Array.isArray(order?.order_addons)) return order.order_addons;
//   if (Array.isArray(order?.order_addons_json)) return order.order_addons_json;
//   return [];
// };

// const getKitchenOrderAddonTotal = (order: any): number => {
//   const addons = getKitchenOrderAddons(order);
//   return Number(order?.order_addons_total ?? addons.reduce((sum: number, addon: any) => sum + Number(addon.total ?? (addon.price * addon.quantity || 0)), 0));
// };

// const getExpectedDelivery = (order: any): { label: string } | null => {
//   if (!order) return null;

//   const explicit =
//     order.expected_delivery_at ||
//     order.expected_delivery_time ||
//     order.estimated_delivery_at;
//   if (explicit) return { label: fmtDateTime(explicit) as string };

//   const date = order.delivery_date || order.deliveryDate;
//   const slot = order.delivery_time_slot ?? order.deliveryTimeSlot;
//   if (date && slot) return { label: `${fmtDate(date)} · ${slot}` };
//   if (date) return { label: fmtDate(date) as string };
//   if (slot) return { label: slot };

//   return null;
// };

// // The logged-in kitchen staff member's id, used purely to scope the
// // Completed tab to "orders I personally started & finished".
// const getCurrentUserId = (): number | null => {
//   try {
//     const stored = JSON.parse(localStorage.getItem('user') || '{}');
//     return stored?.id ?? null;
//   } catch {
//     return null;
//   }
// };

// const KitchenOrder: React.FC = () => {
//   const currentUserId = useMemo(getCurrentUserId, []);

//   const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'processing' | 'completed'>('all');
//   const [pendingOrders, setPendingOrders] = useState<KitchenOrderRecord[]>([]);
//   const [processingOrders, setProcessingOrders] = useState<KitchenOrderRecord[]>([]);
//   const [completedOrders, setCompletedOrders] = useState<KitchenOrderRecord[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [actionLoading, setActionLoading] = useState<number | null>(null);
//   const [actionError, setActionError] = useState<string | null>(null);

//   // Detailed Modal states
//   const [selectedOrder, setSelectedOrder] = useState<any>(null);
//   const [modalOpen, setModalOpen] = useState<boolean>(false);
//   const [modalLoading, setModalLoading] = useState<boolean>(false);
//   // Receipt modal state (separate from detailed view)
//   const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
//   const [receiptLoading, setReceiptLoading] = useState<boolean>(false);

//   const fetchAllKitchenData = useCallback(async () => {
//     try {
//       setLoading(true);

//       const [pending, processing, completedAll] = await Promise.all([
//         getKitchenPending(),
//         getKitchenProcessing(),
//         getKitchenCompleted(),
//       ]);

//       setPendingOrders(pending);
//       setProcessingOrders(processing);
//       // Completed tab is scoped to "orders I started" — /kitchen/orders/completed
//       // returns every kitchen staff member's completed orders, so we filter
//       // it down client-side (see filterMyCompletedOrders in kitchenService).
//       setCompletedOrders(filterMyCompletedOrders(completedAll, currentUserId));
//     } catch (err) {
//       console.error('Failed to load kitchen dashboard data', err);
//     } finally {
//       setLoading(false);
//     }
//   }, [currentUserId]);

//   useEffect(() => {
//     fetchAllKitchenData();
//   }, [fetchAllKitchenData]);

//   const allOrders = useMemo(() => {
//     return [...pendingOrders, ...processingOrders, ...completedOrders].sort(
//       (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
//     );
//   }, [pendingOrders, processingOrders, completedOrders]);

//   const visibleOrders = useMemo(() => {
//     switch (activeTab) {
//       case 'pending': return pendingOrders;
//       case 'processing': return processingOrders;
//       case 'completed': return completedOrders;
//       default: return allOrders;
//     }
//   }, [activeTab, pendingOrders, processingOrders, completedOrders, allOrders]);

//   const handleViewOrderDetails = async (orderId: number) => {
//     try {
//       setModalLoading(true);
//       setModalOpen(true);
//       const data = await getKitchenOrderDetails(orderId);
//       setSelectedOrder(data);
//     } catch (err) {
//       console.error("Could not fetch full order record manifest", err);
//     } finally {
//       setModalLoading(false);
//     }
//   };

//   const handleOpenReceipt = async (orderId: number) => {
//     try {
//       setReceiptLoading(true);
//       // fetch full details (same endpoint) so receipt has all fields
//       const data = await getKitchenOrderDetails(orderId);
//       setSelectedOrder(data);
//       setIsReceiptOpen(true);
//     } catch (err) {
//       console.error('Could not fetch order for receipt', err);
//     } finally {
//       setReceiptLoading(false);
//     }
//   };

//   const handleStartPreparation = async (orderId: number, e: React.MouseEvent) => {
//     e.stopPropagation();
//     setActionError(null);
//     try {
//       setActionLoading(orderId);
//       await startProcessing(orderId);
//       await fetchAllKitchenData();

//       if (modalOpen && selectedOrder?.id === orderId) {
//         const updated = await getKitchenOrderDetails(orderId);
//         setSelectedOrder(updated);
//       }
//     } catch (err: any) {
//       const msg =
//         err?.response?.data?.error ||
//         "Couldn't start preparation — someone may have already claimed this order.";
//       setActionError(msg);
//       // Refresh so the button/status reflects reality if someone else beat us to it.
//       await fetchAllKitchenData();
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   const handleMarkReady = async (orderId: number, e: React.MouseEvent) => {
//     e.stopPropagation();
//     setActionError(null);
//     try {
//       setActionLoading(orderId);
//       await completeKitchenOrder(orderId);
//       await fetchAllKitchenData();
//       if (modalOpen && selectedOrder?.id === orderId) {
//         setModalOpen(false);
//       }
//     } catch (err: any) {
//       const msg = err?.response?.data?.error || "Couldn't mark this order ready.";
//       setActionError(msg);
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   return (
//     <div className="ko-workspace-container">

//       {/* ─── Page Title Header ─── */}
//       <div className="ko-page-header">
//         <div className="ko-page-header-text">
//           <h2>Kitchen Dashboard</h2>
//           <p>Monitor real-time line preparation items, active orders, and live chef fulfillment tasks.</p>
//         </div>
//       </div>

//       {actionError && (
//         <div className="ko-action-error-banner">
//           <span>{actionError}</span>
//           <button onClick={() => setActionError(null)}>Dismiss</button>
//         </div>
//       )}

//       {/* ─── Counter Metrics Top Row Grid ─── */}
//       <div className="ko-stats-grid">
//         <div className="ko-stat-card" onClick={() => setActiveTab('all')}>
//           <div className="ko-stat-icon icon-all"><IconChef size={24} /></div>
//           <div className="ko-stat-details">
//             <h3>{allOrders.length}</h3>
//             <p>Total Orders Today</p>
//           </div>
//         </div>
//         <div className="ko-stat-card" onClick={() => setActiveTab('pending')}>
//           <div className="ko-stat-icon icon-pending"><IconClock size={24} /></div>
//           <div className="ko-stat-details">
//             <h3>{pendingOrders.length}</h3>
//             <p>Awaiting Prep</p>
//           </div>
//         </div>
//         <div className="ko-stat-card" onClick={() => setActiveTab('processing')}>
//           <div className="ko-stat-icon icon-processing"><IconChef size={24} /></div>
//           <div className="ko-stat-details">
//             <h3>{processingOrders.length}</h3>
//             <p>Currently In Oven</p>
//           </div>
//         </div>
//         <div className="ko-stat-card" onClick={() => setActiveTab('completed')}>
//           <div className="ko-stat-icon icon-completed"><IconCheckCircle size={24} /></div>
//           <div className="ko-stat-details">
//             <h3>{completedOrders.length}</h3>
//             <p>Completed by Me</p>
//           </div>
//         </div>
//       </div>

//       {/* ─── Filter Navigation Tab Row ─── */}
//       <div className="ko-tabs-navigation-bar">
//         <button className={`ko-tab-nav-item ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
//           All Orders <span className="ko-tab-badge bg-all">{allOrders.length}</span>
//         </button>
//         <button className={`ko-tab-nav-item ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
//           Pending <span className="ko-tab-badge bg-pending">{pendingOrders.length}</span>
//         </button>
//         <button className={`ko-tab-nav-item ${activeTab === 'processing' ? 'active' : ''}`} onClick={() => setActiveTab('processing')}>
//           Processing <span className="ko-tab-badge bg-processing">{processingOrders.length}</span>
//         </button>
//         <button className={`ko-tab-nav-item ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>
//           Completed (Mine) <span className="ko-tab-badge bg-completed">{completedOrders.length}</span>
//         </button>
//       </div>

//       {/* ─── Active Queue Layout Loop ─── */}
//       {loading ? (
//         <div className="ko-workspace-center-loader">
//           <div className="ko-spinner" />
//           <p>Syncing hot items with kitchen lines...</p>
//         </div>
//       ) : visibleOrders.length === 0 ? (
//         <div className="ko-empty-state">
//           <IconChef size={50} />
//           <h3>No Orders Found</h3>
//           <p>
//             {activeTab === 'completed'
//               ? "You haven't completed any orders yet."
//               : `There are no items currently categorized under the "${activeTab}" status loop.`}
//           </p>
//         </div>
//       ) : (
//         <div className="ko-orders-grid">
//           {visibleOrders.map((order) => {
//             const dateStr = new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
//             const currentStatus = (order.status || 'PENDING').toUpperCase();
//             const isMine = order.preparation_started_by === currentUserId;

//             return (
//               <div key={order.id} className="ko-order-card" onClick={() => handleViewOrderDetails(order.id)}>
//                 <div className="ko-card-upper-row">
//                   <div>
//                     <h4 className="ko-order-title">Order #{order.order_number || String(order.id).padStart(5, '0')}</h4>
//                     <span className="ko-order-timestamp"><IconClock size={12} /> {dateStr}</span>
//                   </div>
//                   <span className={`ko-status-pill pill-${currentStatus.toLowerCase()}`}>
//                     {currentStatus}
//                   </span>
//                 </div>

//                 {/* {currentStatus === 'PREPARING' && (
//                   <span className={`ko-owner-tag ${isMine ? 'mine' : ''}`}>
//                     {isMine ? 'You are preparing this' : 'Being prepared by another staff member'}
//                   </span>
//                 )} */}


//                 {currentStatus === "PREPARING" && (
//   <div className="ko-owner-tag">
//     <strong>Kitchen Staff:</strong>{" "}
//     {typeof order.preparation_started_by === 'object' ? order.preparation_started_by?.name : order.preparation_started_by || "Unknown"}
//     {isMine && " (You)"}
//   </div>
// )}

//                 {/* Products Manifest Block */}
//                 <div className="ko-card-items-preview">
//                   {order.items?.map((item: any, idx: number) => (
//                     <div key={item.id || idx} className="ko-preview-item-line">
//                       <span className="ko-item-quantity">×{item.quantity}</span>
//                       <span className="ko-item-name">{item.product?.name || 'Assorted Item'}</span>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Interactive Workflow Execution Footer Button Row */}
//                 <div className="ko-card-action-bar">
//                   <button className="ko-action-icon-btn" onClick={(e) => { e.stopPropagation(); handleViewOrderDetails(order.id); }} title="View Details">
//                     <IconEye size={16} />
//                   </button>

//                   <button className="ko-action-icon-btn" onClick={(e) => { e.stopPropagation(); handleOpenReceipt(order.id); }} title="Open Receipt">
//                     <IconPrinter size={16} />
//                   </button>

//                   {currentStatus === "ASSIGNED_TO_KITCHEN" && (
//                     <button
//                       className="ko-action-primary-btn bg-prep"
//                       disabled={actionLoading === order.id}
//                       onClick={(e) => handleStartPreparation(order.id, e)}
//                     >
//                       {actionLoading === order.id ? "Starting..." : "Start Preparation"}
//                     </button>
//                   )}

//                   {currentStatus === "PREPARING" && (
//                     <button
//                       className="ko-action-primary-btn bg-complete"
//                       disabled={actionLoading === order.id}
//                       onClick={(e) => handleMarkReady(order.id, e)}
//                     >
//                       {actionLoading === order.id ? "Completing..." : "Mark Ready"}
//                     </button>
//                   )}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {/* ─── Detailed Order Modal Overlay View Sheet ─── */}
//       {modalOpen && (
//         <div className="ko-modal-backdrop" onClick={() => setModalOpen(false)}>
//           <div className="ko-modal-content-card" onClick={(e) => e.stopPropagation()}>
//             <div className="ko-modal-header">
//               <h3>Full Order Details — {selectedOrder ? (selectedOrder.order_number || selectedOrder.id) : ''}</h3>
//               <button className="ko-modal-close-cross" onClick={() => setModalOpen(false)}>×</button>
//             </div>

//             <div className="ko-modal-body-area op-full-details-modal-body">
//               {modalLoading || !selectedOrder ? (
//                 <div className="ko-modal-spinner-wrapper">
//                   <div className="ko-spinner" />
//                   <p>Pulling full order manifest details...</p>
//                 </div>
//               ) : (
//                 <>
//                   {/* Top badges + status */}
//                   <div className="op-fd-top-row">
//                     <div className={`ko-status-pill pill-${selectedOrder.status?.toLowerCase()}`}>{selectedOrder.status}</div>
//                     <div className="op-origin-badges">
//                       <div className="op-origin-item"><strong>Placed by</strong><div>{getDisplayName(selectedOrder)}</div></div>
//                       <div className="op-origin-item"><strong>Role</strong><div>{getDisplayRole(selectedOrder)}</div></div>
//                       <div className="op-origin-item"><strong>Phone</strong><div>{getDisplayPhone(selectedOrder)}</div></div>
//                       <div className="op-origin-item"><strong>Email</strong><div>{getDisplayEmail(selectedOrder)}</div></div>
//                       <div className="op-origin-item"><strong>Order source</strong><div>{getDisplayOrderSource(selectedOrder)}</div></div>
//                     </div>
//                   </div>

//                   {selectedOrder.preparation_started_at && (
//                     <div className="ko-modal-delivery-info">
//                       <IconClock size={16} />
//                       <span className="ko-delivery-label">Preparation started:</span>
//                       <span className="ko-delivery-value">
//                         {fmtDateTime(selectedOrder.preparation_started_at)}
//                         {selectedOrder.preparation_started_by?.id === currentUserId ? ' · by you' : ''}
//                       </span>
//                     </div>
//                   )}

//                   <div className="op-fd-section">
//                     <h4><IconCalendar size={14} /> Delivery Schedule</h4>
//                     <div className="op-fd-grid">
//                       <div><span className="lbl">Expected date</span><span>{fmtDate(selectedOrder.delivery_date || selectedOrder.deliveryDate)}</span></div>
//                       <div><span className="lbl">Time slot</span><span>{selectedOrder.delivery_time_slot ?? selectedOrder.deliveryTimeSlot ?? '—'}</span></div>
//                       <div><span className="lbl">Area</span><span>{(selectedOrder.delivery_address?.area && typeof selectedOrder.delivery_address.area === 'object') ? (selectedOrder.delivery_address.area.name ?? selectedOrder.delivery_address.area.areaName ?? '—') : (selectedOrder.delivery_address?.area ?? selectedOrder.detailedAddress?.areaName ?? (selectedOrder.area && typeof selectedOrder.area === 'object' ? (selectedOrder.area.name ?? selectedOrder.area.areaName) : selectedOrder.area) ?? '—')}</span></div>
//                     </div>
//                   </div>

//                   <div className="op-fd-section">
//                     <h4>Customer &amp; Address</h4>
//                     <div className="op-fd-grid">
//                       <div><span className="lbl">Name</span><span>{getDisplayName(selectedOrder)}</span></div>
//                       <div><span className="lbl">Phone</span><span>{getDisplayPhone(selectedOrder)}</span></div>
//                       <div><span className="lbl">Email</span><span>{getDisplayEmail(selectedOrder)}</span></div>
//                     </div>
//                     <div className="op-fd-address-block">
//                       <p><strong>Address:</strong> {formatAddressString(selectedOrder.delivery_address)}</p>
//                       {selectedOrder.delivery_address && (
//                         <ul className="op-fd-address-list">
//                           {selectedOrder.delivery_address.building && <li><strong>Building:</strong> {selectedOrder.delivery_address.building}</li>}
//                           {selectedOrder.delivery_address.block && <li><strong>Block:</strong> {selectedOrder.delivery_address.block}</li>}
//                           {selectedOrder.delivery_address.avenue && <li><strong>Avenue:</strong> {selectedOrder.delivery_address.avenue}</li>}
//                           {selectedOrder.delivery_address.street && <li><strong>Street:</strong> {selectedOrder.delivery_address.street}</li>}
//                           {selectedOrder.delivery_address.floor && <li><strong>Floor/Apt:</strong> {selectedOrder.delivery_address.floor} {selectedOrder.delivery_address.apartment}</li>}
//                           {selectedOrder.delivery_address.landmark && <li><strong>Landmark:</strong> {selectedOrder.delivery_address.landmark}</li>}
//                           {selectedOrder.delivery_address.addressNotes && <li><strong>Address notes:</strong> {selectedOrder.delivery_address.addressNotes}</li>}
//                         </ul>
//                       )}
//                     </div>
//                   </div>

//                   {/* <div className="ko-modal-section-box">
//                     <h5>Line Kitchen Production Items</h5>
//                     <div className="ko-modal-items-table">
//                       {selectedOrder.items?.map((item: any) => {
//                         const flavour = getFlavour(item);
//                         const variant = getVariant(item);
//                         const shape = getShape(item);
//                         const addOns = getAddOns(item);
//                         const itemNotes = getItemNotes(item);
//                         const lineTotal = item.line_total ?? (item.price * item.quantity);

//                         return (
//                           <div key={item.id} className="ko-modal-item-row ko-modal-item-row-detailed">
//                             <div className="ko-modal-item-image-wrap">
//                               {item.product?.image_url ? (
//                                 <img
//                                   className="ko-modal-item-image"
//                                   src={item.product.image_url}
//                                   alt={item.product?.name || 'Product'}
//                                 />
//                               ) : (
//                                 <div className="ko-modal-item-image-fallback">
//                                   <IconImageFallback size={22} />
//                                 </div>
//                               )}
//                             </div>

//                             <div className="ko-modal-item-left">
//                               <div className="ko-modal-item-title-row">
//                                 <span className="ko-modal-qty-bubble">×{item.quantity}</span>
//                                 <p className="item-main-title">{item.product?.name || 'Item'}</p>
//                               </div>

//                               {item.product?.description && (
//                                 <p className="item-sub-desc">{item.product.description}</p>
//                               )}

//                               {(flavour || variant || shape) && (
//                                 <div className="ko-item-meta-chips">
//                                   {flavour && (
//                                     <span className="ko-item-meta-chip chip-flavour">Flavour: {flavour}</span>
//                                   )}
//                                   {variant && (
//                                     <span className="ko-item-meta-chip chip-variant">Variant: {variant}</span>
//                                   )}
//                                   {shape && (
//                                     <span className="ko-item-meta-chip chip-shape">Shape: {shape}</span>
//                                   )}
//                                 </div>
//                               )}

//                               {addOns.length > 0 && (
//                                 <div className="ko-modal-item-addons">
//                                   <span className="ko-addons-label">Add-ons:</span>
//                                   <div className="ko-item-meta-chips">
//                                     {addOns.map((addOn, i) => (
//                                       <span key={i} className="ko-item-meta-chip chip-addon">{addOn}</span>
//                                     ))}
//                                   </div>
//                                 </div>
//                               )}

//                               {itemNotes && (
//                                 <p className="item-sub-desc ko-item-custom-note">Note: "{itemNotes}"</p>
//                               )}

//                               <div className="ko-modal-item-price-row">
//                                 <span className="ko-item-unit-price">{fmtMoney(item.price, selectedOrder?.currency)} each</span>
//                                 <span className="ko-item-line-total">{fmtMoney(lineTotal, selectedOrder?.currency)}</span>
//                               </div>
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </div> */}


//                   <div className="ko-modal-section-box">
//   <h5 className="ko-section-title">Line Kitchen Production Items</h5>
  
//   <div className="ko-modal-items-table">
//     {selectedOrder.items?.map((item: any) => {
//       const flavour = getFlavour(item);
//       const variant = getVariant(item);
//       const shape = getShape(item);
//       const addOns = getAddOns(item);
//       const itemNotes = getItemNotes(item);
//       const lineTotal = item.line_total ?? (item.price * item.quantity);

//       return (
//         <div key={item.id} className="ko-modal-item-row-detailed">
//           {/* Left: Product Image Box */}
//           <div className="ko-modal-item-image-wrap">
//             {item.product?.image_url ? (
//               <img
//                 className="ko-modal-item-image"
//                 src={item.product.image_url}
//                 alt={item.product?.name || 'Product'}
//               />
//             ) : (
//               <div className="ko-modal-item-image-fallback">
//                 <IconImageFallback size={20} />
//               </div>
//             )}
//           </div>

//           {/* Right: Detailed Content Area */}
//           <div className="ko-modal-item-body">
            
//             {/* Header Row: Qty Badge & Title */}
//             <div className="ko-modal-item-header">
//               <span className="ko-modal-qty-bubble">
//                 {item.quantity}x
//               </span>
//               <p className="item-main-title">{item.product?.name || 'Item'}</p>
//             </div>

//             {/* Description */}
//             {item.product?.description && (
//               <p className="item-sub-desc">{item.product.description}</p>
//             )}

//             {/* Specifications (Flavour, Variant, Shape) */}
//             {(flavour || variant || shape) && (
//               <div className="ko-item-meta-chips">
//                 {flavour && (
//                   <span className="ko-item-meta-chip chip-flavour">
//                     Flavour: <strong>{flavour}</strong>
//                   </span>
//                 )}
//                 {variant && (
//                   <span className="ko-item-meta-chip chip-variant">
//                     Variant: <strong>{variant}</strong>
//                   </span>
//                 )}
//                 {shape && (
//                   <span className="ko-item-meta-chip chip-shape">
//                     Shape: <strong>{shape}</strong>
//                   </span>
//                 )}
//               </div>
//             )}

//             {/* Add-ons */}
//             {addOns.length > 0 && (
//               <div className="ko-modal-item-addons">
//                 <span className="ko-addons-label">Add-ons</span>
//                 <div className="ko-item-meta-chips-small">
//                   {addOns.map((addOn, i) => (
//                     <span key={i} className="ko-item-meta-chip chip-addon">{addOn}</span>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Special Instructions Note */}
//             {itemNotes && (
//               <div className="ko-item-custom-note-box">
//                 <span className="note-label">Instruction:</span>
//                 <p className="item-custom-note-text">"{itemNotes}"</p>
//               </div>
//             )}

//             {/* Price Calculations */}
//             <div className="ko-modal-item-price-row">
//               <span className="ko-item-unit-price">
//                 {fmtMoney(item.price, selectedOrder?.currency)} × {item.quantity}
//               </span>
//               <span className="ko-item-line-total">
//                 {fmtMoney(lineTotal, selectedOrder?.currency)}
//               </span>
//             </div>

//           </div>
//         </div>
//       );
//     })}
//   </div>
// </div>

//                   {getKitchenOrderAddons(selectedOrder).length > 0 && (
//                     <div className="op-fd-order-addons">
//                       <h4>Order Add-ons</h4>
//                       <div className="op-fd-addons-list">
//                         {getKitchenOrderAddons(selectedOrder).map((addon: any, idx: number) => (
//                           <div key={`${addon.addon_id ?? addon.addonId}-${idx}`} className="op-fd-addon-row">
//                             <div className="op-fd-addon-thumb-wrapper">
//                               <div className="op-fd-addon-thumb-placeholder" />
//                               <div className="op-fd-addon-content">
//                                 <strong>{addon.addon_name || addon.addonName || addon.name || `Addon #${addon.addon_id ?? addon.addonId ?? idx + 1}`}{addon.quantity ? ` (${addon.quantity} pcs)` : ''}</strong>
//                                 <div className="op-fd-addon-meta">{fmtMoney(addon.price, selectedOrder.currency)} each</div>
//                               </div>
//                             </div>
//                             <div className="op-fd-addon-price-block">
//                               <span>{fmtMoney(addon.total ?? (addon.price * addon.quantity), selectedOrder.currency)}</span>
//                               <div className="op-fd-addon-note">Rate included in totals</div>
//                             </div>
//                           </div>
//                         ))}
//                         <div className="op-fd-addon-total">
//                           <strong>Total Add-ons:</strong>
//                           <span>{fmtMoney(getKitchenOrderAddonTotal(selectedOrder), selectedOrder.currency)}</span>
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   {(selectedOrder.greeting_message || selectedOrder.greeting_from || selectedOrder.greeting_to) && (
//                     <div className="op-fd-section op-fd-highlight-greeting">
//                       <h4>Greeting Card</h4>
//                       <div className="op-fd-grid">
//                         <div><span className="lbl">To</span><span>{selectedOrder.greeting_to || '—'}</span></div>
//                         <div><span className="lbl">From</span><span>{selectedOrder.greeting_from || '—'}</span></div>
//                       </div>
//                       {selectedOrder.greeting_message && (
//                         <p className="op-fd-greeting-message">"{selectedOrder.greeting_message}"</p>
//                       )}
//                     </div>
//                   )}

//                   <div className="op-fd-section">
//                     <h4>Pricing Summary</h4>
//                     {(() => {
//                       const itemSubtotal = Number(selectedOrder.subtotal ?? selectedOrder.sub_total ?? (selectedOrder.items?.reduce((sum: number, item: any) => sum + Number(item.line_total ?? (item.price * item.quantity || 0)), 0) || 0));
//                       const addonsTotal = getKitchenOrderAddonTotal(selectedOrder);
//                       const discount = Number(selectedOrder.discount || 0);
//                       const deliveryCharge = Number(selectedOrder.delivery_charge ?? selectedOrder.deliveryCharge ?? 0);
//                       const grandTotal = Number(selectedOrder.total ?? selectedOrder.grand_total ?? (itemSubtotal + addonsTotal - discount + deliveryCharge));

//                       return (
//                         <div className="drawer-cost-breakdown">
//                           <div className="cost-row"><span>Subtotal:</span><span>{fmtMoney(itemSubtotal, selectedOrder.currency)}</span></div>
//                           {addonsTotal > 0 && <div className="cost-row"><span>Add-ons:</span><span>{fmtMoney(addonsTotal, selectedOrder.currency)}</span></div>}
//                           {discount > 0 && <div className="cost-row discount"><span>Discount:</span><span>-{fmtMoney(discount, selectedOrder.currency)}</span></div>}
//                           <div className="cost-row"><span>Delivery:</span><span>{fmtMoney(deliveryCharge, selectedOrder.currency)}</span></div>
//                           <div className="cost-row total"><span>Grand Total:</span><span>{fmtMoney(grandTotal, selectedOrder.currency)}</span></div>
//                         </div>
//                       );
//                     })()}
//                   </div>

//                   {selectedOrder.delivery_notes && (
//                     <div className="ko-modal-section-box notes-box">
//                       <h5>Special Kitchen Notes / Instructions</h5>
//                       <p className="notes-text-render">"{selectedOrder.delivery_notes}"</p>
//                     </div>
//                   )}


//                   <div className="op-fd-actions-row">
//                     <button className="sage-btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); handleOpenReceipt(selectedOrder.id); }}>
//                       <IconPrinter size={13} /> Print Receipt
//                     </button>
//                     <button className="sage-btn btn-ghost btn-sm" onClick={() => { setModalOpen(false); }}>
//                       Open Workflow Panel
//                     </button>
//                   </div>

//                   <div className="ko-modal-action-footer">
//                     <button className="ko-modal-cancel-btn" onClick={() => setModalOpen(false)}>Close Window</button>
//                     {selectedOrder.status === "ASSIGNED_TO_KITCHEN" && (
//                       <button
//                         className="ko-action-primary-btn bg-prep"
//                         disabled={actionLoading === selectedOrder.id}
//                         onClick={(e) => handleStartPreparation(selectedOrder.id, e)}
//                       >
//                         {actionLoading === selectedOrder.id ? "Starting..." : "Start Preparation"}
//                       </button>
//                     )}
//                     {selectedOrder.status === "PREPARING" && (
//                       <button
//                         className="ko-action-primary-btn bg-complete"
//                         disabled={actionLoading === selectedOrder.id}
//                         onClick={(e) => handleMarkReady(selectedOrder.id, e)}
//                       >
//                         {actionLoading === selectedOrder.id ? "Completing..." : "Mark Ready"}
//                       </button>
//                     )}
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Receipt modal (opens when clicking receipt icon on an order card) */}
//       {isReceiptOpen && (
//         <div className="ko-modal-backdrop" onClick={() => setIsReceiptOpen(false)}>
//           <div className="ko-modal-content-card" onClick={(e) => e.stopPropagation()}>
//             <div className="ko-modal-header">
//               <h3>Print Receipt</h3>
//               <button className="ko-modal-close-cross" onClick={() => setIsReceiptOpen(false)}>×</button>
//             </div>

//             <div className="print-thermal-receipt-sheet">
//               {receiptLoading || !selectedOrder ? (
//                 <div className="ko-modal-spinner-wrapper">
//                   <div className="ko-spinner" />
//                   <p>Loading receipt…</p>
//                 </div>
//               ) : (
//                 <>
//                   <div className="receipt-crown-title">
//                     <h2>ORDER RECEIPT</h2>
//                     <p className="divider">- - - - - - - - - - - - - - - - - - -</p>
//                   </div>

//                   <div className="receipt-basics">
//                     <p><strong>Order No:</strong> {selectedOrder.order_number ?? selectedOrder.id}</p>
//                     <p><strong>Date:</strong> {fmtDate(selectedOrder.created_at)}</p>
//                     <p><strong>Time:</strong> {new Date(selectedOrder.created_at).toLocaleTimeString()}</p>
//                     <p><strong>Customer:</strong> {selectedOrder.customer?.first_name} {selectedOrder.customer?.last_name}</p>
//                     <p><strong>Phone:</strong> {selectedOrder.customer?.phone_no || selectedOrder.customerPhone}</p>
//                     <p><strong>Payment:</strong> {selectedOrder.payment_method || selectedOrder.paymentMethod}</p>
//                     <p className="divider">- - - - - - - - - - - - - - - - - - -</p>
//                   </div>

//                   <div className="receipt-items-table">
//                     {selectedOrder.items.map((item: any) => (
//                       <div key={`r-${item.id}`} className="receipt-item-row">
//                         <div className="receipt-item-main">
//                           <span className="receipt-item-name">{item.quantity} x {item.product?.name || item.productName}</span>
//                           <span className="receipt-item-price">{fmtMoney(item.line_total ?? (item.price * item.quantity), selectedOrder.currency)}</span>
//                         </div>
//                         {getAddOns(item).length > 0 && (
//                           <div className="receipt-item-addons">Add-ons: {getAddOns(item).join(', ')}</div>
//                         )}
//                       </div>
//                     ))}

//                     {selectedOrder.order_addons?.length > 0 && (
//                       <>
//                         <div className="receipt-divider">-----------------------------------------</div>
//                         {selectedOrder.order_addons.map((addon: any, idx: number) => (
//                           <div key={`ra-${idx}`} className="receipt-item-row receipt-addon-row">
//                             <div className="receipt-item-main">
//                               <span className="receipt-item-name">{addon.quantity} × {addon.addon_name || addon.addonName || `Addon #${addon.addon_id ?? addon.addonId}`}</span>
//                               <span className="receipt-item-price">{fmtMoney(addon.total ?? (addon.price * addon.quantity), selectedOrder.currency)}</span>
//                             </div>
//                           </div>
//                         ))}
//                       </>
//                     )}
//                   </div>

//                   <div className="receipt-divider">-----------------------------------------</div>

//                   {/* totals */}
//                   {(() => {
//                     const itemSubtotal = Number(selectedOrder.subtotal ?? (selectedOrder.items?.reduce((s: number, it: any) => s + Number(it.line_total ?? (it.price * it.quantity || 0)), 0) || 0));
//                     const addonsTotal = Number(selectedOrder.order_addons_total ?? (selectedOrder.order_addons?.reduce((s: number, a: any) => s + Number(a.total ?? (a.price * a.quantity || 0)), 0) || 0));
//                     const discount = Number(selectedOrder.discount || 0);
//                     const deliveryCharge = Number(selectedOrder.delivery_charge ?? selectedOrder.deliveryCharge ?? 0);
//                     const computedGrandTotal = Number(selectedOrder.total ?? (itemSubtotal + addonsTotal - discount + deliveryCharge));

//                     return (
//                       <div className="receipt-totals">
//                         <div className="receipt-total-row"><span>Subtotal:</span><span>{fmtMoney(itemSubtotal, selectedOrder.currency)}</span></div>
//                         {addonsTotal > 0 && <div className="receipt-total-row"><span>Add-ons:</span><span>{fmtMoney(addonsTotal, selectedOrder.currency)}</span></div>}
//                         {discount > 0 && <div className="receipt-total-row"><span>Discount:</span><span>-{fmtMoney(discount, selectedOrder.currency)}</span></div>}
//                         <div className="receipt-total-row"><span>Delivery:</span><span>{fmtMoney(deliveryCharge, selectedOrder.currency)}</span></div>
//                         <div className="receipt-divider">-----------------------------------------</div>
//                         <div className="receipt-total-row grand-total"><span>GRAND TOTAL:</span><span>{fmtMoney(computedGrandTotal, selectedOrder.currency)}</span></div>
//                       </div>
//                     );
//                   })()}

//                   <div className="receipt-divider">-----------------------------------------</div>

//                   <div className="receipt-center receipt-footer-msg">
//                     <p>Thank you for dining with CakeNTake!</p>
//                     <p>Baked fresh daily, prepared artisanally.</p>
//                     <p className="receipt-url">www.cakentake.com</p>
//                   </div>

//                   <div className="receipt-modal-controls no-print footer-gap">
//                     <button className="sage-btn btn-secondary btn-sm" onClick={() => window.print()}>
//                       <IconPrinter size={13} /><span>Print</span>
//                     </button>
//                     <button className="sage-btn btn-primary btn-sm" onClick={() => setIsReceiptOpen(false)}>Close</button>
//                   </div>
//                 </>
//               )}
//             </div>

//           </div>
//         </div>
//       )}

//     </div>
//   );
// };

// export default KitchenOrder;



import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './KitchenOrder.css';
import {
  getKitchenPending,
  getKitchenProcessing,
  getKitchenOrderDetails,
  startProcessing,
  completeKitchenOrder,
  getMyCompletedKitchenOrders,
  KitchenOrder as KitchenOrderRecord,
} from '../../services/kitchenService';

/* ─── SVG Icons ──────────────────────────────────────────────────────────────── */
const IconChef = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 18h12a2 2 0 0 0 2-2v-3H4v3a2 2 0 0 0 2 2z" />
    <path d="M12 2v3" />
    <path d="M9 3v2" />
    <path d="M15 3v2" />
    <path d="M19 13V7a5 5 0 0 0-10 0v6" />
  </svg>
);

const IconClock = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);

const IconCheckCircle = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
);

const IconEye = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
);

const IconImageFallback = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
);

const IconPrinter = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 9V2h12v7" />
    <rect x="6" y="13" width="12" height="9" rx="2" />
    <path d="M6 18h12" />
  </svg>
);

const IconCalendar = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

/* ─── Helpers ────────────────────────────────────────────────────────────────── */

interface ItemCustomJson {
  variant?: string;
  flavour?: string;
  flavor?: string;
  shape?: string;
  add_ons?: string[];
  addons?: string[];
  add_on_total?: number;
  notes?: string;
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

const currencySymbol = (cur?: string) => {
  const c = cur || (typeof window !== 'undefined' ? localStorage.getItem('currency') || 'INR' : 'INR');
  return c === 'INR' ? '₹' : c;
};

const fmtMoney = (n: number | undefined, cur?: string) => `${currencySymbol(cur)}${Number(n || 0).toFixed(0)}`;

const fmtDateTime = (d?: string | null) =>
  d ? new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }) : null;

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null;

const getDisplayName = (order: any) => {
  if (order?.customer?.name) return order.customer.name;
  const nameParts = [order?.customer?.first_name, order?.customer?.last_name].filter(Boolean);
  return nameParts.length ? nameParts.join(' ') : order?.customer_name || '—';
};

const getDisplayEmail = (order: any) => order?.customer?.email || order?.customer_email || '—';
const getDisplayPhone = (order: any) => order?.customer?.phone_no || order?.customer_phone || '—';
const getDisplayOrderSource = (order: any) => order?.order_source || order?.order_type || '—';
const getDisplayRole = (order: any) => order?.customer?.role?.toUpperCase() || (order?.order_type ? order.order_type.toUpperCase() : 'USER');

const formatAddressString = (address: any) => {
  if (!address) return '—';
  const parts = [
    address.addressLine1,
    address.street,
    address.line1,
    address.line2,
    address.area,
    address.city,
    address.state,
    address.pincode,
    address.country,
  ].filter(Boolean);
  return parts.length ? parts.join(', ') : '—';
};

const getKitchenOrderAddons = (order: any): any[] => {
  if (Array.isArray(order?.order_addons)) return order.order_addons;
  if (Array.isArray(order?.order_addons_json)) return order.order_addons_json;
  return [];
};

const getKitchenOrderAddonTotal = (order: any): number => {
  const addons = getKitchenOrderAddons(order);
  return Number(order?.order_addons_total ?? addons.reduce((sum: number, addon: any) => sum + Number(addon.total ?? (addon.price * addon.quantity || 0)), 0));
};

const getExpectedDelivery = (order: any): { label: string } | null => {
  if (!order) return null;

  const explicit =
    order.expected_delivery_at ||
    order.expected_delivery_time ||
    order.estimated_delivery_at;
  if (explicit) return { label: fmtDateTime(explicit) as string };

  const date = order.delivery_date || order.deliveryDate;
  const slot = order.delivery_time_slot ?? order.deliveryTimeSlot;
  if (date && slot) return { label: `${fmtDate(date)} · ${slot}` };
  if (date) return { label: fmtDate(date) as string };
  if (slot) return { label: slot };

  return null;
};

// The logged-in kitchen staff member's id — used only for display purposes
// now (e.g. "(You)" tag), since /kitchen/my-completed-orders already scopes
// the Completed tab server-side.
const getCurrentUserId = (): number | null => {
  try {
    const stored = JSON.parse(localStorage.getItem('user') || '{}');
    return stored?.id ?? null;
  } catch {
    return null;
  }
};

const KitchenOrder: React.FC = () => {
  const currentUserId = useMemo(getCurrentUserId, []);

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'processing' | 'completed'>('all');
  const [pendingOrders, setPendingOrders] = useState<KitchenOrderRecord[]>([]);
  const [processingOrders, setProcessingOrders] = useState<KitchenOrderRecord[]>([]);
  const [completedOrders, setCompletedOrders] = useState<KitchenOrderRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Detailed Modal states
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  // Receipt modal state (separate from detailed view)
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
  const [receiptLoading, setReceiptLoading] = useState<boolean>(false);

  const fetchAllKitchenData = useCallback(async () => {
    try {
      setLoading(true);

      // /kitchen/my-completed-orders is scoped server-side to the logged-in
      // kitchen staff member, so no client-side filtering is needed anymore.
      const [pending, processing, myCompleted] = await Promise.all([
        getKitchenPending(),
        getKitchenProcessing(),
        getMyCompletedKitchenOrders(),
      ]);

      setPendingOrders(pending);
      setProcessingOrders(processing);
      setCompletedOrders(myCompleted);
    } catch (err) {
      console.error('Failed to load kitchen dashboard data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllKitchenData();
  }, [fetchAllKitchenData]);

  const allOrders = useMemo(() => {
    return [...pendingOrders, ...processingOrders, ...completedOrders].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [pendingOrders, processingOrders, completedOrders]);

  const visibleOrders = useMemo(() => {
    switch (activeTab) {
      case 'pending': return pendingOrders;
      case 'processing': return processingOrders;
      case 'completed': return completedOrders;
      default: return allOrders;
    }
  }, [activeTab, pendingOrders, processingOrders, completedOrders, allOrders]);

  const handleViewOrderDetails = async (orderId: number) => {
    try {
      setModalLoading(true);
      setModalOpen(true);
      const data = await getKitchenOrderDetails(orderId);
      setSelectedOrder(data);
    } catch (err) {
      console.error("Could not fetch full order record manifest", err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenReceipt = async (orderId: number) => {
    try {
      setReceiptLoading(true);
      // fetch full details (same endpoint) so receipt has all fields
      const data = await getKitchenOrderDetails(orderId);
      setSelectedOrder(data);
      setIsReceiptOpen(true);
    } catch (err) {
      console.error('Could not fetch order for receipt', err);
    } finally {
      setReceiptLoading(false);
    }
  };

  const handleStartPreparation = async (orderId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActionError(null);
    try {
      setActionLoading(orderId);
      await startProcessing(orderId);
      await fetchAllKitchenData();

      if (modalOpen && selectedOrder?.id === orderId) {
        const updated = await getKitchenOrderDetails(orderId);
        setSelectedOrder(updated);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        "Couldn't start preparation — someone may have already claimed this order.";
      setActionError(msg);
      // Refresh so the button/status reflects reality if someone else beat us to it.
      await fetchAllKitchenData();
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkReady = async (orderId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActionError(null);
    try {
      setActionLoading(orderId);
      await completeKitchenOrder(orderId);
      // This order now moves into "Completed (Mine)" — refetch so the
      // completed list (and its count) picks it up immediately.
      await fetchAllKitchenData();
      if (modalOpen && selectedOrder?.id === orderId) {
        setModalOpen(false);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Couldn't mark this order ready.";
      setActionError(msg);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="ko-workspace-container">

      {/* ─── Page Title Header ─── */}
      <div className="ko-page-header">
        <div className="ko-page-header-text">
          <h2>Kitchen Dashboard</h2>
          <p>Monitor real-time line preparation items, active orders, and live chef fulfillment tasks.</p>
        </div>
      </div>

      {actionError && (
        <div className="ko-action-error-banner">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)}>Dismiss</button>
        </div>
      )}

      {/* ─── Counter Metrics Top Row Grid ─── */}
      <div className="ko-stats-grid">
        <div className="ko-stat-card" onClick={() => setActiveTab('all')}>
          <div className="ko-stat-icon icon-all"><IconChef size={24} /></div>
          <div className="ko-stat-details">
            <h3>{allOrders.length}</h3>
            <p>Total Orders Today</p>
          </div>
        </div>
        <div className="ko-stat-card" onClick={() => setActiveTab('pending')}>
          <div className="ko-stat-icon icon-pending"><IconClock size={24} /></div>
          <div className="ko-stat-details">
            <h3>{pendingOrders.length}</h3>
            <p>Awaiting Prep</p>
          </div>
        </div>
        <div className="ko-stat-card" onClick={() => setActiveTab('processing')}>
          <div className="ko-stat-icon icon-processing"><IconChef size={24} /></div>
          <div className="ko-stat-details">
            <h3>{processingOrders.length}</h3>
            <p>Currently In Oven</p>
          </div>
        </div>
        <div className="ko-stat-card" onClick={() => setActiveTab('completed')}>
          <div className="ko-stat-icon icon-completed"><IconCheckCircle size={24} /></div>
          <div className="ko-stat-details">
            <h3>{completedOrders.length}</h3>
            <p>Completed by Me</p>
          </div>
        </div>
      </div>

      {/* ─── Filter Navigation Tab Row ─── */}
      <div className="ko-tabs-navigation-bar">
        <button className={`ko-tab-nav-item ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
          All Orders <span className="ko-tab-badge bg-all">{allOrders.length}</span>
        </button>
        <button className={`ko-tab-nav-item ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
          Pending <span className="ko-tab-badge bg-pending">{pendingOrders.length}</span>
        </button>
        <button className={`ko-tab-nav-item ${activeTab === 'processing' ? 'active' : ''}`} onClick={() => setActiveTab('processing')}>
          Processing <span className="ko-tab-badge bg-processing">{processingOrders.length}</span>
        </button>
        <button className={`ko-tab-nav-item ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>
          Completed (Mine) <span className="ko-tab-badge bg-completed">{completedOrders.length}</span>
        </button>
      </div>

      {/* ─── Active Queue Layout Loop ─── */}
      {loading ? (
        <div className="ko-workspace-center-loader">
          <div className="ko-spinner" />
          <p>Syncing hot items with kitchen lines...</p>
        </div>
      ) : visibleOrders.length === 0 ? (
        <div className="ko-empty-state">
          <IconChef size={50} />
          <h3>No Orders Found</h3>
          <p>
            {activeTab === 'completed'
              ? "You haven't completed any orders yet."
              : `There are no items currently categorized under the "${activeTab}" status loop.`}
          </p>
        </div>
      ) : (
        <div className="ko-orders-grid">
          {visibleOrders.map((order) => {
            const dateStr = new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
            const currentStatus = (order.status || 'PENDING').toUpperCase();
            const isMine = order.preparation_started_by === currentUserId;

            return (
              <div key={order.id} className="ko-order-card" onClick={() => handleViewOrderDetails(order.id)}>
                <div className="ko-card-upper-row">
                  <div>
                    <h4 className="ko-order-title">Order #{order.order_number || String(order.id).padStart(5, '0')}</h4>
                    <span className="ko-order-timestamp"><IconClock size={12} /> {dateStr}</span>
                  </div>
                  <span className={`ko-status-pill pill-${currentStatus.toLowerCase()}`}>
                    {currentStatus}
                  </span>
                </div>

                {currentStatus === "PREPARING" && (
                  <div className="ko-owner-tag">
                    <strong>Kitchen Staff:</strong>{" "}
                    {typeof order.preparation_started_by === 'object' ? order.preparation_started_by?.name : order.preparation_started_by || "Unknown"}
                    {isMine && " (You)"}
                  </div>
                )}

                {/* Products Manifest Block */}
                <div className="ko-card-items-preview">
                  {order.items?.map((item: any, idx: number) => (
                    <div key={item.id || idx} className="ko-preview-item-line">
                      <span className="ko-item-quantity">×{item.quantity}</span>
                      <span className="ko-item-name">{item.product?.name || 'Assorted Item'}</span>
                    </div>
                  ))}
                </div>

                {/* Interactive Workflow Execution Footer Button Row */}
                <div className="ko-card-action-bar">
                  <button className="ko-action-icon-btn" onClick={(e) => { e.stopPropagation(); handleViewOrderDetails(order.id); }} title="View Details">
                    <IconEye size={16} />
                  </button>

                  <button className="ko-action-icon-btn" onClick={(e) => { e.stopPropagation(); handleOpenReceipt(order.id); }} title="Open Receipt">
                    <IconPrinter size={16} />
                  </button>

                  {currentStatus === "ASSIGNED_TO_KITCHEN" && (
                    <button
                      className="ko-action-primary-btn bg-prep"
                      disabled={actionLoading === order.id}
                      onClick={(e) => handleStartPreparation(order.id, e)}
                    >
                      {actionLoading === order.id ? "Starting..." : "Start Preparation"}
                    </button>
                  )}

                  {currentStatus === "PREPARING" && (
                    <button
                      className="ko-action-primary-btn bg-complete"
                      disabled={actionLoading === order.id}
                      onClick={(e) => handleMarkReady(order.id, e)}
                    >
                      {actionLoading === order.id ? "Completing..." : "Mark Ready"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Detailed Order Modal Overlay View Sheet ─── */}
      {modalOpen && (
        <div className="ko-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="ko-modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="ko-modal-header">
              <h3>Full Order Details — {selectedOrder ? (selectedOrder.order_number || selectedOrder.id) : ''}</h3>
              <button className="ko-modal-close-cross" onClick={() => setModalOpen(false)}>×</button>
            </div>

            <div className="ko-modal-body-area op-full-details-modal-body">
              {modalLoading || !selectedOrder ? (
                <div className="ko-modal-spinner-wrapper">
                  <div className="ko-spinner" />
                  <p>Pulling full order manifest details...</p>
                </div>
              ) : (
                <>
                  {/* Top badges + status */}
                  <div className="op-fd-top-row">
                    <div className={`ko-status-pill pill-${selectedOrder.status?.toLowerCase()}`}>{selectedOrder.status}</div>
                    <div className="op-origin-badges">
                      <div className="op-origin-item"><strong>Placed by</strong><div>{getDisplayName(selectedOrder)}</div></div>
                      <div className="op-origin-item"><strong>Role</strong><div>{getDisplayRole(selectedOrder)}</div></div>
                      <div className="op-origin-item"><strong>Phone</strong><div>{getDisplayPhone(selectedOrder)}</div></div>
                      <div className="op-origin-item"><strong>Email</strong><div>{getDisplayEmail(selectedOrder)}</div></div>
                      <div className="op-origin-item"><strong>Order source</strong><div>{getDisplayOrderSource(selectedOrder)}</div></div>
                    </div>
                  </div>

                  {selectedOrder.preparation_started_at && (
                    <div className="ko-modal-delivery-info">
                      <IconClock size={16} />
                      <span className="ko-delivery-label">Preparation started:</span>
                      <span className="ko-delivery-value">
                        {fmtDateTime(selectedOrder.preparation_started_at)}
                        {selectedOrder.preparation_started_by?.id === currentUserId ? ' · by you' : ''}
                      </span>
                    </div>
                  )}

                  <div className="op-fd-section">
                    <h4><IconCalendar size={14} /> Delivery Schedule</h4>
                    <div className="op-fd-grid">
                      <div><span className="lbl">Expected date</span><span>{fmtDate(selectedOrder.delivery_date || selectedOrder.deliveryDate)}</span></div>
                      <div><span className="lbl">Time slot</span><span>{selectedOrder.delivery_time_slot ?? selectedOrder.deliveryTimeSlot ?? '—'}</span></div>
                      <div><span className="lbl">Area</span><span>{(selectedOrder.delivery_address?.area && typeof selectedOrder.delivery_address.area === 'object') ? (selectedOrder.delivery_address.area.name ?? selectedOrder.delivery_address.area.areaName ?? '—') : (selectedOrder.delivery_address?.area ?? selectedOrder.detailedAddress?.areaName ?? (selectedOrder.area && typeof selectedOrder.area === 'object' ? (selectedOrder.area.name ?? selectedOrder.area.areaName) : selectedOrder.area) ?? '—')}</span></div>
                    </div>
                  </div>

                  <div className="op-fd-section">
                    <h4>Customer &amp; Address</h4>
                    <div className="op-fd-grid">
                      <div><span className="lbl">Name</span><span>{getDisplayName(selectedOrder)}</span></div>
                      <div><span className="lbl">Phone</span><span>{getDisplayPhone(selectedOrder)}</span></div>
                      <div><span className="lbl">Email</span><span>{getDisplayEmail(selectedOrder)}</span></div>
                    </div>
                    <div className="op-fd-address-block">
                      <p><strong>Address:</strong> {formatAddressString(selectedOrder.delivery_address)}</p>
                      {selectedOrder.delivery_address && (
                        <ul className="op-fd-address-list">
                          {selectedOrder.delivery_address.building && <li><strong>Building:</strong> {selectedOrder.delivery_address.building}</li>}
                          {selectedOrder.delivery_address.block && <li><strong>Block:</strong> {selectedOrder.delivery_address.block}</li>}
                          {selectedOrder.delivery_address.avenue && <li><strong>Avenue:</strong> {selectedOrder.delivery_address.avenue}</li>}
                          {selectedOrder.delivery_address.street && <li><strong>Street:</strong> {selectedOrder.delivery_address.street}</li>}
                          {selectedOrder.delivery_address.floor && <li><strong>Floor/Apt:</strong> {selectedOrder.delivery_address.floor} {selectedOrder.delivery_address.apartment}</li>}
                          {selectedOrder.delivery_address.landmark && <li><strong>Landmark:</strong> {selectedOrder.delivery_address.landmark}</li>}
                          {selectedOrder.delivery_address.addressNotes && <li><strong>Address notes:</strong> {selectedOrder.delivery_address.addressNotes}</li>}
                        </ul>
                      )}
                    </div>
                  </div>

                  <div className="ko-modal-section-box">
                    <h5 className="ko-section-title">Line Kitchen Production Items</h5>

                    <div className="ko-modal-items-table">
                      {selectedOrder.items?.map((item: any) => {
                        const flavour = getFlavour(item);
                        const variant = getVariant(item);
                        const shape = getShape(item);
                        const addOns = getAddOns(item);
                        const itemNotes = getItemNotes(item);
                        const lineTotal = item.line_total ?? (item.price * item.quantity);

                        return (
                          <div key={item.id} className="ko-modal-item-row-detailed">
                            {/* Left: Product Image Box */}
                            <div className="ko-modal-item-image-wrap">
                              {item.product?.image_url ? (
                                <img
                                  className="ko-modal-item-image"
                                  src={item.product.image_url}
                                  alt={item.product?.name || 'Product'}
                                />
                              ) : (
                                <div className="ko-modal-item-image-fallback">
                                  <IconImageFallback size={20} />
                                </div>
                              )}
                            </div>

                            {/* Right: Detailed Content Area */}
                            <div className="ko-modal-item-body">

                              {/* Header Row: Qty Badge & Title */}
                              <div className="ko-modal-item-header">
                                <span className="ko-modal-qty-bubble">
                                  {item.quantity}x
                                </span>
                                <p className="item-main-title">{item.product?.name || 'Item'}</p>
                              </div>

                              {/* Description */}
                              {item.product?.description && (
                                <p className="item-sub-desc">{item.product.description}</p>
                              )}

                              {/* Specifications (Flavour, Variant, Shape) */}
                              {(flavour || variant || shape) && (
                                <div className="ko-item-meta-chips">
                                  {flavour && (
                                    <span className="ko-item-meta-chip chip-flavour">
                                      Flavour: <strong>{flavour}</strong>
                                    </span>
                                  )}
                                  {variant && (
                                    <span className="ko-item-meta-chip chip-variant">
                                      Variant: <strong>{variant}</strong>
                                    </span>
                                  )}
                                  {shape && (
                                    <span className="ko-item-meta-chip chip-shape">
                                      Shape: <strong>{shape}</strong>
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Add-ons */}
                              {addOns.length > 0 && (
                                <div className="ko-modal-item-addons">
                                  <span className="ko-addons-label">Add-ons</span>
                                  <div className="ko-item-meta-chips-small">
                                    {addOns.map((addOn, i) => (
                                      <span key={i} className="ko-item-meta-chip chip-addon">{addOn}</span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Special Instructions Note */}
                              {itemNotes && (
                                <div className="ko-item-custom-note-box">
                                  <span className="note-label">Instruction:</span>
                                  <p className="item-custom-note-text">"{itemNotes}"</p>
                                </div>
                              )}

                              {/* Price Calculations */}
                              <div className="ko-modal-item-price-row">
                                <span className="ko-item-unit-price">
                                  {fmtMoney(item.price, selectedOrder?.currency)} × {item.quantity}
                                </span>
                                <span className="ko-item-line-total">
                                  {fmtMoney(lineTotal, selectedOrder?.currency)}
                                </span>
                              </div>

                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {getKitchenOrderAddons(selectedOrder).length > 0 && (
                    <div className="op-fd-order-addons">
                      <h4>Order Add-ons</h4>
                      <div className="op-fd-addons-list">
                        {getKitchenOrderAddons(selectedOrder).map((addon: any, idx: number) => (
                          <div key={`${addon.addon_id ?? addon.addonId}-${idx}`} className="op-fd-addon-row">
                            <div className="op-fd-addon-thumb-wrapper">
                              <div className="op-fd-addon-thumb-placeholder" />
                              <div className="op-fd-addon-content">
                                <strong>{addon.addon_name || addon.addonName || addon.name || `Addon #${addon.addon_id ?? addon.addonId ?? idx + 1}`}{addon.quantity ? ` (${addon.quantity} pcs)` : ''}</strong>
                                <div className="op-fd-addon-meta">{fmtMoney(addon.price, selectedOrder.currency)} each</div>
                              </div>
                            </div>
                            <div className="op-fd-addon-price-block">
                              <span>{fmtMoney(addon.total ?? (addon.price * addon.quantity), selectedOrder.currency)}</span>
                              <div className="op-fd-addon-note">Rate included in totals</div>
                            </div>
                          </div>
                        ))}
                        <div className="op-fd-addon-total">
                          <strong>Total Add-ons:</strong>
                          <span>{fmtMoney(getKitchenOrderAddonTotal(selectedOrder), selectedOrder.currency)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {(selectedOrder.greeting_message || selectedOrder.greeting_from || selectedOrder.greeting_to) && (
                    <div className="op-fd-section op-fd-highlight-greeting">
                      <h4>Greeting Card</h4>
                      <div className="op-fd-grid">
                        <div><span className="lbl">To</span><span>{selectedOrder.greeting_to || '—'}</span></div>
                        <div><span className="lbl">From</span><span>{selectedOrder.greeting_from || '—'}</span></div>
                      </div>
                      {selectedOrder.greeting_message && (
                        <p className="op-fd-greeting-message">"{selectedOrder.greeting_message}"</p>
                      )}
                    </div>
                  )}

                  <div className="op-fd-section">
                    <h4>Pricing Summary</h4>
                    {(() => {
                      const itemSubtotal = Number(selectedOrder.subtotal ?? selectedOrder.sub_total ?? (selectedOrder.items?.reduce((sum: number, item: any) => sum + Number(item.line_total ?? (item.price * item.quantity || 0)), 0) || 0));
                      const addonsTotal = getKitchenOrderAddonTotal(selectedOrder);
                      const discount = Number(selectedOrder.discount || 0);
                      const deliveryCharge = Number(selectedOrder.delivery_charge ?? selectedOrder.deliveryCharge ?? 0);
                      const grandTotal = Number(selectedOrder.total ?? selectedOrder.grand_total ?? (itemSubtotal + addonsTotal - discount + deliveryCharge));

                      return (
                        <div className="drawer-cost-breakdown">
                          <div className="cost-row"><span>Subtotal:</span><span>{fmtMoney(itemSubtotal, selectedOrder.currency)}</span></div>
                          {addonsTotal > 0 && <div className="cost-row"><span>Add-ons:</span><span>{fmtMoney(addonsTotal, selectedOrder.currency)}</span></div>}
                          {discount > 0 && <div className="cost-row discount"><span>Discount:</span><span>-{fmtMoney(discount, selectedOrder.currency)}</span></div>}
                          <div className="cost-row"><span>Delivery:</span><span>{fmtMoney(deliveryCharge, selectedOrder.currency)}</span></div>
                          <div className="cost-row total"><span>Grand Total:</span><span>{fmtMoney(grandTotal, selectedOrder.currency)}</span></div>
                        </div>
                      );
                    })()}
                  </div>

                  {selectedOrder.delivery_notes && (
                    <div className="ko-modal-section-box notes-box">
                      <h5>Special Kitchen Notes / Instructions</h5>
                      <p className="notes-text-render">"{selectedOrder.delivery_notes}"</p>
                    </div>
                  )}

                  <div className="op-fd-actions-row">
                    <button className="sage-btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); handleOpenReceipt(selectedOrder.id); }}>
                      <IconPrinter size={13} /> Print Receipt
                    </button>
                    <button className="sage-btn btn-ghost btn-sm" onClick={() => { setModalOpen(false); }}>
                      Open Workflow Panel
                    </button>
                  </div>

                  <div className="ko-modal-action-footer">
                    <button className="ko-modal-cancel-btn" onClick={() => setModalOpen(false)}>Close Window</button>
                    {selectedOrder.status === "ASSIGNED_TO_KITCHEN" && (
                      <button
                        className="ko-action-primary-btn bg-prep"
                        disabled={actionLoading === selectedOrder.id}
                        onClick={(e) => handleStartPreparation(selectedOrder.id, e)}
                      >
                        {actionLoading === selectedOrder.id ? "Starting..." : "Start Preparation"}
                      </button>
                    )}
                    {selectedOrder.status === "PREPARING" && (
                      <button
                        className="ko-action-primary-btn bg-complete"
                        disabled={actionLoading === selectedOrder.id}
                        onClick={(e) => handleMarkReady(selectedOrder.id, e)}
                      >
                        {actionLoading === selectedOrder.id ? "Completing..." : "Mark Ready"}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Receipt modal (opens when clicking receipt icon on an order card) */}
      {isReceiptOpen && (
        <div className="ko-modal-backdrop" onClick={() => setIsReceiptOpen(false)}>
          <div className="ko-modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="ko-modal-header">
              <h3>Print Receipt</h3>
              <button className="ko-modal-close-cross" onClick={() => setIsReceiptOpen(false)}>×</button>
            </div>

            <div className="print-thermal-receipt-sheet">
              {receiptLoading || !selectedOrder ? (
                <div className="ko-modal-spinner-wrapper">
                  <div className="ko-spinner" />
                  <p>Loading receipt…</p>
                </div>
              ) : (
                <>
                  <div className="receipt-crown-title">
                    <h2>ORDER RECEIPT</h2>
                    <p className="divider">- - - - - - - - - - - - - - - - - - -</p>
                  </div>

                  <div className="receipt-basics">
                    <p><strong>Order No:</strong> {selectedOrder.order_number ?? selectedOrder.id}</p>
                    <p><strong>Date:</strong> {fmtDate(selectedOrder.created_at)}</p>
                    <p><strong>Time:</strong> {new Date(selectedOrder.created_at).toLocaleTimeString()}</p>
                    <p><strong>Customer:</strong> {selectedOrder.customer?.first_name} {selectedOrder.customer?.last_name}</p>
                    <p><strong>Phone:</strong> {selectedOrder.customer?.phone_no || selectedOrder.customerPhone}</p>
                    <p><strong>Payment:</strong> {selectedOrder.payment_method || selectedOrder.paymentMethod}</p>
                    <p className="divider">- - - - - - - - - - - - - - - - - - -</p>
                  </div>

                  <div className="receipt-items-table">
                    {selectedOrder.items.map((item: any) => (
                      <div key={`r-${item.id}`} className="receipt-item-row">
                        <div className="receipt-item-main">
                          <span className="receipt-item-name">{item.quantity} x {item.product?.name || item.productName}</span>
                          <span className="receipt-item-price">{fmtMoney(item.line_total ?? (item.price * item.quantity), selectedOrder.currency)}</span>
                        </div>
                        {getAddOns(item).length > 0 && (
                          <div className="receipt-item-addons">Add-ons: {getAddOns(item).join(', ')}</div>
                        )}
                      </div>
                    ))}

                    {selectedOrder.order_addons?.length > 0 && (
                      <>
                        <div className="receipt-divider">-----------------------------------------</div>
                        {selectedOrder.order_addons.map((addon: any, idx: number) => (
                          <div key={`ra-${idx}`} className="receipt-item-row receipt-addon-row">
                            <div className="receipt-item-main">
                              <span className="receipt-item-name">{addon.quantity} × {addon.addon_name || addon.addonName || `Addon #${addon.addon_id ?? addon.addonId}`}</span>
                              <span className="receipt-item-price">{fmtMoney(addon.total ?? (addon.price * addon.quantity), selectedOrder.currency)}</span>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>

                  <div className="receipt-divider">-----------------------------------------</div>

                  {/* totals */}
                  {(() => {
                    const itemSubtotal = Number(selectedOrder.subtotal ?? (selectedOrder.items?.reduce((s: number, it: any) => s + Number(it.line_total ?? (it.price * it.quantity || 0)), 0) || 0));
                    const addonsTotal = Number(selectedOrder.order_addons_total ?? (selectedOrder.order_addons?.reduce((s: number, a: any) => s + Number(a.total ?? (a.price * a.quantity || 0)), 0) || 0));
                    const discount = Number(selectedOrder.discount || 0);
                    const deliveryCharge = Number(selectedOrder.delivery_charge ?? selectedOrder.deliveryCharge ?? 0);
                    const computedGrandTotal = Number(selectedOrder.total ?? (itemSubtotal + addonsTotal - discount + deliveryCharge));

                    return (
                      <div className="receipt-totals">
                        <div className="receipt-total-row"><span>Subtotal:</span><span>{fmtMoney(itemSubtotal, selectedOrder.currency)}</span></div>
                        {addonsTotal > 0 && <div className="receipt-total-row"><span>Add-ons:</span><span>{fmtMoney(addonsTotal, selectedOrder.currency)}</span></div>}
                        {discount > 0 && <div className="receipt-total-row"><span>Discount:</span><span>-{fmtMoney(discount, selectedOrder.currency)}</span></div>}
                        <div className="receipt-total-row"><span>Delivery:</span><span>{fmtMoney(deliveryCharge, selectedOrder.currency)}</span></div>
                        <div className="receipt-divider">-----------------------------------------</div>
                        <div className="receipt-total-row grand-total"><span>GRAND TOTAL:</span><span>{fmtMoney(computedGrandTotal, selectedOrder.currency)}</span></div>
                      </div>
                    );
                  })()}

                  <div className="receipt-divider">-----------------------------------------</div>

                  <div className="receipt-center receipt-footer-msg">
                    <p>Thank you for dining with CakeNTake!</p>
                    <p>Baked fresh daily, prepared artisanally.</p>
                    <p className="receipt-url">www.cakentake.com</p>
                  </div>

                  <div className="receipt-modal-controls no-print footer-gap">
                    <button className="sage-btn btn-secondary btn-sm" onClick={() => window.print()}>
                      <IconPrinter size={13} /><span>Print</span>
                    </button>
                    <button className="sage-btn btn-primary btn-sm" onClick={() => setIsReceiptOpen(false)}>Close</button>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default KitchenOrder;