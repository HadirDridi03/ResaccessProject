import express from "express";
import multer from "multer";
import {
  createEquipment,
  getAllEquipment,
  getEquipmentById,
  updateEquipment,
  deleteEquipment,
  getCalendrier, // ← AJOUTÉ
} from "../controllers/equipmentController.js";

// 📸 Multer configuration for image upload
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

// 🧠 Express Router
const router = express.Router();

// 🟢 CREATE - Ajouter un équipement
router.post("/", upload.single("photo"), createEquipment);

// 🟡 READ ALL - Lister tous les équipements
router.get("/", getAllEquipment);

// 🟡 READ ONE - Détail d’un équipement
router.get("/:id", getEquipmentById);

// 🟠 UPDATE - Modifier un équipement
router.put("/:id", upload.single("photo"), updateEquipment);

// 🔴 DELETE - Supprimer un équipement
router.delete("/:id", deleteEquipment);

// 📅 NOUVELLE ROUTE : Voir le calendrier de réservation d’un équipement
// Ex: GET /api/equipements/507f1f77bcf86cd799439011/calendrier?mois=11&annee=2025
router.get("/:id/calendrier", getCalendrier);

export default router;
