const prisma = require('../config/prisma');
const AppError = require('../utils/appError');
const { ok } = require('../utils/response.util');

// REQ_10: giả lập thanh toán thành công cho booking
async function confirmPayment(req, res) {
  const { bookingId } = req.params;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { listing: { select: { title: true, address: true } } },
  });

  if (!booking) throw new AppError(404, 'Booking not found');
  if (booking.guestId !== req.user.id) throw new AppError(403, 'Not your booking');
  if (booking.status !== 'approved') throw new AppError(400, 'Booking is not in approved status');

  // Idempotent — nếu đã có payment rồi thì trả về luôn
  const existing = await prisma.payment.findUnique({ where: { bookingId } });
  if (existing) return ok(res, { payment: existing, booking }, 'Payment already confirmed');

  const payment = await prisma.payment.create({
    data: { bookingId, amount: booking.totalPrice, status: 'simulated_success' },
  });

  return ok(res, { payment, booking }, 'Payment confirmed');
}

// Lấy thông tin payment của 1 booking (để hiển thị trang xác nhận)
async function getPayment(req, res) {
  const { bookingId } = req.params;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      listing: { select: { title: true, address: true, images: { take: 1, orderBy: { sortOrder: 'asc' } } } },
      payment: true,
    },
  });

  if (!booking) throw new AppError(404, 'Booking not found');
  if (booking.guestId !== req.user.id) throw new AppError(403, 'Not your booking');

  return ok(res, booking);
}

module.exports = { confirmPayment, getPayment };
