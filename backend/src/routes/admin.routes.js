const router = require('express').Router();
const { UserRole } = require('@prisma/client');
const adminController = require('../controllers/admin.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { suspendListingRules, lockUserRules, reviewTaxInfoRules } = require('../validators/admin.validator');
const { validate } = require('../validators/validate.util');

router.use(authenticate, authorize(UserRole.admin));

// REQ_03
router.get('/listings', adminController.listListings);
router.patch('/listings/:id/approve', adminController.approveListing);
router.patch('/listings/:id/suspend', suspendListingRules, validate, adminController.suspendListing);

// REQ_04
router.get('/users', adminController.listUsers);
router.patch('/users/:id/lock', lockUserRules, validate, adminController.lockUser);
router.patch('/users/:id/unlock', adminController.unlockUser);

// Duyet ho so thue/giay to host
router.get('/tax-verifications', adminController.listTaxVerifications);
router.patch('/tax-verifications/:id', reviewTaxInfoRules, validate, adminController.reviewTaxInfo);

module.exports = router;
