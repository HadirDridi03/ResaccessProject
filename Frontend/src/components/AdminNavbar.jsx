// src/components/AdminNavbar.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  FaHome, 
  FaPlusCircle,
  FaListAlt, 
  FaUsers,
  FaCalendarCheck,
  FaChartBar, 
  FaSignOutAlt 
} from "react-icons/fa";
import "../styles/UserNavbar.css"; // On réutilise exactement le même style !

export default function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <aside className="user-sidebar"> {/* Même classe pour même style */}
      <div className="sidebar-header">
        <h2>ResAccess</h2>
        <p className="admin-tag">Administrateur</p>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`nav-item ${isActive("/admin/dashboard") ? "active" : ""}`}
          onClick={() => navigate("/admin/dashboard")}
        >
          <FaHome />
          <span>Tableau de bord</span>
        </button>

        <button
          className={`nav-item ${isActive("/admin/add-equipment") ? "active" : ""}`}
          onClick={() => navigate("/admin/add-equipment")}
        >
          <FaPlusCircle />
          <span>Ajouter équipement</span>
        </button>

        <button
          className={`nav-item ${isActive("/admin/equipments") ? "active" : ""}`}
          onClick={() => navigate("/admin/equipments")}
        >
          <FaListAlt />
          <span>Liste équipements</span>
        </button>

        <button
          className={`nav-item ${isActive("/admin/users") ? "active" : ""}`}
          onClick={() => navigate("/admin/users")}
        >
          <FaUsers />
          <span>Gérer utilisateurs</span>
        </button>

        <button
          className={`nav-item ${isActive("/admin/reservations") ? "active" : ""}`}
          onClick={() => navigate("/admin/reservations")}
        >
          <FaCalendarCheck />
          <span>Toutes réservations</span>
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