/*<<<<<<< HEAD


//  schéma utilisateur
=======

import mongoose from "mongoose";


>>>>>>> 51ab61a40a37111ad969761995559797eab8b3a3*/
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
    timestamps: true, 
  }
);

// empêche la redéclaration du modèle "User" si Mongoose l’a déjà compilé
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
 