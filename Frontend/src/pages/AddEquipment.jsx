// src/pages/AddEquipment.jsx
import React, { useState } from "react";
import { createEquipment } from "../api/equipmentApi";
import "../styles/AddEquipment.css";
import illustration from "../assets/desk-illustration.png";

// 🎨 Import des icônes React
import { FaCalendarAlt, FaClock, FaCamera, FaChevronDown } from "react-icons/fa";

export default function AddEquipment() {
  const [formData, setFormData] = useState({
    name: "",
    category: "Salle",
    available: true,
    startTime: "",
    endTime: "",
    description: "",
    image: null,
  });

  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Le nom de l'équipement est requis");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createEquipment(formData);
      alert(`Équipement ajouté avec succès ! ID: ${result.equipment._id}`);

      setFormData({
        name: "",
        category: "Salle",
        available: true,
        startTime: "",
        endTime: "",
        description: "",
        image: null,
      });
      setPreview(null);
    } catch (error) {
      const msg = error.response?.data?.error || error.message;
      alert("Erreur : " + msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm("Annuler ?")) {
      setFormData({
        name: "",
        category: "Salle",
        available: true,
        startTime: "",
        endTime: "",
        description: "",
        image: null,
      });
      setPreview(null);
    }
  };

  return (
    <div className="add-equipment-page">
      <div className="main-card">
        {/* En-tête */}
        <div className="content-header">
          <div className="logo-container">
            <FaCalendarAlt className="logo-icon" />
            <span className="logo-text">ResAccess</span>
          </div>
          <h1 className="main-title">Ajouter un nouvel équipement</h1>
        </div>

        <form onSubmit={handleSubmit} className="main-form">
          <div className="form-layout">
            {/* COLONNE GAUCHE */}
            <div className="form-column left-column">
              <div className="input-group">
                <label>Nom de l'équipement *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ex: Projecteur HD"
                  required
                />
              </div>

              <div className="availability-row">
                <label className="availability-label">Disponible</label>
                <label className="switch">
                  <input
                    type="checkbox"
                    name="available"
                    checked={formData.available}
                    onChange={handleChange}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="image-upload-container">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImage}
                  id="img-upload"
                  style={{ display: "none" }}
                />
                <label htmlFor="img-upload" className="image-btn">
                  <FaCamera className="icon-img" /> Ajouter une image
                </label>
                {preview && (
                  <div className="preview-container">
                    <img src={preview} alt="Aperçu" className="preview" />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => {
                        setPreview(null);
                        setFormData((prev) => ({ ...prev, image: null }));
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              <div className="time-row">
                <div className="input-group time-input">
                  <label>Horaire début</label>
                  <div className="time-input-wrapper">
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                    />
                    <FaClock className="time-icon" />
                  </div>
                </div>
                <div className="input-group time-input">
                  <label>Horaire fin</label>
                  <div className="time-input-wrapper">
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                    />
                    <FaClock className="time-icon" />
                  </div>
                </div>
              </div>

              <div className="input-group description-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Emplacement, usage, remarques..."
                  rows="4"
                />
              </div>
            </div>

            {/* COLONNE DROITE */}
            <div className="form-column right-column">
              <div className="input-group category-group">
                <label>Catégorie</label>
                <div className="select-wrapper">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="Salle">Salle</option>
                    <option value="Projecteur">Projecteur</option>
                    <option value="Ordinateur">Ordinateur</option>
                    <option value="Autre">Autre</option>
                  </select>
                  <FaChevronDown className="select-icon" />
                </div>
              </div>

              <div className="illustration-side">
                <img
                  src={illustration}
                  alt="Bureau"
                  className="illustration-img"
                />
              </div>
            </div>
          </div>

          {/* BOUTONS */}
          <div className="buttons-footer">
            <button
              type="button"
              className="cancel-btn"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="save-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>

          {/* Lien retour */}
          <div style={{ textAlign: "center", marginTop: "25px" }}>
            <a
              href="/"
              style={{
                color: "#1976d2",
                textDecoration: "none",
                fontWeight: "600",
              }}
            >
              ← Retour à la liste
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
