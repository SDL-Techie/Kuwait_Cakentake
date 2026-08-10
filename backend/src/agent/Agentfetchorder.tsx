// import React, { useEffect, useState } from "react";
// import { ShoppingBag, Loader2, AlertCircle, Package, X } from "lucide-react";
// import "./Agentfetchorder.css";

// // ─────────────────────────────────────────────────────────────────────────────
// // EXISTING SERVICES ONLY — nothing here creates or modifies a service.
// // getAgentOrders / getAgentOrderById are already scoped server-side to the
// // logged-in agent's own orders (/agent/orders, /agent/orders/:id), so this
// // page never needs to filter by user itself — the backend does that.
// // ─────────────────────────────────────────────────────────────────────────────

// import { getAgentOrders, getAgentOrderById } from "../services/agentService";
// import { getOrderHistory } from "../services/orderService";

// /* ─────────────────────────────────────────
//    Types
//    The exact shape returned by the backend for an agent order isn't fully
//    pinned down in the services you shared (getAgentOrders/getAgentOrderById
//    return Promise<any>), so these interfaces are written defensively with
//    optional fields + a catch-all index signature. Trim/tighten once you
//    confirm the real response shape.
// ───────────────────────────────────────── */

// interface OrderItemProductRef {
//   id?: number;
//   name?: string;
//   image_url?: string;
//   image?: string;
// }

// interface AgentOrderItem {
//   id?: number;
//   product_id?: number;
//   quantity: number;
//   product?: OrderItemProductRef;
//   custom_json?: {
//     product_type?: "NORMAL" | "AGENT";
//     original_price?: number;
//     discount_percentage?: number;
//     discount_amount?: number;
//     final_price?: number;
//     line_total?: number;
//     [key: string]: any;
//   };
//   [key: string]: any;
// }

// interface AgentOrderAddress {
//   id?: number;
//   street?: string;
//   block?: string;
//   avenue?: string;
//   building?: string;
//   floor?: string;
//   apartment?: string;
//   delivery_notes?: string;
//   country?: string;
//   area?: { id?: number; name?: string };
//   [key: string]: any;
// }

// interface AgentOrder {
//   id: number;
//   status: string;
//   payment_method?: string;
//   payment_status?: string;
//   currency?: string;
//   total?: number;
//   subtotal?: number;
//   discount_total?: number;
//   delivery_charge?: number;
//   delivery_method?: "PICKUP" | "DELIVERY";
//   order_type?: string;
//   delivery_date?: string;
//   pickup_date?: string;
//   delivery_time_slot?: string;
//   pickup_time_slot?: string;
//   agent_discount_percentage?: number;
//   agent_notes?: string;
//   created_at: string;
//   updated_at?: string;
//   items: AgentOrderItem[];
//   address?: AgentOrderAddress;
//   [key: string]: any;
// }

// interface HistoryEntry {
//   id?: number;
//   status?: string;
//   note?: string;
//   created_at?: string;
//   changed_by?: string;
//   [key: string]: any;
// }

// /* ─────────────────────────────────────────
//    Helpers
// ───────────────────────────────────────── */

// const fmtDate = (d?: string) =>
//   d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

// const fmtTime = (d?: string) =>
//   d ? new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "";

// const fmtMoney = (value?: number) => (Number(value) || 0).toFixed(2);

// const normalizeOrderMethod = (order: any) => {
//   const raw = String(order?.delivery_method ?? order?.deliveryMethod ?? order?.order_type ?? order?.orderType ?? '').trim().toLowerCase();
//   return raw;
// };

// const isPickupOrder = (order: any) => {
//   const method = normalizeOrderMethod(order);
//   return method === 'pickup' || method.includes('pickup');
// };

// const getStatusBadgeClass = (status?: string) => {
//   const statusLower = (status || "pending").toLowerCase();
//   return `af-status-badge af-status-${statusLower}`;
// };

