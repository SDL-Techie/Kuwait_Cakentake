// // // // // import React, { useEffect, useMemo, useState, useCallback } from "react";
// // // // // import "./agentorder.css";

// // // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // // EXISTING SERVICES ONLY (agentService.ts, areaService.ts) — nothing here
// // // // // // creates or modifies those services. addressService.ts is a new, minimal
// // // // // // file added alongside this component (see accompanying message).
// // // // // // ─────────────────────────────────────────────────────────────────────────────

// // // // // import {
// // // // //   getAgentDashboard,
// // // // //   getAgentCatalog,
// // // // //   createAgentOrder,
// // // // //   type Agent,
// // // // //   type AgentProduct,
// // // // //   type BakeryProduct,
// // // // //   type CreateAgentOrderPayload,
// // // // //   type AgentOrderItemInput,
// // // // // } from "../services/agentService";

// // // // // // Areas — same assumption as your existing SalesAgentCreateOrder file: not
// // // // // // included in what you shared, so point this at your real areas export if
// // // // // // the path/shape differs.
// // // // // import { getAreas } from "../services/areaService";

// // // // // import {
// // // // //   getMyAddresses,
// // // // //   createAddress,
// // // // //   updateAddress,
// // // // //   deleteAddress,
// // // // //   type Address,
// // // // // } from "../services/addressService";

// // // // // type AddressInput = Omit<Address, "id" | "user_id">;

// // // // // // =============================================================================
// // // // // // ─── TYPES ───────────────────────────────────────────────────────────────────
// // // // // // =============================================================================

// // // // // interface AreaOption {
// // // // //   id: number;
// // // // //   name: string;
// // // // //   currency?: string;
// // // // //   delivery_charge?: number;
// // // // // }

// // // // // type ProductType = "NORMAL" | "AGENT";

// // // // // interface CartItem {
// // // // //   cartId: string;
// // // // //   productId: number;
// // // // //   productType: ProductType;
// // // // //   name: string;
// // // // //   image?: string;
// // // // //   originalPrice: number;
// // // // //   discountPercentage: number; // 0 for AGENT products
// // // // //   discountAmount: number; // per unit
// // // // //   finalPrice: number; // per unit, after discount
// // // // //   quantity: number;
// // // // //   currency: string;
// // // // // }

// // // // // type DeliveryMethod = "PICKUP" | "DELIVERY";

// // // // // type PaymentMethodOption = "COD" | "CARD" | "KNET" | "UPI" | "LINK";

// // // // // interface FormErrors {
// // // // //   deliveryMethod?: string;
// // // // //   address?: string;
// // // // //   items?: string;
// // // // //   paymentMethod?: string;
// // // // //   pickupDate?: string;
// // // // //   pickupTimeSlot?: string;
// // // // //   deliveryDate?: string;
// // // // //   deliveryTimeSlot?: string;
// // // // // }

// // // // // interface AddressFormState {
// // // // //   area_id: number | null;
// // // // //   street: string;
// // // // //   country: string;
// // // // //   block: string;
// // // // //   avenue: string;
// // // // //   building: string;
// // // // //   floor: string;
// // // // //   apartment: string;
// // // // //   delivery_notes: string;
// // // // // }

// // // // // /**
// // // // //  * CreateAgentOrderPayload (agentService.ts) doesn't currently have fields for
// // // // //  * order_source, delivery_method, agent-side notes, or a discount summary.
// // // // //  * This local type is a strict superset — assigning an object of this shape
// // // // //  * to the real payload type still type-checks, so createAgentOrder() accepts
// // // // //  * it as-is. Add matching columns/handling on the backend to actually persist
// // // // //  * these extra fields; until then they'll simply be ignored by the API.
// // // // //  */
// // // // // interface AgentOrderPayloadExtended extends CreateAgentOrderPayload {
// // // // //   order_source?: "AGENT_SELF";
// // // // //   delivery_method?: DeliveryMethod;
// // // // //   agent_notes?: string;
// // // // //   agent_discount_percentage?: number;
// // // // //   discount_total?: number;
// // // // //   delivery_charge?: number;
// // // // //   subtotal?: number;
// // // // //   grand_total?: number;
// // // // // }

// // // // // // const TIME_SLOTS = [
// // // // // //   "9:00 AM - 11:00 AM",
// // // // // //   "11:00 AM - 1:00 PM",
// // // // // //   "1:00 PM - 3:00 PM",
// // // // // //   "3:00 PM - 5:00 PM",
// // // // // //   "5:00 PM - 7:00 PM",
// // // // // //   "7:00 PM - 9:00 PM",
// // // // // // ];

// // // // // const TIME_SLOTS = [
// // // // //   "9:00 AM - 10:00 AM",
// // // // //   "10:00 AM - 11:00 AM",
// // // // //   "11:00 AM - 12:00 PM",
// // // // //   "12:00 PM - 1:00 PM",
// // // // //   "1:00 PM - 2:00 PM",
// // // // //   "2:00 PM - 3:00 PM",
// // // // //   "3:00 PM - 4:00 PM",
// // // // //   "4:00 PM - 5:00 PM",
// // // // //   "5:00 PM - 6:00 PM",
// // // // //   "6:00 PM - 7:00 PM",
// // // // //   "7:00 PM - 8:00 PM",
// // // // //   "8:00 PM - 9:00 PM",
// // // // //   "9:00 PM - 10:00 PM",
// // // // // ];

// // // // // const PAYMENT_METHODS: { value: PaymentMethodOption; label: string }[] = [
// // // // //   { value: "COD", label: "Cash" },
// // // // //   { value: "CARD", label: "Card" },
// // // // //   { value: "KNET", label: "KNET" },
// // // // //   { value: "UPI", label: "UPI" },
// // // // //   { value: "LINK", label: "Other" },
// // // // // ];

// // // // // const EMPTY_ADDRESS_FORM: AddressFormState = {
// // // // //   area_id: null,
// // // // //   street: "",
// // // // //   country: "",
// // // // //   block: "",
// // // // //   avenue: "",
// // // // //   building: "",
// // // // //   floor: "",
// // // // //   apartment: "",
// // // // //   delivery_notes: "",
// // // // // };

// // // // // // =============================================================================
// // // // // // ─── HELPERS ─────────────────────────────────────────────────────────────────
// // // // // // =============================================================================

// // // // // const makeCartId = (): string =>
// // // // //   `cart_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

// // // // // const formatMoney = (value: number): string => (value || 0).toFixed(2);

// // // // // const cartKey = (productId: number, type: ProductType) => `${type}-${productId}`;

// // // // // // =============================================================================
// // // // // // ─── COMPONENT ───────────────────────────────────────────────────────────────
// // // // // // =============================================================================

// // // // // const AgentOrder: React.FC = () => {
// // // // //   // ── Logged-in agent (auto-loaded, never typed manually) ─────────────────
// // // // //   const [agent, setAgent] = useState<Agent | null>(null);
// // // // //   const [agentLoading, setAgentLoading] = useState<boolean>(true);
// // // // //   const agentDiscount = agent?.default_discount ?? 0;

// // // // //   // ── Addresses ────────────────────────────────────────────────────────────
// // // // //   const [addresses, setAddresses] = useState<Address[]>([]);
// // // // //   const [addressesLoading, setAddressesLoading] = useState<boolean>(true);
// // // // //   const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

// // // // //   const [addressModalOpen, setAddressModalOpen] = useState<boolean>(false);
// // // // //   const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
// // // // //   const [addressForm, setAddressForm] = useState<AddressFormState>(EMPTY_ADDRESS_FORM);
// // // // //   const [addressSaving, setAddressSaving] = useState<boolean>(false);
// // // // //   const [addressFormError, setAddressFormError] = useState<string>("");

// // // // //   // ── Areas (for address form + delivery charge lookup) ──────────────────
// // // // //   const [areas, setAreas] = useState<AreaOption[]>([]);
// // // // //   const [areasLoading, setAreasLoading] = useState<boolean>(true);

// // // // //   // ── Delivery method ──────────────────────────────────────────────────────
// // // // //   const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("PICKUP");
// // // // //   const [pickupDate, setPickupDate] = useState<string>("");
// // // // //   const [pickupTimeSlot, setPickupTimeSlot] = useState<string>("");
// // // // //   const [deliveryDate, setDeliveryDate] = useState<string>("");
// // // // //   const [deliveryTimeSlot, setDeliveryTimeSlot] = useState<string>("");

// // // // //   // ── Catalog: normal products + agent's own products ─────────────────────
// // // // //   const [products, setProducts] = useState<BakeryProduct[]>([]);
// // // // //   const [agentProducts, setAgentProducts] = useState<AgentProduct[]>([]);
// // // // //   const [catalogLoading, setCatalogLoading] = useState<boolean>(true);
// // // // //   const [catalogError, setCatalogError] = useState<string>("");

// // // // //   const [searchTerm, setSearchTerm] = useState<string>("");
// // // // //   const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
// // // // //   const [draftQuantities, setDraftQuantities] = useState<Record<string, number>>({});

// // // // //   // ── Cart ─────────────────────────────────────────────────────────────────
// // // // //   const [cart, setCart] = useState<CartItem[]>([]);

// // // // //   // ── Payment / notes ──────────────────────────────────────────────────────
// // // // //   const [paymentMethod, setPaymentMethod] = useState<PaymentMethodOption | "">("");
// // // // //   const [notes, setNotes] = useState<string>("");
// // // // //   const [currency, setCurrency] = useState<string>("KWD");

// // // // //   // ── Submission ───────────────────────────────────────────────────────────
// // // // //   const [errors, setErrors] = useState<FormErrors>({});
// // // // //   const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
// // // // //   const [successMessage, setSuccessMessage] = useState<string>("");
// // // // //   const [submitError, setSubmitError] = useState<string>("");

// // // // //   // ── Load agent profile, addresses, areas, catalog on mount ─────────────
// // // // //   useEffect(() => {
// // // // //     let cancelled = false;

// // // // //     const loadAgent = async () => {
// // // // //       setAgentLoading(true);
// // // // //       try {
// // // // //         const dashboard = await getAgentDashboard();
// // // // //         if (!cancelled) setAgent(dashboard.agent);
// // // // //       } catch (err) {
// // // // //         if (!cancelled) setSubmitError("Unable to load your agent profile. Please refresh.");
// // // // //       } finally {
// // // // //         if (!cancelled) setAgentLoading(false);
// // // // //       }
// // // // //     };

// // // // //     const loadAddresses = async () => {
// // // // //       setAddressesLoading(true);
// // // // //       try {
// // // // //         const list = await getMyAddresses();
// // // // //         if (!cancelled) {
// // // // //           setAddresses(list);
// // // // //           if (list[0]?.id) setSelectedAddressId(list[0].id);
// // // // //         }
// // // // //       } catch (err) {
// // // // //         if (!cancelled) setCatalogError((prev) => prev || "Unable to load your saved addresses.");
// // // // //       } finally {
// // // // //         if (!cancelled) setAddressesLoading(false);
// // // // //       }
// // // // //     };

// // // // //     const loadAreas = async () => {
// // // // //       setAreasLoading(true);
// // // // //       try {
// // // // //         const list = await getAreas();
// // // // //         if (!cancelled) setAreas(list as AreaOption[]);
// // // // //       } catch (err) {
// // // // //         if (!cancelled) setCatalogError((prev) => prev || "Unable to load delivery areas.");
// // // // //       } finally {
// // // // //         if (!cancelled) setAreasLoading(false);
// // // // //       }
// // // // //     };

// // // // //     const loadCatalog = async () => {
// // // // //       setCatalogLoading(true);
// // // // //       setCatalogError("");
// // // // //       try {
// // // // //         const catalog = await getAgentCatalog(currency);
// // // // //         if (!cancelled) {
// // // // //           setProducts(catalog.products || []);
// // // // //           setAgentProducts(catalog.agent_products || []);
// // // // //         }
// // // // //       } catch (err) {
// // // // //         if (!cancelled) setCatalogError((prev) => prev || "Unable to load the menu. Please refresh and try again.");
// // // // //       } finally {
// // // // //         if (!cancelled) setCatalogLoading(false);
// // // // //       }
// // // // //     };

// // // // //     loadAgent();
// // // // //     loadAddresses();
// // // // //     loadAreas();
// // // // //     loadCatalog();

// // // // //     return () => {
// // // // //       cancelled = true;
// // // // //     };
// // // // //     // eslint-disable-next-line react-hooks/exhaustive-deps
// // // // //   }, []);

// // // // //   // ── Derived: selected address + its area (drives delivery charge) ──────
// // // // //   const selectedAddress = useMemo(
// // // // //     () => addresses.find((a) => a.id === selectedAddressId) || null,
// // // // //     [addresses, selectedAddressId]
// // // // //   );

// // // // //   const selectedArea = useMemo(
// // // // //     () => (selectedAddress ? areas.find((a) => a.id === selectedAddress.area_id) || null : null),
// // // // //     [selectedAddress, areas]
// // // // //   );

// // // // //   useEffect(() => {
// // // // //     if (selectedArea?.currency) setCurrency(selectedArea.currency);
// // // // //   }, [selectedArea]);

// // // // //   const deliveryCharge = useMemo(() => {
// // // // //     if (deliveryMethod !== "DELIVERY") return 0;
// // // // //     return selectedArea?.delivery_charge ?? 0;
// // // // //   }, [deliveryMethod, selectedArea]);

// // // // //   // ── Categories across both menus ────────────────────────────────────────
// // // // //   const categories = useMemo(() => {
// // // // //     const set = new Set<string>();
// // // // //     products.forEach((p) => {
// // // // //       const c = (p as any).category;
// // // // //       if (c) set.add(String(c));
// // // // //     });
// // // // //     agentProducts.forEach((p) => {
// // // // //       const c = (p as any).category;
// // // // //       if (c) set.add(String(c));
// // // // //     });
// // // // //     return Array.from(set);
// // // // //   }, [products, agentProducts]);

// // // // //   // ── Filtering (search + category) applies to both sections ─────────────
// // // // //   const matchesFilters = useCallback(
// // // // //     (name: string, category: unknown) => {
// // // // //       const term = searchTerm.trim().toLowerCase();
// // // // //       const matchesSearch = !term || (name || "").toLowerCase().includes(term);
// // // // //       const matchesCategory = categoryFilter === "ALL" || String(category || "") === categoryFilter;
// // // // //       return matchesSearch && matchesCategory;
// // // // //     },
// // // // //     [searchTerm, categoryFilter]
// // // // //   );

// // // // //   const filteredProducts = useMemo(
// // // // //     () => products.filter((p) => matchesFilters(p.name, (p as any).category)),
// // // // //     [products, matchesFilters]
// // // // //   );

// // // // //   const filteredAgentProducts = useMemo(
// // // // //     () => agentProducts.filter((p) => matchesFilters(p.name, (p as any).category)),
// // // // //     [agentProducts, matchesFilters]
// // // // //   );

// // // // //   // ── Draft quantity (per product card, before "Add") ─────────────────────
// // // // //   const getDraftQty = (key: string) => draftQuantities[key] ?? 1;

// // // // //   const changeDraftQty = (key: string, delta: number) => {
// // // // //     setDraftQuantities((prev) => ({
// // // // //       ...prev,
// // // // //       [key]: Math.max(1, (prev[key] ?? 1) + delta),
// // // // //     }));
// // // // //   };

// // // // //   // ── Discount math (display + cart only — never touches product prices) ──
// // // // //   const getDiscountedPrice = (price: number) => {
// // // // //     const discountAmount = (price * agentDiscount) / 100;
// // // // //     return { discountAmount, finalPrice: price - discountAmount };
// // // // //   };

// // // // //   // ── Add to cart (merges into an existing row for the same product) ─────
// // // // //   const mergeOrAddToCart = (item: Omit<CartItem, "cartId">) => {
// // // // //     setCart((prev) => {
// // // // //       const idx = prev.findIndex(
// // // // //         (c) => c.productId === item.productId && c.productType === item.productType
// // // // //       );
// // // // //       if (idx >= 0) {
// // // // //         const next = [...prev];
// // // // //         next[idx] = { ...next[idx], quantity: next[idx].quantity + item.quantity };
// // // // //         return next;
// // // // //       }
// // // // //       return [...prev, { ...item, cartId: makeCartId() }];
// // // // //     });
// // // // //     setErrors((prev) => ({ ...prev, items: undefined }));
// // // // //   };

// // // // //   const addNormalProductToCart = (product: BakeryProduct) => {
// // // // //     const key = cartKey(product.id, "NORMAL");
// // // // //     const qty = getDraftQty(key);
// // // // //     const price = product.price || 0;
// // // // //     const { discountAmount, finalPrice } = getDiscountedPrice(price);
// // // // //     mergeOrAddToCart({
// // // // //       productId: product.id,
// // // // //       productType: "NORMAL",
// // // // //       name: product.name,
// // // // //       image: (product as any).image_url,
// // // // //       originalPrice: price,
// // // // //       discountPercentage: agentDiscount,
// // // // //       discountAmount,
// // // // //       finalPrice,
// // // // //       quantity: qty,
// // // // //       currency, 
// // // // //     });
// // // // //     setDraftQuantities((prev) => ({ ...prev, [key]: 1 }));
// // // // //   };

// // // // //   const addAgentProductToCart = (product: AgentProduct) => {
// // // // //     const key = cartKey(product.id, "AGENT");
// // // // //     const qty = getDraftQty(key);
// // // // //     const price = product.price || 0;
// // // // //     mergeOrAddToCart({
// // // // //       productId: product.id,
// // // // //       productType: "AGENT",
// // // // //       name: product.name,
// // // // //       image: product.image || undefined,
// // // // //       originalPrice: price,
// // // // //       discountPercentage: 0,
// // // // //       discountAmount: 0,
// // // // //       finalPrice: price,
// // // // //       quantity: qty,
// // // // //       currency:"KWD", 
// // // // //     });
// // // // //     setDraftQuantities((prev) => ({ ...prev, [key]: 1 }));
// // // // //   };

// // // // //   // ── Cart row handlers ────────────────────────────────────────────────────
// // // // //   const changeCartQuantity = (cartId: string, delta: number) => {
// // // // //     setCart((prev) =>
// // // // //       prev.map((item) =>
// // // // //         item.cartId === cartId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
// // // // //       )
// // // // //     );
// // // // //   };

// // // // //   const removeCartItem = (cartId: string) => {
// // // // //     setCart((prev) => prev.filter((item) => item.cartId !== cartId));
// // // // //   };

// // // // //   // ── Totals ───────────────────────────────────────────────────────────────
// // // // //   const originalSubtotal = useMemo(
// // // // //     () => cart.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0),
// // // // //     [cart]
// // // // //   );

// // // // //   const discountTotal = useMemo(
// // // // //     () => cart.reduce((sum, item) => sum + item.discountAmount * item.quantity, 0),
// // // // //     [cart]
// // // // //   );

// // // // //   const subtotalAfterDiscount = originalSubtotal - discountTotal;

// // // // //   const grandTotal = useMemo(
// // // // //     () => Math.max(subtotalAfterDiscount + deliveryCharge, 0),
// // // // //     [subtotalAfterDiscount, deliveryCharge]
// // // // //   );

// // // // //   // ── Address CRUD ─────────────────────────────────────────────────────────
// // // // //   const openAddAddressModal = () => {
// // // // //     setEditingAddressId(null);
// // // // //     setAddressForm(EMPTY_ADDRESS_FORM);
// // // // //     setAddressFormError("");
// // // // //     setAddressModalOpen(true);
// // // // //   };

// // // // //   const openEditAddressModal = (addr: Address) => {
// // // // //     setEditingAddressId(addr.id ?? null);
// // // // //     setAddressForm({
// // // // //       area_id: addr.area_id,
// // // // //       street: addr.street || "",
// // // // //       country: addr.country || "",
// // // // //       block: addr.block || "",
// // // // //       avenue: addr.avenue || "",
// // // // //       building: addr.building || "",
// // // // //       floor: addr.floor || "",
// // // // //       apartment: addr.apartment || "",
// // // // //       delivery_notes: addr.delivery_notes || "",
// // // // //     });
// // // // //     setAddressFormError("");
// // // // //     setAddressModalOpen(true);
// // // // //   };

// // // // //   const closeAddressModal = () => {
// // // // //     setAddressModalOpen(false);
// // // // //     setEditingAddressId(null);
// // // // //     setAddressForm(EMPTY_ADDRESS_FORM);
// // // // //     setAddressFormError("");
// // // // //   };

// // // // //   const updateAddressField = (field: keyof AddressFormState, value: string) => {
// // // // //     setAddressForm((prev) => ({
// // // // //       ...prev,
// // // // //       [field]: field === "area_id" ? (value ? Number(value) : null) : value,
// // // // //     }));
// // // // //   };

// // // // //   const saveAddress = async () => {
// // // // //     if (!addressForm.area_id) {
// // // // //       setAddressFormError("Please select an area.");
// // // // //       return;
// // // // //     }
// // // // //     if (!addressForm.street.trim() || !addressForm.country.trim()) {
// // // // //       setAddressFormError("Street and country are required.");
// // // // //       return;
// // // // //     }

// // // // //     const payload: AddressInput = {
// // // // //       area_id: addressForm.area_id,
// // // // //       street: addressForm.street.trim(),
// // // // //       country: addressForm.country.trim(),
// // // // //       block: addressForm.block.trim() || undefined,
// // // // //       avenue: addressForm.avenue.trim() || undefined,
// // // // //       building: addressForm.building.trim() || undefined,
// // // // //       floor: addressForm.floor.trim() || undefined,
// // // // //       apartment: addressForm.apartment.trim() || undefined,
// // // // //       delivery_notes: addressForm.delivery_notes.trim() || undefined,
// // // // //     };

// // // // //     setAddressSaving(true);
// // // // //     setAddressFormError("");
// // // // //     try {
// // // // //       if (editingAddressId) {
// // // // //         const updated = await updateAddress(editingAddressId, payload);
// // // // //         setAddresses((prev) => prev.map((a) => (a.id === editingAddressId ? updated : a)));
// // // // //       } else {
// // // // //         const created = await createAddress(payload);
// // // // //         setAddresses((prev) => [...prev, created]);
// // // // //         setSelectedAddressId(created.id);
// // // // //       }
// // // // //       closeAddressModal();
// // // // //     } catch (err) {
// // // // //       setAddressFormError("Could not save this address. Please check the details and try again.");
// // // // //     } finally {
// // // // //       setAddressSaving(false);
// // // // //     }
// // // // //   };

// // // // //   const handleDeleteAddress = async (id: number) => {
// // // // //     if (!window.confirm("Delete this address?")) return;
// // // // //     try {
// // // // //       await deleteAddress(id);
// // // // //       setAddresses((prev) => prev.filter((a) => a.id !== id));
// // // // //       if (selectedAddressId === id) {
// // // // //         setSelectedAddressId(null);
// // // // //       }
// // // // //     } catch (err) {
// // // // //       setSubmitError("Could not delete this address. Please try again.");
// // // // //     }
// // // // //   };

// // // // //   // ── Validation ───────────────────────────────────────────────────────────
// // // // //   const validateForm = (): boolean => {
// // // // //     const next: FormErrors = {};
// // // // //     if (!deliveryMethod) {
// // // // //       next.deliveryMethod = "Choose Pickup or Delivery";
// // // // //     }

// // // // //     if (deliveryMethod === "PICKUP") {
// // // // //       if (!pickupDate) {
// // // // //         next.pickupDate = "Pickup date is required";
// // // // //       }
// // // // //       if (!pickupTimeSlot) {
// // // // //         next.pickupTimeSlot = "Pickup time is required";
// // // // //       }
// // // // //     }

// // // // //     if (deliveryMethod === "DELIVERY") {
// // // // //       if (!selectedAddressId) {
// // // // //         next.address = "Select a delivery address, or add a new one";
// // // // //       }
// // // // //       if (!deliveryDate) {
// // // // //         next.deliveryDate = "Delivery date is required";
// // // // //       }
// // // // //       if (!deliveryTimeSlot) {
// // // // //         next.deliveryTimeSlot = "Delivery time slot is required";
// // // // //       }
// // // // //     }

// // // // //     if (cart.length === 0) {
// // // // //       next.items = "Add at least one product to the cart";
// // // // //     }
// // // // //     // Payment method is intentionally not required for agent-created orders.
// // // // //     // The backend defaults to COD when payment_method is not provided.
// // // // //     setErrors(next);
// // // // //     return Object.keys(next).length === 0;
// // // // //   };

// // // // //   // ── Payload builder ──────────────────────────────────────────────────────
// // // // // const buildPayload = (): AgentOrderPayloadExtended => {
// // // // //   const items: AgentOrderItemInput[] = cart.map(
// // // // //     (item) => ({
// // // // //       product_id: item.productId,

// // // // //       quantity: item.quantity,

// // // // //       custom_json: {
// // // // //         product_type: item.productType,

// // // // //         original_price: Number(
// // // // //           item.originalPrice.toFixed(2)
// // // // //         ),

// // // // //         discount_percentage: Number(
// // // // //           item.discountPercentage.toFixed(2)
// // // // //         ),

// // // // //         discount_amount: Number(
// // // // //           item.discountAmount.toFixed(2)
// // // // //         ),

// // // // //         final_price: Number(
// // // // //           item.finalPrice.toFixed(2)
// // // // //         ),

// // // // //         line_total: Number(
// // // // //           (
// // // // //             item.finalPrice *
// // // // //             item.quantity
// // // // //           ).toFixed(2)
// // // // //         ),
// // // // //       },
// // // // //     })
// // // // //   );

// // // // //   const isPickup =
// // // // //     deliveryMethod === "PICKUP";

// // // // //   const payload: AgentOrderPayloadExtended = {
// // // // //     /*
// // // // //      * Agent is ordering for himself.
// // // // //      */
// // // // //     customer_id: agent!.id,

// // // // //     /*
// // // // //      * Pickup:
// // // // //      *     address_id = null
// // // // //      *
// // // // //      * Delivery:
// // // // //      *     address_id = selected address
// // // // //      */
// // // // //     address_id: isPickup
// // // // //       ? null
// // // // //       : selectedAddressId ?? null,

// // // // //     items,

// // // // //     payment_method:
// // // // //       paymentMethod || "COD",

// // // // //     currency:
// // // // //       currency as CreateAgentOrderPayload["currency"],

// // // // //     /*
// // // // //      * DELIVERY fields
// // // // //      */
// // // // //     delivery_date:
// // // // //       !isPickup
// // // // //         ? deliveryDate || undefined
// // // // //         : undefined,

// // // // //     delivery_time_slot:
// // // // //       !isPickup
// // // // //         ? deliveryTimeSlot || undefined
// // // // //         : undefined,

// // // // //     /*
// // // // //      * PICKUP fields
// // // // //      */
// // // // //     pickup_date:
// // // // //       isPickup
// // // // //         ? pickupDate || undefined
// // // // //         : undefined,

// // // // //     pickup_time_slot:
// // // // //       isPickup
// // // // //         ? pickupTimeSlot || undefined
// // // // //         : undefined,

// // // // //     /*
// // // // //      * Agent order metadata
// // // // //      */
// // // // //     order_source: "AGENT_SELF",

// // // // //     delivery_method:
// // // // //       deliveryMethod,

// // // // //     agent_notes:
// // // // //       notes.trim() || undefined,

// // // // //     /*
// // // // //      * These are only informational on frontend.
// // // // //      * Backend calculates the real discount.
// // // // //      */
// // // // //     agent_discount_percentage:
// // // // //       Number(
// // // // //         agentDiscount.toFixed(2)
// // // // //       ),

// // // // //     discount_total:
// // // // //       Number(
// // // // //         discountTotal.toFixed(2)
// // // // //       ),

// // // // //     delivery_charge:
// // // // //       Number(
// // // // //         deliveryCharge.toFixed(2)
// // // // //       ),

// // // // //     subtotal:
// // // // //       Number(
// // // // //         originalSubtotal.toFixed(2)
// // // // //       ),

// // // // //     grand_total:
// // // // //       Number(
// // // // //         grandTotal.toFixed(2)
// // // // //       ),
// // // // //   };

// // // // //   console.log(
// // // // //     "========================================"
// // // // //   );

// // // // //   console.log(
// // // // //     "CREATE AGENT ORDER PAYLOAD"
// // // // //   );

// // // // //   console.log(
// // // // //     "========================================"
// // // // //   );

// // // // //   console.log(
// // // // //     JSON.stringify(
// // // // //       payload,
// // // // //       null,
// // // // //       2
// // // // //     )
// // // // //   );

// // // // //   return payload;
// // // // // };

// // // // //   const resetOrderState = () => {
// // // // //     setCart([]);
// // // // //     setPaymentMethod("");
// // // // //     setNotes("");
// // // // //     setDeliveryMethod("PICKUP");
// // // // //     setPickupDate("");
// // // // //     setPickupTimeSlot("");
// // // // //     setDeliveryDate("");
// // // // //     setDeliveryTimeSlot("");
// // // // //     setErrors({});
// // // // //   };

// // // // //   // ── Submit ───────────────────────────────────────────────────────────────
// // // // // const handleCreateOrder = async () => {
// // // // //   setSuccessMessage("");
// // // // //   setSubmitError("");

// // // // //   if (!agent) {
// // // // //     setSubmitError(
// // // // //       "Your agent profile hasn't finished loading yet."
// // // // //     );
// // // // //     return;
// // // // //   }

// // // // //   if (!validateForm()) {
// // // // //     return;
// // // // //   }

// // // // //   /*
// // // // //    * Delivery must have an address.
// // // // //    */
// // // // //   if (
// // // // //     deliveryMethod === "DELIVERY" &&
// // // // //     !selectedAddressId
// // // // //   ) {
// // // // //     setSubmitError(
// // // // //       "Please select a delivery address."
// // // // //     );
// // // // //     return;
// // // // //   }

// // // // //   /*
// // // // //    * Pickup must have date + time.
// // // // //    */
// // // // //   if (
// // // // //     deliveryMethod === "PICKUP" &&
// // // // //     (!pickupDate || !pickupTimeSlot)
// // // // //   ) {
// // // // //     setSubmitError(
// // // // //       "Please select pickup date and time."
// // // // //     );
// // // // //     return;
// // // // //   }

// // // // //   if (cart.length === 0) {
// // // // //     setSubmitError(
// // // // //       "Please add at least one product."
// // // // //     );
// // // // //     return;
// // // // //   }

// // // // //   setIsSubmitting(true);

// // // // //   try {
// // // // //     const payload =
// // // // //       buildPayload();

// // // // //     const order =
// // // // //       await createAgentOrder(
// // // // //         payload
// // // // //       );

// // // // //     console.log(
// // // // //       "ORDER CREATED:",
// // // // //       order
// // // // //     );

// // // // //     setSuccessMessage(
// // // // //       "Order created successfully."
// // // // //     );

// // // // //     resetOrderState();

// // // // //   } catch (err: any) {
// // // // //     console.error(
// // // // //       "========================================"
// // // // //     );

// // // // //     console.error(
// // // // //       "ORDER CREATION FAILED"
// // // // //     );

// // // // //     console.error(
// // // // //       "========================================"
// // // // //     );

// // // // //     console.error(
// // // // //       "Status:",
// // // // //       err?.response?.status
// // // // //     );

// // // // //     console.error(
// // // // //       "Backend response:",
// // // // //       err?.response?.data
// // // // //     );

// // // // //     const message =
// // // // //       err?.response?.data?.error ||
// // // // //       err?.response?.data?.message ||
// // // // //       err?.message ||
// // // // //       "Could not create the order.";

// // // // //     setSubmitError(
// // // // //       message
// // // // //     );

// // // // //   } finally {
// // // // //     setIsSubmitting(false);
// // // // //   }
// // // // // };
// // // // //   // ── Render helpers ───────────────────────────────────────────────────────

// // // // //   const renderNormalProductCard = (product: BakeryProduct) => {
// // // // //     const key = cartKey(product.id, "NORMAL");
// // // // //     const price = product.price || 0;
// // // // //     const { finalPrice } = getDiscountedPrice(price);
// // // // //     const outOfStock = (product as any).stock !== undefined && (product as any).stock <= 0;

// // // // //     return (
// // // // //       <div className="ao-product-card" key={key}>
// // // // //         {agentDiscount > 0 && <span className="ao-badge ao-badge-discount">{agentDiscount}% OFF</span>}
// // // // //         <div className="ao-product-image-wrap">
// // // // //           {(product as any).image_url ? (
// // // // //             <img src={(product as any).image_url} alt={product.name} className="ao-product-image" />
// // // // //           ) : (
// // // // //             <div className="ao-product-image-placeholder">No Image</div>
// // // // //           )}
// // // // //         </div>
// // // // //         <div className="ao-product-info">
// // // // //           <p className="ao-product-name">{product.name}</p>
// // // // //           {(product as any).description && (
// // // // //             <p className="ao-product-desc">{(product as any).description}</p>
// // // // //           )}
// // // // //           <div className="ao-price-row">
// // // // //             {agentDiscount > 0 ? (
// // // // //               <>
// // // // //                 <span className="ao-price-original">KWD {formatMoney(price)}</span>
// // // // //                 <span className="ao-price-final">KWD {formatMoney(finalPrice)}</span>
// // // // //               </>
// // // // //             ) : (
// // // // //               <span className="ao-price-final">{currency} {formatMoney(price)}</span>
// // // // //             )}
// // // // //           </div>
// // // // //         </div>
// // // // //         <div className="ao-card-footer">
// // // // //           <div className="ao-qty-control">
// // // // //             <button type="button" className="ao-qty-btn" onClick={() => changeDraftQty(key, -1)} aria-label="Decrease quantity">−</button>
// // // // //             <span className="ao-qty-value">{getDraftQty(key)}</span>
// // // // //             <button type="button" className="ao-qty-btn" onClick={() => changeDraftQty(key, 1)} aria-label="Increase quantity">+</button>
// // // // //           </div>
// // // // //           <button
// // // // //             type="button"
// // // // //             className="ao-btn ao-btn-add"
// // // // //             disabled={outOfStock}
// // // // //             onClick={() => addNormalProductToCart(product)}
// // // // //           >
// // // // //             {outOfStock ? "Out of Stock" : "Add"}
// // // // //           </button>
// // // // //         </div>
// // // // //       </div>
// // // // //     );
// // // // //   };

// // // // //   const renderAgentProductCard = (product: AgentProduct) => {
// // // // //     const key = cartKey(product.id, "AGENT");
// // // // //     const price = product.price || 0;

// // // // //     return (
// // // // //       <div className="ao-product-card" key={key}>
// // // // //         <span className="ao-badge ao-badge-exclusive">Agent Exclusive</span>
// // // // //         <div className="ao-product-image-wrap">
// // // // //           {product.image ? (
// // // // //             <img src={product.image} alt={product.name} className="ao-product-image" />
// // // // //           ) : (
// // // // //             <div className="ao-product-image-placeholder">No Image</div>
// // // // //           )}
// // // // //         </div>
// // // // //         <div className="ao-product-info">
// // // // //           <p className="ao-product-name">{product.name}</p>
// // // // //           {product.description && <p className="ao-product-desc">{product.description}</p>}
// // // // //           <div className="ao-price-row">
// // // // //             <span className="ao-price-final">KWD{formatMoney(price)}</span>
// // // // //           </div>
// // // // //         </div>
// // // // //         <div className="ao-card-footer">
// // // // //           <div className="ao-qty-control">
// // // // //             <button type="button" className="ao-qty-btn" onClick={() => changeDraftQty(key, -1)} aria-label="Decrease quantity">−</button>
// // // // //             <span className="ao-qty-value">{getDraftQty(key)}</span>
// // // // //             <button type="button" className="ao-qty-btn" onClick={() => changeDraftQty(key, 1)} aria-label="Increase quantity">+</button>
// // // // //           </div>
// // // // //           <button type="button" className="ao-btn ao-btn-add" onClick={() => addAgentProductToCart(product)}>
// // // // //             Add
// // // // //           </button>
// // // // //         </div>
// // // // //       </div>
// // // // //     );
// // // // //   };

// // // // //   const renderProductSkeletons = (count: number) => (
// // // // //     <div className="ao-product-grid">
// // // // //       {Array.from({ length: count }).map((_, i) => (
// // // // //         <div className="ao-product-card ao-skeleton-card" key={i}>
// // // // //           <div className="ao-skeleton ao-skeleton-image" />
// // // // //           <div className="ao-skeleton ao-skeleton-line" />
// // // // //           <div className="ao-skeleton ao-skeleton-line ao-skeleton-line-short" />
// // // // //         </div>
// // // // //       ))}
// // // // //     </div>
// // // // //   );

// // // // //   // =============================================================================
// // // // //   // ─── JSX ─────────────────────────────────────────────────────────────────────
// // // // //   // =============================================================================

// // // // //   return (
// // // // //     <div className="ao-page">
// // // // //       {/* ── Header ─────────────────────────────────────────────────────── */}
// // // // //       <header className="ao-header">
// // // // //         <p className="ao-eyebrow">Agent Self-Order</p>
// // // // //         <h1 className="ao-title">Place Your Order</h1>
// // // // //       </header>

// // // // //       {successMessage && <div className="ao-toast ao-toast-success">{successMessage}</div>}
// // // // //       {(submitError || catalogError) && (
// // // // //         <div className="ao-toast ao-toast-error">{submitError || catalogError}</div>
// // // // //       )}

// // // // //       <div className="ao-layout">
// // // // //         {/* ── Main column ────────────────────────────────────────────── */}
// // // // //         <div className="ao-main-column">
// // // // //           {/* Card — Agent Info (read-only, auto-filled) */}
// // // // //           <section className="ao-card">
// // // // //             <h2 className="ao-card-title">Your Details</h2>
// // // // //             {agentLoading ? (
// // // // //               <p className="ao-muted">Loading your profile…</p>
// // // // //             ) : agent ? (
// // // // //               <div className="ao-agent-info">
// // // // //                 <div className="ao-agent-avatar">{(agent.first_name || "A").charAt(0)}</div>
// // // // //                 <div className="ao-agent-meta">
// // // // //                   <p className="ao-agent-name">{agent.first_name} {agent.last_name}</p>
// // // // //                   <p className="ao-agent-sub">{agent.email} · {agent.phone_no}</p>
// // // // //                   <p className="ao-agent-sub">Agent ID: {agent.id}</p>
// // // // //                 </div>
// // // // //                 {agentDiscount > 0 && (
// // // // //                   <span className="ao-badge ao-badge-discount ao-agent-discount-badge">
// // // // //                     {agentDiscount}% agent discount
// // // // //                   </span>
// // // // //                 )}
// // // // //               </div>
// // // // //             ) : (
// // // // //               <p className="ao-muted">We couldn't load your profile.</p>
// // // // //             )}
// // // // //           </section>

// // // // //           {/* Card — Delivery Method */}
// // // // //           <section className="ao-card">
// // // // //             <h2 className="ao-card-title">Delivery Method</h2>
// // // // //             {errors.deliveryMethod && <span className="ao-error-text">{errors.deliveryMethod}</span>}

