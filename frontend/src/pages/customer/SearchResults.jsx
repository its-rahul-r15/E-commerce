import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { productService } from '../../services/api';

const SearchResults = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');

    useEffect(() => {
        const searchQuery = searchParams.get('q');
        if (searchQuery) {
            setQuery(searchQuery);
            handleSearch(searchQuery);
        } else {
            navigate('/');
        }
    }, [searchParams]);

    const handleSearch = async (searchQuery) => {
        try {
            setLoading(true);
            const data = await productService.searchProducts(searchQuery, 1, 20);
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
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Search Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Search Results for "{query}"
                    </h1>
                    <p className="text-gray-600">
                        {products.length} {products.length === 1 ? 'product' : 'products'} found
                    </p>
                </div>

                {/* Results */}
                {products.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-gray-400 mb-4">
                            <svg className="mx-auto h-24 w-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                        <p className="text-gray-600 mb-6">Try different keywords or browse all products</p>
                        <button onClick={() => navigate('/')} className="bg-emerald-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-600 transition-colors">
                            Browse All Products
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {products.map((product) => (
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
                                            Low Stock
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
                                    <p className="text-xs text-gray-500 mb-2">
                                        {product.shopId?.shopName || 'Shop'}
                                    </p>
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
                )}
            </div>
        </div>
    );
};

export default SearchResults;
