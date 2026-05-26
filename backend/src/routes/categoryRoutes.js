import express from 'express';
import * as categoryController from '../controllers/categoryController.js';
import auth from '../middlewares/auth.js';
import { requireAdmin } from '../middlewares/roleCheck.js';
import { mongoIdValidator } from '../middlewares/validator.js';

const router = express.Router();

// Public: get categories
router.get('/', categoryController.getCategories);

// Admin: manage categories
router.post('/', auth, requireAdmin, categoryController.createCategory);
router.put('/:id', auth, requireAdmin, mongoIdValidator, categoryController.updateCategory);
router.delete('/:id', auth, requireAdmin, mongoIdValidator, categoryController.deleteCategory);

export default router;
