import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaUserCog, FaSearch, FaArrowLeft, FaEye, FaEnvelope, FaPhone, FaIdCard, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import "../styles/UserManagement.css";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [modal, setModal] = useState({ 
    show: false, 
    type: "", 
    message: "", 
    title: "" 
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/users", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des utilisateurs");
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Erreur:", error);
      setModal({
        show: true,
        type: "error",
        title: "Erreur",
        message: "Impossible de charger les utilisateurs"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/users/${userToDelete._id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la suppression");
      }

      setUsers(users.filter(u => u._id !== userToDelete._id));
      setShowDeleteModal(false);
      setUserToDelete(null);
      
      // Modal de succès pour la suppression
      setModal({
        show: true,
        type: "success",
        title: "Succès", 
        message: "Utilisateur supprimé avec succès"
      });
      
    } catch (error) {
      console.error("Erreur:", error);
      setModal({
        show: true,
        type: "error",
        title: "Erreur",
        message: error.message || "Impossible de supprimer l'utilisateur"
      });
    }
  };

  const updateUser = (updatedUser) => {
    setUsers(users.map(u => u._id === updatedUser._id ? updatedUser : u));
  };

  if (loading) return <div className="loading">Chargement des utilisateurs...</div>;

  return (
    <div className="user-management-page">
      {/* En-tête */}
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate("/admin/home")}>
          <FaArrowLeft /> Retour
        </button>
        <div className="header-content">
          <h1>Gestion des Utilisateurs</h1>
          <p>Consulter et gérer tous les utilisateurs de la plateforme</p>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="filters-section">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="role-filter"
        >
          <option value="all">Tous les rôles</option>
          <option value="admin">Administrateurs</option>
          <option value="user">Utilisateurs</option>
        </select>
      </div>

      {/* Tableau des utilisateurs */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Contact</th>
              <th>Rôle</th>
              <th>Date d'inscription</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user._id}>
                <td>
                  <div className="user-info">
                    <div className="user-avatar">
                      <FaUserCog />
                    </div>
                    <div className="user-details">
                      <strong>{user.name}</strong>
                      <span className="user-id">ID: {user.idNumber || "Non renseigné"}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="contact-info">
                    <div className="email">
                      <FaEnvelope /> {user.email}
                    </div>
                    {user.phone && (
                      <div className="phone">
                        <FaPhone /> {user.phone}
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {user.role === "admin" ? "👑 Administrateur" : "👤 Utilisateur"}
                  </span>
                </td>
                <td>
                  {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-view"
                      onClick={() => handleViewDetails(user)}
                      title="Voir détails"
                    >
                      <FaEye />
                    </button>
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(user)}
                      title="Modifier"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteClick(user)}
                      title="Supprimer"
                      disabled={user._id === JSON.parse(localStorage.getItem("user"))?._id}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="no-users">
            <FaUserCog size={48} />
            <p>Aucun utilisateur trouvé</p>
            <span>Essayez de modifier vos critères de recherche</span>
          </div>
        )}
      </div>

      {/* Modal de détails */}
      {showDetailsModal && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setShowDetailsModal(false)}
        />
      )}

      {/* Modal d'édition */}
      {showEditModal && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setShowEditModal(false)}
          onUpdate={updateUser}
          setModal={setModal}
        />
      )}

      {/* Modal de suppression */}
      {showDeleteModal && (
        <DeleteUserModal
          user={userToDelete}
          onClose={() => {
            setShowDeleteModal(false);
            setUserToDelete(null);
          }}
          onConfirm={confirmDelete}
        />
      )}

      {/* Modal de succès/erreur */}
      {modal.show && (
        <SuccessErrorModal 
          type={modal.type}
          title={modal.title}
          message={modal.message}
          onClose={() => setModal({ ...modal, show: false })}
        />
      )}
    </div>
  );
}

