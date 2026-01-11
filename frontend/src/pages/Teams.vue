<template>
  <main class="flex-fill p-4">
    <section class="teams">
      <!-- PAGE TITLE -->
      <div class="page-header mb-4">
        <div class="d-flex align-items-center gap-3">
          <svg viewBox="0 0 24 24" class="page-icon" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <h3 class="page-title mb-0">Teams</h3>
        </div>
      </div>

      <!-- ===== MAIN CARD ===== -->
      <div class="card shadow-sm border-0 p-4 rounded-3 mb-4">
        <h5 class="fw-semibold mb-2 text-primary">Team Management</h5>
        <p class="text-muted small mb-4">
          View, manage and organize all your teams in one place.
        </p>

        <!-- ===== TEAM LIST ===== -->
        <div v-if="teams.length" class="row g-4">
          <!-- Existing Teams -->
          <div v-for="(team, index) in teams" :key="index" class="col-lg-4 col-md-6 col-sm-12">
            <div class="team-card card border-0 shadow-sm p-4 h-100">
              <!-- Team header -->
              <div class="d-flex align-items-center justify-content-between mb-3">
                <div class="d-flex align-items-center">
                  <div class="team-icon me-3" :style="{ background: `linear-gradient(135deg, ${getAvatarColor(team.name).from} 0%, ${getAvatarColor(team.name).to} 100%)` }">
                    <span class="initials">{{ getTeamInitials(team.name) }}</span>
                  </div>
                  <div>
                    <h6 class="fw-bold mb-0">{{ team.name }}</h6>
                    <small class="text-muted">{{ team.members.length }} members</small>
                  </div>
                </div>
              </div>

              <!-- Description -->
              <p class="small text-muted mb-3">{{ team.description }}</p>

              <!-- Members preview -->
              <div class="members mb-3">
                <div
                  v-for="(member, mIndex) in team.members.slice(0, 3)"
                  :key="mIndex"
                  class="d-flex align-items-center mb-2"
                >
                  <div class="member-avatar me-2" :style="{ background: `linear-gradient(135deg, ${getAvatarColor(member.name).from} 0%, ${getAvatarColor(member.name).to} 100%)` }">
                    <span class="initials">{{ getInitials(member.name) }}</span>
                  </div>
                  <div>
                    <span class="fw-medium">{{ member.name }}</span><br />
                    <small class="text-muted">{{ member.role }}</small>
                  </div>
                </div>
                <div v-if="team.members.length > 3" class="text-muted small">
                  +{{ team.members.length - 3 }} more
                </div>
              </div>

              <!-- Buttons -->
              <div class="d-flex justify-content-between mt-auto">
                <button class="btn btn-sm btn-outline-primary px-3" @click="openManagePopup(team)">
                  Details
                </button>
                <button
                  v-if="userRole === 'manager'"
                  class="btn btn-sm btn-outline-danger px-3"
                  @click="deleteTeam(team)"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>

          <!-- Create Team Card -->
          <div v-if="userRole === 'manager'" class="col-lg-4 col-md-6 col-sm-12">
            <div class="team-card create-team-card card border-0 shadow-sm p-4 h-100" @click="openCreateTeamPopup">
              <div class="create-team-content">
                <svg viewBox="0 0 24 24" class="create-team-icon" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <p class="create-team-text mt-3 mb-0">Create New Team</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else>
          <div v-if="userRole === 'manager'" class="row g-4">
            <div class="col-lg-4 col-md-6 col-sm-12">
              <div class="team-card create-team-card card border-0 shadow-sm p-4 h-100" @click="openCreateTeamPopup">
                <div class="create-team-content">
                  <svg viewBox="0 0 24 24" class="create-team-icon" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  <p class="create-team-text mt-3 mb-0">Create New Team</p>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-5 text-muted">
            <svg viewBox="0 0 24 24" class="page-icon" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2" style="width: 48px; height: 48px; display: block; margin: 0 auto 16px; opacity: 0.5;">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            No teams created yet.
          </div>
        </div>
      </div>
    </section>

    <!-- ===== POPUP: MANAGE TEAM ===== -->
    <div v-if="selectedTeam" class="popup-backdrop" @click.self="closeManagePopup">
      <div class="popup-content">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h5 class="fw-bold text-primary mb-0">{{ selectedTeam.name }}</h5>
          <button class="btn btn-light btn-sm" @click="closeManagePopup">▲</button>
        </div>

        <div class="manage-scroll">
          <div
            v-for="(member, index) in selectedTeam.members"
            :key="index"
            class="row align-items-center py-3 border-bottom manage-row"
          >
            <div class="col-12 col-md-2 text-muted small mb-2 mb-md-0">Member</div>

            <div class="col-12 col-md-4 d-flex align-items-center mb-2 mb-md-0">
              <div class="member-avatar me-2" :style="{ background: `linear-gradient(135deg, ${getAvatarColor(member.name).from} 0%, ${getAvatarColor(member.name).to} 100%)` }">
                <span class="initials">{{ getInitials(member.name) }}</span>
              </div>
              <span class="fw-semibold text-dark">{{ member.name }}</span>
            </div>

            <div class="col-6 col-md-2 mb-2 mb-md-0">
              <span class="badge label-soft">{{ member.role }}</span>
            </div>

            <div
              class="col-12 col-md-4 d-flex justify-content-md-end align-items-center gap-2 flex-wrap"
            >
              <span class="text-muted small">{{ member.date }}</span>
              <div class="d-flex gap-2">
                <template v-if="userRole === 'manager'">
                  <!-- Only allow editing/planning for employees (not other managers or admins) -->
                  <button
                    v-if="!(member.role && (member.role.toLowerCase() === 'manager' || member.role.toLowerCase() === 'admin'))"
                    class="btn btn-sm btn-outline-secondary action-btn d-flex align-items-center gap-2"
                    @click="openPlanningPopup(member)"
                  >
                    <svg viewBox="0 0 24 24" class="action-icon" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    Planning
                  </button>
                  <button
                    v-if="!(member.role && (member.role.toLowerCase() === 'manager' || member.role.toLowerCase() === 'admin'))"
                    class="btn btn-sm btn-outline-secondary action-btn d-flex align-items-center gap-2"
                    @click="openEditMemberPopup(member)"
                  >
                    <svg viewBox="0 0 24 24" class="action-icon" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Edit
                  </button>
                </template>
                <button
                  class="btn btn-sm btn-outline-secondary action-btn d-flex align-items-center gap-2"
                  @click="openViewMemberPopup(member)"
                >
                  <svg viewBox="0 0 24 24" class="action-icon" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  View
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== POPUP: PLANNING ===== -->
    <div v-if="selectedMemberPlanning" class="popup-backdrop" @click.self="closePlanningPopup">
      <div class="popup-content smaller">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h5 class="fw-bold text-primary mb-0">
            <svg viewBox="0 0 24 24" class="page-icon" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px; display: inline-block; margin-right: 8px;">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Planning — {{ selectedMemberPlanning.name }}
          </h5>
          <button class="btn btn-light btn-sm" @click="closePlanningPopup">✖</button>
        </div>

        <div class="planning-box">
          <div v-if="selectedMemberPlanning.planningsByDay?.length">
            <div
              v-for="(dayPlan, index) in selectedMemberPlanning.planningsByDay"
              :key="index"
              class="d-flex align-items-center justify-content-between mb-2 p-3 border rounded"
            >
              <div>
                <strong>{{ dayPlan.dayName }}</strong>
                <small class="text-muted d-block">{{ dayPlan.count }} occurrences</small>
              </div>

              <div class="d-flex gap-2 align-items-center">
                <label class="small text-muted" :for="`planning-start-${dayPlan.idPlanning ?? index}`">Start</label>
                <input
                  :id="`planning-start-${dayPlan.idPlanning ?? index}`"
                  type="time"
                  v-model="dayPlan.timeStart"
                  class="form-control form-control-sm"
                />

                <label class="small text-muted" :for="`planning-end-${dayPlan.idPlanning ?? index}`">End</label>
                <input
                  :id="`planning-end-${dayPlan.idPlanning ?? index}`"
                  type="time"
                  v-model="dayPlan.timeEnd"
                  class="form-control form-control-sm"
                />
              </div>
            </div>
          </div>
          <div v-else class="text-muted small">No planning entries found for this user.</div>
        </div>

        <div v-if="userRole === 'manager'" class="text-end mt-4">
          <button class="btn btn-primary btn-sm" @click="savePlanningsChanges">Save Changes</button>
        </div>
      </div>
    </div>

    <!-- ===== POPUP: VIEW MEMBER ===== -->
    <div v-if="selectedMemberView" class="popup-backdrop" @click.self="closeViewMemberPopup">
      <div class="popup-content smaller">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h5 class="fw-bold text-primary mb-0">
            <svg viewBox="0 0 24 24" class="page-icon" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px; display: inline-block; margin-right: 8px;">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            {{ selectedMemberView.name }}
          </h5>
          <button class="btn btn-light btn-sm" @click="closeViewMemberPopup">✖</button>
        </div>

        <div class="text-center">
          <div class="member-avatar-lg mb-3 mx-auto" :style="{ background: `linear-gradient(135deg, ${getAvatarColor(selectedMemberView.firstname + ' ' + selectedMemberView.lastname).from} 0%, ${getAvatarColor(selectedMemberView.firstname + ' ' + selectedMemberView.lastname).to} 100%)` }">
            <span class="initials-lg">{{ getInitials(selectedMemberView.firstname + ' ' + selectedMemberView.lastname) }}</span>
          </div>
          <h6 class="fw-semibold">{{ selectedMemberView.role }}</h6>
          <p class="text-muted small mb-3">Joined on {{ selectedMemberView.date }}</p>
        </div>

        <hr />
        <p><strong>Email:</strong> {{ selectedMemberView.email }}</p>
        <p><strong>Phone:</strong> {{ selectedMemberView.phone }}</p>
        <p><strong>Status:</strong> Active</p>
        <p v-if="selectedMemberView && selectedMemberView.latenessCount !== undefined"><strong>Lateness this month:</strong> {{ selectedMemberView.latenessCount }}</p>
        <div v-if="userRole === 'manager'" class="mt-3">
          <button class="btn btn-sm btn-outline-primary" @click="goToClocksHistory(selectedMemberView.idUser || selectedMemberView.id)">View History</button>
        </div>
      </div>
    </div>

    <!-- ===== POPUP: CREATE TEAM ===== -->
    <div v-if="showCreateTeamPopup" class="popup-backdrop" @click.self="closeCreateTeamPopup">
      <div class="popup-content smaller">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h5 class="fw-bold text-primary mb-0">➕ Create New Team</h5>
          <button class="btn btn-light btn-sm" @click="closeCreateTeamPopup">✖</button>
        </div>

        <form @submit.prevent="submitCreateTeam">
          <div class="mb-3">
            <label class="form-label fw-semibold" for="team-name">Team Name</label>
            <input
              id="team-name"
              v-model="newTeamForm.name"
              type="text"
              class="form-control"
              placeholder="Enter team name"
              required
            />
          </div>

          <div class="mb-3">
            <label class="form-label fw-semibold" for="team-description">Description</label>
            <textarea
              id="team-description"
              v-model="newTeamForm.description"
              class="form-control"
              rows="3"
              placeholder="Enter team description (optional)"
            ></textarea>
          </div>

          <div class="mb-3">
            <!-- ✅ FIX Sonar L335: label associé à un contrôle (groupe de checkboxes) -->
            <label id="add-members-label" class="form-label fw-semibold">Add Members</label>
            <small class="text-muted d-block mb-2">Select users to add to the team</small>

            <div
              class="border p-3 rounded"
              style="max-height: 250px; overflow-y: auto;"
              role="group"
              aria-labelledby="add-members-label"
            >
              <div v-if="allUsers.length === 0" class="text-muted small text-center py-3">
                No users available
              </div>
              <div v-for="user in allUsers" :key="user.id" class="form-check mb-2">
                <input
                  :id="`user-${user.id}`"
                  v-model="user.selected"
                  type="checkbox"
                  class="form-check-input"
                />
                <label :for="`user-${user.id}`" class="form-check-label">
                  <span class="fw-medium">{{ user.name }}</span>
                  <br />
                  <small class="text-muted">{{ user.email }} • {{ user.profile }}</small>
                </label>
              </div>
            </div>
          </div>

          <div class="text-end gap-2 d-flex justify-content-end">
            <button type="button" class="btn btn-secondary btn-sm" @click="closeCreateTeamPopup">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary btn-sm">Create Team</button>
          </div>
        </form>
      </div>
    </div>

    <!-- ===== POPUP: EDIT MEMBER ===== -->
    <div v-if="selectedMemberEdit" class="popup-backdrop" @click.self="closeEditMemberPopup">
      <div class="popup-content smaller">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h5 class="fw-bold text-primary mb-0">
            ✏️ Edit — {{ selectedMemberEdit.name }}
          </h5>
          <button class="btn btn-light btn-sm" @click="closeEditMemberPopup">✖</button>
        </div>

        <form @submit.prevent="saveMemberChanges">
          <div class="mb-3">
            <label class="form-label fw-semibold" for="edit-firstname">First name</label>
            <input id="edit-firstname" v-model="editForm.firstname" type="text" class="form-control" required />
          </div>

          <div class="mb-3">
            <label class="form-label fw-semibold" for="edit-lastname">Last name</label>
            <input id="edit-lastname" v-model="editForm.lastname" type="text" class="form-control" required />
          </div>

          <div class="mb-3">
            <label class="form-label fw-semibold" for="edit-email">Email</label>
            <input id="edit-email" v-model="editForm.email" type="email" class="form-control" required />
          </div>

          <div class="mb-3">
            <label class="form-label fw-semibold" for="edit-phone">Phone</label>
            <input id="edit-phone" v-model="editForm.phone" type="text" class="form-control" />
          </div>

          <div class="mb-3">
            <label class="form-label fw-semibold" for="edit-role">Role</label>
            <select id="edit-role" v-model="editForm.profile" class="form-select">
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </select>
          </div>

          <div class="text-end">
            <button type="submit" class="btn btn-primary btn-sm">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import teamsService from '../services/teamsService.js';
