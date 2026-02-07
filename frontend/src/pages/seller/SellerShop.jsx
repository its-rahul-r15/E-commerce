import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { shopService } from '../../services/api';

const SellerShop = () => {
    const navigate = useNavigate();
    const [shop, setShop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
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
        try {
            await shopService.updateShop(formData);
            alert('Shop updated successfully');
            setEditing(false);
            fetchShop();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to update shop');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (!shop) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-sm p-8 max-w-md text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">No Shop Found</h2>
                    <p className="text-gray-600 mb-6">Please register your shop first</p>
                    <button onClick={() => navigate('/seller/register-shop')} className="btn-primary">
                        Register Shop
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Shop Settings</h1>
                        <p className="text-gray-600 mt-1">Manage your shop information</p>
                    </div>
                    <button
                        onClick={() => navigate('/seller/dashboard')}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        ← Back to Dashboard
                    </button>
                </div>

                {/* Shop Status */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-1">Shop Status</h3>
                            <p className="text-sm text-gray-600">
                                Current status of your shop
                            </p>
                        </div>
                        <span
                            className={`px-4 py-2 rounded-full text-sm font-medium ${shop.status === 'approved'
                                    ? 'bg-green-100 text-green-800'
                                    : shop.status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : shop.status === 'rejected'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-gray-100 text-gray-800'
                                }`}
                        >
                            {shop.status.toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* Shop Information */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Shop Information</h3>
                        {!editing && (
                            <button
                                onClick={() => setEditing(true)}
                                className="text-primary hover:text-primary-dark font-medium"
                            >
                                Edit
                            </button>
                        )}
                    </div>

                    {editing ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Shop Name *
                                </label>
                                <input
                                    type="text"
                                    name="shopName"
                                    value={formData.shopName}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone *
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    pattern="[6-9]\d{9}"
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category *
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                >
                                    <option value="">Select Category</option>
                                    <option value="Grocery">Grocery</option>
                                    <option value="Electronics">Electronics</option>
                                    <option value="Clothing">Clothing</option>
                                    <option value="Pharmacy">Pharmacy</option>
                                    <option value="Restaurant">Restaurant</option>
                                    <option value="Bakery">Bakery</option>
                                    <option value="Hardware">Hardware</option>
                                    <option value="Books">Books</option>
                                    <option value="Jewelry">Jewelry</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="flex space-x-4">
                                <button type="submit" className="btn-primary">
                                    Save Changes
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
                                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600">Shop Name</p>
                                <p className="font-medium text-gray-900">{shop.shopName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Description</p>
                                <p className="font-medium text-gray-900">
                                    {shop.description || 'No description'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Phone</p>
                                <p className="font-medium text-gray-900">{shop.phone}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Category</p>
                                <p className="font-medium text-gray-900">{shop.category}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Address</p>
                                <p className="font-medium text-gray-900">
                                    {shop.address?.street}, {shop.address?.city},{' '}
                                    {shop.address?.state} - {shop.address?.pincode}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Rating</p>
                                <p className="font-medium text-gray-900">
                                    {shop.rating?.toFixed(1) || 'No ratings yet'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SellerShop;
