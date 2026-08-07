const { body, query } = require('express-validator');
const { ListingStatus } = require('@prisma/client');

const updateListingStatusRules = [
  body('status')
    .isIn(Object.values(ListingStatus))
    .withMessage(`status must be one of: ${Object.values(ListingStatus).join(', ')}`),
  body('suspendReason')
    .if(body('status').equals(ListingStatus.suspended))
    .notEmpty()
    .withMessage('suspendReason is required when suspending a listing'),
];

const getListingsQueryRules = [
  query('status')
    .optional()
    .isIn(Object.values(ListingStatus))
    .withMessage(`status must be one of: ${Object.values(ListingStatus).join(', ')}`),
];

module.exports = { updateListingStatusRules, getListingsQueryRules };
