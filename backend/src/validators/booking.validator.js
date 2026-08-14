const { body } = require('express-validator');

const NAME_MAX = 191; // matches VARCHAR(191) column
const EMAIL_MAX = 191; // matches VARCHAR(191) column

const createBookingRules = [
  body('listingId').isUUID().withMessage('listingId không hợp lệ'),
  body('checkIn')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('checkIn phải theo định dạng YYYY-MM-DD'),
  body('checkOut')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('checkOut phải theo định dạng YYYY-MM-DD'),
  body('contactName')
    .trim()
    .notEmpty()
    .withMessage('Vui lòng nhập họ tên')
    .isLength({ max: NAME_MAX })
    .withMessage(`Họ tên phải tối đa ${NAME_MAX} ký tự`),
  body('contactEmail')
    .trim()
    .notEmpty()
    .withMessage('Vui lòng nhập email')
    .isEmail()
    .withMessage('Email không hợp lệ')
    .isLength({ max: EMAIL_MAX })
    .normalizeEmail(),
  body('contactPhone')
    .optional({ checkFalsy: true })
    .trim()
    .isMobilePhone('any')
    .withMessage('Số điện thoại không hợp lệ'),
];

module.exports = { createBookingRules };
