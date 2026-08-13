const router = require('express').Router();
const bookingController = require('../controllers/booking.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { createBookingRules } = require('../validators/booking.validator');
const { validate } = require('../validators/validate.util');

// TAM THOI - ban toi gian, xem comment services/booking.service.js
router.post('/', authenticate, createBookingRules, validate, bookingController.create);

// router.get('/mine', ...);              // REQ_07/11
// router.patch('/:id/cancel', ...);      // REQ_11
// router.patch('/:id/reject', ...);      // REQ_08 - host huy 1 booking da approved

module.exports = router;
