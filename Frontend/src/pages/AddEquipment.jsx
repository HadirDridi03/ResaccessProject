// src/pages/AddEquipment.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  createEquipment,
  getEquipmentById,
  updateEquipment,
} from "../api/equipmentApi";
import "../styles/AddEquipment.css";
import illustration from "../assets/desk-illustration.png";
import {
  FaCalendar,
  FaCamera,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

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

  const [errors, setErrors] = useState({
    name: "",
  });

  const [modal, setModal] = useState({
    show: false,
    type: "",
    title: "",
    message: "",
  });

  /* ========================= Charger l'équipement (édition) ========================= */
  const loadEquipment = useCallback(async () => {
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
    } catch (error) {
      console.error("Erreur chargement équipement :", error);
      setModal({
        show: true,
        type: "error",
        title: "Erreur",
        message: "Impossible de charger l'équipement",
      });
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      setIsEditing(true);
      loadEquipment();
    }
  }, [id, loadEquipment]);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files[0];
      if (file) {
        console.log("📸 Fichier sélectionné:", {
          name: file.name,
          size: file.size,
          type: file.type
        });
        
        // Vérification du type de fichier
        if (!file.type.startsWith('image/')) {
          setModal({
            show: true,
            type: "error",
            title: "Format invalide",
            message: "Veuillez sélectionner une image (JPG, PNG, etc.)"
          });
          return;
        }
        
        // Vérification de la taille (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setModal({
            show: true,
            type: "error",
            title: "Fichier trop volumineux",
            message: "L'image ne doit pas dépasser 5MB"
          });
          return;
        }
        
        setFormData((prev) => ({ ...prev, photo: file }));
        setPreview(URL.createObjectURL(file));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));

      if (name === "name" && errors.name) {
        setErrors((prev) => ({ ...prev, name: "" }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setErrors({ name: "Veuillez entrer le nom de l'équipement." });
      return;
    }

    setIsSubmitting(true);
    setErrors({ name: "" });

    try {
      console.log("🔄 Préparation des données...");
      
      const finalCategory =
        formData.category === "Autre" && formData.customCategory.trim()
          ? formData.customCategory.trim()
          : formData.category;

      // Création du FormData
      const data = new FormData();
      data.append("name", formData.name.trim());
      data.append("category", finalCategory);
      data.append("description", formData.description || "");
      
      // Ajout de la photo si elle existe
      if (formData.photo) {
        console.log("📤 Ajout photo au FormData:", formData.photo.name);
        data.append("photo", formData.photo);
      } else {
        console.log("📸 Pas de nouvelle photo sélectionnée");
      }

      // Debug: Afficher le contenu du FormData
      console.log("📦 Contenu FormData:");
      for (let pair of data.entries()) {
        console.log(`  ${pair[0]}:`, pair[0] === 'photo' ? `[Fichier: ${pair[1].name}]` : pair[1]);
      }

      let result;
      if (isEditing) {
        console.log(`✏️ Mise à jour équipement ID: ${id}`);
        result = await updateEquipment(id, data);
        setModal({
          show: true,
          type: "success",
          title: "Succès",
          message: "Équipement modifié avec succès",
        });
      } else {
        console.log("➕ Création nouvel équipement");
        result = await createEquipment(data);
        setModal({
          show: true,
          type: "success",
          title: "Succès",
          message: "Équipement ajouté avec succès",
        });
      }
      
      console.log("✅ Réponse serveur:", result);
      
    } catch (error) {
      console.error("❌ Erreur lors de l'envoi:", error);
      
      let errorMsg = "Erreur serveur. Veuillez réessayer.";
      
      if (error.response) {
        console.error("📡 Erreur serveur:", {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
        
        if (error.response.data?.error) {
          errorMsg = error.response.data.error;
        } else if (error.response.data?.message) {
          errorMsg = error.response.data.message;
        } else if (error.response.status === 413) {
          errorMsg = "Fichier trop volumineux. Taille max: 5MB";
        } else if (error.response.status === 415) {
          errorMsg = "Format d'image non supporté. Utilisez JPG, PNG ou GIF";
        } else if (error.response.status === 401) {
          errorMsg = "Session expirée. Veuillez vous reconnecter.";
          setTimeout(() => navigate('/login'), 3000);
        } else if (error.response.status === 403) {
          errorMsg = "Accès refusé. Droits administrateur requis.";
        }
      } else if (error.request) {
        console.error("📡 Pas de réponse du serveur");
        errorMsg = "Impossible de se connecter au serveur. Vérifiez votre connexion.";
      } else {
        console.error("⚙️ Erreur configuration:", error.message);
        errorMsg = error.message;
      }

      setModal({
        show: true,
        type: "error",
        title: "Erreur",
        message: errorMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemovePhoto = () => {
    if (preview && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setFormData(prev => ({ ...prev, photo: null }));
    console.log("🗑️ Photo supprimée");
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
            {isEditing ? "Modifier l'équipement" : "Ajouter un nouvel équipement"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="main-form" noValidate>
          <div className="form-layout">
            {/* COLONNE GAUCHE */}
            <div className="left-column">
              {/* Nom + Catégorie sur la même ligne */}
              <div className="name-category-row">
                <div className="input-group">
                  <label>Nom de l'équipement</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={errors.name ? "input-error" : ""}
                    placeholder="Entrez le nom..."
                    disabled={isSubmitting}
                  />
                  {errors.name && <p className="error-text">{errors.name}</p>}
                </div>

                <div className="input-group">
                  <label>Catégorie</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  >
                    <option value="Salle">Salle</option>
                    <option value="Projecteur">Projecteur</option>
                    <option value="Ordinateur">Ordinateur</option>
                    <option value="Autre">Autre</option>
                  </select>

                  {formData.category === "Autre" && (
                    <input
                      type="text"
                      name="customCategory"
                      value={formData.customCategory}
                      onChange={handleChange}
                      placeholder="Précisez la catégorie"
                      className="custom-category-input"
                      disabled={isSubmitting}
                    />
                  )}
                </div>
              </div>

              {/* Upload image */}
              <div className="image-upload-container">
                <div className="upload-header">
                  <label className="upload-label">Image de l'équipement</label>
                  <span className="upload-hint">(Optionnel - JPG, PNG, max 5MB)</span>
                </div>
                
                {preview ? (
                  <div className="preview-section">
                    <div className="preview-container">
                      <img src={preview} alt="Aperçu" className="preview-img" />
                      <button
                        type="button"
                        className="remove-photo-btn"
                        onClick={handleRemovePhoto}
                        disabled={isSubmitting}
                      >
                        ✕ Supprimer
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <input
                      type="file"
                      name="photo"
                      accept="image/*"
                      onChange={handleChange}
                      id="photo"
                      hidden
                      disabled={isSubmitting}
                    />
                    <label htmlFor="photo" className="image-btn">
                      <FaCamera className="icon-img" />
                      <span>Ajouter une image</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="input-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Décrivez l'équipement..."
                  rows="4"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* COLONNE DROITE - Illustration */}
            <div className="illustration-side">
              <img
                src={illustration}
                alt="Illustration"
                className="illustration-img"
              />
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
            <button
              type="submit"
              className="save-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Enregistrement...
                </>
              ) : isEditing ? (
                "Enregistrer les modifications"
              ) : (
                "Ajouter l'équipement"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Modal */}
      {modal.show && (
        <div
          className="modal-overlay"
          onClick={() => {
            if (!isSubmitting) {
              setModal({ ...modal, show: false });
              if (modal.type === "success") {
                navigate("/admin/home");
              }
            }
          }}
        >
          <div
            className={`modal-card ${modal.type}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-icon">
              {modal.type === "success" ? (
                <FaCheckCircle className="success-icon" />
              ) : (
                <FaTimesCircle className="error-icon" />
              )}
            </div>
            <h2>{modal.title}</h2>
            <p>{modal.message}</p>
            <div className="modal-actions">
              <button
                onClick={() => {
                  setModal({ ...modal, show: false });
                  if (modal.type === "success") {
                    navigate("/admin/home");
                  }
                }}
                className="modal-ok-btn"
                disabled={isSubmitting}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}