import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Razorpay Configuration
 * Initialize Razorpay instance for payment processing
 */

export const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const configureRazorpay = () => {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        console.warn('⚠️  Razorpay credentials not configured');
        return false;
    }
    console.log('✅ Razorpay configured');
    return true;
};

export default razorpay;
