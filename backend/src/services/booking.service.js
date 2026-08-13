const crypto = require('crypto');
const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');
const AppError = require('../utils/appError');
const { createNotification } = require('./notification.service');
const { sendBookingConfirmationEmail } = require('./email.service');

function calcNights(checkIn, checkOut) {
  const ms = new Date(checkOut) - new Date(checkIn);
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

// Tính tổng giá có tính price override từng ngày
async function calcTotalPrice(listingId, defaultPrice, checkIn, checkOut) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);

  // Lấy tất cả override trong khoảng [checkIn, checkOut)
  const overrides = await prisma.listingPriceOverride.findMany({
    where: {
      listingId,
      date: { gte: start, lt: end },
    },
  });

  const overrideMap = new Map(
    overrides.map((o) => [o.date.toISOString().slice(0, 10), Number(o.price)])
  );

  let total = 0;
  const current = new Date(start);
  while (current < end) {
    const key = current.toISOString().slice(0, 10);
    total += overrideMap.has(key) ? overrideMap.get(key) : Number(defaultPrice);
    current.setDate(current.getDate() + 1);
  }
  return total;
}

// REQ_07: tạo booking, kiểm tra conflict ngày trong transaction
async function createBooking({ guestId, listingId, checkIn, checkOut, guestCount = 1, contactName, contactEmail, contactPhone }) {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) throw new AppError(404, 'Listing not found');
  if (listing.status !== 'approved') throw new AppError(400, 'Listing is not available for booking');

  // Bug #5: host/admin không được self-book
  if (listing.hostId === guestId) throw new AppError(400, 'Host cannot book their own listing');

  if (guestCount < 1 || guestCount > listing.guestCapacity)
    throw new AppError(400, `Số khách phải từ 1 đến ${listing.guestCapacity}`);

  if (isNaN(new Date(checkIn)) || isNaN(new Date(checkOut))) throw new AppError(400, 'Invalid date format');
  const nights = calcNights(checkIn, checkOut);
  if (nights < 1) throw new AppError(400, 'Check-out must be after check-in');

  // Bug #4: tính giá theo override từng ngày
  const totalPrice = await calcTotalPrice(listingId, listing.defaultPrice, checkIn, checkOut);

  // Bug #1: dùng Serializable để tránh race condition double-booking
  const booking = await prisma.$transaction(
    async (tx) => {
      const conflict = await tx.listingCalendar.findFirst({
        where: {
          listingId,
          date: { gte: new Date(checkIn), lt: new Date(checkOut) },
          // Bug #2: kiểm tra cả blocked lẫn booked
          status: { in: ['booked', 'blocked'] },
        },
      });
      if (conflict) throw new AppError(409, 'Listing is not available for the selected dates');

      const booking = await tx.booking.create({
        data: {
          listingId,
          guestId,
          checkIn: new Date(checkIn),
          checkOut: new Date(checkOut),
          totalPrice,
          guestCount: Number(guestCount),
          contactName,
          contactEmail,
          contactPhone,
          status: 'approved',
          approvedAt: new Date(),
        },
      });

      const dates = [];
      const current = new Date(checkIn);
      const end = new Date(checkOut);
      while (current < end) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }

      // Bug #2: không dùng skipDuplicates — nếu có conflict thật thì phải throw
      await tx.listingCalendar.createMany({
        data: dates.map((date) => ({
          id: crypto.randomUUID(), // Bug #6: require crypto một lần ở đầu file
          listingId,
          date,
          status: 'booked',
          source: 'booking',
          bookingId: booking.id,
        })),
      });

      return booking;
    },
    { isolationLevel: 'Serializable' }
  );

  // Gửi notification cho host sau khi transaction thành công
  // Chạy ngoài transaction để lỗi notification không rollback booking
  await createNotification({
    userId: listing.hostId,
    title: 'New booking received',
    body: `${contactName} booked "${listing.title}" from ${checkIn} to ${checkOut}. Total: ${totalPrice.toLocaleString()} VND.`,
  }).catch(() => {}); // notification thất bại không ảnh hưởng booking

  return booking;
}

