import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import './Checkout.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  User, MapPin, Loader2, Plus, Minus, Check, ShoppingBag,
  ChevronRight, ArrowLeft, Calendar, Clock, CreditCard,
  Banknote, X, ChevronDown, Trash2, Pencil, Home,
  AlertCircle, CheckCircle2, XCircle, Truck, Package,
  Tag, Gift, MessageCircle, Link2, Sparkles, Cookie,
} from 'lucide-react';

import {
  createAddress,
  getMyAddresses,
  updateAddress,
  deleteAddress,
  Address,
} from '../../services/addressService';

import {
  createOrder,
} from '../../services/orderService';

import {
  checkDelivery,
  getAreas,
  Area,
  CheckDeliveryResponse,
} from '../../services/areaService';

import {
  validatePromoCode,
  getAllAddons,
} from '../../services/productService';

/* Loyalty service — mirrors loyalty_routes.py exactly.
   getCustomerLoyalty() gives us everything we need to decide whether the
   toggle should be enabled and what to show the customer; actual points
   redemption/discount math happens server-side inside POST /orders when
   we send `use_loyalty: true` (see order_routes.py create_order). */
import {
  getCustomerLoyalty,
  CustomerLoyalty,
} from '../../services/loyaltyService';

/* ─────────────────────────────────────────
   TYPES
───────────────────────────────────── */

/* Order-level "specials" / add-ons. These are NOT tied to any cart item —
   they belong to the whole order (order_addons on the backend). The Addon
   catalogue is fetched from the same /addons endpoint that used to power
   per-item add-on pickers; we just changed how it's used on the frontend. */
interface Addon {
  id: number;
  name: string;
  price: number;
  image_url?: string;
  description?: string;
}

/** One line in the Order Specials cart: an addon + how many the customer wants. */
interface SelectedSpecial {
  addon: Addon;
  quantity: number;
}

interface CartItem {
  _id?: string;
  id?: string | number;
  product_id?: string | number;
  name: string;
  image_url?: string;
  // `price` is the unit price that will actually be charged (discounted if available)
  price: number;
  // Preserve original and discounted unit prices when a promotion applies
  original_price?: number | null;
  discounted_price?: number | null;
  quantity: number;
  variant_name?: string;
  variant_id?: number;
  flavor_name?: string;
  flavor_id?: number;
}

type DeliveryStatus =
  | { state: 'idle' }
  | { state: 'checking' }
  | { state: 'unavailable'; message: string }
  | { state: 'below_min'; message: string; min_order: number; charge: number }
  | { state: 'available'; charge: number; min_order: number; message: string };

/** cod = Cash on Delivery. upi = Payment Link (UPI) — no gateway redirect. */
type PaymentMethod = 'cod' | 'upi';

/* Address form shape used for both "create new" and "edit existing".
   Country is fixed to Kuwait for now — single-country delivery footprint,
   so we default it and never surface a country picker to the customer. */
interface AddressFormState {
  area_id: number | '';
  street: string;
  block: string;
  avenue: string;
  building: string;
  floor: string;
  apartment: string;
  delivery_notes: string;
  country: string;
}

const DEFAULT_COUNTRY = 'Kuwait';

const emptyAddrForm: AddressFormState = {
  area_id: '',
  street: '',
  block: '',
  avenue: '',
  building: '',
  floor: '',
  apartment: '',
  delivery_notes: '',
  country: DEFAULT_COUNTRY,
};

/* ─────────────────────────────────────────
   CURRENCY HELPERS
───────────────────────────────────── */
const CURRENCY_LABELS: Record<string, string> = {
  AED: 'AED',
  USD: 'USD',
  INR: 'INR',
  KWD: 'KWD',
  SAR: 'SAR',
  SGD: 'SGD',
};

const formatAmt = (amount: number, currency: string): string => {
  const label = CURRENCY_LABELS[currency] || currency;
  const prefix = ['$', '₹', 'S$'].includes(label);
  const fixed = amount.toFixed(2);
  return prefix ? `${label}${fixed}` : `${label} ${fixed}`;
};

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────── */
const getUserId = (): number => {
  const direct = localStorage.getItem('userId');
  if (direct) return Number(direct);
  try {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    return u?.id ?? 0;
  } catch { return 0; }
};

const getUser = () => {
  try { return JSON.parse(localStorage.getItem('user') || '{}'); }
  catch { return {}; }
};

/** Builds a human-readable, comma-joined address line from the free-form fields. */
const formatAddressLines = (addr: Address): { primary: string; secondary: string } => {
  const primary = [addr.building, addr.floor, addr.apartment].filter(Boolean).join(', ');
  const secondary = [addr.street, addr.avenue, addr.block].filter(Boolean).join(', ');
  return { primary, secondary };
};

