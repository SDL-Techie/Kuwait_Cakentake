// // // import React, { useState, useEffect, useRef } from 'react';
// // // import { useParams, Link } from 'react-router-dom';
// // // import { motion, AnimatePresence } from 'framer-motion';
// // // import { Loader2, AlertCircle, ArrowLeft, Download, CheckCircle, Clock, ShoppingBag, MapPin, Printer, XCircle } from 'lucide-react';
// // // import './TrackOrder.css';
// // // import { getOrderById, cancelOrder } from '@/src/services/orderService';
// // // import { getDisplayOrderNumber } from '@/src/utils/orderNumber';

// // // /* ─────────────────────────────────────────
// // //    Type Definitions Match Your API Response
// // // ───────────────────────────────────────── */
// // // interface DeliveryAddress {
// // //   street: string;
// // //   city: string;
// // //   state: string;
// // //   country: string;
// // //   pincode: string;
// // // }

// // // interface Product {
// // //   id: number;
// // //   name: string;
// // //   description: string;
// // //   price: number;
// // //   image_url: string;
// // // }

// // // interface OrderItem {
// // //   id: number;
// // //   price: number;
// // //   quantity: number;
// // //   line_total: number;
// // //   product: Product;
// // //   selectedAddOns?: string[];
// // //   add_ons?: string[];
// // //   addons?: string[];
// // //   custom_json?: any;
// // // }

// // // interface Customer {
// // //   first_name: string;
// // //   last_name: string;
// // //   email: string;
// // //   phone_no: string;
// // // }

// // // interface DetailedOrder {
// // //   id: number;
// // //   order_number: string;
// // //   status: string;
// // //   payment_method: string;
// // //   payment_status: string;
// // //   total: number;
// // //   subtotal: number;
// // //   discount: number;
// // //   delivery_charge: number;
// // //   currency?: string;
// // //   order_addons?: {
// // //     addon_id: number;
// // //     addon_name?: string;
// // //     quantity: number;
// // //     price: number;
// // //     total: number;
// // //   }[];
// // //   order_addons_total?: number;
// // //   created_at: string;
// // //   order_type: string;
// // //   customer: Customer;
// // //   delivery_address: DeliveryAddress;
// // //   items: OrderItem[];
// // // }

// // // const extractItemAddOns = (item: OrderItem): string[] => {
// // //   const rawAddOns =
// // //     item.selectedAddOns ||
// // //     item.add_ons ||
// // //     item.addons ||
// // //     item.custom_json?.selectedAddOns ||
// // //     item.custom_json?.add_ons ||
// // //     item.custom_json?.addons ||
// // //     item.custom_json?.selected_add_ons;

// // //   if (Array.isArray(rawAddOns)) {
// // //     return rawAddOns.filter(Boolean).map(String);
// // //   }

// // //   if (typeof rawAddOns === 'string') {
// // //     return rawAddOns.split(',').map((value) => value.trim()).filter(Boolean);
// // //   }

// // //   return [];
// // // };

// // // /* Same convention used in Orders.tsx: INR gets the ₹ glyph, everything
// // //    else (KWD, AED, USD, SAR, SGD, ...) is shown as its currency code. */
// // // const getCurrencySymbol = (currency?: string): string => {
// // //   const cur = (currency || 'INR').toUpperCase();
// // //   return cur === 'INR' ? '₹' : cur;
// // // };

// // // const formatPrice = (amount: number, currency?: string): string =>
// // //   `${getCurrencySymbol(currency)}${Number(amount || 0).toFixed(2)}`;

// // // const TrackOrder: React.FC = () => {
// // //   const { id } = useParams<{ id: string }>();
// // //   const [order, setOrder] = useState<DetailedOrder | null>(null);
// // //   const [loading, setLoading] = useState<boolean>(true);
// // //   const [error, setError] = useState<string | null>(null);
// // //   const [showReceipt, setShowReceipt] = useState<boolean>(false);

// // //   // Cancel-order state
// // //   const [cancelling, setCancelling] = useState<boolean>(false);
// // //   const [cancelError, setCancelError] = useState<string | null>(null);

// // //   const receiptRef = useRef<HTMLDivElement>(null);

// // //   useEffect(() => {
// // //   const fetchOrderDetails = async () => {
// // //     try {
// // //       setLoading(true);
// // //       setError(null);

// // //       const data = await getOrderById(Number(id));
// // //       setOrder(data);
// // //     } catch (err: any) {
// // //       console.error('Track order fetch error:', err);
// // //       setError(err.response?.data?.message ?? 'Failed to retrieve order tracking information.');
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   if (id) fetchOrderDetails();
// // // }, [id]);

// // //   // Handle system printing of the targeted receipt node
// // //   const handlePrint = () => {
// // //     const printContent = receiptRef.current?.innerHTML;
// // //     const originalContent = document.body.innerHTML;

// // //     if (printContent) {
// // //       document.body.innerHTML = printContent;
// // //       window.print();
// // //       window.location.reload(); // Restores state/React safely after print window closes
// // //     }
// // //   };

// // //   // Handle customer-initiated order cancellation
// // //   const handleCancelOrder = async () => {
// // //     if (!order) return;

// // //     const confirmed = window.confirm('Are you sure you want to cancel this order? This cannot be undone.');
// // //     if (!confirmed) return;

// // //     try {
// // //       setCancelling(true);
// // //       setCancelError(null);

// // //       const result = await cancelOrder(order.id);
// // //       const newStatus = result?.status || result?.order?.status || 'CANCELLED';

// // //       setOrder((prev) => (prev ? { ...prev, status: newStatus } : prev));
// // //     } catch (err: any) {
// // //       console.error('Cancel order error:', err);
// // //       setCancelError(err.response?.data?.message ?? 'Failed to cancel order.');
// // //     } finally {
// // //       setCancelling(false);
// // //     }
// // //   };

// // //   if (loading) {
// // //     return (
// // //       <div className="to-page-center">
// // //         <Loader2 className="to-spinner" size={48} />
// // //         <p>Loading tracking data details...</p>
// // //       </div>
// // //     );
// // //   }

// // //   if (error || !order) {
// // //     return (
// // //       <div className="to-error-container">
// // //         <AlertCircle size={48} color="#B95E82" />
// // //         <h2>Tracking Error</h2>
// // //         <p>{error || 'Order record could not be processed.'}</p>
// // //         <Link to="/orders" className="to-btn-primary"><ArrowLeft size={16} /> Back to Orders</Link>
// // //       </div>
// // //     );
// // //   }

// // //   // Currency for this specific order — set at checkout, not a global default
// // //   const currency = order.currency || 'INR';
// // //   const symbol = getCurrencySymbol(currency);

// // //   // Formatting helpers
// // //   const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
// // //   const orderTime = new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

// // //   // Map backend status explicitly across an expected timeline
// // //   const statusSteps = ['PENDING', 'CONFIRMED', 'KITCHEN_ASSIGNED', 'DELIVERING', 'DELIVERED'];
// // //   const currentStatusIndex = statusSteps.indexOf(
// // //     (order.status ?? "").toUpperCase()
// // //   );

// // //   // Cancellation eligibility: customer can only cancel BEFORE the order
// // //   // reaches the kitchen. Once it's KITCHEN_ASSIGNED (or later), or if it's
// // //   // already CANCELLED, cancellation is no longer allowed.
// // //   const kitchenAssignedIndex = statusSteps.indexOf('KITCHEN_ASSIGNED');
// // //   const isCancelled = (order.status ?? '').toUpperCase() === 'CANCELLED';
// // //   const canCancel =
// // //     !isCancelled &&
// // //     currentStatusIndex > -1 &&
// // //     currentStatusIndex < kitchenAssignedIndex;
// // //   const pastCancellationWindow =
// // //     !isCancelled && currentStatusIndex >= kitchenAssignedIndex;

// // //   const addonsTotal = Number(order.order_addons_total ?? (order.order_addons?.reduce((s, a) => s + Number(a.total ?? (a.price * a.quantity || 0)), 0) || 0));
// // // const itemSubtotal = Number(order.subtotal ?? (order.items?.reduce((s, i) => s + Number(i.line_total ?? (i.price * i.quantity || 0)), 0) || 0));
// // // const computedGrandTotal = Number(order.total ?? (itemSubtotal + addonsTotal - Number(order.discount || 0) + Number(order.delivery_charge || 0)));

// // //   return (
// // //     <div className="to-container">
// // //       <div className="to-wrapper">

// // //         {/* Top bar Actions */}
// // //         <div className="to-header">
// // //           <Link to="/orders" className="to-back-btn">
// // //             <ArrowLeft size={18} /> <span>Back to Orders</span>
// // //           </Link>
// // //           <div className="to-header-actions">
// // //             {canCancel && (
// // //               <button
// // //                 className="to-btn-danger"
// // //                 onClick={handleCancelOrder}
// // //                 disabled={cancelling}
// // //               >
// // //                 {cancelling ? (
// // //                   <Loader2 size={16} className="to-spinner-inline" />
// // //                 ) : (
// // //                   <XCircle size={16} />
// // //                 )}
// // //                 {cancelling ? 'Cancelling...' : 'Cancel Order'}
// // //               </button>
// // //             )}
// // //             <button className="to-btn-primary" onClick={() => setShowReceipt(true)}>
// // //               <Download size={16} /> Receipt
// // //             </button>
// // //           </div>
// // //         </div>

