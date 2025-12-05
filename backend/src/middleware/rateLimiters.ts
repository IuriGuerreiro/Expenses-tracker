import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for 2FA code generation
 * Max 3 requests per 15 minutes per user
 */
export const twoFactorCodeGenerationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many code generation requests. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
  skip: (req) => {
    // Skip rate limiting in development if needed
    return process.env.NODE_ENV === 'development' && process.env.SKIP_RATE_LIMIT === 'true';
  },
});

/**
 * Rate limiter for 2FA code verification
 * Max 5 attempts per 15 minutes per IP
 */
export const twoFactorVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many verification attempts. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
  skip: (req) => {
    return process.env.NODE_ENV === 'development' && process.env.SKIP_RATE_LIMIT === 'true';
  },
});

/**
 * Rate limiter for 2FA settings changes
 * Max 10 requests per hour per user
 */
export const twoFactorSettingsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many settings change requests. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
  skip: (req) => {
    return process.env.NODE_ENV === 'development' && process.env.SKIP_RATE_LIMIT === 'true';
  },
});

/**
 * General authentication rate limiter
 * Max 10 login attempts per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many login attempts. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
  skip: (req) => {
    return process.env.NODE_ENV === 'development' && process.env.SKIP_RATE_LIMIT === 'true';
  },
});
