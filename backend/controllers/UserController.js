// src/controllers/UserController.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import UsersValidator from "../validators/UsersValidator.js";

const prisma = new PrismaClient();

// Helper: check if targetUser is in any team the manager has access to
// (either teams they manage or teams where they are a member)
async function isInManagersTeam(targetUserId, managerId) {
  const managerNum = Number(managerId);
  const teamsManagedOrMember = await prisma.teams.findMany({
    where: {
      OR: [
        { managerId: managerNum },
        { TeamUser: { some: { userId: managerNum } } }
      ]
    },
    include: { TeamUser: { select: { userId: true } } }
  });
  const memberSet = new Set();
  for (const t of teamsManagedOrMember) {
    (t.TeamUser || []).forEach(tu => memberSet.add(tu.userId));
    if (typeof t.managerId !== 'undefined' && t.managerId !== null) memberSet.add(t.managerId);
  }
  return memberSet.has(Number(targetUserId));
}

export default {
  // Créer un utilisateur (admin only via route middleware)
  async createUser(req, res) {
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

      // Create default plannings (Monday-Friday 9:00-17:00) for this user's current week
      try {
        const nowDate = new Date();
        const dayOfWeek = (d) => ((d.getDay() + 6) % 7); // Monday=0
        const ws = new Date(nowDate);
        const diff = dayOfWeek(nowDate);
        ws.setDate(nowDate.getDate() - diff);
        ws.setHours(0,0,0,0);

        const plansToCreate = [];
        for (let i = 0; i < 5; i++) {
          const date = new Date(ws.getTime() + i * 24 * 60 * 60 * 1000);
          // prepare start and end Date objects
          const startTime = new Date(date);
          startTime.setHours(9, 0, 0, 0);
          const endTime = new Date(date);
          endTime.setHours(17, 0, 0, 0);

          plansToCreate.push({ userId: newUser.idUser, date, startTime, endTime });
        }

        // Use createMany but first ensure no duplicates for newly created user (should be none)
        await prisma.plannings.createMany({ data: plansToCreate });
      } catch (err) {
        console.error('Erreur lors de la création des plannings par défaut :', err);
      }

      res.status(201).json({ user: newUser });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  },

  // Lire tous les utilisateurs
  async getAllUsers(req, res) {
    try {
      // Fallback decode if middleware did not set req.user
      const authHeader = req.headers?.authorization || null;
      let decodedUser = req.user;
      if (!decodedUser && authHeader) {
        try {
          const token = authHeader.split(' ')[1];
          decodedUser = (await import('jsonwebtoken')).verify(token, process.env.JWT_SECRET);
        } catch (err) {
          console.error('getAllUsers: token decode fallback failed', err.message);
          return res.status(403).json({ error: 'Token invalide ou expiré.' });
        }
      }

      const requesterId = decodedUser?.id;
      const requesterProfile = (decodedUser?.profile || '').toString().toLowerCase();

      if (requesterProfile === "admin") {
        const users = await prisma.users.findMany();
        return res.status(200).json(users);
      }

      if (requesterProfile === "manager") {
        // Return users that belong to teams managed by this manager, plus the manager himself
        const users = await prisma.users.findMany({
          where: {
            OR: [
              { TeamUser: { some: { Teams: { managerId: requesterId } } } },
              { idUser: requesterId },
            ],
          },
        });
        return res.status(200).json(users);
      }

      // For regular employees, only return themselves
      const self = await prisma.users.findUnique({ where: { idUser: requesterId } });
      return res.status(200).json([self]);
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur." });
    }
  },

  // Lire un utilisateur
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const targetId = Number.parseInt(id);

      // Log auth header and decoded user for debugging
      const authHeader = req.headers?.authorization || null;
      const authPreview = authHeader ? (authHeader.length > 20 ? authHeader.substr(0,20) + '...' : authHeader) : null;

      if (Number.isNaN(targetId)) return res.status(400).json({ error: "ID utilisateur invalide." });

      // Fallback decode if middleware did not set req.user
      let decodedUser = req.user;
      if (!decodedUser && authHeader) {
        try {
          const token = authHeader.split(' ')[1];
          decodedUser = (await import('jsonwebtoken')).verify(token, process.env.JWT_SECRET);
        } catch (err) {
          console.error('getUserById: token decode fallback failed', err.message);
          return res.status(403).json({ error: 'Token invalide ou expiré.' });
        }
      }

      const requesterId = decodedUser?.id;
      const requesterProfile = (decodedUser?.profile || '').toString().toLowerCase();

      const user = await prisma.users.findUnique({
        where: { idUser: targetId },
      });
      if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });

      // Admin can access any user
      if (requesterProfile === "admin") return res.json(user);

      // Manager can access users inside his teams or himself
      if (requesterProfile === "manager") {
        try {
          const allowed = (requesterId === targetId) || (await isInManagersTeam(targetId, requesterId));
          if (allowed) return res.json(user);
        } catch (err) {
          console.error('Error during manager membership check (getUserById):', err);
          return res.status(500).json({ error: 'Erreur serveur lors de la vérification des permissions.' });
        }
      }

      // Employee can only access own profile
      if (requesterId === targetId) return res.json(user);

      return res.status(403).json({ error: "Accès refusé." });
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur." });
    }
  },

  // Mettre à jour un utilisateur
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const targetId = Number.parseInt(id);

      // Fallback decode if middleware did not set req.user
      const authHeader = req.headers?.authorization || null;
      let decodedUser = req.user;
      if (!decodedUser && authHeader) {
        try {
          const token = authHeader.split(' ')[1];
          decodedUser = (await import('jsonwebtoken')).verify(token, process.env.JWT_SECRET);
        } catch (err) {
          console.error('updateUser: token decode fallback failed', err.message);
          return res.status(403).json({ error: 'Token invalide ou expiré.' });
        }
      }

      const requesterId = decodedUser?.id;
      const requesterProfile = (decodedUser?.profile || '').toString().toLowerCase();

      // Load target to check role
      const targetUser = await prisma.users.findUnique({ where: { idUser: targetId } });
      if (!targetUser) return res.status(404).json({ error: "Utilisateur introuvable." });

      // Permission checks
      if (requesterProfile === "admin") {
        // allowed
      } else if (requesterProfile === "manager") {
        // Manager can update himself or users in his teams
        const allowed = (requesterId === targetId) || (await isInManagersTeam(targetId, requesterId));
        if (!allowed) return res.status(403).json({ error: "Accès refusé." });
        // Manager cannot modify admins or other managers
        if ((targetUser.profile || '').toString().toLowerCase() === "admin" || (targetUser.profile || '').toString().toLowerCase() === "manager") {
          // if updating himself and he's manager it's allowed, but cannot edit other managers/admins
          if (targetId !== requesterId) return res.status(403).json({ error: "Impossible d'éditer cet utilisateur." });
        }
      } else {
        // employee: can only update themselves
        if (requesterId !== targetId) return res.status(403).json({ error: "Accès refusé." });
      }

      const { password, profile, ...otherData } = req.body;

      // Manager cannot promote someone to admin
      if (requesterProfile === "manager" && profile === "admin") {
        return res.status(403).json({ error: "Impossible de promouvoir un utilisateur en admin." });
      }

      const updatedData = { ...otherData };
      if (password) updatedData.password = await bcrypt.hash(password, 10);
      if (profile) updatedData.profile = profile;

      const updatedUser = await prisma.users.update({
        where: { idUser: targetId },
        data: updatedData,
      });

      res.json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur lors de la mise à jour." });
    }
  },

  // Supprimer un utilisateur (admin only via route middleware)
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      await prisma.users.delete({ where: { idUser: Number.parseInt(id) } });
      res.json({ message: "Utilisateur supprimé avec succès." });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la suppression." });
    }
  }
};