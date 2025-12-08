import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET;

export const verifyToken = (req, res, next) => {
  try {
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

      req.user = decoded; //  stocke les infos du token
      next();
    });
  } catch (error) {
    console.error("Erreur middleware JWT :", error);
    return res.status(500).json({ error: "Erreur interne serveur." });
  }
};
