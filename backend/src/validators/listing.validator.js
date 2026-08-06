const { body } = require('express-validator');
const { ListingCategory } = require('@prisma/client');

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

const defaultPriceRule = (optional) =>
  (optional ? body('defaultPrice').optional() : body('defaultPrice'))
    .isFloat({ gt: 0 })
    .withMessage('Default price must be a positive number');

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

const atLeastOneImageRule = body('images').custom((_, { req }) => {
  if (!req.files || req.files.length === 0) {
    throw new Error('At least 1 image is required');
  }
  return true;
});

const createListingRules = [
  titleRule(false),
  addressRule(false),
  defaultPriceRule(false),
  descriptionRule,
  categoryRule,
  latitudeRule,
  longitudeRule,
  atLeastOneImageRule,
];

const updateListingRules = [
  titleRule(true),
  addressRule(true),
  defaultPriceRule(true),
  descriptionRule,
  categoryRule,
  latitudeRule,
  longitudeRule,
];

module.exports = { createListingRules, updateListingRules };
