// import React, { useEffect, useState } from 'react';
// import './Dashboard.css';
// import KuwaitClock from '../../components/KuwaitClock';
// import {
//   getManagerDashboard,
//   getManagerCards,
//   getRevenueChart,
// } from "../../services/dashboardService";
// import { getOrders } from "../../services/orderService";
// import { getActivePromotions, Promotion } from "../../services/productService";

// /* ─────────────────────────────────────────────────────────────
//    NOTE ON ASSUMPTIONS
//    - dashboardService's exact field names are still unverified, so
//      it's kept only for the metrics that have no equivalent in
//      orderService / productService: revenue chart, revenue trend
//      text, VIP customers, low stock materials, and the loyalty
//      leaderboard.
//    - "Active Orders", "Cooking Pipeline", "Couriers & Transit
//      Dispatch" and "Live Activity Stream" are now driven directly
//      by GET /orders via orderService.getOrders(), since that's a
//      documented, real endpoint. The exact shape of an order object
//      coming back from the backend isn't specified anywhere either
//      (all orderService methods type it as `any`), so it's read
//      defensively below with `?.` and several fallback field names.
//      If your backend uses different keys, adjust the constants in
//      ORDER_STATUS and the paths inside mapOrder...() — the JSX is
//      untouched.
//    - "Active Promotions" is a brand-new card, fed by
//      productService.getActivePromotions() (a real, documented,
//      public endpoint).
//    - Cooking Pipeline, Couriers & Transit Dispatch, and Live
//      Activity Stream each only display the first 4 matching
//      orders, even if more exist, to keep the dashboard scannable.
//    - VIEW-ONLY: this dashboard is read-only. No action controls
//      (assign courier, view/detail buttons, etc.) are rendered
//      anywhere — it only displays order data.
//    ───────────────────────────────────────────────────────────── */

// // Adjust these if your backend uses different status strings.
// const ORDER_STATUS = {
//   terminal: ['DELIVERED', 'CANCELLED', 'REJECTED'],
//   kitchen: ['ASSIGNED_TO_KITCHEN', 'IN_PREPARATION'],
//   dispatch: ['ASSIGNED_TO_AGENT', 'ASSIGNED_TO_DRIVER', 'DRIVER_ACCEPTED', 'OUT_FOR_DELIVERY', 'DELIVERY_SUBMITTED'],
//   delivered: ['DELIVERED'],
// };

// // How many rows each "list" card shows at once.
// const LIST_PREVIEW_LIMIT = 4;

// interface MetricCards {
//   deliveredRevenue: number;
//   deliveredRevenueTrend: string;
//   activeOrders: number;
//   vipCustomers: number;
//   lowStockMaterials: number;
// }

// interface RevenueChartPoint {
//   label: string;
//   value: number; // 0-100 (already normalized) or raw revenue
// }

// interface RevenueSummary {
//   grossIntake: number;
//   trend: string;
// }

// interface DispatchOrder {
//   orderNumber: string;
//   status: string;
//   address: string;
//   driverName?: string;
// }

// interface LeaderboardEntry {
//   rank: number;
//   name: string;
//   email: string;
//   joined: string;
//   points: number;
// }

// interface ActivityOrder {
//   orderNumber: string;
//   customerName: string;
//   itemsCount: number;
//   price: number;
//   status: string;
// }

// interface KitchenOrder {
//   orderNumber: string;
// }

// // ── Promotion countdown helper (same pattern used on Product pages) ──
// const getTimeRemaining = (endDate: string) => {
//   const total = new Date(endDate).getTime() - new Date().getTime();
//   if (total <= 0) return { total: 0, days: 0, hours: 0, minutes: 0 };
//   const days = Math.floor(total / (1000 * 60 * 60 * 24));
//   const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
//   const minutes = Math.floor((total / 1000 / 60) % 60);
//   return { total, days, hours, minutes };
// };

// const formatEndDate = (dateStr: string) => {
//   const d = new Date(dateStr);
//   return d.toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
// };

// const isPromotionLive = (promo: Promotion): boolean => {
//   if (!promo.is_active || !promo.end_date) return false;
//   const now = new Date().getTime();
//   const end = new Date(promo.end_date).getTime();
//   const start = promo.start_date ? new Date(promo.start_date).getTime() : -Infinity;
//   return now >= start && now <= end;
// };

// const Dashboard: React.FC = () => {
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const [metrics, setMetrics] = useState<MetricCards | null>(null);
//   const [revenueSummary, setRevenueSummary] = useState<RevenueSummary | null>(null);
//   const [revenueChart, setRevenueChart] = useState<RevenueChartPoint[]>([]);
//   const [dispatchOrders, setDispatchOrders] = useState<DispatchOrder[]>([]);
//   const [onlineCouriers, setOnlineCouriers] = useState<string[]>([]);
//   const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
//   const [kitchenOrders, setKitchenOrders] = useState<KitchenOrder[]>([]);
//   const [activityOrders, setActivityOrders] = useState<ActivityOrder[]>([]);
//   const [activePromotions, setActivePromotions] = useState<Promotion[]>([]);
//   const [chartRange, setChartRange] = useState<'weekly' | 'monthly'>('weekly');

//   // tick every minute so promo countdowns stay fresh without a full refetch
//   const [, setTick] = useState(0);

//   useEffect(() => {
//     fetchAll(chartRange);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [chartRange]);

//   useEffect(() => {
//     const interval = setInterval(() => setTick((t) => t + 1), 60000);
//     return () => clearInterval(interval);
//   }, []);

//   const fetchAll = async (range: 'weekly' | 'monthly') => {
//     try {
//       setLoading(true);
//       setError(null);

//       const days = range === 'weekly' ? 7 : 30;

//       const [managerDash, managerCards, revChart, orders, promotions] = await Promise.all([
//         getManagerDashboard(),
//         getManagerCards(),
//         getRevenueChart(days),
//         getOrders(),
//         getActivePromotions(),
//       ]);

//       const ordersList = Array.isArray(orders) ? orders : [];

