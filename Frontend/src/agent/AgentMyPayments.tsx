import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  CreditCard,
  ExternalLink,
  Eye,
  Loader2,
  Printer,
  RefreshCw,
  Wallet,
  X,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { getAgentPayments, type AgentPaymentsSummary } from "../services/agentService";
import { createPaymentLink } from "../services/paymentService";
import { OrderProducts, OrderReceiptModal } from "../components/OrderView";
import { formatOrderDate, formatOrderMoney, toOrderView } from "../utils/orderView";
import "./AgentMyPayments.css";

/* ==========================================================================
   AgentMyPayments — agent-side payment screen (client requirement).

   Agent orders are placed on CREDIT. Here the agent sees every unpaid
   order, selects one or many, and pays them together with a single
   KNET / Tap link (QR + open-link). Paid orders are listed as history.
   ========================================================================== */

type Tab = "pending" | "paid";

const EMPTY_SUMMARY: AgentPaymentsSummary = {
  pending_count: 0,
  pending_amount: 0,
  paid_count: 0,
  paid_amount: 0,
  currency: "KWD",
};

const orderTotal = (o: any) => Number(o?.grand_total ?? o?.total ?? 0) || 0;
// Same display numbering as the "Agent Order" screen (id 6 → #15006).
const ORDER_NUMBER_OFFSET = 15000;
const orderNo = (o: any) => {
  const raw = o?.order_number ?? o?.id;
  const num = Number(raw);
  if (!Number.isFinite(num)) return String(raw ?? "");
  return String(num >= ORDER_NUMBER_OFFSET ? num : ORDER_NUMBER_OFFSET + num);
};
const withDisplayNo = (o: any) => (o ? { ...o, order_number: orderNo(o) } : o);

