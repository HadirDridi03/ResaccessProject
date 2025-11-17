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
     <div className="top-actions">
  <button className="profile-btn-admin" onClick={() => navigate("/profile")}>
    Profil
  </button>
  <button className="logout-btn" onClick={handleLogout}>
    Déconnexion
  </button>
</div>
      <div className="admin-welcome">
        <h2>Bienvenue {admin.name}</h2>
        <p>Gérez les équipements et les réservations depuis ce tableau de bord.</p>
      </div>

      <div className="admin-actions">
        <button className="admin-card" onClick={() => navigate("/equipment/add")}>
          <FaPlusCircle className="admin-icon" />
          <span>Ajouter un équipement</span>
        </button>
        <button className="admin-card" onClick={() => navigate("/equipment")}>
          <FaListAlt className="admin-icon" />
          <span>Liste des équipements</span>
        </button>
        <button className="admin-card" onClick={() => navigate("/admin/users")}>
          Gérer les utilisateurs
        </button>
      </div>
    </div>
  );
}