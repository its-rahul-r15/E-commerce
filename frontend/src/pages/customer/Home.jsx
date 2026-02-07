import { useState, useEffect } from 'react';
import { shopService, productService } from '../../services/api';
import ShopCard from '../../components/customer/ShopCard';
import ProductCard from '../../components/customer/ProductCard';

const Home = () => {
    const [nearbyShops, setNearbyShops] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        getUserLocation();
    }, []);

    const getUserLocation = () => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation({ latitude, longitude });
                    fetchNearbyShops(latitude, longitude);
                    fetchProducts();
                },
                (error) => {
                    console.error('Location error:', error);
                    setError('Unable to get your location. Showing all products.');
                    fetchProducts();
                    setLoading(false);
                }
            );
        } else {
            setError('Location not supported. Showing all products.');
            fetchProducts();
            setLoading(false);
        }
    };

    const fetchNearbyShops = async (lat, lng) => {
        try {
            const data = await shopService.getNearbyShops(lat, lng);
            setNearbyShops(data.shops || []);
        } catch (error) {
            console.error('Error fetching shops:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const data = await productService.getProducts({ limit: 20 });
            setProducts(data || []); // data is already the products array
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section - Clean Design */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Discover Local Shops Near You
                        </h1>
                        <p className="text-lg text-gray-600 mb-6">
                            Shop from nearby stores within 5km radius
                        </p>
                        {location && (
                            <div className="inline-flex items-center space-x-2 bg-primary/5 text-primary px-4 py-2 rounded-lg">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="font-medium">Showing shops near your location</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Error Message */}
                {error && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <p className="text-yellow-800">{error}</p>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                        <p className="mt-4 text-gray-600">Loading shops and products...</p>
                    </div>
                )}

                {!loading && (
                    <>
                        {/* Nearby Shops Section */}
                        {nearbyShops.length > 0 && (
                            <section className="mb-16">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-3xl font-bold text-gray-900 mb-1">
                                            Shops Near You
                                        </h2>
                                        <p className="text-gray-600">
                                            {nearbyShops.length} shops found within 5km
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {nearbyShops.map((shop) => (
                                        <ShopCard key={shop._id} shop={shop} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Products Section */}
                        <section>
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900 mb-1">
                                        {nearbyShops.length > 0 ? 'Featured Products' : 'All Products'}
                                    </h2>
                                    <p className="text-gray-600">
                                        Browse products from local shops
                                    </p>
                                </div>
                            </div>

                            {products.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-lg">
                                    <svg
                                        className="mx-auto h-12 w-12 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                        />
                                    </svg>
                                    <p className="mt-4 text-gray-600">No products available yet</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {products.map((product) => (
                                        <ProductCard key={product._id} product={product} />
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )
                }
            </div >
        </div >
    );
};

export default Home;
