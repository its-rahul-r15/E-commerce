import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { shopService } from '../../services/api';

const ShopsList = () => {
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [debugData, setDebugData] = useState(null);

    useEffect(() => {
        fetchShops();
    }, [page]);

    const fetchShops = async () => {
        try {
            setLoading(true);
            const data = await shopService.getPublicShops(page);
            setShops(data.shops || []);
            setPagination(data.pagination);

            // Auto-diagnose if empty
            if (!data.shops || data.shops.length === 0) {
                runDiagnostics();
            }
        } catch (error) {
            console.error('Error fetching shops:', error);
        } finally {
            setLoading(false);
        }
    };

    const runDiagnostics = async () => {
        try {
            const data = await shopService.diagnose();
            setDebugData(data);
        } catch (err) {
            console.error('Diagnostic error:', err);
        }
    };

    const handleFixShops = async () => {
        try {
            setLoading(true);
            await shopService.approveAll();
            alert('Attempted to approve all shops. Refreshing...');
            await fetchShops();
        } catch (err) {
            alert('Fix failed: ' + err.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">All Stores</h1>
                    {/* Add filters if needed */}
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
                    </div>
                ) : shops.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🏪</span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No Stores Found</h3>
                        <p className="text-gray-500 mt-2">Check back later for new sellers!</p>

                        {/* Debug Info Section */}
                        {debugData && (
                            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left max-w-lg mx-auto">
                                <h4 className="font-bold text-yellow-800 mb-2">🔧 Diagnostic Info (Dev Mode)</h4>
                                <p className="text-sm">Total Shops in DB: <strong>{debugData.total}</strong></p>
                                <div className="text-sm mt-1">
                                    Statuses:
                                    {debugData.byStatus.map(s => (
                                        <span key={s._id} className="ml-2 px-2 py-0.5 bg-white rounded border text-xs">
                                            {s._id}: {s.count}
                                        </span>
                                    ))}
                                </div>
                                <div className="mt-4">
                                    {debugData.total > 0 ? (
                                        <button
                                            onClick={handleFixShops}
                                            className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700 transition w-full"
                                        >
                                            Fix Database (Approve All Shops)
                                        </button>
                                    ) : (
                                        <p className="text-red-600 text-sm font-bold">Database is empty! Create a shop first.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {shops.map((shop) => (
                            <Link
                                key={shop._id}
                                to={`/shop/${shop._id}`}
                                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group block"
                            >
                                <div className="relative h-48 bg-emerald-50">
                                    <img
                                        src={shop.images?.[0] || '/placeholder-shop.png'}
                                        alt={shop.shopName}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200?text=Shop+Image'; }}
                                    />
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-sm font-medium text-gray-900 flex items-center shadow-sm">
                                        <span className="text-yellow-400 mr-1">★</span>
                                        {shop.rating?.toFixed(1) || 'New'}
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">
                                        {shop.shopName}
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-3 line-clamp-1">
                                        {shop.address?.city || 'Location unavailable'}
                                    </p>
                                    <div className="flex items-center justify-between mt-4">
                                        <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-medium border border-emerald-100">
                                            {shop.category || 'General'}
                                        </span>
                                        <span className="text-sm text-gray-400">Visit Store →</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

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
            </div>
        </div>
    );
};

export default ShopsList;
