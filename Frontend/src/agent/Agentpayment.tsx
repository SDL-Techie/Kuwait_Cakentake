// import React, { useCallback, useEffect, useMemo, useState } from "react";
// import {
//   getAgents,
//   getOwnerAgentOrders,
//   updateOrdersPaymentStatus,
//   Agent,
//   OwnerAgentOrder,
//   PaymentStatus,
// } from "../services/Owneragentpaymentservice"; // adjust path to match project structure
// import "./Agentpayment.css";

// type PaymentFilter = "ALL" | "PENDING" | "PAID";

// function formatMoney(amount: number, currency: string = "KWD"): string {
//   const decimals = currency === "KWD" ? 3 : 2;
//   return `${currency} ${Number(amount || 0).toFixed(decimals)}`;
// }

// function formatDate(value?: string | null): string {
//   if (!value) return "—";
//   const date = new Date(value);
//   if (Number.isNaN(date.getTime())) return "—";
//   return date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
// }

// function isSameMonth(dateStr: string, ref: Date): boolean {
//   const d = new Date(dateStr);
//   if (Number.isNaN(d.getTime())) return false;
//   return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
// }

// const ORDER_STATUS_CLASS: Record<string, string> = {
//   PENDING: "badge-order-pending",
//   CONFIRMED: "badge-order-confirmed",
//   PREPARING: "badge-order-preparing",
//   OUT_FOR_DELIVERY: "badge-order-out",
//   DELIVERED: "badge-order-delivered",
//   CANCELLED: "badge-order-cancelled",
//   REJECTED: "badge-order-cancelled",
// };

// export default function AgentPayment(): React.JSX.Element {
//   const [agents, setAgents] = useState<Agent[]>([]);
//   const [orders, setOrders] = useState<OwnerAgentOrder[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<boolean>(false);

//   // filters
//   const [agentFilter, setAgentFilter] = useState<string>("ALL");
//   const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("ALL");
//   const [dateFrom, setDateFrom] = useState<string>("");
//   const [dateTo, setDateTo] = useState<string>("");
//   const [search, setSearch] = useState<string>("");

//   // selection
//   const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

//   // modals
//   const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
//   const [confirmSubmitting, setConfirmSubmitting] = useState<boolean>(false);
//   const [viewOrder, setViewOrder] = useState<OwnerAgentOrder | null>(null);

//   const fetchData = useCallback(async () => {
//     setLoading(true);
//     setError(false);
//     try {
//       // Agents must be fetched first — getOwnerAgentOrders needs the id→agent
//       // map to resolve agent_name, since GET /orders doesn't include it.
//       const agentsList = await getAgents();
//       const agentsById = new Map(agentsList.map((a) => [a.id, a]));

//       const ordersList = await getOwnerAgentOrders(agentsById, {
//         agent_id: agentFilter !== "ALL" ? Number(agentFilter) : undefined,
//         payment_status: paymentFilter !== "ALL" ? paymentFilter : undefined,
//         date_from: dateFrom || undefined,
//         date_to: dateTo || undefined,
//         search: search || undefined,
//       });

//       setAgents(agentsList);
//       setOrders(ordersList);
//     } catch (err) {
//       console.error("Failed to load agent payment data:", err);
//       setError(true);
//     } finally {
//       setLoading(false);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [agentFilter, paymentFilter, dateFrom, dateTo]);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   // debounce search so we don't refetch on every keystroke
//   useEffect(() => {
//     const timeout = setTimeout(() => {
//       fetchData();
//     }, 400);
//     return () => clearTimeout(timeout);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [search]);

//   // clear selection whenever the filtered order set changes
//   useEffect(() => {
//     setSelectedIds(new Set());
//   }, [orders]);

//   const currency = orders[0]?.currency || "KWD";

//   // ── Summary cards (pending/paid computed from the currently loaded order
//   // set; totalAgents comes from the registered agents list itself so it
//   // doesn't undercount agents who simply have no orders yet) ──
//   const summary = useMemo(() => {
//     let pendingAmount = 0;
//     let paidAmount = 0;
//     let pendingCount = 0;
//     let paidCount = 0;

//     orders.forEach((o) => {
//       if (o.payment_status === "PENDING") {
//         pendingAmount += Number(o.grand_total || 0);
//         pendingCount += 1;
//       } else if (o.payment_status === "PAID") {
//         paidAmount += Number(o.grand_total || 0);
//         paidCount += 1;
//       }
//     });

//     return {
//       pendingAmount,
//       paidAmount,
//       pendingCount,
//       paidCount,
//       totalAgents: agents.length,
//     };
//   }, [orders, agents]);

//   // ── Monthly stats ──
//   const monthlyStats = useMemo(() => {
//     const now = new Date();
//     const prevMonthRef = new Date(now.getFullYear(), now.getMonth() - 1, 1);

//     let currentMonthCollection = 0;
//     let previousMonthCollection = 0;
//     const paidMonths = new Set<string>();

//     orders.forEach((o) => {
//       if (o.payment_status !== "PAID") return;
//       if (isSameMonth(o.created_at, now)) currentMonthCollection += Number(o.grand_total || 0);
//       if (isSameMonth(o.created_at, prevMonthRef)) previousMonthCollection += Number(o.grand_total || 0);

//       const d = new Date(o.created_at);
//       if (!Number.isNaN(d.getTime())) {
//         paidMonths.add(`${d.getFullYear()}-${d.getMonth()}`);
//       }
//     });

//     // Average collection = average PAID revenue per calendar month that had at least one paid order.
//     const averageCollection = paidMonths.size > 0 ? summary.paidAmount / paidMonths.size : 0;

//     return {
//       currentMonthCollection,
//       previousMonthCollection,
//       outstandingAmount: summary.pendingAmount,
//       averageCollection,
//     };
//   }, [orders, summary]);

//   // ── Selected agent (for side panel) — only meaningful when a single agent is filtered ──
//   const selectedAgent = useMemo(() => {
//     if (agentFilter === "ALL") return null;
//     return agents.find((a) => a.id === Number(agentFilter)) || null;
//   }, [agentFilter, agents]);

//   const agentPanelStats = useMemo(() => {
//     if (!selectedAgent) return null;
//     const agentOrders = orders.filter((o) => o.agent_id === selectedAgent.id);
//     const pending = agentOrders.filter((o) => o.payment_status === "PENDING");
//     const paid = agentOrders.filter((o) => o.payment_status === "PAID");
//     return {
//       pendingCount: pending.length,
//       pendingAmount: pending.reduce((sum, o) => sum + Number(o.grand_total || 0), 0),
//       paidCount: paid.length,
//       paidAmount: paid.reduce((sum, o) => sum + Number(o.grand_total || 0), 0),
//     };
//   }, [selectedAgent, orders]);