import { useToast } from '../composables/useToast';

const toast = useToast();

// Données réactives
const teams = ref([]);
const userRole = ref('employee'); // Défini dynamiquement dans fetchTeams() selon user.profile
const selectedTeam = ref(null);
const selectedMemberView = ref(null);
const selectedMemberEdit = ref(null);
const selectedMemberPlanning = ref(null);
const editForm = ref({});
const showCreateTeamPopup = ref(false);
const allUsers = ref([]);
const newTeamForm = ref({
  name: '',
  description: '',
  members: []
});

// Récupérer les équipes de l'utilisateur connecté
const fetchTeams = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.id) {
      const profile = (user.profile || '').toString().toLowerCase();

      if (profile === 'manager') userRole.value = 'manager';
      else if (profile === 'admin') userRole.value = 'admin';
      else userRole.value = 'employee';

      const data = await teamsService.getTeamsByUserId(user.id);
      teams.value = data;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des équipes:', error);
  }
};

// Gestion des popups
const openManagePopup = (team) => {
  selectedTeam.value = team;
};

const closeManagePopup = () => {
  selectedTeam.value = null;
};

import usersService from '../services/usersService.js';
import { useRouter } from 'vue-router';
const router = useRouter();

const openViewMemberPopup = async (member) => {
  try {
    const data = await usersService.getById(member.id || member.idUser || member.idUser);
    selectedMemberView.value = data;
  } catch (err) {
    console.error('Erreur lors de la récupération du membre:', err);
    selectedMemberView.value = member;
  }
};

