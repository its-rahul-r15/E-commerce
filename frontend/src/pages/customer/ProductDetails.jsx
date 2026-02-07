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

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const data = await productService.getProductById(id);
            setProduct(data.product);
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
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
            alert('Added to cart successfully!');
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to add to cart');
        } finally {
            setAddingToCart(false);
        }
    };

    const handleBuyNow = async () => {
        if (!isAuthenticated) {
            setShowLoginPrompt(true);
            return;
        }

        await handleAddToCart();
        navigate('/cart');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
                    <button onClick={() => navigate('/')} className="btn-primary">
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    const price = product.discountedPrice || product.price;
    const originalPrice = product.discountedPrice ? product.price : null;
    const discount = originalPrice
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
                    <button onClick={() => navigate('/')} className="hover:text-primary transition-colors">
                        Home
                    </button>
                    <span>›</span>
                    <button onClick={() => navigate(`/shop/${product.shopId._id}`)} className="hover:text-primary transition-colors">
                        {product.shopId?.shopName}
                    </button>
                    <span>›</span>
                    <span className="text-gray-900 font-medium">{product.name}</span>
                </nav>

                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 lg:p-12">
                        {/* Images Section */}
                        <div>
                            {/* Main Image */}
                            <div className="bg-gray-50 rounded-xl overflow-hidden mb-4 border border-gray-100">
                                <img
                                    src={product.images?.[selectedImage] || '/placeholder-product.png'}
                                    alt={product.name}
                                    className="w-full h-96 object-contain p-4"
                                />
                            </div>

                            {/* Thumbnail Images */}
                            {product.images?.length > 1 && (
                                <div className="grid grid-cols-5 gap-3">
                                    {product.images.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImage(index)}
                                            className={`border-2 rounded-lg overflow-hidden transition-all ${selectedImage === index
                                                    ? 'border-primary shadow-sm scale-105'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-16 object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info Section */}
                        <div>
                            {/* Product Title */}
                            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                                {product.name}
                            </h1>

                            {/* Shop Link */}
                            <button
                                onClick={() => navigate(`/shop/${product.shopId._id}`)}
                                className="text-primary hover:text-primary-dark font-medium mb-6 inline-flex items-center space-x-1 group"
                            >
                                <span>Visit {product.shopId?.shopName}</span>
                                <svg className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>

                            {/* Price Section */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-baseline space-x-3 mb-1">
                                    <span className="text-4xl font-bold text-gray-900">₹{price}</span>
                                    {originalPrice && (
                                        <>
                                            <span className="text-xl text-gray-400 line-through">₹{originalPrice}</span>
                                            <span className="badge-success text-sm font-semibold">{discount}% OFF</span>
                                        </>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600">Inclusive of all taxes</p>
                            </div>

                            {/* Stock Status */}
                            <div className="mb-6">
                                {product.stock > 0 ? (
                                    <div className="inline-flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg">
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="font-medium">In Stock ({product.stock} available)</span>
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center space-x-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg">
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        <span className="font-medium">Out of Stock</span>
                                    </div>
                                )}
                            </div>

                            {/* Quantity Selector */}
                            {product.stock > 0 && (
                                <div className="mb-8">
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Quantity
                                    </label>
                                    <div className="inline-flex items-center border border-gray-300 rounded-lg">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors text-lg font-semibold"
                                        >
                                            −
                                        </button>
                                        <span className="w-16 text-center font-semibold text-lg">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                            className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors text-lg font-semibold"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            {product.stock > 0 && (
                                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={addingToCart}
                                        className="btn-outline flex-1 disabled:opacity-50"
                                    >
                                        {addingToCart ? 'Adding...' : 'Add to Cart'}
                                    </button>
                                    <button onClick={handleBuyNow} className="btn-primary flex-1">
                                        Buy Now
                                    </button>
                                </div>
                            )}

                            {/* Description */}
                            <div className="border-t border-gray-200 pt-6 mb-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-3">Product Description</h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{product.description}</p>
                            </div>

                            {/* Category & Tags */}
                            <div className="border-t border-gray-200 pt-6">
                                <div className="mb-4">
                                    <span className="text-sm font-semibold text-gray-700">Category: </span>
                                    <span className="badge-primary ml-2">{product.category}</span>
                                </div>
                                {product.tags?.length > 0 && (
                                    <div>
                                        <span className="text-sm font-semibold text-gray-700 mb-3 block">Tags:</span>
                                        <div className="flex flex-wrap gap-2">
                                            {product.tags.map((tag, index) => (
                                                <span key={index} className="bg-gray-100 text-gray-700 text-sm px-3 py-1.5 rounded-lg">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Login Prompt Modal */}
            {showLoginPrompt && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold mb-4">Login Required</h2>
                        <p className="text-gray-600 mb-6">Please login to add items to cart</p>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setShowLoginPrompt(false)}
                                className="btn-secondary flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => navigate('/login')}
                                className="btn-primary flex-1"
                            >
                                Login
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetails;
