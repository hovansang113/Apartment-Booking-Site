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
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatPrice(amount) {
  return Number(amount).toLocaleString('vi-VN') + ' ₫';
}

function calcNights(checkIn, checkOut) {
  const ms = new Date(checkOut) - new Date(checkIn);
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function row(label, value) {
  return `
  <tr>
    <td style="padding:7px 0;font-size:14px;color:#777;width:140px;vertical-align:top;">${label}</td>
    <td style="padding:7px 0;font-size:14px;color:#222;font-weight:500;vertical-align:top;">${value}</td>
  </tr>`;
}

async function sendBookingConfirmationEmail({ contactEmail, contactName, booking, listing, guestToken }) {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const detailUrl = `${clientUrl}/bookings/guest/${guestToken}`;
  const nights = calcNights(booking.checkIn, booking.checkOut);
  const perNight = nights > 0 ? Number(booking.totalPrice) / nights : 0;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Booking Confirmation</title>
</head>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#1a1a2e;padding:28px 32px;">
            <p style="margin:0;font-size:24px;font-weight:700;color:#fff;">StayHub</p>
            <p style="margin:6px 0 0;font-size:14px;color:rgba(255,255,255,0.65);">Booking Confirmation</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <p style="font-size:16px;color:#333;margin:0 0 6px;">Hello, <strong>${contactName}</strong></p>
            <p style="font-size:14px;color:#555;margin:0 0 28px;">
              Your booking has been confirmed. Here are the details:
            </p>

            <!-- Listing card -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;border:1px solid #e0e0e0;border-radius:6px;padding:20px;margin-bottom:24px;">
              <tr>
                <td>
                  <p style="margin:0 0 16px;font-size:17px;font-weight:700;color:#1a1a2e;">${listing.title}</p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    ${row('Address', listing.address)}
                    ${row('Check-in', formatDate(booking.checkIn))}
                    ${row('Check-out', formatDate(booking.checkOut))}
                    ${row('Duration', `${nights} night${nights > 1 ? 's' : ''}`)}
                    ${row('Guests', `${booking.guestCount || 1} guest${(booking.guestCount || 1) > 1 ? 's' : ''}`)}
                    <tr><td colspan="2" style="border-top:1px solid #e0e0e0;padding:8px 0 0;"></td></tr>
                    ${row('Rate', `${formatPrice(perNight)} / night`)}
                    ${row('<strong style="color:#1a1a2e;">Total</strong>', `<strong style="font-size:17px;color:#1a1a2e;">${formatPrice(booking.totalPrice)}</strong>`)}
                    <tr><td colspan="2" style="padding-top:8px;"></td></tr>
                    ${row('Booking ID', `<span style="font-family:monospace;">${booking.id.slice(0, 8).toUpperCase()}</span>`)}
                  </table>
                </td>
              </tr>
            </table>

            <!-- CTA -->
            <a href="${detailUrl}" style="display:inline-block;padding:13px 30px;background:#1a1a2e;color:#fff;text-decoration:none;border-radius:6px;font-size:15px;font-weight:600;">
              View Booking Details
            </a>

            <p style="margin-top:20px;font-size:13px;color:#888;line-height:1.6;">
              Need to cancel? You can do so directly from the link above.<br />
              This link is personal — please do not share it with others.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f0f0f0;padding:16px 32px;font-size:12px;color:#999;text-align:center;">
            This is an automated email from StayHub. Please do not reply directly.<br />
            &copy; ${new Date().getFullYear()} StayHub. All rights reserved.
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: `"StayHub" <${process.env.SMTP_USER}>`,
    to: contactEmail,
    subject: `[StayHub] Booking Confirmed – ${listing.title}`,
    html,
  });
}

module.exports = { sendBookingConfirmationEmail };
