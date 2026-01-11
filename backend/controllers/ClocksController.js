import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import ClocksValidator from "../validators/ClocksValidator.js";

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

    // Sonar: Compare with undefined directly instead of using typeof
    if (t.managerId != null) memberSet.add(t.managerId);
  }

  return memberSet.has(Number(targetUserId));
}

/**
 * Helpers added ONLY to reduce Cognitive Complexity + nested ternary warning
 * (behavior kept identical)
 */
function buildAuthPreview(authHeader) {
  if (!authHeader) return null;
  return authHeader.length > 20 ? `${authHeader.slice(0, 20)}...` : authHeader;
}

function getAuthHeader(req) {
  return req.headers?.authorization || null;
}

function getDecodedUserOrNull(req, authHeader) {
  if (req.user) return req.user;

  if (!authHeader) return null;

  try {
    const token = authHeader.split(" ")[1];
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return { __jwtError: err };
  }
}

// Keep EXACT behavior from your getClockByIdUser manager check:
// manager can access users ONLY in teams where he is the declared manager.
async function isInTeamsManagedBy(targetUserId, managerId) {
  const teamsManaged = await prisma.teams.findMany({
    where: { managerId },
    include: { TeamUser: { select: { userId: true } } },
  });

  const memberSet = new Set();
  for (const t of teamsManaged) {
    (t.TeamUser || []).forEach((tu) => memberSet.add(tu.userId));
    if (t.managerId != null) memberSet.add(t.managerId);
  }

  return memberSet.has(Number(targetUserId));
}

async function canAccessUserClocks({ requesterId, requesterProfileNorm, targetId }) {
  if (requesterProfileNorm === "admin") return { allowed: true, managerCheck: false };
  if (requesterId === targetId) return { allowed: true, managerCheck: false };

  if (requesterProfileNorm === "manager") {
    const managerCheck = await isInTeamsManagedBy(targetId, requesterId);
    return { allowed: managerCheck, managerCheck };
  }

  return { allowed: false, managerCheck: false };
}

