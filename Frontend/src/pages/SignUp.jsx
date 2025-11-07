import React from "react";
import AuthForm from "../components/AuthForm";
import "../styles/AuthForm.css";
import { Link } from "react-router-dom";

import illustration from "../assets/signup-illustration.png";
import agenda from '../assets/agenda-logo.png';
export default function Signup() {
  return (
    <div className="auth-container">
      <div className="auth-box">
         <div className="header-logo">
            <img src={agenda} alt="logo" className="logo-agenda" />
             <Link to="/" className="resaccess-link">
                <h1>ResAccess</h1></Link>
          </div>
        <h2>Inscrivez-vous pour commencer à réserver vos équipements </h2>
        <img src={illustration} alt="Illustration signup" className="signup-image" />
        <AuthForm type="signup" />
      </div>
    </div>
  );
}
