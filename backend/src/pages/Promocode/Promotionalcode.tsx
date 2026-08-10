
import React, { useEffect, useState, useCallback } from "react";
import { Copy, Check, Tag, Clock, Ticket, RefreshCw, AlertCircle } from "lucide-react";
import "./Coupon.css";

import { getActivePromos, PromoCode } from "../../services/promotionService";

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

const formatDiscount = (promo: PromoCode): string => {
  const type = (promo.discount_type || "").toUpperCase();
  if (type === "PERCENT") return `${promo.discount_value}% OFF`;
  if (type === "FLAT") return `₹${promo.discount_value} OFF`;
  return `${promo.discount_value} OFF`;
};

const formatExpiry = (expiresAt?: string): string | null => {
  if (!expiresAt) return null;
  const date = new Date(expiresAt);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const isExpiringSoon = (expiresAt?: string): boolean => {
  if (!expiresAt) return false;
  const date = new Date(expiresAt);
  if (isNaN(date.getTime())) return false;
  const daysLeft = (date.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return daysLeft >= 0 && daysLeft <= 3;
};

const usageLabel = (promo: PromoCode): string | null => {
  if (!promo.max_uses) return null;
  const remaining = Math.max(promo.max_uses - (promo.used_count || 0), 0);
  return `${remaining} of ${promo.max_uses} left`;
};

/* ─── Component ────────────────────────────────────────────────────────────── */

const Coupon: React.FC = () => {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Only ever fetches promo codes (GET /promos/active) — never touches the
  // separate Promotion (discount/free-item) endpoints.
  const fetchPromos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getActivePromos();
      setPromos(data ?? []);
    } catch (err) {
      console.error("Failed to fetch promo codes:", err);
      setError("Couldn't load coupons right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromos();
  }, [fetchPromos]);

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const el = document.createElement("textarea");
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(prev => (prev === code ? null : prev)), 2200);
  };

  return (
    <div className="cpn-page">
      <div className="cpn-header">
        <div className="cpn-header-icon">
          <Ticket size={22} />
        </div>
        <div className="cpn-header-text">
          <h2>Available Coupons</h2>
          <p>Apply these codes at checkout to save on your order.</p>
        </div>
        <button className="cpn-refresh-btn" onClick={fetchPromos} disabled={loading} title="Refresh">
          <RefreshCw size={15} className={loading ? "cpn-spin" : ""} />
        </button>
      </div>

      {error && (
        <div className="cpn-error-banner">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button className="cpn-error-retry" onClick={fetchPromos}>Retry</button>
        </div>
      )}

      {loading && promos.length === 0 ? (
        <div className="cpn-loading-state">
          <div className="cpn-loading-spinner" />
          <p>Loading coupons…</p>
        </div>
      ) : !error && promos.length === 0 ? (
        <div className="cpn-empty-state">
          <Tag size={38} />
          <h3>No coupons available</h3>
          <p>Check back soon — new offers are added regularly.</p>
        </div>
      ) : (
        <div className="cpn-grid">
          {promos.map((promo) => {
            const expiry = formatExpiry(promo.expires_at);
            const soon = isExpiringSoon(promo.expires_at);
            const usage = usageLabel(promo);
            const copied = copiedCode === promo.code;

            return (
              <div key={promo.id} className="cpn-card">
                <div className="cpn-card-accent" />

                <div className="cpn-card-body">
                  <div className="cpn-card-top">
                    <span className="cpn-discount-badge">{formatDiscount(promo)}</span>
                    {soon && <span className="cpn-expiring-badge">Expiring soon</span>}
                  </div>

                  <div className="cpn-code-row">
                    <Tag size={15} className="cpn-code-icon" />
                    <span className="cpn-code-text">{promo.code}</span>
                  </div>

                  <div className="cpn-meta-row">
                    {promo.min_order_value > 0 && (
                      <span className="cpn-meta-chip">
                        Min. order ₹{promo.min_order_value}
                      </span>
                    )}
                    {usage && <span className="cpn-meta-chip">{usage}</span>}
                  </div>

                  {expiry && (
                    <div className="cpn-expiry-row">
                      <Clock size={12} />
                      <span>Valid till {expiry}</span>
                    </div>
                  )}
                </div>

                <div className="cpn-card-divider">
                  <span className="cpn-notch cpn-notch-left" />
                  <span className="cpn-dashed-line" />
                  <span className="cpn-notch cpn-notch-right" />
                </div>

                <button
                  className={`cpn-copy-btn ${copied ? "copied" : ""}`}
                  onClick={() => handleCopy(promo.code)}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy Code"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Coupon;