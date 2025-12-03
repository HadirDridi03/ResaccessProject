// seedAdmin.js
import mongoose from "mongoose";
import User from "./models/user.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config(); // Charge les variables d'environnement (.env)

const createAdmin = async () => {
  try {
    // Connexion à la base de données
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connecté à MongoDB");

    // Vérifie si l'admin existe déjà
    const adminExists = await User.findOne({ email: "admin@gmail.com" });

    if (adminExists) {
      console.log("L'admin existe déjà : admin@gmail.com");
      process.exit(0);
    }

    // Création de l'admin
    const hashedPassword = await bcrypt.hash("Admin1234", 10);

    await User.create({
      name: "Administrateur",
      email: "admin@gmail.com",
      password: hashedPassword,
      role: "admin",
      phone: "00112233",
      idNumber: "00000000",
    });

    console.log("Admin créé avec succès !");
    console.log("Email : admin@gmail.com");
    console.log("Mot de passe : Admin1234");
    console.log("");
    console.log("Tu peux maintenant te connecter en tant qu'admin !");
    process.exit(0);
  } catch (error) {
    console.error("Erreur lors de la création de l'admin :", error.message);
    process.exit(1);
  }
};

createAdmin();