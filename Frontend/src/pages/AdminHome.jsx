// src/pages/AdminHome.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { FaPlusCircle, FaListAlt, FaSignOutAlt } from "react-icons/fa";
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
      {/* --- Bouton de déconnexion --- */}
      <button className="logout-btn" onClick={handleLogout}>
        <FaSignOutAlt /> Déconnexion
      </button>

      {/* --- Message d’accueil --- */}
      <div className="admin-welcome">
        <h2>Bienvenue {admin.name} 👋</h2>
        <br></br>
        <p>Gérez les équipements et les réservations depuis ce tableau de bord.</p>
      </div>

      {/* --- Actions principales --- */}
      <div className="admin-actions">
        <button className="admin-card" onClick={() => navigate("/equipment/add")}>
          <FaPlusCircle className="admin-icon" />
          <span>Ajouter un équipement</span>
        </button>

        <button className="admin-card" onClick={() => navigate("/equipment")}>
          <FaListAlt className="admin-icon" />
          <span>Liste des équipements</span>
        </button>
      </div>
    </div>
  );
}
