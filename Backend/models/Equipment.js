import mongoose from "mongoose";

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  photo: {
    type: String, // path or URL of the image
    default: null,
  },
  start_time: {
    type: String, // ex: "08:00"
    default: null,
  },
  end_time: {
    type: String, // ex: "17:00"
    default: null,
  },
}, { timestamps: true });

const Equipment = mongoose.model("Equipment", equipmentSchema);
export default Equipment;