// const STATUS_FILTERS = [
//   { value: "ALL", label: "All" },
//   { value: "PENDING", label: "Pending" },
//   { value: "ACCEPTED", label: "Accepted" },
//   { value: "ASSIGNED_TO_KITCHEN", label: "In Kitchen" },
//   { value: "READY", label: "Ready" },
//   { value: "ASSIGNED_TO_AGENT", label: "Assigned" },
//   { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
//   { value: "DELIVERED", label: "Delivered" },
//   { value: "CANCELLED", label: "Cancelled" },
//   { value: "REJECTED", label: "Rejected" },
// ];

// const itemDisplayName = (item: AgentOrderItem): string => {
//   if (item.product?.name) return item.product.name;
//   if (item.custom_json?.product_type === "AGENT") return "Agent Product";
//   return "Item";
// };

// const itemDisplayImage = (item: AgentOrderItem): string | undefined =>
//   item.product?.image_url || item.product?.image;

// const itemUnitPrice = (item: AgentOrderItem): number =>
//   item.custom_json?.final_price ?? item.custom_json?.original_price ?? item.price ?? 0;

// /* ─────────────────────────────────────────
//    Order Card
// ───────────────────────────────────────── */

// const AgentOrderCard: React.FC<{ order: AgentOrder; onClick: () => void }> = ({ order, onClick }) => {
//   const symbol = order.currency || "KWD";

//   return (
//     <div className="af-order-card" onClick={onClick} role="button" tabIndex={0}>
//       <div className="af-card-header">
//         <div>
//           <h3 className="af-card-title">Order #{String(order.id).padStart(6, "0")}</h3>
//           <p className="af-card-date">
//             {fmtDate(order.created_at)} at {fmtTime(order.created_at)}
//           </p>
//         </div>
//         <span className={getStatusBadgeClass(order.status)}>{(order.status || "pending").replace(/_/g, " ").toUpperCase()}</span>
//       </div>

//       <div className="af-card-items">
//         {order.items && order.items.length > 0 ? (
//           <>
//             {order.items.slice(0, 2).map((item, idx) => (
//               <div key={item.id ?? idx} className="af-card-item">
//                 <span className="af-item-name">{itemDisplayName(item)}</span>
//                 <span className="af-item-qty">×{item.quantity}</span>
//               </div>
//             ))}
//             {order.items.length > 2 && (
//               <p className="af-more-items">+{order.items.length - 2} more items</p>
//             )}
//           </>
//         ) : (
//           <p className="af-no-items-text">No items</p>
//         )}
//       </div>

//       <div className="af-card-footer">
//         <span className="af-card-meta">
//           {isPickupOrder(order) ? "Pickup" : "Delivery"} · {order.payment_method || "N/A"}
//         </span>
//         <p className="af-card-total">
//           {symbol} {fmtMoney(order.total ?? order.subtotal)}
//         </p>
//       </div>
//     </div>
//   );
// };

// /* ─────────────────────────────────────────
//    Order Detail Modal
// ───────────────────────────────────────── */

// const OrderDetailModal: React.FC<{
//   orderId: number;
//   onClose: () => void;
// }> = ({ orderId, onClose }) => {
//   const [order, setOrder] = useState<AgentOrder | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string>("");
//   const [history, setHistory] = useState<HistoryEntry[]>([]);

//   useEffect(() => {
//     let cancelled = false;

//     const load = async () => {
//       setLoading(true);
//       setError("");
//       try {
//         const detail = await getAgentOrderById(orderId);
//         if (!cancelled) setOrder(detail);
//       } catch (err) {
//         if (!cancelled) setError("Could not load this order's details.");
//       } finally {
//         if (!cancelled) setLoading(false);
//       }

//       // Best-effort — some deployments may not expose history to agents.
//       try {
//         const h = await getOrderHistory(orderId);
//         if (!cancelled) setHistory(Array.isArray(h) ? h : []);
//       } catch (err) {
//         // silently ignore — history is a nice-to-have, not core to the modal
//       }
//     };

//     load();
//     return () => {
//       cancelled = true;
//     };
//   }, [orderId]);

//   const symbol = order?.currency || "KWD";

//   return (
//     <div className="af-modal-overlay" onClick={onClose}>
//       <div className="af-modal" onClick={(e) => e.stopPropagation()}>
//         <button type="button" className="af-modal-close" onClick={onClose} aria-label="Close">
//           <X size={18} />
//         </button>