// // //         {/* Dashboard Split Grid Layout */}
// // //         <div className="to-main-grid">

// // //           {/* LEFT COLUMN: Tracking metrics & Timeline */}
// // //           <div className="to-panel-left">
// // //             <div className="to-card-header-block">
// // //               <div>
// // //                 <span className="to-badge-status">{order.status}</span>
// // //                 <h2>Order #{getDisplayOrderNumber(order, 15000)}</h2>
// // //                 <p className="to-meta-text">Placed on {orderDate} at {orderTime}</p>
// // //               </div>
// // //             </div>

// // //             {/* Cancel-order feedback messages */}
// // //             {cancelError && (
// // //               <div className="to-cancel-error">
// // //                 <AlertCircle size={16} /> {cancelError}
// // //               </div>
// // //             )}
// // //             {isCancelled && (
// // //               <div className="to-cancel-note">
// // //                 This order has been cancelled.
// // //               </div>
// // //             )}
// // //             {pastCancellationWindow && (
// // //               <div className="to-cancel-note">
// // //                 This order is already being prepared and can no longer be cancelled.
// // //               </div>
// // //             )}

// // //             {/* Tracking Progress Node Visualizer */}
// // //             <div className="to-timeline-card">
// // //               <h3>Shipment Status</h3>
// // //               <div className="to-timeline">
// // //                 {statusSteps.map((step, idx) => {
// // //                   const isCompleted = idx <= currentStatusIndex;
// // //                   const isCurrent = idx === currentStatusIndex;

// // //                   return (
// // //                     <div key={step} className={`to-timeline-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'active' : ''}`}>
// // //                       <div className="to-timeline-icon">
// // //                         {isCompleted ? <CheckCircle size={18} /> : <Clock size={16} />}
// // //                       </div>
// // //                       <div className="to-timeline-content">
// // //                         <h4>{step.replace('_', ' ')}</h4>
// // //                         {isCurrent && <p className="to-active-tag">Your package is currently in this stage.</p>}
// // //                       </div>
// // //                     </div>
// // //                   );
// // //                 })}
// // //               </div>
// // //             </div>

// // //             {/* Address Information block */}
// // //             <div className="to-info-card">
// // //               <div className="to-card-title-with-icon">
// // //                 <MapPin size={18} /> <h3>Delivery Address</h3>
// // //               </div>
// // //               <p className="to-address-name"><strong>{order.customer.first_name} {order.customer.last_name}</strong></p>
// // //               <p>{order.delivery_address.street}</p>
// // //               <p>{order.delivery_address.city}, {order.delivery_address.state} - {order.delivery_address.pincode}</p>
// // //               <p>{order.delivery_address.country}</p>
// // //               <p className="to-meta-text" style={{ marginTop: '8px' }}>Phone: {order.customer.phone_no}</p>
// // //             </div>
// // //           </div>

// // //           {/* RIGHT COLUMN: Order Items and Cost breakdown */}
// // //           <div className="to-panel-right">
// // //             <div className="to-info-card">
// // //               <div className="to-card-title-with-icon">
// // //                 <ShoppingBag size={18} /> <h3>Items Summary</h3>
// // //               </div>
// // //               <div className="to-items-list">
// // //                 {order.items.map((item) => (
// // //                   <div key={item.id} className="to-product-row">
// // //                     <img src={item.product?.image_url || 'https://via.placeholder.com/60'} alt={item.product?.name} className="to-product-img" />
// // //                     <div className="to-product-details">
// // //                       <h4>{item.product?.name}</h4>
// // //                       <p className="to-meta-text">Qty: {item.quantity}</p>
// // //                     </div>
// // //                     <span className="to-product-price">{formatPrice(item.price, currency)}</span>
// // //                   </div>
// // //                 ))}
// // //               </div>

// // //               {/* Cost Calculations Breakdown */}
// // //               <div className="to-pricing-breakdown">
// // //                 <div className="to-price-row">
// // //                   <span>Subtotal</span>
// // //                   <span>{formatPrice(itemSubtotal, currency)}</span>
// // //                 </div>
// // //                 {addonsTotal > 0 && (
// // //                   <div className="to-price-row addons">
// // //                     <span>Add-ons</span>
// // //                     <span>{formatPrice(addonsTotal, currency)}</span>
// // //                   </div>
// // //                 )}
// // //                 {order.discount > 0 && (
// // //                   <div className="to-price-row discount">
// // //                     <span>Loyalty Discount</span>
// // //                     <span>-{formatPrice(order.discount, currency)}</span>
// // //                   </div>
// // //                 )}
// // //                 <div className="to-price-row">
// // //                   <span>Delivery Fees</span>
// // //                   <span>{formatPrice(order.delivery_charge, currency)}</span>
// // //                 </div>
// // //                 <hr className="to-divider" />
// // //                 <div className="to-price-row total">
// // //                   <span>Grand Total</span>
// // //                   <span>{formatPrice(computedGrandTotal, currency)}</span>
// // //                 </div>
// // //               </div>

// // //               {/* Payment Status Info Block */}
// // //               <div className="to-payment-footer">
// // //                 <p><strong>Payment Mode:</strong> {order.payment_method?.toUpperCase()}</p>
// // //                 <p><strong>Status:</strong> <span className={`status-${order.payment_status?.toLowerCase()}`}>{order.payment_status}</span></p>
// // //               </div>
// // //             </div>
// // //           </div>

// // //         </div>
// // //       </div>

// // //       {/* ─────────────────────────────────────────
// // //          MODAL OVERLAY: PRINTABLE BILL RECEIPT
// // //       ───────────────────────────────────────── */}
// // //       <AnimatePresence>
// // //         {showReceipt && (
// // //           <motion.div
// // //             className="to-modal-overlay"
// // //             initial={{ opacity: 0 }}
// // //             animate={{ opacity: 1 }}
// // //             exit={{ opacity: 0 }}
// // //           >
// // //             <motion.div
// // //               className="to-modal-card"
// // //               initial={{ scale: 0.9, y: 20 }}
// // //               animate={{ scale: 1, y: 0 }}
// // //               exit={{ scale: 0.9, y: 20 }}
// // //             >
// // //               <div className="to-modal-actions">
// // //                 {/* <button className="to-print-action-btn" onClick={handlePrint}>
// // //                   <Printer size={16} /> Print Receipt
// // //                 </button> */}
// // //                 <button className="to-close-action-btn" onClick={() => setShowReceipt(false)}>Dismiss</button>
// // //               </div>

// // //               {/* Print Bound Structural Container */}
// // //               <div className="to-receipt-print-area" ref={receiptRef}>
// // //                 <div className="receipt-paper">
// // //                   <div className="receipt-center">
// // //                                 <div className="receipt-crown-title">
// // //   <img
// // //     src="/assets/logo.png"
// // //     alt="Cake N Take"
// // //     className="receipt-logo"
// // //   />
// // // </div>
// // //                     <h2 className="receipt-brand">CAKENTAKE</h2>
// // //                     <p className="receipt-address">No.8, Mezzanine Floor, Al Musallam Complex, Al Othman Street, Hawally, Kuwait</p>
// // //                     <p className="receipt-customer">Customer: {order.customer.first_name} {order.customer.last_name}</p>
// // //                     <p className="receipt-contact">PH: {order.customer.phone_no || '+1 (555) 100-2000'}</p>
// // //                   </div>

// // //                   <div className="receipt-divider">-----------------------------------------</div>

// // //                   <div className="receipt-meta">
// // //                     <p><strong>Order ID:</strong> {order.order_number || order.id}</p>
// // //                     <p><strong>Date:</strong> {orderDate}</p>
// // //                     <p><strong>Time:</strong> {orderTime}</p>
// // //                     <p><strong>Payment Mode:</strong> {order.payment_method?.toUpperCase()}</p>
// // //                   </div>

// // //                   <div className="receipt-divider">-----------------------------------------</div>

// // //                   <div className="receipt-items-table">
// // //                     {order.items.map((item) => {
// // //                       const itemAddOns = extractItemAddOns(item);
// // //                       return (
// // //                         <div key={item.id} className="receipt-item-row">
// // //                           <div className="receipt-item-main">
// // //                             <span className="receipt-item-name">{item.quantity} x {item.product?.name}</span>
// // //                             <span className="receipt-item-price">
// // //                               {formatPrice(item.line_total || (item.price * item.quantity), currency)}
// // //                             </span>
// // //                           </div>
// // //                           {itemAddOns.length > 0 && (
// // //                             <div className="receipt-item-addons">Add-ons: {itemAddOns.join(', ')}</div>
// // //                           )}
// // //                         </div>
// // //                       );
// // //                     })}
// // //                     {/* {order.order_addons?.length > 0 && (
// // //                       <>
// // //                         <div className="receipt-divider">-----------------------------------------</div>
// // //                         {order.order_addons.map((addon) => (
// // //                           <div key={`${addon.addon_id}-${addon.quantity}`} className="receipt-item-row receipt-addon-row">
// // //                             <div className="receipt-item-main">
// // //                               <span className="receipt-item-name">{addon.quantity} × {addon.addon_name || `Addon #${addon.addon_id}`}</span>
// // //                               <span className="receipt-item-price">{formatPrice(addon.total, currency)}</span>
// // //                             </div>
// // //                           </div>
// // //                         ))}
// // //                       </>
// // //                     )} */}

