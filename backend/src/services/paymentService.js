import razorpay from '../config/razorpay.js';
import crypto from 'crypto';
import Order from '../models/Order.js';

/**
 * Payment Service
 * Handle Razorpay payment processing
 */

/**
 * Create Razorpay order
 * @param {number} amount - Amount in rupees
 * @param {string} orderId - Our order ID
 * @returns {Promise<Object>} Razorpay order
 */
export const createRazorpayOrder = async (amount, orderId) => {
    try {
        const options = {
            amount: Math.round(amount * 100), // Convert to paise
            currency: 'INR',
            receipt: orderId,
            notes: {
                orderId: orderId,
            },
        };

        const razorpayOrder = await razorpay.orders.create(options);
        return razorpayOrder;
    } catch (error) {
        console.error('Razorpay order creation error:', error);
        throw new Error('Failed to create payment order');
    }
};

/**
 * Verify Razorpay payment signature
 * @param {string} razorpayOrderId - Razorpay order ID
 * @param {string} razorpayPaymentId - Razorpay payment ID
 * @param {string} razorpaySignature - Razorpay signature
 * @returns {boolean} Verification result
 */
export const verifyPaymentSignature = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
    try {
        const text = `${razorpayOrderId}|${razorpayPaymentId}`;
        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(text)
            .digest('hex');

        return generated_signature === razorpaySignature;
    } catch (error) {
        console.error('Payment verification error:', error);
        return false;
    }
};

/**
 * Process successful payment
 * @param {string} orderId - Our order ID
 * @param {Object} paymentData - Razorpay payment data
 * @returns {Promise<Object>} Updated order
 */
export const processSuccessfulPayment = async (orderId, paymentData) => {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = paymentData;

    // Verify signature
    const isValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (!isValid) {
        throw new Error('Invalid payment signature');
    }

    // Update order with payment details
    const order = await Order.findByIdAndUpdate(
        orderId,
        {
            'payment.razorpayOrderId': razorpayOrderId,
            'payment.razorpayPaymentId': razorpayPaymentId,
            'payment.razorpaySignature': razorpaySignature,
            'payment.status': 'completed',
            paymentStatus: 'paid',
            orderStatus: 'confirmed',
        },
        { new: true }
    ).populate('customerId', 'name email')
        .populate('items.productId', 'name price images');

    if (!order) {
        throw new Error('Order not found');
    }

    return order;
};

/**
 * Handle failed payment
 * @param {string} orderId - Our order ID
 * @returns {Promise<Object>} Updated order
 */
export const processFailedPayment = async (orderId) => {
    const order = await Order.findByIdAndUpdate(
        orderId,
        {
            'payment.status': 'failed',
            paymentStatus: 'failed',
            orderStatus: 'cancelled',
        },
        { new: true }
    );

    if (!order) {
        throw new Error('Order not found');
    }

    return order;
};

/**
 * Get payment details from Razorpay
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<Object>} Payment details
 */
export const getPaymentDetails = async (paymentId) => {
    try {
        const payment = await razorpay.payments.fetch(paymentId);
        return payment;
    } catch (error) {
        console.error('Error fetching payment details:', error);
        throw new Error('Failed to fetch payment details');
    }
};
