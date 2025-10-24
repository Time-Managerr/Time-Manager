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

   async getByUserId(userId) {
    const response = await api.get(`/clocks/user/${userId}`);
    return response.data;
  }

  // ClockOut : mettre à jour le pointage avec l'heure de sortie
  async clockOut(userId, clockOut) {
    const clocks = await this.getByUserId(userId);
    const lastClock = clocks.sort((a, b) => b.idClock - a.idClock)[0];

    if (!clocks || clocks.length === 0) {
      throw new Error("Aucun pointage trouvé pour cet utilisateur !");
    }

    const response = await api.put(`/clocks/${lastClock.idClock}/clockout`, { clockOut });
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
