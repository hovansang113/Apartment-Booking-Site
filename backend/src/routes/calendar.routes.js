const router = require('express').Router();
const { UserRole } = require('@prisma/client');
const calendarController = require('../controllers/calendar.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const {
  monthViewRules,
  blockDatesRules,
  unblockDatesRules,
  priceOverrideRules,
  connectSyncRules,
  updateSyncRules,
} = require('../validators/calendar.validator');
const { validate } = require('../validators/validate.util');

// Cong khai - dat TRUOC router.use(authenticate,...) ben duoi de khong bi
// chan boi auth. Bao mat bang icalToken rieng cua listing (query ?t=...),
// khong phai JWT, vi he thong ngoai (Airbnb/VRBO) khong tu dang nhap duoc.
router.get('/:listingId/export.ics', calendarController.exportIcal);

router.use(authenticate, authorize(UserRole.host));

router.get('/:listingId', monthViewRules, validate, calendarController.getMonthView); // REQ_06/12
router.post('/:listingId/block', blockDatesRules, validate, calendarController.blockDates); // REQ_12
router.post('/:listingId/unblock', unblockDatesRules, validate, calendarController.unblockDates); // REQ_12
router.put('/:listingId/price', priceOverrideRules, validate, calendarController.setPriceOverride);

router.get('/:listingId/sync', calendarController.listSyncSources);
router.post('/:listingId/sync', connectSyncRules, validate, calendarController.connectSyncSource);
router.post('/:listingId/sync/:syncId/refresh', calendarController.refreshSyncSource);
router.put('/:listingId/sync/:syncId', updateSyncRules, validate, calendarController.updateSyncSource);
router.delete('/:listingId/sync/:syncId', calendarController.removeSyncSource);

module.exports = router;
