const { fail } = require('../utils/response.util');

// REQ_01: phan quyen theo role. Dung: authorize('admin'), authorize('host','admin')...
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return fail(res, 403, 'Ban khong co quyen thuc hien hanh dong nay');
    }
    next();
  };
}

module.exports = { authorize };