// // //                      {order.order_addons && order.order_addons.length > 0 && (
// // //   <>
// // //     <div className="receipt-divider">-----------------------------------------</div>
// // //     {order.order_addons.map((addon) => (
// // //       <div key={`${addon.addon_id}-${addon.quantity}`} className="receipt-item-row receipt-addon-row">
// // //         <div className="receipt-item-main">
// // //           <span className="receipt-item-name">{addon.quantity} × {addon.addon_name || `Addon #${addon.addon_id}`}</span>
// // //           <span className="receipt-item-price">{formatPrice(addon.total, currency)}</span>
// // //         </div>
// // //       </div>
// // //     ))}
// // //   </>
// // // )}

// // //                   </div>

// // //                   <div className="receipt-divider">-----------------------------------------</div>

// // //                   <div className="receipt-totals">
// // //                     <div className="receipt-total-row">
// // //                       <span>Subtotal:</span>
// // //                       <span>{formatPrice(itemSubtotal, currency)}</span>
// // //                     </div>
// // //                     {addonsTotal > 0 && (
// // //                       <div className="receipt-total-row">
// // //                         <span>Add-ons:</span>
// // //                         <span>{formatPrice(addonsTotal, currency)}</span>
// // //                       </div>
// // //                     )}
// // //                     {order.discount > 0 && (
// // //                       <div className="receipt-total-row">
// // //                         <span>Loyalty Discount:</span>
// // //                         <span>-{formatPrice(order.discount, currency)}</span>
// // //                       </div>
// // //                     )}
// // //                     <div className="receipt-total-row">
// // //                       <span>Delivery:</span>
// // //                       <span>{formatPrice(order.delivery_charge, currency)}</span>
// // //                     </div>

// // //                     <div className="receipt-divider">-----------------------------------------</div>

// // //                     <div className="receipt-total-row grand-total">
// // //                       <span>GRAND TOTAL:</span>
// // //                       <span>{formatPrice(computedGrandTotal, currency)}</span>
// // //                     </div>
// // //                   </div>

// // //                   <div className="receipt-divider">-----------------------------------------</div>

// // //                   <div className="receipt-center receipt-footer-msg">
// // //                     <p>Thank you for dining with CakeNTake!</p>
// // //                     <p>Baked fresh daily, prepared artisanally.</p>
// // //                     <p className="receipt-url">www.cakentake.com</p>
// // //                   </div>
// // //                 </div>
// // //               </div>

// // //             </motion.div>
// // //           </motion.div>
// // //         )}
// // //       </AnimatePresence>
// // //     </div>
// // //   );
// // // };

// // // export default TrackOrder;


// // import React, { useState, useEffect, useRef } from 'react';
// // import { useParams, Link } from 'react-router-dom';
// // import { motion, AnimatePresence } from 'framer-motion';
// // import { Loader2, AlertCircle, ArrowLeft, Download, CheckCircle, Clock, ShoppingBag, MapPin, Printer, XCircle } from 'lucide-react';
// // import './TrackOrder.css';
// // import { getOrderById, cancelOrder } from '@/src/services/orderService';
// // import { getDisplayOrderNumber } from '@/src/utils/orderNumber';
// // // import {
// // //   CUSTOMER_ORDER_STAGES,
// // //   getCustomerStageIndex,
// // //   getCustomerStatusLabel,
// // //   ACCEPTED_STAGE_INDEX,
// // // } from '../../services/orderStatus';

// // import {
// //   getCustomerStages,
// //   getCustomerStageIndex,
// //   getCustomerStatusLabel,
// //   ACCEPTED_STAGE_INDEX,
// // } from '../../services/orderStatus';

// // /* ─────────────────────────────────────────
// //    Type Definitions Match Your API Response
// // ───────────────────────────────────────── */
// // interface DeliveryAddress {
// //   street: string;
// //   city: string;
// //   state: string;
// //   country: string;
// //   pincode: string;
// // }

// // interface Product {
// //   id: number;
// //   name: string;
// //   description: string;
// //   price: number;
// //   image_url: string;
// // }

// // interface OrderItem {
// //   id: number;
// //   price: number;
// //   quantity: number;
// //   line_total: number;
// //   product: Product;
// //   selectedAddOns?: string[];
// //   add_ons?: string[];
// //   addons?: string[];
// //   custom_json?: any;
// // }

// // interface Customer {
// //   first_name: string;
// //   last_name: string;
// //   email: string;
// //   phone_no: string;
// // }

// // interface DetailedOrder {
// //   id: number;
// //   order_number: string;
// //   status: string;
// //   payment_method: string;
// //   payment_status: string;
// //   total: number;
// //   subtotal: number;
// //   discount: number;
// //   delivery_charge: number;
// //   currency?: string;
// //   delivery_method?: string;          // ← add
// //   pickup_date?: string | null;       // ← add
// //   pickup_time_slot?: string | null;
// //   order_addons?: {
// //     addon_id: number;
// //     addon_name?: string;
// //     quantity: number;
// //     price: number;
// //     total: number;
// //   }[];
// //   order_addons_total?: number;
// //   created_at: string;
// //   order_type: string;
// //   customer: Customer;
// //   delivery_address: DeliveryAddress;
// //   items: OrderItem[];
// // }

// // const extractItemAddOns = (item: OrderItem): string[] => {
// //   const rawAddOns =
// //     item.selectedAddOns ||
// //     item.add_ons ||
// //     item.addons ||
// //     item.custom_json?.selectedAddOns ||
// //     item.custom_json?.add_ons ||
// //     item.custom_json?.addons ||
// //     item.custom_json?.selected_add_ons;

// //   if (Array.isArray(rawAddOns)) {
// //     return rawAddOns.filter(Boolean).map(String);
// //   }

// //   if (typeof rawAddOns === 'string') {
// //     return rawAddOns.split(',').map((value) => value.trim()).filter(Boolean);
// //   }

// //   return [];
// // };

// // /* Same convention used in Orders.tsx: INR gets the ₹ glyph, everything
// //    else (KWD, AED, USD, SAR, SGD, ...) is shown as its currency code. */
// // const getCurrencySymbol = (currency?: string): string => {
// //   const cur = (currency || 'INR').toUpperCase();
// //   return cur === 'INR' ? '₹' : cur;
// // };

// // const formatPrice = (amount: number, currency?: string): string =>
// //   `${getCurrencySymbol(currency)}${Number(amount || 0).toFixed(2)}`;

// // const TrackOrder: React.FC = () => {
// //   const { id } = useParams<{ id: string }>();
// //   const [order, setOrder] = useState<DetailedOrder | null>(null);
// //   const [loading, setLoading] = useState<boolean>(true);
// //   const [error, setError] = useState<string | null>(null);
// //   const [showReceipt, setShowReceipt] = useState<boolean>(false);

// //   // Cancel-order state
// //   const [cancelling, setCancelling] = useState<boolean>(false);
// //   const [cancelError, setCancelError] = useState<string | null>(null);

// //   const receiptRef = useRef<HTMLDivElement>(null);

// //   useEffect(() => {
// //   const fetchOrderDetails = async () => {
// //     try {
// //       setLoading(true);
// //       setError(null);

// //       const data = await getOrderById(Number(id));
// //       setOrder(data);
// //     } catch (err: any) {
// //       console.error('Track order fetch error:', err);
// //       setError(err.response?.data?.message ?? 'Failed to retrieve order tracking information.');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   if (id) fetchOrderDetails();
// // }, [id]);

// //   // Handle system printing of the targeted receipt node
// //   const handlePrint = () => {
// //     const printContent = receiptRef.current?.innerHTML;
// //     const originalContent = document.body.innerHTML;

// //     if (printContent) {
// //       document.body.innerHTML = printContent;
// //       window.print();
// //       window.location.reload(); // Restores state/React safely after print window closes
// //     }
// //   };

// //   // Handle customer-initiated order cancellation
// //   const handleCancelOrder = async () => {
// //     if (!order) return;

// //     const confirmed = window.confirm('Are you sure you want to cancel this order? This cannot be undone.');
// //     if (!confirmed) return;

// //     try {
// //       setCancelling(true);
// //       setCancelError(null);

// //       const result = await cancelOrder(order.id);
// //       const newStatus = result?.status || result?.order?.status || 'CANCELLED';

// //       setOrder((prev) => (prev ? { ...prev, status: newStatus } : prev));
// //     } catch (err: any) {
// //       console.error('Cancel order error:', err);
// //       setCancelError(err.response?.data?.message ?? 'Failed to cancel order.');
// //     } finally {
// //       setCancelling(false);
// //     }
// //   };

