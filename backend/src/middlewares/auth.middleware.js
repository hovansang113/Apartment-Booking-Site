const { verifyToken } = require('../utils/jwt.util');
const { fail } = require('../utils/response.util');
const { COOKIE_NAME } = require('../config/cookie');
const { UserStatus } = require('@prisma/client');
const prisma = require('../config/prisma');

// REQ_01: xac thuc JWT, gan req.user = { id, role }. Uu tien doc tu cookie
// httpOnly (cach dang dung tren web that); van fallback ve header
// Authorization: Bearer de tien test bang curl/Postman.
//
// Kiem tra them status that trong DB (khong chi tin payload token) - token
// song toi 24h, neu chi tin payload thi 1 tai khoan bi admin khoa giua chung
// van dung duoc binh thuong toi khi token tu het han. Ton them 1 query/request
// nhung doi lai khoa tai khoan co hieu luc ngay.
async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  const token = req.cookies?.[COOKIE_NAME] || (header?.startsWith('Bearer ') ? header.split(' ')[1] : null);

  if (!token) {
    return fail(res, 401, 'Missing authentication token');
  }
  let payload;
  try {
    payload = verifyToken(token);
  } catch (err) {
    return fail(res, 401, 'Invalid or expired token');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.id }, select: { status: true } });
  if (!user || user.status === UserStatus.locked) {
    return fail(res, 401, 'This account no longer has access, please log in again');
  }

  req.user = payload;
  next();
}

module.exports = { authenticate };
