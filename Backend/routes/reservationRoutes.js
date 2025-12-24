// routes/reservationRoutes.js
import express from "express";
import {
  createReservation,
  getMyReservations,
  updateReservation,
  cancelReservation,
  getReservationsByEquipment,
  getAllReservations,
  adminUpdateStatus,
  approveReservation,        // Ancienne route /:id/approve
  getUserStats,
  getWeeklyOccupancyRate,
} from "../controllers/reservationController.js";
import { protect } from "../middleware/authMiddleware.js";

// Middleware admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ error: "Accès refusé : droits administrateur requis" });
};

const router = express.Router();

// ========================
// ROUTES UTILISATEUR
// ========================
router.post("/", protect, createReservation);
router.get("/my", protect, getMyReservations);
router.put("/:id", protect, updateReservation);
router.delete("/:id", protect, cancelReservation);

// Récupérer les réservations d'un équipement (calendrier)
router.get("/equipment/:equipmentId", getReservationsByEquipment);

// Statistiques utilisateur (dashboard)
router.get("/stats", protect, getUserStats);
router.get("/weekly-occupancy", protect, getWeeklyOccupancyRate);

// ========================
// ROUTES ADMIN
// ========================
router.get("/", protect, admin, getAllReservations);           // Voir toutes les réservations
router.put("/admin/status/:id", protect, admin, adminUpdateStatus); // Changer le statut
router.put("/:id/approve", protect, admin, approveReservation);     // Ancienne route approbation

export default router;
