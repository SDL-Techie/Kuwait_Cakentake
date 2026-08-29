// // // import React, { useEffect, useState } from "react";
// // // import { ShoppingBag, Loader2, AlertCircle, Package, X } from "lucide-react";
// // // import "./Agentfetchorder.css";

// // // // ─────────────────────────────────────────────────────────────────────────────
// // // // EXISTING SERVICES ONLY — nothing here creates or modifies a service.
// // // // getAgentOrders / getAgentOrderById are already scoped server-side to the
// // // // logged-in agent's own orders (/agent/orders, /agent/orders/:id), so this
// // // // page never needs to filter by user itself — the backend does that.
// // // // ─────────────────────────────────────────────────────────────────────────────

// // // import { getAgentOrders, getAgentOrderById } from "../services/agentService";
// // // import { getOrderHistory } from "../services/orderService";

// // // /* ─────────────────────────────────────────
// // //    Types
// // // ───────────────────────────────────────── */

// // // interface OrderItemProductRef {
// // //   id?: number;
// // //   name?: string;
// // //   image_url?: string;
// // //   image?: string;
// // // }

// // // // ── NEW: agent-exclusive product reference, mirrors OrderItem.to_dict()'s
// // // // "agent_product" key added on the backend ──────────────────────────────
// // // interface OrderItemAgentProductRef {
// // //   id?: number;
// // //   name?: string;
// // //   description?: string;
// // //   image?: string;
// // // }

// // // interface AgentOrderItem {
// // //   id?: number;
// // //   product_id?: number;
// // //   agent_product_id?: number;               // ← NEW
// // //   quantity: number;
// // //   product?: OrderItemProductRef;
// // //   agent_product?: OrderItemAgentProductRef; // ← NEW
// // //   custom_json?: {
// // //     product_type?: "NORMAL" | "AGENT";
// // //     original_price?: number;
// // //     discount_percentage?: number;
// // //     discount_amount?: number;
// // //     final_price?: number;
// // //     line_total?: number;
// // //     [key: string]: any;
// // //   };
// // //   [key: string]: any;
// // // }

// // // interface AgentOrderAddress {
// // //   id?: number;
// // //   street?: string;
// // //   block?: string;
// // //   avenue?: string;
// // //   building?: string;
// // //   floor?: string;
// // //   apartment?: string;
// // //   delivery_notes?: string;
// // //   country?: string;
// // //   area?: { id?: number; name?: string };
// // //   [key: string]: any;
// // // }

// // // interface AgentOrder {
// // //   id: number;
// // //   status: string;
// // //   payment_method?: string;
// // //   payment_status?: string;
// // //   currency?: string;
// // //   total?: number;
// // //   subtotal?: number;
// // //   discount_total?: number;
// // //   delivery_charge?: number;
// // //   delivery_method?: "PICKUP" | "DELIVERY";
// // //   order_type?: string;
// // //   delivery_date?: string;
// // //   pickup_date?: string;
// // //   delivery_time_slot?: string;
// // //   pickup_time_slot?: string;
// // //   agent_discount_percentage?: number;
// // //   agent_notes?: string;
// // //   created_at: string;
// // //   updated_at?: string;
// // //   items: AgentOrderItem[];
// // //   address?: AgentOrderAddress;
// // //   [key: string]: any;
// // // }

// // // interface HistoryEntry {
// // //   id?: number;
// // //   status?: string;
// // //   note?: string;
// // //   created_at?: string;
// // //   changed_by?: string;
// // //   [key: string]: any;
// // // }

// // // /* ─────────────────────────────────────────
// // //    Helpers
// // // ───────────────────────────────────────── */

// // // const fmtDate = (d?: string) =>
// // //   d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

// // // const fmtTime = (d?: string) =>
// // //   d ? new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "";

// // // const fmtMoney = (value?: number) => (Number(value) || 0).toFixed(2);

// // // const normalizeOrderMethod = (order: any) => {
// // //   const raw = String(order?.delivery_method ?? order?.deliveryMethod ?? order?.order_type ?? order?.orderType ?? '').trim().toLowerCase();
// // //   return raw;
// // // };

// // // const isPickupOrder = (order: any) => {
// // //   const method = normalizeOrderMethod(order);
// // //   return method === 'pickup' || method.includes('pickup');
// // // };

// // // const getStatusBadgeClass = (status?: string) => {
// // //   const statusLower = (status || "pending").toLowerCase();
// // //   return `af-status-badge af-status-${statusLower}`;
// // // };

// // // const STATUS_FILTERS = [
// // //   { value: "ALL", label: "All" },
// // //   { value: "PENDING", label: "Pending" },
// // //   { value: "ACCEPTED", label: "Accepted" },
// // //   { value: "ASSIGNED_TO_KITCHEN", label: "In Kitchen" },
// // //   { value: "READY", label: "Ready" },
// // //   { value: "ASSIGNED_TO_AGENT", label: "Assigned" },
// // //   { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
// // //   { value: "DELIVERED", label: "Delivered" },
// // //   { value: "CANCELLED", label: "Cancelled" },
// // //   { value: "REJECTED", label: "Rejected" },
// // // ];

// // // // ── UPDATED: check agent_product first when the line is an AGENT item ──
// // // const itemDisplayName = (item: AgentOrderItem): string => {
// // //   if (item.custom_json?.product_type === "AGENT") {
// // //     return item.agent_product?.name || "Agent Product";
// // //   }
// // //   return item.product?.name || "Item";
// // // };

// // // // ── UPDATED: pull the image from the correct source per product_type ──
// // // const itemDisplayImage = (item: AgentOrderItem): string | undefined =>
// // //   item.custom_json?.product_type === "AGENT"
// // //     ? item.agent_product?.image
// // //     : item.product?.image_url || item.product?.image;

// // // const itemUnitPrice = (item: AgentOrderItem): number =>
// // //   item.custom_json?.final_price ?? item.custom_json?.original_price ?? item.price ?? 0;

// // // /* ─────────────────────────────────────────
// // //    Order Card
// // // ───────────────────────────────────────── */

// // // const AgentOrderCard: React.FC<{ order: AgentOrder; onClick: () => void }> = ({ order, onClick }) => {
// // //   const symbol = order.currency || "KWD";

// // //   return (
// // //     <div className="af-order-card" onClick={onClick} role="button" tabIndex={0}>
// // //       <div className="af-card-header">
// // //         <div>
// // //           <h3 className="af-card-title">Order #{String(order.id).padStart(6, "0")}</h3>
// // //           <p className="af-card-date">
// // //             {fmtDate(order.created_at)} at {fmtTime(order.created_at)}
// // //           </p>
// // //         </div>
// // //         <span className={getStatusBadgeClass(order.status)}>{(order.status || "pending").replace(/_/g, " ").toUpperCase()}</span>
// // //       </div>

// // //       <div className="af-card-items">
// // //         {order.items && order.items.length > 0 ? (
// // //           <>
// // //             {order.items.slice(0, 2).map((item, idx) => (
// // //               <div key={item.id ?? idx} className="af-card-item">
// // //                 <span className="af-item-name">{itemDisplayName(item)}</span>
// // //                 <span className="af-item-qty">×{item.quantity}</span>
// // //               </div>
// // //             ))}
// // //             {order.items.length > 2 && (
// // //               <p className="af-more-items">+{order.items.length - 2} more items</p>
// // //             )}
// // //           </>
// // //         ) : (
// // //           <p className="af-no-items-text">No items</p>
// // //         )}
// // //       </div>

// // //       <div className="af-card-footer">
// // //         <span className="af-card-meta">
// // //           {isPickupOrder(order) ? "Pickup" : "Delivery"} · {order.payment_method || "N/A"}
// // //         </span>
// // //         <p className="af-card-total">
// // //           {symbol} {fmtMoney(order.total ?? order.subtotal)}
// // //         </p>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // /* ─────────────────────────────────────────
// // //    Order Detail Modal
// // // ───────────────────────────────────────── */

// // // const OrderDetailModal: React.FC<{
// // //   orderId: number;
// // //   onClose: () => void;
// // // }> = ({ orderId, onClose }) => {
// // //   const [order, setOrder] = useState<AgentOrder | null>(null);
// // //   const [loading, setLoading] = useState(true);
// // //   const [error, setError] = useState<string>("");
// // //   const [history, setHistory] = useState<HistoryEntry[]>([]);

// // //   useEffect(() => {
// // //     let cancelled = false;

// // //     const load = async () => {
// // //       setLoading(true);
// // //       setError("");
// // //       try {
// // //         const detail = await getAgentOrderById(orderId);
// // //         if (!cancelled) setOrder(detail);
// // //       } catch (err) {
// // //         if (!cancelled) setError("Could not load this order's details.");
// // //       } finally {
// // //         if (!cancelled) setLoading(false);
// // //       }

// // //       // Best-effort — some deployments may not expose history to agents.
// // //       try {
// // //         const h = await getOrderHistory(orderId);
// // //         if (!cancelled) setHistory(Array.isArray(h) ? h : []);
// // //       } catch (err) {
// // //         // silently ignore — history is a nice-to-have, not core to the modal
// // //       }
// // //     };

// // //     load();
// // //     return () => {
// // //       cancelled = true;
// // //     };
// // //   }, [orderId]);

// // //   const symbol = order?.currency || "KWD";

// // //   return (
// // //     <div className="af-modal-overlay" onClick={onClose}>
// // //       <div className="af-modal" onClick={(e) => e.stopPropagation()}>
// // //         <button type="button" className="af-modal-close" onClick={onClose} aria-label="Close">
// // //           <X size={18} />
// // //         </button>

// // //         {loading ? (
// // //           <div className="af-modal-loading">
// // //             <Loader2 className="af-spinner" size={28} />
// // //             <p>Loading order details…</p>
// // //           </div>
// // //         ) : error || !order ? (
// // //           <div className="af-modal-error">
// // //             <AlertCircle size={20} />
// // //             <span>{error || "Order not found."}</span>
// // //           </div>
// // //         ) : (
// // //           <>
// // //             <div className="af-modal-header">
// // //               <h2>Order #{String(order.id).padStart(6, "0")}</h2>
// // //               <span className={getStatusBadgeClass(order.status)}>
// // //                 {(order.status || "pending").replace(/_/g, " ").toUpperCase()}
// // //               </span>
// // //             </div>
// // //             <p className="af-modal-date">
// // //               Placed on {fmtDate(order.created_at)} at {fmtTime(order.created_at)}
// // //             </p>

