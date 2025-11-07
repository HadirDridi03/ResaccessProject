import mongoose from "mongoose";

// --- Schéma des réservations ---
const reservationSchema = new mongoose.Schema(
  {
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment", // Lien vers l’équipement réservé
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Lien vers l’utilisateur qui réserve
      required: true,
    },
    startTime: {
      type: Date,
      required: true, // Début de la réservation
    },
    endTime: {
      type: Date,
      required: true, // Fin de la réservation
    },
    status: {
      type: String,
      enum: ["en_attente", "validée", "refusée", "annulée"],
      default: "en_attente",
    },
    reason: {
      type: String, // Motif de réservation
    },
  },
  {
    timestamps: true,
  }
);

const Reservation = mongoose.model("Reservation", reservationSchema);
export default Reservation;
