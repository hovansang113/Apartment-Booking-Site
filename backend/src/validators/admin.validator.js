const { body } = require('express-validator');
const { VerificationStatus } = require('@prisma/client');

const suspendListingRules = [
  body('reason').trim().notEmpty().withMessage('Please enter a suspension reason').isLength({ max: 1000 }),
];

const lockUserRules = [
  body('reason').trim().notEmpty().withMessage('Please enter a reason for locking this account').isLength({ max: 1000 }),
];

const reviewTaxInfoRules = [
  body('status')
    .isIn([VerificationStatus.verified, VerificationStatus.rejected])
    .withMessage('status must be verified or rejected'),
  body('note').optional({ checkFalsy: true }).trim().isLength({ max: 1000 }),
];

module.exports = { suspendListingRules, lockUserRules, reviewTaxInfoRules };
