import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { cartService } from '../../services/api';
import { MapPinIcon, BellIcon, ShoppingCartIcon, UserCircleIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const Navbar = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [location, setLocation] = useState('Detecting location...');
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    // Fetch user's actual location on component mount
    useEffect(() => {
        getUserLocation();
    }, []);

    useEffect(() => {
        if (isAuthenticated && ['customer', 'seller'].includes(user?.role)) {
            fetchCartCount();
        }
    }, [isAuthenticated, user]);

    const getUserLocation = () => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;

                    try {
                        // Reverse geocoding using OpenStreetMap Nominatim API (free)
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                        );
                        const data = await response.json();

                        // Extract city and state/country
                        const city = data.address.city || data.address.town || data.address.village || data.address.county;
                        const state = data.address.state || data.address.country;

                        setLocation(city && state ? `${city}, ${state}` : 'Location detected');
                    } catch (error) {
                        console.error('Error fetching location name:', error);
                        setLocation(`${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`);
                    }
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    setLocation('Location unavailable');
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // Cache for 5 minutes
                }
            );
        } else {
            setLocation('Location not supported');
        }
    };

    const fetchCartCount = async () => {
        try {
            const data = await cartService.getCart();
            setCartCount(data.cart?.items?.length || 0);
        } catch (error) {
            console.error('Error fetching cart:', error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${searchQuery}`);
        }
    };

    const handleCartClick = () => {
        if (!isAuthenticated) {
            alert('Please login to view cart');
            navigate('/login');
        } else {
            navigate('/cart');
        }
    };

    return (
        <nav className="bg-gradient-to-r from-rose-50 via-pink-50 to-red-50 shadow-md sticky top-0 z-50 border-b-2 border-rose-200">
            {/* Valentine's Decoration Bar */}
            <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-red-500 h-1"></div>
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Left: Logo + Location */}
                    <div className="flex items-center space-x-6">
                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-2 group">
                            <div className="w-9 h-9 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-all group-hover:scale-110">
                                <HeartSolidIcon className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">ShopLocal</span>
                            <span className="text-xl">💝</span>
                        </Link>

                        {/* Location Selector */}
                        <button className="hidden lg:flex items-center space-x-1 text-gray-700 hover:text-rose-600 transition-colors group">
                            <MapPinIcon className="w-5 h-5 text-rose-500 group-hover:text-rose-600" />
                            <span className="text-sm font-medium">{location}</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        <Link to="/products" className="hidden md:flex items-center font-medium text-gray-700 hover:text-rose-600 transition-colors relative group">
                            <span>Browse</span>
                            <HeartIcon className="w-3 h-3 absolute -top-1 -right-3 text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <Link to="/shops" className="hidden md:flex items-center font-medium text-gray-700 hover:text-rose-600 transition-colors relative group">
                            <span>Stores</span>
                            <HeartIcon className="w-3 h-3 absolute -top-1 -right-3 text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                    </div>

                    {/* Center: Search Bar */}
                    <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="Search Valentine's gifts & shops 💕"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2.5 pl-11 bg-white/80 backdrop-blur-sm border-2 border-rose-200 rounded-xl 
                                         focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 focus:bg-white
                                         placeholder:text-rose-300 transition-all shadow-sm"
                            />
                            <HeartIcon className="absolute left-3.5 top-3 h-5 w-5 text-rose-400" />
                        </div>
                    </form>

                    {/* Right: Actions */}
                    <div className="flex items-center space-x-6">
                        {/* Notification Bell */}
                        {isAuthenticated && (
                            <button className="relative text-gray-700 hover:text-rose-600 transition-colors group">
                                <BellIcon className="w-6 h-6" />
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-rose-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                                    3
                                </span>
                                <HeartIcon className="w-3 h-3 absolute -bottom-1 -right-1 text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        )}

                        {/* Cart */}
                        {(!user || ['customer', 'seller'].includes(user.role)) && (
                            <button
                                onClick={handleCartClick}
                                className="relative text-gray-700 hover:text-rose-600 transition-colors group"
                            >
                                <ShoppingCartIcon className="w-6 h-6" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-rose-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-medium shadow-md">
                                        {cartCount}
                                    </span>
                                )}
                                <HeartIcon className="w-3 h-3 absolute -bottom-1 -right-1 text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        )}

                        {/* User Profile */}
                        {isAuthenticated ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className="flex items-center space-x-2 text-gray-700 hover:text-rose-600 transition-colors group"
                                >
                                    <div className="w-9 h-9 bg-gradient-to-br from-rose-400 to-pink-500 text-white rounded-full flex items-center justify-center font-semibold shadow-md relative overflow-hidden">
                                        {user?.name?.charAt(0).toUpperCase()}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/20"></div>
                                    </div>
                                </button>

                                {/* Profile Dropdown */}
                                {showProfileMenu && (
                                    <>
                                        {/* Backdrop */}
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setShowProfileMenu(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                                                <p className="text-xs text-gray-500">{user?.email}</p>
                                            </div>

                                            {user.role === 'customer' && (
                                                <>
                                                    <Link
                                                        to="/orders"
                                                        onClick={() => setShowProfileMenu(false)}
                                                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                                    >
                                                        <span className="mr-3">💝</span>
                                                        My Orders
                                                    </Link>
                                                    <Link
                                                        to="/profile"
                                                        onClick={() => setShowProfileMenu(false)}
                                                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                                    >
                                                        <span className="mr-3">💖</span>
                                                        My Profile
                                                    </Link>
                                                </>
                                            )}

                                            {user.role === 'seller' && (
                                                <>
                                                    <Link
                                                        to="/seller/dashboard"
                                                        onClick={() => setShowProfileMenu(false)}
                                                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                                    >
                                                        <span className="mr-3">📊</span>
                                                        Dashboard
                                                    </Link>
                                                    <Link
                                                        to="/seller/products"
                                                        onClick={() => setShowProfileMenu(false)}
                                                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                                    >
                                                        <span className="mr-3">🎁</span>
                                                        My Products
                                                    </Link>
                                                    <Link
                                                        to="/seller/orders"
                                                        onClick={() => setShowProfileMenu(false)}
                                                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                                    >
                                                        <span className="mr-3">💌</span>
                                                        Shop Orders
                                                    </Link>
                                                </>
                                            )}

                                            {user.role === 'admin' && (
                                                <Link
                                                    to="/admin/dashboard"
                                                    onClick={() => setShowProfileMenu(false)}
                                                    className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                                >
                                                    <span className="mr-3">⚙️</span>
                                                    Admin Panel
                                                </Link>
                                            )}

                                            <div className="border-t border-gray-100 mt-2 pt-2">
                                                <button
                                                    onClick={() => {
                                                        logout();
                                                        setShowProfileMenu(false);
                                                        navigate('/');
                                                    }}
                                                    className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <span className="mr-3">🚪</span>
                                                    Logout
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-2.5 rounded-full font-semibold hover:from-rose-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg hover:scale-105 flex items-center space-x-1"
                            >
                                <span>Login</span>
                                <HeartIcon className="w-4 h-4" />
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
