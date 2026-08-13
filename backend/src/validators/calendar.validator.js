const { query, body } = require('express-validator');

const monthViewRules = [
  query('year').isInt({ min: 2000, max: 2100 }).withMessage('Invalid year').toInt(),
  query('month').isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12').toInt(),
];

const datesRule = body('dates')
  .isArray({ min: 1 })
  .withMessage('dates must be a non-empty array')
  .custom((value) => value.every((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)))
  .withMessage('Each date must be in YYYY-MM-DD format');

const blockDatesRules = [
  datesRule,
  body('note').optional({ checkFalsy: true }).isString().isLength({ max: 1000 }),
];

const unblockDatesRules = [datesRule];

const priceOverrideRules = [
  body('date')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('date must be in YYYY-MM-DD format'),
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
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('date must be in YYYY-MM-DD format'),
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
