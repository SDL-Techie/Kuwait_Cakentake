import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import {
  getManagerDashboard,
  getManagerCards,
  getRevenueChart,
} from "../../services/dashboardService";
import { getOrders } from "../../services/orderService";
import { getActivePromotions, Promotion } from "../../services/productService";

/* ─────────────────────────────────────────────────────────────
   NOTE ON ASSUMPTIONS
   - dashboardService's exact field names are still unverified, so
     it's kept only for the metrics that have no equivalent in
     orderService / productService: revenue chart, revenue trend
     text, VIP customers, low stock materials, and the loyalty
     leaderboard.
   - "Active Orders", "Cooking Pipeline", "Couriers & Transit
     Dispatch" and "Live Activity Stream" are now driven directly
     by GET /orders via orderService.getOrders(), since that's a
     documented, real endpoint. The exact shape of an order object
     coming back from the backend isn't specified anywhere either
     (all orderService methods type it as `any`), so it's read
     defensively below with `?.` and several fallback field names.
     If your backend uses different keys, adjust the constants in
     ORDER_STATUS and the paths inside mapOrder...() — the JSX is
     untouched.
   - "Active Promotions" is a brand-new card, fed by
     productService.getActivePromotions() (a real, documented,
     public endpoint).
   ───────────────────────────────────────────────────────────── */

// Adjust these if your backend uses different status strings.
const ORDER_STATUS = {
  terminal: ['DELIVERED', 'CANCELLED', 'REJECTED'],
  kitchen: ['ASSIGNED_TO_KITCHEN', 'IN_PREPARATION'],
  dispatch: ['ASSIGNED_TO_AGENT', 'ASSIGNED_TO_DRIVER', 'DRIVER_ACCEPTED', 'OUT_FOR_DELIVERY', 'DELIVERY_SUBMITTED'],
  delivered: ['DELIVERED'],
};

interface MetricCards {
  deliveredRevenue: number;
  deliveredRevenueTrend: string;
  activeOrders: number;
  vipCustomers: number;
  lowStockMaterials: number;
}

interface RevenueChartPoint {
  label: string;
  value: number; // 0-100 (already normalized) or raw revenue
}

interface RevenueSummary {
  grossIntake: number;
  trend: string;
}

interface DispatchOrder {
  orderNumber: string;
  status: string;
  address: string;
  driverName?: string;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  email: string;
  joined: string;
  points: number;
}

interface ActivityOrder {
  orderNumber: string;
  customerName: string;
  itemsCount: number;
  price: number;
  status: string;
}

interface KitchenOrder {
  orderNumber: string;
}

// ── Promotion countdown helper (same pattern used on Product pages) ──
const getTimeRemaining = (endDate: string) => {
  const total = new Date(endDate).getTime() - new Date().getTime();
  if (total <= 0) return { total: 0, days: 0, hours: 0, minutes: 0 };
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  return { total, days, hours, minutes };
};

const formatEndDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

