const router = require('express').Router();
const { UserRole } = require('@prisma/client');
const pricingController = require('../controllers/pricing.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

// Public: guest xem price override theo tháng (không cần auth)
router.get('/:listingId/public', pricingController.getPublicPriceOverrides);

// Host: xem price override theo tháng
router.get('/:listingId', authenticate, authorize(UserRole.host), pricingController.getPriceOverrides);

// Host: set (upsert) price override cho một hoặc nhiều ngày
router.post('/:listingId', authenticate, authorize(UserRole.host), pricingController.setPriceOverrides);

// Host: xóa price override của một ngày
router.delete('/:listingId', authenticate, authorize(UserRole.host), pricingController.deletePriceOverride);

module.exports = router;
