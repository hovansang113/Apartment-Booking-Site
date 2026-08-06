const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { registerRules, loginRules, guestLoginRules } = require('../validators/auth.validator');
const { validate } = require('../validators/validate.util');

router.post('/register', registerRules, validate, authController.register); // REQ_01
router.post('/login', loginRules, validate, authController.login);          // REQ_01
router.post('/guest-login', guestLoginRules, validate, authController.guestLogin); // REQ_14

module.exports = router;
