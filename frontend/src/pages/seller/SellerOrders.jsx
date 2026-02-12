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
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            accepted: 'bg-blue-100 text-blue-800 border-blue-200',
            preparing: 'bg-purple-100 text-purple-800 border-purple-200',
            ready: 'bg-green-100 text-green-800 border-green-200',
            completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
            cancelled: 'bg-red-100 text-red-800 border-red-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
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
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading orders...</p>
                    </div>
                </div>
            </SellerLayout>
        );
    }

    return (
        <SellerLayout>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Shop Orders
                </h1>
                <p className="text-gray-600 mt-1">Manage and track your customer orders</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-600 font-medium mb-1">Total Orders</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-600 font-medium mb-1">Pending</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-600 font-medium mb-1">In Progress</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.active}</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-600 font-medium mb-1">Completed</p>
                    <p className="text-3xl font-bold text-emerald-600">{stats.completed}</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
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
                            className={`px-6 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${filter === status.key
                                    ? 'border-emerald-500 text-emerald-600 bg-emerald-50/50'
                                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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
                                            <div className={`p-2 rounded-lg border ${getStatusColor(order.status)}`}>
                                                <StatusIcon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-3 mb-1">
                                                    <h3 className="text-lg font-bold text-gray-900">
                                                        Order #{order._id.slice(-8).toUpperCase()}
                                                    </h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                                                        {order.status.toUpperCase()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-gray-900">
                                                ₹{order.totalAmount.toFixed(2)}
                                            </p>
                                            <p className="text-sm text-gray-600">{order.items.length} items</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Content */}
                                <div className="p-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Order Items */}
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                                                <ArchiveBoxIcon className="h-5 w-5 mr-2 text-gray-600" />
                                                Order Items
                                            </h4>
                                            <div className="space-y-3">
                                                {order.items.map((item, index) => (
                                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                        <div className="flex-1">
                                                            <p className="font-medium text-gray-900">{item.name}</p>
                                                            <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                                        </div>
                                                        <p className="font-bold text-gray-900">
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
                                        <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
                                            <p className="text-sm text-gray-600">
                                                Update order status to proceed
                                            </p>
                                            <button
                                                onClick={() => handleUpdateStatus(order._id, getNextStatus(order.status))}
                                                disabled={updating}
                                                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40"
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
