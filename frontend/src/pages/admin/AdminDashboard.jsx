import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminApi';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        try {
            const data = await adminService.getStatistics();
            setStats(data.statistics);
        } catch (error) {
            console.error('Error fetching statistics:', error);
            alert('Failed to load statistics');
        } finally {
            setLoading(false);
        }
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
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600 mt-2">Comprehensive platform overview and analytics</p>
                </div>

                {/* Primary Statistics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Users Card */}
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-sm font-semibold text-gray-600 mb-1">TOTAL USERS</p>
                        <p className="text-4xl font-bold text-gray-900 mb-3">{stats?.totalUsers || 0}</p>
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center text-gray-600">
                                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                                Customers: {stats?.totalCustomers || 0}
                            </span>
                            <span className="flex items-center text-gray-600">
                                <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                                Sellers: {stats?.totalSellers || 0}
                            </span>
                        </div>
                    </div>

                    {/* Total Shops Card */}
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-green-100 p-3 rounded-lg">
                                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-sm font-semibold text-gray-600 mb-1">TOTAL SHOPS</p>
                        <p className="text-4xl font-bold text-gray-900 mb-3">{stats?.totalShops || 0}</p>
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center text-green-700">
                                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Approved: {stats?.approvedShops || 0}
                            </span>
                            <span className="flex items-center text-yellow-700">
                                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Pending: {stats?.pendingShops || 0}
                            </span>
                        </div>
                    </div>

                    {/* Total Products Card */}
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-purple-100 p-3 rounded-lg">
                                <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-sm font-semibold text-gray-600 mb-1">TOTAL PRODUCTS</p>
                        <p className="text-4xl font-bold text-gray-900 mb-3">{stats?.totalProducts || 0}</p>
                        <div className="text-sm text-gray-600">
                            Active listings across all shops
                        </div>
                    </div>

                    {/* Total Orders Card */}
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-primary">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-primary/10 p-3 rounded-lg">
                                <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-sm font-semibold text-gray-600 mb-1">TOTAL ORDERS</p>
                        <p className="text-4xl font-bold text-gray-900 mb-3">{stats?.totalOrders || 0}</p>
                        <div className="text-sm text-gray-600">
                            Platform-wide order volume
                        </div>
                    </div>
                </div>

                {/* Secondary Statistics - Revenue & More Details */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Revenue Card */}
                    <div className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Platform Revenue</h3>
                            <svg className="h-8 w-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-4xl font-bold mb-2">₹{(stats?.totalRevenue || 0).toLocaleString()}</p>
                        <p className="text-white/80 text-sm">Total platform transactions</p>
                    </div>

                    {/* Order Status Breakdown */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Order Status</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 flex items-center">
                                    <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                                    Pending
                                </span>
                                <span className="font-bold text-gray-900">{stats?.pendingOrders || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 flex items-center">
                                    <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                                    Processing
                                </span>
                                <span className="font-bold text-gray-900">{stats?.processingOrders || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 flex items-center">
                                    <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
                                    Shipped
                                </span>
                                <span className="font-bold text-gray-900">{stats?.shippedOrders || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 flex items-center">
                                    <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                                    Delivered
                                </span>
                                <span className="font-bold text-gray-900">{stats?.deliveredOrders || 0}</span>
                            </div>
                        </div>
                    </div>

                    {/* Platform Health */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Platform Health</h3>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Shop Approval Rate</span>
                                    <span className="font-semibold text-gray-900">
                                        {stats?.totalShops > 0
                                            ? Math.round((stats?.approvedShops / stats?.totalShops) * 100)
                                            : 0}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-green-500 h-2 rounded-full"
                                        style={{ width: `${stats?.totalShops > 0 ? (stats?.approvedShops / stats?.totalShops) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Seller Adoption</span>
                                    <span className="font-semibold text-gray-900">
                                        {stats?.totalUsers > 0
                                            ? Math.round((stats?.totalSellers / stats?.totalUsers) * 100)
                                            : 0}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-500 h-2 rounded-full"
                                        style={{ width: `${stats?.totalUsers > 0 ? (stats?.totalSellers / stats?.totalUsers) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Products/Shop Avg</span>
                                    <span className="font-semibold text-gray-900">
                                        {stats?.approvedShops > 0
                                            ? Math.round(stats?.totalProducts / stats?.approvedShops)
                                            : 0}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500">Average inventory per shop</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Management Actions */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Platform Management</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Link to="/admin/users" className="group bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all hover:-translate-y-0.5">
                            <div className="flex items-center space-x-4">
                                <div className="bg-blue-600 p-4 rounded-lg group-hover:bg-blue-700 transition-colors">
                                    <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                        Manage Users
                                    </h3>
                                    <p className="text-sm text-gray-600">Block, unblock, or delete user accounts</p>
                                </div>
                                <svg className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </Link>

                        <Link to="/admin/shops" className="group bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all hover:-translate-y-0.5">
                            <div className="flex items-center space-x-4">
                                <div className="bg-green-600 p-4 rounded-lg group-hover:bg-green-700 transition-colors">
                                    <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
                                        Manage Shops
                                    </h3>
                                    <p className="text-sm text-gray-600">Approve, reject, or block shop registrations</p>
                                    {stats?.pendingShops > 0 && (
                                        <span className="inline-block mt-1 bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-medium">
                                            {stats.pendingShops} pending approval
                                        </span>
                                    )}
                                </div>
                                <svg className="h-5 w-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </Link>

                        <Link to="/admin/products" className="group bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all hover:-translate-y-0.5">
                            <div className="flex items-center space-x-4">
                                <div className="bg-purple-600 p-4 rounded-lg group-hover:bg-purple-700 transition-colors">
                                    <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                                        Product Moderation
                                    </h3>
                                    <p className="text-sm text-gray-600">Review and moderate product listings</p>
                                </div>
                                <svg className="h-5 w-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
