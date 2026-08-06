const { verifyToken } = require('../utils/jwt.util');
const { fail } = require('../utils/response.util');

// REQ_01: xac thuc JWT, gan req.user = { id, role }
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return fail(res, 401, 'Thieu token xac thuc');
  }
  const token = header.split(' ')[1];
  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (err) {
    return fail(res, 401, 'Token khong hop le hoac het han');
  }
}

module.exports = { authenticate };
