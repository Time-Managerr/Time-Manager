import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const ReportValidator = z.object({
  kpi: z.string(),
  startDate: z.string().refine(v => !Number.isNaN(Date.parse(v))),
  endDate: z.string().refine(v => !Number.isNaN(Date.parse(v))),
  userId: z.number().int().positive(),
  teamId: z.number().int().positive(),
});

export default {
  async createReport(req, res) {
    try {
      const validated = ReportValidator.parse(req.body);
      const created = await prisma.reports.create({ data: {
        kpi: validated.kpi,
        startDate: new Date(validated.startDate),
        endDate: new Date(validated.endDate),
        userId: validated.userId,
        teamId: validated.teamId
      }});
      res.status(201).json(created);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  },

  async getAllReports(req, res) {
    try {
      const reports = await prisma.reports.findMany();
      res.json(reports);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur serveur.' });
    }
  },

  async getReportById(req, res) {
    try {
      const { id } = req.params;
      const r = await prisma.reports.findUnique({ where: { idReport: Number.parseInt(id) } });
      if (!r) return res.status(404).json({ error: 'Not found' });
      res.json(r);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur serveur.' });
    }
  },

  async updateReport(req, res) {
    try {
      const { id } = req.params;
      const validated = ReportValidator.partial().parse(req.body);
      const updated = await prisma.reports.update({ where: { idReport: Number.parseInt(id) }, data: {
        kpi: validated.kpi,
        startDate: validated.startDate ? new Date(validated.startDate) : undefined,
        endDate: validated.endDate ? new Date(validated.endDate) : undefined,
        userId: validated.userId,
        teamId: validated.teamId
      }});
      res.json(updated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur serveur.' });
    }
  },

  async deleteReport(req, res) {
    try {
      const { id } = req.params;
      await prisma.reports.delete({ where: { idReport: Number.parseInt(id) } });
      res.json({ message: 'Deleted' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur serveur.' });
    }
  }
};