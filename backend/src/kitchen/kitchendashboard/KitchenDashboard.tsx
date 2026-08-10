// import React, { useState, useEffect, useCallback } from "react";
// import "./KitchenDashboard.css";

// // ─── Interfaces ────────────────────────────────────────────────────────────

// export interface OrderItem {
//   name?: string;
//   product_name?: string;
//   quantity: number;
// }

// export interface Order {
//   id: string | number;
//   status: "ACCEPTED" | "PROCESSING" | "READY" | "DELIVERED" | string;
//   created_at: string;
//   customer_name?: string;
//   items?: OrderItem[];
//   notes?: string;
//   preparation_started_at?: string;
//   completed_by_kitchen_at?: string;
// }

// export interface ReportData {
//   total_completed: number;
//   period_days: number;
//   orders: Order[];
// }

// export interface OrdersResponse {
//   orders: Order[];
// }

// // ─── Config ────────────────────────────────────────────────────────────────
// const API_BASE = "http://localhost:5000"; // ← your backend URL
// const TOKEN_KEY = "access_token";

// function getToken(): string {
//   return localStorage.getItem(TOKEN_KEY) || "";
// }

// async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
//   const res = await fetch(`${API_BASE}${path}`, {
//     ...options,
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${getToken()}`,
//       ...(options.headers || {}),
//     },
//   });
//   if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
//   return res.json();
// }

// function timeAgo(dateStr?: string): string {
//   if (!dateStr) return "—";
//   const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
//   if (diff < 60) return `${diff}s ago`;
//   if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
//   return `${Math.floor(diff / 3600)}h ago`;
// }

// function formatTime(dateStr?: string): string {
//   if (!dateStr) return "—";
//   return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
// }

// // ─── SVG Icons ─────────────────────────────────────────────────────────────
// const Icons = {
//   Dashboard: () => (
//     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//       <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
//       <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
//     </svg>
//   ),
//   Menu: () => (
//     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//       <path d="M3 6h18M3 12h18M3 18h18" />
//     </svg>
//   ),
//   Staff: () => (
//     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//       <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
//       <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
//     </svg>
//   ),
//   Orders: () => (
//     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//       <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
//     </svg>
//   ),
//   Kitchen: () => (
//     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//       <path d="M8.56 2.9A7 7 0 0 1 19 9v1h2v2H3v-2h2V9a7 7 0 0 1 3.56-6.1" /><path d="M12 20v-8" /><path d="M9 20h6" />
//     </svg>
//   ),
//   Clock: () => (
//     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//       <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
//     </svg>
//   ),
//   Fire: () => (
//     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//       <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
//     </svg>
//   ),
//   Check: () => (
//     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//       <polyline points="20 6 9 17 4 12" />
//     </svg>
//   ),
//   Refresh: () => (
//     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//       <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
//       <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
//     </svg>
//   ),
//   Report: () => (
//     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//       <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
//       <line x1="6" y1="20" x2="6" y2="14" />
//     </svg>
//   ),
//   Close: () => (
//     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//       <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
//     </svg>
//   ),
//   User: () => (
//     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//       <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
//     </svg>
//   ),
//   Note: () => (
//     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//       <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
//       <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" />
//       <line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
//     </svg>
//   ),
// };

// // ─── Status Badge ──────────────────────────────────────────────────────────
// interface StatusBadgeProps {
//   status: string;
// }

// function StatusBadge({ status }: StatusBadgeProps) {
//   const map: Record<string, { label: string; color: string; bg: string }> = {
//     ACCEPTED: { label: "Pending", color: "#3B7DD8", bg: "#EBF2FF" },
//     PROCESSING: { label: "Processing", color: "#D97706", bg: "#FEF3C7" },
//     READY: { label: "Ready", color: "#059669", bg: "#D1FAE5" },
//     DELIVERED: { label: "Delivered", color: "#6B7280", bg: "#F3F4F6" },
//   };
//   const s = map[status] || { label: status, color: "#6B7280", bg: "#F3F4F6" };
//   return (
//     <span className="status-badge" style={{ color: s.color, backgroundColor: s.bg }}>
//       {s.label}
//     </span>
//   );
// }

// // ─── Icon Chip ─────────────────────────────────────────────────────────────
// interface IconChipProps {
//   bg: string;
//   color: string;
//   children: React.ReactNode;
// }

// function IconChip({ bg, color, children }: IconChipProps) {
//   return (
//     <span className="icon-chip" style={{ background: bg, color }}>
//       {children}
//     </span>
//   );
// }

// // ─── Stat Card ─────────────────────────────────────────────────────────────
// interface StatCardProps {
//   label: string;
//   value: number | string;
//   chipBg: string;
//   chipColor: string;
//   icon: string | React.ReactNode;
// }

// function StatCard({ label, value, chipBg, chipColor, icon }: StatCardProps) {
//   return (
//     <div className="stat-card">
//       <div className="stat-top">
//         <span className="stat-label">{label}</span>
//         <IconChip bg={chipBg} color={chipColor}>{icon}</IconChip>
//       </div>
//       <div className="stat-value">{value}</div>
//     </div>
//   );
// }

// // ─── Order Card ───────────────────────────────────────────────────────────
// interface OrderCardProps {
//   order: Order;
//   onAction?: (orderId: string | number) => void;
//   actionLabel?: string;
//   actionColor?: string;
//   loading?: boolean;
// }

// function OrderCard({ order, onAction, actionLabel, actionColor, loading }: OrderCardProps) {
//   const items = order.items || [];
//   return (
//     <div className="order-card">
//       <div className="order-card-header">
//         <div className="order-id-row">
//           <span className="order-num">Order #{order.id}</span>
//           <StatusBadge status={order.status} />
//         </div>
//         <span className="order-ago">
//           <Icons.Clock /> {timeAgo(order.created_at)}
//         </span>
//       </div>

//       {order.customer_name && (
//         <div className="order-customer">
//           <Icons.User /> {order.customer_name}
//         </div>
//       )}

//       {items.length > 0 && (
//         <ul className="order-items">
//           {items.map((item, i) => (
//             <li key={i} className="order-item">
//               <span className="item-dot" />
//               <span className="item-name">{item.name || item.product_name || "Item"}</span>
//               <span className="item-qty">×{item.quantity}</span>
//             </li>
//           ))}
//         </ul>
//       )}

//       {order.notes && (
//         <div className="order-note">
//           <Icons.Note /> {order.notes}
//         </div>
//       )}

//       <div className="order-card-footer">
//         <div className="order-times">
//           {order.preparation_started_at && (
//             <span className="order-ts">Started {formatTime(order.preparation_started_at)}</span>
//           )}
//           {order.completed_by_kitchen_at && (
//             <span className="order-ts">Done {formatTime(order.completed_by_kitchen_at)}</span>
//           )}
//         </div>
//         {onAction && actionLabel && actionColor && (
//           <button
//             className="order-action-btn"
//             style={{
//               background: actionColor,
//               color: "#fff",
//             }}
//             onClick={() => onAction(order.id)}
//             disabled={loading}
//           >
//             {loading ? <span className="btn-spinner" /> : actionLabel}
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }

// // ─── Kanban Column ────────────────────────────────────────────────────────
// interface KanbanColumnProps {
//   title: string;
//   count: number;
//   chipBg: string;
//   chipColor: string;
//   chipIcon: React.ReactNode;
//   children: React.ReactNode;
// }

// function KanbanColumn({ title, count, chipBg, chipColor, chipIcon, children }: KanbanColumnProps) {
//   return (
//     <div className="kanban-col">
//       <div className="kanban-col-header">
//         <div className="kanban-col-title-row">
//           <IconChip bg={chipBg} color={chipColor}>{chipIcon}</IconChip>
//           <h3 className="kanban-col-title">{title}</h3>
//         </div>
//         <span className="kanban-count">{count}</span>
//       </div>
//       <div className="kanban-col-body">{children}</div>
//     </div>
//   );
// }

// // ─── Report Modal ─────────────────────────────────────────────────────────
// interface ReportModalProps {
//   onClose: () => void;
// }

// function ReportModal({ onClose }: ReportModalProps) {
//   const [period, setPeriod] = useState<string>("day");
//   const [data, setData] = useState<ReportData | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);

//   useEffect(() => {
//     setLoading(true);
//     apiFetch<ReportData>(`/kitchen/report/${period}`)
//       .then(setData)
//       .catch(console.error)
//       .finally(() => setLoading(false));
//   }, [period]);

//   const tabs = [
//     { key: "day", label: "Today" },
//     { key: "week", label: "This Week" },
//     { key: "month", label: "This Month" },
//   ];

//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="modal-box" onClick={(e) => e.stopPropagation()}>
//         <div className="modal-head">
//           <h2 className="modal-title">Kitchen Report</h2>
//           <button className="modal-close" onClick={onClose}><Icons.Close /></button>
//         </div>
//         <div className="modal-tabs">
//           {tabs.map((t) => (
//             <button
//               key={t.key}
//               className={`modal-tab ${period === t.key ? "modal-tab--active" : ""}`}
//               onClick={() => setPeriod(t.key)}
//             >
//               {t.label}
//             </button>
//           ))}
//         </div>
//         {loading ? (
//           <div className="modal-loading">Loading…</div>
//         ) : data ? (
//           <div className="modal-body">
//             <div className="report-hero">
//               <span className="report-big">{data.total_completed}</span>
//               <span className="report-sub">
//                 orders completed in {data.period_days} day{data.period_days > 1 ? "s" : ""}
//               </span>
//             </div>
//             <table className="report-table">
//               <thead>
//                 <tr>
//                   <th>Order</th>
//                   <th>Customer</th>
//                   <th>Completed At</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {(data.orders || []).map((o) => (
//                   <tr key={o.id}>
//                     <td>#{o.id}</td>
//                     <td>{o.customer_name || "—"}</td>
//                     <td>{formatTime(o.completed_by_kitchen_at)}</td>
//                   </tr>
//                 ))}
//                 {(data.orders || []).length === 0 && (
//                   <tr>
//                     <td colSpan={3} style={{ textAlign: "center", color: "#9CA3AF", padding: "20px" }}>
//                       No completed orders
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         ) : null}
//       </div>
//     </div>
//   );
// }

// // ─── Main Dashboard ───────────────────────────────────────────────────────
// export default function KitchenDashboard() {
//   const [pending, setPending] = useState<Order[]>([]);
//   const [processing, setProcessing] = useState<Order[]>([]);
//   const [completed, setCompleted] = useState<Order[]>([]);
//   const [loadingMap, setLoadingMap] = useState<Record<string | number, boolean>>({});
//   const [fetchError, setFetchError] = useState<string | null>(null);
//   const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
//   const [showReport, setShowReport] = useState<boolean>(false);
//   const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

//   const fetchAll = useCallback(async () => {
//     try {
//       const [p, pr, c] = await Promise.all([
//         apiFetch<OrdersResponse>("/kitchen/orders/pending"),
//         apiFetch<OrdersResponse>("/kitchen/orders/processing"),
//         apiFetch<OrdersResponse>("/kitchen/orders/completed"),
//       ]);
//       setPending(p.orders || []);
//       setProcessing(pr.orders || []);
//       setCompleted(c.orders || []);
//       setLastRefresh(new Date());
//       setFetchError(null);
//     } catch (e: any) {
//       setFetchError(e.message);
//     }
//   }, []);

//   useEffect(() => { 
//     fetchAll(); 
//   }, [fetchAll]);

//   useEffect(() => {
//     if (!autoRefresh) return;
//     const id = setInterval(fetchAll, 15000);
//     return () => clearInterval(id);
//   }, [autoRefresh, fetchAll]);

//   async function startProcessing(orderId: string | number) {
//     setLoadingMap((m) => ({ ...m, [orderId]: true }));
//     try {
//       await apiFetch(`/kitchen/${orderId}/start-processing`, { method: "POST" });
//       await fetchAll();
//     } catch (e: any) { 
//       alert(e.message); 
//     } finally { 
//       setLoadingMap((m) => ({ ...m, [orderId]: false })); 
//     }
//   }

//   async function completeOrder(orderId: string | number) {
//     setLoadingMap((m) => ({ ...m, [orderId]: true }));
//     try {
//       await apiFetch(`/kitchen/${orderId}/complete`, { method: "POST" });
//       await fetchAll();
//     } catch (e: any) { 
//       alert(e.message); 
//     } finally { 
//       setLoadingMap((m) => ({ ...m, [orderId]: false })); 
//     }
//   }

//   return (
//     <>
//       <div className="app-shell">
//         <main className="main-area">
//           {/* ── Page Header ── */}
//           <div className="page-header">
//             <div>
//               <h1 className="page-title">Kitchen Dashboard</h1>
//               <p className="page-sub">
//                 {lastRefresh ? `Last updated ${formatTime(lastRefresh.toISOString())}` : "Loading orders…"}
//               </p>
//             </div>
//             <div className="header-actions">
//               {fetchError && (
//                 <span className="error-pill">⚠ {fetchError}</span>
//               )}
//               <button
//                 className={`hdr-btn ${autoRefresh ? "hdr-btn--active" : ""}`}
//                 onClick={() => setAutoRefresh((v) => !v)}
//                 title="Toggle auto-refresh"
//               >
//                 <Icons.Refresh />
//                 Auto-refresh {autoRefresh ? "On" : "Off"}
//               </button>
//               <button className="hdr-btn" onClick={fetchAll}>
//                 <Icons.Refresh /> Refresh
//               </button>
//               <button className="hdr-btn hdr-btn--primary" onClick={() => setShowReport(true)}>
//                 <Icons.Report /> View Report
//               </button>
//             </div>
//           </div>

//           {/* ── Stat Cards ── */}
//           <div className="stats-grid">
//             <StatCard label="Pending Orders"    value={pending.length}    chipBg="#EBF2FF" chipColor="#3B7DD8" icon="⏳" />
//             <StatCard label="Processing"        value={processing.length} chipBg="#FEF3C7" chipColor="#D97706" icon="🔥" />
//             <StatCard label="Ready to Serve"    value={completed.length}  chipBg="#D1FAE5" chipColor="#059669" icon="✅" />
//             <StatCard label="Total Active"      value={pending.length + processing.length} chipBg="#EDE9FE" chipColor="#7C3AED" icon="📋" />
//           </div>

//           {/* ── Kanban Board ── */}
//           <div className="kanban-board">
//             <KanbanColumn
//               title="Pending"
//               count={pending.length}
//               chipBg="#EBF2FF" chipColor="#3B7DD8"
//               chipIcon={<Icons.Clock />}
//             >
//               {pending.length === 0 ? (
//                 <div className="empty-col">No pending orders right now</div>
//               ) : pending.map((o) => (
//                 <OrderCard
//                   key={o.id} order={o}
//                   onAction={startProcessing}
//                   actionLabel="Start Cooking"
//                   actionColor="#3B7DD8"
//                   loading={!!loadingMap[o.id]}
//                 />
//               ))}
//             </KanbanColumn>

//             <KanbanColumn
//               title="Processing"
//               count={processing.length}
//               chipBg="#FEF3C7" chipColor="#D97706"
//               chipIcon={<Icons.Fire />}
//             >
//               {processing.length === 0 ? (
//                 <div className="empty-col">Nothing cooking right now</div>
//               ) : processing.map((o) => (
//                 <OrderCard
//                   key={o.id} order={o}
//                   onAction={completeOrder}
//                   actionLabel="Mark as Ready"
//                   actionColor="#059669"
//                   loading={!!loadingMap[o.id]}
//                 />
//               ))}
//             </KanbanColumn>

//             <KanbanColumn
//               title="Ready to Serve"
//               count={completed.length}
//               chipBg="#D1FAE5" chipColor="#059669"
//               chipIcon={<Icons.Check />}
//             >
//               {completed.length === 0 ? (
//                 <div className="empty-col">No orders ready yet</div>
//               ) : completed.map((o) => (
//                 <OrderCard key={o.id} order={o} />
//               ))}
//             </KanbanColumn>
//           </div>
//         </main>
//       </div>

//       {showReport && <ReportModal onClose={() => setShowReport(false)} />}
//     </>
//   );
// }


import React, { useState, useEffect, useCallback } from "react";
import "./KitchenDashboard.css";
import {
  getKitchenPending,
  getKitchenProcessing,
  getKitchenCompleted,
  startProcessing,
  completeKitchenOrder,
  getKitchenReportDay,
  getKitchenReportWeek,
  getKitchenReportMonth,
} from "../../services/kitchenService"; // ← adjust path to match your project structure

// ─── Interfaces ────────────────────────────────────────────────────────────
// Matches the actual backend Order.to_dict() / OrderItem.to_dict() shapes.

export interface Product {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  price: number;
}

export interface OrderItem {
  id?: number;
  product?: Product;
  quantity: number;
}

export interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone_no?: string;
}

export interface Order {
  id: string | number;
  status: string;
  created_at: string;
  customer?: Customer;
  items?: OrderItem[];
  delivery_notes?: string;
  preparation_started_at?: string;
  completed_by_kitchen_at?: string;
}

export interface ReportData {
  total_completed: number;
  period_days: number;
  orders: Order[];
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function timeAgo(dateStr?: string): string {
  if (!dateStr) return "—";
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function formatTime(dateStr?: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Backend `to_dict()` returns a nested `customer` object, not `customer_name`.
function customerName(order: Order): string | null {
  const c = order.customer;
  if (!c) return null;
  return `${c.first_name || ""} ${c.last_name || ""}`.trim() || null;
}

// Backend OrderItem.to_dict() returns a nested `product` object, not `name`.
function itemName(item: OrderItem): string {
  return item.product?.name || "Item";
}

// ─── SVG Icons ─────────────────────────────────────────────────────────────
const Icons = {
  Clock: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Fire: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Refresh: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  ),
  Report: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  Close: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  User: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Note: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
  ),
};

// ─── Status Badge ──────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    ASSIGNED_TO_KITCHEN: { label: "Pending", color: "#3B7DD8", bg: "#EBF2FF" },
    PROCESSING: { label: "Processing", color: "#D97706", bg: "#FEF3C7" },
    READY: { label: "Ready", color: "#059669", bg: "#D1FAE5" },
    READY_FOR_DISPATCH: { label: "Ready for dispatch", color: "#059669", bg: "#D1FAE5" },
    DELIVERED: { label: "Delivered", color: "#6B7280", bg: "#F3F4F6" },
  };
  const s = map[status] || { label: status, color: "#6B7280", bg: "#F3F4F6" };
  return (
    <span className="status-badge" style={{ color: s.color, backgroundColor: s.bg }}>
      {s.label}
    </span>
  );
}

function IconChip({ bg, color, children }: { bg: string; color: string; children: React.ReactNode }) {
  return (
    <span className="icon-chip" style={{ background: bg, color }}>
      {children}
    </span>
  );
}

function StatCard({ label, value, chipBg, chipColor, icon }: {
  label: string; value: number | string; chipBg: string; chipColor: string; icon: React.ReactNode;
}) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        <IconChip bg={chipBg} color={chipColor}>{icon}</IconChip>
      </div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

function OrderCard({ order, onAction, actionLabel, actionColor, loading }: {
  order: Order;
  onAction?: (orderId: string | number) => void;
  actionLabel?: string;
  actionColor?: string;
  loading?: boolean;
}) {
  const items = order.items || [];
  const name = customerName(order);

  return (
    <div className="order-card">
      <div className="order-card-header">
        <div className="order-id-row">
          <span className="order-num">Order #{order.id}</span>
          <StatusBadge status={order.status} />
        </div>
        <span className="order-ago">
          <Icons.Clock /> {timeAgo(order.created_at)}
        </span>
      </div>

      {name && (
        <div className="order-customer">
          <Icons.User /> {name}
        </div>
      )}

      {items.length > 0 && (
        <ul className="order-items">
          {items.map((item, i) => (
            <li key={i} className="order-item">
              <span className="item-dot" />
              <span className="item-name">{itemName(item)}</span>
              <span className="item-qty">×{item.quantity}</span>
            </li>
          ))}
        </ul>
      )}

      {order.delivery_notes && (
        <div className="order-note">
          <Icons.Note /> {order.delivery_notes}
        </div>
      )}

      <div className="order-card-footer">
        <div className="order-times">
          {order.preparation_started_at && (
            <span className="order-ts">Started {formatTime(order.preparation_started_at)}</span>
          )}
          {order.completed_by_kitchen_at && (
            <span className="order-ts">Done {formatTime(order.completed_by_kitchen_at)}</span>
          )}
        </div>
        {onAction && actionLabel && actionColor && (
          <button
            className="order-action-btn"
            style={{ background: actionColor, color: "#fff" }}
            onClick={() => onAction(order.id)}
            disabled={loading}
          >
            {loading ? <span className="btn-spinner" /> : actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

function KanbanColumn({ title, count, chipBg, chipColor, chipIcon, children }: {
  title: string; count: number; chipBg: string; chipColor: string; chipIcon: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="kanban-col">
      <div className="kanban-col-header">
        <div className="kanban-col-title-row">
          <IconChip bg={chipBg} color={chipColor}>{chipIcon}</IconChip>
          <h3 className="kanban-col-title">{title}</h3>
        </div>
        <span className="kanban-count">{count}</span>
      </div>
      <div className="kanban-col-body">{children}</div>
    </div>
  );
}

// ─── Report Modal ─────────────────────────────────────────────────────────
function ReportModal({ onClose }: { onClose: () => void }) {
  const [period, setPeriod] = useState<"day" | "week" | "month">("day");
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const reportFetchers = {
    day: getKitchenReportDay,
    week: getKitchenReportWeek,
    month: getKitchenReportMonth,
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    reportFetchers[period]()
      .then(setData)
      .catch((e: any) => setError(e?.response?.data?.error || e.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const tabs: { key: "day" | "week" | "month"; label: string }[] = [
    { key: "day", label: "Today" },
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2 className="modal-title">Kitchen Report</h2>
          <button className="modal-close" onClick={onClose}><Icons.Close /></button>
        </div>
        <div className="modal-tabs">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`modal-tab ${period === t.key ? "modal-tab--active" : ""}`}
              onClick={() => setPeriod(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="modal-loading">Loading…</div>
        ) : error ? (
          <div className="modal-loading" style={{ color: "#DC2626" }}>{error}</div>
        ) : data ? (
          <div className="modal-body">
            <div className="report-hero">
              <span className="report-big">{data.total_completed}</span>
              <span className="report-sub">
                orders completed in {data.period_days} day{data.period_days > 1 ? "s" : ""}
              </span>
            </div>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Completed At</th>
                </tr>
              </thead>
              <tbody>
                {(data.orders || []).map((o) => (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>{customerName(o) || "—"}</td>
                    <td>{formatTime(o.completed_by_kitchen_at)}</td>
                  </tr>
                ))}
                {(data.orders || []).length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: "center", color: "#9CA3AF", padding: "20px" }}>
                      No completed orders
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────
export default function KitchenDashboard() {
  const [pending, setPending] = useState<Order[]>([]);
  const [processing, setProcessing] = useState<Order[]>([]);
  const [completed, setCompleted] = useState<Order[]>([]);
  const [loadingMap, setLoadingMap] = useState<Record<string | number, boolean>>({});
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [showReport, setShowReport] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  const fetchAll = useCallback(async () => {
    try {
      const [p, pr, c] = await Promise.all([
        getKitchenPending(),
        getKitchenProcessing(),
        getKitchenCompleted(),
      ]);
      setPending(p || []);
      setProcessing(pr || []);
      setCompleted(c || []);
      setLastRefresh(new Date());
      setFetchError(null);
    } catch (e: any) {
      setFetchError(e?.response?.data?.error || e.message);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(fetchAll, 15000);
    return () => clearInterval(id);
  }, [autoRefresh, fetchAll]);

  async function handleStartProcessing(orderId: string | number) {
    setLoadingMap((m) => ({ ...m, [orderId]: true }));
    try {
      await startProcessing(Number(orderId));
      await fetchAll();
    } catch (e: any) {
      alert(e?.response?.data?.error || e.message);
    } finally {
      setLoadingMap((m) => ({ ...m, [orderId]: false }));
    }
  }

  async function handleCompleteOrder(orderId: string | number) {
    setLoadingMap((m) => ({ ...m, [orderId]: true }));
    try {
      await completeKitchenOrder(Number(orderId));
      await fetchAll();
    } catch (e: any) {
      alert(e?.response?.data?.error || e.message);
    } finally {
      setLoadingMap((m) => ({ ...m, [orderId]: false }));
    }
  }

  return (
    <>
      <div className="app-shell">
        <main className="main-area">
          {/* ── Page Header ── */}
          <div className="page-header">
            <div>
              <h1 className="page-title">Kitchen Dashboard</h1>
              <p className="page-sub">
                {lastRefresh ? `Last updated ${formatTime(lastRefresh.toISOString())}` : "Loading orders…"}
              </p>
            </div>
            <div className="header-actions">
              {fetchError && (
                <span className="error-pill">⚠ {fetchError}</span>
              )}
              <button
                className={`hdr-btn ${autoRefresh ? "hdr-btn--active" : ""}`}
                onClick={() => setAutoRefresh((v) => !v)}
                title="Toggle auto-refresh"
              >
                <Icons.Refresh />
                Auto-refresh {autoRefresh ? "On" : "Off"}
              </button>
              <button className="hdr-btn" onClick={fetchAll}>
                <Icons.Refresh /> Refresh
              </button>
              <button className="hdr-btn hdr-btn--primary" onClick={() => setShowReport(true)}>
                <Icons.Report /> View Report
              </button>
            </div>
          </div>

          {/* ── Stat Cards ── */}
          <div className="stats-grid">
            <StatCard label="Pending Orders" value={pending.length} chipBg="#EBF2FF" chipColor="#3B7DD8" icon="⏳" />
            <StatCard label="Processing" value={processing.length} chipBg="#FEF3C7" chipColor="#D97706" icon="🔥" />
            <StatCard label="Ready to Serve" value={completed.length} chipBg="#D1FAE5" chipColor="#059669" icon="✅" />
            <StatCard label="Total Active" value={pending.length + processing.length} chipBg="#EDE9FE" chipColor="#7C3AED" icon="📋" />
          </div>

          {/* ── Kanban Board ── */}
          <div className="kanban-board">
            <KanbanColumn title="Pending" count={pending.length} chipBg="#EBF2FF" chipColor="#3B7DD8" chipIcon={<Icons.Clock />}>
              {pending.length === 0 ? (
                <div className="empty-col">No pending orders right now</div>
              ) : pending.map((o) => (
                <OrderCard key={o.id} order={o} onAction={handleStartProcessing} actionLabel="Start Cooking" actionColor="#3B7DD8" loading={!!loadingMap[o.id]} />
              ))}
            </KanbanColumn>

            <KanbanColumn title="Processing" count={processing.length} chipBg="#FEF3C7" chipColor="#D97706" chipIcon={<Icons.Fire />}>
              {processing.length === 0 ? (
                <div className="empty-col">Nothing cooking right now</div>
              ) : processing.map((o) => (
                <OrderCard key={o.id} order={o} onAction={handleCompleteOrder} actionLabel="Mark as Ready" actionColor="#059669" loading={!!loadingMap[o.id]} />
              ))}
            </KanbanColumn>

            <KanbanColumn title="Ready to Serve" count={completed.length} chipBg="#D1FAE5" chipColor="#059669" chipIcon={<Icons.Check />}>
              {completed.length === 0 ? (
                <div className="empty-col">No orders ready yet</div>
              ) : completed.map((o) => (
                <OrderCard key={o.id} order={o} />
              ))}
            </KanbanColumn>
          </div>
        </main>
      </div>

      {showReport && <ReportModal onClose={() => setShowReport(false)} />}
    </>
  );
}