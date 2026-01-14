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
      setFormData((prev) => ({ ...prev, photo: file }));
      setPreview(file ? URL.createObjectURL(file) : null);
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

    const data = new FormData();
    data.append("name", formData.name);

    const finalCategory =
      formData.category === "Autre" && formData.customCategory.trim()
        ? formData.customCategory.trim()
        : formData.category;

    data.append("category", finalCategory);
    data.append("description", formData.description);

    if (formData.photo) {
      data.append("photo", formData.photo);
    }

    try {
      if (isEditing) {
        await updateEquipment(id, data);
        setModal({
          show: true,
          type: "success",
          title: "Succès",
          message: "Équipement modifié avec succès",
        });
      } else {
        await createEquipment(data);
        setModal({
          show: true,
          type: "success",
          title: "Succès",
          message: "Équipement ajouté avec succès",
        });
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Erreur serveur. Veuillez réessayer.";

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
                  />
                  {errors.name && <p className="error-text">{errors.name}</p>}
                </div>

                <div className="input-group">
                  <label>Catégorie</label>
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

                  {formData.category === "Autre" && (
                    <input
                      type="text"
                      name="customCategory"
                      value={formData.customCategory}
                      onChange={handleChange}
                      placeholder="Précisez la catégorie"
                      className="custom-category-input"
                    />
                  )}
                </div>
              </div>

              {/* Upload image */}
              <div className="image-upload-container">
                <input
                  type="file"
                  name="photo"
                  accept="image/*"
                  onChange={handleChange}
                  id="photo"
                  hidden
                />
                <label htmlFor="photo" className="image-btn">
                  <FaCamera className="icon-img" />
                  <span>Ajouter une image</span>
                </label>

                {preview && (
                  <div className="preview-container">
                    <img src={preview} alt="Aperçu" className="preview-img" />
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
              {isSubmitting
                ? "Enregistrement..."
                : isEditing
                ? "Enregistrer"
                : "Ajouter"}
            </button>
          </div>
        </form>
      </div>

      {/* Modal */}
      {modal.show && (
        <div
          className="modal-overlay"
          onClick={() => setModal({ ...modal, show: false })}
        >
          <div
            className={`modal-card ${modal.type}`}
            onClick={(e) => e.stopPropagation()}
          >
            {modal.type === "success" ? <FaCheckCircle /> : <FaTimesCircle />}
            <h2>{modal.title}</h2>
            <p>{modal.message}</p>
            <button
              onClick={() => {
                setModal({ ...modal, show: false });
                if (modal.type === "success") {
                  navigate("/admin/home");
                }
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}