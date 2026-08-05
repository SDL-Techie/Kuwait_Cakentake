import React, { useState, useEffect, useCallback, useMemo } from "react";
import "./SupplierManagement.css";
import { supplierApi, supplierApiDetails } from "../../services/directApiService";

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IconTruck = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const IconUser = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconCheckCircle = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const IconXCircle = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
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

const IconTrash = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const IconX = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
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

// ─── Types ────────────────────────────────────────────────────────────────────
interface Supplier {
  id: number;
  name: string;
  contact_name: string;
  phone: string;
  email: string;
  address: string;
  is_active: boolean;
}

type SortOption = "name_asc" | "name_desc" | "status_active" | "status_inactive";
interface Toast { id: number; message: string; type: "success" | "error" }
let toastCounter = 0;

const ITEMS_PER_PAGE = 8;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getInitials = (name: string): string => {
  if (!name) return "SP";
  const parts = name.split(" ");
  if (parts.length > 1) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const getAvatarColor = (id: number): string => {
  const colors = ["#7C3AED", "#059669", "#DC2626", "#D97706", "#2563EB", "#DB2777", "#0891B2", "#65A30D"];
  return colors[id % colors.length];
};

const Spinner: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <div className="cm-spinner" style={{ width: size, height: size }} />
);

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
const SupplierManagement: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // ── Search / Sort / Pagination ────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name_asc");
  const [currentPage, setCurrentPage] = useState(1);

  // ── Form Modal ─────────────────────────────────────────────────────────────
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    contact_name: "",
    phone: "",
    email: "",
    address: "",
    is_active: true
  });

  // ── Toast Notifications ────────────────────────────────────────────────────
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    const id = ++toastCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  // ── Get Token Request Headers ──────────────────────────────────────────────
  const getHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }, []);

  // ── Fetch Suppliers (GET /suppliers) ──────────────────────────────────────
  const fetchSuppliers = useCallback(async () => {
    setTableLoading(true);
    try {
      const response = await supplierApi.list();
      const data = response.data;
      setSuppliers(data.suppliers || []);
    } catch (err: any) {
      showToast(err.message || "Failed to fetch suppliers.", "error");
    } finally {
      setTableLoading(false);
    }
  }, [getHeaders, showToast]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // ── Dynamic Summary Calculations ────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalSuppliers = suppliers.length;
    const activeSuppliers = suppliers.filter((s) => s.is_active).length;
    const inactiveSuppliers = totalSuppliers - activeSuppliers;
    return { totalSuppliers, activeSuppliers, inactiveSuppliers };
  }, [suppliers]);

  // ── Search & Filter Logic ───────────────────────────────────────────────────
  const filteredAndSorted = useMemo(() => {
    const q = searchQuery.toLowerCase();
    let result = suppliers.filter((s) => {
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.contact_name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.phone || "").toLowerCase().includes(q)
      );
    });

    switch (sortBy) {
      case "name_asc":
        result = result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name_desc":
        result = result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "status_active":
        result = result.sort((a, b) => (b.is_active ? 1 : 0) - (a.is_active ? 1 : 0));
        break;
      case "status_inactive":
        result = result.sort((a, b) => (a.is_active ? 1 : 0) - (b.is_active ? 1 : 0));
        break;
    }
    return result;
  }, [suppliers, searchQuery, sortBy]);

  // Pagination Math
  const totalPages = Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE);
  const paginatedSuppliers = useMemo(() =>
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

  // ── Create Supplier (POST /suppliers) ──────────────────────────────────────
  const openCreateModal = () => {
    setForm({ name: "", contact_name: "", phone: "", email: "", address: "", is_active: true });
    setModalMode("create");
  };

  // ── Edit Supplier Fetch Details (GET /suppliers/<id>) ──────────────────────
  const openEditModal = async (supplier: Supplier) => {
    setModalMode("edit");
    setFormLoading(true);
    try {
      const response = await supplierApiDetails.get(supplier.id);
      const data = response.data;
      const current = data.supplier;
      setSelectedSupplier(current);
      setForm({
        name: current.name,
        contact_name: current.contact_name,
        phone: current.phone,
        email: current.email,
        address: current.address,
        is_active: current.is_active
      });
    } catch (err: any) {
      showToast(err.message || "Failed to load supplier profile data.", "error");
      setModalMode(null);
    } finally {
      setFormLoading(false);
    }
  };

  // ── Submit Handling (POST or PUT /suppliers) ──────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    const isCreate = modalMode === "create";
    const method = isCreate ? "POST" : "PUT";
    
    // Format dynamic payload structure requested by endpoint schema
    const payload = isCreate 
      ? { name: form.name, contact_name: form.contact_name, phone: form.phone, email: form.email, address: form.address }
      : { ...form };

    try {
      const response = isCreate
        ? await supplierApi.create(payload)
        : await supplierApi.update(selectedSupplier!.id, payload);
      const data = response.data;
      
      showToast(data.message || `Supplier profiles synchronized successfully.`, "success");
      setModalMode(null);
      fetchSuppliers();
    } catch (err: any) {
      showToast(err.message || "Failed to submit operations form structure.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  // ── Delete Supplier Handler (DELETE /suppliers/<id>) ──────────────────────
  const handleDelete = async (id: number) => {
    if (!window.confirm("Confirm deletion process context for this supplier? This action cannot be undone.")) return;
    try {
      await supplierApi.remove(id);
      
      showToast("Supplier Deleted", "success");
      fetchSuppliers();
    } catch (err: any) {
      showToast(err.message || "Failed to process supplier deletion.", "error");
    }
  };

  return (
    <div className="cm-workspace-container">
      {/* Toast Alert Stack */}
      <div className="sm-toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={`sm-toast sm-toast-${t.type}`}>
            <span className="sm-toast-dot" />
            {t.message}
          </div>
        ))}
      </div>

      {/* Page Layout Header */}
      <div className="cm-page-header">
        <div className="cm-page-header-text">
          <h2>Supplier Management</h2>
          <p>Track supply sources, manage vendor profiles, and coordinate active supplier channels.</p>
        </div>
        <button className="sage-btn btn-primary btn-md" onClick={openCreateModal}>
          <IconPlus size={14} />
          Add Supplier
        </button>
      </div>

      {/* Functional Stats Cards Row Grid */}
      <div className="cm-stats-grid">
        <div className="cm-stat-card">
          <div className="cm-stat-icon-wrap cm-icon-purple">
            <IconTruck size={20} />
          </div>
          <div className="cm-stat-body">
            <h3>{stats.totalSuppliers.toLocaleString()}</h3>
            <span>Total Suppliers</span>
          </div>
        </div>
        <div className="cm-stat-card">
          <div className="cm-stat-icon-wrap cm-icon-green">
            <IconCheckCircle size={20} />
          </div>
          <div className="cm-stat-body">
            <h3>{stats.activeSuppliers.toLocaleString()}</h3>
            <span>Active Channels</span>
          </div>
        </div>
        <div className="cm-stat-card">
          <div className="cm-stat-icon-wrap cm-icon-gold">
            <IconXCircle size={20} />
          </div>
          <div className="cm-stat-body">
            <h3>{stats.inactiveSuppliers.toLocaleString()}</h3>
            <span>Inactive Channels</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar Ribbon Layout */}
      <div className="cm-toolbar">
        <div className="cm-search-wrap">
          <IconSearch size={16} />
          <input
            type="text"
            className="cm-search-input"
            placeholder="Search suppliers by name, email or phone line..."
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
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
            <option value="status_active">Active Status</option>
            <option value="status_inactive">Inactive Status</option>
          </select>
        </div>
      </div>

      {/* Core Inventory Registry Matrix Table */}
      <div className="cm-table-section">
        <div className="sage-table-card">
          <div className="sage-table-container">
            {tableLoading ? (
              <div className="cm-table-loader">
                <Spinner size={28} />
                <span>Loading active vendor directories...</span>
              </div>
            ) : (
              <table className="sage-data-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: "left" }}>Vendor Title Identity</th>
                    <th style={{ textAlign: "left" }}>Primary Liaison</th>
                    <th style={{ textAlign: "left" }}>Email Gateway</th>
                    <th style={{ textAlign: "left" }}>Contact Connection</th>
                    <th style={{ textAlign: "left" }}>HQ Node Address</th>
                    <th style={{ textAlign: "center" }}>Status</th>
                    <th style={{ textAlign: "right" }}>Actions Network</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSuppliers.length === 0 ? (
                    <tr>
                      <td className="empty-table-cell" colSpan={7} style={{ padding: "40px 20px", textCombineUpright: "all", color: "var(--muted)", textAlign: "center" }}>
                        <div className="cm-empty-state">
                          <IconPackage size={36} />
                          <p>{searchQuery ? "No suppliers match active parameters." : "No suppliers registered currently."}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedSuppliers.map((supplier) => (
                      <tr key={supplier.id}>
                        <td>
                          <div className="cm-customer-cell">
                            <div
                              className="cm-avatar"
                              style={{ backgroundColor: getAvatarColor(supplier.id) }}
                            >
                              {getInitials(supplier.name)}
                            </div>
                            <div className="cm-customer-info">
                              <strong>{supplier.name}</strong>
                              <span className="sm-id-badge" style={{ fontSize: "11px", color: "var(--muted)" }}>#{supplier.id}</span>
                            </div>
                          </div>
                        </td>
                        <td>{supplier.contact_name}</td>
                        <td className="sm-muted-text" style={{ color: "var(--muted)" }}>{supplier.email}</td>
                        <td>{supplier.phone || "—"}</td>
                        <td className="sm-muted-text" style={{ color: "var(--muted)" }}>{supplier.address || "—"}</td>
                        <td style={{ textAlign: "center" }}>
                          <span className={`cm-status-badge ${supplier.is_active ? "cm-status-completed" : "cm-status-cancelled"}`}>
                            {supplier.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <div className="tbl-actions" style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                            <button
                              className="sage-btn btn-primary btn-sm sm-icon-btn"
                              style={{ padding: "6px", cursor: "pointer", borderRadius: "6px" }}
                              title="Modify Properties"
                              onClick={() => openEditModal(supplier)}
                            >
                              <IconEdit size={14} />
                            </button>
                            <button
                              className="sage-btn btn-secondary btn-sm sm-icon-btn"
                              style={{ padding: "6px", cursor: "pointer", borderRadius: "6px", color: "#DC2626", background: "#FEF2F2", borderColor: "#FCA5A5" }}
                              title="Purge Channel File"
                              onClick={() => handleDelete(supplier.id)}
                            >
                              <IconTrash size={14} />
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

        {/* Dynamic Pagination Footer Strip */}
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`cm-page-btn ${currentPage === p ? "cm-page-active" : ""}`}
                  onClick={() => setCurrentPage(p)}
                >
                  {p}
                </button>
              ))}
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

      {/* ─── Integrated Modals Form Popup Workspace Overlay ──────────────────── */}
      {modalMode && (
        <div className="cm-modal-overlay">
          <div className="cm-modal-window">
            <div className="cm-modal-header">
              <h3>{modalMode === "create" ? "Establish New Vendor Node" : "Configure Channel Properties"}</h3>
              <button className="cm-modal-close" onClick={() => setModalMode(null)}>
                <IconX size={18} />
              </button>
            </div>
            {formLoading ? (
              <div className="cm-table-loader">
                <Spinner size={24} />
                <span>Syncing instance stream metrics...</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="cm-modal-form">
                <div className="cm-form-element">
                  <label>Supplier Corporate Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g.Suppliers"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="cm-form-element">
                  <label>Liaison Officer Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ..."
                    value={form.contact_name}
                    onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                  />
                </div>
                <div className="cm-form-split-row">
                  <div className="cm-form-element">
                    <label>Secure Telephone Connection</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 9876543210"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                  <div className="cm-form-element">
                    <label>Digital Delivery Mailbox</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. abc@gmail.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="cm-form-element">
                  <label>Operational HQ Address Coordinates</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chennai"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </div>
                {modalMode === "edit" && (
                  <div className="cm-form-element cm-checkbox-field">
                    <input
                      type="checkbox"
                      id="is_active_toggle"
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    />
                    <label htmlFor="is_active_toggle">Channel Verified & Operational</label>
                  </div>
                )}
                <div className="cm-modal-footer">
                  <button type="button" className="sage-btn btn-secondary" onClick={() => setModalMode(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="sage-btn btn-primary">
                    {modalMode === "create" ? "Deploy Supplier" : "Commit Infrastructure changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierManagement;