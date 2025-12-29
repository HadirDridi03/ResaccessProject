// models/Reservation.js
import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
      required: true,
    },

    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
    },

    heureDebut: {
      type: String, // Format: HH:MM (ex: "08:00")
      required: true,
    },

    heureFin: {
      type: String, // Format: HH:MM (ex: "18:00")
      required: true,
    },

    motif: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "annulée"],
      default: "pending",
    },
  },
  {
    timestamps: true, // createdAt & updatedAt automatiques
  }
);

// ========================
// INDEX POUR PERFORMANCES
// ========================

// Calendrier : recherche par équipement + date
reservationSchema.index({ equipment: 1, date: 1 });

// Historique utilisateur (tri par date)
reservationSchema.index({ user: 1, date: -1 });

// Vérification rapide des conflits horaires
reservationSchema.index({
  equipment: 1,
  date: 1,
  heureDebut: 1,
  heureFin: 1,
});

// ========================
// PROTECTION CONTRE OVERWRITEMODELERROR
// ========================
const Reservation =
  mongoose.models.Reservation ||
  mongoose.model("Reservation", reservationSchema);


  // Méthode pour récupérer les réservations par équipement et mois (déjà utilisée ailleurs)
reservationSchema.statics.getPending = async function() {
  return this.find({ status: "pending" })
    .populate("user", "name email")
    .populate("equipment", "name category photo")
    .sort({ createdAt: -1 });
};


export default Reservation;
