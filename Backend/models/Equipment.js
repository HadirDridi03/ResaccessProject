//Equipment.js
import mongoose from "mongoose";

const equipmentSchema = new mongoose.Schema(
  {
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
    available: {
      type: Boolean,
      default: true,
    },
    start_time: {
      type: String,
      default: null,
    },
    end_time: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// ✅ Protection obligatoire
const Equipment =
  mongoose.models.Equipment ||
  mongoose.model("Equipment", equipmentSchema);

export default Equipment;
