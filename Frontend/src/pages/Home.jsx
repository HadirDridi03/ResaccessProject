import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
/////

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-box">
        <h1>
          <strong>Gérez vos réservations simplement et en toute transparence</strong>
        </h1>
        <p>
          Bienvenue sur la plateforme de réservation d’équipements
        </p>
        <div className="home-buttons">
          <button onClick={() => navigate("/signup")}>S’inscrire</button>
          <button onClick={() => navigate("/login")}>Se Connecter</button>
        </div>
        <h3 className="footer">© RESACCESS 2025</h3>
      </div>
    </div>
  );
}
