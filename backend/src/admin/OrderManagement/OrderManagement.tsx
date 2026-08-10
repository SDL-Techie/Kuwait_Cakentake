import React, { useState, useEffect, useCallback } from 'react';
import {
  Printer, Check, Play, XCircle, X, Loader2, RefreshCw,
  AlertCircle, Truck, UserCheck, CreditCard, Copy, MessageCircle, Share2,
  Eye, Cake, Gift, CalendarClock, Sparkles,
} from 'lucide-react';
import './OrderManagement.css';

import {
  getOrders,
  acceptOrder,
  rejectOrder,
  cancelOrder,
  assignKitchen,
  markOrderReady,
  assignAgentToOrder,
  assignDriverToOrder,
  markOrderDelivered,
  getOrderHistory,
} from '../../services/orderService';

import {
  getDeliveryAgents,
  getKitchenStaff,
  getDrivers,
} from '../../services/userService';

import {
  createPaymentLink,
  getPayment,
  verifyPayment,
  markPaid,
} from '../../services/paymentService';

import { FaMoneyBill } from 'react-icons/fa';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderAddon {
  addonId: number;
  addonName?: string;
  quantity: number;
  price: number;
  total: number;
  imageUrl?: string;
}

interface OrderItem {
  id: string;
  productName: string;
  productDescription?: string;
  quantity: number;
  price: number;
  addOnPriceTotal: number;
  lineTotal?: number;
  selectedVariant?: string;
  selectedAddOns: string[];
  imageUrl?: string;
  isAgentExclusive?: boolean; 
}

interface TimelineEntry {
  status: string;
  timestamp: string;
  note?: string;
  changedBy?: string;
}

interface CustomCakeDetails {
  flavour?: string;
  weight?: string;
  shape?: string;
  size?: string;
  colour?: string;
  message?: string;
  image?: string;
  notes?: string;
  price?: number;
}

interface DetailedAddress {
  apartment?: string;
  avenue?: string;
  block?: string;
  building?: string;
  floor?: string;
  street?: string;
  country?: string;
  areaName?: string;
  addressNotes?: string;
  // Alternate free-text address captured at checkout (custom order flow)
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
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
  orderAddons?: OrderAddon[];
  orderAddonsTotal?: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus?: string;
  orderType?: string;
  loyaltyCoupon?: string;
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
  timeline: TimelineEntry[];
  assignedAgentId?: string;
  assignedAgentName?: string;
  assignedDriverId?: string;
  assignedDriverName?: string;
  deliveryPhoto?: string;
  deliveryNotes?: string;
  driverSubmittedAt?: string;
  stripeSessionId?: string;

  // ── Order origin (who placed / logged the order) ──
  createdByName?: string;
  createdByRole?: string;
  createdByPhone?: string;
  createdByEmail?: string;
  orderSource?: string;
  isSalesAgentOrder: boolean;
  isAgentAssignedOrder: boolean;
  isAgentOrder: boolean;

  // ── Custom cake order ──
  customCake?: CustomCakeDetails | null;
  isCustomCakeOrder: boolean;

  // ── Delivery scheduling ──
  deliveryMethod?: string;
  isPickup?: boolean;
  deliveryDate?: string;
  deliveryTimeSlot?: string;
  pickupDate?: string;
  pickupTimeSlot?: string;

  // ── Greeting card ──
  greetingTo?: string;
  greetingFrom?: string;
  greetingMessage?: string;
}

interface StaffUser {
  id: number;
  first_name: string;
  last_name: string;
  name?: string;
  phone_no: string;
  role?: string;
  availability_status?: string;
  status?: string;
}

// ─── Payment modal state type ─────────────────────────────────────────────────

interface PaymentModalState {
  open: boolean;
  order: Order | null;
  paymentData: any | null;
  paymentLink: string | null;
  sessionId: string | null;
  loading: boolean;
  error: string | null;
  copied: boolean;
  verifying: boolean;
  verifyResult: string | null;
  markingPaid: boolean;
}

const PAYMENT_MODAL_DEFAULT: PaymentModalState = {
  open: false,
  order: null,
  paymentData: null,
  paymentLink: null,
  sessionId: null,
  loading: false,
  error: null,
  copied: false,
  verifying: false,
  verifyResult: null,
  markingPaid: false,
};

