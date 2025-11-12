import React, { useState, useEffect } from "react";
import { getAllEquipment, deleteEquipment } from "../api/equipmentApi";
import "../styles/EquipmentList.css";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaEye, FaClock, FaTag, FaInfoCircle } from "react-icons/fa";

export default function EquipmentList() {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEq, setSelectedEq] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadEquipments();
  }, []);

  const loadEquipments = async () => {
    try {
      const data = await getAllEquipment();
      setEquipments(data);
    } catch (err) {
      setError("Impossible de charger les équipements");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet équipement ?")) return;
    try {
      await deleteEquipment(id);
      setEquipments(equipments.filter(eq => eq._id !== id));
      alert("Équipement supprimé !");
    } catch (err) {
      alert("Erreur lors de la suppression");
    }
  };

  const openDetails = (eq) => setSelectedEq(eq);
  const closeDetails = () => setSelectedEq(null);

  if (loading) return <div className="loading">Chargement...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="equipment-list-page">
      <div className="container">
        <h1 className="page-title">Liste des Équipements</h1>

        <div className="add-button-container">
          <button onClick={() => navigate("/equipment/add")} className="add-btn">+ Ajouter un équipement</button>
        </div>

        <div className="equipment-grid">
          {equipments.map((eq) => (
            <div key={eq._id} className="equipment-card">
              {eq.photo ? (
                <img
                  src={`http://localhost:5000/${eq.photo.replace(/\\/g, "/")}`}
                  alt={eq.name}
                  className="equipment-img"
                />
              ) : (
                <div className="no-image">Pas d'image</div>
              )}

              <div className="equipment-info">
                <h3>{eq.name}</h3>
                <p className="category"><FaTag /> {eq.category}</p>
                <p className="time"><FaClock /> {eq.start_time} - {eq.end_time}</p>
                <div className="availability">
                  <span className={`status-dot ${eq.available ? "available" : "unavailable"}`}></span>
                  <span className="status-text">{eq.available ? "Disponible" : "Indisponible"}</span>
                </div>
              </div>

              <div className="equipment-actions">
                <button className="action-btn details" onClick={() => openDetails(eq)}><FaEye /> Détails</button>
                <button className="action-btn edit" onClick={() => navigate(`/add/${eq._id}`)}><FaEdit /> Modifier</button>
                <button className="action-btn delete" onClick={() => handleDelete(eq._id)}><FaTrash /> Supprimer</button>
              </div>
            </div>
          ))}
        </div>

        {equipments.length === 0 && <p className="no-data">Aucun équipement trouvé. Ajoutez-en un !</p>}
      </div>

      {selectedEq && (
        <div className="modal-overlay" onClick={closeDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeDetails}>×</button>
            <h2>{selectedEq.name}</h2>
            {selectedEq.photo && (
              <img
                src={`http://localhost:5000/${selectedEq.photo.replace(/\\/g, "/")}`}
                alt={selectedEq.name}
                className="modal-img"
              />
            )}
            <div className="modal-details">
              <p><strong>Catégorie :</strong> {selectedEq.category}</p>
              <p><strong>Horaires :</strong> {selectedEq.start_time} - {selectedEq.end_time}</p>
              <p><strong>Disponibilité :</strong> 
                <span className={selectedEq.available ? "text-success" : "text-danger"}>
                  {selectedEq.available ? "Disponible" : "Indisponible"}
                </span>
              </p>
              <p><strong>Description :</strong></p>
              <p className="description">{selectedEq.description || "Aucune description"}</p>
              <p className="created-at"><FaInfoCircle /> Ajouté le {new Date(selectedEq.createdAt).toLocaleDateString("fr-FR")}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
