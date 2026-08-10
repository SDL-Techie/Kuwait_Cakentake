import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Loader2,
  AlertCircle,
  Gift,
  Sparkles,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";
import {
  getLoyaltyPoints,
  getCustomerLedger,
  redeemLoyaltyPoints,
  LoyaltyLedgerEntry,
} from "../../services/loyaltyService";
import './Customerloyality.css';

const CustomerLoyalty: React.FC = () => {
  const [customerIdInput, setCustomerIdInput] = useState<string>("");
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [points, setPoints] = useState<number | null>(null);
  const [ledger, setLedger] = useState<LoyaltyLedgerEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [redeemPoints, setRedeemPoints] = useState<string>("");
  const [redeemOrderId, setRedeemOrderId] = useState<string>("");
  const [redeeming, setRedeeming] = useState<boolean>(false);
  const [redeemMessage, setRedeemMessage] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = Number(customerIdInput);
    if (!id || id <= 0) {
      setError("Enter a valid customer ID.");
      return;
    }

    setLoading(true);
    setError(null);
    setRedeemMessage(null);
    try {
      const [pointsRes, ledgerRes] = await Promise.all([
        getLoyaltyPoints(id),
        getCustomerLedger(id),
      ]);
      setCustomerId(id);
      setPoints(pointsRes.points);
      setLedger(ledgerRes);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Customer not found.");
      setCustomerId(null);
      setPoints(null);
      setLedger([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) return;
    const pointsToRedeem = Number(redeemPoints);
    if (!pointsToRedeem || pointsToRedeem <= 0) {
      setRedeemMessage("Enter a valid number of points to redeem.");
      return;
    }

    setRedeeming(true);
    setRedeemMessage(null);
    try {
      await redeemLoyaltyPoints(
        customerId,
        pointsToRedeem,
        redeemOrderId ? Number(redeemOrderId) : undefined
      );
      const [pointsRes, ledgerRes] = await Promise.all([
        getLoyaltyPoints(customerId),
        getCustomerLedger(customerId),
      ]);
      setPoints(pointsRes.points);
      setLedger(ledgerRes);
      setRedeemPoints("");
      setRedeemOrderId("");
      setRedeemMessage("Points redeemed successfully.");
    } catch (err: any) {
      setRedeemMessage(err?.response?.data?.error || "Failed to redeem points.");
    } finally {
      setRedeeming(false);
      setTimeout(() => setRedeemMessage(null), 3500);
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="loyalty-customer">
      <div className="loyalty-customer-heading">
        <h3>Customer Loyalty Lookup</h3>
        <p>Search a customer to view their points balance and redemption history.</p>
      </div>

      <form className="loyalty-customer-search" onSubmit={handleSearch}>
        <div className="loyalty-customer-search-input">
          <Search size={16} />
          <input
            type="number"
            min={1}
            placeholder="Enter customer ID…"
            value={customerIdInput}
            onChange={(e) => setCustomerIdInput(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? <Loader2 size={16} className="loyalty-spin" /> : "Search"}
        </button>
      </form>

      {error && (
        <div className="loyalty-alert loyalty-alert-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <AnimatePresence>
        {customerId !== null && points !== null && (
          <motion.div
            className="loyalty-customer-result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <div className="loyalty-customer-summary">
              <div className="loyalty-customer-points-card">
                <Sparkles size={20} />
                <div>
                  <p className="loyalty-customer-points-value">
                    {points.toLocaleString()} pts
                  </p>
                  <p className="loyalty-customer-points-label">
                    Customer #{customerId} balance
                  </p>
                </div>
              </div>

              {/* Manual/admin point burn — separate from the checkout
                  "use_loyalty" discount flow. Use with care: this does not
                  apply any order discount by itself. */}
              <form className="loyalty-redeem-form" onSubmit={handleRedeem}>
                <div className="loyalty-redeem-inputs">
                  <input
                    type="number"
                    min={1}
                    placeholder="Points to redeem"
                    value={redeemPoints}
                    onChange={(e) => setRedeemPoints(e.target.value)}
                  />
                  <input
                    type="number"
                    min={1}
                    placeholder="Order ID (optional)"
                    value={redeemOrderId}
                    onChange={(e) => setRedeemOrderId(e.target.value)}
                  />
                </div>
                <button type="submit" disabled={redeeming}>
                  {redeeming ? (
                    <Loader2 size={15} className="loyalty-spin" />
                  ) : (
                    <Gift size={15} />
                  )}
                  Redeem
                </button>
              </form>
            </div>

            {redeemMessage && (
              <div className="loyalty-alert loyalty-alert-success">
                <span>{redeemMessage}</span>
              </div>
            )}

            <div className="loyalty-customer-ledger">
              <h4>Transaction History</h4>
              {ledger.length === 0 ? (
                <div className="loyalty-customer-empty">
                  No transactions for this customer yet.
                </div>
              ) : (
                <table className="loyalty-customer-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Points</th>
                      <th>Description</th>
                      <th>Order</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledger.map((entry) => (
                      <tr key={entry.id}>
                        <td>
                          <span
                            className={`loyalty-ledger-badge ${
                              entry.transaction_type === "EARN"
                                ? "loyalty-ledger-badge-earn"
                                : "loyalty-ledger-badge-redeem"
                            }`}
                          >
                            {entry.transaction_type === "EARN" ? (
                              <ArrowUpCircle size={13} />
                            ) : (
                              <ArrowDownCircle size={13} />
                            )}
                            {entry.transaction_type}
                          </span>
                        </td>
                        <td className="loyalty-ledger-points">
                          {entry.points > 0 ? "+" : ""}
                          {entry.points}
                        </td>
                        <td>{entry.description || "—"}</td>
                        <td>{entry.order_id ? `#${entry.order_id}` : "—"}</td>
                        <td>{formatDate(entry.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerLoyalty;