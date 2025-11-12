// src/pages/UserEquipmentCalendar.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import WeeklyScheduler from "../components/WeeklyScheduler";
import "../styles/UserEquipmentCalendar.css";

export default function UserEquipmentCalendar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/equipments/${id}`);
        setEquipment(res.data);
      } catch (err) {
        console.error("Équipement non trouvé :", err);
        navigate("/user/equipment");
        return;
      }

      try {
        const res2 = await axios.get(`http://localhost:5000/api/reservations/equipment/${id}`);
        const dates = res2.data.map(b => new Date(b.startTime).toISOString().split("T")[0]);
        setBookedDates(dates);
      } catch (err) {
        console.log("Aucune réservation trouvée");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  if (loading) return <div className="loading">Chargement...</div>;
  if (!equipment) return <div>Équipement introuvable</div>;

  return (
    <div className="user-equipment-page">
      {/* En-tête avec photo, nom, retour */}
      <div className="equipment-header">
        <button className="back-btn" onClick={() => navigate("/user/equipment")}>
          ← Retour
        </button>

        <div className="equipment-info">
          <h1>{equipment.name}</h1>
          {equipment.photo && (
            <img
              src={`http://localhost:5000/${equipment.photo.replace(/\\/g, "/")}`}
              alt={equipment.name}
              className="equipment-thumb-large"
            />
          )}
          <p><strong>Catégorie :</strong> {equipment.category}</p>
          <p>
            <strong>Disponibilité :</strong>{" "}
            <span className={equipment.available ? "text-success" : "text-danger"}>
              {equipment.available ? "Disponible" : "Indisponible"}
            </span>
          </p>
        </div>
      </div>

      {/* Calendrier DIRECT */}
      <div className="calendar-section">
        <h2>Calendrier de réservation</h2>
        {equipment.available ? (
          <WeeklyScheduler
            equipmentId={id}
            bookedDates={bookedDates}
            onBack={() => {}} // inutile ici
          />
        ) : (
          <p className="unavailable-msg">
            Cet équipement est actuellement indisponible.
          </p>
        )}
      </div>
    </div>
  );
}
