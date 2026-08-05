// import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
// import "./SalesAgentCreateOrder.css";

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
//   deliveryDate: string;
//   deliveryTimeSlot: string;
// }

// interface DeliveryAddressForm {
//   addressLine: string; // → address_line1
//   houseNo: string; // folded into address_line2
//   street: string; // folded into address_line2
//   areaId: number | null; // → area_id
//   city: string;
//   state: string;
//   country: string;
//   pincode: string;
//   landmark: string;
//   deliveryNotes: string; // kept for the agent's own reference — see note below
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

// // interface CustomCakeForm {
// //   shape: string;
// //   size: string;
// //   weight: string;
// //   sponge: string;
// //   price: string;
// //   cream: string;
// //   filling: string;
// //   topper: string;
// //   messageOnCake: string;
// //   occasion: string;
// //   referenceImageUrl: string;
// //   specialDecoration: string;
// //   colorTheme: string;
// //   eggPreference: "Egg" | "Eggless";
// //   deliveryInstructions: string;
// //   extraNotes: string;
// // }

// interface CustomCakeForm {
//   referenceImageUrl: string;
//   flavour: string;
//   variant: string;
//   message: string;
//   shape: string;
//   color: string;
//   price: string;  
// }

// type PaymentMethod = "COD" | "UPI" | "CARD";

// interface FormErrors {
//   customerName?: string;
//   customerPhone?: string;
//   address?: string;
//   area?: string;
//   items?: string;
//   paymentMethod?: string;
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
//   "9:00 AM - 11:00 AM",
//   "11:00 AM - 1:00 PM",
//   "1:00 PM - 3:00 PM",
//   "3:00 PM - 5:00 PM",
//   "5:00 PM - 7:00 PM",
//   "7:00 PM - 9:00 PM",
// ];


// const CLOUD_NAME    = 'djwyoxnqy';
// const UPLOAD_PRESET = 'CakeNTake_upload';

// const uploadToCloudinary = async (file: File): Promise<string> => {
//   const data = new FormData();
//   data.append('file', file);
//   data.append('upload_preset', UPLOAD_PRESET);
//   const res = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, data);
//   return res.data.secure_url;
// };

// const EMPTY_CUSTOMER: CustomerInfo = {
//   customerName: "",
//   customerPhone: "",
//   customerAltPhone: "",
//   customerEmail: "",
//   deliveryDate: "",
//   deliveryTimeSlot: "",
// };

// const EMPTY_ADDRESS: DeliveryAddressForm = {
//   addressLine: "",
//   houseNo: "",
//   street: "",
//   areaId: null,
//   city: "",
//   state: "",
//   country: "",
//   pincode: "",
//   landmark: "",
//   deliveryNotes: "",
// };

// const EMPTY_CUSTOM_CAKE: CustomCakeForm = {
//   referenceImageUrl: "",
//   flavour: "",
//   variant: "",
//   message: "",
//   shape: "",
//   color: "",
//   price: "",
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
//           getAllProducts(),
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


//     const handleCustomCakeImageUpload = async (file: File) => {
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
//       // optional: surface an error the same way you do elsewhere
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
//       // Customer records from searchCustomers don't include an alt phone,
//       // so it's left as-is and stays editable.
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
//       // Cache each variant so cart totals can resolve price modifiers later.
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
//     const variant = draftVariants.find((v) => v.id === draftSelection.variantId) || null;

//     const newItem: CartItem = {
//       cartId: makeCartId(),
//       product: draftSelection.product,
//       variantId: variant ? variant.id : null,
//       variantName: variant ? variant.name : "",
//       addonIds: draftSelection.addonIds,
//       quantity: draftSelection.quantity,
//       specialInstruction: draftSelection.specialInstruction,
//       giftMessage: draftSelection.giftMessage,
//     };

//     setCart((prev) => [...prev, newItem]);
//     setErrors((prev) => ({ ...prev, items: undefined }));
//     closeDraftSelection();
//   };

//   const addCustomCakeToCart = () => {
//   const customCakeProduct: Product = {
//     id: -1, // temporary id
//     name: "Custom Cake",
//     price: Number(customCake.price || 0),
//     stock: 999,
//     image_url: "",
//   } as Product;

//   const item: CartItem = {
//     cartId: makeCartId(),
//     product: customCakeProduct,
//     variantId: null,
//     variantName: "",
//     addonIds: [],
//     quantity: 1,
//     specialInstruction: customCake.extraNotes,
//     giftMessage: customCake.messageOnCake,
//   };

//   setCart((prev) => [...prev, item]);
// };

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
//   const validateForm = (): boolean => {
//     const nextErrors: FormErrors = {};

