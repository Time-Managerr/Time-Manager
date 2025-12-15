<template>
  <aside class="sidenav bg-subtle border-end p-3 d-none d-md-block">
    <div v-if="user" class="profile d-flex align-items-center mb-3">
      <img :src="avatar" alt="avatar" class="avatar me-2" />
      <div>
        <div class="fw-bold">{{ user.firstname }} {{ user.lastname }}</div>
        <small class="text-muted">Dashboard</small>
      </div>
    </div>

    <nav>
      <ul class="nav text-black fw-semibold flex-column">
        <li class="mb-2">
          <router-link to="/" class="nav-link" :class="{ active: isActive('/') }">
            <div class="d-flex align-items-center gap-3">
              <svg class="w-10 icon flat-color" fill="#000000" viewBox="0 0 24 24" id="dashboard" data-name="Flat Color"
                xmlns="http://www.w3.org/2000/svg">
                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                <g id="SVGRepo_iconCarrier">
                  <path id="secondary"
                    d="M22,4V7a2,2,0,0,1-2,2H15a2,2,0,0,1-2-2V4a2,2,0,0,1,2-2h5A2,2,0,0,1,22,4ZM9,15H4a2,2,0,0,0-2,2v3a2,2,0,0,0,2,2H9a2,2,0,0,0,2-2V17A2,2,0,0,0,9,15Z"
                    style="fill: #2ca9bc;"></path>
                  <path id="primary"
                    d="M11,4v7a2,2,0,0,1-2,2H4a2,2,0,0,1-2-2V4A2,2,0,0,1,4,2H9A2,2,0,0,1,11,4Zm9,7H15a2,2,0,0,0-2,2v7a2,2,0,0,0,2,2h5a2,2,0,0,0,2-2V13A2,2,0,0,0,20,11Z"
                    style="fill: #000000;"></path>
                </g>
              </svg>
              <span>Dashboard</span>
            </div>
          </router-link>
        </li>
        <li class="mb-2">
          <router-link to="/Profile" class="nav-link" :class="{ active: isActive('/Profile') }">
            <div class="d-flex align-items-center gap-3">
              <svg class="w-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                <g id="SVGRepo_iconCarrier">
                  <path
                    d="M12.1207 12.78C12.0507 12.77 11.9607 12.77 11.8807 12.78C10.1207 12.72 8.7207 11.28 8.7207 9.50998C8.7207 7.69998 10.1807 6.22998 12.0007 6.22998C13.8107 6.22998 15.2807 7.69998 15.2807 9.50998C15.2707 11.28 13.8807 12.72 12.1207 12.78Z"
                    stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                  <path
                    d="M18.7398 19.3801C16.9598 21.0101 14.5998 22.0001 11.9998 22.0001C9.39977 22.0001 7.03977 21.0101 5.25977 19.3801C5.35977 18.4401 5.95977 17.5201 7.02977 16.8001C9.76977 14.9801 14.2498 14.9801 16.9698 16.8001C18.0398 17.5201 18.6398 18.4401 18.7398 19.3801Z"
                    stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                  <path
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                    stroke="#1b93b1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                </g>
              </svg>
              <span>Profile</span>
            </div>
          </router-link>
        </li>
        <li class="nav-item mb-2">
          <router-link to="/Teams" class="nav-link" :class="{ active: isActive('/Teams') }">
            <div class="d-flex align-items-center gap-3">
              <svg class="icon w-10" fill="#1b93b1" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                <g id="SVGRepo_iconCarrier">
                  <path
                    d="M824.2 699.9a301.55 301.55 0 0 0-86.4-60.4C783.1 602.8 812 546.8 812 484c0-110.8-92.4-201.7-203.2-200-109.1 1.7-197 90.6-197 200 0 62.8 29 118.8 74.2 155.5a300.95 300.95 0 0 0-86.4 60.4C345 754.6 314 826.8 312 903.8a8 8 0 0 0 8 8.2h56c4.3 0 7.9-3.4 8-7.7 1.9-58 25.4-112.3 66.7-153.5A226.62 226.62 0 0 1 612 684c60.9 0 118.2 23.7 161.3 66.8C814.5 792 838 846.3 840 904.3c.1 4.3 3.7 7.7 8 7.7h56a8 8 0 0 0 8-8.2c-2-77-33-149.2-87.8-203.9zM612 612c-34.2 0-66.4-13.3-90.5-37.5a126.86 126.86 0 0 1-37.5-91.8c.3-32.8 13.4-64.5 36.3-88 24-24.6 56.1-38.3 90.4-38.7 33.9-.3 66.8 12.9 91 36.6 24.8 24.3 38.4 56.8 38.4 91.4 0 34.2-13.3 66.3-37.5 90.5A127.3 127.3 0 0 1 612 612zM361.5 510.4c-.9-8.7-1.4-17.5-1.4-26.4 0-15.9 1.5-31.4 4.3-46.5.7-3.6-1.2-7.3-4.5-8.8-13.6-6.1-26.1-14.5-36.9-25.1a127.54 127.54 0 0 1-38.7-95.4c.9-32.1 13.8-62.6 36.3-85.6 24.7-25.3 57.9-39.1 93.2-38.7 31.9.3 62.7 12.6 86 34.4 7.9 7.4 14.7 15.6 20.4 24.4 2 3.1 5.9 4.4 9.3 3.2 17.6-6.1 36.2-10.4 55.3-12.4 5.6-.6 8.8-6.6 6.3-11.6-32.5-64.3-98.9-108.7-175.7-109.9-110.9-1.7-203.3 89.2-203.3 199.9 0 62.8 28.9 118.8 74.2 155.5-31.8 14.7-61.1 35-86.5 60.4-54.8 54.7-85.8 126.9-87.8 204a8 8 0 0 0 8 8.2h56.1c4.3 0 7.9-3.4 8-7.7 1.9-58 25.4-112.3 66.7-153.5 29.4-29.4 65.4-49.8 104.7-59.7 3.9-1 6.5-4.7 6-8.7z">
                  </path>
                </g>
              </svg>
              <span>Teams</span>
            </div>
          </router-link>
        </li>
        <li class="nav-item mb-2">
          <div class="nav-link" @click="logout" style="cursor: pointer;">
            <div class="d-flex align-items-center gap-3">
              <svg class="w-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                <g id="SVGRepo_iconCarrier">
                  <path d="M21 12L13 12" stroke="#1b93b1" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round"></path>
                  <path d="M18 15L20.913 12.087V12.087C20.961 12.039 20.961 11.961 20.913 11.913V11.913L18 9"
                    stroke="#1b93b1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                  <path
                    d="M16 5V4.5V4.5C16 3.67157 15.3284 3 14.5 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H14.5C15.3284 21 16 20.3284 16 19.5V19.5V19"
                    stroke="#1b93b1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                </g>
              </svg>
              <span>Logout</span>
            </div>
          </div>
        </li>
      </ul>
    </nav>
  </aside>

  <!-- Mobile: simple top bar with dropdown (keeps layout minimal) -->
  <div class="d-md-none mobile-sidenav p-2 bg-light border-bottom">
    <div class="d-flex align-items-center justify-content-between">
      <strong>Menu</strong>
      <button class="btn btn-sm btn-outline-secondary" @click="open = !open">☰</button>
    </div>
    <div v-if="open" class="mt-2">
      <ul class="nav flex-column">
        <li class="nav-item mb-2"><router-link to="/" class="nav-link">Dashboard</router-link></li>
        <li class="nav-item mb-2"><router-link to="/Profile" class="nav-link">Profile</router-link></li>
        <li class="nav-item mb-2"><router-link to="/Teams" class="nav-link">Teams</router-link></li>
        <li class="nav-item mb-2"><router-link to="/Login" class="nav-link">Logout</router-link></li>
      </ul>
    </div>
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
    const storedUser = JSON.parse(localStorage.getItem("user"))
    if (storedUser) {
      user.value = storedUser
      if (storedUser.avatar) avatar.value = storedUser.avatar
    } else {
      console.warn("Aucun utilisateur trouvé dans le localStorage")
    }
  })

  function isActive(path) {
    return route.path === path
  }

  function logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }
</script>


<style scoped>
.sidenav {
  /* responsive width: min 200px, preferred 18vw, max 320px */
  width: clamp(200px, 18vw, 320px);
  min-height: 100vh;
}

.profile {
  padding-bottom: 0.5rem;
}

.avatar {
  /* responsive avatar: between 40px and 72px, scales with viewport */
  width: clamp(40px, 5.5vw, 72px);
  height: clamp(40px, 5.5vw, 72px);
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e9ecef;
}

.nav-link.active {
  font-weight: 700;
}

.mobile-sidenav .nav-link {
  padding-left: 0;
}

/* Make active link show a bottom border without shifting layout */
.nav-link {
  display: block;
  padding-bottom: 0.35rem;
  border-bottom: 3px solid transparent;
  /* reserve space */
  color: black;
}

.nav .nav-link.router-link-active,
.nav .nav-link.router-link-exact-active,
.nav .nav-link.active {
  font-weight: 700;
  color: #1b93b1;
  border-bottom-color: #1b93b1;
}
</style>