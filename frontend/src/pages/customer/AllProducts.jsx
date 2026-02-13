import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../../services/api';
import ProductCard from '../../components/customer/ProductCard';
import FilterPanel from '../../components/common/FilterPanel';

const AllProducts = () => {
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({});
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(1);
    const [debugData, setDebugData] = useState(null);
    const [queryDebug, setQueryDebug] = useState(null);

    const handleDebug = async () => {
        try {
            const data = await productService.debugGetAllProducts();
            setDebugData(data);
        } catch (err) {
            alert('Debug failed: ' + err.message);
        }
    };

    const handleCheckQuery = async () => {
        try {
            const data = await productService.debugVerifyQuery(filters);
            setQueryDebug(data);
        } catch (err) {
            alert('Query Check failed: ' + err.message);
        }
    };

    useEffect(() => {
        // Pre-fill filters from URL if needed (optional enhancement)
        fetchProducts();
    }, [page, filters]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            console.log('Fetching products with filters:', filters);
            const data = await productService.getProducts({
                ...filters,
                page
            });
            console.log('Received data:', data);
            setProducts(data.data || []);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (newFilters) => {
        console.log('Filter changed in AllProducts:', newFilters);
        setFilters(newFilters);
        setPage(1); // Reset to first page on filter change
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <div className="w-full lg:w-64 flex-shrink-0">
                        <FilterPanel
                            onFilterChange={handleFilterChange}
                            onClearFilters={() => setFilters({})}
                        />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Explore Products
                            </h1>
                            <span className="text-sm text-gray-500">
                                Showing {products.length} results
                            </span>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-xl h-80 animate-pulse"></div>
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">🔍</span>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">No products found</h3>
                                <p className="text-gray-500 mt-2">Try adjusting your filters</p>
                                <button
                                    onClick={handleDebug}
                                    className="mt-4 mr-4 text-sm text-emerald-600 hover:underline"
                                >
                                    Troubleshoot (Dev Mode)
                                </button>
                                <button
                                    onClick={handleCheckQuery}
                                    className="mt-4 text-sm text-blue-600 hover:underline"
                                >
                                    Check Query
                                </button>

                                {queryDebug && (
                                    <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded text-left text-xs overflow-auto max-h-60">
                                        <h4 className="font-bold mb-2">Query Inspector:</h4>
                                        <pre>{JSON.stringify(queryDebug, null, 2)}</pre>
                                    </div>
                                )}

                                {debugData && (
                                    <div className="mt-4 p-4 bg-gray-100 rounded text-left text-xs overflow-auto max-h-60">
                                        <h4 className="font-bold mb-2">Raw Products (Limit 100):</h4>
                                        <pre>{JSON.stringify(debugData, null, 2)}</pre>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {products.map((product) => (
                                        <ProductCard key={product._id} product={product} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {pagination && pagination.pages > 1 && (
                                    <div className="flex justify-center mt-12 space-x-2">
                                        <button
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="px-4 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                                        >
                                            Previous
                                        </button>
                                        <span className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg font-medium border border-emerald-100">
                                            Page {page} of {pagination.pages}
                                        </span>
                                        <button
                                            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                                            disabled={page === pagination.pages}
                                            className="px-4 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AllProducts;
