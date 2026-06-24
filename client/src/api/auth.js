import api from './axios';

export const login = (username, password) =>
  api.post('/api/auth/login', { username, password }).then((r) => r.data);
