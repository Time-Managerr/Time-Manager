<template>
  <main class="flex-fill p-4">
    <section class="teams">
      <!-- ===== HEADER ===== -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="fw-bold">Teams</h4>
      </div>

      <!-- ===== MAIN CARD ===== -->
      <div class="card shadow-sm border-0 p-4 rounded-3 mb-4">
        <h5 class="fw-semibold mb-2 text-primary">Team Management</h5>
        <p class="text-muted small mb-4">
          View, manage and organize all your teams in one place.
        </p>

        <!-- ===== TEAM LIST ===== -->
        <div v-if="teams.length" class="row g-4">
          <div v-for="(team, index) in teams" :key="index" class="col-lg-4 col-md-6 col-sm-12">
            <div class="team-card card border-0 shadow-sm p-4 h-100">
              <!-- Team header -->
              <div class="d-flex align-items-center justify-content-between mb-3">
                <div class="d-flex align-items-center">
                  <div class="team-icon me-3">👥</div>
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
                  <img :src="member.avatar" class="member-avatar me-2" alt="avatar" />
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
                  Manage
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
        </div>

        <!-- Empty state -->
        <div v-else class="text-center py-5 text-muted">
          <div class="display-6 mb-2">👥</div>
          No teams created yet.
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
              <img :src="member.avatar" class="member-avatar me-2" alt="avatar" />
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
                  <button
                    class="btn btn-sm btn-outline-secondary action-btn"
                    @click="openPlanningPopup(member)"
                  >
                    📅 Planning
                  </button>
                  <button
                    class="btn btn-sm btn-outline-secondary action-btn"
                    @click="openEditMemberPopup(member)"
                  >
                    ✏️ Edit
                  </button>
                </template>
                <button
                  class="btn btn-sm btn-outline-secondary action-btn"
                  @click="openViewMemberPopup(member)"
                >
                  👁️ View
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
            📅 Planning — {{ selectedMemberPlanning.name }}
          </h5>
          <button class="btn btn-light btn-sm" @click="closePlanningPopup">✖</button>
        </div>

        <div class="planning-box">
          <p v-for="day in workDays" :key="day"><strong>{{ day }}:</strong> 9:00 – 17:00</p>
        </div>

        <div v-if="userRole === 'manager'" class="text-end mt-4">
          <button class="btn btn-primary btn-sm">Save Changes</button>
        </div>
      </div>
    </div>

    <!-- ===== POPUP: VIEW MEMBER ===== -->
    <div v-if="selectedMemberView" class="popup-backdrop" @click.self="closeViewMemberPopup">
      <div class="popup-content smaller">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h5 class="fw-bold text-primary mb-0">👤 {{ selectedMemberView.name }}</h5>
          <button class="btn btn-light btn-sm" @click="closeViewMemberPopup">✖</button>
        </div>

        <div class="text-center">
          <img :src="selectedMemberView.avatar" class="member-avatar-lg mb-3" />
          <h6 class="fw-semibold">{{ selectedMemberView.role }}</h6>
          <p class="text-muted small mb-3">Joined on {{ selectedMemberView.date }}</p>
        </div>

        <hr />
        <p><strong>Email:</strong> {{ selectedMemberView.email }}</p>
        <p><strong>Phone:</strong> {{ selectedMemberView.phone }}</p>
        <p><strong>Status:</strong> Active</p>
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
          <div class="mb-3" v-for="(value, key) in editForm" :key="key">
            <label class="form-label fw-semibold text-capitalize">{{ key }}</label>
            <input v-model="editForm[key]" type="text" class="form-control" />
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

// Données réactives
const teams = ref([]);
const userRole = ref('employee'); // ou 'manager'
const selectedTeam = ref(null);
const selectedMemberView = ref(null);
const selectedMemberEdit = ref(null);
const selectedMemberPlanning = ref(null);
const editForm = ref({});

// Récupérer les équipes de l'utilisateur connecté
const fetchTeams = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.id) {
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

const openViewMemberPopup = (member) => {
  selectedMemberView.value = member;
};

const closeViewMemberPopup = () => {
  selectedMemberView.value = null;
};

const openEditMemberPopup = (member) => {
  selectedMemberEdit.value = member;
  editForm.value = { ...member }; // Copier les données pour édition
};

const closeEditMemberPopup = () => {
  selectedMemberEdit.value = null;
  editForm.value = {};
};

const openPlanningPopup = (member) => {
  selectedMemberPlanning.value = member;
};

const closePlanningPopup = () => {
  selectedMemberPlanning.value = null;
};

const deleteTeam = async (team) => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer l'équipe "${team.name}" ?`)) {
    try {
      await teamsService.deleteTeam(team.id);
      // Rafraîchir la liste des équipes
      await fetchTeams();
      alert('Équipe supprimée avec succès !');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de l\'équipe.');
    }
  }
};

const saveMemberChanges = () => {
  // TODO: implémenter la sauvegarde
  console.log('Sauvegarder les changements:', editForm.value);
  closeEditMemberPopup();
};

// Charger les données au montage du composant
onMounted(() => {
  fetchTeams();
});
</script>

<style scoped>
.teams {
  max-width: 1200px;
  margin: 0 auto;
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
  border: 1px solid #dee2e6;
}
.member-avatar-lg {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  border: 2px solid #dee2e6;
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

