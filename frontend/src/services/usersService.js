import { api } from "./api.js";
class Users {
  async getAll() { const r = await api.get('/users'); return r.data; }
  async getById(id) { const r = await api.get(`/users/${id}`); return r.data; }
  async create(payload) { const r = await api.post('/users', payload); return r.data; }
  async update(id, payload) { const r = await api.put(`/users/${id}`, payload); return r.data; }
  async delete(id) { const r = await api.delete(`/users/${id}`); return r.data; }
}
export default new Users();