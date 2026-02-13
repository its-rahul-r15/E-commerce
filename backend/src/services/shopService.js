import Shop from '../models/Shop.js';
import User from '../models/User.js';
import { deleteCache, deleteCachePattern, setCache, getCache } from './cacheService.js';

/**
 * Shop Service
 * Business logic for shop management
 */

/**
 * Create/Register a new shop (Seller only)
 * @param {string} sellerId - User ID of the seller
 * @param {Object} shopData - Shop details
 * @returns {Promise<Object>} Created shop
 */
export const createShop = async (sellerId, shopData) => {
    // Check if seller already has a shop
    const existingShop = await Shop.findOne({ sellerId });
    if (existingShop) {
        throw new Error('You already have a shop registered');
    }

    // Verify user is a seller
    const user = await User.findById(sellerId);
    if (!user || user.role !== 'seller') {
        throw new Error('Only sellers can create shops');
    }

    // Create shop with pending status
    const shop = await Shop.create({
        sellerId,
        ...shopData,
        status: 'pending', // Requires admin approval
    });

    return shop;
};

/**
 * Get shops within 5km radius (Location-based search)
 * @param {number} longitude - User's longitude
 * @param {number} latitude - User's latitude
 * @param {number} maxDistance - Max distance in meters (default 5000m = 5km)
 * @returns {Promise<Array>} Nearby shops
 */
export const getNearbyShops = async (longitude, latitude, maxDistance = 5000) => {
    const cacheKey = `shops:nearby:${longitude}:${latitude}:${maxDistance}`;

    // Try cache first
    const cached = await getCache(cacheKey);
    if (cached) {
        return JSON.parse(cached);
    }

    // Query with geospatial search
    const shops = await Shop.find({
        status: 'approved', // Only show approved shops
        location: {
            $nearSphere: {
                $geometry: {
                    type: 'Point',
                    coordinates: [longitude, latitude],
                },
                $maxDistance: maxDistance,
            },
        },
    })
        .lean() // Return plain JS objects for better performance
        .limit(50); // Limit results

    // Cache for 10 minutes
    await setCache(cacheKey, JSON.stringify(shops), 600).catch(err => {
        console.error('Cache set error:', err.message);
    });

    return shops;
};

/**
 * Get shop by ID
 * @param {string} shopId - Shop ID
 * @returns {Promise<Object>} Shop details
 */
export const getShopById = async (shopId) => {
    const cacheKey = `shop:${shopId}`;

    // Try cache
    const cached = await getCache(cacheKey);
    if (cached) {
        return JSON.parse(cached);
    }

    const shop = await Shop.findById(shopId).populate('sellerId', 'name email phone');

    if (!shop) {
        throw new Error('Shop not found');
    }

    // Don't show blocked/rejected shops to public
    if (shop.status === 'blocked' || shop.status === 'rejected') {
        throw new Error('Shop not available');
    }

    // Cache for 15 minutes
    await setCache(cacheKey, JSON.stringify(shop), 900);

    return shop;
};

/**
 * Get seller's shop
 * @param {string} sellerId - Seller user ID
 * @returns {Promise<Object>} Shop details
 */
export const getSellerShop = async (sellerId) => {
    const shop = await Shop.findOne({ sellerId });

    if (!shop) {
        throw new Error('No shop found for this seller');
    }

    return shop;
};

/**
 * Update shop details (Seller only - must own the shop)
 * @param {string} shopId - Shop ID
 * @param {string} sellerId - Seller user ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated shop
 */
export const updateShop = async (shopId, sellerId, updates) => {
    const shop = await Shop.findById(shopId);

    if (!shop) {
        throw new Error('Shop not found');
    }

    // Verify ownership
    if (shop.sellerId.toString() !== sellerId) {
        throw new Error('You can only update your own shop');
    }

    // Prevent updating status (only admin can do that)
    delete updates.status;
    delete updates.sellerId;

    // Update shop
    Object.assign(shop, updates);
    await shop.save();

    // Invalidate caches
    await deleteCache(`shop:${shopId}`);
    await deleteCachePattern('shops:nearby:*');

    return shop;
};

/**
 * Get shops pending approval (Admin only)
 * @returns {Promise<Array>} Pending shops
 */
export const getPendingShops = async () => {
    const shops = await Shop.find({ status: 'pending' })
        .populate('sellerId', 'name email phone')
        .sort({ createdAt: -1 });

    return shops;
};

/**
 * Approve shop (Admin only)
 * @param {string} shopId - Shop ID
 * @returns {Promise<Object>} Updated shop
 */
export const approveShop = async (shopId) => {
    const shop = await Shop.findByIdAndUpdate(
        shopId,
        { status: 'approved' },
        { new: true }
    );

    if (!shop) {
        throw new Error('Shop not found');
    }

    // Invalidate caches
    await deleteCache(`shop:${shopId}`);
    await deleteCachePattern('shops:nearby:*');

    return shop;
};

/**
 * Reject shop (Admin only)
 * @param {string} shopId - Shop ID
 * @returns {Promise<Object>} Updated shop
 */
export const rejectShop = async (shopId) => {
    const shop = await Shop.findByIdAndUpdate(
        shopId,
        { status: 'rejected' },
        { new: true }
    );

    if (!shop) {
        throw new Error('Shop not found');
    }

    // Invalidate caches
    await deleteCache(`shop:${shopId}`);

    return shop;
};

/**
 * Block/Unblock shop (Admin only)
 * @param {string} shopId - Shop ID
 * @param {boolean} blocked - Block status
 * @returns {Promise<Object>} Updated shop
 */
export const toggleShopBlock = async (shopId, blocked) => {
    const shop = await Shop.findByIdAndUpdate(
        shopId,
        { status: blocked ? 'blocked' : 'approved' },
        { new: true }
    );

    if (!shop) {
        throw new Error('Shop not found');
    }

    // Invalidate caches
    await deleteCache(`shop:${shopId}`);
    await deleteCachePattern('shops:nearby:*');

    return shop;
};

/**
 * Get all shops (Admin only - with filters)
 * @param {Object} filters - Filter options (status, page, limit)
 * @returns {Promise<Object>} Shops with pagination
 */
export const getAllShops = async (filters = {}) => {
    const { status, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const query = {};
    if (status) {
        query.status = status;
    }

    const [shops, total] = await Promise.all([
        Shop.find(query)
            .populate('sellerId', 'name email phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Shop.countDocuments(query),
    ]);

    return {
        shops,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
};

export const updateManyShops = async (filter, update) => {
    return await Shop.updateMany(filter, update);
};

export { Shop };
