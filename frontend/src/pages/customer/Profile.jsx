import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [editing, setEditing] = useState(false);
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
        }
    }, [user]);

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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
