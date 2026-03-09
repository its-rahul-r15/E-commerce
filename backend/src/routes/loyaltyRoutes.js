import express from 'express';
import * as loyaltyController from '../controllers/loyaltyController.js';
import authenticate from '../middlewares/auth.js';
import authorize from '../middlewares/roleCheck.js';

const router = express.Router();

// All routes require admin auth
router.use(authenticate);
router.use(authorize('admin'));

router.get('/top-customers', loyaltyController.getTopCustomers);
router.post('/send-coupons', loyaltyController.sendLoyaltyCoupons);

export default router;
