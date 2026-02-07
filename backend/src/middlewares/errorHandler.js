import { errorResponse } from '../utils/responseFormatter.js';

/**
 * Centralized Error Handler Middleware
 * Catches all errors and returns formatted responses
 */

const errorHandler = (err, req, res, next) => {
    console.error('❌ Error:', err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((error) => error.message);
        return errorResponse(res, messages.join(', '), 400, 'VALIDATION_ERROR');
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return errorResponse(res, `${field} already exists`, 409, 'DUPLICATE_ERROR');
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return errorResponse(res, 'Invalid token', 401, 'INVALID_TOKEN');
    }

    if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 'Token expired', 401, 'TOKEN_EXPIRED');
    }

    // Mongoose cast error (invalid ObjectId)
    if (err.name === 'CastError') {
        return errorResponse(res, 'Invalid ID format', 400, 'INVALID_ID');
    }

    // Default error response
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';

    return errorResponse(res, message, statusCode);
};

export default errorHandler;
