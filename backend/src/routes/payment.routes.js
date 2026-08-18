const router = require('express').Router();
const paymentController = require('../controllers/payment.controller');

// Cong khai, khong can dang nhap - giong luon POST /bookings
router.get('/client-token', paymentController.getClientToken);
router.post('/:bookingId/checkout', paymentController.checkout);

// Braintree goi truc tiep (GET de xac minh URL luc dang ky, POST cho notification that)
router.get('/braintree-webhook', paymentController.verifyWebhook);
router.post('/braintree-webhook', paymentController.handleWebhook);

module.exports = router;
