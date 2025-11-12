// src/pages/EquipmentCard.jsx
import React from "react";
import "../styles/EquipmentCard.css"; // Assure-toi du bon chemin

export default function EquipmentCard({ equipment, onViewCalendar }) {
  return (
    <div className={`equipment-card ${!equipment.available ? "unavailable" : ""}`}>
      {/* Image */}
      {equipment.photo ? (
        <img
          src={`http://localhost:5000/${equipment.photo.replace(/\\/g, "/")}`}
          alt={equipment.name}
          className="equipment-img"
        />
      ) : (
        <div className="equipment-img placeholder">Pas de photo</div>
      )}

      {/* Contenu */}
      <div className="equipment-info">
        <h3>{equipment.name}</h3>

        <div className="category">
          <span>Catégorie</span>
          <span>{equipment.category}</span>
        </div>

        <div className="time">
          <span>Horaires</span>
          <span>
            {equipment.start_time} - {equipment.end_time}
          </span>
        </div>

        <div className="availability">
          <span className={`status-dot ${equipment.available ? "available" : "unavailable"}`}></span>
          <span>{equipment.available ? "Disponible" : "Indisponible"}</span>
        </div>

        <button
          className="action-btn"
          onClick={() => onViewCalendar(equipment._id)}
          disabled={!equipment.available}
        >
          Voir le calendrier
        </button>
      </div>
    </div>
  );
}