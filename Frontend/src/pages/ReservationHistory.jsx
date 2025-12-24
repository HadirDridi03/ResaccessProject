import React, { useState, useEffect } from "react";
import { getReservations,adminUpdateReservationStatus,  updateReservation } from "../api/reservationApi";
import '../styles/ReservationHistory.css';
import Papa from "papaparse";

const ReservationHistory = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Recharger les données quand le filtre ou la recherche change
  useEffect(() => {
    fetchReservations();
  }, [statusFilter, search]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError("");

      // Construction des paramètres pour filtre et recherche
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const data = await getReservations(params); // params passés à ton API
      setReservations(data);
    } catch (err) {
      console.error("Erreur lors du chargement des réservations :", err);
      setError("Impossible de charger les réservations. Vérifiez votre connexion ou vos droits d'administrateur.");
    } finally {
      setLoading(false);
    }
  };

 const handleStatusUpdate = async (id, newStatus) => {
  try {
    await adminUpdateReservationStatus(id, newStatus);

    // Mise à jour instantanée dans l'interface
    setReservations((prev) =>
      prev.map((r) => (r._id === id ? { ...r, status: newStatus } : r))
    );
  } catch (err) {
    console.error("Erreur mise à jour statut admin :", err);
    alert("Erreur lors de la mise à jour du statut. Vérifiez la console.");
  }
};

  const exportToCSV = () => {
    if (reservations.length === 0) {
      alert("Aucune réservation à exporter");
      return;
    }

    const csvData = reservations.map(r => ({
      Equipement: r.equipment?.name || "Non spécifié",
      Utilisateur: r.user?.name || r.user?.email || "Inconnu",
      Date: r.date || "",
      Horaire: `${r.heureDebut || ""} - ${r.heureFin || ""}`,
      Motif: r.reason || "",
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
    <div className="reservation-history-container">
      <h1>Historique des réservations</h1>
      <p>Consulter l'historique complet</p>

      <div className="controls">
        <input
          type="text"
          placeholder="Rechercher..."
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

      {loading && <p style={{textAlign: "center", padding: "3rem"}}>Chargement des réservations...</p>}

      {error && <p style={{color: "red", textAlign: "center", background: "#fee", padding: "1rem", borderRadius: "8px"}}>{error}</p>}

      {!loading && !error && reservations.length === 0 && (
        <p style={{textAlign: "center", padding: "3rem", color: "#666"}}>
          Aucune réservation trouvée.
        </p>
      )}

      {!loading && reservations.length > 0 && (
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
            {reservations.map((r) => (
              <tr key={r._id}>
                <td>{r.equipment?.name || "Non spécifié"}</td>
                <td>{r.user?.name || r.user?.email || "Inconnu"}</td>
                <td>{r.date}</td>
                <td>{r.heureDebut} - {r.heureFin}</td>
                <td>{r.reason}</td>
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
      )}
    </div>
  );
};

export default ReservationHistory;