// // //             {/* Items */}
// // //             <section className="af-modal-section">
// // //               <h3>Items</h3>
// // //               <div className="af-detail-items">
// // //                 {order.items?.length ? (
// // //                   order.items.map((item, idx) => {
// // //                     const unit = itemUnitPrice(item);
// // //                     const lineTotal = item.custom_json?.line_total ?? unit * item.quantity;
// // //                     return (
// // //                       <div key={item.id ?? idx} className="af-detail-item">
// // //                         {itemDisplayImage(item) ? (
// // //                           <img src={itemDisplayImage(item)} alt={itemDisplayName(item)} className="af-detail-item-img" />
// // //                         ) : (
// // //                           <div className="af-detail-item-img af-detail-item-img-placeholder">
// // //                             <Package size={18} />
// // //                           </div>
// // //                         )}
// // //                         <div className="af-detail-item-info">
// // //                           <p className="af-detail-item-name">{itemDisplayName(item)}</p>
// // //                           {item.custom_json?.product_type && (
// // //                             <span
// // //                               className={`af-tag ${
// // //                                 item.custom_json.product_type === "AGENT" ? "af-tag-agent" : "af-tag-normal"
// // //                               }`}
// // //                             >
// // //                               {item.custom_json.product_type === "AGENT" ? "Agent Exclusive" : "Normal"}
// // //                             </span>
// // //                           )}
// // //                           {!!item.custom_json?.discount_percentage && (
// // //                             <p className="af-detail-item-discount">
// // //                               {item.custom_json.discount_percentage}% off (-{symbol} {fmtMoney(item.custom_json.discount_amount)})
// // //                             </p>
// // //                           )}
// // //                         </div>
// // //                         <div className="af-detail-item-qty">×{item.quantity}</div>
// // //                         <div className="af-detail-item-total">{symbol} {fmtMoney(lineTotal)}</div>
// // //                       </div>
// // //                     );
// // //                   })
// // //                 ) : (
// // //                   <p className="af-muted">No items on this order.</p>
// // //                 )}
// // //               </div>
// // //             </section>

// // //             {/* Delivery / Pickup */}
// // //             <section className="af-modal-section">
// // //               <h3>{isPickupOrder(order) ? "Pickup" : "Delivery"}</h3>
// // //               {isPickupOrder(order) ? (
// // //                 <p className="af-muted">This order is set for pickup.</p>
// // //               ) : order.address ? (
// // //                 <p className="af-address-text">
// // //                   {[order.address.block, order.address.avenue, order.address.street,
// // //                     order.address.building ? `Building ${order.address.building}` : null,
// // //                     order.address.floor ? `Floor ${order.address.floor}` : null,
// // //                     order.address.apartment ? `Apt ${order.address.apartment}` : null]
// // //                     .filter(Boolean)
// // //                     .join(", ")}
// // //                   {order.address.area?.name ? ` · ${order.address.area.name}` : ""}
// // //                   {order.address.country ? `, ${order.address.country}` : ""}
// // //                 </p>
// // //               ) : (
// // //                 <p className="af-muted">No address on file for this order.</p>
// // //               )}
// // //               {(order.delivery_date || order.delivery_time_slot || order.pickup_date || order.pickup_time_slot) && (
// // //                 <p className="af-muted">
// // //                   {isPickupOrder(order)
// // //                     ? `${order.pickup_date ? fmtDate(order.pickup_date) : order.delivery_date ? fmtDate(order.delivery_date) : ""}${order.pickup_time_slot || order.delivery_time_slot ? ` · ${order.pickup_time_slot || order.delivery_time_slot}` : ""}`
// // //                     : `${order.delivery_date ? fmtDate(order.delivery_date) : ""}${order.delivery_time_slot ? ` · ${order.delivery_time_slot}` : ""}`}
// // //                 </p>
// // //               )}
// // //             </section>

// // //             {/* Payment */}
// // //             <section className="af-modal-section">
// // //               <h3>Payment</h3>
// // //               <p className="af-muted">
// // //                 <strong>Method:</strong> {order.payment_method || "N/A"}
// // //               </p>
// // //               <p className="af-muted">
// // //                 <strong>Status:</strong> {order.payment_status || "Pending"}
// // //               </p>
// // //             </section>

// // //             {order.agent_notes && (
// // //               <section className="af-modal-section">
// // //                 <h3>Notes</h3>
// // //                 <p className="af-muted">{order.agent_notes}</p>
// // //               </section>
// // //             )}

// // //             {/* Totals */}
// // //             <section className="af-modal-section af-totals-section">
// // //               <div className="af-summary-row">
// // //                 <span>Subtotal</span>
// // //                 <span>{symbol} {fmtMoney(order.subtotal ?? order.total)}</span>
// // //               </div>
// // //               {!!order.discount_total && (
// // //                 <div className="af-summary-row af-summary-discount">
// // //                   <span>Agent Discount</span>
// // //                   <span>-{symbol} {fmtMoney(order.discount_total)}</span>
// // //                 </div>
// // //               )}
// // //               <div className="af-summary-row">
// // //                 <span>Delivery Charge</span>
// // //                 <span>{symbol} {fmtMoney(order.delivery_charge)}</span>
// // //               </div>
// // //               <div className="af-summary-row af-summary-grand-total">
// // //                 <span>Grand Total</span>
// // //                 <span>{symbol} {fmtMoney(order.total)}</span>
// // //               </div>
// // //             </section>

// // //             {/* Timeline (best-effort) */}
// // //             {history.length > 0 && (
// // //               <section className="af-modal-section">
// // //                 <h3>Order Timeline</h3>
// // //                 <div className="af-timeline">
// // //                   {history.map((h, idx) => (
// // //                     <div key={h.id ?? idx} className="af-timeline-row">
// // //                       <span className="af-timeline-dot" />
// // //                       <div>
// // //                         <p className="af-timeline-status">{(h.status || "").replace(/_/g, " ")}</p>
// // //                         {h.created_at && <p className="af-timeline-date">{fmtDate(h.created_at)} {fmtTime(h.created_at)}</p>}
// // //                         {h.note && <p className="af-timeline-note">{h.note}</p>}
// // //                       </div>
// // //                     </div>
// // //                   ))}
// // //                 </div>
// // //               </section>
// // //             )}
// // //           </>
// // //         )}
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // /* ─────────────────────────────────────────
// // //    Main Component
// // // ───────────────────────────────────────── */

// // // const Agentfetchorder: React.FC = () => {
// // //   const [orders, setOrders] = useState<AgentOrder[]>([]);
// // //   const [loading, setLoading] = useState(true);
// // //   const [error, setError] = useState<string>("");
// // //   const [statusFilter, setStatusFilter] = useState<string>("ALL");
// // //   const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

// // //   useEffect(() => {
// // //     let cancelled = false;

// // //     const fetchOrders = async () => {
// // //       setLoading(true);
// // //       setError("");
// // //       try {
// // //         const list = await getAgentOrders(statusFilter === "ALL" ? undefined : statusFilter);
// // //         if (!cancelled) {
// // //           const sorted = [...(list || [])].sort(
// // //             (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
// // //           );
// // //           setOrders(sorted);
// // //         }
// // //       } catch (err: any) {
// // //         if (!cancelled) {
// // //           if (err?.response?.status === 401) {
// // //             setError("Please login again.");
// // //           } else if (err?.response?.status === 403) {
// // //             setError("You are not allowed to view these orders.");
// // //           } else {
// // //             setError(err?.response?.data?.error || "Could not load your orders.");
// // //           }
// // //         }
// // //       } finally {
// // //         if (!cancelled) setLoading(false);
// // //       }
// // //     };

// // //     fetchOrders();
// // //     return () => {
// // //       cancelled = true;
// // //     };
// // //   }, [statusFilter]);

// // //   return (
// // //     <div className="af-page">
// // //       <div className="af-wrapper">
// // //         <div className="af-header">
// // //           <div>
// // //             <p className="af-eyebrow">Agent</p>
// // //             <h1>Your Orders</h1>
// // //           </div>
// // //           <div className="af-order-count">
// // //             <ShoppingBag size={16} />
// // //             <span>{orders.length} {orders.length === 1 ? "order" : "orders"}</span>
// // //           </div>
// // //         </div>

// // //         <div className="af-filter-chips">
// // //           {STATUS_FILTERS.map((f) => (
// // //             <button
// // //               key={f.value}
// // //               type="button"
// // //               className={`af-chip ${statusFilter === f.value ? "af-chip-active" : ""}`}
// // //               onClick={() => setStatusFilter(f.value)}
// // //             >
// // //               {f.label}
// // //             </button>
// // //           ))}
// // //         </div>

// // //         {loading ? (
// // //           <div className="af-loading-grid">
// // //             {Array.from({ length: 4 }).map((_, i) => (
// // //               <div key={i} className="af-order-card af-skeleton-card">
// // //                 <div className="af-skeleton af-skeleton-line" />
// // //                 <div className="af-skeleton af-skeleton-line af-skeleton-line-short" />
// // //                 <div className="af-skeleton af-skeleton-line" />
// // //               </div>
// // //             ))}
// // //           </div>
// // //         ) : error ? (
// // //           <div className="af-empty-state">
// // //             <AlertCircle size={48} />
// // //             <h2>Something went wrong</h2>
// // //             <p>{error}</p>
// // //           </div>
// // //         ) : orders.length === 0 ? (
// // //           <div className="af-empty-state">
// // //             <Package size={48} />
// // //             <h2>No orders yet</h2>
// // //             <p>Orders you place for yourself will show up here.</p>
// // //           </div>
// // //         ) : (
// // //           <div className="af-orders-grid">
// // //             {orders.map((order) => (
// // //               <AgentOrderCard key={order.id} order={order} onClick={() => setSelectedOrderId(order.id)} />
// // //             ))}
// // //           </div>
// // //         )}
// // //       </div>

// // //       {selectedOrderId !== null && (
// // //         <OrderDetailModal orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />
// // //       )}
// // //     </div>
// // //   );
// // // };

// // // export default Agentfetchorder;


// // import React, { useEffect, useState } from "react";
// // import { ShoppingBag, Loader2, AlertCircle, Package, X, CalendarClock, MapPin } from "lucide-react";
// // import "./Agentfetchorder.css";

// // // ─────────────────────────────────────────────────────────────────────────────
// // // EXISTING SERVICES ONLY — nothing here creates or modifies a service.
// // // getAgentOrders / getAgentOrderById are already scoped server-side to the
// // // logged-in agent's own orders (/agent/orders, /agent/orders/:id), so this
// // // page never needs to filter by user itself — the backend does that.
// // // ─────────────────────────────────────────────────────────────────────────────

// // import { getAgentOrders, getAgentOrderById } from "../services/agentService";

// // /* ─────────────────────────────────────────
// //    Types
// // ───────────────────────────────────────── */

// // interface OrderItemProductRef {
// //   id?: number;
// //   name?: string;
// //   image_url?: string;
// //   image?: string;
// // }

// // interface OrderItemAgentProductRef {
// //   id?: number;
// //   name?: string;
// //   description?: string;
// //   image?: string;
// // }

// // interface AgentOrderItem {
// //   id?: number;
// //   product_id?: number;
// //   agent_product_id?: number;
// //   quantity: number;
// //   product?: OrderItemProductRef;
// //   agent_product?: OrderItemAgentProductRef;
// //   custom_json?: {
// //     product_type?: "NORMAL" | "AGENT";
// //     original_price?: number;
// //     discount_percentage?: number;
// //     discount_amount?: number;
// //     final_price?: number;
// //     line_total?: number;
// //     [key: string]: any;
// //   };
// //   [key: string]: any;
// // }

