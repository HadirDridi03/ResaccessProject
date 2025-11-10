import React, { useState } from "react";
import "../styles/AddEquipment.css";
import illustration from "../assets/desk-illustration.png";
// L'illustration originale n'est pas fournie. Pour une reproduction 100% identique,
// l'utilisateur devra fournir l'image exacte. Nous utilisons un placeholder.

export default function AddEquipment() {
  const [formData, setFormData] = useState({
    name: "Projecteur Salle numéro 3",
    category: "Salle",
    available: true,
    startTime: "",
    endTime: "",
    description: "Ajoutez une description détaillée de l'équipement (emplacement, utilisation, remarques...)",
    image: null,
  });

  const [preview, setPreview] = useState(null);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Équipement ajouté avec succès !");
    console.log(formData);
  };

  return (
    <div className="add-equipment-page">
      <div className="main-card">
        {/* 🟦 En-tête centré */}
        <div className="content-header">
          <div className="logo-container">
            <span className="logo-icon">📅</span>
            <span className="logo-text">ResAccess</span>
          </div>
          <h1 className="main-title">Ajouter un nouvel équipement</h1>
        </div>

        <form onSubmit={handleSubmit} className="main-form">
          <div className="form-layout">
            {/* Colonne Gauche */}
            <div className="form-column left-column">
              <div className="input-group">
                <label htmlFor="name">Nom de l’équipement</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder=""
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
                  style={{ display: 'none' }}
                />
                <label htmlFor="img-upload" className="image-btn">
                  <span className="icon-img">🖼️</span> Ajouter une image
                </label>
                {preview && <img src={preview} alt="preview" className="preview" />}
              </div>

              <div className="time-row">
                <div className="input-group time-input">
                  <label>Horaire début</label>
                  <div className="time-input-wrapper">
                    <input
                      type="text"
                      placeholder="HH : HH"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                    />
                    <span className="time-icon">⌚</span>
                  </div>
                </div>
                <div className="input-group time-input">
                  <label>Horaire fin</label>
                  <div className="time-input-wrapper">
                    <input
                      type="text"
                      placeholder="HH : HH"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                    />
                    <span className="time-icon">⌚</span>
                  </div>
                </div>
              </div>

              <div className="input-group description-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Ajoutez une description détaillée de l’équipement (emplacement, utilisation, remarques...)"
                />
              </div>
            </div>

            {/* Colonne Droite */}
            <div className="form-column right-column">
              <div className="input-group category-group">
                <label htmlFor="category">Catégorie</label>
                <div className="select-wrapper">
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="Salle">Salle</option>
                    <option value="Projecteur">Projecteur</option>
                    <option value="Ordinateur">Ordinateur</option>
                    <option value="Autre">Autre</option>
                  </select>
                  <span className="select-icon">☰</span>
                </div>
              </div>

              <div className="illustration-side">
                {/* Placeholder pour l'illustration */}
                <div className="illustration-placeholder">
                  {/* L'image est une illustration complexe. Nous allons la simuler avec un fond bleu clair */}
                  <img src={illustration} alt="Illustration" className="illustration-img" />
                </div>
              </div>
            </div>
          </div>

          {/* Boutons Annuler/Enregistrer - positionnés en bas à droite de la carte */}
          <div className="buttons-footer">
            <button type="button" className="cancel-btn">
              Annuler
            </button>
            <button type="submit" className="save-btn">
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
