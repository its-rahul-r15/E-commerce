import React, { createContext, useContext, useState, useEffect } from 'react';
import { wishlistService } from '../services/api';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { isAuthenticated, user } = useAuth();

    // Check if a product is in the wishlist
    const isInWishlist = (productId) => {
        return wishlistItems.some(item =>
            (item.product._id || item.product) === productId
        );
    };

    // Load wishlist items
    const fetchWishlist = async () => {
        if (!isAuthenticated || user?.role !== 'customer') {
            setWishlistItems([]);
            return;
        }

        try {
            setIsLoading(true);
            const data = await wishlistService.getWishlist();
            setWishlistItems(data?.items || []);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Toggle item in wishlist
    const toggleWishlist = async (product) => {
        if (!isAuthenticated) {
            toast.error('Please login to add items to wishlist');
            return false;
        }

        if (user.role !== 'customer') {
            toast.error('Only customers can maintain a wishlist');
            return false;
        }

        const productId = product._id || product;
        const isCurrentlySaved = isInWishlist(productId);

        // Optimistic UI update
        if (isCurrentlySaved) {
            setWishlistItems(prev => prev.filter(item => (item.product._id || item.product) !== productId));
        } else {
            // Give a skeleton structure before real data loads
            setWishlistItems(prev => [...prev, { product }]);
        }

        try {
            const result = await wishlistService.toggleItem(productId);
            // Sync with server state completely
            setWishlistItems(result.wishlist?.items || []);

            if (result.action === 'added') {
                toast.success('Added to wishlist');
            } else {
                toast.success('Removed from wishlist');
            }
            return true;
        } catch (error) {
            // Revert on failure
            fetchWishlist();
            toast.error('Failed to update wishlist');
            return false;
        }
    };

    const clearWishlist = async () => {
        try {
            await wishlistService.clearWishlist();
            setWishlistItems([]);
            toast.success('Wishlist cleared');
        } catch (error) {
            toast.error('Failed to clear wishlist');
        }
    }

    // Load initial data
    useEffect(() => {
        fetchWishlist();
    }, [isAuthenticated, user]);

    return (
        <WishlistContext.Provider
            value={{
                wishlistItems,
                wishlistCount: wishlistItems.length,
                isLoading,
                isInWishlist,
                toggleWishlist,
                clearWishlist,
                fetchWishlist
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
};