// // // Loose shape — delivery_address can come back with varying key names
// // // depending on the endpoint (area as object/string, delivery_notes vs
// // // address_notes, etc.), so we normalize via helpers below rather than
// // // relying on strict typed fields.
// // interface AgentOrderAddress {
// //   id?: number;
// //   street?: string;
// //   block?: string;
// //   avenue?: string;
// //   building?: string;
// //   floor?: string;
// //   apartment?: string;
// //   delivery_notes?: string;
// //   address_notes?: string;
// //   country?: any;
// //   area?: any;
// //   city?: string;
// //   pincode?: string;
// //   landmark?: string;
// //   [key: string]: any;
// // }

// // interface AgentOrder {
// //   id: number;
// //   order_number?: string | number;
// //   status: string;
// //   payment_method?: string;
// //   payment_status?: string;
// //   currency?: string;
// //   total?: number;
// //   subtotal?: number;
// //   discount_total?: number;
// //   delivery_charge?: number;
// //   delivery_method?: "PICKUP" | "DELIVERY";
// //   order_type?: string;
// //   delivery_date?: string;
// //   pickup_date?: string;
// //   delivery_time_slot?: string;
// //   pickup_time_slot?: string;
// //   agent_discount_percentage?: number;
// //   agent_notes?: string;
// //   created_at: string;
// //   updated_at?: string;
// //   items: AgentOrderItem[];
// //   address?: AgentOrderAddress;
// //   delivery_address?: AgentOrderAddress;
// //   [key: string]: any;
// // }

// // /* ─────────────────────────────────────────
// //    Helpers
// // ───────────────────────────────────────── */

// // const fmtDate = (d?: string) =>
// //   d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

// // const fmtTime = (d?: string) =>
// //   d ? new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "";

// // const fmtMoney = (value?: number) => (Number(value) || 0).toFixed(2);

// // // Display order numbers starting from 15000 (e.g. order id 18 → "#15018").
// // const ORDER_NUMBER_OFFSET = 15000;
// // const formatOrderNumber = (order: AgentOrder) => {
// //   const raw = order.order_number ?? order.id;
// //   const num = Number(raw);
// //   if (!Number.isFinite(num)) return `#${raw}`;
// //   return `#${num >= ORDER_NUMBER_OFFSET ? num : ORDER_NUMBER_OFFSET + num}`;
// // };

// // const normalizeOrderMethod = (order: any) => {
// //   const raw = String(order?.delivery_method ?? order?.deliveryMethod ?? order?.order_type ?? order?.orderType ?? '').trim().toLowerCase();
// //   return raw;
// // };

// // const isPickupOrder = (order: any) => {
// //   const method = normalizeOrderMethod(order);
// //   return method === 'pickup' || method.includes('pickup');
// // };

// // const getStatusBadgeClass = (status?: string) => {
// //   const statusLower = (status || "pending").toLowerCase();
// //   return `af-status-badge af-status-${statusLower}`;
// // };

// // const STATUS_FILTERS = [
// //   { value: "ALL", label: "All" },
// //   { value: "PENDING", label: "Pending" },
// //   { value: "ACCEPTED", label: "Accepted" },
// //   { value: "ASSIGNED_TO_KITCHEN", label: "In Kitchen" },
// //   { value: "READY", label: "Ready" },
// //   { value: "ASSIGNED_TO_AGENT", label: "Assigned" },
// //   { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
// //   { value: "DELIVERED", label: "Delivered" },
// //   { value: "CANCELLED", label: "Cancelled" },
// //   { value: "REJECTED", label: "Rejected" },
// // ];

// // const itemDisplayName = (item: AgentOrderItem): string => {
// //   if (item.custom_json?.product_type === "AGENT") {
// //     return item.agent_product?.name || "Agent Product";
// //   }
// //   return item.product?.name || "Item";
// // };

// // const itemDisplayImage = (item: AgentOrderItem): string | undefined =>
// //   item.custom_json?.product_type === "AGENT"
// //     ? item.agent_product?.image
// //     : item.product?.image_url || item.product?.image;

// // // ── Totals — computed purely from cart line items so the numbers shown
// // // always match what's actually itemized (backend order.total/subtotal
// // // fields have been observed to be inconsistent with the item breakdown). ──
// // const computeOrderTotals = (order: AgentOrder) => {
// //   const items = order.items || [];
// //   let subtotalBeforeDiscount = 0;
// //   let discountTotal = 0;

// //   items.forEach((item) => {
// //     const cj = item.custom_json || {};
// //     const qty = Number(item.quantity) || 0;
// //     const unitOriginal = Number(cj.original_price ?? cj.final_price ?? item.price ?? 0);
// //     const unitDiscount = Number(cj.discount_amount ?? 0);
// //     subtotalBeforeDiscount += unitOriginal * qty;
// //     discountTotal += unitDiscount * qty;
// //   });

// //   const itemsTotal = subtotalBeforeDiscount - discountTotal;
// //   const deliveryCharge = Number(order.delivery_charge || 0);
// //   const grandTotal = itemsTotal + deliveryCharge;

// //   return { subtotalBeforeDiscount, discountTotal, itemsTotal, deliveryCharge, grandTotal };
// // };

// // // Resolves the schedule pair (date + time slot) regardless of pickup/delivery
// // const getScheduleInfo = (order: AgentOrder): { date?: string; slot?: string } => {
// //   if (isPickupOrder(order)) {
// //     return {
// //       date: order.pickup_date || order.delivery_date,
// //       slot: order.pickup_time_slot || order.delivery_time_slot,
// //     };
// //   }
// //   return {
// //     date: order.delivery_date,
// //     slot: order.delivery_time_slot,
// //   };
// // };

// // // The order's delivery address may come back under "delivery_address" or
// // // "address" depending on the endpoint — check both.
// // const getOrderAddress = (order: AgentOrder): AgentOrderAddress | null =>
// //   order.delivery_address || order.address || null;

// // /* ── Address field helpers (object-safe, mirrors DeliveryOrder.tsx) ── */

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

// // const ADDRESS_FIELD_DEFS: { label: string; keys?: string[]; resolver?: (a: any) => any }[] = [
// //   { label: 'Area', resolver: getAddressAreaName },
// //   { label: 'Street', keys: ['street', 'street_name'] },
// //   { label: 'Country', resolver: getAddressCountryName },
// //   { label: 'Block', keys: ['block', 'block_no'] },
// //   { label: 'Avenue', keys: ['avenue', 'avenue_name'] },
// //   { label: 'Building', keys: ['building', 'building_name', 'building_no'] },
// //   {
// //     label: 'Floor / Apt',
// //     resolver: (a: any) => {
// //       const floor = a?.floor;
// //       const apt = a?.apartment || a?.apt;
// //       if (!floor && !apt) return null;
// //       return [floor, apt].filter(Boolean).join(' ');
// //     },
// //   },
// //   { label: 'City', keys: ['city'] },
// //   { label: 'Pincode', keys: ['pincode', 'zip', 'postal_code'] },
// //   { label: 'Delivery Notes', keys: ['delivery_notes', 'address_notes', 'addressNotes', 'notes', 'landmark'] },
// // ];

// // const getAddressFields = (address: any) =>
// //   ADDRESS_FIELD_DEFS
// //     .map(({ label, keys, resolver }) => ({
// //       label,
// //       value: resolver ? resolver(address) : getAddressFieldValue(address, keys || []),
// //     }))
// //     .filter((f) => f.value !== null && f.value !== undefined && f.value !== '');

// // /* ── Simplified status steps (replaces the raw timeline) ── */

// // const STATUS_STEPS: { key: string; label: string }[] = [
// //   { key: "PENDING", label: "Pending" },
// //   { key: "CONFIRMED", label: "Order Confirmed" },
// //   { key: "PROCESSING", label: "Processing" },
// //   { key: "READY", label: "Ready for Delivery" },
// //   { key: "DELIVERED", label: "Delivered" },
// // ];

// // const mapStatusToStep = (status?: string): string => {
// //   const s = (status || "").toUpperCase();
// //   if (s === "PENDING") return "PENDING";
// //   if (s === "ACCEPTED" || s === "CONFIRMED") return "CONFIRMED";
// //   if (["ASSIGNED_TO_KITCHEN", "PREPARING", "PROCESSING"].includes(s)) return "PROCESSING";
// //   if (["READY", "ASSIGNED_TO_AGENT", "ASSIGNED_TO_DRIVER", "OUT_FOR_DELIVERY", "DELIVERY_SUBMITTED"].includes(s)) return "READY";
// //   if (s === "DELIVERED") return "DELIVERED";
// //   return s; // CANCELLED / REJECTED — no step highlighted, badge already shows it
// // };

// // /* ─────────────────────────────────────────
// //    Address details block (Area → Delivery Notes)
// // ───────────────────────────────────────── */

// // const AddressDetailsBlock: React.FC<{ address: AgentOrderAddress }> = ({ address }) => {
// //   const fields = getAddressFields(address);
// //   if (fields.length === 0) return null;

// //   return (
// //     <div className="af-card-address-block">
// //       <p className="af-card-address-title">
// //         <MapPin size={12} style={{ verticalAlign: "-2px", marginRight: 4 }} />
// //         Delivery Address
// //       </p>
// //       <div className="af-card-address-grid">
// //         {fields.map((f) => (
// //           <div key={f.label} className={f.label === "Delivery Notes" ? "af-addr-full" : undefined}>
// //             <span>{f.label}:</span>
// //             <strong>{String(f.value)}</strong>
// //           </div>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // };

// // /* ─────────────────────────────────────────
// //    Status steps block
// // ───────────────────────────────────────── */

// // const OrderStatusSteps: React.FC<{ status?: string }> = ({ status }) => {
// //   const currentStep = mapStatusToStep(status);
// //   const currentIndex = STATUS_STEPS.findIndex((s) => s.key === currentStep);

// //   return (
// //     <div className="af-status-steps">
// //       {STATUS_STEPS.map((step, idx) => {
// //         const isDone = currentIndex >= 0 && idx < currentIndex;
// //         const isActive = idx === currentIndex;
// //         return (
// //           <div
// //             key={step.key}
// //             className={`af-status-step ${isDone ? "af-status-step-done" : ""} ${isActive ? "af-status-step-active" : ""}`}
// //           >
// //             <span className="af-status-step-dot" />
// //             <span>{step.label}</span>
// //           </div>
// //         );
// //       })}
// //     </div>
// //   );
// // };

// // /* ─────────────────────────────────────────
// //    Order Card
// // ───────────────────────────────────────── */

// // const AgentOrderCard: React.FC<{ order: AgentOrder; onClick: () => void }> = ({ order, onClick }) => {
// //   const symbol = order.currency || "KWD";
// //   const pickup = isPickupOrder(order);
// //   const { date: scheduleDate, slot: scheduleSlot } = getScheduleInfo(order);
// //   const { grandTotal } = computeOrderTotals(order);
// //   const address = getOrderAddress(order);

