// src/components/UserNavbar.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  FaHome, 
  FaCalendarAlt, 
  FaListAlt, 
  FaChartBar, 
  FaSignOutAlt 
} from "react-icons/fa";
import "../styles/UserNavbar.css";

export default function UserNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="user-sidebar">
      <div className="sidebar-header">
        <h2>ResAccess</h2>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`nav-item ${isActive("/user/home") || isActive("/user/dashboard") ? "active" : ""}`}
          onClick={() => navigate("/user/home")}
        >
          <FaHome />
          <span>Tableau de bord</span>
        </button>

        <button
          className={`nav-item ${isActive("/user/equipment") ? "active" : ""}`}
          onClick={() => navigate("/user/equipment")}
        >
          <FaListAlt />
          <span>Équipements</span>
        </button>

        <button
          className={`nav-item ${isActive("/user/reservations") ? "active" : ""}`}
          onClick={() => navigate("/user/reservations")}
        >
          <FaCalendarAlt />
          <span>Mes réservations</span>
        </button>

        <button className="nav-item" disabled>
          <FaChartBar />
          <span>Statistiques</span>
          <span className="coming-soon">Bientôt</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="sidebar-logout">
          <FaSignOutAlt />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}