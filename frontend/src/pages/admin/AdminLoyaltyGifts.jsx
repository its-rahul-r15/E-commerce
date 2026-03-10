import { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import axios from '../../utils/axios';

const AdminLoyaltyGifts = () => {
    // Filter state
    const [minSpend, setMinSpend] = useState(5000);
    const [topN, setTopN] = useState(10);

    // Data state
    const [customers, setCustomers] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState(null);

    // Coupon form
    const [couponForm, setCouponForm] = useState({
        discountType: 'percentage',
        discountValue: 10,
        expiryDays: 30,
        minPurchase: 0,
    });

    const fetchTopCustomers = async () => {
        setLoading(true);
        setResult(null);
        try {
            const res = await axios.get(`/loyalty/top-customers?minSpend=${minSpend}&limit=${topN}`);
            setCustomers(res.data.data.customers || []);
            setSelectedIds([]);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to fetch customers');
        } finally {
            setLoading(false);
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        if (selectedIds.length === customers.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(customers.map(c => c._id));
        }
    };

    const handleSendCoupons = async () => {
        if (selectedIds.length === 0) {
            alert('Please select at least one customer');
            return;
        }
        if (!couponForm.discountValue || couponForm.discountValue <= 0) {
            alert('Please set a valid discount value');
            return;
        }

        setSending(true);
        setResult(null);
        try {
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + couponForm.expiryDays);

            const res = await axios.post('/loyalty/send-coupons', {
                userIds: selectedIds,
                couponData: {
                    discountType: couponForm.discountType,
                    discountValue: couponForm.discountValue,
                    expiryDate: expiryDate.toISOString(),
                    minPurchase: couponForm.minPurchase,
                },
                sendEmail: true,
            });

            setResult(res.data.data);
            alert(`✅ ${res.data.data.coupons.length} loyalty coupons created & sent!`);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to send coupons');
        } finally {
            setSending(false);
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        🎁 Loyalty Gift Center
                    </h1>
                    <p className="text-amber-100 mt-1 text-sm">
                        Reward your top customers with exclusive discount coupons
                    </p>
                </div>

                {/* Step 1: Filter */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                        <h2 className="font-bold text-gray-800 flex items-center gap-2">
                            <span className="w-6 h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                            Find Top Customers
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="flex flex-wrap items-end gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Spend (₹)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="1000"
                                    value={minSpend}
                                    onChange={e => setMinSpend(Number(e.target.value))}
                                    className="w-40 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-amber-500 text-gray-500 outline-none"
                                    placeholder="e.g. 50000"
                                />     
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Top N Customers</label>
                                <select
                                    value={topN}
                                    onChange={e => setTopN(Number(e.target.value))}
                                    className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-amber-500 text-gray-500 outline-none bg-white"
                                >
                                    {[5, 10, 15, 20, 25, 50].map(n => (
                                        <option key={n} value={n}>Top {n}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={fetchTopCustomers}
                                disabled={loading}
                                className="px-6 py-2.5 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-all disabled:opacity-50 shadow-sm"
                            >
                                {loading ? '🔍 Searching...' : '🔍 Find Customers'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Step 2: Customer Table */}
                {customers.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-bold text-gray-800 flex items-center gap-2">
                                <span className="w-6 h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                                Select Customers ({customers.length} found)
                            </h2>
                            <button
                                onClick={selectAll}
                                className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                            >
                                {selectedIds.length === customers.length ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Select</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Spend</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Orders</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Order</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {customers.map((c, i) => (
                                        <tr
                                            key={c._id}
                                            onClick={() => toggleSelect(c._id)}
                                            className={`cursor-pointer transition-all ${selectedIds.includes(c._id) ? 'bg-amber-50' : 'hover:bg-gray-50'}`}
                                        >
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(c._id)}
                                                    onChange={() => toggleSelect(c._id)}
                                                    className="w-4 h-4 text-amber-500 rounded"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-bold text-sm">
                                                        #{i + 1}
                                                    </div>
                                                    <span className="font-semibold text-gray-800">{c.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-sm">{c.email || '-'}</td>
                                            <td className="px-6 py-4 text-right font-bold text-emerald-600">₹{c.totalSpend?.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right text-gray-600">{c.orderCount}</td>
                                            <td className="px-6 py-4 text-right text-gray-400 text-sm">
                                                {c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString('en-IN') : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Step 3: Coupon Creation */}
                {selectedIds.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                            <h2 className="font-bold text-gray-800 flex items-center gap-2">
                                <span className="w-6 h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                                Create & Send Coupon ({selectedIds.length} selected)
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                                    <select
                                        value={couponForm.discountType}
                                        onChange={e => setCouponForm({ ...couponForm, discountType: e.target.value })}
                                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-amber-500 outline-none text-gray-500 bg-white"
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (₹)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Discount Value {couponForm.discountType === 'percentage' ? '(%)' : '(₹)'}
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={couponForm.discountType === 'percentage' ? 100 : 50000}
                                        value={couponForm.discountValue}
                                        onChange={e => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-amber-500 outline-none text-gray-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Valid For (Days)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="365"
                                        value={couponForm.expiryDays}
                                        onChange={e => setCouponForm({ ...couponForm, expiryDays: Number(e.target.value) })}
                                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-amber-500 outline-none text-gray-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Purchase (₹)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={couponForm.minPurchase}
                                        onChange={e => setCouponForm({ ...couponForm, minPurchase: Number(e.target.value) })}
                                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-amber-500 outline-none text-gray-500"
                                        placeholder="0 = no minimum"
                                    />
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 mb-6 border border-amber-200">
                                <p className="text-sm text-amber-800">
                                    <strong>Preview:</strong> {selectedIds.length} customers will receive a{' '}
                                    <strong>
                                        {couponForm.discountType === 'percentage'
                                            ? `${couponForm.discountValue}% OFF`
                                            : `₹${couponForm.discountValue} OFF`}
                                    </strong>{' '}
                                    coupon valid for <strong>{couponForm.expiryDays} days</strong>
                                    {couponForm.minPurchase > 0 && <> (min purchase ₹{couponForm.minPurchase})</>}.
                                    Each customer gets a unique coupon code sent to their email.
                                </p>
                            </div>

                            <button
                                onClick={handleSendCoupons}
                                disabled={sending}
                                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 shadow-lg shadow-amber-200 text-lg"
                            >
                                {sending ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Creating & Sending...
                                    </span>
                                ) : (
                                    `🎁 Send Loyalty Coupons to ${selectedIds.length} Customers`
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Result */}
                {result && (
                    <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 overflow-hidden">
                        <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-200">
                            <h2 className="font-bold text-emerald-800 flex items-center gap-2">
                                ✅ Coupons Created Successfully
                            </h2>
                        </div>
                        <div className="p-6 overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-emerald-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-semibold text-gray-600">Customer</th>
                                        <th className="px-4 py-2 text-left font-semibold text-gray-600">Email</th>
                                        <th className="px-4 py-2 text-left font-semibold text-gray-600">Coupon Code</th>
                                        <th className="px-4 py-2 text-center font-semibold text-gray-600">Email Sent</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {result.coupons.map((c, i) => (
                                        <tr key={i}>
                                            <td className="px-4 py-3 font-medium">{c.userName}</td>
                                            <td className="px-4 py-3 text-gray-500">{c.email}</td>
                                            <td className="px-4 py-3">
                                                <code className="px-2 py-1 bg-amber-50 text-amber-700 rounded font-bold text-xs">{c.couponCode}</code>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {result.emailResults?.find(e => e.email === c.email)?.sent
                                                    ? <span className="text-emerald-600">✅</span>
                                                    : <span className="text-red-400">❌</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {!loading && customers.length === 0 && (
                    <div className="text-center py-16 text-gray-400">
                        <p className="text-5xl mb-4">🏆</p>
                        <p className="font-medium">Find your top customers by setting filters above</p>
                        <p className="text-sm mt-1">Filter by minimum spend and select how many to show</p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminLoyaltyGifts;
