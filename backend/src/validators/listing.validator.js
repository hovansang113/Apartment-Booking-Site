const { body, query } = require('express-validator');
const { ListingCategory, Amenity } = require('@prisma/client');

const TITLE_MAX = 191; // matches VARCHAR(191) column
const ADDRESS_MAX = 191; // matches VARCHAR(191) column
const DESCRIPTION_MAX = 5000;

const titleRule = (optional) =>
  optional
    ? body('title').optional().trim().notEmpty().withMessage('Title cannot be empty')
    : body('title').trim().notEmpty().withMessage('Title is required');

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
];

// REQ_05: query params cua danh sach listing cong khai
const publicListRules = [
  query('category').optional({ checkFalsy: true }).isIn(Object.values(ListingCategory)).withMessage('Invalid category'),
  query('page').optional({ checkFalsy: true }).isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),
];

module.exports = { createListingRules, updateListingRules, publicListRules };
