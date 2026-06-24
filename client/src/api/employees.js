import api from './axios';

export const getEmployees = (params) =>
  api.get('/api/employees', { params }).then((r) => r.data);

export const getEmployeeById = (id) => api.get(`/api/employees/${id}`).then((r) => r.data);

export const getEmployeeHistory = (id) =>
  api.get(`/api/employees/${id}/history`).then((r) => r.data);

export const createEmployee = (formData) =>
  api.post('/api/employees', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);

export const assignAssets = (employeeId, assetIds) =>
  api.patch('/api/employees/assign', { employeeId, assetIds }).then((r) => r.data);

export const updateEmployee = (id, formData) =>
  api.patch(`/api/employees/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);

export const deleteEmployee = (id) => api.delete(`/api/employees/${id}`).then((r) => r.data);
