import { useState, useEffect } from 'react';
import axios from '../../utils/axios';

const AdminCoupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [posterPreview, setPosterPreview] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        minPurchase: '',
        expiryDate: '',
        usageLimit: '',
        description: '',
        isActive: true,
        posterImage: null,
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const response = await axios.get('/coupons');
            setCoupons(response.data.data.coupons || []);
        } catch (error) {
            console.error('Error fetching coupons:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handlePosterChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, posterImage: file });
            setPosterPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let response;

            // Only use FormData if there's a poster image
            if (formData.posterImage) {
                const data = new FormData();
                Object.keys(formData).forEach(key => {
                    if (formData[key] !== null && formData[key] !== '') {
                        data.append(key, formData[key]);
                    }
                });

                if (editingId) {
                    response = await axios.patch(`/coupons/${editingId}`, data, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                } else {
                    response = await axios.post('/coupons', data, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                }
            } else {
                // Send as JSON if no image
                const data = { ...formData };
                delete data.posterImage; // Remove null posterImage field

                if (editingId) {
                    response = await axios.patch(`/coupons/${editingId}`, data);
                } else {
                    response = await axios.post('/coupons', data);
                }
            }

            fetchCoupons();
            resetForm();
            alert(editingId ? 'Coupon updated successfully!' : 'Coupon created successfully!');
        } catch (error) {
            console.error('Error saving coupon:', error.response?.data);
            alert(error.response?.data?.message || 'Error saving coupon');
        }
    };

    const handleEdit = (coupon) => {
        setEditingId(coupon._id);
        setFormData({
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            minPurchase: coupon.minPurchase,
            expiryDate: new Date(coupon.expiryDate).toISOString().split('T')[0],
            usageLimit: coupon.usageLimit || '',
            description: coupon.description || '',
            isActive: coupon.isActive,
            posterImage: null,
        });
        setPosterPreview(coupon.posterImage);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this coupon?')) return;
        try {
            await axios.delete(`/coupons/${id}`);
            fetchCoupons();
            alert('Coupon deleted successfully!');
        } catch (error) {
            alert(error.response?.data?.message || 'Error deleting coupon');
        }
    };

    const resetForm = () => {
        setFormData({
            code: '',
            discountType: 'percentage',
            discountValue: '',
            minPurchase: '',
            expiryDate: '',
            usageLimit: '',
            description: '',
            isActive: true,
            posterImage: null,
        });
        setPosterPreview(null);
        setEditingId(null);
        setShowForm(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Coupon Management</h1>
                    {!showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-blue-600 text-white px-6 py-2.5 rounded-md hover:bg-blue-700 font-medium"
                        >
                            Create New Coupon
                        </button>
                    )}
                </div>

                {/* Create/Edit Form */}
                {showForm && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {editingId ? 'Edit Coupon' : 'Create New Coupon'}
                            </h2>
                            <button
                                onClick={resetForm}
                                className="text-gray-600 hover:text-gray-800"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Coupon Code */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Coupon Code *
                                    </label>
                                    <input
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                                        placeholder="e.g., SAVE20"
                                        required
                                    />
                                </div>

                                {/* Discount Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Discount Type *
                                    </label>
                                    <select
                                        name="discountType"
                                        value={formData.discountType}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                        required
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (₹)</option>
                                    </select>
                                </div>

                                {/* Discount Value */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Discount Value *
                                    </label>
                                    <input
                                        type="number"
                                        name="discountValue"
                                        value={formData.discountValue}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder={formData.discountType === 'percentage' ? 'e.g., 20' : 'e.g., 100'}
                                        min="0"
                                        required
                                    />
                                </div>

                                {/* Min Purchase */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Minimum Purchase (₹)
                                    </label>
                                    <input
                                        type="number"
                                        name="minPurchase"
                                        value={formData.minPurchase}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>

                                {/* Expiry Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Expiry Date *
                                    </label>
                                    <input
                                        type="date"
                                        name="expiryDate"
                                        value={formData.expiryDate}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                </div>

                                {/* Usage Limit */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Usage Limit
                                    </label>
                                    <input
                                        type="number"
                                        name="usageLimit"
                                        value={formData.usageLimit}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Unlimited"
                                        min="1"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                    rows="3"
                                    placeholder="Enter coupon description..."
                                    maxLength="500"
                                />
                            </div>

                            {/* Promotional Poster */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Promotional Poster
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePosterChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                {posterPreview && (
                                    <div className="mt-4">
                                        <img
                                            src={posterPreview}
                                            alt="Poster Preview"
                                            className="max-h-48 rounded-md border border-gray-200"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Active Status */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label className="ml-2 text-sm font-medium text-gray-700">
                                    Active
                                </label>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                                >
                                    {editingId ? 'Update Coupon' : 'Create Coupon'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Coupons List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
                    </div>
                ) : coupons.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                        <p className="text-gray-500">No coupons found. Create your first coupon!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {coupons.map((coupon) => (
                            <div key={coupon._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                {coupon.posterImage && (
                                    <img
                                        src={coupon.posterImage}
                                        alt={coupon.code}
                                        className="w-full h-48 object-cover"
                                    />
                                )}
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{coupon.code}</h3>
                                            <p className="text-sm text-gray-600">
                                                {coupon.discountType === 'percentage'
                                                    ? `${coupon.discountValue}% OFF`
                                                    : `₹${coupon.discountValue} OFF`}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded ${coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {coupon.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>

                                    {coupon.description && (
                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{coupon.description}</p>
                                    )}

                                    <div className="text-xs text-gray-500 space-y-1 mb-4">
                                        <p>Min Purchase: ₹{coupon.minPurchase || 0}</p>
                                        <p>Expires: {new Date(coupon.expiryDate).toLocaleDateString()}</p>
                                        <p>Used: {coupon.usedCount} / {coupon.usageLimit || '∞'}</p>
                                    </div>

                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(coupon)}
                                            className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 text-sm font-medium"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(coupon._id)}
                                            className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 text-sm font-medium"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminCoupons;
