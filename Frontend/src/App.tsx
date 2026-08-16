// import React, { useState, useEffect, lazy, Suspense } from 'react';
// import { BrowserRouter as Router, Routes, Route, useLocation, NavLink } from 'react-router-dom';
// import { ArrowUp, Cookie } from 'lucide-react';
// import { CartProvider, useCart } from './context/CartContext';
// import { CustomerAuthProvider } from './context/CustomerAuthContext';
// import Navbar from './components/Navbar/Navbar';
// import Toast from './components/Toast/Toast';
// import Footer from './components/Footer/Footer';
// import PWAInstall from './components/PWAInstall/PWAInstall';
// import AdminLayout from './admin/AdminLayout/AdminLayout';
// import './App.css';
// import CategoryProduct from './pages/Categoryproducts/CategoryProduct';
// import Pincode from './admin/Pincode/Pincode';
// import Point from './admin/PointManagement/Point';
// // import Retailerlogin from './pages/Retailerlogin/Retailerlogin';
// import Retailerorder from './pages/Retailerorder/Retailerorder';
// import Userpoint from './pages/Userpoints/Userpoint';
// import AdminProtectedRoute from "./components/AdminProtectedRoute";
// import Coupon from './pages/Coupon/Coupon';
// import NotFound from './components/NotFound';
// import BackupRestore from './admin/BackupRestore/BackupRestore';
// import PaymentSuccess from './pages/Checkout/PaymentSuccess';
// import StaffManagement from './admin/Staffmanagement/StaffManagement';
// import {MenuManagement} from './admin/MenuManagement/MenuManagement';
// import {OrderManagement } from './admin/OrderManagement/OrderManagement';
// import StockManagement from './admin/StockManagement/StockManagement';
// import CustomerManagement from './admin/customermanagement/CustomerManagement';
// import KitchenDashboard from './kitchen/kitchendashboard/KitchenDashboard';
// import SupplierManagement from './admin/SupplierManagement/SupplierManagement';
// import AreaManagement from './admin/AreaManagement/AreaManagement';
// import TrackOrder from './pages/trackorder/TrackOrder';
// import KitchenOrder from './kitchen/kitchenorder/KitchenOrder';
// import DeliveryDashboard from './deliveryagent/deliveryagentdashboard/DeliveryDashboard';
// import DeliveryOrder from './deliveryagent/deliveryorder/DeliveryOrder';
// import DriverOrder from './driver/DriverOrder/DriverOrder';
// import Finance from './admin/Finane/Finance';
// import KitchenInventory from './kitchen/kitcheninventory/KitchenInventory';
// import Loyalty from './admin/Loyality/Loyality';
// import DriverSettlement from './driver/Driversettlement/DriverSettlement';
// import PromotionalCode from './pages/Promocode/Promotionalcode';
// import DriverDashboard from './driver/DriverDashboard/DriverDashboard';
// import SalesAgentDashboard from './salesagent/salesagentdashboard/Salesagentdash';
// import SalesAgentOrders from './salesagent/salesagentorder/Salesagentorder';
// import Promocode from './pages/Promocode/Promocode';
// import SalesAgentCreateOrder from './salesagent/salesagentorder/Salesagentcreateorder';
// import Cookies from './components/CookieConsent/Cookies';
// import AgentManagement from './agent/AgentManagement';
// import AgentMenuManagement from './agent/Agentmenumanagement';
// import AgentProduct from './agent/AgentProduct';
// import AgentOrder from './agent/AgentOrder';
// import Agentfetchorder from './agent/Agentfetchorder';
// import AgentDashboard from './agent/Agentdashboard';
// import AgentPayment from './agent/Agentpayment';
// import BlogManagement from './admin/Blog/BlogManagement';
// import UserBlog from './pages/Blog/Userblog';

