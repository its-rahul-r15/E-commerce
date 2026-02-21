import { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import AdminLayout from '../../components/admin/AdminLayout';

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
        <AdminLayout>
            <div className="flex justify-between items-center mb-8 meander-pattern pb-1">
                <div>
                    <h1 className="text-3xl font-bold uppercase tracking-widest text-white">Coupon Management</h1>
                    <p className="text-[var(--gold)] mt-2 text-[10px] uppercase tracking-[0.2em] font-bold">Manage platform discounts, expiry dates, and usage limits</p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-[var(--mehron)] text-white px-8 py-2.5 rounded-none border border-[var(--gold)] hover:bg-[var(--mehron-deep)] font-bold uppercase tracking-widest text-[10px] shadow-lg transition-all"
                    >
                        Create New Coupon
                    </button>
                )}
            </div>

            {/* Create/Edit Form */}
            {showForm && (
                <div className="bg-white border border-[var(--border-mehron)] rounded-none p-8 mb-12 shadow-md relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[var(--mehron)] meander-pattern"></div>
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-bold text-[var(--mehron)] uppercase tracking-widest">
                            {editingId ? 'Edit Coupon' : 'Create New Coupon'}
                        </h2>
                        <button
                            onClick={resetForm}
                            className="text-gray-400 hover:text-[var(--mehron)] transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Coupon Code */}
                            <div>
                                <label className="block text-[10px] font-bold text-[var(--mehron)] uppercase tracking-widest mb-2">
                                    Coupon Code *
                                </label>
                                <input
                                    type="text"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[var(--border-mehron)] rounded-none focus:ring-0 focus:border-[var(--gold)] outline-none uppercase font-bold text-[var(--mehron)] tracking-widest placeholder:text-gray-300"
                                    placeholder="e.g., SOVEREIGN20"
                                    required
                                />
                            </div>

                            {/* Discount Type */}
                            <div>
                                <label className="block text-[10px] font-bold text-[var(--mehron)] uppercase tracking-widest mb-2">
                                    Discount Type *
                                </label>
                                <select
                                    name="discountType"
                                    value={formData.discountType}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[var(--border-mehron)] rounded-none focus:ring-0 focus:border-[var(--gold)] outline-none font-bold text-[var(--mehron)] uppercase tracking-widest text-[10px]"
                                    required
                                >
                                    <option value="percentage">Percentage Allocation (%)</option>
                                    <option value="fixed">Fixed Tribute (₹)</option>
                                </select>
                            </div>

                            {/* Discount Value */}
                            <div>
                                <label className="block text-[10px] font-bold text-[var(--mehron)] uppercase tracking-widest mb-2">
                                    Discount Value *
                                </label>
                                <input
                                    type="number"
                                    name="discountValue"
                                    value={formData.discountValue}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[var(--border-mehron)] rounded-none focus:ring-0 focus:border-[var(--gold)] outline-none font-bold text-[var(--mehron)]"
                                    placeholder={formData.discountType === 'percentage' ? 'e.g., 20' : 'e.g., 100'}
                                    min="0"
                                    required
                                />
                            </div>

                            {/* Min Purchase */}
                            <div>
                                <label className="block text-[10px] font-bold text-[var(--mehron)] uppercase tracking-widest mb-2">
                                    Minimum Purchase (₹)
                                </label>
                                <input
                                    type="number"
                                    name="minPurchase"
                                    value={formData.minPurchase}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[var(--border-mehron)] rounded-none focus:ring-0 focus:border-[var(--gold)] outline-none font-bold text-[var(--mehron)]"
                                    placeholder="0"
                                    min="0"
                                />
                            </div>

                            {/* Expiry Date */}
                            <div>
                                <label className="block text-[10px] font-bold text-[var(--mehron)] uppercase tracking-widest mb-2">
                                    Expiry Date *
                                </label>
                                <input
                                    type="date"
                                    name="expiryDate"
                                    value={formData.expiryDate}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[var(--border-mehron)] rounded-none focus:ring-0 focus:border-[var(--gold)] outline-none font-bold text-[var(--mehron)] uppercase tracking-widest text-[10px]"
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>

                            {/* Usage Limit */}
                            <div>
                                <label className="block text-[10px] font-bold text-[var(--mehron)] uppercase tracking-widest mb-2">
                                    Usage Limit
                                </label>
                                <input
                                    type="number"
                                    name="usageLimit"
                                    value={formData.usageLimit}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[var(--border-mehron)] rounded-none focus:ring-0 focus:border-[var(--gold)] outline-none font-bold text-[var(--mehron)]"
                                    placeholder="Unlimited"
                                    min="1"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-[10px] font-bold text-[var(--mehron)] uppercase tracking-widest mb-2">
                                Coupon Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[var(--border-mehron)] rounded-none focus:ring-0 focus:border-[var(--gold)] outline-none font-bold text-[var(--mehron)] text-sm placeholder:italic"
                                rows="3"
                                placeholder="Describe the nature of this platform endowment..."
                                maxLength="500"
                            />
                        </div>

                        {/* Promotional Poster */}
                        <div>
                            <label className="block text-[10px] font-bold text-[var(--mehron)] uppercase tracking-widest mb-2">
                                Promotional Image (Optional)
                            </label>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePosterChange}
                                    className="hidden"
                                    id="poster-upload"
                                />
                                <label
                                    htmlFor="poster-upload"
                                    className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-[var(--gold)]/30 bg-[#FAF9F6] cursor-pointer hover:bg-[var(--gold-pale)]/10 transition-colors"
                                >
                                    <div className="text-center">
                                        <svg className="w-8 h-8 mx-auto mb-2 text-[var(--gold)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-[10px] font-bold text-[var(--mehron)] uppercase tracking-widest">Upload Promotional Image</p>
                                    </div>
                                </label>
                            </div>
                            {posterPreview && (
                                <div className="mt-4 border border-[var(--gold)] p-2 bg-white shadow-inner">
                                    <img
                                        src={posterPreview}
                                        alt="Poster Preview"
                                        className="max-h-64 mx-auto object-contain"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Active Status and Submit Buttons */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-6 border-t border-gray-100">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-[var(--mehron)] border-[var(--gold)] rounded-none focus:ring-0"
                                />
                                <label className="ml-2 text-[10px] font-bold text-[var(--mehron)] uppercase tracking-widest">
                                    Coupon Active
                                </label>
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-8 py-2.5 border border-gray-300 text-gray-500 rounded-none hover:bg-gray-50 font-bold uppercase tracking-widest text-[10px] transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-2.5 bg-[var(--mehron)] text-white rounded-none border border-[var(--gold)] hover:bg-[var(--mehron-deep)] font-bold uppercase tracking-widest text-[10px] shadow-lg transition-all"
                                >
                                    {editingId ? 'Update Coupon' : 'Create Coupon'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Decree Proclamations List */}
            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="animate-spin rounded-none h-12 w-12 border-2 border-[var(--gold)] border-t-transparent"></div>
                </div>
            ) : coupons.length === 0 ? (
                <div className="bg-white border border-[var(--border-mehron)] p-16 text-center shadow-sm">
                    <p className="text-[var(--mehron)] font-bold uppercase tracking-[0.2em] text-sm">No coupons found.</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="mt-6 text-[10px] font-bold text-[var(--gold)] uppercase tracking-widest hover:underline"
                    >
                        Create Your First Coupon
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {coupons.map((coupon) => (
                        <div key={coupon._id} className="bg-white border border-[var(--border-mehron)] group hover:border-[var(--gold)] transition-all shadow-sm relative">
                            {coupon.posterImage && (
                                <div className="h-48 overflow-hidden border-b border-[var(--border-mehron)]/10">
                                    <img
                                        src={coupon.posterImage}
                                        alt={coupon.code}
                                        className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-500"
                                    />
                                </div>
                            )}
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-[var(--mehron)] uppercase tracking-widest leading-none mb-1">{coupon.code}</h3>
                                        <p className="text-[10px] font-bold text-[var(--gold)] uppercase tracking-[0.15em]">
                                            {coupon.discountType === 'percentage'
                                                ? `${coupon.discountValue}% OFF`
                                                : `₹${coupon.discountValue} OFF`}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest border ${coupon.isActive
                                        ? 'bg-[var(--gold-pale)] text-[var(--mehron)] border-[var(--gold)]/20'
                                        : 'bg-gray-50 text-gray-400 border-gray-200'
                                        }`}>
                                        {coupon.isActive ? 'Active' : 'Draft'}
                                    </span>
                                </div>

                                {coupon.description && (
                                    <p className="text-[11px] text-gray-500 mb-4 line-clamp-2 italic font-serif">"{coupon.description}"</p>
                                )}

                                <div className="space-y-1.5 mb-6 border-t border-b border-gray-50 py-3">
                                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-tighter">
                                        <span className="text-gray-400">Min Purchase</span>
                                        <span className="text-[var(--mehron)]">₹{coupon.minPurchase || 0}</span>
                                    </div>
                                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-tighter">
                                        <span className="text-gray-400">Expires On</span>
                                        <span className="text-[var(--mehron)]">{new Date(coupon.expiryDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-tighter">
                                        <span className="text-gray-400">Times Used</span>
                                        <span className="text-[var(--mehron)] truncate">{coupon.usedCount} / {coupon.usageLimit || '∞'}</span>
                                    </div>
                                </div>

                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => handleEdit(coupon)}
                                        className="flex-1 py-2 border border-[var(--gold)] text-[var(--mehron)] text-[9px] font-bold uppercase tracking-widest hover:bg-[var(--gold-pale)] transition-all"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(coupon._id)}
                                        className="flex-1 py-2 bg-[var(--charcoal)] text-white text-[9px] font-bold uppercase tracking-widest hover:bg-black transition-all"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminCoupons;
