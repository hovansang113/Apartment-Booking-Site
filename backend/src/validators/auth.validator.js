const { body } = require('express-validator');
const { UserRole, TaxpayerType } = require('@prisma/client');
const { VIETNAM_BANK_CODES } = require('../utils/vietnamBanks');

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
  body('legalName').trim().notEmpty().withMessage('Please enter your full legal name').isLength({ max: NAME_MAX }),
  body('taxId').trim().notEmpty().withMessage('Please enter your tax ID').isLength({ max: 50 }),
  body('taxpayerType')
    .isIn(Object.values(TaxpayerType))
    .withMessage('Invalid taxpayer type'),
  body('idNumber').optional({ checkFalsy: true }).trim().isLength({ max: 20 }).withMessage('Invalid ID number'),
];

// Host "Thong tin nhan tien" - tai khoan ngan hang de nhan tien host sau khi
// tru hoa hong. bankAccountNumber chi thuan so (dung dinh dang lien ngan
// hang that), bankCode phai nam trong danh sach co san (khong go tu do).
const bankInfoRules = [
  body('bankCode')
    .trim()
    .notEmpty()
    .withMessage('Please select a bank')
    .isIn(VIETNAM_BANK_CODES)
    .withMessage('Invalid bank'),
  body('bankAccountNumber')
    .trim()
    .notEmpty()
    .withMessage('Please enter an account number')
    .isNumeric()
    .withMessage('Account number must contain digits only')
    .isLength({ min: 6, max: 19 })
    .withMessage('Account number must be 6 to 19 digits'),
  body('bankAccountHolder')
    .trim()
    .notEmpty()
    .withMessage('Please enter the account holder name')
    .isLength({ max: NAME_MAX })
    .withMessage(`Account holder name must be at most ${NAME_MAX} characters`),
];

module.exports = { registerRules, loginRules, guestLoginRules, taxInfoRules, bankInfoRules };
