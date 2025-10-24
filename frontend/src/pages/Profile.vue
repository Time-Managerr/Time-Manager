<template>
  <main class="flex-fill p-4">
    <section class="profile">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="fw-bold">My Profile</h4>
        <button class="btn btn-outline-primary btn-sm" @click="onSave">
          <i class="bi bi-save me-1"></i> Save changes
        </button>
      </div>

      <!-- ================= Profile Summary Card ================= -->
      <div class="card shadow-sm p-4 mb-4 border-0 rounded-3">
        <div class="row align-items-center">
          <div class="col-md-3 text-center">
            <div class="position-relative d-inline-block">
              <img :src="avatar" alt="avatar" class="profile-avatar mb-2" />
              <button
                type="button"
                class="btn btn-sm btn-outline-secondary edit-btn"
                @click="onEditAvatar"
                title="Change avatar"
              >
                ✎
              </button>
            </div>
          </div>
          <div class="col-md-9">
            <h5 class="fw-semibold mb-1">{{ user.firstname }} {{ user.lastname }}</h5>
            <p class="text-muted mb-2">{{ user.email }}</p>
            <span class="badge bg-light text-dark border">Member since 2023</span>
          </div>
        </div>
      </div>

      <!-- ================= Account Details ================= -->
      <div class="card shadow-sm p-4 mb-4 border-0 rounded-3">
        <h5 class="fw-semibold mb-3 text-primary">Account Details</h5>
        <form @submit.prevent="onSave">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">First name</label>
              <input v-model="user.firstname" type="text" class="form-control" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Last name</label>
              <input v-model="user.lastname" type="text" class="form-control" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Email</label>
              <input v-model="user.email" type="email" class="form-control" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Phone number</label>
              <input v-model="user.phone" type="tel" class="form-control" />
            </div>
          </div>
        </form>
      </div>

      <!-- ================= Security Settings ================= -->
      <div class="card shadow-sm p-4 border-0 rounded-3">
        <h5 class="fw-semibold mb-3 text-danger">Security Settings</h5>
        <p class="text-muted small mb-4">
          Manage your password and account access.
        </p>

        <div class="row g-3 align-items-center">
          <div class="col-md-6">
            <label class="form-label">Current password</label>
            <input type="password" class="form-control" placeholder="********" />
          </div>
          <div class="col-md-6">
            <label class="form-label">New password</label>
            <input type="password" class="form-control" placeholder="********" />
          </div>
        </div>

        <div class="d-flex justify-content-end mt-4">
          <button class="btn btn-danger px-4">Update password</button>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const user = ref({
  firstname: '',
  lastname: '',
  email: '',
  phone: ''
})
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

function onEditAvatar() {
  alert('Change avatar - not implemented yet')
}

function onSave() {
  localStorage.setItem("user", JSON.stringify(user.value))
  alert('Saved successfully! (demo)')
}
</script>


<style scoped>
/* General Layout */
.profile {
  max-width: 900px;
  margin: 0 auto;
}

/* Avatar Styling */
.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e9ecef;
  background-color: #f8f9fa;
  transition: transform 0.3s ease;
}
.profile-avatar:hover {
  transform: scale(1.03);
}

.edit-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  transform: translate(25%, 25%);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
}

/* Card styling */
.card {
  background-color: var(--bs-body-bg, #fff);
}

.card h5 {
  letter-spacing: -0.2px;
}

/* Form fields */
.form-label {
  font-weight: 500;
  color: #495057;
}

.form-control {
  border-radius: 10px;
  border: 1px solid #dee2e6;
  padding: 0.55rem 0.75rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-control:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.1);
}

/* Buttons */
.btn-outline-primary {
  border-radius: 8px;
}

.btn-danger {
  border-radius: 8px;
}

.text-muted {
  font-size: 0.9rem;
  color: #6c757d !important;
}
</style>
