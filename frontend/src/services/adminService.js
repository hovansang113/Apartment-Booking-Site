import api from './api';

export async function getAdminListings(status = 'pending', page = 1) {
  const { data } = await api.get('/admin/listings', { params: { status, page, limit: 20 } });
  return data.data;
}

export async function updateListingStatus(id, status, suspendReason) {
  const { data } = await api.patch(`/admin/listings/${id}/status`, { status, suspendReason });
  return data.data;
}

export async function getAdminUsers(params = {}) {
  const { data } = await api.get('/admin/users', { params });
  return data.data;
}

export async function updateUserStatus(id, status) {
  const { data } = await api.patch(`/admin/users/${id}/status`, { status });
  return data.data;
}

export async function getAdminStats(period = 'month') {
  const { data } = await api.get('/admin/stats', { params: { period } });
  return data.data;
}
