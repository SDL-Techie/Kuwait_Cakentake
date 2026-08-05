// import React, {
//   useState, useEffect, useCallback, useRef, useMemo,
// } from "react";
// import { QRCodeSVG } from "qrcode.react";
// import "./DriverOrder.css";
// import {
//   getDriverAssigned,
//   getDriverCompleted,
//   getDriverDashboard,
//   updateDriverStatus,
//   uploadOrderImage,
//   driverAcceptOrder,
//   driverRejectOrder,
//   submitDeliveryProof,
// } from "../../services/driverService";
// import type { DriverAvailability } from "../../services/driverService";
// import { createPaymentLink } from "../../services/paymentService";

// // ─── Props ─────────────────────────────────────────────────────────────────────

// interface Props {
//   driverId?: number;
// }

// // ─── SVG icons (fixed: explicit width/height on every svg) ─────────────────────

// const S = 16; // default icon size

// const Ico = {
//   truck: (
//     <svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//       <rect x="1" y="3" width="15" height="13" rx="2"/>
//       <path d="M16 8h4l3 3v5h-7V8z"/>
//       <circle cx="5.5" cy="18.5" r="2.5"/>
//       <circle cx="18.5" cy="18.5" r="2.5"/>
//     </svg>
//   ),
//   check: (
//     <svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//       <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
//       <polyline points="22 4 12 14.01 9 11.01"/>
//     </svg>
//   ),
//   x: (
//     <svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//       <line x1="18" y1="6" x2="6" y2="18"/>
//       <line x1="6" y1="6" x2="18" y2="18"/>
//     </svg>
//   ),
//   pin: (
//     <svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//       <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
//       <circle cx="12" cy="10" r="3"/>
//     </svg>
//   ),
//   phone: (
//     <svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//       <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.128.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.88a16 16 0 0 0 6.21 6.21l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
//     </svg>
//   ),
//   camera: (
//     <svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//       <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
//       <circle cx="12" cy="13" r="4"/>
//     </svg>
//   ),
//   wallet: (
//     <svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//       <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
//       <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
//       <path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>
//     </svg>
//   ),
//   alert: (
//     <svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//       <circle cx="12" cy="12" r="10"/>
//       <line x1="12" y1="8" x2="12" y2="12"/>
//       <line x1="12" y1="16" x2="12.01" y2="16"/>
//     </svg>
//   ),
//   refresh: (
//     <svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//       <polyline points="23 4 23 10 17 10"/>
//       <polyline points="1 20 1 14 7 14"/>
//       <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
//     </svg>
//   ),
//   clock: (
//     <svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//       <circle cx="12" cy="12" r="10"/>
//       <polyline points="12 6 12 12 16 14"/>
//     </svg>
//   ),
//   star: (
//     <svg width={S} height={S} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
//       <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
//     </svg>
//   ),
//   link: (
//     <svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//       <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
//       <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
//     </svg>
//   ),
//   qrcode: (
//     <svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//       <rect x="3" y="3" width="7" height="7" rx="1"/>
//       <rect x="14" y="3" width="7" height="7" rx="1"/>
//       <rect x="3" y="14" width="7" height="7" rx="1"/>
//       <path d="M14 14h3v3h-3z"/>
//       <path d="M20 14h1v1h-1z"/>
//       <path d="M14 20h1v1h-1z"/>
//       <path d="M20 20h1v1h-1z"/>
//       <path d="M17 17h1v1h-1z"/>
//     </svg>
//   ),
//   copy: (
//     <svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//       <rect x="9" y="9" width="13" height="13" rx="2"/>
//       <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
//     </svg>
//   ),
// };

// // ─── Helpers ───────────────────────────────────────────────────────────────────

// const statusLabel = (s: string) => {
//   switch (s?.toUpperCase()) {
//     case "ASSIGNED_TO_DRIVER": return "New Order";
//     case "DRIVER_ACCEPTED":    return "Accepted";
//     case "OUT_FOR_DELIVERY":   return "Out for Delivery";
//     case "DELIVERY_SUBMITTED": return "Proof Submitted";
//     case "DELIVERED":          return "Delivered";
//     default:                   return (s || "").replace(/_/g, " ");
//   }
// };

// const statusClass = (s: string) => {
//   switch (s?.toUpperCase()) {
//     case "ASSIGNED_TO_DRIVER": return "pill-new";
//     case "OUT_FOR_DELIVERY":
//     case "DRIVER_ACCEPTED":    return "pill-onway";
//     case "DELIVERY_SUBMITTED": return "pill-proof";
//     case "DELIVERED":          return "pill-done";
//     default:                   return "pill-default";
//   }
// };

// const currencySymbol = (cur?: string) => {
//   const c = cur || (typeof window !== 'undefined' ? localStorage.getItem('currency') || 'INR' : 'INR');
//   return c === 'INR' ? '₹' : c;
// };

// const fmt = {
//   time: (d: string) =>
//     d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—',
//   date: (d: string) =>
//     d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—',
//   currency: (n: number, cur?: string) => `${currencySymbol(cur)}${Number(n || 0).toFixed(0)}`,
// };

// // ─── Component ─────────────────────────────────────────────────────────────────

// const DriverOrder: React.FC<Props> = ({ driverId: propDriverId }) => {

//   // ── Resolve driverId: prop → localStorage ────────────────────────────────────
//   const resolvedDriverId = useMemo<number>(() => {
//     if (propDriverId && propDriverId > 0) return propDriverId;
//     try {
//       const stored = localStorage.getItem("user");
//       if (stored) {
//         const parsed = JSON.parse(stored);
//         const id = Number(parsed?.id || parsed?.driver_id || 0);
//         if (id > 0) return id;
//       }
//     } catch { /* ignore */ }
//     return 0;
//   }, [propDriverId]);

//   // ── Core data ─────────────────────────────────────────────────────────────────
//   const [assigned,  setAssigned]  = useState<any[]>([]);
//   const [completed, setCompleted] = useState<any[]>([]);
//   const [dashboard, setDashboard] = useState<any>(null);
//   const [tab,       setTab]       = useState<"active" | "completed">("active");

//   // ── UI flags ──────────────────────────────────────────────────────────────────
//   const [loading,       setLoading]       = useState(true);
//   const [refreshing,    setRefreshing]    = useState(false);
//   const [actionId,      setActionId]      = useState<number | null>(null);
//   const [statusLoading, setStatusLoading] = useState(false);
//   const [uploadPct,     setUploadPct]     = useState(0);

//   // ── Driver status ─────────────────────────────────────────────────────────────
//   const [driverStatus, setDriverStatus] = useState<DriverAvailability>("ONLINE");

//   // ── Feedback ──────────────────────────────────────────────────────────────────
//   const [error,   setError]   = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);
//   const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

//   // ── Modals ────────────────────────────────────────────────────────────────────
//   const [detailOrder, setDetailOrder] = useState<any | null>(null);
//   const [rejectOrder, setRejectOrder] = useState<any | null>(null);

//   // ── Proof modal state ─────────────────────────────────────────────────────────
//   const [proofOrder,    setProofOrder]    = useState<any | null>(null);
//   const [proofFile,     setProofFile]     = useState<File | null>(null);
//   const [proofPhotoUrl, setProofPhotoUrl] = useState("");
//   const [proofNotes,    setProofNotes]    = useState("");
//   const [proofCustName, setProofCustName] = useState("");
//   const [proofCustPhone,setProofCustPhone]= useState("");
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   // ── Payment link / QR modal state ─────────────────────────────────────────────
//   // The link is auto-generated (server-side, via /payments/:order_id/create-link)
//   // the moment the driver opens the modal for an order — no manual paste needed.
//   // Cached per order id so re-opening the same order doesn't re-hit the API.
//   const [paymentLinksCache, setPaymentLinksCache] = useState<Record<number, string>>({});
//   const [paymentOrder,   setPaymentOrder]   = useState<any | null>(null);
//   const [paymentLink,    setPaymentLink]    = useState<string>("");
//   const [paymentLoading, setPaymentLoading] = useState(false);
//   const [paymentError,   setPaymentError]   = useState<string | null>(null);
//   const [paymentCopied,  setPaymentCopied]  = useState(false);

//   // ─── Fetch ───────────────────────────────────────────────────────────────────

//   const fetchAll = useCallback(async (silent = false) => {
//     if (!resolvedDriverId) {
//       setError("Driver account not found. Please log in again.");
//       setLoading(false);
//       return;
//     }

//     if (!silent) setLoading(true);
//     else         setRefreshing(true);
//     setError(null);

//     try {
//       const [asgn, done, dash] = await Promise.all([
//         getDriverAssigned(resolvedDriverId),
//         getDriverCompleted(resolvedDriverId),
//         getDriverDashboard(resolvedDriverId),
//       ]);

//       setAssigned([...asgn].sort(
//         (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
//       ));
//       setCompleted([...done].sort(
//         (a, b) =>
//           new Date(b.delivered_at ?? b.created_at).getTime() -
//           new Date(a.delivered_at ?? a.created_at).getTime()
//       ));
//       setDashboard(dash);

//       const serverStatus =
//         (dash?.driver?.availability_status || dash?.driver?.status || "")
//           .toUpperCase() as DriverAvailability;
//       if (serverStatus) setDriverStatus(serverStatus);

//     } catch (err: any) {
//       const status = err?.response?.status;
//       const msg =
//         status === 401 ? "Session expired — please log in again." :
//         status === 403 ? "Access denied. Driver account required." :
//         status === 404 ? "Driver account not found." :
//         err?.response?.data?.error ||
//         `Could not load orders (HTTP ${status ?? "network error"})`;
//       setError(msg);
//       console.error("[DriverOrder] fetchAll error:", err?.response ?? err);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, [resolvedDriverId]);

//   // Initial load + 30-second auto-refresh
//   useEffect(() => {
//     fetchAll();
//     const interval = setInterval(() => fetchAll(true), 30_000);
//     return () => clearInterval(interval);
//   }, [fetchAll]);

//   // ─── Helpers ─────────────────────────────────────────────────────────────────

//   const showSuccess = (msg: string) => {
//     setSuccess(msg);
//     clearTimeout(successTimer.current ?? undefined);
//     successTimer.current = setTimeout(() => setSuccess(null), 4000);
//   };

