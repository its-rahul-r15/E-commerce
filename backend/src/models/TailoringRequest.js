import mongoose from 'mongoose';

/**
 * TailoringRequest Schema
 * Stores custom tailoring orders placed by customers for specific products.
 * Sellers manage these requests and update their status.
 */

const measurementsSchema = new mongoose.Schema({
    chest: { type: Number, min: 0 },
    waist: { type: Number, min: 0 },
    hips: { type: Number, min: 0 },
    shoulder: { type: Number, min: 0 },
    length: { type: Number, min: 0 },
    sleeveLength: { type: Number, min: 0 },
    inseam: { type: Number, min: 0 },
    notes: { type: String, trim: true, maxlength: 500 },
}, { _id: false });

const customizationsSchema = new mongoose.Schema({
    sleeveStyle: {
        type: String,
        enum: ['full', 'half', 'sleeveless', '3/4th', 'custom'],
        default: 'full',
    },
    neckline: {
        type: String,
        enum: ['round', 'v-neck', 'boat', 'square', 'mandarin', 'sweetheart', 'custom'],
        default: 'round',
    },
    lengthAdjustment: {
        type: String,
        enum: ['standard', 'short', 'long', 'custom'],
        default: 'standard',
    },
    customLengthCm: { type: Number, min: 0 },
    embroidery: {
        type: String,
        enum: ['none', 'light', 'heavy', 'custom'],
        default: 'none',
    },
    additionalNotes: { type: String, trim: true, maxlength: 1000 },
}, { _id: false });

const fabricSchema = new mongoose.Schema({
    useOwnFabric: { type: Boolean, default: false },
    fabricDescription: { type: String, trim: true, maxlength: 300 },
    fabricColor: { type: String, trim: true },
    fabricType: {
        type: String,
        enum: ['silk', 'cotton', 'chiffon', 'georgette', 'net', 'velvet', 'linen', 'polyester', 'other'],
        default: 'cotton',
    },
    shippingInstructions: { type: String, trim: true, maxlength: 500 },
}, { _id: false });

const tailoringRequestSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Customer ID is required'],
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product ID is required'],
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: [true, 'Shop ID is required'],
    },
    measurements: {
        type: measurementsSchema,
        required: [true, 'Measurements are required'],
    },
    customizations: {
        type: customizationsSchema,
        default: () => ({}),
    },
    fabric: {
        type: fabricSchema,
        default: () => ({}),
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
            message: 'Invalid status: {VALUE}',
        },
        default: 'pending',
    },
    estimatedDeliveryDays: {
        type: Number,
        min: [1, 'Delivery days must be at least 1'],
        default: 21,
    },
    quotedPrice: {
        type: Number,
        min: [0, 'Price cannot be negative'],
    },
    sellerNotes: {
        type: String,
        trim: true,
        maxlength: 1000,
    },
    cancelReason: {
        type: String,
        trim: true,
        maxlength: 500,
    },
}, {
    timestamps: true,
});

// Indexes
tailoringRequestSchema.index({ customerId: 1, createdAt: -1 });
tailoringRequestSchema.index({ shopId: 1, status: 1 });
tailoringRequestSchema.index({ productId: 1 });

const TailoringRequest = mongoose.model('TailoringRequest', tailoringRequestSchema);

export default TailoringRequest;
