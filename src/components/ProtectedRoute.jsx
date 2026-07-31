import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Wrap a route element with this to require login, and optionally a specific role.
// Usage: <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="page">
        <p style={{ color: "var(--color-slate)", padding: "60px 0", textAlign: "center" }}>
          Checking your session…
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return (
      <div className="page">
        <div className="panel">
          <div className="empty-state">
            <div className="empty-state__title">You don't have access to this page</div>
            <p>This area is restricted to {role} accounts.</p>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
