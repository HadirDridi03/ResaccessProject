// src/components/WeeklyScheduler.jsx
import React, { useEffect, useState } from "react";
import { FaCircle } from "react-icons/fa";
import "../styles/WeeklyScheduler.css";
import axios from "axios";

export default function WeeklyScheduler({ equipmentId, refreshTrigger }) {
  const [weekDates, setWeekDates] = useState([]);
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      week.push(d);
    }
    setWeekDates(week);
    if (equipmentId) fetchReservations(equipmentId);
  }, [equipmentId, refreshTrigger]);

  const fetchReservations = async (id) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/reservations/equipment/${id}`);
      setReservations(res.data);
    } catch (err) {
      console.error("Erreur:", err);
    }
  };

  const hours = Array.from({ length: 11 }, (_, i) => `${8 + i}:00`);

  const isSlotReserved = (dateStr, hour) => {
    return reservations.some(res => {
      if (res.date !== dateStr) return false;
      const [h] = hour.split(":");
      const hourNum = parseInt(h, 10);
      const [startH] = res.heureDebut.split(":").map(Number);
      const [endH] = res.heureFin.split(":").map(Number);
      return hourNum >= startH && hourNum < endH;
    });
  };

  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="weekly-scheduler">
      <div className="table-container">
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
                <td className="time-cell">{hour}</td>
                {weekDates.map(day => {
                  const dateStr = formatLocalDate(day);
                  const reserved = isSlotReserved(dateStr, hour);
                  return (
                    <td
                      key={dateStr + hour}
                      className={reserved ? "reserved" : "available"}
                      style={{ cursor: "default" }}
                    >
                      <FaCircle color={reserved ? "#e74c3c" : "#27ae60"} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}