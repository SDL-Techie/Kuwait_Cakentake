import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  ShoppingCart, User, Menu, X,
  LayoutDashboard, UserCircle, Package, Heart,
  Phone, Mail, Coins, ChevronLeft, ChevronRight, ChevronDown, ArrowUp, LogOut,
  Search, LayoutGrid, Download, Globe, Newspaper
} from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import toast from 'react-hot-toast';
import { getCustomerLoyalty } from "@/src/services/loyaltyService";
import { fetchGeoLocationFromIpApi ,  storefrontApi} from '../../services/directApiService';
import { useCurrency } from '../../context/CurrencyContext';
import './Navbar.css';

interface NavbarProps {
  cartCount: number;
  wishlistCount?: number;
}

interface Category {
  id: number;
  name: string;
  image: string;
  status: string;
  created_at: string | null;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  points?: number;
}

/* ────────────────────────────────────────────────
   Motion variants
   ──────────────────────────────────────────────── */
const dropdownVariants: Variants = {
  hidden: { opacity: 0, y: -8, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -6,
    scale: 0.97,
    transition: { duration: 0.12, ease: 'easeIn' },
  },
};

const drawerVariants: Variants = {
  hidden: { x: '100%' },
  visible: { x: 0, transition: { type: 'spring', stiffness: 340, damping: 36 } },
  exit: { x: '100%', transition: { duration: 0.25, ease: 'easeIn' } },
};

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const drawerStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.045, delayChildren: 0.08 } },
};

const drawerItem: Variants = {
  hidden: { opacity: 0, x: 18 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } },
};

const badgeVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 500, damping: 18 } },
  exit: { scale: 0, opacity: 0, transition: { duration: 0.12 } },
};

/** Same pattern used across Checkout / Coupon — read the numeric id
 *  directly, falling back to the stored user object. Using JSON.parse on
 *  a plain "userId" string is unnecessary and throws on non-numeric
 *  values, so this uses Number() instead. */
const getUserId = (): number => {
  const direct = localStorage.getItem('userId');
  if (direct) return Number(direct) || 0;
  try {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    return u?.id ?? 0;
  } catch {
    return 0;
  }
};

// Contact details reused by the top info bar (desktop) and the
// "Explore" section of the mobile drawer. Centralised here so both
// places always stay in sync.
const CONTACT_PHONE_DISPLAY = '00 965 60450097';
const CONTACT_PHONE_TEL = 'tel:00 965 60450097';
const CONTACT_EMAIL = 'sales@cakentake.com';
const CONTACT_EMAIL_MAILTO = 'mailto:sales@cakentake.com';

