import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import equipmentRoutes from "./routes/equipmentRoutes.js"; // <-- ajout US3

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
app.use("/uploads", express.static("uploads")); // <-- serve uploaded images

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/equipment", equipmentRoutes); // <-- route US3

// ✅ Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
