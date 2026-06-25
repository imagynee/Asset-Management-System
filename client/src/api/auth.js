import api from './axios';

export const login = (username, password) =>
  api.post('/api/auth/login', { username, password }).then((r) => r.data);

export const changePassword = (currentPassword, newPassword) =>
  api.post('/api/auth/change-password', { currentPassword, newPassword }).then((r) => r.data);

