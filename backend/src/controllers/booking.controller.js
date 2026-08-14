const bookingService = require('../services/booking.service');
const { created } = require('../utils/response.util');

// REQ_07 - khach dat phong khong can dang nhap. Xem comment day du trong
// services/booking.service.js.
async function create(req, res) {
  const { listingId, checkIn, checkOut, contactName, contactEmail, contactPhone } = req.body;
  const booking = await bookingService.createBooking({
    listingId,
    checkIn,
    checkOut,
    contactName,
    contactEmail,
    contactPhone,
  });
  return created(res, booking, 'Đã giữ chỗ, vui lòng hoàn tất thanh toán trong 15 phút');
}

module.exports = { create };