//       setRevenueSummary(mapRevenueSummary(managerDash));
//       setRevenueChart(mapRevenueChart(revChart));
//       setOnlineCouriers(mapOnlineCouriers(managerDash));
//       setLeaderboard(mapLeaderboard(managerDash));

//       setMetrics(mapMetricCards(managerCards, ordersList));
//       setDispatchOrders(mapDispatchOrders(ordersList));
//       setKitchenOrders(mapKitchenOrders(ordersList));
//       setActivityOrders(mapActivityOrders(ordersList));
//       setActivePromotions((promotions || []).filter(isPromotionLive));
//     } catch (err: any) {
//       console.error('Failed to load dashboard data', err);
//       setError('Failed to load dashboard data. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ───────── mapping helpers (adjust keys to match your API) ───────── */

//   // Revenue trend / VIP customers / low stock materials have no equivalent
//   // in orderService or productService, so these still come from
//   // dashboardService's getManagerCards(). Active Orders now comes from the
//   // real order list instead.
//   const mapMetricCards = (data: any, orders: any[]): MetricCards => ({
//     deliveredRevenue:
//       orders
//         .filter((o) => ORDER_STATUS.delivered.includes(getOrderStatus(o)))
//         .reduce((sum, o) => sum + (getOrderTotal(o) || 0), 0) || (data?.delivered_revenue ?? 0),
//     deliveredRevenueTrend: data?.delivered_revenue_trend ?? '',
//     activeOrders: orders.filter((o) => !ORDER_STATUS.terminal.includes(getOrderStatus(o))).length,
//     vipCustomers: data?.vip_customers ?? 0,
//     lowStockMaterials: data?.low_stock_materials ?? 0,
//   });

//   const mapRevenueSummary = (data: any): RevenueSummary => ({
//     grossIntake: data?.gross_intake ?? 0,
//     trend: data?.revenue_trend ?? '',
//   });

//   const mapRevenueChart = (data: any): RevenueChartPoint[] => {
//     const points = data?.chart ?? data?.data ?? [];
//     if (!Array.isArray(points)) return [];
//     const max = Math.max(...points.map((p: any) => p.revenue ?? p.value ?? 0), 1);
//     return points.map((p: any) => ({
//       label: p.label ?? p.day ?? '',
//       value: Math.round(((p.revenue ?? p.value ?? 0) / max) * 100),
//     }));
//   };

//   const mapOnlineCouriers = (data: any): string[] => {
//     const couriers = data?.online_couriers ?? [];
//     return Array.isArray(couriers) ? couriers.map((c: any) => c.name ?? c) : [];
//   };

//   const mapLeaderboard = (data: any): LeaderboardEntry[] => {
//     const entries = data?.loyalty_leaderboard ?? [];
//     return Array.isArray(entries)
//       ? entries.map((e: any, idx: number) => ({
//           rank: e.rank ?? idx + 1,
//           name: e.name,
//           email: e.email,
//           joined: e.joined ?? e.joined_date,
//           points: e.points,
//         }))
//       : [];
//   };

//   // ── Defensive order field readers (backend order shape is untyped) ──
//   const getOrderStatus = (o: any): string => (o?.status ?? '').toString().toUpperCase();
//   const getOrderNumber = (o: any): string => o?.order_number ?? o?.orderNumber ?? `#${o?.id ?? '—'}`;
//   const getOrderTotal = (o: any): number =>
//     Number(o?.total ?? o?.grand_total ?? o?.amount ?? o?.total_amount ?? 0);
//   const getOrderCustomerName = (o: any): string =>
//     o?.customer_name ?? o?.customer?.name ?? o?.customer?.full_name ?? 'Guest';
//   const getOrderItemsCount = (o: any): number =>
//     o?.items_count ?? (Array.isArray(o?.items) ? o.items.length : 0);
//   const getOrderAddress = (o: any): string => {
//     const addr = o?.address ?? o?.delivery_address;
//     if (!addr) return o?.address_line1 ?? '—';
//     if (typeof addr === 'string') return addr;
//     return [addr.address_line1 ?? addr.line1, addr.city].filter(Boolean).join(', ') || '—';
//   };
//   const getOrderDriverName = (o: any): string | undefined =>
//     o?.driver_name ?? o?.driver?.name ?? o?.driver?.full_name ?? undefined;
//   const getOrderCreatedAt = (o: any): number => {
//     const t = o?.created_at ?? o?.createdAt;
//     return t ? new Date(t).getTime() : 0;
//   };

//   // Each of these only returns the first LIST_PREVIEW_LIMIT matches — the
//   // dashboard is meant to be a glanceable snapshot, not a full order list.
//   const mapDispatchOrders = (orders: any[]): DispatchOrder[] =>
//     orders
//       .filter((o) => ORDER_STATUS.dispatch.includes(getOrderStatus(o)))
//       .slice(0, LIST_PREVIEW_LIMIT)
//       .map((o) => ({
//         orderNumber: getOrderNumber(o),
//         status: getOrderStatus(o),
//         address: getOrderAddress(o),
//         driverName: getOrderDriverName(o),
//       }));

//   const mapKitchenOrders = (orders: any[]): KitchenOrder[] =>
//     orders
//       .filter((o) => ORDER_STATUS.kitchen.includes(getOrderStatus(o)))
//       .slice(0, LIST_PREVIEW_LIMIT)
//       .map((o) => ({ orderNumber: getOrderNumber(o) }));

//   const mapActivityOrders = (orders: any[]): ActivityOrder[] =>
//     [...orders]
//       .sort((a, b) => getOrderCreatedAt(b) - getOrderCreatedAt(a))
//       .slice(0, LIST_PREVIEW_LIMIT)
//       .map((o) => ({
//         orderNumber: getOrderNumber(o),
//         customerName: getOrderCustomerName(o),
//         itemsCount: getOrderItemsCount(o),
//         price: getOrderTotal(o),
//         status: getOrderStatus(o),
//       }));

