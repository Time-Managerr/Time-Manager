<template>
  <main class="p-4">
    <h3>Users (Admin)</h3>

    <div class="card p-3 mb-3">
      <h5>Create user</h5>

      <div class="mb-2">
        <label class="form-label" for="admin-user-firstname">First name</label>
        <input
          id="admin-user-firstname"
          v-model="form.firstname"
          class="form-control"
          placeholder="First name"
        />
      </div>

      <div class="mb-2">
        <label class="form-label" for="admin-user-lastname">Last name</label>
        <input
          id="admin-user-lastname"
          v-model="form.lastname"
          class="form-control"
          placeholder="Last name"
        />
      </div>

      <div class="mb-2">
        <label class="form-label" for="admin-user-email">Email</label>
        <input
          id="admin-user-email"
          v-model="form.email"
          class="form-control"
          placeholder="Email"
        />
      </div>

      <div class="mb-2">
        <label class="form-label" for="admin-user-password">Password</label>
        <input
          id="admin-user-password"
          v-model="form.password"
          type="password"
          class="form-control"
          placeholder="Password"
        />
      </div>

      <div class="mb-2">
        <label class="form-label" for="admin-user-profile">Profile</label>
        <select id="admin-user-profile" v-model="form.profile" class="form-select">
          <option value="employee">employee</option>
          <option value="manager">manager</option>
          <option value="admin">admin</option>
        </select>
      </div>

      <div>
        <button class="btn btn-primary" @click="createUser">Create</button>
      </div>
    </div>

    <table class="table table-sm">
      <thead>
        <tr><th>ID</th><th>Name</th><th>Email</th><th>Profile</th><th>Actions</th></tr>
      </thead>
      <tbody>
        <tr v-for="u in users" :key="u.idUser">
          <td>{{ u.idUser }}</td>

          <td v-if="editing !== u.idUser">{{ u.firstname }} {{ u.lastname }}</td>
          <td v-else>
            <input v-model="editForm.firstname" class="form-control form-control-sm" />
            <input v-model="editForm.lastname" class="form-control form-control-sm mt-1" />
          </td>

          <td v-if="editing !== u.idUser">{{ u.email }}</td>
          <td v-else>
            <input v-model="editForm.email" class="form-control form-control-sm" />
          </td>

          <td v-if="editing !== u.idUser">{{ u.profile }}</td>
          <td v-else>
            <select v-model="editForm.profile" class="form-select form-select-sm">
              <option value="employee">employee</option>
              <option value="manager">manager</option>
              <option value="admin">admin</option>
            </select>
          </td>

          <td>
            <button
              v-if="editing !== u.idUser"
              class="btn btn-sm btn-outline-primary me-1"
              @click="startEdit(u)"
            >
              Edit
            </button>
            <button
              v-else
              class="btn btn-sm btn-primary me-1"
              @click="saveEdit(u)"
            >
              Save
            </button>
            <button
              v-if="editing === u.idUser"
              class="btn btn-sm btn-secondary me-1"
              @click="cancelEdit"
            >
              Cancel
            </button>
            <button class="btn btn-sm btn-danger" @click="deleteUser(u.idUser)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- CLOCKS SECTION -->
    <div class="card p-3 mt-4">
      <h5>Clocks</h5>

      <div class="mb-2">
        <label class="form-label" for="admin-clocks-user">Select user</label>
        <select
          id="admin-clocks-user"
          v-model.number="selectedClockUser"
          class="form-select"
          @change="loadClocks"
        >
          <option :value="null">-- select user --</option>
          <option v-for="u in users" :key="u.idUser" :value="u.idUser">
            {{ u.firstname }} {{ u.lastname }}
          </option>
        </select>
      </div>

      <div v-if="selectedClockUser" class="mb-3">
        <h6>Create clock-in</h6>
        <div class="row g-2 align-items-end">
          <div class="col-4">
            <label class="form-label" for="admin-clock-date">Date</label>
            <input
              id="admin-clock-date"
              v-model="newClock.date"
              type="date"
              class="form-control"
              @input="clocksError = ''"
            />
          </div>

          <div class="col-4">
            <label class="form-label" for="admin-clock-time">Time</label>
            <input
              id="admin-clock-time"
              v-model="newClock.time"
              type="time"
              class="form-control"
              @input="clocksError = ''"
            />
          </div>

          <div class="col-4">
            <button class="btn btn-primary" @click="createClock">Create</button>
          </div>
        </div>

        <div v-if="clocksError" class="text-danger small mt-2">{{ clocksError }}</div>
      </div>

      <table class="table table-sm" v-if="selectedClockUser">
        <thead>
          <tr><th>ID</th><th>Clock In</th><th>Clock Out</th><th>Hours</th><th>Actions</th></tr>
        </thead>
        <tbody>
          <tr v-for="c in clocks" :key="c.idClock">
            <td>{{ c.idClock }}</td>
            <td>{{ formatDateTime(c.clockIn) }}</td>

            <td v-if="!editingClockId || editingClockId !== c.idClock">
              {{ c.clockOut ? formatDateTime(c.clockOut) : '-' }}
            </td>
            <td v-else>
              <input v-model="editingClockOut" type="datetime-local" class="form-control form-control-sm" />
            </td>

            <td>{{ c.hoursWorked || '-' }}</td>

            <td>
              <button
                v-if="!c.clockOut"
                class="btn btn-sm btn-outline-primary me-1"
                @click="startEditClockOut(c)"
              >
                Set Clock-out
              </button>
              <button
                v-if="editingClockId === c.idClock"
                class="btn btn-sm btn-primary me-1"
                @click="saveClockOut(c)"
              >
                Save
              </button>
              <button class="btn btn-sm btn-danger" @click="deleteClock(c.idClock)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- PLANNINGS SECTION -->
    <div class="card p-3 mt-4">
      <h5>Plannings</h5>

      <div class="mb-2">
        <label class="form-label" for="admin-plannings-user">Select user</label>
        <select
          id="admin-plannings-user"
          v-model.number="selectedPlanningUser"
          class="form-select"
          @change="loadPlannings"
        >
          <option :value="null">-- select user --</option>
          <option v-for="u in users" :key="u.idUser" :value="u.idUser">
            {{ u.firstname }} {{ u.lastname }}
          </option>
        </select>
      </div>

      <div v-if="selectedPlanningUser" class="mb-3">
        <h6>Create planning</h6>
        <div class="row g-2 align-items-end">
          <div class="col-4">
            <label class="form-label" for="admin-planning-date">Date</label>
            <input
              id="admin-planning-date"
              v-model="newPlanning.date"
              type="date"
              class="form-control"
              @input="planningError = ''"
            />
          </div>

          <div class="col-3">
            <label class="form-label" for="admin-planning-start">Start</label>
            <input
              id="admin-planning-start"
              v-model="newPlanning.startTime"
              type="time"
              class="form-control"
              @input="planningError = ''"
            />
          </div>

          <div class="col-3">
            <label class="form-label" for="admin-planning-end">End</label>
            <input
              id="admin-planning-end"
              v-model="newPlanning.endTime"
              type="time"
              class="form-control"
              @input="planningError = ''"
            />
          </div>

          <div class="col-2">
            <button class="btn btn-primary" @click="createPlanning">Create</button>
          </div>
        </div>

        <div v-if="planningError" class="text-danger small mt-2">{{ planningError }}</div>
      </div>

      <table class="table table-sm" v-if="selectedPlanningUser">
        <thead>
          <tr><th>ID</th><th>Date</th><th>Start</th><th>End</th><th>Actions</th></tr>
        </thead>
        <tbody>
          <tr v-for="p in plannings" :key="p.idPlanning">
            <td>{{ p.idPlanning }}</td>
            <td>{{ new Date(p.date).toISOString().split('T')[0] }}</td>

            <td v-if="editingPlanningId !== p.idPlanning">
              {{ formatUtcHHMM(p.startTime) }}
            </td>
            <td v-else>
              <input v-model="editPlanningForm.startTime" type="time" class="form-control form-control-sm" />
            </td>

            <td v-if="editingPlanningId !== p.idPlanning">
              {{ formatUtcHHMM(p.endTime) }}
            </td>
            <td v-else>
              <input v-model="editPlanningForm.endTime" type="time" class="form-control form-control-sm" />
            </td>

            <td>
              <button
                v-if="editingPlanningId !== p.idPlanning"
                class="btn btn-sm btn-outline-primary me-1"
                @click="startEditPlanning(p)"
              >
                Edit
              </button>
              <button
                v-else
                class="btn btn-sm btn-primary me-1"
                @click="saveEditPlanning(p)"
              >
                Save
              </button>
              <button class="btn btn-sm btn-danger" @click="deletePlanning(p.idPlanning)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import usersService from '../../services/usersService.js';