// // // // //             <div className="ao-delivery-cards">
// // // // //               <button
// // // // //                 type="button"
// // // // //                 className={`ao-delivery-card ${deliveryMethod === "PICKUP" ? "ao-delivery-card-active" : ""}`}
// // // // //                 onClick={() => setDeliveryMethod("PICKUP")}
// // // // //               >
// // // // //                 <span className="ao-delivery-icon">🏬</span>
// // // // //                 <span className="ao-delivery-label">Pickup</span>
// // // // //                 <span className="ao-delivery-sub">No delivery charge</span>
// // // // //               </button>
// // // // //               <button
// // // // //                 type="button"
// // // // //                 className={`ao-delivery-card ${deliveryMethod === "DELIVERY" ? "ao-delivery-card-active" : ""}`}
// // // // //                 onClick={() => setDeliveryMethod("DELIVERY")}
// // // // //               >
// // // // //                 <span className="ao-delivery-icon">🚚</span>
// // // // //                 <span className="ao-delivery-label">Delivery</span>
// // // // //                 <span className="ao-delivery-sub">Charge based on your area</span>
// // // // //               </button>
// // // // //             </div>

// // // // //             {deliveryMethod === "PICKUP" && (
// // // // //               <div className="ao-address-section">
// // // // //                 <div className="ao-field-grid ao-delivery-time-grid">
// // // // //                   <div className="ao-field">
// // // // //                     <label>Pickup Date *</label>
// // // // //                     <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
// // // // //                     {errors.pickupDate && <span className="ao-error-text">{errors.pickupDate}</span>}
// // // // //                   </div>
// // // // //                   <div className="ao-field">
// // // // //                     <label>Pickup Time *</label>
// // // // //                     <select value={pickupTimeSlot} onChange={(e) => setPickupTimeSlot(e.target.value)}>
// // // // //                       <option value="">Select a pickup time</option>
// // // // //                       {TIME_SLOTS.map((slot) => (
// // // // //                         <option key={slot} value={slot}>{slot}</option>
// // // // //                       ))}
// // // // //                     </select>
// // // // //                     {errors.pickupTimeSlot && <span className="ao-error-text">{errors.pickupTimeSlot}</span>}
// // // // //                   </div>
// // // // //                 </div>
// // // // //               </div>
// // // // //             )}

// // // // //             {deliveryMethod === "DELIVERY" && (
// // // // //               <div className="ao-address-section">
// // // // //                 {errors.address && <span className="ao-error-text">{errors.address}</span>}

// // // // //                 {addressesLoading ? (
// // // // //                   <p className="ao-muted">Loading your addresses…</p>
// // // // //                 ) : addresses.length === 0 ? (
// // // // //                   <p className="ao-muted">You don't have any saved addresses yet.</p>
// // // // //                 ) : (
// // // // //                   <div className="ao-address-list">
// // // // //                     {addresses.map((addr) => {
// // // // //                       const area = addr.area || areas.find((a) => a.id === addr.area_id);
// // // // //                       const lineParts = [
// // // // //                         addr.block,
// // // // //                         addr.avenue,
// // // // //                         addr.street,
// // // // //                         addr.building ? `Building ${addr.building}` : null,
// // // // //                         addr.floor ? `Floor ${addr.floor}` : null,
// // // // //                         addr.apartment ? `Apt ${addr.apartment}` : null,
// // // // //                       ].filter(Boolean);
// // // // //                       return (
// // // // //                         <div
// // // // //                           key={addr.id}
// // // // //                           className={`ao-address-card ${selectedAddressId === addr.id ? "ao-address-card-active" : ""}`}
// // // // //                           onClick={() => setSelectedAddressId(addr.id as number)}
// // // // //                         >
// // // // //                           <div className="ao-address-card-main">
// // // // //                             <p className="ao-address-line">{lineParts.join(", ")}</p>
// // // // //                             <p className="ao-address-sub">
// // // // //                               {area?.name || "Unknown area"} · {addr.country}
// // // // //                               {addr.delivery_notes ? ` · ${addr.delivery_notes}` : ""}
// // // // //                             </p>
// // // // //                           </div>
// // // // //                           <div className="ao-address-card-actions" onClick={(e) => e.stopPropagation()}>
// // // // //                             <button type="button" className="ao-icon-btn" onClick={() => openEditAddressModal(addr)} aria-label="Edit address">✎</button>
// // // // //                             <button type="button" className="ao-icon-btn ao-icon-btn-danger" onClick={() => handleDeleteAddress(addr.id as number)} aria-label="Delete address">✕</button>
// // // // //                           </div>
// // // // //                         </div>
// // // // //                       );
// // // // //                     })}
// // // // //                   </div>
// // // // //                 )}

// // // // //                 <button type="button" className="ao-btn ao-btn-secondary ao-add-address-btn" onClick={openAddAddressModal}>
// // // // //                   + Add New Address
// // // // //                 </button>

// // // // //                 <div className="ao-field-grid ao-delivery-time-grid">
// // // // //                   <div className="ao-field">
// // // // //                     <label>Delivery Date *</label>
// // // // //                     <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
// // // // //                     {errors.deliveryDate && <span className="ao-error-text">{errors.deliveryDate}</span>}
// // // // //                   </div>
// // // // //                   <div className="ao-field">
// // // // //                     <label>Delivery Time Slot *</label>
// // // // //                     <select value={deliveryTimeSlot} onChange={(e) => setDeliveryTimeSlot(e.target.value)}>
// // // // //                       <option value="">Select a time slot</option>
// // // // //                       {TIME_SLOTS.map((slot) => (
// // // // //                         <option key={slot} value={slot}>{slot}</option>
// // // // //                       ))}
// // // // //                     </select>
// // // // //                     {errors.deliveryTimeSlot && <span className="ao-error-text">{errors.deliveryTimeSlot}</span>}
// // // // //                   </div>
// // // // //                 </div>
// // // // //               </div>
// // // // //             )}
// // // // //           </section>

// // // // //           {/* Card — Menu */}
// // // // //           <section className="ao-card">
// // // // //             <h2 className="ao-card-title">Menu</h2>
// // // // //             {errors.items && <span className="ao-error-text">{errors.items}</span>}

// // // // //             <input
// // // // //               type="text"
// // // // //               className="ao-search-bar"
// // // // //               placeholder="Search products across both menus..."
// // // // //               value={searchTerm}
// // // // //               onChange={(e) => setSearchTerm(e.target.value)}
// // // // //             />

// // // // //             {categories.length > 0 && (
// // // // //               <div className="ao-category-chips">
// // // // //                 <button
// // // // //                   type="button"
// // // // //                   className={`ao-chip ${categoryFilter === "ALL" ? "ao-chip-active" : ""}`}
// // // // //                   onClick={() => setCategoryFilter("ALL")}
// // // // //                 >
// // // // //                   All
// // // // //                 </button>
// // // // //                 {categories.map((c) => (
// // // // //                   <button
// // // // //                     key={c}
// // // // //                     type="button"
// // // // //                     className={`ao-chip ${categoryFilter === c ? "ao-chip-active" : ""}`}
// // // // //                     onClick={() => setCategoryFilter(c)}
// // // // //                   >
// // // // //                     {c}
// // // // //                   </button>
// // // // //                 ))}
// // // // //               </div>
// // // // //             )}

// // // // //             <h3 className="ao-subsection-title">Our Menu {agentDiscount > 0 ? `(${agentDiscount}% off for you)` : ""}</h3>
// // // // //             {catalogLoading ? (
// // // // //               renderProductSkeletons(4)
// // // // //             ) : filteredProducts.length === 0 ? (
// // // // //               <p className="ao-muted">No products match your search.</p>
// // // // //             ) : (
// // // // //               <div className="ao-product-grid">{filteredProducts.map(renderNormalProductCard)}</div>
// // // // //             )}

// // // // //             <h3 className="ao-subsection-title">Your Exclusive Products</h3>
// // // // //             {catalogLoading ? (
// // // // //               renderProductSkeletons(4)
// // // // //             ) : filteredAgentProducts.length === 0 ? (
// // // // //               <p className="ao-muted">No exclusive products assigned to you yet.</p>
// // // // //             ) : (
// // // // //               <div className="ao-product-grid">{filteredAgentProducts.map(renderAgentProductCard)}</div>
// // // // //             )}
// // // // //           </section>

// // // // //           {/* Card — Cart */}
// // // // //           <section className="ao-card">
// // // // //             <h2 className="ao-card-title">Cart</h2>
// // // // //             {cart.length === 0 ? (
// // // // //               <div className="ao-empty-cart">
// // // // //                 <div className="ao-empty-cart-icon">🛒</div>
// // // // //                 <p className="ao-muted">Your cart is empty. Add something delicious above.</p>
// // // // //               </div>
// // // // //             ) : (
// // // // //               <div className="ao-cart-table-wrap">
// // // // //                 <table className="ao-cart-table">
// // // // //                   <thead>
// // // // //                     <tr>
// // // // //                       <th>Product</th>
// // // // //                       <th>Qty</th>
// // // // //                       <th>Original</th>
// // // // //                       <th>Discount</th>
// // // // //                       <th>Final</th>
// // // // //                       <th>Subtotal</th>
// // // // //                       <th></th>
// // // // //                     </tr>
// // // // //                   </thead>
// // // // //                   <tbody>
// // // // //                     {cart.map((item) => (
// // // // //                       <tr key={item.cartId}>
// // // // //                         <td>
// // // // //                           <div className="ao-cart-product-name">{item.name}</div>
// // // // //                           <span className={`ao-tag ${item.productType === "AGENT" ? "ao-tag-agent" : "ao-tag-normal"}`}>
// // // // //                             {item.productType === "AGENT" ? "Agent Exclusive" : "Normal"}
// // // // //                           </span>
// // // // //                         </td>
// // // // //                         <td>
// // // // //                           <div className="ao-qty-control">
// // // // //                             <button type="button" className="ao-qty-btn" onClick={() => changeCartQuantity(item.cartId, -1)}>−</button>
// // // // //                             <span className="ao-qty-value">{item.quantity}</span>
// // // // //                             <button type="button" className="ao-qty-btn" onClick={() => changeCartQuantity(item.cartId, 1)}>+</button>
// // // // //                           </div>
// // // // //                         </td>
// // // // //                         <td>{currency} {formatMoney(item.originalPrice)}</td>
// // // // //                         <td>{item.discountPercentage > 0 ? `${item.discountPercentage}% (-${currency} ${formatMoney(item.discountAmount)})` : "—"}</td>
// // // // //                         <td>{currency} {formatMoney(item.finalPrice)}</td>
// // // // //                         <td>{currency} {formatMoney(item.finalPrice * item.quantity)}</td>
// // // // //                         <td>
// // // // //                           <button type="button" className="ao-btn-remove" onClick={() => removeCartItem(item.cartId)} aria-label="Remove item">✕</button>
// // // // //                         </td>
// // // // //                       </tr>
// // // // //                     ))}
// // // // //                   </tbody>
// // // // //                 </table>
// // // // //               </div>
// // // // //             )}
// // // // //           </section>

// // // // //           {/* Card — Notes */}
// // // // //           <section className="ao-card">
// // // // //             <h2 className="ao-card-title">Notes</h2>
// // // // //             <div className="ao-field">
// // // // //               <label>Notes for this order</label>
// // // // //               <textarea
// // // // //                 rows={3}
// // // // //                 value={notes}
// // // // //                 onChange={(e) => setNotes(e.target.value)}
// // // // //                 placeholder="Anything the kitchen or delivery team should know…"
// // // // //               />
// // // // //             </div>
// // // // //           </section>
// // // // //         </div>

// // // // //         {/* ── Sticky sidebar ─────────────────────────────────────────── */}
// // // // //         <aside className="ao-sidebar">
// // // // //           <section className="ao-card ao-summary-card">
// // // // //             <h2 className="ao-card-title">Order Summary</h2>

// // // // //             <div className="ao-summary-row">
// // // // //               <span>Subtotal</span>
// // // // //               <span>{currency} {formatMoney(originalSubtotal)}</span>
// // // // //             </div>
// // // // //             <div className="ao-summary-row ao-summary-discount">
// // // // //               <span>Agent Discount Total</span>
// // // // //               <span>-{currency} {formatMoney(discountTotal)}</span>
// // // // //             </div>
// // // // //             <div className="ao-summary-row">
// // // // //               <span>Delivery Charge</span>
// // // // //               <span>{currency} {formatMoney(deliveryCharge)}</span>
// // // // //             </div>
// // // // //             <div className="ao-summary-row ao-summary-grand-total">
// // // // //               <span>Grand Total</span>
// // // // //               <span>{currency} {formatMoney(grandTotal)}</span>
// // // // //             </div>

// // // // //           </section>

// // // // //           <div className="ao-action-buttons">
// // // // //             <button
// // // // //               type="button"
// // // // //               className="ao-btn ao-btn-primary ao-btn-full"
// // // // //               onClick={handleCreateOrder}
// // // // //               disabled={isSubmitting || agentLoading}
// // // // //             >
// // // // //               {isSubmitting ? "Creating…" : "Create Order"}
// // // // //             </button>
// // // // //           </div>
// // // // //         </aside>
// // // // //       </div>

// // // // //       {/* ── Address add/edit modal ───────────────────────────────────── */}
// // // // //       {addressModalOpen && (
// // // // //         <div className="ao-modal-overlay" onClick={closeAddressModal}>
// // // // //           <div className="ao-modal" onClick={(e) => e.stopPropagation()}>
// // // // //             <h3 className="ao-modal-title">{editingAddressId ? "Edit Address" : "Add New Address"}</h3>

// // // // //             {addressFormError && <span className="ao-error-text">{addressFormError}</span>}

// // // // //             <div className="ao-field-grid">
// // // // //               <div className="ao-field ao-field-full">
// // // // //                 <label>Area *</label>
// // // // //                 <select
// // // // //                   value={addressForm.area_id ?? ""}
// // // // //                   onChange={(e) => updateAddressField("area_id", e.target.value)}
// // // // //                   disabled={areasLoading}
// // // // //                 >
// // // // //                   <option value="">{areasLoading ? "Loading areas…" : "Select an area"}</option>
// // // // //                   {areas.map((a) => (
// // // // //                     <option key={a.id} value={a.id}>{a.name}</option>
// // // // //                   ))}
// // // // //                 </select>
// // // // //               </div>
// // // // //               <div className="ao-field">
// // // // //                 <label>Street *</label>
// // // // //                 <input type="text" value={addressForm.street} onChange={(e) => updateAddressField("street", e.target.value)} />
// // // // //               </div>
// // // // //               <div className="ao-field">
// // // // //                 <label>Country *</label>
// // // // //                 <input type="text" value={addressForm.country} onChange={(e) => updateAddressField("country", e.target.value)} />
// // // // //               </div>
// // // // //               <div className="ao-field">
// // // // //                 <label>Block</label>
// // // // //                 <input type="text" value={addressForm.block} onChange={(e) => updateAddressField("block", e.target.value)} />
// // // // //               </div>
// // // // //               <div className="ao-field">
// // // // //                 <label>Avenue</label>
// // // // //                 <input type="text" value={addressForm.avenue} onChange={(e) => updateAddressField("avenue", e.target.value)} />
// // // // //               </div>
// // // // //               <div className="ao-field">
// // // // //                 <label>Building</label>
// // // // //                 <input type="text" value={addressForm.building} onChange={(e) => updateAddressField("building", e.target.value)} />
// // // // //               </div>
// // // // //               <div className="ao-field">
// // // // //                 <label>Floor</label>
// // // // //                 <input type="text" value={addressForm.floor} onChange={(e) => updateAddressField("floor", e.target.value)} />
// // // // //               </div>
// // // // //               <div className="ao-field">
// // // // //                 <label>Apartment</label>
// // // // //                 <input type="text" value={addressForm.apartment} onChange={(e) => updateAddressField("apartment", e.target.value)} />
// // // // //               </div>
// // // // //               <div className="ao-field ao-field-full">
// // // // //                 <label>Delivery Notes</label>
// // // // //                 <textarea rows={2} value={addressForm.delivery_notes} onChange={(e) => updateAddressField("delivery_notes", e.target.value)} />
// // // // //               </div>
// // // // //             </div>

// // // // //             <div className="ao-modal-actions">
// // // // //               <button type="button" className="ao-btn ao-btn-ghost" onClick={closeAddressModal}>Cancel</button>
// // // // //               <button type="button" className="ao-btn ao-btn-primary" onClick={saveAddress} disabled={addressSaving}>
// // // // //                 {addressSaving ? "Saving…" : editingAddressId ? "Save Changes" : "Add Address"}
// // // // //               </button>
// // // // //             </div>
// // // // //           </div>
// // // // //         </div>
// // // // //       )}
// // // // //     </div>
// // // // //   );
// // // // // };

// // // // // export default AgentOrder;


// // // // import React, { useEffect, useMemo, useState, useCallback } from "react";
// // // // import "./agentorder.css";

// // // // // ─────────────────────────────────────────────────────────────────────────────
// // // // // EXISTING SERVICES ONLY (agentService.ts, areaService.ts) — nothing here
// // // // // creates or modifies those services. addressService.ts is a new, minimal
// // // // // file added alongside this component (see accompanying message).
// // // // // ─────────────────────────────────────────────────────────────────────────────

// // // // import {
// // // //   getAgentDashboard,
// // // //   getAgentCatalog,
// // // //   createAgentOrder,
// // // //   type Agent,
// // // //   type AgentProduct,
// // // //   type BakeryProduct,
// // // //   type CreateAgentOrderPayload,
// // // //   type AgentOrderItemInput,
// // // // } from "../services/agentService";

// // // // // Areas — same assumption as your existing SalesAgentCreateOrder file: not
// // // // // included in what you shared, so point this at your real areas export if
// // // // // the path/shape differs.
// // // // import { getAreas } from "../services/areaService";

// // // // import {
// // // //   getMyAddresses,
// // // //   createAddress,
// // // //   updateAddress,
// // // //   deleteAddress,
// // // //   type Address,
// // // // } from "../services/addressService";

// // // // type AddressInput = Omit<Address, "id" | "user_id">;

// // // // // =============================================================================
// // // // // ─── TYPES ───────────────────────────────────────────────────────────────────
// // // // // =============================================================================

// // // // interface AreaOption {
// // // //   id: number;
// // // //   name: string;
// // // //   currency?: string;
// // // //   delivery_charge?: number;
// // // // }

// // // // type ProductType = "NORMAL" | "AGENT";

// // // // interface CartItem {
// // // //   cartId: string;
// // // //   productId: number;
// // // //   productType: ProductType;
// // // //   name: string;
// // // //   image?: string;
// // // //   originalPrice: number;
// // // //   discountPercentage: number; // 0 for AGENT products
// // // //   discountAmount: number; // per unit
// // // //   finalPrice: number; // per unit, after discount
// // // //   quantity: number;
// // // //   currency: string;
// // // // }

// // // // type DeliveryMethod = "PICKUP" | "DELIVERY";

// // // // type PaymentMethodOption = "COD" | "CARD" | "KNET" | "UPI" | "LINK";

// // // // type MenuTab = "MENU" | "AGENT_MENU";

// // // // interface FormErrors {
// // // //   deliveryMethod?: string;
// // // //   address?: string;
// // // //   items?: string;
// // // //   paymentMethod?: string;
// // // //   pickupDate?: string;
// // // //   pickupTimeSlot?: string;
// // // //   deliveryDate?: string;
// // // //   deliveryTimeSlot?: string;
// // // // }

// // // // interface AddressFormState {
// // // //   area_id: number | null;
// // // //   street: string;
// // // //   country: string;
// // // //   block: string;
// // // //   avenue: string;
// // // //   building: string;
// // // //   floor: string;
// // // //   apartment: string;
// // // //   delivery_notes: string;
// // // // }

// // // // /**
// // // //  * CreateAgentOrderPayload (agentService.ts) doesn't currently have fields for
// // // //  * order_source, delivery_method, agent-side notes, or a discount summary.
// // // //  * This local type is a strict superset — assigning an object of this shape
// // // //  * to the real payload type still type-checks, so createAgentOrder() accepts
// // // //  * it as-is. Add matching columns/handling on the backend to actually persist
// // // //  * these extra fields; until then they'll simply be ignored by the API.
// // // //  */
// // // // interface AgentOrderPayloadExtended extends CreateAgentOrderPayload {
// // // //   order_source?: "AGENT_SELF";
// // // //   delivery_method?: DeliveryMethod;
// // // //   agent_notes?: string;
// // // //   agent_discount_percentage?: number;
// // // //   discount_total?: number;
// // // //   delivery_charge?: number;
// // // //   subtotal?: number;
// // // //   grand_total?: number;
// // // // }

// // // // const TIME_SLOTS = [
// // // //   "9:00 AM - 10:00 AM",
// // // //   "10:00 AM - 11:00 AM",
// // // //   "11:00 AM - 12:00 PM",
// // // //   "12:00 PM - 1:00 PM",
// // // //   "1:00 PM - 2:00 PM",
// // // //   "2:00 PM - 3:00 PM",
// // // //   "3:00 PM - 4:00 PM",
// // // //   "4:00 PM - 5:00 PM",
// // // //   "5:00 PM - 6:00 PM",
// // // //   "6:00 PM - 7:00 PM",
// // // //   "7:00 PM - 8:00 PM",
// // // //   "8:00 PM - 9:00 PM",
// // // //   "9:00 PM - 10:00 PM",
// // // // ];

// // // // const PAYMENT_METHODS: { value: PaymentMethodOption; label: string }[] = [
// // // //   { value: "COD", label: "Cash" },
// // // //   { value: "CARD", label: "Card" },
// // // //   { value: "KNET", label: "KNET" },
// // // //   { value: "UPI", label: "UPI" },
// // // //   { value: "LINK", label: "Other" },
// // // // ];

// // // // const EMPTY_ADDRESS_FORM: AddressFormState = {
// // // //   area_id: null,
// // // //   street: "",
// // // //   country: "",
// // // //   block: "",
// // // //   avenue: "",
// // // //   building: "",
// // // //   floor: "",
// // // //   apartment: "",
// // // //   delivery_notes: "",
// // // // };

// // // // // =============================================================================
// // // // // ─── HELPERS ─────────────────────────────────────────────────────────────────
// // // // // =============================================================================

// // // // const makeCartId = (): string =>
// // // //   `cart_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

// // // // const formatMoney = (value: number): string => (value || 0).toFixed(2);

// // // // const cartKey = (productId: number, type: ProductType) => `${type}-${productId}`;

// // // // /**
// // // //  * category can come back from the API as a plain string OR as an object
// // // //  * (e.g. { id, name }). Rendering an object directly via String(obj) produces
// // // //  * "[object Object]" — this normalizes it to a display-safe string, or null
// // // //  * when there's nothing usable.
// // // //  */
// // // // const getCategoryName = (category: unknown): string | null => {
// // // //   if (category === null || category === undefined) return null;
// // // //   if (typeof category === "string") return category.trim() || null;
// // // //   if (typeof category === "number") return String(category);
// // // //   if (typeof category === "object") {
// // // //     const c = category as any;
// // // //     return c.name ?? c.title ?? c.label ?? null;
// // // //   }
// // // //   return null;
// // // // };

// // // // // =============================================================================
// // // // // ─── COMPONENT ───────────────────────────────────────────────────────────────
// // // // // =============================================================================

// // // // const AgentOrder: React.FC = () => {
// // // //   // ── Logged-in agent (auto-loaded, never typed manually) ─────────────────
// // // //   const [agent, setAgent] = useState<Agent | null>(null);
// // // //   const [agentLoading, setAgentLoading] = useState<boolean>(true);
// // // //   const agentDiscount = agent?.default_discount ?? 0;

// // // //   // ── Addresses ────────────────────────────────────────────────────────────
// // // //   const [addresses, setAddresses] = useState<Address[]>([]);
// // // //   const [addressesLoading, setAddressesLoading] = useState<boolean>(true);
// // // //   const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

// // // //   const [addressModalOpen, setAddressModalOpen] = useState<boolean>(false);
// // // //   const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
// // // //   const [addressForm, setAddressForm] = useState<AddressFormState>(EMPTY_ADDRESS_FORM);
// // // //   const [addressSaving, setAddressSaving] = useState<boolean>(false);
// // // //   const [addressFormError, setAddressFormError] = useState<string>("");

// // // //   // ── Areas (for address form + delivery charge lookup) ──────────────────
// // // //   const [areas, setAreas] = useState<AreaOption[]>([]);
// // // //   const [areasLoading, setAreasLoading] = useState<boolean>(true);

// // // //   // ── Delivery method ──────────────────────────────────────────────────────
// // // //   const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("PICKUP");
// // // //   const [pickupDate, setPickupDate] = useState<string>("");
// // // //   const [pickupTimeSlot, setPickupTimeSlot] = useState<string>("");
// // // //   const [deliveryDate, setDeliveryDate] = useState<string>("");
// // // //   const [deliveryTimeSlot, setDeliveryTimeSlot] = useState<string>("");

// // // //   // ── Catalog: normal products + agent's own products ─────────────────────
// // // //   const [products, setProducts] = useState<BakeryProduct[]>([]);
// // // //   const [agentProducts, setAgentProducts] = useState<AgentProduct[]>([]);
// // // //   const [catalogLoading, setCatalogLoading] = useState<boolean>(true);
// // // //   const [catalogError, setCatalogError] = useState<string>("");

// // // //   const [searchTerm, setSearchTerm] = useState<string>("");
// // // //   const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
// // // //   const [draftQuantities, setDraftQuantities] = useState<Record<string, number>>({});

// // // //   // ── Menu / Agent Menu tab switcher ───────────────────────────────────────
// // // //   const [menuTab, setMenuTab] = useState<MenuTab>("MENU");

// // // //   // ── Cart ─────────────────────────────────────────────────────────────────
// // // //   const [cart, setCart] = useState<CartItem[]>([]);

// // // //   // ── Payment / notes ──────────────────────────────────────────────────────
// // // //   const [paymentMethod, setPaymentMethod] = useState<PaymentMethodOption | "">("");
// // // //   const [notes, setNotes] = useState<string>("");
// // // //   const [currency, setCurrency] = useState<string>("KWD");

// // // //   // ── Submission ───────────────────────────────────────────────────────────
// // // //   const [errors, setErrors] = useState<FormErrors>({});
// // // //   const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
// // // //   const [successMessage, setSuccessMessage] = useState<string>("");
// // // //   const [submitError, setSubmitError] = useState<string>("");

// // // //   // ── Load agent profile, addresses, areas, catalog on mount ─────────────
// // // //   useEffect(() => {
// // // //     let cancelled = false;

// // // //     const loadAgent = async () => {
// // // //       setAgentLoading(true);
// // // //       try {
// // // //         const dashboard = await getAgentDashboard();
// // // //         if (!cancelled) setAgent(dashboard.agent);
// // // //       } catch (err) {
// // // //         if (!cancelled) setSubmitError("Unable to load your agent profile. Please refresh.");
// // // //       } finally {
// // // //         if (!cancelled) setAgentLoading(false);
// // // //       }
// // // //     };

// // // //     const loadAddresses = async () => {
// // // //       setAddressesLoading(true);
// // // //       try {
// // // //         const list = await getMyAddresses();
// // // //         if (!cancelled) {
// // // //           setAddresses(list);
// // // //           if (list[0]?.id) setSelectedAddressId(list[0].id);
// // // //         }
// // // //       } catch (err) {
// // // //         if (!cancelled) setCatalogError((prev) => prev || "Unable to load your saved addresses.");
// // // //       } finally {
// // // //         if (!cancelled) setAddressesLoading(false);
// // // //       }
// // // //     };

// // // //     const loadAreas = async () => {
// // // //       setAreasLoading(true);
// // // //       try {
// // // //         const list = await getAreas();
// // // //         if (!cancelled) setAreas(list as AreaOption[]);
// // // //       } catch (err) {
// // // //         if (!cancelled) setCatalogError((prev) => prev || "Unable to load delivery areas.");
// // // //       } finally {
// // // //         if (!cancelled) setAreasLoading(false);
// // // //       }
// // // //     };

// // // //     const loadCatalog = async () => {
// // // //       setCatalogLoading(true);
// // // //       setCatalogError("");
// // // //       try {
// // // //         const catalog = await getAgentCatalog(currency);
// // // //         if (!cancelled) {
// // // //           setProducts(catalog.products || []);
// // // //           setAgentProducts(catalog.agent_products || []);
// // // //         }
// // // //       } catch (err) {
// // // //         if (!cancelled) setCatalogError((prev) => prev || "Unable to load the menu. Please refresh and try again.");
// // // //       } finally {
// // // //         if (!cancelled) setCatalogLoading(false);
// // // //       }
// // // //     };

// // // //     loadAgent();
// // // //     loadAddresses();
// // // //     loadAreas();
// // // //     loadCatalog();

// // // //     return () => {
// // // //       cancelled = true;
// // // //     };
// // // //     // eslint-disable-next-line react-hooks/exhaustive-deps
// // // //   }, []);

// // // //   // ── Derived: selected address + its area (drives delivery charge) ──────
// // // //   const selectedAddress = useMemo(
// // // //     () => addresses.find((a) => a.id === selectedAddressId) || null,
// // // //     [addresses, selectedAddressId]
// // // //   );

// // // //   const selectedArea = useMemo(
// // // //     () => (selectedAddress ? areas.find((a) => a.id === selectedAddress.area_id) || null : null),
// // // //     [selectedAddress, areas]
// // // //   );

// // // //   useEffect(() => {
// // // //     if (selectedArea?.currency) setCurrency(selectedArea.currency);
// // // //   }, [selectedArea]);

// // // //   const deliveryCharge = useMemo(() => {
// // // //     if (deliveryMethod !== "DELIVERY") return 0;
// // // //     return selectedArea?.delivery_charge ?? 0;
// // // //   }, [deliveryMethod, selectedArea]);

// // // //   // ── Categories — only from the active tab's product set, normalized ────
// // // //   const categories = useMemo(() => {
// // // //     const sourceList = menuTab === "MENU" ? products : agentProducts;
// // // //     const set = new Set<string>();
// // // //     sourceList.forEach((p) => {
// // // //       const name = getCategoryName((p as any).category);
// // // //       if (name) set.add(name);
// // // //     });
// // // //     return Array.from(set);
// // // //   }, [products, agentProducts, menuTab]);

// // // //   // Reset category filter whenever the tab changes, since categories differ per tab
// // // //   useEffect(() => {
// // // //     setCategoryFilter("ALL");
// // // //   }, [menuTab]);

// // // //   // ── Filtering (search + category) applies within the active tab only ───
// // // //   const matchesFilters = useCallback(
// // // //     (name: string, category: unknown) => {
// // // //       const term = searchTerm.trim().toLowerCase();
// // // //       const matchesSearch = !term || (name || "").toLowerCase().includes(term);
// // // //       const categoryName = getCategoryName(category) ?? "";
// // // //       const matchesCategory = categoryFilter === "ALL" || categoryName === categoryFilter;
// // // //       return matchesSearch && matchesCategory;
// // // //     },
// // // //     [searchTerm, categoryFilter]
// // // //   );

// // // //   const filteredProducts = useMemo(
// // // //     () => products.filter((p) => matchesFilters(p.name, (p as any).category)),
// // // //     [products, matchesFilters]
// // // //   );

// // // //   const filteredAgentProducts = useMemo(
// // // //     () => agentProducts.filter((p) => matchesFilters(p.name, (p as any).category)),
// // // //     [agentProducts, matchesFilters]
// // // //   );

// // // //   // ── Draft quantity (per product card, before "Add") ─────────────────────
// // // //   const getDraftQty = (key: string) => draftQuantities[key] ?? 1;

// // // //   const changeDraftQty = (key: string, delta: number) => {
// // // //     setDraftQuantities((prev) => ({
// // // //       ...prev,
// // // //       [key]: Math.max(1, (prev[key] ?? 1) + delta),
// // // //     }));
// // // //   };

// // // //   // ── Discount math (display + cart only — never touches product prices) ──
// // // //   const getDiscountedPrice = (price: number) => {
// // // //     const discountAmount = (price * agentDiscount) / 100;
// // // //     return { discountAmount, finalPrice: price - discountAmount };
// // // //   };

// // // //   // ── Add to cart (merges into an existing row for the same product) ─────
// // // //   const mergeOrAddToCart = (item: Omit<CartItem, "cartId">) => {
// // // //     setCart((prev) => {
// // // //       const idx = prev.findIndex(
// // // //         (c) => c.productId === item.productId && c.productType === item.productType
// // // //       );
// // // //       if (idx >= 0) {
// // // //         const next = [...prev];
// // // //         next[idx] = { ...next[idx], quantity: next[idx].quantity + item.quantity };
// // // //         return next;
// // // //       }
// // // //       return [...prev, { ...item, cartId: makeCartId() }];
// // // //     });
// // // //     setErrors((prev) => ({ ...prev, items: undefined }));
// // // //   };

// // // //   const addNormalProductToCart = (product: BakeryProduct) => {
// // // //     const key = cartKey(product.id, "NORMAL");
// // // //     const qty = getDraftQty(key);
// // // //     const price = product.price || 0;
// // // //     const { discountAmount, finalPrice } = getDiscountedPrice(price);
// // // //     mergeOrAddToCart({
// // // //       productId: product.id,
// // // //       productType: "NORMAL",
// // // //       name: product.name,
// // // //       image: (product as any).image_url,
// // // //       originalPrice: price,
// // // //       discountPercentage: agentDiscount,
// // // //       discountAmount,
// // // //       finalPrice,
// // // //       quantity: qty,
// // // //       currency,
// // // //     });
// // // //     setDraftQuantities((prev) => ({ ...prev, [key]: 1 }));
// // // //   };

// // // //   const addAgentProductToCart = (product: AgentProduct) => {
// // // //     const key = cartKey(product.id, "AGENT");
// // // //     const qty = getDraftQty(key);
// // // //     const price = product.price || 0;
// // // //     mergeOrAddToCart({
// // // //       productId: product.id,
// // // //       productType: "AGENT",
// // // //       name: product.name,
// // // //       image: product.image || undefined,
// // // //       originalPrice: price,
// // // //       discountPercentage: 0,
// // // //       discountAmount: 0,
// // // //       finalPrice: price,
// // // //       quantity: qty,
// // // //       currency: "KWD",
// // // //     });
// // // //     setDraftQuantities((prev) => ({ ...prev, [key]: 1 }));
// // // //   };

// // // //   // ── Cart row handlers ────────────────────────────────────────────────────
// // // //   const changeCartQuantity = (cartId: string, delta: number) => {
// // // //     setCart((prev) =>
// // // //       prev.map((item) =>
// // // //         item.cartId === cartId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
// // // //       )
// // // //     );
// // // //   };

// // // //   const removeCartItem = (cartId: string) => {
// // // //     setCart((prev) => prev.filter((item) => item.cartId !== cartId));
// // // //   };

// // // //   // ── Totals ───────────────────────────────────────────────────────────────
// // // //   const originalSubtotal = useMemo(
// // // //     () => cart.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0),
// // // //     [cart]
// // // //   );

// // // //   const discountTotal = useMemo(
// // // //     () => cart.reduce((sum, item) => sum + item.discountAmount * item.quantity, 0),
// // // //     [cart]
// // // //   );

// // // //   const subtotalAfterDiscount = originalSubtotal - discountTotal;

// // // //   const grandTotal = useMemo(
// // // //     () => Math.max(subtotalAfterDiscount + deliveryCharge, 0),
// // // //     [subtotalAfterDiscount, deliveryCharge]
// // // //   );

// // // //   // ── Address CRUD ─────────────────────────────────────────────────────────
// // // //   const openAddAddressModal = () => {
// // // //     setEditingAddressId(null);
// // // //     setAddressForm(EMPTY_ADDRESS_FORM);
// // // //     setAddressFormError("");
// // // //     setAddressModalOpen(true);
// // // //   };

// // // //   const openEditAddressModal = (addr: Address) => {
// // // //     setEditingAddressId(addr.id ?? null);
// // // //     setAddressForm({
// // // //       area_id: addr.area_id,
// // // //       street: addr.street || "",
// // // //       country: addr.country || "",
// // // //       block: addr.block || "",
// // // //       avenue: addr.avenue || "",
// // // //       building: addr.building || "",
// // // //       floor: addr.floor || "",
// // // //       apartment: addr.apartment || "",
// // // //       delivery_notes: addr.delivery_notes || "",
// // // //     });
// // // //     setAddressFormError("");
// // // //     setAddressModalOpen(true);
// // // //   };

// // // //   const closeAddressModal = () => {
// // // //     setAddressModalOpen(false);
// // // //     setEditingAddressId(null);
// // // //     setAddressForm(EMPTY_ADDRESS_FORM);
// // // //     setAddressFormError("");
// // // //   };

// // // //   const updateAddressField = (field: keyof AddressFormState, value: string) => {
// // // //     setAddressForm((prev) => ({
// // // //       ...prev,
// // // //       [field]: field === "area_id" ? (value ? Number(value) : null) : value,
// // // //     }));
// // // //   };

// // // //   const saveAddress = async () => {
// // // //     if (!addressForm.area_id) {
// // // //       setAddressFormError("Please select an area.");
// // // //       return;
// // // //     }
// // // //     if (!addressForm.street.trim() || !addressForm.country.trim()) {
// // // //       setAddressFormError("Street and country are required.");
// // // //       return;
// // // //     }

// // // //     const payload: AddressInput = {
// // // //       area_id: addressForm.area_id,
// // // //       street: addressForm.street.trim(),
// // // //       country: addressForm.country.trim(),
// // // //       block: addressForm.block.trim() || undefined,
// // // //       avenue: addressForm.avenue.trim() || undefined,
// // // //       building: addressForm.building.trim() || undefined,
// // // //       floor: addressForm.floor.trim() || undefined,
// // // //       apartment: addressForm.apartment.trim() || undefined,
// // // //       delivery_notes: addressForm.delivery_notes.trim() || undefined,
// // // //     };

// // // //     setAddressSaving(true);
// // // //     setAddressFormError("");
// // // //     try {
// // // //       if (editingAddressId) {
// // // //         const updated = await updateAddress(editingAddressId, payload);
// // // //         setAddresses((prev) => prev.map((a) => (a.id === editingAddressId ? updated : a)));
// // // //       } else {
// // // //         const created = await createAddress(payload);
// // // //         setAddresses((prev) => [...prev, created]);
// // // //         setSelectedAddressId(created.id);
// // // //       }
// // // //       closeAddressModal();
// // // //     } catch (err) {
// // // //       setAddressFormError("Could not save this address. Please check the details and try again.");
// // // //     } finally {
// // // //       setAddressSaving(false);
// // // //     }
// // // //   };

// // // //   const handleDeleteAddress = async (id: number) => {
// // // //     if (!window.confirm("Delete this address?")) return;
// // // //     try {
// // // //       await deleteAddress(id);
// // // //       setAddresses((prev) => prev.filter((a) => a.id !== id));
// // // //       if (selectedAddressId === id) {
// // // //         setSelectedAddressId(null);
// // // //       }
// // // //     } catch (err) {
// // // //       setSubmitError("Could not delete this address. Please try again.");
// // // //     }
// // // //   };

// // // //   // ── Validation ───────────────────────────────────────────────────────────
// // // //   const validateForm = (): boolean => {
// // // //     const next: FormErrors = {};
// // // //     if (!deliveryMethod) {
// // // //       next.deliveryMethod = "Choose Pickup or Delivery";
// // // //     }

// // // //     if (deliveryMethod === "PICKUP") {
// // // //       if (!pickupDate) {
// // // //         next.pickupDate = "Pickup date is required";
// // // //       }
// // // //       if (!pickupTimeSlot) {
// // // //         next.pickupTimeSlot = "Pickup time is required";
// // // //       }
// // // //     }

