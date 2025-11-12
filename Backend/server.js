import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import equipmentRoutes from "./routes/equipmentRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js"; // AJOUTÉ

// Charger les variables d'environnement
dotenv.config();

// Connexion à MongoDB
connectDB();

const app = express();

// Middleware CORS
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Parser les requêtes JSON
app.use(express.json({ limit: "10mb" }));

// Servir les fichiers uploadés
app.use("/uploads", express.static("uploads"));

// Routes API
app.use("/api/auth", authRoutes);
app.use("/api/equipments", equipmentRoutes);
app.use("/api/reservations", reservationRoutes); // NOUVELLE ROUTE

// Route de santé
app.get("/api/health", (req, res) => {
  res.status(200).json({
    message: "Backend ResAccess fonctionnel",
    timestamp: new Date().toISOString(),
    uptime: process.uptime().toFixed(2) + "s",
    environment: process.env.NODE_ENV || "development",
  });
});

// 404
app.use((req, res, next) => {
  res.status(404).json({
    error: "Route non trouvée",
    path: req.originalUrl,
    method: req.method,
  });
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error("Erreur serveur :", err.stack);
  res.status(err.status || 500).json({
    error: "Erreur interne du serveur",
    message: process.env.NODE_ENV === "production" ? "Une erreur est survenue" : err.message,
  });
});

// Lancement du serveur
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
  console.log(`Mode: ${process.env.NODE_ENV || "development"}`);
  console.log(`CORS: http://localhost:3000 autorisé`);
  console.log(`Routes : /api/auth, /api/equipments, /api/reservations`);
});

