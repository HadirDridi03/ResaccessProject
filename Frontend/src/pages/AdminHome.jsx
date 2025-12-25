// src/pages/AdminHome.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlusCircle,
  FaListAlt,
  FaSignOutAlt,
  FaUserCog,
  FaHistory,
  FaUser,
} from "react-icons/fa";
import "../styles/AdminHome.css";

export default function AdminHome() {
  const navigate = useNavigate();
  const admin =
    JSON.parse(localStorage.getItem("user")) || { name: "Administrateur" };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="admin-home-container">
      {/* === PROFIL + DÉCONNEXION === */}
      <div className="top-actions">
        <button
          className="profile-btn-admin"
          onClick={() => navigate("/profile")}
        >
          <FaUser /> Profil
        </button>

        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> Déconnexion
        </button>
      </div>

      {/* === MESSAGE DE BIENVENUE === */}
      <div className="admin-welcome">
        <h2>Bienvenue, {admin.name} !</h2>
        <p>
          Gérez les équipements, les utilisateurs et les réservations depuis ce
          tableau de bord.
        </p>
      </div>

      {/* === ACTIONS ADMIN === */}
      <div className="admin-actions">
        {/* Ajouter un équipement */}
        <button
          className="admin-card"
          onClick={() => navigate("/equipment/add")}
        >
          <FaPlusCircle className="admin-icon" />
          <span>Ajouter un équipement</span>
        </button>

        {/* Gérer les équipements */}
        <button
          className="admin-card"
          onClick={() => navigate("/equipment")}
        >
          <FaListAlt className="admin-icon" />
          <span>Gérer les équipements</span>
        </button>

        {/* Gérer les utilisateurs */}
        <button
          className="admin-card"
          onClick={() => navigate("/admin/users")}
        >
          <FaUserCog className="admin-icon" />
          <span>Gérer les utilisateurs</span>
        </button>

        {/* Historique / gestion des réservations */}
        <button
          className="admin-card"
          onClick={() => navigate("/admin/reservation-history")}
        >
          <FaHistory className="admin-icon" />
          <span>Gérer les réservations</span>
        </button>
      </div>
    </div>
  );
}
