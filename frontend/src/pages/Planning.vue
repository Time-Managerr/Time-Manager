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
              v-for="dayIndex in 7"
              :key="dayIndex"
              class="day-column"
            >
              <div
                v-for="event in eventsForDay(dayIndex - 1)"
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

          <div
            v-for="item in vacationRequests"
            :key="item.id"
            class="vacation-item"
          >
            <div class="row align-items-center">
              <div class="col-2">{{ item.date }}</div>

              <div class="col-3 d-flex align-items-center gap-2">
                <img src="/vite.svg" class="avatar-sm" />
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
                <img src="/vite.svg" class="avatar-sm" />
                <span>John Doe</span>
                <span class="status red"></span>
              </div>

              <div class="team-member">
                <img src="/vite.svg" class="avatar-sm" />
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
