<template>
  <div class="toast-wrapper">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast-container"
        :class="toast.type"
      >
        <div class="toast-content">
          <svg v-if="toast.type === 'success'" class="toast-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <svg v-else-if="toast.type === 'error'" class="toast-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          <svg v-else-if="toast.type === 'warning'" class="toast-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <svg v-else class="toast-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span class="toast-message">{{ toast.message }}</span>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useToast } from '../composables/useToast'

const { toasts } = useToast()
</script>

<style scoped>
.toast-wrapper {
  position: fixed;
  top: 20px;
  right: 20px;
  left: auto;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
  width: 380px;
}

.toast-container {
  width: 100%;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  pointer-events: auto;
  box-sizing: border-box;
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
  flex: 1;
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
  animation: fadeIn 0.3s ease-out;
}

.toast-leave-active {
  animation: fadeOut 0.3s ease-in forwards;
}

.toast-move {
  transition: all 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.9);
  }
}

@media (max-width: 768px) {
  .toast-wrapper {
    top: 16px;
    right: 16px;
    left: 16px;
  }
  
  .toast-container {
    min-width: auto;
  }
}
</style>
