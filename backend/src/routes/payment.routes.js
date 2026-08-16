const router = require('express').Router();
const paymentController = require('../controllers/payment.controller');

// REQ_07 Phase 3 - cong khai, khong can dang nhap
router.post('/:bookingId/create-url', paymentController.createUrl);

// Phase 4 - VNPay goi server-to-server (khong hoat dong tren localhost luc
// dev, can domain/ngrok that - xem comment trong payment.service.js)
router.get('/vnpay-ipn', paymentController.handleIpn);

// Phase 4 - trinh duyet khach goi khi quay ve trang VnpayReturnPage.jsx
router.get('/verify-return', paymentController.verifyReturn);

module.exports = router;