//     if (!customer.customerName.trim()) {
//       nextErrors.customerName = "Customer name is required";
//     }
//     if (!customer.customerPhone.trim() || !isValidPhone(customer.customerPhone)) {
//       nextErrors.customerPhone = "A valid phone number is required";
//     }
//     if (!address.addressLine.trim() && !address.city.trim()) {
//       nextErrors.address = "Delivery address is required";
//     }
//     if (!address.areaId) {
//       nextErrors.area = "Select a delivery area";
//     }
//     // if (cart.length === 0) {
//     //   nextErrors.items = "Add at least one product";
//     // }

//     const hasRealItems = cart.some((item) => item.product.id !== -1);
// if (!hasRealItems && !isCustomCake) {
//   nextErrors.items = "Add at least one product, or a custom cake";
// }

//     if (!paymentMethod) {
//       nextErrors.paymentMethod = "Select a payment method";
//     }

//     setErrors(nextErrors);
//     return Object.keys(nextErrors).length === 0;
//   };

//   // ── Payload builder ──────────────────────────────────────────────────────
//   // Built strictly against SalesAgentCreateOrderPayload as it exists in your
//   // orderService today. Fields you asked for that don't have a home in that
//   // interface (order_source, delivery_address_json, subtotal, discount,
//   // grand_total, total, currency, per-item variant_id/addon_ids/instructions)
//   // are folded into address_line2 / custom_json / custom_cake where possible,
//   // and otherwise simply aren't transmitted — see the summary at the end of
//   // this response for the full list.
//   const buildPayload = (): SalesAgentCreateOrderPayload => {
//     // const items: SalesAgentOrderItem[] = cart.map((item) => ({
//     //   product_id: item.product.id,
//     //   quantity: item.quantity,
//     //   custom_json: {
//     //     variant_id: item.variantId,
//     //     variant_name: item.variantName || undefined,
//     //     addon_ids: item.addonIds,
//     //     special_instruction: item.specialInstruction || undefined,
//     //     gift_message: item.giftMessage || undefined,
//     //   },
//     // }));

//     const items: SalesAgentOrderItem[] = cart
//   .filter((item) => item.product.id !== -1) // exclude custom-cake placeholder row
//   .map((item) => ({
//     product_id: item.product.id,
//     quantity: item.quantity,
//     custom_json: {
//       variant_id: item.variantId,
//       variant_name: item.variantName || undefined,
//       addon_ids: item.addonIds,
//       special_instruction: item.specialInstruction || undefined,
//       gift_message: item.giftMessage || undefined,
//     },
//   }));

//     const custom_cake = isCustomCake
//       ? {
//           shape: customCake.shape || undefined,
//           size: customCake.size || undefined,
//           weight: customCake.weight || undefined,
//           flavour:
//             [customCake.sponge, customCake.cream, customCake.filling]
//               .filter(Boolean)
//               .join(" / ") || undefined,
//           colour: customCake.colorTheme || undefined,
//           message: customCake.messageOnCake || undefined,
//           image: customCake.referenceImageUrl || undefined,
//           price: Number(customCake.price || 0),
//           notes:
//             [
//               customCake.occasion && `Occasion: ${customCake.occasion}`,
//               customCake.topper && `Topper: ${customCake.topper}`,
//               customCake.specialDecoration && `Decoration: ${customCake.specialDecoration}`,
//               `Preference: ${customCake.eggPreference}`,
//               customCake.deliveryInstructions && `Delivery: ${customCake.deliveryInstructions}`,
//               customCake.extraNotes,
//             ]
//               .filter(Boolean)
//               .join(" | ") || undefined,
//         }
//       : undefined;

//     const address_line2 =
//       [address.houseNo, address.street].filter(Boolean).join(", ") || undefined;

//     const payload: SalesAgentCreateOrderPayload = {
//       customer_name: customer.customerName.trim(),
//       customer_phone: customer.customerPhone.trim(),
//       customer_email: customer.customerEmail.trim() || undefined,
//     //   customer_alt_phone: customer.customerAltPhone.trim() || undefined,

//       address_line1: address.addressLine.trim(),
//       address_line2,
//       landmark: address.landmark.trim() || undefined,
//       city: address.city.trim(),
//       state: address.state.trim(),
//       country: address.country.trim(),
//       pincode: address.pincode.trim(),
//       area_id: address.areaId as number,

//       items,

//       delivery_date: customer.deliveryDate || undefined,
//       delivery_time_slot: customer.deliveryTimeSlot || undefined,

//       payment_method: paymentMethod || undefined,
//       order_type: "agent_order",

