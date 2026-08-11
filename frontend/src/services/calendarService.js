import api from './api';

export async function getCalendar(listingId, year, month) {
  const { data } = await api.get(`/calendar/${listingId}`, { params: { year, month } });
  return data.data;
}

export async function blockDates(listingId, dates) {
  const { data } = await api.post(`/calendar/${listingId}/block`, { dates });
  return data.data;
}

export async function unblockDates(listingId, dates) {
  const { data } = await api.delete(`/calendar/${listingId}/block`, { data: { dates } });
  return data.data;
}