const closeViewMemberPopup = () => {
  selectedMemberView.value = null;
};

const goToClocksHistory = (userId) => {
  router.push(`/clocks/${userId}`);
};

const openEditMemberPopup = (member) => {
  selectedMemberEdit.value = member;
  const parts = (member.name || '').trim().split(' ');
  editForm.value = {
    firstname: parts.shift() || '',
    lastname: parts.join(' ') || '',
    email: member.email || '',
    phone: member.phone || '',
    profile: (member.role || 'employee').toString().toLowerCase()
  };
};

const closeEditMemberPopup = () => {
  selectedMemberEdit.value = null;
  editForm.value = {};
};

import planningService from '../services/planningService.js';

const openPlanningPopup = async (member) => {
  const role = (member.role || '').toString().toLowerCase();
  if (role === 'manager' || role === 'admin') {
    toast.warning('You cannot edit the planning of managers or admins.');
    return;
  }

  try {
    const templates = await planningService.getByUserId(member.id);

    // Backend stores dayOfWeek with Monday=1..Friday=5 (0 is Sunday). Map to UI Monday=0..Sunday=6.
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const planningsByDay = templates
      .map(t => {
        const raw = t.dayOfWeek ?? 0;
        const mappedDay = (raw + 6) % 7; // convert: 1->0 (Mon), 2->1, ..., 5->4, 0->6 (Sun)
        return {
          idPlanning: t.idPlanning,
          dayOfWeek: mappedDay,
          dayName: dayNames[mappedDay],
          timeStart: timeFromISO(t.startTime),
          timeEnd: timeFromISO(t.endTime)
        };
      })
      .sort((a, b) => a.dayOfWeek - b.dayOfWeek);

    selectedMemberPlanning.value = {
      ...member,
      planningsByDay
    };
  } catch (err) {
    console.error('Erreur lors de la récupération des plannings:', err);
    toast.error('Unable to retrieve member planning templates.');
  }
};