//       custom_cake,
//     };

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

//               {/* <div className="sa-field">
//                 <label>Alternate Phone</label>
//                 <input
//                   type="tel"
//                   value={customer.customerAltPhone}
//                   onChange={(e) => updateCustomer("customerAltPhone", e.target.value)}
//                   placeholder="Optional"
//                 />
//               </div> */}

//               <div className="sa-field">
//                 <label>Email</label>
//                 <input
//                   type="email"
//                   value={customer.customerEmail}
//                   onChange={(e) => updateCustomer("customerEmail", e.target.value)}
//                   placeholder="name@example.com"
//                 />
//               </div>

//               <div className="sa-field">
//                 <label>Delivery Date</label>
//                 <input
//                   type="date"
//                   value={customer.deliveryDate}
//                   onChange={(e) => updateCustomer("deliveryDate", e.target.value)}
//                 />
//               </div>

//               <div className="sa-field">
//                 <label>Delivery Time Slot</label>
//                 <select
//                   value={customer.deliveryTimeSlot}
//                   onChange={(e) => updateCustomer("deliveryTimeSlot", e.target.value)}
//                 >
//                   <option value="">Select a time slot</option>
//                   {TIME_SLOTS.map((slot) => (
//                     <option key={slot} value={slot}>
//                       {slot}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//           </section>

//           {/* Card 2 — Delivery Address */}
//           <section className="sa-card">
//             <h2 className="sa-card-title">Delivery Address</h2>
//             {errors.address && <span className="sa-error-text">{errors.address}</span>}
//             <div className="sa-field-grid">
//               <div className="sa-field sa-field-full">
//                 <label>Address Line</label>
//                 <input
//                   type="text"
//                   value={address.addressLine}
//                   onChange={(e) => updateAddress("addressLine", e.target.value)}
//                 />
//               </div>
//               <div className="sa-field">
//                 <label>House / Flat No</label>
//                 <input
//                   type="text"
//                   value={address.houseNo}
//                   onChange={(e) => updateAddress("houseNo", e.target.value)}
//                 />
//               </div>
//               <div className="sa-field">
//                 <label>Street</label>
//                 <input
//                   type="text"
//                   value={address.street}
//                   onChange={(e) => updateAddress("street", e.target.value)}
//                 />
//               </div>
//               <div className="sa-field">
//                 <label>Area *</label>
//                 <select
//                   value={address.areaId ?? ""}
//                   onChange={(e) => handleAreaChange(e.target.value)}
//                   disabled={areasLoading}
//                   className={errors.area ? "sa-input-error" : ""}
//                 >
//                   <option value="">{areasLoading ? "Loading areas…" : "Select an area"}</option>
//                   {areas.map((a) => (
//                     <option key={a.id} value={a.id}>
//                       {a.name}
//                     </option>
//                   ))}
//                 </select>
//                 {errors.area && <span className="sa-error-text">{errors.area}</span>}
//               </div>
//               <div className="sa-field">
//                 <label>City</label>
//                 <input
//                   type="text"
//                   value={address.city}
//                   onChange={(e) => updateAddress("city", e.target.value)}
//                 />
//               </div>
//               <div className="sa-field">
//                 <label>State</label>
//                 <input
//                   type="text"
//                   value={address.state}
//                   onChange={(e) => updateAddress("state", e.target.value)}
//                 />
//               </div>
//               <div className="sa-field">
//                 <label>Country</label>
//                 <input
//                   type="text"
//                   value={address.country}
//                   onChange={(e) => updateAddress("country", e.target.value)}
//                 />
//               </div>
//               <div className="sa-field">
//                 <label>Pincode</label>
//                 <input
//                   type="text"
//                   value={address.pincode}
//                   onChange={(e) => updateAddress("pincode", e.target.value)}
//                 />
//               </div>
//               <div className="sa-field sa-field-full">
//                 <label>Landmark</label>
//                 <input
//                   type="text"
//                   value={address.landmark}
//                   onChange={(e) => updateAddress("landmark", e.target.value)}
//                 />
//               </div>
//               <div className="sa-field sa-field-full">
//                 <label>Delivery Notes</label>
//                 <textarea
//                   rows={3}
//                   value={address.deliveryNotes}
//                   onChange={(e) => updateAddress("deliveryNotes", e.target.value)}
//                   placeholder="Gate code, preferred entrance, etc. (kept for agent reference — see note in the accompanying message)"
//                 />
//               </div>
//             </div>
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
//                     <th>Variant</th>
//                     <th>Addons</th>
//                     <th>Quantity</th>
//                     <th>Price</th>
//                     <th>Subtotal</th>
//                     <th>Remove</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {cart.length === 0 ? (
//                     <tr>
//                       <td colSpan={7} className="sa-muted sa-cart-empty">
//                         No items added yet.
//                       </td>
//                     </tr>
//                   ) : (
//                     cart.map((item) => {
//                       const variant = item.variantId
//                         ? variantCache[`${item.product.id}:${item.variantId}`] || null
//                         : null;
//                       const unit = getUnitPrice(item.product, variant);
//                       const addonsTotal = getAddonsTotal(item.addonIds, addons);
//                       const lineSubtotal = getLineSubtotal(item, variant, addons);
//                       const addonNames = item.addonIds
//                         .map((id) => addons.find((a) => a.id === id)?.name)
//                         .filter(Boolean)
//                         .join(", ");
//                       return (
//                         <tr key={item.cartId}>
//                           <td>
//                             <div className="sa-cart-product-name">{item.product.name}</div>
//                             {item.specialInstruction && (
//                               <div className="sa-cart-note">Note: {item.specialInstruction}</div>
//                             )}
//                             {item.giftMessage && (
//                               <div className="sa-cart-note">Gift: {item.giftMessage}</div>
//                             )}
//                           </td>
//                           <td>{item.variantName || "—"}</td>
//                           <td>{addonNames || "—"}</td>
//                           <td>
//                             <div className="sa-qty-control">
//                               <button
//                                 type="button"
//                                 className="sa-qty-btn"
//                                 onClick={() => changeCartQuantity(item.cartId, -1)}
//                                 aria-label="Decrease quantity"
//                               >
//                                 −
//                               </button>
//                               <span className="sa-qty-value">{item.quantity}</span>
//                               <button
//                                 type="button"
//                                 className="sa-qty-btn"
//                                 onClick={() => changeCartQuantity(item.cartId, 1)}
//                                 aria-label="Increase quantity"
//                               >
//                                 +
//                               </button>
//                             </div>
//                           </td>
//                           <td>
//                             {currency} {formatMoney(unit + addonsTotal)}
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

