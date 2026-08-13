const rateLimit = require('express-rate-limit');

// Chong brute-force dang nhap - 10 lan/15 phut tinh theo IP. Ap dung chung
// cho moi tai khoan (khong rieng admin) vi day la lop bao ve o tang ha tang,
// khong phai phan quyen.
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Quá nhiều lần thử đăng nhập, vui lòng thử lại sau ít phút' },
});

module.exports = { loginRateLimiter };
