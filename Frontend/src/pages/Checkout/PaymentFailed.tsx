import { AlertCircle, Home, ReceiptText, RotateCcw } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./PaymentResult.css";

const pretty = (value: unknown) =>
  String(value ?? "Payment not completed")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

export default function PaymentFailed() {
  const navigate = useNavigate();
  const { transactionId } = useParams<{ transactionId?: string }>();
  const [params] = useSearchParams();
  const orderId = params.get("order_id");
  const status = pretty(params.get("status") || "Failed");

  return (
    <div className="pay-result-page">
      <section className="pay-result-shell compact">
        <div className="pay-result-hero failed">
          <div className="pay-result-icon">
            <AlertCircle size={42} strokeWidth={2.1} />
          </div>
          <p className="pay-result-kicker">PAYMENT NOT COMPLETED</p>
          <h1>{status}</h1>
          <p className="pay-result-lead">
            Your order is still saved. You can retry payment for the same order without creating a duplicate order.
          </p>
          {orderId && <span className="pay-result-order-pill">Order #{orderId}</span>}
        </div>

        <div className="pay-result-content">
          <div className="pay-result-transaction">
            <div>
              <span>Tap transaction ID</span>
              <strong>{transactionId || params.get("tap_id") || "—"}</strong>
            </div>
          </div>

          <div className="pay-result-state small">
            <ReceiptText size={28} />
            <h2>Your order was not duplicated</h2>
            <p>
              Open My Orders and continue payment on the existing order. If money was debited but this page shows a failure, refresh the order first so the backend can reconcile the Tap status.
            </p>
          </div>

          <div className="pay-result-actions">
            <button className="pay-primary" onClick={() => navigate("/orders")}>
              <RotateCcw size={17} />
              Retry from My Orders
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
}