//   const rankClass = (rank: number) => (rank === 1 ? 'gold' : rank === 2 ? 'silver' : 'bronze');
//   const statusPillClass = (status: string) => status.toLowerCase().replace(/\s+/g, '');

//   if (loading) {
//     return (
//       <div className="db-container">
//         <p>Loading dashboard…</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="db-container">
//         <p>{error}</p>
//       </div>
//     );
//   }

//   return (
//     <div className="db-container">
//       {/* ─── Dashboard Header Bar & Kuwait Live Clock ─── */}
//       <div className="db-header-bar">
//         <div className="db-header-intro">
//           <div className="db-header-badge">
//             <span className="db-pulse-dot" /> LIVE OPERATIONS
//           </div>
//           <h1 className="db-page-heading">Store Operations Overview</h1>
//           <p className="db-page-subheading">
//             Real-time branch dispatch, kitchen pipeline, and sales intake
//           </p>
//         </div>

//         <div className="db-header-clock">
//           <KuwaitClock />
//         </div>
//       </div>

//       {/* ─── Top Metrics Grid ─── */}
//       <div className="db-metrics-grid">
//         <div className="db-metric-card bg-sage">
//           <div className="db-metric-header">
//             <span className="db-metric-title">DELIVERED REVENUE</span>
//           </div>
//           <h2 className="db-metric-value">{metrics?.deliveredRevenue.toFixed(2)}</h2>
//           <span className="db-trend text-success">{metrics?.deliveredRevenueTrend || 'vs last week'}</span>
//         </div>

//         <div className="db-metric-card">
//           <div className="db-metric-header">
//             <span className="db-metric-title">ACTIVE ORDERS</span>
//           </div>
//           <h2 className="db-metric-value">{metrics?.activeOrders}</h2>
//           <span className="db-trend text-success">Real-time cooking queue</span>
//         </div>

//         <div className="db-metric-card">
//           <div className="db-metric-header">
//             <span className="db-metric-title">VIP CUSTOMERS</span>
//           </div>
//           <h2 className="db-metric-value">{metrics?.vipCustomers}</h2>
//           <span className="db-trend text-success">Accumulating points</span>
//         </div>

//         <div className="db-metric-card">
//           <div className="db-metric-header">
//             <span className="db-metric-title">LOW STOCK MATERIALS</span>
//           </div>
//           <h2 className="db-metric-value">{metrics?.lowStockMaterials}</h2>
//           <span className="db-trend text-danger">Requires purchase orders</span>
//         </div>
//       </div>

//       {/* ─── Main Content Split Dashboard Body ─── */}
//       <div className="db-main-content">

//         {/* Left Column blocks */}
//         <div className="db-column-left">

//           {/* Revenue Stream Analytics Card */}
//           <div className="db-card db-revenue-card">
//             <div className="db-card-header">
//               <div>
//                 <h3 className="db-card-heading">Revenue Stream Analytics</h3>
//                 <p className="db-card-subheading">AGGREGATED TRANSACTION VALUES & CULINARY COMMISSION TRACKING</p>
//               </div>
//               <span className="db-range-label">
//                 {chartRange === 'weekly' ? 'Weekly' : 'Monthly'}
//               </span>
//             </div>

//             <div className="db-revenue-meta">
//               <div>
//                 <span className="db-meta-label">GROSS INTAKE</span>
//                 <h2 className="db-grand-total">{revenueSummary?.grossIntake.toFixed(2)}</h2>
//               </div>
//               <span className="db-trend text-success text-right">{revenueSummary?.trend || 'vs prev period'}</span>
//             </div>

//             {/* Chart Bar Columns — now driven by getRevenueChart() */}
//             <div className="db-chart-container">
//               {revenueChart.map((point, idx) => (
//                 <div className="db-chart-column" key={idx}>
//                   <div className="db-bar" style={{ height: `${point.value}%` }}></div>
//                   <span className="db-bar-label">{point.label}</span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* ─── Active Promotions Card (new — driven by productService.getActivePromotions()) ─── */}
//           <div className="db-card">
//             <h3 className="db-card-heading">Active Promotions</h3>
//             <p className="db-card-subheading">LIVE DISCOUNTS CUSTOMERS CAN REDEEM RIGHT NOW</p>

//             {activePromotions.length === 0 ? (
//               <div className="db-empty-pipeline">
//                 <p>No promotions are currently running.</p>
//               </div>
//             ) : (
//               <div className="db-promo-list">
//                 {activePromotions.map((promo) => {
//                   const remaining = promo.end_date ? getTimeRemaining(promo.end_date) : null;
//                   return (
//                     <div className="db-promo-item" key={promo.id}>
//                       <div className="db-promo-item-top">
//                         <span className="db-promo-name">{promo.name}</span>
//                         <span className="db-promo-badge">
//                           {promo.discount_type === 'PERCENT'
//                             ? `${promo.discount_value}% OFF`
//                             : `₹${promo.discount_value} OFF`}
//                         </span>
//                       </div>
//                       {promo.description && <p className="db-promo-desc">{promo.description}</p>}
//                       <div className="db-promo-meta">
//                         {promo.min_order_value > 0 && (
//                           <span>Min. order ₹{promo.min_order_value.toFixed(2)}</span>
//                         )}
//                         {promo.end_date && (
//                           <span>
//                             {remaining && remaining.total > 0
//                               ? `Ends in ${remaining.days > 0 ? `${remaining.days}d ` : ''}${remaining.hours}h ${remaining.minutes}m`
//                               : `Ended ${formatEndDate(promo.end_date)}`}
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>

//           {/* Dual Bottom Grid: Couriers & Loyalty Leaderboard */}
//           <div className="db-dual-grid">

//             {/* Couriers & Transit Dispatch */}
//             <div className="db-card">
//               <h3 className="db-card-heading">Couriers & Transit Dispatch</h3>
//               <p className="db-card-subheading">SUPERVISING LIVE DELIVERY ASSIGNMENTS AND STATUS CHANGES</p>

