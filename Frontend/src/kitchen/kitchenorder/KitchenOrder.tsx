// // import React, { useState, useEffect, useCallback, useMemo } from 'react';
// // import './KitchenOrder.css';
// // import {
// //   getKitchenPending,
// //   getKitchenProcessing,
// //   getKitchenOrderDetails,
// //   startProcessing,
// //   completeKitchenOrder,
// //   getMyCompletedKitchenOrders,
// //   markOrderPickedUp,
// //   markOrderPaymentPaid,
// //   completePickupOrder,
// //   KitchenOrder as KitchenOrderRecord,
// // } from '../../services/kitchenService';

// // /* ─── SVG Icons ──────────────────────────────────────────────────────────────── */
// // const IconChef = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
// //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
// //     <path d="M6 18h12a2 2 0 0 0 2-2v-3H4v3a2 2 0 0 0 2 2z" />
// //     <path d="M12 2v3" />
// //     <path d="M9 3v2" />
// //     <path d="M15 3v2" />
// //     <path d="M19 13V7a5 5 0 0 0-10 0v6" />
// //   </svg>
// // );

// // const IconClock = ({ size = 18 }) => (
// //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
// // );

// // const IconCheckCircle = ({ size = 18 }) => (
// //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
// // );

// // const IconEye = ({ size = 16 }) => (
// //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
// // );

// // const IconImageFallback = ({ size = 22 }) => (
// //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //     <rect x="3" y="3" width="18" height="18" rx="2" />
// //     <circle cx="8.5" cy="8.5" r="1.5" />
// //     <path d="M21 15l-5-5L5 21" />
// //   </svg>
// // );

// // const IconPrinter = ({ size = 16 }: { size?: number }) => (
// //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //     <path d="M6 9V2h12v7" />
// //     <rect x="6" y="13" width="12" height="9" rx="2" />
// //     <path d="M6 18h12" />
// //   </svg>
// // );

// // const IconCalendar = ({ size = 16 }) => (
// //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //     <rect x="3" y="4" width="18" height="18" rx="2" />
// //     <line x1="16" y1="2" x2="16" y2="6" />
// //     <line x1="8" y1="2" x2="8" y2="6" />
// //     <line x1="3" y1="10" x2="21" y2="10" />
// //   </svg>
// // );

// // const IconChevronLeft = ({ size = 18 }) => (
// //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
// //     <polyline points="15 18 9 12 15 6" />
// //   </svg>
// // );

// // const IconChevronRight = ({ size = 18 }) => (
// //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
// //     <polyline points="9 18 15 12 9 6" />
// //   </svg>
// // );

// // const IconCash = ({ size = 14 }) => (
// //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //     <rect x="2" y="6" width="20" height="12" rx="2" />
// //     <circle cx="12" cy="12" r="2" />
// //     <path d="M6 12h.01M18 12h.01" />
// //   </svg>
// // );

// // const IconCake = ({ size = 12 }: { size?: number }) => (
// //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //     <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
// //     <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" />
// //     <path d="M12 3v4" />
// //     <path d="M12 7c-1.5 0-2-1-2-1.5S10.5 4 12 3c1.5 1 2 1.5 2 2.5S13.5 7 12 7z" />
// //   </svg>
// // );

// // // Pickup-bag icon — used to badge / highlight pickup orders on the card and in
// // // the order detail modal's fulfilment section.
// // const IconBag = ({ size = 12 }: { size?: number }) => (
// //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
// //     <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
// //     <path d="M3 6h18" />
// //     <path d="M16 10a4 4 0 0 1-8 0" />
// //   </svg>
// // );

// // // Delivery-truck icon — used to badge / highlight delivery orders on the card
// // // and in the order detail modal's fulfilment section.
// // const IconTruck = ({ size = 12 }: { size?: number }) => (
// //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
// //     <path d="M1 3h15v13H1z" />
// //     <path d="M16 8h4l3 3v5h-7V8z" />
// //     <circle cx="5.5" cy="18.5" r="2.5" />
// //     <circle cx="18.5" cy="18.5" r="2.5" />
// //   </svg>
// // );

// // const IconClose = ({ size = 12 }: { size?: number }) => (
// //   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
// //     <line x1="18" y1="6" x2="6" y2="18" />
// //     <line x1="6" y1="6" x2="18" y2="18" />
// //   </svg>
// // );

// // /* ─── Helpers ────────────────────────────────────────────────────────────────── */

// // interface ItemCustomJson {
// //   variant?: string;
// //   flavour?: string;
// //   flavor?: string;
// //   shape?: string;
// //   add_ons?: string[];
// //   addons?: string[];
// //   add_on_total?: number;
// //   notes?: string;
// //   product_type?: string;
// // }

// // const getCustomJson = (item: any): ItemCustomJson => item?.custom_json || {};

// // const getFlavour = (item: any) => {
// //   const cj = getCustomJson(item);
// //   return cj.flavour || cj.flavor || item?.flavour || item?.flavor || null;
// // };

// // const getVariant = (item: any) => {
// //   const cj = getCustomJson(item);
// //   return cj.variant || item?.variant || null;
// // };

// // const getShape = (item: any) => {
// //   const cj = getCustomJson(item);
// //   return cj.shape || item?.shape || null;
// // };

// // const getAddOns = (item: any): string[] => {
// //   const cj = getCustomJson(item);
// //   const list = cj.add_ons || cj.addons || item?.add_ons || item?.selected_add_ons || [];
// //   return Array.isArray(list) ? list : [];
// // };

// // const getItemNotes = (item: any) => {
// //   const cj = getCustomJson(item);
// //   return cj.notes || item?.notes || null;
// // };

// // // Agent-exclusive items (custom_json.product_type === 'AGENT') are returned by the
// // // backend under `agent_product` instead of `product` (their `product_id` is null).
// // // Always resolve through this helper instead of reading `item.product` directly so
// // // agent-exclusive line items render their name/description/image correctly here,
// // // the same way OrderManagement.tsx already does.
// // const isAgentExclusiveItem = (item: any) => getCustomJson(item)?.product_type === 'AGENT';

// // const getItemProductSource = (item: any) => {
// //   const isAgentExclusive = isAgentExclusiveItem(item);
// //   const agentProduct = item?.agent_product ?? {};
// //   const product = item?.product ?? {};
// //   return isAgentExclusive ? agentProduct : product;
// // };

// // const getItemDisplayName = (item: any) => {
// //   const source = getItemProductSource(item);
// //   return (
// //     source?.name ||
// //     item?.product_name ||
// //     item?.name ||
// //     (isAgentExclusiveItem(item) ? 'Agent Product' : 'Assorted Item')
// //   );
// // };

// // const getItemDisplayImage = (item: any) => {
// //   const source = getItemProductSource(item);
// //   return source?.image_url || source?.imageUrl || source?.image || null;
// // };

// // const getItemDisplayDescription = (item: any) => {
// //   const source = getItemProductSource(item);
// //   return source?.description || null;
// // };

// // const currencySymbol = (cur?: string) => {
// //   const c = cur || (typeof window !== 'undefined' ? localStorage.getItem('currency') || 'INR' : 'INR');
// //   return c === 'INR' ? '₹' : c;
// // };

// // const fmtMoney = (n: number | undefined, cur?: string) => `${currencySymbol(cur)}${Number(n || 0).toFixed(0)}`;

// // const fmtDateTime = (d?: string | null) =>
// //   d ? new Date(d).toLocaleString('en-IN', {
// //     day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
// //   }) : null;

// // const fmtDate = (d?: string) =>
// //   d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null;

// // const getDisplayName = (order: any) => {
// //   if (order?.customer?.name) return order.customer.name;
// //   const nameParts = [order?.customer?.first_name, order?.customer?.last_name].filter(Boolean);
// //   return nameParts.length ? nameParts.join(' ') : order?.customer_name || '—';
// // };

// // const getDisplayEmail = (order: any) => order?.customer?.email || order?.customer_email || '—';
// // const getDisplayPhone = (order: any) => order?.customer?.phone_no || order?.customer_phone || '—';
// // const getDisplayOrderSource = (order: any) => order?.order_source || order?.order_type || '—';
// // const getDisplayRole = (order: any) => order?.customer?.role?.toUpperCase() || (order?.order_type ? order.order_type.toUpperCase() : 'USER');

// // const formatAddressString = (address: any) => {
// //   if (!address) return '—';
// //   const parts = [
// //     address.addressLine1,
// //     address.street,
// //     address.line1,
// //     address.line2,
// //     address.area,
// //     address.city,
// //     address.state,
// //     address.pincode,
// //     address.country,
// //   ].filter(Boolean);
// //   return parts.length ? parts.join(', ') : '—';
// // };


// // const getAddressAreaName = (address: any) => {
// //   const area = address?.area;
// //   if (area === undefined || area === null || area === '') return null;
// //   if (typeof area === 'object') return area.name ?? area.areaName ?? null;
// //   return area;
// // };

// // const getAddressFieldValue = (address: any, keys: string[]) => {
// //   for (const k of keys) {
// //     const v = address?.[k];
// //     if (v !== undefined && v !== null && v !== '') return v;
// //   }
// //   return null;
// // };

// // // const ADDRESS_FIELD_DEFS: { label: string; keys?: string[]; resolver?: (a: any) => any }[] = [
// // //   { label: 'Area', resolver: getAddressAreaName },
// // //   { label: 'Block', keys: ['block'] },
// // //   { label: 'House / Flat No', keys: ['house_flat_no', 'houseFlatNo', 'houseNo', 'flatNo', 'building'] },
// // //   { label: 'Street', keys: ['street'] },
// // //   { label: 'Country', keys: ['country'] },
// // //   { label: 'Landmark', keys: ['landmark'] },
// // //   { label: 'Delivery Notes', keys: ['addressNotes', 'deliveryNotes', 'delivery_notes', 'notes'] },
// // // ];

// // const ADDRESS_FIELD_DEFS: { label: string; keys?: string[]; resolver?: (a: any) => any }[] = [
// //   { label: 'Area', resolver: getAddressAreaName },
// //   { label: 'Block', keys: ['block'] },
// //   { label: 'Building', keys: ['building'] },
// //   { label: 'Avenue', keys: ['avenue'] },
// //   { label: 'Street', keys: ['street'] },
// //   {
// //     label: 'Floor / Apt',
// //     resolver: (a: any) => {
// //       const floor = a?.floor;
// //       const apt = a?.apartment;
// //       if (!floor && !apt) return null;
// //       return [floor, apt].filter(Boolean).join(' ');
// //     },
// //   },
// //   { label: 'Country', keys: ['country'] },
// //    { label: 'Delivery Notes', keys: ['addressNotes', 'deliveryNotes', 'delivery_notes', 'notes'] },
// // ];

// // const getAddressFields = (address: any) =>
// //   ADDRESS_FIELD_DEFS.map(({ label, keys, resolver }) => ({
// //     label,
// //     value: resolver ? resolver(address) : getAddressFieldValue(address, keys || []),
// //   }));


// // const getKitchenOrderAddons = (order: any): any[] => {
// //   if (Array.isArray(order?.order_addons)) return order.order_addons;
// //   if (Array.isArray(order?.order_addons_json)) return order.order_addons_json;
// //   return [];
// // };

// // const getKitchenOrderAddonTotal = (order: any): number => {
// //   const addons = getKitchenOrderAddons(order);
// //   return Number(order?.order_addons_total ?? addons.reduce((sum: number, addon: any) => sum + Number(addon.total ?? (addon.price * addon.quantity || 0)), 0));
// // };

// // // Reads the custom-cake customization payload off an order (custom_cake_json /
// // // custom_cake, whichever the backend sends). This mirrors OrderManagement.tsx's
// // // `customCake` normalization — it was already defined here but never rendered
// // // anywhere in the modal, so custom-cake orders showed everything except their
// // // customization details. It's now wired into the order detail modal below.
// // const getCustomCakeDetails = (order: any) => {
// //   const customCake = order?.custom_cake_json ?? order?.custom_cake ?? null;
// //   if (!customCake || typeof customCake !== 'object') return null;
// //   return {
// //     image: customCake?.image || customCake?.image_url || null,
// //     flavour: customCake?.flavour || customCake?.flavor || null,
// //     weight: customCake?.weight || null,
// //     shape: customCake?.shape || null,
// //     size: customCake?.size || null,
// //     colour: customCake?.colour || customCake?.color || null,
// //     message: customCake?.message || null,
// //     notes: customCake?.notes || null,
// //     price: customCake?.price != null ? Number(customCake.price) : null,
// //   };
// // };

// // const isCustomCakeOrder = (order: any) => !!getCustomCakeDetails(order);

// // const getExpectedDelivery = (order: any): { label: string } | null => {
// //   if (!order) return null;

// //   const explicit =
// //     order.expected_delivery_at ||
// //     order.expected_delivery_time ||
// //     order.estimated_delivery_at;
// //   if (explicit) return { label: fmtDateTime(explicit) as string };

// //   const date = order.delivery_date || order.deliveryDate;
// //   const slot = order.delivery_time_slot ?? order.deliveryTimeSlot;
// //   if (date && slot) return { label: `${fmtDate(date)} · ${slot}` };
// //   if (date) return { label: fmtDate(date) as string };
// //   if (slot) return { label: slot };

// //   return null;
// // };

// // interface FulfillmentInfo {
// //   isPickup: boolean;
// //   date: string | null;
// //   time: string | null;
// // }

// // // Resolves the single relevant date/time for an order based on its actual
// // // fulfilment method, so the UI never shows the wrong (or empty) schedule:
// // //  · PICKUP   → pickup_date / pickup_time_slot (falls back to the delivery_*
// // //               fields only if pickup-specific ones are missing)
// // //  · DELIVERY → delivery_date / delivery_time_slot only — pickup fields are
// // //               never read or shown for a delivery order.
// // // Card and modal both call this so "hide the other type's info" logic lives
// // // in one place instead of being duplicated per view.
// // const getFulfillmentInfo = (order: any): FulfillmentInfo => {
// //   const isPickup = (order?.delivery_method || '').toUpperCase() === 'PICKUP';

// //   if (isPickup) {
// //     const rawDate = order?.pickup_date || order?.delivery_date || order?.deliveryDate;
// //     const time = order?.pickup_time_slot || order?.delivery_time_slot || order?.deliveryTimeSlot || null;
// //     return { isPickup: true, date: rawDate ? fmtDate(rawDate) : null, time };
// //   }

// //   const rawDate = order?.delivery_date || order?.deliveryDate;
// //   const time = order?.delivery_time_slot ?? order?.deliveryTimeSlot ?? null;
// //   return { isPickup: false, date: rawDate ? fmtDate(rawDate) : null, time };
// // };

// // /* ─── Calendar helpers ───────────────────────────────────────────────────────── */

// // type CalendarStatusKey = 'grey' | 'yellow' | 'green' | 'red';

// // // pending/assigned → grey · preparing → yellow · ready/completed/delivered → green · cancelled/rejected → red
// // const getStatusColorKey = (status?: string): CalendarStatusKey => {
// //   const s = (status || '').toUpperCase();
// //   if (['CANCELLED', 'CANCELED', 'REJECTED'].includes(s)) return 'red';
// //   if (['PREPARING', 'PROCESSING'].includes(s)) return 'yellow';
// //   if (['DELIVERED', 'COMPLETED', 'READY', 'READY_FOR_PICKUP', 'READY_FOR_DISPATCH'].includes(s)) return 'green';
// //   return 'grey';
// // };

// // const CALENDAR_STATUS_LEGEND: { key: CalendarStatusKey; label: string }[] = [
// //   { key: 'grey', label: 'Pending' },
// //   { key: 'yellow', label: 'Preparing' },
// //   { key: 'green', label: 'Completed' },
// //   { key: 'red', label: 'Cancelled' },
// // ];

// // interface CalendarOrderInfo {
// //   date: Date;
// //   dateLabel: string;
// //   timeLabel: string | null;
// // }

// // // Resolve the date/time to plot an order on the calendar:
// // //  · Pickup orders  → pickup date & time (falls back to delivery date/slot)
// // //  · Delivery orders with an expected delivery date → that date & time slot
// // //  · Otherwise (nothing scheduled yet) → the order's created date & time
// // const getOrderCalendarInfo = (order: any): CalendarOrderInfo => {
// //   const isPickup = (order?.delivery_method || '').toUpperCase() === 'PICKUP';

// //   if (isPickup) {
// //     const d = order?.pickup_date || order?.delivery_date;
// //     if (d) {
// //       return {
// //         date: new Date(d),
// //         dateLabel: 'Pickup',
// //         timeLabel: order?.pickup_time_slot || order?.delivery_time_slot || null,
// //       };
// //     }
// //   } else if (order?.delivery_date) {
// //     return {
// //       date: new Date(order.delivery_date),
// //       dateLabel: 'Expected Delivery',
// //       timeLabel: order?.delivery_time_slot || null,
// //     };
// //   }

// //   const created = new Date(order?.created_at);
// //   return {
// //     date: created,
// //     dateLabel: 'Order Placed',
// //     timeLabel: created.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
// //   };
// // };

// // const dateKey = (d: Date) =>
// //   `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// // const buildMonthGrid = (monthDate: Date): (Date | null)[] => {
// //   const year = monthDate.getFullYear();
// //   const month = monthDate.getMonth();
// //   const firstDay = new Date(year, month, 1);
// //   const startWeekday = firstDay.getDay();
// //   const daysInMonth = new Date(year, month + 1, 0).getDate();

// //   const cells: (Date | null)[] = [];
// //   for (let i = 0; i < startWeekday; i++) cells.push(null);
// //   for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
// //   while (cells.length % 7 !== 0) cells.push(null);
// //   return cells;
// // };

// // const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];



// // // The logged-in kitchen staff member's id — used only for display purposes
// // // now (e.g. "(You)" tag), since /kitchen/my-completed-orders already scopes
// // // the Completed tab server-side.
// // const getCurrentUserId = (): number | null => {
// //   try {
// //     const stored = JSON.parse(localStorage.getItem('user') || '{}');
// //     return stored?.id ?? null;
// //   } catch {
// //     return null;
// //   }
// // };

// // /* ─── Date filter helpers ────────────────────────────────────────────────────── */
// // type DateFilterMode = 'all' | 'today' | 'month' | 'custom';

// // const DATE_FILTER_OPTIONS: { key: DateFilterMode; label: string }[] = [
// //   { key: 'all', label: 'All Time' },
// //   { key: 'today', label: 'Today' },
// //   { key: 'month', label: 'By Month' },
// //   { key: 'custom', label: 'By Date' },
// // ];

// // const isSameDay = (a: Date, b: Date) =>
// //   a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

// // const KitchenOrder: React.FC = () => {
// //   const currentUserId = useMemo(getCurrentUserId, []);

// //   const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'processing' | 'completed'>('all');
// //   const [pendingOrders, setPendingOrders] = useState<KitchenOrderRecord[]>([]);
// //   const [processingOrders, setProcessingOrders] = useState<KitchenOrderRecord[]>([]);
// //   const [completedOrders, setCompletedOrders] = useState<KitchenOrderRecord[]>([]);
// //   const [loading, setLoading] = useState<boolean>(true);
// //   const [actionLoading, setActionLoading] = useState<number | null>(null);
// //   const [actionError, setActionError] = useState<string | null>(null);

// //   // Date-wise / month-wise / day-wise filter
// //   const [dateFilterMode, setDateFilterMode] = useState<DateFilterMode>('all');
// //   const [customDate, setCustomDate] = useState<string>('');   // yyyy-mm-dd
// //   const [customMonth, setCustomMonth] = useState<string>(''); // yyyy-mm

// //   // Calendar view modal
// //   const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
// //   const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
// //   const [calendarSelectedDate, setCalendarSelectedDate] = useState<Date | null>(null);

// //   // Which order's "Payment" popover is currently open (card grid + modal share this)
// //   const [paymentMenuOrderId, setPaymentMenuOrderId] = useState<number | null>(null);

// //   // Detailed Modal states
// //   const [selectedOrder, setSelectedOrder] = useState<any>(null);
// //   const [modalOpen, setModalOpen] = useState<boolean>(false);
// //   const [modalLoading, setModalLoading] = useState<boolean>(false);
// //   // Receipt modal state (separate from detailed view)
// //   const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
// //   const [receiptLoading, setReceiptLoading] = useState<boolean>(false);

// //   const fetchAllKitchenData = useCallback(async () => {
// //     try {
// //       setLoading(true);

// //       // /kitchen/my-completed-orders is scoped server-side to the logged-in
// //       // kitchen staff member, so no client-side filtering is needed anymore.
// //       const [pending, processing, myCompleted] = await Promise.all([
// //         getKitchenPending(),
// //         getKitchenProcessing(),
// //         getMyCompletedKitchenOrders(),
// //       ]);

// //       setPendingOrders(pending);
// //       setProcessingOrders(processing);
// //       setCompletedOrders(myCompleted);
// //     } catch (err) {
// //       console.error('Failed to load kitchen dashboard data', err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, []);

// //   useEffect(() => {
// //     fetchAllKitchenData();
// //   }, [fetchAllKitchenData]);

// //   const allOrders = useMemo(() => {
// //     return [...pendingOrders, ...processingOrders, ...completedOrders].sort(
// //       (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
// //     );
// //   }, [pendingOrders, processingOrders, completedOrders]);

// //   const visibleOrders = useMemo(() => {
// //     switch (activeTab) {
// //       case 'pending': return pendingOrders;
// //       case 'processing': return processingOrders;
// //       case 'completed': return completedOrders;
// //       default: return allOrders;
// //     }
// //   }, [activeTab, pendingOrders, processingOrders, completedOrders, allOrders]);

// //   // Apply date / month / day filter on top of the active tab's list
// //   const filteredOrders = useMemo(() => {
// //     if (dateFilterMode === 'all') return visibleOrders;

// //     return visibleOrders.filter((order: any) => {
// //       const created = new Date(order.created_at);

// //       if (dateFilterMode === 'today') {
// //         return isSameDay(created, new Date());
// //       }

// //       if (dateFilterMode === 'month') {
// //         if (!customMonth) return true;
// //         const [y, m] = customMonth.split('-').map(Number);
// //         return created.getFullYear() === y && created.getMonth() + 1 === m;
// //       }

// //       if (dateFilterMode === 'custom') {
// //         if (!customDate) return true;
// //         const [y, m, d] = customDate.split('-').map(Number);
// //         return created.getFullYear() === y && created.getMonth() + 1 === m && created.getDate() === d;
// //       }

// //       return true;
// //     });
// //   }, [visibleOrders, dateFilterMode, customDate, customMonth]);

// //   // Group every known order (not just the active tab) by the calendar date
// //   // resolved via getOrderCalendarInfo(), so the calendar modal can plot dots
// //   // regardless of which tab / date-filter is currently active.
// //   const calendarOrdersByDay = useMemo(() => {
// //     const map: Record<string, { order: any; info: CalendarOrderInfo }[]> = {};
// //     allOrders.forEach((order: any) => {
// //       const info = getOrderCalendarInfo(order);
// //       if (!info.date || isNaN(info.date.getTime())) return;
// //       const key = dateKey(info.date);
// //       if (!map[key]) map[key] = [];
// //       map[key].push({ order, info });
// //     });
// //     return map;
// //   }, [allOrders]);

// //   const calendarSelectedDayEntries = useMemo(() => {
// //     if (!calendarSelectedDate) return [];
// //     return calendarOrdersByDay[dateKey(calendarSelectedDate)] || [];
// //   }, [calendarSelectedDate, calendarOrdersByDay]);

// //   const openCalendarView = () => {
// //     setCalendarMonth(new Date());
// //     setCalendarSelectedDate(null);
// //     setIsCalendarOpen(true);
// //   };

// //   const goToPrevMonth = () => {
// //     setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
// //   };

// //   const goToNextMonth = () => {
// //     setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
// //   };

// //   const goToCurrentMonth = () => {
// //     const today = new Date();
// //     setCalendarMonth(today);
// //     setCalendarSelectedDate(today);
// //   };

// //   const handleViewOrderDetails = async (orderId: number) => {
// //     try {
// //       setModalLoading(true);
// //       setModalOpen(true);
// //       const data = await getKitchenOrderDetails(orderId);
// //       setSelectedOrder(data);
// //     } catch (err) {
// //       console.error("Could not fetch full order record manifest", err);
// //     } finally {
// //       setModalLoading(false);
// //     }
// //   };

// //   const handleOpenReceipt = async (orderId: number) => {
// //     try {
// //       setReceiptLoading(true);
// //       // fetch full details (same endpoint) so receipt has all fields
// //       const data = await getKitchenOrderDetails(orderId);
// //       setSelectedOrder(data);
// //       setIsReceiptOpen(true);
// //     } catch (err) {
// //       console.error('Could not fetch order for receipt', err);
// //     } finally {
// //       setReceiptLoading(false);
// //     }
// //   };

// //   const handleStartPreparation = async (orderId: number, e: React.MouseEvent) => {
// //     e.stopPropagation();
// //     setActionError(null);
// //     try {
// //       setActionLoading(orderId);
// //       await startProcessing(orderId);
// //       await fetchAllKitchenData();

// //       if (modalOpen && selectedOrder?.id === orderId) {
// //         const updated = await getKitchenOrderDetails(orderId);
// //         setSelectedOrder(updated);
// //       }
// //     } catch (err: any) {
// //       const msg =
// //         err?.response?.data?.error ||
// //         "Couldn't start preparation — someone may have already claimed this order.";
// //       setActionError(msg);
// //       // Refresh so the button/status reflects reality if someone else beat us to it.
// //       await fetchAllKitchenData();
// //     } finally {
// //       setActionLoading(null);
// //     }
// //   };

// //   const handleMarkReady = async (orderId: number, e: React.MouseEvent) => {
// //     e.stopPropagation();
// //     setActionError(null);
// //     try {
// //       setActionLoading(orderId);
// //       await completeKitchenOrder(orderId);
// //       // This order now moves into "Completed (Mine)" — refetch so the
// //       // completed list (and its count) picks it up immediately.
// //       await fetchAllKitchenData();
// //       if (modalOpen && selectedOrder?.id === orderId) {
// //         setModalOpen(false);
// //       }
// //     } catch (err: any) {
// //       const msg = err?.response?.data?.error || "Couldn't mark this order ready.";
// //       setActionError(msg);
// //     } finally {
// //       setActionLoading(null);
// //     }
// //   };

// //   // Kitchen marks a PICKUP order as delivered/collected (POST /orders/:id/pickup)
// //   // Backend sets status straight to DELIVERED — no intermediate step.
// //   const handleMarkDelivered = async (orderId: number, e: React.MouseEvent) => {
// //     e.stopPropagation();
// //     setActionError(null);
// //     try {
// //       setActionLoading(orderId);
// //       await markOrderPickedUp(orderId);
// //       await fetchAllKitchenData();
// //       if (modalOpen && selectedOrder?.id === orderId) {
// //         setModalOpen(false);
// //       }
// //     } catch (err: any) {
// //       const msg = err?.response?.data?.error || "Couldn't mark this order as delivered.";
// //       setActionError(msg);
// //     } finally {
// //       setActionLoading(null);
// //     }
// //   };