//         {loading ? (
//           <div className="af-modal-loading">
//             <Loader2 className="af-spinner" size={28} />
//             <p>Loading order details…</p>
//           </div>
//         ) : error || !order ? (
//           <div className="af-modal-error">
//             <AlertCircle size={20} />
//             <span>{error || "Order not found."}</span>
//           </div>
//         ) : (
//           <>
//             <div className="af-modal-header">
//               <h2>Order #{String(order.id).padStart(6, "0")}</h2>
//               <span className={getStatusBadgeClass(order.status)}>
//                 {(order.status || "pending").replace(/_/g, " ").toUpperCase()}
//               </span>
//             </div>
//             <p className="af-modal-date">
//               Placed on {fmtDate(order.created_at)} at {fmtTime(order.created_at)}
//             </p>

//             {/* Items */}
//             <section className="af-modal-section">
//               <h3>Items</h3>
//               <div className="af-detail-items">
//                 {order.items?.length ? (
//                   order.items.map((item, idx) => {
//                     const unit = itemUnitPrice(item);
//                     const lineTotal = item.custom_json?.line_total ?? unit * item.quantity;
//                     return (
//                       <div key={item.id ?? idx} className="af-detail-item">
//                         {itemDisplayImage(item) ? (
//                           <img src={itemDisplayImage(item)} alt={itemDisplayName(item)} className="af-detail-item-img" />
//                         ) : (
//                           <div className="af-detail-item-img af-detail-item-img-placeholder">
//                             <Package size={18} />
//                           </div>
//                         )}
//                         <div className="af-detail-item-info">
//                           <p className="af-detail-item-name">{itemDisplayName(item)}</p>
//                           {item.custom_json?.product_type && (
//                             <span
//                               className={`af-tag ${
//                                 item.custom_json.product_type === "AGENT" ? "af-tag-agent" : "af-tag-normal"
//                               }`}
//                             >
//                               {item.custom_json.product_type === "AGENT" ? "Agent Exclusive" : "Normal"}
//                             </span>
//                           )}
//                           {!!item.custom_json?.discount_percentage && (
//                             <p className="af-detail-item-discount">
//                               {item.custom_json.discount_percentage}% off (-{symbol} {fmtMoney(item.custom_json.discount_amount)})
//                             </p>
//                           )}
//                         </div>
//                         <div className="af-detail-item-qty">×{item.quantity}</div>
//                         <div className="af-detail-item-total">{symbol} {fmtMoney(lineTotal)}</div>
//                       </div>
//                     );
//                   })
//                 ) : (
//                   <p className="af-muted">No items on this order.</p>
//                 )}
//               </div>
//             </section>

//             {/* Delivery / Pickup */}
//             <section className="af-modal-section">
//               <h3>{isPickupOrder(order) ? "Pickup" : "Delivery"}</h3>
//               {isPickupOrder(order) ? (
//                 <p className="af-muted">This order is set for pickup.</p>
//               ) : order.address ? (
//                 <p className="af-address-text">
//                   {[order.address.block, order.address.avenue, order.address.street,
//                     order.address.building ? `Building ${order.address.building}` : null,
//                     order.address.floor ? `Floor ${order.address.floor}` : null,
//                     order.address.apartment ? `Apt ${order.address.apartment}` : null]
//                     .filter(Boolean)
//                     .join(", ")}
//                   {order.address.area?.name ? ` · ${order.address.area.name}` : ""}
//                   {order.address.country ? `, ${order.address.country}` : ""}
//                 </p>
//               ) : (
//                 <p className="af-muted">No address on file for this order.</p>
//               )}
//               {(order.delivery_date || order.delivery_time_slot || order.pickup_date || order.pickup_time_slot) && (
//                 <p className="af-muted">
//                   {isPickupOrder(order)
//                     ? `${order.pickup_date ? fmtDate(order.pickup_date) : order.delivery_date ? fmtDate(order.delivery_date) : ""}${order.pickup_time_slot || order.delivery_time_slot ? ` · ${order.pickup_time_slot || order.delivery_time_slot}` : ""}`
//                     : `${order.delivery_date ? fmtDate(order.delivery_date) : ""}${order.delivery_time_slot ? ` · ${order.delivery_time_slot}` : ""}`}
//                 </p>
//               )}
//             </section>

