import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminApi';
import { shopService } from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminShops = () => {
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [updating, setUpdating] = useState(false);
    const [selectedShop, setSelectedShop] = useState(null);

    useEffect(() => {
        fetchShops();
    }, [filter]);

    const fetchShops = async () => {
        setLoading(true);
        try {
            console.log('Fetching shops with filter:', filter);
            if (filter === 'pending') {
                const data = await adminService.getPendingShops();
                const shopsArray = data.shops || (Array.isArray(data) ? data : []);
                console.log('Pending shops:', shopsArray);
                setShops(shopsArray);
            } else {
                const data = await shopService.getAllShops();
                console.log('All shops data:', data);
                const shopsArray = Array.isArray(data) ? data : [];
                console.log('Shops array:', shopsArray);
                const filteredShops = filter === 'all'
                    ? shopsArray
                    : shopsArray.filter(s => {
                        console.log(`Shop ${s.shopName} - status:`, s.status, 'filter:', filter, 'match:', s.status === filter);
                        return s.status === filter;
                    });
                console.log('Filtered shops:', filteredShops);
                setShops(filteredShops);
            }
        } catch (error) {
            console.error('Error fetching shops:', error);
            setShops([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (shopId) => {
        setUpdating(true);
        try {
            await adminService.approveShop(shopId);
            fetchShops();
            setSelectedShop(null);
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
            fetchShops();
            setSelectedShop(null);
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
            fetchShops();
            setSelectedShop(null);
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
            fetchShops();
            setSelectedShop(null);
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to unblock shop');
        } finally {
            setUpdating(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-emerald-600';
            case 'pending': return 'bg-yellow-600';
            case 'rejected': return 'bg-red-600';
            case 'blocked': return 'bg-gray-600';
            default: return 'bg-slate-600';
        }
    };

    const getStatusText = (status) => {
        return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';
    };

    return (
        <AdminLayout>
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Shop Management</h1>
                    <p className="text-slate-400 mt-2">Manage shop approvals, status, and settings</p>
                </div>
                <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
                    <span className="text-slate-400 text-sm">Total Shops: </span>
                    <span className="text-white font-bold text-lg">{shops.length}</span>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="bg-slate-800 rounded-2xl p-2 mb-6 inline-flex space-x-2 border border-slate-700">
                {['pending', 'approved', 'rejected', 'blocked', 'all'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${filter === tab
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-slate-400 hover:text-white hover:bg-slate-700'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Shops Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                </div>
            ) : shops.length === 0 ? (
                <div className="bg-slate-800 rounded-2xl p-12 text-center border border-slate-700">
                    <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <p className="text-slate-400 text-lg">No {filter} shops found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {shops.map((shop) => (
                        <div
                            key={shop._id}
                            className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-blue-500 transition-all cursor-pointer"
                            onClick={() => setSelectedShop(shop)}
                        >
                            {/* Shop Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-lg">
                                        {shop.shopName?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{shop.shopName}</h3>
                                        <p className="text-slate-400 text-sm">{shop.category || 'General'}</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 ${getStatusColor(shop.status)} text-white text-xs font-bold rounded-full`}>
                                    {getStatusText(shop.status)}}
                                </span>
                            </div>

                            {/* Shop Details */}
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center text-sm">
                                    <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span className="text-slate-300">{shop.ownerId?.name || shop.ownerId?.email}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="text-slate-300">{shop.location?.city || 'Unknown'}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-slate-300">{new Date(shop.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-2">
                                {shop.approvalStatus === 'pending' && (
                                    <>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleApprove(shop._id);
                                            }}
                                            disabled={updating}
                                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleReject(shop._id);
                                            }}
                                            disabled={updating}
                                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                                {shop.approvalStatus === 'approved' && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleBlock(shop._id);
                                        }}
                                        disabled={updating}
                                        className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                                    >
                                        Block
                                    </button>
                                )}
                                {shop.approvalStatus === 'blocked' && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleUnblock(shop._id);
                                        }}
                                        disabled={updating}
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                                    >
                                        Unblock
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Shop Detail Modal */}
            {selectedShop && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedShop(null)}>
                    <div className="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full border border-slate-700" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">{selectedShop.shopName}</h2>
                                <span className={`px-3 py-1 ${getStatusColor(selectedShop.approvalStatus)} text-white text-xs font-bold rounded-full`}>
                                    {getStatusText(selectedShop.approvalStatus)}
                                </span>
                            </div>
                            <button onClick={() => setSelectedShop(null)} className="text-slate-400 hover:text-white">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-slate-400 text-sm mb-1">Owner</p>
                                    <p className="text-white font-semibold">{selectedShop.ownerId?.name}</p>
                                    <p className="text-slate-400 text-sm">{selectedShop.ownerId?.email}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm mb-1">Category</p>
                                    <p className="text-white font-semibold">{selectedShop.category || 'General'}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm mb-1">Location</p>
                                    <p className="text-white font-semibold">{selectedShop.location?.street}</p>
                                    <p className="text-slate-400 text-sm">{selectedShop.location?.city}, {selectedShop.location?.state}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm mb-1">Registered On</p>
                                    <p className="text-white font-semibold">{new Date(selectedShop.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {selectedShop.description && (
                                <div>
                                    <p className="text-slate-400 text-sm mb-1">Description</p>
                                    <p className="text-white">{selectedShop.description}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminShops;
