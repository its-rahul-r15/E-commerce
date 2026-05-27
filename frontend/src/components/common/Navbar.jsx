import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { cartService, couponService, productService } from '../../services/api';
import {
    Bars3Icon,
    MapPinIcon,
    MagnifyingGlassIcon,
    ShoppingBagIcon,
    UserIcon,
    HeartIcon
} from '@heroicons/react/24/outline';
import CategoryNav from './CategoryNav';

const Navbar = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [location, setLocation] = useState('Detecting location...');
    const [activeCoupons, setActiveCoupons] = useState([]);
    const { user, isAuthenticated, logout } = useAuth();
    const { wishlistCount } = useWishlist();
    const navigate = useNavigate();
    const routeLocation = useLocation();
    const isHome = routeLocation.pathname === '/';

    // ── Live Search State ──
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const searchRef = useRef(null);
    const mobileSearchRef = useRef(null);
    const debounceTimer = useRef(null);

    useEffect(() => {
        getUserLocation();
        fetchActiveCoupons();
    }, []);

    const fetchActiveCoupons = async () => {
        try {
            const data = await couponService.getActiveCoupons();
            if (Array.isArray(data)) setActiveCoupons(data);
        } catch (e) {
            // silently fail
        }
    };

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
                            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                        );
                        if (!response.ok) throw new Error('Geocoding failed');
                        const data = await response.json();
                        const city = data.city || data.locality || data.principalSubdivision || '';
                        const area = data.localityInfo?.administrative?.[3]?.name || data.localityInfo?.administrative?.[2]?.name || city;

                        if (area || city) {
                            setLocation(`${area}${city && area !== city ? ', ' + city : ''}`);
                        } else {
                            setLocation('Local Neighborhood');
                        }
                    } catch (error) {
                        setLocation('Find shops near you');
                    }
                },
                () => setLocation('Find shops near you'),
                { enableHighAccuracy: true, timeout: 10000 }
            );
        } else {
            setLocation('Find shops near you');
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

    // ── Debounced Live Search ──
    const performLiveSearch = useCallback(async (query) => {
        if (!query || query.trim().length < 2) {
            setSearchResults([]);
            setShowDropdown(false);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        try {
            const data = await productService.searchProducts(query.trim(), 1, 6);
            const results = Array.isArray(data) ? data : (data.products || data || []);
            setSearchResults(results.slice(0, 6));
            setShowDropdown(true);
            setActiveIndex(-1);
        } catch (error) {
            console.error('Live search error:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    const handleSearchInput = (e) => {
        const value = e.target.value;
        setSearchQuery(value);

        // Clear previous debounce timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // Debounce: wait 300ms after user stops typing
        debounceTimer.current = setTimeout(() => {
            performLiveSearch(value);
        }, 300);
    };

    // ── Highlight matched text with regex ──
    const highlightMatch = (text, query) => {
        if (!text || !query || query.trim().length < 2) return text;
        try {
            // Escape regex special chars
            const words = query.trim().split(/\s+/).filter(w => w.length > 0);
            const escaped = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
            const pattern = new RegExp(`(${escaped.join('|')})`, 'gi');
            const parts = text.split(pattern);
            return parts.map((part, i) =>
                pattern.test(part)
                    ? <mark key={i} style={{ background: 'linear-gradient(120deg, #ffd54f 0%, #ffb300 100%)', color: '#1a1a1a', padding: '0 2px', borderRadius: '2px', fontWeight: 600 }}>{part}</mark>
                    : part
            );
        } catch {
            return text;
        }
    };

    // ── Keyboard Navigation ──
    const handleSearchKeyDown = (e) => {
        if (!showDropdown || searchResults.length === 0) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (searchQuery.trim()) {
                    setShowDropdown(false);
                    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                }
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setActiveIndex(prev => (prev < searchResults.length) ? prev + 1 : 0);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setActiveIndex(prev => (prev > 0) ? prev - 1 : searchResults.length);
                break;
            case 'Enter':
                e.preventDefault();
                if (activeIndex >= 0 && activeIndex < searchResults.length) {
                    const selected = searchResults[activeIndex];
                    setShowDropdown(false);
                    setSearchQuery('');
                    navigate(`/product/${selected._id}`);
                } else {
                    // "View all" option or default enter
                    setShowDropdown(false);
                    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                }
                break;
            case 'Escape':
                setShowDropdown(false);
                setActiveIndex(-1);
                break;
            default:
                break;
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setShowDropdown(false);
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    // ── Click Outside to Close ──
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                searchRef.current && !searchRef.current.contains(e.target) &&
                mobileSearchRef.current && !mobileSearchRef.current.contains(e.target)
            ) {
                setShowDropdown(false);
            }
            if (searchRef.current && !searchRef.current.contains(e.target) && !mobileSearchRef.current) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ── Close dropdown on route change ──
    useEffect(() => {
        setShowDropdown(false);
        setSearchQuery('');
        setIsMobileMenuOpen(false);
    }, [routeLocation.pathname]);

    // ── Cleanup debounce on unmount ──
    useEffect(() => {
        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, []);

    // ── Search Dropdown Component ──
    const SearchDropdown = ({ isMobile = false }) => {
        if (!showDropdown) return null;

        return (
            <div
                style={{
                    position: 'absolute',
                    top: isMobile ? '44px' : '32px',
                    left: 0,
                    right: 0,
                    background: '#fff',
                    borderRadius: '0 0 12px 12px',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderTop: 'none',
                    zIndex: 999,
                    overflow: 'hidden',
                    maxHeight: '420px',
                    overflowY: 'auto',
                    animation: 'searchDropdownSlide 0.2s ease-out',
                }}
            >
                {isSearching ? (
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                        <div style={{
                            display: 'inline-block', width: '20px', height: '20px',
                            border: '2px solid #e0e0e0', borderTopColor: 'var(--athenic-gold, #c9a96e)',
                            borderRadius: '50%', animation: 'spin 0.6s linear infinite',
                        }} />
                        <p style={{ fontSize: '12px', color: '#999', marginTop: '8px', fontFamily: 'Inter, sans-serif' }}>Searching...</p>
                    </div>
                ) : searchResults.length === 0 && searchQuery.trim().length >= 2 ? (
                    <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                        <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔍</div>
                        <p style={{ fontSize: '13px', color: '#666', fontFamily: 'Inter, sans-serif' }}>
                            No products found for "<strong>{searchQuery}</strong>"
                        </p>
                        <p style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>Try different keywords</p>
                    </div>
                ) : (
                    <>
                        {searchResults.map((product, index) => (
                            <div
                                key={product._id}
                                onClick={() => {
                                    setShowDropdown(false);
                                    setSearchQuery('');
                                    navigate(`/product/${product._id}`);
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '10px 14px',
                                    cursor: 'pointer',
                                    background: activeIndex === index ? '#f8f4ee' : 'transparent',
                                    borderBottom: '1px solid rgba(0,0,0,0.04)',
                                    transition: 'background 0.15s ease',
                                }}
                                onMouseEnter={() => setActiveIndex(index)}
                            >
                                {/* Product Image */}
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '8px',
                                    overflow: 'hidden', flexShrink: 0,
                                    background: '#f5f5f5', border: '1px solid rgba(0,0,0,0.06)',
                                }}>
                                    <img
                                        src={product.images?.[0] || '/placeholder.png'}
                                        alt={product.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        loading="lazy"
                                    />
                                </div>

                                {/* Product Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontSize: '13px', fontWeight: 500, color: '#1a1a1a',
                                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                        fontFamily: 'Inter, sans-serif',
                                    }}>
                                        {highlightMatch(product.name, searchQuery)}
                                    </div>
                                    <div style={{
                                        fontSize: '11px', color: '#888', marginTop: '2px',
                                        fontFamily: 'Inter, sans-serif',
                                    }}>
                                        {product.category}
                                        {product.brand ? ` · ${product.brand}` : ''}
                                        {product.shopId?.shopName ? ` · ${product.shopId.shopName}` : ''}
                                    </div>
                                </div>

                                {/* Price */}
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <div style={{
                                        fontSize: '13px', fontWeight: 700, color: '#1a1a1a',
                                        fontFamily: 'Inter, sans-serif',
                                    }}>
                                        ₹{product.discountedPrice || product.price}
                                    </div>
                                    {product.discountedPrice && product.discountedPrice < product.price && (
                                        <div style={{
                                            fontSize: '10px', color: '#aaa',
                                            textDecoration: 'line-through',
                                        }}>
                                            ₹{product.price}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* View All Results */}
                        {searchResults.length > 0 && (
                            <div
                                onClick={() => {
                                    setShowDropdown(false);
                                    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                                }}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    gap: '6px', padding: '12px',
                                    cursor: 'pointer',
                                    background: activeIndex === searchResults.length ? '#f8f4ee' : '#fafafa',
                                    fontFamily: 'Inter, sans-serif',
                                    fontSize: '12px', fontWeight: 600,
                                    color: 'var(--athenic-gold, #c9a96e)',
                                    borderTop: '1px solid rgba(0,0,0,0.06)',
                                    transition: 'background 0.15s ease',
                                }}
                                onMouseEnter={() => setActiveIndex(searchResults.length)}
                            >
                                <MagnifyingGlassIcon style={{ width: '14px', height: '14px' }} />
                                View all results for "{searchQuery}"
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    };

    return (
        <header className="sticky top-0 z-[100] w-full">
            {/* ── Announcement Ticker ── exact Libas.in style ── */}
            <div
                style={{
                    background: '#1a1a1a',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    overflow: 'hidden',
                    position: 'relative',
                }}
            >
                {/* Scrolling track */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: 'max-content',
                        animation: 'ticker-scroll 35s linear infinite',
                        willChange: 'transform',
                    }}
                >
                    {(activeCoupons.length > 0
                        ? [...activeCoupons, ...activeCoupons]
                        : [...Array(2)]
                    ).map((item, i) => {
                        const isPlaceholder = activeCoupons.length === 0;
                        return (
                            <span
                                key={i}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '0 48px',
                                    whiteSpace: 'nowrap',
                                    borderRight: '1px solid rgba(255,255,255,0.12)',
                                    fontFamily: 'Inter, sans-serif',
                                    fontSize: '11px',
                                    letterSpacing: '0.05em',
                                    color: 'rgba(255,255,255,0.9)',
                                }}
                            >
                                {isPlaceholder ? (
                                    [
                                        'Free Shipping on orders above ₹999',
                                        'Handcrafted by local artisans',
                                        'New arrivals every week',
                                        'Premium ethnic wear curated for you',
                                    ][i % 4]
                                ) : (
                                    <>
                                        <span style={{ fontWeight: 700, color: '#fff' }}>
                                            {item.discountType === 'percentage'
                                                ? `Buy & get ${item.discountValue}% OFF`
                                                : `Get ₹${item.discountValue} OFF`}
                                        </span>
                                        <span style={{ color: 'rgba(255,255,255,0.5)' }}>|</span>
                                        <span>Use Code:</span>
                                        <span
                                            style={{
                                                fontWeight: 800,
                                                color: '#fff',
                                                background: 'rgba(255,255,255,0.15)',
                                                padding: '1px 8px',
                                                borderRadius: '2px',
                                                letterSpacing: '0.12em',
                                                border: '1px solid rgba(255,255,255,0.25)',
                                            }}
                                        >
                                            {item.code}
                                        </span>
                                        {item.minPurchase > 0 && (
                                            <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                                                on orders above ₹{item.minPurchase}
                                            </span>
                                        )}
                                    </>
                                )}
                            </span>
                        );
                    })}
                </div>
            </div>

            {/* Main Navbar */}
            <nav className={`${isHome ? 'absolute top-[36px] left-0 right-0 bg-black/10 backdrop-blur-xl border-white/20 hover:transparent' : 'relative bg-white/95 backdrop-blur-sm border-gray-100 lg:border-[var(--athenic-gold)] border-opacity-30'} border-b z-50 transition-all duration-300 group`}>
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between h-16 lg:h-20">

                        {/* Mobile Hamburger (Left Mobile) */}
                        <div className="flex items-center lg:hidden w-1/4">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className={`${isHome ? 'text-white group-hover:text-[#FF5A5F]' : 'text-[#FF5A5F]'} hover:text-[#e0484d] transition-colors p-2 -ml-2 rounded-lg`}
                            >
                                {isMobileMenuOpen ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                ) : (
                                    <Bars3Icon className="w-7 h-7" />
                                )}
                            </button>
                        </div>

                        {/* Category Navigation (Left Desktop) */}
                        <div className="hidden lg:flex flex-1 justify-start h-full items-center">
                            {/* Desktop Logo */}
                            <Link to="/" className="hidden lg:flex flex-col items-center hover:opacity-80 transition-opacity">
                                <span className={`text-2xl lg:text-4xl font-serif-decorative tracking-[0.1em] ${isHome ? 'text-white group-hover:text-[var(--athenic-blue)]' : 'text-[var(--athenic-blue)]'} hover:text-[var(--athenic-gold)] transition-all`}>
                                    KLYRA
                                </span>
                            </Link>
                        </div>

                        {/* Logo (Center Desktop & Mobile) */}
                        <div className="flex-1 flex justify-center items-start">
                            {/* Mobile Logo */}
                            <Link to="/" className="lg:hidden flex flex-col items-center">
                                <span className={`text-2xl font-serif-decorative tracking-[0.1em] ${isHome ? 'text-white group-hover:text-[var(--athenic-blue)]' : 'text-[var(--athenic-blue)]'} hover:text-[var(--athenic-gold)] transition-all`}>
                                    KLYRA
                                </span>
                            </Link>

                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center justify-end w-1/4 lg:flex-1 lg:space-x-4">
                            {/* Desktop-only Actions */}
                            <div className="hidden lg:flex items-center space-x-4 sm:space-x-6">
                                {/* Search with Live Dropdown */}
                                <div ref={searchRef} className="hidden md:block relative">
                                    <form onSubmit={handleSearch} className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search for products..."
                                            value={searchQuery}
                                            onChange={handleSearchInput}
                                            onKeyDown={handleSearchKeyDown}
                                            onFocus={() => { if (searchResults.length > 0 && searchQuery.trim().length >= 2) setShowDropdown(true); }}
                                            className={`w-48 lg:w-64 bg-transparent border-b py-1 px-2 text-xs font-serif focus:outline-none focus:border-[var(--athenic-gold)] transition-all ${isHome ? 'border-white/50 text-white placeholder:text-white/60 group-hover:text-[var(--athenic-blue)] group-hover:border-[var(--athenic-blue)] group-hover:border-opacity-20 group-hover:placeholder:text-[var(--athenic-blue)] group-hover:placeholder:opacity-50' : 'border-[var(--athenic-blue)] border-opacity-20 text-[var(--athenic-blue)] placeholder:italic placeholder:opacity-50'}`}
                                            autoComplete="off"
                                            id="navbar-search-desktop"
                                        />
                                        <button type="submit" className="absolute right-2 top-1.5">
                                            <MagnifyingGlassIcon className={`w-4 h-4 ${isHome ? 'text-white group-hover:text-[var(--athenic-blue)]' : 'text-[var(--athenic-blue)]'} opacity-50 hover:opacity-100 transition-opacity`} />
                                        </button>
                                    </form>
                                    <SearchDropdown />
                                </div>

                                {/* Wishlist */}
                                <button
                                    onClick={() => navigate('/wishlist')}
                                    className={`relative transition-colors ${isHome ? 'text-white group-hover:text-[var(--athenic-blue)] hover:!text-[var(--athenic-gold)]' : 'text-[var(--athenic-blue)] hover:text-[var(--athenic-gold)]'}`}
                                >
                                    <HeartIcon className="w-5 h-5" />
                                    {wishlistCount > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#FF5A5F] lg:bg-[var(--athenic-gold)] text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                                            {wishlistCount}
                                        </span>
                                    )}
                                </button>


                                {/* Cart (Visible on both) */}
                                <button
                                    onClick={() => navigate('/cart')}
                                    className={`relative flex items-center justify-center w-10 h-10 lg:w-auto lg:h-auto rounded-xl lg:rounded-none bg-[#fae6e6] lg:bg-transparent ${isHome ? 'text-[#FF5A5F] group-hover:text-[var(--athenic-blue)] lg:text-white' : 'text-[#FF5A5F] lg:text-[var(--athenic-blue)]'} hover:bg-[#ffe4e4] lg:hover:text-[var(--athenic-gold)] transition-colors ml-2 lg:ml-0`}
                                >
                                    <ShoppingBagIcon className="w-5 h-5 lg:w-5 lg:h-5" />
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#FF5A5F] lg:bg-[var(--athenic-gold)] text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                                            {cartCount}
                                        </span>
                                    )}
                                </button>
                                {/* Profile */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                                        className={`transition-colors ${isHome ? 'text-white group-hover:text-[var(--athenic-blue)] hover:!text-[var(--athenic-gold)]' : 'text-[var(--athenic-blue)] hover:text-[var(--athenic-gold)]'}`}
                                    >
                                        <UserIcon className="w-5 h-5" />
                                    </button>
                                    {showProfileMenu && (
                                        <div className="absolute right-0 mt-4 w-48 bg-white text-gray-800 border border-[var(--athenic-gold)] shadow-xl z-[60] py-2">
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
                                                    {user.role === 'admin' && (
                                                        <button onClick={() => navigate('/admin/dashboard')} className="w-full text-left px-4 py-2 text-xs font-serif hover:bg-red-50 text-red-600 font-bold">🛡️ Admin Panel</button>
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
                </div>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-xl z-[60]">
                        <div className="px-4 py-4 space-y-2">
                            <div ref={mobileSearchRef} className="relative mb-4">
                                <form onSubmit={handleSearch} className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search for products..."
                                        value={searchQuery}
                                        onChange={handleSearchInput}
                                        onKeyDown={handleSearchKeyDown}
                                        onFocus={() => { if (searchResults.length > 0 && searchQuery.trim().length >= 2) setShowDropdown(true); }}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 pl-10 text-sm focus:outline-none focus:border-[#FF5A5F] transition-all"
                                        autoComplete="off"
                                        id="navbar-search-mobile"
                                    />
                                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                                </form>
                                <SearchDropdown isMobile={true} />
                            </div>
                            <div className="flex flex-col space-y-1">
                                {['WOMEN', 'MEN', 'KIDS', 'WEDDING', 'COUPLES'].map((cat) => (
                                    <Link
                                        key={cat}
                                        to={`/products?category=${encodeURIComponent(cat)}`}
                                        className="block px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#FF5A5F] hover:bg-[#fae6e6] rounded-xl transition-colors uppercase"
                                    >
                                        {cat}
                                    </Link>
                                ))}
                                <Link to="/try-on" className="px-4 py-3 text-sm font-medium text-[#FF5A5F] bg-[#fae6e6] hover:bg-[#ffe4e4] rounded-xl transition-colors flex items-center space-x-2 mt-2">
                                    <span className="text-lg">✨</span>
                                    <span>Virtual Try-On</span>
                                </Link>
                            </div>

                            <div className="border-t border-gray-100 mt-4 pt-4 space-y-2">
                                {isAuthenticated ? (
                                    <>
                                        <div className="px-4 py-2">
                                            <p className="text-xs text-gray-500 uppercase tracking-wider">Welcome</p>
                                            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                        </div>
                                        <button onClick={() => navigate('/orders')} className="w-full text-left px-4 py-3 text-base font-medium text-gray-700 hover:text-[#FF5A5F] hover:bg-[#fae6e6] rounded-xl transition-colors">Orders</button>
                                        <button onClick={() => navigate('/profile')} className="w-full text-left px-4 py-3 text-base font-medium text-gray-700 hover:text-[#FF5A5F] hover:bg-[#fae6e6] rounded-xl transition-colors">Profile</button>
                                        {user.role === 'seller' && (
                                            <button onClick={() => navigate('/seller/dashboard')} className="w-full text-left px-4 py-3 text-base font-medium text-[var(--athenic-teal)] hover:bg-teal-50 rounded-xl transition-colors">Seller Hub</button>
                                        )}
                                        {user.role === 'admin' && (
                                            <button onClick={() => navigate('/admin/dashboard')} className="w-full text-left px-4 py-3 text-base font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors">🛡️ Admin Panel</button>
                                        )}
                                        <button onClick={logout} className="w-full text-left px-4 py-3 text-base font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors mt-2">Logout</button>
                                    </>
                                ) : (
                                    <button onClick={() => navigate('/login')} className="w-full text-left px-4 py-3 text-base font-medium text-[#FF5A5F] hover:bg-[#fae6e6] rounded-xl transition-colors">Login / Register</button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Search Dropdown Animation Styles */}
            <style>{`
                @keyframes searchDropdownSlide {
                    from { opacity: 0; transform: translateY(-4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </header>
    );
};

export default Navbar;
