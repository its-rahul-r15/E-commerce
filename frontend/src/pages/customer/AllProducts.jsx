import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../../services/api';
import ProductCard from '../../components/customer/ProductCard';
import FilterPanel from '../../components/common/FilterPanel';

const AllProducts = () => {
    const [searchParams, setSearchParams] = useSearchParams();
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
        window.scrollTo(0, 0);
        // Sync filters from URL on component mount
        const urlCategories = searchParams.get('categories') || searchParams.get('category');
        const urlMinPrice = searchParams.get('minPrice');
        const urlMaxPrice = searchParams.get('maxPrice');
        const urlSort = searchParams.get('sort');
        const urlStyle = searchParams.get('style');
        const urlSizes = searchParams.get('sizes');
        const urlColors = searchParams.get('colors');

        const initialFilters = {};
        if (urlCategories) initialFilters.categories = urlCategories.split(',');
        if (urlMinPrice) initialFilters.minPrice = urlMinPrice;
        if (urlMaxPrice) initialFilters.maxPrice = urlMaxPrice;
        if (urlSort) initialFilters.sort = urlSort;
        if (urlStyle) initialFilters.style = urlStyle;
        if (urlSizes) initialFilters.sizes = urlSizes.split(',');
        if (urlColors) initialFilters.colors = urlColors.split(',');

        setFilters(initialFilters);
    }, [searchParams]);

    useEffect(() => {
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
        const nextParams = new URLSearchParams();

        // Sync new filters to URL
        if (newFilters.categories?.length) nextParams.set('categories', newFilters.categories.join(','));
        if (newFilters.minPrice) nextParams.set('minPrice', newFilters.minPrice);
        if (newFilters.maxPrice) nextParams.set('maxPrice', newFilters.maxPrice);
        if (newFilters.sort) nextParams.set('sort', newFilters.sort);
        if (newFilters.style) nextParams.set('style', newFilters.style);
        if (newFilters.sizes?.length) nextParams.set('sizes', newFilters.sizes.join(','));
        if (newFilters.colors?.length) nextParams.set('colors', newFilters.colors.join(','));

        setSearchParams(nextParams);
        setPage(1); // Reset to first page
    };

    return (
        <div className="min-h-screen bg-white pb-20 pt-6">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                
                {/* Header Area */}
                <div className="mb-6">
                    <nav className="text-[10px] md:text-xs text-gray-500 mb-6 flex items-center space-x-2 font-medium tracking-wide">
                        <span className="hover:text-gray-900 cursor-pointer">Home</span>
                        <span>&gt;</span>
                        <span className="text-gray-900 capitalize">{searchParams.get('category') || 'All Products'}</span>
                    </nav>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-6">
                        <h1 className="text-2xl md:text-3xl font-serif text-gray-900 uppercase tracking-widest flex items-center md:items-end gap-3">
                            {searchParams.get('category') || 'WOMEN'} 
                            <span className="text-[11px] md:text-xs font-sans text-gray-400 lowercase font-normal tracking-normal md:mb-1">
                                - {products.length} products
                            </span>
                        </h1>
                        
                        {/* Sort Dropdown */}
                        <div className="flex items-center space-x-3 bg-gray-100 px-4 py-2.5 text-[11px] font-semibold text-gray-800">
                            <span className="tracking-widest uppercase">Sort By</span>
                            <select
                                value={filters.sort || ""}
                                onChange={(e) => {
                                    const nextFilters = { ...filters, sort: e.target.value };
                                    setFilters(nextFilters);
                                    handleFilterChange(nextFilters);
                                }}
                                className="bg-transparent border-none outline-none cursor-pointer tracking-wider focus:ring-0"
                            >
                                <option value="">Popular</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                                <option value="newest">Newest First</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start pt-2">
                    {/* Sidebar Filters */}
                    <div className="w-full lg:w-[260px] flex-shrink-0 sticky top-4 max-h-[90vh] overflow-y-auto no-scrollbar">
                        <FilterPanel
                            onFilterChange={handleFilterChange}
                            onClearFilters={() => setFilters({})}
                            initialFilters={filters}
                        />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 w-full">
                        {loading ? (
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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
                                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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