//             {/* Payment */}
//             <section className="af-modal-section">
//               <h3>Payment</h3>
//               <p className="af-muted">
//                 <strong>Method:</strong> {order.payment_method || "N/A"}
//               </p>
//               <p className="af-muted">
//                 <strong>Status:</strong> {order.payment_status || "Pending"}
//               </p>
//             </section>

//             {order.agent_notes && (
//               <section className="af-modal-section">
//                 <h3>Notes</h3>
//                 <p className="af-muted">{order.agent_notes}</p>
//               </section>
//             )}

//             {/* Totals */}
//             <section className="af-modal-section af-totals-section">
//               <div className="af-summary-row">
//                 <span>Subtotal</span>
//                 <span>{symbol} {fmtMoney(order.subtotal ?? order.total)}</span>
//               </div>
//               {!!order.discount_total && (
//                 <div className="af-summary-row af-summary-discount">
//                   <span>Agent Discount</span>
//                   <span>-{symbol} {fmtMoney(order.discount_total)}</span>
//                 </div>
//               )}
//               <div className="af-summary-row">
//                 <span>Delivery Charge</span>
//                 <span>{symbol} {fmtMoney(order.delivery_charge)}</span>
//               </div>
//               <div className="af-summary-row af-summary-grand-total">
//                 <span>Grand Total</span>
//                 <span>{symbol} {fmtMoney(order.total)}</span>
//               </div>
//             </section>

//             {/* Timeline (best-effort) */}
//             {history.length > 0 && (
//               <section className="af-modal-section">
//                 <h3>Order Timeline</h3>
//                 <div className="af-timeline">
//                   {history.map((h, idx) => (
//                     <div key={h.id ?? idx} className="af-timeline-row">
//                       <span className="af-timeline-dot" />
//                       <div>
//                         <p className="af-timeline-status">{(h.status || "").replace(/_/g, " ")}</p>
//                         {h.created_at && <p className="af-timeline-date">{fmtDate(h.created_at)} {fmtTime(h.created_at)}</p>}
//                         {h.note && <p className="af-timeline-note">{h.note}</p>}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </section>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// /* ─────────────────────────────────────────
//    Main Component
// ───────────────────────────────────────── */

// const Agentfetchorder: React.FC = () => {
//   const [orders, setOrders] = useState<AgentOrder[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string>("");
//   const [statusFilter, setStatusFilter] = useState<string>("ALL");
//   const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

//   useEffect(() => {
//     let cancelled = false;

//     const fetchOrders = async () => {
//       setLoading(true);
//       setError("");
//       try {
//         const list = await getAgentOrders(statusFilter === "ALL" ? undefined : statusFilter);
//         if (!cancelled) {
//           const sorted = [...(list || [])].sort(
//             (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
//           );
//           setOrders(sorted);
//         }
//       } catch (err: any) {
//         if (!cancelled) {
//           if (err?.response?.status === 401) {
//             setError("Please login again.");
//           } else if (err?.response?.status === 403) {
//             setError("You are not allowed to view these orders.");
//           } else {
//             setError(err?.response?.data?.error || "Could not load your orders.");
//           }
//         }
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     };

//     fetchOrders();
//     return () => {
//       cancelled = true;
//     };
//   }, [statusFilter]);

//   return (
//     <div className="af-page">
//       <div className="af-wrapper">
//         <div className="af-header">
//           <div>
//             <p className="af-eyebrow">Agent</p>
//             <h1>Your Orders</h1>
//           </div>
//           <div className="af-order-count">
//             <ShoppingBag size={16} />
//             <span>{orders.length} {orders.length === 1 ? "order" : "orders"}</span>
//           </div>
//         </div>

//         <div className="af-filter-chips">
//           {STATUS_FILTERS.map((f) => (
//             <button
//               key={f.value}
//               type="button"
//               className={`af-chip ${statusFilter === f.value ? "af-chip-active" : ""}`}
//               onClick={() => setStatusFilter(f.value)}
//             >
//               {f.label}
//             </button>
//           ))}
//         </div>

