import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { shopService } from '../../services/api';
import {
    HomeIcon,
    ShoppingBagIcon,
    ShoppingCartIcon,
    CubeIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    MagnifyingGlassIcon,
    BellIcon,
    ArrowLeftIcon,
    Bars3Icon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

const SellerLayout = ({ children }) => {
    const location = useLocation();
    const [shop, setShop] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        fetchShop();
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const fetchShop = async () => {
        try {
            const data = await shopService.getMyShop();
            setShop(data.shop);
        } catch (error) {
            console.error('Error fetching shop:', error);
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

    return (
        <div className="min-h-screen bg-[var(--cream)] flex">
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-20 bg-gray-900/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-30 w-64 bg-[var(--charcoal)] flex flex-col transition-transform duration-300 ease-in-out border-r border-[var(--border-mehron)]
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 lg:static lg:flex-shrink-0
            `}>
                {/* Logo */}
                <div className="p-6 border-b border-[var(--border-mehron)] flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[var(--mehron)] rounded-lg flex items-center justify-center border border-[var(--gold)]">
                            <ShoppingBagIcon className="h-6 w-6 text-[var(--gold)]" />
                        </div>
                        <span className="text-xl font-serif font-bold text-white tracking-widest uppercase">Athenic</span>
                    </div>
                    {/* Close button for mobile */}
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="lg:hidden text-gray-400 hover:text-white"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path ||
                            (item.path === '/seller/products' && location.pathname.startsWith('/seller/products'));
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-none transition-all group ${isActive
                                    ? 'bg-[var(--mehron)] text-white border border-[var(--gold)] shadow-lg'
                                    : 'text-gray-400 hover:bg-[var(--mehron-deep)] hover:text-white'
                                    }`}
                            >
                                <Icon className={`h-5 w-5 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Back to Home */}
                <div className="px-4 py-2 border-t border-[var(--border-mehron)]">
                    <Link
                        to="/"
                        className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-[var(--gold)] hover:bg-[var(--mehron-deep)] rounded-none transition-all group"
                    >
                        <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-serif text-sm uppercase tracking-wider">Back to Home</span>
                    </Link>
                </div>

                {/* Shop Profile */}
                <div className="p-4 border-t border-[var(--border-mehron)]">
                    <div className="flex items-center space-x-3 p-3 rounded-none bg-[var(--mehron-deep)]/30 border border-[var(--border-mehron)]">
                        <div className="w-10 h-10 bg-[var(--gold)] rounded-none flex items-center justify-center flex-shrink-0 border border-[var(--mehron)]">
                            <span className="text-[var(--mehron)] font-serif font-bold text-sm">
                                {shop?.shopName?.charAt(0)?.toUpperCase() || 'S'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-serif font-bold text-white truncate uppercase tracking-wider">
                                {shop?.shopName || 'My Shop'}
                            </p>
                            <p className="text-[10px] font-serif uppercase text-gray-400 tracking-widest">Athenic Boutique</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Bar */}
                <div className="bg-[var(--ivory)]/80 backdrop-blur-sm border-b border-[var(--border-mehron)] sticky top-0 z-20 shadow-sm">
                    <div className="px-4 sm:px-8 py-4 flex items-center justify-between">
                        <div className="flex items-center flex-1 gap-4">
                            {/* Mobile Hamburger */}
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                <Bars3Icon className="h-6 w-6" />
                            </button>

                            {/* Search Input */}
                            <div className="flex-1 max-w-2xl">
                                <div className="relative">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Seek your treasures..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-[var(--cream)] border border-[var(--border-mehron)] rounded-none focus:outline-none focus:ring-1 focus:ring-[var(--gold)]/30 focus:border-[var(--gold)] transition-all text-sm font-serif"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Notifications & Shop Info */}
                        <div className="flex items-center space-x-2 sm:space-x-4 ml-4">
                            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                                <BellIcon className="h-6 w-6" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                            <div className="hidden sm:block text-sm text-right">
                                <p className="font-serif font-bold text-[var(--mehron)] uppercase tracking-wider">{shop?.shopName || 'Loading...'}</p>
                                <p className="text-[var(--gold)] font-serif text-[10px] uppercase tracking-widest">{shop?.category || 'Boutique'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <div className="p-4 sm:p-8 flex-1 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default SellerLayout;
