function notFound(req, res, next) {
  res.status(404).json({ success: false, message: 'Khong tim thay endpoint' });
}

function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Loi he thong',
  });
}

module.exports = { notFound, errorHandler };
