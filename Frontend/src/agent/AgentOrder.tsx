import React, { useEffect, useMemo, useState, useCallback } from "react";
import "./agentorder.css";

// ─────────────────────────────────────────────────────────────────────────────
// EXISTING SERVICES ONLY (agentService.ts, areaService.ts) — nothing here
// creates or modifies those services. addressService.ts is a new, minimal
// file added alongside this component (see accompanying message).
// ─────────────────────────────────────────────────────────────────────────────

import {
  getAgentDashboard,
  getAgentCatalog,
  createAgentOrder,
  type Agent,
  type AgentProduct,
  type BakeryProduct,
  type CreateAgentOrderPayload,
  type AgentOrderItemInput,
} from "../services/agentService";

// Areas — same assumption as your existing SalesAgentCreateOrder file: not
// included in what you shared, so point this at your real areas export if
// the path/shape differs.
import { getAreas } from "../services/areaService";

import {
  getMyAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  type Address,
} from "../services/addressService";

type AddressInput = Omit<Address, "id" | "user_id">;

// =============================================================================
// ─── TYPES ───────────────────────────────────────────────────────────────────
// =============================================================================

interface AreaOption {
  id: number;
  name: string;
  currency?: string;
  delivery_charge?: number;
}

type ProductType = "NORMAL" | "AGENT";

interface CartItem {
  cartId: string;
  productId: number;
  productType: ProductType;
  name: string;
  image?: string;
  originalPrice: number;
  discountPercentage: number; // 0 for AGENT products
  discountAmount: number; // per unit
  finalPrice: number; // per unit, after discount
  quantity: number;
  currency: string;
}

type DeliveryMethod = "PICKUP" | "DELIVERY";

type PaymentMethodOption = "COD" | "CARD" | "KNET" | "UPI" | "LINK";

interface FormErrors {
  deliveryMethod?: string;
  address?: string;
  items?: string;
  paymentMethod?: string;
  pickupDate?: string;
  pickupTimeSlot?: string;
  deliveryDate?: string;
  deliveryTimeSlot?: string;
}

interface AddressFormState {
  area_id: number | null;
  street: string;
  country: string;
  block: string;
  avenue: string;
  building: string;
  floor: string;
  apartment: string;
  delivery_notes: string;
}

/**
 * CreateAgentOrderPayload (agentService.ts) doesn't currently have fields for
 * order_source, delivery_method, agent-side notes, or a discount summary.
 * This local type is a strict superset — assigning an object of this shape
 * to the real payload type still type-checks, so createAgentOrder() accepts
 * it as-is. Add matching columns/handling on the backend to actually persist
 * these extra fields; until then they'll simply be ignored by the API.
 */
interface AgentOrderPayloadExtended extends CreateAgentOrderPayload {
  order_source?: "AGENT_SELF";
  delivery_method?: DeliveryMethod;
  agent_notes?: string;
  agent_discount_percentage?: number;
  discount_total?: number;
  delivery_charge?: number;
  subtotal?: number;
  grand_total?: number;
}

const TIME_SLOTS = [
  "9:00 AM - 11:00 AM",
  "11:00 AM - 1:00 PM",
  "1:00 PM - 3:00 PM",
  "3:00 PM - 5:00 PM",
  "5:00 PM - 7:00 PM",
  "7:00 PM - 9:00 PM",
];

const PAYMENT_METHODS: { value: PaymentMethodOption; label: string }[] = [
  { value: "COD", label: "Cash" },
  { value: "CARD", label: "Card" },
  { value: "KNET", label: "KNET" },
  { value: "UPI", label: "UPI" },
  { value: "LINK", label: "Other" },
];

const EMPTY_ADDRESS_FORM: AddressFormState = {
  area_id: null,
  street: "",
  country: "",
  block: "",
  avenue: "",
  building: "",
  floor: "",
  apartment: "",
  delivery_notes: "",
};

// =============================================================================
// ─── HELPERS ─────────────────────────────────────────────────────────────────
// =============================================================================

