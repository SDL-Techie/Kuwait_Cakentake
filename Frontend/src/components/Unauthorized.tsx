// src/components/Unauthorized.tsx
import React from "react";
import { Link } from "react-router-dom";

const Unauthorized: React.FC = () => (
  <div style={{ padding: "60px 24px", textAlign: "center" }}>
    <h2>Access Denied</h2>
    <p>You don't have permission to view this page.</p>
    <Link to="/admin">Return to your dashboard</Link>
  </div>
);

export default Unauthorized;