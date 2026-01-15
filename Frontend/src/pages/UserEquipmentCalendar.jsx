import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import SimpleCalendar from "../components/ModernCalendar";
import WeeklyScheduler from "../components/WeeklyScheduler";
import UserNavbar from "../components/UserNavbar";
import "../styles/UserEquipmentCalendar.css";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCalendarWeek,
  FaTimes,
  FaClock,
  FaTag,
  FaInfoCircle,
} from "react-icons/fa";

const API_URL = "http://localhost:5000/api";

export default function UserEquipmentCalendar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("month");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    heureDebut: "",
    heureFin: "",
    motif: "",
  });
  const [reservationError, setReservationError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
const [errorModalMessage, setErrorModalMessage] = useState("");



  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    fetchEquipment();
  }, [id]);

  const fetchEquipment = async () => {
    try {
      const res = await axios.get(`${API_URL}/equipments/${id}`);
      setEquipment(res.data);
    } catch (err) {
      console.error("Erreur:", err);
      setError("Équipement non trouvé");
      setTimeout(() => navigate("/user/home"), 3000);
    } finally {
      setLoading(false);
    }
  };

  const openReservationModal = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    setFormData({ ...formData, date: todayStr });
    setReservationError("");
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setReservationError("");
    setFormData({ date: "", heureDebut: "", heureFin: "", motif: "" });
  };

  const handleDateSelect = (dateStr) => {
    setFormData({ ...formData, date: dateStr });
  };

  const handleSubmitReservation = async (e) => {
    e.preventDefault();
    if (
      !formData.date ||
      !formData.heureDebut ||
      !formData.heureFin ||
      !formData.motif.trim()
    ) {
      setReservationError("Tous les champs sont obligatoires");
      return;
    }
    if (formData.heureFin <= formData.heureDebut) {
      setReservationError("L'heure de fin doit être après l'heure de début");
      return;
    }
    try {
      await axios.post(
        `${API_URL}/reservations`,
        {
          equipment: id,
          date: formData.date,
          heureDebut: formData.heureDebut,
          heureFin: formData.heureFin,
          motif: formData.motif.trim(),
        },
        { headers: getAuthHeaders() }
      );
      setShowSuccessModal(true);
      closeModal();

    } catch (err) {
  const message =
    err.response?.data?.error ||
    "Erreur lors de la soumission de la réservation";

  if (message === "Ce créneau est déjà réservé") {
    setErrorModalMessage(message);
    setShowErrorModal(true);
  } else {
    setReservationError(message);
  }
}

  };

  const hours = Array.from({ length: 11 }, (_, i) => {
    const h = 8 + i;
    return `${String(h).padStart(2, "0")}:00`;
  });

  if (loading) {
    return (
      <div className="loading-full">
        <div className="spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div className="simple-error">
        <h2>❌ {error || "Équipement introuvable"}</h2>
        <p>Redirection vers le tableau de bord...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-with-sidebar">
    <UserNavbar />

    <main className="page-content">
      {/* Header bleu élégant */}
      <header className="equipment-calendar-header">
        <button className="back-btn" onClick={() => navigate("/user/equipment")}>
          <FaArrowLeft /> Retour
        </button>

        <div className="header-title">
          <h1>{equipment.name}</h1>
          <p className="equipment-category">
            <FaTag /> Catégorie : {equipment.category || "Autre"}
          </p>
        </div>

        {equipment.available && (
          <button className="reserve-btn" onClick={openReservationModal}>
            <FaCalendarAlt /> Réserver
          </button>
        )}
      </header>

      {/* Infos statut + description */}
      <div className="equipment-info-bar">
        <div className="equipment-status">
          <FaInfoCircle /> Statut : 
          <span className={`status-badge ${equipment.available ? "available" : "maintenance"}`}>
            {equipment.available ? "Disponible" : "En maintenance"}
          </span>
        </div>

        {equipment.description && (
          <p className="equipment-description">{equipment.description}</p>
        )}
      </div>

      {/* Toggle Mois/Semaine */}
      <div className="view-toggle">
        <button
          className={`toggle-btn ${viewMode === "month" ? "active" : ""}`}
          onClick={() => setViewMode("month")}
        >
          <FaCalendarAlt /> Mois
        </button>
        <button
          className={`toggle-btn ${viewMode === "week" ? "active" : ""}`}
          onClick={() => setViewMode("week")}
        >
          <FaCalendarWeek /> Semaine
        </button>
      </div>

      {/* Calendrier */}
      <div className="calendar-wrapper">
        {viewMode === "month" ? (
          <SimpleCalendar
            key={id}
            equipmentId={id}
            onDateSelect={handleDateSelect}
            selectedDate={formData.date}
          />
        ) : (
          <WeeklyScheduler equipmentId={id} />
        )}
      </div>

      {/* Info box */}
      {equipment.available ? (
        <div className="info-box">
          <p>✓ Cet équipement est disponible à la réservation</p>
          <p>• Les jours avec un point ont déjà des réservations</p>
        </div>
      ) : (
        <div className="warning-box">
          <p>⚠️ Cet équipement est actuellement en maintenance</p>
        </div>
      )}

        {/* Modal de réservation */}
        {modalIsOpen && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Nouvelle réservation pour {equipment.name}</h2>
                <button className="modal-close" onClick={closeModal}>
                  <FaTimes />
                </button>
              </div>

              {reservationError && (
                <div className="error-banner">{reservationError}</div>
              )}

              <div className="modern-calendar-wrapper">
                <SimpleCalendar
                  key={id + "-modal"}
                  equipmentId={id}
                  onDateSelect={handleDateSelect}
                  selectedDate={formData.date || new Date().toISOString().split("T")[0]}
                />
              </div>

              <form onSubmit={handleSubmitReservation} className="reservation-form">
                <div className="form-group">
                  <label>Date sélectionnée</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Heure de début</label>
                    <select
                      value={formData.heureDebut}
                      onChange={(e) => setFormData({ ...formData, heureDebut: e.target.value })}
                      required
                    >
                      <option value="">--:--</option>
                      {hours.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Heure de fin</label>
                    <select
                      value={formData.heureFin}
                      onChange={(e) => setFormData({ ...formData, heureFin: e.target.value })}
                      required
                    >
                      <option value="">--:--</option>
                      {hours.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Motif</label>
                  <textarea
                    value={formData.motif}
                    onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                    required
                    rows="3"
                    placeholder="Décrivez le motif de votre réservation..."
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={closeModal} className="btn-cancel">
                    Annuler
                  </button>
                  <button type="submit" className="btn-submit">
                    Soumettre la réservation
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
       {showSuccessModal && (
  <div className="modal-overlay">
    <div className="modal-card">
      <h2>Réservation envoyée ✅</h2>
      <p style={{ marginTop: "12px", color: "#555" }}>
        Votre réservation a été soumise avec succès.<br />
        Elle est en attente d’approbation.
      </p>

      <button
        className="btn-submit"
        style={{ marginTop: "25px", width: "100%" }}
        onClick={() => setShowSuccessModal(false)}
      >
        OK
      </button>
    </div>
  </div>
)}
{showErrorModal && (
  <div className="modal-overlay">
    <div className="modal-card error">
      <h2>Créneau indisponible ❌</h2>

      <p style={{ marginTop: "12px", color: "#555", textAlign: "center" }}>
        {errorModalMessage}
        <br />
        Veuillez choisir un autre créneau horaire.
      </p>

      <button
        className="btn-submit"
        style={{ marginTop: "25px", width: "100%" }}
        onClick={() => setShowErrorModal(false)}
      >
        OK
      </button>
    </div>
  </div>
)}

      </main>
    </div>
  );
}