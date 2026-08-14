// import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
// import './Salesagentcreateorder.css';

// // ─────────────────────────────────────────────────────────────────────────────
// // EXISTING SERVICES ONLY — nothing in this file creates or modifies a service.
// // ─────────────────────────────────────────────────────────────────────────────

// // Order creation — real signature from services/orderService.ts
// import {
//   createSalesAgentOrder,
//   type SalesAgentCreateOrderPayload,
//   type SalesAgentOrderItem,
// } from "../../services/orderService";

// // Products / variants / add-ons — real signatures from services/productService.ts
// import {
//   getAllProducts,
//   getAllAddons,
//   getVariantsByProduct,
//   type Product,
//   type Variant,
//   type Addon,
// } from "../../services/productService";

// // Customer search — real signature from services/userService.ts
// import { searchCustomers, type Customer } from "../../services/userService";

// // Areas — NOT included in the files you shared, so this import (and the
// // AreaOption shape below) is an assumption. Point it at your real areas
// // service/export if the path or field names differ.
// import { getAreas } from "../../services/areaService";
// import axios from "axios";

// // =============================================================================
// // ─── TYPES ───────────────────────────────────────────────────────────────────
// // =============================================================================

// interface CustomerInfo {
//   customerName: string;
//   customerPhone: string;
//   customerAltPhone: string;
//   customerEmail: string;
// }

// interface DeliveryAddressForm {
//   addressLine: string; // → address_line1
//   houseNo: string; // folded into address_line2
//   street: string; // folded into address_line2
//   areaId: number | null; // → area_id — REQUIRED for every order now
//   city: string;
//   state: string;
//   country: string;
//   landmark: string;
//   deliveryNotes: string; // kept for the agent's own reference — see note below
//   // Delivery date/time placed with address so delivery-specific fields are grouped
//   deliveryDate: string;
//   deliveryTimeSlot: string;
// }

// /**
//  * Shape returned by getAreas(). Not provided in your service files, so this
//  * is the minimal shape the UI needs (id/name to populate the dropdown,
//  * currency/delivery_charge to auto-fill the summary). Adjust to match your
//  * actual API response.
//  */
// interface AreaOption {
//   id: number;
//   name: string;
//   currency?: string;
//   delivery_charge?: number;
// }

// interface CartItem {
//   cartId: string; // local id for list rendering only, never sent to backend
//   product: Product;
//   variantId: number | null;
//   variantName: string;
//   addonIds: number[];
//   quantity: number;
//   specialInstruction: string;
//   giftMessage: string;
// }

// /**
//  * Custom cake form — trimmed to exactly the fields the order should carry:
//  * product name, reference image, shape, flavour, variant, custom price, message.
//  */
// interface CustomCakeForm {
//   productName: string;
//   referenceImageUrl: string;
//   shape: string;
//   flavour: string;
//   variant: string;
//   price: string;
//   message: string;
// }

// type PaymentMethod = "COD" | "UPI" | "CARD";

// interface FormErrors {
//   customerName?: string;
//   customerPhone?: string;
//   area?: string;
//   items?: string;
//   customCake?: string;
// }

// interface DraftSelection {
//   product: Product;
//   variantId: number | null;
//   addonIds: number[];
//   quantity: number;
//   specialInstruction: string;
//   giftMessage: string;
// }

// const CAKE_SHAPES = ["Round", "Heart", "Square", "Rectangle"];

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

// const CLOUD_NAME = "djwyoxnqy";
// const UPLOAD_PRESET = "CakeNTake_upload";

// const uploadToCloudinary = async (file: File): Promise<string> => {
//   const data = new FormData();
//   data.append("file", file);
//   data.append("upload_preset", UPLOAD_PRESET);
//   const res = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, data);
//   return res.data.secure_url;
// };

// const EMPTY_CUSTOMER: CustomerInfo = {
//   customerName: "",
//   customerPhone: "",
//   customerAltPhone: "",
//   customerEmail: "",
// };

// const EMPTY_ADDRESS: DeliveryAddressForm = {
//   addressLine: "",
//   houseNo: "",
//   street: "",
//   areaId: null,
//   city: "",
//   state: "",
//   country: "Kuwait",
//   landmark: "",
//   deliveryNotes: "",
//   deliveryDate: "",
//   deliveryTimeSlot: "",
// };

// const EMPTY_CUSTOM_CAKE: CustomCakeForm = {
//   productName: "",
//   referenceImageUrl: "",
//   shape: "",
//   flavour: "",
//   variant: "",
//   price: "",
//   message: "",
// };

// const CUSTOMER_SEARCH_DEBOUNCE_MS = 400;

// // =============================================================================
// // ─── HELPERS ─────────────────────────────────────────────────────────────────
// // =============================================================================

// const makeCartId = (): string =>
//   `cart_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

// const getUnitPrice = (product: Product, variant: Variant | null): number => {
//   const base = product.price || 0;
//   const modifier = variant?.price_modifier || 0;
//   return base + modifier;
// };

// const getAddonsTotal = (addonIds: number[], allAddons: Addon[]): number =>
//   addonIds.reduce((sum, id) => {
//     const addon = allAddons.find((a) => a.id === id);
//     return sum + (addon ? addon.price : 0);
//   }, 0);

// const getLineSubtotal = (
//   item: CartItem,
//   variant: Variant | null,
//   allAddons: Addon[]
// ): number => {
//   const unit = getUnitPrice(item.product, variant);
//   const addonsTotal = getAddonsTotal(item.addonIds, allAddons);
//   return (unit + addonsTotal) * item.quantity;
// };

// const formatMoney = (value: number): string => value.toFixed(2);

// const isValidPhone = (phone: string): boolean => /\d{7,}/.test(phone.replace(/\D/g, ""));

// const customerFullName = (c: Customer): string =>
//   `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim();

// /**
//  * Any optional text field that the agent leaves blank is sent to the
//  * backend as "-" instead of undefined/"" so the order can still be created
//  * without every field being filled in. Only name / phone / area are
//  * actually required — everything else falls back to this.
//  */
// const orDash = (value: string | null | undefined): string => {
//   const trimmed = (value ?? "").trim();
//   return trimmed ? trimmed : "-";
// };

// // =============================================================================
// // ─── COMPONENT ───────────────────────────────────────────────────────────────
// // =============================================================================

// const SalesAgentCreateOrder: React.FC = () => {
//   // ── Customer & address ──────────────────────────────────────────────────
//   const [customer, setCustomer] = useState<CustomerInfo>(EMPTY_CUSTOMER);
//   const [address, setAddress] = useState<DeliveryAddressForm>(EMPTY_ADDRESS);

//   // ── Existing-customer search ────────────────────────────────────────────
//   const [customerSearchTerm, setCustomerSearchTerm] = useState<string>("");
//   const [customerResults, setCustomerResults] = useState<Customer[]>([]);
//   const [customerSearchLoading, setCustomerSearchLoading] = useState<boolean>(false);
//   const [showCustomerDropdown, setShowCustomerDropdown] = useState<boolean>(false);
//   const [customerSearchError, setCustomerSearchError] = useState<string>("");

//   const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
//   const searchContainerRef = useRef<HTMLDivElement | null>(null);

//   // ── Areas ────────────────────────────────────────────────────────────────
//   const [areas, setAreas] = useState<AreaOption[]>([]);
//   const [areasLoading, setAreasLoading] = useState<boolean>(true);

//   // ── Catalog data ─────────────────────────────────────────────────────────
//   const [products, setProducts] = useState<Product[]>([]);
//   const [addons, setAddons] = useState<Addon[]>([]);
//   const [catalogLoading, setCatalogLoading] = useState<boolean>(true);
//   const [catalogError, setCatalogError] = useState<string>("");
//   const [productSearchTerm, setProductSearchTerm] = useState<string>("");

//   // ── Cart ─────────────────────────────────────────────────────────────────
//   const [cart, setCart] = useState<CartItem[]>([]);

//   // ── "Add to cart" customization panel ───────────────────────────────────
//   const [draftSelection, setDraftSelection] = useState<DraftSelection | null>(null);
//   const [draftVariants, setDraftVariants] = useState<Variant[]>([]);
//   const [draftVariantsLoading, setDraftVariantsLoading] = useState<boolean>(false);

//   // ── Custom cake ──────────────────────────────────────────────────────────
//   const [isCustomCake, setIsCustomCake] = useState<boolean>(false);
//   const [customCake, setCustomCake] = useState<CustomCakeForm>(EMPTY_CUSTOM_CAKE);
//   const [customCakeImageFile, setCustomCakeImageFile] = useState<File | null>(null);
//   const [customCakeImageUploading, setCustomCakeImageUploading] = useState<boolean>(false);

//   // Delivery method UI (pickup or delivery)
//   const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup');
//   const [pickupDate, setPickupDate] = useState<string>("");
//   const [pickupTimeSlot, setPickupTimeSlot] = useState<string>("");

//   // ── Order summary / payment ─────────────────────────────────────────────
//   // NOTE: subtotal / discount / grand_total / currency are shown to the agent
//   // as a live preview only — SalesAgentCreateOrderPayload does not currently
//   // accept these fields, so they are not sent to the backend (see buildPayload).
//   const [deliveryCharge, setDeliveryCharge] = useState<number>(0);
//   const [discount, setDiscount] = useState<number>(0);
//   const [currency, setCurrency] = useState<string>("KWD");
//   const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");

//   // ── Submission state ─────────────────────────────────────────────────────
//   const [errors, setErrors] = useState<FormErrors>({});
//   const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
//   const [successMessage, setSuccessMessage] = useState<string>("");
//   const [submitError, setSubmitError] = useState<string>("");

//   // Resolved variant lookup for whatever is currently in the cart, keyed by
//   // "productId:variantId" → Variant, so totals can be computed without
//   // re-fetching. Populated as variants are loaded in the customization modal.
//   const [variantCache, setVariantCache] = useState<Record<string, Variant>>({});

//   // ── Load products, add-ons and areas on mount ───────────────────────────
//   useEffect(() => {
//     let cancelled = false;

//     const loadCatalog = async () => {
//       setCatalogLoading(true);
//       setCatalogError("");
//       try {
//         const [productList, addonList] = await Promise.all([
//           // Request products explicitly for the Sales Agent UI so the backend
//           // returns the raw stored KWD values instead of converting to the
//           // user's current currency.
//           getAllProducts("KWD", true),
//           getAllAddons(),
//         ]);
//         if (!cancelled) {
//           setProducts(productList);
//           setAddons(addonList);
//         }
//       } catch (err) {
//         if (!cancelled) setCatalogError("Unable to load products. Please refresh and try again.");
//       } finally {
//         if (!cancelled) setCatalogLoading(false);
//       }
//     };

//     const loadAreas = async () => {
//       setAreasLoading(true);
//       try {
//         const areaList = await getAreas();
//         if (!cancelled) setAreas(areaList as AreaOption[]);
//       } catch (err) {
//         if (!cancelled) setCatalogError((prev) => prev || "Unable to load delivery areas.");
//       } finally {
//         if (!cancelled) setAreasLoading(false);
//       }
//     };

//     loadCatalog();
//     loadAreas();
//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   const handleCustomCakeImageUpload = async (file: File) => {
//     setCustomCakeImageFile(file);
//     // instant local preview while the real upload happens
//     updateCustomCake("referenceImageUrl", URL.createObjectURL(file));
//     setCustomCakeImageUploading(true);
//     try {
//       const secureUrl = await uploadToCloudinary(file);
//       updateCustomCake("referenceImageUrl", secureUrl);
//     } catch (err) {
//       updateCustomCake("referenceImageUrl", "");
//       setCustomCakeImageFile(null);
//       setSubmitError("Image upload failed. Please try again.");
//     } finally {
//       setCustomCakeImageUploading(false);
//     }
//   };

//   // ── Debounced customer search ───────────────────────────────────────────
//   useEffect(() => {
//     if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

//     const term = customerSearchTerm.trim();
//     if (!term) {
//       setCustomerResults([]);
//       setCustomerSearchLoading(false);
//       setCustomerSearchError("");
//       return;
//     }