//   const clearProofState = () => {
//     setProofOrder(null);
//     setProofFile(null);
//     setProofPhotoUrl("");
//     setProofNotes("");
//     setProofCustName("");
//     setProofCustPhone("");
//     setUploadPct(0);
//     if (fileInputRef.current) fileInputRef.current.value = "";
//   };

//   // ─── Accept ──────────────────────────────────────────────────────────────────

//   const handleAccept = async (orderId: number, e?: React.MouseEvent) => {
//     e?.stopPropagation();
//     setActionId(orderId);
//     setError(null);
//     try {
//       await driverAcceptOrder(orderId);
//       showSuccess(`Order #${orderId} accepted — you're now out for delivery!`);
//       setDetailOrder(null);
//       await fetchAll(true);
//     } catch (err: any) {
//       setError(err?.response?.data?.error || "Failed to accept order.");
//     } finally {
//       setActionId(null);
//     }
//   };

//   // ─── Reject ───────────────────────────────────────────────────────────────────

//   const handleReject = async () => {
//     if (!rejectOrder) return;
//     setActionId(rejectOrder.id);
//     setError(null);
//     try {
//       await driverRejectOrder(rejectOrder.id);
//       showSuccess(`Order #${rejectOrder.order_number} rejected — returned to delivery agent.`);
//       setRejectOrder(null);
//       setDetailOrder(null);
//       await fetchAll(true);
//     } catch (err: any) {
//       setError(err?.response?.data?.error || "Failed to reject order.");
//     } finally {
//       setActionId(null);
//     }
//   };

//   // ─── Open proof modal ─────────────────────────────────────────────────────────

//   const openProof = (order: any, e?: React.MouseEvent) => {
//     e?.stopPropagation();
//     setProofOrder(order);
//     setProofCustName(
//       [order.customer?.first_name, order.customer?.last_name].filter(Boolean).join(" ")
//     );
//     setProofCustPhone(order.customer?.phone_no || "");
//   };

//   // ─── Upload photo ─────────────────────────────────────────────────────────────

//   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file || !proofOrder) return;
//     setProofFile(file);
//     setUploadPct(0);
//     setError(null);
//     try {
//       const url = await uploadOrderImage(proofOrder.id, file, setUploadPct);
//       setProofPhotoUrl(url);
//     } catch (err: any) {
//       setError("Photo upload failed. Please try again.");
//       setProofFile(null);
//       setProofPhotoUrl("");
//     } finally {
//       setUploadPct(0);
//     }
//   };

//   // ─── Submit proof ─────────────────────────────────────────────────────────────

//   const handleSubmitProof = async () => {
//     if (!proofOrder) return;
//     setActionId(proofOrder.id);
//     setError(null);
//     try {
//       await submitDeliveryProof(proofOrder.id, {
//         delivery_photo:              proofPhotoUrl  || undefined,
//         delivery_notes:              proofNotes     || undefined,
//         customer_confirmation_name:  proofCustName  || undefined,
//         customer_confirmation_phone: proofCustPhone || undefined,
//       });
//       showSuccess(
//         `Proof submitted for order #${proofOrder.order_number}. Awaiting confirmation.`
//       );
//       clearProofState();
//       setDetailOrder(null);
//       await fetchAll(true);
//     } catch (err: any) {
//       setError(err?.response?.data?.error || "Failed to submit proof.");
//     } finally {
//       setActionId(null);
//     }
//   };

//   // ─── Driver status toggle ─────────────────────────────────────────────────────

//   const handleStatusChange = async (s: DriverAvailability) => {
//     if (s === driverStatus || statusLoading) return;
//     setStatusLoading(true);
//     setError(null);
//     try {
//       await updateDriverStatus(resolvedDriverId, s);
//       setDriverStatus(s);
//     } catch (err: any) {
//       setError(err?.response?.data?.error || "Failed to update status.");
//     } finally {
//       setStatusLoading(false);
//     }
//   };

//   // ─── Payment link / QR code ──────────────────────────────────────────────────
//   // Generates a payment link for the order via POST /payments/:order_id/create-link
//   // (the same endpoint OrderManagement uses) and renders it as a scannable QR
//   // using qrcode.react — works for any order, not just COD.

//   const generateLinkForOrder = useCallback(async (order: any) => {
//     setPaymentLoading(true);
//     setPaymentError(null);
//     try {
//       const res = await createPaymentLink(order.id);
//       setPaymentLink(res.payment_url);
//       setPaymentLinksCache((prev) => ({ ...prev, [order.id]: res.payment_url }));
//     } catch (err: any) {
//       setPaymentError(
//         err?.response?.data?.error ||
//         err?.response?.data?.message ||
//         "Failed to generate payment link."
//       );
//     } finally {
//       setPaymentLoading(false);
//     }
//   }, []);

//   const openPaymentLink = (order: any, e?: React.MouseEvent) => {
//     e?.stopPropagation();
//     setPaymentOrder(order);
//     setPaymentError(null);
//     setPaymentCopied(false);

//     const cached = paymentLinksCache[order.id];
//     if (cached) {
//       setPaymentLink(cached);
//       setPaymentLoading(false);
//     } else {
//       setPaymentLink("");
//       generateLinkForOrder(order);
//     }
//   };

//   const closePaymentLink = () => {
//     setPaymentOrder(null);
//     setPaymentLink("");
//     setPaymentError(null);
//     setPaymentCopied(false);
//   };

//   const handleRegenerateLink = () => {
//     if (!paymentOrder) return;
//     generateLinkForOrder(paymentOrder);
//   };

//   const handleCopyPaymentLink = async () => {
//     if (!paymentLink) return;
//     try {
//       await navigator.clipboard.writeText(paymentLink);
//       setPaymentCopied(true);
//       setTimeout(() => setPaymentCopied(false), 2000);
//     } catch {
//       // Clipboard API unavailable — silently ignore, the link is still visible in the QR.
//     }
//   };

//   // ─── Derived ─────────────────────────────────────────────────────────────────

//   const orders = tab === "active" ? assigned : completed;

//   const driverName = useMemo(() => {
//     const d = dashboard?.driver;
//     if (!d) return "Driver";
//     return `${d.first_name || ""} ${d.last_name || ""}`.trim() || "Driver";
//   }, [dashboard]);

//   const stats = useMemo(() => ({
//     active:        assigned.length,
//     delivered:     completed.length,
//     pendingAmount: dashboard?.pending_amount ?? 0,
//     rating:        dashboard?.rating ?? 0,
//   }), [assigned, completed, dashboard]);

//   // ─── Status predicates ────────────────────────────────────────────────────────

//   const isNewOrder  = (s: string) => s?.toUpperCase() === "ASSIGNED_TO_DRIVER";
//   const isOnTheWay  = (s: string) => s?.toUpperCase() === "OUT_FOR_DELIVERY";
//   const isSubmitted = (s: string) => s?.toUpperCase() === "DELIVERY_SUBMITTED";
//   const isCODPending = (o: any) =>
//     o?.payment_method === "COD" && o?.payment_status === "PENDING";

//   // ─── Render ───────────────────────────────────────────────────────────────────

//   return (
//     <div className="do-wrap">

//       {/* ── Success toast ── */}
//       {success && (
//         <div className="do-toast do-toast-ok">
//           <span className="do-toast-icon">{Ico.check}</span>
//           <span>{success}</span>
//           <button onClick={() => setSuccess(null)}>×</button>
//         </div>
//       )}

//       {/* ── Error banner ── */}
//       {error && (
//         <div className="do-toast do-toast-err">
//           <span className="do-toast-icon">{Ico.alert}</span>
//           <span>{error}</span>
//           <button onClick={() => setError(null)}>×</button>
//         </div>
//       )}

//       {/* ── No driver ID warning ── */}
//       {!resolvedDriverId && !loading && (
//         <div className="do-no-driver">
//           <span>{Ico.alert}</span>
//           <div>
//             <strong>Driver account not linked.</strong>
//             <p>Your account does not have a driver profile. Please contact your admin.</p>
//           </div>
//         </div>
//       )}

//       {/* ── Profile header ── */}
//       <header className="do-header">
//         <div className="do-header-left">
//           <div className="do-avatar">{driverName.charAt(0).toUpperCase()}</div>
//           <div>
//             <h2 className="do-driver-name">{driverName}</h2>
//             <p className="do-driver-sub">
//               {dashboard?.driver?.phone_no && (
//                 <span className="do-phone">
//                   {Ico.phone}
//                   {dashboard.driver.phone_no}
//                 </span>
//               )}
//               <span>Delivery Driver</span>
//               {resolvedDriverId > 0 && (
//                 <span className="do-driver-id">ID #{resolvedDriverId}</span>
//               )}
//             </p>
//           </div>
//         </div>

//         <div className="do-header-right">
//           {/* Availability toggle */}
//           <div className="do-avail">
//             {(["ONLINE", "BUSY", "OFFLINE"] as DriverAvailability[]).map((s) => (
//               <button
//                 key={s}
//                 className={`do-avail-btn do-avail-${s.toLowerCase()} ${driverStatus === s ? "active" : ""}`}
//                 onClick={() => handleStatusChange(s)}
//                 disabled={statusLoading}
//               >
//                 <span className={`do-avail-dot dot-${s.toLowerCase()}`} />
//                 {s}
//               </button>
//             ))}
//           </div>

//           <button
//             className={`do-refresh ${refreshing ? "spinning" : ""}`}
//             onClick={() => fetchAll(true)}
//             title="Refresh orders"
//             disabled={refreshing}
//           >
//             {Ico.refresh}
//           </button>
//         </div>
//       </header>

