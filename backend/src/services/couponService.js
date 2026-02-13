import Coupon from '../models/Coupon.js';
import Shop from '../models/Shop.js';

/**
 * Create a new coupon
 */
export const createCoupon = async (data, userId, role) => {
    // If seller, ensure shop exists and link coupon to shop
    if (role === 'seller') {
        const shop = await Shop.findOne({ sellerId: userId });
        if (!shop) throw new Error('Shop not found');
        data.shopId = shop._id;
    }
    // If admin, coupon can be global (no shopId) or specific

    const coupon = await Coupon.create(data);
    return coupon;
};

/**
 * Get coupons (with filters)
 */
export const getCoupons = async (filters = {}) => {
    const { shopId, isActive } = filters;
    const query = {};

    if (shopId) query.shopId = shopId;
    if (isActive !== undefined) query.isActive = isActive;

    return await Coupon.find(query).sort('-createdAt');
};

/**
 * Validate specific coupon code
 */
export const validateCoupon = async (code, purchaseAmount, shopId) => {
    const coupon = await Coupon.findOne({
        code: code.toUpperCase(),
        isActive: true
    });

    if (!coupon) {
        throw new Error('Invalid coupon code');
    }

    if (!coupon.isValid()) {
        throw new Error('Coupon expired or usage limit reached');
    }

    // Check minimum purchase
    if (purchaseAmount < coupon.minPurchase) {
        throw new Error(`Minimum purchase of ₹${coupon.minPurchase} required`);
    }

    // Check shop specificity
    // If coupon has shopId, it must match the item's shop (simplified for single-shop checkout or cart validation)
    if (coupon.shopId && (!shopId || coupon.shopId.toString() !== shopId.toString())) {
        throw new Error('This coupon is not valid for this shop');
    }

    return coupon;
};

/**
 * Update logic for usage count (to be called after order placement)
 */
export const incrementCouponUsage = async (code) => {
    await Coupon.findOneAndUpdate(
        { code: code.toUpperCase() },
        { $inc: { usedCount: 1 } }
    );
};

/**
 * Update coupon
 */
export const updateCoupon = async (id, data, userId, role) => {
    const coupon = await Coupon.findById(id);
    if (!coupon) throw new Error('Coupon not found');

    // Check authorization
    if (role === 'seller') {
        const shop = await Shop.findOne({ sellerId: userId });
        if (!shop || coupon.shopId?.toString() !== shop._id.toString()) {
            throw new Error('Unauthorized');
        }
    }

    Object.assign(coupon, data);
    await coupon.save();
    return coupon;
};

/**
 * Delete coupon
 */
export const deleteCoupon = async (id, userId, role) => {
    const coupon = await Coupon.findById(id);
    if (!coupon) throw new Error('Coupon not found');

    // Check authorization
    if (role === 'seller') {
        const shop = await Shop.findOne({ sellerId: userId });
        if (!shop || coupon.shopId?.toString() !== shop._id.toString()) {
            throw new Error('Unauthorized');
        }
    }

    await coupon.deleteOne();
};

/**
 * Get all active coupons (for customer view)
 */
export const getActiveCoupons = async () => {
    const now = new Date();
    return await Coupon.find({
        isActive: true,
        expiryDate: { $gt: now },
        $or: [
            { usageLimit: null },
            { $expr: { $lt: ['$usedCount', '$usageLimit'] } }
        ]
    }).sort('-createdAt').select('-__v');
};