// // Lazy load pages
// const Home = lazy(() => import('./pages/Home/Home'));
// const Products = lazy(() => import('./pages/Products/Products'));
// const ProductDetails = lazy(() => import('./pages/ProductDetails/ProductDetails'));
// const Cart = lazy(() => import('./pages/Cart/Cart'));
// const Login = lazy(() => import('./pages/Login/Login'));
// const Register = lazy(() => import('./pages/Register/Register'));
// const About = lazy(() => import('./pages/About/About'));
// const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy/PrivacyPolicy'));
// const Terms = lazy(() => import('./pages/Terms/Terms'));
// const Profile = lazy(() => import('./pages/Profile/Profile'));
// const Contact = lazy(() => import('./pages/Contact/Contact'));
// const Checkout = lazy(() => import('./pages/Checkout/Checkout'));
// const Orders = lazy(() => import('./pages/Orders/Orders'));
// const Wishlist = lazy(() => import('./pages/Wishlist/Wishlist'));

// // Admin Pages
// const AdminDashboard = lazy(() => import('./admin/Dashboard/Dashboard'));
// const Loading = () => (
//   <div className="rasi-loading-screen">
//     <div className="rasi-spinner"></div>
//     <p>Baking something delicious...</p>
//   </div>
// );

// const AppContent: React.FC = () => {
//   const { cartCount, toast, hideToast } = useCart();
//   const location = useLocation();
//   const isAdmin = location.pathname.startsWith('/admin');
//   const hideNavAndFooter = ['/login', '/register'].includes(location.pathname);
//   const [showBackToTop, setShowBackToTop] = useState(false);

//   useEffect(() => {
//     const handleScroll = () => {
//       if (window.scrollY > 300) {
//         setShowBackToTop(true);
//       } else {
//         setShowBackToTop(false);
//       }
//     };

//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   useEffect(() => {
//     window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
//     document.documentElement.scrollTop = 0;
//     document.body.scrollTop = 0;
//   }, [location.pathname]);

