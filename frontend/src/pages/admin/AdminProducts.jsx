import { useState, useEffect } from 'react';
import { productService } from '../../services/api';
import { adminService } from '../../services/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchProducts();
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

    const filteredProducts = products.filter(p => {
        if (filter === 'banned') return p.isBanned;
        if (filter === 'active') return !p.isBanned && p.isAvailable;
        return true;
    });

    return (
        <AdminLayout>
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8 meander-pattern pb-1">
                <div>
                    <h1 className="text-3xl font-bold uppercase tracking-widest text-white">Product Moderation</h1>
                    <p className="text-[var(--gold)] mt-2 text-[10px] uppercase tracking-[0.2em] font-bold">Manage product visibility, categories, and inventory</p>
                </div>
                <div className="bg-[var(--mehron)] px-6 py-2 rounded-none border border-[var(--gold)] shadow-lg">
                    <span className="text-[var(--gold)]/70 text-[10px] uppercase tracking-widest font-bold">Total Products: </span>
                    <span className="text-white font-bold text-lg">{products.length}</span>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white rounded-none p-2 mb-6 inline-flex space-x-2 border border-[var(--border-mehron)] shadow-sm">
                {['all', 'active', 'banned'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`px-6 py-2 rounded-none text-[10px] font-bold uppercase tracking-widest transition-all ${filter === tab
                            ? 'bg-[var(--mehron)] text-white shadow-lg border border-[var(--gold)]'
                            : 'text-gray-500 hover:text-[var(--mehron)] hover:bg-[var(--cream)]'
                            }`}
                    >
                        {tab === 'active' ? 'Active' : tab === 'banned' ? 'Banned' : 'All Products'}
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
                <div className="bg-white rounded-none border border-[var(--border-mehron)] overflow-hidden shadow-sm">
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
                        <tbody className="divide-y divide-[var(--border-mehron)]/10">
                            {filteredProducts.map((product) => (
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
                                    <td className="px-6 py-4 text-right">
                                        {product.isBanned ? (
                                            <button
                                                onClick={() => handleUnban(product._id)}
                                                disabled={updating}
                                                className="px-3 py-1 bg-[var(--mehron)] hover:bg-[var(--mehron-deep)] text-white text-[9px] font-bold uppercase tracking-widest border border-[var(--gold)] rounded-none transition-all disabled:opacity-50"
                                            >
                                                Restore
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleBan(product._id)}
                                                disabled={updating}
                                                className="px-3 py-1 bg-[var(--charcoal)] hover:bg-black text-[var(--gold)] text-[9px] font-bold uppercase tracking-widest border border-white/20 rounded-none transition-all disabled:opacity-50"
                                            >
                                                Ban
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminProducts;
