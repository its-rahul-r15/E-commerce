import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

/**
 * Cart Service
 * Business logic for shopping cart management
 */

/**
 * Get customer's cart
 * @param {string} customerId - Customer user ID
 * @returns {Promise<Object>} Cart with populated products
 */
export const getCart = async (customerId) => {
    let cart = await Cart.findOne({ customerId })
        .populate({
            path: 'items.productId',
            select: 'name price discountedPrice images stock isAvailable isBanned shopId',
            populate: {
                path: 'shopId',
                select: 'shopName',
            },
        });

    if (!cart) {
        // Create empty cart if doesn't exist
        cart = await Cart.create({ customerId, items: [] });
    }

    // Filter out unavailable or banned products
    cart.items = cart.items.filter(
        (item) => item.productId && item.productId.isAvailable && !item.productId.isBanned
    );

    return cart;
};

/**
 * Add item to cart
 * @param {string} customerId - Customer user ID
 * @param {Object} itemData - { productId, quantity }
 * @returns {Promise<Object>} Updated cart
 */
export const addToCart = async (customerId, itemData) => {
    const { productId, quantity } = itemData;

    // Verify product exists and is available
    const product = await Product.findById(productId).populate('shopId');

    if (!product) {
        throw new Error('Product not found');
    }

    if (!product.isAvailable || product.isBanned) {
        throw new Error('Product is not available');
    }

    if (product.stock < quantity) {
        throw new Error(`Only ${product.stock} items available in stock`);
    }

    // Get or create cart
    let cart = await Cart.findOne({ customerId });

    if (!cart) {
        cart = new Cart({ customerId, items: [] });
    }

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
    );

    if (existingItemIndex > -1) {
        // Update quantity
        const newQuantity = cart.items[existingItemIndex].quantity + quantity;

        if (newQuantity > product.stock) {
            throw new Error(`Only ${product.stock} items available in stock`);
        }

        cart.items[existingItemIndex].quantity = newQuantity;
    } else {
        // Add new item
        cart.items.push({
            productId,
            shopId: product.shopId._id,
            quantity,
        });
    }

    await cart.save();

    // Populate and return
    await cart.populate({
        path: 'items.productId',
        select: 'name price discountedPrice images stock',
        populate: { path: 'shopId', select: 'shopName' },
    });

    return cart;
};

/**
 * Update item quantity in cart
 * @param {string} customerId - Customer user ID
 * @param {string} productId - Product ID
 * @param {number} quantity - New quantity
 * @returns {Promise<Object>} Updated cart
 */
export const updateCartItem = async (customerId, productId, quantity) => {
    const cart = await Cart.findOne({ customerId });

    if (!cart) {
        throw new Error('Cart not found');
    }

    const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
        throw new Error('Item not in cart');
    }

    // Verify stock availability
    const product = await Product.findById(productId);

    if (!product) {
        throw new Error('Product not found');
    }

    if (quantity > product.stock) {
        throw new Error(`Only ${product.stock} items available in stock`);
    }

    if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        cart.items.splice(itemIndex, 1);
    } else {
        cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();

    // Populate and return
    await cart.populate({
        path: 'items.productId',
        select: 'name price discountedPrice images stock',
        populate: { path: 'shopId', select: 'shopName' },
    });

    return cart;
};

/**
 * Remove item from cart
 * @param {string} customerId - Customer user ID
 * @param {string} productId - Product ID to remove
 * @returns {Promise<Object>} Updated cart
 */
export const removeFromCart = async (customerId, productId) => {
    const cart = await Cart.findOne({ customerId });

    if (!cart) {
        throw new Error('Cart not found');
    }

    cart.items = cart.items.filter(
        (item) => item.productId.toString() !== productId
    );

    await cart.save();

    // Populate and return
    await cart.populate({
        path: 'items.productId',
        select: 'name price discountedPrice images stock',
        populate: { path: 'shopId', select: 'shopName' },
    });

    return cart;
};

/**
 * Clear entire cart
 * @param {string} customerId - Customer user ID
 * @returns {Promise<Object>} Empty cart
 */
export const clearCart = async (customerId) => {
    const cart = await Cart.findOne({ customerId });

    if (!cart) {
        throw new Error('Cart not found');
    }

    cart.items = [];
    await cart.save();

    return cart;
};
