import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { shopService } from '../../services/api';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [editing, setEditing] = useState(false);
    const [shopData, setShopData] = useState(null);
    const [loadingShop, setLoadingShop] = useState(false);
    const [showBecomeSellerForm, setShowBecomeSellerForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
            });

            // Check if user has a shop (for become seller feature)
            if (user.role === 'seller') {
                fetchShopStatus();
            }
        }
    }, [user]);

    const fetchShopStatus = async () => {
        setLoadingShop(true);
        try {
            const shop = await shopService.getMyShop();
            setShopData(shop);
        } catch (error) {
            console.log('No shop found or error:', error);
            setShopData(null);
        } finally {
            setLoadingShop(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSave = async () => {
        // TODO: Implement update profile API call
        alert('Profile update functionality will be implemented with backend API');
        setEditing(false);
    };

    const handleLogout = async () => {
        if (confirm('Are you sure you want to logout?')) {
            await logout();
            navigate('/');
        }
    };

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header Section */}
                <div className="border-b border-gray-200 pb-8 mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
                            <p className="mt-2 text-sm text-gray-600">Manage your personal information and preferences</p>
                        </div>
                        <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-2xl font-bold text-gray-700">{user.name?.charAt(0).toUpperCase()}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-1">
                        <nav className="space-y-1">
                            <button className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-900 bg-gray-50 rounded-md">
                                Personal Info
                            </button>
                            {user.role === 'customer' && (
                                <>
                                    <button
                                        onClick={() => navigate('/orders')}
                                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                                    >
                                        My Orders
                                    </button>
                                    <button
                                        onClick={() => navigate('/cart')}
                                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                                    >
                                        Shopping Cart
                                    </button>
                                </>
                            )}
                            {user.role === 'seller' && (
                                <>
                                    <button
                                        onClick={() => navigate('/seller/dashboard')}
                                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                                    >
                                        Seller Dashboard
                                    </button>
                                    <button
                                        onClick={() => navigate('/seller/products')}
                                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                                    >
                                        My Products
                                    </button>
                                    <button
                                        onClick={() => navigate('/seller/orders')}
                                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                                    >
                                        Shop Orders
                                    </button>
                                </>
                            )}
                            <div className="pt-4 border-t border-gray-200 mt-4">
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <div className="bg-white border border-gray-200 rounded-lg">
                            {/* Section Header */}
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                                {!editing ? (
                                    <button
                                        onClick={() => setEditing(true)}
                                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                    >
                                        Edit
                                    </button>
                                ) : (
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={() => setEditing(false)}
                                            className="text-sm font-medium text-gray-600 hover:text-gray-700"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Form Fields */}
                            <div className="px-6 py-6 space-y-6">
                                {/* Name Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name
                                    </label>
                                    {editing ? (
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            placeholder="Enter your full name"
                                        />
                                    ) : (
                                        <p className="text-gray-900 py-2.5">{user.name}</p>
                                    )}
                                </div>

                                {/* Email Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <p className="text-gray-900 py-2.5">{user.email}</p>
                                    <p className="text-xs text-gray-500 mt-1">Your email address cannot be changed</p>
                                </div>

                                {/* Phone Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number
                                    </label>
                                    {editing ? (
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            placeholder="Enter your phone number"
                                        />
                                    ) : (
                                        <p className="text-gray-900 py-2.5">{user.phone || 'Not provided'}</p>
                                    )}
                                </div>

                                {/* Role Badge */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Account Type
                                    </label>
                                    <div className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-md border border-gray-200">
                                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account Stats (Optional) */}
                        {user.role === 'customer' && (
                            <div className="mt-6 grid grid-cols-3 gap-4">
                                <div className="bg-white border border-gray-200 rounded-lg px-4 py-5">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Total Orders</p>
                                    <p className="mt-2 text-2xl font-bold text-gray-900">0</p>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-lg px-4 py-5">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Cart Items</p>
                                    <p className="mt-2 text-2xl font-bold text-gray-900">0</p>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-lg px-4 py-5">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Member Since</p>
                                    <p className="mt-2 text-sm font-semibold text-gray-900">2024</p>
                                </div>
                            </div>
                        )}

                        {/* Become a Seller Section - Only for customers (NOT admin) */}
                        {user.role === 'customer' && (
                            <div className="mt-6 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-6">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                                            <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Start Selling on Our Platform</h3>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Register your shop and reach thousands of customers. Simple process, quick approval!
                                        </p>
                                        <button
                                            onClick={() => navigate('/seller/register-shop')}
                                            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 transition-colors"
                                        >
                                            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            Become a Seller
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Seller Shop Status - Only for sellers */}
                        {user.role === 'seller' && (
                            <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Shop Status</h3>
                                {loadingShop ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent mx-auto"></div>
                                        <p className="text-sm text-gray-500 mt-2">Loading shop status...</p>
                                    </div>
                                ) : shopData ? (
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <p className="font-semibold text-gray-900">{shopData.shopName}</p>
                                                <p className="text-sm text-gray-500">{shopData.location?.city}</p>
                                            </div>
                                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${shopData.approvalStatus === 'approved'
                                                ? 'bg-green-100 text-green-800'
                                                : shopData.approvalStatus === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                {shopData.approvalStatus.charAt(0).toUpperCase() + shopData.approvalStatus.slice(1)}
                                            </span>
                                        </div>

                                        {shopData.approvalStatus === 'approved' && (
                                            <button
                                                onClick={() => navigate('/seller/dashboard')}
                                                className="w-full bg-emerald-600 text-white py-2 rounded-md hover:bg-emerald-700 font-medium"
                                            >
                                                Go to Seller Dashboard
                                            </button>
                                        )}

                                        {shopData.approvalStatus === 'pending' && (
                                            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                                                <p className="text-sm text-yellow-800">
                                                    ⏳ Your shop registration is under review. You'll be notified once approved by admin.
                                                </p>
                                            </div>
                                        )}

                                        {shopData.approvalStatus === 'rejected' && (
                                            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                                <p className="text-sm text-red-800 mb-2">
                                                    ❌ Your shop registration was rejected.
                                                </p>
                                                <button
                                                    onClick={() => navigate('/seller/register-shop')}
                                                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                                                >
                                                    Register Again →
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <p className="text-gray-500 mb-4">No shop registered yet</p>
                                        <button
                                            onClick={() => navigate('/seller/register-shop')}
                                            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700"
                                        >
                                            Register Your Shop
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
