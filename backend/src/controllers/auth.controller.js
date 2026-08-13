const authService = require('../services/auth.service');
const { created, ok } = require('../utils/response.util');
const { COOKIE_NAME, cookieOptions } = require('../config/cookie');

function issueCookieResponse(res, { user, token }, message, isCreate) {
  res.cookie(COOKIE_NAME, token, cookieOptions);
  return isCreate ? created(res, { user }, message) : ok(res, { user }, message);
}

// REQ_01 - register, issue JWT via httpOnly cookie
async function register(req, res) {
  const { email, password, fullName, phone, role } = req.body;
  const result = await authService.register({ email, password, fullName, phone, role });
  return issueCookieResponse(res, result, 'Registered successfully', true);
}

async function login(req, res) {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });
  return issueCookieResponse(res, result, 'Logged in successfully', false);
}

// REQ_14 - guest quick login
async function guestLogin(req, res) {
  const { email, fullName, phone } = req.body;
  const result = await authService.guestLogin({ email, fullName, phone });
  return issueCookieResponse(res, result, 'Guest authenticated successfully', false);
}

// Xoa cookie httpOnly - JS phia frontend khong tu xoa duoc nen phai co route nay
async function logout(req, res) {
  res.clearCookie(COOKIE_NAME, cookieOptions);
  return ok(res, null, 'Logged out successfully');
}

// Frontend goi luc load trang de biet dang dang nhap ai (khong doc duoc cookie
// httpOnly truc tiep)
async function me(req, res) {
  const user = await authService.getMe(req.user.id);
  return ok(res, { user });
}

// Host "Settings" - nop mao so thue/giay to (mo phong)
async function updateTaxInfo(req, res) {
  const { legalName, taxId, taxpayerType, idNumber } = req.body;
  const user = await authService.updateTaxInfo(req.user.id, { legalName, taxId, taxpayerType, idNumber });
  return ok(res, { user }, 'Đã gửi thông tin, đang chờ xác minh');
}

module.exports = { register, login, guestLogin, logout, me, updateTaxInfo };
