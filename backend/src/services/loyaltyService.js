import Order from '../models/Order.js';
import User from '../models/User.js';
import Coupon from '../models/Coupon.js';
import { sendLoyaltyCouponEmail } from './emailService.js';

/**
 * Get top customers by total spend
 * Aggregates completed/paid orders and returns top N customers
 */
export const getTopCustomers = async (minSpend = 0, limit = 10) => {
    const pipeline = [
        // Only count paid/completed orders
        {
            $match: {
                $or: [
                    { paymentStatus: 'paid' },
                    { status: 'completed' },
                ],
                status: { $ne: 'cancelled' },
            },
        },
        // Group by customer, sum total spend & count orders
        {
            $group: {
                _id: '$customerId',
                totalSpend: { $sum: '$totalAmount' },
                orderCount: { $sum: 1 },
                lastOrderDate: { $max: '$createdAt' },
            },
        },
        // Filter by minimum spend
        ...(minSpend > 0 ? [{ $match: { totalSpend: { $gte: minSpend } } }] : []),
        // Sort by total spend descending
        { $sort: { totalSpend: -1 } },
        // Limit results
        { $limit: limit },
        // Lookup user details
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'user',
            },
        },
        { $unwind: '$user' },
        // Project final shape
        {
            $project: {
                _id: 1,
                userId: '$_id',
                name: '$user.name',
                email: '$user.email',
                phone: '$user.phone',
                totalSpend: { $round: ['$totalSpend', 2] },
                orderCount: 1,
                lastOrderDate: 1,
            },
        },
    ];

    return await Order.aggregate(pipeline);
};

/**
 * Create exclusive coupons for selected users and optionally email them
 * @param {Array} userIds - Array of user ObjectIds
 * @param {Object} couponData - { discountType, discountValue, expiryDate, minPurchase, description }
 * @param {boolean} sendEmail - Whether to email the coupons
 * @returns {Object} { coupons, emailResults }
 */
export const sendLoyaltyCoupons = async (userIds, couponData, sendEmail = true) => {
    const { discountType, discountValue, expiryDate, minPurchase = 0, description = '' } = couponData;

    // Get user details
    const users = await User.find({ _id: { $in: userIds } }).select('name email');

    const coupons = [];
    const emailResults = [];

    for (const user of users) {
        // Generate unique coupon code: LOYALTY-<username-short>-<random>
        const namePart = user.name.replace(/\s+/g, '').slice(0, 4).toUpperCase();
        const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
        const code = `LOYAL-${namePart}-${randomPart}`;

        // Create the coupon
        const coupon = await Coupon.create({
            code,
            discountType,
            discountValue,
            expiryDate,
            minPurchase,
            usageLimit: 1, // Exclusive — one-time use per customer
            description: description || `Loyalty reward for ${user.name}`,
            isActive: true,
            shopId: null, // Global coupon
        });

        coupons.push({ userId: user._id, userName: user.name, email: user.email, couponCode: code });

        // Send email if requested
        if (sendEmail && user.email) {
            const sent = await sendLoyaltyCouponEmail(
                user.email,
                user.name,
                code,
                discountValue,
                discountType,
                expiryDate
            );
            emailResults.push({ email: user.email, sent });
        }
    }

    return { coupons, emailResults };
};
