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
            case 'approved': return 'bg-[var(--mehron)] border-[var(--gold)]/30';
            case 'pending': return 'bg-[var(--gold-pale)] border-[var(--gold)] text-[var(--mehron)]';
            case 'rejected': return 'bg-red-900 border-red-700 text-white';
            case 'blocked': return 'bg-[var(--charcoal)] border-white/20 text-white/50';
            default: return 'bg-gray-800 border-gray-600 shadow-sm';
        }
    };

    const getStatusText = (status) => {
        return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';
    };

    return (
        <AdminLayout>
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8 meander-pattern pb-1">
                <div>
                    <h1 className="text-3xl font-bold uppercase tracking-widest text-white">Shop Management</h1>
                    <p className="text-[var(--gold)] mt-2 text-[10px] uppercase tracking-[0.2em] font-bold">Manage shop registrations, statuses, and performance</p>
                </div>
                <div className="bg-[var(--mehron)] px-6 py-2 rounded-none border border-[var(--gold)] shadow-lg">
                    <span className="text-[var(--gold)]/70 text-[10px] uppercase tracking-widest font-bold">Total Shops: </span>
                    <span className="text-white font-bold text-lg">{shops.length}</span>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white rounded-none p-2 mb-6 inline-flex space-x-2 border border-[var(--border-mehron)] shadow-sm">
                {['pending', 'approved', 'rejected', 'blocked', 'all'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`px-6 py-2 rounded-none text-[10px] font-bold uppercase tracking-widest transition-all ${filter === tab
                            ? 'bg-[var(--mehron)] text-white shadow-lg border border-[var(--gold)]'
                            : 'text-gray-500 hover:text-[var(--mehron)] hover:bg-[var(--cream)]'
                            }`}
                    >
                        {tab === 'pending' ? 'Pending' : tab.charAt(0).toUpperCase() + tab.slice(1)}
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
                            className="bg-white rounded-none p-6 border border-[var(--border-mehron)] hover:border-[var(--gold)] transition-all cursor-pointer shadow-sm hover:shadow-md group"
                            onClick={() => setSelectedShop(shop)}
                        >
                            {/* Shop Header */}
                            <div className="flex items-start justify-between mb-4 border-b border-[var(--border-mehron)]/10 pb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-[var(--mehron)] text-[var(--gold)] rounded-none flex items-center justify-center font-bold text-lg border border-[var(--gold)]/20 shadow-inner group-hover:scale-105 transition-transform">
                                        {shop.shopName?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[var(--mehron)] text-sm uppercase tracking-wider">{shop.shopName}</h3>
                                        <p className="text-gray-500 text-[9px] uppercase tracking-widest font-bold">{shop.category || 'General'}</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-0.5 border ${getStatusColor(shop.status)} text-[9px] font-bold uppercase tracking-widest rounded-none`}>
                                    {getStatusText(shop.status)}
                                </span>
                            </div>

                            {/* Shop Details */}
                            <div className="space-y-3 mb-4">
                                <div className="flex items-center text-[10px] font-bold uppercase tracking-wider">
                                    <svg className="w-4 h-4 mr-2 text-[var(--gold)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span className="text-gray-600">{shop.ownerId?.name || shop.ownerId?.email}</span>
                                </div>
                                <div className="flex items-center text-[10px] font-bold uppercase tracking-wider">
                                    <svg className="w-4 h-4 mr-2 text-[var(--gold)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="text-gray-600">{shop.location?.city || 'Unknown'}</span>
                                </div>
                                <div className="flex items-center text-[10px] font-bold uppercase tracking-wider">
                                    <svg className="w-4 h-4 mr-2 text-[var(--gold)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-gray-600">Established: {new Date(shop.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {/* Action Buttons — always visible based on current status */}
                            <div className="flex gap-2 mt-1" onClick={e => e.stopPropagation()}>
                                {(shop.status === 'pending' || shop.status === 'rejected') && (
                                    <button
                                        onClick={() => handleApprove(shop._id)}
                                        disabled={updating}
                                        className="flex-1 bg-[var(--mehron)] hover:bg-[var(--mehron-deep)] text-white py-2 border border-[var(--gold)] rounded-none text-[9px] font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                                    >
                                        ✓ Approve
                                    </button>
                                )}
                                {shop.status === 'pending' && (
                                    <button
                                        onClick={() => handleReject(shop._id)}
                                        disabled={updating}
                                        className="flex-1 bg-red-900 hover:bg-red-800 text-white py-2 border border-red-700 rounded-none text-[9px] font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                                    >
                                        ✗ Reject
                                    </button>
                                )}
                                {shop.status === 'approved' && (
                                    <button
                                        onClick={() => handleBlock(shop._id)}
                                        disabled={updating}
                                        className="flex-1 bg-[var(--charcoal)] hover:bg-black text-[var(--gold)] py-2 border border-[var(--gold)]/30 rounded-none text-[9px] font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                                    >
                                        🚫 Exclude
                                    </button>
                                )}
                                {shop.status === 'blocked' && (
                                    <button
                                        onClick={() => handleUnblock(shop._id)}
                                        disabled={updating}
                                        className="flex-1 bg-[var(--mehron)] hover:bg-[var(--mehron-deep)] text-white py-2 border border-[var(--gold)] rounded-none text-[9px] font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                                    >
                                        ✓ Restore
                                    </button>
                                )}
                                {shop.status === 'rejected' && (
                                    <button
                                        onClick={() => handleBlock(shop._id)}
                                        disabled={updating}
                                        className="flex-1 bg-[var(--charcoal)] hover:bg-black text-[var(--gold)] py-2 border border-white/10 rounded-none text-[9px] font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                                    >
                                        🚫 Block
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Shop Detail Modal */}
            {selectedShop && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setSelectedShop(null)}>
                    <div className="bg-white rounded-none p-8 max-w-2xl w-full border border-[var(--gold)] shadow-2xl relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="absolute top-0 left-0 w-full h-1 bg-[var(--mehron)] meander-pattern"></div>
                        <div className="flex items-start justify-between mb-8">
                            <div>
                                <h2 className="text-3xl font-bold text-[var(--mehron)] mb-2 uppercase tracking-widest">{selectedShop.shopName}</h2>
                                <span className={`px-2 py-0.5 border ${getStatusColor(selectedShop.status)} text-[9px] font-bold uppercase tracking-widest rounded-none`}>
                                    {getStatusText(selectedShop.status)}
                                </span>
                            </div>
                            <button onClick={() => setSelectedShop(null)} className="text-[var(--mehron)] hover:scale-110 transition-transform">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mb-1">Owner Name</p>
                                    <p className="text-[var(--mehron)] font-bold text-sm uppercase tracking-wider">{selectedShop.ownerId?.name}</p>
                                    <p className="text-gray-500 font-bold text-[10px]">{selectedShop.ownerId?.email}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mb-1">Category</p>
                                    <p className="text-[var(--mehron)] font-bold text-sm uppercase tracking-wider">{selectedShop.category || 'General'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mb-1">Shop Address</p>
                                    <p className="text-[var(--mehron)] font-bold text-sm uppercase tracking-wider">{selectedShop.location?.street}</p>
                                    <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">{selectedShop.location?.city}, {selectedShop.location?.state}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mb-1">Registered On</p>
                                    <p className="text-[var(--mehron)] font-bold text-sm uppercase tracking-wider">{new Date(selectedShop.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {selectedShop.description && (
                                <div className="border-t border-[var(--border-mehron)]/10 pt-4">
                                    <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mb-2">Shop Description</p>
                                    <p className="text-[var(--mehron)] text-sm font-medium leading-relaxed italic">"{selectedShop.description}"</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="flex gap-3 mt-10 pt-6 border-t border-[var(--border-mehron)]/20">
                            {(selectedShop.status === 'pending' || selectedShop.status === 'rejected') && (
                                <button
                                    onClick={() => handleApprove(selectedShop._id)}
                                    disabled={updating}
                                    className="flex-1 bg-[var(--mehron)] hover:bg-[var(--mehron-deep)] text-white py-4 border border-[var(--gold)] rounded-none font-bold uppercase tracking-[0.2em] transition-all disabled:opacity-50 text-[10px]"
                                >
                                    ✓ Approve Shop
                                </button>
                            )}
                            {selectedShop.status === 'pending' && (
                                <button
                                    onClick={() => handleReject(selectedShop._id)}
                                    disabled={updating}
                                    className="flex-1 bg-red-900 hover:bg-red-800 text-white py-4 border border-red-700 rounded-none font-bold uppercase tracking-[0.2em] transition-all disabled:opacity-50 text-[10px]"
                                >
                                    ✗ Reject Shop
                                </button>
                            )}
                            {selectedShop.status === 'approved' && (
                                <button
                                    onClick={() => handleBlock(selectedShop._id)}
                                    disabled={updating}
                                    className="flex-1 bg-[var(--charcoal)] hover:bg-black text-[var(--gold)] py-4 border border-[var(--gold)]/30 rounded-none font-bold uppercase tracking-[0.2em] transition-all disabled:opacity-50 text-[10px]"
                                >
                                    🚫 Block Shop
                                </button>
                            )}
                            {selectedShop.status === 'blocked' && (
                                <button
                                    onClick={() => handleUnblock(selectedShop._id)}
                                    disabled={updating}
                                    className="flex-1 bg-[var(--mehron)] hover:bg-[var(--mehron-deep)] text-white py-4 border border-[var(--gold)] rounded-none font-bold uppercase tracking-[0.2em] transition-all disabled:opacity-50 text-[10px]"
                                >
                                    ✓ Unblock Shop
                                </button>
                            )}
                            <button
                                onClick={() => setSelectedShop(null)}
                                className="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 rounded-none font-bold uppercase tracking-[0.2em] transition-all text-[10px]"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminShops;
