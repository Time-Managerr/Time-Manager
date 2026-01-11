import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";

const prisma = new PrismaClient();

// Helper: generate ISO date string
function isoDate(year, month, day) {
  return new Date(Date.UTC(year, month - 1, day)).toISOString();
}

// ✅ Secure random helpers (avoid Math.random)
function randomInt(maxExclusive) {
  return crypto.randomInt(0, maxExclusive);
}
function randomFloat() {
  // float in [0, 1)
  return randomInt(1_000_000) / 1_000_000;
}

// Random name generators
const firstNames = [
  "Jack", "Sam", "Paul", "Kate", "Olivia", "Emma", "Noah", "Liam", "Sophia", "Mason",
  "Isabella", "Ethan", "Ava", "Lucas", "Mia", "Oliver", "Charlotte", "Elijah", "Amelia", "James"
];

const lastNames = [
  "Johnson", "Xavier", "Quinn", "Davis", "Young", "Smith", "Brown", "Wilson", "Moore", "Taylor",
  "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Garcia", "Martinez", "Robinson"
];

const teamNames = ["IT", "Sales", "Human Resources", "Finance", "Marketing"];

function randomName() {
  const first = firstNames[randomInt(firstNames.length)];
  const last = lastNames[randomInt(lastNames.length)];
  return { first, last };
}

async function safeDeleteMany(model, label) {
  try {
    await model.deleteMany();
  } catch (err) {
    // Sonar: handle exception meaningfully (log it)
    console.warn(`Skipping ${label} deleteMany:`, err?.message || err);
  }
}

async function wipeData() {
  console.log("Seeding mock data: wiping all existing data and creating fresh dataset");
  // Optional tables (may not exist depending on schema version)
  await safeDeleteMany(prisma.kpi, "kpi");
  await safeDeleteMany(prisma.reports, "reports");
  // Required tables (should exist)
  await prisma.vacations.deleteMany();
  await prisma.clocks.deleteMany();
  await prisma.plannings.deleteMany();
  await prisma.teamUser.deleteMany();
  await prisma.teams.deleteMany();
  await prisma.userRoles.deleteMany();
  await prisma.users.deleteMany();
}

async function createAdmin(hashedPassword) {
  const admin = await prisma.users.create({
    data: {
      firstname: "Admin",
      lastname: "User",
      email: "admin@gmail.com",
      password: hashedPassword,
      phone: 1234567890,
      profile: "admin",
    },
  });
  console.log("Created admin: admin@gmail.com");
  return admin;
}

async function createTeamsAndUsers(hashedPassword) {
  const teamsData = [];
  for (let t = 0; t < teamNames.length; t++) {
    const managerName = randomName();
    const manager = await prisma.users.create({
      data: {
        firstname: managerName.first,
        lastname: managerName.last,
        email: `manager${t + 1}@gmail.com`,
        password: hashedPassword,
        phone: 1234567890 + t,
        profile: "manager",
      },
    });

    const team = await prisma.teams.create({
      data: {
        name: teamNames[t],
        description: `${teamNames[t]} department`,
        managerId: manager.idUser,
      },
    });

    const employees = [];
    for (let e = 0; e < 10; e++) {
      const empName = randomName();
      const emp = await prisma.users.create({
        data: {
          firstname: empName.first,
          lastname: empName.last,
          email: `${empName.first.toLowerCase()}.${empName.last.toLowerCase()}${t}${e}@company.com`,
          password: hashedPassword,
          phone: 2000000000 + t * 100 + e,
          profile: "employee",
        },
      });
      await prisma.teamUser.create({ data: { teamId: team.idTeam, userId: emp.idUser } });
      employees.push(emp);
    }

    teamsData.push({ team, manager, employees });
    console.log(
      `Created ${team.name} team with manager ${manager.firstname} ${manager.lastname} and 10 employees`
    );
  }
  return teamsData;
}

async function createTemplatePlannings(users) {
  const allPlannings = [];
  for (const u of users) {
    if (u.profile === "admin") continue;

    for (let dayOfWeek = 0; dayOfWeek < 5; dayOfWeek++) {
      const startTime = new Date("1970-01-01T09:00:00Z");
      const endTime = new Date("1970-01-01T17:00:00Z");

      const planning = await prisma.plannings.create({
        data: {
          userId: u.idUser,
          isTemplate: true,
          dayOfWeek,
          date: null,
          startTime,
          endTime,
        },
      });
      allPlannings.push(planning);
    }
  }
  console.log("Created template plannings (Mon-Fri 09:00-17:00) for all users");
  return allPlannings;
}

function buildEmployeeProfiles(allEmployees) {
  const profiles = [
    { type: "ideal", weight: 0.15 },
    { type: "punctual", weight: 0.3 },
    { type: "sometimes_late", weight: 0.25 },
    { type: "frequently_late", weight: 0.15 },
    { type: "early_leaver", weight: 0.1 },
    { type: "inconsistent", weight: 0.05 },
  ];

  const employeeProfiles = new Map();
  for (const employee of allEmployees) {
    let cumulative = 0;
    const rand = randomFloat();
    for (const profile of profiles) {
      cumulative += profile.weight;
      if (rand <= cumulative) {
        employeeProfiles.set(employee.idUser, profile.type);
        break;
      }
    }
  }
  return employeeProfiles;
}

