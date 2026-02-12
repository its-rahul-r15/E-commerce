import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { shopService } from '../../services/api';
import SellerLayout from '../../components/layout/SellerLayout';
import {
    BuildingStorefrontIcon,
    PencilIcon,
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon,
    MapPinIcon,
    PhoneIcon,
    TagIcon,
    StarIcon,
    InformationCircleIcon,
} from '@heroicons/react/24/outline';

const SellerShop = () => {
    const navigate = useNavigate();
    const [shop, setShop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        shopName: '',
        description: '',
        phone: '',
        category: '',
    });

    useEffect(() => {
        fetchShop();
    }, []);

    const fetchShop = async () => {
        try {
            const data = await shopService.getMyShop();
            setShop(data.shop);
            setFormData({
                shopName: data.shop.shopName,
                description: data.shop.description || '',
                phone: data.shop.phone,
                category: data.shop.category,
            });
        } catch (error) {
            console.error('Error fetching shop:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await shopService.updateShop(formData);
            alert('Shop updated successfully');
            setEditing(false);
            fetchShop();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to update shop');
        } finally {
            setSubmitting(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const getStatusConfig = (status) => {
        const configs = {
            approved: {
                color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                icon: CheckCircleIcon,
                label: 'Approved',
                message: 'Your shop is active and visible to customers',
            },
            pending: {
                color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
                icon: ClockIcon,
                label: 'Pending',
                message: 'Your shop is under review by our team',
            },
            rejected: {
                color: 'bg-red-50 text-red-700 border-red-200',
                icon: XCircleIcon,
                label: 'Rejected',
                message: 'Please contact support for more information',
            },
        };
        return configs[status] || configs.pending;
    };

    if (loading) {
        return (
            <SellerLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading shop details...</p>
                    </div>
                </div>
            </SellerLayout>
        );
    }

    if (!shop) {
        return (
            <SellerLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center border border-gray-200">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BuildingStorefrontIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Shop Found</h2>
                        <p className="text-gray-600 mb-6">Please register your shop first</p>
                        <button
                            onClick={() => navigate('/seller/register-shop')}
                            className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                            Register Shop
                        </button>
                    </div>
                </div>
            </SellerLayout>
        );
    }

    const statusConfig = getStatusConfig(shop.status);
    const StatusIcon = statusConfig.icon;

    return (
        <SellerLayout>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Shop Settings</h1>
                <p className="text-gray-600 mt-1">Manage your shop information and settings</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Shop Status Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center">
                                <InformationCircleIcon className="h-5 w-5 mr-2 text-gray-600" />
                                Shop Status
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="flex items-start space-x-4">
                                <div className={`p-3 rounded-lg border ${statusConfig.color}`}>
                                    <StatusIcon className="h-8 w-8" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {statusConfig.label}
                                        </h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.color}`}>
                                            {shop.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-gray-600">{statusConfig.message}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shop Information Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center">
                                <BuildingStorefrontIcon className="h-5 w-5 mr-2 text-gray-600" />
                                Shop Information
                            </h2>
                            {!editing && (
                                <button
                                    onClick={() => setEditing(true)}
                                    className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
                                >
                                    <PencilIcon className="h-4 w-4" />
                                    <span>Edit</span>
                                </button>
                            )}
                        </div>

                        <div className="p-6">
                            {editing ? (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* Shop Name */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Shop Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="shopName"
                                            value={formData.shopName}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                                            placeholder="Enter shop name"
                                        />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows={4}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none resize-none"
                                            placeholder="Describe your shop..."
                                        />
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Phone <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                required
                                                pattern="[6-9]\d{9}"
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                                                placeholder="Enter phone number"
                                            />
                                        </div>
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Category <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none bg-white"
                                        >
                                            <option value="">Select Category</option>
                                            <option value="Grocery">🛒 Grocery</option>
                                            <option value="Electronics">📱 Electronics</option>
                                            <option value="Clothing">👗 Clothing</option>
                                            <option value="Pharmacy">💊 Pharmacy</option>
                                            <option value="Restaurant">🍽️ Restaurant</option>
                                            <option value="Bakery">🍰 Bakery</option>
                                            <option value="Hardware">🔧 Hardware</option>
                                            <option value="Books">📚 Books</option>
                                            <option value="Jewelry">💎 Jewelry</option>
                                            <option value="Other">📦 Other</option>
                                        </select>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex space-x-3 pt-4">
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="flex-1 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {submitting ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditing(false);
                                                setFormData({
                                                    shopName: shop.shopName,
                                                    description: shop.description || '',
                                                    phone: shop.phone,
                                                    category: shop.category,
                                                });
                                            }}
                                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-5">
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <p className="text-xs text-gray-500 mb-1 font-medium">Shop Name</p>
                                        <p className="text-lg font-bold text-gray-900">{shop.shopName}</p>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <p className="text-xs text-gray-500 mb-1 font-medium">Description</p>
                                        <p className="text-gray-700 leading-relaxed">
                                            {shop.description || 'No description provided'}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <PhoneIcon className="h-4 w-4 text-gray-500" />
                                                <p className="text-xs text-gray-500 font-medium">Phone</p>
                                            </div>
                                            <p className="font-semibold text-gray-900">{shop.phone}</p>
                                        </div>

                                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <TagIcon className="h-4 w-4 text-gray-500" />
                                                <p className="text-xs text-gray-500 font-medium">Category</p>
                                            </div>
                                            <p className="font-semibold text-gray-900">{shop.category}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Additional Info */}
                <div className="space-y-6">
                    {/* Address Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h3 className="font-bold text-gray-900 flex items-center">
                                <MapPinIcon className="h-5 w-5 mr-2 text-gray-600" />
                                Location
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-2">
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    {shop.address?.street}
                                </p>
                                <p className="text-sm text-gray-700">
                                    {shop.address?.city}, {shop.address?.state}
                                </p>
                                <p className="text-sm font-semibold text-gray-900">
                                    PIN: {shop.address?.pincode}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Rating Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h3 className="font-bold text-gray-900 flex items-center">
                                <StarIcon className="h-5 w-5 mr-2 text-gray-600" />
                                Rating
                            </h3>
                        </div>
                        <div className="p-6 text-center">
                            <div className="text-5xl font-bold text-gray-900 mb-2">
                                {shop.rating?.toFixed(1) || '0.0'}
                            </div>
                            <div className="flex items-center justify-center space-x-1 mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <StarIcon
                                        key={i}
                                        className={`h-6 w-6 ${i < Math.floor(shop.rating || 0)
                                                ? 'text-yellow-400 fill-yellow-400'
                                                : 'text-gray-300'
                                            }`}
                                    />
                                ))}
                            </div>
                            <p className="text-sm text-gray-600">
                                {shop.rating ? 'Customer Rating' : 'No ratings yet'}
                            </p>
                        </div>
                    </div>

                    {/* Shop ID */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
                        <h3 className="font-bold text-emerald-900 mb-3">Shop ID</h3>
                        <p className="text-sm font-mono bg-white px-3 py-2 rounded-lg truncate text-gray-700 border border-emerald-200">
                            {shop._id}
                        </p>
                        <p className="text-xs text-emerald-700 mt-3">
                            Created: {new Date(shop.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>
        </SellerLayout>
    );
};

export default SellerShop;
