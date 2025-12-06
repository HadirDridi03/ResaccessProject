// models/Reservation.js
import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // ← CHANGÉ EN false
      default: null,  // ← Valeur par défaut
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["en_attente", "validée", "refusée", "annulée"],
      default: "en_attente",
    },
    reason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// INDEX pour performances
reservationSchema.index({ equipment: 1, startTime: 1 });

// FONCTION STATIQUE (déjà corrigée)
reservationSchema.statics.getByEquipmentAndMonth = async function(equipmentId, month, year) {
  if (!mongoose.Types.ObjectId.isValid(equipmentId)) {
    throw new Error("ID équipement invalide");
  }

  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

  return this.find({
    equipment: equipmentId,
    startTime: { $gte: startOfMonth, $lte: endOfMonth },
  })
    .select({ startTime: 1, endTime: 1, status: 1 })
    .populate("user", "name email")
    .sort({ startTime: 1 })
    .lean();
};

const Reservation = mongoose.model("Reservation", reservationSchema);
export default Reservation;