// // // //     if (deliveryMethod === "DELIVERY") {
// // // //       if (!selectedAddressId) {
// // // //         next.address = "Select a delivery address, or add a new one";
// // // //       }
// // // //       if (!deliveryDate) {
// // // //         next.deliveryDate = "Delivery date is required";
// // // //       }
// // // //       if (!deliveryTimeSlot) {
// // // //         next.deliveryTimeSlot = "Delivery time slot is required";
// // // //       }
// // // //     }

// // // //     if (cart.length === 0) {
// // // //       next.items = "Add at least one product to the cart";
// // // //     }
// // // //     // Payment method is intentionally not required for agent-created orders.
// // // //     // The backend defaults to COD when payment_method is not provided.
// // // //     setErrors(next);
// // // //     return Object.keys(next).length === 0;
// // // //   };

// // // //   // ── Payload builder ──────────────────────────────────────────────────────
// // // //   const buildPayload = (): AgentOrderPayloadExtended => {
// // // //     const items: AgentOrderItemInput[] = cart.map((item) => ({
// // // //       product_id: item.productId,
// // // //       quantity: item.quantity,
// // // //       custom_json: {
// // // //         product_type: item.productType,
// // // //         original_price: Number(item.originalPrice.toFixed(2)),
// // // //         discount_percentage: Number(item.discountPercentage.toFixed(2)),
// // // //         discount_amount: Number(item.discountAmount.toFixed(2)),
// // // //         final_price: Number(item.finalPrice.toFixed(2)),
// // // //         line_total: Number((item.finalPrice * item.quantity).toFixed(2)),
// // // //       },
// // // //     }));

// // // //     const isPickup = deliveryMethod === "PICKUP";

// // // //     const payload: AgentOrderPayloadExtended = {
// // // //       customer_id: agent!.id,
// // // //       address_id: isPickup ? null : selectedAddressId ?? null,
// // // //       items,
// // // //       payment_method: paymentMethod || "COD",
// // // //       currency: currency as CreateAgentOrderPayload["currency"],
// // // //       delivery_date: !isPickup ? deliveryDate || undefined : undefined,
// // // //       delivery_time_slot: !isPickup ? deliveryTimeSlot || undefined : undefined,
// // // //       pickup_date: isPickup ? pickupDate || undefined : undefined,
// // // //       pickup_time_slot: isPickup ? pickupTimeSlot || undefined : undefined,
// // // //       order_source: "AGENT_SELF",
// // // //       delivery_method: deliveryMethod,
// // // //       agent_notes: notes.trim() || undefined,
// // // //       agent_discount_percentage: Number(agentDiscount.toFixed(2)),
// // // //       discount_total: Number(discountTotal.toFixed(2)),
// // // //       delivery_charge: Number(deliveryCharge.toFixed(2)),
// // // //       subtotal: Number(originalSubtotal.toFixed(2)),
// // // //       grand_total: Number(grandTotal.toFixed(2)),
// // // //     };

// // // //     console.log("========================================");
// // // //     console.log("CREATE AGENT ORDER PAYLOAD");
// // // //     console.log("========================================");
// // // //     console.log(JSON.stringify(payload, null, 2));

// // // //     return payload;
// // // //   };

// // // //   const resetOrderState = () => {
// // // //     setCart([]);
// // // //     setPaymentMethod("");
// // // //     setNotes("");
// // // //     setDeliveryMethod("PICKUP");
// // // //     setPickupDate("");
// // // //     setPickupTimeSlot("");
// // // //     setDeliveryDate("");
// // // //     setDeliveryTimeSlot("");
// // // //     setErrors({});
// // // //   };

// // // //   // ── Submit ───────────────────────────────────────────────────────────────
// // // //   const handleCreateOrder = async () => {
// // // //     setSuccessMessage("");
// // // //     setSubmitError("");

// // // //     if (!agent) {
// // // //       setSubmitError("Your agent profile hasn't finished loading yet.");
// // // //       return;
// // // //     }

// // // //     if (!validateForm()) {
// // // //       return;
// // // //     }

// // // //     if (deliveryMethod === "DELIVERY" && !selectedAddressId) {
// // // //       setSubmitError("Please select a delivery address.");
// // // //       return;
// // // //     }

// // // //     if (deliveryMethod === "PICKUP" && (!pickupDate || !pickupTimeSlot)) {
// // // //       setSubmitError("Please select pickup date and time.");
// // // //       return;
// // // //     }

// // // //     if (cart.length === 0) {
// // // //       setSubmitError("Please add at least one product.");
// // // //       return;
// // // //     }

// // // //     setIsSubmitting(true);

// // // //     try {
// // // //       const payload = buildPayload();
// // // //       const order = await createAgentOrder(payload);
// // // //       console.log("ORDER CREATED:", order);
// // // //       setSuccessMessage("Order created successfully.");
// // // //       resetOrderState();
// // // //     } catch (err: any) {
// // // //       console.error("========================================");
// // // //       console.error("ORDER CREATION FAILED");
// // // //       console.error("========================================");
// // // //       console.error("Status:", err?.response?.status);
// // // //       console.error("Backend response:", err?.response?.data);

// // // //       const message =
// // // //         err?.response?.data?.error ||
// // // //         err?.response?.data?.message ||
// // // //         err?.message ||
// // // //         "Could not create the order.";

// // // //       setSubmitError(message);
// // // //     } finally {
// // // //       setIsSubmitting(false);
// // // //     }
// // // //   };

// // // //   // ── Render helpers ───────────────────────────────────────────────────────

// // // //   const renderNormalProductCard = (product: BakeryProduct) => {
// // // //     const key = cartKey(product.id, "NORMAL");
// // // //     const price = product.price || 0;
// // // //     const { finalPrice } = getDiscountedPrice(price);
// // // //     const outOfStock = (product as any).stock !== undefined && (product as any).stock <= 0;

// // // //     return (
// // // //       <div className="ao-product-card" key={key}>
// // // //         {agentDiscount > 0 && <span className="ao-badge ao-badge-discount">{agentDiscount}% OFF</span>}
// // // //         <div className="ao-product-image-wrap">
// // // //           {(product as any).image_url ? (
// // // //             <img src={(product as any).image_url} alt={product.name} className="ao-product-image" />
// // // //           ) : (
// // // //             <div className="ao-product-image-placeholder">No Image</div>
// // // //           )}
// // // //         </div>
// // // //         <div className="ao-product-info">
// // // //           <p className="ao-product-name">{product.name}</p>
// // // //           {(product as any).description && (
// // // //             <p className="ao-product-desc">{(product as any).description}</p>
// // // //           )}
// // // //           <div className="ao-price-row">
// // // //             {agentDiscount > 0 ? (
// // // //               <>
// // // //                 <span className="ao-price-original">KWD {formatMoney(price)}</span>
// // // //                 <span className="ao-price-final">KWD {formatMoney(finalPrice)}</span>
// // // //               </>
// // // //             ) : (
// // // //               <span className="ao-price-final">{currency} {formatMoney(price)}</span>
// // // //             )}
// // // //           </div>
// // // //         </div>
// // // //         <div className="ao-card-footer">
// // // //           <div className="ao-qty-control">
// // // //             <button type="button" className="ao-qty-btn" onClick={() => changeDraftQty(key, -1)} aria-label="Decrease quantity">−</button>
// // // //             <span className="ao-qty-value">{getDraftQty(key)}</span>
// // // //             <button type="button" className="ao-qty-btn" onClick={() => changeDraftQty(key, 1)} aria-label="Increase quantity">+</button>
// // // //           </div>
// // // //           <button
// // // //             type="button"
// // // //             className="ao-btn ao-btn-add"
// // // //             disabled={outOfStock}
// // // //             onClick={() => addNormalProductToCart(product)}
// // // //           >
// // // //             {outOfStock ? "Out of Stock" : "Add"}
// // // //           </button>
// // // //         </div>
// // // //       </div>
// // // //     );
// // // //   };

// // // //   const renderAgentProductCard = (product: AgentProduct) => {
// // // //     const key = cartKey(product.id, "AGENT");
// // // //     const price = product.price || 0;

// // // //     return (
// // // //       <div className="ao-product-card" key={key}>
// // // //         <span className="ao-badge ao-badge-exclusive">Agent Exclusive</span>
// // // //         <div className="ao-product-image-wrap">
// // // //           {product.image ? (
// // // //             <img src={product.image} alt={product.name} className="ao-product-image" />
// // // //           ) : (
// // // //             <div className="ao-product-image-placeholder">No Image</div>
// // // //           )}
// // // //         </div>
// // // //         <div className="ao-product-info">
// // // //           <p className="ao-product-name">{product.name}</p>
// // // //           {product.description && <p className="ao-product-desc">{product.description}</p>}
// // // //           <div className="ao-price-row">
// // // //             <span className="ao-price-final">KWD {formatMoney(price)}</span>
// // // //           </div>
// // // //         </div>
// // // //         <div className="ao-card-footer">
// // // //           <div className="ao-qty-control">
// // // //             <button type="button" className="ao-qty-btn" onClick={() => changeDraftQty(key, -1)} aria-label="Decrease quantity">−</button>
// // // //             <span className="ao-qty-value">{getDraftQty(key)}</span>
// // // //             <button type="button" className="ao-qty-btn" onClick={() => changeDraftQty(key, 1)} aria-label="Increase quantity">+</button>
// // // //           </div>
// // // //           <button type="button" className="ao-btn ao-btn-add" onClick={() => addAgentProductToCart(product)}>
// // // //             Add
// // // //           </button>
// // // //         </div>
// // // //       </div>
// // // //     );
// // // //   };

// // // //   const renderProductSkeletons = (count: number) => (
// // // //     <div className="ao-product-grid">
// // // //       {Array.from({ length: count }).map((_, i) => (
// // // //         <div className="ao-product-card ao-skeleton-card" key={i}>
// // // //           <div className="ao-skeleton ao-skeleton-image" />
// // // //           <div className="ao-skeleton ao-skeleton-line" />
// // // //           <div className="ao-skeleton ao-skeleton-line ao-skeleton-line-short" />
// // // //         </div>
// // // //       ))}
// // // //     </div>
// // // //   );

// // // //   // =============================================================================
// // // //   // ─── JSX ─────────────────────────────────────────────────────────────────────
// // // //   // =============================================================================

// // // //   return (
// // // //     <div className="ao-page">
// // // //       {/* ── Header ─────────────────────────────────────────────────────── */}
// // // //       <header className="ao-header">
// // // //         <p className="ao-eyebrow">Agent Self-Order</p>
// // // //         <h1 className="ao-title">Place Your Order</h1>
// // // //       </header>

// // // //       {successMessage && <div className="ao-toast ao-toast-success">{successMessage}</div>}
// // // //       {(submitError || catalogError) && (
// // // //         <div className="ao-toast ao-toast-error">{submitError || catalogError}</div>
// // // //       )}

// // // //       <div className="ao-layout">
// // // //         {/* ── Main column ────────────────────────────────────────────── */}
// // // //         <div className="ao-main-column">
// // // //           {/* Card — Agent Info (read-only, auto-filled) */}
// // // //           <section className="ao-card">
// // // //             <h2 className="ao-card-title">Your Details</h2>
// // // //             {agentLoading ? (
// // // //               <p className="ao-muted">Loading your profile…</p>
// // // //             ) : agent ? (
// // // //               <div className="ao-agent-info">
// // // //                 <div className="ao-agent-avatar">{(agent.first_name || "A").charAt(0)}</div>
// // // //                 <div className="ao-agent-meta">
// // // //                   <p className="ao-agent-name">{agent.first_name} {agent.last_name}</p>
// // // //                   <p className="ao-agent-sub">{agent.email} · {agent.phone_no}</p>
// // // //                   <p className="ao-agent-sub">Agent ID: {agent.id}</p>
// // // //                 </div>
// // // //                 {agentDiscount > 0 && (
// // // //                   <span className="ao-badge ao-badge-discount ao-agent-discount-badge">
// // // //                     {agentDiscount}% agent discount
// // // //                   </span>
// // // //                 )}
// // // //               </div>
// // // //             ) : (
// // // //               <p className="ao-muted">We couldn't load your profile.</p>
// // // //             )}
// // // //           </section>

// // // //           {/* Card — Delivery Method */}
// // // //           <section className="ao-card">
// // // //             <h2 className="ao-card-title">Delivery Method</h2>
// // // //             {errors.deliveryMethod && <span className="ao-error-text">{errors.deliveryMethod}</span>}

// // // //             <div className="ao-delivery-cards">
// // // //               <button
// // // //                 type="button"
// // // //                 className={`ao-delivery-card ${deliveryMethod === "PICKUP" ? "ao-delivery-card-active" : ""}`}
// // // //                 onClick={() => setDeliveryMethod("PICKUP")}
// // // //               >
// // // //                 <span className="ao-delivery-icon">🏬</span>
// // // //                 <span className="ao-delivery-label">Pickup</span>
// // // //                 <span className="ao-delivery-sub">No delivery charge</span>
// // // //               </button>
// // // //               <button
// // // //                 type="button"
// // // //                 className={`ao-delivery-card ${deliveryMethod === "DELIVERY" ? "ao-delivery-card-active" : ""}`}
// // // //                 onClick={() => setDeliveryMethod("DELIVERY")}
// // // //               >
// // // //                 <span className="ao-delivery-icon">🚚</span>
// // // //                 <span className="ao-delivery-label">Delivery</span>
// // // //                 <span className="ao-delivery-sub">Charge based on your area</span>
// // // //               </button>
// // // //             </div>

// // // //             {deliveryMethod === "PICKUP" && (
// // // //               <div className="ao-address-section">
// // // //                 <div className="ao-field-grid ao-delivery-time-grid">
// // // //                   <div className="ao-field">
// // // //                     <label>Pickup Date *</label>
// // // //                     <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
// // // //                     {errors.pickupDate && <span className="ao-error-text">{errors.pickupDate}</span>}
// // // //                   </div>
// // // //                   <div className="ao-field">
// // // //                     <label>Pickup Time *</label>
// // // //                     <select value={pickupTimeSlot} onChange={(e) => setPickupTimeSlot(e.target.value)}>
// // // //                       <option value="">Select a pickup time</option>
// // // //                       {TIME_SLOTS.map((slot) => (
// // // //                         <option key={slot} value={slot}>{slot}</option>
// // // //                       ))}
// // // //                     </select>
// // // //                     {errors.pickupTimeSlot && <span className="ao-error-text">{errors.pickupTimeSlot}</span>}
// // // //                   </div>
// // // //                 </div>
// // // //               </div>
// // // //             )}

// // // //             {deliveryMethod === "DELIVERY" && (
// // // //               <div className="ao-address-section">
// // // //                 {errors.address && <span className="ao-error-text">{errors.address}</span>}

// // // //                 {addressesLoading ? (
// // // //                   <p className="ao-muted">Loading your addresses…</p>
// // // //                 ) : addresses.length === 0 ? (
// // // //                   <p className="ao-muted">You don't have any saved addresses yet.</p>
// // // //                 ) : (
// // // //                   <div className="ao-address-list">
// // // //                     {addresses.map((addr) => {
// // // //                       const area = addr.area || areas.find((a) => a.id === addr.area_id);
// // // //                       const lineParts = [
// // // //                         addr.block,
// // // //                         addr.avenue,
// // // //                         addr.street,
// // // //                         addr.building ? `Building ${addr.building}` : null,
// // // //                         addr.floor ? `Floor ${addr.floor}` : null,
// // // //                         addr.apartment ? `Apt ${addr.apartment}` : null,
// // // //                       ].filter(Boolean);
// // // //                       return (
// // // //                         <div
// // // //                           key={addr.id}
// // // //                           className={`ao-address-card ${selectedAddressId === addr.id ? "ao-address-card-active" : ""}`}
// // // //                           onClick={() => setSelectedAddressId(addr.id as number)}
// // // //                         >
// // // //                           <div className="ao-address-card-main">
// // // //                             <p className="ao-address-line">{lineParts.join(", ")}</p>
// // // //                             <p className="ao-address-sub">
// // // //                               {area?.name || "Unknown area"} · {addr.country}
// // // //                               {addr.delivery_notes ? ` · ${addr.delivery_notes}` : ""}
// // // //                             </p>
// // // //                           </div>
// // // //                           <div className="ao-address-card-actions" onClick={(e) => e.stopPropagation()}>
// // // //                             <button type="button" className="ao-icon-btn" onClick={() => openEditAddressModal(addr)} aria-label="Edit address">✎</button>
// // // //                             <button type="button" className="ao-icon-btn ao-icon-btn-danger" onClick={() => handleDeleteAddress(addr.id as number)} aria-label="Delete address">✕</button>
// // // //                           </div>
// // // //                         </div>
// // // //                       );
// // // //                     })}
// // // //                   </div>
// // // //                 )}

// // // //                 <button type="button" className="ao-btn ao-btn-secondary ao-add-address-btn" onClick={openAddAddressModal}>
// // // //                   + Add New Address
// // // //                 </button>

// // // //                 <div className="ao-field-grid ao-delivery-time-grid">
// // // //                   <div className="ao-field">
// // // //                     <label>Delivery Date *</label>
// // // //                     <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
// // // //                     {errors.deliveryDate && <span className="ao-error-text">{errors.deliveryDate}</span>}
// // // //                   </div>
// // // //                   <div className="ao-field">
// // // //                     <label>Delivery Time Slot *</label>
// // // //                     <select value={deliveryTimeSlot} onChange={(e) => setDeliveryTimeSlot(e.target.value)}>
// // // //                       <option value="">Select a time slot</option>
// // // //                       {TIME_SLOTS.map((slot) => (
// // // //                         <option key={slot} value={slot}>{slot}</option>
// // // //                       ))}
// // // //                     </select>
// // // //                     {errors.deliveryTimeSlot && <span className="ao-error-text">{errors.deliveryTimeSlot}</span>}
// // // //                   </div>
// // // //                 </div>
// // // //               </div>
// // // //             )}
// // // //           </section>

// // // //           {/* Card — Menu / Agent Menu */}
// // // //           <section className="ao-card">
// // // //             <h2 className="ao-card-title">
// // // //               {menuTab === "MENU" ? "Menu" : "Agent Menu (Exclusive)"}
// // // //             </h2>
// // // //             {errors.items && <span className="ao-error-text">{errors.items}</span>}

// // // //             {/* Tab switcher */}
// // // //             <div className="ao-menu-tabs">
// // // //               <button
// // // //                 type="button"
// // // //                 className={`ao-menu-tab ${menuTab === "MENU" ? "ao-menu-tab-active" : ""}`}
// // // //                 onClick={() => setMenuTab("MENU")}
// // // //               >
// // // //                 <span className="ao-menu-tab-icon">📋</span>
// // // //                 <span>Menu</span>
// // // //               </button>
// // // //               <button
// // // //                 type="button"
// // // //                 className={`ao-menu-tab ${menuTab === "AGENT_MENU" ? "ao-menu-tab-active" : ""}`}
// // // //                 onClick={() => setMenuTab("AGENT_MENU")}
// // // //               >
// // // //                 <span className="ao-menu-tab-icon">⭐</span>
// // // //                 <span>Agent Menu (Exclusive)</span>
// // // //               </button>
// // // //             </div>

// // // //             <input
// // // //               type="text"
// // // //               className="ao-search-bar"
// // // //               placeholder={
// // // //                 menuTab === "MENU"
// // // //                   ? "Search the menu…"
// // // //                   : "Search your exclusive products…"
// // // //               }
// // // //               value={searchTerm}
// // // //               onChange={(e) => setSearchTerm(e.target.value)}
// // // //             />

// // // //             {categories.length > 0 && (
// // // //               <div className="ao-category-chips">
// // // //                 <button
// // // //                   type="button"
// // // //                   className={`ao-chip ${categoryFilter === "ALL" ? "ao-chip-active" : ""}`}
// // // //                   onClick={() => setCategoryFilter("ALL")}
// // // //                 >
// // // //                   All
// // // //                 </button>
// // // //                 {categories.map((c) => (
// // // //                   <button
// // // //                     key={c}
// // // //                     type="button"
// // // //                     className={`ao-chip ${categoryFilter === c ? "ao-chip-active" : ""}`}
// // // //                     onClick={() => setCategoryFilter(c)}
// // // //                   >
// // // //                     {c}
// // // //                   </button>
// // // //                 ))}
// // // //               </div>
// // // //             )}

// // // //             {menuTab === "MENU" ? (
// // // //               <>
// // // //                 <h3 className="ao-subsection-title">
// // // //                   Our Menu {agentDiscount > 0 ? `(${agentDiscount}% off for you)` : ""}
// // // //                 </h3>
// // // //                 {catalogLoading ? (
// // // //                   renderProductSkeletons(4)
// // // //                 ) : filteredProducts.length === 0 ? (
// // // //                   <p className="ao-muted">No products match your search.</p>
// // // //                 ) : (
// // // //                   <div className="ao-product-grid">{filteredProducts.map(renderNormalProductCard)}</div>
// // // //                 )}
// // // //               </>
// // // //             ) : (
// // // //               <>
// // // //                 <h3 className="ao-subsection-title">Your Exclusive Products</h3>
// // // //                 {catalogLoading ? (
// // // //                   renderProductSkeletons(4)
// // // //                 ) : filteredAgentProducts.length === 0 ? (
// // // //                   <p className="ao-muted">No exclusive products assigned to you yet.</p>
// // // //                 ) : (
// // // //                   <div className="ao-product-grid">{filteredAgentProducts.map(renderAgentProductCard)}</div>
// // // //                 )}
// // // //               </>
// // // //             )}
// // // //           </section>

// // // //           {/* Card — Cart */}
// // // //           <section className="ao-card">
// // // //             <h2 className="ao-card-title">Cart</h2>
// // // //             {cart.length === 0 ? (
// // // //               <div className="ao-empty-cart">
// // // //                 <div className="ao-empty-cart-icon">🛒</div>
// // // //                 <p className="ao-muted">Your cart is empty. Add something delicious above.</p>
// // // //               </div>
// // // //             ) : (
// // // //               <div className="ao-cart-table-wrap">
// // // //                 <table className="ao-cart-table">
// // // //                   <thead>
// // // //                     <tr>
// // // //                       <th>Product</th>
// // // //                       <th>Qty</th>
// // // //                       <th>Original</th>
// // // //                       <th>Discount</th>
// // // //                       <th>Final</th>
// // // //                       <th>Subtotal</th>
// // // //                       <th></th>
// // // //                     </tr>
// // // //                   </thead>
// // // //                   <tbody>
// // // //                     {cart.map((item) => (
// // // //                       <tr key={item.cartId}>
// // // //                         <td>
// // // //                           <div className="ao-cart-product-name">{item.name}</div>
// // // //                           <span className={`ao-tag ${item.productType === "AGENT" ? "ao-tag-agent" : "ao-tag-normal"}`}>
// // // //                             {item.productType === "AGENT" ? "Agent Exclusive" : "Normal"}
// // // //                           </span>
// // // //                         </td>
// // // //                         <td>
// // // //                           <div className="ao-qty-control">
// // // //                             <button type="button" className="ao-qty-btn" onClick={() => changeCartQuantity(item.cartId, -1)}>−</button>
// // // //                             <span className="ao-qty-value">{item.quantity}</span>
// // // //                             <button type="button" className="ao-qty-btn" onClick={() => changeCartQuantity(item.cartId, 1)}>+</button>
// // // //                           </div>
// // // //                         </td>
// // // //                         <td>{currency} {formatMoney(item.originalPrice)}</td>
// // // //                         <td>{item.discountPercentage > 0 ? `${item.discountPercentage}% (-${currency} ${formatMoney(item.discountAmount)})` : "—"}</td>
// // // //                         <td>{currency} {formatMoney(item.finalPrice)}</td>
// // // //                         <td>{currency} {formatMoney(item.finalPrice * item.quantity)}</td>
// // // //                         <td>
// // // //                           <button type="button" className="ao-btn-remove" onClick={() => removeCartItem(item.cartId)} aria-label="Remove item">✕</button>
// // // //                         </td>
// // // //                       </tr>
// // // //                     ))}
// // // //                   </tbody>
// // // //                 </table>
// // // //               </div>
// // // //             )}
// // // //           </section>

// // // //           {/* Card — Notes */}
// // // //           <section className="ao-card">
// // // //             <h2 className="ao-card-title">Notes</h2>
// // // //             <div className="ao-field">
// // // //               <label>Notes for this order</label>
// // // //               <textarea
// // // //                 rows={3}
// // // //                 value={notes}
// // // //                 onChange={(e) => setNotes(e.target.value)}
// // // //                 placeholder="Anything the kitchen or delivery team should know…"
// // // //               />
// // // //             </div>
// // // //           </section>
// // // //         </div>

// // // //         {/* ── Sticky sidebar ─────────────────────────────────────────── */}
// // // //         <aside className="ao-sidebar">
// // // //           <section className="ao-card ao-summary-card">
// // // //             <h2 className="ao-card-title">Order Summary</h2>

// // // //             <div className="ao-summary-row">
// // // //               <span>Subtotal</span>
// // // //               <span>{currency} {formatMoney(originalSubtotal)}</span>
// // // //             </div>
// // // //             <div className="ao-summary-row ao-summary-discount">
// // // //               <span>Agent Discount Total</span>
// // // //               <span>-{currency} {formatMoney(discountTotal)}</span>
// // // //             </div>
// // // //             <div className="ao-summary-row">
// // // //               <span>Delivery Charge</span>
// // // //               <span>{currency} {formatMoney(deliveryCharge)}</span>
// // // //             </div>
// // // //             <div className="ao-summary-row ao-summary-grand-total">
// // // //               <span>Grand Total</span>
// // // //               <span>{currency} {formatMoney(grandTotal)}</span>
// // // //             </div>

// // // //           </section>

// // // //           <div className="ao-action-buttons">
// // // //             <button
// // // //               type="button"
// // // //               className="ao-btn ao-btn-primary ao-btn-full"
// // // //               onClick={handleCreateOrder}
// // // //               disabled={isSubmitting || agentLoading}
// // // //             >
// // // //               {isSubmitting ? "Creating…" : "Create Order"}
// // // //             </button>
// // // //           </div>
// // // //         </aside>
// // // //       </div>

// // // //       {/* ── Address add/edit modal ───────────────────────────────────── */}
// // // //       {addressModalOpen && (
// // // //         <div className="ao-modal-overlay" onClick={closeAddressModal}>
// // // //           <div className="ao-modal" onClick={(e) => e.stopPropagation()}>
// // // //             <h3 className="ao-modal-title">{editingAddressId ? "Edit Address" : "Add New Address"}</h3>

// // // //             {addressFormError && <span className="ao-error-text">{addressFormError}</span>}

// // // //             <div className="ao-field-grid">
// // // //               <div className="ao-field ao-field-full">
// // // //                 <label>Area *</label>
// // // //                 <select
// // // //                   value={addressForm.area_id ?? ""}
// // // //                   onChange={(e) => updateAddressField("area_id", e.target.value)}
// // // //                   disabled={areasLoading}
// // // //                 >
// // // //                   <option value="">{areasLoading ? "Loading areas…" : "Select an area"}</option>
// // // //                   {areas.map((a) => (
// // // //                     <option key={a.id} value={a.id}>{a.name}</option>
// // // //                   ))}
// // // //                 </select>
// // // //               </div>
// // // //               <div className="ao-field">
// // // //                 <label>Street *</label>
// // // //                 <input type="text" value={addressForm.street} onChange={(e) => updateAddressField("street", e.target.value)} />
// // // //               </div>
// // // //               <div className="ao-field">
// // // //                 <label>Country *</label>
// // // //                 <input type="text" value={addressForm.country} onChange={(e) => updateAddressField("country", e.target.value)} />
// // // //               </div>
// // // //               <div className="ao-field">
// // // //                 <label>Block</label>
// // // //                 <input type="text" value={addressForm.block} onChange={(e) => updateAddressField("block", e.target.value)} />
// // // //               </div>
// // // //               <div className="ao-field">
// // // //                 <label>Avenue</label>
// // // //                 <input type="text" value={addressForm.avenue} onChange={(e) => updateAddressField("avenue", e.target.value)} />
// // // //               </div>
// // // //               <div className="ao-field">
// // // //                 <label>Building</label>
// // // //                 <input type="text" value={addressForm.building} onChange={(e) => updateAddressField("building", e.target.value)} />
// // // //               </div>
// // // //               <div className="ao-field">
// // // //                 <label>Floor</label>
// // // //                 <input type="text" value={addressForm.floor} onChange={(e) => updateAddressField("floor", e.target.value)} />
// // // //               </div>
// // // //               <div className="ao-field">
// // // //                 <label>Apartment</label>
// // // //                 <input type="text" value={addressForm.apartment} onChange={(e) => updateAddressField("apartment", e.target.value)} />
// // // //               </div>
// // // //               <div className="ao-field ao-field-full">
// // // //                 <label>Delivery Notes</label>
// // // //                 <textarea rows={2} value={addressForm.delivery_notes} onChange={(e) => updateAddressField("delivery_notes", e.target.value)} />
// // // //               </div>
// // // //             </div>

// // // //             <div className="ao-modal-actions">
// // // //               <button type="button" className="ao-btn ao-btn-ghost" onClick={closeAddressModal}>Cancel</button>
// // // //               <button type="button" className="ao-btn ao-btn-primary" onClick={saveAddress} disabled={addressSaving}>
// // // //                 {addressSaving ? "Saving…" : editingAddressId ? "Save Changes" : "Add Address"}
// // // //               </button>
// // // //             </div>
// // // //           </div>
// // // //         </div>
// // // //       )}
// // // //     </div>
// // // //   );
// // // // };

// // // // export default AgentOrder;



// // // import React, { useEffect, useMemo, useState, useCallback } from "react";
// // // import "./agentorder.css";

// // // // ─────────────────────────────────────────────────────────────────────────────
// // // // EXISTING SERVICES ONLY (agentService.ts, areaService.ts) — nothing here
// // // // creates or modifies those services. addressService.ts is a new, minimal
// // // // file added alongside this component (see accompanying message).
// // // // ─────────────────────────────────────────────────────────────────────────────

// // // import {
// // //   getAgentDashboard,
// // //   getAgentCatalog,
// // //   createAgentOrder,
// // //   type Agent,
// // //   type AgentProduct,
// // //   type BakeryProduct,
// // //   type CreateAgentOrderPayload,
// // //   type AgentOrderItemInput,
// // // } from "../services/agentService";

// // // // Areas — same assumption as your existing SalesAgentCreateOrder file: not
// // // // included in what you shared, so point this at your real areas export if
// // // // the path/shape differs.
// // // import { getAreas } from "../services/areaService";

// // // import {
// // //   getMyAddresses,
// // //   createAddress,
// // //   updateAddress,
// // //   deleteAddress,
// // //   type Address,
// // // } from "../services/addressService";

// // // type AddressInput = Omit<Address, "id" | "user_id">;

// // // // =============================================================================
// // // // ─── TYPES ───────────────────────────────────────────────────────────────────
// // // // =============================================================================

// // // interface AreaOption {
// // //   id: number;
// // //   name: string;
// // //   currency?: string;
// // //   delivery_charge?: number;
// // // }

// // // type ProductType = "NORMAL" | "AGENT";

// // // interface CartItem {
// // //   cartId: string;
// // //   productId: number;
// // //   productType: ProductType;
// // //   name: string;
// // //   image?: string;
// // //   originalPrice: number;
// // //   discountPercentage: number; // 0 for AGENT products
// // //   discountAmount: number; // per unit
// // //   finalPrice: number; // per unit, after discount
// // //   quantity: number;
// // //   currency: string;
// // //   // Agent-exclusive product options (optional — only present when the
// // //   // product actually exposes variants/flavours)
// // //   variantId?: string | number;
// // //   variantName?: string;
// // //   flavourId?: string | number;
// // //   flavourName?: string;
// // // }

// // // type DeliveryMethod = "PICKUP" | "DELIVERY";

// // // type PaymentMethodOption = "COD" | "CARD" | "KNET" | "UPI" | "LINK";

// // // type MenuTab = "MENU" | "AGENT_MENU";

// // // interface FormErrors {
// // //   deliveryMethod?: string;
// // //   address?: string;
// // //   items?: string;
// // //   paymentMethod?: string;
// // //   pickupDate?: string;
// // //   pickupTimeSlot?: string;
// // //   deliveryDate?: string;
// // //   deliveryTimeSlot?: string;
// // // }

// // // interface AddressFormState {
// // //   area_id: number | null;
// // //   street: string;
// // //   country: string;
// // //   block: string;
// // //   avenue: string;
// // //   building: string;
// // //   floor: string;
// // //   apartment: string;
// // //   delivery_notes: string;
// // // }

// // // /**
// // //  * Minimal shapes for optional variant/flavour data that may be attached to
// // //  * an AgentProduct by the backend. Nothing here assumes agentService.ts has
// // //  * been changed — these are read defensively via `(product as any)` in the
// // //  * same spirit as `getCategoryName` below, so products without this data
// // //  * keep working exactly as before.
// // //  */
// // // interface ProductVariantOption {
// // //   id: string | number;
// // //   name: string;
// // //   price_modifier?: number; // added to base price when selected
// // // }

// // // interface ProductFlavourOption {
// // //   id: string | number;
// // //   name: string;
// // // }

// // // /**
// // //  * CreateAgentOrderPayload (agentService.ts) doesn't currently have fields for
// // //  * order_source, delivery_method, agent-side notes, or a discount summary.
// // //  * This local type is a strict superset — assigning an object of this shape
// // //  * to the real payload type still type-checks, so createAgentOrder() accepts
// // //  * it as-is. Add matching columns/handling on the backend to actually persist
// // //  * these extra fields; until then they'll simply be ignored by the API.
// // //  */
// // // interface AgentOrderPayloadExtended extends CreateAgentOrderPayload {
// // //   order_source?: "AGENT_SELF";
// // //   delivery_method?: DeliveryMethod;
// // //   agent_notes?: string;
// // //   agent_discount_percentage?: number;
// // //   discount_total?: number;
// // //   delivery_charge?: number;
// // //   subtotal?: number;
// // //   grand_total?: number;
// // // }

// // // const TIME_SLOTS = [
// // //   "9:00 AM - 10:00 AM",
// // //   "10:00 AM - 11:00 AM",
// // //   "11:00 AM - 12:00 PM",
// // //   "12:00 PM - 1:00 PM",
// // //   "1:00 PM - 2:00 PM",
// // //   "2:00 PM - 3:00 PM",
// // //   "3:00 PM - 4:00 PM",
// // //   "4:00 PM - 5:00 PM",
// // //   "5:00 PM - 6:00 PM",
// // //   "6:00 PM - 7:00 PM",
// // //   "7:00 PM - 8:00 PM",
// // //   "8:00 PM - 9:00 PM",
// // //   "9:00 PM - 10:00 PM",
// // // ];

// // // const PAYMENT_METHODS: { value: PaymentMethodOption; label: string }[] = [
// // //   { value: "COD", label: "Cash" },
// // //   { value: "CARD", label: "Card" },
// // //   { value: "KNET", label: "KNET" },
// // //   { value: "UPI", label: "UPI" },
// // //   { value: "LINK", label: "Other" },
// // // ];

// // // const EMPTY_ADDRESS_FORM: AddressFormState = {
// // //   area_id: null,
// // //   street: "",
// // //   country: "",
// // //   block: "",
// // //   avenue: "",
// // //   building: "",
// // //   floor: "",
// // //   apartment: "",
// // //   delivery_notes: "",
// // // };

// // // // How many products to show initially / per "Show More" click.
// // // const PRODUCTS_PAGE_SIZE = 4;

// // // // =============================================================================
// // // // ─── HELPERS ─────────────────────────────────────────────────────────────────
// // // // =============================================================================

// // // const makeCartId = (): string =>
// // //   `cart_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

// // // const formatMoney = (value: number): string => (value || 0).toFixed(2);

// // // const cartKey = (productId: number, type: ProductType) => `${type}-${productId}`;

// // // /**
// // //  * category can come back from the API as a plain string OR as an object
// // //  * (e.g. { id, name }). Rendering an object directly via String(obj) produces
// // //  * "[object Object]" — this normalizes it to a display-safe string, or null
// // //  * when there's nothing usable.
// // //  */
// // // const getCategoryName = (category: unknown): string | null => {
// // //   if (category === null || category === undefined) return null;
// // //   if (typeof category === "string") return category.trim() || null;
// // //   if (typeof category === "number") return String(category);
// // //   if (typeof category === "object") {
// // //     const c = category as any;
// // //     return c.name ?? c.title ?? c.label ?? null;
// // //   }
// // //   return null;
// // // };

// // // /**
// // //  * Reads a list of { id, name } style options off a product for a given key,
// // //  * tolerating a couple of common alternate key spellings (e.g. "flavors" vs
// // //  * "flavours") and either an array of objects or an array of plain strings.
// // //  */
// // // const getOptionList = (
// // //   product: unknown,
// // //   keys: string[]
// // // ): ProductVariantOption[] => {
// // //   if (!product || typeof product !== "object") return [];
// // //   const p = product as any;
// // //   for (const key of keys) {
// // //     const raw = p[key];
// // //     if (Array.isArray(raw) && raw.length > 0) {
// // //       return raw
// // //         .map((entry: any, idx: number) => {
// // //           if (entry === null || entry === undefined) return null;
// // //           if (typeof entry === "string" || typeof entry === "number") {
// // //             return { id: String(entry), name: String(entry) };
// // //           }
// // //           if (typeof entry === "object") {
// // //             const id = entry.id ?? entry.value ?? entry.code ?? idx;
// // //             const name = entry.name ?? entry.label ?? entry.title ?? String(id);
// // //             const price_modifier =
// // //               typeof entry.price_modifier === "number"
// // //                 ? entry.price_modifier
// // //                 : typeof entry.price_delta === "number"
// // //                 ? entry.price_delta
// // //                 : undefined;
// // //             return { id, name, price_modifier };
// // //           }
// // //           return null;
// // //         })
// // //         .filter(Boolean) as ProductVariantOption[];
// // //     }
// // //   }
// // //   return [];
// // // };

// // // const getVariantOptions = (product: unknown): ProductVariantOption[] =>
// // //   getOptionList(product, ["variants", "variant_options", "product_variants"]);

// // // const getFlavourOptions = (product: unknown): ProductFlavourOption[] =>
// // //   getOptionList(product, ["flavours", "flavors", "flavour_options", "flavor_options"]);

// // // // =============================================================================
// // // // ─── COMPONENT ───────────────────────────────────────────────────────────────
// // // // =============================================================================

// // // const AgentOrder: React.FC = () => {
// // //   // ── Logged-in agent (auto-loaded, never typed manually) ─────────────────
// // //   const [agent, setAgent] = useState<Agent | null>(null);
// // //   const [agentLoading, setAgentLoading] = useState<boolean>(true);
// // //   const agentDiscount = agent?.default_discount ?? 0;

// // //   // ── Addresses ────────────────────────────────────────────────────────────
// // //   const [addresses, setAddresses] = useState<Address[]>([]);
// // //   const [addressesLoading, setAddressesLoading] = useState<boolean>(true);
// // //   const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

// // //   const [addressModalOpen, setAddressModalOpen] = useState<boolean>(false);
// // //   const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
// // //   const [addressForm, setAddressForm] = useState<AddressFormState>(EMPTY_ADDRESS_FORM);
// // //   const [addressSaving, setAddressSaving] = useState<boolean>(false);
// // //   const [addressFormError, setAddressFormError] = useState<string>("");

