


// // // import React, { useState, useEffect, useCallback } from 'react';
// // // import {
// // //   Printer, X, Loader2, RefreshCw, AlertCircle, Eye,
// // //   UserCheck, Cake, Gift, CalendarClock, Sparkles,
// // //   CreditCard, Copy, Check, ExternalLink,
// // // } from 'lucide-react';
// // // import { QRCodeSVG } from 'qrcode.react';
// // // import './Salesagentorder.css';

// // // import { getOrderHistory, getSalesAgentOrders } from '../../services/orderService';
// // // import { createPaymentLink } from '../../services/paymentService';

// // // // ─── Types ────────────────────────────────────────────────────────────────────

// // // interface OrderItem {
// // //   id: string;
// // //   productName: string;
// // //   productDescription?: string;
// // //   quantity: number;
// // //   price: number;
// // //   addOnPriceTotal: number;
// // //   lineTotal?: number;
// // //   selectedVariant?: string;
// // //   selectedFlavour?: string;  
// // //   selectedAddOns: string[];
// // //   imageUrl?: string;
// // // }

// // // interface TimelineEntry {
// // //   status: string;
// // //   timestamp: string;
// // //   note?: string;
// // //   changedBy?: string;
// // // }

// // // interface CustomCakeDetails {
// // //   flavour?: string;
// // //   weight?: string;
// // //   shape?: string;
// // //   size?: string;
// // //   colour?: string;
// // //   message?: string;
// // //   image?: string;
// // //   notes?: string;
// // //   price?: number;
// // // }

// // // interface DetailedAddress {
// // //   apartment?: string;
// // //   avenue?: string;
// // //   block?: string;
// // //   building?: string;
// // //   floor?: string;
// // //   street?: string;
// // //   country?: string;
// // //   areaName?: string;
// // //   addressNotes?: string;
// // //   addressLine1?: string;
// // //   addressLine2?: string;
// // //   city?: string;
// // //   state?: string;
// // //   pincode?: string;
// // //   landmark?: string;
// // // }

// // // type OrderStatus =
// // //   | 'pending'
// // //   | 'accepted'
// // //   | 'assigned_to_kitchen'
// // //   | 'preparing'
// // //   | 'ready'
// // //   | 'assigned_to_agent'
// // //   | 'assigned_to_driver'
// // //   | 'out_for_delivery'
// // //   | 'delivery_submitted'
// // //   | 'delivered'
// // //   | 'cancelled'
// // //   | 'rejected';

// // // interface Order {
// // //   id: string;
// // //   orderNumber?: string;
// // //   customerName: string;
// // //   customerPhone: string;
// // //   customerEmail?: string;
// // //   deliveryAddress: string;
// // //   detailedAddress?: DetailedAddress;
// // //   items: OrderItem[];
// // //   subtotal: number;
// // //   discount: number;
// // //   deliveryCharge: number;
// // //   total: number;
// // //   currency: string;
// // //   status: OrderStatus;
// // //   paymentMethod: string;
// // //   paymentStatus?: string;
// // //   orderType?: string;
// // //   loyaltyCoupon?: string;
// // //   rejectionReason?: string;
// // //   notes?: string;
// // //   createdAt: string;
// // //   timeline: TimelineEntry[];

// // //   createdByName?: string;
// // //   createdByRole?: string;
// // //   createdByPhone?: string;
// // //   createdByEmail?: string;
// // //   orderSource?: string;
// // //   isSalesAgentOrder: boolean;

// // //   customCake?: CustomCakeDetails | null;
// // //   isCustomCakeOrder: boolean;

// // //   deliveryMethod?: string;
// // //   deliveryDate?: string;
// // //   deliveryTimeSlot?: string;

// // //   greetingTo?: string;
// // //   greetingFrom?: string;
// // //   greetingMessage?: string;
// // // }

// // // // ─── Status mapping ───────────────────────────────────────────────────────────

// // // const STATUS_API_TO_LOCAL: Record<string, OrderStatus> = {
// // //   PENDING:             'pending',
// // //   ACCEPTED:            'accepted',
// // //   ORDER_ACCEPTED:      'accepted',
// // //   CONFIRMED:           'accepted',
// // //   ASSIGNED_TO_KITCHEN: 'assigned_to_kitchen',
// // //   PREPARING:           'preparing',
// // //   PROCESSING:          'preparing',
// // //   READY:               'ready',
// // //   READY_FOR_PICKUP:    'ready',
// // //   READY_FOR_DISPATCH:  'ready',
// // //   ASSIGNED_TO_AGENT:   'assigned_to_agent',
// // //   ASSIGNED_TO_DRIVER:  'assigned_to_driver',
// // //   DRIVER_ASSIGNED:     'assigned_to_driver',
// // //   DRIVER_ACCEPTED:     'out_for_delivery',
// // //   OUT_FOR_DELIVERY:    'out_for_delivery',
// // //   ON_THE_WAY:          'out_for_delivery',
// // //   DELIVERY_SUBMITTED:  'delivery_submitted',
// // //   DELIVERED:           'delivered',
// // //   COMPLETED:           'delivered',
// // //   DELIVERY_COMPLETED_PENDING_APPROVAL: 'delivery_submitted',
// // //   REJECTED:   'rejected',
// // //   CANCELLED:  'cancelled',
// // //   CANCELED:   'cancelled',
// // // };

// // // // ─── Helpers ──────────────────────────────────────────────────────────────────

// // // function formatMoney(amount: number, currency?: string): string {
// // //   const cur = (currency || 'INR').toUpperCase();
// // //   try {
// // //     return new Intl.NumberFormat(undefined, { style: 'currency', currency: cur }).format(amount || 0);
// // //   } catch {
// // //     return `₹${(amount || 0).toFixed(2)}`;
// // //   }
// // // }

// // // function formatDate(value?: string): string {
// // //   if (!value) return '—';
// // //   const d = new Date(value);
// // //   if (isNaN(d.getTime())) return String(value);
// // //   return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
// // // }

// // // function mapTimelineEntry(h: any): TimelineEntry {
// // //   const rawStatus = String(h?.new_status ?? h?.status ?? '').toUpperCase();
// // //   const changedBy = h?.changed_by;
// // //   return {
// // //     status: STATUS_API_TO_LOCAL[rawStatus] ?? rawStatus.toLowerCase().replace(/_/g, ' '),
// // //     timestamp: h?.created_at ?? h?.createdAt ?? h?.changed_at ?? h?.timestamp ?? '',
// // //     note: h?.remarks ?? h?.note ?? h?.reason ?? undefined,
// // //     changedBy: changedBy?.name ?? (changedBy
// // //       ? `${changedBy.first_name ?? ''} ${changedBy.last_name ?? ''}`.trim()
// // //       : undefined),
// // //   };
// // // }

// // // function normalizeOrder(raw: any): Order {
// // //   const rawStatus = String(raw?.status ?? '').toUpperCase();
// // //   const status: OrderStatus = STATUS_API_TO_LOCAL[rawStatus] ?? 'pending';

// // //   const customer = raw?.customer ?? raw?.user ?? {};
// // //   const firstName = customer?.first_name ?? customer?.firstName ?? '';
// // //   const lastName  = customer?.last_name  ?? customer?.lastName  ?? '';
// // //   const customerName =
// // //     `${firstName} ${lastName}`.trim() ||
// // //     customer?.name || customer?.full_name ||
// // //     raw?.customer_name || 'Unknown Customer';
// // //   const customerPhone =
// // //     customer?.phone_no ?? customer?.phone ?? customer?.phone_number ?? raw?.customer_phone ?? '—';
// // //   const customerEmail = customer?.email ?? raw?.customer_email ?? undefined;

// // //   const rawDeliveryMethod = raw?.delivery_method ?? raw?.deliveryMethod;
// // //   const deliveryMethodRaw = typeof rawDeliveryMethod === 'string'
// // //     ? rawDeliveryMethod.trim().toUpperCase()
// // //     : '';
// // //   const isPickupOrder = deliveryMethodRaw === 'PICKUP';

// // //   const address = raw?.delivery_address ?? raw?.address ?? {};
// // //   const addressJson = raw?.delivery_address_json ?? {};
// // //   const addressParts = [
// // //     address?.street ?? address?.line1,
// // //     address?.city,
// // //     address?.state,
// // //     address?.pincode ?? address?.zip_code ?? address?.postal_code,
// // //     address?.country,
// // //   ].filter(Boolean);
// // //   const rawDeliveryAddress = raw?.delivery_address;
// // //   const deliveryAddress =
// // //     isPickupOrder
// // //       ? (typeof rawDeliveryAddress === 'string' && rawDeliveryAddress.trim() !== ''
// // //           ? rawDeliveryAddress
// // //           : 'Pickup order')
// // //       : typeof rawDeliveryAddress === 'string'
// // //       ? rawDeliveryAddress
// // //       : addressParts.length
// // //       ? addressParts.join(', ')
// // //       : (addressJson?.address_line1
// // //           ? [addressJson.address_line1, addressJson.address_line2, addressJson.city, addressJson.state]
// // //               .filter(Boolean).join(', ')
// // //           : '—');
 
// // //   const detailedAddress: DetailedAddress = {
// // //     apartment: address?.apartment || undefined,
// // //     avenue: address?.avenue || undefined,
// // //     block: address?.block || undefined,
// // //     building: address?.building || undefined,
// // //     floor: address?.floor || undefined,
// // //     street: address?.street || undefined,
// // //     country: address?.country || undefined,
// // //     areaName: address?.area?.name ?? raw?.delivery_area?.name ?? undefined,
// // //     addressNotes: address?.delivery_notes || undefined,
// // //     addressLine1: addressJson?.address_line1 || undefined,
// // //     addressLine2: addressJson?.address_line2 || undefined,
// // //     city: addressJson?.city || undefined,
// // //     state: addressJson?.state || undefined,
// // //     pincode: addressJson?.pincode || undefined,
// // //     landmark: addressJson?.landmark || undefined,
// // //   };

// // //   const items: OrderItem[] = (raw?.items ?? raw?.order_items ?? []).map((it: any, idx: number) => {
// // //     const product    = it?.product ?? {};
// // //     const customJson = it?.custom_json ?? {};
// // //     return {
// // //       id: String(it?.id ?? `item-${idx}`),
// // //       productName: product?.name ?? it?.product_name ?? it?.name ?? 'Item',
// // //       productDescription: product?.description ?? undefined,
// // //       quantity: Number(it?.quantity ?? 1),
// // //       price: Number(it?.price ?? product?.price ?? 0),
// // //       addOnPriceTotal: Number(it?.add_on_total ?? customJson?.add_on_total ?? 0),
// // //       lineTotal: it?.line_total != null ? Number(it.line_total) : undefined,
// // //       selectedVariant: customJson?.variant_name ?? customJson?.variant ?? it?.variant ?? undefined,
// // //       selectedFlavour: customJson?.flavour_name ?? customJson?.flavour ?? it?.flavour ?? undefined, 
// // //       selectedAddOns:  customJson?.addons ?? customJson?.add_ons ?? it?.add_ons ?? [],
// // //       imageUrl: product?.image_url ?? product?.imageUrl ?? undefined,
// // //     };
// // //   });

// // //   let subtotal = Number(raw?.subtotal ?? raw?.sub_total ?? 0);
// // //   if (!subtotal) {
// // //     subtotal = items.reduce(
// // //       (sum, it) => sum + (it.lineTotal ?? (it.price + it.addOnPriceTotal) * it.quantity),
// // //       0
// // //     );
// // //   }

// // //   const discount       = Number(raw?.discount ?? 0);
// // //   const deliveryCharge = Number(raw?.delivery_charge ?? raw?.delivery_fee ?? 0);
// // //   let   total          = Number(raw?.total ?? raw?.grand_total ?? 0);
// // //   if (!total) total    = subtotal - discount + deliveryCharge;

// // //   const currency      = String(raw?.currency ?? 'INR').toUpperCase();
// // //   const paymentMethod = String(raw?.payment_method ?? 'N/A').toUpperCase();
// // //   const timeline: TimelineEntry[] = (raw?.history ?? raw?.timeline ?? []).map(mapTimelineEntry);

// // //   // ── Order origin: who created / logged the order ──
// // //   const createdBy      = raw?.created_by ?? {};
// // //   const createdByName  = createdBy?.name
// // //     ?? `${createdBy?.first_name ?? ''} ${createdBy?.last_name ?? ''}`.trim()
// // //     ?? undefined;
// // //   const createdByRole  = createdBy?.role ?? undefined;
// // //   const createdByPhone = createdBy?.phone_no ?? undefined;
// // //   const createdByEmail = createdBy?.email ?? undefined;
// // //   const orderSource    = raw?.order_source ?? undefined;
// // //   const orderTypeRaw   = String(raw?.order_type ?? '').toLowerCase();
// // //   const isSalesAgentOrder =
// // //     createdByRole === 'SALES_AGENT' ||
// // //     orderSource === 'SALES_AGENT' ||
// // //     orderTypeRaw === 'sales_agent' ||
// // //     orderTypeRaw === 'agent_order';

// // //   // ── Custom cake order ──
// // //   const customCakeRaw = raw?.custom_cake_json ?? null;
// // //   const isCustomCakeOrder = !!customCakeRaw;
// // //   const customCake: CustomCakeDetails | null = customCakeRaw ? {
// // //     flavour: customCakeRaw?.flavour || undefined,
// // //     weight:  customCakeRaw?.weight  || undefined,
// // //     shape:   customCakeRaw?.shape   || undefined,
// // //     size:    customCakeRaw?.size    || undefined,
// // //     colour:  customCakeRaw?.colour  || undefined,
// // //     message: customCakeRaw?.message || undefined,
// // //     image:   customCakeRaw?.image   || undefined,
// // //     notes:   customCakeRaw?.notes   || undefined,
// // //     price:   customCakeRaw?.price != null ? Number(customCakeRaw.price) : undefined,
// // //   } : null;

// // //   const deliveryDate     = raw?.delivery_date ?? raw?.pickup_date ?? undefined;
// // //   const deliveryTimeSlot = raw?.delivery_time_slot ?? raw?.pickup_time_slot ?? undefined;
// // //   const deliveryMethod   = deliveryMethodRaw || undefined;
 
// // //   const greetingTo      = raw?.greeting_to ?? undefined;
// // //   const greetingFrom    = raw?.greeting_from ?? undefined;
// // //   const greetingMessage = raw?.greeting_message ?? undefined;

// // //   return {
// // //     id: String(raw?.id ?? ''),
// // //     orderNumber: raw?.order_number ?? undefined,
// // //     customerName,
// // //     customerPhone,
// // //     customerEmail,
// // //     deliveryAddress,
// // //     detailedAddress,
// // //     items,
// // //     subtotal,
// // //     discount,
// // //     deliveryCharge,
// // //     total,
// // //     currency,
// // //     status,
// // //     paymentMethod,
// // //     paymentStatus:    raw?.payment_status ?? undefined,
// // //     orderType:        raw?.order_type ?? undefined,
// // //     loyaltyCoupon:    raw?.loyalty_coupon ?? undefined,
// // //     rejectionReason:  raw?.rejection_reason ?? undefined,
// // //     notes:            raw?.notes ?? raw?.delivery_notes ?? undefined,
// // //     createdAt:        raw?.created_at ?? raw?.createdAt ?? new Date().toISOString(),
// // //     timeline,

// // //     createdByName,
// // //     createdByRole,
// // //     createdByPhone,
// // //     createdByEmail,
// // //     orderSource,
// // //     isSalesAgentOrder,
// // //     deliveryMethod,
 
// // //     customCake,
// // //     isCustomCakeOrder,
 
// // //     deliveryDate,
// // //     deliveryTimeSlot,
 
// // //     greetingTo,
// // //     greetingFrom,
// // //     greetingMessage,
// // //   };
// // // }

// // // // ─── Sub-components ───────────────────────────────────────────────────────────

// // // interface ModalProps {
// // //   isOpen: boolean;
// // //   onClose: () => void;
// // //   title: string;
// // //   children: React.ReactNode;
// // //   width?: string;
// // // }
// // // const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, width = '500px' }) => {
// // //   if (!isOpen) return null;
// // //   return (
// // //     <div className="sao-modal-overlay" onClick={onClose}>
// // //       <div className="sao-modal-content" style={{ maxWidth: width }} onClick={e => e.stopPropagation()}>
// // //         <div className="sao-modal-header">
// // //           <h3>{title}</h3>
// // //           <button className="sao-modal-close" onClick={onClose}><X size={18} /></button>
// // //         </div>
// // //         <div className="sao-modal-body">{children}</div>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
// // //   pending:             { label: 'Pending',            className: 'status-pending'    },
// // //   accepted:            { label: 'Accepted',           className: 'status-confirmed'  },
// // //   assigned_to_kitchen: { label: 'Kitchen Assigned',   className: 'status-processing' },
// // //   preparing:           { label: 'Preparing',          className: 'status-processing' },
// // //   ready:               { label: 'Ready for Dispatch', className: 'status-ready'      },
// // //   assigned_to_agent:   { label: 'Agent Assigned',     className: 'status-assigned'   },
// // //   assigned_to_driver:  { label: 'Driver Assigned',    className: 'status-assigned'   },
// // //   out_for_delivery:    { label: 'Out for Delivery',   className: 'status-ontheway'   },
// // //   delivery_submitted:  { label: 'Proof Submitted',    className: 'status-ontheway'   },
// // //   delivered:           { label: 'Delivered',          className: 'status-delivered'  },
// // //   rejected:            { label: 'Rejected',           className: 'status-cancelled'  },
// // //   cancelled:           { label: 'Cancelled',          className: 'status-cancelled'  },
// // // };

// // // const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
// // //   const cfg = STATUS_CONFIG[status] ?? { label: status.replace(/_/g, ' '), className: 'status-default' };
// // //   return (
// // //     <span className={`sao-status-badge ${cfg.className}`}>
// // //       <span className="badge-dot" />{cfg.label}
// // //     </span>
// // //   );
// // // };

// // // // NEW: shows PICKUP vs DELIVERY as its own chip so it's visible even without the row tint
// // // const DeliveryMethodBadge: React.FC<{ method?: string }> = ({ method }) => {
// // //   const m = (method || '').toUpperCase();
// // //   if (m === 'PICKUP') {
// // //     return <span className="sao-method-badge method-pickup">Pickup</span>;
// // //   }
// // //   return <span className="sao-method-badge method-delivery">Delivery</span>;
// // // };

// // // const PaymentStatusChip: React.FC<{ status: string | undefined }> = ({ status }) => {
// // //   if (!status) return null;
// // //   const s = status.toUpperCase();
// // //   const className = s === 'PAID' || s === 'COMPLETED'
// // //     ? 'sao-payment-status-chip chip-paid'
// // //     : s === 'FAILED'
// // //     ? 'sao-payment-status-chip chip-failed'
// // //     : 'sao-payment-status-chip chip-pending';
// // //   return <span className={className}>{status}</span>;
// // // };

// // // interface Column<T> {
// // //   header: string;
// // //   accessor: keyof T | ((row: T) => React.ReactNode);
// // //   align?: 'left' | 'center' | 'right';
// // //   width?: string;
// // // }
// // // interface DataTableProps<T> {
// // //   columns: Column<T>[];
// // //   data: T[];
// // //   emptyMessage?: string;
// // //   // NEW: lets the parent tint each row (e.g. by delivery method)
// // //   rowClassName?: (row: T) => string;
// // // }
// // // function DataTable<T extends { id: string }>({
// // //   columns, data, emptyMessage = 'No items found', rowClassName,
// // // }: DataTableProps<T>) {
// // //   return (
// // //     <div className="sao-table-card">
// // //       <div className="sao-table-container">
// // //         <table className="sao-data-table">
// // //           <thead>
// // //             <tr>
// // //               {columns.map((col, i) => (
// // //                 <th key={i} style={{ textAlign: col.align || 'left', width: col.width || 'auto' }}>
// // //                   {col.header}
// // //                 </th>
// // //               ))}
// // //             </tr>
// // //           </thead>
// // //           <tbody>
// // //             {data.length > 0 ? data.map(row => (
// // //               <tr key={row.id} className={rowClassName ? rowClassName(row) : undefined}>
// // //                 {columns.map((col, ci) => {
// // //                   const cell = typeof col.accessor === 'function'
// // //                     ? col.accessor(row)
// // //                     : (row[col.accessor] as React.ReactNode);
// // //                   return <td key={ci} style={{ textAlign: col.align || 'left' }}>{cell}</td>;
// // //                 })}
// // //               </tr>
// // //             )) : (
// // //               <tr>
// // //                 <td colSpan={columns.length} className="sao-empty-table-cell">
// // //                   <p>{emptyMessage}</p>
// // //                 </td>
// // //               </tr>
// // //             )}
// // //           </tbody>
// // //         </table>
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // // // ─── Main component ───────────────────────────────────────────────────────────

// // // const Salesagentorder: React.FC = () => {
// // //   const [orders, setOrders] = useState<Order[]>([]);
// // //   const [loading, setLoading] = useState(true);
// // //   const [error, setError] = useState<string | null>(null);
// // //   const [statusFilter, setStatusFilter] = useState<string>('all');

// // //   const [fullDetailsOrderId, setFullDetailsOrderId] = useState<string | null>(null);
// // //   const [receiptOrderId, setReceiptOrderId] = useState<string | null>(null);

// // //   // ── Payment link / QR ──
// // //   const [paymentOrderId, setPaymentOrderId] = useState<string | null>(null);
// // //   const [paymentLink, setPaymentLink] = useState<string | null>(null);
// // //   const [paymentLoading, setPaymentLoading] = useState(false);
// // //   const [paymentError, setPaymentError] = useState<string | null>(null);
// // //   const [linkCopied, setLinkCopied] = useState(false);

// // //   const fetchOrders = useCallback(async () => {
// // //     setLoading(true);
// // //     setError(null);
// // //     try {
// // //       const raw = await getSalesAgentOrders();
// // //       const normalized = (raw ?? []).map(normalizeOrder);
// // //       setOrders(normalized);
// // //     } catch (err) {
// // //       console.error('Failed to fetch sales agent orders:', err);
// // //       setError('Failed to load orders. Please check your connection and try again.');
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   }, []);

// // //   useEffect(() => {
// // //     fetchOrders();
// // //   }, [fetchOrders]);

// // //   // Lazy-load timeline when a full-details modal is opened
// // //   useEffect(() => {
// // //     if (!fullDetailsOrderId) return;
// // //     const current = orders.find(o => o.id === fullDetailsOrderId);
// // //     if (!current || current.timeline.length > 0) return;
// // //     let cancelled = false;
// // //     (async () => {
// // //       try {
// // //         const history = await getOrderHistory(Number(fullDetailsOrderId));
// // //         if (!cancelled && Array.isArray(history) && history.length > 0) {
// // //           setOrders(prev =>
// // //             prev.map(o => o.id === fullDetailsOrderId ? { ...o, timeline: history.map(mapTimelineEntry) } : o)
// // //           );
// // //         }
// // //       } catch { /* non-fatal */ }
// // //     })();
// // //     return () => { cancelled = true; };
// // //   }, [fullDetailsOrderId]); // eslint-disable-line react-hooks/exhaustive-deps

// // //   const filteredOrders = orders.filter(o => {
// // //     if (statusFilter === 'all')    return true;
// // //     if (statusFilter === 'active') return !['delivered', 'cancelled', 'rejected'].includes(o.status);
// // //     return o.status === statusFilter;
// // //   });

// // //   const fullDetailsOrder = orders.find(o => o.id === fullDetailsOrderId);
// // //   const receiptOrder = orders.find(o => o.id === receiptOrderId);
// // //   const paymentOrder = orders.find(o => o.id === paymentOrderId);

// // //   const getStatusCount = (s: string) => {
// // //     if (s === 'all')    return orders.length;
// // //     if (s === 'active') return orders.filter(o => !['delivered', 'cancelled', 'rejected'].includes(o.status)).length;
// // //     return orders.filter(o => o.status === s).length;
// // //   };

// // //   // NEW: row tint helper — blue for pickup, green for delivery
// // //   const getRowClassName = (row: Order) => {
// // //     const method = (row.deliveryMethod || '').toUpperCase();
// // //     return method === 'PICKUP' ? 'sao-row-pickup' : 'sao-row-delivery';
// // //   };

// // //   // ── Payment link / QR handlers ──
// // //   const handleOpenPayment = async (orderId: string) => {
// // //     setPaymentOrderId(orderId);
// // //     setPaymentLink(null);
// // //     setPaymentError(null);
// // //     setLinkCopied(false);
// // //     setPaymentLoading(true);
// // //     try {
// // //       const result = await createPaymentLink(Number(orderId));
// // //       if (result?.success === false) {
// // //         setPaymentError(result?.error || 'Unable to generate payment link.');
// // //       } else if (result?.payment_url) {
// // //         setPaymentLink(result.payment_url);
// // //       } else {
// // //         setPaymentError('Payment link was not returned by the server.');
// // //       }
// // //     } catch (err: any) {
// // //       console.error('Failed to create payment link:', err);
// // //       setPaymentError(
// // //         err?.response?.data?.error || 'Failed to generate payment link. Please try again.'
// // //       );
// // //     } finally {
// // //       setPaymentLoading(false);
// // //     }
// // //   };

// // //   const handleCopyLink = async () => {
// // //     if (!paymentLink) return;
// // //     try {
// // //       await navigator.clipboard.writeText(paymentLink);
// // //       setLinkCopied(true);
// // //       setTimeout(() => setLinkCopied(false), 2000);
// // //     } catch {
// // //       /* clipboard unavailable, ignore */
// // //     }
// // //   };

// // //   const closePaymentModal = () => {
// // //     setPaymentOrderId(null);
// // //     setPaymentLink(null);
// // //     setPaymentError(null);
// // //     setPaymentLoading(false);
// // //   };

// // //   const FILTER_TABS = [
// // //     { key: 'all',                label: 'All'               },
// // //     { key: 'active',             label: 'Active'            },
// // //     { key: 'pending',            label: 'Pending'           },
// // //     { key: 'accepted',           label: 'Accepted'          },
// // //     { key: 'assigned_to_kitchen',label: 'Kitchen Assigned'  },
// // //     { key: 'preparing',          label: 'Preparing'         },
// // //     { key: 'ready',              label: 'Ready'             },
// // //     { key: 'assigned_to_agent',  label: 'Agent Assigned'    },
// // //     { key: 'assigned_to_driver', label: 'Driver Assigned'   },
// // //     { key: 'out_for_delivery',   label: 'Out for Delivery'  },
// // //     { key: 'delivery_submitted', label: 'Proof Submitted'   },
// // //     { key: 'delivered',          label: 'Delivered'         },
// // //     { key: 'cancelled',          label: 'Cancelled'         },
// // //   ];

// // //   return (
// // //     <div className="sao-page-container">