//               <span className="db-section-tag text-uppercase">COURIERS ONLINE</span>
//               <div className="db-badge-row">
//                 {onlineCouriers.map((name, idx) => (
//                   <span className="db-courier-badge online" key={idx}>{name} •</span>
//                 ))}
//               </div>

//               <div className="db-dispatch-list">
//                 {dispatchOrders.map((order, idx) => (
//                   <div className="db-dispatch-item" key={idx}>
//                     <div className="db-dispatch-row-top">
//                       <span className="db-order-number">{order.orderNumber}</span>
//                       <span className={`status-pill ${statusPillClass(order.status)}`}>{order.status}</span>
//                     </div>
//                     <p className="db-dispatch-address">To: {order.address}</p>
//                     <p className={order.driverName ? "db-assigned-driver" : "db-unassigned-driver"}>
//                       {order.driverName ? `Courier: ${order.driverName}` : 'Not yet assigned'}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Loyalty Leaderboard */}
//             <div className="db-card">
//               <h3 className="db-card-heading">Loyalty Leaderboard</h3>
//               <p className="db-card-subheading">RECOGNIZING OUR MOST FREQUENT GOURMET DINING ACCOUNTS</p>

//               <div className="db-leaderboard-list">
//                 {leaderboard.map((entry) => (
//                   <div className="db-leaderboard-item" key={entry.rank}>
//                     <div className={`db-rank-num ${rankClass(entry.rank)}`}>{entry.rank}</div>
//                     <div className="db-user-info">
//                       <h4>{entry.name}</h4>
//                       <p>{entry.email}</p>
//                       <span>Joined {entry.joined}</span>
//                     </div>
//                     <span className="db-points-badge">{entry.points} PTS</span>
//                   </div>
//                 ))}
//               </div>
//             </div>

//           </div>
//         </div>

//         {/* Right Column blocks */}
//         <div className="db-column-right">

//           {/* Cooking Pipeline Card */}
//           <div className="db-card">
//             <div className="db-card-header">
//               <div>
//                 <h3 className="db-card-heading">Cooking Pipeline</h3>
//                 <p className="db-card-subheading">ORDERS CURRENTLY ON HOT-LINE RANGES OR PREP TABLES</p>
//               </div>
//               <span className="db-badge-pipeline">Prep Lab</span>
//             </div>
//             {kitchenOrders.length === 0 ? (
//               <div className="db-empty-pipeline">
//                 <p>Hot plates clean. Kitchen board cleared!</p>
//               </div>
//             ) : (
//               <div className="db-dispatch-list">
//                 {kitchenOrders.map((order, idx) => (
//                   <div className="db-dispatch-item" key={idx}>
//                     <span className="db-order-number">{order.orderNumber}</span>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Live Activity Stream Card */}
//           <div className="db-card">
//             <div className="db-card-header">
//               <div>
//                 <h3 className="db-card-heading">Live Activity Stream</h3>
//                 <p className="db-card-subheading">MONITORING INCOMING PURCHASES, APPROVALS & PIPELINE SHIFTS</p>
//               </div>
//               <span className="db-activity-pulse">Active Stream</span>
//             </div>

//             <div className="db-activity-list">
//               {activityOrders.map((order, idx) => (
//                 <div className="db-activity-item" key={idx}>
//                   <div className="db-activity-left">
//                     <span className="db-order-number">{order.orderNumber}</span>
//                     <p className="db-customer-name">{order.customerName}</p>
//                   </div>
//                   <div className="db-activity-center">
//                     <span>{order.itemsCount} Items</span>
//                     <p className="db-item-price">₹{order.price.toFixed(2)}</p>
//                   </div>
//                   <div className="db-activity-right">
//                     <span className={`status-pill ${statusPillClass(order.status)}`}>{order.status}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//         </div>
//       </div>

//     </div>
//   );
// };

// export default Dashboard;


import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, CalendarClock, CalendarRange, Sun, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import './Dashboard.css';
import KuwaitClock from '../../components/KuwaitClock';
import { getManagerDashboard, getManagerCards, getRevenueChart } from '../../services/dashboardService';
import { getOrders } from '../../services/orderService';
import { getActivePromotions, Promotion } from '../../services/productService';
import { AdminDataToolbar, useAdminDataTools, parseDate } from '../../services/Useadmindatatools';

/* ─────────────────────────────────────────────────────────────
   NOTES
   - Orders come from GET /orders (orderService.getOrders()).
   - The pistachio filter deck (date range, phone, order id, search,
     import / export) filters the order list that feeds Delivered
     Revenue, Active Orders, Cooking Pipeline, Couriers & Transit
     Dispatch and Live Activity Stream.
   - "Period performance" (Today / Tomorrow / This month / This year)
     is always calculated on ALL orders so the fixed periods stay
     comparable. Tomorrow uses the scheduled delivery / pickup date.
   - Revenue excludes CANCELLED / REJECTED orders.
   - VIEW-ONLY: no action controls are rendered.
   ───────────────────────────────────────────────────────────── */

const ORDER_STATUS = {
  terminal: ['DELIVERED', 'CANCELLED', 'REJECTED'],
  cancelled: ['CANCELLED', 'REJECTED'],
  kitchen: ['ASSIGNED_TO_KITCHEN', 'IN_PREPARATION'],
  dispatch: ['ASSIGNED_TO_AGENT', 'ASSIGNED_TO_DRIVER', 'DRIVER_ACCEPTED', 'OUT_FOR_DELIVERY', 'DELIVERY_SUBMITTED'],
  delivered: ['DELIVERED'],
};

const LIST_PREVIEW_LIMIT = 4;

interface RevenueChartPoint {
  label: string;
  value: number;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  email: string;
  joined: string;
  points: number;
}

