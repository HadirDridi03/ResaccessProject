// src/pages/EquipmentList.jsx
import React, { useState, useEffect } from "react";
import { getAllEquipment, deleteEquipment } from "../api/equipmentApi";
import "../styles/EquipmentList.css";

export default function EquipmentList() {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEquipments();
  }, []);

  const loadEquipments = async () => {
    try {
      const data = await getAllEquipment();
      setEquipments(data);
      setLoading(false);
    } catch (err) {
      setError("Impossible de charger les équipements");
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

  if (loading) return <div className="loading">Chargement...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="equipment-list-page">
      <div className="container">
        <h1 className="page-title">Liste des Équipements</h1>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
  <a 
    href="/add"
    style={{
      background: '#1976d2',
      color: 'white',
      padding: '12px 28px',
      borderRadius: '12px',
      textDecoration: 'none',
      fontWeight: '600',
      fontSize: '16px',
      display: 'inline-block',
      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease'
    }}
    onMouseOver={(e) => e.target.style.background = '#1565c0'}
    onMouseOut={(e) => e.target.style.background = '#1976d2'}
  >
    + Ajouter un équipement
  </a>
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
                <p>
                  <strong>Heure :</strong> {eq.start_time} - {eq.end_time}
                </p>
                <p className="created-at">
                  Ajouté le {new Date(eq.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>

              <div className="equipment-actions">
                <button className="edit-btn">Modifier</button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(eq._id)}
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>

        {equipments.length === 0 && (
          <p className="no-data">Aucun équipement trouvé. Ajoutez-en un !</p>
        )}
      </div>
    </div>
  );
}