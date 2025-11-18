//Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-wrapper">

      
      <div className="left-side">
        <div className="left-content">
          <div className="logo-area">
            
            <div>
              <h1>Bienvenue sur <span>ResAccess</span></h1>
              <p>Votre solution de réservation d’équipements</p>
            </div>
          </div>

          <h2>Fonctionnalités principales</h2>
          <ul className="features">
            <li>Réservation en temps réel</li>
            <li>Gestion des conflits automatique</li>
            <li>Statistiques et rapports</li>
            <li>Multi-utilisateurs avec rôles</li>
          </ul>

          <div className="stats">
            <div className="stat">
              <span>✨</span>
              <p>Simplicité</p>
            </div>
            <div className="stat">
              <span>⚡</span>
              <p>Rapidité</p>
            </div>
            <div className="stat">
              <span>🔐</span>
              <p>Sécurité</p>
            </div>
          </div>
        </div>
      </div>

      
      <div className="right-side">
        <div className="buttons-card">
          <h3>Prêt à commencer ?</h3>
          <div className="action-buttons">
            <button onClick={() => navigate("/signup")} className="btn-signup">
              S’inscrire
            </button>
            <button onClick={() => navigate("/login")} className="btn-login">
              Se Connecter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}