//   // ── Group orders by agent for table display ──
//   const groupedOrders = useMemo(() => {
//     const groups = new Map<number, { agentName: string; orders: OwnerAgentOrder[] }>();
//     orders.forEach((o) => {
//       if (!groups.has(o.agent_id)) {
//         groups.set(o.agent_id, { agentName: o.agent_name, orders: [] });
//       }
//       groups.get(o.agent_id)!.orders.push(o);
//     });
//     return Array.from(groups.entries());
//   }, [orders]);

//   // ── Selection helpers ──
//   const selectableOrders = useMemo(() => orders.filter((o) => o.payment_status === "PENDING"), [orders]);

//   const selectedOrders = useMemo(
//     () => orders.filter((o) => selectedIds.has(o.id)),
//     [orders, selectedIds]
//   );

//   const selectedTotal = useMemo(
//     () => selectedOrders.reduce((sum, o) => sum + Number(o.grand_total || 0), 0),
//     [selectedOrders]
//   );

//   const toggleOrder = (order: OwnerAgentOrder) => {
//     if (order.payment_status !== "PENDING") return;
//     setSelectedIds((prev) => {
//       const next = new Set(prev);
//       if (next.has(order.id)) {
//         next.delete(order.id);
//       } else {
//         next.add(order.id);
//       }
//       return next;
//     });
//   };

//   const toggleSelectAllInGroup = (groupOrders: OwnerAgentOrder[]) => {
//     const groupPendingIds = groupOrders.filter((o) => o.payment_status === "PENDING").map((o) => o.id);
//     const allSelected = groupPendingIds.every((id) => selectedIds.has(id));
//     setSelectedIds((prev) => {
//       const next = new Set(prev);
//       groupPendingIds.forEach((id) => {
//         if (allSelected) {
//           next.delete(id);
//         } else {
//           next.add(id);
//         }
//       });
//       return next;
//     });
//   };

//   const clearSelection = () => setSelectedIds(new Set());

//   // ── Bulk mark-as-paid ──
//   const handleConfirmPayment = async () => {
//     setConfirmSubmitting(true);
//     try {
//       await updateOrdersPaymentStatus(Array.from(selectedIds), "PAID" as PaymentStatus);
//       setConfirmOpen(false);
//       clearSelection();
//       await fetchData();
//     } catch (err) {
//       console.error("Failed to mark orders as paid:", err);
//       // Keep the modal open so the owner can retry.
//     } finally {
//       setConfirmSubmitting(false);
//     }
//   };

//   // ── Search filtering happens server-side via getOwnerAgentOrders, but we
//   // keep a light client-side pass too in case the placeholder backend
//   // doesn't yet support the `search` param. ──
//   const visibleGroupedOrders = useMemo(() => {
//     if (!search.trim()) return groupedOrders;
//     const q = search.trim().toLowerCase();
//     return groupedOrders
//       .map(([agentId, group]) => [
//         agentId,
//         {
//           ...group,
//           orders: group.orders.filter(
//             (o) =>
//               o.order_number?.toLowerCase().includes(q) ||
//               o.customer_name?.toLowerCase().includes(q) ||
//               o.customer_phone?.toLowerCase().includes(q)
//           ),
//         },
//       ] as [number, { agentName: string; orders: OwnerAgentOrder[] }])
//       .filter(([, group]) => group.orders.length > 0);
//   }, [groupedOrders, search]);

//   return (
//     <div className="agent-payment-page">
//       <header className="agent-payment-header">
//         <div>
//           <h1 className="agent-payment-title">Agent Payment Management</h1>
//           <p className="agent-payment-subtitle">
//             Track pending collections from sales agents and mark them as paid.
//           </p>
//         </div>
//         <button className="agent-payment-refresh-btn" onClick={fetchData} disabled={loading}>
//           ⟳ Refresh
//         </button>
//       </header>

//       {/* ── Summary cards ── */}
//       <section className="agent-payment-summary-grid">
//         <div className="agent-payment-summary-card agent-payment-summary-card--amber">
//           <span className="agent-payment-summary-label">Total Pending Amount</span>
//           <span className="agent-payment-summary-value">{formatMoney(summary.pendingAmount, currency)}</span>
//         </div>
//         <div className="agent-payment-summary-card agent-payment-summary-card--green">
//           <span className="agent-payment-summary-label">Total Paid Amount</span>
//           <span className="agent-payment-summary-value">{formatMoney(summary.paidAmount, currency)}</span>
//         </div>
//         <div className="agent-payment-summary-card">
//           <span className="agent-payment-summary-label">Pending Orders</span>
//           <span className="agent-payment-summary-value">{summary.pendingCount}</span>
//         </div>
//         <div className="agent-payment-summary-card">
//           <span className="agent-payment-summary-label">Paid Orders</span>
//           <span className="agent-payment-summary-value">{summary.paidCount}</span>
//         </div>
//         <div className="agent-payment-summary-card">
//           <span className="agent-payment-summary-label">Total Agents</span>
//           <span className="agent-payment-summary-value">{summary.totalAgents}</span>
//         </div>
//       </section>

//       {/* ── Filters ── */}
//       <section className="agent-payment-filters">
//         <div className="agent-payment-filter-field">
//           <label>Agent</label>
//           <select value={agentFilter} onChange={(e) => setAgentFilter(e.target.value)}>
//             <option value="ALL">All Agents</option>
//             {agents.map((a) => (
//               <option key={a.id} value={a.id}>
//                 {a.first_name} {a.last_name}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="agent-payment-filter-field">
//           <label>Payment Status</label>
//           <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value as PaymentFilter)}>
//             <option value="ALL">All</option>
//             <option value="PENDING">Pending</option>
//             <option value="PAID">Paid</option>
//           </select>
//         </div>

//         <div className="agent-payment-filter-field">
//           <label>From Date</label>
//           <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
//         </div>

//         <div className="agent-payment-filter-field">
//           <label>To Date</label>
//           <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
//         </div>

//         <div className="agent-payment-filter-field agent-payment-filter-field--search">
//           <label>Search</label>
//           <input
//             type="text"
//             placeholder="Customer name, order number, or phone"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//         </div>
//       </section>

//       <div className="agent-payment-body">
//         {/* ── Main column ── */}
//         <div className="agent-payment-main">
//           {/* Selected bar */}
//           {selectedIds.size > 0 && (
//             <div className="agent-payment-selected-bar">
//               <div>
//                 <span className="agent-payment-selected-label">Selected Orders</span>
//                 <span className="agent-payment-selected-count">{selectedIds.size}</span>
//               </div>
//               <div>
//                 <span className="agent-payment-selected-label">Total Selected</span>
//                 <span className="agent-payment-selected-count">{formatMoney(selectedTotal, currency)}</span>
//               </div>
//               <div className="agent-payment-selected-actions">
//                 <button className="agent-payment-link-btn" onClick={clearSelection}>
//                   Clear
//                 </button>
//                 <button className="agent-payment-pay-btn" onClick={() => setConfirmOpen(true)}>
//                   Mark Selected as Paid
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Table */}
//           {loading ? (
//             <div className="agent-payment-skeleton-wrapper">
//               {[...Array(5)].map((_, i) => (
//                 <div className="agent-payment-skeleton-row" key={i} />
//               ))}
//             </div>
//           ) : error ? (
//             <div className="agent-payment-empty agent-payment-empty--error">
//               <p>Unable to load agent payment data.</p>
//               <button className="agent-payment-link-btn" onClick={fetchData}>
//                 Retry
//               </button>
//             </div>
//           ) : visibleGroupedOrders.length === 0 ? (
//             <div className="agent-payment-empty">No orders match the current filters.</div>
//           ) : (
//             <div className="agent-payment-table-wrapper">
//               <table className="agent-payment-table">
//                 <colgroup>
//                   <col style={{ width: "40px" }} />
//                   <col style={{ width: "130px" }} />
//                   <col style={{ width: "150px" }} />
//                   <col style={{ width: "110px" }} />
//                   <col style={{ width: "110px" }} />
//                   <col style={{ width: "100px" }} />
//                   <col style={{ width: "130px" }} />
//                   <col style={{ width: "100px" }} />
//                   <col style={{ width: "90px" }} />
//                 </colgroup>
//                 <thead>
//                   <tr>
//                     <th></th>
//                     <th>Order #</th>
//                     <th>Customer</th>
//                     <th>Created</th>
//                     <th>Amount</th>
//                     <th>Payment</th>
//                     <th>Order Status</th>
//                     <th>Method</th>
//                     <th>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {visibleGroupedOrders.map(([agentId, group]) => {
//                     const groupPendingIds = group.orders
//                       .filter((o) => o.payment_status === "PENDING")
//                       .map((o) => o.id);
//                     const groupAllSelected =
//                       groupPendingIds.length > 0 && groupPendingIds.every((id) => selectedIds.has(id));

//                     return (
//                       <React.Fragment key={agentId}>
//                         <tr className="agent-payment-group-row">
//                           <td>
//                             {groupPendingIds.length > 0 && (
//                               <input
//                                 type="checkbox"
//                                 checked={groupAllSelected}
//                                 onChange={() => toggleSelectAllInGroup(group.orders)}
//                                 title="Select all pending orders for this agent"
//                               />
//                             )}
//                           </td>
//                           <td colSpan={8} className="agent-payment-group-title">
//                             {group.agentName}
//                           </td>
//                         </tr>
//                         {group.orders.map((order) => (
//                           <tr key={order.id} className="agent-payment-order-row">
//                             <td>
//                               {order.payment_status === "PENDING" ? (
//                                 <input
//                                   type="checkbox"
//                                   checked={selectedIds.has(order.id)}
//                                   onChange={() => toggleOrder(order)}
//                                 />
//                               ) : (
//                                 <span className="agent-payment-checkbox-disabled" title="Already paid" />
//                               )}
//                             </td>
//                             <td>{order.order_number}</td>
//                             <td>{order.customer_name}</td>
//                             <td>{formatDate(order.created_at)}</td>
//                             <td>{formatMoney(order.grand_total, order.currency || currency)}</td>
//                             <td>
//                               <span
//                                 className={`agent-payment-badge ${
//                                   order.payment_status === "PAID"
//                                     ? "badge-payment-paid"
//                                     : "badge-payment-pending"
//                                 }`}
//                               >
//                                 {order.payment_status}
//                               </span>
//                             </td>
//                             <td>
//                               <span
//                                 className={`agent-payment-badge ${
//                                   ORDER_STATUS_CLASS[String(order.status).toUpperCase()] ||
//                                   "badge-order-default"
//                                 }`}
//                               >
//                                 {order.status}
//                               </span>
//                             </td>
//                             <td>{order.payment_method}</td>
//                             <td>
//                               <button
//                                 className="agent-payment-view-btn"
//                                 onClick={() => setViewOrder(order)}
//                                 title="View order details"
//                                 aria-label="View order details"
//                               >
//                                 <svg
//                                   width="16"
//                                   height="16"
//                                   viewBox="0 0 24 24"
//                                   fill="none"
//                                   stroke="currentColor"
//                                   strokeWidth="2"
//                                   strokeLinecap="round"
//                                   strokeLinejoin="round"
//                                 >
//                                   <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
//                                   <circle cx="12" cy="12" r="3" />
//                                 </svg>
//                               </button>
//                             </td>
//                           </tr>
//                         ))}
//                       </React.Fragment>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           )}

//           {/* Monthly statistics */}
//           <section className="agent-payment-monthly-stats">
//             <div className="agent-payment-stat-block">
//               <span className="agent-payment-summary-label">Current Month Collection</span>
//               <span className="agent-payment-summary-value">
//                 {formatMoney(monthlyStats.currentMonthCollection, currency)}
//               </span>
//             </div>
//             <div className="agent-payment-stat-block">
//               <span className="agent-payment-summary-label">Previous Month Collection</span>
//               <span className="agent-payment-summary-value">
//                 {formatMoney(monthlyStats.previousMonthCollection, currency)}
//               </span>
//             </div>
//             <div className="agent-payment-stat-block">
//               <span className="agent-payment-summary-label">Outstanding Amount</span>
//               <span className="agent-payment-summary-value">
//                 {formatMoney(monthlyStats.outstandingAmount, currency)}
//               </span>
//             </div>
//             <div className="agent-payment-stat-block">
//               <span className="agent-payment-summary-label">Average Monthly Collection</span>
//               <span className="agent-payment-summary-value">
//                 {formatMoney(monthlyStats.averageCollection, currency)}
//               </span>
//             </div>
//           </section>
//         </div>

//         {/* ── Agent summary side panel ── */}
//         {selectedAgent && agentPanelStats && (
//           <aside className="agent-payment-side-panel">
//             <h3>Agent</h3>
//             <p className="agent-payment-side-agent-name">
//               {selectedAgent.first_name} {selectedAgent.last_name}
//             </p>
//             <div className="agent-payment-side-row">
//               <span>Pending Orders</span>
//               <strong>{agentPanelStats.pendingCount}</strong>
//             </div>
//             <div className="agent-payment-side-row">
//               <span>Pending Amount</span>
//               <strong>{formatMoney(agentPanelStats.pendingAmount, currency)}</strong>
//             </div>
//             <div className="agent-payment-side-row">
//               <span>Paid Orders</span>
//               <strong>{agentPanelStats.paidCount}</strong>
//             </div>
//             <div className="agent-payment-side-row">
//               <span>Collected Amount</span>
//               <strong>{formatMoney(agentPanelStats.paidAmount, currency)}</strong>
//             </div>
//           </aside>
//         )}
//       </div>

//       {/* ── Confirm payment modal ── */}
//       {confirmOpen && (
//         <div className="agent-payment-modal-overlay" onClick={() => !confirmSubmitting && setConfirmOpen(false)}>
//           <div className="agent-payment-modal" onClick={(e) => e.stopPropagation()}>
//             <h2>Collect Payment?</h2>
//             <div className="agent-payment-modal-row">
//               <span>Agent</span>
//               <strong>
//                 {selectedOrders.length > 0
//                   ? Array.from(new Set(selectedOrders.map((o) => o.agent_name))).join(", ")
//                   : "—"}
//               </strong>
//             </div>
//             <div className="agent-payment-modal-row">
//               <span>Orders</span>
//               <strong>{selectedOrders.length}</strong>
//             </div>
//             <div className="agent-payment-modal-row">
//               <span>Total</span>
//               <strong>{formatMoney(selectedTotal, currency)}</strong>
//             </div>
//             <div className="agent-payment-modal-row">
//               <span>Payment Method</span>
//               <strong>Cash</strong>
//             </div>
//             <div className="agent-payment-modal-actions">
//               <button
//                 className="agent-payment-link-btn"
//                 onClick={() => setConfirmOpen(false)}
//                 disabled={confirmSubmitting}
//               >
//                 Cancel
//               </button>
//               <button
//                 className="agent-payment-pay-btn"
//                 onClick={handleConfirmPayment}
//                 disabled={confirmSubmitting}
//               >
//                 {confirmSubmitting ? "Confirming..." : "Confirm"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── View order modal ── */}
//       {viewOrder && (
//         <div className="agent-payment-modal-overlay" onClick={() => setViewOrder(null)}>
//           <div className="agent-payment-modal agent-payment-modal--wide" onClick={(e) => e.stopPropagation()}>
//             <h2>Order {viewOrder.order_number}</h2>
//             <div className="agent-payment-view-grid">
//               <div>
//                 <span className="agent-payment-summary-label">Agent</span>
//                 <p>{viewOrder.agent_name}</p>
//               </div>
//               <div>
//                 <span className="agent-payment-summary-label">Customer</span>
//                 <p>{viewOrder.customer_name}</p>
//               </div>
//               <div>
//                 <span className="agent-payment-summary-label">Phone</span>
//                 <p>{viewOrder.customer_phone}</p>
//               </div>
//               <div>
//                 <span className="agent-payment-summary-label">Address</span>
//                 <p>{viewOrder.address || "—"}</p>
//               </div>
//               <div>
//                 <span className="agent-payment-summary-label">Created</span>
//                 <p>{formatDate(viewOrder.created_at)}</p>
//               </div>
//               <div>
//                 <span className="agent-payment-summary-label">Delivery Date</span>
//                 <p>{formatDate(viewOrder.delivery_date)}</p>
//               </div>
//               <div>
//                 <span className="agent-payment-summary-label">Payment Status</span>
//                 <p>{viewOrder.payment_status}</p>
//               </div>
//               <div>
//                 <span className="agent-payment-summary-label">Notes</span>
//                 <p>{viewOrder.notes || "—"}</p>
//               </div>
//             </div>

//             {viewOrder.items && viewOrder.items.length > 0 && (
//               <div className="agent-payment-view-items">
//                 <span className="agent-payment-summary-label">Items</span>
//                 <table className="agent-payment-items-table">
//                   <thead>
//                     <tr>
//                       <th>Product</th>
//                       <th>Qty</th>
//                       <th>Price</th>
//                       <th>Total</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {viewOrder.items.map((item, idx) => (
//                       <tr key={idx}>
//                         <td>{item.product_name || "—"}</td>
//                         <td>{item.quantity}</td>
//                         <td>{formatMoney(item.price, viewOrder.currency)}</td>
//                         <td>{formatMoney(item.line_total, viewOrder.currency)}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}

//             <div className="agent-payment-view-totals">
//               <div>
//                 <span>Subtotal</span>
//                 <strong>{formatMoney(viewOrder.subtotal, viewOrder.currency)}</strong>
//               </div>
//               <div>
//                 <span>Discount</span>
//                 <strong>-{formatMoney(viewOrder.discount, viewOrder.currency)}</strong>
//               </div>
//               <div>
//                 <span>Delivery Charge</span>
//                 <strong>{formatMoney(viewOrder.delivery_charge, viewOrder.currency)}</strong>
//               </div>
//               <div className="agent-payment-view-grand-total">
//                 <span>Grand Total</span>
//                 <strong>{formatMoney(viewOrder.grand_total, viewOrder.currency)}</strong>
//               </div>
//             </div>

//             <div className="agent-payment-modal-actions">
//               <button className="agent-payment-link-btn" onClick={() => setViewOrder(null)}>
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAgents,
  getOwnerAgentOrders,
  updateOrdersPaymentStatus,
  Agent,
  OwnerAgentOrder,
  PaymentStatus,
} from "../services/Owneragentpaymentservice"; // adjust path to match project structure
import { createPaymentLink } from "../services/paymentService"; // adjust path to match project structure
import { QRCodeSVG } from "qrcode.react";
import "./Agentpayment.css";

type Tab = "UNPAID" | "PAID";
type PayMethod = "COD" | "ONLINE";
type PayStep = "select" | "code";

function formatMoney(amount: number, currency: string = "KWD"): string {
  const decimals = currency === "KWD" ? 3 : 2;
  return Number(amount || 0).toFixed(decimals);
}

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

