// Backend/routes/userRoutes.js
import express from "express";
import User from "../models/user.js";
import bcrypt from "bcryptjs";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Middleware admin (réutilise protect + vérification rôle)
const adminOnly = async (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Accès refusé : administrateur requis" });
};

// GET tous les utilisateurs
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// GET un utilisateur par ID
router.get("/:id", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// PUT modifier un utilisateur
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const { name, email, role, phone, idNumber } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    // Vérif email unique
    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: "Email déjà utilisé" });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.phone = phone || user.phone;
    user.idNumber = idNumber || user.idNumber;

    await user.save();

    res.json({
      message: "Utilisateur modifié",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        idNumber: user.idNumber,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// PUT changer mot de passe
router.put("/:id/password", protect, adminOnly, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 8)
      return res.status(400).json({ message: "Mot de passe trop court" });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Mot de passe mis à jour" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// DELETE supprimer utilisateur
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    // Optionnel : empêcher suppression de soi-même
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: "Vous ne pouvez pas supprimer votre propre compte" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Utilisateur supprimé" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default router;