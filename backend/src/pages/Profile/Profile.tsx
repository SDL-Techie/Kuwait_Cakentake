import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, MapPin, LogOut, Plus,
  Check, Trash2, Home as HomeIcon, Edit3, X,
  Shield, AlertCircle, Loader2, Save, Cookie
} from 'lucide-react';
import { storefrontApi } from '../../services/directApiService';
import './Profile.css';

import { getAreas, Area } from '../../services/areaService';

import {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  Address,
} from '../../services/addressService';


const getToken = () => localStorage.getItem('token') || '';
const getUser = () => JSON.parse(localStorage.getItem('user') || '{}');
const authHeaders = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

interface UserProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_no: string;
  role: string;
}

// Matches the backend's create_address requirements exactly: area_id and
// street are the only mandatory fields (see routes/address_routes.py).
// Everything else is optional Kuwait-style address detail.
const emptyAddr: Omit<Address, 'id' | 'user_id'> = {
  area_id: 0,
  street: '',
  block: '',
  avenue: '',
  building: '',
  floor: '',
  apartment: '',
  delivery_notes: '',
  country: 'Kuwait',
};

/* ─── Toast Component ─── */
const Toast: React.FC<{ msg: string; show: boolean; onClose: () => void }> = ({ msg, show, onClose }) => {
  useEffect(() => {
    if (show) { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }
  }, [show, onClose]);
  if (!show) return null;
  return (
    <motion.div
      className="prof-toast"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
    >
      <span>{msg}</span>
      <button onClick={onClose}><X size={14} /></button>
    </motion.div>
  );
};

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const storedUser = getUser();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'address'>('info');

  /* Personal Info Edit */
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editFirst, setEditFirst] = useState('');
  const [editLast, setEditLast] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');

  /* Address Modal */
  const [showModal, setShowModal] = useState(false);
  const [editingAddr, setEditingAddr] = useState<Address | null>(null);
  const [addrForm, setAddrForm] = useState<Omit<Address, 'id' | 'user_id'>>({ ...emptyAddr });
  const [addrErrors, setAddrErrors] = useState<Record<string, string>>({});
  const [savingAddr, setSavingAddr] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  /* Toast */
  const [toast, setToast] = useState({ show: false, msg: '' });
  const showToast = (msg: string) => setToast({ show: true, msg });

  /* ── Fetch Profile with Addresses + Areas ── */
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const userId = storedUser?.id;

      if (!userId) {
        showToast('❌ You need to log in again');
        setLoading(false);
        return;
      }

      const profileRes = await storefrontApi.profile(userId, authHeaders());
      const userData: UserProfile = profileRes.data.data || profileRes.data;
      setProfile(userData);

      setEditFirst(userData.first_name || '');
      setEditLast(userData.last_name || '');
      setEditEmail(userData.email || '');
      setEditPhone(userData.phone_no || '');

      // getAreas() hits GET /areas, which the backend filters to
      // is_active=True only — so this naturally shows only the delivery
      // areas an admin has actually created and turned on.
      const [addressList, areaList] = await Promise.all([
        getUserAddresses(userId),
        getAreas(),
      ]);

      setAddresses(addressList);
      setAreas(areaList);
    } catch (error) {
      console.error('Error fetching profile or addresses:', error);
      showToast('❌ Failed to load account info');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  /* ── Save Personal Info ── */
  const handleSaveInfo = async () => {
    setIsSaving(true);
    try {
      const payload = {
        first_name: editFirst.trim(),
        last_name: editLast.trim(),
        email: editEmail.trim(),
        phone_no: editPhone.trim(),
      };

      const profileRes = await storefrontApi.updateProfile(payload, authHeaders());
      const updatedUser = profileRes.data.user || profileRes.data;

      const mergedProfile: UserProfile = {
        ...(profile || ({} as UserProfile)),
        id: updatedUser.id ?? (profile?.id || storedUser?.id),
        first_name: updatedUser.first_name ?? editFirst,
        last_name: updatedUser.last_name ?? editLast,
        email: updatedUser.email ?? editEmail,
        phone_no: updatedUser.phone_no ?? editPhone,
        role: updatedUser.role ?? profile?.role ?? storedUser?.role ?? 'USER',
      };

      setProfile(mergedProfile);
      setEditFirst(mergedProfile.first_name);
      setEditLast(mergedProfile.last_name);
      setEditEmail(mergedProfile.email);
      setEditPhone(mergedProfile.phone_no);

      const storedUpdated = {
        ...storedUser,
        id: mergedProfile.id,
        name: `${mergedProfile.first_name} ${mergedProfile.last_name}`,
        email: mergedProfile.email,
        phone: mergedProfile.phone_no,
        role: mergedProfile.role,
      };
      localStorage.setItem('user', JSON.stringify(storedUpdated));

      setIsEditing(false);
      showToast('✅ Profile updated successfully');
    } catch (error: any) {
      const errMsg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        '❌ Failed to update profile';
      showToast(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  /* ── Address: Open Modal ── */
  const openAddModal = () => {
    setEditingAddr(null);
    setAddrForm({ ...emptyAddr });
    setAddrErrors({});
    setShowModal(true);
  };

  const openEditModal = (addr: Address) => {
    setEditingAddr(addr);
    setAddrForm({
      area_id: addr.area_id,
      street: addr.street,
      block: addr.block || '',
      avenue: addr.avenue || '',
      building: addr.building || '',
      floor: addr.floor || '',
      apartment: addr.apartment || '',
      delivery_notes: addr.delivery_notes || '',
      country: addr.country,
    });
    setAddrErrors({});
    setShowModal(true);
  };

  /* ── Address: Validate ──
     Mirrors the backend exactly (routes/address_routes.py create_address):
     only area_id and street are required. Everything else is optional, so
     we don't block submission on building/floor/etc. */
  const validateAddress = () => {
    const errs: Record<string, string> = {};

    if (!addrForm.area_id) errs.area = 'Please select a delivery area';
    if (!addrForm.street.trim()) errs.street = 'Street is required';

    setAddrErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ── Address: Save (POST or PUT) ── */
  const handleSaveAddr = async () => {
    if (!validateAddress()) return;

    setSavingAddr(true);
    try {
      if (editingAddr && editingAddr.id) {
        const updated = await updateAddress(editingAddr.id, addrForm);
        setAddresses(prev => prev.map(a => (a.id === editingAddr.id ? updated : a)));
        showToast('✅ Address updated successfully');
      } else {
        // user_id is derived server-side from the JWT — no need to send it.
        const created = await createAddress(addrForm);
        setAddresses(prev => [...prev, created]);
        showToast('✅ Address added successfully');
      }
      setShowModal(false);
    } catch (error: any) {
      const errMsg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        '❌ Failed to save address';
      showToast(errMsg);
    } finally {
      setSavingAddr(false);
    }
  };

  /* ── Address: Delete ── */
  const handleDeleteAddr = async (addr: Address) => {
    if (!addr.id) return;
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    setDeletingId(addr.id);
    try {
      await deleteAddress(addr.id);
      setAddresses(prev => prev.filter(a => a.id !== addr.id));
      showToast('✅ Address deleted successfully');
    } catch (error: any) {
      const errMsg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        '❌ Failed to delete address';
      showToast(errMsg);
    } finally {
      setDeletingId(null);
    }
  };

  /* ── Logout ── */
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="prof-loader">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <div className="prof-loader-ring" />
        </motion.div>
        <p>Warming up your account...</p>
      </div>
    );
  }

  const fullName = profile
    ? `${profile.first_name} ${profile.last_name}`
    : storedUser?.name || 'User';
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

  return (
    <div className="prof-page">
      <Toast msg={toast.msg} show={toast.show} onClose={() => setToast({ show: false, msg: '' })} />

      {/* ── Hero Section ── */}
      <header className="prof-hero">
        <motion.div
          className="prof-hero-icon"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Cookie size={26} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          My Account
        </motion.h1>

        <p>Manage your details & delivery addresses so your treats arrive fresh</p>
      </header>

      <div className="prof-container">
        {/* ── Tab Navigation ── */}
        <div className="prof-tab-wrapper">
          <div className="prof-tab-bar">
            {(['info', 'address'] as const).map(tab => (
              <button
                key={tab}
                className={`prof-tab-pill ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'info' ? (
                  <><User size={16} /> Personal Info</>
                ) : (
                  <><MapPin size={16} /> Addresses</>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Main Grid Layout ── */}
        <div className="prof-grid">
          {/* LEFT: Profile Card */}
          <aside className="prof-sidebar">
            <div className="prof-avatar-card">
              <div className="prof-avatar-ring">
                <div className="prof-avatar">{initials}</div>
              </div>
              <h2 className="prof-name">{fullName}</h2>
              <p className="prof-role">{profile?.role || 'USER'}</p>
              <p className="prof-email">{profile?.email || storedUser?.email}</p>

              <div className="prof-stats-row">
                <div className="prof-stat">
                  <span className="prof-stat-val">{addresses.length}</span>
                  <span className="prof-stat-label">Addresses</span>
                </div>
                <div className="prof-stat-divider" />
                <div className="prof-stat">
                  <span className="prof-stat-val"><Shield size={16} /></span>
                  <span className="prof-stat-label">Verified</span>
                </div>
              </div>

              <button className="prof-logout-btn" onClick={handleLogout}>
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </aside>

          {/* RIGHT: Tab Content */}
          <main className="prof-main">
            <AnimatePresence mode="wait">
              {/* ── PERSONAL INFO TAB ── */}
              {activeTab === 'info' && (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.22 }}
                  className="prof-content-card"
                >
                  <div className="prof-card-header">
                    <h3>Personal Information</h3>
                    {!isEditing && (
                      <button className="prof-edit-link" onClick={() => setIsEditing(true)}>
                        <Edit3 size={14} /> Edit
                      </button>
                    )}
                  </div>

                  {!isEditing ? (
                    <div className="prof-info-stack">
                      <div className="prof-info-row">
                        <User size={16} />
                        <div>
                          <label>Full Name</label>
                          <p>{fullName}</p>
                        </div>
                      </div>
                      <div className="prof-info-row">
                        <Mail size={16} />
                        <div>
                          <label>Email Address</label>
                          <p>{profile?.email || '—'}</p>
                        </div>
                      </div>
                      <div className="prof-info-row">
                        <Phone size={16} />
                        <div>
                          <label>Phone Number</label>
                          <p>{profile?.phone_no || '—'}</p>
                        </div>
                      </div>
                      <div className="prof-info-row">
                        <Shield size={16} />
                        <div>
                          <label>Account Type</label>
                          <p>{profile?.role || 'USER'}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="prof-form-stack">
                      <div className="prof-form-row-2">
                        <div className="prof-field">
                          <label>First Name</label>
                          <input
                            value={editFirst}
                            onChange={e => setEditFirst(e.target.value)}
                            placeholder="First name"
                          />
                        </div>
                        <div className="prof-field">
                          <label>Last Name</label>
                          <input
                            value={editLast}
                            onChange={e => setEditLast(e.target.value)}
                            placeholder="Last name"
                          />
                        </div>
                      </div>
                      <div className="prof-field">
                        <label>Email Address</label>
                        <input
                          type="email"
                          value={editEmail}
                          onChange={e => setEditEmail(e.target.value)}
                          placeholder="email@example.com"
                        />
                      </div>
                      <div className="prof-field">
                        <label>Phone Number</label>
                        <input
                          type="tel"
                          value={editPhone}
                          onChange={e => setEditPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                        />
                      </div>
                      <div className="prof-form-actions">
                        <button className="prof-btn-secondary" onClick={() => setIsEditing(false)}>
                          Cancel
                        </button>
                        <button
                          className="prof-btn-primary"
                          onClick={handleSaveInfo}
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <>
                              <Loader2 size={15} className="prof-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save size={15} />
                              Save Changes
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── ADDRESSES TAB ── */}
              {activeTab === 'address' && (
                <motion.div
                  key="address"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.22 }}
                  className="prof-content-card"
                >
                  <div className="prof-card-header">
                    <h3>Delivery Addresses</h3>
                    <button className="prof-edit-link" onClick={openAddModal}>
                      <Plus size={14} /> Add New
                    </button>
                  </div>

                  {areas.length === 0 && (
                    <div className="prof-warning-banner">
                      <AlertCircle size={14} />
                      <span>No delivery areas are currently available. Please contact support.</span>
                    </div>
                  )}

                  {addresses.length === 0 ? (
                    <div className="prof-empty-state">
                      <div className="prof-empty-icon"><MapPin size={40} /></div>
                      <h4>No addresses saved</h4>
                      <p>Add a delivery address so we know where to send your order</p>
                      <button className="prof-btn-primary" onClick={openAddModal}>
                        <Plus size={15} /> Add Address
                      </button>
                    </div>
                  ) : (
                    <div className="prof-addr-grid">
                      {addresses.map((addr) => (
                        <motion.div
                          key={addr.id}
                          className="prof-addr-card"
                          initial={{ opacity: 0, scale: 0.97 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          layout
                        >
                          <div className="prof-addr-header">
                            <div className="prof-addr-icon"><HomeIcon size={16} /></div>
                            <div className="prof-addr-location">
                              <p className="prof-addr-street">{addr.street}</p>

                              <p className="prof-addr-sub">
                                {addr.building}
                                {addr.floor ? `, Floor ${addr.floor}` : ''}
                                {addr.apartment ? `, Apt ${addr.apartment}` : ''}
                              </p>

                              {(addr.block || addr.avenue) && (
                                <p className="prof-addr-sub">
                                  {addr.block && `Block ${addr.block}`}
                                  {addr.avenue && ` • Avenue ${addr.avenue}`}
                                </p>
                              )}

                              <p className="prof-addr-sub prof-addr-area-tag">
                                {addr.area?.name ?? 'Area not set'}
                              </p>

                              {addr.delivery_notes && (
                                <p className="prof-addr-sub prof-addr-notes">"{addr.delivery_notes}"</p>
                              )}
                            </div>
                          </div>

                          <div className="prof-addr-footer">
                            <button
                              className="prof-addr-btn edit"
                              onClick={() => openEditModal(addr)}
                            >
                              <Edit3 size={13} />
                              Edit
                            </button>
                            <button
                              className="prof-addr-btn delete"
                              onClick={() => handleDeleteAddr(addr)}
                              disabled={deletingId === addr.id}
                            >
                              {deletingId === addr.id ? (
                                <Loader2 size={13} className="prof-spin" />
                              ) : (
                                <Trash2 size={13} />
                              )}
                              Delete
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* ── Address Modal ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="prof-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="prof-modal"
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="prof-modal-header">
                <h3>{editingAddr ? 'Edit Address' : 'New Address'}</h3>
                <button className="prof-modal-close" onClick={() => setShowModal(false)}>
                  <X size={18} />
                </button>
              </div>

              <div className="prof-modal-body">
                <div className="prof-field">
                  <label>Area *</label>
                  <select
                    className={addrErrors.area ? 'error' : ''}
                    value={addrForm.area_id}
                    onChange={(e) => {
                      setAddrForm(f => ({ ...f, area_id: Number(e.target.value) }));
                      setAddrErrors(er => ({ ...er, area: '' }));
                    }}
                  >
                    <option value={0}>Select Area</option>
                    {areas.map(area => (
                      <option key={area.id} value={area.id}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                  {addrErrors.area && (
                    <span className="prof-err">
                      <AlertCircle size={12} /> {addrErrors.area}
                    </span>
                  )}
                </div>

                <div className="prof-field">
                  <label>Street Address *</label>
                  <input
                    className={addrErrors.street ? 'error' : ''}
                    placeholder="House No., Building Name"
                    value={addrForm.street}
                    onChange={e => {
                      setAddrForm(f => ({ ...f, street: e.target.value }));
                      setAddrErrors(er => ({ ...er, street: '' }));
                    }}
                  />
                  {addrErrors.street && (
                    <span className="prof-err">
                      <AlertCircle size={12} /> {addrErrors.street}
                    </span>
                  )}
                </div>

                <div className="prof-form-row-2">
                  <div className="prof-field">
                    <label>Block</label>
                    <input
                      value={addrForm.block}
                      onChange={e => setAddrForm(f => ({ ...f, block: e.target.value }))}
                    />
                  </div>
                  <div className="prof-field">
                    <label>Avenue</label>
                    <input
                      value={addrForm.avenue}
                      onChange={e => setAddrForm(f => ({ ...f, avenue: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="prof-form-row-2">
                  <div className="prof-field">
                    <label>Building</label>
                    <input
                      value={addrForm.building}
                      onChange={e => setAddrForm(f => ({ ...f, building: e.target.value }))}
                    />
                  </div>
                  <div className="prof-field">
                    <label>Floor</label>
                    <input
                      value={addrForm.floor}
                      onChange={e => setAddrForm(f => ({ ...f, floor: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="prof-field">
                  <label>Apartment</label>
                  <input
                    value={addrForm.apartment}
                    onChange={e => setAddrForm(f => ({ ...f, apartment: e.target.value }))}
                  />
                </div>

                <div className="prof-field">
                  <label>Delivery Notes</label>
                  <input
                    placeholder="e.g. Leave with security, call on arrival"
                    value={addrForm.delivery_notes}
                    onChange={e => setAddrForm(f => ({ ...f, delivery_notes: e.target.value }))}
                  />
                </div>

                <div className="prof-field">
                  <label>Country</label>
                  <input
                    placeholder="Country"
                    value={addrForm.country}
                    onChange={e => setAddrForm(f => ({ ...f, country: e.target.value }))}
                  />
                </div>
              </div>

              <div className="prof-modal-footer">
                <button
                  className="prof-btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="prof-btn-primary"
                  onClick={handleSaveAddr}
                  disabled={savingAddr}
                >
                  {savingAddr ? (
                    <>
                      <Loader2 size={15} className="prof-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={15} />
                      {editingAddr ? 'Update Address' : 'Save Address'}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;