function isSameMonth(dateStr: string, ref: Date): boolean {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

const ORDER_STATUS_CLASS: Record<string, string> = {
  PENDING: "badge-order-pending",
  CONFIRMED: "badge-order-confirmed",
  PREPARING: "badge-order-preparing",
  OUT_FOR_DELIVERY: "badge-order-out",
  DELIVERED: "badge-order-delivered",
  CANCELLED: "badge-order-cancelled",
  REJECTED: "badge-order-cancelled",
};

export default function AgentPayment(): React.JSX.Element {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [orders, setOrders] = useState<OwnerAgentOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  // tab
  const [activeTab, setActiveTab] = useState<Tab>("UNPAID");

  // filters
  const [agentFilter, setAgentFilter] = useState<string>("ALL");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  // selection — a payment can only ever combine orders from ONE agent
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [switchNotice, setSwitchNotice] = useState<string>("");

  // pay modal
  const [payModalOpen, setPayModalOpen] = useState<boolean>(false);
  const [payMethod, setPayMethod] = useState<PayMethod>("COD");
  const [payStep, setPayStep] = useState<PayStep>("select");
  const [paySubmitting, setPaySubmitting] = useState<boolean>(false);
  const [payError, setPayError] = useState<string>("");
  const [payNotice, setPayNotice] = useState<string>("");
  const [paymentLinkUrl, setPaymentLinkUrl] = useState<string>("");
  const [paymentLinkOrders, setPaymentLinkOrders] = useState<OwnerAgentOrder[]>([]);

  // view modal
  const [viewOrder, setViewOrder] = useState<OwnerAgentOrder | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      // Agents must be fetched first — getOwnerAgentOrders needs the id→agent
      // map to resolve agent_name, since GET /orders doesn't include it.
      const agentsList = await getAgents();
      const agentsById = new Map(agentsList.map((a) => [a.id, a]));

      // NOTE: payment_status is intentionally NOT sent — we fetch both paid
      // and unpaid orders in one call and split them client-side into tabs,
      // so switching tabs is instant and the tab counters stay accurate.
      const ordersList = await getOwnerAgentOrders(agentsById, {
        agent_id: agentFilter !== "ALL" ? Number(agentFilter) : undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        search: search || undefined,
      });

      setAgents(agentsList);
      setOrders(ordersList);
    } catch (err) {
      console.error("Failed to load agent payment data:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // debounce search so we don't refetch on every keystroke
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchData();
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // clear selection whenever the underlying order set changes
  useEffect(() => {
    setSelectedIds(new Set());
    setSelectedAgentId(null);
  }, [orders]);

  const currency = orders[0]?.currency || "KWD";

  const unpaidOrders = useMemo(() => orders.filter((o) => o.payment_status === "PENDING"), [orders]);
  const paidOrders = useMemo(() => orders.filter((o) => o.payment_status === "PAID"), [orders]);
  const tabOrders = activeTab === "UNPAID" ? unpaidOrders : paidOrders;

  // ── Summary cards ──
  const summary = useMemo(() => {
    const pendingAmount = unpaidOrders.reduce((sum, o) => sum + Number(o.grand_total || 0), 0);
    const paidAmount = paidOrders.reduce((sum, o) => sum + Number(o.grand_total || 0), 0);
    return {
      pendingAmount,
      paidAmount,
      pendingCount: unpaidOrders.length,
      paidCount: paidOrders.length,
      totalAgents: agents.length,
    };
  }, [unpaidOrders, paidOrders, agents]);

  // ── Monthly stats ──
  const monthlyStats = useMemo(() => {
    const now = new Date();
    const prevMonthRef = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    let currentMonthCollection = 0;
    let previousMonthCollection = 0;
    const paidMonths = new Set<string>();

    paidOrders.forEach((o) => {
      if (isSameMonth(o.created_at, now)) currentMonthCollection += Number(o.grand_total || 0);
      if (isSameMonth(o.created_at, prevMonthRef)) previousMonthCollection += Number(o.grand_total || 0);

      const d = new Date(o.created_at);
      if (!Number.isNaN(d.getTime())) {
        paidMonths.add(`${d.getFullYear()}-${d.getMonth()}`);
      }
    });

    const averageCollection = paidMonths.size > 0 ? summary.paidAmount / paidMonths.size : 0;

    return {
      currentMonthCollection,
      previousMonthCollection,
      outstandingAmount: summary.pendingAmount,
      averageCollection,
    };
  }, [paidOrders, summary]);

  // ── Selected agent (for side panel) — only meaningful when a single agent is filtered ──
  const selectedAgent = useMemo(() => {
    if (agentFilter === "ALL") return null;
    return agents.find((a) => a.id === Number(agentFilter)) || null;
  }, [agentFilter, agents]);

  const agentPanelStats = useMemo(() => {
    if (!selectedAgent) return null;
    const agentOrders = orders.filter((o) => o.agent_id === selectedAgent.id);
    const pending = agentOrders.filter((o) => o.payment_status === "PENDING");
    const paid = agentOrders.filter((o) => o.payment_status === "PAID");
    return {
      pendingCount: pending.length,
      pendingAmount: pending.reduce((sum, o) => sum + Number(o.grand_total || 0), 0),
      paidCount: paid.length,
      paidAmount: paid.reduce((sum, o) => sum + Number(o.grand_total || 0), 0),
    };
  }, [selectedAgent, orders]);

  // ── Group orders (of the active tab) by agent for table display ──
  const groupedOrders = useMemo(() => {
    const groups = new Map<number, { agentName: string; orders: OwnerAgentOrder[] }>();
    tabOrders.forEach((o) => {
      if (!groups.has(o.agent_id)) {
        groups.set(o.agent_id, { agentName: o.agent_name, orders: [] });
      }
      groups.get(o.agent_id)!.orders.push(o);
    });
    return Array.from(groups.entries());
  }, [tabOrders]);

  const selectedOrders = useMemo(
    () => unpaidOrders.filter((o) => selectedIds.has(o.id)),
    [unpaidOrders, selectedIds]
  );

  const selectedTotal = useMemo(
    () => selectedOrders.reduce((sum, o) => sum + Number(o.grand_total || 0), 0),
    [selectedOrders]
  );

  // ── Selection: a single in-flight payment can only span ONE agent's orders.
  // Selecting an order that belongs to a different agent than the current
  // selection swaps the selection over to that agent instead of merging. ──
  const toggleOrder = (order: OwnerAgentOrder) => {
    if (order.payment_status !== "PENDING") return;

    setSelectedIds((prev) => {
      if (prev.has(order.id)) {
        const next = new Set(prev);
        next.delete(order.id);
        if (next.size === 0) setSelectedAgentId(null);
        return next;
      }

      if (selectedAgentId !== null && selectedAgentId !== order.agent_id) {
        setSwitchNotice(`Switched selection to ${order.agent_name}'s orders — a payment covers one agent at a time.`);
        setSelectedAgentId(order.agent_id);
        return new Set([order.id]);
      }

      setSelectedAgentId(order.agent_id);
      return new Set(prev).add(order.id);
    });
  };

  const toggleSelectAllInGroup = (groupOrders: OwnerAgentOrder[]) => {
    const groupPendingIds = groupOrders.filter((o) => o.payment_status === "PENDING").map((o) => o.id);
    if (groupPendingIds.length === 0) return;
    const groupAgentId = groupOrders[0].agent_id;
    const groupAgentName = groupOrders[0].agent_name;

    setSelectedIds((prev) => {
      const sameAgentAlready = selectedAgentId === null || selectedAgentId === groupAgentId;

      if (!sameAgentAlready) {
        setSwitchNotice(`Switched selection to ${groupAgentName}'s orders — a payment covers one agent at a time.`);
        setSelectedAgentId(groupAgentId);
        return new Set(groupPendingIds);
      }

      const allSelected = groupPendingIds.every((id) => prev.has(id));
      const next = new Set(prev);
      groupPendingIds.forEach((id) => {
        if (allSelected) next.delete(id);
        else next.add(id);
      });
      if (next.size === 0) setSelectedAgentId(null);
      else setSelectedAgentId(groupAgentId);
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setSelectedAgentId(null);
  };

  useEffect(() => {
    if (!switchNotice) return;
    const t = setTimeout(() => setSwitchNotice(""), 3500);
    return () => clearTimeout(t);
  }, [switchNotice]);

  // ── Initiate payment ──
  // COD settles every selected order immediately (bulk, one agent).
  // ONLINE combines every selected order (all one agent, same currency)
  // into a SINGLE Tap/KNET charge on the backend and returns one
  // payment_url for the combined total. Instead of redirecting to the
  // payment portal, the link is rendered as a scannable barcode here.
  const handleInitiatePayment = async () => {
    setPayError("");
    setPayNotice("");

    const orderIds = Array.from(selectedIds);
    if (orderIds.length === 0) return;

    setPaySubmitting(true);
    try {
      if (payMethod === "COD") {
        await updateOrdersPaymentStatus(orderIds, "PAID" as PaymentStatus, "COD");
        closePayModal();
        clearSelection();
        await fetchData();
      } else {
        const result = await createPaymentLink(orderIds);

        if (!result?.success || !result?.payment_url) {
          setPayError(result?.error || "Could not generate a payment link for these orders.");
          return;
        }

        setPaymentLinkUrl(result.payment_url);
        setPaymentLinkOrders(selectedOrders);
        setPayStep("code");
        await fetchData();
      }
    } catch (err) {
      console.error("Failed to initiate payment:", err);
      setPayError("Something went wrong initiating this payment. Please try again.");
    } finally {
      setPaySubmitting(false);
    }
  };

  // Render the payment link as a scannable barcode (QR) — no redirect to a
  // hosted payment portal, per requirement. qrcode.react draws it directly
  // from paymentLinkUrl, so no async generation step is needed.

  const closePayModal = () => {
    setPayModalOpen(false);
    setPayStep("select");
    setPaymentLinkUrl("");
    setPaymentLinkOrders([]);
    setPayError("");
  };

  const handleDonePayModal = async () => {
    closePayModal();
    clearSelection();
    setPayNotice("Payment link generated. The order will move to Paid once the payment completes.");
    await fetchData();
  };

  // ── Search filtering happens server-side via getOwnerAgentOrders, but we
  // keep a light client-side pass too in case the placeholder backend
  // doesn't yet support the `search` param. ──
  const visibleGroupedOrders = useMemo(() => {
    if (!search.trim()) return groupedOrders;
    const q = search.trim().toLowerCase();
    return groupedOrders
      .map(([agentId, group]) => [
        agentId,
        {
          ...group,
          orders: group.orders.filter(
            (o) =>
              o.order_number?.toLowerCase().includes(q) ||
              o.customer_name?.toLowerCase().includes(q) ||
              o.customer_phone?.toLowerCase().includes(q)
          ),
        },
      ] as [number, { agentName: string; orders: OwnerAgentOrder[] }])
      .filter(([, group]) => group.orders.length > 0);
  }, [groupedOrders, search]);

  return (
    <div className="agent-payment-page">
      <header className="agent-payment-header">
        <div>
          <h1 className="agent-payment-title">Agent Payment Management</h1>
          <p className="agent-payment-subtitle">
            Track collections from sales agents and settle their orders by cash or online payment.
          </p>
        </div>
        <button className="agent-payment-refresh-btn" onClick={fetchData} disabled={loading}>
          ⟳ Refresh
        </button>
      </header>

      {/* ── Summary cards ── */}
      <section className="agent-payment-summary-grid">
        <div className="agent-payment-summary-card agent-payment-summary-card--amber">
          <span className="agent-payment-summary-label">Total Pending Amount</span>
          <span className="agent-payment-summary-value">{formatMoney(summary.pendingAmount, currency)}</span>
        </div>
        <div className="agent-payment-summary-card agent-payment-summary-card--green">
          <span className="agent-payment-summary-label">Total Paid Amount</span>
          <span className="agent-payment-summary-value">{formatMoney(summary.paidAmount, currency)}</span>
        </div>
        <div className="agent-payment-summary-card">
          <span className="agent-payment-summary-label">Pending Orders</span>
          <span className="agent-payment-summary-value">{summary.pendingCount}</span>
        </div>
        <div className="agent-payment-summary-card">
          <span className="agent-payment-summary-label">Paid Orders</span>
          <span className="agent-payment-summary-value">{summary.paidCount}</span>
        </div>
        <div className="agent-payment-summary-card">
          <span className="agent-payment-summary-label">Total Agents</span>
          <span className="agent-payment-summary-value">{summary.totalAgents}</span>
        </div>
      </section>

      {/* ── Filters ── */}
      <section className="agent-payment-filters">
        <div className="agent-payment-filter-field">
          <label>Agent</label>
          <select value={agentFilter} onChange={(e) => setAgentFilter(e.target.value)}>
            <option value="ALL">All Agents</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.first_name} {a.last_name}
              </option>
            ))}
          </select>
        </div>

        <div className="agent-payment-filter-field">
          <label>From Date</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>

        <div className="agent-payment-filter-field">
          <label>To Date</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>

        <div className="agent-payment-filter-field agent-payment-filter-field--search">
          <label>Search</label>
          <input
            type="text"
            placeholder="Customer name, order number, or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      {/* ── Tabs ── */}
      <div className="agent-payment-tabs">
        <button
          className={`agent-payment-tab ${activeTab === "UNPAID" ? "agent-payment-tab--active" : ""}`}
          onClick={() => setActiveTab("UNPAID")}
        >
          Unpaid Orders
          <span className="agent-payment-tab-count">{summary.pendingCount}</span>
        </button>
        <button
          className={`agent-payment-tab ${activeTab === "PAID" ? "agent-payment-tab--active" : ""}`}
          onClick={() => setActiveTab("PAID")}
        >
          Paid Orders
          <span className="agent-payment-tab-count">{summary.paidCount}</span>
        </button>
      </div>

      {payNotice && <div className="agent-payment-inline-notice">{payNotice}</div>}

      <div className={`agent-payment-body ${selectedAgent ? "agent-payment-body--with-panel" : ""}`}>
        {/* ── Main column ── */}
        <div className="agent-payment-main">
          {/* Selected bar */}
          {activeTab === "UNPAID" && selectedIds.size > 0 && (
            <div className="agent-payment-selected-bar">
              <div>
                <span className="agent-payment-selected-label">Selected Orders</span>
                <span className="agent-payment-selected-count">{selectedIds.size}</span>
              </div>
              <div>
                <span className="agent-payment-selected-label">Total Selected</span>
                <span className="agent-payment-selected-count">{formatMoney(selectedTotal, currency)}</span>
              </div>
              {switchNotice && <div className="agent-payment-switch-notice">{switchNotice}</div>}
              <div className="agent-payment-selected-actions">
                <button className="agent-payment-link-btn" onClick={clearSelection}>
                  Clear
                </button>
                <button
                  className="agent-payment-pay-btn"
                  onClick={() => {
                    setPayStep("select");
                    setPayModalOpen(true);
                  }}
                >
                  Initiate Payment
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="agent-payment-skeleton-wrapper">
              {[...Array(5)].map((_, i) => (
                <div className="agent-payment-skeleton-row" key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="agent-payment-empty agent-payment-empty--error">
              <p>Unable to load agent payment data.</p>
              <button className="agent-payment-link-btn" onClick={fetchData}>
                Retry
              </button>
            </div>
          ) : visibleGroupedOrders.length === 0 ? (
            <div className="agent-payment-empty">
              {activeTab === "UNPAID" ? "No unpaid orders match the current filters." : "No paid orders match the current filters."}
            </div>
          ) : (
            <div className="agent-payment-table-wrapper">
              <table className="agent-payment-table">
                <thead>
                  <tr>
                    {activeTab === "UNPAID" && <th className="col-check"></th>}
                    <th className="col-order">Order #</th>
                    <th className="col-customer">Customer</th>
                    <th className="col-date">Created</th>
                    <th className="col-amount">Amount</th>
                    <th className="col-status">Order Status</th>
                    <th className="col-method">{activeTab === "UNPAID" ? "Method" : "Settled Via"}</th>
                    <th className="col-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleGroupedOrders.map(([agentId, group]) => {
                    const groupPendingIds = group.orders
                      .filter((o) => o.payment_status === "PENDING")
                      .map((o) => o.id);
                    const groupAllSelected =
                      groupPendingIds.length > 0 && groupPendingIds.every((id) => selectedIds.has(id));

                    return (
                      <React.Fragment key={agentId}>
                        <tr className="agent-payment-group-row">
                          {activeTab === "UNPAID" && (
                            <td>
                              {groupPendingIds.length > 0 && (
                                <input
                                  type="checkbox"
                                  checked={groupAllSelected}
                                  onChange={() => toggleSelectAllInGroup(group.orders)}
                                  title="Select all pending orders for this agent"
                                />
                              )}
                            </td>
                          )}
                          <td colSpan={activeTab === "UNPAID" ? 7 : 7} className="agent-payment-group-title">
                            {group.agentName}
                          </td>
                        </tr>
                        {group.orders.map((order) => (
                          <tr key={order.id} className="agent-payment-order-row">
                            {activeTab === "UNPAID" && (
                              <td>
                                <input
                                  type="checkbox"
                                  checked={selectedIds.has(order.id)}
                                  onChange={() => toggleOrder(order)}
                                />
                              </td>
                            )}
                            <td>{order.order_number}</td>
                            <td>{order.customer_name}</td>
                            <td>{formatDate(order.created_at)}</td>
                            <td className="col-amount">{formatMoney(order.grand_total, order.currency || currency)}</td>
                            <td>
                              <span
                                className={`agent-payment-badge ${
                                  ORDER_STATUS_CLASS[String(order.status).toUpperCase()] ||
                                  "badge-order-default"
                                }`}
                              >
                                {order.status}
                              </span>
                            </td>
                            <td>{order.payment_method}</td>
                            <td>
                              <button
                                className="agent-payment-view-btn"
                                onClick={() => setViewOrder(order)}
                                title="View order details"
                                aria-label="View order details"
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Monthly statistics */}
          <section className="agent-payment-monthly-stats">
            <div className="agent-payment-stat-block">
              <span className="agent-payment-summary-label">Current Month Collection</span>
              <span className="agent-payment-summary-value">
                {formatMoney(monthlyStats.currentMonthCollection, currency)}
              </span>
            </div>
            <div className="agent-payment-stat-block">
              <span className="agent-payment-summary-label">Previous Month Collection</span>
              <span className="agent-payment-summary-value">
                {formatMoney(monthlyStats.previousMonthCollection, currency)}
              </span>
            </div>
            <div className="agent-payment-stat-block">
              <span className="agent-payment-summary-label">Outstanding Amount</span>
              <span className="agent-payment-summary-value">
                {formatMoney(monthlyStats.outstandingAmount, currency)}
              </span>
            </div>
            <div className="agent-payment-stat-block">
              <span className="agent-payment-summary-label">Average Monthly Collection</span>
              <span className="agent-payment-summary-value">
                {formatMoney(monthlyStats.averageCollection, currency)}
              </span>
            </div>
          </section>
        </div>

        {/* ── Agent summary side panel (only takes space when an agent is filtered) ── */}
        {selectedAgent && agentPanelStats && (
          <aside className="agent-payment-side-panel">
            <h3>Agent</h3>
            <p className="agent-payment-side-agent-name">
              {selectedAgent.first_name} {selectedAgent.last_name}
            </p>
            <div className="agent-payment-side-row">
              <span>Pending Orders</span>
              <strong>{agentPanelStats.pendingCount}</strong>
            </div>
            <div className="agent-payment-side-row">
              <span>Pending Amount</span>
              <strong>{formatMoney(agentPanelStats.pendingAmount, currency)}</strong>
            </div>
            <div className="agent-payment-side-row">
              <span>Paid Orders</span>
              <strong>{agentPanelStats.paidCount}</strong>
            </div>
            <div className="agent-payment-side-row">
              <span>Collected Amount</span>
              <strong>{formatMoney(agentPanelStats.paidAmount, currency)}</strong>
            </div>
          </aside>
        )}
      </div>

      {/* ── Initiate payment modal ── */}
      {payModalOpen && (
        <div className="agent-payment-modal-overlay" onClick={() => !paySubmitting && closePayModal()}>
          <div className="agent-payment-modal agent-payment-modal--wide" onClick={(e) => e.stopPropagation()}>
            {payStep === "select" ? (
              <>
                <h2>Initiate Payment</h2>

                <div className="agent-payment-modal-row">
                  <span>Agent</span>
                  <strong>
                    {selectedOrders.length > 0
                      ? Array.from(new Set(selectedOrders.map((o) => o.agent_name))).join(", ")
                      : "—"}
                  </strong>
                </div>

                <div className="agent-payment-pay-breakdown">
                  <span className="agent-payment-summary-label">Orders in this payment</span>
                  <ul className="agent-payment-pay-breakdown-list">
                    {selectedOrders.map((o) => (
                      <li key={o.id}>
                        <span>{o.order_number}</span>
                        <span>{formatMoney(o.grand_total, o.currency || currency)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="agent-payment-pay-breakdown-total">
                    <span>Total</span>
                    <strong>{formatMoney(selectedTotal, currency)}</strong>
                  </div>
                </div>

                <div className="agent-payment-method-picker">
                  <span className="agent-payment-summary-label">Payment Type</span>
                  <div className="agent-payment-method-tiles">
                    <button
                      type="button"
                      className={`agent-payment-method-tile ${payMethod === "COD" ? "agent-payment-method-tile--active" : ""}`}
                      onClick={() => setPayMethod("COD")}
                    >
                      <span className="agent-payment-method-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="6" width="20" height="12" rx="2" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </span>
                      <span className="agent-payment-method-tile-text">
                        <strong>Cash</strong>
                        <small>Mark as settled now</small>
                      </span>
                    </button>
                    <button
                      type="button"
                      className={`agent-payment-method-tile ${payMethod === "ONLINE" ? "agent-payment-method-tile--active" : ""}`}
                      onClick={() => setPayMethod("ONLINE")}
                    >
                      <span className="agent-payment-method-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="4" width="20" height="16" rx="2" />
                          <path d="M2 9h20" />
                        </svg>
                      </span>
                      <span className="agent-payment-method-tile-text">
                        <strong>Online</strong>
                        <small>Generate a scannable link</small>
                      </span>
                    </button>
                  </div>
                </div>

                {payError && <div className="agent-payment-modal-error">{payError}</div>}

                <div className="agent-payment-modal-actions">
                  <button className="agent-payment-link-btn" onClick={closePayModal} disabled={paySubmitting}>
                    Cancel
                  </button>
                  <button
                    className="agent-payment-pay-btn"
                    onClick={handleInitiatePayment}
                    disabled={paySubmitting || selectedOrders.length === 0}
                  >
                    {paySubmitting
                      ? "Processing..."
                      : payMethod === "COD"
                      ? "Confirm Cash Payment"
                      : "Generate Payment Link"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2>Scan to Pay</h2>

                <div className="agent-payment-modal-row">
                  <span>Orders</span>
                  <strong>{paymentLinkOrders.map((o) => o.order_number).join(", ")}</strong>
                </div>
                <div className="agent-payment-modal-row">
                  <span>Amount</span>
                  <strong>
                    {formatMoney(
                      paymentLinkOrders.reduce((sum, o) => sum + Number(o.grand_total || 0), 0),
                      paymentLinkOrders[0]?.currency || currency
                    )}
                  </strong>
                </div>

                <div className="agent-payment-barcode-wrap">
                  {paymentLinkUrl ? (
                    <div className="agent-payment-barcode-img">
                      <QRCodeSVG value={paymentLinkUrl} size={200} />
                    </div>
                  ) : (
                    <div className="agent-payment-barcode-loading">Could not render the code.</div>
                  )}
                  <p className="agent-payment-barcode-caption">
                    Scan this code to pay {paymentLinkOrders.length > 1 ? `for all ${paymentLinkOrders.length} orders` : "for this order"} in one payment.
                  </p>
                </div>

                <div className="agent-payment-modal-actions">
                  <button className="agent-payment-pay-btn" onClick={handleDonePayModal}>
                    Done
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── View order modal ── */}
      {viewOrder && (
        <div className="agent-payment-modal-overlay" onClick={() => setViewOrder(null)}>
          <div className="agent-payment-modal agent-payment-modal--wide" onClick={(e) => e.stopPropagation()}>
            <h2>Order {viewOrder.order_number}</h2>
            <div className="agent-payment-view-grid">
              <div>
                <span className="agent-payment-summary-label">Agent</span>
                <p>{viewOrder.agent_name}</p>
              </div>
              <div>
                <span className="agent-payment-summary-label">Customer</span>
                <p>{viewOrder.customer_name}</p>
              </div>
              <div>
                <span className="agent-payment-summary-label">Phone</span>
                <p>{viewOrder.customer_phone}</p>
              </div>
              <div>
                <span className="agent-payment-summary-label">Address</span>
                <p>{viewOrder.address || "—"}</p>
              </div>
              <div>
                <span className="agent-payment-summary-label">Created</span>
                <p>{formatDate(viewOrder.created_at)}</p>
              </div>
              <div>
                <span className="agent-payment-summary-label">Delivery Date</span>
                <p>{formatDate(viewOrder.delivery_date)}</p>
              </div>
              <div>
                <span className="agent-payment-summary-label">Payment Status</span>
                <p>{viewOrder.payment_status}</p>
              </div>
              <div>
                <span className="agent-payment-summary-label">Notes</span>
                <p>{viewOrder.notes || "—"}</p>
              </div>
            </div>

            {viewOrder.items && viewOrder.items.length > 0 && (
              <div className="agent-payment-view-items">
                <span className="agent-payment-summary-label">Items</span>
                <table className="agent-payment-items-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewOrder.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.product_name || "—"}</td>
                        <td>{item.quantity}</td>
                        <td>{formatMoney(item.price, viewOrder.currency)}</td>
                        <td>{formatMoney(item.line_total, viewOrder.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="agent-payment-view-totals">
              <div>
                <span>Subtotal</span>
                <strong>{formatMoney(viewOrder.subtotal, viewOrder.currency)}</strong>
              </div>
              <div>
                <span>Discount</span>
                <strong>-{formatMoney(viewOrder.discount, viewOrder.currency)}</strong>
              </div>
              <div>
                <span>Delivery Charge</span>
                <strong>{formatMoney(viewOrder.delivery_charge, viewOrder.currency)}</strong>
              </div>
              <div className="agent-payment-view-grand-total">
                <span>Grand Total</span>
                <strong>{formatMoney(viewOrder.grand_total, viewOrder.currency)}</strong>
              </div>
            </div>

            <div className="agent-payment-modal-actions">
              <button className="agent-payment-link-btn" onClick={() => setViewOrder(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}