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
  getAgents,
  getAgentById,
  createAgent,
  updateAgent,
  deleteAgent,
  setAgentStatus,
  resetAgentPassword,
  setAgentDiscount,
} from "../services/agentService"
import "./AgentManagement.css";


// ─────────────────────────────────────────────────────────────────────────────
// Small utilities
// ─────────────────────────────────────────────────────────────────────────────

type SortKey = "name" | "default_discount" | "created_at" | "is_active";
type SortDirection = "asc" | "desc";
type ModalKind =
  | { type: "add" }
  | { type: "edit"; agent: Agent }
  | { type: "view"; agent: Agent }
  | { type: "reset"; agent: Agent }
  | { type: "discount"; agent: Agent }
  | { type: "delete"; agent: Agent }
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

function fullName(agent: Agent) {
  return `${agent.first_name} ${agent.last_name}`.trim();
}

function initials(agent: Agent) {
  const a = agent.first_name?.[0] ?? "";
  const b = agent.last_name?.[0] ?? "";
  return (a + b).toUpperCase() || "?";
}

const AVATAR_PALETTE = [
  "#7c9473", // sage
  "#c98a5e", // clay
  "#6f8fae", // dusty blue
  "#a97fae", // muted plum
  "#c2a35e", // sand
  "#5e9e94", // teal
];

function avatarColor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
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

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
// Icons (inline SVG — no external icon dependency)
// ─────────────────────────────────────────────────────────────────────────────

