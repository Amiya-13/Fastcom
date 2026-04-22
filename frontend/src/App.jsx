import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
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
import ShopkeeperOrders from './pages/shopkeeper/ShopkeeperOrders';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

// Legal Pages
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

import './index.css';

// ──────────────────────────────────────────
//  Protected Route
// ──────────────────────────────────────────
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their own home
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'shopkeeper') return <Navigate to="/shopkeeper/dashboard" replace />;
    return <Navigate to="/customer/home" replace />;
  }

  return children;
};

// ──────────────────────────────────────────
//  Landing Page
// ──────────────────────────────────────────
const LandingPage = () => {
  const { user } = useAuth();

  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'shopkeeper') return <Navigate to="/shopkeeper/dashboard" replace />;
    return <Navigate to="/customer/home" replace />;
  }

  return (
    <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>

          {/* Logo */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '100px', height: '100px', borderRadius: '50%',
              background: 'var(--gradient-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '3rem', boxShadow: 'var(--shadow-glow)'
            }}>
              ⚡
            </div>
          </div>

          <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
            Welcome to <span className="text-gradient">FastCom</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            India's Multi-Vendor E-Commerce Platform
          </p>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '3rem' }}>
            3 user roles · JWT-secured checkout · ₹299/mo vendor subscriptions · 3% commission model
          </p>

          {/* Feature Cards */}
          <div className="grid grid-3" style={{ marginBottom: '3rem' }}>
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🛍️</div>
              <h3 style={{ fontSize: '1.25rem' }}>For Customers</h3>
              <p style={{ fontSize: '0.9rem' }}>Browse products from multiple local vendors, add to cart, and checkout securely with JWT authentication.</p>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🏪</div>
              <h3 style={{ fontSize: '1.25rem' }}>For Shopkeepers</h3>
              <p style={{ fontSize: '0.9rem' }}>Go online with just ₹299/month. Get a dedicated dashboard to manage products, track orders, and monitor earnings.</p>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>👑</div>
              <h3 style={{ fontSize: '1.25rem' }}>For Admins</h3>
              <p style={{ fontSize: '0.9rem' }}>Full platform visibility — revenue analytics, commission reports, user management, and subscription oversight.</p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-3" style={{ marginBottom: '3rem' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>25+</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>REST APIs</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h2 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>3</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>User Roles</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h2 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>₹299</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Vendor/Month</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/register" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
              Get Started Free
            </a>
            <a href="/login" className="btn btn-outline" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
              Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────
//  App
// ──────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Navbar />
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Customer */}
            <Route path="/customer/home" element={
              <ProtectedRoute allowedRoles={['customer']}><CustomerHome /></ProtectedRoute>
            } />
            <Route path="/customer/cart" element={
              <ProtectedRoute allowedRoles={['customer']}><Cart /></ProtectedRoute>
            } />
            <Route path="/customer/checkout" element={
              <ProtectedRoute allowedRoles={['customer']}><Checkout /></ProtectedRoute>
            } />
            <Route path="/customer/orders" element={
              <ProtectedRoute allowedRoles={['customer']}><OrderHistory /></ProtectedRoute>
            } />

            {/* Shopkeeper */}
            <Route path="/shopkeeper/dashboard" element={
              <ProtectedRoute allowedRoles={['shopkeeper']}><ShopkeeperDashboard /></ProtectedRoute>
            } />
            <Route path="/shopkeeper/products" element={
              <ProtectedRoute allowedRoles={['shopkeeper']}><ProductManagement /></ProtectedRoute>
            } />
            <Route path="/shopkeeper/orders" element={
              <ProtectedRoute allowedRoles={['shopkeeper']}><ShopkeeperOrders /></ProtectedRoute>
            } />

            {/* Admin */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
            } />

            {/* Legal */}
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Footer />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
