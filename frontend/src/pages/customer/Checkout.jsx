import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartService, orderService } from '../../services/api';
import { paymentService } from '../../services/paymentApi';

const Checkout = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deliveryAddress, setDeliveryAddress] = useState({
        street: '',
        city: '',
        state: '',
        pincode: '',
        landmark: '',
    });

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            const data = await cartService.getCart();
            if (!data.cart?.items || data.cart.items.length === 0) {
                navigate('/cart');
                return;
            }
            setCart(data.cart);
        } catch (error) {
            console.error('Error fetching cart:', error);
            navigate('/cart');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setDeliveryAddress({
            ...deliveryAddress,
            [e.target.name]: e.target.value,
        });
    };

    const calculateTotal = () => {
        if (!cart?.items) return 0;
        return cart.items.reduce((total, item) => {
            const price = item.productId?.discountedPrice || item.productId?.price || 0;
            return total + price * item.quantity;
        }, 0);
    };

    // ... (Razorpay logic remains same)
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.pincode) {
            alert('Please fill all required address fields');
            return;
        }

        setSubmitting(true);
        try {
            // Step 1: Create order in backend
            const response = await orderService.createOrder(deliveryAddress);
            const order = response.orders?.[0];

            if (!order) {
                alert('Failed to create order. Please try again.');
                setSubmitting(false);
                return;
            }

            // Step 2: Load Razorpay script
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                alert('Failed to load payment gateway. Please try again.');
                setSubmitting(false);
                return;
            }

            // Step 3: Create Razorpay order
            const razorpayOrder = await paymentService.createOrder(
                order._id,
                order.totalAmount
            );

            // Step 4: Configure Razorpay options
            const options = {
                key: razorpayOrder.keyId,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                order_id: razorpayOrder.orderId,
                name: 'ShopLocal Market',
                description: `Order #${order._id.slice(-8)}`,
                handler: async function (response) {
                    try {
                        await paymentService.verifyPayment({
                            orderId: order._id,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                        });
                        alert('Payment successful! 🎉 Your order has been placed.');
                        navigate('/orders');
                    } catch (error) {
                        console.error('Payment verification failed:', error);
                        alert('Payment verification failed. Please contact support.');
                    }
                },
                prefill: {
                    name: '',
                    email: '',
                    contact: '',
                },
                notes: {
                    address: `${deliveryAddress.street}, ${deliveryAddress.city}`,
                },
                theme: {
                    color: '#10B981', // Emerald-500
                },
                modal: {
                    ondismiss: async function () {
                        try {
                            await paymentService.paymentFailed(order._id);
                            alert('Payment cancelled. Your order has been marked as cancelled.');
                        } catch (error) {
                            console.error('Error handling payment cancellation:', error);
                        }
                    }
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();

        } catch (error) {
            console.error('Order creation error:', error);
            alert(error.response?.data?.error || 'Failed to create order');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
            </div>
        );
    }

    const subtotal = calculateTotal();
    const total = subtotal + 40 + (subtotal * 0.05); // Matching Cart calculation

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Process Steps */}
                <div className="mb-8 flex items-center justify-center space-x-4 text-sm font-medium">
                    <span className="text-gray-400">Cart</span>
                    <span className="text-gray-300">›</span>
                    <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Checkout</span>
                    <span className="text-gray-300">›</span>
                    <span className="text-gray-400">Payment</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Delivery Address Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                    <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm mr-3">1</span>
                                    Shipping Address
                                </h2>
                            </div>

                            <div className="p-8">
                                <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Street Address <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="street"
                                            required
                                            value={deliveryAddress.street}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                                            placeholder="House no., Building name, Street"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                City <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="city"
                                                required
                                                value={deliveryAddress.city}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                                                placeholder="City"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                State <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="state"
                                                required
                                                value={deliveryAddress.state}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                                                placeholder="State"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Pincode <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="pincode"
                                                required
                                                pattern="[0-9]{6}"
                                                value={deliveryAddress.pincode}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                                                placeholder="6-digit pincode"
                                                maxLength="6"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Landmark (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                name="landmark"
                                                value={deliveryAddress.landmark}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                                                placeholder="Nearby landmark"
                                            />
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Order Items Preview */}
                        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                    <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm mr-3">2</span>
                                    Order Review
                                </h2>
                            </div>
                            <div className="p-8">
                                <div className="space-y-4">
                                    {cart?.items?.map((item) => {
                                        const product = item.productId;
                                        if (!product) return null;
                                        const price = product.discountedPrice || product.price;

                                        return (
                                            <div key={item._id} className="flex items-center space-x-4 border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                                                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                                    <img
                                                        src={product.images?.[0] || '/placeholder-product.png'}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-gray-900">{product.name}</p>
                                                    <p className="text-sm text-gray-500">Qty: {item.quantity} × ₹{price}</p>
                                                </div>
                                                <p className="font-bold text-gray-900">
                                                    ₹{(price * item.quantity).toFixed(2)}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Column */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24 border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className="font-medium text-gray-900">₹40.00</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Estimated Tax</span>
                                    <span className="font-medium text-gray-900">₹{(subtotal * 0.05).toFixed(2)}</span>
                                </div>
                                <div className="border-t border-dashed border-gray-200 my-4"></div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <span className="text-lg font-bold text-gray-900 block">Total Amount</span>
                                        <span className="text-xs text-gray-500">VAT Included</span>
                                    </div>
                                    <span className="text-3xl font-bold text-emerald-600">₹{total.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                form="checkout-form"
                                disabled={submitting}
                                className="w-full bg-emerald-500 text-white font-bold py-4 rounded-xl hover:bg-emerald-600 transition-all transform hover:-translate-y-1 shadow-lg shadow-emerald-200 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:transform-none"
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <span>Pay & Place Order</span>
                                )}
                            </button>

                            <div className="bg-emerald-50 rounded-lg p-4 mt-6">
                                <h3 className="text-sm font-bold text-emerald-900 mb-2">Buyer Protection</h3>
                                <p className="text-xs text-emerald-700">
                                    Your order is protected. If you don't receive your item, or it's not as described, we'll give you a full refund.
                                </p>
                            </div>

                            {/* Trust Icons */}
                            <div className="mt-6 flex justify-center space-x-6 grayscale opacity-60">
                                <div className="flex flex-col items-center">
                                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                    <span className="text-[10px] uppercase font-bold">Encrypted</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <span className="text-[10px] uppercase font-bold">Verified</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
