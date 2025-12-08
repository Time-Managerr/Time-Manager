import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import ClocksValidator from "../validators/ClocksValidator.js";

const prisma = new PrismaClient();

export default {
  // Créer une entrée de pointage (clock-in)
  async clockIn(req, res) {
    console.log("Requête reçue :", req.body);
    try {
      const validatedClock = ClocksValidator.parse(req.body);
      const newClock = await prisma.clocks.create({
        data: {
          userId: validatedClock.userId,
          clockIn: validatedClock.clockIn,
          clockOut: null,
        },
      });
      res.status(201).json(newClock);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Erreur POST /clocks :", error);
      res.status(500).json({ error: "Erreur serveur lors de la création du pointage" });
    }
  },

  // Créer une entrée de pointage (clock-out)
  async clockOut(req, res) {  
  const { idClock } = req.params;

  try {
    // Valide la date de clock-out
    const validatedData = ClocksValidator.pick({ clockOut: true }).parse(req.body);

    // Vérifie si le pointage existe
    const existingClock = await prisma.clocks.findUnique({
      where: { idClock: parseInt(idClock) },
    });

    if (!existingClock) {
      return res.status(404).json({ error: "Pointage introuvable." });
    }

    // Calcul des heures travaillées
    const hoursWorked = Math.round(
      ((validatedData.clockOut - existingClock.clockIn) / 3600000) * 100
    ) / 100;

    // Mise à jour du pointage
    const updatedClock = await prisma.clocks.update({
      where: { idClock: parseInt(idClock) },
      data: {
        clockOut: validatedData.clockOut,
        hoursWorked: hoursWorked,
      },
    });

    res.json(updatedClock);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error("Erreur clock-out :", error);
    res.status(500).json({ error: "Erreur serveur lors de la mise à jour du pointage" });
  }
},

  // Afficher tous les pointages
  async getAllClocks(req, res) {
    try {
      const clocks = await prisma.clocks.findMany();
      res.status(200).json(clocks);
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur." });
    }
  },

  // Afficher un pointage par ID utilisateur
  async getClockByIdUser(req, res) {
  try {
    const { userId } = req.params;
    const parseId = parseInt(userId);

    if (isNaN(parseId)) {
      return res.status(400).json({ error: "ID utilisateur invalide." });
    }

    const clock = await prisma.clocks.findMany({
      where: { userId: parseId },
    });

    if (clock.length === 0) {
      return res.status(404).json({ error: "Aucun pointage trouvé pour cet utilisateur." });
    }

    res.json(clock);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur." });
  }
}
};
