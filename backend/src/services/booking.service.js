const crypto = require('crypto');
const { BookingStatus, PaymentStatus, CalendarDayStatus, CalendarDaySource } = require('@prisma/client');
const prisma = require('../config/prisma');
const AppError = require('../utils/appError');
const pricingService = require('./pricing.service');
const { findOrCreateGuestUser } = require('./auth.service');

// Hoa hong nen tang - tam thoi ve 0% theo yeu cau (21/8), vi hien tai chi co
// 1 host duy nhat (chinh Jason) nen thu hoa hong tu chinh minh khong co y
// nghia. Muc goc la 15% (doi chieu Airbnb/Booking.com) - doi lai khi co host
// thu 2 tro len, chi can sua so nay.
const COMMISSION_RATE_PERCENT = 0;

// Thoi gian giu cho truoc khi tu huy neu khach chua thanh toan xong.
const PAYMENT_HOLD_MINUTES = 15;
const MAX_STAY_NIGHTS = 365;

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

// Hủy các lượt giữ chỗ đã quá hạn và trả ngày về trạng thái trống. Hai việc
// phải chạy cùng lúc: nếu chỉ đổi booking sang expired mà còn giữ lịch, khách
// khác vẫn không thể đặt các ngày đó.
async function expireStalePaymentHolds(now = new Date()) {
  return prisma.$transaction(async (tx) => {
    const expired = await tx.booking.findMany({
      where: {
        status: BookingStatus.pending_payment,
        paymentExpiresAt: { lt: now },
      },
      select: { id: true },
    });

    if (expired.length === 0) return 0;

    const bookingIds = expired.map((booking) => booking.id);
    await tx.listingCalendar.deleteMany({
      where: {
        bookingId: { in: bookingIds },
        source: CalendarDaySource.booking,
      },
    });
    await tx.booking.updateMany({
      where: { id: { in: bookingIds } },
      data: { status: BookingStatus.expired },
    });
    return bookingIds.length;
  });
}

