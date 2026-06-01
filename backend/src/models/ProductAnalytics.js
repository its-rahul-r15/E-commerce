import mongoose from 'mongoose';

/**
 * Product Analytics Schema
 * Tracks product views, add-to-cart events, and wishlist additions
 * Aggregated daily for efficient querying
 */

const dailySnapshotSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    views: { type: Number, default: 0 },
    addToCart: { type: Number, default: 0 },
    wishlistAdds: { type: Number, default: 0 },
    purchases: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
}, { _id: false });

const productAnalyticsSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        unique: true,
    },
    // Lifetime totals (fast reads for leaderboards)
    totalViews: { type: Number, default: 0 },
    totalAddToCart: { type: Number, default: 0 },
    totalWishlistAdds: { type: Number, default: 0 },
    totalPurchases: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },

    // Last 90-day daily snapshots for trend charts
    dailySnapshots: [dailySnapshotSchema],

    // Unique visitors (store user IDs for dedup)
    uniqueViewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

}, { timestamps: true });

// Indexes
productAnalyticsSchema.index({ totalViews: -1 });
productAnalyticsSchema.index({ totalAddToCart: -1 });
productAnalyticsSchema.index({ totalPurchases: -1 });
productAnalyticsSchema.index({ 'dailySnapshots.date': 1 });

// Method to record a view
productAnalyticsSchema.statics.recordView = async function (productId, userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const update = {
        $inc: { totalViews: 1 },
    };

    // Try to increment today's snapshot
    let doc = await this.findOneAndUpdate(
        { productId, 'dailySnapshots.date': today },
        {
            ...update,
            $inc: { totalViews: 1, 'dailySnapshots.$.views': 1 },
        },
        { new: true }
    );

    if (!doc) {
        // Create new snapshot for today or create the whole document
        doc = await this.findOneAndUpdate(
            { productId },
            {
                $inc: { totalViews: 1 },
                $push: {
                    dailySnapshots: {
                        $each: [{ date: today, views: 1 }],
                        $slice: -90  // Keep only last 90 days
                    }
                },
                ...(userId ? { $addToSet: { uniqueViewers: userId } } : {}),
            },
            { upsert: true, new: true }
        );
    } else if (userId) {
        await this.updateOne({ productId }, { $addToSet: { uniqueViewers: userId } });
    }

    return doc;
};

// Method to record add-to-cart
productAnalyticsSchema.statics.recordAddToCart = async function (productId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let doc = await this.findOneAndUpdate(
        { productId, 'dailySnapshots.date': today },
        { $inc: { totalAddToCart: 1, 'dailySnapshots.$.addToCart': 1 } },
        { new: true }
    );

    if (!doc) {
        doc = await this.findOneAndUpdate(
            { productId },
            {
                $inc: { totalAddToCart: 1 },
                $push: {
                    dailySnapshots: {
                        $each: [{ date: today, addToCart: 1 }],
                        $slice: -90
                    }
                }
            },
            { upsert: true, new: true }
        );
    }

    return doc;
};

// Method to record a purchase
productAnalyticsSchema.statics.recordPurchase = async function (productId, quantity, revenue) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let doc = await this.findOneAndUpdate(
        { productId, 'dailySnapshots.date': today },
        {
            $inc: {
                totalPurchases: quantity,
                totalRevenue: revenue,
                'dailySnapshots.$.purchases': quantity,
                'dailySnapshots.$.revenue': revenue,
            }
        },
        { new: true }
    );

    if (!doc) {
        doc = await this.findOneAndUpdate(
            { productId },
            {
                $inc: { totalPurchases: quantity, totalRevenue: revenue },
                $push: {
                    dailySnapshots: {
                        $each: [{ date: today, purchases: quantity, revenue }],
                        $slice: -90
                    }
                }
            },
            { upsert: true, new: true }
        );
    }

    return doc;
};

// Method to record wishlist add
productAnalyticsSchema.statics.recordWishlistAdd = async function (productId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let doc = await this.findOneAndUpdate(
        { productId, 'dailySnapshots.date': today },
        { $inc: { totalWishlistAdds: 1, 'dailySnapshots.$.wishlistAdds': 1 } },
        { new: true }
    );

    if (!doc) {
        doc = await this.findOneAndUpdate(
            { productId },
            {
                $inc: { totalWishlistAdds: 1 },
                $push: {
                    dailySnapshots: {
                        $each: [{ date: today, wishlistAdds: 1 }],
                        $slice: -90
                    }
                }
            },
            { upsert: true, new: true }
        );
    }

    return doc;
};

const ProductAnalytics = mongoose.model('ProductAnalytics', productAnalyticsSchema);

export default ProductAnalytics;
