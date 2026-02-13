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
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Dashboard Overview</h1>
                <p className="text-slate-400 mt-2">Platform statistics and metrics</p>
            </div>

            {/* Metrics Cards - ONLY REAL DATA */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {/* Total Users */}
                <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-slate-400 text-sm mb-2">Total Users</p>
                    <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
                </div>

                {/* Total Shops */}
                <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-emerald-600/20 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-slate-400 text-sm mb-2">Active Shops</p>
                    <p className="text-3xl font-bold">{stats?.approvedShops || 0}</p>
                </div>

                {/* Total Orders */}
                <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-slate-400 text-sm mb-2">Total Orders</p>
                    <p className="text-3xl font-bold">{stats?.totalOrders || 0}</p>
                </div>

                {/* Total Products */}
                <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-orange-600/20 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-slate-400 text-sm mb-2">Total Products</p>
                    <p className="text-3xl font-bold">{stats?.totalProducts || 0}</p>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Shops List */}
                <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold">Active Shops</h3>
                        <span className="text-sm text-slate-400">{approvedShops.length} shops</span>
                    </div>
                    <div className="space-y-3">
                        {approvedShops.length > 0 ? (
                            approvedShops.slice(0, 5).map((shop, idx) => {
                                const colors = ['bg-purple-500', 'bg-orange-500', 'bg-emerald-500', 'bg-pink-500', 'bg-blue-500'];
                                const color = colors[idx % colors.length];

                                return (
                                    <div key={shop._id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
                                        onClick={() => navigate('/admin/shops')}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center font-bold text-sm`}>
                                                {shop.shopName?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">{shop.shopName}</p>
                                                <p className="text-xs text-slate-400">{shop.category || 'General'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-emerald-500 font-semibold">Active</p>
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
                                className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
                            >
                                VIEW ALL SHOPS
                            </button>
                        )}
                    </div>
                </div>

                {/* Pending Approvals */}
                <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold">Pending Approvals</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${pendingShops.length > 0 ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                            {pendingShops.length}
                        </span>
                    </div>
                    {pendingShops.length > 0 ? (
                        <div className="space-y-3">
                            {pendingShops.slice(0, 5).map((shop) => (
                                <div key={shop._id} className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="font-semibold">{shop.shopName}</h4>
                                        <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded-full">Pending</span>
                                    </div>
                                    <p className="text-sm text-slate-400 mb-3">{shop.ownerId?.email}</p>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => navigate('/admin/shops')}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
                                        >
                                            Review
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-400">
                            <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-lg font-semibold">All caught up!</p>
                            <p className="text-sm mt-1">No pending shop approvals</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-3 gap-6 mt-6">
                <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                    <p className="text-slate-400 text-sm">Customers</p>
                    <p className="text-2xl font-bold mt-1">{stats?.totalCustomers || 0}</p>
                </div>
                <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                    <p className="text-slate-400 text-sm">Sellers</p>
                    <p className="text-2xl font-bold mt-1">{stats?.totalSellers || 0}</p>
                </div>
                <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                    <p className="text-slate-400 text-sm">Pending Shops</p>
                    <p className="text-2xl font-bold mt-1">{stats?.pendingShops || 0}</p>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