// // //   // ── Areas (for address form + delivery charge lookup) ──────────────────
// // //   const [areas, setAreas] = useState<AreaOption[]>([]);
// // //   const [areasLoading, setAreasLoading] = useState<boolean>(true);

// // //   // ── Delivery method ──────────────────────────────────────────────────────
// // //   const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("PICKUP");
// // //   const [pickupDate, setPickupDate] = useState<string>("");
// // //   const [pickupTimeSlot, setPickupTimeSlot] = useState<string>("");
// // //   const [deliveryDate, setDeliveryDate] = useState<string>("");
// // //   const [deliveryTimeSlot, setDeliveryTimeSlot] = useState<string>("");

// // //   // ── Catalog: normal products + agent's own products ─────────────────────
// // //   const [products, setProducts] = useState<BakeryProduct[]>([]);
// // //   const [agentProducts, setAgentProducts] = useState<AgentProduct[]>([]);
// // //   const [catalogLoading, setCatalogLoading] = useState<boolean>(true);
// // //   const [catalogError, setCatalogError] = useState<string>("");

// // //   const [searchTerm, setSearchTerm] = useState<string>("");
// // //   const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
// // //   const [draftQuantities, setDraftQuantities] = useState<Record<string, number>>({});

// // //   // ── Agent-exclusive product option selections (variant / flavour) ──────
// // //   const [draftVariants, setDraftVariants] = useState<Record<string, string>>({});
// // //   const [draftFlavours, setDraftFlavours] = useState<Record<string, string>>({});

// // //   // ── Menu / Agent Menu tab switcher ───────────────────────────────────────
// // //   const [menuTab, setMenuTab] = useState<MenuTab>("MENU");

// // //   // ── Pagination ("show first 4, then Show More") per grid ───────────────
// // //   const [menuVisibleCount, setMenuVisibleCount] = useState<number>(PRODUCTS_PAGE_SIZE);
// // //   const [agentMenuVisibleCount, setAgentMenuVisibleCount] = useState<number>(PRODUCTS_PAGE_SIZE);

// // //   // ── Cart ─────────────────────────────────────────────────────────────────
// // //   const [cart, setCart] = useState<CartItem[]>([]);

// // //   // ── Payment / notes ──────────────────────────────────────────────────────
// // //   const [paymentMethod, setPaymentMethod] = useState<PaymentMethodOption | "">("");
// // //   const [notes, setNotes] = useState<string>("");
// // //   const [currency, setCurrency] = useState<string>("KWD");

// // //   // ── Submission ───────────────────────────────────────────────────────────
// // //   const [errors, setErrors] = useState<FormErrors>({});
// // //   const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
// // //   const [successMessage, setSuccessMessage] = useState<string>("");
// // //   const [submitError, setSubmitError] = useState<string>("");

// // //   // ── Load agent profile, addresses, areas, catalog on mount ─────────────
// // //   useEffect(() => {
// // //     let cancelled = false;

// // //     const loadAgent = async () => {
// // //       setAgentLoading(true);
// // //       try {
// // //         const dashboard = await getAgentDashboard();
// // //         if (!cancelled) setAgent(dashboard.agent);
// // //       } catch (err) {
// // //         if (!cancelled) setSubmitError("Unable to load your agent profile. Please refresh.");
// // //       } finally {
// // //         if (!cancelled) setAgentLoading(false);
// // //       }
// // //     };

// // //     const loadAddresses = async () => {
// // //       setAddressesLoading(true);
// // //       try {
// // //         const list = await getMyAddresses();
// // //         if (!cancelled) {
// // //           setAddresses(list);
// // //           if (list[0]?.id) setSelectedAddressId(list[0].id);
// // //         }
// // //       } catch (err) {
// // //         if (!cancelled) setCatalogError((prev) => prev || "Unable to load your saved addresses.");
// // //       } finally {
// // //         if (!cancelled) setAddressesLoading(false);
// // //       }
// // //     };

// // //     const loadAreas = async () => {
// // //       setAreasLoading(true);
// // //       try {
// // //         const list = await getAreas();
// // //         if (!cancelled) setAreas(list as AreaOption[]);
// // //       } catch (err) {
// // //         if (!cancelled) setCatalogError((prev) => prev || "Unable to load delivery areas.");
// // //       } finally {
// // //         if (!cancelled) setAreasLoading(false);
// // //       }
// // //     };

// // //     const loadCatalog = async () => {
// // //       setCatalogLoading(true);
// // //       setCatalogError("");
// // //       try {
// // //         const catalog = await getAgentCatalog(currency);
// // //         if (!cancelled) {
// // //           setProducts(catalog.products || []);
// // //           setAgentProducts(catalog.agent_products || []);
// // //         }
// // //       } catch (err) {
// // //         if (!cancelled) setCatalogError((prev) => prev || "Unable to load the menu. Please refresh and try again.");
// // //       } finally {
// // //         if (!cancelled) setCatalogLoading(false);
// // //       }
// // //     };

// // //     loadAgent();
// // //     loadAddresses();
// // //     loadAreas();
// // //     loadCatalog();

// // //     return () => {
// // //       cancelled = true;
// // //     };
// // //     // eslint-disable-next-line react-hooks/exhaustive-deps
// // //   }, []);

// // //   // ── Derived: selected address + its area (drives delivery charge) ──────
// // //   const selectedAddress = useMemo(
// // //     () => addresses.find((a) => a.id === selectedAddressId) || null,
// // //     [addresses, selectedAddressId]
// // //   );

// // //   const selectedArea = useMemo(
// // //     () => (selectedAddress ? areas.find((a) => a.id === selectedAddress.area_id) || null : null),
// // //     [selectedAddress, areas]
// // //   );

// // //   useEffect(() => {
// // //     if (selectedArea?.currency) setCurrency(selectedArea.currency);
// // //   }, [selectedArea]);

// // //   const deliveryCharge = useMemo(() => {
// // //     if (deliveryMethod !== "DELIVERY") return 0;
// // //     return selectedArea?.delivery_charge ?? 0;
// // //   }, [deliveryMethod, selectedArea]);

// // //   // ── Categories — only from the active tab's product set, normalized ────
// // //   const categories = useMemo(() => {
// // //     const sourceList = menuTab === "MENU" ? products : agentProducts;
// // //     const set = new Set<string>();
// // //     sourceList.forEach((p) => {
// // //       const name = getCategoryName((p as any).category);
// // //       if (name) set.add(name);
// // //     });
// // //     return Array.from(set);
// // //   }, [products, agentProducts, menuTab]);

// // //   // Reset category filter whenever the tab changes, since categories differ per tab
// // //   useEffect(() => {
// // //     setCategoryFilter("ALL");
// // //   }, [menuTab]);

// // //   // Reset pagination whenever the tab, search term, or category filter
// // //   // changes, so a fresh filter always starts back at the first page.
// // //   useEffect(() => {
// // //     setMenuVisibleCount(PRODUCTS_PAGE_SIZE);
// // //     setAgentMenuVisibleCount(PRODUCTS_PAGE_SIZE);
// // //   }, [menuTab, searchTerm, categoryFilter]);

// // //   // ── Filtering (search + category) applies within the active tab only ───
// // //   const matchesFilters = useCallback(
// // //     (name: string, category: unknown) => {
// // //       const term = searchTerm.trim().toLowerCase();
// // //       const matchesSearch = !term || (name || "").toLowerCase().includes(term);
// // //       const categoryName = getCategoryName(category) ?? "";
// // //       const matchesCategory = categoryFilter === "ALL" || categoryName === categoryFilter;
// // //       return matchesSearch && matchesCategory;
// // //     },
// // //     [searchTerm, categoryFilter]
// // //   );

// // //   const filteredProducts = useMemo(
// // //     () => products.filter((p) => matchesFilters(p.name, (p as any).category)),
// // //     [products, matchesFilters]
// // //   );

// // //   const filteredAgentProducts = useMemo(
// // //     () => agentProducts.filter((p) => matchesFilters(p.name, (p as any).category)),
// // //     [agentProducts, matchesFilters]
// // //   );

// // //   // ── Pagination slices ────────────────────────────────────────────────────
// // //   const visibleProducts = useMemo(
// // //     () => filteredProducts.slice(0, menuVisibleCount),
// // //     [filteredProducts, menuVisibleCount]
// // //   );
// // //   const hasMoreProducts = filteredProducts.length > visibleProducts.length;

// // //   const visibleAgentProducts = useMemo(
// // //     () => filteredAgentProducts.slice(0, agentMenuVisibleCount),
// // //     [filteredAgentProducts, agentMenuVisibleCount]
// // //   );
// // //   const hasMoreAgentProducts = filteredAgentProducts.length > visibleAgentProducts.length;

// // //   const showMoreProducts = () =>
// // //     setMenuVisibleCount((prev) => prev + PRODUCTS_PAGE_SIZE);

// // //   const showMoreAgentProducts = () =>
// // //     setAgentMenuVisibleCount((prev) => prev + PRODUCTS_PAGE_SIZE);

// // //   // ── Draft quantity (per product card, before "Add") ─────────────────────
// // //   const getDraftQty = (key: string) => draftQuantities[key] ?? 1;

// // //   const changeDraftQty = (key: string, delta: number) => {
// // //     setDraftQuantities((prev) => ({
// // //       ...prev,
// // //       [key]: Math.max(1, (prev[key] ?? 1) + delta),
// // //     }));
// // //   };

// // //   // ── Draft variant / flavour selection (agent-exclusive products) ───────
// // //   const getDraftVariantId = (key: string, options: ProductVariantOption[]) =>
// // //     draftVariants[key] ?? (options[0] ? String(options[0].id) : "");

// // //   const getDraftFlavourId = (key: string, options: ProductFlavourOption[]) =>
// // //     draftFlavours[key] ?? (options[0] ? String(options[0].id) : "");

// // //   const setDraftVariant = (key: string, value: string) =>
// // //     setDraftVariants((prev) => ({ ...prev, [key]: value }));

// // //   const setDraftFlavour = (key: string, value: string) =>
// // //     setDraftFlavours((prev) => ({ ...prev, [key]: value }));

// // //   // ── Discount math (display + cart only — never touches product prices) ──
// // //   const getDiscountedPrice = (price: number) => {
// // //     const discountAmount = (price * agentDiscount) / 100;
// // //     return { discountAmount, finalPrice: price - discountAmount };
// // //   };

// // //   // ── Add to cart (merges into an existing row for the same product +
// // //   //     same variant/flavour selection) ──────────────────────────────────
// // //   const mergeOrAddToCart = (item: Omit<CartItem, "cartId">) => {
// // //     setCart((prev) => {
// // //       const idx = prev.findIndex(
// // //         (c) =>
// // //           c.productId === item.productId &&
// // //           c.productType === item.productType &&
// // //           (c.variantId ?? null) === (item.variantId ?? null) &&
// // //           (c.flavourId ?? null) === (item.flavourId ?? null)
// // //       );
// // //       if (idx >= 0) {
// // //         const next = [...prev];
// // //         next[idx] = { ...next[idx], quantity: next[idx].quantity + item.quantity };
// // //         return next;
// // //       }
// // //       return [...prev, { ...item, cartId: makeCartId() }];
// // //     });
// // //     setErrors((prev) => ({ ...prev, items: undefined }));
// // //   };

// // //   const addNormalProductToCart = (product: BakeryProduct) => {
// // //     const key = cartKey(product.id, "NORMAL");
// // //     const qty = getDraftQty(key);
// // //     const price = product.price || 0;
// // //     const { discountAmount, finalPrice } = getDiscountedPrice(price);
// // //     mergeOrAddToCart({
// // //       productId: product.id,
// // //       productType: "NORMAL",
// // //       name: product.name,
// // //       image: (product as any).image_url,
// // //       originalPrice: price,
// // //       discountPercentage: agentDiscount,
// // //       discountAmount,
// // //       finalPrice,
// // //       quantity: qty,
// // //       currency,
// // //     });
// // //     setDraftQuantities((prev) => ({ ...prev, [key]: 1 }));
// // //   };

// // //   const addAgentProductToCart = (product: AgentProduct) => {
// // //     const key = cartKey(product.id, "AGENT");
// // //     const qty = getDraftQty(key);

// // //     const variantOptions = getVariantOptions(product);
// // //     const flavourOptions = getFlavourOptions(product);

// // //     const selectedVariantId = variantOptions.length
// // //       ? getDraftVariantId(key, variantOptions)
// // //       : "";
// // //     const selectedFlavourId = flavourOptions.length
// // //       ? getDraftFlavourId(key, flavourOptions)
// // //       : "";

// // //     const selectedVariant = variantOptions.find((v) => String(v.id) === selectedVariantId);
// // //     const selectedFlavour = flavourOptions.find((f) => String(f.id) === selectedFlavourId);

// // //     const basePrice = product.price || 0;
// // //     const price = basePrice + (selectedVariant?.price_modifier ?? 0);

// // //     mergeOrAddToCart({
// // //       productId: product.id,
// // //       productType: "AGENT",
// // //       name: product.name,
// // //       image: product.image || undefined,
// // //       originalPrice: price,
// // //       discountPercentage: 0,
// // //       discountAmount: 0,
// // //       finalPrice: price,
// // //       quantity: qty,
// // //       currency: "KWD",
// // //       variantId: selectedVariant?.id,
// // //       variantName: selectedVariant?.name,
// // //       flavourId: selectedFlavour?.id,
// // //       flavourName: selectedFlavour?.name,
// // //     });
// // //     setDraftQuantities((prev) => ({ ...prev, [key]: 1 }));
// // //   };

// // //   // ── Cart row handlers ────────────────────────────────────────────────────
// // //   const changeCartQuantity = (cartId: string, delta: number) => {
// // //     setCart((prev) =>
// // //       prev.map((item) =>
// // //         item.cartId === cartId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
// // //       )
// // //     );
// // //   };

// // //   const removeCartItem = (cartId: string) => {
// // //     setCart((prev) => prev.filter((item) => item.cartId !== cartId));
// // //   };

// // //   // ── Totals ───────────────────────────────────────────────────────────────
// // //   const originalSubtotal = useMemo(
// // //     () => cart.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0),
// // //     [cart]
// // //   );

// // //   const discountTotal = useMemo(
// // //     () => cart.reduce((sum, item) => sum + item.discountAmount * item.quantity, 0),
// // //     [cart]
// // //   );

// // //   const subtotalAfterDiscount = originalSubtotal - discountTotal;

// // //   const grandTotal = useMemo(
// // //     () => Math.max(subtotalAfterDiscount + deliveryCharge, 0),
// // //     [subtotalAfterDiscount, deliveryCharge]
// // //   );

// // //   // ── Address CRUD ─────────────────────────────────────────────────────────
// // //   const openAddAddressModal = () => {
// // //     setEditingAddressId(null);
// // //     setAddressForm(EMPTY_ADDRESS_FORM);
// // //     setAddressFormError("");
// // //     setAddressModalOpen(true);
// // //   };

// // //   const openEditAddressModal = (addr: Address) => {
// // //     setEditingAddressId(addr.id ?? null);
// // //     setAddressForm({
// // //       area_id: addr.area_id,
// // //       street: addr.street || "",
// // //       country: addr.country || "",
// // //       block: addr.block || "",
// // //       avenue: addr.avenue || "",
// // //       building: addr.building || "",
// // //       floor: addr.floor || "",
// // //       apartment: addr.apartment || "",
// // //       delivery_notes: addr.delivery_notes || "",
// // //     });
// // //     setAddressFormError("");
// // //     setAddressModalOpen(true);
// // //   };

// // //   const closeAddressModal = () => {
// // //     setAddressModalOpen(false);
// // //     setEditingAddressId(null);
// // //     setAddressForm(EMPTY_ADDRESS_FORM);
// // //     setAddressFormError("");
// // //   };

// // //   const updateAddressField = (field: keyof AddressFormState, value: string) => {
// // //     setAddressForm((prev) => ({
// // //       ...prev,
// // //       [field]: field === "area_id" ? (value ? Number(value) : null) : value,
// // //     }));
// // //   };

// // //   const saveAddress = async () => {
// // //     if (!addressForm.area_id) {
// // //       setAddressFormError("Please select an area.");
// // //       return;
// // //     }
// // //     if (!addressForm.street.trim() || !addressForm.country.trim()) {
// // //       setAddressFormError("Street and country are required.");
// // //       return;
// // //     }

// // //     const payload: AddressInput = {
// // //       area_id: addressForm.area_id,
// // //       street: addressForm.street.trim(),
// // //       country: addressForm.country.trim(),
// // //       block: addressForm.block.trim() || undefined,
// // //       avenue: addressForm.avenue.trim() || undefined,
// // //       building: addressForm.building.trim() || undefined,
// // //       floor: addressForm.floor.trim() || undefined,
// // //       apartment: addressForm.apartment.trim() || undefined,
// // //       delivery_notes: addressForm.delivery_notes.trim() || undefined,
// // //     };

// // //     setAddressSaving(true);
// // //     setAddressFormError("");
// // //     try {
// // //       if (editingAddressId) {
// // //         const updated = await updateAddress(editingAddressId, payload);
// // //         setAddresses((prev) => prev.map((a) => (a.id === editingAddressId ? updated : a)));
// // //       } else {
// // //         const created = await createAddress(payload);
// // //         setAddresses((prev) => [...prev, created]);
// // //         setSelectedAddressId(created.id);
// // //       }
// // //       closeAddressModal();
// // //     } catch (err) {
// // //       setAddressFormError("Could not save this address. Please check the details and try again.");
// // //     } finally {
// // //       setAddressSaving(false);
// // //     }
// // //   };

// // //   const handleDeleteAddress = async (id: number) => {
// // //     if (!window.confirm("Delete this address?")) return;
// // //     try {
// // //       await deleteAddress(id);
// // //       setAddresses((prev) => prev.filter((a) => a.id !== id));
// // //       if (selectedAddressId === id) {
// // //         setSelectedAddressId(null);
// // //       }
// // //     } catch (err) {
// // //       setSubmitError("Could not delete this address. Please try again.");
// // //     }
// // //   };

// // //   // ── Validation ───────────────────────────────────────────────────────────
// // //   const validateForm = (): boolean => {
// // //     const next: FormErrors = {};
// // //     if (!deliveryMethod) {
// // //       next.deliveryMethod = "Choose Pickup or Delivery";
// // //     }

// // //     if (deliveryMethod === "PICKUP") {
// // //       if (!pickupDate) {
// // //         next.pickupDate = "Pickup date is required";
// // //       }
// // //       if (!pickupTimeSlot) {
// // //         next.pickupTimeSlot = "Pickup time is required";
// // //       }
// // //     }

// // //     if (deliveryMethod === "DELIVERY") {
// // //       if (!selectedAddressId) {
// // //         next.address = "Select a delivery address, or add a new one";
// // //       }
// // //       if (!deliveryDate) {
// // //         next.deliveryDate = "Delivery date is required";
// // //       }
// // //       if (!deliveryTimeSlot) {
// // //         next.deliveryTimeSlot = "Delivery time slot is required";
// // //       }
// // //     }

// // //     if (cart.length === 0) {
// // //       next.items = "Add at least one product to the cart";
// // //     }
// // //     // Payment method is intentionally not required for agent-created orders.
// // //     // The backend defaults to COD when payment_method is not provided.
// // //     setErrors(next);
// // //     return Object.keys(next).length === 0;
// // //   };

// // //   // ── Payload builder ──────────────────────────────────────────────────────
// // //   const buildPayload = (): AgentOrderPayloadExtended => {
// // //     const items: AgentOrderItemInput[] = cart.map((item) => ({
// // //       product_id: item.productId,
// // //       quantity: item.quantity,
// // //       custom_json: {
// // //         product_type: item.productType,
// // //         original_price: Number(item.originalPrice.toFixed(2)),
// // //         discount_percentage: Number(item.discountPercentage.toFixed(2)),
// // //         discount_amount: Number(item.discountAmount.toFixed(2)),
// // //         final_price: Number(item.finalPrice.toFixed(2)),
// // //         line_total: Number((item.finalPrice * item.quantity).toFixed(2)),
// // //         ...(item.variantId !== undefined
// // //           ? { variant_id: item.variantId, variant_name: item.variantName }
// // //           : {}),
// // //         ...(item.flavourId !== undefined
// // //           ? { flavour_id: item.flavourId, flavour_name: item.flavourName }
// // //           : {}),
// // //       },
// // //     }));

// // //     const isPickup = deliveryMethod === "PICKUP";

// // //     const payload: AgentOrderPayloadExtended = {
// // //       customer_id: agent!.id,
// // //       address_id: isPickup ? null : selectedAddressId ?? null,
// // //       items,
// // //       payment_method: paymentMethod || "COD",
// // //       currency: currency as CreateAgentOrderPayload["currency"],
// // //       delivery_date: !isPickup ? deliveryDate || undefined : undefined,
// // //       delivery_time_slot: !isPickup ? deliveryTimeSlot || undefined : undefined,
// // //       pickup_date: isPickup ? pickupDate || undefined : undefined,
// // //       pickup_time_slot: isPickup ? pickupTimeSlot || undefined : undefined,
// // //       order_source: "AGENT_SELF",
// // //       delivery_method: deliveryMethod,
// // //       agent_notes: notes.trim() || undefined,
// // //       agent_discount_percentage: Number(agentDiscount.toFixed(2)),
// // //       discount_total: Number(discountTotal.toFixed(2)),
// // //       delivery_charge: Number(deliveryCharge.toFixed(2)),
// // //       subtotal: Number(originalSubtotal.toFixed(2)),
// // //       grand_total: Number(grandTotal.toFixed(2)),
// // //     };

// // //     console.log("========================================");
// // //     console.log("CREATE AGENT ORDER PAYLOAD");
// // //     console.log("========================================");
// // //     console.log(JSON.stringify(payload, null, 2));

// // //     return payload;
// // //   };

// // //   const resetOrderState = () => {
// // //     setCart([]);
// // //     setPaymentMethod("");
// // //     setNotes("");
// // //     setDeliveryMethod("PICKUP");
// // //     setPickupDate("");
// // //     setPickupTimeSlot("");
// // //     setDeliveryDate("");
// // //     setDeliveryTimeSlot("");
// // //     setErrors({});
// // //   };

// // //   // ── Submit ───────────────────────────────────────────────────────────────
// // //   const handleCreateOrder = async () => {
// // //     setSuccessMessage("");
// // //     setSubmitError("");

// // //     if (!agent) {
// // //       setSubmitError("Your agent profile hasn't finished loading yet.");
// // //       return;
// // //     }

// // //     if (!validateForm()) {
// // //       return;
// // //     }

// // //     if (deliveryMethod === "DELIVERY" && !selectedAddressId) {
// // //       setSubmitError("Please select a delivery address.");
// // //       return;
// // //     }

// // //     if (deliveryMethod === "PICKUP" && (!pickupDate || !pickupTimeSlot)) {
// // //       setSubmitError("Please select pickup date and time.");
// // //       return;
// // //     }

// // //     if (cart.length === 0) {
// // //       setSubmitError("Please add at least one product.");
// // //       return;
// // //     }

// // //     setIsSubmitting(true);

// // //     try {
// // //       const payload = buildPayload();
// // //       const order = await createAgentOrder(payload);
// // //       console.log("ORDER CREATED:", order);
// // //       setSuccessMessage("Order created successfully.");
// // //       resetOrderState();
// // //     } catch (err: any) {
// // //       console.error("========================================");
// // //       console.error("ORDER CREATION FAILED");
// // //       console.error("========================================");
// // //       console.error("Status:", err?.response?.status);
// // //       console.error("Backend response:", err?.response?.data);

// // //       const message =
// // //         err?.response?.data?.error ||
// // //         err?.response?.data?.message ||
// // //         err?.message ||
// // //         "Could not create the order.";

// // //       setSubmitError(message);
// // //     } finally {
// // //       setIsSubmitting(false);
// // //     }
// // //   };

// // //   // ── Render helpers ───────────────────────────────────────────────────────

// // //   const renderNormalProductCard = (product: BakeryProduct) => {
// // //     const key = cartKey(product.id, "NORMAL");
// // //     const price = product.price || 0;
// // //     const { finalPrice } = getDiscountedPrice(price);
// // //     const outOfStock = (product as any).stock !== undefined && (product as any).stock <= 0;

// // //     return (
// // //       <div className="ao-product-card" key={key}>
// // //         {agentDiscount > 0 && <span className="ao-badge ao-badge-discount">{agentDiscount}% OFF</span>}
// // //         <div className="ao-product-image-wrap">
// // //           {(product as any).image_url ? (
// // //             <img src={(product as any).image_url} alt={product.name} className="ao-product-image" />
// // //           ) : (
// // //             <div className="ao-product-image-placeholder">No Image</div>
// // //           )}
// // //         </div>
// // //         <div className="ao-product-info">
// // //           <p className="ao-product-name">{product.name}</p>
// // //           {(product as any).description && (
// // //             <p className="ao-product-desc">{(product as any).description}</p>
// // //           )}
// // //           <div className="ao-price-row">
// // //             {agentDiscount > 0 ? (
// // //               <>
// // //                 <span className="ao-price-original">KWD {formatMoney(price)}</span>
// // //                 <span className="ao-price-final">KWD {formatMoney(finalPrice)}</span>
// // //               </>
// // //             ) : (
// // //               <span className="ao-price-final">{currency} {formatMoney(price)}</span>
// // //             )}
// // //           </div>
// // //         </div>
// // //         <div className="ao-card-footer">
// // //           <div className="ao-qty-control">
// // //             <button type="button" className="ao-qty-btn" onClick={() => changeDraftQty(key, -1)} aria-label="Decrease quantity">−</button>
// // //             <span className="ao-qty-value">{getDraftQty(key)}</span>
// // //             <button type="button" className="ao-qty-btn" onClick={() => changeDraftQty(key, 1)} aria-label="Increase quantity">+</button>
// // //           </div>
// // //           <button
// // //             type="button"
// // //             className="ao-btn ao-btn-add"
// // //             disabled={outOfStock}
// // //             onClick={() => addNormalProductToCart(product)}
// // //           >
// // //             {outOfStock ? "Out of Stock" : "Add"}
// // //           </button>
// // //         </div>
// // //       </div>
// // //     );
// // //   };

// // //   const renderAgentProductCard = (product: AgentProduct) => {
// // //     const key = cartKey(product.id, "AGENT");
// // //     const price = product.price || 0;

// // //     const variantOptions = getVariantOptions(product);
// // //     const flavourOptions = getFlavourOptions(product);

// // //     const selectedVariantId = variantOptions.length
// // //       ? getDraftVariantId(key, variantOptions)
// // //       : "";
// // //     const selectedFlavourId = flavourOptions.length
// // //       ? getDraftFlavourId(key, flavourOptions)
// // //       : "";

// // //     const selectedVariant = variantOptions.find((v) => String(v.id) === selectedVariantId);
// // //     const displayPrice = price + (selectedVariant?.price_modifier ?? 0);

// // //     return (
// // //       <div className="ao-product-card" key={key}>
// // //         <span className="ao-badge ao-badge-exclusive">Agent Exclusive</span>
// // //         <div className="ao-product-image-wrap">
// // //           {product.image ? (
// // //             <img src={product.image} alt={product.name} className="ao-product-image" />
// // //           ) : (
// // //             <div className="ao-product-image-placeholder">No Image</div>
// // //           )}
// // //         </div>
// // //         <div className="ao-product-info">
// // //           <p className="ao-product-name">{product.name}</p>
// // //           {product.description && <p className="ao-product-desc">{product.description}</p>}

// // //           {variantOptions.length > 0 && (
// // //             <div className="ao-field ao-option-field">
// // //               <label>Variant</label>
// // //               <select
// // //                 value={selectedVariantId}
// // //                 onChange={(e) => setDraftVariant(key, e.target.value)}
// // //               >
// // //                 {variantOptions.map((v) => (
// // //                   <option key={v.id} value={String(v.id)}>
// // //                     {v.name}
// // //                     {v.price_modifier ? ` (+${currency === "KWD" ? "KWD" : currency} ${formatMoney(v.price_modifier)})` : ""}
// // //                   </option>
// // //                 ))}
// // //               </select>
// // //             </div>
// // //           )}

// // //           {flavourOptions.length > 0 && (
// // //             <div className="ao-field ao-option-field">
// // //               <label>Flavour</label>
// // //               <select
// // //                 value={selectedFlavourId}
// // //                 onChange={(e) => setDraftFlavour(key, e.target.value)}
// // //               >
// // //                 {flavourOptions.map((f) => (
// // //                   <option key={f.id} value={String(f.id)}>
// // //                     {f.name}
// // //                   </option>
// // //                 ))}
// // //               </select>
// // //             </div>
// // //           )}

// // //           <div className="ao-price-row">
// // //             <span className="ao-price-final">KWD {formatMoney(displayPrice)}</span>
// // //           </div>
// // //         </div>
// // //         <div className="ao-card-footer">
// // //           <div className="ao-qty-control">
// // //             <button type="button" className="ao-qty-btn" onClick={() => changeDraftQty(key, -1)} aria-label="Decrease quantity">−</button>
// // //             <span className="ao-qty-value">{getDraftQty(key)}</span>
// // //             <button type="button" className="ao-qty-btn" onClick={() => changeDraftQty(key, 1)} aria-label="Increase quantity">+</button>
// // //           </div>
// // //           <button type="button" className="ao-btn ao-btn-add" onClick={() => addAgentProductToCart(product)}>
// // //             Add
// // //           </button>
// // //         </div>
// // //       </div>
// // //     );
// // //   };

// // //   const renderProductSkeletons = (count: number) => (
// // //     <div className="ao-product-grid">
// // //       {Array.from({ length: count }).map((_, i) => (
// // //         <div className="ao-product-card ao-skeleton-card" key={i}>
// // //           <div className="ao-skeleton ao-skeleton-image" />
// // //           <div className="ao-skeleton ao-skeleton-line" />
// // //           <div className="ao-skeleton ao-skeleton-line ao-skeleton-line-short" />
// // //         </div>
// // //       ))}
// // //     </div>
// // //   );

// // //   const renderShowMoreButton = (onClick: () => void, remaining: number) => (
// // //     <div className="ao-show-more-wrap">
// // //       <button type="button" className="ao-btn ao-btn-secondary ao-show-more-btn" onClick={onClick}>
// // //         Show More ({remaining} more)
// // //       </button>
// // //     </div>
// // //   );

// // //   // =============================================================================
// // //   // ─── JSX ─────────────────────────────────────────────────────────────────────
// // //   // =============================================================================

// // //   return (
// // //     <div className="ao-page">
// // //       {/* ── Header ─────────────────────────────────────────────────────── */}
// // //       <header className="ao-header">
// // //         <p className="ao-eyebrow">Agent Self-Order</p>
// // //         <h1 className="ao-title">Place Your Order</h1>
// // //       </header>

// // //       {successMessage && <div className="ao-toast ao-toast-success">{successMessage}</div>}
// // //       {(submitError || catalogError) && (
// // //         <div className="ao-toast ao-toast-error">{submitError || catalogError}</div>
// // //       )}

// // //       <div className="ao-layout">
// // //         {/* ── Main column ────────────────────────────────────────────── */}
// // //         <div className="ao-main-column">
// // //           {/* Card — Agent Info (read-only, auto-filled) */}
// // //           <section className="ao-card">
// // //             <h2 className="ao-card-title">Your Details</h2>
// // //             {agentLoading ? (
// // //               <p className="ao-muted">Loading your profile…</p>
// // //             ) : agent ? (
// // //               <div className="ao-agent-info">
// // //                 <div className="ao-agent-avatar">{(agent.first_name || "A").charAt(0)}</div>
// // //                 <div className="ao-agent-meta">
// // //                   <p className="ao-agent-name">{agent.first_name} {agent.last_name}</p>
// // //                   <p className="ao-agent-sub">{agent.email} · {agent.phone_no}</p>
// // //                   <p className="ao-agent-sub">Agent ID: {agent.id}</p>
// // //                 </div>
// // //                 {agentDiscount > 0 && (
// // //                   <span className="ao-badge ao-badge-discount ao-agent-discount-badge">
// // //                     {agentDiscount}% agent discount
// // //                   </span>
// // //                 )}
// // //               </div>
// // //             ) : (
// // //               <p className="ao-muted">We couldn't load your profile.</p>
// // //             )}
// // //           </section>

// // //           {/* Card — Delivery Method */}
// // //           <section className="ao-card">
// // //             <h2 className="ao-card-title">Delivery Method</h2>
// // //             {errors.deliveryMethod && <span className="ao-error-text">{errors.deliveryMethod}</span>}

// // //             <div className="ao-delivery-cards">
// // //               <button
// // //                 type="button"
// // //                 className={`ao-delivery-card ${deliveryMethod === "PICKUP" ? "ao-delivery-card-active" : ""}`}
// // //                 onClick={() => setDeliveryMethod("PICKUP")}
// // //               >
// // //                 <span className="ao-delivery-icon">🏬</span>
// // //                 <span className="ao-delivery-label">Pickup</span>
// // //                 <span className="ao-delivery-sub">No delivery charge</span>
// // //               </button>
// // //               <button
// // //                 type="button"
// // //                 className={`ao-delivery-card ${deliveryMethod === "DELIVERY" ? "ao-delivery-card-active" : ""}`}
// // //                 onClick={() => setDeliveryMethod("DELIVERY")}
// // //               >
// // //                 <span className="ao-delivery-icon">🚚</span>
// // //                 <span className="ao-delivery-label">Delivery</span>
// // //                 <span className="ao-delivery-sub">Charge based on your area</span>
// // //               </button>
// // //             </div>

// // //             {deliveryMethod === "PICKUP" && (
// // //               <div className="ao-address-section">
// // //                 <div className="ao-field-grid ao-delivery-time-grid">
// // //                   <div className="ao-field">
// // //                     <label>Pickup Date *</label>
// // //                     <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
// // //                     {errors.pickupDate && <span className="ao-error-text">{errors.pickupDate}</span>}
// // //                   </div>
// // //                   <div className="ao-field">
// // //                     <label>Pickup Time *</label>
// // //                     <select value={pickupTimeSlot} onChange={(e) => setPickupTimeSlot(e.target.value)}>
// // //                       <option value="">Select a pickup time</option>
// // //                       {TIME_SLOTS.map((slot) => (
// // //                         <option key={slot} value={slot}>{slot}</option>
// // //                       ))}
// // //                     </select>
// // //                     {errors.pickupTimeSlot && <span className="ao-error-text">{errors.pickupTimeSlot}</span>}
// // //                   </div>
// // //                 </div>
// // //               </div>
// // //             )}

// // //             {deliveryMethod === "DELIVERY" && (
// // //               <div className="ao-address-section">
// // //                 {errors.address && <span className="ao-error-text">{errors.address}</span>}

// // //                 {addressesLoading ? (
// // //                   <p className="ao-muted">Loading your addresses…</p>
// // //                 ) : addresses.length === 0 ? (
// // //                   <p className="ao-muted">You don't have any saved addresses yet.</p>
// // //                 ) : (
// // //                   <div className="ao-address-list">
// // //                     {addresses.map((addr) => {
// // //                       const area = addr.area || areas.find((a) => a.id === addr.area_id);
// // //                       const lineParts = [
// // //                         addr.block,
// // //                         addr.avenue,
// // //                         addr.street,
// // //                         addr.building ? `Building ${addr.building}` : null,
// // //                         addr.floor ? `Floor ${addr.floor}` : null,
// // //                         addr.apartment ? `Apt ${addr.apartment}` : null,
// // //                       ].filter(Boolean);
// // //                       return (
// // //                         <div
// // //                           key={addr.id}
// // //                           className={`ao-address-card ${selectedAddressId === addr.id ? "ao-address-card-active" : ""}`}
// // //                           onClick={() => setSelectedAddressId(addr.id as number)}
// // //                         >
// // //                           <div className="ao-address-card-main">
// // //                             <p className="ao-address-line">{lineParts.join(", ")}</p>
// // //                             <p className="ao-address-sub">
// // //                               {area?.name || "Unknown area"} · {addr.country}
// // //                               {addr.delivery_notes ? ` · ${addr.delivery_notes}` : ""}
// // //                             </p>
// // //                           </div>
// // //                           <div className="ao-address-card-actions" onClick={(e) => e.stopPropagation()}>
// // //                             <button type="button" className="ao-icon-btn" onClick={() => openEditAddressModal(addr)} aria-label="Edit address">✎</button>
// // //                             <button type="button" className="ao-icon-btn ao-icon-btn-danger" onClick={() => handleDeleteAddress(addr.id as number)} aria-label="Delete address">✕</button>
// // //                           </div>
// // //                         </div>
// // //                       );
// // //                     })}
// // //                   </div>
// // //                 )}

// // //                 <button type="button" className="ao-btn ao-btn-secondary ao-add-address-btn" onClick={openAddAddressModal}>
// // //                   + Add New Address
// // //                 </button>

// // //                 <div className="ao-field-grid ao-delivery-time-grid">
// // //                   <div className="ao-field">
// // //                     <label>Delivery Date *</label>
// // //                     <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
// // //                     {errors.deliveryDate && <span className="ao-error-text">{errors.deliveryDate}</span>}
// // //                   </div>
// // //                   <div className="ao-field">
// // //                     <label>Delivery Time Slot *</label>
// // //                     <select value={deliveryTimeSlot} onChange={(e) => setDeliveryTimeSlot(e.target.value)}>
// // //                       <option value="">Select a time slot</option>
// // //                       {TIME_SLOTS.map((slot) => (
// // //                         <option key={slot} value={slot}>{slot}</option>
// // //                       ))}
// // //                     </select>
// // //                     {errors.deliveryTimeSlot && <span className="ao-error-text">{errors.deliveryTimeSlot}</span>}
// // //                   </div>
// // //                 </div>
// // //               </div>
// // //             )}
// // //           </section>

// // //           {/* Card — Menu / Agent Menu */}
// // //           <section className="ao-card">
// // //             <h2 className="ao-card-title">
// // //               {menuTab === "MENU" ? "Menu" : "Agent Menu (Exclusive)"}
// // //             </h2>
// // //             {errors.items && <span className="ao-error-text">{errors.items}</span>}

// // //             {/* Tab switcher */}
// // //             <div className="ao-menu-tabs">
// // //               <button
// // //                 type="button"
// // //                 className={`ao-menu-tab ${menuTab === "MENU" ? "ao-menu-tab-active" : ""}`}
// // //                 onClick={() => setMenuTab("MENU")}
// // //               >
// // //                 <span className="ao-menu-tab-icon">📋</span>
// // //                 <span>Menu</span>
// // //               </button>
// // //               <button
// // //                 type="button"
// // //                 className={`ao-menu-tab ${menuTab === "AGENT_MENU" ? "ao-menu-tab-active" : ""}`}
// // //                 onClick={() => setMenuTab("AGENT_MENU")}
// // //               >
// // //                 <span className="ao-menu-tab-icon">⭐</span>
// // //                 <span>Agent Menu (Exclusive)</span>
// // //               </button>
// // //             </div>

// // //             <input
// // //               type="text"
// // //               className="ao-search-bar"
// // //               placeholder={
// // //                 menuTab === "MENU"
// // //                   ? "Search the menu…"
// // //                   : "Search your exclusive products…"
// // //               }
// // //               value={searchTerm}
// // //               onChange={(e) => setSearchTerm(e.target.value)}
// // //             />

