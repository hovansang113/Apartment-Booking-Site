const prisma = require('../config/prisma');
const AppError = require('../utils/appError');

// Tính số đêm giữa 2 ngày
function calcNights(checkIn, checkOut) {
  const ms = new Date(checkOut) - new Date(checkIn);
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

// REQ_07: tạo booking, kiểm tra conflict ngày trong transaction
async function createBooking({ guestId, listingId, checkIn, checkOut, contactName, contactEmail, contactPhone }) {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) throw new AppError(404, 'Listing not found');
  if (listing.status !== 'approved') throw new AppError(400, 'Listing is not available for booking');

  const nights = calcNights(checkIn, checkOut);
  if (nights < 1) throw new AppError(400, 'Check-out must be after check-in');

  const totalPrice = Number(listing.defaultPrice) * nights;

  // REQ_09: kiểm tra conflict trong transaction
  return prisma.$transaction(async (tx) => {
    const conflict = await tx.listingCalendar.findFirst({
      where: {
        listingId,
        date: { gte: new Date(checkIn), lt: new Date(checkOut) },
        status: 'booked',
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
        contactName,
        contactEmail,
        contactPhone,
        status: 'approved',
        approvedAt: new Date(),
      },
    });

    // Đánh dấu calendar
    const dates = [];
    const current = new Date(checkIn);
    const end = new Date(checkOut);
    while (current < end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    await tx.listingCalendar.createMany({
      data: dates.map((date) => ({
        id: require('crypto').randomUUID(),
        listingId,
        date,
        status: 'booked',
        source: 'booking',
        bookingId: booking.id,
      })),
      skipDuplicates: true,
    });

    return booking;
  });
}

// REQ_07: guest/user xem booking của mình
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
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new AppError(404, 'Booking not found');
  if (booking.guestId !== guestId) throw new AppError(403, 'Not your booking');
  if (booking.status === 'canceled') throw new AppError(400, 'Booking already canceled');

  return prisma.$transaction(async (tx) => {
    await tx.listingCalendar.deleteMany({ where: { bookingId } });
    return tx.booking.update({
      where: { id: bookingId },
      data: { status: 'canceled', canceledAt: new Date() },
    });
  });
}

// REQ_08: host từ chối booking
async function rejectBooking({ bookingId, hostId, rejectedReason }) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { listing: true },
  });
  if (!booking) throw new AppError(404, 'Booking not found');
  if (booking.listing.hostId !== hostId) throw new AppError(403, 'Not your listing');
  if (booking.status !== 'approved') throw new AppError(400, 'Can only reject approved bookings');

  return prisma.$transaction(async (tx) => {
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

module.exports = { createBooking, getMyBookings, cancelBooking, rejectBooking, getListingBookings };
