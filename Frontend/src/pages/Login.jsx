import React from "react";
import AuthForm from "../components/AuthForm";
import "../styles/AuthForm.css";
            import { Link } from "react-router-dom";
import agenda from '../assets/agenda-logo.png';
export default function Login() {
  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="header-logo">
            <img src={agenda} alt="logo" className="logo-agenda" />
             <Link to="/" className="resaccess-link">
                <h1>ResAccess</h1>
             </Link>
        </div>
        <h2> Connectez-vous !</h2>
        <AuthForm type="login" />
      </div>
    </div>
  );
}
