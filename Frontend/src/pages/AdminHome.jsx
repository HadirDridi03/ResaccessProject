import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlusCircle,
  FaListAlt,
  FaSignOutAlt,
  FaUserCog,
  FaCalendarAlt
} from "react-icons/fa";
import "../styles/AdminHome.css";

export default function AdminHome() {
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem("user")) || { name: "Administrateur" };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="admin-home-container">
      {/* 🔝 Actions top */}
      <div className="top-actions">
        <button
          className="profile-btn-admin"
          onClick={() => navigate("/profile")}
        >
          Profil
        </button>

        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> Déconnexion
        </button>
      </div>

      {/* 👋 Message de bienvenue */}
      <div className="admin-welcome">
        <h2>Bienvenue {admin.name}</h2>
        <p>
          Gérez les équipements, les réservations et les utilisateurs depuis ce
          tableau de bord.
        </p>
      </div>

      {/* 🧩 Cartes actions */}
      <div className="admin-actions">
        <button
          className="admin-card"
          onClick={() => navigate("/equipment/add")}
        >
          <FaPlusCircle className="admin-icon" />
          <span>Ajouter un équipement</span>
        </button>

        <button
          className="admin-card"
          onClick={() => navigate("/equipment")}
        >
          <FaListAlt className="admin-icon" />
          <span>Liste des équipements</span>
        </button>

        <button
          className="admin-card"
          onClick={() => navigate("/admin/users")}
        >
          <FaUserCog className="admin-icon" />
          <span>Gérer les utilisateurs</span>
        </button>

        {/* 🆕 Historique des réservations */}
        <button
          className="admin-card"
          onClick={() => navigate("/admin/reservation-history")}
        >
          <FaCalendarAlt className="admin-icon" />
          <span>Historique des réservations</span>
        </button>
      </div>
    </div>
  );
}
