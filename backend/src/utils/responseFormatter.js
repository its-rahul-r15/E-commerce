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
export const paginatedResponse = (res, data, pageOrPagination, limit, total) => {
    let pagination;

    if (typeof pageOrPagination === 'object' && pageOrPagination !== null) {
        // Handle case where pagination object is passed as 3rd arg
        const p = pageOrPagination;
        pagination = {
            currentPage: p.page || p.currentPage,
            totalPages: p.pages || p.totalPages || Math.ceil((p.total || p.totalItems) / (p.limit || p.itemsPerPage)),
            totalItems: p.total || p.totalItems,
            itemsPerPage: p.limit || p.itemsPerPage,
            hasNextPage: (p.page || p.currentPage) < (p.pages || p.totalPages),
            hasPrevPage: (p.page || p.currentPage) > 1,
        };
    } else {
        // Handle standard arguments
        const totalPages = Math.ceil(total / limit);
        pagination = {
            currentPage: pageOrPagination,
            totalPages,
            totalItems: total,
            itemsPerPage: limit,
            hasNextPage: pageOrPagination < totalPages,
            hasPrevPage: pageOrPagination > 1,
        };
    }

    return res.status(200).json({
        success: true,
        data,
        pagination,
    });
};
