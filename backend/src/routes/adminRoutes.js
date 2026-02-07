import express from 'express';
import * as adminController from '../controllers/adminController.js';
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

// User management
router.get('/users', paginationValidator, adminController.getAllUsers);
router.patch('/users/:id/block', mongoIdValidator, adminController.toggleUserBlock);
router.delete('/users/:id', mongoIdValidator, adminController.deleteUser);

export default router;
