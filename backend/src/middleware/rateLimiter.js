// Simple in-memory rate limiter. For production, replace with Redis-backed limiter.
const RATE_LIMIT_MAP = new Map();

function rateLimiter({ windowMs = 60 * 1000, max = 60 } = {}) {
  return (req, res, next) => {
    try {
      const key = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const now = Date.now();
      const entry = RATE_LIMIT_MAP.get(key) || { count: 0, reset: now + windowMs };

      if (now > entry.reset) {
        entry.count = 0;
        entry.reset = now + windowMs;
      }

      entry.count += 1;
      RATE_LIMIT_MAP.set(key, entry);

      if (entry.count > max) {
        res.set('Retry-After', Math.ceil((entry.reset - now) / 1000));
        return res.status(429).json({ error: { code: 'rate_limited', message: 'Too many requests' } });
      }

      next();
    } catch (err) {
      console.error('Rate limiter error', err);
      next();
    }
  };
}

module.exports = rateLimiter;
