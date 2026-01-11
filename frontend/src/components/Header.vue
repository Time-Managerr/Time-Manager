<template>
  <header class="app-header">
    <div class="container d-flex justify-content-between align-items-center">
      <div class="date fst-italic">{{ currentDate }}</div>
      <div class="time">{{ currentTime }}</div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const now = ref(new Date())
let timerId

onMounted(() => {
  timerId = setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  if (timerId) clearInterval(timerId)
})

const currentDate = computed(() => {
  return now.value.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

const currentTime = computed(() => {
  return now.value.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
})
</script>

<style scoped>
.app-header {
  background: #ffffff;
  border-bottom: 1px solid #e9ecef;
  height: 44px;
  display: flex;
  align-items: center;
}
.app-header .container {
  padding: 0 1rem;
  width: 100%;
}
.app-header .date,
.app-header .time {
  font-size: 0.9rem;
  color: #495057;
}
</style>
