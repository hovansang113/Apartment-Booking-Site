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
  body('legalName').trim().notEmpty().withMessage('Please enter your full legal name').isLength({ max: NAME_MAX }),
  body('taxId').trim().notEmpty().withMessage('Please enter your tax ID').isLength({ max: 50 }),
  body('taxpayerType')
    .isIn(Object.values(TaxpayerType))
    .withMessage('Invalid taxpayer type'),
  body('idNumber').optional({ checkFalsy: true }).trim().isLength({ max: 20 }).withMessage('Invalid ID number'),
];

// Host "Payout information" - tai khoan ngan hang UK de nhan tien host sau
// khi tru hoa hong (18/8, doi tu he thong Viet Nam sang UK theo yeu cau
// Jason). UK dung sort code (6 chu so, dinh danh ca ngan hang + chi nhanh -
// khong con khai niem "chon ngan hang tu danh sach" nhu VN) + account number
// (chuan 8 chu so). Cho phep nguoi dung go kem dau gach ngang (vd 12-34-56),
// tu dong bo dau truoc khi kiem tra do dai.
const sortCodeSanitizer = (value) => (typeof value === 'string' ? value.replace(/[^0-9]/g, '') : value);

const bankInfoRules = [
  body('bankSortCode')
    .customSanitizer(sortCodeSanitizer)
    .notEmpty()
    .withMessage('Please enter a sort code')
    .isLength({ min: 6, max: 6 })
    .withMessage('Sort code must be 6 digits'),
  body('bankAccountNumber')
    .trim()
    .notEmpty()
    .withMessage('Please enter an account number')
    .isNumeric()
    .withMessage('Account number must contain digits only')
    .isLength({ min: 8, max: 8 })
    .withMessage('Account number must be 8 digits'),
  body('bankAccountHolder')
    .trim()
    .notEmpty()
    .withMessage('Please enter the account holder name')
    .isLength({ max: NAME_MAX })
    .withMessage(`Account holder name must be at most ${NAME_MAX} characters`),
];

module.exports = { registerRules, loginRules, guestLoginRules, taxInfoRules, bankInfoRules };
