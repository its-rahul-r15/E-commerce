import express from 'express';
import * as cartController from '../controllers/cartController.js';
import auth from '../middlewares/auth.js';
import requireRole from '../middlewares/roleCheck.js';
import { apiRateLimiter } from '../middlewares/rateLimiter.js';
import { mongoIdValidator } from '../middlewares/validator.js';

/**
 * Cart Routes
 * /api/cart
 * All routes require customer authentication
 */

const router = express.Router();

// All cart routes require customer role
router.use(auth, requireRole('customer'));

router.get('/', cartController.getCart);

router.post('/items', apiRateLimiter, cartController.addToCart);

router.patch(
    '/items/:productId',
    apiRateLimiter,
    mongoIdValidator,
    cartController.updateCartItem
);

router.delete(
    '/items/:productId',
    apiRateLimiter,
    mongoIdValidator,
    cartController.removeFromCart
);

router.delete('/', apiRateLimiter, cartController.clearCart);

export default router;