// //   return (
// //     <div
// //       className={`af-order-card ${pickup ? "af-order-card--pickup" : "af-order-card--delivery"}`}
// //       onClick={onClick}
// //       role="button"
// //       tabIndex={0}
// //     >
// //       <div className="af-card-header">
// //         <div>
// //           <h3 className="af-card-title">Order {formatOrderNumber(order)}</h3>
// //           <p className="af-card-date">
// //             {fmtDate(order.created_at)} at {fmtTime(order.created_at)}
// //           </p>
// //         </div>
// //         <span className={getStatusBadgeClass(order.status)}>{(order.status || "pending").replace(/_/g, " ").toUpperCase()}</span>
// //       </div>

// //       <div className="af-card-items">
// //         {order.items && order.items.length > 0 ? (
// //           <>
// //             {order.items.slice(0, 2).map((item, idx) => (
// //               <div key={item.id ?? idx} className="af-card-item">
// //                 <span className="af-item-name">{itemDisplayName(item)}</span>
// //                 <span className="af-item-qty">×{item.quantity}</span>
// //               </div>
// //             ))}
// //             {order.items.length > 2 && (
// //               <p className="af-more-items">+{order.items.length - 2} more items</p>
// //             )}
// //           </>
// //         ) : (
// //           <p className="af-no-items-text">No items</p>
// //         )}
// //       </div>

// //       {(scheduleDate || scheduleSlot) && (
// //         <div className="af-card-schedule-highlight">
// //           <CalendarClock size={13} />
// //           <span>
// //             {pickup ? "Pickup" : "Delivery"}: {scheduleDate ? fmtDate(scheduleDate) : ""}
// //             {scheduleSlot ? ` · ${scheduleSlot}` : ""}
// //           </span>
// //         </div>
// //       )}

// //       {!pickup && address && <AddressDetailsBlock address={address} />}

// //       <div className="af-card-footer">
// //         <span className="af-card-meta">
// //           {pickup ? "Pickup" : "Delivery"} · {order.payment_method || "N/A"}
// //         </span>
// //         <p className="af-card-total">
// //           {symbol} {fmtMoney(grandTotal)}
// //         </p>
// //       </div>
// //     </div>
// //   );
// // };

// // /* ─────────────────────────────────────────
// //    Order Detail Modal
// // ───────────────────────────────────────── */

// // const OrderDetailModal: React.FC<{
// //   orderId: number;
// //   onClose: () => void;
// // }> = ({ orderId, onClose }) => {
// //   const [order, setOrder] = useState<AgentOrder | null>(null);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState<string>("");

// //   useEffect(() => {
// //     let cancelled = false;

// //     const load = async () => {
// //       setLoading(true);
// //       setError("");
// //       try {
// //         const detail = await getAgentOrderById(orderId);
// //         if (!cancelled) setOrder(detail);
// //       } catch (err) {
// //         if (!cancelled) setError("Could not load this order's details.");
// //       } finally {
// //         if (!cancelled) setLoading(false);
// //       }
// //     };

// //     load();
// //     return () => {
// //       cancelled = true;
// //     };
// //   }, [orderId]);

// //   const symbol = order?.currency || "KWD";
// //   const pickup = order ? isPickupOrder(order) : false;
// //   const { date: scheduleDate, slot: scheduleSlot } = order ? getScheduleInfo(order) : { date: undefined, slot: undefined };
// //   const totals = order ? computeOrderTotals(order) : null;
// //   const address = order ? getOrderAddress(order) : null;

// //   return (
// //     <div className="af-modal-overlay" onClick={onClose}>
// //       <div className="af-modal" onClick={(e) => e.stopPropagation()}>
// //         <button type="button" className="af-modal-close" onClick={onClose} aria-label="Close">
// //           <X size={18} />
// //         </button>

// //         {loading ? (
// //           <div className="af-modal-loading">
// //             <Loader2 className="af-spinner" size={28} />
// //             <p>Loading order details…</p>
// //           </div>
// //         ) : error || !order || !totals ? (
// //           <div className="af-modal-error">
// //             <AlertCircle size={20} />
// //             <span>{error || "Order not found."}</span>
// //           </div>
// //         ) : (
// //           <>
// //             <div className="af-modal-header">
// //               <h2>Order {formatOrderNumber(order)}</h2>
// //               <span className={getStatusBadgeClass(order.status)}>
// //                 {(order.status || "pending").replace(/_/g, " ").toUpperCase()}
// //               </span>
// //             </div>
// //             <p className="af-modal-date">
// //               Placed on {fmtDate(order.created_at)} at {fmtTime(order.created_at)}
// //             </p>

// //             {/* Items */}
// //             <section className="af-modal-section">
// //               <h3>Items</h3>
// //               <div className="af-detail-items">
// //                 {order.items?.length ? (
// //                   order.items.map((item, idx) => {
// //                     const cj = item.custom_json || {};
// //                     const qty = Number(item.quantity) || 0;
// //                     const unitFinal = Number(cj.final_price ?? cj.original_price ?? item.price ?? 0);
// //                     const lineTotal = cj.line_total ?? unitFinal * qty;
// //                     return (
// //                       <div key={item.id ?? idx} className="af-detail-item">
// //                         {itemDisplayImage(item) ? (
// //                           <img src={itemDisplayImage(item)} alt={itemDisplayName(item)} className="af-detail-item-img" />
// //                         ) : (
// //                           <div className="af-detail-item-img af-detail-item-img-placeholder">
// //                             <Package size={18} />
// //                           </div>
// //                         )}
// //                         <div className="af-detail-item-info">
// //                           <p className="af-detail-item-name">{itemDisplayName(item)}</p>
// //                           {cj.product_type && (
// //                             <span
// //                               className={`af-tag ${
// //                                 cj.product_type === "AGENT" ? "af-tag-agent" : "af-tag-normal"
// //                               }`}
// //                             >
// //                               {cj.product_type === "AGENT" ? "Agent Exclusive" : "Normal"}
// //                             </span>
// //                           )}
// //                           {!!cj.discount_percentage && (
// //                             <p className="af-detail-item-discount">
// //                               {cj.discount_percentage}% off (-{symbol} {fmtMoney(cj.discount_amount)})
// //                             </p>
// //                           )}
// //                         </div>
// //                         <div className="af-detail-item-qty">×{item.quantity}</div>
// //                         <div className="af-detail-item-total">{symbol} {fmtMoney(lineTotal)}</div>
// //                       </div>
// //                     );
// //                   })
// //                 ) : (
// //                   <p className="af-muted">No items on this order.</p>
// //                 )}
// //               </div>
// //             </section>

// //             {/* Delivery / Pickup */}
// //             <section className="af-modal-section">
// //               <h3>{pickup ? "Pickup" : "Delivery"}</h3>

// //               {(scheduleDate || scheduleSlot) && (
// //                 <div className="af-modal-schedule-highlight">
// //                   <CalendarClock size={14} />
// //                   <span>
// //                     {scheduleDate ? fmtDate(scheduleDate) : ""}
// //                     {scheduleSlot ? ` · ${scheduleSlot}` : ""}
// //                   </span>
// //                 </div>
// //               )}

// //               {pickup ? (
// //                 <p className="af-muted" style={{ marginTop: 10 }}>This order is set for pickup.</p>
// //               ) : address ? (
// //                 <div style={{ marginTop: 10 }}>
// //                   <AddressDetailsBlock address={address} />
// //                 </div>
// //               ) : (
// //                 <p className="af-muted" style={{ marginTop: 10 }}>No address on file for this order.</p>
// //               )}
// //             </section>

// //             {/* Payment */}
// //             <section className="af-modal-section">
// //               <h3>Payment</h3>
// //               <p className="af-muted">
// //                 <strong>Method:</strong> {order.payment_method || "N/A"}
// //               </p>
// //               <p className="af-muted">
// //                 <strong>Status:</strong> {order.payment_status || "Pending"}
// //               </p>
// //             </section>

// //             {order.agent_notes && (
// //               <section className="af-modal-section">
// //                 <h3>Notes</h3>
// //                 <p className="af-muted">{order.agent_notes}</p>
// //               </section>
// //             )}

// //             {/* Totals — computed from item lines, not backend order.total */}
// //             <section className="af-modal-section af-totals-section">
// //               <div className="af-summary-row">
// //                 <span>Subtotal</span>
// //                 <span>{symbol} {fmtMoney(totals.subtotalBeforeDiscount)}</span>
// //               </div>
// //               {totals.discountTotal > 0 && (
// //                 <div className="af-summary-row af-summary-discount">
// //                   <span>Agent Discount</span>
// //                   <span>-{symbol} {fmtMoney(totals.discountTotal)}</span>
// //                 </div>
// //               )}
// //               <div className="af-summary-row">
// //                 <span>Delivery Charge</span>
// //                 <span>{symbol} {fmtMoney(totals.deliveryCharge)}</span>
// //               </div>
// //               <div className="af-summary-row af-summary-grand-total">
// //                 <span>Grand Total</span>
// //                 <span>{symbol} {fmtMoney(totals.grandTotal)}</span>
// //               </div>
// //             </section>

// //             {/* Simplified status — replaces the raw order timeline */}
// //             <section className="af-modal-section">
// //               <h3>Order Status</h3>
// //               <OrderStatusSteps status={order.status} />
// //             </section>
// //           </>
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // /* ─────────────────────────────────────────
// //    Main Component
// // ───────────────────────────────────────── */

// // const Agentfetchorder: React.FC = () => {
// //   const [orders, setOrders] = useState<AgentOrder[]>([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState<string>("");
// //   const [statusFilter, setStatusFilter] = useState<string>("ALL");
// //   const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

// //   useEffect(() => {
// //     let cancelled = false;

// //     const fetchOrders = async () => {
// //       setLoading(true);
// //       setError("");
// //       try {
// //         const list = await getAgentOrders(statusFilter === "ALL" ? undefined : statusFilter);
// //         if (!cancelled) {
// //           const sorted = [...(list || [])].sort(
// //             (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
// //           );
// //           setOrders(sorted);
// //         }
// //       } catch (err: any) {
// //         if (!cancelled) {
// //           if (err?.response?.status === 401) {
// //             setError("Please login again.");
// //           } else if (err?.response?.status === 403) {
// //             setError("You are not allowed to view these orders.");
// //           } else {
// //             setError(err?.response?.data?.error || "Could not load your orders.");
// //           }
// //         }
// //       } finally {
// //         if (!cancelled) setLoading(false);
// //       }
// //     };

// //     fetchOrders();
// //     return () => {
// //       cancelled = true;
// //     };
// //   }, [statusFilter]);

// //   return (
// //     <div className="af-page">
// //       <div className="af-wrapper">
// //         <div className="af-header">
// //           <div>
// //             <p className="af-eyebrow">Agent</p>
// //             <h1>Your Orders</h1>
// //           </div>
// //           <div className="af-order-count">
// //             <ShoppingBag size={16} />
// //             <span>{orders.length} {orders.length === 1 ? "order" : "orders"}</span>
// //           </div>
// //         </div>