//       {/* ── Stats row ── */}
//       <div className="do-stats">
//         <div className="do-stat">
//           <span className="do-stat-icon stat-active">{Ico.truck}</span>
//           <div>
//             <strong>{stats.active}</strong>
//             <span>Active</span>
//           </div>
//         </div>
//         <div className="do-stat">
//           <span className="do-stat-icon stat-done">{Ico.check}</span>
//           <div>
//             <strong>{stats.delivered}</strong>
//             <span>Completed</span>
//           </div>
//         </div>
//         <div className="do-stat">
//           <span className="do-stat-icon stat-wallet">{Ico.wallet}</span>
//           <div>
//             <strong>{fmt.currency(stats.pendingAmount, dashboard?.currency)}</strong>
//             <span>Pending Pay</span>
//           </div>
//         </div>
//         {stats.rating > 0 && (
//           <div className="do-stat">
//             <span className="do-stat-icon stat-star">{Ico.star}</span>
//             <div>
//               <strong>{stats.rating.toFixed(1)}</strong>
//               <span>Rating</span>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* ── Tabs ── */}
//       <nav className="do-tabs">
//         <button
//           className={`do-tab ${tab === "active" ? "active" : ""}`}
//           onClick={() => setTab("active")}
//         >
//           My Orders
//           {assigned.length > 0 && (
//             <span className="do-badge do-badge-active">{assigned.length}</span>
//           )}
//         </button>
//         <button
//           className={`do-tab ${tab === "completed" ? "active" : ""}`}
//           onClick={() => setTab("completed")}
//         >
//           Completed
//           {completed.length > 0 && (
//             <span className="do-badge do-badge-done">{completed.length}</span>
//           )}
//         </button>
//       </nav>

//       {/* ── Order list ── */}
//       {loading ? (
//         <div className="do-loading">
//           <div className="do-spinner" />
//           <p>Loading orders…</p>
//         </div>
//       ) : orders.length === 0 ? (
//         <div className="do-empty">
//           <span className="do-empty-icon">
//             {tab === "active" ? Ico.truck : Ico.check}
//           </span>
//           <h3>{tab === "active" ? "No active orders" : "No completed orders"}</h3>
//           <p>
//             {tab === "active"
//               ? "Orders assigned to you will appear here."
//               : "Delivered orders will appear here."}
//           </p>
//         </div>
//       ) : (
//         <div className="do-cards">
//           {orders.map((order) => {
//             const status = order.status?.toUpperCase() ?? "";
//             const busy   = actionId === order.id;
//             const addr   = order.delivery_address;
//             const cust   = order.customer;
//             const hasSavedLink = Boolean(paymentLinksCache[order.id]);

//             return (
//               <div
//                 key={order.id}
//                 className="do-card"
//                 onClick={() => setDetailOrder(order)}
//               >
//                 {/* Top row */}
//                 <div className="do-card-top">
//                   <div>
//                     <span className="do-card-num">
//                       #{order.order_number || String(order.id).padStart(5, "0")}
//                     </span>
//                     <span className="do-card-time">
//                       {Ico.clock}
//                       {fmt.date(order.created_at)} · {fmt.time(order.created_at)}
//                     </span>
//                   </div>
//                   <span className={`do-pill ${statusClass(status)}`}>
//                     {statusLabel(status)}
//                   </span>
//                 </div>

//                 {/* Customer */}
//                 {cust && (
//                   <div className="do-card-row">
//                     {Ico.phone}
//                     <span>
//                       {[cust.first_name, cust.last_name].filter(Boolean).join(" ")}
//                       {cust.phone_no && <em className="do-card-phone"> · {cust.phone_no}</em>}
//                     </span>
//                   </div>
//                 )}

//                 {/* Address */}
//                 {addr && (
//                   <div className="do-card-row">
//                     {Ico.pin}
//                     <span>
//                       {[addr.street, addr.city, addr.pincode].filter(Boolean).join(", ")}
//                     </span>
//                   </div>
//                 )}

//                 {/* Items */}
//                 <div className="do-card-items">
//                   {(order.items || []).slice(0, 3).map((item: any, i: number) => (
//                     <span key={i} className="do-item-chip">
//                       ×{item.quantity} {item.product?.name || item.name || "Item"}
//                     </span>
//                   ))}
//                   {(order.items || []).length > 3 && (
//                     <span className="do-item-chip do-item-more">
//                       +{order.items.length - 3} more
//                     </span>
//                   )}
//                 </div>

//                 {/* Total + payment */}
//                 <div className="do-card-footer-row">
//                   <strong className="do-card-amount">
//                     {fmt.currency(order.grand_total || order.total, order.currency)}
//                   </strong>
//                   <span className={`do-pay-chip ${isCODPending(order) ? "cod" : "paid"}`}>
//                     {isCODPending(order)
//                       ? `COD — Collect ${fmt.currency(order.grand_total || order.total, order.currency)}`
//                       : `${order.payment_method || "PAID"} ✓`}
//                   </span>
//                 </div>

//                 {/* Submitted notice */}
//                 {isSubmitted(status) && (
//                   <div className="do-notice notice-info">
//                     {Ico.check}
//                     <span>Proof submitted — awaiting agent confirmation</span>
//                   </div>
//                 )}

//                 {/* Action buttons */}
//                 {tab === "active" && (
//                   <div className="do-card-actions" onClick={(e) => e.stopPropagation()}>
//                     {isNewOrder(status) && (
//                       <>
//                         <button
//                           className="do-btn btn-reject"
//                           disabled={busy}
//                           onClick={() => setRejectOrder(order)}
//                         >
//                           {Ico.x} Reject
//                         </button>
//                         <button
//                           className="do-btn btn-accept"
//                           disabled={busy}
//                           onClick={() => handleAccept(order.id)}
//                         >
//                           {busy ? (
//                             <><div className="do-spinner sm" /> Accepting…</>
//                           ) : (
//                             <>{Ico.check} Accept</>
//                           )}
//                         </button>
//                       </>
//                     )}

//                     {isOnTheWay(status) && (
//                       <>
//                         {/* Payment link/QR is available for every order, not just COD */}
//                         {/* <button
//                           className="do-btn btn-payment"
//                           onClick={(e) => openPaymentLink(order, e)}
//                         >
//                           {Ico.qrcode} {hasSavedLink ? "Payment QR" : "Get Payment Link"}
//                         </button> */}
//                         <button
//                           className="do-btn btn-proof"
//                           disabled={busy}
//                           onClick={() => openProof(order)}
//                         >
//                           {busy ? (
//                             <><div className="do-spinner sm" /> Submitting…</>
//                           ) : (
//                             <>{Ico.camera} Submit Proof</>
//                           )}
//                         </button>
//                       </>
//                     )}

//                     {isSubmitted(status) && (
//                       <span className="do-waiting-chip">Awaiting confirmation…</span>
//                     )}
//                   </div>
//                 )}

//                 {tab === "completed" && (
//                   <div className="do-card-actions">
//                     <span className="do-done-chip">
//                       {Ico.check}
//                       Delivered {order.delivered_at ? fmt.date(order.delivered_at) : ""}
//                     </span>
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {/* ── Order Detail Modal ── */}
//       {detailOrder && (
//         <div className="do-backdrop" onClick={() => setDetailOrder(null)}>
//           <div className="do-modal" onClick={(e) => e.stopPropagation()}>
//             <div className="do-modal-head">
//               <div>
//                 <h3>Order #{detailOrder.order_number || detailOrder.id}</h3>
//                 <p className="do-modal-sub">
//                   {detailOrder.order_type} · {fmt.date(detailOrder.created_at)}{" "}
//                   {fmt.time(detailOrder.created_at)}
//                 </p>
//               </div>
//               <button className="do-modal-close" onClick={() => setDetailOrder(null)}>
//                 {Ico.x}
//               </button>
//             </div>

//             <div className="do-modal-body">
//               <span className={`do-pill ${statusClass(detailOrder.status)} do-pill-mb`}>
//                 {statusLabel(detailOrder.status)}
//               </span>

//               {isCODPending(detailOrder) && (
//                 <div className="do-notice notice-warn">
//                   {Ico.alert}
//                   <span>
//                     Collect <strong>{fmt.currency(detailOrder.grand_total || detailOrder.total, detailOrder.currency)}</strong> in cash on delivery
//                   </span>
//                 </div>
//               )}

//               {detailOrder.customer && (
//                 <section className="do-modal-section">
//                   <h4>Customer</h4>
//                   <div className="do-modal-info">
//                     <div className="do-info-row">
//                       {Ico.phone}
//                       <span>{[detailOrder.customer.first_name, detailOrder.customer.last_name].filter(Boolean).join(" ")}</span>
//                     </div>
//                     {detailOrder.customer.phone_no && (
//                       <div className="do-info-row">
//                         {Ico.phone}
//                         <span>{detailOrder.customer.phone_no}</span>
//                       </div>
//                     )}
//                   </div>
//                 </section>
//               )}

//               {detailOrder.delivery_address && (
//                 <section className="do-modal-section">
//                   <h4>Delivery Address</h4>
//                   <div className="do-info-row">
//                     {Ico.pin}
//                     <span>
//                       {[
//                         detailOrder.delivery_address.street,
//                         detailOrder.delivery_address.city,
//                         detailOrder.delivery_address.state,
//                         detailOrder.delivery_address.pincode,
//                       ].filter(Boolean).join(", ")}
//                     </span>
//                   </div>
//                 </section>
//               )}

//               <section className="do-modal-section">
//                 <h4>Items</h4>
//                 {(detailOrder.items || []).map((item: any, i: number) => (
//                   <div key={i} className="do-modal-item">
//                     <span className="do-modal-qty">×{item.quantity}</span>
//                     <span className="do-modal-item-name">{item.product?.name || item.name}</span>
//                     <span className="do-modal-price">
//                       {fmt.currency(item.line_total || item.price * item.quantity || 0, detailOrder?.currency)}
//                     </span>
//                   </div>
//                 ))}
//               </section>

//               <section className="do-modal-totals">
//                 <div className="do-total-row">
//                   <span>Subtotal</span>
//                   <span>{fmt.currency(detailOrder.subtotal, detailOrder.currency)}</span>
//                 </div>
//                 <div className="do-total-row">
//                   <span>Delivery charge</span>
//                   <span>{fmt.currency(detailOrder.delivery_charge, detailOrder.currency)}</span>
//                 </div>
//                 {Number(detailOrder.discount) > 0 && (
//                   <div className="do-total-row disc">
//                     <span>Discount</span>
//                     <span>−{fmt.currency(detailOrder.discount, detailOrder.currency)}</span>
//                   </div>
//                 )}
//                 <div className="do-total-row grand">
//                   <span>Total</span>
//                   <strong>{fmt.currency(detailOrder.grand_total || detailOrder.total, detailOrder.currency)}</strong>
//                 </div>
//               </section>
//             </div>

