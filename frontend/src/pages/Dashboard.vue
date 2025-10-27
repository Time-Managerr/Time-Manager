<template>
  <main class="flex-fill p-4">
    <section class="home w-75 mx-auto">
      <h2 class="fw-bold mb-xl-5 mx-auto">Dashboard</h2>
      <div class="d-flex gap-lg-5 mx-auto">
        <div class="w-33">
          <div class="d-flex flex-column gap-2 align-items-center shadow card p-3">
            <h5>Worked This Week</h5>
            <div class="d-flex justify-content-center gap-3 align-items-center">
              <div class="75">
                <h3 class="fw-bold text-center">37:12:23</h3>
              </div>
              <div class="d-flex justify-content-center bg-primary-subtle rounded-4 p-3">
                <svg style="height: 50px;" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M22.7 11.5L20.7005 13.5L18.7 11.5M20.9451 13C20.9814 12.6717 21 12.338 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C14.8273 21 17.35 19.6963 19 17.6573M12 7V12L15 14" stroke="#1b93b1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
              </div>
            </div>
          </div>
        </div>
        <Chrono :startTime="currentClock?.clockIn"/>
      </div>
      <div class="d-flex gap-lg-5 mx-auto mt-4">
        <div class="w-50 h-auto">
          <div class="d-flex flex-column gap-2 align-items-center shadow card p-3">
            <h5>Clock in</h5>
            <div class="w-50 h-auto">
              <svg viewBox="0 0 1024 1024" class="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000">
                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                <g id="SVGRepo_iconCarrier">
                  <path
                    d="M509.735822 511.988622m-420.534044 0a420.534044 420.534044 0 1 0 841.068089 0 420.534044 420.534044 0 1 0-841.068089 0Z"
                    fill="#49DB95"></path>
                  <path
                    d="M509.735822 511.988622m-330.3424 0a330.3424 330.3424 0 1 0 660.6848 0 330.3424 330.3424 0 1 0-660.6848 0Z"
                    fill="#F2F2F2"></path>
                  <path
                    d="M509.724444 181.646222c-8.817778 0-17.567289 0.352711-26.2144 1.035378C653.710222 196.039111 787.6608 338.375111 787.6608 512S653.7216 827.960889 483.521422 841.3184c8.647111 0.682667 17.396622 1.035378 26.2144 1.035378 182.454044 0 330.365156-147.911111 330.365156-330.365156S692.178489 181.646222 509.724444 181.646222z"
                    fill="#CCCCCC"></path>
                  <path
                    d="M480.3584 483.441778l5.165511-5.165511 110.6944-110.6944a40.96 40.96 0 1 1 57.935645 57.924266L567.671467 512"
                    fill="#47A7DD"></path>
                  <path
                    d="M705.274311 707.549867a40.994133 40.994133 0 0 0 0-57.935645L538.294044 482.633956a40.96 40.96 0 1 0-57.924266 57.924266l166.991644 166.991645a40.925867 40.925867 0 0 0 57.912889 0z"
                    fill="#47A7DD"></path>
                  <path
                    d="M875.838578 273.499022A437.589333 437.589333 0 0 0 692.610844 115.108978a16.372622 16.372622 0 1 0-13.732977 29.752889 404.844089 404.844089 0 0 1 169.506133 146.545777A402.432 402.432 0 0 1 913.863111 512c0 222.845156-181.293511 404.138667-404.138667 404.138667-222.845156 0-404.138667-181.293511-404.138666-404.138667 0-222.833778 181.293511-404.138667 404.138666-404.138667 36.431644 0 72.533333 4.846933 107.303823 14.392889a16.384 16.384 0 1 0 8.692622-31.596089A437.953422 437.953422 0 0 0 509.724444 75.093333C268.811378 75.093333 72.817778 271.086933 72.817778 512s195.9936 436.906667 436.906666 436.906667 436.906667-196.004978 436.906667-436.906667a435.0976 435.0976 0 0 0-70.792533-238.500978z"
                    fill=""></path>
                  <path
                    d="M315.847111 799.516444a344.974222 344.974222 0 0 0 193.877333 59.221334c191.192178 0 346.749156-155.5456 346.749156-346.737778 0-191.192178-155.5456-346.749156-346.749156-346.749156-191.192178 0-346.737778 155.556978-346.737777 346.749156 0 95.266133 37.842489 184.092444 106.575644 250.083556a16.372622 16.372622 0 1 0 22.698667-23.620267c-62.225067-59.778844-96.506311-140.196978-96.506311-226.463289 0-173.124267 140.845511-313.969778 313.969777-313.969778S823.694222 338.875733 823.694222 512 682.848711 825.969778 509.724444 825.969778a312.433778 312.433778 0 0 1-175.536355-53.612089 16.406756 16.406756 0 0 0-22.755556 4.4032 16.406756 16.406756 0 0 0 4.414578 22.755555z"
                    fill=""></path>
                  <path
                    d="M665.747911 355.987911a57.412267 57.412267 0 0 0-81.1008 0l-109.784178 109.784178a57.014044 57.014044 0 0 0-21.276444 32.438044l-177.060978 34.941156a16.384 16.384 0 0 0 6.337422 32.1536l172.600889-34.065067a56.991289 56.991289 0 0 0 13.312 20.912356l74.228622 74.228622a16.384 16.384 0 0 0 23.176534-23.165156l-74.228622-74.228622c-4.642133-4.642133-7.202133-10.808889-7.202134-17.373866s2.56-12.743111 7.202134-17.385245a24.416711 24.416711 0 0 1 17.373866-7.190755c6.564978 0 12.731733 2.56 17.373867 7.190755L693.703111 661.219556a24.610133 24.610133 0 0 1 0 34.759111 24.610133 24.610133 0 0 1-34.759111 0l-56.706844-56.706845a16.384 16.384 0 1 0-23.165156 23.165156l56.706844 56.706844a57.173333 57.173333 0 0 0 40.539023 16.770845 57.070933 57.070933 0 0 0 40.539022-16.782223 57.400889 57.400889 0 0 0 0-81.089422L590.848 512l74.911289-74.911289a57.423644 57.423644 0 0 0-0.011378-81.1008z m-23.165155 57.935645l-74.911289 74.911288-17.772089-17.772088a57.321244 57.321244 0 0 0-20.696178-13.266489l78.620444-78.620445a24.621511 24.621511 0 0 1 34.770489 0c9.557333 9.568711 9.557333 25.167644-0.011377 34.747734z"
                    fill=""></path>
                </g>
              </svg>
            </div>
            <p class="my-3 text-center fst-italic">Clock in before starting your work.</p>
            <button class="btn btn-success" @click="clockIn">Start</button>
          </div>
        </div>
        <div class="w-50 h-auto">
          <div class="d-flex flex-column gap-2 align-items-center shadow card p-3">
            <h5>Clock out</h5>
            <div class="w-50 h-auto">
              <svg viewBox="0 0 1024 1024" class="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M313.5 906.3c-16 0-35.7-11.4-43.7-25.2L71.4 537.4c-8-13.9-8-36.6 0-50.5l198.4-343.6c8-13.9 27.7-25.2 43.7-25.2h396.8c16 0 35.7 11.4 43.7 25.2l198.4 343.6c8 13.9 8 36.6 0 50.5L754 881c-8 13.9-27.7 25.2-43.7 25.2H313.5z" fill="#FF5959"></path><path d="M329.1 828.7h365.5l182.8-316.6-182.8-316.5H329.1L146.4 512.2l182.7 316.5z m374 29.2H320.7c-5.2 0-10-2.8-12.6-7.3L116.9 519.5c-2.6-4.5-2.6-10.1 0-14.6l191.2-331.1c2.6-4.5 7.4-7.3 12.6-7.3h382.4c5.2 0 10 2.8 12.6 7.3l191.2 331.1c2.6 4.5 2.6 10.1 0 14.6L715.7 850.6c-2.6 4.5-7.4 7.3-12.6 7.3z" fill="#FFFFFF"></path><path d="M264.8 558.4c-2.7-1.9-4.5-5.1-4.5-8.9 0-6.1 4.9-10.8 11-10.8 3.2 0 5.3 0.9 6.8 2.1 11 8.7 22.7 13.6 37.1 13.6s23.5-6.8 23.5-16.7v-0.4c0-9.5-5.3-14.6-29.9-20.3-28.2-6.8-44.1-15.2-44.1-39.6v-0.4c0-22.7 18.9-38.5 45.3-38.5 16.7 0 30.1 4.4 42.1 12.3 2.7 1.5 5.1 4.7 5.1 9.3 0 6.1-4.9 10.8-11 10.8-2.3 0-4.2-0.6-6.1-1.7-10.2-6.6-20.1-10-30.5-10-13.6 0-21.6 7-21.6 15.7v0.4c0 10.2 6.1 14.8 31.6 20.8 28 6.8 42.4 16.9 42.4 38.8v0.4c0 24.8-19.5 39.6-47.4 39.6-18 0.2-35.1-5.5-49.8-16.5zM419.2 462.2H387c-6.1 0-10.8-4.9-10.8-10.8s4.7-10.8 10.8-10.8h88c5.9 0 10.6 4.9 10.6 10.8s-4.7 10.8-10.6 10.8h-32.4v100.4c0 6.4-5.3 11.6-11.7 11.6-6.4 0-11.7-5.1-11.7-11.6V462.2zM610.5 507.3v-0.4c0-25.8-18.8-47.2-45.1-47.2s-44.7 21-44.7 46.8v0.4c0 25.8 18.8 47 45.1 47s44.7-20.8 44.7-46.6z m-114.2 0v-0.4c0-37.3 28.8-68.6 69.5-68.6s69.1 30.9 69.1 68.2v0.4c0 37.3-28.8 68.6-69.5 68.6s-69.1-30.9-69.1-68.2zM713.5 509.6c17.6 0 28.6-9.9 28.6-23.7v-0.4c0-15.5-11.2-23.7-28.6-23.7h-27.1v47.7l27.1 0.1z m-50.4-57.2c0-6.6 5.1-11.7 11.7-11.7h40.5c31.1 0 50.4 17.6 50.4 44.3v0.4c0 29.7-23.9 45.3-53 45.3h-26.3v32c0 6.4-5.1 11.6-11.6 11.6-6.6 0-11.7-5.1-11.7-11.6V452.4z" fill="#FFFFFF"></path></g></svg>
            </div>
            <p class="my-3 text-center fst-italic">Recent activities or tasks.</p>
            <button class="btn btn-danger" @click="clockOut">Clock out</button>
          </div>
        </div>
      </div>
      <ClocksTable />
    </section>
  </main>
