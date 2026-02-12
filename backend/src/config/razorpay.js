import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Razorpay Configuration
 * Initialize Razorpay instance for payment processing
 * Lazy initialization - only creates instance if credentials exist
 */

let razorpayInstance = null;

export const getRazorpay = () => {
    if (!razorpayInstance) {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.warn('⚠️  Razorpay credentials not configured - payment features disabled');
            return null;
        }

        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        console.log('✅ Razorpay initialized');
    }

    return razorpayInstance;
};

export const configureRazorpay = () => {
    const instance = getRazorpay();
    return !!instance;
};

// Backward compatibility - but will return null if not configured
export const razorpay = getRazorpay();

export default getRazorpay;