export default function AgentMyPayments(): React.JSX.Element {
  const [tab, setTab] = useState<Tab>("pending");
  const [pending, setPending] = useState<any[]>([]);
  const [paid, setPaid] = useState<any[]>([]);
  const [summary, setSummary] = useState<AgentPaymentsSummary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [paymentUrl, setPaymentUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const [detailOrder, setDetailOrder] = useState<any | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<any | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAgentPayments();
      setPending(data.pending);
      setPaid(data.paid);
      setSummary(data.summary);
      // Drop selections that are no longer pending.
      setSelected((prev) => {
        const ids = new Set(data.pending.map((o: any) => Number(o.id)));
        return new Set([...prev].filter((id) => ids.has(id)));
      });
    } catch (err: any) {
      setError(err?.response?.data?.error || "Could not load your payments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const currency = summary.currency || "KWD";
  const list = tab === "pending" ? pending : paid;

  const selectedOrders = useMemo(
    () => pending.filter((o) => selected.has(Number(o.id))),
    [pending, selected]
  );
  const selectedTotal = useMemo(
    () => selectedOrders.reduce((sum, o) => sum + orderTotal(o), 0),
    [selectedOrders]
  );

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allSelected = pending.length > 0 && selected.size === pending.length;
  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(pending.map((o) => Number(o.id))));

  const paySelected = async () => {
    if (!selectedOrders.length) return;
    setPaying(true);
    setPayError("");
    try {
      const result = await createPaymentLink(selectedOrders.map((o) => Number(o.id)));
      if (!result?.payment_url) {
        setPayError(result?.error || "Could not generate a payment link for these orders.");
        return;
      }
      setPaymentUrl(result.payment_url);
    } catch (err: any) {
      setPayError(err?.response?.data?.error || "Could not start the payment. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  const closePayment = () => {
    setPaymentUrl("");
    setCopied(false);
    load();
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(paymentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — user can still open the link */
    }
  };

  return (
    <div className="amp-page">
      <header className="amp-header">
        <div>
          <p className="amp-eyebrow">Agent</p>
          <h1>My Payments</h1>
          <p className="amp-sub">Your orders are placed on credit. Select the orders you want to settle and pay them together.</p>
        </div>
        <button type="button" className="amp-btn" onClick={load} disabled={loading}>
          <RefreshCw size={15} className={loading ? "amp-spin" : ""} /> Refresh
        </button>
      </header>

      <section className="amp-stats">
        <motion.div className="amp-stat amp-stat--due" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <span className="amp-stat-icon">
            <Wallet size={18} />
          </span>
          <div>
            <small>Amount due</small>
            <strong>{formatOrderMoney(summary.pending_amount, currency)}</strong>
            <em>{summary.pending_count} unpaid {summary.pending_count === 1 ? "order" : "orders"}</em>
          </div>
        </motion.div>
        <motion.div
          className="amp-stat"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
        >
          <span className="amp-stat-icon">
            <CheckCircle2 size={18} />
          </span>
          <div>
            <small>Paid so far</small>
            <strong>{formatOrderMoney(summary.paid_amount, currency)}</strong>
            <em>{summary.paid_count} paid {summary.paid_count === 1 ? "order" : "orders"}</em>
          </div>
        </motion.div>
      </section>

      <div className="amp-tabs" role="tablist">
        {(["pending", "paid"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            className={`amp-tab ${tab === t ? "is-active" : ""}`}
            onClick={() => setTab(t)}
          >
            {tab === t && <motion.span layoutId="amp-tab-pill" className="amp-tab-pill" />}
            <span className="amp-tab-label">
              {t === "pending" ? `Pending (${pending.length})` : `Paid (${paid.length})`}
            </span>
          </button>
        ))}
      </div>

      {error && (
        <div className="amp-alert">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {loading ? (
        <div className="amp-loading">
          <Loader2 size={26} className="amp-spin" /> Loading payments…
        </div>
      ) : list.length === 0 ? (
        <div className="amp-empty">
          <CreditCard size={40} />
          <h3>{tab === "pending" ? "Nothing to pay" : "No paid orders yet"}</h3>
          <p>{tab === "pending" ? "All your orders are settled. 🎉" : "Orders you pay for will show here."}</p>
        </div>
      ) : (
        <div className="amp-table-wrap">
          <table className="amp-table">
            <thead>
              <tr>
                {tab === "pending" && (
                  <th className="amp-col-check">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all" />
                  </th>
                )}
                <th>Order</th>
                <th>Placed</th>
                <th>Delivery / pickup</th>
                <th>Items</th>
                <th>Status</th>
                <th className="amp-right">Amount</th>
                <th className="amp-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((o, i) => {
                const v = toOrderView(o);
                const id = Number(o.id);
                const isSel = selected.has(id);
                return (
                  <motion.tr
                    key={id}
                    className={isSel ? "is-selected" : ""}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3) }}
                    onClick={() => tab === "pending" && toggle(id)}
                  >
                    {tab === "pending" && (
                      <td className="amp-col-check" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={isSel} onChange={() => toggle(id)} aria-label={`Select order ${orderNo(o)}`} />
                      </td>
                    )}
                    <td>
                      <strong>#{orderNo(o)}</strong>
                    </td>
                    <td>{formatOrderDate(o.created_at, true)}</td>
                    <td>
                      {v.isPickup ? "Pickup" : "Delivery"} · {formatOrderDate(v.scheduledDate)}
                    </td>
                    <td className="amp-items-cell">
                      {v.lines
                        .slice(0, 2)
                        .map((l) => `${l.name} ×${l.quantity}`)
                        .join(", ")}
                      {v.lines.length > 2 ? ` +${v.lines.length - 2}` : ""}
                    </td>
                    <td>
                      <span className="amp-status">{String(o.status || "").replace(/_/g, " ")}</span>
                    </td>
                    <td className="amp-right">
                      <strong>{formatOrderMoney(orderTotal(o), o.currency || currency)}</strong>
                    </td>
                    <td className="amp-right" onClick={(e) => e.stopPropagation()}>
                      <button type="button" className="amp-icon" title="View details" onClick={() => setDetailOrder(o)}>
                        <Eye size={15} />
                      </button>
                      <button type="button" className="amp-icon" title="Print receipt" onClick={() => setReceiptOrder(withDisplayNo(o))}>
                        <Printer size={15} />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Sticky pay bar */}
      <AnimatePresence>
        {tab === "pending" && selectedOrders.length > 0 && (
          <motion.div
            className="amp-paybar"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
          >
            <div>
              <small>
                {selectedOrders.length} {selectedOrders.length === 1 ? "order" : "orders"} selected
              </small>
              <strong>{formatOrderMoney(selectedTotal, currency)}</strong>
            </div>
            {payError && <span className="amp-payerror">{payError}</span>}
            <div className="amp-paybar-actions">
              <button type="button" className="amp-btn" onClick={() => setSelected(new Set())}>
                Clear
              </button>
              <button type="button" className="amp-btn amp-btn--primary" onClick={paySelected} disabled={paying}>
                {paying ? <Loader2 size={15} className="amp-spin" /> : <CreditCard size={15} />}
                {paying ? "Creating link…" : "Pay selected"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment link modal */}
      <AnimatePresence>
        {paymentUrl && (
          <motion.div className="amp-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closePayment}>
            <motion.div
              className="amp-modal"
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="amp-modal-head">
                <h3>Pay {formatOrderMoney(selectedTotal, currency)}</h3>
                <button type="button" className="amp-icon" onClick={closePayment} aria-label="Close">
                  <X size={16} />
                </button>
              </div>
              <p className="amp-muted">
                Scan with your phone or open the secure link. Orders:{" "}
                {selectedOrders.map((o) => `#${orderNo(o)}`).join(", ")}
              </p>
              <div className="amp-qr">
                <QRCodeSVG value={paymentUrl} size={200} level="M" />
              </div>
              <div className="amp-modal-actions">
                <button type="button" className="amp-btn" onClick={copyLink}>
                  <Copy size={15} /> {copied ? "Copied!" : "Copy link"}
                </button>
                <a className="amp-btn amp-btn--primary" href={paymentUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={15} /> Open payment page
                </a>
              </div>
              <button type="button" className="amp-link" onClick={closePayment}>
                I've paid — refresh my list
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details modal */}
      <AnimatePresence>
        {detailOrder && (
          <motion.div className="amp-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDetailOrder(null)}>
            <motion.div
              className="amp-modal amp-modal--wide"
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="amp-modal-head">
                <h3>Order #{orderNo(detailOrder)}</h3>
                <button type="button" className="amp-icon" onClick={() => setDetailOrder(null)} aria-label="Close">
                  <X size={16} />
                </button>
              </div>
              <OrderProducts order={detailOrder} showTotals />
              <div className="amp-modal-actions">
                <button
                  type="button"
                  className="amp-btn amp-btn--primary"
                  onClick={() => {
                    setReceiptOrder(withDisplayNo(detailOrder));
                    setDetailOrder(null);
                  }}
                >
                  <Printer size={15} /> Print receipt
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <OrderReceiptModal order={receiptOrder} open={!!receiptOrder} onClose={() => setReceiptOrder(null)} />
    </div>
  );
}
