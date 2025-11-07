import mongoose from "mongoose";

// --- Schéma des équipements ---
const equipmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // Nom de l’équipement (ex : Salle 101, Imprimante 3D)
    },
    description: {
      type: String,
      required: true, // Brève description de l’équipement
    },
    location: {
      type: String,
      required: true, // Lieu physique de l’équipement
    },
    capacity: {
      type: Number,
      default: 1, // Capacité d’utilisation (ex : 10 personnes max)
    },
    status: {
      type: String,
      enum: ["disponible", "maintenance", "hors_service"],
      default: "disponible",
    },
    imageUrl: {
      type: String, // Image de l’équipement (optionnelle)
    },
  },
  {
    timestamps: true,
  }
);

const Equipment = mongoose.model("Equipment", equipmentSchema);
export default Equipment;
