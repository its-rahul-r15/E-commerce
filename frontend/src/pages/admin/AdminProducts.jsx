import { useState, useEffect } from 'react';
import { productService, categoryService } from '../../services/api';
import { adminService } from '../../services/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';
import Pagination from '../../components/admin/Pagination';
import ImageUpload from '../../components/common/ImageUpload';
import {
    ArrowLeftIcon,
    PhotoIcon,
    CurrencyRupeeIcon,
    TagIcon,
    InboxStackIcon,
    VideoCameraIcon
} from '@heroicons/react/24/outline';

const AdminProducts = () => {
    // View state: 'list', 'add', 'edit'
    const [view, setView] = useState('list');
    const [products, setProducts] = useState([]);
    const [shopsList, setShopsList] = useState([]);
    const [categoriesList, setCategoriesList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [filter, setFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setCurrentPage(1);
    }, [filter]);

    // Curation Form State
    const initialFormData = {
        name: '',
        description: '',
        price: '',
        discountedPrice: '',
        category: '',
        subCategory: '',
        style: '',
        stock: '',
        returnDays: 7,
        tags: '',
        brand: '',
        sizes: [],
        colors: [],
        shopId: '',
    };

    const [formData, setFormData] = useState(initialFormData);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [tryOnImagePreview, setTryOnImagePreview] = useState(null); // { file?, url }
    const [video360Preview, setVideo360Preview] = useState(null); // { file?, url, existing? }
    const [isEditMode, setIsEditMode] = useState(false);
    const [editProductId, setEditProductId] = useState(null);

    // Fashion-specific constants (same as seller page for alignment)
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

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchProducts();
        fetchShops();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await productService.getAllProducts();
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchShops = async () => {
        try {
            const response = await adminService.getApprovedShops();
            const shops = response?.shops || response || [];
            // Filter only approved boutiques
            setShopsList(shops.filter(s => s.status === 'approved'));
        } catch (error) {
            console.error('Error fetching shops:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await categoryService.getCategories();
            setCategoriesList(data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleBan = async (productId) => {
        if (!confirm('Ban this product? It will be hidden from all customers.')) return;
        setUpdating(true);
        try {
            await adminService.banProduct(productId);
            fetchProducts();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to ban product');
        } finally {
            setUpdating(false);
        }
    };

    const handleUnban = async (productId) => {
        setUpdating(true);
        try {
            await adminService.unbanProduct(productId);
            fetchProducts();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to unban product');
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async (productId) => {
        if (!confirm('Are you sure you want to permanently delete this product? This action cannot be undone.')) return;
        setUpdating(true);
        try {
            await productService.deleteProduct(productId);
            alert('Product deleted successfully');
            fetchProducts();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to delete product');
        } finally {
            setUpdating(false);
        }
    };

    const handleToggleFeatured = async (productId, currentlyFeatured) => {
        setUpdating(true);
        try {
            await adminService.toggleFeatured(productId, !currentlyFeatured);
            fetchProducts();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to update featured status');
        } finally {
            setUpdating(false);
        }
    };

    const handleEditClick = async (product) => {
        setLoading(true);
        try {
            const data = await productService.getProductById(product._id);
            const p = data.product;
            setFormData({
                name: p.name || '',
                description: p.description || '',
                price: p.price || '',
                discountedPrice: p.discountedPrice || '',
                category: p.category || '',
                subCategory: p.subCategory || '',
                style: p.style || '',
                stock: p.stock || '',
                returnDays: p.returnDays ?? 7,
                tags: p.tags?.join(', ') || '',
                brand: p.brand || '',
                sizes: p.sizes || [],
                colors: p.colors || [],
                shopId: p.shopId?._id || p.shopId || '',
            });
            setImagePreviews(p.images || []);
            setTryOnImagePreview(p.tryOnImage ? { url: p.tryOnImage, existing: true } : null);
            setVideo360Preview(p.video360 ? { url: p.video360, existing: true } : null);
            setIsEditMode(true);
            setEditProductId(p._id);
            setView('edit');
        } catch (error) {
            console.error('Error loading product details:', error);
            alert('Failed to load product details');
        } finally {
            setLoading(false);
        }
    };

    // Form Handlers
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

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleImagesChange = (previews) => {
        setImagePreviews(previews);
    };

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

    const handleVideo360Change = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('video/')) {
            alert('Please select a video file (MP4, WebM, MOV)');
            return;
        }
        if (file.size > 20 * 1024 * 1024) {
            alert('Video must be under 20MB');
            return;
        }
        const tempVideo = document.createElement('video');
        tempVideo.preload = 'metadata';
        tempVideo.onloadedmetadata = () => {
            URL.revokeObjectURL(tempVideo.src);
            if (tempVideo.duration > 10) {
                alert('360° video must be 10 seconds or shorter.');
                return;
            }
            setVideo360Preview({ file, url: URL.createObjectURL(file) });
        };
        tempVideo.src = URL.createObjectURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.shopId) {
            alert('Please select a boutique shop for this product');
            return;
        }
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
            data.append('returnDays', formData.returnDays);
            data.append('shopId', formData.shopId);

            if (formData.tags) {
                const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
                tagsArray.forEach(tag => data.append('tags', tag));
            }

            if (formData.brand) data.append('brand', formData.brand);
            if (formData.subCategory) data.append('subCategory', formData.subCategory);
            if (formData.style) data.append('style', formData.style);

            formData.sizes.forEach(size => data.append('sizes', size));
            formData.colors.forEach(color => data.append('colors', color));

            if (tryOnImagePreview?.file) {
                data.append('tryOnImage', tryOnImagePreview.file);
            }

            if (video360Preview?.file) {
                data.append('video360', video360Preview.file);
            }

            imagePreviews.forEach(preview => {
                if (preview.file) {
                    data.append('images', preview.file);
                }
            });

            if (isEditMode) {
                await productService.updateProduct(editProductId, data);
                alert('Product curated & updated successfully!');
            } else {
                await productService.createProduct(data);
                alert('Product curated & added successfully!');
            }
            setView('list');
            fetchProducts();
        } catch (error) {
            alert(error.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'curate'} product`);
        } finally {
            setSubmitting(false);
        }
    };

    const selectedCategoryData = categoriesList.find(c => c.name === formData.category) || FASHION_CATEGORIES.find(c => c.value === formData.category);

    const filteredProducts = products.filter(p => {
        if (filter === 'banned') return p.isBanned;
        if (filter === 'active') return !p.isBanned && p.isAvailable;
        if (filter === 'featured') return p.isFeatured;
        return true;
    });

    return (
        <AdminLayout>
            {view === 'list' ? (
                <>
                    {/* Page Header */}
                    <div className="flex items-center justify-between mb-8 meander-pattern pb-1">
                        <div>
                            <h1 className="text-3xl font-bold uppercase tracking-widest text-white">Product Moderation</h1>
                            <p className="text-[var(--gold)] mt-2 text-[10px] uppercase tracking-[0.2em] font-bold">Manage product visibility, categories, and inventory</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => {
                                    setFormData(initialFormData);
                                    setImagePreviews([]);
                                    setTryOnImagePreview(null);
                                    setVideo360Preview(null);
                                    setIsEditMode(false);
                                    setEditProductId(null);
                                    setView('add');
                                }}
                                className="bg-[var(--mehron)] hover:bg-[var(--mehron-deep)] text-white px-6 py-2.5 rounded-none border border-[var(--gold)] text-[10px] font-bold uppercase tracking-widest transition-all shadow-md hover:scale-105 duration-200"
                            >
                                + Curate Product
                            </button>
                            <div className="bg-[var(--mehron)] px-6 py-2 rounded-none border border-[var(--gold)] shadow-lg">
                                <span className="text-[var(--gold)]/70 text-[10px] uppercase tracking-widest font-bold">Total Products: </span>
                                <span className="text-white font-bold text-lg">{products.length}</span>
                            </div>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="bg-white rounded-none p-2 mb-6 inline-flex space-x-2 border border-[var(--border-mehron)] shadow-sm">
                        {['all', 'active', 'featured', 'banned'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setFilter(tab)}
                                className={`px-6 py-2 rounded-none text-[10px] font-bold uppercase tracking-widest transition-all ${filter === tab
                                    ? 'bg-[var(--mehron)] text-white shadow-lg border border-[var(--gold)]'
                                    : 'text-gray-500 hover:text-[var(--mehron)] hover:bg-[var(--cream)]'
                                    }`}
                            >
                                {tab === 'active' ? 'Active' : tab === 'banned' ? 'Banned' : tab === 'featured' ? '⭐ Featured' : 'All Products'}
                            </button>
                        ))}
                    </div>

                    {/* Products Table */}
                    {loading ? (
                        <div className="flex items-center justify-center h-64 bg-white/5 border border-[var(--border-mehron)]/10">
                            <div className="animate-spin rounded-none h-10 w-10 border-2 border-[var(--gold)] border-t-transparent"></div>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="bg-white rounded-none p-12 text-center border border-[var(--border-mehron)] shadow-sm">
                            <svg className="w-16 h-16 mx-auto mb-4 text-[var(--gold)]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <p className="text-[var(--mehron)] text-sm uppercase tracking-widest font-bold">No products found in this domain</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-none border border-[var(--border-mehron)] overflow-hidden shadow-sm text-black">
                            <table className="min-w-full divide-y divide-[var(--border-mehron)]/10">
                                <thead className="bg-[var(--mehron)]/5">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-[9px] font-bold text-[var(--mehron)] uppercase tracking-[0.2em]">Product Name</th>
                                        <th className="px-6 py-4 text-left text-[9px] font-bold text-[var(--mehron)] uppercase tracking-[0.2em]">Shop</th>
                                        <th className="px-6 py-4 text-left text-[9px] font-bold text-[var(--mehron)] uppercase tracking-[0.2em]">Category</th>
                                        <th className="px-6 py-4 text-left text-[9px] font-bold text-[var(--mehron)] uppercase tracking-[0.2em]">Price</th>
                                        <th className="px-6 py-4 text-left text-[9px] font-bold text-[var(--mehron)] uppercase tracking-[0.2em]">Stock</th>
                                        <th className="px-6 py-4 text-left text-[9px] font-bold text-[var(--mehron)] uppercase tracking-[0.2em]">Status</th>
                                        <th className="px-6 py-4 text-right text-[9px] font-bold text-[var(--mehron)] uppercase tracking-[0.2em]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-mehron)]/10 bg-white">
                                    {filteredProducts.slice((currentPage - 1) * 10, currentPage * 10).map((product) => (
                                        <tr key={product._id} className="hover:bg-[var(--mehron)]/[0.02] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-14 h-14 border border-[var(--gold)]/20 shadow-sm overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={product.images?.[0] || '/placeholder.png'}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-[var(--mehron)] uppercase tracking-wider text-sm">{product.name}</p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest truncate max-w-[200px]">{product.description}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-[10px] font-bold text-[var(--mehron)] uppercase tracking-wider italic">
                                                {product.shopId?.shopName || 'Unknown'}
                                            </td>
                                            <td className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{product.category}</td>
                                            <td className="px-6 py-4">
                                                <div className="text-[11px] font-bold">
                                                    <p className="text-[var(--mehron)]">₹{(product.discountedPrice || product.price).toLocaleString()}</p>
                                                    {product.discountedPrice && (
                                                        <p className="text-gray-400 line-through text-[9px]">₹{product.price.toLocaleString()}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-none border shadow-sm ${product.stock === 0
                                                    ? 'bg-red-50 text-red-600 border-red-200'
                                                    : product.stock < 10
                                                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    }`}>
                                                    {product.stock}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-none border ${product.isBanned
                                                    ? 'bg-red-900 text-white border-red-700'
                                                    : product.isAvailable
                                                        ? 'bg-[var(--gold-pale)] text-[var(--mehron)] border-[var(--gold)]/20'
                                                        : 'bg-gray-100 text-gray-500 border-gray-200'
                                                    }`}>
                                                    {product.isBanned ? 'Banned' : product.isAvailable ? 'Active' : 'Hidden'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleToggleFeatured(product._id, product.isFeatured)}
                                                    disabled={updating}
                                                    title={product.isFeatured ? 'Remove from Featured' : 'Add to Featured'}
                                                    className={`px-2 py-1 text-sm rounded-none border transition-all disabled:opacity-50 ${product.isFeatured
                                                        ? 'bg-[var(--gold-pale)] border-[var(--gold)] text-[var(--gold)]'
                                                        : 'bg-white border-gray-200 text-gray-300 hover:text-[var(--gold)] hover:border-[var(--gold)]'
                                                        }`}
                                                >
                                                    {product.isFeatured ? '★' : '☆'}
                                                </button>
                                                <button
                                                    onClick={() => handleEditClick(product)}
                                                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 text-[9px] font-bold uppercase tracking-widest border border-amber-200 rounded-none transition-all"
                                                >
                                                    Edit
                                                </button>
                                                {product.isBanned ? (
                                                    <button
                                                        onClick={() => handleUnban(product._id)}
                                                        disabled={updating}
                                                        className="px-2.5 py-1 bg-[var(--mehron)] hover:bg-[var(--mehron-deep)] text-white text-[9px] font-bold uppercase tracking-widest border border-[var(--gold)] rounded-none transition-all disabled:opacity-50"
                                                    >
                                                        Restore
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleBan(product._id)}
                                                        disabled={updating}
                                                        className="px-2.5 py-1 bg-[var(--charcoal)] hover:bg-black text-[var(--gold)] text-[9px] font-bold uppercase tracking-widest border border-white/20 rounded-none transition-all disabled:opacity-50"
                                                    >
                                                        Ban
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(product._id)}
                                                    disabled={updating}
                                                    className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-[9px] font-bold uppercase tracking-widest border border-red-500 rounded-none transition-all"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            ) : (
                /* Add / Edit Product View */
                <div className="max-w-5xl mx-auto text-black">
                    {/* Header */}
                    <div className="mb-8 meander-pattern pb-1">
                        <button
                            onClick={() => setView('list')}
                            className="flex items-center text-[var(--gold)] hover:text-white font-serif text-[10px] uppercase tracking-widest font-bold mb-4 transition-colors group"
                        >
                            <ArrowLeftIcon className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to Product List
                        </button>
                        <h1 className="text-3xl font-bold text-white uppercase tracking-widest">
                            {isEditMode ? 'Refine Creation' : 'Curate New Creation'}
                        </h1>
                        <p className="text-[var(--gold)] mt-2 text-[10px] uppercase tracking-[0.2em] font-bold">
                            {isEditMode ? 'Polishing the details of this curated luxury catalog item' : 'Introducing a new masterpiece to a boutique shop'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Target boutique selection */}
                        <div className="bg-white rounded-none shadow-sm border border-[var(--border-mehron)] overflow-hidden p-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Assign to Boutique Shop <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="shopId"
                                required
                                value={formData.shopId}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-[var(--cream)]/30 border border-[var(--border-mehron)] rounded-none text-gray-900 focus:ring-1 focus:ring-[var(--gold)] focus:border-[var(--gold)] transition-all outline-none bg-white font-serif text-sm font-semibold"
                            >
                                <option value="">Select the target boutique shop</option>
                                {shopsList.map(shop => (
                                    <option key={shop._id} value={shop._id}>
                                        {shop.shopName} ({shop.category} - {shop.address?.city || shop.location})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Fundamental Attributes Card */}
                        <div className="bg-white rounded-none shadow-sm border border-[var(--border-mehron)] overflow-hidden">
                            <div className="bg-[var(--mehron)] px-6 py-4 border-b border-[var(--gold)]">
                                <h2 className="text-sm font-bold text-white flex items-center uppercase tracking-widest">
                                    <InboxStackIcon className="h-5 w-5 mr-3 text-[var(--gold)]" />
                                    Fundamental Attributes
                                </h2>
                            </div>
                            <div className="p-6 space-y-5">
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
                                        className="w-full px-4 py-3 border border-gray-300 rounded-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)] outline-none"
                                        placeholder="e.g., Silk Banarasi Saree"
                                    />
                                </div>

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
                                        className="w-full px-4 py-3 border border-gray-300 rounded-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)] outline-none resize-none"
                                        placeholder="Describe the weave, fabric, and artistry of the product..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Category <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="category"
                                            required
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value, subCategory: '' })}
                                            className="w-full px-4 py-3 bg-[var(--cream)]/30 border border-gray-300 rounded-none text-gray-900 focus:ring-1 focus:ring-[var(--gold)] focus:border-[var(--gold)] outline-none bg-white text-sm"
                                        >
                                            <option value="">Select Category</option>
                                            {categoriesList.length > 0 ? (
                                                categoriesList.map(cat => (
                                                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                                                ))
                                            ) : (
                                                FASHION_CATEGORIES.map(cat => (
                                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                                ))
                                            )}
                                        </select>
                                    </div>

                                    {selectedCategoryData && (
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Sub Category</label>
                                            <select
                                                name="subCategory"
                                                value={formData.subCategory}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-[var(--cream)]/30 border border-gray-300 rounded-none text-gray-900 focus:ring-1 focus:ring-[var(--gold)] focus:border-[var(--gold)] outline-none bg-white text-sm"
                                            >
                                                <option value="">Select Sub-Category</option>
                                                {(selectedCategoryData.subCategories || selectedCategoryData.sub || []).map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Product Specifications & Variants */}
                        <div className="bg-white rounded-none shadow-sm border border-[var(--border-mehron)] overflow-hidden">
                            <div className="bg-[var(--mehron)] px-6 py-4 border-b border-[var(--gold)]">
                                <h2 className="text-sm font-bold text-white flex items-center uppercase tracking-widest">
                                    <TagIcon className="h-5 w-5 mr-3 text-[var(--gold)]" />
                                    Variants & Styling Attributes
                                </h2>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Brand / Label Name</label>
                                        <input
                                            type="text"
                                            name="brand"
                                            value={formData.brand}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)] outline-none"
                                            placeholder="e.g., Klyra Heritage"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Style / Occasion</label>
                                        <select
                                            name="style"
                                            value={formData.style}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-[var(--cream)]/30 border border-gray-300 rounded-none text-gray-900 focus:ring-1 focus:ring-[var(--gold)] focus:border-[var(--gold)] outline-none bg-white text-sm"
                                        >
                                            <option value="">Select occasion</option>
                                            {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">Sizes Available</label>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Clothing Sizes</p>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {SIZES_CLOTHING.map(size => (
                                            <button
                                                key={size}
                                                type="button"
                                                onClick={() => toggleSize(size)}
                                                className={`px-4 py-2 border rounded-none text-xs font-bold transition-all ${formData.sizes.includes(size)
                                                    ? 'bg-[var(--mehron)] border-[var(--gold)] text-white shadow-md'
                                                    : 'bg-white border-gray-200 text-gray-600 hover:border-[var(--gold)]'
                                                    }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Numeric Sizes (Waist/Fittings)</p>
                                    <div className="flex flex-wrap gap-2">
                                        {SIZES_NUMERIC.map(size => (
                                            <button
                                                key={size}
                                                type="button"
                                                onClick={() => toggleSize(size)}
                                                className={`px-4 py-2 border rounded-none text-xs font-bold transition-all ${formData.sizes.includes(size)
                                                    ? 'bg-[var(--mehron)] border-[var(--gold)] text-white shadow-md'
                                                    : 'bg-white border-gray-200 text-gray-600 hover:border-[var(--gold)]'
                                                    }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">Available Colors</label>
                                    <div className="flex flex-wrap gap-3">
                                        {COLORS.map(color => (
                                            <button
                                                key={color.name}
                                                type="button"
                                                onClick={() => toggleColor(color.name)}
                                                title={color.name}
                                                className="flex flex-col items-center gap-1 group transition-all"
                                            >
                                                <div
                                                    className={`w-8 h-8 rounded-full border-2 transition-all ${formData.colors.includes(color.name)
                                                        ? 'border-[var(--mehron)] scale-110 shadow-md'
                                                        : 'border-gray-200 hover:border-gray-400'
                                                        }`}
                                                    style={{ backgroundColor: color.hex }}
                                                />
                                                <span className={`text-[9px] font-bold uppercase tracking-widest ${formData.colors.includes(color.name) ? 'text-[var(--mehron)]' : 'text-gray-400'}`}>
                                                    {color.name}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pricing & Stock Card */}
                        <div className="bg-white rounded-none shadow-sm border border-[var(--border-mehron)] overflow-hidden">
                            <div className="bg-[var(--mehron)] px-6 py-4 border-b border-[var(--gold)]">
                                <h2 className="text-sm font-bold text-white flex items-center uppercase tracking-widest">
                                    <CurrencyRupeeIcon className="h-5 w-5 mr-3 text-[var(--gold)]" />
                                    Pricing & Inventory
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
                                                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)] outline-none"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Sale Price (₹) <span className="text-xs text-gray-400 font-normal">(Optional)</span>
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
                                                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)] outline-none"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        {formData.price && formData.discountedPrice && Number(formData.discountedPrice) < Number(formData.price) && (
                                            <p className="text-[10px] text-emerald-600 font-bold uppercase mt-1">
                                                {Math.round(((formData.price - formData.discountedPrice) / formData.price) * 100)}% OFF
                                            </p>
                                        )}
                                    </div>

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
                                            className="w-full px-4 py-3 border border-gray-300 rounded-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)] outline-none"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div className="mt-5">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Return Policy (Days)</label>
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="number"
                                            name="returnDays"
                                            min="0"
                                            max="90"
                                            value={formData.returnDays}
                                            onChange={handleChange}
                                            className="w-32 px-4 py-3 border border-gray-300 rounded-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)] outline-none"
                                        />
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Days</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wider">Set to 0 if product is non-returnable (e.g. custom jewelry or clearance)</p>
                                </div>
                            </div>
                        </div>

                        {/* Media Uploads */}
                        <div className="bg-white rounded-none shadow-sm border border-[var(--border-mehron)] overflow-hidden p-6 space-y-6">
                            {/* Product Images */}
                            <ImageUpload
                                images={imagePreviews}
                                onImagesChange={handleImagesChange}
                                maxImages={5}
                                label="Curated Images (Select up to 5)"
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                                {/* AR Try On */}
                                <div className="border border-dashed border-gray-300 p-4">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-2 flex items-center">
                                        <PhotoIcon className="h-4 w-4 mr-2 text-[var(--gold)]" />
                                        AR Virtual Try-On Image (PNG Transparent)
                                    </label>
                                    {tryOnImagePreview ? (
                                        <div className="relative w-32 h-32 border border-gray-300 mx-auto">
                                            <img src={tryOnImagePreview.url} alt="AR try-on" className="w-full h-full object-contain" />
                                            <button
                                                type="button"
                                                onClick={() => setTryOnImagePreview(null)}
                                                className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center h-28 cursor-pointer bg-gray-50 hover:bg-gray-100 transition border border-gray-200">
                                            <span className="text-xs font-bold text-gray-500">Upload Try-On Image</span>
                                            <input type="file" accept="image/*" className="hidden" onChange={handleTryOnImageChange} />
                                        </label>
                                    )}
                                </div>

                                {/* 360 Product Video */}
                                <div className="border border-dashed border-gray-300 p-4">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-2 flex items-center">
                                        <VideoCameraIcon className="h-4 w-4 mr-2 text-[var(--gold)]" />
                                        360° Product Rotation Video
                                    </label>
                                    {video360Preview ? (
                                        <div className="relative w-48 h-32 mx-auto">
                                            <video src={video360Preview.url} className="w-full h-full object-contain bg-black" controls muted />
                                            <button
                                                type="button"
                                                onClick={() => setVideo360Preview(null)}
                                                className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center h-28 cursor-pointer bg-gray-50 hover:bg-gray-100 transition border border-gray-200">
                                            <span className="text-xs font-bold text-gray-500">Upload 360° Video (Max 10s)</span>
                                            <input type="file" accept="video/*" className="hidden" onChange={handleVideo360Change} />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Search tags */}
                        <div className="bg-white rounded-none shadow-sm border border-[var(--border-mehron)] overflow-hidden p-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Search Tags / Keywords</label>
                            <input
                                type="text"
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)] outline-none"
                                placeholder="e.g., banarasi, festive, wedding, silk"
                            />
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-2">Separate tags with commas. Helps user search catalog items.</p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex space-x-4">
                            <button
                                type="button"
                                onClick={() => setView('list')}
                                className="w-1/3 py-4 bg-white border border-gray-200 text-gray-700 font-serif text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 py-4 bg-[var(--mehron)] text-white font-serif text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-[var(--mehron-deep)] border border-[var(--gold)] transition-all disabled:opacity-50"
                            >
                                {submitting ? 'Inscribing Masterpiece...' : (isEditMode ? '✓ Refine Product' : '+ Curate Product')}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminProducts;
