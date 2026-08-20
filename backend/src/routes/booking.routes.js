const router = require('express').Router();
const { UserRole } = require('@prisma/client');
const bookingController = require('../controllers/booking.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { createBookingRules } = require('../validators/booking.validator');
const { validate } = require('../validators/validate.util');

// REQ_07 - cong khai, KHONG can dang nhap (khach dat phong tu do, xem
// comment day du trong services/booking.service.js).
router.post('/', createBookingRules, validate, bookingController.create);

// Cho HostTodayPage - phai dung TRUOC /:id, khong thi Express se hieu "mine"
// la 1 gia tri :id.
router.get('/mine', authenticate, authorize(UserRole.host), bookingController.getMine);

// Cong khai (UUID khong doan duoc) - dung cho trang thanh toan rieng
router.get('/:id', bookingController.getOne);

// router.patch('/:id/cancel', ...);      // REQ_11
// router.patch('/:id/reject', ...);      // REQ_08 - host huy 1 booking da approved

module.exports = router;
