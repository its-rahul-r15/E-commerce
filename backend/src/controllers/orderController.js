import * as orderService from '../services/orderService.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/responseFormatter.js';


export const createOrder = async (req, res, next) => {
    try {
        const customerId = req.user.userId;
        const { deliveryAddress } = req.body;

        if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.city) {
            return errorResponse(res, 'Valid delivery address is required', 400, 'INVALID_ADDRESS');
        }

        const orders = await orderService.createOrder(customerId, { deliveryAddress });

        return successResponse(
            res,
            { orders, count: orders.length },
            'Order(s) created successfully',
            201
        );
    } catch (error) {
        if (error.message.includes('Cart is empty')) {
            return errorResponse(res, error.message, 400, 'EMPTY_CART');
        }
        if (error.message.includes('not available') || error.message.includes('stock')) {
            return errorResponse(res, error.message, 400, 'STOCK_ISSUE');
        }
        next(error);
    }
};


export const getMyOrders = async (req, res, next) => {
    try {
        const { status, page, limit } = req.query;

        const result = await orderService.getCustomerOrders(req.user.userId, {
            status,
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 20,
        });

        return paginatedResponse(
            res,
            result.orders,
            result.pagination,
            'Orders retrieved successfully'
        );
    } catch (error) {
        next(error);
    }
};

export const getShopOrders = async (req, res, next) => {
    try {
        const { status, page, limit } = req.query;

        const result = await orderService.getShopOrders(req.user.userId, {
            status,
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 20,
        });

        return paginatedResponse(
            res,
            result.orders,
            result.pagination,
            'Shop orders retrieved successfully'
        );
    } catch (error) {
        if (error.message.includes('No shop found')) {
            return errorResponse(res, error.message, 404, 'NO_SHOP');
        }
        next(error);
    }
};


export const getOrderById = async (req, res, next) => {
    try {
        const order = await orderService.getOrderById(
            req.params.id,
            req.user.userId,
            req.user.role
        );

        return successResponse(
            res,
            { order },
            'Order details retrieved successfully'
        );
    } catch (error) {
        if (error.message.includes('not found')) {
            return errorResponse(res, error.message, 404, 'ORDER_NOT_FOUND');
        }
        if (error.message.includes('Access denied')) {
            return errorResponse(res, error.message, 403, 'ACCESS_DENIED');
        }
        next(error);
    }
};

/**
 * Update order status (Seller only)
 * PATCH /api/orders/:id/status
 */
export const updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!status) {
            return errorResponse(res, 'Status is required', 400, 'MISSING_STATUS');
        }

        const order = await orderService.updateOrderStatus(
            req.params.id,
            req.user.userId,
            status
        );

        return successResponse(
            res,
            { order },
            'Order status updated successfully'
        );
    } catch (error) {
        if (error.message.includes('not found')) {
            return errorResponse(res, error.message, 404, 'ORDER_NOT_FOUND');
        }
        if (error.message.includes('only update orders')) {
            return errorResponse(res, error.message, 403, 'ACCESS_DENIED');
        }
        if (error.message.includes('Invalid status') || error.message.includes('must be accepted')) {
            return errorResponse(res, error.message, 400, 'INVALID_STATUS');
        }
        next(error);
    }
};

/**
 * Cancel order
 * PATCH /api/orders/:id/cancel
 */
export const cancelOrder = async (req, res, next) => {
    try {
        const order = await orderService.cancelOrder(
            req.params.id,
            req.user.userId,
            req.user.role
        );

        return successResponse(
            res,
            { order },
            'Order cancelled successfully'
        );
    } catch (error) {
        if (error.message.includes('not found')) {
            return errorResponse(res, error.message, 404, 'ORDER_NOT_FOUND');
        }
        if (error.message.includes('Access denied')) {
            return errorResponse(res, error.message, 403, 'ACCESS_DENIED');
        }
        if (error.message.includes('Cannot cancel')) {
            return errorResponse(res, error.message, 400, 'CANNOT_CANCEL');
        }
        next(error);
    }
};

/**
 * Get all orders (Admin only)
 * GET /api/orders/admin/all?status=<status>&page=<page>&limit=<limit>
 */
export const getAllOrders = async (req, res, next) => {
    try {
        const { status, page, limit } = req.query;

        const result = await orderService.getAllOrders({
            status,
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 20,
        });

        return paginatedResponse(
            res,
            result.orders,
            result.pagination,
            'All orders retrieved successfully'
        );
    } catch (error) {
        next(error);
    }
};