export default {
  // Créer une entrée de pointage (clock-in)
  async clockIn(req, res) {
    console.log("Requête reçue :", req.body);
    try {
      const validatedClock = ClocksValidator.parse(req.body);
      const requesterId = req.user?.id;
      const requesterProfile = req.user?.profile;
      const requesterProfileNorm = (requesterProfile || "").toString().toLowerCase();

      console.log("ClocksController.clockIn requester", {
        requesterId,
        requesterProfile,
        requesterProfileNorm,
      });

      // Only the user himself, managers (for their team) or admins can create a clock for a user
      if (
        requesterProfileNorm === "admin" ||
        requesterId === validatedClock.userId ||
        (requesterProfileNorm === "manager" &&
          (await isInManagersTeam(validatedClock.userId, requesterId)))
      ) {
        const newClock = await prisma.clocks.create({
          data: {
            userId: validatedClock.userId,
            clockIn: validatedClock.clockIn,
            clockOut: null,
          },
        });
        return res.status(201).json(newClock);
      }

      return res.status(403).json({ error: "Accès refusé." });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Erreur POST /clocks :", error);
      return res.status(500).json({ error: "Erreur serveur lors de la création du pointage" });
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
        where: { idClock: Number.parseInt(idClock, 10) },
      });

      if (!existingClock) {
        return res.status(404).json({ error: "Pointage introuvable." });
      }

      const requesterId = req.user?.id;
      const requesterProfile = req.user?.profile;
      const requesterProfileNorm = (requesterProfile || "").toString().toLowerCase();

      // Only owner, admin, or manager of the user can clock out
      const isOwner = existingClock.userId === requesterId;
      const isManager =
        requesterProfileNorm === "manager" &&
        (await isInManagersTeam(existingClock.userId, requesterId));

      if (!isOwner && requesterProfileNorm !== "admin" && !isManager) {
        return res.status(403).json({ error: "Accès refusé." });
      }

      // Calcul des heures travaillées
      const hoursWorked =
        Math.round(((validatedData.clockOut - existingClock.clockIn) / 3600000) * 100) / 100;

      // Determine the planning for the day and assess lateness / early leave / short day
      const clockInDate = new Date(existingClock.clockIn);
      const dateOnlyStr = clockInDate.toISOString().split("T")[0];
      const plan = await prisma.plannings.findFirst({
        where: { userId: existingClock.userId, date: new Date(dateOnlyStr) },
      });

      let late = false;
      let earlyLeave = false;
      if (plan) {
        late = existingClock.clockIn > plan.startTime;
        earlyLeave = validatedData.clockOut < plan.endTime;
      }

      const shortDay = hoursWorked < 8;

      // Update user's monthly lateness counter (reset when month changes)
      try {
        const monthKey = `${clockInDate.getFullYear()}-${String(clockInDate.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
        const user = await prisma.users.findUnique({ where: { idUser: existingClock.userId } });

        let newCount = user?.latenessCount ?? 0;
        let newMonth = user?.latenessMonth ?? monthKey;

        if (newMonth !== monthKey) {
          newCount = 0;
          newMonth = monthKey;
        }

        if (late) newCount++;

        await prisma.users.update({
          where: { idUser: existingClock.userId },
          data: { latenessCount: newCount, latenessMonth: newMonth },
        });
      } catch (err) {
        console.error("Erreur mise à jour lateness:", err);
        // don't block clock-out on lateness storage failure
      }

      // Mise à jour du pointage avec métadonnées
      const updatedClock = await prisma.clocks.update({
        where: { idClock: Number.parseInt(idClock, 10) },
        data: {
          clockOut: validatedData.clockOut,
          hoursWorked,
          late,
          earlyLeave,
          shortDay,
        },
      });

      return res.json(updatedClock);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Erreur clock-out :", error);
      return res.status(500).json({ error: "Erreur serveur lors de la mise à jour du pointage" });
    }
  },

  // Afficher tous les pointages
  async getAllClocks(req, res) {
    try {
      const requesterId = req.user?.id;
      const requesterProfile = req.user?.profile;
      const requesterProfileNorm = (requesterProfile || "").toString().toLowerCase();

      if (requesterProfileNorm === "admin") {
        const clocks = await prisma.clocks.findMany();
        return res.status(200).json(clocks);
      }

      if (requesterProfileNorm === "manager") {
        // Return clocks where user belongs to manager's teams
        const clocks = await prisma.clocks.findMany({
          where: {
            Users: {
              TeamUser: {
                some: { Teams: { managerId: requesterId } },
              },
            },
          },
        });
        return res.status(200).json(clocks);
      }

      // Employee: only his own clocks
      const clocks = await prisma.clocks.findMany({ where: { userId: requesterId } });
      return res.status(200).json(clocks);
    } catch (error) {
      return res.status(500).json({ error: "Erreur serveur." });
    }
  },

  // Afficher un pointage par ID utilisateur
  async getClockByIdUser(req, res) {
    try {
      const { userId } = req.params;
      const targetId = Number.parseInt(userId, 10);

      const authHeader = getAuthHeader(req);
      const authPreview = buildAuthPreview(authHeader);

      console.log("getClockByIdUser entry", {
        userId,
        authHeaderPresent: !!authHeader,
        authPreview,
        reqUser: req.user,
      });

      if (Number.isNaN(targetId)) {
        return res.status(400).json({ error: "ID utilisateur invalide." });
      }

      // Fallback decode if req.user missing (same behavior)
      const decodedUser = getDecodedUserOrNull(req, authHeader);
      if (decodedUser && decodedUser.__jwtError) {
        console.error("getClockByIdUser: token decode fallback failed", decodedUser.__jwtError.message);
        return res.status(403).json({ error: "Token invalide ou expiré." });
      }

      const requesterId = decodedUser?.id;
      const requesterProfile = decodedUser?.profile;
      const requesterProfileNorm = (requesterProfile || "").toString().toLowerCase();

      let allowed = false;
      let managerCheck = false;

      try {
        const access = await canAccessUserClocks({
          requesterId,
          requesterProfileNorm,
          targetId,
        });
        allowed = access.allowed;
        managerCheck = access.managerCheck;
      } catch (err) {
        console.error("Error during manager membership aggregation:", err);
        return res.status(500).json({ error: "Erreur serveur lors de la vérification des permissions." });
      }

      console.log("GET /clocks/user/:userId auth check", {
        requesterId,
        requesterProfile,
        requesterProfileNorm,
        targetId,
        allowed,
        managerCheck,
      });

      if (!allowed) {
        const msg =
          process.env.NODE_ENV === "production"
            ? "Accès refusé."
            : `Accès refusé. requesterId=${requesterId}, requesterProfile=${requesterProfile}, targetId=${targetId}, managerCheck=${managerCheck}`;
        return res.status(403).json({ error: msg });
      }

      const clock = await prisma.clocks.findMany({
        where: { userId: targetId },
        orderBy: { clockIn: "desc" },
      });

      if (clock.length === 0) {
        return res.status(404).json({ error: "Aucun pointage trouvé pour cet utilisateur." });
      }

      return res.json(clock);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erreur serveur." });
    }
  },

  // Delete a clock (admin only)
  async deleteClock(req, res) {
    try {
      const { id } = req.params;
      await prisma.clocks.delete({ where: { idClock: Number.parseInt(id, 10) } });
      return res.json({ message: "Deleted" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erreur serveur." });
    }
  },
};
