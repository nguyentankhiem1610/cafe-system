const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message);
  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    message: err.message || 'Lỗi hệ thống',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { errorHandler, asyncHandler };
