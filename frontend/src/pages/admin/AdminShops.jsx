import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminApi';
import { shopService } from '../../services/api';

const AdminShops = () => {
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchShops();
    }, [filter]);

    const fetchShops = async () => {
        try {
            if (filter === 'pending') {
                const data = await adminService.getPendingShops();
                // Handle response format from getPendingShops which is { shops: [], count: X }
                const shopsArray = data.shops || (Array.isArray(data) ? data : []);
                setShops(shopsArray);
            } else {
                const data = await shopService.getAllShops();
                const shopsArray = Array.isArray(data) ? data : [];
                const filteredShops = filter === 'all'
                    ? shopsArray
                    : shopsArray.filter(s => s.status === filter);
                setShops(filteredShops);
            }
        } catch (error) {
            console.error('Error fetching shops:', error);
            setShops([]); // Ensure shops is always an array on error
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (shopId) => {
        setUpdating(true);
        try {
            await adminService.approveShop(shopId);
            alert('Shop approved successfully');
            fetchShops();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to approve shop');
        } finally {
            setUpdating(false);
        }
    };

    const handleReject = async (shopId) => {
        if (!confirm('Reject this shop? The seller will need to re-register.')) return;
        setUpdating(true);
        try {
            await adminService.rejectShop(shopId);
            alert('Shop rejected');
            fetchShops();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to reject shop');
        } finally {
            setUpdating(false);
        }
    };

    const handleBlock = async (shopId) => {
        if (!confirm('Block this shop? It will be hidden from customers.')) return;
        setUpdating(true);
        try {
            await adminService.blockShop(shopId);
            alert('Shop blocked');
            fetchShops();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to block shop');
        } finally {
            setUpdating(false);
        }
    };

    const handleUnblock = async (shopId) => {
        setUpdating(true);
        try {
            await adminService.unblockShop(shopId);
            alert('Shop unblocked');
            fetchShops();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to unblock shop');
        } finally {
            setUpdating(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            blocked: 'bg-gray-100 text-gray-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Shop Management</h1>

                {/* Filter Tabs */}
                <div className="bg-white rounded-lg shadow-sm mb-6">
                    <div className="flex overflow-x-auto">
                        {['pending', 'approved', 'rejected', 'blocked', 'all'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-6 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${filter === status
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Shops List */}
                {shops.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <p className="text-gray-600">No shops found</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {shops.map((shop) => (
                            <div key={shop._id} className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-4">
                                        <img
                                            src={shop.images?.[0] || '/placeholder-shop.png'}
                                            alt={shop.shopName}
                                            className="w-20 h-20 object-cover rounded"
                                        />
                                        <div>
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900">{shop.shopName}</h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(shop.status)}`}>
                                                    {shop.status.toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">{shop.description}</p>
                                            <p className="text-xs text-gray-500">
                                                Category: {shop.category} | Phone: {shop.phone}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Owner: {shop.sellerId?.name} ({shop.sellerId?.email})
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {shop.address?.street}, {shop.address?.city}, {shop.address?.state} - {shop.address?.pincode}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Rating: {shop.rating?.toFixed(1) || 'N/A'} ⭐ | Registered: {new Date(shop.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex space-x-3">
                                        {shop.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(shop._id)}
                                                    disabled={updating}
                                                    className="btn-primary disabled:opacity-50"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(shop._id)}
                                                    disabled={updating}
                                                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        {shop.status === 'approved' && (
                                            <button
                                                onClick={() => handleBlock(shop._id)}
                                                disabled={updating}
                                                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"
                                            >
                                                Block
                                            </button>
                                        )}
                                        {shop.status === 'blocked' && (
                                            <button
                                                onClick={() => handleUnblock(shop._id)}
                                                disabled={updating}
                                                className="btn-primary disabled:opacity-50"
                                            >
                                                Unblock
                                            </button>
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

export default AdminShops;