// //         <div className="af-filter-chips">
// //           {STATUS_FILTERS.map((f) => (
// //             <button
// //               key={f.value}
// //               type="button"
// //               className={`af-chip ${statusFilter === f.value ? "af-chip-active" : ""}`}
// //               onClick={() => setStatusFilter(f.value)}
// //             >
// //               {f.label}
// //             </button>
// //           ))}
// //         </div>

// //         {loading ? (
// //           <div className="af-loading-grid">
// //             {Array.from({ length: 4 }).map((_, i) => (
// //               <div key={i} className="af-order-card af-skeleton-card">
// //                 <div className="af-skeleton af-skeleton-line" />
// //                 <div className="af-skeleton af-skeleton-line af-skeleton-line-short" />
// //                 <div className="af-skeleton af-skeleton-line" />
// //               </div>
// //             ))}
// //           </div>
// //         ) : error ? (
// //           <div className="af-empty-state">
// //             <AlertCircle size={48} />
// //             <h2>Something went wrong</h2>
// //             <p>{error}</p>
// //           </div>
// //         ) : orders.length === 0 ? (
// //           <div className="af-empty-state">
// //             <Package size={48} />
// //             <h2>No orders yet</h2>
// //             <p>Orders you place for yourself will show up here.</p>
// //           </div>
// //         ) : (
// //           <div className="af-orders-grid">
// //             {orders.map((order) => (
// //               <AgentOrderCard key={order.id} order={order} onClick={() => setSelectedOrderId(order.id)} />
// //             ))}
// //           </div>
// //         )}
// //       </div>

// //       {selectedOrderId !== null && (
// //         <OrderDetailModal orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />
// //       )}
// //     </div>
// //   );
// // };

// // export default Agentfetchorder;


// import React, { useEffect, useState } from "react";
// import { ShoppingBag, Loader2, AlertCircle, Package, X, CalendarClock, MapPin, Ban } from "lucide-react";
// import "./Agentfetchorder.css";
// import { getAgentOrders, getAgentOrderById, cancelAgentOrder } from "../services/agentService";

// // Display-only status mapping, per orderStatus.ts (adjust the import path to
// // wherever you saved it in your project, e.g. "../utils/orderStatus").
// import { getCustomerStageIndex, ACCEPTED_STAGE_INDEX } from "../services/orderStatus";

// /* ─────────────────────────────────────────
//    Types
// ───────────────────────────────────────── */

// interface OrderItemProductRef {
//   id?: number;
//   name?: string;
//   image_url?: string;
//   image?: string;
// }

// interface OrderItemAgentProductRef {
//   id?: number;
//   name?: string;
//   description?: string;
//   image?: string;
// }

// interface AgentOrderItem {
//   id?: number;
//   product_id?: number;
//   agent_product_id?: number;
//   quantity: number;
//   product?: OrderItemProductRef;
//   agent_product?: OrderItemAgentProductRef;
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

// // Loose shape — delivery_address can come back with varying key names
// // depending on the endpoint (area as object/string, delivery_notes vs
// // address_notes, etc.), so we normalize via helpers below rather than
// // relying on strict typed fields.
// interface AgentOrderAddress {
//   id?: number;
//   street?: string;
//   block?: string;
//   avenue?: string;
//   building?: string;
//   floor?: string;
//   apartment?: string;
//   delivery_notes?: string;
//   address_notes?: string;
//   country?: any;
//   area?: any;
//   city?: string;
//   pincode?: string;
//   landmark?: string;
//   [key: string]: any;
// }

// interface AgentOrder {
//   id: number;
//   order_number?: string | number;
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
//   delivery_address?: AgentOrderAddress;
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

// // Display order numbers starting from 15000 (e.g. order id 18 → "#15018").
// const ORDER_NUMBER_OFFSET = 15000;
// const formatOrderNumber = (order: AgentOrder) => {
//   const raw = order.order_number ?? order.id;
//   const num = Number(raw);
//   if (!Number.isFinite(num)) return `#${raw}`;
//   return `#${num >= ORDER_NUMBER_OFFSET ? num : ORDER_NUMBER_OFFSET + num}`;
// };

// const normalizeOrderMethod = (order: any) => {
//   const raw = String(order?.delivery_method ?? order?.deliveryMethod ?? order?.order_type ?? order?.orderType ?? '').trim().toLowerCase();
//   return raw;
// };

// const isPickupOrder = (order: any) => {
//   const method = normalizeOrderMethod(order);
//   return method === 'pickup' || method.includes('pickup');
// };

// const isTerminalStatus = (status?: string) => {
//   const s = (status || '').trim().toUpperCase();
//   return s === 'CANCELLED' || s === 'REJECTED';
// };

// /* ── Simplified agent-facing status (Order Placed / Ready / Out for
//    Delivery / Delivered / Cancelled) — built on top of orderStatus.ts's
//    6-stage customer mapping, collapsed down to what the agent should see. ── */

// type AgentStatusKey = 'PLACED' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';

// const AGENT_STATUS_LABELS: Record<AgentStatusKey, string> = {
//   PLACED: 'Order Placed',
//   READY: 'Ready',
//   OUT_FOR_DELIVERY: 'Out for Delivery',
//   DELIVERED: 'Delivered',
//   CANCELLED: 'Cancelled',
// };

// // The 4 steps ever shown in the progress tracker (cancelled orders show a
// // banner instead of the tracker — see OrderStatusSteps below).
// const AGENT_STATUS_STEPS: { key: AgentStatusKey; label: string }[] = [
//   { key: 'PLACED', label: AGENT_STATUS_LABELS.PLACED },
//   { key: 'READY', label: AGENT_STATUS_LABELS.READY },
//   { key: 'OUT_FOR_DELIVERY', label: AGENT_STATUS_LABELS.OUT_FOR_DELIVERY },
//   { key: 'DELIVERED', label: AGENT_STATUS_LABELS.DELIVERED },
// ];

// const getAgentStatusKey = (status?: string): AgentStatusKey => {
//   const s = (status || '').trim().toUpperCase();
//   if (isTerminalStatus(s)) return 'CANCELLED';

//   const stageIdx = getCustomerStageIndex(s); // 0=Pending,1=Accepted,2=Processing,3=Ready,4=OutForDelivery,5=Delivered, -1=unknown
//   if (stageIdx === 3) return 'READY';
//   if (stageIdx === 4) return 'OUT_FOR_DELIVERY';
//   if (stageIdx === 5) return 'DELIVERED';
//   // Pending / Accepted / Processing / unknown all collapse to "Order Placed"
//   return 'PLACED';
// };

// const getAgentStatusLabel = (status?: string): string => AGENT_STATUS_LABELS[getAgentStatusKey(status)];

// const getStatusBadgeClass = (status?: string) => {
//   const key = getAgentStatusKey(status).toLowerCase();
//   return `af-status-badge af-status-${key}`;
// };

// // Filter chips reduced to exactly what the agent should ever filter by.
// // "Order Placed" maps to the backend's PENDING status (the closest single
// // equivalent); the others map 1:1 to real backend statuses.
// const STATUS_FILTERS: { value: string; label: string }[] = [
//   { value: "ALL", label: "All" },
//   { value: "PENDING", label: "Order Placed" },
//   { value: "READY", label: "Ready" },
//   { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
//   { value: "DELIVERED", label: "Delivered" },
//   { value: "CANCELLED", label: "Cancelled" },
// ];

// // An order can only be cancelled by the agent while it's still at the
// // "Order Placed" stage (before the kitchen/backend has accepted it).
// const canCancelOrder = (order: Pick<AgentOrder, "status">) => {
//   const s = (order.status || '').trim().toUpperCase();
//   if (isTerminalStatus(s)) return false;
//   if (s === 'DELIVERED') return false;
//   const stageIdx = getCustomerStageIndex(s);
//   // Only PENDING (stage 0) is cancellable — once accepted (stage >= 1) it's too late.
//   return stageIdx === 0;
// };

// const itemDisplayName = (item: AgentOrderItem): string => {
//   if (item.custom_json?.product_type === "AGENT") {
//     return item.agent_product?.name || "Agent Product";
//   }
//   return item.product?.name || "Item";
// };

// const itemDisplayImage = (item: AgentOrderItem): string | undefined =>
//   item.custom_json?.product_type === "AGENT"
//     ? item.agent_product?.image
//     : item.product?.image_url || item.product?.image;

// // ── Totals — computed purely from cart line items so the numbers shown
// // always match what's actually itemized (backend order.total/subtotal
// // fields have been observed to be inconsistent with the item breakdown). ──
// const computeOrderTotals = (order: AgentOrder) => {
//   const items = order.items || [];
//   let subtotalBeforeDiscount = 0;
//   let discountTotal = 0;

//   items.forEach((item) => {
//     const cj = item.custom_json || {};
//     const qty = Number(item.quantity) || 0;
//     const unitOriginal = Number(cj.original_price ?? cj.final_price ?? item.price ?? 0);
//     const unitDiscount = Number(cj.discount_amount ?? 0);
//     subtotalBeforeDiscount += unitOriginal * qty;
//     discountTotal += unitDiscount * qty;
//   });

//   const itemsTotal = subtotalBeforeDiscount - discountTotal;
//   const deliveryCharge = Number(order.delivery_charge || 0);
//   const grandTotal = itemsTotal + deliveryCharge;

//   return { subtotalBeforeDiscount, discountTotal, itemsTotal, deliveryCharge, grandTotal };
// };

// // Resolves the schedule pair (date + time slot) regardless of pickup/delivery
// const getScheduleInfo = (order: AgentOrder): { date?: string; slot?: string } => {
//   if (isPickupOrder(order)) {
//     return {
//       date: order.pickup_date || order.delivery_date,
//       slot: order.pickup_time_slot || order.delivery_time_slot,
//     };
//   }
//   return {
//     date: order.delivery_date,
//     slot: order.delivery_time_slot,
//   };
// };

// // The order's delivery address may come back under "delivery_address" or
// // "address" depending on the endpoint — check both.
// const getOrderAddress = (order: AgentOrder): AgentOrderAddress | null =>
//   order.delivery_address || order.address || null;

// /* ── Address field helpers (object-safe, mirrors DeliveryOrder.tsx) ── */

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
//   { label: 'Street', keys: ['street', 'street_name'] },
//   { label: 'Country', resolver: getAddressCountryName },
//   { label: 'Block', keys: ['block', 'block_no'] },
//   { label: 'Avenue', keys: ['avenue', 'avenue_name'] },
//   { label: 'Building', keys: ['building', 'building_name', 'building_no'] },
//   {
//     label: 'Floor / Apt',
//     resolver: (a: any) => {
//       const floor = a?.floor;
//       const apt = a?.apartment || a?.apt;
//       if (!floor && !apt) return null;
//       return [floor, apt].filter(Boolean).join(' ');
//     },
//   },
//   { label: 'City', keys: ['city'] },
//   { label: 'Pincode', keys: ['pincode', 'zip', 'postal_code'] },
//   { label: 'Delivery Notes', keys: ['delivery_notes', 'address_notes', 'addressNotes', 'notes', 'landmark'] },
// ];

