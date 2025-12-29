import React from "react";
import SignupForm from "../components/auth/SignupForm";
import "../styles/SignupForm.css"; // déjà importé dans le form, mais ok si doublon
import { Link } from "react-router-dom";
import illustration from "../assets/signup-illustration.png"; // garde ton image ou change
import agenda from '../assets/agenda-logo.png';

export default function Signup() {
  return (
    <div className="auth-container signup-container">  {/* ← Ajoute "signup-container" ici */}
      <div className="auth-box signup-box">  {/* ← Ajoute "signup-box" ici */}
        {/* Logo en haut (optionnel, garde si tu veux) */}
        <div className="header-logo">
          <img src={agenda} alt="logo" className="logo-agenda" />
          <Link to="/" className="resaccess-link">
            <h1>ResAccess</h1>
          </Link>
        </div>

        <h2>Inscrivez-vous pour commencer à réserver vos équipements</h2>

        <img
          src={illustration}
          alt="Illustration inscription"
          className="signup-illustration"
        />

        <SignupForm />
      </div>
    </div>
  );
}