// //   if (loading) {
// //     return (
// //       <div className="to-page-center">
// //         <Loader2 className="to-spinner" size={48} />
// //         <p>Loading tracking data details...</p>
// //       </div>
// //     );
// //   }

// //   if (error || !order) {
// //     return (
// //       <div className="to-error-container">
// //         <AlertCircle size={48} color="#B95E82" />
// //         <h2>Tracking Error</h2>
// //         <p>{error || 'Order record could not be processed.'}</p>
// //         <Link to="/orders" className="to-btn-primary"><ArrowLeft size={16} /> Back to Orders</Link>
// //       </div>
// //     );
// //   }

// //   // Currency for this specific order — set at checkout, not a global default
// //   const currency = order.currency || 'INR';
// //   const symbol = getCurrencySymbol(currency);

// //   // Formatting helpers
// //   const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
// //   const orderTime = new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

// //   // Customer-facing timeline: only ever shows these 6 stages, regardless of
// //   // how many internal backend statuses the order actually passes through.
// //   const currentStatusIndex = getCustomerStageIndex(order.status);

// //   const isPickup = (order.delivery_method || 'DELIVERY').toUpperCase() === 'PICKUP';
// //   // Cancellation eligibility: customer can only cancel BEFORE the order
// //   // is accepted (i.e. sent to the kitchen). Once accepted, or if it's
// //   // already CANCELLED, cancellation is no longer allowed.
// //   const isCancelled = (order.status ?? '').toUpperCase() === 'CANCELLED';
// //   const canCancel =
// //     !isCancelled &&
// //     currentStatusIndex > -1 &&
// //     currentStatusIndex < ACCEPTED_STAGE_INDEX;
// //   const pastCancellationWindow =
// //     !isCancelled && currentStatusIndex >= ACCEPTED_STAGE_INDEX;

// //   const addonsTotal = Number(order.order_addons_total ?? (order.order_addons?.reduce((s, a) => s + Number(a.total ?? (a.price * a.quantity || 0)), 0) || 0));
// // const itemSubtotal = Number(order.subtotal ?? (order.items?.reduce((s, i) => s + Number(i.line_total ?? (i.price * i.quantity || 0)), 0) || 0));
// // const computedGrandTotal = Number(order.total ?? (itemSubtotal + addonsTotal - Number(order.discount || 0) + Number(order.delivery_charge || 0)));

// //   return (
// //     <div className="to-container">
// //       <div className="to-wrapper">

// //         {/* Top bar Actions */}
// //         <div className="to-header">
// //           <Link to="/orders" className="to-back-btn">
// //             <ArrowLeft size={18} /> <span>Back to Orders</span>
// //           </Link>
// //           <div className="to-header-actions">
// //             {canCancel && (
// //               <button
// //                 className="to-btn-danger"
// //                 onClick={handleCancelOrder}
// //                 disabled={cancelling}
// //               >
// //                 {cancelling ? (
// //                   <Loader2 size={16} className="to-spinner-inline" />
// //                 ) : (
// //                   <XCircle size={16} />
// //                 )}
// //                 {cancelling ? 'Cancelling...' : 'Cancel Order'}
// //               </button>
// //             )}
// //             <button className="to-btn-primary" onClick={() => setShowReceipt(true)}>
// //               <Download size={16} /> Receipt
// //             </button>
// //           </div>
// //         </div>

// //         {/* Dashboard Split Grid Layout */}
// //         <div className="to-main-grid">

// //           {/* LEFT COLUMN: Tracking metrics & Timeline */}
// //           <div className="to-panel-left">
// //             <div className="to-card-header-block">
// //               <div>
// //                 <span className="to-badge-status">{getCustomerStatusLabel(order.status)}</span>
// //                 <h2>Order #{getDisplayOrderNumber(order, 15000)}</h2>
// //                 <p className="to-meta-text">Placed on {orderDate} at {orderTime}</p>
// //               </div>
// //             </div>

// //             {/* Cancel-order feedback messages */}
// //             {cancelError && (
// //               <div className="to-cancel-error">
// //                 <AlertCircle size={16} /> {cancelError}
// //               </div>
// //             )}
// //             {isCancelled && (
// //               <div className="to-cancel-note">
// //                 This order has been cancelled.
// //               </div>
// //             )}
// //             {pastCancellationWindow && (
// //               <div className="to-cancel-note">
// //                 This order is already being prepared and can no longer be cancelled.
// //               </div>
// //             )}

// //             {/* Tracking Progress Node Visualizer — always shows the 6 customer-facing stages */}
// //             <div className="to-timeline-card">
// //               <h3>Shipment Status</h3>
// //               <div className="to-timeline">
// //                 {CUSTOMER_ORDER_STAGES.map((stage, idx) => {
// //                   const isCompleted = currentStatusIndex > -1 && idx <= currentStatusIndex;
// //                   const isCurrent = idx === currentStatusIndex;

// //                   return (
// //                     <div key={stage.key} className={`to-timeline-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'active' : ''}`}>
// //                       <div className="to-timeline-icon">
// //                         {isCompleted ? <CheckCircle size={18} /> : <Clock size={16} />}
// //                       </div>
// //                       <div className="to-timeline-content">
// //                         <h4>{stage.label}</h4>
// //                         {isCurrent && <p className="to-active-tag">Your package is currently in this stage.</p>}
// //                       </div>
// //                     </div>
// //                   );
// //                 })}
// //               </div>
// //             </div>

// //             {/* Address Information block */}
// //             {/* <div className="to-info-card">
// //               <div className="to-card-title-with-icon">
// //                 <MapPin size={18} /> <h3>Delivery Address</h3>
// //               </div>
// //               <p className="to-address-name"><strong>{order.customer.first_name} {order.customer.last_name}</strong></p>
// //               <p>{order.delivery_address.street}</p>
// //               <p>{order.delivery_address.city}, {order.delivery_address.state} - {order.delivery_address.pincode}</p>
// //               <p>{order.delivery_address.country}</p>
// //               <p className="to-meta-text" style={{ marginTop: '8px' }}>Phone: {order.customer.phone_no}</p>
// //             </div> */}

// //             {/* Address / Pickup Information block */}
// // {isPickup ? (
// //   <div className="to-info-card">
// //     <div className="to-card-title-with-icon">
// //       <ShoppingBag size={18} /> <h3>Store Pickup</h3>
// //     </div>
// //     <span
// //       style={{
// //         display: 'inline-flex', alignItems: 'center', gap: 6,
// //         padding: '5px 12px', borderRadius: 999,
// //         background: '#FCEFD6', color: '#A8641A',
// //         fontSize: 11.5, fontWeight: 700, marginBottom: 12,
// //       }}
// //     >
// //       This is a pickup order
// //     </span>
// //     <p className="to-address-name"><strong>{order.customer.first_name} {order.customer.last_name}</strong></p>
// //     <p>Collect from store — no delivery address needed.</p>
// //     {order.pickup_date && (
// //       <p className="to-meta-text" style={{ marginTop: '8px' }}>
// //         Pickup date:{' '}
// //         {new Date(order.pickup_date + 'T00:00:00').toLocaleDateString('en-IN', {
// //           day: '2-digit', month: 'short', year: 'numeric',
// //         })}
// //       </p>
// //     )}
// //     {order.pickup_time_slot && (
// //       <p className="to-meta-text">Pickup time: {order.pickup_time_slot}</p>
// //     )}
// //     <p className="to-meta-text" style={{ marginTop: '8px' }}>Phone: {order.customer.phone_no}</p>
// //   </div>
// // ) : order.delivery_address ? (
// //   <div className="to-info-card">
// //     <div className="to-card-title-with-icon">
// //       <MapPin size={18} /> <h3>Delivery Address</h3>
// //     </div>
// //     <p className="to-address-name"><strong>{order.customer.first_name} {order.customer.last_name}</strong></p>
// //     <p>{order.delivery_address.street}</p>
// //     <p>{order.delivery_address.city}, {order.delivery_address.state} - {order.delivery_address.pincode}</p>
// //     <p>{order.delivery_address.country}</p>
// //     <p className="to-meta-text" style={{ marginTop: '8px' }}>Phone: {order.customer.phone_no}</p>
// //   </div>
// // ) : (
// //   <div className="to-info-card">
// //     <div className="to-card-title-with-icon">
// //       <MapPin size={18} /> <h3>Delivery Address</h3>
// //     </div>
// //     <p className="to-meta-text">No delivery address on file for this order.</p>
// //   </div>
// // )}
// //           </div>

// //           {/* RIGHT COLUMN: Order Items and Cost breakdown */}
// //           <div className="to-panel-right">
// //             <div className="to-info-card">
// //               <div className="to-card-title-with-icon">
// //                 <ShoppingBag size={18} /> <h3>Items Summary</h3>
// //               </div>
// //               <div className="to-items-list">
// //                 {order.items.map((item) => (
// //                   <div key={item.id} className="to-product-row">
// //                     <img src={item.product?.image_url || 'https://via.placeholder.com/60'} alt={item.product?.name} className="to-product-img" />
// //                     <div className="to-product-details">
// //                       <h4>{item.product?.name}</h4>
// //                       <p className="to-meta-text">Qty: {item.quantity}</p>
// //                     </div>
// //                     <span className="to-product-price">{formatPrice(item.price, currency)}</span>
// //                   </div>
// //                 ))}
// //               </div>

