const router = require('express').Router();
const { authenticate } = require('../middlewares/auth.middleware');
const paymentController = require('../controllers/payment.controller');

router.get('/:bookingId', authenticate, paymentController.getPayment); // lấy info để hiển thị
router.post('/:bookingId/confirm', authenticate, paymentController.confirmPayment); // REQ_10

module.exports = router;
