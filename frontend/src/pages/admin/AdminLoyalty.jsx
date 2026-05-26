import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminService } from '../../services/adminApi';

const AdminLoyalty = () => {
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTierFilter, setSelectedTierFilter] = useState('all');
    
    // Multi-select state
    const [selectedCustomerIds, setSelectedCustomerIds] = useState([]);
    
    // Voucher generator state
    const [voucherForm, setVoucherForm] = useState({
        discountType: 'percentage',
        discountValue: 15,
        expiryDays: 30,
        minPurchase: 1000,
        description: ''
    });
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState(null);

    // Points Multiplier settings (wedding / festive season multiplier)
    const [multiplier, setMultiplier] = useState(() => {
        return Number(localStorage.getItem('loyalty_multiplier')) || 1;
    });
    const [multiplierSaved, setMultiplierSaved] = useState(false);

    // Search and filter params
    const [minSpendFilter, setMinSpendFilter] = useState(0);

    useEffect(() => {
        fetchLoyaltyData();
    }, [minSpendFilter]);

    useEffect(() => {
        filterCustomers();
    }, [customers, searchTerm, selectedTierFilter]);

    const fetchLoyaltyData = async () => {
        setLoading(true);
        setResult(null);
        try {
            const data = await adminService.getTopCustomers(minSpendFilter, 100);
            const customerList = Array.isArray(data) ? data : (data?.customers || []);
            setCustomers(customerList);
            setSelectedCustomerIds([]);
        } catch (error) {
            console.error('Error fetching VIP loyalty data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Helper to determine customer VIP tier
    const getVIPDetails = (spend) => {
        if (spend >= 50000) {
            return {
                tier: 'Royal Platinum',
                badgeClass: 'bg-gradient-to-r from-slate-700 to-slate-900 border-slate-600 text-slate-100',
                colorCode: '#E5E4E2',
                icon: '👑'
            };
        } else if (spend >= 25000) {
            return {
                tier: 'Gold',
                badgeClass: 'bg-gradient-to-r from-amber-500 to-yellow-600 border-amber-400 text-white',
                colorCode: '#FFD700',
                icon: '🥇'
            };
        } else if (spend >= 10000) {
            return {
                tier: 'Silver',
                badgeClass: 'bg-gradient-to-r from-gray-300 to-gray-400 border-gray-300 text-gray-800',
                colorCode: '#C0C0C0',
                icon: '🥈'
            };
        } else {
            return {
                tier: 'Bronze',
                badgeClass: 'bg-gradient-to-r from-amber-700 to-amber-900 border-amber-700 text-amber-100',
                colorCode: '#CD7F32',
                icon: '🥉'
            };
        }
    };

    const filterCustomers = () => {
        let temp = [...customers];

        // Search name/email
        if (searchTerm.trim() !== '') {
            const term = searchTerm.toLowerCase();
            temp = temp.filter(c => 
                c.name?.toLowerCase().includes(term) ||
                c.email?.toLowerCase().includes(term)
            );
        }

        // Tier filter
        if (selectedTierFilter !== 'all') {
            temp = temp.filter(c => {
                const details = getVIPDetails(c.totalSpend);
                return details.tier.toLowerCase().replace(' ', '_') === selectedTierFilter;
            });
        }

        setFilteredCustomers(temp);
    };

    const handleSelectCustomer = (id) => {
        setSelectedCustomerIds(prev => 
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedCustomerIds.length === filteredCustomers.length) {
            setSelectedCustomerIds([]);
        } else {
            setSelectedCustomerIds(filteredCustomers.map(c => c._id));
        }
    };

    const handleSaveMultiplier = () => {
        localStorage.setItem('loyalty_multiplier', multiplier);
        setMultiplierSaved(true);
        setTimeout(() => setMultiplierSaved(false), 2000);
    };

    const handleSendVouchers = async (e) => {
        e.preventDefault();
        if (selectedCustomerIds.length === 0) {
            alert('Please select at least one VIP customer to reward.');
            return;
        }
        if (!voucherForm.discountValue || voucherForm.discountValue <= 0) {
            alert('Please enter a valid discount amount.');
            return;
        }

        setSending(true);
        setResult(null);

        try {
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + Number(voucherForm.expiryDays));

            const payload = {
                userIds: selectedCustomerIds,
                couponData: {
                    discountType: voucherForm.discountType,
                    discountValue: Number(voucherForm.discountValue),
                    expiryDate: expiryDate.toISOString(),
                    minPurchase: Number(voucherForm.minPurchase),
                    description: voucherForm.description || `Special Loyalty Gift Card`
                },
                sendEmail: true
            };

            const data = await adminService.sendLoyaltyCoupons(payload);
            setResult(data);
            alert(`✅ Success! Created and dispatched loyalty gift cards to ${selectedCustomerIds.length} VIP members.`);
            setSelectedCustomerIds([]);
        } catch (error) {
            console.error('Error sending loyalty vouchers:', error);
            alert('Failed to send loyalty vouchers.');
        } finally {
            setSending(false);
        }
    };

    // Counters for Tiers
    const platinumCount = customers.filter(c => getVIPDetails(c.totalSpend).tier === 'Royal Platinum').length;
    const goldCount = customers.filter(c => getVIPDetails(c.totalSpend).tier === 'Gold').length;
    const silverCount = customers.filter(c => getVIPDetails(c.totalSpend).tier === 'Silver').length;
    const bronzeCount = customers.filter(c => getVIPDetails(c.totalSpend).tier === 'Bronze').length;

    return (
        <AdminLayout>
            {/* Header */}
            <div className="mb-8 meander-pattern pb-1">
                <h1 className="text-3xl font-bold uppercase tracking-widest text-white">VIP Loyalty Console</h1>
                <p className="text-[var(--gold)] mt-2 text-[10px] uppercase tracking-[0.2em] font-bold">Classify customer luxury tiers, configure event point multipliers, and generate exclusive e-gift cards</p>
            </div>

            {/* Loyalty points multiplier & Tier metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                
                {/* Points multiplier panel */}
                <div className="bg-white border border-[var(--gold)]/20 p-5 text-black flex flex-col justify-between">
                    <div>
                        <h3 className="text-xs font-bold text-[var(--mehron)] uppercase tracking-wider border-b border-gray-100 pb-2 mb-3">
                            Wedding & Festive Multiplier
                        </h3>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide leading-relaxed">
                            Boost loyalty point accrual rates for shopping cart checkouts. Perfect for wedding seasons and silk festivals.
                        </p>
                        
                        <div className="flex items-center space-x-4 mt-6">
                            {[1, 1.5, 2, 3].map(val => (
                                <button
                                    key={val}
                                    onClick={() => setMultiplier(val)}
                                    className={`w-10 h-10 rounded-none border font-bold text-xs transition-all ${
                                        multiplier === val
                                            ? 'bg-[var(--mehron)] text-white border-[var(--gold)]'
                                            : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                                    }`}
                                >
                                    {val}x
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                        <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                            {multiplier > 1 ? `🎉 ${multiplier}x Multiplier Active` : 'Standard Rate (1x)'}
                        </span>
                        <button
                            onClick={handleSaveMultiplier}
                            className="bg-[var(--mehron)] hover:bg-[var(--mehron-deep)] text-white text-[10px] font-bold uppercase tracking-wider px-4 py-2 border border-[var(--gold)]/20 transition-all"
                        >
                            {multiplierSaved ? 'Saved!' : 'Save Rule'}
                        </button>
                    </div>
                </div>

                {/* VIP Tiers Counters */}
                <div className="lg:col-span-2 bg-white border border-[var(--gold)]/20 p-5 text-black">
                    <h3 className="text-xs font-bold text-[var(--mehron)] uppercase tracking-wider border-b border-gray-100 pb-2 mb-4">
                        VIP Tier Distribution
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="p-3 bg-slate-900 text-slate-100 border border-slate-700">
                            <span className="text-xl">👑</span>
                            <p className="text-[9px] font-bold uppercase tracking-widest mt-1">Royal Platinum</p>
                            <p className="text-2xl font-serif font-bold mt-1 text-slate-100">{platinumCount}</p>
                            <span className="text-[8px] text-slate-400 block mt-1">≥ ₹50,000</span>
                        </div>
                        <div className="p-3 bg-amber-50 text-amber-900 border border-amber-200">
                            <span className="text-xl">🥇</span>
                            <p className="text-[9px] font-bold uppercase tracking-widest mt-1">Gold VIP</p>
                            <p className="text-2xl font-serif font-bold mt-1 text-amber-700">{goldCount}</p>
                            <span className="text-[8px] text-amber-500 block mt-1">₹25K – ₹49K</span>
                        </div>
                        <div className="p-3 bg-gray-50 text-gray-900 border border-gray-200">
                            <span className="text-xl">🥈</span>
                            <p className="text-[9px] font-bold uppercase tracking-widest mt-1">Silver VIP</p>
                            <p className="text-2xl font-serif font-bold mt-1 text-gray-700">{silverCount}</p>
                            <span className="text-[8px] text-gray-400 block mt-1">₹10K – ₹24K</span>
                        </div>
                        <div className="p-3 bg-orange-50 text-orange-900 border border-orange-200">
                            <span className="text-xl">🥉</span>
                            <p className="text-[9px] font-bold uppercase tracking-widest mt-1">Bronze VIP</p>
                            <p className="text-2xl font-serif font-bold mt-1 text-orange-700">{bronzeCount}</p>
                            <span className="text-[8px] text-orange-400 block mt-1">&lt; ₹10K</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* Main console content split */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* Customers tier ledger (2 cols) */}
                <div className="xl:col-span-2 space-y-4">
                    
                    {/* Search / Filter Panel */}
                    <div className="bg-[var(--mehron-deep)] p-4 border border-[var(--gold)]/20 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="relative w-full md:w-72">
                            <input
                                type="text"
                                placeholder="Search customer name or email..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full bg-[var(--charcoal)] text-white pl-10 pr-4 py-2 border border-[var(--gold)]/20 focus:border-[var(--gold)] focus:outline-none text-xs"
                            />
                            <svg className="w-4 h-4 absolute left-3 top-2.5 text-[var(--gold)]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        <div className="flex gap-2 w-full md:w-auto">
                            {['all', 'royal_platinum', 'gold', 'silver', 'bronze'].map(tierVal => (
                                <button
                                    key={tierVal}
                                    onClick={() => setSelectedTierFilter(tierVal)}
                                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border transition-all ${
                                        selectedTierFilter === tierVal
                                            ? 'bg-[var(--gold)] text-[var(--mehron)] border-[var(--gold)]'
                                            : 'bg-[var(--charcoal)] text-[var(--gold)]/80 border-[var(--gold)]/10 hover:border-[var(--gold)]/30'
                                    }`}
                                >
                                    {tierVal.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Table of customers */}
                    <div className="bg-white text-black border border-[var(--gold)]/15 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                            <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--mehron)]">VIP Customer Ledger</h4>
                            <button
                                onClick={handleSelectAll}
                                className="text-[10px] font-bold uppercase tracking-wider text-[var(--gold)] hover:text-[var(--mehron)] transition-colors"
                            >
                                {selectedCustomerIds.length === filteredCustomers.length && filteredCustomers.length > 0
                                    ? 'Deselect All'
                                    : 'Select All Listed'}
                            </button>
                        </div>
                        
                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="text-center py-16">
                                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--gold)] border-t-transparent mx-auto"></div>
                                    <p className="mt-4 text-[var(--gold)] text-[10px] uppercase tracking-widest">Compiling Customer Tiering...</p>
                                </div>
                            ) : filteredCustomers.length === 0 ? (
                                <div className="text-center py-16 text-gray-400">
                                    <span className="text-3xl">📭</span>
                                    <p className="mt-2 text-xs font-bold uppercase tracking-widest">No VIP members found matching search</p>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-gray-100 border-b border-gray-200">
                                            <th className="p-4 w-12 text-center">Select</th>
                                            <th className="p-4">Customer Info</th>
                                            <th className="p-4 text-center">VIP Badge</th>
                                            <th className="p-4 text-right">Total Spend</th>
                                            <th className="p-4 text-center">Orders</th>
                                            <th className="p-4 text-center">Last Purchase</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredCustomers.map(cust => {
                                            const vip = getVIPDetails(cust.totalSpend);
                                            const isSelected = selectedCustomerIds.includes(cust._id);
                                            return (
                                                <tr
                                                    key={cust._id}
                                                    onClick={() => handleSelectCustomer(cust._id)}
                                                    className={`cursor-pointer transition-colors ${isSelected ? 'bg-amber-50/50' : 'hover:bg-gray-50'}`}
                                                >
                                                    <td className="p-4 text-center" onClick={e => e.stopPropagation()}>
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => handleSelectCustomer(cust._id)}
                                                            className="w-3.5 h-3.5 border-gray-300 rounded text-[var(--mehron)] focus:ring-[var(--mehron)]"
                                                        />
                                                    </td>
                                                    <td className="p-4">
                                                        <p className="font-bold text-gray-800 uppercase tracking-wide">{cust.name}</p>
                                                        <p className="text-[10px] text-gray-400">{cust.email}</p>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className={`inline-flex items-center space-x-1.5 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider border rounded-full ${vip.badgeClass}`}>
                                                            <span>{vip.icon}</span>
                                                            <span>{vip.tier}</span>
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right font-bold text-emerald-600">
                                                        ₹{cust.totalSpend?.toLocaleString()}
                                                    </td>
                                                    <td className="p-4 text-center font-bold text-gray-700">
                                                        {cust.orderCount}
                                                    </td>
                                                    <td className="p-4 text-center text-gray-400 text-[10px]">
                                                        {cust.lastOrderDate ? new Date(cust.lastOrderDate).toLocaleDateString('en-IN') : '-'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>

                {/* E-Gift Card / Voucher Creator (1 col) */}
                <div className="space-y-6">
                    <div className="bg-white text-black p-6 border border-[var(--gold)]/20 shadow-xl space-y-6">
                        
                        <div>
                            <h3 className="text-sm font-bold text-[var(--mehron)] uppercase tracking-wider border-b border-gray-100 pb-2">
                                VIP E-Gift Generator
                            </h3>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-2">
                                Selected Customers: <span className="text-[var(--mehron)] font-bold text-xs">{selectedCustomerIds.length}</span>
                            </p>
                        </div>

                        <form onSubmit={handleSendVouchers} className="space-y-4">
                            <div>
                                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Discount Type</label>
                                <select
                                    value={voucherForm.discountType}
                                    onChange={e => setVoucherForm({ ...voucherForm, discountType: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 text-xs focus:border-[var(--gold)] focus:outline-none bg-white text-gray-700"
                                >
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed">Fixed Amount (₹)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">
                                    Discount Value ({voucherForm.discountType === 'percentage' ? '%' : '₹'})
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={voucherForm.discountValue}
                                    onChange={e => setVoucherForm({ ...voucherForm, discountValue: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 text-xs focus:border-[var(--gold)] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Minimum Purchase Value (₹)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={voucherForm.minPurchase}
                                    onChange={e => setVoucherForm({ ...voucherForm, minPurchase: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 text-xs focus:border-[var(--gold)] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Validity (Days)</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={voucherForm.expiryDays}
                                    onChange={e => setVoucherForm({ ...voucherForm, expiryDays: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 text-xs focus:border-[var(--gold)] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Internal Description / Memo</label>
                                <input
                                    type="text"
                                    value={voucherForm.description}
                                    onChange={e => setVoucherForm({ ...voucherForm, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 text-xs focus:border-[var(--gold)] focus:outline-none"
                                    placeholder="e.g. Wedding Season Special Gift Card"
                                />
                            </div>

                            {/* Preview box */}
                            {selectedCustomerIds.length > 0 && (
                                <div className="bg-amber-50/70 p-3 border border-amber-200 text-[10px] text-amber-800 leading-normal uppercase font-bold tracking-wide">
                                    🎁 Reward: {selectedCustomerIds.length} VIP(s) will receive a{' '}
                                    <span className="underline">
                                        {voucherForm.discountType === 'percentage' ? `${voucherForm.discountValue}%` : `₹${voucherForm.discountValue}`} Off
                                    </span>{' '}
                                    voucher, valid for {voucherForm.expiryDays} days. Emails are dispatched instantly.
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={sending || selectedCustomerIds.length === 0}
                                className="w-full py-3 bg-[var(--mehron)] hover:bg-[var(--mehron-deep)] text-white text-xs font-bold uppercase tracking-widest border border-[var(--gold)] transition-all disabled:opacity-50"
                            >
                                {sending ? 'Generating...' : `🎁 Send Loyalty Coupons (${selectedCustomerIds.length})`}
                            </button>
                        </form>

                    </div>

                    {/* Result Report */}
                    {result && (
                        <div className="bg-white text-black p-5 border border-emerald-300 shadow-xl space-y-3">
                            <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wide border-b border-emerald-100 pb-2">
                                Dispatch Success Report
                            </h4>
                            <div className="max-h-48 overflow-y-auto space-y-2 text-[10px]">
                                {result.coupons?.map((coup, idx) => {
                                    const emailSent = result.emailResults?.find(e => e.email === coup.email)?.sent;
                                    return (
                                        <div key={idx} className="flex justify-between items-center border-b border-gray-50 pb-1.5">
                                            <div>
                                                <p className="font-bold text-gray-800 uppercase">{coup.userName}</p>
                                                <code className="text-amber-600 bg-amber-50 border border-amber-100 px-1 font-bold">{coup.couponCode}</code>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${emailSent ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                                {emailSent ? 'Email OK' : 'Email Fail'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </AdminLayout>
    );
};

export default AdminLoyalty;
