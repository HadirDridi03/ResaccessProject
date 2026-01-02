// controllers/reservationController.js
import Reservation from "../models/Reservation.js";
import Equipment from "../models/Equipment.js";

/* ========================
   CRÉER UNE RÉSERVATION
======================== */
export const createReservation = async (req, res) => {
  try {
    const { equipment, date, heureDebut, heureFin, motif } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    if (!equipment || !date || !heureDebut || !heureFin) {
      return res.status(400).json({ error: "Champs manquants" });
    }

    const equipmentDoc = await Equipment.findById(equipment);
    if (!equipmentDoc) {
      return res.status(404).json({ error: "Équipement non trouvé" });
    }
    if (!equipmentDoc.available) {
      return res.status(400).json({ error: "Équipement en maintenance" });
    }

    // Vérification de conflit
    const conflict = await Reservation.findOne({
      equipment,
      date,
      $or: [{ heureDebut: { $lt: heureFin }, heureFin: { $gt: heureDebut } }],
    });

    if (conflict) {
      return res.status(400).json({ error: "Ce créneau est déjà réservé" });
    }

    const reservation = new Reservation({
      user: req.user._id,
      equipment,
      date,
      heureDebut,
      heureFin,
      motif: motif?.trim() || "",
      status: "pending",
    });

    await reservation.save();

    const populated = await Reservation.findById(reservation._id)
      .populate("equipment", "name category photo")
      .populate("user", "name email");

    res.status(201).json(populated);
  } catch (err) {
    console.error("Erreur création réservation:", err);
    res.status(500).json({ error: "Erreur serveur" });
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
      query.$or = [{ motif: { $regex: search, $options: "i" } }];
    }

    const reservations = await Reservation.find(query)
      .populate("equipment", "name category photo")
      .populate("user", "name")
      .sort({ date: -1, heureDebut: 1 });

    res.json(reservations);
  } catch (err) {
    console.error("Erreur getMyReservations:", err);
    res.status(500).json({ error: "Erreur serveur" });
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
      query.$or = [{ motif: { $regex: search, $options: "i" } }];
    }

    const reservations = await Reservation.find(query)
      .populate("user", "name email")
      .populate("equipment", "name category")
      .sort({ date: -1, heureDebut: 1 });

    res.json(reservations);
  } catch (err) {
    console.error("Erreur getAllReservations:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

/* ========================
   MODIFIER UNE RÉSERVATION (UTILISATEUR)
======================== */
export const updateReservation = async (req, res) => {
  try {
    const { date, heureDebut, heureFin, motif, status } = req.body;
    const { id } = req.params;

    const reservation = await Reservation.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!reservation) {
      return res
        .status(404)
        .json({ error: "Réservation non trouvée ou non autorisée" });
    }

    const today = new Date().toISOString().split("T")[0];
    if (reservation.date < today) {
      return res
        .status(400)
        .json({ error: "Impossible de modifier une réservation passée" });
    }

    // Vérification de conflit si date/heure changent
    if (date || heureDebut || heureFin) {
      const newDate = date || reservation.date;
      const newStart = heureDebut || reservation.heureDebut;
      const newEnd = heureFin || reservation.heureFin;

      const conflict = await Reservation.findOne({
        equipment: reservation.equipment,
        date: newDate,
        _id: { $ne: reservation._id },
        $or: [{ heureDebut: { $lt: newEnd }, heureFin: { $gt: newStart } }],
      });

      if (conflict) {
        return res
          .status(400)
          .json({ error: "Ce nouveau créneau est déjà réservé" });
      }

      reservation.date = newDate;
      reservation.heureDebut = newStart;
      reservation.heureFin = newEnd;
    }

    if (motif !== undefined) reservation.motif = motif.trim();

    // (optionnel) statut modifiable si besoin
    if (status && ["approved", "rejected", "pending"].includes(status)) {
      reservation.status = status;
    }

    await reservation.save();

    const populated = await Reservation.findById(id)
      .populate("equipment", "name category photo")
      .populate("user", "name email");

    res.json(populated);
  } catch (err) {
    console.error("Erreur updateReservation:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

/* ========================
   ANNULER UNE RÉSERVATION
======================== */
export const cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!reservation) {
      return res
        .status(404)
        .json({ error: "Réservation non trouvée ou non autorisée" });
    }

    const today = new Date().toISOString().split("T")[0];
    if (reservation.date < today) {
      return res
        .status(400)
        .json({ error: "Impossible d'annuler une réservation passée" });
    }

    await Reservation.findByIdAndDelete(id);
    res.json({ message: "Réservation annulée avec succès" });
  } catch (err) {
    console.error("Erreur cancelReservation:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

/* ========================
   RÉSERVATIONS PAR ÉQUIPEMENT (CALENDRIER)
======================== */
export const getReservationsByEquipment = async (req, res) => {
  try {
    const { equipmentId } = req.params;

    const reservations = await Reservation.find({ equipment: equipmentId })
      .select("date heureDebut heureFin status")
      .lean();

    res.json(reservations);
  } catch (err) {
    console.error("Erreur getReservationsByEquipment:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

/* ========================
   ADMIN : APPROUVER UNE RÉSERVATION
======================== */
export const approveReservation = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ error: "Réservation introuvable" });
    }

    reservation.status = "approved";
    await reservation.save();

    const populated = await Reservation.findById(id)
      .populate("equipment", "name category photo")
      .populate("user", "name email");

    res.json(populated);
  } catch (err) {
    console.error("Erreur approveReservation:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

/* ========================
   ADMIN : METTRE À JOUR LE STATUT
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

      const populated = await Reservation.findById(id)
        .populate("user", "name email")
        .populate("equipment", "name category");

      res.json(populated);
    } catch (err) {
      console.error("Erreur adminUpdateStatus:", err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  };

/* ========================
   TAUX D’OCCUPATION HEBDOMADAIRE
======================== */
export const getWeeklyOccupancyRate = async (req, res) => {
  try {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const equipments = await Equipment.find({ available: true });
    if (equipments.length === 0) return res.json({ occupancyRate: 0 });

    const totalPossibleHours = equipments.length * 10 * 7;

    const reservations = await Reservation.find({
      date: {
        $gte: startOfWeek.toISOString().split("T")[0],
        $lte: endOfWeek.toISOString().split("T")[0],
      },
      status: "approved",
    });

    let bookedHours = 0;
    reservations.forEach((r) => {
      bookedHours +=
        parseInt(r.heureFin.split(":")[0], 10) -
        parseInt(r.heureDebut.split(":")[0], 10);
    });

    const occupancyRate = Math.round(
      (bookedHours / totalPossibleHours) * 100
    );

    res.json({ occupancyRate });
  } catch (err) {
    console.error("Erreur getWeeklyOccupancyRate:", err);
    res.status(500).json({ occupancyRate: 0 });
  }
};

/* ========================
   STATS UTILISATEUR (DASHBOARD)
======================== */
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalReservations = await Reservation.countDocuments({ user: userId });
    const approvedReservations = await Reservation.countDocuments({
      user: userId,
      status: "approved",
    });
    const pendingApprovals = await Reservation.countDocuments({
      user: userId,
      status: "pending",
    });
    const rejectedCount = await Reservation.countDocuments({
      user: userId,
      status: "rejected",
    });

    const today = new Date().toISOString().split("T")[0];

    const upcoming = await Reservation.find({
      user: userId,
      status: "approved",
      date: { $gte: today },
    })
      .populate("equipment", "name category photo")
      .sort({ date: 1, heureDebut: 1 })
      .limit(5);

    const pending = await Reservation.find({
      user: userId,
      status: "pending",
    })
      .populate("equipment", "name category photo")
      .sort({ date: -1 })
      .limit(10);

    const rejected = await Reservation.find({
      user: userId,
      status: "rejected",
    })
      .populate("equipment", "name category photo")
      .sort({ date: -1 })
      .limit(10);

    res.json({
      totalReservations,
      approvedReservations,
      pendingApprovals,
      rejectedCount,
      upcoming,
      pending,
      rejected,
    });
  } catch (err) {
    console.error("Erreur getUserStats:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
