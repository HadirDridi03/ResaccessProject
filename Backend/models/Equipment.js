// Backend/models/Equipment.js
import mongoose from "mongoose";

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    default: "Autre",
  },
  available: {
    type: Boolean,
    default: true, // ← AJOUTÉ ICI
  },
  start_time: {
    type: String,
    default: null,
  },
  end_time: {
    type: String,
    default: null,
  },
  description: {
    type: String,
    default: "",
  },
  photo: {
    type: String,
    default: null,
  },
}, { timestamps: true });

const Equipment = mongoose.model("Equipment", equipmentSchema);
export default Equipment;