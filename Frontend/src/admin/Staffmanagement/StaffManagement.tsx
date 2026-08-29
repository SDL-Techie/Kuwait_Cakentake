import React, { useState, useEffect, useCallback } from "react";
import "./StaffManagement.css";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getPermissions,
  assignPermission,
  updatePermission,
  User,
  Permission,
  UserRole,
  CreateUserPayload,
  AssignPermissionPayload,
} from "../../services/userService";

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

const IconShield = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const IconTruck = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const IconBriefcase = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const IconChef = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
    <line x1="6" y1="17" x2="18" y2="17" />
  </svg>
);

const IconX = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconEye = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
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
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const IconKey = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="15.5" r="5.5" />
    <path d="M21 2l-9.6 9.6" />
    <path d="M15.5 7.5l3 3L22 7l-3-3" />
  </svg>
);

const IconPlus = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLES: { label: string; value: string }[] = [
  { label: "All Users", value: "" },
  { label: "Shop Manager", value: "SHOP_MANAGER" },
  { label: "Kitchen Staff", value: "KITCHEN_STAFF" },
  { label: "Delivery Agent", value: "DELIVERY_AGENT" },
  { label: "Sales Staff", value: "SALES_AGENT" },
  // { label: "Agent", value: "AGENT" },
  { label: "Driver", value: "DRIVER" },
];

const MODULES = [
  "orders",
  "products",
  "categories",
  "customers",
  "staff",
  "reports",
  "dashboard",
  "inventory",
];

type ModalMode = "create" | "view" | "edit" | "delete" | "permissions" | null;

// ─── Toast ────────────────────────────────────────────────────────────────────

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

let toastCounter = 0;

// ─── Permission Form State ────────────────────────────────────────────────────

interface PermForm {
  module: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

const defaultPermForm = (): PermForm => ({
  module: MODULES[0],
  can_view: false,
  can_create: false,
  can_edit: false,
  can_delete: false,
});

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

export const StaffManagement: React.FC = () => {
  // ── Users state ────────────────────────────────────────────────────────────
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeRole, setActiveRole] = useState<string>("");
  const [modalMode, setModalMode] = useState<ModalMode>(null);

  // ── Permissions state ──────────────────────────────────────────────────────
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [permForm, setPermForm] = useState<PermForm>(defaultPermForm());
  const [editingPerm, setEditingPerm] = useState<Permission | null>(null);
  const [permModalMode, setPermModalMode] = useState<"assign" | "edit" | null>(null);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_no: "",
    password: "",
    role: "SHOP_MANAGER" as UserRole,
  });

  // ── Loading states ─────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [permissionLoading, setPermissionLoading] = useState(false);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    const id = ++toastCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalUsers = users.length;
  const shopManagers = users.filter((u) => u.role === "SHOP_MANAGER").length;
  const deliveryAgents = users.filter((u) => u.role === "DELIVERY_AGENT").length;
  const salesAgents = users.filter((u) => u.role === "SALES_AGENT").length;
  const drivers = users.filter((u) => u.role === "DRIVER").length;
  const kitchenStaff = users.filter((u) => u.role === "KITCHEN_STAFF").length;

  // ── Fetch users ────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async (role?: string) => {
    setTableLoading(true);
    try {
      const data = await getUsers(role || undefined);
      // const staffUsers = data.filter(user => user.role !== "USER");
      const staffUsers = data.filter(user => user.role !== "USER" && user.role !== "AGENT");
setUsers(staffUsers);
    } catch (err: any) {
      showToast(err?.response?.data?.error || "Failed to load users.", "error");
    } finally {
      setTableLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchUsers(activeRole);
  }, [activeRole, fetchUsers]);

  // ── Fetch all permissions ──────────────────────────────────────────────────
  const fetchPermissions = useCallback(async () => {
    setPermissionLoading(true);
    try {
      const data = await getPermissions();
      setAllPermissions(data);
    } catch (err: any) {
      showToast(err?.response?.data?.error || "Failed to load permissions.", "error");
    } finally {
      setPermissionLoading(false);
    }
  }, [showToast]);

  // ── Open modals ────────────────────────────────────────────────────────────
  const openViewModal = async (user: User) => {
    setModalLoading(true);
    setModalMode("view");
    try {
      const data = await getUserById(user.id);
      setSelectedUser(data);
    } catch (err: any) {
      showToast(err?.response?.data?.error || "Failed to load user.", "error");
      setModalMode(null);
    } finally {
      setModalLoading(false);
    }
  };

  const openEditModal = async (user: User) => {
    setModalLoading(true);
    setModalMode("edit");
    try {
      const data = await getUserById(user.id);
      setSelectedUser(data);
      setForm({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone_no: data.phone_no,
        password: "",
        role: data.role,
      });
    } catch (err: any) {
      showToast(err?.response?.data?.error || "Failed to load user.", "error");
      setModalMode(null);
    } finally {
      setModalLoading(false);
    }
  };

  const openCreateModal = () => {
    setForm({ first_name: "", last_name: "", email: "", phone_no: "", password: "", role: "SHOP_MANAGER" });
    setModalMode("create");
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setModalMode("delete");
  };

  const openPermissionsModal = async (user: User) => {
    setSelectedUser(user);
    setModalMode("permissions");
    setPermModalMode(null);
    setPermForm(defaultPermForm());
    setEditingPerm(null);
    await fetchPermissions();
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedUser(null);
    setPermModalMode(null);
    setPermForm(defaultPermForm());
    setEditingPerm(null);
  };

  // ── Create user ────────────────────────────────────────────────────────────
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload: CreateUserPayload = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone_no: form.phone_no,
        password: form.password,
        role: form.role,
      };
      await createUser(payload);
      showToast("User Created Successfully", "success");
      closeModal();
      fetchUsers(activeRole);
    } catch (err: any) {
      showToast(err?.response?.data?.error || "Failed to create user.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  // ── Edit user ──────────────────────────────────────────────────────────────
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setFormLoading(true);
    try {
      const payload: any = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone_no: form.phone_no,
        role: form.role,
      };
      if (form.password) payload.password = form.password;
      await updateUser(selectedUser.id, payload);
      showToast("User Updated Successfully", "success");
      closeModal();
      fetchUsers(activeRole);
    } catch (err: any) {
      showToast(err?.response?.data?.error || "Failed to update user.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  // ── Delete user ────────────────────────────────────────────────────────────
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setFormLoading(true);
    try {
      await deleteUser(selectedUser.id);
      showToast("User Deleted Successfully", "success");
      closeModal();
      fetchUsers(activeRole);
    } catch (err: any) {
      showToast(err?.response?.data?.error || "Failed to delete user.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  // ── Assign permission ──────────────────────────────────────────────────────
  const handleAssignPermission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setFormLoading(true);
    try {
      const payload: AssignPermissionPayload = {
        user_id: selectedUser.id,
        module: permForm.module,
        can_view: permForm.can_view,
        can_create: permForm.can_create,
        can_edit: permForm.can_edit,
        can_delete: permForm.can_delete,
      };
      await assignPermission(payload);
      showToast("Permission Assigned Successfully", "success");
      setPermModalMode(null);
      setPermForm(defaultPermForm());
      await fetchPermissions();
    } catch (err: any) {
      showToast(err?.response?.data?.error || "Failed to assign permission.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  // ── Edit permission ────────────────────────────────────────────────────────
  const handleUpdatePermission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setFormLoading(true);
    try {
      const payload: AssignPermissionPayload = {
        user_id: selectedUser.id,
        module: permForm.module,
        can_view: permForm.can_view,
        can_create: permForm.can_create,
        can_edit: permForm.can_edit,
        can_delete: permForm.can_delete,
      };
      await updatePermission(payload);
      showToast("Permission Updated Successfully", "success");
      setPermModalMode(null);
      setPermForm(defaultPermForm());
      setEditingPerm(null);
      await fetchPermissions();
    } catch (err: any) {
      showToast(err?.response?.data?.error || "Failed to update permission.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const openEditPerm = (perm: Permission) => {
    setEditingPerm(perm);
    setPermForm({
      module: perm.module,
      can_view: perm.can_view,
      can_create: perm.can_create,
      can_edit: perm.can_edit,
      can_delete: perm.can_delete,
    });
    setPermModalMode("edit");
  };

  const userPermissions = selectedUser
    ? allPermissions.filter((p) => p.user_id === selectedUser.id)
    : [];

  const formatRole = (role: string) =>
    role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
      });
    } catch { return "—"; }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="staff-workspace-container">

      {/* ── Toast Notifications ─────────────────────────────────────────── */}
      <div className="sm-toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={`sm-toast sm-toast-${t.type}`}>
            <span className="sm-toast-dot" />
            {t.message}
          </div>
        ))}
      </div>

      {/* ── 1. Stats Grid ────────────────────────────────────────────────── */}
      <div className="staff-stats-grid sm-stats-6">
        <div className="staff-stat-card">
          <IconUsers size={20} className="meta-icon light-green" />
          <div className="details">
            <h3>{totalUsers}</h3>
            <span>Total Users</span>
          </div>
        </div>
        <div className="staff-stat-card">
          <IconBriefcase size={20} className="meta-icon gold" />
          <div className="details">
            <h3>{shopManagers}</h3>
            <span>Shop Managers</span>
          </div>
        </div>
        <div className="staff-stat-card">
          <IconTruck size={20} className="meta-icon bright-green" />
          <div className="details">
            <h3>{deliveryAgents}</h3>
            <span>Delivery Agents</span>
          </div>
        </div>
        <div className="staff-stat-card">
          <IconUsers size={20} className="meta-icon light-green" />
          <div className="details">
            <h3>{salesAgents}</h3>
            <span>Sales Staff</span>
          </div>
        </div>
        <div className="staff-stat-card">
          <IconTruck size={20} className="meta-icon gold" />
          <div className="details">
            <h3>{drivers}</h3>
            <span>Drivers</span>
          </div>
        </div>
        <div className="staff-stat-card">
          <IconChef size={20} className="meta-icon bright-green" />
          <div className="details">
            <h3>{kitchenStaff}</h3>
            <span>Kitchen Staff</span>
          </div>
        </div>
      </div>

      {/* ── 2. Table Section ─────────────────────────────────────────────── */}
      <div className="staff-table-section">
        <div className="staff-table-header sm-table-header-row">
          <h4>User &amp; Permission Management</h4>
          <div className="sm-header-actions">
            {/* Role Filter Chips */}
            <div className="sm-role-chips">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  className={`sm-chip ${activeRole === r.value ? "sm-chip-active" : ""}`}
                  onClick={() => setActiveRole(r.value)}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <button
              className="sage-btn btn-primary btn-md"
              onClick={openCreateModal}
            >
              <IconPlus size={24} />
              Add User
            </button>
          </div>
        </div>

        <div className="sage-table-card">
          <div className="sage-table-container">
            {tableLoading ? (
              <div className="sm-table-loader">
                <div className="sm-spinner" />
                <span>Loading users…</span>
              </div>
            ) : (
              <table className="sage-data-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: "left" }}>ID</th>
                    <th style={{ textAlign: "left" }}>Name</th>
                    <th style={{ textAlign: "left" }}>Email</th>
                    <th style={{ textAlign: "left" }}>Phone</th>
                    <th style={{ textAlign: "left" }}>Role</th>
                    <th style={{ textAlign: "left" }}>Created</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td className="empty-table-cell" colSpan={7}>
                        No users found. Click "Add User" to create one.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <span className="sm-id-badge">#{user.id}</span>
                        </td>
                        <td>
                          <strong>{user.first_name} {user.last_name}</strong>
                        </td>
                        <td className="sm-muted-text">{user.email}</td>
                        <td>{user.phone_no || "—"}</td>
                        <td>
                          <span className={`sm-role-badge sm-role-${user.role.toLowerCase()}`}>
                            {formatRole(user.role)}
                          </span>
                        </td>
                        <td className="sm-muted-text">{formatDate(user.created_at)}</td>
                        <td>
                          <div className="tbl-actions">
                            <button
                              className="sage-btn btn-secondary btn-sm sm-icon-btn"
                              title="View"
                              onClick={() => openViewModal(user)}
                            >
                              <IconEye size={24} />
                            </button>
                            <button
                              className="sage-btn btn-secondary btn-sm sm-icon-btn"
                              title="Edit"
                              onClick={() => openEditModal(user)}
                            >
                              <IconEdit size={24} />
                            </button>
                            {/* <button
                              className="sage-btn btn-primary btn-sm sm-icon-btn"
                              title="Permissions"
                              onClick={() => openPermissionsModal(user)}
                            >
                              <IconKey size={24} />
                            </button> */}
                            <button
                              className="sage-btn btn-danger btn-sm sm-icon-btn"
                              title="Delete"
                              onClick={() => openDeleteModal(user)}
                            >
                              <IconTrash size={24} />
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
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          MODALS
      ════════════════════════════════════════════════════════════════════ */}

      {/* ── VIEW MODAL ───────────────────────────────────────────────────── */}
      {modalMode === "view" && (
        <div className="sage-modal-overlay" onClick={closeModal}>
          <div className="sage-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="sage-modal-header">
              <h3>User Details</h3>
              <button className="sage-modal-close" onClick={closeModal}><IconX size={24} /></button>
            </div>
            <div className="sage-modal-body">
              {modalLoading ? (
                <div className="sm-modal-loader"><div className="sm-spinner" /></div>
              ) : selectedUser ? (
                <div className="sm-view-grid">
                  <div className="sm-view-row">
                    <span className="sm-view-label">User ID</span>
                    <span className="sm-view-value sm-id-badge">#{selectedUser.id}</span>
                  </div>
                  <div className="sm-view-row">
                    <span className="sm-view-label">First Name</span>
                    <span className="sm-view-value">{selectedUser.first_name}</span>
                  </div>
                  <div className="sm-view-row">
                    <span className="sm-view-label">Last Name</span>
                    <span className="sm-view-value">{selectedUser.last_name}</span>
                  </div>
                  <div className="sm-view-row">
                    <span className="sm-view-label">Email</span>
                    <span className="sm-view-value">{selectedUser.email}</span>
                  </div>
                  <div className="sm-view-row">
                    <span className="sm-view-label">Phone Number</span>
                    <span className="sm-view-value">{selectedUser.phone_no || "—"}</span>
                  </div>
                  <div className="sm-view-row">
                    <span className="sm-view-label">Role</span>
                    <span className={`sm-role-badge sm-role-${selectedUser.role.toLowerCase()}`}>
                      {formatRole(selectedUser.role)}
                    </span>
                  </div>
                  {selectedUser.created_at && (
                    <div className="sm-view-row">
                      <span className="sm-view-label">Created</span>
                      <span className="sm-view-value">{formatDate(selectedUser.created_at)}</span>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE / EDIT MODAL ──────────────────────────────────────────── */}
      {(modalMode === "create" || modalMode === "edit") && (
        <div className="sage-modal-overlay" onClick={closeModal}>
          <div className="sage-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="sage-modal-header">
              <h3>{modalMode === "create" ? "Create New User" : "Edit User"}</h3>
              <button className="sage-modal-close" onClick={closeModal}><IconX /></button>
            </div>
            <div className="sage-modal-body">
              {modalLoading ? (
                <div className="sm-modal-loader"><div className="sm-spinner" /></div>
              ) : (
                <form
                  className="admin-form-container"
                  onSubmit={modalMode === "create" ? handleCreateUser : handleUpdateUser}
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

                  <div className="form-group-split">
                    <div className="form-group-field">
                      <label>Phone</label>
                      <input
                        type="text"
                        placeholder="+91 9876543210"
                        value={form.phone_no}
                        onChange={(e) => setForm({ ...form, phone_no: e.target.value })}
                      />
                    </div>
                    <div className="form-group-field">
                      <label>Role *</label>
                      <select
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                      >
                        <option value="SHOP_MANAGER">Shop Manager</option>
                        <option value="KITCHEN_STAFF">Kitchen Staff</option>
                        <option value="DELIVERY_AGENT">Delivery Agent</option>
                        <option value="SALES_AGENT">Sales Staff</option>
                        <option value="DRIVER">Driver</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group-field">
                    <label>{modalMode === "create" ? "Password *" : "Password (leave blank to keep)"}</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      required={modalMode === "create"}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                  </div>

                  <div className="form-dialog-buttons footer-gap">
                    <button
                      type="button"
                      className="sage-btn btn-secondary btn-sm"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="sage-btn btn-primary btn-sm"
                      disabled={formLoading}
                    >
                      {formLoading
                        ? "Saving…"
                        : modalMode === "create"
                        ? "Create User"
                        : "Save Changes"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ─────────────────────────────────────────────────── */}
      {modalMode === "delete" && selectedUser && (
        <div className="sage-modal-overlay" onClick={closeModal}>
          <div
            className="sage-modal-content sm-modal-narrow"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sage-modal-header">
              <h3>Delete User</h3>
              <button className="sage-modal-close" onClick={closeModal}><IconX /></button>
            </div>
            <div className="sage-modal-body">
              <div className="sm-delete-body">
                <div className="sm-delete-icon-wrap">
                  <IconTrash size={28} />
                </div>
                <p className="sm-delete-title">Are you sure?</p>
                <p className="sm-delete-sub">
                  You are about to permanently delete{" "}
                  <strong>{selectedUser.first_name} {selectedUser.last_name}</strong>.
                  This action cannot be undone.
                </p>
              </div>
              <div className="form-dialog-buttons footer-gap">
                <button
                  className="sage-btn btn-secondary btn-sm"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  className="sage-btn btn-danger btn-sm"
                  disabled={formLoading}
                  onClick={handleDeleteUser}
                >
                  {formLoading ? "Deleting…" : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PERMISSIONS MODAL ────────────────────────────────────────────── */}
      {modalMode === "permissions" && selectedUser && (
        <div className="sage-modal-overlay" onClick={closeModal}>
          <div
            className="sage-modal-content sm-modal-wide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sage-modal-header">
              <div>
                <h3>Permission Management</h3>
                <p className="sm-perm-subheader">
                  {selectedUser.first_name} {selectedUser.last_name} &nbsp;·&nbsp;
                  <span className={`sm-role-badge sm-role-${selectedUser.role.toLowerCase()}`}>
                    {formatRole(selectedUser.role)}
                  </span>
                </p>
              </div>
              <button className="sage-modal-close" onClick={closeModal}><IconX size={24}/></button>
            </div>

            <div className="sage-modal-body">
              {/* Assign / Edit sub-form */}
              {permModalMode === "assign" || permModalMode === "edit" ? (
                <form
                  className="admin-form-container"
                  onSubmit={permModalMode === "assign" ? handleAssignPermission : handleUpdatePermission}
                >
                  <h4 className="sm-perm-form-title">
                    {permModalMode === "assign" ? "Assign Permission" : "Edit Permission"}
                  </h4>

                  <div className="form-group-field">
                    <label>Module</label>
                    <select
                      value={permForm.module}
                      disabled={permModalMode === "edit"}
                      onChange={(e) => setPermForm({ ...permForm, module: e.target.value })}
                    >
                      {MODULES.map((m) => (
                        <option key={m} value={m}>
                          {m.charAt(0).toUpperCase() + m.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm-perm-checks">
                    {(["can_view", "can_create", "can_edit", "can_delete"] as const).map((field) => (
                      <label key={field} className="sm-check-label">
                        <input
                          type="checkbox"
                          checked={permForm[field]}
                          onChange={(e) =>
                            setPermForm({ ...permForm, [field]: e.target.checked })
                          }
                        />
                        {field.replace("can_", "Can ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </label>
                    ))}
                  </div>

                  <div className="form-dialog-buttons footer-gap">
                    <button
                      type="button"
                      className="sage-btn btn-secondary btn-sm"
                      onClick={() => { setPermModalMode(null); setPermForm(defaultPermForm()); setEditingPerm(null); }}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="sage-btn btn-primary btn-sm"
                      disabled={formLoading}
                    >
                      {formLoading ? "Saving…" : permModalMode === "assign" ? "Assign" : "Update"}
                    </button>
                  </div>
                </form>
              ) : (
                /* Permission list */
                <>
                  <div className="sm-perm-list-header">
                    <span className="sm-perm-count">
                      {userPermissions.length} permission{userPermissions.length !== 1 ? "s" : ""}
                    </span>
                    <button
                      className="sage-btn btn-primary btn-sm"
                      onClick={() => { setPermModalMode("assign"); setPermForm(defaultPermForm()); }}
                    >
                      <IconPlus size={24} />
                      Assign Permission
                    </button>
                  </div>

                  {permissionLoading ? (
                    <div className="sm-modal-loader"><div className="sm-spinner" /></div>
                  ) : userPermissions.length === 0 ? (
                    <div className="sm-perm-empty">
                      <IconShield size={32} />
                      <p>No permissions assigned yet.</p>
                    </div>
                  ) : (
                    <div className="sage-table-container">
                      <table className="sage-data-table">
                        <thead>
                          <tr>
                            <th style={{ textAlign: "left" }}>Module</th>
                            <th style={{ textAlign: "center" }}>View</th>
                            <th style={{ textAlign: "center" }}>Create</th>
                            <th style={{ textAlign: "center" }}>Edit</th>
                            <th style={{ textAlign: "center" }}>Delete</th>
                            <th style={{ textAlign: "right" }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userPermissions.map((perm) => (
                            <tr key={perm.id}>
                              <td>
                                <span className="role-tag-caps">{perm.module}</span>
                              </td>
                              {(["can_view", "can_create", "can_edit", "can_delete"] as const).map((f) => (
                                <td key={f} style={{ textAlign: "center" }}>
                                  <span className={`sm-perm-badge ${perm[f] ? "sm-perm-on" : "sm-perm-off"}`}>
                                    {perm[f] ? "Yes" : "No"}
                                  </span>
                                </td>
                              ))}
                              <td>
                                <div className="tbl-actions">
                                  <button
                                    className="sage-btn btn-secondary btn-sm sm-icon-btn"
                                    onClick={() => openEditPerm(perm)}
                                    title="Edit Permission"
                                  >
                                    <IconEdit size={24} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;