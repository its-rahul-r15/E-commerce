import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { shopService } from '../../services/api';
import ImageUpload from '../../components/common/ImageUpload';

const RegisterShop = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        shopName: '',
        description: '',
        category: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        pincode: '',
        latitude: '',
        longitude: '',
    });
    const [imagePreviews, setImagePreviews] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [gettingLocation, setGettingLocation] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleImagesChange = (previews) => {
        setImagePreviews(previews);
    };

    const getCurrentLocation = () => {
        setGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData({
                    ...formData,
                    latitude: position.coords.latitude.toString(),
                    longitude: position.coords.longitude.toString(),
                });
                setGettingLocation(false);
                alert('Location captured successfully!');
            },
            (error) => {
                console.error('Location error:', error);
                alert('Unable to get location. Please enter manually.');
                setGettingLocation(false);
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.shopName || !formData.description || !formData.category || !formData.phone ||
            !formData.street || !formData.city || !formData.state || !formData.pincode ||
            !formData.latitude || !formData.longitude) {
            alert('Please fill all required fields');
            return;
        }

        if (imagePreviews.length === 0) {
            alert('Please upload at least one shop image');
            return;
        }

        setSubmitting(true);
        try {
            const data = new FormData();
            data.append('shopName', formData.shopName);
            data.append('description', formData.description);
            data.append('category', formData.category);
            data.append('phone', formData.phone);
            data.append('address[street]', formData.street);
            data.append('address[city]', formData.city);
            data.append('address[state]', formData.state);
            data.append('address[pincode]', formData.pincode);
            data.append('location[coordinates][0]', formData.longitude);
            data.append('location[coordinates][1]', formData.latitude);

            // Add images (only file objects)
            imagePreviews.forEach(preview => {
                if (preview.file) {
                    data.append('images', preview.file);
                }
            });

            await shopService.createShop(data);
            alert('Shop registered successfully! Waiting for admin approval.');
            navigate('/seller/dashboard');
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to register shop');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--charcoal)] py-12 px-4 sm:px-6 lg:px-8 font-serif">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-10 meander-pattern pb-4">
                    <div className="inline-block p-4 bg-[var(--mehron)] border border-[var(--gold)] rounded-none mb-4 shadow-lg">
                        <svg className="w-12 h-12 text-[var(--gold)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2 uppercase tracking-widest">Establish Your Boutique</h1>
                    <p className="text-[var(--gold)] text-[10px] uppercase tracking-[0.3em] font-bold">Inscribe your legacy in our curated marketplace</p>
                </div>

                {/* Main Form Card */}
                <form onSubmit={handleSubmit} className="bg-white rounded-none shadow-2xl border border-[var(--border-mehron)] overflow-hidden">
                    <div className="p-8 space-y-10">
                        {/* Basic Information Section */}
                        <div>
                            <div className="flex items-center mb-6">
                                <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center mr-3">
                                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-bold text-white">Basic Information</h2>
                            </div>

                            <div className="space-y-6">
                                {/* Shop Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                                        Shop Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="shopName"
                                        required
                                        value={formData.shopName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-[var(--cream)]/30 border border-[var(--border-mehron)] rounded-none text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-[var(--gold)] focus:border-[var(--gold)] transition-all outline-none"
                                        placeholder="e.g., The Athenic Emporium"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        required
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full px-4 py-3 bg-[var(--cream)]/30 border border-[var(--border-mehron)] rounded-none text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-[var(--gold)] focus:border-[var(--gold)] transition-all outline-none resize-none"
                                        placeholder="Describe the essence of your boutique..."
                                    />
                                </div>

                                {/* Category & Phone */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-300 mb-2">
                                            Category <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="category"
                                            required
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        >
                                            <option value="">Select category</option>
                                            <option value="Electronics">Electronics</option>
                                            <option value="Fashion">Fashion</option>
                                            <option value="Home & Kitchen">Home & Kitchen</option>
                                            <option value="Books">Books</option>
                                            <option value="Sports">Sports</option>
                                            <option value="Grocery">Grocery</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-300 mb-2">
                                            Phone Number <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            required
                                            pattern="[0-9]{10}"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="10-digit number"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Address Section */}
                        <div className="border-t border-slate-700 pt-8">
                            <div className="flex items-center mb-6">
                                <div className="w-10 h-10 bg-emerald-600/20 rounded-xl flex items-center justify-center mr-3">
                                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-bold text-white">Shop Address</h2>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                                        Street Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="street"
                                        required
                                        value={formData.street}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Shop number, Building name, Street"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-300 mb-2">
                                            City <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            required
                                            value={formData.city}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="City"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-300 mb-2">
                                            State <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="state"
                                            required
                                            value={formData.state}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="State"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                                        Pincode <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="pincode"
                                        required
                                        pattern="[0-9]{6}"
                                        value={formData.pincode}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="6-digit pincode"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Location Section */}
                        <div className="border-t border-slate-700 pt-8">
                            <div className="flex items-center mb-6">
                                <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center mr-3">
                                    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Location Coordinates</h2>
                                    <p className="text-sm text-slate-400 mt-1">Helps customers discover your shop within 5km</p>
                                </div>
                            </div>

                            1:                             <div className="mb-6">
                                <button
                                    type="button"
                                    onClick={getCurrentLocation}
                                    disabled={gettingLocation}
                                    className="w-full md:w-auto px-8 py-4 bg-[var(--mehron)] hover:bg-[var(--mehron-deep)] text-white font-serif text-[11px] uppercase tracking-[0.2em] rounded-none border border-[var(--gold)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-md"
                                >
                                    <svg className="w-5 h-5 text-[var(--gold)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    </svg>
                                    <span>{gettingLocation ? 'Aligning Stars...' : 'Capture Current Coordinates'}</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                                        Latitude <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="latitude"
                                        required
                                        value={formData.latitude}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="e.g., 28.6139"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                                        Longitude <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="longitude"
                                        required
                                        value={formData.longitude}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="e.g., 77.2090"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Images Section */}
                        <div className="border-t border-slate-700 pt-8">
                            <div className="flex items-center mb-6">
                                <div className="w-10 h-10 bg-orange-600/20 rounded-xl flex items-center justify-center mr-3">
                                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Shop Images</h2>
                                    <p className="text-sm text-slate-400 mt-1">Upload 1-3 high-quality images (storefront, interior)</p>
                                </div>
                            </div>

                            <ImageUpload
                                images={imagePreviews}
                                onImagesChange={handleImagesChange}
                                maxImages={3}
                                label=""
                                multiple={true}
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="bg-[var(--cream)]/20 px-8 py-6 border-t border-[var(--border-mehron)] flex flex-col sm:flex-row gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/seller/dashboard')}
                            className="flex-1 px-6 py-4 border border-[var(--gold)] text-[var(--mehron)] font-serif text-[11px] uppercase tracking-[0.2em] rounded-none hover:bg-[var(--gold-pale)]/50 transition-all font-bold"
                        >
                            Withdraw
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-6 py-4 bg-[var(--mehron)] text-white font-serif text-[11px] uppercase tracking-[0.2em] rounded-none hover:bg-[var(--mehron-deep)] border border-[var(--gold)] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-[var(--mehron)]/20 font-bold"
                        >
                            {submitting ? (
                                <span className="flex items-center justify-center space-x-2">
                                    <svg className="animate-spin h-5 w-5 text-[var(--gold)]" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>Inscribing...</span>
                                </span>
                            ) : 'Establish Boutique'}
                        </button>
                    </div>
                </form>

                {/* Info Card */}
                <div className="mt-8 bg-blue-900/20 border border-blue-700 rounded-2xl p-6">
                    <div className="flex items-start space-x-3">
                        <svg className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h3 className="text-white font-semibold mb-1">What happens next?</h3>
                            <p className="text-slate-400 text-sm">
                                After registration, your shop will be reviewed by our admin team within 24-48 hours.
                                You'll receive a notification once your shop is approved and ready to start selling.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterShop;