import clockService from '../../services/clockService.js';
import planningService from '../../services/planningService.js';
import { useToast } from '../../composables/useToast';

const toast = useToast();

function getErrorMessage(e) {
  if (!e) return 'Unknown error';
  if (e.response && e.response.data) {
    const data = e.response.data;
    if (data.errors && Array.isArray(data.errors)) {
      return data.errors.map(err => err.message).join(', ');
    }
    if (data.error) return data.error;
  }
  return e.message || String(e);
}

const formatDateTime = (s) => (s ? new Date(s).toLocaleString() : '-');

const formatUtcHHMM = (iso) => {
  if (!iso) return '-';
  const d = new Date(iso);
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
};

const users = ref([]);
const form = ref({ firstname: '', lastname: '', email: '', password: '', profile: 'employee' });
const editing = ref(null);
const editForm = ref({});

// clocks
const selectedClockUser = ref(null);
const clocks = ref([]);
const newClock = ref({ date: '', time: '09:00' });
const editingClockId = ref(null);
const editingClockOut = ref('');
const clocksError = ref('');

// plannings
const selectedPlanningUser = ref(null);
const plannings = ref([]);
const newPlanning = ref({ date: '', startTime: '09:00', endTime: '17:00' });
const editingPlanningId = ref(null);
const editPlanningForm = ref({ startTime: '', endTime: '' });
const planningError = ref('');

