// src/api/reservationApi.js
import axios from "axios";

// Headers avec token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const createReservation = async (reservationData) => {
  const response = await axios.post("/api/reservations", reservationData, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getMyReservations = async () => {
  const response = await axios.get("/api/reservations/my", {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const updateReservation = async (id, data) => {
  const response = await axios.put(`/api/reservations/${id}`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const cancelReservation = async (id) => {
  const response = await axios.delete(`/api/reservations/${id}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getReservationsByEquipment = async (equipmentId) => {
  const response = await axios.get(`/api/reservations/equipment/${equipmentId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Pour l'admin : récupérer toutes les réservations
export const getReservations = async (params = {}) => {
  const response = await axios.get("/api/reservations", {
    params,
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Nouveau : pour l'admin changer le statut
export const adminUpdateReservationStatus = async (id, status) => {
  const response = await axios.put(
    `/api/reservations/admin/status/${id}`,
    { status },
    { headers: getAuthHeaders() }
  );
  return response.data;
};