const { ListingStatus, UserStatus, UserRole, VerificationStatus } = require('@prisma/client');
const prisma = require('../config/prisma');
const AppError = require('../utils/appError');

function sanitizeUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

// REQ_03: danh sach listing cho admin duyet - loc theo status (mac dinh
// pending, vi day la hang doi can xu ly), kem thong tin host de admin biet
// ai dang.
async function listListings({ status }) {
  return prisma.listing.findMany({
    where: status ? { status } : undefined,
    include: { host: { select: { id: true, fullName: true, email: true } }, images: { take: 1 } },
    orderBy: { createdAt: 'asc' },
  });
}

// REQ_03: duyet 1 listing dang pending
async function approveListing(listingId) {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) {
    throw new AppError(404, 'Listing not found');
  }
  return prisma.listing.update({
    where: { id: listingId },
    data: { status: ListingStatus.approved, suspendReason: null },
  });
}

// REQ_03: dinh chi 1 listing (dang pending hoac dang approved) - bat buoc co ly do
async function suspendListing(listingId, reason) {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) {
    throw new AppError(404, 'Listing not found');
  }
  return prisma.listing.update({
    where: { id: listingId },
    data: { status: ListingStatus.suspended, suspendReason: reason },
  });
}

// REQ_04: danh sach user cho admin quan ly - khong tra ve passwordHash
async function listUsers({ role, status }) {
  const users = await prisma.user.findMany({
    where: {
      ...(role ? { role } : {}),
      ...(status ? { status } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });
  return users.map(sanitizeUser);
}

// REQ_04: khoa 1 tai khoan - khong cho khoa admin khac (tranh tu khoa het
// quyen truy cap he thong)
async function lockUser(userId, reason) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(404, 'User not found');
  }
  if (user.role === UserRole.admin) {
    throw new AppError(403, 'Cannot lock another admin account');
  }
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { status: UserStatus.locked, lockedReason: reason },
  });
  return sanitizeUser(updated);
}

async function unlockUser(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(404, 'User not found');
  }
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { status: UserStatus.active, lockedReason: null },
  });
  return sanitizeUser(updated);
}

// Duyet ho so thue/giay to host da nop (noi tiep tinh nang Host Settings)
async function listTaxVerifications({ status }) {
  const users = await prisma.user.findMany({
    where: { verificationStatus: status || VerificationStatus.pending },
    orderBy: { updatedAt: 'asc' },
  });
  return users.map(sanitizeUser);
}

async function reviewTaxInfo(userId, { status, note }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(404, 'User not found');
  }
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { verificationStatus: status, verificationNote: note || null },
  });
  return sanitizeUser(updated);
}

module.exports = {
  listListings,
  approveListing,
  suspendListing,
  listUsers,
  lockUser,
  unlockUser,
  listTaxVerifications,
  reviewTaxInfo,
};
