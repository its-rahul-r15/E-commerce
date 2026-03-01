import express from 'express';
import auth from '../middlewares/auth.js';
import { requireCustomer, requireSeller } from '../middlewares/roleCheck.js';
import {
    submitTailoringRequest,
    getMyTailoringRequests,
    getShopTailoringRequests,
    updateTailoringStatus,
    getTailoringRequestById,
} from '../controllers/tailoringController.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

// ── Customer Routes ───────────────────────────────────────────────────────────

// Submit a new tailoring request
router.post('/', requireCustomer, submitTailoringRequest);

// Get customer's own tailoring requests
router.get('/my', requireCustomer, getMyTailoringRequests);

// ── Seller Routes ─────────────────────────────────────────────────────────────

// Get all tailoring requests for this seller's shop
router.get('/shop', requireSeller, getShopTailoringRequests);

// Update status / add notes for a request (seller only)
router.patch('/:id/status', requireSeller, updateTailoringStatus);

// ── Shared Routes (customer who owns it or seller of that shop) ───────────────

// Get single request details
router.get('/:id', getTailoringRequestById);

export default router;
