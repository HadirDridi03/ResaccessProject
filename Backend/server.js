import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import equipmentRoutes from "./routes/equipmentRoutes.js";

dotenv.config();

// ✅ Connect to MongoDB before starting the server
connectDB();

const app = express();

// ✅ Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/equipments", equipmentRoutes);

// ✅ Health check route
app.get("/api/health", (req, res) => {
    res.status(200).json({ 
        message: "✅ Backend ResAccess fonctionnel", 
        timestamp: new Date().toISOString() 
    });
});

// ✅ Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
