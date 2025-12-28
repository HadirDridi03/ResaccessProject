// src/api/equipmentApi.js
import axios from "axios";

const API_URL = "http://localhost:5000/api/equipments";

// Fonction pour récupérer le token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
  };
};

// Important : pour l'upload de fichier, on ne met PAS 'Content-Type' dans les headers
// axios le définit automatiquement avec la boundary correcte quand on envoie FormData

export const createEquipment = async (data) => {
  const response = await axios.post(API_URL, data, {
    headers: getAuthHeaders(), // ← Token ajouté
    // Pas de 'Content-Type': axios gère multipart/form-data automatiquement
  });
  return response.data;
};

export const getAllEquipment = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getEquipmentById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const updateEquipment = async (id, data) => {
  const response = await axios.put(`${API_URL}/${id}`, data, {
    headers: getAuthHeaders(), // ← Token ajouté
    // Pas de 'Content-Type' manuel
  });
  return response.data;
};

export const deleteEquipment = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: getAuthHeaders(), // ← Token ajouté
  });
  return response.data;
};

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
      console.log("Tentative avec fetch...");
      return updateEquipmentStatusFallback(id, available);
    }

    console.error("Erreur updateEquipmentStatus:", error);
    throw error;
  }
};

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