function computeClockInOutForProfile({ profileType, baseClockIn, baseClockOut }) {
  const clockIn = new Date(baseClockIn);
  const clockOut = new Date(baseClockOut);

  switch (profileType) {
    case "ideal":
      clockIn.setMinutes(clockIn.getMinutes() - (3 + randomInt(5)));
      clockOut.setMinutes(clockOut.getMinutes() + (5 + randomInt(6)));
      break;

    case "punctual":
      clockIn.setMinutes(clockIn.getMinutes() - randomInt(6));
      clockOut.setMinutes(clockOut.getMinutes() + randomInt(6));
      break;

    case "sometimes_late":
      if (randomFloat() < 0.3) {
        clockIn.setMinutes(clockIn.getMinutes() + (5 + randomInt(16)));
      } else {
        clockIn.setMinutes(clockIn.getMinutes() - randomInt(3));
      }
      clockOut.setMinutes(clockOut.getMinutes() + randomInt(5));
      break;

    case "frequently_late":
      if (randomFloat() < 0.6) {
        clockIn.setMinutes(clockIn.getMinutes() + (10 + randomInt(21)));
      } else {
        clockIn.setMinutes(clockIn.getMinutes() + randomInt(5));
      }
      clockOut.setMinutes(clockOut.getMinutes() + randomInt(3));
      break;

    case "early_leaver":
      clockIn.setMinutes(clockIn.getMinutes() - randomInt(3));
      if (randomFloat() < 0.4) {
        clockOut.setMinutes(clockOut.getMinutes() - (10 + randomInt(21)));
      }
      break;

    case "inconsistent":
      if (randomFloat() < 0.5) {
        clockIn.setMinutes(clockIn.getMinutes() + randomInt(40));
      } else {
        clockIn.setMinutes(clockIn.getMinutes() - randomInt(5));
      }

      if (randomFloat() < 0.3) {
        clockOut.setMinutes(clockOut.getMinutes() - randomInt(30));
      } else {
        clockOut.setMinutes(clockOut.getMinutes() + randomInt(10));
      }
      break;

    default:
      break;
  }

  return { clockIn, clockOut };
}

function hoursWorkedFrom(clockIn, clockOut) {
  const msWorked = clockOut.getTime() - clockIn.getTime();
  const hoursWorked = msWorked / (1000 * 60 * 60);
  return Number.parseFloat(hoursWorked.toFixed(2));
}

function buildProfilesPreview(employeeProfiles, limit = 5) {
  const entries = Array.from(employeeProfiles.entries()).slice(0, limit);
  const parts = entries.map(([id, type]) => `User ${id}: ${type}`);
  return `${parts.join(", ")}...`;
}

async function generateClockEntries({ allEmployees, allPlannings, employeeProfiles }) {
  console.log("Generating realistic clock entries with varied employee profiles...");

  const startGenDate = new Date("2025-12-01");
  const endGenDate = new Date("2026-01-09");
  const endGenTime = endGenDate.getTime();

  const clockEntries = [];
  let currentDate = new Date(startGenDate);

  while (currentDate.getTime() <= endGenTime) {
    const dayOfWeek = (currentDate.getDay() + 6) % 7; // 0=Monday
    if (dayOfWeek >= 0 && dayOfWeek < 5) {
      for (const employee of allEmployees) {
        const planning = allPlannings.find(
          (p) => p.userId === employee.idUser && p.dayOfWeek === dayOfWeek
        );
        if (!planning) continue;

        const planStart = new Date(planning.startTime);
        const planEnd = new Date(planning.endTime);

        const baseClockIn = new Date(currentDate);
        baseClockIn.setHours(planStart.getUTCHours(), planStart.getUTCMinutes(), 0, 0);

        const baseClockOut = new Date(currentDate);
        baseClockOut.setHours(planEnd.getUTCHours(), planEnd.getUTCMinutes(), 0, 0);

        const profileType = employeeProfiles.get(employee.idUser) || "punctual";
        const { clockIn, clockOut } = computeClockInOutForProfile({
          profileType,
          baseClockIn,
          baseClockOut,
        });

        clockEntries.push({
          userId: employee.idUser,
          clockIn: clockIn.toISOString(),
          clockOut: clockOut.toISOString(),
          hoursWorked: hoursWorkedFrom(clockIn, clockOut),
          createdAt: clockIn.toISOString(),
        });
      }
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  await prisma.clocks.createMany({ data: clockEntries });
  console.log(`Created ${clockEntries.length} realistic clock entries`);

  const preview = buildProfilesPreview(employeeProfiles, 5);
  console.log(`Employee profiles: ${preview}`);

  return clockEntries;
}

async function createSampleVacations(allEmployees, now) {
  if (allEmployees.length < 2) return;

  await prisma.vacations.create({
    data: {
      userId: allEmployees[0].idUser,
      startDate: isoDate(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate() + 7),
      endDate: isoDate(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate() + 10),
      status: "approved",
    },
  });

  await prisma.vacations.create({
    data: {
      userId: allEmployees[1].idUser,
      startDate: isoDate(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate() + 14),
      endDate: isoDate(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate() + 18),
      status: "pending",
    },
  });

  console.log("Created sample vacations");
}

async function main() {
  const now = new Date();
  await wipeData();

  const hashedPassword = await bcrypt.hash("Password1!", 10);
  const admin = await createAdmin(hashedPassword);

  const teamsData = await createTeamsAndUsers(hashedPassword);
  const allUsers = [admin, ...teamsData.flatMap((t) => [t.manager, ...t.employees])];
  const allEmployees = teamsData.flatMap((t) => [t.manager, ...t.employees]);

  const allPlannings = await createTemplatePlannings(allUsers);
  const employeeProfiles = buildEmployeeProfiles(allEmployees);

  await generateClockEntries({ allEmployees, allPlannings, employeeProfiles });
  await createSampleVacations(allEmployees, now);

  console.log("✅ Seeding complete!");
}

// Sonar: prefer top-level await instead of promise chain
try {
  await main();
} catch (e) {
  console.error(e);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
