import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminLedger = () => {
    const [ledger, setLedger] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    
    // KYC Drawer/Modal State
    const [activeShop, setActiveShop] = useState(null);
    const [commissionRate, setCommissionRate] = useState(10);
    const [kycStatus, setKycStatus] = useState('pending');
    const [gstin, setGstin] = useState('');
    const [pan, setPan] = useState('');

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchLedger();
    }, []);

    const fetchLedger = async () => {
        setLoading(true);
        try {
            const data = await adminService.getLedger();
            setLedger(data || []);
        } catch (error) {
            console.error('Error fetching ledger:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenKYC = (shop) => {
        setActiveShop(shop);
        setCommissionRate(shop.commissionRate);
        setKycStatus(shop.kycStatus);
        setGstin(shop.gstin);
        setPan(shop.pan);
    };

    const handleSaveKYC = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            await adminService.updateKYC(activeShop._id, {
                gstin,
                pan,
                kycStatus,
                commissionRate
            });
            alert('KYC status and commission rates updated successfully!');
            setActiveShop(null);
            fetchLedger();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to update shop parameters');
        } finally {
            setProcessing(false);
        }
    };

    const handlePayout = async (shopId, shopName, amount) => {
        if (amount <= 0) {
            alert('No outstanding balance to transfer.');
            return;
        }
        if (!confirm(`Are you sure you want to release the outstanding balance of ₹${amount.toLocaleString()} to ${shopName}? This will trigger a bank transfer instruction.`)) {
            return;
        }

        setProcessing(true);
        try {
            await adminService.releasePayout(shopId);
            alert(`Payout of ₹${amount.toLocaleString()} successfully released!`);
            fetchLedger();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to release payout');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AdminLayout>
            {/* Page Header */}
            <div className="flex justify-between items-center mb-8 meander-pattern pb-1">
                <div>
                    <h1 className="text-3xl font-bold uppercase tracking-widest text-white">Settlements & KYC</h1>
                    <p className="text-[var(--gold)] mt-2 text-[10px] uppercase tracking-[0.2em] font-bold">Verify legal vendor details, customize platform commissions, and release merchant payouts</p>
                </div>
            </div>

            {/* Main Ledger Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="animate-spin rounded-none h-12 w-12 border-2 border-[var(--gold)] border-t-transparent"></div>
                </div>
            ) : ledger.length === 0 ? (
                <div className="bg-white rounded-none p-12 text-center border border-[var(--border-mehron)] shadow-sm">
                    <p className="text-[var(--mehron)] text-sm uppercase tracking-widest font-bold">No storefront ledgers recorded in this platform</p>
                </div>
            ) : (
                <div className="bg-white border border-[var(--border-mehron)] overflow-hidden shadow-sm text-black">
                    <table className="min-w-full divide-y divide-[var(--border-mehron)]/10">
                        <thead className="bg-[var(--mehron)]/5">
                            <tr>
                                <th className="px-6 py-4 text-left text-[9px] font-bold text-[var(--mehron)] uppercase tracking-[0.2em]">Boutique Details</th>
                                <th className="px-6 py-4 text-left text-[9px] font-bold text-[var(--mehron)] uppercase tracking-[0.2em]">Owner Contacts</th>
                                <th className="px-6 py-4 text-left text-[9px] font-bold text-[var(--mehron)] uppercase tracking-[0.2em]">KYC Status</th>
                                <th className="px-6 py-4 text-left text-[9px] font-bold text-[var(--mehron)] uppercase tracking-[0.2em]">Comm. Rate</th>
                                <th className="px-6 py-4 text-left text-[9px] font-bold text-[var(--mehron)] uppercase tracking-[0.2em]">Sales (INR)</th>
                                <th className="px-6 py-4 text-left text-[9px] font-bold text-[var(--mehron)] uppercase tracking-[0.2em]">Net Owed Balance</th>
                                <th className="px-6 py-4 text-left text-[9px] font-bold text-[var(--mehron)] uppercase tracking-[0.2em]">Paid Payouts</th>
                                <th className="px-6 py-4 text-right text-[9px] font-bold text-[var(--mehron)] uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-mehron)]/10 bg-white">
                            {ledger.map((shop) => (
                                <tr key={shop._id} className="hover:bg-[var(--mehron)]/[0.02] transition-colors text-xs">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-[var(--mehron)] uppercase tracking-wider">{shop.shopName}</p>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{shop.category}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-gray-800">{shop.seller?.name}</p>
                                        <p className="text-[10px] text-gray-400 font-mono">{shop.seller?.email}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-none border ${
                                            shop.kycStatus === 'approved'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                : shop.kycStatus === 'rejected'
                                                    ? 'bg-red-50 text-red-700 border-red-200'
                                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                        }`}>
                                            {shop.kycStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-700">
                                        {shop.commissionRate}%
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-gray-600">
                                        ₹{shop.totalSales.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`font-bold text-sm ${shop.balance > 0 ? 'text-[var(--mehron)]' : 'text-gray-400'}`}>
                                            ₹{shop.balance.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-emerald-600">
                                        ₹{shop.totalPaid.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                        <button
                                            onClick={() => handleOpenKYC(shop)}
                                            className="px-3 py-1.5 bg-white hover:bg-gray-50 text-[10px] font-bold uppercase tracking-wider border border-gray-200 rounded-none transition-all"
                                        >
                                            KYC & Commission
                                        </button>
                                        <button
                                            onClick={() => handlePayout(shop._id, shop.shopName, shop.balance)}
                                            disabled={shop.balance <= 0 || processing}
                                            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-none border transition-all ${
                                                shop.balance > 0
                                                    ? 'bg-[var(--mehron)] hover:bg-[var(--mehron-deep)] text-white border-[var(--gold)] shadow-sm'
                                                    : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                            }`}
                                        >
                                            Payout
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* KYC & Commission Settings Modal Drawer */}
            {activeShop && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg border-t-4 border-[var(--mehron)] relative shadow-2xl p-8 text-black">
                        <button
                            onClick={() => setActiveShop(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-black font-bold text-lg"
                        >
                            ✕
                        </button>
                        
                        <h3 className="text-base font-bold text-[var(--mehron)] uppercase tracking-widest mb-2 border-b border-gray-100 pb-2">
                            KYC Verification & Settlements
                        </h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-6">
                            Configure parameters for: {activeShop.shopName}
                        </p>

                        <form onSubmit={handleSaveKYC} className="space-y-6">
                            {/* GSTIN */}
                            <div>
                                <label className="block text-[10px] font-bold text-[var(--mehron)] uppercase tracking-widest mb-1.5">GSTIN Number</label>
                                <input
                                    type="text"
                                    value={gstin}
                                    onChange={(e) => setGstin(e.target.value)}
                                    placeholder="e.g. 07AAAAA1111A1Z1"
                                    className="w-full px-4 py-2 border border-gray-300 focus:border-[var(--gold)] focus:ring-0 outline-none text-xs"
                                />
                            </div>

                            {/* PAN */}
                            <div>
                                <label className="block text-[10px] font-bold text-[var(--mehron)] uppercase tracking-widest mb-1.5">PAN Card Number</label>
                                <input
                                    type="text"
                                    value={pan}
                                    onChange={(e) => setPan(e.target.value)}
                                    placeholder="e.g. ABCDE1234F"
                                    className="w-full px-4 py-2 border border-gray-300 focus:border-[var(--gold)] focus:ring-0 outline-none text-xs"
                                />
                            </div>

                            {/* Commission matrix */}
                            <div>
                                <label className="block text-[10px] font-bold text-[var(--mehron)] uppercase tracking-widest mb-1.5">Platform Commission Rate (%)</label>
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={commissionRate}
                                        onChange={(e) => setCommissionRate(e.target.value)}
                                        className="w-24 px-4 py-2 border border-gray-300 focus:border-[var(--gold)] focus:ring-0 outline-none text-xs"
                                        required
                                    />
                                    <span className="text-xs font-semibold text-gray-500">% platform commission fee per transaction</span>
                                </div>
                            </div>

                            {/* Document Preview mock */}
                            <div className="bg-[#FAF9F6] border border-gray-200 p-4">
                                <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Attached Verification Files:</span>
                                <div className="flex items-center space-x-2 text-xs">
                                    <span className="text-red-500 font-bold">📄</span>
                                    <span className="font-semibold text-gray-700 underline cursor-pointer">kyc_verification_details.pdf</span>
                                    <span className="text-gray-400 text-[10px]">(Mock Document)</span>
                                </div>
                            </div>

                            {/* KYC Verification status */}
                            <div>
                                <label className="block text-[10px] font-bold text-[var(--mehron)] uppercase tracking-widest mb-2">KYC Document Status</label>
                                <div className="flex space-x-3">
                                    {['pending', 'approved', 'rejected'].map(status => (
                                        <button
                                            key={status}
                                            type="button"
                                            onClick={() => setKycStatus(status)}
                                            className={`flex-1 py-2 border font-bold uppercase tracking-wider text-[10px] transition-all ${
                                                kycStatus === status
                                                    ? 'bg-[var(--mehron)] border-[var(--gold)] text-white shadow-md'
                                                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                                            }`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex space-x-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setActiveShop(null)}
                                    className="w-1/3 py-3 bg-white border border-gray-200 text-gray-700 text-[10px] uppercase font-bold tracking-widest"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 py-3 bg-[var(--mehron)] hover:bg-[var(--mehron-deep)] text-white border border-[var(--gold)] font-bold uppercase tracking-widest text-[10px] shadow-lg disabled:opacity-50"
                                >
                                    Save Configuration
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminLedger;