//         {loading ? (
//           <div className="af-loading-grid">
//             {Array.from({ length: 4 }).map((_, i) => (
//               <div key={i} className="af-order-card af-skeleton-card">
//                 <div className="af-skeleton af-skeleton-line" />
//                 <div className="af-skeleton af-skeleton-line af-skeleton-line-short" />
//                 <div className="af-skeleton af-skeleton-line" />
//               </div>
//             ))}
//           </div>
//         ) : error ? (
//           <div className="af-empty-state">
//             <AlertCircle size={48} />
//             <h2>Something went wrong</h2>
//             <p>{error}</p>
//           </div>
//         ) : orders.length === 0 ? (
//           <div className="af-empty-state">
//             <Package size={48} />
//             <h2>No orders yet</h2>
//             <p>Orders you place for yourself will show up here.</p>
//           </div>
//         ) : (
//           <div className="af-orders-grid">
//             {orders.map((order) => (
//               <AgentOrderCard key={order.id} order={order} onClick={() => setSelectedOrderId(order.id)} />
//             ))}
//           </div>
//         )}
//       </div>

//       {selectedOrderId !== null && (
//         <OrderDetailModal orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />
//       )}
//     </div>
//   );
// };

// export default Agentfetchorder;


import React, { useEffect, useState } from "react";
import { ShoppingBag, Loader2, AlertCircle, Package, X } from "lucide-react";
import "./Agentfetchorder.css";

// ─────────────────────────────────────────────────────────────────────────────
// EXISTING SERVICES ONLY — nothing here creates or modifies a service.
// getAgentOrders / getAgentOrderById are already scoped server-side to the
// logged-in agent's own orders (/agent/orders, /agent/orders/:id), so this
// page never needs to filter by user itself — the backend does that.
// ─────────────────────────────────────────────────────────────────────────────

import { getAgentOrders, getAgentOrderById } from "../services/agentService";
import { getOrderHistory } from "../services/orderService";

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */

interface OrderItemProductRef {
  id?: number;
  name?: string;
  image_url?: string;
  image?: string;
}

// ── NEW: agent-exclusive product reference, mirrors OrderItem.to_dict()'s
// "agent_product" key added on the backend ──────────────────────────────
interface OrderItemAgentProductRef {
  id?: number;
  name?: string;
  description?: string;
  image?: string;
}

interface AgentOrderItem {
  id?: number;
  product_id?: number;
  agent_product_id?: number;               // ← NEW
  quantity: number;
  product?: OrderItemProductRef;
  agent_product?: OrderItemAgentProductRef; // ← NEW
  custom_json?: {
    product_type?: "NORMAL" | "AGENT";
    original_price?: number;
    discount_percentage?: number;
    discount_amount?: number;
    final_price?: number;
    line_total?: number;
    [key: string]: any;
  };
  [key: string]: any;
}

interface AgentOrderAddress {
  id?: number;
  street?: string;
  block?: string;
  avenue?: string;
  building?: string;
  floor?: string;
  apartment?: string;
  delivery_notes?: string;
  country?: string;
  area?: { id?: number; name?: string };
  [key: string]: any;
}

interface AgentOrder {
  id: number;
  status: string;
  payment_method?: string;
  payment_status?: string;
  currency?: string;
  total?: number;
  subtotal?: number;
  discount_total?: number;
  delivery_charge?: number;
  delivery_method?: "PICKUP" | "DELIVERY";
  order_type?: string;
  delivery_date?: string;
  pickup_date?: string;
  delivery_time_slot?: string;
  pickup_time_slot?: string;
  agent_discount_percentage?: number;
  agent_notes?: string;
  created_at: string;
  updated_at?: string;
  items: AgentOrderItem[];
  address?: AgentOrderAddress;
  [key: string]: any;
}

interface HistoryEntry {
  id?: number;
  status?: string;
  note?: string;
  created_at?: string;
  changed_by?: string;
  [key: string]: any;
}

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

const fmtTime = (d?: string) =>
  d ? new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "";

