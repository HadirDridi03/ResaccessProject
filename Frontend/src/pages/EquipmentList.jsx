import React, { useState, useEffect } from "react";
import { getAllEquipment, deleteEquipment, updateEquipmentStatus } from "../api/equipmentApi";
import "../styles/EquipmentList.css";
import { useNavigate } from "react-router-dom";
import { 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaClock, 
  FaTag, 
  FaInfoCircle,  
  FaTools, 
  FaCheckCircle,
  FaImage,
  FaExclamationTriangle,
  FaWrench,
  FaCheck,
  FaTimes
} from "react-icons/fa";

export default function EquipmentList() {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEq, setSelectedEq] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState({});
  
  // États pour les modales
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    equipmentId: null,
    equipmentName: ""
  });
  
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    equipmentId: null,
    equipmentName: "",
    currentStatus: null,
    newStatus: null
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    loadEquipments();
  }, []);

  const loadEquipments = async () => {
    try {
      setLoading(true);
      const data = await getAllEquipment();
      
      // Normalisation des données
      const equipmentWithDefaultStatus = data.map(eq => ({
        ...eq,
        available: eq.available !== undefined ? eq.available : true
      }));
      
      setEquipments(equipmentWithDefaultStatus);
      setError(null);
    } catch (err) {
      console.error("Erreur détaillée lors du chargement:", err);
      
      let errorMsg = "Impossible de charger les équipements";
      if (err.message && err.message.includes("Network Error")) {
        errorMsg = "Erreur de connexion au serveur. Vérifiez votre connexion internet.";
      } else if (err.response && err.response.status === 401) {
        errorMsg = "Accès non autorisé. Veuillez vous connecter.";
      } else if (err.response && err.response.status === 404) {
        errorMsg = "Aucun équipement trouvé dans la base de données.";
      } else if (err.response && err.response.data && err.response.data.message) {
        errorMsg = err.response.data.message;
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Fonctions pour la modale de suppression
  const openDeleteModal = (id, name) => {
    setDeleteModal({
      isOpen: true,
      equipmentId: id,
      equipmentName: name
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      equipmentId: null,
      equipmentName: ""
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.equipmentId) return;
    
    try {
      await deleteEquipment(deleteModal.equipmentId);
      setEquipments(prev => prev.filter(eq => eq._id !== deleteModal.equipmentId));
      console.log(`🗑️ Équipement "${deleteModal.equipmentName}" supprimé avec succès`);
      closeDeleteModal();
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      alert(`Erreur lors de la suppression: ${err.message || "Veuillez réessayer"}`);
      closeDeleteModal();
    }
  };

  // Fonctions pour la modale de changement de statut
  const openStatusModal = (id, name, currentStatus) => {
    const newStatus = !currentStatus;
    setStatusModal({
      isOpen: true,
      equipmentId: id,
      equipmentName: name,
      currentStatus,
      newStatus
    });
  };

  const closeStatusModal = () => {
    setStatusModal({
      isOpen: false,
      equipmentId: null,
      equipmentName: "",
      currentStatus: null,
      newStatus: null
    });
  };

  const confirmStatusChange = async () => {
    if (!statusModal.equipmentId || statusModal.newStatus === null) return;
    
    try {
      setStatusUpdating(prev => ({ ...prev, [statusModal.equipmentId]: true }));
      
      await updateEquipmentStatus(statusModal.equipmentId, statusModal.newStatus);
      
      setEquipments(prevEquipments => 
        prevEquipments.map(eq => 
          eq._id === statusModal.equipmentId ? { ...eq, available: statusModal.newStatus } : eq
        )
      );
      
      console.log(`✅ Équipement marqué comme ${statusModal.newStatus ? 'disponible' : 'en maintenance'}`);
      closeStatusModal();
      
    } catch (err) {
      console.error("Erreur lors du changement de statut:", err);
      
      let errorMessage = "Erreur lors du changement de statut";
      if (err.message && err.message.includes("Network Error")) {
        errorMessage = "❌ Impossible de se connecter au serveur";
      } else if (err.response && err.response.status === 401) {
        errorMessage = "🔒 Action réservée aux administrateurs";
      } else if (err.response && err.response.status === 404) {
        errorMessage = "📦 Équipement non trouvé";
      }
      
      alert(errorMessage);
      closeStatusModal();
    } finally {
      setStatusUpdating(prev => ({ ...prev, [statusModal.equipmentId]: false }));
    }
  };

  const openDetails = (eq) => setSelectedEq(eq);
  const closeDetails = () => setSelectedEq(null);

  const getStatusBadgeClass = (isAvailable) => {
    return isAvailable ? "available" : "maintenance";
  };

  const getStatusText = (isAvailable) => {
    return isAvailable ? "Disponible" : "En maintenance";
  };

  const getStatusIcon = (isAvailable) => {
    return isAvailable ? <FaCheckCircle /> : <FaTools />;
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("fr-FR", {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "Date inconnue";
    }
  };

  if (loading) {
    return (
      <div className="equipment-list-page">
        <div className="container">
          <div className="loading">
            <FaWrench className="spinning" style={{ fontSize: '48px', marginBottom: '20px' }} />
            <p>Chargement des équipements...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="equipment-list-page">
        <div className="container">
          <div className="error">
            <FaExclamationTriangle style={{ fontSize: '48px', marginBottom: '20px', color: '#ea4335' }} />
            <h3>Erreur de chargement</h3>
            <p>{error}</p>
            <button 
              onClick={loadEquipments}
              className="retry-btn"
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                backgroundColor: '#4285f4',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="equipment-list-page">
      <div className="container">
        {/* Header corrigé avec bouton à gauche et titre centré */}
        <div className="page-header">
          <div className="header-top">
            <button
              onClick={() => navigate("/admin/home")}
              className="back-home-btn"
              title="Retour à l'accueil"
            >
              ← Retour
            </button>
            <h1 className="page-title">Liste des Équipements</h1>
          </div>
          
          <div className="page-stats">
            <span className="stat-item">
              Total : <strong>{equipments.length}</strong>
            </span>
            <span className="stat-item">
              Disponibles : <strong className="available-count">
                {equipments.filter(eq => eq.available).length}
              </strong>
            </span>
            <span className="stat-item">
              Maintenance : <strong className="maintenance-count">
                {equipments.filter(eq => !eq.available).length}
              </strong>
            </span>
          </div>
        </div>

        <div className="equipment-grid">
          {equipments.map((eq) => (
            <div key={eq._id} className="equipment-card">
              <div className="card-header">
                <h3 className="equipment-title">{eq.name}</h3>
                <div className="equipment-category">
                  <FaTag /> {eq.category || "Non catégorisé"}
                </div>
              </div>

              <div className="card-image">
                {eq.photo ? (
                  <img
                    src={`http://localhost:5000/${eq.photo.replace(/\\/g, "/")}`}
                    alt={eq.name}
                    className="equipment-img"
                    loading="lazy"
                  />
                ) : (
                  <div className="no-image">
                    <FaImage className="no-image-icon" />
                    <span>Pas d'image disponible</span>
                  </div>
                )}
              </div>

              <div className="card-status">
                <div className={`status-badge ${getStatusBadgeClass(eq.available)}`}>
                  <span className={`status-dot ${getStatusBadgeClass(eq.available)}`}></span>
                  {getStatusText(eq.available)}
                </div>
              </div>

              {eq.start_time && eq.end_time && (
                <div className="card-schedule">
                  <FaClock /> {eq.start_time} - {eq.end_time}
                </div>
              )}

              <div className="card-actions">
                <button 
                  className="action-button button-details" 
                  onClick={() => openDetails(eq)}
                  type="button"
                  title="Voir les détails"
                >
                  <FaEye />
                  <span>Détails</span>
                </button>
                
                <button 
                  className={`action-button button-status ${getStatusBadgeClass(eq.available)} ${statusUpdating[eq._id] ? 'updating' : ''}`}
                  onClick={() => openStatusModal(eq._id, eq.name, eq.available)}
                  type="button"
                  disabled={statusUpdating[eq._id]}
                  title={eq.available ? "Mettre en maintenance" : "Rendre disponible"}
                >
                  {statusUpdating[eq._id] ? (
                    <FaWrench className="spinning" />
                  ) : (
                    getStatusIcon(eq.available)
                  )}
                  <span>
                    {statusUpdating[eq._id] ? 'Changement...' : getStatusText(eq.available)}
                  </span>
                </button>
                
                <button 
                    className="action-button button-edit" 
                    onClick={() => navigate(`/admin/equipment/edit/${eq._id}`)}
                    type="button"
                    title="Modifier l'équipement"
                >
                  <FaEdit />
                  <span>Modifier</span>
                </button>
                
                <button 
                  className="action-button button-delete" 
                  onClick={() => openDeleteModal(eq._id, eq.name)}
                  type="button"
                  title="Supprimer l'équipement"
                >
                  <FaTrash />
                  <span>Supprimer</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {equipments.length === 0 && (
          <div className="no-data">
            <FaExclamationTriangle />
            <p>Aucun équipement trouvé</p>
            <button 
              onClick={() => navigate("/admin/add-equipment")}
              className="add-first-equipment"
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                backgroundColor: '#34a853',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Ajouter le premier équipement
            </button>
          </div>
        )}
      </div>

      {/* Modal de détails - LE BOUTON "MODIFIER" EST CORRIGÉ ICI */}
      {selectedEq && (
        <div className="modal-overlay" onClick={closeDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeDetails} type="button">×</button>
            
            <div className="modal-header">
              <h2>{selectedEq.name}</h2>
              <div className={`modal-status ${getStatusBadgeClass(selectedEq.available)}`}>
                {getStatusIcon(selectedEq.available)} {getStatusText(selectedEq.available)}
              </div>
            </div>

            {selectedEq.photo && (
              <img
                src={`http://localhost:5000/${selectedEq.photo.replace(/\\/g, "/")}`}
                alt={selectedEq.name}
                className="modal-img"
              />
            )}

            <div className="modal-body">
              <div className="modal-field">
                <strong>Catégorie :</strong>
                <span>{selectedEq.category || "Non spécifiée"}</span>
              </div>
              
              {selectedEq.start_time && selectedEq.end_time && (
                <div className="modal-field">
                  <strong>Horaires :</strong>
                  <span>{selectedEq.start_time} - {selectedEq.end_time}</span>
                </div>
              )}
              
              <div className="modal-field">
                <strong>Statut :</strong>
                <span className={`status-text ${getStatusBadgeClass(selectedEq.available)}`}>
                  {getStatusIcon(selectedEq.available)} {getStatusText(selectedEq.available)}
                </span>
              </div>
              
              <div className="modal-field">
                <strong>Description :</strong>
              </div>
              <div className="modal-description">
                {selectedEq.description || "Aucune description fournie"}
              </div>
              
              <div className="created-at">
                <FaInfoCircle />
                <span>Ajouté le {formatDate(selectedEq.createdAt)}</span>
              </div>
            </div>

            <div className="modal-actions">
              {/* CORRECTION ICI : ajout de /admin/ devant le chemin */}
              <button 
                className="modal-btn edit-modal-btn"
                onClick={() => {
                  closeDetails();
                  navigate(`/admin/equipment/edit/${selectedEq._id}`);
                }}
              >
                <FaEdit /> Modifier
              </button>
              <button 
                className="modal-btn close-modal-btn"
                onClick={closeDetails}
              >
                <FaCheck /> Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {deleteModal.isOpen && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirmer la suppression</h2>
              <div className="warning-icon">
                <FaExclamationTriangle />
              </div>
            </div>
            
            <div className="modal-body">
              <p className="warning-text">
                Êtes-vous sûr de vouloir supprimer <strong>"{deleteModal.equipmentName}"</strong> ?
              </p>
              <p className="warning-subtext">
                Cette action est irréversible et supprimera définitivement l'équipement.
              </p>
            </div>
            
            <div className="modal-actions confirm-actions">
              <button 
                className="modal-btn cancel-btn"
                onClick={closeDeleteModal}
              >
                <FaTimes /> Annuler
              </button>
              <button 
                className="modal-btn delete-confirm-btn"
                onClick={confirmDelete}
              >
                <FaTrash /> Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de changement de statut */}
      {statusModal.isOpen && (
        <div className="modal-overlay" onClick={closeStatusModal}>
          <div className="modal-content status-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Changer le statut</h2>
              <div className={`status-icon ${statusModal.newStatus ? 'available-icon' : 'maintenance-icon'}`}>
                {statusModal.newStatus ? <FaCheckCircle /> : <FaTools />}
              </div>
            </div>
            
            <div className="modal-body">
              <p className="status-text">
                Voulez-vous marquer l'équipement <strong>"{statusModal.equipmentName}"</strong> comme
              </p>
              <div className={`status-display ${statusModal.newStatus ? 'available' : 'maintenance'}`}>
                <span className="status-dot"></span>
                <span className="status-label">
                  {statusModal.newStatus ? 'DISPONIBLE' : 'EN MAINTENANCE'}
                </span>
              </div>
              <p className="status-warning">
                {statusModal.newStatus 
                  ? 'Cet équipement sera à nouveau visible et réservable.'
                  : 'Cet équipement ne sera plus disponible pour les réservations.'
                }
              </p>
            </div>
            
            <div className="modal-actions status-actions">
              <button 
                className="modal-btn cancel-btn"
                onClick={closeStatusModal}
              >
                <FaTimes /> Annuler
              </button>
              <button 
                className={`modal-btn confirm-status-btn ${statusModal.newStatus ? 'available-btn' : 'maintenance-btn'}`}
                onClick={confirmStatusChange}
              >
                {statusModal.newStatus ? <FaCheckCircle /> : <FaTools />}
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}