const makeCartId = (): string =>
  `cart_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const formatMoney = (value: number): string => (value || 0).toFixed(2);

const cartKey = (productId: number, type: ProductType) => `${type}-${productId}`;

// =============================================================================
// ─── COMPONENT ───────────────────────────────────────────────────────────────
// =============================================================================

const AgentOrder: React.FC = () => {
  // ── Logged-in agent (auto-loaded, never typed manually) ─────────────────
  const [agent, setAgent] = useState<Agent | null>(null);
  const [agentLoading, setAgentLoading] = useState<boolean>(true);
  const agentDiscount = agent?.default_discount ?? 0;

  // ── Addresses ────────────────────────────────────────────────────────────
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState<boolean>(true);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  const [addressModalOpen, setAddressModalOpen] = useState<boolean>(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [addressForm, setAddressForm] = useState<AddressFormState>(EMPTY_ADDRESS_FORM);
  const [addressSaving, setAddressSaving] = useState<boolean>(false);
  const [addressFormError, setAddressFormError] = useState<string>("");

  // ── Areas (for address form + delivery charge lookup) ──────────────────
  const [areas, setAreas] = useState<AreaOption[]>([]);
  const [areasLoading, setAreasLoading] = useState<boolean>(true);

  // ── Delivery method ──────────────────────────────────────────────────────
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("PICKUP");
  const [pickupDate, setPickupDate] = useState<string>("");
  const [pickupTimeSlot, setPickupTimeSlot] = useState<string>("");
  const [deliveryDate, setDeliveryDate] = useState<string>("");
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState<string>("");

  // ── Catalog: normal products + agent's own products ─────────────────────
  const [products, setProducts] = useState<BakeryProduct[]>([]);
  const [agentProducts, setAgentProducts] = useState<AgentProduct[]>([]);
  const [catalogLoading, setCatalogLoading] = useState<boolean>(true);
  const [catalogError, setCatalogError] = useState<string>("");

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [draftQuantities, setDraftQuantities] = useState<Record<string, number>>({});

  // ── Cart ─────────────────────────────────────────────────────────────────
  const [cart, setCart] = useState<CartItem[]>([]);

  // ── Payment / notes ──────────────────────────────────────────────────────
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodOption | "">("");
  const [notes, setNotes] = useState<string>("");
  const [currency, setCurrency] = useState<string>("KWD");

  // ── Submission ───────────────────────────────────────────────────────────
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [submitError, setSubmitError] = useState<string>("");

  // ── Load agent profile, addresses, areas, catalog on mount ─────────────
  useEffect(() => {
    let cancelled = false;

    const loadAgent = async () => {
      setAgentLoading(true);
      try {
        const dashboard = await getAgentDashboard();
        if (!cancelled) setAgent(dashboard.agent);
      } catch (err) {
        if (!cancelled) setSubmitError("Unable to load your agent profile. Please refresh.");
      } finally {
        if (!cancelled) setAgentLoading(false);
      }
    };

    const loadAddresses = async () => {
      setAddressesLoading(true);
      try {
        const list = await getMyAddresses();
        if (!cancelled) {
          setAddresses(list);
          if (list[0]?.id) setSelectedAddressId(list[0].id);
        }
      } catch (err) {
        if (!cancelled) setCatalogError((prev) => prev || "Unable to load your saved addresses.");
      } finally {
        if (!cancelled) setAddressesLoading(false);
      }
    };

    const loadAreas = async () => {
      setAreasLoading(true);
      try {
        const list = await getAreas();
        if (!cancelled) setAreas(list as AreaOption[]);
      } catch (err) {
        if (!cancelled) setCatalogError((prev) => prev || "Unable to load delivery areas.");
      } finally {
        if (!cancelled) setAreasLoading(false);
      }
    };

    const loadCatalog = async () => {
      setCatalogLoading(true);
      setCatalogError("");
      try {
        const catalog = await getAgentCatalog(currency);
        if (!cancelled) {
          setProducts(catalog.products || []);
          setAgentProducts(catalog.agent_products || []);
        }
      } catch (err) {
        if (!cancelled) setCatalogError((prev) => prev || "Unable to load the menu. Please refresh and try again.");
      } finally {
        if (!cancelled) setCatalogLoading(false);
      }
    };

    loadAgent();
    loadAddresses();
    loadAreas();
    loadCatalog();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Derived: selected address + its area (drives delivery charge) ──────
  const selectedAddress = useMemo(
    () => addresses.find((a) => a.id === selectedAddressId) || null,
    [addresses, selectedAddressId]
  );

  const selectedArea = useMemo(
    () => (selectedAddress ? areas.find((a) => a.id === selectedAddress.area_id) || null : null),
    [selectedAddress, areas]
  );

  useEffect(() => {
    if (selectedArea?.currency) setCurrency(selectedArea.currency);
  }, [selectedArea]);

  const deliveryCharge = useMemo(() => {
    if (deliveryMethod !== "DELIVERY") return 0;
    return selectedArea?.delivery_charge ?? 0;
  }, [deliveryMethod, selectedArea]);

  // ── Categories across both menus ────────────────────────────────────────
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      const c = (p as any).category;
      if (c) set.add(String(c));
    });
    agentProducts.forEach((p) => {
      const c = (p as any).category;
      if (c) set.add(String(c));
    });
    return Array.from(set);
  }, [products, agentProducts]);

  // ── Filtering (search + category) applies to both sections ─────────────
  const matchesFilters = useCallback(
    (name: string, category: unknown) => {
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch = !term || (name || "").toLowerCase().includes(term);
      const matchesCategory = categoryFilter === "ALL" || String(category || "") === categoryFilter;
      return matchesSearch && matchesCategory;
    },
    [searchTerm, categoryFilter]
  );

  const filteredProducts = useMemo(
    () => products.filter((p) => matchesFilters(p.name, (p as any).category)),
    [products, matchesFilters]
  );

  const filteredAgentProducts = useMemo(
    () => agentProducts.filter((p) => matchesFilters(p.name, (p as any).category)),
    [agentProducts, matchesFilters]
  );

  // ── Draft quantity (per product card, before "Add") ─────────────────────
  const getDraftQty = (key: string) => draftQuantities[key] ?? 1;

  const changeDraftQty = (key: string, delta: number) => {
    setDraftQuantities((prev) => ({
      ...prev,
      [key]: Math.max(1, (prev[key] ?? 1) + delta),
    }));
  };

  // ── Discount math (display + cart only — never touches product prices) ──
  const getDiscountedPrice = (price: number) => {
    const discountAmount = (price * agentDiscount) / 100;
    return { discountAmount, finalPrice: price - discountAmount };
  };

  // ── Add to cart (merges into an existing row for the same product) ─────
  const mergeOrAddToCart = (item: Omit<CartItem, "cartId">) => {
    setCart((prev) => {
      const idx = prev.findIndex(
        (c) => c.productId === item.productId && c.productType === item.productType
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + item.quantity };
        return next;
      }
      return [...prev, { ...item, cartId: makeCartId() }];
    });
    setErrors((prev) => ({ ...prev, items: undefined }));
  };

  const addNormalProductToCart = (product: BakeryProduct) => {
    const key = cartKey(product.id, "NORMAL");
    const qty = getDraftQty(key);
    const price = product.price || 0;
    const { discountAmount, finalPrice } = getDiscountedPrice(price);
    mergeOrAddToCart({
      productId: product.id,
      productType: "NORMAL",
      name: product.name,
      image: (product as any).image_url,
      originalPrice: price,
      discountPercentage: agentDiscount,
      discountAmount,
      finalPrice,
      quantity: qty,
      currency, 
    });
    setDraftQuantities((prev) => ({ ...prev, [key]: 1 }));
  };

  const addAgentProductToCart = (product: AgentProduct) => {
    const key = cartKey(product.id, "AGENT");
    const qty = getDraftQty(key);
    const price = product.price || 0;
    mergeOrAddToCart({
      productId: product.id,
      productType: "AGENT",
      name: product.name,
      image: product.image || undefined,
      originalPrice: price,
      discountPercentage: 0,
      discountAmount: 0,
      finalPrice: price,
      quantity: qty,
      currency:"KWD", 
    });
    setDraftQuantities((prev) => ({ ...prev, [key]: 1 }));
  };

  // ── Cart row handlers ────────────────────────────────────────────────────
  const changeCartQuantity = (cartId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.cartId === cartId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  };

  const removeCartItem = (cartId: string) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  // ── Totals ───────────────────────────────────────────────────────────────
  const originalSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0),
    [cart]
  );

  const discountTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.discountAmount * item.quantity, 0),
    [cart]
  );

  const subtotalAfterDiscount = originalSubtotal - discountTotal;

  const grandTotal = useMemo(
    () => Math.max(subtotalAfterDiscount + deliveryCharge, 0),
    [subtotalAfterDiscount, deliveryCharge]
  );

  // ── Address CRUD ─────────────────────────────────────────────────────────
  const openAddAddressModal = () => {
    setEditingAddressId(null);
    setAddressForm(EMPTY_ADDRESS_FORM);
    setAddressFormError("");
    setAddressModalOpen(true);
  };

  const openEditAddressModal = (addr: Address) => {
    setEditingAddressId(addr.id ?? null);
    setAddressForm({
      area_id: addr.area_id,
      street: addr.street || "",
      country: addr.country || "",
      block: addr.block || "",
      avenue: addr.avenue || "",
      building: addr.building || "",
      floor: addr.floor || "",
      apartment: addr.apartment || "",
      delivery_notes: addr.delivery_notes || "",
    });
    setAddressFormError("");
    setAddressModalOpen(true);
  };

  const closeAddressModal = () => {
    setAddressModalOpen(false);
    setEditingAddressId(null);
    setAddressForm(EMPTY_ADDRESS_FORM);
    setAddressFormError("");
  };

  const updateAddressField = (field: keyof AddressFormState, value: string) => {
    setAddressForm((prev) => ({
      ...prev,
      [field]: field === "area_id" ? (value ? Number(value) : null) : value,
    }));
  };

  const saveAddress = async () => {
    if (!addressForm.area_id) {
      setAddressFormError("Please select an area.");
      return;
    }
    if (!addressForm.street.trim() || !addressForm.country.trim()) {
      setAddressFormError("Street and country are required.");
      return;
    }

    const payload: AddressInput = {
      area_id: addressForm.area_id,
      street: addressForm.street.trim(),
      country: addressForm.country.trim(),
      block: addressForm.block.trim() || undefined,
      avenue: addressForm.avenue.trim() || undefined,
      building: addressForm.building.trim() || undefined,
      floor: addressForm.floor.trim() || undefined,
      apartment: addressForm.apartment.trim() || undefined,
      delivery_notes: addressForm.delivery_notes.trim() || undefined,
    };

    setAddressSaving(true);
    setAddressFormError("");
    try {
      if (editingAddressId) {
        const updated = await updateAddress(editingAddressId, payload);
        setAddresses((prev) => prev.map((a) => (a.id === editingAddressId ? updated : a)));
      } else {
        const created = await createAddress(payload);
        setAddresses((prev) => [...prev, created]);
        setSelectedAddressId(created.id);
      }
      closeAddressModal();
    } catch (err) {
      setAddressFormError("Could not save this address. Please check the details and try again.");
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      await deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      if (selectedAddressId === id) {
        setSelectedAddressId(null);
      }
    } catch (err) {
      setSubmitError("Could not delete this address. Please try again.");
    }
  };

  // ── Validation ───────────────────────────────────────────────────────────
  const validateForm = (): boolean => {
    const next: FormErrors = {};
    if (!deliveryMethod) {
      next.deliveryMethod = "Choose Pickup or Delivery";
    }

    if (deliveryMethod === "PICKUP") {
      if (!pickupDate) {
        next.pickupDate = "Pickup date is required";
      }
      if (!pickupTimeSlot) {
        next.pickupTimeSlot = "Pickup time is required";
      }
    }

    if (deliveryMethod === "DELIVERY") {
      if (!selectedAddressId) {
        next.address = "Select a delivery address, or add a new one";
      }
      if (!deliveryDate) {
        next.deliveryDate = "Delivery date is required";
      }
      if (!deliveryTimeSlot) {
        next.deliveryTimeSlot = "Delivery time slot is required";
      }
    }

    if (cart.length === 0) {
      next.items = "Add at least one product to the cart";
    }
    // Payment method is intentionally not required for agent-created orders.
    // The backend defaults to COD when payment_method is not provided.
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // ── Payload builder ──────────────────────────────────────────────────────
  const buildPayload = (): AgentOrderPayloadExtended => {
    const items: AgentOrderItemInput[] = cart.map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
      custom_json: {
        product_type: item.productType,
        original_price: item.originalPrice,
        discount_percentage: item.discountPercentage,
        discount_amount: item.discountAmount,
        final_price: item.finalPrice,
        line_total: Number((item.finalPrice * item.quantity).toFixed(2)),
      },
    }));

    const payload: AgentOrderPayloadExtended = {
      customer_id: agent!.id, // agent is ordering for themselves
      // address_id: selectedAddressId ?? (deliveryMethod === "PICKUP" ? addresses[0]?.id : undefined),
      address_id: deliveryMethod === "DELIVERY" ? (selectedAddressId ?? undefined) : undefined,
      items,
      payment_method: paymentMethod || undefined,
      currency: currency as CreateAgentOrderPayload["currency"],
      delivery_date: deliveryMethod === "PICKUP" ? pickupDate || undefined : deliveryDate || undefined,
      delivery_time_slot: deliveryMethod === "PICKUP" ? pickupTimeSlot || undefined : deliveryTimeSlot || undefined,

      // extended / not-yet-backed-by-the-real-type fields:
      order_source: "AGENT_SELF",
      delivery_method: deliveryMethod || undefined,
      agent_notes: notes.trim() || undefined,
      agent_discount_percentage: agentDiscount,
      discount_total: Number(discountTotal.toFixed(2)),
      delivery_charge: deliveryCharge,
      subtotal: Number(originalSubtotal.toFixed(2)),
      grand_total: Number(grandTotal.toFixed(2)),
    };

    return payload;
  };

  const resetOrderState = () => {
    setCart([]);
    setPaymentMethod("");
    setNotes("");
    setDeliveryMethod("PICKUP");
    setPickupDate("");
    setPickupTimeSlot("");
    setDeliveryDate("");
    setDeliveryTimeSlot("");
    setErrors({});
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleCreateOrder = async () => {
    setSuccessMessage("");
    setSubmitError("");
    if (!agent) {
      setSubmitError("Your agent profile hasn't finished loading yet.");
      return;
    }
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = buildPayload();
      await createAgentOrder(payload);
      setSuccessMessage("Order created successfully.");
      resetOrderState();
    } catch (err) {
      setSubmitError("Could not create the order. Please check the details and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render helpers ───────────────────────────────────────────────────────

  const renderNormalProductCard = (product: BakeryProduct) => {
    const key = cartKey(product.id, "NORMAL");
    const price = product.price || 0;
    const { finalPrice } = getDiscountedPrice(price);
    const outOfStock = (product as any).stock !== undefined && (product as any).stock <= 0;

    return (
      <div className="ao-product-card" key={key}>
        {agentDiscount > 0 && <span className="ao-badge ao-badge-discount">{agentDiscount}% OFF</span>}
        <div className="ao-product-image-wrap">
          {(product as any).image_url ? (
            <img src={(product as any).image_url} alt={product.name} className="ao-product-image" />
          ) : (
            <div className="ao-product-image-placeholder">No Image</div>
          )}
        </div>
        <div className="ao-product-info">
          <p className="ao-product-name">{product.name}</p>
          {(product as any).description && (
            <p className="ao-product-desc">{(product as any).description}</p>
          )}
          <div className="ao-price-row">
            {agentDiscount > 0 ? (
              <>
                <span className="ao-price-original">KWD {formatMoney(price)}</span>
                <span className="ao-price-final">KWD {formatMoney(finalPrice)}</span>
              </>
            ) : (
              <span className="ao-price-final">{currency} {formatMoney(price)}</span>
            )}
          </div>
        </div>
        <div className="ao-card-footer">
          <div className="ao-qty-control">
            <button type="button" className="ao-qty-btn" onClick={() => changeDraftQty(key, -1)} aria-label="Decrease quantity">−</button>
            <span className="ao-qty-value">{getDraftQty(key)}</span>
            <button type="button" className="ao-qty-btn" onClick={() => changeDraftQty(key, 1)} aria-label="Increase quantity">+</button>
          </div>
          <button
            type="button"
            className="ao-btn ao-btn-add"
            disabled={outOfStock}
            onClick={() => addNormalProductToCart(product)}
          >
            {outOfStock ? "Out of Stock" : "Add"}
          </button>
        </div>
      </div>
    );
  };

  const renderAgentProductCard = (product: AgentProduct) => {
    const key = cartKey(product.id, "AGENT");
    const price = product.price || 0;

    return (
      <div className="ao-product-card" key={key}>
        <span className="ao-badge ao-badge-exclusive">Agent Exclusive</span>
        <div className="ao-product-image-wrap">
          {product.image ? (
            <img src={product.image} alt={product.name} className="ao-product-image" />
          ) : (
            <div className="ao-product-image-placeholder">No Image</div>
          )}
        </div>
        <div className="ao-product-info">
          <p className="ao-product-name">{product.name}</p>
          {product.description && <p className="ao-product-desc">{product.description}</p>}
          <div className="ao-price-row">
            <span className="ao-price-final">KWD{formatMoney(price)}</span>
          </div>
        </div>
        <div className="ao-card-footer">
          <div className="ao-qty-control">
            <button type="button" className="ao-qty-btn" onClick={() => changeDraftQty(key, -1)} aria-label="Decrease quantity">−</button>
            <span className="ao-qty-value">{getDraftQty(key)}</span>
            <button type="button" className="ao-qty-btn" onClick={() => changeDraftQty(key, 1)} aria-label="Increase quantity">+</button>
          </div>
          <button type="button" className="ao-btn ao-btn-add" onClick={() => addAgentProductToCart(product)}>
            Add
          </button>
        </div>
      </div>
    );
  };

  const renderProductSkeletons = (count: number) => (
    <div className="ao-product-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div className="ao-product-card ao-skeleton-card" key={i}>
          <div className="ao-skeleton ao-skeleton-image" />
          <div className="ao-skeleton ao-skeleton-line" />
          <div className="ao-skeleton ao-skeleton-line ao-skeleton-line-short" />
        </div>
      ))}
    </div>
  );

  // =============================================================================
  // ─── JSX ─────────────────────────────────────────────────────────────────────
  // =============================================================================

  return (
    <div className="ao-page">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="ao-header">
        <p className="ao-eyebrow">Agent Self-Order</p>
        <h1 className="ao-title">Place Your Order</h1>
      </header>

      {successMessage && <div className="ao-toast ao-toast-success">{successMessage}</div>}
      {(submitError || catalogError) && (
        <div className="ao-toast ao-toast-error">{submitError || catalogError}</div>
      )}

      <div className="ao-layout">
        {/* ── Main column ────────────────────────────────────────────── */}
        <div className="ao-main-column">
          {/* Card — Agent Info (read-only, auto-filled) */}
          <section className="ao-card">
            <h2 className="ao-card-title">Your Details</h2>
            {agentLoading ? (
              <p className="ao-muted">Loading your profile…</p>
            ) : agent ? (
              <div className="ao-agent-info">
                <div className="ao-agent-avatar">{(agent.first_name || "A").charAt(0)}</div>
                <div className="ao-agent-meta">
                  <p className="ao-agent-name">{agent.first_name} {agent.last_name}</p>
                  <p className="ao-agent-sub">{agent.email} · {agent.phone_no}</p>
                  <p className="ao-agent-sub">Agent ID: {agent.id}</p>
                </div>
                {agentDiscount > 0 && (
                  <span className="ao-badge ao-badge-discount ao-agent-discount-badge">
                    {agentDiscount}% agent discount
                  </span>
                )}
              </div>
            ) : (
              <p className="ao-muted">We couldn't load your profile.</p>
            )}
          </section>

          {/* Card — Delivery Method */}
          <section className="ao-card">
            <h2 className="ao-card-title">Delivery Method</h2>
            {errors.deliveryMethod && <span className="ao-error-text">{errors.deliveryMethod}</span>}

            <div className="ao-delivery-cards">
              <button
                type="button"
                className={`ao-delivery-card ${deliveryMethod === "PICKUP" ? "ao-delivery-card-active" : ""}`}
                onClick={() => setDeliveryMethod("PICKUP")}
              >
                <span className="ao-delivery-icon">🏬</span>
                <span className="ao-delivery-label">Pickup</span>
                <span className="ao-delivery-sub">No delivery charge</span>
              </button>
              <button
                type="button"
                className={`ao-delivery-card ${deliveryMethod === "DELIVERY" ? "ao-delivery-card-active" : ""}`}
                onClick={() => setDeliveryMethod("DELIVERY")}
              >
                <span className="ao-delivery-icon">🚚</span>
                <span className="ao-delivery-label">Delivery</span>
                <span className="ao-delivery-sub">Charge based on your area</span>
              </button>
            </div>

            {deliveryMethod === "PICKUP" && (
              <div className="ao-address-section">
                <div className="ao-field-grid ao-delivery-time-grid">
                  <div className="ao-field">
                    <label>Pickup Date *</label>
                    <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
                    {errors.pickupDate && <span className="ao-error-text">{errors.pickupDate}</span>}
                  </div>
                  <div className="ao-field">
                    <label>Pickup Time *</label>
                    <select value={pickupTimeSlot} onChange={(e) => setPickupTimeSlot(e.target.value)}>
                      <option value="">Select a pickup time</option>
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                    {errors.pickupTimeSlot && <span className="ao-error-text">{errors.pickupTimeSlot}</span>}
                  </div>
                </div>
              </div>
            )}

            {deliveryMethod === "DELIVERY" && (
              <div className="ao-address-section">
                {errors.address && <span className="ao-error-text">{errors.address}</span>}

                {addressesLoading ? (
                  <p className="ao-muted">Loading your addresses…</p>
                ) : addresses.length === 0 ? (
                  <p className="ao-muted">You don't have any saved addresses yet.</p>
                ) : (
                  <div className="ao-address-list">
                    {addresses.map((addr) => {
                      const area = addr.area || areas.find((a) => a.id === addr.area_id);
                      const lineParts = [
                        addr.block,
                        addr.avenue,
                        addr.street,
                        addr.building ? `Building ${addr.building}` : null,
                        addr.floor ? `Floor ${addr.floor}` : null,
                        addr.apartment ? `Apt ${addr.apartment}` : null,
                      ].filter(Boolean);
                      return (
                        <div
                          key={addr.id}
                          className={`ao-address-card ${selectedAddressId === addr.id ? "ao-address-card-active" : ""}`}
                          onClick={() => setSelectedAddressId(addr.id as number)}
                        >
                          <div className="ao-address-card-main">
                            <p className="ao-address-line">{lineParts.join(", ")}</p>
                            <p className="ao-address-sub">
                              {area?.name || "Unknown area"} · {addr.country}
                              {addr.delivery_notes ? ` · ${addr.delivery_notes}` : ""}
                            </p>
                          </div>
                          <div className="ao-address-card-actions" onClick={(e) => e.stopPropagation()}>
                            <button type="button" className="ao-icon-btn" onClick={() => openEditAddressModal(addr)} aria-label="Edit address">✎</button>
                            <button type="button" className="ao-icon-btn ao-icon-btn-danger" onClick={() => handleDeleteAddress(addr.id as number)} aria-label="Delete address">✕</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <button type="button" className="ao-btn ao-btn-secondary ao-add-address-btn" onClick={openAddAddressModal}>
                  + Add New Address
                </button>

                <div className="ao-field-grid ao-delivery-time-grid">
                  <div className="ao-field">
                    <label>Delivery Date *</label>
                    <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
                    {errors.deliveryDate && <span className="ao-error-text">{errors.deliveryDate}</span>}
                  </div>
                  <div className="ao-field">
                    <label>Delivery Time Slot *</label>
                    <select value={deliveryTimeSlot} onChange={(e) => setDeliveryTimeSlot(e.target.value)}>
                      <option value="">Select a time slot</option>
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                    {errors.deliveryTimeSlot && <span className="ao-error-text">{errors.deliveryTimeSlot}</span>}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Card — Menu */}
          <section className="ao-card">
            <h2 className="ao-card-title">Menu</h2>
            {errors.items && <span className="ao-error-text">{errors.items}</span>}

            <input
              type="text"
              className="ao-search-bar"
              placeholder="Search products across both menus..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {categories.length > 0 && (
              <div className="ao-category-chips">
                <button
                  type="button"
                  className={`ao-chip ${categoryFilter === "ALL" ? "ao-chip-active" : ""}`}
                  onClick={() => setCategoryFilter("ALL")}
                >
                  All
                </button>
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`ao-chip ${categoryFilter === c ? "ao-chip-active" : ""}`}
                    onClick={() => setCategoryFilter(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}

            <h3 className="ao-subsection-title">Our Menu {agentDiscount > 0 ? `(${agentDiscount}% off for you)` : ""}</h3>
            {catalogLoading ? (
              renderProductSkeletons(4)
            ) : filteredProducts.length === 0 ? (
              <p className="ao-muted">No products match your search.</p>
            ) : (
              <div className="ao-product-grid">{filteredProducts.map(renderNormalProductCard)}</div>
            )}

            <h3 className="ao-subsection-title">Your Exclusive Products</h3>
            {catalogLoading ? (
              renderProductSkeletons(4)
            ) : filteredAgentProducts.length === 0 ? (
              <p className="ao-muted">No exclusive products assigned to you yet.</p>
            ) : (
              <div className="ao-product-grid">{filteredAgentProducts.map(renderAgentProductCard)}</div>
            )}
          </section>

          {/* Card — Cart */}
          <section className="ao-card">
            <h2 className="ao-card-title">Cart</h2>
            {cart.length === 0 ? (
              <div className="ao-empty-cart">
                <div className="ao-empty-cart-icon">🛒</div>
                <p className="ao-muted">Your cart is empty. Add something delicious above.</p>
              </div>
            ) : (
              <div className="ao-cart-table-wrap">
                <table className="ao-cart-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Original</th>
                      <th>Discount</th>
                      <th>Final</th>
                      <th>Subtotal</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => (
                      <tr key={item.cartId}>
                        <td>
                          <div className="ao-cart-product-name">{item.name}</div>
                          <span className={`ao-tag ${item.productType === "AGENT" ? "ao-tag-agent" : "ao-tag-normal"}`}>
                            {item.productType === "AGENT" ? "Agent Exclusive" : "Normal"}
                          </span>
                        </td>
                        <td>
                          <div className="ao-qty-control">
                            <button type="button" className="ao-qty-btn" onClick={() => changeCartQuantity(item.cartId, -1)}>−</button>
                            <span className="ao-qty-value">{item.quantity}</span>
                            <button type="button" className="ao-qty-btn" onClick={() => changeCartQuantity(item.cartId, 1)}>+</button>
                          </div>
                        </td>
                        <td>{currency} {formatMoney(item.originalPrice)}</td>
                        <td>{item.discountPercentage > 0 ? `${item.discountPercentage}% (-${currency} ${formatMoney(item.discountAmount)})` : "—"}</td>
                        <td>{currency} {formatMoney(item.finalPrice)}</td>
                        <td>{currency} {formatMoney(item.finalPrice * item.quantity)}</td>
                        <td>
                          <button type="button" className="ao-btn-remove" onClick={() => removeCartItem(item.cartId)} aria-label="Remove item">✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Card — Notes */}
          <section className="ao-card">
            <h2 className="ao-card-title">Notes</h2>
            <div className="ao-field">
              <label>Notes for this order</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anything the kitchen or delivery team should know…"
              />
            </div>
          </section>
        </div>

        {/* ── Sticky sidebar ─────────────────────────────────────────── */}
        <aside className="ao-sidebar">
          <section className="ao-card ao-summary-card">
            <h2 className="ao-card-title">Order Summary</h2>

            <div className="ao-summary-row">
              <span>Subtotal</span>
              <span>{currency} {formatMoney(originalSubtotal)}</span>
            </div>
            <div className="ao-summary-row ao-summary-discount">
              <span>Agent Discount Total</span>
              <span>-{currency} {formatMoney(discountTotal)}</span>
            </div>
            <div className="ao-summary-row">
              <span>Delivery Charge</span>
              <span>{currency} {formatMoney(deliveryCharge)}</span>
            </div>
            <div className="ao-summary-row ao-summary-grand-total">
              <span>Grand Total</span>
              <span>{currency} {formatMoney(grandTotal)}</span>
            </div>

          </section>

          <div className="ao-action-buttons">
            <button
              type="button"
              className="ao-btn ao-btn-primary ao-btn-full"
              onClick={handleCreateOrder}
              disabled={isSubmitting || agentLoading}
            >
              {isSubmitting ? "Creating…" : "Create Order"}
            </button>
          </div>
        </aside>
      </div>

      {/* ── Address add/edit modal ───────────────────────────────────── */}
      {addressModalOpen && (
        <div className="ao-modal-overlay" onClick={closeAddressModal}>
          <div className="ao-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="ao-modal-title">{editingAddressId ? "Edit Address" : "Add New Address"}</h3>

            {addressFormError && <span className="ao-error-text">{addressFormError}</span>}

            <div className="ao-field-grid">
              <div className="ao-field ao-field-full">
                <label>Area *</label>
                <select
                  value={addressForm.area_id ?? ""}
                  onChange={(e) => updateAddressField("area_id", e.target.value)}
                  disabled={areasLoading}
                >
                  <option value="">{areasLoading ? "Loading areas…" : "Select an area"}</option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div className="ao-field">
                <label>Street *</label>
                <input type="text" value={addressForm.street} onChange={(e) => updateAddressField("street", e.target.value)} />
              </div>
              <div className="ao-field">
                <label>Country *</label>
                <input type="text" value={addressForm.country} onChange={(e) => updateAddressField("country", e.target.value)} />
              </div>
              <div className="ao-field">
                <label>Block</label>
                <input type="text" value={addressForm.block} onChange={(e) => updateAddressField("block", e.target.value)} />
              </div>
              <div className="ao-field">
                <label>Avenue</label>
                <input type="text" value={addressForm.avenue} onChange={(e) => updateAddressField("avenue", e.target.value)} />
              </div>
              <div className="ao-field">
                <label>Building</label>
                <input type="text" value={addressForm.building} onChange={(e) => updateAddressField("building", e.target.value)} />
              </div>
              <div className="ao-field">
                <label>Floor</label>
                <input type="text" value={addressForm.floor} onChange={(e) => updateAddressField("floor", e.target.value)} />
              </div>
              <div className="ao-field">
                <label>Apartment</label>
                <input type="text" value={addressForm.apartment} onChange={(e) => updateAddressField("apartment", e.target.value)} />
              </div>
              <div className="ao-field ao-field-full">
                <label>Delivery Notes</label>
                <textarea rows={2} value={addressForm.delivery_notes} onChange={(e) => updateAddressField("delivery_notes", e.target.value)} />
              </div>
            </div>

            <div className="ao-modal-actions">
              <button type="button" className="ao-btn ao-btn-ghost" onClick={closeAddressModal}>Cancel</button>
              <button type="button" className="ao-btn ao-btn-primary" onClick={saveAddress} disabled={addressSaving}>
                {addressSaving ? "Saving…" : editingAddressId ? "Save Changes" : "Add Address"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentOrder;