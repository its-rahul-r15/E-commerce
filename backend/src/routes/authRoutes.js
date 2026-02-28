import express from 'express';
import * as authController from '../controllers/authController.js';
import * as googleOAuthController from '../controllers/googleOAuthController.js';
import * as addressController from '../controllers/addressController.js';
import auth from '../middlewares/auth.js';
import { registerValidator, loginValidator, updateProfileValidator } from '../middlewares/validator.js';
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
router.patch('/me', auth, updateProfileValidator, authController.updateProfile);

// Saved Addresses routes (protected)
router.get('/addresses', auth, addressController.getAddresses);
router.post('/addresses', auth, addressController.addAddress);
router.delete('/addresses/:index', auth, addressController.deleteAddress);
router.patch('/addresses/:index/default', auth, addressController.setDefaultAddress);

export default router;