//             <div className="do-modal-foot">
//               <button className="do-btn btn-ghost" onClick={() => setDetailOrder(null)}>
//                 Close
//               </button>
//               {isNewOrder(detailOrder.status) && tab === "active" && (
//                 <>
//                   <button
//                     className="do-btn btn-reject"
//                     disabled={actionId === detailOrder.id}
//                     onClick={() => { setDetailOrder(null); setRejectOrder(detailOrder); }}
//                   >
//                     {Ico.x} Reject
//                   </button>
//                   <button
//                     className="do-btn btn-accept"
//                     disabled={actionId === detailOrder.id}
//                     onClick={() => { setDetailOrder(null); handleAccept(detailOrder.id); }}
//                   >
//                     {Ico.check} Accept Order
//                   </button>
//                 </>
//               )}
//               {isOnTheWay(detailOrder.status) && tab === "active" && (
//                 <>
//                   <button
//                     className="do-btn btn-payment"
//                     onClick={() => { setDetailOrder(null); openPaymentLink(detailOrder); }}
//                   >
//                     {Ico.qrcode} Payment Link
//                   </button>
//                   <button
//                     className="do-btn btn-proof"
//                     disabled={actionId === detailOrder.id}
//                     onClick={() => { setDetailOrder(null); openProof(detailOrder); }}
//                   >
//                     {Ico.camera} Submit Proof
//                   </button>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── Reject Confirmation Modal ── */}
//       {rejectOrder && (
//         <div className="do-backdrop" onClick={() => setRejectOrder(null)}>
//           <div className="do-modal do-modal-sm" onClick={(e) => e.stopPropagation()}>
//             <div className="do-modal-head">
//               <h3>Reject Order</h3>
//               <button className="do-modal-close" onClick={() => setRejectOrder(null)}>
//                 {Ico.x}
//               </button>
//             </div>
//             <div className="do-modal-body">
//               <p className="do-confirm-text">
//                 Rejecting <strong>#{rejectOrder.order_number}</strong> will return it to the
//                 delivery agent to assign a different driver. Are you sure?
//               </p>
//             </div>
//             <div className="do-modal-foot">
//               <button
//                 className="do-btn btn-ghost"
//                 disabled={actionId === rejectOrder.id}
//                 onClick={() => setRejectOrder(null)}
//               >
//                 Cancel
//               </button>
//               <button
//                 className="do-btn btn-reject"
//                 disabled={actionId === rejectOrder.id}
//                 onClick={handleReject}
//               >
//                 {actionId === rejectOrder.id ? (
//                   <><div className="do-spinner sm" /> Rejecting…</>
//                 ) : (
//                   <>{Ico.x} Yes, Reject</>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── Delivery Proof Modal ── */}
//       {proofOrder && (
//         <div className="do-backdrop" onClick={clearProofState}>
//           <div className="do-modal" onClick={(e) => e.stopPropagation()}>
//             <div className="do-modal-head">
//               <div>
//                 <h3>Submit Delivery Proof</h3>
//                 <p className="do-modal-sub">Order #{proofOrder.order_number}</p>
//               </div>
//               <button className="do-modal-close" onClick={clearProofState}>{Ico.x}</button>
//             </div>

//             <div className="do-modal-body">
//               {isCODPending(proofOrder) && (
//                 <div className="do-notice notice-warn">
//                   {Ico.alert}
//                   <span>
//                     Collect <strong>{fmt.currency(proofOrder.grand_total || proofOrder.total, proofOrder.currency)}</strong> cash before submitting proof
//                   </span>
//                 </div>
//               )}

//               {/* Upload progress bar */}
//               {proofFile && !proofPhotoUrl && uploadPct > 0 && (
//                 <div className="do-progress-bar">
//                   <div className="do-progress-fill" style={{ width: `${uploadPct}%` }} />
//                   <span>{uploadPct}%</span>
//                 </div>
//               )}

//               <div className="do-field">
//                 <label className="do-label">
//                   Delivery Photo <span className="do-optional">(recommended)</span>
//                 </label>
//                 {proofPhotoUrl ? (
//                   <div className="do-photo-preview">
//                     <img src={proofPhotoUrl} alt="Delivery proof" />
//                     <button
//                       className="do-photo-remove"
//                       onClick={() => { setProofFile(null); setProofPhotoUrl(""); }}
//                     >
//                       {Ico.x} Remove
//                     </button>
//                   </div>
//                 ) : (
//                   <button
//                     className="do-upload-btn"
//                     onClick={() => fileInputRef.current?.click()}
//                     disabled={!!proofFile && !proofPhotoUrl}
//                   >
//                     {proofFile && !proofPhotoUrl ? (
//                       <><div className="do-spinner sm" /> Uploading…</>
//                     ) : (
//                       <>{Ico.camera} Choose Photo</>
//                     )}
//                   </button>
//                 )}
//                 <input
//                   ref={fileInputRef}
//                   type="file"
//                   accept="image/*"
//                   capture="environment"
//                   style={{ display: "none" }}
//                   onChange={handleFileChange}
//                 />
//               </div>

//               <div className="do-field">
//                 <label className="do-label">Name of person who received the order</label>
//                 <input
//                   className="do-input"
//                   type="text"
//                   placeholder="Customer / recipient name"
//                   value={proofCustName}
//                   onChange={(e) => setProofCustName(e.target.value)}
//                 />
//               </div>

//               <div className="do-field">
//                 <label className="do-label">
//                   Phone <span className="do-optional">(optional)</span>
//                 </label>
//                 <input
//                   className="do-input"
//                   type="tel"
//                   placeholder="Confirm recipient phone"
//                   value={proofCustPhone}
//                   onChange={(e) => setProofCustPhone(e.target.value)}
//                 />
//               </div>

//               <div className="do-field">
//                 <label className="do-label">
//                   Notes <span className="do-optional">(optional)</span>
//                 </label>
//                 <textarea
//                   className="do-input"
//                   rows={3}
//                   placeholder="e.g. Left at door, handed to security, cash collected…"
//                   value={proofNotes}
//                   onChange={(e) => setProofNotes(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="do-modal-foot">
//               <button
//                 className="do-btn btn-ghost"
//                 disabled={actionId === proofOrder.id}
//                 onClick={clearProofState}
//               >
//                 Cancel
//               </button>
//               <button
//                 className="do-btn btn-proof"
//                 disabled={actionId === proofOrder.id || (!!proofFile && !proofPhotoUrl)}
//                 onClick={handleSubmitProof}
//               >
//                 {actionId === proofOrder.id ? (
//                   <><div className="do-spinner sm" /> Submitting…</>
//                 ) : (
//                   <>{Ico.camera} Submit Proof</>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── Payment Link / QR Code Modal ── */}
//       {paymentOrder && (
//         <div className="do-backdrop" onClick={closePaymentLink}>
//           <div className="do-modal do-modal-sm" onClick={(e) => e.stopPropagation()}>
//             <div className="do-modal-head">
//               <div>
//                 <h3>Payment QR</h3>
//                 <p className="do-modal-sub">Order #{paymentOrder.order_number}</p>
//               </div>
//               <button className="do-modal-close" onClick={closePaymentLink}>{Ico.x}</button>
//             </div>

//             <div className="do-modal-body">
//               {isCODPending(paymentOrder) && (
//                 <div className="do-notice notice-warn">
//                   {Ico.alert}
//                   <span>
//                     Amount due: <strong>{fmt.currency(paymentOrder.grand_total || paymentOrder.total, paymentOrder.currency)}</strong>
//                   </span>
//                 </div>
//               )}

//               {/* Loading state — link is being generated on the server */}
//               {paymentLoading && (
//                 <div
//                   style={{
//                     display: "flex",
//                     flexDirection: "column",
//                     alignItems: "center",
//                     gap: 10,
//                     padding: "28px 0",
//                   }}
//                 >
//                   <div className="do-spinner" />
//                   <p style={{ margin: 0, fontSize: 13, color: "#8c6b76" }}>
//                     Generating payment link…
//                   </p>
//                 </div>
//               )}

//               {/* Error state */}
//               {paymentError && !paymentLoading && (
//                 <>
//                   <div className="do-notice notice-warn">
//                     {Ico.alert}
//                     <span>{paymentError}</span>
//                   </div>
//                   <button
//                     className="do-btn btn-ghost"
//                     style={{ width: "100%", marginTop: 10 }}
//                     onClick={handleRegenerateLink}
//                   >
//                     {Ico.refresh} Retry
//                   </button>
//                 </>
//               )}

//               {/* QR + link, rendered with qrcode.react */}
//               {paymentLink && !paymentLoading && (
//                 <div
//                   style={{
//                     display: "flex",
//                     flexDirection: "column",
//                     alignItems: "center",
//                     gap: 12,
//                     padding: "8px 0 4px",
//                   }}
//                 >
//                   <div
//                     style={{
//                       padding: 16,
//                       background: "#ffffff",
//                       border: "1.5px solid #f3dbe3",
//                       borderRadius: 14,
//                     }}
//                   >
//                     <QRCodeSVG
//                       value={paymentLink}
//                       size={220}
//                       level="M"
//                       bgColor="#ffffff"
//                       fgColor="#1a1a1a"
//                     />
//                   </div>

//                   <p
//                     style={{
//                       fontSize: 12.5,
//                       color: "#8c6b76",
//                       textAlign: "center",
//                       margin: 0,
//                       wordBreak: "break-all",
//                     }}
//                   >
//                     {paymentLink}
//                   </p>

//                   <p
//                     style={{
//                       fontSize: 12.5,
//                       color: "#8c6b76",
//                       textAlign: "center",
//                       margin: 0,
//                     }}
//                   >
//                     Ask the customer to scan this code with any UPI / payment app to pay
//                     {isCODPending(paymentOrder)
//                       ? ` ${fmt.currency(paymentOrder.grand_total || paymentOrder.total, paymentOrder.currency)}`
//                       : ""}.
//                   </p>

//                   <div style={{ display: "flex", gap: 8, width: "100%" }}>
//                     <button
//                       className="do-btn btn-ghost"
//                       style={{ flex: 1 }}
//                       onClick={handleCopyPaymentLink}
//                     >
//                       {Ico.copy} {paymentCopied ? "Copied!" : "Copy Link"}
//                     </button>
//                     <button
//                       className="do-btn btn-ghost"
//                       style={{ flex: 1 }}
//                       onClick={handleRegenerateLink}
//                       disabled={paymentLoading}
//                     >
//                       {Ico.refresh} Regenerate
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>

