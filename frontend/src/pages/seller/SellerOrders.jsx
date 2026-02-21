import { useState, useEffect } from 'react';
import { orderService } from '../../services/api';
import SellerLayout from '../../components/layout/SellerLayout';
import {
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    TruckIcon,
    ArchiveBoxIcon,
} from '@heroicons/react/24/outline';

const SellerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, [filter]);

    const fetchOrders = async () => {
        try {
            const data = await orderService.getShopOrders(filter);
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-[var(--gold-pale)] text-[var(--gold)] border-[var(--gold)]/20',
            accepted: 'bg-[var(--ivory)] text-[var(--mehron)] border-[var(--border-mehron)]',
            preparing: 'bg-[var(--mehron-soft)] text-[var(--mehron)] border-[var(--border-mehron)]',
            ready: 'bg-[var(--gold-pale)] text-[var(--mehron)] border-[var(--gold)]/20',
            completed: 'bg-[var(--mehron)] text-white border-[var(--gold)]',
            cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
        };
        return colors[status] || 'bg-gray-50 text-gray-400 border-gray-100';
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: ClockIcon,
            accepted: CheckCircleIcon,
            preparing: ArchiveBoxIcon,
            ready: TruckIcon,
            completed: CheckCircleIcon,
            cancelled: XCircleIcon,
        };
        return icons[status] || ClockIcon;
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        setUpdating(true);
        try {
            await orderService.updateOrderStatus(orderId, newStatus);
            alert('Order status updated successfully');
            fetchOrders();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to update order status');
        } finally {
            setUpdating(false);
        }
    };

    const getNextStatus = (currentStatus) => {
        const workflow = {
            pending: 'accepted',
            accepted: 'preparing',
            preparing: 'ready',
            ready: 'completed',
        };
        return workflow[currentStatus];
    };

    const getStatusButtonText = (status) => {
        const texts = {
            pending: '✓ Accept Order',
            accepted: '📦 Start Preparing',
            preparing: '✅ Mark as Ready',
            ready: '🎉 Complete Order',
        };
        return texts[status];
    };

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        active: orders.filter(o => ['accepted', 'preparing', 'ready'].includes(o.status)).length,
        completed: orders.filter(o => o.status === 'completed').length,
    };

    if (loading) {
        return (
            <SellerLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--gold)] border-t-transparent mx-auto"></div>
                        <p className="mt-4 text-gray-600 font-serif uppercase tracking-widest text-xs">Retrieving boutique orders...</p>
                    </div>
                </div>
            </SellerLayout>
        );
    }

    return (
        <SellerLayout>
            {/* Header */}
            <div className="mb-8 meander-pattern pb-1">
                <h1 className="text-3xl font-serif font-bold text-[var(--mehron)] uppercase tracking-wider">
                    Boutique Orders
                </h1>
                <p className="text-gray-600 mt-1 font-serif text-[10px] uppercase tracking-widest font-bold">Manage and orchestrate your customer acquisitions</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-none p-6 shadow-sm border border-[var(--border-mehron)]">
                    <p className="text-[10px] font-serif uppercase tracking-widest text-gray-500 mb-1 font-bold">Total Orders</p>
                    <p className="text-3xl font-serif font-bold text-[var(--mehron)]">{stats.total}</p>
                </div>
                <div className="bg-white rounded-none p-6 shadow-sm border border-[var(--border-mehron)]">
                    <p className="text-[10px] font-serif uppercase tracking-widest text-gray-500 mb-1 font-bold">Pending</p>
                    <p className="text-3xl font-serif font-bold text-[var(--gold)]">{stats.pending}</p>
                </div>
                <div className="bg-white rounded-none p-6 shadow-sm border border-[var(--border-mehron)]">
                    <p className="text-[10px] font-serif uppercase tracking-widest text-gray-500 mb-1 font-bold">In Progress</p>
                    <p className="text-3xl font-serif font-bold text-[var(--mehron-deep)]">{stats.active}</p>
                </div>
                <div className="bg-white rounded-none p-6 shadow-sm border border-[var(--border-mehron)]">
                    <p className="text-[10px] font-serif uppercase tracking-widest text-gray-500 mb-1 font-bold">Completed</p>
                    <p className="text-3xl font-serif font-bold text-[var(--mehron)]">{stats.completed}</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white rounded-none shadow-sm border border-[var(--border-mehron)] mb-6 overflow-hidden">
                <div className="flex overflow-x-auto">
                    {[
                        { key: '', label: 'All Orders' },
                        { key: 'pending', label: 'Pending' },
                        { key: 'accepted', label: 'Accepted' },
                        { key: 'preparing', label: 'Preparing' },
                        { key: 'ready', label: 'Ready' },
                        { key: 'completed', label: 'Completed' },
                        { key: 'cancelled', label: 'Cancelled' },
                    ].map((status) => (
                        <button
                            key={status.key}
                            onClick={() => setFilter(status.key)}
                            className={`px-6 py-4 font-serif text-[10px] uppercase tracking-widest border-b-2 transition-all font-bold ${filter === status.key
                                ? 'border-[var(--mehron)] text-[var(--mehron)] bg-[var(--gold-pale)]/30'
                                : 'border-transparent text-gray-500 hover:text-[var(--mehron)] hover:bg-[var(--cream)]'
                                }`}
                        >
                            {status.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders List */}
            {orders.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
                    <p className="text-gray-600">
                        {filter === '' ? 'Orders will appear here when customers place them' : `No ${filter} orders found`}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => {
                        const StatusIcon = getStatusIcon(order.status);
                        return (
                            <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                {/* Order Header */}
                                <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className={`p-2 rounded-none border ${getStatusColor(order.status)}`}>
                                                <StatusIcon className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-3 mb-1">
                                                    <h3 className="text-sm font-serif font-bold text-gray-900 uppercase tracking-widest">
                                                        Order #{order._id.slice(-8).toUpperCase()}
                                                    </h3>
                                                    <span className={`px-2 py-0.5 rounded-none text-[9px] font-serif font-bold border uppercase tracking-widest ${getStatusColor(order.status)}`}>
                                                        {order.status.toUpperCase()}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] font-serif text-gray-500 uppercase tracking-widest font-bold">
                                                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-serif font-bold text-[var(--mehron)]">
                                                ₹{order.totalAmount.toFixed(2)}
                                            </p>
                                            <p className="text-[9px] font-serif uppercase tracking-widest text-gray-500 font-bold">{order.items.length} items</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Content */}
                                <div className="p-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Order Items */}
                                        <div>
                                            <h4 className="text-[10px] font-serif font-bold text-[var(--mehron)] mb-3 flex items-center uppercase tracking-widest">
                                                <ArchiveBoxIcon className="h-4 w-4 mr-2 text-[var(--gold)]" />
                                                Acquisitions
                                            </h4>
                                            <div className="space-y-2">
                                                {order.items.map((item, index) => (
                                                    <div key={index} className="flex items-center justify-between p-3 bg-[var(--cream)]/30 border border-[var(--border-mehron)] rounded-none">
                                                        <div className="flex-1">
                                                            <p className="text-xs font-serif font-bold text-gray-900 uppercase tracking-wider">{item.name}</p>
                                                            <p className="text-[9px] font-serif text-gray-500 uppercase tracking-widest">Qty: {item.quantity}</p>
                                                        </div>
                                                        <p className="text-sm font-serif font-bold text-[var(--mehron)]">
                                                            ₹{(item.price * item.quantity).toFixed(2)}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Customer & Delivery Info */}
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                                                <TruckIcon className="h-5 w-5 mr-2 text-gray-600" />
                                                Delivery Details
                                            </h4>
                                            <div className="space-y-4">
                                                <div className="p-4 bg-gray-50 rounded-lg">
                                                    <p className="text-xs text-gray-500 mb-1">Customer</p>
                                                    <p className="font-semibold text-gray-900">{order.customerId?.name || 'N/A'}</p>
                                                </div>
                                                <div className="p-4 bg-gray-50 rounded-lg">
                                                    <p className="text-xs text-gray-500 mb-2">Delivery Address</p>
                                                    <p className="text-sm text-gray-700 leading-relaxed">
                                                        {order.deliveryAddress.street}<br />
                                                        {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                                                        {order.deliveryAddress.landmark && (
                                                            <>
                                                                <br />
                                                                <span className="text-gray-500">Landmark: {order.deliveryAddress.landmark}</span>
                                                            </>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    {order.status !== 'completed' && order.status !== 'cancelled' && (
                                        <div className="mt-6 pt-6 border-t border-[var(--border-mehron)] flex items-center justify-between">
                                            <p className="text-[10px] font-serif uppercase tracking-widest text-gray-500 font-bold">
                                                Orchestrate the next step...
                                            </p>
                                            <button
                                                onClick={() => handleUpdateStatus(order._id, getNextStatus(order.status))}
                                                disabled={updating}
                                                className="px-6 py-3 bg-[var(--mehron)] text-white font-serif text-[10px] uppercase tracking-[0.2em] rounded-none hover:bg-[var(--mehron-deep)] border border-[var(--gold)] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                                            >
                                                {getStatusButtonText(order.status)}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </SellerLayout>
    );
};

export default SellerOrders;
