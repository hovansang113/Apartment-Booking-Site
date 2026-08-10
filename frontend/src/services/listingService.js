import api from './api';

export async function getPublicListings({ category, page } = {}) {
  try {
    const { data } = await api.get('/listings', { params: { category, page } });
    return data.data;
  } catch (err) {
    return { listings: [], total: 0 };
  }
}

export async function getHostListings() {
  const { data } = await api.get('/listings/mine');
  return data.data;
}

export async function createListing(formData) {
  const { data } = await api.post('/listings', formData);
  return data.data;
}

export async function updateListing(id, payload) {
  const { data } = await api.put(`/listings/${id}`, payload);
  return data.data;
}

export async function deleteListing(id) {
  const { data } = await api.delete(`/listings/${id}`);
  return data.data;
}
