<template>
  <main class="p-4">
    <h3>Clocks (Admin)</h3>
    <table class="table table-sm">
      <thead>
        <tr>
          <th>ID</th>
          <th>User</th>
          <th>Clock In</th>
          <th>Clock Out</th>
          <th>Hours</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in clocks" :key="c.idClock">
          <td>{{ c.idClock }}</td>
          <td>{{ c.userId }}</td>
          <td>{{ new Date(c.clockIn).toLocaleString() }}</td>
          <td>{{ c.clockOut ? new Date(c.clockOut).toLocaleString() : '-' }}</td>
          <td>{{ c.hoursWorked || '-' }}</td>
          <td>
            <button class="btn btn-sm btn-danger" @click="deleteClock(c.idClock)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import clockService from '../../services/clockService.js';
import { useToast } from '../../composables/useToast';

const toast = useToast();

const clocks = ref([]);

const fetch = async () => {
  clocks.value = await clockService.getAll();
};

const deleteClock = async (id) => {
  const ok = confirm('Delete?');
  if (!ok) {
    return;
  }

  try {
    await clockService.deleteClock(id);
    await fetch();
    toast.success('Clock deleted successfully');
  } catch (e) {
    console.error(e);
    toast.error('Error deleting clock');
  }
};

onMounted(fetch);
</script>
