import React, { useState, useEffect, useCallback } from 'react';
import {
  Printer, X, Loader2, RefreshCw, AlertCircle, Eye,
  UserCheck, Cake, Gift, CalendarClock, Sparkles,
} from 'lucide-react';
import './Salesagentorder.css';

import { getOrderHistory, getSalesAgentOrders } from '../../services/orderService';

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
  selectedAddOns: string[];
  imageUrl?: string;
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
  status: OrderStatus;
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
    <span className={`sao-status-badge ${cfg.className}`}>
      <span className="badge-dot" />{cfg.label}
    </span>
  );
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
}
function DataTable<T extends { id: string }>({
  columns, data, emptyMessage = 'No items found',
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
              <tr key={row.id}>
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

const Salesagentorder: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [fullDetailsOrderId, setFullDetailsOrderId] = useState<string | null>(null);
  const [receiptOrderId, setReceiptOrderId] = useState<string | null>(null);

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

  const filteredOrders = orders.filter(o => {
    if (statusFilter === 'all')    return true;
    if (statusFilter === 'active') return !['delivered', 'cancelled', 'rejected'].includes(o.status);
    return o.status === statusFilter;
  });

  const fullDetailsOrder = orders.find(o => o.id === fullDetailsOrderId);
  const receiptOrder = orders.find(o => o.id === receiptOrderId);

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

      {/* Filter row */}
      <div className="sao-filters-row">
        {FILTER_TABS.map(({ key, label }) => (
          <button
            key={key}
            className={`sao-filter-tag ${statusFilter === key ? 'active' : ''}`}
            onClick={() => setStatusFilter(key)}
          >
            {label} ({getStatusCount(key)})
          </button>
        ))}
        {/* <button
          className="sao-refresh-btn"
          onClick={fetchOrders}
          disabled={loading}
          title="Refresh orders"
        >
          <RefreshCw size={15} className={loading ? 'sao-spin' : ''} />
        </button> */}
      </div>

      {/* Table */}
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
            columns={[
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
                accessor: (row: Order) => <StatusBadge status={row.status} />,
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
                  </div>
                ),
                align: 'right',
              },
            ]}
            data={filteredOrders}
            emptyMessage="No sales agent orders match this filter."
          />
        </div>
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
              <StatusBadge status={fullDetailsOrder.status} />
              {fullDetailsOrder.paymentStatus && <PaymentStatusChip status={fullDetailsOrder.paymentStatus} />}
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

            <div className="sao-fd-section">
              <h4><CalendarClock size={14} /> {fullDetailsOrder.deliveryMethod === 'PICKUP' ? 'Pickup Schedule' : 'Delivery Schedule'}</h4>
              <div className="sao-fd-grid">
                <div>
                  <span className="lbl">{fullDetailsOrder.deliveryMethod === 'PICKUP' ? 'Pickup date' : 'Expected date'}</span>
                  <span>{formatDate(fullDetailsOrder.deliveryDate)}</span>
                </div>
                <div>
                  <span className="lbl">{fullDetailsOrder.deliveryMethod === 'PICKUP' ? 'Pickup time' : 'Time slot'}</span>
                  <span>{fullDetailsOrder.deliveryTimeSlot ?? '—'}</span>
                </div>
                <div><span className="lbl">Area</span><span>{fullDetailsOrder.detailedAddress?.areaName ?? '—'}</span></div>
              </div>
            </div>

            <div className="sao-fd-section">
              <h4>Customer &amp; Address</h4>
              <div className="sao-fd-grid">
                <div><span className="lbl">Name</span><span>{fullDetailsOrder.customerName}</span></div>
                <div><span className="lbl">Phone</span><span>{fullDetailsOrder.customerPhone}</span></div>
                <div><span className="lbl">Email</span><span>{fullDetailsOrder.customerEmail ?? '—'}</span></div>
              </div>
              <div className="sao-fd-address-block">
                <p><strong>Address:</strong> {fullDetailsOrder.deliveryAddress}</p>
              </div>
            </div>

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

            {fullDetailsOrder.isCustomCakeOrder && fullDetailsOrder.customCake && (
              <div className="sao-fd-section sao-fd-highlight-cake">
                <h4><Cake size={14} /> Custom Cake Details</h4>
                <div className="sao-fd-cake-body">
                  {fullDetailsOrder.customCake.image && (
                    <img src={fullDetailsOrder.customCake.image} alt="Custom cake reference" className="sao-fd-cake-image" />
                  )}
                  <div className="sao-fd-grid">
                    <div><span className="lbl">Flavour</span><span>{fullDetailsOrder.customCake.flavour ?? '—'}</span></div>
                    <div><span className="lbl">Shape</span><span>{fullDetailsOrder.customCake.shape ?? '—'}</span></div>
                    <div><span className="lbl">Colour</span><span>{fullDetailsOrder.customCake.colour ?? '—'}</span></div>
                    <div><span className="lbl">Est. price</span><span>{fullDetailsOrder.customCake.price != null ? formatMoney(fullDetailsOrder.customCake.price, fullDetailsOrder.currency) : '—'}</span></div>
                  </div>
                  {fullDetailsOrder.customCake.message && (
                    <p className="sao-fd-cake-message"><strong>Cake message:</strong> "{fullDetailsOrder.customCake.message}"</p>
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
            </div>

          </div>
        )}
      </Modal>

      {/* ══════ RECEIPT MODAL ══════ */}
      <Modal
        isOpen={!!receiptOrder}
        onClose={() => setReceiptOrderId(null)}
        title="Print Receipt"
        width="380px"
      >
        {receiptOrder && (
          <div className="sao-receipt-sheet">
            <div className="sao-receipt-title">
              <h2>ORDER RECEIPT</h2>
              <p className="sao-divider">- - - - - - - - - - - - - - - - - - -</p>
            </div>
            <div className="sao-receipt-basics">
              <p><strong>Order No:</strong> {receiptOrder.orderNumber ?? receiptOrder.id}</p>
              <p><strong>Date:</strong> {new Date(receiptOrder.createdAt).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {new Date(receiptOrder.createdAt).toLocaleTimeString()}</p>
              <p><strong>Customer:</strong> {receiptOrder.customerName}</p>
              <p><strong>Phone:</strong> {receiptOrder.customerPhone}</p>
              <p><strong>Payment:</strong> {receiptOrder.paymentMethod}</p>
              {receiptOrder.paymentStatus && (
                <p><strong>Payment Status:</strong> {receiptOrder.paymentStatus}</p>
              )}
              <p className="sao-divider">- - - - - - - - - - - - - - - - - - -</p>
            </div>
            <div className="sao-receipt-items">
              {receiptOrder.items.map(item => (
                <div key={item.id} className="sao-receipt-tr">
                  <span className="sao-qty-name">{item.quantity} × {item.productName.slice(0, 22)}</span>
                  <span className="sao-sum-p">
                    {formatMoney(
                      item.lineTotal ?? (item.price + item.addOnPriceTotal) * item.quantity,
                      receiptOrder.currency
                    )}
                  </span>
                </div>
              ))}
              <p className="sao-divider">- - - - - - - - - - - - - - - - - - -</p>
            </div>
            <div className="sao-receipt-financials">
              <div className="sao-calc-row"><span>Subtotal:</span><span>{formatMoney(receiptOrder.subtotal, receiptOrder.currency)}</span></div>
              {receiptOrder.discount > 0 && (
                <div className="sao-calc-row">
                  <span>Discount:</span>
                  <span>-{formatMoney(receiptOrder.discount, receiptOrder.currency)}</span>
                </div>
              )}
              <div className="sao-calc-row"><span>Delivery:</span><span>{formatMoney(receiptOrder.deliveryCharge, receiptOrder.currency)}</span></div>
              <p className="sao-divider">- - - - - - - - - - - - - - - - - - -</p>
              <div className="sao-calc-row sao-grand-total"><span>GRAND TOTAL:</span><span>{formatMoney(receiptOrder.total, receiptOrder.currency)}</span></div>
              <p className="sao-divider">- - - - - - - - - - - - - - - - - - -</p>
            </div>
            <div className="sao-receipt-footer"><p>Thank you for your order!</p></div>
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

    </div>
  );
};

export default Salesagentorder;