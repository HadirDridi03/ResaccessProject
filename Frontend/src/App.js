// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import './App.css';

// Pages publiques
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";

// Pages Admin → NOUVELLES avec le design moderne
import AdminDashboard from "./pages/AdminDashboard";       // ← NOUVEAU : le beau dashboard
import EquipmentList from "./pages/EquipmentList";          // Tu gardes ta liste admin actuelle (ou tu pourras la moderniser plus tard)
import AddEquipment from "./pages/AddEquipment";
import UserManagement from "./pages/UserManagement";
import ReservationHistory from "./pages/ReservationHistory";

// Pages Utilisateur (inchangées)
import UserDashboard from "./pages/UserDashboard";
import UserEquipmentList from "./pages/UserEquipmentList";
import UserEquipmentCalendar from "./pages/UserEquipmentCalendar";
import MyReservations from "./pages/MyReservations";

// Pages communes
import Profile from "./pages/Profile";

function App() {
  return (
    <Router>
      <Routes>
        {/* 🌍 Routes publiques */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* 🛠️ Routes Admin - NOUVEAU DESIGN */}
        
        {/* Tableau de bord principal admin → le nouveau beau dashboard */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Ajouter un équipement */}
        <Route
          path="/admin/add-equipment"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AddEquipment />
            </ProtectedRoute>
          }
        />

        {/* Éditer un équipement */}
        <Route
          path="/admin/equipment/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AddEquipment /> {/* Réutilise le même composant */}
            </ProtectedRoute>
          }
        />

        {/* Liste complète des équipements (admin) */}
        <Route
          path="/admin/equipments"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <EquipmentList />
            </ProtectedRoute>
          }
        />

        {/* Gérer les utilisateurs */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <UserManagement />
            </ProtectedRoute>
          }
        />

        {/* Toutes les réservations / historique admin */}
        <Route
          path="/admin/reservations"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ReservationHistory />
            </ProtectedRoute>
          }
        />

        {/* Ancienne route admin → redirige vers le nouveau dashboard */}
        <Route path="/admin/home" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/equipment" element={<Navigate to="/admin/equipments" replace />} />
        <Route path="/equipment/add" element={<Navigate to="/admin/add-equipment" replace />} />
        <Route path="/admin/reservation-history" element={<Navigate to="/admin/reservations" replace />} />

        {/* 👤 Routes Utilisateur (inchangées) */}
        <Route
          path="/user/home"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/equipment"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <UserEquipmentList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/equipment/:id/calendar"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <UserEquipmentCalendar />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/reservations"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <MyReservations />
            </ProtectedRoute>
          }
        />

        {/* Profil */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["user", "admin"]}>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Redirections */}
        <Route path="/user/dashboard" element={<Navigate to="/user/home" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;