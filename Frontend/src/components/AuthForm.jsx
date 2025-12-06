import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import "../styles/AuthForm.css";

export default function AuthForm({ type }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    idNumber: "",
  });

  const [errors, setErrors] = useState({});
  const [modal, setModal] = useState({ show: false, type: "", message: "" });

  // Redirection auto après succès inscription
  useEffect(() => {
    if (modal.show && modal.type === "success" && type === "signup") {
      const timer = setTimeout(() => {
        setModal({ show: false, type: "", message: "" });
        navigate("/login");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [modal, navigate, type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validation commune
    if (!formData.email.trim()) {
      newErrors.email = "Veuillez entrer une adresse e-mail.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Adresse e-mail invalide.";
    }

    if (!formData.password) {
      newErrors.password = "Veuillez entrer un mot de passe.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Le mot de passe doit contenir au moins 8 caractères.";
    } else if (!/(?=.*[A-Z])(?=.*[0-9])/.test(formData.password)) {
      newErrors.password = "Le mot de passe doit contenir une majuscule et un chiffre.";
    }

    // Validation spécifique inscription
    if (type === "signup") {
      if (!formData.name.trim() || formData.name.trim().length < 3) {
        newErrors.name = "Nom complet requis (min. 3 caractères).";
      }

      const phoneClean = formData.phone.replace(/\s/g, "");
      if (!phoneClean) {
        newErrors.phone = "Numéro de téléphone requis.";
      } else if (!/^((\+216)?)?[0-9]{8}$/.test(phoneClean)) {
        newErrors.phone = "Numéro invalide (8 chiffres, ex: 22123456 ou +216 22 123 456)";
      }

      if (!formData.idNumber || !/^[0-9]{8}$/.test(formData.idNumber)) {
        newErrors.idNumber = "Numéro CIN invalide (8 chiffres exactement).";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Les mots de passe ne correspondent pas.";
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const url = type === "signup" ? "/api/auth/register" : "/api/auth/login";

      // On n'envoie PAS le rôle depuis le frontend → toujours "user" côté serveur
      const body = type === "signup"
        ? {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            phone: formData.phone,
            idNumber: formData.idNumber,
          }
        : {
            email: formData.email,
            password: formData.password,
          };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data));
        localStorage.setItem("token", data.token);

        setModal({
          show: true,
          type: "success",
          message:
            type === "signup"
              ? "Inscription réussie ! Redirection vers la connexion..."
              : "Connexion réussie ! Bienvenue.",
        });

        // Redirection après connexion
        if (type === "login") {
          setTimeout(() => {
            if (data.role === "admin") {
              navigate("/admin/home");
            } else {
              navigate("/user/home");
            }
          }, 1200);
        }

        // Reset formulaire
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          phone: "",
          idNumber: "",
        });
      } else {
        setModal({
          show: true,
          type: "error",
          message: data.message || "Une erreur est survenue.",
        });
      }
    } catch (error) {
      setModal({
        show: true,
        type: "error",
        message: "Impossible de contacter le serveur. Vérifiez votre connexion.",
      });
    }
  };

  return (
    <>
      <div className={`auth-container ${modal.show ? "blurred" : ""}`}>
        <div className="auth-box1">
          <form onSubmit={handleSubmit} className="auth-form">

            {/* Champs spécifiques à l'inscription */}
            {type === "signup" && (
              <>
                <div className="form-group">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={errors.name ? "input-error" : ""}
                    placeholder="Nom complet"
                  />
                  {errors.name && <p className="error-text">{errors.name}</p>}
                </div>

                <div className="form-group">
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={errors.phone ? "input-error" : ""}
                    placeholder="Téléphone (+216 22 123 456)"
                  />
                  {errors.phone && <p className="error-text">{errors.phone}</p>}
                </div>

                <div className="form-group">
                  <input
                    type="text"
                    value={formData.idNumber}
                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                    className={errors.idNumber ? "input-error" : ""}
                    placeholder="Numéro CIN (8 chiffres)"
                    maxLength="8"
                  />
                  {errors.idNumber && <p className="error-text">{errors.idNumber}</p>}
                </div>
              </>
            )}

            {/* Email */}
            <div className="form-group">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={errors.email ? "input-error" : ""}
                placeholder="exemple@email.com"
              />
              {errors.email && <p className="error-text">{errors.email}</p>}
            </div>

            {/* Mot de passe */}
            <div className="form-group">
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={errors.password ? "input-error" : ""}
                placeholder="Mot de passe"
              />
              {errors.password && <p className="error-text">{errors.password}</p>}
            </div>

            {/* Confirmation mot de passe (inscription uniquement) */}
            {type === "signup" && (
              <div className="form-group">
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={errors.confirmPassword ? "input-error" : ""}
                  placeholder="Confirmer le mot de passe"
                />
                {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
              </div>
            )}

            <button type="submit" className="auth-button">
              {type === "signup" ? "S'inscrire" : "Se connecter"}
            </button>

            <div className="auth-switch">
              {type === "signup" ? (
                <p>
                  Déjà un compte ?{" "}
                  <Link to="/login" className="switch-link">
                    Connectez-vous
                  </Link>
                </p>
              ) : (
                <p>
                  Pas encore de compte ?{" "}
                  <Link to="/signup" className="switch-link">
                    Inscrivez-vous
                  </Link>
                </p>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Modal de feedback */}
      {modal.show && (
        <div className="modal-overlay">
          <div className={`modal-card ${modal.type}`}>
            <div className="modal-icon">
              {modal.type === "success" ? <FaCheckCircle /> : <FaTimesCircle />}
            </div>
            <h2>{modal.type === "success" ? "Succès" : "Erreur"}</h2>
            <p>{modal.message}</p>
            {modal.type === "error" && (
              <button
                className="modal-button error"
                onClick={() => setModal({ show: false, type: "", message: "" })}
              >
                Fermer
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}