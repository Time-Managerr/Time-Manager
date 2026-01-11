<template>
  <main class="p-4">
    <h3>Plannings (Admin)</h3>

    <div class="card p-3 mb-3">
      <h5>Create planning</h5>

      <div class="mb-2">
        <label class="form-label" for="admin-planning-userId">User ID</label>
        <input
          id="admin-planning-userId"
          v-model.number="form.userId"
          class="form-control"
          placeholder="User ID"
        />
      </div>

      <div class="mb-2">
        <label class="form-label" for="admin-planning-date">Date</label>
        <input
          id="admin-planning-date"
          v-model="form.date"
          type="date"
          class="form-control"
        />
      </div>

      <div class="mb-2">
        <label class="form-label" for="admin-planning-startTime">Start Time</label>
        <input
          id="admin-planning-startTime"
          v-model="form.startTime"
          type="time"
          class="form-control"
        />
      </div>

      <div class="mb-2">
        <label class="form-label" for="admin-planning-endTime">End Time</label>
        <input
          id="admin-planning-endTime"
          v-model="form.endTime"
          type="time"
          class="form-control"
        />
      </div>

      <div>
        <button class="btn btn-primary" @click="create">Create</button>
      </div>
    </div>

    <table class="table table-sm">
      <thead>
        <tr>
          <th>ID</th>
          <th>User</th>
          <th>Date</th>
          <th>Start</th>
          <th>End</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in plans" :key="p.idPlanning">
          <td>{{ p.idPlanning }}</td>
          <td>{{ p.userId }}</td>
          <td>{{ new Date(p.date).toISOString().split('T')[0] }}</td>
          <td>{{ new Date(p.startTime).toLocaleString() }}</td>
          <td>{{ new Date(p.endTime).toLocaleString() }}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary me-1" @click="startEdit(p)">Edit</button>
            <button class="btn btn-sm btn-danger" @click="deletePlan(p.idPlanning)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="editing" class="card p-3 mt-3">
      <h5>Edit Planning {{ editing.idPlanning }}</h5>

      <label class="form-label" for="admin-planning-edit-start">Start Time</label>
      <input
        id="admin-planning-edit-start"
        v-model="editForm.startTime"
        type="time"
        class="form-control mb-2"
      />

      <label class="form-label" for="admin-planning-edit-end">End Time</label>
      <input
        id="admin-planning-edit-end"
        v-model="editForm.endTime"
        type="time"
        class="form-control mb-2"
      />

      <div class="d-flex gap-2">
        <button class="btn btn-primary btn-sm" @click="saveEdit">Save</button>
        <button class="btn btn-secondary btn-sm" @click="cancelEdit">Cancel</button>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import planningService from '../../services/planningService.js';
import { useToast } from '../../composables/useToast';

const toast = useToast();

const plans = ref([]);
const form = ref({ userId: '', date: '', startTime: '09:00', endTime: '17:00' });
const editing = ref(null);
const editForm = ref({ startTime: '', endTime: '' });

const fetch = async () => {
  plans.value = await planningService.getAll();
};

const create = async () => {
  try {
    const payload = {
      userId: Number(form.value.userId),
      date: form.value.date,
      startTime: `${form.value.date}T${form.value.startTime}:00`,
      endTime: `${form.value.date}T${form.value.endTime}:00`
    };
    await planningService.createPlanning(payload);
    await fetch();
    toast.success('Planning created successfully');
  } catch (e) {
    console.error(e);
    toast.error('Error creating planning');
  }
};

const startEdit = (p) => {
  editing.value = p;

  const dt = new Date(p.startTime);
  editForm.value.startTime = dt.toTimeString().slice(0, 5);

  const dt2 = new Date(p.endTime);
  editForm.value.endTime = dt2.toTimeString().slice(0, 5);
};

const cancelEdit = () => {
  editing.value = null;
  editForm.value = {};
};

const saveEdit = async () => {
  try {
    const day = new Date(editing.value.date).toISOString().split('T')[0];

    await planningService.updatePlanning(editing.value.idPlanning, {
      startTime: `${day}T${editForm.value.startTime}:00`,
      endTime: `${day}T${editForm.value.endTime}:00`
    });

    await fetch();
    editing.value = null;
    toast.success('Planning updated successfully');
  } catch (e) {
    console.error(e);
    toast.error('Error updating planning');
  }
};

const deletePlan = async (id) => {
  const ok = confirm('Delete?');
  if (!ok) {
    return;
  }

  try {
    await planningService.deletePlanning(id);
    await fetch();
    toast.success('Planning deleted successfully');
  } catch (e) {
    console.error(e);
    toast.error('Error deleting planning');
  }
};

onMounted(fetch);
</script>