//           {/* Custom Cake Section */}
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
//               <div className="sa-field-grid sa-custom-cake-grid">
//                 <div className="sa-field">
//                   <label>Cake Shape</label>
//                   <select value={customCake.shape} onChange={(e) => updateCustomCake("shape", e.target.value)}>
//                     <option value="">Select shape</option>
//                     {CAKE_SHAPES.map((shape) => (
//                       <option key={shape} value={shape}>
//                         {shape}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 {/* <div className="sa-field">
//                   <label>Cake Size</label>
//                   <input type="text" value={customCake.size} placeholder="e.g. 8 inch" onChange={(e) => updateCustomCake("size", e.target.value)} />
//                 </div> */}
//                 {/* <div className="sa-field">
//                   <label>Weight</label>
//                   <input type="text" value={customCake.weight} placeholder="e.g. 1.5 kg" onChange={(e) => updateCustomCake("weight", e.target.value)} />
//                 </div> */}
//                 {/* <div className="sa-field">
//                   <label>Sponge</label>
//                   <input type="text" value={customCake.sponge} placeholder="e.g. Vanilla" onChange={(e) => updateCustomCake("sponge", e.target.value)} />
//                 </div> */}
//                 {/* <div className="sa-field">
//                   <label>Cream</label>
//                   <input type="text" value={customCake.cream} placeholder="e.g. Whipped cream" onChange={(e) => updateCustomCake("cream", e.target.value)} />
//                 </div> */}
//                 {/* <div className="sa-field">
//                   <label>Filling</label>
//                   <input type="text" value={customCake.filling} placeholder="e.g. Strawberry compote" onChange={(e) => updateCustomCake("filling", e.target.value)} />
//                 </div> */}
//                 {/* <div className="sa-field">
//                   <label>Topper</label>
//                   <input type="text" value={customCake.topper} onChange={(e) => updateCustomCake("topper", e.target.value)} />
//                 </div> */}
//                 {/* <div className="sa-field">
//                   <label>Occasion</label>
//                   <input type="text" value={customCake.occasion} placeholder="e.g. Birthday, Anniversary" onChange={(e) => updateCustomCake("occasion", e.target.value)} />
//                 </div> */}
//                 <div className="sa-field">
//   <label>Custom Price *</label>