// const getAddressFields = (address: any) =>
//   ADDRESS_FIELD_DEFS
//     .map(({ label, keys, resolver }) => ({
//       label,
//       value: resolver ? resolver(address) : getAddressFieldValue(address, keys || []),
//     }))
//     .filter((f) => f.value !== null && f.value !== undefined && f.value !== '');

// /* ─────────────────────────────────────────
//    Address details block (Area → Delivery Notes)
// ───────────────────────────────────────── */

// const AddressDetailsBlock: React.FC<{ address: AgentOrderAddress }> = ({ address }) => {
//   const fields = getAddressFields(address);
//   if (fields.length === 0) return null;

//   return (
//     <div className="af-card-address-block">
//       <p className="af-card-address-title">
//         <MapPin size={12} style={{ verticalAlign: "-2px", marginRight: 4 }} />
//         Delivery Address
//       </p>
//       <div className="af-card-address-grid">
//         {fields.map((f) => (
//           <div key={f.label} className={f.label === "Delivery Notes" ? "af-addr-full" : undefined}>
//             <span>{f.label}:</span>
//             <strong>{String(f.value)}</strong>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// /* ─────────────────────────────────────────
//    Status steps block — only 4 stages ever shown to the agent:
//    Order Placed → Ready → Out for Delivery → Delivered.
//    Cancelled/Rejected orders show a banner instead of the tracker.
// ───────────────────────────────────────── */

// const OrderStatusSteps: React.FC<{ status?: string }> = ({ status }) => {
//   if (isTerminalStatus(status)) {
//     return (
//       <div className="af-status-cancelled-banner">
//         <Ban size={14} />
//         <span>This order was cancelled</span>
//       </div>
//     );
//   }

//   const currentKey = getAgentStatusKey(status);
//   const currentIndex = AGENT_STATUS_STEPS.findIndex((s) => s.key === currentKey);

//   return (
//     <div className="af-status-steps">
//       {AGENT_STATUS_STEPS.map((step, idx) => {
//         const isDone = currentIndex >= 0 && idx < currentIndex;
//         const isActive = idx === currentIndex;
//         return (
//           <div
//             key={step.key}
//             className={`af-status-step ${isDone ? "af-status-step-done" : ""} ${isActive ? "af-status-step-active" : ""}`}
//           >
//             <span className="af-status-step-dot" />
//             <span>{step.label}</span>
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// /* ─────────────────────────────────────────
//    Order Card
// ───────────────────────────────────────── */

// const AgentOrderCard: React.FC<{
//   order: AgentOrder;
//   onClick: () => void;
//   onCancel: (orderId: number) => void;
//   cancelling: boolean;
// }> = ({ order, onClick, onCancel, cancelling }) => {
//   const symbol = order.currency || "KWD";
//   const pickup = isPickupOrder(order);
//   const { date: scheduleDate, slot: scheduleSlot } = getScheduleInfo(order);
//   const { grandTotal } = computeOrderTotals(order);
//   const address = getOrderAddress(order);
//   const cancellable = canCancelOrder(order);

//   return (
//     <div
//       className={`af-order-card ${pickup ? "af-order-card--pickup" : "af-order-card--delivery"}`}
//       onClick={onClick}
//       role="button"
//       tabIndex={0}
//     >
//       <div className="af-card-header">
//         <div>
//           <h3 className="af-card-title">Order {formatOrderNumber(order)}</h3>
//           <p className="af-card-date">
//             {fmtDate(order.created_at)} at {fmtTime(order.created_at)}
//           </p>
//         </div>
//         <span className={getStatusBadgeClass(order.status)}>{getAgentStatusLabel(order.status)}</span>
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

//       {(scheduleDate || scheduleSlot) && (
//         <div className="af-card-schedule-highlight">
//           <CalendarClock size={13} />
//           <span>
//             {pickup ? "Pickup" : "Delivery"}: {scheduleDate ? fmtDate(scheduleDate) : ""}
//             {scheduleSlot ? ` · ${scheduleSlot}` : ""}
//           </span>
//         </div>
//       )}

//       {!pickup && address && <AddressDetailsBlock address={address} />}

//       <div className="af-card-footer">
//         <span className="af-card-meta">
//           {pickup ? "Pickup" : "Delivery"} · {order.payment_method || "N/A"}
//         </span>
//         <p className="af-card-total">
//           {symbol} {fmtMoney(grandTotal)}
//         </p>
//       </div>

//       {cancellable && (
//         <div className="af-card-actions">
//           <button
//             type="button"
//             className="af-cancel-btn"
//             disabled={cancelling}
//             onClick={(e) => {
//               e.stopPropagation();
//               onCancel(order.id);
//             }}
//           >
//             {cancelling ? <Loader2 className="af-spinner" size={14} /> : <Ban size={14} />}
//             {cancelling ? "Cancelling…" : "Cancel Order"}
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// /* ─────────────────────────────────────────
//    Order Detail Modal
// ───────────────────────────────────────── */

// const OrderDetailModal: React.FC<{
//   orderId: number;
//   onClose: () => void;
//   onOrderCancelled: (orderId: number) => void;
// }> = ({ orderId, onClose, onOrderCancelled }) => {
//   const [order, setOrder] = useState<AgentOrder | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string>("");
//   const [cancelling, setCancelling] = useState(false);
//   const [cancelError, setCancelError] = useState<string>("");

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
//     };

//     load();
//     return () => {
//       cancelled = true;
//     };
//   }, [orderId]);

//   const symbol = order?.currency || "KWD";
//   const pickup = order ? isPickupOrder(order) : false;
//   const { date: scheduleDate, slot: scheduleSlot } = order ? getScheduleInfo(order) : { date: undefined, slot: undefined };
//   const totals = order ? computeOrderTotals(order) : null;
//   const address = order ? getOrderAddress(order) : null;
//   const cancellable = order ? canCancelOrder(order) : false;

//   const handleCancel = async () => {
//     if (!order) return;
//     const confirmed = window.confirm("Are you sure you want to cancel this order? This cannot be undone.");
//     if (!confirmed) return;

//     setCancelling(true);
//     setCancelError("");
//     try {
//       await cancelAgentOrder(order.id);
//       setOrder((prev) => (prev ? { ...prev, status: "CANCELLED" } : prev));
//       onOrderCancelled(order.id);
//     } catch (err: any) {
//       setCancelError(err?.response?.data?.error || "Could not cancel this order.");
//     } finally {
//       setCancelling(false);
//     }
//   };

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
//         ) : error || !order || !totals ? (
//           <div className="af-modal-error">
//             <AlertCircle size={20} />
//             <span>{error || "Order not found."}</span>
//           </div>
//         ) : (
//           <>
//             <div className="af-modal-header">
//               <h2>Order {formatOrderNumber(order)}</h2>
//               <span className={getStatusBadgeClass(order.status)}>
//                 {getAgentStatusLabel(order.status)}
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
//                     const cj = item.custom_json || {};
//                     const qty = Number(item.quantity) || 0;
//                     const unitFinal = Number(cj.final_price ?? cj.original_price ?? item.price ?? 0);
//                     const lineTotal = cj.line_total ?? unitFinal * qty;
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
//                           {cj.product_type && (
//                             <span
//                               className={`af-tag ${
//                                 cj.product_type === "AGENT" ? "af-tag-agent" : "af-tag-normal"
//                               }`}
//                             >
//                               {cj.product_type === "AGENT" ? "Agent Exclusive" : "Normal"}
//                             </span>
//                           )}
//                           {!!cj.discount_percentage && (
//                             <p className="af-detail-item-discount">
//                               {cj.discount_percentage}% off (-{symbol} {fmtMoney(cj.discount_amount)})
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
//               <h3>{pickup ? "Pickup" : "Delivery"}</h3>

//               {(scheduleDate || scheduleSlot) && (
//                 <div className="af-modal-schedule-highlight">
//                   <CalendarClock size={14} />
//                   <span>
//                     {scheduleDate ? fmtDate(scheduleDate) : ""}
//                     {scheduleSlot ? ` · ${scheduleSlot}` : ""}
//                   </span>
//                 </div>
//               )}

//               {pickup ? (
//                 <p className="af-muted" style={{ marginTop: 10 }}>This order is set for pickup.</p>
//               ) : address ? (
//                 <div style={{ marginTop: 10 }}>
//                   <AddressDetailsBlock address={address} />
//                 </div>
//               ) : (
//                 <p className="af-muted" style={{ marginTop: 10 }}>No address on file for this order.</p>
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

//             {/* Totals — computed from item lines, not backend order.total */}
//             <section className="af-modal-section af-totals-section">
//               <div className="af-summary-row">
//                 <span>Subtotal</span>
//                 <span>{symbol} {fmtMoney(totals.subtotalBeforeDiscount)}</span>
//               </div>
//               {totals.discountTotal > 0 && (
//                 <div className="af-summary-row af-summary-discount">
//                   <span>Agent Discount</span>
//                   <span>-{symbol} {fmtMoney(totals.discountTotal)}</span>
//                 </div>
//               )}
//               <div className="af-summary-row">
//                 <span>Delivery Charge</span>
//                 <span>{symbol} {fmtMoney(totals.deliveryCharge)}</span>
//               </div>
//               <div className="af-summary-row af-summary-grand-total">
//                 <span>Grand Total</span>
//                 <span>{symbol} {fmtMoney(totals.grandTotal)}</span>
//               </div>
//             </section>

//             {/* Simplified status — Order Placed / Ready / Out for Delivery / Delivered */}
//             <section className="af-modal-section">
//               <h3>Order Status</h3>
//               <OrderStatusSteps status={order.status} />
//             </section>

//             {/* Cancel action — only while the order is still "Order Placed" */}
//             {cancellable && (
//               <section className="af-modal-section af-modal-cancel-section">
//                 {cancelError && (
//                   <p className="af-cancel-error">
//                     <AlertCircle size={14} /> {cancelError}
//                   </p>
//                 )}
//                 <button
//                   type="button"
//                   className="af-modal-cancel-btn"
//                   disabled={cancelling}
//                   onClick={handleCancel}
//                 >
//                   {cancelling ? <Loader2 className="af-spinner" size={16} /> : <Ban size={16} />}
//                   {cancelling ? "Cancelling…" : "Cancel Order"}
//                 </button>
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
//   const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null);

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

//   // Marks an order as CANCELLED locally once the API call succeeds, so both
//   // the card grid and (if open) the modal stay in sync without a refetch.
//   const applyCancelledLocally = (orderId: number) => {
//     setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: "CANCELLED" } : o)));
//   };

//   const handleCancelFromCard = async (orderId: number) => {
//     const confirmed = window.confirm("Are you sure you want to cancel this order? This cannot be undone.");
//     if (!confirmed) return;