const fmtMoney = (value?: number) => (Number(value) || 0).toFixed(2);

const normalizeOrderMethod = (order: any) => {
  const raw = String(order?.delivery_method ?? order?.deliveryMethod ?? order?.order_type ?? order?.orderType ?? '').trim().toLowerCase();
  return raw;
};

const isPickupOrder = (order: any) => {
  const method = normalizeOrderMethod(order);
  return method === 'pickup' || method.includes('pickup');
};

const getStatusBadgeClass = (status?: string) => {
  const statusLower = (status || "pending").toLowerCase();
  return `af-status-badge af-status-${statusLower}`;
};

const STATUS_FILTERS = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "ASSIGNED_TO_KITCHEN", label: "In Kitchen" },
  { value: "READY", label: "Ready" },
  { value: "ASSIGNED_TO_AGENT", label: "Assigned" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REJECTED", label: "Rejected" },
];

// ── UPDATED: check agent_product first when the line is an AGENT item ──
const itemDisplayName = (item: AgentOrderItem): string => {
  if (item.custom_json?.product_type === "AGENT") {
    return item.agent_product?.name || "Agent Product";
  }
  return item.product?.name || "Item";
};

// ── UPDATED: pull the image from the correct source per product_type ──
const itemDisplayImage = (item: AgentOrderItem): string | undefined =>
  item.custom_json?.product_type === "AGENT"
    ? item.agent_product?.image
    : item.product?.image_url || item.product?.image;

const itemUnitPrice = (item: AgentOrderItem): number =>
  item.custom_json?.final_price ?? item.custom_json?.original_price ?? item.price ?? 0;

/* ─────────────────────────────────────────
   Order Card
───────────────────────────────────────── */

