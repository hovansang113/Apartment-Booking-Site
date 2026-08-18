const paymentService = require('../services/payment.service');
const { ok } = require('../utils/response.util');

// Cong khai - FE goi luc mount PaymentPage de khoi tao Braintree Drop-in UI.
async function getClientToken(req, res) {
  const clientToken = await paymentService.generateClientToken();
  return ok(res, { clientToken });
}

// Cong khai (giong POST /bookings) - FE goi sau khi khach nhap the + hoan
// tat challenge 3D Secure qua Drop-in, nhan duoc paymentMethodNonce.
async function checkout(req, res) {
  const { bookingId } = req.params;
  const { paymentMethodNonce, deviceData } = req.body;
  const result = await paymentService.checkout({ bookingId, paymentMethodNonce, deviceData });
  return ok(res, result);
}

// Braintree goi GET 1 lan luc dang ky webhook URL trong Control Panel de xac
// minh quyen so huu endpoint - phai tra ve dung chuoi text (khong phai JSON).
async function verifyWebhook(req, res) {
  const response = paymentService.verifyWebhook(req.query.bt_challenge);
  return res.status(200).type('text/plain').send(response);
}

// Braintree goi POST server-to-server khi trang thai giao dich thay doi sau
// luc tao (settlement, dispute...). Luon tra 200 nhanh de Braintree khong
// retry lai lien tuc, ke ca khi notification khong khop giao dich nao trong
// he thong (xem comment trong payment.service.js#handleWebhook).
async function handleWebhook(req, res) {
  await paymentService.handleWebhook({ btSignature: req.body.bt_signature, btPayload: req.body.bt_payload });
  return res.status(200).send();
}

module.exports = { getClientToken, checkout, verifyWebhook, handleWebhook };
