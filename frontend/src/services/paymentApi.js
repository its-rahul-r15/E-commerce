import axios from '../utils/axios';

export const paymentService = {
    // Create Razorpay order
    createOrder: async (orderId, amount) => {
        const response = await axios.post('/payments/create-order', { orderId, amount });
        return response.data.data;
    },

    // Verify payment
    verifyPayment: async (paymentData) => {
        const response = await axios.post('/payments/verify', paymentData);
        return response.data.data;
    },

    // Handle payment failure
    paymentFailed: async (orderId) => {
        const response = await axios.post('/payments/failed', { orderId });
        return response.data.data;
    },

    // Get payment details
    getPaymentDetails: async (paymentId) => {
        const response = await axios.get(`/payments/${paymentId}`);
        return response.data.data;
    },
};
