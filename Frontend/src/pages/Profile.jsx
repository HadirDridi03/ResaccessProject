// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaArrowLeft, FaTrashAlt, FaCheckCircle } from "react-icons/fa";
import "../styles/Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", idNumber: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false); // Nouvelle dialog

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
      // Met à jour le localStorage
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);

      // Affiche la dialogbox de succès
      setShowSuccessDialog(true);

      // Redirection automatique après 1,8 seconde (temps de voir le message)
      setTimeout(() => {
        setShowSuccessDialog(false);
        
        // Redirection selon le rôle
        if (data.role === "admin") {
          navigate("/admin/home");
        } else {
          navigate("/user/home");
        }
      }, 1800);

    } else {
      alert(data.message || "Erreur lors de la mise à jour");
    }
  } catch (err) {
    alert("Erreur serveur");
  } finally {
    setIsSaving(false);
  }
};
  const handleDeleteAccount = async () => {
    setShowDeleteDialog(false);
    try {
      const res = await fetch("http://localhost:5000/api/auth/profile", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (res.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        alert("Compte supprimé avec succès");
        navigate("/login");
      } else {
        alert("Impossible de supprimer le compte");
      }
    } catch (err) {
      alert("Erreur serveur");
    }
  };

  if (!user) return <div className="loading">Chargement...</div>;

  return (
    <div className="profile-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        Retour
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
          <button type="button" className="delete-btn" onClick={() => setShowDeleteDialog(true)}>
            Supprimer mon compte
          </button>
        </div>
      </div>

      {/* DIALOGBOX SUPPRESSION */}
      {showDeleteDialog && (
        <div className="delete-dialog-overlay" onClick={() => setShowDeleteDialog(false)}>
          <div className="delete-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Confirmation de suppression</h3>
            <p>Êtes-vous ABSOLUMENT sûr de vouloir supprimer votre compte ?<br />Cette action est irréversible.</p>
            <div className="delete-actions">
              <button onClick={handleDeleteAccount} className="confirm-delete">Oui, supprimer</button>
              <button onClick={() => setShowDeleteDialog(false)} className="cancel-delete">Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* DIALOGBOX SUCCÈS (après modification) */}
      {showSuccessDialog && (
        <div className="success-dialog-overlay">
          <div className="success-dialog">
            <FaCheckCircle className="success-icon" />
            <h3>Modifications enregistrées !</h3>
            <p>Votre profil a été mis à jour avec succès.</p>
          </div>
        </div>
      )}
    </div>
  );
}