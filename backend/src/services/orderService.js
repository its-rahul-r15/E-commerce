import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Shop from '../models/Shop.js';
import { deleteCachePattern } from './cacheService.js';

/**
 * Order Service
 * Business logic for order management
 */

/**
 * Create order from cart
 * @param {string} customerId - Customer user ID
 * @param {Object} orderData - { deliveryAddress, paymentMethod }
 * @returns {Promise<Object>} Created order
 */
export const createOrder = async (customerId, orderData) => {
    const { deliveryAddress } = orderData;

    // Get customer's cart — populate product AND product's shopId
    const cart = await Cart.findOne({ customerId }).populate({
        path: 'items.productId',
        populate: { path: 'shopId', select: '_id' },
    });

    if (!cart || cart.items.length === 0) {
        throw new Error('Cart is empty');
    }

    // Group items by shop
    const itemsByShop = {};
    let totalAmount = 0;

    for (const item of cart.items) {
        const product = item.productId;

        if (!product || !product.isAvailable || product.isBanned) {
            throw new Error(`Product ${product?.name || 'unknown'} is not available`);
        }

        if (product.stock < item.quantity) {
            throw new Error(`Insufficient stock for ${product.name}. Only ${product.stock} available`);
        }

        // Extract shopId robustly:
        // product.shopId may be a populated object OR a raw ObjectId
        const rawShopId = product.shopId?._id || product.shopId || item.shopId;
        const shopId = rawShopId?.toString();

        // DEBUG — will show in server terminal
        console.log(`[ORDER DEBUG] product="${product.name}" product.shopId=${JSON.stringify(product.shopId)} item.shopId=${item.shopId} resolved shopId="${shopId}"`);

        if (!shopId || shopId === 'undefined' || shopId === 'null') {
            throw new Error(`Product "${product.name}" is not linked to a shop. Please contact support.`);
        }

        if (!itemsByShop[shopId]) {
            itemsByShop[shopId] = [];
        }

        const price = product.discountedPrice || product.price;
        const itemTotal = price * item.quantity;
        totalAmount += itemTotal;

        itemsByShop[shopId].push({
            productId: product._id,
            name: product.name,
            price,
            quantity: item.quantity,
        });
    }

    // Create separate order for each shop
    const orders = [];

    for (const [shopId, items] of Object.entries(itemsByShop)) {
        const orderTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const order = await Order.create({
            customerId,
            shopId,
            items,
            totalAmount: orderTotal,
            deliveryAddress,
            status: 'pending',
            paymentStatus: 'pending',
        });

        // Reduce product stock
        for (const item of items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: -item.quantity },
            });
        }

        orders.push(order);
    }

    // DON'T clear cart here - it should only be cleared after successful payment
    // Cart clearing is now handled in payment verification handler
    // cart.items = [];
    // await cart.save();

    // Invalidate product caches
    await deleteCachePattern('products:*');

    return orders;
};

/**
 * Get customer's orders
 * @param {string} customerId - Customer user ID
 * @param {Object} filters - { status, page, limit }
 * @returns {Promise<Object>} Orders with pagination
 */
export const getCustomerOrders = async (customerId, filters = {}) => {
    const { status, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const query = { customerId };

    if (status) {
        query.status = status;
    }

    const [orders, total] = await Promise.all([
        Order.find(query)
            .populate('shopId', 'shopName phone address')
            .sort('-createdAt')
            .skip(skip)
            .limit(limit),
        Order.countDocuments(query),
    ]);

    return {
        orders,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
};

/**
 * Get shop's orders (for seller)
 * @param {string} sellerId - Seller user ID
 * @param {Object} filters - { status, page, limit }
 * @returns {Promise<Object>} Orders with pagination
 */
export const getShopOrders = async (sellerId, filters = {}) => {
    const { status, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    // Get seller's shop
    const shop = await Shop.findOne({ sellerId });

    if (!shop) {
        throw new Error('No shop found for this seller');
    }

    const query = { shopId: shop._id };

    if (status) {
        query.status = status;
    }

    const [orders, total] = await Promise.all([
        Order.find(query)
            .populate('customerId', 'name phone email')
            .sort('-createdAt')
            .skip(skip)
            .limit(limit),
        Order.countDocuments(query),
    ]);

    return {
        orders,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
};

/**
 * Get order by ID
 * @param {string} orderId - Order ID
 * @param {string} userId - User ID (for access control)
 * @param {string} userRole - User role
 * @returns {Promise<Object>} Order details
 */
export const getOrderById = async (orderId, userId, userRole) => {
    const order = await Order.findById(orderId)
        .populate('shopId', 'shopName phone address')
        .populate('customerId', 'name phone email');

    if (!order) {
        throw new Error('Order not found');
    }

    // Access control: Allow if user is the customer OR the shop owner
    const isCustomer = order.customerId._id.toString() === userId;

    if (isCustomer) {
        return order;
    }

    // Check if user is the shop owner
    const shop = await Shop.findOne({ sellerId: userId });
    if (shop && order.shopId._id.toString() === shop._id.toString()) {
        return order;
    }

    throw new Error('Access denied');

    return order;
};

/**
 * Update order status (Seller only)
 * @param {string} orderId - Order ID
 * @param {string} sellerId - Seller user ID
 * @param {string} newStatus - New status
 * @returns {Promise<Object>} Updated order
 */
export const updateOrderStatus = async (orderId, sellerId, newStatus) => {
    const order = await Order.findById(orderId).populate('shopId');

    if (!order) {
        throw new Error('Order not found');
    }

    // Verify seller owns the shop
    if (order.shopId.sellerId.toString() !== sellerId) {
        throw new Error('You can only update orders for your own shop');
    }

    // Validate status transitions
    const validStatuses = ['pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'];

    if (!validStatuses.includes(newStatus)) {
        throw new Error('Invalid status');
    }

    // Business logic: Can't complete if not accepted first
    if (newStatus === 'completed' && order.status === 'pending') {
        throw new Error('Order must be accepted before completing');
    }

    order.status = newStatus;
    await order.save();

    return order;
};

/**
 * Cancel order (Customer or Seller)
 * @param {string} orderId - Order ID
 * @param {string} userId - User ID
 * @param {string} userRole - User role
 * @returns {Promise<Object>} Cancelled order
 */
export const cancelOrder = async (orderId, userId, userRole) => {
    const order = await Order.findById(orderId).populate('shopId');

    if (!order) {
        throw new Error('Order not found');
    }

    // Verify access
    const isCustomer = order.customerId.toString() === userId;
    const isShopOwner = order.shopId.sellerId.toString() === userId;

    if (!isCustomer && !isShopOwner) {
        throw new Error('Access denied');
    }

    // Can only cancel pending or accepted orders
    if (!['pending', 'accepted'].includes(order.status)) {
        throw new Error('Cannot cancel order at this stage');
    }

    order.status = 'cancelled';
    await order.save();

    // Restore product stock
    for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: item.quantity },
        });
    }

    // Invalidate product caches
    await deleteCachePattern('products:*');

    return order;
};

/**
 * Get all orders (Admin only)
 * @param {Object} filters - { status, page, limit }
 * @returns {Promise<Object>} Orders with pagination
 */
export const getAllOrders = async (filters = {}) => {
    const { status, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const query = {};

    if (status) {
        query.status = status;
    }

    const [orders, total] = await Promise.all([
        Order.find(query)
            .populate('customerId', 'name email')
            .populate('shopId', 'shopName')
            .sort('-createdAt')
            .skip(skip)
            .limit(limit),
        Order.countDocuments(query),
    ]);

    return {
        orders,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
};
