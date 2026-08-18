import api from './api';

// FE goi luc mount PaymentPage de khoi tao Braintree Drop-in UI. Khong can
// dang nhap (giong bookingService.createBooking).
export async function getClientToken() {
  const { data } = await api.get('/payments/client-token');
  return data.data.clientToken;
}

// Goi sau khi khach nhap the + hoan tat challenge 3D Secure qua Drop-in
// (dropinInstance.requestPaymentMethod()), nhan duoc paymentMethodNonce.
// Tra ket qua ngay trong response nay (Braintree la luong dong bo, khac VNPay
// truoc day can redirect + trang return rieng).
export async function checkout(bookingId, { paymentMethodNonce, deviceData }) {
  const { data } = await api.post(`/payments/${bookingId}/checkout`, { paymentMethodNonce, deviceData });
  return data.data;
}
