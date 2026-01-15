// Frontend/src/api/equipmentApi.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/equipments';

// ✅ FONCTION SPÉCIALE POUR LES HEADERS AVEC FORM DATA
const getAuthHeadersForFormData = () => {
  const token = localStorage.getItem('token');
  
  console.log("=== 🔑 GET AUTH HEADERS FOR FORM DATA ===");
  console.log("📋 Token présent:", !!token);
  
  if (token) {
    console.log("📏 Longueur token:", token.length);
  } else {
    console.warn("⚠️ Pas de token trouvé pour FormData");
  }
  
  // IMPORTANT: Pour FormData, on ne met PAS 'Content-Type' !
  // Laisser le navigateur le définir automatiquement avec le bon boundary
  const headers = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log("✅ Header Authorization ajouté");
  }
  
  console.log("📦 Headers FormData:", headers);
  return headers;
};

// ✅ FONCTION POUR LES HEADERS NORMALES (JSON)
const getAuthHeadersForJson = () => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// ✅ CRÉATION D'ÉQUIPEMENT AVEC FORM DATA
export const createEquipment = async (formData) => {
  try {
    console.log("➕ Création nouvel équipement avec FormData");
    console.log("📦 FormData contenu:");
    for (let pair of formData.entries()) {
      console.log(`  ${pair[0]}:`, pair[0] === 'photo' ? `[Fichier: ${pair[1].name}]` : pair[1]);
    }
    
    const response = await axios.post(API_URL, formData, {
      headers: getAuthHeadersForFormData(),
      timeout: 30000, // 30 secondes pour l'upload
      onUploadProgress: (progressEvent) => {
        if (progressEvent.lengthComputable) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`📤 Upload: ${percentCompleted}%`);
        }
      }
    });
    
    console.log("✅ Équipement créé:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Erreur createEquipment:");
    
    if (error.response) {
      console.error("📡 Serveur erreur:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      console.error("📡 Pas de réponse du serveur");
    } else {
      console.error("⚙️ Erreur configuration:", error.message);
    }
    
    throw error;
  }
};

// ✅ MISE À JOUR D'ÉQUIPEMENT AVEC FORM DATA
export const updateEquipment = async (id, formData) => {
  try {
    console.log(`✏️ Mise à jour équipement ID: ${id} avec FormData`);
    console.log("📦 FormData contenu:");
    for (let pair of formData.entries()) {
      console.log(`  ${pair[0]}:`, pair[0] === 'photo' ? `[Fichier: ${pair[1].name}]` : pair[1]);
    }
    
    const response = await axios.put(`${API_URL}/${id}`, formData, {
      headers: getAuthHeadersForFormData(),
      timeout: 30000,
      onUploadProgress: (progressEvent) => {
        if (progressEvent.lengthComputable) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`📤 Upload: ${percentCompleted}%`);
        }
      }
    });
    
    console.log("✅ Équipement mis à jour:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Erreur updateEquipment:");
    
    if (error.response) {
      console.error("📡 Serveur erreur:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    }
    
    throw error;
  }
};

// ✅ CHANGEMENT DE STATUT (JSON)
export const updateEquipmentStatus = async (id, available) => {
  try {
    console.log("=== 🚀 Changement statut ===");
    console.log("📋 ID équipement:", id);
    console.log("🔄 Nouveau statut:", available);
    
    const response = await axios.patch(
      `${API_URL}/${id}/status`,
      { available },
      { 
        headers: getAuthHeadersForJson(),
        timeout: 15000
      }
    );

    console.log("✅ SUCCÈS:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Erreur update status:");
    
    if (error.response) {
      console.error("📡 Serveur erreur:", error.response.status, error.response.data);
    }
    
    throw error;
  }
};

// ✅ AUTRES FONCTIONS (JSON)
export const getAllEquipment = async () => {
  try {
    const response = await axios.get(API_URL, { 
      headers: getAuthHeadersForJson(),
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    console.error("❌ Erreur getAllEquipment:", error.response?.data || error.message);
    throw error;
  }
};

export const getEquipmentById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, { 
      headers: getAuthHeadersForJson(),
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    console.error("❌ Erreur getEquipmentById:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteEquipment = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, { 
      headers: getAuthHeadersForJson(),
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    console.error("❌ Erreur deleteEquipment:", error.response?.data || error.message);
    throw error;
  }
};