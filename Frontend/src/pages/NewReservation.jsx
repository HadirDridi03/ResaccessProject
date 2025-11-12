// src/pages/NewReservation.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllEquipment } from "../api/equipmentApi";
import { createReservation } from "../api/reservationApi";
import "../styles/NewReservation.css";
import { FaSearch, FaCalendar, FaClock, FaMapMarkerAlt } from "react-icons/fa";

export default function NewReservation() {
  const navigate = useNavigate();
  const [equipments, setEquipments] = useState([]);
  const [filteredEquipments, setFilteredEquipments] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Données de réservation
  const [reservationData, setReservationData] = useState({
    equipmentId: "",
    date: "",
    startTime: "",
    endTime: "",
    reason: ""
  });

  useEffect(() => {
    loadEquipments();
  }, []);

  useEffect(() => {
    const filtered = equipments.filter(eq =>
      eq.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      eq.available === true
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
    setReservationData(prev => ({
      ...prev,
      equipmentId: equipment._id
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reservationData.equipmentId || !reservationData.date || 
        !reservationData.startTime || !reservationData.endTime) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setLoading(true);
    try {
      await createReservation(reservationData);
      alert("✅ Réservation créée avec succès !");
      navigate("/user/home");
    } catch (err) {
      alert("❌ Erreur : " + (err.response?.data?.error || "Erreur lors de la réservation"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-reservation-page">
      <div className="reservation-container">
        <header className="reservation-header">
          <button className="back-btn" onClick={() => navigate("/user/home")}>
            ← Retour
          </button>
          <h1>Nouvelle Réservation</h1>
          <p>Choisissez un équipement et planifiez votre créneau</p>
        </header>

        <div className="reservation-content">
          {/* Étape 1 : Sélection de l'équipement */}
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
              {filteredEquipments.map(equipment => (
                <div
                  key={equipment._id}
                  className={`equipment-card ${selectedEquipment?._id === equipment._id ? 'selected' : ''}`}
                  onClick={() => handleEquipmentSelect(equipment)}
                >
                  {equipment.photo && (
                    <img
                      src={`http://localhost:5000/${equipment.photo.replace(/\\/g, "/")}`}
                      alt={equipment.name}
                      className="equipment-img"
                    />
                  )}
                  <div className="equipment-info">
                    <h3>{equipment.name}</h3>
                    <p className="category">
                      <FaMapMarkerAlt /> {equipment.category}
                    </p>
                    <p className="schedule">
                      <FaClock /> {equipment.start_time} - {equipment.end_time}
                    </p>
                    <div className="availability available">
                      ● Disponible
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredEquipments.length === 0 && (
              <p className="no-equipment">Aucun équipement disponible correspondant à votre recherche.</p>
            )}
          </div>

          {/* Étape 2 : Formulaire de réservation */}
          {selectedEquipment && (
            <div className="reservation-form-section">
              <h2>2. Détails de la réservation</h2>
              
              <form onSubmit={handleSubmit} className="reservation-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <FaCalendar /> Date
                    </label>
                    <input
                      type="date"
                      value={reservationData.date}
                      onChange={(e) => setReservationData(prev => ({
                        ...prev,
                        date: e.target.value
                      }))}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <FaClock /> Heure de début
                    </label>
                    <input
                      type="time"
                      value={reservationData.startTime}
                      onChange={(e) => setReservationData(prev => ({
                        ...prev,
                        startTime: e.target.value
                      }))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <FaClock /> Heure de fin
                    </label>
                    <input
                      type="time"
                      value={reservationData.endTime}
                      onChange={(e) => setReservationData(prev => ({
                        ...prev,
                        endTime: e.target.value
                      }))}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Motif de la réservation</label>
                  <textarea
                    value={reservationData.reason}
                    onChange={(e) => setReservationData(prev => ({
                      ...prev,
                      reason: e.target.value
                    }))}
                    placeholder="Décrivez l'utilisation prévue de l'équipement..."
                    rows="3"
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => navigate("/user/home")}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={loading}
                  >
                    {loading ? "Création..." : "Confirmer la réservation"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}