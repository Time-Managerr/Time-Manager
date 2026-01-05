// src/controllers/TeamsController.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import TeamsValidator from "../validators/TeamsValidator.js";

const prisma = new PrismaClient();

export default {
  // Créer une équipe
  async createTeam(req, res) {
    console.log("Requête reçue (Team) :", req.body);

    try {
      // Validation des données (nom, description, managerId)
      const validatedData = TeamsValidator.parse(req.body);

      // Vérifier si le nom de l'équipe est déjà pris
      const existingTeam = await prisma.teams.findUnique({
        where: { name: validatedData.name },
      });

      if (existingTeam) {
        return res.status(400).json({ error: "Ce nom d'équipe est déjà utilisé." });
      }

      // Vérifier si le manager existe dans la table Users
      const managerExists = await prisma.users.findUnique({
        where: { idUser: parseInt(validatedData.managerId) },
      });

      if (!managerExists) {
        return res.status(404).json({ error: "Le manager spécifié n'existe pas." });
      }

      // Création de l'équipe
      const newTeam = await prisma.teams.create({
        data: {
          name: validatedData.name,
          description: validatedData.description,
          managerId: parseInt(validatedData.managerId),
          TeamUser: {
            create: members?.map((userId) => ({
              // On crée une entrée dans la table de liaison TeamUser
              // En connectant un utilisateur existant via son idUser
              Users: {
                connect: { idUser: parseInt(userId) }
              }
            }))
          }
        },
        // On inclut souvent le manager dans la réponse pour confirmer
        include: {
          Users: true, // Détails du manager
          TeamUser: {
            include: {
              Users: true // Détails des membres ajoutés
            }
          }
        }
      });

      res.status(201).json({ team: newTeam });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  },

  // Lire toutes les équipes
  async getAllTeams(req, res) {
    try {
      const teams = await prisma.teams.findMany({
        include: { Users: true } // Optionnel : pour voir les détails du manager
      });
      res.status(200).json(teams);
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur lors de la récupération des équipes." });
    }
  },

  // Lire une équipe par ID
  async getTeamById(req, res) {
    try {
      const { id } = req.params;
      const team = await prisma.teams.findUnique({
        where: { idTeam: parseInt(id) },
        include: { 
          Users: true,
          TeamUser: true // Optionnel : pour voir les membres
        }
      });

      if (!team) return res.status(404).json({ error: "Équipe introuvable." });
      res.json(team);
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur." });
    }
  },

  // Mettre à jour une équipe
  async updateTeam(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      // Si on change le managerId, on s'assure qu'il est au format Int
      if (data.managerId) data.managerId = parseInt(data.managerId);

      const updatedTeam = await prisma.teams.update({
        where: { idTeam: parseInt(id) },
        data: data,
      });

      res.json(updatedTeam);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la mise à jour de l'équipe." });
    }
  },

  // Supprimer une équipe
  async deleteTeam(req, res) {
    try {
      const { id } = req.params;
      await prisma.teams.delete({ 
        where: { idTeam: parseInt(id) } 
      });
      res.json({ message: "Équipe supprimée avec succès." });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la suppression." });
    }
  },
};