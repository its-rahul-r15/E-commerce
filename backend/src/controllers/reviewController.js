import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

export const createReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const productId = req.params.productId;
        const userId = req.user.userId;

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Check if user has already reviewed this product
        const existingReview = await Review.findOne({ user: userId, product: productId });
        if (existingReview) {
            return res.status(400).json({ error: 'You have already reviewed this product' });
        }

        // Verify if user has bought the product
        const order = await Order.findOne({
            customerId: userId,
            'items.productId': productId,
            status: { $ne: 'cancelled' } // Any successful order
        });

        if (!order) {
            return res.status(403).json({ error: 'You can only review products you have purchased' });
        }

        // Create review
        const review = await Review.create({
            user: userId,
            product: productId,
            rating: Number(rating),
            comment
        });

        // Update product average rating and number of reviews
        const reviews = await Review.find({ product: productId });
        
        product.numOfReviews = reviews.length;
        product.averageRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
        await product.save();

        res.status(201).json({ message: 'Review added successfully', review });
    } catch (error) {
        console.error('Error in createReview:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getProductReviews = async (req, res) => {
    try {
        const productId = req.params.productId;
        const reviews = await Review.find({ product: productId }).populate('user', 'name');
        res.status(200).json({ reviews });
    } catch (error) {
        console.error('Error in getProductReviews:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const checkPurchase = async (req, res) => {
    try {
        const productId = req.params.productId;
        const userId = req.user.userId;

        const order = await Order.findOne({
            customerId: userId,
            'items.productId': productId,
            status: { $ne: 'cancelled' }
        });

        const hasPurchased = !!order;
        
        // Also check if they already reviewed
        let hasReviewed = false;
        if (hasPurchased) {
            const review = await Review.findOne({ user: userId, product: productId });
            hasReviewed = !!review;
        }

        res.status(200).json({ hasPurchased, hasReviewed });
    } catch (error) {
        console.error('Error in checkPurchase:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
