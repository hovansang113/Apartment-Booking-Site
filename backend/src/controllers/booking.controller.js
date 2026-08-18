const bookingService = require('../services/booking.service');
const { created, ok } = require('../utils/response.util');

// REQ_07 - khach dat phong khong can dang nhap. Xem comment day du trong
// services/booking.service.js.
async function create(req, res) {
  const {
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
  } = req.body;
  const booking = await bookingService.createBooking({
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
  });
  return created(res, booking, 'Reservation held, please complete payment within 15 minutes');
}

// Cho trang thanh toan rieng - xem comment trong booking.service.js
async function getOne(req, res) {
  const booking = await bookingService.getBookingById(req.params.id);
  return ok(res, booking);
}

module.exports = { create, getOne };