//   <input
//     type="number"
//     min="0"
//     placeholder="Enter Cake Price"
//     value={customCake.price}
//     onChange={(e) =>
//       updateCustomCake("price", e.target.value)
//     }
//   />
// </div>
//                 <div className="sa-field sa-field-full">
//                   <label>Message on Cake</label>
//                   <input type="text" value={customCake.messageOnCake} onChange={(e) => updateCustomCake("messageOnCake", e.target.value)} />
//                 </div>
//                 {/* <div className="sa-field sa-field-full">
//                   <label>Reference Image URL</label>
//                   <input
//                     type="url"
//                     value={customCake.referenceImageUrl}
//                     placeholder="https://…"
//                     onChange={(e) => updateCustomCake("referenceImageUrl", e.target.value)}
//                   />
//                   <span className="sa-hint">Paste a link only — image upload is not supported here.</span>
//                 </div> */}
//                 <div className="sa-field sa-field-full">
//                   <label>Reference Image</label>
//                   <label
//                     htmlFor="custom-cake-img"
//                     className={`sa-img-upload ${customCake.referenceImageUrl ? "has-preview" : ""}`}
//                   >
//                     {customCake.referenceImageUrl ? (
//                       <img
//                         src={customCake.referenceImageUrl}
//                         alt="Custom cake reference"
//                         className="sa-img-preview"
//                       />
//                     ) : (
//                       <div className="sa-img-placeholder">
//                         <span>Click to upload a reference photo</span>
//                         <span className="sa-hint">PNG, JPG up to 5MB</span>
//                       </div>
//                     )}
//                     <input
//                       type="file"
//                       id="custom-cake-img"
//                       accept="image/*"
//                       className="sa-file-input"
//                       onChange={(e) => {
//                         const f = e.target.files?.[0];
//                         if (f) handleCustomCakeImageUpload(f);
//                       }}
//                     />
//                   </label>
//                   {customCakeImageUploading && (
//                     <span className="sa-hint">Uploading image…</span>
//                   )}
//                   {customCake.referenceImageUrl && !customCakeImageUploading && (
//                     <button
//                       type="button"
//                       className="sa-btn-remove-inline"
//                       onClick={() => {
//                         updateCustomCake("referenceImageUrl", "");
//                         setCustomCakeImageFile(null);
//                       }}
//                     >
//                       Remove photo
//                     </button>
//                   )}
//                 </div>
//                 {/* <div className="sa-field">
//                   <label>Special Decoration</label>
//                   <input type="text" value={customCake.specialDecoration} onChange={(e) => updateCustomCake("specialDecoration", e.target.value)} />
//                 </div> */}
//                 <div className="sa-field">
//                   <label>Color Theme</label>
//                   <input type="text" value={customCake.colorTheme} placeholder="e.g. Pastel pink & gold" onChange={(e) => updateCustomCake("colorTheme", e.target.value)} />
//                 </div>
//                 <div className="sa-field">
//                   <label>Egg / Eggless</label>
//                   <select
//                     value={customCake.eggPreference}
//                     onChange={(e) => updateCustomCake("eggPreference", e.target.value as "Egg" | "Eggless")}
//                   >
//                     <option value="Egg">Egg</option>
//                     <option value="Eggless">Eggless</option>
//                   </select>
//                 </div>
//                 {/* <div className="sa-field sa-field-full">
//                   <label>Delivery Instructions</label>
//                   <textarea rows={2} value={customCake.deliveryInstructions} onChange={(e) => updateCustomCake("deliveryInstructions", e.target.value)} />
//                 </div> */}
//                 {/* <div className="sa-field sa-field-full">
//                   <label>Extra Notes</label>
//                   <textarea rows={2} value={customCake.extraNotes} onChange={(e) => updateCustomCake("extraNotes", e.target.value)} />
//                 </div> */}
//               </div>
//             )}
//           </section>
//           {/* <div className="sa-custom-cake-actions">
//   <button
//     type="button"
//     className="sa-btn sa-btn-primary"
//     onClick={addCustomCakeToCart}
//   >
//     Add Custom Cake
//   </button>
// </div> */}
//         <div className="sa-custom-cake-actions">
//   <button
//     type="button"
//     className="sa-btn sa-btn-primary"
//     onClick={addCustomCakeToCart}
//     disabled={customCakeImageUploading}
//   >
//     {customCakeImageUploading ? "Uploading image…" : "Add Custom Cake"}
//   </button>
// </div>


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
//               <p className="sa-payment-title">Payment Method</p>
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
//                   Payment will be processed via Razorpay / Tap after the order is created.
//                 </p>
//               )}
//               {errors.paymentMethod && <span className="sa-error-text">{errors.paymentMethod}</span>}
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
//         <div className="sa-modal-overlay" onClick={closeDraftSelection}>
//           <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
//             <h3 className="sa-modal-title">{draftSelection.product.name}</h3>

