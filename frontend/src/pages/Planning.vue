<template>
  <main class="flex-fill p-4 planning-page">
    <!-- PAGE TITLE -->
    <div class="page-header mb-4">
      <svg viewBox="0 0 24 24" class="page-icon" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
      <h3 class="page-title mb-0">Planning</h3>
    </div>

    <!-- Date and Time Info -->
    <div class="d-flex justify-content-between align-items-center mb-4 text-muted small">
      <span>{{ formattedDate }}</span>
      <div class="time">{{ currentTime }}</div>
    </div>

    <div class="row">
      <!-- ================= CALENDRIER + VACANCES ================= -->
      <div class="col-9">
        <div class="calendar-container">
          <!-- JOURS -->
          <div class="calendar-header d-flex">
            <div class="time-col"></div>
            <div v-for="day in days" :key="day" class="day-col-header">
              {{ day }}
            </div>
          </div>

          <!-- GRID + EVENTS -->
          <div class="calendar-grid">
            <!-- COLONNE HEURES -->
            <div class="time-col">
              <div v-for="hour in hours" :key="hour" class="hour-label">
                {{ hour }}
              </div>
            </div>

            <!-- LES 7 JOURS -->
            <div v-for="dayIndex in 7" :key="dayIndex" class="day-column">
              <div
                v-for="event in eventsForDay(dayIndex - 1)"
                :key="event.id"
                class="calendar-event"
                :style="eventStyle(event)"
                :title="event.title"
              >
                <small class="event-title">{{ event.title }}</small>
              </div>
            </div>
          </div>
        </div>

        <!-- ================= FORMULAIRE D’AJOUT ================= -->
        <div class="mt-4 d-flex align-items-start gap-3">
          <button class="btn btn-outline-dark" @click="selectDay(new Date(weekStart).getDay() - 1)">➕ Add event on calendar</button>

          <!-- Small editor shown when a day is selected -->
          <div v-if="selectedDate" class="p-3 shadow rounded" style="background:#fff; min-width:260px;">
            <div class="d-flex justify-content-between align-items-center">
              <strong>{{ selectedDate }}</strong>
              <button class="btn btn-sm btn-outline-secondary" @click="() => { selectedDate = null; selectedPlan = null }">✖</button>
            </div>

            <div class="mt-2">
              <label class="small" for="planning-start-time">Start</label>
              <input
                id="planning-start-time"
                v-model="startTimeStr"
                type="time"
                class="form-control form-control-sm"
              />
            </div>

            <div class="mt-2">
              <label class="small" for="planning-end-time">End</label>
              <input
                id="planning-end-time"
                v-model="endTimeStr"
                type="time"
                class="form-control form-control-sm"
              />
            </div>

            <div v-if="selectedDateError" class="text-danger small mt-2">{{ selectedDateError }}</div>

            <div class="mt-3 d-flex gap-2 justify-content-end">
              <button class="btn btn-sm btn-secondary" @click="() => { selectedDate = null; selectedPlan = null }">Cancel</button>
              <button class="btn btn-sm btn-primary" @click="savePlan">Save</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ================= SIDEBAR TEAMS ================= -->
      <div class="col-3">
        <h5 class="fw-bold">Teams</h5>

        <!-- Manager: select a user to view/edit -->
        <div v-if="isManager" class="mb-3">
          <label class="small" for="planning-selected-user">Selected user</label>
          <select
            id="planning-selected-user"
            class="form-select form-select-sm"
            v-model="selectedUserId"
            @change="() => fetchPlannings(selectedUserId)"
          >
            <option :value="currentUser.id">Myself ({{ currentUser.firstname || 'You' }})</option>
            <optgroup label="Team members">
              <option v-for="member in (userTeams.flatMap(t => t.members) || [])" :key="member.id" :value="member.id">
                {{ member.name }}
              </option>
            </optgroup>
          </select>
        </div>

        <div class="team-list">
          <div v-if="userTeams.length === 0" class="text-muted small p-3 text-center">
            No teams yet
          </div>

          <div v-for="team in userTeams" :key="team.id" class="team-block">
            <details open>
              <summary>{{ team.name }}</summary>

              <div v-if="team.members.length === 0" class="text-muted small px-3 py-2">
                No members
              </div>

              <div v-for="member in team.members" :key="member.id" class="team-member">
                <div class="avatar-sm">
                  <span class="initials">{{ getInitials(member.name) }}</span>
                </div>
                <span>{{ member.name }}</span>
                <span class="status green"></span>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import teamsService from "../services/teamsService.js";

