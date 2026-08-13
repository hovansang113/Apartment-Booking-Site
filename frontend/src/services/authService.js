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

// Hoi server "toi la ai" luc load trang - cookie httpOnly khong doc duoc tu JS
export async function getMe() {
  const { data } = await api.get('/auth/me');
  return data.data;
}

// Phai goi API de server tu xoa cookie httpOnly - JS khong tu xoa duoc
export async function logout() {
  await api.post('/auth/logout');
}

// Host "Settings" - nop mao so thue/giay to (mo phong theo Airbnb)
export async function updateTaxInfo(payload) {
  const { data } = await api.put('/auth/tax-info', payload);
  return data.data;
}
