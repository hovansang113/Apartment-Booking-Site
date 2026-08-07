const bookingService = require('../services/booking.service');
const { ok, created } = require('../utils/response.util');

async function create(req, res) {
  const { listingId, checkIn, checkOut, contactName, contactEmail, contactPhone } = req.body;
  const booking = await bookingService.createBooking({
    guestId: req.user.id,
    listingId, checkIn, checkOut, contactName, contactEmail, contactPhone,
  });
  return created(res, booking, 'Đặt phòng thành công');
}

async function getMine(req, res) {
  const bookings = await bookingService.getMyBookings(req.user.id);
  return ok(res, bookings);
}

async function cancel(req, res) {
  const booking = await bookingService.cancelBooking({ bookingId: req.params.id, guestId: req.user.id });
  return ok(res, booking, 'Đã huỷ đặt phòng');
}

async function reject(req, res) {
  const { rejectedReason } = req.body;
  const booking = await bookingService.rejectBooking({ bookingId: req.params.id, hostId: req.user.id, rejectedReason });
  return ok(res, booking, 'Đã từ chối booking');
}

async function getListingBookings(req, res) {
  const bookings = await bookingService.getListingBookings(req.params.listingId, req.user.id);
  return ok(res, bookings);
}

module.exports = { create, getMine, cancel, reject, getListingBookings };
