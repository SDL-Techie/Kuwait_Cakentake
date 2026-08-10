import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    FaCoins, 
    FaPercent, 
    FaShoppingBag, 
    FaSave, 
    FaSync, 
    FaCheckCircle, 
    FaExclamationCircle, 
    FaPlus, 
    FaTimes, 
    FaEdit, 
    FaCalendarAlt,
    FaArrowRight
} from 'react-icons/fa';
import './Point.css';

const Point = () => {
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    
    const [settings, setSettings] = useState({
        minOrderAmount: 0,
        pointsEarnedPerOrder: 0,
        pointsRequiredForDiscount: 0,
        discountPercentage: 0,
        couponValidityDays: 0
    });

    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    const showToast = (message: string, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:4000/api/v1/getpointsettings', {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            if (res.data?.data) {
                setSettings(res.data.data);
            } else if (res.data) {
                setSettings(res.data);
            }
            setLoading(false);
        } catch (err) {
            console.error("Error fetching settings", err);
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:4000/api/v1/createpointsettings', settings, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            showToast("Loyalty Rules Updated Successfully!", "success");
            
            if (res.data?.data) {
                setSettings(res.data.data);
            }
            setIsFormOpen(false);
        } catch (err) {
            showToast("Error saving settings", "error");
        }
    };

    return (
        <div className="rasi-users-container">
            {/* Toast Component */}
            {toast.show && (
                <div className={`toast-notification ${toast.type}`}>
                    {toast.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
                    <span>{toast.message}</span>
                </div>
            )}

            {/* Header Area */}
            <div className="rasi-users-header">
                <div className="header-info">
                    <h1>Point Management</h1>
                    <span className="user-count-badge">Bakery Rewards Active</span>
                </div>
                
                {!isFormOpen && (
                    <button className="add-settings-btn" onClick={() => setIsFormOpen(true)}>
                        <FaPlus /> Config Rules
                    </button>
                )}
            </div>

            {/* Collapsible Input Form Card */}
            {isFormOpen && (
                <div className="form-card-wrapper animate-slide-down">
                    <div className="form-card-header">
                        <h2>{settings.minOrderAmount ? "Modify Loyalty Rules" : "Create Loyalty Rules"}</h2>
                        <button className="close-form-icon-btn" onClick={() => setIsFormOpen(false)}>
                            <FaTimes />
                        </button>
                    </div>
                    <form onSubmit={handleSave}>
                        <div className="settings-grid">
                            <div className="input-group">
                                <label><FaShoppingBag /> Min Purchase (₹)</label>
                                <input 
                                    type="number" 
                                    value={settings.minOrderAmount} 
                                    onChange={(e) => setSettings({...settings, minOrderAmount: Number(e.target.value) })}
                                    required
                                    min="0"
                                />
                            </div>
                            <div className="input-group">
                                <label><FaCoins /> Points Earned</label>
                                <input 
                                    type="number" 
                                    value={settings.pointsEarnedPerOrder} 
                                    onChange={(e) => setSettings({...settings, pointsEarnedPerOrder: Number(e.target.value)})}
                                    required
                                    min="0"
                                />
                            </div>
                            <div className="input-group">
                                <label><FaSync /> Points Needed</label>
                                <input 
                                    type="number" 
                                    value={settings.pointsRequiredForDiscount} 
                                    onChange={(e) => setSettings({...settings, pointsRequiredForDiscount: Number(e.target.value)})}
                                    required
                                    min="0"
                                />
                            </div>
                            <div className="input-group">
                                <label><FaPercent /> Reward (%)</label>
                                <input 
                                    type="number" 
                                    value={settings.discountPercentage} 
                                    onChange={(e) => setSettings({...settings, discountPercentage: Number(e.target.value)})}
                                    required
                                    min="0"
                                    max="100"
                                />
                            </div>
                            <div className="input-group">
                                <label><FaCalendarAlt /> Coupon Validity (Days)</label>
                                <input 
                                    type="number" 
                                    value={settings.couponValidityDays || 0} 
                                    onChange={(e) => setSettings({...settings, couponValidityDays: Number(e.target.value)})}
                                    required
                                    min="1"
                                />
                            </div>
                        </div>
                        <div className="form-actions-wrapper">
                            <button type="submit" className="save-settings-btn">
                                <FaSave /> Save Layout
                            </button>
                            <button type="button" className="cancel-settings-btn" onClick={() => setIsFormOpen(false)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Dashboard Summary Cards Section */}
            <div className="dashboard-cards-section-wrapper">
                <div className="cards-section-header">
                    {/* <div className="section-title-group">
                        <h3>Active Reward Metrics</h3>
                        <p className="section-subtitle">Real-time parameters for user earning thresholds and coupons</p>
                    </div> */}
                    {!isFormOpen && (
                        <button className="inline-change-rules-btn" onClick={() => setIsFormOpen(true)}>
                            <FaEdit /> Adjust Parameters
                        </button>
                    )}
                </div>
                
                {loading ? (
                    <div className="loading-placeholder">Loading rule matrices...</div>
                ) : (
                    <div className="metrics-display-grid">
                        
                        {/* Card 1: Earning Rule */}
                        <div className="metric-card purchase-rule-card">
                            <div className="metric-card-top">
                                <div className="metric-icon-box box-orange">
                                    <FaShoppingBag />
                                </div>
                                <span className="status-indicator active">Active</span>
                            </div>
                            <div className="metric-card-body">
                                <p className="metric-label">Purchase Threshold</p>
                                <h2 className="metric-value">₹{settings.minOrderAmount}</h2>
                                <p className="metric-description">
                                    Amount Required For {settings.pointsEarnedPerOrder} Points.
                                </p>
                            </div>
                            <div className="metric-card-footer">
                                <span className="footer-highlight">Yields +{settings.pointsEarnedPerOrder} Pts</span>
                            </div>
                        </div>

                        {/* Card 2: Accumulation Goal */}
                        <div className="metric-card threshold-rule-card">
                            <div className="metric-card-top">
                                <div className="metric-icon-box box-gold">
                                    <FaCoins />
                                </div>
                                <span className="status-indicator active">Active</span>
                            </div>
                            <div className="metric-card-body">
                                <p className="metric-label">Point Target</p>
                                <h2 className="metric-value">{settings.pointsRequiredForDiscount} <span className="unit-text">Pts</span></h2>
                                <p className="metric-description">
                                    If you Reach {settings.pointsRequiredForDiscount} Points .You will have {settings.discountPercentage} percentage off
                                </p>
                            </div>
                            <div className="metric-card-footer">
                                <span className="footer-highlight text-gold">Milestone Limit</span>
                            </div>
                        </div>

                        {/* Card 3: Reward Percent */}
                        <div className="metric-card benefit-rule-card">
                            <div className="metric-card-top">
                                <div className="metric-icon-box box-brown">
                                    <FaPercent />
                                </div>
                                <span className="status-indicator active">Active</span>
                            </div>
                            <div className="metric-card-body">
                                <p className="metric-label">Claimable Reward</p>
                                <h2 className="metric-value">{settings.discountPercentage}% <span className="unit-text">OFF</span></h2>
                                <p className="metric-description">
                                    Discount scale applied to the billing order once voucher is redeemed.
                                </p>
                            </div>
                            <div className="metric-card-footer">
                                <span className="footer-badge-pill">Storewide Token</span>
                            </div>
                        </div>

                        {/* Card 4: Coupon Expiry */}
                        <div className="metric-card validity-rule-card">
                            <div className="metric-card-top">
                                <div className="metric-icon-box box-blue">
                                    <FaCalendarAlt />
                                </div>
                                <span className="status-indicator active">Active</span>
                            </div>
                            <div className="metric-card-body">
                                <p className="metric-label">Coupon Lifespan</p>
                                <h2 className="metric-value">{settings.couponValidityDays || 7} <span className="unit-text">Days</span></h2>
                                <p className="metric-description">
                                    Validity frame before the generated voucher becomes inactive.
                                </p>
                            </div>
                            <div className="metric-card-footer">
                                <span className="footer-highlight">Strict Expiration</span>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default Point;