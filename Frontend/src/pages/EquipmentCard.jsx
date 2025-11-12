// src/pages/EquipmentCard.jsx
import React from "react";
import "../styles/EquipmentCard.css";

export default function EquipmentCard({ equipment, onViewCalendar }) {
  return (
    <div className="equipment-card">
      {equipment.photo && (
        <img
          src={`http://localhost:5000/${equipment.photo.replace(/\\/g, "/")}`}
          alt={equipment.name}
          className="equipment-thumb"
        />
      )}
      <h3>{equipment.name}</h3>
      <p>Catégorie : {equipment.category}</p>
      <p>
        {equipment.start_time} - {equipment.end_time}
      </p>
      <p>
        Disponibilité :{" "}
        <span className={equipment.available ? "text-success" : "text-danger"}>
          {equipment.available ? "Disponible" : "Indisponible"}
        </span>
      </p>
      <button
        onClick={() => onViewCalendar(equipment._id)}
        disabled={!equipment.available}
      >
        Voir le calendrier
      </button>
    </div>
  );
}
