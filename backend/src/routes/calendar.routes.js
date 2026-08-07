const router = require('express').Router();
const prisma = require('../config/prisma');
const { ok } = require('../utils/response.util');

// REQ_06: lấy ngày đã booked của listing (public)
router.get('/:listingId', async (req, res) => {
  const { listingId } = req.params;
  const { year, month } = req.query;

  const where = { listingId, status: 'booked' };
  if (year && month) {
    const start = new Date(Number(year), Number(month) - 1, 1);
    const end = new Date(Number(year), Number(month), 1);
    where.date = { gte: start, lt: end };
  }

  const days = await prisma.listingCalendar.findMany({
    where,
    select: { date: true, status: true },
  });

  return ok(res, days);
});

module.exports = router;
