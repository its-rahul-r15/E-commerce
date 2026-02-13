import mongoose from 'mongoose';

/**
 * Coupon Schema
 * for handling offers and discounts
 */

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Coupon code is required'],
        unique: true,
        uppercase: true,
        trim: true,
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true,
    },
    discountValue: {
        type: Number,
        required: true,
        min: [0, 'Discount value cannot be negative'],
    },
    minPurchase: {
        type: Number,
        default: 0,
        min: [0, 'Minimum purchase amount cannot be negative'],
    },
    expiryDate: {
        type: Date,
        required: true,
    },
    usageLimit: {
        type: Number,
        default: null, // null means unlimited
    },
    usedCount: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    description: {
        type: String,
        default: '',
        maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    posterImage: {
        type: String, // Cloudinary URL for promotional poster
        default: null,
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        default: null, // null means global coupon (admin created)
    }
}, {
    timestamps: true,
});

// Check if coupon is valid
couponSchema.methods.isValid = function () {
    return this.isActive &&
        this.expiryDate > new Date() &&
        (this.usageLimit === null || this.usedCount < this.usageLimit);
};

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;
