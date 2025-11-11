// src/pages/UserEquipmentList.jsx
import React, { useState, useEffect } from "react";
import { getAllEquipment } from "../api/equipmentApi";
import "../styles/UserEquipmentList.css";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaClock, FaTag, FaSignOutAlt } from "react-icons/fa";

export default function UserEquipmentList() {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadEquipments();
  }, []);

 const loadEquipments = async () => {
  try {
    const data = await getAllEquipment();
    // FILTRE SEULEMENT LES DISPONIBLES
    const availableEquipments = data.filter(eq => eq.available === true);
    setEquipments(availableEquipments);
    setLoading(false);
  } catch (err) {
    alert("Impossible de charger les équipements");
    setLoading(false);
  }
};

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="user-list-page">
      <div className="container">
        {/* Header */}
        <div className="header">
  <h1 className="page-title">Équipements Disponibles</h1>
  <button onClick={handleLogout} className="logout-btn">
    <FaSignOutAlt /> Déconnexion
  </button>
</div>
        {/* Grille */}
        <div className="equipment-grid">
          {equipments.map((eq) => (
            <div key={eq._id} className="equipment-card">
              {eq.photo ? (
                <img
                  src={`http://localhost:5000/${eq.photo.replace(/\\/g, "/")}`}
                  alt={eq.name}
                  className="equipment-img"
                />
              ) : (
                <div className="no-image">Pas d'image</div>
              )}

              <div className="equipment-info">
                <h3>{eq.name}</h3>
                <p className="category"><FaTag /> {eq.category}</p>
                <p className="time"><FaClock /> {eq.start_time} - {eq.end_time}</p>
                <div className="availability">
                  <span className={`status-dot ${eq.available ? "available" : "unavailable"}`}></span>
                  <span>{eq.available ? "Disponible" : "Indisponible"}</span>
                </div>
              </div>

              <div className="equipment-actions">
                <button
  className="action-btn"
  onClick={() => {
    if (!eq.available) {
      alert("Cet équipement est actuellement indisponible.");
      return;
    }
    navigate(`/equipment/${eq._id}/calendar`);
  }}
  disabled={!eq.available}
>
  <FaCalendarAlt /> Voir le calendrier
</button>
              </div>
            </div>
          ))}
        </div>

        {equipments.length === 0 && (
          <p className="no-data">Aucun équipement disponible pour le moment.</p>
        )}
      </div>
    </div>
  );
}