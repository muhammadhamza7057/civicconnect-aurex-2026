function errorHandler(err, req, res, next) {
  const isProd = process.env.NODE_ENV === 'production';
  const status = err.status || 500;
  const code = err.code || 'server_error';
  const message = err.message || 'Internal server error';

  // log full error server-side for debugging
  if (status >= 500) {
    console.error(err);
  } else {
    console.warn(err && err.message ? err.message : err);
  }

  const payload = { success: false, message, code };
  // in non-production include minimal details
  if (!isProd && err.details) payload.details = err.details;

  res.status(status).json(payload);
}

module.exports = errorHandler;
