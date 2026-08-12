const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function formatDate(date) {
  return new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatPrice(amount) {
  return Number(amount).toLocaleString('vi-VN') + ' ₫';
}

async function sendBookingConfirmationEmail({ contactEmail, contactName, booking, listing, guestToken }) {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const detailUrl = `${clientUrl}/bookings/guest/${guestToken}`;

  const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Xác nhận đặt phòng</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: #1a1a2e; color: #fff; padding: 28px 32px; }
    .header h1 { margin: 0; font-size: 22px; }
    .header p { margin: 4px 0 0; opacity: 0.7; font-size: 14px; }
    .body { padding: 28px 32px; }
    .greeting { font-size: 16px; margin-bottom: 20px; color: #333; }
    .card { background: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 6px; padding: 20px; margin-bottom: 24px; }
    .card h2 { margin: 0 0 14px; font-size: 17px; color: #1a1a2e; }
    .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
    .label { color: #777; }
    .value { color: #222; font-weight: 500; }
    .price { font-size: 18px; font-weight: 700; color: #1a1a2e; }
    .btn { display: inline-block; margin-top: 4px; padding: 12px 28px; background: #1a1a2e; color: #fff; text-decoration: none; border-radius: 6px; font-size: 15px; }
    .cancel-note { margin-top: 16px; font-size: 13px; color: #888; }
    .footer { background: #f0f0f0; padding: 16px 32px; font-size: 12px; color: #999; text-align: center; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>StayHub</h1>
      <p>Xác nhận đặt phòng thành công</p>
    </div>
    <div class="body">
      <p class="greeting">Xin chào <strong>${contactName}</strong>,</p>
      <p style="color:#555;font-size:14px;margin-bottom:20px;">Đặt phòng của bạn đã được xác nhận. Dưới đây là thông tin chi tiết:</p>

      <div class="card">
        <h2>${listing.title}</h2>
        <div class="row"><span class="label">Địa chỉ</span><span class="value">${listing.address}</span></div>
        <div class="row"><span class="label">Nhận phòng</span><span class="value">${formatDate(booking.checkIn)}</span></div>
        <div class="row"><span class="label">Trả phòng</span><span class="value">${formatDate(booking.checkOut)}</span></div>
        <div class="row"><span class="label">Tổng tiền</span><span class="value price">${formatPrice(booking.totalPrice)}</span></div>
        <div class="row"><span class="label">Mã đặt phòng</span><span class="value">${booking.id.slice(0, 8).toUpperCase()}</span></div>
      </div>

      <a href="${detailUrl}" class="btn">Xem chi tiết đặt phòng</a>
      <p class="cancel-note">
        Nếu cần huỷ đặt phòng, bạn có thể thực hiện trực tiếp tại trang trên.<br />
        Link này chỉ dành riêng cho bạn — vui lòng không chia sẻ với người khác.
      </p>
    </div>
    <div class="footer">
      Email này được gửi tự động từ StayHub. Vui lòng không reply trực tiếp.<br />
      © ${new Date().getFullYear()} StayHub. All rights reserved.
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"StayHub" <${process.env.SMTP_USER}>`,
    to: contactEmail,
    subject: `[StayHub] Xác nhận đặt phòng – ${listing.title}`,
    html,
  });
}

module.exports = { sendBookingConfirmationEmail };
