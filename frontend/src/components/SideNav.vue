<template>
  <aside class="sidenav bg-subtle border-end p-3 d-none d-md-block">
    <!-- PROFILE -->
    <div v-if="user" class="profile d-flex align-items-center mb-3">
      <img :src="avatar" alt="avatar" class="avatar me-2" />
      <div>
        <div class="fw-bold">{{ user.firstname }} {{ user.lastname }}</div>
        <small class="text-muted">Dashboard</small>
      </div>
    </div>

    <!-- NAVIGATION -->
    <nav>
      <ul class="nav text-black fw-semibold flex-column">

        <!-- DASHBOARD -->
        <li class="mb-2">
          <router-link to="/" class="nav-link" :class="{ active: isActive('/') }">
            <div class="d-flex align-items-center gap-3">
              <svg class="w-10" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M22 4v3a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2Z"
                  fill="#2ca9bc"
                />
                <path
                  d="M11 4v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2Z"
                  fill="#000"
                />
                <path
                  d="M20 11h-5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2Z"
                  fill="#000"
                />
                <path
                  d="M9 15H4a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2Z"
                  fill="#2ca9bc"
                />
              </svg>
              <span>Dashboard</span>
            </div>
          </router-link>
        </li>

        <!-- PROFILE -->
        <li class="mb-2">
          <router-link to="/Profile" class="nav-link" :class="{ active: isActive('/Profile') }">
            <div class="d-flex align-items-center gap-3">
              <svg class="w-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 12.8c-1.8 0-3.3-1.5-3.3-3.3S10.2 6.2 12 6.2s3.3 1.5 3.3 3.3-1.5 3.3-3.3 3.3Z"
                  stroke="#000"
                  stroke-width="1.5"
                />
                <path
                  d="M5.3 19.4C7 21 9.4 22 12 22s5-1 6.7-2.6c-.1-.9-.7-1.9-1.8-2.6-2.7-1.8-7.2-1.8-9.9 0-1.1.7-1.7 1.7-1.7 2.6Z"
                  stroke="#000"
                  stroke-width="1.5"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#1b93b1"
                  stroke-width="1.5"
                />
              </svg>
              <span>Profile</span>
            </div>
          </router-link>

        <li class="nav-item mb-2">
          <router-link
            to="/planning"
            class="nav-link"
            :class="{ active: isActive('/planning') }"
          >
            <div class="d-flex align-items-center gap-3">
              <!-- Icône calendrier simple (tu peux remplacer) -->
              <svg class="w-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 3V5" stroke="#1b93b1" stroke-width="2" stroke-linecap="round"/>
                <path d="M17 3V5" stroke="#1b93b1" stroke-width="2" stroke-linecap="round"/>
                <path d="M4 9H20" stroke="#000000" stroke-width="2" stroke-linecap="round"/>
                <path d="M6 7H18C19.1046 7 20 7.89543 20 9V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V9C4 7.89543 4.89543 7 6 7Z" stroke="#000000" stroke-width="2"/>
              </svg>

              <span>Planning</span>
            </div>
          </router-link>
        </li>

        </li>

        <!-- TEAMS -->
        <li class="mb-2">
          <router-link to="/Teams" class="nav-link" :class="{ active: isActive('/Teams') }">
            <div class="d-flex align-items-center gap-3">
              <svg class="w-10" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="#1b93b1">
                <path
                  d="M612 612c-34 0-66-13-90-37s-37-57-37-92c0-33 13-65 36-88 24-25 56-38 90-39 34 0 67 13 91 37s38 57 38 91-13 66-38 91-57 37-90 37Z"
                />
                <path
                  d="M824 700c-22-22-48-40-78-53 45-37 74-93 74-156 0-111-92-202-203-200-109 2-197 91-197 200 0 63 29 119 74 156-30 13-56 31-78 53-55 55-86 127-88 204h64c2-58 25-112 67-154 43-43 100-66 161-66s118 23 161 66c42 42 65 96 67 154h64c-2-77-33-149-88-204Z"
                />
              </svg>
              <span>Teams</span>
            </div>
          </router-link>
        </li>

        <!-- LOGOUT -->
        <li class="mb-2">
          <div class="nav-link" @click="logout" style="cursor: pointer;">
            <div class="d-flex align-items-center gap-3">
              <svg class="w-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12h-8" stroke="#1b93b1" stroke-width="2" />
                <path d="M18 15l3-3-3-3" stroke="#1b93b1" stroke-width="2" />
                <path
                  d="M16 5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h9c1.1 0 2-.9 2-2"
                  stroke="#1b93b1"
                  stroke-width="2"
                />
              </svg>
              <span>Logout</span>
            </div>
          </div>
        </li>

      </ul>
    </nav>
  </aside>

  <!-- MOBILE NAV -->
  <div class="d-md-none mobile-sidenav p-2 bg-light border-bottom">
    <div class="d-flex justify-content-between align-items-center">
      <strong>Menu</strong>
      <button class="btn btn-sm btn-outline-secondary" @click="open = !open">☰</button>
    </div>
    <ul v-if="open" class="nav flex-column mt-2">
      <li class="nav-item"><router-link to="/" class="nav-link">Dashboard</router-link></li>
      <li class="nav-item"><router-link to="/Profile" class="nav-link">Profile</router-link></li>
      <li class="nav-item"><router-link to="/Teams" class="nav-link">Teams</router-link></li>
      <li class="nav-item"><router-link to="/Login" class="nav-link">Logout</router-link></li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const open = ref(false)
const route = useRoute()
const router = useRouter()
const user = ref(null)
const avatar = ref('/vite.svg')

onMounted(() => {
  const storedUser = JSON.parse(localStorage.getItem('user'))
  if (storedUser) {
    user.value = storedUser
    if (storedUser.avatar) avatar.value = storedUser.avatar
  }
})

function isActive(path) {
  return route.path === path
}

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<style scoped>
.sidenav {
  width: clamp(200px, 18vw, 320px);
  min-height: 100vh;
}

.avatar {
  width: clamp(40px, 5.5vw, 72px);
  height: clamp(40px, 5.5vw, 72px);
  border-radius: 50%;
  object-fit: cover;
}

.nav-link {
  color: black;
  padding-bottom: 0.35rem;
  border-bottom: 3px solid transparent;
}

.nav-link.active {
  font-weight: 700;
  color: #1b93b1;
  border-bottom-color: #1b93b1;
}
</style>