const fetchUsers = async () => {
  users.value = await usersService.getAll();
};

const loadClocks = async () => {
  if (!selectedClockUser.value) {
    clocks.value = [];
    return;
  }
  try {
    clocks.value = await clockService.getByUserId(selectedClockUser.value);
  } catch (e) {
    console.error(e);
    clocks.value = [];
  }
};

const createClock = async () => {
  clocksError.value = '';
  if (!selectedClockUser.value) {
    clocksError.value = 'Please select a user to create a clock for.';
    return;
  }
  if (!newClock.value.date) {
    clocksError.value = 'Please fill in a date for the clock.';
    return;
  }
  if (!newClock.value.time) {
    clocksError.value = 'Please fill in a time for the clock.';
    return;
  }

  try {
    const payload = {
      userId: selectedClockUser.value,
      clockIn: `${newClock.value.date}T${newClock.value.time}:00`,
    };
    await clockService.clockIn(payload.userId, payload.clockIn);
    newClock.value = { date: '', time: '09:00' };
    await loadClocks();
  } catch (e) {
    console.error(e);
    clocksError.value = 'Could not create clock: ' + getErrorMessage(e);
  }
};

const startEditClockOut = (c) => {
  editingClockId.value = c.idClock;
  editingClockOut.value = new Date().toISOString().slice(0, 16);
};

const saveClockOut = async (c) => {
  clocksError.value = '';
  if (!editingClockOut.value) {
    clocksError.value = 'Please provide a date/time for clock-out.';
    return;
  }
  try {
    await clockService.clockOut(c.idClock, new Date(editingClockOut.value).toISOString());
    editingClockId.value = null;
    editingClockOut.value = '';
    await loadClocks();
  } catch (e) {
    console.error(e);
    clocksError.value = 'Could not save clock-out: ' + getErrorMessage(e);
  }
};

const deleteClock = async (id) => {
  const ok = confirm('Delete clock?');
  if (!ok) {
    return;
  }

  try {
    await clockService.deleteClock(id);
    await loadClocks();
    toast.success('Clock deleted successfully');
  } catch (e) {
    console.error(e);
    toast.error('Error deleting clock');
  }
};

