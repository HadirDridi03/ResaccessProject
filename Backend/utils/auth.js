import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ message: "Accès refusé" });

  const token = authHeader.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // très important : ton contrôleur reçoit req.user.id
    next();
  } catch (err) {
    res.status(401).json({ message: "Token invalide ou expiré" });
  }
};

export default auth;  