//             <div className="sa-field">
//               <label>Variant</label>
//               {draftVariantsLoading ? (
//                 <p className="sa-muted">Loading variants…</p>
//               ) : draftVariants.length === 0 ? (
//                 <p className="sa-muted">No variants for this product.</p>
//               ) : (
//                 <select
//                   value={draftSelection.variantId ?? ""}
//                   onChange={(e) =>
//                     setDraftSelection((prev) => (prev ? { ...prev, variantId: Number(e.target.value) } : prev))
//                   }
//                 >
//                   {draftVariants.map((v) => (
//                     <option key={v.id} value={v.id}>
//                       {v.name}
//                       {v.price_modifier ? ` (+${formatMoney(v.price_modifier)})` : ""}
//                     </option>
//                   ))}
//                 </select>
//               )}
//             </div>

//             {addons.length > 0 && (
//               <div className="sa-field">
//                 <label>Add-ons</label>
//                 <div className="sa-addon-list">
//                   {addons.map((addon) => (
//                     <label className="sa-checkbox-row" key={addon.id}>
//                       <input
//                         type="checkbox"
//                         checked={draftSelection.addonIds.includes(addon.id)}
//                         onChange={() => toggleDraftAddon(addon.id)}
//                       />
//                       <span>
//                         {addon.name} (+{formatMoney(addon.price)})
//                       </span>
//                     </label>
//                   ))}
//                 </div>
//               </div>
//             )}

//             <div className="sa-field">
//               <label>Quantity</label>
//               <div className="sa-qty-control">
//                 <button type="button" className="sa-qty-btn" onClick={() => changeDraftQuantity(-1)}>
//                   −
//                 </button>
//                 <span className="sa-qty-value">{draftSelection.quantity}</span>
//                 <button type="button" className="sa-qty-btn" onClick={() => changeDraftQuantity(1)}>
//                   +
//                 </button>
//               </div>
//             </div>

//             <div className="sa-field">
//               <label>Special Instructions</label>
//               <textarea
//                 rows={2}
//                 value={draftSelection.specialInstruction}
//                 onChange={(e) =>
//                   setDraftSelection((prev) => (prev ? { ...prev, specialInstruction: e.target.value } : prev))
//                 }
//               />
//             </div>

//             <div className="sa-field">
//               <label>Gift Message</label>
//               <textarea
//                 rows={2}
//                 value={draftSelection.giftMessage}
//                 onChange={(e) =>
//                   setDraftSelection((prev) => (prev ? { ...prev, giftMessage: e.target.value } : prev))
//                 }
//               />
//             </div>

//             <div className="sa-modal-actions">
//               <button type="button" className="sa-btn sa-btn-ghost" onClick={closeDraftSelection}>
//                 Cancel
//               </button>
//               <button type="button" className="sa-btn sa-btn-primary" onClick={confirmAddToCart}>
//                 Add to Cart
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SalesAgentCreateOrder;



import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
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
  areaId: number | null; // → area_id
  city: string;
  state: string;
  country: string;
  pincode: string;
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
  address?: string;
  area?: string;
  items?: string;
  paymentMethod?: string;
  customCake?: string;
  // delivery/pickup specific errors
  deliveryDate?: string;
  deliveryTimeSlot?: string;
  pickupDate?: string;
  pickupTimeSlot?: string;
}

interface DraftSelection {
  product: Product;
  variantId: number | null;
  addonIds: number[];
  quantity: number;
  specialInstruction: string;
  giftMessage: string;
}

