import { useState, useEffect } from 'react';
import { useToast } from '../../components/Toast';
import api from '../../services/api';

const STATUS_FLOW = ['Pending', 'Processing', 'Shipped', 'Delivered'];

const STATUS_COLORS = {
    Pending: 'badge-warning',
    Processing: 'badge-primary',
    Shipped: 'badge-primary',
    Delivered: 'badge-success',
    Cancelled: 'badge-danger'
};

const ShopkeeperOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [filterStatus, setFilterStatus] = useState('');
    const toast = useToast();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/orders/shop-orders');
            setOrders(data);
        } catch (error) {
            console.error('Fetch orders error:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        setUpdatingId(orderId);
        try {
            await api.put(`/orders/${orderId}/status`, { orderStatus: newStatus });
            setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o));
            toast.success(`Order status updated to ${newStatus}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        } finally {
            setUpdatingId(null);
        }
    };

    const getNextStatus = (current) => {
        const idx = STATUS_FLOW.indexOf(current);
        return idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
    };

    const filteredOrders = filterStatus
        ? orders.filter(o => o.orderStatus === filterStatus)
        : orders;

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.orderStatus === 'Pending').length,
        processing: orders.filter(o => o.orderStatus === 'Processing').length,
        shipped: orders.filter(o => o.orderStatus === 'Shipped').length,
        delivered: orders.filter(o => o.orderStatus === 'Delivered').length,
    };

    if (loading) {
        return (
            <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
                <div className="spinner"></div>
                <p style={{ marginTop: '1rem' }}>Loading orders...</p>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '2rem 0 4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                <div>
                    <h1 className="text-gradient">📋 Shop Orders</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage and track all customer orders</p>
                </div>
                <button className="btn btn-outline" onClick={fetchOrders}>🔄 Refresh</button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
                {[
                    { label: 'Total', value: stats.total, color: '' },
                    { label: 'Pending', value: stats.pending, color: 'var(--warning)' },
                    { label: 'Processing', value: stats.processing, color: 'var(--accent-blue)' },
                    { label: 'Delivered', value: stats.delivered, color: 'var(--success)' }
                ].map(s => (
                    <div
                        key={s.label}
                        className="glass-card"
                        style={{ padding: '1.5rem', textAlign: 'center', cursor: 'pointer' }}
                        onClick={() => setFilterStatus(s.label === 'Total' ? '' : s.label)}
                    >
                        <h3 style={{ color: s.color || 'inherit', fontSize: '2rem' }}>{s.value}</h3>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Filter Bar */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {['', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                    <button
                        key={s || 'all'}
                        className={`btn ${filterStatus === s ? 'btn-primary' : 'btn-outline'}`}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                        onClick={() => setFilterStatus(s)}
                    >
                        {s || 'All Orders'}
                    </button>
                ))}
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                    <h3>No orders yet</h3>
                    <p>Orders from customers will appear here</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredOrders.map(order => {
                        const nextStatus = getNextStatus(order.orderStatus);
                        const shopTotal = order.shopSubtotal ||
                            order.orderItems.reduce((s, i) => s + i.price * i.quantity, 0);

                        return (
                            <div key={order._id} className="glass-card" style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: '600', fontSize: '1rem' }}>
                                            Order #{order._id.slice(-8).toUpperCase()}
                                        </p>
                                        <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            {new Date(order.createdAt).toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span className={`badge ${STATUS_COLORS[order.orderStatus] || 'badge-primary'}`}>
                                            {order.orderStatus}
                                        </span>
                                        {nextStatus && order.orderStatus !== 'Cancelled' && (
                                            <button
                                                className="btn btn-primary"
                                                style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}
                                                onClick={() => handleStatusUpdate(order._id, nextStatus)}
                                                disabled={updatingId === order._id}
                                            >
                                                {updatingId === order._id ? '...' : `Mark ${nextStatus}`}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Customer Info */}
                                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                    <div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.1rem' }}>CUSTOMER</p>
                                        <p style={{ margin: 0, fontWeight: '500' }}>{order.customer?.name || 'N/A'}</p>
                                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{order.customer?.email}</p>
                                    </div>
                                    <div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.1rem' }}>SHIPPING TO</p>
                                        <p style={{ margin: 0, fontWeight: '500' }}>
                                            {order.shippingAddress?.city}, {order.shippingAddress?.state}
                                        </p>
                                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            {order.shippingAddress?.pincode}
                                        </p>
                                    </div>
                                    <div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.1rem' }}>PAYMENT</p>
                                        <p style={{ margin: 0, fontWeight: '500' }}>{order.paymentMethod}</p>
                                        <span className={`badge ${order.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.75rem' }}>
                                            {order.paymentStatus}
                                        </span>
                                    </div>
                                    <div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.1rem' }}>YOUR EARNINGS</p>
                                        <p className="text-gradient" style={{ margin: 0, fontWeight: '800', fontSize: '1.1rem' }}>
                                            ₹{(shopTotal * 0.97).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                        </p>
                                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.75rem' }}>after 3% commission</p>
                                    </div>
                                </div>

                                {/* Items */}
                                <div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                                        YOUR ITEMS ({order.orderItems.length})
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        {order.orderItems.map((item, idx) => (
                                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <span>{item.name} <span style={{ color: 'var(--text-muted)' }}>× {item.quantity}</span></span>
                                                <span style={{ fontWeight: '600' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ShopkeeperOrders;
