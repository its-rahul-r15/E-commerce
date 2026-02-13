import * as couponService from '../services/couponService.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';

export const createCoupon = async (req, res, next) => {
    try {
        const coupon = await couponService.createCoupon(req.body, req.user.userId, req.user.role);
        return successResponse(res, { coupon }, 'Coupon created successfully', 201);
    } catch (error) {
        next(error);
    }
};

export const getCoupons = async (req, res, next) => {
    try {
        const filters = { ...req.query };
        // If seller, force shopId filter? Or let service handle?
        // For simplicity, let's just return all for now or filter by query
        const coupons = await couponService.getCoupons(filters);
        return successResponse(res, { coupons }, 'Coupons retrieved successfully');
    } catch (error) {
        next(error);
    }
};

export const validateCoupon = async (req, res, next) => {
    try {
        const { code, amount, shopId } = req.body;
        if (!code) return errorResponse(res, 'Code is required', 400);

        const coupon = await couponService.validateCoupon(code, amount, shopId);

        // Calculate discount amount for preview
        let discountAmount = 0;
        if (coupon.discountType === 'percentage') {
            discountAmount = (amount * coupon.discountValue) / 100;
        } else {
            discountAmount = coupon.discountValue;
        }

        // Ensure discount doesn't exceed total amount
        discountAmount = Math.min(discountAmount, amount);

        return successResponse(res, {
            coupon,
            discountAmount,
            finalAmount: amount - discountAmount
        }, 'Coupon is valid');

    } catch (error) {
        return errorResponse(res, error.message, 400);
    }
};

export const updateCoupon = async (req, res, next) => {
    try {
        const { id } = req.params;
        const coupon = await couponService.updateCoupon(id, req.body, req.user.userId, req.user.role);
        return successResponse(res, { coupon }, 'Coupon updated successfully');
    } catch (error) {
        next(error);
    }
};

export const deleteCoupon = async (req, res, next) => {
    try {
        const { id } = req.params;
        await couponService.deleteCoupon(id, req.user.userId, req.user.role);
        return successResponse(res, null, 'Coupon deleted successfully');
    } catch (error) {
        next(error);
    }
};

export const getActiveCoupons = async (req, res, next) => {
    try {
        const coupons = await couponService.getActiveCoupons();
        return successResponse(res, { coupons }, 'Active coupons retrieved successfully');
    } catch (error) {
        next(error);
    }
};