// // //       {/* Header */}
// // //       <header className="sao-header">
// // //         <p className="sao-eyebrow">Sales Agent Orders</p>
// // //         <h1 className="sao-title">Orders Logged by Sales Agents</h1>
// // //       </header>

// // //       {/* Error banner */}
// // //       {error && (
// // //         <div className="sao-error-banner">
// // //           <AlertCircle size={16} />
// // //           <span>{error}</span>
// // //           <button className="sao-error-retry-btn" onClick={() => setError(null)}>Dismiss</button>
// // //           <button className="sao-error-retry-btn" onClick={fetchOrders}>Retry</button>
// // //         </div>
// // //       )}

// // //       {/* Filter row */}
// // //       <div className="sao-filters-row">
// // //         {FILTER_TABS.map(({ key, label }) => (
// // //           <button
// // //             key={key}
// // //             className={`sao-filter-tag ${statusFilter === key ? 'active' : ''}`}
// // //             onClick={() => setStatusFilter(key)}
// // //           >
// // //             {label} ({getStatusCount(key)})
// // //           </button>
// // //         ))}
// // //         {/* <button
// // //           className="sao-refresh-btn"
// // //           onClick={fetchOrders}
// // //           disabled={loading}
// // //           title="Refresh orders"
// // //         >
// // //           <RefreshCw size={15} className={loading ? 'sao-spin' : ''} />
// // //         </button> */}
// // //       </div>

// // //       {/* NEW: legend so the row-tint meaning is obvious */}
// // //       <div className="sao-legend-row">
// // //         <span className="sao-legend-item">
// // //           <span className="sao-legend-swatch swatch-pickup" /> Pickup order
// // //         </span>
// // //         <span className="sao-legend-item">
// // //           <span className="sao-legend-swatch swatch-delivery" /> Delivery order
// // //         </span>
// // //       </div>

// // //       {/* Table */}
// // //       {loading && orders.length === 0 ? (
// // //         <div className="sao-loading-state">
// // //           <Loader2 size={22} className="sao-spin" />
// // //           <p>Loading sales agent orders…</p>
// // //         </div>
// // //       ) : orders.length === 0 ? (
// // //         <div className="sao-empty-state">
// // //           <UserCheck size={32} />
// // //           <p>No sales agent orders found yet.</p>
// // //         </div>
// // //       ) : (
// // //         <div className="sao-grid">
// // //           <DataTable
// // //             rowClassName={getRowClassName}
// // //             columns={[
// // //               {
// // //                 header: 'Order #',
// // //                 accessor: (row: Order) => (
// // //                   <div className="sao-order-id-cell">
// // //                     <strong className="sao-order-id">{row.orderNumber ?? row.id}</strong>
// // //                     <span className="sao-agent-tag">
// // //                       <UserCheck size={10} /> {row.createdByName || 'Sales Agent'}
// // //                     </span>
// // //                   </div>
// // //                 ),
// // //               },
// // //               {
// // //                 header: 'Time',
// // //                 accessor: (row: Order) =>
// // //                   new Date(row.createdAt).toLocaleString([], {
// // //                     month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
// // //                   }),
// // //               },
// // //               {
// // //                 header: 'Customer',
// // //                 accessor: (row: Order) => (
// // //                   <div className="sao-cust-cell">
// // //                     <span className="sao-cust-name">{row.customerName}</span>
// // //                     <span className="sao-cust-sub">{row.customerPhone}</span>
// // //                   </div>
// // //                 ),
// // //               },
// // //               {
// // //                 header: 'Fulfilment',
// // //                 accessor: (row: Order) => <DeliveryMethodBadge method={row.deliveryMethod} />,
// // //               },
// // //               {
// // //                 header: 'Items',
// // //                 accessor: (row: Order) =>
// // //                   `${row.items.reduce((acc, i) => acc + i.quantity, 0)} item(s)`,
// // //               },
// // //               {
// // //                 header: 'Total',
// // //                 accessor: (row: Order) => <strong>{formatMoney(row.total, row.currency)}</strong>,
// // //               },
// // //               {
// // //                 header: 'Payment',
// // //                 accessor: (row: Order) => (
// // //                   <div className="sao-cust-cell">
// // //                     <span className="sao-cust-name">{row.paymentMethod}</span>
// // //                     {row.paymentStatus && <PaymentStatusChip status={row.paymentStatus} />}
// // //                   </div>
// // //                 ),
// // //               },
// // //               {
// // //                 header: 'Status',
// // //                 accessor: (row: Order) => <StatusBadge status={row.status} />,
// // //               },
// // //               {
// // //                 header: 'Actions',
// // //                 accessor: (row: Order) => (
// // //                   <div className="sao-actions-cell">
// // //                     <button
// // //                       className="sao-icon-btn"
// // //                       title="View full order details"
// // //                       onClick={() => setFullDetailsOrderId(row.id)}
// // //                     >
// // //                       <Eye size={17} />
// // //                     </button>
// // //                     <button
// // //                       className="sao-icon-btn"
// // //                       title="Print receipt"
// // //                       onClick={() => setReceiptOrderId(row.id)}
// // //                     >
// // //                       <Printer size={17} />
// // //                     </button>
// // //                     {/* Payment link/QR is always available, even when the order is already paid,
// // //                         so the agent can still resend or re-view the link. */}
// // //                     <button
// // //                       className="sao-icon-btn"
// // //                       title={
// // //                         row.paymentStatus?.toUpperCase() === 'PAID'
// // //                           ? 'View payment link (already paid)'
// // //                           : 'Generate payment link & QR'
// // //                       }
// // //                       onClick={() => handleOpenPayment(row.id)}
// // //                     >
// // //                       <CreditCard size={17} />
// // //                     </button>
// // //                   </div>
// // //                 ),
// // //                 align: 'right',
// // //               },
// // //             ]}
// // //             data={filteredOrders}
// // //             emptyMessage="No sales agent orders match this filter."
// // //           />
// // //         </div>
// // //       )}

// // //       {/* ══════ FULL DETAILS MODAL (read-only, no actions) ══════ */}
// // //       <Modal
// // //         isOpen={!!fullDetailsOrder}
// // //         onClose={() => setFullDetailsOrderId(null)}
// // //         title={`Order Details — ${fullDetailsOrder?.orderNumber ?? fullDetailsOrder?.id ?? ''}`}
// // //         width="640px"
// // //       >
// // //         {fullDetailsOrder && (
// // //           <div className="sao-fd-body">

// // //             <div className="sao-fd-top-row">
// // //               <StatusBadge status={fullDetailsOrder.status} />
// // //               {fullDetailsOrder.paymentStatus && <PaymentStatusChip status={fullDetailsOrder.paymentStatus} />}
// // //               <DeliveryMethodBadge method={fullDetailsOrder.deliveryMethod} />
// // //               <span className="sao-origin-badge">
// // //                 <UserCheck size={11} /> Sales Agent Order
// // //               </span>
// // //               {fullDetailsOrder.isCustomCakeOrder && (
// // //                 <span className="sao-origin-badge badge-custom">
// // //                   <Cake size={11} /> Custom Order
// // //                 </span>
// // //               )}
// // //             </div>

// // //             <div className="sao-fd-section sao-fd-highlight">
// // //               <h4><UserCheck size={14} /> Order Origin</h4>
// // //               <div className="sao-fd-grid">
// // //                 <div><span className="lbl">Placed by</span><span>{fullDetailsOrder.createdByName ?? '—'}</span></div>
// // //                 <div><span className="lbl">Role</span><span>{fullDetailsOrder.createdByRole ?? '—'}</span></div>
// // //                 <div><span className="lbl">Phone</span><span>{fullDetailsOrder.createdByPhone ?? '—'}</span></div>
// // //                 <div><span className="lbl">Email</span><span>{fullDetailsOrder.createdByEmail ?? '—'}</span></div>
// // //               </div>
// // //             </div>

// // //             <div className="sao-fd-section">
// // //               <h4><CalendarClock size={14} /> {fullDetailsOrder.deliveryMethod === 'PICKUP' ? 'Pickup Schedule' : 'Delivery Schedule'}</h4>
// // //               <div className="sao-fd-grid">
// // //                 <div>
// // //                   <span className="lbl">{fullDetailsOrder.deliveryMethod === 'PICKUP' ? 'Pickup date' : 'Expected date'}</span>
// // //                   <span>{formatDate(fullDetailsOrder.deliveryDate)}</span>
// // //                 </div>
// // //                 <div>
// // //                   <span className="lbl">{fullDetailsOrder.deliveryMethod === 'PICKUP' ? 'Pickup time' : 'Time slot'}</span>
// // //                   <span>{fullDetailsOrder.deliveryTimeSlot ?? '—'}</span>
// // //                 </div>
// // //                 <div><span className="lbl">Area</span><span>{fullDetailsOrder.detailedAddress?.areaName ?? '—'}</span></div>
// // //               </div>
// // //             </div>

// // //             <div className="sao-fd-section">
// // //               <h4>Customer &amp; Address</h4>
// // //               <div className="sao-fd-grid">
// // //                 <div><span className="lbl">Name</span><span>{fullDetailsOrder.customerName}</span></div>
// // //                 <div><span className="lbl">Phone</span><span>{fullDetailsOrder.customerPhone}</span></div>
// // //                 <div><span className="lbl">Email</span><span>{fullDetailsOrder.customerEmail ?? '—'}</span></div>
// // //               </div>
// // //               <div className="sao-fd-address-block">
// // //                 <p><strong>Address:</strong> {fullDetailsOrder.deliveryAddress}</p>
// // //                  {fullDetailsOrder.detailedAddress?.areaName && (
// // //     <p><strong>Area:</strong> {fullDetailsOrder.detailedAddress.areaName}</p>
// // //   )}
// // //               </div>
// // //             </div>

// // //             <div className="sao-fd-section">
// // //               <h4>Ordered Products</h4>
// // //               {fullDetailsOrder.items.length > 0 ? (
// // //                 <div className="sao-fd-items-list">
// // //                   {fullDetailsOrder.items.map(item => (
// // //                     <div key={item.id} className="sao-fd-item-row">
// // //                       {item.imageUrl && <img src={item.imageUrl} alt={item.productName} className="sao-fd-item-thumb" />}
// // //                       <div className="sao-fd-item-info">
// // //                         <strong>{item.productName}</strong>
// // //                         <div className="sao-fd-item-meta">
// // //                           <span>Qty: {item.quantity}</span>
// // //                           <span>Unit: {formatMoney(item.price, fullDetailsOrder.currency)}</span>
// // //                           {item.selectedVariant && <span>Variant: {item.selectedVariant}</span>}
// // //                           {item.selectedFlavour && <span>Flavour: {item.selectedFlavour}</span>}
// // //                           {item.selectedAddOns.length > 0 && <span>Add-ons: {item.selectedAddOns.join(', ')}</span>}
// // //                         </div>
// // //                       </div>
// // //                       <span className="sao-fd-item-total">
// // //                         {formatMoney(item.lineTotal ?? (item.price + item.addOnPriceTotal) * item.quantity, fullDetailsOrder.currency)}
// // //                       </span>
// // //                     </div>
// // //                   ))}
// // //                 </div>
// // //               ) : (
// // //                 <p className="sao-muted">No standard catalog items (custom cake order below).</p>
// // //               )}
// // //             </div>

// // //             {/* Custom cake block — now shows every field captured on the create-order form:
// // //                 flavour, shape, size, weight, colour, price, message, notes and reference image. */}
// // //             {fullDetailsOrder.isCustomCakeOrder && fullDetailsOrder.customCake && (
// // //               <div className="sao-fd-section sao-fd-highlight-cake">
// // //                 <h4><Cake size={14} /> Custom Cake Details</h4>
// // //                 <div className="sao-fd-cake-body">
// // //                   {fullDetailsOrder.customCake.image && (
// // //                     <img src={fullDetailsOrder.customCake.image} alt="Custom cake reference" className="sao-fd-cake-image" />
// // //                   )}
// // //                   <div className="sao-fd-grid">
// // //                     <div><span className="lbl">Flavour</span><span>{fullDetailsOrder.customCake.flavour ?? '—'}</span></div>
// // //                     <div><span className="lbl">Shape</span><span>{fullDetailsOrder.customCake.shape ?? '—'}</span></div>
// // //                     <div><span className="lbl">Size / Variant</span><span>{fullDetailsOrder.customCake.size ?? '—'}</span></div>
// // //                     <div><span className="lbl">Weight</span><span>{fullDetailsOrder.customCake.weight ?? '—'}</span></div>
// // //                     <div><span className="lbl">Colour</span><span>{fullDetailsOrder.customCake.colour ?? '—'}</span></div>
// // //                     <div><span className="lbl">Est. price</span><span>{fullDetailsOrder.customCake.price != null ? formatMoney(fullDetailsOrder.customCake.price, fullDetailsOrder.currency) : '—'}</span></div>
// // //                   </div>
// // //                   {fullDetailsOrder.customCake.message && (
// // //                     <p className="sao-fd-cake-message"><strong>Cake message:</strong> "{fullDetailsOrder.customCake.message}"</p>
// // //                   )}
// // //                   {fullDetailsOrder.customCake.notes && (
// // //                     <p className="sao-fd-cake-message"><strong>Notes for baker:</strong> {fullDetailsOrder.customCake.notes}</p>
// // //                   )}
// // //                 </div>
// // //               </div>
// // //             )}

// // //             {(fullDetailsOrder.greetingMessage || fullDetailsOrder.greetingTo) && (
// // //               <div className="sao-fd-section sao-fd-highlight-greeting">
// // //                 <h4><Gift size={14} /> Greeting Card</h4>
// // //                 <div className="sao-fd-grid">
// // //                   <div><span className="lbl">To</span><span>{fullDetailsOrder.greetingTo ?? '—'}</span></div>
// // //                   <div><span className="lbl">From</span><span>{fullDetailsOrder.greetingFrom ?? '—'}</span></div>
// // //                 </div>
// // //                 {fullDetailsOrder.greetingMessage && (
// // //                   <p className="sao-fd-greeting-message">
// // //                     <Sparkles size={13} /> "{fullDetailsOrder.greetingMessage}"
// // //                   </p>
// // //                 )}
// // //               </div>
// // //             )}

// // //             <div className="sao-fd-section">
// // //               <h4>Payment &amp; Pricing</h4>
// // //               <div className="sao-fd-grid">
// // //                 <div><span className="lbl">Method</span><span>{fullDetailsOrder.paymentMethod}</span></div>
// // //                 <div><span className="lbl">Status</span><span>{fullDetailsOrder.paymentStatus ?? '—'}</span></div>
// // //                 <div><span className="lbl">Currency</span><span>{fullDetailsOrder.currency}</span></div>
// // //               </div>
// // //               <div className="sao-cost-breakdown">
// // //                 <div className="sao-cost-row"><span>Subtotal:</span><span>{formatMoney(fullDetailsOrder.subtotal, fullDetailsOrder.currency)}</span></div>
// // //                 {fullDetailsOrder.discount > 0 && (
// // //                   <div className="sao-cost-row discount">
// // //                     <span>Discount:</span>
// // //                     <span>-{formatMoney(fullDetailsOrder.discount, fullDetailsOrder.currency)}</span>
// // //                   </div>
// // //                 )}
// // //                 <div className="sao-cost-row"><span>Delivery:</span><span>{formatMoney(fullDetailsOrder.deliveryCharge, fullDetailsOrder.currency)}</span></div>
// // //                 <div className="sao-cost-row total"><span>Grand Total:</span><span>{formatMoney(fullDetailsOrder.total, fullDetailsOrder.currency)}</span></div>
// // //               </div>
// // //             </div>

// // //             <div className="sao-fd-actions-row">
// // //               <button
// // //                 className="sao-btn sao-btn-secondary"
// // //                 onClick={() => { setReceiptOrderId(fullDetailsOrder.id); setFullDetailsOrderId(null); }}
// // //               >
// // //                 <Printer size={13} /> Print Receipt
// // //               </button>
// // //               {/* Payment button no longer disabled once paid — agent can still open/resend the link */}
// // //               <button
// // //                 className="sao-btn sao-btn-primary"
// // //                 onClick={() => { handleOpenPayment(fullDetailsOrder.id); setFullDetailsOrderId(null); }}
// // //               >
// // //                 <CreditCard size={13} /> Payment
// // //               </button>
// // //             </div>

// // //           </div>
// // //         )}
// // //       </Modal>

// // //       {/* ══════ RECEIPT MODAL ══════ */}
// // //       <Modal
// // //         isOpen={!!receiptOrder}
// // //         onClose={() => setReceiptOrderId(null)}
// // //         title="Print Receipt"
// // //         width="380px"
// // //       >
// // //         {receiptOrder && (
// // //           <div className="sao-receipt-sheet">
// // //             {/* CakeNTake logo — swap the src for your hosted logo path/import if needed */}
// // //             <div className="sao-receipt-logo-wrap">
// // //               <img src="/logo.png" alt="CakeNTake" className="sao-receipt-logo" />
// // //             </div>
// // //             <div className="sao-receipt-title">
// // //               <h2>ORDER RECEIPT</h2>
// // //               <p className="sao-divider">- - - - - - - - - - - - - - - - - - -</p>
// // //             </div>
// // //             <div className="sao-receipt-basics">
// // //               <p><strong>Order No:</strong> {receiptOrder.orderNumber ?? receiptOrder.id}</p>
// // //               <p><strong>Date:</strong> {new Date(receiptOrder.createdAt).toLocaleDateString()}</p>
// // //               <p><strong>Time:</strong> {new Date(receiptOrder.createdAt).toLocaleTimeString()}</p>
// // //               <p><strong>Fulfilment:</strong> {(receiptOrder.deliveryMethod || 'DELIVERY').toUpperCase() === 'PICKUP' ? 'Pickup' : 'Delivery'}</p>
// // //               <p><strong>Customer:</strong> {receiptOrder.customerName}</p>
// // //               <p><strong>Phone:</strong> {receiptOrder.customerPhone}</p>
// // //               <p><strong>Payment:</strong> {receiptOrder.paymentMethod}</p>
// // //               {receiptOrder.paymentStatus && (
// // //                 <p><strong>Payment Status:</strong> {receiptOrder.paymentStatus}</p>
// // //               )}
// // //               <p className="sao-divider">- - - - - - - - - - - - - - - - - - -</p>
// // //             </div>
// // //             <div className="sao-receipt-items">
// // //               {receiptOrder.items.map(item => (
// // //                 <div key={item.id} className="sao-receipt-tr">
// // //                   <span className="sao-qty-name">{item.quantity} × {item.productName.slice(0, 22)}
// // //                     {item.selectedFlavour ? ` (${item.selectedFlavour})` : ''}
// // //                   </span>
// // //                   <span className="sao-sum-p">
// // //                     {formatMoney(
// // //                       item.lineTotal ?? (item.price + item.addOnPriceTotal) * item.quantity,
// // //                       receiptOrder.currency
// // //                     )}
// // //                   </span>
// // //                 </div>
// // //               ))}
// // //               <p className="sao-divider">- - - - - - - - - - - - - - - - - - -</p>
// // //             </div>
// // //             <div className="sao-receipt-financials">
// // //               <div className="sao-calc-row"><span>Subtotal:</span><span>{formatMoney(receiptOrder.subtotal, receiptOrder.currency)}</span></div>
// // //               {receiptOrder.discount > 0 && (
// // //                 <div className="sao-calc-row">
// // //                   <span>Discount:</span>
// // //                   <span>-{formatMoney(receiptOrder.discount, receiptOrder.currency)}</span>
// // //                 </div>
// // //               )}
// // //               <div className="sao-calc-row"><span>Delivery:</span><span>{formatMoney(receiptOrder.deliveryCharge, receiptOrder.currency)}</span></div>
// // //               <p className="sao-divider">- - - - - - - - - - - - - - - - - - -</p>
// // //               <div className="sao-calc-row sao-grand-total"><span>GRAND TOTAL:</span><span>{formatMoney(receiptOrder.total, receiptOrder.currency)}</span></div>
// // //               <p className="sao-divider">- - - - - - - - - - - - - - - - - - -</p>
// // //             </div>
// // //             <div className="sao-receipt-footer"><p>Thank you for your order!</p></div>
// // //             <div className="sao-receipt-controls sao-no-print">
// // //               <button className="sao-btn sao-btn-secondary sao-btn-sm" onClick={() => window.print()}>
// // //                 <Printer size={13} /><span>Print</span>
// // //               </button>
// // //               <button className="sao-btn sao-btn-primary sao-btn-sm" onClick={() => setReceiptOrderId(null)}>
// // //                 Close
// // //               </button>
// // //             </div>
// // //           </div>
// // //         )}
// // //       </Modal>

// // //       {/* ══════ PAYMENT LINK / QR MODAL ══════ */}
// // //       <Modal
// // //         isOpen={!!paymentOrderId}
// // //         onClose={closePaymentModal}
// // //         title={`Payment — ${paymentOrder?.orderNumber ?? paymentOrder?.id ?? ''}`}
// // //         width="400px"
// // //       >
// // //         {paymentOrderId && (
// // //           <div className="sao-payment-body">
// // //             {paymentOrder && (
// // //               <div className="sao-payment-summary">
// // //                 <p><strong>Customer:</strong> {paymentOrder.customerName}</p>
// // //                 <p><strong>Amount:</strong> {formatMoney(paymentOrder.total, paymentOrder.currency)}</p>
// // //                 {paymentOrder.paymentStatus?.toUpperCase() === 'PAID' && (
// // //                   <p className="sao-payment-paid-note">
// // //                     <Check size={13} /> This order is already marked as paid — link shown for reference.
// // //                   </p>
// // //                 )}
// // //               </div>
// // //             )}

// // //             {paymentLoading && (
// // //               <div className="sao-payment-loading">
// // //                 <Loader2 size={22} className="sao-spin" />
// // //                 <p>Generating payment link…</p>
// // //               </div>
// // //             )}

// // //             {!paymentLoading && paymentError && (
// // //               <div className="sao-error-banner">
// // //                 <AlertCircle size={16} />
// // //                 <span>{paymentError}</span>
// // //                 <button
// // //                   className="sao-error-retry-btn"
// // //                   onClick={() => paymentOrderId && handleOpenPayment(paymentOrderId)}
// // //                 >
// // //                   Retry
// // //                 </button>
// // //               </div>
// // //             )}

// // //             {!paymentLoading && paymentLink && (
// // //               <div className="sao-payment-content">
// // //                 <div className="sao-payment-qr">
// // //                   <QRCodeSVG value={paymentLink} size={200} />
// // //                 </div>

// // //                 <div className="sao-payment-link-row">
// // //                   <input
// // //                     type="text"
// // //                     className="sao-payment-link-input"
// // //                     value={paymentLink}
// // //                     readOnly
// // //                     onFocus={e => e.target.select()}
// // //                   />
// // //                   <button className="sao-icon-btn" title="Copy link" onClick={handleCopyLink}>
// // //                     {linkCopied ? <Check size={16} /> : <Copy size={16} />}
// // //                   </button>
// // //                 </div>

// // //                 <div className="sao-payment-actions">
// // //                   <a
// // //                     href={paymentLink}
// // //                     target="_blank"
// // //                     rel="noopener noreferrer"
// // //                     className="sao-btn sao-btn-primary sao-btn-sm"
// // //                   >
// // //                     <ExternalLink size={13} /> Open Payment Page
// // //                   </a>
// // //                   <button className="sao-btn sao-btn-secondary sao-btn-sm" onClick={handleCopyLink}>
// // //                     {linkCopied ? <Check size={13} /> : <Copy size={13} />}
// // //                     <span>{linkCopied ? 'Copied' : 'Copy Link'}</span>
// // //                   </button>
// // //                 </div>
// // //               </div>
// // //             )}
// // //           </div>
// // //         )}
// // //       </Modal>

// // //     </div>
// // //   );
// // // };

// // // export default Salesagentorder;





// // import React, { useState, useEffect, useCallback } from 'react';
// // import {
// //   Printer, X, Loader2, RefreshCw, AlertCircle, Eye,
// //   UserCheck, Cake, Gift, CalendarClock, Sparkles,
// //   CreditCard, Copy, Check, ExternalLink, Calendar,
// // } from 'lucide-react';
// // import { QRCodeSVG } from 'qrcode.react';
// // import './Salesagentorder.css';

// // import { getOrderHistory, getSalesAgentOrders } from '../../services/orderService';
// // import { createPaymentLink } from '../../services/paymentService';

// // // ─── Types ────────────────────────────────────────────────────────────────────

// // interface OrderItem {
// //   id: string;
// //   productName: string;
// //   productDescription?: string;
// //   quantity: number;
// //   price: number;
// //   addOnPriceTotal: number;
// //   lineTotal?: number;
// //   selectedVariant?: string;
// //   selectedFlavour?: string;
// //   selectedAddOns: string[];
// //   imageUrl?: string;
// // }

// // interface TimelineEntry {
// //   status: string;
// //   timestamp: string;
// //   note?: string;
// //   changedBy?: string;
// // }

// // /**
// //  * Trimmed to exactly the fields captured on the Sales Agent "Create Order"
// //  * form's custom-cake section: product name, reference image, shape,
// //  * flavour, variant, custom price, message. Nothing else is shown.
// //  */
// // interface CustomCakeDetails {
// //   productName?: string;
// //   image?: string;
// //   shape?: string;
// //   flavour?: string;
// //   variant?: string;
// //   price?: number;
// //   message?: string;
// // }

// // /**
// //  * Full address captured on the Sales Agent "Create Order" form:
// //  * Area, Block, House/Flat No, Street, Country, Landmark, Delivery Notes.
// //  */
// // interface DetailedAddress {
// //   areaName?: string;
// //   block?: string;
// //   houseNo?: string;
// //   street?: string;
// //   country?: string;
// //   landmark?: string;
// //   addressNotes?: string;
// //   // Legacy / alternate shape some backends return — kept as fallback only,
// //   // not shown as separate fields in the UI.
// //   addressLine1?: string;
// //   addressLine2?: string;
// //   city?: string;
// //   state?: string;
// //   pincode?: string;
// // }

// // type OrderStatus =
// //   | 'pending'
// //   | 'accepted'
// //   | 'assigned_to_kitchen'
// //   | 'preparing'
// //   | 'ready'
// //   | 'assigned_to_agent'
// //   | 'assigned_to_driver'
// //   | 'out_for_delivery'
// //   | 'delivery_submitted'
// //   | 'delivered'
// //   | 'cancelled'
// //   | 'rejected';