// // //             {categories.length > 0 && (
// // //               <div className="ao-category-chips">
// // //                 <button
// // //                   type="button"
// // //                   className={`ao-chip ${categoryFilter === "ALL" ? "ao-chip-active" : ""}`}
// // //                   onClick={() => setCategoryFilter("ALL")}
// // //                 >
// // //                   All
// // //                 </button>
// // //                 {categories.map((c) => (
// // //                   <button
// // //                     key={c}
// // //                     type="button"
// // //                     className={`ao-chip ${categoryFilter === c ? "ao-chip-active" : ""}`}
// // //                     onClick={() => setCategoryFilter(c)}
// // //                   >
// // //                     {c}
// // //                   </button>
// // //                 ))}
// // //               </div>
// // //             )}

// // //             {menuTab === "MENU" ? (
// // //               <>
// // //                 <h3 className="ao-subsection-title">
// // //                   Our Menu {agentDiscount > 0 ? `(${agentDiscount}% off for you)` : ""}
// // //                 </h3>
// // //                 {catalogLoading ? (
// // //                   renderProductSkeletons(4)
// // //                 ) : filteredProducts.length === 0 ? (
// // //                   <p className="ao-muted">No products match your search.</p>
// // //                 ) : (
// // //                   <>
// // //                     <div className="ao-product-grid">{visibleProducts.map(renderNormalProductCard)}</div>
// // //                     {hasMoreProducts &&
// // //                       renderShowMoreButton(showMoreProducts, filteredProducts.length - visibleProducts.length)}
// // //                   </>
// // //                 )}
// // //               </>
// // //             ) : (
// // //               <>
// // //                 <h3 className="ao-subsection-title">Your Exclusive Products</h3>
// // //                 {catalogLoading ? (
// // //                   renderProductSkeletons(4)
// // //                 ) : filteredAgentProducts.length === 0 ? (
// // //                   <p className="ao-muted">No exclusive products assigned to you yet.</p>
// // //                 ) : (
// // //                   <>
// // //                     <div className="ao-product-grid">{visibleAgentProducts.map(renderAgentProductCard)}</div>
// // //                     {hasMoreAgentProducts &&
// // //                       renderShowMoreButton(
// // //                         showMoreAgentProducts,
// // //                         filteredAgentProducts.length - visibleAgentProducts.length
// // //                       )}
// // //                   </>
// // //                 )}
// // //               </>
// // //             )}
// // //           </section>

// // //           {/* Card — Cart */}
// // //           <section className="ao-card">
// // //             <h2 className="ao-card-title">Cart</h2>
// // //             {cart.length === 0 ? (
// // //               <div className="ao-empty-cart">
// // //                 <div className="ao-empty-cart-icon">🛒</div>
// // //                 <p className="ao-muted">Your cart is empty. Add something delicious above.</p>
// // //               </div>
// // //             ) : (
// // //               <div className="ao-cart-table-wrap">
// // //                 <table className="ao-cart-table">
// // //                   <thead>
// // //                     <tr>
// // //                       <th>Product</th>
// // //                       <th>Qty</th>
// // //                       <th>Original</th>
// // //                       <th>Discount</th>
// // //                       <th>Final</th>
// // //                       <th>Subtotal</th>
// // //                       <th></th>
// // //                     </tr>
// // //                   </thead>
// // //                   <tbody>
// // //                     {cart.map((item) => (
// // //                       <tr key={item.cartId}>
// // //                         <td>
// // //                           <div className="ao-cart-product-name">{item.name}</div>
// // //                           <span className={`ao-tag ${item.productType === "AGENT" ? "ao-tag-agent" : "ao-tag-normal"}`}>
// // //                             {item.productType === "AGENT" ? "Agent Exclusive" : "Normal"}
// // //                           </span>
// // //                           {(item.variantName || item.flavourName) && (
// // //                             <div className="ao-cart-item-options">
// // //                               {item.variantName && (
// // //                                 <span className="ao-tag ao-tag-option">Variant: {item.variantName}</span>
// // //                               )}
// // //                               {item.flavourName && (
// // //                                 <span className="ao-tag ao-tag-option">Flavour: {item.flavourName}</span>
// // //                               )}
// // //                             </div>
// // //                           )}
// // //                         </td>
// // //                         <td>
// // //                           <div className="ao-qty-control">
// // //                             <button type="button" className="ao-qty-btn" onClick={() => changeCartQuantity(item.cartId, -1)}>−</button>
// // //                             <span className="ao-qty-value">{item.quantity}</span>
// // //                             <button type="button" className="ao-qty-btn" onClick={() => changeCartQuantity(item.cartId, 1)}>+</button>
// // //                           </div>
// // //                         </td>
// // //                         <td>{currency} {formatMoney(item.originalPrice)}</td>
// // //                         <td>{item.discountPercentage > 0 ? `${item.discountPercentage}% (-${currency} ${formatMoney(item.discountAmount)})` : "—"}</td>
// // //                         <td>{currency} {formatMoney(item.finalPrice)}</td>
// // //                         <td>{currency} {formatMoney(item.finalPrice * item.quantity)}</td>
// // //                         <td>
// // //                           <button type="button" className="ao-btn-remove" onClick={() => removeCartItem(item.cartId)} aria-label="Remove item">✕</button>
// // //                         </td>
// // //                       </tr>
// // //                     ))}
// // //                   </tbody>
// // //                 </table>
// // //               </div>
// // //             )}
// // //           </section>

// // //           {/* Card — Notes */}
// // //           <section className="ao-card">
// // //             <h2 className="ao-card-title">Notes</h2>
// // //             <div className="ao-field">
// // //               <label>Notes for this order</label>
// // //               <textarea
// // //                 rows={3}
// // //                 value={notes}
// // //                 onChange={(e) => setNotes(e.target.value)}
// // //                 placeholder="Anything the kitchen or delivery team should know…"
// // //               />
// // //             </div>
// // //           </section>
// // //         </div>

// // //         {/* ── Sticky sidebar ─────────────────────────────────────────── */}
// // //         <aside className="ao-sidebar">
// // //           <section className="ao-card ao-summary-card">
// // //             <h2 className="ao-card-title">Order Summary</h2>

// // //             <div className="ao-summary-row">
// // //               <span>Subtotal</span>
// // //               <span>{currency} {formatMoney(originalSubtotal)}</span>
// // //             </div>
// // //             <div className="ao-summary-row ao-summary-discount">
// // //               <span>Agent Discount Total</span>
// // //               <span>-{currency} {formatMoney(discountTotal)}</span>
// // //             </div>
// // //             <div className="ao-summary-row">
// // //               <span>Delivery Charge</span>
// // //               <span>{currency} {formatMoney(deliveryCharge)}</span>
// // //             </div>
// // //             <div className="ao-summary-row ao-summary-grand-total">
// // //               <span>Grand Total</span>
// // //               <span>{currency} {formatMoney(grandTotal)}</span>
// // //             </div>

// // //           </section>

// // //           <div className="ao-action-buttons">
// // //             <button
// // //               type="button"
// // //               className="ao-btn ao-btn-primary ao-btn-full"
// // //               onClick={handleCreateOrder}
// // //               disabled={isSubmitting || agentLoading}
// // //             >
// // //               {isSubmitting ? "Creating…" : "Create Order"}
// // //             </button>
// // //           </div>
// // //         </aside>
// // //       </div>

// // //       {/* ── Address add/edit modal ───────────────────────────────────── */}
// // //       {addressModalOpen && (
// // //         <div className="ao-modal-overlay" onClick={closeAddressModal}>
// // //           <div className="ao-modal" onClick={(e) => e.stopPropagation()}>
// // //             <h3 className="ao-modal-title">{editingAddressId ? "Edit Address" : "Add New Address"}</h3>

// // //             {addressFormError && <span className="ao-error-text">{addressFormError}</span>}

// // //             <div className="ao-field-grid">
// // //               <div className="ao-field ao-field-full">
// // //                 <label>Area *</label>
// // //                 <select
// // //                   value={addressForm.area_id ?? ""}
// // //                   onChange={(e) => updateAddressField("area_id", e.target.value)}
// // //                   disabled={areasLoading}
// // //                 >
// // //                   <option value="">{areasLoading ? "Loading areas…" : "Select an area"}</option>
// // //                   {areas.map((a) => (
// // //                     <option key={a.id} value={a.id}>{a.name}</option>
// // //                   ))}
// // //                 </select>
// // //               </div>
// // //               <div className="ao-field">
// // //                 <label>Street *</label>
// // //                 <input type="text" value={addressForm.street} onChange={(e) => updateAddressField("street", e.target.value)} />
// // //               </div>
// // //               <div className="ao-field">
// // //                 <label>Country *</label>
// // //                 <input type="text" value={addressForm.country} onChange={(e) => updateAddressField("country", e.target.value)} />
// // //               </div>
// // //               <div className="ao-field">
// // //                 <label>Block</label>
// // //                 <input type="text" value={addressForm.block} onChange={(e) => updateAddressField("block", e.target.value)} />
// // //               </div>
// // //               <div className="ao-field">
// // //                 <label>Avenue</label>
// // //                 <input type="text" value={addressForm.avenue} onChange={(e) => updateAddressField("avenue", e.target.value)} />
// // //               </div>
// // //               <div className="ao-field">
// // //                 <label>Building</label>
// // //                 <input type="text" value={addressForm.building} onChange={(e) => updateAddressField("building", e.target.value)} />
// // //               </div>
// // //               <div className="ao-field">
// // //                 <label>Floor</label>
// // //                 <input type="text" value={addressForm.floor} onChange={(e) => updateAddressField("floor", e.target.value)} />
// // //               </div>
// // //               <div className="ao-field">
// // //                 <label>Apartment</label>
// // //                 <input type="text" value={addressForm.apartment} onChange={(e) => updateAddressField("apartment", e.target.value)} />
// // //               </div>
// // //               <div className="ao-field ao-field-full">
// // //                 <label>Delivery Notes</label>
// // //                 <textarea rows={2} value={addressForm.delivery_notes} onChange={(e) => updateAddressField("delivery_notes", e.target.value)} />
// // //               </div>
// // //             </div>

// // //             <div className="ao-modal-actions">
// // //               <button type="button" className="ao-btn ao-btn-ghost" onClick={closeAddressModal}>Cancel</button>
// // //               <button type="button" className="ao-btn ao-btn-primary" onClick={saveAddress} disabled={addressSaving}>
// // //                 {addressSaving ? "Saving…" : editingAddressId ? "Save Changes" : "Add Address"}
// // //               </button>
// // //             </div>
// // //           </div>
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // };

// // // export default AgentOrder;



// // import React, { useEffect, useMemo, useState, useCallback } from "react";
// // import "./agentorder.css";

// // // ─────────────────────────────────────────────────────────────────────────────
// // // EXISTING SERVICES ONLY (agentService.ts, areaService.ts) — nothing here
// // // creates or modifies those services. addressService.ts is a new, minimal
// // // file added alongside this component (see accompanying message).
// // // ─────────────────────────────────────────────────────────────────────────────

// // import {
// //   getAgentDashboard,
// //   getAgentCatalog,
// //   createAgentOrder,
// //   type Agent,
// //   type AgentProduct,
// //   type BakeryProduct,
// //   type CreateAgentOrderPayload,
// //   type AgentOrderItemInput,
// // } from "../services/agentService";

// // // Areas — same assumption as your existing SalesAgentCreateOrder file: not
// // // included in what you shared, so point this at your real areas export if
// // // the path/shape differs.
// // import { getAreas } from "../services/areaService";

// // import {
// //   getMyAddresses,
// //   createAddress,
// //   updateAddress,
// //   deleteAddress,
// //   type Address,
// // } from "../services/addressService";

// // type AddressInput = Omit<Address, "id" | "user_id">;

// // // =============================================================================
// // // ─── TYPES ───────────────────────────────────────────────────────────────────
// // // =============================================================================

// // interface AreaOption {
// //   id: number;
// //   name: string;
// //   currency?: string;
// //   delivery_charge?: number;
// // }

// // type ProductType = "NORMAL" | "AGENT";

// // interface CartItem {
// //   cartId: string;
// //   productId: number;
// //   productType: ProductType;
// //   name: string;
// //   image?: string;
// //   originalPrice: number;
// //   discountPercentage: number; // 0 for AGENT products
// //   discountAmount: number; // per unit
// //   finalPrice: number; // per unit, after discount
// //   quantity: number;
// //   currency: string;
// //   // Variant / flavour selections — present for any product (normal or
// //   // agent-exclusive) that exposes variants/flavours.
// //   variantId?: string | number;
// //   variantName?: string;
// //   flavourId?: string | number;
// //   flavourName?: string;
// // }

// // type DeliveryMethod = "PICKUP" | "DELIVERY";

// // type PaymentMethodOption = "COD" | "CARD" | "KNET" | "UPI" | "LINK";

// // type MenuTab = "MENU" | "AGENT_MENU";

// // interface FormErrors {
// //   deliveryMethod?: string;
// //   address?: string;
// //   items?: string;
// //   paymentMethod?: string;
// //   pickupDate?: string;
// //   pickupTimeSlot?: string;
// //   deliveryDate?: string;
// //   deliveryTimeSlot?: string;
// // }

// // interface AddressFormState {
// //   area_id: number | null;
// //   street: string;
// //   country: string;
// //   block: string;
// //   avenue: string;
// //   building: string;
// //   floor: string;
// //   apartment: string;
// //   delivery_notes: string;
// // }

// // /**
// //  * Backend now stores variants/flavours as plain string arrays
// //  * (["1kg", "Half kg"], ["Chocolate", "Vanilla"]) with no price modifier.
// //  * These helpers still tolerate an array of { id, name } objects for
// //  * backward compatibility, but the id defaults to the name itself for plain
// //  * strings, which is what the backend now sends.
// //  */
// // interface ProductOption {
// //   id: string | number;
// //   name: string;
// //   price_modifier?: number; // kept optional for backward compatibility; unused now
// // }

// // /**
// //  * CreateAgentOrderPayload (agentService.ts) doesn't currently have fields for
// //  * order_source, delivery_method, agent-side notes, or a discount summary.
// //  * This local type is a strict superset — assigning an object of this shape
// //  * to the real payload type still type-checks, so createAgentOrder() accepts
// //  * it as-is. Add matching columns/handling on the backend to actually persist
// //  * these extra fields; until then they'll simply be ignored by the API.
// //  */
// // interface AgentOrderPayloadExtended extends CreateAgentOrderPayload {
// //   order_source?: "AGENT_SELF";
// //   delivery_method?: DeliveryMethod;
// //   agent_notes?: string;
// //   agent_discount_percentage?: number;
// //   discount_total?: number;
// //   delivery_charge?: number;
// //   subtotal?: number;
// //   grand_total?: number;
// // }

// // const TIME_SLOTS = [
// //   "9:00 AM - 10:00 AM",
// //   "10:00 AM - 11:00 AM",
// //   "11:00 AM - 12:00 PM",
// //   "12:00 PM - 1:00 PM",
// //   "1:00 PM - 2:00 PM",
// //   "2:00 PM - 3:00 PM",
// //   "3:00 PM - 4:00 PM",
// //   "4:00 PM - 5:00 PM",
// //   "5:00 PM - 6:00 PM",
// //   "6:00 PM - 7:00 PM",
// //   "7:00 PM - 8:00 PM",
// //   "8:00 PM - 9:00 PM",
// //   "9:00 PM - 10:00 PM",
// // ];

// // const PAYMENT_METHODS: { value: PaymentMethodOption; label: string }[] = [
// //   { value: "COD", label: "Cash" },
// //   { value: "CARD", label: "Card" },
// //   { value: "KNET", label: "KNET" },
// //   { value: "UPI", label: "UPI" },
// //   { value: "LINK", label: "Other" },
// // ];

// // const EMPTY_ADDRESS_FORM: AddressFormState = {
// //   area_id: null,
// //   street: "",
// //   country: "",
// //   block: "",
// //   avenue: "",
// //   building: "",
// //   floor: "",
// //   apartment: "",
// //   delivery_notes: "",
// // };

// // // How many products to show initially / per "Show More" click.
// // const PRODUCTS_PAGE_SIZE = 4;

// // // =============================================================================
// // // ─── HELPERS ─────────────────────────────────────────────────────────────────
// // // =============================================================================

// // const makeCartId = (): string =>
// //   `cart_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

// // const formatMoney = (value: number): string => (value || 0).toFixed(2);

// // const cartKey = (productId: number, type: ProductType) => `${type}-${productId}`;

// // /**
// //  * category can come back from the API as a plain string OR as an object
// //  * (e.g. { id, name }). Rendering an object directly via String(obj) produces
// //  * "[object Object]" — this normalizes it to a display-safe string, or null
// //  * when there's nothing usable.
// //  */
// // const getCategoryName = (category: unknown): string | null => {
// //   if (category === null || category === undefined) return null;
// //   if (typeof category === "string") return category.trim() || null;
// //   if (typeof category === "number") return String(category);
// //   if (typeof category === "object") {
// //     const c = category as any;
// //     return c.name ?? c.title ?? c.label ?? null;
// //   }
// //   return null;
// // };

// // /**
// //  * Reads a list of variant/flavour options off a product for a given key.
// //  * Accepts:
// //  *  - an array of plain strings (current backend shape: ["1kg", "Half kg"])
// //  *  - an array of { id, name } / { id, name, price_modifier } objects
// //  * and normalizes either into { id, name } pairs. For plain strings, id
// //  * defaults to the string itself.
// //  */
// // const getOptionList = (
// //   product: unknown,
// //   keys: string[]
// // ): ProductOption[] => {
// //   if (!product || typeof product !== "object") return [];
// //   const p = product as any;
// //   for (const key of keys) {
// //     const raw = p[key];
// //     if (Array.isArray(raw) && raw.length > 0) {
// //       return raw
// //         .map((entry: any, idx: number) => {
// //           if (entry === null || entry === undefined) return null;
// //           if (typeof entry === "string" || typeof entry === "number") {
// //             return { id: String(entry), name: String(entry) };
// //           }
// //           if (typeof entry === "object") {
// //             const id = entry.id ?? entry.value ?? entry.code ?? idx;
// //             const name = entry.name ?? entry.label ?? entry.title ?? String(id);
// //             const price_modifier =
// //               typeof entry.price_modifier === "number"
// //                 ? entry.price_modifier
// //                 : typeof entry.price_delta === "number"
// //                 ? entry.price_delta
// //                 : undefined;
// //             return { id, name, price_modifier };
// //           }
// //           return null;
// //         })
// //         .filter(Boolean) as ProductOption[];
// //     }
// //   }
// //   return [];
// // };

// // const getVariantOptions = (product: unknown): ProductOption[] =>
// //   getOptionList(product, ["variants", "variant_options", "product_variants"]);

// // const getFlavourOptions = (product: unknown): ProductOption[] =>
// //   getOptionList(product, ["flavours", "flavors", "flavour_options", "flavor_options"]);

// // // =============================================================================
// // // ─── COMPONENT ───────────────────────────────────────────────────────────────
// // // =============================================================================

// // const AgentOrder: React.FC = () => {
// //   // ── Logged-in agent (auto-loaded, never typed manually) ─────────────────
// //   const [agent, setAgent] = useState<Agent | null>(null);
// //   const [agentLoading, setAgentLoading] = useState<boolean>(true);
// //   const agentDiscount = agent?.default_discount ?? 0;

// //   // ── Addresses ────────────────────────────────────────────────────────────
// //   const [addresses, setAddresses] = useState<Address[]>([]);
// //   const [addressesLoading, setAddressesLoading] = useState<boolean>(true);
// //   const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

// //   const [addressModalOpen, setAddressModalOpen] = useState<boolean>(false);
// //   const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
// //   const [addressForm, setAddressForm] = useState<AddressFormState>(EMPTY_ADDRESS_FORM);
// //   const [addressSaving, setAddressSaving] = useState<boolean>(false);
// //   const [addressFormError, setAddressFormError] = useState<string>("");

// //   // ── Areas (for address form + delivery charge lookup) ──────────────────
// //   const [areas, setAreas] = useState<AreaOption[]>([]);
// //   const [areasLoading, setAreasLoading] = useState<boolean>(true);

// //   // ── Delivery method ──────────────────────────────────────────────────────
// //   const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("PICKUP");
// //   const [pickupDate, setPickupDate] = useState<string>("");
// //   const [pickupTimeSlot, setPickupTimeSlot] = useState<string>("");
// //   const [deliveryDate, setDeliveryDate] = useState<string>("");
// //   const [deliveryTimeSlot, setDeliveryTimeSlot] = useState<string>("");

// //   // ── Catalog: normal products + agent's own products ─────────────────────
// //   const [products, setProducts] = useState<BakeryProduct[]>([]);
// //   const [agentProducts, setAgentProducts] = useState<AgentProduct[]>([]);
// //   const [catalogLoading, setCatalogLoading] = useState<boolean>(true);
// //   const [catalogError, setCatalogError] = useState<string>("");

// //   const [searchTerm, setSearchTerm] = useState<string>("");
// //   const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
// //   const [draftQuantities, setDraftQuantities] = useState<Record<string, number>>({});

// //   // ── Variant / flavour selections — shared by normal + agent products,
// //   //     keyed by cartKey (which already namespaces NORMAL vs AGENT) ───────
// //   const [draftVariants, setDraftVariants] = useState<Record<string, string>>({});
// //   const [draftFlavours, setDraftFlavours] = useState<Record<string, string>>({});

// //   // ── Menu / Agent Menu tab switcher ───────────────────────────────────────
// //   const [menuTab, setMenuTab] = useState<MenuTab>("MENU");

// //   // ── Pagination ("show first 4, then Show More") per grid ───────────────
// //   const [menuVisibleCount, setMenuVisibleCount] = useState<number>(PRODUCTS_PAGE_SIZE);
// //   const [agentMenuVisibleCount, setAgentMenuVisibleCount] = useState<number>(PRODUCTS_PAGE_SIZE);

// //   // ── Cart ─────────────────────────────────────────────────────────────────
// //   const [cart, setCart] = useState<CartItem[]>([]);

// //   // ── Payment / notes ──────────────────────────────────────────────────────
// //   const [paymentMethod, setPaymentMethod] = useState<PaymentMethodOption | "">("");
// //   const [notes, setNotes] = useState<string>("");
// //   const [currency, setCurrency] = useState<string>("KWD");

// //   // ── Submission ───────────────────────────────────────────────────────────
// //   const [errors, setErrors] = useState<FormErrors>({});
// //   const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
// //   const [successMessage, setSuccessMessage] = useState<string>("");
// //   const [submitError, setSubmitError] = useState<string>("");

// //   // ── Load agent profile, addresses, areas, catalog on mount ─────────────
// //   useEffect(() => {
// //     let cancelled = false;

// //     const loadAgent = async () => {
// //       setAgentLoading(true);
// //       try {
// //         const dashboard = await getAgentDashboard();
// //         if (!cancelled) setAgent(dashboard.agent);
// //       } catch (err) {
// //         if (!cancelled) setSubmitError("Unable to load your agent profile. Please refresh.");
// //       } finally {
// //         if (!cancelled) setAgentLoading(false);
// //       }
// //     };

// //     const loadAddresses = async () => {
// //       setAddressesLoading(true);
// //       try {
// //         const list = await getMyAddresses();
// //         if (!cancelled) {
// //           setAddresses(list);
// //           if (list[0]?.id) setSelectedAddressId(list[0].id);
// //         }
// //       } catch (err) {
// //         if (!cancelled) setCatalogError((prev) => prev || "Unable to load your saved addresses.");
// //       } finally {
// //         if (!cancelled) setAddressesLoading(false);
// //       }
// //     };

// //     const loadAreas = async () => {
// //       setAreasLoading(true);
// //       try {
// //         const list = await getAreas();
// //         if (!cancelled) setAreas(list as AreaOption[]);
// //       } catch (err) {
// //         if (!cancelled) setCatalogError((prev) => prev || "Unable to load delivery areas.");
// //       } finally {
// //         if (!cancelled) setAreasLoading(false);
// //       }
// //     };

// //     const loadCatalog = async () => {
// //       setCatalogLoading(true);
// //       setCatalogError("");
// //       try {
// //         const catalog = await getAgentCatalog(currency);
// //         if (!cancelled) {
// //           setProducts(catalog.products || []);
// //           setAgentProducts(catalog.agent_products || []);
// //         }
// //       } catch (err) {
// //         if (!cancelled) setCatalogError((prev) => prev || "Unable to load the menu. Please refresh and try again.");
// //       } finally {
// //         if (!cancelled) setCatalogLoading(false);
// //       }
// //     };

// //     loadAgent();
// //     loadAddresses();
// //     loadAreas();
// //     loadCatalog();

// //     return () => {
// //       cancelled = true;
// //     };
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, []);

// //   // ── Derived: selected address + its area (drives delivery charge) ──────
// //   const selectedAddress = useMemo(
// //     () => addresses.find((a) => a.id === selectedAddressId) || null,
// //     [addresses, selectedAddressId]
// //   );

// //   const selectedArea = useMemo(
// //     () => (selectedAddress ? areas.find((a) => a.id === selectedAddress.area_id) || null : null),
// //     [selectedAddress, areas]
// //   );

// //   useEffect(() => {
// //     if (selectedArea?.currency) setCurrency(selectedArea.currency);
// //   }, [selectedArea]);

// //   const deliveryCharge = useMemo(() => {
// //     if (deliveryMethod !== "DELIVERY") return 0;
// //     return selectedArea?.delivery_charge ?? 0;
// //   }, [deliveryMethod, selectedArea]);

// //   // ── Categories — only from the active tab's product set, normalized ────
// //   const categories = useMemo(() => {
// //     const sourceList = menuTab === "MENU" ? products : agentProducts;
// //     const set = new Set<string>();
// //     sourceList.forEach((p) => {
// //       const name = getCategoryName((p as any).category);
// //       if (name) set.add(name);
// //     });
// //     return Array.from(set);
// //   }, [products, agentProducts, menuTab]);

// //   // Reset category filter whenever the tab changes, since categories differ per tab
// //   useEffect(() => {
// //     setCategoryFilter("ALL");
// //   }, [menuTab]);

// //   // Reset pagination whenever the tab, search term, or category filter
// //   // changes, so a fresh filter always starts back at the first page.
// //   useEffect(() => {
// //     setMenuVisibleCount(PRODUCTS_PAGE_SIZE);
// //     setAgentMenuVisibleCount(PRODUCTS_PAGE_SIZE);
// //   }, [menuTab, searchTerm, categoryFilter]);

// //   // ── Filtering (search + category) applies within the active tab only ───
// //   const matchesFilters = useCallback(
// //     (name: string, category: unknown) => {
// //       const term = searchTerm.trim().toLowerCase();
// //       const matchesSearch = !term || (name || "").toLowerCase().includes(term);
// //       const categoryName = getCategoryName(category) ?? "";
// //       const matchesCategory = categoryFilter === "ALL" || categoryName === categoryFilter;
// //       return matchesSearch && matchesCategory;
// //     },
// //     [searchTerm, categoryFilter]
// //   );

// //   const filteredProducts = useMemo(
// //     () => products.filter((p) => matchesFilters(p.name, (p as any).category)),
// //     [products, matchesFilters]
// //   );

// //   const filteredAgentProducts = useMemo(
// //     () => agentProducts.filter((p) => matchesFilters(p.name, (p as any).category)),
// //     [agentProducts, matchesFilters]
// //   );

// //   // ── Pagination slices ────────────────────────────────────────────────────
// //   const visibleProducts = useMemo(
// //     () => filteredProducts.slice(0, menuVisibleCount),
// //     [filteredProducts, menuVisibleCount]
// //   );
// //   const hasMoreProducts = filteredProducts.length > visibleProducts.length;

// //   const visibleAgentProducts = useMemo(
// //     () => filteredAgentProducts.slice(0, agentMenuVisibleCount),
// //     [filteredAgentProducts, agentMenuVisibleCount]
// //   );
// //   const hasMoreAgentProducts = filteredAgentProducts.length > visibleAgentProducts.length;

// //   const showMoreProducts = () =>
// //     setMenuVisibleCount((prev) => prev + PRODUCTS_PAGE_SIZE);

// //   const showMoreAgentProducts = () =>
// //     setAgentMenuVisibleCount((prev) => prev + PRODUCTS_PAGE_SIZE);

// //   // ── Draft quantity (per product card, before "Add") ─────────────────────
// //   const getDraftQty = (key: string) => draftQuantities[key] ?? 1;

// //   const changeDraftQty = (key: string, delta: number) => {
// //     setDraftQuantities((prev) => ({
// //       ...prev,
// //       [key]: Math.max(1, (prev[key] ?? 1) + delta),
// //     }));
// //   };

// //   // ── Draft variant / flavour selection (applies to any product with
// //   //     variant/flavour options — normal or agent-exclusive) ─────────────
// //   const getDraftVariantId = (key: string, options: ProductOption[]) =>
// //     draftVariants[key] ?? (options[0] ? String(options[0].id) : "");

// //   const getDraftFlavourId = (key: string, options: ProductOption[]) =>
// //     draftFlavours[key] ?? (options[0] ? String(options[0].id) : "");

// //   const setDraftVariant = (key: string, value: string) =>
// //     setDraftVariants((prev) => ({ ...prev, [key]: value }));

// //   const setDraftFlavour = (key: string, value: string) =>
// //     setDraftFlavours((prev) => ({ ...prev, [key]: value }));

// //   // ── Discount math (display + cart only — never touches product prices) ──
// //   const getDiscountedPrice = (price: number) => {
// //     const discountAmount = (price * agentDiscount) / 100;
// //     return { discountAmount, finalPrice: price - discountAmount };
// //   };

// //   // ── Add to cart (merges into an existing row for the same product +
// //   //     same variant/flavour selection) ──────────────────────────────────
// //   const mergeOrAddToCart = (item: Omit<CartItem, "cartId">) => {
// //     setCart((prev) => {
// //       const idx = prev.findIndex(
// //         (c) =>
// //           c.productId === item.productId &&
// //           c.productType === item.productType &&
// //           (c.variantId ?? null) === (item.variantId ?? null) &&
// //           (c.flavourId ?? null) === (item.flavourId ?? null)
// //       );
// //       if (idx >= 0) {
// //         const next = [...prev];
// //         next[idx] = { ...next[idx], quantity: next[idx].quantity + item.quantity };
// //         return next;
// //       }
// //       return [...prev, { ...item, cartId: makeCartId() }];
// //     });
// //     setErrors((prev) => ({ ...prev, items: undefined }));
// //   };

// //   const addNormalProductToCart = (product: BakeryProduct) => {
// //     const key = cartKey(product.id, "NORMAL");
// //     const qty = getDraftQty(key);

// //     const variantOptions = getVariantOptions(product);
// //     const flavourOptions = getFlavourOptions(product);

// //     const selectedVariantId = variantOptions.length
// //       ? getDraftVariantId(key, variantOptions)
// //       : "";
// //     const selectedFlavourId = flavourOptions.length
// //       ? getDraftFlavourId(key, flavourOptions)
// //       : "";

// //     const selectedVariant = variantOptions.find((v) => String(v.id) === selectedVariantId);
// //     const selectedFlavour = flavourOptions.find((f) => String(f.id) === selectedFlavourId);

// //     const price = product.price || 0; // no price modifier — plain string variants
// //     const { discountAmount, finalPrice } = getDiscountedPrice(price);

// //     mergeOrAddToCart({
// //       productId: product.id,
// //       productType: "NORMAL",
// //       name: product.name,
// //       image: (product as any).image_url,
// //       originalPrice: price,
// //       discountPercentage: agentDiscount,
// //       discountAmount,
// //       finalPrice,
// //       quantity: qty,
// //       currency,
// //       variantId: selectedVariant?.id,
// //       variantName: selectedVariant?.name,
// //       flavourId: selectedFlavour?.id,
// //       flavourName: selectedFlavour?.name,
// //     });
// //     setDraftQuantities((prev) => ({ ...prev, [key]: 1 }));
// //   };

// //   const addAgentProductToCart = (product: AgentProduct) => {
// //     const key = cartKey(product.id, "AGENT");
// //     const qty = getDraftQty(key);

// //     const variantOptions = getVariantOptions(product);
// //     const flavourOptions = getFlavourOptions(product);

// //     const selectedVariantId = variantOptions.length
// //       ? getDraftVariantId(key, variantOptions)
// //       : "";
// //     const selectedFlavourId = flavourOptions.length
// //       ? getDraftFlavourId(key, flavourOptions)
// //       : "";

// //     const selectedVariant = variantOptions.find((v) => String(v.id) === selectedVariantId);
// //     const selectedFlavour = flavourOptions.find((f) => String(f.id) === selectedFlavourId);

// //     const price = product.price || 0; // no price modifier — plain string variants

// //     mergeOrAddToCart({
// //       productId: product.id,
// //       productType: "AGENT",
// //       name: product.name,
// //       image: product.image || undefined,
// //       originalPrice: price,
// //       discountPercentage: 0,
// //       discountAmount: 0,
// //       finalPrice: price,
// //       quantity: qty,
// //       currency: "KWD",
// //       variantId: selectedVariant?.id,
// //       variantName: selectedVariant?.name,
// //       flavourId: selectedFlavour?.id,
// //       flavourName: selectedFlavour?.name,
// //     });
// //     setDraftQuantities((prev) => ({ ...prev, [key]: 1 }));
// //   };

// //   // ── Cart row handlers ────────────────────────────────────────────────────
// //   const changeCartQuantity = (cartId: string, delta: number) => {
// //     setCart((prev) =>
// //       prev.map((item) =>
// //         item.cartId === cartId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
// //       )
// //     );
// //   };

// //   const removeCartItem = (cartId: string) => {
// //     setCart((prev) => prev.filter((item) => item.cartId !== cartId));
// //   };

// //   // ── Totals ───────────────────────────────────────────────────────────────
// //   const originalSubtotal = useMemo(
// //     () => cart.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0),
// //     [cart]
// //   );

// //   const discountTotal = useMemo(
// //     () => cart.reduce((sum, item) => sum + item.discountAmount * item.quantity, 0),
// //     [cart]
// //   );

// //   const subtotalAfterDiscount = originalSubtotal - discountTotal;

// //   const grandTotal = useMemo(
// //     () => Math.max(subtotalAfterDiscount + deliveryCharge, 0),
// //     [subtotalAfterDiscount, deliveryCharge]
// //   );

// //   // ── Address CRUD ─────────────────────────────────────────────────────────
// //   const openAddAddressModal = () => {
// //     setEditingAddressId(null);
// //     setAddressForm(EMPTY_ADDRESS_FORM);
// //     setAddressFormError("");
// //     setAddressModalOpen(true);
// //   };

// //   const openEditAddressModal = (addr: Address) => {
// //     setEditingAddressId(addr.id ?? null);
// //     setAddressForm({
// //       area_id: addr.area_id,
// //       street: addr.street || "",
// //       country: addr.country || "",
// //       block: addr.block || "",
// //       avenue: addr.avenue || "",
// //       building: addr.building || "",
// //       floor: addr.floor || "",
// //       apartment: addr.apartment || "",
// //       delivery_notes: addr.delivery_notes || "",
// //     });
// //     setAddressFormError("");
// //     setAddressModalOpen(true);
// //   };

// //   const closeAddressModal = () => {
// //     setAddressModalOpen(false);
// //     setEditingAddressId(null);
// //     setAddressForm(EMPTY_ADDRESS_FORM);
// //     setAddressFormError("");
// //   };

// //   const updateAddressField = (field: keyof AddressFormState, value: string) => {
// //     setAddressForm((prev) => ({
// //       ...prev,
// //       [field]: field === "area_id" ? (value ? Number(value) : null) : value,
// //     }));
// //   };

// //   const saveAddress = async () => {
// //     if (!addressForm.area_id) {
// //       setAddressFormError("Please select an area.");
// //       return;
// //     }
// //     if (!addressForm.street.trim() || !addressForm.country.trim()) {
// //       setAddressFormError("Street and country are required.");
// //       return;
// //     }

// //     const payload: AddressInput = {
// //       area_id: addressForm.area_id,
// //       street: addressForm.street.trim(),
// //       country: addressForm.country.trim(),
// //       block: addressForm.block.trim() || undefined,
// //       avenue: addressForm.avenue.trim() || undefined,
// //       building: addressForm.building.trim() || undefined,
// //       floor: addressForm.floor.trim() || undefined,
// //       apartment: addressForm.apartment.trim() || undefined,
// //       delivery_notes: addressForm.delivery_notes.trim() || undefined,
// //     };

// //     setAddressSaving(true);
// //     setAddressFormError("");
// //     try {
// //       if (editingAddressId) {
// //         const updated = await updateAddress(editingAddressId, payload);
// //         setAddresses((prev) => prev.map((a) => (a.id === editingAddressId ? updated : a)));
// //       } else {
// //         const created = await createAddress(payload);
// //         setAddresses((prev) => [...prev, created]);
// //         setSelectedAddressId(created.id);
// //       }
// //       closeAddressModal();
// //     } catch (err) {
// //       setAddressFormError("Could not save this address. Please check the details and try again.");
// //     } finally {
// //       setAddressSaving(false);
// //     }
// //   };

// //   const handleDeleteAddress = async (id: number) => {
// //     if (!window.confirm("Delete this address?")) return;
// //     try {
// //       await deleteAddress(id);
// //       setAddresses((prev) => prev.filter((a) => a.id !== id));
// //       if (selectedAddressId === id) {
// //         setSelectedAddressId(null);
// //       }
// //     } catch (err) {
// //       setSubmitError("Could not delete this address. Please try again.");
// //     }
// //   };

// //   // ── Validation ───────────────────────────────────────────────────────────
// //   const validateForm = (): boolean => {
// //     const next: FormErrors = {};
// //     if (!deliveryMethod) {
// //       next.deliveryMethod = "Choose Pickup or Delivery";
// //     }

// //     if (deliveryMethod === "PICKUP") {
// //       if (!pickupDate) {
// //         next.pickupDate = "Pickup date is required";
// //       }
// //       if (!pickupTimeSlot) {
// //         next.pickupTimeSlot = "Pickup time is required";
// //       }
// //     }

// //     if (deliveryMethod === "DELIVERY") {
// //       if (!selectedAddressId) {
// //         next.address = "Select a delivery address, or add a new one";
// //       }
// //       if (!deliveryDate) {
// //         next.deliveryDate = "Delivery date is required";
// //       }
// //       if (!deliveryTimeSlot) {
// //         next.deliveryTimeSlot = "Delivery time slot is required";
// //       }
// //     }

// //     if (cart.length === 0) {
// //       next.items = "Add at least one product to the cart";
// //     }
// //     // Payment method is intentionally not required for agent-created orders.
// //     // The backend defaults to COD when payment_method is not provided.
// //     setErrors(next);
// //     return Object.keys(next).length === 0;
// //   };

// //   // ── Payload builder ──────────────────────────────────────────────────────
// //   const buildPayload = (): AgentOrderPayloadExtended => {
// //     const items: AgentOrderItemInput[] = cart.map((item) => ({
// //       product_id: item.productId,
// //       quantity: item.quantity,
// //       custom_json: {
// //         product_type: item.productType,
// //         original_price: Number(item.originalPrice.toFixed(2)),
// //         discount_percentage: Number(item.discountPercentage.toFixed(2)),
// //         discount_amount: Number(item.discountAmount.toFixed(2)),
// //         final_price: Number(item.finalPrice.toFixed(2)),
// //         line_total: Number((item.finalPrice * item.quantity).toFixed(2)),
// //         ...(item.variantId !== undefined
// //           ? { variant_id: item.variantId, variant_name: item.variantName }
// //           : {}),
// //         ...(item.flavourId !== undefined
// //           ? { flavour_id: item.flavourId, flavour_name: item.flavourName }
// //           : {}),
// //       },
// //     }));

