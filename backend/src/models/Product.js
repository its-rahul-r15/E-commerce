import mongoose from 'mongoose';

/**
 * Product Schema
 * Products belong to shops and can be moderated by admin
 */

const productSchema = new mongoose.Schema({
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: [true, 'Shop ID is required'],
    },
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        minlength: [3, 'Product name must be at least 3 characters'],
        maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
        type: String,
        required: [true, 'Product category is required'],
        enum: {
            values: [
                // Indian Fashion Categories
                'Kurta',
                'Saree',
                'Lehenga',
                'Salwar Suit',
                'Dupatta',
                'Shirt',
                'Top',
                'Dress',
                'Jacket',
                'Trouser',
                'Sherwani',
                'Accessories',
                'Ethnic Wear',
                'Western Wear',
                // Legacy / Generic Categories (kept for backward compat)
                'Groceries',
                'Electronics',
                'Clothing',
                'Home & Kitchen',
                'Health & Beauty',
                'Sports & Fitness',
                'Books & Stationery',
                'Toys & Games',
                'Food & Beverages',
                'Fashion',
                'Other',
            ],
            message: 'Invalid product category: {VALUE}',
        },
    },
    subCategory: {
        type: String,
        trim: true,
    },
    brand: {
        type: String,
        trim: true,
    },
    sizes: [{
        type: String,
        trim: true,
    }],
    colors: [{
        type: String,
        trim: true,
    }],
    style: {
        type: String,
        trim: true,
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative'],
    },
    discountedPrice: {
        type: Number,
        min: [0, 'Discounted price cannot be negative'],
        validate: {
            validator: function (value) {
                return !value || value <= this.price;
            },
            message: 'Discounted price must be less than or equal to original price',
        },
    },
    stock: {
        type: Number,
        required: [true, 'Stock quantity is required'],
        min: [0, 'Stock cannot be negative'],
        default: 0,
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
    isAvailable: {
        type: Boolean,
        default: true,
    },
    isBanned: {
        type: Boolean,
        default: false,
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true,
    }],
}, {
    timestamps: true,
});

// Indexes for performance
productSchema.index({ shopId: 1 });
productSchema.index({ category: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text', brand: 'text', subCategory: 'text', style: 'text' }); // Full-text search
productSchema.index({ isAvailable: 1, isBanned: 1 }); // Compound index for filtering
productSchema.index({ price: 1 }); // For price range queries

// Virtals
productSchema.virtual('effectivePrice').get(function () {
    return this.discountedPrice || this.price;
});

productSchema.virtual('discount').get(function () {
    if (!this.discountedPrice) return 0;
    return Math.round(((this.price - this.discountedPrice) / this.price) * 100);
});

productSchema.virtual('inStock').get(function () {
    return this.stock > 0;
});

// Methods
productSchema.methods.isVisible = function () {
    return this.isAvailable && !this.isBanned && this.stock > 0;
};

productSchema.methods.reduceStock = async function (quantity) {
    if (this.stock < quantity) {
        throw new Error('Insufficient stock');
    }
    this.stock -= quantity;
    await this.save();
};

// Pre-save hook to ensure availability matches stock
productSchema.pre('save', function (next) {
    if (this.stock === 0) {
        this.isAvailable = false;
    }
    next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;
