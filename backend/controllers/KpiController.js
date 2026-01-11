import { PrismaClient } from "@prisma/client";
import KpisValidator from "../validators/KpisValidator.js";

const prisma = new PrismaClient();

// helper: get team members for a team
async function getTeamMemberIds(teamId) {
  const members = await prisma.teamUser.findMany({
    where: { teamId },
    select: { userId: true },
  });
  return members.map((m) => m.userId);
}

// compute KPI results for a single user (metric = 'lateness' | 'hours') within date range (inclusive)
async function computeForUser(userId, metric, startDate, endDate) {
  const where = {
    userId,
    clockIn: { gte: startDate, lte: endDate },
  };

  if (metric === "lateness") {
    // Get all clocks in range
    const clocks = await prisma.clocks.findMany({
      where,
      select: { idClock: true, clockIn: true },
    });

    // Get user's plannings (both templates and date-specific)
    const plannings = await prisma.plannings.findMany({
      where: { userId },
      select: { startTime: true, endTime: true, date: true, isTemplate: true, dayOfWeek: true },
    });

    // Count how many clocks are late (clockIn > expected start time with 5min grace period)
    let lateCount = 0;
    for (const clock of clocks) {
      const clockInTime = new Date(clock.clockIn);
      const clockDateStr = clockInTime.toISOString().split("T")[0]; // YYYY-MM-DD
      const dayOfWeek = (clockInTime.getDay() + 6) % 7; // Convert to 0=Monday format

      // First, try to find a date-specific planning for this exact date
      let planning = plannings.find((p) => {
        if (p.isTemplate) return false; // Skip templates for now
        if (!p.date) return false;
        const pDateStr = new Date(p.date).toISOString().split("T")[0];
        return pDateStr === clockDateStr;
      });

      // If no date-specific planning, use template planning for this day of week
      if (!planning) {
        planning = plannings.find((p) => p.isTemplate && p.dayOfWeek === dayOfWeek);
      }

      if (planning) {
        // Extract time from planning start
        const expectedStart = new Date(planning.startTime);
        const expectedHour = expectedStart.getHours();
        const expectedMin = expectedStart.getMinutes();

        // Set expected time to clock-in date with planning's time
        const expectedDateTime = new Date(clockInTime);
        expectedDateTime.setHours(expectedHour, expectedMin, 0, 0);

        // Add 5min grace period
        expectedDateTime.setMinutes(expectedDateTime.getMinutes() + 5);

        if (clockInTime > expectedDateTime) {
          lateCount++;
        }
      }
    }

    return lateCount;
  }

  if (metric === "hours") {
    const ag = await prisma.clocks.aggregate({
      _sum: { hoursWorked: true },
      where: { ...where, hoursWorked: { not: null } },
    });
    return ag._sum.hoursWorked ?? 0;
  }

  // custom - not implemented yet
  return null;
}

/**
 * Helpers for permission checks (reduce cognitive complexity)
 */
async function buildManagerMemberSet(requesterId) {
  const teams = await prisma.teams.findMany({
    where: { managerId: requesterId },
    include: { TeamUser: { select: { userId: true } } },
  });

  const memberSet = new Set(teams.flatMap((t) => t.TeamUser.map((x) => x.userId)));
  memberSet.add(requesterId);
  return memberSet;
}

async function assertManagerCanTargetTeam(requesterId, targetTeamId) {
  const team = await prisma.teams.findUnique({ where: { idTeam: targetTeamId } });
  if (!team) return { ok: false, status: 404, error: "Team not found." };

  const isMember = await prisma.teamUser.findFirst({
    where: { teamId: targetTeamId, userId: requesterId },
  });

  const isAllowed = team.managerId === requesterId || isMember;
  if (!isAllowed) return { ok: false, status: 403, error: "Accès refusé." };

  return { ok: true };
}

async function assertManagerCanTargetUser(requesterId, targetUserId) {
  const memberSet = await buildManagerMemberSet(requesterId);
  if (!memberSet.has(targetUserId)) return { ok: false, status: 403, error: "Accès refusé." };
  return { ok: true };
}

const createKpi = async (req, res) => {
  try {
    const validated = KpisValidator.parse(req.body);
    const requesterId = req.user?.id;
    const requesterProfile = (req.user?.profile || "").toString().toLowerCase();

    // Basic permission: managers can create KPIs only for their teams/users, admins can create any
    if (requesterProfile === "manager") {
      if (validated.scope === "team") {
        const check = await assertManagerCanTargetTeam(requesterId, validated.targetTeamId);
        if (!check.ok) return res.status(check.status).json({ error: check.error });
      }

      if (validated.scope === "user") {
        const check = await assertManagerCanTargetUser(requesterId, validated.targetUserId);
        if (!check.ok) return res.status(check.status).json({ error: check.error });
      }
    }

    const created = await prisma.kpi.create({ data: { ...validated, createdBy: requesterId } });
    return res.status(201).json(created);
  } catch (err) {
    console.error("createKpi error", err);
    if (err.name === "ZodError") return res.status(400).json({ errors: err.errors });
    return res.status(500).json({ error: "Erreur serveur." });
  }
};

const listKpis = async (req, res) => {
  try {
    const requesterId = req.user?.id;
    const requesterProfile = (req.user?.profile || "").toString().toLowerCase();

    if (requesterProfile === "admin") {
      const all = await prisma.kpi.findMany();
      return res.json(all);
    }

    if (requesterProfile === "manager") {
      // return KPIs created by the manager or KPIs targeting teams they manage
      const teamIds = (
        await prisma.teams.findMany({ where: { managerId: requesterId }, select: { idTeam: true } })
      ).map((t) => t.idTeam);

      const kpis = await prisma.kpi.findMany({
        where: { OR: [{ createdBy: requesterId }, { targetTeamId: { in: teamIds } }] },
      });

      return res.json(kpis);
    }

    // employee: KPIs created for themselves
    const kpis = await prisma.kpi.findMany({ where: { scope: "user", targetUserId: requesterId } });
    return res.json(kpis);
  } catch (error) {
    console.error("listKpis error", error);
    return res.status(500).json({ error: "Erreur serveur." });
  }
};

