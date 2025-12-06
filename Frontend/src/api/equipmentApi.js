// src/api/equipmentApi.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/equipments';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

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

export const updateEquipmentStatus = async (id, available) => {
  try {
    const response = await axios({
      method: 'PATCH',
      url: `${API_URL}/${id}/status`,
      data: { available },
      headers: getAuthHeaders(),
      timeout: 5000
    });
    
    return response.data;
  } catch (error) {
    // CORRECTION : Vérification plus sécurisée
    const isNetworkError = error.code === 'ERR_NETWORK' || 
                         (error.message && error.message.includes('Network Error'));
    
    if (isNetworkError) {
      console.log("Tentative avec fetch...");
      return updateEquipmentStatusFallback(id, available);
    }
    
    console.error("Erreur updateEquipmentStatus:", error);
    throw error;
  }
};

const updateEquipmentStatusFallback = async (id, available) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}/${id}/status`, {
    method: 'PATCH',
    headers: headers,
    body: JSON.stringify({ available })
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
  }
  
  return response.json();
};