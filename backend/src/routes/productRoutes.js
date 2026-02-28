import express from 'express';
import * as productController from '../controllers/productController.js';
import auth from '../middlewares/auth.js';
import { requireSeller, requireAdmin } from '../middlewares/roleCheck.js';
import { createProductValidator, mongoIdValidator, shopIdValidator, paginationValidator, updateProductValidator } from '../middlewares/validator.js';
import { apiRateLimiter, readRateLimiter } from '../middlewares/rateLimiter.js';
import { upload } from '../utils/cloudinaryUpload.js';

/**
 * Product Routes
 * /api/products
 */

const router = express.Router();

// Public routes
router.get('/', readRateLimiter, paginationValidator, productController.getProducts);
router.get('/search', readRateLimiter, productController.searchProducts);
router.get('/shop/:shopId', readRateLimiter, shopIdValidator, productController.getShopProducts);
router.get('/:id', readRateLimiter, mongoIdValidator, productController.getProductById);
router.get('/:id/compare', readRateLimiter, mongoIdValidator, productController.getComparisons);

// Seller routes (protected)
router.post(
    '/',
    auth,
    requireSeller,
    apiRateLimiter,
    upload.fields([
        { name: 'images', maxCount: 5 },       // Product gallery images
        { name: 'tryOnImage', maxCount: 1 },   // AR try-on transparent image
    ]),
    createProductValidator,
    productController.createProduct
);

router.get(
    '/seller/my-products',
    auth,
    requireSeller,
    paginationValidator,
    productController.getMyProducts
);

router.patch(
    '/:id',
    auth,
    requireSeller,
    apiRateLimiter,
    upload.fields([
        { name: 'images', maxCount: 5 },       // Product gallery images
        { name: 'tryOnImage', maxCount: 1 },   // AR try-on transparent image
    ]),
    mongoIdValidator,
    updateProductValidator,
    productController.updateProduct
);

router.delete(
    '/:id',
    auth,
    requireSeller,
    apiRateLimiter,
    mongoIdValidator,
    productController.deleteProduct
);

// Admin routes (protected)
router.get(
    '/admin/all',
    auth,
    requireAdmin,
    paginationValidator,
    productController.getAllProducts
);

router.patch(
    '/admin/:id/ban',
    auth,
    requireAdmin,
    mongoIdValidator,
    productController.toggleProductBan
);

router.get('/debug/all', productController.debugGetAll);
router.get('/debug/inspector', productController.debugQueryInspector);

export default router;
