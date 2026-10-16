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
import axios from "axios";
import { BASE_URL } from "../../services/api";
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

const addressText = (order: any): string => {
  let address = order?.delivery_address || order?.delivery_address_json || order?.address;
  if (typeof address === "string") {
    try { address = JSON.parse(address); } catch { return address; }
  }
  if (!address || typeof address !== "object") return "—";
  return [address.formatted, address.address_line1, address.block, address.street, address.building, address.floor, address.apartment, address.area_name, address.city]
    .filter((part: unknown) => typeof part === "string" && part.trim())
    .join(", ") || "—";
};

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { transactionId: routeTransactionId } = useParams<{ transactionId?: string }>();
  const [params] = useSearchParams();
  const receiptToken = params.get("receipt_token") || "";
  const tapReference = params.get("tap_id") || routeTransactionId || "";
  const orderIds = (params.get("order_ids") || "")
    .split(",").map((value) => Number(value.trim()))
    .filter((value) => Number.isInteger(value) && value > 0);
  const orderId = Number(params.get("order_id") || orderIds[0] || 0);

  const [order, setOrder] = useState<any>(null);
  const [receiptOrders, setReceiptOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(Boolean(orderId || tapReference));
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const loadOrder = useCallback(async () => {
    if (!orderId && !tapReference) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError("");
      setReceiptOrders([]);
      const token = receiptToken;
      const ref = tapReference;
      if (ref) {
        const base = BASE_URL;
        try {
          const receipt = await axios.get(`${base}/payments/public-result/${encodeURIComponent(ref)}`, {
            params: token ? { receipt_token: token } : {},
          });
          if (receipt.data?.order) {
            // Signed receipts are authoritative; empty item arrays are valid.
            setOrder(receipt.data.order);
            setReceiptOrders(Array.isArray(receipt.data.orders) ? receipt.data.orders : [receipt.data.order]);
            return;
          }
        } catch (receiptError: any) {
          if (receiptError?.response?.status === 403) throw receiptError;
          if (receiptError?.response?.status !== 404) throw receiptError;
        }
      }
      if (!orderId) throw new Error("Payment reference is unavailable for order lookup.");
      const value = await getOrderById(orderId);
      setOrder(value?.order ?? value);
      setReceiptOrders([value?.order ?? value]);
    } catch (err: any) {
      setError(
        err?.response?.status === 401
          ? "Please sign in to view this order's private details, or reopen the secure payment receipt link."
          : err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          "Unable to load the latest order details."
      );
    } finally {
      setLoading(false);
    }
  }, [orderId, receiptToken, tapReference]);

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

  const orderNumber = receiptOrders.length > 1
    ? `${receiptOrders.length} orders`
    : (order?.order_number || (orderId ? String(orderId) : "—"));
  const currency = order?.currency || "KWD";

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
              {receiptOrders.length > 1 && (
                <div className="pay-result-card">
                  <div className="pay-result-card-head"><div><span>BATCH PAYMENT</span><h2>{receiptOrders.length} orders paid</h2></div></div>
                  {receiptOrders.map((paidOrder: any) => (
                    <Detail key={paidOrder.id} label={`Order #${paidOrder.order_number || paidOrder.id}`}
                      value={money(paidOrder.grand_total ?? paidOrder.total, paidOrder.currency || currency)} />
                  ))}
                  <Detail label="Combined total" value={money(receiptOrders.reduce((sum, paidOrder) => sum + Number(paidOrder.grand_total ?? paidOrder.total ?? 0), 0), currency)} />
                </div>
              )}
              {(receiptOrders.length ? receiptOrders : [order]).map((receiptOrder: any, receiptIndex: number) => {
                const order = receiptOrder;
                const currency = order?.currency || "KWD";
                const items = Array.isArray(order?.items) ? order.items : [];
                const pickup = upper(order?.delivery_method).includes("PICKUP");
                const paid = upper(order?.payment_status) === "PAID";
                return (
                  <div key={String(order?.id ?? receiptIndex)}>
                    {receiptOrders.length > 1 && (
                      <div className="pay-result-card"><div className="pay-result-card-head"><div><span>ORDER {receiptIndex + 1} OF {receiptOrders.length}</span><h2>#{order?.order_number || order?.id}</h2></div></div></div>
                    )}
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
                      const image =
  item?.product_image ||
  item?.image_url ||
  item?.product?.image_url ||
  item?.product?.image ||
  custom?.image ||
  custom?.image_url ||
  "";
                      const quantity = Number(item?.quantity || 1);
                      const unit = Number(item?.unit_price ?? item?.price ?? 0);
                      const total = Number(item?.line_total ?? unit * quantity);
                      return (
                       <div className="pay-item-row" key={String(item?.id ?? index)}>
  {image ? (
    <img
      src={image}
      alt={name}
      className="pay-item-image"
    />
  ) : (
    <div className="pay-item-image-placeholder">
      <PackageCheck size={20} />
    </div>
  )}

  <span className="pay-item-qty">{quantity}×</span>

  <div className="pay-item-info">
                            <strong>{name}</strong>
                          {(() => {
  const variant =
    custom?.variant_name ||
    custom?.variant ||
    item?.variant?.name ||
    item?.variant_name;

  const flavour =
    custom?.flavor_name ||
    custom?.flavour_name ||
    custom?.flavor ||
    custom?.flavour ||
    item?.flavor?.name ||
    item?.flavour?.name ||
    item?.flavor_name ||
    item?.flavour_name;

  const addons = Array.isArray(custom?.selected_addons)
    ? custom.selected_addons
    : Array.isArray(custom?.addons)
      ? custom.addons
      : Array.isArray(item?.selected_addons)
        ? item.selected_addons
        : Array.isArray(item?.addons)
          ? item.addons
          : [];

  return (
    <div className="pay-item-options">
      {variant ? (
        <small>
          <strong>Variant:</strong> {variant}
        </small>
      ) : null}

      {flavour ? (
        <small>
          <strong>Flavour:</strong> {flavour}
        </small>
      ) : null}

      {addons.length ? (
        <small>
          <strong>Add-ons:</strong>{" "}
          {addons
            .map((addon: any) =>
              addon?.name ||
              addon?.addon_name ||
              addon?.title
            )
            .filter(Boolean)
            .join(", ")}
        </small>
      ) : null}
    </div>
  );
})()}
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
              {!pickup && (order?.delivery_notes || order?.delivery_address?.delivery_notes || order?.delivery_address?.address_notes || order?.address?.delivery_notes) && (
                <div className="pay-result-card">
                  <Detail label="Delivery notes" value={String(order?.delivery_notes || order?.delivery_address?.delivery_notes || order?.delivery_address?.address_notes || order?.address?.delivery_notes)} />
                </div>
              )}
              {!pickup && (order?.delivery_address || order?.delivery_address_json || order?.address) && (
                <div className="pay-result-card">
                  <div className="pay-result-card-head"><div><span>DELIVERY</span><h2>Delivery address</h2></div></div>
                  <p className="pay-result-muted">{addressText(order)}</p>
                </div>
              )}
                  </div>
                );
              })}
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
