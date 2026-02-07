import User from '../models/User.js';
import Shop from '../models/Shop.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

/**
 * Admin Service
 * Business logic for admin operations
 */

/**
 * Get platform statistics
 * @returns {Promise<Object>} Platform statistics
 */
export const getPlatformStatistics = async () => {
    const [
        totalUsers,
        totalCustomers,
        totalSellers,
        totalShops,
        approvedShops,
        pendingShops,
        totalProducts,
        totalOrders,
        pendingOrders,
        acceptedOrders,
        preparingOrders,
        completedOrders,
    ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'customer' }),
        User.countDocuments({ role: 'seller' }),
        Shop.countDocuments(),
        Shop.countDocuments({ status: 'approved' }),
        Shop.countDocuments({ status: 'pending' }),
        Product.countDocuments(),
        Order.countDocuments(),
        Order.countDocuments({ status: 'pending' }),
        Order.countDocuments({ status: 'accepted' }),
        Order.countDocuments({ status: 'preparing' }),
        Order.countDocuments({ status: 'completed' }),
    ]);

    // Calculate total revenue from completed orders
    const revenueData = await Order.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    return {
        totalUsers,
        totalCustomers,
        totalSellers,
        totalShops,
        approvedShops,
        pendingShops,
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingOrders,
        processingOrders: acceptedOrders, // Map 'accepted' to 'processing' for frontend
        shippedOrders: preparingOrders,   // Map 'preparing' to 'shipped' for frontend
        deliveredOrders: completedOrders, // Map 'completed' to 'delivered' for frontend
    };
};

/**
 * Get all users with pagination
 * @param {Object} filters - Filter options (role, page, limit)
 * @returns {Promise<Object>} Users with pagination
 */
export const getAllUsers = async (filters = {}) => {
    const { role, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const query = {};
    if (role) {
        query.role = role;
    }

    const [users, total] = await Promise.all([
        User.find(query)
            .select('-password')
            .sort('-createdAt')
            .skip(skip)
            .limit(limit),
        User.countDocuments(query),
    ]);

    return {
        users,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
};

/**
 * Block user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated user
 */
export const blockUser = async (userId) => {
    const user = await User.findByIdAndUpdate(
        userId,
        { isBlocked: true },
        { new: true }
    ).select('-password');

    if (!user) {
        throw new Error('User not found');
    }

    return user;
};

/**
 * Unblock user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated user
 */
export const unblockUser = async (userId) => {
    const user = await User.findByIdAndUpdate(
        userId,
        { isBlocked: false },
        { new: true }
    ).select('-password');

    if (!user) {
        throw new Error('User not found');
    }

    return user;
};

/**
 * Delete user
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteUser = async (userId) => {
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
        throw new Error('User not found');
    }

    return true;
};
