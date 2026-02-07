import express from 'express';
import * as orderController from '../controllers/orderController.js';
import auth from '../middlewares/auth.js';
import { requireCustomer, requireSeller, requireAdmin } from '../middlewares/roleCheck.js';
import { apiRateLimiter } from '../middlewares/rateLimiter.js';
import { mongoIdValidator, paginationValidator } from '../middlewares/validator.js';

/**
 * Order Routes
 * /api/orders
 */

const router = express.Router();

// Customer routes
router.post(
    '/',
    auth,
    requireCustomer,
    apiRateLimiter,
    orderController.createOrder
);

router.get(
    '/customer/my-orders',
    auth,
    requireCustomer,
    paginationValidator,
    orderController.getMyOrders
);

// Seller routes
router.get(
    '/seller/shop-orders',
    auth,
    requireSeller,
    paginationValidator,
    orderController.getShopOrders
);

router.patch(
    '/:id/status',
    auth,
    requireSeller,
    apiRateLimiter,
    mongoIdValidator,
    orderController.updateOrderStatus
);

// Shared routes (Customer or Seller can access their own orders)
router.get(
    '/:id',
    auth,
    mongoIdValidator,
    orderController.getOrderById
);

router.patch(
    '/:id/cancel',
    auth,
    apiRateLimiter,
    mongoIdValidator,
    orderController.cancelOrder
);

// Admin routes
router.get(
    '/admin/all',
    auth,
    requireAdmin,
    paginationValidator,
    orderController.getAllOrders
);

export default router;
