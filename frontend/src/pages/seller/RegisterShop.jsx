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
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Register Your Shop</h1>
                    <p className="text-gray-600 mt-2">Fill in the details to start selling</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                    {/* Shop Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Shop Name *
                        </label>
                        <input
                            type="text"
                            name="shopName"
                            required
                            value={formData.shopName}
                            onChange={handleChange}
                            className="input"
                            placeholder="Enter your shop name"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description *
                        </label>
                        <textarea
                            name="description"
                            required
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="input"
                            placeholder="Describe your shop and what you sell"
                        />
                    </div>

                    {/* Category & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category *
                            </label>
                            <select
                                name="category"
                                required
                                value={formData.category}
                                onChange={handleChange}
                                className="input"
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                required
                                pattern="[0-9]{10}"
                                value={formData.phone}
                                onChange={handleChange}
                                className="input"
                                placeholder="10-digit phone number"
                            />
                        </div>
                    </div>

                    {/* Address Section */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Shop Address</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Street Address *
                                </label>
                                <input
                                    type="text"
                                    name="street"
                                    required
                                    value={formData.street}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="Shop number, Building, Street"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        City *
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        required
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="City"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        State *
                                    </label>
                                    <input
                                        type="text"
                                        name="state"
                                        required
                                        value={formData.state}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="State"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Pincode *
                                </label>
                                <input
                                    type="text"
                                    name="pincode"
                                    required
                                    pattern="[0-9]{6}"
                                    value={formData.pincode}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="6-digit pincode"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Location Section */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Coordinates</h3>

                        <div className="mb-4">
                            <button
                                type="button"
                                onClick={getCurrentLocation}
                                disabled={gettingLocation}
                                className="btn-secondary disabled:opacity-50"
                            >
                                {gettingLocation ? 'Getting Location...' : '📍 Use My Current Location'}
                            </button>
                            <p className="text-xs text-gray-500 mt-2">
                                This helps customers find your shop within 5km radius
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Latitude *
                                </label>
                                <input
                                    type="text"
                                    name="latitude"
                                    required
                                    value={formData.latitude}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="e.g., 28.6139"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Longitude *
                                </label>
                                <input
                                    type="text"
                                    name="longitude"
                                    required
                                    value={formData.longitude}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="e.g., 77.2090"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Upload Images */}
                    <div className="border-t pt-6">
                        <ImageUpload
                            images={imagePreviews}
                            onImagesChange={handleImagesChange}
                            maxImages={3}
                            label="Shop Images *"
                            multiple={true}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Upload 1-3 high-quality images of your shop storefront and interior
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-4 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/seller/dashboard')}
                            className="btn-secondary flex-1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary flex-1 disabled:opacity-50"
                        >
                            {submitting ? 'Registering...' : 'Register Shop'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterShop;
