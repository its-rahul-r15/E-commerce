import express from 'express';
import * as paymentController from '../controllers/paymentController.js';
import auth from '../middlewares/auth.js';
import { requireCustomer, requireCustomerOrSeller } from '../middlewares/roleCheck.js';
import { apiRateLimiter } from '../middlewares/rateLimiter.js';

/**
 * Payment Routes
 * /api/payments
 */

const router = express.Router();

// All payment routes require authentication
router.use(auth);
// Allow both customers and sellers to pay
router.use(requireCustomerOrSeller);

// Create Razorpay order
router.post('/create-order', apiRateLimiter, paymentController.createOrder);

// Verify payment
router.post('/verify', apiRateLimiter, paymentController.verifyPayment);

// Handle payment failure
router.post('/failed', apiRateLimiter, paymentController.paymentFailed);

// Get payment details
router.get('/:paymentId', paymentController.getPaymentDetails);

export default router;
