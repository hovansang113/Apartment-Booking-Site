const { body } = require('express-validator');

const createBookingRules = [
  body('listingId').isUUID().withMessage('listingId không hợp lệ'),
  body('checkIn')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('checkIn phải theo định dạng YYYY-MM-DD'),
  body('checkOut')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('checkOut phải theo định dạng YYYY-MM-DD'),
];

module.exports = { createBookingRules };