// // interface Order {
// //   id: string;
// //   orderNumber?: string;
// //   customerName: string;
// //   customerPhone: string;
// //   customerEmail?: string;
// //   deliveryAddress: string;
// //   detailedAddress?: DetailedAddress;
// //   items: OrderItem[];
// //   subtotal: number;
// //   discount: number;
// //   deliveryCharge: number;
// //   total: number;
// //   currency: string;
// //   status: OrderStatus;
// //   paymentMethod: string;
// //   paymentStatus?: string;
// //   orderType?: string;
// //   loyaltyCoupon?: string;
// //   rejectionReason?: string;
// //   notes?: string;
// //   createdAt: string;
// //   timeline: TimelineEntry[];

// //   createdByName?: string;
// //   createdByRole?: string;
// //   createdByPhone?: string;
// //   createdByEmail?: string;
// //   orderSource?: string;
// //   isSalesAgentOrder: boolean;

// //   customCake?: CustomCakeDetails | null;
// //   isCustomCakeOrder: boolean;

// //   deliveryMethod?: string;
// //   deliveryDate?: string;
// //   deliveryTimeSlot?: string;

// //   greetingTo?: string;
// //   greetingFrom?: string;
// //   greetingMessage?: string;
// // }

// // // ─── Status mapping ───────────────────────────────────────────────────────────

// // const STATUS_API_TO_LOCAL: Record<string, OrderStatus> = {
// //   PENDING:             'pending',
// //   ACCEPTED:            'accepted',
// //   ORDER_ACCEPTED:      'accepted',
// //   CONFIRMED:           'accepted',
// //   ASSIGNED_TO_KITCHEN: 'assigned_to_kitchen',
// //   PREPARING:           'preparing',
// //   PROCESSING:          'preparing',
// //   READY:               'ready',
// //   READY_FOR_PICKUP:    'ready',
// //   READY_FOR_DISPATCH:  'ready',
// //   ASSIGNED_TO_AGENT:   'assigned_to_agent',
// //   ASSIGNED_TO_DRIVER:  'assigned_to_driver',
// //   DRIVER_ASSIGNED:     'assigned_to_driver',
// //   DRIVER_ACCEPTED:     'out_for_delivery',
// //   OUT_FOR_DELIVERY:    'out_for_delivery',
// //   ON_THE_WAY:          'out_for_delivery',
// //   DELIVERY_SUBMITTED:  'delivery_submitted',
// //   DELIVERED:           'delivered',
// //   COMPLETED:           'delivered',
// //   DELIVERY_COMPLETED_PENDING_APPROVAL: 'delivery_submitted',
// //   REJECTED:   'rejected',
// //   CANCELLED:  'cancelled',
// //   CANCELED:   'cancelled',
// // };

// // // ─── Helpers ──────────────────────────────────────────────────────────────────

// // function formatMoney(amount: number, currency?: string): string {
// //   const cur = (currency || 'INR').toUpperCase();
// //   try {
// //     return new Intl.NumberFormat(undefined, { style: 'currency', currency: cur }).format(amount || 0);
// //   } catch {
// //     return `₹${(amount || 0).toFixed(2)}`;
// //   }
// // }

// // function formatDate(value?: string): string {
// //   if (!value) return '—';
// //   const d = new Date(value);
// //   if (isNaN(d.getTime())) return String(value);
// //   return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
// // }

// // /** "2026-08" → "August 2026", used by the month filter label. */
// // function formatMonthLabel(value: string): string {
// //   if (!value) return 'Current Month';
// //   const [y, m] = value.split('-').map(Number);
// //   if (!y || !m) return 'Current Month';
// //   const d = new Date(y, m - 1, 1);
// //   return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
// // }

// // /** Local (not UTC) YYYY-MM-DD for an order's createdAt, used by the calendar filter. */
// // function toLocalDateKey(value: string): string {
// //   const d = new Date(value);
// //   if (isNaN(d.getTime())) return '';
// //   const y = d.getFullYear();
// //   const m = String(d.getMonth() + 1).padStart(2, '0');
// //   const day = String(d.getDate()).padStart(2, '0');
// //   return `${y}-${m}-${day}`;
// // }

// // /** Local (not UTC) YYYY-MM for an order's createdAt, used by the month filter. */
// // function toLocalMonthKey(value: string): string {
// //   const d = new Date(value);
// //   if (isNaN(d.getTime())) return '';
// //   const y = d.getFullYear();
// //   const m = String(d.getMonth() + 1).padStart(2, '0');
// //   return `${y}-${m}`;
// // }

// // function mapTimelineEntry(h: any): TimelineEntry {
// //   const rawStatus = String(h?.new_status ?? h?.status ?? '').toUpperCase();
// //   const changedBy = h?.changed_by;
// //   return {
// //     status: STATUS_API_TO_LOCAL[rawStatus] ?? rawStatus.toLowerCase().replace(/_/g, ' '),
// //     timestamp: h?.created_at ?? h?.createdAt ?? h?.changed_at ?? h?.timestamp ?? '',
// //     note: h?.remarks ?? h?.note ?? h?.reason ?? undefined,
// //     changedBy: changedBy?.name ?? (changedBy
// //       ? `${changedBy.first_name ?? ''} ${changedBy.last_name ?? ''}`.trim()
// //       : undefined),
// //   };
// // }

// // function normalizeOrder(raw: any): Order {
// //   const rawStatus = String(raw?.status ?? '').toUpperCase();
// //   const status: OrderStatus = STATUS_API_TO_LOCAL[rawStatus] ?? 'pending';

// //   const customer = raw?.customer ?? raw?.user ?? {};
// //   const firstName = customer?.first_name ?? customer?.firstName ?? '';
// //   const lastName  = customer?.last_name  ?? customer?.lastName  ?? '';
// //   const customerName =
// //     `${firstName} ${lastName}`.trim() ||
// //     customer?.name || customer?.full_name ||
// //     raw?.customer_name || 'Unknown Customer';
// //   const customerPhone =
// //     customer?.phone_no ?? customer?.phone ?? customer?.phone_number ?? raw?.customer_phone ?? '—';
// //   const customerEmail = customer?.email ?? raw?.customer_email ?? undefined;

// //   const rawDeliveryMethod = raw?.delivery_method ?? raw?.deliveryMethod;
// //   const deliveryMethodRaw = typeof rawDeliveryMethod === 'string'
// //     ? rawDeliveryMethod.trim().toUpperCase()
// //     : '';
// //   const isPickupOrder = deliveryMethodRaw === 'PICKUP';

// //   const address = raw?.delivery_address ?? raw?.address ?? {};
// //   const addressJson = raw?.delivery_address_json ?? {};
// //   const addressParts = [
// //     address?.street ?? address?.line1,
// //     address?.city,
// //     address?.state,
// //     address?.pincode ?? address?.zip_code ?? address?.postal_code,
// //     address?.country,
// //   ].filter(Boolean);
// //   const rawDeliveryAddress = raw?.delivery_address;
// //   const deliveryAddress =
// //     isPickupOrder
// //       ? (typeof rawDeliveryAddress === 'string' && rawDeliveryAddress.trim() !== ''
// //           ? rawDeliveryAddress
// //           : 'Pickup order')
// //       : typeof rawDeliveryAddress === 'string'
// //       ? rawDeliveryAddress
// //       : addressParts.length
// //       ? addressParts.join(', ')
// //       : (addressJson?.address_line1
// //           ? [addressJson.address_line1, addressJson.address_line2, addressJson.city, addressJson.state]
// //               .filter(Boolean).join(', ')
// //           : '—');

// //   // address_line2 (as built on the create-order form) packs "houseNo, street"
// //   // together — split it apart as a fallback when explicit fields aren't sent.
// //   const line2Raw = String(addressJson?.address_line2 ?? address?.address_line2 ?? '');
// //   const line2Parts = line2Raw.split(',').map((s: string) => s.trim()).filter(Boolean);

// //   const detailedAddress: DetailedAddress = {
// //     areaName: address?.area?.name ?? raw?.delivery_area?.name ?? addressJson?.area_name ?? undefined,
// //     block: address?.block ?? addressJson?.block ?? addressJson?.address_line1 ?? address?.address_line1 ?? undefined,
// //     houseNo: address?.house_no ?? address?.houseNo ?? address?.apartment ?? addressJson?.house_no ?? line2Parts[0] ?? undefined,
// //     street: address?.street ?? addressJson?.street ?? line2Parts[1] ?? undefined,
// //     country: address?.country ?? addressJson?.country ?? undefined,
// //     landmark: address?.landmark ?? addressJson?.landmark ?? undefined,
// //     addressNotes: address?.delivery_notes ?? address?.deliveryNotes ?? addressJson?.delivery_notes ?? undefined,
// //     addressLine1: addressJson?.address_line1 || undefined,
// //     addressLine2: addressJson?.address_line2 || undefined,
// //     city: addressJson?.city || undefined,
// //     state: addressJson?.state || undefined,
// //     pincode: addressJson?.pincode || undefined,
// //   };

// //   const items: OrderItem[] = (raw?.items ?? raw?.order_items ?? []).map((it: any, idx: number) => {
// //     const product    = it?.product ?? {};
// //     const customJson = it?.custom_json ?? {};
// //     return {
// //       id: String(it?.id ?? `item-${idx}`),
// //       productName: product?.name ?? it?.product_name ?? it?.name ?? 'Item',
// //       productDescription: product?.description ?? undefined,
// //       quantity: Number(it?.quantity ?? 1),
// //       price: Number(it?.price ?? product?.price ?? 0),
// //       addOnPriceTotal: Number(it?.add_on_total ?? customJson?.add_on_total ?? 0),
// //       lineTotal: it?.line_total != null ? Number(it.line_total) : undefined,
// //       selectedVariant: customJson?.variant_name ?? customJson?.variant ?? it?.variant ?? undefined,
// //       selectedFlavour: customJson?.flavour_name ?? customJson?.flavour ?? it?.flavour ?? undefined,
// //       selectedAddOns:  customJson?.addons ?? customJson?.add_ons ?? it?.add_ons ?? [],
// //       imageUrl: product?.image_url ?? product?.imageUrl ?? undefined,
// //     };
// //   });

// //   let subtotal = Number(raw?.subtotal ?? raw?.sub_total ?? 0);
// //   if (!subtotal) {
// //     subtotal = items.reduce(
// //       (sum, it) => sum + (it.lineTotal ?? (it.price + it.addOnPriceTotal) * it.quantity),
// //       0
// //     );
// //   }

// //   const discount       = Number(raw?.discount ?? 0);
// //   const deliveryCharge = Number(raw?.delivery_charge ?? raw?.delivery_fee ?? 0);
// //   let   total          = Number(raw?.total ?? raw?.grand_total ?? 0);
// //   if (!total) total    = subtotal - discount + deliveryCharge;

// //   const currency      = String(raw?.currency ?? 'INR').toUpperCase();
// //   const paymentMethod = String(raw?.payment_method ?? 'N/A').toUpperCase();
// //   const timeline: TimelineEntry[] = (raw?.history ?? raw?.timeline ?? []).map(mapTimelineEntry);

// //   // ── Order origin: who created / logged the order ──
// //   const createdBy      = raw?.created_by ?? {};
// //   const createdByName  = createdBy?.name
// //     ?? `${createdBy?.first_name ?? ''} ${createdBy?.last_name ?? ''}`.trim()
// //     ?? undefined;
// //   const createdByRole  = createdBy?.role ?? undefined;
// //   const createdByPhone = createdBy?.phone_no ?? undefined;
// //   const createdByEmail = createdBy?.email ?? undefined;
// //   const orderSource    = raw?.order_source ?? undefined;
// //   const orderTypeRaw   = String(raw?.order_type ?? '').toLowerCase();
// //   const isSalesAgentOrder =
// //     createdByRole === 'SALES_AGENT' ||
// //     orderSource === 'SALES_AGENT' ||
// //     orderTypeRaw === 'sales_agent' ||
// //     orderTypeRaw === 'agent_order';

// //   // ── Custom cake order — mirrors exactly what the create-order form sends:
// //   //     product_name, image, shape, flavour, variant, price, message.
// //   const customCakeRaw = raw?.custom_cake_json ?? raw?.custom_cake ?? null;
// //   const isCustomCakeOrder = !!customCakeRaw;
// //   const customCake: CustomCakeDetails | null = customCakeRaw ? {
// //     productName: customCakeRaw?.product_name || customCakeRaw?.productName || undefined,
// //     image:       customCakeRaw?.image || undefined,
// //     shape:       customCakeRaw?.shape || undefined,
// //     flavour:     customCakeRaw?.flavour || undefined,
// //     variant:     customCakeRaw?.variant || undefined,
// //     price:       customCakeRaw?.price != null ? Number(customCakeRaw.price) : undefined,
// //     message:     customCakeRaw?.message || undefined,
// //   } : null;

// //   const deliveryDate     = raw?.delivery_date ?? raw?.pickup_date ?? undefined;
// //   const deliveryTimeSlot = raw?.delivery_time_slot ?? raw?.pickup_time_slot ?? undefined;
// //   const deliveryMethod   = deliveryMethodRaw || undefined;

// //   const greetingTo      = raw?.greeting_to ?? undefined;
// //   const greetingFrom    = raw?.greeting_from ?? undefined;
// //   const greetingMessage = raw?.greeting_message ?? undefined;

// //   return {
// //     id: String(raw?.id ?? ''),
// //     orderNumber: raw?.order_number ?? undefined,
// //     customerName,
// //     customerPhone,
// //     customerEmail,
// //     deliveryAddress,
// //     detailedAddress,
// //     items,
// //     subtotal,
// //     discount,
// //     deliveryCharge,
// //     total,
// //     currency,
// //     status,
// //     paymentMethod,
// //     paymentStatus:    raw?.payment_status ?? undefined,
// //     orderType:        raw?.order_type ?? undefined,
// //     loyaltyCoupon:    raw?.loyalty_coupon ?? undefined,
// //     rejectionReason:  raw?.rejection_reason ?? undefined,
// //     notes:            raw?.notes ?? raw?.delivery_notes ?? undefined,
// //     createdAt:        raw?.created_at ?? raw?.createdAt ?? new Date().toISOString(),
// //     timeline,

// //     createdByName,
// //     createdByRole,
// //     createdByPhone,
// //     createdByEmail,
// //     orderSource,
// //     isSalesAgentOrder,
// //     deliveryMethod,

// //     customCake,
// //     isCustomCakeOrder,

// //     deliveryDate,
// //     deliveryTimeSlot,

// //     greetingTo,
// //     greetingFrom,
// //     greetingMessage,
// //   };
// // }

// // // ─── Sub-components ───────────────────────────────────────────────────────────

// // interface ModalProps {
// //   isOpen: boolean;
// //   onClose: () => void;
// //   title: string;
// //   children: React.ReactNode;
// //   width?: string;
// // }
// // const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, width = '500px' }) => {
// //   if (!isOpen) return null;
// //   return (
// //     <div className="sao-modal-overlay" onClick={onClose}>
// //       <div className="sao-modal-content" style={{ maxWidth: width }} onClick={e => e.stopPropagation()}>
// //         <div className="sao-modal-header">
// //           <h3>{title}</h3>
// //           <button className="sao-modal-close" onClick={onClose}><X size={18} /></button>
// //         </div>
// //         <div className="sao-modal-body">{children}</div>
// //       </div>
// //     </div>
// //   );
// // };

// // const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
// //   pending:             { label: 'Pending',            className: 'status-pending'    },
// //   accepted:            { label: 'Accepted',           className: 'status-confirmed'  },
// //   assigned_to_kitchen: { label: 'Kitchen Assigned',   className: 'status-processing' },
// //   preparing:           { label: 'Preparing',          className: 'status-processing' },
// //   ready:               { label: 'Ready for Dispatch', className: 'status-ready'      },
// //   assigned_to_agent:   { label: 'Agent Assigned',     className: 'status-assigned'   },
// //   assigned_to_driver:  { label: 'Driver Assigned',    className: 'status-assigned'   },
// //   out_for_delivery:    { label: 'Out for Delivery',   className: 'status-ontheway'   },
// //   delivery_submitted:  { label: 'Proof Submitted',    className: 'status-ontheway'   },
// //   delivered:           { label: 'Delivered',          className: 'status-delivered'  },
// //   rejected:            { label: 'Rejected',           className: 'status-cancelled'  },
// //   cancelled:           { label: 'Cancelled',          className: 'status-cancelled'  },
// // };

// // const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
// //   const cfg = STATUS_CONFIG[status] ?? { label: status.replace(/_/g, ' '), className: 'status-default' };
// //   return (
// //     <span className={`sao-status-badge ${cfg.className}`}>
// //       <span className="badge-dot" />{cfg.label}
// //     </span>
// //   );
// // };

// // // Shows PICKUP vs DELIVERY as its own chip so it's visible even without the row tint
// // const DeliveryMethodBadge: React.FC<{ method?: string }> = ({ method }) => {
// //   const m = (method || '').toUpperCase();
// //   if (m === 'PICKUP') {
// //     return <span className="sao-method-badge method-pickup">Pickup</span>;
// //   }
// //   return <span className="sao-method-badge method-delivery">Delivery</span>;
// // };

// // const PaymentStatusChip: React.FC<{ status: string | undefined }> = ({ status }) => {
// //   if (!status) return null;
// //   const s = status.toUpperCase();
// //   const className = s === 'PAID' || s === 'COMPLETED'
// //     ? 'sao-payment-status-chip chip-paid'
// //     : s === 'FAILED'
// //     ? 'sao-payment-status-chip chip-failed'
// //     : 'sao-payment-status-chip chip-pending';
// //   return <span className={className}>{status}</span>;
// // };

// // interface Column<T> {
// //   header: string;
// //   accessor: keyof T | ((row: T) => React.ReactNode);
// //   align?: 'left' | 'center' | 'right';
// //   width?: string;
// // }
// // interface DataTableProps<T> {
// //   columns: Column<T>[];
// //   data: T[];
// //   emptyMessage?: string;
// //   rowClassName?: (row: T) => string;
// // }
// // function DataTable<T extends { id: string }>({
// //   columns, data, emptyMessage = 'No items found', rowClassName,
// // }: DataTableProps<T>) {
// //   return (
// //     <div className="sao-table-card">
// //       <div className="sao-table-container">
// //         <table className="sao-data-table">
// //           <thead>
// //             <tr>
// //               {columns.map((col, i) => (
// //                 <th key={i} style={{ textAlign: col.align || 'left', width: col.width || 'auto' }}>
// //                   {col.header}
// //                 </th>
// //               ))}
// //             </tr>
// //           </thead>
// //           <tbody>
// //             {data.length > 0 ? data.map(row => (
// //               <tr key={row.id} className={rowClassName ? rowClassName(row) : undefined}>
// //                 {columns.map((col, ci) => {
// //                   const cell = typeof col.accessor === 'function'
// //                     ? col.accessor(row)
// //                     : (row[col.accessor] as React.ReactNode);
// //                   return <td key={ci} style={{ textAlign: col.align || 'left' }}>{cell}</td>;
// //                 })}
// //               </tr>
// //             )) : (
// //               <tr>
// //                 <td colSpan={columns.length} className="sao-empty-table-cell">
// //                   <p>{emptyMessage}</p>
// //                 </td>
// //               </tr>
// //             )}
// //           </tbody>
// //         </table>
// //       </div>
// //     </div>
// //   );
// // }

// // // ─── Main component ───────────────────────────────────────────────────────────

// // const Salesagentorder: React.FC = () => {
// //   const [orders, setOrders] = useState<Order[]>([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState<string | null>(null);
// //   const [statusFilter, setStatusFilter] = useState<string>('all');

// //   // ── Calendar (exact day) + month-wise filters ──
// //   const [calendarDate, setCalendarDate] = useState<string>('');   // 'YYYY-MM-DD'
// //   const [monthFilter, setMonthFilter] = useState<string>('');     // 'YYYY-MM'
// //   const [showCalendarInput, setShowCalendarInput] = useState<boolean>(false);
// //   const [showMonthInput, setShowMonthInput] = useState<boolean>(false);

// //   const [fullDetailsOrderId, setFullDetailsOrderId] = useState<string | null>(null);
// //   const [receiptOrderId, setReceiptOrderId] = useState<string | null>(null);

// //   // ── Payment link / QR ──
// //   const [paymentOrderId, setPaymentOrderId] = useState<string | null>(null);
// //   const [paymentLink, setPaymentLink] = useState<string | null>(null);
// //   const [paymentLoading, setPaymentLoading] = useState(false);
// //   const [paymentError, setPaymentError] = useState<string | null>(null);
// //   const [linkCopied, setLinkCopied] = useState(false);

// //   const fetchOrders = useCallback(async () => {
// //     setLoading(true);
// //     setError(null);
// //     try {
// //       const raw = await getSalesAgentOrders();
// //       const normalized = (raw ?? []).map(normalizeOrder);
// //       setOrders(normalized);
// //     } catch (err) {
// //       console.error('Failed to fetch sales agent orders:', err);
// //       setError('Failed to load orders. Please check your connection and try again.');
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, []);

// //   useEffect(() => {
// //     fetchOrders();
// //   }, [fetchOrders]);

// //   // Lazy-load timeline when a full-details modal is opened
// //   useEffect(() => {
// //     if (!fullDetailsOrderId) return;
// //     const current = orders.find(o => o.id === fullDetailsOrderId);
// //     if (!current || current.timeline.length > 0) return;
// //     let cancelled = false;
// //     (async () => {
// //       try {
// //         const history = await getOrderHistory(Number(fullDetailsOrderId));
// //         if (!cancelled && Array.isArray(history) && history.length > 0) {
// //           setOrders(prev =>
// //             prev.map(o => o.id === fullDetailsOrderId ? { ...o, timeline: history.map(mapTimelineEntry) } : o)
// //           );
// //         }
// //       } catch { /* non-fatal */ }
// //     })();
// //     return () => { cancelled = true; };
// //   }, [fullDetailsOrderId]); // eslint-disable-line react-hooks/exhaustive-deps

// //   const filteredOrders = orders.filter(o => {
// //     // Status tab filter
// //     if (statusFilter === 'active') {
// //       if (['delivered', 'cancelled', 'rejected'].includes(o.status)) return false;
// //     } else if (statusFilter !== 'all') {
// //       if (o.status !== statusFilter) return false;
// //     }

// //     // Calendar (exact day) filter — takes priority over month filter
// //     if (calendarDate) {
// //       if (toLocalDateKey(o.createdAt) !== calendarDate) return false;
// //     } else if (monthFilter) {
// //       // Month-wise filter
// //       if (toLocalMonthKey(o.createdAt) !== monthFilter) return false;
// //     }

// //     return true;
// //   });

// //   const fullDetailsOrder = orders.find(o => o.id === fullDetailsOrderId);
// //   const receiptOrder = orders.find(o => o.id === receiptOrderId);
// //   const paymentOrder = orders.find(o => o.id === paymentOrderId);

// //   const getStatusCount = (s: string) => {
// //     if (s === 'all')    return orders.length;
// //     if (s === 'active') return orders.filter(o => !['delivered', 'cancelled', 'rejected'].includes(o.status)).length;
// //     return orders.filter(o => o.status === s).length;
// //   };

// //   // Row tint helper — blue for pickup, green for delivery
// //   const getRowClassName = (row: Order) => {
// //     const method = (row.deliveryMethod || '').toUpperCase();
// //     return method === 'PICKUP' ? 'sao-row-pickup' : 'sao-row-delivery';
// //   };

// //   // ── Calendar / month filter handlers ──
// //   const handleToggleCalendarInput = () => {
// //     setShowMonthInput(false);
// //     setShowCalendarInput(v => !v);
// //   };
// //   const handleToggleMonthInput = () => {
// //     setShowCalendarInput(false);
// //     setShowMonthInput(v => !v);
// //   };
// //   const handleCalendarDateChange = (value: string) => {
// //     setCalendarDate(value);
// //     setMonthFilter('');
// //   };
// //   const handleMonthFilterChange = (value: string) => {
// //     setMonthFilter(value);
// //     setCalendarDate('');
// //   };
// //   const clearCalendarDate = () => {
// //     setCalendarDate('');
// //     setShowCalendarInput(false);
// //   };
// //   const clearMonthFilter = () => {
// //     setMonthFilter('');
// //     setShowMonthInput(false);
// //   };

// //   // ── Payment link / QR handlers ──
// //   const handleOpenPayment = async (orderId: string) => {
// //     setPaymentOrderId(orderId);
// //     setPaymentLink(null);
// //     setPaymentError(null);
// //     setLinkCopied(false);
// //     setPaymentLoading(true);
// //     try {
// //       const result = await createPaymentLink(Number(orderId));
// //       if (result?.success === false) {
// //         setPaymentError(result?.error || 'Unable to generate payment link.');
// //       } else if (result?.payment_url) {
// //         setPaymentLink(result.payment_url);
// //       } else {
// //         setPaymentError('Payment link was not returned by the server.');
// //       }
// //     } catch (err: any) {
// //       console.error('Failed to create payment link:', err);
// //       setPaymentError(
// //         err?.response?.data?.error || 'Failed to generate payment link. Please try again.'
// //       );
// //     } finally {
// //       setPaymentLoading(false);
// //     }
// //   };

// //   const handleCopyLink = async () => {
// //     if (!paymentLink) return;
// //     try {
// //       await navigator.clipboard.writeText(paymentLink);
// //       setLinkCopied(true);
// //       setTimeout(() => setLinkCopied(false), 2000);
// //     } catch {
// //       /* clipboard unavailable, ignore */
// //     }
// //   };

// //   const closePaymentModal = () => {
// //     setPaymentOrderId(null);
// //     setPaymentLink(null);
// //     setPaymentError(null);
// //     setPaymentLoading(false);
// //   };

// //   const FILTER_TABS = [
// //     { key: 'all',                label: 'All'               },
// //     { key: 'active',             label: 'Active'            },
// //     { key: 'pending',            label: 'Pending'           },
// //     { key: 'accepted',           label: 'Accepted'          },
// //     { key: 'assigned_to_kitchen',label: 'Kitchen Assigned'  },
// //     { key: 'preparing',          label: 'Preparing'         },
// //     { key: 'ready',              label: 'Ready'             },
// //     { key: 'assigned_to_agent',  label: 'Agent Assigned'    },
// //     { key: 'assigned_to_driver', label: 'Driver Assigned'   },
// //     { key: 'out_for_delivery',   label: 'Out for Delivery'  },
// //     { key: 'delivery_submitted', label: 'Proof Submitted'   },
// //     { key: 'delivered',          label: 'Delivered'         },
// //     { key: 'cancelled',          label: 'Cancelled'         },
// //   ];

// //   return (
// //     <div className="sao-page-container">

// //       {/* Header */}
// //       <header className="sao-header">
// //         <p className="sao-eyebrow">Sales Agent Orders</p>
// //         <h1 className="sao-title">Orders Logged by Sales Agents</h1>
// //       </header>

