// backend/controllers/PlanningController.js
import { PrismaClient } from "@prisma/client";
import PlanningsValidator from "../validators/PlanningsValidator.js";

const prisma = new PrismaClient();

// Helper: check if targetUser is in any team the manager has access to
// (either teams they manage or teams where they are a member)
async function isInManagersTeam(targetUserId, managerId) {
  const managerNum = Number(managerId);
  // Find teams where requester is manager OR is a team member
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
    // include the declared manager of that team as well
    if (typeof t.managerId !== 'undefined' && t.managerId !== null) memberSet.add(t.managerId);
  }

  console.log('isInManagersTeam', { targetUserId, managerId, managerNum, teamsFound: teamsManagedOrMember.length, memberSetSize: memberSet.size });
  return memberSet.has(Number(targetUserId));
} 

const getPlanning = async (req, res) => {
  try {
    let requesterId = req.user?.id;
    let requesterProfile = req.user?.profile;
    const { userId } = req.query;

    // If specific user asked
    if (userId) {
      const targetId = Number.parseInt(userId);

      // Log auth header + decoded user to help debugging
      const authHeader = req.headers?.authorization || null;
      const authPreview = authHeader ? (authHeader.length > 20 ? authHeader.substr(0,20) + '...' : authHeader) : null;
      console.log('getPlanning (by user) entry', { userId, authHeaderPresent: !!authHeader, authPreview, reqUser: req.user });

      // If middleware didn't populate req.user, attempt to decode token directly
      let decodedUser = req.user;
      if (!decodedUser && authHeader) {
        try {
          const token = authHeader.split(' ')[1];
          decodedUser = (await import('jsonwebtoken')).verify(token, process.env.JWT_SECRET);
          console.log('getPlanning: decoded token fallback', { id: decodedUser?.id, profile: decodedUser?.profile });
        } catch (err) {
          console.error('getPlanning: token decode fallback failed', err.message);
          return res.status(403).json({ error: 'Token invalide ou expiré.' });
        }
      }
      const requesterProfileNorm = (decodedUser?.profile || requesterProfile || '').toString().toLowerCase();
      requesterId = decodedUser?.id || requesterId; // keep existing if available

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
          console.error('Error during manager membership check (planning):', err);
          return res.status(500).json({ error: 'Erreur serveur lors de la vérification des permissions.' });
        }
      }

      console.log('GET /planning auth check', { requesterId, requesterProfile, requesterProfileNorm, targetId, allowed, managerCheck });

      if (!allowed) return res.status(403).json({ error: "Accès refusé." });

      const plans = await prisma.plannings.findMany({ where: { userId: targetId } });
      return res.json(plans);
    }

    // No user filter: admin gets all; manager gets their teams; employee gets own
    if (requesterProfile === "admin") {
      const plans = await prisma.plannings.findMany();
      return res.json(plans);
    }

    if (requesterProfile === "manager") {
      // get users part of teams managed by this manager
      const users = await prisma.users.findMany({ where: { TeamUser: { some: { Teams: { managerId: requesterId } } } } });
      const userIds = users.map(u => u.idUser);
      const plans = await prisma.plannings.findMany({ where: { userId: { in: userIds } } });
      return res.json(plans);
    }

    // employee: own plans
    const plans = await prisma.plannings.findMany({ where: { userId: requesterId } });
    return res.json(plans);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

const createPlanning = async (req, res) => {
  try {
    const validated = PlanningsValidator.parse(req.body);
    const requesterId = req.user?.id;
    const requesterProfile = req.user?.profile;
    const requesterProfileNorm = (requesterProfile || '').toString().toLowerCase();

    // If manager creating for someone else, ensure user is part of his team
    if (requesterProfileNorm === "manager" && validated.userId !== requesterId) {
      try {
        const allowed = await isInManagersTeam(validated.userId, requesterId);
        if (!allowed) return res.status(403).json({ error: "Accès refusé." });
      } catch (err) {
        console.error('Error during manager membership check (create planning):', err);
        return res.status(500).json({ error: 'Erreur serveur lors de la vérification des permissions.' });
      }
    }

    // Normalize date inputs and ensure full ISO/Z timezone if input was a string without timezone
    const toDate = (val) => {
      if (val instanceof Date) return val;
      if (typeof val === 'string') {
        const hasTZ = /[Zz]|[+-]\d{2}:?\d{2}$/.test(val);
        const s = hasTZ ? val : (val + 'Z');
        return new Date(s);
      }
      return new Date(val);
    };

    const startTime = toDate(validated.startTime);
    const endTime = toDate(validated.endTime);
    const dateObj = toDate(validated.date);

    if (isNaN(startTime) || isNaN(endTime) || isNaN(dateObj)) {
      return res.status(400).json({ error: 'Invalid date/time provided' });
    }

    console.log('createPlanning dates:', { date: dateObj, startTime: startTime.toISOString(), endTime: endTime.toISOString() });

    const newPlan = await prisma.plannings.create({ data: {
      userId: validated.userId,
      date: dateObj,
      startTime,
      endTime
    }});

    res.status(201).json(newPlan);
  } catch (error) {
    console.error(error);
    if (error.name === 'ZodError') return res.status(400).json({ errors: error.errors });
    res.status(500).json({ error: "Erreur serveur." });
  }
};

