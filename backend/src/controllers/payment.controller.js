const paymentService = require('../services/payment.service');
const { ok } = require('../utils/response.util');

// vnp_IpAddr yeu cau 7-45 ky tu (spec VNPay) - "::1" (IPv6 loopback luc dev
// local) chi co 3 ky tu nen se bi VNPay tu choi, phai quy ve dang IPv4.
function normalizeIp(ip) {
  if (ip === '::1' || ip === '::ffff:127.0.0.1') return '127.0.0.1';
  return ip.replace('::ffff:', '');
}

// REQ_07 Phase 3 - tao URL redirect sang VNPay Sandbox cho 1 booking dang
// cho thanh toan. Cong khai, khong can dang nhap (giong luon POST /bookings).
async function createUrl(req, res) {
  const { bookingId } = req.params;
  const { locale } = req.body;
  const paymentUrl = await paymentService.createPaymentUrl({
    bookingId,
    ipAddr: normalizeIp(req.ip),
    locale,
  });
  return ok(res, { paymentUrl });
}

// VNPay goi thang server-to-server (khong qua trinh duyet khach) - PHAI tra
// dung dinh dang {RspCode, Message} theo spec, khong dung response.util
// (khac format voi API thuong cua du an).
const IPN_RESPONSE_MAP = {
  invalid_signature: { RspCode: '97', Message: 'Invalid signature' },
  not_found: { RspCode: '01', Message: 'Order not found' },
  invalid_amount: { RspCode: '04', Message: 'Invalid amount' },
  already_processed: { RspCode: '02', Message: 'Order already confirmed' },
  ok: { RspCode: '00', Message: 'Confirm Success' },
};

async function handleIpn(req, res) {
  const result = await paymentService.confirmPayment(req.query);
  return res.status(200).json(IPN_RESPONSE_MAP[result.code] || { RspCode: '99', Message: 'Unknown error' });
}

// Trinh duyet khach goi khi VNPay redirect ve /booking/vnpay-return (FE goi
// API nay voi dung query string nhan duoc). Dung CHUNG logic voi handleIpn o
// tren - xem comment day du trong payment.service.js (confirmPayment).
async function verifyReturn(req, res) {
  const result = await paymentService.confirmPayment(req.query);
  return ok(res, result);
}

module.exports = { createUrl, handleIpn, verifyReturn };
