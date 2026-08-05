import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, TrendingUp, TrendingDown, Wallet, RefreshCw } from "lucide-react";
import { getLoyaltyReport, LoyaltyReport as LoyaltyReportType } from "../../services/loyaltyService";
import './Loyalityreport.css';

const LoyaltyReport: React.FC = () => {
  const [report, setReport] = useState<LoyaltyReportType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLoyaltyReport();
      setReport(data);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Unable to load loyalty report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="loyalty-report-loading">
        <Loader2 className="loyalty-spin" size={22} />
        <span>Loading loyalty report…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loyalty-report-error">
        <AlertCircle size={18} />
        <span>{error}</span>
        <button onClick={fetchReport}>
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  const cards = [
    {
      label: "Total points earned",
      value: report?.total_earned ?? 0,
      icon: TrendingUp,
      tone: "positive",
    },
    {
      label: "Total points redeemed",
      value: report?.total_redeemed ?? 0,
      icon: TrendingDown,
      tone: "negative",
    },
    {
      label: "Net points outstanding",
      value: report?.net_outstanding ?? 0,
      icon: Wallet,
      tone: "neutral",
    },
  ];

  return (
    <div className="loyalty-report">
      <div className="loyalty-report-heading">
        <div>
          <h3>Loyalty Program Report</h3>
          <p>Overview of points earned, redeemed and currently outstanding.</p>
        </div>
        <button className="loyalty-report-refresh" onClick={fetchReport}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      <div className="loyalty-report-grid">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              className={`loyalty-report-card loyalty-report-card-${card.tone}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.06 }}
            >
              <div className="loyalty-report-icon">
                <Icon size={20} />
              </div>
              <div>
                <p className="loyalty-report-value">
                  {card.value.toLocaleString()} pts
                </p>
                <p className="loyalty-report-label">{card.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default LoyaltyReport;