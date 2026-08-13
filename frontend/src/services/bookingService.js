import api from './api';

// TAM THOI - ban toi gian cua REQ_07, chi du test REQ_09 (chong dat trung
// ngay bi chan). Xem comment backend/src/services/booking.service.js.
export async function createBooking({ listingId, checkIn, checkOut }) {
  const { data } = await api.post('/bookings', { listingId, checkIn, checkOut });
  return data.data;
}

// TODO: REQ_08, REQ_11 - goi API huy/tu choi booking
