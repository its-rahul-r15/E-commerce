import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartService } from '../../services/api';

const Cart = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            const data = await cartService.getCart();
            setCart(data.cart);
        } catch (error) {
            console.error('Error fetching cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateQuantity = async (productId, newQuantity) => {
        if (newQuantity < 1) return;

        setUpdating(true);
        try {
            const data = await cartService.updateCartItem(productId, newQuantity);
            setCart(data.cart);
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to update quantity');
        } finally {
            setUpdating(false);
        }
    };

    const handleRemoveItem = async (productId) => {
        if (!confirm('Remove this item from cart?')) return;

        setUpdating(true);
        try {
            const data = await cartService.removeFromCart(productId);
            setCart(data.cart);
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to remove item');
        } finally {
            setUpdating(false);
        }
    };

    const calculateTotal = () => {
        if (!cart?.items) return 0;
        return cart.items.reduce((total, item) => {
            const price = item.productId?.discountedPrice || item.productId?.price || 0;
            return total + price * item.quantity;
        }, 0);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (!cart?.items || cart.items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                    <p className="text-gray-600 mb-6">Add some products to get started!</p>
                    <button onClick={() => navigate('/')} className="btn-primary">
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    const total = calculateTotal();

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.items.map((item) => {
                            const product = item.productId;
                            if (!product) return null;

                            const price = product.discountedPrice || product.price;
                            const originalPrice = product.discountedPrice ? product.price : null;

                            return (
                                <div key={item._id} className="bg-white rounded-lg shadow-sm p-4">
                                    <div className="flex space-x-4">
                                        {/* Product Image */}
                                        <img
                                            src={product.images?.[0] || '/placeholder-product.png'}
                                            alt={product.name}
                                            className="w-24 h-24 object-cover rounded-lg"
                                        />

                                        {/* Product Info */}
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 mb-1">
                                                {product.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-2">
                                                {product.shopId?.shopName}
                                            </p>

                                            <div className="flex items-center space-x-2 mb-3">
                                                <span className="text-lg font-bold text-gray-900">₹{price}</span>
                                                {originalPrice && (
                                                    <span className="text-sm text-gray-500 line-through">₹{originalPrice}</span>
                                                )}
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <button
                                                        onClick={() => handleUpdateQuantity(product._id, item.quantity - 1)}
                                                        disabled={updating || item.quantity <= 1}
                                                        className="w-8 h-8 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                    <button
                                                        onClick={() => handleUpdateQuantity(product._id, item.quantity + 1)}
                                                        disabled={updating || item.quantity >= product.stock}
                                                        className="w-8 h-8 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => handleRemoveItem(product._id)}
                                                    disabled={updating}
                                                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>

                                        {/* Item Total */}
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-gray-900">
                                                ₹{(price * item.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-700">
                                    <span>Subtotal ({cart.items.length} items)</span>
                                    <span>₹{total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-700">
                                    <span>Delivery</span>
                                    <span className="text-green-600">FREE</span>
                                </div>
                                <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                                    <span>Total</span>
                                    <span>₹{total.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/checkout')}
                                className="btn-primary w-full mb-3"
                            >
                                Proceed to Checkout
                            </button>

                            <button
                                onClick={() => navigate('/')}
                                className="btn-secondary w-full"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
