const { body } = require('express-validator');

const NAME_MAX = 191; // matches VARCHAR(191) column
const EMAIL_MAX = 191; // matches VARCHAR(191) column
const ADDRESS_MAX = 191;
const CITY_MAX = 100;
const POSTCODE_MAX = 20;

const createBookingRules = [
  body('listingId').isUUID().withMessage('Invalid listingId'),
  body('checkIn')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('checkIn must be in YYYY-MM-DD format'),
  body('checkOut')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('checkOut must be in YYYY-MM-DD format'),
  body('contactName')
    .trim()
    .notEmpty()
    .withMessage('Please enter your full name')
    .isLength({ max: NAME_MAX })
    .withMessage(`Full name must be at most ${NAME_MAX} characters`),
  body('contactEmail')
    .trim()
    .notEmpty()
    .withMessage('Please enter your email')
    .isEmail()
    .withMessage('Invalid email')
    .isLength({ max: EMAIL_MAX })
    .normalizeEmail(),
  body('contactPhone')
    .optional({ checkFalsy: true })
    .trim()
    .isMobilePhone('any')
    .withMessage('Invalid phone number'),
  body('contactAddress')
    .trim()
    .notEmpty()
    .withMessage('Please enter your address')
    .isLength({ max: ADDRESS_MAX })
    .withMessage(`Address must be at most ${ADDRESS_MAX} characters`),
  body('contactCity')
    .trim()
    .notEmpty()
    .withMessage('Please enter your city')
    .isLength({ max: CITY_MAX })
    .withMessage(`City must be at most ${CITY_MAX} characters`),
  body('contactPostcode')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: POSTCODE_MAX })
    .withMessage(`Postcode must be at most ${POSTCODE_MAX} characters`),
  body('adults')
    .isInt({ min: 1 })
    .withMessage('Number of adults must be at least 1')
    .toInt(),
  body('children')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Invalid number of children')
    .toInt(),
];

module.exports = { createBookingRules };