//   const scrollToTop = () => {
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   return (
//     <div className="rasi-app">
//       {!isAdmin && !hideNavAndFooter && <Navbar cartCount={cartCount} />}
//       <PWAInstall />
//       <Toast show={toast.show} message={toast.message} onClose={hideToast} />

//       <main className={isAdmin ? "" : "rasi-main-content"}>
//         <Suspense fallback={<Loading />}>
//           <Routes>
//             {/* Public Routes */}
//             <Route path="/" element={<Home />} />
//             {/* <Route path="/" element={<RotatingSlider />} /> */}
//             {/* Public Route Fix: Adjusted path from "/products" to follow standard naming structure if needed */}
//             <Route path="/products" element={<Products />} />
//             <Route path="/product/:id" element={<ProductDetails />} />
//             <Route path="/cart" element={<Cart />} />
//             <Route path="/orders" element={<Orders />} />
//             <Route path="/track-order/:id" element={<TrackOrder/>}/>
//             <Route path="/wishlist" element={<Wishlist />} />
//             <Route path="/login" element={<Login />} />
//             <Route path="/register" element={<Register />} />
//             <Route path="/about" element={<About />} />
//             <Route path="/privacy" element={<PrivacyPolicy />} />
//             <Route path="/terms" element={<Terms />} />
//             <Route path="/profile" element={<Profile />} />
//             <Route path="/contact" element={<Contact />} />
//             <Route path="/checkout" element={<Checkout />} />
//             <Route path="/agentproduct" element={<AgentProduct/>}/>

//             <Route path="/retailerorder" element={<Retailerorder />} />
//             <Route path="/coupon-user-points" element={<Userpoint/>} />
//             {/* <Route path="/categoryproduct/:categoryname" element={<CategoryProduct />} />  */}
//             <Route path="/categoryproduct/:id" element={<CategoryProduct />} />
//             <Route path="/payment-success" element={<PaymentSuccess/>}/>
//             <Route path="/payment-cancel" element={<h2>Payment Cancelled</h2>}/>
//             <Route path="/coupon-user" element={<Coupon/>}/>
//             <Route path="/promo" element={<Promocode  />} />
//             <Route path="/userblog" element={<UserBlog/>}/>

//             <Route path="/cookies" element={<Cookies/>}/>
//             {/* Admin Routes wrapped in AdminProtectedRoute Layout wrapper */}
//               {/* <Route element={<AdminProtectedRoute />}> */}
//               <Route path="admin" element={<AdminLayout />}>
//                 <Route path="dashboard" element={<AdminDashboard />} />
//                 <Route path="pincode" element={<Pincode />} />
//                 <Route path="point" element={<Point />} />
//                 <Route path='staff' element={<StaffManagement/>}/>
//                 <Route path="customer" element={<CustomerManagement/>}/>
//                 <Route path="orderpipeline" element={<OrderManagement/>}/>
//                 <Route path="menu" element={<MenuManagement/>}/>
//                 <Route path="stock" element={<StockManagement/>}/>
//                 <Route path="kitchen" element={<KitchenDashboard/>}/>
//                 <Route path="supplier" element={<SupplierManagement/>}/>
//                 <Route path="area" element={<AreaManagement/>}/>
//                 <Route path="backup" element={<BackupRestore/>}/>
//                 <Route path="kitchen-order" element={<KitchenOrder/>}/>
//                 <Route path="deliverydashboard" element={<DeliveryDashboard/>}/>
//                 <Route path="deliveryorder" element={<DeliveryOrder/>}/>
//                 <Route path="driverdashboard" element={<DriverDashboard/>}/>
//                 <Route path="driverorder" element={<DriverOrder/>}/>
//                 <Route path="driversettlement" element={<DriverSettlement/>}/>
//                 <Route path="finance" element={<Finance/>}/>
//                 <Route path="kitcheninventory" element={<KitchenInventory/>}/>
//                 <Route path="loyality" element={<Loyalty/>}/>
//                 <Route path="salesdash" element={<SalesAgentDashboard/>}/>
//                 <Route path="salesorder" element={<SalesAgentOrders/>}/>
//                 <Route path="salescreateorder" element={<SalesAgentCreateOrder/>}/>
//                 <Route path="agentmanagement" element={<AgentManagement/>}/>
//                 <Route path="agentmenu" element={<AgentMenuManagement/>}/>
//                  <Route path="agentorder" element={<AgentOrder/>}/>
//                  <Route path="agentfetchorder" element={<Agentfetchorder/>}/>
//                  <Route path="agentdashboard" element={<AgentDashboard/>}/>
//                  <Route path="agentpayment" element={<AgentPayment/>}/>
//                  <Route path="blog" element={<BlogManagement/>}/>
//               </Route>
//             {/* </Route> */}

//             <Route path="*" element={<NotFound/>}/>
//           </Routes>
//         </Suspense>
//       </main>

//       {/* {showBackToTop && (
//         <button className="rasi-back-to-top" onClick={scrollToTop} aria-label="Back to top">
//           <ArrowUp size={24} />
//         </button>
//       )} */}

//       {!isAdmin && !hideNavAndFooter && (
//         <>
//           {/* <div className="rasi-mobile-bottom-nav">
//             <NavLink to="/" className={({ isActive }) => `rasi-bottom-nav-item ${isActive ? 'active' : ''}`}>🏠<span>Home</span></NavLink>
//             <NavLink to="/products" className={({ isActive }) => `rasi-bottom-nav-item ${isActive ? 'active' : ''}`}>🍰<span>Desert</span></NavLink>
//             <NavLink to="/cart" className={({ isActive }) => `rasi-bottom-nav-item ${isActive ? 'active' : ''}`}>🛒<span>Cart</span></NavLink>
//             <NavLink to="/orders" className={({ isActive }) => `rasi-bottom-nav-item ${isActive ? 'active' : ''}`}>📦<span>Orders</span></NavLink>
//             <NavLink to="/profile" className={({ isActive }) => `rasi-bottom-nav-item ${isActive ? 'active' : ''}`}>👤<span>Account</span></NavLink>
//           </div> */}
//           {/* <CookieConsent /> */}
//           <Footer />
//         </>
//       )}
//     </div>
//   );
// };

// function App() {
//   return (
//     <Router>
//       <CustomerAuthProvider>
//         <CartProvider>
//           <AppContent />
//         </CartProvider>
//       </CustomerAuthProvider>
//     </Router>
//   );
// }

// if (import.meta.env.PROD && 'serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker
//       .register('/sw.js')
//       .catch((err) => console.error(err));
//   });
// }

// export default App;

import React, { useState, useEffect, lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  NavLink,
} from "react-router-dom";
import { ArrowUp, Cookie } from "lucide-react";
import { CartProvider, useCart } from "./context/CartContext";
import { CustomerAuthProvider } from "./context/CustomerAuthContext";
import Navbar from "./components/Navbar/Navbar";
import Toast from "./components/Toast/Toast";
import Footer from "./components/Footer/Footer";
import PWAInstall from "./components/PWAInstall/PWAInstall";
import AdminLayout from "./admin/AdminLayout/AdminLayout";
import "./App.css";
import CategoryProduct from "./pages/Categoryproducts/CategoryProduct";
import Pincode from "./admin/Pincode/Pincode";
import Point from "./admin/PointManagement/Point";
import Retailerorder from "./pages/Retailerorder/Retailerorder";
import Userpoint from "./pages/Userpoints/Userpoint";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import Coupon from "./pages/Coupon/Coupon";
import NotFound from "./components/NotFound";
import BackupRestore from "./admin/BackupRestore/BackupRestore";
import PaymentSuccess from "./pages/Checkout/PaymentSuccess";
import StaffManagement from "./admin/Staffmanagement/StaffManagement";
import { MenuManagement } from "./admin/MenuManagement/MenuManagement";
import { OrderManagement } from "./admin/OrderManagement/OrderManagement";
import StockManagement from "./admin/StockManagement/StockManagement";
import CustomerManagement from "./admin/customermanagement/CustomerManagement";
import KitchenDashboard from "./kitchen/kitchendashboard/KitchenDashboard";
import SupplierManagement from "./admin/SupplierManagement/SupplierManagement";
import AreaManagement from "./admin/AreaManagement/AreaManagement";
import TrackOrder from "./pages/trackorder/TrackOrder";
import KitchenOrder from "./kitchen/kitchenorder/KitchenOrder";
import DeliveryDashboard from "./deliveryagent/deliveryagentdashboard/DeliveryDashboard";
import DeliveryOrder from "./deliveryagent/deliveryorder/DeliveryOrder";
import DriverOrder from "./driver/DriverOrder/DriverOrder";
import Finance from "./admin/Finane/Finance";
import KitchenInventory from "./kitchen/kitcheninventory/KitchenInventory";
import Loyalty from "./admin/Loyality/Loyality";
import DriverSettlement from "./driver/Driversettlement/DriverSettlement";
import PromotionalCode from "./pages/Promocode/Promotionalcode";
import DriverDashboard from "./driver/DriverDashboard/DriverDashboard";
import SalesAgentDashboard from "./salesagent/salesagentdashboard/Salesagentdash";
import SalesAgentOrders from "./salesagent/salesagentorder/Salesagentorder";
import Promocode from "./pages/Promocode/Promocode";
import SalesAgentCreateOrder from "./salesagent/salesagentorder/Salesagentcreateorder";
import Cookies from "./components/CookieConsent/Cookies";
import AgentManagement from "./agent/AgentManagement";
import AgentMenuManagement from "./agent/Agentmenumanagement";
import AgentProduct from "./agent/AgentProduct";
import AgentOrder from "./agent/AgentOrder";
import Agentfetchorder from "./agent/Agentfetchorder";
import AgentDashboard from "./agent/Agentdashboard";
import AgentPayment from "./agent/Agentpayment";
import BlogManagement from "./admin/Blog/BlogManagement";
import UserBlog from "./pages/Blog/Userblog";
import Unauthorized from "./components/Unauthorized";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import KitchenOrderCalendar from "./kitchen/kitchencalender/Kitchenordercalender";
import InventoryManagement from "./admin/InventoryManagement/Inventorymanagement";
import Deleteaccount from "./pages/Delete-account/Deleteaccount";

// Lazy load pages
const Home = lazy(() => import("./pages/Home/Home"));
const Products = lazy(() => import("./pages/Products/Products"));
const ProductDetails = lazy(
  () => import("./pages/ProductDetails/ProductDetails"),
);
const Cart = lazy(() => import("./pages/Cart/Cart"));
const Login = lazy(() => import("./pages/Login/Login"));
const Register = lazy(() => import("./pages/Register/Register"));
const About = lazy(() => import("./pages/About/About"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy/PrivacyPolicy"));
const Terms = lazy(() => import("./pages/Terms/Terms"));
const Profile = lazy(() => import("./pages/Profile/Profile"));
const Contact = lazy(() => import("./pages/Contact/Contact"));
const Checkout = lazy(() => import("./pages/Checkout/Checkout"));
const Orders = lazy(() => import("./pages/Orders/Orders"));
const Wishlist = lazy(() => import("./pages/Wishlist/Wishlist"));

// Admin Pages
const AdminDashboard = lazy(() => import("./admin/Dashboard/Dashboard"));
const Loading = () => (
  <div className="rasi-loading-screen">
    <div className="rasi-spinner"></div>
    <p>Baking something delicious...</p>
  </div>
);

const AppContent: React.FC = () => {
  const { cartCount, toast, hideToast } = useCart();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const hideNavAndFooter = ["/login", "/register"].includes(location.pathname);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="rasi-app">
      {!isAdmin && !hideNavAndFooter && <Navbar cartCount={cartCount} />}
      <PWAInstall />
      <Toast show={toast.show} message={toast.message} onClose={hideToast} />

      <main className={isAdmin ? "" : "rasi-main-content"}>
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* ── Fully public: only these are reachable without a token ── */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* ── Everything else requires a logged-in user ── */}

            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/track-order/:id" element={<TrackOrder />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/about" element={<About />} />
            <Route path="/delete-account" element={<Deleteaccount />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/agentproduct" element={<AgentProduct />} />

            <Route path="/retailerorder" element={<Retailerorder />} />
            <Route path="/coupon-user-points" element={<Userpoint />} />
            <Route path="/categoryproduct/:id" element={<CategoryProduct />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route
              path="/payment-cancel"
              element={<h2>Payment Cancelled</h2>}
            />
            <Route path="/coupon-user" element={<Coupon />} />
            <Route path="/promo" element={<Promocode />} />
            <Route path="/userblog" element={<UserBlog />} />
            <Route path="/cookies" element={<Cookies />} />

            {/* Admin routes — requires login AND admin/staff role */}
            {/* <Route element={<AdminProtectedRoute />}>
                <Route path="admin" element={<AdminLayout />}>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="pincode" element={<Pincode />} />
                  <Route path="point" element={<Point />} />
                  <Route path='staff' element={<StaffManagement/>}/>
                  <Route path="customer" element={<CustomerManagement/>}/>
                  <Route path="orderpipeline" element={<OrderManagement/>}/>
                  <Route path="menu" element={<MenuManagement/>}/>
                  <Route path="stock" element={<StockManagement/>}/>
                  <Route path="kitchen" element={<KitchenDashboard/>}/>
                  <Route path="supplier" element={<SupplierManagement/>}/>
                  <Route path="area" element={<AreaManagement/>}/>
                  <Route path="backup" element={<BackupRestore/>}/>
                  <Route path="kitchen-order" element={<KitchenOrder/>}/>
                  <Route path="deliverydashboard" element={<DeliveryDashboard/>}/>
                  <Route path="deliveryorder" element={<DeliveryOrder/>}/>
                  <Route path="driverdashboard" element={<DriverDashboard/>}/>
                  <Route path="driverorder" element={<DriverOrder/>}/>
                  <Route path="driversettlement" element={<DriverSettlement/>}/>
                  <Route path="finance" element={<Finance/>}/>
                  <Route path="kitcheninventory" element={<KitchenInventory/>}/>
                  <Route path="loyality" element={<Loyalty/>}/>
                  <Route path="salesdash" element={<SalesAgentDashboard/>}/>
                  <Route path="salesorder" element={<SalesAgentOrders/>}/>
                  <Route path="salescreateorder" element={<SalesAgentCreateOrder/>}/>
                  <Route path="agentmanagement" element={<AgentManagement/>}/>
                  <Route path="agentmenu" element={<AgentMenuManagement/>}/>
                  <Route path="agentorder" element={<AgentOrder/>}/>
                  <Route path="agentfetchorder" element={<Agentfetchorder/>}/>
                  <Route path="agentdashboard" element={<AgentDashboard/>}/>
                  <Route path="agentpayment" element={<AgentPayment/>}/>
                  <Route path="blog" element={<BlogManagement/>}/>
                </Route>
              </Route> */}

            <Route element={<AdminProtectedRoute />}>
              <Route path="admin" element={<AdminLayout />}>
                <Route
                  element={<RoleProtectedRoute allowedRoles={["ADMIN"]} />}
                >
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="staff" element={<StaffManagement />} />
                  <Route path="backup" element={<BackupRestore />} />
                </Route>

                <Route
                  element={
                    <RoleProtectedRoute
                      allowedRoles={["ADMIN", "SHOP_MANAGER"]}
                    />
                  }
                >
                  <Route
                    path="driversettlement"
                    element={<DriverSettlement />}
                  />
                  <Route path="agentpayment" element={<AgentPayment />} />
                  <Route path="area" element={<AreaManagement />} />
                  <Route path="agentmenu" element={<AgentMenuManagement />} />
                  <Route path="agentmanagement" element={<AgentManagement />} />
                  <Route path="orderpipeline" element={<OrderManagement />} />
                  {/* <Route path="stock" element={<StockManagement/>}/>
      <Route path="supplier" element={<SupplierManagement/>}/> */}
                  <Route path="inventory" element={<InventoryManagement />} />
                  <Route path="loyality" element={<Loyalty />} />
                </Route>

                <Route
                  element={
                    <RoleProtectedRoute
                      allowedRoles={["ADMIN", "SALES_AGENT", "SHOP_MANAGER"]}
                    />
                  }
                >
                  <Route path="menu" element={<MenuManagement />} />
                  <Route path="customer" element={<CustomerManagement />} />
                </Route>

                <Route
                  element={
                    <RoleProtectedRoute
                      allowedRoles={["ADMIN", "SALES_AGENT"]}
                    />
                  }
                >
                  <Route path="blog" element={<BlogManagement />} />
                  <Route path="salesdash" element={<SalesAgentDashboard />} />
                  <Route
                    path="salescreateorder"
                    element={<SalesAgentCreateOrder />}
                  />
                  <Route path="salesorder" element={<SalesAgentOrders />} />
                </Route>

                <Route
                  element={
                    <RoleProtectedRoute
                      allowedRoles={["ADMIN", "KITCHEN_STAFF"]}
                    />
                  }
                >
                  <Route path="kitchen" element={<KitchenOrderCalendar />} />
                  <Route path="kitchen-order" element={<KitchenOrder />} />
                  <Route
                    path="kitcheninventory"
                    element={<KitchenInventory />}
                  />
                </Route>

                <Route
                  element={
                    <RoleProtectedRoute allowedRoles={["ADMIN", "AGENT"]} />
                  }
                >
                  <Route path="agentdashboard" element={<AgentDashboard />} />
                  <Route path="agentorder" element={<AgentOrder />} />
                  <Route path="agentfetchorder" element={<Agentfetchorder />} />
                </Route>

                <Route
                  element={
                    <RoleProtectedRoute
                      allowedRoles={["ADMIN", "DELIVERY_AGENT"]}
                    />
                  }
                >
                  <Route
                    path="deliverydashboard"
                    element={<DeliveryDashboard />}
                  />
                  <Route path="deliveryorder" element={<DeliveryOrder />} />
                </Route>

                <Route
                  element={
                    <RoleProtectedRoute allowedRoles={["ADMIN", "DRIVER"]} />
                  }
                >
                  <Route path="driverdashboard" element={<DriverDashboard />} />
                  <Route path="driverorder" element={<DriverOrder />} />
                </Route>

                <Route path="finance" element={<Finance />} />
              </Route>
            </Route>

            <Route path="admin/unauthorized" element={<AdminProtectedRoute />}>
              {/* Still requires login, just not tied to a specific role */}
              <Route index element={<Unauthorized />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      {!isAdmin && !hideNavAndFooter && (
        <>
          <Footer />
        </>
      )}
    </div>
  );
};

function App() {
  return (
    <Router>
      <CustomerAuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </CustomerAuthProvider>
    </Router>
  );
}

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .catch((err) => console.error(err));
  });
}

export default App;
