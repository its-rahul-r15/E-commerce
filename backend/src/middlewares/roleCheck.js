import { errorResponse } from '../utils/responseFormatter.js';



/**
 * Check if user has required role
 * @param {...string} allowedRoles - Roles that can access the route
 */
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        // Ensure user is authenticated (auth middleware must run first)
        if (!req.user) {
            return errorResponse(res, 'Authentication required', 401, 'NOT_AUTHENTICATED');
        }

        // Check if user's role is in allowed roles
        if (!allowedRoles.includes(req.user.role)) {
            return errorResponse(
                res,
                `Access denied. Required role: ${allowedRoles.join(' or ')}`,
                403,
                'INSUFFICIENT_PERMISSIONS'
            );
        }

        next();
    };
};

/**
 * Shorthand middleware for common roles
 */
export const requireCustomer = requireRole('customer');
export const requireSeller = requireRole('seller');
export const requireAdmin = requireRole('admin');
export const requireSellerOrAdmin = requireRole('seller', 'admin');
export const requireCustomerOrSeller = requireRole('customer', 'seller');

export default requireRole;
