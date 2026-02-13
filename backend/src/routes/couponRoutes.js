import express from 'express';
import * as couponController from '../controllers/couponController.js';
import authenticate from '../middlewares/auth.js';
import authorize from '../middlewares/roleCheck.js';

const router = express.Router();

// Public/Customer routes
router.get('/active', couponController.getActiveCoupons);
router.post('/validate', couponController.validateCoupon);

// Protected routes (Admin/Seller)
router.use(authenticate);
router.post('/', authorize('admin', 'seller'), couponController.createCoupon);
router.get('/', authorize('admin', 'seller'), couponController.getCoupons);
router.patch('/:id', authorize('admin', 'seller'), couponController.updateCoupon);
router.delete('/:id', authorize('admin', 'seller'), couponController.deleteCoupon);

export default router;
