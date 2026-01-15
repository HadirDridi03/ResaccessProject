// Backend/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import equipmentRoutes from "./routes/equipmentRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";
import userRoutes from "./routes/userRoutes.js"; 

// Charger les variables d'environnement
dotenv.config();

// Connexion à MongoDB
connectDB();

const app = express();

// ========================================
// ✅ MIDDLEWARE AVEC LOGS
// ========================================

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ✅ CORS AMÉLIORÉ
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:5173",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type", 
      "Authorization", 
      "X-Requested-With",
      "Accept",
      "Origin"
    ],
    exposedHeaders: ["Authorization"],
    optionsSuccessStatus: 200,
    maxAge: 86400
  })
);

// ✅ AUGMENTER LA LIMITE POUR LES IMAGES
app.use(express.json({ limit: "50mb" })); // Augmenté à 50MB
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ✅ SERVIR LES UPLOADS
app.use("/uploads", express.static("uploads"));

// ✅ TEST ROUTE POUR UPLOAD
app.post("/api/test-upload", (req, res) => {
  console.log("✅ Test upload appelé");
  res.json({ 
    message: "Route upload fonctionnelle",
    timestamp: new Date().toISOString()
  });
});

// ========================================
// ✅ ROUTES PRINCIPALES
// ========================================
app.use("/api/auth", authRoutes);
app.use("/api/equipments", equipmentRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/users", userRoutes);

// ========================================
// ✅ LANCEMENT SERVEUR
// ========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  ========================================
  🚀 SERVEUR BACKEND DÉMARRÉ
  ========================================
  📍 Port: ${PORT}
  🌐 URL: http://localhost:${PORT}
  📁 Upload: http://localhost:${PORT}/uploads/
  📏 Taille max: 50MB
  ========================================
  `);
});