const getKpiResults = async (req, res) => {
  try {
    const { id } = req.params;
    const kpi = await prisma.kpi.findUnique({ where: { id: Number.parseInt(id, 10) } });
    if (!kpi) return res.status(404).json({ error: "KPI introuvable." });

    // date range
    const end = req.query.end ? new Date(req.query.end) : new Date();
    const start = req.query.start
      ? new Date(req.query.start)
      : new Date(end.getTime() - 30 * 24 * 3600 * 1000);

    const results = [];
    if (kpi.scope === "user") {
      const val = await computeForUser(kpi.targetUserId, kpi.metric, start, end);
      const user = await prisma.users.findUnique({ where: { idUser: kpi.targetUserId } });
      results.push({ userId: user.idUser, firstname: user.firstname, lastname: user.lastname, value: val });
    } else if (kpi.scope === "team") {
      const memberIds = await getTeamMemberIds(kpi.targetTeamId);
      for (const uid of memberIds) {
        const val = await computeForUser(uid, kpi.metric, start, end);
        const user = await prisma.users.findUnique({ where: { idUser: uid } });
        results.push({ userId: user.idUser, firstname: user.firstname, lastname: user.lastname, value: val });
      }
    }

    return res.json({
      kpiId: kpi.id,
      name: kpi.name,
      metric: kpi.metric,
      scope: kpi.scope,
      start: start.toISOString(),
      end: end.toISOString(),
      results,
    });
  } catch (err) {
    console.error("getKpiResults error", err);
    return res.status(500).json({ error: "Erreur serveur." });
  }
};

/**
 * Helpers for computeAdHoc (reduce cognitive complexity)
 */
function parseDateRange(start, end) {
  const startDate = start ? new Date(start) : new Date(Date.now() - 30 * 24 * 3600 * 1000);
  const endDate = end ? new Date(end) : new Date();
  return { startDate, endDate };
}

async function computeUserKpiPayload(uid, startDate, endDate) {
  const latenessCount = await computeForUser(uid, "lateness", startDate, endDate);
  const hoursWorked = await computeForUser(uid, "hours", startDate, endDate);

  const clocks = await prisma.clocks.findMany({
    where: { userId: uid, clockIn: { gte: startDate, lte: endDate } },
  });

  const totalDays = clocks.length;
  const onTimeDays = totalDays - latenessCount;

  const user = await prisma.users.findUnique({ where: { idUser: uid } });

  return {
    user: { id: user.idUser, firstname: user.firstname, lastname: user.lastname },
    lateness: { lateCount: latenessCount, totalDays, onTimeDays },
    hours: { total: hoursWorked, totalDays },
  };
}

async function assertManagerCanAccessUserForAdHoc(requesterId, requesterProfile, uid) {
  if (requesterProfile !== "manager") return { ok: true };
  if (uid === requesterId) return { ok: true };

  const check = await assertManagerCanTargetUser(requesterId, uid);
  if (!check.ok) return check;

  return { ok: true };
}

async function assertManagerCanAccessTeamForAdHoc(requesterId, requesterProfile, teamIdNum) {
  if (requesterProfile !== "manager") return { ok: true };
  return assertManagerCanTargetTeam(requesterId, teamIdNum);
}

// Export endpoint: for MVP return same JSON; frontend will convert to PDF
const computeAdHoc = async (req, res) => {
  try {
    // Sonar: remove unused 'metric' variable
    const { scope, targetUserId, targetTeamId, start, end } = req.body;

    const requesterId = req.user?.id;
    const requesterProfile = (req.user?.profile || "").toString().toLowerCase();

    const { startDate, endDate } = parseDateRange(start, end);

    if (scope === "user") {
      const uid = Number(targetUserId) || requesterId;

      // permission: managers only for their users
      const perm = await assertManagerCanAccessUserForAdHoc(requesterId, requesterProfile, uid);
      if (!perm.ok) return res.status(perm.status).json({ error: perm.error });

      const payload = await computeUserKpiPayload(uid, startDate, endDate);

      return res.json({
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        ...payload,
      });
    }

    if (scope === "team") {
      const teamIdNum = Number(targetTeamId);

      const perm = await assertManagerCanAccessTeamForAdHoc(requesterId, requesterProfile, teamIdNum);
      if (!perm.ok) return res.status(perm.status).json({ error: perm.error });

      const memberIds = await getTeamMemberIds(teamIdNum);
      const teamResults = [];
      for (const uid of memberIds) {
        const payload = await computeUserKpiPayload(uid, startDate, endDate);
        teamResults.push(payload);
      }

      return res.json({
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        teamResults,
      });
    }

    return res.status(400).json({ error: "Invalid scope." });
  } catch (err) {
    console.error("computeAdHoc error", err);
    return res.status(500).json({ error: "Erreur serveur." });
  }
};

const exportKpi = async (req, res) => {
  try {
    // Sonar: remove useless assignment to unused 'results' variable
    return await getKpiResults(req, res);
  } catch (err) {
    console.error("exportKpi error", err);
    return res.status(500).json({ error: "Erreur serveur." });
  }
};

export default {
  createKpi,
  listKpis,
  getKpiResults,
  computeAdHoc,
  exportKpi,
};
