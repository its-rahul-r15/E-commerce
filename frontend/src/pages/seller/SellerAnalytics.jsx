import { useState, useEffect } from 'react';
import SellerLayout from '../../components/layout/SellerLayout';
import { orderService, productService, shopService } from '../../services/api';
import {
    ChartBarIcon,
    CurrencyRupeeIcon,
    ShoppingCartIcon,
    UserGroupIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    ArrowPathIcon,
    CalendarIcon,
} from '@heroicons/react/24/outline';

const SellerAnalytics = () => {
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('7days');
    const [analytics, setAnalytics] = useState({
        revenue: {
            total: 0,
            change: 0,
            chartData: [],
        },
        orders: {
            total: 0,
            completed: 0,
            pending: 0,
            cancelled: 0,
            change: 0,
        },
        products: {
            total: 0,
            active: 0,
            lowStock: 0,
            outOfStock: 0,
        },
        customers: {
            total: 0,
            returning: 0,
            new: 0,
        },
        topProducts: [],
        recentActivity: [],
    });

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        try {
            const [ordersData, productsData, shopData] = await Promise.all([
                orderService.getShopOrders(),
                productService.getMyProducts(),
                shopService.getMyShop(),
            ]);

            const orders = ordersData || [];
            const products = productsData || [];

            // Calculate date range
            const now = new Date();
            const daysBack = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90;
            const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

            // Filter orders by date range
            const rangeOrders = orders.filter(o => new Date(o.createdAt) >= startDate);

            // Revenue calculations
            const totalRevenue = rangeOrders
                .filter(o => o.status === 'completed')
                .reduce((sum, o) => sum + o.totalAmount, 0);

            const previousPeriodStart = new Date(startDate.getTime() - daysBack * 24 * 60 * 60 * 1000);
            const previousOrders = orders.filter(
                o => new Date(o.createdAt) >= previousPeriodStart && new Date(o.createdAt) < startDate
            );
            const previousRevenue = previousOrders
                .filter(o => o.status === 'completed')
                .reduce((sum, o) => sum + o.totalAmount, 0);

            const revenueChange = previousRevenue > 0
                ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
                : 0;

            // Revenue chart data
            const days = [];
            for (let i = daysBack - 1; i >= 0; i--) {
                const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                const dayStart = new Date(date.setHours(0, 0, 0, 0));
                const dayEnd = new Date(date.setHours(23, 59, 59, 999));

                const dayRevenue = orders
                    .filter(o => {
                        const orderDate = new Date(o.createdAt);
                        return orderDate >= dayStart && orderDate <= dayEnd && o.status === 'completed';
                    })
                    .reduce((sum, o) => sum + o.totalAmount, 0);

                days.push({
                    date: dayStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
                    value: dayRevenue,
                });
            }

            // Orders analytics
            const completedOrders = rangeOrders.filter(o => o.status === 'completed').length;
            const pendingOrders = rangeOrders.filter(o => o.status === 'pending').length;
            const cancelledOrders = rangeOrders.filter(o => o.status === 'cancelled').length;
            const previousOrderCount = previousOrders.length;
            const orderChange = previousOrderCount > 0
                ? ((rangeOrders.length - previousOrderCount) / previousOrderCount) * 100
                : 0;

            // Products analytics
            const activeProducts = products.filter(p => p.isAvailable && p.stock > 0).length;
            const lowStockProducts = products.filter(p => p.stock > 0 && p.stock < 10).length;
            const outOfStockProducts = products.filter(p => p.stock === 0).length;

            // Customer analytics
            const uniqueCustomers = new Set(rangeOrders.map(o => o.customerId?._id)).size;
            const customerOrders = {};
            rangeOrders.forEach(o => {
                const customerId = o.customerId?._id;
                if (customerId) {
                    customerOrders[customerId] = (customerOrders[customerId] || 0) + 1;
                }
            });
            const returningCustomers = Object.values(customerOrders).filter(count => count > 1).length;

            // Top products
            const productSales = {};
            rangeOrders
                .filter(o => o.status === 'completed')
                .forEach(order => {
                    order.items.forEach(item => {
                        if (!productSales[item.productId]) {
                            productSales[item.productId] = {
                                name: item.name,
                                quantity: 0,
                                revenue: 0,
                            };
                        }
                        productSales[item.productId].quantity += item.quantity;
                        productSales[item.productId].revenue += item.price * item.quantity;
                    });
                });

            const topProducts = Object.entries(productSales)
                .map(([id, data]) => ({ id, ...data }))
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 5);

            setAnalytics({
                revenue: {
                    total: totalRevenue,
                    change: revenueChange,
                    chartData: days,
                },
                orders: {
                    total: rangeOrders.length,
                    completed: completedOrders,
                    pending: pendingOrders,
                    cancelled: cancelledOrders,
                    change: orderChange,
                },
                products: {
                    total: products.length,
                    active: activeProducts,
                    lowStock: lowStockProducts,
                    outOfStock: outOfStockProducts,
                },
                customers: {
                    total: uniqueCustomers,
                    returning: returningCustomers,
                    new: uniqueCustomers - returningCustomers,
                },
                topProducts,
                recentActivity: rangeOrders.slice(0, 10),
            });
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <SellerLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <ArrowPathIcon className="h-10 w-10 text-[var(--gold)] animate-spin mx-auto" />
                        <p className="mt-4 text-gray-600 font-serif uppercase tracking-[0.2em] text-[10px]">Analyzing boutique records...</p>
                    </div>
                </div>
            </SellerLayout>
        );
    }

    const maxChartValue = Math.max(...analytics.revenue.chartData.map(d => d.value), 1);

    return (
        <SellerLayout>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-[var(--mehron)] uppercase tracking-wider meander-pattern pb-1">Analytics Repository</h1>
                    <p className="text-gray-600 mt-1 font-serif text-[10px] uppercase tracking-widest">Observe the growth of your boutique's legacy</p>
                </div>

                {/* Time Range Selector */}
                <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg p-1">
                    {[
                        { value: '7days', label: '7 Days' },
                        { value: '30days', label: '30 Days' },
                        { value: '90days', label: '90 Days' },
                    ].map((range) => (
                        <button
                            key={range.value}
                            onClick={() => setTimeRange(range.value)}
                            className={`px-4 py-2 rounded-none font-serif text-[10px] uppercase tracking-widest transition-all ${timeRange === range.value
                                ? 'bg-[var(--mehron)] text-white border border-[var(--gold)] shadow-md'
                                : 'text-gray-600 hover:bg-[var(--gold-pale)]'
                                }`}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Revenue */}
                <div className="bg-white border border-[var(--border-mehron)] rounded-none p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-[var(--mehron-soft)] rounded-none border border-[var(--border-mehron)]">
                            <CurrencyRupeeIcon className="h-6 w-6 text-[var(--mehron)]" />
                        </div>
                        <div className={`flex items-center text-[10px] font-serif font-bold uppercase tracking-widest ${analytics.revenue.change >= 0 ? 'text-[var(--mehron)]' : 'text-red-600'
                            }`}>
                            {analytics.revenue.change >= 0 ? (
                                <ArrowUpIcon className="h-4 w-4 mr-1" />
                            ) : (
                                <ArrowDownIcon className="h-4 w-4 mr-1" />
                            )}
                            {Math.abs(analytics.revenue.change).toFixed(1)}%
                        </div>
                    </div>
                    <h3 className="text-[10px] font-serif uppercase tracking-widest text-gray-500 mb-1 font-bold">Total Revenue</h3>
                    <p className="text-3xl font-serif font-bold text-[var(--mehron)]">
                        ₹{analytics.revenue.total.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Completed orders only</p>
                </div>

                {/* Orders */}
                <div className="bg-white border border-[var(--border-mehron)] rounded-none p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-[var(--gold-pale)] rounded-none">
                            <ShoppingCartIcon className="h-6 w-6 text-[var(--gold)]" />
                        </div>
                        <div className={`flex items-center text-[10px] font-serif font-bold uppercase tracking-widest ${analytics.orders.change >= 0 ? 'text-[var(--mehron)]' : 'text-red-600'
                            }`}>
                            {analytics.orders.change >= 0 ? (
                                <ArrowUpIcon className="h-4 w-4 mr-1" />
                            ) : (
                                <ArrowDownIcon className="h-4 w-4 mr-1" />
                            )}
                            {Math.abs(analytics.orders.change).toFixed(1)}%
                        </div>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Total Orders</h3>
                    <p className="text-3xl font-bold text-gray-900">{analytics.orders.total}</p>
                    <p className="text-xs text-gray-500 mt-2">
                        {analytics.orders.completed} completed, {analytics.orders.pending} pending
                    </p>
                </div>

                {/* Products */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <ChartBarIcon className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Active Products</h3>
                    <p className="text-3xl font-bold text-gray-900">{analytics.products.active}</p>
                    <p className="text-xs text-gray-500 mt-2">
                        {analytics.products.lowStock} low stock, {analytics.products.outOfStock} out
                    </p>
                </div>

                {/* Customers */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-50 rounded-lg">
                            <UserGroupIcon className="h-6 w-6 text-orange-600" />
                        </div>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Unique Customers</h3>
                    <p className="text-3xl font-bold text-gray-900">{analytics.customers.total}</p>
                    <p className="text-xs text-gray-500 mt-2">
                        {analytics.customers.returning} returning, {analytics.customers.new} new
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white border border-[var(--border-mehron)] rounded-none p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-serif font-bold text-[var(--mehron)] uppercase tracking-wider">Revenue Trend</h3>
                            <p className="text-[10px] font-serif uppercase tracking-widest text-gray-500">Daily boutique yields</p>
                        </div>
                        <CalendarIcon className="h-5 w-5 text-[var(--gold)]" />
                    </div>

                    <div className="flex items-end justify-between h-64 gap-2">
                        {analytics.revenue.chartData.map((data, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center group">
                                <div className="relative w-full">
                                    <div
                                        className="w-full bg-gradient-to-t from-[var(--mehron)] to-[var(--gold)] rounded-none transition-all duration-300 hover:from-[var(--mehron-deep)] hover:to-[var(--mehron)] cursor-pointer"
                                        style={{
                                            height: `${(data.value / maxChartValue) * 200}px`,
                                            minHeight: data.value > 0 ? '4px' : '2px',
                                        }}
                                    ></div>
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        ₹{data.value.toLocaleString()}
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500 mt-2 font-medium">{data.date}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Order Breakdown */}
                <div className="bg-white border border-[var(--border-mehron)] rounded-none p-6 shadow-sm">
                    <h3 className="text-lg font-serif font-bold text-[var(--mehron)] mb-6 uppercase tracking-wider">Order Breakdown</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600">Completed</span>
                                <span className="text-sm font-bold text-gray-900">
                                    {analytics.orders.completed}
                                </span>
                            </div>
                            <div className="w-full bg-[var(--cream)] rounded-none h-1.5 border border-[var(--border-mehron)]">
                                <div
                                    className="bg-[var(--mehron)] h-1.5 rounded-none"
                                    style={{
                                        width: `${(analytics.orders.completed / analytics.orders.total) * 100}%`,
                                    }}
                                ></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600">Pending</span>
                                <span className="text-sm font-bold text-gray-900">
                                    {analytics.orders.pending}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-yellow-500 h-2 rounded-full"
                                    style={{
                                        width: `${(analytics.orders.pending / analytics.orders.total) * 100}%`,
                                    }}
                                ></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600">Cancelled</span>
                                <span className="text-sm font-bold text-gray-900">
                                    {analytics.orders.cancelled}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-red-500 h-2 rounded-full"
                                    style={{
                                        width: `${(analytics.orders.cancelled / analytics.orders.total) * 100}%`,
                                    }}
                                ></div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-gray-900">Total</span>
                                <span className="text-lg font-bold text-gray-900">
                                    {analytics.orders.total}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Products */}
                <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Top Selling Products</h3>
                    <div className="space-y-4">
                        {analytics.topProducts.length > 0 ? (
                            analytics.topProducts.map((product, index) => (
                                <div
                                    key={product.id}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{product.name}</p>
                                            <p className="text-sm text-gray-600">
                                                {product.quantity} units sold
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-lg font-serif font-bold text-[var(--mehron)]">
                                        ₹{product.revenue.toLocaleString()}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-8">No sales data available</p>
                        )}
                    </div>
                </div>

                {/* Customer Insights */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Customer Insights</h3>
                    <div className="space-y-6">
                        <div className="text-center p-6 bg-[var(--mehron-soft)] rounded-none border border-[var(--border-mehron)] shadow-inner">
                            <p className="text-4xl font-serif font-bold text-[var(--mehron)] mb-2">
                                {analytics.customers.total > 0
                                    ? ((analytics.customers.returning / analytics.customers.total) * 100).toFixed(0)
                                    : 0}%
                            </p>
                            <p className="text-sm font-medium text-gray-700">Return Rate</p>
                            <p className="text-xs text-gray-600 mt-1">Customers who ordered twice+</p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm font-medium text-gray-700">New Customers</span>
                                <span className="text-lg font-bold text-gray-900">
                                    {analytics.customers.new}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm font-medium text-gray-700">Returning</span>
                                <span className="text-lg font-bold text-gray-900">
                                    {analytics.customers.returning}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                <span className="text-sm font-medium text-gray-700">Total Unique</span>
                                <span className="text-lg font-bold text-emerald-600">
                                    {analytics.customers.total}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SellerLayout>
    );
};

export default SellerAnalytics;
