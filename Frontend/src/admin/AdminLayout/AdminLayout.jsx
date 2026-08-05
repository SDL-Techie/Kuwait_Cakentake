import React, { useState, useEffect, useMemo } from 'react';
import {
  FaTachometerAlt, FaPlusCircle, FaList, FaThList, FaListAlt,
  FaShoppingCart, FaUsers, FaUsersCog, FaSignOutAlt, FaBars, FaSearch,
  FaUserTie, FaMapMarkerAlt, FaGem, FaDatabase, FaUtensils, FaReceipt,
  FaBoxes, FaChartLine, FaTruck, FaShippingFast, FaCar, FaMoneyCheckAlt,
  FaWarehouse, FaTruckLoading, FaChevronDown, FaBell, FaTimes,FaStore,FaWallet
} from 'react-icons/fa';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import './AdminLayout.css';

// ─── ROLE THEMING ──────────────────────────────────────────────────────
// Every role gets its own accent color, so the whole interface visibly
// "belongs" to whoever is signed in — a quiet but constant reminder of
// which slice of the operation you're standing in.
const ROLE_THEME = {
  ADMIN:          { label: 'Owner / Admin',     accent: '#4B6B3F' },
  SHOP_MANAGER: {label: 'Shop Manager',accent: '#8B5E3C'},
  KITCHEN_STAFF:  { label: 'Kitchen Staff',     accent: '#6A7C50' },
  SALES_AGENT:    { label: 'Sales Agent',       accent: '#7C9A3F' },
  DELIVERY_AGENT: { label: 'Delivery Agent',    accent: '#3F7D5C' },
  DRIVER:         { label: 'Driver',            accent: '#557A4E' },
};
const DEFAULT_THEME = { label: 'Guest', accent: '#93A186' };

