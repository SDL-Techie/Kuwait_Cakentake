// import React, { useEffect, useMemo, useState } from "react";
// import { AnimatePresence, motion } from "framer-motion";
// import "./Kitchenordercalender.css";

// /* ============================================================
//    Types
// ============================================================ */
// type OrderStatus = "pending" | "prep" | "ready" | "delivered" | "cancel";

// interface Order {
//   id: number;
//   name: string;
//   time: string;
//   customer: string;
//   amount: string;
//   status: OrderStatus;
// }

// type OrdersByDate = Record<string, Order[]>;

// interface StatusMeta {
//   label: string;
//   short: string;
// }

// /* ============================================================
//    Constants
// ============================================================ */
// const STATUS_META: Record<OrderStatus, StatusMeta> = {
//   pending: { label: "Pending", short: "Pending" },
//   prep: { label: "Start Preparation", short: "Preparing" },
//   ready: { label: "Mark Ready", short: "Ready" },
//   delivered: { label: "Delivered", short: "Delivered" },
//   cancel: { label: "Cancel", short: "Cancelled" },
// };

// const STATUS_ORDER: OrderStatus[] = ["pending", "prep", "ready", "delivered", "cancel"];

// const STORAGE_KEY = "kitchenOrderCalendar.orders.v1";

// const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
// const MONTH_NAMES = [
//   "January", "February", "March", "April", "May", "June",
//   "July", "August", "September", "October", "November", "December",
// ];

// /* ============================================================
//    Helpers
// ============================================================ */
// const pad = (n: number) => n.toString().padStart(2, "0");
// const dateKey = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

// function seedOrders(): OrdersByDate {
//   const data: OrdersByDate = {};
//   let id = 1;
//   const push = (y: number, m: number, d: number, order: Omit<Order, "id">) => {
//     const k = dateKey(y, m, d);
//     if (!data[k]) data[k] = [];
//     data[k].push({ id: id++, ...order });
//   };

//   push(2026, 7, 12, { name: "Order #1042", time: "09:30 AM", status: "pending", customer: "Ravi Kumar", amount: "480" });
//   push(2026, 7, 12, { name: "Order #1043", time: "11:15 AM", status: "prep", customer: "Anitha S", amount: "1,250" });
//   push(2026, 7, 12, { name: "Order #1044", time: "01:00 PM", status: "ready", customer: "Deepak R", amount: "620" });
//   push(2026, 7, 12, { name: "Order #1045", time: "03:45 PM", status: "delivered", customer: "Priya M", amount: "340" });
//   push(2026, 7, 12, { name: "Order #1046", time: "05:20 PM", status: "cancel", customer: "Suresh V", amount: "900" });

//   push(2026, 7, 3, { name: "Order #1030", time: "10:00 AM", status: "delivered", customer: "Meena K", amount: "560" });
//   push(2026, 7, 9, { name: "Order #1031", time: "08:00 AM", status: "pending", customer: "Karthik N", amount: "720" });
//   push(2026, 7, 9, { name: "Order #1032", time: "11:00 AM", status: "ready", customer: "Divya T", amount: "410" });
//   push(2026, 7, 15, { name: "Order #1033", time: "04:00 PM", status: "prep", customer: "Arun P", amount: "980" });
//   push(2026, 7, 22, { name: "Order #1034", time: "09:45 AM", status: "ready", customer: "Lakshmi B", amount: "275" });
//   push(2026, 7, 25, { name: "Order #1035", time: "03:30 PM", status: "pending", customer: "Vignesh S", amount: "640" });
//   push(2026, 7, 28, { name: "Order #1036", time: "08:30 AM", status: "cancel", customer: "Nithya R", amount: "500" });

//   push(2026, 6, 20, { name: "Order #1020", time: "09:00 AM", status: "delivered", customer: "Ramesh G", amount: "310" });
//   push(2026, 8, 2, { name: "Order #1050", time: "10:30 AM", status: "pending", customer: "Sowmya J", amount: "455" });

//   return data;
// }

// function loadOrders(): OrdersByDate {
//   try {
//     const raw = localStorage.getItem(STORAGE_KEY);
//     if (raw) return JSON.parse(raw) as OrdersByDate;
//   } catch (e) {
//     console.warn("Could not read kitchen orders from storage", e);
//   }
//   const seeded = seedOrders();
//   try {
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
//   } catch (e) {
//     console.warn("Could not seed kitchen orders", e);
//   }
//   return seeded;
// }

// function nextOrderId(orders: OrdersByDate): number {
//   let max = 1000;
//   Object.values(orders).forEach((list) =>
//     list.forEach((o) => {
//       if (o.id > max) max = o.id;
//     })
//   );
//   return max + 1;
// }

// /* ============================================================
//    Component
// ============================================================ */
// export default function KitchenOrderCalendar() {
//   const today = useMemo(() => new Date(), []);

//   const [orders, setOrders] = useState<OrdersByDate>(() => loadOrders());
//   const [viewYear, setViewYear] = useState(today.getFullYear());
//   const [viewMonth, setViewMonth] = useState(today.getMonth());
//   const [monthDirection, setMonthDirection] = useState(1);

