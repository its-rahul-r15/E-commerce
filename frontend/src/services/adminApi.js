import axios from '../utils/axios';

export const adminService = {
    // Platform Statistics
    getStatistics: async () => {
        const response = await axios.get('/admin/statistics');
        return response.data.data;
    },

    // User Management
    getUsers: async (page = 1, role = '') => {
        const params = new URLSearchParams({ page });
        if (role) params.append('role', role);
        const response = await axios.get(`/admin/users?${params}`);
        return response.data.data;
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
        const response = await axios.patch(`/products/${productId}/ban`);
        return response.data;
    },

    unbanProduct: async (productId) => {
        const response = await axios.patch(`/products/${productId}/unban`);
        return response.data;
    },
};
