import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const navItems = [
        { path: '/admin/dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', label: 'Dashboard' },
        { path: '/admin/shops', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', label: 'Shops' },
        { path: '/admin/products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', label: 'Products' },
        { path: '/admin/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', label: 'Users' },
        { path: '/admin/coupons', icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z', label: 'Coupons' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-[var(--charcoal)] text-white font-serif">
            {/* Sidebar */}
            <div className="fixed left-0 top-0 h-full w-20 bg-[var(--mehron)] flex flex-col items-center py-6 space-y-8 border-r border-[var(--gold)]/30 z-50 shadow-2xl">
                {/* Logo */}
                <div className="w-12 h-12 bg-white rounded-none flex items-center justify-center cursor-pointer border border-[var(--gold)]" onClick={() => navigate('/admin/dashboard')}>
                    <svg className="w-8 h-8 text-[var(--mehron)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                </div>

                {/* Navigation Icons */}
                <nav className="flex flex-col space-y-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`w-12 h-12 rounded-none flex items-center justify-center transition-all border ${isActive(item.path)
                                ? 'bg-[var(--gold)] text-[var(--mehron)] border-[var(--gold)] shadow-lg scale-110'
                                : 'bg-[var(--mehron-deep)] text-[var(--gold)] border-[var(--gold)]/20 hover:border-[var(--gold)]/50 hover:bg-[var(--mehron)] shadow-sm'
                                }`}
                            title={item.label}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                            </svg>
                        </Link>
                    ))}
                </nav>

                <div className="mt-auto">
                    <button
                        onClick={() => logout()}
                        className="w-12 h-12 bg-[var(--mehron-deep)] text-[var(--gold)] border border-[var(--gold)]/20 rounded-none flex items-center justify-center hover:bg-black transition-colors"
                        title="Logout"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="ml-20 min-h-screen">
                {/* Top Header */}
                <div className="bg-[var(--mehron)] border-b border-[var(--gold)]/30 px-8 py-4 flex items-center justify-between sticky top-0 z-40 meander-pattern">
                    <div>
                        <h1 className="text-2xl font-bold uppercase tracking-widest text-[var(--gold)]">Admin Panel</h1>
                    </div>
                    <div className="flex items-center space-x-6">
                        {/* Search */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search products, shops, users..."
                                className="bg-[var(--mehron-deep)] text-white pl-10 pr-4 py-2 rounded-none border border-[var(--gold)]/30 focus:border-[var(--gold)] focus:outline-none w-80 text-sm font-serif"
                            />
                            <svg className="w-5 h-5 absolute left-3 top-2.5 text-[var(--gold)]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        {/* User Profile */}
                        <div className="flex items-center space-x-3 border-l border-[var(--gold)]/30 pl-6">
                            <div className="text-right">
                                <p className="text-xs font-bold text-white uppercase tracking-widest">{user?.name || 'Administrator'}</p>
                                <p className="text-[9px] text-[var(--gold)] uppercase tracking-[0.2em]">Sovereign Authority</p>
                            </div>
                            <div className="w-10 h-10 bg-[var(--gold)] text-[var(--mehron)] rounded-none flex items-center justify-center font-bold border border-[var(--mehron-deep)] shadow-inner">
                                {user?.name?.charAt(0)?.toUpperCase() || 'C'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <div className="p-8">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
