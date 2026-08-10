import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, TrendingUp, Gift, Star, AlertCircle, ShoppingBag } from 'lucide-react';
import {
  getLoyaltyConfig,
  getLoyaltyPoints,
  getCustomerLedger,
  LoyaltyConfig,
  LoyaltyLedgerEntry,
} from '../../services/loyaltyService';
import './Coupon.css';

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────── */
const getUserId = (): number => {
  const direct = localStorage.getItem('userId');
  if (direct) return Number(direct);
  try {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    return u?.id ?? 0;
  } catch {
    return 0;
  }
};

/**
 * NOTE ON THIS REWRITE:
 * The old version of this page assumed each point had a fixed cash value
 * (points_value) and let the customer "redeem" their whole balance here
 * for a standalone coupon code. That model no longer exists on the
 * backend — LoyaltyConfig now only has min_order_amount /
 * points_per_min_order (earning) and min_points / reward_percent
 * (redemption), and redemption is a flat "spend min_points points, get
 * reward_percent off" rule that's applied INSIDE order creation
 * (POST /orders with use_loyalty: true), not as a freestanding action.
 *
 * So this page is now an informational dashboard — balance, progress
 * toward the threshold, and the earning rule — with a CTA that sends the
 * customer to checkout, where the actual "Use Loyalty Points" toggle
 * lives and applies the real discount atomically with the order.
 */

const Coupon: React.FC = () => {
  const navigate = useNavigate();
  const userId = getUserId();

  const [config, setConfig] = useState<LoyaltyConfig | null>(null);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [ledger, setLedger] = useState<LoyaltyLedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const fetchAll = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError('');
    try {
      const [cfg, pts, ledgerEntries] = await Promise.all([
        getLoyaltyConfig(),
        getLoyaltyPoints(userId),
        getCustomerLedger(userId).catch(() => [] as LoyaltyLedgerEntry[]),
      ]);
      setConfig(cfg);
      setCurrentPoints(pts.points ?? 0);
      setLedger(ledgerEntries || []);
    } catch (err: any) {
      setLoadError(err?.response?.data?.error || 'Could not load your loyalty rewards right now.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── Derived values (current model) ── */
  const minPoints = config?.min_points ?? 0;
  const rewardPercent = config?.reward_percent ?? 0;
  const minOrderAmount = config?.min_order_amount ?? 0;
  const pointsPerMinOrder = config?.points_per_min_order ?? 0;
  const isActive = config?.is_active ?? false;

  const canRedeem = isActive && currentPoints >= minPoints && minPoints > 0;
  const pointsNeeded = Math.max(0, minPoints - currentPoints);
  const progressPercent = minPoints > 0 ? Math.min((currentPoints / minPoints) * 100, 100) : 0;

  const totalPointsEarned = ledger
    .filter(l => (l.transaction_type || '').toUpperCase() === 'EARN')
    .reduce((s, l) => s + Math.abs(l.points), 0);
  const totalPointsRedeemed = ledger
    .filter(l => (l.transaction_type || '').toUpperCase() === 'REDEEM')
    .reduce((s, l) => s + Math.abs(l.points), 0);

  const fmtDate = (d?: string) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return d;
    }
  };

  /* ── Loading / guard states ── */
  if (loading) {
    return (
      <div className="rasi-category-page">
        <div className="rasi-container" style={{ textAlign: 'center', paddingTop: '50px' }}>
          Loading rewards...
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="rasi-category-page">
        <div className="rasi-container" style={{ textAlign: 'center', paddingTop: '50px' }}>
          Please log in to view your loyalty rewards.
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rasi-category-page">
        <div className="rasi-container" style={{ textAlign: 'center', paddingTop: '50px' }}>
          <AlertCircle size={20} /> {loadError}
        </div>
      </div>
    );
  }

  return (
    <div className="rasi-category-page">
      <div className="rasi-container">

        {/* Header Section */}
        <div className="rasi-section-header">
          <button className="rasi-back-btn" onClick={() => window.history.back()}>
            <ArrowLeft size={18} /> Back
          </button>
          <h2>Loyalty Rewards</h2>
          {/* <p>Earn points on every order and redeem them for a discount at checkout.</p> */}
        </div>

        {!isActive && (
          <div className="loyalty-rule-box">
            <strong>Note:</strong> the loyalty program is currently inactive — redemption is temporarily disabled.
          </div>
        )}

        {/* Grid Layout Container */}
        <div className="rasi-products-grid">

          {/* Box 1: Current Point Balance */}
          <div className="loyalty-box highlight-box">
            <Award size={32} className="box-icon" />
            <span className="box-label">Current Balance</span>
            <h3 className="box-value">{currentPoints} Points</h3>
            <div className="status-pill">
              {canRedeem ? 'Reward Ready' : 'Earning Points'}
            </div>
          </div>

          {/* Box 2: Goal and Progress Tracker */}
          <div className="loyalty-box">
            <Star size={32} className="box-icon" />
            <span className="box-label">Goal: {minPoints} Points</span>
            <div className="rasi-progress-container">
              <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <span className="box-sub-value">{currentPoints}/{minPoints}</span>
            {pointsNeeded > 0 && (
              <p className="box-text">Earn {pointsNeeded} more point{pointsNeeded === 1 ? '' : 's'} to unlock your reward.</p>
            )}
          </div>

          {/* Box 3: Points earned / redeemed lifetime, from the ledger */}
          <div className="loyalty-box">
            <TrendingUp size={32} className="box-icon" />
            <span className="box-label">Lifetime Points</span>
            <h3 className="box-value">{totalPointsEarned} earned</h3>
            <span className="points-added">{totalPointsRedeemed} redeemed so far</span>
          </div>

          {/* Box 4: Reward — how redemption actually works now */}
          <div className="loyalty-box redemption-box">
            <Gift size={32} className="box-icon" />
            <span className="box-label">Your Reward</span>
            <h3 className="box-value">{rewardPercent}% off</h3>
            <p className="box-text-small">
              {canRedeem
                ? `Use ${minPoints} points at checkout for ${rewardPercent}% off your order.`
                : isActive
                  ? `Reach ${minPoints} points to unlock ${rewardPercent}% off an order.`
                  : 'Loyalty program is disabled'}
            </p>

            <button
              className="rasi-btn-primary"
              onClick={() => navigate('/products')}
              disabled={!canRedeem}
            >
              <ShoppingBag size={15} style={{ marginRight: 6 }} />
              {canRedeem ? 'Use at Checkout' : 'Keep Earning'}
            </button>
          </div>

        </div>

        {/* Recent activity */}
        {/* {ledger.length > 0 && (
          <div className="loyalty-customer-ledger" style={{ marginTop: 24 }}>
            <h4>Recent Activity</h4>
            <table className="loyalty-customer-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Points</th>
                  <th>Description</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {ledger.slice(0, 10).map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.transaction_type}</td>
                    <td>{entry.points > 0 ? '+' : ''}{entry.points}</td>
                    <td>{entry.description || '—'}</td>
                    <td>{fmtDate(entry.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )} */}

        {/* Program rules summary */}
        {/* <div className="loyalty-rule-box">
          <strong>Earning Rules:</strong> Earn {pointsPerMinOrder} points for every {minOrderAmount ? minOrderAmount.toFixed(2) : 0} spent on an order.{' '}
          <strong>Redeeming:</strong> Once you hold at least {minPoints} points, use them at checkout for {rewardPercent}% off.
        </div> */}

      </div>
    </div>
  );
};

export default Coupon;