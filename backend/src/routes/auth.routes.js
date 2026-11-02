const router = require('express').Router();
const { UserRole } = require('@prisma/client');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { loginRateLimiter, signupRateLimiter } = require('../middlewares/rateLimit.middleware');
const { registerRules, loginRules, guestLoginRules, taxInfoRules, bankInfoRules } = require('../validators/auth.validator');
const { validate } = require('../validators/validate.util');

router.post('/register', signupRateLimiter, registerRules, validate, authController.register); // REQ_01
router.post('/login', loginRateLimiter, loginRules, validate, authController.login); // REQ_01
router.post('/guest-login', signupRateLimiter, guestLoginRules, validate, authController.guestLogin); // REQ_14
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);
router.put('/tax-info', authenticate, authorize(UserRole.host), taxInfoRules, validate, authController.updateTaxInfo);
router.put('/bank-info', authenticate, authorize(UserRole.host), bankInfoRules, validate, authController.updateBankInfo);

module.exports = router;
