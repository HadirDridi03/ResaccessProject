// src/components/SimpleCalendar.jsx
import React, { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "../styles/ModernCalendar.css";
import axios from "axios";

export default function SimpleCalendar({ equipmentId, onDateSelect, selectedDate }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    if (equipmentId) {
      fetchReservations();
    }
  }, [equipmentId, currentDate]);

  const fetchReservations = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/reservations/equipment/${equipmentId}`);
      setReservations(res.data);
    } catch (err) {
      console.error("Erreur:", err);
      setReservations([]);
    }
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    let firstDayOfWeek = firstDay.getDay();
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    const days = [];
    
    // Jours vides au début
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        date: new Date(year, month, day)
      });
    }
    
    return days;
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isPast = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };

  const hasReservation = (date) => {
    const dateStr = formatDate(date);
    return reservations.some(r => r.date === dateStr);
  };

  const isSelected = (date) => {
    if (!selectedDate) return false;
    return formatDate(date) === selectedDate;
  };

  const handleDateClick = (dayInfo) => {
    if (!dayInfo || isPast(dayInfo.date)) return;
    if (onDateSelect) {
      onDateSelect(formatDate(dayInfo.date));
    }
  };

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const days = getDaysInMonth();

  return (
    <div className="simple-calendar">
      {/* En-tête */}
      <div className="simple-header">
        <button className="nav-btn" onClick={prevMonth}>
          <FaChevronLeft />
        </button>
        <h3 className="month-title">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <button className="nav-btn" onClick={nextMonth}>
          <FaChevronRight />
        </button>
      </div>

      {/* Jours de la semaine */}
      <div className="weekdays">
        {weekDays.map(day => (
          <div key={day} className="weekday-label">{day}</div>
        ))}
      </div>

      {/* Grille des jours */}
      <div className="days-grid">
        {days.map((dayInfo, index) => {
          if (!dayInfo) {
            return <div key={index} className="empty-day"></div>;
          }

          const classes = [
            'day',
            isToday(dayInfo.date) && 'today',
            isSelected(dayInfo.date) && 'selected',
            isPast(dayInfo.date) && 'past',
            hasReservation(dayInfo.date) && 'reserved'
          ].filter(Boolean).join(' ');

          return (
            <div
              key={index}
              className={classes}
              onClick={() => handleDateClick(dayInfo)}
            >
              {dayInfo.day}
              {hasReservation(dayInfo.date) && (
                <span className="indicator"></span>
              )}
            </div>
          );
        })}
      </div>

      {/* Légende simple */}
      <div className="simple-legend">
        <div className="legend-item">
          <span className="dot today-dot"></span>
          <span>Aujourd'hui</span>
        </div>
        <div className="legend-item">
          <span className="dot reserved-dot"></span>
          <span>Réservé</span>
        </div>
      </div>
    </div>
  );
}