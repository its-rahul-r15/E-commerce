import { useState, useEffect } from 'react';
import { productService } from '../../services/api';
import { adminService } from '../../services/adminApi';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const data = await productService.getAllProducts();
            setProducts(data || []); // data is already the products array
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
            alert('Product banned successfully');
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
            alert('Product unbanned successfully');
            fetchProducts();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to unban product');
        } finally {
            setUpdating(false);
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Product Moderation</h1>

                {products.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <p className="text-gray-600">No products found</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shop</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {products.map((product) => (
                                    <tr key={product._id}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <img
                                                    src={product.images?.[0] || '/placeholder-product.png'}
                                                    alt={product.name}
                                                    className="w-12 h-12 object-cover rounded"
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-900">{product.name}</p>
                                                    <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {product.shopId?.shopName || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{product.category}</td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <p className="font-semibold text-gray-900">₹{product.discountedPrice || product.price}</p>
                                                {product.discountedPrice && (
                                                    <p className="text-gray-500 line-through text-xs">₹{product.price}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-sm font-medium ${product.stock === 0 ? 'text-red-600' :
                                                product.stock < 10 ? 'text-orange-600' :
                                                    'text-green-600'
                                                }`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${product.isBanned
                                                ? 'bg-red-100 text-red-800'
                                                : product.isAvailable
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {product.isBanned ? 'Banned' : product.isAvailable ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm">
                                            {product.isBanned ? (
                                                <button
                                                    onClick={() => handleUnban(product._id)}
                                                    disabled={updating}
                                                    className="text-green-600 hover:text-green-700 font-medium disabled:opacity-50"
                                                >
                                                    Unban
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleBan(product._id)}
                                                    disabled={updating}
                                                    className="text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
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
            </div>
        </div>
    );
};

export default AdminProducts;