// //               {/* Cost Calculations Breakdown */}
// //               <div className="to-pricing-breakdown">
// //                 <div className="to-price-row">
// //                   <span>Subtotal</span>
// //                   <span>{formatPrice(itemSubtotal, currency)}</span>
// //                 </div>
// //                 {addonsTotal > 0 && (
// //                   <div className="to-price-row addons">
// //                     <span>Add-ons</span>
// //                     <span>{formatPrice(addonsTotal, currency)}</span>
// //                   </div>
// //                 )}
// //                 {order.discount > 0 && (
// //                   <div className="to-price-row discount">
// //                     <span>Loyalty Discount</span>
// //                     <span>-{formatPrice(order.discount, currency)}</span>
// //                   </div>
// //                 )}
// //                 <div className="to-price-row">
// //                   <span>Delivery Fees</span>
// //                   <span>{formatPrice(order.delivery_charge, currency)}</span>
// //                 </div>
// //                 <hr className="to-divider" />
// //                 <div className="to-price-row total">
// //                   <span>Grand Total</span>
// //                   <span>{formatPrice(computedGrandTotal, currency)}</span>
// //                 </div>
// //               </div>

// //               {/* Payment Status Info Block */}
// //               <div className="to-payment-footer">
// //                 <p><strong>Payment Mode:</strong> {order.payment_method?.toUpperCase()}</p>
// //                 <p><strong>Status:</strong> <span className={`status-${order.payment_status?.toLowerCase()}`}>{order.payment_status}</span></p>
// //               </div>
// //             </div>
// //           </div>

// //         </div>
// //       </div>

// //       {/* ─────────────────────────────────────────
// //          MODAL OVERLAY: PRINTABLE BILL RECEIPT
// //       ───────────────────────────────────────── */}
// //       <AnimatePresence>
// //         {showReceipt && (
// //           <motion.div
// //             className="to-modal-overlay"
// //             initial={{ opacity: 0 }}
// //             animate={{ opacity: 1 }}
// //             exit={{ opacity: 0 }}
// //           >
// //             <motion.div
// //               className="to-modal-card"
// //               initial={{ scale: 0.9, y: 20 }}
// //               animate={{ scale: 1, y: 0 }}
// //               exit={{ scale: 0.9, y: 20 }}
// //             >
// //               <div className="to-modal-actions">
// //                 {/* <button className="to-print-action-btn" onClick={handlePrint}>
// //                   <Printer size={16} /> Print Receipt
// //                 </button> */}
// //                 <button className="to-close-action-btn" onClick={() => setShowReceipt(false)}>Dismiss</button>
// //               </div>

// //               {/* Print Bound Structural Container */}
// //               <div className="to-receipt-print-area" ref={receiptRef}>
// //                 <div className="receipt-paper">
// //                   <div className="receipt-center">
// //                                 <div className="receipt-crown-title">
// //   <img
// //     src="/assets/logo.png"
// //     alt="Cake N Take"
// //     className="receipt-logo"
// //   />
// // </div>
// //                     <h2 className="receipt-brand">CAKENTAKE</h2>
// //                     <p className="receipt-address">No.8, Mezzanine Floor, Al Musallam Complex, Al Othman Street, Hawally, Kuwait</p>
// //                     <p className="receipt-customer">Customer: {order.customer.first_name} {order.customer.last_name}</p>
// //                     <p className="receipt-contact">PH: {order.customer.phone_no || '+1 (555) 100-2000'}</p>
// //                   </div>

// //                   <div className="receipt-divider">-----------------------------------------</div>

// //                   <div className="receipt-meta">
// //                     <p><strong>Order ID:</strong> {order.order_number || order.id}</p>
// //                     <p><strong>Date:</strong> {orderDate}</p>
// //                     <p><strong>Time:</strong> {orderTime}</p>
// //                     <p><strong>Payment Mode:</strong> {order.payment_method?.toUpperCase()}</p>
// //                     {isPickup && (
// //     <p><strong>Order Type:</strong> PICKUP{order.pickup_time_slot ? ` — ${order.pickup_time_slot}` : ''}</p>
// //   )}
// //                   </div>

// //                   <div className="receipt-divider">-----------------------------------------</div>

// //                   <div className="receipt-items-table">
// //                     {order.items.map((item) => {
// //                       const itemAddOns = extractItemAddOns(item);
// //                       return (
// //                         <div key={item.id} className="receipt-item-row">
// //                           <div className="receipt-item-main">
// //                             <span className="receipt-item-name">{item.quantity} x {item.product?.name}</span>
// //                             <span className="receipt-item-price">
// //                               {formatPrice(item.line_total || (item.price * item.quantity), currency)}
// //                             </span>
// //                           </div>
// //                           {itemAddOns.length > 0 && (
// //                             <div className="receipt-item-addons">Add-ons: {itemAddOns.join(', ')}</div>
// //                           )}
// //                         </div>
// //                       );
// //                     })}

// //                      {order.order_addons && order.order_addons.length > 0 && (
// //   <>
// //     <div className="receipt-divider">-----------------------------------------</div>
// //     {order.order_addons.map((addon) => (
// //       <div key={`${addon.addon_id}-${addon.quantity}`} className="receipt-item-row receipt-addon-row">
// //         <div className="receipt-item-main">
// //           <span className="receipt-item-name">{addon.quantity} × {addon.addon_name || `Addon #${addon.addon_id}`}</span>
// //           <span className="receipt-item-price">{formatPrice(addon.total, currency)}</span>
// //         </div>
// //       </div>
// //     ))}
// //   </>
// // )}

// //                   </div>

// //                   <div className="receipt-divider">-----------------------------------------</div>

// //                   <div className="receipt-totals">
// //                     <div className="receipt-total-row">
// //                       <span>Subtotal:</span>
// //                       <span>{formatPrice(itemSubtotal, currency)}</span>
// //                     </div>
// //                     {addonsTotal > 0 && (
// //                       <div className="receipt-total-row">
// //                         <span>Add-ons:</span>
// //                         <span>{formatPrice(addonsTotal, currency)}</span>
// //                       </div>
// //                     )}
// //                     {order.discount > 0 && (
// //                       <div className="receipt-total-row">
// //                         <span>Loyalty Discount:</span>
// //                         <span>-{formatPrice(order.discount, currency)}</span>
// //                       </div>
// //                     )}
// //                     <div className="receipt-total-row">
// //                       <span>Delivery:</span>
// //                       <span>{formatPrice(order.delivery_charge, currency)}</span>
// //                     </div>

// //                     <div className="receipt-divider">-----------------------------------------</div>

// //                     <div className="receipt-total-row grand-total">
// //                       <span>GRAND TOTAL:</span>
// //                       <span>{formatPrice(computedGrandTotal, currency)}</span>
// //                     </div>
// //                   </div>

// //                   <div className="receipt-divider">-----------------------------------------</div>

// //                   <div className="receipt-center receipt-footer-msg">
// //                     <p>Thank you for dining with CakeNTake!</p>
// //                     <p>Baked fresh daily, prepared artisanally.</p>
// //                     <p className="receipt-url">www.cakentake.com</p>
// //                   </div>
// //                 </div>
// //               </div>

// //             </motion.div>
// //           </motion.div>
// //         )}
// //       </AnimatePresence>
// //     </div>
// //   );
// // };

// // export default TrackOrder;


// import React, { useState, useEffect, useRef } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Loader2, AlertCircle, ArrowLeft, Download, CheckCircle, Clock, ShoppingBag, MapPin, Printer, XCircle } from 'lucide-react';
// import './TrackOrder.css';
// import { getOrderById, cancelOrder } from '@/src/services/orderService';
// import { getDisplayOrderNumber } from '@/src/utils/orderNumber';
// import {
//   getCustomerStages,
//   getCustomerStageIndex,
//   getCustomerStatusLabel,
//   ACCEPTED_STAGE_INDEX,
// } from '../../services/orderStatus';

// /* ─────────────────────────────────────────
//    Type Definitions Match Your API Response
// ───────────────────────────────────────── */
// interface DeliveryAddress {
//   street: string;
//   city: string;
//   state: string;
//   country: string;
//   pincode: string;
// }

// interface Product {
//   id: number;
//   name: string;
//   description: string;
//   price: number;
//   image_url: string;
// }

// interface OrderItem {
//   id: number;
//   price: number;
//   quantity: number;
//   line_total: number;
//   product: Product;
//   selectedAddOns?: string[];
//   add_ons?: string[];
//   addons?: string[];
//   custom_json?: any;
// }

// interface Customer {
//   first_name: string;
//   last_name: string;
//   email: string;
//   phone_no: string;
// }

