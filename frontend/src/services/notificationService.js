import api from './api';

export async function getMyNotifications() {
  const { data } = await api.get('/notifications');
  return data.data;
}

export async function markRead(id) {
  const { data } = await api.patch(`/notifications/${id}/read`);
  return data.data;
}

export async function markAllRead() {
  await api.patch('/notifications/read-all');
}
