import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${searchQuery}`);
        }
    };

    const handleCartClick = () => {
        if (!isAuthenticated) {
            setShowAuthModal(true);
        } else {
            navigate('/cart');
        }
    };

    return (
        <>
            <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-2 group">
                            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                                <span className="text-white font-bold text-lg">G</span>
                            </div>
                            <div className="text-2xl font-bold text-primary">
                                GalliKart
                            </div>
                        </Link>

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-8">
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    placeholder="Search for products, shops..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-2.5 pl-11 border border-gray-300 rounded-lg 
                                             focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                                             placeholder:text-gray-400 transition-all"
                                />
                                <svg
                                    className="absolute left-3.5 top-3 h-5 w-5 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </div>
                        </form>

                        {/* Right Section */}
                        <div className="flex items-center space-x-6">
                            {/* Cart (Customer only) */}
                            {(!user || user.role === 'customer') && (
                                <button
                                    onClick={handleCartClick}
                                    className="flex items-center space-x-2 text-gray-700 hover:text-primary"
                                >
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <span className="hidden md:inline">Cart</span>
                                </button>
                            )}

                            {/* Seller Dashboard Link */}
                            {user && user.role === 'seller' && (
                                <Link
                                    to="/seller/dashboard"
                                    className="flex items-center space-x-2 text-gray-700 hover:text-primary"
                                >
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <span className="hidden md:inline">Dashboard</span>
                                </Link>
                            )}

                            {isAuthenticated ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                                        className="flex items-center space-x-2 text-gray-700 hover:text-primary"
                                    >
                                        <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="hidden md:inline">{user?.name}</span>
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {/* Profile Dropdown */}
                                    {showProfileMenu && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                                            <Link
                                                to="/profile"
                                                onClick={() => setShowProfileMenu(false)}
                                                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                            >
                                                My Profile
                                            </Link>
                                            {user.role === 'customer' && (
                                                <Link
                                                    to="/orders"
                                                    onClick={() => setShowProfileMenu(false)}
                                                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                                >
                                                    My Orders
                                                </Link>
                                            )}
                                            {user.role === 'seller' && (
                                                <>
                                                    <Link
                                                        to="/seller/products"
                                                        onClick={() => setShowProfileMenu(false)}
                                                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                                    >
                                                        My Products
                                                    </Link>
                                                    <Link
                                                        to="/seller/orders"
                                                        onClick={() => setShowProfileMenu(false)}
                                                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                                    >
                                                        Shop Orders
                                                    </Link>
                                                </>
                                            )}
                                            {user.role === 'admin' && (
                                                <Link
                                                    to="/admin/dashboard"
                                                    onClick={() => setShowProfileMenu(false)}
                                                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                                >
                                                    Admin Panel
                                                </Link>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowAuthModal(true)}
                                    className="btn-primary"
                                >
                                    Login
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Auth Modal */}
            {showAuthModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Login / Sign Up</h2>
                            <button
                                onClick={() => setShowAuthModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-gray-600 mb-4">Login to continue shopping</p>
                        <button
                            onClick={() => {
                                setShowAuthModal(false);
                                navigate('/login');
                            }}
                            className="btn-primary w-full"
                        >
                            Continue to Login
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
