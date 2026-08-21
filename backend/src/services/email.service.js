const prisma = require('../config/prisma');
const transporter = require('../config/mailer');

// Gui email xac nhan booking (khach) + bao booking moi (host) ngay sau khi
// thanh toan thanh cong (goi tu payment.service.js#checkout va #handleWebhook).
// Fire-and-forget o noi goi - loi gui email KHONG duoc lam fail request
// thanh toan, chi log lai de biet ma xu ly tay neu can.
//
// Co tinh KHONG copy nguyen mau tham khao (Airbnb): bo phan "chinh sach
// huy" (REQ_11/hoan tien chua lam, khong bia chinh sach khong co that) va
// nut "Send message" trong app (khong co he thong nhan tin) - thay bang hien
// thang email/SDT lien he de host tu chu dong lien lac.

const FROM_EMAIL = process.env.SMTP_FROM_EMAIL || 'bookings@reservesmith.com';
const BRAND_COLOR = '#0d9488';

// Cac field trong booking (contactName/contactEmail/contactPhone, listing
// title/address) deu do nguoi dung nhap, khong duoc trust khi nhet thang vao
// HTML - escape truoc de tranh chen markup/link gia mao vao email host/khach
// se doc va tin tuong.
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatGBP(amount) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(Number(amount));
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function guestsLabel(booking) {
  if (booking.childrenCount > 0) {
    return `${booking.adultsCount} adults, ${booking.childrenCount} children`;
  }
  return `${booking.adultsCount} adult${booking.adultsCount === 1 ? '' : 's'}`;
}

function priceRow(label, value, { bold = false, muted = false } = {}) {
  const color = bold ? '#111827' : muted ? '#9ca3af' : '#6b7280';
  const weight = bold ? '700' : '400';
  return `<tr>
    <td style="padding:5px 0;font-size:14px;color:${color};font-weight:${weight};">${label}</td>
    <td style="padding:5px 0;font-size:14px;color:${color};font-weight:${weight};text-align:right;">${value}</td>
  </tr>`;
}

