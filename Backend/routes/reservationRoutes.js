// routes/reservationRoutes.js
import express from "express";
import { createReservation, getReservationsByEquipment } from "../controllers/reservationController.js";

const router = express.Router();

// Créer une réservation
router.post("/", createReservation);

// Récupérer toutes les réservations d'un équipement
router.get("/equipment/:equipmentId", getReservationsByEquipment);

export default router;