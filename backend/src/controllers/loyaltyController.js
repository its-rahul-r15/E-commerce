import * as loyaltyService from '../services/loyaltyService.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';

/**
 * GET /api/loyalty/top-customers?minSpend=50000&limit=10
 */
export const getTopCustomers = async (req, res, next) => {
    try {
        const minSpend = parseFloat(req.query.minSpend) || 0;
        const limit = parseInt(req.query.limit) || 10;

        const customers = await loyaltyService.getTopCustomers(minSpend, limit);

        return successResponse(res, { customers, count: customers.length }, 'Top customers retrieved');
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/loyalty/send-coupons
 * Body: { userIds, couponData: { discountType, discountValue, expiryDate, minPurchase }, sendEmail }
 */
export const sendLoyaltyCoupons = async (req, res, next) => {
    try {
        const { userIds, couponData, sendEmail = true } = req.body;

        if (!userIds?.length) {
            return errorResponse(res, 'Please select at least one customer', 400);
        }
        if (!couponData?.discountType || !couponData?.discountValue || !couponData?.expiryDate) {
            return errorResponse(res, 'Coupon details (type, value, expiry) are required', 400);
        }

        const result = await loyaltyService.sendLoyaltyCoupons(userIds, couponData, sendEmail);

        return successResponse(
            res,
            result,
            `${result.coupons.length} loyalty coupons created${sendEmail ? ' and emails sent' : ''}`,
            201
        );
    } catch (error) {
        next(error);
    }
};