// //   // Kitchen confirms how payment was collected — COD or Online — for a pickup order
// //   const handleSelectPaymentMethod = async (orderId: number, method: 'COD' | 'UPI', e: React.MouseEvent) => {
// //     e.stopPropagation();
// //     setActionError(null);
// //     setPaymentMenuOrderId(null);
// //     try {
// //       setActionLoading(orderId);
// //       await markOrderPaymentPaid(orderId, method);
// //       await fetchAllKitchenData();
// //       if (modalOpen && selectedOrder?.id === orderId) {
// //         const updated = await getKitchenOrderDetails(orderId);
// //         setSelectedOrder(updated);
// //       }
// //     } catch (err: any) {
// //       const msg = err?.response?.data?.error || "Couldn't update payment status.";
// //       setActionError(msg);
// //     } finally {
// //       setActionLoading(null);
// //     }
// //   };

// //   const clearDateFilter = () => {
// //     setDateFilterMode('all');
// //     setCustomDate('');
// //     setCustomMonth('');
// //   };

// //   // Kitchen picks COD or Online for a pickup order → marks paid AND delivered, in one call
// //   const handleCompletePickup = async (orderId: number, method: 'COD' | 'UPI', e: React.MouseEvent) => {
// //     e.stopPropagation();
// //     setActionError(null);
// //     setPaymentMenuOrderId(null);
// //     try {
// //       setActionLoading(orderId);
// //       await completePickupOrder(orderId, method);
// //       await fetchAllKitchenData();
// //       if (modalOpen && selectedOrder?.id === orderId) {
// //         setModalOpen(false);
// //       }
// //     } catch (err: any) {
// //       const msg = err?.response?.data?.error || "Couldn't complete this pickup order.";
// //       setActionError(msg);
// //     } finally {
// //       setActionLoading(null);
// //     }
// //   };

// //   const togglePaymentMenu = (orderId: number, e: React.MouseEvent) => {
// //     e.stopPropagation();
// //     setPaymentMenuOrderId((prev) => (prev === orderId ? null : orderId));
// //   };

// //   // Human-readable summary of the active date filter, shown next to the
// //   // segmented control so it's obvious what's currently applied.
// //   const activeDateFilterSummary = useMemo(() => {
// //     if (dateFilterMode === 'all') return null;
// //     if (dateFilterMode === 'today') return 'Today';
// //     if (dateFilterMode === 'month') {
// //       if (!customMonth) return 'Pick a month';
// //       const [y, m] = customMonth.split('-').map(Number);
// //       return new Date(y, m - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
// //     }
// //     if (dateFilterMode === 'custom') {
// //       if (!customDate) return 'Pick a date';
// //       return fmtDate(customDate);
// //     }
// //     return null;
// //   }, [dateFilterMode, customDate, customMonth]);

// //   return (
// //     <div className="ko-workspace-container">

// //       {/* ─── Page Title Header ─── */}
// //       <div className="ko-page-header">
// //         <div className="ko-page-header-text">
// //           <h2>Kitchen Dashboard</h2>
// //           <p>Monitor real-time line preparation items, active orders, and live chef fulfillment tasks.</p>
// //         </div>
// //       </div>

// //       {actionError && (
// //         <div className="ko-action-error-banner">
// //           <span>{actionError}</span>
// //           <button onClick={() => setActionError(null)}>Dismiss</button>
// //         </div>
// //       )}

// //       {/* ─── Counter Metrics Top Row Grid ─── */}
// //       {/* <div className="ko-stats-grid">
// //         <div className="ko-stat-card" onClick={() => setActiveTab('all')}>
// //           <div className="ko-stat-icon icon-all"><IconChef size={24} /></div>
// //           <div className="ko-stat-details">
// //             <h3>{allOrders.length}</h3>
// //             <p>Total Orders Today</p>
// //           </div>
// //         </div>
// //         <div className="ko-stat-card" onClick={() => setActiveTab('pending')}>
// //           <div className="ko-stat-icon icon-pending"><IconClock size={24} /></div>
// //           <div className="ko-stat-details">
// //             <h3>{pendingOrders.length}</h3>
// //             <p>Awaiting Prep</p>
// //           </div>
// //         </div>
// //         <div className="ko-stat-card" onClick={() => setActiveTab('processing')}>
// //           <div className="ko-stat-icon icon-processing"><IconChef size={24} /></div>
// //           <div className="ko-stat-details">
// //             <h3>{processingOrders.length}</h3>
// //             <p>Currently In Oven</p>
// //           </div>
// //         </div>
// //         <div className="ko-stat-card" onClick={() => setActiveTab('completed')}>
// //           <div className="ko-stat-icon icon-completed"><IconCheckCircle size={24} /></div>
// //           <div className="ko-stat-details">
// //             <h3>{completedOrders.length}</h3>
// //             <p>Completed by Me</p>
// //           </div>
// //         </div>
// //       </div> */}

// //       {/* ─── Filter Navigation Tab Row ─── */}
// //       <div className="ko-tabs-navigation-bar">
// //         {/* <button className={`ko-tab-nav-item ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
// //           All Orders <span className="ko-tab-badge bg-all">{allOrders.length}</span>
// //         </button> */}
// //         <button className={`ko-tab-nav-item ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
// //           Pending <span className="ko-tab-badge bg-pending">{pendingOrders.length}</span>
// //         </button>
// //         <button className={`ko-tab-nav-item ${activeTab === 'processing' ? 'active' : ''}`} onClick={() => setActiveTab('processing')}>
// //           Processing <span className="ko-tab-badge bg-processing">{processingOrders.length}</span>
// //         </button>
// //         <button className={`ko-tab-nav-item ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>
// //           Completed (Mine) <span className="ko-tab-badge bg-completed">{completedOrders.length}</span>
// //         </button>
// //          <button className={`ko-tab-nav-item ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
// //           All Orders <span className="ko-tab-badge bg-all">{allOrders.length}</span>
// //         </button>
// //       </div>

// //       {/* ─── Date / Month / Day Filter Bar (redesigned as a segmented control) ─── */}
// //       <div className="ko-date-filter-bar">
// //         <div className="ko-filter-segment-group" role="tablist" aria-label="Filter orders by date">
// //           {DATE_FILTER_OPTIONS.map(opt => (
// //             <button
// //               key={opt.key}
// //               role="tab"
// //               aria-selected={dateFilterMode === opt.key}
// //               className={`ko-filter-segment-btn ${dateFilterMode === opt.key ? 'active' : ''}`}
// //               onClick={() => setDateFilterMode(opt.key)}
// //             >
// //               {opt.key === 'today' && <IconClock size={13} />}
// //               {(opt.key === 'month' || opt.key === 'custom') && <IconCalendar size={13} />}
// //               {opt.label}
// //             </button>
// //           ))}
// //         </div>

// //         {dateFilterMode === 'month' && (
// //           <label className="ko-date-filter-input-wrap">
// //             <IconCalendar size={14} />
// //             <input
// //               type="month"
// //               className="ko-date-filter-input"
// //               value={customMonth}
// //               onChange={(e) => setCustomMonth(e.target.value)}
// //               autoFocus
// //             />
// //           </label>
// //         )}

// //         {dateFilterMode === 'custom' && (
// //           <label className="ko-date-filter-input-wrap">
// //             <IconCalendar size={14} />
// //             <input
// //               type="date"
// //               className="ko-date-filter-input"
// //               value={customDate}
// //               onChange={(e) => setCustomDate(e.target.value)}
// //               autoFocus
// //             />
// //           </label>
// //         )}

// //         {activeDateFilterSummary && (
// //           <span className="ko-date-filter-active-chip">
// //             Showing: <strong>{activeDateFilterSummary}</strong>
// //             <button className="ko-date-filter-chip-clear" onClick={clearDateFilter} title="Reset filter" aria-label="Clear date filter">
// //               <IconClose size={11} />
// //             </button>
// //           </span>
// //         )}

// //         {/* <button className="ko-calendar-view-btn" onClick={openCalendarView}>
// //           <IconCalendar size={15} /> Calendar View
// //         </button> */}
// //       </div>

// //       {/* ─── Active Queue Layout Loop ─── */}
// //       {loading ? (
// //         <div className="ko-workspace-center-loader">
// //           <div className="ko-spinner" />
// //           <p>Syncing hot items with kitchen lines...</p>
// //         </div>
// //       ) : filteredOrders.length === 0 ? (
// //         <div className="ko-empty-state">
// //           <IconChef size={50} />
// //           <h3>No Orders Found</h3>
// //           <p>
// //             {activeTab === 'completed'
// //               ? "You haven't completed any orders yet."
// //               : `There are no items currently categorized under the "${activeTab}" status loop.`}
// //           </p>
// //         </div>
// //       ) : (
// //         <div className="ko-orders-grid">
// //           {filteredOrders.map((order: any) => {
// //             const dateStr = new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
// //             const currentStatus = (order.status || 'PENDING').toUpperCase();
// //             const isMine = order.preparation_started_by === currentUserId;
// //             const isPickup = (order.delivery_method || '').toUpperCase() === 'PICKUP';
// //             const isReadyForPickup = currentStatus === 'READY_FOR_PICKUP';
// //             const isPaid = (order.payment_status || '').toUpperCase() === 'PAID';
// //             const isPaymentMenuOpen = paymentMenuOrderId === order.id;
// //             const isCustomCake = isCustomCakeOrder(order);
// //             const fulfillment = getFulfillmentInfo(order);

// //             return (
// //               <div
// //                 key={order.id}
// //                 className={`ko-order-card ${isPickup ? 'card-fulfillment-pickup' : 'card-fulfillment-delivery'}`}
// //                 onClick={() => handleViewOrderDetails(order.id)}
// //               >
// //                 <div className="ko-card-upper-row">
// //                   <div>
// //                     <h4 className="ko-order-title">Order #{order.order_number || String(order.id).padStart(5, '0')}</h4>
// //                     <span className="ko-order-timestamp"><IconClock size={12} /> {dateStr}</span>
// //                   </div>
// //                   <span className={`ko-status-pill pill-${currentStatus.toLowerCase()}`}>
// //                     {currentStatus.replace(/_/g, ' ')}
// //                   </span>
// //                 </div>

// //                 {isCustomCake && (
// //                   <div className="op-origin-badge badge-custom-cake" style={{ marginBottom: 6 }}>
// //                     <IconCake size={11} /> Custom Cake Order
// //                   </div>
// //                 )}

// //                 {/* Fulfilment highlight row — pickup orders show only pickup
// //                     date/time, delivery orders show only delivery date/time. */}
// //                 <div className={`ko-fulfillment-row ${isPickup ? 'is-pickup' : 'is-delivery'}`}>
// //                   <span className="ko-fulfillment-type-badge">
// //                     {isPickup ? <IconBag size={12} /> : <IconTruck size={12} />}
// //                     {isPickup ? 'Pickup' : 'Delivery'}
// //                   </span>
// //                   <span className="ko-fulfillment-schedule">
// //                     <IconCalendar size={12} />
// //                     {fulfillment.date || 'Date TBD'}
// //                     {fulfillment.time && <span className="ko-fulfillment-time"> · {fulfillment.time}</span>}
// //                   </span>
// //                 </div>

// //                 {currentStatus === "PREPARING" && (
// //                   <div className="ko-owner-tag">
// //                     <strong>Kitchen Staff:</strong>{" "}
// //                     {typeof order.preparation_started_by === 'object' ? order.preparation_started_by?.name : order.preparation_started_by || "Unknown"}
// //                     {isMine && " (You)"}
// //                   </div>
// //                 )}

// //                 {/* Products Manifest Block */}
// //                 <div className="ko-card-items-preview">
// //                   {order.items?.map((item: any, idx: number) => (
// //                     <div key={item.id || idx} className="ko-preview-item-line">
// //                       <span className="ko-item-quantity">×{item.quantity}</span>
// //                       <span className="ko-item-name">{getItemDisplayName(item)}</span>
// //                     </div>
// //                   ))}
// //                 </div>

// //                 {/* Interactive Workflow Execution Footer Button Row */}
// //                 <div className="ko-card-action-bar">
// //                   <button className="ko-action-icon-btn" onClick={(e) => { e.stopPropagation(); handleViewOrderDetails(order.id); }} title="View Details">
// //                     <IconEye size={16} />
// //                   </button>

// //                   <button className="ko-action-icon-btn" onClick={(e) => { e.stopPropagation(); handleOpenReceipt(order.id); }} title="Open Receipt">
// //                     <IconPrinter size={16} />
// //                   </button>

// //                   {currentStatus === "ASSIGNED_TO_KITCHEN" && (
// //                     <button
// //                       className="ko-action-primary-btn bg-prep"
// //                       disabled={actionLoading === order.id}
// //                       onClick={(e) => handleStartPreparation(order.id, e)}
// //                     >
// //                       {actionLoading === order.id ? "Starting..." : "Start Preparation"}
// //                     </button>
// //                   )}

// //                   {currentStatus === "PREPARING" && (
// //                     <button
// //                       className="ko-action-primary-btn bg-complete"
// //                       disabled={actionLoading === order.id}
// //                       onClick={(e) => handleMarkReady(order.id, e)}
// //                     >
// //                       {actionLoading === order.id ? "Completing..." : "Mark Ready"}
// //                     </button>
// //                   )}

// //                   {/* Pickup-only: single "Mark Delivered" action that also captures payment */}
// //                   {isPickup && isReadyForPickup && (
// //                     <div className="ko-payment-menu-wrap">
// //                       <button
// //                         className="ko-action-primary-btn bg-deliver"
// //                         disabled={actionLoading === order.id}
// //                         onClick={(e) => togglePaymentMenu(order.id, e)}
// //                       >
// //                         {actionLoading === order.id ? "Completing..." : "Mark Delivered"}
// //                       </button>

// //                       {paymentMenuOrderId === order.id && (
// //                         <div className="ko-payment-popover" onClick={(e) => e.stopPropagation()}>
// //                           <div className="ko-payment-popover-label">Payment received via</div>
// //                           <button
// //                             className="ko-payment-popover-option"
// //                             onClick={(e) => handleCompletePickup(order.id, 'COD', e)}
// //                           >
// //                             Cash (COD)
// //                           </button>
// //                           <button
// //                             className="ko-payment-popover-option"
// //                             onClick={(e) => handleCompletePickup(order.id, 'UPI', e)}
// //                           >
// //                             Online (UPI)
// //                           </button>
// //                         </div>
// //                       )}
// //                     </div>
// //                   )}
// //                 </div>
// //               </div>
// //             );
// //           })}
// //         </div>
// //       )}

// //       {/* ─── Detailed Order Modal Overlay View Sheet ─── */}
// //       {modalOpen && (
// //         <div className="ko-modal-backdrop" onClick={() => setModalOpen(false)}>
// //           <div className="ko-modal-content-card" onClick={(e) => e.stopPropagation()}>
// //             <div className="ko-modal-header">
// //               <h3>Full Order Details — {selectedOrder ? (selectedOrder.order_number || selectedOrder.id) : ''}</h3>
// //               <button className="ko-modal-close-cross" onClick={() => setModalOpen(false)}>×</button>
// //             </div>

// //             <div className="ko-modal-body-area op-full-details-modal-body">
// //               {modalLoading || !selectedOrder ? (
// //                 <div className="ko-modal-spinner-wrapper">
// //                   <div className="ko-spinner" />
// //                   <p>Pulling full order manifest details...</p>
// //                 </div>
// //               ) : (
// //                 <>
// //                   {/* Top badges + status */}
// //                   <div className="op-fd-top-row">
// //                     <div className={`ko-status-pill pill-${selectedOrder.status?.toLowerCase()}`}>{selectedOrder.status}</div>
// //                     {isCustomCakeOrder(selectedOrder) && (
// //                       <span className="op-origin-badge badge-custom-cake">
// //                         <IconCake size={11} /> Custom Cake Order
// //                       </span>
// //                     )}
// //                     <div className="op-origin-badges">
// //                       <div className="op-origin-item"><strong>Placed by</strong><div>{getDisplayName(selectedOrder)}</div></div>
// //                       <div className="op-origin-item"><strong>Role</strong><div>{getDisplayRole(selectedOrder)}</div></div>
// //                       <div className="op-origin-item"><strong>Phone</strong><div>{getDisplayPhone(selectedOrder)}</div></div>
// //                       <div className="op-origin-item"><strong>Email</strong><div>{getDisplayEmail(selectedOrder)}</div></div>
// //                       <div className="op-origin-item"><strong>Order source</strong><div>{getDisplayOrderSource(selectedOrder)}</div></div>
// //                     </div>
// //                   </div>

// //                   {selectedOrder.preparation_started_at && (
// //                     <div className="ko-modal-delivery-info">
// //                       <IconClock size={16} />
// //                       <span className="ko-delivery-label">Preparation started:</span>
// //                       <span className="ko-delivery-value">
// //                         {fmtDateTime(selectedOrder.preparation_started_at)}
// //                         {selectedOrder.preparation_started_by?.id === currentUserId ? ' · by you' : ''}
// //                       </span>
// //                     </div>
// //                   )}

// //                   {/* Fulfilment schedule — pickup orders show pickup date/time
// //                       only, delivery orders show delivery date/time + area only. */}
// //                   {(() => {
// //                     const modalFulfillment = getFulfillmentInfo(selectedOrder);
// //                     return (
// //                       <div className={`op-fd-section op-fd-fulfillment ${modalFulfillment.isPickup ? 'is-pickup' : 'is-delivery'}`}>
// //                         <h4>
// //                           {modalFulfillment.isPickup ? <IconBag size={14} /> : <IconCalendar size={14} />}
// //                           {modalFulfillment.isPickup ? 'Pickup Schedule' : 'Delivery Schedule'}
// //                         </h4>
// //                         <div className="op-fd-grid">
// //                           <div>
// //                             <span className="lbl">{modalFulfillment.isPickup ? 'Pickup date' : 'Expected date'}</span>
// //                             <span>{modalFulfillment.date || '—'}</span>
// //                           </div>
// //                           <div>
// //                             <span className="lbl">{modalFulfillment.isPickup ? 'Pickup time' : 'Time slot'}</span>
// //                             <span>{modalFulfillment.time || '—'}</span>
// //                           </div>
// //                           {!modalFulfillment.isPickup && (
// //                             <div>
// //                               <span className="lbl">Area</span>
// //                               <span>
// //                                 {(selectedOrder.delivery_address?.area && typeof selectedOrder.delivery_address.area === 'object')
// //                                   ? (selectedOrder.delivery_address.area.name ?? selectedOrder.delivery_address.area.areaName ?? '—')
// //                                   : (selectedOrder.delivery_address?.area
// //                                       ?? selectedOrder.detailedAddress?.areaName
// //                                       ?? (selectedOrder.area && typeof selectedOrder.area === 'object' ? (selectedOrder.area.name ?? selectedOrder.area.areaName) : selectedOrder.area)
// //                                       ?? '—')}
// //                               </span>
// //                             </div>
// //                           )}
// //                           <div><span className="lbl">Fulfilment</span><span>{selectedOrder.delivery_method || '—'}</span></div>
// //                         </div>
// //                       </div>
// //                     );
// //                   })()}

// //                   <div className="op-fd-section">
// //                     <h4>Customer &amp; Address</h4>
// //                     <div className="op-fd-grid">
// //                       <div><span className="lbl">Name</span><span>{getDisplayName(selectedOrder)}</span></div>
// //                       <div><span className="lbl">Phone</span><span>{getDisplayPhone(selectedOrder)}</span></div>
// //                       <div><span className="lbl">Email</span><span>{getDisplayEmail(selectedOrder)}</span></div>
// //                     </div>
// //                     {/* <div className="op-fd-address-block">
// //                       <p><strong>Address:</strong> {formatAddressString(selectedOrder.delivery_address)}</p>
// //                       {selectedOrder.delivery_address && (
// //                         <ul className="op-fd-address-list">
// //                           {selectedOrder.delivery_address.building && <li><strong>Building:</strong> {selectedOrder.delivery_address.building}</li>}
// //                           {selectedOrder.delivery_address.block && <li><strong>Block:</strong> {selectedOrder.delivery_address.block}</li>}
// //                           {selectedOrder.delivery_address.avenue && <li><strong>Avenue:</strong> {selectedOrder.delivery_address.avenue}</li>}
// //                           {selectedOrder.delivery_address.street && <li><strong>Street:</strong> {selectedOrder.delivery_address.street}</li>}
// //                           {selectedOrder.delivery_address.floor && <li><strong>Floor/Apt:</strong> {selectedOrder.delivery_address.floor} {selectedOrder.delivery_address.apartment}</li>}
// //                           {selectedOrder.delivery_address.landmark && <li><strong>Landmark:</strong> {selectedOrder.delivery_address.landmark}</li>}
// //                           {selectedOrder.delivery_address.addressNotes && <li><strong>Address notes:</strong> {selectedOrder.delivery_address.addressNotes}</li>}
// //                         </ul>
// //                       )}
// //                     </div> */}

// //                     <div className="op-fd-address-block">
// //   <div className="op-fd-grid">
// //     {getAddressFields(selectedOrder.delivery_address).map((f) => (
// //       <div key={f.label}>
// //         <span className="lbl">{f.label}</span>
// //         <span>{f.value || '-'}</span>
// //       </div>
// //     ))}
// //   </div>
// // </div>

// //                   </div>

// //                   <div className="ko-modal-section-box">
// //                     <h5 className="ko-section-title">Line Kitchen Production Items</h5>

// //                     <div className="ko-modal-items-table">
// //                       {selectedOrder.items?.map((item: any) => {
// //                         const flavour = getFlavour(item);
// //                         const variant = getVariant(item);
// //                         const shape = getShape(item);
// //                         const addOns = getAddOns(item);
// //                         const itemNotes = getItemNotes(item);
// //                         const lineTotal = item.line_total ?? (item.price * item.quantity);
// //                         const displayName = getItemDisplayName(item);
// //                         const displayImage = getItemDisplayImage(item);
// //                         const displayDescription = getItemDisplayDescription(item);

// //                         return (
// //                           <div key={item.id} className="ko-modal-item-row-detailed">
// //                             {/* Left: Product Image Box */}
// //                             <div className="ko-modal-item-image-wrap">
// //                               {displayImage ? (
// //                                 <img
// //                                   className="ko-modal-item-image"
// //                                   src={displayImage}
// //                                   alt={displayName}
// //                                 />
// //                               ) : (
// //                                 <div className="ko-modal-item-image-fallback">
// //                                   <IconImageFallback size={20} />
// //                                 </div>
// //                               )}
// //                             </div>

// //                             {/* Right: Detailed Content Area */}
// //                             <div className="ko-modal-item-body">

// //                               {/* Header Row: Qty Badge & Title */}
// //                               <div className="ko-modal-item-header">
// //                                 <span className="ko-modal-qty-bubble">
// //                                   {item.quantity}x
// //                                 </span>
// //                                 <p className="item-main-title">{displayName}</p>
// //                               </div>

// //                               {/* Description */}
// //                               {displayDescription && (
// //                                 <p className="item-sub-desc">{displayDescription}</p>
// //                               )}

// //                               {/* Specifications (Flavour, Variant, Shape) */}
// //                               {(flavour || variant || shape) && (
// //                                 <div className="ko-item-meta-chips">
// //                                   {flavour && (
// //                                     <span className="ko-item-meta-chip chip-flavour">
// //                                       Flavour: <strong>{flavour}</strong>
// //                                     </span>
// //                                   )}
// //                                   {variant && (
// //                                     <span className="ko-item-meta-chip chip-variant">
// //                                       Variant: <strong>{variant}</strong>
// //                                     </span>
// //                                   )}
// //                                   {shape && (
// //                                     <span className="ko-item-meta-chip chip-shape">
// //                                       Shape: <strong>{shape}</strong>
// //                                     </span>
// //                                   )}
// //                                 </div>
// //                               )}

// //                               {/* Add-ons */}
// //                               {addOns.length > 0 && (
// //                                 <div className="ko-modal-item-addons">
// //                                   <span className="ko-addons-label">Add-ons</span>
// //                                   <div className="ko-item-meta-chips-small">
// //                                     {addOns.map((addOn, i) => (
// //                                       <span key={i} className="ko-item-meta-chip chip-addon">{addOn}</span>
// //                                     ))}
// //                                   </div>
// //                                 </div>
// //                               )}

// //                               {/* Special Instructions Note */}
// //                               {itemNotes && (
// //                                 <div className="ko-item-custom-note-box">
// //                                   <span className="note-label">Instruction:</span>
// //                                   <p className="item-custom-note-text">"{itemNotes}"</p>
// //                                 </div>
// //                               )}

// //                               {/* Price Calculations */}
// //                               <div className="ko-modal-item-price-row">
// //                                 <span className="ko-item-unit-price">
// //                                   {fmtMoney(item.price, selectedOrder?.currency)} × {item.quantity}
// //                                 </span>
// //                                 <span className="ko-item-line-total">
// //                                   {fmtMoney(lineTotal, selectedOrder?.currency)}
// //                                 </span>
// //                               </div>

// //                             </div>
// //                           </div>
// //                         );
// //                       })}
// //                     </div>
// //                   </div>

// //                   {getKitchenOrderAddons(selectedOrder).length > 0 && (
// //                     <div className="op-fd-order-addons">
// //                       <h4>Order Add-ons</h4>
// //                       <div className="op-fd-addons-list">
// //                         {getKitchenOrderAddons(selectedOrder).map((addon: any, idx: number) => (
// //                           <div key={`${addon.addon_id ?? addon.addonId}-${idx}`} className="op-fd-addon-row">
// //                             <div className="op-fd-addon-thumb-wrapper">
// //                               <div className="op-fd-addon-thumb-placeholder" />
// //                               <div className="op-fd-addon-content">
// //                                 <strong>{addon.addon_name || addon.addonName || addon.name || `Addon #${addon.addon_id ?? addon.addonId ?? idx + 1}`}{addon.quantity ? ` (${addon.quantity} pcs)` : ''}</strong>
// //                                 <div className="op-fd-addon-meta">{fmtMoney(addon.price, selectedOrder.currency)} each</div>
// //                               </div>
// //                             </div>
// //                             <div className="op-fd-addon-price-block">
// //                               <span>{fmtMoney(addon.total ?? (addon.price * addon.quantity), selectedOrder.currency)}</span>
// //                               <div className="op-fd-addon-note">Rate included in totals</div>
// //                             </div>
// //                           </div>
// //                         ))}
// //                         <div className="op-fd-addon-total">
// //                           <strong>Total Add-ons:</strong>
// //                           <span>{fmtMoney(getKitchenOrderAddonTotal(selectedOrder), selectedOrder.currency)}</span>
// //                         </div>
// //                       </div>
// //                     </div>
// //                   )}

// //                   {/* ── Custom Cake Details — previously computed but never rendered ── */}
// //                   {(() => {
// //                     const customCake = getCustomCakeDetails(selectedOrder);
// //                     if (!customCake) return null;
// //                     return (
// //                       <div className="op-fd-section op-fd-highlight-cake">
// //                         <h4><IconCake size={14} /> Custom Cake Details</h4>
// //                         <div className="op-fd-cake-body">
// //                           {customCake.image && (
// //                             <img src={customCake.image} alt="Custom cake reference" className="op-fd-cake-image" />
// //                           )}
// //                           <div className="op-fd-grid">
// //                             <div><span className="lbl">Flavour</span><span>{customCake.flavour ?? '—'}</span></div>
// //                             <div><span className="lbl">Weight</span><span>{customCake.weight ?? '—'}</span></div>
// //                             <div><span className="lbl">Shape</span><span>{customCake.shape ?? '—'}</span></div>
// //                             <div><span className="lbl">Size</span><span>{customCake.size ?? '—'}</span></div>
// //                             <div><span className="lbl">Colour</span><span>{customCake.colour ?? '—'}</span></div>
// //                             <div><span className="lbl">Est. price</span><span>{customCake.price != null ? fmtMoney(customCake.price, selectedOrder.currency) : '—'}</span></div>
// //                           </div>
// //                           {customCake.message && (
// //                             <p className="op-fd-cake-message"><strong>Cake message:</strong> "{customCake.message}"</p>
// //                           )}
// //                           {customCake.notes && (
// //                             <p className="op-fd-cake-message"><strong>Customization notes:</strong> {customCake.notes}</p>
// //                           )}
// //                         </div>
// //                       </div>
// //                     );
// //                   })()}

