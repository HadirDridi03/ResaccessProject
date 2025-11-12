// src/components/AuthForm.jsx
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
    role: "user",
    phone: "",
    idNumber: "",
  });

  const [errors, setErrors] = useState({});
  const [modal, setModal] = useState({ show: false, type: "", message: "" });

  // Redirection automatique après succès inscription
  useEffect(() => {
    if (modal.show && modal.type === "success" && type === "signup") {
      const timer = setTimeout(() => {
        setModal({ show: false, type: "", message: "" });
        navigate("/login");
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [modal, navigate, type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (type === "signup" && !formData.name.trim())
      newErrors.name = "Veuillez entrer votre nom complet.";
    if (!formData.email.trim())
      newErrors.email = "Veuillez entrer une adresse e-mail.";
    if (!formData.password.trim())
      newErrors.password = "Veuillez entrer un mot de passe.";
    if (type === "signup" && formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas.";
    if (type === "signup" && !formData.phone.trim())
      newErrors.phone = "Veuillez entrer votre numéro de téléphone.";
    if (type === "signup" && !formData.idNumber.trim())
      newErrors.idNumber = "Veuillez entrer votre numéro d'identité.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const url = type === "signup" ? "/api/auth/register" : "/api/auth/login";
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Stockage de l'utilisateur et token
        localStorage.setItem("user", JSON.stringify(data));
        localStorage.setItem("token", data.token);

        setModal({
          show: true,
          type: "success",
          message:
            type === "signup"
              ? "Inscription réussie ! Vous pouvez maintenant vous connecter."
              : "Connexion réussie ! Bienvenue.",
        });

        // Redirection après login
        if (type !== "signup") {
          setTimeout(() => {
            if (data.role === "admin") navigate("/admin/home");
            else navigate("/user/home");
          }, 1000);
        }

        // 🔹 Garder ta version locale
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "user",
          phone: "",
          idNumber: "",
        });
      } else {
        setModal({
          show: true,
          type: "error",
          message: data.message || "Une erreur est survenue. Réessayez.",
        });
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
      setModal({
        show: true,
        type: "error",
        message: "Erreur de connexion au serveur.",
      });
    }
  };

  return (
    <>
      <div className={`auth-container ${modal.show ? "blurred" : ""}`}>
        <div className="auth-box1">
          <form onSubmit={handleSubmit} className="auth-form">
            {type === "signup" && (
              <>
                <div className="form-group">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={errors.name ? "input-error" : ""}
                    placeholder="Entrez votre nom complet"
                  />
                  {errors.name && <p className="error-text">{errors.name}</p>}
                </div>

                <div className="form-group">
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className={errors.phone ? "input-error" : ""}
                    placeholder="Ex: +33 6 12 34 56 78"
                  />
                  {errors.phone && <p className="error-text">{errors.phone}</p>}
                </div>

                <div className="form-group">
                  <input
                    type="text"
                    value={formData.idNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, idNumber: e.target.value })
                    }
                    className={errors.idNumber ? "input-error" : ""}
                    placeholder="Entrez votre numéro d'identité"
                  />
                  {errors.idNumber && (
                    <p className="error-text">{errors.idNumber}</p>
                  )}
                </div>
              </>
            )}

            <div className="form-group">
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={errors.email ? "input-error" : ""}
                placeholder="exemple@email.com"
              />
              {errors.email && <p className="error-text">{errors.email}</p>}
            </div>

            <div className="form-group">
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className={errors.password ? "input-error" : ""}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="error-text">{errors.password}</p>
              )}
            </div>

            {type === "signup" && (
              <>
                <div className="form-group">
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className={errors.confirmPassword ? "input-error" : ""}
                    placeholder="••••••••"
                  />
                  {errors.confirmPassword && (
                    <p className="error-text">{errors.confirmPassword}</p>
                  )}
                </div>

                <div className="form-group">
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                  >
                    <option value="user">Utilisateur</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </>
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
                    Créez-en un
                  </Link>
                </p>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* MODAL DE MESSAGE */}
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
                onClick={() =>
                  setModal({ show: false, type: "", message: "" })
                }
              >
                Réessayer
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
