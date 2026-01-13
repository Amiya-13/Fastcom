import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './ShopkeeperDashboard.css';

const ShopkeeperDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalEarnings: 0,
        recentOrders: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [productsRes, ordersRes] = await Promise.all([
                api.get('/products', { params: { shopkeeper: user._id } }),
                api.get('/orders/shop-orders')
            ]);

            const earnings = user.totalEarnings || 0;

            setStats({
                totalProducts: productsRes.data.length,
                totalOrders: ordersRes.data.length,
                totalEarnings: earnings,
                recentOrders: ordersRes.data.slice(0, 5)
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const subscriptionDaysLeft = () => {
        if (!user.subscriptionExpiry) return 0;
        const daysLeft = Math.ceil((new Date(user.subscriptionExpiry) - new Date()) / (1000 * 60 * 60 * 24));
        return Math.max(0, daysLeft);
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
        <div className="shopkeeper-dashboard">
            <div className="container">
                <div className="dashboard-header">
                    <div>
                        <h1 className="text-gradient">Welcome, {user.name}!</h1>
                        <p className="shop-name">🏪 {user.shopName}</p>
                    </div>

                    <div className="subscription-badge glass-card">
                        {user.isSubscribed && subscriptionDaysLeft() > 0 ? (
                            <>
                                <span className="badge badge-success">Active</span>
                                <p style={{ fontSize: '0.875rem', margin: '0.5rem 0 0 0', color: 'var(--text-secondary)' }}>
                                    {subscriptionDaysLeft()} days remaining
                                </p>
                            </>
                        ) : (
                            <>
                                <span className="badge badge-danger">Expired</span>
                                <p style={{ fontSize: '0.875rem', margin: '0.5rem 0 0 0', color: 'var(--error)' }}>
                                    Please renew subscription
                                </p>
                            </>
                        )}
                    </div>
                </div>

                <div className="stats-grid grid grid-3">
                    <div className="stat-card glass-card">
                        <div className="stat-icon">📦</div>
                        <h3>{stats.totalProducts}</h3>
                        <p>Total Products</p>
                    </div>

                    <div className="stat-card glass-card">
                        <div className="stat-icon">🛒</div>
                        <h3>{stats.totalOrders}</h3>
                        <p>Total Orders</p>
                    </div>

                    <div className="stat-card glass-card">
                        <div className="stat-icon">💰</div>
                        <h3 className="text-gradient">₹{stats.totalEarnings.toFixed(2)}</h3>
                        <p>Total Earnings</p>
                    </div>
                </div>

                <div className="quick-actions">
                    <h2>Quick Actions</h2>
                    <div className="action-buttons grid grid-2">
                        <Link to="/shopkeeper/products" className="action-card glass-card">
                            <div className="action-icon">📦</div>
                            <h3>Manage Products</h3>
                            <p>Add, edit, or remove products</p>
                        </Link>

                        <Link to="/shopkeeper/orders" className="action-card glass-card">
                            <div className="action-icon">📋</div>
                            <h3>View Orders</h3>
                            <p>Manage your shop orders</p>
                        </Link>
                    </div>
                </div>

                {stats.recentOrders.length > 0 && (
                    <div className="recent-orders">
                        <h2>Recent Orders</h2>
                        <div className="orders-table glass-card">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Items</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.recentOrders.map(order => (
                                        <tr key={order._id}>
                                            <td>#{order._id.slice(-8)}</td>
                                            <td>{order.customer?.name}</td>
                                            <td>{order.orderItems.length}</td>
                                            <td>
                                                <span className={`badge ${order.orderStatus === 'Delivered' ? 'badge-success' : 'badge-primary'}`}>
                                                    {order.orderStatus}
                                                </span>
                                            </td>
                                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShopkeeperDashboard;