// REQ_07: guest xem booking của mình
async function getMyBookings(guestId) {
  return prisma.booking.findMany({
    where: { guestId },
    include: {
      listing: {
        include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// REQ_11: guest huỷ booking
async function cancelBooking({ bookingId, guestId }) {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new AppError(404, 'Booking not found');
    if (booking.guestId !== guestId) throw new AppError(403, 'Not your booking');
    if (!['approved', 'pending'].includes(booking.status)) {
      throw new AppError(400, 'Booking cannot be canceled in its current status');
    }
    await tx.listingCalendar.deleteMany({ where: { bookingId } });
    return tx.booking.update({
      where: { id: bookingId },
      data: { status: 'canceled', canceledAt: new Date() },
    });
  });
}

// REQ_08: host từ chối booking
async function rejectBooking({ bookingId, hostId, rejectedReason }) {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: { listing: true },
    });
    if (!booking) throw new AppError(404, 'Booking not found');
    if (!booking.listing) throw new AppError(404, 'Listing no longer exists');
    if (booking.listing.hostId !== hostId) throw new AppError(403, 'Not your listing');
    if (!['approved', 'pending'].includes(booking.status)) {
      throw new AppError(400, 'Booking cannot be rejected in its current status');
    }
    await tx.listingCalendar.deleteMany({ where: { bookingId } });
    return tx.booking.update({
      where: { id: bookingId },
      data: { status: 'rejected', rejectedReason },
    });
  });
}