const isPromotionLive = (promo: Promotion): boolean => {
  if (!promo.is_active || !promo.end_date) return false;
  const now = new Date().getTime();
  const end = new Date(promo.end_date).getTime();
  const start = promo.start_date ? new Date(promo.start_date).getTime() : -Infinity;
  return now >= start && now <= end;
};

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [metrics, setMetrics] = useState<MetricCards | null>(null);
  const [revenueSummary, setRevenueSummary] = useState<RevenueSummary | null>(null);
  const [revenueChart, setRevenueChart] = useState<RevenueChartPoint[]>([]);
  const [dispatchOrders, setDispatchOrders] = useState<DispatchOrder[]>([]);
  const [onlineCouriers, setOnlineCouriers] = useState<string[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [kitchenOrders, setKitchenOrders] = useState<KitchenOrder[]>([]);
  const [activityOrders, setActivityOrders] = useState<ActivityOrder[]>([]);
  const [activePromotions, setActivePromotions] = useState<Promotion[]>([]);
  const [chartRange, setChartRange] = useState<'weekly' | 'monthly'>('weekly');

  // tick every minute so promo countdowns stay fresh without a full refetch
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

      const [managerDash, managerCards, revChart, orders, promotions] = await Promise.all([
        getManagerDashboard(),
        getManagerCards(),
        getRevenueChart(days),
        getOrders(),
        getActivePromotions(),
      ]);

      const ordersList = Array.isArray(orders) ? orders : [];

      setRevenueSummary(mapRevenueSummary(managerDash));
      setRevenueChart(mapRevenueChart(revChart));
      setOnlineCouriers(mapOnlineCouriers(managerDash));
      setLeaderboard(mapLeaderboard(managerDash));

      setMetrics(mapMetricCards(managerCards, ordersList));
      setDispatchOrders(mapDispatchOrders(ordersList));
      setKitchenOrders(mapKitchenOrders(ordersList));
      setActivityOrders(mapActivityOrders(ordersList));
      setActivePromotions((promotions || []).filter(isPromotionLive));
    } catch (err: any) {
      console.error('Failed to load dashboard data', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ───────── mapping helpers (adjust keys to match your API) ───────── */

  // Revenue trend / VIP customers / low stock materials have no equivalent
  // in orderService or productService, so these still come from
  // dashboardService's getManagerCards(). Active Orders now comes from the
  // real order list instead.
  const mapMetricCards = (data: any, orders: any[]): MetricCards => ({
    deliveredRevenue:
      orders
        .filter((o) => ORDER_STATUS.delivered.includes(getOrderStatus(o)))
        .reduce((sum, o) => sum + (getOrderTotal(o) || 0), 0) || (data?.delivered_revenue ?? 0),
    deliveredRevenueTrend: data?.delivered_revenue_trend ?? '',
    activeOrders: orders.filter((o) => !ORDER_STATUS.terminal.includes(getOrderStatus(o))).length,
    vipCustomers: data?.vip_customers ?? 0,
    lowStockMaterials: data?.low_stock_materials ?? 0,
  });

  const mapRevenueSummary = (data: any): RevenueSummary => ({
    grossIntake: data?.gross_intake ?? 0,
    trend: data?.revenue_trend ?? '',
  });

  const mapRevenueChart = (data: any): RevenueChartPoint[] => {
    const points = data?.chart ?? data?.data ?? [];
    if (!Array.isArray(points)) return [];
    const max = Math.max(...points.map((p: any) => p.revenue ?? p.value ?? 0), 1);
    return points.map((p: any) => ({
      label: p.label ?? p.day ?? '',
      value: Math.round(((p.revenue ?? p.value ?? 0) / max) * 100),
    }));
  };

  const mapOnlineCouriers = (data: any): string[] => {
    const couriers = data?.online_couriers ?? [];
    return Array.isArray(couriers) ? couriers.map((c: any) => c.name ?? c) : [];
  };

  const mapLeaderboard = (data: any): LeaderboardEntry[] => {
    const entries = data?.loyalty_leaderboard ?? [];
    return Array.isArray(entries)
      ? entries.map((e: any, idx: number) => ({
          rank: e.rank ?? idx + 1,
          name: e.name,
          email: e.email,
          joined: e.joined ?? e.joined_date,
          points: e.points,
        }))
      : [];
  };

  // ── Defensive order field readers (backend order shape is untyped) ──
  const getOrderStatus = (o: any): string => (o?.status ?? '').toString().toUpperCase();
  const getOrderNumber = (o: any): string => o?.order_number ?? o?.orderNumber ?? `#${o?.id ?? '—'}`;
  const getOrderTotal = (o: any): number =>
    Number(o?.total ?? o?.grand_total ?? o?.amount ?? o?.total_amount ?? 0);
  const getOrderCustomerName = (o: any): string =>
    o?.customer_name ?? o?.customer?.name ?? o?.customer?.full_name ?? 'Guest';
  const getOrderItemsCount = (o: any): number =>
    o?.items_count ?? (Array.isArray(o?.items) ? o.items.length : 0);
  const getOrderAddress = (o: any): string => {
    const addr = o?.address ?? o?.delivery_address;
    if (!addr) return o?.address_line1 ?? '—';
    if (typeof addr === 'string') return addr;
    return [addr.address_line1 ?? addr.line1, addr.city].filter(Boolean).join(', ') || '—';
  };
  const getOrderDriverName = (o: any): string | undefined =>
    o?.driver_name ?? o?.driver?.name ?? o?.driver?.full_name ?? undefined;
  const getOrderCreatedAt = (o: any): number => {
    const t = o?.created_at ?? o?.createdAt;
    return t ? new Date(t).getTime() : 0;
  };

  const mapDispatchOrders = (orders: any[]): DispatchOrder[] =>
    orders
      .filter((o) => ORDER_STATUS.dispatch.includes(getOrderStatus(o)))
      .map((o) => ({
        orderNumber: getOrderNumber(o),
        status: getOrderStatus(o),
        address: getOrderAddress(o),
        driverName: getOrderDriverName(o),
      }));

  const mapKitchenOrders = (orders: any[]): KitchenOrder[] =>
    orders
      .filter((o) => ORDER_STATUS.kitchen.includes(getOrderStatus(o)))
      .map((o) => ({ orderNumber: getOrderNumber(o) }));

  const mapActivityOrders = (orders: any[]): ActivityOrder[] =>
    [...orders]
      .sort((a, b) => getOrderCreatedAt(b) - getOrderCreatedAt(a))
      .slice(0, 8)
      .map((o) => ({
        orderNumber: getOrderNumber(o),
        customerName: getOrderCustomerName(o),
        itemsCount: getOrderItemsCount(o),
        price: getOrderTotal(o),
        status: getOrderStatus(o),
      }));

  const rankClass = (rank: number) => (rank === 1 ? 'gold' : rank === 2 ? 'silver' : 'bronze');
  const statusPillClass = (status: string) => status.toLowerCase().replace(/\s+/g, '');

  if (loading) {
    return (
      <div className="db-container">
        <p>Loading dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="db-container">
        <p>{error}</p>
        <button onClick={() => fetchAll(chartRange)}>Retry</button>
      </div>
    );
  }

  return (
    <div className="db-container">

      {/* ─── Top Metrics Grid ─── */}
      <div className="db-metrics-grid">
        <div className="db-metric-card bg-sage">
          <div className="db-metric-header">
            <span className="db-metric-title">DELIVERED REVENUE</span>
            <span className="db-metric-icon">💵</span>
          </div>
          <h2 className="db-metric-value">{metrics?.deliveredRevenue.toFixed(2)}</h2>
          <span className="db-trend text-success">↑ {metrics?.deliveredRevenueTrend || 'vs last week'}</span>
        </div>

        <div className="db-metric-card">
          <div className="db-metric-header">
            <span className="db-metric-title">ACTIVE ORDERS</span>
            <span className="db-metric-icon">🛒</span>
          </div>
          <h2 className="db-metric-value">{metrics?.activeOrders}</h2>
          <span className="db-trend text-success">↑ Real-time cooking queue</span>
        </div>

        <div className="db-metric-card">
          <div className="db-metric-header">
            <span className="db-metric-title">VIP CUSTOMERS</span>
            <span className="db-metric-icon">👥</span>
          </div>
          <h2 className="db-metric-value">{metrics?.vipCustomers}</h2>
          <span className="db-trend text-success">↑ Accumulating points</span>
        </div>

        <div className="db-metric-card">
          <div className="db-metric-header">
            <span className="db-metric-title">LOW STOCK MATERIALS</span>
            <span className="db-metric-icon">⚠️</span>
          </div>
          <h2 className="db-metric-value">{metrics?.lowStockMaterials}</h2>
          <span className="db-trend text-danger">↓ Requires purchase orders</span>
        </div>
      </div>

      {/* ─── Main Content Split Dashboard Body ─── */}
      <div className="db-main-content">

        {/* Left Column blocks */}
        <div className="db-column-left">

          {/* Revenue Stream Analytics Card */}
          <div className="db-card db-revenue-card">
            <div className="db-card-header">
              <div>
                <h3 className="db-card-heading">Revenue Stream Analytics</h3>
                <p className="db-card-subheading">AGGREGATED TRANSACTION VALUES & CULINARY COMMISSION TRACKING</p>
              </div>
              <div className="db-toggle-buttons">
                <button
                  className={`db-btn-toggle ${chartRange === 'weekly' ? 'active' : ''}`}
                  onClick={() => setChartRange('weekly')}
                >
                  Weekly
                </button>
                <button
                  className={`db-btn-toggle ${chartRange === 'monthly' ? 'active' : ''}`}
                  onClick={() => setChartRange('monthly')}
                >
                  Monthly
                </button>
              </div>
            </div>

            <div className="db-revenue-meta">
              <div>
                <span className="db-meta-label">GROSS INTAKE</span>
                <h2 className="db-grand-total">{revenueSummary?.grossIntake.toFixed(2)}</h2>
              </div>
              <span className="db-trend text-success text-right">📈 {revenueSummary?.trend || 'vs prev period'}</span>
            </div>

            {/* Chart Bar Columns — now driven by getRevenueChart() */}
            <div className="db-chart-container">
              {revenueChart.map((point, idx) => (
                <div className="db-chart-column" key={idx}>
                  <div className="db-bar" style={{ height: `${point.value}%` }}></div>
                  <span className="db-bar-label">{point.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Active Promotions Card (new — driven by productService.getActivePromotions()) ─── */}
          <div className="db-card">
            <h3 className="db-card-heading">Active Promotions</h3>
            <p className="db-card-subheading">LIVE DISCOUNTS CUSTOMERS CAN REDEEM RIGHT NOW</p>

            {activePromotions.length === 0 ? (
              <div className="db-empty-pipeline">
                <span className="db-check-icon">—</span>
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
                          {promo.discount_type === 'PERCENT'
                            ? `${promo.discount_value}% OFF`
                            : `${promo.discount_value} OFF`}
                        </span>
                      </div>
                      {promo.description && <p className="db-promo-desc">{promo.description}</p>}
                      <div className="db-promo-meta">
                        {promo.min_order_value > 0 && (
                          <span>Min. order {promo.min_order_value.toFixed(2)}</span>
                        )}
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

          {/* Dual Bottom Grid: Couriers & Loyalty Leaderboard */}
          <div className="db-dual-grid">

            {/* Couriers & Transit Dispatch */}
            <div className="db-card">
              <h3 className="db-card-heading">Couriers & Transit Dispatch</h3>
              <p className="db-card-subheading">SUPERVISING LIVE DELIVERY ASSIGNMENTS AND STATUS CHANGES</p>

              <span className="db-section-tag text-uppercase">COURIERS ONLINE</span>
              <div className="db-badge-row">
                {onlineCouriers.map((name, idx) => (
                  <span className="db-courier-badge online" key={idx}>🛵 {name} •</span>
                ))}
              </div>

              <div className="db-dispatch-list">
                {dispatchOrders.map((order, idx) => (
                  <div className="db-dispatch-item" key={idx}>
                    <div className="db-dispatch-row-top">
                      <span className="db-order-number">{order.orderNumber}</span>
                      <span className={`status-pill ${statusPillClass(order.status)}`}>{order.status}</span>
                    </div>
                    <p className="db-dispatch-address">To: {order.address}</p>
                    {order.driverName ? (
                      <p className="db-assigned-driver">✓ Courier: {order.driverName}</p>
                    ) : (
                      <button className="db-btn-assign">➕ Assign Courier</button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Loyalty Leaderboard */}
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
                    <span className="db-points-badge">🏆 {entry.points} PTS</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right Column blocks */}
        <div className="db-column-right">

          {/* Cooking Pipeline Card */}
          <div className="db-card">
            <div className="db-card-header">
              <div>
                <h3 className="db-card-heading">Cooking Pipeline</h3>
                <p className="db-card-subheading">ORDERS CURRENTLY ON HOT-LINE RANGES OR PREP TABLES</p>
              </div>
              <span className="db-badge-pipeline">🍳 Prep Lab</span>
            </div>
            {kitchenOrders.length === 0 ? (
              <div className="db-empty-pipeline">
                <span className="db-check-icon">✓</span>
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

          {/* Live Activity Stream Card */}
          <div className="db-card">
            <div className="db-card-header">
              <div>
                <h3 className="db-card-heading">Live Activity Stream</h3>
                <p className="db-card-subheading">MONITORING INCOMING PURCHASES, APPROVALS & PIPELINE SHIFTS</p>
              </div>
              <span className="db-activity-pulse">🟢 Active Stream</span>
            </div>

            <div className="db-activity-list">
              {activityOrders.map((order, idx) => (
                <div className="db-activity-item" key={idx}>
                  <div className="db-activity-left">
                    <span className="db-order-number">{order.orderNumber}</span>
                    <p className="db-customer-name">{order.customerName}</p>
                  </div>
                  <div className="db-activity-center">
                    <span>{order.itemsCount} Items</span>
                    <p className="db-item-price">${order.price.toFixed(2)}</p>
                  </div>
                  <div className="db-activity-right">
                    <span className={`status-pill ${statusPillClass(order.status)}`}>{order.status}</span>
                    <button className="db-btn-view">👁</button>
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