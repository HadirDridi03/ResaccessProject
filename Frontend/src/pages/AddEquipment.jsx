// src/pages/AddEquipment.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createEquipment, getEquipmentById, updateEquipment } from "../api/equipmentApi";
import "../styles/AddEquipment.css";
import illustration from "../assets/desk-illustration.png";
import { FaCalendar, FaCamera, FaChevronDown } from "react-icons/fa";

export default function AddEquipment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "Salle",
    description: "",
    photo: null,
    customCategory: "",
  });

  // CORRECTION ICI : on retire loadEquipment des dépendances
  useEffect(() => {
    if (id) {
      setIsEditing(true);
      loadEquipment();
    }
  }, [id]); // ← SEULEMENT [id] ! Plus de loadEquipment ici

  const loadEquipment = async () => {
    try {
      const eq = await getEquipmentById(id);
      setFormData({
        name: eq.name || "",
        category: eq.category || "Salle",
        description: eq.description || "",
        photo: null,
        customCategory: "",
      });
      if (eq.photo) {
        setPreview(`http://localhost:5000/${eq.photo.replace(/\\/g, "/")}`);
      }
    } catch (err) {
      alert("Erreur lors du chargement");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      const file = files[0];
      setFormData((prev) => ({ ...prev, photo: file }));
      setPreview(file ? URL.createObjectURL(file) : null);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Le nom est requis");
      return;
    }

    setIsSubmitting(true);
    const data = new FormData();
    data.append("name", formData.name);

    const finalCategory =
      formData.category === "Autre" && formData.customCategory?.trim()
        ? formData.customCategory.trim()
        : formData.category;
    data.append("category", finalCategory);

    data.append("description", formData.description);
    if (formData.photo) data.append("photo", formData.photo);

    try {
      if (isEditing) {
        await updateEquipment(id, data);
        alert("Équipement modifié !");
      } else {
        await createEquipment(data);
        alert("Équipement ajouté !");
      }
      navigate("/equipment"); // Retour à la liste admin
    } catch (err) {
      alert("Erreur : " + (err.response?.data?.error || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-equipment-page">
      <div className="main-card">
        {/* Header */}
        <div className="content-header">
          <div className="logo-container">
            <FaCalendar className="logo-icon" />
            <span className="logo-text">ResAccess</span>
          </div>
          <h1 className="main-title">
            {isEditing ? "Modifier l’équipement" : "Ajouter un nouvel équipement"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="main-form">
          <div className="form-layout">
            {/* COLONNE GAUCHE */}
            <div className="left-column">
              {/* Nom + Catégorie */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div className="input-group">
                  <label>Nom de l’équipement</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Projecteur Salle numéro 3"
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Catégorie</label>
                  <div className="select-wrapper">
                    <select name="category" value={formData.category} onChange={handleChange}>
                      <option value="Salle">Salle</option>
                      <option value="Projecteur">Projecteur</option>
                      <option value="Ordinateur">Ordinateur</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>

                  {formData.category === "Autre" && (
                    <div style={{ marginTop: "12px" }}>
                      <input
                        type="text"
                        name="customCategory"
                        value={formData.customCategory}
                        onChange={handleChange}
                        placeholder="Précisez la catégorie (ex: Imprimante...)"
                        style={{
                          width: "100%",
                          padding: "12px 15px",
                          borderRadius: "10px",
                          border: "2px solid #ddd",
                          fontSize: "15px",
                          outline: "none",
                          transition: "border 0.3s ease",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "#4285f4")}
                        onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Image Upload */}
              <div className="image-upload-container">
                <input type="file" accept="image/*" onChange={handleChange} id="photo" hidden />
                <label htmlFor="photo" className="image-btn">
                  <FaCamera className="icon-img" />
                  <span>Ajouter une image</span>
                </label>
                {preview && (
                  <div style={{ marginTop: "15px", textAlign: "center" }}>
                    <img
                      src={preview}
                      alt="Aperçu"
                      style={{
                        maxHeight: "150px",
                        borderRadius: "12px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="input-group" style={{ marginTop: "20px" }}>
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Ajoutez une description détaillée..."
                  rows="4"
                />
              </div>
            </div>

            {/* COLONNE DROITE - Illustration */}
            <div className="illustration-side">
              <div className="illustration-placeholder">
                <img src={illustration} alt="Illustration" className="illustration-img" />
              </div>
            </div>
          </div>

          {/* Boutons */}
          <div className="buttons-footer">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/admin/home")}
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button type="submit" className="save-btn" disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : isEditing ? "Enregistrer" : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}