// ─── Status mapping ───────────────────────────────────────────────────────────

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

  const address = raw?.delivery_address ?? raw?.address ?? {};
  const addressJson = raw?.delivery_address_json ?? {};
  const addressParts = [
    address?.street ?? address?.line1,
    address?.city,
    address?.state,
    address?.pincode ?? address?.zip_code ?? address?.postal_code,
    address?.country,
  ].filter(Boolean);
  const deliveryAddress =
    typeof raw?.delivery_address === 'string'
      ? raw.delivery_address
      : addressParts.length
      ? addressParts.join(', ')
      : (addressJson?.address_line1
          ? [addressJson.address_line1, addressJson.address_line2, addressJson.city, addressJson.state]
              .filter(Boolean).join(', ')
          : '—');

  const detailedAddress: DetailedAddress = {
    apartment: address?.apartment || undefined,
    avenue: address?.avenue || undefined,
    block: address?.block || undefined,
    building: address?.building || undefined,
    floor: address?.floor || undefined,
    street: address?.street || undefined,
    country: address?.country || undefined,
    areaName: address?.area?.name ?? raw?.delivery_area?.name ?? undefined,
    addressNotes: address?.delivery_notes || undefined,
    addressLine1: addressJson?.address_line1 || undefined,
    addressLine2: addressJson?.address_line2 || undefined,
    city: addressJson?.city || undefined,
    state: addressJson?.state || undefined,
    pincode: addressJson?.pincode || undefined,
    landmark: addressJson?.landmark || undefined,
  };

  // const items: OrderItem[] = (raw?.items ?? raw?.order_items ?? []).map((it: any, idx: number) => {
  //   // const product    = it?.product ?? {};
  //   // const customJson = it?.custom_json ?? {};
  //   const customJson = it?.custom_json ?? {};
  //   const isAgentExclusive = customJson?.product_type === 'AGENT';

  //   // ── For agent-exclusive items, the backend now returns "agent_product"
  //   // instead of "product" (product_id is null on those order_item rows).
  //   // Prefer that source whenever this is an AGENT-type line. ──
  //   const product      = it?.product ?? {};
  //   const agentProduct = it?.agent_product ?? {};
  //   const source       = isAgentExclusive ? agentProduct : product;
  //   return {
  //     id: String(it?.id ?? `item-${idx}`),
  //     productName: product?.name ?? it?.product_name ?? it?.name ?? 'Item',
  //     productDescription: product?.description ?? undefined,
  //     quantity: Number(it?.quantity ?? 1),
  //     price: Number(it?.price ?? product?.price ?? 0),
  //     addOnPriceTotal: Number(it?.add_on_total ?? customJson?.add_on_total ?? 0),
  //     lineTotal: it?.line_total != null ? Number(it.line_total) : undefined,
  //     selectedVariant: customJson?.variant_name ?? customJson?.variant ?? it?.variant ?? undefined,
  //     selectedAddOns:  customJson?.addons ?? customJson?.add_ons ?? it?.add_ons ?? [],
  //     imageUrl: product?.image_url ?? product?.imageUrl ?? undefined,
  //   };
  // });


  const items: OrderItem[] = (raw?.items ?? raw?.order_items ?? []).map((it: any, idx: number) => {
    const customJson = it?.custom_json ?? {};
    const isAgentExclusive = customJson?.product_type === 'AGENT';

    // ── For agent-exclusive items, the backend now returns "agent_product"
    // instead of "product" (product_id is null on those order_item rows).
    // Prefer that source whenever this is an AGENT-type line. ──
    const product      = it?.product ?? {};
    const agentProduct = it?.agent_product ?? {};
    const source       = isAgentExclusive ? agentProduct : product;

    return {
      id: String(it?.id ?? `item-${idx}`),
      productName: source?.name ?? it?.product_name ?? it?.name ?? (isAgentExclusive ? 'Agent Product' : 'Item'),
      productDescription: source?.description ?? undefined,
      quantity: Number(it?.quantity ?? 1),
      price: Number(it?.price ?? source?.price ?? 0),
      addOnPriceTotal: Number(it?.add_on_total ?? customJson?.add_on_total ?? 0),
      lineTotal: it?.line_total != null ? Number(it.line_total) : undefined,
      selectedVariant: customJson?.variant_name ?? customJson?.variant ?? it?.variant ?? undefined,
      selectedAddOns:  customJson?.addons ?? customJson?.add_ons ?? it?.add_ons ?? [],
      imageUrl: source?.image_url ?? source?.imageUrl ?? source?.image ?? undefined,
      isAgentExclusive,
    };
  });
  
  const orderAddons: OrderAddon[] = (raw?.order_addons ?? raw?.orderAddons ?? []).map((addon: any) => {
    const qty = Number(addon?.quantity ?? 1);
    const price = Number(addon?.price ?? 0);
    const total = Number(addon?.total ?? price * qty);
    const imageUrl = addon?.addon_image ?? addon?.image ?? addon?.image_url ?? addon?.addonImage ?? null;
    return {
      addonId: Number(addon?.addon_id ?? addon?.addonId ?? 0),
      addonName: addon?.addon_name ?? addon?.addonName ?? addon?.name ?? 'Addon',
      quantity: qty,
      price: price,
      total: total,
      imageUrl: imageUrl,
    };
  });

  let subtotal = Number(raw?.subtotal ?? raw?.sub_total ?? 0);
  if (!subtotal) {
    subtotal = items.reduce(
      (sum, it) => sum + it.price * it.quantity,
      0
    );
  }

  const discount         = Number(raw?.discount ?? 0);
  const deliveryCharge   = Number(raw?.delivery_charge ?? raw?.delivery_fee ?? 0);
  const orderAddonsTotal = Number(raw?.order_addons_total ?? raw?.orderAddonsTotal ?? 0);
  let   total            = Number(raw?.total ?? raw?.grand_total ?? 0);
  if (!total) total      = subtotal + orderAddonsTotal - discount + deliveryCharge;

  const currency      = String(raw?.currency ?? 'INR').toUpperCase();
  const paymentMethod = String(raw?.payment_method ?? 'N/A').toUpperCase();
  const timeline: TimelineEntry[] = (raw?.history ?? raw?.timeline ?? []).map(mapTimelineEntry);

  const agentObj           = raw?.delivery_agent;
  const assignedAgentId    = raw?.delivery_agent_id != null ? String(raw.delivery_agent_id) : undefined;
  const assignedAgentName  = agentObj
    ? `${agentObj.first_name ?? ''} ${agentObj.last_name ?? ''}`.trim() || agentObj.name
    : undefined;

  const driverObj          = raw?.driver;
  const assignedDriverId   = raw?.driver_id != null ? String(raw.driver_id) : undefined;
  const assignedDriverName = driverObj
    ? `${driverObj.first_name ?? ''} ${driverObj.last_name ?? ''}`.trim() || driverObj.name
    : undefined;

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
  const deliveryMethodRaw = String(raw?.delivery_method ?? raw?.deliveryMethod ?? raw?.deliveryType ?? '').toLowerCase();
  const isPickup =
    deliveryMethodRaw === 'pickup' ||
    deliveryMethodRaw.includes('pickup') ||
    orderTypeRaw === 'pickup' ||
    orderTypeRaw.includes('pickup');

  const pickupDate     = raw?.pickup_date ?? raw?.delivery_date ?? undefined;
  const pickupTimeSlot = raw?.pickup_time_slot ?? raw?.delivery_time_slot ?? undefined;

  const isSalesAgentOrder =
    createdByRole === 'SALES_AGENT' ||
    orderSource === 'SALES_AGENT' ||
    orderTypeRaw === 'sales_agent';

  const isAgentAssignedOrder = status === 'assigned_to_agent';

  const isAgentOrder =
    !isSalesAgentOrder &&
    (orderSource === 'AGENT' || createdByRole === 'AGENT');

  // ── Custom cake order ──
  const customCakeRaw = raw?.custom_cake_json ?? null;
  const isCustomCakeOrder = !!customCakeRaw;
  const customCake: CustomCakeDetails | null = customCakeRaw ? {
    flavour: customCakeRaw?.flavour || undefined,
    weight:  customCakeRaw?.weight  || undefined,
    shape:   customCakeRaw?.shape   || undefined,
    size:    customCakeRaw?.size    || undefined,
    colour:  customCakeRaw?.colour  || undefined,
    message: customCakeRaw?.message || undefined,
    image:   customCakeRaw?.image   || undefined,
    notes:   customCakeRaw?.notes   || undefined,
    price:   customCakeRaw?.price != null ? Number(customCakeRaw.price) : undefined,
  } : null;

  // ── Delivery scheduling ──
  const deliveryDate     = raw?.delivery_date ?? undefined;
  const deliveryTimeSlot = raw?.delivery_time_slot ?? undefined;

  // ── Greeting card ──
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
    paymentMethod,
    paymentStatus:    raw?.payment_status ?? undefined,
    orderType:        raw?.order_type ?? undefined,
    loyaltyCoupon:    raw?.loyalty_coupon ?? undefined,
    rejectionReason:  raw?.rejection_reason ?? undefined,
    notes:            raw?.notes ?? raw?.delivery_notes ?? undefined,
    createdAt:        raw?.created_at ?? raw?.createdAt ?? new Date().toISOString(),
    timeline,
    assignedAgentId,
    assignedAgentName,
    assignedDriverId,
    assignedDriverName,
    deliveryPhoto:      raw?.delivery_photo ?? undefined,
    deliveryNotes:      raw?.delivery_notes ?? undefined,
    driverSubmittedAt:  raw?.driver_submitted_at ?? undefined,
    stripeSessionId:    raw?.stripe_session_id ?? undefined,

    createdByName,
    createdByRole,
    createdByPhone,
    createdByEmail,
    orderSource,
    isSalesAgentOrder,
    isAgentAssignedOrder,
    isAgentOrder,

    deliveryMethod: raw?.delivery_method ?? raw?.deliveryMethod ?? raw?.order_type ?? undefined,
    isPickup,
    pickupDate,
    pickupTimeSlot,
    customCake,
    isCustomCakeOrder,

    deliveryDate,
    deliveryTimeSlot,

    greetingTo,
    greetingFrom,
    greetingMessage,
    orderAddons,
    orderAddonsTotal,
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
    <div className="sage-modal-overlay" onClick={onClose}>
      <div className="sage-modal-content" style={{ maxWidth: width }} onClick={e => e.stopPropagation()}>
        <div className="sage-modal-header">
          <h3>{title}</h3>
          <button className="sage-modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="sage-modal-body">{children}</div>
      </div>
    </div>
  );
};

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}
const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, title, children }) => (
  <>
    <div className={`sage-drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
    <div className={`sage-drawer-content ${isOpen ? 'open' : ''}`}>
      <div className="sage-drawer-header">
        <h3>{title}</h3>
        <button className="sage-drawer-close" onClick={onClose}><X size={18} /></button>
      </div>
      <div className="sage-drawer-body">{children}</div>
    </div>
  </>
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
  id?: string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  rowClassName?: (row: T) => string;
}
function DataTable<T extends { id: string }>({
  columns, data, id, onRowClick, emptyMessage = 'No items found', rowClassName,
}: DataTableProps<T>) {
  return (
    <div id={id} className="sage-table-card">
      <div className="sage-table-container">
        <table className="sage-data-table">
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
              <tr
                key={row.id}
                className={`${onRowClick ? 'clickable-row' : ''} ${rowClassName ? rowClassName(row) : ''}`.trim()}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col, ci) => {
                  const cell = typeof col.accessor === 'function'
                    ? col.accessor(row)
                    : (row[col.accessor] as React.ReactNode);
                  return <td key={ci} style={{ textAlign: col.align || 'left' }}>{cell}</td>;
                })}
              </tr>
            )) : (
              <tr>
                <td colSpan={columns.length} className="empty-table-cell">
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

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending:             { label: 'Pending',            className: 'status-pending'    },
  accepted:            { label: 'Accepted',           className: 'status-confirmed'  },
  assigned_to_kitchen: { label: 'Kitchen Assigned',   className: 'status-processing' },
  preparing:           { label: 'Preparing',          className: 'status-processing' },
  ready:               { label: 'Ready for Dispatch', className: 'status-ready'      },
  assigned_to_agent:   { label: 'Agent Assigned',     className: 'status-assigned'   },
  assigned_to_driver:  { label: 'Driver Assigned',    className: 'status-assigned'   },
  out_for_delivery:    { label: 'Out for Delivery',   className: 'status-ontheway'   },
  delivery_submitted:  { label: 'Proof Submitted',    className: 'status-ontheway'   },
  delivered:           { label: 'Delivered',          className: 'status-delivered'  },
  rejected:            { label: 'Rejected',           className: 'status-cancelled'  },
  cancelled:           { label: 'Cancelled',          className: 'status-cancelled'  },
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? { label: status.replace(/_/g, ' '), className: 'status-default' };
  return (
    <span className={`sage-status-badge ${cfg.className}`}>
      <span className="badge-dot" />{cfg.label}
    </span>
  );
};

const PaymentStatusChip: React.FC<{ status: string | undefined }> = ({ status }) => {
  if (!status) return null;
  const s = status.toUpperCase();
  const className = s === 'PAID' || s === 'COMPLETED'
    ? 'op-payment-status-chip chip-paid'
    : s === 'FAILED'
    ? 'op-payment-status-chip chip-failed'
    : 'op-payment-status-chip chip-pending';
  return <span className={className}>{status}</span>;
};

/** Small pill shown on rows / drawers / modals to flag order origin & type */
const OriginBadges: React.FC<{ order: Order }> = ({ order }) => (
  <>
    {order.isSalesAgentOrder && (
      <span className="op-origin-badge badge-sales-agent" title={order.createdByName ? `Logged by ${order.createdByName}` : 'Sales agent order'}>
        <UserCheck size={11} /> Sales Agent
      </span>
    )}
    {/* {order.isAgentAssignedOrder && (
      <span className="op-origin-badge badge-agent-assigned" title="Assigned delivery agent">
        <Truck size={11} /> Agent Assigned
      </span>
    )} */}
    {order.isAgentOrder && (
      <span className="op-origin-badge badge-order-agent" title={order.createdByName ? `Logged by ${order.createdByName}` : 'Agent order'}>
        <Truck size={11} /> Agent
      </span>
    )}
    {order.isCustomCakeOrder && (
      <span className="op-origin-badge badge-custom-cake" title="Customized cake order">
        <Cake size={11} /> Custom Order
      </span>
    )}
  </>
);

interface ActionButtonProps {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
}
const ActionButton: React.FC<ActionButtonProps> = ({
  onClick, children, icon, variant = 'primary', size = 'md', disabled = false, loading = false,
}) => (
  <button
    className={`sage-btn btn-${variant} btn-${size} ${loading ? 'is-loading' : ''}`}
    onClick={onClick}
    disabled={disabled || loading}
  >
    {loading
      ? <Loader2 size={14} className="op-btn-spinner-icon" />
      : icon ? <span>{icon}</span> : null}
    <span>{children}</span>
  </button>
);

// ─── Main component ───────────────────────────────────────────────────────────

export const OrderManagement: React.FC = () => {
  const [statusFilter, setStatusFilter]       = useState<string>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isReceiptOpen, setIsReceiptOpen]     = useState(false);

  // Full details modal (eye icon)
  const [fullDetailsOrderId, setFullDetailsOrderId] = useState<string | null>(null);

  const [orders, setOrders]                   = useState<Order[]>([]);
  const [deliveryAgents, setDeliveryAgents]   = useState<StaffUser[]>([]);
  const [drivers, setDrivers]                 = useState<StaffUser[]>([]);
  const [kitchenStaff, setKitchenStaff]       = useState<StaffUser[]>([]);

  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState<string | null>(null);
  const [staffError, setStaffError]           = useState<string | null>(null);

  const [isKitchenModalOpen, setIsKitchenModalOpen]         = useState(false);
  const [selectedKitchenOrderId, setSelectedKitchenOrderId] = useState<string | null>(null);
  const [loadingKitchenStaff, setLoadingKitchenStaff]       = useState(false);

  const [isDriverModalOpen, setIsDriverModalOpen]       = useState(false);
  const [selectedDriverOrderId, setSelectedDriverOrderId] = useState<string | null>(null);
  const [loadingDrivers, setLoadingDrivers]             = useState(false);

  const [confirmAction, setConfirmAction] = useState<{ type: 'reject' | 'cancel'; orderId: string } | null>(null);
  const [reasonText, setReasonText]       = useState('');

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // ── Payment modal state ───────────────────────────────────────────────────
  const [pm, setPm] = useState<PaymentModalState>(PAYMENT_MODAL_DEFAULT);

  // ─── Fetch helpers ────────────────────────────────────────────────────────

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await getOrders();
      setOrders((raw ?? []).map(normalizeOrder));
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Failed to load orders. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDeliveryAgents = useCallback(async () => {
    setStaffError(null);
    try {
      const list = await getDeliveryAgents();
      setDeliveryAgents(list ?? []);
    } catch {
      setStaffError('Could not load delivery agents.');
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchDeliveryAgents();
  }, [fetchOrders, fetchDeliveryAgents]);

  // Lazy-load timeline
  useEffect(() => {
    if (!selectedOrderId) return;
    const current = orders.find(o => o.id === selectedOrderId);
    if (!current || current.timeline.length > 0) return;
    let cancelled = false;
    (async () => {
      try {
        const history = await getOrderHistory(Number(selectedOrderId));
        if (!cancelled && Array.isArray(history) && history.length > 0) {
          setOrders(prev =>
            prev.map(o => o.id === selectedOrderId ? { ...o, timeline: history.map(mapTimelineEntry) } : o)
          );
        }
      } catch { /* non-fatal */ }
    })();
    return () => { cancelled = true; };
  }, [selectedOrderId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Lazy-load timeline for full-details modal too (in case opened without inspecting first)
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

  // ── Merge updated order ────────────────────────────────────────────────────

  const mergeUpdatedOrder = async (response: any) => {
    const raw = response?.order ?? response;
    let normalized = normalizeOrder(raw);
    if (normalized.timeline.length === 0 && normalized.id) {
      try {
        const history = await getOrderHistory(Number(normalized.id));
        if (Array.isArray(history) && history.length > 0) {
          normalized = { ...normalized, timeline: history.map(mapTimelineEntry) };
        }
      } catch { /* non-fatal */ }
    }
    setOrders(prev => prev.map(o => o.id === normalized.id ? normalized : o));
  };

  // ── Generic action wrapper ────────────────────────────────────────────────

  const handleSimpleAction = async (
    orderId: string,
    apiCall: (id: number) => Promise<any>,
    errorMessage: string
  ) => {
    setActionLoadingId(orderId);
    setError(null);
    try {
      const raw = await apiCall(Number(orderId));
      await mergeUpdatedOrder(raw);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.response?.data?.message || errorMessage);
    } finally {
      setActionLoadingId(null);
    }
  };

  // ── Kitchen assignment ─────────────────────────────────────────────────────

  const openKitchenAssignment = async (orderId: string) => {
    setSelectedKitchenOrderId(orderId);
    setIsKitchenModalOpen(true);
    setLoadingKitchenStaff(true);
    try {
      const staff = await getKitchenStaff();
      setKitchenStaff(staff ?? []);
    } catch {
      setError('Unable to load kitchen staff.');
      setIsKitchenModalOpen(false);
    } finally {
      setLoadingKitchenStaff(false);
    }
  };

  const assignKitchenStaff = async (staffId: number) => {
    if (!selectedKitchenOrderId) return;
    setActionLoadingId(selectedKitchenOrderId);
    setError(null);
    try {
      const raw = await assignKitchen(Number(selectedKitchenOrderId), staffId);
      await mergeUpdatedOrder(raw);
      setIsKitchenModalOpen(false);
      setSelectedKitchenOrderId(null);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.response?.data?.message || 'Failed to assign kitchen staff.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // ── Assign delivery agent ─────────────────────────────────────────────────

  const handleAssignAgent = async (orderId: string, agentId: number) => {
    setActionLoadingId(orderId);
    setError(null);
    try {
      const raw = await assignAgentToOrder(Number(orderId), agentId);
      await mergeUpdatedOrder(raw);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.response?.data?.message || 'Failed to assign delivery agent.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // ── Driver assignment ─────────────────────────────────────────────────────

  const openDriverAssignment = async (orderId: string) => {
    setSelectedDriverOrderId(orderId);
    setIsDriverModalOpen(true);
    setLoadingDrivers(true);
    try {
      const list = await getDrivers();
      setDrivers(list ?? []);
    } catch {
      setError('Unable to load drivers.');
      setIsDriverModalOpen(false);
    } finally {
      setLoadingDrivers(false);
    }
  };

  const handleAssignDriver = async (driverId: number) => {
    if (!selectedDriverOrderId) return;
    setActionLoadingId(selectedDriverOrderId);
    setError(null);
    try {
      const raw = await assignDriverToOrder(Number(selectedDriverOrderId), driverId);
      await mergeUpdatedOrder(raw);
      setIsDriverModalOpen(false);
      setSelectedDriverOrderId(null);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.response?.data?.message || 'Failed to assign driver.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmDelivery = (orderId: string) =>
    handleSimpleAction(orderId, markOrderDelivered, 'Failed to confirm delivery.');

  // ── Reject / cancel ───────────────────────────────────────────────────────

  const openConfirmAction = (type: 'reject' | 'cancel', orderId: string) => {
    setReasonText('');
    setConfirmAction({ type, orderId });
  };

  const closeConfirmAction = () => {
    setConfirmAction(null);
    setReasonText('');
  };

  const confirmReasonAction = async () => {
    if (!confirmAction) return;
    const { type, orderId } = confirmAction;
    setActionLoadingId(orderId);
    setError(null);
    try {
      const raw =
        type === 'reject'
          ? await rejectOrder(Number(orderId), reasonText || undefined)
          : await cancelOrder(Number(orderId), reasonText || undefined);
      await mergeUpdatedOrder(raw);
      closeConfirmAction();
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.response?.data?.message || `Failed to ${type} the order.`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // PAYMENT FLOW
  // ═══════════════════════════════════════════════════════════════

  const openPaymentModal = async (order: Order) => {
    setPm({
      ...PAYMENT_MODAL_DEFAULT,
      open: true,
      order,
      loading: true,
    });

    try {
      let existingData: any = null;
      try {
        existingData = await getPayment(Number(order.id));
      } catch {
        /* no existing payment record — that's fine */
      }

      const linkRes = await createPaymentLink(Number(order.id));

      setPm(prev => ({
        ...prev,
        paymentData: existingData,
        paymentLink: linkRes.payment_url,
        sessionId:   linkRes.session_id,
        loading:     false,
      }));
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Failed to generate payment link. Please try again.';
      setPm(prev => ({ ...prev, loading: false, error: msg }));
    }
  };

  const closePaymentModal = () => setPm(PAYMENT_MODAL_DEFAULT);

  const handleCopyLink = async () => {
    if (!pm.paymentLink) return;
    try {
      await navigator.clipboard.writeText(pm.paymentLink);
    } catch {
      const el = document.createElement('textarea');
      el.value = pm.paymentLink;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setPm(prev => ({ ...prev, copied: true }));
    setTimeout(() => setPm(prev => ({ ...prev, copied: false })), 2500);
  };

  const handleShareWhatsApp = () => {
    if (!pm.paymentLink || !pm.order) return;
    const { customerName, orderNumber, id, total, currency } = pm.order;
    const msg = [
      `Hello ${customerName} 👋`,
      `Your order #${orderNumber ?? id} of ${formatMoney(total, currency)} is ready for payment.`,
      `Please complete payment here: ${pm.paymentLink}`,
    ].join('\n\n');
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (!pm.paymentLink || !pm.order) return;
    const shareData = {
      title: `Payment – Order #${pm.order.orderNumber ?? pm.order.id}`,
      text: `Please pay ${formatMoney(pm.order.total, pm.order.currency)} for your order.`,
      url: pm.paymentLink,
    };
    if (typeof navigator.share === 'function') {
      try { await navigator.share(shareData); } catch { /* user dismissed */ }
    } else {
      handleCopyLink();
    }
  };

  const handleVerifyPayment = async () => {
    if (!pm.order || !pm.sessionId) return;
    setPm(prev => ({ ...prev, verifying: true, verifyResult: null, error: null }));
    try {
      const res = await verifyPayment(Number(pm.order!.id), pm.sessionId);
      const status: string = (res?.status ?? res?.payment_status ?? 'UNKNOWN').toUpperCase();
      setPm(prev => ({ ...prev, verifying: false, verifyResult: status }));

      if (['PAID', 'COMPLETED', 'SUCCESS'].includes(status)) {
        await fetchOrders();
        setPm(prev => ({
          ...prev,
          paymentData: { ...(prev.paymentData ?? {}), payment_status: 'PAID' },
        }));
        setOrders(prev =>
          prev.map(o =>
            o.id === pm.order!.id ? { ...o, paymentStatus: 'PAID' } : o
          )
        );
      }
    } catch (err: any) {
      const backendStatus =
        err?.response?.data?.status ??
        err?.response?.data?.payment_status ??
        null;
      setPm(prev => ({
        ...prev,
        verifying: false,
        verifyResult: backendStatus ?? 'NOT_PAID',
      }));
    }
  };

  const handleMarkPaid = async () => {
    if (!pm.order) return;
    setPm(prev => ({ ...prev, markingPaid: true, error: null }));
    try {
      const updatedOrder = await markPaid(Number(pm.order!.id), pm.order!.paymentMethod);
      await mergeUpdatedOrder(updatedOrder);
      setPm(prev => ({
        ...prev,
        markingPaid: false,
        verifyResult: 'PAID',
        paymentData: { ...(prev.paymentData ?? {}), payment_status: 'PAID' },
      }));
    } catch (err: any) {
      setPm(prev => ({
        ...prev,
        markingPaid: false,
        error:
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          'Failed to mark as paid.',
      }));
    }
  };

  // ═══════════════════════════════════════════════════════════════

  const filteredOrders = orders.filter(o => {
    if (statusFilter === 'all')    return true;
    if (statusFilter === 'active') return !['delivered', 'cancelled', 'rejected'].includes(o.status);
    return o.status === statusFilter;
  });

  const selectedOrder = orders.find(o => o.id === selectedOrderId);
  const fullDetailsOrder = orders.find(o => o.id === fullDetailsOrderId);
  const isBusy = (id: string) => actionLoadingId === id;

  const getStatusCount = (s: string) => {
    if (s === 'all')    return orders.length;
    if (s === 'active') return orders.filter(o => !['delivered', 'cancelled', 'rejected'].includes(o.status)).length;
    return orders.filter(o => o.status === s).length;
  };

  const FILTER_TABS = [
    { key: 'all',                label: 'All'               },
    { key: 'active',             label: 'Active'            },
    { key: 'pending',            label: 'Pending'           },
    { key: 'accepted',           label: 'Accepted'          },
    { key: 'assigned_to_kitchen',label: 'Kitchen Assigned'  },
    { key: 'preparing',          label: 'Preparing'         },
    { key: 'ready',              label: 'Ready'             },
    { key: 'assigned_to_agent',  label: 'Agent Assigned'    },
    { key: 'assigned_to_driver', label: 'Driver Assigned'   },
    { key: 'out_for_delivery',   label: 'Out for Delivery'  },
    { key: 'delivery_submitted', label: 'Proof Submitted'   },
    { key: 'delivered',          label: 'Delivered'         },
    { key: 'cancelled',          label: 'Cancelled'         },
  ];

  const pmIsPaid = (() => {
    const s = (
      pm.paymentData?.payment_status ??
      pm.order?.paymentStatus ??
      ''
    ).toUpperCase();
    return s === 'PAID' || s === 'COMPLETED';
  })();

  // const rowClassFor = (row: Order) =>
  //   `${row.isSalesAgentOrder ? 'row-sales-agent' : row.isAgentAssignedOrder ? 'row-agent-assigned' : ''} ${row.isCustomCakeOrder ? 'row-custom-cake' : ''}`.trim();

  const rowClassFor = (row: Order) =>
    `${row.isSalesAgentOrder ? 'row-sales-agent' : row.isAgentOrder ? 'row-order-agent' : ''} ${row.isCustomCakeOrder ? 'row-custom-cake' : ''}`.trim();

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="order-pipeline-container">

      {/* Error banner */}
      {error && (
        <div className="op-error-banner">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button className="op-error-retry-btn" onClick={() => setError(null)}>Dismiss</button>
          <button className="op-error-retry-btn" onClick={fetchOrders}>Retry</button>
        </div>
      )}

      {/* Filter row */}
      <div className="order-pipeline-filters">
        {FILTER_TABS.map(({ key, label }) => (
          <button
            key={key}
            className={`filter-tag ${statusFilter === key ? 'active' : ''}`}
            onClick={() => setStatusFilter(key)}
          >
            {label} ({getStatusCount(key)})
          </button>
        ))}
        <button
          className="op-refresh-btn"
          onClick={fetchOrders}
          disabled={loading}
          title="Refresh orders"
        >
          <RefreshCw size={15} className={loading ? 'op-spin' : ''} />
        </button>
      </div>

      {/* Legend for row highlights */}
      <div className="op-legend-row">
        <span className="op-legend-item">
          <span className="op-legend-swatch swatch-sales-agent" /> Sales agent order
        </span>
        {/* <span className="op-legend-item">
          <span className="op-legend-swatch swatch-agent-assigned" /> Agent assigned order
        </span> */}

        <span className="op-legend-item">
          <span className="op-legend-swatch swatch-order-agent" /> Agent order
        </span>
        
        <span className="op-legend-item">
          <span className="op-legend-swatch swatch-custom-cake" /> Custom cake order
        </span>
      </div>

      {/* Orders table */}
      {loading && orders.length === 0 ? (
        <div className="op-loading-state">
          <Loader2 size={22} className="op-spin" />
          <p>Loading orders…</p>
        </div>
      ) : (
        <div className="orders-pipeline-grid">
          <DataTable
            id="orders-pipeline-table"
            rowClassName={rowClassFor}
            columns={[
              {
                header: 'Order #',
                accessor: (row: Order) => (
                  <div className="tbl-order-id-cell">
                    <strong className="tbl-order-id">{row.orderNumber ?? row.id}</strong>
                    <div className="tbl-order-badges">
                      <OriginBadges order={row} />
                    </div>
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
  header: 'Expected',
  accessor: (row: Order) => {
    const date = row.isPickup ? (row.pickupDate ?? row.deliveryDate) : row.deliveryDate;
    const slot = row.isPickup ? (row.pickupTimeSlot ?? row.deliveryTimeSlot) : row.deliveryTimeSlot;

    if (!date && !slot) return <span className="cust-sub">—</span>;

    return (
      <div className="tbl-cust-cell">
        <span className="cust-name">{formatDate(date)}</span>
        {slot && <span className="cust-sub">{slot}</span>}
      </div>
    );
  },
},
              {
                header: 'Customer',
                accessor: (row: Order) => (
                  <div className="tbl-cust-cell">
                    <span className="cust-name">{row.customerName}</span>
                    <span className="cust-sub">{row.customerPhone}</span>
                  </div>
                ),
              },
              {
                header: 'Items',
                accessor: (row: Order) =>
                  `${row.items.reduce((acc, i) => acc + i.quantity, 0)} item(s)`,
              },
              {
                header: 'Total',
                accessor: (row: Order) => (
                  <strong>{formatMoney(row.total, row.currency)}</strong>
                ),
              },
              {
                header: 'Payment',
                accessor: (row: Order) => (
                  <div className="tbl-cust-cell">
                    <span className="cust-name">{row.paymentMethod}</span>
                    {row.paymentStatus && (
                      <PaymentStatusChip status={row.paymentStatus} />
                    )}
                  </div>
                ),
              },
              {
                header: 'Status',
                accessor: (row: Order) => <StatusBadge status={row.status} />,
              },
              {
                header: 'Actions',
                accessor: (row: Order) => (
                  <div className="tbl-actions">
                    {/* Eye icon — full order details */}
                    <button
                      className="receipt-quick-icon-btn op-eye-icon-btn"
                      title="View full order details"
                      onClick={e => {
                        e.stopPropagation();
                        setFullDetailsOrderId(row.id);
                      }}
                    >
                      <Eye size={18} />
                    </button>

                    <ActionButton
                      variant="secondary"
                      size="sm"
                      onClick={e => {
                        (e as any)?.stopPropagation?.();
                        setSelectedOrderId(row.id);
                      }}
                    >
                      Inspect
                    </ActionButton>

                    {/* Payment link button */}
                    <button
                      className="receipt-quick-icon-btn op-payment-icon-btn"
                      title="Payment link"
                      onClick={e => {
                        e.stopPropagation();
                        openPaymentModal(row);
                      }}
                    >
                      <CreditCard size={18} />
                    </button>

                    {/* Receipt print button */}
                    <button
                      className="receipt-quick-icon-btn"
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedOrderId(row.id);
                        setIsReceiptOpen(true);
                      }}
                      title="Print receipt"
                    >
                      <Printer size={18} />
                    </button>
                  </div>
                ),
                align: 'right',
              },
            ]}
            data={filteredOrders}
            onRowClick={row => setSelectedOrderId(row.id)}
            emptyMessage="No orders match this filter."
          />
        </div>
      )}

      {/* ══════════════════════════════════════════
          FULL ORDER DETAILS MODAL (eye icon)
          ══════════════════════════════════════════ */}
      <Modal
        isOpen={!!fullDetailsOrder}
        onClose={() => setFullDetailsOrderId(null)}
        title={`Full Order Details — ${fullDetailsOrder?.orderNumber ?? fullDetailsOrder?.id ?? ''}`}
        width="640px"
      >
        {fullDetailsOrder && (
          <div className="op-full-details-modal-body">

            {/* Badges + top status row */}
            <div className="op-fd-top-row">
              <StatusBadge status={fullDetailsOrder.status} />
              {fullDetailsOrder.paymentStatus && <PaymentStatusChip status={fullDetailsOrder.paymentStatus} />}
              <OriginBadges order={fullDetailsOrder} />
            </div>

            {/* Order origin block */}
            <div className={`op-fd-section ${fullDetailsOrder.isSalesAgentOrder ? 'op-fd-highlight-sales' : ''}`}>
              <h4><UserCheck size={14} /> Order Origin</h4>
              <div className="op-fd-grid">
                <div><span className="lbl">Placed by</span><span>{fullDetailsOrder.createdByName ?? '—'}</span></div>
                <div><span className="lbl">Role</span><span>{fullDetailsOrder.createdByRole ?? '—'}</span></div>
                <div><span className="lbl">Phone</span><span>{fullDetailsOrder.createdByPhone ?? '—'}</span></div>
                <div><span className="lbl">Email</span><span>{fullDetailsOrder.createdByEmail ?? '—'}</span></div>
                <div><span className="lbl">Order source</span><span>{fullDetailsOrder.orderSource ?? fullDetailsOrder.orderType ?? '—'}</span></div>
              </div>
              {fullDetailsOrder.isSalesAgentOrder && (
                <p className="op-fd-note">This order was logged on behalf of the customer by a sales agent.</p>
              )}
            </div>

            {/* Delivery / Pickup scheduling */}
            <div className="op-fd-section">
              <h4><CalendarClock size={14} /> {fullDetailsOrder.isPickup ? 'Pickup Schedule' : 'Delivery Schedule'}</h4>
              <div className="op-fd-grid">
                <div><span className="lbl">{fullDetailsOrder.isPickup ? 'Pickup date' : 'Expected date'}</span><span>{formatDate(fullDetailsOrder.isPickup ? fullDetailsOrder.pickupDate ?? fullDetailsOrder.deliveryDate : fullDetailsOrder.deliveryDate)}</span></div>
                <div><span className="lbl">Time slot</span><span>{fullDetailsOrder.isPickup ? fullDetailsOrder.pickupTimeSlot ?? fullDetailsOrder.deliveryTimeSlot : fullDetailsOrder.deliveryTimeSlot ?? '—'}</span></div>
                {!fullDetailsOrder.isPickup && (
                  <div><span className="lbl">Area</span><span>{fullDetailsOrder.detailedAddress?.areaName ?? '—'}</span></div>
                )}
                {fullDetailsOrder.isPickup && fullDetailsOrder.deliveryAddress && (
                  <div><span className="lbl">Pickup Location</span><span>{fullDetailsOrder.deliveryAddress}</span></div>
                )}
              </div>
            </div>

            {/* Customer & address */}
            <div className="op-fd-section">
              <h4>Customer &amp; Address</h4>
              <div className="op-fd-grid">
                <div><span className="lbl">Name</span><span>{fullDetailsOrder.customerName}</span></div>
                <div><span className="lbl">Phone</span><span>{fullDetailsOrder.customerPhone}</span></div>
                <div><span className="lbl">Email</span><span>{fullDetailsOrder.customerEmail ?? '—'}</span></div>
              </div>
              <div className="op-fd-address-block">
                {fullDetailsOrder.isPickup ? (
                  <p><strong>Pickup order</strong> — no delivery address is required.</p>
                ) : (
                  <>
                    <p><strong>Address:</strong> {fullDetailsOrder.deliveryAddress}</p>
                    {fullDetailsOrder.detailedAddress && (
                      <ul className="op-fd-address-list">
                        {fullDetailsOrder.detailedAddress.building && <li><strong>Building:</strong> {fullDetailsOrder.detailedAddress.building}</li>}
                        {fullDetailsOrder.detailedAddress.block && <li><strong>Block:</strong> {fullDetailsOrder.detailedAddress.block}</li>}
                        {fullDetailsOrder.detailedAddress.avenue && <li><strong>Avenue:</strong> {fullDetailsOrder.detailedAddress.avenue}</li>}
                        {fullDetailsOrder.detailedAddress.street && <li><strong>Street:</strong> {fullDetailsOrder.detailedAddress.street}</li>}
                        {fullDetailsOrder.detailedAddress.floor && <li><strong>Floor/Apt:</strong> {fullDetailsOrder.detailedAddress.floor} {fullDetailsOrder.detailedAddress.apartment}</li>}
                        {fullDetailsOrder.detailedAddress.landmark && <li><strong>Landmark:</strong> {fullDetailsOrder.detailedAddress.landmark}</li>}
                        {fullDetailsOrder.detailedAddress.addressNotes && <li><strong>Address notes:</strong> {fullDetailsOrder.detailedAddress.addressNotes}</li>}
                      </ul>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Items — ordered products, clearly laid out */}
            <div className="op-fd-section">
              <h4>Ordered Products</h4>
              {fullDetailsOrder.items.length > 0 ? (
                <div className="op-fd-items-list">
                  {fullDetailsOrder.items.map(item => (
                    <div key={item.id} className="op-fd-item-row">
                      {item.imageUrl && <img src={item.imageUrl} alt={item.productName} className="op-fd-item-thumb" />}
                      <div className="op-fd-item-info">
                        <strong>{item.productName}</strong>
                        {item.productDescription && <p className="op-fd-item-desc">{item.productDescription}</p>}
                        <div className="op-fd-item-meta">
                          <span>Qty: {item.quantity}</span>
                          <span>Unit: {formatMoney(item.price, fullDetailsOrder.currency)}</span>
                          {item.selectedVariant && <span>Variant: {item.selectedVariant}</span>}
                          {item.selectedAddOns.length > 0 && <span>Add-ons: {item.selectedAddOns.join(', ')}</span>}
                        </div>
                      </div>
                      <span className="op-fd-item-total">
                        {formatMoney(item.lineTotal ?? (item.price + item.addOnPriceTotal) * item.quantity, fullDetailsOrder.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-couriers">No standard catalog items on this order (custom cake order below).</p>
              )}

              {fullDetailsOrder.orderAddons?.length > 0 && (
                <div className="op-fd-order-addons">
                  <h4>Order Add-ons</h4>
                  <div className="op-fd-addons-list">
                    {fullDetailsOrder.orderAddons.map((addon, idx) => (
                      <div key={`${addon.addonId}-${idx}`} className="op-fd-addon-row">
                        <div className="op-fd-addon-thumb-wrapper">
                          {addon.imageUrl ? (
                            <img
                              src={addon.imageUrl}
                              alt={addon.addonName ?? `Addon #${addon.addonId}`}
                              className="op-fd-addon-thumb"
                            />
                          ) : (
                            <div className="op-fd-addon-thumb-placeholder" />
                          )}
                          <div className="op-fd-addon-content">
                            <strong>
                              {addon.addonName || `Addon #${addon.addonId}`}
                              {addon.quantity > 0 ? ` (${addon.quantity} pcs)` : ''}
                            </strong>
                            <div className="op-fd-addon-meta">
                              {formatMoney(addon.price, fullDetailsOrder.currency)} each
                            </div>
                          </div>
                        </div>
                        <div className="op-fd-addon-price-block">
                          <span>{formatMoney(addon.total, fullDetailsOrder.currency)}</span>
                          <div className="op-fd-addon-note">Rate included in totals</div>
                        </div>
                      </div>
                    ))}
                    <div className="op-fd-addon-total">
                      <strong>Total Add-ons:</strong>
                      <span>{formatMoney(fullDetailsOrder.orderAddonsTotal ?? fullDetailsOrder.orderAddons.reduce((sum, addon) => sum + addon.total, 0), fullDetailsOrder.currency)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Custom cake block — highlighted */}
            {fullDetailsOrder.isCustomCakeOrder && fullDetailsOrder.customCake && (
              <div className="op-fd-section op-fd-highlight-cake">
                <h4><Cake size={14} /> Custom Cake Details</h4>
                <div className="op-fd-cake-body">
                  {fullDetailsOrder.customCake.image && (
                    <img src={fullDetailsOrder.customCake.image} alt="Custom cake reference" className="op-fd-cake-image" />
                  )}
                  <div className="op-fd-grid">
                    <div><span className="lbl">Flavour</span><span>{fullDetailsOrder.customCake.flavour ?? '—'}</span></div>
                    <div><span className="lbl">Weight</span><span>{fullDetailsOrder.customCake.weight ?? '—'}</span></div>
                    <div><span className="lbl">Shape</span><span>{fullDetailsOrder.customCake.shape ?? '—'}</span></div>
                    <div><span className="lbl">Size</span><span>{fullDetailsOrder.customCake.size ?? '—'}</span></div>
                    <div><span className="lbl">Colour</span><span>{fullDetailsOrder.customCake.colour ?? '—'}</span></div>
                    <div><span className="lbl">Est. price</span><span>{fullDetailsOrder.customCake.price != null ? formatMoney(fullDetailsOrder.customCake.price, fullDetailsOrder.currency) : '—'}</span></div>
                  </div>
                  {fullDetailsOrder.customCake.message && (
                    <p className="op-fd-cake-message"><strong>Cake message:</strong> "{fullDetailsOrder.customCake.message}"</p>
                  )}
                  {fullDetailsOrder.customCake.notes && (
                    <p className="op-fd-cake-message"><strong>Customization notes:</strong> {fullDetailsOrder.customCake.notes}</p>
                  )}
                </div>
              </div>
            )}

            {/* Greeting card block */}
            {(fullDetailsOrder.greetingMessage || fullDetailsOrder.greetingTo || fullDetailsOrder.greetingFrom) && (
              <div className="op-fd-section op-fd-highlight-greeting">
                <h4><Gift size={14} /> Greeting Card</h4>
                <div className="op-fd-grid">
                  <div><span className="lbl">To</span><span>{fullDetailsOrder.greetingTo ?? '—'}</span></div>
                  <div><span className="lbl">From</span><span>{fullDetailsOrder.greetingFrom ?? '—'}</span></div>
                </div>
                {fullDetailsOrder.greetingMessage && (
                  <p className="op-fd-greeting-message">
                    <Sparkles size={13} /> "{fullDetailsOrder.greetingMessage}"
                  </p>
                )}
              </div>
            )}

            {/* Payment & pricing */}
            <div className="op-fd-section">
              <h4>Payment &amp; Pricing</h4>
              <div className="op-fd-grid">
                <div><span className="lbl">Method</span><span>{fullDetailsOrder.paymentMethod}</span></div>
                <div><span className="lbl">Status</span><span>{fullDetailsOrder.paymentStatus ?? '—'}</span></div>
                <div><span className="lbl">Currency</span><span>{fullDetailsOrder.currency}</span></div>
              </div>
              <div className="drawer-cost-breakdown">
                <div className="cost-row"><span>Subtotal:</span><span>{formatMoney(fullDetailsOrder.subtotal, fullDetailsOrder.currency)}</span></div>
                {fullDetailsOrder.orderAddonsTotal && fullDetailsOrder.orderAddonsTotal > 0 && (
                  <div className="cost-row"><span>Add-ons:</span><span>{formatMoney(fullDetailsOrder.orderAddonsTotal, fullDetailsOrder.currency)}</span></div>
                )}
                {fullDetailsOrder.discount > 0 && (
                  <div className="cost-row discount">
                    <span>{fullDetailsOrder.loyaltyCoupon ? `Coupon (${fullDetailsOrder.loyaltyCoupon}):` : 'Discount:'}</span>
                    <span>-{formatMoney(fullDetailsOrder.discount, fullDetailsOrder.currency)}</span>
                  </div>
                )}
                <div className="cost-row"><span>Delivery:</span><span>{formatMoney(fullDetailsOrder.deliveryCharge, fullDetailsOrder.currency)}</span></div>
                <div className="cost-row total"><span>Grand Total:</span><span>{formatMoney(fullDetailsOrder.total, fullDetailsOrder.currency)}</span></div>
              </div>
            </div>

            {/* Extra notes / rejection */}
            {(fullDetailsOrder.notes || fullDetailsOrder.rejectionReason) && (
              <div className="op-fd-section">
                <h4>Notes</h4>
                {fullDetailsOrder.notes && <p className="op-fd-notes">{fullDetailsOrder.notes}</p>}
                {fullDetailsOrder.rejectionReason && (
                  <p className="op-fd-notes op-fd-notes-danger"><strong>Rejection/Cancellation:</strong> {fullDetailsOrder.rejectionReason}</p>
                )}
              </div>
            )}

            {/* Quick actions from full-details view */}
            <div className="op-fd-actions-row">
              <ActionButton variant="secondary" icon={<Printer size={13} />} onClick={() => { setSelectedOrderId(fullDetailsOrder.id); setIsReceiptOpen(true); }}>
                Print Receipt
              </ActionButton>
              <ActionButton variant="secondary" icon={<CreditCard size={13} />} onClick={() => openPaymentModal(fullDetailsOrder)}>
                Payment Link
              </ActionButton>
              <ActionButton variant="ghost" onClick={() => { setSelectedOrderId(fullDetailsOrder.id); setFullDetailsOrderId(null); }}>
                Open Workflow Panel
              </ActionButton>
            </div>

          </div>
        )}
      </Modal>

      {/* ── Side Drawer ── */}
      <Drawer
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrderId(null)}
        title={`Order: ${selectedOrder?.orderNumber ?? selectedOrder?.id ?? ''}`}
      >
        {selectedOrder && (
          <div className="order-inspector-drawer-body">

            {/* Status + chips + action shortcuts */}
            <div className="drawer-header-status-box">
              <span className="lbl">Status:</span>
              <StatusBadge status={selectedOrder.status} />
              {selectedOrder.paymentStatus && (
                <PaymentStatusChip status={selectedOrder.paymentStatus} />
              )}
              <OriginBadges order={selectedOrder} />
              {selectedOrder.assignedAgentName && (
                <span className="op-assigned-driver-chip">
                  <UserCheck size={11} /> Agent: {selectedOrder.assignedAgentName}
                </span>
              )}
              {selectedOrder.assignedDriverName && (
                <span className="op-assigned-driver-chip chip-driver">
                  <Truck size={11} /> Driver: {selectedOrder.assignedDriverName}
                </span>
              )}

              {/* ── Drawer header shortcuts ── */}
              <div className="drawer-header-quick-btns">
                <button
                  className="receipt-print-anchor-btn"
                  onClick={() => setFullDetailsOrderId(selectedOrder.id)}
                  title="View full order details"
                >
                  <Eye size={15} /><span>Full Details</span>
                </button>

                {/* <button
                  className="receipt-print-anchor-btn op-payment-anchor-btn"
                  onClick={() => openPaymentModal(selectedOrder)}
                  title="Generate & share payment link"
                >
                  <CreditCard size={15} /><span>Payment</span>
                </button> */}

                <button
                  className="receipt-print-anchor-btn"
                  onClick={() => setIsReceiptOpen(true)}
                >
                  <Printer size={15} /><span>Print</span>
                </button>
              </div>
            </div>

            {/* Expected delivery + greeting quick summary */}
            {(selectedOrder.deliveryDate || selectedOrder.deliveryTimeSlot || selectedOrder.pickupDate || selectedOrder.pickupTimeSlot || selectedOrder.greetingMessage) && (
              <div className="drawer-spec-block op-quick-summary-block">
                {(selectedOrder.isPickup ? (selectedOrder.pickupDate || selectedOrder.pickupTimeSlot) : (selectedOrder.deliveryDate || selectedOrder.deliveryTimeSlot)) && (
                  <p className="profile-row">
                    <CalendarClock size={13} /> <strong>{selectedOrder.isPickup ? 'Pickup' : 'Expected'}:</strong>{' '}
                    {selectedOrder.isPickup ? formatDate(selectedOrder.pickupDate ?? selectedOrder.deliveryDate) : formatDate(selectedOrder.deliveryDate)}
                    {selectedOrder.isPickup ? (selectedOrder.pickupTimeSlot ?? selectedOrder.deliveryTimeSlot ? ` · ${selectedOrder.pickupTimeSlot ?? selectedOrder.deliveryTimeSlot}` : '') : (selectedOrder.deliveryTimeSlot ? ` · ${selectedOrder.deliveryTimeSlot}` : '')}
                  </p>
                )}
                {selectedOrder.greetingMessage && (
                  <p className="profile-row"><Gift size={13} /> <strong>Greeting:</strong> "{selectedOrder.greetingMessage}"</p>
                )}
              </div>
            )}

            {/* ── Payment status summary (inside drawer) ── */}
            {/* <div className="drawer-spec-block op-payment-drawer-summary">
              <div className="op-pay-drawer-row">
                <CreditCard size={14} />
                <span className="op-pay-drawer-label">Payment</span>
                <span>{selectedOrder.paymentMethod}</span>
                <PaymentStatusChip status={selectedOrder.paymentStatus} />
                <button
                  className="op-pay-drawer-action-link"
                  onClick={() => openPaymentModal(selectedOrder)}
                >
                  {selectedOrder.paymentStatus === 'PAID'
                    ? 'View / Share Link'
                    : 'Generate & Share Link →'}
                </button>
              </div>
            </div> */}

            {/* Items */}
            {/* <div className="drawer-spec-block">
              <h4>Order Items</h4>
              <div className="drawer-items-list">
                {selectedOrder.items.map(item => (
                  <div key={item.id} className="drawer-dish-item">
                    <div className="dish-qty-name">
                      <span className="qty">×{item.quantity}</span>
                      {item.imageUrl && (
                        <img src={item.imageUrl} alt={item.productName} className="op-item-thumb" />
                      )}
                      <div className="desc">
                        <strong className="name">{item.productName}</strong>
                        {item.selectedVariant && (
                          <span className="variant">({item.selectedVariant})</span>
                        )}
                        {item.selectedAddOns.length > 0 && (
                          <span className="addons">+ {item.selectedAddOns.join(', ')}</span>
                        )}
                      </div>
                    </div>
                    <span className="price">
                      {formatMoney(
                        item.lineTotal ?? (item.price + item.addOnPriceTotal) * item.quantity,
                        selectedOrder.currency
                      )}
                    </span>
                  </div>
                ))}
              </div>
              {selectedOrder.orderAddons?.length > 0 && (
                <div className="drawer-spec-block op-fd-order-addons">
                  <h4>Order Add-ons</h4>
                  <div className="op-fd-addons-list">
                    {selectedOrder.orderAddons.map((addon, idx) => (
                      <div key={`${addon.addonId}-${idx}`} className="op-fd-addon-row">
                        <div className="op-fd-addon-thumb-wrapper">
                          {addon.imageUrl ? (
                            <img src={addon.imageUrl} alt={addon.addonName ?? `Addon #${addon.addonId}`} className="op-fd-addon-thumb" />
                          ) : (
                            <div className="op-fd-addon-thumb-placeholder" />
                          )}
                          <div className="op-fd-addon-content">
                            <strong>
                              {addon.addonName || `Addon #${addon.addonId}`}
                              {addon.quantity > 0 ? ` (${addon.quantity} pcs)` : ''}
                            </strong>
                            <div className="op-fd-addon-meta">{formatMoney(addon.price, selectedOrder.currency)} each</div>
                          </div>
                        </div>
                        <div className="op-fd-addon-price-block">
                          <span>{formatMoney(addon.total, selectedOrder.currency)}</span>
                          <div className="op-fd-addon-note">Rate included in totals</div>
                        </div>
                      </div>
                    ))}
                    <div className="op-fd-addon-total">
                      <strong>Total Add-ons:</strong>
                      <span>{formatMoney(selectedOrder.orderAddonsTotal ?? selectedOrder.orderAddons.reduce((sum, addon) => sum + addon.total, 0), selectedOrder.currency)}</span>
                    </div>
                  </div>
                </div>
              )}
              <div className="drawer-cost-breakdown">
                <div className="cost-row"><span>Subtotal:</span><span>{formatMoney(selectedOrder.subtotal, selectedOrder.currency)}</span></div>
                {selectedOrder.discount > 0 && (
                  <div className="cost-row discount">
                    <span>{selectedOrder.loyaltyCoupon ? `Coupon (${selectedOrder.loyaltyCoupon}):` : 'Discount:'}</span>
                    <span>-{formatMoney(selectedOrder.discount, selectedOrder.currency)}</span>
                  </div>
                )}
                <div className="cost-row"><span>Delivery:</span><span>{formatMoney(selectedOrder.deliveryCharge, selectedOrder.currency)}</span></div>
                <div className="cost-row total"><span>Grand Total:</span><span>{formatMoney(selectedOrder.total, selectedOrder.currency)}</span></div>
              </div>
            </div> */}

            {/* Customer */}
            {/* <div className="drawer-spec-block">
              <h4>Customer Details</h4>
              <p className="profile-row"><strong>Name:</strong> {selectedOrder.customerName}</p>
              <p className="profile-row"><strong>Phone:</strong> {selectedOrder.customerPhone}</p>
              {selectedOrder.customerEmail && (
                <p className="profile-row"><strong>Email:</strong> {selectedOrder.customerEmail}</p>
              )}
              {selectedOrder.isPickup ? (
                <>
                  <p className="profile-row"><strong>Pickup order:</strong> Yes</p>
                  {selectedOrder.deliveryAddress ? (
                    <p className="profile-row"><strong>Pickup Location:</strong> {selectedOrder.deliveryAddress}</p>
                  ) : (
                    <p className="profile-row"><strong>Pickup Location:</strong> Not specified</p>
                  )}
                </>
              ) : (
                <p className="profile-row"><strong>Address:</strong> {selectedOrder.deliveryAddress || 'Not specified'}</p>
              )}
              <p className="profile-row">
                <strong>Payment:</strong> {selectedOrder.paymentMethod}
                {selectedOrder.paymentStatus ? ` · ${selectedOrder.paymentStatus}` : ''}
              </p>
              {selectedOrder.orderType && (
                <p className="profile-row"><strong>Order Type:</strong> {selectedOrder.orderType}</p>
              )}
              {selectedOrder.isSalesAgentOrder && (
                <p className="profile-row"><strong>Logged by:</strong> {selectedOrder.createdByName} ({selectedOrder.createdByRole})</p>
              )}
              {selectedOrder.notes && (
                <p className="profile-row notes-block"><strong>Notes:</strong> "{selectedOrder.notes}"</p>
              )}
            </div> */}

            {/* Delivery proof */}
            {(selectedOrder.status === 'delivery_submitted' || selectedOrder.deliveryPhoto) && (
              <div className="drawer-spec-block">
                <h4>Delivery Proof</h4>
                {selectedOrder.deliveryPhoto && (
                  <a href={selectedOrder.deliveryPhoto} target="_blank" rel="noopener noreferrer" className="op-proof-link">
                    View delivery photo ↗
                  </a>
                )}
                {selectedOrder.deliveryNotes && (
                  <p className="profile-row"><strong>Notes:</strong> {selectedOrder.deliveryNotes}</p>
                )}
                {selectedOrder.driverSubmittedAt && (
                  <p className="profile-row">
                    <strong>Submitted:</strong> {new Date(selectedOrder.driverSubmittedAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {selectedOrder.rejectionReason && (
              <div className="drawer-spec-block">
                <h4>Rejection / Cancellation Reason</h4>
                <p className="profile-row notes-block">{selectedOrder.rejectionReason}</p>
              </div>
            )}

            {/* ════ WORKFLOW ACTIONS ════ */}
            <div className="drawer-workflow-actions">
              <h4>Workflow Actions</h4>

              {selectedOrder.status === 'pending' && (
                <div className="workflow-pair-row">
                  <ActionButton
                    variant="success" size="md" icon={<Check size={14} />}
                    loading={isBusy(selectedOrder.id)}
                    disabled={!!actionLoadingId && !isBusy(selectedOrder.id)}
                    onClick={() => handleSimpleAction(selectedOrder.id, (id) => acceptOrder(id), 'Failed to accept order.')}
                  >
                    Accept Order
                  </ActionButton>
                  <ActionButton
                    variant="danger" size="md" icon={<XCircle size={14} />}
                    loading={isBusy(selectedOrder.id)}
                    disabled={!!actionLoadingId && !isBusy(selectedOrder.id)}
                    onClick={() => openConfirmAction('reject', selectedOrder.id)}
                  >
                    Reject Order
                  </ActionButton>
                </div>
              )}

              {selectedOrder.status === 'accepted' && selectedOrder.paymentStatus && (
                <div className="op-payment-hint">
                  <strong>Payment:</strong> {selectedOrder.paymentMethod}
                  {' · '}
                  <span className={`op-payment-status-chip chip-${selectedOrder.paymentStatus.toLowerCase()}`}>
                    {selectedOrder.paymentStatus === 'PENDING' ? 'Collect on delivery (COD)' : selectedOrder.paymentStatus}
                  </span>
                </div>
              )}

              {selectedOrder.status === 'accepted' && (
                <ActionButton
                  variant="primary" icon={<Play size={14} />}
                  loading={isBusy(selectedOrder.id) || loadingKitchenStaff}
                  disabled={!!actionLoadingId && !isBusy(selectedOrder.id)}
                  onClick={() => openKitchenAssignment(selectedOrder.id)}
                >
                  Assign to Kitchen
                </ActionButton>
              )}

              {selectedOrder.status === 'assigned_to_kitchen' && (
                <div className="op-kitchen-info-block">
                  <p className="op-kitchen-assigned-msg">
                    Waiting for kitchen to start. Admin can skip directly to Ready:
                  </p>
                  <ActionButton
                    variant="success" icon={<Check size={14} />}
                    loading={isBusy(selectedOrder.id)}
                    disabled={!!actionLoadingId && !isBusy(selectedOrder.id)}
                    onClick={() => handleSimpleAction(selectedOrder.id, (id) => markOrderReady(id), 'Failed to mark ready.')}
                  >
                    Mark as Ready (skip preparation)
                  </ActionButton>
                </div>
              )}

              {selectedOrder.status === 'preparing' && (
                <ActionButton
                  variant="success" icon={<Check size={14} />}
                  loading={isBusy(selectedOrder.id)}
                  disabled={!!actionLoadingId && !isBusy(selectedOrder.id)}
                  onClick={() => handleSimpleAction(selectedOrder.id, (id) => markOrderReady(id), 'Failed to mark ready.')}
                >
                  Packed &amp; Ready for Dispatch
                </ActionButton>
              )}

              {selectedOrder.status === 'ready' && (
                <div className="driver-dispatch-box">
                  <h5>Assign Delivery Agent</h5>
                  {staffError && <p className="op-drivers-error">{staffError}</p>}
                  {deliveryAgents.length > 0 ? (
                    <div className="couriers-dispatch-grid">
                      {deliveryAgents.map(agent => (
                        <button
                          key={agent.id}
                          className="driver-dispatch-row-btn"
                          disabled={isBusy(selectedOrder.id)}
                          onClick={() => handleAssignAgent(selectedOrder.id, agent.id)}
                        >
                          <span className="dot online" />
                          <div className="driver-info-block">
                            <span className="driver-name">
                              {agent.first_name} {agent.last_name}
                            </span>
                            {agent.phone_no && (
                              <span className="driver-phone cust-sub">{agent.phone_no}</span>
                            )}
                          </div>
                          <span className="driver-assign-label">Assign</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    !staffError && <p className="no-couriers">No delivery agents found.</p>
                  )}
                </div>
              )}

              {selectedOrder.status === 'assigned_to_agent' && (
                <div className="op-agent-assigned-block">
                  <div className="op-agent-info">
                    <UserCheck size={14} />
                    <span>
                      Delivery agent <strong>{selectedOrder.assignedAgentName ?? `#${selectedOrder.assignedAgentId}`}</strong> is handling this order.
                    </span>
                  </div>
                  <ActionButton
                    variant="primary" icon={<Truck size={14} />}
                    loading={isBusy(selectedOrder.id) || loadingDrivers}
                    disabled={!!actionLoadingId && !isBusy(selectedOrder.id)}
                    onClick={() => openDriverAssignment(selectedOrder.id)}
                  >
                    Assign Driver
                  </ActionButton>
                </div>
              )}

              {(selectedOrder.status === 'assigned_to_driver' || selectedOrder.status === 'out_for_delivery') && (
                <div className="op-info-block">
                  <Truck size={14} />
                  <div>
                    <strong>
                      {selectedOrder.status === 'assigned_to_driver'
                        ? 'Waiting for driver to accept'
                        : 'Out for delivery'}
                    </strong>
                    {selectedOrder.assignedDriverName && (
                      <p>Driver: <strong>{selectedOrder.assignedDriverName}</strong></p>
                    )}
                    {selectedOrder.assignedAgentName && (
                      <p>Managed by: <strong>{selectedOrder.assignedAgentName}</strong></p>
                    )}
                    <p className="op-info-hint">Driver actions happen in the Driver Dashboard.</p>
                  </div>
                </div>
              )}

              {selectedOrder.status === 'delivery_submitted' && (
                <div className="op-confirm-delivery-block">
                  <div className="op-info-block">
                    <Check size={14} />
                    <span>
                      Driver <strong>{selectedOrder.assignedDriverName}</strong> has submitted delivery proof.
                    </span>
                  </div>
                  <ActionButton
                    variant="success" icon={<Check size={14} />}
                    loading={isBusy(selectedOrder.id)}
                    disabled={!!actionLoadingId && !isBusy(selectedOrder.id)}
                    onClick={() => handleConfirmDelivery(selectedOrder.id)}
                  >
                    Confirm Delivery Completed
                  </ActionButton>
                </div>
              )}

              {selectedOrder.status === 'delivered' && (
                <div className="op-info-block success">
                  <Check size={14} />
                  <span>Order delivered successfully.</span>
                </div>
              )}

              {(selectedOrder.status === 'cancelled' || selectedOrder.status === 'rejected') && (
                <div className="op-info-block error">
                  <XCircle size={14} />
                  <span>Order {selectedOrder.status}.</span>
                </div>
              )}

              {!['delivered', 'cancelled', 'rejected'].includes(selectedOrder.status) && (
                <ActionButton
                  variant="ghost"
                  loading={isBusy(selectedOrder.id)}
                  disabled={!!actionLoadingId && !isBusy(selectedOrder.id)}
                  onClick={() => openConfirmAction('cancel', selectedOrder.id)}
                >
                  Force Cancel Order
                </ActionButton>
              )}
            </div>

            {/* Timeline */}
            <div className="drawer-spec-block">
              <h4>Order History</h4>
              <div className="timeline-trail">
                {selectedOrder.timeline.length > 0 ? (
                  [...selectedOrder.timeline].reverse().map((tl, idx) => (
                    <div key={idx} className="timeline-node">
                      <div className="node-marker" />
                      <div className="node-pane">
                        <strong>{tl.status.replace(/_/g, ' ').toUpperCase()}</strong>
                        <span className="ts">
                          {tl.timestamp ? new Date(tl.timestamp).toLocaleString() : ''}
                        </span>
                        {tl.changedBy && <span className="ts"> · by {tl.changedBy}</span>}
                        {tl.note && <p className="notes">"{tl.note}"</p>}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-couriers">No history recorded yet.</p>
                )}
              </div>
            </div>

          </div>
        )}
      </Drawer>

      {/* ══════════════════════════════════════════
          PAYMENT MODAL
          ══════════════════════════════════════════ */}
      <Modal
        isOpen={pm.open}
        onClose={closePaymentModal}
        title={`Payment – Order #${pm.order?.orderNumber ?? pm.order?.id ?? ''}`}
        width="480px"
      >
        {pm.order && (
          <div className="op-payment-modal-body">

            {/* Order summary strip */}
            <div className="op-pay-summary-strip">
              <div className="op-pay-summary-row">
                <span className="op-pay-summary-label">Customer</span>
                <span className="op-pay-summary-value">{pm.order.customerName}</span>
              </div>
              <div className="op-pay-summary-row">
                <span className="op-pay-summary-label">Phone</span>
                <span className="op-pay-summary-value">{pm.order.customerPhone}</span>
              </div>
              <div className="op-pay-summary-row">
                <span className="op-pay-summary-label">Method</span>
                <span className="op-pay-summary-value">{pm.order.paymentMethod}</span>
              </div>
              <div className="op-pay-summary-row">
                <span className="op-pay-summary-label">Amount</span>
                <strong className="op-pay-summary-amount">
                  {formatMoney(pm.order.total, pm.order.currency)}
                </strong>
              </div>
              <div className="op-pay-summary-row">
                <span className="op-pay-summary-label">Status</span>
                <PaymentStatusChip
                  status={
                    pm.paymentData?.payment_status ??
                    pm.order.paymentStatus ??
                    'PENDING'
                  }
                />
              </div>
            </div>

            {/* Link section */}
            <div className="op-pay-link-section">
              <div className="op-pay-link-header">
                <CreditCard size={15} />
                <span>Payment Link</span>
                {pm.paymentLink && !pm.loading && (
                  <span className="op-pay-link-ready-dot" />
                )}
              </div>

              {pm.loading && (
                <div className="op-pay-link-loading">
                  <Loader2 size={18} className="op-spin" />
                  <span>Generating Stripe link…</span>
                </div>
              )}

              {pm.error && !pm.loading && (
                <div className="op-pay-link-error">
                  <AlertCircle size={14} />
                  <span>{pm.error}</span>
                  <button
                    className="op-pay-retry-btn"
                    onClick={() => openPaymentModal(pm.order!)}
                  >
                    Retry
                  </button>
                </div>
              )}

              {pm.paymentLink && !pm.loading && (
                <>
                  {/* Link display */}
                  <div className="op-pay-link-box">
                    <span className="op-pay-link-text" title={pm.paymentLink}>
                      {pm.paymentLink}
                    </span>
                  </div>

                  {/* Share buttons */}
                  <div className="op-pay-share-row">
                    <button
                      className={`op-pay-share-btn op-pay-copy-btn ${pm.copied ? 'copied' : ''}`}
                      onClick={handleCopyLink}
                    >
                      {pm.copied ? <Check size={13} /> : <Copy size={13} />}
                      {pm.copied ? 'Copied!' : 'Copy'}
                    </button>

                    <button
                      className="op-pay-share-btn op-pay-wa-btn"
                      onClick={handleShareWhatsApp}
                      title="Send via WhatsApp"
                    >
                      <MessageCircle size={13} />
                      WhatsApp
                    </button>

                    <button
                      className="op-pay-share-btn op-pay-native-btn"
                      onClick={handleNativeShare}
                      title="Share"
                    >
                      <Share2 size={13} />
                      Share
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="op-pay-divider" />

                  {/* Verify & Mark Paid */}
                  <div className="op-pay-action-row">
                    <ActionButton
                      variant="secondary"
                      size="sm"
                      icon={<RefreshCw size={13} />}
                      loading={pm.verifying}
                      disabled={pm.markingPaid}
                      onClick={handleVerifyPayment}
                    >
                      Verify Payment
                    </ActionButton>

                    {!pmIsPaid && (
                      <ActionButton
                        variant="success"
                        size="sm"
                        icon={<Check size={13} />}
                        loading={pm.markingPaid}
                        disabled={pm.verifying}
                        onClick={handleMarkPaid}
                      >
                        Mark as Paid
                      </ActionButton>
                    )}
                  </div>

                  {/* Verify result banner */}
                  {pm.verifyResult && (
                    <div
                      className={`op-pay-verify-banner ${
                        ['PAID', 'COMPLETED', 'SUCCESS'].includes(pm.verifyResult)
                          ? 'op-pay-verify-success'
                          : 'op-pay-verify-pending'
                      }`}
                    >
                      {['PAID', 'COMPLETED', 'SUCCESS'].includes(pm.verifyResult) ? (
                        <>
                          <Check size={14} />
                          Payment confirmed — customer has paid ✓
                        </>
                      ) : (
                        <>
                          <AlertCircle size={14} />
                          Not paid yet — Stripe status: <strong>{pm.verifyResult}</strong>
                          {'. '}Share the link with the customer and verify again later.
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Usage hint */}
            {!pm.loading && !pm.error && (
              <p className="op-pay-hint-text">
                Share the link above with your customer, driver, or delivery agent.
                Once the customer pays via Stripe, click <strong>Verify Payment</strong> to
                confirm and update the order status. For cash/COD orders, use
                <strong> Mark as Paid</strong>.
              </p>
            )}

          </div>
        )}
      </Modal>

      {/* ── Reject / Cancel Reason Modal ── */}
      <Modal
        isOpen={!!confirmAction}
        onClose={closeConfirmAction}
        title={confirmAction?.type === 'reject' ? 'Reject Order' : 'Cancel Order'}
        width="420px"
      >
        {confirmAction && (
          <div className="op-reason-modal-body">
            <p>Add a reason (optional) — saved to the order's audit log.</p>
            <textarea
              className="op-reason-textarea"
              rows={3}
              value={reasonText}
              onChange={e => setReasonText(e.target.value)}
              placeholder="e.g. Out of stock, customer requested cancellation…"
            />
            <div className="op-reason-modal-actions">
              <ActionButton variant="ghost" onClick={closeConfirmAction}>Dismiss</ActionButton>
              <ActionButton
                variant="danger"
                loading={isBusy(confirmAction.orderId)}
                onClick={confirmReasonAction}
              >
                Confirm {confirmAction.type === 'reject' ? 'Rejection' : 'Cancellation'}
              </ActionButton>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Kitchen Staff Modal ── */}
      <Modal
        isOpen={isKitchenModalOpen}
        onClose={() => { setIsKitchenModalOpen(false); setSelectedKitchenOrderId(null); }}
        title="Assign Kitchen Staff"
        width="500px"
      >
        {loadingKitchenStaff ? (
          <div className="op-loading-state"><Loader2 className="op-spin" size={22} /><p>Loading kitchen staff…</p></div>
        ) : kitchenStaff.length === 0 ? (
          <p className="no-couriers">No kitchen staff accounts found.</p>
        ) : (
          <div className="kitchen-staff-list">
            {kitchenStaff.map(staff => (
              <div key={staff.id} className="kitchen-card">
                <div>
                  <strong>{staff.name ?? `${staff.first_name} ${staff.last_name}`}</strong>
                </div>
                <ActionButton
                  variant="primary"
                  loading={isBusy(selectedKitchenOrderId ?? '')}
                  onClick={() => assignKitchenStaff(staff.id)}
                >
                  Assign
                </ActionButton>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* ── Driver Assignment Modal ── */}
      <Modal
        isOpen={isDriverModalOpen}
        onClose={() => { setIsDriverModalOpen(false); setSelectedDriverOrderId(null); }}
        title="Assign Driver"
        width="520px"
      >
        {loadingDrivers ? (
          <div className="op-loading-state"><Loader2 className="op-spin" size={22} /><p>Loading drivers…</p></div>
        ) : drivers.length === 0 ? (
          <p className="no-couriers">No drivers found. Add drivers first.</p>
        ) : (
          <div className="kitchen-staff-list">
            {drivers.map(driver => {
              const driverStatus = (driver.availability_status ?? driver.status ?? 'OFFLINE').toUpperCase();
              const isAvailable  = driverStatus === 'ONLINE' || driverStatus === 'AVAILABLE';
              return (
                <div key={driver.id} className={`kitchen-card ${!isAvailable ? 'driver-card-busy' : ''}`}>
                  <div>
                    <strong>{driver.first_name} {driver.last_name}</strong>
                    <p>{driver.phone_no}</p>
                    <span className={`op-driver-status-chip chip-${driverStatus.toLowerCase()}`}>
                      {isAvailable ? 'Available' : driverStatus === 'BUSY' ? 'Busy' : 'Offline'}
                    </span>
                  </div>
                  <ActionButton
                    variant={isAvailable ? 'primary' : 'secondary'}
                    loading={isBusy(selectedDriverOrderId ?? '')}
                    onClick={() => handleAssignDriver(driver.id)}
                  >
                    {isAvailable ? 'Assign' : 'Assign anyway'}
                  </ActionButton>
                </div>
              );
            })}
          </div>
        )}
      </Modal>

      {/* ── Receipt Modal ── */}
      <Modal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        title="Print Receipt"
        width="380px"
      >
        {selectedOrder && (
          <div className="print-thermal-receipt-sheet">
            <div className="receipt-crown-title">
              <h2>ORDER RECEIPT</h2>
              <p className="divider">- - - - - - - - - - - - - - - - - - -</p>
            </div>

            <div className="receipt-crown-title">
  <img
    src="/assets/logo.png"
    alt="Cake N Take"
    className="receipt-logo"
  />

  {/* <h2>ORDER RECEIPT</h2>
  <p className="divider">- - - - - - - - - - - - - - - - - - -</p> */}
</div>
            <div className="receipt-basics">
              <p><strong>Order No:</strong> {selectedOrder.orderNumber ?? selectedOrder.id}</p>
              <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {new Date(selectedOrder.createdAt).toLocaleTimeString()}</p>
              <p><strong>Customer:</strong> {selectedOrder.customerName}</p>
              <p><strong>Phone:</strong> {selectedOrder.customerPhone}</p>
              <p><strong>Payment:</strong> {selectedOrder.paymentMethod}</p>
              {selectedOrder.paymentStatus && (
                <p><strong>Payment Status:</strong> {selectedOrder.paymentStatus}</p>
              )}
              <p className="divider">- - - - - - - - - - - - - - - - - - -</p>
            </div>
            <div className="receipt-items-table">
              {selectedOrder.items.map(item => (
                <div key={item.id} className="receipt-tr">
                  <span className="qty-name">{item.quantity} × {item.productName.slice(0, 22)}</span>
                  <span className="sum-p">
                    {formatMoney(
                      item.lineTotal ?? (item.price + item.addOnPriceTotal) * item.quantity,
                      selectedOrder.currency
                    )}
                  </span>
                </div>
              ))}
              {selectedOrder.orderAddons?.length > 0 && (
                <>
                  <p className="divider">- - - - - - - - - - - - - - - - - - -</p>
                  {selectedOrder.orderAddons.map((addon, idx) => (
                    <div key={`receipt-addon-${idx}`} className="receipt-tr receipt-addon-row">
                      <span className="qty-name">{addon.quantity} × {addon.addonName || `Addon #${addon.addonId}`}</span>
                      <span className="sum-p">{formatMoney(addon.total, selectedOrder.currency)}</span>
                    </div>
                  ))}
                </>
              )}
              <p className="divider">- - - - - - - - - - - - - - - - - - -</p>
            </div>
            <div className="receipt-financials">
              <div className="calc-row"><span>Subtotal:</span><span>{formatMoney(selectedOrder.subtotal, selectedOrder.currency)}</span></div>
              {selectedOrder.orderAddonsTotal && selectedOrder.orderAddonsTotal > 0 && (
                <div className="calc-row"><span>Add-ons:</span><span>{formatMoney(selectedOrder.orderAddonsTotal, selectedOrder.currency)}</span></div>
              )}
              {selectedOrder.discount > 0 && (
                <div className="calc-row">
                  <span>{selectedOrder.loyaltyCoupon ? `Coupon (${selectedOrder.loyaltyCoupon}):` : 'Discount:'}</span>
                  <span>-{formatMoney(selectedOrder.discount, selectedOrder.currency)}</span>
                </div>
              )}
              <div className="calc-row"><span>Delivery:</span><span>{formatMoney(selectedOrder.deliveryCharge, selectedOrder.currency)}</span></div>
              <p className="divider">- - - - - - - - - - - - - - - - - - -</p>
              <div className="calc-row grand-total"><span>GRAND TOTAL:</span><span>{formatMoney(selectedOrder.total, selectedOrder.currency)}</span></div>
              <p className="divider">- - - - - - - - - - - - - - - - - - -</p>
            </div>
            <div className="receipt-footer-notes"><p>Thank you for your order!</p></div>
            <div className="receipt-modal-controls no-print footer-gap">
              <button className="sage-btn btn-secondary btn-sm" onClick={() => window.print()}>
                <Printer size={13} /><span>Print</span>
              </button>
              <button className="sage-btn btn-primary btn-sm" onClick={() => setIsReceiptOpen(false)}>Close</button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};