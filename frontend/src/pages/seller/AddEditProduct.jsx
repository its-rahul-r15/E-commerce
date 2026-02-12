import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productService } from '../../services/api';
import ImageUpload from '../../components/common/ImageUpload';
import {
    ArrowLeftIcon,
    PhotoIcon,
    CurrencyRupeeIcon,
    TagIcon,
    InboxStackIcon
} from '@heroicons/react/24/outline';

const AddEditProduct = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        discountedPrice: '',
        category: '',
        stock: '',
        tags: '',
    });
    const [imagePreviews, setImagePreviews] = useState([]);
    const [loading, setLoading] = useState(isEdit);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isEdit) {
            fetchProduct();
        }
    }, [id]);

    const fetchProduct = async () => {
        try {
            const data = await productService.getProductById(id);
            const product = data.product;
            setFormData({
                name: product.name,
                description: product.description,
                price: product.price,
                discountedPrice: product.discountedPrice || '',
                category: product.category,
                stock: product.stock,
                tags: product.tags?.join(', ') || '',
            });
            setImagePreviews(product.images || []);
        } catch (error) {
            console.error('Error fetching product:', error);
            alert('Failed to load product');
            navigate('/seller/products');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleImagesChange = (previews) => {
        setImagePreviews(previews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.description || !formData.price || !formData.category || !formData.stock) {
            alert('Please fill all required fields');
            return;
        }

        setSubmitting(true);
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('price', formData.price);
            if (formData.discountedPrice) data.append('discountedPrice', formData.discountedPrice);
            data.append('category', formData.category);
            data.append('stock', formData.stock);

            if (formData.tags) {
                const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
                tagsArray.forEach(tag => data.append('tags', tag));
            }

            imagePreviews.forEach(preview => {
                if (preview.file) {
                    data.append('images', preview.file);
                }
            });

            if (isEdit) {
                await productService.updateProduct(id, data);
                alert('Product updated successfully!');
            } else {
                await productService.createProduct(data);
                alert('Product added successfully!');
            }
            navigate('/seller/products');
        } catch (error) {
            alert(error.response?.data?.error || `Failed to ${isEdit ? 'update' : 'add'} product`);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-cyan-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Loading product details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/seller/products')}
                        className="flex items-center text-emerald-600 hover:text-emerald-700 font-medium mb-4 transition-colors group"
                    >
                        <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Products
                    </button>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                        {isEdit ? 'Edit Product' : 'Add New Product'}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {isEdit ? 'Update your product details below' : 'Fill in the details to list your product'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-4">
                            <h2 className="text-xl font-bold text-white flex items-center">
                                <InboxStackIcon className="h-6 w-6 mr-2" />
                                Basic Information
                            </h2>
                        </div>
                        <div className="p-6 space-y-5">
                            {/* Product Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Product Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all outline-none"
                                    placeholder="e.g., Premium Wireless Headphones"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="description"
                                    required
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all outline-none resize-none"
                                    placeholder="Describe your product in detail..."
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Be specific and highlight key features
                                </p>
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="category"
                                    required
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all outline-none bg-white"
                                >
                                    <option value="">Select a category</option>
                                    <option value="Electronics">📱 Electronics</option>
                                    <option value="Fashion">👗 Fashion</option>
                                    <option value="Home & Kitchen">🏠 Home & Kitchen</option>
                                    <option value="Books">📚 Books</option>
                                    <option value="Sports">⚽ Sports</option>
                                    <option value="Toys">🧸 Toys</option>
                                    <option value="Beauty">💄 Beauty</option>
                                    <option value="Grocery">🛒 Grocery</option>
                                    <option value="Other">📦 Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Pricing & Stock Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-4">
                            <h2 className="text-xl font-bold text-white flex items-center">
                                <CurrencyRupeeIcon className="h-6 w-6 mr-2" />
                                Pricing & Inventory
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                {/* Price */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Price (₹) <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                                        <input
                                            type="number"
                                            name="price"
                                            required
                                            min="0"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={handleChange}
                                            className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all outline-none"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                {/* Discounted Price */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Sale Price (₹)
                                        <span className="ml-1 text-xs font-normal text-gray-500">Optional</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                                        <input
                                            type="number"
                                            name="discountedPrice"
                                            min="0"
                                            step="0.01"
                                            value={formData.discountedPrice}
                                            onChange={handleChange}
                                            className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all outline-none"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    {formData.price && formData.discountedPrice && formData.discountedPrice < formData.price && (
                                        <p className="text-xs text-emerald-600 font-medium mt-1">
                                            {Math.round(((formData.price - formData.discountedPrice) / formData.price) * 100)}% OFF
                                        </p>
                                    )}
                                </div>

                                {/* Stock */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Stock Quantity <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="stock"
                                        required
                                        min="0"
                                        value={formData.stock}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all outline-none"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tags Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-4">
                            <h2 className="text-xl font-bold text-white flex items-center">
                                <TagIcon className="h-6 w-6 mr-2" />
                                Tags & Keywords
                            </h2>
                        </div>
                        <div className="p-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Product Tags
                                <span className="ml-1 text-xs font-normal text-gray-500">Optional</span>
                            </label>
                            <input
                                type="text"
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all outline-none"
                                placeholder="new, trending, bestseller, limited edition"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                Separate tags with commas. These help customers find your product.
                            </p>
                        </div>
                    </div>

                    {/* Product Images Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-4">
                            <h2 className="text-xl font-bold text-white flex items-center">
                                <PhotoIcon className="h-6 w-6 mr-2" />
                                Product Images
                            </h2>
                        </div>
                        <div className="p-6">
                            <ImageUpload
                                images={imagePreviews}
                                onImagesChange={handleImagesChange}
                                maxImages={5}
                                label={isEdit ? 'Upload new images or keep existing ones' : 'Upload product images'}
                                multiple={true}
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                Upload up to 5 high-quality images. First image will be the main product image.
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/seller/products')}
                            className="flex-1 px-6 py-3.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40"
                        >
                            {submitting ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </span>
                            ) : (
                                isEdit ? '✓ Update Product' : '+ Add Product'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEditProduct;