const Icon = {
  Users: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" strokeLinecap="round" />
      <circle cx="10" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeLinecap="round" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" />
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
  Percent: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m19 5-14 14" strokeLinecap="round" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
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
  suffix,
  icon,
  tone,
}: {
  label: string;
  value: number;
  suffix?: string;
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
          {suffix === "%" ? animated.toFixed(1) : Math.round(animated)}
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
// Actions dropdown
// ─────────────────────────────────────────────────────────────────────────────

function ActionsMenu({
  agent,
  busy,
  onView,
  onEdit,
  onResetPassword,
  onChangeDiscount,
  onToggleStatus,
  onDelete,
}: {
  agent: Agent;
  busy: boolean;
  onView: () => void;
  onEdit: () => void;
  onResetPassword: () => void;
  onChangeDiscount: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  // The dropdown itself is rendered via createPortal into document.body, so in
  // the real DOM tree it is NOT a descendant of `ref` (the trigger wrapper).
  // We need our own ref on the portaled menu so the outside-click check below
  // can recognize clicks inside it — otherwise every click on a menu item
  // (View/Edit/Reset Password/Discount/Activate-Deactivate/Delete) gets
  // treated as an "outside" click and closes the menu on mousedown, before
  // the item's own onClick ever has a chance to fire.
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      const clickedTrigger = ref.current?.contains(target) ?? false;
      const clickedMenu = menuRef.current?.contains(target) ?? false;
      if (!clickedTrigger && !clickedMenu) setOpen(false);
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
      const menuWidth = 220; // matches CSS min-width + padding
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
        aria-label={`Actions for ${fullName(agent)}`}
      >
        <Icon.MoreVertical />
        <span className="am-actions-trigger-fallback" aria-hidden="true">⋯</span>
      </button>

      {open &&
        createPortal(
          <div ref={menuRef} className="am-actions-menu" role="menu" style={menuStyle} onMouseDown={(e) => e.stopPropagation()}>
            <button type="button" role="menuitem" onClick={() => runAndClose(onView)}>
              View
            </button>
            <button type="button" role="menuitem" onClick={() => runAndClose(onEdit)}>
              Edit
            </button>
            <button type="button" role="menuitem" onClick={() => runAndClose(onResetPassword)}>
              Reset Password
            </button>
            <button type="button" role="menuitem" onClick={() => runAndClose(onChangeDiscount)}>
              Change Discount
            </button>
            <button type="button" role="menuitem" onClick={() => runAndClose(onToggleStatus)}>
              {agent.is_active ? "Deactivate" : "Activate"}
            </button>
            <div className="am-actions-divider" />
            <button type="button" role="menuitem" className="am-actions-danger" onClick={() => runAndClose(onDelete)}>
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
// Add / Edit agent modal
// ─────────────────────────────────────────────────────────────────────────────

interface AgentFormState {
  first_name: string;
  last_name: string;
  phone_no: string;
  email: string;
  password: string;
  default_discount: string;
  is_active: boolean;
}

function AgentFormModal({
  mode,
  initial,
  busy,
  onClose,
  onSubmit,
}: {
  mode: "add" | "edit";
  initial?: Agent;
  busy: boolean;
  onClose: () => void;
  onSubmit: (form: AgentFormState) => Promise<void>;
}) {
  const [form, setForm] = useState<AgentFormState>({
    first_name: initial?.first_name ?? "",
    last_name: initial?.last_name ?? "",
    phone_no: initial?.phone_no ?? "",
    email: initial?.email ?? "",
    password: "",
    default_discount: initial ? String(initial.default_discount ?? 0) : "0",
    is_active: initial?.is_active ?? true,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof AgentFormState, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof AgentFormState, boolean>>>({});

  const validate = (values: AgentFormState) => {
    const e: Partial<Record<keyof AgentFormState, string>> = {};
    if (!values.first_name.trim()) e.first_name = "First name is required.";
    if (!values.last_name.trim()) e.last_name = "Last name is required.";
    if (!values.phone_no.trim()) e.phone_no = "Phone number is required.";
    if (!values.email.trim()) e.email = "Email is required.";
    else if (!isValidEmail(values.email)) e.email = "Enter a valid email address.";
    if (mode === "add" && values.password.length < 6) {
      e.password = "Password must be at least 6 characters.";
    } else if (mode === "edit" && values.password.length > 0 && values.password.length < 6) {
      e.password = "Password must be at least 6 characters.";
    }
    const discount = Number(values.default_discount);
    if (values.default_discount === "" || Number.isNaN(discount)) {
      e.default_discount = "Enter a discount value.";
    } else if (discount < 0 || discount > 100) {
      e.default_discount = "Discount must be between 0 and 100.";
    }
    return e;
  };

  useEffect(() => {
    setErrors(validate(form));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const handleChange = (key: keyof AgentFormState, value: string | boolean) => {
    setForm((f) => ({ ...f, [key]: value as never }));
  };

  const handleBlur = (key: keyof AgentFormState) => setTouched((t) => ({ ...t, [key]: true }));

  const isValid = Object.keys(validate(form)).length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      first_name: true,
      last_name: true,
      phone_no: true,
      email: true,
      password: true,
      default_discount: true,
    });
    if (!isValid) return;
    await onSubmit(form);
  };

  const showError = (key: keyof AgentFormState) => touched[key] && errors[key];

  return (
    <ModalShell
      title={mode === "add" ? "Add Agent" : "Edit Agent"}
      subtitle={mode === "add" ? "Create a new sales agent account." : `Update details for ${initial ? fullName(initial) : "this agent"}.`}
      onClose={onClose}
      width="lg"
    >
      <form className="am-form" onSubmit={handleSubmit} noValidate>
        <div className="am-form-grid">
          <label className="am-field">
            <span>First Name</span>
            <input
              type="text"
              value={form.first_name}
              onChange={(e) => handleChange("first_name", e.target.value)}
              onBlur={() => handleBlur("first_name")}
              placeholder="Amara"
              disabled={busy}
            />
            {showError("first_name") && <em>{errors.first_name}</em>}
          </label>

          <label className="am-field">
            <span>Last Name</span>
            <input
              type="text"
              value={form.last_name}
              onChange={(e) => handleChange("last_name", e.target.value)}
              onBlur={() => handleBlur("last_name")}
              placeholder="Osei"
              disabled={busy}
            />
            {showError("last_name") && <em>{errors.last_name}</em>}
          </label>

          <label className="am-field">
            <span>Phone Number</span>
            <input
              type="tel"
              value={form.phone_no}
              onChange={(e) => handleChange("phone_no", e.target.value)}
              onBlur={() => handleBlur("phone_no")}
              placeholder="+1 555 010 2231"
              disabled={busy}
            />
            {showError("phone_no") && <em>{errors.phone_no}</em>}
          </label>

          <label className="am-field">
            <span>Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              onBlur={() => handleBlur("email")}
              placeholder="agent@bakery.com"
              disabled={busy}
            />
            {showError("email") && <em>{errors.email}</em>}
          </label>

          <label className="am-field">
            <span>{mode === "add" ? "Password" : "New Password (optional)"}</span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              onBlur={() => handleBlur("password")}
              placeholder={mode === "add" ? "Minimum 6 characters" : "Leave blank to keep current"}
              disabled={busy}
            />
            {showError("password") && <em>{errors.password}</em>}
          </label>

          <label className="am-field">
            <span>Default Discount (%)</span>
            <input
              type="number"
              min={0}
              max={100}
              step="0.5"
              value={form.default_discount}
              onChange={(e) => handleChange("default_discount", e.target.value)}
              onBlur={() => handleBlur("default_discount")}
              disabled={busy}
            />
            {showError("default_discount") && <em>{errors.default_discount}</em>}
          </label>
        </div>

        <div className="am-toggle-row">
          <div>
            <span className="am-toggle-label">Status</span>
            <p className="am-toggle-hint">Inactive agents can't sign in or place orders.</p>
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
            {busy ? "Saving…" : "Save Agent"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// View agent modal
// ─────────────────────────────────────────────────────────────────────────────

function ViewAgentModal({ agent, onClose }: { agent: Agent; onClose: () => void }) {
  return (
    <ModalShell title="Agent Profile" onClose={onClose} width="md">
      <div className="am-profile">
        <div className="am-profile-header">
          <div className="am-avatar am-avatar--lg" style={{ background: avatarColor(fullName(agent)) }}>
            {initials(agent)}
          </div>
          <div>
            <h3>{fullName(agent)}</h3>
            <StatusBadge active={agent.is_active} />
          </div>
        </div>

        <div className="am-profile-grid">
          <div className="am-profile-item">
            <span>Phone</span>
            <strong>{agent.phone_no || "—"}</strong>
          </div>
          <div className="am-profile-item">
            <span>Email</span>
            <strong>{agent.email || "—"}</strong>
          </div>
          <div className="am-profile-item">
            <span>Created</span>
            <strong>{formatDate(agent.created_at)}</strong>
          </div>
          <div className="am-profile-item">
            <span>Default Discount</span>
            <strong>{Number(agent.default_discount ?? 0)}%</strong>
          </div>
          {/* <div className="am-profile-item">
            <span>Total Orders</span>
            <strong title="Connect an owner-facing orders endpoint to populate this.">—</strong>
          </div>
          <div className="am-profile-item">
            <span>Total Revenue</span>
            <strong title="Connect an owner-facing orders endpoint to populate this.">—</strong>
          </div> */}
        </div>

        <div className="am-profile-recent">
          <h4>Recent Orders</h4>
          <div className="am-profile-empty">
            Order history isn't wired up to an owner endpoint yet — hook this section up to a
            per-agent orders API once available.
          </div>
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
// Reset password modal
// ─────────────────────────────────────────────────────────────────────────────

function ResetPasswordModal({
  agent,
  busy,
  onClose,
  onSubmit,
}: {
  agent: Agent;
  busy: boolean;
  onClose: () => void;
  onSubmit: (password: string) => Promise<void>;
}) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [touched, setTouched] = useState(false);

  const error =
    password.length > 0 && password.length < 6
      ? "Password must be at least 6 characters."
      : confirm.length > 0 && confirm !== password
      ? "Passwords don't match."
      : "";

  const isValid = password.length >= 6 && password === confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;
    await onSubmit(password);
  };

  return (
    <ModalShell title="Reset Password" subtitle={`Set a new password for ${fullName(agent)}.`} onClose={onClose}>
      <form className="am-form" onSubmit={handleSubmit} noValidate>
        <label className="am-field">
          <span>New Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="Minimum 6 characters"
            disabled={busy}
            autoFocus
          />
        </label>
        <label className="am-field">
          <span>Confirm Password</span>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="Re-enter password"
            disabled={busy}
          />
          {touched && error && <em>{error}</em>}
        </label>

        <div className="am-modal-footer">
          <button type="button" className="am-btn am-btn--ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="am-btn am-btn--primary" disabled={busy || !isValid}>
            {busy ? "Resetting…" : "Reset Password"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Change discount modal
// ─────────────────────────────────────────────────────────────────────────────

function ChangeDiscountModal({
  agent,
  busy,
  onClose,
  onSubmit,
}: {
  agent: Agent;
  busy: boolean;
  onClose: () => void;
  onSubmit: (discount: number) => Promise<void>;
}) {
  const [value, setValue] = useState(Number(agent.default_discount ?? 0));

  const clamp = (n: number) => Math.min(100, Math.max(0, n));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(clamp(value));
  };

  return (
    <ModalShell title="Change Discount" subtitle={`Update the default discount for ${fullName(agent)}.`} onClose={onClose} width="sm">
      <form className="am-form" onSubmit={handleSubmit}>
        <div className="am-discount-value">{value.toFixed(0)}%</div>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={value}
          onChange={(e) => setValue(clamp(Number(e.target.value)))}
          className="am-slider"
          disabled={busy}
        />
        <label className="am-field">
          <span>Discount %</span>
          <input
            type="number"
            min={0}
            max={100}
            value={value}
            onChange={(e) => setValue(clamp(Number(e.target.value)))}
            disabled={busy}
          />
        </label>

        <div className="am-modal-footer">
          <button type="button" className="am-btn am-btn--ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="am-btn am-btn--primary" disabled={busy}>
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Delete confirmation modal
// ─────────────────────────────────────────────────────────────────────────────

function DeleteAgentModal({
  agent,
  busy,
  serverError,
  onClose,
  onConfirm,
}: {
  agent: Agent;
  busy: boolean;
  serverError: string | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  return (
    <ModalShell title="Delete Agent" onClose={onClose} width="sm">
      <div className="am-delete-body">
        <div className="am-delete-icon">
          <Icon.Warning />
        </div>
        <p>
          Are you sure you want to delete <strong>{fullName(agent)}</strong>? This action can't be
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
          {Array.from({ length: 8 }).map((__, j) => (
            <td key={j}>
              <div className="am-skeleton-block" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function EmptyState({ onAddAgent }: { onAddAgent: () => void }) {
  return (
    <div className="am-empty">
      <Icon.Empty />
      <h3>No agents found</h3>
      <p>Add your first sales agent, or adjust your search and filters.</p>
      <button className="am-btn am-btn--primary" onClick={onAddAgent}>
        <Icon.Plus size={16}/> Add Agent
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function AgentManagement() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

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

  const loadAgents = useCallback(async () => {

    setLoading(true);
    setLoadError(null);
    try {
      const data = await getAgents();

      setAgents(data);
    } catch (err: any) {

      setLoadError(err?.response?.data?.message || "Couldn't load agents. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  // Derived: filter → sort → paginate
  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return agents.filter((a) => {
      const matchesStatus =
        statusFilter === "all" ? true : statusFilter === "active" ? a.is_active : !a.is_active;
      if (!matchesStatus) return false;
      if (!q) return true;
      return (
        fullName(a).toLowerCase().includes(q) ||
        (a.email ?? "").toLowerCase().includes(q) ||
        (a.phone_no ?? "").toLowerCase().includes(q)
      );
    });
  }, [agents, debouncedSearch, statusFilter]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = fullName(a).localeCompare(fullName(b));
          break;
        case "default_discount":
          cmp = Number(a.default_discount ?? 0) - Number(b.default_discount ?? 0);
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
  }, [filtered, sortKey, sortDirection]);

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
    const total = agents.length;
    const active = agents.filter((a) => a.is_active).length;
    const inactive = total - active;
    const avgDiscount =
      total === 0 ? 0 : agents.reduce((sum, a) => sum + Number(a.default_discount ?? 0), 0) / total;
    return { total, active, inactive, avgDiscount };
  }, [agents]);

  // ── Mutations ──────────────────────────────────────────────────────────

  const handleSaveAgent = async (form: AgentFormState) => {
    setActionBusy(true);
    try {
      if (modal?.type === "add") {
    
        const created = await createAgent({
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          phone_no: form.phone_no.trim(),
          email: form.email.trim(),
          password: form.password,
          default_discount: Number(form.default_discount),
        });
        if (!created.is_active) {
          await setAgentStatus(created.id, false);
        }
        pushToast("success", `${fullName(created)} was added.`);
      } else if (modal?.type === "edit") {
     
        const payload: Partial<{
          first_name: string;
          last_name: string;
          phone_no: string;
          email: string;
          password: string;
        }> = {
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          phone_no: form.phone_no.trim(),
          email: form.email.trim(),
        };
        if (form.password) payload.password = form.password;
        const updated = await updateAgent(modal.agent.id, payload);
     

        if (Number(form.default_discount) !== Number(modal.agent.default_discount ?? 0)) {
        
          await setAgentDiscount(modal.agent.id, Number(form.default_discount));
        }
        if (form.is_active !== modal.agent.is_active) {
          await setAgentStatus(modal.agent.id, form.is_active);
        }
        pushToast("success", `${fullName(updated)} was updated.`);
      }
      setModal(null);
      await loadAgents();
    } catch (err: any) {
   
      pushToast("error", err?.response?.data?.message || "Couldn't save this agent.");
    } finally {
      setActionBusy(false);
    }
  };

  const handleViewAgent = async (agent: Agent) => {
  
    setActionBusy(true);
    try {
  
      const fresh = await getAgentById(agent.id);
    
      setModal({ type: "view", agent: fresh });
    } catch (err: any) {
  
      pushToast("error", err?.response?.data?.message || "Couldn't load this agent's details.");
    } finally {
      setActionBusy(false);
    }
  };

  const handleToggleStatus = async (agent: Agent) => {
    setActionBusy(true);
    try {
    
      await setAgentStatus(agent.id, !agent.is_active);

      pushToast("success", `${fullName(agent)} is now ${agent.is_active ? "inactive" : "active"}.`);
      await loadAgents();
    } catch (err: any) {

      pushToast("error", err?.response?.data?.message || "Couldn't update status.");
    } finally {
      setActionBusy(false);
    }
  };

  const handleResetPassword = async (password: string) => {
    if (modal?.type !== "reset") return;
    setActionBusy(true);
    try {
    
      await resetAgentPassword(modal.agent.id, password);
   
      pushToast("success", `Password reset for ${fullName(modal.agent)}.`);
      setModal(null);
    } catch (err: any) {
  
      pushToast("error", err?.response?.data?.message || "Couldn't reset password.");
    } finally {
      setActionBusy(false);
    }
  };

  const handleChangeDiscount = async (discount: number) => {
    if (modal?.type !== "discount") return;
    setActionBusy(true);
    try {
     
      await setAgentDiscount(modal.agent.id, discount);
     
      pushToast("success", `Discount updated for ${fullName(modal.agent)}.`);
      setModal(null);
      await loadAgents();
    } catch (err: any) {
     
      pushToast("error", err?.response?.data?.message || "Couldn't update discount.");
    } finally {
      setActionBusy(false);
    }
  };

  const handleDelete = async () => {
    if (modal?.type !== "delete") return;
    setActionBusy(true);
    setDeleteError(null);
    try {
    
      await deleteAgent(modal.agent.id);

      pushToast("success", `${fullName(modal.agent)} was deleted.`);
      setModal(null);
      await loadAgents();
    } catch (err: any) {
      
      const message =
        err?.response?.data?.message ||
        (err?.response?.status === 409
          ? "This agent has existing orders and can't be deleted."
          : "Couldn't delete this agent.");
      setDeleteError(message);
    } finally {
      setActionBusy(false);
    }
  };

  const handleExportCsv = () => {
    const header = ["Name", "Phone", "Email", "Default Discount", "Status", "Created"];
    const rows = sorted.map((a) => [
      fullName(a),
      a.phone_no ?? "",
      a.email ?? "",
      `${a.default_discount ?? 0}%`,
      a.is_active ? "Active" : "Inactive",
      formatDate(a.created_at),
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "agents.csv";
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
          <h1>Agent Management</h1>
          <p>Create, manage, activate, and monitor sales agents.</p>
        </div>
        <div className="am-header-actions">
          <button className="am-btn am-btn--ghost" onClick={loadAgents} disabled={loading}>
            <Icon.Refresh /> Refresh
          </button>
          <button className="am-btn am-btn--ghost" onClick={handleExportCsv} disabled={sorted.length === 0}>
            <Icon.Download /> Export CSV
          </button>
          <button className="am-btn am-btn--primary" onClick={() => setModal({ type: "add" })}>
            <Icon.Plus /> Add Agent
          </button>
        </div>
      </header>

      {/* Stat cards */}
      <section className="am-stats-grid">
        <StatCard label="Total Agents" value={stats.total} icon={<Icon.Users />} tone="green" />
        <StatCard label="Active Agents" value={stats.active} icon={<Icon.CheckCircle />} tone="check" />
        <StatCard label="Inactive Agents" value={stats.inactive} icon={<Icon.Slash />} tone="gray" />
        <StatCard label="Average Discount" value={stats.avgDiscount} suffix="%" icon={<Icon.Percent />} tone="percent" />
      </section>

      {/* Toolbar */}
      <section className="am-toolbar">
        <div className="am-search">
          <Icon.Search />
          <input
            type="text"
            placeholder="Search by name, email, or phone…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Search agents"
          />
        </div>
        <select
          className="am-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          aria-label="Filter by status"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </section>

      {/* Table */}
      <section className="am-table-card">
        {loadError && !loading && (
          <div className="am-inline-error am-inline-error--block">
            {loadError}{" "}
            <button className="am-link-btn" onClick={loadAgents}>
              Try again
            </button>
          </div>
        )}

        <div className="am-table-scroll">
          <table className="am-table">
            <thead>
              <tr>
                <th>Avatar</th>
                <th className="am-th-sortable" onClick={() => toggleSort("name")}>
                  Name {sortIndicator("name")}
                </th>
                <th>Phone</th>
                <th>Email</th>
                <th className="am-th-sortable" onClick={() => toggleSort("default_discount")}>
                  Discount {sortIndicator("default_discount")}
                </th>
                <th className="am-th-sortable" onClick={() => toggleSort("is_active")}>
                  Status {sortIndicator("is_active")}
                </th>
                <th className="am-th-sortable" onClick={() => toggleSort("created_at")}>
                  Created Date {sortIndicator("created_at")}
                </th>
                {/* <th aria-label="Actions" /> */}
                   <th className="am-th-sortable">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRows count={PAGE_SIZE} />
              ) : (
                pageItems.map((agent) => (
                  <tr key={agent.id}>
                    <td>
                      <div className="am-avatar" style={{ background: avatarColor(fullName(agent)) }}>
                        {initials(agent)}
                      </div>
                    </td>
                    <td className="am-cell-strong">{fullName(agent)}</td>
                    <td>{agent.phone_no || "—"}</td>
                    <td>{agent.email || "—"}</td>
                    <td>{Number(agent.default_discount ?? 0)}%</td>
                    <td>
                      <StatusBadge active={agent.is_active} />
                    </td>
                    <td>{formatDate(agent.created_at)}</td>
                    <td>
                      <ActionsMenu
                        agent={agent}
                        busy={actionBusy}
                        onView={() => handleViewAgent(agent)}
                        onEdit={() => {
                          setModal({ type: "edit", agent });
                        }}
                        onResetPassword={() => setModal({ type: "reset", agent })}
                        onChangeDiscount={() => setModal({ type: "discount", agent })}
                        onToggleStatus={() => handleToggleStatus(agent)}
                        onDelete={() => {
                          setDeleteError(null);
                          setModal({ type: "delete", agent });
                        }}
                      />
                     
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && sorted.length === 0 && (
          <EmptyState onAddAgent={() => setModal({ type: "add" })} />
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
        <AgentFormModal mode="add" busy={actionBusy} onClose={() => setModal(null)} onSubmit={handleSaveAgent} />
      )}
      {modal?.type === "edit" && (
        <AgentFormModal
          mode="edit"
          initial={modal.agent}
          busy={actionBusy}
          onClose={() => setModal(null)}
          onSubmit={handleSaveAgent}
        />
      )}
      {modal?.type === "view" && <ViewAgentModal agent={modal.agent} onClose={() => setModal(null)} />}
      {modal?.type === "reset" && (
        <ResetPasswordModal
          agent={modal.agent}
          busy={actionBusy}
          onClose={() => setModal(null)}
          onSubmit={handleResetPassword}
        />
      )}
      {modal?.type === "discount" && (
        <ChangeDiscountModal
          agent={modal.agent}
          busy={actionBusy}
          onClose={() => setModal(null)}
          onSubmit={handleChangeDiscount}
        />
      )}
      {modal?.type === "delete" && (
        <DeleteAgentModal
          agent={modal.agent}
          busy={actionBusy}
          serverError={deleteError}
          onClose={() => setModal(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}