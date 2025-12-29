// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllEquipment } from "../api/equipmentApi";
import { getReservations, getWeeklyOccupancyRate } from "../api/reservationApi";
import AdminNavbar from "../components/AdminNavbar";
import "../styles/UserDashboard.css"; // ← On réutilise le style du dashboard utilisateur

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    pendingCount: 0,
    occupancyRate: 0,
    totalEquipment: 0,
  });
  const [pendingReservations, setPendingReservations] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Chargement des équipements
        const eqData = await getAllEquipment();
        const activeEquipments = eqData.filter((eq) => eq.available === true);
        setEquipments(eqData);
        setStats((prev) => ({ ...prev, totalEquipment: activeEquipments.length }));

        // 2. Réservations en attente
        const pendingRes = await getReservations({ status: "pending" });
        setPendingReservations(pendingRes);
        setStats((prev) => ({ ...prev, pendingCount: pendingRes.length }));

        // 3. Taux d'occupation hebdomadaire
        const occupancy = await getWeeklyOccupancyRate();
        setStats((prev) => ({ ...prev, occupancyRate: occupancy.occupancyRate || 0 }));

      } catch (err) {
        console.error("Erreur dans le dashboard admin :", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          alert("Session expirée ou accès refusé. Reconnexion requise.");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return <div className="loading-full">Chargement du tableau de bord...</div>;
  }

  return (
    <div className="dashboard-with-sidebar">
      <AdminNavbar />

      <main className="page-content">
        <header className="dashboard-header">
          <h1>Tableau de bord Administrateur</h1>
          <p>Gérez les équipements, utilisateurs et réservations en toute simplicité</p>
        </header>

        {/* === CARTES DE STATS === */}
        <div className="stats-grid">
          <div
            className="stat-card pending"
            onClick={() => navigate("/admin/reservations")}
            style={{ cursor: "pointer" }}
          >
            <div className="stat-title">En attente</div>
            <div className="stat-value">{stats.pendingCount}</div>
            <div className="stat-subtitle">Demandes à approuver</div>
          </div>

          <div className="stat-card occupancy">
            <div className="stat-title">Taux d'occupation</div>
            <div className="stat-value">{stats.occupancyRate}%</div>
            <div className="stat-subtitle">Cette semaine</div>
          </div>

          <div
            className="stat-card total"
            onClick={() => navigate("/admin/equipments")}
            style={{ cursor: "pointer" }}
          >
            <div className="stat-title">Équipements actifs</div>
            <div className="stat-value">{stats.totalEquipment}</div>
            <div className="stat-subtitle">Disponibles</div>
          </div>
        </div>

        {/* === RÉSERVATIONS EN ATTENTE === */}
        <section className="pending-section">
          <h3>⏳ Réservations en attente ({stats.pendingCount})</h3>
          {pendingReservations.length > 0 ? (
            <ul className="reservation-list">
              {pendingReservations.map((res) => (
                <li
                  key={res._id}
                  className="reservation-item pending"
                  onClick={() => navigate("/admin/reservations")}
                  style={{ cursor: "pointer" }}
                >
                  <strong>{res.equipment?.name || "Équipement inconnu"}</strong>
                  <div>{res.date} • {res.heureDebut} - {res.heureFin}</div>
                  <div>Par : {res.user?.name || res.user?.email || "Inconnu"}</div>
                  <div className="motif">{res.motif || "Non spécifié"}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">Aucune réservation en attente.</p>
          )}
        </section>

        {/* === APERÇU DES ÉQUIPEMENTS === */}
        <section className="equipments-list-section">
          <h3>📋 Équipements disponibles ({stats.totalEquipment})</h3>
          <div className="equipments-grid">
            {equipments.length > 0 ? (
              equipments
                .filter((eq) => eq.available) // On affiche seulement les disponibles pour cohérence
                .slice(0, 6)
                .map((eq) => (
                  <div key={eq._id} className="equipment-item">
                    <img
                      src={
                        eq.photo
                          ? `http://localhost:5000/${eq.photo.replace(/\\/g, "/")}`
                          : "https://via.placeholder.com/300x200?text=Pas+de+photo"
                      }
                      alt={eq.name}
                      className="eq-img"
                    />
                    <h4>{eq.name}</h4>
                    <p>{eq.description?.slice(0, 80) || "Aucune description"}...</p>
                  </div>
                ))
            ) : (
              <p className="no-data">Aucun équipement enregistré.</p>
            )}
          </div>
          {equipments.length > 6 && (
            <button onClick={() => navigate("/admin/equipments")} className="see-all-btn">
              Voir tous les équipements →
            </button>
          )}
        </section>
      </main>
    </div>
  );
}