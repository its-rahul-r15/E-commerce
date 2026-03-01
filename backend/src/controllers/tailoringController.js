import TailoringRequest from '../models/TailoringRequest.js';
import Product from '../models/Product.js';
import Shop from '../models/Shop.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/responseFormatter.js';

/**
 * POST /api/tailoring
 * Customer submits a tailoring request for a product
 */
export const submitTailoringRequest = async (req, res, next) => {
    try {
        const customerId = req.user.userId;
        const { productId, measurements, customizations, fabric } = req.body;

        if (!productId) {
            return errorResponse(res, 'Product ID is required', 400, 'MISSING_PRODUCT');
        }
        if (!measurements) {
            return errorResponse(res, 'Measurements are required', 400, 'MISSING_MEASUREMENTS');
        }

        // Verify product exists and get shopId
        const product = await Product.findById(productId).select('shopId name isAvailable isBanned');
        if (!product) {
            return errorResponse(res, 'Product not found', 404, 'PRODUCT_NOT_FOUND');
        }
        if (!product.isAvailable || product.isBanned) {
            return errorResponse(res, 'This product is not available for ordering', 400, 'PRODUCT_UNAVAILABLE');
        }

        // Verify shop exists and is approved
        const shop = await Shop.findById(product.shopId).select('_id status');
        if (!shop || shop.status !== 'approved') {
            return errorResponse(res, 'This shop is not currently accepting orders', 400, 'SHOP_UNAVAILABLE');
        }

        const tailoringRequest = await TailoringRequest.create({
            customerId,
            productId,
            shopId: product.shopId,
            measurements,
            customizations: customizations || {},
            fabric: fabric || {},
        });

        // Populate for response
        await tailoringRequest.populate([
            { path: 'productId', select: 'name images category price' },
            { path: 'shopId', select: 'shopName' },
        ]);

        return successResponse(
            res,
            { request: tailoringRequest },
            'Tailoring request submitted successfully! The seller will review and confirm shortly.',
            201
        );
    } catch (error) {
        if (error.name === 'ValidationError') {
            const msg = Object.values(error.errors).map(e => e.message).join(', ');
            return errorResponse(res, msg, 400, 'VALIDATION_ERROR');
        }
        next(error);
    }
};

/**
 * GET /api/tailoring/my
 * Customer views their own tailoring requests
 */
export const getMyTailoringRequests = async (req, res, next) => {
    try {
        const customerId = req.user.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;

        const filter = { customerId };
        if (status) filter.status = status;

        const total = await TailoringRequest.countDocuments(filter);
        const requests = await TailoringRequest.find(filter)
            .populate('productId', 'name images category price')
            .populate('shopId', 'shopName')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        return paginatedResponse(
            res,
            requests,
            { total, page, pages: Math.ceil(total / limit), limit },
            'Tailoring requests retrieved successfully'
        );
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/tailoring/shop
 * Seller views tailoring requests for their shop
 */
export const getShopTailoringRequests = async (req, res, next) => {
    try {
        const sellerId = req.user.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const status = req.query.status;

        // Find the seller's shop
        const shop = await Shop.findOne({ sellerId }).select('_id');
        if (!shop) {
            return errorResponse(res, 'No shop found for this seller', 404, 'NO_SHOP');
        }

        const filter = { shopId: shop._id };
        if (status) filter.status = status;

        const total = await TailoringRequest.countDocuments(filter);
        const requests = await TailoringRequest.find(filter)
            .populate('productId', 'name images category price')
            .populate('customerId', 'name email phone')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        return paginatedResponse(
            res,
            requests,
            { total, page, pages: Math.ceil(total / limit), limit },
            'Shop tailoring requests retrieved successfully'
        );
    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /api/tailoring/:id/status
 * Seller updates the status of a tailoring request
 */
export const updateTailoringStatus = async (req, res, next) => {
    try {
        const sellerId = req.user.userId;
        const { id } = req.params;
        const { status, sellerNotes, estimatedDeliveryDays, quotedPrice, cancelReason } = req.body;

        const validStatuses = ['confirmed', 'in_progress', 'completed', 'cancelled'];
        if (!status || !validStatuses.includes(status)) {
            return errorResponse(
                res,
                `Status must be one of: ${validStatuses.join(', ')}`,
                400,
                'INVALID_STATUS'
            );
        }

        // Find request and verify shop ownership
        const tailoringRequest = await TailoringRequest.findById(id).populate('shopId', 'sellerId');
        if (!tailoringRequest) {
            return errorResponse(res, 'Tailoring request not found', 404, 'NOT_FOUND');
        }
        if (tailoringRequest.shopId.sellerId.toString() !== sellerId) {
            return errorResponse(res, 'You can only manage requests for your own shop', 403, 'ACCESS_DENIED');
        }

        // Update fields
        tailoringRequest.status = status;
        if (sellerNotes !== undefined) tailoringRequest.sellerNotes = sellerNotes;
        if (estimatedDeliveryDays !== undefined) tailoringRequest.estimatedDeliveryDays = estimatedDeliveryDays;
        if (quotedPrice !== undefined) tailoringRequest.quotedPrice = quotedPrice;
        if (status === 'cancelled' && cancelReason) tailoringRequest.cancelReason = cancelReason;

        await tailoringRequest.save();

        return successResponse(
            res,
            { request: tailoringRequest },
            'Tailoring request status updated successfully'
        );
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/tailoring/:id
 * Get a single tailoring request by ID (customer or seller)
 */
export const getTailoringRequestById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { userId, role } = req.user;

        const request = await TailoringRequest.findById(id)
            .populate('productId', 'name images category price')
            .populate('shopId', 'shopName sellerId')
            .populate('customerId', 'name email phone');

        if (!request) {
            return errorResponse(res, 'Tailoring request not found', 404, 'NOT_FOUND');
        }

        // Access control
        const isCustomer = request.customerId._id.toString() === userId;
        const isSeller = request.shopId.sellerId?.toString() === userId;
        const isAdmin = role === 'admin';

        if (!isCustomer && !isSeller && !isAdmin) {
            return errorResponse(res, 'Access denied', 403, 'ACCESS_DENIED');
        }

        return successResponse(res, { request }, 'Tailoring request retrieved successfully');
    } catch (error) {
        next(error);
    }
};
