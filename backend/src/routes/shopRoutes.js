import express from 'express';
import * as shopController from '../controllers/shopController.js';
import auth from '../middlewares/auth.js';
import { requireSeller, requireAdmin } from '../middlewares/roleCheck.js';
import { createShopValidator, mongoIdValidator, paginationValidator, updateShopValidator } from '../middlewares/validator.js';
import { apiRateLimiter, readRateLimiter } from '../middlewares/rateLimiter.js';
import { upload } from '../utils/cloudinaryUpload.js';

/**
 * Shop Routes
 * /api/shops
 */

const router = express.Router();

// Debug route (place before others to avoid conflict)
router.get('/debug/approve-all', shopController.debugApproveAllShops);
router.get('/debug/diagnose', shopController.diagnoseShops);

// Public routes
router.get('/', readRateLimiter, shopController.getPublicShops);
router.get('/nearby', readRateLimiter, shopController.getNearbyShops);
router.get('/:id', readRateLimiter, mongoIdValidator, shopController.getShopById);

// Seller routes (protected)
router.post(
    '/',
    auth,
    requireSeller,
    apiRateLimiter,
    upload.array('images', 5), // Max 5 images
    createShopValidator,
    shopController.createShop
);

router.get('/seller/my-shop', auth, requireSeller, shopController.getMyShop);

router.patch(
    '/:id',
    auth,
    requireSeller,
    apiRateLimiter,
    upload.array('images', 5),
    mongoIdValidator,
    updateShopValidator,
    shopController.updateShop
);

// Admin routes (protected)
router.get('/admin/pending', auth, requireAdmin, shopController.getPendingShops);

router.get(
    '/admin/all',
    auth,
    requireAdmin,
    paginationValidator,
    shopController.getAllShops
);

router.patch(
    '/admin/:id/approve',
    auth,
    requireAdmin,
    mongoIdValidator,
    shopController.approveShop
);

router.patch(
    '/admin/:id/reject',
    auth,
    requireAdmin,
    mongoIdValidator,
    shopController.rejectShop
);

router.patch(
    '/admin/:id/block',
    auth,
    requireAdmin,
    mongoIdValidator,
    shopController.toggleShopBlock
);

export default router;
