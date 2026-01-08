// src/services/teamService.js
import { api } from "./api.js";
class Team {
  //  créer une nouvelle team
  async createTeam(name, description, managerId, members) {
    const response = await api.post("/teams", {
      name,
      description,
      managerId,
      members
    });
    return response.data;
  }

// Récupérer les teams d’un utilisateur
    async getTeamsByUserId(userId) {
  const response = await api.get(`/teams/user/${userId}`);
  // Transformer les données pour correspondre au format attendu par le template
  const teams = response.data.map(team => ({
    id: team.idTeam,
    name: team.name,
    description: team.description,
    manager: {
      id: team.Users.idUser,
      name: `${team.Users.firstname} ${team.Users.lastname}`,
      email: team.Users.email,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(team.Users.firstname + ' ' + team.Users.lastname)}&background=random`
    },
    members: team.TeamUser.map(tu => ({
      id: tu.Users.idUser,
      name: `${tu.Users.firstname} ${tu.Users.lastname}`,
      email: tu.Users.email,
      role: tu.Users.profile || 'Member',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(tu.Users.firstname + ' ' + tu.Users.lastname)}&background=random`,
      date: '2024-01-01', // TODO: ajouter date d'adhésion si disponible
      phone: tu.Users.phone || 'N/A'
    }))
  }));
  return teams;
    }

// Récupérer une team précise par son ID
    async getTeamById(idTeam) {
  const response = await api.get(`/teams/${idTeam}`);
  return response.data;
    }

  // Récupérer toutes les teams
    async getAllTeams() {
    const response = await api.get("/teams");
    return response.data;
    }

// Mettre à jour une team précis
    async updateTeam(idTeam, updates) {
  const response = await api.put(`/teams/${idTeam}`, updates);
  return response.data;
    }

    // Ajouter des membres à une équipe
    async addMembersToTeam(idTeam, memberIds) {
  const response = await api.put(`/teams/${idTeam}`, {
    members: memberIds
  });
  return response.data;
    }

    // Supprimer une team par son ID
    async deleteTeam(idTeam) {
  const response = await api.delete(`/teams/${idTeam}`);
  return response.data;
    }
}

const teamInstance = new Team();
export default teamInstance;