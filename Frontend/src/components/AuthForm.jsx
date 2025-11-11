import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthForm({ type }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user", // 👈 Nouveau champ
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (type === "signup" && !formData.name.trim()) {
      newErrors.name = "Veuillez entrer votre nom complet.";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Veuillez entrer une adresse e-mail.";
    }
    if (!formData.password.trim()) {
      newErrors.password = "Veuillez entrer un mot de passe.";
    }
    if (type === "signup" && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const url =
          type === "signup" ? "/api/auth/register" : "/api/auth/login";

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await response.json();
        console.log("📡 Réponse du serveur :", data);

        if (response.ok) {
          alert(
            "✅ " +
              (type === "signup"
                ? "Inscription réussie !"
                : "Connexion réussie !")
          );

          // ✅ Redirection selon le rôle
         // Utilise le rôle du backend, pas du formulaire
          if (data.role === "admin") {
              navigate("/equipment"); // ← Corrige aussi la route
          } else {
              navigate("/user/equipment"); // ou "/home" si tu as une page
}
          // Réinitialiser le formulaire
          setFormData({
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            role: "user",
          });
        } else {
          alert("❌ Erreur : " + (data.message || "Une erreur est survenue."));
        }
      } catch (error) {
        console.error("❌ Erreur réseau :", error);
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
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
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
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
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
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
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

          {/* 👇 Nouveau champ Rôle */}
          <div className="form-group">
            <label>Rôle</label>
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
            <a href="/login" className="switch-link">
              Connectez-vous
            </a>
          </p>
        ) : (
          <p>
            Pas encore de compte ?{" "}
            <a href="/signup" className="switch-link">
              Créez-en un
            </a>
          </p>
        )}
      </div>
    </form>
  );
}

