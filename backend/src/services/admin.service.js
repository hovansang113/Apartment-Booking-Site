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

  const [users, total] = await Promise.all([
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
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.user.count({ where }),
  ]);

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

module.exports = { getListings, updateListingStatus, getUsers, updateUserStatus };
