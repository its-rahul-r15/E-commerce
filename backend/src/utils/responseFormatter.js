/**
 * Standardized API Response Formatter
 * Ensures consistent response structure across all endpoints
 */

/**
 * Success response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
export const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

/**
 * Error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {string} code - Error code (optional)
 */
export const errorResponse = (res, message = 'Internal server error', statusCode = 500, code = null) => {
    return res.status(statusCode).json({
        success: false,
        error: message,
        ...(code && { code }),
    });
};

/**
 * Paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Response data
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {number} total - Total items count
 */
export const paginatedResponse = (res, data, page, limit, total) => {
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
        success: true,
        data,
        pagination: {
            currentPage: page,
            totalPages,
            totalItems: total,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
    });
};
