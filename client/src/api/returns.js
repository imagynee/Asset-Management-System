import api from './axios';

export const getReturnHistory = () => api.get('/api/return').then((r) => r.data);
