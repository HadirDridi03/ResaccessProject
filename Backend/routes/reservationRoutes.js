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
  approveReservation,        // Ancienne route /:id/approve (compatibilité)
  getUserStats,
  getWeeklyOccupancyRate,
} from "../controllers/reservationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ========================
// Middleware admin
// ========================
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res
    .status(403)
    .json({ error: "Accès refusé : droits administrateur requis" });
};

// ========================
// ROUTES UTILISATEUR (authentifié)
// ========================

// Créer une réservation
router.post("/", protect, createReservation);

// Mes réservations
router.get("/my", protect, getMyReservations);

// Modifier une réservation
router.put("/:id", protect, updateReservation);

// Annuler une réservation
router.delete("/:id", protect, cancelReservation);

// Réservations par équipement (calendrier)
router.get("/equipment/:equipmentId", getReservationsByEquipment);

// Statistiques utilisateur (dashboard)
router.get("/stats", protect, getUserStats);

// Taux d’occupation hebdomadaire
router.get("/weekly-occupancy", protect, getWeeklyOccupancyRate);

// ========================
// ROUTES ADMIN
// ========================

// Voir toutes les réservations
router.get("/", protect, admin, getAllReservations);

// Mettre à jour le statut (approved / rejected / pending)
router.put("/admin/status/:id", protect, admin, adminUpdateStatus);

// Ancienne route d’approbation (gardée pour compatibilité)
router.put("/:id/approve", protect, admin, approveReservation);

export default router;