// //                   {(selectedOrder.greeting_message || selectedOrder.greeting_from || selectedOrder.greeting_to) && (
// //                     <div className="op-fd-section op-fd-highlight-greeting">
// //                       <h4>Greeting Card</h4>
// //                       <div className="op-fd-grid">
// //                         <div><span className="lbl">To</span><span>{selectedOrder.greeting_to || '—'}</span></div>
// //                         <div><span className="lbl">From</span><span>{selectedOrder.greeting_from || '—'}</span></div>
// //                       </div>
// //                       {selectedOrder.greeting_message && (
// //                         <p className="op-fd-greeting-message">"{selectedOrder.greeting_message}"</p>
// //                       )}
// //                     </div>
// //                   )}

// //                   <div className="op-fd-section">
// //                     <h4>Pricing Summary</h4>
// //                     {(() => {
// //                       const itemSubtotal = Number(selectedOrder.subtotal ?? selectedOrder.sub_total ?? (selectedOrder.items?.reduce((sum: number, item: any) => sum + Number(item.line_total ?? (item.price * item.quantity || 0)), 0) || 0));
// //                       const addonsTotal = getKitchenOrderAddonTotal(selectedOrder);
// //                       const discount = Number(selectedOrder.discount || 0);
// //                       const deliveryCharge = Number(selectedOrder.delivery_charge ?? selectedOrder.deliveryCharge ?? 0);
// //                       const grandTotal = Number(selectedOrder.total ?? selectedOrder.grand_total ?? (itemSubtotal + addonsTotal - discount + deliveryCharge));

// //                       return (
// //                         <div className="drawer-cost-breakdown">
// //                           <div className="cost-row"><span>Subtotal:</span><span>{fmtMoney(itemSubtotal, selectedOrder.currency)}</span></div>
// //                           {addonsTotal > 0 && <div className="cost-row"><span>Add-ons:</span><span>{fmtMoney(addonsTotal, selectedOrder.currency)}</span></div>}
// //                           {discount > 0 && <div className="cost-row discount"><span>Discount:</span><span>-{fmtMoney(discount, selectedOrder.currency)}</span></div>}
// //                           <div className="cost-row"><span>Delivery:</span><span>{fmtMoney(deliveryCharge, selectedOrder.currency)}</span></div>
// //                           <div className="cost-row total"><span>Grand Total:</span><span>{fmtMoney(grandTotal, selectedOrder.currency)}</span></div>
// //                         </div>
// //                       );
// //                     })()}
// //                   </div>

// //                   {selectedOrder.delivery_notes && (
// //                     <div className="ko-modal-section-box notes-box">
// //                       <h5>Special Kitchen Notes / Instructions</h5>
// //                       <p className="notes-text-render">"{selectedOrder.delivery_notes}"</p>
// //                     </div>
// //                   )}

// //                   <div className="op-fd-actions-row">
// //                     <button className="sage-btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); handleOpenReceipt(selectedOrder.id); }}>
// //                       <IconPrinter size={13} /> Print Receipt
// //                     </button>
// //                     <button className="sage-btn btn-ghost btn-sm" onClick={() => { setModalOpen(false); }}>
// //                       Open Workflow Panel
// //                     </button>
// //                   </div>

// //                   <div className="ko-modal-action-footer">
// //                     <button className="ko-modal-cancel-btn" onClick={() => setModalOpen(false)}>Close Window</button>
// //                     {selectedOrder.status === "ASSIGNED_TO_KITCHEN" && (
// //                       <button
// //                         className="ko-action-primary-btn bg-prep"
// //                         disabled={actionLoading === selectedOrder.id}
// //                         onClick={(e) => handleStartPreparation(selectedOrder.id, e)}
// //                       >
// //                         {actionLoading === selectedOrder.id ? "Starting..." : "Start Preparation"}
// //                       </button>
// //                     )}
// //                     {selectedOrder.status === "PREPARING" && (
// //                       <button
// //                         className="ko-action-primary-btn bg-complete"
// //                         disabled={actionLoading === selectedOrder.id}
// //                         onClick={(e) => handleMarkReady(selectedOrder.id, e)}
// //                       >
// //                         {actionLoading === selectedOrder.id ? "Completing..." : "Mark Ready"}
// //                       </button>
// //                     )}

// //                     {(selectedOrder.delivery_method || '').toUpperCase() === 'PICKUP' &&
// //                       selectedOrder.status === "READY_FOR_PICKUP" && (
// //                       <div className="ko-payment-menu-wrap">
// //                         <button
// //                           className="ko-action-primary-btn bg-deliver"
// //                           disabled={actionLoading === selectedOrder.id}
// //                           onClick={(e) => togglePaymentMenu(selectedOrder.id, e)}
// //                         >
// //                           {actionLoading === selectedOrder.id ? "Completing..." : "Mark Delivered"}
// //                         </button>

// //                         {paymentMenuOrderId === selectedOrder.id && (
// //                           <div className="ko-payment-popover" onClick={(e) => e.stopPropagation()}>
// //                             <div className="ko-payment-popover-label">Payment received via</div>
// //                             <button
// //                               className="ko-payment-popover-option"
// //                               onClick={(e) => handleCompletePickup(selectedOrder.id, 'COD', e)}
// //                             >
// //                               Cash (COD)
// //                             </button>
// //                             <button
// //                               className="ko-payment-popover-option"
// //                               onClick={(e) => handleCompletePickup(selectedOrder.id, 'UPI', e)}
// //                             >
// //                               Online (UPI)
// //                             </button>
// //                           </div>
// //                         )}
// //                       </div>
// //                     )}
// //                   </div>
// //                 </>
// //               )}
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {/* Receipt modal (opens when clicking receipt icon on an order card) */}
// //       {isReceiptOpen && (
// //         <div className="ko-modal-backdrop" onClick={() => setIsReceiptOpen(false)}>
// //           <div className="ko-modal-content-card" onClick={(e) => e.stopPropagation()}>
// //             <div className="ko-modal-header">
// //               <h3>Print Receipt</h3>
// //               <button className="ko-modal-close-cross" onClick={() => setIsReceiptOpen(false)}>×</button>
// //             </div>

// //             <div className="print-thermal-receipt-sheet">
// //               {receiptLoading || !selectedOrder ? (
// //                 <div className="ko-modal-spinner-wrapper">
// //                   <div className="ko-spinner" />
// //                   <p>Loading receipt…</p>
// //                 </div>
// //               ) : (
// //                 <>
// //                   <div className="receipt-crown-title">
// //                     <h2>ORDER RECEIPT</h2>
// //                     <p className="divider">- - - - - - - - - - - - - - - - - - -</p>
// //                   </div>

// //                   <div className="receipt-basics">
// //                     <p><strong>Order No:</strong> {selectedOrder.order_number ?? selectedOrder.id}</p>
// //                     <p><strong>Date:</strong> {fmtDate(selectedOrder.created_at)}</p>
// //                     <p><strong>Time:</strong> {new Date(selectedOrder.created_at).toLocaleTimeString()}</p>
// //                     <p><strong>Customer:</strong> {selectedOrder.customer?.first_name} {selectedOrder.customer?.last_name}</p>
// //                     <p><strong>Phone:</strong> {selectedOrder.customer?.phone_no || selectedOrder.customerPhone}</p>
// //                     <p><strong>Payment:</strong> {selectedOrder.payment_method || selectedOrder.paymentMethod}</p>
// //                     <p className="divider">- - - - - - - - - - - - - - - - - - -</p>
// //                   </div>

// //                   <div className="receipt-items-table">
// //                     {selectedOrder.items.map((item: any) => (
// //                       <div key={`r-${item.id}`} className="receipt-item-row">
// //                         <div className="receipt-item-main">
// //                           <span className="receipt-item-name">{item.quantity} x {getItemDisplayName(item) || item.productName}</span>
// //                           <span className="receipt-item-price">{fmtMoney(item.line_total ?? (item.price * item.quantity), selectedOrder.currency)}</span>
// //                         </div>
// //                         {getAddOns(item).length > 0 && (
// //                           <div className="receipt-item-addons">Add-ons: {getAddOns(item).join(', ')}</div>
// //                         )}
// //                       </div>
// //                     ))}

// //                     {selectedOrder.order_addons?.length > 0 && (
// //                       <>
// //                         <div className="receipt-divider">-----------------------------------------</div>
// //                         {selectedOrder.order_addons.map((addon: any, idx: number) => (
// //                           <div key={`ra-${idx}`} className="receipt-item-row receipt-addon-row">
// //                             <div className="receipt-item-main">
// //                               <span className="receipt-item-name">{addon.quantity} × {addon.addon_name || addon.addonName || `Addon #${addon.addon_id ?? addon.addonId}`}</span>
// //                               <span className="receipt-item-price">{fmtMoney(addon.total ?? (addon.price * addon.quantity), selectedOrder.currency)}</span>
// //                             </div>
// //                           </div>
// //                         ))}
// //                       </>
// //                     )}
// //                   </div>

// //                   <div className="receipt-divider">-----------------------------------------</div>

// //                   {/* totals */}
// //                   {(() => {
// //                     const itemSubtotal = Number(selectedOrder.subtotal ?? (selectedOrder.items?.reduce((s: number, it: any) => s + Number(it.line_total ?? (it.price * it.quantity || 0)), 0) || 0));
// //                     const addonsTotal = Number(selectedOrder.order_addons_total ?? (selectedOrder.order_addons?.reduce((s: number, a: any) => s + Number(a.total ?? (a.price * a.quantity || 0)), 0) || 0));
// //                     const discount = Number(selectedOrder.discount || 0);
// //                     const deliveryCharge = Number(selectedOrder.delivery_charge ?? selectedOrder.deliveryCharge ?? 0);
// //                     const computedGrandTotal = Number(selectedOrder.total ?? (itemSubtotal + addonsTotal - discount + deliveryCharge));

// //                     return (
// //                       <div className="receipt-totals">
// //                         <div className="receipt-total-row"><span>Subtotal:</span><span>{fmtMoney(itemSubtotal, selectedOrder.currency)}</span></div>
// //                         {addonsTotal > 0 && <div className="receipt-total-row"><span>Add-ons:</span><span>{fmtMoney(addonsTotal, selectedOrder.currency)}</span></div>}
// //                         {discount > 0 && <div className="receipt-total-row"><span>Discount:</span><span>-{fmtMoney(discount, selectedOrder.currency)}</span></div>}
// //                         <div className="receipt-total-row"><span>Delivery:</span><span>{fmtMoney(deliveryCharge, selectedOrder.currency)}</span></div>
// //                         <div className="receipt-divider">-----------------------------------------</div>
// //                         <div className="receipt-total-row grand-total"><span>GRAND TOTAL:</span><span>{fmtMoney(computedGrandTotal, selectedOrder.currency)}</span></div>
// //                       </div>
// //                     );
// //                   })()}

// //                   <div className="receipt-divider">-----------------------------------------</div>

// //                   <div className="receipt-center receipt-footer-msg">
// //                     <p>Thank you for dining with CakeNTake!</p>
// //                     <p>Baked fresh daily, prepared artisanally.</p>
// //                     <p className="receipt-url">www.cakentake.com</p>
// //                   </div>

// //                   <div className="receipt-modal-controls no-print footer-gap">
// //                     <button className="sage-btn btn-secondary btn-sm" onClick={() => window.print()}>
// //                       <IconPrinter size={13} /><span>Print</span>
// //                     </button>
// //                     <button className="sage-btn btn-primary btn-sm" onClick={() => setIsReceiptOpen(false)}>Close</button>
// //                   </div>
// //                 </>
// //               )}
// //             </div>

// //           </div>
// //         </div>
// //       )}

// //       {/* ─── Calendar View Modal ─── */}
// //       {isCalendarOpen && (
// //         <div className="ko-modal-backdrop" onClick={() => setIsCalendarOpen(false)}>
// //           <div className="ko-calendar-modal-card" onClick={(e) => e.stopPropagation()}>
// //             <div className="ko-modal-header ko-calendar-modal-header">
// //               <h3><IconCalendar size={17} /> Order Calendar</h3>
// //               <button className="ko-modal-close-cross" onClick={() => setIsCalendarOpen(false)}>×</button>
// //             </div>

// //             <div className="ko-calendar-modal-body">
// //               {/* Month navigation */}
// //               <div className="ko-calendar-nav-row">
// //                 <button className="ko-calendar-nav-btn" onClick={goToPrevMonth} title="Previous month">
// //                   <IconChevronLeft size={18} />
// //                 </button>
// //                 <div className="ko-calendar-month-label">
// //                   {calendarMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
// //                 </div>
// //                 <button className="ko-calendar-nav-btn" onClick={goToNextMonth} title="Next month">
// //                   <IconChevronRight size={18} />
// //                 </button>
// //                 <button className="ko-calendar-today-btn" onClick={goToCurrentMonth}>
// //                   Today
// //                 </button>
// //               </div>

// //               {/* Legend */}
// //               <div className="ko-calendar-legend-row">
// //                 {CALENDAR_STATUS_LEGEND.map(item => (
// //                   <span key={item.key} className="ko-calendar-legend-item">
// //                     <span className={`ko-cal-dot ko-cal-dot-${item.key}`} />
// //                     {item.label}
// //                   </span>
// //                 ))}
// //               </div>

// //               {/* Weekday header */}
// //               <div className="ko-calendar-weekday-row">
// //                 {WEEKDAY_LABELS.map(w => (
// //                   <div key={w} className="ko-calendar-weekday-cell">{w}</div>
// //                 ))}
// //               </div>

// //               {/* Month grid */}
// //               <div className="ko-calendar-grid">
// //                 {buildMonthGrid(calendarMonth).map((cellDate, idx) => {
// //                   if (!cellDate) {
// //                     return <div key={`empty-${idx}`} className="ko-calendar-day-cell ko-calendar-day-empty" />;
// //                   }

// //                   const key = dateKey(cellDate);
// //                   const entries = calendarOrdersByDay[key] || [];
// //                   const today = new Date();
// //                   const isToday = isSameDay(cellDate, today);
// //                   const isSelected = calendarSelectedDate ? isSameDay(cellDate, calendarSelectedDate) : false;

// //                   // Unique status colors present on this date (max 4 dots shown)
// //                   const statusKeys = Array.from(new Set(entries.map(e => getStatusColorKey(e.order.status))));

// //                   return (
// //                     <button
// //                       key={key}
// //                       className={`ko-calendar-day-cell ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''} ${entries.length ? 'has-orders' : ''}`}
// //                       onClick={() => setCalendarSelectedDate(cellDate)}
// //                     >
// //                       <span className="ko-calendar-day-number">{cellDate.getDate()}</span>
// //                       {entries.length > 0 && (
// //                         <span className="ko-calendar-day-dots">
// //                           {statusKeys.slice(0, 4).map(sk => (
// //                             <span key={sk} className={`ko-cal-dot ko-cal-dot-${sk}`} />
// //                           ))}
// //                           {entries.length > 4 && <span className="ko-calendar-day-more">+{entries.length - 4}</span>}
// //                         </span>
// //                       )}
// //                     </button>
// //                   );
// //                 })}
// //               </div>

// //               {/* Selected date detail panel */}
// //               <div className="ko-calendar-detail-panel">
// //                 {!calendarSelectedDate ? (
// //                   <p className="ko-calendar-detail-empty">Select a date on the calendar to see its orders.</p>
// //                 ) : calendarSelectedDayEntries.length === 0 ? (
// //                   <>
// //                     <h5 className="ko-calendar-detail-heading">
// //                       {calendarSelectedDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
// //                     </h5>
// //                     <p className="ko-calendar-detail-empty">No orders scheduled on this date.</p>
// //                   </>
// //                 ) : (
// //                   <>
// //                     <h5 className="ko-calendar-detail-heading">
// //                       {calendarSelectedDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
// //                       {' '}· {calendarSelectedDayEntries.length} order{calendarSelectedDayEntries.length > 1 ? 's' : ''}
// //                     </h5>
// //                     <div className="ko-calendar-detail-list">
// //                       {calendarSelectedDayEntries.map(({ order, info }) => {
// //                         const sk = getStatusColorKey(order.status);
// //                         return (
// //                           <button
// //                             key={order.id}
// //                             className="ko-calendar-detail-row"
// //                             onClick={() => {
// //                               setIsCalendarOpen(false);
// //                               handleViewOrderDetails(order.id);
// //                             }}
// //                           >
// //                             <span className={`ko-cal-dot ko-cal-dot-${sk}`} />
// //                             <span className="ko-calendar-detail-order-num">
// //                               #{order.order_number || String(order.id).padStart(5, '0')}
// //                             </span>
// //                             <span className="ko-calendar-detail-tag">
// //                               {info.dateLabel}{info.timeLabel ? ` · ${info.timeLabel}` : ''}
// //                             </span>
// //                             <span className={`ko-status-pill pill-${(order.status || '').toLowerCase()} ko-calendar-detail-status`}>
// //                               {(order.status || '').replace(/_/g, ' ')}
// //                             </span>
// //                           </button>
// //                         );
// //                       })}
// //                     </div>
// //                   </>
// //                 )}
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //     </div>
// //   );
// // };

// // export default KitchenOrder;




// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import './KitchenOrder.css';
// import { QRCodeSVG } from 'qrcode.react';
// import {
//   getKitchenPending,
//   getKitchenProcessing,
//   getKitchenOrderDetails,
//   startProcessing,
//   completeKitchenOrder,
//   getMyCompletedKitchenOrders,
//   markOrderPickedUp,
//   markOrderPaymentPaid,
//   completePickupOrder,
//   KitchenOrder as KitchenOrderRecord,
// } from '../../services/kitchenService';
// import { createPaymentLink } from '../../services/paymentService';

// /* ─── SVG Icons ──────────────────────────────────────────────────────────────── */
// const IconChef = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
//     <path d="M6 18h12a2 2 0 0 0 2-2v-3H4v3a2 2 0 0 0 2 2z" />
//     <path d="M12 2v3" />
//     <path d="M9 3v2" />
//     <path d="M15 3v2" />
//     <path d="M19 13V7a5 5 0 0 0-10 0v6" />
//   </svg>
// );

// const IconClock = ({ size = 18 }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
// );

// const IconCheckCircle = ({ size = 18 }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
// );

// const IconEye = ({ size = 16 }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
// );

// const IconImageFallback = ({ size = 22 }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <rect x="3" y="3" width="18" height="18" rx="2" />
//     <circle cx="8.5" cy="8.5" r="1.5" />
//     <path d="M21 15l-5-5L5 21" />
//   </svg>
// );

// const IconPrinter = ({ size = 16 }: { size?: number }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <path d="M6 9V2h12v7" />
//     <rect x="6" y="13" width="12" height="9" rx="2" />
//     <path d="M6 18h12" />
//   </svg>
// );

// const IconCalendar = ({ size = 16 }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <rect x="3" y="4" width="18" height="18" rx="2" />
//     <line x1="16" y1="2" x2="16" y2="6" />
//     <line x1="8" y1="2" x2="8" y2="6" />
//     <line x1="3" y1="10" x2="21" y2="10" />
//   </svg>
// );

// const IconChevronLeft = ({ size = 18 }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <polyline points="15 18 9 12 15 6" />
//   </svg>
// );

// const IconChevronRight = ({ size = 18 }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <polyline points="9 18 15 12 9 6" />
//   </svg>
// );

// const IconCash = ({ size = 14 }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <rect x="2" y="6" width="20" height="12" rx="2" />
//     <circle cx="12" cy="12" r="2" />
//     <path d="M6 12h.01M18 12h.01" />
//   </svg>
// );

// const IconCake = ({ size = 12 }: { size?: number }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
//     <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" />
//     <path d="M12 3v4" />
//     <path d="M12 7c-1.5 0-2-1-2-1.5S10.5 4 12 3c1.5 1 2 1.5 2 2.5S13.5 7 12 7z" />
//   </svg>
// );

// // Pickup-bag icon — used to badge / highlight pickup orders on the card and in
// // the order detail modal's fulfilment section.
// const IconBag = ({ size = 12 }: { size?: number }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
//     <path d="M3 6h18" />
//     <path d="M16 10a4 4 0 0 1-8 0" />
//   </svg>
// );

// // Delivery-truck icon — used to badge / highlight delivery orders on the card
// // and in the order detail modal's fulfilment section.
// const IconTruck = ({ size = 12 }: { size?: number }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M1 3h15v13H1z" />
//     <path d="M16 8h4l3 3v5h-7V8z" />
//     <circle cx="5.5" cy="18.5" r="2.5" />
//     <circle cx="18.5" cy="18.5" r="2.5" />
//   </svg>
// );

// const IconClose = ({ size = 12 }: { size?: number }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
//     <line x1="18" y1="6" x2="6" y2="18" />
//     <line x1="6" y1="6" x2="18" y2="18" />
//   </svg>
// );

// // Payment / QR icons — used for the "Payment" action added to each order card
// // and the order detail modal footer.
// const IconCreditCard = ({ size = 16 }: { size?: number }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
//     <line x1="1" y1="10" x2="23" y2="10" />
//   </svg>
// );

// const IconCopy = ({ size = 14 }: { size?: number }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
//     <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
//   </svg>
// );

// const IconCheck = ({ size = 14 }: { size?: number }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
//     <polyline points="20 6 9 17 4 12" />
//   </svg>
// );

// const IconExternalLink = ({ size = 13 }: { size?: number }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
//     <polyline points="15 3 21 3 21 9" />
//     <line x1="10" y1="14" x2="21" y2="3" />
//   </svg>
// );

// /* ─── Helpers ────────────────────────────────────────────────────────────────── */

// interface ItemCustomJson {
//   variant?: string;
//   flavour?: string;
//   flavor?: string;
//   shape?: string;
//   add_ons?: string[];
//   addons?: string[];
//   add_on_total?: number;
//   notes?: string;
//   product_type?: string;
// }

// const getCustomJson = (item: any): ItemCustomJson => item?.custom_json || {};

// const getFlavour = (item: any) => {
//   const cj = getCustomJson(item);
//   return cj.flavour || cj.flavor || item?.flavour || item?.flavor || null;
// };

// const getVariant = (item: any) => {
//   const cj = getCustomJson(item);
//   return cj.variant || item?.variant || null;
// };

// const getShape = (item: any) => {
//   const cj = getCustomJson(item);
//   return cj.shape || item?.shape || null;
// };

// const getAddOns = (item: any): string[] => {
//   const cj = getCustomJson(item);
//   const list = cj.add_ons || cj.addons || item?.add_ons || item?.selected_add_ons || [];
//   return Array.isArray(list) ? list : [];
// };

// const getItemNotes = (item: any) => {
//   const cj = getCustomJson(item);
//   return cj.notes || item?.notes || null;
// };

// // Agent-exclusive items (custom_json.product_type === 'AGENT') are returned by the
// // backend under `agent_product` instead of `product` (their `product_id` is null).
// // Always resolve through this helper instead of reading `item.product` directly so
// // agent-exclusive line items render their name/description/image correctly here,
// // the same way OrderManagement.tsx already does.
// const isAgentExclusiveItem = (item: any) => getCustomJson(item)?.product_type === 'AGENT';

// const getItemProductSource = (item: any) => {
//   const isAgentExclusive = isAgentExclusiveItem(item);
//   const agentProduct = item?.agent_product ?? {};
//   const product = item?.product ?? {};
//   return isAgentExclusive ? agentProduct : product;
// };

// const getItemDisplayName = (item: any) => {
//   const source = getItemProductSource(item);
//   return (
//     source?.name ||
//     item?.product_name ||
//     item?.name ||
//     (isAgentExclusiveItem(item) ? 'Agent Product' : 'Assorted Item')
//   );
// };

// const getItemDisplayImage = (item: any) => {
//   const source = getItemProductSource(item);
//   return source?.image_url || source?.imageUrl || source?.image || null;
// };

// const getItemDisplayDescription = (item: any) => {
//   const source = getItemProductSource(item);
//   return source?.description || null;
// };

// const currencySymbol = (cur?: string) => {
//   const c = cur || (typeof window !== 'undefined' ? localStorage.getItem('currency') || 'INR' : 'INR');
//   return c === 'INR' ? '₹' : c;
// };

// const fmtMoney = (n: number | undefined, cur?: string) => `${currencySymbol(cur)}${Number(n || 0).toFixed(0)}`;

// const fmtDateTime = (d?: string | null) =>
//   d ? new Date(d).toLocaleString('en-IN', {
//     day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
//   }) : null;

// const fmtDate = (d?: string) =>
//   d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null;

// const getDisplayName = (order: any) => {
//   if (order?.customer?.name) return order.customer.name;
//   const nameParts = [order?.customer?.first_name, order?.customer?.last_name].filter(Boolean);
//   return nameParts.length ? nameParts.join(' ') : order?.customer_name || '—';
// };

// const getDisplayEmail = (order: any) => order?.customer?.email || order?.customer_email || '—';
// const getDisplayPhone = (order: any) => order?.customer?.phone_no || order?.customer_phone || '—';
// const getDisplayOrderSource = (order: any) => order?.order_source || order?.order_type || '—';
// const getDisplayRole = (order: any) => order?.customer?.role?.toUpperCase() || (order?.order_type ? order.order_type.toUpperCase() : 'USER');

// const formatAddressString = (address: any) => {
//   if (!address) return '—';
//   const parts = [
//     address.addressLine1,
//     address.street,
//     address.line1,
//     address.line2,
//     address.area,
//     address.city,
//     address.state,
//     address.pincode,
//     address.country,
//   ].filter(Boolean);
//   return parts.length ? parts.join(', ') : '—';
// };


// const getAddressAreaName = (address: any) => {
//   const area = address?.area;
//   if (area === undefined || area === null || area === '') return null;
//   if (typeof area === 'object') return area.name ?? area.areaName ?? null;
//   return area;
// };

// const getAddressFieldValue = (address: any, keys: string[]) => {
//   for (const k of keys) {
//     const v = address?.[k];
//     if (v !== undefined && v !== null && v !== '') return v;
//   }
//   return null;
// };

// // const ADDRESS_FIELD_DEFS: { label: string; keys?: string[]; resolver?: (a: any) => any }[] = [
// //   { label: 'Area', resolver: getAddressAreaName },
// //   { label: 'Block', keys: ['block'] },
// //   { label: 'House / Flat No', keys: ['house_flat_no', 'houseFlatNo', 'houseNo', 'flatNo', 'building'] },
// //   { label: 'Street', keys: ['street'] },
// //   { label: 'Country', keys: ['country'] },
// //   { label: 'Landmark', keys: ['landmark'] },
// //   { label: 'Delivery Notes', keys: ['addressNotes', 'deliveryNotes', 'delivery_notes', 'notes'] },
// // ];