//     setShowCustomerDropdown(true);
//     setCustomerSearchLoading(true);
//     setCustomerSearchError("");

//     searchDebounceRef.current = setTimeout(async () => {
//       try {
//         const results = await searchCustomers(term);
//         setCustomerResults(results);
//       } catch (err) {
//         setCustomerResults([]);
//         setCustomerSearchError("Search failed. You can still enter details manually.");
//       } finally {
//         setCustomerSearchLoading(false);
//       }
//     }, CUSTOMER_SEARCH_DEBOUNCE_MS);

//     return () => {
//       if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
//     };
//   }, [customerSearchTerm]);

//   // ── Close the customer dropdown on outside click ────────────────────────
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         searchContainerRef.current &&
//         !searchContainerRef.current.contains(event.target as Node)
//       ) {
//         setShowCustomerDropdown(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handleSelectCustomer = (c: Customer) => {
//     setCustomer((prev) => ({
//       ...prev,
//       customerName: customerFullName(c) || prev.customerName,
//       customerPhone: c.phone_no || prev.customerPhone,
//       customerEmail: c.email || prev.customerEmail,
//     }));
//     setCustomerSearchTerm("");
//     setCustomerResults([]);
//     setShowCustomerDropdown(false);
//     setErrors((prev) => ({ ...prev, customerName: undefined, customerPhone: undefined }));
//   };

//   // ── Filtered product list for the POS search bar ───────────────────────
//   const filteredProducts = useMemo(() => {
//     if (!productSearchTerm.trim()) return products;
//     const term = productSearchTerm.trim().toLowerCase();
//     return products.filter((p) => (p.name || "").toLowerCase().includes(term));
//   }, [products, productSearchTerm]);

//   // ── Totals (preview only, see note above) ───────────────────────────────
//   const subtotal = useMemo(
//     () =>
//       cart.reduce((sum, item) => {
//         const variant = item.variantId
//           ? variantCache[`${item.product.id}:${item.variantId}`] || null
//           : null;
//         return sum + getLineSubtotal(item, variant, addons);
//       }, 0),
//     [cart, addons, variantCache]
//   );

//   const grandTotal = useMemo(() => {
//     const total = subtotal + Number(deliveryCharge || 0) - Number(discount || 0);
//     return total > 0 ? total : 0;
//   }, [subtotal, deliveryCharge, discount]);

//   // ── Field change handlers ───────────────────────────────────────────────
//   const updateCustomer = (field: keyof CustomerInfo, value: string) => {
//     setCustomer((prev) => ({ ...prev, [field]: value }));
//   };

//   const updateAddress = (field: keyof DeliveryAddressForm, value: string) => {
//     setAddress((prev) => ({ ...prev, [field]: value }));
//   };

//   const updateCustomCake = (field: keyof CustomCakeForm, value: string) => {
//     setCustomCake((prev) => ({ ...prev, [field]: value }));
//     if (field === "productName" || field === "price") {
//       setErrors((prev) => ({ ...prev, customCake: undefined }));
//     }
//   };

//   const handleAreaChange = (areaIdValue: string) => {
//     const areaId = areaIdValue ? Number(areaIdValue) : null;
//     setAddress((prev) => ({ ...prev, areaId }));
//     setErrors((prev) => ({ ...prev, area: undefined }));

//     const selectedArea = areas.find((a) => a.id === areaId);
//     if (selectedArea) {
//       if (selectedArea.currency) setCurrency(selectedArea.currency);
//       if (typeof selectedArea.delivery_charge === "number") {
//         setDeliveryCharge(selectedArea.delivery_charge);
//       }
//     }
//   };

//   // ── Add-to-cart flow ─────────────────────────────────────────────────────

//   /** Opens the customization panel and lazily loads variants for this product. */
//   const openDraftSelection = async (product: Product) => {
//     setDraftSelection({
//       product,
//       variantId: null,
//       addonIds: [],
//       quantity: 1,
//       specialInstruction: "",
//       giftMessage: "",
//     });
//     setDraftVariants([]);
//     setDraftVariantsLoading(true);
//     try {
//       const variants = await getVariantsByProduct(product.id);
//       setDraftVariants(variants);
//       setVariantCache((prev) => {
//         const next = { ...prev };
//         variants.forEach((v) => {
//           next[`${product.id}:${v.id}`] = v;
//         });
//         return next;
//       });
//       if (variants.length > 0) {
//         setDraftSelection((prev) => (prev ? { ...prev, variantId: variants[0].id } : prev));
//       }
//     } catch (err) {
//       setDraftVariants([]);
//     } finally {
//       setDraftVariantsLoading(false);
//     }
//   };

//   const closeDraftSelection = () => {
//     setDraftSelection(null);
//     setDraftVariants([]);
//   };

//   const toggleDraftAddon = (addonId: number) => {
//     setDraftSelection((prev) => {
//       if (!prev) return prev;
//       const exists = prev.addonIds.includes(addonId);
//       return {
//         ...prev,
//         addonIds: exists
//           ? prev.addonIds.filter((id) => id !== addonId)
//           : [...prev.addonIds, addonId],
//       };
//     });
//   };

//   const changeDraftQuantity = (delta: number) => {
//     setDraftSelection((prev) => {
//       if (!prev) return prev;
//       return { ...prev, quantity: Math.max(1, prev.quantity + delta) };
//     });
//   };

//   const confirmAddToCart = () => {
//     if (!draftSelection) return;

//     const newItem: CartItem = {
//       cartId: makeCartId(),
//       product: draftSelection.product,
//       variantId: null,
//       variantName: "",
//       addonIds: [],
//       quantity: draftSelection.quantity,
//       specialInstruction: "",
//       giftMessage: "",
//     };

//     setCart((prev) => [...prev, newItem]);
//     setErrors((prev) => ({ ...prev, items: undefined }));
//     // show a small success toast in the page
//     setSuccessMessage(`${draftSelection.product.name} added to cart`);
//     setTimeout(() => setSuccessMessage(""), 2500);
//     closeDraftSelection();
//   };

//   /** Adds the custom cake as a cart row using ONLY: product name, image,
//    *  shape, flavour, variant, price, message. */
//   const addCustomCakeToCart = () => {
//     if (!customCake.productName.trim() || !Number(customCake.price)) {
//       setErrors((prev) => ({
//         ...prev,
//         customCake: "Enter a product name and a custom price for the cake",
//       }));
//       return;
//     }

//     const customCakeProduct: Product = {
//       id: -1, // temporary id — filtered out of `items` before sending to backend
//       name: customCake.productName.trim(),
//       price: Number(customCake.price || 0),
//       stock: 999,
//       image_url: customCake.referenceImageUrl || "",
//     } as Product;

//     const item: CartItem = {
//       cartId: makeCartId(),
//       product: customCakeProduct,
//       variantId: null,
//       variantName: customCake.variant.trim(),
//       addonIds: [],
//       quantity: 1,
//       specialInstruction: "",
//       giftMessage: customCake.message.trim(),
//     };

//     setCart((prev) => [...prev, item]);
//     setErrors((prev) => ({ ...prev, items: undefined, customCake: undefined }));
//   };

//   // ── Cart row handlers ────────────────────────────────────────────────────
//   const changeCartQuantity = (cartId: string, delta: number) => {
//     setCart((prev) =>
//       prev.map((item) =>
//         item.cartId === cartId
//           ? { ...item, quantity: Math.max(1, item.quantity + delta) }
//           : item
//       )
//     );
//   };

//   const removeCartItem = (cartId: string) => {
//     setCart((prev) => prev.filter((item) => item.cartId !== cartId));
//   };

//   // ── Validation ───────────────────────────────────────────────────────────
//   // ONLY customer name, customer phone, and area are actually required.
//   // Everything else (address details, delivery/pickup date & time, payment
//   // method, etc.) is optional — unfilled optional fields are sent as "-"
//   // to the backend in buildPayload() below.
//   const validateForm = (): boolean => {
//     const nextErrors: FormErrors = {};

//     if (!customer.customerName.trim()) {
//       nextErrors.customerName = "Customer name is required";
//     }
//     if (!customer.customerPhone.trim() || !isValidPhone(customer.customerPhone)) {
//       nextErrors.customerPhone = "A valid phone number is required";
//     }

//     // if (!address.areaId) {
//     //   nextErrors.area = "Select an area";
//     // }

//     if (deliveryMethod === "delivery" && !address.areaId) {
//   nextErrors.area = "Select an area";
// }

//     // Items — an order still needs something in the cart to make sense.
//     const hasRealItems = cart.some((item) => item.product.id !== -1);
//     const hasCustomCakeInCart = cart.some((item) => item.product.id === -1);
//     if (!hasRealItems && !hasCustomCakeInCart) {
//       nextErrors.items = "Add at least one product, or a custom cake";
//     }

//     if (isCustomCake && !hasCustomCakeInCart) {
//       nextErrors.customCake = "Add the custom cake to the cart before submitting";
//     }

//     setErrors(nextErrors);
//     return Object.keys(nextErrors).length === 0;
//   };

//   // ── Payload builder ──────────────────────────────────────────────────────
//   // Built strictly against SalesAgentCreateOrderPayload as it exists in your
//   // orderService today. Only customer_name / customer_phone / area_id are
//   // guaranteed to be real values — every other optional string field falls
//   // back to "-" via orDash() when the agent left it blank.
//   const buildPayload = (): SalesAgentCreateOrderPayload => {
//     const items: SalesAgentOrderItem[] = cart
//       .filter((item) => item.product.id !== -1) // exclude custom-cake placeholder row
//       .map((item) => ({
//         product_id: item.product.id,
//         quantity: item.quantity,
//         custom_json: {
//           variant_id: item.variantId,
//           variant_name: orDash(item.variantName),
//           addon_ids: item.addonIds,
//           special_instruction: orDash(item.specialInstruction),
//           gift_message: orDash(item.giftMessage),
//         },
//       }));

//     const custom_cake = isCustomCake
//       ? {
//           product_name: orDash(customCake.productName),
//           image: orDash(customCake.referenceImageUrl),
//           shape: orDash(customCake.shape),
//           flavour: orDash(customCake.flavour),
//           variant: orDash(customCake.variant),
//           price: Number(customCake.price || 0),
//           message: orDash(customCake.message),
//         }
//       : undefined;

//     const address_line2 =
//       [address.houseNo, address.street].filter(Boolean).join(", ");

//     const payload: SalesAgentCreateOrderPayload = {
//       customer_name: customer.customerName.trim(),
//       customer_phone: customer.customerPhone.trim(),
//       customer_email: orDash(customer.customerEmail),

//       delivery_method: deliveryMethod === 'pickup' ? 'PICKUP' : 'DELIVERY',

//       // Address fields only really apply to DELIVERY, but area_id is now
//       // collected (and required) for every order regardless of method.
//       address_line1: deliveryMethod === 'delivery' ? orDash(address.addressLine) : "-",
//       address_line2: deliveryMethod === 'delivery' ? orDash(address_line2) : "-",
//       landmark: deliveryMethod === 'delivery' ? orDash(address.landmark) : "-",
//       city: deliveryMethod === 'delivery' ? orDash(address.city) : "-",
//       state: deliveryMethod === 'delivery' ? orDash(address.state) : "-",
//       country: deliveryMethod === 'delivery' ? orDash(address.country) : "-",
//       area_id: address.areaId as number,

//       // Delivery vs Pickup dates — optional, unfilled sent as "-"
//       delivery_date: deliveryMethod === 'delivery' ? orDash(address.deliveryDate) : "-",
//       delivery_time_slot: deliveryMethod === 'delivery' ? orDash(address.deliveryTimeSlot) : "-",

//       pickup_date: deliveryMethod === 'pickup' ? orDash(pickupDate) : "-",
//       pickup_time_slot: deliveryMethod === 'pickup' ? orDash(pickupTimeSlot) : "-",

//       items,

//       payment_method: paymentMethod ? paymentMethod : "-",
//       order_type: "agent_order",

