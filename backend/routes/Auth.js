import express from "express";
import AuthController from "../controllers/AuthController.js";
import { verifyToken } from "../middleware/AuthMiddleware.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

// Login
router.post("/login", AuthController.login);

// la route retourne les infos du user connecté
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await prisma.users.findUnique({
      where: { idUser: req.user.id },
      select: { 
        idUser: true,
        firstname: true,
        lastname: true,
        email: true,
        phone: true,
        profile: true,
        avatar: true 
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Erreur route /me :", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
});

export default router;
