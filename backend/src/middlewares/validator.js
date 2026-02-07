import { body, param, query, validationResult } from 'express-validator';
import { errorResponse } from '../utils/responseFormatter.js';

/**
 * Validation Middleware
 * Input validation and sanitization rules
 */

// Helper to handle validation errors
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const messages = errors.array().map(err => err.msg);
        return errorResponse(res, messages.join(', '), 400, 'VALIDATION_ERROR');
    }

    next();
};

// ==================== Auth Validation ====================

export const registerValidator = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number'),

    body('phone')
        .trim()
        .notEmpty().withMessage('Phone number is required')
        .matches(/^[6-9]\d{9}$/).withMessage('Please enter a valid 10-digit Indian phone number'),

    body('role')
        .optional()
        .isIn(['customer', 'seller']).withMessage('Role must be customer or seller'),

    handleValidationErrors,
];

export const loginValidator = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required'),

    handleValidationErrors,
];

// ==================== Shop Validation ====================

export const createShopValidator = [
    body('shopName')
        .trim()
        .notEmpty().withMessage('Shop name is required')
        .isLength({ min: 3, max: 100 }).withMessage('Shop name must be 3-100 characters'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),

    body('category')
        .notEmpty().withMessage('Category is required')
        .isIn(['Grocery', 'Electronics', 'Clothing', 'Pharmacy', 'Restaurant', 'Bakery', 'Hardware', 'Books', 'Jewelry', 'Other'])
        .withMessage('Invalid category'),

    body('address.street')
        .trim()
        .notEmpty().withMessage('Street address is required'),

    body('address.city')
        .trim()
        .notEmpty().withMessage('City is required'),

    body('address.state')
        .trim()
        .notEmpty().withMessage('State is required'),

    body('address.pincode')
        .trim()
        .notEmpty().withMessage('Pincode is required')
        .matches(/^\d{6}$/).withMessage('Pincode must be 6 digits'),

    body('location.coordinates')
        .isArray({ min: 2, max: 2 }).withMessage('Coordinates must be [longitude, latitude]'),

    body('phone')
        .trim()
        .notEmpty().withMessage('Phone number is required')
        .matches(/^[6-9]\d{9}$/).withMessage('Please enter a valid 10-digit phone number'),

    handleValidationErrors,
];

// ==================== Product Validation ====================

export const createProductValidator = [
    body('name')
        .trim()
        .notEmpty().withMessage('Product name is required')
        .isLength({ min: 3, max: 200 }).withMessage('Product name must be 3-200 characters'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),

    body('category')
        .notEmpty().withMessage('Category is required'),

    body('price')
        .notEmpty().withMessage('Price is required')
        .isFloat({ min: 0 }).withMessage('Price must be a positive number'),

    body('discountedPrice')
        .optional()
        .isFloat({ min: 0 }).withMessage('Discounted price must be a positive number'),

    body('stock')
        .notEmpty().withMessage('Stock is required')
        .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),

    handleValidationErrors,
];

// ==================== Order Validation ====================

export const createOrderValidator = [
    body('shopId')
        .notEmpty().withMessage('Shop ID is required')
        .isMongoId().withMessage('Invalid shop ID'),

    body('items')
        .isArray({ min: 1 }).withMessage('Order must have at least one item'),

    body('items.*.productId')
        .isMongoId().withMessage('Invalid product ID'),

    body('items.*.quantity')
        .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),

    body('deliveryAddress.street')
        .trim()
        .notEmpty().withMessage('Delivery street is required'),

    body('deliveryAddress.city')
        .trim()
        .notEmpty().withMessage('Delivery city is required'),

    body('deliveryAddress.state')
        .trim()
        .notEmpty().withMessage('Delivery state is required'),

    body('deliveryAddress.pincode')
        .trim()
        .notEmpty().withMessage('Delivery pincode is required')
        .matches(/^\d{6}$/).withMessage('Pincode must be 6 digits'),

    handleValidationErrors,
];

export const updateOrderStatusValidator = [
    param('id')
        .isMongoId().withMessage('Invalid order ID'),

    body('status')
        .notEmpty().withMessage('Status is required')
        .isIn(['accepted', 'preparing', 'ready', 'completed', 'cancelled'])
        .withMessage('Invalid order status'),

    handleValidationErrors,
];

// ==================== Common Validators ====================

export const mongoIdValidator = [
    param('id')
        .isMongoId().withMessage('Invalid ID format'),

    handleValidationErrors,
];

export const shopIdValidator = [
    param('shopId')
        .isMongoId().withMessage('Invalid shop ID format'),

    handleValidationErrors,
];

export const paginationValidator = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

    handleValidationErrors,
];
