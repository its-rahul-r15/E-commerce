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
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-20 bg-gray-900/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 flex flex-col transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 lg:static lg:flex-shrink-0
            `}>
                {/* Logo */}
                <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center">
                            <ShoppingBagIcon className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">ShopLocal</span>
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
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all group ${isActive
                                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/20'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }`}
                            >
                                <Icon className={`h-5 w-5 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Back to Home */}
                <div className="px-4 py-2 border-t border-gray-800">
                    <Link
                        to="/"
                        className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all group"
                    >
                        <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Back to Home</span>
                    </Link>
                </div>

                {/* Shop Profile */}
                <div className="p-4 border-t border-gray-800">
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800/50">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-semibold text-sm">
                                {shop?.shopName?.charAt(0)?.toUpperCase() || 'S'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {shop?.shopName || 'My Shop'}
                            </p>
                            <p className="text-xs text-gray-400">Seller Account</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Bar */}
                <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-20 shadow-sm">
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
                                        placeholder="Search..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
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
                                <p className="font-semibold text-gray-900">{shop?.shopName || 'Loading...'}</p>
                                <p className="text-gray-500 text-xs">{shop?.category || 'Shop'}</p>
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
