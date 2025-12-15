<template>
  <main class="flex-fill p-4">
    <section class="dashboard">
      <h2 class="fw-bold mb-4">Dashboard</h2>

      <!-- TOP STATS -->
      <div class="d-flex gap-lg-5 mb-4">
        <WorkedWeek />
        <Chrono :startTime="currentClock?.clockIn" />
      </div>

      <!-- CLOCK IN / OUT -->
      <div class="d-flex gap-lg-5">
        <!-- CLOCK IN -->
        <div class="w-50">
          <div class="card shadow-sm p-4 text-center h-100">
            <h5 class="fw-semibold mb-3">Clock in</h5>

            <!-- ICON -->
            <div class="mb-3">
              <svg viewBox="0 0 1024 1024" class="clock-icon">
                <path
                  d="M509.735822 511.988622m-420.534044 0a420.534044 420.534044 0 1 0 841.068089 0a420.534044 420.534044 0 1 0-841.068089 0Z"
                  fill="#49DB95"
                />
                <path
                  d="M509.735822 511.988622m-330.3424 0a330.3424 330.3424 0 1 0 660.6848 0a330.3424 330.3424 0 1 0-660.6848 0Z"
                  fill="#F2F2F2"
                />
                <path
                  d="M480.3584 483.441778l115.86-115.86a40.96 40.96 0 1 1 57.93 57.92L567.67 512"
                  fill="#47A7DD"
                />
                <path
                  d="M705.27 707.55a40.99 40.99 0 0 0 0-57.94L538.29 482.63a40.96 40.96 0 1 0-57.92 57.92l166.99 166.99a40.93 40.93 0 0 0 57.91 0z"
                  fill="#47A7DD"
                />
              </svg>
            </div>

            <p class="fst-italic text-muted mb-3">
              Clock in before starting your work.
            </p>

            <!-- SLIDER -->
            <div class="slider-container" :class="{ disabled: isClockInDisabled }">
              <div class="slider-track">
                <div
                  class="slider-handle"
                  :style="{ left: sliderInX + 'px' }"
                  @mousedown="startDrag('in', $event)"
                >
                  ▶
                </div>
                <span class="slider-text">Slide to Clock In</span>
              </div>
            </div>
          </div>
        </div>

        <!-- CLOCK OUT -->
        <div class="w-50">
          <div class="card shadow-sm p-4 text-center h-100">
            <h5 class="fw-semibold mb-3">Clock out</h5>

            <!-- ICON -->
            <div class="mb-3">
              <svg viewBox="0 0 1024 1024" class="clock-icon">
                <path
                  d="M512 96C282.8 96 96 282.8 96 512s186.8 416 416 416 416-186.8 416-416S741.2 96 512 96Z"
                  fill="#FF5959"
                />
                <path
                  d="M512 192C335.6 192 192 335.6 192 512s143.6 320 320 320 320-143.6 320-320S688.4 192 512 192Z"
                  fill="#F2F2F2"
                />
                <rect
                  x="392"
                  y="392"
                  width="240"
                  height="240"
                  rx="28"
                  fill="#FF5959"
                />
              </svg>
            </div>

            <p class="fst-italic text-muted mb-3">
              Recent activities or tasks.
            </p>

            <!-- SLIDER -->
            <div class="slider-container" :class="{ disabled: isClockOutDisabled }">
              <div class="slider-track">
                <div
                  class="slider-handle handle-out"
                  :style="{ left: sliderOutX + 'px' }"
                  @mousedown="startDrag('out', $event)"
                >
                  ■
                </div>
                <span class="slider-text">Slide to Clock Out</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ClocksTable class="mt-5" />
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import confetti from 'canvas-confetti'

import WorkedWeek from '../components/WorkedWeek.vue'
import Chrono from '../components/Chrono.vue'
import ClocksTable from '../components/ClocksTable.vue'
import clockInstance from '../services/clockService.js'

/* ===================== STATE ===================== */
const router = useRouter()
const currentClock = ref(null)

const clock = ref({
  userId: '',
  clockIn: '',
  clockOut: ''
})

const sliderInX = ref(0)
const sliderOutX = ref(0)

let dragging = null
let startX = 0
let maxX = 0

/* ===================== COMPUTED ===================== */
const isClockInDisabled = computed(() => currentClock.value !== null)
const isClockOutDisabled = computed(() => currentClock.value === null)

/* ===================== LIFECYCLE ===================== */
onMounted(async () => {
  const user = JSON.parse(localStorage.getItem('user'))
  if (!user) return

  clock.value.userId = user.id || user.userId
  const clocks = await clockInstance.getByUserId(clock.value.userId)
  currentClock.value = clocks.find(c => !c.clockOut) || null

  setTimeout(() => {
    const track = document.querySelector('.slider-track')
    if (track) maxX = track.offsetWidth - 55
  }, 200)
})

/* ===================== SLIDER LOGIC ===================== */
function startDrag(type, event) {
  if ((type === 'in' && isClockInDisabled.value) || (type === 'out' && isClockOutDisabled.value)) return

  dragging = type
  startX = event.clientX - (type === 'in' ? sliderInX.value : sliderOutX.value)

  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', endDrag)
}

function onDrag(event) {
  if (!dragging) return

  const value = Math.max(0, Math.min(maxX, event.clientX - startX))
  dragging === 'in' ? (sliderInX.value = value) : (sliderOutX.value = value)
}

async function endDrag() {
  if (!dragging) return

  const value = dragging === 'in' ? sliderInX.value : sliderOutX.value
  if (value > maxX - 10) dragging === 'in' ? await clockIn() : await clockOut()

  sliderInX.value = 0
  sliderOutX.value = 0
  dragging = null

  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', endDrag)
}

/* ===================== ACTIONS ===================== */
async function clockIn() {
  const now = new Date().toISOString()
  currentClock.value = await clockInstance.clockIn(clock.value.userId, now)
  confetti({ particleCount: 150, spread: 180 })
  setTimeout(() => router.go(0), 600)
}

async function clockOut() {
  const now = new Date().toISOString()
  await clockInstance.clockOut(currentClock.value.idClock, now)
  currentClock.value = null
  confetti({ particleCount: 150, spread: 180 })
  setTimeout(() => router.go(0), 600)
}
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.clock-icon {
  width: 160px;
  height: 160px;
}

.slider-container {
  width: 100%;
  user-select: none;
}

.slider-container.disabled {
  opacity: 0.4;
  pointer-events: none;
}

.slider-track {
  height: 55px;
  background: #e7f2ff;
  border-radius: 30px;
  position: relative;
  display: flex;
  align-items: center;
}

.slider-handle {
  width: 55px;
  height: 55px;
  background: #34a853;
  border-radius: 50%;
  position: absolute;
  color: #fff;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
}

.handle-out {
  background: #d9534f;
}

.slider-text {
  margin-left: 80px;
  font-weight: 600;
  color: #2d7cea;
}
</style>
