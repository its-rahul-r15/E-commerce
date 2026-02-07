import express from 'express';
import * as authController from '../controllers/authController.js';
import * as googleOAuthController from '../controllers/googleOAuthController.js';
import auth from '../middlewares/auth.js';
import { registerValidator, loginValidator } from '../middlewares/validator.js';
import { authRateLimiter } from '../middlewares/rateLimiter.js';

/**
 * Authentication Routes
 * /api/auth
 */

const router = express.Router();

// Public routes with rate limiting
router.post('/register', authRateLimiter, registerValidator, authController.register);
router.post('/login', authRateLimiter, loginValidator, authController.login);
router.post('/refresh', authController.refresh);

// Google OAuth routes
router.get('/google', googleOAuthController.googleAuth);
router.get('/google/callback', googleOAuthController.googleCallback);

// Protected routes
router.post('/logout', auth, authController.logout);
router.get('/me', auth, authController.getProfile);
router.patch('/me', auth, authController.updateProfile);

export default router;
