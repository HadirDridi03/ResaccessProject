// Backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/user.js";

// Middleware de protection (vérifie le token) AVEC DÉBOGAGE
export const protect = async (req, res, next) => {
  console.log("=== 🛡️ MIDDLEWARE PROTECT ===");
  console.log(`📍 Route: ${req.method} ${req.originalUrl}`);
  console.log("📦 Headers Authorization:", req.headers.authorization);
  
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log("✅ Token extrait:", token ? `${token.substring(0, 30)}...` : "NULL");

      // Vérifie si le token est bien formé
      if (!token || token.length < 10) {
        console.log("❌ Token trop court ou invalide");
        return res.status(401).json({ 
          error: "Token invalide",
          details: "Format incorrect"
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("🔓 Token décodé:", {
        id: decoded.id,
        role: decoded.role,
        exp: new Date(decoded.exp * 1000).toISOString(),
        now: new Date().toISOString(),
        isExpired: decoded.exp * 1000 < Date.now()
      });

      // Vérifie si le token a expiré
      if (decoded.exp * 1000 < Date.now()) {
        console.log("❌ Token expiré");
        return res.status(401).json({ 
          error: "Token expiré",
          message: "Votre session a expiré, veuillez vous reconnecter"
        });
      }

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        console.log("❌ Utilisateur non trouvé dans DB");
        return res.status(401).json({ error: "Utilisateur non trouvé" });
      }

      console.log(`✅ Utilisateur authentifié: ${req.user.name} (${req.user.role})`);
      next();
    } catch (error) {
      console.error("❌ Erreur vérification token :", error.message);
      console.error("Stack:", error.stack);
      
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ 
          error: "Token expiré",
          message: "Votre session a expiré, veuillez vous reconnecter"
        });
      }
      
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ 
          error: "Token invalide",
          message: "Format de token incorrect"
        });
      }
      
      return res.status(401).json({ 
        error: "Authentification échouée",
        details: error.message 
      });
    }
  } else {
    console.log("❌ Pas de header Authorization ou format incorrect");
    console.log("Headers reçus:", Object.keys(req.headers));
    return res.status(401).json({ 
      error: "Accès refusé, token manquant",
      help: "Format attendu: 'Bearer <token>'",
      receivedHeaders: Object.keys(req.headers)
    });
  }
};

// Middleware admin avec débogage
export const admin = (req, res, next) => {
  console.log("=== 👑 MIDDLEWARE ADMIN ===");
  
  if (req.user && req.user.role === "admin") {
    console.log(`✅ Accès admin autorisé pour ${req.user.name}`);
    next();
  } else {
    console.log(`❌ Accès admin refusé. Role: ${req.user ? req.user.role : 'non connecté'}`);
    return res.status(403).json({ 
      error: "Accès refusé : droits administrateur requis",
      userRole: req.user ? req.user.role : "non connecté",
      userId: req.user ? req.user._id : null
    });
  }
};