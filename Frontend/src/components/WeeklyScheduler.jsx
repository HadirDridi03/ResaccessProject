// src/components/WeeklyScheduler.jsx
import React, { useEffect, useState } from "react";
import { FaCircle } from "react-icons/fa";
import "../styles/WeeklyScheduler.css";
import axios from "axios";

export default function WeeklyScheduler({ equipmentId, onBack }) {
  const [weekDates, setWeekDates] = useState([]);
  const [bookings, setBookings] = useState({}); // { "2025-11-11": ["08:00", "09:00"], ... }

  // Générer la semaine actuelle
  useEffect(() => {
    const today = new Date();
    const startOfWeek = today.getDate() - today.getDay() + 1; // Lundi
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
        `http://localhost:5000/api/bookings/equipment/${equipmentId}?start=${start}&end=${end}`
      );

      const bookingMap = {};
      res.data.forEach(b => {
        const date = b.date.split("T")[0];
        if (!bookingMap[date]) bookingMap[date] = [];
        bookingMap[date].push(b.time);
      });
      setBookings(bookingMap);
    } catch (err) {
      console.error("Erreur lors du chargement des réservations :", err);
    }
  };

  // Créneaux horaires (8h à 18h)
  const hours = Array.from({ length: 11 }, (_, i) => `${8 + i}:00`);

  const handleCellClick = (dateStr, hour) => {
    const isBooked = bookings[dateStr]?.includes(hour);
    if (isBooked) {
      alert(`Déjà réservé à ${hour} le ${dateStr}`);
    } else {
      alert(`Réserver ${hour} le ${dateStr}`);
      // Ici tu peux ouvrir un modal de réservation
    }
  };

  return (
    <div className="weekly-scheduler">
      <button className="back-btn" onClick={onBack}>← Retour</button>
      <table>
        <thead>
          <tr>
            <th>Heure</th>
            {weekDates.map(d => (
              <th key={d.toISOString()}>
                {d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" })}
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
                    <FaCircle color={isBooked ? "red" : "green"} />
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
