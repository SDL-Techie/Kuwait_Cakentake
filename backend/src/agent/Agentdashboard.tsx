import React, { useEffect, useState, useCallback } from "react";
import {
  getAgentDashboard,
  AgentDashboard as AgentDashboardData,
} from "../services/agentService"; 
import "./Agentdashboard.css";

/* ─────────────────────────────────────────────────────────────────────────
 * NOTE ON DATA SHAPE
 * ─────────────────────────────────────────────────────────────────────────
 * GET /agent/dashboard (agentService.getAgentDashboard) returns:
 *   agent, todays_orders, todays_revenue, pending_orders, completed_orders,
 *   cancelled_orders, total_orders, total_revenue, total_customers,
 *   recent_orders (Order.to_dict()[] — untyped `any[]` in the service).
 * recent_orders fields are accessed defensively below since the exact
 * Order.to_dict() shape isn't in scope here. Adjust field names
 * (order_number / status / grand_total / customer_name / created_at) if
 * they differ from your actual Order serializer.
 * ───────────────────────────────────────────────────────────────────────── */

const STATUS_CLASS_MAP: Record<string, string> = {
  PENDING: "status-pending",
  CONFIRMED: "status-confirmed",
  PREPARING: "status-preparing",
  OUT_FOR_DELIVERY: "status-out-for-delivery",
  DELIVERED: "status-delivered",
  CANCELLED: "status-cancelled",
  REJECTED: "status-cancelled",
};

function formatCurrency(amount: number, currency: string = "KWD"): string {
  const decimals = currency === "KWD" ? 3 : 2;
  return `${currency} ${Number(amount || 0).toFixed(decimals)}`;
}

function formatDate(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatCard({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: string | number;
  variant?: "default" | "positive" | "warning" | "negative";
}): React.JSX.Element {
  return (
    <div className={`agent-dashboard-stat-card agent-dashboard-stat-card--${variant}`}>
      <span className="agent-dashboard-stat-label">{label}</span>
      <span className="agent-dashboard-stat-value">{value}</span>
    </div>
  );
}

export default function AgentDashboard(): React.JSX.Element {
  const [data, setData] = useState<AgentDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const dashboard = await getAgentDashboard();
      setData(dashboard);
    } catch (err) {
      console.error("Failed to load agent dashboard:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="agent-dashboard-page">
        <div className="agent-dashboard-status">
          <div className="agent-dashboard-spinner" aria-hidden="true" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="agent-dashboard-page">
        <div className="agent-dashboard-status agent-dashboard-status--error">
          <p>Unable to load dashboard.</p>
          <p>Please try again later.</p>
          <button className="agent-dashboard-retry-btn" onClick={fetchDashboard}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const currency = (data.agent?.currency_code as string) || "KWD";
  const agentName = `${data.agent?.first_name ?? ""} ${data.agent?.last_name ?? ""}`.trim();

  return (
    <div className="agent-dashboard-page">
      <header className="agent-dashboard-header">
        <div>
          <h1 className="agent-dashboard-heading">Welcome back{agentName ? `, ${agentName}` : ""}</h1>
          <p className="agent-dashboard-subheading">
            Here&apos;s how your orders are performing today.
          </p>
        </div>
        <div className="agent-dashboard-discount-badge">
          Default discount: {Number(data.agent?.default_discount ?? 0)}%
        </div>
      </header>

      {/* Today's snapshot */}
      <section className="agent-dashboard-section">
        <h2 className="agent-dashboard-section-title">Today</h2>
        <div className="agent-dashboard-stats-grid">
          <StatCard label="Today's Orders" value={data.todays_orders} />
          <StatCard
            label="Today's Revenue"
            value={formatCurrency(data.todays_revenue, currency)}
            variant="positive"
          />
        </div>
      </section>

      {/* Overall snapshot */}
      <section className="agent-dashboard-section">
        <h2 className="agent-dashboard-section-title">Overall</h2>
        <div className="agent-dashboard-stats-grid">
          <StatCard label="Total Orders" value={data.total_orders} />
          <StatCard
            label="Total Revenue"
            value={formatCurrency(data.total_revenue, currency)}
            variant="positive"
          />
          <StatCard label="Pending Orders" value={data.pending_orders} variant="warning" />
          <StatCard label="Completed Orders" value={data.completed_orders} variant="positive" />
          <StatCard label="Cancelled Orders" value={data.cancelled_orders} variant="negative" />
          <StatCard label="Total Customers" value={data.total_customers} />
        </div>
      </section>

      {/* Recent orders */}
      <section className="agent-dashboard-section">
        <h2 className="agent-dashboard-section-title">Recent Orders</h2>

        {(!data.recent_orders || data.recent_orders.length === 0) ? (
          <div className="agent-dashboard-empty">No orders yet.</div>
        ) : (
          <div className="agent-dashboard-table-wrapper">
            <table className="agent-dashboard-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Placed On</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_orders.map((order: any) => {
                  const statusClass =
                    STATUS_CLASS_MAP[String(order?.status).toUpperCase()] || "status-default";
                  return (
                    <tr key={order?.id ?? order?.order_number}>
                      <td>{order?.order_number ?? "—"}</td>
                      <td>{order?.customer_name ?? "—"}</td>
                      <td>
                        <span className={`agent-dashboard-status-pill ${statusClass}`}>
                          {order?.status ?? "—"}
                        </span>
                      </td>
                      <td>{formatCurrency(order?.grand_total ?? 0, order?.currency || currency)}</td>
                      <td>{formatDate(order?.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}