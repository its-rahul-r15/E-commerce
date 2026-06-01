import axios from '../utils/axios';

export const adminService = {
    // Platform Statistics
    getStatistics: async () => {
        const response = await axios.get('/admin/statistics');
        return response.data.data;
    },

    getUsers: async (page = 1, role = '') => {
        const params = new URLSearchParams({ page });
        if (role) params.append('role', role);
        const response = await axios.get(`/admin/users?${params}`);
        return response.data;
    },

    blockUser: async (userId) => {
        const response = await axios.patch(`/admin/users/${userId}/block`);
        return response.data;
    },

    unblockUser: async (userId) => {
        const response = await axios.patch(`/admin/users/${userId}/unblock`);
        return response.data;
    },

    deleteUser: async (userId) => {
        const response = await axios.delete(`/admin/users/${userId}`);
        return response.data;
    },

    // Shop Management
    getPendingShops: async () => {
        const response = await axios.get('/shops/admin/pending');
        return response.data.data;
    },

    getApprovedShops: async () => {
        const response = await axios.get('/shops/admin/all');
        return response.data.data;
    },

    approveShop: async (shopId) => {
        const response = await axios.patch(`/shops/admin/${shopId}/approve`);
        return response.data;
    },

    rejectShop: async (shopId) => {
        const response = await axios.patch(`/shops/admin/${shopId}/reject`);
        return response.data;
    },

    blockShop: async (shopId) => {
        const response = await axios.patch(`/shops/admin/${shopId}/block`, { blocked: true });
        return response.data;
    },

    unblockShop: async (shopId) => {
        const response = await axios.patch(`/shops/admin/${shopId}/block`, { blocked: false });
        return response.data;
    },

    // Product Moderation
    banProduct: async (productId) => {
        const response = await axios.patch(`/products/admin/${productId}/ban`, { banned: true });
        return response.data;
    },

    unbanProduct: async (productId) => {
        const response = await axios.patch(`/products/admin/${productId}/ban`, { banned: false });
        return response.data;
    },

    toggleFeatured: async (productId, featured) => {
        const response = await axios.patch(`/products/admin/${productId}/featured`, { featured });
        return response.data;
    },

    // Categories & Subcategories Customization
    createCategory: async (categoryData) => {
        const response = await axios.post('/categories', categoryData);
        return response.data.data;
    },

    updateCategory: async (categoryId, categoryData) => {
        const response = await axios.put(`/categories/${categoryId}`, categoryData);
        return response.data.data;
    },

    deleteCategory: async (categoryId) => {
        const response = await axios.delete(`/categories/${categoryId}`);
        return response.data.data;
    },

    // Email Template & Broadcast Management
    getEmailTemplates: async () => {
        const response = await axios.get('/admin/emails/templates');
        return response.data.data;
    },

    updateEmailTemplate: async (name, templateData) => {
        const response = await axios.put(`/admin/emails/templates/${name}`, templateData);
        return response.data.data;
    },

    sendEmailBroadcast: async (broadcastData) => {
        const response = await axios.post('/admin/emails/broadcast', broadcastData);
        return response.data.data;
    },

    // BI Analytics
    getAnalyticsSummary: async () => {
        const response = await axios.get('/admin/analytics-summary');
        return response.data.data;
    },

    // Platform Insights & Product Analytics
    getPlatformInsights: async () => {
        const response = await axios.get('/admin/platform-insights');
        return response.data.data;
    },

    // Settlements & KYC Ledger
    getLedger: async () => {
        const response = await axios.get('/admin/ledger');
        return response.data.data;
    },

    updateKYC: async (shopId, kycData) => {
        const response = await axios.patch(`/admin/shops/${shopId}/kyc`, kycData);
        return response.data.data;
    },

    releasePayout: async (shopId) => {
        const response = await axios.post(`/admin/shops/${shopId}/payout`);
        return response.data.data;
    },

    // Returns & Refunds
    getRefundList: async () => {
        const response = await axios.get('/admin/refunds');
        return response.data.data;
    },

    processRefund: async (orderId) => {
        const response = await axios.post(`/admin/orders/${orderId}/refund`);
        return response.data.data;
    },

    // Custom Tailoring
    getTailoringRequests: async () => {
        const response = await axios.get('/admin/tailoring');
        return response.data.data;
    },

    updateTailoringStatus: async (requestId, tailoringData) => {
        const response = await axios.patch(`/admin/tailoring/${requestId}/status`, tailoringData);
        return response.data.data;
    },

    // VIP Loyalty Program
    getTopCustomers: async (minSpend = 5000, limit = 100) => {
        const response = await axios.get(`/loyalty/top-customers?minSpend=${minSpend}&limit=${limit}`);
        return response.data.data;
    },

    sendLoyaltyCoupons: async (payload) => {
        const response = await axios.post('/loyalty/send-coupons', payload);
        return response.data.data;
    },

    // Orders Management
    getAllOrders: async (page = 1, status = '') => {
        const params = new URLSearchParams({ page });
        if (status) params.append('status', status);
        const response = await axios.get(`/orders/admin/all?${params}`);
        return response.data;
    },

    updateOrderStatus: async (orderId, status) => {
        const response = await axios.patch(`/admin/orders/${orderId}/status`, { status });
        return response.data.data;
    },
};
