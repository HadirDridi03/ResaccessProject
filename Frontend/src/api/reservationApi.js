// src/api/reservationApi.js
import axios from "axios";

// ========================
// URL de base API
// ========================
const API_URL = "http://localhost:5000/api/reservations";

// ========================
// Headers avec token
// ========================
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// ========================
// CRÉER UNE RÉSERVATION
// ========================
export const createReservation = async (reservationData) => {
  const response = await axios.post(API_URL, reservationData, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// ========================
// MES RÉSERVATIONS (UTILISATEUR)
// ========================
export const getMyReservations = async () => {
  const response = await axios.get(`${API_URL}/my`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// ========================
// METTRE À JOUR UNE RÉSERVATION
// ========================
export const updateReservation = async (id, data) => {
  const response = await axios.put(`${API_URL}/${id}`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// ========================
// ANNULER / SUPPRIMER UNE RÉSERVATION
// ========================
export const cancelReservation = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// ========================
// RÉSERVATIONS PAR ÉQUIPEMENT (CALENDRIER)
// ========================
export const getReservationsByEquipment = async (equipmentId) => {
  const response = await axios.get(
    `${API_URL}/equipment/${equipmentId}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

// ========================
// ADMIN : TOUTES LES RÉSERVATIONS
// ========================
export const getReservations = async (params = {}) => {
  const response = await axios.get(API_URL, {
    params,
    headers: getAuthHeaders(),
  });
  return response.data;
};

// ========================
// ADMIN : CHANGER LE STATUT
// ========================
export const adminUpdateReservationStatus = async (id, status) => {
  const response = await axios.put(
    `${API_URL}/admin/status/${id}`,
    { status },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// ========================
// TAUX D’OCCUPATION HEBDOMADAIRE (ADMIN + USER)
// ========================
export const getWeeklyOccupancyRate = async () => {
  const response = await axios.get(`${API_URL}/weekly-occupancy`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};