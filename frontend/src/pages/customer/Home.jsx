import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { productService, shopService, couponService } from '../../services/api';
import { ChevronLeftIcon, ChevronRightIcon, HeartIcon, GiftIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import CouponBanner from '../../components/customer/CouponBanner';
import BannerCarousel from '../../components/customer/BannerCarousel';

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
        { name: 'For Her', icon: '💝', color: 'from-amber-300 to-orange-300', categories: ['Clothing', 'Health & Beauty'] },
        { name: 'For Him', icon: '🎁', color: 'from-blue-400 to-indigo-400', categories: ['Electronics', 'Sports & Fitness'] },
        { name: 'Gifts', icon: '🎀', color: 'from-amber-400 to-yellow-400', categories: ['Other'] },
        { name: 'Chocolates', icon: '🍫', color: 'from-amber-400 to-orange-400', categories: ['Food & Beverages'] },
        { name: 'Flowers', icon: '🌹', color: 'from-rose-400 to-red-400', categories: ['Other'] },
        { name: 'Jewelry', icon: '💍', color: 'from-yellow-400 to-amber-400', categories: ['Other'] },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-beige-50">
            {/* Remove floating hearts for professional look */}




            {/* Banner Carousel Section */}
            <div className="max-w-7xl mx-auto px-4 pt-8">
                <BannerCarousel />
            </div>

            {/* Nearby Shops */}
            <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">
                            Nearby <span className="text-emerald-600">Shops</span>
                        </h2>
                        <p className="text-gray-600 mt-1">
                            {nearbyShops.length > 0 ? `${nearbyShops.length} shops near you` : 'Discover shops around your neighborhood'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {shopsLoading ? (
                        [1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
                                <div className="h-48 bg-gradient-to-r from-gray-100 to-gray-200"></div>
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
                                <div className="h-48 bg-gradient-to-br from-emerald-400 to-blue-500 relative overflow-hidden">
                                    {shop.images?.[0] && (
                                        <img
                                            src={shop.images[0]}
                                            alt={shop.shopName}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                    )}
                                    <div className="absolute top-3 right-3">
                                        <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition">
                                            <HeartIcon className="w-5 h-5 text-gray-400 hover:text-red-500 transition" />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{shop.shopName}</h3>
                                        {shop.distance && (
                                            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded-full">
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
                            Trending <span className="text-emerald-600">Products</span>
                        </h2>
                        <p className="text-gray-600 mt-1">Most popular items this season</p>
                    </div>
                    <button
                        onClick={() => navigate('/products')}
                        className="text-emerald-600 font-semibold hover:text-emerald-700 flex items-center space-x-1"
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
                            <div className="relative h-52 bg-gray-100">
                                <img
                                    src={product.images?.[0] || '/placeholder.png'}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                <button className="absolute top-3 right-3 bg-white p-2 rounded-full hover:bg-gray-50 transition-colors shadow-md">
                                    <HeartIcon className="w-5 h-5 text-gray-400 hover:text-red-500 transition-all" />
                                </button>
                                {product.discountedPrice && (
                                    <div className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">
                                        {Math.round(((product.price - product.discountedPrice) / product.price) * 100)}% OFF
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                                    {product.name}
                                </h3>
                                <div className="flex items-center mb-3">
                                    <span className="text-yellow-400 text-xs">★★★★★</span>
                                    <span className="text-xs text-gray-500 ml-1">(4.5)</span>
                                </div>
                                <div className="flex items-baseline space-x-2">
                                    <span className="text-lg font-bold text-emerald-600">
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

