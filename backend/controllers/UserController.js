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
      OR: [{ managerId: managerNum }, { TeamUser: { some: { userId: managerNum } } }],
    },
    include: { TeamUser: { select: { userId: true } } },
  });

  const memberSet = new Set();
  for (const t of teamsManagedOrMember) {
    (t.TeamUser || []).forEach((tu) => memberSet.add(tu.userId));
    // Sonar: compare with undefined directly instead of typeof
    if (t.managerId != null) memberSet.add(t.managerId);
  }

  return memberSet.has(Number(targetUserId));
}

/**
 * Helpers to reduce duplication + cognitive complexity
 */
function getAuthHeader(req) {
  return req.headers?.authorization || null;
}

async function decodeUserFromAuth(req) {
  const authHeader = getAuthHeader(req);
  if (req.user) return req.user;
  if (!authHeader) return null;

  try {
    const token = authHeader.split(" ")[1];
    const jwt = await import("jsonwebtoken");
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return { __jwtError: err };
  }
}

function normalizeProfile(profile) {
  return (profile || "").toString().toLowerCase();
}

async function canAccessTargetUser({ requesterId, requesterProfile, targetId }) {
  if (requesterProfile === "admin") return { allowed: true, managerCheck: false };
  if (requesterId === targetId) return { allowed: true, managerCheck: false };

  if (requesterProfile === "manager") {
    const managerCheck = await isInManagersTeam(targetId, requesterId);
    return { allowed: managerCheck, managerCheck };
  }

  return { allowed: false, managerCheck: false };
}

async function assertCanUpdateUser({ requesterId, requesterProfile, targetId, targetUserProfile }) {
  // admin can do anything
  if (requesterProfile === "admin") return { ok: true };

  // manager rules
  if (requesterProfile === "manager") {
    const allowed = requesterId === targetId || (await isInManagersTeam(targetId, requesterId));
    if (!allowed) return { ok: false, status: 403, error: "Accès refusé." };

    const targetNorm = normalizeProfile(targetUserProfile);
    if ((targetNorm === "admin" || targetNorm === "manager") && targetId !== requesterId) {
      return { ok: false, status: 403, error: "Impossible d'éditer cet utilisateur." };
    }

    return { ok: true };
  }

  // employee: only themselves
  if (requesterId !== targetId) return { ok: false, status: 403, error: "Accès refusé." };
  return { ok: true };
}

export default {
  // Créer un utilisateur (admin only via route middleware)
  async createUser(req, res) {
    try {
      const validatedUser = UsersValidator.parse(req.body);

      const existingUser = await prisma.users.findFirst({
        where: { email: validatedUser.email },
      });

      if (existingUser) {
        return res.status(400).json({ error: "Cet email est déjà utilisé." });
      }

      const hashedPassword = await bcrypt.hash(validatedUser.password, 10);

      const newUser = await prisma.users.create({
        data: {
          firstname: validatedUser.firstname,
          lastname: validatedUser.lastname,
          email: validatedUser.email,
          password: hashedPassword,
          phone: Number.parseInt(validatedUser.phone, 10),
          profile: validatedUser.profile,
        },
      });

      // Create default plannings (Monday-Friday 9:00-17:00) for this user's current week
      try {
        const nowDate = new Date();
        const dayOfWeek = (d) => (d.getDay() + 6) % 7; // Monday=0
        const ws = new Date(nowDate);
        const diff = dayOfWeek(nowDate);
        ws.setDate(nowDate.getDate() - diff);
        ws.setHours(0, 0, 0, 0);

        const plansToCreate = [];
        for (let i = 0; i < 5; i++) {
          const date = new Date(ws.getTime() + i * 24 * 60 * 60 * 1000);
          const startTime = new Date(date);
          startTime.setHours(9, 0, 0, 0);
          const endTime = new Date(date);
          endTime.setHours(17, 0, 0, 0);

          plansToCreate.push({ userId: newUser.idUser, date, startTime, endTime });
        }

        await prisma.plannings.createMany({ data: plansToCreate });
      } catch (err) {
        console.error("Erreur lors de la création des plannings par défaut :", err);
      }

      return res.status(201).json({ user: newUser });
    } catch (error) {
      console.error("createUser error:", error);
      if (error?.name === "ZodError") return res.status(400).json({ errors: error.errors });
      return res.status(400).json({ error: error.message });
    }
  },

  // Lire tous les utilisateurs
  async getAllUsers(req, res) {
    try {
      const decodedUser = await decodeUserFromAuth(req);

      // ✅ Sonar: optional chaining
      if (decodedUser?.__jwtError) {
        console.error("getAllUsers: token decode fallback failed", decodedUser.__jwtError.message);
        return res.status(403).json({ error: "Token invalide ou expiré." });
      }

      const requesterId = decodedUser?.id;
      const requesterProfile = normalizeProfile(decodedUser?.profile);

      if (requesterProfile === "admin") {
        const users = await prisma.users.findMany();
        return res.status(200).json(users);
      }

      if (requesterProfile === "manager") {
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

      const self = await prisma.users.findUnique({ where: { idUser: requesterId } });
      return res.status(200).json([self]);
    } catch (error) {
      console.error("getAllUsers error:", error);
      return res.status(500).json({ error: "Erreur serveur." });
    }
  },

  // Lire un utilisateur
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const targetId = Number.parseInt(id, 10);

      if (Number.isNaN(targetId)) {
        return res.status(400).json({ error: "ID utilisateur invalide." });
      }

      // Sonar: authPreview unused + nested ternary -> removed entirely
      const decodedUser = await decodeUserFromAuth(req);

      // ✅ Sonar: optional chaining
      if (decodedUser?.__jwtError) {
        console.error("getUserById: token decode fallback failed", decodedUser.__jwtError.message);
        return res.status(403).json({ error: "Token invalide ou expiré." });
      }

      const requesterId = decodedUser?.id;
      const requesterProfile = normalizeProfile(decodedUser?.profile);

      const user = await prisma.users.findUnique({
        where: { idUser: targetId },
      });
      if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });

      try {
        const access = await canAccessTargetUser({ requesterId, requesterProfile, targetId });
        if (access.allowed) return res.json(user);
      } catch (err) {
        console.error("Error during manager membership check (getUserById):", err);
        return res
          .status(500)
          .json({ error: "Erreur serveur lors de la vérification des permissions." });
      }

      return res.status(403).json({ error: "Accès refusé." });
    } catch (error) {
      console.error("getUserById error:", error);
      return res.status(500).json({ error: "Erreur serveur." });
    }
  },

  // Mettre à jour un utilisateur
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const targetId = Number.parseInt(id, 10);

      if (Number.isNaN(targetId)) {
        return res.status(400).json({ error: "ID utilisateur invalide." });
      }

      const decodedUser = await decodeUserFromAuth(req);

      // ✅ Sonar: optional chaining
      if (decodedUser?.__jwtError) {
        console.error("updateUser: token decode fallback failed", decodedUser.__jwtError.message);
        return res.status(403).json({ error: "Token invalide ou expiré." });
      }

      const requesterId = decodedUser?.id;
      const requesterProfile = normalizeProfile(decodedUser?.profile);

      // Load target to check role
      const targetUser = await prisma.users.findUnique({ where: { idUser: targetId } });
      if (!targetUser) return res.status(404).json({ error: "Utilisateur introuvable." });

      // Permission checks (extracted -> lower cognitive complexity)
      const perm = await assertCanUpdateUser({
        requesterId,
        requesterProfile,
        targetId,
        targetUserProfile: targetUser.profile,
      });
      if (!perm.ok) return res.status(perm.status).json({ error: perm.error });

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

      return res.json(updatedUser);
    } catch (error) {
      console.error("updateUser error:", error);
      return res.status(500).json({ error: "Erreur lors de la mise à jour." });
    }
  },

  // Supprimer un utilisateur (admin only via route middleware)
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      await prisma.users.delete({ where: { idUser: Number.parseInt(id, 10) } });
      return res.json({ message: "Utilisateur supprimé avec succès." });
    } catch (error) {
      console.error("deleteUser error:", error);
      return res.status(500).json({ error: "Erreur lors de la suppression." });
    }
  },
};
