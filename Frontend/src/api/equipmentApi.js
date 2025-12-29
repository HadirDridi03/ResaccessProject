import axios from 'axios';

const API_URL = 'http://localhost:5000/api/equipments';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json'
  };
  
  // Vérification détaillée du token
  if (token) {
    console.log("Token trouvé dans localStorage, longueur:", token.length);
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    console.warn("⚠️ Aucun token trouvé dans localStorage");
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
    console.log("=== FRONTEND - Début changement statut ===");
    console.log("ID équipement:", id);
    console.log("Nouveau statut:", available);
    console.log("Type statut:", typeof available);
    console.log("URL:", `${API_URL}/${id}/status`);
    
    const headers = getAuthHeaders();
    console.log("Headers envoyés:", headers);
    
    // Préparer les données
    const requestData = { available };
    console.log("Données envoyées:", requestData);
    
    const response = await axios({
      method: 'PATCH',
      url: `${API_URL}/${id}/status`,
      data: requestData,
      headers: headers,
      timeout: 10000 // 10 secondes
    });
    
    console.log("✅ Réponse reçue du serveur:");
    console.log("Status:", response.status);
    console.log("Données:", response.data);
    
    return response.data;
    
  } catch (error) {
    console.error("❌ ERREUR API DÉTAILLÉE:");
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("Nom:", error.name);
    
    if (error.response) {
      // Le serveur a répondu avec un statut d'erreur
      console.error("Status HTTP:", error.response.status);
      console.error("Données erreur:", error.response.data);
      console.error("Headers erreur:", error.response.headers);
      
      const errorMessage = error.response.data?.error || 
                          error.response.data?.message || 
                          `Erreur serveur (${error.response.status})`;
      
      const customError = new Error(errorMessage);
      customError.status = error.response.status;
      customError.data = error.response.data;
      throw customError;
      
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      console.error("Aucune réponse reçue du serveur");
      console.error("Requête:", error.request);
      
      const customError = new Error("Impossible de se connecter au serveur. Vérifiez que le serveur backend est démarré sur localhost:5000");
      customError.code = 'NO_RESPONSE';
      throw customError;
      
    } else {
      // Une erreur s'est produite lors de la configuration de la requête
      console.error("Erreur de configuration:", error.message);
      throw error;
    }
  }
};

// Fonction fallback avec fetch (en cas de problème avec axios)
const updateEquipmentStatusFallback = async (id, available) => {
  console.log("🔄 Tentative avec fetch (fallback)...");
  
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(`${API_URL}/${id}/status`, {
      method: 'PATCH',
      headers: headers,
      body: JSON.stringify({ available }),
      mode: 'cors'
    });
    
    console.log("Fetch - Status:", response.status);
    console.log("Fetch - OK?", response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Fetch - Erreur texte:", errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }
      
      const error = new Error(errorData.error || `Erreur HTTP ${response.status}`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }
    
    const data = await response.json();
    console.log("Fetch - Réponse JSON:", data);
    return data;
    
  } catch (fetchError) {
    console.error("❌ Erreur fetch:", fetchError);
    throw fetchError;
  }
};