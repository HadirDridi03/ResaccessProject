import express from "express";
import multer from "multer";
import {
  createEquipment,
  getAllEquipment,
  getEquipmentById,
  updateEquipment,
  deleteEquipment
} from "../controllers/equipmentController.js";

const router = express.Router();

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

// 🧠 CRUD Routes
router.post("/", upload.single("photo"), createEquipment);
router.get("/", getAllEquipment);
router.get("/:id", getEquipmentById);
router.put("/:id", upload.single("photo"), updateEquipment);
router.delete("/:id", deleteEquipment);

export default router;
