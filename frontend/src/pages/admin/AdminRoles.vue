<template>
  <main class="p-4">
    <h3>Roles (Admin)</h3>
    <div class="card p-3 mb-3">
      <div class="row g-2">
        <div class="col-8">
          <input v-model="name" class="form-control" placeholder="Role name" />
        </div>
        <div class="col-4">
          <button class="btn btn-primary btn-sm" @click="create">Create</button>
        </div>
      </div>
    </div>

    <table class="table table-sm">
      <thead>
        <tr><th>ID</th><th>Name</th><th>Actions</th></tr>
      </thead>
      <tbody>
        <tr v-for="r in roles" :key="r.idRole">
          <td>{{ r.idRole }}</td>
          <td v-if="editing !== r.idRole">{{ r.name }}</td>
          <td v-else>
            <input v-model="editName" class="form-control form-control-sm" />
          </td>
          <td>
            <button
              v-if="editing !== r.idRole"
              class="btn btn-sm btn-outline-primary me-1"
              @click="startEdit(r)"
            >
              Edit
            </button>
            <button
              v-else
              class="btn btn-sm btn-primary me-1"
              @click="saveEdit(r)"
            >
              Save
            </button>
            <button class="btn btn-sm btn-danger" @click="deleteRole(r.idRole)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import rolesService from '../../services/rolesService.js';

const roles = ref([]);
const name = ref('');
const editing = ref(null);
const editName = ref('');

const fetch = async () => {
  roles.value = await rolesService.getAll();
};

const create = async () => {
  await rolesService.create(name.value);
  name.value = '';
  await fetch();
};

const startEdit = (r) => {
  editing.value = r.idRole;
  editName.value = r.name;
};

const saveEdit = async (r) => {
  await rolesService.update(r.idRole, { name: editName.value });
  editing.value = null;
  await fetch();
};

const deleteRole = async (id) => {
  const ok = confirm('Delete?');
  if (!ok) {
    return;
  }

  await rolesService.delete(id);
  await fetch();
};

onMounted(fetch);
</script>
