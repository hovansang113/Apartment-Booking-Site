import api from './api';

// REQ_07 - dat phong khong can dang nhap, gui thang thong tin lien he. Tra
// ve booking o trang thai pending_payment (chua thanh toan that - Phase 3
// se noi VNPay), kem bookingCode de khach tra cuu/huy sau nay.
export async function createBooking({ listingId, checkIn, checkOut, contactName, contactEmail, contactPhone }) {
  const { data } = await api.post('/bookings', {
    listingId,
    checkIn,
    checkOut,
    contactName,
    contactEmail,
    contactPhone: contactPhone || undefined,
  });
  return data.data;
}

// TODO: REQ_08, REQ_11 - goi API huy/tu choi booking (Phase 7)
