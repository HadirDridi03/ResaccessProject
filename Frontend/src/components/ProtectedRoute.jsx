import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const stored = localStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : null;

   

  if (!user || !user.role) {
    return <Navigate to="/login" replace />;
  }

  
  const rolesArray = Array.isArray(allowedRoles)
    ? allowedRoles
    : [allowedRoles].filter(Boolean);

  
  if (rolesArray.length > 0 && !rolesArray.includes(user.role)) {
    const fallback = user.role === "admin" ? "/admin/home" : "/user/home";
    return <Navigate to={fallback} replace />;
  }

  
  return children;
}

export default ProtectedRoute;