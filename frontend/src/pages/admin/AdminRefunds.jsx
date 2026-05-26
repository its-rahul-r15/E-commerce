import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminRefunds = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchRefunds();
    }, []);

    const fetchRefunds = async () => {
        setLoading(true);
        try {
            const data = await adminService.getRefundList();
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching refunds list:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInitiateRefund = async (orderId, totalAmount, customerName) => {
        if (!confirm(`Are you sure you want to approve the refund of ₹${totalAmount.toLocaleString()} to ${customerName}? This will cancel the order, restore inventory stock, and deduct the payout share from the merchant's ledger.`)) {
            return;
        }

        setProcessing(true);
        try {
            await adminService.processRefund(orderId);
            alert(`Refund of ₹${totalAmount.toLocaleString()} successfully processed and issued! Stock has been restored.`);
            setSelectedOrder(null);
            fetchRefunds();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to process refund');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AdminLayout>
            {/* Page Header */}
            <div className="flex justify-between items-center mb-8 meander-pattern pb-1">
                <div>
                    <h1 className="text-3xl font-bold uppercase tracking-widest text-white">Refund & Return Center</h1>
                    <p className="text-[var(--gold)] mt-2 text-[10px] uppercase tracking-[0.2em] font-bold">Process returns, restock items automatically, and manage customer credit refunds</p>
                </div>
            </div>

            {/* Refunds Grid Layout */}
            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="animate-spin rounded-none h-12 w-12 border-2 border-[var(--gold)] border-t-transparent"></div>
                </div>
            ) : orders.length === 0 ? (
                <div className="bg-white rounded-none p-12 text-center border border-[var(--border-mehron)] shadow-sm">
                    <p className="text-[var(--mehron)] text-sm uppercase tracking-widest font-bold">No orders recorded for platform returns</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start text-black">
                    
                    {/* Orders List Table */}
                    <div className="lg:col-span-2 bg-white border border-[var(--border-mehron)] overflow-hidden shadow-sm">
                        <table className="min-w-full divide-y divide-[var(--border-mehron)]/10">
                            <thead className="bg-[var(--mehron)]/5">
                                <tr>
                                    <th className="px-6 py-4 text-left text-[9px] font-bold text-[var(--mehron)] uppercase tracking-[0.2em]">Order / Boutique</th>
                                    <th className="px-6 py-4 text-left text-[9px] font-bold text-[var(--mehron)] uppercase tracking-[0.2em]">Customer</th>
                                    <th className="px-6 py-4 text-left text-[9px] font-bold text-[var(--mehron)] uppercase tracking-[0.2em]">Amount</th>
                                    <th className="px-6 py-4 text-left text-[9px] font-bold text-[var(--mehron)] uppercase tracking-[0.2em]">Workflow Status</th>
                                    <th className="px-6 py-4 text-right text-[9px] font-bold text-[var(--mehron)] uppercase tracking-[0.2em]">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-mehron)]/10 bg-white">
                                {orders.map((order) => {
                                    const isCancelled = order.status === 'cancelled';
                                    const isRefunded = order.paymentStatus === 'failed';
                                    const isSelected = selectedOrder?._id === order._id;

                                    return (
                                        <tr 
                                            key={order._id} 
                                            onClick={() => setSelectedOrder(order)}
                                            className={`cursor-pointer transition-colors text-xs hover:bg-[var(--mehron)]/[0.01] ${
                                                isSelected ? 'bg-[var(--gold-pale)]/30' : ''
                                            }`}
                                        >
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-[var(--mehron)] uppercase tracking-wider">#{order._id.slice(-6).toUpperCase()}</p>
                                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider italic">{order.shopId?.shopName || 'Unknown Shop'}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-gray-800">{order.customerId?.name || 'Customer'}</p>
                                                <p className="text-[10px] text-gray-400 font-mono">{order.customerId?.email}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-[var(--mehron)]">₹{order.totalAmount.toLocaleString()}</p>
                                                <p className="text-[8px] text-gray-400 font-mono">{order.payment?.razorpayPaymentId || 'N/A'}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col space-y-1">
                                                    <span className={`px-2 py-0.5 text-[8px] text-center font-bold uppercase tracking-widest rounded-none border ${
                                                        isCancelled
                                                            ? 'bg-red-50 text-red-700 border-red-200'
                                                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    }`}>
                                                        {order.status}
                                                    </span>
                                                    <span className={`px-2 py-0.5 text-[8px] text-center font-bold uppercase tracking-widest rounded-none border ${
                                                        isRefunded
                                                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    }`}>
                                                        {isRefunded ? 'Refunded' : 'Paid'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleInitiateRefund(order._id, order.totalAmount, order.customerId?.name || 'Customer');
                                                    }}
                                                    disabled={isRefunded || isCancelled || processing}
                                                    className={`px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-none border transition-all ${
                                                        isRefunded || isCancelled
                                                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                            : 'bg-red-600 hover:bg-red-700 text-white border-red-500 shadow-sm'
                                                    }`}
                                                >
                                                    {isRefunded ? 'Refunded' : 'Refund'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Order detail sidebar */}
                    <div className="bg-white border border-[var(--border-mehron)] p-6 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-[var(--mehron)] meander-pattern"></div>
                        <h2 className="text-base font-bold text-[var(--mehron)] uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Return Ticket Overview</h2>
                        
                        {selectedOrder ? (
                            <div className="space-y-6">
                                {/* Order ID and Shop Info */}
                                <div>
                                    <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest">Order Reference:</span>
                                    <p className="font-mono font-bold text-sm text-[var(--mehron)]">#{selectedOrder._id}</p>
                                    <p className="text-xs text-gray-700 mt-1 italic">Shop: {selectedOrder.shopId?.shopName}</p>
                                </div>

                                {/* Items list */}
                                <div>
                                    <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Items to Refund:</span>
                                    <div className="border border-gray-100 divide-y divide-gray-100">
                                        {selectedOrder.items?.map((item, idx) => (
                                            <div key={idx} className="p-2.5 flex justify-between text-xs hover:bg-gray-50">
                                                <div>
                                                    <p className="font-bold text-gray-800">{item.name}</p>
                                                    <p className="text-[10px] text-gray-400">Qty: {item.quantity}</p>
                                                </div>
                                                <p className="font-semibold text-gray-600">₹{(item.price * item.quantity).toLocaleString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Customer metadata */}
                                <div>
                                    <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Customer Verification Details:</span>
                                    <div className="bg-[#FAF9F6] border border-gray-200 p-3 space-y-1 text-xs">
                                        <p><span className="font-semibold text-gray-500">Name:</span> {selectedOrder.customerId?.name || 'N/A'}</p>
                                        <p><span className="font-semibold text-gray-500">Email:</span> {selectedOrder.customerId?.email || 'N/A'}</p>
                                        <p><span className="font-semibold text-gray-500">Phone:</span> {selectedOrder.customerId?.phone || 'N/A'}</p>
                                        <p className="truncate"><span className="font-semibold text-gray-500">Address:</span> {selectedOrder.deliveryAddress ? `${selectedOrder.deliveryAddress.street}, ${selectedOrder.deliveryAddress.city}` : 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Payment snapshot */}
                                <div>
                                    <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Razorpay gateway metadata:</span>
                                    <div className="border border-gray-200 p-3 text-xs bg-gray-50 font-mono space-y-1 text-gray-600">
                                        <p><span className="font-sans font-bold text-[9px] uppercase tracking-wider text-gray-400">Gateway Order ID:</span> <br/>{selectedOrder.payment?.razorpayOrderId || 'N/A'}</p>
                                        <p className="pt-1"><span className="font-sans font-bold text-[9px] uppercase tracking-wider text-gray-400">Transaction ID:</span> <br/>{selectedOrder.payment?.razorpayPaymentId || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Refund trigger */}
                                {selectedOrder.paymentStatus !== 'failed' && selectedOrder.status !== 'cancelled' ? (
                                    <button
                                        onClick={() => handleInitiateRefund(selectedOrder._id, selectedOrder.totalAmount, selectedOrder.customerId?.name || 'Customer')}
                                        disabled={processing}
                                        className="w-full py-3 bg-red-600 text-white rounded-none border border-red-500 hover:bg-red-700 font-bold uppercase tracking-widest text-[10px] shadow-lg disabled:opacity-50 transition-all"
                                    >
                                        {processing ? 'Processing Payout Refund...' : 'Approve & Issue Refund'}
                                    </button>
                                ) : (
                                    <div className="p-3 bg-gray-100 border border-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-500 text-center">
                                        Refund completed for this ticket
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-gray-400 text-xs">
                                <p>Select an order from the list to review return metrics and issue refunds</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminRefunds;
