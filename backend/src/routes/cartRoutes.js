import express from 'express';
import * as cartController from '../controllers/cartController.js';
import auth from '../middlewares/auth.js';
import { requireCustomerOrSeller } from '../middlewares/roleCheck.js';
import { apiRateLimiter } from '../middlewares/rateLimiter.js';
import { productIdValidator } from '../middlewares/validator.js';

const router = express.Router();

// All cart routes require customer or seller role
router.use(auth, requireCustomerOrSeller);

router.get('/', cartController.getCart);

router.post('/items', apiRateLimiter, cartController.addToCart);

router.patch(
    '/items/:productId',
    apiRateLimiter,
    productIdValidator,
    cartController.updateCartItem
);

router.delete(
    '/items/:productId',
    apiRateLimiter,
    productIdValidator,
    cartController.removeFromCart
);

router.delete('/', apiRateLimiter, cartController.clearCart);

export default router;

