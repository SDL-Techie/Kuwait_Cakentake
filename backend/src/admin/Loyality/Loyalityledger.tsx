import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";
import { getLoyaltyLedger, LoyaltyLedgerEntry } from "../../services/loyaltyService";
import './Loyalityledger.css';

const PAGE_SIZE = 50;

const LoyaltyLedger: React.FC = () => {
  const [entries, setEntries] = useState<LoyaltyLedgerEntry[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLedger = async (targetPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLoyaltyLedger(targetPage);
      setEntries(data.ledger);
      setTotal(data.total);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Unable to load loyalty ledger.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

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
    <div className="loyalty-ledger">
      <div className="loyalty-ledger-heading">
        <div>
          <h3>Loyalty Ledger</h3>
          <p>Complete history of every points transaction across all customers.</p>
        </div>
        <button className="loyalty-ledger-refresh" onClick={() => fetchLedger(page)}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {error && (
        <div className="loyalty-alert loyalty-alert-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="loyalty-ledger-table-wrap">
        {loading ? (
          <div className="loyalty-ledger-loading">
            <Loader2 className="loyalty-spin" size={20} />
            <span>Loading transactions…</span>
          </div>
        ) : entries.length === 0 ? (
          <div className="loyalty-ledger-empty">No ledger transactions found.</div>
        ) : (
          <table className="loyalty-ledger-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Type</th>
                <th>Points</th>
                <th>Description</th>
                <th>Order</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => (
                <motion.tr
                  key={entry.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: idx * 0.02 }}
                >
                  {/* Backend's LoyaltyLedger.to_dict() doesn't include a
                      customer name, only customer_id — so this always
                      falls back to "#id" rather than silently showing
                      "undefined". */}
                  <td>{entry.customer_name || `#${entry.customer_id}`}</td>
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
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && entries.length > 0 && (
        <div className="loyalty-ledger-pagination">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default LoyaltyLedger;