// //       {/* Error banner */}
// //       {error && (
// //         <div className="sao-error-banner">
// //           <AlertCircle size={16} />
// //           <span>{error}</span>
// //           <button className="sao-error-retry-btn" onClick={() => setError(null)}>Dismiss</button>
// //           <button className="sao-error-retry-btn" onClick={fetchOrders}>Retry</button>
// //         </div>
// //       )}

// //       {/* Filter row — status tabs
// //       <div className="sao-filters-row">
// //         {FILTER_TABS.map(({ key, label }) => (
// //           <button
// //             key={key}
// //             className={`sao-filter-tag ${statusFilter === key ? 'active' : ''}`}
// //             onClick={() => setStatusFilter(key)}
// //           >
// //             {label} ({getStatusCount(key)})
// //           </button>
// //         ))}
  
// //       </div> */}

// //       {/* Calendar filter + month-wise filter row */}
// //       <div className="sao-date-filters-row">
// //         {/* Calendar (exact day) filter */}
// //         <div className="sao-date-filter-group">
// //           <button
// //             type="button"
// //             className={`sao-icon-btn sao-date-filter-toggle ${calendarDate ? 'active' : ''}`}
// //             title="Filter by date"
// //             onClick={handleToggleCalendarInput}
// //           >
// //             <Calendar size={16} />
// //             <span>{calendarDate ? formatDate(calendarDate) : 'Filter by Date'}</span>
// //           </button>
// //           {showCalendarInput && (
// //             <input
// //               type="date"
// //               autoFocus
// //               className="sao-date-input"
// //               value={calendarDate}
// //               onChange={(e) => handleCalendarDateChange(e.target.value)}
// //             />
// //           )}
// //           {calendarDate && (
// //             <button type="button" className="sao-filter-clear-btn" onClick={clearCalendarDate} title="Clear date filter">
// //               <X size={12} />
// //             </button>
// //           )}
// //         </div>

// //         {/* Month-wise filter */}
// //         <div className="sao-month-filter-group">
// //           <button
// //             type="button"
// //             className={`sao-icon-btn sao-month-filter-toggle ${monthFilter ? 'active' : ''}`}
// //             title="Filter by month"
// //             onClick={handleToggleMonthInput}
// //           >
// //             <CalendarClock size={16} />
// //             <span>{monthFilter ? formatMonthLabel(monthFilter) : 'Current Month'}</span>
// //           </button>
// //           {showMonthInput && (
// //             <input
// //               type="month"
// //               autoFocus
// //               className="sao-month-input"
// //               value={monthFilter}
// //               onChange={(e) => handleMonthFilterChange(e.target.value)}
// //             />
// //           )}
// //           {monthFilter && (
// //             <button type="button" className="sao-filter-clear-btn" onClick={clearMonthFilter} title="Clear month filter">
// //               <X size={12} />
// //             </button>
// //           )}
// //         </div>
// //       </div>

// //       {/* Legend so the row-tint meaning is obvious */}
// //       <div className="sao-legend-row">
// //         <span className="sao-legend-item">
// //           <span className="sao-legend-swatch swatch-pickup" /> Pickup order
// //         </span>
// //         <span className="sao-legend-item">
// //           <span className="sao-legend-swatch swatch-delivery" /> Delivery order
// //         </span>
// //       </div>

// //       {/* Table */}
// //       {loading && orders.length === 0 ? (
// //         <div className="sao-loading-state">
// //           <Loader2 size={22} className="sao-spin" />
// //           <p>Loading sales agent orders…</p>
// //         </div>
// //       ) : orders.length === 0 ? (
// //         <div className="sao-empty-state">
// //           <UserCheck size={32} />
// //           <p>No sales agent orders found yet.</p>
// //         </div>
// //       ) : (
// //         <div className="sao-grid">
// //           <DataTable
// //             rowClassName={getRowClassName}
// //             columns={[
// //               {
// //                 header: 'Order #',
// //                 accessor: (row: Order) => (
// //                   <div className="sao-order-id-cell">
// //                     <strong className="sao-order-id">{row.orderNumber ?? row.id}</strong>
// //                     <span className="sao-agent-tag">
// //                       <UserCheck size={10} /> {row.createdByName || 'Sales Agent'}
// //                     </span>
// //                   </div>
// //                 ),
// //               },
// //               {
// //                 header: 'Time',
// //                 accessor: (row: Order) =>
// //                   new Date(row.createdAt).toLocaleString([], {
// //                     month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
// //                   }),
// //               },
// //               {
// //                 header: 'Customer',
// //                 accessor: (row: Order) => (
// //                   <div className="sao-cust-cell">
// //                     <span className="sao-cust-name">{row.customerName}</span>
// //                     <span className="sao-cust-sub">{row.customerPhone}</span>
// //                   </div>
// //                 ),
// //               },
// //               {
// //                 header: 'Fulfilment',
// //                 accessor: (row: Order) => <DeliveryMethodBadge method={row.deliveryMethod} />,
// //               },
// //               {
// //                 header: 'Items',
// //                 accessor: (row: Order) =>
// //                   `${row.items.reduce((acc, i) => acc + i.quantity, 0)} item(s)`,
// //               },
// //               {
// //                 header: 'Total',
// //                 accessor: (row: Order) => <strong>{formatMoney(row.total, row.currency)}</strong>,
// //               },
// //               {
// //                 header: 'Payment',
// //                 accessor: (row: Order) => (
// //                   <div className="sao-cust-cell">
// //                     <span className="sao-cust-name">{row.paymentMethod}</span>
// //                     {row.paymentStatus && <PaymentStatusChip status={row.paymentStatus} />}
// //                   </div>
// //                 ),
// //               },
// //               {
// //                 header: 'Status',
// //                 accessor: (row: Order) => <StatusBadge status={row.status} />,
// //               },
// //               {
// //                 header: 'Actions',
// //                 accessor: (row: Order) => (
// //                   <div className="sao-actions-cell">
// //                     <button
// //                       className="sao-icon-btn"
// //                       title="View full order details"
// //                       onClick={() => setFullDetailsOrderId(row.id)}
// //                     >
// //                       <Eye size={17} />
// //                     </button>
// //                     <button
// //                       className="sao-icon-btn"
// //                       title="Print receipt"
// //                       onClick={() => setReceiptOrderId(row.id)}
// //                     >
// //                       <Printer size={17} />
// //                     </button>
// //                     {/* Payment link/QR is always available, even when the order is already paid,
// //                         so the agent can still resend or re-view the link. */}
// //                     <button
// //                       className="sao-icon-btn"
// //                       title={
// //                         row.paymentStatus?.toUpperCase() === 'PAID'
// //                           ? 'View payment link (already paid)'
// //                           : 'Generate payment link & QR'
// //                       }
// //                       onClick={() => handleOpenPayment(row.id)}
// //                     >
// //                       <CreditCard size={17} />
// //                     </button>
// //                   </div>
// //                 ),
// //                 align: 'right',
// //               },
// //             ]}
// //             data={filteredOrders}
// //             emptyMessage="No sales agent orders match this filter."
// //           />
// //         </div>
// //       )}

// //       {/* ══════ FULL DETAILS MODAL (read-only, no actions) ══════ */}
// //       <Modal
// //         isOpen={!!fullDetailsOrder}
// //         onClose={() => setFullDetailsOrderId(null)}
// //         title={`Order Details — ${fullDetailsOrder?.orderNumber ?? fullDetailsOrder?.id ?? ''}`}
// //         width="640px"
// //       >
// //         {fullDetailsOrder && (
// //           <div className="sao-fd-body">

// //             <div className="sao-fd-top-row">
// //               <StatusBadge status={fullDetailsOrder.status} />
// //               {fullDetailsOrder.paymentStatus && <PaymentStatusChip status={fullDetailsOrder.paymentStatus} />}
// //               <DeliveryMethodBadge method={fullDetailsOrder.deliveryMethod} />
// //               <span className="sao-origin-badge">
// //                 <UserCheck size={11} /> Sales Agent Order
// //               </span>
// //               {fullDetailsOrder.isCustomCakeOrder && (
// //                 <span className="sao-origin-badge badge-custom">
// //                   <Cake size={11} /> Custom Order
// //                 </span>
// //               )}
// //             </div>

// //             <div className="sao-fd-section sao-fd-highlight">
// //               <h4><UserCheck size={14} /> Order Origin</h4>
// //               <div className="sao-fd-grid">
// //                 <div><span className="lbl">Placed by</span><span>{fullDetailsOrder.createdByName ?? '—'}</span></div>
// //                 <div><span className="lbl">Role</span><span>{fullDetailsOrder.createdByRole ?? '—'}</span></div>
// //                 <div><span className="lbl">Phone</span><span>{fullDetailsOrder.createdByPhone ?? '—'}</span></div>
// //                 <div><span className="lbl">Email</span><span>{fullDetailsOrder.createdByEmail ?? '—'}</span></div>
// //               </div>
// //             </div>

// //             {/* Expected date & time — shown for BOTH pickup and delivery orders */}
// //             <div className="sao-fd-section sao-fd-highlight">
// //               <h4><CalendarClock size={14} /> {fullDetailsOrder.deliveryMethod === 'PICKUP' ? 'Pickup Schedule' : 'Delivery Schedule'}</h4>
// //               <div className="sao-fd-grid">
// //                 <div>
// //                   <span className="lbl">{fullDetailsOrder.deliveryMethod === 'PICKUP' ? 'Pickup Date' : 'Delivery Date'}</span>
// //                   <span>{formatDate(fullDetailsOrder.deliveryDate)}</span>
// //                 </div>
// //                 <div>
// //                   <span className="lbl">{fullDetailsOrder.deliveryMethod === 'PICKUP' ? 'Pickup Time' : 'Delivery Time'}</span>
// //                   <span>{fullDetailsOrder.deliveryTimeSlot ?? '—'}</span>
// //                 </div>
// //               </div>
// //             </div>

// //             <div className="sao-fd-section">
// //               <h4>Customer</h4>
// //               <div className="sao-fd-grid">
// //                 <div><span className="lbl">Name</span><span>{fullDetailsOrder.customerName}</span></div>
// //                 <div><span className="lbl">Phone</span><span>{fullDetailsOrder.customerPhone}</span></div>
// //                 <div><span className="lbl">Email</span><span>{fullDetailsOrder.customerEmail ?? '—'}</span></div>
// //               </div>
// //             </div>

// //             {/* Full address block — every field captured on the create-order form */}
// //             {fullDetailsOrder.deliveryMethod !== 'PICKUP' && (
// //               <div className="sao-fd-section sao-fd-highlight">
// //                 <h4>Address</h4>
// //                 <div className="sao-fd-grid">
// //                   <div><span className="lbl">Area</span><span>{fullDetailsOrder.detailedAddress?.areaName ?? '—'}</span></div>
// //                   <div><span className="lbl">Block</span><span>{fullDetailsOrder.detailedAddress?.block ?? '—'}</span></div>
// //                   <div><span className="lbl">House / Flat No</span><span>{fullDetailsOrder.detailedAddress?.houseNo ?? '—'}</span></div>
// //                   <div><span className="lbl">Street</span><span>{fullDetailsOrder.detailedAddress?.street ?? '—'}</span></div>
// //                   <div><span className="lbl">Country</span><span>{fullDetailsOrder.detailedAddress?.country ?? '—'}</span></div>
// //                   <div><span className="lbl">Landmark</span><span>{fullDetailsOrder.detailedAddress?.landmark ?? '—'}</span></div>
// //                 </div>
// //                 <p><strong>Delivery Notes:</strong> {fullDetailsOrder.detailedAddress?.addressNotes ?? '—'}</p>
// //               </div>
// //             )}

// //             <div className="sao-fd-section">
// //               <h4>Ordered Products</h4>
// //               {fullDetailsOrder.items.length > 0 ? (
// //                 <div className="sao-fd-items-list">
// //                   {fullDetailsOrder.items.map(item => (
// //                     <div key={item.id} className="sao-fd-item-row">
// //                       {item.imageUrl && <img src={item.imageUrl} alt={item.productName} className="sao-fd-item-thumb" />}
// //                       <div className="sao-fd-item-info">
// //                         <strong>{item.productName}</strong>
// //                         <div className="sao-fd-item-meta">
// //                           <span>Qty: {item.quantity}</span>
// //                           <span>Unit: {formatMoney(item.price, fullDetailsOrder.currency)}</span>
// //                           {item.selectedVariant && <span>Variant: {item.selectedVariant}</span>}
// //                           {item.selectedFlavour && <span>Flavour: {item.selectedFlavour}</span>}
// //                           {item.selectedAddOns.length > 0 && <span>Add-ons: {item.selectedAddOns.join(', ')}</span>}
// //                         </div>
// //                       </div>
// //                       <span className="sao-fd-item-total">
// //                         {formatMoney(item.lineTotal ?? (item.price + item.addOnPriceTotal) * item.quantity, fullDetailsOrder.currency)}
// //                       </span>
// //                     </div>
// //                   ))}
// //                 </div>
// //               ) : (
// //                 <p className="sao-muted">No standard catalog items (custom cake order below).</p>
// //               )}
// //             </div>

// //             {/* Custom cake block — ONLY the fields captured on the create-order
// //                 form: product name, image, shape, flavour, variant, price, message. */}
// //             {fullDetailsOrder.isCustomCakeOrder && fullDetailsOrder.customCake && (
// //               <div className="sao-fd-section sao-fd-highlight-cake">
// //                 <h4><Cake size={14} /> Custom Cake Details</h4>
// //                 <div className="sao-fd-cake-body">
// //                   {fullDetailsOrder.customCake.image && (
// //                     <img src={fullDetailsOrder.customCake.image} alt="Custom cake reference" className="sao-fd-cake-image" />
// //                   )}
// //                   <div className="sao-fd-grid">
// //                     <div><span className="lbl">Product Name</span><span>{fullDetailsOrder.customCake.productName ?? '—'}</span></div>
// //                     <div><span className="lbl">Shape</span><span>{fullDetailsOrder.customCake.shape ?? '—'}</span></div>
// //                     <div><span className="lbl">Flavour</span><span>{fullDetailsOrder.customCake.flavour ?? '—'}</span></div>
// //                     <div><span className="lbl">Variant</span><span>{fullDetailsOrder.customCake.variant ?? '—'}</span></div>
// //                     <div><span className="lbl">Custom Price</span><span>{fullDetailsOrder.customCake.price != null ? formatMoney(fullDetailsOrder.customCake.price, fullDetailsOrder.currency) : '—'}</span></div>
// //                   </div>
// //                   {fullDetailsOrder.customCake.message && (
// //                     <p className="sao-fd-cake-message"><strong>Message:</strong> "{fullDetailsOrder.customCake.message}"</p>
// //                   )}
// //                 </div>
// //               </div>
// //             )}

// //             {(fullDetailsOrder.greetingMessage || fullDetailsOrder.greetingTo) && (
// //               <div className="sao-fd-section sao-fd-highlight-greeting">
// //                 <h4><Gift size={14} /> Greeting Card</h4>
// //                 <div className="sao-fd-grid">
// //                   <div><span className="lbl">To</span><span>{fullDetailsOrder.greetingTo ?? '—'}</span></div>
// //                   <div><span className="lbl">From</span><span>{fullDetailsOrder.greetingFrom ?? '—'}</span></div>
// //                 </div>
// //                 {fullDetailsOrder.greetingMessage && (
// //                   <p className="sao-fd-greeting-message">
// //                     <Sparkles size={13} /> "{fullDetailsOrder.greetingMessage}"
// //                   </p>
// //                 )}
// //               </div>
// //             )}

// //             <div className="sao-fd-section">
// //               <h4>Payment &amp; Pricing</h4>
// //               <div className="sao-fd-grid">
// //                 <div><span className="lbl">Method</span><span>{fullDetailsOrder.paymentMethod}</span></div>
// //                 <div><span className="lbl">Status</span><span>{fullDetailsOrder.paymentStatus ?? '—'}</span></div>
// //                 <div><span className="lbl">Currency</span><span>{fullDetailsOrder.currency}</span></div>
// //               </div>
// //               <div className="sao-cost-breakdown">
// //                 <div className="sao-cost-row"><span>Subtotal:</span><span>{formatMoney(fullDetailsOrder.subtotal, fullDetailsOrder.currency)}</span></div>
// //                 {fullDetailsOrder.discount > 0 && (
// //                   <div className="sao-cost-row discount">
// //                     <span>Discount:</span>
// //                     <span>-{formatMoney(fullDetailsOrder.discount, fullDetailsOrder.currency)}</span>
// //                   </div>
// //                 )}
// //                 <div className="sao-cost-row"><span>Delivery:</span><span>{formatMoney(fullDetailsOrder.deliveryCharge, fullDetailsOrder.currency)}</span></div>
// //                 <div className="sao-cost-row total"><span>Grand Total:</span><span>{formatMoney(fullDetailsOrder.total, fullDetailsOrder.currency)}</span></div>
// //               </div>
// //             </div>

// //             <div className="sao-fd-actions-row">
// //               <button
// //                 className="sao-btn sao-btn-secondary"
// //                 onClick={() => { setReceiptOrderId(fullDetailsOrder.id); setFullDetailsOrderId(null); }}
// //               >
// //                 <Printer size={13} /> Print Receipt
// //               </button>
// //               {/* Payment button no longer disabled once paid — agent can still open/resend the link */}
// //               <button
// //                 className="sao-btn sao-btn-primary"
// //                 onClick={() => { handleOpenPayment(fullDetailsOrder.id); setFullDetailsOrderId(null); }}
// //               >
// //                 <CreditCard size={13} /> Payment
// //               </button>
// //             </div>

// //           </div>
// //         )}
// //       </Modal>

// //       {/* ══════ RECEIPT MODAL ══════ */}
// //       <Modal
// //         isOpen={!!receiptOrder}
// //         onClose={() => setReceiptOrderId(null)}
// //         title="Print Receipt"
// //         width="380px"
// //       >
// //         {receiptOrder && (
// //           <div className="sao-receipt-sheet">
// //             {/* CakeNTake logo — swap the src for your hosted logo path/import if needed */}
// //             <div className="sao-receipt-logo-wrap">
// //               <img src="/logo.png" alt="CakeNTake" className="sao-receipt-logo" />
// //             </div>
// //             <div className="sao-receipt-title">
// //               <h2>ORDER RECEIPT</h2>
// //               <p className="sao-divider">- - - - - - - - - - - - - - - - - - -</p>
// //             </div>
// //             <div className="sao-receipt-basics">
// //               <p><strong>Order No:</strong> {receiptOrder.orderNumber ?? receiptOrder.id}</p>
// //               <p><strong>Date:</strong> {new Date(receiptOrder.createdAt).toLocaleDateString()}</p>
// //               <p><strong>Time:</strong> {new Date(receiptOrder.createdAt).toLocaleTimeString()}</p>
// //               <p><strong>Fulfilment:</strong> {(receiptOrder.deliveryMethod || 'DELIVERY').toUpperCase() === 'PICKUP' ? 'Pickup' : 'Delivery'}</p>
// //               <p><strong>Customer:</strong> {receiptOrder.customerName}</p>
// //               <p><strong>Phone:</strong> {receiptOrder.customerPhone}</p>
// //               <p><strong>Payment:</strong> {receiptOrder.paymentMethod}</p>
// //               {receiptOrder.paymentStatus && (
// //                 <p><strong>Payment Status:</strong> {receiptOrder.paymentStatus}</p>
// //               )}
// //               <p className="sao-divider">- - - - - - - - - - - - - - - - - - -</p>
// //             </div>
// //             <div className="sao-receipt-items">
// //               {receiptOrder.items.map(item => (
// //                 <div key={item.id} className="sao-receipt-tr">
// //                   <span className="sao-qty-name">{item.quantity} × {item.productName.slice(0, 22)}
// //                     {item.selectedFlavour ? ` (${item.selectedFlavour})` : ''}
// //                   </span>
// //                   <span className="sao-sum-p">
// //                     {formatMoney(
// //                       item.lineTotal ?? (item.price + item.addOnPriceTotal) * item.quantity,
// //                       receiptOrder.currency
// //                     )}
// //                   </span>
// //                 </div>
// //               ))}
// //               <p className="sao-divider">- - - - - - - - - - - - - - - - - - -</p>
// //             </div>
// //             <div className="sao-receipt-financials">
// //               <div className="sao-calc-row"><span>Subtotal:</span><span>{formatMoney(receiptOrder.subtotal, receiptOrder.currency)}</span></div>
// //               {receiptOrder.discount > 0 && (
// //                 <div className="sao-calc-row">
// //                   <span>Discount:</span>
// //                   <span>-{formatMoney(receiptOrder.discount, receiptOrder.currency)}</span>
// //                 </div>
// //               )}
// //               <div className="sao-calc-row"><span>Delivery:</span><span>{formatMoney(receiptOrder.deliveryCharge, receiptOrder.currency)}</span></div>
// //               <p className="sao-divider">- - - - - - - - - - - - - - - - - - -</p>
// //               <div className="sao-calc-row sao-grand-total"><span>GRAND TOTAL:</span><span>{formatMoney(receiptOrder.total, receiptOrder.currency)}</span></div>
// //               <p className="sao-divider">- - - - - - - - - - - - - - - - - - -</p>
// //             </div>
// //             <div className="sao-receipt-footer"><p>Thank you for your order!</p></div>
// //             <div className="sao-receipt-controls sao-no-print">
// //               <button className="sao-btn sao-btn-secondary sao-btn-sm" onClick={() => window.print()}>
// //                 <Printer size={13} /><span>Print</span>
// //               </button>
// //               <button className="sao-btn sao-btn-primary sao-btn-sm" onClick={() => setReceiptOrderId(null)}>
// //                 Close
// //               </button>
// //             </div>
// //           </div>
// //         )}
// //       </Modal>

// //       {/* ══════ PAYMENT LINK / QR MODAL ══════ */}
// //       <Modal
// //         isOpen={!!paymentOrderId}
// //         onClose={closePaymentModal}
// //         title={`Payment — ${paymentOrder?.orderNumber ?? paymentOrder?.id ?? ''}`}
// //         width="400px"
// //       >
// //         {paymentOrderId && (
// //           <div className="sao-payment-body">
// //             {paymentOrder && (
// //               <div className="sao-payment-summary">
// //                 <p><strong>Customer:</strong> {paymentOrder.customerName}</p>
// //                 <p><strong>Amount:</strong> {formatMoney(paymentOrder.total, paymentOrder.currency)}</p>
// //                 {paymentOrder.paymentStatus?.toUpperCase() === 'PAID' && (
// //                   <p className="sao-payment-paid-note">
// //                     <Check size={13} /> This order is already marked as paid — link shown for reference.
// //                   </p>
// //                 )}
// //               </div>
// //             )}

// //             {paymentLoading && (
// //               <div className="sao-payment-loading">
// //                 <Loader2 size={22} className="sao-spin" />
// //                 <p>Generating payment link…</p>
// //               </div>
// //             )}

// //             {!paymentLoading && paymentError && (
// //               <div className="sao-error-banner">
// //                 <AlertCircle size={16} />
// //                 <span>{paymentError}</span>
// //                 <button
// //                   className="sao-error-retry-btn"
// //                   onClick={() => paymentOrderId && handleOpenPayment(paymentOrderId)}
// //                 >
// //                   Retry
// //                 </button>
// //               </div>
// //             )}

// //             {!paymentLoading && paymentLink && (
// //               <div className="sao-payment-content">
// //                 <div className="sao-payment-qr">
// //                   <QRCodeSVG value={paymentLink} size={200} />
// //                 </div>

// //                 <div className="sao-payment-link-row">
// //                   <input
// //                     type="text"
// //                     className="sao-payment-link-input"
// //                     value={paymentLink}
// //                     readOnly
// //                     onFocus={e => e.target.select()}
// //                   />
// //                   <button className="sao-icon-btn" title="Copy link" onClick={handleCopyLink}>
// //                     {linkCopied ? <Check size={16} /> : <Copy size={16} />}
// //                   </button>
// //                 </div>

// //                 <div className="sao-payment-actions">
// //                   <a
// //                     href={paymentLink}
// //                     target="_blank"
// //                     rel="noopener noreferrer"
// //                     className="sao-btn sao-btn-primary sao-btn-sm"
// //                   >
// //                     <ExternalLink size={13} /> Open Payment Page
// //                   </a>
// //                   <button className="sao-btn sao-btn-secondary sao-btn-sm" onClick={handleCopyLink}>
// //                     {linkCopied ? <Check size={13} /> : <Copy size={13} />}
// //                     <span>{linkCopied ? 'Copied' : 'Copy Link'}</span>
// //                   </button>
// //                 </div>
// //               </div>
// //             )}
// //           </div>
// //         )}
// //       </Modal>

// //     </div>
// //   );
// // };

// // export default Salesagentorder;



// import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
// import {
//   Printer, X, Loader2, AlertCircle, Eye,
//   UserCheck, Cake, Gift, CalendarClock, Sparkles,
//   CreditCard, Copy, Check, ExternalLink, Calendar,
//   ChevronLeft, ChevronRight, TrendingUp, Package,
//   XCircle, ListChecks, LayoutGrid,
// } from 'lucide-react';
// import { QRCodeSVG } from 'qrcode.react';
// import './Salesagentorder.css';
// import {
//   getCustomerStatusLabel,
//   getCustomerStageIndex,
// } from '../../services/orderStatus';

// import { getOrderHistory, getSalesAgentOrders } from '../../services/orderService';
// import { createPaymentLink } from '../../services/paymentService';

// // ─── Types ────────────────────────────────────────────────────────────────────

// interface OrderItem {
//   id: string;
//   productName: string;
//   productDescription?: string;
//   quantity: number;
//   price: number;
//   addOnPriceTotal: number;
//   lineTotal?: number;
//   selectedVariant?: string;
//   selectedFlavour?: string;
//   selectedAddOns: string[];
//   imageUrl?: string;
// }

// interface TimelineEntry {
//   status: string;
//   timestamp: string;
//   note?: string;
//   changedBy?: string;
// }

// /**
//  * Trimmed to exactly the fields captured on the Sales Agent "Create Order"
//  * form's custom-cake section: product name, reference image, shape,
//  * flavour, variant, custom price, message. Nothing else is shown.
//  */
// interface CustomCakeDetails {
//   productName?: string;
//   image?: string;
//   shape?: string;
//   flavour?: string;
//   variant?: string;
//   price?: number;
//   message?: string;
// }

// /**
//  * Full address captured on the Sales Agent "Create Order" form:
//  * Area, Block, House/Flat No, Street, Country, Landmark, Delivery Notes.
//  */
// interface DetailedAddress {
//   areaName?: string;
//   block?: string;
//   houseNo?: string;
//   street?: string;
//   country?: string;
//   landmark?: string;
//   addressNotes?: string;
//   // Legacy / alternate shape some backends return — kept as fallback only,
//   // not shown as separate fields in the UI.
//   addressLine1?: string;
//   addressLine2?: string;
//   city?: string;
//   state?: string;
//   pincode?: string;
// }

