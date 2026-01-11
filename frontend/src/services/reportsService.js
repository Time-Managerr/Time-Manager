import { api } from "./api.js";
class Reports {
  async getAll() { const r = await api.get('/reports'); return r.data; }
  async create(payload) { const r = await api.post('/reports', payload); return r.data; }
  async update(id, payload) { const r = await api.put(`/reports/${id}`, payload); return r.data; }
  async delete(id) { const r = await api.delete(`/reports/${id}`); return r.data; }
}
export default new Reports();