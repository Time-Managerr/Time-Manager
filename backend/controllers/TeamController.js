import { PrismaClient } from "@prisma/client";
import TeamsValidator from "../validators/TeamsValidator.js";

const prisma = new PrismaClient();

export default {
  // --- CRÉER UNE ÉQUIPE ---
  async createTeam(req, res) {
    try {
      // Extraction et validation des données via le validateur Zod
      const validatedData = TeamsValidator.parse(req.body);

      // Vérifier si le nom existe déjà
      const existingTeam = await prisma.teams.findUnique({
        where: { name: validatedData.name },
      });
      if (existingTeam) {
        return res.status(400).json({ error: "Ce nom d'équipe est déjà utilisé." });
      }

      // Création avec "Nested Writes" pour la table de liaison TeamUser
      const newTeam = await prisma.teams.create({
        data: {
          name: validatedData.name,
          description: validatedData.description,
          managerId: validatedData.managerId,
          // Ajout des membres à la volée
          TeamUser: {
            create: validatedData.members?.map((userId) => ({
              Users: {
                connect: { idUser: userId }
              }
            }))
          }
        },
        include: {
          Users: true, // Inclut les infos du manager
          TeamUser: {
            include: { Users: true } // Inclut les infos des membres
          }
        }
      });

      res.status(201).json(newTeam);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  },

  // --- LIRE TOUTES LES ÉQUIPES ---
  async getAllTeams(req, res) {
    try {
      const teams = await prisma.teams.findMany({
        include: {
          Users: true, // Le manager
          _count: { select: { TeamUser: true } } // Compte le nombre de membres
        }
      });
      res.status(200).json(teams);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la récupération des équipes." });
    }
  },

  // --- LIRE UNE ÉQUIPE PAR ID ---
  async getTeamById(req, res) {
    try {
      const { id } = req.params;
      const team = await prisma.teams.findUnique({
        where: { idTeam: parseInt(id) },
        include: { 
          Users: true, // Manager
          TeamUser: {
            include: {
              Users: {
                select: { idUser: true, firstname: true, lastname: true, email: true, phone: true, profile: true }
              }
            }
          }
        }
      });

      if (!team) return res.status(404).json({ error: "Équipe introuvable." });
      res.json(team);
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur." });
    }
  },

  // --- LIRE LES ÉQUIPES D'UN UTILISATEUR ---
  async getTeamByUserId(req, res) {
    try {
      const { userId } = req.params;
      const userIdInt = parseInt(userId);

      // Récupérer les équipes où l'utilisateur est manager
      const teamsAsManager = await prisma.teams.findMany({
        where: { managerId: userIdInt },
        include: {
          Users: true, // Manager
          TeamUser: {
            include: {
              Users: {
                select: { idUser: true, firstname: true, lastname: true, email: true, phone: true, profile: true }
              }
            }
          }
        }
      });

      // Récupérer les équipes où l'utilisateur est membre
      const teamsAsMember = await prisma.teams.findMany({
        where: {
          TeamUser: {
            some: { userId: userIdInt }
          }
        },
        include: {
          Users: true, // Manager
          TeamUser: {
            include: {
              Users: {
                select: { idUser: true, firstname: true, lastname: true, email: true, phone: true, profile: true }
              }
            }
          }
        }
      });

      // Fusionner et supprimer les doublons (si manager et membre de la même équipe)
      const allTeams = [...teamsAsManager, ...teamsAsMember];
      const uniqueTeams = allTeams.filter((team, index, self) =>
        index === self.findIndex(t => t.idTeam === team.idTeam)
      );

      res.json(uniqueTeams);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur lors de la récupération des équipes de l'utilisateur." });
    }
  },

  // --- METTRE À JOUR UNE ÉQUIPE ---
  async updateTeam(req, res) {
    try {
      const { id } = req.params;
      const { members, ...otherData } = req.body;

      // Préparation des données de mise à jour
      const updatePayload = { ...otherData };
      if (otherData.managerId) updatePayload.managerId = parseInt(otherData.managerId);

      // Si on envoie une nouvelle liste de membres, on synchronise
      if (members && Array.isArray(members)) {
        updatePayload.TeamUser = {
          // 1. On vide les anciens membres de cette équipe
          deleteMany: {},
          // 2. On ajoute les nouveaux
          create: members.map((userId) => ({
            Users: { connect: { idUser: parseInt(userId) } }
          }))
        };
      }

      const updatedTeam = await prisma.teams.update({
        where: { idTeam: parseInt(id) },
        data: updatePayload,
        include: { TeamUser: true }
      });

      res.json(updatedTeam);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur lors de la mise à jour." });
    }
  },

  // --- SUPPRIMER UNE ÉQUIPE ---
  async deleteTeam(req, res) {
    try {
      const { id } = req.params;

      // Note: Si vous n'avez pas de Cascade Delete configuré au niveau DB,
      // il faut d'abord supprimer les entrées dans TeamUser.
      await prisma.teamUser.deleteMany({
        where: { teamId: parseInt(id) }
      });

      await prisma.teams.delete({ 
        where: { idTeam: parseInt(id) } 
      });

      res.json({ message: "Équipe et ses affiliations supprimées." });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la suppression." });
    }
  },
};