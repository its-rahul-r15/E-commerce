import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productService } from '../../services/api';
import ImageUpload from '../../components/common/ImageUpload';

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
            // Set existing images as previews
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

            // Add new images (only file objects, not existing URLs)
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isEdit ? 'Edit Product' : 'Add New Product'}
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                    {/* Product Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Product Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="input"
                            placeholder="Enter product name"
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
                            placeholder="Describe your product"
                        />
                    </div>

                    {/* Price & Discounted Price */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price (₹) *
                            </label>
                            <input
                                type="number"
                                name="price"
                                required
                                min="0"
                                step="0.01"
                                value={formData.price}
                                onChange={handleChange}
                                className="input"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Discounted Price (₹)
                            </label>
                            <input
                                type="number"
                                name="discountedPrice"
                                min="0"
                                step="0.01"
                                value={formData.discountedPrice}
                                onChange={handleChange}
                                className="input"
                                placeholder="Optional"
                            />
                        </div>
                    </div>

                    {/* Category & Stock */}
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
                                <option value="Toys">Toys</option>
                                <option value="Beauty">Beauty</option>
                                <option value="Grocery">Grocery</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Stock Quantity *
                            </label>
                            <input
                                type="number"
                                name="stock"
                                required
                                min="0"
                                value={formData.stock}
                                onChange={handleChange}
                                className="input"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tags (comma separated)
                        </label>
                        <input
                            type="text"
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            className="input"
                            placeholder="e.g., new, bestseller, organic"
                        />
                        <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
                    </div>

                    {/* Product Images */}
                    <ImageUpload
                        images={imagePreviews}
                        onImagesChange={handleImagesChange}
                        maxImages={5}
                        label={isEdit ? 'Product Images (upload new or keep existing)' : 'Product Images *'}
                        multiple={true}
                    />

                    {/* Action Buttons */}
                    <div className="flex space-x-4 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/seller/products')}
                            className="btn-secondary flex-1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary flex-1 disabled:opacity-50"
                        >
                            {submitting ? 'Saving...' : isEdit ? 'Update Product' : 'Add Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEditProduct;
