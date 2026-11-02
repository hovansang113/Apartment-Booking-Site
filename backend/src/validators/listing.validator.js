const { body, query } = require('express-validator');
const { ListingCategory, Amenity } = require('@prisma/client');

const TITLE_MAX = 191; // matches VARCHAR(191) column
const ADDRESS_MAX = 191; // matches VARCHAR(191) column
const DESCRIPTION_MAX = 5000;

const titleRule = (optional) =>
  optional
    ? body('title').optional().trim().notEmpty().withMessage('Title cannot be empty').isLength({ max: TITLE_MAX }).withMessage(`Title must be at most ${TITLE_MAX} characters`)
    : body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: TITLE_MAX }).withMessage(`Title must be at most ${TITLE_MAX} characters`);

const addressRule = (optional) =>
  (optional ? body('address').optional() : body('address'))
    .trim()
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ max: ADDRESS_MAX })
    .withMessage(`Address must be at most ${ADDRESS_MAX} characters`);

const weekdayPriceRule = (optional) =>
  (optional ? body('weekdayPrice').optional() : body('weekdayPrice'))
    .isFloat({ gt: 0 })
    .withMessage('Weekday price must be a positive number');

const weekendPriceRule = (optional) =>
  (optional ? body('weekendPrice').optional() : body('weekendPrice'))
    .isFloat({ gt: 0 })
    .withMessage('Weekend price must be a positive number');

// Phi don dep co dinh, tuy chon - host khong bat buoc phai co (0/khong nhap
// deu hop le), neu co thi phai >= 0.
const cleaningFeeRule = body('cleaningFee')
  .optional({ checkFalsy: true })
  .isFloat({ min: 0 })
  .withMessage('Cleaning fee must be a non-negative number');

const intFieldRule = (field, optional) =>
  (optional ? body(field).optional() : body(field))
    .isInt({ min: 1 })
    .withMessage(`${field} must be a positive integer`)
    .toInt();

const descriptionRule = body('description')
  .optional({ checkFalsy: true })
  .isString()
  .isLength({ max: DESCRIPTION_MAX })
  .withMessage(`Description must be at most ${DESCRIPTION_MAX} characters`);

const categoryRule = body('category')
  .optional({ checkFalsy: true })
  .isIn(Object.values(ListingCategory))
  .withMessage('Invalid category');

const latitudeRule = body('latitude')
  .optional({ checkFalsy: true })
  .isFloat({ min: -90, max: 90 })
  .withMessage('Invalid latitude');

const longitudeRule = body('longitude')
  .optional({ checkFalsy: true })
  .isFloat({ min: -180, max: 180 })
  .withMessage('Invalid longitude');

// Sent as a JSON-encoded string in multipart form data (create), or a real
// array in a JSON body (update) — normalize both to an array before validating.
function parseAmenities(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : value;
    } catch {
      return value;
    }
  }
  return value;
}

const minNightsRule = (optional) =>
  (optional ? body('minNights').optional({ nullable: true }) : body('minNights').optional({ nullable: true }))
    .isInt({ min: 1 })
    .withMessage('minNights must be a positive integer')
    .toInt();

const maxNightsRule = (optional) =>
  (optional ? body('maxNights').optional({ nullable: true }) : body('maxNights').optional({ nullable: true }))
    .isInt({ min: 1 })
    .withMessage('maxNights must be a positive integer')
    .toInt();

const amenitiesRule = body('amenities')
  .optional({ checkFalsy: true })
  .customSanitizer(parseAmenities)
  .custom((value) => {
    if (!Array.isArray(value) || !value.every((a) => Object.values(Amenity).includes(a))) {
      throw new Error('Amenities must be an array of valid amenity values');
    }
    return true;
  });

const atLeastOneImageRule = body('images').custom((_, { req }) => {
  if (!req.files || req.files.length === 0) {
    throw new Error('At least 1 image is required');
  }
  return true;
});

const createListingRules = [
  titleRule(false),
  addressRule(false),
  weekdayPriceRule(false),
  weekendPriceRule(false),
  cleaningFeeRule,
  intFieldRule('guestCapacity', false),
  intFieldRule('bedrooms', false),
  intFieldRule('beds', false),
  intFieldRule('bathrooms', false),
  descriptionRule,
  categoryRule,
  latitudeRule,
  longitudeRule,
  amenitiesRule,
  atLeastOneImageRule,
  minNightsRule(false),
  maxNightsRule(false),
];

const updateListingRules = [
  titleRule(true),
  addressRule(true),
  weekdayPriceRule(true),
  weekendPriceRule(true),
  cleaningFeeRule,
  intFieldRule('guestCapacity', true),
  intFieldRule('bedrooms', true),
  intFieldRule('beds', true),
  intFieldRule('bathrooms', true),
  descriptionRule,
  categoryRule,
  latitudeRule,
  longitudeRule,
  amenitiesRule,
  minNightsRule(true),
  maxNightsRule(true),
];

// REQ_05: query params cua danh sach listing cong khai
const publicListRules = [
  query('category').optional({ checkFalsy: true }).isIn(Object.values(ListingCategory)).withMessage('Invalid category'),
  query('page').optional({ checkFalsy: true }).isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),
  query('location').optional({ checkFalsy: true }).isString().isLength({ max: ADDRESS_MAX }).withMessage('Location is too long'),
  query('guests').optional({ checkFalsy: true }).isInt({ min: 1 }).withMessage('Guests must be a positive integer').toInt(),
  query('minPrice')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a non-negative number')
    .toFloat(),
  query('maxPrice')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a non-negative number')
    .toFloat(),
  query('maxPrice').custom((value, { req }) => {
    if (value !== undefined && req.query.minPrice !== undefined && Number(value) < Number(req.query.minPrice)) {
      throw new Error('Maximum price must be greater than or equal to minimum price');
    }
    return true;
  }),
  query('amenities')
    .optional({ checkFalsy: true })
    .customSanitizer((value) => (Array.isArray(value) ? value : String(value).split(',')))
    .custom((values) => {
      if (!Array.isArray(values) || !values.every((value) => Object.values(Amenity).includes(value))) {
        throw new Error('Invalid amenity');
      }
      return true;
    }),
  query('checkIn')
    .optional({ checkFalsy: true })
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage('checkIn must be a real calendar date'),
  query('checkOut')
    .optional({ checkFalsy: true })
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage('checkOut must be a real calendar date'),
  query('checkOut').custom((value, { req }) => {
    if (Boolean(value) !== Boolean(req.query.checkIn)) {
      throw new Error('checkIn and checkOut must be provided together');
    }
    if (value && new Date(value) <= new Date(req.query.checkIn)) {
      throw new Error('checkOut must be after checkIn');
    }
    return true;
  }),
];

// Bao gia phai dung date-only ISO hop le. Regex don thuan se chap nhan ca
// nhung ngay khong ton tai nhu 2026-02-30, sau do JavaScript am tham doi no
// thanh thang sau va lam sai tong tien.
const quoteRules = [
  query('checkIn')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('checkIn must be in YYYY-MM-DD format')
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage('checkIn must be a real calendar date'),
  query('checkOut')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('checkOut must be in YYYY-MM-DD format')
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage('checkOut must be a real calendar date'),
];

module.exports = { createListingRules, updateListingRules, publicListRules, quoteRules };
