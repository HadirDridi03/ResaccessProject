// src/pages/UserDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Modal from "react-modal";
import {
  FaHourglassHalf,
  FaCheckCircle,
  FaClock,
  FaUsers,
} from "react-icons/fa";
import UserNavbar from "../components/UserNavbar";
import "../styles/UserDashboard.css";

Modal.setAppElement("#root");

const API_URL = "http://localhost:5000/api";

export default function UserDashboard() {
  const [stats, setStats] = useState({
    pendingApprovals: 0,
    rejectedCount: 0,
    occupancyRate: 0,
    totalReservations: 0,
    upcoming: [],
    pending: [],
    rejected: []
  });

  const [equipments, setEquipments] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [heureDebut, setHeureDebut] = useState("");
  const [heureFin, setHeureFin] = useState("");
  const [motif, setMotif] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Équipements
        const eqRes = await axios.get(`${API_URL}/equipments`);
        const available = eqRes.data.filter(eq => eq.available);
        setEquipments(available);

        if (available.length > 0) {
          setSelectedEquipment(available[0]);
          const resRes = await axios.get(`${API_URL}/reservations/equipment/${available[0]._id}`);
          setReservations(resRes.data);
        }

        // Stats utilisateur
        const token = localStorage.getItem("token");
        if (token) {
          const statsRes = await axios.get(`${API_URL}/reservations/stats`, {
            headers: getAuthHeaders()
          });
          setStats(statsRes.data);
        }

        // Taux d'occupation
        const occupancyRes = await axios.get(`${API_URL}/reservations/weekly-occupancy`, {
          headers: getAuthHeaders()
        });
        setStats(prev => ({
          ...prev,
          occupancyRate: occupancyRes.data.occupancyRate || 0
        }));

      } catch (err) {
        console.error("Erreur chargement dashboard:", err);
        if (err.response?.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleSelectEquipment = async (eq) => {
    setSelectedEquipment(eq);
    try {
      const resRes = await axios.get(`${API_URL}/reservations/equipment/${eq._id}`);
      setReservations(resRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const openReservationModal = () => {
    if (!selectedEquipment) return alert("Sélectionnez un équipement");
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
    setModalIsOpen(true);
    setError("");
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setHeureDebut("");
    setHeureFin("");
    setMotif("");
    setError("");
  };

  const handleReserve = async (e) => {
    e.preventDefault();
    if (!selectedDate || !heureDebut || !heureFin || !motif.trim()) {
      setError("Tous les champs sont obligatoires");
      return;
    }
    if (heureFin <= heureDebut) {
      setError("L'heure de fin doit être après le début");
      return;
    }

    try {
      await axios.post(`${API_URL}/reservations`, {
        equipment: selectedEquipment._id,
        date: selectedDate,
        heureDebut,
        heureFin,
        motif: motif.trim(),
      }, {
        headers: getAuthHeaders()
      });

      alert("Réservation envoyée avec succès ! En attente d'approbation.");
      closeModal();

      // Rafraîchir stats
      const statsRes = await axios.get(`${API_URL}/reservations/stats`, { headers: getAuthHeaders() });
      setStats(statsRes.data);
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'envoi");
    }
  };

  const getDecember2025Days = () => {
    const days = [];
    const firstDay = new Date(2025, 11, 1).getDay();
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

    for (let i = 0; i < adjustedFirstDay; i++) days.push(null);

    for (let day = 1; day <= 31; day++) {
      const dateStr = `2025-12-${String(day).padStart(2, "0")}`;
      const isReserved = reservations.some(r => r.date === dateStr);
      const isToday = day === 23;
      days.push({ day, dateStr, isReserved, isToday });
    }
    return days;
  };

  const calendarDays = getDecember2025Days();
  const hours = Array.from({ length: 11 }, (_, i) => `${String(8 + i).padStart(2, "0")}:00`);

  if (loading) {
    return <div className="loading-full">Chargement du tableau de bord...</div>;
  }

  return (
    <div className="dashboard-with-sidebar">
      {/* Sidebar fixe */}
      <UserNavbar />

      {/* Contenu principal décalé */}
      <main className="page-content">
        {/* Header du dashboard */}
        <header className="dashboard-header">
          <h1>Tableau de bord</h1>
          <p>Bienvenue • Suivez vos demandes et réservations</p>
        </header>

        {/* Cartes stats */}
        <div className="stats-grid">
          <div className="stat-card pending">
            <div className="stat-title">En attente</div>
            <div className="stat-value">{stats.pendingApprovals || 0}</div>
            <div className="stat-subtitle">Demandes en cours</div>
          </div>
          <div className="stat-card occupancy">
            <div className="stat-title">Taux de la semaine</div>
            <div className="stat-value">{stats.occupancyRate}%</div>
            <div className="stat-subtitle">Occupation globale</div>
          </div>
          <div className="stat-card total">
            <div className="stat-title">Total réservations</div>
            <div className="stat-value">{stats.totalReservations || 0}</div>
            <div className="stat-subtitle">Vos demandes</div>
          </div>
        </div>

        {/* Réservations en attente */}
        <section className="pending-section">
          <h3>
            <FaHourglassHalf /> Réservations en attente d'approbation ({stats.pendingApprovals || 0})
          </h3>
          {stats.pending && stats.pending.length > 0 ? (
            <ul className="reservation-list">
              {stats.pending.map(res => (
                <li key={res._id} className="reservation-item pending">
                  <strong>{res.equipment?.name}</strong>
                  <div>{res.date} • {res.heureDebut} - {res.heureFin}</div>
                  <div className="motif">{res.motif}</div>
                  <span className="status pending">En attente</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">Aucune demande en attente d'approbation.</p>
          )}
        </section>

        {/* Réservations approuvées */}
        <section className="upcoming-section">
          <h3>
            <FaCheckCircle /> Réservations approuvées à venir
          </h3>
          {stats.upcoming && stats.upcoming.length > 0 ? (
            <ul className="reservation-list">
              {stats.upcoming.map(res => (
                <li key={res._id} className="reservation-item approved">
                  <strong>{res.equipment?.name}</strong>
                  <div>{res.date} • {res.heureDebut} - {res.heureFin}</div>
                  <div className="motif">{res.motif}</div>
                  <span className="status approved">Approuvée</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">Aucune réservation approuvée à venir.</p>
          )}
        </section>

        {/* Réservations refusées */}
        <section className="rejected-section">
          <h3>
            ❌ Réservations refusées ({stats.rejectedCount || 0})
          </h3>
          {stats.rejected && stats.rejected.length > 0 ? (
            <ul className="reservation-list">
              {stats.rejected.map(res => (
                <li key={res._id} className="reservation-item rejected">
                  <strong>{res.equipment?.name}</strong>
                  <div>{res.date} • {res.heureDebut} - {res.heureFin}</div>
                  <div className="motif">{res.motif}</div>
                  <span className="status rejected">Refusée</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">Aucune réservation refusée.</p>
          )}
        </section>

        {/* Équipements disponibles */}
        <section className="equipments-list-section">
          <h3>Équipements disponibles</h3>
          <div className="equipments-grid">
            {equipments.length > 0 ? (
              equipments.map(eq => (
                <div
                  key={eq._id}
                  className={`equipment-item ${selectedEquipment?._id === eq._id ? "selected" : ""}`}
                  onClick={() => handleSelectEquipment(eq)}
                >
                  <img
                    src={eq.photo ? `http://localhost:5000/${eq.photo.replace(/\\/g, "/")}` : "https://via.placeholder.com/300x200?text=Équipement"}
                    alt={eq.name}
                    className="eq-img"
                  />
                  <h4>{eq.name}</h4>
                  <p>{eq.description?.slice(0, 100) || "Description non disponible"}...</p>
                  <div className="eq-details">
                    <span><FaClock /> {eq.start_time || "08:00"} - {eq.end_time || "18:00"}</span>
                    <span><FaUsers /> {eq.capacity || "N/A"} pers.</span>
                  </div>
                </div>
              ))
            ) : (
              <p>Aucun équipement disponible actuellement.</p>
            )}
          </div>
        </section>

        {/* Calendrier */}
        <section className="monthly-calendar-section">
          <h3>Calendrier de disponibilité</h3>
          <div className="calendar-card">
            <div className="calendar-header">
              <h4>{selectedEquipment?.name || "Sélectionnez un équipement"}</h4>
              <span>Décembre 2025</span>
            </div>
            {selectedEquipment ? (
              <table className="monthly-calendar">
                <thead>
                  <tr>
                    <th>Dim</th><th>Lun</th><th>Mar</th><th>Mer</th><th>Jeu</th><th>Ven</th><th>Sam</th>
                  </tr>
                </thead>
                <tbody>
                  {Array(Math.ceil(calendarDays.length / 7)).fill().map((_, weekIdx) => (
                    <tr key={weekIdx}>
                      {Array(7).fill().map((_, dayIdx) => {
                        const index = weekIdx * 7 + dayIdx;
                        const day = calendarDays[index];
                        if (!day) return <td key={index}></td>;
                        return (
                          <td
                            key={index}
                            className={`day-cell ${day.isReserved ? "reserved" : "available"} ${day.isToday ? "today" : ""}`}
                          >
                            {day.day}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Sélectionnez un équipement pour voir son calendrier.</p>
            )}
            <div className="calendar-legend">
              <span className="legend-item"><span className="dot today"></span> Aujourd'hui</span>
              <span className="legend-item"><span className="dot reserved"></span> Réservé</span>
            </div>
            {selectedEquipment && (
              <button onClick={openReservationModal} className="reserve-now-btn">
                Réserver maintenant
              </button>
            )}
          </div>
        </section>
      </main>

      {/* Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="reservation-modal"
        overlayClassName="modal-overlay"
      >
        <h2>Nouvelle réservation</h2>
        <p>{selectedEquipment?.name || "Équipement"} - Créer une demande</p>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleReserve}>
          <label>Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            required
          />

          <div className="time-row">
            <div>
              <label>Heure de début</label>
              <select value={heureDebut} onChange={e => setHeureDebut(e.target.value)} required>
                <option value="">--:--</option>
                {hours.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label>Heure de fin</label>
              <select value={heureFin} onChange={e => setHeureFin(e.target.value)} required>
                <option value="">--:--</option>
                {hours.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>

          <label>Motif de la réservation</label>
          <textarea
            placeholder="Décrivez l'utilisation prévue..."
            value={motif}
            onChange={e => setMotif(e.target.value)}
            required
            rows="4"
          />

          <div className="modal-buttons">
            <button type="button" onClick={closeModal}>Annuler</button>
            <button type="submit">Soumettre la demande</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}