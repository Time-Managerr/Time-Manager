<template>
  <main class="flex-fill p-4 planning-page">
    <!-- HEADER -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4 class="fw-bold">{{ formattedDate }}</h4>
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
        <div class="mt-4">
          <button class="btn btn-outline-dark">➕ Add event on calendar</button>
        </div>

        <!-- ================= DEMANDES DE CONGÉS ================= -->
        <div class="mt-4 vacation-box">
          <h5 class="fw-semibold mb-3">Vacation Requests :</h5>

          <div v-for="item in vacationRequests" :key="item.id" class="vacation-item">
            <div class="row align-items-center">
              <div class="col-2">{{ item.date }}</div>

              <div class="col-3 d-flex align-items-center gap-2">
                <img src="/vite.svg" class="avatar-sm" />
                <span>{{ item.name }}</span>
              </div>

              <div class="col-2">
                <span class="team-label">TEAM {{ item.team }}</span>
              </div>

              <div class="col-3">From {{ item.start }} To {{ item.end }}</div>

              <div class="col-2 d-flex gap-2 justify-content-end">
                <button class="btn btn-sm btn-success">✔</button>
                <button class="btn btn-sm btn-danger">✖</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ================= SIDEBAR TEAMS ================= -->
      <div class="col-3">
        <h5 class="fw-bold">Teams</h5>

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
                <img :src="member.avatar" class="avatar-sm" />
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

onMounted(() => {
  timerId = setInterval(() => {
    now.value = new Date();
  }, 1000);
  
  // Charger les teams
  fetchUserTeams();
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

// --- Jours/heures ---
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hours = Array.from({ length: 12 }, (_, i) => `${8 + i}:00`);

// --- Events (mock) ---
const events = ref([
  { id: 1, title: "Meeting", dayIndex: 0, startHour: 9, durationHours: 2 },
  { id: 2, title: "Code review", dayIndex: 2, startHour: 13, durationHours: 1 },
]);

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

// --- Vacations (mock) ---
const vacationRequests = ref([
  { id: 1, date: "2026-01-06", name: "Jane Doe", team: 1, start: "2026-01-10", end: "2026-01-12" },
  { id: 2, date: "2026-01-05", name: "John Doe", team: 2, start: "2026-01-20", end: "2026-01-25" },
]);
</script>

<style scoped>
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

.vacation-box {
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 12px;
}

.avatar-sm {
  width: 26px;
  height: 26px;
  border-radius: 50%;
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
