// src/components/WeeklyScheduler.jsx
import React, { useEffect, useState } from "react";
import { FaCircle } from "react-icons/fa";
import "../styles/WeeklyScheduler.css";
import axios from "axios";

export default function WeeklyScheduler({ equipmentId, onBack }) {
  const [weekDates, setWeekDates] = useState([]);
  const [bookings, setBookings] = useState({});

  useEffect(() => {
    const today = new Date();
    const startOfWeek = today.getDate() - today.getDay() + 1;
    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(startOfWeek + i);
      week.push(d);
    }
    setWeekDates(week);
    fetchBookings(week);
  }, [equipmentId]);

  const fetchBookings = async (week) => {
    try {
      const start = week[0].toISOString().split("T")[0];
      const end = week[6].toISOString().split("T")[0];
      const res = await axios.get(
        `http://localhost:5000/api/reservations/equipment/${equipmentId}?start=${start}&end=${end}` // CORRIGÉ
      );

      const bookingMap = {};
      res.data.forEach(b => {
        const date = b.startTime.split("T")[0];
        const time = new Date(b.startTime).toTimeString().slice(0, 5);
        if (!bookingMap[date]) bookingMap[date] = [];
        if (!bookingMap[date].includes(time)) {
          bookingMap[date].push(time);
        }
      });
      setBookings(bookingMap);
    } catch (err) {
      console.error("Erreur lors du chargement des réservations :", err);
    }
  };

  const hours = Array.from({ length: 11 }, (_, i) => `${8 + i}:00`);

  const handleCellClick = (dateStr, hour) => {
    const isBooked = bookings[dateStr]?.includes(hour);
    if (isBooked) {
      alert(`Déjà réservé à ${hour} le ${dateStr}`);
    } else {
      const confirm = window.confirm(`Réserver ${hour} le ${dateStr} ?`);
      if (confirm) {
        // Ici tu peux appeler une API pour créer la réservation
        alert("Réservation en cours de développement !");
      }
    }
  };

  return (
    <div className="weekly-scheduler">
      <button className="back-btn" onClick={onBack}>← Retour</button>
      <h3>Calendrier hebdomadaire</h3>
      <table>
        <thead>
          <tr>
            <th>Heure</th>
            {weekDates.map(d => (
              <th key={d.toISOString()}>
                {d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hours.map(hour => (
            <tr key={hour}>
              <td>{hour}</td>
              {weekDates.map(day => {
                const dateStr = day.toISOString().split("T")[0];
                const isBooked = bookings[dateStr]?.includes(hour);
                return (
                  <td
                    key={dateStr + hour}
                    className={isBooked ? "booked" : "available"}
                    onClick={() => handleCellClick(dateStr, hour)}
                  >
                    <FaCircle color={isBooked ? "#e74c3c" : "#27ae60"} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
