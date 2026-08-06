import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, ArrowLeft, Download, CheckCircle, Clock, ShoppingBag, MapPin, Printer } from 'lucide-react';
import './TrackOrder.css';
import { getOrderById } from '@/src/services/orderService';

/* ─────────────────────────────────────────
   Type Definitions Match Your API Response
───────────────────────────────────────── */
interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
}

interface OrderItem {
  id: number;
  price: number;
  quantity: number;
  line_total: number;
  product: Product;
  selectedAddOns?: string[];
  add_ons?: string[];
  addons?: string[];
  custom_json?: any;
}

interface Customer {
  first_name: string;
  last_name: string;
  email: string;
  phone_no: string;
}

interface DetailedOrder {
  id: number;
  order_number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  total: number;
  subtotal: number;
  discount: number;
  delivery_charge: number;
  currency?: string;
  order_addons?: {
    addon_id: number;
    addon_name?: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  order_addons_total?: number;
  created_at: string;
  order_type: string;
  customer: Customer;
  delivery_address: DeliveryAddress;
  items: OrderItem[];
}

const extractItemAddOns = (item: OrderItem): string[] => {
  const rawAddOns =
    item.selectedAddOns ||
    item.add_ons ||
    item.addons ||
    item.custom_json?.selectedAddOns ||
    item.custom_json?.add_ons ||
    item.custom_json?.addons ||
    item.custom_json?.selected_add_ons;

  if (Array.isArray(rawAddOns)) {
    return rawAddOns.filter(Boolean).map(String);
  }

  if (typeof rawAddOns === 'string') {
    return rawAddOns.split(',').map((value) => value.trim()).filter(Boolean);
  }

  return [];
};

/* Same convention used in Orders.tsx: INR gets the ₹ glyph, everything
   else (KWD, AED, USD, SAR, SGD, ...) is shown as its currency code. */
const getCurrencySymbol = (currency?: string): string => {
  const cur = (currency || 'INR').toUpperCase();
  return cur === 'INR' ? '₹' : cur;
};

const formatPrice = (amount: number, currency?: string): string =>
  `${getCurrencySymbol(currency)}${Number(amount || 0).toFixed(2)}`;

const TrackOrder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<DetailedOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showReceipt, setShowReceipt] = useState<boolean>(false);

  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getOrderById(Number(id));
      setOrder(data);
    } catch (err: any) {
      console.error('Track order fetch error:', err);
      setError(err.response?.data?.message ?? 'Failed to retrieve order tracking information.');
    } finally {
      setLoading(false);
    }
  };

  if (id) fetchOrderDetails();
}, [id]);

  // Handle system printing of the targeted receipt node
  const handlePrint = () => {
    const printContent = receiptRef.current?.innerHTML;
    const originalContent = document.body.innerHTML;

    if (printContent) {
      document.body.innerHTML = printContent;
      window.print();
      window.location.reload(); // Restores state/React safely after print window closes
    }
  };

  if (loading) {
    return (
      <div className="to-page-center">
        <Loader2 className="to-spinner" size={48} />
        <p>Loading tracking data details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="to-error-container">
        <AlertCircle size={48} color="#B95E82" />
        <h2>Tracking Error</h2>
        <p>{error || 'Order record could not be processed.'}</p>
        <Link to="/orders" className="to-btn-primary"><ArrowLeft size={16} /> Back to Orders</Link>
      </div>
    );
  }

  // Currency for this specific order — set at checkout, not a global default
  const currency = order.currency || 'INR';
  const symbol = getCurrencySymbol(currency);

  // Formatting helpers
  const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const orderTime = new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  // Map backend status explicitly across an expected timeline
  const statusSteps = ['PENDING', 'CONFIRMED', 'KITCHEN_ASSIGNED', 'DELIVERING', 'DELIVERED'];
  const currentStatusIndex = statusSteps.indexOf(
    (order.status ?? "").toUpperCase()
  );

  const addonsTotal = Number(order.order_addons_total ?? (order.order_addons?.reduce((s, a) => s + Number(a.total ?? (a.price * a.quantity || 0)), 0) || 0));
