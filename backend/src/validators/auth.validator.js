const { body } = require('express-validator');
const { ROLES } = require('../constants/roles');

const registerRules = [
  body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('phone').optional({ checkFalsy: true }).isString(),
  body('role').optional().isIn([ROLES.USER, ROLES.HOST]).withMessage('Invalid role'),
];

const loginRules = [
  body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const guestLoginRules = [
  body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('phone').optional({ checkFalsy: true }).isString(),
];

module.exports = { registerRules, loginRules, guestLoginRules };
