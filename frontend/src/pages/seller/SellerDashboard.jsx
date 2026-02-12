import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { shopService, productService, orderService } from '../../services/api';
import {
    HomeIcon,
    ShoppingBagIcon,
    ShoppingCartIcon,
    CubeIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    ArrowDownTrayIcon,
    PlusIcon,
    BellIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

const SellerDashboard = () => {
    const location = useLocation();
    const [shop, setShop] = useState(null);
    const [products, setProducts] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [stats, setStats] = useState({
        totalProducts: 0,
        activeProducts: 0,
        outOfStock: 0,
        totalOrders: 0,
        todayOrders: 0,
        pendingOrders: 0,
        revenue: 0,
        lastMonthRevenue: 0,
        rating: 0,
        reviewCount: 0,
    });
    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const shopData = await shopService.getMyShop();
            setShop(shopData.shop);

            const productsData = await productService.getMyProducts();
            setProducts(productsData || []);

            const ordersData = await orderService.getShopOrders();
            const orders = ordersData || [];

            setRecentOrders(orders.slice(0, 5));

            const activeProducts = productsData?.filter(p => p.isAvailable && p.stock > 0).length || 0;
            const outOfStock = productsData?.filter(p => p.stock < 3).length || 0;
            const today = new Date().setHours(0, 0, 0, 0);
            const todayOrders = orders.filter(o => new Date(o.createdAt).setHours(0, 0, 0, 0) === today).length;
            const pendingOrders = orders.filter(o => o.status === 'pending').length;
            const revenue = orders
                .filter(o => o.status === 'completed')
                .reduce((sum, order) => sum + order.totalAmount, 0);

            const lastMonth = new Date();
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            const lastMonthRevenue = orders
                .filter(o => o.status === 'completed' && new Date(o.createdAt) < lastMonth)
                .reduce((sum, order) => sum + order.totalAmount, 0);

            const revenueGrowth = lastMonthRevenue > 0
                ? ((revenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
                : 0;

            const last7Days = Array.from({ length: 7 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (6 - i));
                return date;
            });

            const dailySales = last7Days.map(date => {
                const dayStart = new Date(date).setHours(0, 0, 0, 0);
                const dayEnd = new Date(date).setHours(23, 59, 59, 999);
                const dayOrders = orders.filter(o => {
                    const orderTime = new Date(o.createdAt).getTime();
                    return orderTime >= dayStart && orderTime <= dayEnd && o.status === 'completed';
                });
                const total = dayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
                return {
                    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][date.getDay()],
                    value: total
                };
            });

            setSalesData(dailySales);

            setStats({
                totalProducts: productsData?.length || 0,
                activeProducts,
                outOfStock,
                totalOrders: orders.length || 0,
                todayOrders,
                pendingOrders,
                revenue,
                lastMonthRevenue,
                revenueGrowth,
                rating: shopData.shop?.rating || 0,
                reviewCount: 840,
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const navItems = [
        { name: 'Dashboard', icon: HomeIcon, path: '/seller/dashboard' },
        { name: 'Products', icon: ShoppingBagIcon, path: '/seller/products' },
        { name: 'Orders', icon: ShoppingCartIcon, path: '/seller/orders' },
        { name: 'Inventory', icon: CubeIcon, path: '/seller/inventory' },
        { name: 'Analytics', icon: ChartBarIcon, path: '/seller/analytics' },
        { name: 'Shop Settings', icon: Cog6ToothIcon, path: '/seller/shop' },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
            </div>
        );
    }

    if (!shop) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md text-center">
                    <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <HomeIcon className="h-10 w-10 text-indigo-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">No Shop Registered</h2>
                    <p className="text-gray-400 mb-6">Register your shop to start selling</p>
                    <Link to="/seller/register-shop" className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                        Register Shop
                    </Link>
                </div>
            </div>
        );
    }

    const maxSalesValue = Math.max(...salesData.map(d => d.value), 1);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div className="w-64 bg-gray-900 fixed h-screen flex flex-col">
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <ShoppingBagIcon className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">MarketFlow</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                                {shop?.shopName?.charAt(0)?.toUpperCase()}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{shop?.shopName}</p>
                            <p className="text-xs text-gray-400">Pro Seller Account</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 ml-64">
                {/* Top Bar */}
                <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                    <div className="px-8 py-4 flex items-center justify-between">
                        <div className="flex-1 max-w-2xl">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search orders, products or help..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-4 ml-8">
                            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                                <BellIcon className="h-6 w-6" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                            <button className="text-gray-700 hover:text-gray-900 font-medium">
                                US Store
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Revenue */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-gray-600 font-medium">Total Revenue</span>
                                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-semibold">
                                    +{stats.revenueGrowth}%
                                </span>
                            </div>
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-3xl font-bold text-gray-900">₹{stats.revenue.toLocaleString()}</p>
                                    <p className="text-sm text-gray-500 mt-1">vs ₹{stats.lastMonthRevenue.toLocaleString()} last month</p>
                                </div>
                                <div className="flex space-x-1">
                                    {[40, 60, 50, 80, 70, 90, 75].map((height, i) => (
                                        <div key={i} className="w-1.5 bg-indigo-200 rounded-full" style={{ height: `${height}%` }}></div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Orders */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-gray-600 font-medium">Total Orders</span>
                                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-semibold">
                                    +8.2%
                                </span>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalOrders.toLocaleString()}</p>
                                <p className="text-sm text-gray-500 mt-1">{stats.todayOrders} orders today</p>
                            </div>
                        </div>

                        {/* Products */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-gray-600 font-medium">Total Products</span>
                                <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full font-semibold">
                                    {stats.activeProducts} Active
                                </span>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
                                <p className="text-sm text-gray-500 mt-1">{stats.outOfStock} out of stock items</p>
                            </div>
                        </div>

                        {/* Rating */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-gray-600 font-medium">Store Rating</span>
                            </div>
                            <div>
                                <div className="flex items-end space-x-2">
                                    <p className="text-3xl font-bold text-gray-900">{stats.rating.toFixed(1)}</p>
                                    <p className="text-lg text-gray-500 pb-1">/5.0</p>
                                </div>
                                <div className="flex items-center mt-1 space-x-1">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className="text-yellow-400 text-lg">★</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Sales Performance */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Sales Performance</h3>
                                        <p className="text-sm text-gray-500">Revenue tracking over time</p>
                                    </div>
                                    <select className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                                        <option>Last 7 Days</option>
                                        <option>Last 30 Days</option>
                                    </select>
                                </div>

                                <div className="flex items-end justify-between h-64 space-x-3">
                                    {salesData.map((data, i) => (
                                        <div key={i} className="flex-1 flex flex-col items-center">
                                            <div className="w-full relative group">
                                                <div
                                                    className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all duration-300 hover:from-indigo-700 hover:to-indigo-500 cursor-pointer"
                                                    style={{ height: `${(data.value / maxSalesValue) * 200}px` }}
                                                ></div>
                                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                    ₹{data.value.toLocaleString()}
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-500 mt-2 font-medium">{data.day}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Orders */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
                                    <Link to="/seller/orders" className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold">
                                        View All Orders
                                    </Link>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-100">
                                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Order ID</th>
                                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Date</th>
                                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                                                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {recentOrders.map((order) => (
                                                <tr key={order._id} className="hover:bg-gray-50">
                                                    <td className="py-4 px-4 text-sm font-medium text-gray-900">
                                                        #{order._id.slice(-6)}
                                                    </td>
                                                    <td className="py-4 px-4 text-sm text-gray-600">
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                                order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 text-right text-sm font-semibold text-gray-900">
                                                        ₹{order.totalAmount.toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar */}
                        <div className="space-y-6">
                            {/* Quick Actions */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                                <div className="space-y-3">
                                    <Link
                                        to="/seller/products"
                                        className="flex items-center justify-center space-x-2 bg-indigo-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                                    >
                                        <PlusIcon className="h-5 w-5" />
                                        <span>Add New Product</span>
                                    </Link>
                                    <button className="flex items-center justify-center space-x-2 bg-white border-2 border-gray-200 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors w-full">
                                        <ArrowDownTrayIcon className="h-5 w-5" />
                                        <span>Export Report</span>
                                    </button>
                                </div>
                            </div>

                            {/* Low Stock Alerts */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-gray-900">Low Stock Alerts</h3>
                                    <span className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-bold">
                                        {stats.outOfStock} ITEMS
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    {products.filter(p => p.stock < 3).slice(0, 3).map((product) => (
                                        <div key={product._id} className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0">
                                                {product.images?.[0] ? (
                                                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <ShoppingBagIcon className="h-6 w-6" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                                                <p className="text-xs text-red-600 font-semibold">Only {product.stock} left</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Grow Your Shop */}
                            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
                                <h3 className="text-lg font-bold mb-2">Grow Your Shop</h3>
                                <p className="text-sm text-indigo-100 mb-4">
                                    You're in the top 15% of sellers this month!
                                </p>
                                <button className="bg-white text-indigo-600 px-4 py-2.5 rounded-lg font-semibold hover:bg-indigo-50 transition-colors w-full">
                                    Create Campaign
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerDashboard;
