import express from "express";
import User from "../models/user.js"; 
import bcrypt from "bcryptjs";

const router = express.Router();

// Middleware pour vérifier si l'utilisateur est admin
const requireAdmin = async (req, res, next) => {
  try {
    // vérifier le token JWT 
    const token = req.headers.authorization?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ message: "Token manquant" });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Erreur d'authentification" });
  }
};

<<<<<<< HEAD
//  GET - Récupérer tous les utilisateurs (Admin seulement)
=======
//Récupérer tous les utilisateurs
>>>>>>> 51ab61a40a37111ad969761995559797eab8b3a3
router.get("/", requireAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    console.error("Erreur récupération users:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

<<<<<<< HEAD
// GET - Récupérer un utilisateur par ID
=======
// Récupérer un utilisateur par ID
>>>>>>> 51ab61a40a37111ad969761995559797eab8b3a3
router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    
    res.json(user);
  } catch (error) {
    console.error("Erreur récupération user:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

<<<<<<< HEAD
// PUT - Modifier un utilisateur
=======
// Modifier un utilisateur
>>>>>>> 51ab61a40a37111ad969761995559797eab8b3a3
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const { name, email, role, phone, idNumber } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérification de l'email
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: "Cet email est déjà utilisé" });
      }
    }

    // Mettre à jour les champs
    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.phone = phone || user.phone;
    user.idNumber = idNumber || user.idNumber;

    await user.save();

    // Retourner l'utilisateur sans le mot de passe
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    
    res.json({
      message: "Utilisateur modifié avec succès",
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("Erreur modification user:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

<<<<<<< HEAD
// PUT - Modifier le mot de passe d'un utilisateur
=======
// Modifier le mot de passe d'un utilisateur
>>>>>>> 51ab61a40a37111ad969761995559797eab8b3a3
router.put("/:id/password", requireAdmin, async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ 
        message: "Le mot de passe doit contenir au moins 8 caractères" 
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    res.json({ message: "Mot de passe modifié avec succès" });
  } catch (error) {
    console.error("Erreur modification password:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

<<<<<<< HEAD
// DELETE - Supprimer un utilisateur
=======
// Supprimer un utilisateur
>>>>>>> 51ab61a40a37111ad969761995559797eab8b3a3
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
<<<<<<< HEAD

=======
    
>>>>>>> 51ab61a40a37111ad969761995559797eab8b3a3
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    console.error("Erreur suppression user:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default router;