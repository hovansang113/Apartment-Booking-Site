const nodemailer = require('nodemailer');

// Email xac nhan booking (guest) + bao booking moi (host) - xem
// services/email.service.js. Doi tu Resend sang SMTP tu host (Postfix,
// 19/8 theo yeu cau Jason) - xem DEPLOY.md muc "Postfix" cho huong dan cai
// dat tren server + cau hinh DNS (SPF/DKIM/DMARC/PTR) can co de email khong
// bi rot vao Spam.
//
// Mac dinh ket noi toi Postfix chay tren MAY HOST (khong phai container) qua
// SMTP_HOST=host.docker.internal, khong can auth (relay noi bo, chi may host
// duoc phep gui qua no - xem cau hinh mynetworks trong DEPLOY.md). Neu sau
// nay doi sang 1 SMTP server that co auth (Gmail, SES...), dien them
// SMTP_USER/SMTP_PASSWORD la du, khong can sua code.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'host.docker.internal',
  port: Number(process.env.SMTP_PORT) || 25,
  secure: process.env.SMTP_SECURE === 'true', // true cho port 465, false cho 25/587 (dung STARTTLS neu server ho tro)
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
    : undefined,
});

module.exports = transporter;
