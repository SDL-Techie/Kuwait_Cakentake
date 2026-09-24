import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  Clipboard,
  CreditCard,
  Home,
  PackageCheck,
  ReceiptText,
  RefreshCw,
  Truck,
} from "lucide-react";

import { getOrderById } from "../../services/orderService";
import "./PaymentResult.css";

const upper = (value: unknown) => String(value ?? "").trim().toUpperCase();
const pretty = (value: unknown) =>
  String(value ?? "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const money = (value: unknown, currency = "KWD") => {
  const decimals = ["KWD", "BHD", "JOD", "OMR"].includes(upper(currency)) ? 3 : 2;
  return `${upper(currency) || "KWD"} ${Number(value || 0).toFixed(decimals)}`;
};

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { transactionId: routeTransactionId } = useParams<{ transactionId?: string }>();
  const [params] = useSearchParams();
  const orderId = Number(params.get("order_id") || 0);

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(Boolean(orderId));
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const loadOrder = useCallback(async () => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const value = await getOrderById(orderId);
      setOrder(value?.order ?? value);
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          "Unable to load the latest order details."
      );
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  const paymentStatus = upper(order?.payment_status || params.get("status"));
  const paid = ["PAID", "CAPTURED", "COMPLETED", "SUCCESS"].includes(paymentStatus);

  useEffect(() => {
    if (paid || upper(params.get("status")) === "CAPTURED") {
      localStorage.removeItem("cart");
      localStorage.removeItem("buyNowItem");
    }
  }, [paid, params]);

  const transactionId = useMemo(
    () =>
      routeTransactionId ||
      order?.gateway_transaction_id ||
      params.get("tap_id") ||
      "—",
    [routeTransactionId, order, params]
  );

  const orderNumber = order?.order_number || (orderId ? String(orderId) : "—");
  const currency = order?.currency || "KWD";
  const items = Array.isArray(order?.items) ? order.items : [];
  const pickup = upper(order?.delivery_method).includes("PICKUP");

  const copyTransaction = async () => {
    if (!transactionId || transactionId === "—") return;
    try {
      await navigator.clipboard.writeText(transactionId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  const ordersPath = (() => {
    const role = upper(localStorage.getItem("role"));
    if (role === "SALES_AGENT") return "/admin/salesorder";
    if (["ADMIN", "SHOP_MANAGER"].includes(role)) return "/admin/orderpipeline";
    return "/orders";
  })();

  return (
    <div className="pay-result-page">
      <section className="pay-result-shell">
        <div className="pay-result-hero success">
          <div className="pay-result-icon">
            <CheckCircle2 size={42} strokeWidth={2.2} />
          </div>
          <p className="pay-result-kicker">PAYMENT CONFIRMED</p>
          <h1>Payment successful</h1>
          <p className="pay-result-lead">
            Your payment has been securely confirmed and your order is saved.
          </p>
          <span className="pay-result-order-pill">Order #{orderNumber}</span>
        </div>

        <div className="pay-result-content">
          <div className="pay-result-transaction">
            <div>
              <span>Tap transaction ID</span>
              <strong>{transactionId}</strong>
            </div>
            <button type="button" onClick={copyTransaction} disabled={transactionId === "—"}>
              <Clipboard size={15} />
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          {loading ? (
            <div className="pay-result-state">
              <RefreshCw className="pay-result-spin" size={26} />
              <h2>Loading your order</h2>
              <p>Getting the latest confirmed payment and order information.</p>
            </div>
          ) : error ? (
            <div className="pay-result-state">
              <ReceiptText size={28} />
              <h2>Payment confirmed</h2>
              <p>{error}</p>
              <button className="pay-result-inline-btn" onClick={() => void loadOrder()}>
                Retry order details
              </button>
            </div>
          ) : order ? (
            <>
              <div className="pay-result-grid">
                <InfoCard icon={<PackageCheck size={18} />} label="Order status" value={pretty(order.status || "Pending")} />
                <InfoCard icon={<CreditCard size={18} />} label="Payment" value={pretty(order.payment_method || "Tap")} />
                <InfoCard icon={<Truck size={18} />} label="Fulfilment" value={pickup ? "Pickup" : "Delivery"} />
                <InfoCard icon={<ReceiptText size={18} />} label="Amount paid" value={money(order.grand_total ?? order.total, currency)} strong />
              </div>

              <div className="pay-result-card">
                <div className="pay-result-card-head">
                  <div>
                    <span>ORDER ITEMS</span>
                    <h2>{items.length} item{items.length === 1 ? "" : "s"}</h2>
                  </div>
                  <span className={`pay-status ${paid ? "paid" : "pending"}`}>
                    {paid ? "PAID" : pretty(order.payment_status || "Pending")}
                  </span>
                </div>
                <div className="pay-item-list">
                  {items.length ? (
                    items.map((item: any, index: number) => {
                      const custom = item?.custom_json || {};
                      const name =
                        custom?.product_name ||
                        item?.product?.name ||
                        `Product #${item?.product_id ?? index + 1}`;
                      const quantity = Number(item?.quantity || 1);
                      const unit = Number(item?.unit_price ?? item?.price ?? 0);
                      const total = Number(item?.line_total ?? unit * quantity);
                      return (
                        <div className="pay-item-row" key={String(item?.id ?? index)}>
                          <span className="pay-item-qty">{quantity}×</span>
                          <div>
                            <strong>{name}</strong>
                            {(custom?.variant_name || custom?.flavor_name) && (
                              <small>
                                {[custom?.variant_name, custom?.flavor_name].filter(Boolean).join(" • ")}
                              </small>
                            )}
                          </div>
                          <b>{money(total, currency)}</b>
                        </div>
                      );
                    })
                  ) : (
                    <p className="pay-result-muted">Item details are not available yet.</p>
                  )}
                </div>
              </div>

              <div className="pay-result-card">
                <div className="pay-result-card-head">
                  <div>
                    <span>FULFILMENT</span>
                    <h2>{pickup ? "Pickup details" : "Delivery details"}</h2>
                  </div>
                </div>
                <Detail label={pickup ? "Pickup date" : "Delivery date"} value={(pickup ? order.pickup_date : order.delivery_date) || "—"} />
                <Detail label={pickup ? "Pickup time" : "Delivery time"} value={(pickup ? order.pickup_time_slot : order.delivery_time_slot) || "—"} />
                {!pickup && order?.delivery_area?.name && <Detail label="Area" value={order.delivery_area.name} />}
              </div>

              <div className="pay-result-card total">
                <Detail label="Subtotal" value={money(order.subtotal, currency)} />
                {Number(order.discount || 0) > 0 && (
                  <Detail label="Discount" value={`− ${money(order.discount, currency)}`} />
                )}
                {!pickup && Number(order.delivery_charge || 0) > 0 && (
                  <Detail label="Delivery charge" value={money(order.delivery_charge, currency)} />
                )}
                <div className="pay-total-row">
                  <span>Total paid</span>
                  <strong>{money(order.grand_total ?? order.total, currency)}</strong>
                </div>
              </div>
            </>
          ) : null}

          <div className="pay-result-actions">
            <button className="pay-primary" onClick={() => navigate(ordersPath)}>
              <ReceiptText size={17} />
              View my orders
            </button>
            <button className="pay-secondary" onClick={() => navigate("/")}>
              <Home size={17} />
              Back to home
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

const InfoCard = ({
  icon,
  label,
  value,
  strong,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  strong?: boolean;
}) => (
  <div className="pay-info-card">
    <i>{icon}</i>
    <span>{label}</span>
    <strong className={strong ? "accent" : ""}>{value}</strong>
  </div>
);

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div className="pay-detail-row">
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

export default PaymentSuccess;