// //     const isPickup = deliveryMethod === "PICKUP";

// //     const payload: AgentOrderPayloadExtended = {
// //       customer_id: agent!.id,
// //       address_id: isPickup ? null : selectedAddressId ?? null,
// //       items,
// //       payment_method: paymentMethod || "COD",
// //       currency: currency as CreateAgentOrderPayload["currency"],
// //       delivery_date: !isPickup ? deliveryDate || undefined : undefined,
// //       delivery_time_slot: !isPickup ? deliveryTimeSlot || undefined : undefined,
// //       pickup_date: isPickup ? pickupDate || undefined : undefined,
// //       pickup_time_slot: isPickup ? pickupTimeSlot || undefined : undefined,
// //       order_source: "AGENT_SELF",
// //       delivery_method: deliveryMethod,
// //       agent_notes: notes.trim() || undefined,
// //       agent_discount_percentage: Number(agentDiscount.toFixed(2)),
// //       discount_total: Number(discountTotal.toFixed(2)),
// //       delivery_charge: Number(deliveryCharge.toFixed(2)),
// //       subtotal: Number(originalSubtotal.toFixed(2)),
// //       grand_total: Number(grandTotal.toFixed(2)),
// //     };

// //     console.log("========================================");
// //     console.log("CREATE AGENT ORDER PAYLOAD");
// //     console.log("========================================");
// //     console.log(JSON.stringify(payload, null, 2));

// //     return payload;
// //   };

// //   const resetOrderState = () => {
// //     setCart([]);
// //     setPaymentMethod("");
// //     setNotes("");
// //     setDeliveryMethod("PICKUP");
// //     setPickupDate("");
// //     setPickupTimeSlot("");
// //     setDeliveryDate("");
// //     setDeliveryTimeSlot("");
// //     setErrors({});
// //   };

// //   // ── Submit ───────────────────────────────────────────────────────────────
// //   const handleCreateOrder = async () => {
// //     setSuccessMessage("");
// //     setSubmitError("");

// //     if (!agent) {
// //       setSubmitError("Your agent profile hasn't finished loading yet.");
// //       return;
// //     }

// //     if (!validateForm()) {
// //       return;
// //     }

// //     if (deliveryMethod === "DELIVERY" && !selectedAddressId) {
// //       setSubmitError("Please select a delivery address.");
// //       return;
// //     }

// //     if (deliveryMethod === "PICKUP" && (!pickupDate || !pickupTimeSlot)) {
// //       setSubmitError("Please select pickup date and time.");
// //       return;
// //     }

// //     if (cart.length === 0) {
// //       setSubmitError("Please add at least one product.");
// //       return;
// //     }

// //     setIsSubmitting(true);

// //     try {
// //       const payload = buildPayload();
// //       const order = await createAgentOrder(payload);
// //       console.log("ORDER CREATED:", order);
// //       setSuccessMessage("Order created successfully.");
// //       resetOrderState();
// //     } catch (err: any) {
// //       console.error("========================================");
// //       console.error("ORDER CREATION FAILED");
// //       console.error("========================================");
// //       console.error("Status:", err?.response?.status);
// //       console.error("Backend response:", err?.response?.data);

// //       const message =
// //         err?.response?.data?.error ||
// //         err?.response?.data?.message ||
// //         err?.message ||
// //         "Could not create the order.";

// //       setSubmitError(message);
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   };

// //   // ── Render helpers ───────────────────────────────────────────────────────

// //   const renderNormalProductCard = (product: BakeryProduct) => {
// //     const key = cartKey(product.id, "NORMAL");
// //     const price = product.price || 0;
// //     const { finalPrice } = getDiscountedPrice(price);
// //     const outOfStock = (product as any).stock !== undefined && (product as any).stock <= 0;

// //     const variantOptions = getVariantOptions(product);
// //     const flavourOptions = getFlavourOptions(product);

// //     const selectedVariantId = variantOptions.length
// //       ? getDraftVariantId(key, variantOptions)
// //       : "";
// //     const selectedFlavourId = flavourOptions.length
// //       ? getDraftFlavourId(key, flavourOptions)
// //       : "";

// //     return (
// //       <div className="ao-product-card" key={key}>
// //         {agentDiscount > 0 && <span className="ao-badge ao-badge-discount">{agentDiscount}% OFF</span>}
// //         <div className="ao-product-image-wrap">
// //           {(product as any).image_url ? (
// //             <img src={(product as any).image_url} alt={product.name} className="ao-product-image" />
// //           ) : (
// //             <div className="ao-product-image-placeholder">No Image</div>
// //           )}
// //         </div>
// //         <div className="ao-product-info">
// //           <p className="ao-product-name">{product.name}</p>
// //           {(product as any).description && (
// //             <p className="ao-product-desc">{(product as any).description}</p>
// //           )}

// //           {variantOptions.length > 0 && (
// //             <div className="ao-field ao-option-field">
// //               <label>Variant</label>
// //               <select
// //                 value={selectedVariantId}
// //                 onChange={(e) => setDraftVariant(key, e.target.value)}
// //               >
// //                 {variantOptions.map((v) => (
// //                   <option key={v.id} value={String(v.id)}>
// //                     {v.name}
// //                   </option>
// //                 ))}
// //               </select>
// //             </div>
// //           )}

// //           {flavourOptions.length > 0 && (
// //             <div className="ao-field ao-option-field">
// //               <label>Flavour</label>
// //               <select
// //                 value={selectedFlavourId}
// //                 onChange={(e) => setDraftFlavour(key, e.target.value)}
// //               >
// //                 {flavourOptions.map((f) => (
// //                   <option key={f.id} value={String(f.id)}>
// //                     {f.name}
// //                   </option>
// //                 ))}
// //               </select>
// //             </div>
// //           )}

// //           <div className="ao-price-row">
// //             {agentDiscount > 0 ? (
// //               <>
// //                 <span className="ao-price-original">KWD {formatMoney(price)}</span>
// //                 <span className="ao-price-final">KWD {formatMoney(finalPrice)}</span>
// //               </>
// //             ) : (
// //               <span className="ao-price-final">{currency} {formatMoney(price)}</span>
// //             )}
// //           </div>
// //         </div>
// //         <div className="ao-card-footer">
// //           <div className="ao-qty-control">
// //             <button type="button" className="ao-qty-btn" onClick={() => changeDraftQty(key, -1)} aria-label="Decrease quantity">−</button>
// //             <span className="ao-qty-value">{getDraftQty(key)}</span>
// //             <button type="button" className="ao-qty-btn" onClick={() => changeDraftQty(key, 1)} aria-label="Increase quantity">+</button>
// //           </div>
// //           <button
// //             type="button"
// //             className="ao-btn ao-btn-add"
// //             disabled={outOfStock}
// //             onClick={() => addNormalProductToCart(product)}
// //           >
// //             {outOfStock ? "Out of Stock" : "Add"}
// //           </button>
// //         </div>
// //       </div>
// //     );
// //   };

// //   const renderAgentProductCard = (product: AgentProduct) => {
// //     const key = cartKey(product.id, "AGENT");
// //     const price = product.price || 0;

// //     const variantOptions = getVariantOptions(product);
// //     const flavourOptions = getFlavourOptions(product);

// //     const selectedVariantId = variantOptions.length
// //       ? getDraftVariantId(key, variantOptions)
// //       : "";
// //     const selectedFlavourId = flavourOptions.length
// //       ? getDraftFlavourId(key, flavourOptions)
// //       : "";

// //     return (
// //       <div className="ao-product-card" key={key}>
// //         <span className="ao-badge ao-badge-exclusive">Agent Exclusive</span>
// //         <div className="ao-product-image-wrap">
// //           {product.image ? (
// //             <img src={product.image} alt={product.name} className="ao-product-image" />
// //           ) : (
// //             <div className="ao-product-image-placeholder">No Image</div>
// //           )}
// //         </div>
// //         <div className="ao-product-info">
// //           <p className="ao-product-name">{product.name}</p>
// //           {product.description && <p className="ao-product-desc">{product.description}</p>}

// //           {variantOptions.length > 0 && (
// //             <div className="ao-field ao-option-field">
// //               <label>Variant</label>
// //               <select
// //                 value={selectedVariantId}
// //                 onChange={(e) => setDraftVariant(key, e.target.value)}
// //               >
// //                 {variantOptions.map((v) => (
// //                   <option key={v.id} value={String(v.id)}>
// //                     {v.name}
// //                   </option>
// //                 ))}
// //               </select>
// //             </div>
// //           )}

// //           {flavourOptions.length > 0 && (
// //             <div className="ao-field ao-option-field">
// //               <label>Flavour</label>
// //               <select
// //                 value={selectedFlavourId}
// //                 onChange={(e) => setDraftFlavour(key, e.target.value)}
// //               >
// //                 {flavourOptions.map((f) => (
// //                   <option key={f.id} value={String(f.id)}>
// //                     {f.name}
// //                   </option>
// //                 ))}
// //               </select>
// //             </div>
// //           )}

// //           <div className="ao-price-row">
// //             <span className="ao-price-final">KWD {formatMoney(price)}</span>
// //           </div>
// //         </div>
// //         <div className="ao-card-footer">
// //           <div className="ao-qty-control">
// //             <button type="button" className="ao-qty-btn" onClick={() => changeDraftQty(key, -1)} aria-label="Decrease quantity">−</button>
// //             <span className="ao-qty-value">{getDraftQty(key)}</span>
// //             <button type="button" className="ao-qty-btn" onClick={() => changeDraftQty(key, 1)} aria-label="Increase quantity">+</button>
// //           </div>
// //           <button type="button" className="ao-btn ao-btn-add" onClick={() => addAgentProductToCart(product)}>
// //             Add
// //           </button>
// //         </div>
// //       </div>
// //     );
// //   };

// //   const renderProductSkeletons = (count: number) => (
// //     <div className="ao-product-grid">
// //       {Array.from({ length: count }).map((_, i) => (
// //         <div className="ao-product-card ao-skeleton-card" key={i}>
// //           <div className="ao-skeleton ao-skeleton-image" />
// //           <div className="ao-skeleton ao-skeleton-line" />
// //           <div className="ao-skeleton ao-skeleton-line ao-skeleton-line-short" />
// //         </div>
// //       ))}
// //     </div>
// //   );

// //   const renderShowMoreButton = (onClick: () => void, remaining: number) => (
// //     <div className="ao-show-more-wrap">
// //       <button type="button" className="ao-btn ao-btn-secondary ao-show-more-btn" onClick={onClick}>
// //         Show More ({remaining} more)
// //       </button>
// //     </div>
// //   );

// //   // =============================================================================
// //   // ─── JSX ─────────────────────────────────────────────────────────────────────
// //   // =============================================================================

// //   return (
// //     <div className="ao-page">
// //       {/* ── Header ─────────────────────────────────────────────────────── */}
// //       <header className="ao-header">
// //         <p className="ao-eyebrow">Agent Self-Order</p>
// //         <h1 className="ao-title">Place Your Order</h1>
// //       </header>

// //       {successMessage && <div className="ao-toast ao-toast-success">{successMessage}</div>}
// //       {(submitError || catalogError) && (
// //         <div className="ao-toast ao-toast-error">{submitError || catalogError}</div>
// //       )}

// //       <div className="ao-layout">
// //         {/* ── Main column ────────────────────────────────────────────── */}
// //         <div className="ao-main-column">
// //           {/* Card — Agent Info (read-only, auto-filled) */}
// //           <section className="ao-card">
// //             <h2 className="ao-card-title">Your Details</h2>
// //             {agentLoading ? (
// //               <p className="ao-muted">Loading your profile…</p>
// //             ) : agent ? (
// //               <div className="ao-agent-info">
// //                 <div className="ao-agent-avatar">{(agent.first_name || "A").charAt(0)}</div>
// //                 <div className="ao-agent-meta">
// //                   <p className="ao-agent-name">{agent.first_name} {agent.last_name}</p>
// //                   <p className="ao-agent-sub">{agent.email} · {agent.phone_no}</p>
// //                   <p className="ao-agent-sub">Agent ID: {agent.id}</p>
// //                 </div>
// //                 {agentDiscount > 0 && (
// //                   <span className="ao-badge ao-badge-discount ao-agent-discount-badge">
// //                     {agentDiscount}% agent discount
// //                   </span>
// //                 )}
// //               </div>
// //             ) : (
// //               <p className="ao-muted">We couldn't load your profile.</p>
// //             )}
// //           </section>

// //           {/* Card — Delivery Method */}
// //           <section className="ao-card">
// //             <h2 className="ao-card-title">Delivery Method</h2>
// //             {errors.deliveryMethod && <span className="ao-error-text">{errors.deliveryMethod}</span>}

// //             <div className="ao-delivery-cards">
// //               <button
// //                 type="button"
// //                 className={`ao-delivery-card ${deliveryMethod === "PICKUP" ? "ao-delivery-card-active" : ""}`}
// //                 onClick={() => setDeliveryMethod("PICKUP")}
// //               >
// //                 <span className="ao-delivery-icon">🏬</span>
// //                 <span className="ao-delivery-label">Pickup</span>
// //                 <span className="ao-delivery-sub">No delivery charge</span>
// //               </button>
// //               <button
// //                 type="button"
// //                 className={`ao-delivery-card ${deliveryMethod === "DELIVERY" ? "ao-delivery-card-active" : ""}`}
// //                 onClick={() => setDeliveryMethod("DELIVERY")}
// //               >
// //                 <span className="ao-delivery-icon">🚚</span>
// //                 <span className="ao-delivery-label">Delivery</span>
// //                 <span className="ao-delivery-sub">Charge based on your area</span>
// //               </button>
// //             </div>

// //             {deliveryMethod === "PICKUP" && (
// //               <div className="ao-address-section">
// //                 <div className="ao-field-grid ao-delivery-time-grid">
// //                   <div className="ao-field">
// //                     <label>Pickup Date *</label>
// //                     <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
// //                     {errors.pickupDate && <span className="ao-error-text">{errors.pickupDate}</span>}
// //                   </div>
// //                   <div className="ao-field">
// //                     <label>Pickup Time *</label>
// //                     <select value={pickupTimeSlot} onChange={(e) => setPickupTimeSlot(e.target.value)}>
// //                       <option value="">Select a pickup time</option>
// //                       {TIME_SLOTS.map((slot) => (
// //                         <option key={slot} value={slot}>{slot}</option>
// //                       ))}
// //                     </select>
// //                     {errors.pickupTimeSlot && <span className="ao-error-text">{errors.pickupTimeSlot}</span>}
// //                   </div>
// //                 </div>
// //               </div>
// //             )}

// //             {deliveryMethod === "DELIVERY" && (
// //               <div className="ao-address-section">
// //                 {errors.address && <span className="ao-error-text">{errors.address}</span>}

// //                 {addressesLoading ? (
// //                   <p className="ao-muted">Loading your addresses…</p>
// //                 ) : addresses.length === 0 ? (
// //                   <p className="ao-muted">You don't have any saved addresses yet.</p>
// //                 ) : (
// //                   <div className="ao-address-list">
// //                     {addresses.map((addr) => {
// //                       const area = addr.area || areas.find((a) => a.id === addr.area_id);
// //                       const lineParts = [
// //                         addr.block,
// //                         addr.avenue,
// //                         addr.street,
// //                         addr.building ? `Building ${addr.building}` : null,
// //                         addr.floor ? `Floor ${addr.floor}` : null,
// //                         addr.apartment ? `Apt ${addr.apartment}` : null,
// //                       ].filter(Boolean);
// //                       return (
// //                         <div
// //                           key={addr.id}
// //                           className={`ao-address-card ${selectedAddressId === addr.id ? "ao-address-card-active" : ""}`}
// //                           onClick={() => setSelectedAddressId(addr.id as number)}
// //                         >
// //                           <div className="ao-address-card-main">
// //                             <p className="ao-address-line">{lineParts.join(", ")}</p>
// //                             <p className="ao-address-sub">
// //                               {area?.name || "Unknown area"} · {addr.country}
// //                               {addr.delivery_notes ? ` · ${addr.delivery_notes}` : ""}
// //                             </p>
// //                           </div>
// //                           <div className="ao-address-card-actions" onClick={(e) => e.stopPropagation()}>
// //                             <button type="button" className="ao-icon-btn" onClick={() => openEditAddressModal(addr)} aria-label="Edit address">✎</button>
// //                             <button type="button" className="ao-icon-btn ao-icon-btn-danger" onClick={() => handleDeleteAddress(addr.id as number)} aria-label="Delete address">✕</button>
// //                           </div>
// //                         </div>
// //                       );
// //                     })}
// //                   </div>
// //                 )}

// //                 <button type="button" className="ao-btn ao-btn-secondary ao-add-address-btn" onClick={openAddAddressModal}>
// //                   + Add New Address
// //                 </button>

// //                 <div className="ao-field-grid ao-delivery-time-grid">
// //                   <div className="ao-field">
// //                     <label>Delivery Date *</label>
// //                     <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
// //                     {errors.deliveryDate && <span className="ao-error-text">{errors.deliveryDate}</span>}
// //                   </div>
// //                   <div className="ao-field">
// //                     <label>Delivery Time Slot *</label>
// //                     <select value={deliveryTimeSlot} onChange={(e) => setDeliveryTimeSlot(e.target.value)}>
// //                       <option value="">Select a time slot</option>
// //                       {TIME_SLOTS.map((slot) => (
// //                         <option key={slot} value={slot}>{slot}</option>
// //                       ))}
// //                     </select>
// //                     {errors.deliveryTimeSlot && <span className="ao-error-text">{errors.deliveryTimeSlot}</span>}
// //                   </div>
// //                 </div>
// //               </div>
// //             )}
// //           </section>

// //           {/* Card — Menu / Agent Menu */}
// //           <section className="ao-card">
// //             <h2 className="ao-card-title">
// //               {menuTab === "MENU" ? "Menu" : "Agent Menu (Exclusive)"}
// //             </h2>
// //             {errors.items && <span className="ao-error-text">{errors.items}</span>}

// //             {/* Tab switcher */}
// //             <div className="ao-menu-tabs">
// //               <button
// //                 type="button"
// //                 className={`ao-menu-tab ${menuTab === "MENU" ? "ao-menu-tab-active" : ""}`}
// //                 onClick={() => setMenuTab("MENU")}
// //               >
// //                 <span className="ao-menu-tab-icon">📋</span>
// //                 <span>Menu</span>
// //               </button>
// //               <button
// //                 type="button"
// //                 className={`ao-menu-tab ${menuTab === "AGENT_MENU" ? "ao-menu-tab-active" : ""}`}
// //                 onClick={() => setMenuTab("AGENT_MENU")}
// //               >
// //                 <span className="ao-menu-tab-icon">⭐</span>
// //                 <span>Agent Menu (Exclusive)</span>
// //               </button>
// //             </div>

// //             <input
// //               type="text"
// //               className="ao-search-bar"
// //               placeholder={
// //                 menuTab === "MENU"
// //                   ? "Search the menu…"
// //                   : "Search your exclusive products…"
// //               }
// //               value={searchTerm}
// //               onChange={(e) => setSearchTerm(e.target.value)}
// //             />

// //             {categories.length > 0 && (
// //               <div className="ao-category-chips">
// //                 <button
// //                   type="button"
// //                   className={`ao-chip ${categoryFilter === "ALL" ? "ao-chip-active" : ""}`}
// //                   onClick={() => setCategoryFilter("ALL")}
// //                 >
// //                   All
// //                 </button>
// //                 {categories.map((c) => (
// //                   <button
// //                     key={c}
// //                     type="button"
// //                     className={`ao-chip ${categoryFilter === c ? "ao-chip-active" : ""}`}
// //                     onClick={() => setCategoryFilter(c)}
// //                   >
// //                     {c}
// //                   </button>
// //                 ))}
// //               </div>
// //             )}

// //             {menuTab === "MENU" ? (
// //               <>
// //                 <h3 className="ao-subsection-title">
// //                   Our Menu {agentDiscount > 0 ? `(${agentDiscount}% off for you)` : ""}
// //                 </h3>
// //                 {catalogLoading ? (
// //                   renderProductSkeletons(4)
// //                 ) : filteredProducts.length === 0 ? (
// //                   <p className="ao-muted">No products match your search.</p>
// //                 ) : (
// //                   <>
// //                     <div className="ao-product-grid">{visibleProducts.map(renderNormalProductCard)}</div>
// //                     {hasMoreProducts &&
// //                       renderShowMoreButton(showMoreProducts, filteredProducts.length - visibleProducts.length)}
// //                   </>
// //                 )}
// //               </>
// //             ) : (
// //               <>
// //                 <h3 className="ao-subsection-title">Your Exclusive Products</h3>
// //                 {catalogLoading ? (
// //                   renderProductSkeletons(4)
// //                 ) : filteredAgentProducts.length === 0 ? (
// //                   <p className="ao-muted">No exclusive products assigned to you yet.</p>
// //                 ) : (
// //                   <>
// //                     <div className="ao-product-grid">{visibleAgentProducts.map(renderAgentProductCard)}</div>
// //                     {hasMoreAgentProducts &&
// //                       renderShowMoreButton(
// //                         showMoreAgentProducts,
// //                         filteredAgentProducts.length - visibleAgentProducts.length
// //                       )}
// //                   </>
// //                 )}
// //               </>
// //             )}
// //           </section>

// //           {/* Card — Cart */}
// //           <section className="ao-card">
// //             <h2 className="ao-card-title">Cart</h2>
// //             {cart.length === 0 ? (
// //               <div className="ao-empty-cart">
// //                 <div className="ao-empty-cart-icon">🛒</div>
// //                 <p className="ao-muted">Your cart is empty. Add something delicious above.</p>
// //               </div>
// //             ) : (
// //               <div className="ao-cart-table-wrap">
// //                 <table className="ao-cart-table">
// //                   <thead>
// //                     <tr>
// //                       <th>Product</th>
// //                       <th>Qty</th>
// //                       <th>Original</th>
// //                       <th>Discount</th>
// //                       <th>Final</th>
// //                       <th>Subtotal</th>
// //                       <th></th>
// //                     </tr>
// //                   </thead>
// //                   <tbody>
// //                     {cart.map((item) => (
// //                       <tr key={item.cartId}>
// //                         <td>
// //                           <div className="ao-cart-product-name">{item.name}</div>
// //                           <span className={`ao-tag ${item.productType === "AGENT" ? "ao-tag-agent" : "ao-tag-normal"}`}>
// //                             {item.productType === "AGENT" ? "Agent Exclusive" : "Normal"}
// //                           </span>
// //                           {(item.variantName || item.flavourName) && (
// //                             <div className="ao-cart-item-options">
// //                               {item.variantName && (
// //                                 <span className="ao-tag ao-tag-option">Variant: {item.variantName}</span>
// //                               )}
// //                               {item.flavourName && (
// //                                 <span className="ao-tag ao-tag-option">Flavour: {item.flavourName}</span>
// //                               )}
// //                             </div>
// //                           )}
// //                         </td>
// //                         <td>
// //                           <div className="ao-qty-control">
// //                             <button type="button" className="ao-qty-btn" onClick={() => changeCartQuantity(item.cartId, -1)}>−</button>
// //                             <span className="ao-qty-value">{item.quantity}</span>
// //                             <button type="button" className="ao-qty-btn" onClick={() => changeCartQuantity(item.cartId, 1)}>+</button>
// //                           </div>
// //                         </td>
// //                         <td>{currency} {formatMoney(item.originalPrice)}</td>
// //                         <td>{item.discountPercentage > 0 ? `${item.discountPercentage}% (-${currency} ${formatMoney(item.discountAmount)})` : "—"}</td>
// //                         <td>{currency} {formatMoney(item.finalPrice)}</td>
// //                         <td>{currency} {formatMoney(item.finalPrice * item.quantity)}</td>
// //                         <td>
// //                           <button type="button" className="ao-btn-remove" onClick={() => removeCartItem(item.cartId)} aria-label="Remove item">✕</button>
// //                         </td>
// //                       </tr>
// //                     ))}
// //                   </tbody>
// //                 </table>
// //               </div>
// //             )}
// //           </section>

// //           {/* Card — Notes */}
// //           <section className="ao-card">
// //             <h2 className="ao-card-title">Notes</h2>
// //             <div className="ao-field">
// //               <label>Notes for this order</label>
// //               <textarea
// //                 rows={3}
// //                 value={notes}
// //                 onChange={(e) => setNotes(e.target.value)}
// //                 placeholder="Anything the kitchen or delivery team should know…"
// //               />
// //             </div>
// //           </section>
// //         </div>

// //         {/* ── Sticky sidebar ─────────────────────────────────────────── */}
// //         <aside className="ao-sidebar">
// //           <section className="ao-card ao-summary-card">
// //             <h2 className="ao-card-title">Order Summary</h2>

// //             <div className="ao-summary-row">
// //               <span>Subtotal</span>
// //               <span>{currency} {formatMoney(originalSubtotal)}</span>
// //             </div>
// //             <div className="ao-summary-row ao-summary-discount">
// //               <span>Agent Discount Total</span>
// //               <span>-{currency} {formatMoney(discountTotal)}</span>
// //             </div>
// //             <div className="ao-summary-row">
// //               <span>Delivery Charge</span>
// //               <span>{currency} {formatMoney(deliveryCharge)}</span>
// //             </div>
// //             <div className="ao-summary-row ao-summary-grand-total">
// //               <span>Grand Total</span>
// //               <span>{currency} {formatMoney(grandTotal)}</span>
// //             </div>

// //           </section>

// //           <div className="ao-action-buttons">
// //             <button
// //               type="button"
// //               className="ao-btn ao-btn-primary ao-btn-full"
// //               onClick={handleCreateOrder}
// //               disabled={isSubmitting || agentLoading}
// //             >
// //               {isSubmitting ? "Creating…" : "Create Order"}
// //             </button>
// //           </div>
// //         </aside>
// //       </div>

// //       {/* ── Address add/edit modal ───────────────────────────────────── */}
// //       {addressModalOpen && (
// //         <div className="ao-modal-overlay" onClick={closeAddressModal}>
// //           <div className="ao-modal" onClick={(e) => e.stopPropagation()}>
// //             <h3 className="ao-modal-title">{editingAddressId ? "Edit Address" : "Add New Address"}</h3>

// //             {addressFormError && <span className="ao-error-text">{addressFormError}</span>}

// //             <div className="ao-field-grid">
// //               <div className="ao-field ao-field-full">
// //                 <label>Area *</label>
// //                 <select
// //                   value={addressForm.area_id ?? ""}
// //                   onChange={(e) => updateAddressField("area_id", e.target.value)}
// //                   disabled={areasLoading}
// //                 >
// //                   <option value="">{areasLoading ? "Loading areas…" : "Select an area"}</option>
// //                   {areas.map((a) => (
// //                     <option key={a.id} value={a.id}>{a.name}</option>
// //                   ))}
// //                 </select>
// //               </div>
// //               <div className="ao-field">
// //                 <label>Street *</label>
// //                 <input type="text" value={addressForm.street} onChange={(e) => updateAddressField("street", e.target.value)} />
// //               </div>
// //               <div className="ao-field">
// //                 <label>Country *</label>
// //                 <input type="text" value={addressForm.country} onChange={(e) => updateAddressField("country", e.target.value)} />
// //               </div>
// //               <div className="ao-field">
// //                 <label>Block</label>
// //                 <input type="text" value={addressForm.block} onChange={(e) => updateAddressField("block", e.target.value)} />
// //               </div>
// //               <div className="ao-field">
// //                 <label>Avenue</label>
// //                 <input type="text" value={addressForm.avenue} onChange={(e) => updateAddressField("avenue", e.target.value)} />
// //               </div>
// //               <div className="ao-field">
// //                 <label>Building</label>
// //                 <input type="text" value={addressForm.building} onChange={(e) => updateAddressField("building", e.target.value)} />
// //               </div>
// //               <div className="ao-field">
// //                 <label>Floor</label>
// //                 <input type="text" value={addressForm.floor} onChange={(e) => updateAddressField("floor", e.target.value)} />
// //               </div>
// //               <div className="ao-field">
// //                 <label>Apartment</label>
// //                 <input type="text" value={addressForm.apartment} onChange={(e) => updateAddressField("apartment", e.target.value)} />
// //               </div>
// //               <div className="ao-field ao-field-full">
// //                 <label>Delivery Notes</label>
// //                 <textarea rows={2} value={addressForm.delivery_notes} onChange={(e) => updateAddressField("delivery_notes", e.target.value)} />
// //               </div>
// //             </div>

// //             <div className="ao-modal-actions">
// //               <button type="button" className="ao-btn ao-btn-ghost" onClick={closeAddressModal}>Cancel</button>
// //               <button type="button" className="ao-btn ao-btn-primary" onClick={saveAddress} disabled={addressSaving}>
// //                 {addressSaving ? "Saving…" : editingAddressId ? "Save Changes" : "Add Address"}
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default AgentOrder;





// import React, { useEffect, useMemo, useState, useCallback } from "react";
// import "./agentorder.css";

// // ─────────────────────────────────────────────────────────────────────────────
// // EXISTING SERVICES ONLY (agentService.ts, areaService.ts) — nothing here
// // creates or modifies those services. addressService.ts is a new, minimal
// // file added alongside this component (see accompanying message).
// // ─────────────────────────────────────────────────────────────────────────────

// import {
//   getAgentDashboard,
//   getAgentCatalog,
//   createAgentOrder,
//   type Agent,
//   type AgentProduct,
//   type BakeryProduct,
//   type CreateAgentOrderPayload,
//   type AgentOrderItemInput,
// } from "../services/agentService";

// // Areas — same assumption as your existing SalesAgentCreateOrder file: not
// // included in what you shared, so point this at your real areas export if
// // the path/shape differs.
// import { getAreas } from "../services/areaService";

// import {
//   getMyAddresses,
//   createAddress,
//   updateAddress,
//   deleteAddress,
//   type Address,
// } from "../services/addressService";

// type AddressInput = Omit<Address, "id" | "user_id">;

// // =============================================================================
// // ─── TYPES ───────────────────────────────────────────────────────────────────
// // =============================================================================

// interface AreaOption {
//   id: number;
//   name: string;
//   currency?: string;
//   delivery_charge?: number;
// }

// type ProductType = "NORMAL" | "AGENT";

// interface CartItem {
//   cartId: string;
//   productId: number;
//   productType: ProductType;
//   name: string;
//   image?: string;
//   originalPrice: number;
//   discountPercentage: number; // 0 for AGENT products
//   discountAmount: number; // per unit
//   finalPrice: number; // per unit, after discount
//   quantity: number;
//   currency: string;
//   // Variant / flavour selections — present for any product (normal or
//   // agent-exclusive) that exposes variants/flavours.
//   variantId?: string | number;
//   variantName?: string;
//   flavourId?: string | number;
//   flavourName?: string;
// }

// type DeliveryMethod = "PICKUP" | "DELIVERY";

// type PaymentMethodOption = "COD" | "CARD" | "KNET" | "UPI" | "LINK";

// type MenuTab = "MENU" | "AGENT_MENU";

// interface FormErrors {
//   deliveryMethod?: string;
//   address?: string;
//   items?: string;
//   paymentMethod?: string;
//   pickupDate?: string;
//   pickupTimeSlot?: string;
//   deliveryDate?: string;
//   deliveryTimeSlot?: string;
// }

// interface AddressFormState {
//   area_id: number | null;
//   street: string;
//   country: string;
//   block: string;
//   avenue: string;
//   building: string;
//   floor: string;
//   apartment: string;
//   delivery_notes: string;
// }

// /**
//  * Backend now stores variants/flavours as plain string arrays
//  * (["1kg", "Half kg"], ["Chocolate", "Vanilla"]) with no price modifier.
//  * These helpers still tolerate an array of { id, name } objects for
//  * backward compatibility, but the id defaults to the name itself for plain
//  * strings, which is what the backend now sends.
//  */
// interface ProductOption {
//   id: string | number;
//   name: string;
//   price_modifier?: number; // kept optional for backward compatibility; unused now
// }

// /**
//  * CreateAgentOrderPayload (agentService.ts) doesn't currently have fields for
//  * order_source, delivery_method, agent-side notes, or a discount summary.
//  * This local type is a strict superset — assigning an object of this shape
//  * to the real payload type still type-checks, so createAgentOrder() accepts
//  * it as-is. Add matching columns/handling on the backend to actually persist
//  * these extra fields; until then they'll simply be ignored by the API.
//  */
// interface AgentOrderPayloadExtended extends CreateAgentOrderPayload {
//   order_source?: "AGENT_SELF";
//   delivery_method?: DeliveryMethod;
//   agent_notes?: string;
//   agent_discount_percentage?: number;
//   discount_total?: number;
//   delivery_charge?: number;
//   subtotal?: number;
//   grand_total?: number;
// }

// /** Draft selection used by the "Add to cart" customization modal — mirrors
//  *  SalesAgentCreateOrder's DraftSelection, extended with productType since
//  *  AgentOrder has two distinct catalogs (NORMAL vs AGENT-exclusive). */
// interface DraftSelection {
//   product: BakeryProduct | AgentProduct;
//   productType: ProductType;
//   variantId: string | null;
//   flavourId: string | null;
//   quantity: number;
// }

// const TIME_SLOTS = [
//   "9:00 AM - 10:00 AM",
//   "10:00 AM - 11:00 AM",
//   "11:00 AM - 12:00 PM",
//   "12:00 PM - 1:00 PM",
//   "1:00 PM - 2:00 PM",
//   "2:00 PM - 3:00 PM",
//   "3:00 PM - 4:00 PM",
//   "4:00 PM - 5:00 PM",
//   "5:00 PM - 6:00 PM",
//   "6:00 PM - 7:00 PM",
//   "7:00 PM - 8:00 PM",
//   "8:00 PM - 9:00 PM",
//   "9:00 PM - 10:00 PM",
// ];

// const PAYMENT_METHODS: { value: PaymentMethodOption; label: string }[] = [
//   { value: "COD", label: "Cash" },
//   { value: "CARD", label: "Card" },
//   { value: "KNET", label: "KNET" },
//   { value: "UPI", label: "UPI" },
//   { value: "LINK", label: "Other" },
// ];

// const EMPTY_ADDRESS_FORM: AddressFormState = {
//   area_id: null,
//   street: "",
//   country: "",
//   block: "",
//   avenue: "",
//   building: "",
//   floor: "",
//   apartment: "",
//   delivery_notes: "",
// };

// // Products page size for the POS-style grid, mirrors SalesAgentCreateOrder's
// // PRODUCTS_PER_PAGE — 6 products per page, with numbered pagination instead
// // of "Show More".
// const PRODUCTS_PER_PAGE = 6;

// // =============================================================================
// // ─── HELPERS ─────────────────────────────────────────────────────────────────
// // =============================================================================

// const makeCartId = (): string =>
//   `cart_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

// const formatMoney = (value: number): string => (value || 0).toFixed(2);

// const cartKey = (productId: number, type: ProductType) => `${type}-${productId}`;

// /**
//  * category can come back from the API as a plain string OR as an object
//  * (e.g. { id, name }). Rendering an object directly via String(obj) produces
//  * "[object Object]" — this normalizes it to a display-safe string, or null
//  * when there's nothing usable.
//  */
// const getCategoryName = (category: unknown): string | null => {
//   if (category === null || category === undefined) return null;
//   if (typeof category === "string") return category.trim() || null;
//   if (typeof category === "number") return String(category);
//   if (typeof category === "object") {
//     const c = category as any;
//     return c.name ?? c.title ?? c.label ?? null;
//   }
//   return null;
// };

// /**
//  * Reads a list of variant/flavour options off a product for a given key.
//  * Accepts:
//  *  - an array of plain strings (current backend shape: ["1kg", "Half kg"])
//  *  - an array of { id, name } / { id, name, price_modifier } objects
//  * and normalizes either into { id, name } pairs. For plain strings, id
//  * defaults to the string itself.
//  */
// const getOptionList = (
//   product: unknown,
//   keys: string[]
// ): ProductOption[] => {
//   if (!product || typeof product !== "object") return [];
//   const p = product as any;
//   for (const key of keys) {
//     const raw = p[key];
//     if (Array.isArray(raw) && raw.length > 0) {
//       return raw
//         .map((entry: any, idx: number) => {
//           if (entry === null || entry === undefined) return null;
//           if (typeof entry === "string" || typeof entry === "number") {
//             return { id: String(entry), name: String(entry) };
//           }
//           if (typeof entry === "object") {
//             const id = entry.id ?? entry.value ?? entry.code ?? idx;
//             const name = entry.name ?? entry.label ?? entry.title ?? String(id);
//             const price_modifier =
//               typeof entry.price_modifier === "number"
//                 ? entry.price_modifier
//                 : typeof entry.price_delta === "number"
//                 ? entry.price_delta
//                 : undefined;
//             return { id, name, price_modifier };
//           }
//           return null;
//         })
//         .filter(Boolean) as ProductOption[];
//     }
//   }
//   return [];
// };

// // Flavour lookup — checks the "flavor_name"-first fallback order (same as
// // OrderManagement.tsx / Salesagentorder.tsx / KitchenOrder.tsx) so the
// // American-spelling key some endpoints actually send isn't skipped.
// const getVariantOptions = (product: unknown): ProductOption[] =>
//   getOptionList(product, ["variants", "variant_options", "product_variants"]);

// const getFlavourOptions = (product: unknown): ProductOption[] =>
//   getOptionList(product, [
//     "flavor_options",
//     "flavors",
//     "flavour_options",
//     "flavours",
//   ]);

// // =============================================================================
// // ─── COMPONENT ───────────────────────────────────────────────────────────────
// // =============================================================================

// const AgentOrder: React.FC = () => {
//   // ── Logged-in agent (auto-loaded, never typed manually) ─────────────────
//   const [agent, setAgent] = useState<Agent | null>(null);
//   const [agentLoading, setAgentLoading] = useState<boolean>(true);
//   const agentDiscount = agent?.default_discount ?? 0;

//   // ── Addresses ────────────────────────────────────────────────────────────
//   const [addresses, setAddresses] = useState<Address[]>([]);
//   const [addressesLoading, setAddressesLoading] = useState<boolean>(true);
//   const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

//   const [addressModalOpen, setAddressModalOpen] = useState<boolean>(false);
//   const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
//   const [addressForm, setAddressForm] = useState<AddressFormState>(EMPTY_ADDRESS_FORM);
//   const [addressSaving, setAddressSaving] = useState<boolean>(false);
//   const [addressFormError, setAddressFormError] = useState<string>("");

//   // ── Areas (for address form + delivery charge lookup) ──────────────────
//   const [areas, setAreas] = useState<AreaOption[]>([]);
//   const [areasLoading, setAreasLoading] = useState<boolean>(true);

//   // ── Delivery method ──────────────────────────────────────────────────────
//   const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("PICKUP");
//   const [pickupDate, setPickupDate] = useState<string>("");
//   const [pickupTimeSlot, setPickupTimeSlot] = useState<string>("");
//   const [deliveryDate, setDeliveryDate] = useState<string>("");
//   const [deliveryTimeSlot, setDeliveryTimeSlot] = useState<string>("");

//   // ── Catalog: normal products + agent's own products ─────────────────────
//   const [products, setProducts] = useState<BakeryProduct[]>([]);
//   const [agentProducts, setAgentProducts] = useState<AgentProduct[]>([]);
//   const [catalogLoading, setCatalogLoading] = useState<boolean>(true);
//   const [catalogError, setCatalogError] = useState<string>("");

