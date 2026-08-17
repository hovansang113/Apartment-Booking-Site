const { body } = require('express-validator');

const NAME_MAX = 191; // matches VARCHAR(191) column
const EMAIL_MAX = 191; // matches VARCHAR(191) column
const ADDRESS_MAX = 191;
const CITY_MAX = 100;
const POSTCODE_MAX = 20;

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
  body('contactAddress')
    .trim()
    .notEmpty()
    .withMessage('Vui lòng nhập địa chỉ')
    .isLength({ max: ADDRESS_MAX })
    .withMessage(`Địa chỉ phải tối đa ${ADDRESS_MAX} ký tự`),
  body('contactCity')
    .trim()
    .notEmpty()
    .withMessage('Vui lòng nhập thành phố/tỉnh')
    .isLength({ max: CITY_MAX })
    .withMessage(`Thành phố/tỉnh phải tối đa ${CITY_MAX} ký tự`),
  body('contactPostcode')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: POSTCODE_MAX })
    .withMessage(`Mã bưu chính phải tối đa ${POSTCODE_MAX} ký tự`),
  body('adults')
    .isInt({ min: 1 })
    .withMessage('Số người lớn phải tối thiểu 1')
    .toInt(),
  body('children')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Số trẻ em không hợp lệ')
    .toInt(),
];

module.exports = { createBookingRules };
