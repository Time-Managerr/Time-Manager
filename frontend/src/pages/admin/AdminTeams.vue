<template>
  <main class="p-4">
    <h3>Teams (Admin)</h3>

    <div class="card p-3 mb-3">
      <h5>Create team</h5>

      <div class="mb-2">
        <label class="form-label" for="admin-team-name">Name</label>
        <input
          id="admin-team-name"
          v-model="form.name"
          class="form-control"
          placeholder="Team name"
        />
      </div>

      <div class="mb-2">
        <label class="form-label" for="admin-team-description">Description</label>
        <input
          id="admin-team-description"
          v-model="form.description"
          class="form-control"
          placeholder="Description"
        />
      </div>

      <div class="mb-2">
        <label class="form-label" for="admin-team-manager">Manager</label>
        <select
          id="admin-team-manager"
          v-model.number="form.managerId"
          class="form-select"
        >
          <option :value="null">-- Select manager --</option>
          <option v-for="u in managers" :key="u.idUser" :value="u.idUser">
            {{ u.firstname }} {{ u.lastname }}
          </option>
        </select>
      </div>

      <div class="mb-2">
        <label class="form-label" for="admin-team-members">Members</label>
        <select
          id="admin-team-members"
          v-model="form.members"
          class="form-select"
          multiple
        >
          <option v-for="u in users" :key="u.idUser" :value="u.idUser">
            {{ u.firstname }} {{ u.lastname }}
          </option>
        </select>
        <small class="text-muted">Hold CTRL (or CMD) to select multiple members</small>
      </div>

      <div>
        <button class="btn btn-primary" @click="createTeam">Create</button>
      </div>
    </div>

    <table class="table table-sm">
      <thead>
        <tr><th>ID</th><th>Name</th><th>Manager</th><th>Members</th><th>Actions</th></tr>
      </thead>
      <tbody>
        <tr v-for="t in teams" :key="t.idTeam">
          <td>{{ t.idTeam }}</td>
          <td>{{ t.name }}</td>
          <td>{{ t.Users?.firstname }} {{ t.Users?.lastname }}</td>
          <td>{{ t._count?.TeamUser || 0 }}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary me-1" @click="editTeam(t)">Edit</button>
            <button class="btn btn-sm btn-danger" @click="deleteTeam(t.idTeam)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="editing" class="card p-3 mt-3">
      <h5>Edit Team {{ editing.name }}</h5>

      <div class="mb-2">
        <label class="form-label" for="admin-team-edit-name">Name</label>
        <input id="admin-team-edit-name" v-model="editForm.name" class="form-control" />
      </div>

      <div class="mb-2">
        <label class="form-label" for="admin-team-edit-description">Description</label>
        <input
          id="admin-team-edit-description"
          v-model="editForm.description"
          class="form-control"
        />
      </div>

      <div class="mb-2">
        <label class="form-label" for="admin-team-edit-manager">Manager</label>
        <select
          id="admin-team-edit-manager"
          v-model.number="editForm.managerId"
          class="form-select"
        >
          <option :value="null">-- Select manager --</option>
          <option v-for="u in managers" :key="u.idUser" :value="u.idUser">
            {{ u.firstname }} {{ u.lastname }}
          </option>
        </select>
      </div>

      <div class="mb-2">
        <label class="form-label" for="admin-team-edit-members">Members</label>
        <select
          id="admin-team-edit-members"
          v-model="editForm.members"
          class="form-select"
          multiple
        >
          <option v-for="u in users" :key="u.idUser" :value="u.idUser">
            {{ u.firstname }} {{ u.lastname }}
          </option>
        </select>
        <small class="text-muted">Selected members will replace current membership</small>
      </div>

      <div class="d-flex gap-2">
        <button class="btn btn-primary btn-sm" @click="saveEdit">Save</button>
        <button class="btn btn-secondary btn-sm" @click="cancelEdit">Cancel</button>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import teamsService from '../../services/teamsService.js';
import usersService from '../../services/usersService.js';
import { useToast } from '../../composables/useToast';

const toast = useToast();

const teams = ref([]);
const users = ref([]);
const managers = ref([]);
const form = ref({ name: '', description: '', managerId: null, members: [] });
const editing = ref(null);
const editForm = ref({ members: [] });

const fetch = async () => {
  teams.value = await teamsService.getAllTeams();
  users.value = await usersService.getAll();
  managers.value = users.value.filter((u) => u.profile === 'manager');
};

const createTeam = async () => {
  try {
    await teamsService.createTeam(
      form.value.name,
      form.value.description,
      form.value.managerId,
      form.value.members || []
    );
    form.value = { name: '', description: '', managerId: null, members: [] };
    await fetch();
    toast.success('Team created successfully');
  } catch (e) {
    console.error(e);
    toast.error('Error creating team');
  }
};

const editTeam = async (t) => {
  editing.value = t;
  // fetch full team to get members
  const full = await teamsService.getTeamById(t.idTeam);
  editForm.value = {
    name: full.name,
    description: full.description,
    managerId: full.managerId || null,
    members: full.TeamUser.map((tu) => tu.userId),
  };
};

const cancelEdit = () => {
  editing.value = null;
  editForm.value = { members: [] };
};

const saveEdit = async () => {
  try {
    await teamsService.updateTeam(editing.value.idTeam, editForm.value);
    await fetch();
    editing.value = null;
    toast.success('Team updated successfully');
  } catch (e) {
    console.error(e);
    toast.error('Error updating team');
  }
};

const deleteTeam = async (id) => {
  const ok = confirm('Delete team?');
  if (!ok) {
    return;
  }

  try {
    await teamsService.deleteTeam(id);
    await fetch();
    toast.success('Team deleted successfully');
  } catch (e) {
    console.error(e);
    toast.error('Error deleting team');
  }
};

onMounted(fetch);
</script>