// REQ_08: host xem booking của listing mình
async function getListingBookings(listingId, hostId) {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) throw new AppError(404, 'Listing not found');
  if (listing.hostId !== hostId) throw new AppError(403, 'Not your listing');

  return prisma.booking.findMany({
    where: { listingId },
    include: { guest: { select: { id: true, fullName: true, email: true, phone: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

// --- Host stats helpers ---
function getHostPeriodRange(period) {
  const now = new Date();
  switch (period) {
    case 'week': {
      const day = now.getDay() === 0 ? 6 : now.getDay() - 1;
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
    }
    case 'quarter': {
      const q = Math.floor(now.getMonth() / 3);
      return new Date(now.getFullYear(), q * 3, 1);
    }
    case 'year':
      return new Date(now.getFullYear(), 0, 1);
    case 'month':
    default:
      return new Date(now.getFullYear(), now.getMonth(), 1);
  }
}

function buildHostChartData(period, bookings) {
  const now = new Date();
  const periodStart = getHostPeriodRange(period);

  const filtered = bookings.filter((b) => b.createdAt >= periodStart);

  if (period === 'week') {
    const days = ['T2','T3','T4','T5','T6','T7','CN'];
    const buckets = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(periodStart); d.setDate(d.getDate() + i);
      return { label: days[i], date: d.toDateString(), value: 0 };
    });
    for (const b of filtered) {
      const ds = new Date(b.createdAt).toDateString();
      const bk = buckets.find((x) => x.date === ds);
      if (bk) bk.value += Number(b.totalPrice);
    }
    return buckets.map(({ label, value }) => ({ label, value }));
  }

  if (period === 'month') {
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const buckets = Array.from({ length: daysInMonth }, (_, i) => ({ label: String(i + 1), day: i + 1, value: 0 }));
    for (const b of filtered) {
      const d = new Date(b.createdAt).getDate();
      buckets[d - 1].value += Number(b.totalPrice);
    }
    return buckets.map(({ label, value }) => ({ label, value }));
  }

  if (period === 'quarter') {
    const buckets = Array.from({ length: 13 }, (_, i) => {
      const wStart = new Date(periodStart); wStart.setDate(wStart.getDate() + i * 7);
      return { label: `T${i + 1}`, wStart: new Date(wStart), value: 0 };
    });
    for (const b of filtered) {
      const t = new Date(b.createdAt).getTime();
      for (let i = buckets.length - 1; i >= 0; i--) {
        if (t >= buckets[i].wStart.getTime()) { buckets[i].value += Number(b.totalPrice); break; }
      }
    }
    return buckets.map(({ label, value }) => ({ label, value }));
  }

  // year → 12 tháng
  const MONTHS = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
  const buckets = Array.from({ length: 12 }, (_, i) => ({ label: MONTHS[i], month: i, value: 0 }));
  for (const b of filtered) {
    const m = new Date(b.createdAt).getMonth();
    buckets[m].value += Number(b.totalPrice);
  }
  return buckets.map(({ label, value }) => ({ label, value }));
}

// Revenue & stats dashboard cho host
async function getHostStats(hostId, period = 'month') {
  const listings = await prisma.listing.findMany({
    where: { hostId },
    select: { id: true },
  });
  const listingIds = listings.map((l) => l.id);

  if (listingIds.length === 0) {
    return { totalRevenue: 0, totalBookings: 0, byStatus: {}, chartData: [] };
  }

  const periodStart = getHostPeriodRange(period);

  const [allBookings, revenueAllTime, revenuePeriod] = await Promise.all([
    prisma.booking.groupBy({
      by: ['status'],
      where: { listingId: { in: listingIds } },
      _count: { id: true },
    }),
    prisma.booking.findMany({
      where: { listingId: { in: listingIds }, status: 'approved' },
      select: { totalPrice: true, createdAt: true },
    }),
    prisma.booking.aggregate({
      where: { listingId: { in: listingIds }, status: 'approved', createdAt: { gte: periodStart } },
      _sum: { totalPrice: true },
    }),
  ]);

  const byStatus = Object.fromEntries(allBookings.map((g) => [g.status, g._count.id]));
  const totalRevenue = Number(revenuePeriod._sum.totalPrice || 0);
  const totalBookings = allBookings.reduce((sum, g) => sum + g._count.id, 0);
  const chartData = buildHostChartData(period, revenueAllTime);

  return { totalRevenue, totalBookings, byStatus, chartData, period };
}

// Guest booking (no auth) — tạo hoặc tìm guest user, sinh guestToken, gửi email
async function createGuestBooking({ listingId, checkIn, checkOut, guestCount = 1, contactName, contactEmail, contactPhone }) {
  // Nếu email đã có tài khoản thật → yêu cầu đăng nhập
  let guestUser = await prisma.user.findUnique({ where: { email: contactEmail } });
  if (guestUser && !guestUser.isGuest) {
    throw new AppError(409, 'Email này đã có tài khoản. Vui lòng đăng nhập để đặt phòng.');
  }
  if (!guestUser) {
    const passwordHash = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);
    guestUser = await prisma.user.create({
      data: { email: contactEmail, passwordHash, fullName: contactName, phone: contactPhone, role: 'user', isGuest: true },
    });
  }

  const guestToken = crypto.randomBytes(32).toString('hex');

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) throw new AppError(404, 'Listing not found');
  if (listing.status !== 'approved') throw new AppError(400, 'Listing is not available for booking');

  if (guestCount < 1 || guestCount > listing.guestCapacity)
    throw new AppError(400, `So khach phai tu 1 den ${listing.guestCapacity}`);

  const nights = calcNights(checkIn, checkOut);
  if (nights < 1) throw new AppError(400, 'Check-out must be after check-in');

  const totalPrice = await calcTotalPrice(listingId, listing.defaultPrice, checkIn, checkOut);

  const booking = await prisma.$transaction(
    async (tx) => {
      const conflict = await tx.listingCalendar.findFirst({
        where: { listingId, date: { gte: new Date(checkIn), lt: new Date(checkOut) }, status: { in: ['booked', 'blocked'] } },
      });
      if (conflict) throw new AppError(409, 'Listing is not available for the selected dates');

      const created = await tx.booking.create({
        data: {
          listingId,
          guestId: guestUser.id,
          checkIn: new Date(checkIn),
          checkOut: new Date(checkOut),
          totalPrice,
          guestCount: Number(guestCount),
          contactName,
          contactEmail,
          contactPhone,
          status: 'approved',
          approvedAt: new Date(),
          guestToken,
        },
      });

      const dates = [];
      const current = new Date(checkIn);
      const end = new Date(checkOut);
      while (current < end) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      await tx.listingCalendar.createMany({
        data: dates.map((date) => ({
          id: crypto.randomUUID(),
          listingId,
          date,
          status: 'booked',
          source: 'booking',
          bookingId: created.id,
        })),
      });

      return created;
    },
    { isolationLevel: 'Serializable' }
  );

  // Gửi notification host
  await createNotification({
    userId: listing.hostId,
    title: 'New booking received',
    body: `${contactName} booked "${listing.title}" from ${checkIn} to ${checkOut}. Total: ${Number(totalPrice).toLocaleString()} VND.`,
  }).catch(() => {});

  // Gửi email xác nhận cho guest
  await sendBookingConfirmationEmail({ contactEmail, contactName, booking, listing, guestToken }).catch(() => {});

  return { bookingId: booking.id, message: 'Email xác nhận đã được gửi tới ' + contactEmail };
}

// Xem chi tiết booking bằng guestToken (không cần auth)
async function getBookingByGuestToken(token) {
  const booking = await prisma.booking.findUnique({
    where: { guestToken: token },
    include: {
      listing: { include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } } },
    },
  });
  if (!booking) throw new AppError(404, 'Booking not found');
  return booking;
}

// Huỷ booking bằng guestToken (không cần auth)
async function cancelBookingByGuestToken(token) {
  const booking = await prisma.booking.findUnique({ where: { guestToken: token } });
  if (!booking) throw new AppError(404, 'Booking not found');
  if (!['approved', 'pending'].includes(booking.status)) {
    throw new AppError(400, 'Booking cannot be canceled in its current status');
  }

  return prisma.$transaction(async (tx) => {
    await tx.listingCalendar.deleteMany({ where: { bookingId: booking.id } });
    return tx.booking.update({
      where: { id: booking.id },
      data: { status: 'canceled', canceledAt: new Date() },
    });
  });
}

module.exports = { createBooking, createGuestBooking, getMyBookings, cancelBooking, rejectBooking, getListingBookings, getHostStats, getBookingByGuestToken, cancelBookingByGuestToken };
