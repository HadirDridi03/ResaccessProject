// controllers/reservationController.js
import mongoose from "mongoose";
import Reservation from "../models/Reservation.js";
import Equipment from "../models/Equipment.js";
import User from "../models/User.js"; // RÉIMPORTÉ

export const createReservation = async (req, res) => {
  try {
    const { equipmentId, date, startTime, endTime, reason } = req.body;

    // 1. Vérifier les champs
    if (!equipmentId || !date || !startTime || !endTime) {
      return res.status(400).json({ error: "Tous les champs sont obligatoires" });
    }

    // 2. Vérifier ID
    if (!mongoose.Types.ObjectId.isValid(equipmentId)) {
      return res.status(400).json({ error: "ID équipement invalide" });
    }

    // 3. Vérifier équipement
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ error: "Équipement non trouvé" });
    }

    // 4. Construire les dates
    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(`${date}T${endTime}:00`);

    // 5. Vérifier début < fin
    if (startDateTime >= endDateTime) {
      return res.status(400).json({ error: "L'heure de début doit être avant l'heure de fin" });
    }

    // 6. Vérifier futur
    if (startDateTime < new Date()) {
      return res.status(400).json({ error: "La réservation doit être dans le futur" });
    }

    // 7. Vérifier conflit
    const conflict = await Reservation.findOne({
      equipment: equipmentId,
      $or: [
        { startTime: { $lt: endDateTime }, endTime: { $gt: startDateTime } }
      ]
    });

    if (conflict) {
      return res.status(400).json({ 
        error: "Créneau déjà réservé",
        details: `Conflit avec réservation de ${conflict.startTime.toLocaleTimeString()} à ${conflict.endTime.toLocaleTimeString()}`
      });
    }

    // 8. Récupérer l'utilisateur connecté (quand tu auras le middleware auth)
    let userId = null;
    if (req.user?._id) {
      const user = await User.findById(req.user._id);
      if (user) userId = user._id;
    }

    // 9. Créer la réservation
    const reservation = new Reservation({
      equipment: equipmentId,
      user: userId, // ← Utilisateur connecté
      startTime: startDateTime,
      endTime: endDateTime,
      reason: reason || "Aucun motif",
      status: "en_attente"
    });

    await reservation.save();

    // 10. Réponse succès
    res.status(201).json({
      message: "Réservation créée avec succès",
      reservation: {
        id: reservation._id,
        date: reservation.startTime.toISOString().split("T")[0],
        debut: reservation.startTime.toTimeString().slice(0, 5),
        fin: reservation.endTime.toTimeString().slice(0, 5),
        motif: reservation.reason,
        statut: reservation.status,
        utilisateur: userId ? "Connecté" : "Anonyme"
      }
    });

  } catch (err) {
    console.error("Erreur création réservation:", err.message);
    res.status(500).json({ 
      error: "Erreur serveur", 
      details: err.message 
    });
  }
};