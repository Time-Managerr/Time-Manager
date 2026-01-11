import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Helper: generate ISO date string
function isoDate(year, month, day) {
  return new Date(Date.UTC(year, month - 1, day)).toISOString();
}

// Random name generators
const firstNames = ['Jack', 'Sam', 'Paul', 'Kate', 'Olivia', 'Emma', 'Noah', 'Liam', 'Sophia', 'Mason', 'Isabella', 'Ethan', 'Ava', 'Lucas', 'Mia', 'Oliver', 'Charlotte', 'Elijah', 'Amelia', 'James'];
const lastNames = ['Johnson', 'Xavier', 'Quinn', 'Davis', 'Young', 'Smith', 'Brown', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson'];
const teamNames = ['IT', 'Sales', 'Human Resources', 'Finance', 'Marketing'];

function randomName() {
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  const last = lastNames[Math.floor(Math.random() * lastNames.length)];
  return { first, last };
}

async function main() {
  console.log('Seeding mock data: wiping all existing data and creating fresh dataset');
  const now = new Date();

  // Wipe all data
  try { await prisma.kpi.deleteMany(); } catch(e) { console.log('Skipping KPI delete'); }
  try { await prisma.reports.deleteMany(); } catch(e) { console.log('Skipping reports delete'); }
  await prisma.vacations.deleteMany();
  await prisma.clocks.deleteMany();
  await prisma.plannings.deleteMany();
  await prisma.teamUser.deleteMany();
  await prisma.teams.deleteMany();
  await prisma.userRoles.deleteMany();
  await prisma.users.deleteMany();

  // Step 1: Create admin
  const hashedPassword = await bcrypt.hash('Password1!', 10);
  const admin = await prisma.users.create({
    data: {
      firstname: 'Admin',
      lastname: 'User',
      email: 'admin@gmail.com',
      password: hashedPassword,
      phone: 1234567890,
      profile: 'admin'
    }
  });
  console.log('Created admin: admin@gmail.com');

  // Step 2: Create teams with managers and employees
  const teamsData = [];
  for (let t = 0; t < 5; t++) {
    const managerName = randomName();
    const manager = await prisma.users.create({
      data: {
        firstname: managerName.first,
        lastname: managerName.last,
        email: `manager${t + 1}@gmail.com`,
        password: hashedPassword,
        phone: 1234567890 + t,
        profile: 'manager'
      }
    });

    const team = await prisma.teams.create({
      data: {
        name: teamNames[t],
        description: `${teamNames[t]} department`,
        managerId: manager.idUser
      }
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
          phone: 2000000000 + (t * 100) + e,
          profile: 'employee'
        }
      });
      await prisma.teamUser.create({ data: { teamId: team.idTeam, userId: emp.idUser } });
      employees.push(emp);
    }

    teamsData.push({ team, manager, employees });
    console.log(`Created ${team.name} team with manager ${manager.firstname} ${manager.lastname} and 10 employees`);
  }

  const allUsers = [admin, ...teamsData.flatMap(t => [t.manager, ...t.employees])];
  const allEmployees = teamsData.flatMap(t => [t.manager, ...t.employees]);

  // Step 3: Create plannings (Mon-Fri, 09:00-17:00) for December 2025 to January 9, 2026
  const allPlannings = [];
  const monday = new Date();
  monday.setDate(monday.getDate() - monday.getDay() + 1);

  for (const u of allUsers) {
    if (u.profile === 'admin') continue;
    
    // Create plannings for Dec 1 - Jan 9
    const startPlan = new Date('2025-12-01');
    const endPlan = new Date('2026-01-09');
    let currentPlan = new Date(startPlan);
    
    while (currentPlan <= endPlan) {
      const dayOfWeek = currentPlan.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip weekends
        const dateOnly = new Date(Date.UTC(currentPlan.getUTCFullYear(), currentPlan.getUTCMonth(), currentPlan.getUTCDate()));
        const startTime = new Date(dateOnly.getTime()); 
        startTime.setUTCHours(9, 0, 0, 0);
        const endTime = new Date(dateOnly.getTime()); 
        endTime.setUTCHours(17, 0, 0, 0);
        
        const planning = await prisma.plannings.create({ 
          data: { userId: u.idUser, date: dateOnly, startTime, endTime } 
        });
        allPlannings.push(planning);
      }
      currentPlan.setDate(currentPlan.getDate() + 1);
    }
  }
  console.log(`Created plannings (Dec 1 - Jan 9, Mon-Fri 09:00-17:00) for all users`);

  // Step 4: Generate realistic clock entries with employee behavior profiles
  console.log('Generating realistic clock entries with varied employee profiles...');
  const startGenDate = new Date('2025-12-01');
  const endGenDate = new Date('2026-01-09');
  
  // Define employee behavior profiles
  const profiles = [
    { type: 'ideal', weight: 0.15 }, // 15% ideal employees
    { type: 'punctual', weight: 0.30 }, // 30% mostly on time
    { type: 'sometimes_late', weight: 0.25 }, // 25% occasionally late
    { type: 'frequently_late', weight: 0.15 }, // 15% often late
    { type: 'early_leaver', weight: 0.10 }, // 10% leaves early
    { type: 'inconsistent', weight: 0.05 } // 5% very inconsistent
  ];

  // Assign profiles to employees
  const employeeProfiles = new Map();
  for (const employee of allEmployees) {
    let cumulative = 0;
    const rand = Math.random();
    for (const profile of profiles) {
      cumulative += profile.weight;
      if (rand <= cumulative) {
        employeeProfiles.set(employee.idUser, profile.type);
        break;
      }
    }
  }

  const clockEntries = [];
  let currentDate = new Date(startGenDate);
  
  while (currentDate <= endGenDate) {
    const dayOfWeek = currentDate.getDay();
    
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      for (const employee of allEmployees) {
        const planning = allPlannings.find(p => 
          p.userId === employee.idUser && new Date(p.startTime).getDay() === dayOfWeek
        );
        
        if (planning) {
          const planStart = new Date(planning.startTime);
          const planEnd = new Date(planning.endTime);
          const profileType = employeeProfiles.get(employee.idUser) || 'punctual';
          
          const clockIn = new Date(currentDate);
          clockIn.setHours(planStart.getHours(), planStart.getMinutes(), 0, 0);
          
          const clockOut = new Date(currentDate);
          clockOut.setHours(planEnd.getHours(), planEnd.getMinutes(), 0, 0);
          
          switch (profileType) {
            case 'ideal':
              // Always 3-7 minutes early, leaves 5-10 minutes after
              clockIn.setMinutes(clockIn.getMinutes() - (3 + Math.floor(Math.random() * 5)));
              clockOut.setMinutes(clockOut.getMinutes() + (5 + Math.floor(Math.random() * 6)));
              break;
            case 'punctual':
              // On time or 1-5 minutes early, leaves on time or 1-5 minutes after
              clockIn.setMinutes(clockIn.getMinutes() - Math.floor(Math.random() * 6));
              clockOut.setMinutes(clockOut.getMinutes() + Math.floor(Math.random() * 6));
              break;
            case 'sometimes_late':
              // 30% chance of being 5-20 minutes late
              if (Math.random() < 0.3) {
                clockIn.setMinutes(clockIn.getMinutes() + (5 + Math.floor(Math.random() * 16)));
              } else {
                clockIn.setMinutes(clockIn.getMinutes() - Math.floor(Math.random() * 3));
              }
              clockOut.setMinutes(clockOut.getMinutes() + Math.floor(Math.random() * 5));
              break;
            case 'frequently_late':
              // 60% chance of being 10-30 minutes late
              if (Math.random() < 0.6) {
                clockIn.setMinutes(clockIn.getMinutes() + (10 + Math.floor(Math.random() * 21)));
              } else {
                clockIn.setMinutes(clockIn.getMinutes() + Math.floor(Math.random() * 5));
              }
              clockOut.setMinutes(clockOut.getMinutes() + Math.floor(Math.random() * 3));
              break;
            case 'early_leaver':
              // On time arrival, but leaves 10-30 minutes early 40% of the time
              clockIn.setMinutes(clockIn.getMinutes() - Math.floor(Math.random() * 3));
              if (Math.random() < 0.4) {
                clockOut.setMinutes(clockOut.getMinutes() - (10 + Math.floor(Math.random() * 21)));
              }
              break;
            case 'inconsistent':
              // Completely random: 50% late, 50% on time, random leave times
              if (Math.random() < 0.5) {
                clockIn.setMinutes(clockIn.getMinutes() + Math.floor(Math.random() * 40));
              } else {
                clockIn.setMinutes(clockIn.getMinutes() - Math.floor(Math.random() * 5));
              }
              if (Math.random() < 0.3) {
                clockOut.setMinutes(clockOut.getMinutes() - Math.floor(Math.random() * 30));
              } else {
                clockOut.setMinutes(clockOut.getMinutes() + Math.floor(Math.random() * 10));
              }
              break;
          }
          
          const msWorked = clockOut.getTime() - clockIn.getTime();
          const hoursWorked = msWorked / (1000 * 60 * 60);
          
          clockEntries.push({
            userId: employee.idUser,
            clockIn: clockIn.toISOString(),
            clockOut: clockOut.toISOString(),
            hoursWorked: parseFloat(hoursWorked.toFixed(2)),
            createdAt: clockIn.toISOString()
          });
        }
      }
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }

  await prisma.clocks.createMany({ data: clockEntries });
  console.log(`Created ${clockEntries.length} realistic clock entries`);
  console.log(`Employee profiles: ${Array.from(employeeProfiles.entries()).slice(0, 5).map(([id, type]) => `User ${id}: ${type}`).join(', ')}...`);

  // Step 5: Create sample vacations
  if (allEmployees.length >= 2) {
    await prisma.vacations.create({
      data: {
        userId: allEmployees[0].idUser,
        startDate: isoDate(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate() + 7),
        endDate: isoDate(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate() + 10),
        status: 'approved'
      }
    });
    await prisma.vacations.create({
      data: {
        userId: allEmployees[1].idUser,
        startDate: isoDate(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate() + 14),
        endDate: isoDate(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate() + 18),
        status: 'pending'
      }
    });
  }
  console.log('Created sample vacations');

  console.log('✅ Seeding complete!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
