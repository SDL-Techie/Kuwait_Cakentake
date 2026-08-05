import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Search, Plus, Minus, Trash2, Truck, Store,
    Calendar, ShoppingBag, Loader2,
    CreditCard, Building2, MapPin, Check, X, ChevronRight, ChevronLeft,
    Package, Receipt, ClipboardList, Phone, User
} from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation } from 'swiper/modules';
import { motion, AnimatePresence } from 'framer-motion';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import Toast from '../../components/Toast/Toast';
import { useNavigate } from 'react-router';
import './Retailerorder.css';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';

declare global {
    interface Window {
        Razorpay: new (options: RzpOptions) => RzpInstance;
    }
}
interface RzpOptions {
    key: string; amount: number; currency: string; name: string;
    order_id: string; handler: (r: RzpResponse) => Promise<void>;
    prefill?: { name?: string; contact?: string };
    theme?: { color?: string };
    modal?: { ondismiss?: () => void };
}
interface RzpInstance { open(): void; }
interface RzpResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

interface Address { street: string; city: string; state: string; zipCode: string; isDefault: boolean; }
interface Category { _id: string; name: string; image?: string; }
interface Product { _id: string; name: string; wholesaleprice: string | number; productimage: string; }
interface CartItem { productId: string; name: string; category: string; price: number; image: string; quantity: number; }
interface Logistics {
    orderType: 'Delivery' | 'Pickup'; date: string; timeSlot: string;
    businessName: string; contactName: string; phone: string; paymentMethod: 'cod' | 'upi';
}

const API = 'http://localhost:4000/api/v1';

const stepVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } }),
};

const STEPS = ['Business', 'Delivery', 'Payment'] as const;

