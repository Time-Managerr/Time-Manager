<template>
  <main class="p-4">
    <h3>Reports (Admin)</h3>

    <div class="card p-3 mb-3">
      <h5>Create report</h5>

      <div class="mb-2">
        <label class="form-label" for="admin-report-kpi">KPI</label>
        <input
          id="admin-report-kpi"
          v-model="form.kpi"
          class="form-control"
          placeholder="KPI"
        />
      </div>

      <div class="mb-2">
        <label class="form-label" for="admin-report-startDate">Start Date</label>
        <input
          id="admin-report-startDate"
          v-model="form.startDate"
          type="date"
          class="form-control"
        />
      </div>

      <div class="mb-2">
        <label class="form-label" for="admin-report-endDate">End Date</label>
        <input
          id="admin-report-endDate"
          v-model="form.endDate"
          type="date"
          class="form-control"
        />
      </div>

      <div class="mb-2">
        <label class="form-label" for="admin-report-userId">User ID (optional)</label>
        <input
          id="admin-report-userId"
          v-model.number="form.userId"
          class="form-control"
          placeholder="User ID"
        />
      </div>

      <div class="mb-2">
        <label class="form-label" for="admin-report-teamId">Team ID (optional)</label>
        <input
          id="admin-report-teamId"
          v-model.number="form.teamId"
          class="form-control"
          placeholder="Team ID"
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
          <th>KPI</th>
          <th>Start</th>
          <th>End</th>
          <th>User</th>
          <th>Team</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in reports" :key="r.idReport">
          <td>{{ r.idReport }}</td>
          <td>{{ r.kpi }}</td>
          <td>{{ new Date(r.startDate).toISOString().split('T')[0] }}</td>
          <td>{{ new Date(r.endDate).toISOString().split('T')[0] }}</td>
          <td>{{ r.userId }}</td>
          <td>{{ r.teamId }}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary me-1" @click="editReport(r)">Edit</button>
            <button class="btn btn-sm btn-danger" @click="deleteReport(r.idReport)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="editing" class="card p-3 mt-3">
      <h5>Edit Report {{ editing.idReport }}</h5>

      <label class="form-label" for="admin-report-edit-kpi">KPI</label>
      <input id="admin-report-edit-kpi" v-model="editForm.kpi" class="form-control mb-2" />

      <label class="form-label" for="admin-report-edit-startDate">Start Date</label>
      <input
        id="admin-report-edit-startDate"
        v-model="editForm.startDate"
        type="date"
        class="form-control mb-2"
      />

      <label class="form-label" for="admin-report-edit-endDate">End Date</label>
      <input
        id="admin-report-edit-endDate"
        v-model="editForm.endDate"
        type="date"
        class="form-control mb-2"
      />

      <label class="form-label" for="admin-report-edit-userId">User ID (optional)</label>
      <input
        id="admin-report-edit-userId"
        v-model.number="editForm.userId"
        class="form-control mb-2"
      />

      <label class="form-label" for="admin-report-edit-teamId">Team ID (optional)</label>
      <input
        id="admin-report-edit-teamId"
        v-model.number="editForm.teamId"
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
import reportsService from '../../services/reportsService.js';

const reports = ref([]);
const form = ref({ kpi: '', startDate: '', endDate: '', userId: null, teamId: null });
const editing = ref(null);
const editForm = ref({});

const fetch = async () => {
  reports.value = await reportsService.getAll();
};

const create = async () => {
  await reportsService.create(form.value);
  await fetch();
};

const editReport = (r) => {
  editing.value = r;
  editForm.value = {
    kpi: r.kpi,
    startDate: new Date(r.startDate).toISOString().split('T')[0],
    endDate: new Date(r.endDate).toISOString().split('T')[0],
    userId: r.userId,
    teamId: r.teamId
  };
};

const cancelEdit = () => {
  editing.value = null;
  editForm.value = {};
};

const saveEdit = async () => {
  await reportsService.update(editing.value.idReport, editForm.value);
  editing.value = null;
  await fetch();
};

const deleteReport = async (id) => {
  const ok = confirm('Delete?');
  if (!ok) {
    return;
  }

  await reportsService.delete(id);
  await fetch();
};

onMounted(fetch);
</script>
