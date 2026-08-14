const router = require('express').Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/upload.middleware');

router.use(authenticate);

router.get('/me', userController.getMe);
router.patch('/me', userController.updateProfile);
router.patch('/me/avatar', upload.single('avatar'), userController.updateAvatar);
router.patch('/me/password', userController.changePassword);

module.exports = router;
