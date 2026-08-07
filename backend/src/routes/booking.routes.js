const router = require('express').Router();
const { UserRole } = require('@prisma/client');
const bookingController = require('../controllers/booking.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.post('/', authenticate, bookingController.create); // REQ_07 - mọi user đã đăng nhập
router.get('/mine', authenticate, bookingController.getMine); // REQ_07/11
router.patch('/:id/cancel', authenticate, bookingController.cancel); // REQ_11
router.patch('/:id/reject', authenticate, authorize(UserRole.host), bookingController.reject); // REQ_08
router.get('/listing/:listingId', authenticate, authorize(UserRole.host), bookingController.getListingBookings); // REQ_08

module.exports = router;
