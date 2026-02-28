import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartService, orderService, addressService } from '../../services/api';
import { paymentService } from '../../services/paymentApi';

const EMPTY_FORM = { street: '', city: '', state: '', pincode: '', landmark: '', isDefault: false };

const Checkout = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Saved addresses
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedIdx, setSelectedIdx] = useState(null); // index of selected saved address
    const [mode, setMode] = useState('saved'); // 'saved' | 'new'
    const [newForm, setNewForm] = useState(EMPTY_FORM);
    const [savingAddress, setSavingAddress] = useState(false);

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            const [cartData, addresses] = await Promise.all([
                cartService.getCart(),
                addressService.getAddresses().catch(() => []),
            ]);

            if (!cartData.cart?.items?.length) {
                navigate('/cart');
                return;
            }
            setCart(cartData.cart);

            if (addresses.length > 0) {
                setSavedAddresses(addresses);
                // Auto-select the default address
                const defaultIdx = addresses.findIndex(a => a.isDefault);
                setSelectedIdx(defaultIdx >= 0 ? defaultIdx : 0);
                setMode('saved');
            } else {
                setMode('new'); // No saved addresses → show form directly
            }
        } catch (err) {
            navigate('/cart');
        } finally {
            setLoading(false);
        }
    };

    // ── Helpers ──────────────────────────────────────────────────────────────
    const calculateTotal = () => {
        if (!cart?.items) return 0;
        return cart.items.reduce((t, item) => {
            const price = item.productId?.discountedPrice || item.productId?.price || 0;
            return t + price * item.quantity;
        }, 0);
    };

    const getActiveAddress = () => {
        if (mode === 'saved' && selectedIdx !== null && savedAddresses[selectedIdx]) {
            return savedAddresses[selectedIdx];
        }
        return null;
    };

    const loadRazorpayScript = () => new Promise((resolve) => {
        if (window.Razorpay) return resolve(true);
        const s = document.createElement('script');
        s.src = 'https://checkout.razorpay.com/v1/checkout.js';
        s.onload = () => resolve(true);
        s.onerror = () => resolve(false);
        document.body.appendChild(s);
    });

    // ── Save new address to profile ──────────────────────────────────────────
    const handleSaveNewAddress = async () => {
        const { street, city, state, pincode } = newForm;
        if (!street || !city || !state || !pincode) {
            alert('Please fill all required fields');
            return;
        }
        setSavingAddress(true);
        try {
            const updated = await addressService.addAddress(newForm);
            setSavedAddresses(updated);
            setSelectedIdx(updated.length - 1);
            setMode('saved');
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to save address');
        } finally {
            setSavingAddress(false);
        }
    };

    const handleDeleteAddress = async (idx) => {
        if (!confirm('Delete this address?')) return;
        try {
            const updated = await addressService.deleteAddress(idx);
            setSavedAddresses(updated);
            if (updated.length === 0) {
                setMode('new');
                setSelectedIdx(null);
            } else {
                setSelectedIdx(Math.min(selectedIdx, updated.length - 1));
            }
        } catch (err) {
            alert('Failed to delete address');
        }
    };

    const handleSetDefault = async (idx) => {
        try {
            const updated = await addressService.setDefault(idx);
            setSavedAddresses(updated);
        } catch (err) {
            alert('Failed to update default');
        }
    };

    // ── Place Order ──────────────────────────────────────────────────────────
    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        const addr = getActiveAddress();
        if (!addr) {
            alert('Please select or add a delivery address');
            return;
        }

        setSubmitting(true);
        try {
            // Send only the fields that the Order schema needs — strip location, isDefault, etc.
            const deliveryAddress = {
                street: addr.street,
                city: addr.city,
                state: addr.state,
                pincode: addr.pincode,
            };
            const response = await orderService.createOrder(deliveryAddress);
            const order = response.orders?.[0];
            if (!order) { alert('Failed to create order'); return; }

            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) { alert('Failed to load payment gateway'); return; }

            const razorpayOrder = await paymentService.createOrder(order._id, order.totalAmount);

            const options = {
                key: razorpayOrder.keyId,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                order_id: razorpayOrder.orderId,
                name: 'Klyra',
                description: `Order #${order._id.slice(-8)}`,
                handler: async (res) => {
                    try {
                        await paymentService.verifyPayment({
                            orderId: order._id,
                            razorpayOrderId: res.razorpay_order_id,
                            razorpayPaymentId: res.razorpay_payment_id,
                            razorpaySignature: res.razorpay_signature,
                        });
                        alert('Payment successful! 🎉 Your order has been placed.');
                        navigate('/orders');
                    } catch (err) {
                        const msg = err?.response?.data?.error || err?.message || 'Payment verification failed';
                        alert(`Payment error: ${msg}`);
                    }
                },
                notes: { address: `${addr.street}, ${addr.city}` },
                theme: { color: '#10B981' },
                modal: {
                    ondismiss: async () => {
                        try { await paymentService.paymentFailed(order._id); } catch { }
                        alert('Payment cancelled.');
                    },
                },
            };

            new window.Razorpay(options).open();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to create order');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
        </div>
    );

    const subtotal = calculateTotal();
    const total = subtotal + 40 + subtotal * 0.05;
    const activeAddr = getActiveAddress();

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Steps */}
                <div className="mb-8 flex items-center justify-center space-x-4 text-sm font-medium">
                    <span className="text-gray-400">Cart</span>
                    <span className="text-gray-300">›</span>
                    <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Checkout</span>
                    <span className="text-gray-300">›</span>
                    <span className="text-gray-400">Payment</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* ── Saved Addresses ──────────────────────────────── */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                                    <span className="w-7 h-7 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm mr-3">1</span>
                                    Delivery Address
                                </h2>
                                {savedAddresses.length > 0 && (
                                    <button
                                        onClick={() => setMode(mode === 'new' ? 'saved' : 'new')}
                                        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                                    >
                                        {mode === 'new' ? '← Saved Addresses' : '+ Add New'}
                                    </button>
                                )}
                            </div>

                            <div className="p-6">
                                {/* ── Mode: Select saved address ─────────────── */}
                                {mode === 'saved' && savedAddresses.length > 0 && (
                                    <div className="space-y-3">
                                        {savedAddresses.map((addr, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => setSelectedIdx(idx)}
                                                className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all ${selectedIdx === idx
                                                    ? 'border-emerald-500 bg-emerald-50'
                                                    : 'border-gray-200 hover:border-emerald-300'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start space-x-3">
                                                        {/* Radio */}
                                                        <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${selectedIdx === idx ? 'border-emerald-500' : 'border-gray-300'}`}>
                                                            {selectedIdx === idx && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900 text-sm">{addr.street}</p>
                                                            <p className="text-gray-500 text-xs mt-0.5">
                                                                {addr.city}, {addr.state} — {addr.pincode}
                                                            </p>
                                                            {addr.landmark && (
                                                                <p className="text-gray-400 text-xs mt-0.5">Near: {addr.landmark}</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
                                                        {addr.isDefault ? (
                                                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">Default</span>
                                                        ) : (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleSetDefault(idx); }}
                                                                className="text-[10px] text-gray-400 hover:text-emerald-600 transition-colors"
                                                            >
                                                                Set Default
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteAddress(idx); }}
                                                            className="text-[10px] text-red-400 hover:text-red-600 transition-colors"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* ── Mode: New address form ─────────────────── */}
                                {mode === 'new' && (
                                    <form className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Street Address <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={newForm.street}
                                                onChange={e => setNewForm({ ...newForm, street: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                                                placeholder="House no., Building, Street"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">City <span className="text-red-500">*</span></label>
                                                <input type="text" value={newForm.city} onChange={e => setNewForm({ ...newForm, city: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none" placeholder="City" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">State <span className="text-red-500">*</span></label>
                                                <input type="text" value={newForm.state} onChange={e => setNewForm({ ...newForm, state: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none" placeholder="State" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Pincode <span className="text-red-500">*</span></label>
                                                <input type="text" maxLength="6" pattern="[0-9]{6}" value={newForm.pincode}
                                                    onChange={e => setNewForm({ ...newForm, pincode: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none" placeholder="6-digit pincode" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Landmark <span className="text-gray-400">(Optional)</span></label>
                                                <input type="text" value={newForm.landmark} onChange={e => setNewForm({ ...newForm, landmark: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none" placeholder="Nearby landmark" />
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <input type="checkbox" id="setDefault" checked={newForm.isDefault}
                                                onChange={e => setNewForm({ ...newForm, isDefault: e.target.checked })}
                                                className="w-4 h-4 text-emerald-500 rounded border-gray-300" />
                                            <label htmlFor="setDefault" className="text-sm text-gray-600">Save as default address</label>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleSaveNewAddress}
                                            disabled={savingAddress}
                                            className="w-full py-3 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-all disabled:opacity-60"
                                        >
                                            {savingAddress ? 'Saving...' : '💾 Save & Use This Address'}
                                        </button>
                                    </form>
                                )}

                                {/* No addresses + no form shown */}
                                {mode === 'saved' && savedAddresses.length === 0 && (
                                    <div className="text-center py-6 text-gray-400">
                                        <p className="text-sm">No saved addresses yet.</p>
                                        <button onClick={() => setMode('new')} className="mt-2 text-emerald-600 font-medium text-sm">+ Add Address</button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Order Items ───────────────────────────────────── */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/50">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                                    <span className="w-7 h-7 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm mr-3">2</span>
                                    Order Review
                                </h2>
                            </div>
                            <div className="p-6 space-y-4">
                                {cart?.items?.map((item) => {
                                    const product = item.productId;
                                    if (!product) return null;
                                    const price = product.discountedPrice || product.price;
                                    return (
                                        <div key={product._id} className="flex items-center space-x-4 border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                                            <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                                                <img src={product.images?.[0] || '/placeholder-product.png'} alt={product.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900 text-sm">{product.name}</p>
                                                <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{price}</p>
                                            </div>
                                            <p className="font-bold text-gray-900 text-sm">₹{(price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* ── Order Summary ────────────────────────────────────── */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24 border border-gray-100 space-y-5">
                            <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>

                            {/* Active address preview */}
                            {activeAddr && (
                                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                                    <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-widest mb-1">Delivering to</p>
                                    <p className="text-xs font-medium text-gray-800">{activeAddr.street}</p>
                                    <p className="text-xs text-gray-500">{activeAddr.city}, {activeAddr.state} — {activeAddr.pincode}</p>
                                </div>
                            )}

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Shipping</span>
                                    <span className="font-medium text-gray-900">₹40.00</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Tax (5%)</span>
                                    <span className="font-medium text-gray-900">₹{(subtotal * 0.05).toFixed(2)}</span>
                                </div>
                                <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between items-center">
                                    <span className="font-bold text-gray-900">Total</span>
                                    <span className="text-2xl font-bold text-emerald-600">₹{total.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={submitting || !activeAddr}
                                className="w-full bg-emerald-500 text-white font-bold py-4 rounded-xl hover:bg-emerald-600 transition-all transform hover:-translate-y-0.5 shadow-lg shadow-emerald-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Processing...</span></>
                                ) : (
                                    <span>{activeAddr ? 'Pay & Place Order' : 'Select an Address First'}</span>
                                )}
                            </button>

                            <div className="bg-emerald-50 rounded-lg p-4">
                                <h3 className="text-sm font-bold text-emerald-900 mb-1">Buyer Protection</h3>
                                <p className="text-xs text-emerald-700">Full refund if item not received or not as described.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
