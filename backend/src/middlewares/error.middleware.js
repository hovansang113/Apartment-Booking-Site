function notFound(req, res, next) {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
}

const AppError = require('../utils/appError');

// Chi tra message that cho loi co y (AppError, vd "Invalid email or
// password") - loi bat ngo (Prisma constraint, driver, ...) co the chua ten
// bang/cot hay chi tiet noi bo, luon tra message chung cho client, log day
// du server-side de debug.
function errorHandler(err, req, res, next) {
  console.error(err);
  const isKnown = err instanceof AppError;
  const status = isKnown ? err.statusCode : 500;
  res.status(status).json({
    success: false,
    message: isKnown ? err.message : 'Internal server error',
  });
}

module.exports = { notFound, errorHandler };
