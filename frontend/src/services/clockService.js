// src/services/clock.js
import { api } from "./api.js";
class Clock {
  // Clock-in : créer un nouveau pointage
  async clockIn(userId, clockIn) {
    const response = await api.post("/clocks", {
      userId,
      clockIn,
    });
    return response.data;
  }

// Récupérer les clocks d’un utilisateur
async getByUserId(userId) {
  const response = await api.get(`/clocks/user/${userId}`);
  return response.data;
}

// Mettre à jour un clock précis
async clockOut(idClock, clockOut) {
  const response = await api.put(`/clocks/${idClock}/clockout`, { clockOut });
  return response.data;
}

  // Récupérer tous les pointages
  async getAll() {
    const response = await api.get("/clocks");
    return response.data;
  }
}

const clockInstance = new Clock();
export default clockInstance;
