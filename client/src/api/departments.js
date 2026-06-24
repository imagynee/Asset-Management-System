import api from './axios';

export const getDepartments = () => api.get('/api/departments').then((r) => r.data);

export const createDepartment = (data) => api.post('/api/departments', data).then((r) => r.data);

export const updateDepartment = (id, data) =>
  api.patch(`/api/departments/${id}`, data).then((r) => r.data);

export const deleteDepartment = (id) => api.delete(`/api/departments/${id}`).then((r) => r.data);
