// src/api/equipmentApi.js
import axios from "axios";

const API_URL = "http://localhost:5000/api/equipments";

// Récupère le token depuis localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
  };
};

/* =========================
   CRÉER UN ÉQUIPEMENT (avec photo)
========================= */
export const createEquipment = async (data) => {
  const response = await axios.post(API_URL, data, {
    headers: getAuthHeaders(),
    // Pas de 'Content-Type' : axios gère multipart/form-data automatiquement
  });
  return response.data;
};

/* =========================
   LISTE TOUS LES ÉQUIPEMENTS
========================= */
export const getAllEquipment = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

/* =========================
   DÉTAIL D'UN ÉQUIPEMENT
========================= */
export const getEquipmentById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

/* =========================
   MODIFIER UN ÉQUIPEMENT
========================= */
export const updateEquipment = async (id, data) => {
  const response = await axios.put(`${API_URL}/${id}`, data, {
    headers: getAuthHeaders(),
    // Pas de 'Content-Type' manuel
  });
  return response.data;
};

/* =========================
   SUPPRIMER UN ÉQUIPEMENT
========================= */
export const deleteEquipment = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

/* =========================
   CHANGER LE STATUT (disponible/maintenance)
========================= */
export const updateEquipmentStatus = async (id, available) => {
  try {
    const response = await axios.patch(
      `${API_URL}/${id}/status`,
      { available },
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    const isNetworkError =
      error.code === "ERR_NETWORK" ||
      (error.message && error.message.includes("Network Error"));

    if (isNetworkError) {
      console.log("Tentative avec fetch (fallback)...");
      return updateEquipmentStatusFallback(id, available);
    }

    console.error("Erreur updateEquipmentStatus:", error);
    throw error;
  }
};

/* =========================
   Fallback avec fetch (si axios échoue)
========================= */
const updateEquipmentStatusFallback = async (id, available) => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/${id}/status`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ available }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
  }

  return response.json();
};