// src/pages/UserHome.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaCalendarAlt, 
  FaPlusCircle, 
  FaListAlt, 
  FaSignOutAlt, 
  FaHome,
  FaUser 
} from "react-icons/fa";
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
      {/* === SECTION PROFIL + DÉCONNEXION === */}
      <div className="logout-section">
        <button 
          className="profile-btn" 
          onClick={() => navigate("/profile")}
        >
          <FaUser /> Profil
        </button>
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> Déconnexion
        </button>
      </div>

      {/* === MESSAGE DE BIENVENUE === */}
      <div className="user-home-header">
        <h1 className="welcome-title">Bienvenue, {user.name} !</h1>
        <p className="welcome-text">
          Heureux de vous revoir ! Que souhaitez-vous faire aujourd'hui ?
        </p>
      </div>

      {/* === ACTIONS PRINCIPALES === */}
      <div className="user-actions">
        <button 
          className="action-card" 
          onClick={() => navigate("/user/dashboard")}
        >
          <FaHome className="action-icon" />
          <span>Tableau de bord</span>
        </button>

        <button 
          className="action-card" 
          onClick={() => navigate("/user/equipment")}
        >
          <FaCalendarAlt className="action-icon" />
          <span>Voir les calendriers</span>
        </button>

        <button 
          className="action-card" 
          onClick={() => navigate("/user/dashboard")}
        >
          <FaPlusCircle className="action-icon" />
          <span>Nouvelle réservation</span>
        </button>

        <button 
          className="action-card" 
          onClick={() => navigate("/user/reservations")}
        >
          <FaListAlt className="action-icon" />
          <span>Mes réservations</span>
        </button>
      </div>
    </div>
  );
}