//       custom_cake,
//     } as SalesAgentCreateOrderPayload;

//     return payload;
//   };

//   // ── Reset ────────────────────────────────────────────────────────────────
//   const resetForm = () => {
//     setCustomer(EMPTY_CUSTOMER);
//     setAddress(EMPTY_ADDRESS);
//     setCart([]);
//     setIsCustomCake(false);
//     setCustomCake(EMPTY_CUSTOM_CAKE);
//     setCustomCakeImageFile(null);
//     setCustomCakeImageUploading(false);
//     setDeliveryCharge(0);
//     setDiscount(0);
//     setPaymentMethod("");
//     setProductSearchTerm("");
//     setCustomerSearchTerm("");
//     setPickupDate("");
//     setPickupTimeSlot("");
//     setErrors({});
//   };

//   // ── Submit ───────────────────────────────────────────────────────────────
//   const handleCreateOrder = async () => {
//     setSuccessMessage("");
//     setSubmitError("");
//     if (!validateForm()) return;

//     setIsSubmitting(true);
//     try {
//       const payload = buildPayload();
//       await createSalesAgentOrder(payload);
//       setSuccessMessage("Order Created Successfully");
//       resetForm();
//     } catch (err) {
//       setSubmitError("Could not create the order. Please check the details and try again.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleCancel = () => {
//     resetForm();
//     setSuccessMessage("");
//     setSubmitError("");
//   };

//   // ── Render helpers ───────────────────────────────────────────────────────

//   const renderProductCard = useCallback(
//     (product: Product) => (
//       <div className="sa-product-card" key={product.id}>
//         <div className="sa-product-image-wrap">
//           {product.image_url ? (
//             <img src={product.image_url} alt={product.name || "Product"} className="sa-product-image" />
//           ) : (
//             <div className="sa-product-image-placeholder">No Image</div>
//           )}
//         </div>
//         <div className="sa-product-info">
//           <p className="sa-product-name">{product.name}</p>
//           <div className="sa-product-meta">
//             <span className="sa-product-price">
//               {currency} {formatMoney(product.price || 0)}
//             </span>
//             <span className={`sa-product-stock ${(product.stock ?? 0) <= 0 ? "sa-stock-out" : ""}`}>
//               Stock: {product.stock ?? 0}
//             </span>
//           </div>
//         </div>
//         <button
//           type="button"
//           className="sa-btn sa-btn-add"
//           disabled={(product.stock ?? 0) <= 0}
//           onClick={() => openDraftSelection(product)}
//         >
//           Add
//         </button>
//       </div>
//     ),
//     [currency]
//   );

//   // =============================================================================
//   // ─── JSX ─────────────────────────────────────────────────────────────────────
//   // =============================================================================

//   return (
//     <div className="sa-page">
//       {/* ── Header ─────────────────────────────────────────────────────── */}
//       <header className="sa-header">
//         <p className="sa-eyebrow">Sales Agent</p>
//         <h1 className="sa-title">Create Customer Order</h1>
//       </header>

//       {successMessage && <div className="sa-toast sa-toast-success">{successMessage}</div>}
//       {(submitError || catalogError) && (
//         <div className="sa-toast sa-toast-error">{submitError || catalogError}</div>
//       )}

//       <div className="sa-layout">
//         {/* ── Main column ────────────────────────────────────────────── */}
//         <div className="sa-main-column">
//           {/* Card 1 — Customer Information */}
//           <section className="sa-card">
//             <h2 className="sa-card-title">Customer Information</h2>

//             {/* Existing-customer search */}
//             <div className="sa-search-field" ref={searchContainerRef}>
//               <label>Search Existing Customer</label>
//               <div className="sa-search-input-wrap">
//                 <svg className="sa-search-icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
//                   <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
//                   <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
//                 </svg>
//                 <input
//                   type="text"
//                   value={customerSearchTerm}
//                   onChange={(e) => setCustomerSearchTerm(e.target.value)}
//                   onFocus={() => {
//                     if (customerSearchTerm.trim()) setShowCustomerDropdown(true);
//                   }}
//                   placeholder="Search by Name, Phone or Email..."
//                 />
//                 {customerSearchLoading && <span className="sa-spinner" aria-label="Searching" />}
//               </div>

//               {showCustomerDropdown && customerSearchTerm.trim() && (
//                 <div className="sa-autocomplete-dropdown">
//                   {customerSearchLoading ? (
//                     <div className="sa-autocomplete-status">Searching...</div>
//                   ) : customerSearchError ? (
//                     <div className="sa-autocomplete-status sa-autocomplete-error">
//                       {customerSearchError}
//                     </div>
//                   ) : customerResults.length === 0 ? (
//                     <div className="sa-autocomplete-status">No customer found</div>
//                   ) : (
//                     customerResults.map((c) => (
//                       <button
//                         type="button"
//                         key={c.id}
//                         className="sa-autocomplete-item"
//                         onClick={() => handleSelectCustomer(c)}
//                       >
//                         <span className="sa-autocomplete-name">{customerFullName(c) || "Unnamed"}</span>
//                         <span className="sa-autocomplete-meta">
//                           {c.phone_no}
//                           {c.email ? ` · ${c.email}` : ""}
//                         </span>
//                       </button>
//                     ))
//                   )}
//                 </div>
//               )}
//               <span className="sa-hint">
//                 Searching is optional — you can always type in a new customer's details below.
//               </span>
//             </div>

//             <div className="sa-field-grid">
//               <div className="sa-field">
//                 <label>Customer Name *</label>
//                 <input
//                   type="text"
//                   value={customer.customerName}
//                   onChange={(e) => updateCustomer("customerName", e.target.value)}
//                   placeholder="e.g. Fatima Al-Sabah"
//                   className={errors.customerName ? "sa-input-error" : ""}
//                 />
//                 {errors.customerName && <span className="sa-error-text">{errors.customerName}</span>}
//               </div>

//               <div className="sa-field">
//                 <label>Customer Phone *</label>
//                 <input
//                   type="tel"
//                   value={customer.customerPhone}
//                   onChange={(e) => updateCustomer("customerPhone", e.target.value)}
//                   placeholder="e.g. +965 5555 1234"
//                   className={errors.customerPhone ? "sa-input-error" : ""}
//                 />
//                 {errors.customerPhone && <span className="sa-error-text">{errors.customerPhone}</span>}
//               </div>

//               <div className="sa-field">
//                 <label>Email</label>
//                 <input
//                   type="email"
//                   value={customer.customerEmail}
//                   onChange={(e) => updateCustomer("customerEmail", e.target.value)}
//                   placeholder="name@example.com (optional)"
//                 />
//               </div>

//             </div>
//           </section>

//           {/* Card 2 — Area, Delivery Method & Address / Pickup */}
//           <section className="sa-card">
//             <h2 className="sa-card-title">Area & Delivery Method</h2>

//             {/* Area is required for EVERY order, delivery or pickup */}
//             {/* <div className="sa-field">
//               <label>Area *</label>
//               <select
//                 value={address.areaId ?? ""}
//                 onChange={(e) => handleAreaChange(e.target.value)}
//                 disabled={areasLoading}
//                 className={errors.area ? "sa-input-error" : ""}
//               >
//                 <option value="">{areasLoading ? "Loading areas…" : "Select an area"}</option>
//                 {areas.map((a) => (
//                   <option key={a.id} value={a.id}>
//                     {a.name}
//                   </option>
//                 ))}
//               </select>
//               {errors.area && <span className="sa-error-text">{errors.area}</span>}
//             </div> */}

//             <div className="sa-delivery-method-cards">
//               <button
//                 type="button"
//                 className={`sa-delivery-card ${deliveryMethod === 'pickup' ? 'selected' : ''}`}
//                 onClick={() => setDeliveryMethod('pickup')}
//               >
//                 <div className="sa-delivery-emoji">🏪</div>
//                 <div className="sa-delivery-label">Pickup</div>
//                 <div className="sa-delivery-sub">No delivery charge</div>
//               </button>

//               <button
//                 type="button"
//                 className={`sa-delivery-card ${deliveryMethod === 'delivery' ? 'selected' : ''}`}
//                 onClick={() => setDeliveryMethod('delivery')}
//               >
//                 <div className="sa-delivery-emoji">🚚</div>
//                 <div className="sa-delivery-label">Delivery</div>
//                 <div className="sa-delivery-sub">Charge by area</div>
//               </button>
//             </div>

//             {deliveryMethod === 'delivery' && (
//               <React.Fragment>
//                 <div className="sa-field-grid">
//                      {/* Area is required for EVERY order, delivery or pickup */}
//             <div className="sa-field">
//               <label>Area *</label>
//               <select
//                 value={address.areaId ?? ""}
//                 onChange={(e) => handleAreaChange(e.target.value)}
//                 disabled={areasLoading}
//                 className={errors.area ? "sa-input-error" : ""}
//               >
//                 <option value="">{areasLoading ? "Loading areas…" : "Select an area"}</option>
//                 {areas.map((a) => (
//                   <option key={a.id} value={a.id}>
//                     {a.name}
//                   </option>
//                 ))}
//               </select>
//               {errors.area && <span className="sa-error-text">{errors.area}</span>}
//             </div>
//                   <div className="sa-field sa-field-full">
//                     <label>Block</label>
//                     <input
//                       type="text"
//                       value={address.addressLine}
//                       onChange={(e) => updateAddress("addressLine", e.target.value)}
//                       placeholder="Optional"
//                     />
//                   </div>
//                   <div className="sa-field">
//                     <label>House / Flat No</label>
//                     <input
//                       type="text"
//                       value={address.houseNo}
//                       onChange={(e) => updateAddress("houseNo", e.target.value)}
//                       placeholder="Optional"
//                     />
//                   </div>
//                   <div className="sa-field">
//                     <label>Street</label>
//                     <input
//                       type="text"
//                       value={address.street}
//                       onChange={(e) => updateAddress("street", e.target.value)}
//                       placeholder="Optional"
//                     />
//                   </div>

//                   <div className="sa-field">
//                     <label>Country</label>
//                     <input
//                       type="text"
//                       value={address.country}
//                       onChange={(e) => updateAddress("country", e.target.value)}
//                       placeholder="Optional"
//                     />
//                   </div>
//                   <div className="sa-field sa-field-full">
//                     <label>Landmark</label>
//                     <input
//                       type="text"
//                       value={address.landmark}
//                       onChange={(e) => updateAddress("landmark", e.target.value)}
//                       placeholder="Optional"
//                     />
//                   </div>
//                   <div className="sa-field sa-field-full">
//                     <label>Delivery Notes</label>
//                     <textarea
//                       rows={3}
//                       value={address.deliveryNotes}
//                       onChange={(e) => updateAddress("deliveryNotes", e.target.value)}
//                       placeholder="Gate code, preferred entrance, etc. (optional)"
//                     />
//                   </div>

//                   <div className="sa-field-grid">
//                     <div className="sa-field">
//                       <label>Delivery Date</label>
//                       <input
//                         type="date"
//                         value={address.deliveryDate}
//                         onChange={(e) => updateAddress("deliveryDate", e.target.value)}
//                       />
//                     </div>

//                     <div className="sa-field">
//                       <label>Delivery Time Slot</label>
//                       <select
//                         value={address.deliveryTimeSlot}
//                         onChange={(e) => updateAddress("deliveryTimeSlot", e.target.value)}
//                       >
//                         <option value="">Select a time slot (optional)</option>
//                         {TIME_SLOTS.map((s) => (
//                           <option key={s} value={s}>{s}</option>
//                         ))}
//                       </select>
//                     </div>
//                   </div>
//                   </div>

//                 </React.Fragment>
//             )}

//             {deliveryMethod === 'pickup' && (
//               <div className="sa-field-grid">
//                 <div className="sa-field">
//                   <label>Pickup Date</label>
//                   <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
//                 </div>
//                 <div className="sa-field">
//                   <label>Pickup Time</label>
//                   <select value={pickupTimeSlot} onChange={(e) => setPickupTimeSlot(e.target.value)}>
//                     <option value="">Select a time slot (optional)</option>
//                     {TIME_SLOTS.map((s) => (
//                       <option key={s} value={s}>{s}</option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//             )}

