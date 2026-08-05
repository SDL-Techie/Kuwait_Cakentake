import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  Truck,
  PackageCheck,
  ClipboardList,
  MapPin,
  Phone,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock3,
  ChevronDown,
  FileText,
  User,
  Loader2,
  Inbox,
  Camera,
  Wallet,
} from "lucide-react";

import {
  getDriverDashboard,
  getDriverAssigned,
  getDriverCompleted,
  getDriverReport,
  updateDriverStatus,
  driverAcceptOrder,
  driverRejectOrder,
  submitDeliveryProof,
  uploadOrderImage,
  getDriverSettlements,
  getUnsettledOrders,
  DriverAvailability,
  Settlement,
  SettlementListResponse,
} from "../../services/driverService";

import "./DriverDashboard.css";

// ─── Types ────────────────────────────────────────────────────────────────────

type DriverStatus = DriverAvailability;

interface Driver {
  driver_id?: number;
  id?: number;
  name?: string;
  first_name?: string;
  last_name?: string;
  vehicle_number?: string;
  phone_no?: string;
  status?: DriverStatus;
  availability_status?: DriverStatus;
  [key: string]: any;
}

interface DriverOrder {
  order_id?: number;
  id?: number;
  customer_name?: string;
  customer_phone?: string;
  address?: string;
  status?: string;
  total_amount?: number;
  amount?: number;
  created_at?: string;
  delivered_at?: string;
  accepted?: boolean;
  [key: string]: any;
}

interface DriverReport {
  driver_id?: number;
  period?: string;
  total_delivered?: number;
  [key: string]: any;
}

type TabKey = "assigned" | "completed" | "report" | "settlements";

const STATUS_OPTIONS: DriverStatus[] = ["ONLINE", "BUSY", "OFFLINE"];

// ─── Utility Functions ────────────────────────────────────────────────────────

function formatCurrency(v?: number, cur?: string) {
  if (v === undefined || v === null) return "—";
  const c = cur || (typeof window !== 'undefined' ? localStorage.getItem('currency') || 'INR' : 'INR');
  const sym = c === 'INR' ? '₹' : c;
  return `${sym}${v.toLocaleString(c === 'INR' ? 'en-IN' : 'en-US')}`;
}