export default function Navbar({ cartCount, wishlistCount = 0 }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  // Toggle for the currency dropdown that now lives where "More" used to be.
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  // Mobile-only modal for currency selection (opened when globe icon tapped)
  const [isMobileCurrencyModalOpen, setIsMobileCurrencyModalOpen] = useState(false);
  const [ordersCount, setOrdersCount] = useState(2);
  const [categories, setCategories] = useState<Category[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { customer, isLoggedIn, logout } = useCustomerAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currencyDropdownRef = useRef<HTMLDivElement>(null);

  const { currency, setCurrency } = useCurrency();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);

    if (lang === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
    }
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    const savedCurrency = localStorage.getItem('currency');

    // User already chose language/currency
    if (savedLanguage && savedCurrency) {
      i18n.changeLanguage(savedLanguage);
      document.documentElement.lang = savedLanguage;
      document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';
      return;
    }

    // First visit
    fetchGeoLocationFromIpApi()
      .then((data) => {
        const country = data.country_code;

        let language = 'en';
        let currencyGuess = 'USD';

        switch (country) {
          case 'AE':
            language = 'ar';
            currencyGuess = 'AED';
            break;
          case 'SA':
            language = 'ar';
            currencyGuess = 'SAR';
            break;
          case 'IN':
            language = 'en';
            currencyGuess = 'INR';
            break;
          case 'KW':
           language = 'ar';
           currencyGuess = 'KWD';
           break;
          default:
            language = 'en';
            currencyGuess = 'USD';
        }

        localStorage.setItem('language', language);
        localStorage.setItem('currency', currencyGuess);

        i18n.changeLanguage(language);
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
      });
  }, []);

  // ── Check both context AND localStorage ──
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser) as UserData;
        setUserData(parsedUser);
      } catch (err) {
        console.error('❌ Error parsing user data from localStorage:', err);
        setUserData(null);
      }
    } else if (isLoggedIn && customer) {
      // Fallback to context if localStorage doesn't have data
    } else {
      setUserData(null);
    }
  }, [isLoggedIn, customer]);

  // ── Normalize and check roles (case-insensitive) ──
  const normalizeRole = (role: string | undefined): string => {
    return (role || '').toUpperCase().trim();
  };

  const userRole = normalizeRole(userData?.role);
  const isAdmin = userRole === 'ADMIN' || userRole === 'ADMIN_PANEL';
  const isRetailer = userRole === 'RETAILER' || userRole === 'RETAILER_PANEL';

  const hasValidToken = localStorage.getItem('token') !== null;
  const actuallyLoggedIn = hasValidToken && userData !== null;

  // ── Fetch categories via axios ──
  useEffect(() => {
    storefrontApi.categories()
      .then((res) => {
        setCategories(res.data.filter((cat:any) => cat.status === 'active'));
      })
      .catch((err) => console.error('❌ Category fetch error:', err));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(event.target as Node)) {
        setIsCurrencyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Logout ──
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const token = localStorage.getItem('token');

      if (token) {
        await storefrontApi.logout();
      }

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');

      setUserData(null);

      setIsUserDropdownOpen(false);
      setIsMenuOpen(false);

      logout();
      toast.success('Logged out successfully ✅');
      navigate('/');
    } catch (error) {
      console.error('❌ Logout error:', error);

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      setUserData(null);
      setIsUserDropdownOpen(false);
      setIsMenuOpen(false);
      logout();

      toast.error('Logout error, but session cleared ⚠️');
      navigate('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const [points, setPoints] = useState(0);

  /* FIX: this previously called `getLoyaltyPoints(userId)`, which was
     never imported into this file (only `getCustomerLoyalty` was) — so
     every mount threw a ReferenceError and silently failed inside the
     try/catch, leaving the points badge stuck at 0. Now it uses the
     already-imported getCustomerLoyalty() and reads `available_points`,
     which is the field that endpoint actually returns. */
  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const userId = getUserId();
        if (!userId) return;

        const data = await getCustomerLoyalty(userId);
        setPoints(data.available_points ?? 0);
      } catch (err) {
        console.error("Failed to fetch loyalty points:", err);
      }
    };

    if (actuallyLoggedIn) {
      fetchPoints();
    }
  }, [actuallyLoggedIn]);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollTo =
        direction === 'left'
          ? scrollRef.current.scrollLeft - 180
          : scrollRef.current.scrollLeft + 180;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const closeMenu = () => setIsMenuOpen(false);

  const triggerPwaInstall = () => {
    window.dispatchEvent(new Event('triggerPwaInstall'));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value;
    setCurrency(newCurrency);

      setTimeout(() => {
    window.location.reload();
  }, 100);
  };

  const leftNavLinks = [
    { to: '/', label: t('home') },
    { to: '/orders', label: t('orders') },
    { to: '/products', label: t('products') }
  ];

  const isCheckoutPage = location.pathname.startsWith('/checkout');

  const renderNavLink = (link: { to: string; label: string }) => {
    const isActive = location.pathname === link.to;
    return (
      <Link key={link.to} to={link.to} className={`nav-link ${isActive ? 'is-active' : ''}`}>
        {link.label}
        {isActive && (
          <motion.span
            className="nav-underline"
            layoutId="navUnderline"
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          />
        )}
      </Link>
    );
  };

  // Reusable currency <select> — the SAME control/logic used everywhere
  // currency can be changed. Only styling wrappers differ per placement.
  const applyCurrency = (newCurrency: string) => {
    setCurrency(newCurrency);
    // Close any open currency UIs so the modal/drawer disappears immediately
    setIsCurrencyDropdownOpen(false);
    setIsMobileCurrencyModalOpen(false);
    // keep the small reload used elsewhere so prices refresh — allow the
    // context to persist currency to localStorage first then reload.
    setTimeout(() => window.location.reload(), 120);
  };

  // Reusable currency control — renders a native <select> on desktop and a
  // simple button list on mobile to avoid native-select issues in some
  // mobile/embedded browsers where select option lists are blocked by CSS
  // transforms or overlays.
  const CurrencySelect = ({ className = '', mobile = false }: { className?: string; mobile?: boolean }) => {
    const options = ['USD', 'INR', 'AED', 'KWD'];
    if (mobile) {
      return (
        <div className={`drawer-currency-options ${className}`}>
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              className={`drawer-currency-option ${opt === currency ? 'active' : ''}`}
              onClick={() => applyCurrency(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      );
    }

    return (
      <select
        value={currency}
        onChange={handleCurrencyChange}
        className={`clean-dropdown ${className}`}
      >
        <option value="USD">USD</option>
        <option value="INR">INR</option>
        <option value="AED">AED</option>
        <option value="KWD">KWD</option>
      </select>
    );
  };

  // Currency dropdown button + menu — now shared between the desktop
  // "text + chevron" placement and the mobile icon-only placement next
  // to the Download App button. Same ref/state drive both.
  const CurrencyDropdown = ({ mobile = false }: { mobile?: boolean }) => {
    // Mobile behavior: open a full-screen/modal pop-in so taps reliably reach
    // the options on small devices and inside webviews.
    if (mobile) {
      return (
        <div className={`mainbar-currency-container mainbar-currency-container--mobile`}>
          <motion.button
            className="mainbar-currency-btn"
            onClick={() => setIsMobileCurrencyModalOpen(true)}
            whileTap={{ scale: 0.96 }}
            aria-label="Change currency"
            type="button"
          >
            <Globe size={16} />
          </motion.button>

          <AnimatePresence>
            {isMobileCurrencyModalOpen && (
              <>
                <motion.div
                  className="currency-mobile-modal-overlay"
                  variants={overlayVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onClick={() => setIsMobileCurrencyModalOpen(false)}
                />

                <motion.div
                  className="currency-mobile-modal"
                  initial={{ y: '20%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  exit={{ y: '20%', opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <div className="currency-mobile-modal-card">
                    <div className="currency-mobile-modal-header">
                      <span>Select Currency</span>
                      <button type="button" className="currency-mobile-modal-close" onClick={() => setIsMobileCurrencyModalOpen(false)}>Close</button>
                    </div>

                    <div className="currency-mobile-modal-body">
                      <CurrencySelect mobile />
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      );
    }

    // Desktop/default: original inline dropdown menu
    return (
      <div className={`mainbar-currency-container mainbar-desktop-only`} ref={currencyDropdownRef}>
        <motion.button
          className="mainbar-currency-btn"
          onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
          whileTap={{ scale: 0.96 }}
          aria-label="Change currency"
          type="button"
        >
          <Globe size={16} />
          <span className="mainbar-login-text">Currency</span>
          <ChevronDown size={13} className="mainbar-chevron" />
        </motion.button>

        <AnimatePresence>
          {isCurrencyDropdownOpen && (
            <motion.div
              className="mainbar-dropdown-menu mainbar-currency-menu"
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="mainbar-currency-section">
                <span className="mainbar-more-label">Select Currency</span>
                <div className="selector-field selector-field-more">
                  <CurrencySelect className="clean-dropdown-more" />
                  <ChevronDown size={11} className="selector-caret selector-caret-more" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <motion.nav
      className="navbar"
      // Avoid translateY transform on the root nav because some mobile browsers
      // (or embedded views) prevent native <select> dropdowns from opening when
      // they're inside a transformed ancestor. Use an opacity-only fade instead.
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* ── 0. Top info bar — About / Contact / Blog + phone / email (desktop only) ── */}
      <div className="navtop-bar">
        <div className="navtop-links">
          <Link to="/about" className="navtop-link">About</Link>
          <Link to="/contact" className="navtop-link">Contact</Link>
          <Link to="/userblog" className="navtop-link">Blog</Link>
          <Link to="/delete-account" className="navtop-link">Delete account</Link>
        </div>
        <div className="navtop-contact">
          <a href={CONTACT_PHONE_TEL} className="navtop-contact-item">
            <Phone size={13} /> {CONTACT_PHONE_DISPLAY}
          </a>
          <a href={CONTACT_EMAIL_MAILTO} className="navtop-contact-item">
            <Mail size={13} /> {CONTACT_EMAIL}
          </a>
        </div>
      </div>

      {/* ── 1. Main bar (logo pill + search + login/currency/cart) ── */}
      <div className="navbar-mainbar">
        <div className="navbar-mainbar-container">

          {/* Logo pill */}
          <div className="mainbar-logo-wrap">
            <Link to="/" className="mainbar-logo-pill">
              <img src="/assets/logo.png" alt="Cakentake logo" className="mainbar-logo-img" />
              {/* <span className="mainbar-logo-text">Cakentake</span> */}
            </Link>
          </div>

          {/* Nav links (kept, shown on md+ next to logo) */}
          <div className="navbar-center navbar-links-row show-md show-lg">
            <div className="navbar-left-links">
              {leftNavLinks.map(renderNavLink)}
            </div>
          </div>

          {/* Search bar (visual only — no search wiring exists in this component) */}
          <div className="mainbar-search">
            <input
              type="text"
              className="mainbar-search-input"
              placeholder="Search for Products, Brands and More"
            />
            <button type="button" className="mainbar-search-btn" aria-label="Search">
              <Search size={15} />
            </button>
          </div>

          {/* Right action cluster */}
          <div className="mainbar-actions">

            {/* Login / user dropdown — hidden on mobile, shown from tablet up */}
            <div className="mainbar-login-container mainbar-desktop-only" ref={dropdownRef}>
              <motion.button
                className="mainbar-login-btn"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                whileTap={{ scale: 0.96 }}
              >
                <User size={17} />
                <span className="mainbar-login-text">
                  {actuallyLoggedIn && userData ? userData.name : 'Login'}
                </span>
                <ChevronDown size={13} className="mainbar-chevron" />
              </motion.button>

              <AnimatePresence>
                {isUserDropdownOpen && (
                  <motion.div
                    className="mainbar-dropdown-menu"
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {!actuallyLoggedIn || !userData ? (
                      <>
                        <Link to="/login" onClick={closeMenu} className="dropdown-link">
                          <UserCircle size={14} /> Login
                        </Link>
                        <Link to="/register" onClick={closeMenu} className="dropdown-link">
                          <UserCircle size={14} /> Register
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link to="/profile" onClick={closeMenu} className="dropdown-link">
                          <UserCircle size={14} /> My Profile
                        </Link>
                        <Link to="/orders" onClick={closeMenu} className="dropdown-link">
                          <Package size={14} /> Active Orders 
                        </Link>

                        {isAdmin && (
                          <Link to="/admin/dashboard" onClick={closeMenu} className="dropdown-link admin">
                            <LayoutDashboard size={14} /> Admin Panel
                          </Link>
                        )}

                        {actuallyLoggedIn && userData && !isRetailer && (
                          <Link to="/coupon-user" onClick={closeMenu} className="dropdown-link">
                            <Coins size={14} /> {points} Points
                          </Link>
                        )}

                        <button
                          onClick={handleLogout}
                          className="dropdown-link logout"
                          disabled={isLoggingOut}
                        >
                          <LogOut size={14} /> {isLoggingOut ? 'Logging out...' : 'Logout'}
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} className="mainbar-desktop-only">
              <Link to="/wishlist" className="mainbar-icon-btn" title="Wishlist">
                <Heart size={18} />
                <AnimatePresence>
                  {wishlistCount > 0 && (
                    <motion.span
                      key={wishlistCount}
                      className="badge"
                      variants={badgeVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      {wishlistCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mainbar-desktop-only">
              <Link to="/cart" className="mainbar-cart-btn" title="Cart">
                <ShoppingCart size={18} />
                <span className="mainbar-cart-text">Cart</span>
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      className="badge mainbar-cart-badge"
                      variants={badgeVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>

            {/* Currency dropdown (desktop text+chevron version) — takes the
                place of the old "More" menu. Hidden on mobile; the mobile
                icon-only equivalent sits right next to the Download button
                below, sharing the same ref/state. */}
            {!isCheckoutPage && <CurrencyDropdown />}

            {/* Currency icon button — mobile only, placed right next to
                Download App so both sit together at the top of the page. */}
            {!isCheckoutPage && (
              <div className="mainbar-currency-mobile-wrap" ref={currencyDropdownRef}>
                <CurrencyDropdown mobile />
              </div>
            )}

            {/* Download App — visible on both desktop and mobile */}
            <motion.button
              className="mainbar-pwa-btn"
              onClick={triggerPwaInstall}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              type="button"
            >
              <Download size={16} />
              <span className="mainbar-pwa-text">Download App</span>
            </motion.button>

            {/* Hamburger — mobile only */}
            <motion.button
              className="mobile-menu-btn"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              whileTap={{ scale: 0.9 }}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── 2. Category bar (icon-tab style) — desktop/tablet only, untouched ── */}
      {!isCheckoutPage && (
        <div className="navbar-categories">
          <motion.button
            className="category-scroll-btn"
            onClick={() => scrollCategories('left')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft size={16} />
          </motion.button>

          <div className="categories-scroll-container" ref={scrollRef}>
            <Link to="/products" className="category-tab" onClick={closeMenu}>
              <span className="category-tab-icon-wrap">
                <LayoutGrid size={20} />
              </span>
              <span className="category-tab-label">All Treats</span>
            </Link>

            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/categoryproduct/${cat.id}`}
                className="category-tab"
                onClick={closeMenu}
              >
                <span className="category-tab-icon-wrap">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="category-tab-icon-img" />
                  ) : (
                    <Package size={18} />
                  )}
                </span>
                <span className="category-tab-label">{cat.name}</span>
              </Link>
            ))}
          </div>

          <motion.button
            className="category-scroll-btn"
            onClick={() => scrollCategories('right')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight size={16} />
          </motion.button>
        </div>
      )}

      {/* ── 3. Mobile Drawer ── */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              className="mobile-overlay"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={closeMenu}
            />
            <motion.div
              className="mobile-drawer"
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="drawer-header">
                <Link to="/" onClick={closeMenu} className="drawer-logo">
                  <span className="drawer-logo-text">Cakentake</span>
                </Link>
                <motion.button
                  className="drawer-close-btn"
                  onClick={closeMenu}
                  whileTap={{ scale: 0.88 }}
                >
                  <X size={20} />
                </motion.button>
              </div>

              {actuallyLoggedIn && userData && !isRetailer && (
                <motion.div
                  className="drawer-rewards"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Coins size={18} />
                    <span>Loyalty Wallet: <strong>{points} Pts</strong></span>
                  </div>
                  <Link to="/coupon-user" onClick={closeMenu} className="drawer-rewards-link">Redeem</Link>
                </motion.div>
              )}

              <motion.div
                className="drawer-content"
                variants={drawerStagger}
                initial="hidden"
                animate="visible"
              >
                <motion.div className="drawer-section" variants={drawerItem}>
                  <h3 className="drawer-section-title">Navigation</h3>
                  <Link to="/" onClick={closeMenu} className="drawer-link">Home</Link>
                  <Link to="/products" onClick={closeMenu} className="drawer-link">Products</Link>
                  <Link to="/coupon-user" onClick={closeMenu} className="drawer-link">Rewards</Link>
                  {isRetailer && (
                    <Link to="/retailerorder" onClick={closeMenu} className="drawer-link retailer">Retailer Bulk Panel</Link>
                  )}
                  {isAdmin && (
                    <Link to="/admin/dashboard" onClick={closeMenu} className="drawer-link admin">Admin Dashboard</Link>
                  )}
                </motion.div>

                {/* ── Explore: About / Contact / Blog + phone / email (mobile) ── */}
                <motion.div className="drawer-section drawer-explore" variants={drawerItem}>
                  <h3 className="drawer-section-title">Explore</h3>
                  <Link to="/about" onClick={closeMenu} className="drawer-link">About</Link>
                  <Link to="/contact" onClick={closeMenu} className="drawer-link">Contact</Link>
                  <Link to="/userblog" onClick={closeMenu} className="drawer-link">
                    <Newspaper size={16} /> Blog
                  </Link>
                  <a href={CONTACT_PHONE_TEL} className="drawer-link drawer-contact-link">
                    <Phone size={16} /> {CONTACT_PHONE_DISPLAY}
                  </a>
                  <a href={CONTACT_EMAIL_MAILTO} className="drawer-link drawer-contact-link">
                    <Mail size={16} /> {CONTACT_EMAIL}
                  </a>
                </motion.div>

                <motion.div className="drawer-section" variants={drawerItem}>
                  <h3 className="drawer-section-title">My Account</h3>
                  {!actuallyLoggedIn || !userData ? (
                    <Link to="/login" onClick={closeMenu} className="drawer-link"><User size={16} /> Login / Register</Link>
                  ) : (
                    <>
                      <div className="drawer-account">
                        <User size={16} />
                        <span>{userData.name} ({userData.role})</span>
                      </div>
                      <Link to="/profile" onClick={closeMenu} className="drawer-link">View Profile</Link>
                    </>
                  )}

                  <Link to="/cart" onClick={closeMenu} className="drawer-item-with-badge">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ShoppingCart size={16} /> My Basket</span>
                    {cartCount > 0 && <span className="drawer-item-badge">{cartCount}</span>}
                  </Link>
                  <Link to="/wishlist" onClick={closeMenu} className="drawer-item-with-badge">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Heart size={16} /> My Wishlist</span>
                    {wishlistCount > 0 && <span className="drawer-item-badge">{wishlistCount}</span>}
                  </Link>
                  {actuallyLoggedIn && userData && (
                    <Link to="/orders" onClick={closeMenu} className="drawer-item-with-badge">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Package size={16} /> My Orders</span>
                    </Link>
                  )}
                  {actuallyLoggedIn && userData && (
                    <button
                      onClick={handleLogout}
                      className="drawer-logout"
                      disabled={isLoggingOut}
                    >
                      <LogOut size={16} /> {isLoggingOut ? 'Logging out...' : 'Sign Out'}
                    </button>
                  )}
                </motion.div>

                {/* <motion.div className="drawer-section" variants={drawerItem}>
                  <h3 className="drawer-section-title">Settings</h3>
                  <div className="drawer-currency-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <span className="drawer-currency-label">Currency</span>
                    <div className="drawer-currency-field" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CurrencySelect className="drawer-currency-select" mobile={true} />
                      <ChevronDown size={12} className="drawer-currency-caret" />
                    </div>
                  </div>
                </motion.div> */}

                <motion.div className="drawer-section" variants={drawerItem}>
                  <h3 className="drawer-section-title">Categories</h3>
                  <div className="drawer-categories">
                    <Link to="/products" onClick={closeMenu} className="drawer-category-link">
                      All Treats
                    </Link>

                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/categoryproduct/${cat.id}`}
                        onClick={closeMenu}
                        className="drawer-category-link"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}