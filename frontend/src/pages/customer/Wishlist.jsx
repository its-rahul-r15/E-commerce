import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrashIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useWishlist } from '../../contexts/WishlistContext';
import { cartService } from '../../services/api';
import { toast } from 'react-hot-toast';

const Wishlist = () => {
    const { wishlistItems, isLoading, toggleWishlist, clearWishlist } = useWishlist();
    const navigate = useNavigate();

    const handleAddToCart = async (product) => {
        try {
            await cartService.addToCart(product._id || product, 1);
            toast.success('Added to cart');
            // Remove from wishlist after adding to cart
            toggleWishlist(product);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to add to cart');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[var(--athenic-bg)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--athenic-gold)]"></div>
            </div>
        );
    }

    if (!wishlistItems || wishlistItems.length === 0) {
        return (
            <div className="min-h-screen bg-[var(--athenic-bg)] py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-3xl font-serif-decorative text-[var(--athenic-blue)] mb-4 tracking-[0.05em]">
                        Your Wishlist
                    </h1>
                    <div className="bg-white rounded-2xl shadow-sm border border-[var(--athenic-gold)] border-opacity-30 p-12 mt-8">
                        <div className="w-24 h-24 mx-auto bg-[#fae6e6] rounded-full flex items-center justify-center mb-6">
                            <svg className="w-12 h-12 text-[#FF5A5F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-serif text-[var(--athenic-blue)] mb-2">Your wishlist is empty</h2>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                            Explore our exquisite collection and save your favorite pieces for later.
                        </p>
                        <Link
                            to="/products"
                            className="inline-block bg-[var(--athenic-gold)] text-white px-8 py-3 rounded-xl font-medium tracking-wide hover:opacity-90 transition-opacity"
                        >
                            Explore Collection
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--athenic-bg)] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-serif-decorative text-[var(--athenic-blue)] tracking-[0.05em]">
                        Your Wishlist <span className="text-lg text-gray-500 ml-2 font-sans">({wishlistItems.length} items)</span>
                    </h1>
                    <button
                        onClick={clearWishlist}
                        className="text-red-500 hover:text-red-600 text-sm font-medium transition-colors flex items-center"
                    >
                        <TrashIcon className="w-4 h-4 mr-1" />
                        Clear All
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {wishlistItems.map((item) => (
                        <div key={item.product._id} className="bg-white rounded-2xl shadow-sm border border-[var(--athenic-gold)] border-opacity-30 overflow-hidden group">
                            <div className="relative aspect-[4/5] bg-gray-100 cursor-pointer" onClick={() => navigate(`/product/${item.product._id}`)}>
                                {item.product.images && item.product.images[0] ? (
                                    <img
                                        src={item.product.images[0]}
                                        alt={item.product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        No Image
                                    </div>
                                )}

                                {/* Remove button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleWishlist(item.product);
                                    }}
                                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md text-gray-400 hover:text-red-500 transition-colors z-10"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-4">
                                <p className="text-xs text-[var(--athenic-gold)] font-medium tracking-wider uppercase mb-1">
                                    {item.product.category}
                                </p>
                                <h3 className="text-lg font-serif text-[var(--athenic-blue)] truncate mb-2 cursor-pointer hover:text-[var(--athenic-gold)] transition-colors"
                                    onClick={() => navigate(`/product/${item.product._id}`)}
                                >
                                    {item.product.name}
                                </h3>

                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex flex-col">
                                        <span className="text-lg font-bold text-[var(--athenic-blue)]">
                                            ₹{item.product.discountedPrice || item.product.price}
                                        </span>
                                        {item.product.discountedPrice && (
                                            <span className="text-xs text-gray-400 line-through">
                                                ₹{item.product.price}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 max-w-[50%] truncate">
                                        By {item.product.shopId?.name}
                                    </p>
                                </div>

                                <button
                                    onClick={() => handleAddToCart(item.product)}
                                    className="w-full flex items-center justify-center space-x-2 bg-[var(--athenic-blue)] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-opacity-90 transition-all"
                                >
                                    <ShoppingCartIcon className="w-5 h-5" />
                                    <span>Move to Cart</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Wishlist;
