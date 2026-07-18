import rateLimit from 'express-rate-limit';

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again shortly.',
    error: { code: 'RATE_LIMITED', message: 'Too many authentication attempts. Please try again shortly.' },
  },
});
