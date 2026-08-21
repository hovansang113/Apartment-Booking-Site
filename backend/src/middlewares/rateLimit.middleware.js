const rateLimit = require('express-rate-limit');

// Chong brute-force dang nhap - 10 lan/15 phut tinh theo IP. Ap dung chung
// cho moi tai khoan (khong rieng admin) vi day la lop bao ve o tang ha tang,
// khong phai phan quyen.
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, please try again in a few minutes' },
});

// Chong spam tao tai khoan (/register) va tao user guest (/guest-login,
// cung ghi DB qua findOrCreateGuestUser) - rong hon login vi day la luong
// hop le, nhung van can chan gioi han theo IP.
const signupRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts, please try again in a few minutes' },
});

module.exports = { loginRateLimiter, signupRateLimiter };