/* ─────────────────────────────────────────
   TOAST
───────────────────────────────────── */
const Toast: React.FC<{
  msg: string; show: boolean;
  type?: 'success' | 'error' | 'info'; onClose: () => void;
}> = ({ msg, show, type = 'info', onClose }) => {
  useEffect(() => {
    if (show) { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }
  }, [show, onClose]);

  const icon = type === 'success'
    ? <CheckCircle2 size={15} />
    : type === 'error'
    ? <XCircle size={15} />
    : <AlertCircle size={15} />;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={`ch-toast ch-toast-${type}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <span className="ch-toast-icon">{icon}</span>
          <span className="ch-toast-msg">{msg}</span>
          <button className="ch-toast-close" onClick={onClose}><X size={12} /></button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ─────────────────────────────────────────
   DELIVERY BANNER
───────────────────────────────────── */
const DeliveryBanner: React.FC<{ status: DeliveryStatus; areaName?: string; currency: string }> = ({
  status, areaName, currency,
}) => {
  if (status.state === 'idle') return null;
  if (status.state === 'checking') return (
    <div className="ch-dbanner ch-dbanner-checking">
      <Loader2 size={13} className="ch-spinner" />
      <span>Checking delivery to <b>{areaName}</b>…</span>
    </div>
  );
  if (status.state === 'unavailable') return (
    <div className="ch-dbanner ch-dbanner-error">
      <XCircle size={13} />
      <span>{status.message || `Delivery not available to ${areaName}`}</span>
    </div>
  );
  if (status.state === 'below_min') return (
    <div className="ch-dbanner ch-dbanner-warn">
      <AlertCircle size={13} />
      <span>Minimum order {formatAmt(status.min_order, currency)} required · Delivery {formatAmt(status.charge, currency)}</span>
    </div>
  );
  if (status.state === 'available') return (
    <div className="ch-dbanner ch-dbanner-ok">
      <CheckCircle2 size={13} />
      <span>
        Delivery available to <b>{areaName}</b>
        {' · '}
        {status.charge === 0 ? 'Free delivery!' : `${formatAmt(status.charge, currency)} delivery charge`}
      </span>
    </div>
  );
  return null;
};

/* ═══════════════════════════════════════════
   ADDRESS PICKER MODAL
   List existing addresses (select / edit / delete) or create a new one.
═══════════════════════════════════════════ */
const AddressModal: React.FC<{
  open: boolean;
  onClose: () => void;
  addresses: Address[];
  areas: Area[];
  selectedId?: number;
  onSelect: (addr: Address) => void;
  onCreate: (payload: Omit<Address, 'id' | 'user_id'>) => Promise<void>;
  onUpdate: (id: number, payload: Partial<Omit<Address, 'id' | 'user_id'>>) => Promise<void>;
  onDelete: (addr: Address) => Promise<void>;
  savingAddr: boolean;
  deletingId: number | null;
  startInForm: boolean;
}> = ({
  open, onClose, addresses, areas, selectedId, onSelect,
  onCreate, onUpdate, onDelete, savingAddr, deletingId, startInForm,
}) => {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingAddr, setEditingAddr] = useState<Address | null>(null);
  const [form, setForm] = useState<AddressFormState>(emptyAddrForm);
  const [errors, setErrors] = useState<Partial<Record<keyof AddressFormState, string>>>({});

  useEffect(() => {
    if (open) {
      setView(startInForm || addresses.length === 0 ? 'form' : 'list');
      setEditingAddr(null);
      setForm(emptyAddrForm);
      setErrors({});
    }
  }, [open]); // eslint-disable-line

  const openCreateForm = () => {
    setEditingAddr(null);
    setForm(emptyAddrForm);
    setErrors({});
    setView('form');
  };

  const openEditForm = (addr: Address) => {
    setEditingAddr(addr);
    setForm({
      area_id: addr.area_id,
      street: addr.street || '',
      block: addr.block || '',
      avenue: addr.avenue || '',
      building: addr.building || '',
      floor: addr.floor || '',
      apartment: addr.apartment || '',
      delivery_notes: addr.delivery_notes || '',
      country: addr.country || DEFAULT_COUNTRY,
    });
    setErrors({});
    setView('form');
  };

  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (!form.area_id) errs.area_id = 'Select a delivery area';
    if (!form.street.trim()) errs.street = 'Street is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const payload = {
      area_id: Number(form.area_id),
      street: form.street.trim(),
      block: form.block.trim() || undefined,
      avenue: form.avenue.trim() || undefined,
      building: form.building.trim() || undefined,
      floor: form.floor.trim() || undefined,
      apartment: form.apartment.trim() || undefined,
      delivery_notes: form.delivery_notes.trim() || undefined,
      country: DEFAULT_COUNTRY,
    };
    if (editingAddr?.id) {
      await onUpdate(editingAddr.id, payload);
    } else {
      await onCreate(payload);
    }
    if (addresses.length === 0 && !editingAddr) {
      onClose();
    } else {
      setView('list');
    }
  };

  if (!open) return null;

  return (
    <motion.div
      className="ch-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="ch-modal ch-addr-picker-modal"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="ch-modal-hdr">
          <div className="ch-modal-title-row">
            <span className="ch-modal-icon"><Home size={14} /></span>
            <h3>
              {view === 'list'
                ? 'Your Addresses'
                : editingAddr ? 'Edit Address' : 'New Address'}
            </h3>
          </div>
          <motion.button
            className="ch-modal-close"
            onClick={onClose}
            whileHover={{ rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={15} />
          </motion.button>
        </div>

        {/* ── LIST VIEW ── */}
        {view === 'list' && (
          <div className="ch-modal-body">
            <div className="ch-addr-modal-list">
              {addresses.map(addr => {
                const { primary, secondary } = formatAddressLines(addr);
                const isSelected = addr.id === selectedId;
                return (
                  <div
                    key={addr.id}
                    className={`ch-addr-modal-tile ${isSelected ? 'selected' : ''}`}
                    onClick={() => { onSelect(addr); onClose(); }}
                  >
                    <div className={`ch-addr-radio ${isSelected ? 'active' : ''}`}>
                      <motion.div
                        className="ch-radio-dot"
                        animate={{ scale: isSelected ? 1 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </div>
                    <div className="ch-addr-info">
                      {primary && <p className="ch-addr-street"><Home size={10} /> {primary}</p>}
                      <p className="ch-addr-sub">{secondary || '—'}</p>
                      <p className="ch-addr-country">
                        {addr.area?.name ? `${addr.area.name} · ` : ''}{addr.country}
                      </p>
                    </div>
                    <div className="ch-addr-btns" onClick={e => e.stopPropagation()}>
                      <motion.button
                        className="ch-addr-btn"
                        onClick={() => openEditForm(addr)}
                        whileTap={{ scale: 0.9 }}
                        title="Edit"
                      >
                        <Pencil size={11} />
                      </motion.button>
                      <motion.button
                        className="ch-addr-btn danger"
                        disabled={deletingId === addr.id}
                        onClick={() => onDelete(addr)}
                        whileTap={{ scale: 0.9 }}
                        title="Delete"
                      >
                        {deletingId === addr.id
                          ? <Loader2 size={11} className="ch-spinner" />
                          : <Trash2 size={11} />}
                      </motion.button>
                    </div>
                  </div>
                );
              })}
            </div>

            <motion.button
              className="ch-addr-modal-add-btn"
              onClick={openCreateForm}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus size={14} /> Add New Address
            </motion.button>
          </div>
        )}

        {/* ── FORM VIEW (create / edit) ── */}
        {view === 'form' && (
          <>
            <div className="ch-modal-body">
              <div className="ch-field">
                <label className="ch-label">Delivery Area *</label>
                <div className="ch-select-wrap">
                  <select
                    className={`ch-input ch-select ${errors.area_id ? 'ch-input-err' : ''}`}
                    value={form.area_id}
                    onChange={e => {
                      setForm(f => ({ ...f, area_id: e.target.value ? Number(e.target.value) : '' }));
                      setErrors(er => ({ ...er, area_id: undefined }));
                    }}
                  >
                    <option value="">Select area</option>
                    {areas.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="ch-select-arrow" />
                </div>
                {errors.area_id && (
                  <span className="ch-err-msg"><AlertCircle size={10} /> {errors.area_id}</span>
                )}
              </div>

              <div className="ch-field">
                <label className="ch-label">Street *</label>
                <input
                  className={`ch-input ${errors.street ? 'ch-input-err' : ''}`}
                  placeholder="e.g. 12, Main Street"
                  value={form.street}
                  onChange={e => {
                    setForm(f => ({ ...f, street: e.target.value }));
                    setErrors(er => ({ ...er, street: undefined }));
                  }}
                />
                {errors.street && (
                  <span className="ch-err-msg"><AlertCircle size={10} /> {errors.street}</span>
                )}
              </div>

              <div className="ch-two-col">
                <div className="ch-field">
                  <label className="ch-label">Block</label>
                  <input
                    className="ch-input"
                    placeholder="Block"
                    value={form.block}
                    onChange={e => setForm(f => ({ ...f, block: e.target.value }))}
                  />
                </div>
                <div className="ch-field">
                  <label className="ch-label">Avenue</label>
                  <input
                    className="ch-input"
                    placeholder="Avenue"
                    value={form.avenue}
                    onChange={e => setForm(f => ({ ...f, avenue: e.target.value }))}
                  />
                </div>
              </div>

              <div className="ch-two-col">
                <div className="ch-field">
                  <label className="ch-label">Building</label>
                  <input
                    className="ch-input"
                    placeholder="Building name / no."
                    value={form.building}
                    onChange={e => setForm(f => ({ ...f, building: e.target.value }))}
                  />
                </div>
                <div className="ch-field">
                  <label className="ch-label">Floor</label>
                  <input
                    className="ch-input"
                    placeholder="Floor"
                    value={form.floor}
                    onChange={e => setForm(f => ({ ...f, floor: e.target.value }))}
                  />
                </div>
              </div>

              <div className="ch-two-col">
                <div className="ch-field">
                  <label className="ch-label">Apartment</label>
                  <input
                    className="ch-input"
                    placeholder="Apartment / unit"
                    value={form.apartment}
                    onChange={e => setForm(f => ({ ...f, apartment: e.target.value }))}
                  />
                </div>
                <div className="ch-field">
                  <label className="ch-label">Country</label>
                  <input
                    className="ch-input ch-input-locked"
                    value={DEFAULT_COUNTRY}
                    disabled
                    readOnly
                    title="Delivery is currently Kuwait-only"
                  />
                </div>
              </div>

              <div className="ch-field">
                <label className="ch-label">Delivery Notes</label>
                <textarea
                  className="ch-textarea"
                  rows={2}
                  placeholder="Landmark, gate code, delivery instructions…"
                  value={form.delivery_notes}
                  onChange={e => setForm(f => ({ ...f, delivery_notes: e.target.value }))}
                />
              </div>
            </div>

            <div className="ch-modal-footer">
              <motion.button
                className="ch-btn-ghost"
                onClick={() => (addresses.length === 0 && !editingAddr ? onClose() : setView('list'))}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                {addresses.length === 0 && !editingAddr ? 'Cancel' : 'Back'}
              </motion.button>
              <motion.button
                className="ch-btn-save"
                onClick={handleSave}
                disabled={savingAddr}
                whileHover={{ scale: savingAddr ? 1 : 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {savingAddr
                  ? <><Loader2 size={13} className="ch-spinner" /> Saving…</>
                  : <><Check size={13} /> {editingAddr ? 'Update' : 'Save Address'}</>}
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════
   ORDER SPECIALS MODAL
   Order-level add-ons — cheesecake slices, brownies, candles, etc.
   These belong to the whole order, never to an individual cart item.
═══════════════════════════════════════════ */
const OrderSpecialsModal: React.FC<{
  open: boolean;
  onClose: () => void;
  addons: Addon[];
  loading: boolean;
  selected: Record<number, number>; // addon_id -> quantity
  onChangeQty: (addon: Addon, quantity: number) => void;
  currency: string;
}> = ({ open, onClose, addons, loading, selected, onChangeQty, currency }) => {
  if (!open) return null;

  return (
    <motion.div
      className="ch-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="ch-modal ch-specials-modal"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="ch-modal-hdr ch-specials-hdr">
          <div className="ch-modal-title-row">
            <span className="ch-modal-icon ch-specials-icon"><Sparkles size={14} /></span>
            <div>
              <h3>Browse Specials</h3>
              <p className="ch-specials-hdr-sub">Enhance your order with our delicious extras</p>
            </div>
          </div>
          <motion.button
            className="ch-modal-close"
            onClick={onClose}
            whileHover={{ rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={15} />
          </motion.button>
        </div>

        <div className="ch-modal-body ch-specials-body">
          {loading ? (
            <div className="ch-addr-loading">
              <Loader2 size={18} className="ch-spinner" />
              <span>Loading specials…</span>
            </div>
          ) : addons.length === 0 ? (
            <div className="ch-specials-empty">
              <Cookie size={22} />
              <span>No specials available right now</span>
            </div>
          ) : (
            <div className="ch-specials-grid">
              {addons.map((addon, i) => {
                const qty = selected[addon.id] || 0;
                return (
                  <motion.div
                    key={addon.id}
                    className={`ch-special-card ${qty > 0 ? 'active' : ''}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <div className="ch-special-img-box">
                      {addon.image_url ? (
                        <img src={addon.image_url} alt={addon.name} className="ch-special-img" />
                      ) : (
                        <div className="ch-special-img-fallback"><Cookie size={22} /></div>
                      )}
                      {qty > 0 && (
                        <motion.span
                          className="ch-special-qty-badge"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                        >
                          {qty}
                        </motion.span>
                      )}
                    </div>

                    <div className="ch-special-body">
                      <p className="ch-special-name">{addon.name}</p>
                      {addon.description && (
                        <p className="ch-special-desc">{addon.description}</p>
                      )}
                      <p className="ch-special-price">{formatAmt(addon.price, currency)}</p>
                    </div>

                    {qty === 0 ? (
                      <motion.button
                        className="ch-special-add-btn"
                        onClick={() => onChangeQty(addon, 1)}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                      >
                        <Plus size={12} /> Add
                      </motion.button>
                    ) : (
                      <div className="ch-special-stepper">
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => onChangeQty(addon, qty - 1)}
                        >
                          <Minus size={12} />
                        </motion.button>
                        <span>{qty}</span>
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => onChangeQty(addon, qty + 1)}
                        >
                          <Plus size={12} />
                        </motion.button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        <div className="ch-modal-footer ch-specials-footer">
          <motion.button
            className="ch-btn-save ch-specials-done-btn"
            onClick={onClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <Check size={13} /> Done
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════
   CHECKOUT COMPONENT
═══════════════════════════════════════════ */
const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const userId = getUserId();
  const user = getUser();
  const userName: string = user?.first_name || user?.name || '';
  const userLastName: string = user?.last_name || '';
  const userEmail: string = user?.email || '';
  const userPhone: string = user?.phone_no || user?.phone || '';
  const userCurrency = localStorage.getItem('currency') || 'AED';

  const normalizeItem = (item: any): CartItem => {
    const orig = Number(
      item.original_price ??
      item.product?.price ??
      item.price ??
      0
    );

    // Support a variety of possible names for discounted price from different sources
    const discRaw = item.discounted_price ?? item.product?.discounted_price ?? item.discount_price ?? item.discount ?? null;
    const disc = discRaw != null ? Number(discRaw) : null;

    const charged = disc != null ? disc : orig;

    return {
      _id: String(item.product_id || item.id || item._id),
      product_id: item.product_id || item.id || item._id,
      name: item.name || item.product?.name || '',
      image_url: item.image_url || item.product?.image_url || 'https://via.placeholder.com/80',
      // `price` is the effective unit price (discounted if available)
      price: Number(charged),
      original_price: Number(orig),
      discounted_price: disc != null ? Number(disc) : null,
      quantity: Number(item.quantity || 1),
      variant_name: item.variant_name || item.variant || '',
      variant_id: item.variant_id,
      flavor_name: item.flavor_name || item.flavor || '',
      flavor_id: item.flavor_id,
    };
  };

  const resolveItems = (): CartItem[] => {
    if (location.state?.items?.length > 0)
      return (location.state.items as any[]).map(normalizeItem);
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (cart.length > 0) return cart.map(normalizeItem);
    } catch { }
    return [];
  };

  const [items, setItems] = useState<CartItem[]>(resolveItems);
  const [step, setStep] = useState(1);
  const [submitting, setSub] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const [itemShapes] = useState<Record<number, string>>({});

  /* ── Order-level specials / add-ons catalogue + selection ── */
  const [allAddons, setAllAddons] = useState<Addon[]>([]);
  const [addonsLoading, setAddonsLoading] = useState(false);
  const [showSpecialsModal, setShowSpecialsModal] = useState(false);
  const [selectedSpecials, setSelectedSpecials] = useState<Record<number, SelectedSpecial>>({});

  const [showGreeting, setShowGreeting] = useState(false);
  const [greeting, setGreeting] = useState({ message: '', from: '', to: '' });

  /* ── Address + Area state ── */
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddrId, setSelectedAddrId] = useState<number | undefined>(undefined);
  const [addrLoading, setAddrLoading] = useState(false);
  const [showAddrModal, setShowAddrModal] = useState(false);
  const [addrModalStartInForm, setAddrModalStartInForm] = useState(false);
  const [savingAddr, setSavingAddr] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [areasList, setAreasList] = useState<Area[]>([]);
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>({ state: 'idle' });
  const deliveryRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');

  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoLabel, setPromoLabel] = useState('');

  const [loyaltyInfo, setLoyaltyInfo] = useState<CustomerLoyalty | null>(null);
  const [loyaltyLoading, setLoyaltyLoading] = useState(false);
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);

  const [toast, setToast] = useState({ show: false, msg: '', type: 'info' as 'success' | 'error' | 'info' });
  const showToast = useCallback((msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ show: true, msg, type });
  }, []);

  const itemSubtotalFor = (item: CartItem) => Math.round(item.price * item.quantity * 100) / 100;

  const subtotal = useMemo(
    () => Math.round(items.reduce((s, i) => s + itemSubtotalFor(i), 0) * 100) / 100,
    [items]
  );

  /* Order Specials total — independent of any cart item. */
  const specialsList = useMemo(() => Object.values(selectedSpecials), [selectedSpecials]);
  const specialsCount = useMemo(
    () => specialsList.reduce((s, x) => s + x.quantity, 0),
    [specialsList]
  );
  const orderAddonsTotal = useMemo(
    () => specialsList.reduce((s, x) => s + x.addon.price * x.quantity, 0),
    [specialsList]
  );

  const deliveryFee = deliveryStatus.state === 'available' ? deliveryStatus.charge : 0;

  const loyaltyEligible = !!loyaltyInfo?.can_redeem;
  const loyaltyActive = useLoyaltyPoints && loyaltyEligible && !promoApplied;

  /* Discounts apply to the product subtotal, same as before — specials are
     priced as-is and simply added on top of the grand total. */
  const loyaltyDiscount = useMemo(() => {
    if (!loyaltyActive || !loyaltyInfo) return 0;
    const raw = (subtotal * loyaltyInfo.reward_percent) / 100;
    return Math.min(Math.round(raw * 100) / 100, subtotal);
  }, [loyaltyActive, loyaltyInfo, subtotal]);

  const totalDiscount = (promoApplied ? promoDiscount : 0) + loyaltyDiscount;

  const total = useMemo(
    () => Math.max(0, subtotal + deliveryFee + orderAddonsTotal - totalDiscount),
    [subtotal, deliveryFee, orderAddonsTotal, totalDiscount]
  );

  /* ── Initialization ── */
  useEffect(() => {
    if (!userId) {
      showToast('Please login first', 'error');
      setTimeout(() => navigate('/login'), 1000);
      return;
    }
    if (items.length === 0) {
      showToast('No items in cart', 'error');
      setTimeout(() => navigate('/products'), 1000);
      return;
    }
    fetchAddresses();
    fetchAreas();
    fetchAddonCatalogue();
    fetchLoyaltyData();
  }, []); // eslint-disable-line

  const selectedAddress = addresses.find(a => a.id === selectedAddrId) ?? null;

  const fetchAreas = async () => {
    try {
      const data = await getAreas();
      setAreasList(data ?? []);
    } catch {
      showToast('Could not load delivery areas', 'error');
    }
  };

  /* Reuses the existing /addons endpoint — same data source that used to
     populate the per-item add-on pickers, now used to populate the single
     Order Specials catalogue instead. */
  const fetchAddonCatalogue = async () => {
    setAddonsLoading(true);
    try {
      const list = await getAllAddons();
      setAllAddons((list || []).map((a: any) => ({
        id: a.id,
        name: a.name,
        price: Number(a.price),
        image_url: a.image_url || a.image || undefined,
        description: a.description || undefined,
      })));
    } catch {
      // Non-critical
    } finally {
      setAddonsLoading(false);
    }
  };

  /* ── Auto-check delivery whenever the selected address (its area_id) or
     the subtotal changes — no pincode matching needed, the address already
     carries its area_id directly. ── */
  useEffect(() => {
    if (!selectedAddress?.area_id) { setDeliveryStatus({ state: 'idle' }); return; }

    if (deliveryRef.current) clearTimeout(deliveryRef.current);
    deliveryRef.current = setTimeout(() => {
      runDeliveryCheck(selectedAddress.area_id, subtotal);
    }, 350);

    return () => { if (deliveryRef.current) clearTimeout(deliveryRef.current); };
  }, [selectedAddrId, subtotal, addresses]); // eslint-disable-line

  const runDeliveryCheck = async (areaId: number, amount: number) => {
    setDeliveryStatus({ state: 'checking' });
    try {
      const res: CheckDeliveryResponse = await checkDelivery({
        area_id: areaId,
        order_amount: amount,
      });

      if (res.delivery_available) {
        setDeliveryStatus({
          state: 'available',
          charge: res.delivery_charge ?? res.area?.delivery_charge ?? 0,
          min_order: res.min_order_value ?? res.area?.min_order_value ?? 0,
          message: res.message,
        });
      } else {
        setDeliveryStatus({
          state: 'unavailable',
          message: res.message || 'Delivery is not available for this area.',
        });
      }
    } catch (e: any) {
      // Backend returns 400 for "below minimum order" and 404 for
      // "area not found / inactive", so both land here.
      const data = e?.response?.data;

      if (e?.response?.status === 400 && data?.delivery_available && data?.area) {
        setDeliveryStatus({
          state: 'below_min',
          message: data.message || 'Order amount is below the minimum for this area.',
          min_order: Number(data.area?.min_order_value ?? 0),
          charge: Number(data.area?.delivery_charge ?? 0),
        });
      } else {
        setDeliveryStatus({
          state: 'unavailable',
          message: data?.message || 'Delivery not available for this area.',
        });
      }
    }
  };

  /* ── Fetch this user's addresses ── */
  const fetchAddresses = async () => {
    setAddrLoading(true);
    try {
      const data = await getMyAddresses();
      setAddresses(data ?? []);
      setSelectedAddrId(prev => {
        if (prev && (data ?? []).some(a => a.id === prev)) return prev;
        return (data ?? [])[0]?.id;
      });
    } catch { showToast('Could not load addresses', 'error'); }
    finally { setAddrLoading(false); }
  };

  const fetchLoyaltyData = async () => {
    setLoyaltyLoading(true);
    try {
      const info = await getCustomerLoyalty(userId);
      setLoyaltyInfo(info);
    } catch {
      setLoyaltyInfo(null);
    } finally {
      setLoyaltyLoading(false);
    }
  };

  const updateQty = (idx: number, qty: number) =>
    setItems(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], quantity: Math.max(1, qty) };
      return next;
    });

  const removeItem = (idx: number) =>
    setItems(prev => prev.filter((_, i) => i !== idx));

  /* ── Order Specials actions ── */
  const setSpecialQty = (addon: Addon, quantity: number) => {
    setSelectedSpecials(prev => {
      const next = { ...prev };
      if (quantity <= 0) {
        delete next[addon.id];
      } else {
        next[addon.id] = { addon, quantity };
      }
      return next;
    });
  };

  const removeSpecial = (addonId: number) => {
    setSelectedSpecials(prev => {
      const next = { ...prev };
      delete next[addonId];
      return next;
    });
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    try {
      const res = await validatePromoCode(promoCode.trim().toUpperCase());
      if (res.valid && res.promo) {
        const p = res.promo;
        let disc = 0;
        if (p.discount_type === 'PERCENT') {
          disc = (subtotal * p.discount_value) / 100;
        } else {
          disc = p.discount_value;
        }
        disc = Math.min(disc, subtotal);
        const label = p.discount_type === 'PERCENT'
          ? `${p.discount_value}% off`
          : `${formatAmt(p.discount_value, userCurrency)} off`;
        setPromoDiscount(disc);
        setPromoApplied(true);
        setPromoLabel(label);
        setUseLoyaltyPoints(false);
        showToast(`Promo applied! ${label}`, 'success');
      } else {
        showToast(res.error || 'Invalid or expired promo code', 'error');
      }
    } catch {
      showToast('Could not validate promo code', 'error');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoApplied(false);
    setPromoCode('');
    setPromoDiscount(0);
    setPromoLabel('');
  };

  const handleToggleLoyalty = (checked: boolean) => {
    if (checked && promoApplied) {
      showToast('Remove the promo code to use loyalty points', 'info');
      return;
    }
    setUseLoyaltyPoints(checked);
  };

  /* ── Address actions ── */
  const openAddAnotherAddress = () => {
    setAddrModalStartInForm(false);
    setShowAddrModal(true);
  };

  const handleSelectAddress = (addr: Address) => {
    if (addr.id) setSelectedAddrId(addr.id);
  };

  const handleCreateAddress = async (payload: Omit<Address, 'id' | 'user_id'>) => {
    setSavingAddr(true);
    try {
      const created = await createAddress({ ...payload, country: DEFAULT_COUNTRY });
      showToast('Address added', 'success');
      await fetchAddresses();
      if (created?.id) setSelectedAddrId(created.id);
    } catch (e: any) {
      showToast(e?.response?.data?.error || 'Failed to save address', 'error');
      throw e;
    } finally {
      setSavingAddr(false);
    }
  };

  const handleUpdateAddress = async (id: number, payload: Partial<Omit<Address, 'id' | 'user_id'>>) => {
    setSavingAddr(true);
    try {
      await updateAddress(id, { ...payload, country: DEFAULT_COUNTRY });
      showToast('Address updated', 'success');
      await fetchAddresses();
    } catch (e: any) {
      showToast(e?.response?.data?.error || 'Failed to update address', 'error');
      throw e;
    } finally {
      setSavingAddr(false);
    }
  };

  const handleDeleteAddress = async (addr: Address) => {
    if (!addr.id) return;
    setDeletingId(addr.id);
    try {
      await deleteAddress(addr.id);
      showToast('Address removed', 'success');
      const wasSelected = addr.id === selectedAddrId;
      await fetchAddresses();
      if (wasSelected) setSelectedAddrId(undefined);
    } catch {
      showToast('Failed to delete address', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  /* ── Step guard ── */
  const handleContinue = () => {
    if (addresses.length === 0) { showToast('Add a delivery address first', 'error'); return; }
    if (!selectedAddress) { showToast('Select a delivery address', 'error'); return; }
    if (deliveryStatus.state === 'idle') { showToast('Select a delivery address', 'error'); return; }
    if (deliveryStatus.state === 'checking') { showToast('Checking delivery…', 'info'); return; }
    if (deliveryStatus.state === 'unavailable') { showToast('Delivery not available for this address', 'error'); return; }
    if (deliveryStatus.state === 'below_min') {
      showToast(`Minimum order is ${formatAmt(deliveryStatus.min_order, userCurrency)}`, 'error');
      return;
    }
    setStep(2);
  };

  /* Product line items — no add-ons attached here any more. */
  const buildOrderItems = () =>
    items.map((item, idx) => ({
      product_id: Number(item.product_id || item.id),
      quantity: item.quantity,
      // send both original and charged (discounted) unit prices and the line total
      price: item.price,
      original_price: item.original_price ?? null,
      discounted_price: item.discounted_price ?? null,
      total: Math.round(item.price * item.quantity * 100) / 100,
      custom_json: {
        variant_name: item.variant_name || null,
        variant_id: item.variant_id || null,
        flavor_name: item.flavor_name || null,
        flavor_id: item.flavor_id || null,
        shape: itemShapes[idx] || null,
        item_subtotal: itemSubtotalFor(item),
      },
    }));

  /* Order-level specials — sent as their own array, matching the backend's
     order_addons table (order_id, addon_id, quantity, price, total). */
  const buildOrderAddons = () =>
    specialsList.map(s => ({
      addon_id: s.addon.id,
      quantity: s.quantity,
      price: s.addon.price,
      total: Math.round(s.addon.price * s.quantity * 100) / 100,
    }));

  /* ── Place order ──
     No payment-gateway redirect anywhere in this flow:
       - "cod" -> Cash on Delivery
       - "upi" -> Order is created with payment_status "PENDING". The
                  Owner / Shop Manager later generates and sends a UPI
                  payment link from the order details screen. */
  const handlePlaceOrder = async () => {
    if (!userId) { showToast('Please login again', 'error'); return; }
    if (!selectedAddress?.id) { showToast('Select a delivery address', 'error'); return; }
    if (deliveryStatus.state !== 'available') {
      showToast('Delivery not available for selected address', 'error'); return;
    }
    if (!selectedAddress.area_id) {
      showToast('Delivery area not found', 'error');
      return;
    }
    if (!deliveryDate) { showToast('Select a delivery date', 'error'); return; }
    if (!deliveryTime) { showToast('Select a delivery time slot', 'error'); return; }

    setSub(true);
    try {
      const usingLoyalty = loyaltyActive;

      const orderPayload: Record<string, any> = {
        address_id: selectedAddress.id,
        delivery_area_id: selectedAddress.area_id,
        items: buildOrderItems(),
        order_addons: buildOrderAddons(),
        delivery_date: deliveryDate,
        delivery_time_slot: deliveryTime,
        order_type: 'DELIVERY',
        delivery_charge: deliveryFee,
        currency: userCurrency,
        discount: promoApplied ? promoDiscount : 0,
        use_loyalty: usingLoyalty,
        loyalty_coupon: promoApplied
          ? promoCode.trim().toUpperCase()
          : (usingLoyalty ? 'LOYALTY_POINTS' : null),
        greeting_message: greeting.message.trim() || null,
        greeting_from: greeting.from.trim() || null,
        greeting_to: greeting.to.trim() || null,
        subtotal,
        order_addons_total: orderAddonsTotal,
        grand_total: total,
        promo_discount: promoApplied ? promoDiscount : 0,
        loyalty_discount: usingLoyalty ? loyaltyDiscount : 0,
        payment_method: paymentMethod === 'cod' ? 'COD' : 'UPI',
        payment_status: 'PENDING',
        status: 'PENDING',
      };

      const res = await createOrder(orderPayload);
      const order = res?.id ? res : res?.order;

      setOrderSuccess(true);
      localStorage.removeItem('cart');
      localStorage.removeItem('buyNowItem');

      if (paymentMethod === 'cod') {
        showToast(
          usingLoyalty
            ? `Order placed! Loyalty discount of ${loyaltyInfo?.reward_percent ?? 0}% applied.`
            : 'Order placed!',
          'success'
        );
      } else {
        showToast(
          'Your order has been placed successfully. Our UPI payment owner will review your order and send you a secure payment link shortly.',
          'success'
        );
      }

      setTimeout(
        () => navigate('/orders', { state: { orderId: order?.id } }),
        paymentMethod === 'cod' ? 1600 : 2200
      );
    } catch (error: any) {
      showToast(
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        'Failed to place order',
        'error'
      );
    } finally {
      setSub(false);
    }
  };

  const canProceed = deliveryStatus.state === 'available' && addresses.length > 0;
  const displayName = [userName, userLastName].filter(Boolean).join(' ');

  const paymentOptions = [
    {
      key: 'cod' as const,
      icon: <Banknote size={20} />,
      label: 'Cash on Delivery',
      sub: 'Pay when your order arrives',
      badge: 'Popular',
    },
    // {
    //   key: 'upi' as const,
    //   icon: <Link2 size={20} />,
    //   label: 'UPI Payment Link',
    //   sub: "We'll send you a secure UPI payment link",
    //   badge: null as string | null,
    // },
  ];

  /* ═══════════════════════════════════════
     RENDER
  ═══════════════════════════════════════ */
  return (
    <div className="ch-root">
      <Toast
        msg={toast.msg}
        show={toast.show}
        type={toast.type}
        onClose={() => setToast(t => ({ ...t, show: false }))}
      />

      {/* ── Header ── */}
      <header className="ch-header">
        <motion.button
          className="ch-back-btn"
          onClick={() => step === 2 ? setStep(1) : navigate(-1)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
        >
          <ArrowLeft size={18} />
        </motion.button>

        <div className="ch-header-center">
          <span className="ch-header-title">Checkout</span>
          <div className="ch-step-track">
            <div className={`ch-step-pill ${step >= 1 ? 'active' : ''}`}>
              <span className="ch-step-num">{step > 1 ? <Check size={9} /> : '1'}</span>
              <span className="ch-step-lbl">Delivery</span>
            </div>
            <div className="ch-step-line">
              <motion.div
                className="ch-step-line-fill"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: step >= 2 ? 1 : 0 }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <div className={`ch-step-pill ${step >= 2 ? 'active' : ''}`}>
              <span className="ch-step-num">2</span>
              <span className="ch-step-lbl">Payment</span>
            </div>
          </div>
        </div>
      </header>

      <div className="ch-grid">

        {/* ═══ LEFT: Steps ═══ */}
        <div className="ch-left">
          <AnimatePresence mode="wait">

            {/* ─── STEP 1 ─── */}
            {step === 1 && (
              <motion.div
                key="step1"
                className="ch-step-wrap"
                initial={{ x: -28, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -28, opacity: 0 }}
                transition={{ duration: 0.24 }}
              >
                {/* Customer details */}
                <div className="ch-card">
                  <div className="ch-card-hdr">
                    <span className="ch-card-icon"><User size={14} /></span>
                    <h3>Your Details</h3>
                  </div>
                  <div className="ch-customer-row">
                    <div className="ch-avatar">
                      {(userName.charAt(0) || 'U').toUpperCase()}
                    </div>
                    <div className="ch-customer-info">
                      <p className="ch-cust-name">{displayName || 'Guest'}</p>
                      {userEmail && <p className="ch-cust-sub">{userEmail}</p>}
                      {userPhone && <p className="ch-cust-sub">{userPhone}</p>}
                    </div>
                    <span className="ch-verified">
                      <CheckCircle2 size={12} /> Verified
                    </span>
                  </div>
                </div>

                {/* Delivery address — shows ONLY the selected address */}
                <div className="ch-card">
                  <div className="ch-card-hdr">
                    <span className="ch-card-icon"><MapPin size={14} /></span>
                    <h3>Delivery Address</h3>
                  </div>

                  {addrLoading ? (
                    <div className="ch-addr-loading">
                      <Loader2 size={18} className="ch-spinner" />
                      <span>Loading addresses…</span>
                    </div>
                  ) : !selectedAddress ? (
                    <button className="ch-addr-empty" onClick={openAddAnotherAddress}>
                      <Home size={22} />
                      <span className="ch-addr-empty-title">No addresses yet</span>
                      <span className="ch-addr-empty-sub">Tap to add your delivery address</span>
                    </button>
                  ) : (
                    <>
                      {(() => {
                        const { primary, secondary } = formatAddressLines(selectedAddress);
                        return (
                          <div className="ch-addr-current-card">
                            <div className="ch-addr-current-icon"><Home size={16} /></div>
                            <div className="ch-addr-current-body">
                              {primary && <p className="ch-addr-current-primary">{primary}</p>}
                              <p className="ch-addr-current-secondary">{secondary || '—'}</p>
                              <p className="ch-addr-current-meta">
                                {selectedAddress.area?.name ? `${selectedAddress.area.name} · ` : ''}
                                {selectedAddress.country}
                              </p>
                              {selectedAddress.delivery_notes && (
                                <p className="ch-addr-current-notes">Note: {selectedAddress.delivery_notes}</p>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      <motion.button
                        className="ch-addr-add-another-btn"
                        onClick={openAddAnotherAddress}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Plus size={13} /> Add Another Address
                      </motion.button>
                    </>
                  )}

                  {selectedAddress && (
                    <div className="ch-delivery-banner-wrap">
                      <DeliveryBanner
                        status={deliveryStatus}
                        areaName={selectedAddress.area?.name}
                        currency={userCurrency}
                      />
                    </div>
                  )}
                </div>

                {/* Per-item customisation: read-only variant/flavor (no add-ons here) */}
                {items.length > 0 && (
                  <div className="ch-card">
                    <div className="ch-card-hdr">
                      <span className="ch-card-icon"><Package size={14} /></span>
                      <h3>Item Customisation</h3>
                      <span className="ch-optional">(optional)</span>
                    </div>

                    {items.map((item, idx) => (
                      <div key={idx} className="ch-custom-item">
                        <div className="ch-custom-item-name">
                          <img className="item-cus-img" src={item.image_url} alt={item.name} />
                          <span>{item.name}</span>
                        </div>

                        <div className="ch-custom-tags">
                          {item.variant_name && (
                            <span className="ch-tag ch-tag-variant">
                              Variant: {item.variant_name}
                            </span>
                          )}
                          {item.flavor_name && (
                            <span className="ch-tag ch-tag-flavor">
                              Flavour: {item.flavor_name}
                            </span>
                          )}
                          {!item.variant_name && !item.flavor_name && (
                            <span className="ch-tag ch-tag-muted">No customisation</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Order Specials — single, order-level add-ons card */}
                <div className="ch-card ch-specials-card">
                  <div className="ch-specials-card-inner">
                    <div className="ch-specials-icon-badge">
                      <Sparkles size={18} />
                    </div>
                    <div className="ch-specials-card-text">
                      <h3>✨ Would you like to add some of our specials to your order?</h3>
                      <p>Enhance your order with our delicious extras.</p>
                    </div>
                  </div>

                  {specialsCount > 0 && (
                    <div className="ch-specials-selected-list">
                      {specialsList.map(({ addon, quantity }) => (
                        <motion.div
                          key={addon.id}
                          className="ch-specials-selected-row"
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          layout
                        >
                          {addon.image_url && (
                            <img src={addon.image_url} alt={addon.name} className="ch-special-img-sm" />
                          )}
                          <span className="ch-specials-selected-name">
                            {addon.name} <b>×{quantity}</b>
                          </span>
                          <span className="ch-specials-selected-price">
                            {formatAmt(addon.price * quantity, userCurrency)}
                          </span>
                          <div className="ch-specials-selected-actions">
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => setSpecialQty(addon, quantity - 1)}
                              title="Remove one"
                            >
                              {/* <Minus size={11} /> */}-
                            </motion.button>
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => setSpecialQty(addon, quantity + 1)}
                              title="Add one more"
                            >
                              {/* <Plus size={11} /> */}+
                            </motion.button>
                            <motion.button
                              className="danger"
                              whileTap={{ scale: 0.85 }}
                              onClick={() => removeSpecial(addon.id)}
                              title="Remove"
                            >
                              {/* <Trash2 size={11} /> */}X
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  <motion.button
                    className="ch-specials-browse-btn"
                    onClick={() => setShowSpecialsModal(true)}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Sparkles size={13} />
                    {specialsCount > 0 ? 'Edit Specials' : 'Browse Specials'}
                    <ChevronRight size={13} />
                  </motion.button>
                </div>

                {/* Greeting message (optional) */}
                {/* <div className="ch-card">
                  <div className="ch-card-hdr">
                    <span className="ch-card-icon"><MessageCircle size={14} /></span>
                    <h3>Greeting Message</h3>
                    <span className="ch-optional">(optional)</span>
                    <button
                      className="ch-toggle-btn"
                      onClick={() => setShowGreeting(v => !v)}
                    >
                      {showGreeting ? 'Hide' : 'Add Message'}
                    </button>
                  </div>

                  {showGreeting && (
                    <motion.div
                      className="ch-greeting-wrap"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="ch-field">
                        <label className="ch-label">Message</label>
                        <textarea
                          className="ch-textarea"
                          rows={2}
                          placeholder="e.g. Happy Birthday! Wishing you all the best…"
                          value={greeting.message}
                          onChange={e => setGreeting(g => ({ ...g, message: e.target.value }))}
                        />
                      </div>
                      <div className="ch-two-col">
                        <div className="ch-field">
                          <label className="ch-label">From</label>
                          <input
                            className="ch-input"
                            placeholder="Your name"
                            value={greeting.from}
                            onChange={e => setGreeting(g => ({ ...g, from: e.target.value }))}
                          />
                        </div>
                        <div className="ch-field">
                          <label className="ch-label">To</label>
                          <input
                            className="ch-input"
                            placeholder="Recipient's name"
                            value={greeting.to}
                            onChange={e => setGreeting(g => ({ ...g, to: e.target.value }))}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div> */}

                <motion.button
                  className={`ch-primary-btn ${!canProceed ? 'ch-btn-dim' : ''}`}
                  onClick={handleContinue}
                  whileHover={{ scale: canProceed ? 1.02 : 1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {deliveryStatus.state === 'checking'
                    ? <><Loader2 size={15} className="ch-spinner" /> Checking delivery…</>
                    : <>Continue to Payment <ChevronRight size={16} /></>
                  }
                </motion.button>
              </motion.div>
            )}

            {/* ─── STEP 2 ─── */}
            {step === 2 && (
              <motion.div
                key="step2"
                className="ch-step-wrap"
                initial={{ x: 28, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 28, opacity: 0 }}
                transition={{ duration: 0.24 }}
              >
                {/* Delivery schedule */}
                <div className="ch-card">
                  <div className="ch-card-hdr">
                    <span className="ch-card-icon"><Calendar size={14} /></span>
                    <h3>Delivery Schedule</h3>
                  </div>
                  <div className="ch-two-col">
                    <div className="ch-field">
                      <label className="ch-label"><Calendar size={10} /> Delivery Date *</label>
                      <input
                        type="date"
                        className="ch-input"
                        min={new Date().toISOString().split('T')[0]}
                        value={deliveryDate}
                        onChange={e => setDeliveryDate(e.target.value)}
                      />
                    </div>
                    <div className="ch-field">
                      <label className="ch-label"><Clock size={10} /> Time Slot *</label>
                      <div className="ch-select-wrap">
                        <select
                          className="ch-input ch-select"
                          value={deliveryTime}
                          onChange={e => setDeliveryTime(e.target.value)}
                        >
                          <option value="">Select time slot</option>
                          <option value="10:00 AM – 12:00 PM">10:00 AM – 12:00 PM</option>
                          <option value="12:00 PM – 02:00 PM">12:00 PM – 02:00 PM</option>
                          <option value="02:00 PM – 05:00 PM">02:00 PM – 05:00 PM</option>
                          <option value="06:00 PM – 09:00 PM">06:00 PM – 09:00 PM</option>
                        </select>
                        <ChevronDown size={13} className="ch-select-arrow" />
                      </div>
                    </div>
                  </div>
                </div>

                
                {/* Greeting message (optional) */}
                <div className="ch-card">
                  <div className="ch-card-hdr">
                    <span className="ch-card-icon"><MessageCircle size={14} /></span>
                    <h3>Greeting Message</h3>
                    <span className="ch-optional">(optional)</span>
                    <button
                      className="ch-toggle-btn"
                      onClick={() => setShowGreeting(v => !v)}
                    >
                      {showGreeting ? 'Hide' : 'Add Message'}
                    </button>
                  </div>

                  {showGreeting && (
                    <motion.div
                      className="ch-greeting-wrap"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="ch-field">
                        <label className="ch-label">Message</label>
                        <textarea
                          className="ch-textarea"
                          rows={2}
                          placeholder="e.g. Happy Birthday! Wishing you all the best…"
                          value={greeting.message}
                          onChange={e => setGreeting(g => ({ ...g, message: e.target.value }))}
                        />
                      </div>
                      <div className="ch-two-col">
                        <div className="ch-field">
                          <label className="ch-label">From</label>
                          <input
                            className="ch-input"
                            placeholder="Your name"
                            value={greeting.from}
                            onChange={e => setGreeting(g => ({ ...g, from: e.target.value }))}
                          />
                        </div>
                        <div className="ch-field">
                          <label className="ch-label">To</label>
                          <input
                            className="ch-input"
                            placeholder="Recipient's name"
                            value={greeting.to}
                            onChange={e => setGreeting(g => ({ ...g, to: e.target.value }))}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Payment method — Cash + UPI link only. No payment gateway. */}
                <div className="ch-card">
                  <div className="ch-card-hdr">
                    <span className="ch-card-icon"><CreditCard size={14} /></span>
                    <h3>Payment Method</h3>
                  </div>
                  <div className="ch-pay-stack">
                    {paymentOptions.map(({ key, icon, label, sub, badge }) => (
                      <motion.div
                        key={key}
                        className={`ch-pay-tile ${paymentMethod === key ? 'active' : ''}`}
                        onClick={() => setPaymentMethod(key)}
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className={`ch-pay-icon-box ch-pay-${key}`}>{icon}</div>
                        <div className="ch-pay-text">
                          <div className="ch-pay-name-row">
                            <span className="ch-pay-name">{label}</span>
                            {badge && <span className="ch-pay-badge">{badge}</span>}
                          </div>
                          <p className="ch-pay-sub">{sub}</p>
                        </div>
                        <div className={`ch-pay-radio ${paymentMethod === key ? 'active' : ''}`}>
                          <motion.div
                            className="ch-radio-dot"
                            animate={{ scale: paymentMethod === key ? 1 : 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {paymentMethod === 'upi' && (
                    <motion.div
                      className="ch-knet-note"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      Your order has been placed successfully. Our UPI payment owner will review
                      your order and send you a secure payment link shortly.
                    </motion.div>
                  )}
                </div>

                {/* Promo / Discount code */}
                {/* <div className="ch-card">
                  <div className="ch-card-hdr">
                    <span className="ch-card-icon"><Tag size={14} /></span>
                    <h3>Promo Code</h3>
                    <span className="ch-optional">(optional)</span>
                  </div>

                  {promoApplied ? (
                    <motion.div
                      className="ch-promo-applied"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="ch-promo-applied-left">
                        <Gift size={13} />
                        <span><strong>{promoCode}</strong> · {promoLabel}</span>
                      </div>
                      <button className="ch-promo-remove" onClick={handleRemovePromo}>
                        <X size={12} /> Remove
                      </button>
                    </motion.div>
                  ) : (
                    <>
                      <div className="ch-promo-row">
                        <input
                          className="ch-input ch-promo-input"
                          placeholder="Enter promo / coupon code"
                          value={promoCode}
                          disabled={useLoyaltyPoints}
                          onChange={e => setPromoCode(e.target.value.toUpperCase())}
                          onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                        />
                        <motion.button
                          className="ch-promo-btn"
                          onClick={handleApplyPromo}
                          disabled={!promoCode.trim() || promoLoading || useLoyaltyPoints}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          {promoLoading ? <Loader2 size={14} className="ch-spinner" /> : 'Apply'}
                        </motion.button>
                      </div>
                      {useLoyaltyPoints && (
                        <p className="ch-loyalty-note">
                          Turn off loyalty points to use a promo code instead.
                        </p>
                      )}
                    </>
                  )}
                </div> */}

                {/* Order Specials summary (editable from step 2 too) */}
                {specialsCount > 0 && (
                  <div className="ch-card">
                    <div className="ch-card-hdr">
                      <span className="ch-card-icon"><Sparkles size={14} /></span>
                      <h3>Order Specials</h3>
                      <button className="ch-toggle-btn" onClick={() => setShowSpecialsModal(true)}>
                        Edit
                      </button>
                    </div>
                    <div className="ch-specials-selected-list">
                      {specialsList.map(({ addon, quantity }) => (
                        <div key={addon.id} className="ch-specials-selected-row">
                          {addon.image_url && (
                            <img src={addon.image_url} alt={addon.name} className="ch-special-img-sm" />
                          )}
                          <span className="ch-specials-selected-name">
                            {addon.name} <b>×{quantity}</b>
                          </span>
                          <span className="ch-specials-selected-price">
                            {formatAmt(addon.price * quantity, userCurrency)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Delivery address summary */}
                {selectedAddress && (
                  <div className="ch-addr-summary">
                    <Truck size={13} />
                    <div className="ch-addr-summary-text">
                      <span className="ch-addr-summary-addr">
                        {[selectedAddress.building, selectedAddress.street, selectedAddress.area?.name]
                          .filter(Boolean).join(', ')}
                      </span>
                      {deliveryStatus.state === 'available' && (
                        <span className="ch-addr-summary-charge">
                          Delivery: {deliveryStatus.charge === 0 ? 'FREE' : formatAmt(deliveryStatus.charge, userCurrency)}
                        </span>
                      )}
                    </div>
                    <button className="ch-change-link" onClick={() => setStep(1)}>
                      Change
                    </button>
                  </div>
                )}

                {/* Place order button */}
                <motion.button
                  className="ch-primary-btn ch-place-btn"
                  onClick={handlePlaceOrder}
                  disabled={submitting || orderSuccess}
                  whileHover={{ scale: submitting ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={15} className="ch-spinner" />
                      Placing order…
                    </>
                  ) : orderSuccess ? (
                    <><CheckCircle2 size={15} /> Order Placed!</>
                  ) : (
                    <>
                      <ShoppingBag size={15} />
                      Place Order · {formatAmt(total, userCurrency)}
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ═══ RIGHT: Order Summary ═══ */}
        <aside className="ch-summary">
          <div className="ch-summary-hdr">
            <h3 className="ch-summary-title"><ShoppingBag size={14} /> Order Summary</h3>
            <span className="ch-item-badge">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
          </div>

          <div className="ch-item-list">
            <AnimatePresence>
              {items.length === 0 ? (
                <div className="ch-cart-empty">
                  <ShoppingBag size={26} />
                  <p>Cart is empty</p>
                </div>
              ) : (
                items.map((item, idx) => (
                  <motion.div
                    key={`${item._id}-${idx}`}
                    className="ch-item-row"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10, height: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    layout
                  >
                    <div className="ch-item-img-box">
                      <img src={item.image_url} alt={item.name} className="ch-item-img" />
                    </div>
                    <div className="ch-item-info">
                      <p className="ch-item-name">{item.name}</p>

                      {(item.variant_name || item.flavor_name) && (
                        <div className="ch-item-name-sub">
                          {item.variant_name && <span>Variant: {item.variant_name}</span>}
                          {item.flavor_name && <span>Flavour: {item.flavor_name}</span>}
                        </div>
                      )}

                      {item.original_price != null && item.original_price > item.price ? (
                        <div>
                          <p className="ch-item-price-original" style={{ textDecoration: 'line-through', color: '#a59' }}>
                            {formatAmt(item.original_price, userCurrency)}
                          </p>
                          <p className="ch-item-unit-price" style={{ fontWeight: 700 }}>
                            {formatAmt(item.price, userCurrency)} each
                          </p>
                        </div>
                      ) : (
                        <p className="ch-item-unit-price">{formatAmt(item.price, userCurrency)} each</p>
                      ) }
                      <div className="ch-qty-ctrl">
                        <motion.button onClick={() => updateQty(idx, item.quantity - 1)} whileTap={{ scale: 0.85 }}>−</motion.button>
                        <span>{item.quantity}</span>
                        <motion.button onClick={() => updateQty(idx, item.quantity + 1)} whileTap={{ scale: 0.85 }}>+</motion.button>
                      </div>
                    </div>
                    <div className="ch-item-right">
                      <span className="ch-item-name">Subtotal</span>
                      <p className="ch-item-total">
                        {formatAmt(itemSubtotalFor(item), userCurrency)}
                      </p>
                      <motion.button
                        className="ch-remove-btn"
                        onClick={() => removeItem(idx)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Remove"
                      >
                        <X size={10} />
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Order Specials summary (right sidebar) */}
          {specialsCount > 0 && (
            <div className="ch-summary-specials-box">
              <div className="ch-summary-specials-hdr">
                <span><Sparkles size={12} /> Order Specials</span>
                <button className="ch-toggle-btn" onClick={() => setShowSpecialsModal(true)}>Edit</button>
              </div>
              <AnimatePresence>
                {specialsList.map(({ addon, quantity }) => (
                  <motion.div
                    key={addon.id}
                    className="ch-summary-special-row"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    layout
                  >
                    <span className="ch-summary-special-name">{addon.name} ×{quantity}</span>
                    <span className="ch-summary-special-price">
                      {formatAmt(addon.price * quantity, userCurrency)}
                    </span>
                    <button
                      className="ch-summary-special-remove"
                      onClick={() => removeSpecial(addon.id)}
                      title="Remove"
                    >
                      <X size={9} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Reward / Loyalty points */}
          <div className="ch-loyalty-box">
            <div className="ch-loyalty-hdr">
              <span><Gift size={13} /> Use Loyalty Points</span>
              <label className={`ch-switch ${(!loyaltyEligible || promoApplied) ? 'disabled' : ''}`}>
                <input
                  type="checkbox"
                  checked={useLoyaltyPoints}
                  disabled={!loyaltyEligible || promoApplied}
                  onChange={e => handleToggleLoyalty(e.target.checked)}
                />
                <span className="ch-switch-track"><span className="ch-switch-thumb" /></span>
              </label>
            </div>

            {loyaltyLoading ? (
              <div className="ch-addr-loading">
                <Loader2 size={14} className="ch-spinner" />
                <span>Loading your points…</span>
              </div>
            ) : (
              <>
                <div className="ch-loyalty-row">
                  <span>Available Points</span>
                  <strong>{loyaltyInfo?.available_points ?? 0}</strong>
                </div>

                {loyaltyInfo && (
                  <div className="ch-loyalty-row">
                    <span>Reward</span>
                    <strong>{loyaltyInfo.reward_percent}% off subtotal</strong>
                  </div>
                )}

                {useLoyaltyPoints && loyaltyDiscount > 0 && (
                  <div className="ch-loyalty-row">
                    <span>Estimated Discount</span>
                    <strong className="ch-discount-val">
                      −{formatAmt(loyaltyDiscount, userCurrency)}
                    </strong>
                  </div>
                )}

                {promoApplied && (
                  <p className="ch-loyalty-note">
                    A promo code is applied. Remove it to use loyalty points instead.
                  </p>
                )}
                {!promoApplied && !loyaltyEligible && loyaltyInfo?.message && (
                  <p className="ch-loyalty-note">{loyaltyInfo.message}</p>
                )}
              </>
            )}
          </div>

          {/* Price breakdown */}
          <div className="ch-price-breakdown">
            <div className="ch-price-row">
              <span>Products Total</span>
              <span>{formatAmt(subtotal, userCurrency)}</span>
            </div>

            {promoApplied && promoDiscount > 0 && (
              <motion.div
                className="ch-price-row ch-discount-row"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span><Tag size={10} /> Promo Discount</span>
                <span className="ch-discount-val">−{formatAmt(promoDiscount, userCurrency)}</span>
              </motion.div>
            )}

            {useLoyaltyPoints && loyaltyDiscount > 0 && (
              <motion.div
                className="ch-price-row ch-discount-row"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span><Gift size={10} /> Loyalty Discount</span>
                <span className="ch-discount-val">−{formatAmt(loyaltyDiscount, userCurrency)}</span>
              </motion.div>
            )}

            <div className="ch-price-row">
              <span>Delivery</span>
              <span>
                {deliveryStatus.state === 'idle' && '—'}
                {deliveryStatus.state === 'checking' && <Loader2 size={10} className="ch-spinner" />}
                {deliveryStatus.state === 'unavailable' && <span className="ch-fee-na">N/A</span>}
                {deliveryStatus.state === 'below_min' && (
                  <span className="ch-fee-warn">{formatAmt(deliveryStatus.charge, userCurrency)}</span>
                )}
                {deliveryStatus.state === 'available' && (
                  <span className={deliveryFee === 0 ? 'ch-free' : ''}>
                    {deliveryFee === 0 ? 'FREE' : formatAmt(deliveryFee, userCurrency)}
                  </span>
                )}
              </span>
            </div>

            {orderAddonsTotal > 0 && (
              <div className="ch-price-row">
                <span><Sparkles size={10} /> Order Specials</span>
                <span>{formatAmt(orderAddonsTotal, userCurrency)}</span>
              </div>
            )}

            <div className="ch-price-divider" />
            <div className="ch-price-row ch-price-total">
              <span>Grand Total</span>
              <strong>{formatAmt(total, userCurrency)}</strong>
            </div>
          </div>

          {deliveryStatus.state === 'below_min' && (
            <div className="ch-nudge ch-nudge-warn">
              <AlertCircle size={12} />
              <span>Add {formatAmt(deliveryStatus.min_order - subtotal, userCurrency)} more to place order</span>
            </div>
          )}

          {deliveryStatus.state === 'available' &&
            deliveryFee > 0 &&
            deliveryStatus.min_order > 0 &&
            subtotal < deliveryStatus.min_order && (
              <div className="ch-nudge ch-nudge-ok">
                ✨ Add {formatAmt(deliveryStatus.min_order - subtotal, userCurrency)} for free delivery
              </div>
            )}
        </aside>
      </div>

      {/* ═══ ADDRESS MODAL (list / edit / delete / create) ═══ */}
      <AnimatePresence>
        {showAddrModal && (
          <AddressModal
            open={showAddrModal}
            onClose={() => setShowAddrModal(false)}
            addresses={addresses}
            areas={areasList}
            selectedId={selectedAddrId}
            onSelect={handleSelectAddress}
            onCreate={handleCreateAddress}
            onUpdate={handleUpdateAddress}
            onDelete={handleDeleteAddress}
            savingAddr={savingAddr}
            deletingId={deletingId}
            startInForm={addrModalStartInForm}
          />
        )}
      </AnimatePresence>

      {/* ═══ ORDER SPECIALS MODAL (order-level add-ons) ═══ */}
      <AnimatePresence>
        {showSpecialsModal && (
          <OrderSpecialsModal
            open={showSpecialsModal}
            onClose={() => setShowSpecialsModal(false)}
            addons={allAddons}
            loading={addonsLoading}
            selected={Object.fromEntries(specialsList.map(s => [s.addon.id, s.quantity]))}
            onChangeQty={setSpecialQty}
            currency={userCurrency}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Checkout;