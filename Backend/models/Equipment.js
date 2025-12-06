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
  description: {
    type: String,
    default: "",
  },
  photo: {
    type: String,
    default: null,
  },
  available: {  // ← AJOUTE CE CHAMP MANQUANT
    type: Boolean,
    default: true,
  },
  start_time: {  // ← AJOUTE POUR CONSISTENCE
    type: String,
    default: null,
  },
  end_time: {  // ← AJOUTE POUR CONSISTENCE
    type: String,
    default: null,
  },
}, { timestamps: true });

const Equipment = mongoose.model("Equipment", equipmentSchema);
export default Equipment;