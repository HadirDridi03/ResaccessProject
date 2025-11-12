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
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/equipment/${id}`);
        setEquipment(res.data);
      } catch (err) {
        console.error("Équipement non trouvé :", err);
        navigate("/user/equipment");
        return;
      }

      try {
        const res2 = await axios.get(`http://localhost:5000/api/bookings/equipment/${id}`);
        const dates = res2.data.map(b => new Date(b.date).toISOString().split("T")[0]);
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
      {!showCalendar && (
        <div className="equipment-details">
          <button className="back-btn" onClick={() => navigate("/user/equipment")}>
            ← Retour
          </button>

          <h1>{equipment.name}</h1>

          {equipment.photo && (
            <img
              src={`http://localhost:5000/${equipment.photo.replace(/\\/g, "/")}`}
              alt={equipment.name}
              className="equipment-thumb"
            />
          )}

          <p><strong>Catégorie :</strong> {equipment.category}</p>
          <p><strong>Disponibilité :</strong> {equipment.available ? "Disponible" : "Indisponible"}</p>

          <button
            className="view-calendar-btn"
            onClick={() => setShowCalendar(true)}
            disabled={!equipment.available}
          >
            Voir le calendrier
          </button>
        </div>
      )}

      {showCalendar && (
        <WeeklyScheduler
          equipmentId={id}
          bookedDates={bookedDates}
          onBack={() => setShowCalendar(false)}
        />
      )}
    </div>
  );
}