// type OrderStatus =
//   | 'pending'
//   | 'accepted'
//   | 'assigned_to_kitchen'
//   | 'preparing'
//   | 'ready'
//   | 'assigned_to_agent'
//   | 'assigned_to_driver'
//   | 'out_for_delivery'
//   | 'delivery_submitted'
//   | 'delivered'
//   | 'cancelled'
//   | 'rejected';

// interface Order {
//   id: string;
//   orderNumber?: string;
//   customerName: string;
//   customerPhone: string;
//   customerEmail?: string;
//   deliveryAddress: string;
//   detailedAddress?: DetailedAddress;
//   items: OrderItem[];
//   subtotal: number;
//   discount: number;
//   deliveryCharge: number;
//   total: number;
//   rawStatus: string;
//   currency: string;
//   status: OrderStatus;
//   paymentMethod: string;
//   paymentStatus?: string;
//   orderType?: string;
//   loyaltyCoupon?: string;
//   rejectionReason?: string;
//   notes?: string;
//   createdAt: string;
//   timeline: TimelineEntry[];

//   createdByName?: string;
//   createdByRole?: string;
//   createdByPhone?: string;
//   createdByEmail?: string;
//   orderSource?: string;
//   isSalesAgentOrder: boolean;

//   customCake?: CustomCakeDetails | null;
//   isCustomCakeOrder: boolean;

//   deliveryMethod?: string;
//   deliveryDate?: string;
//   deliveryTimeSlot?: string;

//   greetingTo?: string;
//   greetingFrom?: string;
//   greetingMessage?: string;
// }

// // ─── Status mapping ───────────────────────────────────────────────────────────

// const STATUS_API_TO_LOCAL: Record<string, OrderStatus> = {
//   PENDING:             'pending',
//   ACCEPTED:            'accepted',
//   ORDER_ACCEPTED:      'accepted',
//   CONFIRMED:           'accepted',
//   ASSIGNED_TO_KITCHEN: 'assigned_to_kitchen',
//   PREPARING:           'preparing',
//   PROCESSING:          'preparing',
//   READY:               'ready',
//   READY_FOR_PICKUP:    'ready',
//   READY_FOR_DISPATCH:  'ready',
//   ASSIGNED_TO_AGENT:   'assigned_to_agent',
//   ASSIGNED_TO_DRIVER:  'assigned_to_driver',
//   DRIVER_ASSIGNED:     'assigned_to_driver',
//   DRIVER_ACCEPTED:     'out_for_delivery',
//   OUT_FOR_DELIVERY:    'out_for_delivery',
//   ON_THE_WAY:          'out_for_delivery',
//   DELIVERY_SUBMITTED:  'delivery_submitted',
//   DELIVERED:           'delivered',
//   COMPLETED:           'delivered',
//   DELIVERY_COMPLETED_PENDING_APPROVAL: 'delivery_submitted',
//   REJECTED:   'rejected',
//   CANCELLED:  'cancelled',
//   CANCELED:   'cancelled',
// };

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// function formatMoney(amount: number, currency?: string): string {
//   const cur = (currency || 'INR').toUpperCase();
//   try {
//     return new Intl.NumberFormat(undefined, { style: 'currency', currency: cur }).format(amount || 0);
//   } catch {
//     return `₹${(amount || 0).toFixed(2)}`;
//   }
// }

// function formatDate(value?: string): string {
//   if (!value) return '—';
//   const d = new Date(value);
//   if (isNaN(d.getTime())) return String(value);
//   return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
// }

// /** "2026-08" → "August 2026", used by the month filter label. */
// function formatMonthLabel(value: string): string {
//   if (!value) return 'Current Month';
//   const [y, m] = value.split('-').map(Number);
//   if (!y || !m) return 'Current Month';
//   const d = new Date(y, m - 1, 1);
//   return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
// }

// /** Local (not UTC) YYYY-MM-DD for an order's createdAt, used by the calendar filter. */
// function toLocalDateKey(value: string): string {
//   const d = new Date(value);
//   if (isNaN(d.getTime())) return '';
//   const y = d.getFullYear();
//   const m = String(d.getMonth() + 1).padStart(2, '0');
//   const day = String(d.getDate()).padStart(2, '0');
//   return `${y}-${m}-${day}`;
// }

// /** Local (not UTC) YYYY-MM for an order's createdAt, used by the month filter. */
// function toLocalMonthKey(value: string): string {
//   const d = new Date(value);
//   if (isNaN(d.getTime())) return '';
//   const y = d.getFullYear();
//   const m = String(d.getMonth() + 1).padStart(2, '0');
//   return `${y}-${m}`;
// }

// /** Current month as 'YYYY-MM', in local time. */
// function currentMonthKey(): string {
//   const d = new Date();
//   return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
// }

// /** Shift a 'YYYY-MM' key by `delta` months (can be negative). */
// function shiftMonthKey(key: string, delta: number): string {
//   const [y, m] = key.split('-').map(Number);
//   const d = new Date(y, (m - 1) + delta, 1);
//   return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
// }

// function mapTimelineEntry(h: any): TimelineEntry {
//   const rawStatus = String(h?.new_status ?? h?.status ?? '').toUpperCase();
//   const changedBy = h?.changed_by;
//   return {
//     status: STATUS_API_TO_LOCAL[rawStatus] ?? rawStatus.toLowerCase().replace(/_/g, ' '),
//     timestamp: h?.created_at ?? h?.createdAt ?? h?.changed_at ?? h?.timestamp ?? '',
//     note: h?.remarks ?? h?.note ?? h?.reason ?? undefined,
//     changedBy: changedBy?.name ?? (changedBy
//       ? `${changedBy.first_name ?? ''} ${changedBy.last_name ?? ''}`.trim()
//       : undefined),
//   };
// }

// function normalizeOrder(raw: any): Order {
//   const rawStatus = String(raw?.status ?? '').toUpperCase();
//   const status: OrderStatus = STATUS_API_TO_LOCAL[rawStatus] ?? 'pending';

//   const customer = raw?.customer ?? raw?.user ?? {};
//   const firstName = customer?.first_name ?? customer?.firstName ?? '';
//   const lastName  = customer?.last_name  ?? customer?.lastName  ?? '';
//   const customerName =
//     `${firstName} ${lastName}`.trim() ||
//     customer?.name || customer?.full_name ||
//     raw?.customer_name || 'Unknown Customer';
//   const customerPhone =
//     customer?.phone_no ?? customer?.phone ?? customer?.phone_number ?? raw?.customer_phone ?? '—';
//   const customerEmail = customer?.email ?? raw?.customer_email ?? undefined;

//   const rawDeliveryMethod = raw?.delivery_method ?? raw?.deliveryMethod;
//   const deliveryMethodRaw = typeof rawDeliveryMethod === 'string'
//     ? rawDeliveryMethod.trim().toUpperCase()
//     : '';
//   const isPickupOrder = deliveryMethodRaw === 'PICKUP';

//   const address = raw?.delivery_address ?? raw?.address ?? {};
//   const addressJson = raw?.delivery_address_json ?? {};
//   const addressParts = [
//     address?.street ?? address?.line1,
//     address?.city,
//     address?.state,
//     address?.pincode ?? address?.zip_code ?? address?.postal_code,
//     address?.country,
//   ].filter(Boolean);
//   const rawDeliveryAddress = raw?.delivery_address;
//   const deliveryAddress =
//     isPickupOrder
//       ? (typeof rawDeliveryAddress === 'string' && rawDeliveryAddress.trim() !== ''
//           ? rawDeliveryAddress
//           : 'Pickup order')
//       : typeof rawDeliveryAddress === 'string'
//       ? rawDeliveryAddress
//       : addressParts.length
//       ? addressParts.join(', ')
//       : (addressJson?.address_line1
//           ? [addressJson.address_line1, addressJson.address_line2, addressJson.city, addressJson.state]
//               .filter(Boolean).join(', ')
//           : '—');

//   // address_line2 (as built on the create-order form) packs "houseNo, street"
//   // together — split it apart as a fallback when explicit fields aren't sent.
//   const line2Raw = String(addressJson?.address_line2 ?? address?.address_line2 ?? '');
//   const line2Parts = line2Raw.split(',').map((s: string) => s.trim()).filter(Boolean);

//   const detailedAddress: DetailedAddress = {
//     areaName: address?.area?.name ?? raw?.delivery_area?.name ?? addressJson?.area_name ?? undefined,
//     block: address?.block ?? addressJson?.block ?? addressJson?.address_line1 ?? address?.address_line1 ?? undefined,
//     houseNo: address?.house_no ?? address?.houseNo ?? address?.apartment ?? addressJson?.house_no ?? line2Parts[0] ?? undefined,
//     street: address?.street ?? addressJson?.street ?? line2Parts[1] ?? undefined,
//     country: address?.country ?? addressJson?.country ?? undefined,
//     landmark: address?.landmark ?? addressJson?.landmark ?? undefined,
//     addressNotes: address?.delivery_notes ?? address?.deliveryNotes ?? addressJson?.delivery_notes ?? undefined,
//     addressLine1: addressJson?.address_line1 || undefined,
//     addressLine2: addressJson?.address_line2 || undefined,
//     city: addressJson?.city || undefined,
//     state: addressJson?.state || undefined,
//     pincode: addressJson?.pincode || undefined,
//   };

//   const items: OrderItem[] = (raw?.items ?? raw?.order_items ?? []).map((it: any, idx: number) => {
//     const product    = it?.product ?? {};
//     const customJson = it?.custom_json ?? {};
//     return {
//       id: String(it?.id ?? `item-${idx}`),
//       productName: product?.name ?? it?.product_name ?? it?.name ?? 'Item',
//       productDescription: product?.description ?? undefined,
//       quantity: Number(it?.quantity ?? 1),
//       price: Number(it?.price ?? product?.price ?? 0),
//       addOnPriceTotal: Number(it?.add_on_total ?? customJson?.add_on_total ?? 0),
//       lineTotal: it?.line_total != null ? Number(it.line_total) : undefined,
//       selectedVariant: customJson?.variant_name ?? customJson?.variant ?? it?.variant ?? undefined,
//       selectedFlavour:
//   customJson?.flavor_name ?? customJson?.flavour_name ??
//   customJson?.flavor ?? customJson?.flavour ?? it?.flavour ?? undefined,
//       selectedAddOns:  customJson?.addons ?? customJson?.add_ons ?? it?.add_ons ?? [],
//       imageUrl: product?.image_url ?? product?.imageUrl ?? undefined,
//     };
//   });

//   let subtotal = Number(raw?.subtotal ?? raw?.sub_total ?? 0);
//   if (!subtotal) {
//     subtotal = items.reduce(
//       (sum, it) => sum + (it.lineTotal ?? (it.price + it.addOnPriceTotal) * it.quantity),
//       0
//     );
//   }

//   const discount       = Number(raw?.discount ?? 0);
//   const deliveryCharge = Number(raw?.delivery_charge ?? raw?.delivery_fee ?? 0);
//   let   total          = Number(raw?.total ?? raw?.grand_total ?? 0);
//   if (!total) total    = subtotal - discount + deliveryCharge;

//   const currency      = String(raw?.currency ?? 'INR').toUpperCase();
//   const paymentMethod = String(raw?.payment_method ?? 'N/A').toUpperCase();
//   const timeline: TimelineEntry[] = (raw?.history ?? raw?.timeline ?? []).map(mapTimelineEntry);

//   // ── Order origin: who created / logged the order ──
//   const createdBy      = raw?.created_by ?? {};
//   const createdByName  = createdBy?.name
//     ?? `${createdBy?.first_name ?? ''} ${createdBy?.last_name ?? ''}`.trim()
//     ?? undefined;
//   const createdByRole  = createdBy?.role ?? undefined;
//   const createdByPhone = createdBy?.phone_no ?? undefined;
//   const createdByEmail = createdBy?.email ?? undefined;
//   const orderSource    = raw?.order_source ?? undefined;
//   const orderTypeRaw   = String(raw?.order_type ?? '').toLowerCase();
//   const isSalesAgentOrder =
//     createdByRole === 'SALES_AGENT' ||
//     orderSource === 'SALES_AGENT' ||
//     orderTypeRaw === 'sales_agent' ||
//     orderTypeRaw === 'agent_order';

//   // ── Custom cake order — mirrors exactly what the create-order form sends:
//   //     product_name, image, shape, flavour, variant, price, message.
//   const customCakeRaw = raw?.custom_cake_json ?? raw?.custom_cake ?? null;
//   const isCustomCakeOrder = !!customCakeRaw;
//   const customCake: CustomCakeDetails | null = customCakeRaw ? {
//     productName: customCakeRaw?.product_name || customCakeRaw?.productName || undefined,
//     image:       customCakeRaw?.image || undefined,
//     shape:       customCakeRaw?.shape || undefined,
//     flavour:     customCakeRaw?.flavour || undefined,
//     variant:     customCakeRaw?.variant || undefined,
//     price:       customCakeRaw?.price != null ? Number(customCakeRaw.price) : undefined,
//     message:     customCakeRaw?.message || undefined,
//   } : null;

//   const deliveryDate     = raw?.delivery_date ?? raw?.pickup_date ?? undefined;
//   const deliveryTimeSlot = raw?.delivery_time_slot ?? raw?.pickup_time_slot ?? undefined;
//   const deliveryMethod   = deliveryMethodRaw || undefined;

//   const greetingTo      = raw?.greeting_to ?? undefined;
//   const greetingFrom    = raw?.greeting_from ?? undefined;
//   const greetingMessage = raw?.greeting_message ?? undefined;

//   return {
//     id: String(raw?.id ?? ''),
//     orderNumber: raw?.order_number ?? undefined,
//     customerName,
//     customerPhone,
//     customerEmail,
//     deliveryAddress,
//     detailedAddress,
//     items,
//     subtotal,
//     discount,
//     deliveryCharge,
//     total,
//     currency,
//     status,
//     paymentMethod,
//     paymentStatus:    raw?.payment_status ?? undefined,
//     orderType:        raw?.order_type ?? undefined,
//     loyaltyCoupon:    raw?.loyalty_coupon ?? undefined,
//     rejectionReason:  raw?.rejection_reason ?? undefined,
//     notes:            raw?.notes ?? raw?.delivery_notes ?? undefined,
//     createdAt:        raw?.created_at ?? raw?.createdAt ?? new Date().toISOString(),
//     timeline,

//     createdByName,
//     createdByRole,
//     createdByPhone,
//     createdByEmail,
//     orderSource,
//     isSalesAgentOrder,
//     deliveryMethod,

//     customCake,
//     isCustomCakeOrder,

//     deliveryDate,
//     deliveryTimeSlot,

//     greetingTo,
//     greetingFrom,
//     greetingMessage,
//   };
// }

// // ─── Sub-components ───────────────────────────────────────────────────────────

// interface ModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   title: string;
//   children: React.ReactNode;
//   width?: string;
// }
// const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, width = '500px' }) => {
//   if (!isOpen) return null;
//   return (
//     <div className="sao-modal-overlay" onClick={onClose}>
//       <div className="sao-modal-content" style={{ maxWidth: width }} onClick={e => e.stopPropagation()}>
//         <div className="sao-modal-header">
//           <h3>{title}</h3>
//           <button className="sao-modal-close" onClick={onClose}><X size={18} /></button>
//         </div>
//         <div className="sao-modal-body">{children}</div>
//       </div>
//     </div>
//   );
// };

// const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
//   pending:             { label: 'Pending',            className: 'status-pending'    },
//   accepted:            { label: 'Accepted',           className: 'status-confirmed'  },
//   assigned_to_kitchen: { label: 'Kitchen Assigned',   className: 'status-processing' },
//   preparing:           { label: 'Preparing',          className: 'status-processing' },
//   ready:               { label: 'Ready for Dispatch', className: 'status-ready'      },
//   assigned_to_agent:   { label: 'Agent Assigned',     className: 'status-assigned'   },
//   assigned_to_driver:  { label: 'Driver Assigned',    className: 'status-assigned'   },
//   out_for_delivery:    { label: 'Out for Delivery',   className: 'status-ontheway'   },
//   delivery_submitted:  { label: 'Proof Submitted',    className: 'status-ontheway'   },
//   delivered:           { label: 'Delivered',          className: 'status-delivered'  },
//   rejected:            { label: 'Rejected',           className: 'status-cancelled'  },
//   cancelled:           { label: 'Cancelled',          className: 'status-cancelled'  },
// };

// const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
//   const cfg = STATUS_CONFIG[status] ?? { label: status.replace(/_/g, ' '), className: 'status-default' };
//   return (
//     <span className={`sao-status-badge ${cfg.className}`}>
//       <span className="badge-dot" />{cfg.label}
//     </span>
//   );
// };

// // Shows PICKUP vs DELIVERY as its own chip so it's visible even without the row tint
// const DeliveryMethodBadge: React.FC<{ method?: string }> = ({ method }) => {
//   const m = (method || '').toUpperCase();
//   if (m === 'PICKUP') {
//     return <span className="sao-method-badge method-pickup">Pickup</span>;
//   }
//   return <span className="sao-method-badge method-delivery">Delivery</span>;
// };

// const PaymentStatusChip: React.FC<{ status: string | undefined }> = ({ status }) => {
//   if (!status) return null;
//   const s = status.toUpperCase();
//   const className = s === 'PAID' || s === 'COMPLETED'
//     ? 'sao-payment-status-chip chip-paid'
//     : s === 'FAILED'
//     ? 'sao-payment-status-chip chip-failed'
//     : 'sao-payment-status-chip chip-pending';
//   return <span className={className}>{status}</span>;
// };

// /** Small stat card used on the Monthly Analytics tab. */
// interface AnalyticsCardProps {
//   icon: React.ReactNode;
//   label: string;
//   value: string;
//   tone?: 'default' | 'positive' | 'warning' | 'negative';
// }
// const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ icon, label, value, tone = 'default' }) => (
//   <div className={`sao-analytics-card tone-${tone}`}>
//     <div className="sao-analytics-icon">{icon}</div>
//     <div className="sao-analytics-text">
//       <span className="sao-analytics-value">{value}</span>
//       <span className="sao-analytics-label">{label}</span>
//     </div>
//   </div>
// );

// /** Aligned label/value row used throughout the receipt — keeps every
//  * line lining up on the right edge no matter how long the text is. */
// const ReceiptRow: React.FC<{
//   label: string;
//   value: React.ReactNode;
//   strong?: boolean;
//   big?: boolean;
//   tone?: 'discount';
// }> = ({ label, value, strong, big, tone }) => (
//   <div className={`sao-rcpt-row ${strong ? 'is-strong' : ''} ${big ? 'is-big' : ''} ${tone === 'discount' ? 'is-discount' : ''}`}>
//     <span className="sao-rcpt-row-label">{label}</span>
//     <span className="sao-rcpt-row-dots" aria-hidden="true" />
//     <span className="sao-rcpt-row-value">{value}</span>
//   </div>
// );

// interface Column<T> {
//   header: string;
//   accessor: keyof T | ((row: T) => React.ReactNode);
//   align?: 'left' | 'center' | 'right';
//   width?: string;
// }
// interface DataTableProps<T> {
//   columns: Column<T>[];
//   data: T[];
//   emptyMessage?: string;
//   rowClassName?: (row: T) => string;
// }
// function DataTable<T extends { id: string }>({
//   columns, data, emptyMessage = 'No items found', rowClassName,
// }: DataTableProps<T>) {
//   return (
//     <div className="sao-table-card">
//       <div className="sao-table-container">
//         <table className="sao-data-table">
//           <thead>
//             <tr>
//               {columns.map((col, i) => (
//                 <th key={i} style={{ textAlign: col.align || 'left', width: col.width || 'auto' }}>
//                   {col.header}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {data.length > 0 ? data.map(row => (
//               <tr key={row.id} className={rowClassName ? rowClassName(row) : undefined}>
//                 {columns.map((col, ci) => {
//                   const cell = typeof col.accessor === 'function'
//                     ? col.accessor(row)
//                     : (row[col.accessor] as React.ReactNode);
//                   return <td key={ci} style={{ textAlign: col.align || 'left' }}>{cell}</td>;
//                 })}
//               </tr>
//             )) : (
//               <tr>
//                 <td colSpan={columns.length} className="sao-empty-table-cell">
//                   <p>{emptyMessage}</p>
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// // ─── Main component ───────────────────────────────────────────────────────────

// type PageTab = 'all' | 'monthly';

// const Salesagentorder: React.FC = () => {
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // ── Tabs: All Orders / Monthly Analytics ──
//   const [activeTab, setActiveTab] = useState<PageTab>('all');

//   // ── Calendar (exact day) filter — used on the "All Orders" tab ──
//   const [calendarDate, setCalendarDate] = useState<string>('');            // 'YYYY-MM-DD'
//   const allTabDateInputRef = useRef<HTMLInputElement>(null);

//   // ── Month-wise navigation — used on the "Monthly Analytics" tab ──
//   const [monthFilter, setMonthFilter] = useState<string>(currentMonthKey()); // 'YYYY-MM', defaults to current month

//   const [fullDetailsOrderId, setFullDetailsOrderId] = useState<string | null>(null);
//   const [receiptOrderId, setReceiptOrderId] = useState<string | null>(null);

//   // ── Payment link / QR ──
//   const [paymentOrderId, setPaymentOrderId] = useState<string | null>(null);
//   const [paymentLink, setPaymentLink] = useState<string | null>(null);
//   const [paymentLoading, setPaymentLoading] = useState(false);
//   const [paymentError, setPaymentError] = useState<string | null>(null);
//   const [linkCopied, setLinkCopied] = useState(false);

//   const fetchOrders = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const raw = await getSalesAgentOrders();
//       const normalized = (raw ?? []).map(normalizeOrder);
//       setOrders(normalized);
//     } catch (err) {
//       console.error('Failed to fetch sales agent orders:', err);
//       setError('Failed to load orders. Please check your connection and try again.');
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchOrders();
//   }, [fetchOrders]);

//   // Lazy-load timeline when a full-details modal is opened
//   useEffect(() => {
//     if (!fullDetailsOrderId) return;
//     const current = orders.find(o => o.id === fullDetailsOrderId);
//     if (!current || current.timeline.length > 0) return;
//     let cancelled = false;
//     (async () => {
//       try {
//         const history = await getOrderHistory(Number(fullDetailsOrderId));
//         if (!cancelled && Array.isArray(history) && history.length > 0) {
//           setOrders(prev =>
//             prev.map(o => o.id === fullDetailsOrderId ? { ...o, timeline: history.map(mapTimelineEntry) } : o)
//           );
//         }
//       } catch { /* non-fatal */ }
//     })();
//     return () => { cancelled = true; };
//   }, [fullDetailsOrderId]); // eslint-disable-line react-hooks/exhaustive-deps

//   // ── ALL ORDERS tab: every sales-agent order, optionally filtered to one exact day ──
//   const allTabOrders = orders.filter(o => {
//     if (calendarDate) return toLocalDateKey(o.createdAt) === calendarDate;
//     return true;
//   });

//   // ── MONTHLY tab: orders for the selected month ──
//   const monthlyTabOrders = orders.filter(o => toLocalMonthKey(o.createdAt) === monthFilter);

//   // ── Monthly analytics, derived from monthlyTabOrders ──
//   const analytics = useMemo(() => {
//     const totalOrders = monthlyTabOrders.length;
//     const totalRevenue = monthlyTabOrders.reduce((sum, o) => sum + (o.total || 0), 0);
//     const delivered = monthlyTabOrders.filter(o => o.status === 'delivered').length;
//     const cancelled = monthlyTabOrders.filter(o => ['cancelled', 'rejected'].includes(o.status)).length;
//     const active = totalOrders - delivered - cancelled;
//     const itemsSold = monthlyTabOrders.reduce(
//       (sum, o) => sum + o.items.reduce((a, it) => a + it.quantity, 0), 0
//     );
//     const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;
//     const currency = monthlyTabOrders[0]?.currency ?? orders[0]?.currency ?? 'INR';
//     return { totalOrders, totalRevenue, delivered, cancelled, active, itemsSold, avgOrderValue, currency };
//   }, [monthlyTabOrders, orders]);

//   const fullDetailsOrder = orders.find(o => o.id === fullDetailsOrderId);
//   const receiptOrder = orders.find(o => o.id === receiptOrderId);
//   const paymentOrder = orders.find(o => o.id === paymentOrderId);

//   // Row tint helper — blue for pickup, green for delivery
//   const getRowClassName = (row: Order) => {
//     const method = (row.deliveryMethod || '').toUpperCase();
//     return method === 'PICKUP' ? 'sao-row-pickup' : 'sao-row-delivery';
//   };

//   // ── All Orders tab: calendar (exact day) picker ──
//   // Clicking the button opens the browser's native calendar directly via
//   // showPicker() instead of requiring the agent to type a date manually.
//   const openCalendarPicker = () => {
//     const el = allTabDateInputRef.current;
//     if (!el) return;
//     if (typeof (el as any).showPicker === 'function') {
//       (el as any).showPicker();
//     } else {
//       el.focus();
//     }
//   };
//   const handleCalendarDateChange = (value: string) => setCalendarDate(value);
//   const clearCalendarDate = () => setCalendarDate('');

//   // ── Monthly tab: prev / next / current month navigation ──
//   const goToPrevMonth = () => setMonthFilter(prev => shiftMonthKey(prev, -1));
//   const goToNextMonth = () => setMonthFilter(prev => shiftMonthKey(prev, 1));
//   const goToCurrentMonth = () => setMonthFilter(currentMonthKey());
//   const isCurrentMonth = monthFilter === currentMonthKey();

//   // ── Payment link / QR handlers ──
//   const handleOpenPayment = async (orderId: string) => {
//     setPaymentOrderId(orderId);
//     setPaymentLink(null);
//     setPaymentError(null);
//     setLinkCopied(false);
//     setPaymentLoading(true);
//     try {
//       const result = await createPaymentLink(Number(orderId));
//       if (result?.success === false) {
//         setPaymentError(result?.error || 'Unable to generate payment link.');
//       } else if (result?.payment_url) {
//         setPaymentLink(result.payment_url);
//       } else {
//         setPaymentError('Payment link was not returned by the server.');
//       }
//     } catch (err: any) {
//       console.error('Failed to create payment link:', err);
//       setPaymentError(
//         err?.response?.data?.error || 'Failed to generate payment link. Please try again.'
//       );
//     } finally {
//       setPaymentLoading(false);
//     }
//   };

//   const handleCopyLink = async () => {
//     if (!paymentLink) return;
//     try {
//       await navigator.clipboard.writeText(paymentLink);
//       setLinkCopied(true);
//       setTimeout(() => setLinkCopied(false), 2000);
//     } catch {
//       /* clipboard unavailable, ignore */
//     }
//   };

//   const closePaymentModal = () => {
//     setPaymentOrderId(null);
//     setPaymentLink(null);
//     setPaymentError(null);
//     setPaymentLoading(false);
//   };

//   // Shared table columns used by both tabs
//   const orderColumns: Column<Order>[] = [
//     {
//       header: 'Order #',
//       accessor: (row: Order) => (
//         <div className="sao-order-id-cell">
//           <strong className="sao-order-id">{row.orderNumber ?? row.id}</strong>
//           <span className="sao-agent-tag">
//             <UserCheck size={10} /> {row.createdByName || 'Sales Agent'}
//           </span>
//         </div>
//       ),
//     },
//     {
//       header: 'Time',
//       accessor: (row: Order) =>
//         new Date(row.createdAt).toLocaleString([], {
//           month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
//         }),
//     },
//     {
//       header: 'Customer',
//       accessor: (row: Order) => (
//         <div className="sao-cust-cell">
//           <span className="sao-cust-name">{row.customerName}</span>
//           <span className="sao-cust-sub">{row.customerPhone}</span>
//         </div>
//       ),
//     },
//     {
//       header: 'Fulfilment',
//       accessor: (row: Order) => <DeliveryMethodBadge method={row.deliveryMethod} />,
//     },
//     {
//       header: 'Items',
//       accessor: (row: Order) =>
//         `${row.items.reduce((acc, i) => acc + i.quantity, 0)} item(s)`,
//     },
//     {
//       header: 'Total',
//       accessor: (row: Order) => <strong>{formatMoney(row.total, row.currency)}</strong>,
//     },
//     {
//       header: 'Payment',
//       accessor: (row: Order) => (
//         <div className="sao-cust-cell">
//           <span className="sao-cust-name">{row.paymentMethod}</span>
//           {row.paymentStatus && <PaymentStatusChip status={row.paymentStatus} />}
//         </div>
//       ),
//     },
//     {
//       header: 'Status',
//       accessor: (row: Order) => <StatusBadge status={row.status} />,
//     },
//     {
//       header: 'Actions',
//       accessor: (row: Order) => (
//         <div className="sao-actions-cell">
//           <button
//             className="sao-icon-btn"
//             title="View full order details"
//             onClick={() => setFullDetailsOrderId(row.id)}
//           >
//             <Eye size={17} />
//           </button>
//           <button
//             className="sao-icon-btn"
//             title="Print receipt"
//             onClick={() => setReceiptOrderId(row.id)}
//           >
//             <Printer size={17} />
//           </button>
//           {/* Payment link/QR is always available, even when the order is already paid,
//               so the agent can still resend or re-view the link. */}
//           <button
//             className="sao-icon-btn"
//             title={
//               row.paymentStatus?.toUpperCase() === 'PAID'
//                 ? 'View payment link (already paid)'
//                 : 'Generate payment link & QR'
//             }
//             onClick={() => handleOpenPayment(row.id)}
//           >
//             <CreditCard size={17} />
//           </button>
//         </div>
//       ),
//       align: 'right',
//     },
//   ];

//   return (
//     <div className="sao-page-container">

//       {/* Header */}
//       <header className="sao-header">
//         <p className="sao-eyebrow">Sales Agent Orders</p>
//         <h1 className="sao-title">Orders Logged by Sales Agents</h1>
//       </header>

//       {/* Error banner */}
//       {error && (
//         <div className="sao-error-banner">
//           <AlertCircle size={16} />
//           <span>{error}</span>
//           <button className="sao-error-retry-btn" onClick={() => setError(null)}>Dismiss</button>
//           <button className="sao-error-retry-btn" onClick={fetchOrders}>Retry</button>
//         </div>
//       )}

//       {/* ══════ TABS ══════ */}
//       <div className="sao-tabs-row">
//         <button
//           className={`sao-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
//           onClick={() => setActiveTab('all')}
//         >
//           <LayoutGrid size={15} /> All Orders
//           <span className="sao-tab-count">{orders.length}</span>
//         </button>
//         <button
//           className={`sao-tab-btn ${activeTab === 'monthly' ? 'active' : ''}`}
//           onClick={() => setActiveTab('monthly')}
//         >
//           <CalendarClock size={15} /> Monthly Analytics
//         </button>
//       </div>

//       {/* ══════ ALL ORDERS TAB ══════ */}
//       {activeTab === 'all' && (
//         <>
//           {/* Calendar (exact day) filter — click opens the native calendar directly */}
//           <div className="sao-date-filters-row">
//             <div className="sao-date-filter-group">
//               <button
//                 type="button"
//                 className={`sao-icon-btn sao-date-filter-toggle ${calendarDate ? 'active' : ''}`}
//                 title="Pick a date to filter orders"
//                 onClick={openCalendarPicker}
//               >
//                 <Calendar size={16} />
//                 <span>{calendarDate ? formatDate(calendarDate) : 'Pick a Date'}</span>
//               </button>
//               <input
//                 ref={allTabDateInputRef}
//                 type="date"
//                 className="sao-date-input"
//                 value={calendarDate}
//                 onChange={(e) => handleCalendarDateChange(e.target.value)}
//               />
//               {calendarDate && (
//                 <button type="button" className="sao-filter-clear-btn" onClick={clearCalendarDate} title="Clear date, show all orders">
//                   <X size={12} /> Clear
//                 </button>
//               )}
//             </div>
//           </div>

//           {/* Legend so the row-tint meaning is obvious */}
//           <div className="sao-legend-row">
//             <span className="sao-legend-item">
//               <span className="sao-legend-swatch swatch-pickup" /> Pickup order
//             </span>
//             <span className="sao-legend-item">
//               <span className="sao-legend-swatch swatch-delivery" /> Delivery order
//             </span>
//           </div>

//           {loading && orders.length === 0 ? (
//             <div className="sao-loading-state">
//               <Loader2 size={22} className="sao-spin" />
//               <p>Loading sales agent orders…</p>
//             </div>
//           ) : orders.length === 0 ? (
//             <div className="sao-empty-state">
//               <UserCheck size={32} />
//               <p>No sales agent orders found yet.</p>
//             </div>
//           ) : (
//             <div className="sao-grid">
//               <DataTable
//                 rowClassName={getRowClassName}
//                 columns={orderColumns}
//                 data={allTabOrders}
//                 emptyMessage={calendarDate ? `No orders placed on ${formatDate(calendarDate)}.` : 'No sales agent orders found.'}
//               />
//             </div>
//           )}
//         </>
//       )}

//       {/* ══════ MONTHLY ANALYTICS TAB ══════ */}
//       {activeTab === 'monthly' && (
//         <>
//           {/* Month navigation — defaults to the current month, prev/next moves it */}
//           <div className="sao-month-nav-row">
//             <div className="sao-month-nav-group">
//               <button type="button" className="sao-icon-btn" title="Previous month" onClick={goToPrevMonth}>
//                 <ChevronLeft size={18} />
//               </button>

//               <span className="sao-month-nav-label">{formatMonthLabel(monthFilter)}</span>

//               <button type="button" className="sao-icon-btn" title="Next month" onClick={goToNextMonth}>
//                 <ChevronRight size={18} />
//               </button>

//               {!isCurrentMonth && (
//                 <button type="button" className="sao-filter-clear-btn sao-today-btn" onClick={goToCurrentMonth}>
//                   This Month
//                 </button>
//               )}
//             </div>
//           </div>

//           {/* Analytics summary cards */}
//           <div className="sao-analytics-grid">
//             <AnalyticsCard icon={<Package size={18} />} label="Total Orders" value={String(analytics.totalOrders)} />
//             <AnalyticsCard icon={<TrendingUp size={18} />} label="Total Revenue" value={formatMoney(analytics.totalRevenue, analytics.currency)} tone="positive" />
//             <AnalyticsCard icon={<CreditCard size={18} />} label="Avg. Order Value" value={formatMoney(analytics.avgOrderValue, analytics.currency)} />
//             {/* <AnalyticsCard icon={<Cake size={18} />} label="Items Sold" value={String(analytics.itemsSold)} /> */}
//             <AnalyticsCard icon={<ListChecks size={18} />} label="Delivered" value={String(analytics.delivered)} tone="positive" />
//             <AnalyticsCard icon={<Loader2 size={18} />} label="Active / In Progress" value={String(analytics.active)} tone="warning" />
//             <AnalyticsCard icon={<XCircle size={18} />} label="Cancelled / Rejected" value={String(analytics.cancelled)} tone="negative" />
//           </div>

//           {loading && orders.length === 0 ? (
//             <div className="sao-loading-state">
//               <Loader2 size={22} className="sao-spin" />
//               <p>Loading sales agent orders…</p>
//             </div>
//           ) : (
//             <div className="sao-grid">
//               <DataTable
//                 rowClassName={getRowClassName}
//                 columns={orderColumns}
//                 data={monthlyTabOrders}
//                 emptyMessage={`No orders placed in ${formatMonthLabel(monthFilter)}.`}
//               />
//             </div>
//           )}
//         </>
//       )}

//       {/* ══════ FULL DETAILS MODAL (read-only, no actions) ══════ */}
//       <Modal
//         isOpen={!!fullDetailsOrder}
//         onClose={() => setFullDetailsOrderId(null)}
//         title={`Order Details — ${fullDetailsOrder?.orderNumber ?? fullDetailsOrder?.id ?? ''}`}
//         width="640px"
//       >
//         {fullDetailsOrder && (
//           <div className="sao-fd-body">

//             <div className="sao-fd-top-row">
//               <StatusBadge status={fullDetailsOrder.status} />
//               {fullDetailsOrder.paymentStatus && <PaymentStatusChip status={fullDetailsOrder.paymentStatus} />}
//               <DeliveryMethodBadge method={fullDetailsOrder.deliveryMethod} />
//               <span className="sao-origin-badge">
//                 <UserCheck size={11} /> Sales Agent Order
//               </span>
//               {fullDetailsOrder.isCustomCakeOrder && (
//                 <span className="sao-origin-badge badge-custom">
//                   <Cake size={11} /> Custom Order
//                 </span>
//               )}
//             </div>

//             <div className="sao-fd-section sao-fd-highlight">
//               <h4><UserCheck size={14} /> Order Origin</h4>
//               <div className="sao-fd-grid">
//                 <div><span className="lbl">Placed by</span><span>{fullDetailsOrder.createdByName ?? '—'}</span></div>
//                 <div><span className="lbl">Role</span><span>{fullDetailsOrder.createdByRole ?? '—'}</span></div>
//                 <div><span className="lbl">Phone</span><span>{fullDetailsOrder.createdByPhone ?? '—'}</span></div>
//                 <div><span className="lbl">Email</span><span>{fullDetailsOrder.createdByEmail ?? '—'}</span></div>
//               </div>
//             </div>

//             {/* Expected date & time — shown for BOTH pickup and delivery orders */}
//             <div className="sao-fd-section sao-fd-highlight">
//               <h4><CalendarClock size={14} /> {fullDetailsOrder.deliveryMethod === 'PICKUP' ? 'Pickup Schedule' : 'Delivery Schedule'}</h4>
//               <div className="sao-fd-grid">
//                 <div>
//                   <span className="lbl">{fullDetailsOrder.deliveryMethod === 'PICKUP' ? 'Pickup Date' : 'Delivery Date'}</span>
//                   <span>{formatDate(fullDetailsOrder.deliveryDate)}</span>
//                 </div>
//                 <div>
//                   <span className="lbl">{fullDetailsOrder.deliveryMethod === 'PICKUP' ? 'Pickup Time' : 'Delivery Time'}</span>
//                   <span>{fullDetailsOrder.deliveryTimeSlot ?? '—'}</span>
//                 </div>
//               </div>
//             </div>

//             <div className="sao-fd-section">
//               <h4>Customer</h4>
//               <div className="sao-fd-grid">
//                 <div><span className="lbl">Name</span><span>{fullDetailsOrder.customerName}</span></div>
//                 <div><span className="lbl">Phone</span><span>{fullDetailsOrder.customerPhone}</span></div>
//                 <div><span className="lbl">Email</span><span>{fullDetailsOrder.customerEmail ?? '—'}</span></div>
//               </div>
//             </div>

//             {/* Full address block — every field captured on the create-order form */}
//             {fullDetailsOrder.deliveryMethod !== 'PICKUP' && (
//               <div className="sao-fd-section sao-fd-highlight">
//                 <h4>Address</h4>
//                 <div className="sao-fd-grid">
//                   <div><span className="lbl">Area</span><span>{fullDetailsOrder.detailedAddress?.areaName ?? '—'}</span></div>
//                   <div><span className="lbl">Block</span><span>{fullDetailsOrder.detailedAddress?.block ?? '—'}</span></div>
//                   <div><span className="lbl">House / Flat No</span><span>{fullDetailsOrder.detailedAddress?.houseNo ?? '—'}</span></div>
//                   <div><span className="lbl">Street</span><span>{fullDetailsOrder.detailedAddress?.street ?? '—'}</span></div>
//                   <div><span className="lbl">Country</span><span>{fullDetailsOrder.detailedAddress?.country ?? '—'}</span></div>
//                   <div><span className="lbl">Landmark</span><span>{fullDetailsOrder.detailedAddress?.landmark ?? '—'}</span></div>
//                 </div>
//                 <p><strong>Delivery Notes:</strong> {fullDetailsOrder.detailedAddress?.addressNotes ?? '—'}</p>
//               </div>
//             )}

//             <div className="sao-fd-section">
//               <h4>Ordered Products</h4>
//               {fullDetailsOrder.items.length > 0 ? (
//                 <div className="sao-fd-items-list">
//                   {fullDetailsOrder.items.map(item => (
//                     <div key={item.id} className="sao-fd-item-row">
//                       {item.imageUrl && <img src={item.imageUrl} alt={item.productName} className="sao-fd-item-thumb" />}
//                       <div className="sao-fd-item-info">
//                         <strong>{item.productName}</strong>
//                         <div className="sao-fd-item-meta">
//                           <span>Qty: {item.quantity}</span>
//                           <span>Unit: {formatMoney(item.price, fullDetailsOrder.currency)}</span>
//                           {item.selectedVariant && <span>Variant: {item.selectedVariant}</span>}
//                           {item.selectedFlavour && <span>Flavour: {item.selectedFlavour}</span>}
//                           {item.selectedAddOns.length > 0 && <span>Add-ons: {item.selectedAddOns.join(', ')}</span>}
//                         </div>
//                       </div>
//                       <span className="sao-fd-item-total">
//                         {formatMoney(item.lineTotal ?? (item.price + item.addOnPriceTotal) * item.quantity, fullDetailsOrder.currency)}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <p className="sao-muted">No standard catalog items (custom cake order below).</p>
//               )}
//             </div>

//             {/* Custom cake block — ONLY the fields captured on the create-order
//                 form: product name, image, shape, flavour, variant, price, message. */}
//             {fullDetailsOrder.isCustomCakeOrder && fullDetailsOrder.customCake && (
//               <div className="sao-fd-section sao-fd-highlight-cake">
//                 <h4><Cake size={14} /> Custom Cake Details</h4>
//                 <div className="sao-fd-cake-body">
//                   {fullDetailsOrder.customCake.image && (
//                     <img src={fullDetailsOrder.customCake.image} alt="Custom cake reference" className="sao-fd-cake-image" />
//                   )}
//                   <div className="sao-fd-grid">
//                     <div><span className="lbl">Product Name</span><span>{fullDetailsOrder.customCake.productName ?? '—'}</span></div>
//                     <div><span className="lbl">Shape</span><span>{fullDetailsOrder.customCake.shape ?? '—'}</span></div>
//                     <div><span className="lbl">Flavour</span><span>{fullDetailsOrder.customCake.flavour ?? '—'}</span></div>
//                     <div><span className="lbl">Variant</span><span>{fullDetailsOrder.customCake.variant ?? '—'}</span></div>
//                     <div><span className="lbl">Custom Price</span><span>{fullDetailsOrder.customCake.price != null ? formatMoney(fullDetailsOrder.customCake.price, fullDetailsOrder.currency) : '—'}</span></div>
//                   </div>
//                   {fullDetailsOrder.customCake.message && (
//                     <p className="sao-fd-cake-message"><strong>Message:</strong> "{fullDetailsOrder.customCake.message}"</p>
//                   )}
//                 </div>
//               </div>
//             )}

//             {(fullDetailsOrder.greetingMessage || fullDetailsOrder.greetingTo) && (
//               <div className="sao-fd-section sao-fd-highlight-greeting">
//                 <h4><Gift size={14} /> Greeting Card</h4>
//                 <div className="sao-fd-grid">
//                   <div><span className="lbl">To</span><span>{fullDetailsOrder.greetingTo ?? '—'}</span></div>
//                   <div><span className="lbl">From</span><span>{fullDetailsOrder.greetingFrom ?? '—'}</span></div>
//                 </div>
//                 {fullDetailsOrder.greetingMessage && (
//                   <p className="sao-fd-greeting-message">
//                     <Sparkles size={13} /> "{fullDetailsOrder.greetingMessage}"
//                   </p>
//                 )}
//               </div>
//             )}

//             <div className="sao-fd-section">
//               <h4>Payment &amp; Pricing</h4>
//               <div className="sao-fd-grid">
//                 <div><span className="lbl">Method</span><span>{fullDetailsOrder.paymentMethod}</span></div>
//                 <div><span className="lbl">Status</span><span>{fullDetailsOrder.paymentStatus ?? '—'}</span></div>
//                 <div><span className="lbl">Currency</span><span>{fullDetailsOrder.currency}</span></div>
//               </div>
//               <div className="sao-cost-breakdown">
//                 <div className="sao-cost-row"><span>Subtotal:</span><span>{formatMoney(fullDetailsOrder.subtotal, fullDetailsOrder.currency)}</span></div>
//                 {fullDetailsOrder.discount > 0 && (
//                   <div className="sao-cost-row discount">
//                     <span>Discount:</span>
//                     <span>-{formatMoney(fullDetailsOrder.discount, fullDetailsOrder.currency)}</span>
//                   </div>
//                 )}
//                 <div className="sao-cost-row"><span>Delivery:</span><span>{formatMoney(fullDetailsOrder.deliveryCharge, fullDetailsOrder.currency)}</span></div>
//                 <div className="sao-cost-row total"><span>Grand Total:</span><span>{formatMoney(fullDetailsOrder.total, fullDetailsOrder.currency)}</span></div>
//               </div>
//             </div>

//             <div className="sao-fd-actions-row">
//               <button
//                 className="sao-btn sao-btn-secondary"
//                 onClick={() => { setReceiptOrderId(fullDetailsOrder.id); setFullDetailsOrderId(null); }}
//               >
//                 <Printer size={13} /> Print Receipt
//               </button>
//               {/* Payment button no longer disabled once paid — agent can still open/resend the link */}
//               <button
//                 className="sao-btn sao-btn-primary"
//                 onClick={() => { handleOpenPayment(fullDetailsOrder.id); setFullDetailsOrderId(null); }}
//               >
//                 <CreditCard size={13} /> Payment
//               </button>
//             </div>

//           </div>
//         )}
//       </Modal>

//       {/* ══════ RECEIPT MODAL — aligned rows + customization details ══════ */}
//       <Modal
//         isOpen={!!receiptOrder}
//         onClose={() => setReceiptOrderId(null)}
//         title="Print Receipt"
//         width="400px"
//       >
//         {receiptOrder && (
//           <div className="sao-rcpt-sheet">

//             <div className="sao-rcpt-logo-wrap">
//               <img  src="/assets/logo.png" alt="CakeNTake" className="sao-rcpt-logo" />
//             </div>
//             <div className="sao-rcpt-title">ORDER RECEIPT</div>
//             <div className="sao-rcpt-rule sao-rcpt-rule--dashed" />

//             {/* Order meta */}
//             <div className="sao-rcpt-block">
//               <ReceiptRow label="Order No" value={receiptOrder.orderNumber ?? receiptOrder.id} strong />
//               <ReceiptRow label="Date" value={new Date(receiptOrder.createdAt).toLocaleDateString()} />
//               <ReceiptRow label="Time" value={new Date(receiptOrder.createdAt).toLocaleTimeString()} />
//               <ReceiptRow
//                 label="Fulfilment"
//                 value={(receiptOrder.deliveryMethod || 'DELIVERY').toUpperCase() === 'PICKUP' ? 'Pickup' : 'Delivery'}
//               />
//             </div>
//             <div className="sao-rcpt-rule sao-rcpt-rule--dashed" />

//             {/* Customer + payment */}
//             <div className="sao-rcpt-block">
//               <ReceiptRow label="Customer" value={receiptOrder.customerName} />
//               <ReceiptRow label="Phone" value={receiptOrder.customerPhone} />
//               <ReceiptRow label="Payment" value={receiptOrder.paymentMethod} />
//               {receiptOrder.paymentStatus && (
//                 <ReceiptRow
//                   label="Payment Status"
//                   value={<span className={`sao-rcpt-pay-chip is-${receiptOrder.paymentStatus.toLowerCase()}`}>{receiptOrder.paymentStatus}</span>}
//                 />
//               )}
//             </div>
//             <div className="sao-rcpt-rule sao-rcpt-rule--dashed" />

//             {/* Items */}
//             <div className="sao-rcpt-block">
//               {receiptOrder.items.length > 0 ? (
//                 receiptOrder.items.map(item => (
//                   <div key={item.id} className="sao-rcpt-item">
//                     <div className="sao-rcpt-item-main">
//                       <span className="sao-rcpt-item-name">{item.quantity} × {item.productName}</span>
//                       <span className="sao-rcpt-item-amount">
//                         {formatMoney(item.lineTotal ?? (item.price + item.addOnPriceTotal) * item.quantity, receiptOrder.currency)}
//                       </span>
//                     </div>
//                     {(item.selectedVariant || item.selectedFlavour || item.selectedAddOns.length > 0) && (
//                       <div className="sao-rcpt-item-meta">
//                         {item.selectedVariant && <span>Variant: {item.selectedVariant}</span>}
//                         {item.selectedFlavour && <span>Flavour: {item.selectedFlavour}</span>}
//                         {item.selectedAddOns.length > 0 && <span>Add-ons: {item.selectedAddOns.join(', ')}</span>}
//                       </div>
//                     )}
//                   </div>
//                 ))
//               ) : (
//                 <p className="sao-rcpt-muted">No standard catalog items (see customization below).</p>
//               )}
//             </div>

//             {/* Custom cake customization — now visible on the receipt */}
//             {receiptOrder.isCustomCakeOrder && receiptOrder.customCake && (
//               <>
//                 <div className="sao-rcpt-rule sao-rcpt-rule--dashed" />
//                 <div className="sao-rcpt-block sao-rcpt-custom-block">
//                   <div className="sao-rcpt-block-label"><Cake size={12} /> Customization Details</div>
//                   {/* {receiptOrder.customCake.image && (
//                     <img src={receiptOrder.customCake.image} alt="Custom cake reference" className="sao-rcpt-custom-image" />
//                   )} */}
//                   <ReceiptRow label="Product" value={receiptOrder.customCake.productName ?? '—'} />
//                   <ReceiptRow label="Shape" value={receiptOrder.customCake.shape ?? '—'} />
//                   <ReceiptRow label="Flavour" value={receiptOrder.customCake.flavour ?? '—'} />
//                   <ReceiptRow label="Variant" value={receiptOrder.customCake.variant ?? '—'} />
//                   {receiptOrder.customCake.price != null && (
//                     <ReceiptRow label="Custom Price" value={formatMoney(receiptOrder.customCake.price, receiptOrder.currency)} />
//                   )}
//                   {receiptOrder.customCake.message && (
//                     <p className="sao-rcpt-message">"{receiptOrder.customCake.message}"</p>
//                   )}
//                 </div>
//               </>
//             )}

//             {/* Greeting card */}
//             {(receiptOrder.greetingMessage || receiptOrder.greetingTo) && (
//               <>
//                 <div className="sao-rcpt-rule sao-rcpt-rule--dashed" />
//                 <div className="sao-rcpt-block">
//                   <div className="sao-rcpt-block-label"><Gift size={12} /> Greeting Card</div>
//                   <ReceiptRow label="To" value={receiptOrder.greetingTo ?? '—'} />
//                   <ReceiptRow label="From" value={receiptOrder.greetingFrom ?? '—'} />
//                   {receiptOrder.greetingMessage && (
//                     <p className="sao-rcpt-message">"{receiptOrder.greetingMessage}"</p>
//                   )}
//                 </div>
//               </>
//             )}

//             <div className="sao-rcpt-rule sao-rcpt-rule--dashed" />

//             {/* Totals */}
//             <div className="sao-rcpt-block sao-rcpt-totals">
//               <ReceiptRow label="Subtotal" value={formatMoney(receiptOrder.subtotal, receiptOrder.currency)} />
//               {receiptOrder.discount > 0 && (
//                 <ReceiptRow label="Discount" value={`-${formatMoney(receiptOrder.discount, receiptOrder.currency)}`} tone="discount" />
//               )}
//               <ReceiptRow label="Delivery" value={formatMoney(receiptOrder.deliveryCharge, receiptOrder.currency)} />
//               <div className="sao-rcpt-rule sao-rcpt-rule--solid" />
//               <ReceiptRow label="Grand Total" value={formatMoney(receiptOrder.total, receiptOrder.currency)} strong big />
//             </div>

//             <div className="sao-rcpt-rule sao-rcpt-rule--dashed" />
//             <p className="sao-rcpt-footer">Thank you for your order!</p>

//             <div className="sao-receipt-controls sao-no-print">
//               <button className="sao-btn sao-btn-secondary sao-btn-sm" onClick={() => window.print()}>
//                 <Printer size={13} /><span>Print</span>
//               </button>
//               <button className="sao-btn sao-btn-primary sao-btn-sm" onClick={() => setReceiptOrderId(null)}>
//                 Close
//               </button>
//             </div>
//           </div>
//         )}
//       </Modal>

//       {/* ══════ PAYMENT LINK / QR MODAL ══════ */}
//       <Modal
//         isOpen={!!paymentOrderId}
//         onClose={closePaymentModal}
//         title={`Payment — ${paymentOrder?.orderNumber ?? paymentOrder?.id ?? ''}`}
//         width="400px"
//       >
//         {paymentOrderId && (
//           <div className="sao-payment-body">
//             {paymentOrder && (
//               <div className="sao-payment-summary">
//                 <p><strong>Customer:</strong> {paymentOrder.customerName}</p>
//                 <p><strong>Amount:</strong> {formatMoney(paymentOrder.total, paymentOrder.currency)}</p>
//                 {paymentOrder.paymentStatus?.toUpperCase() === 'PAID' && (
//                   <p className="sao-payment-paid-note">
//                     <Check size={13} /> This order is already marked as paid — link shown for reference.
//                   </p>
//                 )}
//               </div>
//             )}

//             {paymentLoading && (
//               <div className="sao-payment-loading">
//                 <Loader2 size={22} className="sao-spin" />
//                 <p>Generating payment link…</p>
//               </div>
//             )}

//             {!paymentLoading && paymentError && (
//               <div className="sao-error-banner">
//                 <AlertCircle size={16} />
//                 <span>{paymentError}</span>
//                 <button
//                   className="sao-error-retry-btn"
//                   onClick={() => paymentOrderId && handleOpenPayment(paymentOrderId)}
//                 >
//                   Retry
//                 </button>
//               </div>
//             )}

//             {!paymentLoading && paymentLink && (
//               <div className="sao-payment-content">
//                 <div className="sao-payment-qr">
//                   <QRCodeSVG value={paymentLink} size={200} />
//                 </div>

//                 <div className="sao-payment-link-row">
//                   <input
//                     type="text"
//                     className="sao-payment-link-input"
//                     value={paymentLink}
//                     readOnly
//                     onFocus={e => e.target.select()}
//                   />
//                   <button className="sao-icon-btn" title="Copy link" onClick={handleCopyLink}>
//                     {linkCopied ? <Check size={16} /> : <Copy size={16} />}
//                   </button>
//                 </div>

//                 <div className="sao-payment-actions">
//                   <a
//                     href={paymentLink}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="sao-btn sao-btn-primary sao-btn-sm"
//                   >
//                     <ExternalLink size={13} /> Open Payment Page
//                   </a>
//                   <button className="sao-btn sao-btn-secondary sao-btn-sm" onClick={handleCopyLink}>
//                     {linkCopied ? <Check size={13} /> : <Copy size={13} />}
//                     <span>{linkCopied ? 'Copied' : 'Copy Link'}</span>
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </Modal>

//     </div>
//   );
// };

// export default Salesagentorder;




import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Printer, X, Loader2, AlertCircle, Eye,
  UserCheck, Cake, Gift, CalendarClock, Sparkles,
  CreditCard, Copy, Check, ExternalLink, Calendar,
  ChevronLeft, ChevronRight, TrendingUp, Package,
  XCircle, ListChecks, LayoutGrid,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import './Salesagentorder.css';

import { getOrderHistory, getSalesAgentOrders } from '../../services/orderService';
import { createPaymentLink } from '../../services/paymentService';
import {
  getCustomerStatusLabel,
  getCustomerStageIndex,
} from '../../services/orderStatus';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderItem {
  id: string;
  productName: string;
  productDescription?: string;
  quantity: number;
  price: number;
  addOnPriceTotal: number;
  lineTotal?: number;
  selectedVariant?: string;
  selectedFlavour?: string;
  selectedAddOns: string[];
  imageUrl?: string;
}

interface TimelineEntry {
  status: string;
  timestamp: string;
  note?: string;
  changedBy?: string;
}

/**
 * Trimmed to exactly the fields captured on the Sales Agent "Create Order"
 * form's custom-cake section: product name, reference image, shape,
 * flavour, variant, custom price, message. Nothing else is shown.
 */
interface CustomCakeDetails {
  productName?: string;
  image?: string;
  shape?: string;
  flavour?: string;
  variant?: string;
  price?: number;
  message?: string;
}

/**
 * Full address captured on the Sales Agent "Create Order" form:
 * Area, Block, House/Flat No, Street, Country, Landmark, Delivery Notes.
 */
interface DetailedAddress {
  areaName?: string;
  block?: string;
  houseNo?: string;
  street?: string;
  country?: string;
  landmark?: string;
  addressNotes?: string;
  // Legacy / alternate shape some backends return — kept as fallback only,
  // not shown as separate fields in the UI.
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'assigned_to_kitchen'
  | 'preparing'
  | 'ready'
  | 'assigned_to_agent'
  | 'assigned_to_driver'
  | 'out_for_delivery'
  | 'delivery_submitted'
  | 'delivered'
  | 'cancelled'
  | 'rejected';

interface Order {
  id: string;
  orderNumber?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  detailedAddress?: DetailedAddress;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  currency: string;
  status: OrderStatus;
  /** Untouched backend status string (e.g. 'ASSIGNED_TO_KITCHEN'), kept
   *  purely for driving the customer-facing 6-stage status label/badge. */
  rawStatus: string;
  paymentMethod: string;
  paymentStatus?: string;
  orderType?: string;
  loyaltyCoupon?: string;
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
  timeline: TimelineEntry[];

  createdByName?: string;
  createdByRole?: string;
  createdByPhone?: string;
  createdByEmail?: string;
  orderSource?: string;
  isSalesAgentOrder: boolean;

  customCake?: CustomCakeDetails | null;
  isCustomCakeOrder: boolean;

  deliveryMethod?: string;
  deliveryDate?: string;
  deliveryTimeSlot?: string;

  greetingTo?: string;
  greetingFrom?: string;
  greetingMessage?: string;
}

// ─── Status mapping ───────────────────────────────────────────────────────────
// NOTE: This local lowercase mapping is still used for internal logic only
// (analytics counters, row tinting via getRowClassName, etc). It is NOT
// used for what the agent sees on the status badge anymore — that now
// comes from rawStatus via getCustomerStatusLabel()/getCustomerStageIndex()
// in utils/customerOrderStatus.ts.

const STATUS_API_TO_LOCAL: Record<string, OrderStatus> = {
  PENDING:             'pending',
  ACCEPTED:            'accepted',
  ORDER_ACCEPTED:      'accepted',
  CONFIRMED:           'accepted',
  ASSIGNED_TO_KITCHEN: 'assigned_to_kitchen',
  PREPARING:           'preparing',
  PROCESSING:          'preparing',
  READY:               'ready',
  READY_FOR_PICKUP:    'ready',
  READY_FOR_DISPATCH:  'ready',
  ASSIGNED_TO_AGENT:   'assigned_to_agent',
  ASSIGNED_TO_DRIVER:  'assigned_to_driver',
  DRIVER_ASSIGNED:     'assigned_to_driver',
  DRIVER_ACCEPTED:     'out_for_delivery',
  OUT_FOR_DELIVERY:    'out_for_delivery',
  ON_THE_WAY:          'out_for_delivery',
  DELIVERY_SUBMITTED:  'delivery_submitted',
  DELIVERED:           'delivered',
  COMPLETED:           'delivered',
  DELIVERY_COMPLETED_PENDING_APPROVAL: 'delivery_submitted',
  REJECTED:   'rejected',
  CANCELLED:  'cancelled',
  CANCELED:   'cancelled',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatMoney(amount: number, currency?: string): string {
  const cur = (currency || 'INR').toUpperCase();
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: cur }).format(amount || 0);
  } catch {
    return `₹${(amount || 0).toFixed(2)}`;
  }
}