const closePlanningPopup = () => {
  selectedMemberPlanning.value = null;
};

// Helpers for time/date handling
const timeFromISO = (iso) => {
  if (!iso) return '09:00';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '09:00';
  const hours = String(d.getUTCHours()).padStart(2, '0');
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const savePlanningsChanges = async () => {
  if (!selectedMemberPlanning.value || !selectedMemberPlanning.value.planningsByDay) return;
  try {
    const updates = [];

    for (const dayPlan of selectedMemberPlanning.value.planningsByDay) {
      updates.push(
        planningService.updatePlanning(dayPlan.idPlanning, {
          startTime: dayPlan.timeStart,
          endTime: dayPlan.timeEnd
        })
      );
    }

    if (updates.length === 0) {
      toast.warning('No planning templates to update.');
      return;
    }

    await Promise.all(updates);
    toast.success(`Successfully updated ${updates.length} planning template(s)`);
    closePlanningPopup();
    await fetchTeams();
  } catch (err) {
    console.error('Erreur lors de la sauvegarde des plannings:', err);
    toast.error('Error saving planning templates: ' + (err.response?.data?.error || err.message));
  }
};

const deleteTeam = async (team) => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer l'équipe "${team.name}" ?`)) {
    try {
      await teamsService.deleteTeam(team.id);
      await fetchTeams();
      toast.success('Team deleted successfully!');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Error deleting team.');
    }
  }
};

