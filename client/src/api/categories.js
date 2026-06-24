import api from './axios';

export const getCategories = () => api.get('/api/categories').then((r) => r.data);

export const createCategory = (data) => api.post('/api/categories', data).then((r) => r.data);

export const updateCategory = (id, data) =>
  api.patch(`/api/categories/${id}`, data).then((r) => r.data);

export const deleteCategory = (id) => api.delete(`/api/categories/${id}`).then((r) => r.data);