function formatDate(value?: string): string {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

/** "2026-08" → "August 2026", used by the month filter label. */
function formatMonthLabel(value: string): string {
  if (!value) return 'Current Month';
  const [y, m] = value.split('-').map(Number);
  if (!y || !m) return 'Current Month';
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

/** Local (not UTC) YYYY-MM-DD for an order's createdAt, used by the calendar filter. */
function toLocalDateKey(value: string): string {
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Local (not UTC) YYYY-MM for an order's createdAt, used by the month filter. */
function toLocalMonthKey(value: string): string {
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/** Current month as 'YYYY-MM', in local time. */
function currentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Shift a 'YYYY-MM' key by `delta` months (can be negative). */
function shiftMonthKey(key: string, delta: number): string {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(y, (m - 1) + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function mapTimelineEntry(h: any): TimelineEntry {
  const rawStatus = String(h?.new_status ?? h?.status ?? '').toUpperCase();
  const changedBy = h?.changed_by;
  return {
    status: STATUS_API_TO_LOCAL[rawStatus] ?? rawStatus.toLowerCase().replace(/_/g, ' '),
    timestamp: h?.created_at ?? h?.createdAt ?? h?.changed_at ?? h?.timestamp ?? '',
    note: h?.remarks ?? h?.note ?? h?.reason ?? undefined,
    changedBy: changedBy?.name ?? (changedBy
      ? `${changedBy.first_name ?? ''} ${changedBy.last_name ?? ''}`.trim()
      : undefined),
  };
}

function normalizeOrder(raw: any): Order {
  const rawStatus = String(raw?.status ?? '').toUpperCase();
  const status: OrderStatus = STATUS_API_TO_LOCAL[rawStatus] ?? 'pending';

  const customer = raw?.customer ?? raw?.user ?? {};
  const firstName = customer?.first_name ?? customer?.firstName ?? '';
  const lastName  = customer?.last_name  ?? customer?.lastName  ?? '';
  const customerName =
    `${firstName} ${lastName}`.trim() ||
    customer?.name || customer?.full_name ||
    raw?.customer_name || 'Unknown Customer';
  const customerPhone =
    customer?.phone_no ?? customer?.phone ?? customer?.phone_number ?? raw?.customer_phone ?? '—';
  const customerEmail = customer?.email ?? raw?.customer_email ?? undefined;

  const rawDeliveryMethod = raw?.delivery_method ?? raw?.deliveryMethod;
  const deliveryMethodRaw = typeof rawDeliveryMethod === 'string'
    ? rawDeliveryMethod.trim().toUpperCase()
    : '';
  const isPickupOrder = deliveryMethodRaw === 'PICKUP';

  const address = raw?.delivery_address ?? raw?.address ?? {};
  const addressJson = raw?.delivery_address_json ?? {};
  const addressParts = [
    address?.street ?? address?.line1,
    address?.city,
    address?.state,
    address?.pincode ?? address?.zip_code ?? address?.postal_code,
    address?.country,
  ].filter(Boolean);
  const rawDeliveryAddress = raw?.delivery_address;
  const deliveryAddress =
    isPickupOrder
      ? (typeof rawDeliveryAddress === 'string' && rawDeliveryAddress.trim() !== ''
          ? rawDeliveryAddress
          : 'Pickup order')
      : typeof rawDeliveryAddress === 'string'
      ? rawDeliveryAddress
      : addressParts.length
      ? addressParts.join(', ')
      : (addressJson?.address_line1
          ? [addressJson.address_line1, addressJson.address_line2, addressJson.city, addressJson.state]
              .filter(Boolean).join(', ')
          : '—');

  // address_line2 (as built on the create-order form) packs "houseNo, street"
  // together — split it apart as a fallback when explicit fields aren't sent.
  const line2Raw = String(addressJson?.address_line2 ?? address?.address_line2 ?? '');
  const line2Parts = line2Raw.split(',').map((s: string) => s.trim()).filter(Boolean);

  const detailedAddress: DetailedAddress = {
    areaName: address?.area?.name ?? raw?.delivery_area?.name ?? addressJson?.area_name ?? undefined,
    block: address?.block ?? addressJson?.block ?? addressJson?.address_line1 ?? address?.address_line1 ?? undefined,
    houseNo: address?.house_no ?? address?.houseNo ?? address?.apartment ?? addressJson?.house_no ?? line2Parts[0] ?? undefined,
    street: address?.street ?? addressJson?.street ?? line2Parts[1] ?? undefined,
    country: address?.country ?? addressJson?.country ?? undefined,
    landmark: address?.landmark ?? addressJson?.landmark ?? undefined,
    addressNotes: address?.delivery_notes ?? address?.deliveryNotes ?? addressJson?.delivery_notes ?? undefined,
    addressLine1: addressJson?.address_line1 || undefined,
    addressLine2: addressJson?.address_line2 || undefined,
    city: addressJson?.city || undefined,
    state: addressJson?.state || undefined,
    pincode: addressJson?.pincode || undefined,
  };

  const items: OrderItem[] = (raw?.items ?? raw?.order_items ?? []).map((it: any, idx: number) => {
    const product    = it?.product ?? {};
    const customJson = it?.custom_json ?? {};
    return {
      id: String(it?.id ?? `item-${idx}`),
      productName: product?.name ?? it?.product_name ?? it?.name ?? 'Item',
      productDescription: product?.description ?? undefined,
      quantity: Number(it?.quantity ?? 1),
      price: Number(it?.price ?? product?.price ?? 0),
      addOnPriceTotal: Number(it?.add_on_total ?? customJson?.add_on_total ?? 0),
      lineTotal: it?.line_total != null ? Number(it.line_total) : undefined,
      selectedVariant: customJson?.variant_name ?? customJson?.variant ?? it?.variant ?? undefined,
      // Reads BOTH the American ("flavor_*") and British ("flavour_*") spellings.
      // The create-order form sends `flavor_name`/`flavor_id` — this used to
      // only look for `flavour_name`, which never matched, so flavour never
      // showed up here even though it was being saved correctly.
      selectedFlavour:
        customJson?.flavor_name ?? customJson?.flavour_name ??
        customJson?.flavor ?? customJson?.flavour ?? it?.flavour ?? undefined,
      selectedAddOns:  customJson?.addons ?? customJson?.add_ons ?? it?.add_ons ?? [],
      imageUrl: product?.image_url ?? product?.imageUrl ?? undefined,
    };
  });

  let subtotal = Number(raw?.subtotal ?? raw?.sub_total ?? 0);
  if (!subtotal) {
    subtotal = items.reduce(
      (sum, it) => sum + (it.lineTotal ?? (it.price + it.addOnPriceTotal) * it.quantity),
      0
    );
  }

  const discount       = Number(raw?.discount ?? 0);
  const deliveryCharge = Number(raw?.delivery_charge ?? raw?.delivery_fee ?? 0);
  let   total          = Number(raw?.total ?? raw?.grand_total ?? 0);
  if (!total) total    = subtotal - discount + deliveryCharge;

  const currency      = String(raw?.currency ?? 'INR').toUpperCase();
  const paymentMethod = String(raw?.payment_method ?? 'N/A').toUpperCase();
  const timeline: TimelineEntry[] = (raw?.history ?? raw?.timeline ?? []).map(mapTimelineEntry);

  // ── Order origin: who created / logged the order ──
  const createdBy      = raw?.created_by ?? {};
  const createdByName  = createdBy?.name
    ?? `${createdBy?.first_name ?? ''} ${createdBy?.last_name ?? ''}`.trim()
    ?? undefined;
  const createdByRole  = createdBy?.role ?? undefined;
  const createdByPhone = createdBy?.phone_no ?? undefined;
  const createdByEmail = createdBy?.email ?? undefined;
  const orderSource    = raw?.order_source ?? undefined;
  const orderTypeRaw   = String(raw?.order_type ?? '').toLowerCase();
  const isSalesAgentOrder =
    createdByRole === 'SALES_AGENT' ||
    orderSource === 'SALES_AGENT' ||
    orderTypeRaw === 'sales_agent' ||
    orderTypeRaw === 'agent_order';

  // ── Custom cake order — mirrors exactly what the create-order form sends:
  //     product_name, image, shape, flavour, variant, price, message.
  const customCakeRaw = raw?.custom_cake_json ?? raw?.custom_cake ?? null;
  const isCustomCakeOrder = !!customCakeRaw;
  const customCake: CustomCakeDetails | null = customCakeRaw ? {
    productName: customCakeRaw?.product_name || customCakeRaw?.productName || undefined,
    image:       customCakeRaw?.image || undefined,
    shape:       customCakeRaw?.shape || undefined,
    flavour:     customCakeRaw?.flavour || undefined,
    variant:     customCakeRaw?.variant || undefined,
    price:       customCakeRaw?.price != null ? Number(customCakeRaw.price) : undefined,
    message:     customCakeRaw?.message || undefined,
  } : null;

  const deliveryDate     = raw?.delivery_date ?? raw?.pickup_date ?? undefined;
  const deliveryTimeSlot = raw?.delivery_time_slot ?? raw?.pickup_time_slot ?? undefined;
  const deliveryMethod   = deliveryMethodRaw || undefined;

  const greetingTo      = raw?.greeting_to ?? undefined;
  const greetingFrom    = raw?.greeting_from ?? undefined;
  const greetingMessage = raw?.greeting_message ?? undefined;

  return {
    id: String(raw?.id ?? ''),
    orderNumber: raw?.order_number ?? undefined,
    customerName,
    customerPhone,
    customerEmail,
    deliveryAddress,
    detailedAddress,
    items,
    subtotal,
    discount,
    deliveryCharge,
    total,
    currency,
    status,
    rawStatus,
    paymentMethod,
    paymentStatus:    raw?.payment_status ?? undefined,
    orderType:        raw?.order_type ?? undefined,
    loyaltyCoupon:    raw?.loyalty_coupon ?? undefined,
    rejectionReason:  raw?.rejection_reason ?? undefined,
    notes:            raw?.notes ?? raw?.delivery_notes ?? undefined,
    createdAt:        raw?.created_at ?? raw?.createdAt ?? new Date().toISOString(),
    timeline,

    createdByName,
    createdByRole,
    createdByPhone,
    createdByEmail,
    orderSource,
    isSalesAgentOrder,
    deliveryMethod,

    customCake,
    isCustomCakeOrder,

    deliveryDate,
    deliveryTimeSlot,

    greetingTo,
    greetingFrom,
    greetingMessage,
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, width = '500px' }) => {
  if (!isOpen) return null;
  return (
    <div className="sao-modal-overlay" onClick={onClose}>
      <div className="sao-modal-content" style={{ maxWidth: width }} onClick={e => e.stopPropagation()}>
        <div className="sao-modal-header">
          <h3>{title}</h3>
          <button className="sao-modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="sao-modal-body">{children}</div>
      </div>
    </div>
  );
};

/**
 * Maps a customer-facing stage index (from getCustomerStageIndex) to the
 * existing badge CSS classes, so the visual styling (colors) stays the
 * same as before — only the label text and terminal states change.
 */
const stageClassName = (raw: string): string => {
  const s = (raw || '').trim().toUpperCase();
  if (s === 'CANCELLED' || s === 'REJECTED') return 'status-cancelled';

  switch (getCustomerStageIndex(s)) {
    case 0: return 'status-pending';     // Order Placed
    case 1: return 'status-confirmed';   // Accepted
    case 2: return 'status-processing';  // Kitchen Assigned - Processing
    case 3: return 'status-ready';       // Ready
    case 4: return 'status-ontheway';    // Out for Delivery
    case 5: return 'status-delivered';   // Delivered
    default: return 'status-default';
  }
};

/**
 * Status badge — now driven by the customer-facing 6-stage mapping in
 * utils/customerOrderStatus.ts instead of the internal STATUS_CONFIG map.
 * Always pass the order's `rawStatus` (raw backend value) here, NOT the
 * local lowercase `status` enum, since the mapping keys are uppercase
 * backend statuses (e.g. 'ASSIGNED_TO_KITCHEN').
 */
const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span className={`sao-status-badge ${stageClassName(status)}`}>
    <span className="badge-dot" />{getCustomerStatusLabel(status)}
  </span>
);

// Shows PICKUP vs DELIVERY as its own chip so it's visible even without the row tint
const DeliveryMethodBadge: React.FC<{ method?: string }> = ({ method }) => {
  const m = (method || '').toUpperCase();
  if (m === 'PICKUP') {
    return <span className="sao-method-badge method-pickup">Pickup</span>;
  }
  return <span className="sao-method-badge method-delivery">Delivery</span>;
};

const PaymentStatusChip: React.FC<{ status: string | undefined }> = ({ status }) => {
  if (!status) return null;
  const s = status.toUpperCase();
  const className = s === 'PAID' || s === 'COMPLETED'
    ? 'sao-payment-status-chip chip-paid'
    : s === 'FAILED'
    ? 'sao-payment-status-chip chip-failed'
    : 'sao-payment-status-chip chip-pending';
  return <span className={className}>{status}</span>;
};

/** Small stat card used on the Monthly Analytics tab. */
interface AnalyticsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: 'default' | 'positive' | 'warning' | 'negative';
}
const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ icon, label, value, tone = 'default' }) => (
  <div className={`sao-analytics-card tone-${tone}`}>
    <div className="sao-analytics-icon">{icon}</div>
    <div className="sao-analytics-text">
      <span className="sao-analytics-value">{value}</span>
      <span className="sao-analytics-label">{label}</span>
    </div>
  </div>
);

/** Aligned label/value row used throughout the receipt — keeps every
 * line lining up on the right edge no matter how long the text is. */
const ReceiptRow: React.FC<{
  label: string;
  value: React.ReactNode;
  strong?: boolean;
  big?: boolean;
  tone?: 'discount';
}> = ({ label, value, strong, big, tone }) => (
  <div className={`sao-rcpt-row ${strong ? 'is-strong' : ''} ${big ? 'is-big' : ''} ${tone === 'discount' ? 'is-discount' : ''}`}>
    <span className="sao-rcpt-row-label">{label}</span>
    <span className="sao-rcpt-row-dots" aria-hidden="true" />
    <span className="sao-rcpt-row-value">{value}</span>
  </div>
);

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  align?: 'left' | 'center' | 'right';
  width?: string;
}
interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  rowClassName?: (row: T) => string;
}
function DataTable<T extends { id: string }>({
  columns, data, emptyMessage = 'No items found', rowClassName,
}: DataTableProps<T>) {
  return (
    <div className="sao-table-card">
      <div className="sao-table-container">
        <table className="sao-data-table">
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i} style={{ textAlign: col.align || 'left', width: col.width || 'auto' }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? data.map(row => (
              <tr key={row.id} className={rowClassName ? rowClassName(row) : undefined}>
                {columns.map((col, ci) => {
                  const cell = typeof col.accessor === 'function'
                    ? col.accessor(row)
                    : (row[col.accessor] as React.ReactNode);
                  return <td key={ci} style={{ textAlign: col.align || 'left' }}>{cell}</td>;
                })}
              </tr>
            )) : (
              <tr>
                <td colSpan={columns.length} className="sao-empty-table-cell">
                  <p>{emptyMessage}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type PageTab = 'all' | 'monthly';

const Salesagentorder: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Tabs: All Orders / Monthly Analytics ──
  const [activeTab, setActiveTab] = useState<PageTab>('all');

  // ── Calendar (exact day) filter — used on the "All Orders" tab ──
  const [calendarDate, setCalendarDate] = useState<string>('');            // 'YYYY-MM-DD'
  const allTabDateInputRef = useRef<HTMLInputElement>(null);

  // ── Month-wise navigation — used on the "Monthly Analytics" tab ──
  const [monthFilter, setMonthFilter] = useState<string>(currentMonthKey()); // 'YYYY-MM', defaults to current month

  const [fullDetailsOrderId, setFullDetailsOrderId] = useState<string | null>(null);
  const [receiptOrderId, setReceiptOrderId] = useState<string | null>(null);

  // ── Payment link / QR ──
  const [paymentOrderId, setPaymentOrderId] = useState<string | null>(null);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await getSalesAgentOrders();
      const normalized = (raw ?? []).map(normalizeOrder);
      setOrders(normalized);
    } catch (err) {
      console.error('Failed to fetch sales agent orders:', err);
      setError('Failed to load orders. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Lazy-load timeline when a full-details modal is opened
  useEffect(() => {
    if (!fullDetailsOrderId) return;
    const current = orders.find(o => o.id === fullDetailsOrderId);
    if (!current || current.timeline.length > 0) return;
    let cancelled = false;
    (async () => {
      try {
        const history = await getOrderHistory(Number(fullDetailsOrderId));
        if (!cancelled && Array.isArray(history) && history.length > 0) {
          setOrders(prev =>
            prev.map(o => o.id === fullDetailsOrderId ? { ...o, timeline: history.map(mapTimelineEntry) } : o)
          );
        }
      } catch { /* non-fatal */ }
    })();
    return () => { cancelled = true; };
  }, [fullDetailsOrderId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── ALL ORDERS tab: every sales-agent order, optionally filtered to one exact day ──
  const allTabOrders = orders.filter(o => {
    if (calendarDate) return toLocalDateKey(o.createdAt) === calendarDate;
    return true;
  });

  // ── MONTHLY tab: orders for the selected month ──
  const monthlyTabOrders = orders.filter(o => toLocalMonthKey(o.createdAt) === monthFilter);

  // ── Monthly analytics, derived from monthlyTabOrders ──
  const analytics = useMemo(() => {
    const totalOrders = monthlyTabOrders.length;
    const totalRevenue = monthlyTabOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const delivered = monthlyTabOrders.filter(o => o.status === 'delivered').length;
    const cancelled = monthlyTabOrders.filter(o => ['cancelled', 'rejected'].includes(o.status)).length;
    const active = totalOrders - delivered - cancelled;
    const itemsSold = monthlyTabOrders.reduce(
      (sum, o) => sum + o.items.reduce((a, it) => a + it.quantity, 0), 0
    );
    const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;
    const currency = monthlyTabOrders[0]?.currency ?? orders[0]?.currency ?? 'INR';
    return { totalOrders, totalRevenue, delivered, cancelled, active, itemsSold, avgOrderValue, currency };
  }, [monthlyTabOrders, orders]);

  const fullDetailsOrder = orders.find(o => o.id === fullDetailsOrderId);
  const receiptOrder = orders.find(o => o.id === receiptOrderId);
  const paymentOrder = orders.find(o => o.id === paymentOrderId);

  // Row tint helper — blue for pickup, green for delivery
  const getRowClassName = (row: Order) => {
    const method = (row.deliveryMethod || '').toUpperCase();
    return method === 'PICKUP' ? 'sao-row-pickup' : 'sao-row-delivery';
  };

  // ── All Orders tab: calendar (exact day) picker ──
  // Clicking the button opens the browser's native calendar directly via
  // showPicker() instead of requiring the agent to type a date manually.
  const openCalendarPicker = () => {
    const el = allTabDateInputRef.current;
    if (!el) return;
    if (typeof (el as any).showPicker === 'function') {
      (el as any).showPicker();
    } else {
      el.focus();
    }
  };
  const handleCalendarDateChange = (value: string) => setCalendarDate(value);
  const clearCalendarDate = () => setCalendarDate('');

  // ── Monthly tab: prev / next / current month navigation ──
  const goToPrevMonth = () => setMonthFilter(prev => shiftMonthKey(prev, -1));
  const goToNextMonth = () => setMonthFilter(prev => shiftMonthKey(prev, 1));
  const goToCurrentMonth = () => setMonthFilter(currentMonthKey());
  const isCurrentMonth = monthFilter === currentMonthKey();

  // ── Payment link / QR handlers ──
  const handleOpenPayment = async (orderId: string) => {
    setPaymentOrderId(orderId);
    setPaymentLink(null);
    setPaymentError(null);
    setLinkCopied(false);
    setPaymentLoading(true);
    try {
      const result = await createPaymentLink(Number(orderId));
      if (result?.success === false) {
        setPaymentError(result?.error || 'Unable to generate payment link.');
      } else if (result?.payment_url) {
        setPaymentLink(result.payment_url);
      } else {
        setPaymentError('Payment link was not returned by the server.');
      }
    } catch (err: any) {
      console.error('Failed to create payment link:', err);
      setPaymentError(
        err?.response?.data?.error || 'Failed to generate payment link. Please try again.'
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!paymentLink) return;
    try {
      await navigator.clipboard.writeText(paymentLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      /* clipboard unavailable, ignore */
    }
  };

  const closePaymentModal = () => {
    setPaymentOrderId(null);
    setPaymentLink(null);
    setPaymentError(null);
    setPaymentLoading(false);
  };

  // Shared table columns used by both tabs
  const orderColumns: Column<Order>[] = [
    {
      header: 'Order #',
      accessor: (row: Order) => (
        <div className="sao-order-id-cell">
          <strong className="sao-order-id">{row.orderNumber ?? row.id}</strong>
          <span className="sao-agent-tag">
            <UserCheck size={10} /> {row.createdByName || 'Sales Agent'}
          </span>
        </div>
      ),
    },
    {
      header: 'Time',
      accessor: (row: Order) =>
        new Date(row.createdAt).toLocaleString([], {
          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
        }),
    },
    {
      header: 'Customer',
      accessor: (row: Order) => (
        <div className="sao-cust-cell">
          <span className="sao-cust-name">{row.customerName}</span>
          <span className="sao-cust-sub">{row.customerPhone}</span>
        </div>
      ),
    },
    {
      header: 'Fulfilment',
      accessor: (row: Order) => <DeliveryMethodBadge method={row.deliveryMethod} />,
    },
    {
      header: 'Items',
      accessor: (row: Order) =>
        `${row.items.reduce((acc, i) => acc + i.quantity, 0)} item(s)`,
    },
    {
      header: 'Total',
      accessor: (row: Order) => <strong>{formatMoney(row.total, row.currency)}</strong>,
    },
    {
      header: 'Payment',
      accessor: (row: Order) => (
        <div className="sao-cust-cell">
          <span className="sao-cust-name">{row.paymentMethod}</span>
          {row.paymentStatus && <PaymentStatusChip status={row.paymentStatus} />}
        </div>
      ),
    },
    {
      header: 'Status',
      // Pass rawStatus (raw backend value) — StatusBadge maps it through
      // the customer-facing 6-stage labels from utils/customerOrderStatus.ts
      accessor: (row: Order) => <StatusBadge status={row.rawStatus} />,
    },
    {
      header: 'Actions',
      accessor: (row: Order) => (
        <div className="sao-actions-cell">
          <button
            className="sao-icon-btn"
            title="View full order details"
            onClick={() => setFullDetailsOrderId(row.id)}
          >
            <Eye size={17} />
          </button>
          <button
            className="sao-icon-btn"
            title="Print receipt"
            onClick={() => setReceiptOrderId(row.id)}
          >
            <Printer size={17} />
          </button>
          {/* Payment link/QR is always available, even when the order is already paid,
              so the agent can still resend or re-view the link. */}
          <button
            className="sao-icon-btn"
            title={
              row.paymentStatus?.toUpperCase() === 'PAID'
                ? 'View payment link (already paid)'
                : 'Generate payment link & QR'
            }
            onClick={() => handleOpenPayment(row.id)}
          >
            <CreditCard size={17} />
          </button>
        </div>
      ),
      align: 'right',
    },
  ];

  return (
    <div className="sao-page-container">

      {/* Header */}
      <header className="sao-header">
        <p className="sao-eyebrow">Sales Agent Orders</p>
        <h1 className="sao-title">Orders Logged by Sales Agents</h1>
      </header>

      {/* Error banner */}
      {error && (
        <div className="sao-error-banner">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button className="sao-error-retry-btn" onClick={() => setError(null)}>Dismiss</button>
          <button className="sao-error-retry-btn" onClick={fetchOrders}>Retry</button>
        </div>
      )}

      {/* ══════ TABS ══════ */}
      <div className="sao-tabs-row">
        <button
          className={`sao-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <LayoutGrid size={15} /> All Orders
          <span className="sao-tab-count">{orders.length}</span>
        </button>
        <button
          className={`sao-tab-btn ${activeTab === 'monthly' ? 'active' : ''}`}
          onClick={() => setActiveTab('monthly')}
        >
          <CalendarClock size={15} /> Monthly Analytics
        </button>
      </div>

      {/* ══════ ALL ORDERS TAB ══════ */}
      {activeTab === 'all' && (
        <>
          {/* Calendar (exact day) filter — click opens the native calendar directly */}
          <div className="sao-date-filters-row">
            <div className="sao-date-filter-group">
              <button
                type="button"
                className={`sao-icon-btn sao-date-filter-toggle ${calendarDate ? 'active' : ''}`}
                title="Pick a date to filter orders"
                onClick={openCalendarPicker}
              >
                <Calendar size={16} />
                <span>{calendarDate ? formatDate(calendarDate) : 'Pick a Date'}</span>
              </button>
              <input
                ref={allTabDateInputRef}
                type="date"
                className="sao-date-input"
                value={calendarDate}
                onChange={(e) => handleCalendarDateChange(e.target.value)}
              />
              {calendarDate && (
                <button type="button" className="sao-filter-clear-btn" onClick={clearCalendarDate} title="Clear date, show all orders">
                  <X size={12} /> Clear
                </button>
              )}
            </div>
          </div>

          {/* Legend so the row-tint meaning is obvious */}
          <div className="sao-legend-row">
            <span className="sao-legend-item">
              <span className="sao-legend-swatch swatch-pickup" /> Pickup order
            </span>
            <span className="sao-legend-item">
              <span className="sao-legend-swatch swatch-delivery" /> Delivery order
            </span>
          </div>

          {loading && orders.length === 0 ? (
            <div className="sao-loading-state">
              <Loader2 size={22} className="sao-spin" />
              <p>Loading sales agent orders…</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="sao-empty-state">
              <UserCheck size={32} />
              <p>No sales agent orders found yet.</p>
            </div>
          ) : (
            <div className="sao-grid">
              <DataTable
                rowClassName={getRowClassName}
                columns={orderColumns}
                data={allTabOrders}
                emptyMessage={calendarDate ? `No orders placed on ${formatDate(calendarDate)}.` : 'No sales agent orders found.'}
              />
            </div>
          )}
        </>
      )}

      {/* ══════ MONTHLY ANALYTICS TAB ══════ */}
      {activeTab === 'monthly' && (
        <>
          {/* Month navigation — defaults to the current month, prev/next moves it */}
          <div className="sao-month-nav-row">
            <div className="sao-month-nav-group">
              <button type="button" className="sao-icon-btn" title="Previous month" onClick={goToPrevMonth}>
                <ChevronLeft size={18} />
              </button>

              <span className="sao-month-nav-label">{formatMonthLabel(monthFilter)}</span>

              <button type="button" className="sao-icon-btn" title="Next month" onClick={goToNextMonth}>
                <ChevronRight size={18} />
              </button>

              {!isCurrentMonth && (
                <button type="button" className="sao-filter-clear-btn sao-today-btn" onClick={goToCurrentMonth}>
                  This Month
                </button>
              )}
            </div>
          </div>

          {/* Analytics summary cards */}
          <div className="sao-analytics-grid">
            <AnalyticsCard icon={<Package size={18} />} label="Total Orders" value={String(analytics.totalOrders)} />
            <AnalyticsCard icon={<TrendingUp size={18} />} label="Total Revenue" value={formatMoney(analytics.totalRevenue, analytics.currency)} tone="positive" />
            <AnalyticsCard icon={<CreditCard size={18} />} label="Avg. Order Value" value={formatMoney(analytics.avgOrderValue, analytics.currency)} />
            {/* <AnalyticsCard icon={<Cake size={18} />} label="Items Sold" value={String(analytics.itemsSold)} /> */}
            <AnalyticsCard icon={<ListChecks size={18} />} label="Delivered" value={String(analytics.delivered)} tone="positive" />
            <AnalyticsCard icon={<Loader2 size={18} />} label="Active / In Progress" value={String(analytics.active)} tone="warning" />
            <AnalyticsCard icon={<XCircle size={18} />} label="Cancelled / Rejected" value={String(analytics.cancelled)} tone="negative" />
          </div>

          {loading && orders.length === 0 ? (
            <div className="sao-loading-state">
              <Loader2 size={22} className="sao-spin" />
              <p>Loading sales agent orders…</p>
            </div>
          ) : (
            <div className="sao-grid">
              <DataTable
                rowClassName={getRowClassName}
                columns={orderColumns}
                data={monthlyTabOrders}
                emptyMessage={`No orders placed in ${formatMonthLabel(monthFilter)}.`}
              />
            </div>
          )}
        </>
      )}

      {/* ══════ FULL DETAILS MODAL (read-only, no actions) ══════ */}
      <Modal
        isOpen={!!fullDetailsOrder}
        onClose={() => setFullDetailsOrderId(null)}
        title={`Order Details — ${fullDetailsOrder?.orderNumber ?? fullDetailsOrder?.id ?? ''}`}
        width="640px"
      >
        {fullDetailsOrder && (
          <div className="sao-fd-body">

            <div className="sao-fd-top-row">
              <StatusBadge status={fullDetailsOrder.rawStatus} />
              {fullDetailsOrder.paymentStatus && <PaymentStatusChip status={fullDetailsOrder.paymentStatus} />}
              <DeliveryMethodBadge method={fullDetailsOrder.deliveryMethod} />
              <span className="sao-origin-badge">
                <UserCheck size={11} /> Sales Agent Order
              </span>
              {fullDetailsOrder.isCustomCakeOrder && (
                <span className="sao-origin-badge badge-custom">
                  <Cake size={11} /> Custom Order
                </span>
              )}
            </div>

            <div className="sao-fd-section sao-fd-highlight">
              <h4><UserCheck size={14} /> Order Origin</h4>
              <div className="sao-fd-grid">
                <div><span className="lbl">Placed by</span><span>{fullDetailsOrder.createdByName ?? '—'}</span></div>
                <div><span className="lbl">Role</span><span>{fullDetailsOrder.createdByRole ?? '—'}</span></div>
                <div><span className="lbl">Phone</span><span>{fullDetailsOrder.createdByPhone ?? '—'}</span></div>
                <div><span className="lbl">Email</span><span>{fullDetailsOrder.createdByEmail ?? '—'}</span></div>
              </div>
            </div>

            {/* Expected date & time — shown for BOTH pickup and delivery orders */}
            <div className="sao-fd-section sao-fd-highlight">
              <h4><CalendarClock size={14} /> {fullDetailsOrder.deliveryMethod === 'PICKUP' ? 'Pickup Schedule' : 'Delivery Schedule'}</h4>
              <div className="sao-fd-grid">
                <div>
                  <span className="lbl">{fullDetailsOrder.deliveryMethod === 'PICKUP' ? 'Pickup Date' : 'Delivery Date'}</span>
                  <span>{formatDate(fullDetailsOrder.deliveryDate)}</span>
                </div>
                <div>
                  <span className="lbl">{fullDetailsOrder.deliveryMethod === 'PICKUP' ? 'Pickup Time' : 'Delivery Time'}</span>
                  <span>{fullDetailsOrder.deliveryTimeSlot ?? '—'}</span>
                </div>
              </div>
            </div>

            <div className="sao-fd-section">
              <h4>Customer</h4>
              <div className="sao-fd-grid">
                <div><span className="lbl">Name</span><span>{fullDetailsOrder.customerName}</span></div>
                <div><span className="lbl">Phone</span><span>{fullDetailsOrder.customerPhone}</span></div>
                <div><span className="lbl">Email</span><span>{fullDetailsOrder.customerEmail ?? '—'}</span></div>
              </div>
            </div>

            {/* Full address block — every field captured on the create-order form */}
            {fullDetailsOrder.deliveryMethod !== 'PICKUP' && (
              <div className="sao-fd-section sao-fd-highlight">
                <h4>Address</h4>
                <div className="sao-fd-grid">
                  <div><span className="lbl">Area</span><span>{fullDetailsOrder.detailedAddress?.areaName ?? '—'}</span></div>
                  <div><span className="lbl">Block</span><span>{fullDetailsOrder.detailedAddress?.block ?? '—'}</span></div>
                  <div><span className="lbl">House / Flat No</span><span>{fullDetailsOrder.detailedAddress?.houseNo ?? '—'}</span></div>
                  <div><span className="lbl">Street</span><span>{fullDetailsOrder.detailedAddress?.street ?? '—'}</span></div>
                  <div><span className="lbl">Country</span><span>{fullDetailsOrder.detailedAddress?.country ?? '—'}</span></div>
                  <div><span className="lbl">Landmark</span><span>{fullDetailsOrder.detailedAddress?.landmark ?? '—'}</span></div>
                </div>
                <p><strong>Delivery Notes:</strong> {fullDetailsOrder.detailedAddress?.addressNotes ?? '—'}</p>
              </div>
            )}

            <div className="sao-fd-section">
              <h4>Ordered Products</h4>
              {fullDetailsOrder.items.length > 0 ? (
                <div className="sao-fd-items-list">
                  {fullDetailsOrder.items.map(item => (
                    <div key={item.id} className="sao-fd-item-row">
                      {item.imageUrl && <img src={item.imageUrl} alt={item.productName} className="sao-fd-item-thumb" />}
                      <div className="sao-fd-item-info">
                        <strong>{item.productName}</strong>
                        <div className="sao-fd-item-meta">
                          <span>Qty: {item.quantity}</span>
                          <span>Unit: {formatMoney(item.price, fullDetailsOrder.currency)}</span>
                          {item.selectedVariant && <span>Variant: {item.selectedVariant}</span>}
                          {item.selectedFlavour && <span>Flavour: {item.selectedFlavour}</span>}
                          {item.selectedAddOns.length > 0 && <span>Add-ons: {item.selectedAddOns.join(', ')}</span>}
                        </div>
                      </div>
                      <span className="sao-fd-item-total">
                        {formatMoney(item.lineTotal ?? (item.price + item.addOnPriceTotal) * item.quantity, fullDetailsOrder.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="sao-muted">No standard catalog items (custom cake order below).</p>
              )}
            </div>

            {/* Custom cake block — ONLY the fields captured on the create-order
                form: product name, image, shape, flavour, variant, price, message. */}
            {fullDetailsOrder.isCustomCakeOrder && fullDetailsOrder.customCake && (
              <div className="sao-fd-section sao-fd-highlight-cake">
                <h4><Cake size={14} /> Custom Cake Details</h4>
                <div className="sao-fd-cake-body">
                  {fullDetailsOrder.customCake.image && (
                    <img src={fullDetailsOrder.customCake.image} alt="Custom cake reference" className="sao-fd-cake-image" />
                  )}
                  <div className="sao-fd-grid">
                    <div><span className="lbl">Product Name</span><span>{fullDetailsOrder.customCake.productName ?? '—'}</span></div>
                    <div><span className="lbl">Shape</span><span>{fullDetailsOrder.customCake.shape ?? '—'}</span></div>
                    <div><span className="lbl">Flavour</span><span>{fullDetailsOrder.customCake.flavour ?? '—'}</span></div>
                    <div><span className="lbl">Variant</span><span>{fullDetailsOrder.customCake.variant ?? '—'}</span></div>
                    <div><span className="lbl">Custom Price</span><span>{fullDetailsOrder.customCake.price != null ? formatMoney(fullDetailsOrder.customCake.price, fullDetailsOrder.currency) : '—'}</span></div>
                  </div>
                  {fullDetailsOrder.customCake.message && (
                    <p className="sao-fd-cake-message"><strong>Message:</strong> "{fullDetailsOrder.customCake.message}"</p>
                  )}
                </div>
              </div>
            )}

            {(fullDetailsOrder.greetingMessage || fullDetailsOrder.greetingTo) && (
              <div className="sao-fd-section sao-fd-highlight-greeting">
                <h4><Gift size={14} /> Greeting Card</h4>
                <div className="sao-fd-grid">
                  <div><span className="lbl">To</span><span>{fullDetailsOrder.greetingTo ?? '—'}</span></div>
                  <div><span className="lbl">From</span><span>{fullDetailsOrder.greetingFrom ?? '—'}</span></div>
                </div>
                {fullDetailsOrder.greetingMessage && (
                  <p className="sao-fd-greeting-message">
                    <Sparkles size={13} /> "{fullDetailsOrder.greetingMessage}"
                  </p>
                )}
              </div>
            )}

            <div className="sao-fd-section">
              <h4>Payment &amp; Pricing</h4>
              <div className="sao-fd-grid">
                <div><span className="lbl">Method</span><span>{fullDetailsOrder.paymentMethod}</span></div>
                <div><span className="lbl">Status</span><span>{fullDetailsOrder.paymentStatus ?? '—'}</span></div>
                <div><span className="lbl">Currency</span><span>{fullDetailsOrder.currency}</span></div>
              </div>
              <div className="sao-cost-breakdown">
                <div className="sao-cost-row"><span>Subtotal:</span><span>{formatMoney(fullDetailsOrder.subtotal, fullDetailsOrder.currency)}</span></div>
                {fullDetailsOrder.discount > 0 && (
                  <div className="sao-cost-row discount">
                    <span>Discount:</span>
                    <span>-{formatMoney(fullDetailsOrder.discount, fullDetailsOrder.currency)}</span>
                  </div>
                )}
                <div className="sao-cost-row"><span>Delivery:</span><span>{formatMoney(fullDetailsOrder.deliveryCharge, fullDetailsOrder.currency)}</span></div>
                <div className="sao-cost-row total"><span>Grand Total:</span><span>{formatMoney(fullDetailsOrder.total, fullDetailsOrder.currency)}</span></div>
              </div>
            </div>

            <div className="sao-fd-actions-row">
              <button
                className="sao-btn sao-btn-secondary"
                onClick={() => { setReceiptOrderId(fullDetailsOrder.id); setFullDetailsOrderId(null); }}
              >
                <Printer size={13} /> Print Receipt
              </button>
              {/* Payment button no longer disabled once paid — agent can still open/resend the link */}
              <button
                className="sao-btn sao-btn-primary"
                onClick={() => { handleOpenPayment(fullDetailsOrder.id); setFullDetailsOrderId(null); }}
              >
                <CreditCard size={13} /> Payment
              </button>
            </div>

          </div>
        )}
      </Modal>

      {/* ══════ RECEIPT MODAL — aligned rows + customization details ══════ */}
      <Modal
        isOpen={!!receiptOrder}
        onClose={() => setReceiptOrderId(null)}
        title="Print Receipt"
        width="400px"
      >
        {receiptOrder && (
          <div className="sao-rcpt-sheet">

            <div className="sao-rcpt-logo-wrap">
              <img  src="/assets/logo.png" alt="CakeNTake" className="sao-rcpt-logo" />
            </div>
            <div className="sao-rcpt-title">ORDER RECEIPT</div>
            <div className="sao-rcpt-rule sao-rcpt-rule--dashed" />

            {/* Order meta */}
            <div className="sao-rcpt-block">
              <ReceiptRow label="Order No" value={receiptOrder.orderNumber ?? receiptOrder.id} strong />
              <ReceiptRow label="Date" value={new Date(receiptOrder.createdAt).toLocaleDateString()} />
              <ReceiptRow label="Time" value={new Date(receiptOrder.createdAt).toLocaleTimeString()} />
              <ReceiptRow
                label="Fulfilment"
                value={(receiptOrder.deliveryMethod || 'DELIVERY').toUpperCase() === 'PICKUP' ? 'Pickup' : 'Delivery'}
              />
            </div>
            <div className="sao-rcpt-rule sao-rcpt-rule--dashed" />

            {/* Customer + payment */}
            <div className="sao-rcpt-block">
              <ReceiptRow label="Customer" value={receiptOrder.customerName} />
              <ReceiptRow label="Phone" value={receiptOrder.customerPhone} />
              <ReceiptRow label="Payment" value={receiptOrder.paymentMethod} />
              {receiptOrder.paymentStatus && (
                <ReceiptRow
                  label="Payment Status"
                  value={<span className={`sao-rcpt-pay-chip is-${receiptOrder.paymentStatus.toLowerCase()}`}>{receiptOrder.paymentStatus}</span>}
                />
              )}
            </div>
            <div className="sao-rcpt-rule sao-rcpt-rule--dashed" />

            {/* Items */}
            <div className="sao-rcpt-block">
              {receiptOrder.items.length > 0 ? (
                receiptOrder.items.map(item => (
                  <div key={item.id} className="sao-rcpt-item">
                    <div className="sao-rcpt-item-main">
                      <span className="sao-rcpt-item-name">{item.quantity} × {item.productName}</span>
                      <span className="sao-rcpt-item-amount">
                        {formatMoney(item.lineTotal ?? (item.price + item.addOnPriceTotal) * item.quantity, receiptOrder.currency)}
                      </span>
                    </div>
                    {(item.selectedVariant || item.selectedFlavour || item.selectedAddOns.length > 0) && (
                      <div className="sao-rcpt-item-meta">
                        {item.selectedVariant && <span>Variant: {item.selectedVariant}</span>}
                        {item.selectedFlavour && <span>Flavour: {item.selectedFlavour}</span>}
                        {item.selectedAddOns.length > 0 && <span>Add-ons: {item.selectedAddOns.join(', ')}</span>}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="sao-rcpt-muted">No standard catalog items (see customization below).</p>
              )}
            </div>

            {/* Custom cake customization — now visible on the receipt */}
            {receiptOrder.isCustomCakeOrder && receiptOrder.customCake && (
              <>
                <div className="sao-rcpt-rule sao-rcpt-rule--dashed" />
                <div className="sao-rcpt-block sao-rcpt-custom-block">
                  <div className="sao-rcpt-block-label"><Cake size={12} /> Customization Details</div>
                  {/* {receiptOrder.customCake.image && (
                    <img src={receiptOrder.customCake.image} alt="Custom cake reference" className="sao-rcpt-custom-image" />
                  )} */}
                  <ReceiptRow label="Product" value={receiptOrder.customCake.productName ?? '—'} />
                  <ReceiptRow label="Shape" value={receiptOrder.customCake.shape ?? '—'} />
                  <ReceiptRow label="Flavour" value={receiptOrder.customCake.flavour ?? '—'} />
                  <ReceiptRow label="Variant" value={receiptOrder.customCake.variant ?? '—'} />
                  {receiptOrder.customCake.price != null && (
                    <ReceiptRow label="Custom Price" value={formatMoney(receiptOrder.customCake.price, receiptOrder.currency)} />
                  )}
                  {receiptOrder.customCake.message && (
                    <p className="sao-rcpt-message">"{receiptOrder.customCake.message}"</p>
                  )}
                </div>
              </>
            )}

            {/* Greeting card */}
            {(receiptOrder.greetingMessage || receiptOrder.greetingTo) && (
              <>
                <div className="sao-rcpt-rule sao-rcpt-rule--dashed" />
                <div className="sao-rcpt-block">
                  <div className="sao-rcpt-block-label"><Gift size={12} /> Greeting Card</div>
                  <ReceiptRow label="To" value={receiptOrder.greetingTo ?? '—'} />
                  <ReceiptRow label="From" value={receiptOrder.greetingFrom ?? '—'} />
                  {receiptOrder.greetingMessage && (
                    <p className="sao-rcpt-message">"{receiptOrder.greetingMessage}"</p>
                  )}
                </div>
              </>
            )}

            <div className="sao-rcpt-rule sao-rcpt-rule--dashed" />

            {/* Totals */}
            <div className="sao-rcpt-block sao-rcpt-totals">
              <ReceiptRow label="Subtotal" value={formatMoney(receiptOrder.subtotal, receiptOrder.currency)} />
              {receiptOrder.discount > 0 && (
                <ReceiptRow label="Discount" value={`-${formatMoney(receiptOrder.discount, receiptOrder.currency)}`} tone="discount" />
              )}
              <ReceiptRow label="Delivery" value={formatMoney(receiptOrder.deliveryCharge, receiptOrder.currency)} />
              <div className="sao-rcpt-rule sao-rcpt-rule--solid" />
              <ReceiptRow label="Grand Total" value={formatMoney(receiptOrder.total, receiptOrder.currency)} strong big />
            </div>

            <div className="sao-rcpt-rule sao-rcpt-rule--dashed" />
            <p className="sao-rcpt-footer">Thank you for your order!</p>

            <div className="sao-receipt-controls sao-no-print">
              <button className="sao-btn sao-btn-secondary sao-btn-sm" onClick={() => window.print()}>
                <Printer size={13} /><span>Print</span>
              </button>
              <button className="sao-btn sao-btn-primary sao-btn-sm" onClick={() => setReceiptOrderId(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ══════ PAYMENT LINK / QR MODAL ══════ */}
      <Modal
        isOpen={!!paymentOrderId}
        onClose={closePaymentModal}
        title={`Payment — ${paymentOrder?.orderNumber ?? paymentOrder?.id ?? ''}`}
        width="400px"
      >
        {paymentOrderId && (
          <div className="sao-payment-body">
            {paymentOrder && (
              <div className="sao-payment-summary">
                <p><strong>Customer:</strong> {paymentOrder.customerName}</p>
                <p><strong>Amount:</strong> {formatMoney(paymentOrder.total, paymentOrder.currency)}</p>
                {paymentOrder.paymentStatus?.toUpperCase() === 'PAID' && (
                  <p className="sao-payment-paid-note">
                    <Check size={13} /> This order is already marked as paid — link shown for reference.
                  </p>
                )}
              </div>
            )}

            {paymentLoading && (
              <div className="sao-payment-loading">
                <Loader2 size={22} className="sao-spin" />
                <p>Generating payment link…</p>
              </div>
            )}

            {!paymentLoading && paymentError && (
              <div className="sao-error-banner">
                <AlertCircle size={16} />
                <span>{paymentError}</span>
                <button
                  className="sao-error-retry-btn"
                  onClick={() => paymentOrderId && handleOpenPayment(paymentOrderId)}
                >
                  Retry
                </button>
              </div>
            )}

            {!paymentLoading && paymentLink && (
              <div className="sao-payment-content">
                <div className="sao-payment-qr">
                  <QRCodeSVG value={paymentLink} size={200} />
                </div>

                <div className="sao-payment-link-row">
                  <input
                    type="text"
                    className="sao-payment-link-input"
                    value={paymentLink}
                    readOnly
                    onFocus={e => e.target.select()}
                  />
                  <button className="sao-icon-btn" title="Copy link" onClick={handleCopyLink}>
                    {linkCopied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>

                <div className="sao-payment-actions">
                  <a
                    href={paymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sao-btn sao-btn-primary sao-btn-sm"
                  >
                    <ExternalLink size={13} /> Open Payment Page
                  </a>
                  <button className="sao-btn sao-btn-secondary sao-btn-sm" onClick={handleCopyLink}>
                    {linkCopied ? <Check size={13} /> : <Copy size={13} />}
                    <span>{linkCopied ? 'Copied' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

    </div>
  );
};

export default Salesagentorder;