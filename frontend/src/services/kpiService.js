import { api } from './api.js';

export default {
  create(kpi) { return api.post('/kpis', kpi); },
  list() { return api.get('/kpis'); },
  results(id, params) { return api.get(`/kpis/${id}/results`, { params }); },
  export(id, params) { return api.get(`/kpis/${id}/export`, { params }); },
  compute(payload) { return api.post('/kpis/compute', payload); }
};
