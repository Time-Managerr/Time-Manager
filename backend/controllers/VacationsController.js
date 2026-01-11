import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const VacationValidator = z.object({
  userId: z.number().int().positive(),
  startDate: z.string().refine(v => !Number.isNaN(Date.parse(v)), { message: 'Invalid date' }),
  endDate: z.string().refine(v => !Number.isNaN(Date.parse(v)), { message: 'Invalid date' }),
  status: z.string().optional(),
});

export default {
  async createVacation(req, res) {
    try {
      const validated = VacationValidator.parse(req.body);
      const created = await prisma.vacations.create({ data: {
        userId: validated.userId,
        startDate: new Date(validated.startDate),
        endDate: new Date(validated.endDate),
        status: validated.status || 'pending'
      }});
      res.status(201).json(created);
    } catch (error) {
      console.error(error);
      if (error.name === 'ZodError') return res.status(400).json({ errors: error.errors });
      res.status(500).json({ error: 'Erreur serveur.' });
    }
  },

  async getAllVacations(req, res) {
    try {
      const vacations = await prisma.vacations.findMany();
      res.json(vacations);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur serveur.' });
    }
  },

  async getVacationById(req, res) {
    try {
      const { id } = req.params;
      const v = await prisma.vacations.findUnique({ where: { idVacation: Number.parseInt(id) } });
      if (!v) return res.status(404).json({ error: 'Not found' });
      res.json(v);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur serveur.' });
    }
  },

  async updateVacation(req, res) {
    try {
      const { id } = req.params;
      const validated = VacationValidator.partial().parse(req.body);
      const updated = await prisma.vacations.update({ where: { idVacation: Number.parseInt(id) }, data: {
        startDate: validated.startDate ? new Date(validated.startDate) : undefined,
        endDate: validated.endDate ? new Date(validated.endDate) : undefined,
        status: validated.status
      }});
      res.json(updated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur serveur.' });
    }
  },

  async deleteVacation(req, res) {
    try {
      const { id } = req.params;
      await prisma.vacations.delete({ where: { idVacation: Number.parseInt(id) } });
      res.json({ message: 'Deleted' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur serveur.' });
    }
  }
};