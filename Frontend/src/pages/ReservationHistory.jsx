// src/pages/ReservationHistory.jsx (ou le nom de ton fichier)
import React, { useState, useEffect } from "react";
import { getReservations, adminUpdateReservationStatus } from "../api/reservationApi";
import '../styles/ReservationHistory.css';
import Papa from "papaparse";
import { useNavigate } from "react-router-dom";

const ReservationHistory = () => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  // Chargement initial + quand le filtre statut change
  useEffect(() => {
    fetchReservations();
  }, [statusFilter]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const data = await getReservations(params);
      setReservations(data);
    } catch (err) {
      console.error("Erreur lors du chargement des réservations :", err);
      setError("Impossible de charger les réservations. Vérifiez votre connexion ou vos droits.");
    } finally {
      setLoading(false);
    }
  };

  // Filtre recherche côté frontend (sur nom équipement, utilisateur, motif)
  useEffect(() => {
    let filtered = reservations;

    if (search.trim()) {
      const lowerSearch = search.toLowerCase();
      filtered = reservations.filter((r) => {
        const equipmentName = r.equipment?.name?.toLowerCase() || "";
        const userName = r.user?.name?.toLowerCase() || "";
        const userEmail = r.user?.email?.toLowerCase() || "";
        const motif = r.motif?.toLowerCase() || "";

        return (
          equipmentName.includes(lowerSearch) ||
          userName.includes(lowerSearch) ||
          userEmail.includes(lowerSearch) ||
          motif.includes(lowerSearch)
        );
      });
    }

    setFilteredReservations(filtered);
  }, [reservations, search]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await adminUpdateReservationStatus(id, newStatus);

      setReservations((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      console.error("Erreur mise à jour statut :", err);
      alert("Erreur lors de la mise à jour du statut.");
    }
  };

  const exportToCSV = () => {
    if (filteredReservations.length === 0) {
      alert("Aucune réservation à exporter");
      return;
    }

    const csvData = filteredReservations.map(r => ({
      Equipement: r.equipment?.name || "Non spécifié",
      Utilisateur: r.user?.name || r.user?.email || "Inconnu",
      Date: r.date || "",
      Horaire: `${r.heureDebut || ""} - ${r.heureFin || ""}`,
      Motif: r.motif || "",
      Statut: r.status === "pending" ? "En attente" :
             r.status === "approved" ? "Approuvée" :
             r.status === "rejected" ? "Refusée" : r.status
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "historique_reservations.csv";
    link.click();
  };

  return (
    <div className="reservation-history-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <button
            onClick={() => navigate(-1)} // ← Retour à la page précédente (plus propre)
            className="back-home-btn"
            title="Retour"
          >
            ← Retour
          </button>

          <div className="header-center-content">
            <h1 className="page-title">Toutes les réservations</h1>
          </div>
        </div>

        {/* Contrôles */}
        <div className="controls-section">
          <div className="controls">
            <input
              type="text"
              placeholder="Rechercher par équipement, utilisateur, motif..."
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvée</option>
              <option value="rejected">Refusée</option>
            </select>
            <button className="export-btn" onClick={exportToCSV}>
              Exporter (CSV)
            </button>
          </div>
        </div>

        {/* États */}
        {loading && <p className="loading-message">Chargement des réservations...</p>}

        {error && <p className="error-message">{error}</p>}

        {!loading && !error && filteredReservations.length === 0 && (
          <p className="no-data-message">
            Aucune réservation trouvée avec ces critères.
          </p>
        )}

        {/* Tableau */}
        {!loading && filteredReservations.length > 0 && (
          <div className="table-wrapper">
            <table className="reservation-table">
              <thead>
                <tr>
                  <th>Équipement</th>
                  <th>Utilisateur</th>
                  <th>Date</th>
                  <th>Horaire</th>
                  <th>Motif</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map((r) => (
                  <tr key={r._id}>
                    <td>{r.equipment?.name || "Non spécifié"}</td>
                    <td>{r.user?.name || r.user?.email || "Inconnu"}</td>
                    <td>{r.date}</td>
                    <td>{r.heureDebut} - {r.heureFin}</td>
                    <td>{r.motif || "-"}</td>
                    <td>
                      <span className={`status-badge status-${r.status}`}>
                        {r.status === "pending" ? "En attente" :
                         r.status === "approved" ? "Approuvée" :
                         r.status === "rejected" ? "Refusée" : r.status}
                      </span>
                    </td>
                    <td>
                      {r.status === "pending" && (
                        <div className="action-buttons">
                          <button
                            className="btn-accept"
                            onClick={() => handleStatusUpdate(r._id, "approved")}
                          >
                            Accepter
                          </button>
                          <button
                            className="btn-reject"
                            onClick={() => handleStatusUpdate(r._id, "rejected")}
                          >
                            Refuser
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationHistory;