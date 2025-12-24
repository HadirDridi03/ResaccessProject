// src/pages/UserEquipmentList.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaFilter, FaSignOutAlt, FaArrowLeft } from "react-icons/fa";
import { getAllEquipment } from "../api/equipmentApi";
import UserNavbar from "../components/UserNavbar";
import "../styles/UserEquipmentList.css";

export default function UserEquipmentList() {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Chargement des équipements
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

  // Filtrage et recherche
  const filteredEquipments = equipments.filter((eq) => {
    const matchesSearch =
      !searchTerm ||
      eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      availabilityFilter === "all" ||
      (availabilityFilter === "available" && eq.available) ||
      (availabilityFilter === "unavailable" && !eq.available);

    return matchesSearch && matchesFilter;
  });

  // Navigation
  const handleViewCalendar = (id) => {
    navigate(`/user/equipment/${id}/calendar`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleBack = () => {
    navigate("/user/home");
  };

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="dashboard-with-sidebar">
      <UserNavbar />

      <main className="page-content">
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
          <h1>Équipements disponibles</h1>
          <p>Liste complète des équipements pour réservation. Utilisez les filtres pour affiner votre recherche.</p>
        </header>

        {/* Section de filtres */}
        <div className="filters-section">
          <div className="search-input">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher par nom ou description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-select">
            <FaFilter className="filter-icon" />
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="available">Disponible</option>
              <option value="unavailable">Indisponible</option>
            </select>
          </div>
        </div>

        {/* Liste des équipements */}
        <div className="equipment-grid">
          {filteredEquipments.length > 0 ? (
            filteredEquipments.map((eq) => (
              <div key={eq._id} className="equipment-card">
                <img
                  src={
                    eq.photo
                      ? `http://localhost:5000/${eq.photo.replace(/\\/g, "/")}`
                      : "https://via.placeholder.com/300x200?text=Équipement"
                  }
                  alt={eq.name}
                  className="eq-card-img"
                />
                <div className="eq-card-content">
                  <h3>{eq.name}</h3>
                  <p>{eq.description || "Pas de description disponible"}</p>
                  <div className="eq-card-details">
                    <span>Catégorie: {eq.category || "N/A"}</span>
                    <span>Horaires: {eq.start_time || "08:00"} - {eq.end_time || "18:00"}</span>
                    <span>Statut: {eq.available ? "Disponible" : "Indisponible"}</span>
                  </div>
                  <button
                    onClick={() => handleViewCalendar(eq._id)}
                    className="view-calendar-btn"
                    disabled={!eq.available}
                  >
                    Voir le calendrier
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="no-data">Aucun équipement trouvé. Essayez d'ajuster vos filtres.</p>
          )}
        </div>
      </main>
    </div>
  );
}
