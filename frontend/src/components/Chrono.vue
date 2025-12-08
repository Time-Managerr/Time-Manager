<template>
            <div class="w-66">
          <div class="d-flex flex-column gap-2 align-items-center shadow card p-3">
            <h5>Today's Work Time</h5>
            <div class="d-flex flex-row-reverse justify-content-evenly w-100 gap-3 align-items-center">
              <div class="">
                <h2 id="chrono" class="display-5 fw-bold text-center">{{ chrono || "00:00:00" }}</h2>
              </div>
              <div class="d-flex justify-content-between bg-primary-subtle rounded-4 p-3">
                <svg style="height: 50px;" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M20 10V7C20 5.89543 19.1046 5 18 5H6C4.89543 5 4 5.89543 4 7V10M20 10V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V10M20 10H4M8 3V7M16 3C16 3 16 5.4379 16 7" stroke="#1b93b1" stroke-width="2" stroke-linecap="round"></path> <rect x="6" y="12" width="5" height="5" rx="1" fill="#1b93b1"></rect> </g></svg>
              </div>
            </div>
          </div>
        </div>
</template>
<script setup>
import { ref, watch, onBeforeUnmount } from "vue";

// Props pour passer la date de début du chrono (ISO string)
const props = defineProps({
  startTime: { type: String, default: null }
});

const chrono = ref("00:00:00");
let intervalId = null;

// Fonction pour démarrer le chrono
const startChrono = (startTime) => {
  if (!startTime) return;

  const start = new Date(startTime).getTime();

  // Nettoyer un intervalle existant
  if (intervalId) clearInterval(intervalId);

  intervalId = setInterval(() => {
    const diff = Date.now() - start;

    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    chrono.value =
      String(hours).padStart(2, "0") + ":" +
      String(minutes).padStart(2, "0") + ":" +
      String(seconds).padStart(2, "0");
  }, 1000);
};

// Arrêter le chrono
const stopChrono = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

// Watch sur la prop startTime pour démarrer/repartir le chrono
watch(() => props.startTime, (newVal) => {
  stopChrono();
  startChrono(newVal);
});

// Nettoyage à la destruction du composant
onBeforeUnmount(() => stopChrono());
</script>