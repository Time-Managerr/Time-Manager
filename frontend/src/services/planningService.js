import { api } from "./api.js";
class Planning {
  async getByUserId(userId) {
    const response = await api.get(`/planning?userId=${userId}`);
    return response.data;
  }

  async getAll() {
    const response = await api.get('/planning');
    return response.data;
  }

  async createPlanning(payload) {
    const response = await api.post('/planning', payload);
    return response.data;
  }

  async updatePlanning(id, payload) {
    const response = await api.put(`/planning/${id}`, payload);
    return response.data;
  }

  async deletePlanning(id) {
    const response = await api.delete(`/planning/${id}`);
    return response.data;
  }
}

const planningInstance = new Planning();
export default planningInstance;