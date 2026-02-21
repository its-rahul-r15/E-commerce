import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [pendingShops, setPendingShops] = useState([]);
    const [approvedShops, setApprovedShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsData, pendingShopsData, approvedShopsData] = await Promise.all([
                adminService.getStatistics(),
                adminService.getPendingShops(),
                adminService.getApprovedShops()
            ]);

            setStats(statsData?.statistics || statsData);
            setPendingShops(pendingShopsData?.shops || pendingShopsData || []);
            setApprovedShops(approvedShopsData?.shops || approvedShopsData || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--gold)] border-t-transparent"></div>
                    <p className="mt-4 text-[var(--gold)] font-serif text-[10px] uppercase tracking-widest font-bold">Loading Dashboard...</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            {/* Page Header */}
            <div className="mb-8 meander-pattern pb-1">
                <h1 className="text-3xl font-bold uppercase tracking-widest text-white">Dashboard Overview</h1>
                <p className="text-[var(--gold)] mt-2 text-[10px] uppercase tracking-[0.2em] font-bold">Monitor platform performance and metrics</p>
            </div>

            {/* Metrics Cards - ONLY REAL DATA */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {/* Total Users */}
                <div className="bg-white rounded-none p-6 border border-[var(--border-mehron)] shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-[var(--mehron-soft)] rounded-none flex items-center justify-center border border-[var(--gold)]/20 shadow-inner">
                            <svg className="w-6 h-6 text-[var(--mehron)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold mb-2">Total Users</p>
                    <p className="text-3xl font-bold text-[var(--mehron)]">{stats?.totalUsers || 0}</p>
                </div>

                {/* Total Shops */}
                <div className="bg-white rounded-none p-6 border border-[var(--border-mehron)] shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-[var(--gold-pale)] rounded-none flex items-center justify-center border border-[var(--gold)]/20 shadow-inner">
                            <svg className="w-6 h-6 text-[var(--mehron)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold mb-2">Active Shops</p>
                    <p className="text-3xl font-bold text-[var(--mehron)]">{stats?.approvedShops || 0}</p>
                </div>

                {/* Total Orders */}
                <div className="bg-white rounded-none p-6 border border-[var(--border-mehron)] shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-[var(--mehron-soft)] rounded-none flex items-center justify-center border border-[var(--gold)]/20 shadow-inner">
                            <svg className="w-6 h-6 text-[var(--mehron)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold mb-2">Total Orders</p>
                    <p className="text-3xl font-bold text-[var(--mehron)]">{stats?.totalOrders || 0}</p>
                </div>

                {/* Total Products */}
                <div className="bg-white rounded-none p-6 border border-[var(--border-mehron)] shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-[var(--gold-pale)] rounded-none flex items-center justify-center border border-[var(--gold)]/20 shadow-inner">
                            <svg className="w-6 h-6 text-[var(--mehron)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold mb-2">Total Products</p>
                    <p className="text-3xl font-bold text-[var(--mehron)]">{stats?.totalProducts || 0}</p>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Shops List */}
                <div className="bg-white rounded-none p-6 border border-[var(--border-mehron)] shadow-sm">
                    <div className="flex items-center justify-between mb-6 border-b border-[var(--border-mehron)] pb-3">
                        <h3 className="text-sm font-bold text-[var(--mehron)] uppercase tracking-widest">Active Shops</h3>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{approvedShops.length} Total</span>
                    </div>
                    <div className="space-y-3">
                        {approvedShops.length > 0 ? (
                            approvedShops.slice(0, 5).map((shop, idx) => {
                                const colors = ['bg-purple-500', 'bg-orange-500', 'bg-emerald-500', 'bg-pink-500', 'bg-blue-500'];
                                const color = colors[idx % colors.length];

                                return (
                                    <div key={shop._id} className="flex items-center justify-between p-3 bg-[var(--cream)]/30 border border-[var(--border-mehron)]/10 rounded-none hover:bg-[var(--gold-pale)] transition-colors cursor-pointer group"
                                        onClick={() => navigate('/admin/shops')}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-[var(--mehron)] text-[var(--gold)] rounded-none flex items-center justify-center font-bold text-sm border border-[var(--gold)]/20 shadow-md transition-transform group-hover:scale-105">
                                                {shop.shopName?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-[var(--mehron)] text-xs uppercase tracking-wider">{shop.shopName}</p>
                                                <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">{shop.category || 'General'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] text-[var(--mehron)] font-bold uppercase tracking-widest bg-[var(--gold-pale)] px-2 py-0.5 border border-[var(--gold)]/20">Active</p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-8 text-slate-400">
                                <p className="text-sm">No active shops yet</p>
                            </div>
                        )}
                        {approvedShops.length > 0 && (
                            <button
                                onClick={() => navigate('/admin/shops')}
                                className="w-full mt-4 px-4 py-3 bg-[var(--mehron)] hover:bg-[var(--mehron-deep)] text-white text-[10px] uppercase tracking-[0.2em] font-bold rounded-none border border-[var(--gold)] transition-all shadow-md shadow-[var(--mehron)]/10"
                            >
                                VIEW ALL SHOPS
                            </button>
                        )}
                    </div>
                </div>

                {/* Pending Approvals */}
                <div className="bg-white rounded-none p-6 border border-[var(--border-mehron)] shadow-sm">
                    <div className="flex items-center justify-between mb-6 border-b border-[var(--border-mehron)] pb-3">
                        <h3 className="text-sm font-bold text-[var(--mehron)] uppercase tracking-widest">Pending Approvals</h3>
                        <span className={`px-2 py-0.5 rounded-none text-[9px] font-bold uppercase tracking-widest border transition-all ${pendingShops.length > 0 ? 'bg-[var(--mehron)] text-white border-[var(--gold)] pulsate' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                            {pendingShops.length} Pending
                        </span>
                    </div>
                    {pendingShops.length > 0 ? (
                        <div className="space-y-3">
                            {pendingShops.slice(0, 5).map((shop) => (
                                <div key={shop._id} className="p-4 bg-[var(--cream)]/30 border border-[var(--border-mehron)]/10 rounded-none hover:bg-[var(--gold-pale)] transition-colors">
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="font-bold text-[var(--mehron)] text-xs uppercase tracking-wider">{shop.shopName}</h4>
                                        <span className="px-2 py-0.5 bg-[var(--gold-pale)] text-[var(--mehron)] text-[9px] rounded-none border border-[var(--gold)]/20 font-bold uppercase tracking-widest">Pending</span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 mb-3 font-bold">{shop.ownerId?.email}</p>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => navigate('/admin/shops')}
                                            className="flex-1 bg-[var(--mehron)] hover:bg-[var(--mehron-deep)] text-white py-2 rounded-none text-[9px] font-bold uppercase tracking-[0.2em] border border-[var(--gold)] transition-all"
                                        >
                                            Review
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-400">
                            <svg className="w-16 h-16 mx-auto mb-4 text-[var(--gold)]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm font-bold uppercase tracking-widest text-[var(--mehron)]">All caught up</p>
                            <p className="text-[9px] mt-1 font-bold uppercase tracking-widest">No pending shop approvals</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-3 gap-6 mt-6">
                <div className="bg-white rounded-none p-4 border border-[var(--border-mehron)] shadow-sm">
                    <p className="text-gray-500 text-[9px] uppercase tracking-widest font-bold">Total Customers</p>
                    <p className="text-2xl font-bold mt-1 text-[var(--mehron)]">{stats?.totalCustomers || 0}</p>
                </div>
                <div className="bg-white rounded-none p-4 border border-[var(--border-mehron)] shadow-sm">
                    <p className="text-gray-500 text-[9px] uppercase tracking-widest font-bold">Merchants</p>
                    <p className="text-2xl font-bold mt-1 text-[var(--mehron)]">{stats?.totalSellers || 0}</p>
                </div>
                <div className="bg-white rounded-none p-4 border border-[var(--border-mehron)] shadow-sm">
                    <p className="text-gray-500 text-[9px] uppercase tracking-widest font-bold">Pending Shops</p>
                    <p className="text-2xl font-bold mt-1 text-[var(--mehron)]">{stats?.pendingShops || 0}</p>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
