import { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/admin/stats');
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
                <div className="spinner"></div>
                <p style={{ marginTop: '1rem' }}>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '2rem 0 4rem' }}>
            <h1 className="text-gradient">Admin Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Platform Overview and Management
            </p>

            <div className="grid grid-4" style={{ marginBottom: '3rem' }}>
                <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👥</div>
                    <h3>{stats?.users?.totalCustomers || 0}</h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Customers</p>
                </div>

                <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏪</div>
                    <h3>{stats?.users?.totalShopkeepers || 0}</h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Shopkeepers</p>
                </div>

                <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📦</div>
                    <h3>{stats?.products?.totalProducts || 0}</h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Products</p>
                </div>

                <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🛒</div>
                    <h3>{stats?.orders?.totalOrders || 0}</h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Orders</p>
                </div>
            </div>

            <div className="grid grid-2" style={{ marginBottom: '3rem' }}>
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h2>Revenue Overview</h2>
                    <div style={{ marginTop: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <span>Total Revenue:</span>
                            <span className="text-gradient" style={{ fontWeight: '700', fontSize: '1.25rem' }}>
                                ₹{stats?.revenue?.totalRevenue?.toFixed(2) || 0}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <span>Transaction Commission (3%):</span>
                            <span style={{ color: 'var(--accent-purple)', fontWeight: '600' }}>
                                ₹{stats?.revenue?.totalCommission?.toFixed(2) || 0}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <span>Subscription Revenue (₹299/mo):</span>
                            <span style={{ color: 'var(--accent-purple)', fontWeight: '600' }}>
                                ₹{stats?.revenue?.subscriptionRevenue || 0}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: '700', fontSize: '1.125rem' }}>Platform Earnings:</span>
                            <span className="text-gradient" style={{ fontWeight: '700', fontSize: '1.5rem' }}>
                                ₹{stats?.revenue?.totalPlatformEarnings?.toFixed(2) || 0}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h2>Order Statistics</h2>
                    <div style={{ marginTop: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <span>Total Orders:</span>
                            <span style={{ fontWeight: '600' }}>{stats?.orders?.totalOrders || 0}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <span>Pending:</span>
                            <span className="badge badge-warning">{stats?.orders?.pendingOrders || 0}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <span>Delivered:</span>
                            <span className="badge badge-success">{stats?.orders?.deliveredOrders || 0}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Cancelled:</span>
                            <span className="badge badge-danger">{stats?.orders?.cancelledOrders || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
                <h2>Recent Orders</h2>
                {stats?.recentOrders?.length > 0 ? (
                    <div style={{ overflowX: 'auto', marginTop: '1.5rem' }}>
                        <table style={{ width: '100%' }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid rgba(255,255,255,0.1)' }}>Order ID</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid rgba(255,255,255,0.1)' }}>Customer</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid rgba(255,255,255,0.1)' }}>Amount</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid rgba(255,255,255,0.1)' }}>Status</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid rgba(255,255,255,0.1)' }}>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentOrders.slice(0, 10).map(order => (
                                    <tr key={order._id}>
                                        <td style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            #{order._id.slice(-8)}
                                        </td>
                                        <td style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            {order.customer?.name}
                                        </td>
                                        <td style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            ₹{order.totalPrice}
                                        </td>
                                        <td style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <span className={`badge ${order.orderStatus === 'Delivered' ? 'badge-success' : 'badge-primary'}`}>
                                                {order.orderStatus}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                        No orders yet
                    </p>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
