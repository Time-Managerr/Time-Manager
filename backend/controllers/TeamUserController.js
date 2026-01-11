import { PrismaClient } from "@prisma/client";
import TeamUserValidator from "../validators/TeamUserValidator.js";

const prisma = new PrismaClient();

function toInt(value) {
  return Number.parseInt(value, 10);
}

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

      return res.status(201).json({
        message: "Membre ajouté avec succès",
        membership: newMembership
      });
    } catch (error) {
      // Gestion des erreurs de validation Zod
      if (error?.name === "ZodError") {
        return res.status(400).json({ error: error.errors });
      }

      // Gestion de l'erreur d'unicité (P2002 : déjà membre)
      if (error?.code === "P2002") {
        return res
          .status(400)
          .json({ error: "Cet utilisateur est déjà membre de cette équipe." });
      }

      console.error("addMember error:", error);
      return res
        .status(500)
        .json({ error: "Erreur interne lors de l'ajout du membre." });
    }
  },

  // --- RETIRER UN MEMBRE ---
  async removeMember(req, res) {
    try {
      const teamId = toInt(req.params.teamId);
      const userId = toInt(req.params.userId);

      if (Number.isNaN(teamId) || Number.isNaN(userId)) {
        return res
          .status(400)
          .json({ error: "ID d'équipe ou d'utilisateur invalide." });
      }

      // Suppression via la clé composée teamId_userId
      await prisma.teamUser.delete({
        where: {
          teamId_userId: {
            teamId,
            userId
          }
        }
      });

      return res.json({
        message: "Le membre a été retiré de l'équipe avec succès."
      });
    } catch (error) {
      // Si le lien n'existe pas (P2025)
      if (error?.code === "P2025") {
        return res
          .status(404)
          .json({ error: "Ce membre ne fait pas partie de cette équipe." });
      }

      console.error("removeMember error:", error);
      return res
        .status(500)
        .json({ error: "Erreur lors du retrait du membre." });
    }
  }
};