// --- Date/heure ---
const now = ref(new Date());
let timerId;

// Day of week labels for calendar header
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

onMounted(() => {
  timerId = setInterval(() => {
    now.value = new Date();
  }, 1000);

  // Charger les teams et plannings
  fetchUserTeams();
  fetchPlannings();
});

onUnmounted(() => clearInterval(timerId));

const formattedDate = computed(() =>
  now.value.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
);

const currentTime = computed(() =>
  now.value.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
);

// --- Teams et membres ---
const userTeams = ref([]);

const fetchUserTeams = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.id) {
      const teams = await teamsService.getTeamsByUserId(user.id);
      userTeams.value = teams;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des teams:', error);
  }
};

// --- Planning (from backend) ---
import planningService from "../services/planningService.js";
const events = ref([]);

function getErrorMessage(e) {
  if (!e) return 'Unknown error';
  if (e.response && e.response.data) {
    const data = e.response.data;
    if (data.errors && Array.isArray(data.errors)) {
      return data.errors.map(err => err.message).join(', ');
    }
    if (data.error) return data.error;
  }
  return e.message || String(e);
}

// manager: allow selecting a user to view/edit
const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
const isManager = currentUser?.profile === 'manager';
const selectedUserId = ref(currentUser?.id || null);

// week helpers
const weekStart = ref(new Date()); // will be normalized in fetch
const weekDates = ref([]);

const selectedDate = ref(null); // yyyy-mm-dd
const selectedPlan = ref(null);
const startTimeStr = ref('09:00');
const endTimeStr = ref('17:00');
const selectedDateError = ref('');

const buildWeekDates = () => {
  const nowDate = new Date();
  const dayOfWeek = (d) => ((d.getDay() + 6) % 7); // Monday=0
  const ws = new Date(nowDate);
  const diff = dayOfWeek(nowDate);
  ws.setDate(nowDate.getDate() - diff);
  ws.setHours(0,0,0,0);
  weekStart.value = ws;
  weekDates.value = Array.from({length:7}, (_,i) => new Date(ws.getTime() + i * 24*60*60*1000));
};

const fetchPlannings = async (forUserId = null) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) return;

    const userId = forUserId || selectedUserId.value || user.id;

    const plans = await planningService.getByUserId(userId);

    // Map plannings by dayOfWeek (templates use dayOfWeek, 0=Monday...6=Sunday)
    const plansByDayOfWeek = {};
    plans.forEach(p => {
      if (p.isTemplate && p.dayOfWeek !== null && p.dayOfWeek !== undefined) {
        plansByDayOfWeek[p.dayOfWeek] = p;
      }
    });

    // Build week
    buildWeekDates();

    const evts = [];
    weekDates.value.forEach((d, idx) => {
      const dateStr = d.toISOString().split('T')[0];
      // idx is the day of week (0=Monday, 6=Sunday)
      const p = plansByDayOfWeek[idx];

      if (p) {
        const start = new Date(p.startTime);
        const end = new Date(p.endTime);
        // Use UTC methods to avoid timezone conversion issues
        const startHour = start.getUTCHours() + start.getUTCMinutes()/60;
        const duration = (end - start) / (1000 * 60 * 60);
        evts.push({
          id: p.idPlanning,
          title: 'Day Shift',
          dayIndex: idx,
          startHour,
          durationHours: Math.max(0.25, duration),
          isDefault: false,
          planId: p.idPlanning,
          date: dateStr
        });
        return;
      }

      // ✅ Sonar: avoid "else { if (...) }" -> single condition
      if (idx <= 4) {
        // Default 9-17 Mon-Fri if no template defined
        evts.push({
          id: `default-${dateStr}`,
          title: 'Day Shift',
          dayIndex: idx,
          startHour: 9,
          durationHours: 8,
          isDefault: true,
          date: dateStr
        });
      }
    });

    events.value = evts;
  } catch (error) {
    console.error('Erreur lors de la récupération des plannings:', error);
  }
};

