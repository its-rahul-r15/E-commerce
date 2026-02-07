import * as shopService from '../services/shopService.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/responseFormatter.js';
import { uploadMultipleImages } from '../utils/cloudinaryUpload.js';

/**
 * Shop Controller
 * Handles HTTP requests for shop management
 */

/**
 * Create/Register shop
 * POST /api/shops
 */
export const createShop = async (req, res, next) => {
    try {
        const sellerId = req.user.userId;
        const shopData = req.body;

        // Handle image uploads if any
        if (req.files && req.files.length > 0) {
            const imageUrls = await uploadMultipleImages(req.files, 'shops');
            shopData.images = imageUrls;
        }

        const shop = await shopService.createShop(sellerId, shopData);

        return successResponse(
            res,
            { shop },
            'Shop registered successfully. Awaiting admin approval.',
            201
        );
    } catch (error) {
        if (error.message.includes('already have a shop')) {
            return errorResponse(res, error.message, 409, 'SHOP_EXISTS');
        }
        next(error);
    }
};

/**
 * Get nearby shops (within 5km radius)
 * GET /api/shops/nearby?lat=<latitude>&lng=<longitude>
 */
export const getNearbyShops = async (req, res, next) => {
    try {
        const { lat, lng } = req.query;

        if (!lat || !lng) {
            return errorResponse(res, 'Latitude and longitude are required', 400, 'MISSING_LOCATION');
        }

        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);

        if (isNaN(latitude) || isNaN(longitude)) {
            return errorResponse(res, 'Invalid coordinates', 400, 'INVALID_COORDINATES');
        }

        const shops = await shopService.getNearbyShops(longitude, latitude);

        return successResponse(
            res,
            { shops, count: shops.length },
            'Nearby shops retrieved successfully'
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Get shop by ID
 * GET /api/shops/:id
 */
export const getShopById = async (req, res, next) => {
    try {
        const shop = await shopService.getShopById(req.params.id);

        return successResponse(
            res,
            { shop },
            'Shop details retrieved successfully'
        );
    } catch (error) {
        if (error.message.includes('not found') || error.message.includes('not available')) {
            return errorResponse(res, error.message, 404, 'SHOP_NOT_FOUND');
        }
        next(error);
    }
};

/**
 * Get seller's shop
 * GET /api/shops/seller/my-shop
 */
export const getMyShop = async (req, res, next) => {
    try {
        const shop = await shopService.getSellerShop(req.user.userId);

        return successResponse(
            res,
            { shop },
            'Your shop details retrieved successfully'
        );
    } catch (error) {
        if (error.message.includes('No shop found')) {
            return errorResponse(res, error.message, 404, 'NO_SHOP');
        }
        next(error);
    }
};

/**
 * Update shop details
 * PATCH /api/shops/:id
 */
export const updateShop = async (req, res, next) => {
    try {
        const sellerId = req.user.userId;
        const shopId = req.params.id;
        const updates = req.body;

        // Handle new image uploads
        if (req.files && req.files.length > 0) {
            const newImageUrls = await uploadMultipleImages(req.files, 'shops');

            // Append to existing images or replace
            if (updates.replaceImages) {
                updates.images = newImageUrls;
            } else {
                updates.images = [...(updates.images || []), ...newImageUrls];
            }
        }

        const shop = await shopService.updateShop(shopId, sellerId, updates);

        return successResponse(
            res,
            { shop },
            'Shop updated successfully'
        );
    } catch (error) {
        if (error.message.includes('not found')) {
            return errorResponse(res, error.message, 404, 'SHOP_NOT_FOUND');
        }
        if (error.message.includes('only update your own')) {
            return errorResponse(res, error.message, 403, 'NOT_OWNER');
        }
        next(error);
    }
};

/**
 * Get pending shops (Admin only)
 * GET /api/shops/admin/pending
 */
export const getPendingShops = async (req, res, next) => {
    try {
        const shops = await shopService.getPendingShops();

        return successResponse(
            res,
            { shops, count: shops.length },
            'Pending shops retrieved successfully'
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Approve shop (Admin only)
 * PATCH /api/shops/admin/:id/approve
 */
export const approveShop = async (req, res, next) => {
    try {
        const shop = await shopService.approveShop(req.params.id);

        return successResponse(
            res,
            { shop },
            'Shop approved successfully'
        );
    } catch (error) {
        if (error.message.includes('not found')) {
            return errorResponse(res, error.message, 404, 'SHOP_NOT_FOUND');
        }
        next(error);
    }
};

/**
 * Reject shop (Admin only)
 * PATCH /api/shops/admin/:id/reject
 */
export const rejectShop = async (req, res, next) => {
    try {
        const shop = await shopService.rejectShop(req.params.id);

        return successResponse(
            res,
            { shop },
            'Shop rejected'
        );
    } catch (error) {
        if (error.message.includes('not found')) {
            return errorResponse(res, error.message, 404, 'SHOP_NOT_FOUND');
        }
        next(error);
    }
};

/**
 * Block/Unblock shop (Admin only)
 * PATCH /api/shops/admin/:id/block
 */
export const toggleShopBlock = async (req, res, next) => {
    try {
        const { blocked } = req.body;

        if (typeof blocked !== 'boolean') {
            return errorResponse(res, 'blocked field must be a boolean', 400, 'INVALID_INPUT');
        }

        const shop = await shopService.toggleShopBlock(req.params.id, blocked);

        return successResponse(
            res,
            { shop },
            `Shop ${blocked ? 'blocked' : 'unblocked'} successfully`
        );
    } catch (error) {
        if (error.message.includes('not found')) {
            return errorResponse(res, error.message, 404, 'SHOP_NOT_FOUND');
        }
        next(error);
    }
};

/**
 * Get all shops with filters (Admin only)
 * GET /api/shops/admin/all?status=<status>&page=<page>&limit=<limit>
 */
export const getAllShops = async (req, res, next) => {
    try {
        const { status, page, limit } = req.query;

        const result = await shopService.getAllShops({
            status,
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 20,
        });

        return paginatedResponse(
            res,
            result.shops,
            result.pagination,
            'Shops retrieved successfully'
        );
    } catch (error) {
        next(error);
    }
};
