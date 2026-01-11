import { api } from "./api.js";
class Roles {
  async getAll() {
    const r = await api.get('/roles');
    return r.data;
  }
  async create(name) {
    const r = await api.post('/roles', { name });
    return r.data;
  }
  async update(id, data) {
    const r = await api.put(`/roles/${id}`, data);
    return r.data;
  }
  async delete(id) {
    const r = await api.delete(`/roles/${id}`);
    return r.data;
  }
}
export default new Roles();