// const ADDRESS_FIELD_DEFS: { label: string; keys?: string[]; resolver?: (a: any) => any }[] = [
//   { label: 'Area', resolver: getAddressAreaName },
//   { label: 'Block', keys: ['block'] },
//   { label: 'Building', keys: ['building'] },
//   { label: 'Avenue', keys: ['avenue'] },
//   { label: 'Street', keys: ['street'] },
//   {
//     label: 'Floor / Apt',
//     resolver: (a: any) => {
//       const floor = a?.floor;
//       const apt = a?.apartment;
//       if (!floor && !apt) return null;
//       return [floor, apt].filter(Boolean).join(' ');
//     },
//   },
//   { label: 'Country', keys: ['country'] },
//    { label: 'Delivery Notes', keys: ['addressNotes', 'deliveryNotes', 'delivery_notes', 'notes'] },
// ];

// const getAddressFields = (address: any) =>
//   ADDRESS_FIELD_DEFS.map(({ label, keys, resolver }) => ({
//     label,
//     value: resolver ? resolver(address) : getAddressFieldValue(address, keys || []),
//   }));


// const getKitchenOrderAddons = (order: any): any[] => {
//   if (Array.isArray(order?.order_addons)) return order.order_addons;
//   if (Array.isArray(order?.order_addons_json)) return order.order_addons_json;
//   return [];
// };

// const getKitchenOrderAddonTotal = (order: any): number => {
//   const addons = getKitchenOrderAddons(order);
//   return Number(order?.order_addons_total ?? addons.reduce((sum: number, addon: any) => sum + Number(addon.total ?? (addon.price * addon.quantity || 0)), 0));
// };

// // Reads the custom-cake customization payload off an order (custom_cake_json /
// // custom_cake, whichever the backend sends). This mirrors OrderManagement.tsx's
// // `customCake` normalization — it was already defined here but never rendered
// // anywhere in the modal, so custom-cake orders showed everything except their
// // customization details. It's now wired into the order detail modal below.
// const getCustomCakeDetails = (order: any) => {
//   const customCake = order?.custom_cake_json ?? order?.custom_cake ?? null;
//   if (!customCake || typeof customCake !== 'object') return null;
//   return {
//     image: customCake?.image || customCake?.image_url || null,
//     flavour: customCake?.flavour || customCake?.flavor || null,
//     weight: customCake?.weight || null,
//     shape: customCake?.shape || null,
//     size: customCake?.size || null,
//     colour: customCake?.colour || customCake?.color || null,
//     message: customCake?.message || null,
//     notes: customCake?.notes || null,
//     price: customCake?.price != null ? Number(customCake.price) : null,
//   };
// };

// const isCustomCakeOrder = (order: any) => !!getCustomCakeDetails(order);

// const getExpectedDelivery = (order: any): { label: string } | null => {
//   if (!order) return null;

//   const explicit =
//     order.expected_delivery_at ||
//     order.expected_delivery_time ||
//     order.estimated_delivery_at;
//   if (explicit) return { label: fmtDateTime(explicit) as string };

//   const date = order.delivery_date || order.deliveryDate;
//   const slot = order.delivery_time_slot ?? order.deliveryTimeSlot;
//   if (date && slot) return { label: `${fmtDate(date)} · ${slot}` };
//   if (date) return { label: fmtDate(date) as string };
//   if (slot) return { label: slot };

//   return null;
// };

// interface FulfillmentInfo {
//   isPickup: boolean;
//   date: string | null;
//   time: string | null;
// }

// // Resolves the single relevant date/time for an order based on its actual
// // fulfilment method, so the UI never shows the wrong (or empty) schedule:
// //  · PICKUP   → pickup_date / pickup_time_slot (falls back to the delivery_*
// //               fields only if pickup-specific ones are missing)
// //  · DELIVERY → delivery_date / delivery_time_slot only — pickup fields are
// //               never read or shown for a delivery order.
// // Card and modal both call this so "hide the other type's info" logic lives
// // in one place instead of being duplicated per view.
// const getFulfillmentInfo = (order: any): FulfillmentInfo => {
//   const isPickup = (order?.delivery_method || '').toUpperCase() === 'PICKUP';

//   if (isPickup) {
//     const rawDate = order?.pickup_date || order?.delivery_date || order?.deliveryDate;
//     const time = order?.pickup_time_slot || order?.delivery_time_slot || order?.deliveryTimeSlot || null;
//     return { isPickup: true, date: rawDate ? fmtDate(rawDate) : null, time };
//   }

//   const rawDate = order?.delivery_date || order?.deliveryDate;
//   const time = order?.delivery_time_slot ?? order?.deliveryTimeSlot ?? null;
//   return { isPickup: false, date: rawDate ? fmtDate(rawDate) : null, time };
// };

// /* ─── Calendar helpers ───────────────────────────────────────────────────────── */

// type CalendarStatusKey = 'grey' | 'yellow' | 'green' | 'red';

// // pending/assigned → grey · preparing → yellow · ready/completed/delivered → green · cancelled/rejected → red
// const getStatusColorKey = (status?: string): CalendarStatusKey => {
//   const s = (status || '').toUpperCase();
//   if (['CANCELLED', 'CANCELED', 'REJECTED'].includes(s)) return 'red';
//   if (['PREPARING', 'PROCESSING'].includes(s)) return 'yellow';
//   if (['DELIVERED', 'COMPLETED', 'READY', 'READY_FOR_PICKUP', 'READY_FOR_DISPATCH'].includes(s)) return 'green';
//   return 'grey';
// };

// const CALENDAR_STATUS_LEGEND: { key: CalendarStatusKey; label: string }[] = [
//   { key: 'grey', label: 'Pending' },
//   { key: 'yellow', label: 'Preparing' },
//   { key: 'green', label: 'Completed' },
//   { key: 'red', label: 'Cancelled' },
// ];

// interface CalendarOrderInfo {
//   date: Date;
//   dateLabel: string;
//   timeLabel: string | null;
// }

// // Resolve the date/time to plot an order on the calendar:
// //  · Pickup orders  → pickup date & time (falls back to delivery date/slot)
// //  · Delivery orders with an expected delivery date → that date & time slot
// //  · Otherwise (nothing scheduled yet) → the order's created date & time
// const getOrderCalendarInfo = (order: any): CalendarOrderInfo => {
//   const isPickup = (order?.delivery_method || '').toUpperCase() === 'PICKUP';

//   if (isPickup) {
//     const d = order?.pickup_date || order?.delivery_date;
//     if (d) {
//       return {
//         date: new Date(d),
//         dateLabel: 'Pickup',
//         timeLabel: order?.pickup_time_slot || order?.delivery_time_slot || null,
//       };
//     }
//   } else if (order?.delivery_date) {
//     return {
//       date: new Date(order.delivery_date),
//       dateLabel: 'Expected Delivery',
//       timeLabel: order?.delivery_time_slot || null,
//     };
//   }

//   const created = new Date(order?.created_at);
//   return {
//     date: created,
//     dateLabel: 'Order Placed',
//     timeLabel: created.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
//   };
// };

// const dateKey = (d: Date) =>
//   `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// const buildMonthGrid = (monthDate: Date): (Date | null)[] => {
//   const year = monthDate.getFullYear();
//   const month = monthDate.getMonth();
//   const firstDay = new Date(year, month, 1);
//   const startWeekday = firstDay.getDay();
//   const daysInMonth = new Date(year, month + 1, 0).getDate();

//   const cells: (Date | null)[] = [];
//   for (let i = 0; i < startWeekday; i++) cells.push(null);
//   for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
//   while (cells.length % 7 !== 0) cells.push(null);
//   return cells;
// };

// const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];



// // The logged-in kitchen staff member's id — used only for display purposes
// // now (e.g. "(You)" tag), since /kitchen/my-completed-orders already scopes
// // the Completed tab server-side.
// const getCurrentUserId = (): number | null => {
//   try {
//     const stored = JSON.parse(localStorage.getItem('user') || '{}');
//     return stored?.id ?? null;
//   } catch {
//     return null;
//   }
// };

// /* ─── Date filter helpers ────────────────────────────────────────────────────── */
// type DateFilterMode = 'all' | 'today' | 'month' | 'custom';

// const DATE_FILTER_OPTIONS: { key: DateFilterMode; label: string }[] = [
//   { key: 'all', label: 'All Time' },
//   { key: 'today', label: 'Today' },
//   { key: 'month', label: 'By Month' },
//   { key: 'custom', label: 'By Date' },
// ];

// const isSameDay = (a: Date, b: Date) =>
//   a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

// const KitchenOrder: React.FC = () => {
//   const currentUserId = useMemo(getCurrentUserId, []);

//   const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'processing' | 'completed'>('all');
//   const [pendingOrders, setPendingOrders] = useState<KitchenOrderRecord[]>([]);
//   const [processingOrders, setProcessingOrders] = useState<KitchenOrderRecord[]>([]);
//   const [completedOrders, setCompletedOrders] = useState<KitchenOrderRecord[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [actionLoading, setActionLoading] = useState<number | null>(null);
//   const [actionError, setActionError] = useState<string | null>(null);

//   // Date-wise / month-wise / day-wise filter
//   const [dateFilterMode, setDateFilterMode] = useState<DateFilterMode>('all');
//   const [customDate, setCustomDate] = useState<string>('');   // yyyy-mm-dd
//   const [customMonth, setCustomMonth] = useState<string>(''); // yyyy-mm

//   // Calendar view modal
//   const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
//   const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
//   const [calendarSelectedDate, setCalendarSelectedDate] = useState<Date | null>(null);

//   // Which order's "Payment" popover is currently open (card grid + modal share this)
//   const [paymentMenuOrderId, setPaymentMenuOrderId] = useState<number | null>(null);

//   // Detailed Modal states
//   const [selectedOrder, setSelectedOrder] = useState<any>(null);
//   const [modalOpen, setModalOpen] = useState<boolean>(false);
//   const [modalLoading, setModalLoading] = useState<boolean>(false);
//   // Receipt modal state (separate from detailed view)
//   const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
//   const [receiptLoading, setReceiptLoading] = useState<boolean>(false);

//   // ── Payment link / QR modal state ──
//   const [paymentLinkOrderId, setPaymentLinkOrderId] = useState<number | null>(null);
//   const [paymentLinkOrderMeta, setPaymentLinkOrderMeta] = useState<any>(null);
//   const [paymentLink, setPaymentLink] = useState<string | null>(null);
//   const [paymentLinkLoading, setPaymentLinkLoading] = useState<boolean>(false);
//   const [paymentLinkError, setPaymentLinkError] = useState<string | null>(null);
//   const [paymentLinkCopied, setPaymentLinkCopied] = useState<boolean>(false);

//   const fetchAllKitchenData = useCallback(async () => {
//     try {
//       setLoading(true);

//       // /kitchen/my-completed-orders is scoped server-side to the logged-in
//       // kitchen staff member, so no client-side filtering is needed anymore.
//       const [pending, processing, myCompleted] = await Promise.all([
//         getKitchenPending(),
//         getKitchenProcessing(),
//         getMyCompletedKitchenOrders(),
//       ]);

//       setPendingOrders(pending);
//       setProcessingOrders(processing);
//       setCompletedOrders(myCompleted);
//     } catch (err) {
//       console.error('Failed to load kitchen dashboard data', err);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchAllKitchenData();
//   }, [fetchAllKitchenData]);

//   const allOrders = useMemo(() => {
//     return [...pendingOrders, ...processingOrders, ...completedOrders].sort(
//       (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
//     );
//   }, [pendingOrders, processingOrders, completedOrders]);

//   const visibleOrders = useMemo(() => {
//     switch (activeTab) {
//       case 'pending': return pendingOrders;
//       case 'processing': return processingOrders;
//       case 'completed': return completedOrders;
//       default: return allOrders;
//     }
//   }, [activeTab, pendingOrders, processingOrders, completedOrders, allOrders]);

//   // Apply date / month / day filter on top of the active tab's list
//   const filteredOrders = useMemo(() => {
//     if (dateFilterMode === 'all') return visibleOrders;

//     return visibleOrders.filter((order: any) => {
//       const created = new Date(order.created_at);

//       if (dateFilterMode === 'today') {
//         return isSameDay(created, new Date());
//       }

//       if (dateFilterMode === 'month') {
//         if (!customMonth) return true;
//         const [y, m] = customMonth.split('-').map(Number);
//         return created.getFullYear() === y && created.getMonth() + 1 === m;
//       }

//       if (dateFilterMode === 'custom') {
//         if (!customDate) return true;
//         const [y, m, d] = customDate.split('-').map(Number);
//         return created.getFullYear() === y && created.getMonth() + 1 === m && created.getDate() === d;
//       }

//       return true;
//     });
//   }, [visibleOrders, dateFilterMode, customDate, customMonth]);

//   // Group every known order (not just the active tab) by the calendar date
//   // resolved via getOrderCalendarInfo(), so the calendar modal can plot dots
//   // regardless of which tab / date-filter is currently active.
//   const calendarOrdersByDay = useMemo(() => {
//     const map: Record<string, { order: any; info: CalendarOrderInfo }[]> = {};
//     allOrders.forEach((order: any) => {
//       const info = getOrderCalendarInfo(order);
//       if (!info.date || isNaN(info.date.getTime())) return;
//       const key = dateKey(info.date);
//       if (!map[key]) map[key] = [];
//       map[key].push({ order, info });
//     });
//     return map;
//   }, [allOrders]);

//   const calendarSelectedDayEntries = useMemo(() => {
//     if (!calendarSelectedDate) return [];
//     return calendarOrdersByDay[dateKey(calendarSelectedDate)] || [];
//   }, [calendarSelectedDate, calendarOrdersByDay]);

//   const openCalendarView = () => {
//     setCalendarMonth(new Date());
//     setCalendarSelectedDate(null);
//     setIsCalendarOpen(true);
//   };

//   const goToPrevMonth = () => {
//     setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
//   };

//   const goToNextMonth = () => {
//     setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
//   };

//   const goToCurrentMonth = () => {
//     const today = new Date();
//     setCalendarMonth(today);
//     setCalendarSelectedDate(today);
//   };

//   const handleViewOrderDetails = async (orderId: number) => {
//     try {
//       setModalLoading(true);
//       setModalOpen(true);
//       const data = await getKitchenOrderDetails(orderId);
//       setSelectedOrder(data);
//     } catch (err) {
//       console.error("Could not fetch full order record manifest", err);
//     } finally {
//       setModalLoading(false);
//     }
//   };

//   const handleOpenReceipt = async (orderId: number) => {
//     try {
//       setReceiptLoading(true);
//       // fetch full details (same endpoint) so receipt has all fields
//       const data = await getKitchenOrderDetails(orderId);
//       setSelectedOrder(data);
//       setIsReceiptOpen(true);
//     } catch (err) {
//       console.error('Could not fetch order for receipt', err);
//     } finally {
//       setReceiptLoading(false);
//     }
//   };

//   const handleStartPreparation = async (orderId: number, e: React.MouseEvent) => {
//     e.stopPropagation();
//     setActionError(null);
//     try {
//       setActionLoading(orderId);
//       await startProcessing(orderId);
//       await fetchAllKitchenData();

