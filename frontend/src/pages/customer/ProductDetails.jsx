import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService, cartService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [moreFromShop, setMoreFromShop] = useState([]);

    // Mock variants for UI demo (since backend might not have them yet)
    const [selectedColor, setSelectedColor] = useState('Space Grey');
    const [selectedSize, setSelectedSize] = useState('Standard');

    const colors = ['Space Grey', 'Silver', 'Gold', 'Midnight'];
    const sizes = ['Standard', 'Studio XL'];

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const data = await productService.getProductById(id);
            setProduct(data.product);

            // Fetch more products from same shop
            if (data.product?.shopId?._id) {
                fetchMoreFromShop(data.product.shopId._id);
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMoreFromShop = async (shopId) => {
        try {
            const data = await productService.getProducts({ shop: shopId, limit: 5 });
            setMoreFromShop(data.products.filter(p => p._id !== id).slice(0, 4));
        } catch (error) {
            console.error('Error fetching shop products:', error);
        }
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            setShowLoginPrompt(true);
            return;
        }

        setAddingToCart(true);
        try {
            await cartService.addToCart(id, quantity);
            // Show success animation/toast instead of alert? 
            // For now sticking to consistent behavior but could improve.
            alert('Added to cart successfully!');
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to add to cart');
        } finally {
            setAddingToCart(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
        </div>
    );

    if (!product) return null;

    const price = product.discountedPrice || product.price;
    const originalPrice = product.discountedPrice ? product.price : null;
    const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Breadcrumb */}
                <nav className="flex items-center text-sm text-gray-500 mb-6">
                    <span onClick={() => navigate('/')} className="cursor-pointer hover:text-emerald-600">Home</span>
                    <span className="mx-2">›</span>
                    <span className="cursor-pointer hover:text-emerald-600">{product.category}</span>
                    <span className="mx-2">›</span>
                    <span className="text-gray-900 font-medium truncate">{product.name}</span>
                </nav>

                <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                        {/* Left: Image Gallery */}
                        <div className="p-8 bg-gray-50 flex flex-col items-center justify-center border-r border-gray-100">
                            <div className="relative w-full aspect-square max-w-lg mb-6 mix-blend-multiply">
                                <img
                                    src={product.images?.[selectedImage] || '/placeholder.png'}
                                    alt={product.name}
                                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
                                />
                                <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-sm hover:shadow-md text-gray-400 hover:text-red-500 transition-colors">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                    </svg>
                                </button>
                            </div>
                            <div className="flex space-x-4 overflow-x-auto pb-2">
                                {product.images?.map((img, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`w-20 h-20 rounded-xl border-2 cursor-pointer p-2 bg-white ${selectedImage === idx ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-contain" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Product Info */}
                        <div className="p-8 lg:p-12">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

                            <div className="flex items-center mb-6">
                                <div className="flex text-emerald-500">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <svg key={star} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                        </svg>
                                    ))}
                                </div>
                                <span className="ml-2 text-sm text-gray-500">(428 reviews)</span>
                                <span className="mx-3 text-gray-300">|</span>
                                <span className="text-sm text-gray-500">SKU: {product._id.slice(-8).toUpperCase()}</span>
                            </div>

                            <div className="bg-emerald-50 rounded-xl p-6 mb-8">
                                <div className="flex items-baseline space-x-3">
                                    <span className="text-4xl font-bold text-gray-900">₹{price}</span>
                                    {originalPrice && (
                                        <>
                                            <span className="text-xl text-gray-400 line-through">₹{originalPrice}</span>
                                            <span className="text-emerald-600 font-bold bg-emerald-100 px-2 py-1 rounded text-sm">
                                                Save ₹{originalPrice - price} ({discount}%)
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>


                            <div className="flex space-x-4 mb-8">
                                <div className="flex items-center border border-gray-300 rounded-lg">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-12 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg font-medium"
                                    >
                                        −
                                    </button>
                                    <span className="w-8 text-center font-medium">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                        className="w-12 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg font-medium"
                                    >
                                        +
                                    </button>
                                </div>
                                <button
                                    onClick={handleAddToCart}
                                    disabled={addingToCart}
                                    className="flex-1 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-emerald-200"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <span>{addingToCart ? 'Adding...' : 'Add to Cart'}</span>
                                </button>
                            </div>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="text-emerald-500">🚚</div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-900">Free Delivery</p>
                                        <p className="text-xs text-gray-500">On orders over ₹500</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="text-emerald-500">🛡️</div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-900">Secure Payment</p>
                                        <p className="text-xs text-gray-500">100% protected</p>
                                    </div>
                                </div>
                            </div>

                            {/* Shop Card */}
                            <div className="mt-8 border border-gray-100 rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl">
                                        🏪
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <h4 className="font-bold text-gray-900">{product.shopId?.shopName}</h4>
                                            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">VERIFIED</span>
                                        </div>
                                        <p className="text-xs text-gray-500">4.9 ⭐ (12.4k sales)</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate(`/shop/${product.shopId?._id}`)}
                                    className="border border-emerald-500 text-emerald-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-50"
                                >
                                    Visit Shop
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* More From Shop */}
                {moreFromShop.length > 0 && (
                    <div className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                More From <span className="text-emerald-500">{product.shopId?.shopName}</span>
                            </h2>
                            <button onClick={() => navigate(`/shop/${product.shopId?._id}`)} className="text-emerald-500 font-medium hover:text-emerald-600 flex items-center">
                                See all items <span className="ml-1">→</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {moreFromShop.map((item) => (
                                <div
                                    key={item._id}
                                    onClick={() => navigate(`/product/${item._id}`)}
                                    className="bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                                >
                                    <div className="relative h-48 bg-gray-100 rounded-lg mb-4 overflow-hidden">
                                        <img src={item.images?.[0]} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-1 truncate">{item.name}</h3>
                                    <p className="text-emerald-600 font-bold">
                                        ₹{item.discountedPrice || item.price}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Compare Sellers (Mock for now) */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-12">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">Compare with Other Sellers</h2>
                    </div>
                    <div className="p-0 overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Seller</th>
                                    <th className="px-6 py-3 font-medium">Rating</th>
                                    <th className="px-6 py-3 font-medium">Price</th>
                                    <th className="px-6 py-3 font-medium">Shipping</th>
                                    <th className="px-6 py-3 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <tr>
                                    <td className="px-6 py-4 flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs">A</div>
                                        <span className="font-medium text-gray-900">{product.shopId?.shopName} <span className="text-xs bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded ml-1">Current</span></span>
                                    </td>
                                    <td className="px-6 py-4 text-emerald-500">4.9 ⭐</td>
                                    <td className="px-6 py-4 font-bold text-gray-900">₹{price}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">2-4 Business Days</td>
                                    <td className="px-6 py-4 text-right">
                                        <button disabled className="bg-gray-100 text-gray-400 px-4 py-1.5 rounded-full text-sm font-medium">In Cart</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs text-blue-600">S</div>
                                        <span className="font-medium text-gray-900">SoundDirect Outlet</span>
                                    </td>
                                    <td className="px-6 py-4 text-emerald-500">4.7 ⭐</td>
                                    <td className="px-6 py-4 font-bold text-gray-900">₹{price * 0.95}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">7-10 Business Days</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="border border-emerald-500 text-emerald-500 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-emerald-50">Select</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Login Prompt Modal */}
            {
                showLoginPrompt && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl transform transition-all">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                                    🔐
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Login Required</h2>
                                <p className="text-gray-500 mt-2">Please login to add items to your cart and continue shopping.</p>
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowLoginPrompt(false)}
                                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 font-medium shadow-lg shadow-emerald-200"
                                >
                                    Login
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default ProductDetails;