const loadPlannings = async () => {
  if (!selectedPlanningUser.value) {
    plannings.value = [];
    return;
  }
  try {
    plannings.value = await planningService.getByUserId(selectedPlanningUser.value);
  } catch (e) {
    console.error(e);
    plannings.value = [];
  }
};

const createPlanning = async () => {
  planningError.value = '';
  if (!selectedPlanningUser.value) {
    planningError.value = 'Please select a user to create planning for.';
    return;
  }
  if (!newPlanning.value.date) {
    planningError.value = 'Please provide a date for the planning.';
    return;
  }
  if (!newPlanning.value.startTime || !newPlanning.value.endTime) {
    planningError.value = 'Please provide start and end times.';
    return;
  }

  const startISO = `${newPlanning.value.date}T${newPlanning.value.startTime}:00`;
  const endISO = `${newPlanning.value.date}T${newPlanning.value.endTime}:00`;
  if (new Date(endISO) <= new Date(startISO)) {
    planningError.value = 'End time must be after start time.';
    return;
  }

  try {
    const payload = {
      userId: selectedPlanningUser.value,
      date: newPlanning.value.date,
      startTime: startISO,
      endTime: endISO,
    };
    await planningService.createPlanning(payload);
    newPlanning.value = { date: '', startTime: '09:00', endTime: '17:00' };
    await loadPlannings();
  } catch (e) {
    console.error(e);
    planningError.value = 'Could not create planning: ' + getErrorMessage(e);
  }
};

const startEditPlanning = (p) => {
  editingPlanningId.value = p.idPlanning;
  editPlanningForm.value = {
    startTime: new Date(p.startTime).toTimeString().slice(0, 5),
    endTime: new Date(p.endTime).toTimeString().slice(0, 5),
  };
};

const saveEditPlanning = async (p) => {
  planningError.value = '';
  if (!editPlanningForm.value.startTime || !editPlanningForm.value.endTime) {
    planningError.value = 'Please provide both start and end times.';
    return;
  }

  const dateStr = new Date(p.date).toISOString().split('T')[0];
  const startISO = `${dateStr}T${editPlanningForm.value.startTime}:00`;
  const endISO = `${dateStr}T${editPlanningForm.value.endTime}:00`;
  if (new Date(endISO) <= new Date(startISO)) {
    planningError.value = 'End time must be after start time.';
    return;
  }

  try {
    await planningService.updatePlanning(p.idPlanning, { startTime: startISO, endTime: endISO });
    editingPlanningId.value = null;
    editPlanningForm.value = { startTime: '', endTime: '' };
    await loadPlannings();
  } catch (e) {
    console.error(e);
    planningError.value = 'Could not save planning: ' + getErrorMessage(e);
  }
};

const deletePlanning = async (id) => {
  const ok = confirm('Delete planning?');
  if (!ok) {
    return;
  }

  try {
    await planningService.deletePlanning(id);
    await loadPlannings();
    toast.success('Planning deleted successfully');
  } catch (e) {
    console.error(e);
    toast.error('Error deleting planning');
  }
};

const createUser = async () => {
  try {
    await usersService.create(form.value);
    form.value = { firstname: '', lastname: '', email: '', password: '', profile: 'employee' };
    await fetchUsers();
    toast.success('User created successfully');
  } catch (err) {
    console.error(err);
    toast.error('Error creating user');
  }
};

const startEdit = (u) => {
  editing.value = u.idUser;
  editForm.value = { firstname: u.firstname, lastname: u.lastname, email: u.email, profile: u.profile };
};

const cancelEdit = () => {
  editing.value = null;
  editForm.value = {};
};

const saveEdit = async (u) => {
  try {
    await usersService.update(u.idUser, editForm.value);
    editing.value = null;
    await fetchUsers();
    toast.success('User updated successfully');
  } catch (err) {
    console.error(err);
    toast.error('Error updating user');
  }
};

const deleteUser = async (id) => {
  if (!confirm('Delete user?')) return;
  try {
    await usersService.delete(id);
    await fetchUsers();
    toast.success('User deleted successfully');
  } catch (err) {
    console.error(err);
    toast.error('Error deleting user');
  }
};

onMounted(fetchUsers);
</script>
