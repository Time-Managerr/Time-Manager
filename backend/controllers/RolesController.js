import { PrismaClient } from "@prisma/client";
import RolesValidator from "../validators/RolesValidator.js";

const prisma = new PrismaClient();

export default {
  async createRole(req, res) {
    try {
      const validated = RolesValidator.parse(req.body);
      const existing = await prisma.roles.findUnique({ where: { name: validated.name } });
      if (existing) return res.status(400).json({ error: 'Role already exists' });
      const role = await prisma.roles.create({ data: { name: validated.name } });
      res.status(201).json(role);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  },

  async getAllRoles(req, res) {
    try {
      const roles = await prisma.roles.findMany();
      res.json(roles);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur serveur.' });
    }
  },

  async getRoleById(req, res) {
    try {
      const { id } = req.params;
      const role = await prisma.roles.findUnique({ where: { idRole: Number.parseInt(id) } });
      if (!role) return res.status(404).json({ error: 'Role not found' });
      res.json(role);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur serveur.' });
    }
  },

  async updateRole(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const updated = await prisma.roles.update({ where: { idRole: Number.parseInt(id) }, data: { name } });
      res.json(updated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur serveur.' });
    }
  },

  async deleteRole(req, res) {
    try {
      const { id } = req.params;
      await prisma.roles.delete({ where: { idRole: Number.parseInt(id) } });
      res.json({ message: 'Role deleted' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur serveur.' });
    }
  }
};