//       if (modalOpen && selectedOrder?.id === orderId) {
//         const updated = await getKitchenOrderDetails(orderId);
//         setSelectedOrder(updated);
//       }
//     } catch (err: any) {
//       const msg =
//         err?.response?.data?.error ||
//         "Couldn't start preparation — someone may have already claimed this order.";
//       setActionError(msg);
//       // Refresh so the button/status reflects reality if someone else beat us to it.
//       await fetchAllKitchenData();
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   const handleMarkReady = async (orderId: number, e: React.MouseEvent) => {
//     e.stopPropagation();
//     setActionError(null);
//     try {
//       setActionLoading(orderId);
//       await completeKitchenOrder(orderId);
//       // This order now moves into "Completed (Mine)" — refetch so the
//       // completed list (and its count) picks it up immediately.
//       await fetchAllKitchenData();
//       if (modalOpen && selectedOrder?.id === orderId) {
//         setModalOpen(false);
//       }
//     } catch (err: any) {
//       const msg = err?.response?.data?.error || "Couldn't mark this order ready.";
//       setActionError(msg);
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   // Kitchen marks a PICKUP order as delivered/collected (POST /orders/:id/pickup)
//   // Backend sets status straight to DELIVERED — no intermediate step.
//   const handleMarkDelivered = async (orderId: number, e: React.MouseEvent) => {
//     e.stopPropagation();
//     setActionError(null);
//     try {
//       setActionLoading(orderId);
//       await markOrderPickedUp(orderId);
//       await fetchAllKitchenData();
//       if (modalOpen && selectedOrder?.id === orderId) {
//         setModalOpen(false);
//       }
//     } catch (err: any) {
//       const msg = err?.response?.data?.error || "Couldn't mark this order as delivered.";
//       setActionError(msg);
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   // Kitchen confirms how payment was collected — COD or Online — for a pickup order
//   const handleSelectPaymentMethod = async (orderId: number, method: 'COD' | 'UPI', e: React.MouseEvent) => {
//     e.stopPropagation();
//     setActionError(null);
//     setPaymentMenuOrderId(null);
//     try {
//       setActionLoading(orderId);
//       await markOrderPaymentPaid(orderId, method);
//       await fetchAllKitchenData();
//       if (modalOpen && selectedOrder?.id === orderId) {
//         const updated = await getKitchenOrderDetails(orderId);
//         setSelectedOrder(updated);
//       }
//     } catch (err: any) {
//       const msg = err?.response?.data?.error || "Couldn't update payment status.";
//       setActionError(msg);
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   const clearDateFilter = () => {
//     setDateFilterMode('all');
//     setCustomDate('');
//     setCustomMonth('');
//   };

//   // Kitchen picks COD or Online for a pickup order → marks paid AND delivered, in one call
//   const handleCompletePickup = async (orderId: number, method: 'COD' | 'UPI', e: React.MouseEvent) => {
//     e.stopPropagation();
//     setActionError(null);
//     setPaymentMenuOrderId(null);
//     try {
//       setActionLoading(orderId);
//       await completePickupOrder(orderId, method);
//       await fetchAllKitchenData();
//       if (modalOpen && selectedOrder?.id === orderId) {
//         setModalOpen(false);
//       }
//     } catch (err: any) {
//       const msg = err?.response?.data?.error || "Couldn't complete this pickup order.";
//       setActionError(msg);
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   const togglePaymentMenu = (orderId: number, e: React.MouseEvent) => {
//     e.stopPropagation();
//     setPaymentMenuOrderId((prev) => (prev === orderId ? null : orderId));
//   };

//   // ── Payment link / QR handlers ──
//   const handleOpenPaymentLink = async (order: any, e?: React.MouseEvent) => {
//     if (e) e.stopPropagation();
//     const orderId = order?.id;
//     if (!orderId) return;

//     setPaymentLinkOrderId(orderId);
//     setPaymentLinkOrderMeta(order);
//     setPaymentLink(null);
//     setPaymentLinkError(null);
//     setPaymentLinkCopied(false);
//     setPaymentLinkLoading(true);
//     try {
//       const result = await createPaymentLink(Number(orderId));
//       if (result?.success === false) {
//         setPaymentLinkError(result?.error || 'Unable to generate payment link.');
//       } else if (result?.payment_url) {
//         setPaymentLink(result.payment_url);
//       } else {
//         setPaymentLinkError('Payment link was not returned by the server.');
//       }
//     } catch (err: any) {
//       console.error('Failed to create payment link:', err);
//       setPaymentLinkError(
//         err?.response?.data?.error || 'Failed to generate payment link. Please try again.'
//       );
//     } finally {
//       setPaymentLinkLoading(false);
//     }
//   };

//   const handleCopyPaymentLink = async () => {
//     if (!paymentLink) return;
//     try {
//       await navigator.clipboard.writeText(paymentLink);
//       setPaymentLinkCopied(true);
//       setTimeout(() => setPaymentLinkCopied(false), 2000);
//     } catch {
//       /* clipboard unavailable, ignore */
//     }
//   };

//   const closePaymentLinkModal = () => {
//     setPaymentLinkOrderId(null);
//     setPaymentLinkOrderMeta(null);
//     setPaymentLink(null);
//     setPaymentLinkError(null);
//     setPaymentLinkLoading(false);
//     setPaymentLinkCopied(false);
//   };

//   // Human-readable summary of the active date filter, shown next to the
//   // segmented control so it's obvious what's currently applied.
//   const activeDateFilterSummary = useMemo(() => {
//     if (dateFilterMode === 'all') return null;
//     if (dateFilterMode === 'today') return 'Today';
//     if (dateFilterMode === 'month') {
//       if (!customMonth) return 'Pick a month';
//       const [y, m] = customMonth.split('-').map(Number);
//       return new Date(y, m - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
//     }
//     if (dateFilterMode === 'custom') {
//       if (!customDate) return 'Pick a date';
//       return fmtDate(customDate);
//     }
//     return null;
//   }, [dateFilterMode, customDate, customMonth]);

//   return (
//     <div className="ko-workspace-container">

//       {/* ─── Page Title Header ─── */}
//       <div className="ko-page-header">
//         <div className="ko-page-header-text">
//           <h2>Kitchen Dashboard</h2>
//           <p>Monitor real-time line preparation items, active orders, and live chef fulfillment tasks.</p>
//         </div>
//       </div>

//       {actionError && (
//         <div className="ko-action-error-banner">
//           <span>{actionError}</span>
//           <button onClick={() => setActionError(null)}>Dismiss</button>
//         </div>
//       )}

//       {/* ─── Counter Metrics Top Row Grid ─── */}
//       {/* <div className="ko-stats-grid">
//         <div className="ko-stat-card" onClick={() => setActiveTab('all')}>
//           <div className="ko-stat-icon icon-all"><IconChef size={24} /></div>
//           <div className="ko-stat-details">
//             <h3>{allOrders.length}</h3>
//             <p>Total Orders Today</p>
//           </div>
//         </div>
//         <div className="ko-stat-card" onClick={() => setActiveTab('pending')}>
//           <div className="ko-stat-icon icon-pending"><IconClock size={24} /></div>
//           <div className="ko-stat-details">
//             <h3>{pendingOrders.length}</h3>
//             <p>Awaiting Prep</p>
//           </div>
//         </div>
//         <div className="ko-stat-card" onClick={() => setActiveTab('processing')}>
//           <div className="ko-stat-icon icon-processing"><IconChef size={24} /></div>
//           <div className="ko-stat-details">
//             <h3>{processingOrders.length}</h3>
//             <p>Currently In Oven</p>
//           </div>
//         </div>
//         <div className="ko-stat-card" onClick={() => setActiveTab('completed')}>
//           <div className="ko-stat-icon icon-completed"><IconCheckCircle size={24} /></div>
//           <div className="ko-stat-details">
//             <h3>{completedOrders.length}</h3>
//             <p>Completed by Me</p>
//           </div>
//         </div>
//       </div> */}

//       {/* ─── Filter Navigation Tab Row ─── */}
//       <div className="ko-tabs-navigation-bar">
//         {/* <button className={`ko-tab-nav-item ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
//           All Orders <span className="ko-tab-badge bg-all">{allOrders.length}</span>
//         </button> */}
//         <button className={`ko-tab-nav-item ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
//           Pending <span className="ko-tab-badge bg-pending">{pendingOrders.length}</span>
//         </button>
//         <button className={`ko-tab-nav-item ${activeTab === 'processing' ? 'active' : ''}`} onClick={() => setActiveTab('processing')}>
//           Processing <span className="ko-tab-badge bg-processing">{processingOrders.length}</span>
//         </button>
//         <button className={`ko-tab-nav-item ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>
//           Completed (Mine) <span className="ko-tab-badge bg-completed">{completedOrders.length}</span>
//         </button>
//          <button className={`ko-tab-nav-item ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
//           All Orders <span className="ko-tab-badge bg-all">{allOrders.length}</span>
//         </button>
//       </div>

//       {/* ─── Date / Month / Day Filter Bar (redesigned as a segmented control) ─── */}
//       <div className="ko-date-filter-bar">
//         <div className="ko-filter-segment-group" role="tablist" aria-label="Filter orders by date">
//           {DATE_FILTER_OPTIONS.map(opt => (
//             <button
//               key={opt.key}
//               role="tab"
//               aria-selected={dateFilterMode === opt.key}
//               className={`ko-filter-segment-btn ${dateFilterMode === opt.key ? 'active' : ''}`}
//               onClick={() => setDateFilterMode(opt.key)}
//             >
//               {opt.key === 'today' && <IconClock size={13} />}
//               {(opt.key === 'month' || opt.key === 'custom') && <IconCalendar size={13} />}
//               {opt.label}
//             </button>
//           ))}
//         </div>

//         {dateFilterMode === 'month' && (
//           <label className="ko-date-filter-input-wrap">
//             <IconCalendar size={14} />
//             <input
//               type="month"
//               className="ko-date-filter-input"
//               value={customMonth}
//               onChange={(e) => setCustomMonth(e.target.value)}
//               autoFocus
//             />
//           </label>
//         )}

//         {dateFilterMode === 'custom' && (
//           <label className="ko-date-filter-input-wrap">
//             <IconCalendar size={14} />
//             <input
//               type="date"
//               className="ko-date-filter-input"
//               value={customDate}
//               onChange={(e) => setCustomDate(e.target.value)}
//               autoFocus
//             />
//           </label>
//         )}

//         {activeDateFilterSummary && (
//           <span className="ko-date-filter-active-chip">
//             Showing: <strong>{activeDateFilterSummary}</strong>
//             <button className="ko-date-filter-chip-clear" onClick={clearDateFilter} title="Reset filter" aria-label="Clear date filter">
//               <IconClose size={11} />
//             </button>
//           </span>
//         )}

//         {/* <button className="ko-calendar-view-btn" onClick={openCalendarView}>
//           <IconCalendar size={15} /> Calendar View
//         </button> */}
//       </div>

//       {/* ─── Active Queue Layout Loop ─── */}
//       {loading ? (
//         <div className="ko-workspace-center-loader">
//           <div className="ko-spinner" />
//           <p>Syncing hot items with kitchen lines...</p>
//         </div>
//       ) : filteredOrders.length === 0 ? (
//         <div className="ko-empty-state">
//           <IconChef size={50} />
//           <h3>No Orders Found</h3>
//           <p>
//             {activeTab === 'completed'
//               ? "You haven't completed any orders yet."
//               : `There are no items currently categorized under the "${activeTab}" status loop.`}
//           </p>
//         </div>
//       ) : (
//         <div className="ko-orders-grid">
//           {filteredOrders.map((order: any) => {
//             const dateStr = new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
//             const currentStatus = (order.status || 'PENDING').toUpperCase();
//             const isMine = order.preparation_started_by === currentUserId;
//             const isPickup = (order.delivery_method || '').toUpperCase() === 'PICKUP';
//             const isReadyForPickup = currentStatus === 'READY_FOR_PICKUP';
//             const isPaid = (order.payment_status || '').toUpperCase() === 'PAID';
//             const isPaymentMenuOpen = paymentMenuOrderId === order.id;
//             const isCustomCake = isCustomCakeOrder(order);
//             const fulfillment = getFulfillmentInfo(order);

//             return (
//               <div
//                 key={order.id}
//                 className={`ko-order-card ${isPickup ? 'card-fulfillment-pickup' : 'card-fulfillment-delivery'}`}
//                 onClick={() => handleViewOrderDetails(order.id)}
//               >
//                 <div className="ko-card-upper-row">
//                   <div>
//                     <h4 className="ko-order-title">Order #{order.order_number || String(order.id).padStart(5, '0')}</h4>
//                     <span className="ko-order-timestamp"><IconClock size={12} /> {dateStr}</span>
//                   </div>
//                   <span className={`ko-status-pill pill-${currentStatus.toLowerCase()}`}>
//                     {currentStatus.replace(/_/g, ' ')}
//                   </span>
//                 </div>

//                 {isCustomCake && (
//                   <div className="op-origin-badge badge-custom-cake" style={{ marginBottom: 6 }}>
//                     <IconCake size={11} /> Custom Cake Order
//                   </div>
//                 )}

//                 {/* Fulfilment highlight row — pickup orders show only pickup
//                     date/time, delivery orders show only delivery date/time. */}
//                 <div className={`ko-fulfillment-row ${isPickup ? 'is-pickup' : 'is-delivery'}`}>
//                   <span className="ko-fulfillment-type-badge">
//                     {isPickup ? <IconBag size={12} /> : <IconTruck size={12} />}
//                     {isPickup ? 'Pickup' : 'Delivery'}
//                   </span>
//                   <span className="ko-fulfillment-schedule">
//                     <IconCalendar size={12} />
//                     {fulfillment.date || 'Date TBD'}
//                     {fulfillment.time && <span className="ko-fulfillment-time"> · {fulfillment.time}</span>}
//                   </span>
//                 </div>

//                 {currentStatus === "PREPARING" && (
//                   <div className="ko-owner-tag">
//                     <strong>Kitchen Staff:</strong>{" "}
//                     {typeof order.preparation_started_by === 'object' ? order.preparation_started_by?.name : order.preparation_started_by || "Unknown"}
//                     {isMine && " (You)"}
//                   </div>
//                 )}

//                 {/* Products Manifest Block */}
//                 <div className="ko-card-items-preview">
//                   {order.items?.map((item: any, idx: number) => (
//                     <div key={item.id || idx} className="ko-preview-item-line">
//                       <span className="ko-item-quantity">×{item.quantity}</span>
//                       <span className="ko-item-name">{getItemDisplayName(item)}</span>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Interactive Workflow Execution Footer Button Row */}
//                 <div className="ko-card-action-bar">
//                   <button className="ko-action-icon-btn" onClick={(e) => { e.stopPropagation(); handleViewOrderDetails(order.id); }} title="View Details">
//                     <IconEye size={16} />
//                   </button>

//                   <button className="ko-action-icon-btn" onClick={(e) => { e.stopPropagation(); handleOpenReceipt(order.id); }} title="Open Receipt">
//                     <IconPrinter size={16} />
//                   </button>

//                   <button
//                     className="ko-action-icon-btn"
//                     onClick={(e) => handleOpenPaymentLink(order, e)}
//                     title={isPaid ? 'Already paid' : 'Generate payment link & QR'}
//                     disabled={isPaid}
//                   >
//                     <IconCreditCard size={16} />
//                   </button>

//                   {currentStatus === "ASSIGNED_TO_KITCHEN" && (
//                     <button
//                       className="ko-action-primary-btn bg-prep"
//                       disabled={actionLoading === order.id}
//                       onClick={(e) => handleStartPreparation(order.id, e)}
//                     >
//                       {actionLoading === order.id ? "Starting..." : "Start Preparation"}
//                     </button>
//                   )}

//                   {currentStatus === "PREPARING" && (
//                     <button
//                       className="ko-action-primary-btn bg-complete"
//                       disabled={actionLoading === order.id}
//                       onClick={(e) => handleMarkReady(order.id, e)}
//                     >
//                       {actionLoading === order.id ? "Completing..." : "Mark Ready"}
//                     </button>
//                   )}

//                   {/* Pickup-only: single "Mark Delivered" action that also captures payment */}
//                   {isPickup && isReadyForPickup && (
//                     <div className="ko-payment-menu-wrap">
//                       <button
//                         className="ko-action-primary-btn bg-deliver"
//                         disabled={actionLoading === order.id}
//                         onClick={(e) => togglePaymentMenu(order.id, e)}
//                       >
//                         {actionLoading === order.id ? "Completing..." : "Mark Delivered"}
//                       </button>

//                       {paymentMenuOrderId === order.id && (
//                         <div className="ko-payment-popover" onClick={(e) => e.stopPropagation()}>
//                           <div className="ko-payment-popover-label">Payment received via</div>
//                           <button
//                             className="ko-payment-popover-option"
//                             onClick={(e) => handleCompletePickup(order.id, 'COD', e)}
//                           >
//                             Cash (COD)
//                           </button>
//                           <button
//                             className="ko-payment-popover-option"
//                             onClick={(e) => handleCompletePickup(order.id, 'UPI', e)}
//                           >
//                             Online (UPI)
//                           </button>
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {/* ─── Detailed Order Modal Overlay View Sheet ─── */}
//       {modalOpen && (
//         <div className="ko-modal-backdrop" onClick={() => setModalOpen(false)}>
//           <div className="ko-modal-content-card" onClick={(e) => e.stopPropagation()}>
//             <div className="ko-modal-header">
//               <h3>Full Order Details — {selectedOrder ? (selectedOrder.order_number || selectedOrder.id) : ''}</h3>
//               <button className="ko-modal-close-cross" onClick={() => setModalOpen(false)}>×</button>
//             </div>

//             <div className="ko-modal-body-area op-full-details-modal-body">
//               {modalLoading || !selectedOrder ? (
//                 <div className="ko-modal-spinner-wrapper">
//                   <div className="ko-spinner" />
//                   <p>Pulling full order manifest details...</p>
//                 </div>
//               ) : (
//                 <>
//                   {/* Top badges + status */}
//                   <div className="op-fd-top-row">
//                     <div className={`ko-status-pill pill-${selectedOrder.status?.toLowerCase()}`}>{selectedOrder.status}</div>
//                     {isCustomCakeOrder(selectedOrder) && (
//                       <span className="op-origin-badge badge-custom-cake">
//                         <IconCake size={11} /> Custom Cake Order
//                       </span>
//                     )}
//                     <div className="op-origin-badges">
//                       <div className="op-origin-item"><strong>Placed by</strong><div>{getDisplayName(selectedOrder)}</div></div>
//                       <div className="op-origin-item"><strong>Role</strong><div>{getDisplayRole(selectedOrder)}</div></div>
//                       <div className="op-origin-item"><strong>Phone</strong><div>{getDisplayPhone(selectedOrder)}</div></div>
//                       <div className="op-origin-item"><strong>Email</strong><div>{getDisplayEmail(selectedOrder)}</div></div>
//                       <div className="op-origin-item"><strong>Order source</strong><div>{getDisplayOrderSource(selectedOrder)}</div></div>
//                     </div>
//                   </div>

//                   {selectedOrder.preparation_started_at && (
//                     <div className="ko-modal-delivery-info">
//                       <IconClock size={16} />
//                       <span className="ko-delivery-label">Preparation started:</span>
//                       <span className="ko-delivery-value">
//                         {fmtDateTime(selectedOrder.preparation_started_at)}
//                         {selectedOrder.preparation_started_by?.id === currentUserId ? ' · by you' : ''}
//                       </span>
//                     </div>
//                   )}

//                   {/* Fulfilment schedule — pickup orders show pickup date/time
//                       only, delivery orders show delivery date/time + area only. */}
//                   {(() => {
//                     const modalFulfillment = getFulfillmentInfo(selectedOrder);
//                     return (
//                       <div className={`op-fd-section op-fd-fulfillment ${modalFulfillment.isPickup ? 'is-pickup' : 'is-delivery'}`}>
//                         <h4>
//                           {modalFulfillment.isPickup ? <IconBag size={14} /> : <IconCalendar size={14} />}
//                           {modalFulfillment.isPickup ? 'Pickup Schedule' : 'Delivery Schedule'}
//                         </h4>
//                         <div className="op-fd-grid">
//                           <div>
//                             <span className="lbl">{modalFulfillment.isPickup ? 'Pickup date' : 'Expected date'}</span>
//                             <span>{modalFulfillment.date || '—'}</span>
//                           </div>
//                           <div>
//                             <span className="lbl">{modalFulfillment.isPickup ? 'Pickup time' : 'Time slot'}</span>
//                             <span>{modalFulfillment.time || '—'}</span>
//                           </div>
//                           {!modalFulfillment.isPickup && (
//                             <div>
//                               <span className="lbl">Area</span>
//                               <span>
//                                 {(selectedOrder.delivery_address?.area && typeof selectedOrder.delivery_address.area === 'object')
//                                   ? (selectedOrder.delivery_address.area.name ?? selectedOrder.delivery_address.area.areaName ?? '—')
//                                   : (selectedOrder.delivery_address?.area
//                                       ?? selectedOrder.detailedAddress?.areaName
//                                       ?? (selectedOrder.area && typeof selectedOrder.area === 'object' ? (selectedOrder.area.name ?? selectedOrder.area.areaName) : selectedOrder.area)
//                                       ?? '—')}
//                               </span>
//                             </div>
//                           )}
//                           <div><span className="lbl">Fulfilment</span><span>{selectedOrder.delivery_method || '—'}</span></div>
//                         </div>
//                       </div>
//                     );
//                   })()}

//                   <div className="op-fd-section">
//                     <h4>Customer &amp; Address</h4>
//                     <div className="op-fd-grid">
//                       <div><span className="lbl">Name</span><span>{getDisplayName(selectedOrder)}</span></div>
//                       <div><span className="lbl">Phone</span><span>{getDisplayPhone(selectedOrder)}</span></div>
//                       <div><span className="lbl">Email</span><span>{getDisplayEmail(selectedOrder)}</span></div>
//                     </div>
//                     {/* <div className="op-fd-address-block">
//                       <p><strong>Address:</strong> {formatAddressString(selectedOrder.delivery_address)}</p>
//                       {selectedOrder.delivery_address && (
//                         <ul className="op-fd-address-list">
//                           {selectedOrder.delivery_address.building && <li><strong>Building:</strong> {selectedOrder.delivery_address.building}</li>}
//                           {selectedOrder.delivery_address.block && <li><strong>Block:</strong> {selectedOrder.delivery_address.block}</li>}
//                           {selectedOrder.delivery_address.avenue && <li><strong>Avenue:</strong> {selectedOrder.delivery_address.avenue}</li>}
//                           {selectedOrder.delivery_address.street && <li><strong>Street:</strong> {selectedOrder.delivery_address.street}</li>}
//                           {selectedOrder.delivery_address.floor && <li><strong>Floor/Apt:</strong> {selectedOrder.delivery_address.floor} {selectedOrder.delivery_address.apartment}</li>}
//                           {selectedOrder.delivery_address.landmark && <li><strong>Landmark:</strong> {selectedOrder.delivery_address.landmark}</li>}
//                           {selectedOrder.delivery_address.addressNotes && <li><strong>Address notes:</strong> {selectedOrder.delivery_address.addressNotes}</li>}
//                         </ul>
//                       )}
//                     </div> */}

//                     <div className="op-fd-address-block">
//   <div className="op-fd-grid">
//     {getAddressFields(selectedOrder.delivery_address).map((f) => (
//       <div key={f.label}>
//         <span className="lbl">{f.label}</span>
//         <span>{f.value || '-'}</span>
//       </div>
//     ))}
//   </div>
// </div>

//                   </div>

//                   <div className="ko-modal-section-box">
//                     <h5 className="ko-section-title">Line Kitchen Production Items</h5>

//                     <div className="ko-modal-items-table">
//                       {selectedOrder.items?.map((item: any) => {
//                         const flavour = getFlavour(item);
//                         const variant = getVariant(item);
//                         const shape = getShape(item);
//                         const addOns = getAddOns(item);
//                         const itemNotes = getItemNotes(item);
//                         const lineTotal = item.line_total ?? (item.price * item.quantity);
//                         const displayName = getItemDisplayName(item);
//                         const displayImage = getItemDisplayImage(item);
//                         const displayDescription = getItemDisplayDescription(item);

//                         return (
//                           <div key={item.id} className="ko-modal-item-row-detailed">
//                             {/* Left: Product Image Box */}
//                             <div className="ko-modal-item-image-wrap">
//                               {displayImage ? (
//                                 <img
//                                   className="ko-modal-item-image"
//                                   src={displayImage}
//                                   alt={displayName}
//                                 />
//                               ) : (
//                                 <div className="ko-modal-item-image-fallback">
//                                   <IconImageFallback size={20} />
//                                 </div>
//                               )}
//                             </div>

//                             {/* Right: Detailed Content Area */}
//                             <div className="ko-modal-item-body">

//                               {/* Header Row: Qty Badge & Title */}
//                               <div className="ko-modal-item-header">
//                                 <span className="ko-modal-qty-bubble">
//                                   {item.quantity}x
//                                 </span>
//                                 <p className="item-main-title">{displayName}</p>
//                               </div>

//                               {/* Description */}
//                               {displayDescription && (
//                                 <p className="item-sub-desc">{displayDescription}</p>
//                               )}

//                               {/* Specifications (Flavour, Variant, Shape) */}
//                               {(flavour || variant || shape) && (
//                                 <div className="ko-item-meta-chips">
//                                   {flavour && (
//                                     <span className="ko-item-meta-chip chip-flavour">
//                                       Flavour: <strong>{flavour}</strong>
//                                     </span>
//                                   )}
//                                   {variant && (
//                                     <span className="ko-item-meta-chip chip-variant">
//                                       Variant: <strong>{variant}</strong>
//                                     </span>
//                                   )}
//                                   {shape && (
//                                     <span className="ko-item-meta-chip chip-shape">
//                                       Shape: <strong>{shape}</strong>
//                                     </span>
//                                   )}
//                                 </div>
//                               )}

//                               {/* Add-ons */}
//                               {addOns.length > 0 && (
//                                 <div className="ko-modal-item-addons">
//                                   <span className="ko-addons-label">Add-ons</span>
//                                   <div className="ko-item-meta-chips-small">
//                                     {addOns.map((addOn, i) => (
//                                       <span key={i} className="ko-item-meta-chip chip-addon">{addOn}</span>
//                                     ))}
//                                   </div>
//                                 </div>
//                               )}

//                               {/* Special Instructions Note */}
//                               {itemNotes && (
//                                 <div className="ko-item-custom-note-box">
//                                   <span className="note-label">Instruction:</span>
//                                   <p className="item-custom-note-text">"{itemNotes}"</p>
//                                 </div>
//                               )}

//                               {/* Price Calculations */}
//                               <div className="ko-modal-item-price-row">
//                                 <span className="ko-item-unit-price">
//                                   {fmtMoney(item.price, selectedOrder?.currency)} × {item.quantity}
//                                 </span>
//                                 <span className="ko-item-line-total">
//                                   {fmtMoney(lineTotal, selectedOrder?.currency)}
//                                 </span>
//                               </div>

//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </div>

//                   {getKitchenOrderAddons(selectedOrder).length > 0 && (
//                     <div className="op-fd-order-addons">
//                       <h4>Order Add-ons</h4>
//                       <div className="op-fd-addons-list">
//                         {getKitchenOrderAddons(selectedOrder).map((addon: any, idx: number) => (
//                           <div key={`${addon.addon_id ?? addon.addonId}-${idx}`} className="op-fd-addon-row">
//                             <div className="op-fd-addon-thumb-wrapper">
//                               <div className="op-fd-addon-thumb-placeholder" />
//                               <div className="op-fd-addon-content">
//                                 <strong>{addon.addon_name || addon.addonName || addon.name || `Addon #${addon.addon_id ?? addon.addonId ?? idx + 1}`}{addon.quantity ? ` (${addon.quantity} pcs)` : ''}</strong>
//                                 <div className="op-fd-addon-meta">{fmtMoney(addon.price, selectedOrder.currency)} each</div>
//                               </div>
//                             </div>
//                             <div className="op-fd-addon-price-block">
//                               <span>{fmtMoney(addon.total ?? (addon.price * addon.quantity), selectedOrder.currency)}</span>
//                               <div className="op-fd-addon-note">Rate included in totals</div>
//                             </div>
//                           </div>
//                         ))}
//                         <div className="op-fd-addon-total">
//                           <strong>Total Add-ons:</strong>
//                           <span>{fmtMoney(getKitchenOrderAddonTotal(selectedOrder), selectedOrder.currency)}</span>
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   {/* ── Custom Cake Details — previously computed but never rendered ── */}
//                   {(() => {
//                     const customCake = getCustomCakeDetails(selectedOrder);
//                     if (!customCake) return null;
//                     return (
//                       <div className="op-fd-section op-fd-highlight-cake">
//                         <h4><IconCake size={14} /> Custom Cake Details</h4>
//                         <div className="op-fd-cake-body">
//                           {customCake.image && (
//                             <img src={customCake.image} alt="Custom cake reference" className="op-fd-cake-image" />
//                           )}
//                           <div className="op-fd-grid">
//                             <div><span className="lbl">Flavour</span><span>{customCake.flavour ?? '—'}</span></div>
//                             <div><span className="lbl">Weight</span><span>{customCake.weight ?? '—'}</span></div>
//                             <div><span className="lbl">Shape</span><span>{customCake.shape ?? '—'}</span></div>
//                             <div><span className="lbl">Size</span><span>{customCake.size ?? '—'}</span></div>
//                             <div><span className="lbl">Colour</span><span>{customCake.colour ?? '—'}</span></div>
//                             <div><span className="lbl">Est. price</span><span>{customCake.price != null ? fmtMoney(customCake.price, selectedOrder.currency) : '—'}</span></div>
//                           </div>
//                           {customCake.message && (
//                             <p className="op-fd-cake-message"><strong>Cake message:</strong> "{customCake.message}"</p>
//                           )}
//                           {customCake.notes && (
//                             <p className="op-fd-cake-message"><strong>Customization notes:</strong> {customCake.notes}</p>
//                           )}
//                         </div>
//                       </div>
//                     );
//                   })()}

//                   {(selectedOrder.greeting_message || selectedOrder.greeting_from || selectedOrder.greeting_to) && (
//                     <div className="op-fd-section op-fd-highlight-greeting">
//                       <h4>Greeting Card</h4>
//                       <div className="op-fd-grid">
//                         <div><span className="lbl">To</span><span>{selectedOrder.greeting_to || '—'}</span></div>
//                         <div><span className="lbl">From</span><span>{selectedOrder.greeting_from || '—'}</span></div>
//                       </div>
//                       {selectedOrder.greeting_message && (
//                         <p className="op-fd-greeting-message">"{selectedOrder.greeting_message}"</p>
//                       )}
//                     </div>
//                   )}

//                   <div className="op-fd-section">
//                     <h4>Pricing Summary</h4>
//                     {(() => {
//                       const itemSubtotal = Number(selectedOrder.subtotal ?? selectedOrder.sub_total ?? (selectedOrder.items?.reduce((sum: number, item: any) => sum + Number(item.line_total ?? (item.price * item.quantity || 0)), 0) || 0));
//                       const addonsTotal = getKitchenOrderAddonTotal(selectedOrder);
//                       const discount = Number(selectedOrder.discount || 0);
//                       const deliveryCharge = Number(selectedOrder.delivery_charge ?? selectedOrder.deliveryCharge ?? 0);
//                       const grandTotal = Number(selectedOrder.total ?? selectedOrder.grand_total ?? (itemSubtotal + addonsTotal - discount + deliveryCharge));

//                       return (
//                         <div className="drawer-cost-breakdown">
//                           <div className="cost-row"><span>Subtotal:</span><span>{fmtMoney(itemSubtotal, selectedOrder.currency)}</span></div>
//                           {addonsTotal > 0 && <div className="cost-row"><span>Add-ons:</span><span>{fmtMoney(addonsTotal, selectedOrder.currency)}</span></div>}
//                           {discount > 0 && <div className="cost-row discount"><span>Discount:</span><span>-{fmtMoney(discount, selectedOrder.currency)}</span></div>}
//                           <div className="cost-row"><span>Delivery:</span><span>{fmtMoney(deliveryCharge, selectedOrder.currency)}</span></div>
//                           <div className="cost-row total"><span>Grand Total:</span><span>{fmtMoney(grandTotal, selectedOrder.currency)}</span></div>
//                         </div>
//                       );
//                     })()}
//                   </div>

//                   {selectedOrder.delivery_notes && (
//                     <div className="ko-modal-section-box notes-box">
//                       <h5>Special Kitchen Notes / Instructions</h5>
//                       <p className="notes-text-render">"{selectedOrder.delivery_notes}"</p>
//                     </div>
//                   )}

//                   <div className="op-fd-actions-row">
//                     <button className="sage-btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); handleOpenReceipt(selectedOrder.id); }}>
//                       <IconPrinter size={13} /> Print Receipt
//                     </button>
//                     <button
//                       className="sage-btn btn-secondary btn-sm"
//                       onClick={(e) => handleOpenPaymentLink(selectedOrder, e)}
//                       disabled={(selectedOrder.payment_status || '').toUpperCase() === 'PAID'}
//                     >
//                       <IconCreditCard size={13} /> Payment
//                     </button>
//                     <button className="sage-btn btn-ghost btn-sm" onClick={() => { setModalOpen(false); }}>
//                       Open Workflow Panel
//                     </button>
//                   </div>

//                   <div className="ko-modal-action-footer">
//                     <button className="ko-modal-cancel-btn" onClick={() => setModalOpen(false)}>Close Window</button>
//                     {selectedOrder.status === "ASSIGNED_TO_KITCHEN" && (
//                       <button
//                         className="ko-action-primary-btn bg-prep"
//                         disabled={actionLoading === selectedOrder.id}
//                         onClick={(e) => handleStartPreparation(selectedOrder.id, e)}
//                       >
//                         {actionLoading === selectedOrder.id ? "Starting..." : "Start Preparation"}
//                       </button>
//                     )}
//                     {selectedOrder.status === "PREPARING" && (
//                       <button
//                         className="ko-action-primary-btn bg-complete"
//                         disabled={actionLoading === selectedOrder.id}
//                         onClick={(e) => handleMarkReady(selectedOrder.id, e)}
//                       >
//                         {actionLoading === selectedOrder.id ? "Completing..." : "Mark Ready"}
//                       </button>
//                     )}

//                     {(selectedOrder.delivery_method || '').toUpperCase() === 'PICKUP' &&
//                       selectedOrder.status === "READY_FOR_PICKUP" && (
//                       <div className="ko-payment-menu-wrap">
//                         <button
//                           className="ko-action-primary-btn bg-deliver"
//                           disabled={actionLoading === selectedOrder.id}
//                           onClick={(e) => togglePaymentMenu(selectedOrder.id, e)}
//                         >
//                           {actionLoading === selectedOrder.id ? "Completing..." : "Mark Delivered"}
//                         </button>

//                         {paymentMenuOrderId === selectedOrder.id && (
//                           <div className="ko-payment-popover" onClick={(e) => e.stopPropagation()}>
//                             <div className="ko-payment-popover-label">Payment received via</div>
//                             <button
//                               className="ko-payment-popover-option"
//                               onClick={(e) => handleCompletePickup(selectedOrder.id, 'COD', e)}
//                             >
//                               Cash (COD)
//                             </button>
//                             <button
//                               className="ko-payment-popover-option"
//                               onClick={(e) => handleCompletePickup(selectedOrder.id, 'UPI', e)}
//                             >
//                               Online (UPI)
//                             </button>
//                           </div>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Receipt modal (opens when clicking receipt icon on an order card) */}
//       {isReceiptOpen && (
//         <div className="ko-modal-backdrop" onClick={() => setIsReceiptOpen(false)}>
//           <div className="ko-modal-content-card" onClick={(e) => e.stopPropagation()}>
//             <div className="ko-modal-header">
//               <h3>Print Receipt</h3>
//               <button className="ko-modal-close-cross" onClick={() => setIsReceiptOpen(false)}>×</button>
//             </div>

//             <div className="print-thermal-receipt-sheet">
//               {receiptLoading || !selectedOrder ? (
//                 <div className="ko-modal-spinner-wrapper">
//                   <div className="ko-spinner" />
//                   <p>Loading receipt…</p>
//                 </div>
//               ) : (
//                 <>
//                   <div className="receipt-crown-title">
//                     <h2>ORDER RECEIPT</h2>
//                     <p className="divider">- - - - - - - - - - - - - - - - - - -</p>
//                   </div>

//                   <div className="receipt-basics">
//                     <p><strong>Order No:</strong> {selectedOrder.order_number ?? selectedOrder.id}</p>
//                     <p><strong>Date:</strong> {fmtDate(selectedOrder.created_at)}</p>
//                     <p><strong>Time:</strong> {new Date(selectedOrder.created_at).toLocaleTimeString()}</p>
//                     <p><strong>Customer:</strong> {selectedOrder.customer?.first_name} {selectedOrder.customer?.last_name}</p>
//                     <p><strong>Phone:</strong> {selectedOrder.customer?.phone_no || selectedOrder.customerPhone}</p>
//                     <p><strong>Payment:</strong> {selectedOrder.payment_method || selectedOrder.paymentMethod}</p>
//                     <p className="divider">- - - - - - - - - - - - - - - - - - -</p>
//                   </div>

//                   <div className="receipt-items-table">
//                     {selectedOrder.items.map((item: any) => (
//                       <div key={`r-${item.id}`} className="receipt-item-row">
//                         <div className="receipt-item-main">
//                           <span className="receipt-item-name">{item.quantity} x {getItemDisplayName(item) || item.productName}</span>
//                           <span className="receipt-item-price">{fmtMoney(item.line_total ?? (item.price * item.quantity), selectedOrder.currency)}</span>
//                         </div>
//                         {getAddOns(item).length > 0 && (
//                           <div className="receipt-item-addons">Add-ons: {getAddOns(item).join(', ')}</div>
//                         )}
//                       </div>
//                     ))}

//                     {selectedOrder.order_addons?.length > 0 && (
//                       <>
//                         <div className="receipt-divider">-----------------------------------------</div>
//                         {selectedOrder.order_addons.map((addon: any, idx: number) => (
//                           <div key={`ra-${idx}`} className="receipt-item-row receipt-addon-row">
//                             <div className="receipt-item-main">
//                               <span className="receipt-item-name">{addon.quantity} × {addon.addon_name || addon.addonName || `Addon #${addon.addon_id ?? addon.addonId}`}</span>
//                               <span className="receipt-item-price">{fmtMoney(addon.total ?? (addon.price * addon.quantity), selectedOrder.currency)}</span>
//                             </div>
//                           </div>
//                         ))}
//                       </>
//                     )}
//                   </div>

//                   <div className="receipt-divider">-----------------------------------------</div>

//                   {/* totals */}
//                   {(() => {
//                     const itemSubtotal = Number(selectedOrder.subtotal ?? (selectedOrder.items?.reduce((s: number, it: any) => s + Number(it.line_total ?? (it.price * it.quantity || 0)), 0) || 0));
//                     const addonsTotal = Number(selectedOrder.order_addons_total ?? (selectedOrder.order_addons?.reduce((s: number, a: any) => s + Number(a.total ?? (a.price * a.quantity || 0)), 0) || 0));
//                     const discount = Number(selectedOrder.discount || 0);
//                     const deliveryCharge = Number(selectedOrder.delivery_charge ?? selectedOrder.deliveryCharge ?? 0);
//                     const computedGrandTotal = Number(selectedOrder.total ?? (itemSubtotal + addonsTotal - discount + deliveryCharge));

//                     return (
//                       <div className="receipt-totals">
//                         <div className="receipt-total-row"><span>Subtotal:</span><span>{fmtMoney(itemSubtotal, selectedOrder.currency)}</span></div>
//                         {addonsTotal > 0 && <div className="receipt-total-row"><span>Add-ons:</span><span>{fmtMoney(addonsTotal, selectedOrder.currency)}</span></div>}
//                         {discount > 0 && <div className="receipt-total-row"><span>Discount:</span><span>-{fmtMoney(discount, selectedOrder.currency)}</span></div>}
//                         <div className="receipt-total-row"><span>Delivery:</span><span>{fmtMoney(deliveryCharge, selectedOrder.currency)}</span></div>
//                         <div className="receipt-divider">-----------------------------------------</div>
//                         <div className="receipt-total-row grand-total"><span>GRAND TOTAL:</span><span>{fmtMoney(computedGrandTotal, selectedOrder.currency)}</span></div>
//                       </div>
//                     );
//                   })()}

//                   <div className="receipt-divider">-----------------------------------------</div>

//                   <div className="receipt-center receipt-footer-msg">
//                     <p>Thank you for dining with CakeNTake!</p>
//                     <p>Baked fresh daily, prepared artisanally.</p>
//                     <p className="receipt-url">www.cakentake.com</p>
//                   </div>

//                   <div className="receipt-modal-controls no-print footer-gap">
//                     <button className="sage-btn btn-secondary btn-sm" onClick={() => window.print()}>
//                       <IconPrinter size={13} /><span>Print</span>
//                     </button>
//                     <button className="sage-btn btn-primary btn-sm" onClick={() => setIsReceiptOpen(false)}>Close</button>
//                   </div>
//                 </>
//               )}
//             </div>

//           </div>
//         </div>
//       )}

//       {/* ─── Payment Link / QR Modal ─── */}
//       {paymentLinkOrderId && (
//         <div className="ko-modal-backdrop" onClick={closePaymentLinkModal}>
//           <div className="ko-modal-content-card ko-payment-modal-card" onClick={(e) => e.stopPropagation()}>
//             <div className="ko-modal-header">
//               <h3>
//                 Payment — {paymentLinkOrderMeta?.order_number || paymentLinkOrderMeta?.id || paymentLinkOrderId}
//               </h3>
//               <button className="ko-modal-close-cross" onClick={closePaymentLinkModal}>×</button>
//             </div>

//             <div className="ko-modal-body-area ko-payment-modal-body">
//               {paymentLinkOrderMeta && (
//                 <div className="ko-payment-summary">
//                   <p><strong>Customer:</strong> {getDisplayName(paymentLinkOrderMeta)}</p>
//                   <p>
//                     <strong>Amount:</strong>{' '}
//                     {fmtMoney(
//                       paymentLinkOrderMeta.total ?? paymentLinkOrderMeta.grand_total,
//                       paymentLinkOrderMeta.currency
//                     )}
//                   </p>
//                 </div>
//               )}

//               {paymentLinkLoading && (
//                 <div className="ko-modal-spinner-wrapper">
//                   <div className="ko-spinner" />
//                   <p>Generating payment link…</p>
//                 </div>
//               )}

//               {!paymentLinkLoading && paymentLinkError && (
//                 <div className="ko-action-error-banner ko-payment-error-banner">
//                   <span>{paymentLinkError}</span>
//                   <button onClick={() => handleOpenPaymentLink(paymentLinkOrderMeta)}>Retry</button>
//                 </div>
//               )}

//               {!paymentLinkLoading && paymentLink && (
//                 <div className="ko-payment-content">
//                   <div className="ko-payment-qr">
//                     <QRCodeSVG value={paymentLink} size={200} />
//                   </div>

//                   <div className="ko-payment-link-row">
//                     <input
//                       type="text"
//                       className="ko-payment-link-input"
//                       value={paymentLink}
//                       readOnly
//                       onFocus={(e) => e.target.select()}
//                     />
//                     <button className="ko-action-icon-btn" title="Copy link" onClick={handleCopyPaymentLink}>
//                       {paymentLinkCopied ? <IconCheck size={16} /> : <IconCopy size={16} />}
//                     </button>
//                   </div>

//                   <div className="ko-payment-actions">
//                     <a
//                       href={paymentLink}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="sage-btn btn-primary btn-sm"
//                     >
//                       <IconExternalLink size={13} /> Open Payment Page
//                     </a>
//                     <button className="sage-btn btn-secondary btn-sm" onClick={handleCopyPaymentLink}>
//                       {paymentLinkCopied ? <IconCheck size={13} /> : <IconCopy size={13} />}
//                       <span>{paymentLinkCopied ? 'Copied' : 'Copy Link'}</span>
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ─── Calendar View Modal ─── */}
//       {isCalendarOpen && (
//         <div className="ko-modal-backdrop" onClick={() => setIsCalendarOpen(false)}>
//           <div className="ko-calendar-modal-card" onClick={(e) => e.stopPropagation()}>
//             <div className="ko-modal-header ko-calendar-modal-header">
//               <h3><IconCalendar size={17} /> Order Calendar</h3>
//               <button className="ko-modal-close-cross" onClick={() => setIsCalendarOpen(false)}>×</button>
//             </div>

//             <div className="ko-calendar-modal-body">
//               {/* Month navigation */}
//               <div className="ko-calendar-nav-row">
//                 <button className="ko-calendar-nav-btn" onClick={goToPrevMonth} title="Previous month">
//                   <IconChevronLeft size={18} />
//                 </button>
//                 <div className="ko-calendar-month-label">
//                   {calendarMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
//                 </div>
//                 <button className="ko-calendar-nav-btn" onClick={goToNextMonth} title="Next month">
//                   <IconChevronRight size={18} />
//                 </button>
//                 <button className="ko-calendar-today-btn" onClick={goToCurrentMonth}>
//                   Today
//                 </button>
//               </div>

//               {/* Legend */}
//               <div className="ko-calendar-legend-row">
//                 {CALENDAR_STATUS_LEGEND.map(item => (
//                   <span key={item.key} className="ko-calendar-legend-item">
//                     <span className={`ko-cal-dot ko-cal-dot-${item.key}`} />
//                     {item.label}
//                   </span>
//                 ))}
//               </div>

//               {/* Weekday header */}
//               <div className="ko-calendar-weekday-row">
//                 {WEEKDAY_LABELS.map(w => (
//                   <div key={w} className="ko-calendar-weekday-cell">{w}</div>
//                 ))}
//               </div>

//               {/* Month grid */}
//               <div className="ko-calendar-grid">
//                 {buildMonthGrid(calendarMonth).map((cellDate, idx) => {
//                   if (!cellDate) {
//                     return <div key={`empty-${idx}`} className="ko-calendar-day-cell ko-calendar-day-empty" />;
//                   }

//                   const key = dateKey(cellDate);
//                   const entries = calendarOrdersByDay[key] || [];
//                   const today = new Date();
//                   const isToday = isSameDay(cellDate, today);
//                   const isSelected = calendarSelectedDate ? isSameDay(cellDate, calendarSelectedDate) : false;

//                   // Unique status colors present on this date (max 4 dots shown)
//                   const statusKeys = Array.from(new Set(entries.map(e => getStatusColorKey(e.order.status))));

//                   return (
//                     <button
//                       key={key}
//                       className={`ko-calendar-day-cell ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''} ${entries.length ? 'has-orders' : ''}`}
//                       onClick={() => setCalendarSelectedDate(cellDate)}
//                     >
//                       <span className="ko-calendar-day-number">{cellDate.getDate()}</span>
//                       {entries.length > 0 && (
//                         <span className="ko-calendar-day-dots">
//                           {statusKeys.slice(0, 4).map(sk => (
//                             <span key={sk} className={`ko-cal-dot ko-cal-dot-${sk}`} />
//                           ))}
//                           {entries.length > 4 && <span className="ko-calendar-day-more">+{entries.length - 4}</span>}
//                         </span>
//                       )}
//                     </button>
//                   );
//                 })}
//               </div>

//               {/* Selected date detail panel */}
//               <div className="ko-calendar-detail-panel">
//                 {!calendarSelectedDate ? (
//                   <p className="ko-calendar-detail-empty">Select a date on the calendar to see its orders.</p>
//                 ) : calendarSelectedDayEntries.length === 0 ? (
//                   <>
//                     <h5 className="ko-calendar-detail-heading">
//                       {calendarSelectedDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
//                     </h5>
//                     <p className="ko-calendar-detail-empty">No orders scheduled on this date.</p>
//                   </>
//                 ) : (
//                   <>
//                     <h5 className="ko-calendar-detail-heading">
//                       {calendarSelectedDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
//                       {' '}· {calendarSelectedDayEntries.length} order{calendarSelectedDayEntries.length > 1 ? 's' : ''}
//                     </h5>
//                     <div className="ko-calendar-detail-list">
//                       {calendarSelectedDayEntries.map(({ order, info }) => {
//                         const sk = getStatusColorKey(order.status);
//                         return (
//                           <button
//                             key={order.id}
//                             className="ko-calendar-detail-row"
//                             onClick={() => {
//                               setIsCalendarOpen(false);
//                               handleViewOrderDetails(order.id);
//                             }}
//                           >
//                             <span className={`ko-cal-dot ko-cal-dot-${sk}`} />
//                             <span className="ko-calendar-detail-order-num">
//                               #{order.order_number || String(order.id).padStart(5, '0')}
//                             </span>
//                             <span className="ko-calendar-detail-tag">
//                               {info.dateLabel}{info.timeLabel ? ` · ${info.timeLabel}` : ''}
//                             </span>
//                             <span className={`ko-status-pill pill-${(order.status || '').toLowerCase()} ko-calendar-detail-status`}>
//                               {(order.status || '').replace(/_/g, ' ')}
//                             </span>
//                           </button>
//                         );
//                       })}
//                     </div>
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// };

// export default KitchenOrder;



import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './KitchenOrder.css';
import { QRCodeSVG } from 'qrcode.react';
import {
  getKitchenPending,
  getKitchenProcessing,
  getKitchenOrderDetails,
  startProcessing,
  completeKitchenOrder,
  getMyCompletedKitchenOrders,
  markOrderPickedUp,
  markOrderPaymentPaid,
  completePickupOrder,
  KitchenOrder as KitchenOrderRecord,
} from '../../services/kitchenService';
import { createPaymentLink } from '../../services/paymentService';

/* ─── SVG Icons ──────────────────────────────────────────────────────────────── */
const IconChef = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 18h12a2 2 0 0 0 2-2v-3H4v3a2 2 0 0 0 2 2z" />
    <path d="M12 2v3" />
    <path d="M9 3v2" />
    <path d="M15 3v2" />
    <path d="M19 13V7a5 5 0 0 0-10 0v6" />
  </svg>
);

const IconClock = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);

