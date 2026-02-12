import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { productService, shopService } from '../../services/api';
import { ChevronLeftIcon, ChevronRightIcon, ClockIcon } from '@heroicons/react/24/outline';

const Home = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [nearbyShops, setNearbyShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [userLocation, setUserLocation] = useState(null);

    const categories = [
        { name: 'All', icon: '📦', color: 'bg-emerald-500' },
        { name: 'Electronics', icon: '💻', color: 'bg-blue-500' },
        { name: 'Fashion', icon: '👕', color: 'bg-pink-500' },
        { name: 'Groceries', icon: '🛒', color: 'bg-orange-500' },
        { name: 'Furniture', icon: '🛋️', color: 'bg-purple-500' },
        { name: 'Sport', icon: '⚽', color: 'bg-red-500' },
    ];

    const featuredShops = [
        { name: 'Green Garden', rating: 4.7 },
        { name: 'Tech Haven', rating: 4.9 },
        { name: 'Urban Threads', rating: 4.8 },
        { name: 'Home Decor+', rating: 4.2 },
        { name: 'The Baker\'s', rating: 4.9 },
        { name: 'Fashion Co', rating: 4.6 },
    ];

    useEffect(() => {
        getUserLocation();
        const query = searchParams.get('q');
        if (query) {
            setSearchQuery(query);
            handleSearchProducts(query);
        } else {
            fetchData();
        }
    }, [selectedCategory, searchParams]);

    const getUserLocation = () => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation({ latitude, longitude });
                    fetchNearbyShops(latitude, longitude);
                },
                (error) => {
                    console.error('Location error:', error);
                    // Use default location or show all shops
                    fetchAllShops();
                }
            );
        } else {
            fetchAllShops();
        }
    };

    const fetchNearbyShops = async (lat, lng) => {
        try {
            const data = await shopService.getNearbyShops(lat, lng);
            setNearbyShops(data.shops || []);
        } catch (error) {
            console.error('Error fetching nearby shops:', error);
        }
    };

    const fetchAllShops = async () => {
        try {
            const data = await shopService.getAllShops();
            setNearbyShops((data.shops || []).slice(0, 4));
        } catch (error) {
            console.error('Error fetching shops:', error);
        }
    };

    const fetchData = async () => {
        try {
            const params = selectedCategory === 'All' ? {} : { category: selectedCategory };
            const data = await productService.getProducts({ ...params, limit: 20 });
            setProducts(data.products || data || []);
        } catch (error) {
            console.error('Error:', error);
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Nearby Shops Section */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Nearby Shops</h2>
                        <p className="text-sm text-gray-500">
                            {nearbyShops.length > 0
                                ? `${nearbyShops.length} shops found near you`
                                : 'Discover shops around your neighborhood'}
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <button className="p-2 border rounded-full hover:bg-gray-100">
                            <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                        <button className="p-2 border rounded-full hover:bg-gray-100">
                            <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {nearbyShops.length > 0 ? (
                        nearbyShops.slice(0, 4).map((shop) => (
                            <div
                                key={shop._id}
                                onClick={() => navigate(`/shop/${shop._id}`)}
                                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                            >
                                <div className="h-40 bg-gradient-to-r from-emerald-400 to-cyan-400 relative">
                                    {shop.images?.[0] && (
                                        <img
                                            src={shop.images[0]}
                                            alt={shop.shopName}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-bold text-gray-900">{shop.shopName}</h3>
                                        {shop.distance && (
                                            <span className="text-xs text-emerald-600 font-medium">
                                                {shop.distance.toFixed(1)} km
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mb-2">
                                        {shop.location?.city || 'Local Shop'}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-1">
                                            <span className="text-sm">⭐</span>
                                            <span className="text-sm font-medium">
                                                {shop.rating || 4.5}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                                                Open Now
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        // Placeholder when no shops found
                        [1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
                                <div className="h-40 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse"></div>
                                <div className="p-4">
                                    <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                                    <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Deal of the Day Banner */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-8 text-white overflow-hidden relative">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-medium mb-2 opacity-90">DEAL OF THE DAY</p>
                            <h2 className="text-4xl font-bold mb-3">Flash Sale: Up to<br />60% Off</h2>
                            <p className="text-sm opacity-90 mb-6 max-w-md">
                                Get the best tech gadgets from top-rated local vendors. Valid only for today.
                            </p>
                            <div className="flex items-center space-x-6 mb-6">
                                <div className="text-center">
                                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                                        <div className="text-2xl font-bold">12</div>
                                        <div className="text-xs opacity-75">HOURS</div>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                                        <div className="text-2xl font-bold">45</div>
                                        <div className="text-xs opacity-75">MINS</div>
                                    </div>
                                </div>
                            </div>
                            <button className="bg-white text-emerald-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors">
                                Shop Now
                            </button>
                        </div>
                        <div className="hidden lg:block">
                            <div className="w-80 h-80 bg-gradient-to-br from-orange-400 to-orange-500 rounded-3xl rotate-12 flex items-center justify-center">
                                <div className="text-8xl -rotate-12">🎧</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trending Products */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Trending Products</h2>
                    <div className="flex space-x-4">
                        <button className="text-emerald-500 font-medium hover:text-emerald-600">All Sellers</button>
                        <button className="text-gray-500 font-medium hover:text-gray-700">Top Rated</button>
                        <button className="text-gray-500 font-medium hover:text-gray-700">Newest</button>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {products.slice(0, 10).map((product) => (
                        <div
                            key={product._id}
                            onClick={() => navigate(`/product/${product._id}`)}
                            className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                        >
                            <div className="relative h-48 bg-gray-100">
                                <img
                                    src={product.images?.[0] || '/placeholder.png'}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                {product.stock < 10 && (
                                    <span className="absolute top-2 left-2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded">
                                        New Stock
                                    </span>
                                )}
                                {product.discountedPrice && (
                                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                        -{Math.round(((product.price - product.discountedPrice) / product.price) * 100)}%
                                    </span>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                                    {product.name}
                                </h3>
                                <div className="flex items-center mb-2">
                                    <span className="text-xs text-gray-500">⭐ 4.5</span>
                                </div>
                                <div className="flex items-baseline space-x-2">
                                    <span className="text-lg font-bold text-gray-900">
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
        </div>
    );
};

export default Home;
