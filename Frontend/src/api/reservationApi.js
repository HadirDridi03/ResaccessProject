// src/api/reservationApi.js
import axios from "axios";

const API_URL = "http://localhost:5000/api/reservations";

// Fonction commune pour ajouter le token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const createReservation = async (reservationData) => {
  const response = await axios.post(API_URL, reservationData, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getMyReservations = async () => {
  const response = await axios.get(`${API_URL}/my`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const updateReservation = async (id, data) => {
  const response = await axios.put(`${API_URL}/${id}`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const cancelReservation = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getReservationsByEquipment = async (equipmentId) => {
  const response = await axios.get(`${API_URL}/equipment/${equipmentId}`);
  return response.data;
};