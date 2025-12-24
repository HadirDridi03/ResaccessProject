// models/Reservation.js
import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema({
  equipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Equipment",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: { type: String, required: true },           // YYYY-MM-DD
  heureDebut: { type: String, required: true },      // HH:MM
  heureFin: { type: String, required: true },        // HH:MM
  reason: { type: String, default: "" },
  status: {
  type: String,
  enum: ["pending", "approved", "rejected", "annulée"], // ← Valeurs en anglais + annulée si tu l'utilises
  default: "pending"
},
}, { timestamps: true });

reservationSchema.index({ equipment: 1, date: 1 });
reservationSchema.index({ user: 1, date: -1 });

export default mongoose.model("Reservation", reservationSchema);