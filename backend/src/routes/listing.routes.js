const router = require('express').Router();
const { UserRole } = require('@prisma/client');
const listingController = require('../controllers/listing.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { upload } = require('../middlewares/upload.middleware');
const {
  createListingRules,
  updateListingRules,
  publicListRules,
} = require('../validators/listing.validator');
const { validate } = require('../validators/validate.util');

router.get('/', publicListRules, validate, listingController.list); // REQ_05 - public, no auth

router.get('/mine', authenticate, authorize(UserRole.host), listingController.mine); // prereq REQ_12

router.get('/:id', listingController.getOne); // REQ_06 - public, no auth

router.post(
  '/',
  authenticate,
  authorize(UserRole.host),
  upload.array('images', 10),
  createListingRules,
  validate,
  listingController.create,
); // REQ_02

router.put(
  '/:id',
  authenticate,
  authorize(UserRole.host),
  updateListingRules,
  validate,
  listingController.update,
); // REQ_02

router.delete('/:id', authenticate, authorize(UserRole.host), listingController.remove); // REQ_02
router.delete(
  '/:id/images/:imageId',
  authenticate,
  authorize(UserRole.host),
  listingController.removeImage,
);

module.exports = router;