//           </section>

//           {/* Card 3 — Order Items (POS) */}
//           <section className="sa-card">
//             <h2 className="sa-card-title">Order Items</h2>
//             {errors.items && <span className="sa-error-text">{errors.items}</span>}

//             <input
//               type="text"
//               className="sa-search-bar"
//               placeholder="Search products..."
//               value={productSearchTerm}
//               onChange={(e) => setProductSearchTerm(e.target.value)}
//             />

//             {catalogLoading ? (
//               <p className="sa-muted">Loading products…</p>
//             ) : (
//               <div className="sa-product-grid">
//                 {filteredProducts.length === 0 ? (
//                   <p className="sa-muted">No products match your search.</p>
//                 ) : (
//                   filteredProducts.map(renderProductCard)
//                 )}
//               </div>
//             )}

//             {/* Cart table */}
//             <div className="sa-cart-table-wrap">
//               <table className="sa-cart-table">
//                 <thead>
//                   <tr>
//                     <th>Product</th>
//                     <th>Quantity</th>
//                     <th>Price</th>
//                     <th>Subtotal</th>
//                     <th>Remove</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {cart.length === 0 ? (
//                     <tr>
//                       <td colSpan={5} className="sa-muted sa-cart-empty">
//                         No items added yet.
//                       </td>
//                     </tr>
//                   ) : (
//                     cart.map((item) => {
//                       const unit = item.product.price || 0;
//                       const lineSubtotal = unit * item.quantity;
//                       const isCustomRow = item.product.id === -1;
//                       return (
//                         <tr key={item.cartId}>
//                           <td>
//                             <div className="sa-cart-product-name">
//                               {item.product.name}
//                               {isCustomRow && <span className="sa-tag-custom"> (Custom Cake)</span>}
//                             </div>
//                           </td>
//                           <td>
//                             <div className="sa-qty-control">
//                               <button
//                                 type="button"
//                                 className="sa-qty-btn"
//                                 onClick={() => changeCartQuantity(item.cartId, -1)}
//                                 aria-label="Decrease quantity"
//                                 disabled={isCustomRow}
//                               >
//                                 −
//                               </button>
//                               <span className="sa-qty-value">{item.quantity}</span>
//                               <button
//                                 type="button"
//                                 className="sa-qty-btn"
//                                 onClick={() => changeCartQuantity(item.cartId, 1)}
//                                 aria-label="Increase quantity"
//                                 disabled={isCustomRow}
//                               >
//                                 +
//                               </button>
//                             </div>
//                           </td>
//                           <td>
//                             {currency} {formatMoney(unit)}
//                           </td>
//                           <td>
//                             {currency} {formatMoney(lineSubtotal)}
//                           </td>
//                           <td>
//                             <button
//                               type="button"
//                               className="sa-btn-remove"
//                               onClick={() => removeCartItem(item.cartId)}
//                               aria-label="Remove item"
//                             >
//                               ✕
//                             </button>
//                           </td>
//                         </tr>
//                       );
//                     })
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </section>

//           {/* Custom Cake Section — ONLY: product name, image, shape, flavour, variant, price, message */}
//           <section className="sa-card">
//             <label className="sa-checkbox-row">
//               <input
//                 type="checkbox"
//                 checked={isCustomCake}
//                 onChange={(e) => setIsCustomCake(e.target.checked)}
//               />
//               <span>This is a Custom Cake Order</span>
//             </label>

//             {isCustomCake && (
//               <React.Fragment>
//                 {errors.customCake && <span className="sa-error-text">{errors.customCake}</span>}
//                 <div className="sa-field-grid sa-custom-cake-grid">
//                   <div className="sa-field">
//                     <label>Product Name *</label>
//                     <input
//                       type="text"
//                       value={customCake.productName}
//                       placeholder="e.g. Custom Birthday Cake"
//                       onChange={(e) => updateCustomCake("productName", e.target.value)}
//                     />
//                   </div>

//                   <div className="sa-field">
//                     <label>Cake Shape</label>
//                     <select value={customCake.shape} onChange={(e) => updateCustomCake("shape", e.target.value)}>
//                       <option value="">Select shape (optional)</option>
//                       {CAKE_SHAPES.map((shape) => (
//                         <option key={shape} value={shape}>
//                           {shape}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div className="sa-field">
//                     <label>Flavour</label>
//                     <input
//                       type="text"
//                       value={customCake.flavour}
//                       placeholder="e.g. Chocolate, Vanilla (optional)"
//                       onChange={(e) => updateCustomCake("flavour", e.target.value)}
//                     />
//                   </div>

//                   <div className="sa-field">
//                     <label>Variant</label>
//                     <input
//                       type="text"
//                       value={customCake.variant}
//                       placeholder="e.g. 4 Inch, 2-tier (optional)"
//                       onChange={(e) => updateCustomCake("variant", e.target.value)}
//                     />
//                   </div>

//                   <div className="sa-field">
//                     <label>Custom Price *</label>
//                     <input
//                       type="number"
//                       min="0"
//                       placeholder="Enter Cake Price"
//                       value={customCake.price}
//                       onChange={(e) => updateCustomCake("price", e.target.value)}
//                     />
//                   </div>

//                   <div className="sa-field sa-field-full">
//                     <label>Message</label>
//                     <input
//                       type="text"
//                       value={customCake.message}
//                       placeholder="e.g. Message to write on the cake, or a note for the baker (optional)"
//                       onChange={(e) => updateCustomCake("message", e.target.value)}
//                     />
//                   </div>

//                   <div className="sa-field sa-field-full">
//                     <label>Reference Image</label>
//                     <label
//                       htmlFor="custom-cake-img"
//                       className={`sa-img-upload ${customCake.referenceImageUrl ? "has-preview" : ""}`}
//                     >
//                       {customCake.referenceImageUrl ? (
//                         <img
//                           src={customCake.referenceImageUrl}
//                           alt="Custom cake reference"
//                           className="sa-img-preview"
//                         />
//                       ) : (
//                         <div className="sa-img-placeholder">
//                           <span>Click to upload a reference photo (optional)</span>
//                           <span className="sa-hint">PNG, JPG up to 5MB</span>
//                         </div>
//                       )}
//                       <input
//                         type="file"
//                         id="custom-cake-img"
//                         accept="image/*"
//                         className="sa-file-input"
//                         onChange={(e) => {
//                           const f = e.target.files?.[0];
//                           if (f) handleCustomCakeImageUpload(f);
//                         }}
//                       />
//                     </label>
//                     {customCakeImageUploading && (
//                       <span className="sa-hint">Uploading image…</span>
//                     )}
//                     {customCake.referenceImageUrl && !customCakeImageUploading && (
//                       <button
//                         type="button"
//                         className="sa-btn-remove-inline"
//                         onClick={() => {
//                           updateCustomCake("referenceImageUrl", "");
//                           setCustomCakeImageFile(null);
//                         }}
//                       >
//                         Remove photo
//                       </button>
//                     )}
//                   </div>
//                 </div>

//                 <div className="sa-custom-cake-actions">
//                   <button
//                     type="button"
//                     className="sa-btn sa-btn-primary"
//                     onClick={addCustomCakeToCart}
//                     disabled={customCakeImageUploading}
//                   >
//                     {customCakeImageUploading ? "Uploading image…" : "Add Custom Cake"}
//                   </button>
//                 </div>
//               </React.Fragment>
//             )}
//           </section>
//         </div>

//         {/* ── Sticky sidebar ─────────────────────────────────────────── */}
//         <aside className="sa-sidebar">
//           {/* Card 4 — Order Summary */}
//           <section className="sa-card sa-summary-card">
//             <h2 className="sa-card-title">Order Summary</h2>

//             <div className="sa-summary-row">
//               <span>Subtotal</span>
//               <span>
//                 {currency} {formatMoney(subtotal)}
//               </span>
//             </div>

//             <div className="sa-summary-row sa-summary-editable">
//               <span>Delivery Charge</span>
//               <input
//                 type="number"
//                 min={0}
//                 value={deliveryCharge}
//                 onChange={(e) => setDeliveryCharge(Number(e.target.value) || 0)}
//               />
//             </div>

//             <div className="sa-summary-row sa-summary-editable">
//               <span>Discount</span>
//               <input
//                 type="number"
//                 min={0}
//                 value={discount}
//                 onChange={(e) => setDiscount(Number(e.target.value) || 0)}
//               />
//             </div>

//             <div className="sa-summary-row sa-summary-grand-total">
//               <span>Grand Total</span>
//               <span>
//                 {currency} {formatMoney(grandTotal)}
//               </span>
//             </div>

//             <p className="sa-hint">
//               Currency: <strong>{currency}</strong> (set automatically from the selected area)
//             </p>

//             <div className="sa-payment-section">
//               <p className="sa-payment-title">Payment Method (optional)</p>
//               {(["COD", "UPI", "CARD"] as PaymentMethod[]).map((method) => (
//                 <label className="sa-radio-row" key={method}>
//                   <input
//                     type="radio"
//                     name="payment_method"
//                     checked={paymentMethod === method}
//                     onChange={() => setPaymentMethod(method)}
//                   />
//                   <span>
//                     {method === "COD" && "Cash on Delivery"}
//                     {method === "UPI" && "UPI"}
//                     {method === "CARD" && "Card"}
//                   </span>
//                 </label>
//               ))}
//               {paymentMethod === "UPI" && (
//                 <p className="sa-hint">
//                   Order will be created with payment pending — a UPI link is generated after
//                   the order is accepted.
//                 </p>
//               )}
//               {!paymentMethod && (
//                 <p className="sa-hint">
//                   Not selecting a payment method will send "-" to the backend; it can be set later.
//                 </p>
//               )}
//             </div>
//           </section>

//           {/* Action buttons */}
//           <div className="sa-action-buttons">
//             <button type="button" className="sa-btn sa-btn-ghost" onClick={handleCancel}>
//               Cancel
//             </button>
//             <button
//               type="button"
//               className="sa-btn sa-btn-primary"
//               onClick={handleCreateOrder}
//               disabled={isSubmitting}
//             >
//               {isSubmitting ? "Creating…" : "Create Order"}
//             </button>
//           </div>
//         </aside>
//       </div>

//       {/* ── Add-to-cart customization modal ─────────────────────────── */}
//       {draftSelection && (
//               <div className="sa-modal-overlay" onClick={closeDraftSelection}>
//                 <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
//                   <h3 className="sa-modal-title">{draftSelection.product.name}</h3>

//                   <div className="sa-field">
//                     <label>Quantity</label>
//                     <div className="sa-qty-control">
//                       <button type="button" className="sa-qty-btn" onClick={() => changeDraftQuantity(-1)}>
//                         −
//                       </button>
//                       <span className="sa-qty-value">{draftSelection.quantity}</span>
//                       <button type="button" className="sa-qty-btn" onClick={() => changeDraftQuantity(1)}>
//                         +
//                       </button>
//                     </div>
//                   </div>

//                   {/* Only minimal customization kept — no variants, addons, instructions, greetings */}

//                   <div className="sa-modal-actions">
//                     <button type="button" className="sa-btn sa-btn-ghost" onClick={closeDraftSelection}>
//                       Cancel
//                     </button>
//                     <button type="button" className="sa-btn sa-btn-primary" onClick={confirmAddToCart}>
//                       Add to Cart
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}

//       {/* End modal */}
//     </div>
//   );
// };

// export default SalesAgentCreateOrder;


import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import './Salesagentcreateorder.css';

// ─────────────────────────────────────────────────────────────────────────────
// EXISTING SERVICES ONLY — nothing in this file creates or modifies a service.
// ─────────────────────────────────────────────────────────────────────────────

// Order creation — real signature from services/orderService.ts
import {
  createSalesAgentOrder,
  type SalesAgentCreateOrderPayload,
  type SalesAgentOrderItem,
} from "../../services/orderService";