//   const [searchTerm, setSearchTerm] = useState<string>("");
//   const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

//   // ── Menu / Agent Menu tab switcher ───────────────────────────────────────
//   const [menuTab, setMenuTab] = useState<MenuTab>("MENU");

//   // ── Pagination — numbered pages, 6 products per page, one page-counter
//   //     per grid (Menu vs Agent Menu), same pattern as SalesAgentCreateOrder ──
//   const [menuPage, setMenuPage] = useState<number>(1);
//   const [agentMenuPage, setAgentMenuPage] = useState<number>(1);

//   // ── Cart ─────────────────────────────────────────────────────────────────
//   const [cart, setCart] = useState<CartItem[]>([]);

//   // ── "Add to cart" customization modal — asks quantity / variant / flavour
//   //     before the item is added, same flow as SalesAgentCreateOrder ───────
//   const [draftSelection, setDraftSelection] = useState<DraftSelection | null>(null);

//   // ── Payment / notes ──────────────────────────────────────────────────────
//   const [paymentMethod, setPaymentMethod] = useState<PaymentMethodOption | "">("");
//   const [notes, setNotes] = useState<string>("");
//   const [currency, setCurrency] = useState<string>("KWD");

//   // ── Submission ───────────────────────────────────────────────────────────
//   const [errors, setErrors] = useState<FormErrors>({});
//   const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
//   const [successMessage, setSuccessMessage] = useState<string>("");
//   const [submitError, setSubmitError] = useState<string>("");

//   // ── Load agent profile, addresses, areas, catalog on mount ─────────────
//   useEffect(() => {
//     let cancelled = false;

//     const loadAgent = async () => {
//       setAgentLoading(true);
//       try {
//         const dashboard = await getAgentDashboard();
//         if (!cancelled) setAgent(dashboard.agent);
//       } catch (err) {
//         if (!cancelled) setSubmitError("Unable to load your agent profile. Please refresh.");
//       } finally {
//         if (!cancelled) setAgentLoading(false);
//       }
//     };

//     const loadAddresses = async () => {
//       setAddressesLoading(true);
//       try {
//         const list = await getMyAddresses();
//         if (!cancelled) {
//           setAddresses(list);
//           if (list[0]?.id) setSelectedAddressId(list[0].id);
//         }
//       } catch (err) {
//         if (!cancelled) setCatalogError((prev) => prev || "Unable to load your saved addresses.");
//       } finally {
//         if (!cancelled) setAddressesLoading(false);
//       }
//     };

//     const loadAreas = async () => {
//       setAreasLoading(true);
//       try {
//         const list = await getAreas();
//         if (!cancelled) setAreas(list as AreaOption[]);
//       } catch (err) {
//         if (!cancelled) setCatalogError((prev) => prev || "Unable to load delivery areas.");
//       } finally {
//         if (!cancelled) setAreasLoading(false);
//       }
//     };

//     const loadCatalog = async () => {
//       setCatalogLoading(true);
//       setCatalogError("");
//       try {
//         const catalog = await getAgentCatalog(currency);
//         if (!cancelled) {
//           setProducts(catalog.products || []);
//           setAgentProducts(catalog.agent_products || []);
//         }
//       } catch (err) {
//         if (!cancelled) setCatalogError((prev) => prev || "Unable to load the menu. Please refresh and try again.");
//       } finally {
//         if (!cancelled) setCatalogLoading(false);
//       }
//     };

//     loadAgent();
//     loadAddresses();
//     loadAreas();
//     loadCatalog();

//     return () => {
//       cancelled = true;
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // ── Derived: selected address + its area (drives delivery charge) ──────
//   const selectedAddress = useMemo(
//     () => addresses.find((a) => a.id === selectedAddressId) || null,
//     [addresses, selectedAddressId]
//   );

//   const selectedArea = useMemo(
//     () => (selectedAddress ? areas.find((a) => a.id === selectedAddress.area_id) || null : null),
//     [selectedAddress, areas]
//   );

//   useEffect(() => {
//     if (selectedArea?.currency) setCurrency(selectedArea.currency);
//   }, [selectedArea]);

//   const deliveryCharge = useMemo(() => {
//     if (deliveryMethod !== "DELIVERY") return 0;
//     return selectedArea?.delivery_charge ?? 0;
//   }, [deliveryMethod, selectedArea]);

//   // ── Categories — only from the active tab's product set, normalized ────
//   const categories = useMemo(() => {
//     const sourceList = menuTab === "MENU" ? products : agentProducts;
//     const set = new Set<string>();
//     sourceList.forEach((p) => {
//       const name = getCategoryName((p as any).category);
//       if (name) set.add(name);
//     });
//     return Array.from(set);
//   }, [products, agentProducts, menuTab]);

//   // Reset category filter whenever the tab changes, since categories differ per tab
//   useEffect(() => {
//     setCategoryFilter("ALL");
//   }, [menuTab]);

//   // Reset pagination whenever the tab, search term, or category filter
//   // changes, so a fresh filter always starts back at page 1.
//   useEffect(() => {
//     setMenuPage(1);
//     setAgentMenuPage(1);
//   }, [menuTab, searchTerm, categoryFilter]);

//   // ── Filtering (search + category) applies within the active tab only ───
//   const matchesFilters = useCallback(
//     (name: string, category: unknown) => {
//       const term = searchTerm.trim().toLowerCase();
//       const matchesSearch = !term || (name || "").toLowerCase().includes(term);
//       const categoryName = getCategoryName(category) ?? "";
//       const matchesCategory = categoryFilter === "ALL" || categoryName === categoryFilter;
//       return matchesSearch && matchesCategory;
//     },
//     [searchTerm, categoryFilter]
//   );

//   const filteredProducts = useMemo(
//     () => products.filter((p) => matchesFilters(p.name, (p as any).category)),
//     [products, matchesFilters]
//   );

//   const filteredAgentProducts = useMemo(
//     () => agentProducts.filter((p) => matchesFilters(p.name, (p as any).category)),
//     [agentProducts, matchesFilters]
//   );

//   // ── Pagination derived state — 6 per page, numbered pages ───────────────
//   const menuTotalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
//   const agentMenuTotalPages = Math.max(1, Math.ceil(filteredAgentProducts.length / PRODUCTS_PER_PAGE));

//   const visibleProducts = useMemo(
//     () =>
//       filteredProducts.slice(
//         (menuPage - 1) * PRODUCTS_PER_PAGE,
//         menuPage * PRODUCTS_PER_PAGE
//       ),
//     [filteredProducts, menuPage]
//   );

//   const visibleAgentProducts = useMemo(
//     () =>
//       filteredAgentProducts.slice(
//         (agentMenuPage - 1) * PRODUCTS_PER_PAGE,
//         agentMenuPage * PRODUCTS_PER_PAGE
//       ),
//     [filteredAgentProducts, agentMenuPage]
//   );

//   // Clamp current page if the filtered list shrinks (e.g. search narrows it)
//   useEffect(() => {
//     if (menuPage > menuTotalPages) setMenuPage(menuTotalPages);
//   }, [menuTotalPages, menuPage]);

//   useEffect(() => {
//     if (agentMenuPage > agentMenuTotalPages) setAgentMenuPage(agentMenuTotalPages);
//   }, [agentMenuTotalPages, agentMenuPage]);

//   const goToMenuPage = (page: number) => {
//     setMenuPage(Math.min(Math.max(1, page), menuTotalPages));
//   };

//   const goToAgentMenuPage = (page: number) => {
//     setAgentMenuPage(Math.min(Math.max(1, page), agentMenuTotalPages));
//   };

//   // ── Discount math (display + cart only — never touches product prices) ──
//   const getDiscountedPrice = (price: number) => {
//     const discountAmount = (price * agentDiscount) / 100;
//     return { discountAmount, finalPrice: price - discountAmount };
//   };

//   // ── Add to cart (merges into an existing row for the same product +
//   //     same variant/flavour selection) ──────────────────────────────────
//   const mergeOrAddToCart = (item: Omit<CartItem, "cartId">) => {
//     setCart((prev) => {
//       const idx = prev.findIndex(
//         (c) =>
//           c.productId === item.productId &&
//           c.productType === item.productType &&
//           (c.variantId ?? null) === (item.variantId ?? null) &&
//           (c.flavourId ?? null) === (item.flavourId ?? null)
//       );
//       if (idx >= 0) {
//         const next = [...prev];
//         next[idx] = { ...next[idx], quantity: next[idx].quantity + item.quantity };
//         return next;
//       }
//       return [...prev, { ...item, cartId: makeCartId() }];
//     });
//     setErrors((prev) => ({ ...prev, items: undefined }));
//   };

//   // ── "Add to cart" customization modal ───────────────────────────────────
//   // Opens with the variant/flavour options read straight off the product
//   // object (already embedded on both BakeryProduct and AgentProduct — no
//   // extra fetch), the same way SalesAgentCreateOrder.openDraftSelection does.
//   // const openDraftSelection = (product: BakeryProduct | AgentProduct, productType: ProductType) => {
//   //   const variantOptions = getVariantOptions(product);
//   //   const flavourOptions = getFlavourOptions(product);

//   //   setDraftSelection({
//   //     product,
//   //     productType,
//   //     variantId: variantOptions.length ? String(variantOptions[0].id) : null,
//   //     flavourId: flavourOptions.length ? String(flavourOptions[0].id) : null,
//   //     quantity: 1,
//   //   });
//   // };

//   const openDraftSelection = (product: BakeryProduct | AgentProduct, productType: ProductType) => {
//   const variantOptions = getVariantOptions(product);
//   const initialVariantId = variantOptions.length ? String(variantOptions[0].id) : null;
//   const flavourOptions = getFlavourOptions(product, initialVariantId);

//   setDraftSelection({
//     product,
//     productType,
//     variantId: initialVariantId,
//     flavourId: flavourOptions.length ? String(flavourOptions[0].id) : null,
//     quantity: 1,
//   });
// };

//   const closeDraftSelection = () => {
//     setDraftSelection(null);
//   };

//   // const selectDraftVariant = (variantId: string) => {
//   //   setDraftSelection((prev) => (prev ? { ...prev, variantId } : prev));
//   // };

//  const selectDraftVariant = (variantId: string) => {
//   setDraftSelection((prev) => {
//     if (!prev) return prev;
//     const flavourOptions = getFlavourOptions(prev.product, variantId);
//     return {
//       ...prev,
//       variantId,
//       flavourId: flavourOptions.length ? String(flavourOptions[0].id) : null,
//     };
//   });
// };
  
//   const selectDraftFlavour = (flavourId: string) => {
//     setDraftSelection((prev) => (prev ? { ...prev, flavourId } : prev));
//   };

//   const changeDraftQuantity = (delta: number) => {
//     setDraftSelection((prev) =>
//       prev ? { ...prev, quantity: Math.max(1, prev.quantity + delta) } : prev
//     );
//   };

//   const confirmAddToCart = () => {
//     if (!draftSelection) return;
//   const { product, productType, variantId, flavourId, quantity } = draftSelection;

//   const variantOptions = getVariantOptions(product);
//   const flavourOptions = getFlavourOptions(product, variantId); // ← pass variantId
//   const selectedVariant = variantOptions.find((v) => String(v.id) === variantId) || null;
//   const selectedFlavour = flavourOptions.find((f) => String(f.id) === flavourId) || null;

//     const price = (product as any).price || 0; // no price modifier — plain string variants

//     if (productType === "NORMAL") {
//       const { discountAmount, finalPrice } = getDiscountedPrice(price);
//       mergeOrAddToCart({
//         productId: product.id,
//         productType: "NORMAL",
//         name: product.name,
//         image: (product as any).image_url,
//         originalPrice: price,
//         discountPercentage: agentDiscount,
//         discountAmount,
//         finalPrice,
//         quantity,
//         currency,
//         variantId: selectedVariant?.id,
//         variantName: selectedVariant?.name,
//         flavourId: selectedFlavour?.id,
//         flavourName: selectedFlavour?.name,
//       });
//     } else {
//       mergeOrAddToCart({
//         productId: product.id,
//         productType: "AGENT",
//         name: product.name,
//         image: (product as any).image || undefined,
//         originalPrice: price,
//         discountPercentage: 0,
//         discountAmount: 0,
//         finalPrice: price,
//         quantity,
//         currency: "KWD",
//         variantId: selectedVariant?.id,
//         variantName: selectedVariant?.name,
//         flavourId: selectedFlavour?.id,
//         flavourName: selectedFlavour?.name,
//       });
//     }

//     setSuccessMessage(`${product.name} added to cart`);
//     setTimeout(() => setSuccessMessage(""), 2000);
//     closeDraftSelection();
//   };


//   /** Reads the raw `variants` array off a product, whatever shape it's in. */
// const getVariantsRaw = (product: unknown): any[] => {
//   if (!product || typeof product !== "object") return [];
//   const raw = (product as any).variants;
//   return Array.isArray(raw) ? raw : [];
// };

// /**
//  * Variant options — supports both shapes:
//  *  - objects with is_active/name/flavors (ProductDetails.tsx's Variant model)
//  *  - plain strings (AgentProduct's flat string-array model)
//  */
// const getVariantOptions = (product: unknown): ProductOption[] => {
//   const rawVariants = getVariantsRaw(product);
//   return rawVariants
//     .filter((v: any) => v == null || typeof v !== "object" || v.is_active !== false)
//     .map((v: any, idx: number) => {
//       if (v && typeof v === "object") {
//         return { id: v.id ?? idx, name: v.name ?? String(v.id ?? idx) };
//       }
//       return { id: String(v), name: String(v) };
//     });
// };

// /**
//  * Flavour options for the CURRENTLY SELECTED variant.
//  *  - If variants are nested objects that carry their own `flavors` array
//  *    (ProductDetails.tsx's Variant/Flavor model — exactly the "wedding
//  *    cake" product), flavours belong to THAT variant. Pull them from
//  *    there, filtering `is_active` the same way ProductDetails.tsx does.
//  *  - Otherwise (flat string-array variants, e.g. some AgentProduct rows),
//  *    fall back to whatever flavour list sits directly on the product.
//  */
// const getFlavourOptions = (product: unknown, variantId?: string | null): ProductOption[] => {
//   const rawVariants = getVariantsRaw(product);
//   const selectedVariant = variantId != null
//     ? rawVariants.find((v: any) => v && typeof v === "object" && String(v.id) === String(variantId))
//     : null;

//   if (selectedVariant && Array.isArray(selectedVariant.flavors)) {
//     return selectedVariant.flavors
//       .filter((f: any) => f?.is_active !== false)
//       .map((f: any, idx: number) => ({
//         id: f?.id ?? idx,
//         name: f?.name ?? String(f?.id ?? idx),
//       }));
//   }

//   return getOptionList(product, [
//     "flavor_options",
//     "flavors",
//     "flavour_options",
//     "flavours",
//   ]);
// };

//   // ── Cart row handlers ────────────────────────────────────────────────────
//   const changeCartQuantity = (cartId: string, delta: number) => {
//     setCart((prev) =>
//       prev.map((item) =>
//         item.cartId === cartId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
//       )
//     );
//   };

//   const removeCartItem = (cartId: string) => {
//     setCart((prev) => prev.filter((item) => item.cartId !== cartId));
//   };

//   // ── Totals ───────────────────────────────────────────────────────────────
//   const originalSubtotal = useMemo(
//     () => cart.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0),
//     [cart]
//   );

//   const discountTotal = useMemo(
//     () => cart.reduce((sum, item) => sum + item.discountAmount * item.quantity, 0),
//     [cart]
//   );

//   const subtotalAfterDiscount = originalSubtotal - discountTotal;

//   const grandTotal = useMemo(
//     () => Math.max(subtotalAfterDiscount + deliveryCharge, 0),
//     [subtotalAfterDiscount, deliveryCharge]
//   );

//   // ── Address CRUD ─────────────────────────────────────────────────────────
//   const openAddAddressModal = () => {
//     setEditingAddressId(null);
//     setAddressForm(EMPTY_ADDRESS_FORM);
//     setAddressFormError("");
//     setAddressModalOpen(true);
//   };

//   const openEditAddressModal = (addr: Address) => {
//     setEditingAddressId(addr.id ?? null);
//     setAddressForm({
//       area_id: addr.area_id,
//       street: addr.street || "",
//       country: addr.country || "",
//       block: addr.block || "",
//       avenue: addr.avenue || "",
//       building: addr.building || "",
//       floor: addr.floor || "",
//       apartment: addr.apartment || "",
//       delivery_notes: addr.delivery_notes || "",
//     });
//     setAddressFormError("");
//     setAddressModalOpen(true);
//   };

//   const closeAddressModal = () => {
//     setAddressModalOpen(false);
//     setEditingAddressId(null);
//     setAddressForm(EMPTY_ADDRESS_FORM);
//     setAddressFormError("");
//   };

//   const updateAddressField = (field: keyof AddressFormState, value: string) => {
//     setAddressForm((prev) => ({
//       ...prev,
//       [field]: field === "area_id" ? (value ? Number(value) : null) : value,
//     }));
//   };

//   const saveAddress = async () => {
//     if (!addressForm.area_id) {
//       setAddressFormError("Please select an area.");
//       return;
//     }
//     if (!addressForm.street.trim() || !addressForm.country.trim()) {
//       setAddressFormError("Street and country are required.");
//       return;
//     }

//     const payload: AddressInput = {
//       area_id: addressForm.area_id,
//       street: addressForm.street.trim(),
//       country: addressForm.country.trim(),
//       block: addressForm.block.trim() || undefined,
//       avenue: addressForm.avenue.trim() || undefined,
//       building: addressForm.building.trim() || undefined,
//       floor: addressForm.floor.trim() || undefined,
//       apartment: addressForm.apartment.trim() || undefined,
//       delivery_notes: addressForm.delivery_notes.trim() || undefined,
//     };

//     setAddressSaving(true);
//     setAddressFormError("");
//     try {
//       if (editingAddressId) {
//         const updated = await updateAddress(editingAddressId, payload);
//         setAddresses((prev) => prev.map((a) => (a.id === editingAddressId ? updated : a)));
//       } else {
//         const created = await createAddress(payload);
//         setAddresses((prev) => [...prev, created]);
//         setSelectedAddressId(created.id);
//       }
//       closeAddressModal();
//     } catch (err) {
//       setAddressFormError("Could not save this address. Please check the details and try again.");
//     } finally {
//       setAddressSaving(false);
//     }
//   };

//   const handleDeleteAddress = async (id: number) => {
//     if (!window.confirm("Delete this address?")) return;
//     try {
//       await deleteAddress(id);
//       setAddresses((prev) => prev.filter((a) => a.id !== id));
//       if (selectedAddressId === id) {
//         setSelectedAddressId(null);
//       }
//     } catch (err) {
//       setSubmitError("Could not delete this address. Please try again.");
//     }
//   };

//   // ── Validation ───────────────────────────────────────────────────────────
//   const validateForm = (): boolean => {
//     const next: FormErrors = {};
//     if (!deliveryMethod) {
//       next.deliveryMethod = "Choose Pickup or Delivery";
//     }

//     if (deliveryMethod === "PICKUP") {
//       if (!pickupDate) {
//         next.pickupDate = "Pickup date is required";
//       }
//       if (!pickupTimeSlot) {
//         next.pickupTimeSlot = "Pickup time is required";
//       }
//     }

//     if (deliveryMethod === "DELIVERY") {
//       if (!selectedAddressId) {
//         next.address = "Select a delivery address, or add a new one";
//       }
//       if (!deliveryDate) {
//         next.deliveryDate = "Delivery date is required";
//       }
//       if (!deliveryTimeSlot) {
//         next.deliveryTimeSlot = "Delivery time slot is required";
//       }
//     }

//     if (cart.length === 0) {
//       next.items = "Add at least one product to the cart";
//     }
//     // Payment method is intentionally not required for agent-created orders.
//     // The backend defaults to COD when payment_method is not provided.
//     setErrors(next);
//     return Object.keys(next).length === 0;
//   };

//   // ── Payload builder ──────────────────────────────────────────────────────
//   const buildPayload = (): AgentOrderPayloadExtended => {
//     const items: AgentOrderItemInput[] = cart.map((item) => ({
//       product_id: item.productId,
//       quantity: item.quantity,
//       custom_json: {
//         product_type: item.productType,
//         original_price: Number(item.originalPrice.toFixed(2)),
//         discount_percentage: Number(item.discountPercentage.toFixed(2)),
//         discount_amount: Number(item.discountAmount.toFixed(2)),
//         final_price: Number(item.finalPrice.toFixed(2)),
//         line_total: Number((item.finalPrice * item.quantity).toFixed(2)),
//         ...(item.variantId !== undefined
//           ? { variant_id: item.variantId, variant_name: item.variantName }
//           : {}),
//         ...(item.flavourId !== undefined
//           ? { flavour_id: item.flavourId, flavour_name: item.flavourName }
//           : {}),
//       },
//     }));

//     const isPickup = deliveryMethod === "PICKUP";

//     const payload: AgentOrderPayloadExtended = {
//       customer_id: agent!.id,
//       address_id: isPickup ? null : selectedAddressId ?? null,
//       items,
//       payment_method: paymentMethod || "COD",
//       currency: currency as CreateAgentOrderPayload["currency"],
//       delivery_date: !isPickup ? deliveryDate || undefined : undefined,
//       delivery_time_slot: !isPickup ? deliveryTimeSlot || undefined : undefined,
//       pickup_date: isPickup ? pickupDate || undefined : undefined,
//       pickup_time_slot: isPickup ? pickupTimeSlot || undefined : undefined,
//       order_source: "AGENT_SELF",
//       delivery_method: deliveryMethod,
//       agent_notes: notes.trim() || undefined,
//       agent_discount_percentage: Number(agentDiscount.toFixed(2)),
//       discount_total: Number(discountTotal.toFixed(2)),
//       delivery_charge: Number(deliveryCharge.toFixed(2)),
//       subtotal: Number(originalSubtotal.toFixed(2)),
//       grand_total: Number(grandTotal.toFixed(2)),
//     };

//     console.log("========================================");
//     console.log("CREATE AGENT ORDER PAYLOAD");
//     console.log("========================================");
//     console.log(JSON.stringify(payload, null, 2));

//     return payload;
//   };

//   const resetOrderState = () => {
//     setCart([]);
//     setPaymentMethod("");
//     setNotes("");
//     setDeliveryMethod("PICKUP");
//     setPickupDate("");
//     setPickupTimeSlot("");
//     setDeliveryDate("");
//     setDeliveryTimeSlot("");
//     setErrors({});
//   };

//   // ── Submit ───────────────────────────────────────────────────────────────
//   const handleCreateOrder = async () => {
//     setSuccessMessage("");
//     setSubmitError("");

//     if (!agent) {
//       setSubmitError("Your agent profile hasn't finished loading yet.");
//       return;
//     }

//     if (!validateForm()) {
//       return;
//     }

//     if (deliveryMethod === "DELIVERY" && !selectedAddressId) {
//       setSubmitError("Please select a delivery address.");
//       return;
//     }

//     if (deliveryMethod === "PICKUP" && (!pickupDate || !pickupTimeSlot)) {
//       setSubmitError("Please select pickup date and time.");
//       return;
//     }

//     if (cart.length === 0) {
//       setSubmitError("Please add at least one product.");
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       const payload = buildPayload();
//       const order = await createAgentOrder(payload);
//       console.log("ORDER CREATED:", order);
//       setSuccessMessage("Order created successfully.");
//       resetOrderState();
//     } catch (err: any) {
//       console.error("========================================");
//       console.error("ORDER CREATION FAILED");
//       console.error("========================================");
//       console.error("Status:", err?.response?.status);
//       console.error("Backend response:", err?.response?.data);

//       const message =
//         err?.response?.data?.error ||
//         err?.response?.data?.message ||
//         err?.message ||
//         "Could not create the order.";

//       setSubmitError(message);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // ── Render helpers ───────────────────────────────────────────────────────

//   // Normal-menu card: now just shows product info + an "Add" button that
//   // opens the customization modal (quantity / variant / flavour), same
//   // pattern as SalesAgentCreateOrder's renderProductCard.
//   const renderNormalProductCard = (product: BakeryProduct) => {
//     const price = product.price || 0;
//     const { finalPrice } = getDiscountedPrice(price);
//     const outOfStock = (product as any).stock !== undefined && (product as any).stock <= 0;

//     return (
//       <div className="ao-product-card" key={cartKey(product.id, "NORMAL")}>
//         {agentDiscount > 0 && <span className="ao-badge ao-badge-discount">{agentDiscount}% OFF</span>}
//         <div className="ao-product-image-wrap">
//           {(product as any).image_url ? (
//             <img src={(product as any).image_url} alt={product.name} className="ao-product-image" />
//           ) : (
//             <div className="ao-product-image-placeholder">No Image</div>
//           )}
//         </div>
//         <div className="ao-product-info">
//           <p className="ao-product-name">{product.name}</p>
//           {(product as any).description && (
//             <p className="ao-product-desc">{(product as any).description}</p>
//           )}

//           <div className="ao-price-row">
//             {agentDiscount > 0 ? (
//               <>
//                 <span className="ao-price-original">KWD {formatMoney(price)}</span>
//                 <span className="ao-price-final">KWD {formatMoney(finalPrice)}</span>
//               </>
//             ) : (
//               <span className="ao-price-final">{currency} {formatMoney(price)}</span>
//             )}
//           </div>

//           {(product as any).stock !== undefined && (
//             <span className={`ao-stock-tag ${outOfStock ? "ao-stock-out" : ""}`}>
//               Stock: {(product as any).stock ?? 0}
//             </span>
//           )}
//         </div>
//         <button
//           type="button"
//           className="ao-btn ao-btn-add"
//           disabled={outOfStock}
//           onClick={() => openDraftSelection(product, "NORMAL")}
//         >
//           {outOfStock ? "Out of Stock" : "Add"}
//         </button>
//       </div>
//     );
//   };

//   // Agent-exclusive card: same shape, opens the same modal with
//   // productType "AGENT" so pricing/discount is handled correctly.
//   const renderAgentProductCard = (product: AgentProduct) => (
//     <div className="ao-product-card" key={cartKey(product.id, "AGENT")}>
//       <span className="ao-badge ao-badge-exclusive">Agent Exclusive</span>
//       <div className="ao-product-image-wrap">
//         {product.image ? (
//           <img src={product.image} alt={product.name} className="ao-product-image" />
//         ) : (
//           <div className="ao-product-image-placeholder">No Image</div>
//         )}
//       </div>
//       <div className="ao-product-info">
//         <p className="ao-product-name">{product.name}</p>
//         {product.description && <p className="ao-product-desc">{product.description}</p>}
//         <div className="ao-price-row">
//           <span className="ao-price-final">KWD {formatMoney(product.price || 0)}</span>
//         </div>
//       </div>
//       <button
//         type="button"
//         className="ao-btn ao-btn-add"
//         onClick={() => openDraftSelection(product, "AGENT")}
//       >
//         Add
//       </button>
//     </div>
//   );

//   const renderProductSkeletons = (count: number) => (
//     <div className="ao-product-grid">
//       {Array.from({ length: count }).map((_, i) => (
//         <div className="ao-product-card ao-skeleton-card" key={i}>
//           <div className="ao-skeleton ao-skeleton-image" />
//           <div className="ao-skeleton ao-skeleton-line" />
//           <div className="ao-skeleton ao-skeleton-line ao-skeleton-line-short" />
//         </div>
//       ))}
//     </div>
//   );

//   // Numbered pagination controls — Prev / page numbers / Next, same pattern
//   // as SalesAgentCreateOrder's product grid pagination.
//   const renderPagination = (
//     currentPage: number,
//     totalPages: number,
//     onGoToPage: (page: number) => void
//   ) => (
//     <div className="ao-pagination">
//       <button
//         type="button"
//         className="ao-pagination-btn"
//         onClick={() => onGoToPage(currentPage - 1)}
//         disabled={currentPage === 1}
//       >
//         ‹ Prev
//       </button>

//       <div className="ao-pagination-pages">
//         {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//           <button
//             type="button"
//             key={page}
//             className={`ao-pagination-page ${page === currentPage ? "active" : ""}`}
//             onClick={() => onGoToPage(page)}
//           >
//             {page}
//           </button>
//         ))}
//       </div>

//       <button
//         type="button"
//         className="ao-pagination-btn"
//         onClick={() => onGoToPage(currentPage + 1)}
//         disabled={currentPage === totalPages}
//       >
//         Next ›
//       </button>
//     </div>
//   );

//   // =============================================================================
//   // ─── JSX ─────────────────────────────────────────────────────────────────────
//   // =============================================================================

//   return (
//     <div className="ao-page">
//       {/* ── Header ─────────────────────────────────────────────────────── */}
//       <header className="ao-header">
//         <p className="ao-eyebrow">Agent Self-Order</p>
//         <h1 className="ao-title">Place Your Order</h1>
//       </header>

//       {successMessage && <div className="ao-toast ao-toast-success">{successMessage}</div>}
//       {(submitError || catalogError) && (
//         <div className="ao-toast ao-toast-error">{submitError || catalogError}</div>
//       )}

//       <div className="ao-layout">
//         {/* ── Main column ────────────────────────────────────────────── */}
//         <div className="ao-main-column">
//           {/* Card — Agent Info (read-only, auto-filled) */}
//           <section className="ao-card">
//             <h2 className="ao-card-title">Your Details</h2>
//             {agentLoading ? (
//               <p className="ao-muted">Loading your profile…</p>
//             ) : agent ? (
//               <div className="ao-agent-info">
//                 <div className="ao-agent-avatar">{(agent.first_name || "A").charAt(0)}</div>
//                 <div className="ao-agent-meta">
//                   <p className="ao-agent-name">{agent.first_name} {agent.last_name}</p>
//                   <p className="ao-agent-sub">{agent.email} · {agent.phone_no}</p>
//                   <p className="ao-agent-sub">Agent ID: {agent.id}</p>
//                 </div>
//                 {agentDiscount > 0 && (
//                   <span className="ao-badge ao-badge-discount ao-agent-discount-badge">
//                     {agentDiscount}% agent discount
//                   </span>
//                 )}
//               </div>
//             ) : (
//               <p className="ao-muted">We couldn't load your profile.</p>
//             )}
//           </section>

//           {/* Card — Delivery Method */}
//           <section className="ao-card">
//             <h2 className="ao-card-title">Delivery Method</h2>
//             {errors.deliveryMethod && <span className="ao-error-text">{errors.deliveryMethod}</span>}

//             <div className="ao-delivery-cards">
//               <button
//                 type="button"
//                 className={`ao-delivery-card ${deliveryMethod === "PICKUP" ? "ao-delivery-card-active" : ""}`}
//                 onClick={() => setDeliveryMethod("PICKUP")}
//               >
//                 <span className="ao-delivery-icon">🏬</span>
//                 <span className="ao-delivery-label">Pickup</span>
//                 <span className="ao-delivery-sub">No delivery charge</span>
//               </button>
//               <button
//                 type="button"
//                 className={`ao-delivery-card ${deliveryMethod === "DELIVERY" ? "ao-delivery-card-active" : ""}`}
//                 onClick={() => setDeliveryMethod("DELIVERY")}
//               >
//                 <span className="ao-delivery-icon">🚚</span>
//                 <span className="ao-delivery-label">Delivery</span>
//                 <span className="ao-delivery-sub">Charge based on your area</span>
//               </button>
//             </div>

//             {deliveryMethod === "PICKUP" && (
//               <div className="ao-address-section">
//                 <div className="ao-field-grid ao-delivery-time-grid">
//                   <div className="ao-field">
//                     <label>Pickup Date *</label>
//                     <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
//                     {errors.pickupDate && <span className="ao-error-text">{errors.pickupDate}</span>}
//                   </div>
//                   <div className="ao-field">
//                     <label>Pickup Time *</label>
//                     <select value={pickupTimeSlot} onChange={(e) => setPickupTimeSlot(e.target.value)}>
//                       <option value="">Select a pickup time</option>
//                       {TIME_SLOTS.map((slot) => (
//                         <option key={slot} value={slot}>{slot}</option>
//                       ))}
//                     </select>
//                     {errors.pickupTimeSlot && <span className="ao-error-text">{errors.pickupTimeSlot}</span>}
//                   </div>
//                 </div>
//               </div>
//             )}

//             {deliveryMethod === "DELIVERY" && (
//               <div className="ao-address-section">
//                 {errors.address && <span className="ao-error-text">{errors.address}</span>}

//                 {addressesLoading ? (
//                   <p className="ao-muted">Loading your addresses…</p>
//                 ) : addresses.length === 0 ? (
//                   <p className="ao-muted">You don't have any saved addresses yet.</p>
//                 ) : (
//                   <div className="ao-address-list">
//                     {addresses.map((addr) => {
//                       const area = addr.area || areas.find((a) => a.id === addr.area_id);
//                       const lineParts = [
//                         addr.block,
//                         addr.avenue,
//                         addr.street,
//                         addr.building ? `Building ${addr.building}` : null,
//                         addr.floor ? `Floor ${addr.floor}` : null,
//                         addr.apartment ? `Apt ${addr.apartment}` : null,
//                       ].filter(Boolean);
//                       return (
//                         <div
//                           key={addr.id}
//                           className={`ao-address-card ${selectedAddressId === addr.id ? "ao-address-card-active" : ""}`}
//                           onClick={() => setSelectedAddressId(addr.id as number)}
//                         >
//                           <div className="ao-address-card-main">
//                             <p className="ao-address-line">{lineParts.join(", ")}</p>
//                             <p className="ao-address-sub">
//                               {area?.name || "Unknown area"} · {addr.country}
//                               {addr.delivery_notes ? ` · ${addr.delivery_notes}` : ""}
//                             </p>
//                           </div>
//                           <div className="ao-address-card-actions" onClick={(e) => e.stopPropagation()}>
//                             <button type="button" className="ao-icon-btn" onClick={() => openEditAddressModal(addr)} aria-label="Edit address">✎</button>
//                             <button type="button" className="ao-icon-btn ao-icon-btn-danger" onClick={() => handleDeleteAddress(addr.id as number)} aria-label="Delete address">✕</button>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 )}

//                 <button type="button" className="ao-btn ao-btn-secondary ao-add-address-btn" onClick={openAddAddressModal}>
//                   + Add New Address
//                 </button>

//                 <div className="ao-field-grid ao-delivery-time-grid">
//                   <div className="ao-field">
//                     <label>Delivery Date *</label>
//                     <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
//                     {errors.deliveryDate && <span className="ao-error-text">{errors.deliveryDate}</span>}
//                   </div>
//                   <div className="ao-field">
//                     <label>Delivery Time Slot *</label>
//                     <select value={deliveryTimeSlot} onChange={(e) => setDeliveryTimeSlot(e.target.value)}>
//                       <option value="">Select a time slot</option>
//                       {TIME_SLOTS.map((slot) => (
//                         <option key={slot} value={slot}>{slot}</option>
//                       ))}
//                     </select>
//                     {errors.deliveryTimeSlot && <span className="ao-error-text">{errors.deliveryTimeSlot}</span>}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </section>

//           {/* Card — Menu / Agent Menu */}
//           <section className="ao-card">
//             <h2 className="ao-card-title">
//               {menuTab === "MENU" ? "Menu" : "Agent Menu (Exclusive)"}
//             </h2>
//             {errors.items && <span className="ao-error-text">{errors.items}</span>}

//             {/* Tab switcher */}
//             <div className="ao-menu-tabs">
//               <button
//                 type="button"
//                 className={`ao-menu-tab ${menuTab === "MENU" ? "ao-menu-tab-active" : ""}`}
//                 onClick={() => setMenuTab("MENU")}
//               >
//                 <span className="ao-menu-tab-icon">📋</span>
//                 <span>Menu</span>
//               </button>
//               <button
//                 type="button"
//                 className={`ao-menu-tab ${menuTab === "AGENT_MENU" ? "ao-menu-tab-active" : ""}`}
//                 onClick={() => setMenuTab("AGENT_MENU")}
//               >
//                 <span className="ao-menu-tab-icon">⭐</span>
//                 <span>Agent Menu (Exclusive)</span>
//               </button>
//             </div>

//             <input
//               type="text"
//               className="ao-search-bar"
//               placeholder={
//                 menuTab === "MENU"
//                   ? "Search the menu…"
//                   : "Search your exclusive products…"
//               }
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />

//             {categories.length > 0 && (
//               <div className="ao-category-chips">
//                 <button
//                   type="button"
//                   className={`ao-chip ${categoryFilter === "ALL" ? "ao-chip-active" : ""}`}
//                   onClick={() => setCategoryFilter("ALL")}
//                 >
//                   All
//                 </button>
//                 {categories.map((c) => (
//                   <button
//                     key={c}
//                     type="button"
//                     className={`ao-chip ${categoryFilter === c ? "ao-chip-active" : ""}`}
//                     onClick={() => setCategoryFilter(c)}
//                   >
//                     {c}
//                   </button>
//                 ))}
//               </div>
//             )}

//             {menuTab === "MENU" ? (
//               <>
//                 <h3 className="ao-subsection-title">
//                   Our Menu {agentDiscount > 0 ? `(${agentDiscount}% off for you)` : ""}
//                 </h3>
//                 {catalogLoading ? (
//                   renderProductSkeletons(6)
//                 ) : filteredProducts.length === 0 ? (
//                   <p className="ao-muted">No products match your search.</p>
//                 ) : (
//                   <>
//                     <div className="ao-product-grid">{visibleProducts.map(renderNormalProductCard)}</div>
//                     {filteredProducts.length > PRODUCTS_PER_PAGE &&
//                       renderPagination(menuPage, menuTotalPages, goToMenuPage)}
//                   </>
//                 )}
//               </>
//             ) : (
//               <>
//                 <h3 className="ao-subsection-title">Your Exclusive Products</h3>
//                 {catalogLoading ? (
//                   renderProductSkeletons(6)
//                 ) : filteredAgentProducts.length === 0 ? (
//                   <p className="ao-muted">No exclusive products assigned to you yet.</p>
//                 ) : (
//                   <>
//                     <div className="ao-product-grid">{visibleAgentProducts.map(renderAgentProductCard)}</div>
//                     {filteredAgentProducts.length > PRODUCTS_PER_PAGE &&
//                       renderPagination(agentMenuPage, agentMenuTotalPages, goToAgentMenuPage)}
//                   </>
//                 )}
//               </>
//             )}
//           </section>

