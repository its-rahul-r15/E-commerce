import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';

export const getWishlist = async (req, res, next) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
            path: 'items.product',
            select: 'name price discountedPrice images category shopId',
            populate: {
                path: 'shopId',
                select: 'name'
            }
        });

        if (!wishlist) {
            wishlist = await Wishlist.create({ user: req.user._id, items: [] });
        }

        res.status(200).json({
            success: true,
            wishlist,
        });
    } catch (error) {
        next(error);
    }
};

export const toggleWishlistItem = async (req, res, next) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                error: 'Product ID is required',
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found',
            });
        }

        let wishlist = await Wishlist.findOne({ user: req.user._id });

        if (!wishlist) {
            wishlist = new Wishlist({ user: req.user._id, items: [] });
        }

        const exactIndex = wishlist.items.findIndex(
            (item) => item.product.toString() === productId
        );

        let action;

        if (exactIndex > -1) {
            // Remove from wishlist
            wishlist.items.splice(exactIndex, 1);
            action = 'removed';
        } else {
            // Add to wishlist
            wishlist.items.push({ product: productId });
            action = 'added';
        }

        await wishlist.save();

        res.status(200).json({
            success: true,
            action,
            message: `Product ${action} ${action === 'added' ? 'to' : 'from'} wishlist successfully`,
            wishlist,
        });
    } catch (error) {
        next(error);
    }
};

export const clearWishlist = async (req, res, next) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user._id });

        if (wishlist) {
            wishlist.items = [];
            await wishlist.save();
        }

        res.status(200).json({
            success: true,
            message: 'Wishlist cleared successfully',
        });
    } catch (error) {
        next(error);
    }
};