//     setCancellingOrderId(orderId);
//     try {
//       await cancelAgentOrder(orderId);
//       applyCancelledLocally(orderId);
//     } catch (err: any) {
//       alert(err?.response?.data?.error || "Could not cancel this order.");
//     } finally {
//       setCancellingOrderId(null);
//     }
//   };

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
//               <AgentOrderCard
//                 key={order.id}
//                 order={order}
//                 onClick={() => setSelectedOrderId(order.id)}
//                 onCancel={handleCancelFromCard}
//                 cancelling={cancellingOrderId === order.id}
//               />
//             ))}
//           </div>
//         )}
//       </div>

//       {selectedOrderId !== null && (
//         <OrderDetailModal
//           orderId={selectedOrderId}
//           onClose={() => setSelectedOrderId(null)}
//           onOrderCancelled={applyCancelledLocally}
//         />
//       )}
//     </div>
//   );
// };

// export default Agentfetchorder;



import React, { useEffect, useState } from "react";
import { ShoppingBag, Loader2, AlertCircle, Package, X, CalendarClock, MapPin, Ban } from "lucide-react";
import "./Agentfetchorder.css";
import { getAgentOrders, getAgentOrderById, cancelAgentOrder } from "../services/agentService";

// Display-only status mapping, per orderStatus.ts (adjust the import path to
// wherever you saved it in your project, e.g. "../utils/orderStatus").
import { getCustomerStageIndex, ACCEPTED_STAGE_INDEX } from "../services/orderStatus";

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */

interface OrderItemProductRef {
  id?: number;
  name?: string;
  image_url?: string;
  image?: string;
}

interface OrderItemAgentProductRef {
  id?: number;
  name?: string;
  description?: string;
  image?: string;
}