function formatDate(v?: string | null) {
  if (!v) return "—";
  const d = new Date(v);
  if (isNaN(d.getTime())) return v;
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getOrderId(order: DriverOrder): number {
  return order.order_id || order.id || 0;
}

function getDriverStatus(driver: Driver | null): DriverStatus {
  if (!driver) return "OFFLINE";
  return (driver.status || driver.availability_status || "OFFLINE") as DriverStatus;
}

function getDriverName(driver: Driver | null): string {
  if (!driver) return "Driver";
  if (driver.name) return driver.name;
  return `${driver.first_name || ""} ${driver.last_name || ""}`.trim() || "Driver";
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DriverDashboard() {
  const params = useParams<{ driverId?: string }>();
  const rawId = params.driverId || localStorage.getItem("driver_id");
  const driverId = rawId ? Number(rawId) : 0;

  const [driver, setDriver] = useState<Driver | null>(null);
  const [stats, setStats] = useState<Record<string, any>>({});
  const [assigned, setAssigned] = useState<DriverOrder[]>([]);
  const [completed, setCompleted] = useState<DriverOrder[]>([]);
  const [report, setReport] = useState<DriverReport | null>(null);
  const [settlementData, setSettlementData] = useState<SettlementListResponse | null>(null);
  const [unsettledOrders, setUnsettledOrders] = useState<any[]>([]);

  const [tab, setTab] = useState<TabKey>("assigned");
  const [loading, setLoading] = useState(true);
  const [settlementsLoading, setSettlementsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  // per-order action state
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [deliveringId, setDeliveringId] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({});
  const [notesDraft, setNotesDraft] = useState<Record<number, string>>({});
  const [photoDraft, setPhotoDraft] = useState<Record<number, File | null>>({});

  const loadAll = useCallback(async () => {
    setError(null);
    try {
      const [dashboardRes, assignedRes, completedRes, reportRes] = await Promise.all([
        getDriverDashboard(driverId),
        getDriverAssigned(driverId),
        getDriverCompleted(driverId),
        getDriverReport(driverId).catch(() => null),
      ]);

      setDriver(dashboardRes?.driver ?? null);

      setStats({
        assigned_count: dashboardRes?.active ?? 0,
        completed_count: dashboardRes?.delivered ?? 0,
        total_deliveries: dashboardRes?.total_orders ?? 0,
        today_deliveries: dashboardRes?.today ?? 0,
        pending_amount: dashboardRes?.pending_amount ?? 0,
        total_earned: dashboardRes?.total_earned ?? 0,
        rating: dashboardRes?.rating ?? null,
      });

      setAssigned(assignedRes ?? []);
      setCompleted(completedRes ?? []);
      setReport(reportRes ?? null);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Couldn't load dashboard");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  const loadSettlements = useCallback(async () => {
    setSettlementsLoading(true);
    try {
      const [settlementsRes, unsettledRes] = await Promise.all([
        getDriverSettlements(driverId),
        getUnsettledOrders(driverId).catch(() => []),
      ]);
      setSettlementData(settlementsRes ?? null);
      setUnsettledOrders(unsettledRes?.orders ?? unsettledRes ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Couldn't load settlements");
      console.error(e);
    } finally {
      setSettlementsLoading(false);
    }
  }, [driverId]);

  useEffect(() => {
    if (!driverId) {
      setError("No driver selected.");
      setLoading(false);
      return;
    }
    loadAll();
  }, [driverId, loadAll]);

  useEffect(() => {
    if (driverId && tab === "settlements" && !settlementData) {
      loadSettlements();
    }
  }, [driverId, tab, settlementData, loadSettlements]);

  const handleStatusChange = async (status: DriverStatus) => {
    const currentStatus = getDriverStatus(driver);
    if (status === currentStatus) {
      setStatusMenuOpen(false);
      return;
    }

    setStatusUpdating(true);
    try {
      await updateDriverStatus(driverId, status);
      setDriver((prev) => (prev ? { ...prev, availability_status: status } : prev));
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Status update failed. Try again.");
      console.error("Status update error:", e);
    } finally {
      setStatusUpdating(false);
      setStatusMenuOpen(false);
    }
  };

  const handleAccept = async (order: DriverOrder) => {
    const orderId = getOrderId(order);
    setAcceptingId(orderId);
    try {
      await driverAcceptOrder(orderId);
      setAssigned((prev) =>
        prev.map((o) => (getOrderId(o) === orderId ? { ...o, accepted: true, status: "ACCEPTED" } : o))
      );
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Couldn't accept this order. Try again.");
      console.error("Accept error:", e);
    } finally {
      setAcceptingId(null);
    }
  };

  const handleReject = async (order: DriverOrder) => {
    const orderId = getOrderId(order);
    setRejectingId(orderId);
    try {
      await driverRejectOrder(orderId);
      setAssigned((prev) => prev.filter((o) => getOrderId(o) !== orderId));
      setStats((prev) => ({
        ...prev,
        assigned_count: Math.max((prev.assigned_count ?? 1) - 1, 0),
      }));
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Couldn't reject this order. Try again.");
      console.error("Reject error:", e);
    } finally {
      setRejectingId(null);
    }
  };

  const handleMarkDelivered = async (order: DriverOrder) => {
    const orderId = getOrderId(order);
    setDeliveringId(orderId);
    try {
      let photoUrl: string | undefined;
      const file = photoDraft[orderId];

      if (file) {
        photoUrl = await uploadOrderImage(orderId, file, (progress) => {
          setUploadProgress((prev) => ({ ...prev, [orderId]: progress }));
        });
      }

      await submitDeliveryProof(orderId, {
        delivery_photo: photoUrl,
        delivery_notes: notesDraft[orderId],
        customer_confirmation_name: order.customer_name,
        customer_confirmation_phone: order.customer_phone,
      });

      setAssigned((prev) => prev.filter((o) => getOrderId(o) !== orderId));
      setCompleted((prev) => [
        {
          ...order,
          status: "DELIVERED",
          delivered_at: new Date().toISOString(),
        },
        ...prev,
      ]);

      setStats((prev) => ({
        ...prev,
        assigned_count: Math.max((prev.assigned_count ?? 1) - 1, 0),
        completed_count: (prev.completed_count ?? 0) + 1,
      }));

      setNotesDraft((prev) => ({ ...prev, [orderId]: "" }));
      setPhotoDraft((prev) => ({ ...prev, [orderId]: null }));
      setUploadProgress((prev) => ({ ...prev, [orderId]: 0 }));
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Couldn't mark this order as delivered. Try again.");
      console.error("Delivery error:", e);
    } finally {
      setDeliveringId(null);
    }
  };

  const initials = useMemo(() => {
    const name = getDriverName(driver);
    return (
      name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase() || "DR"
    );
  }, [driver]);

  const driverStatus = getDriverStatus(driver);
  const driverName = getDriverName(driver);

  if (loading) {
    return (
      <div className="dd-loading">
        <Loader2 className="dd-spin" size={20} />
        <span>Loading dashboard…</span>
      </div>
    );
  }

  return (
    <div className="dd-page">
      <div className="dd-container">
        {/* Header */}
        <div className="dd-header">
          <div className="dd-header-left">
            <div className="dd-avatar">{initials}</div>
            <div>
              <h1 className="dd-title">{driverName}</h1>
              <p className="dd-subtitle">
                <Truck size={14} />
                {driver?.vehicle_number ?? "No vehicle on file"}
              </p>
            </div>
          </div>

          <div className="dd-header-right">
            <button className="dd-btn dd-btn-ghost" onClick={loadAll}>
              <RefreshCw size={16} />
              Refresh
            </button>

            <div className="dd-status-wrap">
              <button
                className={`dd-status-pill dd-status-${driverStatus.toLowerCase()}`}
                onClick={() => setStatusMenuOpen((o) => !o)}
                disabled={statusUpdating}
              >
                <span className="dd-status-dot" />
                {statusUpdating ? "Updating…" : driverStatus}
                <ChevronDown size={14} />
              </button>

              {statusMenuOpen && (
                <div className="dd-status-menu">
                  {STATUS_OPTIONS.map((s) => (
                    <button key={s} className="dd-status-menu-item" onClick={() => handleStatusChange(s)}>
                      <span className={`dd-status-dot dd-dot-${s.toLowerCase()}`} />
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {error && <div className="dd-error">{error}</div>}

        {/* Stat cards */}
        <div className="dd-stats">
          <StatCard icon={<ClipboardList size={16} />} label="Assigned" value={stats.assigned_count ?? assigned.length} />
          <StatCard icon={<PackageCheck size={16} />} label="Completed" value={stats.completed_count ?? completed.length} />
          <StatCard icon={<Truck size={16} />} label="Total deliveries" value={stats.total_deliveries ?? report?.total_delivered ?? "—"} />
          <StatCard icon={<Clock3 size={16} />} label="Today" value={stats.today_deliveries ?? "—"} />
          <StatCard icon={<Wallet size={16} />} label="Pending payout" value={formatCurrency(stats.pending_amount)} />
        </div>

        {/* Tabs */}
        <div className="dd-tabs">
          <TabButton active={tab === "assigned"} onClick={() => setTab("assigned")}>
            Assigned ({assigned.length})
          </TabButton>
          <TabButton active={tab === "completed"} onClick={() => setTab("completed")}>
            Completed ({completed.length})
          </TabButton>
          <TabButton active={tab === "report"} onClick={() => setTab("report")}>
            Report
          </TabButton>
          <TabButton active={tab === "settlements"} onClick={() => setTab("settlements")}>
            Settlements
          </TabButton>
        </div>

        {/* Tab content */}
        {tab === "assigned" && (
          <OrderList
            orders={assigned}
            emptyText="No orders assigned right now."
            renderAction={(order) => {
              const orderId = getOrderId(order);
              const isAccepted = order.accepted || order.status === "ACCEPTED";

              if (!isAccepted) {
                return (
                  <div className="dd-order-actions">
                    <button
                      className="dd-btn dd-btn-primary"
                      onClick={() => handleAccept(order)}
                      disabled={acceptingId === orderId || rejectingId === orderId}
                    >
                      {acceptingId === orderId ? <Loader2 size={14} className="dd-spin" /> : <CheckCircle2 size={14} />}
                      Accept
                    </button>
                    <button
                      className="dd-btn dd-btn-danger"
                      onClick={() => handleReject(order)}
                      disabled={acceptingId === orderId || rejectingId === orderId}
                    >
                      {rejectingId === orderId ? <Loader2 size={14} className="dd-spin" /> : <XCircle size={14} />}
                      Reject
                    </button>
                  </div>
                );
              }

              return (
                <DeliveryProofForm
                  order={order}
                  notes={notesDraft[orderId] ?? ""}
                  photo={photoDraft[orderId] ?? null}
                  progress={uploadProgress[orderId] ?? 0}
                  isSubmitting={deliveringId === orderId}
                  onNotesChange={(v) => setNotesDraft((prev) => ({ ...prev, [orderId]: v }))}
                  onPhotoChange={(f) => setPhotoDraft((prev) => ({ ...prev, [orderId]: f }))}
                  onSubmit={() => handleMarkDelivered(order)}
                />
              );
            }}
          />
        )}

        {tab === "completed" && (
          <OrderList
            orders={completed}
            emptyText="No completed deliveries yet."
            renderAction={(order) => (
              <span className="dd-completed-tag">
                <CheckCircle2 size={14} />
                {formatDate(order.delivered_at)}
              </span>
            )}
          />
        )}

        {tab === "report" && <ReportPanel report={report} driver={driver} />}

        {tab === "settlements" && (
          <SettlementsPanel
            loading={settlementsLoading}
            data={settlementData}
            unsettledOrders={unsettledOrders}
            onRefresh={loadSettlements}
          />
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="dd-stat-card">
      <div className="dd-stat-label">
        {icon}
        <span>{label}</span>
      </div>
      <div className="dd-stat-value">{value}</div>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button className={`dd-tab-btn ${active ? "dd-tab-active" : ""}`} onClick={onClick}>
      {children}
    </button>
  );
}

function OrderList({
  orders,
  emptyText,
  renderAction,
}: {
  orders: DriverOrder[];
  emptyText: string;
  renderAction: (order: DriverOrder) => React.ReactNode;
}) {
  if (orders.length === 0) {
    return (
      <div className="dd-empty">
        <Inbox size={22} />
        <p>{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="dd-order-list">
      {orders.map((order) => {
        const orderId = getOrderId(order);
        return (
          <div key={orderId || `temp-${Math.random()}`} className="dd-order-card">
            <div className="dd-order-left">
              <div className="dd-order-icon">
                <User size={16} />
              </div>
              <div>
                <p className="dd-order-title">
                  Order #{orderId}
                  {order.customer_name ? ` · ${order.customer_name}` : ""}
                </p>
                <div className="dd-order-meta">
                  {order.address && (
                    <span>
                      <MapPin size={13} />
                      {order.address}
                    </span>
                  )}
                  {order.customer_phone && (
                    <span>
                      <Phone size={13} />
                      {order.customer_phone}
                    </span>
                  )}
                  {(order.total_amount !== undefined || order.amount !== undefined) && (
                    <span>{formatCurrency(order.total_amount ?? order.amount)}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="dd-order-action">{renderAction(order)}</div>
          </div>
        );
      })}
    </div>
  );
}

function DeliveryProofForm({
  order,
  notes,
  photo,
  progress,
  isSubmitting,
  onNotesChange,
  onPhotoChange,
  onSubmit,
}: {
  order: DriverOrder;
  notes: string;
  photo: File | null;
  progress: number;
  isSubmitting: boolean;
  onNotesChange: (v: string) => void;
  onPhotoChange: (f: File | null) => void;
  onSubmit: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="dd-proof-form">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={(e) => onPhotoChange(e.target.files?.[0] ?? null)}
      />
      <button className="dd-btn dd-btn-ghost dd-btn-sm" onClick={() => fileInputRef.current?.click()} disabled={isSubmitting}>
        <Camera size={14} />
        {photo ? photo.name.slice(0, 14) : "Add photo"}
      </button>

      <input
        className="dd-notes-input"
        type="text"
        placeholder="Delivery notes (optional)"
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        disabled={isSubmitting}
      />

      <button className="dd-btn dd-btn-primary" onClick={onSubmit} disabled={isSubmitting}>
        {isSubmitting ? <Loader2 size={14} className="dd-spin" /> : <CheckCircle2 size={14} />}
        {isSubmitting && progress > 0 && progress < 100 ? `Uploading ${progress}%` : "Mark delivered"}
      </button>
    </div>
  );
}

function ReportPanel({ report, driver }: { report: DriverReport | null; driver: Driver | null }) {
  if (!report) {
    return (
      <div className="dd-empty">
        <FileText size={22} />
        <p>Report isn't available yet.</p>
      </div>
    );
  }

  const entries = Object.entries(report).filter(([key]) => key !== "driver_id");

  return (
    <div className="dd-report-card">
      <p className="dd-report-subtitle">
        Performance summary{driver?.name ? ` for ${getDriverName(driver)}` : ""}
        {report.period ? ` · ${report.period}` : ""}
      </p>
      <div className="dd-report-grid">
        {entries.map(([key, value]) => (
          <div key={key} className="dd-report-item">
            <p className="dd-report-key">{key.replace(/_/g, " ")}</p>
            <p className="dd-report-value">{typeof value === "number" ? value.toLocaleString("en-IN") : String(value)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettlementsPanel({
  loading,
  data,
  unsettledOrders,
  onRefresh,
}: {
  loading: boolean;
  data: SettlementListResponse | null;
  unsettledOrders: any[];
  onRefresh: () => void;
}) {
  if (loading) {
    return (
      <div className="dd-loading">
        <Loader2 className="dd-spin" size={20} />
        <span>Loading settlements…</span>
      </div>
    );
  }

  const settlements: Settlement[] = data?.settlements ?? [];

  return (
    <div className="dd-settlements">
      <div className="dd-settlements-summary">
        <StatCard icon={<Wallet size={16} />} label="Pending payout" value={formatCurrency(data?.total_pending)} />
        <StatCard icon={<CheckCircle2 size={16} />} label="Total paid" value={formatCurrency(data?.total_paid)} />
        <StatCard icon={<PackageCheck size={16} />} label="Orders settled" value={data?.orders_settled ?? 0} />
        <button className="dd-btn dd-btn-ghost" onClick={onRefresh}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {unsettledOrders.length > 0 && (
        <div className="dd-unsettled-card">
          <p className="dd-report-subtitle">Unsettled delivered orders ({unsettledOrders.length})</p>
        </div>
      )}

      {settlements.length === 0 ? (
        <div className="dd-empty">
          <Wallet size={22} />
          <p>No settlements yet.</p>
        </div>
      ) : (
        <div className="dd-order-list">
          {settlements.map((s) => (
            <div key={s.id} className="dd-order-card">
              <div className="dd-order-left">
                <div className="dd-order-icon">
                  <Wallet size={16} />
                </div>
                <div>
                  <p className="dd-order-title">
                    Settlement #{s.id} · {formatCurrency(s.amount)}
                  </p>
                  <div className="dd-order-meta">
                    <span>{s.orders_count} orders</span>
                    <span>
                      {formatDate(s.period_start)} – {formatDate(s.period_end)}
                    </span>
                    {s.reference && <span>Ref: {s.reference}</span>}
                  </div>
                </div>
              </div>
              <div className="dd-order-action">
                <span className={`dd-completed-tag ${s.status === "PAID" ? "" : "dd-status-busy"}`}>
                  {s.status === "PAID" ? <CheckCircle2 size={14} /> : <Clock3 size={14} />}
                  {s.status === "PAID" ? formatDate(s.paid_at) : "Pending"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}