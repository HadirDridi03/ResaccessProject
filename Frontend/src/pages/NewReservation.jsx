// src/pages/NewReservation.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllEquipment } from "../api/equipmentApi";
import { createReservation } from "../api/reservationApi";
import WeeklyScheduler from "../components/WeeklyScheduler";
import axios from "axios";
import "../styles/NewReservation.css";
import { FaSearch, FaCalendar, FaClock, FaMapMarkerAlt } from "react-icons/fa";

export default function NewReservation() {
  const navigate = useNavigate();
  const [equipments, setEquipments] = useState([]);
  const [filteredEquipments, setFilteredEquipments] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [conflictError, setConflictError] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [reservationData, setReservationData] = useState({
    equipmentId: "",
    date: "",
    startTime: "",
    endTime: "",
    reason: ""
  });

  // Charger les équipements
  useEffect(() => {
    loadEquipments();
  }, []);

  useEffect(() => {
    const filtered = equipments.filter(eq =>
      eq.name.toLowerCase().includes(searchTerm.toLowerCase()) && eq.available
    );
    setFilteredEquipments(filtered);
  }, [searchTerm, equipments]);

  const loadEquipments = async () => {
    try {
      const data = await getAllEquipment();
      setEquipments(data);
      setFilteredEquipments(data.filter(eq => eq.available));
    } catch (err) {
      alert("Erreur lors du chargement des équipements");
    }
  };

  const handleEquipmentSelect = (equipment) => {
    setSelectedEquipment(equipment);
    setReservationData(prev => ({ ...prev, equipmentId: equipment._id }));
    setConflictError("");
    setRefreshTrigger(prev => prev + 1); // Rafraîchir le calendrier
  };

  // Vérifier les conflits en temps réel
  const checkConflict = async () => {
    const { equipmentId, date, startTime, endTime } = reservationData;
    if (!equipmentId || !date || !startTime || !endTime) {
      setConflictError("");
      return;
    }

    const start = new Date(`${date}T${startTime}:00`);
    const end = new Date(`${date}T${endTime}:00`);

    if (isNaN(start) || isNaN(end) || start >= end) {
      setConflictError("L'heure de début doit être avant la fin");
      return;
    }

    try {
      const res = await axios.get(`http://localhost:5000/api/reservations/equipment/${equipmentId}`);
      const conflict = res.data.some(r => {
        if (r.date !== date) return false;
        const rStart = new Date(`${date}T${r.heureDebut}:00`);
        const rEnd = new Date(`${date}T${r.heureFin}:00`);
        return start < rEnd && end > rStart;
      });
      setConflictError(conflict ? "Ce créneau est déjà réservé" : "");
    } catch (err) {
      console.error("Erreur vérification conflit", err);
      setConflictError("");
    }
  };

  useEffect(() => {
    const timeout = setTimeout(checkConflict, 500);
    return () => clearTimeout(timeout);
  }, [reservationData.date, reservationData.startTime, reservationData.endTime, reservationData.equipmentId]);

  // Vérifie si le formulaire est valide
  const isFormValid = () => {
    return (
      reservationData.equipmentId &&
      reservationData.date &&
      reservationData.startTime &&
      reservationData.endTime &&
      !conflictError
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      alert("Veuillez remplir tous les champs et choisir un créneau disponible.");
      return;
    }

    setLoading(true);
    try {
      await createReservation(reservationData);
      alert("Réservation confirmée !");
      setRefreshTrigger(prev => prev + 1);
      setReservationData(prev => ({
        ...prev,
        date: "",
        startTime: "",
        endTime: "",
        reason: ""
      }));
    } catch (err) {
      alert("Erreur : " + (err.response?.data?.error || "Échec de la réservation"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-reservation-page">
      <div className="reservation-container">
        <header className="reservation-header">
          <button className="back-btn" onClick={() => navigate("/user/home")}>
            Retour
          </button>
          <h1>Nouvelle Réservation</h1>
          <p>Choisissez un équipement et planifiez votre créneau</p>
        </header>

        <div className="reservation-content">
          {/* Étape 1 : Choix de l'équipement */}
          {!selectedEquipment && (
            <div className="equipment-selection">
              <h2>1. Choisir un équipement</h2>
              <div className="search-box">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Rechercher un équipement..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="equipment-grid">
                {filteredEquipments.map(eq => (
                  <div
                    key={eq._id}
                    className={`equipment-card ${selectedEquipment?._id === eq._id ? 'selected' : ''}`}
                    onClick={() => handleEquipmentSelect(eq)}
                  >
                    {eq.photo && (
                      <img
                        src={`http://localhost:5000/${eq.photo.replace(/\\/g, "/")}`}
                        alt={eq.name}
                        className="equipment-img"
                      />
                    )}
                    <div className="equipment-info">
                      <h3>{eq.name}</h3>
                      <p className="category"><FaMapMarkerAlt /> {eq.category}</p>
                      <p className="schedule"><FaClock /> {eq.start_time} - {eq.end_time}</p>
                      <div className="availability available">Disponible</div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredEquipments.length === 0 && (
                <p className="no-equipment">Aucun équipement disponible.</p>
              )}
            </div>
          )}

          {/* Étape 2 : Formulaire + Calendrier */}
          {selectedEquipment && (
            <div className="form-with-calendar">
              <h2>2. Détails de la réservation</h2>

              <form onSubmit={handleSubmit} className="reservation-form">
                <div className="form-group">
                  <label><FaCalendar /> Date</label>
                  <input
                    type="date"
                    value={reservationData.date}
                    onChange={(e) => setReservationData(prev => ({ ...prev, date: e.target.value }))}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label><FaClock /> Heure de début</label>
                    <input
                      type="time"
                      value={reservationData.startTime}
                      onChange={(e) => setReservationData(prev => ({ ...prev, startTime: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label><FaClock /> Heure de fin</label>
                    <input
                      type="time"
                      value={reservationData.endTime}
                      onChange={(e) => setReservationData(prev => ({ ...prev, endTime: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Motif de la réservation</label>
                  <textarea
                    value={reservationData.reason}
                    onChange={(e) => setReservationData(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Décrivez l'utilisation prévue..."
                    rows="3"
                  />
                </div>

                {conflictError && (
                  <div className="error-message">{conflictError}</div>
                )}

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => {
                      setSelectedEquipment(null);
                      setReservationData({ equipmentId: "", date: "", startTime: "", endTime: "", reason: "" });
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={loading || !isFormValid()}
                  >
                    {loading ? "Création..." : "Confirmer la réservation"}
                  </button>
                </div>
              </form>

              {/* Calendrier */}
              <div className="calendar-preview">
                <h3>Disponibilités de {selectedEquipment.name}</h3>
                <WeeklyScheduler
                  equipmentId={selectedEquipment._id}
                  refreshTrigger={refreshTrigger}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}