// interface DetailedOrder {
//   id: number;
//   order_number: string;
//   status: string;
//   payment_method: string;
//   payment_status: string;
//   total: number;
//   subtotal: number;
//   discount: number;
//   delivery_charge: number;
//   currency?: string;
//   delivery_method?: string;          // ← add
//   pickup_date?: string | null;       // ← add
//   pickup_time_slot?: string | null;
//   order_addons?: {
//     addon_id: number;
//     addon_name?: string;
//     quantity: number;
//     price: number;
//     total: number;
//   }[];
//   order_addons_total?: number;
//   created_at: string;
//   order_type: string;
//   customer: Customer;
//   delivery_address: DeliveryAddress;
//   items: OrderItem[];
// }

// const extractItemAddOns = (item: OrderItem): string[] => {
//   const rawAddOns =
//     item.selectedAddOns ||
//     item.add_ons ||
//     item.addons ||
//     item.custom_json?.selectedAddOns ||
//     item.custom_json?.add_ons ||
//     item.custom_json?.addons ||
//     item.custom_json?.selected_add_ons;

//   if (Array.isArray(rawAddOns)) {
//     return rawAddOns.filter(Boolean).map(String);
//   }

//   if (typeof rawAddOns === 'string') {
//     return rawAddOns.split(',').map((value) => value.trim()).filter(Boolean);
//   }

//   return [];
// };

// /* Same convention used in Orders.tsx: INR gets the ₹ glyph, everything
//    else (KWD, AED, USD, SAR, SGD, ...) is shown as its currency code. */
// const getCurrencySymbol = (currency?: string): string => {
//   const cur = (currency || 'INR').toUpperCase();
//   return cur === 'INR' ? '₹' : cur;
// };

// const formatPrice = (amount: number, currency?: string): string =>
//   `${getCurrencySymbol(currency)}${Number(amount || 0).toFixed(2)}`;

// const TrackOrder: React.FC = () => {
//   const { id } = useParams<{ id: string }>();
//   const [order, setOrder] = useState<DetailedOrder | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [showReceipt, setShowReceipt] = useState<boolean>(false);

//   // Cancel-order state
//   const [cancelling, setCancelling] = useState<boolean>(false);
//   const [cancelError, setCancelError] = useState<string | null>(null);

//   const receiptRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//   const fetchOrderDetails = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const data = await getOrderById(Number(id));
//       setOrder(data);
//     } catch (err: any) {
//       console.error('Track order fetch error:', err);
//       setError(err.response?.data?.message ?? 'Failed to retrieve order tracking information.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (id) fetchOrderDetails();
// }, [id]);

//   // Handle system printing of the targeted receipt node
//   const handlePrint = () => {
//     const printContent = receiptRef.current?.innerHTML;
//     const originalContent = document.body.innerHTML;

//     if (printContent) {
//       document.body.innerHTML = printContent;
//       window.print();
//       window.location.reload(); // Restores state/React safely after print window closes
//     }
//   };

//   // Handle customer-initiated order cancellation
//   const handleCancelOrder = async () => {
//     if (!order) return;

//     const confirmed = window.confirm('Are you sure you want to cancel this order? This cannot be undone.');
//     if (!confirmed) return;

//     try {
//       setCancelling(true);
//       setCancelError(null);

//       const result = await cancelOrder(order.id);
//       const newStatus = result?.status || result?.order?.status || 'CANCELLED';

//       setOrder((prev) => (prev ? { ...prev, status: newStatus } : prev));
//     } catch (err: any) {
//       console.error('Cancel order error:', err);
//       setCancelError(err.response?.data?.message ?? 'Failed to cancel order.');
//     } finally {
//       setCancelling(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="to-page-center">
//         <Loader2 className="to-spinner" size={48} />
//         <p>Loading tracking data details...</p>
//       </div>
//     );
//   }

//   if (error || !order) {
//     return (
//       <div className="to-error-container">
//         <AlertCircle size={48} color="#B95E82" />
//         <h2>Tracking Error</h2>
//         <p>{error || 'Order record could not be processed.'}</p>
//         <Link to="/orders" className="to-btn-primary"><ArrowLeft size={16} /> Back to Orders</Link>
//       </div>
//     );
//   }

//   // Currency for this specific order — set at checkout, not a global default
//   const currency = order.currency || 'INR';
//   const symbol = getCurrencySymbol(currency);

//   // Formatting helpers
//   const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
//   const orderTime = new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

//   // Delivery vs pickup determines which stage list applies — compute this
//   // before the stage index, since pickup orders skip the driver-assignment
//   // steps entirely.
//   const isPickup = (order.delivery_method || 'DELIVERY').toUpperCase() === 'PICKUP';
//   const stages = getCustomerStages(isPickup);

//   // Customer-facing timeline: only ever shows `stages`, regardless of how
//   // many internal backend statuses the order actually passes through.
//   const currentStatusIndex = getCustomerStageIndex(order.status, isPickup);

//   // Cancellation eligibility: customer can only cancel BEFORE the order
//   // is accepted (i.e. sent to the kitchen). Once accepted, or if it's
//   // already CANCELLED, cancellation is no longer allowed.
//   const isCancelled = (order.status ?? '').toUpperCase() === 'CANCELLED';
//   const canCancel =
//     !isCancelled &&
//     currentStatusIndex > -1 &&
//     currentStatusIndex < ACCEPTED_STAGE_INDEX;
//   const pastCancellationWindow =
//     !isCancelled && currentStatusIndex >= ACCEPTED_STAGE_INDEX;

//   const addonsTotal = Number(order.order_addons_total ?? (order.order_addons?.reduce((s, a) => s + Number(a.total ?? (a.price * a.quantity || 0)), 0) || 0));
// const itemSubtotal = Number(order.subtotal ?? (order.items?.reduce((s, i) => s + Number(i.line_total ?? (i.price * i.quantity || 0)), 0) || 0));
// const computedGrandTotal = Number(order.total ?? (itemSubtotal + addonsTotal - Number(order.discount || 0) + Number(order.delivery_charge || 0)));

//   return (
//     <div className="to-container">
//       <div className="to-wrapper">

//         {/* Top bar Actions */}
//         <div className="to-header">
//           <Link to="/orders" className="to-back-btn">
//             <ArrowLeft size={18} /> <span>Back to Orders</span>
//           </Link>
//           <div className="to-header-actions">
//             {canCancel && (
//               <button
//                 className="to-btn-danger"
//                 onClick={handleCancelOrder}
//                 disabled={cancelling}
//               >
//                 {cancelling ? (
//                   <Loader2 size={16} className="to-spinner-inline" />
//                 ) : (
//                   <XCircle size={16} />
//                 )}
//                 {cancelling ? 'Cancelling...' : 'Cancel Order'}
//               </button>
//             )}
//             <button className="to-btn-primary" onClick={() => setShowReceipt(true)}>
//               <Download size={16} /> Receipt
//             </button>
//           </div>
//         </div>

//         {/* Dashboard Split Grid Layout */}
//         <div className="to-main-grid">

//           {/* LEFT COLUMN: Tracking metrics & Timeline */}
//           <div className="to-panel-left">
//             <div className="to-card-header-block">
//               <div>
//                 <span className="to-badge-status">{getCustomerStatusLabel(order.status, isPickup)}</span>
//                 <h2>Order #{getDisplayOrderNumber(order, 15000)}</h2>
//                 <p className="to-meta-text">Placed on {orderDate} at {orderTime}</p>
//               </div>
//             </div>

//             {/* Cancel-order feedback messages */}
//             {cancelError && (
//               <div className="to-cancel-error">
//                 <AlertCircle size={16} /> {cancelError}
//               </div>
//             )}
//             {isCancelled && (
//               <div className="to-cancel-note">
//                 This order has been cancelled.
//               </div>
//             )}
//             {pastCancellationWindow && (
//               <div className="to-cancel-note">
//                 This order is already being prepared and can no longer be cancelled.
//               </div>
//             )}

//             {/* Tracking Progress Node Visualizer — shows the stages for this order's type (delivery vs pickup) */}
//             <div className="to-timeline-card">
//               <h3>Shipment Status</h3>
//               <div className="to-timeline">
//                 {stages.map((stage, idx) => {
//                   const isCompleted = currentStatusIndex > -1 && idx <= currentStatusIndex;
//                   const isCurrent = idx === currentStatusIndex;

//                   return (
//                     <div key={stage.key} className={`to-timeline-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'active' : ''}`}>
//                       <div className="to-timeline-icon">
//                         {isCompleted ? <CheckCircle size={18} /> : <Clock size={16} />}
//                       </div>
//                       <div className="to-timeline-content">
//                         <h4>{stage.label}</h4>
//                         {isCurrent && <p className="to-active-tag">Your package is currently in this stage.</p>}
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* Address Information block */}
//             {/* <div className="to-info-card">
//               <div className="to-card-title-with-icon">
//                 <MapPin size={18} /> <h3>Delivery Address</h3>
//               </div>
//               <p className="to-address-name"><strong>{order.customer.first_name} {order.customer.last_name}</strong></p>
//               <p>{order.delivery_address.street}</p>
//               <p>{order.delivery_address.city}, {order.delivery_address.state} - {order.delivery_address.pincode}</p>
//               <p>{order.delivery_address.country}</p>
//               <p className="to-meta-text" style={{ marginTop: '8px' }}>Phone: {order.customer.phone_no}</p>
//             </div> */}