// Composant Modal de détails
function UserDetailsModal({ user, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content user-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Détails de l'utilisateur</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="user-profile">
          <div className="avatar">
            <FaUserCog />
          </div>
          <div className="user-info">
            <h3>{user.name}</h3>
            <span className={`role-badge large ${user.role}`}>
              {user.role === "admin" ? "👑 Administrateur" : "👤 Utilisateur"}
            </span>
          </div>
        </div>

        <div className="details-grid">
          <div className="detail-item">
            <label><FaEnvelope /> Email</label>
            <span>{user.email}</span>
          </div>
          <div className="detail-item">
            <label><FaPhone /> Téléphone</label>
            <span>{user.phone || "Non renseigné"}</span>
          </div>
          <div className="detail-item">
            <label><FaIdCard /> Numéro d'identité</label>
            <span>{user.idNumber || "Non renseigné"}</span>
          </div>
          <div className="detail-item">
            <label>Date d'inscription</label>
            <span>{new Date(user.createdAt).toLocaleDateString("fr-FR", {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </div>
          <div className="detail-item">
            <label>Dernière mise à jour</label>
            <span>{new Date(user.updatedAt).toLocaleDateString("fr-FR")}</span>
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="btn-close">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

// Composant Modal d'édition
function EditUserModal({ user, onClose, onUpdate, setModal }) {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || "",
    idNumber: user.idNumber || ""
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/users/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la modification");
      }

      const data = await response.json();
      onUpdate(data.user);
      onClose();
      
      // Modal de succès
      setModal({
        show: true,
        type: "success",
        title: "Succès",
        message: "Utilisateur modifié avec succès"
      });
      
    } catch (error) {
      console.error("Erreur:", error);
      // Modal d'erreur
      setModal({
        show: true,
        type: "error", 
        title: "Erreur",
        message: error.message || "Impossible de modifier l'utilisateur"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Modifier l'utilisateur</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nom complet</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Entrez le nom complet"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="exemple@email.com"
            />
          </div>

          <div className="form-group">
            <label>Rôle</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="user">Utilisateur</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>

          <div className="form-group">
            <label>Téléphone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+33 6 12 34 56 78"
            />
          </div>

          <div className="form-group">
            <label>Numéro d'identité</label>
            <input
              type="text"
              name="idNumber"
              value={formData.idNumber}
              onChange={handleChange}
              placeholder="Numéro CIN ou passeport"
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Annuler
            </button>
            <button type="submit" className="btn-save" disabled={isSaving}>
              {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Composant Modal de suppression
function DeleteUserModal({ user, onClose, onConfirm }) {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const isCurrentUser = user._id === currentUser?._id;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Confirmer la suppression</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {isCurrentUser ? (
          <div className="warning-message">
            <div className="warning-icon">⚠️</div>
            <h3>Action impossible</h3>
            <p>Vous ne pouvez pas supprimer votre propre compte.</p>
            <p>Demandez à un autre administrateur de effectuer cette action.</p>
          </div>
        ) : (
          <>
            <div className="user-to-delete">
              <FaUserCog />
              <div>
                <strong>{user.name}</strong>
                <span>{user.email}</span>
              </div>
            </div>

            <div className="warning-text">
              <p>Êtes-vous sûr de vouloir supprimer cet utilisateur ?</p>
              <p><strong>Cette action est irréversible.</strong> Toutes les données de cet utilisateur seront définitivement perdues.</p>
            </div>

            <div className="modal-actions">
              <button onClick={onClose} className="btn-cancel">
                Annuler
              </button>
              <button onClick={onConfirm} className="btn-delete-confirm">
                Supprimer définitivement
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Composant Modal de succès/erreur
function SuccessErrorModal({ type, title, message, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-card ${type}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon">
          {type === "success" ? (
            <FaCheckCircle />
          ) : (
            <FaTimesCircle />
          )}
        </div>
        <h2>{title}</h2>
        <p>{message}</p>
        <button 
          className={`modal-button ${type}`}
          onClick={onClose}
        >
          OK
        </button>
      </div>
    </div>
  );
}