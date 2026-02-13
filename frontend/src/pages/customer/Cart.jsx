import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartService, couponService } from '../../services/api';

const Cart = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [discount, setDiscount] = useState(0);
    const [couponError, setCouponError] = useState('');

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

    const handleApplyCoupon = async () => {
        setCouponError('');
        try {
            // Validate against the first shop in cart for now (assuming single shop checkout optimization or backend handles it)
            // In a real multi-vendor cart, coupons might be shop-specific. 
            // Here we pass the first shop ID found.
            const shopId = cart?.items?.[0]?.productId?.shopId?._id;

            const data = await couponService.validateCoupon(couponCode, subtotal, shopId);
            setAppliedCoupon(data.coupon);
            setDiscount(data.discountAmount);
        } catch (error) {
            setCouponError(error.response?.data?.error || 'Invalid coupon');
            setAppliedCoupon(null);
            setDiscount(0);
        }
    };

    // Group items by shop
    const groupedItems = cart?.items?.reduce((acc, item) => {
        const shopId = item.productId?.shopId?._id;
        if (!shopId) return acc;
        if (!acc[shopId]) {
            acc[shopId] = {
                shopName: item.productId.shopId.shopName,
                shopId: shopId,
                items: []
            };
        }
        acc[shopId].items.push(item);
        return acc;
    }, {}) || {};

    const shopCount = Object.keys(groupedItems).length;
    const itemCount = cart?.items?.length || 0;

    const calculateTotal = () => {
        if (!cart?.items) return 0;
        return cart.items.reduce((total, item) => {
            const price = item.productId?.discountedPrice || item.productId?.price || 0;
            return total + price * item.quantity;
        }, 0);
    };

    const subtotal = calculateTotal();
    const estDelivery = '10 min'; // Fast delivery!

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
            </div>
        );
    }

    if (!cart?.items || cart.items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center p-8 bg-white rounded-2xl shadow-sm max-w-md w-full mx-4">
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
                    <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200"
                    >
                        Start Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Your Cart <span className="text-lg font-medium text-gray-500 ml-2">({itemCount} items from {shopCount} shops)</span>
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {Object.values(groupedItems).map((group) => (
                            <div key={group.shopId} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                                {/* Shop Header */}
                                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-lg">
                                            🏪
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 flex items-center">
                                                {group.shopName}
                                                <span className="ml-2 bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Verified</span>
                                            </h3>
                                            <p className="text-xs text-gray-500">Shipping from Local Warehouse</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/shop/${group.shopId}`)}
                                        className="text-emerald-500 text-sm font-medium hover:text-emerald-600"
                                    >
                                        Add more items
                                    </button>
                                </div>

                                {/* Items List */}
                                <div className="divide-y divide-gray-100">
                                    {group.items.map((item) => {
                                        const product = item.productId;
                                        const price = product.discountedPrice || product.price;
                                        const originalPrice = product.discountedPrice ? product.price : null;

                                        return (
                                            <div key={item._id} className="p-6 flex flex-col sm:flex-row items-center gap-6 group hover:bg-gray-50/50 transition-colors">
                                                {/* Image */}
                                                <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200">
                                                    <img
                                                        src={product.images?.[0] || '/placeholder-product.png'}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                </div>

                                                {/* Details */}
                                                <div className="flex-1 w-full">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4
                                                            onClick={() => navigate(`/product/${product._id}`)}
                                                            className="font-bold text-gray-900 text-lg cursor-pointer hover:text-emerald-600 transition-colors"
                                                        >
                                                            {product.name}
                                                        </h4>
                                                        <button
                                                            onClick={() => handleRemoveItem(product._id)}
                                                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                            title="Remove item"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>

                                                    <p className="text-sm text-gray-500 mb-4">
                                                        Color: Space Grey | Size: Universal
                                                    </p>

                                                    <div className="flex items-center justify-between">
                                                        {/* Quantity */}
                                                        <div className="flex items-center border border-gray-200 rounded-lg bg-white">
                                                            <button
                                                                onClick={() => handleUpdateQuantity(product._id, item.quantity - 1)}
                                                                disabled={item.quantity <= 1}
                                                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                                                            >
                                                                −
                                                            </button>
                                                            <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                                                            <button
                                                                onClick={() => handleUpdateQuantity(product._id, item.quantity + 1)}
                                                                disabled={item.quantity >= product.stock}
                                                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                                                            >
                                                                +
                                                            </button>
                                                        </div>

                                                        {/* Price */}
                                                        <div className="text-right">
                                                            <div className="text-xl font-bold text-gray-900">₹{(price * item.quantity).toFixed(2)}</div>
                                                            {originalPrice && (
                                                                <div className="text-xs text-gray-400 line-through">₹{(originalPrice * item.quantity).toFixed(2)}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Shop Specific Delivery Info */}
                                <div className="bg-emerald-50/50 px-6 py-3 border-t border-emerald-100 flex items-center space-x-2">
                                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                    </svg>
                                    <span className="text-sm font-medium text-emerald-800">
                                        Standard Delivery: <span className="font-bold">₹12.00</span> • Est. {estDelivery}
                                    </span>
                                    <div className="flex-1 text-right text-sm text-gray-600">
                                        Shop Subtotal: <span className="font-bold text-gray-900">₹{group.items.reduce((sum, i) => sum + (i.productId.discountedPrice || i.productId.price) * i.quantity, 0).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary Column */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24 border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal ({itemCount} items)</span>
                                    <span className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-emerald-600">
                                    <span>Shipping</span>
                                    <span className="font-medium">FREE</span>
                                </div>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-emerald-600">
                                    <span>Discount</span>
                                    <span className="font-medium">-₹{discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="border-t border-dashed border-gray-200 my-4"></div>
                            <div className="flex justify-between items-end">
                                <div>
                                    <span className="text-lg font-bold text-gray-900 block">Total Amount</span>
                                    <span className="text-xs text-emerald-600">✨ Free Shipping & No Tax</span>
                                </div>
                                <span className="text-3xl font-bold text-emerald-600">₹{(subtotal - discount).toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/checkout')}
                            className="w-full bg-emerald-500 text-white font-bold py-4 rounded-xl hover:bg-emerald-600 transition-all transform hover:-translate-y-1 shadow-lg shadow-emerald-200 flex items-center justify-center space-x-2 group"
                        >
                            <span>Proceed to Checkout</span>
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                        <p className="text-xs text-center text-gray-400 mt-4">
                            By proceeding, you agree to our Terms of Service
                        </p>

                        {/* Coupon Code */}
                        <div className="mt-8">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Have a coupon code?</label>
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    placeholder="CODE123"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 bg-gray-50"
                                />
                                <button
                                    onClick={handleApplyCoupon}
                                    disabled={!couponCode || appliedCoupon}
                                    className={`px-4 py-2 border font-bold rounded-lg text-sm transition-colors ${appliedCoupon
                                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'border-emerald-500 text-emerald-600 hover:bg-emerald-50'
                                        }`}
                                >
                                    {appliedCoupon ? 'Applied' : 'Apply'}
                                </button>
                            </div>
                            {couponError && <p className="text-xs text-red-500 mt-2">{couponError}</p>}
                            {appliedCoupon && (
                                <div className="mt-2 bg-emerald-50 border border-emerald-100 rounded-lg p-2 flex justify-between items-center">
                                    <span className="text-xs text-emerald-700">Coupon <b>{appliedCoupon.code}</b> applied!</span>
                                    <button onClick={() => { setAppliedCoupon(null); setDiscount(0); }} className="text-xs text-red-500 hover:underline">Remove</button>
                                </div>
                            )}
                        </div>

                        {/* Trust Icons */}
                        <div className="mt-8 flex justify-center space-x-6 grayscale opacity-60">
                            <div className="flex flex-col items-center">
                                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                <span className="text-[10px] uppercase font-bold">Secure</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                <span className="text-[10px] uppercase font-bold">Protected</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                <span className="text-[10px] uppercase font-bold">Returns</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
