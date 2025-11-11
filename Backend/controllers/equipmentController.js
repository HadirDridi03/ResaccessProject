// Backend/controllers/equipmentController.js
import Equipment from "../models/Equipment.js";

// CREATE
export const createEquipment = async (req, res) => {
  try {
    const { name, category, available, start_time, end_time, description } = req.body;
    const photo = req.file ? req.file.path : null;

    const equipment = new Equipment({
      name: name?.trim(),
      category: category || "Autre",
      available: available === "true" || available === true || available === 1,
      start_time: start_time || null,
      end_time: end_time || null,
      description: description || "",
      photo,
    });

    await equipment.save();
    res.status(201).json({ equipment });
  } catch (err) {
    console.error("Erreur création:", err);
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