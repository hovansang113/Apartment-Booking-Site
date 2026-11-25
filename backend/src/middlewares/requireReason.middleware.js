const AppError = require('../utils/appError');

// UC23 ngoai le 3b (SRS tr.83) va UC24 ngoai le 4a (SRS tr.86): thieu ly do
// phai tra HTTP 400 voi message cu the. express-validator mac dinh tra 422,
// nen kiem tra truoc roi chuyen AppError(400) cho errorHandler.
function requireReason(message) {
  return (req, _res, next) => {
    const reason = typeof req.body?.reason === 'string' ? req.body.reason.trim() : '';
    if (!reason) {
      return next(new AppError(400, message));
    }
    return next();
  };
}

module.exports = { requireReason };
