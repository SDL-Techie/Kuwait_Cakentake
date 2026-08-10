// // import React from 'react';
// // import { Navigate, Outlet } from 'react-router-dom';

// // const AdminProtectedRoute: React.FC = () => {
// //   // 1. Grab the role you stored during the login process
// //   const userRole = localStorage.getItem('userRole');
// //   const token = localStorage.getItem('token');

// //   // 2. Check if they are logged in AND if their role is strictly 'admin'
// //   if (token && userRole === 'admin') {
// //     // Access granted! Render the admin pages inside
// //     return <Outlet />;
// //   }

// //   // 3. Access denied! Push them back to the customer home page
// //   return <Navigate to="/" replace />;A
// // };

// // export default AdminProtectedRoute;
// import { Navigate, Outlet } from "react-router-dom";

// const AdminProtectedRoute = () => {
//   const token = localStorage.getItem("token");
//   const role = localStorage.getItem("role"); // ✅ correct key

//   if (token && role === "ADMIN") {
//     return <Outlet />;
//   }

//   return <Navigate to="/login" replace />;
// };

// export default AdminProtectedRoute;



import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const STAFF_ROLES = [
  "ADMIN",
  "SHOP_MANAGER",
  "KITCHEN_STAFF",
  "SALES_AGENT",
  "AGENT",
  "DELIVERY_AGENT",
  "DRIVER",
];

const AdminProtectedRoute: React.FC = () => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (token && role && STAFF_ROLES.includes(role)) {
    return <Outlet />;
  }

  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default AdminProtectedRoute;