import express from 'express';
import * as adminController from '../controllers/adminController.js';
import * as adminAnalyticsController from '../controllers/adminAnalyticsController.js';
import auth from '../middlewares/auth.js';
import { requireAdmin } from '../middlewares/roleCheck.js';
import { mongoIdValidator, paginationValidator } from '../middlewares/validator.js';

/**
 * Admin Routes
 * /api/admin
 * All routes require admin authentication
 */

const router = express.Router();

// All admin routes require admin role
router.use(auth, requireAdmin);

// Platform statistics
router.get('/stats', adminController.getStats);
router.get('/statistics', adminController.getStats); // Alias for frontend
router.get('/analytics-summary', adminAnalyticsController.getAnalyticsSummary);
router.get('/platform-insights', adminAnalyticsController.getPlatformInsights);

// User management
router.get('/users', paginationValidator, adminController.getAllUsers);
router.patch('/users/:id/block', mongoIdValidator, adminController.toggleUserBlock);
router.delete('/users/:id', mongoIdValidator, adminController.deleteUser);

// Settlements & KYC Ledger
router.get('/ledger', adminAnalyticsController.getLedger);
router.patch('/shops/:id/kyc', mongoIdValidator, adminAnalyticsController.updateKYC);
router.post('/shops/:id/payout', mongoIdValidator, adminAnalyticsController.releasePayout);

// Returns & Refunds
router.get('/refunds', adminAnalyticsController.getRefundList);
router.post('/orders/:id/refund', mongoIdValidator, adminAnalyticsController.processRefund);

// Custom Tailoring dispatch
router.get('/tailoring', adminAnalyticsController.getAdminTailoringRequests);
router.patch('/tailoring/:id/status', mongoIdValidator, adminAnalyticsController.updateAdminTailoringStatus);

// Orders
router.patch('/orders/:id/status', mongoIdValidator, adminController.updateOrderStatus);

export default router;
