import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Award, ShoppingBag, Gift, Star, Copy, CheckCircle, Clock } from 'lucide-react';
import "./userpoint.css";

// --- TypeScript Interfaces ---
interface LoyaltyStatus {
    requiredToUnlock: number;
    currentProgress: string;
    earnRateText: string;
    pointRuleText: string;
}

interface PointsData {
    success: boolean;
    currentPoints: number;
    lastOrderAmount: number;
    lastOrderPointsEarned: number;
    pointsNeededToRedeem: number;
    canRedeem: boolean;
    loyaltyStatus: LoyaltyStatus;
    discountAvailable?: string;
}

interface Coupon {
    code: string;
    expiry: string;
}

const Userpoint: React.FC = () => {
    const [pointsData, setPointsData] = useState<PointsData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [redeemedCoupon, setRedeemedCoupon] = useState<Coupon | null>(null);
    const [copied, setCopied] = useState<boolean>(false);
    const customerphone = localStorage.getItem('userPhone');

    const fetchPoints = async () => {
        if (!customerphone) return;
        try {
            const res = await axios.get(`http://localhost:4000/api/v1/user-points/${customerphone}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });
         
            if (res.data.success) {
                setPointsData(res.data);
            }
        } catch (error: any) {
            console.error("Error fetching loyalty points:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRedeem = async () => {
        try {
            const res = await axios.post(`http://localhost:4000/api/v1/redeem-points`, { 
                phone: customerphone 
            });
            
            if (res.data.success) {
                setRedeemedCoupon({
                    code: res.data.couponCode,
                    expiry: res.data.expiryDate
                });
                // Refresh points to show deducted balance
                fetchPoints();
            }
        } catch (error: any) {
            alert(error.response?.data?.message || "Redemption failed. Please try again.");
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    useEffect(() => {
        if (customerphone) {
            fetchPoints();
        } else {
            setLoading(false);
        }
    }, [customerphone]);

    // Handle Loading State
    if (loading) {
        return (
            <div className="rasi-category-page">
                <div className="rasi-container">Loading rewards...</div>
            </div>
        );
    }

    // Handle Null State (Guard Clause)
    // This solves "Property does not exist on type null" errors below
    if (!pointsData) {
        return (
            <div className="rasi-category-page">
                <div className="rasi-container">No loyalty data found.</div>
            </div>
        );
    }

    // Now TypeScript knows pointsData is NOT null
    const { 
        currentPoints, 
        lastOrderAmount, 
        lastOrderPointsEarned, 
        pointsNeededToRedeem, 
        loyaltyStatus 
    } = pointsData;

    const progressPercent = Math.min((currentPoints / loyaltyStatus.requiredToUnlock) * 100, 100);

    return (
        <div className="rasi-category-page">
            <div className="rasi-container">
                <div className="rasi-section-header">
                    <button className="rasi-back-btn" onClick={() => window.history.back()}>
                        <ArrowLeft size={18} /> Back
                    </button>
                    <h2>Loyalty Rewards</h2>
                    <p>Unlock exclusive treats with your Rasi points.</p>
                </div>

                <div className="rasi-products-grid">
                    
                    {/* Box 1: Balance */}
                    {/* <div className="loyalty-box highlight-box">
                        <Award size={32} className="box-icon" />
                        <span className="box-label">Current Balance</span>
                        <h3 className="box-value">{currentPoints} Points</h3>
                        <div className="status-pill">
                            {pointsData.canRedeem ? "Reward Ready" : "Earning Points"}
                        </div>
                    </div> */}

                    {/* Box 2: Progress */}
                    <div className="loyalty-box">
                        <Star size={32} className="box-icon" />
                        <span className="box-label">Goal: {loyaltyStatus.requiredToUnlock} Points</span>
                        <div className="rasi-progress-container">
                            <div 
                                className="progress-bar-fill" 
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>
                        <span className="box-sub-value">{loyaltyStatus.currentProgress}</span>
                        <p className="box-text">{loyaltyStatus.earnRateText}</p>
                    </div>

                    {/* Box 3: Last Earned */}
                    {/* <div className="loyalty-box">
                        <ShoppingBag size={32} className="box-icon" />
                        <span className="box-label">Recent Purchase</span>
                        <h3 className="box-value">₹{lastOrderAmount}</h3>
                        <span className="points-added">+{lastOrderPointsEarned} Points Earned</span>
                    </div> */}

                    {/* Box 4: Redemption Box */}
                    <div className="loyalty-box redemption-box">
                        <Gift size={32} className="box-icon" />
                        <span className="box-label">Reward Status</span>
                        
                        {redeemedCoupon ? (
                            <div className="coupon-display">
                                <div className="coupon-code-wrap" onClick={() => copyToClipboard(redeemedCoupon.code)}>
                                    <span className="actual-code">{redeemedCoupon.code}</span>
                                    {copied ? <CheckCircle size={16} color="#27ae60" /> : <Copy size={16} />}
                                </div>
                                <div className="expiry-tag">
                                    <Clock size={12} /> Valid for 10 days
                                </div>
                            </div>
                        ) : (
                            <>
                                <h3 className="box-value">
                                    {pointsData.discountAvailable || "10%"} Discount
                                </h3>
                                {pointsNeededToRedeem > 0 ? (
                                    <p className="box-text-small">Need {pointsNeededToRedeem} more points</p>
                                ) : (
                                    <button className="rasi-btn-primary" onClick={handleRedeem}>
                                        Redeem 10% Coupon
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {redeemedCoupon && (
                    <div className="success-banner">
                        <CheckCircle size={20} />
                        <span>Coupon generated! Copy the code and apply it on your next order.</span>
                    </div>
                )}

                {/* <div className="loyalty-rule-box">
                    <p>{loyaltyStatus.pointRuleText}</p>
                </div> */}
            </div>
        </div>
    );
};

export default Userpoint;