//             {/* Address / Pickup Information block */}
// {isPickup ? (
//   <div className="to-info-card">
//     <div className="to-card-title-with-icon">
//       <ShoppingBag size={18} /> <h3>Store Pickup</h3>
//     </div>
//     <span
//       style={{
//         display: 'inline-flex', alignItems: 'center', gap: 6,
//         padding: '5px 12px', borderRadius: 999,
//         background: '#FCEFD6', color: '#A8641A',
//         fontSize: 11.5, fontWeight: 700, marginBottom: 12,
//       }}
//     >
//       This is a pickup order
//     </span>
//     <p className="to-address-name"><strong>{order.customer.first_name} {order.customer.last_name}</strong></p>
//     <p>Collect from store — no delivery address needed.</p>
//     {order.pickup_date && (
//       <p className="to-meta-text" style={{ marginTop: '8px' }}>
//         Pickup date:{' '}
//         {new Date(order.pickup_date + 'T00:00:00').toLocaleDateString('en-IN', {
//           day: '2-digit', month: 'short', year: 'numeric',
//         })}
//       </p>
//     )}
//     {order.pickup_time_slot && (
//       <p className="to-meta-text">Pickup time: {order.pickup_time_slot}</p>
//     )}
//     <p className="to-meta-text" style={{ marginTop: '8px' }}>Phone: {order.customer.phone_no}</p>
//   </div>
// ) : order.delivery_address ? (
//   <div className="to-info-card">
//     <div className="to-card-title-with-icon">
//       <MapPin size={18} /> <h3>Delivery Address</h3>
//     </div>
//     <p className="to-address-name"><strong>{order.customer.first_name} {order.customer.last_name}</strong></p>
//     <p>{order.delivery_address.street}</p>
//     <p>{order.delivery_address.city}, {order.delivery_address.state} - {order.delivery_address.pincode}</p>
//     <p>{order.delivery_address.country}</p>
//     <p className="to-meta-text" style={{ marginTop: '8px' }}>Phone: {order.customer.phone_no}</p>
//   </div>
// ) : (
//   <div className="to-info-card">
//     <div className="to-card-title-with-icon">
//       <MapPin size={18} /> <h3>Delivery Address</h3>
//     </div>
//     <p className="to-meta-text">No delivery address on file for this order.</p>
//   </div>
// )}
//           </div>

//           {/* RIGHT COLUMN: Order Items and Cost breakdown */}
//           <div className="to-panel-right">
//             <div className="to-info-card">
//               <div className="to-card-title-with-icon">
//                 <ShoppingBag size={18} /> <h3>Items Summary</h3>
//               </div>
//               <div className="to-items-list">
//                 {order.items.map((item) => (
//                   <div key={item.id} className="to-product-row">
//                     <img src={item.product?.image_url || 'https://via.placeholder.com/60'} alt={item.product?.name} className="to-product-img" />
//                     <div className="to-product-details">
//                       <h4>{item.product?.name}</h4>
//                       <p className="to-meta-text">Qty: {item.quantity}</p>
//                     </div>
//                     <span className="to-product-price">{formatPrice(item.price, currency)}</span>
//                   </div>
//                 ))}
//               </div>

//               {/* Cost Calculations Breakdown */}
//               <div className="to-pricing-breakdown">
//                 <div className="to-price-row">
//                   <span>Subtotal</span>
//                   <span>{formatPrice(itemSubtotal, currency)}</span>
//                 </div>
//                 {addonsTotal > 0 && (
//                   <div className="to-price-row addons">
//                     <span>Add-ons</span>
//                     <span>{formatPrice(addonsTotal, currency)}</span>
//                   </div>
//                 )}
//                 {order.discount > 0 && (
//                   <div className="to-price-row discount">
//                     <span>Loyalty Discount</span>
//                     <span>-{formatPrice(order.discount, currency)}</span>
//                   </div>
//                 )}
//                 <div className="to-price-row">
//                   <span>Delivery Fees</span>
//                   <span>{formatPrice(order.delivery_charge, currency)}</span>
//                 </div>
//                 <hr className="to-divider" />
//                 <div className="to-price-row total">
//                   <span>Grand Total</span>
//                   <span>{formatPrice(computedGrandTotal, currency)}</span>
//                 </div>
//               </div>

//               {/* Payment Status Info Block */}
//               <div className="to-payment-footer">
//                 <p><strong>Payment Mode:</strong> {order.payment_method?.toUpperCase()}</p>
//                 <p><strong>Status:</strong> <span className={`status-${order.payment_status?.toLowerCase()}`}>{order.payment_status}</span></p>
//               </div>
//             </div>
//           </div>

//         </div>
//       </div>

//       {/* ─────────────────────────────────────────
//          MODAL OVERLAY: PRINTABLE BILL RECEIPT
//       ───────────────────────────────────────── */}
//       <AnimatePresence>
//         {showReceipt && (
//           <motion.div
//             className="to-modal-overlay"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//           >
//             <motion.div
//               className="to-modal-card"
//               initial={{ scale: 0.9, y: 20 }}
//               animate={{ scale: 1, y: 0 }}
//               exit={{ scale: 0.9, y: 20 }}
//             >
//               <div className="to-modal-actions">
//                 {/* <button className="to-print-action-btn" onClick={handlePrint}>
//                   <Printer size={16} /> Print Receipt
//                 </button> */}
//                 <button className="to-close-action-btn" onClick={() => setShowReceipt(false)}>Dismiss</button>
//               </div>

//               {/* Print Bound Structural Container */}
//               <div className="to-receipt-print-area" ref={receiptRef}>
//                 <div className="receipt-paper">
//                   <div className="receipt-center">
//                                 <div className="receipt-crown-title">
//   <img
//     src="/assets/logo.png"
//     alt="Cake N Take"
//     className="receipt-logo"
//   />
// </div>
//                     <h2 className="receipt-brand">CAKENTAKE</h2>
//                     <p className="receipt-address">No.8, Mezzanine Floor, Al Musallam Complex, Al Othman Street, Hawally, Kuwait</p>
//                     <p className="receipt-customer">Customer: {order.customer.first_name} {order.customer.last_name}</p>
//                     <p className="receipt-contact">PH: {order.customer.phone_no || '+1 (555) 100-2000'}</p>
//                   </div>

//                   <div className="receipt-divider">-----------------------------------------</div>

//                   <div className="receipt-meta">
//                     <p><strong>Order ID:</strong> {order.order_number || order.id}</p>
//                     <p><strong>Date:</strong> {orderDate}</p>
//                     <p><strong>Time:</strong> {orderTime}</p>
//                     <p><strong>Payment Mode:</strong> {order.payment_method?.toUpperCase()}</p>
//                     {isPickup && (
//     <p><strong>Order Type:</strong> PICKUP{order.pickup_time_slot ? ` — ${order.pickup_time_slot}` : ''}</p>
//   )}
//                   </div>

//                   <div className="receipt-divider">-----------------------------------------</div>

//                   <div className="receipt-items-table">
//                     {order.items.map((item) => {
//                       const itemAddOns = extractItemAddOns(item);
//                       return (
//                         <div key={item.id} className="receipt-item-row">
//                           <div className="receipt-item-main">
//                             <span className="receipt-item-name">{item.quantity} x {item.product?.name}</span>
//                             <span className="receipt-item-price">
//                               {formatPrice(item.line_total || (item.price * item.quantity), currency)}
//                             </span>
//                           </div>
//                           {itemAddOns.length > 0 && (
//                             <div className="receipt-item-addons">Add-ons: {itemAddOns.join(', ')}</div>
//                           )}
//                         </div>
//                       );
//                     })}

//                      {order.order_addons && order.order_addons.length > 0 && (
//   <>
//     <div className="receipt-divider">-----------------------------------------</div>
//     {order.order_addons.map((addon) => (
//       <div key={`${addon.addon_id}-${addon.quantity}`} className="receipt-item-row receipt-addon-row">
//         <div className="receipt-item-main">
//           <span className="receipt-item-name">{addon.quantity} × {addon.addon_name || `Addon #${addon.addon_id}`}</span>
//           <span className="receipt-item-price">{formatPrice(addon.total, currency)}</span>
//         </div>
//       </div>
//     ))}
//   </>
// )}

//                   </div>

//                   <div className="receipt-divider">-----------------------------------------</div>

//                   <div className="receipt-totals">
//                     <div className="receipt-total-row">
//                       <span>Subtotal:</span>
//                       <span>{formatPrice(itemSubtotal, currency)}</span>
//                     </div>
//                     {addonsTotal > 0 && (
//                       <div className="receipt-total-row">
//                         <span>Add-ons:</span>
//                         <span>{formatPrice(addonsTotal, currency)}</span>
//                       </div>
//                     )}
//                     {order.discount > 0 && (
//                       <div className="receipt-total-row">
//                         <span>Loyalty Discount:</span>
//                         <span>-{formatPrice(order.discount, currency)}</span>
//                       </div>
//                     )}
//                     <div className="receipt-total-row">
//                       <span>Delivery:</span>
//                       <span>{formatPrice(order.delivery_charge, currency)}</span>
//                     </div>

