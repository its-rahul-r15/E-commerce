import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { productService } from '../../services/api';
import SellerLayout from '../../components/layout/SellerLayout';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

const SellerProducts = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const data = await productService.getMyProducts();
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (productId) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            await productService.deleteProduct(productId);
            alert('Product deleted successfully');
            fetchProducts();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to delete product');
        }
    };

    const filteredProducts = products.filter(product => {
        if (filter === 'active') return product.isAvailable && product.stock > 0;
        if (filter === 'inactive') return !product.isAvailable;
        if (filter === 'low-stock') return product.stock < 10 && product.stock > 0;
        if (filter === 'out-of-stock') return product.stock === 0;
        return true;
    });

    const stats = {
        total: products.length,
        active: products.filter(p => p.isAvailable && p.stock > 0).length,
        lowStock: products.filter(p => p.stock < 10 && p.stock > 0).length,
        outOfStock: products.filter(p => p.stock === 0).length,
    };

    if (loading) {
        return (
            <SellerLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading products...</p>
                    </div>
                </div>
            </SellerLayout>
        );
    }

    return (
        <SellerLayout>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                        My Products
                    </h1>
                    <p className="text-gray-600 mt-1">Manage your product inventory</p>
                </div>
                <Link
                    to="/seller/products/add"
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40"
                >
                    <PlusIcon className="h-5 w-5" />
                    <span>Add Product</span>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-600 font-medium mb-1">Total Products</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-600 font-medium mb-1">Active</p>
                    <p className="text-3xl font-bold text-emerald-600">{stats.active}</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-600 font-medium mb-1">Low Stock</p>
                    <p className="text-3xl font-bold text-orange-600">{stats.lowStock}</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-600 font-medium mb-1">Out of Stock</p>
                    <p className="text-3xl font-bold text-red-600">{stats.outOfStock}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-none shadow-sm border border-[var(--border-mehron)] mb-6 overflow-hidden">
                <div className="flex overflow-x-auto">
                    {[
                        { key: 'all', label: 'All Products' },
                        { key: 'active', label: 'Active' },
                        { key: 'inactive', label: 'Inactive' },
                        { key: 'low-stock', label: 'Low Stock' },
                        { key: 'out-of-stock', label: 'Out of Stock' },
                    ].map((item) => (
                        <button
                            key={item.key}
                            onClick={() => setFilter(item.key)}
                            className={`px-6 py-4 font-serif text-[10px] uppercase tracking-widest border-b-2 transition-all font-bold ${filter === item.key
                                ? 'border-[var(--mehron)] text-[var(--mehron)] bg-[var(--gold-pale)]/30'
                                : 'border-transparent text-gray-500 hover:text-[var(--mehron)] hover:bg-[var(--cream)]'
                                }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-600 mb-6">
                        {filter === 'all' ? 'Start by adding your first product' : `No ${filter.replace('-', ' ')} products`}
                    </p>
                    {filter === 'all' && (
                        <Link to="/seller/products/add" className="inline-flex items-center space-x-2 px-6 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-all">
                            <PlusIcon className="h-5 w-5" />
                            <span>Add Product</span>
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                        <div key={product._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            {/* Product Image */}
                            <div className="relative h-48 bg-gray-100">
                                {product.images?.[0] ? (
                                    <img
                                        src={product.images[0]}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                                {/* Status Badge */}
                                <div className="absolute top-3 right-3">
                                    <span className={`px-3 py-1 rounded-none text-[9px] font-serif font-bold uppercase tracking-widest border ${product.isAvailable && product.stock > 0
                                        ? 'bg-[var(--mehron-soft)] text-[var(--mehron)] border-[var(--border-mehron)]'
                                        : 'bg-red-50 text-red-700 border-red-100'
                                        }`}>
                                        {product.isAvailable && product.stock > 0 ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                {/* Stock Badge */}
                                {product.stock < 10 && product.stock > 0 && (
                                    <div className="absolute top-3 left-3">
                                        <span className="px-3 py-1 rounded-none text-[9px] font-serif font-bold uppercase tracking-widest bg-[var(--gold-pale)] text-[var(--gold)] border border-[var(--gold)]/20 shadow-sm">
                                            Low Essence
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <h3 className="text-sm font-serif font-bold text-gray-900 mb-1 line-clamp-2 uppercase tracking-wide">{product.name}</h3>
                                        <p className="text-[9px] font-serif uppercase tracking-[0.2em] text-[var(--gold)] font-bold">{product.category}</p>
                                    </div>
                                </div>

                                <p className="text-xs font-serif text-gray-600 line-clamp-2 mb-4 italic uppercase tracking-wider">"{product.description}"</p>

                                {/* Price & Stock */}
                                <div className="flex items-center justify-between mb-4 pb-4 border-b border-[var(--border-mehron)]">
                                    <div>
                                        <p className="text-[9px] font-serif uppercase tracking-widest text-gray-500 mb-1 font-bold">Investment</p>
                                        <div className="flex items-baseline space-x-2">
                                            <p className="text-xl font-serif font-bold text-[var(--mehron)]">
                                                ₹{product.discountedPrice || product.price}
                                            </p>
                                            {product.discountedPrice && (
                                                <p className="text-[10px] font-serif text-gray-400 line-through">₹{product.price}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-serif uppercase tracking-widest text-gray-500 mb-1 font-bold">Reserves</p>
                                        <p className={`text-xl font-serif font-bold ${product.stock === 0 ? 'text-red-500' :
                                            product.stock < 10 ? 'text-[var(--gold)]' :
                                                'text-[var(--mehron)]'
                                            }`}>
                                            {product.stock}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex space-x-2">
                                    <Link
                                        to={`/product/${product._id}`}
                                        className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                                    >
                                        <EyeIcon className="h-4 w-4" />
                                        <span>View</span>
                                    </Link>
                                    <Link
                                        to={`/seller/products/edit/${product._id}`}
                                        className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium"
                                    >
                                        <PencilIcon className="h-4 w-4" />
                                        <span>Edit</span>
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(product._id)}
                                        className="px-3 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </SellerLayout>
    );
};

export default SellerProducts;
