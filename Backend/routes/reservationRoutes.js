// routes/reservationRoutes.js
import express from "express";
import {
  createReservation,
  getMyReservations,
  updateReservation,
  cancelReservation,
  getReservationsByEquipment,
} from "../controllers/reservationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createReservation);
router.get("/my", protect, getMyReservations);
router.put("/:id", protect, updateReservation);
router.delete("/:id", protect, cancelReservation);
router.get("/equipment/:equipmentId", getReservationsByEquipment);

export default router;