// backend/controllers/PlanningController.js
import { PrismaClient } from "@prisma/client";
import PlanningsValidator from "../validators/PlanningsValidator.js";

const prisma = new PrismaClient();

/**
 * Shared helpers (avoid duplicate implementations + Sonar issues)
 */
const TZ_SUFFIX_REGEX = /(?:[Zz]|[+-]\d{2}:?\d{2})$/;

function toDate(val) {
  if (val instanceof Date) return val;

  if (typeof val === "string") {
    const hasTZ = TZ_SUFFIX_REGEX.test(val);
    const s = hasTZ ? val : `${val}Z`;
    return new Date(s);
  }

  return new Date(val);
}

function isInvalidDate(d) {
  return !(d instanceof Date) || Number.isNaN(d.getTime());
}

// Helper: check if targetUser is in any team the manager has access to
// (either teams they manage or teams where they are a member)
async function isInManagersTeam(targetUserId, managerId) {
  const managerNum = Number(managerId);

  // Find teams where requester is manager OR is a team member
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

  console.log("isInManagersTeam", {
    targetUserId,
    managerId,
    managerNum,
    teamsFound: teamsManagedOrMember.length,
    memberSetSize: memberSet.size,
  });

  return memberSet.has(Number(targetUserId));
}

const getPlanning = async (req, res) => {
  try {
    let requesterId = req.user?.id;
    let requesterProfile = req.user?.profile;
    const { userId } = req.query;

    // If specific user asked
    if (userId) {
      const targetId = Number.parseInt(userId, 10);

      // Log auth header + decoded user to help debugging
      const authHeader = req.headers?.authorization || null;

      // Sonar: Extract nested ternary into independent statement (+ avoid substr)
      let authPreview = null;
      if (authHeader) {
        authPreview = authHeader.length > 20 ? `${authHeader.slice(0, 20)}...` : authHeader;
      }

      console.log("getPlanning (by user) entry", {
        userId,
        authHeaderPresent: !!authHeader,
        authPreview,
        reqUser: req.user,
      });

      // If middleware didn't populate req.user, attempt to decode token directly
      let decodedUser = req.user;
      if (!decodedUser && authHeader) {
        try {
          const token = authHeader.split(" ")[1];
          decodedUser = (await import("jsonwebtoken")).verify(token, process.env.JWT_SECRET);
          console.log("getPlanning: decoded token fallback", {
            id: decodedUser?.id,
            profile: decodedUser?.profile,
          });
        } catch (err) {
          console.error("getPlanning: token decode fallback failed", err.message);
          return res.status(403).json({ error: "Token invalide ou expiré." });
        }
      }

      const requesterProfileNorm = (decodedUser?.profile || requesterProfile || "")
        .toString()
        .toLowerCase();
      requesterId = decodedUser?.id || requesterId;

      let allowed = false;
      let managerCheck = false;

      if (requesterProfileNorm === "admin") {
        allowed = true;
      } else if (requesterId === targetId) {
        allowed = true;
      } else if (requesterProfileNorm === "manager") {
        try {
          managerCheck = await isInManagersTeam(targetId, requesterId);
          allowed = managerCheck;
        } catch (err) {
          console.error("Error during manager membership check (planning):", err);
          return res
            .status(500)
            .json({ error: "Erreur serveur lors de la vérification des permissions." });
        }
      }

      console.log("GET /planning auth check", {
        requesterId,
        requesterProfile,
        requesterProfileNorm,
        targetId,
        allowed,
        managerCheck,
      });

      if (!allowed) return res.status(403).json({ error: "Accès refusé." });

      // Fetch template plannings (isTemplate=true) for this user
      const templates = await prisma.plannings.findMany({
        where: { userId: targetId, isTemplate: true },
        orderBy: { dayOfWeek: "asc" },
      });

      // If no templates exist, create default 9-17 for weekdays (Mon-Fri)
      if (templates.length === 0) {
        console.log(`Creating default template planning for user ${targetId}`);
        const defaultTemplates = [];
        for (let day = 1; day <= 5; day++) {
          defaultTemplates.push({
            userId: targetId,
            dayOfWeek: day,
            startTime: new Date("1970-01-01T09:00:00Z"),
            endTime: new Date("1970-01-01T17:00:00Z"),
            isTemplate: true,
            date: null,
          });
        }

        await prisma.plannings.createMany({ data: defaultTemplates });

        const newTemplates = await prisma.plannings.findMany({
          where: { userId: targetId, isTemplate: true },
          orderBy: { dayOfWeek: "asc" },
        });

        return res.json(newTemplates);
      }

      return res.json(templates);
    }

    // No user filter: admin gets all; manager gets their teams; employee gets own
    if (requesterProfile === "admin") {
      const plans = await prisma.plannings.findMany({ where: { isTemplate: true } });
      return res.json(plans);
    }

    if (requesterProfile === "manager") {
      const users = await prisma.users.findMany({
        where: { TeamUser: { some: { Teams: { managerId: requesterId } } } },
      });
      const userIds = users.map((u) => u.idUser);
      const plans = await prisma.plannings.findMany({
        where: { userId: { in: userIds }, isTemplate: true },
      });
      return res.json(plans);
    }

    // employee: own templates
    const plans = await prisma.plannings.findMany({
      where: { userId: requesterId, isTemplate: true },
    });
    return res.json(plans);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erreur serveur." });
  }
};

