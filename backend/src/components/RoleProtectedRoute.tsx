import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

interface RoleProtectedRouteProps {
  allowedRoles: string[];
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ allowedRoles }) => {
  const location = useLocation();
  const role = localStorage.getItem("role");

  if (!role || !allowedRoles.includes(role)) {
    // Send them to a landing page appropriate for their own role
    // instead of bouncing to /login (they ARE logged in, just not authorized here).
    return <Navigate to="/admin/unauthorized" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default RoleProtectedRoute;