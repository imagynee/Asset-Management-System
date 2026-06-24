import api from './axios';

export const getVendors = () => api.get('/api/vendors').then((r) => r.data);

export const createVendor = (data) => api.post('/api/vendors', data).then((r) => r.data);

export const updateVendor = (id, data) =>
  api.patch(`/api/vendors/${id}`, data).then((r) => r.data);

export const deleteVendor = (id) => api.delete(`/api/vendors/${id}`).then((r) => r.data);
