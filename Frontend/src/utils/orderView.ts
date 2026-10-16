/* ==========================================================================
   orderView — one normalized shape for every order screen and receipt.

   The backend now sends `ordered_products` (menu items + agent-exclusive items
   + custom cakes, each with size / flavour / writing / image), `area_name`,
   `delivery_address_text`, `address_delivery_notes`, `order_notes`,
   `cake_message` and `scheduled_date`. This helper reads those fields and
   falls back to the raw `items` / `custom_cakes` for older responses, so the
   Admin, Shop Manager, Sales Staff, Kitchen, Driver and Agent screens all
   show the same product details.
   ========================================================================== */

export type OrderLineType = 'MENU' | 'CUSTOM_CAKE' | 'AGENT_EXCLUSIVE';

export interface OrderLine {
  key: string;
  type: OrderLineType;
  name: string;
  image?: string;
  size?: string;
  flavour?: string;
  shape?: string;
  cakeMessage?: string;
  instruction?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderAddonLine {
  name: string;
  quantity: number;
  total: number;
  image?: string;
}

export interface OrderView {
  id: string;
  number: string;
  status: string;
  currency: string;
  lines: OrderLine[];
  addons: OrderAddonLine[];
  isPickup: boolean;
  scheduledDate?: string;
  scheduledSlot?: string;
  createdAt?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  areaName?: string;
  addressText?: string;
  addressNotes?: string;
  orderNotes?: string;
  cakeMessage?: string;
  greetingTo?: string;
  greetingFrom?: string;
  greetingMessage?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  addonsTotal: number;
  total: number;
  deliveryPhoto?: string;
  driverNotes?: string;
  createdByName?: string;
  createdByRole?: string;
  source?: string;
}

const EMPTY = new Set(['', '-', '—', '--', 'null', 'none', 'undefined', 'n/a']);

export const clean = (value: unknown): string => {
  if (value === null || value === undefined || typeof value === 'object') return '';
  const text = String(value).trim();
  return EMPTY.has(text.toLowerCase()) ? '' : text;
};

const pick = (source: any, keys: string[]): string => {
  if (!source || typeof source !== 'object') return '';
  for (const key of keys) {
    const text = clean(source[key]);
    if (text) return text;
  }
  return '';
};

const num = (value: unknown, fallback = 0): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const SIZE_KEYS = ['variant_name', 'variantName', 'selected_variant', 'selectedVariant', 'variant', 'size', 'cake_size'];
const FLAVOUR_KEYS = ['flavor_name', 'flavour_name', 'selected_flavour', 'selected_flavor', 'flavour', 'flavor'];
const MESSAGE_KEYS = ['gift_message', 'giftMessage', 'cake_message', 'cakeMessage', 'message_on_cake', 'writing', 'message'];
const INSTRUCTION_KEYS = ['special_instruction', 'special_instructions', 'specialInstruction', 'instructions', 'notes'];

function linesFromRaw(raw: any): OrderLine[] {
  const lines: OrderLine[] = [];
  const items: any[] = Array.isArray(raw?.items) ? raw.items : Array.isArray(raw?.order_items) ? raw.order_items : [];
  items.forEach((it, idx) => {
    if (it?.is_custom_cake) return;
    const cj = it?.custom_json && typeof it.custom_json === 'object' ? it.custom_json : {};
    const product = it?.product ?? {};
    const agentProduct = it?.agent_product ?? {};
    const isAgent = !!it?.agent_product_id || String(cj?.product_type ?? '').toUpperCase() === 'AGENT';
    const qty = num(it?.quantity, 1) || 1;
    const unit = num(it?.price ?? product?.price ?? agentProduct?.price);
    lines.push({
      key: `item-${it?.id ?? idx}`,
      type: isAgent ? 'AGENT_EXCLUSIVE' : 'MENU',
      name: clean(it?.product_name) || clean(product?.name) || clean(agentProduct?.name) || clean(it?.name) || 'Item',
      image: clean(it?.product_image) || clean(product?.image_url) || clean(agentProduct?.image) || undefined,
      size: clean(it?.size) || pick(cj, SIZE_KEYS) || undefined,
      flavour: clean(it?.flavour) || pick(cj, FLAVOUR_KEYS) || undefined,
      shape: pick(cj, ['shape']) || undefined,
      cakeMessage: clean(it?.cake_message) || pick(cj, MESSAGE_KEYS) || undefined,
      instruction: clean(it?.special_instruction) || pick(cj, INSTRUCTION_KEYS) || undefined,
      quantity: qty,
      unitPrice: unit,
      lineTotal: it?.line_total != null ? num(it.line_total) : unit * qty,
    });
  });

  let cakes: any = raw?.custom_cakes ?? raw?.custom_cake_json ?? raw?.custom_cake ?? [];
  if (typeof cakes === 'string') {
    try { cakes = JSON.parse(cakes); } catch { cakes = []; }
  }
  if (cakes && !Array.isArray(cakes) && typeof cakes === 'object') cakes = [cakes];
  (Array.isArray(cakes) ? cakes : []).forEach((cake: any, idx: number) => {
    if (!cake || typeof cake !== 'object') return;
    const qty = num(cake?.quantity, 1) || 1;
    const price = num(cake?.price);
    lines.push({
      key: `custom-${idx}`,
      type: 'CUSTOM_CAKE',
      name: pick(cake, ['product_name', 'productName', 'name']) || 'Custom cake',
      image: pick(cake, ['image', 'image_url', 'imageUrl', 'reference_image']) || undefined,
      size: pick(cake, SIZE_KEYS) || undefined,
      flavour: pick(cake, FLAVOUR_KEYS) || undefined,
      shape: pick(cake, ['shape', 'cake_shape']) || undefined,
      cakeMessage: pick(cake, MESSAGE_KEYS) || undefined,
      instruction: pick(cake, INSTRUCTION_KEYS) || undefined,
      quantity: qty,
      unitPrice: price,
      lineTotal: price * qty,
    });
  });
  return lines;
}

function linesFromPresenter(list: any[]): OrderLine[] {
  return list.map((p: any, idx: number) => ({
    key: String(p?.key ?? idx),
    type: (String(p?.type ?? 'MENU').toUpperCase() as OrderLineType),
    name: clean(p?.name) || 'Item',
    image: clean(p?.image) || undefined,
    size: clean(p?.size) || undefined,
    flavour: clean(p?.flavour) || undefined,
    shape: clean(p?.shape) || undefined,
    cakeMessage: clean(p?.cake_message) || undefined,
    instruction: clean(p?.special_instruction) || undefined,
    quantity: num(p?.quantity, 1) || 1,
    unitPrice: num(p?.unit_price),
    lineTotal: num(p?.line_total),
  }));
}

function buildAddressText(raw: any, areaName: string): string {
  const fromApi = clean(raw?.delivery_address_text);
  if (fromApi) return fromApi;
  const a = raw?.delivery_address ?? raw?.address ?? {};
  const snap = raw?.delivery_address_json ?? {};
  const get = (k: string) => clean(snap?.[k]) || clean(a?.[k]);
  const parts = [
    areaName,
    get('block') && `Block ${get('block')}`,
    get('street') && `Street ${get('street')}`,
    get('avenue') && `Avenue ${get('avenue')}`,
    get('building') && `Building ${get('building')}`,
    get('house_no') && `House ${get('house_no')}`,
    get('floor') && `Floor ${get('floor')}`,
    get('apartment') && `Apt ${get('apartment')}`,
    get('address_line1'),
    get('address_line2'),
    get('landmark'),
    get('city'),
  ].filter(Boolean) as string[];
  return Array.from(new Set(parts)).join(', ');
}

export function toOrderView(raw: any): OrderView {
  const presenter = Array.isArray(raw?.ordered_products) ? raw.ordered_products : null;
  const lines = presenter && presenter.length ? linesFromPresenter(presenter) : linesFromRaw(raw);

  const method = String(raw?.delivery_method ?? raw?.deliveryMethod ?? '').toUpperCase();
  const isPickup = method === 'PICKUP';
  const customer = raw?.customer ?? raw?.user ?? {};
  const customerName =
    clean(raw?.customer_name) ||
    `${clean(customer?.first_name)} ${clean(customer?.last_name)}`.trim() ||
    clean(customer?.name) ||
    'Customer';

  const snapshot = raw?.delivery_address_json ?? {};
  const areaName =
    clean(raw?.area_name) ||
    clean(raw?.delivery_area?.name) ||
    clean(raw?.delivery_address?.area?.name) ||
    clean(snapshot?.area);

  const addons: OrderAddonLine[] = (Array.isArray(raw?.order_addons) ? raw.order_addons : []).map((a: any) => ({
    name: clean(a?.addon_name) || clean(a?.name) || 'Add-on',
    quantity: num(a?.quantity, 1) || 1,
    total: num(a?.total, num(a?.price) * (num(a?.quantity, 1) || 1)),
    image: clean(a?.addon_image) || clean(a?.image_url) || undefined,
  }));

  const createdBy = raw?.created_by && typeof raw.created_by === 'object' ? raw.created_by : {};
  const subtotal = num(raw?.subtotal, lines.reduce((s, l) => s + l.lineTotal, 0));
  const discount = num(raw?.discount);
  const deliveryCharge = num(raw?.delivery_charge);
  const addonsTotal = num(raw?.order_addons_total);
  const total = num(raw?.grand_total ?? raw?.total, subtotal + deliveryCharge + addonsTotal - discount);

  const scheduledDate =
    clean(raw?.scheduled_date) ||
    (isPickup ? clean(raw?.pickup_date) || clean(raw?.delivery_date) : clean(raw?.delivery_date) || clean(raw?.pickup_date)) ||
    undefined;
  const scheduledSlot =
    clean(raw?.scheduled_time_slot) ||
    (isPickup
      ? clean(raw?.pickup_time_slot) || clean(raw?.delivery_time_slot)
      : clean(raw?.delivery_time_slot) || clean(raw?.pickup_time_slot)) ||
    undefined;

  return {
    id: String(raw?.id ?? ''),
    number: clean(raw?.order_number) || String(raw?.id ?? ''),
    status: String(raw?.status ?? '').toUpperCase(),
    currency: (clean(raw?.currency) || 'KWD').toUpperCase(),
    lines,
    addons,
    isPickup,
    scheduledDate,
    scheduledSlot,
    createdAt: clean(raw?.created_at) || clean(raw?.order_date) || undefined,
    customerName,
    customerPhone: clean(raw?.customer_display_phone) || clean(raw?.customer_phone) || clean(customer?.phone_no) || undefined,
    customerEmail: clean(raw?.customer_email) || clean(customer?.email) || undefined,
    areaName: areaName || undefined,
    addressText: isPickup ? undefined : buildAddressText(raw, areaName) || undefined,
    addressNotes:
      clean(raw?.address_delivery_notes) ||
      clean(raw?.delivery_address?.delivery_notes) ||
      clean(snapshot?.delivery_notes) ||
      undefined,
    orderNotes: clean(raw?.order_notes) || clean(snapshot?.order_notes) || undefined,
    cakeMessage: clean(raw?.cake_message) || undefined,
    greetingTo: clean(raw?.greeting_to) || undefined,
    greetingFrom: clean(raw?.greeting_from) || undefined,
    greetingMessage: clean(raw?.greeting_message) || undefined,
    paymentMethod: clean(raw?.payment_method).toUpperCase() || undefined,
    paymentStatus: clean(raw?.payment_status).toUpperCase() || undefined,
    subtotal,
    discount,
    deliveryCharge,
    addonsTotal,
    total,
    deliveryPhoto: clean(raw?.delivery_photo) || undefined,
    driverNotes: clean(raw?.delivery_notes) || undefined,
    createdByName: clean(createdBy?.name) || undefined,
    createdByRole: clean(createdBy?.role) || undefined,
    source: clean(raw?.order_source) || undefined,
  };
}

export function formatOrderMoney(amount: number, currency = 'KWD'): string {
  const cur = (currency || 'KWD').toUpperCase();
  const digits = cur === 'KWD' ? 3 : 2;
  return `${cur} ${Number(amount || 0).toFixed(digits)}`;
}

const PAYMENT_LABELS: Record<string, string> = {
  COD: 'Cash on delivery',
  CASH: 'Cash',
  CREDIT: 'Credit (settle later)',
  LINK: 'Payment link',
  KNET: 'KNET',
  CARD: 'Card',
  UPI: 'Online',
  STRIPE: 'Card',
};

export const paymentLabel = (method?: string): string =>
  method ? PAYMENT_LABELS[method.toUpperCase()] ?? method : '—';

export function formatOrderDate(value?: string, withTime = false): string {
  if (!value) return '—';
  const isPlainDate = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const d = isPlainDate ? new Date(`${value}T00:00:00`) : new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
  if (!isPlainDate) opts.timeZone = 'Asia/Kuwait';
  if (withTime && !isPlainDate) {
    opts.hour = '2-digit';
    opts.minute = '2-digit';
  }
  return d.toLocaleString('en-GB', opts);
}

export const LINE_TYPE_LABEL: Record<OrderLineType, string> = {
  MENU: 'Menu item',
  CUSTOM_CAKE: 'Custom cake',
  AGENT_EXCLUSIVE: 'Agent exclusive',
};
