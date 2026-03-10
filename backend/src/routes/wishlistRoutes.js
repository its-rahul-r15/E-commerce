import express from 'express';
import {
    getWishlist,
    toggleWishlistItem,
    clearWishlist
} from '../controllers/wishlistController.js';
import auth from '../middlewares/auth.js';
import { requireCustomer } from '../middlewares/roleCheck.js';

const router = express.Router();

router.use(auth);
router.use(requireCustomer); // Only customers can have a wishlist for now

router.route('/')
    .get(getWishlist)
    .delete(clearWishlist);

router.post('/toggle', toggleWishlistItem);

export default router;
