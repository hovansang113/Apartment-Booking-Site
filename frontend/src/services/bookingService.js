import api from './api';

export async function createBooking(payload) {
  const { data } = await api.post('/bookings', payload);
  return data.data;
}

export async function getMyBookings() {
  const { data } = await api.get('/bookings/mine');
  return data.data;
}

export async function cancelBooking(id) {
  const { data } = await api.patch(`/bookings/${id}/cancel`);
  return data.data;
}
