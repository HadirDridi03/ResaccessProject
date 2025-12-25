// src/components/WeeklyScheduler.jsx
import React, { useEffect, useState } from "react";
import { FaCircle } from "react-icons/fa";
import "../styles/WeeklyScheduler.css";
import axios from "axios";

export default function WeeklyScheduler({ equipmentId, refreshTrigger }) {
  const [weekDates, setWeekDates] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date();
    const startOfWeek = new Date(today);

    // Lundi de la semaine en cours
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // dimanche → lundi précédent
    startOfWeek.setDate(today.getDate() + diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      week.push(d);
    }
    setWeekDates(week);

    if (equipmentId) {
      fetchReservations(equipmentId);
    } else {
      setLoading(false);
    }
  }, [equipmentId, refreshTrigger]);

  const fetchReservations = async (id) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/reservations/equipment/${id}`
      );
      setReservations(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des réservations:", err);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const hours = Array.from({ length: 11 }, (_, i) => {
    const h = 8 + i;
    return `${String(h).padStart(2, "0")}:00`;
  });

  // Vérifier si un créneau est réservé
  const isSlotReserved = (dateStr, hour) => {
    return reservations.some((res) => {
      if (res.date !== dateStr) return false;

      const hourNum = parseInt(hour.split(":")[0], 10);
      const startH = parseInt(res.heureDebut.split(":")[0], 10);
      const endH = parseInt(res.heureFin.split(":")[0], 10);

      // Intervalle [début, fin[
      return hourNum >= startH && hourNum < endH;
    });
  };

  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  if (loading) {
    return (
      <div className="scheduler-loading">
        <div className="spinner"></div>
        <p>Chargement du calendrier...</p>
      </div>
    );
  }

  return (
    <div className="weekly-scheduler">
      <div className="scheduler-header">
        <h3>
          Semaine du{" "}
          {weekDates[0]?.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </h3>
      </div>

      <div className="table-container">
        <table className="scheduler-table">
          <thead>
            <tr>
              <th className="time-header">Heure</th>
              {weekDates.map((d) => (
                <th key={d.toISOString()} className="day-header">
                  <div className="day-name">
                    {d.toLocaleDateString("fr-FR", { weekday: "short" })}
                  </div>
                  <div className="day-number">
                    {d.toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                    })}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map((hour) => (
              <tr key={hour}>
                <td className="time-cell">{hour}</td>
                {weekDates.map((day) => {
                  const dateStr = formatLocalDate(day);
                  const reserved = isSlotReserved(dateStr, hour);

                  return (
                    <td
                      key={dateStr + hour}
                      className={`slot-cell ${
                        reserved ? "reserved" : "available"
                      }`}
                      title={reserved ? "Réservé" : "Disponible"}
                    >
                      <FaCircle
                        className="status-icon"
                        color={reserved ? "#e74c3c" : "#27ae60"}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {reservations.length === 0 && (
        <div className="no-reservations-message">
          Aucune réservation pour cette semaine
        </div>
      )}
    </div>
  );
}
