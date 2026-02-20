import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { cartService } from '../../services/api';
import {
    MapPinIcon,
    MagnifyingGlassIcon,
    ShoppingBagIcon,
    UserIcon,
    HeartIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [location, setLocation] = useState('Detecting location...');
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

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
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
                            {
                                headers: {
                                    'Accept-Language': 'en'
                                }
                            }
                        );
                        if (!response.ok) throw new Error('CORS or Network Error');
                        const data = await response.json();
                        const address = data.address || {};
                        const city = address.city || address.town || address.village || address.neighborhood || address.county;
                        const area = address.suburb || address.neighbourhood || address.road || city;

                        if (area || city) {
                            setLocation(`${area}${city ? ', ' + city : ''}`);
                        } else {
                            setLocation('Classical District, Athens');
                        }
                    } catch (error) {
                        setLocation('Explore Our Nearby Boutiques');
                    }
                },
                () => setLocation('Explore Our Nearby Boutiques'),
                { enableHighAccuracy: true, timeout: 10000 }
            );
        } else {
            setLocation('Explore Our Nearby Boutiques');
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

    return (
        <div className="relative z-50">
            {/* Top Location Bar - Teal Gradient */}
            <div className="bg-gradient-to-r from-[#2C5D63] to-[#4A7C7C] py-2">
                <div className="max-w-7xl mx-auto px-4 flex justify-center items-center">
                    <button className="flex items-center space-x-2 text-[#F5E0A3] hover:text-white transition-colors group">
                        <MapPinIcon className="w-4 h-4" />
                        <span className="text-[10px] sm:text-xs font-serif uppercase tracking-[0.2em]">
                            Our Boutique: <span className="font-bold">{location}</span>
                        </span>
                    </button>
                </div>
            </div>

            {/* Main Navbar */}
            <nav className="bg-[var(--athenic-bg)] border-b border-[var(--athenic-gold)] border-opacity-30">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between h-20">

                        {/* Left: Navigation Links */}
                        <div className="hidden lg:flex items-center space-x-8">
                            <Link to="/products" className="text-[11px] font-serif tracking-[0.2em] text-[var(--athenic-blue)] hover:text-[var(--athenic-gold)] transition-colors uppercase">
                                Collections
                            </Link>
                            <Link to="/shops" className="text-[11px] font-serif tracking-[0.2em] text-[var(--athenic-blue)] hover:text-[var(--athenic-gold)] transition-colors uppercase">
                                Boutiques
                            </Link>
                            <Link to="/about" className="text-[11px] font-serif tracking-[0.2em] text-[var(--athenic-blue)] hover:text-[var(--athenic-gold)] transition-colors uppercase">
                                The Atelier
                            </Link>
                        </div>

                        {/* Center: Logo */}
                        <div className="flex-1 flex justify-center lg:absolute lg:left-1/2 lg:-translate-x-1/2">
                            <Link to="/" className="flex flex-col items-center group">
                                <span className="text-3xl font-serif-decorative tracking-[0.1em] text-[var(--athenic-blue)] group-hover:text-[var(--athenic-gold)] transition-all">
                                    ATHENIG
                                </span>
                                <div className="h-[1px] w-0 group-hover:w-full bg-[var(--athenic-gold)] transition-all duration-500"></div>
                            </Link>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center space-x-4 sm:space-x-6">
                            {/* Search */}
                            <form onSubmit={handleSearch} className="hidden md:block relative">
                                <input
                                    type="text"
                                    placeholder="Search the collection..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-48 lg:w-64 bg-transparent border-b border-[var(--athenic-blue)] border-opacity-20 py-1 px-2 text-xs font-serif focus:outline-none focus:border-[var(--athenic-gold)] placeholder:italic placeholder:opacity-50 transition-all"
                                />
                                <MagnifyingGlassIcon className="w-4 h-4 absolute right-2 top-1.5 text-[var(--athenic-blue)] opacity-50" />
                            </form>

                            {/* Wishlist */}
                            <button className="text-[var(--athenic-blue)] hover:text-[var(--athenic-gold)] transition-colors">
                                <HeartIcon className="w-5 h-5" />
                            </button>

                            {/* Cart */}
                            <button
                                onClick={() => navigate('/cart')}
                                className="relative text-[var(--athenic-blue)] hover:text-[var(--athenic-gold)] transition-colors"
                            >
                                <ShoppingBagIcon className="w-5 h-5" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[var(--athenic-gold)] text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                                        {cartCount}
                                    </span>
                                )}
                            </button>

                            {/* Profile */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className="text-[var(--athenic-blue)] hover:text-[var(--athenic-gold)] transition-colors"
                                >
                                    <UserIcon className="w-5 h-5" />
                                </button>
                                {showProfileMenu && (
                                    <div className="absolute right-0 mt-4 w-48 bg-white border border-[var(--athenic-gold)] shadow-xl z-[60] py-2">
                                        {isAuthenticated ? (
                                            <>
                                                <div className="px-4 py-2 border-b border-gray-100 mb-2">
                                                    <p className="text-[10px] font-serif uppercase tracking-wider text-gray-500">Welcome</p>
                                                    <p className="text-sm font-serif truncate">{user?.name}</p>
                                                </div>
                                                <button onClick={() => navigate('/orders')} className="w-full text-left px-4 py-2 text-xs font-serif hover:bg-[var(--athenic-bg)] hover:text-[var(--athenic-gold)]">Orders</button>
                                                <button onClick={() => navigate('/profile')} className="w-full text-left px-4 py-2 text-xs font-serif hover:bg-[var(--athenic-bg)] hover:text-[var(--athenic-gold)]">Profile</button>
                                                {user.role === 'seller' && (
                                                    <button onClick={() => navigate('/seller/dashboard')} className="w-full text-left px-4 py-2 text-xs font-serif hover:bg-[var(--athenic-bg)] hover:text-[var(--athenic-gold)] text-[var(--athenic-teal)]">Seller Hub</button>
                                                )}
                                                <div className="border-t border-gray-100 mt-2">
                                                    <button onClick={logout} className="w-full text-left px-4 py-2 text-xs font-serif text-red-500 hover:bg-red-50">Logout</button>
                                                </div>
                                            </>
                                        ) : (
                                            <button onClick={() => navigate('/login')} className="w-full text-left px-4 py-2 text-xs font-serif hover:bg-[var(--athenic-bg)]">Login / Register</button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
