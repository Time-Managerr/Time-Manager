<template>
  <main class="p-4">
    <h3>Vacations (Admin)</h3>

    <div class="card p-3 mb-3">
      <h5>Create vacation</h5>

      <div class="mb-2">
        <label class="form-label" for="admin-vacation-userId">User ID</label>
        <input
          id="admin-vacation-userId"
          v-model.number="form.userId"
          class="form-control"
          placeholder="User ID"
        />
      </div>

      <div class="mb-2">
        <label class="form-label" for="admin-vacation-startDate">Start Date</label>
        <input
          id="admin-vacation-startDate"
          v-model="form.startDate"
          type="date"
          class="form-control"
        />
      </div>

      <div class="mb-2">
        <label class="form-label" for="admin-vacation-endDate">End Date</label>
        <input
          id="admin-vacation-endDate"
          v-model="form.endDate"
          type="date"
          class="form-control"
        />
      </div>

      <div class="mb-2">
        <label class="form-label" for="admin-vacation-status">Status</label>
        <select
          id="admin-vacation-status"
          v-model="form.status"
          class="form-select"
        >
          <option value="pending">pending</option>
          <option value="approved">approved</option>
          <option value="rejected">rejected</option>
        </select>
      </div>

      <div>
        <button class="btn btn-primary" @click="create">Create</button>
      </div>
    </div>

    <table class="table table-sm">
      <thead>
        <tr>
          <th>ID</th><th>User</th><th>Start</th><th>End</th><th>Status</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="v in vacations" :key="v.idVacation">
          <td>{{ v.idVacation }}</td>
          <td>{{ v.userId }}</td>
          <td>{{ new Date(v.startDate).toISOString().split('T')[0] }}</td>
          <td>{{ new Date(v.endDate).toISOString().split('T')[0] }}</td>
          <td>{{ v.status }}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary me-1" @click="startEdit(v)">Edit</button>
            <button class="btn btn-sm btn-danger" @click="deleteVacation(v.idVacation)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="editing" class="card p-3 mt-3">
      <h5>Edit Vacation {{ editing.idVacation }}</h5>

      <label class="form-label" for="admin-vacation-edit-startDate">Start Date</label>
      <input
        id="admin-vacation-edit-startDate"
        v-model="editForm.startDate"
        type="date"
        class="form-control mb-2"
      />

      <label class="form-label" for="admin-vacation-edit-endDate">End Date</label>
      <input
        id="admin-vacation-edit-endDate"
        v-model="editForm.endDate"
        type="date"
        class="form-control mb-2"
      />

      <label class="form-label" for="admin-vacation-edit-status">Status</label>
      <select
        id="admin-vacation-edit-status"
        v-model="editForm.status"
        class="form-select mb-2"
      >
        <option value="pending">pending</option>
        <option value="approved">approved</option>
        <option value="rejected">rejected</option>
      </select>

      <div class="d-flex gap-2">
        <button class="btn btn-primary btn-sm" @click="saveEdit">Save</button>
        <button class="btn btn-secondary btn-sm" @click="cancelEdit">Cancel</button>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import vacationsService from '../../services/vacationsService.js';
import { useToast } from '../../composables/useToast';

const toast = useToast();

const vacations = ref([]);
const form = ref({ userId: null, startDate: '', endDate: '', status: 'pending' });
const editing = ref(null);
const editForm = ref({});

const fetch = async () => {
  vacations.value = await vacationsService.getAll();
};

const create = async () => {
  try {
    await vacationsService.create(form.value);
    await fetch();
    form.value = { userId: null, startDate: '', endDate: '', status: 'pending' };
    toast.success('Vacation created successfully');
  } catch (e) {
    console.error(e);
    toast.error('Error creating vacation');
  }
};

const startEdit = (v) => {
  editing.value = v;
  editForm.value = {
    startDate: new Date(v.startDate).toISOString().split('T')[0],
    endDate: new Date(v.endDate).toISOString().split('T')[0],
    status: v.status
  };
};

const cancelEdit = () => {
  editing.value = null;
  editForm.value = {};
};

const saveEdit = async () => {
  try {
    await vacationsService.update(editing.value.idVacation, editForm.value);
    await fetch();
    editing.value = null;
    toast.success('Vacation updated successfully');
  } catch (e) {
    console.error(e);
    toast.error('Error updating vacation');
  }
};

const deleteVacation = async (id) => {
  const ok = confirm('Delete?');
  if (!ok) {
    return;
  }

  try {
    await vacationsService.delete(id);
    await fetch();
    toast.success('Vacation deleted successfully');
  } catch (e) {
    console.error(e);
    toast.error('Error deleting vacation');
  }
};

onMounted(fetch);
</script>
