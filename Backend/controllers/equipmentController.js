//equipementController.js
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
      details: err.message // AJOUTÉ POUR DEBUG
    });
  }
};

// Ajoute à la fin du fichier equipmentController.js
export const updateEquipmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { available } = req.body;

    console.log("Changement statut:", { id, available }); // Pour debug

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID d'équipement invalide" });
    }

    if (typeof available !== 'boolean') {
      return res.status(400).json({ error: "Le statut doit être un booléen (true/false)" });
    }

    const equipment = await Equipment.findByIdAndUpdate(
      id,
      { available },
      { new: true, runValidators: true }
    );

    if (!equipment) {
      return res.status(404).json({ error: "Équipement non trouvé" });
    }

    res.json({
      message: `Statut mis à jour: ${available ? 'Disponible' : 'En maintenance'}`,
      equipment
    });
  } catch (err) {
    console.error("Erreur mise à jour statut:", err.message);
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
};