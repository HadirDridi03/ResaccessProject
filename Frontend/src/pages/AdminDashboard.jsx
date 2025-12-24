// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaHourglassHalf,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarAlt,
} from "react-icons/fa";
import AdminNavbar from "../components/AdminNavbar";
import "../styles/UserDashboard.css"; // Même style que l'utilisateur !

const API_URL = "http://localhost:5000/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    totalEquipment: 0,
    totalUsers: 0,
    occupancyRate: 0,
  });
  const [pendingReservations, setPendingReservations] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);

        // Récupérer toutes les stats admin (tu devras créer ces routes backend plus tard si besoin)
        const [eqRes, resPendingRes, statsRes] = await Promise.all([
          axios.get(`${API_URL}/equipments`),
          axios.get(`${API_URL}/reservations/pending`, { headers: getAuthHeaders() }),
          axios.get(`${API_URL}/admin/stats`, { headers: getAuthHeaders() }).catch(() => ({ data: {} })),
        ]);

        setEquipments(eqRes.data);
        setPendingReservations(resPendingRes.data);

        // Stats par défaut ou calculées
        setStats({
          pending: resPendingRes.data.length,
          approved: 15, // à remplacer par vrai appel API plus tard
          rejected: 2,
          totalEquipment: eqRes.data.length,
          totalUsers: 48, // à connecter plus tard
          occupancyRate: 68,
        });

      } catch (err) {
        console.error(err);
        if (err.response?.status === 401) navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [navigate]);

  if (loading) {
    return <div className="loading-full">Chargement du tableau de bord admin...</div>;
  }

  return (
    <div className="dashboard-with-sidebar">
      <AdminNavbar />

      <main className="page-content">
        <header className="dashboard-header">
          <h1>Tableau de bord Administrateur</h1>
          <p>Gérez les équipements, utilisateurs et réservations en toute simplicité</p>
        </header>

        {/* Cartes de stats */}
        <div className="stats-grid">
          <div className="stat-card pending">
            <div className="stat-title">En attente</div>
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-subtitle">Demandes à approuver</div>
          </div>

          <div className="stat-card occupancy">
            <div className="stat-title">Taux occupation</div>
            <div className="stat-value">{stats.occupancyRate}%</div>
            <div className="stat-subtitle">Cette semaine</div>
          </div>

          <div className="stat-card total">
            <div className="stat-title">Équipements</div>
            <div className="stat-value">{stats.totalEquipment}</div>
            <div className="stat-subtitle">Total actifs</div>
          </div>
        </div>

        {/* Réservations en attente */}
        <section className="pending-section">
          <h3>
            <FaHourglassHalf /> Réservations en attente ({stats.pending})
          </h3>
          {pendingReservations.length > 0 ? (
            <ul className="reservation-list">
              {pendingReservations.map(res => (
                <li key={res._id} className="reservation-item pending">
                  <strong>{res.equipment?.name}</strong>
                  <div>{res.date} • {res.heureDebut} - {res.heureFin}</div>
                  <div>Par : {res.user?.name || "Utilisateur"}</div>
                  <div className="motif">{res.motif}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">Aucune réservation en attente.</p>
          )}
        </section>

        {/* Équipements rapides */}
        <section className="equipments-list-section">
          <h3>
            <FaCalendarAlt /> Équipements disponibles ({equipments.length})
          </h3>
          <div className="equipments-grid">
            {equipments.slice(0, 4).map(eq => ( // Affiche seulement 4
              <div key={eq._id} className="equipment-item">
                <img
                  src={eq.photo ? `http://localhost:5000/${eq.photo.replace(/\\/g, "/")}` : "https://via.placeholder.com/300x200"}
                  alt={eq.name}
                  className="eq-img"
                />
                <h4>{eq.name}</h4>
                <p>{eq.description?.slice(0, 80)}...</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}