//             <div className="do-modal-foot">
//               <button className="do-btn btn-ghost" onClick={closePaymentLink}>
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DriverOrder;



import React, {
  useState, useEffect, useCallback, useRef, useMemo,
} from "react";
import { QRCodeSVG } from "qrcode.react";
import "./DriverOrder.css";
import {
  getDriverAssigned,
  getDriverCompleted,
  getDriverDashboard,
  updateDriverStatus,
  uploadOrderImage,
  driverAcceptOrder,
  driverRejectOrder,
  submitDeliveryProof,
  markCodPaymentPaid, // ← NEW: add this export to services/driverService.ts (see note below component)
} from "../../services/driverService";
import type { DriverAvailability } from "../../services/driverService";
import { createPaymentLink } from "../../services/paymentService";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  driverId?: number;
}

// ─── SVG icons (fixed: explicit width/height on every svg) ─────────────────────

const S = 16; // default icon size

const Ico = {
  truck: (
    <svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="2"/>
      <path d="M16 8h4l3 3v5h-7V8z"/>
      <circle cx="5.5" cy="18.5" r="2.5"/>
      <circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  ),
  check: (
    <svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  x: (
    <svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  pin: (
    <svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  phone: (
    <svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.128.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.88a16 16 0 0 0 6.21 6.21l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  camera: (
    <svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  ),
  wallet: (
    <svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
      <path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>
    </svg>
  ),
  alert: (
    <svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  refresh: (
    <svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 4 23 10 17 10"/>
      <polyline points="1 20 1 14 7 14"/>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
  ),
  clock: (
    <svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  star: (
    <svg width={S} height={S} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  link: (
    <svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  ),
  qrcode: (
    <svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <path d="M14 14h3v3h-3z"/>
      <path d="M20 14h1v1h-1z"/>
      <path d="M14 20h1v1h-1z"/>
      <path d="M20 20h1v1h-1z"/>
      <path d="M17 17h1v1h-1z"/>
    </svg>
  ),
  copy: (
    <svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  ),
  cash: (
    <svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="6" width="20" height="12" rx="2"/>
      <circle cx="12" cy="12" r="3"/>
      <path d="M6 12h.01M18 12h.01"/>
    </svg>
  ),
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

const statusLabel = (s: string) => {
  switch (s?.toUpperCase()) {
    case "ASSIGNED_TO_DRIVER": return "New Order";
    case "DRIVER_ACCEPTED":    return "Accepted";
    case "OUT_FOR_DELIVERY":   return "Out for Delivery";
    case "DELIVERY_SUBMITTED": return "Proof Submitted";
    case "DELIVERED":          return "Delivered";
    default:                   return (s || "").replace(/_/g, " ");
  }
};

const statusClass = (s: string) => {
  switch (s?.toUpperCase()) {
    case "ASSIGNED_TO_DRIVER": return "pill-new";
    case "OUT_FOR_DELIVERY":
    case "DRIVER_ACCEPTED":    return "pill-onway";
    case "DELIVERY_SUBMITTED": return "pill-proof";
    case "DELIVERED":          return "pill-done";
    default:                   return "pill-default";
  }
};

const currencySymbol = (cur?: string) => {
  const c = cur || (typeof window !== 'undefined' ? localStorage.getItem('currency') || 'INR' : 'INR');
  return c === 'INR' ? '₹' : c;
};

const fmt = {
  time: (d: string) =>
    d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—',
  date: (d: string) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
  currency: (n: number, cur?: string) => `${currencySymbol(cur)}${Number(n || 0).toFixed(0)}`,
};

/**
 * Reads the first non-empty value found under any of `keys` on `addr`.
 * Kuwait-style address payloads aren't fully standardized across backends
 * (building / building_name / building_no, etc.), so this checks a few
 * common variants rather than assuming one exact field name.
 */
const addrField = (addr: any, keys: string[]): string | null => {
  if (!addr) return null;
  for (const k of keys) {
    const v = addr[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") return String(v);
  }
  return null;
};

// ─── Component ─────────────────────────────────────────────────────────────────

const DriverOrder: React.FC<Props> = ({ driverId: propDriverId }) => {

  // ── Resolve driverId: prop → localStorage ────────────────────────────────────
  const resolvedDriverId = useMemo<number>(() => {
    if (propDriverId && propDriverId > 0) return propDriverId;
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        const id = Number(parsed?.id || parsed?.driver_id || 0);
        if (id > 0) return id;
      }
    } catch { /* ignore */ }
    return 0;
  }, [propDriverId]);

  // ── Core data ─────────────────────────────────────────────────────────────────
  const [assigned,  setAssigned]  = useState<any[]>([]);
  const [completed, setCompleted] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [tab,       setTab]       = useState<"active" | "completed">("active");

  // ── UI flags ──────────────────────────────────────────────────────────────────
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);
  const [actionId,      setActionId]      = useState<number | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [uploadPct,     setUploadPct]     = useState(0);

  // ── Driver status ─────────────────────────────────────────────────────────────
  const [driverStatus, setDriverStatus] = useState<DriverAvailability>("ONLINE");

  // ── Feedback ──────────────────────────────────────────────────────────────────
  const [error,   setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Modals ────────────────────────────────────────────────────────────────────
  const [detailOrder, setDetailOrder] = useState<any | null>(null);
  const [rejectOrder, setRejectOrder] = useState<any | null>(null);

  // ── Proof modal state ─────────────────────────────────────────────────────────
  const [proofOrder,    setProofOrder]    = useState<any | null>(null);
  const [proofFile,     setProofFile]     = useState<File | null>(null);
  const [proofPhotoUrl, setProofPhotoUrl] = useState("");
  const [proofNotes,    setProofNotes]    = useState("");
  const [proofCustName, setProofCustName] = useState("");
  const [proofCustPhone,setProofCustPhone]= useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Payment link / QR modal state ─────────────────────────────────────────────
  // The link is auto-generated (server-side, via /payments/:order_id/create-link)
  // the moment the driver opens the modal for an order — no manual paste needed.
  // Cached per order id so re-opening the same order doesn't re-hit the API.
  const [paymentLinksCache, setPaymentLinksCache] = useState<Record<number, string>>({});
  const [paymentOrder,   setPaymentOrder]   = useState<any | null>(null);
  const [paymentLink,    setPaymentLink]    = useState<string>("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError,   setPaymentError]   = useState<string | null>(null);
  const [paymentCopied,  setPaymentCopied]  = useState(false);

  // ── "Payment" dropdown (per-card: choose Online Link vs COD-Paid) ────────────
  const [paymentMenuOrderId, setPaymentMenuOrderId] = useState<number | null>(null);
  const [codMarkingId,       setCodMarkingId]       = useState<number | null>(null);

  // ─── Fetch ───────────────────────────────────────────────────────────────────

  const fetchAll = useCallback(async (silent = false) => {
    if (!resolvedDriverId) {
      setError("Driver account not found. Please log in again.");
      setLoading(false);
      return;
    }

    if (!silent) setLoading(true);
    else         setRefreshing(true);
    setError(null);

    try {
      const [asgn, done, dash] = await Promise.all([
        getDriverAssigned(resolvedDriverId),
        getDriverCompleted(resolvedDriverId),
        getDriverDashboard(resolvedDriverId),
      ]);

      setAssigned([...asgn].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
      setCompleted([...done].sort(
        (a, b) =>
          new Date(b.delivered_at ?? b.created_at).getTime() -
          new Date(a.delivered_at ?? a.created_at).getTime()
      ));
      setDashboard(dash);

      const serverStatus =
        (dash?.driver?.availability_status || dash?.driver?.status || "")
          .toUpperCase() as DriverAvailability;
      if (serverStatus) setDriverStatus(serverStatus);

    } catch (err: any) {
      const status = err?.response?.status;
      const msg =
        status === 401 ? "Session expired — please log in again." :
        status === 403 ? "Access denied. Driver account required." :
        status === 404 ? "Driver account not found." :
        err?.response?.data?.error ||
        `Could not load orders (HTTP ${status ?? "network error"})`;
      setError(msg);
      console.error("[DriverOrder] fetchAll error:", err?.response ?? err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [resolvedDriverId]);

  // Initial load + 30-second auto-refresh
  useEffect(() => {
    fetchAll();
    const interval = setInterval(() => fetchAll(true), 30_000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  // Close the payment dropdown when clicking anywhere outside it
  useEffect(() => {
    if (paymentMenuOrderId === null) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".do-payment-wrap")) {
        setPaymentMenuOrderId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [paymentMenuOrderId]);

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    clearTimeout(successTimer.current ?? undefined);
    successTimer.current = setTimeout(() => setSuccess(null), 4000);
  };

  const clearProofState = () => {
    setProofOrder(null);
    setProofFile(null);
    setProofPhotoUrl("");
    setProofNotes("");
    setProofCustName("");
    setProofCustPhone("");
    setUploadPct(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ─── Accept ──────────────────────────────────────────────────────────────────

  const handleAccept = async (orderId: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActionId(orderId);
    setError(null);
    try {
      await driverAcceptOrder(orderId);
      showSuccess(`Order #${orderId} accepted — you're now out for delivery!`);
      setDetailOrder(null);
      await fetchAll(true);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to accept order.");
    } finally {
      setActionId(null);
    }
  };

  // ─── Reject ───────────────────────────────────────────────────────────────────

  const handleReject = async () => {
    if (!rejectOrder) return;
    setActionId(rejectOrder.id);
    setError(null);
    try {
      await driverRejectOrder(rejectOrder.id);
      showSuccess(`Order #${rejectOrder.order_number} rejected — returned to delivery agent.`);
      setRejectOrder(null);
      setDetailOrder(null);
      await fetchAll(true);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to reject order.");
    } finally {
      setActionId(null);
    }
  };

  // ─── Open proof modal ─────────────────────────────────────────────────────────

  const openProof = (order: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setProofOrder(order);
    setProofCustName(
      [order.customer?.first_name, order.customer?.last_name].filter(Boolean).join(" ")
    );
    setProofCustPhone(order.customer?.phone_no || "");
  };

  // ─── Upload photo ─────────────────────────────────────────────────────────────

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !proofOrder) return;
    setProofFile(file);
    setUploadPct(0);
    setError(null);
    try {
      const url = await uploadOrderImage(proofOrder.id, file, setUploadPct);
      setProofPhotoUrl(url);
    } catch (err: any) {
      setError("Photo upload failed. Please try again.");
      setProofFile(null);
      setProofPhotoUrl("");
    } finally {
      setUploadPct(0);
    }
  };

  // ─── Submit proof ─────────────────────────────────────────────────────────────

  const handleSubmitProof = async () => {
    if (!proofOrder) return;
    setActionId(proofOrder.id);
    setError(null);
    try {
      await submitDeliveryProof(proofOrder.id, {
        delivery_photo:              proofPhotoUrl  || undefined,
        delivery_notes:              proofNotes     || undefined,
        customer_confirmation_name:  proofCustName  || undefined,
        customer_confirmation_phone: proofCustPhone || undefined,
      });
      showSuccess(
        `Proof submitted for order #${proofOrder.order_number}. Awaiting confirmation.`
      );
      clearProofState();
      setDetailOrder(null);
      await fetchAll(true);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to submit proof.");
    } finally {
      setActionId(null);
    }
  };

  // ─── Driver status toggle ─────────────────────────────────────────────────────

  const handleStatusChange = async (s: DriverAvailability) => {
    if (s === driverStatus || statusLoading) return;
    setStatusLoading(true);
    setError(null);
    try {
      await updateDriverStatus(resolvedDriverId, s);
      setDriverStatus(s);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to update status.");
    } finally {
      setStatusLoading(false);
    }
  };

  // ─── Payment link / QR code ──────────────────────────────────────────────────
  // Generates a payment link for the order via POST /payments/:order_id/create-link
  // (the same endpoint OrderManagement uses) and renders it as a scannable QR
  // using qrcode.react — works for any order, not just COD.

  const generateLinkForOrder = useCallback(async (order: any) => {
    setPaymentLoading(true);
    setPaymentError(null);
    try {
      const res = await createPaymentLink(order.id);
      setPaymentLink(res.payment_url);
      setPaymentLinksCache((prev) => ({ ...prev, [order.id]: res.payment_url }));
    } catch (err: any) {
      setPaymentError(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Failed to generate payment link."
      );
    } finally {
      setPaymentLoading(false);
    }
  }, []);

  const openPaymentLink = (order: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setPaymentOrder(order);
    setPaymentError(null);
    setPaymentCopied(false);

    const cached = paymentLinksCache[order.id];
    if (cached) {
      setPaymentLink(cached);
      setPaymentLoading(false);
    } else {
      setPaymentLink("");
      generateLinkForOrder(order);
    }
  };

  const closePaymentLink = () => {
    setPaymentOrder(null);
    setPaymentLink("");
    setPaymentError(null);
    setPaymentCopied(false);
  };

  const handleRegenerateLink = () => {
    if (!paymentOrder) return;
    generateLinkForOrder(paymentOrder);
  };

  const handleCopyPaymentLink = async () => {
    if (!paymentLink) return;
    try {
      await navigator.clipboard.writeText(paymentLink);
      setPaymentCopied(true);
      setTimeout(() => setPaymentCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — silently ignore, the link is still visible in the QR.
    }
  };

  // ─── "Payment" dropdown — choose Online Link vs COD-Paid ────────────────────

  const togglePaymentMenu = (orderId: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setPaymentMenuOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const handleOnlinePaymentClick = (order: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setPaymentMenuOrderId(null);
    openPaymentLink(order, e);
  };

  /**
   * Marks a COD order's payment as collected. Calls markCodPaymentPaid(orderId),
   * which should hit a backend route that flips payment_status to PAID/COMPLETED
   * (e.g. POST /orders/:id/mark-cod-paid — see the note below the component for
   * the service function + a matching Flask route to add).
   */
  const handleCodPaidClick = async (order: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setPaymentMenuOrderId(null);
    setCodMarkingId(order.id);
    setError(null);
    try {
      await markCodPaymentPaid(order.id);
      showSuccess(`Order #${order.order_number || order.id} marked as paid — COD collected.`);
      setDetailOrder(null);
      await fetchAll(true);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to update payment status.");
    } finally {
      setCodMarkingId(null);
    }
  };

  // ─── Derived ─────────────────────────────────────────────────────────────────

  const orders = tab === "active" ? assigned : completed;

  const driverName = useMemo(() => {
    const d = dashboard?.driver;
    if (!d) return "Driver";
    return `${d.first_name || ""} ${d.last_name || ""}`.trim() || "Driver";
  }, [dashboard]);

  const stats = useMemo(() => ({
    active:        assigned.length,
    delivered:     completed.length,
    pendingAmount: dashboard?.pending_amount ?? 0,
    rating:        dashboard?.rating ?? 0,
  }), [assigned, completed, dashboard]);

  // ─── Status predicates ────────────────────────────────────────────────────────

  const isNewOrder  = (s: string) => s?.toUpperCase() === "ASSIGNED_TO_DRIVER";
  const isOnTheWay  = (s: string) => s?.toUpperCase() === "OUT_FOR_DELIVERY";
  const isSubmitted = (s: string) => s?.toUpperCase() === "DELIVERY_SUBMITTED";
  const isCODPending = (o: any) =>
    o?.payment_method === "COD" && o?.payment_status === "PENDING";

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="do-wrap">

      {/* ── Success toast ── */}
      {success && (
        <div className="do-toast do-toast-ok">
          <span className="do-toast-icon">{Ico.check}</span>
          <span>{success}</span>
          <button onClick={() => setSuccess(null)}>×</button>
        </div>
      )}

      {/* ── Error banner ── */}
      {error && (
        <div className="do-toast do-toast-err">
          <span className="do-toast-icon">{Ico.alert}</span>
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* ── No driver ID warning ── */}
      {!resolvedDriverId && !loading && (
        <div className="do-no-driver">
          <span>{Ico.alert}</span>
          <div>
            <strong>Driver account not linked.</strong>
            <p>Your account does not have a driver profile. Please contact your admin.</p>
          </div>
        </div>
      )}

      {/* ── Profile header ── */}
      <header className="do-header">
        <div className="do-header-left">
          <div className="do-avatar">{driverName.charAt(0).toUpperCase()}</div>
          <div>
            <h2 className="do-driver-name">{driverName}</h2>
            <p className="do-driver-sub">
              {dashboard?.driver?.phone_no && (
                <span className="do-phone">
                  {Ico.phone}
                  {dashboard.driver.phone_no}
                </span>
              )}
              <span>Delivery Driver</span>
              {resolvedDriverId > 0 && (
                <span className="do-driver-id">ID #{resolvedDriverId}</span>
              )}
            </p>
          </div>
        </div>

        <div className="do-header-right">
          {/* Availability toggle */}
          <div className="do-avail">
            {(["ONLINE", "BUSY", "OFFLINE"] as DriverAvailability[]).map((s) => (
              <button
                key={s}
                className={`do-avail-btn do-avail-${s.toLowerCase()} ${driverStatus === s ? "active" : ""}`}
                onClick={() => handleStatusChange(s)}
                disabled={statusLoading}
              >
                <span className={`do-avail-dot dot-${s.toLowerCase()}`} />
                {s}
              </button>
            ))}
          </div>

          <button
            className={`do-refresh ${refreshing ? "spinning" : ""}`}
            onClick={() => fetchAll(true)}
            title="Refresh orders"
            disabled={refreshing}
          >
            {Ico.refresh}
          </button>
        </div>
      </header>

      {/* ── Stats row ── */}
      <div className="do-stats">
        <div className="do-stat">
          <span className="do-stat-icon stat-active">{Ico.truck}</span>
          <div>
            <strong>{stats.active}</strong>
            <span>Active</span>
          </div>
        </div>
        <div className="do-stat">
          <span className="do-stat-icon stat-done">{Ico.check}</span>
          <div>
            <strong>{stats.delivered}</strong>
            <span>Completed</span>
          </div>
        </div>
        <div className="do-stat">
          <span className="do-stat-icon stat-wallet">{Ico.wallet}</span>
          <div>
            <strong>{fmt.currency(stats.pendingAmount, dashboard?.currency)}</strong>
            <span>Pending Pay</span>
          </div>
        </div>
        {stats.rating > 0 && (
          <div className="do-stat">
            <span className="do-stat-icon stat-star">{Ico.star}</span>
            <div>
              <strong>{stats.rating.toFixed(1)}</strong>
              <span>Rating</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <nav className="do-tabs">
        <button
          className={`do-tab ${tab === "active" ? "active" : ""}`}
          onClick={() => setTab("active")}
        >
          My Orders
          {assigned.length > 0 && (
            <span className="do-badge do-badge-active">{assigned.length}</span>
          )}
        </button>
        <button
          className={`do-tab ${tab === "completed" ? "active" : ""}`}
          onClick={() => setTab("completed")}
        >
          Completed
          {completed.length > 0 && (
            <span className="do-badge do-badge-done">{completed.length}</span>
          )}
        </button>
      </nav>

      {/* ── Order list ── */}
      {loading ? (
        <div className="do-loading">
          <div className="do-spinner" />
          <p>Loading orders…</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="do-empty">
          <span className="do-empty-icon">
            {tab === "active" ? Ico.truck : Ico.check}
          </span>
          <h3>{tab === "active" ? "No active orders" : "No completed orders"}</h3>
          <p>
            {tab === "active"
              ? "Orders assigned to you will appear here."
              : "Delivered orders will appear here."}
          </p>
        </div>
      ) : (
        <div className="do-cards">
          {orders.map((order) => {
            const status = order.status?.toUpperCase() ?? "";
            const busy   = actionId === order.id;
            const addr   = order.delivery_address;
            const cust   = order.customer;

            return (
              <div
                key={order.id}
                className="do-card"
                onClick={() => setDetailOrder(order)}
              >
                {/* Top row */}
                <div className="do-card-top">
                  <div>
                    <span className="do-card-num">
                      #{order.order_number || String(order.id).padStart(5, "0")}
                    </span>
                    <span className="do-card-time">
                      {Ico.clock}
                      {fmt.date(order.created_at)} · {fmt.time(order.created_at)}
                    </span>
                  </div>
                  <span className={`do-pill ${statusClass(status)}`}>
                    {statusLabel(status)}
                  </span>
                </div>

                {/* Customer */}
                {cust && (
                  <div className="do-card-row">
                    {Ico.phone}
                    <span>
                      {[cust.first_name, cust.last_name].filter(Boolean).join(" ")}
                      {cust.phone_no && <em className="do-card-phone"> · {cust.phone_no}</em>}
                    </span>
                  </div>
                )}

                {/* Address */}
                {addr && (
                  <div className="do-card-row">
                    {Ico.pin}
                    <span>
                      {[addr.street, addr.city, addr.pincode].filter(Boolean).join(", ")}
                    </span>
                  </div>
                )}

                {/* Items */}
                <div className="do-card-items">
                  {(order.items || []).slice(0, 3).map((item: any, i: number) => (
                    <span key={i} className="do-item-chip">
                      ×{item.quantity} {item.product?.name || item.name || "Item"}
                    </span>
                  ))}
                  {(order.items || []).length > 3 && (
                    <span className="do-item-chip do-item-more">
                      +{order.items.length - 3} more
                    </span>
                  )}
                </div>

                {/* Total + payment */}
                <div className="do-card-footer-row">
                  <strong className="do-card-amount">
                    {fmt.currency(order.grand_total || order.total, order.currency)}
                  </strong>
                  <span className={`do-pay-chip ${isCODPending(order) ? "cod" : "paid"}`}>
                    {isCODPending(order)
                      ? `COD — Collect ${fmt.currency(order.grand_total || order.total, order.currency)}`
                      : `${order.payment_method || "PAID"} ✓`}
                  </span>
                </div>

                {/* Submitted notice */}
                {isSubmitted(status) && (
                  <div className="do-notice notice-info">
                    {Ico.check}
                    <span>Proof submitted — awaiting agent confirmation</span>
                  </div>
                )}

                {/* Action buttons */}
                {tab === "active" && (
                  <div className="do-card-actions" onClick={(e) => e.stopPropagation()}>
                    {isNewOrder(status) && (
                      <>
                        <button
                          className="do-btn btn-reject"
                          disabled={busy}
                          onClick={() => setRejectOrder(order)}
                        >
                          {Ico.x} Reject
                        </button>
                        <button
                          className="do-btn btn-accept"
                          disabled={busy}
                          onClick={() => handleAccept(order.id)}
                        >
                          {busy ? (
                            <><div className="do-spinner sm" /> Accepting…</>
                          ) : (
                            <>{Ico.check} Accept</>
                          )}
                        </button>
                      </>
                    )}

                    {isOnTheWay(status) && (
                      <>
                        {/* Payment button — appears once the order is accepted.
                            Opens a small menu: Online Payment Link (QR) or COD — Mark as Paid. */}
                        <div className="do-payment-wrap">
                          <button
                            className={`do-btn btn-payment ${paymentMenuOrderId === order.id ? "open" : ""}`}
                            onClick={(e) => togglePaymentMenu(order.id, e)}
                          >
                            {Ico.wallet} Payment
                          </button>

                          {paymentMenuOrderId === order.id && (
                            <div className="do-payment-menu" onClick={(e) => e.stopPropagation()}>
                              <button
                                className="do-payment-menu-item"
                                onClick={(e) => handleOnlinePaymentClick(order, e)}
                              >
                                <span className="do-payment-menu-icon online">{Ico.qrcode}</span>
                                <span>
                                  Online Payment Link
                                  <small>Generate a scannable payment QR</small>
                                </span>
                              </button>
                              <button
                                className="do-payment-menu-item"
                                disabled={codMarkingId === order.id}
                                onClick={(e) => handleCodPaidClick(order, e)}
                              >
                                <span className="do-payment-menu-icon cod">{Ico.cash}</span>
                                <span>
                                  {codMarkingId === order.id ? "Marking as paid…" : "COD — Mark as Paid"}
                                  <small>Cash collected from customer</small>
                                </span>
                              </button>
                            </div>
                          )}
                        </div>

                        <button
                          className="do-btn btn-proof"
                          disabled={busy}
                          onClick={() => openProof(order)}
                        >
                          {busy ? (
                            <><div className="do-spinner sm" /> Submitting…</>
                          ) : (
                            <>{Ico.camera} Submit Proof</>
                          )}
                        </button>
                      </>
                    )}

                    {isSubmitted(status) && (
                      <span className="do-waiting-chip">Awaiting confirmation…</span>
                    )}
                  </div>
                )}

                {tab === "completed" && (
                  <div className="do-card-actions">
                    <span className="do-done-chip">
                      {Ico.check}
                      Delivered {order.delivered_at ? fmt.date(order.delivered_at) : ""}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Order Detail Modal ── */}
      {detailOrder && (
        <div className="do-backdrop" onClick={() => setDetailOrder(null)}>
          <div className="do-modal" onClick={(e) => e.stopPropagation()}>
            <div className="do-modal-head">
              <div>
                <h3>Order #{detailOrder.order_number || detailOrder.id}</h3>
                <p className="do-modal-sub">
                  {detailOrder.order_type} · {fmt.date(detailOrder.created_at)}{" "}
                  {fmt.time(detailOrder.created_at)}
                </p>
              </div>
              <button className="do-modal-close" onClick={() => setDetailOrder(null)}>
                {Ico.x}
              </button>
            </div>

            <div className="do-modal-body">
              <span className={`do-pill ${statusClass(detailOrder.status)} do-pill-mb`}>
                {statusLabel(detailOrder.status)}
              </span>

              {isCODPending(detailOrder) && (
                <div className="do-notice notice-warn">
                  {Ico.alert}
                  <span>
                    Collect <strong>{fmt.currency(detailOrder.grand_total || detailOrder.total, detailOrder.currency)}</strong> in cash on delivery
                  </span>
                </div>
              )}

              {/* Order info: Expected Date / Time Slot / Area */}
              <section className="do-modal-section">
                <h4>Order Info</h4>
                <div className="do-info-grid">
                  <div>
                    <p className="do-modal-label">Expected Date</p>
                    <p className="do-modal-value">{fmt.date(detailOrder.delivery_date)}</p>
                  </div>
                  <div>
                    <p className="do-modal-label">Time Slot</p>
                    <p className="do-modal-value">{detailOrder.delivery_time_slot || "—"}</p>
                  </div>
                  <div className="do-info-grid-full">
                    <p className="do-modal-label">Area</p>
                    <p className="do-modal-value">
                      {detailOrder.delivery_area?.name ||
                        detailOrder.area?.name ||
                        detailOrder.delivery_address?.area?.name ||
                        detailOrder.delivery_address?.area_name ||
                        "—"}
                    </p>
                  </div>
                </div>
              </section>

              {/* Customer & Address combined */}
              {(detailOrder.customer || detailOrder.delivery_address) && (
                <section className="do-modal-section">
                  <h4>Customer & Address</h4>

                  {detailOrder.customer && (
                    <div className="do-info-grid">
                      <div>
                        <p className="do-modal-label">Name</p>
                        <p className="do-modal-value">
                          {[detailOrder.customer.first_name, detailOrder.customer.last_name]
                            .filter(Boolean).join(" ") || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="do-modal-label">Phone</p>
                        <p className="do-modal-value">{detailOrder.customer.phone_no || "—"}</p>
                      </div>
                      {detailOrder.customer.email && (
                        <div className="do-info-grid-full">
                          <p className="do-modal-label">Email</p>
                          <p className="do-modal-value">{detailOrder.customer.email}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {detailOrder.delivery_address && (() => {
                    const addr = detailOrder.delivery_address;
                    const summary =
                      [addr.street, addr.city].filter(Boolean).join(", ") ||
                      [addr.city, addr.state].filter(Boolean).join(", ");
                    const building = addrField(addr, ["building", "building_name", "building_no"]);
                    const block    = addrField(addr, ["block", "block_no"]);
                    const avenue   = addrField(addr, ["avenue", "avenue_name"]);
                    const street   = addrField(addr, ["street", "street_name"]);
                    const floorApt = [
                      addrField(addr, ["floor", "floor_no"]),
                      addrField(addr, ["apartment", "apartment_no", "flat_no", "unit"]),
                    ].filter(Boolean).join(" ");
                    const notes = addrField(addr, ["address_notes", "notes", "landmark"]);

                    return (
                      <div className="do-address-box">
                        {summary && (
                          <p className="do-address-summary">
                            <strong>Address:</strong> {summary}
                          </p>
                        )}
                        {(building || block || avenue || street || floorApt || notes) && (
                          <div className="do-address-fields">
                            {building && <p className="do-address-field"><strong>Building:</strong> {building}</p>}
                            {block    && <p className="do-address-field"><strong>Block:</strong> {block}</p>}
                            {avenue   && <p className="do-address-field"><strong>Avenue:</strong> {avenue}</p>}
                            {street   && <p className="do-address-field"><strong>Street:</strong> {street}</p>}
                            {floorApt && <p className="do-address-field"><strong>Floor/Apt:</strong> {floorApt}</p>}
                            {notes    && <p className="do-address-field"><strong>Address notes:</strong> {notes}</p>}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </section>
              )}

              {/* Ordered products */}
              <section className="do-modal-section">
                <h4>Ordered Products</h4>
                {(detailOrder.items || []).map((item: any, i: number) => {
                  const img = item.product?.image || item.image;
                  return (
                    <div key={i} className="do-modal-item">
                      {img ? (
                        <img
                          className="do-modal-item-img"
                          src={img}
                          alt={item.product?.name || item.name || "Item"}
                        />
                      ) : (
                        <span className="do-modal-item-img-fallback">{Ico.camera}</span>
                      )}
                      <span className="do-modal-qty">×{item.quantity}</span>
                      <span className="do-modal-item-name">{item.product?.name || item.name}</span>
                      <span className="do-modal-price">
                        {fmt.currency(item.line_total || item.price * item.quantity || 0, detailOrder?.currency)}
                      </span>
                    </div>
                  );
                })}
              </section>

              <section className="do-modal-totals">
                <div className="do-total-row">
                  <span>Subtotal</span>
                  <span>{fmt.currency(detailOrder.subtotal, detailOrder.currency)}</span>
                </div>
                <div className="do-total-row">
                  <span>Delivery charge</span>
                  <span>{fmt.currency(detailOrder.delivery_charge, detailOrder.currency)}</span>
                </div>
                {Number(detailOrder.discount) > 0 && (
                  <div className="do-total-row disc">
                    <span>Discount</span>
                    <span>−{fmt.currency(detailOrder.discount, detailOrder.currency)}</span>
                  </div>
                )}
                <div className="do-total-row grand">
                  <span>Total</span>
                  <strong>{fmt.currency(detailOrder.grand_total || detailOrder.total, detailOrder.currency)}</strong>
                </div>
              </section>
            </div>

            <div className="do-modal-foot">
              <button className="do-btn btn-ghost" onClick={() => setDetailOrder(null)}>
                Close
              </button>
              {isNewOrder(detailOrder.status) && tab === "active" && (
                <>
                  <button
                    className="do-btn btn-reject"
                    disabled={actionId === detailOrder.id}
                    onClick={() => { setDetailOrder(null); setRejectOrder(detailOrder); }}
                  >
                    {Ico.x} Reject
                  </button>
                  <button
                    className="do-btn btn-accept"
                    disabled={actionId === detailOrder.id}
                    onClick={() => { setDetailOrder(null); handleAccept(detailOrder.id); }}
                  >
                    {Ico.check} Accept Order
                  </button>
                </>
              )}
              {isOnTheWay(detailOrder.status) && tab === "active" && (
                <>
                  <button
                    className="do-btn btn-payment-online"
                    onClick={() => { setDetailOrder(null); openPaymentLink(detailOrder); }}
                  >
                    {Ico.qrcode} Online Payment Link
                  </button>
                  <button
                    className="do-btn btn-payment-cod"
                    disabled={codMarkingId === detailOrder.id}
                    onClick={() => handleCodPaidClick(detailOrder)}
                  >
                    {codMarkingId === detailOrder.id ? (
                      <><div className="do-spinner sm" /> Marking…</>
                    ) : (
                      <>{Ico.cash} COD — Paid</>
                    )}
                  </button>
                  <button
                    className="do-btn btn-proof"
                    disabled={actionId === detailOrder.id}
                    onClick={() => { setDetailOrder(null); openProof(detailOrder); }}
                  >
                    {Ico.camera} Submit Proof
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Confirmation Modal ── */}
      {rejectOrder && (
        <div className="do-backdrop" onClick={() => setRejectOrder(null)}>
          <div className="do-modal do-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="do-modal-head">
              <h3>Reject Order</h3>
              <button className="do-modal-close" onClick={() => setRejectOrder(null)}>
                {Ico.x}
              </button>
            </div>
            <div className="do-modal-body">
              <p className="do-confirm-text">
                Rejecting <strong>#{rejectOrder.order_number}</strong> will return it to the
                delivery agent to assign a different driver. Are you sure?
              </p>
            </div>
            <div className="do-modal-foot">
              <button
                className="do-btn btn-ghost"
                disabled={actionId === rejectOrder.id}
                onClick={() => setRejectOrder(null)}
              >
                Cancel
              </button>
              <button
                className="do-btn btn-reject"
                disabled={actionId === rejectOrder.id}
                onClick={handleReject}
              >
                {actionId === rejectOrder.id ? (
                  <><div className="do-spinner sm" /> Rejecting…</>
                ) : (
                  <>{Ico.x} Yes, Reject</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delivery Proof Modal ── */}
      {proofOrder && (
        <div className="do-backdrop" onClick={clearProofState}>
          <div className="do-modal" onClick={(e) => e.stopPropagation()}>
            <div className="do-modal-head">
              <div>
                <h3>Submit Delivery Proof</h3>
                <p className="do-modal-sub">Order #{proofOrder.order_number}</p>
              </div>
              <button className="do-modal-close" onClick={clearProofState}>{Ico.x}</button>
            </div>

            <div className="do-modal-body">
              {isCODPending(proofOrder) && (
                <div className="do-notice notice-warn">
                  {Ico.alert}
                  <span>
                    Collect <strong>{fmt.currency(proofOrder.grand_total || proofOrder.total, proofOrder.currency)}</strong> cash before submitting proof
                  </span>
                </div>
              )}

              {/* Upload progress bar */}
              {proofFile && !proofPhotoUrl && uploadPct > 0 && (
                <div className="do-progress-bar">
                  <div className="do-progress-fill" style={{ width: `${uploadPct}%` }} />
                  <span>{uploadPct}%</span>
                </div>
              )}

              <div className="do-field">
                <label className="do-label">
                  Delivery Photo <span className="do-optional">(recommended)</span>
                </label>
                {proofPhotoUrl ? (
                  <div className="do-photo-preview">
                    <img src={proofPhotoUrl} alt="Delivery proof" />
                    <button
                      className="do-photo-remove"
                      onClick={() => { setProofFile(null); setProofPhotoUrl(""); }}
                    >
                      {Ico.x} Remove
                    </button>
                  </div>
                ) : (
                  <button
                    className="do-upload-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!!proofFile && !proofPhotoUrl}
                  >
                    {proofFile && !proofPhotoUrl ? (
                      <><div className="do-spinner sm" /> Uploading…</>
                    ) : (
                      <>{Ico.camera} Choose Photo</>
                    )}
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
              </div>

              <div className="do-field">
                <label className="do-label">Name of person who received the order</label>
                <input
                  className="do-input"
                  type="text"
                  placeholder="Customer / recipient name"
                  value={proofCustName}
                  onChange={(e) => setProofCustName(e.target.value)}
                />
              </div>

              <div className="do-field">
                <label className="do-label">
                  Phone <span className="do-optional">(optional)</span>
                </label>
                <input
                  className="do-input"
                  type="tel"
                  placeholder="Confirm recipient phone"
                  value={proofCustPhone}
                  onChange={(e) => setProofCustPhone(e.target.value)}
                />
              </div>

              <div className="do-field">
                <label className="do-label">
                  Notes <span className="do-optional">(optional)</span>
                </label>
                <textarea
                  className="do-input"
                  rows={3}
                  placeholder="e.g. Left at door, handed to security, cash collected…"
                  value={proofNotes}
                  onChange={(e) => setProofNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="do-modal-foot">
              <button
                className="do-btn btn-ghost"
                disabled={actionId === proofOrder.id}
                onClick={clearProofState}
              >
                Cancel
              </button>
              <button
                className="do-btn btn-proof"
                disabled={actionId === proofOrder.id || (!!proofFile && !proofPhotoUrl)}
                onClick={handleSubmitProof}
              >
                {actionId === proofOrder.id ? (
                  <><div className="do-spinner sm" /> Submitting…</>
                ) : (
                  <>{Ico.camera} Submit Proof</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Payment Link / QR Code Modal ── */}
      {paymentOrder && (
        <div className="do-backdrop" onClick={closePaymentLink}>
          <div className="do-modal do-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="do-modal-head">
              <div>
                <h3>Payment QR</h3>
                <p className="do-modal-sub">Order #{paymentOrder.order_number}</p>
              </div>
              <button className="do-modal-close" onClick={closePaymentLink}>{Ico.x}</button>
            </div>

            <div className="do-modal-body">
              {isCODPending(paymentOrder) && (
                <div className="do-notice notice-warn">
                  {Ico.alert}
                  <span>
                    Amount due: <strong>{fmt.currency(paymentOrder.grand_total || paymentOrder.total, paymentOrder.currency)}</strong>
                  </span>
                </div>
              )}

              {/* Loading state — link is being generated on the server */}
              {paymentLoading && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 10,
                    padding: "28px 0",
                  }}
                >
                  <div className="do-spinner" />
                  <p style={{ margin: 0, fontSize: 13, color: "#6E7A5E" }}>
                    Generating payment link…
                  </p>
                </div>
              )}

              {/* Error state */}
              {paymentError && !paymentLoading && (
                <>
                  <div className="do-notice notice-warn">
                    {Ico.alert}
                    <span>{paymentError}</span>
                  </div>
                  <button
                    className="do-btn btn-ghost"
                    style={{ width: "100%", marginTop: 10 }}
                    onClick={handleRegenerateLink}
                  >
                    {Ico.refresh} Retry
                  </button>
                </>
              )}

              {/* QR + link, rendered with qrcode.react */}
              {paymentLink && !paymentLoading && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 12,
                    padding: "8px 0 4px",
                  }}
                >
                  <div
                    style={{
                      padding: 16,
                      background: "#ffffff",
                      border: "1.5px solid #E3DBB0",
                      borderRadius: 14,
                    }}
                  >
                    <QRCodeSVG
                      value={paymentLink}
                      size={220}
                      level="M"
                      bgColor="#ffffff"
                      fgColor="#2B3324"
                    />
                  </div>

                  <p
                    style={{
                      fontSize: 12.5,
                      color: "#6E7A5E",
                      textAlign: "center",
                      margin: 0,
                      wordBreak: "break-all",
                    }}
                  >
                    {paymentLink}
                  </p>

                  <p
                    style={{
                      fontSize: 12.5,
                      color: "#6E7A5E",
                      textAlign: "center",
                      margin: 0,
                    }}
                  >
                    Ask the customer to scan this code with any UPI / payment app to pay
                    {isCODPending(paymentOrder)
                      ? ` ${fmt.currency(paymentOrder.grand_total || paymentOrder.total, paymentOrder.currency)}`
                      : ""}.
                  </p>

                  <div style={{ display: "flex", gap: 8, width: "100%" }}>
                    <button
                      className="do-btn btn-ghost"
                      style={{ flex: 1 }}
                      onClick={handleCopyPaymentLink}
                    >
                      {Ico.copy} {paymentCopied ? "Copied!" : "Copy Link"}
                    </button>
                    <button
                      className="do-btn btn-ghost"
                      style={{ flex: 1 }}
                      onClick={handleRegenerateLink}
                      disabled={paymentLoading}
                    >
                      {Ico.refresh} Regenerate
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="do-modal-foot">
              <button className="do-btn btn-ghost" onClick={closePaymentLink}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverOrder;
