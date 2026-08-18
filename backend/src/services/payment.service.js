const { PaymentStatus, BookingStatus } = require('@prisma/client');
const prisma = require('../config/prisma');
const gateway = require('../config/braintree');
const AppError = require('../utils/appError');

// Trang thai giao dich Braintree coi la "thanh cong" (thang duoc uy quyen -
// authorized - hoac da gui di settlement/da settle). "processor_declined"/
// "gateway_rejected"/... deu KHONG nam trong danh sach nay -> coi la that bai.
const SUCCESS_STATUSES = ['authorized', 'submitted_for_settlement', 'settling', 'settled'];

// Client token de FE khoi tao Braintree Drop-in UI (hien form nhap the +
// challenge 3D Secure). Khong gan customerId - khach dat phong khong can tai
// khoan (giong luon POST /bookings), moi lan thanh toan la 1 giao dich doc lap.
async function generateClientToken() {
  const result = await gateway.clientToken.generate({});
  return result.clientToken;
}

// Nhan payment method nonce tu Braintree Drop-in (FE da cho khach nhap the +
// hoan tat challenge 3D Secure truoc khi goi ham nay - xem PaymentPage.jsx) -
// goi thang gateway.transaction.sale() de tru tien that. Khac VNPay (tao URL
// roi cho khach redirect + IPN callback rieng), Braintree la 1 luot goi API
// dong bo: co ket qua thanh cong/that bai ngay trong response nay, khong can
// trang "return" rieng nua.
async function checkout({ bookingId, paymentMethodNonce, deviceData }) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true, listing: { select: { title: true } } },
  });

  if (!booking || !booking.payment) {
    throw new AppError(404, 'Booking not found');
  }
  if (booking.status !== 'pending_payment') {
    throw new AppError(409, 'This booking is no longer awaiting payment');
  }
  if (booking.paymentExpiresAt && booking.paymentExpiresAt < new Date()) {
    throw new AppError(410, 'Your reservation hold has expired, please book again');
  }
  // Idempotent - tranh submit 2 lan (double-click, F5 sau khi da thanh cong)
  // vo tinh tru tien 2 lan.
  if (booking.payment.status !== PaymentStatus.pending) {
    return {
      code: 'already_processed',
      paymentStatus: booking.payment.status,
      bookingStatus: booking.status,
      booking,
    };
  }

  const result = await gateway.transaction.sale({
    amount: Number(booking.payment.amount).toFixed(2),
    paymentMethodNonce,
    deviceData,
    orderId: booking.bookingCode,
    options: {
      submitForSettlement: true,
      // Bat buoc nonce phai da qua xac thuc 3D Secure that (khop yeu cau
      // Jason "extra step of confirming the payment through app") - Braintree
      // se tu choi giao dich neu FE goi requestPaymentMethod() ma bo qua
      // challenge 3DS.
      three_d_secure: { required: true },
    },
  });

  const transaction = result.transaction;
  const isSuccess = result.success && SUCCESS_STATUSES.includes(transaction?.status);
  const liabilityShifted = transaction?.threeDSecureInfo?.liabilityShifted || false;

  const updatedPayment = await prisma.$transaction(async (tx) => {
    const p = await tx.payment.update({
      where: { id: booking.payment.id },
      data: {
        status: isSuccess ? PaymentStatus.success : PaymentStatus.failed,
        braintreeTransactionId: transaction?.id || null,
        braintreeStatus: transaction?.status || result.message || 'failed',
        threeDSecureVerified: liabilityShifted,
        confirmedAt: isSuccess ? new Date() : null,
      },
    });
    if (isSuccess) {
      await tx.booking.update({ where: { id: bookingId }, data: { status: BookingStatus.confirmed } });
    }
    return p;
  });

  const bookingStatus = isSuccess ? BookingStatus.confirmed : booking.status;
  return {
    code: isSuccess ? 'ok' : 'declined',
    message: isSuccess ? null : transaction?.processorResponseText || result.message || 'Payment was declined',
    paymentStatus: updatedPayment.status,
    bookingStatus,
    booking: { ...booking, status: bookingStatus },
  };
}

// GET /payments/braintree-webhook?bt_challenge=... - Braintree goi 1 lan luc
// dang ky URL webhook trong Control Panel de xac minh quyen so huu endpoint.
function verifyWebhook(challenge) {
  return gateway.webhookNotification.verify(challenge);
}

// POST /payments/braintree-webhook - Braintree goi server-to-server khi co
// cap nhat trang thai giao dich SAU luc sale() da tra ve (vd settlement that
// bai sau khi da bao "authorized", tranh chap/dispute...). Khac voi luc tao
// giao dich (dong bo, biet ket qua ngay), day la duong callback bat dong bo -
// idempotent tuong tu confirmPayment cua VNPay truoc day: chi cap nhat neu
// trang thai thuc su thay doi, khong xu ly lai giao dich da o trang thai cuoi.
async function handleWebhook({ btSignature, btPayload }) {
  const notification = await gateway.webhookNotification.parse(btSignature, btPayload);
  const transactionId = notification.transaction?.id;
  if (!transactionId) {
    // Cac loai notification khac (disbursement, merchant account...) khong
    // gan voi 1 giao dich booking cu the - bo qua, khong phai loi.
    return { handled: false, kind: notification.kind };
  }

  const payment = await prisma.payment.findUnique({ where: { braintreeTransactionId: transactionId } });
  if (!payment) {
    return { handled: false, kind: notification.kind };
  }

  if (notification.kind === 'transaction_settlement_declined' && payment.status === PaymentStatus.success) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.failed, braintreeStatus: notification.transaction.status },
    });
    // Khong tu huy booking o day - can REQ_11/quy trinh huy+hoan tien that
    // (chua lam, xem TODO.md), ghi nhan that bai o Payment truoc de admin/host
    // biet ma xu ly tay.
  } else if (notification.kind === 'transaction_settled' && payment.status !== PaymentStatus.success) {
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.success, braintreeStatus: notification.transaction.status, confirmedAt: new Date() },
      }),
      prisma.booking.update({ where: { id: payment.bookingId }, data: { status: BookingStatus.confirmed } }),
    ]);
  }

  return { handled: true, kind: notification.kind };
}

module.exports = { generateClientToken, checkout, verifyWebhook, handleWebhook };
