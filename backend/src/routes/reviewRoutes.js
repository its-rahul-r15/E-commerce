import express from 'express';
import { createReview, getProductReviews, checkPurchase } from '../controllers/reviewController.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/:productId', getProductReviews);

// Protected routes
router.post('/:productId', auth, createReview);
router.get('/check-purchase/:productId', auth, checkPurchase);

export default router;
