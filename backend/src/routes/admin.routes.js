const router = require('express').Router();
const { UserRole } = require('@prisma/client');
const adminController = require('../controllers/admin.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { updateListingStatusRules, getListingsQueryRules } = require('../validators/admin.validator');
const { validate } = require('../validators/validate.util');

router.use(authenticate, authorize(UserRole.admin));

router.get('/listings', getListingsQueryRules, validate, adminController.getListings); // REQ_03
router.patch('/listings/:id/status', updateListingStatusRules, validate, adminController.updateListingStatus); // REQ_03

module.exports = router;
