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
    const [deliveryCoordinates, setDeliveryCoordinates] = useState(null); // [lng, lat]

    useEffect(() => {
        fetchAll();
        // Get user's delivery location for nearest-vendor routing
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setDeliveryCoordinates([pos.coords.longitude, pos.coords.latitude]),
                () => console.log('[Checkout] Geolocation denied, will use fallback vendor routing')
            );
        }
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
            const response = await orderService.createOrder(deliveryAddress, deliveryCoordinates);
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
                theme: { color: '#1a2332' }, // Athenic blue color for Razorpay modal
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
        <div className="min-h-screen flex items-center justify-center bg-[#faf9f7]">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-[var(--athenic-gold)] border-t-transparent mx-auto"></div>
                <p className="mt-4 text-[10px] font-serif uppercase tracking-[0.3em] text-gray-400">Preparing checkout...</p>
            </div>
        </div>
    );

    const subtotal = calculateTotal();
    const total = subtotal; // Assuming shipping and tax are complementary for Klyra
    const activeAddr = getActiveAddress();

    return (
        <div className="min-h-screen bg-[#faf9f7] py-12 font-serif">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Steps */}
                <div className="mb-12 flex items-center justify-center space-x-4 text-[10px] uppercase tracking-[0.2em] font-semibold">
                    <span className="text-gray-400 cursor-pointer hover:text-[var(--athenic-gold)] transition-colors" onClick={() => navigate('/cart')}>Cart</span>
                    <span className="text-gray-300">›</span>
                    <span className="text-[var(--athenic-blue)] border-b border-[var(--athenic-blue)] pb-0.5">Checkout</span>
                    <span className="text-gray-300">›</span>
                    <span className="text-gray-400">Payment</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-10">

                        {/* ── Saved Addresses ──────────────────────────────── */}
                        <div className="bg-white border border-gray-100 overflow-hidden">
                            <div className="px-8 py-5 border-b border-gray-100 bg-[#fdfcfa] flex items-center justify-between">
                                <h2 className="text-sm font-serif font-semibold text-[var(--athenic-blue)] tracking-wide flex items-center uppercase">
                                    <span className="w-8 h-8 border border-[var(--athenic-gold)]/30 text-[var(--athenic-gold)] flex items-center justify-center text-xs mr-4">I</span>
                                    Delivery Details
                                </h2>
                                {savedAddresses.length > 0 && (
                                    <button
                                        onClick={() => setMode(mode === 'new' ? 'saved' : 'new')}
                                        className="text-[10px] text-[var(--athenic-gold)] hover:text-yellow-600 uppercase tracking-widest font-semibold transition-colors"
                                    >
                                        {mode === 'new' ? '← Saved Addresses' : '+ Add New Address'}
                                    </button>
                                )}
                            </div>

                            <div className="p-8">
                                {/* ── Mode: Select saved address ─────────────── */}
                                {mode === 'saved' && savedAddresses.length > 0 && (
                                    <div className="space-y-4">
                                        {savedAddresses.map((addr, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => setSelectedIdx(idx)}
                                                className={`relative cursor-pointer border p-6 transition-all ${selectedIdx === idx
                                                    ? 'border-[var(--athenic-gold)] bg-[#fdfcfa]'
                                                    : 'border-gray-200 hover:border-[var(--athenic-gold)]/50'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start space-x-4">
                                                        {/* Custom Radio Button */}
                                                        <div className={`mt-1 w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors ${selectedIdx === idx ? 'border-[var(--athenic-gold)]' : 'border-gray-300'}`}>
                                                            {selectedIdx === idx && <div className="w-2 h-2 rounded-full bg-[var(--athenic-gold)]" />}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-[var(--athenic-blue)] text-base mb-1 tracking-wide">{addr.street}</p>
                                                            <p className="text-gray-500 text-xs font-serif leading-relaxed uppercase tracking-wider">
                                                                {addr.city}, {addr.state} — {addr.pincode}
                                                            </p>
                                                            {addr.landmark && (
                                                                <p className="text-gray-400 text-[10px] mt-1 uppercase tracking-widest">Near {addr.landmark}</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex flex-col items-end space-y-3 flex-shrink-0 ml-4">
                                                        {addr.isDefault ? (
                                                            <span className="text-[9px] border border-[var(--athenic-gold)]/30 text-[var(--athenic-gold)] px-2 py-1 uppercase tracking-[0.2em]">Default</span>
                                                        ) : (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleSetDefault(idx); }}
                                                                className="text-[9px] text-gray-400 hover:text-[var(--athenic-gold)] transition-colors uppercase tracking-[0.1em]"
                                                            >
                                                                Set Default
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteAddress(idx); }}
                                                            className="text-gray-300 hover:text-red-400 transition-colors p-1"
                                                            title="Remove"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* ── Mode: New address form ─────────────────── */}
                                {mode === 'new' && (
                                    <form className="space-y-6">
                                        <div>
                                            <label className="block text-[10px] font-serif uppercase tracking-[0.2em] text-gray-500 mb-2">
                                                Street Address <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={newForm.street}
                                                onChange={e => setNewForm({ ...newForm, street: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 focus:border-[var(--athenic-gold)] outline-none text-sm font-serif bg-[#faf9f7] transition-colors"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-[10px] font-serif uppercase tracking-[0.2em] text-gray-500 mb-2">City <span className="text-red-500">*</span></label>
                                                <input type="text" value={newForm.city} onChange={e => setNewForm({ ...newForm, city: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-200 focus:border-[var(--athenic-gold)] outline-none text-sm font-serif bg-[#faf9f7] transition-colors" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-serif uppercase tracking-[0.2em] text-gray-500 mb-2">State <span className="text-red-500">*</span></label>
                                                <input type="text" value={newForm.state} onChange={e => setNewForm({ ...newForm, state: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-200 focus:border-[var(--athenic-gold)] outline-none text-sm font-serif bg-[#faf9f7] transition-colors" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-[10px] font-serif uppercase tracking-[0.2em] text-gray-500 mb-2">Pincode <span className="text-red-500">*</span></label>
                                                <input type="text" maxLength="6" pattern="[0-9]{6}" value={newForm.pincode}
                                                    onChange={e => setNewForm({ ...newForm, pincode: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-200 focus:border-[var(--athenic-gold)] outline-none text-sm font-serif bg-[#faf9f7] transition-colors" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-serif uppercase tracking-[0.2em] text-gray-500 mb-2">Landmark <span className="text-gray-400 lowercase tracking-normal">(optional)</span></label>
                                                <input type="text" value={newForm.landmark} onChange={e => setNewForm({ ...newForm, landmark: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-200 focus:border-[var(--athenic-gold)] outline-none text-sm font-serif bg-[#faf9f7] transition-colors" />
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3 pt-2">
                                            <input type="checkbox" id="setDefault" checked={newForm.isDefault}
                                                onChange={e => setNewForm({ ...newForm, isDefault: e.target.checked })}
                                                className="w-4 h-4 border-gray-300 accent-[var(--athenic-gold)]" />
                                            <label htmlFor="setDefault" className="text-[10px] font-serif uppercase tracking-[0.1em] text-gray-500 cursor-pointer">Save as default address</label>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleSaveNewAddress}
                                            disabled={savingAddress}
                                            className="w-full py-4 bg-[var(--athenic-blue)] text-white text-[10px] uppercase tracking-[0.2em] font-semibold hover:bg-[var(--athenic-blue)]/90 transition-all disabled:opacity-60"
                                        >
                                            {savingAddress ? 'Saving Details...' : 'Save & Continue'}
                                        </button>
                                    </form>
                                )}

                                {/* No addresses + no form shown */}
                                {mode === 'saved' && savedAddresses.length === 0 && (
                                    <div className="text-center py-10">
                                        <p className="text-[11px] font-serif uppercase tracking-[0.2em] text-gray-400 mb-4">No addresses on file</p>
                                        <button onClick={() => setMode('new')} className="btn-athenic-outline px-8 py-3 text-[10px] tracking-[0.2em] uppercase">Add New Address</button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Order Items ───────────────────────────────────── */}
                        <div className="bg-white border border-gray-100 overflow-hidden">
                            <div className="px-8 py-5 border-b border-gray-100 bg-[#fdfcfa]">
                                <h2 className="text-sm font-serif font-semibold text-[var(--athenic-blue)] tracking-wide flex items-center uppercase">
                                    <span className="w-8 h-8 border border-[var(--athenic-gold)]/30 text-[var(--athenic-gold)] flex items-center justify-center text-xs mr-4">II</span>
                                    Order Review
                                </h2>
                            </div>
                            <div className="p-8 space-y-6">
                                {cart?.items?.map((item) => {
                                    const product = item.productId;
                                    if (!product) return null;
                                    const price = product.discountedPrice || product.price;
                                    return (
                                        <div key={product._id} className="flex items-center justify-between border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                                            <div className="flex items-center space-x-6">
                                                <div className="w-16 h-20 bg-gray-50 overflow-hidden border border-gray-100 flex-shrink-0">
                                                    <img src={product.images?.[0] || '/placeholder-product.png'} alt={product.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-serif text-[var(--athenic-blue)] text-sm mb-1 tracking-wide">{product.name}</p>
                                                    <p className="text-[9px] text-gray-400 uppercase tracking-[0.15em]">Quantity: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-serif text-[var(--athenic-blue)] font-semibold">₹{(price * item.quantity).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* ── Order Summary ────────────────────────────────────── */}
                    <div className="lg:col-span-1">
                        <div className="bg-white border border-gray-100 p-8 sticky top-24">
                            <h2 className="text-[10px] font-serif uppercase tracking-[0.3em] text-[var(--athenic-gold)] font-semibold mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-sm">
                                    <span className="font-serif text-gray-500">Subtotal</span>
                                    <span className="font-serif font-semibold text-[var(--athenic-blue)]">₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="font-serif text-gray-500">Shipping</span>
                                    <span className="font-serif text-[var(--athenic-gold)] font-semibold">Complimentary</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="font-serif text-gray-500">Taxes</span>
                                    <span className="font-serif text-[var(--athenic-gold)] font-semibold">Included</span>
                                </div>

                                <div className="border-t border-gray-100 pt-5 mt-5">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <span className="text-sm font-serif font-semibold text-[var(--athenic-blue)] block">Total</span>
                                        </div>
                                        <span className="text-2xl font-serif font-bold text-[var(--athenic-blue)]">₹{total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={submitting || !activeAddr}
                                className="w-full bg-[var(--athenic-gold)] text-white py-4 text-[10px] uppercase tracking-[0.25em] font-serif font-semibold hover:bg-yellow-600 transition-all focus:outline-none flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed group mb-4"
                            >
                                {submitting ? (
                                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Processing Securely...</span></>
                                ) : (
                                    <>
                                        <span>{activeAddr ? 'Complete Purchase' : 'Select Address'}</span>
                                        {activeAddr && (
                                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        )}
                                    </>
                                )}
                            </button>

                            {/* Trust elements */}
                            <div className="bg-[#fdfcfa] border border-gray-100 p-5 mt-6">
                                <h3 className="text-[9px] uppercase tracking-[0.2em] font-semibold text-[var(--athenic-blue)] mb-2 flex items-center">
                                    <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                    Secure Transaction
                                </h3>
                                <p className="text-[10px] text-gray-500 font-serif leading-loose">
                                    Your personal information is encrypted and securely processed via Razorpay. We never store payment details.
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
