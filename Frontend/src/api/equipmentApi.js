// src/api/equipmentApi.js
import axios from 'axios';
const API_URL = 'http://localhost:5000/api/equipments';

export const createEquipment = async (data) => {
  const response = await axios.post(API_URL, data);
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
  const response = await axios.put(`${API_URL}/${id}`, data);
  return response.data;
};

export const deleteEquipment = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};