import express from 'express';
import * as shoppableVideoController from '../controllers/shoppableVideoController.js';
import auth from '../middlewares/auth.js';
import { requireAdmin } from '../middlewares/roleCheck.js';
import { upload } from '../utils/cloudinaryUpload.js';
import { readRateLimiter, apiRateLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Public routes
router.get('/', readRateLimiter, shoppableVideoController.getVideos);

// Admin routes (protected)
router.get('/admin', auth, requireAdmin, readRateLimiter, shoppableVideoController.getAdminVideos);

router.post(
    '/',
    auth,
    requireAdmin,
    apiRateLimiter,
    upload.fields([{ name: 'video', maxCount: 1 }]),
    shoppableVideoController.createVideo
);

router.put(
    '/:id',
    auth,
    requireAdmin,
    apiRateLimiter,
    upload.fields([{ name: 'video', maxCount: 1 }]),
    shoppableVideoController.updateVideo
);

router.delete(
    '/:id',
    auth,
    requireAdmin,
    apiRateLimiter,
    shoppableVideoController.deleteVideo
);

export default router;
