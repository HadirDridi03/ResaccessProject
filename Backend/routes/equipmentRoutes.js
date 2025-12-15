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
  updateEquipmentStatus, // ← IMPORT AJOUTÉ
} from "../controllers/equipmentController.js";

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

const router = express.Router();

// Route pour créer un équipement
router.post("/", upload.single("photo"), createEquipment);

// Route pour obtenir tous les équipements
router.get("/", getAllEquipment);

// Route pour obtenir un équipement par ID
router.get("/:id", getEquipmentById);

// Route pour mettre à jour un équipement
router.put("/:id", upload.single("photo"), updateEquipment);

// Route pour supprimer un équipement
router.delete("/:id", deleteEquipment);

// Route pour obtenir le calendrier d'un équipement
router.get("/:id/calendrier", getCalendrier);

// Route pour changer le statut disponible/maintenance (NOUVELLE ROUTE)
router.patch("/:id/status", updateEquipmentStatus);

export default router;