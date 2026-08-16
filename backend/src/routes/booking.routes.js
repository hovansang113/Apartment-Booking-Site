const router = require('express').Router();
const bookingController = require('../controllers/booking.controller');
const { createBookingRules } = require('../validators/booking.validator');
const { validate } = require('../validators/validate.util');

// REQ_07 - cong khai, KHONG can dang nhap (khach dat phong tu do, xem
// comment day du trong services/booking.service.js).
router.post('/', createBookingRules, validate, bookingController.create);

// Cong khai (UUID khong doan duoc) - dung cho trang thanh toan rieng
router.get('/:id', bookingController.getOne);

// router.get('/mine', ...);              // REQ_07/11
// router.patch('/:id/cancel', ...);      // REQ_11
// router.patch('/:id/reject', ...);      // REQ_08 - host huy 1 booking da approved

module.exports = router;
