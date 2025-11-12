// src/pages/UserEquipmentList.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaArrowLeft } from "react-icons/fa";
import EquipmentCard from "./EquipmentCard";
import { getAllEquipment } from "../api/equipmentApi";
import "../styles/UserEquipmentList.css";

export default function UserEquipmentList() {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadEquipments = async () => {
      try {
        const data = await getAllEquipment();
        setEquipments(data);
      } catch (err) {
        alert("Impossible de charger les équipements");
      } finally {
        setLoading(false);
      }
    };
    loadEquipments();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleViewCalendar = (id) => {
    navigate(`/equipment/${id}/calendar`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const filteredEquipments = equipments.filter(eq => {
    if (categoryFilter !== "all" && eq.category !== categoryFilter) return false;
    if (availabilityFilter !== "all") {
      return availabilityFilter === "available" ? eq.available : !eq.available;
    }
    if (searchTerm && !eq.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="user-list-page">
      <header className="page-header">
        <div className="header-left">
          <button className="back-btn" onClick={handleBack}>
            <FaArrowLeft /> Retour
          </button>
        </div>
        <div className="header-right">
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Déconnexion
          </button>
        </div>
      </header>

      <div className="page-message">
        <h2>Découvrez et réservez les équipements disponibles pour votre utilisation</h2>
      </div>

      <div className="filters-section">
        <input
          type="text"
          placeholder="Rechercher par nom..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="all">Toutes les catégories</option>
          <option value="informatique">Informatique</option>
          <option value="sport">Sport</option>
          <option value="laboratoire">Laboratoire</option>
        </select>
        <select value={availabilityFilter} onChange={(e) => setAvailabilityFilter(e.target.value)}>
          <option value="all">Toutes</option>
          <option value="available">Disponible</option>
          <option value="unavailable">Indisponible</option>
        </select>
      </div>

      <div className="equipment-grid">
        {filteredEquipments.length ? (
          filteredEquipments.map(eq => (
            <EquipmentCard
              key={eq._id}
              equipment={eq}
              onViewCalendar={handleViewCalendar}
            />
          ))
        ) : (
          <p className="no-data">Aucun équipement disponible selon vos critères.</p>
        )}
      </div>
    </div>
  );
}