const updatePlanning = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('updatePlanning raw req.body:', req.body);
    // Try to validate but prefer raw request values for coercion
    const validated = PlanningsValidator.pick({ startTime: true, endTime: true }).safeParse(req.body);
    console.log('updatePlanning parsed ok?', validated.success);

    const requesterId = req.user?.id;
    const requesterProfile = req.user?.profile;

    const existing = await prisma.plannings.findUnique({ where: { idPlanning: Number.parseInt(id) } });
    if (!existing) return res.status(404).json({ error: "Planning introuvable." });

    // Authorization: admin always OK; manager only if user is in his team
    if (requesterProfile === "admin") {
      // allowed
    } else if (requesterProfile === "manager") {
      try {
        const allowed = await isInManagersTeam(existing.userId, requesterId);
        if (!allowed) return res.status(403).json({ error: "Accès refusé." });
      } catch (err) {
        console.error('Error during manager membership check (update planning):', err);
        return res.status(500).json({ error: 'Erreur serveur lors de la vérification des permissions.' });
      }
    } else {
      return res.status(403).json({ error: "Accès refusé." });
    }

    // Normalize and ensure full ISO timezone; handle strings without timezone by appending 'Z'
    const toDate = (val) => {
      if (val instanceof Date) return val;
      if (typeof val === 'string') {
        const hasTZ = /[Zz]|[+-]\d{2}:?\d{2}$/.test(val);
        const s = hasTZ ? val : (val + 'Z');
        return new Date(s);
      }
      return new Date(val);
    };

    // Prefer raw values from req.body to avoid unexpected preservation of original strings
    const rawStart = req.body?.startTime;
    const rawEnd = req.body?.endTime;
    console.log('updatePlanning raw start/end:', rawStart, rawEnd, 'validatedSuccess:', validated.success);

    const startTime = toDate(rawStart ?? (validated.success ? validated.data.startTime : undefined));
    const endTime = toDate(rawEnd ?? (validated.success ? validated.data.endTime : undefined));

    if (isNaN(startTime) || isNaN(endTime)) {
      console.log('updatePlanning invalid dates after coercion:', { startTime, endTime });
      return res.status(400).json({ error: 'Invalid startTime or endTime' });
    }
    console.log('updatePlanning dates (toISOString):', { id, startTime: startTime.toISOString(), endTime: endTime.toISOString() });

    // DEV: if debug flag is present, return the parsed data instead of updating DB
    if (process.env.NODE_ENV !== 'production' && req.query && req.query.debug === 'true') {
      return res.json({ raw: req.body, validated: validated.success ? validated.data : null, startISO: startTime.toISOString(), endISO: endTime.toISOString() });
    }

    const updated = await prisma.plannings.update({
      where: { idPlanning: Number.parseInt(id) },
      data: { startTime, endTime },
    });

    return res.json(updated);
  } catch (error) {
    console.error(error);
    if (error.name === 'ZodError') return res.status(400).json({ errors: error.errors });
    const msg = process.env.NODE_ENV === 'production' ? 'Erreur serveur.' : error.message;
    res.status(500).json({ error: msg });
  }
};

const deletePlanning = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.plannings.delete({ where: { idPlanning: Number.parseInt(id) } });
    return res.json({ message: 'Deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

export default {
  getPlanning,
  createPlanning,
  updatePlanning,
  deletePlanning
};