//   const [selectedKey, setSelectedKey] = useState<string | null>(null);
//   const [activeFilter, setActiveFilter] = useState<"all" | OrderStatus>("all");
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [formState, setFormState] = useState({
//     name: "",
//     time: "",
//     customer: "",
//     amount: "",
//     status: "pending" as OrderStatus,
//   });

//   useEffect(() => {
//     try {
//       localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
//     } catch (e) {
//       console.warn("Could not save kitchen orders", e);
//     }
//   }, [orders]);

//   /* ---------------- Month grid ---------------- */
//   const cells = useMemo(() => {
//     const firstOfMonth = new Date(viewYear, viewMonth, 1);
//     const startOffset = (firstOfMonth.getDay() + 6) % 7; // Monday-first
//     const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
//     const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();
//     const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

//     const out: {
//       key: string;
//       day: number;
//       month: number;
//       year: number;
//       outside: boolean;
//       isToday: boolean;
//     }[] = [];

//     for (let i = 0; i < totalCells; i++) {
//       let y = viewYear, m = viewMonth, day: number, outside = false;

//       if (i < startOffset) {
//         day = daysInPrevMonth - startOffset + i + 1;
//         m = viewMonth - 1;
//         if (m < 0) { m = 11; y -= 1; }
//         outside = true;
//       } else if (i >= startOffset + daysInMonth) {
//         day = i - startOffset - daysInMonth + 1;
//         m = viewMonth + 1;
//         if (m > 11) { m = 0; y += 1; }
//         outside = true;
//       } else {
//         day = i - startOffset + 1;
//       }

//       const isToday =
//         y === today.getFullYear() && m === today.getMonth() && day === today.getDate();

//       out.push({ key: dateKey(y, m, day), day, month: m, year: y, outside, isToday });
//     }
//     return out;
//   }, [viewYear, viewMonth, today]);

//   /* ---------------- Month stats (signature strip) ---------------- */
//   const monthStats = useMemo(() => {
//     const counts: Record<OrderStatus, number> = {
//       pending: 0, prep: 0, ready: 0, delivered: 0, cancel: 0,
//     };
//     let total = 0;
//     Object.entries(orders).forEach(([k, list]) => {
//       const [y, m] = k.split("-").map(Number);
//       if (y === viewYear && m - 1 === viewMonth) {
//         list.forEach((o) => { counts[o.status]++; total++; });
//       }
//     });
//     return { counts, total };
//   }, [orders, viewYear, viewMonth]);

//   /* ---------------- Navigation ---------------- */
//   function goToMonth(delta: number) {
//     setMonthDirection(delta);
//     let m = viewMonth + delta;
//     let y = viewYear;
//     if (m < 0) { m = 11; y -= 1; }
//     if (m > 11) { m = 0; y += 1; }
//     setViewMonth(m);
//     setViewYear(y);
//   }
//   function goToday() {
//     setMonthDirection(viewYear === today.getFullYear() && viewMonth < today.getMonth() ? 1 : -1);
//     setViewYear(today.getFullYear());
//     setViewMonth(today.getMonth());
//   }

//   /* ---------------- Modal ---------------- */
//   function openDay(key: string) {
//     setSelectedKey(key);
//     setActiveFilter("all");
//     setShowAddForm(false);
//   }
//   function closeModal() {
//     setSelectedKey(null);
//     setShowAddForm(false);
//   }

//   const selectedOrders = selectedKey ? orders[selectedKey] || [] : [];
//   const filteredOrders =
//     activeFilter === "all"
//       ? selectedOrders
//       : selectedOrders.filter((o) => o.status === activeFilter);

//   const filterCounts = useMemo(() => {
//     const c: Record<string, number> = { all: selectedOrders.length };
//     STATUS_ORDER.forEach((s) => (c[s] = selectedOrders.filter((o) => o.status === s).length));
//     return c;
//   }, [selectedOrders]);

//   function addOrder(e: React.FormEvent) {
//     e.preventDefault();
//     if (!selectedKey || !formState.name.trim()) return;
//     const newOrder: Order = {
//       id: nextOrderId(orders),
//       name: formState.name.trim(),
//       time: formState.time.trim() || "—",
//       customer: formState.customer.trim() || "Walk-in",
//       amount: formState.amount.trim() || "0",
//       status: formState.status,
//     };
//     setOrders((prev) => {
//       const list = prev[selectedKey] ? [...prev[selectedKey]] : [];
//       list.push(newOrder);
//       return { ...prev, [selectedKey]: list };
//     });
//     setFormState({ name: "", time: "", customer: "", amount: "", status: "pending" });
//     setShowAddForm(false);
//     setActiveFilter("all");
//   }

//   function selectedDateLabel() {
//     if (!selectedKey) return "";
//     const [y, m, d] = selectedKey.split("-").map(Number);
//     return new Date(y, m - 1, d).toLocaleDateString("en-US", {
//       weekday: "long", month: "long", day: "numeric", year: "numeric",
//     });
//   }

//   /* ============================================================
//      Render
//   ============================================================ */
//   return (
//     <div className="koc-root">
//       <div className="koc-glow koc-glow-a" />
//       <div className="koc-glow koc-glow-b" />

//       <div className="koc-shell">
//         {/* ---------- Header ---------- */}
//         <header className="koc-header">
//           <div className="koc-header-text">
//             <span className="koc-eyebrow">Kitchen Ops</span>
//             <h1 className="koc-title">Order Calendar</h1>
//             <p className="koc-subtitle">Track every ticket, from fired to plated, day by day.</p>
//           </div>

//           <div className="koc-stat-strip">
//             <div className="koc-stat koc-stat-total">
//               <span className="koc-stat-num">{monthStats.total}</span>
//               <span className="koc-stat-label">this month</span>
//             </div>
//             {STATUS_ORDER.map((s) => (
//               <div key={s} className={`koc-stat koc-stat-${s}`}>
//                 <span className="koc-stat-dot" />
//                 <span className="koc-stat-num">{monthStats.counts[s]}</span>
//                 <span className="koc-stat-label">{STATUS_META[s].short}</span>
//               </div>
//             ))}
//           </div>
//         </header>

//         {/* ---------- Month navigator ---------- */}
//         <div className="koc-nav">
//           <div className="koc-nav-controls">
//             <button className="koc-icon-btn" onClick={() => goToMonth(-1)} aria-label="Previous month">
//               <ChevronIcon direction="left" />
//             </button>

//             <div className="koc-month-window">
//               <AnimatePresence mode="wait" custom={monthDirection}>
//                 <motion.span
//                   key={`${viewYear}-${viewMonth}`}
//                   className="koc-month-label"
//                   custom={monthDirection}
//                   initial={{ y: monthDirection > 0 ? 16 : -16, opacity: 0 }}
//                   animate={{ y: 0, opacity: 1 }}
//                   exit={{ y: monthDirection > 0 ? -16 : 16, opacity: 0 }}
//                   transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
//                 >
//                   {MONTH_NAMES[viewMonth]} {viewYear}
//                 </motion.span>
//               </AnimatePresence>
//             </div>

//             <button className="koc-icon-btn" onClick={() => goToMonth(1)} aria-label="Next month">
//               <ChevronIcon direction="right" />
//             </button>

//             <button className="koc-today-btn" onClick={goToday}>Today</button>
//           </div>
//         </div>

//         {/* ---------- Calendar ---------- */}
//         <div className="koc-calendar">
//           <div className="koc-weekdays">
//             {WEEKDAY_LABELS.map((w) => (
//               <div key={w}>{w}</div>
//             ))}
//           </div>

//           <AnimatePresence mode="wait" custom={monthDirection}>
//             <motion.div
//               key={`${viewYear}-${viewMonth}`}
//               className="koc-grid"
//               custom={monthDirection}
//               initial={{ opacity: 0, x: monthDirection > 0 ? 24 : -24 }}
//               animate={{ opacity: 1, x: 0 }}
//               exit={{ opacity: 0, x: monthDirection > 0 ? -24 : 24 }}
//               transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
//             >
//               {cells.map((cell) => {
//                 const dayOrders = orders[cell.key] || [];
//                 const visible = dayOrders.slice(0, 3);
//                 const overflow = dayOrders.length - visible.length;

//                 return (
//                   <motion.button
//                     key={cell.key}
//                     type="button"
//                     className={[
//                       "koc-cell",
//                       cell.outside ? "is-outside" : "",
//                       cell.isToday ? "is-today" : "",
//                     ].join(" ").trim()}
//                     onClick={() => openDay(cell.key)}
//                     whileHover={{ y: -3 }}
//                     whileTap={{ scale: 0.97 }}
//                   >
//                     <div className="koc-daynum-row">
//                       <span className="koc-daynum">{cell.day}</span>
//                       {cell.isToday && <span className="koc-today-pulse" />}
//                     </div>

//                     <div className="koc-chip-stack">
//                       {visible.map((o) => (
//                         <span key={o.id} className={`koc-chip koc-chip-${o.status}`}>
//                           <span className="koc-chip-name">{o.name}</span>
//                           <span className="koc-chip-time">{o.time}</span>
//                         </span>
//                       ))}
//                       {overflow > 0 && <span className="koc-chip-more">+{overflow} more</span>}
//                     </div>
//                   </motion.button>
//                 );
//               })}
//             </motion.div>
//           </AnimatePresence>
//         </div>
//       </div>

//       {/* ---------- Modal ---------- */}
//       <AnimatePresence>
//         {selectedKey && (
//           <motion.div
//             className="koc-overlay"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.18 }}
//             onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
//           >
//             <motion.div
//               className="koc-modal"
//               initial={{ opacity: 0, y: 28, scale: 0.96 }}
//               animate={{ opacity: 1, y: 0, scale: 1 }}
//               exit={{ opacity: 0, y: 18, scale: 0.97 }}
//               transition={{ type: "spring", stiffness: 340, damping: 30 }}
//             >
//               <div className="koc-modal-head">
//                 <div className="koc-modal-head-top">
//                   <div>
//                     <div className="koc-modal-title">{selectedDateLabel()}</div>
//                     <div className="koc-modal-sub">
//                       {selectedOrders.length} order{selectedOrders.length === 1 ? "" : "s"} scheduled
//                     </div>
//                   </div>
//                   <button className="koc-close-btn" onClick={closeModal} aria-label="Close">
//                     <CloseIcon />
//                   </button>
//                 </div>

//                 <div className="koc-filters">
//                   <FilterChip
//                     active={activeFilter === "all"}
//                     label="All"
//                     count={filterCounts.all}
//                     onClick={() => setActiveFilter("all")}
//                   />
//                   {STATUS_ORDER.map((s) => (
//                     <FilterChip
//                       key={s}
//                       active={activeFilter === s}
//                       label={STATUS_META[s].label}
//                       count={filterCounts[s]}
//                       status={s}
//                       onClick={() => setActiveFilter(s)}
//                     />
//                   ))}
//                 </div>
//               </div>

//               <div className="koc-modal-body">
//                 <AnimatePresence mode="wait">
//                   {showAddForm ? (
//                     <motion.form
//                       key="add-form"
//                       className="koc-add-form"
//                       initial={{ opacity: 0, height: 0 }}
//                       animate={{ opacity: 1, height: "auto" }}
//                       exit={{ opacity: 0, height: 0 }}
//                       transition={{ duration: 0.2 }}
//                       onSubmit={addOrder}
//                     >
//                       <div className="koc-form-row">
//                         <input
//                           placeholder="Order name (e.g. Order #1091)"
//                           value={formState.name}
//                           onChange={(e) => setFormState((f) => ({ ...f, name: e.target.value }))}
//                           required
//                         />
//                         <input
//                           placeholder="Time (e.g. 06:15 PM)"
//                           value={formState.time}
//                           onChange={(e) => setFormState((f) => ({ ...f, time: e.target.value }))}
//                         />
//                       </div>
//                       <div className="koc-form-row">
//                         <input
//                           placeholder="Customer"
//                           value={formState.customer}
//                           onChange={(e) => setFormState((f) => ({ ...f, customer: e.target.value }))}
//                         />
//                         <input
//                           placeholder="Amount"
//                           value={formState.amount}
//                           onChange={(e) => setFormState((f) => ({ ...f, amount: e.target.value }))}
//                         />
//                       </div>
//                       <div className="koc-form-row">
//                         <select
//                           value={formState.status}
//                           onChange={(e) =>
//                             setFormState((f) => ({ ...f, status: e.target.value as OrderStatus }))
//                           }
//                         >
//                           {STATUS_ORDER.map((s) => (
//                             <option key={s} value={s}>{STATUS_META[s].label}</option>
//                           ))}
//                         </select>
//                         <div className="koc-form-actions">
//                           <button type="button" className="koc-btn-ghost" onClick={() => setShowAddForm(false)}>
//                             Cancel
//                           </button>
//                           <button type="submit" className="koc-btn-solid">Add order</button>
//                         </div>
//                       </div>
//                     </motion.form>
//                   ) : (
//                     <motion.button
//                       key="add-toggle"
//                       type="button"
//                       className="koc-add-toggle"
//                       onClick={() => setShowAddForm(true)}
//                       initial={{ opacity: 0 }}
//                       animate={{ opacity: 1 }}
//                       exit={{ opacity: 0 }}
//                     >
//                       <PlusIcon /> Add order to this date
//                     </motion.button>
//                   )}
//                 </AnimatePresence>

//                 <div className="koc-order-list">
//                   <AnimatePresence mode="popLayout">
//                     {filteredOrders.length === 0 ? (
//                       <motion.div
//                         key="empty"
//                         className="koc-empty"
//                         initial={{ opacity: 0, y: 6 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         exit={{ opacity: 0 }}
//                       >
//                         <span className="koc-empty-icon">🍽️</span>
//                         No {activeFilter === "all" ? "" : STATUS_META[activeFilter as OrderStatus].label.toLowerCase() + " "}
//                         orders for this date.
//                       </motion.div>
//                     ) : (
//                       filteredOrders.map((o, i) => (
//                         <motion.div
//                           key={o.id}
//                           layout
//                           className={`koc-order-card koc-order-${o.status}`}
//                           initial={{ opacity: 0, x: -14 }}
//                           animate={{ opacity: 1, x: 0 }}
//                           exit={{ opacity: 0, x: 14 }}
//                           transition={{ duration: 0.18, delay: i * 0.03 }}
//                           whileHover={{ x: 3 }}
//                         >
//                           <span className={`koc-order-stripe koc-stripe-${o.status}`} />
//                           <div className="koc-order-body">
//                             <div className="koc-order-row">
//                               <span className="koc-order-name">{o.name}</span>
//                               <span className={`koc-status-pill koc-pill-${o.status}`}>
//                                 {STATUS_META[o.status].label}
//                               </span>
//                             </div>
//                             <div className="koc-order-meta">
//                               <span>👤 {o.customer}</span>
//                               <span>🕒 {o.time}</span>
//                               <span>₹ {o.amount}</span>
//                             </div>
//                           </div>
//                         </motion.div>
//                       ))
//                     )}
//                   </AnimatePresence>
//                 </div>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// /* ============================================================
//    Small subcomponents
// ============================================================ */
// function FilterChip({
//   active, label, count, status, onClick,
// }: {
//   active: boolean;
//   label: string;
//   count: number;
//   status?: OrderStatus;
//   onClick: () => void;
// }) {
//   return (
//     <button
//       type="button"
//       className={`koc-filter-chip${status ? ` koc-filter-${status}` : " koc-filter-all"}`}
//       onClick={onClick}
//     >
//       {active && (
//         <motion.span
//           layoutId="koc-filter-pill"
//           className="koc-filter-pill-bg"
//           transition={{ type: "spring", stiffness: 500, damping: 36 }}
//         />
//       )}
//       {status && <span className="koc-filter-dot" />}
//       <span className="koc-filter-label">{label}</span>
//       <span className="koc-filter-count">{count}</span>
//     </button>
//   );
// }

// function ChevronIcon({ direction }: { direction: "left" | "right" }) {
//   return (
//     <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//       <path
//         d={direction === "left" ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6"}
//         stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
//       />
//     </svg>
//   );
// }
// function CloseIcon() {
//   return (
//     <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
//       <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
//     </svg>
//   );
// }
// function PlusIcon() {
//   return (
//     <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
//       <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
//     </svg>
//   );
// }




import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./Kitchenordercalender.css";
import {
  getKitchenPending,
  getKitchenProcessing,
  getMyCompletedKitchenOrders,
  getKitchenOrderDetails,
  KitchenOrder as KitchenOrderRecord,
} from "../../services/kitchenService";

/* ============================================================
   Types
============================================================ */
type CalendarStatusKey = "grey" | "yellow" | "green" | "red";
type FulfilmentType = "PICKUP" | "DELIVERY";

interface ExpectedInfo {
  date: Date;
  dateLabel: string;        // "Pickup" | "Expected Delivery"
  timeLabel: string | null; // time slot text, if any
}

interface CalendarEntry {
  order: any;
  info: ExpectedInfo;
  type: FulfilmentType;
  statusKey: CalendarStatusKey;
}

/* ============================================================
   Constants
============================================================ */
const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// pending/assigned → grey · preparing → yellow · ready/completed/delivered → green · cancelled/rejected → red
const getStatusColorKey = (status?: string): CalendarStatusKey => {
  const s = (status || "").toUpperCase();
  if (["CANCELLED", "CANCELED", "REJECTED"].includes(s)) return "red";
  if (["PREPARING", "PROCESSING"].includes(s)) return "yellow";
  if (["DELIVERED", "COMPLETED", "READY", "READY_FOR_PICKUP", "READY_FOR_DISPATCH"].includes(s)) return "green";
  return "grey";
};

const CALENDAR_STATUS_LEGEND: { key: CalendarStatusKey; label: string }[] = [
  { key: "grey", label: "Pending / In queue" },
  { key: "yellow", label: "Preparing" },
  { key: "green", label: "Ready / Delivered" },
  { key: "red", label: "Cancelled" },
];

const STATUS_FILTERS: { key: "all" | CalendarStatusKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "grey", label: "Pending" },
  { key: "yellow", label: "Preparing" },
  { key: "green", label: "Ready / Delivered" },
  { key: "red", label: "Cancelled" },
];

const TYPE_FILTERS: { key: "all" | FulfilmentType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "DELIVERY", label: "Delivery" },
  { key: "PICKUP", label: "Pickup" },
];

