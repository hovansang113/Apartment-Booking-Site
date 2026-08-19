const { Resend } = require('resend');

// Email xac nhan booking (guest) + bao booking moi (host), xem
// services/email.service.js. Khong throw luc thieu key - chi that su can
// key khi thuc su goi send() (xem email.service.js), giong pattern
// Braintree/Cloudinary: app van chay binh thuong luc dev khi chua co key
// that, chi rieng buoc gui email se bao loi ro rang.
const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

module.exports = resend;
