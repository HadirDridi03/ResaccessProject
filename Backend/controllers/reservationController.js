// controllers/reservationController.js
import Reservation from "../models/Reservation.js";
import Equipment from "../models/Equipment.js";

/* ========================
   CRÉER UNE RÉSERVATION
======================== */
export const createReservation = async (req, res) => {
  try {
    const { equipmentId, date, startTime, endTime, reason } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    const userId = req.user._id;

    console.log("Réservation tentée par user:", userId);
    console.log("Données:", { equipmentId, date, startTime, endTime });

    if (!equipmentId || !date || !startTime || !endTime) {
      return res.status(400).json({ error: "Champs manquants" });
    }

    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) return res.status(404).json({ error: "Équipement non trouvé" });
    if (!equipment.available) return res.status(400).json({ error: "Équipement en maintenance" });

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
      .populate("equipment", "name category photo");

    res.status(201).json(populated);
  } catch (err) {
    console.error("Erreur création réservation:", err);
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
};

/* ========================
   MES RÉSERVATIONS
======================== */
export const getMyReservations = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = { user: req.user._id };

    if (status) query.status = status;
    if (search) {
      query.$or = [{ reason: { $regex: search, $options: 'i' } }];
    }

    const reservations = await Reservation.find(query)
      .populate('user', 'name')
      .populate('equipment', 'name');

    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ========================
   TOUTES LES RÉSERVATIONS (ADMIN)
======================== */
export const getAllReservations = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status && status !== "all") query.status = status;
    if (search) {
      query.$or = [{ reason: { $regex: search, $options: "i" } }];
    }

    const reservations = await Reservation.find(query)
      .populate("user", "name email")
      .populate("equipment", "name")
      .sort({ date: -1, heureDebut: 1 });

    res.json(reservations);
  } catch (err) {
    console.error("Erreur getAllReservations:", err);
    res.status(500).json({ error: "Erreur serveur lors de la récupération des réservations" });
  }
};

/* ========================
   MODIFIER RÉSERVATION
======================== */
export const updateReservation = async (req, res) => {
  try {
    const { date, startTime, endTime, reason, status } = req.body;

    const reservation = await Reservation.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!reservation) {
      return res.status(404).json({ error: "Réservation non trouvée" });
    }

    const today = new Date().toISOString().split("T")[0];
    if (reservation.date < today) {
      return res.status(400).json({ error: "Réservation passée" });
    }

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

      if (conflict) {
        return res.status(400).json({ error: "Créneau déjà réservé" });
      }

      reservation.date = newDate;
      reservation.heureDebut = newStart;
      reservation.heureFin = newEnd;
    }

    if (reason !== undefined) reservation.reason = reason;

    if (status !== undefined) {
      if (!["approved", "rejected", "pending"].includes(status)) {
        return res.status(400).json({ error: "Statut invalide" });
      }
      reservation.status = status;
    }

    await reservation.save();

    const populated = await reservation.populate("equipment", "name category");
    res.json(populated);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

/* ========================
   ANNULER RÉSERVATION
======================== */
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

/* ========================
   RÉSERVATIONS PAR ÉQUIPEMENT
======================== */
export const getReservationsByEquipment = async (req, res) => {
  try {
    const { equipmentId } = req.params;
    const reservations = await Reservation.find({ equipment: equipmentId })
      .select("date heureDebut heureFin")
      .lean();

    res.json(reservations);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

/* ========================
   ADMIN : UPDATE STATUS
======================== */
export const adminUpdateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ error: "Statut invalide" });
    }

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ error: "Réservation non trouvée" });
    }

    reservation.status = status;
    await reservation.save();

    const populatedReservation = await Reservation.findById(id)
      .populate("user", "name email")
      .populate("equipment", "name");

    res.json(populatedReservation);
  } catch (err) {
    console.error("Erreur adminUpdateStatus :", err);
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
};

/* =====================================================
   FONCTIONS SUPPLÉMENTAIRES (DU 2ᵉ CODE)
===================================================== */

/* Approuver une réservation */
export const approveReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ error: "Réservation introuvable" });

    reservation.status = "approved";
    await reservation.save();

    const populated = await Reservation.findById(req.params.id)
      .populate("equipment", "name category photo")
      .populate("user", "name email");

    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

/* Taux d’occupation hebdomadaire */
export const getWeeklyOccupancyRate = async (req, res) => {
  try {
    const equipments = await Equipment.find({ available: true });
    if (equipments.length === 0) return res.json({ occupancyRate: 0 });

    const reservations = await Reservation.find({ status: "approved" });

    let bookedHours = 0;
    reservations.forEach(r => {
      bookedHours += parseInt(r.heureFin) - parseInt(r.heureDebut);
    });

    const occupancyRate = Math.round((bookedHours / (equipments.length * 70)) * 100);
    res.json({ occupancyRate });
  } catch (err) {
    res.status(500).json({ occupancyRate: 0 });
  }
};

/* Stats utilisateur */
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalReservations = await Reservation.countDocuments({ user: userId });
    const approvedReservations = await Reservation.countDocuments({ user: userId, status: "approved" });
    const pendingApprovals = await Reservation.countDocuments({ user: userId, status: "pending" });
    const rejectedCount = await Reservation.countDocuments({ user: userId, status: "rejected" });

    res.json({
      totalReservations,
      approvedReservations,
      pendingApprovals,
      rejectedCount
    });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};