const itemSubtotal = Number(order.subtotal ?? (order.items?.reduce((s, i) => s + Number(i.line_total ?? (i.price * i.quantity || 0)), 0) || 0));
const computedGrandTotal = Number(order.total ?? (itemSubtotal + addonsTotal - Number(order.discount || 0) + Number(order.delivery_charge || 0)));

  return (
    <div className="to-container">
      <div className="to-wrapper">

        {/* Top bar Actions */}
        <div className="to-header">
          <Link to="/orders" className="to-back-btn">
            <ArrowLeft size={18} /> <span>Back to Orders</span>
          </Link>
          <button className="to-btn-primary" onClick={() => setShowReceipt(true)}>
            <Download size={16} /> Receipt
          </button>
        </div>

        {/* Dashboard Split Grid Layout */}
        <div className="to-main-grid">

          {/* LEFT COLUMN: Tracking metrics & Timeline */}
          <div className="to-panel-left">
            <div className="to-card-header-block">
              <div>
                <span className="to-badge-status">{order.status}</span>
                <h2>Order #{order.order_number || String(order.id).padStart(6, '0')}</h2>
                <p className="to-meta-text">Placed on {orderDate} at {orderTime}</p>
              </div>
            </div>

            {/* Tracking Progress Node Visualizer */}
            <div className="to-timeline-card">
              <h3>Shipment Status</h3>
              <div className="to-timeline">
                {statusSteps.map((step, idx) => {
                  const isCompleted = idx <= currentStatusIndex;
                  const isCurrent = idx === currentStatusIndex;

                  return (
                    <div key={step} className={`to-timeline-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'active' : ''}`}>
                      <div className="to-timeline-icon">
                        {isCompleted ? <CheckCircle size={18} /> : <Clock size={16} />}
                      </div>
                      <div className="to-timeline-content">
                        <h4>{step.replace('_', ' ')}</h4>
                        {isCurrent && <p className="to-active-tag">Your package is currently in this stage.</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Address Information block */}
            <div className="to-info-card">
              <div className="to-card-title-with-icon">
                <MapPin size={18} /> <h3>Delivery Address</h3>
              </div>
              <p className="to-address-name"><strong>{order.customer.first_name} {order.customer.last_name}</strong></p>
              <p>{order.delivery_address.street}</p>
              <p>{order.delivery_address.city}, {order.delivery_address.state} - {order.delivery_address.pincode}</p>
              <p>{order.delivery_address.country}</p>
              <p className="to-meta-text" style={{ marginTop: '8px' }}>Phone: {order.customer.phone_no}</p>
            </div>
          </div>

          {/* RIGHT COLUMN: Order Items and Cost breakdown */}
          <div className="to-panel-right">
            <div className="to-info-card">
              <div className="to-card-title-with-icon">
                <ShoppingBag size={18} /> <h3>Items Summary</h3>
              </div>
              <div className="to-items-list">
                {order.items.map((item) => (
                  <div key={item.id} className="to-product-row">
                    <img src={item.product?.image_url || 'https://via.placeholder.com/60'} alt={item.product?.name} className="to-product-img" />
                    <div className="to-product-details">
                      <h4>{item.product?.name}</h4>
                      <p className="to-meta-text">Qty: {item.quantity}</p>
                    </div>
                    <span className="to-product-price">{formatPrice(item.price, currency)}</span>
                  </div>
                ))}
              </div>

              {/* Cost Calculations Breakdown */}
              <div className="to-pricing-breakdown">
                <div className="to-price-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(itemSubtotal, currency)}</span>
                </div>
                {addonsTotal > 0 && (
                  <div className="to-price-row addons">
                    <span>Add-ons</span>
                    <span>{formatPrice(addonsTotal, currency)}</span>
                  </div>
                )}
                {order.discount > 0 && (
                  <div className="to-price-row discount">
                    <span>Loyalty Discount</span>
                    <span>-{formatPrice(order.discount, currency)}</span>
                  </div>
                )}
                <div className="to-price-row">
                  <span>Delivery Fees</span>
                  <span>{formatPrice(order.delivery_charge, currency)}</span>
                </div>
                <hr className="to-divider" />
                <div className="to-price-row total">
                  <span>Grand Total</span>
                  <span>{formatPrice(computedGrandTotal, currency)}</span>
                </div>
              </div>

              {/* Payment Status Info Block */}
              <div className="to-payment-footer">
                <p><strong>Payment Mode:</strong> {order.payment_method?.toUpperCase()}</p>
                <p><strong>Status:</strong> <span className={`status-${order.payment_status?.toLowerCase()}`}>{order.payment_status}</span></p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ─────────────────────────────────────────
         MODAL OVERLAY: PRINTABLE BILL RECEIPT
      ───────────────────────────────────────── */}
      <AnimatePresence>
        {showReceipt && (
          <motion.div
            className="to-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="to-modal-card"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="to-modal-actions">
                {/* <button className="to-print-action-btn" onClick={handlePrint}>
                  <Printer size={16} /> Print Receipt
                </button> */}
                <button className="to-close-action-btn" onClick={() => setShowReceipt(false)}>Dismiss</button>
              </div>

              {/* Print Bound Structural Container */}
              <div className="to-receipt-print-area" ref={receiptRef}>
                <div className="receipt-paper">
                  <div className="receipt-center">
                                <div className="receipt-crown-title">
  <img
    src="/assets/logo.png"
    alt="Cake N Take"
    className="receipt-logo"
  />
</div>
                    <h2 className="receipt-brand">CAKENTAKE</h2>
                    <p className="receipt-address">No.8, Mezzanine Floor, Al Musallam Complex, Al Othman Street, Hawally, Kuwait</p>
                    <p className="receipt-customer">Customer: {order.customer.first_name} {order.customer.last_name}</p>
                    <p className="receipt-contact">PH: {order.customer.phone_no || '+1 (555) 100-2000'}</p>
                  </div>

                  <div className="receipt-divider">-----------------------------------------</div>

                  <div className="receipt-meta">
                    <p><strong>Order ID:</strong> {order.order_number || order.id}</p>
                    <p><strong>Date:</strong> {orderDate}</p>
                    <p><strong>Time:</strong> {orderTime}</p>
                    <p><strong>Payment Mode:</strong> {order.payment_method?.toUpperCase()}</p>
                  </div>

                  <div className="receipt-divider">-----------------------------------------</div>

                  <div className="receipt-items-table">
                    {order.items.map((item) => {
                      const itemAddOns = extractItemAddOns(item);
                      return (
                        <div key={item.id} className="receipt-item-row">
                          <div className="receipt-item-main">
                            <span className="receipt-item-name">{item.quantity} x {item.product?.name}</span>
                            <span className="receipt-item-price">
                              {formatPrice(item.line_total || (item.price * item.quantity), currency)}
                            </span>
                          </div>
                          {itemAddOns.length > 0 && (
                            <div className="receipt-item-addons">Add-ons: {itemAddOns.join(', ')}</div>
                          )}
                        </div>
                      );
                    })}
                    {/* {order.order_addons?.length > 0 && (
                      <>
                        <div className="receipt-divider">-----------------------------------------</div>
                        {order.order_addons.map((addon) => (
                          <div key={`${addon.addon_id}-${addon.quantity}`} className="receipt-item-row receipt-addon-row">
                            <div className="receipt-item-main">
                              <span className="receipt-item-name">{addon.quantity} × {addon.addon_name || `Addon #${addon.addon_id}`}</span>
                              <span className="receipt-item-price">{formatPrice(addon.total, currency)}</span>
                            </div>
                          </div>
                        ))}
                      </>
                    )} */}

                     {order.order_addons && order.order_addons.length > 0 && (
  <>
    <div className="receipt-divider">-----------------------------------------</div>
    {order.order_addons.map((addon) => (
      <div key={`${addon.addon_id}-${addon.quantity}`} className="receipt-item-row receipt-addon-row">
        <div className="receipt-item-main">
          <span className="receipt-item-name">{addon.quantity} × {addon.addon_name || `Addon #${addon.addon_id}`}</span>
          <span className="receipt-item-price">{formatPrice(addon.total, currency)}</span>
        </div>
      </div>
    ))}
  </>
)}

                  </div>

                  <div className="receipt-divider">-----------------------------------------</div>

                  <div className="receipt-totals">
                    <div className="receipt-total-row">
                      <span>Subtotal:</span>
                      <span>{formatPrice(itemSubtotal, currency)}</span>
                    </div>
                    {addonsTotal > 0 && (
                      <div className="receipt-total-row">
                        <span>Add-ons:</span>
                        <span>{formatPrice(addonsTotal, currency)}</span>
                      </div>
                    )}
                    {order.discount > 0 && (
                      <div className="receipt-total-row">
                        <span>Loyalty Discount:</span>
                        <span>-{formatPrice(order.discount, currency)}</span>
                      </div>
                    )}
                    <div className="receipt-total-row">
                      <span>Delivery:</span>
                      <span>{formatPrice(order.delivery_charge, currency)}</span>
                    </div>

                    <div className="receipt-divider">-----------------------------------------</div>

                    <div className="receipt-total-row grand-total">
                      <span>GRAND TOTAL:</span>
                      <span>{formatPrice(computedGrandTotal, currency)}</span>
                    </div>
                  </div>

                  <div className="receipt-divider">-----------------------------------------</div>

                  <div className="receipt-center receipt-footer-msg">
                    <p>Thank you for dining with CakeNTake!</p>
                    <p>Baked fresh daily, prepared artisanally.</p>
                    <p className="receipt-url">www.cakentake.com</p>
                  </div>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TrackOrder;