import mongoose from "mongoose";

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
    // 👇 Nouveau champ rôle
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user", // Par défaut, un nouvel utilisateur est un "user"
    },
  },
  {
    timestamps: true, // Ajoute createdAt et updatedAt automatiquement
  }
);

const User = mongoose.model("User", userSchema);
export default User;