</template>

<script setup>
import ClocksTable from '../components/ClocksTable.vue';
import Chrono from '../components/Chrono.vue';
import confetti from 'canvas-confetti';
import { ref, onMounted } from 'vue';
import clockInstance from '../services/clockService.js';

const user = ref(null);
const avatar = ref(null);
const currentClock = ref(null);
let success = ref(null);

const fetchCurrentClock = async () => {
  if (!clock.value.userId) return;
  const clocks = await clockInstance.getByUserId(clock.value.userId);
  currentClock.value = clocks.find(c => !c.clockOut) || null;
};

let clock = ref({
  userId: "", // ID de l'utilisateur
  clockIn: "",
  clockOut: "",
});

onMounted(() => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  if (storedUser) {
    user.value = storedUser;
    clock.value.userId = storedUser.id || storedUser.userId;
    if (storedUser.avatar) avatar.value = storedUser.avatar;
    fetchCurrentClock(); // récupère le dernier pointage actif
  }
});

async function clockIn() {
  console.clear();
  success.value = null;

  try {
    if (!clock.value.userId) throw new Error("ID utilisateur manquant !");
    const now = new Date().toISOString();
    clock.value.clockIn = now;

    const data = await clockInstance.clockIn(clock.value.userId, clock.value.clockIn);
    currentClock.value = data; // ← nouveau pointage actif

    success.value = "Vous avez pointé !";
    showConfetti();
    console.log("Pointage créé :", data);
  } catch (error) {
    console.error("Erreur lors du pointage :", error);
    success.value = "Erreur lors du pointage.";
  }
}


async function clockOut() {
  console.clear();
  success.value = null;

  try {
    if (!currentClock.value) throw new Error("Aucun pointage actif !");
    const now = new Date().toISOString();
    clock.value.clockOut = now;

    const data = await clockInstance.clockOut(currentClock.value.idClock, clock.value.clockOut);
    currentClock.value = null; // plus de chrono actif

    success.value = "Vous avez terminé votre pointage !";
    showConfetti();
    console.log("Pointage mis à jour :", data);
  } catch (error) {
    console.error("Erreur lors du clock-out :", error);
    success.value = "Erreur lors du pointage de sortie.";
  }
}


function showConfetti() {
  confetti({
    particleCount: 150,
    spread: 180,
    origin: { y: 0.6 },
  });
}
</script>


<style scoped>
.home {
  text-align: left;
}

h1 {
  color: #42b883;
}

main {
  min-height: 100vh;
}
</style>
