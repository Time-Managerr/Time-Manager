<template>
  <main class="flex-fill p-4">
    <div class="card p-4 shadow-sm">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 class="mb-0">Clocks history — {{ userName }}</h4>
          <small class="text-muted">Lateness this month: {{ user?.latenessCount ?? 0 }}</small>
        </div>
        <div>
          <button class="btn btn-sm btn-secondary" @click="$router.back()">Back</button>
        </div>
      </div>

      <div v-if="loading" class="text-center py-5 text-muted">Loading...</div>

      <div v-else>
        <table class="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Clock In</th>
              <th>Clock Out</th>
              <th>Hours</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in clocks" :key="c.idClock">
              <td>{{ formatDate(c.clockIn) }}</td>
              <td :class="c.late ? 'text-danger' : 'text-success'">{{ formatTime(c.clockIn) }}</td>
              <td :class="c.earlyLeave ? 'text-danger' : (c.clockOut ? 'text-success' : '')">{{ c.clockOut ? formatTime(c.clockOut) : '-' }}</td>
              <td :class="c.shortDay ? 'text-danger' : (c.hoursWorked >= 8 ? 'text-success' : '')">{{ c.hoursWorked ?? '-' }}</td>
              <td>
                <span v-if="c.late" class="badge bg-danger me-1">Late</span>
                <span v-if="c.earlyLeave" class="badge bg-danger me-1">Early leave</span>
                <span v-if="c.shortDay" class="badge bg-danger">Short day</span>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="clocks.length === 0" class="text-center text-muted py-4">No clocks recorded for this user.</div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import clockService from '../services/clockService.js';
import usersService from '../services/usersService.js';

const route = useRoute();
const userId = route.params.userId;
const clocks = ref([]);
const user = ref(null);
const userName = ref('');
const loading = ref(true);

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await Promise.all([clockService.getByUserId(userId), usersService.getById(userId)]);
    clocks.value = res[0];
    user.value = res[1];
    userName.value = `${user.value.firstname} ${user.value.lastname}`;
  } catch (err) {
    console.error('Error loading clocks history:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);

const formatTime = (iso) => {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) { return '-'; }
};

const formatDate = (iso) => {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleDateString();
  } catch (e) { return '-'; }
};
</script>

<style scoped>
.text-danger { color: #dc3545; }
.text-success { color: #198754; }
</style>