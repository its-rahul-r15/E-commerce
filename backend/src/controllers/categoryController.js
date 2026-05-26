import Category from '../models/Category.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';

/**
 * Get all categories
 * GET /api/categories
 */
export const getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        return successResponse(res, categories, 'Categories retrieved successfully');
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new category (Admin only)
 * POST /api/categories
 */
export const createCategory = async (req, res, next) => {
    try {
        const { name, subCategories } = req.body;

        if (!name || name.trim() === '') {
            return errorResponse(res, 'Category name is required', 400, 'INVALID_INPUT');
        }

        // Check if category already exists
        const existingCategory = await Category.findOne({ name: name.trim() });
        if (existingCategory) {
            return errorResponse(res, 'Category with this name already exists', 400, 'DUPLICATE_CATEGORY');
        }

        // Process subCategories
        let subCats = [];
        if (Array.isArray(subCategories)) {
            subCats = subCategories.map(s => s.trim()).filter(s => s !== '');
        }

        const category = await Category.create({
            name: name.trim(),
            subCategories: subCats
        });

        return successResponse(res, category, 'Category created successfully', 201);
    } catch (error) {
        next(error);
    }
};

/**
 * Update category (Admin only)
 * PUT /api/categories/:id
 */
export const updateCategory = async (req, res, next) => {
    try {
        const { name, subCategories } = req.body;
        const categoryId = req.params.id;

        const category = await Category.findById(categoryId);
        if (!category) {
            return errorResponse(res, 'Category not found', 404, 'CATEGORY_NOT_FOUND');
        }

        if (name && name.trim() !== '') {
            // Check uniqueness if name is changing
            if (name.trim().toLowerCase() !== category.name.toLowerCase()) {
                const existingCategory = await Category.findOne({ name: name.trim() });
                if (existingCategory) {
                    return errorResponse(res, 'Category with this name already exists', 400, 'DUPLICATE_CATEGORY');
                }
            }
            category.name = name.trim();
        }

        if (Array.isArray(subCategories)) {
            category.subCategories = subCategories.map(s => s.trim()).filter(s => s !== '');
        }

        await category.save();

        return successResponse(res, category, 'Category updated successfully');
    } catch (error) {
        next(error);
    }
};

/**
 * Delete category (Admin only)
 * DELETE /api/categories/:id
 */
export const deleteCategory = async (req, res, next) => {
    try {
        const categoryId = req.params.id;

        const category = await Category.findByIdAndDelete(categoryId);
        if (!category) {
            return errorResponse(res, 'Category not found', 404, 'CATEGORY_NOT_FOUND');
        }

        return successResponse(res, null, 'Category deleted successfully');
    } catch (error) {
        next(error);
    }
};
