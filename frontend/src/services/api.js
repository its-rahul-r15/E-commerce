import axios from '../utils/axios';

export const shopService = {
    // Get nearby shops (5km radius)
    getNearbyShops: async (latitude, longitude) => {
        const response = await axios.get(`/shops/nearby?lat=${latitude}&lng=${longitude}`);
        return response.data.data;
    },

    // Get shop by ID
    getShopById: async (shopId) => {
        const response = await axios.get(`/shops/${shopId}`);
        return response.data.data;
    },

    // Get seller's shop
    getMyShop: async () => {
        const response = await axios.get('/shops/seller/my-shop');
        return response.data.data;
    },

    // Create shop (seller only)
    createShop: async (shopData) => {
        const response = await axios.post('/shops', shopData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.data;
    },

    // Update shop
    updateShop: async (shopId, shopData) => {
        const response = await axios.patch(`/shops/${shopId}`, shopData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.data;
    },

    // Get all shops (admin)
    getAllShops: async () => {
        const response = await axios.get('/shops/admin/all');
        return response.data.data;
    },

    // Get public shops (approved only)
    getPublicShops: async (page = 1, limit = 20) => {
        const response = await axios.get(`/shops?page=${page}&limit=${limit}`);
        return {
            shops: response.data.data,
            pagination: response.data.pagination
        };
    },

    // DEBUG: Diagnose DB state
    diagnose: async () => {
        const response = await axios.get('/shops/debug/diagnose');
        return response.data.data;
    },

    // DEBUG: Approve all shops
    approveAll: async () => {
        const response = await axios.get('/shops/debug/approve-all');
        return response.data;
    },
};

export const productService = {
    // Get products with filters
    getProducts: async (filters = {}) => {
        console.log('Original filters:', filters);
        // Convert categories array to comma-separated string if it's an array
        const processedFilters = { ...filters };
        if (Array.isArray(processedFilters.categories)) {
            console.log('Converting categories array:', processedFilters.categories);
            processedFilters.categories = processedFilters.categories.join(',');
            console.log('After conversion:', processedFilters.categories);
        }
        // Remove empty values
        Object.keys(processedFilters).forEach(key => {
            if (processedFilters[key] === '' || processedFilters[key] === undefined || processedFilters[key] === null) {
                delete processedFilters[key];
            }
        });

        console.log('Final processed filters:', processedFilters);
        const params = new URLSearchParams(processedFilters);
        console.log('URL params:', params.toString());
        const response = await axios.get(`/products?${params}`);
        return response.data; // Return full response object (contains data and pagination)
    },

    // Search products
    searchProducts: async (keyword, page = 1, limit = 20) => {
        const response = await axios.get(`/products/search?q=${keyword}&page=${page}&limit=${limit}`);
        return response.data.data;
    },

    // Get product by ID
    getProductById: async (productId) => {
        const response = await axios.get(`/products/${productId}`);
        return response.data.data;
    },

    // Get product comparisons
    getComparisons: async (productId) => {
        const response = await axios.get(`/products/${productId}/compare`);
        return response.data.data;
    },

    // Get shop products
    getShopProducts: async (shopId, filters = {}) => {
        const { page = 1, ...rest } = filters;
        const response = await axios.get(`/products/shop/${shopId}?page=${page}&${new URLSearchParams(rest)}`);
        return response.data; // Return full response for pagination
    },

    // Get seller's products
    getMyProducts: async (page = 1) => {
        const response = await axios.get(`/products/seller/my-products?page=${page}`);
        return response.data.data;
    },

    // Create product (seller only)
    createProduct: async (productData) => {
        const response = await axios.post('/products', productData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.data;
    },

    // Update product
    updateProduct: async (productId, productData) => {
        const response = await axios.patch(`/products/${productId}`, productData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.data;
    },

    // Delete product
    deleteProduct: async (productId) => {
        const response = await axios.delete(`/products/${productId}`);
        return response.data;
    },

    // Get all products (admin only - includes banned products)
    getAllProducts: async () => {
        const response = await axios.get('/products/admin/all');
        return response.data.data;
    },

    // DEBUG: Get all products raw
    debugGetAllProducts: async () => {
        const response = await axios.get('/products/debug/all');
        return response.data.data; // Response format from successResponse
    },

    // DEBUG: Verify query
    debugVerifyQuery: async (filters) => {
        const params = new URLSearchParams(filters);
        const response = await axios.get(`/products/debug/inspector?${params}`);
        return response.data.data;
    },
};

export const cartService = {
    // Get cart
    getCart: async () => {
        const response = await axios.get('/cart');
        return response.data.data;
    },

    // Add to cart
    addToCart: async (productId, quantity = 1) => {
        const response = await axios.post('/cart/items', { productId, quantity });
        return response.data.data;
    },

    // Update cart item
    updateCartItem: async (productId, quantity) => {
        const response = await axios.patch(`/cart/items/${productId}`, { quantity });
        return response.data.data;
    },

    // Remove from cart
    removeFromCart: async (productId) => {
        const response = await axios.delete(`/cart/items/${productId}`);
        return response.data.data;
    },

    // Clear cart
    clearCart: async () => {
        const response = await axios.delete('/cart');
        return response.data.data;
    },
};

export const orderService = {
    //Create order
    createOrder: async (deliveryAddress) => {
        const response = await axios.post('/orders', { deliveryAddress });
        return response.data.data;
    },

    // Get my orders (customer)
    getMyOrders: async (status = '', page = 1) => {
        const params = new URLSearchParams({ page });
        if (status) params.append('status', status);
        const response = await axios.get(`/orders/customer/my-orders?${params}`);
        return response.data.data;
    },

    // Get shop orders (seller)
    getShopOrders: async (status = '', page = 1) => {
        const params = new URLSearchParams({ page });
        if (status) params.append('status', status);
        const response = await axios.get(`/orders/seller/shop-orders?${params}`);
        return response.data.data;
    },

    // Get order by ID
    getOrderById: async (orderId) => {
        const response = await axios.get(`/orders/${orderId}`);
        return response.data.data;
    },

    // Update order status (seller)
    updateOrderStatus: async (orderId, status) => {
        const response = await axios.patch(`/orders/${orderId}/status`, { status });
        return response.data.data;
    },

    // Cancel order
    cancelOrder: async (orderId) => {
        const response = await axios.patch(`/orders/${orderId}/cancel`);
        return response.data.data;
    },
};

export const couponService = {
    // Validate coupon
    validateCoupon: async (code, amount, shopId) => {
        const response = await axios.post('/coupons/validate', { code, amount, shopId });
        return response.data.data;
    },
};
