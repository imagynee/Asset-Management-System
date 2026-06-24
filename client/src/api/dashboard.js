import api from './axios';

export const getDashboard = () => api.get('/api/dashboard').then((r) => r.data);

export const getWarrantyAlerts = () =>
  api.get('/api/dashboard/warranty-alerts').then((r) => r.data);
