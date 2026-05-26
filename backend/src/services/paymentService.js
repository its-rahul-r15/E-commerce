import getRazorpay from '../config/razorpay.js';
import crypto from 'crypto';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';

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
        const razorpay = getRazorpay();

        if (!razorpay) {
            throw new Error('Payment gateway not configured');
        }

        const options = {
            amount: Math.round(amount * 100), 
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

    const existingOrder = await Order.findById(orderId);
    if (!existingOrder) {
        throw new Error('Order not found');
    }

    // Idempotency: check if already paid
    if (existingOrder.paymentStatus === 'paid') {
        console.log(`[PAYMENT IDEMPOTENCY] Order ${orderId} is already paid. Returning current state.`);
        return existingOrder.populate('customerId', 'name email')
            .populate('items.productId', 'name price images');
    }
   
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
            status: 'accepted', // Update order status to 'accepted'
        },
        { new: true }
    ).populate('customerId', 'name email')
        .populate('items.productId', 'name price images');

    if (!order) {
        throw new Error('Order not found');
    }

    // Increment shop's balance with the net sales amount (total amount minus platform commission)
    try {
        const Shop = (await import('../models/Shop.js')).default;
        const shop = await Shop.findById(order.shopId);
        if (shop) {
            const commissionRate = shop.commissionRate ?? 10;
            const vendorShare = order.totalAmount * (1 - (commissionRate / 100));
            await Shop.findByIdAndUpdate(order.shopId, {
                $inc: { balance: Number(vendorShare.toFixed(2)) }
            });
            console.log(`[LEDGER UPDATE] Credited shop ${order.shopId} with ₹${vendorShare.toFixed(2)} (Commission: ${commissionRate}%)`);
        }
    } catch (ledgerError) {
        console.error('[LEDGER ERROR] Failed to update shop balance:', ledgerError.message);
    }

    // Trigger order confirmation email now that payment is confirmed
    if (order.customerId && order.customerId.email) {
        import('./emailService.js').then(({ sendOrderConfirmationEmail }) => {
            sendOrderConfirmationEmail(order.customerId.email, order.customerId.name, order._id.toString(), order.totalAmount);
        }).catch(err => console.error('Order confirmation email failed:', err));
    }

    // Clear cart after successful payment
    await Cart.findOneAndUpdate(
        { customerId: order.customerId._id },
        { $set: { items: [] } }
    );

    return order;
};

/**
 * Handle failed payment
 * @param {string} orderId - Our order ID
 * @returns {Promise<Object>} Updated order
 */
export const processFailedPayment = async (orderId) => {
    const existingOrder = await Order.findById(orderId);
    if (!existingOrder) {
        throw new Error('Order not found');
    }

    // Idempotency: check if already failed or cancelled
    if (existingOrder.paymentStatus === 'failed' || existingOrder.status === 'cancelled') {
        console.log(`[PAYMENT IDEMPOTENCY] Order ${orderId} is already failed/cancelled. Returning current state.`);
        return existingOrder;
    }

    const order = await Order.findByIdAndUpdate(
        orderId,
        {
            'payment.status': 'failed',
            paymentStatus: 'failed',
            status: 'cancelled', // Update order status to 'cancelled'
        },
        { new: true }
    );

    if (!order) {
        throw new Error('Order not found');
    }

    // Restore product stock on failed payment
    try {
        const Product = (await import('../models/Product.js')).default;
        const { deleteCachePattern } = await import('./cacheService.js');
        
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: item.quantity },
            });
        }
        await deleteCachePattern('products:*');
        console.log(`[STOCK RESTORED] Restored stock for failed order ${orderId}`);
    } catch (stockError) {
        console.error(`[STOCK ERROR] Failed to restore stock for cancelled order ${orderId}:`, stockError.message);
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
        const razorpay = getRazorpay();

        if (!razorpay) {
            throw new Error('Payment gateway not configured');
        }

        const payment = await razorpay.payments.fetch(paymentId);
        return payment;
    } catch (error) {
        console.error('Error fetching payment details:', error);
        throw new Error('Failed to fetch payment details');
    }
};
