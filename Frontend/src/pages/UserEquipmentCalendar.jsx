// src/pages/UserEquipmentCalendar.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import WeeklyScheduler from "../components/WeeklyScheduler";
import "../styles/UserEquipmentCalendar.css";
import { FaArrowLeft, FaCalendarAlt, FaTag, FaInfoCircle, FaClock } from "react-icons/fa";

export default function UserEquipmentCalendar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Charger l'équipement
        const equipmentRes = await axios.get(`http://localhost:5000/api/equipments/${id}`);
        setEquipment(equipmentRes.data);

        // 2. Charger les réservations
        try {
          const reservationsRes = await axios.get(`http://localhost:5000/api/reservations/equipment/${id}`);
          setBookedDates(reservationsRes.data);
        } catch (reservationErr) {
          console.log("Aucune réservation trouvée ou erreur:", reservationErr.message);
          setBookedDates([]);
        }
      } catch (err) {
        console.error("Erreur chargement équipement:", err);
        setError("Équipement non trouvé");
        // Retour à la liste après 2 secondes
        setTimeout(() => {
          navigate("/user/equipment");
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleBack = () => {
    navigate("/user/equipment"); // Retour à la liste des équipements
  };

  const handleReserve = () => {
    navigate("/reservation/new"); // Aller à la page de réservation
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement du calendrier...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>❌ {error}</h2>
        <p>Redirection vers la liste des équipements...</p>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="not-found">
        <h2>Équipement introuvable</h2>
        <button onClick={handleBack} className="back-btn">
          <FaArrowLeft /> Retour à la liste
        </button>
      </div>
    );
  }

  return (
    <div className="user-equipment-calendar-page">
      {/* En-tête */}
      <header className="calendar-header">
        <div className="header-top">
          <button className="back-btn" onClick={handleBack}>
            <FaArrowLeft /> Retour
          </button>
          <h1>Calendrier des réservations</h1>
          {equipment.available && (
            <button className="reserve-btn" onClick={handleReserve}>
              <FaCalendarAlt /> Réserver
            </button>
          )}
        </div>

        {/* Carte d'information de l'équipement */}
        <div className="equipment-card-summary">
          {equipment.photo && (
            <img
              src={`http://localhost:5000/${equipment.photo.replace(/\\/g, "/")}`}
              alt={equipment.name}
              className="equipment-main-img"
            />
          )}
          
          <div className="equipment-details">
            <h2>{equipment.name}</h2>
            
            <div className="detail-row">
              <FaTag className="detail-icon" />
              <span className="detail-label">Catégorie:</span>
              <span className="detail-value">{equipment.category}</span>
            </div>
            
            {equipment.start_time && equipment.end_time && (
              <div className="detail-row">
                <FaClock className="detail-icon" />
                <span className="detail-label">Horaires:</span>
                <span className="detail-value">{equipment.start_time} - {equipment.end_time}</span>
              </div>
            )}
            
            <div className="detail-row">
              <FaInfoCircle className="detail-icon" />
              <span className="detail-label">Statut:</span>
              <span className={`status-badge ${equipment.available ? 'available' : 'maintenance'}`}>
                {equipment.available ? "✅ Disponible" : "🛠️ En maintenance"}
              </span>
            </div>
            
            {equipment.description && (
              <div className="equipment-description">
                <p><strong>Description:</strong></p>
                <p>{equipment.description}</p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Section principale du calendrier */}
      <main className="calendar-main">
        <div className="calendar-section-header">
          <h2>
            <FaCalendarAlt /> Disponibilités hebdomadaires
          </h2>
          <p className="calendar-instructions">
            Les créneaux réservés apparaissent en rouge. Sélectionnez un créneau disponible pour réserver.
          </p>
        </div>

        <div className="calendar-wrapper">
          {equipment.available ? (
            <div className="weekly-scheduler-container">
              <WeeklyScheduler
                equipmentId={id}
                bookedDates={bookedDates}
              />
              
              {/* Légende */}
              <div className="calendar-legend">
                <div className="legend-item">
                  <span className="legend-dot available"></span>
                  <span>Disponible</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot booked"></span>
                  <span>Réservé</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot maintenance"></span>
                  <span>Maintenance</span>
                </div>
              </div>
              
              {/* Bouton de réservation */}
              <div className="reservation-action">
                <button className="primary-reserve-btn" onClick={handleReserve}>
                  <FaCalendarAlt /> Faire une réservation
                </button>
                <p className="reservation-note">
                  Pour réserver, cliquez sur le bouton ci-dessus ou sélectionnez un créneau dans le calendrier.
                </p>
              </div>
            </div>
          ) : (
            <div className="unavailable-message">
              <div className="warning-icon">⚠️</div>
              <h3>Cet équipement est temporairement indisponible</h3>
              <p>L'équipement est actuellement en maintenance. Vous ne pouvez pas effectuer de réservation pour le moment.</p>
              <button onClick={handleBack} className="back-to-list-btn">
                <FaArrowLeft /> Retourner à la liste des équipements
              </button>
            </div>
          )}
        </div>

        {/* Informations supplémentaires */}
        <div className="additional-info">
          <div className="info-card">
            <h3>📋 Instructions</h3>
            <ul>
              <li>Le calendrier montre les disponibilités pour la semaine en cours</li>
              <li>Les créneaux rouges sont déjà réservés</li>
              <li>Cliquez sur "Réserver" pour choisir une date spécifique</li>
              <li>Les réservations sont soumises à validation</li>
            </ul>
          </div>
          
          <div className="info-card">
            <h3>⏰ Conditions d'utilisation</h3>
            <ul>
              <li>Réservation maximum: 4 heures par jour</li>
              <li>Annulation possible jusqu'à 24h avant</li>
              <li>Présentation de la carte étudiante requise</li>
              <li>Retour de l'équipement dans l'état initial</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Pied de page */}
      <footer className="calendar-footer">
        <p>
          <strong>Besoin d'aide ?</strong> Contactez l'administration au 01 23 45 67 89
        </p>
        <p className="footer-note">
          Système de réservation ResAccess • Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}
        </p>
      </footer>
    </div>
  );
}