const { verifyToken } = require('../utils/jwt.util');
const { fail } = require('../utils/response.util');
const { COOKIE_NAME } = require('../config/cookie');

// REQ_01: xac thuc JWT, gan req.user = { id, role }. Uu tien doc tu cookie
// httpOnly (cach dang dung tren web that); van fallback ve header
// Authorization: Bearer de tien test bang curl/Postman.
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  const token = req.cookies?.[COOKIE_NAME] || (header?.startsWith('Bearer ') ? header.split(' ')[1] : null);

  if (!token) {
    return fail(res, 401, 'Missing authentication token');
  }
  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (err) {
    return fail(res, 401, 'Invalid or expired token');
  }
}

module.exports = { authenticate };
