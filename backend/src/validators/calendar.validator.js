const { query, body } = require('express-validator');

function isRealIsoDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

const monthViewRules = [
  query('year').isInt({ min: 2000, max: 2100 }).withMessage('Invalid year').toInt(),
  query('month').isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12').toInt(),
];

const datesRule = body('dates')
  .isArray({ min: 1 })
  .withMessage('dates must be a non-empty array')
  .custom((value) => value.every(isRealIsoDate))
  .withMessage('Each date must be a real YYYY-MM-DD calendar date');

const blockDatesRules = [
  datesRule,
  body('note').optional({ checkFalsy: true }).isString().isLength({ max: 1000 }),
];

const unblockDatesRules = [datesRule];

const priceOverrideRules = [
  body('date')
    .custom(isRealIsoDate)
    .withMessage('date must be a real YYYY-MM-DD calendar date'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
];

const connectSyncRules = [
  body('icalUrl').trim().isURL().withMessage('icalUrl must be a valid URL'),
  body('label').trim().notEmpty().isLength({ max: 191 }).withMessage('Label is required'),
];

const updateSyncRules = [
  body('icalUrl').optional({ checkFalsy: true }).trim().isURL().withMessage('icalUrl must be a valid URL'),
  body('label').optional({ checkFalsy: true }).trim().isLength({ max: 191 }).withMessage('Label is too long'),
];

const stayRuleRules = [
  body('date')
    .custom(isRealIsoDate)
    .withMessage('date must be a real YYYY-MM-DD calendar date'),
  body('minNights').optional({ nullable: true }).isInt({ min: 1 }).withMessage('minNights must be a positive integer').toInt(),
  body('maxNights').optional({ nullable: true }).isInt({ min: 1 }).withMessage('maxNights must be a positive integer').toInt(),
  body().custom((value) => {
    if (value.minNights != null && value.maxNights != null && value.minNights > value.maxNights) {
      throw new Error('minNights cannot be greater than maxNights');
    }
    return true;
  }),
];

module.exports = {
  monthViewRules,
  blockDatesRules,
  unblockDatesRules,
  priceOverrideRules,
  connectSyncRules,
  updateSyncRules,
  stayRuleRules,
};
