function errorHandler(err, req, res, next) {
  const isProd = process.env.NODE_ENV === 'production';
  let status = err.status || err.statusCode || 500;
  let code = err.code || 'server_error';
  let message = err.message || 'Internal server error';

  if (err && err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      status = 400;
      code = 'file_too_large';
      message = 'Image exceeds 10MB limit';
    } else {
      status = 400;
      code = err.code || 'file_upload_failed';
      message = 'Unable to upload file';
    }
  }

  if (Array.isArray(err?.errors) && err.errors.length) {
    status = 400;
    code = 'validation_failed';
    message = err.errors[0]?.msg || 'Please fill all required fields';
  }

  // log full error server-side for debugging
  if (status >= 500) {
    console.error(err);
  } else {
    console.warn(err && err.message ? err.message : err);
  }

  const payload = { success: false, message, code };
  // in non-production include minimal details
  if (!isProd && err.details) payload.details = err.details;
  if (!isProd && Array.isArray(err.errors)) payload.details = err.errors;

  res.status(status).json(payload);
}

module.exports = errorHandler;
