import mongoose from 'mongoose';

/**
 * Cart Schema
 * Stores customer shopping cart
 */

const cartItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1'],
        default: 1,
    },
}, { _id: false });

const cartSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Customer ID is required'],
        unique: true, // One cart per customer
    },
    items: {
        type: [cartItemSchema],
        default: [],
    },
}, {
    timestamps: true,
});

// Indexes
cartSchema.index({ customerId: 1 }, { unique: true });

// Virtual for cart item count
cartSchema.virtual('itemCount').get(function () {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Methods
cartSchema.methods.addItem = async function (productId, shopId, quantity = 1) {
    const existingItem = this.items.find(
        item => item.productId.toString() === productId.toString()
    );

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        this.items.push({ productId, shopId, quantity });
    }

    await this.save();
};

cartSchema.methods.removeItem = async function (productId) {
    this.items = this.items.filter(
        item => item.productId.toString() !== productId.toString()
    );
    await this.save();
};

cartSchema.methods.updateItemQuantity = async function (productId, quantity) {
    const item = this.items.find(
        item => item.productId.toString() === productId.toString()
    );

    if (!item) {
        throw new Error('Item not found in cart');
    }

    if (quantity <= 0) {
        await this.removeItem(productId);
    } else {
        item.quantity = quantity;
        await this.save();
    }
};

cartSchema.methods.clear = async function () {
    this.items = [];
    await this.save();
};

// Pre-save hook to remove duplicate items (safety check)
cartSchema.pre('save', function (next) {
    const productIds = new Set();
    this.items = this.items.filter(item => {
        const id = item.productId.toString();
        if (productIds.has(id)) {
            return false; // Remove duplicate
        }
        productIds.add(id);
        return true;
    });
    next();
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
