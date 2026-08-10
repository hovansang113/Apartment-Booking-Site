const router = require('express').Router();
const { UserRole } = require('@prisma/client');
const calendarController = require('../controllers/calendar.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

// Public: guest xem ngày bận của listing
router.get('/:listingId', calendarController.getCalendar);

// Host: block/unblock ngày
router.post('/:listingId/block', authenticate, authorize(UserRole.host), calendarController.blockDates);
router.delete('/:listingId/block', authenticate, authorize(UserRole.host), calendarController.unblockDates);

module.exports = router;
