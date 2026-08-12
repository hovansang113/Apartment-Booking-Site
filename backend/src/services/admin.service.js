const prisma = require('../config/prisma');
const AppError = require('../utils/appError');
const { ListingStatus } = require('@prisma/client');

// REQ_03: lấy danh sách listing theo status (mặc định pending)
async function getListings({ status, page = 1, limit = 20 }) {
  const where = status ? { status } : {};
  const skip = (Number(page) - 1) * Number(limit);

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        host: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: 'asc' },
      skip,
      take: Number(limit),
    }),
    prisma.listing.count({ where }),
  ]);

  return { listings, total, page: Number(page), limit: Number(limit) };
}

// REQ_03: admin duyệt (approved) hoặc đình chỉ (suspended) listing
async function updateListingStatus({ listingId, status, suspendReason }) {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) throw new AppError(404, 'Listing not found');

  // Bug #6: validate status transition hợp lệ
  if (listing.status === status) {
    throw new AppError(400, `Listing is already ${status}`);
  }

  if (status === ListingStatus.suspended && !suspendReason) {
    throw new AppError(400, 'suspendReason is required when suspending a listing');
  }

  return prisma.listing.update({
    where: { id: listingId },
    data: {
      status,
      suspendReason: status === ListingStatus.suspended ? suspendReason : null,
    },
    include: {
      images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      host: { select: { id: true, fullName: true, email: true } },
    },
  });
}

// REQ_04: lấy danh sách user (không bao gồm admin, không bao gồm guest)
async function getUsers({ role, status, page = 1, limit = 20 }) {
  const where = {
    role: { not: 'admin' },
    isGuest: false,
    ...(role ? { role } : {}),
    ...(status ? { status } : {}),
  };
  const skip = (Number(page) - 1) * Number(limit);

  const [rawUsers, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        _count: { select: { listings: true, bookings: true } },
        listings: { select: { _count: { select: { bookings: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.user.count({ where }),
  ]);

  const users = rawUsers.map(({ listings, _count, ...u }) => ({
    ...u,
    _count: {
      listings: _count.listings,
      bookings: listings.reduce((sum, l) => sum + l._count.bookings, 0),
    },
  }));

  return { users, total, page: Number(page), limit: Number(limit) };
}

// REQ_04: khoá hoặc mở khoá tài khoản user
async function updateUserStatus({ userId, status }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, 'User not found');
  if (user.role === 'admin') throw new AppError(403, 'Cannot change admin status');
  if (user.status === status) throw new AppError(400, `User is already ${status}`);

  return prisma.user.update({
    where: { id: userId },
    data: { status },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      status: true,
    },
  });
}

// Build chart buckets: week→7 days, month→days, quarter→13 weeks, year→12 months
async function buildChartData(period, periodStart, now) {
  const bookings = await prisma.booking.findMany({
    where: { status: 'approved', createdAt: { gte: periodStart, lte: now } },
    select: { createdAt: true, totalPrice: true },
  });

  if (period === 'week') {
    // 7 day buckets: Mon … today
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const buckets = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(periodStart); d.setDate(d.getDate() + i);
      return { label: days[i], date: d.toDateString(), value: 0 };
    });
    for (const b of bookings) {
      const ds = new Date(b.createdAt).toDateString();
      const bucket = buckets.find((bk) => bk.date === ds);
      if (bucket) bucket.value += Number(b.totalPrice);
    }
    return buckets.map(({ label, value }) => ({ label, value }));
  }

  if (period === 'month') {
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const buckets = Array.from({ length: daysInMonth }, (_, i) => ({
      label: String(i + 1),
      day: i + 1,
      value: 0,
    }));
    for (const b of bookings) {
      const d = new Date(b.createdAt).getDate();
      buckets[d - 1].value += Number(b.totalPrice);
    }
    return buckets.map(({ label, value }) => ({ label, value }));
  }

  if (period === 'quarter') {
    // 13 week buckets
    const buckets = Array.from({ length: 13 }, (_, i) => {
      const wStart = new Date(periodStart); wStart.setDate(wStart.getDate() + i * 7);
      return { label: `W${i + 1}`, wStart: new Date(wStart), value: 0 };
    });
    for (const b of bookings) {
      const t = new Date(b.createdAt).getTime();
      for (let i = buckets.length - 1; i >= 0; i--) {
        if (t >= buckets[i].wStart.getTime()) { buckets[i].value += Number(b.totalPrice); break; }
      }
    }
    return buckets.map(({ label, value }) => ({ label, value }));
  }

  // year → 12 month buckets
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const buckets = Array.from({ length: 12 }, (_, i) => ({ label: MONTHS[i], month: i, value: 0 }));
  for (const b of bookings) {
    const m = new Date(b.createdAt).getMonth();
    buckets[m].value += Number(b.totalPrice);
  }
  return buckets.map(({ label, value }) => ({ label, value }));
}

