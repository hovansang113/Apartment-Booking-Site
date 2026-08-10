const prisma = require('../config/prisma');
const AppError = require('../utils/appError');

async function assertListingOwner(listingId, hostId) {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) throw new AppError(404, 'Listing not found');
  if (listing.hostId !== hostId) throw new AppError(403, 'Not your listing');
  return listing;
}

// REQ_13: host set price override cho một hoặc nhiều ngày cụ thể
async function setPriceOverrides({ listingId, hostId, overrides }) {
  await assertListingOwner(listingId, hostId);

  // overrides = [{ date: '2026-08-15', price: 500000 }, ...]
  if (!Array.isArray(overrides) || overrides.length === 0) {
    throw new AppError(400, 'overrides must be a non-empty array');
  }

  // Upsert từng ngày — nếu đã có thì update giá, chưa có thì tạo mới
  const results = await Promise.all(
    overrides.map(({ date, price }) => {
      if (!date || price == null || Number(price) <= 0) {
        throw new AppError(400, `Invalid entry: date and positive price are required`);
      }
      const d = new Date(date);
      return prisma.listingPriceOverride.upsert({
        where: { listingId_date: { listingId, date: d } },
        update: { price: Number(price) },
        create: { listingId, date: d, price: Number(price) },
      });
    })
  );

  return results;
}

// REQ_13: host xóa price override của một ngày
async function deletePriceOverride({ listingId, hostId, date }) {
  await assertListingOwner(listingId, hostId);

  const d = new Date(date);
  const existing = await prisma.listingPriceOverride.findUnique({
    where: { listingId_date: { listingId, date: d } },
  });
  if (!existing) throw new AppError(404, 'Price override not found for this date');

  await prisma.listingPriceOverride.delete({
    where: { listingId_date: { listingId, date: d } },
  });

  return { deleted: date };
}

// REQ_13: host xem tất cả price override của listing theo tháng
async function getPriceOverrides({ listingId, hostId, year, month }) {
  await assertListingOwner(listingId, hostId);

  const where = { listingId };
  if (year && month) {
    const start = new Date(Number(year), Number(month) - 1, 1);
    const end = new Date(Number(year), Number(month), 1);
    where.date = { gte: start, lt: end };
  }

  return prisma.listingPriceOverride.findMany({
    where,
    orderBy: { date: 'asc' },
  });
}

module.exports = { setPriceOverrides, deletePriceOverride, getPriceOverrides };
