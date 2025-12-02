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
    required: true,
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
 
  available: {
    type: Boolean,
    default: true,        // DISPONIBLE PAR DÉFAUT
  },
  
},
{ 
  timestamps: true 
});

const Equipment = mongoose.model("Equipment", equipmentSchema);
export default Equipment;