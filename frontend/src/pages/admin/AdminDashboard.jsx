import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminDashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [pendingShops, setPendingShops] = useState([]);
    const [approvedShops, setApprovedShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [analyticsData, pendingShopsData, approvedShopsData] = await Promise.all([
                adminService.getAnalyticsSummary(),
                adminService.getPendingShops(),
                adminService.getApprovedShops()
            ]);

            setAnalytics(analyticsData);
            setPendingShops(pendingShopsData?.shops || pendingShopsData || []);
            setApprovedShops(approvedShopsData?.shops || approvedShopsData || []);
        } catch (error) {
            console.error('Error fetching dashboard statistics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--gold)] border-t-transparent"></div>
                    <p className="mt-4 text-[var(--gold)] font-serif text-[10px] uppercase tracking-widest font-bold">Loading BI Analytics...</p>
                </div>
            </AdminLayout>
        );
    }

    const kpis = analytics?.kpis || {
        totalOrders: 0,
        totalRevenue: 0,
        aov: 0,
        totalCustomers: 0,
        totalProducts: 0
    };

    const salesTrend = analytics?.salesTrend || [];
    const categorySales = analytics?.categorySales || [];
    const orderStatuses = analytics?.orderStatuses || { pending: 0, completed: 0, cancelled: 0 };
    const topProducts = analytics?.topProducts || [];

    // Helper for Area Chart SVG Path Calculation
    const getTrendSvgPath = () => {
        if (salesTrend.length === 0) return '';
        const maxVal = Math.max(...salesTrend.map(t => t.revenue), 1000);
        const width = 500;
        const height = 150;
        const points = salesTrend.map((t, idx) => {
            const x = (idx / (salesTrend.length - 1)) * width;
            const y = height - (t.revenue / maxVal) * (height - 20);
            return { x, y };
        });
        
        const linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
        const fillPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;
        return { linePath, fillPath, points };
    };

    const trendPaths = getTrendSvgPath();

    return (
        <AdminLayout>
            {/* Page Header */}
            <div className="mb-8 meander-pattern pb-1">
                <h1 className="text-3xl font-bold uppercase tracking-widest text-white">BI & Live Analytics</h1>
                <p className="text-[var(--gold)] mt-2 text-[10px] uppercase tracking-[0.2em] font-bold">Real-time platform sales, business metrics, and customer insights</p>
            </div>

            {/* Metrics KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-8 text-black">
                {/* Total Revenue */}
                <div className="bg-white rounded-none p-6 border border-[var(--border-mehron)] shadow-sm">
                    <p className="text-gray-500 text-[9px] uppercase tracking-widest font-bold mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-[var(--mehron)]">₹{kpis.totalRevenue.toLocaleString()}</p>
                </div>
                
                {/* Total Orders */}
                <div className="bg-white rounded-none p-6 border border-[var(--border-mehron)] shadow-sm">
                    <p className="text-gray-500 text-[9px] uppercase tracking-widest font-bold mb-1">Orders Count</p>
                    <p className="text-2xl font-bold text-[var(--mehron)]">{kpis.totalOrders}</p>
                </div>

                {/* Average Order Value */}
                <div className="bg-white rounded-none p-6 border border-[var(--border-mehron)] shadow-sm">
                    <p className="text-gray-500 text-[9px] uppercase tracking-widest font-bold mb-1">Avg Order Value</p>
                    <p className="text-2xl font-bold text-[var(--mehron)]">₹{kpis.aov.toLocaleString()}</p>
                </div>

                {/* Customers */}
                <div className="bg-white rounded-none p-6 border border-[var(--border-mehron)] shadow-sm">
                    <p className="text-gray-500 text-[9px] uppercase tracking-widest font-bold mb-1">Platform Customers</p>
                    <p className="text-2xl font-bold text-[var(--mehron)]">{kpis.totalCustomers}</p>
                </div>

                {/* Products */}
                <div className="bg-white rounded-none p-6 border border-[var(--border-mehron)] shadow-sm">
                    <p className="text-gray-500 text-[9px] uppercase tracking-widest font-bold mb-1">Catalog Products</p>
                    <p className="text-2xl font-bold text-[var(--mehron)]">{kpis.totalProducts}</p>
                </div>
            </div>

            {/* Interactive Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* 1. Sales Trend Line Chart (Pure SVG) */}
                <div className="bg-white border border-[var(--border-mehron)] p-6 shadow-sm text-black">
                    <h3 className="text-sm font-bold text-[var(--mehron)] uppercase tracking-widest mb-6 border-b border-gray-100 pb-3">Monthly Revenue Trend</h3>
                    {salesTrend.length > 0 ? (
                        <div className="w-full">
                            <svg className="w-full h-48 overflow-visible" viewBox="0 0 500 150">
                                <defs>
                                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--mehron)" stopOpacity="0.15" />
                                        <stop offset="100%" stopColor="var(--mehron)" stopOpacity="0.0" />
                                    </linearGradient>
                                </defs>
                                {/* Grid lines */}
                                <line x1="0" y1="30" x2="500" y2="30" stroke="#f1f1f1" strokeDasharray="3" />
                                <line x1="0" y1="75" x2="500" y2="75" stroke="#f1f1f1" strokeDasharray="3" />
                                <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f1f1" strokeDasharray="3" />
                                
                                {/* Area path */}
                                <path d={trendPaths.fillPath} fill="url(#areaGradient)" />
                                
                                {/* Line path */}
                                <path d={trendPaths.linePath} fill="none" stroke="var(--mehron)" strokeWidth="2" />
                                
                                {/* Dots & Tooltips */}
                                {trendPaths.points.map((pt, idx) => (
                                    <g key={idx} className="group cursor-pointer">
                                        <circle cx={pt.x} cy={pt.y} r="4" fill="var(--gold)" stroke="white" strokeWidth="1.5" />
                                        <circle cx={pt.x} cy={pt.y} r="10" fill="transparent" />
                                        {/* Tooltip */}
                                        <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
                                            <rect x={pt.x - 45} y={pt.y - 30} width="90" height="20" rx="3" fill="#1e2332" />
                                            <text x={pt.x} y={pt.y - 17} fill="white" fontSize="9" fontWeight="bold" textAnchor="middle">
                                                ₹{salesTrend[idx].revenue.toLocaleString()}
                                            </text>
                                        </g>
                                    </g>
                                ))}
                            </svg>
                            {/* X Axis Labels */}
                            <div className="flex justify-between mt-3 text-[9px] font-bold text-gray-400 uppercase tracking-wider px-2">
                                {salesTrend.map((t, idx) => (
                                    <span key={idx}>{t.month}</span>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-xs text-gray-400 py-16">No monthly sales data found</p>
                    )}
                </div>

                {/* 2. Category Distribution Bar Chart */}
                <div className="bg-white border border-[var(--border-mehron)] p-6 shadow-sm text-black">
                    <h3 className="text-sm font-bold text-[var(--mehron)] uppercase tracking-widest mb-6 border-b border-gray-100 pb-3">Sales by Category</h3>
                    {categorySales.length > 0 ? (
                        <div className="space-y-4">
                            {categorySales.slice(0, 5).map((item, idx) => {
                                const maxSales = Math.max(...categorySales.map(c => c.revenue), 100);
                                const percentage = (item.revenue / maxSales) * 100;
                                return (
                                    <div key={idx} className="space-y-1">
                                        <div className="flex justify-between text-xs font-semibold">
                                            <span className="text-gray-700 uppercase tracking-wider">{item.category}</span>
                                            <span className="text-[var(--mehron)] font-bold">₹{item.revenue.toLocaleString()} ({item.quantity} units)</span>
                                        </div>
                                        <div className="w-full bg-gray-100 h-2">
                                            <div 
                                                className="bg-[var(--gold)] h-2 transition-all duration-500" 
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-center text-xs text-gray-400 py-16">No category sales metrics available</p>
                    )}
                </div>
            </div>

            {/* Inventory Monitoring & Top Selling Items Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* 1. Top Performing Products (2 Columns wide) */}
                <div className="lg:col-span-2 bg-white border border-[var(--border-mehron)] p-6 shadow-sm text-black">
                    <h3 className="text-sm font-bold text-[var(--mehron)] uppercase tracking-widest mb-6 border-b border-gray-100 pb-3">Top Performing Products</h3>
                    {topProducts.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {topProducts.map((prod, idx) => (
                                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 border border-gray-200 overflow-hidden flex-shrink-0">
                                            <img src={prod.image || '/placeholder.png'} alt={prod.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-[var(--mehron)] uppercase tracking-wider">{prod.name}</p>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">#{prod.productId.slice(-6).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-800">{prod.unitsSold} Units Sold</p>
                                        <p className="text-[10px] text-emerald-600 font-semibold">₹{prod.revenue.toLocaleString()} sales</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-xs text-gray-400 py-16">No sales records to fetch leaderboard</p>
                    )}
                </div>

                {/* 2. Order Status Summary Widget */}
                <div className="bg-white border border-[var(--border-mehron)] p-6 shadow-sm text-black">
                    <h3 className="text-sm font-bold text-[var(--mehron)] uppercase tracking-widest mb-6 border-b border-gray-100 pb-3">Order Status Distribution</h3>
                    <div className="space-y-4">
                        {Object.entries(orderStatuses).map(([status, count]) => {
                            const colors = {
                                pending: 'bg-yellow-500',
                                accepted: 'bg-indigo-500',
                                preparing: 'bg-purple-500',
                                ready: 'bg-blue-500',
                                completed: 'bg-emerald-500',
                                cancelled: 'bg-red-500'
                            };
                            return (
                                <div key={status} className="flex justify-between items-center text-xs">
                                    <div className="flex items-center space-x-2">
                                        <span className={`w-3 h-3 rounded-full ${colors[status] || 'bg-gray-400'}`}></span>
                                        <span className="text-gray-600 uppercase font-bold tracking-wider text-[10px]">{status}</span>
                                    </div>
                                    <span className="font-bold text-gray-800 text-sm">{count} orders</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Boutiques & Pending approvals grid list */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Active Shops */}
                <div className="bg-white rounded-none p-6 border border-[var(--border-mehron)] shadow-sm text-black">
                    <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-3">
                        <h3 className="text-sm font-bold text-[var(--mehron)] uppercase tracking-widest">Active Storefronts</h3>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{approvedShops.length} Total</span>
                    </div>
                    <div className="space-y-3">
                        {approvedShops.length > 0 ? (
                            approvedShops.slice(0, 4).map((shop) => (
                                <div key={shop._id} className="flex items-center justify-between p-3 bg-[var(--cream)]/35 border border-[var(--border-mehron)]/10 rounded-none hover:bg-[var(--gold-pale)] transition-colors cursor-pointer group"
                                    onClick={() => navigate('/admin/shops')}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-[var(--mehron)] text-[var(--gold)] rounded-none flex items-center justify-center font-bold text-sm border border-[var(--gold)]/20 shadow-md">
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
                            ))
                        ) : (
                            <p className="text-center text-xs text-gray-400 py-8">No approved boutique shops registered</p>
                        )}
                    </div>
                </div>

                {/* Pending KYC / Shops Approvals */}
                <div className="bg-white rounded-none p-6 border border-[var(--border-mehron)] shadow-sm text-black">
                    <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-3">
                        <h3 className="text-sm font-bold text-[var(--mehron)] uppercase tracking-widest">Shop Registration Tickets</h3>
                        <span className={`px-2 py-0.5 rounded-none text-[9px] font-bold uppercase tracking-widest border transition-all ${pendingShops.length > 0 ? 'bg-[var(--mehron)] text-white border-[var(--gold)] pulsate' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                            {pendingShops.length} Pending
                        </span>
                    </div>
                    <div className="space-y-3">
                        {pendingShops.length > 0 ? (
                            pendingShops.slice(0, 4).map((shop) => (
                                <div key={shop._id} className="p-4 bg-[var(--cream)]/35 border border-[var(--border-mehron)]/10 rounded-none hover:bg-[var(--gold-pale)] transition-colors">
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="font-bold text-[var(--mehron)] text-xs uppercase tracking-wider">{shop.shopName}</h4>
                                        <span className="px-2 py-0.5 bg-[var(--gold-pale)] text-[var(--mehron)] text-[9px] rounded-none border border-[var(--gold)]/20 font-bold uppercase tracking-widest">Pending</span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 mb-3 font-bold">{shop.ownerId?.email}</p>
                                    <button
                                        onClick={() => navigate('/admin/shops')}
                                        className="w-full bg-[var(--mehron)] hover:bg-[var(--mehron-deep)] text-white py-2 rounded-none text-[9px] font-bold uppercase tracking-[0.2em] border border-[var(--gold)] transition-all"
                                    >
                                        Review Credentials
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-gray-400">
                                <p className="text-xs font-bold uppercase tracking-widest text-[var(--mehron)]">No pending storefront registration requests</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
