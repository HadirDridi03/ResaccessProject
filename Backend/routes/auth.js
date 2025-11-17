import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import generateToken from "../utils/generateToken.js";
import auth from "../utils/auth.js";

const router = express.Router();

// 🟢 INSCRIPTION
router.post("/register", async (req, res) => {
  const { name, email, password, confirmPassword, role, phone, idNumber } = req.body;

  try {
    // Vérification des champs requis
    if (!name || !email || !password || !confirmPassword || !phone || !idNumber) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Les mots de passe ne correspondent pas" });
    }

    if (password.length < 8 || !/(?=.*[A-Z])(?=.*[0-9])/.test(password)) {
      return res.status(400).json({
        message: "Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre",
      });
    }

    // Vérification de l'existence de l'utilisateur
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Cet utilisateur existe déjà" });
    }

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création du nouvel utilisateur
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
      phone,
      idNumber,
    });

    // Réponse envoyée au frontend
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      idNumber: user.idNumber,
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
        role: user.role,
        phone: user.phone,
        idNumber: user.idNumber,
        token: generateToken(user._id),
      });
    } else {
      return res.status(401).json({ message: "Email ou mot de passe invalide" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// MISE À JOUR DU PROFIL (ce que ton Profile.jsx appelle en PUT)
router.put("/profile", auth, async (req, res) => {
  try {
    const { name, email, phone, idNumber } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id, // ← vient du middleware auth
      { name, email, phone, idNumber },
      { new: true, runValidators: true }
    ).select("-password"); // on enlève le mot de passe de la réponse

    if (!updatedUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      idNumber: updatedUser.idNumber,
      role: updatedUser.role,
    });
  } catch (error) {
    console.error("Erreur mise à jour profil :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// SUPPRESSION DU COMPTE (ce que ton bouton rouge appelle en DELETE)
router.delete("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Tu peux aussi supprimer ses réservations ici si tu veux
    // await Reservation.deleteMany({ user: req.user.id });

    await User.deleteOne({ _id: req.user.id });

    res.json({ message: "Compte supprimé avec succès" });
  } catch (error) {
    console.error("Erreur suppression compte :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default router;
