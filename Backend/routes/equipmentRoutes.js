// Backend/routes/equipementRoutes.js
import express from "express";
import multer from "multer";
import {
  createEquipment,
  getAllEquipment,
  getEquipmentById,
  updateEquipment,
  deleteEquipment,
  getCalendrier,
  updateEquipmentStatus,
} from "../controllers/equipmentController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Configuration de multer pour l'upload des photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// ========================================
// ROUTES DE TEST (TEMPORAIRES - À CONSERVER POUR DÉBOGAGE)
// ========================================

// Route test publique
router.get("/test/public", (req, res) => {
  console.log("✅ Route test publique appelée");
  res.json({ 
    message: "Route publique fonctionnelle",
    timestamp: new Date().toISOString(),
    status: "OK"
  });
});

// Route test avec auth
router.get("/test/auth", protect, (req, res) => {
  console.log("✅ Route test auth appelée");
  res.json({ 
    message: "Route auth fonctionnelle",
    user: req.user ? {
      id: req.user._id,
      name: req.user.name,
      role: req.user.role,
      email: req.user.email
    } : null,
    timestamp: new Date().toISOString()
  });
});

// Route test avec admin
router.get("/test/admin", protect, admin, (req, res) => {
  console.log("✅ Route test admin appelée");
  res.json({ 
    message: "Route admin fonctionnelle",
    user: {
      id: req.user._id,
      name: req.user.name,
      role: req.user.role,
      email: req.user.email
    },
    timestamp: new Date().toISOString()
  });
});

// Route test PATCH simple (sans auth)
router.patch("/test/patch-demo", (req, res) => {
  console.log("✅ Test PATCH appelé");
  console.log("📦 Body reçu:", req.body);
  res.json({ 
    success: true, 
    method: "PATCH",
    body: req.body,
    message: "Test PATCH réussi"
  });
});

// ========================================
// ROUTES PUBLIQUES (lecture seule - tout le monde)
// ========================================
router.get("/", getAllEquipment);                    // Liste tous les équipements
router.get("/:id", getEquipmentById);                // Détail d'un équipement
router.get("/:id/calendrier", getCalendrier);        // Calendrier des réservations d'un équipement

// ========================================
// ROUTES ADMIN UNIQUEMENT (protégées + rôle admin)
// ========================================
router.post("/", protect, admin, upload.single("photo"), createEquipment);
router.put("/:id", protect, admin, upload.single("photo"), updateEquipment);
router.delete("/:id", protect, admin, deleteEquipment);
router.patch("/:id/status", protect, admin, updateEquipmentStatus);

export default router;