const { getBasePrice } = require('../utils/pricing.util');

// REQ_13: tong gia cho 1 tap hop ngay (dem) - moi dem uu tien gia override
// rieng ngay do (listing_price_overrides, dat tay tren man hinh lich), neu
// khong co override thi dung gia goc theo thu trong tuan (weekday/weekend,
// xem pricing.util.js). Nhan `db` (PrismaClient hoac tx cua 1 transaction dang
// chay) de dung duoc trong ca truy van thuong lan trong booking.service.js.
async function calculateTotalPrice(db, { listing, dates }) {
  const overrides = await db.listingPriceOverride.findMany({
    where: { listingId: listing.id, date: { in: dates.map((d) => new Date(d)) } },
  });
  const overrideByDate = new Map(
    overrides.map((row) => [row.date.toISOString().slice(0, 10), Number(row.price)]),
  );

  return dates.reduce((sum, ymd) => {
    const price = overrideByDate.has(ymd) ? overrideByDate.get(ymd) : getBasePrice(listing, ymd);
    return sum + price;
  }, 0);
}

module.exports = { calculateTotalPrice };
