import { ref } from 'vue'

const toasts = ref([])
let toastId = 0

export function useToast() {
  const show = (message, type = 'info', duration = 3000) => {
    const id = toastId++
    const toast = { id, message, type, duration, visible: true }
    toasts.value.push(toast)

    setTimeout(() => {
      const index = toasts.value.findIndex(t => t.id === id)
      if (index !== -1) {
        toasts.value[index].visible = false
        setTimeout(() => {
          toasts.value.splice(index, 1)
        }, 300)
      }
    }, duration)
  }

  const success = (message, duration) => show(message, 'success', duration)
  const error = (message, duration) => show(message, 'error', duration)
  const warning = (message, duration) => show(message, 'warning', duration)
  const info = (message, duration) => show(message, 'info', duration)

  return {
    toasts,
    show,
    success,
    error,
    warning,
    info
  }
}
