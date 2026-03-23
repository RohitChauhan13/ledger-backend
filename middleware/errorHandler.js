'use strict';

/**
 * Central error-handling middleware.
 * Must be registered LAST (after all routes).
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error('Unhandled error:', err);

  const status = err.status || err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production' && status === 500
      ? 'Internal server error'
      : err.message || 'Internal server error';

  res.status(status).json({ success: false, message });
}

module.exports = { errorHandler };
