const { BookingStatus, CalendarDayStatus, CalendarDaySource } = require('@prisma/client');
const prisma = require('../config/prisma');
const AppError = require('../utils/appError');

function toYMD(date) {
  return date.toISOString().slice(0, 10);
}

// [checkIn, checkOut) - dem checkOut khong tinh, khop quy uoc dang dung o
// listing_calendar/calendar.service.js.
function datesBetween(checkIn, checkOut) {
  const dates = [];
  const cur = new Date(checkIn);
  const end = new Date(checkOut);
  while (cur < end) {
    dates.push(toYMD(cur));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return dates;
}

// TAM THOI: ban toi gian cua REQ_07 (tao booking) + REQ_09 (chong trung lich),
// chi du de kiem chung yeu cau trong ticket cua Jason ve REQ_12 - "neu ngay bi
// chan (block tay/booking/sync ngoai) thi khong cho dat". Con thieu so voi
// REQ_07 day du: chua ho tro khach dat khong can tai khoan (REQ_14 tu tao
// user), chua dung pricing.service.js de tinh gia theo tung dem (dang lay
// dong default_price flat, chua nhin listing_price_overrides).
async function createBooking({ listingId, guestId, checkIn, checkOut }) {
  const dates = datesBetween(checkIn, checkOut);
  if (dates.length === 0) {
    throw new AppError(422, 'checkOut phải sau checkIn ít nhất 1 đêm');
  }

  return prisma.$transaction(async (tx) => {
    const listing = await tx.listing.findUnique({ where: { id: listingId } });
    if (!listing) {
      throw new AppError(404, 'Listing not found');
    }

    const targets = dates.map((d) => new Date(d));
    const conflicts = await tx.listingCalendar.findMany({
      where: { listingId, date: { in: targets } },
    });
    if (conflicts.length > 0) {
      throw new AppError(409, `Ngày ${toYMD(conflicts[0].date)} đã có người đặt hoặc đang bị chặn`);
    }

    const guest = await tx.user.findUnique({ where: { id: guestId } });
    if (!guest) {
      throw new AppError(404, 'Guest not found');
    }

    const totalPrice = Number(listing.defaultPrice) * dates.length;

    const booking = await tx.booking.create({
      data: {
        listingId,
        guestId,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        totalPrice,
        status: BookingStatus.approved,
        approvedAt: new Date(),
        contactName: guest.fullName,
        contactEmail: guest.email,
        contactPhone: guest.phone,
      },
    });

    await tx.listingCalendar.createMany({
      data: dates.map((d) => ({
        listingId,
        date: new Date(d),
        status: CalendarDayStatus.booked,
        source: CalendarDaySource.booking,
        bookingId: booking.id,
      })),
    });

    return booking;
  });
}

module.exports = { createBooking };