const CAKE_SHAPES = ["Round", "Heart", "Square", "Rectangle"];
const TIME_SLOTS = [
  "9:00 AM - 11:00 AM",
  "11:00 AM - 1:00 PM",
  "1:00 PM - 3:00 PM",
  "3:00 PM - 5:00 PM",
  "5:00 PM - 7:00 PM",
  "7:00 PM - 9:00 PM",
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
  pincode: "",
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

  const handleSelectCustomer = (c: Customer) => {
    setCustomer((prev) => ({
      ...prev,
      customerName: customerFullName(c) || prev.customerName,
      customerPhone: c.phone_no || prev.customerPhone,
      customerEmail: c.email || prev.customerEmail,
    }));
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
  const validateForm = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!customer.customerName.trim()) {
      nextErrors.customerName = "Customer name is required";
    }
    if (!customer.customerPhone.trim() || !isValidPhone(customer.customerPhone)) {
      nextErrors.customerPhone = "A valid phone number is required";
    }
    // Validate customer basics
    if (!customer.customerName.trim()) {
      nextErrors.customerName = "Customer name is required";
    }
    if (!customer.customerPhone.trim() || !isValidPhone(customer.customerPhone)) {
      nextErrors.customerPhone = "A valid phone number is required";
    }

    // Items
    const hasRealItems = cart.some((item) => item.product.id !== -1);
    const hasCustomCakeInCart = cart.some((item) => item.product.id === -1);
    if (!hasRealItems && !hasCustomCakeInCart) {
      nextErrors.items = "Add at least one product, or a custom cake";
    }

    if (isCustomCake && !hasCustomCakeInCart) {
      nextErrors.customCake = "Add the custom cake to the cart before submitting";
    }

    // Delivery vs Pickup validation
    if (deliveryMethod === 'delivery') {
      if (!address.addressLine.trim()) {
        nextErrors.address = "Delivery address is required";
      }
      if (!address.areaId) {
        nextErrors.area = "Select a delivery area";
      }
      // delivery date/time now live on the address form
      if (!address.deliveryDate) nextErrors.deliveryDate = "Select a delivery date" as any;
      if (!address.deliveryTimeSlot) nextErrors.deliveryTimeSlot = "Select a delivery time" as any;
    } else {
      // pickup
      if (!pickupDate) nextErrors.pickupDate = "Select a pickup date" as any;
      if (!pickupTimeSlot) nextErrors.pickupTimeSlot = "Select a pickup time" as any;
    }

    // Payment (kept as existing behaviour)
    if (!paymentMethod) {
      nextErrors.paymentMethod = "Select a payment method";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  // ── Payload builder ──────────────────────────────────────────────────────
  // Built strictly against SalesAgentCreateOrderPayload as it exists in your
  // orderService today. custom_cake now only carries: product_name, image,
  // shape, flavour, variant, price, message.
  const buildPayload = (): SalesAgentCreateOrderPayload => {
    const items: SalesAgentOrderItem[] = cart
      .filter((item) => item.product.id !== -1) // exclude custom-cake placeholder row
      .map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        custom_json: {
          variant_id: item.variantId,
          variant_name: item.variantName || undefined,
          addon_ids: item.addonIds,
          special_instruction: item.specialInstruction || undefined,
          gift_message: item.giftMessage || undefined,
        },
      }));

    const custom_cake = isCustomCake
      ? {
          product_name: customCake.productName.trim() || undefined,
          image: customCake.referenceImageUrl || undefined,
          shape: customCake.shape || undefined,
          flavour: customCake.flavour.trim() || undefined,
          variant: customCake.variant.trim() || undefined,
          price: Number(customCake.price || 0),
          message: customCake.message.trim() || undefined,
        }
      : undefined;

    const address_line2 =
      [address.houseNo, address.street].filter(Boolean).join(", ") || undefined;

    const payload: SalesAgentCreateOrderPayload = {
      customer_name: customer.customerName.trim(),
      customer_phone: customer.customerPhone.trim(),
      customer_email: customer.customerEmail.trim() || undefined,

      delivery_method: deliveryMethod === 'pickup' ? 'PICKUP' : 'DELIVERY',

      // Address fields only for DELIVERY
      address_line1: deliveryMethod === 'delivery' ? address.addressLine.trim() : undefined,
      address_line2: deliveryMethod === 'delivery' ? address_line2 : undefined,
      landmark: deliveryMethod === 'delivery' ? address.landmark.trim() || undefined : undefined,
      // city/state intentionally not required for agent flow — keep values if present
      city: deliveryMethod === 'delivery' ? address.city.trim() : undefined,
      state: deliveryMethod === 'delivery' ? address.state.trim() : undefined,
      country: deliveryMethod === 'delivery' ? address.country.trim() : "Kuwait",
      pincode: deliveryMethod === 'delivery' ? address.pincode.trim() : undefined,
      area_id: deliveryMethod === 'delivery' ? (address.areaId as number) : undefined,

      // Delivery vs Pickup dates
      delivery_date: deliveryMethod === 'delivery' ? (address.deliveryDate || undefined) : undefined,
      delivery_time_slot: deliveryMethod === 'delivery' ? (address.deliveryTimeSlot || undefined) : undefined,

      pickup_date: deliveryMethod === 'pickup' ? (pickupDate || undefined) : undefined,
      pickup_time_slot: deliveryMethod === 'pickup' ? (pickupTimeSlot || undefined) : undefined,

      items,

      payment_method: paymentMethod || undefined,
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

              <div className="sa-field">
                <label>Customer Phone *</label>
                <input
                  type="tel"
                  value={customer.customerPhone}
                  onChange={(e) => updateCustomer("customerPhone", e.target.value)}
                  placeholder="e.g. +965 5555 1234"
                  className={errors.customerPhone ? "sa-input-error" : ""}
                />
                {errors.customerPhone && <span className="sa-error-text">{errors.customerPhone}</span>}
              </div>

              <div className="sa-field">
                <label>Email</label>
                <input
                  type="email"
                  value={customer.customerEmail}
                  onChange={(e) => updateCustomer("customerEmail", e.target.value)}
                  placeholder="name@example.com"
                />
              </div>

            </div>
          </section>

          {/* Card 2 — Delivery Method & Address / Pickup */}
          <section className="sa-card">
            <h2 className="sa-card-title">Delivery Method</h2>

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
                {errors.address && <span className="sa-error-text">{errors.address}</span>}

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

                <div className="sa-field-grid">
                  <div className="sa-field sa-field-full">
                    <label>Address Line</label>
                    <input
                      type="text"
                      value={address.addressLine}
                      onChange={(e) => updateAddress("addressLine", e.target.value)}
                    />
                  </div>
                  <div className="sa-field">
                    <label>House / Flat No</label>
                    <input
                      type="text"
                      value={address.houseNo}
                      onChange={(e) => updateAddress("houseNo", e.target.value)}
                    />
                  </div>
                  <div className="sa-field">
                    <label>Street</label>
                    <input
                      type="text"
                      value={address.street}
                      onChange={(e) => updateAddress("street", e.target.value)}
                    />
                  </div>

                  <div className="sa-field">
                    <label>Country</label>
                    <input
                      type="text"
                      value={address.country}
                      onChange={(e) => updateAddress("country", e.target.value)}
                    />
                  </div>
                  <div className="sa-field">
                    <label>Pincode</label>
                    <input
                      type="text"
                      value={address.pincode}
                      onChange={(e) => updateAddress("pincode", e.target.value)}
                    />
                  </div>
                  <div className="sa-field sa-field-full">
                    <label>Landmark</label>
                    <input
                      type="text"
                      value={address.landmark}
                      onChange={(e) => updateAddress("landmark", e.target.value)}
                    />
                  </div>
                  <div className="sa-field sa-field-full">
                    <label>Delivery Notes</label>
                    <textarea
                      rows={3}
                      value={address.deliveryNotes}
                      onChange={(e) => updateAddress("deliveryNotes", e.target.value)}
                      placeholder="Gate code, preferred entrance, etc."
                    />
                  </div>

                  <div className="sa-field-grid">
                    <div className="sa-field">
                      <label>Delivery Date *</label>
                      <input
                        type="date"
                        value={address.deliveryDate}
                        onChange={(e) => updateAddress("deliveryDate", e.target.value)}
                      />
                      {errors.deliveryDate && <span className="sa-error-text">{errors.deliveryDate}</span>}
                    </div>

                    <div className="sa-field">
                      <label>Delivery Time Slot *</label>
                      <select
                        value={address.deliveryTimeSlot}
                        onChange={(e) => updateAddress("deliveryTimeSlot", e.target.value)}
                      >
                        <option value="">Select a time slot</option>
                        {TIME_SLOTS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {errors.deliveryTimeSlot && <span className="sa-error-text">{errors.deliveryTimeSlot}</span>}
                    </div>
                  </div>
                  </div>

                </React.Fragment>
            )}

            {deliveryMethod === 'pickup' && (
              <div className="sa-field-grid">
                <div className="sa-field">
                  <label>Pickup Date *</label>
                  <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
                  {errors.pickupDate && <span className="sa-error-text">{errors.pickupDate}</span>}
                </div>
                <div className="sa-field">
                  <label>Pickup Time *</label>
                  <select value={pickupTimeSlot} onChange={(e) => setPickupTimeSlot(e.target.value)}>
                    <option value="">Select a time slot</option>
                    {TIME_SLOTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {errors.pickupTimeSlot && <span className="sa-error-text">{errors.pickupTimeSlot}</span>}
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
                      <option value="">Select shape</option>
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
                      placeholder="e.g. Chocolate, Vanilla"
                      onChange={(e) => updateCustomCake("flavour", e.target.value)}
                    />
                  </div>

                  <div className="sa-field">
                    <label>Variant</label>
                    <input
                      type="text"
                      value={customCake.variant}
                      placeholder="e.g. 1kg, 2-tier"
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
                      placeholder="e.g. Message to write on the cake, or a note for the baker"
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
                          <span>Click to upload a reference photo</span>
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
              <p className="sa-payment-title">Payment Method</p>
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
              {errors.paymentMethod && <span className="sa-error-text">{errors.paymentMethod}</span>}
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