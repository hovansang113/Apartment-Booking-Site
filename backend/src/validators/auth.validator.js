const { body } = require('express-validator');

const EMAIL_MAX = 191; // matches VARCHAR(191) column
const NAME_MAX = 191; // matches VARCHAR(191) column
const PASSWORD_MIN = 6;
const PASSWORD_MAX = 72; // bcrypt silently ignores bytes beyond 72

const emailRule = body('email')
  .trim()
  .notEmpty()
  .withMessage('Email is required')
  .isEmail()
  .withMessage('Invalid email')
  .isLength({ max: EMAIL_MAX })
  .withMessage(`Email must be at most ${EMAIL_MAX} characters`)
  .normalizeEmail();

const newPasswordRule = body('password')
  .isLength({ min: PASSWORD_MIN, max: PASSWORD_MAX })
  .withMessage(`Password must be between ${PASSWORD_MIN} and ${PASSWORD_MAX} characters`);

const fullNameRule = body('fullName')
  .trim()
  .notEmpty()
  .withMessage('Full name is required')
  .isLength({ max: NAME_MAX })
  .withMessage(`Full name must be at most ${NAME_MAX} characters`);

const phoneRule = body('phone')
  .optional({ checkFalsy: true })
  .trim()
  .isMobilePhone('any')
  .withMessage('Invalid phone number');

const registerRules = [emailRule, newPasswordRule, fullNameRule, phoneRule];

const loginRules = [
  emailRule,
  body('password').notEmpty().withMessage('Password is required'),
];

const guestLoginRules = [emailRule, fullNameRule, phoneRule];

module.exports = { registerRules, loginRules, guestLoginRules };
