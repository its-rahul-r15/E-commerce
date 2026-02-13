import * as productService from '../services/productService.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/responseFormatter.js';
import { uploadMultipleImages } from '../utils/cloudinaryUpload.js';

/**
 * Product Controller
 * Handles HTTP requests for product management
 */

/**
 * Create product
 * POST /api/products
 */
export const createProduct = async (req, res, next) => {
    try {
        const sellerId = req.user.userId;
        const productData = req.body;

        // Handle image uploads
        if (req.files && req.files.length > 0) {
            const imageUrls = await uploadMultipleImages(req.files, 'products');
            productData.images = imageUrls;
        }

        const product = await productService.createProduct(sellerId, productData);

        return successResponse(
            res,
            { product },
            'Product created successfully',
            201
        );
    } catch (error) {
        if (error.message.includes('must have an approved shop')) {
            return errorResponse(res, error.message, 403, 'NO_APPROVED_SHOP');
        }
        next(error);
    }
};

/**
 * Get products with filters
 * GET /api/products?category=<category>&shopId=<shopId>&page=<page>&limit=<limit>
 */
export const getProducts = async (req, res, next) => {
    try {
        const { category, subCategory, brand, sizes, colors, style, shopId, page, limit, sort } = req.query;

        const result = await productService.getProducts({
            category,
            categories: req.query.categories,
            subCategory,
            brand,
            sizes,
            colors,
            style,
            shopId,
            minPrice: req.query.minPrice,
            maxPrice: req.query.maxPrice,
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 20,
            sort,
        });

        return paginatedResponse(
            res,
            result.products,
            result.pagination.page,
            result.pagination.limit,
            result.pagination.total
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Search products
 * GET /api/products/search?q=<keyword>&page=<page>&limit=<limit>
 */
export const searchProducts = async (req, res, next) => {
    try {
        const { q, page, limit } = req.query;

        if (!q) {
            return errorResponse(res, 'Search query is required', 400, 'MISSING_QUERY');
        }

        const result = await productService.searchProducts(
            q,
            parseInt(page) || 1,
            parseInt(limit) || 20
        );

        return paginatedResponse(
            res,
            result.products,
            result.pagination,
            'Search results retrieved successfully'
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Get product by ID
 * GET /api/products/:id
 */
export const getProductById = async (req, res, next) => {
    try {
        const product = await productService.getProductById(req.params.id);

        return successResponse(
            res,
            { product },
            'Product details retrieved successfully'
        );
    } catch (error) {
        if (error.message.includes('not found') || error.message.includes('not available')) {
            return errorResponse(res, error.message, 404, 'PRODUCT_NOT_FOUND');
        }
        next(error);
    }
};

/**
 * Get product comparisons (other sellers selling same item)
 * GET /api/products/:id/compare
 */
export const getComparisons = async (req, res, next) => {
    try {
        const comparisons = await productService.getComparisons(req.params.id);

        return successResponse(
            res,
            { comparisons },
            'Comparisons retrieved successfully'
        );
    } catch (error) {
        if (error.message.includes('not found')) {
            return errorResponse(res, error.message, 404, 'PRODUCT_NOT_FOUND');
        }
        next(error);
    }
};

/**
 * Get products for a specific shop
 * GET /api/products/shop/:shopId
 */
export const getShopProducts = async (req, res, next) => {
    try {
        const { shopId } = req.params;
        const { page, limit } = req.query;

        const result = await productService.getShopProducts(
            shopId,
            parseInt(page) || 1,
            parseInt(limit) || 20
        );

        return paginatedResponse(
            res,
            result.products,
            result.pagination,
            'Shop products retrieved successfully'
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Get seller's products
 * GET /api/products/seller/my-products
 */
export const getMyProducts = async (req, res, next) => {
    try {
        const { page, limit } = req.query;

        const result = await productService.getSellerProducts(
            req.user.userId,
            parseInt(page) || 1,
            parseInt(limit) || 20
        );

        return paginatedResponse(
            res,
            result.products,
            result.pagination,
            'Your products retrieved successfully'
        );
    } catch (error) {
        if (error.message.includes('No shop found')) {
            return errorResponse(res, error.message, 404, 'NO_SHOP');
        }
        next(error);
    }
};

/**
 * Update product
 * PATCH /api/products/:id
 */
export const updateProduct = async (req, res, next) => {
    try {
        const sellerId = req.user.userId;
        const productId = req.params.id;
        const updates = req.body;

        // Handle new images
        if (req.files && req.files.length > 0) {
            const newImageUrls = await uploadMultipleImages(req.files, 'products');

            if (updates.replaceImages) {
                updates.images = newImageUrls;
            } else {
                updates.images = [...(updates.images || []), ...newImageUrls];
            }
        }

        const product = await productService.updateProduct(productId, sellerId, updates);

        return successResponse(
            res,
            { product },
            'Product updated successfully'
        );
    } catch (error) {
        if (error.message.includes('not found')) {
            return errorResponse(res, error.message, 404, 'PRODUCT_NOT_FOUND');
        }
        if (error.message.includes('only update your own')) {
            return errorResponse(res, error.message, 403, 'NOT_OWNER');
        }
        next(error);
    }
};

/**
 * Delete product
 * DELETE /api/products/:id
 */
export const deleteProduct = async (req, res, next) => {
    try {
        await productService.deleteProduct(req.params.id, req.user.userId);

        return successResponse(
            res,
            null,
            'Product deleted successfully'
        );
    } catch (error) {
        if (error.message.includes('not found')) {
            return errorResponse(res, error.message, 404, 'PRODUCT_NOT_FOUND');
        }
        if (error.message.includes('only delete your own')) {
            return errorResponse(res, error.message, 403, 'NOT_OWNER');
        }
        next(error);
    }
};

/**
 * Ban/Unban product (Admin only)
 * PATCH /api/products/admin/:id/ban
 */
export const toggleProductBan = async (req, res, next) => {
    try {
        const { banned } = req.body;

        if (typeof banned !== 'boolean') {
            return errorResponse(res, 'banned field must be a boolean', 400, 'INVALID_INPUT');
        }

        const product = await productService.toggleProductBan(req.params.id, banned);

        return successResponse(
            res,
            { product },
            `Product ${banned ? 'banned' : 'unbanned'} successfully`
        );
    } catch (error) {
        if (error.message.includes('not found')) {
            return errorResponse(res, error.message, 404, 'PRODUCT_NOT_FOUND');
        }
        next(error);
    }
};

/**
 * Get all products (Admin only)
 * GET /api/products/admin/all?isBanned=<true|false>&page=<page>&limit=<limit>
 */
export const getAllProducts = async (req, res, next) => {
    try {
        const { isBanned, page, limit } = req.query;

        const result = await productService.getAllProducts({
            isBanned,
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 20,
        });

        return paginatedResponse(
            res,
            result.products,
            result.pagination,
            'Products retrieved successfully'
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Debug: Get all products
 * GET /api/products/debug/all
 */
export const debugGetAll = async (req, res, next) => {
    try {
        const result = await productService.getAllProducts({ limit: 100 });
        return successResponse(res, result, 'Debug All Products');
    } catch (error) {
        next(error);
    }
};

export const debugQueryInspector = (req, res, next) => {
    try {
        const result = productService.inspectQuery({
            ...req.query,
            categories: req.query.categories,
            minPrice: req.query.minPrice,
            maxPrice: req.query.maxPrice
        });
        return successResponse(res, result, 'Query Inspection');
    } catch (error) {
        next(error);
    }
};
