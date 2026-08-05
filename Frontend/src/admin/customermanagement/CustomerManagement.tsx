import React, { useState, useEffect, useCallback, useMemo } from "react";
import "./CustomerManagement.css";
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  getCustomerOrders,
  getCustomerOrderSummary,
  getCustomerAddresses,
  addCustomerAddress,
  getCustomerLoyaltyPoints,
  getCustomerLoyaltyHistory,
  Customer,
  Address,
  LoyaltyPoints,
  CreateCustomerPayload,
} from "../../services/customerService";

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const IconUsers = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconShoppingBag = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const IconDollarSign = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const IconTrendingUp = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const IconSearch = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconPlus = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconEdit = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const IconEye = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconX = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconMapPin = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconStar = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const IconChevronLeft = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const IconChevronRight = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const IconPackage = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────

type DrawerTab = "orders" | "summary" | "addresses";
type ModalMode = "create" | "edit" | null;
type SortOption = "newest" | "oldest" | "highest_spending" | "most_orders";

interface Toast { id: number; message: string; type: "success" | "error" }
let toastCounter = 0;

interface OrderSummary {
  total_orders: number;
  completed: number;
  cancelled: number;
  average_order_value: number;
  highest_order: number;
}

interface LoyaltyHistoryItem {
  id: number;
  date: string;
  points: number;
  type: string;
  description: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch { return "—"; }
};

const formatCurrency = (amount: number): string =>
  `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const getInitials = (first: string, last: string): string =>
  `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();

const getAvatarColor = (id: number): string => {
  const colors = [
    "#7C3AED", "#059669", "#DC2626", "#D97706",
    "#2563EB", "#DB2777", "#0891B2", "#65A30D",
  ];
  return colors[id % colors.length];
};

const ITEMS_PER_PAGE = 8;

// ─── Sub-components ───────────────────────────────────────────────────────────

const Spinner: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <div className="cm-spinner" style={{ width: size, height: size }} />
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="cm-empty-state">
    <IconPackage size={36} />
    <p>{message}</p>
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

