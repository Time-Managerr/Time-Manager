// src/controllers/UserController.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import UsersValidator from "../validators/UsersValidator.js";

const prisma = new PrismaClient();

export default {
  // Créer un utilisateur
  
  async createUser(req, res) {
    console.log("Requête reçue :", req.body); // log pour postman

    try {
      const validatedUser = UsersValidator.parse(req.body);

      const existingUser = await prisma.users.findFirst({
        where: { email: validatedUser.email },
      });

      if (existingUser)
        return res.status(400).json({ error: "Cet email est déjà utilisé." });

      const hashedPassword = await bcrypt.hash(validatedUser.password, 10);

      const newUser = await prisma.users.create({
        data: {
          firstname: validatedUser.firstname,
          lastname: validatedUser.lastname,
          email: validatedUser.email,
          password: hashedPassword,
          phone: Number.parseInt(validatedUser.phone),
          profile: validatedUser.profile,
        },
      });

      res.status(201).json({ user: newUser });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  },

  // Lire tous les utilisateurs
  async getAllUsers(req, res) {
    try {
      const users = await prisma.users.findMany();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur." });
    }
  },

  // Lire un utilisateur
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await prisma.users.findUnique({
        where: { idUser: Number.parseInt(id) },
      });
      if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur." });
    }
  },

  // Mettre à jour un utilisateur
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { password, ...otherData } = req.body;

      const updatedData = { ...otherData };
      if (password) updatedData.password = await bcrypt.hash(password, 10);

      const updatedUser = await prisma.users.update({
        where: { idUser: Number.parseInt(id) },
        data: updatedData,
      });

      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la mise à jour." });
    }
  },

  // Supprimer un utilisateur
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      await prisma.users.delete({ where: { idUser: Number.parseInt(id) } });
      res.json({ message: "Utilisateur supprimé avec succès." });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la suppression." });
    }
  },
};