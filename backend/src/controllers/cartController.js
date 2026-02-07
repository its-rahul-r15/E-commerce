import * as cartService from '../services/cartService.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';

/**
 * Cart Controller
 * Handles HTTP requests for cart management
 */

/**
 * Get customer's cart
 * GET /api/cart
 */
export const getCart = async (req, res, next) => {
    try {
        const cart = await cartService.getCart(req.user.userId);

        return successResponse(
            res,
            { cart },
            'Cart retrieved successfully'
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Add item to cart
 * POST /api/cart/items
 */
export const addToCart = async (req, res, next) => {
    try {
        const { productId, quantity } = req.body;

        if (!productId || !quantity || quantity < 1) {
            return errorResponse(res, 'Product ID and valid quantity are required', 400, 'INVALID_INPUT');
        }

        const cart = await cartService.addToCart(req.user.userId, { productId, quantity });

        return successResponse(
            res,
            { cart },
            'Item added to cart successfully',
            201
        );
    } catch (error) {
        if (error.message.includes('not found')) {
            return errorResponse(res, error.message, 404, 'PRODUCT_NOT_FOUND');
        }
        if (error.message.includes('not available') || error.message.includes('stock')) {
            return errorResponse(res, error.message, 400, 'STOCK_UNAVAILABLE');
        }
        next(error);
    }
};

/**
 * Update cart item quantity
 * PATCH /api/cart/items/:productId
 */
export const updateCartItem = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 0) {
            return errorResponse(res, 'Valid quantity is required', 400, 'INVALID_INPUT');
        }

        const cart = await cartService.updateCartItem(req.user.userId, productId, quantity);

        return successResponse(
            res,
            { cart },
            'Cart updated successfully'
        );
    } catch (error) {
        if (error.message.includes('not found') || error.message.includes('not in cart')) {
            return errorResponse(res, error.message, 404, 'ITEM_NOT_FOUND');
        }
        if (error.message.includes('stock')) {
            return errorResponse(res, error.message, 400, 'STOCK_UNAVAILABLE');
        }
        next(error);
    }
};

/**
 * Remove item from cart
 * DELETE /api/cart/items/:productId
 */
export const removeFromCart = async (req, res, next) => {
    try {
        const cart = await cartService.removeFromCart(req.user.userId, req.params.productId);

        return successResponse(
            res,
            { cart },
            'Item removed from cart successfully'
        );
    } catch (error) {
        if (error.message.includes('not found')) {
            return errorResponse(res, error.message, 404, 'CART_NOT_FOUND');
        }
        next(error);
    }
};

/**
 * Clear cart
 * DELETE /api/cart
 */
export const clearCart = async (req, res, next) => {
    try {
        const cart = await cartService.clearCart(req.user.userId);

        return successResponse(
            res,
            { cart },
            'Cart cleared successfully'
        );
    } catch (error) {
        if (error.message.includes('not found')) {
            return errorResponse(res, error.message, 404, 'CART_NOT_FOUND');
        }
        next(error);
    }
};