// Products / variants / add-ons — real signatures from services/productService.ts
import {
  getAllProducts,
  getAllAddons,
  getVariantsByProduct,
  type Product,
  type Variant,
  type Addon,
} from "../../services/productService";

// Customer search — real signature from services/userService.ts
import { searchCustomers, type Customer } from "../../services/userService";

// Areas — NOT included in the files you shared, so this import (and the
// AreaOption shape below) is an assumption. Point it at your real areas
// service/export if the path or field names differ.
import { getAreas } from "../../services/areaService";
import axios from "axios";

// =============================================================================
// ─── TYPES ───────────────────────────────────────────────────────────────────
// =============================================================================

interface CustomerInfo {
  customerName: string;
  customerPhone: string;
  customerAltPhone: string;
  customerEmail: string;
}

interface DeliveryAddressForm {
  addressLine: string; // → address_line1
  houseNo: string; // folded into address_line2
  street: string; // folded into address_line2
  areaId: number | null; // → area_id — REQUIRED for every order now
  city: string;
  state: string;
  country: string;
  landmark: string;
  deliveryNotes: string; // kept for the agent's own reference — see note below
  // Delivery date/time placed with address so delivery-specific fields are grouped
  deliveryDate: string;
  deliveryTimeSlot: string;
}

/**
 * Shape returned by getAreas(). Not provided in your service files, so this
 * is the minimal shape the UI needs (id/name to populate the dropdown,
 * currency/delivery_charge to auto-fill the summary). Adjust to match your
 * actual API response.
 */
interface AreaOption {
  id: number;
  name: string;
  currency?: string;
  delivery_charge?: number;
}

interface CartItem {
  cartId: string; // local id for list rendering only, never sent to backend
  product: Product;
  variantId: number | null;
  variantName: string;
  addonIds: number[];
  quantity: number;
  specialInstruction: string;
  giftMessage: string;
}

/**
 * Custom cake form — trimmed to exactly the fields the order should carry:
 * product name, reference image, shape, flavour, variant, custom price, message.
 */
interface CustomCakeForm {
  productName: string;
  referenceImageUrl: string;
  shape: string;
  flavour: string;
  variant: string;
  price: string;
  message: string;
}

type PaymentMethod = "COD" | "UPI" | "CARD";

interface FormErrors {
  customerName?: string;
  customerPhone?: string;
  area?: string;
  items?: string;
  customCake?: string;
}

interface DraftSelection {
  product: Product;
  variantId: number | null;
  addonIds: number[];
  quantity: number;
  specialInstruction: string;
  giftMessage: string;
}

/** Country-code option for the phone input pill */
interface CountryCodeOption {
  code: string;
  label: string;
  flag: string;
}

const CAKE_SHAPES = ["Round", "Heart", "Square", "Rectangle"];

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

/** Country codes for the recipient phone pill — add more as needed */
const COUNTRY_CODES: CountryCodeOption[] = [
  { code: "+965", label: "Kuwait", flag: "🇰🇼" },
  { code: "+971", label: "UAE", flag: "🇦🇪" },
  { code: "+966", label: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+91", label: "India", flag: "🇮🇳" },
  { code: "+973", label: "Bahrain", flag: "🇧🇭" },
  { code: "+974", label: "Qatar", flag: "🇶🇦" },
];

const CLOUD_NAME = "djwyoxnqy";
const UPLOAD_PRESET = "CakeNTake_upload";

const uploadToCloudinary = async (file: File): Promise<string> => {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", UPLOAD_PRESET);
  const res = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, data);
  return res.data.secure_url;
};

const EMPTY_CUSTOMER: CustomerInfo = {
  customerName: "",
  customerPhone: "",
  customerAltPhone: "",
  customerEmail: "",
};

const EMPTY_ADDRESS: DeliveryAddressForm = {
  addressLine: "",
  houseNo: "",
  street: "",
  areaId: null,
  city: "",
  state: "",
  country: "Kuwait",
  landmark: "",
  deliveryNotes: "",
  deliveryDate: "",
  deliveryTimeSlot: "",
};

const EMPTY_CUSTOM_CAKE: CustomCakeForm = {
  productName: "",
  referenceImageUrl: "",
  shape: "",
  flavour: "",
  variant: "",
  price: "",
  message: "",
};

const CUSTOMER_SEARCH_DEBOUNCE_MS = 400;

// =============================================================================
// ─── HELPERS ─────────────────────────────────────────────────────────────────
// =============================================================================

const makeCartId = (): string =>
  `cart_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const getUnitPrice = (product: Product, variant: Variant | null): number => {
  const base = product.price || 0;
  const modifier = variant?.price_modifier || 0;
  return base + modifier;
};

const getAddonsTotal = (addonIds: number[], allAddons: Addon[]): number =>
  addonIds.reduce((sum, id) => {
    const addon = allAddons.find((a) => a.id === id);
    return sum + (addon ? addon.price : 0);
  }, 0);

const getLineSubtotal = (
  item: CartItem,
  variant: Variant | null,
  allAddons: Addon[]
): number => {
  const unit = getUnitPrice(item.product, variant);
  const addonsTotal = getAddonsTotal(item.addonIds, allAddons);
  return (unit + addonsTotal) * item.quantity;
};

const formatMoney = (value: number): string => value.toFixed(2);

const isValidPhone = (phone: string): boolean => /\d{7,}/.test(phone.replace(/\D/g, ""));

const customerFullName = (c: Customer): string =>
  `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim();

/**
 * Any optional text field that the agent leaves blank is sent to the
 * backend as "-" instead of undefined/"" so the order can still be created
 * without every field being filled in. Only name / phone / area are
 * actually required — everything else falls back to this.
 */
const orDash = (value: string | null | undefined): string => {
  const trimmed = (value ?? "").trim();
  return trimmed ? trimmed : "-";
};

/**
 * Splits a stored phone string like "+965 5555 1234" into a known
 * country-code option and the remaining local digits. Falls back to the
 * first country in COUNTRY_CODES if nothing matches (e.g. blank/new form).
 */
const parsePhoneNumber = (
  phone: string
): { country: CountryCodeOption; local: string } => {
  const trimmed = (phone || "").trim();
  const match = COUNTRY_CODES.find((c) => trimmed.startsWith(c.code));
  if (match) {
    return { country: match, local: trimmed.slice(match.code.length).trim() };
  }
  return { country: COUNTRY_CODES[0], local: trimmed };
};

// =============================================================================
// ─── COMPONENT ───────────────────────────────────────────────────────────────
// =============================================================================

