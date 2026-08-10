import api from './api';

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  return data.data;
}

export async function register(payload) {
  const { data } = await api.post('/auth/register', payload);
  return data.data;
}

export async function guestLogin({ email, fullName, phone }) {
  const { data } = await api.post('/auth/guest-login', { email, fullName, phone });
  return data.data;
}