// Select a day to edit/create a planning
function selectDay(dayIdx) {
  const d = weekDates.value[dayIdx];
  if (!d) return;
  const dateStr = d.toISOString().split('T')[0];
  selectedDate.value = dateStr;
  const existing = events.value.find(e => e.date === dateStr && !e.isDefault);
  if (existing) {
    selectedPlan.value = existing;
    // fetch plan details to get start/end full times
    // For simplicity we set the string based on startHour/duration
    const sh = existing.startHour;
    const hours = Math.floor(sh);
    const minutes = Math.round((sh - hours) * 60);
    startTimeStr.value = `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}`;
    const end = hours + existing.durationHours;
    const eh = Math.floor(end);
    const emin = Math.round((end - eh) * 60);
    endTimeStr.value = `${String(eh).padStart(2,'0')}:${String(emin).padStart(2,'0')}`;
  } else {
    selectedPlan.value = null;
    startTimeStr.value = '09:00';
    endTimeStr.value = '17:00';
  }
}

async function savePlan() {
  try {
    selectedDateError.value = '';
    if (!selectedDate.value) return;

    if (!startTimeStr.value || !endTimeStr.value) {
      selectedDateError.value = 'Please provide both start and end times.';
      return;
    }

    const startISO = `${selectedDate.value}T${startTimeStr.value}:00`;
    const endISO = `${selectedDate.value}T${endTimeStr.value}:00`;
    if (new Date(endISO) <= new Date(startISO)) {
      selectedDateError.value = 'End time must be after start time.';
      return;
    }

    const userId = selectedUserId.value || currentUser.id;

    if (selectedPlan.value && selectedPlan.value.planId) {
      // update
      await planningService.updatePlanning(selectedPlan.value.planId, { startTime: startISO, endTime: endISO });
    } else {
      // create
      await planningService.createPlanning({ userId, date: selectedDate.value, startTime: startISO, endTime: endISO });
    }

    // Refresh
    await fetchPlannings(userId);
    // clear selection
    selectedDate.value = null;
    selectedPlan.value = null;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du planning:', error);
    selectedDateError.value = getErrorMessage(error);
  }
}

const hours = Array.from({ length: 12 }, (_, i) => `${8 + i}:00`);

// Helper: return events for a given day index
function eventsForDay(dayIdx) {
  return events.value.filter((e) => e.dayIndex === dayIdx);
}

function eventStyle(event) {
  // 40px par heure, start à 8h
  const top = (event.startHour - 8) * 40;
  const height = event.durationHours * 40;

  return {
    position: "absolute",
    top: `${top}px`,
    height: `${height}px`,
    left: "6px",
    right: "6px",
    borderRadius: "10px",
    background: "#1b93b1",
    color: "white",
    padding: "6px",
    overflow: "hidden",
  };
}

function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(' ').filter(p => p.length > 0);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
</script>

<style scoped>
/* PAGE HEADER STYLES - Consistent across all pages */
.page-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e9ecef;
}

.page-icon {
  width: 32px;
  height: 32px;
  color: #1b93b1;
  flex-shrink: 0;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1b93b1;
  margin: 0;
  letter-spacing: -0.5px;
}

.calendar-container {
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 12px;
}

.calendar-header .day-col-header {
  flex: 1;
  text-align: center;
  font-weight: 600;
}

.calendar-grid {
  display: flex;
  position: relative;
  border-top: 1px solid #eee;
  margin-top: 12px;
  min-height: 480px;
}

.time-col {
  width: 70px;
  border-right: 1px solid #eee;
  padding-right: 8px;
}

.hour-label {
  height: 40px;
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #666;
}

.day-column {
  flex: 1;
  position: relative;
  border-right: 1px solid #f0f0f0;
}

.avatar-sm {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1b93b1 0%, #2ca9bc 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-sm .initials {
  color: white;
  font-weight: 600;
  font-size: 11px;
  user-select: none;
}

.team-label {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 999px;
  background: #f1f1f1;
}

.event-title {
  font-size: 12px;
}
</style>