interface AgentOrderItem {
  id?: number;
  product_id?: number;
  agent_product_id?: number;
  quantity: number;
  product?: OrderItemProductRef;
  agent_product?: OrderItemAgentProductRef;
  // Some endpoints put variant/flavour directly on the item row instead of
  // (or in addition to) custom_json — checked as a fallback below.
  variant?: string;
  flavour?: string;
  flavor?: string;
  custom_json?: {
    product_type?: "NORMAL" | "AGENT";
    original_price?: number;
    discount_percentage?: number;
    discount_amount?: number;
    final_price?: number;
    line_total?: number;
    // ── Variant / Flavour (mirrors OrderManagement.tsx's normalizeOrder) ──
    variant_name?: string;
    variant?: string;
    flavour_name?: string;
    flavour?: string;
    flavor?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

// Loose shape — delivery_address can come back with varying key names
// depending on the endpoint (area as object/string, delivery_notes vs
// address_notes, etc.), so we normalize via helpers below rather than
// relying on strict typed fields.
interface AgentOrderAddress {
  id?: number;
  street?: string;
  block?: string;
  avenue?: string;
  building?: string;
  floor?: string;
  apartment?: string;
  delivery_notes?: string;
  address_notes?: string;
  country?: any;
  area?: any;
  city?: string;
  pincode?: string;
  landmark?: string;
  [key: string]: any;
}

interface AgentOrder {
  id: number;
  order_number?: string | number;
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
  delivery_address?: AgentOrderAddress;
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

// Display order numbers starting from 15000 (e.g. order id 18 → "#15018").
const ORDER_NUMBER_OFFSET = 15000;
const formatOrderNumber = (order: AgentOrder) => {
  const raw = order.order_number ?? order.id;
  const num = Number(raw);
  if (!Number.isFinite(num)) return `#${raw}`;
  return `#${num >= ORDER_NUMBER_OFFSET ? num : ORDER_NUMBER_OFFSET + num}`;
};

const normalizeOrderMethod = (order: any) => {
  const raw = String(order?.delivery_method ?? order?.deliveryMethod ?? order?.order_type ?? order?.orderType ?? '').trim().toLowerCase();
  return raw;
};

const isPickupOrder = (order: any) => {
  const method = normalizeOrderMethod(order);
  return method === 'pickup' || method.includes('pickup');
};

const isTerminalStatus = (status?: string) => {
  const s = (status || '').trim().toUpperCase();
  return s === 'CANCELLED' || s === 'REJECTED';
};

/* ── Simplified agent-facing status (Order Placed / Ready / Out for
   Delivery / Delivered / Cancelled) — built on top of orderStatus.ts's
   6-stage customer mapping, collapsed down to what the agent should see. ── */

type AgentStatusKey = 'PLACED' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';

const AGENT_STATUS_LABELS: Record<AgentStatusKey, string> = {
  PLACED: 'Order Placed',
  READY: 'Ready',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

// The 4 steps ever shown in the progress tracker (cancelled orders show a
// banner instead of the tracker — see OrderStatusSteps below).
const AGENT_STATUS_STEPS: { key: AgentStatusKey; label: string }[] = [
  { key: 'PLACED', label: AGENT_STATUS_LABELS.PLACED },
  { key: 'READY', label: AGENT_STATUS_LABELS.READY },
  { key: 'OUT_FOR_DELIVERY', label: AGENT_STATUS_LABELS.OUT_FOR_DELIVERY },
  { key: 'DELIVERED', label: AGENT_STATUS_LABELS.DELIVERED },
];

const getAgentStatusKey = (status?: string): AgentStatusKey => {
  const s = (status || '').trim().toUpperCase();
  if (isTerminalStatus(s)) return 'CANCELLED';

  const stageIdx = getCustomerStageIndex(s); // 0=Pending,1=Accepted,2=Processing,3=Ready,4=OutForDelivery,5=Delivered, -1=unknown
  if (stageIdx === 3) return 'READY';
  if (stageIdx === 4) return 'OUT_FOR_DELIVERY';
  if (stageIdx === 5) return 'DELIVERED';
  // Pending / Accepted / Processing / unknown all collapse to "Order Placed"
  return 'PLACED';
};

const getAgentStatusLabel = (status?: string): string => AGENT_STATUS_LABELS[getAgentStatusKey(status)];

const getStatusBadgeClass = (status?: string) => {
  const key = getAgentStatusKey(status).toLowerCase();
  return `af-status-badge af-status-${key}`;
};

// Filter chips reduced to exactly what the agent should ever filter by.
// "Order Placed" maps to the backend's PENDING status (the closest single
// equivalent); the others map 1:1 to real backend statuses.
const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Order Placed" },
  { value: "READY", label: "Ready" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

// An order can only be cancelled by the agent while it's still at the
// "Order Placed" stage (before the kitchen/backend has accepted it).
const canCancelOrder = (order: Pick<AgentOrder, "status">) => {
  const s = (order.status || '').trim().toUpperCase();
  if (isTerminalStatus(s)) return false;
  if (s === 'DELIVERED') return false;
  const stageIdx = getCustomerStageIndex(s);
  // Only PENDING (stage 0) is cancellable — once accepted (stage >= 1) it's too late.
  return stageIdx === 0;
};

const itemDisplayName = (item: AgentOrderItem): string => {
  if (item.custom_json?.product_type === "AGENT") {
    return item.agent_product?.name || "Agent Product";
  }
  return item.product?.name || "Item";
};

const itemDisplayImage = (item: AgentOrderItem): string | undefined =>
  item.custom_json?.product_type === "AGENT"
    ? item.agent_product?.image
    : item.product?.image_url || item.product?.image;

// ── Variant / Flavour — mirrors OrderManagement.tsx's normalizeOrder():
// prefer custom_json's *_name fields, then the shorter custom_json keys,
// then a top-level field on the item row itself. ──
const itemDisplayVariant = (item: AgentOrderItem): string | undefined => {
  const cj = item.custom_json || {};
  return cj.variant_name || cj.variant || item.variant || undefined;
};

const itemDisplayFlavour = (item: AgentOrderItem): string | undefined => {
  const cj = item.custom_json || {};
  return cj.flavour_name || cj.flavour || cj.flavor || item.flavour || item.flavor || undefined;
};

// ── Totals — computed purely from cart line items so the numbers shown
// always match what's actually itemized (backend order.total/subtotal
// fields have been observed to be inconsistent with the item breakdown). ──
const computeOrderTotals = (order: AgentOrder) => {
  const items = order.items || [];
  let subtotalBeforeDiscount = 0;
  let discountTotal = 0;

  items.forEach((item) => {
    const cj = item.custom_json || {};
    const qty = Number(item.quantity) || 0;
    const unitOriginal = Number(cj.original_price ?? cj.final_price ?? item.price ?? 0);
    const unitDiscount = Number(cj.discount_amount ?? 0);
    subtotalBeforeDiscount += unitOriginal * qty;
    discountTotal += unitDiscount * qty;
  });

  const itemsTotal = subtotalBeforeDiscount - discountTotal;
  const deliveryCharge = Number(order.delivery_charge || 0);
  const grandTotal = itemsTotal + deliveryCharge;

  return { subtotalBeforeDiscount, discountTotal, itemsTotal, deliveryCharge, grandTotal };
};

// Resolves the schedule pair (date + time slot) regardless of pickup/delivery
const getScheduleInfo = (order: AgentOrder): { date?: string; slot?: string } => {
  if (isPickupOrder(order)) {
    return {
      date: order.pickup_date || order.delivery_date,
      slot: order.pickup_time_slot || order.delivery_time_slot,
    };
  }
  return {
    date: order.delivery_date,
    slot: order.delivery_time_slot,
  };
};

// The order's delivery address may come back under "delivery_address" or
// "address" depending on the endpoint — check both.
const getOrderAddress = (order: AgentOrder): AgentOrderAddress | null =>
  order.delivery_address || order.address || null;

/* ── Address field helpers (object-safe, mirrors DeliveryOrder.tsx) ── */

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
  { label: 'Street', keys: ['street', 'street_name'] },
  { label: 'Country', resolver: getAddressCountryName },
  { label: 'Block', keys: ['block', 'block_no'] },
  { label: 'Avenue', keys: ['avenue', 'avenue_name'] },
  { label: 'Building', keys: ['building', 'building_name', 'building_no'] },
  {
    label: 'Floor / Apt',
    resolver: (a: any) => {
      const floor = a?.floor;
      const apt = a?.apartment || a?.apt;
      if (!floor && !apt) return null;
      return [floor, apt].filter(Boolean).join(' ');
    },
  },
  { label: 'City', keys: ['city'] },
  { label: 'Pincode', keys: ['pincode', 'zip', 'postal_code'] },
  { label: 'Delivery Notes', keys: ['delivery_notes', 'address_notes', 'addressNotes', 'notes', 'landmark'] },
];

const getAddressFields = (address: any) =>
  ADDRESS_FIELD_DEFS
    .map(({ label, keys, resolver }) => ({
      label,
      value: resolver ? resolver(address) : getAddressFieldValue(address, keys || []),
    }))
    .filter((f) => f.value !== null && f.value !== undefined && f.value !== '');

/* ─────────────────────────────────────────
   Address details block (Area → Delivery Notes)
───────────────────────────────────────── */

const AddressDetailsBlock: React.FC<{ address: AgentOrderAddress }> = ({ address }) => {
  const fields = getAddressFields(address);
  if (fields.length === 0) return null;

  return (
    <div className="af-card-address-block">
      <p className="af-card-address-title">
        <MapPin size={12} style={{ verticalAlign: "-2px", marginRight: 4 }} />
        Delivery Address
      </p>
      <div className="af-card-address-grid">
        {fields.map((f) => (
          <div key={f.label} className={f.label === "Delivery Notes" ? "af-addr-full" : undefined}>
            <span>{f.label}:</span>
            <strong>{String(f.value)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   Status steps block — only 4 stages ever shown to the agent:
   Order Placed → Ready → Out for Delivery → Delivered.
   Cancelled/Rejected orders show a banner instead of the tracker.
───────────────────────────────────────── */

const OrderStatusSteps: React.FC<{ status?: string }> = ({ status }) => {
  if (isTerminalStatus(status)) {
    return (
      <div className="af-status-cancelled-banner">
        <Ban size={14} />
        <span>This order was cancelled</span>
      </div>
    );
  }

  const currentKey = getAgentStatusKey(status);
  const currentIndex = AGENT_STATUS_STEPS.findIndex((s) => s.key === currentKey);

  return (
    <div className="af-status-steps">
      {AGENT_STATUS_STEPS.map((step, idx) => {
        const isDone = currentIndex >= 0 && idx < currentIndex;
        const isActive = idx === currentIndex;
        return (
          <div
            key={step.key}
            className={`af-status-step ${isDone ? "af-status-step-done" : ""} ${isActive ? "af-status-step-active" : ""}`}
          >
            <span className="af-status-step-dot" />
            <span>{step.label}</span>
          </div>
        );
      })}
    </div>
  );
};

/* ─────────────────────────────────────────
   Order Card
───────────────────────────────────────── */

const AgentOrderCard: React.FC<{
  order: AgentOrder;
  onClick: () => void;
  onCancel: (orderId: number) => void;
  cancelling: boolean;
}> = ({ order, onClick, onCancel, cancelling }) => {
  const symbol = order.currency || "KWD";
  const pickup = isPickupOrder(order);
  const { date: scheduleDate, slot: scheduleSlot } = getScheduleInfo(order);
  const { grandTotal } = computeOrderTotals(order);
  const address = getOrderAddress(order);
  const cancellable = canCancelOrder(order);

  return (
    <div
      className={`af-order-card ${pickup ? "af-order-card--pickup" : "af-order-card--delivery"}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <div className="af-card-header">
        <div>
          <h3 className="af-card-title">Order {formatOrderNumber(order)}</h3>
          <p className="af-card-date">
            {fmtDate(order.created_at)} at {fmtTime(order.created_at)}
          </p>
        </div>
        <span className={getStatusBadgeClass(order.status)}>{getAgentStatusLabel(order.status)}</span>
      </div>

      <div className="af-card-items">
        {order.items && order.items.length > 0 ? (
          <>
            {order.items.slice(0, 2).map((item, idx) => {
              const flavour = itemDisplayFlavour(item);
              const variant = itemDisplayVariant(item);
              const variantLabel = [flavour, variant].filter(Boolean).join(" · ");
              return (
                <div key={item.id ?? idx} className="af-card-item">
                  <span className="af-item-name">
                    {itemDisplayName(item)}
                    {variantLabel && <span className="af-item-variant"> ({variantLabel})</span>}
                  </span>
                  <span className="af-item-qty">×{item.quantity}</span>
                </div>
              );
            })}
            {order.items.length > 2 && (
              <p className="af-more-items">+{order.items.length - 2} more items</p>
            )}
          </>
        ) : (
          <p className="af-no-items-text">No items</p>
        )}
      </div>

      {(scheduleDate || scheduleSlot) && (
        <div className="af-card-schedule-highlight">
          <CalendarClock size={13} />
          <span>
            {pickup ? "Pickup" : "Delivery"}: {scheduleDate ? fmtDate(scheduleDate) : ""}
            {scheduleSlot ? ` · ${scheduleSlot}` : ""}
          </span>
        </div>
      )}

      {!pickup && address && <AddressDetailsBlock address={address} />}

      <div className="af-card-footer">
        <span className="af-card-meta">
          {pickup ? "Pickup" : "Delivery"} · {order.payment_method || "N/A"}
        </span>
        <p className="af-card-total">
          {symbol} {fmtMoney(grandTotal)}
        </p>
      </div>

      {cancellable && (
        <div className="af-card-actions">
          <button
            type="button"
            className="af-cancel-btn"
            disabled={cancelling}
            onClick={(e) => {
              e.stopPropagation();
              onCancel(order.id);
            }}
          >
            {cancelling ? <Loader2 className="af-spinner" size={14} /> : <Ban size={14} />}
            {cancelling ? "Cancelling…" : "Cancel Order"}
          </button>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────
   Order Detail Modal
───────────────────────────────────────── */

const OrderDetailModal: React.FC<{
  orderId: number;
  onClose: () => void;
  onOrderCancelled: (orderId: number) => void;
}> = ({ orderId, onClose, onOrderCancelled }) => {
  const [order, setOrder] = useState<AgentOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string>("");

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
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const symbol = order?.currency || "KWD";
  const pickup = order ? isPickupOrder(order) : false;
  const { date: scheduleDate, slot: scheduleSlot } = order ? getScheduleInfo(order) : { date: undefined, slot: undefined };
  const totals = order ? computeOrderTotals(order) : null;
  const address = order ? getOrderAddress(order) : null;
  const cancellable = order ? canCancelOrder(order) : false;

  const handleCancel = async () => {
    if (!order) return;
    const confirmed = window.confirm("Are you sure you want to cancel this order? This cannot be undone.");
    if (!confirmed) return;

    setCancelling(true);
    setCancelError("");
    try {
      await cancelAgentOrder(order.id);
      setOrder((prev) => (prev ? { ...prev, status: "CANCELLED" } : prev));
      onOrderCancelled(order.id);
    } catch (err: any) {
      setCancelError(err?.response?.data?.error || "Could not cancel this order.");
    } finally {
      setCancelling(false);
    }
  };

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
        ) : error || !order || !totals ? (
          <div className="af-modal-error">
            <AlertCircle size={20} />
            <span>{error || "Order not found."}</span>
          </div>
        ) : (
          <>
            <div className="af-modal-header">
              <h2>Order {formatOrderNumber(order)}</h2>
              <span className={getStatusBadgeClass(order.status)}>
                {getAgentStatusLabel(order.status)}
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
                    const cj = item.custom_json || {};
                    const qty = Number(item.quantity) || 0;
                    const unitFinal = Number(cj.final_price ?? cj.original_price ?? item.price ?? 0);
                    const lineTotal = cj.line_total ?? unitFinal * qty;
                    const flavour = itemDisplayFlavour(item);
                    const variant = itemDisplayVariant(item);
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
                          {cj.product_type && (
                            <span
                              className={`af-tag ${
                                cj.product_type === "AGENT" ? "af-tag-agent" : "af-tag-normal"
                              }`}
                            >
                              {cj.product_type === "AGENT" ? "Agent Exclusive" : "Normal"}
                            </span>
                          )}
                          {(flavour || variant) && (
                            <p className="af-detail-item-variant">
                              {flavour && <span>Flavour: {flavour}</span>}
                              {flavour && variant && <span> · </span>}
                              {variant && <span>Variant: {variant}</span>}
                            </p>
                          )}
                          {!!cj.discount_percentage && (
                            <p className="af-detail-item-discount">
                              {cj.discount_percentage}% off (-{symbol} {fmtMoney(cj.discount_amount)})
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
              <h3>{pickup ? "Pickup" : "Delivery"}</h3>

              {(scheduleDate || scheduleSlot) && (
                <div className="af-modal-schedule-highlight">
                  <CalendarClock size={14} />
                  <span>
                    {scheduleDate ? fmtDate(scheduleDate) : ""}
                    {scheduleSlot ? ` · ${scheduleSlot}` : ""}
                  </span>
                </div>
              )}

              {pickup ? (
                <p className="af-muted" style={{ marginTop: 10 }}>This order is set for pickup.</p>
              ) : address ? (
                <div style={{ marginTop: 10 }}>
                  <AddressDetailsBlock address={address} />
                </div>
              ) : (
                <p className="af-muted" style={{ marginTop: 10 }}>No address on file for this order.</p>
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

            {/* Totals — computed from item lines, not backend order.total */}
            <section className="af-modal-section af-totals-section">
              <div className="af-summary-row">
                <span>Subtotal</span>
                <span>{symbol} {fmtMoney(totals.subtotalBeforeDiscount)}</span>
              </div>
              {totals.discountTotal > 0 && (
                <div className="af-summary-row af-summary-discount">
                  <span>Agent Discount</span>
                  <span>-{symbol} {fmtMoney(totals.discountTotal)}</span>
                </div>
              )}
              <div className="af-summary-row">
                <span>Delivery Charge</span>
                <span>{symbol} {fmtMoney(totals.deliveryCharge)}</span>
              </div>
              <div className="af-summary-row af-summary-grand-total">
                <span>Grand Total</span>
                <span>{symbol} {fmtMoney(totals.grandTotal)}</span>
              </div>
            </section>

            {/* Simplified status — Order Placed / Ready / Out for Delivery / Delivered */}
            <section className="af-modal-section">
              <h3>Order Status</h3>
              <OrderStatusSteps status={order.status} />
            </section>

            {/* Cancel action — only while the order is still "Order Placed" */}
            {cancellable && (
              <section className="af-modal-section af-modal-cancel-section">
                {cancelError && (
                  <p className="af-cancel-error">
                    <AlertCircle size={14} /> {cancelError}
                  </p>
                )}
                <button
                  type="button"
                  className="af-modal-cancel-btn"
                  disabled={cancelling}
                  onClick={handleCancel}
                >
                  {cancelling ? <Loader2 className="af-spinner" size={16} /> : <Ban size={16} />}
                  {cancelling ? "Cancelling…" : "Cancel Order"}
                </button>
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
  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null);

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

  // Marks an order as CANCELLED locally once the API call succeeds, so both
  // the card grid and (if open) the modal stay in sync without a refetch.
  const applyCancelledLocally = (orderId: number) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: "CANCELLED" } : o)));
  };

  const handleCancelFromCard = async (orderId: number) => {
    const confirmed = window.confirm("Are you sure you want to cancel this order? This cannot be undone.");
    if (!confirmed) return;

    setCancellingOrderId(orderId);
    try {
      await cancelAgentOrder(orderId);
      applyCancelledLocally(orderId);
    } catch (err: any) {
      alert(err?.response?.data?.error || "Could not cancel this order.");
    } finally {
      setCancellingOrderId(null);
    }
  };

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
              <AgentOrderCard
                key={order.id}
                order={order}
                onClick={() => setSelectedOrderId(order.id)}
                onCancel={handleCancelFromCard}
                cancelling={cancellingOrderId === order.id}
              />
            ))}
          </div>
        )}
      </div>

      {selectedOrderId !== null && (
        <OrderDetailModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          onOrderCancelled={applyCancelledLocally}
        />
      )}
    </div>
  );
};

export default Agentfetchorder;