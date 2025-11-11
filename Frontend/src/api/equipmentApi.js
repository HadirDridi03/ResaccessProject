// src/api/equipmentApi.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/equipments';

// CREATE
export const createEquipment = async (formData) => {
  const data = new FormData();
  data.append('name', formData.name);
  data.append('category', formData.category || '');
  data.append('available', formData.available);
  data.append('startTime', formData.startTime || '');
  data.append('endTime', formData.endTime || '');
  data.append('description', formData.description || '');
  if (formData.image) data.append('photo', formData.image);

  const response = await axios.post(API_URL, data);
  return response.data;
};

// READ ALL
export const getAllEquipment = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// DELETE
export const deleteEquipment = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};