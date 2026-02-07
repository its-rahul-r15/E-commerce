import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartService, orderService } from '../../services/api';

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

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.pincode) {
            alert('Please fill all required address fields');
            return;
        }

        setSubmitting(true);
        try {
            await orderService.createOrder(deliveryAddress);
            alert('Order placed successfully! 🎉');
            navigate('/orders');
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to place order');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    const total = calculateTotal();

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Delivery Address Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Delivery Address</h2>

                            <form onSubmit={handlePlaceOrder} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Street Address *
                                    </label>
                                    <input
                                        type="text"
                                        name="street"
                                        required
                                        value={deliveryAddress.street}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="House no., Building name, Street"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            required
                                            value={deliveryAddress.city}
                                            onChange={handleChange}
                                            className="input"
                                            placeholder="City"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            State *
                                        </label>
                                        <input
                                            type="text"
                                            name="state"
                                            required
                                            value={deliveryAddress.state}
                                            onChange={handleChange}
                                            className="input"
                                            placeholder="State"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Pincode *
                                        </label>
                                        <input
                                            type="text"
                                            name="pincode"
                                            required
                                            pattern="[0-9]{6}"
                                            value={deliveryAddress.pincode}
                                            onChange={handleChange}
                                            className="input"
                                            placeholder="6-digit pincode"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Landmark (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            name="landmark"
                                            value={deliveryAddress.landmark}
                                            onChange={handleChange}
                                            className="input"
                                            placeholder="Nearby landmark"
                                        />
                                    </div>
                                </div>

                                {/* Order Items Preview */}
                                <div className="border-t pt-6 mt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Order Items ({cart?.items?.length})
                                    </h3>
                                    <div className="space-y-3">
                                        {cart?.items?.map((item) => {
                                            const product = item.productId;
                                            if (!product) return null;
                                            const price = product.discountedPrice || product.price;

                                            return (
                                                <div key={item._id} className="flex items-center space-x-3 text-sm">
                                                    <img
                                                        src={product.images?.[0] || '/placeholder-product.png'}
                                                        alt={product.name}
                                                        className="w-12 h-12 object-cover rounded"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900">{product.name}</p>
                                                        <p className="text-gray-600">Qty: {item.quantity}</p>
                                                    </div>
                                                    <p className="font-semibold text-gray-900">
                                                        ₹{(price * item.quantity).toFixed(2)}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="btn-primary w-full mt-6 disabled:opacity-50"
                                >
                                    {submitting ? 'Placing Order...' : `Place Order - ₹${total.toFixed(2)}`}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-700">
                                    <span>Subtotal ({cart?.items?.length} items)</span>
                                    <span>₹{total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-700">
                                    <span>Delivery Charges</span>
                                    <span className="text-green-600 font-medium">FREE</span>
                                </div>
                                <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                                    <span>Total Amount</span>
                                    <span>₹{total.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-sm text-green-800">
                                    ✓ Cash on Delivery available
                                </p>
                                <p className="text-sm text-green-800 mt-1">
                                    ✓ Free delivery on all orders
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
