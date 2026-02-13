import Product from '../models/Product.js';
import Shop from '../models/Shop.js';
import { deleteCache, deleteCachePattern, setCache, getCache } from './cacheService.js';

/**
 * Product Service
 * Business logic for product management
 */

/**
 * Create a new product (Seller only)
 * @param {string} sellerId - Seller user ID
 * @param {Object} productData - Product details
 * @returns {Promise<Object>} Created product
 */
// Helper to inspect query for debugging
export const inspectQuery = (filters = {}) => {
    const {
        category,
        categories,
        subCategory,
        brand,
        sizes,
        colors,
        style,
        shopId,
        minPrice,
        maxPrice,
        search,
        sort = '-createdAt',
    } = filters;

    const query = {
        isAvailable: true,
        isBanned: false,
    };

    if (categories) {
        const catList = Array.isArray(categories) ? categories : categories.split(',');
        if (catList.length > 0) query.category = { $in: catList };
    } else if (category) {
        query.category = category;
    }

    if (subCategory) query.subCategory = subCategory;
    if (brand) query.brand = brand;
    if (style) query.style = style;

    if (minPrice || maxPrice) {
        query.price = {}; // Simulating the logic
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (sizes) {
        query.sizes = { $in: sizes.split(',') };
    }
    if (colors) query.colors = { $in: colors.split(',') };
    if (shopId) query.shopId = shopId;
    if (search) query.$text = { $search: search };

    return { filters, mongoQuery: query };
};

export const createProduct = async (sellerId, productData) => {
    // Get seller's shop
    const shop = await Shop.findOne({ sellerId, status: 'approved' });

    if (!shop) {
        throw new Error('You must have an approved shop to add products');
    }

    // Create product linked to shop
    const product = await Product.create({
        shopId: shop._id,
        ...productData,
    });

    // Invalidate product list caches
    await deleteCachePattern('products:*');
    await deleteCachePattern(`shop:${shop._id}:products:*`);

    return product;
};

/**
 * Get products with pagination and filters
 * @param {Object} filters - Filter options (category, shopId, search, page, limit, sort)
 * @returns {Promise<Object>} Products with pagination
 */
export const getProducts = async (filters = {}) => {
    const {
        category,
        categories, // Support multiple categories
        subCategory,
        brand,
        sizes,
        colors,
        style,
        shopId,
        minPrice,
        maxPrice,
        search,
        page = 1,
        limit = 20,
        sort = '-createdAt',
    } = filters;

    const skip = (page - 1) * limit;

    // Build query
    const query = {
        isAvailable: true,
        isBanned: false, // Don't show banned products
    };

    // Category filter (support single or multiple)
    if (categories) {
        // Handle if comma-separated string or array
        const catList = Array.isArray(categories) ? categories : categories.split(',');
        if (catList.length > 0) query.category = { $in: catList };
    } else if (category) {
        query.category = category;
    }

    if (subCategory) query.subCategory = subCategory;
    if (brand) query.brand = brand;
    if (style) query.style = style; // Current UI uses 'style' as regex/exact match

    // Price Filter
    if (minPrice || maxPrice) {
        query.discountedPrice = {}; // Filter on discountedPrice (effective price)
        if (minPrice) query.discountedPrice.$gte = Number(minPrice);
        if (maxPrice) query.discountedPrice.$lte = Number(maxPrice);
        // Fallback to price if discountedPrice logic is complex, 
        // but typically e-commerce filters on the 'selling price'.
        // Simplified: assuming all products have discountedPrice set (or equal to price).
        // If your schema only has 'price' and 'discountedPrice' is optional, strict query needed.
        // For Hackathon, let's assume filtering on 'price' field itself might be safer if discountedPrice is not guaranteed.
        // Re-evaluating: Most products have price. discountedPrice is optional.
        // Better implementation:
        // $expr might be needed to compare effectively, OR just filter 'price' for simplicity now.
        // Let's filter 'price' for now to be safe and simple.
        delete query.discountedPrice;
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Array filters (if product has ANY of the specified values)
    if (sizes) {
        const sizeList = sizes.split(',');
        query.sizes = { $in: sizeList };
    }

    if (colors) {
        const colorList = colors.split(',');
        query.colors = { $in: colorList };
    }

    if (shopId) {
        query.shopId = shopId;
    }

    // Full-text search if search term provided
    if (search) {
        query.$text = { $search: search };
    }

    // Try cache (only for non-search queries)
    const cacheKey = `products:${JSON.stringify({ category, subCategory, brand, sizes, colors, style, shopId, page, limit, sort })}`;

    if (!search) {
        const cached = await getCache(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
    }

    // Execute query
    const [products, total] = await Promise.all([
        Product.find(query)
            .populate('shopId', 'shopName location rating')
            .sort(sort || '-createdAt') // Pass default if sort is falsy/empty string
            .skip(skip)
            .limit(limit)
            .lean(), // Convert to plain objects - 50% faster!
        Product.countDocuments(query),
    ]);

    const result = {
        products,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };

    // Cache for 5 minutes (if not search)
    if (!search) {
        await setCache(cacheKey, JSON.stringify(result), 300);
    }

    return result;
};

/**
 * Search products by keyword
 * @param {string} keyword - Search keyword
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<Object>} Search results
 */
export const searchProducts = async (keyword, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;

    // Build query with case-insensitive regex search
    const query = {
        isAvailable: true,
        isBanned: false,
        $or: [
            { name: { $regex: keyword, $options: 'i' } },
            { description: { $regex: keyword, $options: 'i' } },
            { tags: { $in: [new RegExp(keyword, 'i')] } },
        ],
    };

    const [products, total] = await Promise.all([
        Product.find(query)
            .populate('shopId', 'shopName location rating')
            .sort('-createdAt')
            .skip(skip)
            .limit(limit)
            .select('-__v'),
        Product.countDocuments(query),
    ]);

    return {
        products,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
};

/**
 * Get product by ID
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} Product details
 */
export const getProductById = async (productId) => {
    const cacheKey = `product:${productId}`;

    // Try cache
    const cached = await getCache(cacheKey);
    if (cached) {
        return JSON.parse(cached);
    }

    const product = await Product.findById(productId)
        .populate('shopId', 'shopName address phone rating location');

    if (!product) {
        throw new Error('Product not found');
    }

    // Don't show banned or unavailable products to customers
    if (product.isBanned || !product.isAvailable) {
        throw new Error('Product not available');
    }

    // Cache for 10 minutes
    await setCache(cacheKey, JSON.stringify(product), 600);

    return product;
};

/**
 * Get products for a specific shop
 * @param {string} shopId - Shop ID
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<Object>} Shop's products
 */
export const getShopProducts = async (shopId, page = 1, limit = 20) => {
    return getProducts({ shopId, page, limit });
};

/**
 * Get seller's products (including unavailable ones)
 * @param {string} sellerId - Seller user ID
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<Object>} Seller's products
 */
export const getSellerProducts = async (sellerId, page = 1, limit = 20) => {
    const shop = await Shop.findOne({ sellerId });

    if (!shop) {
        throw new Error('No shop found for this seller');
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
        Product.find({ shopId: shop._id })
            .sort('-createdAt')
            .skip(skip)
            .limit(limit),
        Product.countDocuments({ shopId: shop._id }),
    ]);

    return {
        products,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
};

/**
 * Update product (Seller only - must own the shop)
 * @param {string} productId - Product ID
 * @param {string} sellerId - Seller user ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated product
 */
export const updateProduct = async (productId, sellerId, updates) => {
    const product = await Product.findById(productId).populate('shopId');

    if (!product) {
        throw new Error('Product not found');
    }

    // Verify ownership
    if (product.shopId.sellerId.toString() !== sellerId) {
        throw new Error('You can only update your own products');
    }

    // Prevent certain fields from being updated
    delete updates.shopId;
    delete updates.isBanned; // Only admin can ban

    // Auto-update availability based on stock
    if (updates.stock !== undefined) {
        updates.isAvailable = updates.stock > 0;
    }

    // Update product
    Object.assign(product, updates);
    await product.save();

    // Invalidate caches
    await deleteCache(`product:${productId}`);
    await deleteCachePattern('products:*');
    await deleteCachePattern(`shop:${product.shopId._id}:products:*`);

    return product;
};

/**
 * Delete product (Seller only)
 * @param {string} productId - Product ID
 * @param {string} sellerId - Seller user ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteProduct = async (productId, sellerId) => {
    const product = await Product.findById(productId).populate('shopId');

    if (!product) {
        throw new Error('Product not found');
    }

    // Verify ownership
    if (product.shopId.sellerId.toString() !== sellerId) {
        throw new Error('You can only delete your own products');
    }

    await product.deleteOne();

    // Invalidate caches
    await deleteCache(`product:${productId}`);
    await deleteCachePattern('products:*');
    await deleteCachePattern(`shop:${product.shopId._id}:products:*`);

    return true;
};

/**
 * Ban/Unban product (Admin only)
 * @param {string} productId - Product ID
 * @param {boolean} banned - Ban status
 * @returns {Promise<Object>} Updated product
 */
export const toggleProductBan = async (productId, banned) => {
    const product = await Product.findByIdAndUpdate(
        productId,
        { isBanned: banned },
        { new: true }
    );

    if (!product) {
        throw new Error('Product not found');
    }

    // Invalidate caches
    await deleteCache(`product:${productId}`);
    await deleteCachePattern('products:*');

    return product;
};

/**
 * Get all products (Admin only - including banned)
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Products with pagination
 */
export const getAllProducts = async (filters = {}) => {
    const { isBanned, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const query = {};
    if (isBanned !== undefined) {
        query.isBanned = isBanned === 'true' || isBanned === true;
    }

    const [products, total] = await Promise.all([
        Product.find(query)
            .populate('shopId', 'shopName')
            .sort('-createdAt')
            .skip(skip)
            .limit(limit),
        Product.countDocuments(query),
    ]);

    return {
        products,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
};

/**
 * Get product comparisons (similar products from other sellers)
 * @param {string} productId - Source product ID
 * @returns {Promise<Array>} List of comparable products
 */
export const getComparisons = async (productId) => {
    const product = await Product.findById(productId);
    if (!product) {
        throw new Error('Product not found');
    }

    const query = {
        _id: { $ne: productId },
        name: product.name,
        isAvailable: true,
        isBanned: false,
        stock: { $gt: 0 }
    };

    if (product.brand) {
        query.brand = product.brand;
    }

    const comparisons = await Product.find(query)
        .populate('shopId', 'shopName rating location')
        .sort('price')
        .limit(10);

    return comparisons;
};
