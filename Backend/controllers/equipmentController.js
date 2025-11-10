import Equipment from "../models/Equipment.js";

// 🟢 Create a new equipment
export const createEquipment = async (req, res) => {
  try {
    const { name, start_time, end_time } = req.body;
    const photo = req.file ? req.file.path : null;

    const equipment = new Equipment({
      name,
      photo,
      start_time,
      end_time,
    });

    await equipment.save();
    res.status(201).json({ message: "Equipment created successfully", equipment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🟡 Get all equipment
export const getAllEquipment = async (req, res) => {
  try {
    const equipmentList = await Equipment.find();
    res.status(200).json(equipmentList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔵 Get one equipment by ID
export const getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) return res.status(404).json({ message: "Equipment not found" });
    res.status(200).json(equipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🟠 Update an equipment
export const updateEquipment = async (req, res) => {
  try {
    const { name, start_time, end_time } = req.body;
    const photo = req.file ? req.file.path : undefined;

    const updatedFields = { name, start_time, end_time };
    if (photo) updatedFields.photo = photo;

    const equipment = await Equipment.findByIdAndUpdate(req.params.id, updatedFields, { new: true });

    if (!equipment) return res.status(404).json({ message: "Equipment not found" });

    res.status(200).json({ message: "Equipment updated successfully", equipment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔴 Delete an equipment
export const deleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndDelete(req.params.id);
    if (!equipment) return res.status(404).json({ message: "Equipment not found" });

    res.status(200).json({ message: "Equipment deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
