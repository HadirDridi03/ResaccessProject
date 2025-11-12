// controllers/reservationController.js
import mongoose from "mongoose";
import Reservation from "../models/Reservation.js";
import Equipment from "../models/Equipment.js";
import User from "../models/User.js";

// controllers/reservationController.js
export const createReservation = async (req, res) => {
  try {
    const { equipmentId, date, startTime, endTime, reason } = req.body;

    // 1. Vérifications
    if (!equipmentId || !date || !startTime || !endTime) {
      return res.status(400).json({ error: "Tous les champs sont obligatoires" });
    }

    if (!mongoose.Types.ObjectId.isValid(equipmentId)) {
      return res.status(400).json({ error: "ID invalide" });
    }

    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) return res.status(404).json({ error: "Équipement non trouvé" });

    // 2. Construire les dates correctement
    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(`${date}T${endTime}:00`);

    if (isNaN(startDateTime) || isNaN(endDateTime)) {
      return res.status(400).json({ error: "Format de date/heure invalide" });
    }

    if (startDateTime >= endDateTime) {
      return res.status(400).json({ error: "L'heure de début doit être avant la fin" });
    }

    if (startDateTime < new Date()) {
      return res.status(400).json({ error: "Réservation dans le passé interdite" });
    }

    // 3. Vérifier conflit
    const conflict = await Reservation.findOne({
      equipment: equipmentId,
      date: { $eq: date },
      $or: [
        { startTime: { $lt: endDateTime }, endTime: { $gt: startDateTime } }
      ]
    });

    if (conflict) {
      return res.status(400).json({ error: "Créneau déjà réservé" });
    }

    // 4. Créer réservation
    const reservation = new Reservation({
      equipment: equipmentId,
      user: req.user?._id || null,
      date: date, // YYYY-MM-DD
      startTime: startDateTime,
      endTime: endDateTime,
      reason: reason || "Aucun motif",
      status: "en_attente"
    });

    await reservation.save();

    res.status(201).json({
      message: "Réservation créée",
      reservation: {
        id: reservation._id,
        date,
        debut: startTime,
        fin: endTime,
        motif: reservation.reason
      }
    });

  } catch (err) {
    console.error("Erreur création réservation:", err.message);
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
};

// Dans le même fichier
export const getReservationsByEquipment = async (req, res) => {
  try {
    const { equipmentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(equipmentId)) {
      return res.status(400).json({ error: "ID invalide" });
    }

    const reservations = await Reservation.find({ equipment: equipmentId })
      .select("date startTime endTime")
      .lean();

   // Dans getReservationsByEquipment
const formatted = reservations.map(r => {
  const start = new Date(r.startTime);
  const end = new Date(r.endTime);

  // Forcer la date en LOCAL
  const localDate = new Date(start.getTime() - start.getTimezoneOffset() * 60000)
    .toISOString().split("T")[0];

  return {
    date: r.date || localDate,
    heureDebut: start.toTimeString().slice(0, 5),
    heureFin: end.toTimeString().slice(0, 5)
  };
});

    res.json(formatted);
  } catch (err) {
    console.error("Erreur récupération:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};