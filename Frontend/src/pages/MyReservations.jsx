// src/pages/MyReservations.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserNavbar from "../components/UserNavbar";
import "../styles/MyReservations.css";
import { FaHourglassHalf, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const API_URL = "http://localhost:5000/api/reservations";

export default function MyReservations() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingResa, setEditingResa] = useState(null);
  const [formData, setFormData] = useState({
    date: "",
    heureDebut: "",
    heureFin: "",
    motif: "",
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    fetchMyReservations();
  }, []);

  const fetchMyReservations = async () => {
    try {
      const response = await axios.get(`${API_URL}/my`, {
        headers: getAuthHeaders(),
      });

      const sorted = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setReservations(sorted);
    } catch (err) {
      console.error("Erreur chargement réservations :", err);
      if (err.response?.status === 401) {
        alert("Session expirée. Veuillez vous reconnecter.");
        navigate("/login");
      } else {
        alert("Impossible de charger vos réservations");
      }
    } finally {
      setLoading(false);
    }
  };

  // Vérifie si la réservation est passée
  const isPast = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const resaDate = new Date(date);
    resaDate.setHours(0, 0, 0, 0);
    return resaDate < today;
  };

  // Détermine si on peut modifier/annuler
  const canModify = (resa) => {
    if (isPast(resa.date)) return false;
    if (resa.status === "rejected") return false;
    return true;
  };

  const getStatusInfo = (resa) => {
    const past = isPast(resa.date);

    if (past) {
      return { text: "Passée", icon: null, className: "past" };
    }

    switch (resa.status) {
      case "pending":
        return { text: "En attente", icon: <FaHourglassHalf />, className: "pending" };
      case "approved":
        return { text: "Approuvée", icon: <FaCheckCircle />, className: "approved" };
      case "rejected":
        return { text: "Refusée", icon: <FaTimesCircle />, className: "rejected" };
      default:
        return { text: resa.status, icon: null, className: "unknown" };
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment annuler cette réservation ?")) return;

    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: getAuthHeaders(),
      });
      setReservations((prev) => prev.filter((r) => r._id !== id));
      alert("Réservation annulée avec succès");
    } catch (err) {
      alert("Erreur lors de l'annulation : " + (err.response?.data?.error || "Échec"));
    }
  };

  const openEditModal = (resa) => {
    if (!canModify(resa)) {
      alert("Cette réservation ne peut plus être modifiée.");
      return;
    }

    setEditingResa(resa);
    setFormData({
      date: resa.date,
      heureDebut: resa.heureDebut,
      heureFin: resa.heureFin,
      motif: resa.motif || "",
    });
  };

  const closeModal = () => {
    setEditingResa(null);
    setFormData({ date: "", heureDebut: "", heureFin: "", motif: "" });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!formData.date || !formData.heureDebut || !formData.heureFin) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (formData.heureFin <= formData.heureDebut) {
      alert("L'heure de fin doit être après l'heure de début");
      return;
    }

    try {
      await axios.put(
        `${API_URL}/${editingResa._id}`,
        {
          date: formData.date,
          heureDebut: formData.heureDebut,
          heureFin: formData.heureFin,
          motif: formData.motif.trim(),
        },
        { headers: getAuthHeaders() }
      );

      setReservations((prev) =>
        prev.map((r) =>
          r._id === editingResa._id
            ? {
                ...r,
                date: formData.date,
                heureDebut: formData.heureDebut,
                heureFin: formData.heureFin,
                motif: formData.motif.trim(),
              }
            : r
        )
      );

      alert("Réservation modifiée avec succès !");
      closeModal();
    } catch (err) {
      alert("Erreur lors de la modification : " + (err.response?.data?.error || "Échec"));
    }
  };

  if (loading) {
    return <div className="loading-full">Chargement de vos réservations...</div>;
  }

  return (
    <div className="dashboard-with-sidebar">
      {/* Navbar identique au dashboard */}
      <UserNavbar />

      {/* Contenu principal */}
      <main className="page-content">
        <header className="page-header-admin">
          <h1>Mes Réservations</h1>
          <p>Consultez, modifiez ou annulez vos réservations</p>
        </header>

        <div className="reservations-container">
          {reservations.length === 0 ? (
            <div className="no-data">
              <p>Vous n'avez aucune réservation pour le moment.</p>
              <p>Créez votre première réservation depuis le tableau de bord !</p>
            </div>
          ) : (
            <table className="reservations-table">
              <thead>
                <tr>
                  <th>Équipement</th>
                  <th>Date</th>
                  <th>Heure</th>
                  <th>Motif</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((resa) => {
                  const statusInfo = getStatusInfo(resa);
                  const modifiable = canModify(resa);

                  return (
                    <tr key={resa._id} className={statusInfo.className}>
                      <td>
                        <strong>{resa.equipment?.name || "Inconnu"}</strong>
                        <br />
                        <small>{resa.equipment?.category}</small>
                      </td>
                      <td>
                        {new Date(resa.date).toLocaleDateString("fr-FR", {
                          weekday: "long",
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </td>
                      <td>{resa.heureDebut} - {resa.heureFin}</td>
                      <td>{resa.motif || "-"}</td>
                      <td>
                        <span className={`status-badge status-${statusInfo.className}`}>
                          {statusInfo.icon && <span className="status-icon">{statusInfo.icon}</span>}
                          {statusInfo.text}
                        </span>
                      </td>
                      <td>
                        {modifiable ? (
                          <div className="action-buttons">
                            <button
                              className="action-btn edit"
                              onClick={() => openEditModal(resa)}
                              title="Modifier"
                            >
                              ✏️
                            </button>
                            <button
                              className="action-btn delete"
                              onClick={() => handleDelete(resa._id)}
                              title="Annuler"
                            >
                              🗑️
                            </button>
                          </div>
                        ) : (
                          <span className="no-action">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal de modification */}
        {editingResa && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Modifier la réservation</h2>
              <p><strong>{editingResa.equipment?.name}</strong></p>

              <form onSubmit={handleUpdate}>
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Heure de début</label>
                    <input
                      type="time"
                      value={formData.heureDebut}
                      onChange={(e) => setFormData({ ...formData, heureDebut: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Heure de fin</label>
                    <input
                      type="time"
                      value={formData.heureFin}
                      onChange={(e) => setFormData({ ...formData, heureFin: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Motif</label>
                  <textarea
                    value={formData.motif}
                    onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                    rows="4"
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="cancel" onClick={closeModal}>
                    Annuler
                  </button>
                  <button type="submit" className="save">
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}