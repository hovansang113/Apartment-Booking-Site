import api from './api';

export async function getPriceOverrides(listingId, year, month) {
  const { data } = await api.get(`/pricing/${listingId}`, { params: { year, month } });
  return data.data;
}

export async function setPriceOverrides(listingId, overrides) {
  const { data } = await api.post(`/pricing/${listingId}`, { overrides });
  return data.data;
}

export async function deletePriceOverride(listingId, date) {
  const { data } = await api.delete(`/pricing/${listingId}`, { data: { date } });
  return data.data;
}
