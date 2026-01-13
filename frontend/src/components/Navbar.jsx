import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getDashboardLink = () => {
        if (!user) return '/';
        if (user.role === 'admin') return '/admin/dashboard';
        if (user.role === 'shopkeeper') return '/shopkeeper/dashboard';
        return '/customer/home';
    };

    return (
        <nav className="navbar">
            <div className="container flex-between">
                <Link to="/" className="navbar-brand">
                    ⚡ FastCom
                </Link>

                {isAuthenticated ? (
                    <div className="navbar-menu flex" style={{ alignItems: 'center', gap: '1.5rem' }}>
                        <Link to={getDashboardLink()} className="navbar-link">
                            Dashboard
                        </Link>

                        {user.role === 'customer' && (
                            <>
                                <Link to="/customer/cart" className="navbar-link">
                                    🛒 Cart
                                </Link>
                                <Link to="/customer/orders" className="navbar-link">
                                    Orders
                                </Link>
                            </>
                        )}

                        {user.role === 'shopkeeper' && (
                            <>
                                <Link to="/shopkeeper/products" className="navbar-link">
                                    My Products
                                </Link>
                                <Link to="/shopkeeper/orders" className="navbar-link">
                                    Orders
                                </Link>
                            </>
                        )}

                        {user.role === 'admin' && (
                            <>
                                <Link to="/admin/users" className="navbar-link">
                                    Users
                                </Link>
                                <Link to="/admin/reports" className="navbar-link">
                                    Reports
                                </Link>
                            </>
                        )}

                        <div className="user-info">
                            <span className="user-name">{user.name}</span>
                            <span className="user-role badge badge-primary">{user.role}</span>
                        </div>

                        <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
                            Logout
                        </button>
                    </div>
                ) : (
                    <div className="navbar-menu flex" style={{ gap: '1rem' }}>
                        <Link to="/login" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
                            Login
                        </Link>
                        <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                            Get Started
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
