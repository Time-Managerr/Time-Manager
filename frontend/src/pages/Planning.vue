<template>
  <main class="flex-fill p-4 planning-page">

    <!-- HEADER -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4 class="fw-bold">{{ formattedDate }}</h4>
      <div class="time">{{ currentTime }}</div>
    </div>

    <div class="row">
      <!-- ================= CALENDRIER ================= -->
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
              <div 
                v-for="hour in hours" 
                :key="hour"
                class="hour-label"
              >
                {{ hour }}
              </div>
            </div>

            <!-- LES 7 JOURS -->
            <div 
              v-for="(day, index) in 7" 
              :key="index"
              class="day-column"
            >
              <!-- LES ÉVÉNEMENTS POUR CE JOUR -->
              <div 
                v-for="event in eventsForDay(index)" 
                :key="event.id"
                class="calendar-event"
                :style="eventStyle(event)"
              ></div>
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
                <img src="/vite.svg" class="avatar-sm"/>
                <span>{{ item.name }}</span>
              </div>

              <div class="col-2">
                <span class="team-label">TEAM {{ item.team }}</span>
              </div>

              <div class="col-3">
                From {{ item.start }} To {{ item.end }}
              </div>

              <div class="col-2 d-flex gap-2 justify-content-end">
                <button class="btn btn-sm btn-success"></button>
                <button class="btn btn-sm btn-danger"></button>
              </div>
            </div>
          </div>

        </div>

      </div>

      <!-- ================= SIDEBAR TEAMS ================= -->
      <div class="col-3">
        <h5 class="fw-bold">Teams</h5>

        <div class="team-list">
          <div class="team-block">
            <details open>
              <summary>Teams 1</summary>

              <div class="team-member">
                <img src="/vite.svg" class="avatar-sm"/>
                <span>John Doe</span>
                <span class="status red"></span>
              </div>

              <div class="team-member">
                <img src="/vite.svg" class="avatar-sm"/>
                <span>John Doe</span>
                <span class="status green"></span>
              </div>

            </details>
          </div>

          <div class="team-block">
            <details><summary>Teams 2</summary></details>
          </div>

          <div class="team-block">
            <details><summary>Teams 3</summary></details>
          </div>
        </div>

      </div>

    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"

/* ------------ DATE & TIME ------------- */
const currentTime = ref("")
const formattedDate = computed(() => new Date().toDateString())

setInterval(() => {
  currentTime.value = new Date().toLocaleTimeString()
}, 1000)

/* ------------ CALENDRIER ------------- */
const days = ["Monday", "Tue", "Wed", "Thursday", "Friday", "Saturday", "Sunday"]
const hours = ["6 am", "7 am", "8 am", "9 am","10 am","11 am","12 pm","1 pm","2 pm","3 pm","4 pm","5 pm","6 pm","7 pm"]

// Exemple d’événements (à terme → venir de ton backend)
const events = ref([
  { id: 1, day: 0, start: 7, end: 11 },  // lundi 7h-11h
  { id: 2, day: 1, start: 14, end: 18 }, // mardi 14h-18h
  { id: 3, day: 2, start: 9, end: 17 },  // mercredi
  { id: 4, day: 4, start: 8, end: 12 },  // vendredi
])

const eventsForDay = (dayIndex) => events.value.filter(e => e.day === dayIndex)

const eventStyle = (event) => {
  const hourHeight = 80  // px par case
  return {
    top: event.start * hourHeight + "px",
    height: (event.end - event.start) * hourHeight + "px"
  }
}

/* ------------ VACATION REQUESTS ------------- */
const vacationRequests = ref([
  { id: 1, name: "Sarah Eastern", date: "2023/09/17", team: 1, start: "2023/09/17", end: "2023/09/30" },
  { id: 2, name: "Sarah Eastern", date: "2023/09/17", team: 2, start: "2023/09/10", end: "2023/09/15" },
  { id: 3, name: "Sarah Eastern", date: "2023/09/17", team: 3, start: "2023/09/10", end: "2023/09/15" },
])
</script>

<style scoped>
.planning-page { max-width: 1500px; margin: auto; }

.calendar-container {
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
}

/* Header jours */
.calendar-header {
  background: #fff;
  border-bottom: 1px solid #ddd;
}
.day-col-header {
  flex: 1;
  text-align: center;
  padding: 10px 0;
  font-weight: 600;
}

/* Grid */
.calendar-grid {
  display: grid;
  grid-template-columns: 100px repeat(7, 1fr);
  position: relative;
}

/* Heures */
.hour-label {
  height: 80px;
  padding-top: 10px;
  font-size: 0.8rem;
  color: #666;
}

/* Colonne par jour */
.day-column {
  border-left: 1px solid #eee;
  position: relative;
}

/* Événements */
.calendar-event {
  position: absolute;
  left: 10%;
  width: 80%;
  background: #d3d3d3;
  border-radius: 8px;
}

/* Vacation list */
.vacation-box {
  border: 1px solid #ccc;
  padding: 20px;
  border-radius: 8px;
}
.vacation-item {
  background: #eee;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 10px;
}

.avatar-sm {
  width: 30px;
  height: 30px;
  border-radius: 50%;
}

.status {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.status.red { background: red; }
.status.green { background: green; }

.team-label {
  background: #c8f7cc;
  color: #2e7d32;
  padding: 2px 8px;
  border-radius: 6px;
}
</style>