// ─── NAVIGATION MAP ────────────────────────────────────────────────────
// Grouped by section. A "group" item expands into sub-links (this is how
// Sales Agent / Delivery Agent / Driver collapse their own mini-dashboards
// under one clickable heading instead of cluttering the main list).
const NAV_SECTIONS = [
  {
    section: 'Overview',
    items: [
      { type: 'link', name: 'Dashboard', icon: <FaTachometerAlt />, path: '/admin/dashboard', roles: ['ADMIN'] },
    ],
  },
  {
    section: 'Settlement',
    items: [
      { name: 'Driver Settlement', icon: <FaMoneyCheckAlt />, path: '/admin/driversettlement', roles: ['ADMIN','SHOP_MANAGER'] },
      { name: 'Agent Settlement', icon: <FaMoneyCheckAlt />, path: '/admin/agentpayment', roles: ['ADMIN','SHOP_MANAGER'] },

    ],
  },
    {
    section: 'Catalog & People',
    items: [
      { type: 'link', name: 'Area Management', icon: <FaMapMarkerAlt />, path: '/admin/area', roles: ['ADMIN','SHOP_MANAGER'] },
      { type: 'link', name: 'Menu Management', icon: <FaThList />, path: '/admin/menu', roles: ['ADMIN', 'SALES_AGENT','SHOP_MANAGER'] },
      { type: 'link', name: 'Agent Menu Management', icon: <FaListAlt />, path: '/admin/agentmenu', roles: ['ADMIN','SHOP_MANAGER'] },
      { type: 'link', name: 'Staff Management', icon: <FaUserTie />, path: '/admin/staff', roles: ['ADMIN'] },
      { type: 'link', name: 'Agent Management', icon: <FaUsersCog />, path: '/admin/agentmanagement', roles: ['ADMIN','SHOP_MANAGER'] },
      { type: 'link', name: 'Customer Management', icon: <FaUsers />, path: '/admin/customer', roles: ['ADMIN', 'SALES_AGENT','SHOP_MANAGER'] },
      { type: 'link', name: 'Blog Management', icon: <FaUsers />, path: '/admin/blog', roles: ['ADMIN', 'SALES_AGENT'] },
    ],
  },
  {
    section: 'Operations',
    items: [
      { type: 'link', name: 'Order Management', icon: <FaShoppingCart />, path: '/admin/orderpipeline', roles: ['ADMIN','SHOP_MANAGER'] },
      {
        type: 'group', name: 'Kitchen', icon: <FaUtensils />, roles: ['ADMIN', 'KITCHEN_STAFF'],
        children: [
          { name: 'Kitchen Dashboard', icon: <FaTachometerAlt />, path: '/admin/kitchen', roles: ['ADMIN', 'KITCHEN_STAFF'] },
          { name: 'Kitchen Order', icon: <FaReceipt />, path: '/admin/kitchen-order', roles: ['ADMIN', 'KITCHEN_STAFF'] },
          { name: 'Kitchen Inventory', icon: <FaBoxes />, path: '/admin/kitcheninventory', roles: ['ADMIN', 'KITCHEN_STAFF'] },
        ],
      },
      {
        type: 'group', name: 'Sales Staff', icon: <FaChartLine />, roles: ['ADMIN', 'SALES_AGENT'],
        children: [
          { name: 'Sales Dashboard', icon: <FaTachometerAlt />, path: '/admin/salesdash', roles: ['ADMIN', 'SALES_AGENT'] },
          { name: 'Sales Staff Create Order', icon: <FaPlusCircle />, path: '/admin/salescreateorder', roles: ['ADMIN', 'SALES_AGENT'] },
          { name: 'Sales Staff Order', icon: <FaList />, path: '/admin/salesorder', roles: ['ADMIN', 'SALES_AGENT'] },
          { type: 'link', name: 'Blog Management', icon: <FaUsers />, path: '/admin/blog', roles: ['ADMIN', 'SALES_AGENT'] },
        ],
      },
//       {
//   type: 'group',
//   name: 'Shop Manager',
//   icon: <FaStore />,
//   roles: ['ADMIN', 'SHOP_MANAGER'],
//   children: [
//     // {
//     //   name: 'Shop Dashboard',
//     //   icon: <FaTachometerAlt />,
//     //   path: '/admin/shopdashboard',
//     //   roles: ['ADMIN', 'SHOP_MANAGER']
//     // },
//     // {
//     //   name: 'Orders',
//     //   icon: <FaShoppingCart />,
//     //   path: '/admin/shoporders',
//     //   roles: ['ADMIN', 'SHOP_MANAGER']
//     // },
//     // {
//     //   name: 'Payments',
//     //   icon: <FaMoneyCheckAlt />,
//     //   path: '/admin/shoppayments',
//     //   roles: ['ADMIN', 'SHOP_MANAGER']
//     // },
//     // {
//     //   name: 'Expenses',
//     //   icon: <FaReceipt />,
//     //   path: '/admin/shopexpenses',
//     //   roles: ['ADMIN', 'SHOP_MANAGER']
//     // },
//     // {
//     //   name: 'Purchase',
//     //   icon: <FaTruckLoading />,
//     //   path: '/admin/shoppurchase',
//     //   roles: ['ADMIN', 'SHOP_MANAGER']
//     // },
//     // {
//     //   name: 'Cash Drawer',
//     //   icon: <FaWallet />,
//     //   path: '/admin/shopcashdrawer',
//     //   roles: ['ADMIN', 'SHOP_MANAGER']
//     // }
//   ]
// },
          {
        type: 'group', name: 'Agent', icon: <FaChartLine />, roles: ['ADMIN', 'AGENT'],
        children: [
          { name: 'Agent Dashboard', icon: <FaTachometerAlt />, path: '/admin/agentdashboard', roles: ['ADMIN', 'AGENT'] },
          { name: 'Agent Create Order', icon: <FaPlusCircle />, path: '/admin/agentorder', roles: ['ADMIN', 'AGENT'] },
          { name: 'Agent Order', icon: <FaList />, path: '/admin/agentfetchorder', roles: ['ADMIN', 'AGENT'] },
        ],
      },
      {
        type: 'group', name: 'Delivery Agent', icon: <FaTruck />, roles: ['ADMIN', 'DELIVERY_AGENT'],
        children: [
          { name: 'Delivery Dashboard', icon: <FaTachometerAlt />, path: '/admin/deliverydashboard', roles: ['ADMIN', 'DELIVERY_AGENT'] },
          { name: 'Delivery Agent Order', icon: <FaShippingFast />, path: '/admin/deliveryorder', roles: ['ADMIN', 'DELIVERY_AGENT'] },
        ],
      },
      {
        type: 'group', name: 'Driver', icon: <FaCar />, roles: ['ADMIN', 'DRIVER'],
        children: [
          { name: 'Driver Dashboard', icon: <FaTachometerAlt />, path: '/admin/driverdashboard', roles: ['ADMIN', 'DRIVER'] },
          { name: 'Driver Order', icon: <FaReceipt />, path: '/admin/driverorder', roles: ['ADMIN', 'DRIVER'] },
          // { name: 'Driver Settlement', icon: <FaMoneyCheckAlt />, path: '/admin/driversettlement', roles: ['ADMIN'] },
        ],
      },
    ],
  },
  {
    section: 'Inventory & Growth',
    items: [
      {
        type: 'group', name: 'Stock & Inventory', icon: <FaWarehouse />, roles: ['ADMIN'],
        children: [
          { name: 'Stock & Inventory', icon: <FaBoxes />, path: '/admin/stock', roles: ['ADMIN','SHOP_MANAGER'] },
          { name: 'Supplier Management', icon: <FaTruckLoading />, path: '/admin/supplier', roles: ['ADMIN','SHOP_MANAGER'] },
        ],
      },
      { type: 'link', name: 'Loyalty', icon: <FaGem />, path: '/admin/loyality', roles: ['ADMIN','SHOP_MANAGER'] },
      { type: 'link', name: 'Storage', icon: <FaDatabase />, path: '/admin/backup', roles: ['ADMIN'] },
    ],
  },
];