const createPlanning = async (req, res) => {
  try {
    const validated = PlanningsValidator.parse(req.body);
    const requesterId = req.user?.id;
    const requesterProfile = req.user?.profile;
    const requesterProfileNorm = (requesterProfile || "").toString().toLowerCase();

    // If manager creating for someone else, ensure user is part of his team
    if (requesterProfileNorm === "manager" && validated.userId !== requesterId) {
      try {
        const allowed = await isInManagersTeam(validated.userId, requesterId);
        if (!allowed) return res.status(403).json({ error: "Accès refusé." });
      } catch (err) {
        console.error("Error during manager membership check (create planning):", err);
        return res
          .status(500)
          .json({ error: "Erreur serveur lors de la vérification des permissions." });
      }
    }

    const startTime = toDate(validated.startTime);
    const endTime = toDate(validated.endTime);
    const dateObj = toDate(validated.date);

    // Sonar: Prefer Number.isNaN over isNaN
    if (isInvalidDate(startTime) || isInvalidDate(endTime) || isInvalidDate(dateObj)) {
      return res.status(400).json({ error: "Invalid date/time provided" });
    }

    console.log("createPlanning dates:", {
      date: dateObj,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    });

    const newPlan = await prisma.plannings.create({
      data: {
        userId: validated.userId,
        date: dateObj,
        startTime,
        endTime,
      },
    });

    return res.status(201).json(newPlan);
  } catch (error) {
    console.error(error);
    if (error.name === "ZodError") return res.status(400).json({ errors: error.errors });
    return res.status(500).json({ error: "Erreur serveur." });
  }
};

const updatePlanning = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("updatePlanning raw req.body:", req.body);

    const requesterId = req.user?.id;
    const requesterProfile = req.user?.profile;

    const existing = await prisma.plannings.findUnique({
      where: { idPlanning: Number.parseInt(id, 10) },
    });
    if (!existing) return res.status(404).json({ error: "Planning introuvable." });

    // Authorization: admin always OK; manager only if user is in his team
    if (requesterProfile === "admin") {
      // allowed
    } else if (requesterProfile === "manager") {
      try {
        const allowed = await isInManagersTeam(existing.userId, requesterId);
        if (!allowed) return res.status(403).json({ error: "Accès refusé." });
      } catch (err) {
        console.error("Error during manager membership check (update planning):", err);
        return res
          .status(500)
          .json({ error: "Erreur serveur lors de la vérification des permissions." });
      }
    } else {
      return res.status(403).json({ error: "Accès refusé." });
    }

    // For template plannings, update startTime/endTime only (no date conversion needed)
    if (existing.isTemplate) {
      const { startTime, endTime } = req.body;
      if (!startTime || !endTime) {
        return res.status(400).json({ error: "startTime and endTime are required" });
      }

      // Convert HH:mm to DateTime (use epoch date)
      const toDateTime = (timeStr) => {
        if (timeStr instanceof Date) return timeStr;
        if (typeof timeStr === "string" && /^\d{2}:\d{2}$/.test(timeStr)) {
          return new Date(`1970-01-01T${timeStr}:00Z`);
        }
        return new Date(timeStr);
      };

      const updated = await prisma.plannings.update({
        where: { idPlanning: Number.parseInt(id, 10) },
        data: {
          startTime: toDateTime(startTime),
          endTime: toDateTime(endTime),
        },
      });

      return res.json(updated);
    }

    // For historical plannings, update with full date-time
    const startTime = toDate(req.body?.startTime);
    const endTime = toDate(req.body?.endTime);

    // Sonar: Prefer Number.isNaN over isNaN
    if (isInvalidDate(startTime) || isInvalidDate(endTime)) {
      console.log("updatePlanning invalid dates after coercion:", { startTime, endTime });
      return res.status(400).json({ error: "Invalid startTime or endTime" });
    }

    const updated = await prisma.plannings.update({
      where: { idPlanning: Number.parseInt(id, 10) },
      data: { startTime, endTime },
    });

    return res.json(updated);
  } catch (error) {
    console.error(error);
    if (error.name === "ZodError") return res.status(400).json({ errors: error.errors });
    const msg = process.env.NODE_ENV === "production" ? "Erreur serveur." : error.message;
    return res.status(500).json({ error: msg });
  }
};

const deletePlanning = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.plannings.delete({ where: { idPlanning: Number.parseInt(id, 10) } });
    return res.json({ message: "Deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erreur serveur." });
  }
};

export default {
  getPlanning,
  createPlanning,
  updatePlanning,
  deletePlanning,
};
