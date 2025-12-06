// Backend/models/user.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Le nom est obligatoire"],
      trim: true,
      minlength: [3, "Le nom doit contenir au moins 3 caractères"],
    },
    email: {
      type: String,
      required: [true, "L'email est obligatoire"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email invalide"],
    },
    password: {
      type: String,
      required: [true, "Le mot de passe est obligatoire"],
      minlength: [8, "Le mot de passe doit contenir au moins 8 caractères"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    phone: {
      type: String,
      default: "",
      trim: true,
      match: [/^((\+216)?\s?)?[0-9]{8}$/, "Numéro de téléphone invalide"],
    },
    idNumber: {
      type: String,
      default: "",
      unique: true,
      sparse: true,
      match: [/^[0-9]{8}$/, "Le numéro d'identité doit contenir exactement 8 chiffres"],
    },
  },
  {
    timestamps: true,
  }
);

// Index pour recherche rapide par email
userSchema.index({ email: 1 });

// Empêche la redéclaration du modèle (important en dev avec hot-reload)
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;