// ─── CHILD COMPONENT: COLLAPSIBLE GROUP ────────────────────────────────
const NavGroup = ({ group, isOpen, onToggle, isActive, onNavigate }) => (
  <li className={`rasi-nav-group ${isActive ? 'active' : ''}`}>
    <button
      type="button"
      className="rasi-nav-group-trigger"
      onClick={onToggle}
      aria-expanded={isOpen}
    >
      <span className="menu-icon">{group.icon}</span>
      <span className="menu-text">{group.name}</span>
      <FaChevronDown className={`rasi-chevron ${isOpen ? 'open' : ''}`} />
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.ul
          className="rasi-nav-subgroup"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          {group.children.map((child) => (
            <li key={child.path}>
              <Link to={child.path} onClick={onNavigate} className="rasi-sub-link">
                <span className="menu-icon sub">{child.icon}</span>
                <span className="menu-text">{child.name}</span>
              </Link>
            </li>
          ))}
        </motion.ul>
      )}
    </AnimatePresence>
  </li>
);

// ─── CHILD COMPONENT: SIDEBAR ───────────────────────────────────────
const AdminSidebar = ({ isOpen, onClose, onLogout, userRole, theme }) => {
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState({});

  // Build the filtered nav model for this role, dropping empty groups/sections.
  const sections = useMemo(() => {
    return NAV_SECTIONS.map((sec) => {
      const items = sec.items
        .filter((item) => item.roles.includes(userRole))
        .map((item) => {
          if (item.type !== 'group') return item;
          const children = item.children.filter((c) => c.roles.includes(userRole));
          return { ...item, children };
        })
        .filter((item) => item.type !== 'group' || item.children.length > 0);
      return { ...sec, items };
    }).filter((sec) => sec.items.length > 0);
  }, [userRole]);

  // Auto-expand whichever group contains the current route.
  useEffect(() => {
    sections.forEach((sec) => {
      sec.items.forEach((item) => {
        if (item.type === 'group' && item.children.some((c) => c.path === location.pathname)) {
          setOpenGroups((prev) => ({ ...prev, [item.name]: true }));
        }
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, sections]);

  const toggleGroup = (name) =>
    setOpenGroups((prev) => ({ ...prev, [name]: !prev[name] }));

  const handleMobileNavigate = () => {
    if (window.innerWidth <= 1024) onClose();
  };

  const sidebarVariants = {
    open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    closed: { x: '-100%', transition: { type: 'spring', stiffness: 300, damping: 30 } },
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && window.innerWidth <= 1024 && (
          <motion.div
            className="rasi-sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.div
        className={`rasi-admin-sidebar ${isOpen ? 'open' : 'closed'}`}
        variants={sidebarVariants}
        animate={isOpen ? 'open' : 'closed'}
      >
        <div className="rasi-admin-sidebar-header">
          <div className="admin-logo-box">
            <span className="logo-dot" />
            <h3>CakeNTake</h3>
          </div>
          <button className="rasi-sidebar-close-btn mobile-only" onClick={onClose} aria-label="Close menu">
            <FaTimes />
          </button>
        </div>

        <nav className="rasi-admin-menu-container">
          {sections.map((sec) => (
            <div className="rasi-nav-section" key={sec.section}>
              <span className="rasi-nav-eyebrow">{sec.section}</span>
              <ul className="rasi-admin-menu">
                {sec.items.map((item) =>
                  item.type === 'group' ? (
                    <NavGroup
                      key={item.name}
                      group={item}
                      isOpen={!!openGroups[item.name]}
                      onToggle={() => toggleGroup(item.name)}
                      isActive={item.children.some((c) => c.path === location.pathname)}
                      onNavigate={handleMobileNavigate}
                    />
                  ) : (
                    <li key={item.path} className={location.pathname === item.path ? 'active' : ''}>
                      <Link to={item.path} onClick={handleMobileNavigate}>
                        <span className="menu-icon">{item.icon}</span>
                        <span className="menu-text">{item.name}</span>
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </nav>

        <div className="rasi-sidebar-footer">
          <div className="rasi-role-chip">
            <span className="rasi-role-dot" />
            {theme.label}
          </div>
          <button onClick={onLogout} className="rasi-logout-btn">
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </motion.div>
    </>
  );
};

// ─── MAIN PARENT COMPONENT: ADMIN LAYOUT ──────────────────────────────
const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('role') || 'USER';
    setUserRole(role);

    const handleResize = () => {
      if (window.innerWidth > 1024) setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    toast.success('Logged out successfully');
    setIsSidebarOpen(false);
    navigate('/login', { replace: true });
  };

  const theme = ROLE_THEME[userRole] || DEFAULT_THEME;

  // Current page title, derived from the active route — powers the breadcrumb.
  const pageTitle = useMemo(() => {
    const flatLinks = NAV_SECTIONS.flatMap((s) =>
      s.items.flatMap((i) => (i.type === 'group' ? i.children : [i]))
    );
    const match = flatLinks.find((l) => l.path === window.location.pathname);
    return match ? match.name : 'Dashboard';
  }, [userRole]);

  return (
    <div className="rasi-admin-layout" style={{ '--role-accent': theme.accent }}>
      <Toaster position="top-right" />

      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
        userRole={userRole}
        theme={theme}
      />

      <main className={`rasi-admin-main ${!isSidebarOpen ? 'expanded' : ''}`}>
        <header className="rasi-admin-header">
          <div className="header-left-group">
            <button className="rasi-sidebar-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)} aria-label="Toggle menu">
              <FaBars />
            </button>
            <div className="header-title-block">
              <span className="header-eyebrow">CakeNTake / {theme.label}</span>
              <h1 className="header-page-title">{pageTitle}</h1>
            </div>
          </div>

          <div className="header-right-group">
            <div className="header-search-box desktop-only">
              <FaSearch />
              <input type="text" placeholder="Quick search..." />
            </div>
            <button className="header-icon-btn" aria-label="Notifications">
              <FaBell />
              <span className="header-icon-dot" />
            </button>
            <div className="admin-profile-pill">
              <img src="https://cakentake.com/wp-content/uploads/2024/05/cakentake-logo.png" alt="Admin" />
              <div className="admin-info desktop-only">
                <span className="admin-name">CakeNTake</span>
                <span className="admin-role">{theme.label}</span>
              </div>
            </div>
          </div>
        </header>

        <section className="rasi-admin-content-wrapper">
          <div className="rasi-admin-content-inner">
            <Outlet />
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminLayout;