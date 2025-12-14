// src/pages/MyReservations.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/MyReservations.css";
import { FaCalendarAlt, FaClock, FaEdit, FaTrash, FaArrowLeft } from "react-icons/fa";

const API_URL = "http://localhost:5000/api/reservations";

export default function MyReservations() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingResa, setEditingResa] = useState(null);
  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    reason: "",
  });

  // Fonction pour ajouter le token à tous les appels
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

      // Trier par date décroissante
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

  const isPast = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const resaDate = new Date(date);
    resaDate.setHours(0, 0, 0, 0);
    return resaDate < today;
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
    setEditingResa(resa);
    setFormData({
      date: resa.date,
      startTime: resa.heureDebut,
      endTime: resa.heureFin,
      reason: resa.reason || "",
    });
  };

  const closeModal = () => {
    setEditingResa(null);
    setFormData({ date: "", startTime: "", endTime: "", reason: "" });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.date || !formData.startTime || !formData.endTime) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      await axios.put(
        `${API_URL}/${editingResa._id}`,
        {
          date: formData.date,
          heureDebut: formData.startTime,  // ← Nom exact attendu par le backend
          heureFin: formData.endTime,      // ← Nom exact attendu par le backend
          reason: formData.reason,
        },
        { headers: getAuthHeaders() }
      );

      // Mise à jour locale
      setReservations((prev) =>
        prev.map((r) =>
          r._id === editingResa._id
            ? {
                ...r,
                date: formData.date,
                heureDebut: formData.startTime,
                heureFin: formData.endTime,
                reason: formData.reason,
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
    return <div className="loading">Chargement de vos réservations...</div>;
  }

  return (
    <div className="my-reservations-page">
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate("/user/home")}>
          <FaArrowLeft /> Retour
        </button>
        <h1>Mes Réservations</h1>
      </header>

      <div className="reservations-container">
        {reservations.length === 0 ? (
          <p className="no-reservations">
            Vous n'avez aucune réservation pour le moment.
          </p>
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
                const past = isPast(resa.date);
                return (
                  <tr key={resa._id} className={past ? "past" : "future"}>
                    <td>
                      <strong>{resa.equipment?.name || "Inconnu"}</strong>
                      <br />
                      <small>{resa.equipment?.category}</small>
                    </td>
                    <td>
                      <FaCalendarAlt />{" "}
                      {new Date(resa.date).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </td>
                    <td>
                      <FaClock /> {resa.heureDebut} - {resa.heureFin}
                    </td>
                    <td>{resa.reason || "-"}</td>
                    <td>
                      <span className={`status ${past ? "past" : "future"}`}>
                        {past ? "Passée" : "À venir"}
                      </span>
                    </td>
                    <td>
                      {past ? (
                        <span className="no-action">—</span>
                      ) : (
                        <>
                          <button
                            className="action-btn edit"
                            onClick={() => openEditModal(resa)}
                            title="Modifier"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="action-btn delete"
                            onClick={() => handleDelete(resa._id)}
                            title="Annuler"
                          >
                            <FaTrash />
                          </button>
                        </>
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
                  <label>Heure début</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Heure fin</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Motif (facultatif)</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows="3"
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
    </div>
  );
}