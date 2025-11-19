// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaArrowLeft, FaTrashAlt } from "react-icons/fa";
import "../styles/Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", idNumber: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      setFormData({
        name: storedUser.name || "",
        email: storedUser.email || "",
        phone: storedUser.phone || "",
        idNumber: storedUser.idNumber || "",
      });
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data));
        setUser(data);
        alert("Profil mis à jour !"); 
      } else {
        alert(data.message || "Erreur");
      }
    } catch (err) {
      alert("Erreur serveur");
    } finally {
      setIsSaving(false);
    }
  };

  // === SUPPRESSION DU COMPTE AVEC DIALOGBOX ===
  const handleDeleteAccount = async () => {
    setShowDeleteDialog(false); // Ferme la dialog après action
    try {
      const res = await fetch("http://localhost:5000/api/auth/profile", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (res.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        alert("Votre compte a été supprimé définitivement.");
        navigate("/login");
      } else {
        const error = await res.json();
        alert(error.message || "Impossible de supprimer le compte.");
      }
    } catch (err) {
      alert("Erreur serveur lors de la suppression.");
    }
  };

  if (!user) return <div className="loading">Chargement...</div>;

  return (
    <div className="profile-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Retour
      </button>

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar"><FaUser /></div>
          <h1>Mon Profil</h1>
          <p className="role-badge">
            {user.role === "admin" ? "Administrateur" : "Utilisateur"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="input-group">
            <label>Nom complet</label>
            <input name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Email</label>
            <input name="email" type="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Téléphone</label>
            <input name="phone" value={formData.phone} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Numéro CIN</label>
            <input name="idNumber" value={formData.idNumber} onChange={handleChange} />
          </div>

          <button type="submit" className="save-btn" disabled={isSaving}>
            {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </form>

        <div className="delete-section">
          <button
            type="button"
            className="delete-btn"
            onClick={() => setShowDeleteDialog(true)}
          >
            <FaTrashAlt /> Supprimer mon compte
          </button>

          {/* === DIALOGBOX DE CONFIRMATION === */}
          {showDeleteDialog && (
            <div className="delete-dialog-overlay">
              <div className="delete-dialog">
                <h3>Confirmation de suppression</h3>
                <p>
                  Êtes-vous ABSOLUMENT sûr de vouloir supprimer votre compte ?<br />
                  Cette action est irréversible.
                </p>
                <div className="delete-actions">
                  <button onClick={handleDeleteAccount} className="confirm-delete">
                    Oui, supprimer
                  </button>
                  <button onClick={() => setShowDeleteDialog(false)} className="cancel-delete">
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}