// REQ_07 (luong "chuan production" da duyet 14/8): khach dat phong KHONG can
// dang nhap - tu tim/tao tai khoan isGuest (dung chung logic voi REQ_14
// guestLogin qua findOrCreateGuestUser). Booking tao ra o trang thai
// pending_payment (KHONG con auto-approved nhu ban cu) va CHAN LICH NGAY -
// giong REQ_09 dang lam - de tranh 2 khach cung giu 1 ngay trong luc cho
// thanh toan. Payment tao san o trang thai pending (chua co
// braintreeTransactionId - chi co sau khi khach nhap the that qua Braintree
// Drop-in tren PaymentPage, xem payment.service.js#checkout); job rieng
// hold qua han duoc don luc server khoi dong, moi phut va truoc cac thao tac
// dat/checkout de ngay het han duoc giai phong dung luc.
async function createBooking({
  listingId,
  checkIn,
  checkOut,
  contactName,
  contactEmail,
  contactPhone,
  contactAddress,
  contactCity,
  contactPostcode,
  adults,
  children,
}) {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  if (!(checkOutDate > checkInDate)) {
    throw new AppError(422, 'checkOut must be at least 1 night after checkIn');
  }
  if ((checkOutDate - checkInDate) / (24 * 60 * 60 * 1000) > MAX_STAY_NIGHTS) {
    throw new AppError(422, `A stay cannot exceed ${MAX_STAY_NIGHTS} nights`);
  }
  const dates = datesBetween(checkIn, checkOut);
  if (dates.length === 0) {
    throw new AppError(422, 'checkOut must be at least 1 night after checkIn');
  }

  // Không chờ tối đa một phút đến lượt cron: lượt giữ chỗ vừa hết hạn phải
  // được trả lại ngay trước khi khách khác kiểm tra lịch.
  await expireStalePaymentHolds();

  try {
    return await prisma.$transaction(async (tx) => {
      const listing = await tx.listing.findUnique({ where: { id: listingId } });
    if (!listing) {
      throw new AppError(404, 'Listing not found');
    }
    if (listing.status !== 'approved') {
      throw new AppError(404, 'Listing not found');
    }

    const totalGuests = adults + (children || 0);
    if (totalGuests > listing.guestCapacity) {
      throw new AppError(422, `This place allows a maximum of ${listing.guestCapacity} guests`);
    }

    const targets = dates.map((d) => new Date(d));
    const conflicts = await tx.listingCalendar.findMany({
      where: { listingId, date: { in: targets } },
    });
    if (conflicts.length > 0) {
      throw new AppError(409, `${toYMD(conflicts[0].date)} is already booked or blocked`);
    }

    // Validate default min/max nights cua listing (ap dung cho moi booking
    // neu khong co stay rule rieng cho ngay check-in do).
    const stayRule = await tx.listingStayRule.findUnique({
      where: { listingId_date: { listingId, date: new Date(checkIn) } },
    });
    const effectiveMin = stayRule?.minNights ?? listing.minNights;
    const effectiveMax = stayRule?.maxNights ?? listing.maxNights;
    if (effectiveMin && dates.length < effectiveMin) {
      throw new AppError(422, `This listing requires a minimum stay of ${effectiveMin} nights`);
    }
    if (effectiveMax && dates.length > effectiveMax) {
      throw new AppError(422, `This listing allows a maximum stay of ${effectiveMax} nights`);
    }

    const guest = await findOrCreateGuestUser(tx, {
      email: contactEmail,
      fullName: contactName,
      phone: contactPhone,
    });

    const nightlyTotal = await pricingService.calculateTotalPrice(tx, { listing, dates });
    // Phi don dep cong 1 lan/booking (khong nhan theo so dem, khac tien phong) -
    // luu snapshot vao Booking.cleaningFee, tinh hoa hong tren CA total gop
    // (nightly + phi don), giong cach Airbnb/Booking.com xu ly hoa hong tren
    // toan bo so tien khach tra, khong chi rieng tien phong.
    const cleaningFee = Number(listing.cleaningFee);
    const totalPrice = nightlyTotal + cleaningFee;
    const commissionAmount = Math.round(totalPrice * COMMISSION_RATE_PERCENT) / 100;
    const hostPayoutAmount = totalPrice - commissionAmount;

    const booking = await tx.booking.create({
      data: {
        listingId,
        guestId: guest.id,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        adultsCount: adults,
        childrenCount: children || 0,
        totalPrice,
        cleaningFee,
        status: BookingStatus.pending_payment,
        bookingCode: generateBookingCode(),
        commissionRate: COMMISSION_RATE_PERCENT,
        commissionAmount,
        hostPayoutAmount,
        paymentExpiresAt: new Date(Date.now() + PAYMENT_HOLD_MINUTES * 60 * 1000),
        contactName,
        contactEmail,
        contactPhone: contactPhone || null,
        contactAddress,
        contactCity,
        contactPostcode: contactPostcode || null,
        payment: {
          create: {
            amount: totalPrice,
            status: PaymentStatus.pending,
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
  } catch (err) {
    // unique(listing_id, date) la hang rao cuoi cung khi 2 request den cung
    // luc. Chuyen loi unique constraint thanh 409 thay vi de client nhan 500.
    if (err.code === 'P2002') {
      throw new AppError(409, 'One or more selected dates are already booked or blocked');
    }
    throw err;
  }
}

// Cho trang thanh toan (payment page) - cong khai qua UUID khong doan duoc,
// khong yeu cau dang nhap/email khop (khac voi Phase 7 "tra cuu bang
// bookingCode+email" se lam sau, dung cho khach tu tim lai booking cu). Trang
// thanh toan luon dieu huong toi day ngay sau khi tao booking nen chi can
// UUID la du an toan cho quy mo du an nay.
async function getBookingById(id) {
  await expireStalePaymentHolds();
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      payment: true,
      listing: {
        select: {
          title: true,
          address: true,
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        },
      },
    },
  });
  if (!booking) {
    throw new AppError(404, 'Booking not found');
  }
  return booking;
}

// Cho HostTodayPage - danh sach booking cua host, gop tu tat ca listing cua
// ho. Chi lay status=confirmed (da thanh toan that qua Braintree) - loai bo
// cac hold pending_payment con dang do (chua thanh toan/da het han, xem
// PAYMENT_HOLD_MINUTES o tren) de khong lam nhieu danh sach voi booking chua
// thanh cong.
async function getBookingsByHost(hostId) {
  await expireStalePaymentHolds();
  return prisma.booking.findMany({
    where: { listing: { hostId }, status: BookingStatus.confirmed },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          address: true,
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        },
      },
    },
    orderBy: { checkIn: 'asc' },
  });
}

async function getBookingsByGuest(guestId) {
  await expireStalePaymentHolds();
  return prisma.booking.findMany({
    where: { guestId },
    select: {
      id: true,
      bookingCode: true,
      checkIn: true,
      checkOut: true,
      adultsCount: true,
      childrenCount: true,
      totalPrice: true,
      status: true,
      paymentExpiresAt: true,
      listing: {
        select: {
          id: true,
          title: true,
          address: true,
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

module.exports = {
  createBooking,
  getBookingById,
  getBookingsByHost,
  getBookingsByGuest,
  expireStalePaymentHolds,
};