//                     <div className="receipt-divider">-----------------------------------------</div>

//                     <div className="receipt-total-row grand-total">
//                       <span>GRAND TOTAL:</span>
//                       <span>{formatPrice(computedGrandTotal, currency)}</span>
//                     </div>
//                   </div>

//                   <div className="receipt-divider">-----------------------------------------</div>

//                   <div className="receipt-center receipt-footer-msg">
//                     <p>Thank you for dining with CakeNTake!</p>
//                     <p>Baked fresh daily, prepared artisanally.</p>
//                     <p className="receipt-url">www.cakentake.com</p>
//                   </div>
//                 </div>
//               </div>

//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default TrackOrder;



import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, ArrowLeft, Download, CheckCircle, Clock, ShoppingBag, MapPin, Printer, XCircle, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './TrackOrder.css';
import { getOrderById, cancelOrder } from '@/src/services/orderService';
import { getDisplayOrderNumber } from '@/src/utils/orderNumber';
import {
  getCustomerStages,
  getCustomerStageIndex,
  getCustomerStatusLabel,
  ACCEPTED_STAGE_INDEX,
} from '../../services/orderStatus';

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
  delivery_method?: string;
  pickup_date?: string | null;
  pickup_time_slot?: string | null;
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

  // Cancel-order state
  const [cancelling, setCancelling] = useState<boolean>(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // PDF download state
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

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

  /* ─────────────────────────────────────────
     Download the receipt node as a PDF file.
     Renders the receipt DOM node to a canvas via
     html2canvas, then drops that image into a
     jsPDF document sized to a standard receipt
     width (mirrors a thermal-printer style slip).
  ───────────────────────────────────────── */
  const handleDownloadPDF = async () => {
    if (!receiptRef.current || !order) return;

    try {
      setDownloadingPdf(true);
      setPdfError(null);

      const node = receiptRef.current;

      // Render at 2x scale for crisp text/logo in the PDF
      const canvas = await html2canvas(node, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');

      // Convert canvas pixel size -> mm so the PDF page fits the content exactly
      const pxToMm = (px: number) => px * 0.264583;
      const imgWidthMm = pxToMm(canvas.width / 2); // /2 to undo the scale:2 above
      const imgHeightMm = pxToMm(canvas.height / 2);

      const pdf = new jsPDF({
        orientation: imgHeightMm > imgWidthMm ? 'portrait' : 'landscape',
        unit: 'mm',
        format: [imgWidthMm, imgHeightMm],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidthMm, imgHeightMm);

      const orderNumberForFile = getDisplayOrderNumber(order, 15000) || order.id;
      pdf.save(`Receipt-${orderNumberForFile}.pdf`);
    } catch (err) {
      console.error('PDF download error:', err);
      setPdfError('Failed to generate PDF. Please try again.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Handle customer-initiated order cancellation
  const handleCancelOrder = async () => {
    if (!order) return;

    const confirmed = window.confirm('Are you sure you want to cancel this order? This cannot be undone.');
    if (!confirmed) return;

    try {
      setCancelling(true);
      setCancelError(null);

      const result = await cancelOrder(order.id);
      const newStatus = result?.status || result?.order?.status || 'CANCELLED';

      setOrder((prev) => (prev ? { ...prev, status: newStatus } : prev));
    } catch (err: any) {
      console.error('Cancel order error:', err);
      setCancelError(err.response?.data?.message ?? 'Failed to cancel order.');
    } finally {
      setCancelling(false);
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

  const currency = order.currency || 'INR';
  const symbol = getCurrencySymbol(currency);

  const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const orderTime = new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const isPickup = (order.delivery_method || 'DELIVERY').toUpperCase() === 'PICKUP';
  const stages = getCustomerStages(isPickup);

  const currentStatusIndex = getCustomerStageIndex(order.status, isPickup);

  const isCancelled = (order.status ?? '').toUpperCase() === 'CANCELLED';
  const canCancel =
    !isCancelled &&
    currentStatusIndex > -1 &&
    currentStatusIndex < ACCEPTED_STAGE_INDEX;
  const pastCancellationWindow =
    !isCancelled && currentStatusIndex >= ACCEPTED_STAGE_INDEX;

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
          <div className="to-header-actions">
            {canCancel && (
              <button
                className="to-btn-danger"
                onClick={handleCancelOrder}
                disabled={cancelling}
              >
                {cancelling ? (
                  <Loader2 size={16} className="to-spinner-inline" />
                ) : (
                  <XCircle size={16} />
                )}
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
            <button className="to-btn-primary" onClick={() => setShowReceipt(true)}>
              <Download size={16} /> Receipt
            </button>
          </div>
        </div>

        {/* Dashboard Split Grid Layout */}
        <div className="to-main-grid">

          {/* LEFT COLUMN: Tracking metrics & Timeline */}
          <div className="to-panel-left">
            <div className="to-card-header-block">
              <div>
                <span className="to-badge-status">{getCustomerStatusLabel(order.status, isPickup)}</span>
                <h2>Order #{getDisplayOrderNumber(order, 15000)}</h2>
                <p className="to-meta-text">Placed on {orderDate} at {orderTime}</p>
              </div>
            </div>

            {cancelError && (
              <div className="to-cancel-error">
                <AlertCircle size={16} /> {cancelError}
              </div>
            )}
            {isCancelled && (
              <div className="to-cancel-note">
                This order has been cancelled.
              </div>
            )}
            {pastCancellationWindow && (
              <div className="to-cancel-note">
                This order is already being prepared and can no longer be cancelled.
              </div>
            )}

            <div className="to-timeline-card">
              <h3>Shipment Status</h3>
              <div className="to-timeline">
                {stages.map((stage, idx) => {
                  const isCompleted = currentStatusIndex > -1 && idx <= currentStatusIndex;
                  const isCurrent = idx === currentStatusIndex;

                  return (
                    <div key={stage.key} className={`to-timeline-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'active' : ''}`}>
                      <div className="to-timeline-icon">
                        {isCompleted ? <CheckCircle size={18} /> : <Clock size={16} />}
                      </div>
                      <div className="to-timeline-content">
                        <h4>{stage.label}</h4>
                        {isCurrent && <p className="to-active-tag">Your package is currently in this stage.</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {isPickup ? (
              <div className="to-info-card">
                <div className="to-card-title-with-icon">
                  <ShoppingBag size={18} /> <h3>Store Pickup</h3>
                </div>
                <span
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '5px 12px', borderRadius: 999,
                    background: '#FCEFD6', color: '#A8641A',
                    fontSize: 11.5, fontWeight: 700, marginBottom: 12,
                  }}
                >
                  This is a pickup order
                </span>
                <p className="to-address-name"><strong>{order.customer.first_name} {order.customer.last_name}</strong></p>
                <p>Collect from store — no delivery address needed.</p>
                {order.pickup_date && (
                  <p className="to-meta-text" style={{ marginTop: '8px' }}>
                    Pickup date:{' '}
                    {new Date(order.pickup_date + 'T00:00:00').toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </p>
                )}
                {order.pickup_time_slot && (
                  <p className="to-meta-text">Pickup time: {order.pickup_time_slot}</p>
                )}
                <p className="to-meta-text" style={{ marginTop: '8px' }}>Phone: {order.customer.phone_no}</p>
              </div>
            ) : order.delivery_address ? (
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
            ) : (
              <div className="to-info-card">
                <div className="to-card-title-with-icon">
                  <MapPin size={18} /> <h3>Delivery Address</h3>
                </div>
                <p className="to-meta-text">No delivery address on file for this order.</p>
              </div>
            )}
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

              <div className="to-payment-footer">
                <p><strong>Payment Mode:</strong> {order.payment_method?.toUpperCase()}</p>
                <p><strong>Status:</strong> <span className={`status-${order.payment_status?.toLowerCase()}`}>{order.payment_status}</span></p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ─────────────────────────────────────────
         MODAL OVERLAY: PRINTABLE / DOWNLOADABLE BILL RECEIPT
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
                <button
                  className="to-print-action-btn"
                  onClick={handleDownloadPDF}
                  disabled={downloadingPdf}
                >
                  {downloadingPdf ? (
                    <Loader2 size={16} className="to-spinner-inline" />
                  ) : (
                    <FileDown size={16} />
                  )}
                  {downloadingPdf ? 'Preparing PDF...' : 'Download PDF'}
                </button>
                <button className="to-close-action-btn" onClick={() => setShowReceipt(false)}>Dismiss</button>
              </div>

              {pdfError && (
                <div className="to-cancel-error" style={{ margin: '0 16px 8px' }}>
                  <AlertCircle size={16} /> {pdfError}
                </div>
              )}

              <div className="to-receipt-print-area" ref={receiptRef}>
                <div className="receipt-paper">
                  <div className="receipt-center">
                    <div className="receipt-crown-title">
                      <img
                        src="/assets/logo.png"
                        alt="Cake N Take"
                        className="receipt-logo"
                        crossOrigin="anonymous"
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
                    {isPickup && (
                      <p><strong>Order Type:</strong> PICKUP{order.pickup_time_slot ? ` — ${order.pickup_time_slot}` : ''}</p>
                    )}
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