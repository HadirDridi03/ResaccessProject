import React, { useState } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/LoginForm.css"; // garde le même CSS pour l'instant

export default function LoginForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [modal, setModal] = useState({ show: false, type: "", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

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

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data));
        localStorage.setItem("token", data.token);

        setModal({
          show: true,
          type: "success",
          message: "Connexion réussie ! Bienvenue.",
        });

        setTimeout(() => {
          if (data.role === "admin") {
            navigate("/admin/home");
          } else {
            navigate("/user/home");
          }
        }, 1200);

        setFormData({ email: "", password: "" });
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

            <button type="submit" className="auth-button">
              Se connecter
            </button>

            <div className="auth-switch">
              <p>
                Pas encore de compte ?{" "}
                <Link to="/signup" className="switch-link">
                  Inscrivez-vous
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Modal */}
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