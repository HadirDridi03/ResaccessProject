// controllers/reservationController.js
import Reservation from "../models/Reservation.js";
import Equipment from "../models/Equipment.js";

export const createReservation = async (req, res) => {
  try {
    const { equipmentId, date, startTime, endTime, reason } = req.body;

    // AJOUT IMPORTANT : Gestion si req.user n'existe pas
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    const userId = req.user._id;

    // AJOUT DEBUG (à garder temporairement)
    console.log("Réservation tentée par user:", userId);
    console.log("Données:", { equipmentId, date, startTime, endTime });

    if (!equipmentId || !date || !startTime || !endTime) {
      return res.status(400).json({ error: "Champs manquants" });
    }

    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) return res.status(404).json({ error: "Équipement non trouvé" });
    if (!equipment.available) return res.status(400).json({ error: "Équipement en maintenance" });

    // Vérifier conflit
    const conflict = await Reservation.findOne({
      equipment: equipmentId,
      date,
      $or: [{ heureDebut: { $lt: endTime }, heureFin: { $gt: startTime } }]
    });

    if (conflict) return res.status(400).json({ error: "Créneau déjà réservé" });

    const reservation = new Reservation({
      equipment: equipmentId,
      user: userId,
      date,
      heureDebut: startTime,
      heureFin: endTime,
      reason: reason || "",
    });

    await reservation.save();

    const populated = await Reservation.findById(reservation._id)
      .populate("equipment", "name category photo"); // photo ajouté pour l'historique

    res.status(201).json(populated);
  } catch (err) {
    console.error("Erreur création réservation:", err); // ← IMPORTANT : ça affiche l'erreur réelle
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
};

export const getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .populate("equipment", "name category photo")
      .sort({ date: -1, heureDebut: -1 });

    res.json(reservations);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const updateReservation = async (req, res) => {
  try {
    const { date, startTime, endTime, reason } = req.body;
    const reservation = await Reservation.findOne({ _id: req.params.id, user: req.user._id });

    if (!reservation) return res.status(404).json({ error: "Réservation non trouvée" });

    const today = new Date().toISOString().split("T")[0];
    if (reservation.date < today) return res.status(400).json({ error: "Réservation passée" });

    // Vérifier conflit si changement d'horaire
    if (date || startTime || endTime) {
      const newDate = date || reservation.date;
      const newStart = startTime || reservation.heureDebut;
      const newEnd = endTime || reservation.heureFin;

      const conflict = await Reservation.findOne({
        equipment: reservation.equipment,
        date: newDate,
        _id: { $ne: reservation._id },
        $or: [{ heureDebut: { $lt: newEnd }, heureFin: { $gt: newStart } }]
      });

      if (conflict) return res.status(400).json({ error: "Créneau déjà réservé" });

      reservation.date = newDate;
      reservation.heureDebut = newStart;
      reservation.heureFin = newEnd;
    }

    if (reason !== undefined) reservation.reason = reason;

    await reservation.save();

    const populated = await reservation.populate("equipment", "name category");
    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findOne({ _id: req.params.id, user: req.user._id });

    if (!reservation) return res.status(404).json({ error: "Réservation non trouvée" });

    const today = new Date().toISOString().split("T")[0];
    if (reservation.date < today) return res.status(400).json({ error: "Réservation passée" });

    reservation.status = "annulée";
    await reservation.save();

    res.json({ message: "Réservation annulée" });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const getReservationsByEquipment = async (req, res) => {
  try {
    const { equipmentId } = req.params;
    const reservations = await Reservation.find({ equipment: equipmentId })
      .select("date heureDebut heureFin")
      .lean();

    const formatted = reservations.map(r => ({
      date: r.date,
      heureDebut: r.heureDebut,
      heureFin: r.heureFin
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};