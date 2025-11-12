// Backend/controllers/equipmentController.js
import Equipment from "../models/Equipment.js";
import Reservation from "../models/Reservation.js";
import mongoose from "mongoose"; // AJOUTÉ : import mongoose

// CREATE
// controllers/equipmentController.js
export const createEquipment = async (req, res) => {
  try {
    const { name, category, start_time, end_time, description } = req.body;
    const photo = req.file ? req.file.path : null;

    const newEquipment = new Equipment({
      name,
      category,
      start_time,
      end_time,
      description,
      photo,
      available: true  // DISPONIBLE PAR DÉFAUT
    });

    await newEquipment.save();
    res.status(201).json(newEquipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// READ ALL
export const getAllEquipment = async (req, res) => {
  try {
    const equipmentList = await Equipment.find();
    res.status(200).json(equipmentList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ ONE
export const getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) return res.status(404).json({ error: "Équipement non trouvé" });
    res.status(200).json(equipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
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

// DELETE
export const deleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndDelete(req.params.id);
    if (!equipment) return res.status(404).json({ error: "Équipement non trouvé" });
    res.status(200).json({ message: "Équipement supprimé" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// FONCTION CALENDRIER – CORRIGÉE (require → import)
// Remplace TOUTE la fonction getCalendrier par ÇA :
export const getCalendrier = async (req, res) => {
  try {
    const { id } = req.params;
    let { mois, annee } = req.query;

    // VALIDATION + CONVERSION IMMÉDIATE
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID équipement invalide" });
    }

    const equipmentId = new mongoose.Types.ObjectId(id); // CONVERSION ICI

    // Mois/année
    const today = new Date();
    const moisFinal = mois ? parseInt(mois, 10) : today.getMonth() + 1;
    const anneeFinal = annee ? parseInt(annee, 10) : today.getFullYear();

    if (moisFinal < 1 || moisFinal > 12 || anneeFinal < 2020 || anneeFinal > 2030) {
      return res.status(400).json({ error: "Mois ou année invalide" });
    }

    // Vérifier existence
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ error: "Équipement non trouvé" });
    }

    // APPEL AVEC ObjectId
    const reservations = await Reservation.getByEquipmentAndMonth(
      equipmentId, // ObjectId, pas string
      moisFinal,
      anneeFinal
    );

    // Formatage
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
      details: err.message // AJOUTÉ POUR DEBUG
    });
  }
};