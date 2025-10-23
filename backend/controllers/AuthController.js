// src/controllers/AuthController.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();
const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET;

//  Schémas Zod pour validation
const loginSchema = z.object({
  email: z.string().email("Email invalide."),
  password: z.string().min(4, "Mot de passe trop court."),
});


export default {
  //  LOGIN
  async login(req, res) {
    try {
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: "Requête vide." });
      }

      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        const firstError = validation.error.errors?.[0]?.message || "Données invalides.";
        return res.status(400).json({ error: firstError });
      }

      const { email, password } = validation.data;
      const user = await prisma.users.findFirst({ where: { email } });
      if (!user) {
        return res.status(404).json({ error: "Utilisateur introuvable." });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Mot de passe incorrect." });
      }

      const token = jwt.sign(
        { id: user.idUser, email: user.email, profile: user.profile },
        SECRET_KEY,
        { expiresIn: "2h" }
      );

      return res.status(200).json({
        message: "Connexion réussie",
        token,
        user: {
          id: user.idUser,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          phone: user.phone,
          profile: user.profile,
        },
      });
    } catch (error) {
      console.error("Erreur dans login:", error);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  },

  //  PROFILE
  async profile(req, res) {
    try {
      const user = await prisma.users.findUnique({
        where: { idUser: req.user.id },
        select: { idUser: true, firstname: true, lastname: true, email: true, phone: true },
      });

      if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  },
};
