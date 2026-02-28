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
        subCategory: '',
        style: '',
        stock: '',
        tags: '',
        brand: '',
        sizes: [],
        colors: [],
    });

    const [imagePreviews, setImagePreviews] = useState([]);
    const [tryOnImagePreview, setTryOnImagePreview] = useState(null); // { file?, url }
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
                brand: product.brand || '',
                subCategory: product.subCategory || '',
                style: product.style || '',
                sizes: product.sizes || [],
                colors: product.colors || [],
            });
            setImagePreviews(product.images || []);
            // Load existing tryOnImage if available
            if (product.tryOnImage) {
                setTryOnImagePreview({ url: product.tryOnImage, existing: true });
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            alert('Failed to load product');
            navigate('/seller/products');
        } finally {
            setLoading(false);
        }
    };

    // Fashion-specific constants
    const FASHION_CATEGORIES = [
        { value: 'Kurta', label: '🥻 Kurta / Kurti', sub: ['Straight Cut', 'A-Line', 'Anarkali', 'Pathani', 'Printed', 'Embroidered', 'Plain'] },
        { value: 'Saree', label: '🥻 Saree', sub: ['Silk', 'Cotton', 'Georgette', 'Chiffon', 'Banarasi', 'Kanjivaram', 'Linen'] },
        { value: 'Lehenga', label: '👗 Lehenga', sub: ['Bridal', 'Party Wear', 'Casual', 'Embroidered', 'Printed'] },
        { value: 'Salwar Suit', label: '👘 Salwar Suit', sub: ['Punjabi', 'Patiala', 'Churidar', 'Straight', 'Palazzo'] },
        { value: 'Dupatta', label: '🧣 Dupatta / Stole', sub: ['Silk', 'Cotton', 'Chiffon', 'Embroidered', 'Printed'] },
        { value: 'Shirt', label: '👔 Shirt / Top', sub: ['Casual', 'Formal', 'Party Wear', 'Printed', 'Solid'] },
        { value: 'Top', label: '👕 Top / Blouse', sub: ['Crop Top', 'Off Shoulder', 'Full Sleeve', 'Halter Neck', 'Tank Top'] },
        { value: 'Dress', label: '👗 Dress / Gown', sub: ['Maxi', 'Midi', 'Mini', 'A-Line', 'Bodycon', 'Flared'] },
        { value: 'Jacket', label: '🧥 Jacket / Blazer', sub: ['Casual', 'Formal', 'Denim', 'Leather', 'Woolen'] },
        { value: 'Trouser', label: '👖 Trouser / Jeans', sub: ['Formal', 'Casual', 'Slim Fit', 'Wide Leg', 'Palazzos'] },
        { value: 'Sherwani', label: '🎩 Sherwani', sub: ['Wedding', 'Party Wear', 'Casual', 'Embroidered'] },
        { value: 'Accessories', label: '💍 Accessories', sub: ['Jewelry', 'Belt', 'Bag', 'Scarf', 'Sunglasses', 'Watch'] },
        { value: 'Ethnic Wear', label: '🪡 Ethnic Wear (Other)', sub: ['Dhoti', 'Lungi', 'Chudidar', 'Indo-Western', 'Fusion'] },
        { value: 'Western Wear', label: '🌟 Western Wear (Other)', sub: ['Co-ord Set', 'Jumpsuit', 'Romper', 'Shorts', 'Skirt'] },
    ];

    const SIZES_CLOTHING = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size'];
    const SIZES_NUMERIC = ['26', '28', '30', '32', '34', '36', '38', '40', '42', '44'];
    const STYLES = ['Casual', 'Formal', 'Party Wear', 'Festive', 'Bridal', 'Wedding', 'Office Wear', 'Streetwear', 'Boho', 'Traditional', 'Indo-Western', 'Fusion'];
    const COLORS = [
        { name: 'Red', hex: '#DC2626' }, { name: 'Maroon', hex: '#7F1D1D' },
        { name: 'Pink', hex: '#EC4899' }, { name: 'Hot Pink', hex: '#FF1493' },
        { name: 'Peach', hex: '#FFCBA4' }, { name: 'Orange', hex: '#F97316' },
        { name: 'Yellow', hex: '#EAB308' }, { name: 'Mustard', hex: '#CA8A04' },
        { name: 'Green', hex: '#16A34A' }, { name: 'Mint', hex: '#6EE7B7' },
        { name: 'Teal', hex: '#0D9488' }, { name: 'Blue', hex: '#2563EB' },
        { name: 'Navy', hex: '#1E3A5F' }, { name: 'Indigo', hex: '#4338CA' },
        { name: 'Purple', hex: '#9333EA' }, { name: 'Lavender', hex: '#C4B5FD' },
        { name: 'Black', hex: '#000000' }, { name: 'White', hex: '#FFFFFF' },
        { name: 'Grey', hex: '#9CA3AF' }, { name: 'Beige', hex: '#D4B896' },
        { name: 'Cream', hex: '#FFFDD0' }, { name: 'Brown', hex: '#92400E' },
        { name: 'Gold', hex: '#D4AF37' }, { name: 'Silver', hex: '#C0C0C0' },
    ];

    const toggleSize = (size) => {
        setFormData(prev => ({
            ...prev,
            sizes: prev.sizes.includes(size)
                ? prev.sizes.filter(s => s !== size)
                : [...prev.sizes, size],
        }));
    };

    const toggleColor = (colorName) => {
        setFormData(prev => ({
            ...prev,
            colors: prev.colors.includes(colorName)
                ? prev.colors.filter(c => c !== colorName)
                : [...prev.colors, colorName],
        }));
    };

    const selectedCategoryData = FASHION_CATEGORIES.find(c => c.value === formData.category);


    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleImagesChange = (previews) => {
        setImagePreviews(previews);
    };

    // Handle Try-On image file selection
    const handleTryOnImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('File must be under 5MB');
            return;
        }
        setTryOnImagePreview({ file, url: URL.createObjectURL(file) });
    };

    const removeTryOnImage = () => setTryOnImagePreview(null);

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

            if (formData.brand) data.append('brand', formData.brand);
            if (formData.subCategory) data.append('subCategory', formData.subCategory);
            if (formData.style) data.append('style', formData.style);

            // sizes and colors are now arrays
            formData.sizes.forEach(size => data.append('sizes', size));
            formData.colors.forEach(color => data.append('colors', color));


            // Append try-on image if a new file was selected
            if (tryOnImagePreview?.file) {
                data.append('tryOnImage', tryOnImagePreview.file);
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
            <div className="min-h-screen flex items-center justify-center bg-[var(--charcoal)]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-[var(--gold)] border-t-transparent mx-auto"></div>
                    <p className="mt-4 text-[var(--gold)] font-serif font-bold uppercase tracking-widest text-[10px]">Summoning Details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--charcoal)] py-8 font-serif">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 meander-pattern pb-1">
                    <button
                        onClick={() => navigate('/seller/products')}
                        className="flex items-center text-[var(--gold)] hover:text-white font-serif text-[10px] uppercase tracking-widest font-bold mb-4 transition-colors group"
                    >
                        <ArrowLeftIcon className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Boutique
                    </button>
                    <h1 className="text-4xl font-bold text-white uppercase tracking-widest">
                        {isEdit ? 'Refine Creation' : 'Curate New Creation'}
                    </h1>
                    <p className="text-gray-400 mt-2 text-[10px] uppercase tracking-[0.2em] font-bold">
                        {isEdit ? 'Polishing the essence of your exquisite piece' : 'Introducing a new masterpiece to your collection'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information Card */}
                    <div className="bg-white rounded-none shadow-sm border border-[var(--border-mehron)] overflow-hidden">
                        <div className="bg-[var(--mehron)] px-6 py-4 border-b border-[var(--gold)]">
                            <h2 className="text-sm font-bold text-white flex items-center uppercase tracking-widest">
                                <InboxStackIcon className="h-5 w-5 mr-3 text-[var(--gold)]" />
                                Fundamental Attributes
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
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value, subCategory: '' })}
                                    className="w-full px-4 py-3 bg-[var(--cream)]/30 border border-[var(--border-mehron)] rounded-none text-gray-900 focus:ring-1 focus:ring-[var(--gold)] focus:border-[var(--gold)] transition-all outline-none bg-white font-serif text-sm"
                                >
                                    <option value="">Select the category of elegance</option>
                                    {FASHION_CATEGORIES.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Sub Category — updates based on selected category */}
                            {selectedCategoryData && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Sub Category</label>
                                    <select
                                        name="subCategory"
                                        value={formData.subCategory}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all outline-none bg-white"
                                    >
                                        <option value="">Select sub-category</option>
                                        {selectedCategoryData.sub.map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div> {/* Closes p-6 space-y-5 */}
                    </div> {/* Closes Basic Information Card */}


                    {/* Detailed Information */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-4">
                            <h2 className="text-xl font-bold text-white flex items-center">
                                <TagIcon className="h-6 w-6 mr-2" />
                                Product Details & Variants
                            </h2>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Brand & Style */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Brand / Label Name</label>
                                    <input
                                        type="text"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all outline-none"
                                        placeholder="e.g., Fabindia, W for Woman, Local Brand"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Style / Occasion</label>
                                    <select
                                        name="style"
                                        value={formData.style}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all outline-none bg-white"
                                    >
                                        <option value="">Select occasion</option>
                                        {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Sizes — Clothing chips + Numeric chips */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Sizes Available
                                    {formData.sizes.length > 0 && (
                                        <span className="ml-2 text-emerald-600 text-xs">({formData.sizes.join(', ')} selected)</span>
                                    )}
                                </label>
                                <p className="text-xs text-gray-500 mb-2">Clothing Sizes</p>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {SIZES_CLOTHING.map(size => (
                                        <button
                                            key={size}
                                            type="button"
                                            onClick={() => toggleSize(size)}
                                            className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all ${formData.sizes.includes(size)
                                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                                : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-300'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 mb-2">Numeric Sizes (Trousers/Jeans)</p>
                                <div className="flex flex-wrap gap-2">
                                    {SIZES_NUMERIC.map(size => (
                                        <button
                                            key={size}
                                            type="button"
                                            onClick={() => toggleSize(size)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-semibold border-2 transition-all ${formData.sizes.includes(size)
                                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                                : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-300'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Colors — Visual swatches */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Available Colors
                                    {formData.colors.length > 0 && (
                                        <span className="ml-2 text-emerald-600 text-xs">({formData.colors.join(', ')} selected)</span>
                                    )}
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    {COLORS.map(color => (
                                        <button
                                            key={color.name}
                                            type="button"
                                            onClick={() => toggleColor(color.name)}
                                            title={color.name}
                                            className={`flex flex-col items-center gap-1 group transition-all`}
                                        >
                                            <div
                                                className={`w-9 h-9 rounded-full border-4 transition-all ${formData.colors.includes(color.name)
                                                    ? 'border-emerald-500 scale-110 shadow-md'
                                                    : 'border-gray-200 hover:border-gray-400'
                                                    }`}
                                                style={{ backgroundColor: color.hex }}
                                            />
                                            <span className={`text-[10px] font-medium ${formData.colors.includes(color.name) ? 'text-emerald-600' : 'text-gray-500'
                                                }`}>{color.name}</span>
                                        </button>
                                    ))}
                                </div>
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

                    {/* ── AR Try-On Image Card ── */}
                    <div className="bg-white rounded-2xl shadow-sm border-2 border-[var(--athenic-gold)] border-opacity-30 overflow-hidden">
                        <div className="bg-gradient-to-r from-[var(--mehron)] to-[var(--mehron-light)] px-6 py-4 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-white flex items-center uppercase tracking-widest">
                                <PhotoIcon className="h-5 w-5 mr-3 text-[var(--gold)]" />
                                ✨ AR Virtual Try-On Image
                            </h2>
                            <span className="text-[9px] font-serif text-[var(--gold-pale)] uppercase tracking-widest opacity-70">Optional</span>
                        </div>
                        <div className="p-6">
                            {/* Guidance Banner */}
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                                <p className="text-xs font-semibold text-amber-800 mb-2">📌 What to upload here:</p>
                                <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
                                    <li>A <strong>flat-lay photo</strong> of the garment on a plain white/transparent background</li>
                                    <li>No model wearing it — just the clothing item alone</li>
                                    <li>Ideally a <strong>PNG with transparent background</strong> (removes white bg automatically)</li>
                                    <li>Good lighting, front-facing, symmetrical if possible</li>
                                    <li>This image will be overlaid on the customer's body in the AR Try-On feature</li>
                                </ul>
                            </div>

                            {/* Preview or Upload */}
                            {tryOnImagePreview ? (
                                <div className="relative group w-48 mx-auto">
                                    <div className="relative rounded-xl overflow-hidden border-2 border-[var(--athenic-gold)] border-opacity-40 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAH0lEQVQoU2NkYGD4z8BQDwAEgAF/QualIAAAAAABJRU5ErkJggg==')] bg-repeat">
                                        <img
                                            src={tryOnImagePreview.url}
                                            alt="Try-On Preview"
                                            className="w-full h-48 object-contain"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={removeTryOnImage}
                                        className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        ✕ Remove
                                    </button>
                                    <p className="text-center text-[10px] text-gray-400 mt-2 font-serif uppercase tracking-widest">
                                        {tryOnImagePreview.existing ? 'Existing Try-On Image' : 'New Try-On Image'}
                                    </p>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-[var(--athenic-gold)] border-opacity-40 rounded-xl cursor-pointer bg-[var(--ivory)] hover:bg-[var(--gold-pale)] transition-colors">
                                    <div className="text-center">
                                        <p className="text-3xl mb-2">👗</p>
                                        <p className="text-sm font-serif text-[var(--athenic-blue)] font-semibold">Upload Try-On Image</p>
                                        <p className="text-xs text-gray-400 mt-1">PNG (transparent) or JPG, max 5MB</p>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleTryOnImageChange}
                                    />
                                </label>
                            )}
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
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[var(--gold)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Inscribing...
                                </span>
                            ) : (
                                isEdit ? '✓ Refine Piece' : '+ Curate Creation'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEditProduct;
