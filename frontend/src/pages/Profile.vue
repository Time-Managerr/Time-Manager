<template>
  <main class="flex-fill p-4">
    <section class="profile">
      <!-- PAGE TITLE -->
      <div class="page-header d-flex justify-content-between align-items-center mb-4">
        <div class="d-flex align-items-center gap-3">
          <svg viewBox="0 0 24 24" class="page-icon" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <h3 class="page-title mb-0">My Profile</h3>
        </div>
        <button class="btn btn-outline-primary btn-sm" @click="onSave">
          <i class="bi bi-save me-1"></i> Save changes
        </button>
      </div>

      <!-- ================= Profile Summary Card ================= -->
      <div class="card shadow-sm p-4 mb-4 border-0 rounded-3">
        <div class="row align-items-center">
          <div class="col-md-3 text-center">
            <div class="profile-avatar">
              <span class="initials">{{ getInitials(user.firstname, user.lastname) }}</span>
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
import { useToast } from '../composables/useToast'

const toast = useToast()

const user = ref({
  firstname: '',
  lastname: '',
  email: '',
  phone: ''
})

const getInitials = (firstname, lastname) => {
  if (!firstname || !lastname) return '?';
  return (firstname[0] + lastname[0]).toUpperCase();
};

onMounted(() => {
  const storedUser = JSON.parse(localStorage.getItem("user"))
  if (storedUser) {
    user.value = storedUser
  } else {
    console.warn("Aucun utilisateur trouvé dans le localStorage")
  }
})

function onSave() {
  localStorage.setItem("user", JSON.stringify(user.value))
  toast.success('Profile saved successfully!')
}
</script>


<style scoped>
/* PAGE HEADER STYLES - Consistent across all pages */
.page-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e9ecef;
}

.page-icon {
  width: 32px;
  height: 32px;
  color: #1b93b1;
  flex-shrink: 0;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1b93b1;
  margin: 0;
  letter-spacing: -0.5px;
}

/* General Layout */
.profile {
  max-width: 900px;
  margin: 0 auto;
}

/* Avatar styling */
.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1b93b1 0%, #2ca9bc 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-avatar .initials {
  color: white;
  font-size: 2.5rem;
  font-weight: 600;
  user-select: none;
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
