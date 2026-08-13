const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { registerRules, loginRules, guestLoginRules, taxInfoRules } = require('../validators/auth.validator');
const { validate } = require('../validators/validate.util');

router.post('/register', registerRules, validate, authController.register); // REQ_01
router.post('/login', loginRules, validate, authController.login);          // REQ_01
router.post('/guest-login', guestLoginRules, validate, authController.guestLogin); // REQ_14
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);
router.put('/tax-info', authenticate, taxInfoRules, validate, authController.updateTaxInfo);

module.exports = router;
