import rateLimit from 'express-rate-limit';

// General API rate limiter
export const generalLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: { message: 'Too many requests from this IP. Please try again in a minute.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict limiter for AI generation endpoints
export const aiLimiter = rateLimit({
    windowMs: 60000,
    max: parseInt(process.env.AI_RATE_LIMIT_MAX) || 10,
    message: { message: 'AI request limit reached. Maximum 10 requests per minute.' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.user?._id?.toString() || req.ip,
});

// Auth limiter (prevent brute force)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 20,
    message: { message: 'Too many authentication attempts. Please try again in 15 minutes.' },
    skipSuccessfulRequests: true,
});
