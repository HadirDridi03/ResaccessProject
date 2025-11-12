// src/api/reservationApi.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/reservations';

export const createReservation = async (reservationData) => {
  const response = await axios.post(API_URL, reservationData);
  return response.data;
};

export const getUserReservations = async () => {
  const response = await axios.get(`${API_URL}/my-reservations`);
  return response.data;
};