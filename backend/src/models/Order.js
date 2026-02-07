import mongoose from 'mongoose';

/**
 * Order Schema
 * Tracks customer orders with status workflow
 */

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    name: {
        type: String,
        required: true, // Snapshot at order time
    },
    price: {
        type: Number,
        required: true, // Snapshot at order time
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1'],
    },
}, { _id: false });

const orderSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Customer ID is required'],
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: [true, 'Shop ID is required'],
    },
    items: {
        type: [orderItemSchema],
        required: [true, 'Order items are required'],
        validate: {
            validator: function (items) {
                return items.length > 0;
            },
            message: 'Order must have at least one item',
        },
    },
    totalAmount: {
        type: Number,
        required: [true, 'Total amount is required'],
        min: [0, 'Total amount cannot be negative'],
    },
    deliveryAddress: {
        street: {
            type: String,
            required: [true, 'Delivery street is required'],
        },
        city: {
            type: String,
            required: [true, 'Delivery city is required'],
        },
        state: {
            type: String,
            required: [true, 'Delivery state is required'],
        },
        pincode: {
            type: String,
            required: [true, 'Delivery pincode is required'],
        },
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'],
            message: 'Invalid order status',
        },
        default: 'pending',
    },
    paymentStatus: {
        type: String,
        enum: {
            values: ['pending', 'paid', 'failed'],
            message: 'Invalid payment status',
        },
        default: 'pending',
    },
    rejectionReason: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
});

// Indexes for performance
orderSchema.index({ customerId: 1 });
orderSchema.index({ shopId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 }); // For sorting recent orders

// Virtual for full delivery address
orderSchema.virtual('fullDeliveryAddress').get(function () {
    return `${this.deliveryAddress.street}, ${this.deliveryAddress.city}, ${this.deliveryAddress.state} - ${this.deliveryAddress.pincode}`;
});

// Methods
orderSchema.methods.canBeCancelled = function () {
    return ['pending', 'accepted'].includes(this.status);
};

orderSchema.methods.cancel = async function (reason) {
    if (!this.canBeCancelled()) {
        throw new Error('Order cannot be cancelled at this stage');
    }
    this.status = 'cancelled';
    this.rejectionReason = reason || 'Cancelled by user';
    await this.save();
};

// Pre-save hook to calculate total if not provided
orderSchema.pre('save', function (next) {
    if (!this.totalAmount && this.items.length > 0) {
        this.totalAmount = this.items.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);
    }
    next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
