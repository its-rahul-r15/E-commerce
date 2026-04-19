import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
    HomeIcon as HomeOutline,
    ShoppingBagIcon as CartOutline,
    HeartIcon as HeartOutline,
    UserIcon as UserOutline,
    SparklesIcon
} from '@heroicons/react/24/outline';
import {
    HomeIcon as HomeSolid,
    ShoppingBagIcon as CartSolid,
    HeartIcon as HeartSolid,
    UserIcon as UserSolid
} from '@heroicons/react/24/solid';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAuth } from '../../contexts/AuthContext';
import { cartService } from '../../services/api';

const BottomNav = () => {
    const location = useLocation();
    const { wishlistCount } = useWishlist();
    const { user, isAuthenticated } = useAuth();
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        if (isAuthenticated && ['customer', 'seller'].includes(user?.role)) {
            fetchCartCount();
        }
    }, [isAuthenticated, user]);

    const fetchCartCount = async () => {
        try {
            const data = await cartService.getCart();
            setCartCount(data.cart?.items?.length || 0);
        } catch (error) {
            console.error('Error fetching cart:', error);
        }
    };

    return (
        <div className="lg:hidden fixed bottom-0 w-full bg-white border-t border-gray-100 pb-safe z-50">
            <div className="flex justify-around items-center h-16 px-2">

                {/* Home */}
                <Link to="/" className="flex flex-col items-center justify-center w-16 h-full text-gray-500 hover:text-[#FF5A5F]">
                    {location.pathname === '/' ? (
                        <HomeSolid className="w-6 h-6 text-[#FF5A5F]" />
                    ) : (
                        <HomeOutline className="w-6 h-6" />
                    )}
                    <span className={`text-[10px] mt-1 font-medium ${location.pathname === '/' ? 'text-[#FF5A5F]' : ''}`}>HOME</span>
                </Link>

                {/* Cart */}
                <Link to="/cart" className="relative flex flex-col items-center justify-center w-16 h-full text-gray-500 hover:text-[#FF5A5F]">
                    <div className="relative">
                        {location.pathname === '/cart' ? (
                            <CartSolid className="w-6 h-6 text-[#FF5A5F]" />
                        ) : (
                            <CartOutline className="w-6 h-6" />
                        )}
                        {cartCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-[#FF5A5F] text-white text-[8px] rounded-full flex items-center justify-center font-bold border-2 border-white">
                                {cartCount}
                            </span>
                        )}
                    </div>
                    <span className={`text-[10px] mt-1 font-medium ${location.pathname === '/cart' ? 'text-[#FF5A5F]' : ''}`}>CART</span>
                </Link>

                {/* AI Stylist (Floating Center Button) */}
                <div className="relative -top-5 flex justify-center w-20">
                    <Link to="/try-on" className="flex flex-col items-center justify-center relative w-14 h-14 bg-[#ffeaea] rounded-full border-4 border-white shadow-sm text-[#FF5A5F] hover:bg-[#ffd9d9] transition-colors">
                        <SparklesIcon className="w-6 h-6" />
                    </Link>
                    <span className="absolute -bottom-4 text-[10px] font-medium text-gray-500 text-center w-full whitespace-nowrap">AI STYLIST</span>
                </div>

                {/* Wishlist */}
                <Link to="/wishlist" className="relative flex flex-col items-center justify-center w-16 h-full text-gray-500 hover:text-[#FF5A5F]">
                    <div className="relative">
                        {location.pathname === '/wishlist' ? (
                            <HeartSolid className="w-6 h-6 text-[#FF5A5F]" />
                        ) : (
                            <HeartOutline className="w-6 h-6" />
                        )}
                        {wishlistCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-[#FF5A5F] text-white text-[8px] rounded-full flex items-center justify-center font-bold border-2 border-white">
                                {wishlistCount}
                            </span>
                        )}
                    </div>
                    <span className={`text-[10px] mt-1 font-medium ${location.pathname === '/wishlist' ? 'text-[#FF5A5F]' : ''}`}>WISHLIST</span>
                </Link>

                {/* Profile */}
                <Link to="/profile" className="flex flex-col items-center justify-center w-16 h-full text-gray-500 hover:text-[#FF5A5F]">
                    {location.pathname === '/profile' ? (
                        <UserSolid className="w-6 h-6 text-[#FF5A5F]" />
                    ) : (
                        <UserOutline className="w-6 h-6" />
                    )}
                    <span className={`text-[10px] mt-1 font-medium ${location.pathname === '/profile' ? 'text-[#FF5A5F]' : ''}`}>PROFILE</span>
                </Link>

            </div>
        </div>
    );
};

export default BottomNav;