//           {/* Card — Cart */}
//           <section className="ao-card">
//             <h2 className="ao-card-title">Cart</h2>
//             {cart.length === 0 ? (
//               <div className="ao-empty-cart">
//                 <div className="ao-empty-cart-icon">🛒</div>
//                 <p className="ao-muted">Your cart is empty. Add something delicious above.</p>
//               </div>
//             ) : (
//               <div className="ao-cart-table-wrap">
//                 <table className="ao-cart-table">
//                   <thead>
//                     <tr>
//                       <th>Product</th>
//                       <th>Qty</th>
//                       <th>Original</th>
//                       <th>Discount</th>
//                       <th>Final</th>
//                       <th>Subtotal</th>
//                       <th></th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {cart.map((item) => (
//                       <tr key={item.cartId}>
//                         <td>
//                           <div className="ao-cart-product-name">{item.name}</div>
//                           <span className={`ao-tag ${item.productType === "AGENT" ? "ao-tag-agent" : "ao-tag-normal"}`}>
//                             {item.productType === "AGENT" ? "Agent Exclusive" : "Normal"}
//                           </span>
//                           {(item.variantName || item.flavourName) && (
//                             <div className="ao-cart-item-options">
//                               {item.variantName && (
//                                 <span className="ao-tag ao-tag-option">Variant: {item.variantName}</span>
//                               )}
//                               {item.flavourName && (
//                                 <span className="ao-tag ao-tag-option">Flavour: {item.flavourName}</span>
//                               )}
//                             </div>
//                           )}
//                         </td>
//                         <td>
//                           <div className="ao-qty-control">
//                             <button type="button" className="ao-qty-btn" onClick={() => changeCartQuantity(item.cartId, -1)}>−</button>
//                             <span className="ao-qty-value">{item.quantity}</span>
//                             <button type="button" className="ao-qty-btn" onClick={() => changeCartQuantity(item.cartId, 1)}>+</button>
//                           </div>
//                         </td>
//                         <td>{currency} {formatMoney(item.originalPrice)}</td>
//                         <td>{item.discountPercentage > 0 ? `${item.discountPercentage}% (-${currency} ${formatMoney(item.discountAmount)})` : "—"}</td>
//                         <td>{currency} {formatMoney(item.finalPrice)}</td>
//                         <td>{currency} {formatMoney(item.finalPrice * item.quantity)}</td>
//                         <td>
//                           <button type="button" className="ao-btn-remove" onClick={() => removeCartItem(item.cartId)} aria-label="Remove item">✕</button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </section>

//           {/* Card — Notes */}
//           <section className="ao-card">
//             <h2 className="ao-card-title">Notes</h2>
//             <div className="ao-field">
//               <label>Notes for this order</label>
//               <textarea
//                 rows={3}
//                 value={notes}
//                 onChange={(e) => setNotes(e.target.value)}
//                 placeholder="Anything the kitchen or delivery team should know…"
//               />
//             </div>
//           </section>
//         </div>

//         {/* ── Sticky sidebar ─────────────────────────────────────────── */}
//         <aside className="ao-sidebar">
//           <section className="ao-card ao-summary-card">
//             <h2 className="ao-card-title">Order Summary</h2>

//             <div className="ao-summary-row">
//               <span>Subtotal</span>
//               <span>{currency} {formatMoney(originalSubtotal)}</span>
//             </div>
//             <div className="ao-summary-row ao-summary-discount">
//               <span>Agent Discount Total</span>
//               <span>-{currency} {formatMoney(discountTotal)}</span>
//             </div>
//             <div className="ao-summary-row">
//               <span>Delivery Charge</span>
//               <span>{currency} {formatMoney(deliveryCharge)}</span>
//             </div>
//             <div className="ao-summary-row ao-summary-grand-total">
//               <span>Grand Total</span>
//               <span>{currency} {formatMoney(grandTotal)}</span>
//             </div>

//           </section>

//           <div className="ao-action-buttons">
//             <button
//               type="button"
//               className="ao-btn ao-btn-primary ao-btn-full"
//               onClick={handleCreateOrder}
//               disabled={isSubmitting || agentLoading}
//             >
//               {isSubmitting ? "Creating…" : "Create Order"}
//             </button>
//           </div>
//         </aside>
//       </div>

//       {/* ── Address add/edit modal ───────────────────────────────────── */}
//       {addressModalOpen && (
//         <div className="ao-modal-overlay" onClick={closeAddressModal}>
//           <div className="ao-modal" onClick={(e) => e.stopPropagation()}>
//             <h3 className="ao-modal-title">{editingAddressId ? "Edit Address" : "Add New Address"}</h3>

//             {addressFormError && <span className="ao-error-text">{addressFormError}</span>}

//             <div className="ao-field-grid">
//               <div className="ao-field ao-field-full">
//                 <label>Area *</label>
//                 <select
//                   value={addressForm.area_id ?? ""}
//                   onChange={(e) => updateAddressField("area_id", e.target.value)}
//                   disabled={areasLoading}
//                 >
//                   <option value="">{areasLoading ? "Loading areas…" : "Select an area"}</option>
//                   {areas.map((a) => (
//                     <option key={a.id} value={a.id}>{a.name}</option>
//                   ))}
//                 </select>
//               </div>
//               <div className="ao-field">
//                 <label>Street *</label>
//                 <input type="text" value={addressForm.street} onChange={(e) => updateAddressField("street", e.target.value)} />
//               </div>
//               <div className="ao-field">
//                 <label>Country *</label>
//                 <input type="text" value={addressForm.country} onChange={(e) => updateAddressField("country", e.target.value)} />
//               </div>
//               <div className="ao-field">
//                 <label>Block</label>
//                 <input type="text" value={addressForm.block} onChange={(e) => updateAddressField("block", e.target.value)} />
//               </div>
//               <div className="ao-field">
//                 <label>Avenue</label>
//                 <input type="text" value={addressForm.avenue} onChange={(e) => updateAddressField("avenue", e.target.value)} />
//               </div>
//               <div className="ao-field">
//                 <label>Building</label>
//                 <input type="text" value={addressForm.building} onChange={(e) => updateAddressField("building", e.target.value)} />
//               </div>
//               <div className="ao-field">
//                 <label>Floor</label>
//                 <input type="text" value={addressForm.floor} onChange={(e) => updateAddressField("floor", e.target.value)} />
//               </div>
//               <div className="ao-field">
//                 <label>Apartment</label>
//                 <input type="text" value={addressForm.apartment} onChange={(e) => updateAddressField("apartment", e.target.value)} />
//               </div>
//               <div className="ao-field ao-field-full">
//                 <label>Delivery Notes</label>
//                 <textarea rows={2} value={addressForm.delivery_notes} onChange={(e) => updateAddressField("delivery_notes", e.target.value)} />
//               </div>
//             </div>

//             <div className="ao-modal-actions">
//               <button type="button" className="ao-btn ao-btn-ghost" onClick={closeAddressModal}>Cancel</button>
//               <button type="button" className="ao-btn ao-btn-primary" onClick={saveAddress} disabled={addressSaving}>
//                 {addressSaving ? "Saving…" : editingAddressId ? "Save Changes" : "Add Address"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── Add-to-cart customization modal — quantity / variant / flavour,
//            same flow as SalesAgentCreateOrder ───────────────────────────── */}
//       {draftSelection && (() => {
//          const variantOptions = getVariantOptions(draftSelection.product);
//   const flavourOptions = getFlavourOptions(draftSelection.product, draftSelection.variantId); // ← pass variantId
//   const price = (draftSelection.product as any).price || 0;
//   // ...rest unchanged
//         const unitPrice =
//           draftSelection.productType === "NORMAL"
//             ? getDiscountedPrice(price).finalPrice
//             : price;
//         const linePrice = unitPrice * draftSelection.quantity;
//         const lineCurrency = draftSelection.productType === "NORMAL" ? currency : "KWD";

//         return (
//           <div className="ao-modal-overlay" onClick={closeDraftSelection}>
//             <div className="ao-modal" onClick={(e) => e.stopPropagation()}>
//               <h3 className="ao-modal-title">{draftSelection.product.name}</h3>

//               {draftSelection.productType === "AGENT" && (
//                 <span className="ao-badge ao-badge-exclusive" style={{ marginBottom: 10, display: "inline-block" }}>
//                   Agent Exclusive
//                 </span>
//               )}
//               {draftSelection.productType === "NORMAL" && agentDiscount > 0 && (
//                 <span className="ao-badge ao-badge-discount" style={{ marginBottom: 10, display: "inline-block" }}>
//                   {agentDiscount}% OFF
//                 </span>
//               )}

//               {/* Variant selection */}
//               {variantOptions.length > 0 ? (
//                 <div className="ao-field">
//                   <label>Variant</label>
//                   <div className="ao-option-pills">
//                     {variantOptions.map((v) => (
//                       <button
//                         type="button"
//                         key={v.id}
//                         className={`ao-option-pill ${String(draftSelection.variantId) === String(v.id) ? "selected" : ""}`}
//                         onClick={() => selectDraftVariant(String(v.id))}
//                       >
//                         {v.name}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               ) : (
//                 <p className="ao-hint">This product has no variants.</p>
//               )}

//               {/* Flavour selection */}
//               {flavourOptions.length > 0 && (
//                 <div className="ao-field">
//                   <label>Flavour</label>
//                   <div className="ao-option-pills">
//                     {flavourOptions.map((f) => (
//                       <button
//                         type="button"
//                         key={f.id}
//                         className={`ao-option-pill ${String(draftSelection.flavourId) === String(f.id) ? "selected" : ""}`}
//                         onClick={() => selectDraftFlavour(String(f.id))}
//                       >
//                         {f.name}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               <div className="ao-field">
//                 <label>Quantity</label>
//                 <div className="ao-qty-control">
//                   <button type="button" className="ao-qty-btn" onClick={() => changeDraftQuantity(-1)}>
//                     −
//                   </button>
//                   <span className="ao-qty-value">{draftSelection.quantity}</span>
//                   <button type="button" className="ao-qty-btn" onClick={() => changeDraftQuantity(1)}>
//                     +
//                   </button>
//                 </div>
//               </div>

//               {/* Live line-price preview based on the current selection */}
//               <div className="ao-modal-price-preview">
//                 <span>Price</span>
//                 <span>
//                   {lineCurrency} {formatMoney(linePrice)}
//                 </span>
//               </div>

//               <div className="ao-modal-actions">
//                 <button type="button" className="ao-btn ao-btn-ghost" onClick={closeDraftSelection}>
//                   Cancel
//                 </button>
//                 <button type="button" className="ao-btn ao-btn-primary" onClick={confirmAddToCart}>
//                   Add to Cart
//                 </button>
//               </div>
//             </div>
//           </div>
//         );
//       })()}
//     </div>
//   );
// };

// export default AgentOrder;


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
  /** Base catalog price, BEFORE any variant/flavour add-on. */
  basePrice: number;
  /** Sum of the selected variant's + flavour's price_modifier. */
  optionsAddOn: number;
  /** basePrice + optionsAddOn — the price a unit costs before agent discount. */
  originalPrice: number;
  discountPercentage: number; // 0 for AGENT products
  discountAmount: number; // per unit
  finalPrice: number; // per unit, after discount
  quantity: number;
  currency: string;
  // Variant / flavour selections — present for any product (normal or
  // agent-exclusive) that exposes variants/flavours.
  variantId?: string | number;
  variantName?: string;
  variantPriceModifier?: number;
  flavourId?: string | number;
  flavourName?: string;
  flavourPriceModifier?: number;
}

type DeliveryMethod = "PICKUP" | "DELIVERY";

type PaymentMethodOption = "COD" | "CARD" | "KNET" | "UPI" | "LINK";

type MenuTab = "MENU" | "AGENT_MENU";

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
 * Variant / flavour option, normalized from whatever shape the backend sends.
 *
 * AgentProduct.variants / .flavours now come back as:
 *     [{ name: "1kg", price_modifier: 0 }, { name: "2kg", price_modifier: 3.5 }]
 * (see agent_routes.py's _normalize_options). Regular Product variants (the
 * nested Variant -> Flavor model from ProductDetails.tsx) may or may not
 * carry a price_modifier / price_delta field — if they do, it's honored the
 * same way; if not, it defaults to 0 and behaves exactly as before.
 */
interface ProductOption {
  id: string | number;
  name: string;
  /** Amount added to the unit price when this option is selected. */
  price_modifier: number;
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

/** Draft selection used by the "Add to cart" customization modal — mirrors
 *  SalesAgentCreateOrder's DraftSelection, extended with productType since
 *  AgentOrder has two distinct catalogs (NORMAL vs AGENT-exclusive). */
interface DraftSelection {
  product: BakeryProduct | AgentProduct;
  productType: ProductType;
  variantId: string | null;
  flavourId: string | null;
  quantity: number;
}

const TIME_SLOTS = [
  "9:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 1:00 PM",
  "1:00 PM - 2:00 PM",
  "2:00 PM - 3:00 PM",
  "3:00 PM - 4:00 PM",
  "4:00 PM - 5:00 PM",
  "5:00 PM - 6:00 PM",
  "6:00 PM - 7:00 PM",
  "7:00 PM - 8:00 PM",
  "8:00 PM - 9:00 PM",
  "9:00 PM - 10:00 PM",
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

// Products page size for the POS-style grid, mirrors SalesAgentCreateOrder's
// PRODUCTS_PER_PAGE — 6 products per page, with numbered pagination instead
// of "Show More".
const PRODUCTS_PER_PAGE = 6;

// =============================================================================
// ─── HELPERS ─────────────────────────────────────────────────────────────────
// =============================================================================

const makeCartId = (): string =>
  `cart_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const formatMoney = (value: number): string => (value || 0).toFixed(2);

/** Formats a price modifier as a signed amount, e.g. "+2.50" / "-1.00" / "+0.00". */
const formatModifier = (value: number): string => {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "+";
  return `${sign}${formatMoney(Math.abs(value))}`;
};

const cartKey = (productId: number, type: ProductType) => `${type}-${productId}`;

/**
 * category can come back from the API as a plain string OR as an object
 * (e.g. { id, name }). Rendering an object directly via String(obj) produces
 * "[object Object]" — this normalizes it to a display-safe string, or null
 * when there's nothing usable.
 */
const getCategoryName = (category: unknown): string | null => {
  if (category === null || category === undefined) return null;
  if (typeof category === "string") return category.trim() || null;
  if (typeof category === "number") return String(category);
  if (typeof category === "object") {
    const c = category as any;
    return c.name ?? c.title ?? c.label ?? null;
  }
  return null;
};

/** Reads a numeric price_modifier off an option object, tolerating a couple
 *  of alternate field names and defaulting to 0 when absent/invalid. */
const readPriceModifier = (entry: any): number => {
  const raw =
    entry?.price_modifier ??
    entry?.priceModifier ??
    entry?.price_delta ??
    entry?.extra_price ??
    0;
  const num = typeof raw === "string" ? parseFloat(raw) : Number(raw);
  return Number.isFinite(num) ? num : 0;
};

/**
 * Generic reader for a flat array of variant/flavour options under any of
 * `keys`. Accepts:
 *  - plain strings/numbers: "1kg"                              -> { price_modifier: 0 }
 *  - objects:               { name, price_modifier }           -> as-is
 * and normalizes into { id, name, price_modifier } triples.
 */
const getOptionList = (product: unknown, keys: string[]): ProductOption[] => {
  if (!product || typeof product !== "object") return [];
  const p = product as any;
  for (const key of keys) {
    const raw = p[key];
    if (Array.isArray(raw) && raw.length > 0) {
      return raw
        .map((entry: any, idx: number) => {
          if (entry === null || entry === undefined) return null;
          if (typeof entry === "string" || typeof entry === "number") {
            return { id: String(entry), name: String(entry), price_modifier: 0 };
          }
          if (typeof entry === "object") {
            const id = entry.id ?? entry.value ?? entry.code ?? idx;
            const name = entry.name ?? entry.label ?? entry.title ?? String(id);
            return { id, name, price_modifier: readPriceModifier(entry) };
          }
          return null;
        })
        .filter(Boolean) as ProductOption[];
    }
  }
  return [];
};

/** Reads the raw `variants` array off a product, whatever shape it's in. */
const getVariantsRaw = (product: unknown): any[] => {
  if (!product || typeof product !== "object") return [];
  const raw = (product as any).variants;
  return Array.isArray(raw) ? raw : [];
};

/**
 * Variant options — supports both shapes:
 *  - nested objects with is_active/name/flavors (ProductDetails.tsx's
 *    Variant model, used by regular bakery Products)
 *  - flat { name, price_modifier } objects, or plain strings
 *    (AgentProduct's variants/flavours model, see agent_routes.py)
 * price_modifier is preserved either way; it's simply 0 if the source
 * object never had one.
 */
const getVariantOptions = (product: unknown): ProductOption[] => {
  const rawVariants = getVariantsRaw(product);
  if (rawVariants.length === 0) return [];

  return rawVariants
    .filter((v: any) => v == null || typeof v !== "object" || v.is_active !== false)
    .map((v: any, idx: number) => {
      if (v && typeof v === "object") {
        const id = v.id ?? idx;
        const name = v.name ?? String(id);
        return { id, name, price_modifier: readPriceModifier(v) };
      }
      return { id: String(v), name: String(v), price_modifier: 0 };
    });
};

/**
 * Flavour options for the CURRENTLY SELECTED variant.
 *  - If variants are nested objects that carry their own `flavors` array
 *    (ProductDetails.tsx's Variant/Flavor model), flavours belong to THAT
 *    variant. Pull them from there, filtering `is_active` the same way
 *    ProductDetails.tsx does, and preserve each flavour's own price_modifier
 *    if it has one.
 *  - Otherwise (flat option arrays, e.g. AgentProduct rows), fall back to
 *    whatever flavour list sits directly on the product.
 */
const getFlavourOptions = (product: unknown, variantId?: string | null): ProductOption[] => {
  const rawVariants = getVariantsRaw(product);
  const selectedVariant =
    variantId != null
      ? rawVariants.find((v: any) => v && typeof v === "object" && String(v.id) === String(variantId))
      : null;

  if (selectedVariant && Array.isArray(selectedVariant.flavors)) {
    return selectedVariant.flavors
      .filter((f: any) => f?.is_active !== false)
      .map((f: any, idx: number) => ({
        id: f?.id ?? idx,
        name: f?.name ?? String(f?.id ?? idx),
        price_modifier: readPriceModifier(f),
      }));
  }

  return getOptionList(product, [
    "flavor_options",
    "flavors",
    "flavour_options",
    "flavours",
  ]);
};

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

  // ── Menu / Agent Menu tab switcher ───────────────────────────────────────
  const [menuTab, setMenuTab] = useState<MenuTab>("MENU");

  // ── Pagination — numbered pages, 6 products per page, one page-counter
  //     per grid (Menu vs Agent Menu), same pattern as SalesAgentCreateOrder ──
  const [menuPage, setMenuPage] = useState<number>(1);
  const [agentMenuPage, setAgentMenuPage] = useState<number>(1);

  // ── Cart ─────────────────────────────────────────────────────────────────
  const [cart, setCart] = useState<CartItem[]>([]);

  // ── "Add to cart" customization modal — asks quantity / variant / flavour
  //     before the item is added, same flow as SalesAgentCreateOrder ───────
  const [draftSelection, setDraftSelection] = useState<DraftSelection | null>(null);

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

  // ── Categories — only from the active tab's product set, normalized ────
  const categories = useMemo(() => {
    const sourceList = menuTab === "MENU" ? products : agentProducts;
    const set = new Set<string>();
    sourceList.forEach((p) => {
      const name = getCategoryName((p as any).category);
      if (name) set.add(name);
    });
    return Array.from(set);
  }, [products, agentProducts, menuTab]);

  // Reset category filter whenever the tab changes, since categories differ per tab
  useEffect(() => {
    setCategoryFilter("ALL");
  }, [menuTab]);

  // Reset pagination whenever the tab, search term, or category filter
  // changes, so a fresh filter always starts back at page 1.
  useEffect(() => {
    setMenuPage(1);
    setAgentMenuPage(1);
  }, [menuTab, searchTerm, categoryFilter]);

  // ── Filtering (search + category) applies within the active tab only ───
  const matchesFilters = useCallback(
    (name: string, category: unknown) => {
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch = !term || (name || "").toLowerCase().includes(term);
      const categoryName = getCategoryName(category) ?? "";
      const matchesCategory = categoryFilter === "ALL" || categoryName === categoryFilter;
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

  // ── Pagination derived state — 6 per page, numbered pages ───────────────
  const menuTotalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const agentMenuTotalPages = Math.max(1, Math.ceil(filteredAgentProducts.length / PRODUCTS_PER_PAGE));

  const visibleProducts = useMemo(
    () =>
      filteredProducts.slice(
        (menuPage - 1) * PRODUCTS_PER_PAGE,
        menuPage * PRODUCTS_PER_PAGE
      ),
    [filteredProducts, menuPage]
  );

  const visibleAgentProducts = useMemo(
    () =>
      filteredAgentProducts.slice(
        (agentMenuPage - 1) * PRODUCTS_PER_PAGE,
        agentMenuPage * PRODUCTS_PER_PAGE
      ),
    [filteredAgentProducts, agentMenuPage]
  );

  // Clamp current page if the filtered list shrinks (e.g. search narrows it)
  useEffect(() => {
    if (menuPage > menuTotalPages) setMenuPage(menuTotalPages);
  }, [menuTotalPages, menuPage]);

  useEffect(() => {
    if (agentMenuPage > agentMenuTotalPages) setAgentMenuPage(agentMenuTotalPages);
  }, [agentMenuTotalPages, agentMenuPage]);

  const goToMenuPage = (page: number) => {
    setMenuPage(Math.min(Math.max(1, page), menuTotalPages));
  };

  const goToAgentMenuPage = (page: number) => {
    setAgentMenuPage(Math.min(Math.max(1, page), agentMenuTotalPages));
  };

  // ── Discount math (display + cart only — never touches product prices) ──
  const getDiscountedPrice = (price: number) => {
    const discountAmount = (price * agentDiscount) / 100;
    return { discountAmount, finalPrice: price - discountAmount };
  };

  // ── Add to cart (merges into an existing row for the same product +
  //     same variant/flavour selection) ──────────────────────────────────
  const mergeOrAddToCart = (item: Omit<CartItem, "cartId">) => {
    setCart((prev) => {
      const idx = prev.findIndex(
        (c) =>
          c.productId === item.productId &&
          c.productType === item.productType &&
          (c.variantId ?? null) === (item.variantId ?? null) &&
          (c.flavourId ?? null) === (item.flavourId ?? null)
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

  // ── "Add to cart" customization modal ───────────────────────────────────
  // Opens with the variant/flavour options read straight off the product
  // object (already embedded on both BakeryProduct and AgentProduct — no
  // extra fetch), the same way SalesAgentCreateOrder.openDraftSelection does.
  const openDraftSelection = (product: BakeryProduct | AgentProduct, productType: ProductType) => {
    const variantOptions = getVariantOptions(product);
    const initialVariantId = variantOptions.length ? String(variantOptions[0].id) : null;
    const flavourOptions = getFlavourOptions(product, initialVariantId);

    setDraftSelection({
      product,
      productType,
      variantId: initialVariantId,
      flavourId: flavourOptions.length ? String(flavourOptions[0].id) : null,
      quantity: 1,
    });
  };

  const closeDraftSelection = () => {
    setDraftSelection(null);
  };

  const selectDraftVariant = (variantId: string) => {
    setDraftSelection((prev) => {
      if (!prev) return prev;
      // Changing the variant can change which flavours are available
      // (nested Variant -> Flavor model), so re-derive flavour options and
      // reset the flavour selection to the first one for the new variant.
      const flavourOptions = getFlavourOptions(prev.product, variantId);
      return {
        ...prev,
        variantId,
        flavourId: flavourOptions.length ? String(flavourOptions[0].id) : null,
      };
    });
  };

  const selectDraftFlavour = (flavourId: string) => {
    setDraftSelection((prev) => (prev ? { ...prev, flavourId } : prev));
  };

  const changeDraftQuantity = (delta: number) => {
    setDraftSelection((prev) =>
      prev ? { ...prev, quantity: Math.max(1, prev.quantity + delta) } : prev
    );
  };

  const confirmAddToCart = () => {
    if (!draftSelection) return;
    const { product, productType, variantId, flavourId, quantity } = draftSelection;

    const variantOptions = getVariantOptions(product);
    const flavourOptions = getFlavourOptions(product, variantId);
    const selectedVariant = variantOptions.find((v) => String(v.id) === variantId) || null;
    const selectedFlavour = flavourOptions.find((f) => String(f.id) === flavourId) || null;

    const basePrice = (product as any).price || 0;
    // ── This is the actual "add to price" behaviour: whichever variant and
    // flavour are selected, their price_modifier gets added on top of the
    // base price. e.g. base 6 + variant "Mango" (+2) = 8.
    const variantModifier = selectedVariant?.price_modifier ?? 0;
    const flavourModifier = selectedFlavour?.price_modifier ?? 0;
    const optionsAddOn = variantModifier + flavourModifier;
    const adjustedPrice = Math.max(basePrice + optionsAddOn, 0);

    if (productType === "NORMAL") {
      const { discountAmount, finalPrice } = getDiscountedPrice(adjustedPrice);
      mergeOrAddToCart({
        productId: product.id,
        productType: "NORMAL",
        name: product.name,
        image: (product as any).image_url,
        basePrice,
        optionsAddOn,
        originalPrice: adjustedPrice,
        discountPercentage: agentDiscount,
        discountAmount,
        finalPrice,
        quantity,
        currency,
        variantId: selectedVariant?.id,
        variantName: selectedVariant?.name,
        variantPriceModifier: variantModifier,
        flavourId: selectedFlavour?.id,
        flavourName: selectedFlavour?.name,
        flavourPriceModifier: flavourModifier,
      });
    } else {
      mergeOrAddToCart({
        productId: product.id,
        productType: "AGENT",
        name: product.name,
        image: (product as any).image || undefined,
        basePrice,
        optionsAddOn,
        originalPrice: adjustedPrice,
        discountPercentage: 0,
        discountAmount: 0,
        finalPrice: adjustedPrice,
        quantity,
        currency: "KWD",
        variantId: selectedVariant?.id,
        variantName: selectedVariant?.name,
        variantPriceModifier: variantModifier,
        flavourId: selectedFlavour?.id,
        flavourName: selectedFlavour?.name,
        flavourPriceModifier: flavourModifier,
      });
    }

    setSuccessMessage(`${product.name} added to cart`);
    setTimeout(() => setSuccessMessage(""), 2000);
    closeDraftSelection();
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
        // ── AGENT-exclusive products: send the SELECTED NAMES only.
        // agent_routes.py (agent_create_order) looks these names up against
        // the AgentProduct's own stored variants/flavours and computes the
        // price server-side — the client can't fake a price by tampering
        // with the numbers below, only the picked option can be trusted.
        ...(item.productType === "AGENT"
          ? {
              selected_variant: item.variantName || undefined,
              selected_flavour: item.flavourName || undefined,
            }
          : {}),
        // Informational fields (both product types) — handy for support /
        // receipts, but not authoritative for pricing.
        base_price: Number(item.basePrice.toFixed(2)),
        variant_id: item.variantId,
        variant_name: item.variantName,
        variant_price_modifier: item.variantPriceModifier
          ? Number(item.variantPriceModifier.toFixed(2))
          : 0,
        flavour_id: item.flavourId,
        flavour_name: item.flavourName,
        flavour_price_modifier: item.flavourPriceModifier
          ? Number(item.flavourPriceModifier.toFixed(2))
          : 0,
        original_price: Number(item.originalPrice.toFixed(2)),
        discount_percentage: Number(item.discountPercentage.toFixed(2)),
        discount_amount: Number(item.discountAmount.toFixed(2)),
        final_price: Number(item.finalPrice.toFixed(2)),
        line_total: Number((item.finalPrice * item.quantity).toFixed(2)),
      },
    }));

    const isPickup = deliveryMethod === "PICKUP";

    const payload: AgentOrderPayloadExtended = {
      customer_id: agent!.id,
      address_id: isPickup ? null : selectedAddressId ?? null,
      items,
      payment_method: paymentMethod || "COD",
      currency: currency as CreateAgentOrderPayload["currency"],
      delivery_date: !isPickup ? deliveryDate || undefined : undefined,
      delivery_time_slot: !isPickup ? deliveryTimeSlot || undefined : undefined,
      pickup_date: isPickup ? pickupDate || undefined : undefined,
      pickup_time_slot: isPickup ? pickupTimeSlot || undefined : undefined,
      order_source: "AGENT_SELF",
      delivery_method: deliveryMethod,
      agent_notes: notes.trim() || undefined,
      agent_discount_percentage: Number(agentDiscount.toFixed(2)),
      discount_total: Number(discountTotal.toFixed(2)),
      delivery_charge: Number(deliveryCharge.toFixed(2)),
      subtotal: Number(originalSubtotal.toFixed(2)),
      grand_total: Number(grandTotal.toFixed(2)),
    };

    console.log("========================================");
    console.log("CREATE AGENT ORDER PAYLOAD");
    console.log("========================================");
    console.log(JSON.stringify(payload, null, 2));

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

    if (!validateForm()) {
      return;
    }

    if (deliveryMethod === "DELIVERY" && !selectedAddressId) {
      setSubmitError("Please select a delivery address.");
      return;
    }

    if (deliveryMethod === "PICKUP" && (!pickupDate || !pickupTimeSlot)) {
      setSubmitError("Please select pickup date and time.");
      return;
    }

    if (cart.length === 0) {
      setSubmitError("Please add at least one product.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = buildPayload();
      const order = await createAgentOrder(payload);
      console.log("ORDER CREATED:", order);
      setSuccessMessage("Order created successfully.");
      resetOrderState();
    } catch (err: any) {
      console.error("========================================");
      console.error("ORDER CREATION FAILED");
      console.error("========================================");
      console.error("Status:", err?.response?.status);
      console.error("Backend response:", err?.response?.data);

      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Could not create the order.";

      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render helpers ───────────────────────────────────────────────────────

  // Normal-menu card: now just shows product info + an "Add" button that
  // opens the customization modal (quantity / variant / flavour), same
  // pattern as SalesAgentCreateOrder's renderProductCard.
  const renderNormalProductCard = (product: BakeryProduct) => {
    const price = product.price || 0;
    const { finalPrice } = getDiscountedPrice(price);
    const outOfStock = (product as any).stock !== undefined && (product as any).stock <= 0;
    const hasOptions = getVariantOptions(product).length > 0 || getFlavourOptions(product).length > 0;

    return (
      <div className="ao-product-card" key={cartKey(product.id, "NORMAL")}>
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
            {hasOptions && <span className="ao-price-from-note">+ options</span>}
          </div>

          {(product as any).stock !== undefined && (
            <span className={`ao-stock-tag ${outOfStock ? "ao-stock-out" : ""}`}>
              Stock: {(product as any).stock ?? 0}
            </span>
          )}
        </div>
        <button
          type="button"
          className="ao-btn ao-btn-add"
          disabled={outOfStock}
          onClick={() => openDraftSelection(product, "NORMAL")}
        >
          {outOfStock ? "Out of Stock" : "Add"}
        </button>
      </div>
    );
  };

  // Agent-exclusive card: same shape, opens the same modal with
  // productType "AGENT" so pricing/discount is handled correctly.
  const renderAgentProductCard = (product: AgentProduct) => {
    const hasOptions = getVariantOptions(product).length > 0 || getFlavourOptions(product).length > 0;
    return (
      <div className="ao-product-card" key={cartKey(product.id, "AGENT")}>
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
            <span className="ao-price-final">KWD {formatMoney(product.price || 0)}</span>
            {hasOptions && <span className="ao-price-from-note">+ options</span>}
          </div>
        </div>
        <button
          type="button"
          className="ao-btn ao-btn-add"
          onClick={() => openDraftSelection(product, "AGENT")}
        >
          Add
        </button>
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

  // Numbered pagination controls — Prev / page numbers / Next, same pattern
  // as SalesAgentCreateOrder's product grid pagination.
  const renderPagination = (
    currentPage: number,
    totalPages: number,
    onGoToPage: (page: number) => void
  ) => (
    <div className="ao-pagination">
      <button
        type="button"
        className="ao-pagination-btn"
        onClick={() => onGoToPage(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ‹ Prev
      </button>

      <div className="ao-pagination-pages">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            type="button"
            key={page}
            className={`ao-pagination-page ${page === currentPage ? "active" : ""}`}
            onClick={() => onGoToPage(page)}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="ao-pagination-btn"
        onClick={() => onGoToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next ›
      </button>
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

          {/* Card — Menu / Agent Menu */}
          <section className="ao-card">
            <h2 className="ao-card-title">
              {menuTab === "MENU" ? "Menu" : "Agent Menu (Exclusive)"}
            </h2>
            {errors.items && <span className="ao-error-text">{errors.items}</span>}

            {/* Tab switcher */}
            <div className="ao-menu-tabs">
              <button
                type="button"
                className={`ao-menu-tab ${menuTab === "MENU" ? "ao-menu-tab-active" : ""}`}
                onClick={() => setMenuTab("MENU")}
              >
                <span className="ao-menu-tab-icon">📋</span>
                <span>Menu</span>
              </button>
              <button
                type="button"
                className={`ao-menu-tab ${menuTab === "AGENT_MENU" ? "ao-menu-tab-active" : ""}`}
                onClick={() => setMenuTab("AGENT_MENU")}
              >
                <span className="ao-menu-tab-icon">⭐</span>
                <span>Agent Menu (Exclusive)</span>
              </button>
            </div>

            <input
              type="text"
              className="ao-search-bar"
              placeholder={
                menuTab === "MENU"
                  ? "Search the menu…"
                  : "Search your exclusive products…"
              }
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

            {menuTab === "MENU" ? (
              <>
                <h3 className="ao-subsection-title">
                  Our Menu {agentDiscount > 0 ? `(${agentDiscount}% off for you)` : ""}
                </h3>
                {catalogLoading ? (
                  renderProductSkeletons(6)
                ) : filteredProducts.length === 0 ? (
                  <p className="ao-muted">No products match your search.</p>
                ) : (
                  <>
                    <div className="ao-product-grid">{visibleProducts.map(renderNormalProductCard)}</div>
                    {filteredProducts.length > PRODUCTS_PER_PAGE &&
                      renderPagination(menuPage, menuTotalPages, goToMenuPage)}
                  </>
                )}
              </>
            ) : (
              <>
                <h3 className="ao-subsection-title">Your Exclusive Products</h3>
                {catalogLoading ? (
                  renderProductSkeletons(6)
                ) : filteredAgentProducts.length === 0 ? (
                  <p className="ao-muted">No exclusive products assigned to you yet.</p>
                ) : (
                  <>
                    <div className="ao-product-grid">{visibleAgentProducts.map(renderAgentProductCard)}</div>
                    {filteredAgentProducts.length > PRODUCTS_PER_PAGE &&
                      renderPagination(agentMenuPage, agentMenuTotalPages, goToAgentMenuPage)}
                  </>
                )}
              </>
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
                      <th>Base</th>
                      <th>Options</th>
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
                          {(item.variantName || item.flavourName) && (
                            <div className="ao-cart-item-options">
                              {item.variantName && (
                                <span className="ao-tag ao-tag-option">
                                  Variant: {item.variantName}
                                  {item.variantPriceModifier ? ` (${formatModifier(item.variantPriceModifier)})` : ""}
                                </span>
                              )}
                              {item.flavourName && (
                                <span className="ao-tag ao-tag-option">
                                  Flavour: {item.flavourName}
                                  {item.flavourPriceModifier ? ` (${formatModifier(item.flavourPriceModifier)})` : ""}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="ao-qty-control">
                            <button type="button" className="ao-qty-btn" onClick={() => changeCartQuantity(item.cartId, -1)}>−</button>
                            <span className="ao-qty-value">{item.quantity}</span>
                            <button type="button" className="ao-qty-btn" onClick={() => changeCartQuantity(item.cartId, 1)}>+</button>
                          </div>
                        </td>
                        <td>{currency} {formatMoney(item.basePrice)}</td>
                        <td>{item.optionsAddOn ? formatModifier(item.optionsAddOn) : "—"}</td>
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

      {/* ── Add-to-cart customization modal — quantity / variant / flavour,
           same flow as SalesAgentCreateOrder. The price preview below
           recomputes live as soon as a variant/flavour is picked. ────────── */}
      {draftSelection && (() => {
        const variantOptions = getVariantOptions(draftSelection.product);
        const flavourOptions = getFlavourOptions(draftSelection.product, draftSelection.variantId);
        const selectedVariant =
          variantOptions.find((v) => String(v.id) === String(draftSelection.variantId)) || null;
        const selectedFlavour =
          flavourOptions.find((f) => String(f.id) === String(draftSelection.flavourId)) || null;

        const basePrice = (draftSelection.product as any).price || 0;
        const variantModifier = selectedVariant?.price_modifier ?? 0;
        const flavourModifier = selectedFlavour?.price_modifier ?? 0;
        const adjustedPrice = Math.max(basePrice + variantModifier + flavourModifier, 0);

        const unitPrice =
          draftSelection.productType === "NORMAL"
            ? getDiscountedPrice(adjustedPrice).finalPrice
            : adjustedPrice;
        const linePrice = unitPrice * draftSelection.quantity;
        const lineCurrency = draftSelection.productType === "NORMAL" ? currency : "KWD";

        return (
          <div className="ao-modal-overlay" onClick={closeDraftSelection}>
            <div className="ao-modal" onClick={(e) => e.stopPropagation()}>
              <h3 className="ao-modal-title">{draftSelection.product.name}</h3>

              {draftSelection.productType === "AGENT" && (
                <span className="ao-badge ao-badge-exclusive" style={{ marginBottom: 10, display: "inline-block" }}>
                  Agent Exclusive
                </span>
              )}
              {draftSelection.productType === "NORMAL" && agentDiscount > 0 && (
                <span className="ao-badge ao-badge-discount" style={{ marginBottom: 10, display: "inline-block" }}>
                  {agentDiscount}% OFF
                </span>
              )}

              <div className="ao-modal-base-price">
                Base price: {lineCurrency} {formatMoney(basePrice)}
              </div>

              {/* Variant selection — each pill shows its own price add-on */}
              {variantOptions.length > 0 ? (
                <div className="ao-field">
                  <label>Variant</label>
                  <div className="ao-option-pills">
                    {variantOptions.map((v) => (
                      <button
                        type="button"
                        key={v.id}
                        className={`ao-option-pill ${String(draftSelection.variantId) === String(v.id) ? "selected" : ""}`}
                        onClick={() => selectDraftVariant(String(v.id))}
                      >
                        {v.name}
                        {v.price_modifier ? ` (${formatModifier(v.price_modifier)})` : ""}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="ao-hint">This product has no variants.</p>
              )}

              {/* Flavour selection — each pill shows its own price add-on */}
              {flavourOptions.length > 0 && (
                <div className="ao-field">
                  <label>Flavour</label>
                  <div className="ao-option-pills">
                    {flavourOptions.map((f) => (
                      <button
                        type="button"
                        key={f.id}
                        className={`ao-option-pill ${String(draftSelection.flavourId) === String(f.id) ? "selected" : ""}`}
                        onClick={() => selectDraftFlavour(String(f.id))}
                      >
                        {f.name}
                        {f.price_modifier ? ` (${formatModifier(f.price_modifier)})` : ""}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="ao-field">
                <label>Quantity</label>
                <div className="ao-qty-control">
                  <button type="button" className="ao-qty-btn" onClick={() => changeDraftQuantity(-1)}>
                    −
                  </button>
                  <span className="ao-qty-value">{draftSelection.quantity}</span>
                  <button type="button" className="ao-qty-btn" onClick={() => changeDraftQuantity(1)}>
                    +
                  </button>
                </div>
              </div>

              {/* Live line-price preview based on the current selection —
                  base price + variant add-on + flavour add-on, times qty. */}
              <div className="ao-modal-price-preview">
                <span>Price</span>
                <span>
                  {lineCurrency} {formatMoney(linePrice)}
                </span>
              </div>

              <div className="ao-modal-actions">
                <button type="button" className="ao-btn ao-btn-ghost" onClick={closeDraftSelection}>
                  Cancel
                </button>
                <button type="button" className="ao-btn ao-btn-primary" onClick={confirmAddToCart}>
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default AgentOrder;