import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { shopService, productService, orderService } from '../../services/api';

const SellerDashboard = () => {
    const [shop, setShop] = useState(null);
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        pendingOrders: 0,
        revenue: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch shop
            const shopData = await shopService.getMyShop();
            setShop(shopData.shop);

            // Fetch products
            const productsData = await productService.getMyProducts();

            // Fetch orders
            const ordersData = await orderService.getShopOrders();
            const orders = ordersData || []; // data is already the orders array

            // Calculate stats
            const pendingOrders = orders.filter(o => o.status === 'pending').length;
            const revenue = orders
                .filter(o => o.status === 'completed')
                .reduce((sum, order) => sum + order.totalAmount, 0);

            setStats({
                totalProducts: productsData?.length || 0, // data is the array
                totalOrders: orders.length || 0,
                pendingOrders,
                revenue,
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
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

    if (!shop) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-sm p-8 max-w-md text-center">
                    <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No Shop Registered</h2>
                    <p className="text-gray-600 mb-6">Register your shop to start selling</p>
                    <Link to="/seller/register-shop" className="btn-primary">
                        Register Shop
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
                    <p className="text-gray-600 mt-1">Welcome back, manage your shop here</p>
                </div>

                {/* Shop Status Alert */}
                {shop.status !== 'approved' && (
                    <div className={`mb-6 p-4 rounded-lg ${shop.status === 'pending' ? 'bg-yellow-50 border border-yellow-200' :
                        shop.status === 'rejected' ? 'bg-red-50 border border-red-200' :
                            'bg-gray-50 border border-gray-200'
                        }`}>
                        <p className={`font-medium ${shop.status === 'pending' ? 'text-yellow-800' :
                            shop.status === 'rejected' ? 'text-red-800' :
                                'text-gray-800'
                            }`}>
                            {shop.status === 'pending' && '⏳ Shop approval pending - waiting for admin review'}
                            {shop.status === 'rejected' && '❌ Shop rejected - please contact support'}
                            {shop.status === 'blocked' && '🚫 Shop blocked - contact admin for details'}
                        </p>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Products</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-lg">
                                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Pending Orders</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.pendingOrders}</p>
                            </div>
                            <div className="bg-yellow-100 p-3 rounded-lg">
                                <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                                <p className="text-3xl font-bold text-gray-900">₹{stats.revenue.toFixed(0)}</p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-lg">
                                <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link to="/seller/products" className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-4">
                            <div className="bg-primary p-3 rounded-lg">
                                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Manage Products</h3>
                                <p className="text-sm text-gray-600">Add, edit, or remove products</p>
                            </div>
                        </div>
                    </Link>

                    <Link to="/seller/orders" className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-4">
                            <div className="bg-green-600 p-3 rounded-lg">
                                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">View Orders</h3>
                                <p className="text-sm text-gray-600">Process customer orders</p>
                            </div>
                        </div>
                    </Link>

                    <Link to="/seller/shop" className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-4">
                            <div className="bg-purple-600 p-3 rounded-lg">
                                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Shop Settings</h3>
                                <p className="text-sm text-gray-600">Update shop information</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SellerDashboard;
