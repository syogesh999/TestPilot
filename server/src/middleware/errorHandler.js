const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  logger.error({ err, path: req.originalUrl, method: req.method }, 'Express Error Handler');

  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'An unexpected internal server error occurred';
  let details = err.details || [];

  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Data validation failed';
    details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  if (err.code === 11000) {
    statusCode = 400;
    code = 'DUPLICATE_KEY_ERROR';
    const field = Object.keys(err.keyValue)[0];
    message = `An entry with this ${field} already exists`;
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details,
    },
  });
};

module.exports = errorHandler;