const SalesAgentCreateOrder: React.FC = () => {
  // ── Customer & address ──────────────────────────────────────────────────
  const [customer, setCustomer] = useState<CustomerInfo>(EMPTY_CUSTOMER);
  const [address, setAddress] = useState<DeliveryAddressForm>(EMPTY_ADDRESS);

  // ── Existing-customer search ────────────────────────────────────────────
  const [customerSearchTerm, setCustomerSearchTerm] = useState<string>("");
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [customerSearchLoading, setCustomerSearchLoading] = useState<boolean>(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState<boolean>(false);
  const [customerSearchError, setCustomerSearchError] = useState<string>("");

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  // ── Recipient phone pill (country code + local number) ─────────────────
  const [phoneCountry, setPhoneCountry] = useState<CountryCodeOption>(COUNTRY_CODES[0]);
  const [phoneLocalNumber, setPhoneLocalNumber] = useState<string>("");
  const [phoneDropdownOpen, setPhoneDropdownOpen] = useState<boolean>(false);
  const phoneFieldRef = useRef<HTMLDivElement | null>(null);

  // ── Areas ────────────────────────────────────────────────────────────────
  const [areas, setAreas] = useState<AreaOption[]>([]);
  const [areasLoading, setAreasLoading] = useState<boolean>(true);

  // ── Catalog data ─────────────────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [catalogLoading, setCatalogLoading] = useState<boolean>(true);
  const [catalogError, setCatalogError] = useState<string>("");
  const [productSearchTerm, setProductSearchTerm] = useState<string>("");

  // ── Cart ─────────────────────────────────────────────────────────────────
  const [cart, setCart] = useState<CartItem[]>([]);

  // ── "Add to cart" customization panel ───────────────────────────────────
  const [draftSelection, setDraftSelection] = useState<DraftSelection | null>(null);
  const [draftVariants, setDraftVariants] = useState<Variant[]>([]);
  const [draftVariantsLoading, setDraftVariantsLoading] = useState<boolean>(false);

  // ── Custom cake ──────────────────────────────────────────────────────────
  const [isCustomCake, setIsCustomCake] = useState<boolean>(false);
  const [customCake, setCustomCake] = useState<CustomCakeForm>(EMPTY_CUSTOM_CAKE);
  const [customCakeImageFile, setCustomCakeImageFile] = useState<File | null>(null);
  const [customCakeImageUploading, setCustomCakeImageUploading] = useState<boolean>(false);

  // Delivery method UI (pickup or delivery)
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [pickupDate, setPickupDate] = useState<string>("");
  const [pickupTimeSlot, setPickupTimeSlot] = useState<string>("");

  // ── Order summary / payment ─────────────────────────────────────────────
  // NOTE: subtotal / discount / grand_total / currency are shown to the agent
  // as a live preview only — SalesAgentCreateOrderPayload does not currently
  // accept these fields, so they are not sent to the backend (see buildPayload).
  const [deliveryCharge, setDeliveryCharge] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [currency, setCurrency] = useState<string>("KWD");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");

  // ── Submission state ─────────────────────────────────────────────────────
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [submitError, setSubmitError] = useState<string>("");

  // Resolved variant lookup for whatever is currently in the cart, keyed by
  // "productId:variantId" → Variant, so totals can be computed without
  // re-fetching. Populated as variants are loaded in the customization modal.
  const [variantCache, setVariantCache] = useState<Record<string, Variant>>({});

  // ── Load products, add-ons and areas on mount ───────────────────────────
  useEffect(() => {
    let cancelled = false;

    const loadCatalog = async () => {
      setCatalogLoading(true);
      setCatalogError("");
      try {
        const [productList, addonList] = await Promise.all([
          // Request products explicitly for the Sales Agent UI so the backend
          // returns the raw stored KWD values instead of converting to the
          // user's current currency.
          getAllProducts("KWD", true),
          getAllAddons(),
        ]);
        if (!cancelled) {
          setProducts(productList);
          setAddons(addonList);
        }
      } catch (err) {
        if (!cancelled) setCatalogError("Unable to load products. Please refresh and try again.");
      } finally {
        if (!cancelled) setCatalogLoading(false);
      }
    };

    const loadAreas = async () => {
      setAreasLoading(true);
      try {
        const areaList = await getAreas();
        if (!cancelled) setAreas(areaList as AreaOption[]);
      } catch (err) {
        if (!cancelled) setCatalogError((prev) => prev || "Unable to load delivery areas.");
      } finally {
        if (!cancelled) setAreasLoading(false);
      }
    };

    loadCatalog();
    loadAreas();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCustomCakeImageUpload = async (file: File) => {
    setCustomCakeImageFile(file);
    // instant local preview while the real upload happens
    updateCustomCake("referenceImageUrl", URL.createObjectURL(file));
    setCustomCakeImageUploading(true);
    try {
      const secureUrl = await uploadToCloudinary(file);
      updateCustomCake("referenceImageUrl", secureUrl);
    } catch (err) {
      updateCustomCake("referenceImageUrl", "");
      setCustomCakeImageFile(null);
      setSubmitError("Image upload failed. Please try again.");
    } finally {
      setCustomCakeImageUploading(false);
    }
  };

  // ── Debounced customer search ───────────────────────────────────────────
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    const term = customerSearchTerm.trim();
    if (!term) {
      setCustomerResults([]);
      setCustomerSearchLoading(false);
      setCustomerSearchError("");
      return;
    }

    setShowCustomerDropdown(true);
    setCustomerSearchLoading(true);
    setCustomerSearchError("");

    searchDebounceRef.current = setTimeout(async () => {
      try {
        const results = await searchCustomers(term);
        setCustomerResults(results);
      } catch (err) {
        setCustomerResults([]);
        setCustomerSearchError("Search failed. You can still enter details manually.");
      } finally {
        setCustomerSearchLoading(false);
      }
    }, CUSTOMER_SEARCH_DEBOUNCE_MS);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [customerSearchTerm]);

  // ── Close the customer dropdown on outside click ────────────────────────
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowCustomerDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Close the phone country dropdown on outside click ───────────────────
  useEffect(() => {
    const handlePhoneClickOutside = (event: MouseEvent) => {
      if (
        phoneFieldRef.current &&
        !phoneFieldRef.current.contains(event.target as Node)
      ) {
        setPhoneDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePhoneClickOutside);
    return () => document.removeEventListener("mousedown", handlePhoneClickOutside);
  }, []);

  const handleSelectCustomer = (c: Customer) => {
    const nextPhone = c.phone_no || customer.customerPhone;
    setCustomer((prev) => ({
      ...prev,
      customerName: customerFullName(c) || prev.customerName,
      customerPhone: nextPhone || prev.customerPhone,
      customerEmail: c.email || prev.customerEmail,
    }));

    // Sync the phone pill display with whatever number came back
    if (c.phone_no) {
      const { country, local } = parsePhoneNumber(c.phone_no);
      setPhoneCountry(country);
      setPhoneLocalNumber(local);
    }

    setCustomerSearchTerm("");
    setCustomerResults([]);
    setShowCustomerDropdown(false);
    setErrors((prev) => ({ ...prev, customerName: undefined, customerPhone: undefined }));
  };

  // ── Filtered product list for the POS search bar ───────────────────────
  const filteredProducts = useMemo(() => {
    if (!productSearchTerm.trim()) return products;
    const term = productSearchTerm.trim().toLowerCase();
    return products.filter((p) => (p.name || "").toLowerCase().includes(term));
  }, [products, productSearchTerm]);

  // ── Totals (preview only, see note above) ───────────────────────────────
  const subtotal = useMemo(
    () =>
      cart.reduce((sum, item) => {
        const variant = item.variantId
          ? variantCache[`${item.product.id}:${item.variantId}`] || null
          : null;
        return sum + getLineSubtotal(item, variant, addons);
      }, 0),
    [cart, addons, variantCache]
  );

  const grandTotal = useMemo(() => {
    const total = subtotal + Number(deliveryCharge || 0) - Number(discount || 0);
    return total > 0 ? total : 0;
  }, [subtotal, deliveryCharge, discount]);

  // ── Field change handlers ───────────────────────────────────────────────
  const updateCustomer = (field: keyof CustomerInfo, value: string) => {
    setCustomer((prev) => ({ ...prev, [field]: value }));
  };

  const updateAddress = (field: keyof DeliveryAddressForm, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const updateCustomCake = (field: keyof CustomCakeForm, value: string) => {
    setCustomCake((prev) => ({ ...prev, [field]: value }));
    if (field === "productName" || field === "price") {
      setErrors((prev) => ({ ...prev, customCake: undefined }));
    }
  };

  const handleAreaChange = (areaIdValue: string) => {
    const areaId = areaIdValue ? Number(areaIdValue) : null;
    setAddress((prev) => ({ ...prev, areaId }));
    setErrors((prev) => ({ ...prev, area: undefined }));

    const selectedArea = areas.find((a) => a.id === areaId);
    if (selectedArea) {
      if (selectedArea.currency) setCurrency(selectedArea.currency);
      if (typeof selectedArea.delivery_charge === "number") {
        setDeliveryCharge(selectedArea.delivery_charge);
      }
    }
  };

  // ── Recipient phone pill handlers ───────────────────────────────────────
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/[^\d\s]/g, "");
    setPhoneLocalNumber(digitsOnly);
    updateCustomer("customerPhone", `${phoneCountry.code} ${digitsOnly}`.trim());
    setErrors((prev) => ({ ...prev, customerPhone: undefined }));
  };

  const handlePhoneCountrySelect = (c: CountryCodeOption) => {
    setPhoneCountry(c);
    setPhoneDropdownOpen(false);
    updateCustomer("customerPhone", `${c.code} ${phoneLocalNumber}`.trim());
    setErrors((prev) => ({ ...prev, customerPhone: undefined }));
  };

  // ── Add-to-cart flow ─────────────────────────────────────────────────────

  /** Opens the customization panel and lazily loads variants for this product. */
  const openDraftSelection = async (product: Product) => {
    setDraftSelection({
      product,
      variantId: null,
      addonIds: [],
      quantity: 1,
      specialInstruction: "",
      giftMessage: "",
    });
    setDraftVariants([]);
    setDraftVariantsLoading(true);
    try {
      const variants = await getVariantsByProduct(product.id);
      setDraftVariants(variants);
      setVariantCache((prev) => {
        const next = { ...prev };
        variants.forEach((v) => {
          next[`${product.id}:${v.id}`] = v;
        });
        return next;
      });
      if (variants.length > 0) {
        setDraftSelection((prev) => (prev ? { ...prev, variantId: variants[0].id } : prev));
      }
    } catch (err) {
      setDraftVariants([]);
    } finally {
      setDraftVariantsLoading(false);
    }
  };

  const closeDraftSelection = () => {
    setDraftSelection(null);
    setDraftVariants([]);
  };

  const toggleDraftAddon = (addonId: number) => {
    setDraftSelection((prev) => {
      if (!prev) return prev;
      const exists = prev.addonIds.includes(addonId);
      return {
        ...prev,
        addonIds: exists
          ? prev.addonIds.filter((id) => id !== addonId)
          : [...prev.addonIds, addonId],
      };
    });
  };

  const changeDraftQuantity = (delta: number) => {
    setDraftSelection((prev) => {
      if (!prev) return prev;
      return { ...prev, quantity: Math.max(1, prev.quantity + delta) };
    });
  };

  const confirmAddToCart = () => {
    if (!draftSelection) return;

    const newItem: CartItem = {
      cartId: makeCartId(),
      product: draftSelection.product,
      variantId: null,
      variantName: "",
      addonIds: [],
      quantity: draftSelection.quantity,
      specialInstruction: "",
      giftMessage: "",
    };

    setCart((prev) => [...prev, newItem]);
    setErrors((prev) => ({ ...prev, items: undefined }));
    // show a small success toast in the page
    setSuccessMessage(`${draftSelection.product.name} added to cart`);
    setTimeout(() => setSuccessMessage(""), 2500);
    closeDraftSelection();
  };

  /** Adds the custom cake as a cart row using ONLY: product name, image,
   *  shape, flavour, variant, price, message. */
  const addCustomCakeToCart = () => {
    if (!customCake.productName.trim() || !Number(customCake.price)) {
      setErrors((prev) => ({
        ...prev,
        customCake: "Enter a product name and a custom price for the cake",
      }));
      return;
    }

    const customCakeProduct: Product = {
      id: -1, // temporary id — filtered out of `items` before sending to backend
      name: customCake.productName.trim(),
      price: Number(customCake.price || 0),
      stock: 999,
      image_url: customCake.referenceImageUrl || "",
    } as Product;

    const item: CartItem = {
      cartId: makeCartId(),
      product: customCakeProduct,
      variantId: null,
      variantName: customCake.variant.trim(),
      addonIds: [],
      quantity: 1,
      specialInstruction: "",
      giftMessage: customCake.message.trim(),
    };

    setCart((prev) => [...prev, item]);
    setErrors((prev) => ({ ...prev, items: undefined, customCake: undefined }));
  };

  // ── Cart row handlers ────────────────────────────────────────────────────
  const changeCartQuantity = (cartId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.cartId === cartId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeCartItem = (cartId: string) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  // ── Validation ───────────────────────────────────────────────────────────
  // ONLY customer name, customer phone, and area are actually required.
  // Everything else (address details, delivery/pickup date & time, payment
  // method, etc.) is optional — unfilled optional fields are sent as "-"
  // to the backend in buildPayload() below.
  const validateForm = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!customer.customerName.trim()) {
      nextErrors.customerName = "Customer name is required";
    }
    if (!customer.customerPhone.trim() || !isValidPhone(customer.customerPhone)) {
      nextErrors.customerPhone = "A valid phone number is required";
    }

    if (deliveryMethod === "delivery" && !address.areaId) {
      nextErrors.area = "Select an area";
    }

    // Items — an order still needs something in the cart to make sense.
    const hasRealItems = cart.some((item) => item.product.id !== -1);
    const hasCustomCakeInCart = cart.some((item) => item.product.id === -1);
    if (!hasRealItems && !hasCustomCakeInCart) {
      nextErrors.items = "Add at least one product, or a custom cake";
    }

    if (isCustomCake && !hasCustomCakeInCart) {
      nextErrors.customCake = "Add the custom cake to the cart before submitting";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  // ── Payload builder ──────────────────────────────────────────────────────
  // Built strictly against SalesAgentCreateOrderPayload as it exists in your
  // orderService today. Only customer_name / customer_phone / area_id are
  // guaranteed to be real values — every other optional string field falls
  // back to "-" via orDash() when the agent left it blank.
  // const buildPayload = (): SalesAgentCreateOrderPayload => {
  //   const items: SalesAgentOrderItem[] = cart
  //     .filter((item) => item.product.id !== -1) // exclude custom-cake placeholder row
  //     .map((item) => ({
  //       product_id: item.product.id,
  //       quantity: item.quantity,
  //       custom_json: {
  //         variant_id: item.variantId,
  //         variant_name: orDash(item.variantName),
  //         addon_ids: item.addonIds,
  //         special_instruction: orDash(item.specialInstruction),
  //         gift_message: orDash(item.giftMessage),
  //       },
  //     }));

  //   const custom_cake = isCustomCake
  //     ? {
  //         product_name: orDash(customCake.productName),
  //         image: orDash(customCake.referenceImageUrl),
  //         shape: orDash(customCake.shape),
  //         flavour: orDash(customCake.flavour),
  //         variant: orDash(customCake.variant),
  //         price: Number(customCake.price || 0),
  //         message: orDash(customCake.message),
  //       }
  //     : undefined;

  //   const address_line2 =
  //     [address.houseNo, address.street].filter(Boolean).join(", ");

  //   const payload: SalesAgentCreateOrderPayload = {
  //     customer_name: customer.customerName.trim(),
  //     customer_phone: customer.customerPhone.trim(),
  //     customer_email: orDash(customer.customerEmail),

  //     delivery_method: deliveryMethod === 'pickup' ? 'PICKUP' : 'DELIVERY',

  //     // Address fields only really apply to DELIVERY, but area_id is now
  //     // collected (and required) for every order regardless of method.
  //     address_line1: deliveryMethod === 'delivery' ? orDash(address.addressLine) : "-",
  //     address_line2: deliveryMethod === 'delivery' ? orDash(address_line2) : "-",
  //     landmark: deliveryMethod === 'delivery' ? orDash(address.landmark) : "-",
  //     city: deliveryMethod === 'delivery' ? orDash(address.city) : "-",
  //     state: deliveryMethod === 'delivery' ? orDash(address.state) : "-",
  //     country: deliveryMethod === 'delivery' ? orDash(address.country) : "-",
  //     area_id: address.areaId as number,

  //     // Delivery vs Pickup dates — optional, unfilled sent as "-"
  //     delivery_date: deliveryMethod === 'delivery' ? orDash(address.deliveryDate) : "-",
  //     delivery_time_slot: deliveryMethod === 'delivery' ? orDash(address.deliveryTimeSlot) : "-",

  //     pickup_date: deliveryMethod === 'pickup' ? orDash(pickupDate) : "-",
  //     pickup_time_slot: deliveryMethod === 'pickup' ? orDash(pickupTimeSlot) : "-",

  //     items,

  //     payment_method: paymentMethod ? paymentMethod : "-",
  //     order_type: "agent_order",

  //     custom_cake,
  //   } as SalesAgentCreateOrderPayload;

  //   return payload;
  // };

  // ── Payload builder ──────────────────────────────────────────────────────
// Built strictly against SalesAgentCreateOrderPayload as it exists in your
// orderService today. Only customer_name / customer_phone / area_id are
// guaranteed to be real values — other optional *text* fields fall back to
// "-" via orDash() when the agent left them blank.
//
// IMPORTANT: delivery_date / delivery_time_slot / pickup_date /
// pickup_time_slot are NOT run through orDash(). The backend parses these
// with strptime('%Y-%m-%d'), so sending "-" as a placeholder throws
// "time data '-' does not match format '%Y-%m-%d'". When left blank we
// omit the key entirely instead, via orDateField() below.
const buildPayload = (): SalesAgentCreateOrderPayload => {
  const items: SalesAgentOrderItem[] = cart
    .filter((item) => item.product.id !== -1) // exclude custom-cake placeholder row
    .map((item) => ({
      product_id: item.product.id,
      quantity: item.quantity,
      custom_json: {
        variant_id: item.variantId,
        variant_name: orDash(item.variantName),
        addon_ids: item.addonIds,
        special_instruction: orDash(item.specialInstruction),
        gift_message: orDash(item.giftMessage),
      },
    }));

  const custom_cake = isCustomCake
    ? {
        product_name: orDash(customCake.productName),
        image: orDash(customCake.referenceImageUrl),
        shape: orDash(customCake.shape),
        flavour: orDash(customCake.flavour),
        variant: orDash(customCake.variant),
        price: Number(customCake.price || 0),
        message: orDash(customCake.message),
      }
    : undefined;

  const address_line2 =
    [address.houseNo, address.street].filter(Boolean).join(", ");

  // Returns the trimmed value, or undefined if blank — never "-".
  // Use this ONLY for date / time-slot fields.
  const orDateField = (value: string | null | undefined): string | undefined => {
    const trimmed = (value ?? "").trim();
    return trimmed ? trimmed : undefined;
  };

  const payload: SalesAgentCreateOrderPayload = {
    customer_name: customer.customerName.trim(),
    customer_phone: customer.customerPhone.trim(),
    customer_email: orDash(customer.customerEmail),

    delivery_method: deliveryMethod === 'pickup' ? 'PICKUP' : 'DELIVERY',

    // Address fields only really apply to DELIVERY, but area_id is now
    // collected (and required) for every order regardless of method.
    address_line1: deliveryMethod === 'delivery' ? orDash(address.addressLine) : "-",
    address_line2: deliveryMethod === 'delivery' ? orDash(address_line2) : "-",
    landmark: deliveryMethod === 'delivery' ? orDash(address.landmark) : "-",
    city: deliveryMethod === 'delivery' ? orDash(address.city) : "-",
    state: deliveryMethod === 'delivery' ? orDash(address.state) : "-",
    country: deliveryMethod === 'delivery' ? orDash(address.country) : "-",
    area_id: address.areaId as number,

    // Delivery vs Pickup dates — optional. Blank → omit the key entirely
    // (undefined), NOT "-", because the backend parses these as real dates.
    delivery_date:
      deliveryMethod === 'delivery' ? orDateField(address.deliveryDate) : undefined,
    delivery_time_slot:
      deliveryMethod === 'delivery' ? orDateField(address.deliveryTimeSlot) : undefined,

    pickup_date:
      deliveryMethod === 'pickup' ? orDateField(pickupDate) : undefined,
    pickup_time_slot:
      deliveryMethod === 'pickup' ? orDateField(pickupTimeSlot) : undefined,

    items,

    payment_method: paymentMethod ? paymentMethod : "-",
    order_type: "agent_order",

    custom_cake,
  } as SalesAgentCreateOrderPayload;

  return payload;
};

  // ── Reset ────────────────────────────────────────────────────────────────
  const resetForm = () => {
    setCustomer(EMPTY_CUSTOMER);
    setAddress(EMPTY_ADDRESS);
    setCart([]);
    setIsCustomCake(false);
    setCustomCake(EMPTY_CUSTOM_CAKE);
    setCustomCakeImageFile(null);
    setCustomCakeImageUploading(false);
    setDeliveryCharge(0);
    setDiscount(0);
    setPaymentMethod("");
    setProductSearchTerm("");
    setCustomerSearchTerm("");
    setPickupDate("");
    setPickupTimeSlot("");
    setPhoneCountry(COUNTRY_CODES[0]);
    setPhoneLocalNumber("");
    setPhoneDropdownOpen(false);
    setErrors({});
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleCreateOrder = async () => {
    setSuccessMessage("");
    setSubmitError("");
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = buildPayload();
      await createSalesAgentOrder(payload);
      setSuccessMessage("Order Created Successfully");
      resetForm();
    } catch (err) {
      setSubmitError("Could not create the order. Please check the details and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    setSuccessMessage("");
    setSubmitError("");
  };

  // ── Render helpers ───────────────────────────────────────────────────────

  const renderProductCard = useCallback(
    (product: Product) => (
      <div className="sa-product-card" key={product.id}>
        <div className="sa-product-image-wrap">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name || "Product"} className="sa-product-image" />
          ) : (
            <div className="sa-product-image-placeholder">No Image</div>
          )}
        </div>
        <div className="sa-product-info">
          <p className="sa-product-name">{product.name}</p>
          <div className="sa-product-meta">
            <span className="sa-product-price">
              {currency} {formatMoney(product.price || 0)}
            </span>
            <span className={`sa-product-stock ${(product.stock ?? 0) <= 0 ? "sa-stock-out" : ""}`}>
              Stock: {product.stock ?? 0}
            </span>
          </div>
        </div>
        <button
          type="button"
          className="sa-btn sa-btn-add"
          disabled={(product.stock ?? 0) <= 0}
          onClick={() => openDraftSelection(product)}
        >
          Add
        </button>
      </div>
    ),
    [currency]
  );

  // =============================================================================
  // ─── JSX ─────────────────────────────────────────────────────────────────────
  // =============================================================================

  return (
    <div className="sa-page">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sa-header">
        <p className="sa-eyebrow">Sales Agent</p>
        <h1 className="sa-title">Create Customer Order</h1>
      </header>

      {successMessage && <div className="sa-toast sa-toast-success">{successMessage}</div>}
      {(submitError || catalogError) && (
        <div className="sa-toast sa-toast-error">{submitError || catalogError}</div>
      )}

      <div className="sa-layout">
        {/* ── Main column ────────────────────────────────────────────── */}
        <div className="sa-main-column">
          {/* Card 1 — Customer Information */}
          <section className="sa-card">
            <h2 className="sa-card-title">Customer Information</h2>

            {/* Existing-customer search */}
            <div className="sa-search-field" ref={searchContainerRef}>
              <label>Search Existing Customer</label>
              <div className="sa-search-input-wrap">
                <svg className="sa-search-icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  value={customerSearchTerm}
                  onChange={(e) => setCustomerSearchTerm(e.target.value)}
                  onFocus={() => {
                    if (customerSearchTerm.trim()) setShowCustomerDropdown(true);
                  }}
                  placeholder="Search by Name, Phone or Email..."
                />
                {customerSearchLoading && <span className="sa-spinner" aria-label="Searching" />}
              </div>

              {showCustomerDropdown && customerSearchTerm.trim() && (
                <div className="sa-autocomplete-dropdown">
                  {customerSearchLoading ? (
                    <div className="sa-autocomplete-status">Searching...</div>
                  ) : customerSearchError ? (
                    <div className="sa-autocomplete-status sa-autocomplete-error">
                      {customerSearchError}
                    </div>
                  ) : customerResults.length === 0 ? (
                    <div className="sa-autocomplete-status">No customer found</div>
                  ) : (
                    customerResults.map((c) => (
                      <button
                        type="button"
                        key={c.id}
                        className="sa-autocomplete-item"
                        onClick={() => handleSelectCustomer(c)}
                      >
                        <span className="sa-autocomplete-name">{customerFullName(c) || "Unnamed"}</span>
                        <span className="sa-autocomplete-meta">
                          {c.phone_no}
                          {c.email ? ` · ${c.email}` : ""}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
              <span className="sa-hint">
                Searching is optional — you can always type in a new customer's details below.
              </span>
            </div>

            <div className="sa-field-grid">
              <div className="sa-field">
                <label>Customer Name *</label>
                <input
                  type="text"
                  value={customer.customerName}
                  onChange={(e) => updateCustomer("customerName", e.target.value)}
                  placeholder="e.g. Fatima Al-Sabah"
                  className={errors.customerName ? "sa-input-error" : ""}
                />
                {errors.customerName && <span className="sa-error-text">{errors.customerName}</span>}
              </div>

              {/* ── Recipient phone pill — replaces the plain phone input ── */}
              <div className="sa-field sa-phone-field-wrap">
                <label>Customer Phone *</label>
                <div
                  className={`sa-phone-pill ${errors.customerPhone ? "sa-input-error" : ""}`}
                  ref={phoneFieldRef}
                >
                  <button
                    type="button"
                    className="sa-phone-country-select"
                    onClick={() => setPhoneDropdownOpen((o) => !o)}
                  >
                    <span className="sa-phone-flag">{phoneCountry.flag}</span>
                    <span className="sa-phone-code">{phoneCountry.code}</span>
                    <ChevronDown
                      size={16}
                      className={`sa-phone-chevron ${phoneDropdownOpen ? "open" : ""}`}
                    />
                  </button>

                  <span className="sa-phone-divider" />

                  <input
                    type="tel"
                    inputMode="numeric"
                    value={phoneLocalNumber}
                    onChange={handlePhoneNumberChange}
                    placeholder="Mobile Number"
                    className="sa-phone-number-input"
                  />

                  {phoneDropdownOpen && (
                    <div className="sa-phone-dropdown">
                      {COUNTRY_CODES.map((c) => (
                        <button
                          type="button"
                          key={c.code}
                          className="sa-phone-option"
                          onClick={() => handlePhoneCountrySelect(c)}
                        >
                          <span className="sa-phone-flag">{c.flag}</span>
                          <span>{c.label}</span>
                          <span className="sa-phone-option-code">{c.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {errors.customerPhone && <span className="sa-error-text">{errors.customerPhone}</span>}
              </div>

              <div className="sa-field">
                <label>Email</label>
                <input
                  type="email"
                  value={customer.customerEmail}
                  onChange={(e) => updateCustomer("customerEmail", e.target.value)}
                  placeholder="name@example.com (optional)"
                />
              </div>

            </div>
          </section>

          {/* Card 2 — Area, Delivery Method & Address / Pickup */}
          <section className="sa-card">
            <h2 className="sa-card-title">Area & Delivery Method</h2>

            <div className="sa-delivery-method-cards">
              <button
                type="button"
                className={`sa-delivery-card ${deliveryMethod === 'pickup' ? 'selected' : ''}`}
                onClick={() => setDeliveryMethod('pickup')}
              >
                <div className="sa-delivery-emoji">🏪</div>
                <div className="sa-delivery-label">Pickup</div>
                <div className="sa-delivery-sub">No delivery charge</div>
              </button>

              <button
                type="button"
                className={`sa-delivery-card ${deliveryMethod === 'delivery' ? 'selected' : ''}`}
                onClick={() => setDeliveryMethod('delivery')}
              >
                <div className="sa-delivery-emoji">🚚</div>
                <div className="sa-delivery-label">Delivery</div>
                <div className="sa-delivery-sub">Charge by area</div>
              </button>
            </div>

            {deliveryMethod === 'delivery' && (
              <React.Fragment>
                <div className="sa-field-grid">
                  {/* Area is required for EVERY order, delivery or pickup */}
                  <div className="sa-field">
                    <label>Area *</label>
                    <select
                      value={address.areaId ?? ""}
                      onChange={(e) => handleAreaChange(e.target.value)}
                      disabled={areasLoading}
                      className={errors.area ? "sa-input-error" : ""}
                    >
                      <option value="">{areasLoading ? "Loading areas…" : "Select an area"}</option>
                      {areas.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                    {errors.area && <span className="sa-error-text">{errors.area}</span>}
                  </div>
                  <div className="sa-field sa-field-full">
                    <label>Block</label>
                    <input
                      type="text"
                      value={address.addressLine}
                      onChange={(e) => updateAddress("addressLine", e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                  <div className="sa-field">
                    <label>House / Flat No</label>
                    <input
                      type="text"
                      value={address.houseNo}
                      onChange={(e) => updateAddress("houseNo", e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                  <div className="sa-field">
                    <label>Street</label>
                    <input
                      type="text"
                      value={address.street}
                      onChange={(e) => updateAddress("street", e.target.value)}
                      placeholder="Optional"
                    />
                  </div>

                  <div className="sa-field">
                    <label>Country</label>
                    <input
                      type="text"
                      value={address.country}
                      onChange={(e) => updateAddress("country", e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                  <div className="sa-field sa-field-full">
                    <label>Landmark</label>
                    <input
                      type="text"
                      value={address.landmark}
                      onChange={(e) => updateAddress("landmark", e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                  <div className="sa-field sa-field-full">
                    <label>Delivery Notes</label>
                    <textarea
                      rows={3}
                      value={address.deliveryNotes}
                      onChange={(e) => updateAddress("deliveryNotes", e.target.value)}
                      placeholder="Gate code, preferred entrance, etc. (optional)"
                    />
                  </div>

                  <div className="sa-field-grid">
                    <div className="sa-field">
                      <label>Delivery Date</label>
                      <input
                        type="date"
                        value={address.deliveryDate}
                        onChange={(e) => updateAddress("deliveryDate", e.target.value)}
                      />
                    </div>

                    <div className="sa-field">
                      <label>Delivery Time Slot</label>
                      <select
                        value={address.deliveryTimeSlot}
                        onChange={(e) => updateAddress("deliveryTimeSlot", e.target.value)}
                      >
                        <option value="">Select a time slot (optional)</option>
                        {TIME_SLOTS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            )}

            {deliveryMethod === 'pickup' && (
              <div className="sa-field-grid">
                <div className="sa-field">
                  <label>Pickup Date</label>
                  <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
                </div>
                <div className="sa-field">
                  <label>Pickup Time</label>
                  <select value={pickupTimeSlot} onChange={(e) => setPickupTimeSlot(e.target.value)}>
                    <option value="">Select a time slot (optional)</option>
                    {TIME_SLOTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

          </section>

          {/* Card 3 — Order Items (POS) */}
          <section className="sa-card">
            <h2 className="sa-card-title">Order Items</h2>
            {errors.items && <span className="sa-error-text">{errors.items}</span>}

            <input
              type="text"
              className="sa-search-bar"
              placeholder="Search products..."
              value={productSearchTerm}
              onChange={(e) => setProductSearchTerm(e.target.value)}
            />

            {catalogLoading ? (
              <p className="sa-muted">Loading products…</p>
            ) : (
              <div className="sa-product-grid">
                {filteredProducts.length === 0 ? (
                  <p className="sa-muted">No products match your search.</p>
                ) : (
                  filteredProducts.map(renderProductCard)
                )}
              </div>
            )}

            {/* Cart table */}
            <div className="sa-cart-table-wrap">
              <table className="sa-cart-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                    <th>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="sa-muted sa-cart-empty">
                        No items added yet.
                      </td>
                    </tr>
                  ) : (
                    cart.map((item) => {
                      const unit = item.product.price || 0;
                      const lineSubtotal = unit * item.quantity;
                      const isCustomRow = item.product.id === -1;
                      return (
                        <tr key={item.cartId}>
                          <td>
                            <div className="sa-cart-product-name">
                              {item.product.name}
                              {isCustomRow && <span className="sa-tag-custom"> (Custom Cake)</span>}
                            </div>
                          </td>
                          <td>
                            <div className="sa-qty-control">
                              <button
                                type="button"
                                className="sa-qty-btn"
                                onClick={() => changeCartQuantity(item.cartId, -1)}
                                aria-label="Decrease quantity"
                                disabled={isCustomRow}
                              >
                                −
                              </button>
                              <span className="sa-qty-value">{item.quantity}</span>
                              <button
                                type="button"
                                className="sa-qty-btn"
                                onClick={() => changeCartQuantity(item.cartId, 1)}
                                aria-label="Increase quantity"
                                disabled={isCustomRow}
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td>
                            {currency} {formatMoney(unit)}
                          </td>
                          <td>
                            {currency} {formatMoney(lineSubtotal)}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="sa-btn-remove"
                              onClick={() => removeCartItem(item.cartId)}
                              aria-label="Remove item"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Custom Cake Section — ONLY: product name, image, shape, flavour, variant, price, message */}
          <section className="sa-card">
            <label className="sa-checkbox-row">
              <input
                type="checkbox"
                checked={isCustomCake}
                onChange={(e) => setIsCustomCake(e.target.checked)}
              />
              <span>This is a Custom Cake Order</span>
            </label>

            {isCustomCake && (
              <React.Fragment>
                {errors.customCake && <span className="sa-error-text">{errors.customCake}</span>}
                <div className="sa-field-grid sa-custom-cake-grid">
                  <div className="sa-field">
                    <label>Product Name *</label>
                    <input
                      type="text"
                      value={customCake.productName}
                      placeholder="e.g. Custom Birthday Cake"
                      onChange={(e) => updateCustomCake("productName", e.target.value)}
                    />
                  </div>

                  <div className="sa-field">
                    <label>Cake Shape</label>
                    <select value={customCake.shape} onChange={(e) => updateCustomCake("shape", e.target.value)}>
                      <option value="">Select shape (optional)</option>
                      {CAKE_SHAPES.map((shape) => (
                        <option key={shape} value={shape}>
                          {shape}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sa-field">
                    <label>Flavour</label>
                    <input
                      type="text"
                      value={customCake.flavour}
                      placeholder="e.g. Chocolate, Vanilla (optional)"
                      onChange={(e) => updateCustomCake("flavour", e.target.value)}
                    />
                  </div>

                  <div className="sa-field">
                    <label>Variant</label>
                    <input
                      type="text"
                      value={customCake.variant}
                      placeholder="e.g. 4 Inch, 2-tier (optional)"
                      onChange={(e) => updateCustomCake("variant", e.target.value)}
                    />
                  </div>

                  <div className="sa-field">
                    <label>Custom Price *</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Enter Cake Price"
                      value={customCake.price}
                      onChange={(e) => updateCustomCake("price", e.target.value)}
                    />
                  </div>

                  <div className="sa-field sa-field-full">
                    <label>Message</label>
                    <input
                      type="text"
                      value={customCake.message}
                      placeholder="e.g. Message to write on the cake, or a note for the baker (optional)"
                      onChange={(e) => updateCustomCake("message", e.target.value)}
                    />
                  </div>

                  <div className="sa-field sa-field-full">
                    <label>Reference Image</label>
                    <label
                      htmlFor="custom-cake-img"
                      className={`sa-img-upload ${customCake.referenceImageUrl ? "has-preview" : ""}`}
                    >
                      {customCake.referenceImageUrl ? (
                        <img
                          src={customCake.referenceImageUrl}
                          alt="Custom cake reference"
                          className="sa-img-preview"
                        />
                      ) : (
                        <div className="sa-img-placeholder">
                          <span>Click to upload a reference photo (optional)</span>
                          <span className="sa-hint">PNG, JPG up to 5MB</span>
                        </div>
                      )}
                      <input
                        type="file"
                        id="custom-cake-img"
                        accept="image/*"
                        className="sa-file-input"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleCustomCakeImageUpload(f);
                        }}
                      />
                    </label>
                    {customCakeImageUploading && (
                      <span className="sa-hint">Uploading image…</span>
                    )}
                    {customCake.referenceImageUrl && !customCakeImageUploading && (
                      <button
                        type="button"
                        className="sa-btn-remove-inline"
                        onClick={() => {
                          updateCustomCake("referenceImageUrl", "");
                          setCustomCakeImageFile(null);
                        }}
                      >
                        Remove photo
                      </button>
                    )}
                  </div>
                </div>

                <div className="sa-custom-cake-actions">
                  <button
                    type="button"
                    className="sa-btn sa-btn-primary"
                    onClick={addCustomCakeToCart}
                    disabled={customCakeImageUploading}
                  >
                    {customCakeImageUploading ? "Uploading image…" : "Add Custom Cake"}
                  </button>
                </div>
              </React.Fragment>
            )}
          </section>
        </div>

        {/* ── Sticky sidebar ─────────────────────────────────────────── */}
        <aside className="sa-sidebar">
          {/* Card 4 — Order Summary */}
          <section className="sa-card sa-summary-card">
            <h2 className="sa-card-title">Order Summary</h2>

            <div className="sa-summary-row">
              <span>Subtotal</span>
              <span>
                {currency} {formatMoney(subtotal)}
              </span>
            </div>

            <div className="sa-summary-row sa-summary-editable">
              <span>Delivery Charge</span>
              <input
                type="number"
                min={0}
                value={deliveryCharge}
                onChange={(e) => setDeliveryCharge(Number(e.target.value) || 0)}
              />
            </div>

            <div className="sa-summary-row sa-summary-editable">
              <span>Discount</span>
              <input
                type="number"
                min={0}
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value) || 0)}
              />
            </div>

            <div className="sa-summary-row sa-summary-grand-total">
              <span>Grand Total</span>
              <span>
                {currency} {formatMoney(grandTotal)}
              </span>
            </div>

            <p className="sa-hint">
              Currency: <strong>{currency}</strong> (set automatically from the selected area)
            </p>

            <div className="sa-payment-section">
              <p className="sa-payment-title">Payment Method (optional)</p>
              {(["COD", "UPI", "CARD"] as PaymentMethod[]).map((method) => (
                <label className="sa-radio-row" key={method}>
                  <input
                    type="radio"
                    name="payment_method"
                    checked={paymentMethod === method}
                    onChange={() => setPaymentMethod(method)}
                  />
                  <span>
                    {method === "COD" && "Cash on Delivery"}
                    {method === "UPI" && "UPI"}
                    {method === "CARD" && "Card"}
                  </span>
                </label>
              ))}
              {paymentMethod === "UPI" && (
                <p className="sa-hint">
                  Order will be created with payment pending — a UPI link is generated after
                  the order is accepted.
                </p>
              )}
              {!paymentMethod && (
                <p className="sa-hint">
                  Not selecting a payment method will send "-" to the backend; it can be set later.
                </p>
              )}
            </div>
          </section>

          {/* Action buttons */}
          <div className="sa-action-buttons">
            <button type="button" className="sa-btn sa-btn-ghost" onClick={handleCancel}>
              Cancel
            </button>
            <button
              type="button"
              className="sa-btn sa-btn-primary"
              onClick={handleCreateOrder}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating…" : "Create Order"}
            </button>
          </div>
        </aside>
      </div>

      {/* ── Add-to-cart customization modal ─────────────────────────── */}
      {draftSelection && (
              <div className="sa-modal-overlay" onClick={closeDraftSelection}>
                <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
                  <h3 className="sa-modal-title">{draftSelection.product.name}</h3>

                  <div className="sa-field">
                    <label>Quantity</label>
                    <div className="sa-qty-control">
                      <button type="button" className="sa-qty-btn" onClick={() => changeDraftQuantity(-1)}>
                        −
                      </button>
                      <span className="sa-qty-value">{draftSelection.quantity}</span>
                      <button type="button" className="sa-qty-btn" onClick={() => changeDraftQuantity(1)}>
                        +
                      </button>
                    </div>
                  </div>

                  {/* Only minimal customization kept — no variants, addons, instructions, greetings */}

                  <div className="sa-modal-actions">
                    <button type="button" className="sa-btn sa-btn-ghost" onClick={closeDraftSelection}>
                      Cancel
                    </button>
                    <button type="button" className="sa-btn sa-btn-primary" onClick={confirmAddToCart}>
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            )}

      {/* End modal */}
    </div>
  );
};

export default SalesAgentCreateOrder;