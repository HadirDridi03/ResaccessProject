// src/pages/UserEquipmentCalendar.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/UserEquipmentCalendar.css";
import { FaCalendarAlt, FaClock, FaArrowLeft, FaHome } from "react-icons/fa";

export default function UserEquipmentCalendar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookedDates, setBookedDates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEquipment();
    loadBookings();
  }, [id]);

  const loadEquipment = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/equipment/${id}`);
      setEquipment(res.data);
    } catch (err) {
      console.error("Équipement non trouvé :", err);
      navigate("/user/equipment"); // Retour propre
    }
  };

  const loadBookings = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/bookings/equipment/${id}`);
      const dates = res.data.map(b => new Date(b.date).toISOString().split("T")[0]);
      setBookedDates(dates);
    } catch (err) {
      console.log("Aucune réservation");
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      days.push({
        day,
        date: dateStr,
        isBooked: bookedDates.includes(dateStr),
        isToday: dateStr === new Date().toISOString().split("T")[0],
      });
    }
    return days;
  };

  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  if (loading || !equipment) return <div className="loading">Chargement...</div>;

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="user-calendar-page">
      <div className="main-card">
        {/* Header */}
        <div className="calendar-header">
          <button onClick={() => navigate("/")} className="back-btn">
            <FaHome /> Accueil
          </button>
          <h1 className="page-title">
            <FaCalendarAlt /> {equipment.name}
          </h1>
        </div>

        {/* Info */}
        <div className="equipment-info">
          {equipment.photo && (
            <img
              src={`http://localhost:5000/${equipment.photo.replace(/\\/g, "/")}`}
              alt={equipment.name}
              className="equipment-thumb"
            />
          )}
          <div>
            <p><strong>Catégorie :</strong> {equipment.category}</p>
            <p><FaClock /> {equipment.start_time} - {equipment.end_time}</p>
            <p><strong>Disponibilité :</strong> 
              <span className={equipment.available ? "text-success" : "text-danger"}>
                {equipment.available ? "Disponible" : "Indisponible"}
              </span>
            </p>
          </div>
        </div>

        {/* Calendrier */}
        <div className="calendar-container">
          <div className="calendar-nav">
            <button onClick={prevMonth} className="nav-btn">Précédent</button>
            <h2>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h2>
            <button onClick={nextMonth} className="nav-btn">Suivant</button>
          </div>

          <div className="calendar-grid">
            {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map(d => (
              <div key={d} className="weekday">{d}</div>
            ))}
            {days.map((d, i) => (
              <div
                key={i}
                className={`calendar-day 
                  ${d === null ? "empty" : ""} 
                  ${d?.isToday ? "today" : ""} 
                  ${d?.isBooked ? "booked" : "available"}
                `}
              >
                {d?.day}
              </div>
            ))}
          </div>

          <div className="legend">
            <span><div className="dot available"></div> Disponible</span>
            <span><div className="dot booked"></div> Réservé</span>
            <span><div className="dot today"></div> Aujourd'hui</span>
          </div>
        </div>
      </div>
    </div>
  );
}