/**
 * ✅ FIX Sonar L658: remplace l’IIFE par une fonction lisible
 */
function pickUserUpdatePayload(payload) {
  const { firstname, lastname, email, phone, profile } = payload;
  return { firstname, lastname, email, phone, profile };
}

const saveMemberChanges = async () => {
  try {
    if (!selectedMemberEdit.value) return;

    const currentUser = JSON.parse(localStorage.getItem('user')) || {};
    const currentRole = (currentUser.profile || '').toString().toLowerCase();
    const targetRole = (selectedMemberEdit.value.role || '').toString().toLowerCase();
    if (
      currentRole === 'manager' &&
      (targetRole === 'manager' || targetRole === 'admin') &&
      selectedMemberEdit.value.id !== currentUser.id
    ) {
      toast.warning('You are not allowed to edit this user.');
      return;
    }

    const payload = { ...editForm.value };

    payload.firstname = (payload.firstname || '').trim();
    payload.lastname = (payload.lastname || '').trim();
    payload.email = (payload.email || '').trim();

    if (payload.phone !== undefined && payload.phone !== null && String(payload.phone).trim() !== '') {
      payload.phone = Number.parseInt(String(payload.phone).trim(), 10);
    }

    payload.profile = (payload.profile || 'employee').toString().toLowerCase();

    if (currentRole === 'manager' && payload.profile === 'admin') {
      toast.warning('You cannot promote a user to admin.');
      return;
    }

    const allowed = pickUserUpdatePayload(payload);

    await usersService.update(selectedMemberEdit.value.id, allowed);
    toast.success('Member updated successfully!');
    closeEditMemberPopup();
    await fetchTeams();
  } catch (err) {
    console.error('Erreur lors de la mise à jour du membre:', err);
    toast.error(err?.response?.data?.error || 'Error updating member.');
  }
};

const openCreateTeamPopup = () => {
  showCreateTeamPopup.value = true;
  newTeamForm.value = { name: '', description: '', members: [] };
  fetchAllUsers();
};

const fetchAllUsers = async () => {
  try {
    const users = await teamsService.getAllUsers();
    const currentUser = JSON.parse(localStorage.getItem('user'));
    allUsers.value = users
      .filter(u => u.idUser !== currentUser.id)
      .map(u => ({
        id: u.idUser,
        name: `${u.firstname} ${u.lastname}`,
        email: u.email,
        profile: u.profile,
        selected: false
      }));
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
  }
};

const closeCreateTeamPopup = () => {
  showCreateTeamPopup.value = false;
  newTeamForm.value = { name: '', description: '', members: [] };
};

function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(' ').filter(p => p.length > 0);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getTeamInitials(teamName) {
  if (!teamName) return '??';
  const parts = teamName.trim().split(' ').filter(p => p.length > 0);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}

