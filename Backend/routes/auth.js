import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

const router = express.Router();

// 🟢 INSCRIPTION
router.post("/register", async (req, res) => {
  const { name, email, password, confirmPassword, role } = req.body;

  try {
    // Vérification des champs
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Les mots de passe ne correspondent pas" });
    }

    if (password.length < 8 || !/(?=.*[A-Z])(?=.*[0-9])/.test(password)) {
      return res.status(400).json({
        message:
          "Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre",
      });
    }

    // Vérification de l'existence de l'utilisateur
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Cet utilisateur existe déjà" });
    }

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création de l'utilisateur avec le rôle choisi
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user", // 👈 Par défaut : user
    });

    // Réponse
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 🟣 CONNEXION
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // 👈 Envoi du rôle pour le frontend
        token: generateToken(user._id),
      });
    } else {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe invalide" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default router;

