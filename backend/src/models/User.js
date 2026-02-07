import mongoose from 'mongoose';

/**
 * User Schema
 * Supports Customer, Seller, and Admin roles
 */

const addressSchema = new mongoose.Schema({
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
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: [true, 'Coordinates are required'],
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
    isDefault: {
        type: Boolean,
        default: false,
    },
}, { _id: false });

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
        type: String,
        required: function () {
            // Password only required if not using OAuth
            return !this.googleId;
        },
        minlength: [8, 'Password must be at least 8 characters'],
        select: false, // Don't include password in queries by default
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true, // Allow multiple null values
    },
    avatar: {
        type: String, // Google profile picture URL
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    phone: {
        type: String,
        required: function () {
            // Phone only required if not using OAuth
            return !this.googleId;
        },
        validate: {
            validator: function (phone) {
                if (!phone) return true; // Allow empty for OAuth
                return /^[6-9]\d{9}$/.test(phone);
            },
            message: 'Please enter a valid 10-digit Indian phone number',
        },
    },
    role: {
        type: String,
        enum: {
            values: ['customer', 'seller', 'admin'],
            message: 'Role must be customer, seller, or admin',
        },
        default: 'customer',
    },
    addresses: [addressSchema],
    isBlocked: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt
});

// Indexes for performance (unique indexes)
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ googleId: 1 }, { unique: true, sparse: true });
userSchema.index({ 'addresses.location': '2dsphere' }); // Geospatial index for location queries

// Virtual for full address
addressSchema.virtual('fullAddress').get(function () {
    return `${this.street}, ${this.city}, ${this.state} - ${this.pincode}`;
});

// Methods
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password; // Never expose password
    return user;
};

const User = mongoose.model('User', userSchema);

export default User;
