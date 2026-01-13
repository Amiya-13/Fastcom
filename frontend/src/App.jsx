import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Customer Pages
import CustomerHome from './pages/customer/CustomerHome';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import OrderHistory from './pages/customer/OrderHistory';

// Shopkeeper Pages
import ShopkeeperDashboard from './pages/shopkeeper/ShopkeeperDashboard';
import ProductManagement from './pages/shopkeeper/ProductManagement';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

// Legal Pages
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

import './index.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Landing Page
const LandingPage = () => {
  const { user } = useAuth();

  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'shopkeeper') return <Navigate to="/shopkeeper/dashboard" replace />;
    return <Navigate to="/customer/home" replace />;
  }

  return (
    <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <img src="/logo.jpg" alt="FastCom Logo" style={{ height: '120px', width: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent-purple)', boxShadow: 'var(--shadow-glow)' }} />
        </div>
        <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>
          Welcome to <span className="text-gradient">FastCom</span>
        </h1>
        <p style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', marginBottom: '3rem' }}>
          Connect with local vendors and shop locally, delivered fast
        </p>

        <div className="grid grid-3" style={{ marginBottom: '3rem' }}>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛍️</div>
            <h3>For Customers</h3>
            <p>Browse products from multiple local vendors in one place</p>
          </div>

          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏪</div>
            <h3>For Shopkeepers</h3>
            <p>Take your shop online with just ₹299/month</p>
          </div>

          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
            <h3>Fast & Local</h3>
            <p>Support local businesses and get faster delivery</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <a href="/register" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
            Get Started
          </a>
          <a href="/login" className="btn btn-outline" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
            Login
          </a>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Customer Routes */}
          <Route
            path="/customer/home"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/cart"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/checkout"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/orders"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <OrderHistory />
              </ProtectedRoute>
            }
          />

          {/* Shopkeeper Routes */}
          <Route
            path="/shopkeeper/dashboard"
            element={
              <ProtectedRoute allowedRoles={['shopkeeper']}>
                <ShopkeeperDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shopkeeper/products"
            element={
              <ProtectedRoute allowedRoles={['shopkeeper']}>
                <ProductManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shopkeeper/orders"
            element={
              <ProtectedRoute allowedRoles={['shopkeeper']}>
                <ShopkeeperDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Legal Pages */}
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
