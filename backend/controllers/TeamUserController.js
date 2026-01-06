import { PrismaClient } from "@prisma/client";
import TeamUserValidator from "../validators/TeamUserValidator.js";

const prisma = new PrismaClient();

export default {
  // --- AJOUTER UN MEMBRE ---
  async addMember(req, res) {
    try {
      // 1. Validation des données entrantes (req.body)
      const validatedData = TeamUserValidator.parse(req.body);

      // 2. Création du lien dans la table de liaison
      const newMembership = await prisma.teamUser.create({
        data: {
          teamId: validatedData.teamId,
          userId: validatedData.userId
        },
        // On inclut les détails pour confirmer qui a été ajouté à quelle équipe
        include: {
          Teams: { select: { name: true } },
          Users: { select: { firstname: true, lastname: true } }
        }
      });

      res.status(201).json({
        message: "Membre ajouté avec succès",
        membership: newMembership
      });
    } catch (error) {
      // Gestion des erreurs de validation Zod
      if (error.name === "ZodError") {
        return res.status(400).json({ error: error.errors });
      }
      
      // Gestion de l'erreur d'unicité (P2002 : l'utilisateur est déjà dans l'équipe)
      if (error.code === 'P2002') {
        return res.status(400).json({ error: "Cet utilisateur est déjà membre de cette équipe." });
      }

      console.error(error);
      res.status(500).json({ error: "Erreur interne lors de l'ajout du membre." });
    }
  },

  // --- RETIRER UN MEMBRE ---
  async removeMember(req, res) {
    try {
      // On valide les paramètres d'URL (req.params)
      const teamId = parseInt(req.params.teamId);
      const userId = parseInt(req.params.userId);

      if (isNaN(teamId) || isNaN(userId)) {
        return res.status(400).json({ error: "ID d'équipe ou d'utilisateur invalide." });
      }

      // Utilisation de la clé composée teamId_userId générée par Prisma
      // grâce au @@unique([teamId, userId]) de ton schéma
      await prisma.teamUser.delete({
        where: {
          teamId_userId: {
            teamId: teamId,
            userId: userId
          }
        }
      });

      res.json({ message: "Le membre a été retiré de l'équipe avec succès." });
    } catch (error) {
      // Si on essaie de supprimer un lien qui n'existe pas (P2025)
      if (error.code === 'P2025') {
        return res.status(404).json({ error: "Ce membre ne fait pas partie de cette équipe." });
      }

      console.error(error);
      res.status(500).json({ error: "Erreur lors du retrait du membre." });
    }
  }
};