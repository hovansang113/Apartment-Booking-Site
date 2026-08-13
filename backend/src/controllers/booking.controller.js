const bookingService = require('../services/booking.service');
const { created } = require('../utils/response.util');

// TAM THOI - ban toi gian de test REQ_12 (chan booking len ngay bi block).
// Xem comment day du trong services/booking.service.js.
async function create(req, res) {
  const { listingId, checkIn, checkOut } = req.body;
  const booking = await bookingService.createBooking({
    listingId,
    guestId: req.user.id,
    checkIn,
    checkOut,
  });
  return created(res, booking, 'Đặt phòng thành công');
}

module.exports = { create };