function emailLayout({ title, preheader, bodyHtml }) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <span style="display:none;font-size:0;color:#f5f5f5;">${preheader}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
          <tr>
            <td style="padding:24px 32px;border-bottom:1px solid #f0f0f0;">
              <span style="font-size:20px;font-weight:700;color:${BRAND_COLOR};">reservesmith</span>
            </td>
          </tr>
          ${bodyHtml}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function bookingSummaryBlock(booking) {
  // Anh gio la duong dan tuong doi ("/uploads/...", phuc vu boi nginx tren
  // chinh domain minh) - khac Cloudinary truoc day la URL tuyet doi san. Email
  // client khong co "origin" nhu trinh duyet nen phai tu ghep them siteUrl,
  // khong thi anh se khong hien duoc trong hop thu.
  const siteUrl = process.env.CLIENT_URL || '';
  const rawThumbnail = booking.listing.images?.[0]?.imageUrl;
  const thumbnail = rawThumbnail ? `${siteUrl}${rawThumbnail}` : null;
  return `
  ${thumbnail ? `<tr><td style="padding:0;"><img src="${escapeHtml(thumbnail)}" alt="${escapeHtml(booking.listing.title)}" width="600" style="display:block;width:100%;max-height:280px;object-fit:cover;" /></td></tr>` : ''}
  <tr>
    <td style="padding:24px 32px 8px;">
      <p style="margin:0;font-size:16px;font-weight:700;color:#111827;">${escapeHtml(booking.listing.title)}</p>
      <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">${escapeHtml(booking.listing.address)}</p>
    </td>
  </tr>
  <tr>
    <td style="padding:16px 32px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="50%" style="padding:0;">
            <p style="margin:0;font-size:11px;font-weight:600;text-transform:uppercase;color:#9ca3af;">Check-in</p>
            <p style="margin:2px 0 0;font-size:14px;font-weight:600;color:#111827;">${formatDate(booking.checkIn)}</p>
          </td>
          <td width="50%" style="padding:0;">
            <p style="margin:0;font-size:11px;font-weight:600;text-transform:uppercase;color:#9ca3af;">Checkout</p>
            <p style="margin:2px 0 0;font-size:14px;font-weight:600;color:#111827;">${formatDate(booking.checkOut)}</p>
          </td>
        </tr>
      </table>
      <p style="margin:16px 0 0;font-size:11px;font-weight:600;text-transform:uppercase;color:#9ca3af;">Guests</p>
      <p style="margin:2px 0 0;font-size:14px;color:#111827;">${guestsLabel(booking)}</p>
    </td>
  </tr>
  <tr>
    <td style="padding:0 32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;">
        <tr>
          <td style="padding:14px 16px;text-align:center;">
            <p style="margin:0;font-size:11px;font-weight:600;text-transform:uppercase;color:#9ca3af;">Confirmation code</p>
            <p style="margin:4px 0 0;font-size:20px;font-weight:700;letter-spacing:2px;color:#111827;">${booking.bookingCode}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

// Email 1/2 - gui cho KHACH ngay sau khi thanh toan thanh cong. Chi hien so
// tien khach da tra, khong lo thong tin hoa hong/payout cua host.
async function sendGuestConfirmation(booking) {
  const accommodation = Number(booking.totalPrice) - Number(booking.cleaningFee);
  const siteUrl = process.env.CLIENT_URL || '';

  const priceRows = [
    priceRow('Accommodation', formatGBP(accommodation)),
    Number(booking.cleaningFee) > 0 ? priceRow('Cleaning fee', formatGBP(booking.cleaningFee)) : '',
    priceRow('Total paid', formatGBP(booking.totalPrice), { bold: true }),
  ].join('');

  const bodyHtml = `
    <tr>
      <td style="padding:24px 32px 0;">
        <p style="margin:0;font-size:20px;font-weight:700;color:#111827;">Booking confirmed!</p>
        <p style="margin:6px 0 0;font-size:14px;color:#6b7280;">Thanks for booking, ${escapeHtml(booking.contactName)}. Here are your trip details.</p>
      </td>
    </tr>
    ${bookingSummaryBlock(booking)}
    <tr>
      <td style="padding:0 32px 24px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f0f0f0;padding-top:8px;">
          ${priceRows}
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:0 32px 28px;">
        <a href="${siteUrl}/booking/${booking.id}/payment" style="display:inline-block;background:${BRAND_COLOR};color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:8px;">View booking</a>
      </td>
    </tr>`;

  return transporter.sendMail({
    from: `Reservesmith <${FROM_EMAIL}>`,
    to: booking.contactEmail,
    subject: `Booking confirmed — ${booking.listing.title}`,
    html: emailLayout({
      title: 'Booking confirmed',
      preheader: `Your stay at ${booking.listing.title} is confirmed. Confirmation code ${booking.bookingCode}.`,
      bodyHtml,
    }),
  });
}

// Email 2/2 - gui cho HOST khi co booking moi (thanh toan thanh cong). Hien
// day du breakdown "guest paid" / "host payout" (khop mau tham khao), va
// hien thang email/SDT khach de host tu lien he (khong co he thong nhan tin
// trong app).
async function sendHostNotification(booking) {
  const accommodation = Number(booking.totalPrice) - Number(booking.cleaningFee);
  const siteUrl = process.env.CLIENT_URL || '';

  const guestPaidRows = [
    priceRow('Accommodation', formatGBP(accommodation)),
    Number(booking.cleaningFee) > 0 ? priceRow('Cleaning fee', formatGBP(booking.cleaningFee)) : '',
    priceRow('Total (GBP)', formatGBP(booking.totalPrice), { bold: true }),
  ].join('');

  const payoutRows = [
    priceRow('Total stay price', formatGBP(accommodation)),
    Number(booking.cleaningFee) > 0 ? priceRow('Cleaning fee', formatGBP(booking.cleaningFee)) : '',
    Number(booking.commissionRate) > 0
      ? priceRow(`Host service fee (${Number(booking.commissionRate)}%)`, `-${formatGBP(booking.commissionAmount)}`)
      : '',
    priceRow('You earn', formatGBP(booking.hostPayoutAmount), { bold: true }),
  ].join('');

  const bodyHtml = `
    <tr>
      <td style="padding:24px 32px 0;">
        <p style="margin:0;font-size:20px;font-weight:700;color:#111827;">New booking confirmed!</p>
        <p style="margin:6px 0 0;font-size:14px;color:#6b7280;">${escapeHtml(booking.contactName)} arrives ${formatDate(booking.checkIn)}.</p>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 32px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding-right:12px;">
              <div style="width:40px;height:40px;border-radius:50%;background:${BRAND_COLOR};color:#ffffff;font-size:16px;font-weight:700;text-align:center;line-height:40px;">${escapeHtml((booking.contactName || '?').charAt(0).toUpperCase())}</div>
            </td>
            <td>
              <p style="margin:0;font-size:14px;font-weight:600;color:#111827;">${escapeHtml(booking.contactName)}</p>
              <p style="margin:2px 0 0;font-size:13px;color:#6b7280;">${escapeHtml(booking.contactEmail)}${booking.contactPhone ? ` · ${escapeHtml(booking.contactPhone)}` : ''}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    ${bookingSummaryBlock(booking)}
    <tr>
      <td style="padding:0 32px 16px;">
        <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#111827;">Guest paid</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${guestPaidRows}</table>
      </td>
    </tr>
    <tr>
      <td style="padding:0 32px 24px;">
        <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#111827;">Host payout</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${payoutRows}</table>
      </td>
    </tr>
    <tr>
      <td style="padding:0 32px 28px;">
        <a href="${siteUrl}/host/calendar" style="display:inline-block;background:${BRAND_COLOR};color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:8px;">View calendar</a>
      </td>
    </tr>`;

  return transporter.sendMail({
    from: `Reservesmith <${FROM_EMAIL}>`,
    to: booking.listing.host.email,
    subject: `New booking confirmed! ${booking.contactName} arrives ${formatDate(booking.checkIn)}`,
    html: emailLayout({
      title: 'New booking confirmed',
      preheader: `${booking.contactName} booked ${booking.listing.title}, arriving ${formatDate(booking.checkIn)}.`,
      bodyHtml,
    }),
  });
}

// Goi tu payment.service.js sau khi Payment/Booking da chuyen sang
// success/confirmed - fetch lai booking day du (khac voi query gon trong
// checkout()) vi email can nhieu field hon (anh listing, thong tin host...).
async function sendBookingEmails(bookingId) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      listing: {
        include: {
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          host: { select: { email: true } },
        },
      },
    },
  });
  if (!booking) return;

  await Promise.all([
    sendGuestConfirmation(booking).catch((err) => console.error('Failed to send guest confirmation email:', err)),
    sendHostNotification(booking).catch((err) => console.error('Failed to send host notification email:', err)),
  ]);
}

module.exports = { sendBookingEmails };
