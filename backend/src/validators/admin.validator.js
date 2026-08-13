const { body } = require('express-validator');
const { VerificationStatus } = require('@prisma/client');

const suspendListingRules = [
  body('reason').trim().notEmpty().withMessage('Vui lòng nhập lý do đình chỉ').isLength({ max: 1000 }),
];

const lockUserRules = [
  body('reason').trim().notEmpty().withMessage('Vui lòng nhập lý do khoá tài khoản').isLength({ max: 1000 }),
];

const reviewTaxInfoRules = [
  body('status')
    .isIn([VerificationStatus.verified, VerificationStatus.rejected])
    .withMessage('status phải là verified hoặc rejected'),
  body('note').optional({ checkFalsy: true }).trim().isLength({ max: 1000 }),
];

module.exports = { suspendListingRules, lockUserRules, reviewTaxInfoRules };
