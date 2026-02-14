import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { productService, shopService, couponService } from '../../services/api';
import { ChevronLeftIcon, ChevronRightIcon, HeartIcon, GiftIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import CouponBanner from '../../components/customer/CouponBanner';

const Home = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [nearbyShops, setNearbyShops] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [shopsLoading, setShopsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [userLocation, setUserLocation] = useState(null);


    useEffect(() => {
        getUserLocation();
        fetchCoupons();
        const query = searchParams.get('q');
        if (query) {
            setSearchQuery(query);
            handleSearchProducts(query);
        } else {
            fetchData();
        }
    }, [selectedCategory]);


    const getUserLocation = useCallback(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation({ latitude, longitude });
                    fetchNearbyShops(latitude, longitude);
                },
                (error) => {
                    console.error('Location error:', error);
                    fetchAllShops();
                }
            );
        } else {
            fetchAllShops();
        }
    }, []);

    const fetchNearbyShops = async (lat, lng) => {
        try {
            setShopsLoading(true);
            const data = await shopService.getNearbyShops(lat, lng);
            setNearbyShops(data?.shops || []);
        } catch (error) {
            console.error('Error fetching nearby shops:', error);
            setNearbyShops([]);
        } finally {
            setShopsLoading(false);
        }
    };

    const fetchAllShops = async () => {
        try {
            setShopsLoading(true);
            const data = await shopService.getAllShops();
            setNearbyShops((data.shops || []).slice(0, 4));
        } catch (error) {
            console.error('Error fetching shops:', error);
        } finally {
            setShopsLoading(false);
        }
    };

    const fetchCoupons = async () => {
        try {
            const data = await couponService.getActiveCoupons();
            setCoupons((data || []).slice(0, 3)); // Get top 3 active coupons
        } catch (error) {
            console.error('Error fetching coupons:', error);
            setCoupons([]);
        }
    };


    const fetchData = async () => {
        try {
            const params = selectedCategory === 'All' ? {} : { category: selectedCategory };
            const data = await productService.getProducts({ ...params, limit: 20 });
            setProducts(data?.data || []);
        } catch (error) {
            console.error('Error:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchProducts = async (query) => {
        try {
            setLoading(true);
            const data = await productService.searchProducts(query, 1, 20);
            const productsArray = Array.isArray(data) ? data : (data.products || []);
            setProducts(productsArray);
        } catch (error) {
            console.error('Error searching:', error);
        } finally {
            setLoading(false);
        }
    };

    const valentineCategories = [
        { name: 'For Her', icon: '💝', color: 'from-pink-400 to-rose-400', categories: ['Clothing', 'Health & Beauty'] },
        { name: 'For Him', icon: '🎁', color: 'from-blue-400 to-indigo-400', categories: ['Electronics', 'Sports & Fitness'] },
        { name: 'Gifts', icon: '🎀', color: 'from-purple-400 to-pink-400', categories: ['Other'] },
        { name: 'Chocolates', icon: '🍫', color: 'from-amber-400 to-orange-400', categories: ['Food & Beverages'] },
        { name: 'Flowers', icon: '🌹', color: 'from-rose-400 to-red-400', categories: ['Other'] },
        { name: 'Jewelry', icon: '💍', color: 'from-yellow-400 to-amber-400', categories: ['Other'] },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
                <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-500 border-t-transparent"></div>
                    <HeartSolidIcon className="w-6 h-6 text-rose-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
            {/* Floating Hearts Animation */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute animate-float-heart"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${8 + Math.random() * 4}s`,
                            opacity: 0.1 + Math.random() * 0.2
                        }}
                    >
                        <HeartSolidIcon className="w-8 h-8 text-rose-400" />
                    </div>
                ))}
            </div>











            {/* Valentine's Special Deals */}
            <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
                <div className="bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 rounded-3xl p-8 text-white overflow-hidden relative shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-600/20 rounded-full blur-2xl"></div>

                    <div className="relative flex flex-col lg:flex-row items-center justify-between">
                        <div className="flex-1 mb-6 lg:mb-0">
                            <div className="flex items-center space-x-2 mb-4">
                                <HeartSolidIcon className="w-6 h-6 text-yellow-300 animate-pulse" />
                                <p className="text-sm font-semibold bg-white/20 backdrop-blur-sm rounded-full px-4 py-1">
                                    LIMITED TIME ONLY
                                </p>
                            </div>
                            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                                Valentine's Day Sale
                                <span className="block text-yellow-300">Up to 60% Off!</span>
                            </h2>
                            <p className="text-lg text-white/90 mb-6 max-w-2xl">
                                Show your love without breaking the bank. Huge discounts on flowers, chocolates, jewelry, and romantic gifts from local sellers.
                            </p>

                            <div className="flex items-center space-x-6 mb-6">
                                <div className="text-center">
                                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-3 min-w-[80px]">
                                        <div className="text-3xl font-bold">00</div>
                                        <div className="text-xs opacity-75">DAYS</div>
                                    </div>
                                </div>
                                <div className="text-2xl">:</div>
                                <div className="text-center">
                                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-3 min-w-[80px]">
                                        <div className="text-3xl font-bold">14</div>
                                        <div className="text-xs opacity-75">HOURS</div>
                                    </div>
                                </div>
                                <div className="text-2xl">:</div>
                                <div className="text-center">
                                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-3 min-w-[80px]">
                                        <div className="text-3xl font-bold">00</div>
                                        <div className="text-xs opacity-75">MINS</div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/products')}
                                className="bg-white text-rose-600 font-bold px-8 py-4 rounded-full hover:bg-rose-50 transition-all shadow-lg hover:shadow-xl hover:scale-105 inline-flex items-center space-x-2"
                            >
                                <GiftIcon className="w-5 h-5" />
                                <span>Shop Valentine's Sale</span>
                            </button>
                        </div>

                        <div className="hidden lg:block">
                            <div className="relative w-72 h-72">
                                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full opacity-50 blur-2xl animate-pulse"></div>
                                <div className="relative flex items-center justify-center h-full">
                                    <div className="text-9xl animate-bounce">💖</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Nearby Shops */}
            <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">
                            Nearby <span className="bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">Love Shops</span>
                        </h2>
                        <p className="text-gray-600 mt-1">
                            {nearbyShops.length > 0 ? `${nearbyShops.length} romantic shops near you` : 'Discover love around your neighborhood'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {shopsLoading ? (
                        [1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
                                <div className="h-48 bg-gradient-to-r from-pink-200 to-rose-200"></div>
                                <div className="p-5">
                                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                </div>
                            </div>
                        ))
                    ) : nearbyShops.length > 0 ? (
                        nearbyShops.slice(0, 4).map((shop) => (
                            <div
                                key={shop._id}
                                onClick={() => navigate(`/shop/${shop._id}`)}
                                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group hover:scale-105"
                            >
                                <div className="h-48 bg-gradient-to-r from-rose-400 to-pink-400 relative overflow-hidden">
                                    {shop.images?.[0] && (
                                        <img
                                            src={shop.images[0]}
                                            alt={shop.shopName}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                    )}
                                    <div className="absolute top-3 right-3">
                                        <HeartIcon className="w-6 h-6 text-white hover:fill-current transition-all" />
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-bold text-gray-900 group-hover:text-rose-600 transition-colors">{shop.shopName}</h3>
                                        {shop.distance && (
                                            <span className="text-xs text-rose-600 font-semibold bg-rose-50 px-2 py-1 rounded-full">
                                                {shop.distance.toFixed(1)} km
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 mb-3">{shop.location?.city || 'Local Shop'}</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-1">
                                            <span className="text-yellow-400">⭐</span>
                                            <span className="text-sm font-semibold text-gray-900">{shop.rating || 4.5}</span>
                                        </div>
                                        <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                                            Open Now
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        [1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg">
                                <div className="h-48 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse"></div>
                                <div className="p-5">
                                    <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                                    <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Trending Valentine's Products */}
            <div className="max-w-7xl mx-auto px-4 py-8 pb-16 relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">
                            Trending <span className="bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">Love Gifts</span>
                        </h2>
                        <p className="text-gray-600 mt-1">Most loved gifts this Valentine's season</p>
                    </div>
                    <button
                        onClick={() => navigate('/products')}
                        className="text-rose-600 font-semibold hover:text-rose-700 flex items-center space-x-1"
                    >
                        <span>View All</span>
                        <ChevronRightIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {products.slice(0, 10).map((product) => (
                        <div
                            key={product._id}
                            onClick={() => navigate(`/product/${product._id}`)}
                            className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group hover:scale-105"
                        >
                            <div className="relative h-52 bg-gradient-to-br from-pink-100 to-rose-100">
                                <img
                                    src={product.images?.[0] || '/placeholder.png'}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                <button className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-rose-50 transition-colors">
                                    <HeartIcon className="w-5 h-5 text-rose-500 hover:fill-current transition-all" />
                                </button>
                                {product.discountedPrice && (
                                    <div className="absolute top-3 left-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                                        {Math.round(((product.price - product.discountedPrice) / product.price) * 100)}% OFF
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 group-hover:text-rose-600 transition-colors">
                                    {product.name}
                                </h3>
                                <div className="flex items-center mb-3">
                                    <span className="text-yellow-400 text-xs">★★★★★</span>
                                    <span className="text-xs text-gray-500 ml-1">(4.5)</span>
                                </div>
                                <div className="flex items-baseline space-x-2">
                                    <span className="text-lg font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                                        ₹{product.discountedPrice || product.price}
                                    </span>
                                    {product.discountedPrice && (
                                        <span className="text-xs text-gray-400 line-through">
                                            ₹{product.price}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Custom CSS for animations */}
            <style jsx>{`
                @keyframes float-heart {
                    0% {
                        transform: translateY(100vh) rotate(0deg);
                    }
                    100% {
                        transform: translateY(-100vh) rotate(360deg);
                    }
                }
                .animate-float-heart {
                    animation: float-heart linear infinite;
                }
            `}</style>
        </div>
    );
};

export default Home;

