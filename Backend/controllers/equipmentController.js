// Backend/controllers/equipmentController.js
import Equipment from "../models/Equipment.js";
import Reservation from "../models/Reservation.js";
import mongoose from "mongoose"; 

export const createEquipment = async (req, res) => {
  try {
    const { name, category, start_time, end_time, description } = req.body;
    const photo = req.file ? req.file.path : null;

    const newEquipment = new Equipment({
      name,
      category,
      description,
      photo,
      available: true  
    });

    await newEquipment.save();
    res.status(201).json(newEquipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllEquipment = async (req, res) => {
  try {
    const equipmentList = await Equipment.find();
    res.status(200).json(equipmentList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) return res.status(404).json({ error: "Équipement non trouvé" });
    res.status(200).json(equipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateEquipment = async (req, res) => {
  try {
    const { name, category, available, start_time, end_time, description } = req.body;

    const updateData = {
      name: name?.trim(),
      category: category || "Autre",
      available: available === "true" || available === true || available === 1,
      start_time: start_time || null,
      end_time: end_time || null,
      description: description || "",
    };

    if (req.file) {
      updateData.photo = req.file.path;
    }

    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!equipment) return res.status(404).json({ error: "Équipement non trouvé" });

    res.status(200).json({ equipment });
  } catch (err) {
    console.error("Erreur mise à jour:", err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndDelete(req.params.id);
    if (!equipment) return res.status(404).json({ error: "Équipement non trouvé" });
    res.status(200).json({ message: "Équipement supprimé" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//US04
export const getCalendrier = async (req, res) => {
  try {
    const { id } = req.params;
    let { mois, annee } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID équipement invalide" });
    }

    const equipmentId = new mongoose.Types.ObjectId(id); 

    const today = new Date();
    const moisFinal = mois ? parseInt(mois, 10) : today.getMonth() + 1;
    const anneeFinal = annee ? parseInt(annee, 10) : today.getFullYear();

    if (moisFinal < 1 || moisFinal > 12 || anneeFinal < 2020 || anneeFinal > 2030) {
      return res.status(400).json({ error: "Mois ou année invalide" });
    }

    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ error: "Équipement non trouvé" });
    }

    const reservations = await Reservation.getByEquipmentAndMonth(
      equipmentId, 
      moisFinal,
      anneeFinal
    );

    const formatted = reservations.map(r => ({
      id: r._id.toString(),
      date: r.startTime.toISOString().split("T")[0],
      heure_debut: r.startTime.toTimeString().slice(0, 5),
      heure_fin: r.endTime.toTimeString().slice(0, 5),
      utilisateur: r.user?.name || "Anonyme",
      statut: r.status,
    }));

    res.json({
      equipement_id: id,
      mois: moisFinal,
      annee: anneeFinal,
      reservations: formatted,
    });
  } catch (err) {
    console.error("ERREUR CALENDRIER:", err.message);
    res.status(500).json({ 
      error: "Impossible de charger le calendrier",
      details: err.message
    });
  }
};

// ✅ FONCTION AMÉLIORÉE POUR LE CHANGEMENT DE STATUT
export const updateEquipmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { available } = req.body;

    console.log("=== 🔧 BACKEND - Changement statut ===");
    console.log("📋 ID équipement:", id);
    console.log("📦 Body reçu:", req.body);
    console.log("👤 Utilisateur:", req.user ? `${req.user.name} (${req.user.role})` : "Non authentifié");
    console.log("Type de 'available':", typeof available);

    // Validation de l'ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("❌ ID invalide");
      return res.status(400).json({ error: "ID d'équipement invalide" });
    }

    // Validation du statut
    if (available === undefined || available === null) {
      console.log("❌ Statut manquant");
      return res.status(400).json({ 
        error: "Le statut 'available' est requis",
        received: available
      });
    }

    // Conversion en booléen
    let availableBool;
    if (typeof available === 'boolean') {
      availableBool = available;
    } else if (typeof available === 'string') {
      // Accepte "true", "false", "1", "0"
      const lowerValue = available.toLowerCase().trim();
      if (lowerValue === 'true' || lowerValue === '1') {
        availableBool = true;
      } else if (lowerValue === 'false' || lowerValue === '0') {
        availableBool = false;
      } else {
        console.log("❌ Valeur string invalide:", available);
        return res.status(400).json({ 
          error: "Le statut doit être 'true', 'false', '1' ou '0'",
          received: available
        });
      }
    } else if (available === 1) {
      availableBool = true;
    } else if (available === 0) {
      availableBool = false;
    } else {
      console.log("❌ Type de statut invalide:", typeof available);
      return res.status(400).json({ 
        error: "Le statut doit être un booléen (true/false)", 
        received: available,
        type: typeof available
      });
    }

    console.log(`🔄 Changement vers: ${availableBool ? 'DISPONIBLE' : 'MAINTENANCE'}`);

    // Mise à jour dans la base de données
    const equipment = await Equipment.findByIdAndUpdate(
      id,
      { available: availableBool },
      { new: true, runValidators: true }
    );

    if (!equipment) {
      console.log("❌ Équipement non trouvé");
      return res.status(404).json({ error: "Équipement non trouvé" });
    }

    console.log("✅ Statut mis à jour avec succès");
    console.log("Nouvel équipement:", {
      id: equipment._id,
      name: equipment.name,
      available: equipment.available
    });

    res.json({
      success: true,
      message: `Statut mis à jour: ${availableBool ? 'Disponible' : 'En maintenance'}`,
      equipment: {
        _id: equipment._id,
        name: equipment.name,
        available: equipment.available,
        category: equipment.category
      }
    });
  } catch (err) {
    console.error("❌ Erreur mise à jour statut:", err.message);
    console.error("Stack:", err.stack);
    res.status(500).json({ 
      error: "Erreur serveur lors du changement de statut", 
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};