const CustomerManagement: React.FC = () => {
  // ── Customers ─────────────────────────────────────────────────────────────
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // ── Search / Sort / Pagination ────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [currentPage, setCurrentPage] = useState(1);

  // ── Drawer ─────────────────────────────────────────────────────────────────
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerCustomer, setDrawerCustomer] = useState<Customer | null>(null);
  const [drawerTab, setDrawerTab] = useState<DrawerTab>("orders");
  const [drawerLoading, setDrawerLoading] = useState(false);

  // ── Drawer tab data ────────────────────────────────────────────────────────
  const [drawerOrders, setDrawerOrders] = useState<any[]>([]);
  const [drawerSummary, setDrawerSummary] = useState<OrderSummary | null>(null);
  const [drawerAddresses, setDrawerAddresses] = useState<Address[]>([]);
  const [drawerLoyalty, setDrawerLoyalty] = useState<LoyaltyPoints | null>(null);
  const [drawerLoyaltyHistory, setDrawerLoyaltyHistory] = useState<LoyaltyHistoryItem[]>([]);
  const [tabLoading, setTabLoading] = useState(false);

  // ── Address Modal ──────────────────────────────────────────────────────────
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addressForm, setAddressForm] = useState({ street: "", city: "", state: "", country: "", pincode: "" });
  const [addressLoading, setAddressLoading] = useState(false);

  // ── Create / Edit Modal ────────────────────────────────────────────────────
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone_no: "" });

  // ── Toast ──────────────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    const id = ++toastCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  // ── Fetch customers ────────────────────────────────────────────────────────
  const fetchCustomers = useCallback(async () => {
    setTableLoading(true);
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (err: any) {
      showToast(err?.response?.data?.error || "Failed to load customers.", "error");
    } finally {
      setTableLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalCustomers = customers.length;
    const totalOrders = customers.reduce((s, c) => s + (c.total_orders || 0), 0);
    const totalRevenue = customers.reduce((s, c) => s + (c.total_spent || 0), 0);
    const avgSpend = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
    return { totalCustomers, totalOrders, totalRevenue, avgSpend };
  }, [customers]);

  // ── Search + Sort + Paginate ───────────────────────────────────────────────
  const filteredAndSorted = useMemo(() => {
    const q = searchQuery.toLowerCase();
    let result = customers.filter((c) => {
      if (!q) return true;
      return (
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone_no || "").toLowerCase().includes(q)
      );
    });

    switch (sortBy) {
      case "newest":
        result = result.sort((a, b) =>
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        break;
      case "oldest":
        result = result.sort((a, b) =>
          new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
        break;
      case "highest_spending":
        result = result.sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0));
        break;
      case "most_orders":
        result = result.sort((a, b) => (b.total_orders || 0) - (a.total_orders || 0));
        break;
    }
    return result;
  }, [customers, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE);
  const paginatedCustomers = useMemo(() =>
    filteredAndSorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [filteredAndSorted, currentPage]
  );

  const handleSearch = useCallback((val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  }, []);

  const handleSort = useCallback((val: SortOption) => {
    setSortBy(val);
    setCurrentPage(1);
  }, []);

  // ── Drawer open ────────────────────────────────────────────────────────────
  const openDrawer = async (customer: Customer) => {
    setDrawerLoading(true);
    setDrawerOpen(true);
    setDrawerTab("orders");
    setDrawerOrders([]);
    setDrawerSummary(null);
    setDrawerAddresses([]);
    setDrawerLoyalty(null);
    setDrawerLoyaltyHistory([]);
    try {
      const full = await getCustomerById(customer.id);
      setDrawerCustomer(full);
      // Load first tab eagerly
      setTabLoading(true);
      const orders = await getCustomerOrders(customer.id);
      setDrawerOrders(orders);
    } catch (err: any) {
      showToast(err?.response?.data?.error || "Failed to load customer.", "error");
      // Prevent leaving an empty/blank drawer open when the fetch fails
      setDrawerOpen(false);
      setDrawerCustomer(null);
    } finally {
      setDrawerLoading(false);
      setTabLoading(false);
    }
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerCustomer(null);
    setAddressModalOpen(false);
  };

  // ── Drawer tab switch ──────────────────────────────────────────────────────
  const switchTab = useCallback(async (tab: DrawerTab) => {
    if (!drawerCustomer) return;
    setDrawerTab(tab);
    setTabLoading(true);
    try {
      if (tab === "orders" && drawerOrders.length === 0) {
        const data = await getCustomerOrders(drawerCustomer.id);
        setDrawerOrders(data);
      } else if (tab === "summary" && !drawerSummary) {
        const data = await getCustomerOrderSummary(drawerCustomer.id);
        setDrawerSummary(data);
      } else if (tab === "addresses" && drawerAddresses.length === 0) {
        const data = await getCustomerAddresses(drawerCustomer.id);
        setDrawerAddresses(data);
      } 
      // else if (tab === "loyalty" && !drawerLoyalty) {
      //   const [points, history] = await Promise.all([
      //     getCustomerLoyaltyPoints(drawerCustomer.id),
      //     getCustomerLoyaltyHistory(drawerCustomer.id),
      //   ]);
      //   setDrawerLoyalty(points);
      //   setDrawerLoyaltyHistory(history);
      // }
    } catch (err: any) {
      showToast(err?.response?.data?.error || "Failed to load data.", "error");
    } finally {
      setTabLoading(false);
    }
  }, [drawerCustomer, drawerOrders, drawerSummary, drawerAddresses, drawerLoyalty, showToast]);

  // ── Add Address ────────────────────────────────────────────────────────────
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!drawerCustomer) return;
    setAddressLoading(true);
    try {
      await addCustomerAddress(drawerCustomer.id, addressForm);
      showToast("Address Added Successfully", "success");
      setAddressModalOpen(false);
      setAddressForm({ street: "", city: "", state: "", country: "", pincode: "" });
      const data = await getCustomerAddresses(drawerCustomer.id);
      setDrawerAddresses(data);
    } catch (err: any) {
      showToast(err?.response?.data?.error || "Failed to add address.", "error");
    } finally {
      setAddressLoading(false);
    }
  };

  // ── Create Customer ────────────────────────────────────────────────────────
  const openCreateModal = () => {
    setForm({ first_name: "", last_name: "", email: "", phone_no: "" });
    setModalMode("create");
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload: CreateCustomerPayload = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone_no: form.phone_no,
        password: "1234",
      };
      await createCustomer(payload);
      showToast("Customer Created Successfully", "success");
      setModalMode(null);
      fetchCustomers();
    } catch (err: any) {
      showToast(err?.response?.data?.error || "Failed to create customer.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  // ── Edit Customer ──────────────────────────────────────────────────────────
  const openEditModal = async (customer: Customer) => {
    setModalLoading(true);
    setModalMode("edit");
    try {
      const full = await getCustomerById(customer.id);
      setSelectedCustomer(full);
      setForm({
        first_name: full.first_name,
        last_name: full.last_name,
        email: full.email,
        phone_no: full.phone_no,
      });
    } catch (err: any) {
      showToast(err?.response?.data?.error || "Failed to load customer.", "error");
      setModalMode(null);
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    setFormLoading(true);
    try {
      await updateCustomer(selectedCustomer.id, {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone_no: form.phone_no,
      });
      showToast("Customer Updated Successfully", "success");
      setModalMode(null);
      setSelectedCustomer(null);
      fetchCustomers();
    } catch (err: any) {
      showToast(err?.response?.data?.error || "Failed to update customer.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedCustomer(null);
    setForm({ first_name: "", last_name: "", email: "", phone_no: "" });
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="cm-workspace-container">

      {/* ── Toast Stack ─────────────────────────────────────────────────── */}
      <div className="sm-toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={`sm-toast sm-toast-${t.type}`}>
            <span className="sm-toast-dot" />
            {t.message}
          </div>
        ))}
      </div>

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="cm-page-header">
        <div className="cm-page-header-text">
          <h2>Customer Management</h2>
          <p>Manage customers, view purchase history, addresses, and loyalty information.</p>
        </div>
        <button className="sage-btn btn-primary btn-md" onClick={openCreateModal}>
          <IconPlus size={24} />
          Add Customer
        </button>
      </div>

      {/* ── 1. Stat Cards ────────────────────────────────────────────────── */}
      <div className="cm-stats-grid">
        <div className="cm-stat-card">
          <div className="cm-stat-icon-wrap cm-icon-purple">
            <IconUsers size={20} />
          </div>
          <div className="cm-stat-body">
            <h3>{stats.totalCustomers.toLocaleString()}</h3>
            <span>Total Customers</span>
          </div>
        </div>
        <div className="cm-stat-card">
          <div className="cm-stat-icon-wrap cm-icon-blue">
            <IconShoppingBag size={20} />
          </div>
          <div className="cm-stat-body">
            <h3>{stats.totalOrders.toLocaleString()}</h3>
            <span>Total Orders</span>
          </div>
        </div>
        <div className="cm-stat-card">
          <div className="cm-stat-icon-wrap cm-icon-green">
            <IconDollarSign size={20} />
          </div>
          <div className="cm-stat-body">
            <h3>{formatCurrency(stats.totalRevenue)}</h3>
            <span>Total Revenue</span>
          </div>
        </div>
        <div className="cm-stat-card">
          <div className="cm-stat-icon-wrap cm-icon-gold">
            <IconTrendingUp size={20} />
          </div>
          <div className="cm-stat-body">
            <h3>{formatCurrency(stats.avgSpend)}</h3>
            <span>Average Spend</span>
          </div>
        </div>
      </div>

      {/* ── 2. Search & Sort Bar ─────────────────────────────────────────── */}
      <div className="cm-toolbar">
        <div className="cm-search-wrap">
          <IconSearch size={16} />
          <input
            type="text"
            className="cm-search-input"
            placeholder="Search by name, email or phone…"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="cm-sort-wrap">
          <label className="cm-sort-label">Sort by</label>
          <select
            className="cm-sort-select"
            value={sortBy}
            onChange={(e) => handleSort(e.target.value as SortOption)}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="highest_spending">Highest Spending</option>
            <option value="most_orders">Most Orders</option>
          </select>
        </div>
      </div>

      {/* ── 3. Customer Table ─────────────────────────────────────────────── */}
      <div className="cm-table-section">
        <div className="sage-table-card">
          <div className="sage-table-container">
            {tableLoading ? (
              <div className="cm-table-loader">
                <Spinner size={28} />
                <span>Loading customers…</span>
              </div>
            ) : (
              <table className="sage-data-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: "left" }}>Customer</th>
                    <th style={{ textAlign: "left" }}>Email</th>
                    <th style={{ textAlign: "left" }}>Phone</th>
                    <th style={{ textAlign: "center" }}>Total Orders</th>
                    <th style={{ textAlign: "right" }}>Total Spent</th>
                    <th style={{ textAlign: "left" }}>Joined</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCustomers.length === 0 ? (
                    <tr>
                      <td className="empty-table-cell" colSpan={7}>
                        {searchQuery ? "No customers match your search." : "No customers yet. Click  to create one."}
                      </td>
                    </tr>
                  ) : (
                    paginatedCustomers.map((customer) => (
                      <tr key={customer.id}>
                        <td>
                          <div className="cm-customer-cell">
                            <div
                              className="cm-avatar"
                              style={{ backgroundColor: getAvatarColor(customer.id) }}
                            >
                              {getInitials(customer.first_name, customer.last_name)}
                            </div>
                            <div className="cm-customer-info">
                              <strong>{customer.first_name} {customer.last_name}</strong>
                              <span className="sm-id-badge">#{customer.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="sm-muted-text">{customer.email}</td>
                        <td>{customer.phone_no || "—"}</td>
                        <td style={{ textAlign: "center" }}>
                          <span className="cm-order-badge">{customer.total_orders || 0}</span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <strong>{formatCurrency(customer.total_spent || 0)}</strong>
                        </td>
                        <td className="sm-muted-text">{formatDate(customer.created_at)}</td>
                        <td>
                          <div className="tbl-actions">
                            {/* <button
                              className="sage-btn btn-secondary btn-sm sm-icon-btn"
                              title="View"
                              onClick={() => openDrawer(customer)}
                            >
                              <IconEye size={24} />
                            </button> */}
                            <button
                              className="sage-btn btn-primary btn-sm sm-icon-btn"
                              title="Edit"
                              onClick={() => openEditModal(customer)}
                            >
                              <IconEdit size={24} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="cm-pagination">
            <span className="cm-page-info">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSorted.length)} of {filteredAndSorted.length}
            </span>
            <div className="cm-page-controls">
              <button
                className="cm-page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <IconChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce<(number | "ellipsis")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("ellipsis");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "ellipsis" ? (
                    <span key={`ellipsis-${i}`} className="cm-page-ellipsis">…</span>
                  ) : (
                    <button
                      key={p}
                      className={`cm-page-btn ${currentPage === p ? "cm-page-active" : ""}`}
                      onClick={() => setCurrentPage(p as number)}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                className="cm-page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <IconChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          RIGHT DRAWER
      ════════════════════════════════════════════════════════════════════ */}
      {drawerOpen && (
        <>
          <div className="cm-drawer-backdrop" onClick={closeDrawer} />
          <div className={`cm-drawer ${drawerOpen ? "cm-drawer-open" : ""}`}>
            {drawerLoading ? (
              <div className="cm-drawer-loader">
                <Spinner size={32} />
                <span>Loading customer…</span>
              </div>
            ) : drawerCustomer ? (
              <>
                {/* Drawer Header */}
                <div className="cm-drawer-header">
                  <div className="cm-drawer-profile">
                    <div
                      className="cm-avatar cm-avatar-lg"
                      style={{ backgroundColor: getAvatarColor(drawerCustomer.id) }}
                    >
                      {getInitials(drawerCustomer.first_name, drawerCustomer.last_name)}
                    </div>
                    <div className="cm-drawer-profile-info">
                      <h3>{drawerCustomer.first_name} {drawerCustomer.last_name}</h3>
                      <p>{drawerCustomer.email}</p>
                      <span className="sm-id-badge">#{drawerCustomer.id}</span>
                    </div>
                  </div>
                  <button className="sage-modal-close" onClick={closeDrawer}>
                    <IconX size={20} />
                  </button>
                </div>

                {/* Profile Summary Row */}
                <div className="cm-drawer-summary-row">
                  <div className="cm-drawer-summary-item">
                    <span className="cm-drawer-summary-label">Phone</span>
                    <span className="cm-drawer-summary-value">{drawerCustomer.phone_no || "—"}</span>
                  </div>
                  <div className="cm-drawer-summary-item">
                    <span className="cm-drawer-summary-label">Customer Since</span>
                    <span className="cm-drawer-summary-value">{formatDate(drawerCustomer.created_at)}</span>
                  </div>
                  <div className="cm-drawer-summary-item">
                    <span className="cm-drawer-summary-label">Total Orders</span>
                    <span className="cm-drawer-summary-value">{drawerCustomer.total_orders || 0}</span>
                  </div>
                  <div className="cm-drawer-summary-item">
                    <span className="cm-drawer-summary-label">Total Spent</span>
                    <span className="cm-drawer-summary-value cm-highlight">{formatCurrency(drawerCustomer.total_spent || 0)}</span>
                  </div>
                </div>

                {/* Tabs */}
                <div className="cm-drawer-tabs">
                  {(["orders", "summary", "addresses"] as DrawerTab[]).map((tab) => (
                    <button
                      key={tab}
                      className={`cm-drawer-tab ${drawerTab === tab ? "cm-drawer-tab-active" : ""}`}
                      onClick={() => switchTab(tab)}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="cm-drawer-body">
                  {tabLoading ? (
                    <div className="cm-drawer-loader">
                      <Spinner size={24} />
                    </div>
                  ) : (
                    <>
                      {/* TAB: Orders */}
                      {drawerTab === "orders" && (
                        <div className="cm-tab-content">
                          {drawerOrders.length === 0 ? (
                            <EmptyState message="No orders found for this customer." />
                          ) : (
                            <div className="sage-table-container">
                              <table className="sage-data-table">
                                <thead>
                                  <tr>
                                    <th style={{ textAlign: "left" }}>Order #</th>
                                    <th style={{ textAlign: "left" }}>Date</th>
                                    <th style={{ textAlign: "left" }}>Status</th>
                                    <th style={{ textAlign: "center" }}>Items</th>
                                    <th style={{ textAlign: "right" }}>Amount</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {drawerOrders.map((order: any) => (
                                    <tr key={order.id}>
                                      <td><span className="sm-id-badge">#{order.id}</span></td>
                                      <td className="sm-muted-text">{formatDate(order.created_at || order.date)}</td>
                                      <td>
                                        <span className={`cm-status-badge cm-status-${(order.status || "").toLowerCase()}`}>
                                          {order.status || "—"}
                                        </span>
                                      </td>
                                      <td style={{ textAlign: "center" }}>{order.items_count ?? order.items ?? "—"}</td>
                                      <td style={{ textAlign: "right" }}>
                                        <strong>{formatCurrency(order.total || order.amount || 0)}</strong>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}

                      {/* TAB: Order Summary */}
                      {drawerTab === "summary" && (
                        <div className="cm-tab-content">
                          {!drawerSummary ? (
                            <EmptyState message="No summary available." />
                          ) : (
                            <div className="cm-summary-grid">
                              <div className="cm-summary-card">
                                <span className="cm-summary-label">Total Orders</span>
                                <h3>{drawerSummary.total_orders}</h3>
                              </div>
                              <div className="cm-summary-card cm-summary-green">
                                <span className="cm-summary-label">Completed</span>
                                <h3>{drawerSummary.completed}</h3>
                              </div>
                              <div className="cm-summary-card cm-summary-red">
                                <span className="cm-summary-label">Cancelled</span>
                                <h3>{drawerSummary.cancelled}</h3>
                              </div>
                              <div className="cm-summary-card cm-summary-blue">
                                <span className="cm-summary-label">Avg Order Value</span>
                                <h3>{formatCurrency(drawerSummary.average_order_value || 0)}</h3>
                              </div>
                              <div className="cm-summary-card cm-summary-purple">
                                <span className="cm-summary-label">Highest Order</span>
                                <h3>{formatCurrency(drawerSummary.highest_order || 0)}</h3>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* TAB: Addresses */}
                      {drawerTab === "addresses" && (
                        <div className="cm-tab-content">
                          <div className="cm-tab-toolbar">
                            <button
                              className="sage-btn btn-primary btn-sm"
                              onClick={() => setAddressModalOpen(true)}
                            >
                              <IconPlus size={14} />
                              Add Address
                            </button>
                          </div>
                          {drawerAddresses.length === 0 ? (
                            <EmptyState message="No addresses found." />
                          ) : (
                            <div className="cm-address-grid">
                              {drawerAddresses.map((addr) => (
                                <div key={addr.id} className="cm-address-card">
                                  <div className="cm-address-icon-wrap">
                                    <IconMapPin size={16} />
                                  </div>
                                  <div className="cm-address-body">
                                    <p className="cm-address-street">{addr.street}</p>
                                    <p className="cm-address-line">{addr.city}, {addr.state} — {addr.pincode}</p>
                                    <p className="cm-address-country">{addr.country}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* TAB: Loyalty */}
                      {/* {drawerTab === "loyalty" && (
                        <div className="cm-tab-content">
                          {drawerLoyalty && (
                            <div className="cm-loyalty-points-row">
                              <div className="cm-loyalty-card cm-loyalty-current">
                                <IconStar size={18} />
                                <h3>{drawerLoyalty.current_points.toLocaleString()}</h3>
                                <span>Current Points</span>
                              </div>
                              <div className="cm-loyalty-card cm-loyalty-earned">
                                <IconStar size={18} />
                                <h3>{drawerLoyalty.total_earned.toLocaleString()}</h3>
                                <span>Earned Points</span>
                              </div>
                              <div className="cm-loyalty-card cm-loyalty-redeemed">
                                <IconStar size={18} />
                                <h3>{drawerLoyalty.total_redeemed.toLocaleString()}</h3>
                                <span>Redeemed Points</span>
                              </div>
                            </div>
                          )}
                          {drawerLoyaltyHistory.length === 0 ? (
                            <EmptyState message="No loyalty history available." />
                          ) : (
                            <div className="sage-table-container" style={{ marginTop: "16px" }}>
                              <table className="sage-data-table">
                                <thead>
                                  <tr>
                                    <th style={{ textAlign: "left" }}>Date</th>
                                    <th style={{ textAlign: "center" }}>Points</th>
                                    <th style={{ textAlign: "left" }}>Type</th>
                                    <th style={{ textAlign: "left" }}>Description</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {drawerLoyaltyHistory.map((h) => (
                                    <tr key={h.id}>
                                      <td className="sm-muted-text">{formatDate(h.date)}</td>
                                      <td style={{ textAlign: "center" }}>
                                        <span className={`cm-loyalty-pts-badge ${h.points >= 0 ? "cm-pts-earned" : "cm-pts-redeemed"}`}>
                                          {h.points >= 0 ? "+" : ""}{h.points}
                                        </span>
                                      </td>
                                      <td>
                                        <span className="role-tag-caps">{h.type}</span>
                                      </td>
                                      <td className="sm-muted-text">{h.description}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )} */}
                    </>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          CREATE / EDIT MODAL
      ════════════════════════════════════════════════════════════════════ */}
      {(modalMode === "create" || modalMode === "edit") && (
        <div className="sage-modal-overlay" onClick={closeModal}>
          <div className="sage-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="sage-modal-header">
              <h3>{modalMode === "create" ? "Add New Customer" : "Edit Customer"}</h3>
              <button className="sage-modal-close" onClick={closeModal}><IconX size={24} /></button>
            </div>
            <div className="sage-modal-body">
              {modalLoading ? (
                <div className="sm-modal-loader"><Spinner /></div>
              ) : (
                <form
                  className="admin-form-container"
                  onSubmit={modalMode === "create" ? handleCreateCustomer : handleUpdateCustomer}
                >
                  <div className="form-group-split">
                    <div className="form-group-field">
                      <label>First Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="John"
                        value={form.first_name}
                        onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                      />
                    </div>
                    <div className="form-group-field">
                      <label>Last Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Doe"
                        value={form.last_name}
                        onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-group-field">
                    <label>Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="john@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group-field">
                    <label>Phone Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="+91 9876543210"
                      value={form.phone_no}
                      onChange={(e) => setForm({ ...form, phone_no: e.target.value })}
                    />
                  </div>
                  <div className="form-dialog-buttons footer-gap">
                    <button type="button" className="sage-btn btn-secondary btn-sm" onClick={closeModal}>
                      Cancel
                    </button>
                    <button type="submit" className="sage-btn btn-primary btn-sm" disabled={formLoading}>
                      {formLoading
                        ? "Saving…"
                        : modalMode === "create"
                        ? "Create Customer"
                        : "Save Changes"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          ADD ADDRESS MODAL (inside drawer)
      ════════════════════════════════════════════════════════════════════ */}
      {addressModalOpen && (
        <div className="sage-modal-overlay" onClick={() => setAddressModalOpen(false)}>
          <div className="sage-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="sage-modal-header">
              <h3>Add Address</h3>
              <button className="sage-modal-close" onClick={() => setAddressModalOpen(false)}>
                <IconX size={24} />
              </button>
            </div>
            <div className="sage-modal-body">
              <form className="admin-form-container" onSubmit={handleAddAddress}>
                <div className="form-group-field">
                  <label>Street *</label>
                  <input
                    type="text"
                    required
                    placeholder="123 Main Street"
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                  />
                </div>
                <div className="form-group-split">
                  <div className="form-group-field">
                    <label>City *</label>
                    <input
                      type="text"
                      required
                      placeholder="Chennai"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    />
                  </div>
                  <div className="form-group-field">
                    <label>State *</label>
                    <input
                      type="text"
                      required
                      placeholder="Tamil Nadu"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group-split">
                  <div className="form-group-field">
                    <label>Country</label>
                    <input
                      type="text"
                      placeholder="India"
                      value={addressForm.country}
                      onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                    />
                  </div>
                  <div className="form-group-field">
                    <label>Pincode *</label>
                    <input
                      type="text"
                      required
                      placeholder="600001"
                      value={addressForm.pincode}
                      onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-dialog-buttons footer-gap">
                  <button type="button" className="sage-btn btn-secondary btn-sm" onClick={() => setAddressModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="sage-btn btn-primary btn-sm" disabled={addressLoading}>
                    {addressLoading ? "Adding…" : "Add Address"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CustomerManagement;