const Retailerorder: React.FC = () => {
    const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY;
    const navigate = useNavigate();
    const { customer } = useCustomerAuth();

    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedCat, setSelectedCat] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const [direction, setDirection] = useState(1);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [newAddr, setNewAddr] = useState<Address>({ street: '', city: '', state: '', zipCode: '', isDefault: false });
    const [toast, setToast] = useState({ show: false, msg: '' });
    const [deliveryFee, setDeliveryFee] = useState(0);
    const [pincodeErr, setPincodeErr] = useState('');
    const [logistics, setLogistics] = useState<Logistics>({
        orderType: 'Delivery', date: '', timeSlot: '',
        businessName: '', contactName: '', phone: '', paymentMethod: 'cod',
    });

    const showToast = (msg: string) => setToast({ show: true, msg });

    const goToStep = (next: number) => {
        setDirection(next > activeStep ? 1 : -1);
        setActiveStep(next);
    };

    const checkPincode = useCallback(async (zip: string) => {
        if (!zip || zip.length !== 6) return;
        try {
            const r = await axios.get<{ success: boolean; deliveryCharge: number }>(`${API}/pincode/${zip}`);
            if (r.data.success) { setDeliveryFee(r.data.deliveryCharge); setPincodeErr(''); }
        } catch { setDeliveryFee(0);
            //  setPincodeErr('Delivery unavailable for this pincode.'); 
            }
    }, []);

    useEffect(() => {
        if (!customer?.id) return;
        axios.get<{ data: { addresses: Address[]; name: string; phoneno: string } }>(`${API}/profile/${customer.id}`,
 {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  })
            .then(r => {
                const p = r.data.data;
                setAddresses(p.addresses || []);
                setLogistics(prev => ({ ...prev, contactName: p.name || '', phone: p.phoneno || '' }));
                const def = p.addresses?.find(a => a.isDefault) || p.addresses?.[0];
                if (def) checkPincode(def.zipCode);
            }).catch(console.error);
    }, [customer?.id, checkPincode]);

    useEffect(() => {
        axios.get<{ data: Category[] }>(`${API}/category`)
            .then(r => { if (r.data?.data) setCategories(r.data.data); })
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (!selectedCat) return;
        setLoading(true);
        axios.get<{ data: Product[] }>(`${API}/category/${selectedCat}`)
            .then(r => setProducts(r.data.data || []))
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, [selectedCat]);

    const addToCart = (p: Product) => {
        setCart(prev => {
            const ex = prev.find(i => i.productId === p._id);
            return ex
                ? prev.map(i => i.productId === p._id ? { ...i, quantity: i.quantity + 1 } : i)
                : [...prev, { productId: p._id, name: p.name, category: selectedCat, price: Number(p.wholesaleprice), image: p.productimage, quantity: 1 }];
        });
    };

    const updateQty = (id: string, delta: number) =>
        setCart(prev => prev.map(i => i.productId === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));

    const setQtyDirect = (id: string, val: number) =>
        setCart(prev => prev.map(i => i.productId === id ? { ...i, quantity: Math.max(1, isNaN(val) ? 1 : val) } : i));

    const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.productId !== id));

    const subtotal = cart.reduce((a, c) => a + c.price * c.quantity, 0);
    const total = subtotal + (logistics.orderType === 'Delivery' ? deliveryFee : 0);

    const handleSaveAddr = async () => {
        const updated: Address[] = [...addresses, { ...newAddr, isDefault: addresses.length === 0 }];
        try {
            setIsSaving(true);
            await axios.put(`${API}/profile/${customer?.id}`, { addresses: updated },
 {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });
            setAddresses(updated);
            showToast('✅ Address saved');
            setShowModal(false);
            if (updated.length === 1) checkPincode(newAddr.zipCode);
        } catch { showToast('❌ Failed to save address'); }
        finally { setIsSaving(false); }
    };

    const completeFlow = () => {
        showToast('🎉 Wholesale Order Placed!');
        setCart([]);
        setTimeout(() => navigate('/orders'), 1800);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const selAddr = addresses.find(a => a.isDefault) || addresses[0];
        if (cart.length === 0) return showToast('⚠️ Please select items');
        if (logistics.orderType === 'Delivery' && !selAddr) return showToast('⚠️ Please add a shipping address');

        const orderPayload = {
            retailerDetails: {
                userId: customer?.id,
                businessName: logistics.businessName,
                name: logistics.contactName,
                phone: logistics.phone,
                address: selAddr ? `${selAddr.street}, ${selAddr.city}` : 'Store Pickup',
                pincode: selAddr?.zipCode || '',
            },
            items: cart,
            logistics: { orderType: logistics.orderType, deliveryDate: logistics.date || null, timeSlot: logistics.timeSlot || null },
            pricing: { subtotal, deliveryCharge: deliveryFee, total },
            payment: { method: logistics.paymentMethod, status: 'Pending' },
        };

        setIsSaving(true);

        if (logistics.paymentMethod === 'upi') {
            try {
                const { data } = await axios.post(`${API}/initiate-retailer-payment`, {
                    pricing: orderPayload.pricing,
                    retailerDetails: orderPayload.retailerDetails,
                },  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });
                if (!data.success) { showToast('❌ Payment initiation failed.'); setIsSaving(false); return; }
                const rzp = data.razorpay;
                const options: RzpOptions = {
                    // key: rzp.key, 
                    key:RAZORPAY_KEY,
                    amount: rzp.amount, currency: rzp.currency,
                    name: 'Rasi Bakery Wholesale', order_id: rzp.orderId,
                    handler: async (response: RzpResponse) => {
                        try {
                            const vr = await axios.post(`${API}/verify-retailer-payment`, { ...response, orderPayload } , {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  } );
                            vr.data.success ? completeFlow() : showToast('❌ Payment verification failed.');
                        } catch { showToast('❌ Verification error.'); }
                        finally { setIsSaving(false); }
                    },
                    prefill: { name: logistics.contactName, contact: logistics.phone },
                    theme: { color: '#6B3A2A' },
                    modal: { ondismiss: () => setIsSaving(false) },
                };
                new (window as any).Razorpay(options).open();
            } catch { showToast('❌ Failed to initiate payment.'); setIsSaving(false); }
        } else {
            try {
                const { data } = await axios.post(`${API}/createretailerorder`, orderPayload ,    {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });
                data.success ? completeFlow() : showToast('❌ Order failed.');
            } catch { showToast('❌ Submission failed.'); }
            finally { setIsSaving(false); }
        }
    };

    const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const renderStepContent = () => {
        if (activeStep === 0) {
            return (
                <motion.div key="step-0" className="ro-step-content"
                    custom={direction}  initial="enter" animate="center" exit="exit">
                    <div className="ro-step-title">
                        <Building2 size={18} className="ro-step-icon" />
                        <div>
                            <h3>Business Details</h3>
                            <p>Tell us about your shop</p>
                        </div>
                    </div>

                    <div className="ro-field-group">
                        <div className="ro-input-with-icon">
                            {/* <ShoppingBag size={16} className="ro-field-icon" /> */}
                            <input className="ro-input" placeholder="Shop / Business Name" required
                                value={logistics.businessName}
                                onChange={e => setLogistics({ ...logistics, businessName: e.target.value })} />
                        </div>
                        <div className="ro-input-row">
                            <div className="ro-input-with-icon">
                                {/* <User size={16} className="ro-field-icon" /> */}
                                <input className="ro-input" placeholder="Contact Name" required
                                    value={logistics.contactName}
                                    onChange={e => setLogistics({ ...logistics, contactName: e.target.value })} />
                            </div>
                            <div className="ro-input-with-icon">
                                {/* <Phone size={16} className="ro-field-icon" /> */}
                                <input className="ro-input" type="tel" placeholder="Phone Number" required
                                    value={logistics.phone}
                                    onChange={e => setLogistics({ ...logistics, phone: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    <div className="ro-step-divider"><span>Order Preferences</span></div>

                    <div className="ro-type-toggle">
                        {(['Delivery', 'Pickup'] as const).map(t => (
                            <button key={t} type="button"
                                className={`ro-type-btn ${logistics.orderType === t ? 'ro-type-btn--active' : ''}`}
                                onClick={() => { setLogistics({ ...logistics, orderType: t }); if (t === 'Pickup') setDeliveryFee(0); }}>
                                {t === 'Delivery' ? <Truck size={15} /> : <Store size={15} />}
                                <span>{t}</span>
                            </button>
                        ))}
                    </div>

                    <div className="ro-optional-section">
                        <div className="ro-optional-label">
                            <Calendar size={14} />
                            <span>Schedule (Optional)</span>
                        </div>
                        <div className="ro-input-row">
                            <input className="ro-input" type="date"
                                onChange={e => setLogistics({ ...logistics, date: e.target.value })} />
                            <select className="ro-input"
                                onChange={e => setLogistics({ ...logistics, timeSlot: e.target.value })}>
                                <option value="">Any Time Slot</option>
                                <option>Morning (9AM–12PM)</option>
                                <option>Afternoon (1PM–4PM)</option>
                                <option>Evening (6PM–9PM)</option>
                            </select>
                        </div>
                    </div>

                    <button type="button" className="ro-next-btn"
                        disabled={!logistics.businessName || !logistics.contactName || !logistics.phone}
                        onClick={() => goToStep(1)}>
                        Continue <ChevronRight size={16} />
                    </button>
                </motion.div>
            );
        }

        if (activeStep === 1) {
            return (
                <motion.div key="step-1" className="ro-step-content"
                    custom={direction} initial="enter" animate="center" exit="exit">
                    <div className="ro-step-title">
                        <MapPin size={18} className="ro-step-icon" />
                        <div>
                            <h3>{logistics.orderType === 'Delivery' ? 'Shipping Address' : 'Pickup Details'}</h3>
                            <p>{logistics.orderType === 'Delivery' ? 'Where should we deliver?' : 'You\'ll collect at our store'}</p>
                        </div>
                    </div>

                    {logistics.orderType === 'Delivery' ? (
                        <div className="ro-addr-stack">
                            {addresses.length === 0 && (
                                <div className="ro-addr-empty">
                                    <MapPin size={28} />
                                    <p>No saved addresses yet</p>
                                </div>
                            )}
                            {addresses.map((addr, idx) => (
                                <motion.div key={idx}
                                    className={`ro-addr-tile ${addr.isDefault ? 'ro-addr-tile--active' : ''}`}
                                    onClick={() => { setAddresses(addresses.map((a, i) => ({ ...a, isDefault: i === idx }))); checkPincode(addr.zipCode); }}
                                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                                    <div className="ro-addr-radio">
                                        {addr.isDefault && <motion.div className="ro-addr-radio-dot" layoutId="radio-dot" />}
                                    </div>
                                    <div className="ro-addr-info">
                                        <p className="ro-addr-main">{addr.street}</p>
                                        <p className="ro-addr-sub">{addr.city}, {addr.state} — {addr.zipCode}</p>
                                    </div>
                                    {addr.isDefault && (
                                        <span className="ro-addr-badge">Default</span>
                                    )}
                                </motion.div>
                            ))}
                            <button type="button" className="ro-add-addr-btn" onClick={() => setShowModal(true)}>
                                <Plus size={14} /> Add New Address
                            </button>
                            {pincodeErr && (
                                <motion.p className="ro-error-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    {pincodeErr}
                                </motion.p>
                            )}
                        </div>
                    ) : (
                        <div className="ro-pickup-info">
                            <div className="ro-pickup-card">
                                <Store size={32} />
                                <div>
                                    <h4>Rasi Bakery</h4>
                                    <p>Visit our store to collect your wholesale order</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="ro-nav-row">
                        <button type="button" className="ro-back-btn" onClick={() => goToStep(0)}>
                            <ChevronLeft size={16} /> Back
                        </button>
                        <button type="button" className="ro-next-btn ro-next-btn--flex"
                            disabled={logistics.orderType === 'Delivery' && addresses.length === 0}
                            onClick={() => goToStep(2)}>
                            Continue <ChevronRight size={16} />
                        </button>
                    </div>
                </motion.div>
            );
        }

        if (activeStep === 2) {
            return (
                <motion.div key="step-2" className="ro-step-content"
                    custom={direction}  initial="enter" animate="center" exit="exit">
                    <div className="ro-step-title">
                        <CreditCard size={18} className="ro-step-icon" />
                        <div>
                            <h3>Payment Method</h3>
                            <p>Choose how you'd like to pay</p>
                        </div>
                    </div>

                    <div className="ro-pay-tiles">
                        {([
                            { id: 'cod', label: 'Cash on Delivery', sub: 'Pay when your order arrives', icon: <Truck size={22} /> },
                            { id: 'upi', label: 'UPI / Online', sub: 'Instant payment via UPI or card', icon: <CreditCard size={22} /> },
                        ] as const).map(m => (
                            <motion.button key={m.id} type="button"
                                className={`ro-pay-tile ${logistics.paymentMethod === m.id ? 'ro-pay-tile--active' : ''}`}
                                onClick={() => setLogistics({ ...logistics, paymentMethod: m.id })}
                                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                                <div className="ro-pay-icon-wrap">{m.icon}</div>
                                <div className="ro-pay-info">
                                    <span className="ro-pay-label">{m.label}</span>
                                    <span className="ro-pay-sub">{m.sub}</span>
                                </div>
                                <div className={`ro-pay-radio ${logistics.paymentMethod === m.id ? 'ro-pay-radio--active' : ''}`}>
                                    {logistics.paymentMethod === m.id && <Check size={10} />}
                                </div>
                            </motion.button>
                        ))}
                    </div>

                    <div className="ro-order-summary">
                        <h4 className="ro-summary-title">Order Summary</h4>
                        <div className="ro-summary-row"><span>Items ({cart.length})</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
                        <div className="ro-summary-row"><span>Delivery</span><span>{deliveryFee === 0 ? '—' : `₹${deliveryFee}`}</span></div>
                        <div className="ro-summary-divider" />
                        <div className="ro-summary-total"><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div>
                    </div>

                    <div className="ro-nav-row">
                        <button type="button" className="ro-back-btn" onClick={() => goToStep(1)}>
                            <ChevronLeft size={16} /> Back
                        </button>
                        <motion.button type="submit" className="ro-submit-btn"
                            disabled={cart.length === 0 || isSaving}
                            whileHover={{ scale: cart.length > 0 ? 1.02 : 1 }}
                            whileTap={{ scale: 0.97 }}>
                            {isSaving
                                ? <><Loader2 className="ro-spinner" size={17} /> Processing…</>
                                : <>Place Order </>
                            }
                        </motion.button>
                    </div>
                </motion.div>
            );
        }

        return null;
    };

    return (
        <div className="ro-page">
            <div className="ro-container">

                {/* ── LEFT PANEL — multi-step form ── */}
                <motion.form className="ro-left" onSubmit={handleSubmit}
                    initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>

                    {/* Form Header */}
                    <div className="ro-form-header">
                        {/* <div className="ro-form-brand">
                            <ShoppingBag size={18} />
                        </div> */}
                        <div>
                            <h2 className="ro-form-title">Wholesale Order</h2>
                            <p className="ro-form-sub">Rasi Bakery · Retailer Portal</p>
                        </div>
                    </div>

                    {/* Step Progress */}
                    <div className="ro-progress-bar-wrap">
                        <div className="ro-progress-track">
                            <motion.div className="ro-progress-fill"
                                animate={{ width: `${((activeStep) / (STEPS.length - 1)) * 100}%` }}
                                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} />
                        </div>
                        <div className="ro-step-dots">
                            {STEPS.map((label, i) => (
                                <div key={label} className="ro-step-dot-wrap">
                                    <motion.button type="button"
                                        className={`ro-step-dot ${i <= activeStep ? 'ro-step-dot--done' : ''} ${i === activeStep ? 'ro-step-dot--active' : ''}`}
                                        onClick={() => i < activeStep && goToStep(i)}
                                        whileHover={i < activeStep ? { scale: 1.15 } : {}}
                                        animate={i === activeStep ? { scale: [1, 1.12, 1] } : {}}
                                        transition={{ duration: 0.4 }}>
                                        {i < activeStep ? <Check size={10} /> : <span>{i + 1}</span>}
                                    </motion.button>
                                    <span className={`ro-step-dot-label ${i === activeStep ? 'ro-step-dot-label--active' : ''}`}>{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Animated Step Content */}
                    <div className="ro-step-wrapper">
                        <AnimatePresence mode="wait" custom={direction}>
                            {renderStepContent()}
                        </AnimatePresence>
                    </div>
                </motion.form>

                {/* ── RIGHT PANEL — product selection ── */}
                <div className="ro-right">
                    <motion.div className="ro-right-header"
                        initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                        <div>
                            <h1 className="ro-right-title">Rasi Wholesale</h1>
                            <p className="ro-right-sub">Browse · tap to add · place bulk orders</p>
                        </div>
                        <div className="ro-cart-badge-wrap">
                            <Package size={22} className="ro-cart-icon" />
                            <AnimatePresence>
                                {cart.length > 0 && (
                                    <motion.span className="ro-cart-badge" key={cart.length}
                                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                        {cart.length}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    <motion.div className="ro-filter-row" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                        <select className="ro-cat-select" value={selectedCat} onChange={e => setSelectedCat(e.target.value)}>
                            <option value="">All Categories</option>
                            {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                        </select>
                        <div className="ro-search-wrap">
                            <Search size={16} className="ro-search-icon" />
                            <input className="ro-search-input" placeholder="Search products…"
                                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            {searchTerm && <button type="button" className="ro-search-clear" onClick={() => setSearchTerm('')}><X size={14} /></button>}
                        </div>
                    </motion.div>

                    <motion.div className="ro-slider-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                        {loading ? (
                            <div className="ro-msg-box"><Loader2 className="ro-spinner" size={28} /><span>Loading…</span></div>
                        ) : filtered.length > 0 ? (
                            <Swiper modules={[FreeMode, Navigation]} spaceBetween={14} slidesPerView={window.innerWidth < 768 ? 1.5 : "auto"} navigation className="ro-product-swiper">
                                {filtered.map((p, idx) => {
                                    const inCart = cart.find(i => i.productId === p._id);
                                    return (
                                        <SwiperSlide key={p._id} className="ro-slide">
                                            <motion.div
                                                className={`ro-product-card ${inCart ? 'ro-product-card--in-cart' : ''}`}
                                                onClick={() => addToCart(p)}
                                                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                                                whileHover={{ y: -4, boxShadow: '0 12px 28px rgba(93,46,12,0.18)' }} whileTap={{ scale: 0.95 }}>
                                                <div className="ro-card-img-wrap">
                                                    <img src={p.productimage} alt={p.name} className="ro-card-img" />
                                                    <div className="ro-card-overlay">{inCart ? <Check size={20} /> : <Plus size={20} />}</div>
                                                    {inCart && (
                                                        <motion.span className="ro-card-qty-badge" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                                            {inCart.quantity}
                                                        </motion.span>
                                                    )}
                                                </div>
                                                <div className="ro-card-info">
                                                    <h4 className="ro-card-name">{p.name}</h4>
                                                    <p className="ro-card-price">₹{p.wholesaleprice}</p>
                                                </div>
                                            </motion.div>
                                        </SwiperSlide>
                                    );
                                })}
                            </Swiper>
                        ) : (
                            <div className="ro-msg-box">
                                <ClipboardList size={32} />
                                <span>{selectedCat ? 'No products found.' : 'Choose a category above to browse products.'}</span>
                            </div>
                        )}
                    </motion.div>

                    <div className="ro-selected-section">
                        <div className="ro-selected-header">
                            <h3 className="ro-selected-title"><ClipboardList size={18} /> Selected Items</h3>
                            {cart.length > 0 && <span className="ro-selected-count">{cart.length} item{cart.length !== 1 ? 's' : ''}</span>}
                        </div>

                        <AnimatePresence>
                            {cart.length === 0 ? (
                                <motion.p className="ro-empty-msg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    No items added yet. Tap a product above to start.
                                </motion.p>
                            ) : cart.map((item, idx) => (
                                <motion.div key={item.productId} className="ro-list-item" layout
                                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                                    exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}>
                                    <img src={item.image} alt={item.name} className="ro-list-img" />
                                    <div className="ro-list-info">
                                        <span className="ro-list-name">{item.name}</span>
                                        <span className="ro-list-cat">{item.category}</span>
                                        <div className="ro-list-actions">
                                            <div className="ro-qty-box">
                                                <button type="button" onClick={() => updateQty(item.productId, -1)}><Minus size={11} /></button>
                                                <input type="number" className="ro-qty-input"
                                                    value={item.quantity}
                                                    onChange={e => setQtyDirect(item.productId, parseInt(e.target.value))}
                                                    onBlur={e => { if (!e.target.value || parseInt(e.target.value) < 1) setQtyDirect(item.productId, 1); }} />
                                                <button type="button" onClick={() => updateQty(item.productId, 1)}><Plus size={11} /></button>
                                            </div>
                                            <button type="button" className="ro-del-btn" onClick={() => removeFromCart(item.productId)}>
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="ro-list-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Address Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div className="ro-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setShowModal(false)}>
                        <motion.div className="ro-modal"
                            initial={{ scale: 0.92, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.92, opacity: 0, y: 20 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                            <div className="ro-modal-header">
                                <h3>Add New Address</h3>
                                <button type="button" className="ro-modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
                            </div>
                            <div className="ro-modal-body">
                                <input className="ro-modal-input" placeholder="Street / Area" value={newAddr.street}
                                    onChange={e => setNewAddr({ ...newAddr, street: e.target.value })} />
                                <input className="ro-modal-input" placeholder="City" value={newAddr.city}
                                    onChange={e => setNewAddr({ ...newAddr, city: e.target.value })} />
                                <div className="ro-modal-row">
                                    <input className="ro-modal-input" placeholder="State" value={newAddr.state}
                                        onChange={e => setNewAddr({ ...newAddr, state: e.target.value })} />
                                    <input className="ro-modal-input" placeholder="ZIP Code" maxLength={6} value={newAddr.zipCode}
                                        onChange={e => setNewAddr({ ...newAddr, zipCode: e.target.value })} />
                                </div>
                            </div>
                            <div className="ro-modal-actions">
                                <button type="button" className="ro-modal-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="button" className="ro-modal-save" onClick={handleSaveAddr}
                                    disabled={!newAddr.street || newAddr.zipCode.length !== 6 || isSaving}>
                                    {isSaving ? 'Saving…' : 'Save Address'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Toast message={toast.msg} show={toast.show} onClose={() => setToast({ ...toast, show: false })} />
        </div>
    );
};

export default Retailerorder;

