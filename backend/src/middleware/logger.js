const onFinished = require('on-finished');

function requestLogger(req, res, next) {
  const start = Date.now();
  onFinished(res, () => {
    const duration = Date.now() - start;
    const remote = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(`${remote} - ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
}

function errorLog(message, meta) {
  console.error('[ERROR]', message, meta || '');
}

function aiLog(message, meta) {
  console.log('[AI]', message, meta || '');
}

module.exports = { requestLogger, errorLog, aiLog };
