const crypto = require('crypto');
const { BookingStatus, PaymentStatus, CalendarDayStatus, CalendarDaySource } = require('@prisma/client');
const prisma = require('../config/prisma');
const AppError = require('../utils/appError');
const pricingService = require('./pricing.service');
const { findOrCreateGuestUser } = require('./auth.service');

// Hoa hong nen tang (REQ_13-ish/luong thanh toan) - chot 15% sau khi doi
// chieu Airbnb (host-only fee 15.5%, ap dung toan cau tu 2026) va Booking.com
// (trung binh ~15%). Chua co UI cho admin doi so nay - hardcode 1 cho tam
// thoi, muon doi thi sua o day.
const COMMISSION_RATE_PERCENT = 15;

// Thoi gian giu cho truoc khi tu huy neu khach chua thanh toan xong.
const PAYMENT_HOLD_MINUTES = 15;

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

// Ma tra cuu ngan, de doc/go tay - dung trong email xac nhan + trang "Tra
// cuu dat phong" (bookingCode + email, khong can dang nhap). 8 ky tu hex la
// du hiem va cho quy mo du an nay, khong can vong lap thu lai neu trung.
function generateBookingCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

// Ma giao dich gui cho VNPay (vnp_TxnRef) - sinh san tu luc tao booking de
// Phase 3 (tao payment URL) dung lai, khong phai tao lai booking.
function generateVnpTxnRef() {
  return crypto.randomBytes(8).toString('hex');
}

// REQ_07 (luong "chuan production" da duyet 14/8): khach dat phong KHONG can
// dang nhap - tu tim/tao tai khoan isGuest (dung chung logic voi REQ_14
// guestLogin qua findOrCreateGuestUser). Booking tao ra o trang thai
// pending_payment (KHONG con auto-approved nhu ban cu) va CHAN LICH NGAY -
// giong REQ_09 dang lam - de tranh 2 khach cung giu 1 ngay trong luc cho
// thanh toan. Payment.service.js (Phase 3) se tao URL VNPay dua tren
// vnpTxnRef da sinh san o day; job rieng (Phase 5) se tu huy booking qua han
// paymentExpiresAt chua thanh toan.
async function createBooking({ listingId, checkIn, checkOut, contactName, contactEmail, contactPhone }) {
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

    // "Custom settings" (REQ_12) - so dem toi thieu/toi da NEU check-in dung
    // ngay checkIn nay. Chi ap dung rule cua ngay check-in, giong Airbnb that.
    const stayRule = await tx.listingStayRule.findUnique({
      where: { listingId_date: { listingId, date: new Date(checkIn) } },
    });
    if (stayRule?.minNights && dates.length < stayRule.minNights) {
      throw new AppError(422, `Ngày ${checkIn} yêu cầu ở tối thiểu ${stayRule.minNights} đêm`);
    }
    if (stayRule?.maxNights && dates.length > stayRule.maxNights) {
      throw new AppError(422, `Ngày ${checkIn} chỉ cho ở tối đa ${stayRule.maxNights} đêm`);
    }

    const guest = await findOrCreateGuestUser(tx, {
      email: contactEmail,
      fullName: contactName,
      phone: contactPhone,
    });

    const totalPrice = await pricingService.calculateTotalPrice(tx, { listing, dates });
    const commissionAmount = Math.round(totalPrice * COMMISSION_RATE_PERCENT) / 100;
    const hostPayoutAmount = totalPrice - commissionAmount;

    const booking = await tx.booking.create({
      data: {
        listingId,
        guestId: guest.id,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        totalPrice,
        status: BookingStatus.pending_payment,
        bookingCode: generateBookingCode(),
        commissionRate: COMMISSION_RATE_PERCENT,
        commissionAmount,
        hostPayoutAmount,
        paymentExpiresAt: new Date(Date.now() + PAYMENT_HOLD_MINUTES * 60 * 1000),
        contactName,
        contactEmail,
        contactPhone: contactPhone || null,
        payment: {
          create: {
            amount: totalPrice,
            status: PaymentStatus.pending,
            vnpTxnRef: generateVnpTxnRef(),
          },
        },
      },
      include: { payment: true },
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
