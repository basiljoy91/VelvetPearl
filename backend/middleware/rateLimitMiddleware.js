const buckets = new Map();

const cleanupExpiredEntries = (now) => {
  for (const [key, entry] of buckets.entries()) {
    if (entry.resetAt <= now) {
      buckets.delete(key);
    }
  }
};

const createRateLimiter = ({ windowMs, maxRequests, keyPrefix, message }) => {
  return (req, res, next) => {
    const now = Date.now();
    cleanupExpiredEntries(now);

    const key = `${keyPrefix}:${req.ip || 'unknown'}`;
    const current = buckets.get(key);

    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (current.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message,
      });
    }

    current.count += 1;
    buckets.set(key, current);
    return next();
  };
};

const publicEnquiryRateLimit = createRateLimiter({
  windowMs: Number(process.env.ENQUIRY_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  maxRequests: Number(process.env.ENQUIRY_RATE_LIMIT_MAX || 10),
  keyPrefix: 'public-enquiry',
  message: 'Too many enquiry attempts. Please wait a moment before trying again.',
});

const adminAuthRateLimit = createRateLimiter({
  windowMs: Number(process.env.ADMIN_AUTH_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  maxRequests: Number(process.env.ADMIN_AUTH_RATE_LIMIT_MAX || 8),
  keyPrefix: 'admin-auth',
  message: 'Too many login attempts. Please wait a moment before trying again.',
});

module.exports = {
  createRateLimiter,
  publicEnquiryRateLimit,
  adminAuthRateLimit,
};