/* ============================================================
   Helpers
============================================================ */
const pad = (n: number) => n.toString().padStart(2, "0");

const dateKey = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const fmtDate = (d?: string | Date | null) => {
  if (!d) return null;
  const dt = typeof d === "string" ? new Date(d) : d;
  if (isNaN(dt.getTime())) return null;
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const currencySymbol = (cur?: string) => (cur === "INR" || !cur ? "₹" : cur);
const fmtMoney = (n: number | undefined, cur?: string) =>
  `${currencySymbol(cur)}${Number(n || 0).toFixed(0)}`;

const getDisplayName = (order: any) => {
  if (order?.customer?.name) return order.customer.name;
  const nameParts = [order?.customer?.first_name, order?.customer?.last_name].filter(Boolean);
  return nameParts.length ? nameParts.join(" ") : order?.customer_name || "—";
};
const getDisplayPhone = (order: any) => order?.customer?.phone_no || order?.customer_phone || "—";

const getItemProductSource = (item: any) => {
  const isAgentExclusive = item?.custom_json?.product_type === "AGENT";
  return isAgentExclusive ? (item?.agent_product ?? {}) : (item?.product ?? {});
};
const getItemDisplayName = (item: any) => {
  const source = getItemProductSource(item);
  return source?.name || item?.product_name || item?.name || "Assorted Item";
};

/** Whether the order is a pickup or a delivery order. */
const getFulfilmentType = (order: any): FulfilmentType =>
  (order?.delivery_method || "").toUpperCase() === "PICKUP" ? "PICKUP" : "DELIVERY";

/**
 * Resolve the order's *expected* schedule for calendar placement:
 *   · PICKUP orders  → pickup_date / pickup_time_slot (falls back to delivery_date/slot
 *                       only if no pickup-specific date was set on the order)
 *   · DELIVERY orders → delivery_date / delivery_time_slot
 *
 * Orders placed date/time (created_at) is intentionally NEVER used here —
 * only the customer's expected pickup/delivery schedule. If an order has no
 * expected date at all, this returns null and the order is treated as
 * "unscheduled" (kept out of the calendar grid, but still counted).
 */
const getExpectedCalendarInfo = (order: any): ExpectedInfo | null => {
  const type = getFulfilmentType(order);

  if (type === "PICKUP") {
    const d = order?.pickup_date || order?.delivery_date;
    const slot = order?.pickup_time_slot || order?.delivery_time_slot;
    if (!d) return null;
    const date = new Date(d);
    if (isNaN(date.getTime())) return null;
    return { date, dateLabel: "Pickup", timeLabel: slot || null };
  }

  const d = order?.delivery_date;
  const slot = order?.delivery_time_slot;
  if (!d) return null;
  const date = new Date(d);
  if (isNaN(date.getTime())) return null;
  return { date, dateLabel: "Expected Delivery", timeLabel: slot || null };
};

const buildMonthGrid = (monthDate: Date): (Date | null)[] => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/* ============================================================
   Small icons
============================================================ */
function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d={direction === "left" ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6"}
        stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

/* ============================================================
   Component
============================================================ */
export default function KitchenOrderCalendar() {
  const today = useMemo(() => new Date(), []);

  const [pendingOrders, setPendingOrders] = useState<KitchenOrderRecord[]>([]);
  const [processingOrders, setProcessingOrders] = useState<KitchenOrderRecord[]>([]);
  const [completedOrders, setCompletedOrders] = useState<KitchenOrderRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [monthDirection, setMonthDirection] = useState(1);

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | CalendarStatusKey>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | FulfilmentType>("all");

  // Order detail modal (fetched fresh from the backend on demand)
  const [detailOrder, setDetailOrder] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [detailOpen, setDetailOpen] = useState<boolean>(false);

  /* ---------------- Fetch real orders from the backend ---------------- */
  const fetchAllOrders = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const [pending, processing, myCompleted] = await Promise.all([
        getKitchenPending(),
        getKitchenProcessing(),
        getMyCompletedKitchenOrders(),
      ]);
      setPendingOrders(pending);
      setProcessingOrders(processing);
      setCompletedOrders(myCompleted);
    } catch (err) {
      console.error("Failed to load kitchen orders for calendar", err);
      setLoadError("Couldn't load orders from the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  const allOrders = useMemo(
    () => [...pendingOrders, ...processingOrders, ...completedOrders],
    [pendingOrders, processingOrders, completedOrders]
  );

  /* ---------------- Group orders by their expected date ---------------- */
  const { calendarOrdersByDay, unscheduledCount } = useMemo(() => {
    const map: Record<string, CalendarEntry[]> = {};
    let unscheduled = 0;

    allOrders.forEach((order: any) => {
      const info = getExpectedCalendarInfo(order);
      if (!info) {
        unscheduled++;
        return;
      }
      const entry: CalendarEntry = {
        order,
        info,
        type: getFulfilmentType(order),
        statusKey: getStatusColorKey(order.status),
      };
      const key = dateKey(info.date);
      if (!map[key]) map[key] = [];
      map[key].push(entry);
    });

    // sort each day's entries by time slot text (best-effort) then order id
    Object.values(map).forEach((list) =>
      list.sort((a, b) => (a.info.timeLabel || "").localeCompare(b.info.timeLabel || ""))
    );

    return { calendarOrdersByDay: map, unscheduledCount: unscheduled };
  }, [allOrders]);

  /* ---------------- Month grid + per-month stats ---------------- */
  const cells = useMemo(() => buildMonthGrid(new Date(viewYear, viewMonth, 1)), [viewYear, viewMonth]);

  const monthStats = useMemo(() => {
    const counts: Record<CalendarStatusKey, number> = { grey: 0, yellow: 0, green: 0, red: 0 };
    const typeCounts: Record<FulfilmentType, number> = { PICKUP: 0, DELIVERY: 0 };
    let total = 0;

    Object.entries(calendarOrdersByDay).forEach(([key, list]) => {
      const [y, m] = key.split("-").map(Number);
      if (y === viewYear && m - 1 === viewMonth) {
        list.forEach((e) => {
          counts[e.statusKey]++;
          typeCounts[e.type]++;
          total++;
        });
      }
    });

    return { counts, typeCounts, total };
  }, [calendarOrdersByDay, viewYear, viewMonth]);

  /* ---------------- Navigation ---------------- */
  function goToMonth(delta: number) {
    setMonthDirection(delta);
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setViewMonth(m);
    setViewYear(y);
  }
  function goToday() {
    setMonthDirection(viewYear === today.getFullYear() && viewMonth < today.getMonth() ? 1 : -1);
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  }

  /* ---------------- Day modal ---------------- */
  function openDay(key: string) {
    setSelectedKey(key);
    setStatusFilter("all");
    setTypeFilter("all");
  }
  function closeModal() {
    setSelectedKey(null);
  }

  const selectedEntries = selectedKey ? calendarOrdersByDay[selectedKey] || [] : [];
  const filteredEntries = selectedEntries.filter((e) => {
    if (statusFilter !== "all" && e.statusKey !== statusFilter) return false;
    if (typeFilter !== "all" && e.type !== typeFilter) return false;
    return true;
  });

  function selectedDateLabel() {
    if (!selectedKey) return "";
    const [y, m, d] = selectedKey.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    });
  }

  /* ---------------- Order detail modal ---------------- */
  async function openOrderDetail(orderId: number) {
    try {
      setDetailOpen(true);
      setDetailLoading(true);
      const data = await getKitchenOrderDetails(orderId);
      setDetailOrder(data);
    } catch (err) {
      console.error("Could not load order details", err);
    } finally {
      setDetailLoading(false);
    }
  }
  function closeOrderDetail() {
    setDetailOpen(false);
    setDetailOrder(null);
  }

  /* ============================================================
     Render
  ============================================================ */
  return (
    <div className="koc-root">
      <div className="koc-glow koc-glow-a" />
      <div className="koc-glow koc-glow-b" />

      <div className="koc-shell">
        {/* ---------- Header ---------- */}
        <header className="koc-header">
          <div className="koc-header-text">
            <span className="koc-eyebrow">Kitchen Ops</span>
            <h1 className="koc-title">Order Calendar</h1>
            <p className="koc-subtitle">
              Every order plotted by its expected pickup / delivery date — not when it was placed.
            </p>
          </div>

          <div className="koc-stat-strip">
            <div className="koc-stat koc-stat-total">
              <span className="koc-stat-num">{monthStats.total}</span>
              <span className="koc-stat-label">this month</span>
            </div>
            {CALENDAR_STATUS_LEGEND.map((s) => (
              <div key={s.key} className={`koc-stat koc-stat-${s.key}`}>
                <span className={`koc-stat-dot ko-cal-dot-${s.key}`} style={dotStyle(s.key)} />
                <span className="koc-stat-num">{monthStats.counts[s.key]}</span>
                <span className="koc-stat-label">{s.label}</span>
              </div>
            ))}
            <div className="koc-stat koc-stat-delivery" title="Delivery orders this month">
              <span className="koc-type-dot" style={typeDotStyle("DELIVERY")} />
              <span className="koc-stat-num">{monthStats.typeCounts.DELIVERY}</span>
              <span className="koc-stat-label">Delivery</span>
            </div>
            <div className="koc-stat koc-stat-pickup" title="Pickup orders this month">
              <span className="koc-type-dot" style={typeDotStyle("PICKUP")} />
              <span className="koc-stat-num">{monthStats.typeCounts.PICKUP}</span>
              <span className="koc-stat-label">Pickup</span>
            </div>
          </div>
        </header>

        {loadError && (
          <div className="koc-error-banner">
            <span>{loadError}</span>
            <button onClick={fetchAllOrders}>Retry</button>
          </div>
        )}

        {unscheduledCount > 0 && !loading && (
          <div className="koc-unscheduled-banner">
            {unscheduledCount} order{unscheduledCount === 1 ? "" : "s"} have no expected pickup/delivery
            date set yet, so they aren't shown on the calendar.
          </div>
        )}

        {/* ---------- Month navigator ---------- */}
        <div className="koc-nav">
          <div className="koc-nav-controls">
            <button className="koc-icon-btn" onClick={() => goToMonth(-1)} aria-label="Previous month">
              <ChevronIcon direction="left" />
            </button>

            <div className="koc-month-window">
              <AnimatePresence mode="wait" custom={monthDirection}>
                <motion.span
                  key={`${viewYear}-${viewMonth}`}
                  className="koc-month-label"
                  custom={monthDirection}
                  initial={{ y: monthDirection > 0 ? 16 : -16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: monthDirection > 0 ? -16 : 16, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                >
                  {MONTH_NAMES[viewMonth]} {viewYear}
                </motion.span>
              </AnimatePresence>
            </div>

            <button className="koc-icon-btn" onClick={() => goToMonth(1)} aria-label="Next month">
              <ChevronIcon direction="right" />
            </button>

            <button className="koc-today-btn" onClick={goToday}>Today</button>
            <button className="koc-today-btn" onClick={fetchAllOrders} disabled={loading}>
              {loading ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </div>

        {/* ---------- Calendar ---------- */}
        {loading ? (
          <div className="koc-loading-block">
            <div className="ko-spinner" />
            <p>Loading orders…</p>
          </div>
        ) : (
          <div className="koc-calendar">
            <div className="koc-weekdays">
              {WEEKDAY_LABELS.map((w) => (
                <div key={w}>{w}</div>
              ))}
            </div>

            <AnimatePresence mode="wait" custom={monthDirection}>
              <motion.div
                key={`${viewYear}-${viewMonth}`}
                className="koc-grid"
                custom={monthDirection}
                initial={{ opacity: 0, x: monthDirection > 0 ? 24 : -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: monthDirection > 0 ? -24 : 24 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              >
                {cells.map((cellDate, idx) => {
                  if (!cellDate) {
                    return <div key={`empty-${idx}`} className="koc-cell is-outside" />;
                  }

                  const key = dateKey(cellDate);
                  const dayEntries = calendarOrdersByDay[key] || [];
                  const visible = dayEntries.slice(0, 3);
                  const overflow = dayEntries.length - visible.length;
                  const isToday = isSameDay(cellDate, today);

                  return (
                    <motion.button
                      key={key}
                      type="button"
                      className={["koc-cell", isToday ? "is-today" : ""].join(" ").trim()}
                      onClick={() => openDay(key)}
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <div className="koc-daynum-row">
                        <span className="koc-daynum">{cellDate.getDate()}</span>
                        {isToday && <span className="koc-today-pulse" />}
                      </div>

                      <div className="koc-chip-stack">
                        {visible.map((e) => (
                          <span
                            key={e.order.id}
                            className="koc-chip"
                            style={chipStyle(e.statusKey)}
                          >
                            <span
                              className="koc-chip-type-dot"
                              style={typeDotStyle(e.type)}
                              title={e.type}
                            />
                            <span className="koc-chip-name">
                              #{e.order.order_number || e.order.id}
                            </span>
                            <span className="koc-chip-time">{e.info.timeLabel || "—"}</span>
                          </span>
                        ))}
                        {overflow > 0 && <span className="koc-chip-more">+{overflow} more</span>}
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ---------- Day detail modal ---------- */}
      <AnimatePresence>
        {selectedKey && (
          <motion.div
            className="koc-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          >
            <motion.div
              className="koc-modal"
              initial={{ opacity: 0, y: 28, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
            >
              <div className="koc-modal-head">
                <div className="koc-modal-head-top">
                  <div>
                    <div className="koc-modal-title">{selectedDateLabel()}</div>
                    <div className="koc-modal-sub">
                      {selectedEntries.length} order{selectedEntries.length === 1 ? "" : "s"} expected
                    </div>
                  </div>
                  <button className="koc-close-btn" onClick={closeModal} aria-label="Close">
                    <CloseIcon />
                  </button>
                </div>

                <div className="koc-filters">
                  {STATUS_FILTERS.map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      className={`koc-filter-chip${statusFilter === s.key ? " is-active" : ""}`}
                      onClick={() => setStatusFilter(s.key)}
                    >
                      {s.key !== "all" && <span className="koc-filter-dot" style={dotStyle(s.key)} />}
                      <span className="koc-filter-label">{s.label}</span>
                    </button>
                  ))}
                </div>
                <div className="koc-filters">
                  {TYPE_FILTERS.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      className={`koc-filter-chip${typeFilter === t.key ? " is-active" : ""}`}
                      onClick={() => setTypeFilter(t.key)}
                    >
                      {t.key !== "all" && (
                        <span className="koc-filter-dot" style={typeDotStyle(t.key)} />
                      )}
                      <span className="koc-filter-label">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="koc-modal-body">
                <div className="koc-order-list">
                  <AnimatePresence mode="popLayout">
                    {filteredEntries.length === 0 ? (
                      <motion.div
                        key="empty"
                        className="koc-empty"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        <span className="koc-empty-icon">🍽️</span>
                        No matching orders for this date.
                      </motion.div>
                    ) : (
                      filteredEntries.map((e, i) => {
                        const order = e.order;
                        return (
                          <motion.button
                            key={order.id}
                            layout
                            type="button"
                            className="koc-order-card"
                            style={cardStyle(e.type)}
                            initial={{ opacity: 0, x: -14 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 14 }}
                            transition={{ duration: 0.18, delay: i * 0.03 }}
                            whileHover={{ x: 3 }}
                            onClick={() => openOrderDetail(order.id)}
                          >
                            <span className="koc-order-stripe" style={{ background: statusColor(e.statusKey) }} />
                            <div className="koc-order-body">
                              <div className="koc-order-row">
                                <span className="koc-order-name">
                                  #{order.order_number || String(order.id).padStart(5, "0")}
                                </span>
                                <span className="koc-type-pill" style={typePillStyle(e.type)}>
                                  {e.type === "PICKUP" ? "🏪 Pickup" : "🚚 Delivery"}
                                </span>
                                <span className="koc-status-pill" style={statusPillStyle(e.statusKey)}>
                                  {(order.status || "").replace(/_/g, " ")}
                                </span>
                              </div>
                              <div className="koc-order-meta">
                                <span>👤 {getDisplayName(order)}</span>
                                <span>🕒 {e.info.dateLabel}{e.info.timeLabel ? ` · ${e.info.timeLabel}` : ""}</span>
                                {order.total != null && <span>₹ {order.total}</span>}
                              </div>
                            </div>
                          </motion.button>
                        );
                      })
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- Order detail modal ---------- */}
      <AnimatePresence>
        {detailOpen && (
          <motion.div
            className="koc-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => { if (e.target === e.currentTarget) closeOrderDetail(); }}
          >
            <motion.div
              className="koc-modal koc-detail-modal"
              initial={{ opacity: 0, y: 28, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
            >
              <div className="koc-modal-head">
                <div className="koc-modal-head-top">
                  <div className="koc-modal-title">
                    Order {detailOrder ? `#${detailOrder.order_number || detailOrder.id}` : ""}
                  </div>
                  <button className="koc-close-btn" onClick={closeOrderDetail} aria-label="Close">
                    <CloseIcon />
                  </button>
                </div>
              </div>

              <div className="koc-modal-body">
                {detailLoading || !detailOrder ? (
                  <div className="koc-loading-block">
                    <div className="ko-spinner" />
                    <p>Loading order…</p>
                  </div>
                ) : (
                  <div className="koc-detail-content">
                    <div className="koc-detail-badges">
                      <span
                        className="koc-type-pill"
                        style={typePillStyle(getFulfilmentType(detailOrder))}
                      >
                        {getFulfilmentType(detailOrder) === "PICKUP" ? "🏪 Pickup" : "🚚 Delivery"}
                      </span>
                      <span
                        className="koc-status-pill"
                        style={statusPillStyle(getStatusColorKey(detailOrder.status))}
                      >
                        {(detailOrder.status || "").replace(/_/g, " ")}
                      </span>
                    </div>

                    <div className="koc-detail-grid">
                      <div><span className="lbl">Customer</span><span>{getDisplayName(detailOrder)}</span></div>
                      <div><span className="lbl">Phone</span><span>{getDisplayPhone(detailOrder)}</span></div>
                      <div><span className="lbl">Expected date</span><span>{fmtDate(detailOrder.delivery_date || detailOrder.pickup_date) || "—"}</span></div>
                      <div>
                        <span className="lbl">Time slot</span>
                        <span>{detailOrder.delivery_time_slot || detailOrder.pickup_time_slot || "—"}</span>
                      </div>
                    </div>

                    <h5 className="koc-detail-heading">Items</h5>
                    <div className="koc-detail-items">
                      {(detailOrder.items || []).map((item: any) => (
                        <div key={item.id} className="koc-detail-item-row">
                          <span className="koc-item-quantity">×{item.quantity}</span>
                          <span className="koc-item-name">{getItemDisplayName(item)}</span>
                          <span className="koc-item-price">
                            {fmtMoney(item.line_total ?? item.price * item.quantity, detailOrder.currency)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {detailOrder.delivery_notes && (
                      <div className="koc-detail-notes">
                        <strong>Notes:</strong> "{detailOrder.delivery_notes}"
                      </div>
                    )}

                    <div className="koc-detail-total">
                      <strong>Total</strong>
                      <span>{fmtMoney(detailOrder.total, detailOrder.currency)}</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================================================
   Inline style helpers (so pickup/delivery + status colors are
   always visible even without matching CSS classes defined)
============================================================ */
function statusColor(key: CalendarStatusKey): string {
  switch (key) {
    case "yellow": return "#f5a524";
    case "green": return "#22c55e";
    case "red": return "#ef4444";
    default: return "#94a3b8";
  }
}
function dotStyle(key: CalendarStatusKey): React.CSSProperties {
  return {
    display: "inline-block", width: 8, height: 8, borderRadius: "50%",
    background: statusColor(key),
  };
}
function chipStyle(key: CalendarStatusKey): React.CSSProperties {
  return {
    borderLeft: `3px solid ${statusColor(key)}`,
    display: "flex", alignItems: "center", gap: 4,
  };
}
function typeColor(type: FulfilmentType): string {
  return type === "PICKUP" ? "#a855f7" : "#0ea5e9";
}
function typeDotStyle(type: FulfilmentType): React.CSSProperties {
  return {
    display: "inline-block", width: 8, height: 8, borderRadius: "50%",
    background: typeColor(type),
  };
}
function typePillStyle(type: FulfilmentType): React.CSSProperties {
  return {
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600,
    background: type === "PICKUP" ? "rgba(168,85,247,0.12)" : "rgba(14,165,233,0.12)",
    color: typeColor(type),
    border: `1px solid ${typeColor(type)}40`,
  };
}
function statusPillStyle(key: CalendarStatusKey): React.CSSProperties {
  const c = statusColor(key);
  return {
    display: "inline-flex", alignItems: "center",
    padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600,
    background: `${c}20`, color: c, border: `1px solid ${c}40`,
  };
}
function cardStyle(type: FulfilmentType): React.CSSProperties {
  return {
    borderLeft: `4px solid ${typeColor(type)}`,
    width: "100%", textAlign: "left", cursor: "pointer",
    display: "flex", alignItems: "stretch", gap: 8,
  };
}