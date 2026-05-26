import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    const isActive = (path) => location.pathname === path;

    /* ── Reusable nav link builder ── */
    const navLink = (to, label, iconPath) => (
        <Link
            to={to}
            className={`flex items-center px-3 py-2.5 rounded-lg transition-all group relative ${
                isActive(to)
                    ? 'bg-[var(--mehron)] text-white font-semibold shadow-md shadow-[var(--mehron)]/20'
                    : 'text-gray-600 hover:text-[var(--mehron)] hover:bg-[var(--mehron)]/5'
            }`}
        >
            <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={iconPath} />
            </svg>
            {!collapsed && <span className="ml-3 text-[13px] tracking-wide">{label}</span>}
            {collapsed && (
                <span className="absolute left-full ml-3 bg-gray-900 text-white px-2.5 py-1.5 text-[11px] rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg z-[60]">
                    {label}
                </span>
            )}
        </Link>
    );

    /* ── Section label ── */
    const sectionLabel = (text) =>
        !collapsed && (
            <span className="px-3 text-[10px] font-semibold text-gray-400 uppercase tracking-[0.15em] block mb-1.5 mt-1">
                {text}
            </span>
        );

    return (
        <div className="min-h-screen bg-gray-50/80 font-sans flex">
            {/* ═══════════════ Sidebar ═══════════════ */}
            <aside
                className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-50 flex flex-col transition-all duration-300 ${
                    collapsed ? 'w-[72px]' : 'w-[260px]'
                }`}
            >
                {/* Brand */}
                <div className="h-16 border-b border-gray-100 px-4 flex items-center justify-between">
                    {!collapsed && (
                        <div
                            className="flex items-center space-x-3 cursor-pointer"
                            onClick={() => navigate('/admin/dashboard')}
                        >
                            <div className="w-8 h-8 bg-[var(--mehron)] rounded-lg flex items-center justify-center shadow-sm">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            <span className="font-serif text-base font-bold text-gray-900 tracking-[0.15em]">KLYRA</span>
                        </div>
                    )}
                    {collapsed && (
                        <div
                            className="w-9 h-9 bg-[var(--mehron)] rounded-lg flex items-center justify-center mx-auto cursor-pointer shadow-sm"
                            onClick={() => navigate('/admin/dashboard')}
                        >
                            <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                    )}
                    {!collapsed && (
                        <button
                            onClick={() => setCollapsed(true)}
                            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-5 scrollbar-thin">

                    {/* Core */}
                    <div className="space-y-0.5">
                        {sectionLabel('Core')}
                        {navLink('/admin/dashboard', 'Dashboard',
                            'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z'
                        )}
                        {navLink('/admin/analytics', 'Analytics',
                            'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                        )}
                    </div>

                    {/* Catalog */}
                    <div className="space-y-0.5">
                        {sectionLabel('Catalog')}
                        {navLink('/admin/products', 'Products',
                            'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
                        )}
                        {navLink('/admin/categories', 'Categories',
                            'M4 6h16M4 12h16M4 18h7'
                        )}
                        {navLink('/admin/shoppable-videos', 'Shoppable Videos',
                            'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'
                        )}
                    </div>

                    {/* Partners */}
                    <div className="space-y-0.5">
                        {sectionLabel('Partners')}
                        {navLink('/admin/shops', 'Boutique Shops',
                            'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                        )}
                    </div>

                    {/* Financials */}
                    <div className="space-y-0.5">
                        {sectionLabel('Financials')}
                        {navLink('/admin/ledger', 'Settlements & KYC',
                            'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z'
                        )}
                        {navLink('/admin/refunds', 'Returns & Refunds',
                            'M16 15v-6a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z'
                        )}
                    </div>

                    {/* Engagement */}
                    <div className="space-y-0.5">
                        {sectionLabel('Engagement')}
                        {navLink('/admin/tailoring', 'Custom Tailoring',
                            'M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 2.121 3 3 0 004.243-2.121zm0-5.758a3 3 0 11-4.243-2.121 3 3 0 014.243 2.121z'
                        )}
                        {navLink('/admin/loyalty', 'VIP Loyalty',
                            'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a2 2 0 10-2 2h2zm0 0h4a2 2 0 110 4h-4m0-4h-4a2 2 0 100 4h4'
                        )}
                        {navLink('/admin/emails', 'Email Campaigns',
                            'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                        )}
                        {navLink('/admin/coupons', 'Coupons & Offers',
                            'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z'
                        )}
                    </div>

                    {/* Users */}
                    <div className="space-y-0.5">
                        {sectionLabel('Users')}
                        {navLink('/admin/users', 'Users Directory',
                            'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
                        )}
                    </div>
                </nav>

                {/* Logout */}
                <div className="p-3 border-t border-gray-100">
                    <button
                        onClick={() => logout()}
                        className={`w-full py-2.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center text-sm ${
                            collapsed ? 'px-0' : 'px-4'
                        }`}
                        title="Logout"
                    >
                        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {!collapsed && <span className="ml-2.5 text-[13px] font-medium">Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* ═══════════════ Main Content ═══════════════ */}
            <div
                className={`flex-1 min-h-screen flex flex-col transition-all duration-300 ${
                    collapsed ? 'pl-[72px]' : 'pl-[260px]'
                }`}
            >
                {/* Top Header */}
                <header className="bg-white border-b border-gray-200 h-16 px-8 flex items-center justify-between sticky top-0 z-40">

                    {/* Left: Toggle + Search */}
                    <div className="flex items-center space-x-4">
                        {collapsed && (
                            <button
                                onClick={() => setCollapsed(false)}
                                className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                </svg>
                            </button>
                        )}

                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search products, users, orders..."
                                className="bg-gray-50 text-gray-700 pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-[var(--mehron)] focus:ring-2 focus:ring-[var(--mehron)]/10 focus:outline-none w-80 text-sm placeholder-gray-400"
                            />
                            <svg className="w-4 h-4 absolute left-3.5 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center space-x-3">
                        {/* Notifications bell */}
                        <button className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors">
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </button>

                        {/* Divider */}
                        <div className="w-px h-8 bg-gray-200"></div>

                        {/* Profile */}
                        <div className="flex items-center space-x-3 cursor-pointer group">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-gray-800">{user?.name || 'Administrator'}</p>
                                <p className="text-[11px] text-gray-400 font-medium">Platform Admin</p>
                            </div>
                            <div className="w-9 h-9 bg-gradient-to-br from-[var(--mehron)] to-[var(--mehron-deep)] text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-sm group-hover:shadow-md transition-shadow">
                                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-8 bg-gray-50/60">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
