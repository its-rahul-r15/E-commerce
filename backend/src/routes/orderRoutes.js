import express from 'express';
import * as orderController from '../controllers/orderController.js';
import auth from '../middlewares/auth.js';
import { requireCustomer, requireSeller, requireAdmin, requireCustomerOrSeller } from '../middlewares/roleCheck.js';
import { apiRateLimiter } from '../middlewares/rateLimiter.js';
import { mongoIdValidator, paginationValidator, createOrderValidator } from '../middlewares/validator.js';

/**
 * Order Routes
 * /api/orders
 */

const router = express.Router();

// Customer/Seller buying routes
router.post(
    '/',
    auth,
    requireCustomerOrSeller,
    apiRateLimiter,
    createOrderValidator,
    orderController.createOrder
);

router.get(
    '/customer/my-orders',
    auth,
    requireCustomerOrSeller,
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
