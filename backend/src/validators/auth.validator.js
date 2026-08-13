const { body } = require('express-validator');
const { UserRole, TaxpayerType } = require('@prisma/client');

const EMAIL_MAX = 191; // matches VARCHAR(191) column
const NAME_MAX = 191; // matches VARCHAR(191) column
const PASSWORD_MIN = 8;
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
  .withMessage(`Password must be between ${PASSWORD_MIN} and ${PASSWORD_MAX} characters`)
  .matches(/^(?=.*[A-Za-z])(?=.*\d).+$/)
  .withMessage('Password must contain at least one letter and one number');

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

const registerRules = [
  emailRule,
  newPasswordRule,
  fullNameRule,
  phoneRule,
  body('role').optional({ checkFalsy: true }).isIn([UserRole.user, UserRole.host]).withMessage('Invalid role'),
];

const loginRules = [
  emailRule,
  body('password').notEmpty().withMessage('Password is required'),
];

const guestLoginRules = [emailRule, fullNameRule, phoneRule];

const taxInfoRules = [
  body('legalName').trim().notEmpty().withMessage('Vui lòng nhập họ tên đầy đủ theo giấy tờ').isLength({ max: NAME_MAX }),
  body('taxId').trim().notEmpty().withMessage('Vui lòng nhập mã số thuế').isLength({ max: 50 }),
  body('taxpayerType')
    .isIn(Object.values(TaxpayerType))
    .withMessage('Loại hình nộp thuế không hợp lệ'),
  body('idNumber').optional({ checkFalsy: true }).trim().isLength({ max: 20 }).withMessage('Số CCCD/CMND không hợp lệ'),
];

module.exports = { registerRules, loginRules, guestLoginRules, taxInfoRules };
