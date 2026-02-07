import { useState, useEffect } from 'react';
import { orderService } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const Orders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        fetchOrders();
    }, [filter]);

    const fetchOrders = async () => {
        try {
            const data = await orderService.getMyOrders(filter);
            setOrders(data || []); // data is already the orders array
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            accepted: 'bg-blue-100 text-blue-800',
            preparing: 'bg-purple-100 text-purple-800',
            ready: 'bg-green-100 text-green-800',
            completed: 'bg-green-600 text-white',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const handleCancelOrder = async (orderId) => {
        if (!confirm('Are you sure you want to cancel this order?')) return;

        try {
            await orderService.cancelOrder(orderId);
            alert('Order cancelled successfully');
            fetchOrders();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to cancel order');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

                {/* Filter Tabs */}
                <div className="bg-white rounded-lg shadow-sm mb-6">
                    <div className="flex overflow-x-auto">
                        {['', 'pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-6 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${filter === status
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {status === '' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orders List */}
                {orders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
                        <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
                        <button onClick={() => navigate('/')} className="btn-primary">
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white rounded-lg shadow-sm p-6">
                                {/* Order Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Order #{order._id.slice(-8)}
                                            </h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                {order.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Shop: {order.shopId?.shopName}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-gray-900">
                                            ₹{order.totalAmount.toFixed(2)}
                                        </p>
                                        <p className="text-sm text-gray-600">{order.items.length} items</p>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="border-t pt-4 mb-4">
                                    <div className="space-y-3">
                                        {order.items.map((item, index) => (
                                            <div key={index} className="flex items-center space-x-3">
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">{item.name}</p>
                                                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                                </div>
                                                <p className="font-semibold text-gray-900">
                                                    ₹{(item.price * item.quantity).toFixed(2)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Delivery Address */}
                                <div className="border-t pt-4 mb-4">
                                    <p className="text-sm font-medium text-gray-700 mb-1">Delivery Address:</p>
                                    <p className="text-sm text-gray-600">
                                        {order.deliveryAddress.street}, {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="border-t pt-4 flex space-x-4">
                                    {(order.status === 'pending' || order.status === 'accepted') && (
                                        <button
                                            onClick={() => handleCancelOrder(order._id)}
                                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                                        >
                                            Cancel Order
                                        </button>
                                    )}
                                    {order.status === 'completed' && (
                                        <button className="text-primary hover:text-primary-dark text-sm font-medium">
                                            Reorder
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
