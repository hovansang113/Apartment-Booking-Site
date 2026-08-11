const { body, query } = require('express-validator');
const { ListingStatus, UserStatus, UserRole } = require('@prisma/client');

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

const updateUserStatusRules = [
  body('status')
    .isIn(Object.values(UserStatus))
    .withMessage(`status must be one of: ${Object.values(UserStatus).join(', ')}`),
];

const getUsersQueryRules = [
  query('role')
    .optional()
    .isIn([UserRole.host, UserRole.user])
    .withMessage('role must be host or user'),
  query('status')
    .optional()
    .isIn(Object.values(UserStatus))
    .withMessage(`status must be one of: ${Object.values(UserStatus).join(', ')}`),
];

module.exports = {
  updateListingStatusRules,
  getListingsQueryRules,
  updateUserStatusRules,
  getUsersQueryRules,
};
