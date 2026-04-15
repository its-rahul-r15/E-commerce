import { incrementCache } from '../services/cacheService.js';
import { errorResponse } from '../utils/responseFormatter.js';



/**
 * Create rate limiter for specific endpoint
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @param {string} message - Error message when limit exceeded
 */
const rateLimiter = (maxRequests = 100, windowMs = 15 * 60 * 1000, message = 'Too many requests') => {
    return async (req, res, next) => {
        try {

            const identifier = req.user ? req.user.userId : req.ip;
            const key = `rate_limit:${identifier}:${req.path}`;
            const ttl = Math.floor(windowMs / 1000);


            const count = await incrementCache(key, ttl);


            if (count === 0) {
                return next();
            }

            // Set rate limit headers
            res.setHeader('X-RateLimit-Limit', maxRequests);
            res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - count));
            res.setHeader('X-RateLimit-Reset', Date.now() + ttl * 1000);

            // Check if limit exceeded
            if (count > maxRequests) {
                return errorResponse(
                    res,
                    message,
                    429,
                    'RATE_LIMIT_EXCEEDED'
                );
            }

            next();

        } catch (error) {
            console.error('Rate limiter error:', error);

            next();
        }
    };
};

export const authRateLimiter = rateLimiter(
    50,
    15 * 60 * 1000,
    'Too many login attempts. Please try again later.'
);


export const apiRateLimiter = rateLimiter(
    100,
    15 * 60 * 1000,
    'Too many requests. Please slow down.'
);

// Lenient rate limiting for read-only endpoints
export const readRateLimiter = rateLimiter(
    300,
    15 * 60 * 1000,
    'Too many requests. Please slow down.'
);

export default rateLimiter;
