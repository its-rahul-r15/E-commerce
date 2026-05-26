import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminService } from '../../services/adminApi';

const AdminAnalytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchInsights();
    }, []);

    const fetchInsights = async () => {
        try {
            const insights = await adminService.getPlatformInsights();
            setData(insights);
        } catch (error) {
            console.error('Error fetching platform insights:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center h-80">
                    <div className="w-16 h-16 border-4 border-[var(--mehron)]/20 border-t-[var(--mehron)] rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-500 text-sm font-medium">Loading Platform Insights...</p>
                </div>
            </AdminLayout>
        );
    }

    const kpis = data?.summaryKpis || {};
    const funnel = data?.conversionFunnel || {};
    const topViewed = data?.topViewed || [];
    const topCarted = data?.topCarted || [];
    const topConverting = data?.topConverting || [];
    const worstPerformers = data?.worstPerformers || [];
    const revenueByDay = data?.revenueByDay || [];
    const newCustomersByDay = data?.newCustomersByDay || [];
    const revenueByCategory = data?.revenueByCategory || [];
    const hourlyDistribution = data?.hourlyDistribution || [];
    const lowStockProducts = data?.lowStockProducts || [];

    // ── SVG Chart Helpers ──
    const buildAreaChart = (dataArr, valueKey, width = 600, height = 160) => {
        if (!dataArr.length) return null;
        const maxVal = Math.max(...dataArr.map(d => d[valueKey]), 1);
        const points = dataArr.map((d, i) => ({
            x: (i / Math.max(dataArr.length - 1, 1)) * width,
            y: height - (d[valueKey] / maxVal) * (height - 20) - 10,
        }));
        const linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
        const fillPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;
        return { linePath, fillPath, points, maxVal };
    };

    const buildBarChart = (dataArr, valueKey, width = 600, height = 140) => {
        if (!dataArr.length) return [];
        const maxVal = Math.max(...dataArr.map(d => d[valueKey]), 1);
        const barWidth = Math.max(width / dataArr.length - 2, 4);
        return dataArr.map((d, i) => ({
            x: (i / dataArr.length) * width + 1,
            height: (d[valueKey] / maxVal) * (height - 20),
            y: height - (d[valueKey] / maxVal) * (height - 20),
            width: barWidth,
            value: d[valueKey],
            label: d.label || d.hour,
        }));
    };

    const revChart = buildAreaChart(revenueByDay, 'revenue');
    const custChart = buildAreaChart(newCustomersByDay, 'totalCustomers');
    const hourBars = buildBarChart(hourlyDistribution, 'orders');

    // Funnel bar widths
    const funnelMax = Math.max(funnel.productViews, 1);
    const funnelSteps = [
        { label: 'Product Views', value: funnel.productViews, color: '#7c3aed' },
        { label: 'Added to Cart', value: funnel.addedToCart, color: '#f59e0b' },
        { label: 'Wishlisted', value: funnel.wishlistAdds, color: '#ec4899' },
        { label: 'Purchased', value: funnel.purchased, color: '#10b981' },
    ];

    const tabs = [
        { key: 'overview', label: 'Overview' },
        { key: 'products', label: 'Product Analytics' },
        { key: 'customers', label: 'Customers' },
        { key: 'performance', label: 'Performance' },
    ];

    return (
        <AdminLayout>
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Platform Analytics & Insights</h1>
                <p className="text-sm text-gray-500 mt-1">Real-time product engagement, conversion funnels, and revenue intelligence</p>
            </div>

            {/* Tabs */}
            <div className="flex items-center space-x-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            activeTab === tab.key
                                ? 'bg-white text-[var(--mehron)] shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ═══ OVERVIEW TAB ═══ */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <KpiCard
                            title="Today's Revenue"
                            value={`₹${kpis.todayRevenue?.toLocaleString() || 0}`}
                            subtitle={`${kpis.todayOrders || 0} orders`}
                            change={kpis.revenueChangePercent}
                            icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                        <KpiCard
                            title="Total Views"
                            value={funnel.productViews?.toLocaleString() || '0'}
                            subtitle={`${kpis.totalTrackedProducts || 0} tracked products`}
                            icon="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                        <KpiCard
                            title="Cart Adds"
                            value={funnel.addedToCart?.toLocaleString() || '0'}
                            subtitle={`${funnel.viewToCartRate || 0}% view→cart rate`}
                            icon="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
                        />
                        <KpiCard
                            title="Conversion Rate"
                            value={`${funnel.overallConversionRate || 0}%`}
                            subtitle={`${funnel.purchased || 0} purchases`}
                            icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            highlight
                        />
                    </div>

                    {/* Conversion Funnel */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-800 mb-5">Conversion Funnel</h3>
                        <div className="space-y-3">
                            {funnelSteps.map((step, i) => (
                                <div key={i} className="flex items-center space-x-4">
                                    <span className="text-xs text-gray-500 w-28 text-right font-medium">{step.label}</span>
                                    <div className="flex-1 bg-gray-100 rounded-full h-7 overflow-hidden relative">
                                        <div
                                            className="h-full rounded-full transition-all duration-700 flex items-center px-3"
                                            style={{
                                                width: `${Math.max((step.value / funnelMax) * 100, 2)}%`,
                                                backgroundColor: step.color,
                                            }}
                                        >
                                            <span className="text-white text-[11px] font-bold whitespace-nowrap">
                                                {step.value.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400 w-16 font-medium">
                                        {funnelMax > 0 ? ((step.value / funnelMax) * 100).toFixed(1) : 0}%
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-100">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-[var(--mehron)]">{funnel.viewToCartRate || 0}%</p>
                                <p className="text-[11px] text-gray-400 font-medium mt-0.5">View → Cart</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-amber-500">{funnel.cartToPurchaseRate || 0}%</p>
                                <p className="text-[11px] text-gray-400 font-medium mt-0.5">Cart → Purchase</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-emerald-500">{funnel.overallConversionRate || 0}%</p>
                                <p className="text-[11px] text-gray-400 font-medium mt-0.5">Overall CVR</p>
                            </div>
                        </div>
                    </div>

                    {/* Revenue Trend (30 days) */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-gray-800">Daily Revenue (Last 30 Days)</h3>
                            <span className="text-xs text-gray-400 font-medium">
                                Total: ₹{revenueByDay.reduce((s, d) => s + d.revenue, 0).toLocaleString()}
                            </span>
                        </div>
                        {revChart ? (
                            <div className="w-full overflow-hidden">
                                <svg className="w-full h-44" viewBox="0 0 600 160" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="var(--mehron)" stopOpacity="0.2" />
                                            <stop offset="100%" stopColor="var(--mehron)" stopOpacity="0.02" />
                                        </linearGradient>
                                    </defs>
                                    {[40, 80, 120].map(y => (
                                        <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="#f3f4f6" strokeWidth="1" />
                                    ))}
                                    <path d={revChart.fillPath} fill="url(#revGrad)" />
                                    <path d={revChart.linePath} fill="none" stroke="var(--mehron)" strokeWidth="2.5" strokeLinecap="round" />
                                    {revChart.points.map((pt, i) => (
                                        <g key={i} className="group cursor-pointer">
                                            <circle cx={pt.x} cy={pt.y} r="3" fill="var(--mehron)" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <circle cx={pt.x} cy={pt.y} r="12" fill="transparent" />
                                            <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                <rect x={pt.x - 40} y={pt.y - 28} width="80" height="20" rx="4" fill="#1f2937" />
                                                <text x={pt.x} y={pt.y - 15} fill="white" fontSize="9" fontWeight="600" textAnchor="middle">
                                                    ₹{revenueByDay[i]?.revenue.toLocaleString()}
                                                </text>
                                            </g>
                                        </g>
                                    ))}
                                </svg>
                                <div className="flex justify-between text-[9px] text-gray-400 font-medium mt-1 px-1">
                                    <span>{revenueByDay[0]?.label}</span>
                                    <span>{revenueByDay[Math.floor(revenueByDay.length / 2)]?.label}</span>
                                    <span>{revenueByDay[revenueByDay.length - 1]?.label}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-xs text-gray-400 py-12">No revenue data</p>
                        )}
                    </div>

                    {/* Peak Hours + Category Revenue */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Peak Hours */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <h3 className="text-sm font-semibold text-gray-800 mb-4">Peak Order Hours</h3>
                            {hourBars.length > 0 ? (
                                <div className="w-full overflow-hidden">
                                    <svg className="w-full h-36" viewBox="0 0 600 140">
                                        {hourBars.map((bar, i) => (
                                            <g key={i} className="group cursor-pointer">
                                                <rect
                                                    x={bar.x}
                                                    y={bar.y}
                                                    width={bar.width}
                                                    height={bar.height}
                                                    rx="2"
                                                    fill="var(--mehron)"
                                                    opacity="0.7"
                                                    className="hover:opacity-100 transition-opacity"
                                                />
                                                <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                    <text x={bar.x + bar.width / 2} y={bar.y - 4} fontSize="8" fill="#374151" fontWeight="600" textAnchor="middle">
                                                        {bar.value}
                                                    </text>
                                                </g>
                                            </g>
                                        ))}
                                    </svg>
                                    <div className="flex justify-between text-[8px] text-gray-400 font-medium px-1">
                                        {['00:00', '06:00', '12:00', '18:00', '23:00'].map(t => (
                                            <span key={t}>{t}</span>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-center text-xs text-gray-400 py-12">No hourly data</p>
                            )}
                        </div>

                        {/* Category Revenue */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <h3 className="text-sm font-semibold text-gray-800 mb-4">Revenue by Category</h3>
                            {revenueByCategory.length > 0 ? (
                                <div className="space-y-3">
                                    {revenueByCategory.slice(0, 6).map((cat, i) => {
                                        const maxRev = Math.max(...revenueByCategory.map(c => c.revenue), 1);
                                        const pct = (cat.revenue / maxRev) * 100;
                                        const colors = ['#7c3aed', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899'];
                                        return (
                                            <div key={i}>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-gray-700 font-medium">{cat.category}</span>
                                                    <span className="text-gray-500">₹{cat.revenue.toLocaleString()} · {cat.unitsSold} units</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2">
                                                    <div
                                                        className="h-2 rounded-full transition-all duration-500"
                                                        style={{ width: `${pct}%`, backgroundColor: colors[i % colors.length] }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-center text-xs text-gray-400 py-12">No category data</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ PRODUCTS TAB ═══ */}
            {activeTab === 'products' && (
                <div className="space-y-6">
                    {/* Top Viewed Products */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-800">🔥 Most Viewed Products</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Products getting the most attention from customers</p>
                        </div>
                        {topViewed.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                                            <th className="text-left py-3 px-5 font-medium">Product</th>
                                            <th className="text-center py-3 px-3 font-medium">Views</th>
                                            <th className="text-center py-3 px-3 font-medium">Cart Adds</th>
                                            <th className="text-center py-3 px-3 font-medium">Wishlist</th>
                                            <th className="text-center py-3 px-3 font-medium">Purchases</th>
                                            <th className="text-center py-3 px-3 font-medium">Revenue</th>
                                            <th className="text-center py-3 px-3 font-medium">CVR</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {topViewed.map((prod, i) => (
                                            <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-3 px-5">
                                                    <div className="flex items-center space-x-3">
                                                        <span className="text-xs font-bold text-gray-300 w-5">{i + 1}</span>
                                                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                                                            {prod.image ? (
                                                                <img src={prod.image} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-800 truncate max-w-[200px]">{prod.name}</p>
                                                            <p className="text-[11px] text-gray-400">{prod.category} · {prod.shop}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-center py-3 px-3">
                                                    <span className="text-sm font-bold text-[var(--mehron)]">{prod.views.toLocaleString()}</span>
                                                </td>
                                                <td className="text-center py-3 px-3">
                                                    <span className="text-sm font-semibold text-amber-500">{prod.addToCart}</span>
                                                    <span className="text-[10px] text-gray-400 block">{prod.cartRate}%</span>
                                                </td>
                                                <td className="text-center py-3 px-3">
                                                    <span className="text-sm text-pink-500 font-semibold">{prod.wishlistAdds}</span>
                                                </td>
                                                <td className="text-center py-3 px-3">
                                                    <span className="text-sm font-semibold text-emerald-600">{prod.purchases}</span>
                                                </td>
                                                <td className="text-center py-3 px-3">
                                                    <span className="text-sm font-bold text-gray-800">₹{prod.revenue.toLocaleString()}</span>
                                                </td>
                                                <td className="text-center py-3 px-3">
                                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                                                        prod.conversionRate >= 5 ? 'bg-emerald-50 text-emerald-600'
                                                        : prod.conversionRate >= 1 ? 'bg-amber-50 text-amber-600'
                                                        : 'bg-red-50 text-red-500'
                                                    }`}>
                                                        {prod.conversionRate}%
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <EmptyState message="No product analytics data yet. Views will be tracked automatically." />
                        )}
                    </div>

                    {/* Top Carted + Top Converting side by side */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Carted */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-gray-100">
                                <h3 className="text-sm font-semibold text-gray-800">🛒 Most Added to Cart</h3>
                            </div>
                            {topCarted.length > 0 ? (
                                <div className="divide-y divide-gray-50">
                                    {topCarted.map((prod, i) => (
                                        <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 transition-colors">
                                            <div className="flex items-center space-x-3">
                                                <span className="text-xs font-bold text-gray-300 w-5">{i + 1}</span>
                                                <div className="w-9 h-9 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 flex-shrink-0">
                                                    {prod.image && <img src={prod.image} alt="" className="w-full h-full object-cover" />}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-gray-800 truncate max-w-[140px]">{prod.name}</p>
                                                    <p className="text-[10px] text-gray-400">{prod.category}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-amber-500">{prod.addToCart} carts</p>
                                                <p className="text-[10px] text-gray-400">{prod.cartRate}% from {prod.views} views</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState message="No cart data yet" />
                            )}
                        </div>

                        {/* Top Converting */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-gray-100">
                                <h3 className="text-sm font-semibold text-gray-800">🎯 Best Converting Products</h3>
                            </div>
                            {topConverting.length > 0 ? (
                                <div className="divide-y divide-gray-50">
                                    {topConverting.map((prod, i) => (
                                        <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 transition-colors">
                                            <div className="flex items-center space-x-3">
                                                <span className="text-xs font-bold text-gray-300 w-5">{i + 1}</span>
                                                <div className="w-9 h-9 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 flex-shrink-0">
                                                    {prod.image && <img src={prod.image} alt="" className="w-full h-full object-cover" />}
                                                </div>
                                                <p className="text-xs font-medium text-gray-800 truncate max-w-[140px]">{prod.name}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-emerald-600">{prod.conversionRate}% CVR</p>
                                                <p className="text-[10px] text-gray-400">{prod.purchases}/{prod.views} · ₹{prod.revenue.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState message="Need min 5 views per product to show" />
                            )}
                        </div>
                    </div>

                    {/* Worst Performers */}
                    {worstPerformers.length > 0 && (
                        <div className="bg-white rounded-xl border border-red-100 shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-red-50 bg-red-50/30">
                                <h3 className="text-sm font-semibold text-red-700">⚠️ Underperforming Products</h3>
                                <p className="text-xs text-red-400 mt-0.5">High views but zero purchases — consider pricing, images, or descriptions</p>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {worstPerformers.map((prod, i) => (
                                    <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-red-50/20 transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-9 h-9 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 flex-shrink-0">
                                                {prod.image && <img src={prod.image} alt="" className="w-full h-full object-cover" />}
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-800 truncate max-w-[200px]">{prod.name}</p>
                                                <p className="text-[10px] text-gray-400">{prod.category} · Stock: {prod.stock}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600">{prod.views} views · {prod.addToCart} carts</p>
                                            <p className="text-[10px] font-bold text-red-500">0 purchases</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ═══ CUSTOMERS TAB ═══ */}
            {activeTab === 'customers' && (
                <div className="space-y-6">
                    {/* Customer Growth */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-gray-800">Customer Growth (30 Days)</h3>
                            <span className="text-xs text-gray-400 font-medium">
                                Total: {newCustomersByDay[newCustomersByDay.length - 1]?.totalCustomers || 0} customers
                            </span>
                        </div>
                        {custChart ? (
                            <div className="w-full overflow-hidden">
                                <svg className="w-full h-44" viewBox="0 0 600 160" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="custGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                                        </linearGradient>
                                    </defs>
                                    <path d={custChart.fillPath} fill="url(#custGrad)" />
                                    <path d={custChart.linePath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                                    {custChart.points.map((pt, i) => (
                                        <g key={i} className="group cursor-pointer">
                                            <circle cx={pt.x} cy={pt.y} r="3" fill="#10b981" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <circle cx={pt.x} cy={pt.y} r="12" fill="transparent" />
                                            <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                <rect x={pt.x - 35} y={pt.y - 28} width="70" height="20" rx="4" fill="#1f2937" />
                                                <text x={pt.x} y={pt.y - 15} fill="white" fontSize="9" fontWeight="600" textAnchor="middle">
                                                    {newCustomersByDay[i]?.totalCustomers}
                                                </text>
                                            </g>
                                        </g>
                                    ))}
                                </svg>
                                <div className="flex justify-between text-[9px] text-gray-400 font-medium mt-1 px-1">
                                    <span>{newCustomersByDay[0]?.label}</span>
                                    <span>{newCustomersByDay[newCustomersByDay.length - 1]?.label}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-xs text-gray-400 py-12">No customer data</p>
                        )}
                    </div>

                    {/* New Signups by Day table */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-800">Daily New Signups</h3>
                        </div>
                        <div className="overflow-x-auto max-h-80 overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 bg-gray-50">
                                    <tr className="text-xs text-gray-500 uppercase">
                                        <th className="text-left py-2.5 px-5 font-medium">Date</th>
                                        <th className="text-center py-2.5 px-3 font-medium">New Customers</th>
                                        <th className="text-center py-2.5 px-3 font-medium">Cumulative Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {[...newCustomersByDay].reverse().map((day, i) => (
                                        <tr key={i} className="hover:bg-gray-50/50">
                                            <td className="py-2.5 px-5 text-xs text-gray-600">{day.label}</td>
                                            <td className="text-center py-2.5 px-3">
                                                <span className={`font-bold text-sm ${day.newCustomers > 0 ? 'text-emerald-600' : 'text-gray-300'}`}>
                                                    +{day.newCustomers}
                                                </span>
                                            </td>
                                            <td className="text-center py-2.5 px-3 text-xs text-gray-500">{day.totalCustomers}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ PERFORMANCE TAB ═══ */}
            {activeTab === 'performance' && (
                <div className="space-y-6">
                    {/* Low Stock Alert */}
                    <div className="bg-white rounded-xl border border-amber-100 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-amber-50 bg-amber-50/30">
                            <h3 className="text-sm font-semibold text-amber-700">📦 Low Stock Alert</h3>
                            <p className="text-xs text-amber-400 mt-0.5">Products running out — restock to avoid missed sales</p>
                        </div>
                        {lowStockProducts.length > 0 ? (
                            <div className="divide-y divide-gray-50">
                                {lowStockProducts.map((prod, i) => (
                                    <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-amber-50/20 transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-9 h-9 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 flex-shrink-0">
                                                {prod.images?.[0] && <img src={prod.images[0]} alt="" className="w-full h-full object-cover" />}
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-800">{prod.name}</p>
                                                <p className="text-[10px] text-gray-400">{prod.category} · ₹{prod.price}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                            prod.stock <= 2 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                                        }`}>
                                            {prod.stock} left
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center">
                                <p className="text-xs text-gray-400">All products are well-stocked ✓</p>
                            </div>
                        )}
                    </div>

                    {/* Active Carts + Cancellations */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm text-center">
                            <p className="text-3xl font-bold text-amber-500">{funnel.activeCartsNow}</p>
                            <p className="text-xs text-gray-400 mt-1 font-medium">Active Carts Now</p>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm text-center">
                            <p className="text-3xl font-bold text-emerald-500">{funnel.paidOrders}</p>
                            <p className="text-xs text-gray-400 mt-1 font-medium">Total Paid Orders</p>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm text-center">
                            <p className="text-3xl font-bold text-red-500">{funnel.cancelledOrders}</p>
                            <p className="text-xs text-gray-400 mt-1 font-medium">Cancelled Orders</p>
                        </div>
                    </div>

                    {/* Revenue by Category detailed */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-800">Category Performance Breakdown</h3>
                        </div>
                        {revenueByCategory.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                                            <th className="text-left py-3 px-5 font-medium">Category</th>
                                            <th className="text-center py-3 px-3 font-medium">Revenue</th>
                                            <th className="text-center py-3 px-3 font-medium">Units Sold</th>
                                            <th className="text-center py-3 px-3 font-medium">Orders</th>
                                            <th className="text-center py-3 px-3 font-medium">Products</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {revenueByCategory.map((cat, i) => (
                                            <tr key={i} className="hover:bg-gray-50/50">
                                                <td className="py-3 px-5 text-sm font-medium text-gray-800">{cat.category}</td>
                                                <td className="text-center py-3 px-3 text-sm font-bold text-[var(--mehron)]">₹{cat.revenue.toLocaleString()}</td>
                                                <td className="text-center py-3 px-3 text-sm text-gray-600">{cat.unitsSold}</td>
                                                <td className="text-center py-3 px-3 text-sm text-gray-600">{cat.orders}</td>
                                                <td className="text-center py-3 px-3 text-sm text-gray-600">{cat.productCount}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <EmptyState message="No category performance data" />
                        )}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

// ── Sub-components ──

const KpiCard = ({ title, value, subtitle, change, icon, highlight }) => (
    <div className={`rounded-xl border p-5 shadow-sm transition-shadow hover:shadow-md ${
        highlight ? 'bg-[var(--mehron)] border-[var(--mehron)] text-white' : 'bg-white border-gray-200'
    }`}>
        <div className="flex items-start justify-between">
            <div>
                <p className={`text-[11px] font-medium mb-1 ${highlight ? 'text-white/70' : 'text-gray-400'}`}>{title}</p>
                <p className="text-2xl font-bold">{value}</p>
                <p className={`text-[11px] mt-1 font-medium ${highlight ? 'text-white/60' : 'text-gray-400'}`}>{subtitle}</p>
            </div>
            <div className={`p-2 rounded-lg ${highlight ? 'bg-white/20' : 'bg-gray-50'}`}>
                <svg className={`w-5 h-5 ${highlight ? 'text-white/80' : 'text-[var(--mehron)]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={icon} />
                </svg>
            </div>
        </div>
        {change !== undefined && (
            <div className="mt-2 flex items-center space-x-1">
                <svg className={`w-3.5 h-3.5 ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                        d={change >= 0 ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'} />
                </svg>
                <span className={`text-[11px] font-bold ${
                    highlight
                        ? change >= 0 ? 'text-emerald-300' : 'text-red-300'
                        : change >= 0 ? 'text-emerald-500' : 'text-red-500'
                }`}>
                    {change >= 0 ? '+' : ''}{change}% vs yesterday
                </span>
            </div>
        )}
    </div>
);

const EmptyState = ({ message }) => (
    <div className="p-12 text-center">
        <svg className="w-12 h-12 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-xs text-gray-400">{message}</p>
    </div>
);

export default AdminAnalytics;
