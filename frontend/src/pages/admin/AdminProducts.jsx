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
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Product Moderation</h1>
                    <p className="text-slate-400 mt-2">Monitor and manage platform products</p>
                </div>
                <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
                    <span className="text-slate-400 text-sm">Total Products: </span>
                    <span className="text-white font-bold text-lg">{products.length}</span>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="bg-slate-800 rounded-2xl p-2 mb-6 inline-flex space-x-2 border border-slate-700">
                {['all', 'active', 'banned'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${filter === tab
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-slate-400 hover:text-white hover:bg-slate-700'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Products Table */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="bg-slate-800 rounded-2xl p-12 text-center border border-slate-700">
                    <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p className="text-slate-400 text-lg">No products found</p>
                </div>
            ) : (
                <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-700">
                        <thead className="bg-slate-700/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Shop</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {filteredProducts.map((product) => (
                                <tr key={product._id} className="hover:bg-slate-700/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <img
                                                src={product.images?.[0] || '/placeholder.png'}
                                                alt={product.name}
                                                className="w-14 h-14 object-cover rounded-lg"
                                            />
                                            <div>
                                                <p className="font-semibold text-white">{product.name}</p>
                                                <p className="text-sm text-slate-400 truncate max-w-xs">{product.description}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-300">
                                        {product.shopId?.shopName || 'Unknown'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-300">{product.category}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm">
                                            <p className="font-semibold text-white">₹{product.discountedPrice || product.price}</p>
                                            {product.discountedPrice && (
                                                <p className="text-slate-400 line-through text-xs">₹{product.price}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${product.stock === 0 ? 'bg-red-600 text-white' :
                                            product.stock < 10 ? 'bg-yellow-600 text-white' :
                                                'bg-emerald-600 text-white'
                                            }`}>
                                            {product.stock}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${product.isBanned
                                            ? 'bg-red-600 text-white'
                                            : product.isAvailable
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-slate-600 text-white'
                                            }`}>
                                            {product.isBanned ? 'Banned' : product.isAvailable ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {product.isBanned ? (
                                            <button
                                                onClick={() => handleUnban(product._id)}
                                                disabled={updating}
                                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                Unban
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleBan(product._id)}
                                                disabled={updating}
                                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
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
