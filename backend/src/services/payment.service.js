const { PaymentStatus, BookingStatus } = require('@prisma/client');
const prisma = require('../config/prisma');
const AppError = require('../utils/appError');
const {
  signVnpayParams,
  sortAndEncodeParams,
  toQueryString,
  formatVnpayDate,
  verifySignature,
} = require('../utils/vnpay.util');
const { stripVietnameseDiacritics } = require('../utils/text.util');

const VNPAY_VERSION = '2.1.0';
const VNPAY_COMMAND = 'pay';
const VNPAY_CURR_CODE = 'VND';
const VNPAY_ORDER_TYPE = 'other'; // ma loai hang hoa chung, VNPay khong bat buoc phai khop danh muc that

// REQ_07 Phase 3: tao URL redirect sang trang thanh toan VNPay Sandbox cho 1
// booking dang cho thanh toan. Dung lai dung `vnpTxnRef` da sinh san luc tao
// booking (Phase 2) - khong tao moi o day, vi 1 Payment chi duoc phep co 1
// txn ref co dinh (VNPay yeu cau khong trung vnp_TxnRef trong ngay).
async function createPaymentUrl({ bookingId, ipAddr, locale }) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true, listing: { select: { title: true } } },
  });

  if (!booking || !booking.payment) {
    throw new AppError(404, 'Booking not found');
  }
  if (booking.status !== 'pending_payment') {
    throw new AppError(409, 'Booking này không còn ở trạng thái chờ thanh toán');
  }
  if (booking.paymentExpiresAt && booking.paymentExpiresAt < new Date()) {
    throw new AppError(410, 'Đã hết thời gian giữ chỗ, vui lòng đặt lại');
  }

  const tmnCode = process.env.VNPAY_TMN_CODE;
  const hashSecret = process.env.VNPAY_HASH_SECRET;
  const paymentUrl = process.env.VNPAY_PAYMENT_URL;
  if (!tmnCode || !hashSecret || !paymentUrl) {
    throw new AppError(500, 'Chưa cấu hình VNPAY_TMN_CODE/VNPAY_HASH_SECRET/VNPAY_PAYMENT_URL trong .env');
  }

  const now = new Date();
  // vnp_OrderInfo bat buoc tieng Viet KHONG DAU, khong ky tu dac biet (spec
  // VNPay) - tai dung ham bo dau da co san cho ten chu tai khoan ngan hang.
  const orderInfo = stripVietnameseDiacritics(`Thanh toan booking ${booking.bookingCode} - ${booking.listing.title}`);

  const params = {
    vnp_Version: VNPAY_VERSION,
    vnp_Command: VNPAY_COMMAND,
    vnp_TmnCode: tmnCode,
    vnp_Amount: Math.round(Number(booking.payment.amount) * 100),
    vnp_CreateDate: formatVnpayDate(now),
    vnp_CurrCode: VNPAY_CURR_CODE,
    vnp_IpAddr: ipAddr,
    vnp_Locale: locale === 'en' ? 'en' : 'vn',
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: VNPAY_ORDER_TYPE,
    vnp_ReturnUrl: `${process.env.CLIENT_URL}/booking/vnpay-return`,
    vnp_TxnRef: booking.payment.vnpTxnRef,
    vnp_ExpireDate: formatVnpayDate(booking.paymentExpiresAt || new Date(now.getTime() + 15 * 60 * 1000)),
  };

  const secureHash = signVnpayParams(params, hashSecret);
  const query = toQueryString(sortAndEncodeParams(params));

  return `${paymentUrl}?${query}&vnp_SecureHash=${secureHash}`;
}

// Phase 4 - xu ly ket qua thanh toan tu VNPay. Dung CHUNG cho ca 2 duong:
// IPN that (VNPay goi server-to-server, la nguon xac nhan chinh thuc khi len
// production co domain/ngrok that) VA "verify-return" (trinh duyet khach goi
// khi quay ve /booking/vnpay-return). Ly do can ca 2 duong cung xu ly duoc:
// VNPay Sandbox KHONG goi IPN vao duoc `localhost` luc dev, nen thieu duong
// return-confirm thi khong test dc tron ven tren may local. Verify chu ky
// that (khong tin mu query string) + idempotent (payment da xu ly roi thi
// tra lai ket qua cu, khong xu ly lai) nen du ca IPN lan return cung goi vao
// cung khong bi xu ly trung.
async function confirmPayment(vnpParams) {
  const hashSecret = process.env.VNPAY_HASH_SECRET;
  if (!hashSecret) {
    throw new AppError(500, 'Chưa cấu hình VNPAY_HASH_SECRET trong .env');
  }

  if (!verifySignature(vnpParams, hashSecret)) {
    return { code: 'invalid_signature', message: 'Sai chữ ký, có thể URL đã bị sửa' };
  }

  const payment = await prisma.payment.findUnique({
    where: { vnpTxnRef: vnpParams.vnp_TxnRef },
    include: { booking: { include: { listing: { select: { title: true } } } } },
  });
  if (!payment) {
    return { code: 'not_found', message: 'Không tìm thấy giao dịch' };
  }

  if (payment.status !== PaymentStatus.pending) {
    return {
      code: 'already_processed',
      paymentStatus: payment.status,
      bookingStatus: payment.booking.status,
      booking: payment.booking,
    };
  }

  const expectedAmount = Math.round(Number(payment.amount) * 100);
  if (Number(vnpParams.vnp_Amount) !== expectedAmount) {
    return { code: 'invalid_amount', message: 'Số tiền không khớp' };
  }

  const isSuccess = vnpParams.vnp_ResponseCode === '00' && vnpParams.vnp_TransactionStatus === '00';

  const updatedPayment = await prisma.$transaction(async (tx) => {
    const p = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: isSuccess ? PaymentStatus.success : PaymentStatus.failed,
        vnpTransactionNo: vnpParams.vnp_TransactionNo || null,
        vnpResponseCode: vnpParams.vnp_ResponseCode,
        confirmedAt: isSuccess ? new Date() : null,
      },
    });
    if (isSuccess) {
      await tx.booking.update({ where: { id: payment.bookingId }, data: { status: BookingStatus.confirmed } });
    }
    return p;
  });

  const bookingStatus = isSuccess ? BookingStatus.confirmed : payment.booking.status;
  return {
    code: 'ok',
    paymentStatus: updatedPayment.status,
    bookingStatus,
    booking: { ...payment.booking, status: bookingStatus },
  };
}

module.exports = { createPaymentUrl, confirmPayment };
