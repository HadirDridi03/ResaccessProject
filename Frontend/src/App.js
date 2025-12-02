// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute"

import './App.css';

// Pages publiques
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";

// Pages admin
import AdminHome from "./pages/AdminHome";
import EquipmentList from "./pages/EquipmentList";
import AddEquipment from "./pages/AddEquipment";
import UserManagement from "./pages/UserManagement"; 

// Pages utilisateur
import UserHome from "./pages/UserHome";
import UserEquipmentList from "./pages/UserEquipmentList";
import UserEquipmentCalendar from "./pages/UserEquipmentCalendar";
import NewReservation from "./pages/NewReservation";

import Profile from "./pages/Profile";

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Routes Admin avec protection */}
        <Route
          path="/admin/home"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/equipment"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <EquipmentList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/equipment/add"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AddEquipment />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/equipment/edit/:id" 
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AddEquipment />
            </ProtectedRoute>
          } 
        />
        
        {/* ROUTE Gestion des utilisateurs */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <UserManagement />
            </ProtectedRoute>
          }
        />

        {/* Routes Utilisateur avec protection */}
        <Route
          path="/user/home"
          element={
            <ProtectedRoute allowedRoles={["user", "superviseur"]}>
              <UserHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/equipment"
          element={
            <ProtectedRoute allowedRoles={["user", "superviseur"]}>
              <UserEquipmentList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/equipment/:id/calendar"
          element={
            <ProtectedRoute allowedRoles={["user", "superviseur"]}>
              <UserEquipmentCalendar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reservation/new"
          element={
            <ProtectedRoute allowedRoles={["user", "superviseur"]}>
              <NewReservation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["user", "admin"]}>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;