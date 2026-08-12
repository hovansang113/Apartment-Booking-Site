const crypto = require('crypto');
const prisma = require('../config/prisma');
const AppError = require('../utils/appError');

async function assertListingOwner(listingId, hostId) {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) throw new AppError(404, 'Listing not found');
  if (listing.hostId !== hostId) throw new AppError(403, 'Not your listing');
  return listing;
}

// REQ_12: host block một khoảng ngày
async function blockDates({ listingId, hostId, startDate, endDate, note }) {
  await assertListingOwner(listingId, hostId);

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (end <= start) throw new AppError(400, 'End date must be after start date');

  const dates = [];
  const current = new Date(start);
  while (current < end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  // Atomic: kiểm tra conflict và insert trong cùng 1 transaction
  const result = await prisma.$transaction(async (tx) => {
    const bookedConflict = await tx.listingCalendar.findFirst({
      where: { listingId, date: { gte: start, lt: end }, status: 'booked' },
    });
    if (bookedConflict) throw new AppError(409, 'Some dates in this range are already booked');

    const { count } = await tx.listingCalendar.createMany({
      data: dates.map((date) => ({
        id: crypto.randomUUID(),
        listingId,
        date,
        status: 'blocked',
        source: 'manual',
        note: note || null,
      })),
      skipDuplicates: true,
    });
    return count;
  });

  return { blocked: result };
}

// REQ_12: host unblock một khoảng ngày
async function unblockDates({ listingId, hostId, startDate, endDate }) {
  await assertListingOwner(listingId, hostId);

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (end <= start) throw new AppError(400, 'End date must be after start date');

  // Chỉ xóa ngày do host tự block (manual), không xóa ngày đã booked
  const { count } = await prisma.listingCalendar.deleteMany({
    where: {
      listingId,
      date: { gte: start, lt: end },
      status: 'blocked',
      source: 'manual',
    },
  });

  return { unblocked: count };
}

// REQ_06: lấy calendar của listing theo tháng (public)
async function getCalendar({ listingId, year, month }) {
  const start = new Date(Number(year), Number(month) - 1, 1);
  const end = new Date(Number(year), Number(month), 1);

  const days = await prisma.listingCalendar.findMany({
    where: {
      listingId,
      date: { gte: start, lt: end },
    },
    select: { date: true, status: true },
    orderBy: { date: 'asc' },
  });

  return days;
}

module.exports = { blockDates, unblockDates, getCalendar };
