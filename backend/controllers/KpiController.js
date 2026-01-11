import { PrismaClient } from '@prisma/client';
import KpisValidator from '../validators/KpisValidator.js';

const prisma = new PrismaClient();

// helper: get team members for a team
async function getTeamMemberIds(teamId) {
  const members = await prisma.teamUser.findMany({ where: { teamId }, select: { userId: true } });
  return members.map(m => m.userId);
}

// compute KPI results for a single user (metric = 'lateness' | 'hours') within date range (inclusive)
async function computeForUser(userId, metric, startDate, endDate) {
  const where = {
    userId,
    clockIn: { gte: startDate, lte: endDate }
  };

  if (metric === 'lateness') {
    // Get all clocks in range
    const clocks = await prisma.clocks.findMany({
      where,
      select: { idClock: true, clockIn: true }
    });

    // Get user's plannings to determine expected start times
    const plannings = await prisma.plannings.findMany({
      where: { userId },
      select: { startTime: true, endTime: true }
    });

    // Count how many clocks are late (clockIn > expected start time with 5min grace period)
    let lateCount = 0;
    for (const clock of clocks) {
      const clockInTime = new Date(clock.clockIn);
      const dayOfWeek = clockInTime.getDay(); // 0=Sunday, 1=Monday, etc
      
      // Find matching planning for this day
      const planning = plannings.find(p => {
        const pStart = new Date(p.startTime);
        return pStart.getDay() === dayOfWeek;
      });

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

  if (metric === 'hours') {
    const ag = await prisma.clocks.aggregate({
      _sum: { hoursWorked: true },
      where: { ...where, hoursWorked: { not: null } }
    });
    return ag._sum.hoursWorked ?? 0;
  }

  // custom - not implemented yet
  return null;
}

const createKpi = async (req, res) => {
  try {
    const validated = KpisValidator.parse(req.body);
    const requesterId = req.user?.id;
    const requesterProfile = (req.user?.profile || '').toString().toLowerCase();

    // Basic permission: managers can create KPIs only for their teams/users, admins can create any
    if (requesterProfile === 'manager') {
      if (validated.scope === 'team') {
        // ensure manager is manager or member of that team
        const team = await prisma.teams.findUnique({ where: { idTeam: validated.targetTeamId } });
        if (!team) return res.status(404).json({ error: 'Team not found.' });
        // manager can create if they manage the team or are a member
        const isAllowed = team.managerId === requesterId || (await prisma.teamUser.findFirst({ where: { teamId: validated.targetTeamId, userId: requesterId } }));
        if (!isAllowed) return res.status(403).json({ error: 'Accès refusé.' });
      }
      if (validated.scope === 'user') {
        // manager can create KPI only for users in their teams or for themselves
        const memberSet = new Set((await prisma.teams.findMany({ where: { managerId: requesterId }, include: { TeamUser: { select: { userId: true } } } })).flatMap(t => t.TeamUser.map(x => x.userId)));
        memberSet.add(requesterId);
        if (!memberSet.has(validated.targetUserId)) return res.status(403).json({ error: 'Accès refusé.' });
      }
    }

    const created = await prisma.kpi.create({ data: { ...validated, createdBy: requesterId } });
    res.status(201).json(created);
  } catch (err) {
    console.error('createKpi error', err);
    if (err.name === 'ZodError') return res.status(400).json({ errors: err.errors });
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

const listKpis = async (req, res) => {
  try {
    const requesterId = req.user?.id;
    const requesterProfile = (req.user?.profile || '').toString().toLowerCase();

    if (requesterProfile === 'admin') {
      const all = await prisma.kpi.findMany();
      return res.json(all);
    }

    if (requesterProfile === 'manager') {
      // return KPIs created by the manager or KPIs targeting teams they manage
      const kpis = await prisma.kpi.findMany({ where: { OR: [{ createdBy: requesterId }, { targetTeamId: { in: (await prisma.teams.findMany({ where: { managerId: requesterId }, select: { idTeam: true } })).map(t => t.idTeam) } }] } });
      return res.json(kpis);
    }

    // employee: KPIs created for themselves
    const kpis = await prisma.kpi.findMany({ where: { scope: 'user', targetUserId: requesterId } });
    return res.json(kpis);
  } catch (error) {
    console.error('listKpis error', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

const getKpiResults = async (req, res) => {
  try {
    const { id } = req.params;
    const kpi = await prisma.kpi.findUnique({ where: { id: Number.parseInt(id) } });
    if (!kpi) return res.status(404).json({ error: 'KPI introuvable.' });

    // date range
    const end = req.query.end ? new Date(req.query.end) : new Date();
    const start = req.query.start ? new Date(req.query.start) : new Date(end.getTime() - 30 * 24 * 3600 * 1000);

    let results = [];
    if (kpi.scope === 'user') {
      const val = await computeForUser(kpi.targetUserId, kpi.metric, start, end);
      const user = await prisma.users.findUnique({ where: { idUser: kpi.targetUserId } });
      results.push({ userId: user.idUser, firstname: user.firstname, lastname: user.lastname, value: val });
    } else if (kpi.scope === 'team') {
      const memberIds = await getTeamMemberIds(kpi.targetTeamId);
      for (const uid of memberIds) {
        const val = await computeForUser(uid, kpi.metric, start, end);
        const user = await prisma.users.findUnique({ where: { idUser: uid } });
        results.push({ userId: user.idUser, firstname: user.firstname, lastname: user.lastname, value: val });
      }
    }

    res.json({ kpiId: kpi.id, name: kpi.name, metric: kpi.metric, scope: kpi.scope, start: start.toISOString(), end: end.toISOString(), results });
  } catch (err) {
    console.error('getKpiResults error', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// Export endpoint: for MVP return same JSON; frontend will convert to PDF
const computeAdHoc = async (req, res) => {
  try {
    console.log('computeAdHoc called', { body: req.body, userId: req.user?.id, profile: req.user?.profile });
    const { metric, scope, targetUserId, targetTeamId, start, end } = req.body;
    const requesterId = req.user?.id;
    const requesterProfile = (req.user?.profile || '').toString().toLowerCase();

    const startDate = start ? new Date(start) : new Date(Date.now() - 30 * 24 * 3600 * 1000);
    const endDate = end ? new Date(end) : new Date();

    if (scope === 'user') {
      const uid = Number(targetUserId) || requesterId;
      // permission: managers only for their users
      if (requesterProfile === 'manager' && uid !== requesterId) {
        // ensure the manager has access
        const memberSet = new Set((await prisma.teams.findMany({ where: { managerId: requesterId }, include: { TeamUser: { select: { userId: true } } } })).flatMap(t => t.TeamUser.map(x => x.userId)));
        memberSet.add(requesterId);
        if (!memberSet.has(uid)) return res.status(403).json({ error: 'Accès refusé.' });
      }
      
      // Compute both lateness and hours
      const latenessCount = await computeForUser(uid, 'lateness', startDate, endDate);
      const hoursWorked = await computeForUser(uid, 'hours', startDate, endDate);
      
      // Get total days in range
      const clocks = await prisma.clocks.findMany({
        where: { userId: uid, clockIn: { gte: startDate, lte: endDate } }
      });
      const totalDays = clocks.length;
      const onTimeDays = totalDays - latenessCount;
      
      const user = await prisma.users.findUnique({ where: { idUser: uid } });
      return res.json({
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        user: { id: user.idUser, firstname: user.firstname, lastname: user.lastname },
        lateness: { lateCount: latenessCount, totalDays, onTimeDays },
        hours: { total: hoursWorked, totalDays }
      });
    }

    if (scope === 'team') {
      const teamIdNum = Number(targetTeamId);
      if (requesterProfile === 'manager') {
        // manager must manage or belong to team
        const team = await prisma.teams.findUnique({ where: { idTeam: teamIdNum } });
        if (!team) return res.status(404).json({ error: 'Team not found.' });
        const isAllowed = team.managerId === requesterId || (await prisma.teamUser.findFirst({ where: { teamId: teamIdNum, userId: requesterId } }));
        if (!isAllowed) return res.status(403).json({ error: 'Accès refusé.' });
      }

      const memberIds = await getTeamMemberIds(teamIdNum);
      const results = [];
      for (const uid of memberIds) {
        const latenessCount = await computeForUser(uid, 'lateness', startDate, endDate);
        const hoursWorked = await computeForUser(uid, 'hours', startDate, endDate);
        const clocks = await prisma.clocks.findMany({
          where: { userId: uid, clockIn: { gte: startDate, lte: endDate } }
        });
        const totalDays = clocks.length;
        const onTimeDays = totalDays - latenessCount;
        
        const user = await prisma.users.findUnique({ where: { idUser: uid } });
        results.push({
          user: { id: user.idUser, firstname: user.firstname, lastname: user.lastname },
          lateness: { lateCount: latenessCount, totalDays, onTimeDays },
          hours: { total: hoursWorked, totalDays }
        });
      }

      return res.json({ start: startDate.toISOString(), end: endDate.toISOString(), teamResults: results });
    }

    res.status(400).json({ error: 'Invalid scope.' });
  } catch (err) {
    console.error('computeAdHoc error', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

const exportKpi = async (req, res) => {
  try {
    const results = await getKpiResults(req, res);
    // Note: getKpiResults already sent response; as an MVP we will just reuse compute logic instead
    // For now, call compute logic and return JSON for client-side PDF export
    // (keeping this route for future server-side PDF generation)
  } catch (err) {
    console.error('exportKpi error', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

export default {
  createKpi,
  listKpis,
  getKpiResults,
  computeAdHoc,
  exportKpi
};
