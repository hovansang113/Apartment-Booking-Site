import api from './api';

export async function getAdminListings(status = 'pending', page = 1) {
  const { data } = await api.get('/admin/listings', { params: { status, page, limit: 20 } });
  return data.data;
}

export async function updateListingStatus(id, status, suspendReason) {
  const { data } = await api.patch(`/admin/listings/${id}/status`, { status, suspendReason });
  return data.data;
}
