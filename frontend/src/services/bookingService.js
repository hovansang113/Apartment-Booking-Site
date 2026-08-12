import api from './api';

export async function createBooking(payload) {
  const { data } = await api.post('/bookings', payload);
  return data.data;
}

export async function createGuestBooking(payload) {
  const { data } = await api.post('/bookings/guest', payload);
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

export async function getBookingByGuestToken(token) {
  const { data } = await api.get(`/bookings/guest/${token}`);
  return data.data;
}

export async function cancelBookingByGuestToken(token) {
  const { data } = await api.delete(`/bookings/guest/${token}`);
  return data.data;
}
