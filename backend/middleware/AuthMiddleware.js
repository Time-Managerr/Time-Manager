import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET;

// verifie le token
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "Token manquant." });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Format du token invalide." });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Token invalide ou expiré." });
    }

    req.user = decoded; // stocke l'utilisateur connecté dans la requête
    next();
  });
};

// Autorise uniquement certains rôles
export const authorizeProfile = (allowedProfiles) => (req, res, next) => {
  if (!allowedProfiles.includes(req.user.profile)) {
    return res.status(403).json({ message: 'Accès refusé : rôle insuffisant' });
  }
  next();
};
