// src/components/AuthForm.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function AuthForm({ type }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
  e.preventDefault();
  const newErrors = {};

  if (type === "signup" && !formData.name.trim()) newErrors.name = "Veuillez entrer votre nom complet.";
  if (!formData.email.trim()) newErrors.email = "Veuillez entrer une adresse e-mail.";
  if (!formData.password.trim()) newErrors.password = "Veuillez entrer un mot de passe.";
  if (type === "signup" && formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Les mots de passe ne correspondent pas.";

  setErrors(newErrors);
  if (Object.keys(newErrors).length === 0) {
    try {
      const url = type === "signup" ? "/api/auth/register" : "/api/auth/login";
      
      // CORRECTION : Ajouter method: "POST" explicitement
      const response = await fetch(url, {
        method: "POST", // ← AJOUT IMPORTANT
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();

      if (response.ok) {
        alert(type === "signup" ? "Inscription réussie !" : "Connexion réussie !");

        // Stocker le token et les infos utilisateur
        if (data.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify({
            _id: data._id,
            name: data.name,
            email: data.email,
            role: data.role
          }));
        }

        // Redirection selon le rôle
        if (data.role === "admin") {
          navigate("/equipment");
        } else {
          navigate("/user/home");
        }

        setFormData({ name: "", email: "", password: "", confirmPassword: "", role: "user" });
      } else {
        alert("❌ Erreur : " + (data.message || "Une erreur est survenue."));
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
      alert("Erreur de connexion au serveur.");
    }
  }
};

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {type === "signup" && (
        <div className="form-group">
          <label>Nom complet</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={errors.name ? "input-error" : ""}
            placeholder="Entrez votre nom complet"
          />
          {errors.name && <p className="error-text">{errors.name}</p>}
        </div>
      )}

      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className={errors.email ? "input-error" : ""}
          placeholder="exemple@email.com"
        />
        {errors.email && <p className="error-text">{errors.email}</p>}
      </div>

      <div className="form-group">
        <label>Mot de passe</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className={errors.password ? "input-error" : ""}
          placeholder="••••••••"
        />
        {errors.password && <p className="error-text">{errors.password}</p>}
      </div>

      {type === "signup" && (
        <>
          <div className="form-group">
            <label>Confirmer le mot de passe</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className={errors.confirmPassword ? "input-error" : ""}
              placeholder="••••••••"
            />
            {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
          </div>

          <div className="form-group">
            <label>Rôle</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
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
            Déjà un compte ? <Link to="/login" className="switch-link">Connectez-vous</Link>
          </p>
        ) : (
          <p>
            Pas encore de compte ? <Link to="/signup" className="switch-link">Créez-en un</Link>
          </p>
        )}
      </div>
    </form>
  );
}