<script setup>
import { onMounted, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { api } from "../services/api";

const router = useRouter();
const clocks = ref([]);

const getDate = (dateString) => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date)) return '—';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return '—';
  }
};

const getHeure = (dateString) => {
  if (!dateString) return 'Non renseigné';
  try {
    const s = String(dateString);
    if (s.length >= 16) {
      const hours = s.slice(11, 13);
      const minutes = s.slice(14, 16);
      return `${hours}h${minutes}`;
    }
    return 'Non renseigné';
  } catch {
    return 'Non renseigné';
  }
};

const fetchClocksByIdUser = async (userId) => {
  const response = await api.get(`clocks/user/${userId}`);
  clocks.value = response.data;
};

const redirection = (id) => {
  router.push(`/clock/${id}`);
};

const limitedClocks = computed(() => {
  if (!clocks.value || clocks.value.length === 0) return [];
  return [...clocks.value]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 60);
});

onMounted(() => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.id) fetchClocksByIdUser(user.id);
});

const calculateHoursWorked = (clockIn, clockOut) => {
  if (!clockIn || !clockOut) return 0;

  const start = new Date(clockIn);
  const end = new Date(clockOut);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) return 0;

  const diffMs = end - start;
  return diffMs / 3600000; // decimal hours
};

const formatHoursWorkedSimple = (decimalHours) => {
  if (typeof decimalHours !== 'number' || isNaN(decimalHours)) return '0h00';

  const totalMinutes = Math.floor(decimalHours * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const pad = (num) => String(num).padStart(2, '0');

  return `${hours}h${pad(minutes)}`;
};
</script>

<template>
  <div class="d-flex flex-column justify-content-between mx-auto my-4 shadow card p-3">
    <h4 class="fw-semibold mt-2 mb-4">My previous clocks</h4>
    <table class="table table-striped text-center fw-medium">
      <thead class="table-primary">
        <tr class="table-primary">
          <th scope="col">
            <svg class="col-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M20 10V7C20 5.89543 19.1046 5 18 5H6C4.89543 5 4 5.89543 4 7V10M20 10V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V10M20 10H4M8 3V7M16 3V7"
                stroke="#1b93b1" stroke-width="2" stroke-linecap="round" />
              <rect x="6" y="12" width="3" height="3" rx="0.5" fill="#1b93b1" />
              <rect x="10.5" y="12" width="3" height="3" rx="0.5" fill="#1b93b1" />
              <rect x="15" y="12" width="3" height="3" rx="0.5" fill="#1b93b1" />
            </svg>
          </th>
          <th scope="col-1">
            <svg class="col-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M9 13L11 15L15 11M3 6L6.5 3M21 6L17.5 3M12 21C16.4183 21 20 17.4183 20 13C20 8.58172 16.4183 5 12 5C7.58172 5 4 8.58172 4 13C4 17.4183 7.58172 21 12 21Z"
                stroke="#1b93b1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </th>
          <th scope="col">
            <svg class="col-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 15L15 12M15 12L12 9M15 12H4M4 7.24802V7.2002C4 6.08009 4 5.51962 4.21799 5.0918C4.40973 4.71547 4.71547 4.40973 5.0918 4.21799C5.51962 4 6.08009 4 7.2002 4H16.8002C17.9203 4 18.4796 4 18.9074 4.21799C19.2837 4.40973 19.5905 4.71547 19.7822 5.0918C20 5.5192 20 6.07899 20 7.19691V16.8036C20 17.9215 20 18.4805 19.7822 18.9079C19.5905 19.2842 19.2837 19.5905 18.9074 19.7822C18.48 20 17.921 20 16.8031 20H7.19691C6.07899 20 5.5192 20 5.0918 19.7822C4.71547 19.5905 4.40973 19.2839 4.21799 18.9076C4 18.4798 4 17.9201 4 16.8V16.75"
                stroke="#1b93b1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </th>
          <th scope="col">
            <svg class="col-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M4 12H3V8C3 6.89543 3.89543 6 5 6H9M4 12V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V12M4 12H10M20 12H21V8C21 6.89543 20.1046 6 19 6H15M20 12H14M14 12V10H10V12M14 12V14H10V12M9 6V5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V6M9 6H15"
                stroke="#1b93b1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </th>
        </tr>
      </thead>
      <tbody class="scroll-tbody">
        <tr v-for="clock in limitedClocks" :key="clock.idClock" @click="redirection(clock.idClock)"
          style="cursor:pointer;">
          <td scope="row">{{ getDate(clock.createdAt) }}</td>
          <td class="text-success">{{ getHeure(clock.clockIn) }}</td>
          <td class="text-danger">{{ getHeure(clock.clockOut) }}</td>
          <td>{{ formatHoursWorkedSimple(calculateHoursWorked(clock.clockIn, clock.clockOut)) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.scroll-tbody {
  display: block;
  max-height: 350px;
  overflow-y: auto;
}

.scroll-tbody tr {
  display: table;
  width: 100%;
  table-layout: fixed;
}

table thead,
table tbody tr {
  display: table;
  width: 100%;
  table-layout: fixed;
}
</style>
