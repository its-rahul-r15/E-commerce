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
        window.scrollTo(0, 0);
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
        const shopId = item.productId?.shopId?._id || item.shopId || item.productId?._id;
        if (!shopId) return acc;
        const shopKey = shopId.toString();
        if (!acc[shopKey]) {
            acc[shopKey] = {
                shopName: item.productId?.shopId?.shopName || 'Klyra Store',
                shopId: shopKey,
                items: []
            };
        }
        acc[shopKey].items.push(item);
        return acc;
    }, {}) || {};

    const itemCount = cart?.items?.length || 0;

    const calculateTotal = () => {
        if (!cart?.items) return 0;
        return cart.items.reduce((total, item) => {
            const price = item.productId?.discountedPrice || item.productId?.price || 0;
            return total + price * item.quantity;
        }, 0);
    };

    const subtotal = calculateTotal();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#faf9f7]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-[var(--athenic-gold)] border-t-transparent mx-auto"></div>
                    <p className="mt-4 text-[10px] font-serif uppercase tracking-[0.3em] text-gray-400">Preparing your collection...</p>
                </div>
            </div>
        );
    }

    if (!cart?.items || cart.items.length === 0) {
        return (
            <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center">
                <div className="text-center max-w-md w-full mx-4 px-12 py-16">
                    <div className="w-20 h-20 mx-auto mb-8 border border-[var(--athenic-gold)]/30 flex items-center justify-center">
                        <svg className="w-8 h-8 text-[var(--athenic-gold)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-serif text-[var(--athenic-blue)] mb-3 tracking-wide">Your Collection Awaits</h2>
                    <p className="text-[11px] font-serif text-gray-400 uppercase tracking-[0.2em] mb-10">Begin curating your personal selection</p>
                    <button
                        onClick={() => navigate('/')}
                        className="btn-athenic-gold px-10 py-4 text-[11px] tracking-[0.25em] uppercase"
                    >
                        Explore Collection
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#faf9f7] py-12 font-serif">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-12">
                    <p className="text-[9px] uppercase tracking-[0.4em] text-[var(--athenic-gold)] font-semibold mb-2">Your Personal Selection</p>
                    <h1 className="text-3xl font-serif text-[var(--athenic-blue)] tracking-wide">Shopping Bag</h1>
                    <p className="text-[11px] text-gray-400 uppercase tracking-[0.2em] mt-2">
                        {itemCount} {itemCount === 1 ? 'piece' : 'pieces'} curated for you
                    </p>
                    <div className="w-16 h-px bg-[var(--athenic-gold)] mx-auto mt-4"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-6">
                        {Object.values(groupedItems).map((group) => (
                            <div key={group.shopId} className="bg-white border border-gray-100 overflow-hidden">
                                {/* Shop Header */}
                                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#fdfcfa]">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-9 h-9 border border-[var(--athenic-gold)]/30 flex items-center justify-center">
                                            <span className="text-[var(--athenic-gold)] text-sm">⚜️</span>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-serif font-semibold text-[var(--athenic-blue)] tracking-wide flex items-center">
                                                {group.shopName}
                                                <span className="ml-2 text-[8px] px-2 py-0.5 border border-[var(--athenic-gold)]/30 text-[var(--athenic-gold)] uppercase tracking-[0.15em]">Verified</span>
                                            </h3>
                                            <p className="text-[9px] text-gray-400 uppercase tracking-[0.15em]">Curated collection</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="divide-y divide-gray-50">
                                    {group.items.map((item) => {
                                        const product = item.productId;
                                        const price = product.discountedPrice || product.price;
                                        const originalPrice = product.discountedPrice ? product.price : null;
                                        const savings = originalPrice ? (originalPrice - price) * item.quantity : 0;

                                        return (
                                            <div key={product._id} className="p-6 flex flex-col sm:flex-row items-start gap-6 group hover:bg-[#fdfcfa] transition-colors">
                                                {/* Image */}
                                                <div
                                                    onClick={() => navigate(`/product/${product._id}`)}
                                                    className="w-28 h-36 bg-gray-50 overflow-hidden flex-shrink-0 cursor-pointer border border-gray-100"
                                                >
                                                    <img
                                                        src={product.images?.[0] || '/placeholder-product.png'}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                    />
                                                </div>

                                                {/* Details */}
                                                <div className="flex-1 w-full">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <div>
                                                            <p className="text-[9px] text-[var(--athenic-gold)] uppercase tracking-[0.2em] mb-1">{product.category || 'Fashion'}</p>
                                                            <h4
                                                                onClick={() => navigate(`/product/${product._id}`)}
                                                                className="font-serif text-[var(--athenic-blue)] text-base cursor-pointer hover:text-[var(--athenic-gold)] transition-colors tracking-wide"
                                                            >
                                                                {product.name}
                                                            </h4>
                                                        </div>
                                                        <button
                                                            onClick={() => handleRemoveItem(product._id)}
                                                            className="text-gray-300 hover:text-red-400 transition-colors p-1"
                                                            title="Remove"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>

                                                    {/* Color/Size info */}
                                                    <div className="flex items-center space-x-4 mt-2 mb-4">
                                                        {item.selectedColor && (
                                                            <span className="text-[9px] text-gray-400 uppercase tracking-[0.15em]">Color: {item.selectedColor}</span>
                                                        )}
                                                        {item.selectedSize && (
                                                            <span className="text-[9px] text-gray-400 uppercase tracking-[0.15em]">Size: {item.selectedSize}</span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        {/* Quantity */}
                                                        <div className="flex items-center border border-gray-200">
                                                            <button
                                                                onClick={() => handleUpdateQuantity(product._id, item.quantity - 1)}
                                                                disabled={item.quantity <= 1 || updating}
                                                                className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-[var(--athenic-blue)] hover:bg-[#fdfcfa] transition-all disabled:opacity-30 text-sm"
                                                            >
                                                                −
                                                            </button>
                                                            <span className="w-10 text-center font-serif text-sm text-[var(--athenic-blue)]">{item.quantity}</span>
                                                            <button
                                                                onClick={() => handleUpdateQuantity(product._id, item.quantity + 1)}
                                                                disabled={item.quantity >= product.stock || updating}
                                                                className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-[var(--athenic-blue)] hover:bg-[#fdfcfa] transition-all disabled:opacity-30 text-sm"
                                                            >
                                                                +
                                                            </button>
                                                        </div>

                                                        {/* Price */}
                                                        <div className="text-right">
                                                            <div className="text-lg font-serif font-semibold text-[var(--athenic-blue)]">
                                                                ₹{(price * item.quantity).toLocaleString()}
                                                            </div>
                                                            {originalPrice && (
                                                                <div className="flex items-center justify-end space-x-2">
                                                                    <span className="text-[10px] text-gray-400 line-through">₹{(originalPrice * item.quantity).toLocaleString()}</span>
                                                                    <span className="text-[9px] text-[var(--athenic-gold)] font-semibold">SAVE ₹{savings.toLocaleString()}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Shop subtotal */}
                                <div className="bg-[#fdfcfa] px-6 py-3 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-[9px] text-gray-400 uppercase tracking-[0.15em]">Subtotal</span>
                                    <span className="text-sm font-serif font-semibold text-[var(--athenic-blue)]">
                                        ₹{group.items.reduce((sum, i) => sum + (i.productId.discountedPrice || i.productId.price) * i.quantity, 0).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {/* Continue Shopping */}
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center space-x-2 text-[10px] uppercase tracking-[0.2em] text-gray-400 hover:text-[var(--athenic-gold)] transition-colors font-serif group mt-2"
                        >
                            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span>Continue browsing</span>
                        </button>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white border border-gray-100 p-8 sticky top-24">
                            <h2 className="text-[10px] font-serif uppercase tracking-[0.3em] text-[var(--athenic-gold)] font-semibold mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="font-serif text-gray-500">Subtotal ({itemCount} pieces)</span>
                                    <span className="font-serif font-semibold text-[var(--athenic-blue)]">₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="font-serif text-gray-500">Shipping</span>
                                    <span className="font-serif text-[var(--athenic-gold)] font-semibold">Complimentary</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="font-serif text-[var(--athenic-gold)]">Coupon Discount</span>
                                        <span className="font-serif font-semibold text-[var(--athenic-gold)]">−₹{discount.toLocaleString()}</span>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-gray-100 pt-5 mb-8">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <span className="text-sm font-serif font-semibold text-[var(--athenic-blue)] block">Total</span>
                                        <span className="text-[9px] text-gray-400 uppercase tracking-[0.15em]">Inclusive of all charges</span>
                                    </div>
                                    <span className="text-2xl font-serif font-bold text-[var(--athenic-blue)]">₹{(subtotal - discount).toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/checkout')}
                                className="w-full bg-[var(--athenic-blue)] text-white py-4 text-[11px] uppercase tracking-[0.25em] font-serif font-semibold hover:bg-[var(--athenic-blue)]/90 transition-all flex items-center justify-center space-x-3 group"
                            >
                                <span>Proceed to Checkout</span>
                                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>

                            <p className="text-[8px] text-center text-gray-400 mt-3 uppercase tracking-[0.15em] font-serif">
                                Secure checkout • SSL encrypted
                            </p>

                            {/* Coupon Code */}
                            <div className="mt-8 pt-8 border-t border-gray-100">
                                <label className="block text-[9px] font-serif uppercase tracking-[0.2em] text-gray-400 mb-3">Apply Coupon Code</label>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        placeholder="ENTER CODE"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        className="flex-1 border border-gray-200 px-4 py-2.5 text-xs font-serif uppercase tracking-widest outline-none focus:border-[var(--athenic-gold)] transition-colors bg-[#faf9f7]"
                                    />
                                    <button
                                        onClick={handleApplyCoupon}
                                        disabled={!couponCode || appliedCoupon}
                                        className={`px-5 py-2.5 text-[10px] uppercase tracking-[0.15em] font-serif font-semibold border transition-all ${appliedCoupon
                                            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                            : 'border-[var(--athenic-gold)] text-[var(--athenic-gold)] hover:bg-[var(--athenic-gold)] hover:text-white'
                                            }`}
                                    >
                                        {appliedCoupon ? '✓ Applied' : 'Apply'}
                                    </button>
                                </div>
                                {couponError && <p className="text-[10px] text-red-400 mt-2 font-serif">{couponError}</p>}
                                {appliedCoupon && (
                                    <div className="mt-3 bg-[#fdfcfa] border border-[var(--athenic-gold)]/20 p-3 flex justify-between items-center">
                                        <span className="text-[10px] text-[var(--athenic-gold)] font-serif">
                                            ✨ <strong>{appliedCoupon.code}</strong> applied — you save ₹{discount.toLocaleString()}
                                        </span>
                                        <button
                                            onClick={() => { setAppliedCoupon(null); setDiscount(0); setCouponCode(''); }}
                                            className="text-[9px] text-gray-400 hover:text-red-400 uppercase tracking-wider font-serif"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Trust badges */}
                            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center space-x-8">
                                <div className="flex flex-col items-center text-gray-300">
                                    <svg className="w-5 h-5 mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                    <span className="text-[8px] uppercase tracking-[0.2em] font-serif">Secure</span>
                                </div>
                                <div className="flex flex-col items-center text-gray-300">
                                    <svg className="w-5 h-5 mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                    <span className="text-[8px] uppercase tracking-[0.2em] font-serif">Authentic</span>
                                </div>
                                <div className="flex flex-col items-center text-gray-300">
                                    <svg className="w-5 h-5 mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                    <span className="text-[8px] uppercase tracking-[0.2em] font-serif">Easy Returns</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