const IconCheckCircle = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
);

const IconEye = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
);

const IconImageFallback = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
);

const IconPrinter = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 9V2h12v7" />
    <rect x="6" y="13" width="12" height="9" rx="2" />
    <path d="M6 18h12" />
  </svg>
);

const IconCalendar = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconChevronLeft = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const IconChevronRight = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const IconCash = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="2" />
    <path d="M6 12h.01M18 12h.01" />
  </svg>
);

const IconCake = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
    <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" />
    <path d="M12 3v4" />
    <path d="M12 7c-1.5 0-2-1-2-1.5S10.5 4 12 3c1.5 1 2 1.5 2 2.5S13.5 7 12 7z" />
  </svg>
);

// Pickup-bag icon — used to badge / highlight pickup orders on the card and in
// the order detail modal's fulfilment section.
const IconBag = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

// Delivery-truck icon — used to badge / highlight delivery orders on the card
// and in the order detail modal's fulfilment section.
const IconTruck = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 3h15v13H1z" />
    <path d="M16 8h4l3 3v5h-7V8z" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const IconClose = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// Payment / QR icons — used for the "Payment" action added to each order card
// and the order detail modal footer.
const IconCreditCard = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const IconCopy = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const IconCheck = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconExternalLink = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

/* ─── Helpers ────────────────────────────────────────────────────────────────── */

interface ItemCustomJson {
  variant?: string;
  flavour?: string;
  flavor?: string;
  shape?: string;
  add_ons?: string[];
  addons?: string[];
  add_on_total?: number;
  notes?: string;
  product_type?: string;
}

const getCustomJson = (item: any): ItemCustomJson => item?.custom_json || {};

const getFlavour = (item: any) => {
  const cj = getCustomJson(item);
  return cj.flavour || cj.flavor || item?.flavour || item?.flavor || null;
};

const getVariant = (item: any) => {
  const cj = getCustomJson(item);
  return cj.variant || item?.variant || null;
};

const getShape = (item: any) => {
  const cj = getCustomJson(item);
  return cj.shape || item?.shape || null;
};

const getAddOns = (item: any): string[] => {
  const cj = getCustomJson(item);
  const list = cj.add_ons || cj.addons || item?.add_ons || item?.selected_add_ons || [];
  return Array.isArray(list) ? list : [];
};

const getItemNotes = (item: any) => {
  const cj = getCustomJson(item);
  return cj.notes || item?.notes || null;
};

// Agent-exclusive items (custom_json.product_type === 'AGENT') are returned by the
// backend under `agent_product` instead of `product` (their `product_id` is null).
// Always resolve through this helper instead of reading `item.product` directly so
// agent-exclusive line items render their name/description/image correctly here,
// the same way OrderManagement.tsx already does.
const isAgentExclusiveItem = (item: any) => getCustomJson(item)?.product_type === 'AGENT';

const getItemProductSource = (item: any) => {
  const isAgentExclusive = isAgentExclusiveItem(item);
  const agentProduct = item?.agent_product ?? {};
  const product = item?.product ?? {};
  return isAgentExclusive ? agentProduct : product;
};

const getItemDisplayName = (item: any) => {
  const source = getItemProductSource(item);
  return (
    source?.name ||
    item?.product_name ||
    item?.name ||
    (isAgentExclusiveItem(item) ? 'Agent Product' : 'Assorted Item')
  );
};

const getItemDisplayImage = (item: any) => {
  const source = getItemProductSource(item);
  return source?.image_url || source?.imageUrl || source?.image || null;
};

const getItemDisplayDescription = (item: any) => {
  const source = getItemProductSource(item);
  return source?.description || null;
};

const currencySymbol = (cur?: string) => {
  const c = cur || (typeof window !== 'undefined' ? localStorage.getItem('currency') || 'INR' : 'INR');
  return c === 'INR' ? '₹' : c;
};

const fmtMoney = (n: number | undefined, cur?: string) => `${currencySymbol(cur)}${Number(n || 0).toFixed(0)}`;

const fmtDateTime = (d?: string | null) =>
  d ? new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }) : null;

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null;

const getDisplayName = (order: any) => {
  if (order?.customer?.name) return order.customer.name;
  const nameParts = [order?.customer?.first_name, order?.customer?.last_name].filter(Boolean);
  return nameParts.length ? nameParts.join(' ') : order?.customer_name || '—';
};

const getDisplayEmail = (order: any) => order?.customer?.email || order?.customer_email || '—';
const getDisplayPhone = (order: any) => order?.customer?.phone_no || order?.customer_phone || '—';
const getDisplayOrderSource = (order: any) => order?.order_source || order?.order_type || '—';
const getDisplayRole = (order: any) => order?.customer?.role?.toUpperCase() || (order?.order_type ? order.order_type.toUpperCase() : 'USER');

const formatAddressString = (address: any) => {
  if (!address) return '—';
  const parts = [
    address.addressLine1,
    address.street,
    address.line1,
    address.line2,
    address.area,
    address.city,
    address.state,
    address.pincode,
    address.country,
  ].filter(Boolean);
  return parts.length ? parts.join(', ') : '—';
};


const getAddressAreaName = (address: any) => {
  const area = address?.area;
  if (area === undefined || area === null || area === '') return null;
  if (typeof area === 'object') return area.name ?? area.areaName ?? null;
  return area;
};

const getAddressFieldValue = (address: any, keys: string[]) => {
  for (const k of keys) {
    const v = address?.[k];
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return null;
};

// const ADDRESS_FIELD_DEFS: { label: string; keys?: string[]; resolver?: (a: any) => any }[] = [
//   { label: 'Area', resolver: getAddressAreaName },
//   { label: 'Block', keys: ['block'] },
//   { label: 'House / Flat No', keys: ['house_flat_no', 'houseFlatNo', 'houseNo', 'flatNo', 'building'] },
//   { label: 'Street', keys: ['street'] },
//   { label: 'Country', keys: ['country'] },
//   { label: 'Landmark', keys: ['landmark'] },
//   { label: 'Delivery Notes', keys: ['addressNotes', 'deliveryNotes', 'delivery_notes', 'notes'] },
// ];

const ADDRESS_FIELD_DEFS: { label: string; keys?: string[]; resolver?: (a: any) => any }[] = [
  { label: 'Area', resolver: getAddressAreaName },
  { label: 'Block', keys: ['block'] },
  { label: 'Building', keys: ['building'] },
  { label: 'Avenue', keys: ['avenue'] },
  { label: 'Street', keys: ['street'] },
  {
    label: 'Floor / Apt',
    resolver: (a: any) => {
      const floor = a?.floor;
      const apt = a?.apartment;
      if (!floor && !apt) return null;
      return [floor, apt].filter(Boolean).join(' ');
    },
  },
  { label: 'Country', keys: ['country'] },
   { label: 'Delivery Notes', keys: ['addressNotes', 'deliveryNotes', 'delivery_notes', 'notes'] },
];

const getAddressFields = (address: any) =>
  ADDRESS_FIELD_DEFS.map(({ label, keys, resolver }) => ({
    label,
    value: resolver ? resolver(address) : getAddressFieldValue(address, keys || []),
  }));


const getKitchenOrderAddons = (order: any): any[] => {
  if (Array.isArray(order?.order_addons)) return order.order_addons;
  if (Array.isArray(order?.order_addons_json)) return order.order_addons_json;
  return [];
};

const getKitchenOrderAddonTotal = (order: any): number => {
  const addons = getKitchenOrderAddons(order);
  return Number(order?.order_addons_total ?? addons.reduce((sum: number, addon: any) => sum + Number(addon.total ?? (addon.price * addon.quantity || 0)), 0));
};

// Reads the custom-cake customization payload off an order (custom_cake_json /
// custom_cake, whichever the backend sends). This mirrors OrderManagement.tsx's
// `customCake` normalization — it was already defined here but never rendered
// anywhere in the modal, so custom-cake orders showed everything except their
// customization details. It's now wired into the order detail modal below.
const getCustomCakeDetails = (order: any) => {
  const customCake = order?.custom_cake_json ?? order?.custom_cake ?? null;
  if (!customCake || typeof customCake !== 'object') return null;
  return {
    image: customCake?.image || customCake?.image_url || null,
    flavour: customCake?.flavour || customCake?.flavor || null,
    weight: customCake?.weight || null,
    shape: customCake?.shape || null,
    size: customCake?.size || null,
    colour: customCake?.colour || customCake?.color || null,
    message: customCake?.message || null,
    notes: customCake?.notes || null,
    price: customCake?.price != null ? Number(customCake.price) : null,
  };
};

const isCustomCakeOrder = (order: any) => !!getCustomCakeDetails(order);

// ── Payment-link eligibility ──────────────────────────────────────────────
// Online payment links are only offered for PICKUP orders. For delivery
// orders, payment is settled through the normal checkout/COD flow, so we
// never show a payment-link action there. Even for pickup orders, we don't
// currently support online payment when the order currency is INR — those
// are collected as Cash (COD) or UPI directly through the "Mark Delivered"
// popover instead, so no link is generated for them either.
const isOrderPickup = (order: any) => (order?.delivery_method || '').toUpperCase() === 'PICKUP';

const canGeneratePaymentLink = (order: any) => {
  if (!order) return false;
  const currency = (order?.currency || 'INR').toUpperCase();
  return isOrderPickup(order) && currency !== 'INR';
};

const getPaymentLinkDisabledReason = (order: any): string | null => {
  if (!order) return null;
  if (!isOrderPickup(order)) return 'Payment links are only available for pickup orders.';
  const currency = (order?.currency || 'INR').toUpperCase();
  if (currency === 'INR') {
    return "Online payment isn't supported for INR — collect Cash (COD) or UPI when marking the order delivered.";
  }
  return null;
};

// ── Order origin (who placed the order) — used to tint the kitchen card ────
// Mirrors the origin logic already used in OrderManagement.tsx (isSalesAgentOrder
// / isAgentOrder), adapted to the snake_case fields the kitchen order records use.
const getOrderCreatedByRole = (order: any) =>
  (order?.created_by?.role ?? order?.createdByRole ?? '').toString().toUpperCase();

const isSalesAgentKitchenOrder = (order: any) => {
  const role = getOrderCreatedByRole(order);
  const source = (order?.order_source ?? '').toString().toUpperCase();
  const type = (order?.order_type ?? '').toString().toUpperCase();
  return role === 'SALES_AGENT' || source === 'SALES_AGENT' || type === 'SALES_AGENT';
};

const isAgentKitchenOrder = (order: any) => {
  if (isSalesAgentKitchenOrder(order)) return false;
  const role = getOrderCreatedByRole(order);
  const source = (order?.order_source ?? '').toString().toUpperCase();
  return role === 'AGENT' || source === 'AGENT';
};

// Regular customer orders keep the card's default background. Agent orders
// get the lightest green tint, Sales-Agent orders get the lightest rose
// tint — independent of (and layered on top of) the blue/green pickup vs
// delivery border-left highlight.
const getOrderOriginCardClass = (order: any) => {
  if (isSalesAgentKitchenOrder(order)) return 'card-origin-sales-agent';
  if (isAgentKitchenOrder(order)) return 'card-origin-agent';
  return '';
};

const getExpectedDelivery = (order: any): { label: string } | null => {
  if (!order) return null;

  const explicit =
    order.expected_delivery_at ||
    order.expected_delivery_time ||
    order.estimated_delivery_at;
  if (explicit) return { label: fmtDateTime(explicit) as string };

  const date = order.delivery_date || order.deliveryDate;
  const slot = order.delivery_time_slot ?? order.deliveryTimeSlot;
  if (date && slot) return { label: `${fmtDate(date)} · ${slot}` };
  if (date) return { label: fmtDate(date) as string };
  if (slot) return { label: slot };

  return null;
};

interface FulfillmentInfo {
  isPickup: boolean;
  date: string | null;
  time: string | null;
}

// Resolves the single relevant date/time for an order based on its actual
// fulfilment method, so the UI never shows the wrong (or empty) schedule:
//  · PICKUP   → pickup_date / pickup_time_slot (falls back to the delivery_*
//               fields only if pickup-specific ones are missing)
//  · DELIVERY → delivery_date / delivery_time_slot only — pickup fields are
//               never read or shown for a delivery order.
// Card and modal both call this so "hide the other type's info" logic lives
// in one place instead of being duplicated per view.
const getFulfillmentInfo = (order: any): FulfillmentInfo => {
  const isPickup = (order?.delivery_method || '').toUpperCase() === 'PICKUP';

  if (isPickup) {
    const rawDate = order?.pickup_date || order?.delivery_date || order?.deliveryDate;
    const time = order?.pickup_time_slot || order?.delivery_time_slot || order?.deliveryTimeSlot || null;
    return { isPickup: true, date: rawDate ? fmtDate(rawDate) : null, time };
  }

  const rawDate = order?.delivery_date || order?.deliveryDate;
  const time = order?.delivery_time_slot ?? order?.deliveryTimeSlot ?? null;
  return { isPickup: false, date: rawDate ? fmtDate(rawDate) : null, time };
};

/* ─── Calendar helpers ───────────────────────────────────────────────────────── */

type CalendarStatusKey = 'grey' | 'yellow' | 'green' | 'red';

// pending/assigned → grey · preparing → yellow · ready/completed/delivered → green · cancelled/rejected → red
const getStatusColorKey = (status?: string): CalendarStatusKey => {
  const s = (status || '').toUpperCase();
  if (['CANCELLED', 'CANCELED', 'REJECTED'].includes(s)) return 'red';
  if (['PREPARING', 'PROCESSING'].includes(s)) return 'yellow';
  if (['DELIVERED', 'COMPLETED', 'READY', 'READY_FOR_PICKUP', 'READY_FOR_DISPATCH'].includes(s)) return 'green';
  return 'grey';
};

const CALENDAR_STATUS_LEGEND: { key: CalendarStatusKey; label: string }[] = [
  { key: 'grey', label: 'Pending' },
  { key: 'yellow', label: 'Preparing' },
  { key: 'green', label: 'Completed' },
  { key: 'red', label: 'Cancelled' },
];

interface CalendarOrderInfo {
  date: Date;
  dateLabel: string;
  timeLabel: string | null;
}

// Resolve the date/time to plot an order on the calendar:
//  · Pickup orders  → pickup date & time (falls back to delivery date/slot)
//  · Delivery orders with an expected delivery date → that date & time slot
//  · Otherwise (nothing scheduled yet) → the order's created date & time
const getOrderCalendarInfo = (order: any): CalendarOrderInfo => {
  const isPickup = (order?.delivery_method || '').toUpperCase() === 'PICKUP';

  if (isPickup) {
    const d = order?.pickup_date || order?.delivery_date;
    if (d) {
      return {
        date: new Date(d),
        dateLabel: 'Pickup',
        timeLabel: order?.pickup_time_slot || order?.delivery_time_slot || null,
      };
    }
  } else if (order?.delivery_date) {
    return {
      date: new Date(order.delivery_date),
      dateLabel: 'Expected Delivery',
      timeLabel: order?.delivery_time_slot || null,
    };
  }

  const created = new Date(order?.created_at);
  return {
    date: created,
    dateLabel: 'Order Placed',
    timeLabel: created.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
  };
};

const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const buildMonthGrid = (monthDate: Date): (Date | null)[] => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
};

const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];



// The logged-in kitchen staff member's id — used only for display purposes
// now (e.g. "(You)" tag), since /kitchen/my-completed-orders already scopes
// the Completed tab server-side.
const getCurrentUserId = (): number | null => {
  try {
    const stored = JSON.parse(localStorage.getItem('user') || '{}');
    return stored?.id ?? null;
  } catch {
    return null;
  }
};

/* ─── Date filter helpers ────────────────────────────────────────────────────── */
type DateFilterMode = 'all' | 'today' | 'month' | 'custom';

