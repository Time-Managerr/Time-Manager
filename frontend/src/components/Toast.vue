<template>
  <Transition name="toast">
    <div v-if="visible" class="toast-container" :class="type">
      <div class="toast-content">
        <svg v-if="type === 'success'" class="toast-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <svg v-else-if="type === 'error'" class="toast-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        <svg v-else-if="type === 'warning'" class="toast-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        <svg v-else class="toast-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        <span class="toast-message">{{ message }}</span>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  message: String,
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  duration: {
    type: Number,
    default: 3000
  }
})

const visible = ref(false)
let timeoutId = null

const show = () => {
  visible.value = true
  if (timeoutId) clearTimeout(timeoutId)
  timeoutId = setTimeout(() => {
    visible.value = false
  }, props.duration)
}

const hide = () => {
  visible.value = false
  if (timeoutId) clearTimeout(timeoutId)
}

defineExpose({ show, hide })
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
  min-width: 300px;
  max-width: 450px;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  animation: slideIn 0.3s ease-out;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toast-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.toast-message {
  font-size: 0.95rem;
  font-weight: 500;
  line-height: 1.4;
}

/* Success Toast */
.toast-container.success {
  background: linear-gradient(135deg, #e8f7f0 0%, #d1f0e1 100%);
  border-left: 4px solid #1b93b1;
}

.toast-container.success .toast-icon {
  color: #1b93b1;
}

.toast-container.success .toast-message {
  color: #0f5a73;
}

/* Error Toast */
.toast-container.error {
  background: linear-gradient(135deg, #fee 0%, #fdd 100%);
  border-left: 4px solid #e8847b;
}

.toast-container.error .toast-icon {
  color: #e8847b;
}

.toast-container.error .toast-message {
  color: #c9564a;
}

/* Warning Toast */
.toast-container.warning {
  background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
  border-left: 4px solid #ffa726;
}

.toast-container.warning .toast-icon {
  color: #f57c00;
}

.toast-container.warning .toast-message {
  color: #e65100;
}

/* Info Toast */
.toast-container.info {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-left: 4px solid #1b93b1;
}

.toast-container.info .toast-icon {
  color: #1b93b1;
}

.toast-container.info .toast-message {
  color: #0f5a73;
}

/* Animations */
.toast-enter-active {
  animation: slideIn 0.3s ease-out;
}

.toast-leave-active {
  animation: slideOut 0.3s ease-in;
}

@keyframes slideIn {
  from {
    transform: translateX(120%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
  to {
    transform: translateX(120%) scale(0.9);
    opacity: 0;
  }
}

@media (max-width: 768px) {
  .toast-container {
    top: 16px;
    right: 16px;
    left: 16px;
    min-width: auto;
  }
}
</style>
