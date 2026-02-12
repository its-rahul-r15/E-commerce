import * as paymentService from '../services/paymentService.js';
import asyncHandler from '../middlewares/asyncHandler.js';

/**
 * Payment Controller
 * Handle Razorpay payment operations
 */

/**
 * @desc    Create Razorpay order
 * @route   POST /api/payments/create-order
 * @access  Private (Customer)
 */
export const createOrder = asyncHandler(async (req, res) => {
    const { orderId, amount } = req.body;

    if (!orderId || !amount) {
        return res.status(400).json({
            success: false,
            error: 'Order ID and amount are required',
        });
    }

    const razorpayOrder = await paymentService.createRazorpayOrder(amount, orderId);

    res.status(200).json({
        success: true,
        data: {
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
        },
        message: 'Razorpay order created successfully',
    });
});

/**
 * @desc    Verify payment
 * @route   POST /api/payments/verify
 * @access  Private (Customer)
 */
export const verifyPayment = asyncHandler(async (req, res) => {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return res.status(400).json({
            success: false,
            error: 'Missing payment verification data',
        });
    }

    const order = await paymentService.processSuccessfulPayment(orderId, {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
    });

    res.status(200).json({
        success: true,
        data: order,
        message: 'Payment verified successfully',
    });
});

/**
 * @desc    Handle payment failure
 * @route   POST /api/payments/failed
 * @access  Private (Customer)
 */
export const paymentFailed = asyncHandler(async (req, res) => {
    const { orderId } = req.body;

    if (!orderId) {
        return res.status(400).json({
            success: false,
            error: 'Order ID is required',
        });
    }

    const order = await paymentService.processFailedPayment(orderId);

    res.status(200).json({
        success: true,
        data: order,
        message: 'Payment failure recorded',
    });
});

/**
 * @desc    Get payment details
 * @route   GET /api/payments/:paymentId
 * @access  Private
 */
export const getPaymentDetails = asyncHandler(async (req, res) => {
    const { paymentId } = req.params;

    const payment = await paymentService.getPaymentDetails(paymentId);

    res.status(200).json({
        success: true,
        data: payment,
        message: 'Payment details retrieved successfully',
    });
});