const DATE_FILTER_OPTIONS: { key: DateFilterMode; label: string }[] = [
  { key: 'all', label: 'All Time' },
  { key: 'today', label: 'Today' },
  { key: 'month', label: 'By Month' },
  { key: 'custom', label: 'By Date' },
];

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const KitchenOrder: React.FC = () => {
  const currentUserId = useMemo(getCurrentUserId, []);

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'processing' | 'completed'>('all');
  const [pendingOrders, setPendingOrders] = useState<KitchenOrderRecord[]>([]);
  const [processingOrders, setProcessingOrders] = useState<KitchenOrderRecord[]>([]);
  const [completedOrders, setCompletedOrders] = useState<KitchenOrderRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Date-wise / month-wise / day-wise filter
  const [dateFilterMode, setDateFilterMode] = useState<DateFilterMode>('all');
  const [customDate, setCustomDate] = useState<string>('');   // yyyy-mm-dd
  const [customMonth, setCustomMonth] = useState<string>(''); // yyyy-mm

  // Calendar view modal
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<Date | null>(null);

  // Which order's "Payment" popover is currently open (card grid + modal share this)
  const [paymentMenuOrderId, setPaymentMenuOrderId] = useState<number | null>(null);

  // Detailed Modal states
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  // Receipt modal state (separate from detailed view)
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
  const [receiptLoading, setReceiptLoading] = useState<boolean>(false);

  // ── Payment link / QR modal state ──
  const [paymentLinkOrderId, setPaymentLinkOrderId] = useState<number | null>(null);
  const [paymentLinkOrderMeta, setPaymentLinkOrderMeta] = useState<any>(null);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [paymentLinkLoading, setPaymentLinkLoading] = useState<boolean>(false);
  const [paymentLinkError, setPaymentLinkError] = useState<string | null>(null);
  const [paymentLinkCopied, setPaymentLinkCopied] = useState<boolean>(false);

  const fetchAllKitchenData = useCallback(async () => {
    try {
      setLoading(true);

      // /kitchen/my-completed-orders is scoped server-side to the logged-in
      // kitchen staff member, so no client-side filtering is needed anymore.
      const [pending, processing, myCompleted] = await Promise.all([
        getKitchenPending(),
        getKitchenProcessing(),
        getMyCompletedKitchenOrders(),
      ]);

      setPendingOrders(pending);
      setProcessingOrders(processing);
      setCompletedOrders(myCompleted);
    } catch (err) {
      console.error('Failed to load kitchen dashboard data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllKitchenData();
  }, [fetchAllKitchenData]);

  const allOrders = useMemo(() => {
    return [...pendingOrders, ...processingOrders, ...completedOrders].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [pendingOrders, processingOrders, completedOrders]);

  const visibleOrders = useMemo(() => {
    switch (activeTab) {
      case 'pending': return pendingOrders;
      case 'processing': return processingOrders;
      case 'completed': return completedOrders;
      default: return allOrders;
    }
  }, [activeTab, pendingOrders, processingOrders, completedOrders, allOrders]);

  // Apply date / month / day filter on top of the active tab's list
  const filteredOrders = useMemo(() => {
    if (dateFilterMode === 'all') return visibleOrders;

    return visibleOrders.filter((order: any) => {
      const created = new Date(order.created_at);

      if (dateFilterMode === 'today') {
        return isSameDay(created, new Date());
      }

      if (dateFilterMode === 'month') {
        if (!customMonth) return true;
        const [y, m] = customMonth.split('-').map(Number);
        return created.getFullYear() === y && created.getMonth() + 1 === m;
      }

      if (dateFilterMode === 'custom') {
        if (!customDate) return true;
        const [y, m, d] = customDate.split('-').map(Number);
        return created.getFullYear() === y && created.getMonth() + 1 === m && created.getDate() === d;
      }

      return true;
    });
  }, [visibleOrders, dateFilterMode, customDate, customMonth]);

  // Group every known order (not just the active tab) by the calendar date
  // resolved via getOrderCalendarInfo(), so the calendar modal can plot dots
  // regardless of which tab / date-filter is currently active.
  const calendarOrdersByDay = useMemo(() => {
    const map: Record<string, { order: any; info: CalendarOrderInfo }[]> = {};
    allOrders.forEach((order: any) => {
      const info = getOrderCalendarInfo(order);
      if (!info.date || isNaN(info.date.getTime())) return;
      const key = dateKey(info.date);
      if (!map[key]) map[key] = [];
      map[key].push({ order, info });
    });
    return map;
  }, [allOrders]);

  const calendarSelectedDayEntries = useMemo(() => {
    if (!calendarSelectedDate) return [];
    return calendarOrdersByDay[dateKey(calendarSelectedDate)] || [];
  }, [calendarSelectedDate, calendarOrdersByDay]);

  const openCalendarView = () => {
    setCalendarMonth(new Date());
    setCalendarSelectedDate(null);
    setIsCalendarOpen(true);
  };

  const goToPrevMonth = () => {
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToCurrentMonth = () => {
    const today = new Date();
    setCalendarMonth(today);
    setCalendarSelectedDate(today);
  };

  const handleViewOrderDetails = async (orderId: number) => {
    try {
      setModalLoading(true);
      setModalOpen(true);
      const data = await getKitchenOrderDetails(orderId);
      setSelectedOrder(data);
    } catch (err) {
      console.error("Could not fetch full order record manifest", err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenReceipt = async (orderId: number) => {
    try {
      setReceiptLoading(true);
      // fetch full details (same endpoint) so receipt has all fields
      const data = await getKitchenOrderDetails(orderId);
      setSelectedOrder(data);
      setIsReceiptOpen(true);
    } catch (err) {
      console.error('Could not fetch order for receipt', err);
    } finally {
      setReceiptLoading(false);
    }
  };

  const handleStartPreparation = async (orderId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActionError(null);
    try {
      setActionLoading(orderId);
      await startProcessing(orderId);
      await fetchAllKitchenData();

      if (modalOpen && selectedOrder?.id === orderId) {
        const updated = await getKitchenOrderDetails(orderId);
        setSelectedOrder(updated);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        "Couldn't start preparation — someone may have already claimed this order.";
      setActionError(msg);
      // Refresh so the button/status reflects reality if someone else beat us to it.
      await fetchAllKitchenData();
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkReady = async (orderId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActionError(null);
    try {
      setActionLoading(orderId);
      await completeKitchenOrder(orderId);
      // This order now moves into "Completed (Mine)" — refetch so the
      // completed list (and its count) picks it up immediately.
      await fetchAllKitchenData();
      if (modalOpen && selectedOrder?.id === orderId) {
        setModalOpen(false);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Couldn't mark this order ready.";
      setActionError(msg);
    } finally {
      setActionLoading(null);
    }
  };

  // Kitchen marks a PICKUP order as delivered/collected (POST /orders/:id/pickup)
  // Backend sets status straight to DELIVERED — no intermediate step.
  const handleMarkDelivered = async (orderId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActionError(null);
    try {
      setActionLoading(orderId);
      await markOrderPickedUp(orderId);
      await fetchAllKitchenData();
      if (modalOpen && selectedOrder?.id === orderId) {
        setModalOpen(false);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Couldn't mark this order as delivered.";
      setActionError(msg);
    } finally {
      setActionLoading(null);
    }
  };

  // Kitchen confirms how payment was collected — COD or Online — for a pickup order
  const handleSelectPaymentMethod = async (orderId: number, method: 'COD' | 'UPI', e: React.MouseEvent) => {
    e.stopPropagation();
    setActionError(null);
    setPaymentMenuOrderId(null);
    try {
      setActionLoading(orderId);
      await markOrderPaymentPaid(orderId, method);
      await fetchAllKitchenData();
      if (modalOpen && selectedOrder?.id === orderId) {
        const updated = await getKitchenOrderDetails(orderId);
        setSelectedOrder(updated);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Couldn't update payment status.";
      setActionError(msg);
    } finally {
      setActionLoading(null);
    }
  };

  const clearDateFilter = () => {
    setDateFilterMode('all');
    setCustomDate('');
    setCustomMonth('');
  };

  // Kitchen picks COD or Online for a pickup order → marks paid AND delivered, in one call
  const handleCompletePickup = async (orderId: number, method: 'COD' | 'UPI', e: React.MouseEvent) => {
    e.stopPropagation();
    setActionError(null);
    setPaymentMenuOrderId(null);
    try {
      setActionLoading(orderId);
      await completePickupOrder(orderId, method);
      await fetchAllKitchenData();
      if (modalOpen && selectedOrder?.id === orderId) {
        setModalOpen(false);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Couldn't complete this pickup order.";
      setActionError(msg);
    } finally {
      setActionLoading(null);
    }
  };

  const togglePaymentMenu = (orderId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setPaymentMenuOrderId((prev) => (prev === orderId ? null : orderId));
  };

  // ── Payment link / QR handlers ──
  const handleOpenPaymentLink = async (order: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const orderId = order?.id;
    if (!orderId) return;

    // Payment links are only offered for eligible orders (pickup + non-INR).
    // If the order doesn't qualify, surface why instead of calling the API.
    const disabledReason = getPaymentLinkDisabledReason(order);
    if (disabledReason) {
      setPaymentLinkOrderId(orderId);
      setPaymentLinkOrderMeta(order);
      setPaymentLink(null);
      setPaymentLinkCopied(false);
      setPaymentLinkLoading(false);
      setPaymentLinkError(disabledReason);
      return;
    }

    setPaymentLinkOrderId(orderId);
    setPaymentLinkOrderMeta(order);
    setPaymentLink(null);
    setPaymentLinkError(null);
    setPaymentLinkCopied(false);
    setPaymentLinkLoading(true);
    try {
      const result = await createPaymentLink(Number(orderId));
      if (result?.success === false) {
        setPaymentLinkError(result?.error || 'Unable to generate payment link.');
      } else if (result?.payment_url) {
        setPaymentLink(result.payment_url);
      } else {
        setPaymentLinkError('Payment link was not returned by the server.');
      }
    } catch (err: any) {
      console.error('Failed to create payment link:', err);
      setPaymentLinkError(
        err?.response?.data?.error || 'Failed to generate payment link. Please try again.'
      );
    } finally {
      setPaymentLinkLoading(false);
    }
  };

  const handleCopyPaymentLink = async () => {
    if (!paymentLink) return;
    try {
      await navigator.clipboard.writeText(paymentLink);
      setPaymentLinkCopied(true);
      setTimeout(() => setPaymentLinkCopied(false), 2000);
    } catch {
      /* clipboard unavailable, ignore */
    }
  };

  const closePaymentLinkModal = () => {
    setPaymentLinkOrderId(null);
    setPaymentLinkOrderMeta(null);
    setPaymentLink(null);
    setPaymentLinkError(null);
    setPaymentLinkLoading(false);
    setPaymentLinkCopied(false);
  };

  // Human-readable summary of the active date filter, shown next to the
  // segmented control so it's obvious what's currently applied.
  const activeDateFilterSummary = useMemo(() => {
    if (dateFilterMode === 'all') return null;
    if (dateFilterMode === 'today') return 'Today';
    if (dateFilterMode === 'month') {
      if (!customMonth) return 'Pick a month';
      const [y, m] = customMonth.split('-').map(Number);
      return new Date(y, m - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    }
    if (dateFilterMode === 'custom') {
      if (!customDate) return 'Pick a date';
      return fmtDate(customDate);
    }
    return null;
  }, [dateFilterMode, customDate, customMonth]);

  return (
    <div className="ko-workspace-container">

      {/* ─── Page Title Header ─── */}
      <div className="ko-page-header">
        <div className="ko-page-header-text">
          <h2>Kitchen Dashboard</h2>
          <p>Monitor real-time line preparation items, active orders, and live chef fulfillment tasks.</p>
        </div>
      </div>

      {actionError && (
        <div className="ko-action-error-banner">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)}>Dismiss</button>
        </div>
      )}

      {/* ─── Counter Metrics Top Row Grid ─── */}
      {/* <div className="ko-stats-grid">
        <div className="ko-stat-card" onClick={() => setActiveTab('all')}>
          <div className="ko-stat-icon icon-all"><IconChef size={24} /></div>
          <div className="ko-stat-details">
            <h3>{allOrders.length}</h3>
            <p>Total Orders Today</p>
          </div>
        </div>
        <div className="ko-stat-card" onClick={() => setActiveTab('pending')}>
          <div className="ko-stat-icon icon-pending"><IconClock size={24} /></div>
          <div className="ko-stat-details">
            <h3>{pendingOrders.length}</h3>
            <p>Awaiting Prep</p>
          </div>
        </div>
        <div className="ko-stat-card" onClick={() => setActiveTab('processing')}>
          <div className="ko-stat-icon icon-processing"><IconChef size={24} /></div>
          <div className="ko-stat-details">
            <h3>{processingOrders.length}</h3>
            <p>Currently In Oven</p>
          </div>
        </div>
        <div className="ko-stat-card" onClick={() => setActiveTab('completed')}>
          <div className="ko-stat-icon icon-completed"><IconCheckCircle size={24} /></div>
          <div className="ko-stat-details">
            <h3>{completedOrders.length}</h3>
            <p>Completed by Me</p>
          </div>
        </div>
      </div> */}

      {/* ─── Filter Navigation Tab Row ─── */}
      <div className="ko-tabs-navigation-bar">
        {/* <button className={`ko-tab-nav-item ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
          All Orders <span className="ko-tab-badge bg-all">{allOrders.length}</span>
        </button> */}
        <button className={`ko-tab-nav-item ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
          Pending <span className="ko-tab-badge bg-pending">{pendingOrders.length}</span>
        </button>
        <button className={`ko-tab-nav-item ${activeTab === 'processing' ? 'active' : ''}`} onClick={() => setActiveTab('processing')}>
          Processing <span className="ko-tab-badge bg-processing">{processingOrders.length}</span>
        </button>
        <button className={`ko-tab-nav-item ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>
          Completed (Mine) <span className="ko-tab-badge bg-completed">{completedOrders.length}</span>
        </button>
         <button className={`ko-tab-nav-item ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
          All Orders <span className="ko-tab-badge bg-all">{allOrders.length}</span>
        </button>
      </div>

      {/* ─── Date / Month / Day Filter Bar (redesigned as a segmented control) ─── */}
      <div className="ko-date-filter-bar">
        <div className="ko-filter-segment-group" role="tablist" aria-label="Filter orders by date">
          {DATE_FILTER_OPTIONS.map(opt => (
            <button
              key={opt.key}
              role="tab"
              aria-selected={dateFilterMode === opt.key}
              className={`ko-filter-segment-btn ${dateFilterMode === opt.key ? 'active' : ''}`}
              onClick={() => setDateFilterMode(opt.key)}
            >
              {opt.key === 'today' && <IconClock size={13} />}
              {(opt.key === 'month' || opt.key === 'custom') && <IconCalendar size={13} />}
              {opt.label}
            </button>
          ))}
        </div>

        {dateFilterMode === 'month' && (
          <label className="ko-date-filter-input-wrap">
            <IconCalendar size={14} />
            <input
              type="month"
              className="ko-date-filter-input"
              value={customMonth}
              onChange={(e) => setCustomMonth(e.target.value)}
              autoFocus
            />
          </label>
        )}

        {dateFilterMode === 'custom' && (
          <label className="ko-date-filter-input-wrap">
            <IconCalendar size={14} />
            <input
              type="date"
              className="ko-date-filter-input"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              autoFocus
            />
          </label>
        )}

        {activeDateFilterSummary && (
          <span className="ko-date-filter-active-chip">
            Showing: <strong>{activeDateFilterSummary}</strong>
            <button className="ko-date-filter-chip-clear" onClick={clearDateFilter} title="Reset filter" aria-label="Clear date filter">
              <IconClose size={11} />
            </button>
          </span>
        )}

        {/* <button className="ko-calendar-view-btn" onClick={openCalendarView}>
          <IconCalendar size={15} /> Calendar View
        </button> */}
      </div>

      {/* ─── Card Highlight Legend ─── */}
      <div className="ko-card-legend-row">
        <span className="ko-card-legend-item">
          <span className="ko-legend-swatch swatch-fulfillment-delivery" /> Delivery order
        </span>
        <span className="ko-card-legend-item">
          <span className="ko-legend-swatch swatch-fulfillment-pickup" /> Pickup order
        </span>
        <span className="ko-card-legend-item">
          <span className="ko-legend-swatch swatch-origin-agent" /> Agent order
        </span>
        <span className="ko-card-legend-item">
          <span className="ko-legend-swatch swatch-origin-sales-agent" /> Sales agent order
        </span>
      </div>

      {/* ─── Active Queue Layout Loop ─── */}
      {loading ? (
        <div className="ko-workspace-center-loader">
          <div className="ko-spinner" />
          <p>Syncing hot items with kitchen lines...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="ko-empty-state">
          <IconChef size={50} />
          <h3>No Orders Found</h3>
          <p>
            {activeTab === 'completed'
              ? "You haven't completed any orders yet."
              : `There are no items currently categorized under the "${activeTab}" status loop.`}
          </p>
        </div>
      ) : (
        <div className="ko-orders-grid">
          {filteredOrders.map((order: any) => {
            const dateStr = new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
            const currentStatus = (order.status || 'PENDING').toUpperCase();
            const isMine = order.preparation_started_by === currentUserId;
            const isPickup = (order.delivery_method || '').toUpperCase() === 'PICKUP';
            const isReadyForPickup = currentStatus === 'PICKUP_READY';
            const isPaid = (order.payment_status || '').toUpperCase() === 'PAID';
            const isPaymentMenuOpen = paymentMenuOrderId === order.id;
            const isCustomCake = isCustomCakeOrder(order);
            const fulfillment = getFulfillmentInfo(order);
            const originCardClass = getOrderOriginCardClass(order);
            const paymentLinkEligible = canGeneratePaymentLink(order);
            const paymentLinkDisabledReason = getPaymentLinkDisabledReason(order);

            return (
              <div
                key={order.id}
                className={`ko-order-card ${isPickup ? 'card-fulfillment-pickup' : 'card-fulfillment-delivery'} ${originCardClass}`}
                onClick={() => handleViewOrderDetails(order.id)}
              >
                <div className="ko-card-upper-row">
                  <div>
                    <h4 className="ko-order-title">Order #{order.order_number || String(order.id).padStart(5, '0')}</h4>
                    <span className="ko-order-timestamp"><IconClock size={12} /> {dateStr}</span>
                  </div>
                  <span className={`ko-status-pill pill-${currentStatus.toLowerCase()}`}>
                    {currentStatus.replace(/_/g, ' ')}
                  </span>
                </div>

                {isCustomCake && (
                  <div className="op-origin-badge badge-custom-cake" style={{ marginBottom: 6 }}>
                    <IconCake size={11} /> Custom Cake Order
                  </div>
                )}

                {/* Fulfilment highlight row — pickup orders show only pickup
                    date/time, delivery orders show only delivery date/time. */}
                <div className={`ko-fulfillment-row ${isPickup ? 'is-pickup' : 'is-delivery'}`}>
                  <span className="ko-fulfillment-type-badge">
                    {isPickup ? <IconBag size={12} /> : <IconTruck size={12} />}
                    {isPickup ? 'Pickup' : 'Delivery'}
                  </span>
                  <span className="ko-fulfillment-schedule">
                    <IconCalendar size={12} />
                    {fulfillment.date || 'Date TBD'}
                    {fulfillment.time && <span className="ko-fulfillment-time"> · {fulfillment.time}</span>}
                  </span>
                </div>

                {currentStatus === "PREPARING" && (
                  <div className="ko-owner-tag">
                    <strong>Kitchen Staff:</strong>{" "}
                    {typeof order.preparation_started_by === 'object' ? order.preparation_started_by?.name : order.preparation_started_by || "Unknown"}
                    {isMine && " (You)"}
                  </div>
                )}

                {/* Products Manifest Block */}
                <div className="ko-card-items-preview">
                  {order.items?.map((item: any, idx: number) => (
                    <div key={item.id || idx} className="ko-preview-item-line">
                      <span className="ko-item-quantity">×{item.quantity}</span>
                      <span className="ko-item-name">{getItemDisplayName(item)}</span>
                    </div>
                  ))}
                </div>

                {/* Interactive Workflow Execution Footer Button Row */}
                <div className="ko-card-action-bar">
                  <button className="ko-action-icon-btn" onClick={(e) => { e.stopPropagation(); handleViewOrderDetails(order.id); }} title="View Details">
                    <IconEye size={16} />
                  </button>

                  <button className="ko-action-icon-btn" onClick={(e) => { e.stopPropagation(); handleOpenReceipt(order.id); }} title="Open Receipt">
                    <IconPrinter size={16} />
                  </button>

                  {/* Payment link — only ever generated for pickup orders in a
                      non-INR currency (see canGeneratePaymentLink). Disabled
                      with an explanatory title otherwise. */}
                  <button
                    className="ko-action-icon-btn"
                    onClick={(e) => handleOpenPaymentLink(order, e)}
                    title={isPaid ? 'Already paid' : (paymentLinkDisabledReason || 'Generate payment link & QR')}
                    disabled={isPaid || !paymentLinkEligible}
                  >
                    <IconCreditCard size={16} />
                  </button>

                  {currentStatus === "ASSIGNED_TO_KITCHEN" && (
                    <button
                      className="ko-action-primary-btn bg-prep"
                      disabled={actionLoading === order.id}
                      onClick={(e) => handleStartPreparation(order.id, e)}
                    >
                      {actionLoading === order.id ? "Starting..." : "Start Preparation"}
                    </button>
                  )}

                  {currentStatus === "PREPARING" && (
                    <button
                      className="ko-action-primary-btn bg-complete"
                      disabled={actionLoading === order.id}
                      onClick={(e) => handleMarkReady(order.id, e)}
                    >
                      {actionLoading === order.id ? "Completing..." : "Mark Ready"}
                    </button>
                  )}

                  {/* Pickup-only: single "Mark Delivered" action that also captures payment */}
                  {/* {isPickup && isReadyForPickup && (
                    <div className="ko-payment-menu-wrap">
                      <button
                        className="ko-action-primary-btn bg-deliver"
                        disabled={actionLoading === order.id}
                        onClick={(e) => togglePaymentMenu(order.id, e)}
                      >
                        {actionLoading === order.id ? "Completing..." : "Mark Delivered"}
                      </button>

                      {paymentMenuOrderId === order.id && (
                        <div className="ko-payment-popover" onClick={(e) => e.stopPropagation()}>
                          <div className="ko-payment-popover-label">Payment received via</div>
                          <button
                            className="ko-payment-popover-option"
                            onClick={(e) => handleCompletePickup(order.id, 'COD', e)}
                          >
                            Cash (COD)
                          </button>
                          <button
                            className="ko-payment-popover-option"
                            onClick={(e) => handleCompletePickup(order.id, 'UPI', e)}
                          >
                            Online (UPI)
                          </button>
                        </div>
                      )}
                    </div>
                  )} */}


                  {isPickup && isReadyForPickup && (
  <>
    <div className="ko-payment-menu-wrap">
      <button
        className="ko-action-icon-btn"
        onClick={(e) => togglePaymentMenu(order.id, e)}
        title={isPaid ? 'Payment collected' : 'Collect payment'}
      >
        <IconCreditCard size={16} />
      </button>

      {paymentMenuOrderId === order.id && (
        <div className="ko-payment-popover" onClick={(e) => e.stopPropagation()}>
          <div className="ko-payment-popover-label">Payment received via</div>
          <button
            className="ko-payment-popover-option"
            onClick={(e) => handleSelectPaymentMethod(order.id, 'COD', e)}
          >
            Cash (COD)
          </button>
          <button
            className="ko-payment-popover-option"
            onClick={(e) => { setPaymentMenuOrderId(null); handleOpenPaymentLink(order, e); }}
          >
            Online (show QR)
          </button>
        </div>
      )}
    </div>

    <button
      className="ko-action-primary-btn bg-deliver"
      disabled={actionLoading === order.id}
      onClick={(e) => handleMarkDelivered(order.id, e)}
    >
      {actionLoading === order.id ? "Completing..." : "Mark Delivered"}
    </button>
  </>
)}

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Detailed Order Modal Overlay View Sheet ─── */}
      {modalOpen && (
        <div className="ko-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="ko-modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="ko-modal-header">
              <h3>Full Order Details — {selectedOrder ? (selectedOrder.order_number || selectedOrder.id) : ''}</h3>
              <button className="ko-modal-close-cross" onClick={() => setModalOpen(false)}>×</button>
            </div>

            <div className="ko-modal-body-area op-full-details-modal-body">
              {modalLoading || !selectedOrder ? (
                <div className="ko-modal-spinner-wrapper">
                  <div className="ko-spinner" />
                  <p>Pulling full order manifest details...</p>
                </div>
              ) : (
                <>
                  {/* Top badges + status */}
                  <div className="op-fd-top-row">
                    <div className={`ko-status-pill pill-${selectedOrder.status?.toLowerCase()}`}>{selectedOrder.status}</div>
                    {isCustomCakeOrder(selectedOrder) && (
                      <span className="op-origin-badge badge-custom-cake">
                        <IconCake size={11} /> Custom Cake Order
                      </span>
                    )}
                    <div className="op-origin-badges">
                      <div className="op-origin-item"><strong>Placed by</strong><div>{getDisplayName(selectedOrder)}</div></div>
                      <div className="op-origin-item"><strong>Role</strong><div>{getDisplayRole(selectedOrder)}</div></div>
                      <div className="op-origin-item"><strong>Phone</strong><div>{getDisplayPhone(selectedOrder)}</div></div>
                      <div className="op-origin-item"><strong>Email</strong><div>{getDisplayEmail(selectedOrder)}</div></div>
                      <div className="op-origin-item"><strong>Order source</strong><div>{getDisplayOrderSource(selectedOrder)}</div></div>
                    </div>
                  </div>

                  {selectedOrder.preparation_started_at && (
                    <div className="ko-modal-delivery-info">
                      <IconClock size={16} />
                      <span className="ko-delivery-label">Preparation started:</span>
                      <span className="ko-delivery-value">
                        {fmtDateTime(selectedOrder.preparation_started_at)}
                        {selectedOrder.preparation_started_by?.id === currentUserId ? ' · by you' : ''}
                      </span>
                    </div>
                  )}

                  {/* Fulfilment schedule — pickup orders show pickup date/time
                      only, delivery orders show delivery date/time + area only. */}
                  {(() => {
                    const modalFulfillment = getFulfillmentInfo(selectedOrder);
                    return (
                      <div className={`op-fd-section op-fd-fulfillment ${modalFulfillment.isPickup ? 'is-pickup' : 'is-delivery'}`}>
                        <h4>
                          {modalFulfillment.isPickup ? <IconBag size={14} /> : <IconCalendar size={14} />}
                          {modalFulfillment.isPickup ? 'Pickup Schedule' : 'Delivery Schedule'}
                        </h4>
                        <div className="op-fd-grid">
                          <div>
                            <span className="lbl">{modalFulfillment.isPickup ? 'Pickup date' : 'Expected date'}</span>
                            <span>{modalFulfillment.date || '—'}</span>
                          </div>
                          <div>
                            <span className="lbl">{modalFulfillment.isPickup ? 'Pickup time' : 'Time slot'}</span>
                            <span>{modalFulfillment.time || '—'}</span>
                          </div>
                          {!modalFulfillment.isPickup && (
                            <div>
                              <span className="lbl">Area</span>
                              <span>
                                {(selectedOrder.delivery_address?.area && typeof selectedOrder.delivery_address.area === 'object')
                                  ? (selectedOrder.delivery_address.area.name ?? selectedOrder.delivery_address.area.areaName ?? '—')
                                  : (selectedOrder.delivery_address?.area
                                      ?? selectedOrder.detailedAddress?.areaName
                                      ?? (selectedOrder.area && typeof selectedOrder.area === 'object' ? (selectedOrder.area.name ?? selectedOrder.area.areaName) : selectedOrder.area)
                                      ?? '—')}
                              </span>
                            </div>
                          )}
                          <div><span className="lbl">Fulfilment</span><span>{selectedOrder.delivery_method || '—'}</span></div>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="op-fd-section">
                    <h4>Customer &amp; Address</h4>
                    <div className="op-fd-grid">
                      <div><span className="lbl">Name</span><span>{getDisplayName(selectedOrder)}</span></div>
                      <div><span className="lbl">Phone</span><span>{getDisplayPhone(selectedOrder)}</span></div>
                      <div><span className="lbl">Email</span><span>{getDisplayEmail(selectedOrder)}</span></div>
                    </div>
                    {/* <div className="op-fd-address-block">
                      <p><strong>Address:</strong> {formatAddressString(selectedOrder.delivery_address)}</p>
                      {selectedOrder.delivery_address && (
                        <ul className="op-fd-address-list">
                          {selectedOrder.delivery_address.building && <li><strong>Building:</strong> {selectedOrder.delivery_address.building}</li>}
                          {selectedOrder.delivery_address.block && <li><strong>Block:</strong> {selectedOrder.delivery_address.block}</li>}
                          {selectedOrder.delivery_address.avenue && <li><strong>Avenue:</strong> {selectedOrder.delivery_address.avenue}</li>}
                          {selectedOrder.delivery_address.street && <li><strong>Street:</strong> {selectedOrder.delivery_address.street}</li>}
                          {selectedOrder.delivery_address.floor && <li><strong>Floor/Apt:</strong> {selectedOrder.delivery_address.floor} {selectedOrder.delivery_address.apartment}</li>}
                          {selectedOrder.delivery_address.landmark && <li><strong>Landmark:</strong> {selectedOrder.delivery_address.landmark}</li>}
                          {selectedOrder.delivery_address.addressNotes && <li><strong>Address notes:</strong> {selectedOrder.delivery_address.addressNotes}</li>}
                        </ul>
                      )}
                    </div> */}

                    <div className="op-fd-address-block">
  <div className="op-fd-grid">
    {getAddressFields(selectedOrder.delivery_address).map((f) => (
      <div key={f.label}>
        <span className="lbl">{f.label}</span>
        <span>{f.value || '-'}</span>
      </div>
    ))}
  </div>
</div>

                  </div>

                  <div className="ko-modal-section-box">
                    <h5 className="ko-section-title">Line Kitchen Production Items</h5>

                    <div className="ko-modal-items-table">
                      {selectedOrder.items?.map((item: any) => {
                        const flavour = getFlavour(item);
                        const variant = getVariant(item);
                        const shape = getShape(item);
                        const addOns = getAddOns(item);
                        const itemNotes = getItemNotes(item);
                        const lineTotal = item.line_total ?? (item.price * item.quantity);
                        const displayName = getItemDisplayName(item);
                        const displayImage = getItemDisplayImage(item);
                        const displayDescription = getItemDisplayDescription(item);

                        return (
                          <div key={item.id} className="ko-modal-item-row-detailed">
                            {/* Left: Product Image Box */}
                            <div className="ko-modal-item-image-wrap">
                              {displayImage ? (
                                <img
                                  className="ko-modal-item-image"
                                  src={displayImage}
                                  alt={displayName}
                                />
                              ) : (
                                <div className="ko-modal-item-image-fallback">
                                  <IconImageFallback size={20} />
                                </div>
                              )}
                            </div>

                            {/* Right: Detailed Content Area */}
                            <div className="ko-modal-item-body">

                              {/* Header Row: Qty Badge & Title */}
                              <div className="ko-modal-item-header">
                                <span className="ko-modal-qty-bubble">
                                  {item.quantity}x
                                </span>
                                <p className="item-main-title">{displayName}</p>
                              </div>

                              {/* Description */}
                              {displayDescription && (
                                <p className="item-sub-desc">{displayDescription}</p>
                              )}

                              {/* Specifications (Flavour, Variant, Shape) */}
                              {(flavour || variant || shape) && (
                                <div className="ko-item-meta-chips">
                                  {flavour && (
                                    <span className="ko-item-meta-chip chip-flavour">
                                      Flavour: <strong>{flavour}</strong>
                                    </span>
                                  )}
                                  {variant && (
                                    <span className="ko-item-meta-chip chip-variant">
                                      Variant: <strong>{variant}</strong>
                                    </span>
                                  )}
                                  {shape && (
                                    <span className="ko-item-meta-chip chip-shape">
                                      Shape: <strong>{shape}</strong>
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Add-ons */}
                              {addOns.length > 0 && (
                                <div className="ko-modal-item-addons">
                                  <span className="ko-addons-label">Add-ons</span>
                                  <div className="ko-item-meta-chips-small">
                                    {addOns.map((addOn, i) => (
                                      <span key={i} className="ko-item-meta-chip chip-addon">{addOn}</span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Special Instructions Note */}
                              {itemNotes && (
                                <div className="ko-item-custom-note-box">
                                  <span className="note-label">Instruction:</span>
                                  <p className="item-custom-note-text">"{itemNotes}"</p>
                                </div>
                              )}

                              {/* Price Calculations */}
                              <div className="ko-modal-item-price-row">
                                <span className="ko-item-unit-price">
                                  {fmtMoney(item.price, selectedOrder?.currency)} × {item.quantity}
                                </span>
                                <span className="ko-item-line-total">
                                  {fmtMoney(lineTotal, selectedOrder?.currency)}
                                </span>
                              </div>

                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {getKitchenOrderAddons(selectedOrder).length > 0 && (
                    <div className="op-fd-order-addons">
                      <h4>Order Add-ons</h4>
                      <div className="op-fd-addons-list">
                        {getKitchenOrderAddons(selectedOrder).map((addon: any, idx: number) => (
                          <div key={`${addon.addon_id ?? addon.addonId}-${idx}`} className="op-fd-addon-row">
                            <div className="op-fd-addon-thumb-wrapper">
                              <div className="op-fd-addon-thumb-placeholder" />
                              <div className="op-fd-addon-content">
                                <strong>{addon.addon_name || addon.addonName || addon.name || `Addon #${addon.addon_id ?? addon.addonId ?? idx + 1}`}{addon.quantity ? ` (${addon.quantity} pcs)` : ''}</strong>
                                <div className="op-fd-addon-meta">{fmtMoney(addon.price, selectedOrder.currency)} each</div>
                              </div>
                            </div>
                            <div className="op-fd-addon-price-block">
                              <span>{fmtMoney(addon.total ?? (addon.price * addon.quantity), selectedOrder.currency)}</span>
                              <div className="op-fd-addon-note">Rate included in totals</div>
                            </div>
                          </div>
                        ))}
                        <div className="op-fd-addon-total">
                          <strong>Total Add-ons:</strong>
                          <span>{fmtMoney(getKitchenOrderAddonTotal(selectedOrder), selectedOrder.currency)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Custom Cake Details — previously computed but never rendered ── */}
                  {(() => {
                    const customCake = getCustomCakeDetails(selectedOrder);
                    if (!customCake) return null;
                    return (
                      <div className="op-fd-section op-fd-highlight-cake">
                        <h4><IconCake size={14} /> Custom Cake Details</h4>
                        <div className="op-fd-cake-body">
                          {customCake.image && (
                            <img src={customCake.image} alt="Custom cake reference" className="op-fd-cake-image" />
                          )}
                          <div className="op-fd-grid">
                            <div><span className="lbl">Flavour</span><span>{customCake.flavour ?? '—'}</span></div>
                            <div><span className="lbl">Weight</span><span>{customCake.weight ?? '—'}</span></div>
                            <div><span className="lbl">Shape</span><span>{customCake.shape ?? '—'}</span></div>
                            <div><span className="lbl">Size</span><span>{customCake.size ?? '—'}</span></div>
                            <div><span className="lbl">Colour</span><span>{customCake.colour ?? '—'}</span></div>
                            <div><span className="lbl">Est. price</span><span>{customCake.price != null ? fmtMoney(customCake.price, selectedOrder.currency) : '—'}</span></div>
                          </div>
                          {customCake.message && (
                            <p className="op-fd-cake-message"><strong>Cake message:</strong> "{customCake.message}"</p>
                          )}
                          {customCake.notes && (
                            <p className="op-fd-cake-message"><strong>Customization notes:</strong> {customCake.notes}</p>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {(selectedOrder.greeting_message || selectedOrder.greeting_from || selectedOrder.greeting_to) && (
                    <div className="op-fd-section op-fd-highlight-greeting">
                      <h4>Greeting Card</h4>
                      <div className="op-fd-grid">
                        <div><span className="lbl">To</span><span>{selectedOrder.greeting_to || '—'}</span></div>
                        <div><span className="lbl">From</span><span>{selectedOrder.greeting_from || '—'}</span></div>
                      </div>
                      {selectedOrder.greeting_message && (
                        <p className="op-fd-greeting-message">"{selectedOrder.greeting_message}"</p>
                      )}
                    </div>
                  )}

                  <div className="op-fd-section">
                    <h4>Pricing Summary</h4>
                    {(() => {
                      const itemSubtotal = Number(selectedOrder.subtotal ?? selectedOrder.sub_total ?? (selectedOrder.items?.reduce((sum: number, item: any) => sum + Number(item.line_total ?? (item.price * item.quantity || 0)), 0) || 0));
                      const addonsTotal = getKitchenOrderAddonTotal(selectedOrder);
                      const discount = Number(selectedOrder.discount || 0);
                      const deliveryCharge = Number(selectedOrder.delivery_charge ?? selectedOrder.deliveryCharge ?? 0);
                      const grandTotal = Number(selectedOrder.total ?? selectedOrder.grand_total ?? (itemSubtotal + addonsTotal - discount + deliveryCharge));

                      return (
                        <div className="drawer-cost-breakdown">
                          <div className="cost-row"><span>Subtotal:</span><span>{fmtMoney(itemSubtotal, selectedOrder.currency)}</span></div>
                          {addonsTotal > 0 && <div className="cost-row"><span>Add-ons:</span><span>{fmtMoney(addonsTotal, selectedOrder.currency)}</span></div>}
                          {discount > 0 && <div className="cost-row discount"><span>Discount:</span><span>-{fmtMoney(discount, selectedOrder.currency)}</span></div>}
                          <div className="cost-row"><span>Delivery:</span><span>{fmtMoney(deliveryCharge, selectedOrder.currency)}</span></div>
                          <div className="cost-row total"><span>Grand Total:</span><span>{fmtMoney(grandTotal, selectedOrder.currency)}</span></div>
                        </div>
                      );
                    })()}
                  </div>

                  {selectedOrder.delivery_notes && (
                    <div className="ko-modal-section-box notes-box">
                      <h5>Special Kitchen Notes / Instructions</h5>
                      <p className="notes-text-render">"{selectedOrder.delivery_notes}"</p>
                    </div>
                  )}

                  <div className="op-fd-actions-row">
                    <button className="sage-btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); handleOpenReceipt(selectedOrder.id); }}>
                      <IconPrinter size={13} /> Print Receipt
                    </button>
                    <button
                      className="sage-btn btn-secondary btn-sm"
                      onClick={(e) => handleOpenPaymentLink(selectedOrder, e)}
                      disabled={(selectedOrder.payment_status || '').toUpperCase() === 'PAID' || !canGeneratePaymentLink(selectedOrder)}
                      title={
                        (selectedOrder.payment_status || '').toUpperCase() === 'PAID'
                          ? 'Already paid'
                          : (getPaymentLinkDisabledReason(selectedOrder) || 'Generate payment link & QR')
                      }
                    >
                      <IconCreditCard size={13} /> Payment
                    </button>
                    <button className="sage-btn btn-ghost btn-sm" onClick={() => { setModalOpen(false); }}>
                      Open Workflow Panel
                    </button>
                  </div>

                  <div className="ko-modal-action-footer">
                    <button className="ko-modal-cancel-btn" onClick={() => setModalOpen(false)}>Close Window</button>
                    {selectedOrder.status === "ASSIGNED_TO_KITCHEN" && (
                      <button
                        className="ko-action-primary-btn bg-prep"
                        disabled={actionLoading === selectedOrder.id}
                        onClick={(e) => handleStartPreparation(selectedOrder.id, e)}
                      >
                        {actionLoading === selectedOrder.id ? "Starting..." : "Start Preparation"}
                      </button>
                    )}
                    {selectedOrder.status === "PREPARING" && (
                      <button
                        className="ko-action-primary-btn bg-complete"
                        disabled={actionLoading === selectedOrder.id}
                        onClick={(e) => handleMarkReady(selectedOrder.id, e)}
                      >
                        {actionLoading === selectedOrder.id ? "Completing..." : "Mark Ready"}
                      </button>
                    )}

                    {/* {(selectedOrder.delivery_method || '').toUpperCase() === 'PICKUP' &&
                      selectedOrder.status === "PICKUP_READY" && (
                      <div className="ko-payment-menu-wrap">
                        <button
                          className="ko-action-primary-btn bg-deliver"
                          disabled={actionLoading === selectedOrder.id}
                          onClick={(e) => togglePaymentMenu(selectedOrder.id, e)}
                        >
                          {actionLoading === selectedOrder.id ? "Completing..." : "Mark Delivered"}
                        </button>

                        {paymentMenuOrderId === selectedOrder.id && (
                          <div className="ko-payment-popover" onClick={(e) => e.stopPropagation()}>
                            <div className="ko-payment-popover-label">Payment received via</div>
                            <button
                              className="ko-payment-popover-option"
                              onClick={(e) => handleCompletePickup(selectedOrder.id, 'COD', e)}
                            >
                              Cash (COD)
                            </button>
                            <button
                              className="ko-payment-popover-option"
                              onClick={(e) => handleCompletePickup(selectedOrder.id, 'UPI', e)}
                            >
                              Online (UPI)
                            </button>
                          </div>
                        )}
                      </div>
                    )} */}

                    {(selectedOrder.delivery_method || '').toUpperCase() === 'PICKUP' &&
  selectedOrder.status === "PICKUP_READY" && (
  <>
    <div className="ko-payment-menu-wrap">
      <button
        className="sage-btn btn-secondary btn-sm"
        onClick={(e) => togglePaymentMenu(selectedOrder.id, e)}
      >
        <IconCreditCard size={13} />
        {(selectedOrder.payment_status || '').toUpperCase() === 'PAID' ? 'Payment collected' : 'Collect payment'}
      </button>

      {paymentMenuOrderId === selectedOrder.id && (
        <div className="ko-payment-popover" onClick={(e) => e.stopPropagation()}>
          <div className="ko-payment-popover-label">Payment received via</div>
          <button
            className="ko-payment-popover-option"
            onClick={(e) => handleSelectPaymentMethod(selectedOrder.id, 'COD', e)}
          >
            Cash (COD)
          </button>
          <button
            className="ko-payment-popover-option"
            onClick={(e) => { setPaymentMenuOrderId(null); handleOpenPaymentLink(selectedOrder, e); }}
          >
            Online (show QR)
          </button>
        </div>
      )}
    </div>

    <button
      className="ko-action-primary-btn bg-deliver"
      disabled={actionLoading === selectedOrder.id}
      onClick={(e) => handleMarkDelivered(selectedOrder.id, e)}
    >
      {actionLoading === selectedOrder.id ? "Completing..." : "Mark Delivered"}
    </button>
  </>
)}

                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Receipt modal (opens when clicking receipt icon on an order card) */}
      {isReceiptOpen && (
        <div className="ko-modal-backdrop" onClick={() => setIsReceiptOpen(false)}>
          <div className="ko-modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="ko-modal-header">
              <h3>Print Receipt</h3>
              <button className="ko-modal-close-cross" onClick={() => setIsReceiptOpen(false)}>×</button>
            </div>

            <div className="print-thermal-receipt-sheet">
              {receiptLoading || !selectedOrder ? (
                <div className="ko-modal-spinner-wrapper">
                  <div className="ko-spinner" />
                  <p>Loading receipt…</p>
                </div>
              ) : (
                <>
                  <div className="receipt-crown-title">
                    <h2>ORDER RECEIPT</h2>
                    <p className="divider">- - - - - - - - - - - - - - - - - - -</p>
                  </div>

                  <div className="receipt-basics">
                    <p><strong>Order No:</strong> {selectedOrder.order_number ?? selectedOrder.id}</p>
                    <p><strong>Date:</strong> {fmtDate(selectedOrder.created_at)}</p>
                    <p><strong>Time:</strong> {new Date(selectedOrder.created_at).toLocaleTimeString()}</p>
                    <p><strong>Customer:</strong> {selectedOrder.customer?.first_name} {selectedOrder.customer?.last_name}</p>
                    <p><strong>Phone:</strong> {selectedOrder.customer?.phone_no || selectedOrder.customerPhone}</p>
                    <p><strong>Payment:</strong> {selectedOrder.payment_method || selectedOrder.paymentMethod}</p>
                    <p className="divider">- - - - - - - - - - - - - - - - - - -</p>
                  </div>

                  <div className="receipt-items-table">
                    {selectedOrder.items.map((item: any) => (
                      <div key={`r-${item.id}`} className="receipt-item-row">
                        <div className="receipt-item-main">
                          <span className="receipt-item-name">{item.quantity} x {getItemDisplayName(item) || item.productName}</span>
                          <span className="receipt-item-price">{fmtMoney(item.line_total ?? (item.price * item.quantity), selectedOrder.currency)}</span>
                        </div>
                        {getAddOns(item).length > 0 && (
                          <div className="receipt-item-addons">Add-ons: {getAddOns(item).join(', ')}</div>
                        )}
                      </div>
                    ))}

                    {selectedOrder.order_addons?.length > 0 && (
                      <>
                        <div className="receipt-divider">-----------------------------------------</div>
                        {selectedOrder.order_addons.map((addon: any, idx: number) => (
                          <div key={`ra-${idx}`} className="receipt-item-row receipt-addon-row">
                            <div className="receipt-item-main">
                              <span className="receipt-item-name">{addon.quantity} × {addon.addon_name || addon.addonName || `Addon #${addon.addon_id ?? addon.addonId}`}</span>
                              <span className="receipt-item-price">{fmtMoney(addon.total ?? (addon.price * addon.quantity), selectedOrder.currency)}</span>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>

                  <div className="receipt-divider">-----------------------------------------</div>

                  {/* totals */}
                  {(() => {
                    const itemSubtotal = Number(selectedOrder.subtotal ?? (selectedOrder.items?.reduce((s: number, it: any) => s + Number(it.line_total ?? (it.price * it.quantity || 0)), 0) || 0));
                    const addonsTotal = Number(selectedOrder.order_addons_total ?? (selectedOrder.order_addons?.reduce((s: number, a: any) => s + Number(a.total ?? (a.price * a.quantity || 0)), 0) || 0));
                    const discount = Number(selectedOrder.discount || 0);
                    const deliveryCharge = Number(selectedOrder.delivery_charge ?? selectedOrder.deliveryCharge ?? 0);
                    const computedGrandTotal = Number(selectedOrder.total ?? (itemSubtotal + addonsTotal - discount + deliveryCharge));

                    return (
                      <div className="receipt-totals">
                        <div className="receipt-total-row"><span>Subtotal:</span><span>{fmtMoney(itemSubtotal, selectedOrder.currency)}</span></div>
                        {addonsTotal > 0 && <div className="receipt-total-row"><span>Add-ons:</span><span>{fmtMoney(addonsTotal, selectedOrder.currency)}</span></div>}
                        {discount > 0 && <div className="receipt-total-row"><span>Discount:</span><span>-{fmtMoney(discount, selectedOrder.currency)}</span></div>}
                        <div className="receipt-total-row"><span>Delivery:</span><span>{fmtMoney(deliveryCharge, selectedOrder.currency)}</span></div>
                        <div className="receipt-divider">-----------------------------------------</div>
                        <div className="receipt-total-row grand-total"><span>GRAND TOTAL:</span><span>{fmtMoney(computedGrandTotal, selectedOrder.currency)}</span></div>
                      </div>
                    );
                  })()}

                  <div className="receipt-divider">-----------------------------------------</div>

                  <div className="receipt-center receipt-footer-msg">
                    <p>Thank you for dining with CakeNTake!</p>
                    <p>Baked fresh daily, prepared artisanally.</p>
                    <p className="receipt-url">www.cakentake.com</p>
                  </div>

                  <div className="receipt-modal-controls no-print footer-gap">
                    <button className="sage-btn btn-secondary btn-sm" onClick={() => window.print()}>
                      <IconPrinter size={13} /><span>Print</span>
                    </button>
                    <button className="sage-btn btn-primary btn-sm" onClick={() => setIsReceiptOpen(false)}>Close</button>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ─── Payment Link / QR Modal ─── */}
      {paymentLinkOrderId && (
        <div className="ko-modal-backdrop" onClick={closePaymentLinkModal}>
          <div className="ko-modal-content-card ko-payment-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ko-modal-header">
              <h3>
                Payment — {paymentLinkOrderMeta?.order_number || paymentLinkOrderMeta?.id || paymentLinkOrderId}
              </h3>
              <button className="ko-modal-close-cross" onClick={closePaymentLinkModal}>×</button>
            </div>

            <div className="ko-modal-body-area ko-payment-modal-body">
              {paymentLinkOrderMeta && (
                <div className="ko-payment-summary">
                  <p><strong>Customer:</strong> {getDisplayName(paymentLinkOrderMeta)}</p>
                  <p>
                    <strong>Amount:</strong>{' '}
                    {fmtMoney(
                      paymentLinkOrderMeta.total ?? paymentLinkOrderMeta.grand_total,
                      paymentLinkOrderMeta.currency
                    )}
                  </p>
                </div>
              )}

              {paymentLinkLoading && (
                <div className="ko-modal-spinner-wrapper">
                  <div className="ko-spinner" />
                  <p>Generating payment link…</p>
                </div>
              )}

              {!paymentLinkLoading && paymentLinkError && (
                <div className="ko-action-error-banner ko-payment-error-banner">
                  <span>{paymentLinkError}</span>
                  {/* Only offer a retry when the order is actually eligible —
                      retrying a non-pickup or INR order would just repeat
                      the same "not supported" error. */}
                  {canGeneratePaymentLink(paymentLinkOrderMeta) && (
                    <button onClick={() => handleOpenPaymentLink(paymentLinkOrderMeta)}>Retry</button>
                  )}
                </div>
              )}

              {!paymentLinkLoading && paymentLink && (
                <div className="ko-payment-content">
                  <div className="ko-payment-qr">
                    <QRCodeSVG value={paymentLink} size={200} />
                  </div>

                  <div className="ko-payment-link-row">
                    <input
                      type="text"
                      className="ko-payment-link-input"
                      value={paymentLink}
                      readOnly
                      onFocus={(e) => e.target.select()}
                    />
                    <button className="ko-action-icon-btn" title="Copy link" onClick={handleCopyPaymentLink}>
                      {paymentLinkCopied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                    </button>
                  </div>

                  <div className="ko-payment-actions">
                    <a
                      href={paymentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sage-btn btn-primary btn-sm"
                    >
                      <IconExternalLink size={13} /> Open Payment Page
                    </a>
                    <button className="sage-btn btn-secondary btn-sm" onClick={handleCopyPaymentLink}>
                      {paymentLinkCopied ? <IconCheck size={13} /> : <IconCopy size={13} />}
                      <span>{paymentLinkCopied ? 'Copied' : 'Copy Link'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Calendar View Modal ─── */}
      {isCalendarOpen && (
        <div className="ko-modal-backdrop" onClick={() => setIsCalendarOpen(false)}>
          <div className="ko-calendar-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ko-modal-header ko-calendar-modal-header">
              <h3><IconCalendar size={17} /> Order Calendar</h3>
              <button className="ko-modal-close-cross" onClick={() => setIsCalendarOpen(false)}>×</button>
            </div>

            <div className="ko-calendar-modal-body">
              {/* Month navigation */}
              <div className="ko-calendar-nav-row">
                <button className="ko-calendar-nav-btn" onClick={goToPrevMonth} title="Previous month">
                  <IconChevronLeft size={18} />
                </button>
                <div className="ko-calendar-month-label">
                  {calendarMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </div>
                <button className="ko-calendar-nav-btn" onClick={goToNextMonth} title="Next month">
                  <IconChevronRight size={18} />
                </button>
                <button className="ko-calendar-today-btn" onClick={goToCurrentMonth}>
                  Today
                </button>
              </div>

              {/* Legend */}
              <div className="ko-calendar-legend-row">
                {CALENDAR_STATUS_LEGEND.map(item => (
                  <span key={item.key} className="ko-calendar-legend-item">
                    <span className={`ko-cal-dot ko-cal-dot-${item.key}`} />
                    {item.label}
                  </span>
                ))}
              </div>

              {/* Weekday header */}
              <div className="ko-calendar-weekday-row">
                {WEEKDAY_LABELS.map(w => (
                  <div key={w} className="ko-calendar-weekday-cell">{w}</div>
                ))}
              </div>

              {/* Month grid */}
              <div className="ko-calendar-grid">
                {buildMonthGrid(calendarMonth).map((cellDate, idx) => {
                  if (!cellDate) {
                    return <div key={`empty-${idx}`} className="ko-calendar-day-cell ko-calendar-day-empty" />;
                  }

                  const key = dateKey(cellDate);
                  const entries = calendarOrdersByDay[key] || [];
                  const today = new Date();
                  const isToday = isSameDay(cellDate, today);
                  const isSelected = calendarSelectedDate ? isSameDay(cellDate, calendarSelectedDate) : false;

                  // Unique status colors present on this date (max 4 dots shown)
                  const statusKeys = Array.from(new Set(entries.map(e => getStatusColorKey(e.order.status))));

                  return (
                    <button
                      key={key}
                      className={`ko-calendar-day-cell ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''} ${entries.length ? 'has-orders' : ''}`}
                      onClick={() => setCalendarSelectedDate(cellDate)}
                    >
                      <span className="ko-calendar-day-number">{cellDate.getDate()}</span>
                      {entries.length > 0 && (
                        <span className="ko-calendar-day-dots">
                          {statusKeys.slice(0, 4).map(sk => (
                            <span key={sk} className={`ko-cal-dot ko-cal-dot-${sk}`} />
                          ))}
                          {entries.length > 4 && <span className="ko-calendar-day-more">+{entries.length - 4}</span>}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Selected date detail panel */}
              <div className="ko-calendar-detail-panel">
                {!calendarSelectedDate ? (
                  <p className="ko-calendar-detail-empty">Select a date on the calendar to see its orders.</p>
                ) : calendarSelectedDayEntries.length === 0 ? (
                  <>
                    <h5 className="ko-calendar-detail-heading">
                      {calendarSelectedDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </h5>
                    <p className="ko-calendar-detail-empty">No orders scheduled on this date.</p>
                  </>
                ) : (
                  <>
                    <h5 className="ko-calendar-detail-heading">
                      {calendarSelectedDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      {' '}· {calendarSelectedDayEntries.length} order{calendarSelectedDayEntries.length > 1 ? 's' : ''}
                    </h5>
                    <div className="ko-calendar-detail-list">
                      {calendarSelectedDayEntries.map(({ order, info }) => {
                        const sk = getStatusColorKey(order.status);
                        return (
                          <button
                            key={order.id}
                            className="ko-calendar-detail-row"
                            onClick={() => {
                              setIsCalendarOpen(false);
                              handleViewOrderDetails(order.id);
                            }}
                          >
                            <span className={`ko-cal-dot ko-cal-dot-${sk}`} />
                            <span className="ko-calendar-detail-order-num">
                              #{order.order_number || String(order.id).padStart(5, '0')}
                            </span>
                            <span className="ko-calendar-detail-tag">
                              {info.dateLabel}{info.timeLabel ? ` · ${info.timeLabel}` : ''}
                            </span>
                            <span className={`ko-status-pill pill-${(order.status || '').toLowerCase()} ko-calendar-detail-status`}>
                              {(order.status || '').replace(/_/g, ' ')}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default KitchenOrder;