const AgentOrderCard: React.FC<{ order: AgentOrder; onClick: () => void }> = ({ order, onClick }) => {
  const symbol = order.currency || "KWD";

  return (
    <div className="af-order-card" onClick={onClick} role="button" tabIndex={0}>
      <div className="af-card-header">
        <div>
          <h3 className="af-card-title">Order #{String(order.id).padStart(6, "0")}</h3>
          <p className="af-card-date">
            {fmtDate(order.created_at)} at {fmtTime(order.created_at)}
          </p>
        </div>
        <span className={getStatusBadgeClass(order.status)}>{(order.status || "pending").replace(/_/g, " ").toUpperCase()}</span>
      </div>

      <div className="af-card-items">
        {order.items && order.items.length > 0 ? (
          <>
            {order.items.slice(0, 2).map((item, idx) => (
              <div key={item.id ?? idx} className="af-card-item">
                <span className="af-item-name">{itemDisplayName(item)}</span>
                <span className="af-item-qty">×{item.quantity}</span>
              </div>
            ))}
            {order.items.length > 2 && (
              <p className="af-more-items">+{order.items.length - 2} more items</p>
            )}
          </>
        ) : (
          <p className="af-no-items-text">No items</p>
        )}
      </div>

      <div className="af-card-footer">
        <span className="af-card-meta">
          {isPickupOrder(order) ? "Pickup" : "Delivery"} · {order.payment_method || "N/A"}
        </span>
        <p className="af-card-total">
          {symbol} {fmtMoney(order.total ?? order.subtotal)}
        </p>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   Order Detail Modal
───────────────────────────────────────── */

const OrderDetailModal: React.FC<{
  orderId: number;
  onClose: () => void;
}> = ({ orderId, onClose }) => {
  const [order, setOrder] = useState<AgentOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const detail = await getAgentOrderById(orderId);
        if (!cancelled) setOrder(detail);
      } catch (err) {
        if (!cancelled) setError("Could not load this order's details.");
      } finally {
        if (!cancelled) setLoading(false);
      }

      // Best-effort — some deployments may not expose history to agents.
      try {
        const h = await getOrderHistory(orderId);
        if (!cancelled) setHistory(Array.isArray(h) ? h : []);
      } catch (err) {
        // silently ignore — history is a nice-to-have, not core to the modal
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const symbol = order?.currency || "KWD";

  return (
    <div className="af-modal-overlay" onClick={onClose}>
      <div className="af-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="af-modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        {loading ? (
          <div className="af-modal-loading">
            <Loader2 className="af-spinner" size={28} />
            <p>Loading order details…</p>
          </div>
        ) : error || !order ? (
          <div className="af-modal-error">
            <AlertCircle size={20} />
            <span>{error || "Order not found."}</span>
          </div>
        ) : (
          <>
            <div className="af-modal-header">
              <h2>Order #{String(order.id).padStart(6, "0")}</h2>
              <span className={getStatusBadgeClass(order.status)}>
                {(order.status || "pending").replace(/_/g, " ").toUpperCase()}
              </span>
            </div>
            <p className="af-modal-date">
              Placed on {fmtDate(order.created_at)} at {fmtTime(order.created_at)}
            </p>

            {/* Items */}
            <section className="af-modal-section">
              <h3>Items</h3>
              <div className="af-detail-items">
                {order.items?.length ? (
                  order.items.map((item, idx) => {
                    const unit = itemUnitPrice(item);
                    const lineTotal = item.custom_json?.line_total ?? unit * item.quantity;
                    return (
                      <div key={item.id ?? idx} className="af-detail-item">
                        {itemDisplayImage(item) ? (
                          <img src={itemDisplayImage(item)} alt={itemDisplayName(item)} className="af-detail-item-img" />
                        ) : (
                          <div className="af-detail-item-img af-detail-item-img-placeholder">
                            <Package size={18} />
                          </div>
                        )}
                        <div className="af-detail-item-info">
                          <p className="af-detail-item-name">{itemDisplayName(item)}</p>
                          {item.custom_json?.product_type && (
                            <span
                              className={`af-tag ${
                                item.custom_json.product_type === "AGENT" ? "af-tag-agent" : "af-tag-normal"
                              }`}
                            >
                              {item.custom_json.product_type === "AGENT" ? "Agent Exclusive" : "Normal"}
                            </span>
                          )}
                          {!!item.custom_json?.discount_percentage && (
                            <p className="af-detail-item-discount">
                              {item.custom_json.discount_percentage}% off (-{symbol} {fmtMoney(item.custom_json.discount_amount)})
                            </p>
                          )}
                        </div>
                        <div className="af-detail-item-qty">×{item.quantity}</div>
                        <div className="af-detail-item-total">{symbol} {fmtMoney(lineTotal)}</div>
                      </div>
                    );
                  })
                ) : (
                  <p className="af-muted">No items on this order.</p>
                )}
              </div>
            </section>

            {/* Delivery / Pickup */}
            <section className="af-modal-section">
              <h3>{isPickupOrder(order) ? "Pickup" : "Delivery"}</h3>
              {isPickupOrder(order) ? (
                <p className="af-muted">This order is set for pickup.</p>
              ) : order.address ? (
                <p className="af-address-text">
                  {[order.address.block, order.address.avenue, order.address.street,
                    order.address.building ? `Building ${order.address.building}` : null,
                    order.address.floor ? `Floor ${order.address.floor}` : null,
                    order.address.apartment ? `Apt ${order.address.apartment}` : null]
                    .filter(Boolean)
                    .join(", ")}
                  {order.address.area?.name ? ` · ${order.address.area.name}` : ""}
                  {order.address.country ? `, ${order.address.country}` : ""}
                </p>
              ) : (
                <p className="af-muted">No address on file for this order.</p>
              )}
              {(order.delivery_date || order.delivery_time_slot || order.pickup_date || order.pickup_time_slot) && (
                <p className="af-muted">
                  {isPickupOrder(order)
                    ? `${order.pickup_date ? fmtDate(order.pickup_date) : order.delivery_date ? fmtDate(order.delivery_date) : ""}${order.pickup_time_slot || order.delivery_time_slot ? ` · ${order.pickup_time_slot || order.delivery_time_slot}` : ""}`
                    : `${order.delivery_date ? fmtDate(order.delivery_date) : ""}${order.delivery_time_slot ? ` · ${order.delivery_time_slot}` : ""}`}
                </p>
              )}
            </section>

            {/* Payment */}
            <section className="af-modal-section">
              <h3>Payment</h3>
              <p className="af-muted">
                <strong>Method:</strong> {order.payment_method || "N/A"}
              </p>
              <p className="af-muted">
                <strong>Status:</strong> {order.payment_status || "Pending"}
              </p>
            </section>

            {order.agent_notes && (
              <section className="af-modal-section">
                <h3>Notes</h3>
                <p className="af-muted">{order.agent_notes}</p>
              </section>
            )}

            {/* Totals */}
            <section className="af-modal-section af-totals-section">
              <div className="af-summary-row">
                <span>Subtotal</span>
                <span>{symbol} {fmtMoney(order.subtotal ?? order.total)}</span>
              </div>
              {!!order.discount_total && (
                <div className="af-summary-row af-summary-discount">
                  <span>Agent Discount</span>
                  <span>-{symbol} {fmtMoney(order.discount_total)}</span>
                </div>
              )}
              <div className="af-summary-row">
                <span>Delivery Charge</span>
                <span>{symbol} {fmtMoney(order.delivery_charge)}</span>
              </div>
              <div className="af-summary-row af-summary-grand-total">
                <span>Grand Total</span>
                <span>{symbol} {fmtMoney(order.total)}</span>
              </div>
            </section>

            {/* Timeline (best-effort) */}
            {history.length > 0 && (
              <section className="af-modal-section">
                <h3>Order Timeline</h3>
                <div className="af-timeline">
                  {history.map((h, idx) => (
                    <div key={h.id ?? idx} className="af-timeline-row">
                      <span className="af-timeline-dot" />
                      <div>
                        <p className="af-timeline-status">{(h.status || "").replace(/_/g, " ")}</p>
                        {h.created_at && <p className="af-timeline-date">{fmtDate(h.created_at)} {fmtTime(h.created_at)}</p>}
                        {h.note && <p className="af-timeline-note">{h.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   Main Component
───────────────────────────────────────── */

const Agentfetchorder: React.FC = () => {
  const [orders, setOrders] = useState<AgentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchOrders = async () => {
      setLoading(true);
      setError("");
      try {
        const list = await getAgentOrders(statusFilter === "ALL" ? undefined : statusFilter);
        if (!cancelled) {
          const sorted = [...(list || [])].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          setOrders(sorted);
        }
      } catch (err: any) {
        if (!cancelled) {
          if (err?.response?.status === 401) {
            setError("Please login again.");
          } else if (err?.response?.status === 403) {
            setError("You are not allowed to view these orders.");
          } else {
            setError(err?.response?.data?.error || "Could not load your orders.");
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOrders();
    return () => {
      cancelled = true;
    };
  }, [statusFilter]);

  return (
    <div className="af-page">
      <div className="af-wrapper">
        <div className="af-header">
          <div>
            <p className="af-eyebrow">Agent</p>
            <h1>Your Orders</h1>
          </div>
          <div className="af-order-count">
            <ShoppingBag size={16} />
            <span>{orders.length} {orders.length === 1 ? "order" : "orders"}</span>
          </div>
        </div>

        <div className="af-filter-chips">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              className={`af-chip ${statusFilter === f.value ? "af-chip-active" : ""}`}
              onClick={() => setStatusFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="af-loading-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="af-order-card af-skeleton-card">
                <div className="af-skeleton af-skeleton-line" />
                <div className="af-skeleton af-skeleton-line af-skeleton-line-short" />
                <div className="af-skeleton af-skeleton-line" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="af-empty-state">
            <AlertCircle size={48} />
            <h2>Something went wrong</h2>
            <p>{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="af-empty-state">
            <Package size={48} />
            <h2>No orders yet</h2>
            <p>Orders you place for yourself will show up here.</p>
          </div>
        ) : (
          <div className="af-orders-grid">
            {orders.map((order) => (
              <AgentOrderCard key={order.id} order={order} onClick={() => setSelectedOrderId(order.id)} />
            ))}
          </div>
        )}
      </div>

      {selectedOrderId !== null && (
        <OrderDetailModal orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />
      )}
    </div>
  );
};

export default Agentfetchorder;