/* ── Defensive order readers (module level so hooks can use them) ── */
const getOrderStatus = (o: any): string => (o?.status ?? '').toString().toUpperCase();
const getOrderNumber = (o: any): string => o?.order_number ?? o?.orderNumber ?? `#${o?.id ?? '—'}`;
const getOrderTotal = (o: any): number => Number(o?.grand_total ?? o?.total ?? o?.amount ?? o?.total_amount ?? 0) || 0;
const getOrderCustomerName = (o: any): string => o?.customer_name ?? o?.customer?.name ?? o?.customer?.full_name ?? 'Guest';
const getOrderItemsCount = (o: any): number => o?.items_count ?? (Array.isArray(o?.items) ? o.items.length : 0);
const getOrderAddress = (o: any): string => {
  const addr = o?.address ?? o?.delivery_address;
  if (!addr) return o?.address_line1 ?? '—';
  if (typeof addr === 'string') return addr;
  return [addr.address_line1 ?? addr.line1, addr.city].filter(Boolean).join(', ') || '—';
};
const getOrderDriverName = (o: any): string | undefined => o?.driver_name ?? o?.driver?.name ?? o?.driver?.full_name ?? undefined;
const getCreated = (o: any): Date | null => parseDate(o?.created_at ?? o?.order_date ?? o?.createdAt);
const getScheduled = (o: any): Date | null => parseDate(o?.delivery_date ?? o?.pickup_date) ?? getCreated(o);
const isCancelled = (o: any) => ORDER_STATUS.cancelled.includes(getOrderStatus(o));

/* ── Period maths ── */
const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

interface PeriodStats {
  orders: number;
  revenue: number;
  delivered: number;
  cancelled: number;
  pending: number;
  avg: number;
}

const statsFor = (orders: any[], start: Date, end: Date, pick: (o: any) => Date | null): PeriodStats => {
  const inRange = orders.filter((o) => {
    const d = pick(o);
    return d !== null && d >= start && d < end;
  });
  const valid = inRange.filter((o) => !isCancelled(o));
  const revenue = valid.reduce((s, o) => s + getOrderTotal(o), 0);
  return {
    orders: inRange.length,
    revenue,
    delivered: inRange.filter((o) => ORDER_STATUS.delivered.includes(getOrderStatus(o))).length,
    cancelled: inRange.length - valid.length,
    pending: inRange.filter((o) => !ORDER_STATUS.terminal.includes(getOrderStatus(o))).length,
    avg: valid.length ? revenue / valid.length : 0,
  };
};

const pctChange = (now: number, prev: number): number | null => {
  if (!prev) return now ? 100 : null;
  return ((now - prev) / prev) * 100;
};

const money = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ── Promotion helpers ── */
const getTimeRemaining = (endDate: string) => {
  const total = new Date(endDate).getTime() - new Date().getTime();
  if (total <= 0) return { total: 0, days: 0, hours: 0, minutes: 0 };
  return {
    total,
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / 1000 / 60) % 60),
  };
};

const formatEndDate = (dateStr: string) =>
  new Date(dateStr).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

const isPromotionLive = (promo: Promotion): boolean => {
  if (!promo.is_active || !promo.end_date) return false;
  const now = Date.now();
  const end = new Date(promo.end_date).getTime();
  const start = promo.start_date ? new Date(promo.start_date).getTime() : -Infinity;
  return now >= start && now <= end;
};

