import api from './api';

export async function getPendingListings() {
  const { data } = await api.get('/admin/listings', { params: { status: 'pending' } });
  return data.data;
}

export async function getListings(status) {
  const { data } = await api.get('/admin/listings', { params: status ? { status } : {} });
  return data.data;
}

export async function approveListing(id) {
  const { data } = await api.patch(`/admin/listings/${id}/approve`);
  return data.data;
}

export async function suspendListing(id, reason) {
  const { data } = await api.patch(`/admin/listings/${id}/suspend`, { reason });
  return data.data;
}

export async function getUsers() {
  const { data } = await api.get('/admin/users');
  return data.data;
}

export async function lockUser(id, reason) {
  const { data } = await api.patch(`/admin/users/${id}/lock`, { reason });
  return data.data;
}

export async function unlockUser(id) {
  const { data } = await api.patch(`/admin/users/${id}/unlock`);
  return data.data;
}

export async function getTaxVerifications() {
  const { data } = await api.get('/admin/tax-verifications');
  return data.data;
}

export async function reviewTaxInfo(id, status, note) {
  const { data } = await api.patch(`/admin/tax-verifications/${id}`, { status, note });
  return data.data;
}
