import * as authService from '../services/authService.js';
import * as shopService from '../services/shopService.js';
import * as productService from '../services/productService.js';
import * as orderService from '../services/orderService.js';
import User from '../models/User.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/responseFormatter.js';


export const getStats = async (req, res, next) => {
    try {
        const [
            totalUsers,
            totalCustomers,
            totalSellers,
            totalShops,
            approvedShops,
            totalProducts,
            totalOrders,
            pendingShops
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'customer' }),
            User.countDocuments({ role: 'seller' }),
            (await import('../models/Shop.js')).default.countDocuments(),
            (await import('../models/Shop.js')).default.countDocuments({ status: 'approved' }),
            (await import('../models/Product.js')).default.countDocuments(),
            (await import('../models/Order.js')).default.countDocuments(),
            (await import('../models/Shop.js')).default.countDocuments({ status: 'pending' }),
        ]);

        const statistics = {
            totalUsers,
            totalCustomers,
            totalSellers,
            totalShops,
            approvedShops,
            pendingShops,
            totalProducts,
            totalOrders,
        };

        return successResponse(
            res,
            { statistics },
            'Platform statistics retrieved successfully'
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Get all users with filters
 * GET /api/admin/users?role=<role>&isBlocked=<true|false>&page=<page>&limit=<limit>
 */
export const getAllUsers = async (req, res, next) => {
    try {
        const { role, isBlocked, page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const query = {};

        if (role) {
            query.role = role;
        }

        if (isBlocked !== undefined) {
            query.isBlocked = isBlocked === 'true' || isBlocked === true;
        }

        const [users, total] = await Promise.all([
            User.find(query)
                .select('-password')
                .sort('-createdAt')
                .skip(skip)
                .limit(parseInt(limit)),
            User.countDocuments(query),
        ]);

        return paginatedResponse(
            res,
            users,
            {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
            'Users retrieved successfully'
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Block/Unblock user
 * PATCH /api/admin/users/:id/block
 */
export const toggleUserBlock = async (req, res, next) => {
    try {
        const { blocked } = req.body;

        if (typeof blocked !== 'boolean') {
            return errorResponse(res, 'blocked field must be a boolean', 400, 'INVALID_INPUT');
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isBlocked: blocked },
            { new: true }
        ).select('-password');

        if (!user) {
            return errorResponse(res, 'User not found', 404, 'USER_NOT_FOUND');
        }

        return successResponse(
            res,
            { user },
            `User ${blocked ? 'blocked' : 'unblocked'} successfully`
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Delete user (Admin only)
 * DELETE /api/admin/users/:id
 */
export const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return errorResponse(res, 'User not found', 404, 'USER_NOT_FOUND');
        }

        return successResponse(
            res,
            null,
            'User deleted successfully'
        );
    } catch (error) {
        next(error);
    }
};
