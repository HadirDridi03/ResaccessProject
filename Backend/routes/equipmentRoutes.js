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