const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { loginRateLimiter, signupRateLimiter } = require('../middlewares/rateLimit.middleware');
const { registerRules, loginRules, guestLoginRules, taxInfoRules, bankInfoRules } = require('../validators/auth.validator');
const { validate } = require('../validators/validate.util');

router.post('/register', signupRateLimiter, registerRules, validate, authController.register); // REQ_01
router.post('/login', loginRateLimiter, loginRules, validate, authController.login); // REQ_01
router.post('/guest-login', signupRateLimiter, guestLoginRules, validate, authController.guestLogin); // REQ_14
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);
router.put('/tax-info', authenticate, taxInfoRules, validate, authController.updateTaxInfo);
router.put('/bank-info', authenticate, bankInfoRules, validate, authController.updateBankInfo);

module.exports = router;
