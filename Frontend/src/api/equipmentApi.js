import axios from 'axios';

const API_URL = 'http://localhost:5000/api/equipments';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    console.log("Token trouvé, longueur:", token.length);
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    console.warn("⚠️ Aucun token dans localStorage !");
  }

  return headers;
};

export const createEquipment = async (data) => {
  const headers = getAuthHeaders();

  // Pour FormData (photo + champs), on laisse axios gérer le Content-Type automatiquement
  // → Ne force PAS 'application/json' ici !
  const response = await axios.post(API_URL, data, {
    headers: {
      ...headers,
      // Supprime ou laisse axios définir 'multipart/form-data' automatiquement
    }
  });
  return response.data;
};

export const getAllEquipment = async () => {
  const response = await axios.get(API_URL, { headers: getAuthHeaders() });
  return response.data;
};

export const getEquipmentById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, { headers: getAuthHeaders() });
  return response.data;
};

export const updateEquipment = async (id, data) => {
  const headers = getAuthHeaders();

  const response = await axios.put(`${API_URL}/${id}`, data, {
    headers: {
      ...headers,
      // Pas besoin de forcer Content-Type pour FormData
    }
  });
  return response.data;
};

export const deleteEquipment = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeaders() });
  return response.data;
};

export const updateEquipmentStatus = async (id, available) => {
  try {
    console.log("=== FRONTEND - Changement statut ===");
    console.log("ID:", id, "| Statut:", available);

    const response = await axios.patch(
      `${API_URL}/${id}/status`,
      { available },
      { headers: getAuthHeaders() }
    );

    console.log("Succès:", response.data);
    return response.data;
  } catch (error) {
    console.error("Erreur update status:", error.response?.data || error.message);
    throw error;
  }
};