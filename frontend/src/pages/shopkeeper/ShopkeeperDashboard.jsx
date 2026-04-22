import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import api from '../../services/api';
import './ShopkeeperDashboard.css';

const ShopkeeperDashboard = () => {
    const { user, updateUser } = useAuth();
    const toast = useToast();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [renewing, setRenewing] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/shopkeeper/stats');
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
            toast.error('Failed to load dashboard stats');
        } finally {
            setLoading(false);
        }
    };

    const handleRenewSubscription = async () => {
        setRenewing(true);
        try {
            const { data } = await api.post('/auth/subscribe', { months: 1 });
            toast.success(`✅ Subscription renewed! Valid until ${new Date(data.subscriptionExpiry).toLocaleDateString()}`);
            updateUser({ isSubscribed: true, subscriptionExpiry: data.subscriptionExpiry });
            fetchStats();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to renew subscription');
        } finally {
            setRenewing(false);
        }
    };

    if (loading) {
        return (
            <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
                <div className="spinner"></div>
                <p style={{ marginTop: '1rem' }}>Loading your dashboard...</p>
            </div>
        );
    }

    const isActive = stats?.subscription?.isActive;
    const daysLeft = stats?.subscription?.daysLeft || 0;

    return (
        <div className="shopkeeper-dashboard">
            <div className="container">

                {/* Header */}
                <div className="dashboard-header">
                    <div>
                        <h1 className="text-gradient">Welcome, {user.name}!</h1>
                        <p className="shop-name">🏪 {user.shopName}</p>
                    </div>

                    <div className="subscription-badge glass-card">
                        {isActive ? (
                            <>
                                <span className="badge badge-success">✅ Active Subscription</span>
                                <p style={{ fontSize: '0.875rem', margin: '0.5rem 0 0', color: 'var(--text-secondary)' }}>
                                    {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining
                                </p>
                                {daysLeft <= 7 && (
                                    <button
                                        className="btn btn-primary"
                                        style={{ marginTop: '0.75rem', fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                                        onClick={handleRenewSubscription}
                                        disabled={renewing}
                                    >
                                        {renewing ? 'Renewing...' : 'Renew Now'}
                                    </button>
                                )}
                            </>
                        ) : (
                            <>
                                <span className="badge badge-danger">⚠️ Subscription Expired</span>
                                <p style={{ fontSize: '0.875rem', margin: '0.5rem 0', color: 'var(--error)' }}>
                                    ₹299/month to continue selling
                                </p>
                                <button
                                    className="btn btn-primary"
                                    style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}
                                    onClick={handleRenewSubscription}
                                    disabled={renewing}
                                >
                                    {renewing ? 'Processing...' : '🔁 Renew Subscription'}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid grid grid-4" style={{ marginBottom: '2rem' }}>
                    <div className="stat-card glass-card">
                        <div className="stat-icon">📦</div>
                        <h3>{stats?.products?.active ?? 0}</h3>
                        <p>Active Products</p>
                    </div>
                    <div className="stat-card glass-card">
                        <div className="stat-icon">🛒</div>
                        <h3>{stats?.orders?.total ?? 0}</h3>
                        <p>Total Orders</p>
                    </div>
                    <div className="stat-card glass-card">
                        <div className="stat-icon">⏳</div>
                        <h3>{stats?.orders?.pending ?? 0}</h3>
                        <p>Pending Orders</p>
                    </div>
                    <div className="stat-card glass-card">
                        <div className="stat-icon">💰</div>
                        <h3 className="text-gradient">₹{(stats?.earnings?.total || 0).toLocaleString('en-IN')}</h3>
                        <p>Total Earnings</p>
                    </div>
                </div>

                {/* Earnings Breakdown */}
                <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>💼 Revenue Breakdown</h3>
                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Gross Earnings</p>
                            <p style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: 0 }}>
                                ₹{((stats?.earnings?.total || 0) + (stats?.earnings?.commissionPaid || 0)).toLocaleString('en-IN')}
                            </p>
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Platform Commission (3%)</p>
                            <p style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: 0, color: 'var(--error)' }}>
                                - ₹{(stats?.earnings?.commissionPaid || 0).toLocaleString('en-IN')}
                            </p>
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Net Earnings</p>
                            <p className="text-gradient" style={{ fontWeight: '800', fontSize: '1.25rem', marginBottom: 0 }}>
                                ₹{(stats?.earnings?.total || 0).toLocaleString('en-IN')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions">
                    <h2>Quick Actions</h2>
                    <div className="action-buttons grid grid-3">
                        <Link to="/shopkeeper/products" className="action-card glass-card">
                            <div className="action-icon">📦</div>
                            <h3>Manage Products</h3>
                            <p>Add, edit, or remove your listings</p>
                        </Link>
                        <Link to="/shopkeeper/orders" className="action-card glass-card">
                            <div className="action-icon">📋</div>
                            <h3>View Orders</h3>
                            <p>Process and track customer orders</p>
                        </Link>
                        <div
                            className="action-card glass-card"
                            style={{ cursor: 'pointer' }}
                            onClick={handleRenewSubscription}
                        >
                            <div className="action-icon">💳</div>
                            <h3>Subscription</h3>
                            <p>₹299/month · {isActive ? `${daysLeft} days left` : 'Renew now'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShopkeeperDashboard;