const Trend: React.FC<{ value: number | null; label: string }> = ({ value, label }) => {
  if (value === null) return <span className="db-period-trend flat"><Minus size={12} /> no data {label}</span>;
  const up = value >= 0;
  return (
    <span className={`db-period-trend ${up ? 'up' : 'down'}`}>
      {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {Math.abs(value).toFixed(0)}% {label}
    </span>
  );
};

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [managerCards, setManagerCards] = useState<any>(null);
  const [managerDash, setManagerDash] = useState<any>(null);
  const [revenueChart, setRevenueChart] = useState<RevenueChartPoint[]>([]);
  const [activePromotions, setActivePromotions] = useState<Promotion[]>([]);
  const [chartRange] = useState<'weekly' | 'monthly'>('weekly');

  // tick every minute so promo countdowns and "today" stay fresh
  const [, setTick] = useState(0);

  useEffect(() => {
    fetchAll(chartRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartRange]);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchAll = async (range: 'weekly' | 'monthly') => {
    try {
      setLoading(true);
      setError(null);
      const days = range === 'weekly' ? 7 : 30;
      const [dash, cards, revChart, orders, promotions] = await Promise.allSettled([
        getManagerDashboard(),
        getManagerCards(),
        getRevenueChart(days),
        getOrders(),
        getActivePromotions(),
      ]);
      const val = <T,>(r: PromiseSettledResult<T>, fallback: T): T => (r.status === 'fulfilled' ? r.value : fallback);

      const ordersRaw: any = val(orders, [] as any);
      const ordersList = Array.isArray(ordersRaw) ? ordersRaw : ordersRaw?.orders || [];
      if (orders.status === 'rejected') setError('Orders could not be loaded. Some figures may be incomplete.');

      setAllOrders(ordersList);
      setManagerDash(val(dash, null));
      setManagerCards(val(cards, null));
      setRevenueChart(mapRevenueChart(val(revChart, null)));
      setActivePromotions((val(promotions, [] as Promotion[]) || []).filter(isPromotionLive));
    } catch (err: any) {
      console.error('Failed to load dashboard data', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Filter deck over all orders ── */
  const orderDateKeys = useMemo(
    () => ['created_at', 'order_date', 'delivery_date', 'pickup_date'].filter((k) => allOrders.some((o) => o?.[k])),
    [allOrders]
  );
  const tools = useAdminDataTools({
    data: allOrders,
    title: 'Dashboard orders',
    storageKey: 'dashboard',
    dateKeys: orderDateKeys,
    columns: [
      { header: 'Order #', value: (o: any) => getOrderNumber(o) },
      { header: 'Customer', value: (o: any) => getOrderCustomerName(o) },
      { header: 'Phone', key: 'customer_phone' },
      { header: 'Status', value: (o: any) => getOrderStatus(o) },
      { header: 'Payment', key: 'payment_method' },
      { header: 'Payment status', key: 'payment_status' },
      { header: 'Total', value: (o: any) => getOrderTotal(o) },
      { header: 'Currency', key: 'currency' },
      { header: 'Created', key: 'created_at' },
      { header: 'Delivery date', key: 'delivery_date' },
    ],
  });
  const orders = tools.filtered;

  /* ── Period performance (always on ALL orders) ── */
  const periods = useMemo(() => {
    const now = new Date();
    const today = dayStart(now);
    const tomorrow = addDays(today, 1);
    const dayAfter = addDays(today, 2);
    const yesterday = addDays(today, -1);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const nextYear = new Date(now.getFullYear() + 1, 0, 1);
    const prevYearStart = new Date(now.getFullYear() - 1, 0, 1);
    // compare month-to-date / year-to-date with the same span last period
    const prevMonthSameDay = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate() + 1);
    const prevYearSameDay = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate() + 1);

    return [
      {
        key: 'today',
        title: 'Today',
        sub: today.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' }),
        icon: Sun,
        stats: statsFor(allOrders, today, tomorrow, getCreated),
        trend: pctChange(statsFor(allOrders, today, tomorrow, getCreated).revenue, statsFor(allOrders, yesterday, today, getCreated).revenue),
        trendLabel: 'vs yesterday',
        accent: 'is-today',
      },
      {
        key: 'tomorrow',
        title: 'Tomorrow',
        sub: `Scheduled · ${tomorrow.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`,
        icon: CalendarClock,
        stats: statsFor(allOrders, tomorrow, dayAfter, getScheduled),
        trend: null as number | null,
        trendLabel: 'expected revenue',
        accent: 'is-tomorrow',
      },
      {
        key: 'month',
        title: 'This month',
        sub: now.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
        icon: CalendarDays,
        stats: statsFor(allOrders, monthStart, nextMonth, getCreated),
        trend: pctChange(statsFor(allOrders, monthStart, tomorrow, getCreated).revenue, statsFor(allOrders, prevMonthStart, prevMonthSameDay, getCreated).revenue),
        trendLabel: 'vs last month (to date)',
        accent: 'is-month',
      },
      {
        key: 'year',
        title: 'This year',
        sub: String(now.getFullYear()),
        icon: CalendarRange,
        stats: statsFor(allOrders, yearStart, nextYear, getCreated),
        trend: pctChange(statsFor(allOrders, yearStart, tomorrow, getCreated).revenue, statsFor(allOrders, prevYearStart, prevYearSameDay, getCreated).revenue),
        trendLabel: 'vs last year (to date)',
        accent: 'is-year',
      },
    ];
  }, [allOrders]);

  /* ── Monthly breakdown for the current year ── */
  const monthly = useMemo(() => {
    const year = new Date().getFullYear();
    const buckets = Array.from({ length: 12 }, (_, m) => ({
      label: new Date(year, m, 1).toLocaleString(undefined, { month: 'short' }),
      revenue: 0,
      orders: 0,
    }));
    allOrders.forEach((o) => {
      const d = getCreated(o);
      if (!d || d.getFullYear() !== year) return;
      buckets[d.getMonth()].orders += 1;
      if (!isCancelled(o)) buckets[d.getMonth()].revenue += getOrderTotal(o);
    });
    const max = Math.max(...buckets.map((b) => b.revenue), 1);
    return buckets.map((b) => ({ ...b, pct: Math.round((b.revenue / max) * 100) }));
  }, [allOrders]);

  /* ── Everything below follows the filter deck ── */
  const filteredStats = useMemo(() => {
    const valid = orders.filter((o) => !isCancelled(o));
    const revenue = valid.reduce((s, o) => s + getOrderTotal(o), 0);
    return { count: orders.length, revenue, avg: valid.length ? revenue / valid.length : 0 };
  }, [orders]);

  const metrics = useMemo(
    () => ({
      deliveredRevenue:
        orders.filter((o) => ORDER_STATUS.delivered.includes(getOrderStatus(o))).reduce((s, o) => s + getOrderTotal(o), 0) ||
        (tools.activeCount === 0 ? Number(managerCards?.delivered_revenue ?? 0) : 0),
      deliveredRevenueTrend: managerCards?.delivered_revenue_trend ?? '',
      activeOrders: orders.filter((o) => !ORDER_STATUS.terminal.includes(getOrderStatus(o))).length,
      vipCustomers: managerCards?.vip_customers ?? 0,
      lowStockMaterials: managerCards?.low_stock_materials ?? 0,
    }),
    [orders, managerCards, tools.activeCount]
  );

  const dispatchOrders = useMemo(
    () =>
      orders
        .filter((o) => ORDER_STATUS.dispatch.includes(getOrderStatus(o)))
        .slice(0, LIST_PREVIEW_LIMIT)
        .map((o) => ({ orderNumber: getOrderNumber(o), status: getOrderStatus(o), address: getOrderAddress(o), driverName: getOrderDriverName(o) })),
    [orders]
  );

  const kitchenOrders = useMemo(
    () => orders.filter((o) => ORDER_STATUS.kitchen.includes(getOrderStatus(o))).slice(0, LIST_PREVIEW_LIMIT).map((o) => ({ orderNumber: getOrderNumber(o) })),
    [orders]
  );

  const activityOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => (getCreated(b)?.getTime() || 0) - (getCreated(a)?.getTime() || 0))
        .slice(0, LIST_PREVIEW_LIMIT)
        .map((o) => ({
          orderNumber: getOrderNumber(o),
          customerName: getOrderCustomerName(o),
          itemsCount: getOrderItemsCount(o),
          price: getOrderTotal(o),
          status: getOrderStatus(o),
        })),
    [orders]
  );

  const revenueSummary = {
    grossIntake: Number(managerDash?.gross_intake ?? 0),
    trend: managerDash?.revenue_trend ?? '',
  };

  const onlineCouriers: string[] = Array.isArray(managerDash?.online_couriers)
    ? managerDash.online_couriers.map((c: any) => c.name ?? c)
    : [];

  const leaderboard: LeaderboardEntry[] = Array.isArray(managerDash?.loyalty_leaderboard)
    ? managerDash.loyalty_leaderboard.map((e: any, idx: number) => ({
        rank: e.rank ?? idx + 1,
        name: e.name,
        email: e.email,
        joined: e.joined ?? e.joined_date,
        points: e.points,
      }))
    : [];

  function mapRevenueChart(data: any): RevenueChartPoint[] {
    const points = data?.chart ?? data?.data ?? [];
    if (!Array.isArray(points)) return [];
    const max = Math.max(...points.map((p: any) => p.revenue ?? p.value ?? 0), 1);
    return points.map((p: any) => ({
      label: p.label ?? p.day ?? '',
      value: Math.round(((p.revenue ?? p.value ?? 0) / max) * 100),
    }));
  }

  const rankClass = (rank: number) => (rank === 1 ? 'gold' : rank === 2 ? 'silver' : 'bronze');
  const statusPillClass = (status: string) => status.toLowerCase().replace(/\s+/g, '');

  if (loading) {
    return (
      <div className="db-container">
        <div className="db-loading">
          <span className="db-loading-dot" /> Loading dashboard…
        </div>
      </div>
    );
  }

  return (
    <div className="db-container">
      {/* ─── Header & Kuwait clock ─── */}
      <div className="db-header-bar">
        <div className="db-header-intro">
          <div className="db-header-badge">
            <span className="db-pulse-dot" /> LIVE OPERATIONS
          </div>
          <h1 className="db-page-heading">Store Operations Overview</h1>
          <p className="db-page-subheading">Real-time branch dispatch, kitchen pipeline, and sales intake</p>
        </div>
        <div className="db-header-clock">
          <KuwaitClock />
        </div>
      </div>

      {error && <div className="db-error-banner">{error}</div>}

      {/* ─── Period performance: Today / Tomorrow / Month / Year ─── */}
      <div className="db-period-grid">
        {periods.map((p, i) => (
          <motion.div
            key={p.key}
            className={`db-period-card ${p.accent}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <div className="db-period-head">
              <span className="db-period-icon">
                <p.icon size={18} />
              </span>
              <div>
                <h3>{p.title}</h3>
                <span>{p.sub}</span>
              </div>
            </div>
            <div className="db-period-revenue">
              <small>{p.key === 'tomorrow' ? 'Expected revenue' : 'Revenue'}</small>
              <strong>{money(p.stats.revenue)}</strong>
              {p.key === 'tomorrow' ? (
                <span className="db-period-trend flat">{p.stats.pending} order(s) still to fulfil</span>
              ) : (
                <Trend value={p.trend} label={p.trendLabel} />
              )}
            </div>
            <div className="db-period-stats">
              <div>
                <b>{p.stats.orders}</b>
                <span>Orders</span>
              </div>
              <div>
                <b>{p.stats.delivered}</b>
                <span>Delivered</span>
              </div>
              <div>
                <b>{p.stats.cancelled}</b>
                <span>Cancelled</span>
              </div>
              <div>
                <b>{money(p.stats.avg)}</b>
                <span>Avg order</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ─── Monthly breakdown (this year) ─── */}
      <div className="db-card db-monthly-card">
        <div className="db-card-header">
          <div>
            <h3 className="db-card-heading">Monthly revenue · {new Date().getFullYear()}</h3>
            <p className="db-card-subheading">CALCULATED FROM ALL ORDERS, EXCLUDING CANCELLED / REJECTED</p>
          </div>
          <span className="db-range-label">Yearly total {money(periods[3].stats.revenue)}</span>
        </div>
        <div className="db-monthly-bars">
          {monthly.map((m, idx) => (
            <div className={`db-monthly-col ${idx === new Date().getMonth() ? 'is-current' : ''}`} key={m.label} title={`${m.label}: ${money(m.revenue)} · ${m.orders} orders`}>
              <span className="db-monthly-value">{m.revenue ? money(m.revenue) : ''}</span>
              <motion.div className="db-monthly-bar" initial={{ height: 0 }} animate={{ height: `${Math.max(m.pct, 2)}%` }} transition={{ delay: idx * 0.03, duration: 0.6 }} />
              <span className="db-monthly-label">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Filter deck ─── */}
      <AdminDataToolbar tools={tools}>
        <div className="db-filter-summary">
          <span>Filtered</span>
          <b>{filteredStats.count}</b> orders · <b>{money(filteredStats.revenue)}</b> revenue · avg <b>{money(filteredStats.avg)}</b>
        </div>
      </AdminDataToolbar>

      {/* ─── Top metrics (follow the filters) ─── */}
      <div className="db-metrics-grid">
        <div className="db-metric-card bg-sage">
          <div className="db-metric-header">
            <span className="db-metric-title">DELIVERED REVENUE</span>
          </div>
          <h2 className="db-metric-value">{metrics.deliveredRevenue.toFixed(2)}</h2>
          <span className="db-trend text-success">{tools.activeCount ? 'For the current filters' : metrics.deliveredRevenueTrend || 'vs last week'}</span>
        </div>

        <div className="db-metric-card">
          <div className="db-metric-header">
            <span className="db-metric-title">ACTIVE ORDERS</span>
          </div>
          <h2 className="db-metric-value">{metrics.activeOrders}</h2>
          <span className="db-trend text-success">Real-time cooking queue</span>
        </div>

        <div className="db-metric-card">
          <div className="db-metric-header">
            <span className="db-metric-title">VIP CUSTOMERS</span>
          </div>
          <h2 className="db-metric-value">{metrics.vipCustomers}</h2>
          <span className="db-trend text-success">Accumulating points</span>
        </div>

        <div className="db-metric-card">
          <div className="db-metric-header">
            <span className="db-metric-title">LOW STOCK MATERIALS</span>
          </div>
          <h2 className="db-metric-value">{metrics.lowStockMaterials}</h2>
          <span className="db-trend text-danger">Requires purchase orders</span>
        </div>
      </div>

      {/* ─── Main content ─── */}
      <div className="db-main-content">
        <div className="db-column-left">
          <div className="db-card db-revenue-card">
            <div className="db-card-header">
              <div>
                <h3 className="db-card-heading">Revenue Stream Analytics</h3>
                <p className="db-card-subheading">AGGREGATED TRANSACTION VALUES & CULINARY COMMISSION TRACKING</p>
              </div>
              <span className="db-range-label">{chartRange === 'weekly' ? 'Weekly' : 'Monthly'}</span>
            </div>

            <div className="db-revenue-meta">
              <div>
                <span className="db-meta-label">GROSS INTAKE</span>
                <h2 className="db-grand-total">{revenueSummary.grossIntake.toFixed(2)}</h2>
              </div>
              <span className="db-trend text-success text-right">{revenueSummary.trend || 'vs prev period'}</span>
            </div>

            <div className="db-chart-container">
              {revenueChart.map((point, idx) => (
                <div className="db-chart-column" key={idx}>
                  <div className="db-bar" style={{ height: `${point.value}%` }}></div>
                  <span className="db-bar-label">{point.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="db-card">
            <h3 className="db-card-heading">Active Promotions</h3>
            <p className="db-card-subheading">LIVE DISCOUNTS CUSTOMERS CAN REDEEM RIGHT NOW</p>
            {activePromotions.length === 0 ? (
              <div className="db-empty-pipeline">
                <p>No promotions are currently running.</p>
              </div>
            ) : (
              <div className="db-promo-list">
                {activePromotions.map((promo) => {
                  const remaining = promo.end_date ? getTimeRemaining(promo.end_date) : null;
                  return (
                    <div className="db-promo-item" key={promo.id}>
                      <div className="db-promo-item-top">
                        <span className="db-promo-name">{promo.name}</span>
                        <span className="db-promo-badge">
                          {promo.discount_type === 'PERCENT' ? `${promo.discount_value}% OFF` : `${promo.discount_value} OFF`}
                        </span>
                      </div>
                      {promo.description && <p className="db-promo-desc">{promo.description}</p>}
                      <div className="db-promo-meta">
                        {promo.min_order_value > 0 && <span>Min. order {promo.min_order_value.toFixed(2)}</span>}
                        {promo.end_date && (
                          <span>
                            {remaining && remaining.total > 0
                              ? `Ends in ${remaining.days > 0 ? `${remaining.days}d ` : ''}${remaining.hours}h ${remaining.minutes}m`
                              : `Ended ${formatEndDate(promo.end_date)}`}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="db-dual-grid">
            <div className="db-card">
              <h3 className="db-card-heading">Couriers & Transit Dispatch</h3>
              <p className="db-card-subheading">SUPERVISING LIVE DELIVERY ASSIGNMENTS AND STATUS CHANGES</p>
              <span className="db-section-tag text-uppercase">COURIERS ONLINE</span>
              <div className="db-badge-row">
                {onlineCouriers.map((name, idx) => (
                  <span className="db-courier-badge online" key={idx}>
                    {name} •
                  </span>
                ))}
              </div>
              <div className="db-dispatch-list">
                {dispatchOrders.length === 0 && <p className="db-muted">No orders in transit for these filters.</p>}
                {dispatchOrders.map((order, idx) => (
                  <div className="db-dispatch-item" key={idx}>
                    <div className="db-dispatch-row-top">
                      <span className="db-order-number">{order.orderNumber}</span>
                      <span className={`status-pill ${statusPillClass(order.status)}`}>{order.status}</span>
                    </div>
                    <p className="db-dispatch-address">To: {order.address}</p>
                    <p className={order.driverName ? 'db-assigned-driver' : 'db-unassigned-driver'}>
                      {order.driverName ? `Courier: ${order.driverName}` : 'Not yet assigned'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="db-card">
              <h3 className="db-card-heading">Loyalty Leaderboard</h3>
              <p className="db-card-subheading">RECOGNIZING OUR MOST FREQUENT GOURMET DINING ACCOUNTS</p>
              <div className="db-leaderboard-list">
                {leaderboard.map((entry) => (
                  <div className="db-leaderboard-item" key={entry.rank}>
                    <div className={`db-rank-num ${rankClass(entry.rank)}`}>{entry.rank}</div>
                    <div className="db-user-info">
                      <h4>{entry.name}</h4>
                      <p>{entry.email}</p>
                      <span>Joined {entry.joined}</span>
                    </div>
                    <span className="db-points-badge">{entry.points} PTS</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="db-column-right">
          <div className="db-card">
            <div className="db-card-header">
              <div>
                <h3 className="db-card-heading">Cooking Pipeline</h3>
                <p className="db-card-subheading">ORDERS CURRENTLY ON HOT-LINE RANGES OR PREP TABLES</p>
              </div>
              <span className="db-badge-pipeline">Prep Lab</span>
            </div>
            {kitchenOrders.length === 0 ? (
              <div className="db-empty-pipeline">
                <p>Hot plates clean. Kitchen board cleared!</p>
              </div>
            ) : (
              <div className="db-dispatch-list">
                {kitchenOrders.map((order, idx) => (
                  <div className="db-dispatch-item" key={idx}>
                    <span className="db-order-number">{order.orderNumber}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="db-card">
            <div className="db-card-header">
              <div>
                <h3 className="db-card-heading">Live Activity Stream</h3>
                <p className="db-card-subheading">MONITORING INCOMING PURCHASES, APPROVALS & PIPELINE SHIFTS</p>
              </div>
              <span className="db-activity-pulse">Active Stream</span>
            </div>
            <div className="db-activity-list">
              {activityOrders.length === 0 && <p className="db-muted">No orders match the current filters.</p>}
              {activityOrders.map((order, idx) => (
                <div className="db-activity-item" key={idx}>
                  <div className="db-activity-left">
                    <span className="db-order-number">{order.orderNumber}</span>
                    <p className="db-customer-name">{order.customerName}</p>
                  </div>
                  <div className="db-activity-center">
                    <span>{order.itemsCount} Items</span>
                    <p className="db-item-price">{order.price.toFixed(2)}</p>
                  </div>
                  <div className="db-activity-right">
                    <span className={`status-pill ${statusPillClass(order.status)}`}>{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;