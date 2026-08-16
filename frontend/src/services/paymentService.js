import api from './api';

// REQ_07 Phase 3 - tao URL redirect sang VNPay Sandbox cho 1 booking dang
// cho thanh toan. Khong can dang nhap (giong bookingService.createBooking).
export async function createPaymentUrl(bookingId, locale) {
  const { data } = await api.post(`/payments/${bookingId}/create-url`, { locale });
  return data.data.paymentUrl;
}

// Phase 4 - goi khi khach duoc VNPay redirect ve /booking/vnpay-return.
// `queryString` la nguyen query nhan duoc tu URL (vnp_*), forward thang cho
// backend verify chu ky + cap nhat trang thai (xem payment.service.js).
export async function verifyReturn(queryString) {
  const { data } = await api.get(`/payments/verify-return${queryString}`);
  return data.data;
}