// Tính khoảng thời gian theo period
function getPeriodRange(period) {
  const now = new Date();
  let start, prevStart, prevEnd;

  switch (period) {
    case 'week': {
      const day = now.getDay() === 0 ? 6 : now.getDay() - 1; // Mon=0
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
      prevStart = new Date(start); prevStart.setDate(prevStart.getDate() - 7);
      prevEnd = start;
      break;
    }
    case 'quarter': {
      const q = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), q * 3, 1);
      prevStart = new Date(now.getFullYear(), q * 3 - 3, 1);
      prevEnd = start;
      break;
    }
    case 'year': {
      start = new Date(now.getFullYear(), 0, 1);
      prevStart = new Date(now.getFullYear() - 1, 0, 1);
      prevEnd = start;
      break;
    }
    case 'month':
    default: {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      prevEnd = start;
    }
  }
  return { start, prevStart, prevEnd };
}

// REQ stats: tổng quan cho admin dashboard
async function getStats({ period = 'month' } = {}) {
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const { start: periodStart, prevStart, prevEnd } = getPeriodRange(period);

  const [
    totalUsers,
    totalHosts,
    totalListings,
    pendingListings,
    approvedListings,
    suspendedListings,
    totalBookings,
    canceledBookings,
    rejectedBookings,
    revenuePeriod,
    revenuePrevPeriod,
    recentBookings,
    pendingListingItems,
  ] = await Promise.all([
    prisma.user.count({ where: { isGuest: false, role: { not: 'admin' } } }),
    prisma.user.count({ where: { role: 'host' } }),
    prisma.listing.count(),
    prisma.listing.count({ where: { status: 'pending' } }),
    prisma.listing.count({ where: { status: 'approved' } }),
    prisma.listing.count({ where: { status: 'suspended' } }),
    prisma.booking.count({ where: { createdAt: { gte: periodStart } } }),
    prisma.booking.count({ where: { status: 'canceled', createdAt: { gte: periodStart } } }),
    prisma.booking.count({ where: { status: 'rejected', createdAt: { gte: periodStart } } }),
    prisma.booking.aggregate({
      where: { status: 'approved', createdAt: { gte: periodStart } },
      _sum: { totalPrice: true },
    }),
    prisma.booking.aggregate({
      where: {
        status: 'approved',
        createdAt: { gte: prevStart, lt: prevEnd },
      },
      _sum: { totalPrice: true },
    }),
    prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: {
        listing: { select: { title: true } },
      },
    }),
    prisma.listing.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'asc' },
      take: 5,
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        host: { select: { fullName: true, email: true } },
      },
    }),
  ]);

  const thisPeriodRevenue = Number(revenuePeriod._sum.totalPrice ?? 0);
  const prevPeriodRevenue = Number(revenuePrevPeriod._sum.totalPrice ?? 0);
  const revenueGrowth = prevPeriodRevenue === 0
    ? null
    : Math.round(((thisPeriodRevenue - prevPeriodRevenue) / prevPeriodRevenue) * 100);

  const chartData = await buildChartData(period, periodStart, now);

  return {
    period,
    users: {
      total: totalUsers,
      hosts: totalHosts,
      guests: totalUsers - totalHosts,
    },
    listings: {
      total: totalListings,
      pending: pendingListings,
      approved: approvedListings,
      suspended: suspendedListings,
    },
    bookings: {
      total: totalBookings,
      canceled: canceledBookings,
      rejected: rejectedBookings,
    },
    revenue: {
      total: thisPeriodRevenue,
      thisPeriod: thisPeriodRevenue,
      prevPeriod: prevPeriodRevenue,
      growthPercent: revenueGrowth,
      chartData,
    },
    recentBookings: recentBookings.map((b) => ({
      id: b.id,
      guestName: b.contactName,
      guestEmail: b.contactEmail,
      listingTitle: b.listing?.title ?? '—',
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      totalPrice: Number(b.totalPrice),
      status: b.status,
      createdAt: b.createdAt,
    })),
    pendingListings: pendingListingItems.map((l) => ({
      id: l.id,
      title: l.title,
      address: l.address,
      image: l.images[0]?.imageUrl ?? null,
      hostName: l.host.fullName,
      hostEmail: l.host.email,
      createdAt: l.createdAt,
    })),
  };
}

module.exports = { getListings, updateListingStatus, getUsers, updateUserStatus, getStats };
