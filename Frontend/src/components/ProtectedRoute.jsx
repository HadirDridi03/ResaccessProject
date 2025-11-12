// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const stored = localStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : null;

  // Pas d'utilisateur → redirection login
  if (!user || !user.role) {
    return <Navigate to="/login" replace />;
  }

  // Normaliser allowedRoles en tableau
  const rolesArray = Array.isArray(allowedRoles)
    ? allowedRoles
    : [allowedRoles].filter(Boolean);

  // Si des rôles sont requis et que l'utilisateur n'en a pas
  if (rolesArray.length > 0 && !rolesArray.includes(user.role)) {
    const fallback = user.role === "admin" ? "/equipment" : "/user/home";
    return <Navigate to={fallback} replace />;
  }

  // Autorisé → afficher la page
  return children;
}

export default ProtectedRoute;