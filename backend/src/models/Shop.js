import mongoose from 'mongoose';

/**
 * Shop Schema
 * Stores shopkeeper/seller shop information
 */

const shopSchema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Seller ID is required'],
    },
    shopName: {
        type: String,
        required: [true, 'Shop name is required'],
        trim: true,
        minlength: [3, 'Shop name must be at least 3 characters'],
        maxlength: [100, 'Shop name cannot exceed 100 characters'],
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    category: {
        type: String,
        required: [true, 'Shop category is required'],
        enum: {
            values: [
                'Grocery',
                'Electronics',
                'Clothing',
                'Pharmacy',
                'Restaurant',
                'Bakery',
                'Hardware',
                'Books',
                'Jewelry',
                'Other',
            ],
            message: 'Invalid shop category',
        },
    },
    address: {
        street: {
            type: String,
            required: [true, 'Street address is required'],
            trim: true,
        },
        city: {
            type: String,
            required: [true, 'City is required'],
            trim: true,
        },
        state: {
            type: String,
            required: [true, 'State is required'],
            trim: true,
        },
        pincode: {
            type: String,
            required: [true, 'Pincode is required'],
            match: [/^\d{6}$/, 'Pincode must be 6 digits'],
        },
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: [true, 'Coordinates are required for shop location'],
            validate: {
                validator: function (coords) {
                    return coords.length === 2 &&
                        coords[0] >= -180 && coords[0] <= 180 && // longitude
                        coords[1] >= -90 && coords[1] <= 90;     // latitude
                },
                message: 'Invalid coordinates format',
            },
        },
    },
    images: [{
        type: String, // Cloudinary URLs
        validate: {
            validator: function (url) {
                return /^https?:\/\/.+/.test(url);
            },
            message: 'Invalid image URL',
        },
    }],
    phone: {
        type: String,
        required: [true, 'Shop phone number is required'],
        match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number'],
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'approved', 'rejected', 'blocked'],
            message: 'Status must be pending, approved, rejected, or blocked',
        },
        default: 'pending',
    },
    rating: {
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be negative'],
        max: [5, 'Rating cannot exceed 5'],
    },
    reviewCount: {
        type: Number,
        default: 0,
        min: [0, 'Review count cannot be negative'],
    },
}, {
    timestamps: true,
});

// Indexes for performance
shopSchema.index({ sellerId: 1 });
shopSchema.index({ location: '2dsphere' }); // Critical for nearby shop queries
shopSchema.index({ status: 1 });
shopSchema.index({ category: 1 });

// Virtual for full address
shopSchema.virtual('fullAddress').get(function () {
    return `${this.address.street}, ${this.address.city}, ${this.address.state} - ${this.address.pincode}`;
});

// Method to check if shop is active
shopSchema.methods.isActive = function () {
    return this.status === 'approved';
};

// Ensure only one shop per seller (optional business rule)
// shopSchema.index({ sellerId: 1 }, { unique: true });

const Shop = mongoose.model('Shop', shopSchema);

export default Shop;