function getAvatarColor(name) {
  if (!name) return { from: '#6c757d', to: '#495057' };

  const colors = [
    { from: '#1b93b1', to: '#2ca9bc' },
    { from: '#e74c3c', to: '#c0392b' },
    { from: '#3498db', to: '#2980b9' },
    { from: '#2ecc71', to: '#27ae60' },
    { from: '#f39c12', to: '#e67e22' },
    { from: '#9b59b6', to: '#8e44ad' },
    { from: '#1abc9c', to: '#16a085' },
    { from: '#e91e63', to: '#c2185b' },
    { from: '#ff9800', to: '#f57c00' },
    { from: '#607d8b', to: '#455a64' }
  ];

  // ✅ FIX Sonar L739: éviter l’assignation manuelle de i (i += 1)
  // On itère proprement sur les code points pour gérer les surrogates.
  let hash = 0;
  let i = 0;
  while (i < name.length) {
    const cp = name.codePointAt(i);
    if (cp !== undefined) {
      hash = cp + ((hash << 5) - hash);
      i += cp > 0xffff ? 2 : 1;
    } else {
      i++;
    }
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

const submitCreateTeam = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) {
      toast.error('User not found');
      return;
    }

    const selectedMemberIds = allUsers.value
      .filter(u => u.selected)
      .map(u => u.id);

    const teamData = {
      name: newTeamForm.value.name,
      description: newTeamForm.value.description,
      managerId: user.id,
      members: selectedMemberIds
    };

    await teamsService.createTeam(
      teamData.name,
      teamData.description,
      teamData.managerId,
      teamData.members
    );

    toast.success('Team created successfully!');
    closeCreateTeamPopup();
    await fetchTeams();
  } catch (error) {
    console.error('Erreur lors de la création:', error);
    toast.error('Error creating team: ' + error.message);
  }
};

onMounted(() => {
  fetchTeams();
});
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

.teams {
  max-width: 1200px;
  margin: 0 auto;
}

/* --- Icons --- */
.icon-plus {
  width: 18px;
  height: 18px;
}

.action-icon {
  width: 16px;
  height: 16px;
  color: #1b93b1;
}

.action-btn:hover .action-icon {
  color: #1b93b1;
}

/* --- Team Card --- */
.team-card {
  border-radius: 14px;
  background: #fff;
  display: flex;
  flex-direction: column;
  transition: all 0.25s ease;
}
.team-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
}

/* --- Create Team Card --- */
.create-team-card {
  cursor: pointer;
  border: 2px dashed #d0d0d0 !important;
  background: #fafafa !important;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.create-team-card:hover {
  border-color: #1b93b1 !important;
  background: #f0f9fb !important;
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 8px 24px rgba(27, 147, 177, 0.15);
}

.create-team-content {
  text-align: center;
  transition: all 0.3s ease;
}

.create-team-card:hover .create-team-content {
  transform: scale(1.1);
}

.create-team-icon {
  width: 64px;
  height: 64px;
  color: #c0c0c0;
  margin: 0 auto;
  display: block;
  transition: all 0.3s ease;
}

.create-team-card:hover .create-team-icon {
  color: #1b93b1;
  transform: rotate(90deg);
}

.create-team-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: #999;
  transition: all 0.3s ease;
}

.create-team-card:hover .create-team-text {
  color: #1b93b1;
}

.team-icon {
  background: #0d6efd;
  color: #fff;
  border-radius: 50%;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* --- Member Avatars --- */
.member-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.member-avatar .initials {
  color: white;
  font-weight: 600;
  font-size: 14px;
  user-select: none;
}

.member-avatar-lg {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.member-avatar-lg .initials-lg {
  color: white;
  font-weight: 600;
  font-size: 36px;
  user-select: none;
}

/* --- Popup --- */
.popup-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(3px);
  z-index: 1050;
}
.popup-content {
  background: #fff;
  border: 2px solid #a68bf0;
  border-radius: 14px;
  padding: 1.5rem 2rem;
  width: 1100px;
  max-width: 95%;
  max-height: 80vh;
  overflow-y: auto;
}
.popup-content.smaller {
  width: 650px;
  max-height: 70vh;
}

/* --- UI Elements --- */
.label-soft {
  background: #eaf9ee;
  color: #2e7d32;
  padding: 0.25rem 0.55rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
}
.action-btn {
  border-radius: 8px;
  font-size: 0.85rem;
  padding: 0.35rem 0.6rem;
}
.planning-box {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 10px;
  padding: 1rem 1.25rem;
}
</style>
