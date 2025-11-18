//models/user.js
import mongoose from "mongoose";

// 📦 Définition du schéma utilisateur
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    phone: {
      type: String,
      default: "",
    },
    idNumber: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // Ajoute createdAt et updatedAt automatiquement
  }
);

// ✅ Empêche la redéclaration du modèle "User" si Mongoose l’a déjà compilé
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
