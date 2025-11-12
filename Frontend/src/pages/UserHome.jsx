import React from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaPlusCircle, FaListAlt, FaSignOutAlt } from "react-icons/fa";
import "../styles/UserHome.css";

export default function UserHome() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || { name: "Utilisateur" };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="user-home-container">
      {/* Bouton de déconnexion en haut */}
      <div className="logout-section">
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> Déconnexion
        </button>
      </div>

      {/* Header */}
      <div className="user-home-header">
        <h1 className="welcome-title">Bienvenue {user.name} 👋</h1>
        <p className="welcome-text">
          Heureux de vous revoir ! Que souhaitez-vous faire aujourd’hui ?
        </p>
      </div>

      {/* Actions principales */}
      <div className="user-actions">
        <button className="action-card" onClick={() => navigate("/user/equipment")}>
          <FaCalendarAlt className="action-icon" />
          <span>Voir calendrier</span>
        </button>

        <button className="action-card" onClick={() => navigate("/reservation/new")}>
          <FaPlusCircle className="action-icon" />
          <span>Nouvelle réservation</span>
        </button>

        <button className="action-card" onClick={() => navigate("/user/my-reservations")}>
          <FaListAlt className="action-icon" />
          <span>Historique</span>
        </button>
      </div>
    </div>
  );
}
