import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  Agent,
  AgentProduct,
  getAgents,
  createAgentProduct,
  getAllAgentProducts,
  updateAgentProduct,
  deleteAgentProduct,
} from "../services/agentService";
import "./Agentmenumanagement.css";

// ─────────────────────────────────────────────────────────────────────────────
// Cloudinary upload
//
// NOTE: the project's shared `uploadCloudinaryImage()` service wrapper wasn't
// available to this file, so the exact same contract (same CLOUD_NAME /
// UPLOAD_PRESET, upload-immediately, return `secure_url`) is reproduced here
// with a direct XHR call so upload progress can be reported. If a shared
// `uploadCloudinaryImage` helper exists in your services layer, swap the body
// of `uploadToCloudinary` below to call it instead — the calling code
// (ImageUploader) doesn't need to change.
// ─────────────────────────────────────────────────────────────────────────────

const CLOUD_NAME = "djwyoxnqy";
const UPLOAD_PRESET = "CakeNTake_upload";

const uploadToCloudinary = (file: File, onProgress?: (percent: number) => void): Promise<string> => {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", UPLOAD_PRESET);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const res = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && res.secure_url) {
          resolve(res.secure_url as string);
        } else {
          reject(new Error(res?.error?.message || "Image upload failed."));
        }
      } catch {
        reject(new Error("Image upload failed."));
      }
    };
    xhr.onerror = () => reject(new Error("Image upload failed. Check your connection."));
    xhr.send(data);
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Small utilities
// ─────────────────────────────────────────────────────────────────────────────

type SortKey = "name" | "agent" | "price" | "is_active" | "created_at";
type SortDirection = "asc" | "desc";
type ModalKind =
  | { type: "add" }
  | { type: "edit"; product: AgentProduct }
  | { type: "view"; product: AgentProduct }
  | { type: "delete"; product: AgentProduct }
  | null;

interface Toast {
  id: number;
  kind: "success" | "error" | "info";
  message: string;
}

const PAGE_SIZE = 8;

function classNames(...items: Array<string | false | null | undefined>) {
  return items.filter(Boolean).join(" ");
}

function agentFullName(agent?: Agent | null) {
  if (!agent) return "Unassigned";
  return `${agent.first_name} ${agent.last_name}`.trim();
}

function formatDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(value: number) {
  if (Number.isNaN(value)) return "—";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

/** Animates a number counting up from 0 whenever `value` changes. */
function useAnimatedCounter(value: number, durationMs = 700) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(0);

  useEffect(() => {
    fromRef.current = display;
    startRef.current = null;
    let raf = 0;

    const step = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = fromRef.current + (value - fromRef.current) * eased;
      setDisplay(current);
      if (progress < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, durationMs]);

  return display;
}

// ─────────────────────────────────────────────────────────────────────────────
// Icons (inline SVG — no external icon dependency, mirrors AgentManagement)
// ─────────────────────────────────────────────────────────────────────────────

const Icon = {
  Box: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m3.3 7 8.7 5 8.7-5M12 22V12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  CheckCircle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" />
      <path d="M22 4 12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Slash: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="10" />
      <path d="m4.9 4.9 14.2 14.2" strokeLinecap="round" />
    </svg>
  ),
  DollarSign: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 1v22" strokeLinecap="round" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Search: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" strokeLinecap="round" />
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  ),
  MoreVertical: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="12" cy="19" r="1.6" />
    </svg>
  ),
  Edit: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 21v-3.75L16.81 3.44a2 2 0 0 1 2.83 0l1.92 1.92a2 2 0 0 1 0 2.83L7.75 23H3z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 5l5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Refresh: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M23 4v6h-6M1 20v-6h6" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Download: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Close: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  ),
  Warning: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
    </svg>
  ),
  Empty: () => (
    <svg viewBox="0 0 160 120" fill="none">
      <rect x="24" y="30" width="112" height="72" rx="10" fill="#f2f6ec" stroke="#d8e4c7" strokeWidth="2" />
      <path d="M24 46h112" stroke="#d8e4c7" strokeWidth="2" />
      <circle cx="60" cy="70" r="10" fill="#e4edd7" />
      <rect x="80" y="65" width="40" height="6" rx="3" fill="#e4edd7" />
      <rect x="80" y="78" width="28" height="6" rx="3" fill="#eef3e6" />
      <circle cx="118" cy="30" r="16" fill="#d8e4c7" opacity="0.5" />
      <path d="M112 30l4 4 8-8" stroke="#6b8a5b" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  ChevronUp: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m6 15 6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  ChevronDown: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Image: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  UploadCloud: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M16 16l-4-4-4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 12v9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 16l-4-4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

// ─────────────────────────────────────────────────────────────────────────────
// Toast system
// ─────────────────────────────────────────────────────────────────────────────

function ToastStack({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="am-toast-stack" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={classNames("am-toast", `am-toast--${t.kind}`)}>
          <span>{t.message}</span>
          <button aria-label="Dismiss notification" onClick={() => onDismiss(t.id)}>
            <Icon.Close />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat card
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  prefix,
  suffix,
  decimals = 0,
  icon,
  tone,
}: {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  icon: React.ReactNode;
  tone: "green" | "check" | "gray" | "percent";
}) {
  const animated = useAnimatedCounter(value);
  return (
    <div className="am-stat-card">
      <div className={classNames("am-stat-icon", `am-stat-icon--${tone}`)}>{icon}</div>
      <div className="am-stat-body">
        <span className="am-stat-label">{label}</span>
        <span className="am-stat-value">
          {prefix ?? ""}
          {decimals > 0 ? animated.toFixed(decimals) : Math.round(animated)}
          {suffix ?? ""}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Status badge
// ─────────────────────────────────────────────────────────────────────────────

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={classNames("am-badge", active ? "am-badge--active" : "am-badge--inactive")}>
      <span className="am-badge-dot" />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Product thumbnail (table + view modal)
// ─────────────────────────────────────────────────────────────────────────────

function ProductThumb({ src, alt, size = "sm" }: { src?: string | null; alt: string; size?: "sm" | "lg" }) {
  const [errored, setErrored] = useState(false);
  const showPlaceholder = !src || errored;

  if (size === "lg") {
    return showPlaceholder ? (
      <div className="am-thumb-lg-placeholder">
        <Icon.Image />
      </div>
    ) : (
      <img className="am-thumb-lg" src={src as string} alt={alt} onError={() => setErrored(true)} />
    );
  }

  return showPlaceholder ? (
    <div className="am-thumb-placeholder">
      <Icon.Image />
    </div>
  ) : (
    <img className="am-thumb" src={src as string} alt={alt} onError={() => setErrored(true)} />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Actions dropdown
// ─────────────────────────────────────────────────────────────────────────────

function ActionsMenu({
  product,
  busy,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
}: {
  product: AgentProduct;
  busy: boolean;
  onView: () => void;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      // If click is inside the trigger wrapper or inside the portal menu, keep it open.
      if (
        (ref.current && ref.current.contains(target)) ||
        (menuRef.current && menuRef.current.contains(target))
      ) {
        return;
      }
      setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    const el = triggerRef.current;
    if (!el) return;

    function update() {
      const rect = el.getBoundingClientRect();
      const menuWidth = 220;
      const leftCandidate = rect.right - menuWidth;
      const left = Math.max(8, leftCandidate);
      const top = rect.bottom + 6 + window.scrollY;
      setMenuStyle({ position: "absolute", top: `${top}px`, left: `${left + window.scrollX}px`, zIndex: 100000 });
    }

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
    };
  }, [open]);

  const runAndClose = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  return (
    <div className="am-actions" ref={ref}>
      <button
        type="button"
        ref={triggerRef}
        className="am-actions-trigger"
        onClick={() => setOpen((o) => !o)}
        disabled={busy}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for ${product.name}`}
      >
        <Icon.MoreVertical />
        {/* visible fallback if SVG doesn't render for some reason */}
        <span className="am-actions-trigger-fallback" aria-hidden="true">⋯</span>
      </button>

      {open &&
        createPortal(
                  <div ref={menuRef} className="am-actions-menu" role="menu" style={menuStyle} onMouseDown={(e) => e.stopPropagation()}>
            <button type="button" role="menuitem" onClick={() => runAndClose(onView)}>
              <span className="am-menu-item-icon"><Icon.Image /></span>
              View
            </button>
            <button type="button" role="menuitem" onClick={() => runAndClose(onEdit)}>
              <span className="am-menu-item-icon"><Icon.Edit /></span>
              Edit
            </button>
            <button type="button" role="menuitem" onClick={() => runAndClose(onToggleStatus)}>
              <span className="am-menu-item-icon">{product.is_active ? <Icon.Slash /> : <Icon.CheckCircle />}</span>
              {product.is_active ? "Disable" : "Enable"}
            </button>
            <div className="am-actions-divider" />
            <button type="button" role="menuitem" className="am-actions-danger" onClick={() => runAndClose(onDelete)}>
              <span className="am-menu-item-icon"><Icon.Warning /></span>
              Delete
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Modal shell
// ─────────────────────────────────────────────────────────────────────────────

function ModalShell({
  title,
  subtitle,
  onClose,
  children,
  width = "md",
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: "sm" | "md" | "lg";
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="am-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={classNames("am-modal", `am-modal--${width}`)} role="dialog" aria-modal="true" aria-label={title}>
        <div className="am-modal-header">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="am-modal-close" onClick={onClose} aria-label="Close dialog">
            <Icon.Close />
          </button>
        </div>
        <div className="am-modal-body">{children}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Image uploader (drag & drop + choose file, immediate upload, preview)
// ─────────────────────────────────────────────────────────────────────────────

function ImageUploader({
  value,
  disabled,
  onChange,
  onError,
}: {
  value: string;
  disabled?: boolean;
  onChange: (url: string) => void;
  onError: (message: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string>("");

  const handleFile = async (file: File | null | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      onError("Please choose an image file.");
      return;
    }
    setFileName(file.name);
    setUploading(true);
    setProgress(0);
    try {
      const url = await uploadToCloudinary(file, setProgress);
      onChange(url);
    } catch (err: any) {
      onError(err?.message || "Couldn't upload the image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled || uploading) return;
    handleFile(e.dataTransfer.files?.[0]);
  };

  if (value && !uploading) {
    return (
      <div className="am-upload-preview">
        <img src={value} alt="Product preview" />
        <div className="am-upload-preview-body">
          <span className="am-upload-preview-name">Image uploaded</span>
          <div className="am-upload-preview-actions">
            <button type="button" onClick={() => inputRef.current?.click()} disabled={disabled}>
              Replace
            </button>
            <button type="button" className="am-actions-danger" onClick={() => onChange("")} disabled={disabled}>
              Remove
            </button>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    );
  }

  return (
    <div
      className={classNames("am-upload-zone", dragOver && "am-upload-zone--drag")}
      onClick={() => !disabled && !uploading && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled && !uploading) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      role="button"
      tabIndex={0}
    >
      <Icon.UploadCloud />
      {uploading ? (
        <>
          <strong>Uploading {fileName}…</strong>
          <div className="am-upload-progress-track" style={{ width: "100%" }}>
            <div className="am-upload-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </>
      ) : (
        <>
          <strong>Drag &amp; drop an image here</strong>
          <span>or click to choose a file</span>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFile(e.target.files?.[0])}
        disabled={disabled || uploading}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Add / Edit product modal
// ─────────────────────────────────────────────────────────────────────────────

interface ProductFormState {
  agent_id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  is_active: boolean;
}

function ProductFormModal({
  mode,
  initial,
  agents,
  busy,
  onClose,
  onSubmit,
}: {
  mode: "add" | "edit";
  initial?: AgentProduct;
  agents: Agent[];
  busy: boolean;
  onClose: () => void;
  onSubmit: (form: ProductFormState) => Promise<void>;
}) {
  const [form, setForm] = useState<ProductFormState>({
    agent_id: initial ? String(initial.agent_id) : "",
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    price: initial ? String(initial.price ?? "") : "",
    image: initial?.image ?? "",
    is_active: initial?.is_active ?? true,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormState, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ProductFormState, boolean>>>({});
  const [uploadError, setUploadError] = useState<string | null>(null);

  const validate = (values: ProductFormState) => {
    const e: Partial<Record<keyof ProductFormState, string>> = {};
    if (!values.agent_id) e.agent_id = "Select an agent.";
    if (!values.name.trim()) e.name = "Product name is required.";
    const price = Number(values.price);
    if (values.price === "" || Number.isNaN(price)) e.price = "Enter a price.";
    else if (price <= 0) e.price = "Price must be greater than zero.";
    return e;
  };

  useEffect(() => {
    setErrors(validate(form));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const handleChange = (key: keyof ProductFormState, value: string | boolean) => {
    setForm((f) => ({ ...f, [key]: value as never }));
  };

  const handleBlur = (key: keyof ProductFormState) => setTouched((t) => ({ ...t, [key]: true }));

  const isValid = Object.keys(validate(form)).length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ agent_id: true, name: true, price: true });
    if (!isValid) return;
    await onSubmit(form);
  };

  const showError = (key: keyof ProductFormState) => touched[key] && errors[key];

  return (
    <ModalShell
      title={mode === "add" ? "Add Product" : "Edit Product"}
      subtitle={
        mode === "add"
          ? "Create a custom product and assign it to a sales agent."
          : `Update details for ${initial?.name ?? "this product"}.`
      }
      onClose={onClose}
      width="lg"
    >
      <form className="am-form" onSubmit={handleSubmit} noValidate>
        <div className="am-form-grid">
          <label className="am-field am-field--full">
            <span>Agent</span>
            <select
              value={form.agent_id}
              onChange={(e) => handleChange("agent_id", e.target.value)}
              onBlur={() => handleBlur("agent_id")}
              disabled={busy}
            >
              <option value="">Select Agent</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {agentFullName(a)}
                </option>
              ))}
            </select>
            {showError("agent_id") && <em>{errors.agent_id}</em>}
          </label>

          <label className="am-field am-field--full">
            <span>Product Name</span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              onBlur={() => handleBlur("name")}
              placeholder="Custom Birthday Cake"
              disabled={busy}
            />
            {showError("name") && <em>{errors.name}</em>}
          </label>

          <label className="am-field am-field--full">
            <span>Description</span>
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe this product…"
              disabled={busy}
            />
          </label>

          <label className="am-field">
            <span>Price</span>
            <div className="am-price-input">
              <span>$</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.price}
                onChange={(e) => handleChange("price", e.target.value)}
                onBlur={() => handleBlur("price")}
                placeholder="0.00"
                disabled={busy}
              />
            </div>
            {showError("price") && <em>{errors.price}</em>}
          </label>

          <label className="am-field am-field--full">
            <span>Product Image</span>
            <ImageUploader
              value={form.image}
              disabled={busy}
              onChange={(url) => {
                setUploadError(null);
                handleChange("image", url);
              }}
              onError={(msg) => setUploadError(msg)}
            />
            {uploadError && <em>{uploadError}</em>}
          </label>
        </div>

        <div className="am-toggle-row">
          <div>
            <span className="am-toggle-label">Status</span>
            <p className="am-toggle-hint">Inactive products are hidden from the agent's menu.</p>
          </div>
          <button
            type="button"
            className={classNames("am-switch", form.is_active && "am-switch--on")}
            role="switch"
            aria-checked={form.is_active}
            onClick={() => handleChange("is_active", !form.is_active)}
            disabled={busy}
          >
            <span className="am-switch-thumb" />
          </button>
          <span className={classNames("am-toggle-state", form.is_active ? "is-on" : "is-off")}>
            {form.is_active ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="am-modal-footer">
          <button type="button" className="am-btn am-btn--ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="am-btn am-btn--primary" disabled={busy || !isValid}>
            {busy ? "Saving…" : mode === "add" ? "Create Product" : "Save Changes"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// View product modal
// ─────────────────────────────────────────────────────────────────────────────

function ViewProductModal({
  product,
  agent,
  onClose,
}: {
  product: AgentProduct;
  agent?: Agent;
  onClose: () => void;
}) {
  return (
    <ModalShell title="Product Details" onClose={onClose} width="md">
      <div className="am-profile">
        <ProductThumb src={product.image} alt={product.name} size="lg" />

        <div className="am-profile-header" style={{ marginTop: 18, justifyContent: "center" }}>
          <div>
            <h3 style={{ textAlign: "center" }}>{product.name}</h3>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <StatusBadge active={product.is_active} />
            </div>
          </div>
        </div>

        <div className="am-profile-grid">
          <div className="am-profile-item">
            <span>Price</span>
            <strong>{formatCurrency(Number(product.price ?? 0))}</strong>
          </div>
          <div className="am-profile-item">
            <span>Agent</span>
            <strong>{agentFullName(agent)}</strong>
          </div>
          <div className="am-profile-item">
            <span>Created</span>
            <strong>{formatDate(product.created_at)}</strong>
          </div>
          <div className="am-profile-item">
            <span>Last Updated</span>
            <strong>{formatDate(product.updated_at)}</strong>
          </div>
        </div>

        <div className="am-profile-description">
          <h4>Description</h4>
          <p>{product.description?.trim() ? product.description : "No description provided."}</p>
        </div>
      </div>

      <div className="am-modal-footer">
        <button className="am-btn am-btn--primary" onClick={onClose}>
          Close
        </button>
      </div>
    </ModalShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Delete confirmation modal
// ─────────────────────────────────────────────────────────────────────────────

function DeleteProductModal({
  product,
  busy,
  serverError,
  onClose,
  onConfirm,
}: {
  product: AgentProduct;
  busy: boolean;
  serverError: string | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  return (
    <ModalShell title="Delete Product?" onClose={onClose} width="sm">
      <div className="am-delete-body">
        <div className="am-delete-icon">
          <Icon.Warning />
        </div>
        <p>
          Are you sure you want to delete <strong>{product.name}</strong>? This action cannot be
          undone.
        </p>
        {serverError && <div className="am-inline-error">{serverError}</div>}
      </div>
      <div className="am-modal-footer">
        <button className="am-btn am-btn--ghost" onClick={onClose} disabled={busy}>
          Cancel
        </button>
        <button className="am-btn am-btn--danger" onClick={onConfirm} disabled={busy}>
          {busy ? "Deleting…" : "Delete"}
        </button>
      </div>
    </ModalShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Table skeleton + empty state
// ─────────────────────────────────────────────────────────────────────────────

function SkeletonRows({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <tr key={i} className="am-skeleton-row">
          <td>
            <div className="am-skeleton-block am-skeleton-block--thumb" />
          </td>
          {Array.from({ length: 6 }).map((__, j) => (
            <td key={j}>
              <div className="am-skeleton-block" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function EmptyState({ onAddProduct }: { onAddProduct: () => void }) {
  return (
    <div className="am-empty">
      <Icon.Empty />
      <h3>No Products Found</h3>
      <p>Create the first product for an agent.</p>
      <button className="am-btn am-btn--primary" onClick={onAddProduct}>
        <Icon.Plus /> Add Product
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function Agentmenumanagement() {
  const [products, setProducts] = useState<AgentProduct[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const [agentFilter, setAgentFilter] = useState<string>("all");

  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);

  const [modal, setModal] = useState<ModalKind>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const pushToast = useCallback((kind: Toast["kind"], message: string) => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, kind, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);
  const dismissToast = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  const agentsById = useMemo(() => {
    const map = new Map<number, Agent>();
    agents.forEach((a) => map.set(a.id, a));
    return map;
  }, [agents]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [productData, agentData] = await Promise.all([getAllAgentProducts(), getAgents()]);
      setProducts(productData);
      setAgents(agentData);
    } catch (err: any) {
      setLoadError(err?.response?.data?.message || "Couldn't load products. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, agentFilter]);

  // Derived: filter → sort → paginate (search/filter state preserved across CRUD refreshes)
  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return products.filter((p) => {
      const matchesAgent = agentFilter === "all" ? true : String(p.agent_id) === agentFilter;
      if (!matchesAgent) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q);
    });
  }, [products, debouncedSearch, agentFilter]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "agent":
          cmp = agentFullName(agentsById.get(a.agent_id)).localeCompare(
            agentFullName(agentsById.get(b.agent_id))
          );
          break;
        case "price":
          cmp = Number(a.price ?? 0) - Number(b.price ?? 0);
          break;
        case "is_active":
          cmp = Number(a.is_active) - Number(b.is_active);
          break;
        case "created_at":
        default:
          cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [filtered, sortKey, sortDirection, agentsById]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageItems = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  // Stats
  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.is_active).length;
    const inactive = total - active;
    const avgPrice =
      total === 0 ? 0 : products.reduce((sum, p) => sum + Number(p.price ?? 0), 0) / total;
    return { total, active, inactive, avgPrice };
  }, [products]);

  // ── Mutations ──────────────────────────────────────────────────────────

  const handleSaveProduct = async (form: ProductFormState) => {
    setActionBusy(true);
    try {
      if (modal?.type === "add") {
        const created = await createAgentProduct({
          agent_id: Number(form.agent_id),
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          price: Number(form.price),
          image: form.image || undefined,
        });
        if (form.is_active === false) {
          await updateAgentProduct(created.id, { is_active: false });
        }
        pushToast("success", `${created.name} was created.`);
      } else if (modal?.type === "edit") {
        const updated = await updateAgentProduct(modal.product.id, {
          name: form.name.trim(),
          description: form.description.trim(),
          price: Number(form.price),
          image: form.image,
          is_active: form.is_active,
        });
        pushToast("success", `${updated.name} was updated.`);
      }
      setModal(null);
      await loadAll();
    } catch (err: any) {
      pushToast("error", err?.response?.data?.message || "Couldn't save this product.");
    } finally {
      setActionBusy(false);
    }
  };

  const handleToggleStatus = async (product: AgentProduct) => {
    setActionBusy(true);
    try {
      await updateAgentProduct(product.id, { is_active: !product.is_active });
      pushToast("success", `${product.name} is now ${product.is_active ? "inactive" : "active"}.`);
      await loadAll();
    } catch (err: any) {
      pushToast("error", err?.response?.data?.message || "Couldn't update status.");
    } finally {
      setActionBusy(false);
    }
  };

  const handleDelete = async () => {
    if (modal?.type !== "delete") return;
    setActionBusy(true);
    setDeleteError(null);
    try {
      await deleteAgentProduct(modal.product.id);
      pushToast("success", `${modal.product.name} was deleted.`);
      setModal(null);
      await loadAll();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        (err?.response?.status === 409
          ? "This product has existing orders and can't be deleted."
          : "Couldn't delete this product.");
      setDeleteError(message);
    } finally {
      setActionBusy(false);
    }
  };

  const handleExportCsv = () => {
    const header = ["Product Name", "Agent", "Price", "Status", "Created Date"];
    const rows = sorted.map((p) => [
      p.name,
      agentFullName(agentsById.get(p.agent_id)),
      formatCurrency(Number(p.price ?? 0)),
      p.is_active ? "Active" : "Inactive",
      formatDate(p.created_at),
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "agent-products.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const sortIndicator = (key: SortKey) =>
    sortKey === key ? (sortDirection === "asc" ? <Icon.ChevronUp /> : <Icon.ChevronDown />) : null;

  return (
    <div className="am-page">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      {/* Header */}
      <header className="am-header">
        <div>
          <h1>Agent Menu Management</h1>
          <p>Create and manage products assigned to sales agents.</p>
        </div>
        <div className="am-header-actions">
          <button className="am-btn am-btn--ghost" onClick={loadAll} disabled={loading}>
            <Icon.Refresh /> Refresh
          </button>
          <button className="am-btn am-btn--ghost" onClick={handleExportCsv} disabled={sorted.length === 0}>
            <Icon.Download /> Export CSV
          </button>
          <button className="am-btn am-btn--primary" onClick={() => setModal({ type: "add" })}>
            <Icon.Plus /> Add Product
          </button>
        </div>
      </header>

      {/* Stat cards */}
      <section className="am-stats-grid">
        <StatCard label="Total Products" value={stats.total} icon={<Icon.Box />} tone="green" />
        <StatCard label="Active Products" value={stats.active} icon={<Icon.CheckCircle />} tone="check" />
        <StatCard label="Inactive Products" value={stats.inactive} icon={<Icon.Slash />} tone="gray" />
        <StatCard
          label="Average Product Price"
          value={stats.avgPrice}
          prefix="$"
          decimals={2}
          icon={<Icon.DollarSign />}
          tone="percent"
        />
      </section>

      {/* Toolbar */}
      <section className="am-toolbar">
        <div className="am-search">
          <Icon.Search />
          <input
            type="text"
            placeholder="Search by product name…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Search products"
          />
        </div>
        <select
          className="am-select"
          value={agentFilter}
          onChange={(e) => setAgentFilter(e.target.value)}
          aria-label="Filter by agent"
        >
          <option value="all">All Agents</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {agentFullName(a)}
            </option>
          ))}
        </select>
      </section>

      {/* Table */}
      <section className="am-table-card">
        {loadError && !loading && (
          <div className="am-inline-error am-inline-error--block">
            {loadError}{" "}
            <button className="am-link-btn" onClick={loadAll}>
              Try again
            </button>
          </div>
        )}

        <div className="am-table-scroll">
          <table className="am-table">
            <thead>
              <tr>
                <th>Image</th>
                <th className="am-th-sortable" onClick={() => toggleSort("name")}>
                  Product Name {sortIndicator("name")}
                </th>
                <th className="am-th-sortable" onClick={() => toggleSort("agent")}>
                  Agent {sortIndicator("agent")}
                </th>
                <th className="am-th-sortable" onClick={() => toggleSort("price")}>
                  Price {sortIndicator("price")}
                </th>
                <th className="am-th-sortable" onClick={() => toggleSort("is_active")}>
                  Status {sortIndicator("is_active")}
                </th>
                <th className="am-th-sortable" onClick={() => toggleSort("created_at")}>
                  Created Date {sortIndicator("created_at")}
                </th>
                <th className="am-th-sortable">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRows count={PAGE_SIZE} />
              ) : (
                pageItems.map((product) => {
                  const agent = agentsById.get(product.agent_id);
                  return (
                    <tr key={product.id}>
                      <td data-label="Image">
                        <ProductThumb src={product.image} alt={product.name} />
                      </td>
                      <td className="am-cell-strong" data-label="Product Name">
                        {product.name}
                      </td>
                      <td data-label="Agent">{agentFullName(agent)}</td>
                      <td data-label="Price">{formatCurrency(Number(product.price ?? 0))}</td>
                      <td data-label="Status">
                        <StatusBadge active={product.is_active} />
                      </td>
                      <td data-label="Created Date">{formatDate(product.created_at)}</td>
                      <td data-label="Actions">
                        <ActionsMenu
                          product={product}
                          busy={actionBusy}
                          onView={() => setModal({ type: "view", product })}
                          onEdit={() => setModal({ type: "edit", product })}
                          onToggleStatus={() => handleToggleStatus(product)}
                          onDelete={() => {
                            setDeleteError(null);
                            setModal({ type: "delete", product });
                          }}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && sorted.length === 0 && (
          <EmptyState onAddProduct={() => setModal({ type: "add" })} />
        )}

        {!loading && sorted.length > 0 && (
          <div className="am-pagination">
            <span>
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of{" "}
              {sorted.length}
            </span>
            <div className="am-pagination-controls">
              <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Prev
              </button>
              <span className="am-pagination-page">
                Page {page} of {totalPages}
              </span>
              <button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Modals */}
      {modal?.type === "add" && (
        <ProductFormModal mode="add" agents={agents} busy={actionBusy} onClose={() => setModal(null)} onSubmit={handleSaveProduct} />
      )}
      {modal?.type === "edit" && (
        <ProductFormModal
          mode="edit"
          initial={modal.product}
          agents={agents}
          busy={actionBusy}
          onClose={() => setModal(null)}
          onSubmit={handleSaveProduct}
        />
      )}
      {modal?.type === "view" && (
        <ViewProductModal
          product={modal.product}
          agent={agentsById.get(modal.product.agent_id)}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === "delete" && (
        <DeleteProductModal
          product={modal.product}
          busy={actionBusy}
          serverError={deleteError}
          onClose={() => setModal(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}