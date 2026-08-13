import api from './api';

export async function getMonthView(listingId, year, month) {
  const { data } = await api.get(`/calendar/${listingId}`, { params: { year, month } });
  return data.data;
}

export async function blockDates(listingId, dates, note) {
  const { data } = await api.post(`/calendar/${listingId}/block`, { dates, note });
  return data.data;
}

export async function unblockDates(listingId, dates) {
  const { data } = await api.post(`/calendar/${listingId}/unblock`, { dates });
  return data.data;
}

export async function setPriceOverride(listingId, date, price) {
  const { data } = await api.put(`/calendar/${listingId}/price`, { date, price });
  return data.data;
}

export async function setStayRule(listingId, date, minNights, maxNights) {
  const { data } = await api.put(`/calendar/${listingId}/stay-rule`, { date, minNights, maxNights });
  return data.data;
}

export async function listSyncSources(listingId) {
  const { data } = await api.get(`/calendar/${listingId}/sync`);
  return data.data;
}

export async function connectSyncSource(listingId, icalUrl, label) {
  const { data } = await api.post(`/calendar/${listingId}/sync`, { icalUrl, label });
  return data.data;
}

export async function refreshSyncSource(listingId, syncId) {
  const { data } = await api.post(`/calendar/${listingId}/sync/${syncId}/refresh`);
  return data.data;
}

export async function updateSyncSource(listingId, syncId, { icalUrl, label }) {
  const { data } = await api.put(`/calendar/${listingId}/sync/${syncId}`, { icalUrl, label });
  return data.data;
}

export async function removeSyncSource(listingId, syncId) {
  const { data } = await api.delete(`/calendar/${listingId}/sync/${syncId}`);
  return data.data;
}
